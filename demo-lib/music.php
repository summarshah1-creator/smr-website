<?php
/* SMR Music: shared code for the music player (/music/). Tracks live in private storage, the list in the shared database. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';

const MUSIC_MAX = 120 * 1024 * 1024;   // largest audio file (bytes)
const MUSIC_ART_MAX = 8 * 1024 * 1024;
const MUSIC_AUDIO = ['mp3' => 'audio/mpeg', 'm4a' => 'audio/mp4', 'aac' => 'audio/aac', 'wav' => 'audio/wav',
    'flac' => 'audio/flac', 'ogg' => 'audio/ogg', 'oga' => 'audio/ogg', 'opus' => 'audio/ogg', 'webm' => 'audio/webm'];
const MUSIC_VIDEO_MAX = 200 * 1024 * 1024;
const MUSIC_ART = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];

function music_db(): PDO {
    static $done = false;
    $pdo = db();
    if (!$done) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS music_tracks (
            id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, title TEXT NOT NULL DEFAULT '', artist TEXT DEFAULT '',
            album TEXT DEFAULT '', year TEXT DEFAULT '', genre TEXT DEFAULT '', track_no TEXT DEFAULT '',
            duration REAL DEFAULT 0, ext TEXT NOT NULL DEFAULT 'mp3', size INTEGER DEFAULT 0, art TEXT DEFAULT '',
            lyrics TEXT DEFAULT '', download INTEGER DEFAULT 0, hidden INTEGER DEFAULT 0, sort INTEGER DEFAULT 0,
            plays INTEGER DEFAULT 0, ready INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER)");
        $pdo->exec("CREATE TABLE IF NOT EXISTS music_kv (k TEXT PRIMARY KEY, v TEXT)");
        // analytics: one row per event; devices = random id kept on each phone/browser (owner's own devices are flagged and left out of every figure)
        $pdo->exec("CREATE TABLE IF NOT EXISTS music_events (id INTEGER PRIMARY KEY, at INTEGER, day TEXT, vid TEXT, track TEXT, ev TEXT, src TEXT, dev TEXT, app INTEGER DEFAULT 0, val INTEGER DEFAULT 0)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS music_ev_tr ON music_events (track, at)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS music_ev_vid ON music_events (vid)");
        $pdo->exec("CREATE TABLE IF NOT EXISTS music_devices (vid TEXT PRIMARY KEY, first_at INTEGER, last_at INTEGER, dev TEXT, ua TEXT, owner INTEGER DEFAULT 0, label TEXT DEFAULT '')");
        $cols = array_column($pdo->query('PRAGMA table_info(music_tracks)')->fetchAll(), 'name');
        if (!in_array('about', $cols, true)) $pdo->exec("ALTER TABLE music_tracks ADD COLUMN about TEXT DEFAULT ''");
        if (!in_array('video', $cols, true)) $pdo->exec("ALTER TABLE music_tracks ADD COLUMN video INTEGER DEFAULT 0");
        if (!in_array('slug', $cols, true)) $pdo->exec("ALTER TABLE music_tracks ADD COLUMN slug TEXT DEFAULT ''");
        foreach ($pdo->query("SELECT code, title FROM music_tracks WHERE slug IS NULL OR slug = ''")->fetchAll() as $r)
            $pdo->prepare('UPDATE music_tracks SET slug = ? WHERE code = ?')->execute([music_slug((string) $r['title']), $r['code']]);
        $done = true;
        try { music_seed_import(); } catch (Throwable $e) {}
        try { music_video_seed_import(); } catch (Throwable $e) {}
        try { music_audio_seed_import(); } catch (Throwable $e) {}
        // one-off text fixes for tracks that were already imported (each runs once)
        if (music_kv('fix:gatsby-about-2') === null) {
            $pdo->prepare("UPDATE music_tracks SET about = ?, updated_at = ? WHERE slug = 'thats-gatsby-law'")->execute(["That’s Gatsby Law (NFA) is Saf Rathor’s story, told from his point of view. Two brothers, two bosses: Saf and his big brother started Gatsby Law with a desk, a phone and their dad’s belief that the future was bright. Ten years on, their name is on the building.\n\nThe song goes behind the results: 3am calls from worried mums, cases nobody thought could be won, and the long nights the cameras never show. NFA stands for No Further Action, the result every client hopes for, and the promise Saf makes when the phone rings.\n\nWhat drives them is simple: every case is a life, not a number. The nice cars came later; what they’re proudest of is showing the next generation what’s possible.", now()]);
            music_kv('fix:gatsby-about-2', '1');
        }
    }
    return $pdo;
}
/* A unique link name from the title: "That's Gatsby Law (NFA)" -> thats-gatsby-law-nfa (adds -2, -3… if taken). */
function music_slug(string $title, ?string $want = null): string {
    $base = strtolower((string) ($want ?? $title));
    $base = str_replace(["'", '’', '‘'], '', $base);
    $base = trim((string) preg_replace('/[^a-z0-9]+/', '-', $base), '-');
    $base = substr($base, 0, 60) ?: 'track';
    $s = $base; $n = 1;
    $st = db()->prepare('SELECT 1 FROM music_tracks WHERE slug = ?');
    while (true) { $st->execute([$s]); if (!$st->fetchColumn()) return $s; $s = $base . '-' . (++$n); }
}
function music_by_slug(string $slug): ?array {
    $st = music_db()->prepare('SELECT * FROM music_tracks WHERE slug = ? AND ready = 1'); $st->execute([strtolower($slug)]);
    return $st->fetch() ?: null;
}
const MUSIC_EVENTS = ['open', 'play', 'listen', 'p25', 'p50', 'p75', 'done', 'time', 'dl', 'home', 'install', 'fav', 'copy', 'share', 'video', 'fs', 'lyrics', 'keep'];
function music_today(?int $at = null): string { $d = new DateTime('@' . ($at ?? time())); $d->setTimezone(new DateTimeZone('Europe/London')); return $d->format('Y-m-d'); }
function music_is_bot(string $ua): bool { return $ua === '' || (bool) preg_match('/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|skype|curl|wget|python|headless|lighthouse/i', $ua); }
function music_dir(?string $code = null): string {
    $d = private_dir() . '/music';
    if (!is_dir($d)) @mkdir($d, 0750, true);
    if ($code === null) return $d;
    if (!preg_match('/^[A-Za-z0-9_-]{10,40}$/', $code)) throw new RuntimeException('bad code');
    return $d . '/' . $code;
}
function music_kv(string $k, ?string $v = null): ?string {
    if ($v !== null) { music_db()->prepare('INSERT OR REPLACE INTO music_kv (k, v) VALUES (?, ?)')->execute([$k, $v]); return $v; }
    $st = music_db()->prepare('SELECT v FROM music_kv WHERE k = ?'); $st->execute([$k]);
    $r = $st->fetchColumn(); return $r === false ? null : (string) $r;
}
function music_settings(): array {
    $s = json_decode((string) music_kv('settings'), true) ?: [];
    return ['title' => (string) ($s['title'] ?? 'SMR Player'), 'sub' => (string) ($s['sub'] ?? 'Music by SMR Digital'),
        'download_all' => !empty($s['download_all'])];
}
function music_track(string $code): ?array {
    $st = music_db()->prepare('SELECT * FROM music_tracks WHERE code = ?'); $st->execute([$code]);
    return $st->fetch() ?: null;
}
function music_public(array $t, bool $owner = false): array {
    $s = music_settings();
    $o = ['id' => $t['code'], 'title' => $t['title'], 'artist' => $t['artist'], 'album' => $t['album'], 'year' => $t['year'],
        'genre' => $t['genre'], 'track' => $t['track_no'], 'duration' => (float) $t['duration'],
        'slug' => (string) ($t['slug'] ?? ''), 'art' => $t['art'] !== '' ? '/music/api.php?a=art&id=' . $t['code'] . '&v=' . $t['updated_at'] : '',
        'video' => !empty($t['video']) ? '/music/api.php?a=video&id=' . $t['code'] . '&v=' . $t['updated_at'] : '',
        'poster' => !empty($t['video']) && is_file(music_dir($t['code']) . '/poster.jpg') ? '/music/api.php?a=poster&id=' . $t['code'] . '&v=' . $t['updated_at'] : '',
        'src' => '/music/api.php?a=play&id=' . $t['code'] . '&v=' . $t['updated_at'],
        'lyrics' => $t['lyrics'], 'about' => (string) ($t['about'] ?? ''), 'download' => (bool) $t['download'] || $s['download_all'], 'ext' => $t['ext']];
    if ($owner) { $o['hidden'] = (bool) $t['hidden']; $o['plays'] = (int) $t['plays']; $o['size'] = (int) $t['size']; $o['own_download'] = (bool) $t['download']; }
    return $o;
}
function music_clean(string $s, int $max): string {
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}
/* Send a file with Range support, so the player can seek without downloading the whole track. */
function music_send(string $path, string $mime, ?string $dlName = null): void {
    $size = filesize($path);
    $etag = '"' . dechex($size) . '-' . dechex((int) filemtime($path)) . '"';
    header('Content-Type: ' . $mime);
    header('Accept-Ranges: bytes');
    header('ETag: ' . $etag);
    header('Cache-Control: private, max-age=86400');
    header('X-Content-Type-Options: nosniff');
    if ($dlName !== null) header("Content-Disposition: attachment; filename=\"" . preg_replace('/[^A-Za-z0-9 ._()-]+/', '', $dlName) . "\"; filename*=UTF-8''" . rawurlencode($dlName));
    if (trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag && empty($_SERVER['HTTP_RANGE'])) { http_response_code(304); exit; }
    $start = 0; $end = $size - 1;
    if (preg_match('/^bytes=(\d*)-(\d*)$/', (string) ($_SERVER['HTTP_RANGE'] ?? ''), $m)) {
        if ($m[1] === '' && $m[2] !== '') { $start = max(0, $size - (int) $m[2]); }
        else { $start = (int) $m[1]; if ($m[2] !== '') $end = min($end, (int) $m[2]); }
        if ($start > $end || $start >= $size) { http_response_code(416); header("Content-Range: bytes */$size"); exit; }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
    }
    $len = $end - $start + 1;
    header('Content-Length: ' . $len);
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') exit;
    @set_time_limit(0);
    while (ob_get_level()) ob_end_clean();
    $fh = fopen($path, 'rb'); fseek($fh, $start);
    while ($len > 0 && !feof($fh) && !connection_aborted()) { $n = min(65536, $len); echo fread($fh, $n); $len -= $n; flush(); }
    fclose($fh); exit;
}
function music_sweep(): void {
    // Unfinished uploads older than a day go.
    $st = music_db()->prepare('SELECT code FROM music_tracks WHERE ready = 0 AND created_at < ?'); $st->execute([now() - 86400]);
    foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $c) { rrmdir_any(music_dir($c)); music_db()->prepare('DELETE FROM music_tracks WHERE code = ?')->execute([$c]); }
}

