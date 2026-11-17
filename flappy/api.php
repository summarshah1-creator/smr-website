<?php
/* Flappy Kabootar: leaderboard (today + all time) and "recommend a place" inbox.
   Data lives in the shared private SQLite (demo-lib/bootstrap.php). Owner reads it in SMR Admin → Flappy. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(false);
date_default_timezone_set('Europe/London');

function fk_db(): PDO {
    static $ok = false; $pdo = db();
    if (!$ok) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_scores (id INTEGER PRIMARY KEY, name TEXT NOT NULL, score INTEGER NOT NULL, day TEXT NOT NULL, at INTEGER NOT NULL, ip TEXT DEFAULT '')");
        $pdo->exec('CREATE INDEX IF NOT EXISTS fk_scores_day ON fk_scores(day, score)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS fk_scores_all ON fk_scores(score)');
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_recs (id INTEGER PRIMARY KEY, name TEXT NOT NULL, address TEXT DEFAULT '', note TEXT DEFAULT '', at INTEGER NOT NULL, ip TEXT DEFAULT '', done INTEGER DEFAULT 0)");
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_meta (k TEXT PRIMARY KEY, v TEXT)");
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_events (id INTEGER PRIMARY KEY, day TEXT NOT NULL, at INTEGER NOT NULL, vid TEXT DEFAULT '', ev TEXT NOT NULL, src TEXT DEFAULT '', dev TEXT DEFAULT '', app INTEGER DEFAULT 0, val INTEGER DEFAULT 0, extra TEXT DEFAULT '')");
        $pdo->exec('CREATE INDEX IF NOT EXISTS fk_events_day ON fk_events(day, ev)');
        // one-off leaderboard entries added by the owner (applied once, then never again)
        foreach ([['seed-summar-68', 'SUMMAR', 68]] as [$key, $name, $score]) {
            $st = $pdo->prepare('SELECT 1 FROM fk_meta WHERE k = ?'); $st->execute([$key]);
            if (!$st->fetchColumn()) { $pdo->prepare('INSERT INTO fk_scores (name, score, day, at, ip) VALUES (?, ?, ?, ?, ?)')->execute([$name, $score, date('Y-m-d'), time(), 'owner']); $pdo->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?)')->execute([$key, (string) time()]); }
        }
        $ok = true;
    }
    return $pdo;
}
function fk_today(): string { return date('Y-m-d'); }
function fk_board(): array {
    $p = fk_db();
    $t = $p->prepare('SELECT name, score FROM fk_scores WHERE day = ? ORDER BY score DESC, at ASC LIMIT 10'); $t->execute([fk_today()]);
    $a = $p->query('SELECT name, score FROM fk_scores ORDER BY score DESC, at ASC LIMIT 10');
    return ['today' => $t->fetchAll(), 'all' => $a->fetchAll(), 'day' => fk_today()];
}
function fk_clean(string $s, int $max): string {
    $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s);
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max);
}
/* Name check: same rules as namecheck.js. Word list namefilter.json (English + Hindi/Urdu/Punjabi swear words and slurs,
   with a list of real first names/surnames that only look rude because of a short word inside them). */
function fk_norm(string $s): string {
    if (class_exists('Normalizer')) $s = Normalizer::normalize($s, Normalizer::FORM_KD);
    $s = @iconv('UTF-8', 'ASCII//IGNORE', $s) ?: $s;
    $s = strtr(strtolower($s), ['0' => 'o', '1' => 'i', '2' => 'z', '3' => 'e', '4' => 'a', '5' => 's', '6' => 'g', '7' => 't', '8' => 'b', '9' => 'g', '@' => 'a', '$' => 's', '!' => 'i', '|' => 'i', '+' => 't']);
    return preg_replace('/[^a-z ]/', '', $s);
}
function fk_sq(string $s): string { return preg_replace('/(.)\1+/', '$1', $s); }
function fk_rude(string $name): bool {
    static $L = null;
    if ($L === null) { $j = json_decode((string) @file_get_contents(__DIR__ . '/namefilter.json'), true) ?: ['block' => [], 'must' => [], 'allow' => []]; $L = ['block' => $j['block'], 'must' => array_flip($j['must']), 'allow' => array_flip($j['allow'])]; }
    $toks = array_values(array_filter(explode(' ', fk_norm($name)), 'strlen'));
    $parts = $toks; if (count(array_filter($toks, fn($t) => strlen($t) === 1)) >= 2) $parts[] = implode('', $toks);
    foreach ($parts as $tok) {
        if (isset($L['allow'][$tok]) && !isset($L['must'][$tok])) continue;
        $t = fk_sq($tok);
        foreach ($L['block'] as $w) {
            $s0 = fk_sq($w); $s = strlen($s0) >= 4 ? $s0 : $w;
            if (strlen($s) <= 3) { if ($tok === $w || ($s === $s0 && $t === $s)) return true; }
            elseif (strlen($s) === 4) { if ($tok === $w || str_starts_with($t, $s) || str_ends_with($t, $s)) return true; }
            elseif (strpos($t, $s) !== false || strpos($tok, $w) !== false) return true;
        }
    }
    return false;
}
function fk_ip(): string { return substr(hash('sha256', client_ip() . '|fk'), 0, 16); }


