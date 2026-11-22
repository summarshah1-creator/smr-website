<?php
/* Jummah Dash: play stats and the "Recommend a place" inbox (same idea as flappy/api.php).
   Lives outside demo/ so the game's own deploy (which rebuilds jummahdash/demo/) never touches it.
   Data in the shared private SQLite (demo-lib/bootstrap.php); the owner reads it in SMR Admin → Games → Jummah Dash. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
require dirname(__DIR__) . '/demo-lib/gamestats.php';
security_headers(false);
date_default_timezone_set('Europe/London');

function jd_db(): PDO {
    static $ok = false; $p = db();
    if (!$ok) {
        $p->exec("CREATE TABLE IF NOT EXISTS jd_events (id INTEGER PRIMARY KEY, day TEXT NOT NULL, at INTEGER NOT NULL, vid TEXT DEFAULT '', ev TEXT NOT NULL, src TEXT DEFAULT '', dev TEXT DEFAULT '', app INTEGER DEFAULT 0, val INTEGER DEFAULT 0, extra TEXT DEFAULT '')");
        $p->exec('CREATE INDEX IF NOT EXISTS jd_events_day ON jd_events(day, ev)');
        $p->exec("CREATE TABLE IF NOT EXISTS jd_recs (id INTEGER PRIMARY KEY, name TEXT NOT NULL, address TEXT DEFAULT '', note TEXT DEFAULT '', at INTEGER NOT NULL, ip TEXT DEFAULT '', done INTEGER DEFAULT 0)");
        $p->exec("CREATE TABLE IF NOT EXISTS jd_meta (k TEXT PRIMARY KEY, v TEXT)");
        gs_init($p, 'jd');
        $ok = true;
    }
    return $p;
}
function jd_today(): string { return date('Y-m-d'); }
function jd_ip(): string { return substr(hash('sha256', client_ip() . '|jd'), 0, 16); }
function jd_clean(string $s, int $max): string { $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s); return mb_substr(trim(preg_replace('/\s+/u', ' ', $s)), 0, $max); }
const JD_DEFAULTS = ['show_recommend' => true];
function jd_settings(): array {
    $st = jd_db()->prepare('SELECT v FROM jd_meta WHERE k = ?'); $st->execute(['settings']); $v = json_decode((string) $st->fetchColumn(), true);
    return array_merge(JD_DEFAULTS, is_array($v) ? array_intersect_key($v, JD_DEFAULTS) : []);
}
/* visit, play, over (val = metres, extra = coins), share, install, hs_open (Get the app), smr (opened the SMR website), rec, shop, mission */
const JD_EVENTS = ['visit', 'play', 'over', 'share', 'install', 'hs_open', 'smr', 'rec', 'shop', 'outfit', 'sound_on'];
function jd_stats(int $days): array {
    $p = jd_db(); $from = $days > 0 ? date('Y-m-d', strtotime('-' . ($days - 1) . ' days')) : '0000-00-00';
    $q = function (string $sql, array $a = []) use ($p) { $st = $p->prepare($sql); $st->execute($a); return $st; };
    $tot = []; foreach ($q('SELECT ev, COUNT(*) n, COUNT(DISTINCT vid) u FROM jd_ev WHERE day >= ? GROUP BY ev', [$from])->fetchAll() as $r) $tot[$r['ev']] = ['n' => (int) $r['n'], 'u' => (int) $r['u']];
    $sc = $q("SELECT COUNT(*) n, AVG(val) a, MAX(val) m, SUM(CAST(extra AS INTEGER)) c FROM jd_ev WHERE ev = 'over' AND day >= ?", [$from])->fetch();
    $opens = (int) $q("SELECT COUNT(*) FROM jd_ev WHERE ev = 'visit' AND day >= ?", [$from])->fetchColumn();
    $uniq = (int) $q("SELECT COUNT(DISTINCT vid) FROM jd_ev WHERE ev = 'visit' AND day >= ?", [$from])->fetchColumn();
    $new = (int) $q("SELECT COUNT(*) FROM (SELECT vid, MIN(day) f FROM jd_ev WHERE ev = 'visit' GROUP BY vid) WHERE f >= ? AND vid IN (SELECT vid FROM jd_ev WHERE ev = 'visit' AND day >= ?)", [$from, $from])->fetchColumn();
    $back = (int) $q("SELECT COUNT(*) FROM (SELECT vid FROM jd_ev WHERE ev = 'visit' GROUP BY vid HAVING COUNT(DISTINCT day) > 1) WHERE vid IN (SELECT vid FROM jd_ev WHERE ev = 'visit' AND day >= ?)", [$from])->fetchColumn();
    $appv = (int) $q("SELECT COUNT(DISTINCT vid) FROM jd_ev WHERE ev = 'visit' AND app = 1 AND day >= ?", [$from])->fetchColumn();
    $src = $q("SELECT src, COUNT(DISTINCT vid) u, COUNT(*) n FROM jd_ev WHERE ev = 'visit' AND day >= ? GROUP BY src ORDER BY u DESC", [$from])->fetchAll();
    $dev = $q("SELECT dev, COUNT(DISTINCT vid) u FROM jd_ev WHERE ev = 'visit' AND day >= ? GROUP BY dev ORDER BY u DESC", [$from])->fetchAll();
    $daily = $q("SELECT day, COUNT(DISTINCT vid) v, SUM(ev = 'play') g FROM jd_ev WHERE day >= ? GROUP BY day ORDER BY day", [date('Y-m-d', strtotime('-29 days'))])->fetchAll();
    $top = $q("SELECT at, dev, val, extra, app FROM jd_ev WHERE ev = 'over' AND val > 0 AND day >= ? ORDER BY val DESC LIMIT 10", [$from])->fetchAll(PDO::FETCH_ASSOC);
    return ['days' => $days, 'opens' => $opens, 'unique' => $uniq, 'new' => $new, 'returning' => $back, 'app_users' => $appv, 'events' => $tot,
        'games' => (int) $sc['n'], 'avg' => (int) round((float) $sc['a']), 'best' => (int) $sc['m'], 'coins' => (int) $sc['c'], 'sources' => $src, 'devices' => $dev, 'daily' => $daily, 'top' => $top];
}

