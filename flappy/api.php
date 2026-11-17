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
function fk_rude(string $s): bool {
    $w = strtolower(preg_replace('/[^a-z]/i', '', strtr($s, '013457@$', 'oleastas')));
    foreach (['fuck', 'shit', 'cunt', 'bitch', 'nigg', 'paki', 'wank', 'twat', 'dick', 'cock', 'pussy', 'slut', 'whore', 'bastard', 'retard', 'faggot', 'rape', 'nazi'] as $b) if (strpos($w, $b) !== false) return true;
    return false;
}
function fk_ip(): string { return substr(hash('sha256', client_ip() . '|fk'), 0, 16); }

$a = $_GET['a'] ?? $_POST['a'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !same_origin()) json_out(['error' => 'Bad origin'], 403);
$in = $_SERVER['REQUEST_METHOD'] === 'POST' ? (json_decode((string) file_get_contents('php://input'), true) ?: $_POST) : [];

try {
    if ($a === 'board') json_out(fk_board());

    if ($a === 'score' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = fk_clean((string) ($in['name'] ?? ''), 14); $score = (int) ($in['score'] ?? 0);
        if ($name === '' || !preg_match("/^[\\p{L}\\p{N} ._'-]+$/u", $name)) json_out(['error' => 'Use letters and numbers only.'], 400);
        if (fk_rude($name)) json_out(['error' => 'Please pick a different name.'], 400);
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
    if (in_array($a, ['admin', 'rec_done', 'rec_del', 'score_del'], true)) {
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
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'POST only'], 405);
        $id = (int) ($in['id'] ?? 0);
        if ($a === 'rec_done') { $p->prepare('UPDATE fk_recs SET done = ? WHERE id = ?')->execute([empty($in['undo']) ? 1 : 0, $id]); json_out(['ok' => true]); }
        if ($a === 'rec_del') { $p->prepare('DELETE FROM fk_recs WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
        if ($a === 'score_del') { $p->prepare('DELETE FROM fk_scores WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
    }
    json_out(['error' => 'Unknown action'], 400);
} catch (Throwable $e) {
    json_out(['error' => 'Something went wrong. Try again.'], 500);
}