/* Tracks shipped with the site: demo-data/music-seed/<slug>.pack.php (PHP that exits if requested + a ZIP of audio.<ext>, art.<ext>, meta.json).
   Each is added once (remembered in music_kv 'seed:<slug>'), so deleting it in the player keeps it deleted. */
/* Music videos shipped with the site: demo-data/music-seed/<name>.video.pack.php (PHP that exits + ZIP of video.mp4, poster.jpg,
   meta.json {"slug"}), added once (music_kv 'vseed:<name>') to the track with that slug. The video is silent: the song plays from
   the audio file and the player keeps the video in time with it. */
function music_video_seed_import(): void {
    $dir = SITE_ROOT . '/demo-data/music-seed';
    if (!is_dir($dir) || !class_exists('ZipArchive')) return;
    foreach (glob($dir . '/*.video.pack.php') ?: [] as $pack) {
        $name = basename($pack, '.video.pack.php');
        if (music_kv('vseed:' . $name) !== null) continue;
        // stream the ZIP out of the pack (the video is big: don't load it all into memory)
        $in = fopen($pack, 'rb'); $head = (string) fread($in, 256);
        $at = strpos($head, '__halt_compiler();'); if ($at === false) { fclose($in); continue; }
        fseek($in, $at + strlen('__halt_compiler();'));
        $tmp = music_dir() . '/.vseed-' . bin2hex(random_bytes(4)) . '.zip';
        $o = fopen($tmp, 'wb'); stream_copy_to_stream($in, $o); fclose($o); fclose($in);
        $z = new ZipArchive(); $done = false;
        if ($z->open($tmp) === true) {
            $m = json_decode((string) $z->getFromName('meta.json'), true) ?: [];
            $st = db()->prepare('SELECT code FROM music_tracks WHERE slug = ?'); $st->execute([(string) ($m['slug'] ?? '')]);
            $code = $st->fetchColumn();
            if ($code) {
                $d = music_dir((string) $code);
                if ($z->extractTo($d, ['video.mp4']) && is_file("$d/video.mp4")) {
                    $z->extractTo($d, ['poster.jpg']);
                    db()->prepare('UPDATE music_tracks SET video = 1, updated_at = ? WHERE code = ?')->execute([now(), $code]);
                    $done = true;
                }
            } else $done = true; // track not there (deleted): nothing to attach
            $z->close();
        }
        @unlink($tmp);
        if ($done) music_kv('vseed:' . $name, (string) now());
    }
}
/* Replacement audio for a track that's already on the site: demo-data/music-seed/<name>.audio.pack.php (PHP that exits + ZIP of
   audio.<ext>, meta.json {"slug"}), swapped in once (music_kv 'aseed:<name>'). Bumps updated_at so phones fetch the new file. */
