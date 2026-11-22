<?php
/* Flappy Kabootar: leaderboard (today + all time) and "recommend a place" inbox.
   Data lives in the shared private SQLite (demo-lib/bootstrap.php). Owner reads it in SMR Admin → Flappy. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
require dirname(__DIR__) . '/demo-lib/gamestats.php';
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
        add_col($pdo, 'fk_scores', 'pid', "TEXT DEFAULT ''");
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_events (id INTEGER PRIMARY KEY, day TEXT NOT NULL, at INTEGER NOT NULL, vid TEXT DEFAULT '', ev TEXT NOT NULL, src TEXT DEFAULT '', dev TEXT DEFAULT '', app INTEGER DEFAULT 0, val INTEGER DEFAULT 0, extra TEXT DEFAULT '')");
        $pdo->exec('CREATE INDEX IF NOT EXISTS fk_events_day ON fk_events(day, ev)');
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_runs (id TEXT PRIMARY KEY, at INTEGER NOT NULL, ip TEXT DEFAULT '', used INTEGER DEFAULT 0)");
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_players (pid TEXT PRIMARY KEY, name TEXT, phone TEXT DEFAULT '', at INTEGER NOT NULL)");
        gs_init($pdo, 'fk');   // owner devices + the fk_ev view (events without them)
        $pdo->exec("CREATE TABLE IF NOT EXISTS fk_flags (id INTEGER PRIMARY KEY, name TEXT, score INTEGER, need INTEGER, took INTEGER, pid TEXT DEFAULT '', ip TEXT DEFAULT '', at INTEGER NOT NULL, done INTEGER DEFAULT 0)");
        // one-off leaderboard entries added by the owner (applied once, then never again)
        foreach ([['seed-summar-68', 'SUMMAR', 68], ['seed-kashai-1000', 'Kashai', 1000]] as [$key, $name, $score]) {
            $st = $pdo->prepare('SELECT 1 FROM fk_meta WHERE k = ?'); $st->execute([$key]);
            if (!$st->fetchColumn()) { $pdo->prepare('INSERT INTO fk_scores (name, score, day, at, ip) VALUES (?, ?, ?, ?, ?)')->execute([$name, $score, date('Y-m-d'), time(), 'owner']); $pdo->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?)')->execute([$key, (string) time()]); }
        }
        $ok = true;
    }
    return $pdo;
}
function fk_today(): string { return date('Y-m-d'); }
// Fastest possible time (seconds) to pass $n pipes: a pipe every 150 game units, speed 72 rising 1.1 per point to 108 units/s.
// 15% slack for timing differences between phones, minus a few seconds for the start.
// optional UK mobile for prize contact: 07 + 9 digits (spaces/dashes ignored). '' = none, null = not valid
function fk_phone($v): ?string { $d = preg_replace('/[\s-]/', '', (string) $v); if ($d === '') return ''; return preg_match('/^07\d{9}$/', $d) ? $d : null; }
function fk_player(string $pid, string $name, string $phone): void { if ($pid === '') return; $p = fk_db();
    $p->prepare("INSERT INTO fk_players (pid, name, phone, at) VALUES (?, ?, ?, ?) ON CONFLICT(pid) DO UPDATE SET name = excluded.name, phone = CASE WHEN excluded.phone != '' THEN excluded.phone ELSE fk_players.phone END, at = excluded.at")->execute([$pid, $name, $phone, time()]); }
function fk_min_secs(int $n): int { $t = 0.0; for ($k = 0; $k < $n; $k++) $t += 150 / min(108, 72 + $k * 1.1); return max(0, (int) floor($t * 0.85) - 4); }
function fk_board(string $pid = ''): array {
    // one row per player: a remembered device (pid) keeps a single entry with its best score; older entries without a pid stand alone
    $p = fk_db(); $g = "GROUP BY CASE WHEN pid != '' THEN pid ELSE 'r' || id END ORDER BY score DESC, MIN(at) ASC LIMIT 50";
    $sel = "SELECT name, MAX(score) score, MAX(CASE WHEN pid != '' AND pid = ? THEN 1 ELSE 0 END) mine FROM fk_scores";
    $t = $p->prepare("$sel WHERE day = ? $g"); $t->execute([$pid, fk_today()]);
    $a = $p->prepare("$sel $g"); $a->execute([$pid]);
    $fix = fn($rows) => array_map(fn($r) => ['name' => $r['name'], 'score' => (int) $r['score'], 'mine' => (bool) $r['mine']], $rows);
    return ['today' => $fix($t->fetchAll()), 'all' => $fix($a->fetchAll()), 'day' => fk_today()];
}
function fk_pid($v): string { return preg_replace('/[^a-z0-9]/i', '', substr((string) $v, 0, 24)); }
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
const FK_DEFAULTS = ['notice' => '', 'show_leaderboard' => true, 'show_recommend' => true, 'difficulty' => 'normal', 'banner_mode' => '', 'banner_text' => '', 'banner_link' => '', 'banner_where' => 'both', 'banner_v' => 0, 'banner_ratio' => 0, 'sky_live' => true, 'wx_live' => true];
function fk_settings(): array {
    $st = fk_db()->prepare('SELECT v FROM fk_meta WHERE k = ?'); $st->execute(['settings']);
    $v = json_decode((string) $st->fetchColumn(), true);
    $o = array_merge(FK_DEFAULTS, is_array($v) ? array_intersect_key($v, FK_DEFAULTS) : []);
    if ($o['banner_mode'] === '') { $o['banner_mode'] = $o['notice'] !== '' ? 'text' : 'off'; if ($o['banner_text'] === '') $o['banner_text'] = $o['notice']; } // older saves only had the home-screen message
    return $o;
}
/* ---- live Luton weather (Open-Meteo, free, no key): fetched at most every 15 minutes and shared by every player ---- */
function fk_weather(): array {
    $p = fk_db(); $st = $p->prepare('SELECT v FROM fk_meta WHERE k = ?'); $st->execute(['wx']); $w = json_decode((string) $st->fetchColumn(), true);
    if (!is_array($w)) $w = ['at' => 0, 'code' => 0, 'cloud' => 0, 'snowd' => 0, 'wind' => 0, 'ok' => 0];
    if (time() - (int) $w['at'] > 600) {   // refreshed at most every 10 minutes
        $url = 'https://api.open-meteo.com/v1/forecast?latitude=51.879&longitude=-0.417&current=weather_code,cloud_cover,snow_depth,wind_speed_10m,precipitation&timezone=Europe%2FLondon';
        $ctx = stream_context_create(['http' => ['timeout' => 3, 'header' => "User-Agent: FlappyKabootar/1.0\r\n"], 'ssl' => ['verify_peer' => true]]);
        $raw = @file_get_contents($url, false, $ctx); $j = $raw ? json_decode($raw, true) : null;
        if (is_array($j) && isset($j['current']['weather_code'])) { $c = $j['current'];
            $w = ['at' => time(), 'code' => (int) $c['weather_code'], 'cloud' => (int) ($c['cloud_cover'] ?? 0), 'snowd' => (float) ($c['snow_depth'] ?? 0), 'wind' => (float) ($c['wind_speed_10m'] ?? 0), 'rain' => (float) ($c['precipitation'] ?? 0), 'ok' => 1]; }
        else $w['at'] = time() - 600;   // try again in 5 minutes; players keep the last known weather (or clear sky)
        $p->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['wx', json_encode($w)]);
    }
    return $w;
}
/* ---- seasons: the trees in the game follow the date; tell the owner's phone when they change ---- */
const FK_SEASONS = ['winter' => 'Winter: bare trees', 'spring' => 'Spring: blossom on the trees', 'summer' => 'Summer: full green trees', 'autumn' => 'Autumn: leaves turning yellow and orange', 'lateautumn' => 'Late autumn: orange and red leaves, starting to fall'];
function fk_season(int $ts): string { $m = (int) date('n', $ts); $d = (int) date('j', $ts);
    if ($m === 12 || $m <= 2 || ($m === 3 && $d < 15)) return 'winter'; if ($m <= 4) return 'spring'; if ($m <= 8 || ($m === 9 && $d < 20)) return 'summer'; if ($m <= 10) return 'autumn'; return 'lateautumn'; }
