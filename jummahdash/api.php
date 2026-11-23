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
        // leaderboard (owner 23 Nov): best per player per week (wk = ISO week) and all time (wk = 'all')
        $p->exec("CREATE TABLE IF NOT EXISTS jd_scores (pid TEXT NOT NULL, wk TEXT NOT NULL, name TEXT NOT NULL, score INTEGER NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (pid, wk))");
        $p->exec('CREATE INDEX IF NOT EXISTS jd_scores_wk ON jd_scores(wk, score)');
        $p->exec("CREATE TABLE IF NOT EXISTS jd_runs (id TEXT PRIMARY KEY, at INTEGER NOT NULL, used INTEGER DEFAULT 0)");
        $ok = true;
    }
    return $p;
}
function jd_today(): string { return date('Y-m-d'); }
function jd_ip(): string { return substr(hash('sha256', client_ip() . '|jd'), 0, 16); }
function jd_clean(string $s, int $max): string { $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s); return mb_substr(trim(preg_replace('/\s+/u', ' ', $s)), 0, $max); }
const JD_ADMIN_CODE = '1279';   // in-game admin mode code (owner, 23 Nov)
const JD_DEFAULTS = ['show_recommend' => true, 'lakri' => false];   // lakri: Lakri Man in the ride boxes (owner 23 Nov: off for now)
function jd_settings(): array {
    $st = jd_db()->prepare('SELECT v FROM jd_meta WHERE k = ?'); $st->execute(['settings']); $v = json_decode((string) $st->fetchColumn(), true);
    return array_merge(JD_DEFAULTS, is_array($v) ? array_intersect_key($v, JD_DEFAULTS) : []);
}
/* visit, play, over (val = metres, extra = coins), share, install, hs_open (Get the app), smr (opened the SMR website), rec, shop, mission */
/* audit 23 Nov: die (val = metres, extra = what got him: rocket / zap / laser), ride (val = seconds it lasted, extra = ride), btn (val = presses that run, extra = dash / warp / shield / horn / bat), daily (val = letters, extra = 'done' when the daily word was finished) */
const JD_EVENTS = ['visit', 'play', 'over', 'share', 'install', 'hs_open', 'smr', 'rec', 'shop', 'outfit', 'sound_on', 'die', 'ride', 'btn', 'daily'];
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
    // audit 23 Nov: why runs end, rides, buttons, how far first-timers get, and who comes back the next day
    $deaths = $q("SELECT extra k, COUNT(*) n, AVG(val) a FROM jd_ev WHERE ev = 'die' AND day >= ? GROUP BY extra ORDER BY n DESC", [$from])->fetchAll(PDO::FETCH_ASSOC);
    $rides = $q("SELECT extra k, COUNT(*) n, AVG(val) a FROM jd_ev WHERE ev = 'ride' AND day >= ? GROUP BY extra ORDER BY n DESC", [$from])->fetchAll(PDO::FETCH_ASSOC);
    $btns = $q("SELECT extra k, COUNT(DISTINCT vid) u, SUM(val) n FROM jd_ev WHERE ev = 'btn' AND day >= ? GROUP BY extra ORDER BY u DESC", [$from])->fetchAll(PDO::FETCH_ASSOC);
    $first = $q("SELECT val FROM jd_ev e WHERE ev = 'over' AND day >= ? AND at = (SELECT MIN(at) FROM jd_ev x WHERE x.vid = e.vid AND x.ev = 'over') AND vid NOT IN (SELECT vid FROM jd_ev WHERE ev = 'over' AND day < ?)", [$from, $from])->fetchAll(PDO::FETCH_COLUMN);
    $fb = [0, 0, 0, 0]; foreach ($first as $v) $fb[$v < 200 ? 0 : ($v < 500 ? 1 : ($v < 1000 ? 2 : 3))]++;
    $nd = $q("SELECT COUNT(*) n, SUM(EXISTS (SELECT 1 FROM jd_ev y WHERE y.vid = f.vid AND y.ev = 'visit' AND y.day = date(f.d, '+1 day'))) b FROM (SELECT vid, MIN(day) d FROM jd_ev WHERE ev = 'visit' GROUP BY vid) f WHERE f.d >= ? AND f.d < ?", [$from, jd_today()])->fetch();
    $daily_done = (int) $q("SELECT COUNT(*) FROM jd_ev WHERE ev = 'daily' AND extra = 'done' AND day >= ?", [$from])->fetchColumn();
    return ['deaths' => $deaths, 'rides' => $rides, 'buttons' => $btns, 'first_runs' => ['n' => count($first), 'avg' => $first ? (int) round(array_sum($first) / count($first)) : 0, 'buckets' => $fb],
        'next_day' => ['n' => (int) $nd['n'], 'back' => (int) $nd['b']], 'daily_done' => $daily_done,
        'days' => $days, 'opens' => $opens, 'unique' => $uniq, 'new' => $new, 'returning' => $back, 'app_users' => $appv, 'events' => $tot,
        'games' => (int) $sc['n'], 'avg' => (int) round((float) $sc['a']), 'best' => (int) $sc['m'], 'coins' => (int) $sc['c'], 'sources' => $src, 'devices' => $dev, 'daily' => $daily, 'top' => $top];
}