function music_audio_seed_import(): void {
    $dir = SITE_ROOT . '/demo-data/music-seed';
    if (!is_dir($dir) || !class_exists('ZipArchive')) return;
    foreach (glob($dir . '/*.audio.pack.php') ?: [] as $pack) {
        $name = basename($pack, '.audio.pack.php');
        if (music_kv('aseed:' . $name) !== null) continue;
        $in = fopen($pack, 'rb'); $head = (string) fread($in, 256);
        $at = strpos($head, '__halt_compiler();'); if ($at === false) { fclose($in); continue; }
        fseek($in, $at + strlen('__halt_compiler();'));
        $tmp = music_dir() . '/.aseed-' . bin2hex(random_bytes(4)) . '.zip';
        $o = fopen($tmp, 'wb'); stream_copy_to_stream($in, $o); fclose($o); fclose($in);
        $z = new ZipArchive(); $done = false;
        if ($z->open($tmp) === true) {
            $m = json_decode((string) $z->getFromName('meta.json'), true) ?: [];
            $st = db()->prepare('SELECT code, ext FROM music_tracks WHERE slug = ?'); $st->execute([(string) ($m['slug'] ?? '')]);
            $t = $st->fetch();
            $file = '';
            for ($i = 0; $i < $z->numFiles; $i++) { $n = $z->getNameIndex($i); if (preg_match('/^audio\.([a-z0-9]+)$/', $n, $mm) && isset(MUSIC_AUDIO[$mm[1]])) $file = $n; }
            if ($t && $file !== '') {
                $d = music_dir((string) $t['code']); $ext = substr($file, 6);
                if ($z->extractTo($d . '/.new', [$file]) && is_file("$d/.new/$file")) {
                    if ($ext !== $t['ext']) @unlink("$d/audio." . $t['ext']);
                    rename("$d/.new/$file", "$d/audio.$ext"); @rmdir("$d/.new");
                    db()->prepare('UPDATE music_tracks SET ext = ?, size = ?, updated_at = ? WHERE code = ?')->execute([$ext, filesize("$d/audio.$ext"), now(), $t['code']]);
                    $done = true;
                }
            } elseif (!$t) $done = true;
            $z->close();
        }
        @unlink($tmp);
        if ($done) music_kv('aseed:' . $name, (string) now());
    }
}
function music_seed_import(): void {
    $dir = SITE_ROOT . '/demo-data/music-seed';
    if (!is_dir($dir) || !class_exists('ZipArchive')) return;
    foreach (glob($dir . '/*.pack.php') ?: [] as $pack) {
        $slug = basename($pack, '.pack.php');
        if (music_kv('seed:' . $slug) !== null) continue;
        $raw = (string) file_get_contents($pack);
        $at = strpos($raw, '__halt_compiler();'); if ($at === false) continue;
        $tmp = music_dir() . '/.seed-' . bin2hex(random_bytes(4)) . '.zip';
        file_put_contents($tmp, substr($raw, $at + strlen('__halt_compiler();'))); unset($raw);
        $z = new ZipArchive();
        if ($z->open($tmp) === true) {
            $m = json_decode((string) $z->getFromName('meta.json'), true) ?: [];
            $ext = (string) ($m['ext'] ?? 'mp3'); $art = (string) ($m['art'] ?? '');
            $audio = $z->getFromName('audio.' . $ext);
            if ($audio !== false && isset(MUSIC_AUDIO[$ext])) {
                $code = rand_token(12); $d = music_dir($code); @mkdir($d, 0750, true);
                file_put_contents("$d/audio.$ext", $audio);
                if ($art !== '' && ($a = $z->getFromName('art.' . $art)) !== false) file_put_contents("$d/art.$art", $a); else $art = '';
                $min = (int) db()->query('SELECT COALESCE(MIN(sort), 0) FROM music_tracks')->fetchColumn();
                db()->prepare('INSERT INTO music_tracks (code, title, artist, album, year, genre, track_no, duration, ext, size, art, lyrics, about, download, hidden, slug, sort, ready, created_at, updated_at)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)')->execute([$code, (string) ($m['title'] ?? 'Untitled'), (string) ($m['artist'] ?? ''), (string) ($m['album'] ?? ''),
                    (string) ($m['year'] ?? ''), (string) ($m['genre'] ?? ''), (string) ($m['track'] ?? ''), (float) ($m['duration'] ?? 0), $ext, strlen($audio), $art,
                    (string) ($m['lyrics'] ?? ''), (string) ($m['about'] ?? ''), (int) ($m['download'] ?? 0), (int) ($m['hidden'] ?? 0), music_slug((string) ($m['title'] ?? ''), isset($m['slug']) ? (string) $m['slug'] : null), $min - 1, now(), now()]);
            }
            $z->close();
        }
        @unlink($tmp);
        music_kv('seed:' . $slug, (string) now());
    }
}