function fk_season_info(): array { $now = time(); $cur = fk_season($now); $next = null; $at = null;
    for ($i = 1; $i <= 120; $i++) { $t = strtotime("+$i days", $now); if (fk_season($t) !== $cur) { $next = fk_season($t); $at = date('j M', $t); break; } }
    return ['now' => $cur, 'now_text' => FK_SEASONS[$cur], 'next' => $next, 'next_text' => $next ? FK_SEASONS[$next] : '', 'next_at' => $at]; }
function fk_season_check(): void { try { $p = fk_db(); $cur = fk_season(time()); $st = $p->prepare('SELECT v FROM fk_meta WHERE k = ?'); $st->execute(['season']); $old = $st->fetchColumn();
    if ($old === $cur) return; $p->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['season', $cur]);
    if ($old && is_file(dirname(__DIR__) . '/demo-lib/push.php')) { require_once dirname(__DIR__) . '/demo-lib/push.php'; if (function_exists('push_all')) push_all('Flappy Kabootar: the season changed', FK_SEASONS[$cur] . ' in the game now.', '/demo-admin/#flappy', 'fk-season'); } } catch (Throwable $e) {} }
/* ---- festivals and special days: the owner is reminded 2 weeks and 3 days before, so the game can be decorated in time (nothing changes in the game by itself) ---- */
const FK_FESTS = [
    ['christmas', 'Christmas', '2026-12-25', false, 'Christmas lights along the shops, a tree outside the Mall, Santa and his sleigh flying across the night sky, snow-capped roofs.'],
    ['nye', "New Year's Eve", '2026-12-31', false, 'Fireworks over Wardown at midnight, a countdown on the home screen.'],
    ['newyear', "New Year's Day", '2027-01-01', false, 'A "Happy New Year, Luton!" banner plane and a few leftover fireworks.'],
    ['ramadan', 'Ramadan begins', '2027-02-08', true, 'Crescent moon in the night sky, lanterns and lights on the shops, a quiet iftar-time glow.'],
    ['eidfitr', 'Eid al-Fitr', '2027-03-10', true, 'Eid lights strung along the shops, fireworks at night, an "Eid Mubarak" banner plane.'],
    ['eidadha', 'Eid al-Adha', '2027-05-17', true, 'Eid lights and fireworks, an "Eid Mubarak" banner plane.'],
    ['carnival', 'Luton International Carnival', '2027-05-30', true, 'The carnival parade coming down the road for 10 to 20 seconds: floats, costumes, music.'],
    ['diwali', 'Diwali', '2027-10-29', true, 'Diya lamps along the shops and fireworks at night.'],
    ['halloween', 'Halloween', '2027-10-31', false, 'Pumpkins on doorsteps and a few bats at dusk.'],
    ['bonfire', 'Bonfire Night', '2027-11-05', false, 'Fireworks over Wardown and Stockwood all evening.'],
    ['christmas27', 'Christmas', '2027-12-25', false, 'Christmas lights, the tree outside the Mall, Santa flying across the sky.'],
];
function fk_fests(int $n = 5): array { $today = strtotime(date('Y-m-d')); $out = [];
    foreach (FK_FESTS as [$k, $name, $d, $moon, $idea]) { $t = strtotime($d); $days = (int) round(($t - $today) / 86400); if ($days < -1) continue;
        $out[] = ['key' => $k, 'name' => $name, 'date' => date('D j M Y', $t), 'days' => $days, 'moon' => $moon, 'idea' => $idea]; if (count($out) >= $n) break; }
    return $out; }