/* ---- settings the owner can change in SMR Admin → Flappy → Settings ---- */
const FK_DEFAULTS = ['notice' => '', 'show_leaderboard' => true, 'show_recommend' => true, 'difficulty' => 'normal'];
function fk_settings(): array {
    $st = fk_db()->prepare('SELECT v FROM fk_meta WHERE k = ?'); $st->execute(['settings']);
    $v = json_decode((string) $st->fetchColumn(), true);
    return array_merge(FK_DEFAULTS, is_array($v) ? array_intersect_key($v, FK_DEFAULTS) : []);
}
/* ---- analytics: small first-party events, no outside services ---- */
const FK_EVENTS = ['visit', 'play', 'over', 'share', 'card', 'card_save', 'hs_open', 'install', 'lb_open', 'name', 'rec', 'smr', 'sound_on'];
function fk_stats(int $days): array {
    $p = fk_db(); $from = $days > 0 ? date('Y-m-d', strtotime('-' . ($days - 1) . ' days')) : '0000-00-00';
    $q = function (string $sql, array $a = []) use ($p) { $st = $p->prepare($sql); $st->execute($a); return $st; };
    $tot = []; foreach ($q('SELECT ev, COUNT(*) n, COUNT(DISTINCT vid) u FROM fk_events WHERE day >= ? GROUP BY ev', [$from])->fetchAll() as $r) $tot[$r['ev']] = ['n' => (int) $r['n'], 'u' => (int) $r['u']];
    $visitors = (int) $q("SELECT COUNT(DISTINCT vid) FROM fk_events WHERE day >= ?", [$from])->fetchColumn();
    $sc = $q("SELECT COUNT(*) n, AVG(val) a, MAX(val) m FROM fk_events WHERE ev = 'over' AND day >= ?", [$from])->fetch();
    $src = $q("SELECT src, COUNT(DISTINCT vid) u, COUNT(*) n FROM fk_events WHERE ev = 'visit' AND day >= ? GROUP BY src ORDER BY u DESC", [$from])->fetchAll();
    $dev = $q("SELECT dev, COUNT(DISTINCT vid) u FROM fk_events WHERE ev = 'visit' AND day >= ? GROUP BY dev ORDER BY u DESC", [$from])->fetchAll();
    $appv = (int) $q("SELECT COUNT(DISTINCT vid) FROM fk_events WHERE ev = 'visit' AND app = 1 AND day >= ?", [$from])->fetchColumn();
    $back = (int) $q("SELECT COUNT(*) FROM (SELECT vid FROM fk_events WHERE ev = 'visit' AND day >= ? GROUP BY vid HAVING COUNT(DISTINCT day) > 1)", [$from])->fetchColumn();
    $places = $q("SELECT extra place, COUNT(*) n FROM fk_events WHERE ev = 'over' AND extra != '' AND day >= ? GROUP BY extra ORDER BY n DESC LIMIT 10", [$from])->fetchAll();
    $daily = $q("SELECT day, COUNT(DISTINCT vid) v, SUM(ev = 'play') g FROM fk_events WHERE day >= ? GROUP BY day ORDER BY day", [date('Y-m-d', strtotime('-29 days'))])->fetchAll();
    return ['days' => $days, 'visitors' => $visitors, 'returning' => $back, 'app_users' => $appv, 'events' => $tot, 'games' => (int) $sc['n'], 'avg' => round((float) $sc['a'], 1), 'best' => (int) $sc['m'], 'sources' => $src, 'devices' => $dev, 'places' => $places, 'daily' => $daily];
}

$a = $_GET['a'] ?? $_POST['a'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !same_origin()) json_out(['error' => 'Bad origin'], 403);
$in = $_SERVER['REQUEST_METHOD'] === 'POST' ? (json_decode((string) file_get_contents('php://input'), true) ?: $_POST) : [];