/* Analytics for the owner (SMR Admin → Analytics). $track = track code or '' for all; $from/$to = Y-m-d (London days, inclusive);
   $since = unix time of the owner's last look (for "since you last checked"). Owner devices are left out of every figure. */
function music_stats(string $track, string $from, string $to, int $since): array {
    $db = music_db();
    $ok = fn($d) => preg_match('/^\d{4}-\d{2}-\d{2}$/', $d);
    if (!$ok($to)) $to = music_today();
    if (!$ok($from)) $from = '2000-01-01';
    $track = preg_replace('/[^a-z0-9_-]/i', '', $track);
    $base = "vid <> '' AND vid NOT IN (SELECT vid FROM music_devices WHERE owner = 1)" . ($track !== '' ? ' AND track = ' . $db->quote($track) : '');
    $rng = "$base AND day >= " . $db->quote($from) . ' AND day <= ' . $db->quote($to);
    $one = function (string $sql) use ($db) { return (int) $db->query($sql)->fetchColumn(); };
    // totals per event (count + different devices)
    $ev = [];
    foreach ($db->query("SELECT ev, COUNT(*) n, COUNT(DISTINCT vid) u, SUM(val) v FROM music_events WHERE $rng GROUP BY ev")->fetchAll() as $r) $ev[$r['ev']] = ['n' => (int) $r['n'], 'u' => (int) $r['u'], 'v' => (int) $r['v']];
    $people = $one("SELECT COUNT(DISTINCT vid) FROM music_events WHERE $rng");
    // first time each device ever showed up (for this track / all tracks)
    $firsts = "SELECT vid, MIN(at) f, MIN(day) fd FROM music_events WHERE $base GROUP BY vid";
    $new = $one("SELECT COUNT(*) FROM ($firsts) WHERE fd >= " . $db->quote($from) . ' AND fd <= ' . $db->quote($to));
    $listeners = $one("SELECT COUNT(DISTINCT vid) FROM music_events WHERE $rng AND ev = 'play'");
    $hsopen = $one("SELECT COUNT(*) FROM music_events WHERE $rng AND ev = 'open' AND app = 1");
    $hsdev = $one("SELECT COUNT(DISTINCT vid) FROM music_events WHERE $rng AND app = 1");
    // per day
    $days = [];
    foreach ($db->query("SELECT day, SUM(ev='play') plays, SUM(ev='open') opens, COUNT(DISTINCT CASE WHEN ev='play' THEN vid END) lis, COUNT(DISTINCT vid) ppl FROM music_events WHERE $rng GROUP BY day ORDER BY day")->fetchAll() as $r)
        $days[$r['day']] = ['plays' => (int) $r['plays'], 'opens' => (int) $r['opens'], 'listeners' => (int) $r['lis'], 'people' => (int) $r['ppl'], 'new' => 0];
    foreach ($db->query("SELECT fd, COUNT(*) n FROM ($firsts) WHERE fd >= " . $db->quote($from) . ' AND fd <= ' . $db->quote($to) . ' GROUP BY fd')->fetchAll() as $r)
        if (isset($days[$r['fd']])) $days[$r['fd']]['new'] = (int) $r['n'];
    $grp = function (string $col) use ($db, $rng) { $o = []; foreach ($db->query("SELECT $col k, COUNT(DISTINCT vid) n FROM music_events WHERE $rng GROUP BY $col ORDER BY n DESC LIMIT 12")->fetchAll() as $r) $o[] = ['k' => (string) $r['k'], 'n' => (int) $r['n']]; return $o; };
    // since the owner last looked (all time, not limited by the range)
    $sinceOut = null;
    if ($since > 0) {
        $sb = "$base AND at > " . (int) $since;
        $sinceOut = ['plays' => $one("SELECT COUNT(*) FROM music_events WHERE $sb AND ev = 'play'"), 'listens' => $one("SELECT COUNT(*) FROM music_events WHERE $sb AND ev = 'listen'"),
            'opens' => $one("SELECT COUNT(*) FROM music_events WHERE $sb AND ev = 'open'"), 'people' => $one("SELECT COUNT(DISTINCT vid) FROM music_events WHERE $sb"),
            'new' => $one("SELECT COUNT(*) FROM ($firsts) WHERE f > " . (int) $since), 'dl' => $one("SELECT COUNT(*) FROM music_events WHERE $sb AND ev = 'dl'")];
    }
    // recent log + devices
    $log = $db->query("SELECT at, vid, track, ev, src, dev, app, val FROM music_events WHERE $rng ORDER BY id DESC LIMIT 150")->fetchAll();
    $devTr = $track !== '' ? ' AND e.track = ' . $db->quote($track) : '';
    $devices = $db->query("SELECT d.vid, d.dev, d.owner, d.label, d.first_at, d.last_at, SUM(e.ev='play') plays, SUM(e.ev='listen') listens, SUM(e.ev='open') opens, SUM(e.ev='dl') dls, SUM(CASE WHEN e.ev='time' THEN e.val ELSE 0 END) secs
        FROM music_devices d LEFT JOIN music_events e ON e.vid = d.vid$devTr GROUP BY d.vid HAVING d.owner = 1 OR plays > 0 OR opens > 0 ORDER BY d.last_at DESC LIMIT 200")->fetchAll();
    $tracks = $db->query("SELECT code, title, slug, hidden FROM music_tracks WHERE ready = 1 ORDER BY sort ASC, id DESC")->fetchAll();
    return ['from' => $from, 'to' => $to, 'track' => $track, 'ev' => $ev, 'people' => $people, 'listeners' => $listeners, 'new' => $new,
        'returning' => max(0, $people - $new), 'hsopen' => $hsopen, 'hsdev' => $hsdev, 'days' => $days, 'src' => $grp('src'), 'dev' => $grp('dev'), 'app' => $grp('app'),
        'since' => $sinceOut, 'log' => $log, 'devices' => $devices, 'tracks' => $tracks, 'now' => time(), 'today' => music_today()];
}

