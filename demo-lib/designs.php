<?php
/* SMR Designs delivery: finished designs sent to a client on a private link.
   Links work for DESIGN_DAYS days, then the files move to the archive. The owner is asked
   every 30 days whether to purge archived deliveries older than 30 days. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';

const DESIGN_DAYS = 14;
const DESIGN_PURGE_DAYS = 30;
const DESIGN_MAX_BYTES = 60 * 1024 * 1024;   // per file
const DESIGN_EXTS = ['png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'gif' => 'image/gif'];

function designs_migrate(): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $pdo = db();
    $pdo->exec("CREATE TABLE IF NOT EXISTS design_sets (
        id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, client TEXT DEFAULT '', title TEXT DEFAULT '', phone TEXT DEFAULT '',
        created_at INTEGER, expires_at INTEGER, archived_at INTEGER DEFAULT 0, ready INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0, last_view INTEGER DEFAULT 0, source TEXT DEFAULT 'admin')");
    $pdo->exec("CREATE TABLE IF NOT EXISTS design_files (
        id INTEGER PRIMARY KEY, set_id INTEGER NOT NULL REFERENCES design_sets(id) ON DELETE CASCADE,
        design INTEGER NOT NULL DEFAULT 0, dname TEXT DEFAULT '', kind TEXT NOT NULL, page INTEGER NOT NULL DEFAULT 1,
        w INTEGER, h INTEGER, mime TEXT, size INTEGER, file TEXT NOT NULL, prev TEXT DEFAULT '', orig TEXT DEFAULT '', created_at INTEGER)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS design_files_set ON design_files(set_id, design, kind, page)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)");
}

function kv_get(string $k, string $def = ''): string {
    designs_migrate();
    $st = db()->prepare('SELECT v FROM kv WHERE k = ?'); $st->execute([$k]);
    $v = $st->fetchColumn();
    return $v === false ? $def : (string) $v;
}
function kv_set(string $k, string $v): void {
    designs_migrate();
    db()->prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute([$k, $v]);
}

function designs_dir(bool $archive = false): string {
    $d = private_dir() . ($archive ? '/designs-archive' : '/designs');
    if (!is_dir($d)) @mkdir($d, 0750, true);
    return $d;
}
function set_dir(array $s): string {
    return designs_dir((int) $s['archived_at'] > 0) . '/' . $s['token'];
}

/* Post / Story / Landscape from the shape. */
function design_kind(int $w, int $h): string {
    if ($w <= 0 || $h <= 0) return 'other';
    $r = $w / $h;
    if ($r >= 0.5 && $r <= 0.62) return 'story';
    if ($r >= 0.74 && $r <= 1.02) return 'post';
    if ($r >= 1.7 && $r <= 2.0) return 'wide';
    return 'other';
}

function set_by_token(string $t): ?array {
    if (!preg_match('/^[A-Za-z0-9_-]{12,40}$/', $t)) return null;
    designs_migrate();
    $st = db()->prepare('SELECT * FROM design_sets WHERE token = ?'); $st->execute([$t]);
    return $st->fetch() ?: null;
}
function set_by_id(int $id): ?array {
    designs_migrate();
    $st = db()->prepare('SELECT * FROM design_sets WHERE id = ?'); $st->execute([$id]);
    return $st->fetch() ?: null;
}
function set_files(array $s): array {
    $st = db()->prepare('SELECT * FROM design_files WHERE set_id = ? ORDER BY design, kind, page, id'); $st->execute([$s['id']]);
    return $st->fetchAll();
}
function set_url(array $s): string {
    $host = preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'));
    $host = preg_replace('/^www\./', '', $host) ?: 'smrgraphics.co.uk';
    $local = preg_match('/^(127\.|localhost)/', $host);
    return ($local ? 'http' : 'https') . '://' . $host . '/d/' . $s['token'];
}

/* New delivery. */
function set_create(string $client, string $title, string $phone, string $source, string $token = ''): array {
    designs_migrate();
    $t = $token !== '' ? $token : rand_token(12);
    db()->prepare('INSERT INTO design_sets (token, client, title, phone, created_at, expires_at, source) VALUES (?,?,?,?,?,?,?)')
        ->execute([$t, mb_substr(trim($client), 0, 80), mb_substr(trim($title), 0, 100), preg_replace('/[^0-9+ ]/', '', $phone), now(), now() + DESIGN_DAYS * 86400, $source]);
    $s = set_by_token($t);
    @mkdir(set_dir($s), 0750, true);
    return $s;
}