/* ---- leaderboard (owner 23 Nov) ---- */
function jd_norm(string $s): string { $s = mb_strtolower($s); $s = strtr($s, ['0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '7' => 't', '8' => 'b', '@' => 'a', '$' => 's', '!' => 'i']); return trim(preg_replace('/[^a-z ]+/', ' ', $s)); }
function jd_sq(string $s): string { return preg_replace('/(.)\1+/', '$1', $s); }
function jd_rude(string $name): bool {   // same word list and rules as Flappy Kabootar's name check (flappy/namefilter.json)
    static $L = null;
    if ($L === null) { $j = json_decode((string) @file_get_contents(dirname(__DIR__) . '/flappy/namefilter.json'), true) ?: ['block' => [], 'must' => [], 'allow' => []]; $L = ['block' => $j['block'], 'must' => array_flip($j['must']), 'allow' => array_flip($j['allow'])]; }
    $toks = array_values(array_filter(explode(' ', jd_norm($name)), 'strlen'));
    $parts = $toks; if (count(array_filter($toks, fn($t) => strlen($t) === 1)) >= 2) $parts[] = implode('', $toks);
    foreach ($parts as $tok) {
        if (isset($L['allow'][$tok]) && !isset($L['must'][$tok])) continue;
        $t = jd_sq($tok);
        foreach ($L['block'] as $w) {
            $s0 = jd_sq($w); $s = strlen($s0) >= 4 ? $s0 : $w;
            if (strlen($s) <= 3) { if ($tok === $w || ($s === $s0 && $t === $s)) return true; }
            elseif (strlen($s) === 4) { if ($tok === $w || str_starts_with($t, $s) || str_ends_with($t, $s)) return true; }
            elseif (strpos($t, $s) !== false || strpos($tok, $w) !== false) return true;
        }
    }
    return false;
}
function jd_wk(): string { return date('o-\WW'); }
function jd_pid(string $s): string { return preg_replace('/[^a-z0-9]/i', '', substr($s, 0, 24)); }
function jd_top(PDO $p, string $wk, int $n): array {
    $st = $p->prepare('SELECT pid, name, score FROM jd_scores WHERE wk = ? ORDER BY score DESC, at ASC LIMIT ' . $n); $st->execute([$wk]); return $st->fetchAll(PDO::FETCH_ASSOC);
}
function jd_rank(PDO $p, string $wk, int $score): int { $st = $p->prepare('SELECT COUNT(*) FROM jd_scores WHERE wk = ? AND score > ?'); $st->execute([$wk, $score]); return (int) $st->fetchColumn() + 1; }
function jd_board(PDO $p, string $pid): array {
    $out = ['week' => [], 'all' => [], 'me' => null];
    foreach (['week' => jd_wk(), 'all' => 'all'] as $k => $wk) $out[$k] = array_map(fn($r) => ['name' => $r['name'], 'score' => (int) $r['score'], 'me' => $pid !== '' && $r['pid'] === $pid], jd_top($p, $wk, 20));
    if ($pid !== '') { $st = $p->prepare('SELECT wk, score, name FROM jd_scores WHERE pid = ? AND wk IN (?, ?)'); $st->execute([$pid, jd_wk(), 'all']); $me = [];
        foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) { $key = $r['wk'] === 'all' ? 'all' : 'week'; $me[$key] = ['score' => (int) $r['score'], 'rank' => jd_rank($p, $r['wk'], (int) $r['score'])]; $me['name'] = $r['name']; }
        $out['me'] = $me ?: null; }
    return $out;
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

    /* Admin mode in the game (owner, 23 Nov): checks the SMR Admin PIN on the server; the game then unlocks everything on that phone
       and the phone is left out of the stats. Same limits as the SMR Admin login. */
    if ($a === 'board') { header('Cache-Control: no-store'); json_out(jd_board(jd_db(), jd_pid((string) ($_GET['pid'] ?? '')))); }
    if ($a === 'run' && $_SERVER['REQUEST_METHOD'] === 'POST') {   // a run started: the score check needs the server's start time
        $k = 'jd_run:' . jd_ip(); if (too_many($k, 120, 3600)) json_out(['ok' => false], 429); note_fail($k);
        $id = bin2hex(random_bytes(8)); $p = jd_db(); $p->prepare('INSERT INTO jd_runs (id, at) VALUES (?, ?)')->execute([$id, time()]);
        if (random_int(1, 50) === 1) $p->prepare('DELETE FROM jd_runs WHERE at < ?')->execute([time() - 86400]);
        json_out(['ok' => true, 'id' => $id]);
    }
    if ($a === 'score' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $k = 'jd_score:' . jd_ip(); if (too_many($k, 60, 3600)) json_out(['ok' => false, 'err' => 'Too many tries, try again later.'], 429); note_fail($k);
        $p = jd_db(); $pid = jd_pid((string) ($in['pid'] ?? '')); $score = max(0, min(99999, (int) ($in['score'] ?? 0))); $name = jd_clean((string) ($in['name'] ?? ''), 14);
        if ($pid === '' || $score < 1) json_out(['ok' => false]);
        // time check: no more than ~50 m a second since the run started on the server, plus the longest head start
        $st = $p->prepare('SELECT at, used FROM jd_runs WHERE id = ?'); $st->execute([preg_replace('/[^a-f0-9]/', '', (string) ($in['run'] ?? ''))]); $run = $st->fetch(PDO::FETCH_ASSOC);
        if (!$run || $score > (time() - (int) $run['at']) * 50 + 1500) json_out(['ok' => false, 'err' => 'check']);
        $wk = jd_wk(); $rank = jd_rank($p, $wk, $score);
        if ($name === '') { $st = $p->prepare('SELECT name FROM jd_scores WHERE pid = ? LIMIT 1'); $st->execute([$pid]); $name = (string) $st->fetchColumn(); }
        if ($name === '') json_out(['ok' => true, 'needName' => $rank <= 20, 'rank' => $rank]);
        if (jd_rude($name)) json_out(['ok' => false, 'err' => 'Please pick a different name.', 'rude' => true]);
        $p->prepare('UPDATE jd_scores SET name = ? WHERE pid = ?')->execute([$name, $pid]);   // a rename applies everywhere
        foreach ([$wk, 'all'] as $w) $p->prepare('INSERT INTO jd_scores (pid, wk, name, score, at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(pid, wk) DO UPDATE SET score = MAX(score, excluded.score), name = excluded.name, at = CASE WHEN excluded.score > score THEN excluded.at ELSE at END')->execute([$pid, $w, $name, $score, time()]);
        json_out(['ok' => true, 'saved' => true, 'name' => $name] + jd_board($p, $pid));
    }
    if ($a === 'name' && $_SERVER['REQUEST_METHOD'] === 'POST') {   // change your name on the board
        $k = 'jd_name:' . jd_ip(); if (too_many($k, 20, 3600)) json_out(['ok' => false], 429); note_fail($k);
        $pid = jd_pid((string) ($in['pid'] ?? '')); $name = jd_clean((string) ($in['name'] ?? ''), 14);
        if ($pid === '' || mb_strlen($name) < 2) json_out(['ok' => false, 'err' => 'Name too short.']);
        if (jd_rude($name)) json_out(['ok' => false, 'err' => 'Please pick a different name.', 'rude' => true]);
        jd_db()->prepare('UPDATE jd_scores SET name = ? WHERE pid = ?')->execute([$name, $pid]); json_out(['ok' => true, 'name' => $name]);
    }
    if ($a === 'admin_pin' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $ipKey = 'admin:' . hash('sha256', client_ip());
        if (too_many($ipKey, 6, 900) || too_many('admin:all', 20, 3600)) json_out(['error' => 'Too many tries. Wait 15 minutes.'], 429);
        $pin = preg_replace('/\s/', '', (string) ($in['pin'] ?? ''));
        $game = hash_equals(JD_ADMIN_CODE, $pin);                 // the game's own admin code (owner can give it to testers)
        $owner = !$game && $pin !== '' && password_verify($pin, admin_hash());   // or the owner's SMR Admin PIN
        if (!$game && !$owner) { note_fail($ipKey); note_fail('admin:all'); usleep(400000); json_out(['error' => 'Wrong PIN'], 403); }
        $vid = preg_replace('/[^a-z0-9]/i', '', substr((string) ($in['vid'] ?? ''), 0, 20));
        if ($owner && $vid !== '') gs_mark_owner(jd_db(), 'jd', $vid, 'admin-mode');
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
    if (in_array($a, ['admin', 'since', 'stats', 'devices', 'owner', 'rec_done', 'rec_del', 'settings_save', 'lb', 'lb_del'], true)) {
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
        if ($a === 'settings_save') { $new = ['show_recommend' => !empty($in['show_recommend']), 'lakri' => !empty($in['lakri'])];
            $p->prepare('INSERT INTO jd_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['settings', json_encode($new)]); json_out(['ok' => true, 'settings' => $new]); }
        $id = (int) ($in['id'] ?? 0);
        if ($a === 'rec_done') { $p->prepare('UPDATE jd_recs SET done = ? WHERE id = ?')->execute([empty($in['undo']) ? 1 : 0, $id]); json_out(['ok' => true]); }
        if ($a === 'lb') json_out(['week' => jd_top($p, jd_wk(), 30), 'all' => jd_top($p, 'all', 30)]);
        if ($a === 'lb_del') { $p->prepare('DELETE FROM jd_scores WHERE pid = ?')->execute([jd_pid((string) ($in['pid'] ?? ''))]); json_out(['ok' => true]); }
        if ($a === 'rec_del') { $p->prepare('DELETE FROM jd_recs WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
    }
    json_out(['error' => 'Unknown action'], 404);
} catch (Throwable $e) {
    error_log('jd api: ' . $e->getMessage());
    json_out(['error' => 'Something went wrong.'], 500);
}