function fk_fest_check(): void { try { $p = fk_db(); foreach (fk_fests(3) as $f) foreach ([14, 3] as $before) { if ($f['days'] !== $before && !($before === 3 && $f['days'] < 3 && $f['days'] >= 0)) continue;
        $key = 'fest-' . $f['key'] . '-' . $before; $st = $p->prepare('SELECT 1 FROM fk_meta WHERE k = ?'); $st->execute([$key]); if ($st->fetchColumn()) continue;
        $p->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?)')->execute([$key, (string) time()]);
        if (is_file(dirname(__DIR__) . '/demo-lib/push.php')) { require_once dirname(__DIR__) . '/demo-lib/push.php'; if (function_exists('push_all')) push_all('Flappy Kabootar: ' . $f['name'] . ' is coming', $f['name'] . ' is on ' . $f['date'] . ' (in ' . $f['days'] . ' days)' . ($f['moon'] ? ', date depends on the moon' : '') . '. Want the game decorated? Check the ideas in Flappy → Inbox.', '/demo-admin/#flappy', 'fk-fest'); } } } catch (Throwable $e) {} }
function fk_banner_file(): string { return private_dir() . '/fk-banner.img'; }
/* ---- analytics: small first-party events, no outside services ---- */
const FK_EVENTS = ['ban', 'visit', 'play', 'over', 'share', 'card', 'card_save', 'hs_open', 'install', 'lb_open', 'name', 'rec', 'smr', 'sound_on', 'golden', 'moment'];
function fk_stats(int $days): array {
    $p = fk_db(); $from = $days > 0 ? date('Y-m-d', strtotime('-' . ($days - 1) . ' days')) : '0000-00-00';
    $q = function (string $sql, array $a = []) use ($p) { $st = $p->prepare($sql); $st->execute($a); return $st; };
    $tot = []; foreach ($q('SELECT ev, COUNT(*) n, COUNT(DISTINCT vid) u FROM fk_ev WHERE day >= ? GROUP BY ev', [$from])->fetchAll() as $r) $tot[$r['ev']] = ['n' => (int) $r['n'], 'u' => (int) $r['u']];
    $visitors = (int) $q("SELECT COUNT(DISTINCT vid) FROM fk_ev WHERE day >= ?", [$from])->fetchColumn();
    $sc = $q("SELECT COUNT(*) n, AVG(val) a, MAX(val) m FROM fk_ev WHERE ev = 'over' AND day >= ?", [$from])->fetch();
    $src = $q("SELECT src, COUNT(DISTINCT vid) u, COUNT(*) n FROM fk_ev WHERE ev = 'visit' AND day >= ? GROUP BY src ORDER BY u DESC", [$from])->fetchAll();
    $dev = $q("SELECT dev, COUNT(DISTINCT vid) u FROM fk_ev WHERE ev = 'visit' AND day >= ? GROUP BY dev ORDER BY u DESC", [$from])->fetchAll();
    $appv = (int) $q("SELECT COUNT(DISTINCT vid) FROM fk_ev WHERE ev = 'visit' AND app = 1 AND day >= ?", [$from])->fetchColumn();
    $opens = (int) $q("SELECT COUNT(*) FROM fk_ev WHERE ev = 'visit' AND day >= ?", [$from])->fetchColumn();
    $uniq = (int) $q("SELECT COUNT(DISTINCT vid) FROM fk_ev WHERE ev = 'visit' AND day >= ?", [$from])->fetchColumn();
    // new = first ever visit falls inside the range; returning = has opened it on 2+ different days (ever) and came in this range
    $new = (int) $q("SELECT COUNT(*) FROM (SELECT vid, MIN(day) f FROM fk_ev WHERE ev = 'visit' GROUP BY vid) WHERE f >= ? AND vid IN (SELECT vid FROM fk_ev WHERE ev = 'visit' AND day >= ?)", [$from, $from])->fetchColumn();
    $back = (int) $q("SELECT COUNT(*) FROM (SELECT vid FROM fk_ev WHERE ev = 'visit' GROUP BY vid HAVING COUNT(DISTINCT day) > 1) WHERE vid IN (SELECT vid FROM fk_ev WHERE ev = 'visit' AND day >= ?)", [$from])->fetchColumn();
    $places = $q("SELECT extra place, COUNT(*) n FROM fk_ev WHERE ev = 'over' AND extra != '' AND day >= ? GROUP BY extra ORDER BY n DESC LIMIT 10", [$from])->fetchAll();
    $daily = $q("SELECT day, COUNT(DISTINCT vid) v, SUM(ev = 'play') g FROM fk_ev WHERE day >= ? GROUP BY day ORDER BY day", [date('Y-m-d', strtotime('-29 days'))])->fetchAll();
    return ['days' => $days, 'visitors' => $visitors, 'opens' => $opens, 'unique' => $uniq, 'new' => $new, 'returning' => $back, 'app_users' => $appv, 'events' => $tot, 'games' => (int) $sc['n'], 'avg' => round((float) $sc['a'], 1), 'best' => (int) $sc['m'], 'sources' => $src, 'devices' => $dev, 'places' => $places, 'daily' => $daily];
}