/* Add one file (already on disk at $tmp). $prevTmp: optional smaller preview made by the browser. */
function set_add_file(array $s, string $tmp, string $origName, int $design, string $dname, ?string $prevTmp, bool $moveUploaded): array {
    $info = @getimagesize($tmp);
    if (!$info || empty($info[0]) || empty($info[1])) throw new RuntimeException('That file is not a picture we can use (PNG, JPG, WebP or GIF).');
    $mime = (string) $info['mime'];
    $ext = array_search($mime, DESIGN_EXTS, true);
    if ($ext === false) throw new RuntimeException('Use PNG, JPG, WebP or GIF files.');
    if ($ext === 'jpeg') $ext = 'jpg';
    $size = (int) filesize($tmp);
    if ($size > DESIGN_MAX_BYTES) throw new RuntimeException('That file is over 60 MB.');
    [$w, $h] = [(int) $info[0], (int) $info[1]];
    $kind = design_kind($w, $h);
    $st = db()->prepare('SELECT COALESCE(MAX(page),0) FROM design_files WHERE set_id = ? AND design = ? AND kind = ? AND w = ? AND h = ?');
    $st->execute([$s['id'], $design, $kind, $w, $h]);
    $page = (int) $st->fetchColumn() + 1;
    $dir = set_dir($s); if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $name = bin2hex(random_bytes(8));
    $file = $name . '.' . $ext;
    $ok = $moveUploaded ? @move_uploaded_file($tmp, "$dir/$file") : @rename($tmp, "$dir/$file");
    if (!$ok && !$moveUploaded) $ok = @copy($tmp, "$dir/$file");
    if (!$ok) throw new RuntimeException('Could not save the file.');
    $prev = '';
    if ($prevTmp && is_file($prevTmp)) {
        $pi = @getimagesize($prevTmp);
        if ($pi && in_array($pi['mime'], ['image/webp', 'image/jpeg', 'image/png'], true) && filesize($prevTmp) < 4 * 1024 * 1024) {
            $prev = $name . '-p.' . ($pi['mime'] === 'image/webp' ? 'webp' : ($pi['mime'] === 'image/png' ? 'png' : 'jpg'));
            if (!@move_uploaded_file($prevTmp, "$dir/$prev") && !@rename($prevTmp, "$dir/$prev")) $prev = '';
        }
    }
    if ($prev === '') $prev = design_make_preview("$dir/$file", $dir, $name);
    $dname = mb_substr(trim($dname), 0, 60);
    db()->prepare('INSERT INTO design_files (set_id, design, dname, kind, page, w, h, mime, size, file, prev, orig, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$s['id'], $design, $dname, $kind, $page, $w, $h, $mime, $size, $file, $prev, mb_substr(basename($origName), 0, 120), now()]);
    return ['kind' => $kind, 'w' => $w, 'h' => $h, 'page' => $page];
}

/* Server-side preview (when GD is there) for files that came without one. */
function design_make_preview(string $path, string $dir, string $name): string {
    if (!function_exists('imagecreatefromstring')) return '';
    try {
        $info = @getimagesize($path);
        if (!$info || $info[0] * $info[1] > 40000000) return '';
        if ($info[0] <= 1100 && $info[1] <= 1100 && filesize($path) < 600000) return '';
        $im = @imagecreatefromstring((string) file_get_contents($path));
        if (!$im) return '';
        $sc = min(1, 1080 / max($info[0], $info[1]));
        $nw = max(1, (int) round($info[0] * $sc)); $nh = max(1, (int) round($info[1] * $sc));
        $out = imagecreatetruecolor($nw, $nh);
        imagealphablending($out, false); imagesavealpha($out, true);
        imagecopyresampled($out, $im, 0, 0, 0, 0, $nw, $nh, $info[0], $info[1]);
        $p = $name . '-p.' . (function_exists('imagewebp') ? 'webp' : 'jpg');
        $ok = function_exists('imagewebp') ? imagewebp($out, "$dir/$p", 84) : imagejpeg($out, "$dir/$p", 86);
        imagedestroy($im); imagedestroy($out);
        return $ok ? $p : '';
    } catch (Throwable $e) { return ''; }
}

/* Move ended links to the archive (their files stay private, the link stops working). */
function designs_sweep(): void {
    designs_migrate();
    designs_pending();
    $st = db()->prepare('SELECT * FROM design_sets WHERE archived_at = 0 AND expires_at < ?'); $st->execute([now()]);
    foreach ($st->fetchAll() as $s) set_archive($s);
    // Unfinished uploads older than a day
    $st = db()->prepare('SELECT * FROM design_sets WHERE ready = 0 AND created_at < ?'); $st->execute([now() - 86400]);
    foreach ($st->fetchAll() as $s) set_delete($s);
}
function set_archive(array $s): void {
    if ((int) $s['archived_at'] > 0) return;
    $from = set_dir($s);
    $to = designs_dir(true) . '/' . $s['token'];
    if (is_dir($from)) @rename($from, $to);
    db()->prepare('UPDATE design_sets SET archived_at = ?, expires_at = MIN(expires_at, ?) WHERE id = ?')->execute([now(), now(), $s['id']]);
}
function set_reopen(array $s, int $days): void {
    if ((int) $s['archived_at'] > 0) {
        $from = set_dir($s);
        $to = designs_dir(false) . '/' . $s['token'];
        if (is_dir($from)) @rename($from, $to);
    }
    $base = (int) $s['archived_at'] > 0 ? now() : max(now(), (int) $s['expires_at']);
    db()->prepare('UPDATE design_sets SET archived_at = 0, expires_at = ? WHERE id = ?')->execute([$base + $days * 86400, $s['id']]);
}
function set_delete(array $s): void {
    rrmdir_any(set_dir($s));
    rrmdir_any(designs_dir(!(int) $s['archived_at']) . '/' . $s['token']);
    db()->prepare('DELETE FROM design_files WHERE set_id = ?')->execute([$s['id']]);
    db()->prepare('DELETE FROM design_sets WHERE id = ?')->execute([$s['id']]);
}
function set_bytes(array $s): int {
    $st = db()->prepare('SELECT COALESCE(SUM(size),0) FROM design_files WHERE set_id = ?'); $st->execute([$s['id']]);
    return (int) $st->fetchColumn();
}
/* Archived over 30 days ago: what a purge would delete. */
function designs_old_archive(): array {
    designs_migrate();
    $st = db()->prepare('SELECT * FROM design_sets WHERE archived_at > 0 AND archived_at < ? ORDER BY archived_at');
    $st->execute([now() - DESIGN_PURGE_DAYS * 86400]);
    return $st->fetchAll();
}

/* Folders dropped by the "Publish designs" workflow: demo-data/inbox/<token>/. The workflow picks the token,
   so the link is known straight away; the folder is imported on the first request that needs it. */
/* The FTP upload lands in public_html/inbox/ on SiteGround; demo-data/inbox/ is checked too. */
function inbox_dirs(): array { return [SITE_ROOT . '/inbox', SITE_ROOT . '/demo-data/inbox']; }
function inbox_dir(?string $token = null): string {
    foreach (inbox_dirs() as $b) if ($token !== null && is_dir("$b/$token")) return $b;
    return inbox_dirs()[0];
}
function designs_pending(): void {
    foreach (inbox_dirs() as $base) {
    if (!is_dir($base)) continue;
    foreach (scandir($base) ?: [] as $t) {
        if (!preg_match('/^[A-Za-z0-9_-]{16,40}$/', $t) || !is_dir("$base/$t")) continue;
        if (filemtime("$base/$t") > time() - 30) continue; // may still be uploading
        try { designs_import($t); } catch (Throwable $e) {}
    }
    }
}
function designs_import(string $job): array {
    if (!preg_match('/^[A-Za-z0-9_-]{16,40}$/', $job)) throw new RuntimeException('Bad job.');
    $src = inbox_dir($job) . '/' . $job;
    if (!is_dir($src)) throw new RuntimeException('Nothing to import.');
    if (set_by_token($job)) throw new RuntimeException('Already imported.');
    $dir = $src . '.importing';
    if (!@rename($src, $dir)) throw new RuntimeException('Busy, try again.');
    $man = is_file("$dir/manifest.json") ? (json_decode((string) file_get_contents("$dir/manifest.json"), true) ?: []) : [];
    $designs = [];
    if (!empty($man['designs']) && is_array($man['designs'])) {
        foreach ($man['designs'] as $i => $d) {
            $files = [];
            foreach ((array) ($d['files'] ?? []) as $f) { $f = str_replace('\\', '/', (string) $f); if (strpos($f, '..') === false) $files[] = $f; }
            $designs[] = ['name' => (string) ($d['name'] ?? ('Design ' . ($i + 1))), 'files' => $files];
        }
    } else {
        $isImg = function ($f) { return isset(DESIGN_EXTS[strtolower(pathinfo($f, PATHINFO_EXTENSION))]); };
        $subs = array_values(array_filter(glob("$dir/*", GLOB_ONLYDIR) ?: [], 'is_dir'));
        sort($subs, SORT_NATURAL | SORT_FLAG_CASE);
        foreach ($subs as $sd) {
            $fs = array_values(array_filter(scandir($sd) ?: [], $isImg)); natcasesort($fs);
            if ($fs) $designs[] = ['name' => basename($sd), 'files' => array_map(function ($f) use ($sd, $dir) { return substr($sd, strlen($dir) + 1) . '/' . $f; }, array_values($fs))];
        }
        $top = array_values(array_filter(scandir($dir) ?: [], function ($f) use ($dir, $isImg) { return is_file("$dir/$f") && $isImg($f); }));
        natcasesort($top);
        if ($top) $designs[] = ['name' => 'Design ' . (count($designs) + 1), 'files' => array_values($top)];
    }
    if (!$designs) throw new RuntimeException('No pictures found.');
    try { $s = set_create((string) ($man['client'] ?? ''), (string) ($man['title'] ?? ''), (string) ($man['phone'] ?? ''), 'claude', $job); }
    catch (Throwable $e) { rrmdir_any($dir); throw $e; }
    $n = 0;
    foreach ($designs as $i => $d) {
        foreach ($d['files'] as $f) {
            $p = "$dir/$f";
            if (!is_file($p)) continue;
            set_add_file($s, $p, basename($f), $i, $d['name'], null, false);
            $n++;
        }
    }
    rrmdir_any($dir);
    if (!$n) { set_delete($s); throw new RuntimeException('No pictures found.'); }
    db()->prepare('UPDATE design_sets SET ready = 1 WHERE id = ?')->execute([$s['id']]);
    $s = set_by_id((int) $s['id']);
    $GLOBALS['DESIGNS_IMPORTED'][] = $s;
    return $s;
}

/* Shape of a delivery for the client page and admin. */
function set_public(array $s, string $base): array {
    $designs = [];
    foreach (set_files($s) as $f) {
        $d = (int) $f['design'];
        if (!isset($designs[$d])) $designs[$d] = ['name' => $f['dname'] !== '' ? $f['dname'] : 'Design ' . (count($designs) + 1), 'sizes' => []];
        $key = $f['kind'] . ':' . $f['w'] . 'x' . $f['h'];
        if (!isset($designs[$d]['sizes'][$key])) $designs[$d]['sizes'][$key] = ['kind' => $f['kind'], 'w' => (int) $f['w'], 'h' => (int) $f['h'], 'pages' => []];
        $designs[$d]['sizes'][$key]['pages'][] = [
            'id' => (int) $f['id'],
            'src' => $base . '&f=' . $f['id'],
            'prev' => $base . '&f=' . $f['id'] . ($f['prev'] !== '' ? '&p=1' : ''),
            'ext' => pathinfo($f['file'], PATHINFO_EXTENSION), 'mime' => $f['mime'], 'size' => (int) $f['size'],
        ];
    }
    $order = ['post' => 0, 'story' => 1, 'wide' => 2, 'other' => 3];
    $out = [];
    foreach ($designs as $d) {
        $sizes = array_values($d['sizes']);
        usort($sizes, function ($a, $b) use ($order) { return ($order[$a['kind']] <=> $order[$b['kind']]) ?: ($b['w'] * $b['h'] <=> $a['w'] * $a['h']); });
        $out[] = ['name' => $d['name'], 'sizes' => $sizes];
    }
    return $out;
}

/* Push "new designs ready" for anything imported during this request (call after the response). */
function designs_notify_imported(): void {
    if (empty($GLOBALS['DESIGNS_IMPORTED'])) return;
    require_once __DIR__ . '/push.php';
    foreach ($GLOBALS['DESIGNS_IMPORTED'] as $s)
        push_all('New designs ready', 'Designs for ' . ($s['client'] !== '' ? $s['client'] : ($s['title'] ?: 'a client')) . ' are ready to send.', '/demo-admin/#designs', 'design-' . $s['id']);
    $GLOBALS['DESIGNS_IMPORTED'] = [];
}