$a = $_GET['a'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !same_origin()) json_out(['error' => 'Bad origin'], 403);
$in = $_SERVER['REQUEST_METHOD'] === 'POST' ? (json_decode((string) file_get_contents('php://input'), true) ?: $_POST) : [];

try {
    if ($a === 'cfg') { header('Cache-Control: no-store'); json_out(jd_settings()); }

    if ($a === 'ev' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $ev = (string) ($in['ev'] ?? '');
        if (!in_array($ev, JD_EVENTS, true)) json_out(['ok' => false], 400);
        $k = 'jd_ev:' . jd_ip(); if (too_many($k, 400, 3600)) json_out(['ok' => false], 429); note_fail($k);
        $vid = preg_replace('/[^a-z0-9]/i', '', substr((string) ($in['vid'] ?? ''), 0, 20));
        $src = preg_replace('/[^a-z0-9_-]/i', '', substr((string) ($in['src'] ?? ''), 0, 24));
        $dev = preg_replace('/[^a-z]/i', '', substr((string) ($in['dev'] ?? ''), 0, 12));
        $p = jd_db();
        if ($vid !== '' && admin_token()) gs_mark_owner($p, 'jd', $vid, 'admin-cookie');   // played on a phone logged in to SMR Admin = the owner's
        $p->prepare('INSERT INTO jd_events (day, at, vid, ev, src, dev, app, val, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          ->execute([jd_today(), now(), $vid, $ev, $src, $dev, empty($in['app']) ? 0 : 1, max(0, min(999999, (int) ($in['val'] ?? 0))), jd_clean((string) ($in['extra'] ?? ''), 60)]);
        if (random_int(1, 200) === 1) $p->prepare('DELETE FROM jd_events WHERE at < ?')->execute([now() - 400 * 86400]);
        json_out(['ok' => true]);
    }

    if ($a === 'rec' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = jd_clean((string) ($in['name'] ?? ''), 80); $addr = jd_clean((string) ($in['address'] ?? ''), 160); $note = jd_clean((string) ($in['note'] ?? ''), 500);
        if ($name === '') json_out(['error' => 'Please add the place name.'], 400);
        $k = 'jd_rec:' . jd_ip(); if (too_many($k, 6, 3600)) json_out(['error' => 'Thanks! You have sent a few already, try again later.'], 429); note_fail($k);
        jd_db()->prepare('INSERT INTO jd_recs (name, address, note, at, ip) VALUES (?, ?, ?, ?, ?)')->execute([$name, $addr, $note, now(), jd_ip()]);
        json_out_then(['ok' => true], function () use ($name, $addr) {
            if (is_file(dirname(__DIR__) . '/demo-lib/push.php')) { require_once dirname(__DIR__) . '/demo-lib/push.php'; if (function_exists('push_all')) push_all('Jummah Dash: new place', $name . ($addr ? ' · ' . $addr : ''), '/demo-admin/#jummah', 'jd-rec'); }
        });
    }

    /* ---- owner only ---- */
    if (in_array($a, ['admin', 'since', 'stats', 'devices', 'owner', 'rec_done', 'rec_del', 'settings_save'], true)) {
        if (!admin_token()) json_out(['error' => 'Log in to SMR Admin first.'], 401);
        $p = jd_db();
        if ($a === 'admin') {
            $recs = $p->query('SELECT id, name, address, note, at, done FROM jd_recs ORDER BY done ASC, at DESC LIMIT 300')->fetchAll(PDO::FETCH_ASSOC);
            json_out(['recs' => $recs, 'new' => (int) $p->query('SELECT COUNT(*) FROM jd_recs WHERE done = 0')->fetchColumn()]);
        }
        if ($a === 'since') json_out(gs_since($p, 'jd', max(0, (int) ($_GET['t'] ?? 0)), 'jd_recs'));
        if ($a === 'stats') json_out(jd_stats(max(0, min(400, (int) ($_GET['days'] ?? 7)))) + ['settings' => jd_settings()]);
        if ($a === 'devices') json_out(['devices' => gs_devices($p, 'jd')]);
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'POST only'], 405);
        if ($a === 'owner') { gs_set_owner($p, 'jd', (string) ($in['vid'] ?? ''), !empty($in['on'])); json_out(['ok' => true, 'devices' => gs_devices($p, 'jd')]); }
        if ($a === 'settings_save') { $new = ['show_recommend' => !empty($in['show_recommend'])];
            $p->prepare('INSERT INTO jd_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['settings', json_encode($new)]); json_out(['ok' => true, 'settings' => $new]); }
        $id = (int) ($in['id'] ?? 0);
        if ($a === 'rec_done') { $p->prepare('UPDATE jd_recs SET done = ? WHERE id = ?')->execute([empty($in['undo']) ? 1 : 0, $id]); json_out(['ok' => true]); }
        if ($a === 'rec_del') { $p->prepare('DELETE FROM jd_recs WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
    }
    json_out(['error' => 'Unknown action'], 404);
} catch (Throwable $e) {
    error_log('jd api: ' . $e->getMessage());
    json_out(['error' => 'Something went wrong.'], 500);
}