try {
    if ($a === 'board') json_out(fk_board());
    if ($a === 'cfg') { header('Cache-Control: no-store'); json_out(fk_settings()); }

    if ($a === 'ev' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $ev = (string) ($in['ev'] ?? '');
        if (!in_array($ev, FK_EVENTS, true)) json_out(['ok' => false], 400);
        $k = 'fk_ev:' . fk_ip(); if (too_many($k, 400, 3600)) json_out(['ok' => false], 429); note_fail($k);
        $vid = preg_replace('/[^a-z0-9]/i', '', substr((string) ($in['vid'] ?? ''), 0, 20));
        $src = preg_replace('/[^a-z0-9_-]/i', '', substr((string) ($in['src'] ?? ''), 0, 24));
        $dev = preg_replace('/[^a-z]/i', '', substr((string) ($in['dev'] ?? ''), 0, 12));
        fk_db()->prepare('INSERT INTO fk_events (day, at, vid, ev, src, dev, app, val, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([fk_today(), now(), $vid, $ev, $src, $dev, empty($in['app']) ? 0 : 1, max(0, min(9999, (int) ($in['val'] ?? 0))), fk_clean((string) ($in['extra'] ?? ''), 60)]);
        if (random_int(1, 200) === 1) fk_db()->prepare('DELETE FROM fk_events WHERE at < ?')->execute([now() - 400 * 86400]);
        json_out(['ok' => true]);
    }

    if ($a === 'score' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = fk_clean((string) ($in['name'] ?? ''), 14); $score = (int) ($in['score'] ?? 0);
        if ($name === '' || !preg_match("/^[\\p{L}\\p{N} ._'-]+$/u", $name)) json_out(['error' => 'Use letters and numbers only.'], 400);
        if (fk_rude($name)) json_out(['error' => "That name isn't allowed. Please use your real name or a nickname.", 'rude' => true], 400);
        if ($score < 1 || $score > 999) json_out(['error' => 'Score not accepted.'], 400);
        $k = 'fk_score:' . fk_ip();
        if (too_many($k, 15, 3600)) json_out(['error' => 'Too many scores this hour. Try again later.'], 429);
        note_fail($k);
        fk_db()->prepare('INSERT INTO fk_scores (name, score, day, at, ip) VALUES (?, ?, ?, ?, ?)')->execute([$name, $score, fk_today(), now(), fk_ip()]);
        json_out(['ok' => true] + fk_board());
    }

    if ($a === 'rec' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = fk_clean((string) ($in['name'] ?? ''), 80); $addr = fk_clean((string) ($in['address'] ?? ''), 160); $note = fk_clean((string) ($in['note'] ?? ''), 500);
        if ($name === '') json_out(['error' => 'Please add the place name.'], 400);
        $k = 'fk_rec:' . fk_ip();
        if (too_many($k, 6, 3600)) json_out(['error' => 'Thanks! You have sent a few already, try again later.'], 429);
        note_fail($k);
        fk_db()->prepare('INSERT INTO fk_recs (name, address, note, at, ip) VALUES (?, ?, ?, ?, ?)')->execute([$name, $addr, $note, now(), fk_ip()]);
        json_out_then(['ok' => true], function () use ($name, $addr) {
            if (is_file(dirname(__DIR__) . '/demo-lib/push.php')) { require_once dirname(__DIR__) . '/demo-lib/push.php'; if (function_exists('push_all')) push_all('Flappy Kabootar: new place', $name . ($addr ? ' · ' . $addr : ''), '/demo-admin/#flappy', 'fk-rec'); }
        });
    }

    /* ---- owner only ---- */
    if (in_array($a, ['admin', 'rec_done', 'rec_del', 'score_del', 'stats', 'settings_save'], true)) {
        if (!admin_token()) json_out(['error' => 'Log in to SMR Admin first.'], 401);
        $p = fk_db();
        if ($a === 'admin') {
            $recs = $p->query('SELECT id, name, address, note, at, done FROM fk_recs ORDER BY done ASC, at DESC LIMIT 300')->fetchAll();
            $t = $p->prepare('SELECT id, name, score, at FROM fk_scores WHERE day = ? ORDER BY score DESC, at ASC LIMIT 20'); $t->execute([fk_today()]);
            $all = $p->query('SELECT id, name, score, at, day FROM fk_scores ORDER BY score DESC, at ASC LIMIT 20')->fetchAll();
            $n = (int) $p->query('SELECT COUNT(*) FROM fk_recs WHERE done = 0')->fetchColumn();
            $plays = (int) $p->query('SELECT COUNT(*) FROM fk_scores')->fetchColumn();
            json_out(['recs' => $recs, 'today' => $t->fetchAll(), 'all' => $all, 'new' => $n, 'entries' => $plays]);
        }
        if ($a === 'stats') json_out(fk_stats(max(0, min(400, (int) ($_GET['days'] ?? 7)))) + ['settings' => fk_settings()]);
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'POST only'], 405);
        if ($a === 'settings_save') {
            $cur = fk_settings(); $new = [
                'notice' => fk_clean((string) ($in['notice'] ?? $cur['notice']), 90),
                'show_leaderboard' => !empty($in['show_leaderboard']), 'show_recommend' => !empty($in['show_recommend']),
                'difficulty' => in_array($in['difficulty'] ?? '', ['easy', 'normal', 'hard'], true) ? $in['difficulty'] : 'normal'];
            $p->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['settings', json_encode($new)]);
            json_out(['ok' => true, 'settings' => $new]);
        }
        $id = (int) ($in['id'] ?? 0);
        if ($a === 'rec_done') { $p->prepare('UPDATE fk_recs SET done = ? WHERE id = ?')->execute([empty($in['undo']) ? 1 : 0, $id]); json_out(['ok' => true]); }
        if ($a === 'rec_del') { $p->prepare('DELETE FROM fk_recs WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
        if ($a === 'score_del') { $p->prepare('DELETE FROM fk_scores WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
    }
    json_out(['error' => 'Unknown action'], 400);
} catch (Throwable $e) {
    json_out(['error' => 'Something went wrong. Try again.'], 500);
}
