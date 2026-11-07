<?php
/* Visitor API: redeem a PIN, read the session clock. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(false);

$a = $_GET['a'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($a === 'state') {
    if (isset($_GET['preview']) && admin_token()) json_out(['state' => 'preview', 'now' => now()]);
    $vs = visitor_session();
    if (!$vs) json_out(['state' => 'none', 'now' => now()]);
    [$l, $s] = $vs;
    $st = session_state($l, $s);
    $exp = session_expiry($l, $s);
    $out = ['state' => $st, 'now' => now(), 'expires_at' => $st === 'ok' ? $exp : 0];
    // Tell the owner when time is nearly up, and when it has ended (once per expiry time).
    $shared = $l['mode'] === 'shared';
    $flag = null;
    if ($st === 'ok' && $exp - now() <= 300) $flag = ['warned_exp', 'low', 'has 5 minutes left on their demo. Tap to extend.'];
    if ($st === 'expired') $flag = ['ended_exp', 'ended', "'s demo time has run out."];
    if ($flag) {
        $q = $shared ? db()->prepare("UPDATE links SET {$flag[0]} = ? WHERE id = ? AND {$flag[0]} != ?")
                     : db()->prepare("UPDATE sessions SET {$flag[0]} = ? WHERE id = ? AND {$flag[0]} != ?");
        $q->execute([$exp, $shared ? $l['id'] : $s['id'], $exp]);
        if ($q->rowCount() > 0) {
            require_once dirname(__DIR__) . '/demo-lib/push.php';
            json_out_then($out, function () use ($l, $flag) { link_event($l, $flag[1], $flag[2]); });
        }
    }
    json_out($out);
}

if ($a === 'redeem' && $method === 'POST') {
    // Same-origin JSON only.
    if (!same_origin()) json_out(['error' => 'Bad request'], 400);
    $in = json_decode((string) file_get_contents('php://input'), true) ?: [];
    $token = (string) ($in['token'] ?? '');
    $pin = preg_replace('/\D/', '', (string) ($in['pin'] ?? ''));
    $link = link_by_token($token);
    if (!$link) json_out(['error' => 'This demo link is not valid.'], 404);

    $ipKey = 'pin:' . hash('sha256', client_ip());
    $linkKey = 'link:' . $link['id'];
    if (too_many($ipKey, 8, 900) || too_many($linkKey, 25, 3600)) {
        json_out(['error' => 'Too many wrong PINs. Please wait 15 minutes and try again.'], 429);
    }
    if ((int) $link['revoked']) json_out(['error' => 'expired'], 410);
    if (strlen($pin) !== strlen((string) $link['pin']) || !hash_equals((string) $link['pin'], $pin)) {
        note_fail($ipKey); note_fail($linkKey);
        json_out(['error' => 'That PIN is not right. Please check it and try again.'], 403);
    }

    $pdo = db();
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $st = $pdo->prepare('SELECT * FROM links WHERE id = ?');
        $st->execute([$link['id']]);
        $l = $st->fetch();
        $now = now();

        // Already inside this demo in this browser: carry on with the same clock.
        $vs = visitor_session();
        if ($vs && (int) $vs[0]['id'] === (int) $l['id']) {
            $pdo->exec('COMMIT');
            json_out(['ok' => true, 'state' => session_state($vs[0], $vs[1])]);
        }

        $dur = max(1, (int) $l['duration']) * 60;
        if ($l['mode'] === 'shared') {
            if (!$l['activated_at']) {
                $pdo->prepare('UPDATE links SET activated_at = ?, expires_at = ?, uses = uses + 1 WHERE id = ?')->execute([$now, $now + $dur, $l['id']]);
                $exp = $now + $dur;
            } else {
                $exp = (int) $l['expires_at'];
                if ($exp <= $now) { $pdo->exec('COMMIT'); json_out(['error' => 'expired'], 410); }
                $pdo->prepare('UPDATE links SET uses = uses + 1 WHERE id = ?')->execute([$l['id']]);
            }
        } else {
            $max = $l['mode'] === 'single' ? 1 : max(1, (int) $l['max_uses']);
            if ((int) $l['uses'] >= $max) { $pdo->exec('COMMIT'); json_out(['error' => 'used'], 410); }
            $exp = $now + $dur;
            $pdo->prepare('UPDATE links SET uses = uses + 1, activated_at = COALESCE(activated_at, ?) WHERE id = ?')->execute([$now, $l['id']]);
        }
        $raw = rand_token(32);
        $pdo->prepare('INSERT INTO sessions (id, link_id, created_at, expires_at, last_seen, ua) VALUES (?,?,?,?,?,?)')
            ->execute([hash('sha256', $raw), $l['id'], $now, $exp, $now, substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200)]);
        $pdo->exec('COMMIT');
        set_cookie(VISITOR_COOKIE, $raw, $now + 30 * 86400, '/', 'Lax');
        $n = (int) $l['uses'] + 1;
        $mins = (int) round(($exp - $now) / 60);
        require_once dirname(__DIR__) . '/demo-lib/push.php';
        json_out_then(['ok' => true, 'state' => 'ok'], function () use ($l, $n, $mins) {
            link_event($l, 'opened', 'opened the demo' . ($n > 1 ? ' (open no. ' . $n . ')' : '') . ' · ' . $mins . ' min left');
        });
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->exec('ROLLBACK');
        json_out(['error' => 'Something went wrong. Please try again.'], 500);
    }
}

json_out(['error' => 'Not found'], 404);