$a = $_GET['a'] ?? $_POST['a'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !same_origin()) json_out(['error' => 'Bad origin'], 403);
$in = $_SERVER['REQUEST_METHOD'] === 'POST' ? (json_decode((string) file_get_contents('php://input'), true) ?: $_POST) : [];

try {
    if ($a === 'board') json_out(fk_board(fk_pid($_GET['pid'] ?? '')));
    if ($a === 'cfg') { header('Cache-Control: no-store'); fk_season_check(); fk_fest_check(); $o = fk_settings(); if ($o['wx_live']) { try { $o['wx'] = fk_weather(); } catch (Throwable $e) {} } json_out($o); }
    if ($a === 'banner') { $f = fk_banner_file(); if (!is_file($f)) { http_response_code(404); exit; } $i = @getimagesize($f);
        header('Content-Type: ' . ($i['mime'] ?? 'image/jpeg')); header('Cache-Control: public, max-age=604800'); header('Content-Length: ' . filesize($f)); readfile($f); exit; }

    if ($a === 'ev' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $ev = (string) ($in['ev'] ?? '');
        if (!in_array($ev, FK_EVENTS, true)) json_out(['ok' => false], 400);
        $k = 'fk_ev:' . fk_ip(); if (too_many($k, 400, 3600)) json_out(['ok' => false], 429); note_fail($k);
        $vid = preg_replace('/[^a-z0-9]/i', '', substr((string) ($in['vid'] ?? ''), 0, 20));
        $src = preg_replace('/[^a-z0-9_-]/i', '', substr((string) ($in['src'] ?? ''), 0, 24));
        $dev = preg_replace('/[^a-z]/i', '', substr((string) ($in['dev'] ?? ''), 0, 12));
        if ($vid !== '' && admin_token()) gs_mark_owner(fk_db(), 'fk', $vid, 'admin-cookie');   // played on a phone logged in to SMR Admin = the owner's
        fk_db()->prepare('INSERT INTO fk_events (day, at, vid, ev, src, dev, app, val, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([fk_today(), now(), $vid, $ev, $src, $dev, empty($in['app']) ? 0 : 1, max(0, min(9999, (int) ($in['val'] ?? 0))), fk_clean((string) ($in['extra'] ?? ''), 60)]);
        if (random_int(1, 200) === 1) fk_db()->prepare('DELETE FROM fk_events WHERE at < ?')->execute([now() - 400 * 86400]);
        json_out(['ok' => true]);
    }

    if ($a === 'run' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $k = 'fk_run:' . fk_ip(); if (too_many($k, 240, 3600)) json_out(['error' => 'Slow down.'], 429); note_fail($k);
        $id = bin2hex(random_bytes(9)); $p = fk_db(); $p->prepare('INSERT INTO fk_runs (id, at, ip) VALUES (?, ?, ?)')->execute([$id, time(), fk_ip()]);
        if (random_int(1, 50) === 1) $p->prepare('DELETE FROM fk_runs WHERE at < ?')->execute([time() - 86400 * 2]);
        json_out(['run' => $id]);
    }

    if ($a === 'score' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = fk_clean((string) ($in['name'] ?? ''), 14); $score = (int) ($in['score'] ?? 0);
        if ($name === '' || !preg_match("/^[\\p{L}\\p{N} ._'-]+$/u", $name)) json_out(['error' => 'Use letters and numbers only.'], 400);
        if (fk_rude($name)) json_out(['error' => "That name isn't allowed. Please use your real name or a nickname.", 'rude' => true], 400);
        $rename = !empty($in['rename']) && fk_pid($in['pid'] ?? '') !== '';
        if ($rename) { $k = 'fk_score:' . fk_ip(); if (too_many($k, 15, 3600)) json_out(['error' => 'Too many changes this hour.'], 429); note_fail($k); $pid = fk_pid($in['pid']); fk_db()->prepare('UPDATE fk_scores SET name = ? WHERE pid = ?')->execute([$name, $pid]); json_out(['ok' => true] + fk_board($pid)); }
        if ($score < 1 || $score > 9999) json_out(['error' => 'Score not accepted.'], 400);
        // time check: the game asks the server for a run id when play starts, so the server knows how long the run really took
        $need = fk_min_secs(empty($in['pw']) ? $score : max(0, $score - 25)); $took = -1;   // a gold crate power-up (x2 for 30 s) can add up to about 25 points without extra time
        $rid = preg_replace('/[^a-f0-9]/', '', (string) ($in['run'] ?? ''));
        if ($rid !== '') { $q = fk_db()->prepare('SELECT at FROM fk_runs WHERE id = ? AND used = 0'); $q->execute([$rid]); $at = $q->fetchColumn(); if ($at !== false) $took = time() - (int) $at; }
        if ($score > 15 && $took < $need) {
            fk_db()->prepare('INSERT INTO fk_flags (name, score, need, took, pid, ip, at) VALUES (?, ?, ?, ?, ?, ?, ?)')->execute([$name, $score, $need, $took, fk_pid($in['pid'] ?? ''), fk_ip(), time()]);
            json_out(['error' => "We couldn't check that score, so it's been sent for review."], 400);
        }
        if ($rid !== '') fk_db()->prepare('UPDATE fk_runs SET used = 1 WHERE id = ?')->execute([$rid]);
        $k = 'fk_score:' . fk_ip();
        if (too_many($k, 15, 3600)) json_out(['error' => 'Too many scores this hour. Try again later.'], 429);
        note_fail($k);
        $pid = fk_pid($in['pid'] ?? '');
        fk_db()->prepare('INSERT INTO fk_scores (name, score, day, at, ip, pid) VALUES (?, ?, ?, ?, ?, ?)')->execute([$name, $score, fk_today(), now(), fk_ip(), $pid]);
        if ($pid !== '') fk_db()->prepare('UPDATE fk_scores SET name = ? WHERE pid = ?')->execute([$name, $pid]);
        $ph = fk_phone($in['phone'] ?? ''); if ($pid !== '') fk_player($pid, $name, $ph ?? '');
        json_out(['ok' => true] + fk_board($pid));
    }

    if ($a === 'contact' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $pid = fk_pid($in['pid'] ?? ''); $name = fk_clean((string) ($in['name'] ?? ''), 14); $ph = fk_phone($in['phone'] ?? '');
        if ($pid === '') json_out(['error' => 'Play a game first.'], 400);
        if ($name === '' || !preg_match("/^[\\p{L}\\p{N} ._'-]+$/u", $name)) json_out(['error' => 'Use letters and numbers only.'], 400);
        if (fk_rude($name)) json_out(['error' => "That name isn't allowed."], 400);
        if ($ph === null) json_out(['error' => 'Use a UK mobile: 11 digits starting 07, e.g. 07123 456789.'], 400);
        $k = 'fk_contact:' . fk_ip(); if (too_many($k, 10, 3600)) json_out(['error' => 'Too many changes this hour.'], 429); note_fail($k);
        fk_player($pid, $name, $ph); json_out(['ok' => true]);
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
    if (in_array($a, ['admin', 'rec_done', 'rec_del', 'score_del', 'score_add', 'banner_up', 'flag_ok', 'flag_del', 'stats', 'since', 'settings_save', 'devices', 'owner'], true)) {
        if (!admin_token()) json_out(['error' => 'Log in to SMR Admin first.'], 401);
        $p = fk_db();
        if ($a === 'admin') {
            $recs = $p->query('SELECT id, name, address, note, at, done FROM fk_recs ORDER BY done ASC, at DESC LIMIT 300')->fetchAll();
            $t = $p->prepare("SELECT MAX(id) id, name, MAX(score) score, MIN(at) at, (SELECT phone FROM fk_players pl WHERE pl.pid = fk_scores.pid AND fk_scores.pid != '') phone FROM fk_scores WHERE day = ? GROUP BY CASE WHEN pid != '' THEN pid ELSE 'r' || id END ORDER BY score DESC, at ASC LIMIT 50"); $t->execute([fk_today()]);
            $all = $p->query("SELECT MAX(id) id, name, MAX(score) score, MIN(at) at, MAX(day) day, (SELECT phone FROM fk_players pl WHERE pl.pid = fk_scores.pid AND fk_scores.pid != '') phone FROM fk_scores GROUP BY CASE WHEN pid != '' THEN pid ELSE 'r' || id END ORDER BY score DESC, at ASC LIMIT 50")->fetchAll();
            $n = (int) $p->query('SELECT COUNT(*) FROM fk_recs WHERE done = 0')->fetchColumn();
            $plays = (int) $p->query('SELECT COUNT(*) FROM fk_scores')->fetchColumn();
            $fl = $p->query('SELECT id, name, score, need, took, at FROM fk_flags WHERE done = 0 ORDER BY at DESC LIMIT 50')->fetchAll(PDO::FETCH_ASSOC);
            // best games actually played (from the game-over events), whether or not a name was saved
            $runs = $p->query("SELECT e.at, e.day, e.dev, e.src, e.val AS score, e.extra AS place, e.app, (SELECT COUNT(*) FROM fk_scores s WHERE s.score = e.val) AS saved FROM fk_ev e WHERE e.ev = 'over' AND e.val > 0 ORDER BY e.val DESC, e.at DESC LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
            json_out(['fests' => fk_fests(5), 'recs' => $recs, 'today' => $t->fetchAll(), 'all' => $all, 'new' => $n, 'entries' => $plays, 'flags' => $fl, 'runs' => $runs]);
        }
        if ($a === 'since') json_out(gs_since($p, 'fk', max(0, (int) ($_GET['t'] ?? 0)), 'fk_recs'));
        if ($a === 'devices') json_out(['devices' => gs_devices($p, 'fk')]);
        if ($a === 'stats') json_out(fk_stats(max(0, min(400, (int) ($_GET['days'] ?? 7)))) + ['settings' => fk_settings(), 'season' => fk_season_info()]);
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'POST only'], 405);
        if ($a === 'banner_up') {
            $d = (string) ($in['data'] ?? ''); if (!preg_match('~^data:image/(png|jpeg|webp|gif);base64,~', $d, $m)) json_out(['error' => 'Use a JPG, PNG, WebP or GIF picture.'], 400);
            $bin = base64_decode(substr($d, strpos($d, ',') + 1), true); if ($bin === false || strlen($bin) > 3000000) json_out(['error' => 'That picture is too big (3 MB max).'], 400);
            $i = @getimagesizefromstring($bin); if (!$i || $i[0] < 50 || $i[1] < 20) json_out(['error' => "That file isn't a picture we can use."], 400);
            file_put_contents(fk_banner_file(), $bin, LOCK_EX);
            $cur = fk_settings(); $cur['banner_v'] = time(); $cur['banner_ratio'] = round($i[0] / $i[1], 3); $cur['banner_mode'] = 'image';
            $p->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['settings', json_encode($cur)]);
            json_out(['ok' => true, 'settings' => $cur]);
        }
        if ($a === 'settings_save') {
            $cur = fk_settings(); $new = [
                'notice' => fk_clean((string) ($in['notice'] ?? $cur['notice']), 90),
                'show_leaderboard' => !empty($in['show_leaderboard']), 'show_recommend' => !empty($in['show_recommend']),
                'difficulty' => in_array($in['difficulty'] ?? '', ['easy', 'normal', 'hard'], true) ? $in['difficulty'] : 'normal',
                'banner_mode' => in_array($in['banner_mode'] ?? '', ['off', 'text', 'image'], true) ? $in['banner_mode'] : $cur['banner_mode'],
                'banner_text' => fk_clean((string) ($in['banner_text'] ?? $cur['banner_text']), 180),
                'banner_link' => preg_match('~^https?://[^\s"<>]{3,300}$~i', trim((string) ($in['banner_link'] ?? ''))) ? trim((string) $in['banner_link']) : '',
                'banner_where' => in_array($in['banner_where'] ?? '', ['both', 'home', 'over'], true) ? $in['banner_where'] : 'both',
                'banner_v' => $cur['banner_v'], 'banner_ratio' => $cur['banner_ratio'],
                'sky_live' => array_key_exists('sky_live', $in) ? !empty($in['sky_live']) : $cur['sky_live'], 'wx_live' => array_key_exists('wx_live', $in) ? !empty($in['wx_live']) : $cur['wx_live']];
            $new['notice'] = $new['banner_mode'] === 'text' ? mb_substr($new['banner_text'], 0, 90) : '';
            $p->prepare('INSERT INTO fk_meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute(['settings', json_encode($new)]);
            json_out(['ok' => true, 'settings' => $new]);
        }
        if ($a === 'owner') { gs_set_owner($p, 'fk', (string) ($in['vid'] ?? ''), !empty($in['on'])); json_out(['ok' => true, 'devices' => gs_devices($p, 'fk')]); }
        $id = (int) ($in['id'] ?? 0);
        if ($a === 'score_add') { $nm = fk_clean((string) ($in['name'] ?? ''), 14); $sc = (int) ($in['score'] ?? 0); $dy = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($in['day'] ?? '')) ? $in['day'] : fk_today();
            if ($nm === '' || $sc < 1 || $sc > 9999) json_out(['error' => 'Add a name and a score from 1 to 9999.'], 400);
            $p->prepare('INSERT INTO fk_scores (name, score, day, at, ip) VALUES (?, ?, ?, ?, ?)')->execute([$nm, $sc, $dy, $dy === fk_today() ? time() : strtotime($dy . ' 12:00'), 'owner']); json_out(['ok' => true]); }
        if ($a === 'flag_ok') { $q = $p->prepare('SELECT * FROM fk_flags WHERE id = ?'); $q->execute([$id]); $f = $q->fetch(PDO::FETCH_ASSOC);
            if ($f) { $p->prepare('INSERT INTO fk_scores (name, score, day, at, ip, pid) VALUES (?, ?, ?, ?, ?, ?)')->execute([$f['name'], $f['score'], date('Y-m-d', (int) $f['at']), (int) $f['at'], $f['ip'], $f['pid']]); $p->prepare('UPDATE fk_flags SET done = 1 WHERE id = ?')->execute([$id]); } json_out(['ok' => true]); }
        if ($a === 'flag_del') { $p->prepare('UPDATE fk_flags SET done = 2 WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
        if ($a === 'rec_done') { $p->prepare('UPDATE fk_recs SET done = ? WHERE id = ?')->execute([empty($in['undo']) ? 1 : 0, $id]); json_out(['ok' => true]); }
        if ($a === 'rec_del') { $p->prepare('DELETE FROM fk_recs WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
        if ($a === 'score_del') { $q = $p->prepare('SELECT pid FROM fk_scores WHERE id = ?'); $q->execute([$id]); $pd = (string) $q->fetchColumn(); if ($pd !== '') $p->prepare('DELETE FROM fk_scores WHERE pid = ?')->execute([$pd]); else $p->prepare('DELETE FROM fk_scores WHERE id = ?')->execute([$id]); json_out(['ok' => true]); }
    }
    json_out(['error' => 'Unknown action'], 400);
} catch (Throwable $e) {
    json_out(['error' => 'Something went wrong. Try again.'], 500);
}
