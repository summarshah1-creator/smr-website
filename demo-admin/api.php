<?php
/* Demo Manager admin API. Every action except setup/login needs the admin cookie + CSRF header. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(false);

$a = $_GET['a'] ?? '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_out(['error' => 'POST only'], 405);
if (!same_origin()) json_out(['error' => 'Bad origin'], 403);
$isJson = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === 0;
$in = $isJson ? (json_decode((string) file_get_contents('php://input'), true) ?: []) : $_POST;
$ipKey = 'admin:' . hash('sha256', client_ip());

/* ---------- setup & login ---------- */
if ($a === 'setup') {
    if (admin_exists()) json_out(['error' => 'The admin password is already set. Please log in.'], 409);
    if (too_many($ipKey, 6, 900)) json_out(['error' => 'Too many attempts. Wait 15 minutes.'], 429);
    $code = strtoupper(trim((string) ($in['code'] ?? '')));
    if (!hash_equals(SETUP_CODE_SHA256, hash('sha256', $code))) { note_fail($ipKey); json_out(['error' => 'That setup code is not right.'], 403); }
    $pw = (string) ($in['password'] ?? '');
    if (strlen($pw) < 10) json_out(['error' => 'Use at least 10 characters for the password.'], 400);
    db()->prepare('INSERT INTO admin (id, pass_hash, created_at) VALUES (1, ?, ?)')->execute([password_hash($pw, PASSWORD_DEFAULT), now()]);
    json_out(['ok' => true] + admin_login_cookie());
}
if ($a === 'login') {
    if (too_many($ipKey, 6, 900)) json_out(['error' => 'Too many attempts. Wait 15 minutes.'], 429);
    $hash = db()->query('SELECT pass_hash FROM admin WHERE id = 1')->fetchColumn();
    if (!$hash || !password_verify((string) ($in['password'] ?? ''), $hash)) { note_fail($ipKey); usleep(400000); json_out(['error' => 'Wrong password.'], 403); }
    json_out(['ok' => true] + admin_login_cookie());
}

$tok = admin_token();
if (!$tok) json_out(['error' => 'Please log in again.', 'login' => true], 401);
if (!hash_equals($tok['csrf'], (string) ($_SERVER['HTTP_X_CSRF'] ?? ''))) json_out(['error' => 'Please reload the page.'], 403);

/* ---------- helpers ---------- */
function link_url(string $token): string {
    $host = preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'));
    $host = preg_replace('/^www\./', '', $host);
    $local = preg_match('/^(127\.|localhost)/', $host);
    return ($local ? 'http' : 'https') . '://' . $host . '/demo/?k=' . rawurlencode($token);
}
function link_row(array $l): array {
    [$status, $left] = link_status($l);
    $max = $l['mode'] === 'single' ? 1 : ($l['mode'] === 'limited' ? (int) $l['max_uses'] : null);
    $expiry = 0;
    if ($l['mode'] === 'shared') $expiry = (int) $l['expires_at'];
    else {
        $st = db()->prepare('SELECT MAX(expires_at) FROM sessions WHERE link_id = ?');
        $st->execute([$l['id']]);
        $expiry = (int) $st->fetchColumn();
    }
    return ['id' => (int) $l['id'], 'label' => $l['label'], 'url' => link_url($l['token']), 'pin' => $l['pin'], 'apps' => link_apps($l),
        'mode' => $l['mode'], 'max_uses' => $max, 'uses' => (int) $l['uses'], 'duration' => (int) $l['duration'], 'tips' => (int) $l['tips'],
        'created_at' => (int) $l['created_at'], 'activated_at' => (int) $l['activated_at'], 'expires_at' => $expiry,
        'status' => $status, 'left' => $left];
}
function get_link(array $in): array {
    $st = db()->prepare('SELECT * FROM links WHERE id = ?');
    $st->execute([(int) ($in['id'] ?? 0)]);
    $l = $st->fetch();
    if (!$l) json_out(['error' => 'Link not found.'], 404);
    return $l;
}
function slugify(string $s): string {
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $s), '-'));
    return substr($s !== '' ? $s : 'demo', 0, 32);
}
function rrmdir(string $dir): void {
    if (!is_dir($dir)) return;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($it as $f) { $f->isDir() && !$f->isLink() ? @rmdir($f->getPathname()) : @unlink($f->getPathname()); }
    @rmdir($dir);
}
function upload_error(array $f): ?string {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) return null;
    $e = $f['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($e === UPLOAD_ERR_INI_SIZE || $e === UPLOAD_ERR_FORM_SIZE) return 'That file is bigger than the server allows (' . ini_get('upload_max_filesize') . ').';
    if ($e === UPLOAD_ERR_NO_FILE) return 'Choose a file first.';
    return 'The upload did not finish. Please try again.';
}

/* Safely unpack a deployable web build. The folder holding the shallowest index.html becomes the app root. */
function extract_build(string $zipPath, string $dest): array {
    if (!class_exists('ZipArchive')) throw new RuntimeException('ZIP support is not enabled on this server.');
    $z = new ZipArchive();
    if ($z->open($zipPath) !== true) throw new RuntimeException('That file is not a valid ZIP.');
    if ($z->numFiles > MAX_ZIP_FILES) throw new RuntimeException('The ZIP has too many files.');
    $danger = '/\.(php\d?|phtml|phar|pht|cgi|pl|py|sh|bash|asp|aspx|jsp|shtml|htaccess|htpasswd|ini|exe|dll|so|bat|cmd)$/i';
    $entries = []; $index = null; $declared = 0;
    for ($i = 0; $i < $z->numFiles; $i++) {
        $st = $z->statIndex($i);
        $name = str_replace('\\', '/', $st['name']);
        if ($name === '' || substr($name, -1) === '/') continue;
        if (strpos($name, '__MACOSX/') === 0 || basename($name) === '.DS_Store') continue;
        if ($name[0] === '/' || strpos($name, ':') !== false || preg_match('#(^|/)\.\.(/|$)#', $name) || strpos($name, "\0") !== false) {
            throw new RuntimeException('The ZIP contains an unsafe file path.');
        }
        if ($z->getExternalAttributesIndex($i, $os, $attr) && $os === ZipArchive::OPSYS_UNIX && ((($attr >> 16) & 0170000) === 0120000)) {
            throw new RuntimeException('The ZIP contains a symbolic link, which is not allowed.');
        }
        if (preg_match($danger, $name) || preg_match('#(^|/)\.ht#i', $name)) throw new RuntimeException('The ZIP contains a server file (' . basename($name) . '). Only built website files are allowed.');
        $declared += (int) $st['size'];
        if ($declared > MAX_ZIP_BYTES) throw new RuntimeException('The unpacked app is too large.');
        $entries[$i] = $name;
        if (strtolower(basename($name)) === 'index.html') {
            $depth = substr_count($name, '/');
            if ($index === null || $depth < substr_count($index, '/')) $index = $name;
        }
    }
    if ($index === null) throw new RuntimeException('No index.html found. Upload the built web folder (for Flutter: build/web).');
    $prefix = strpos($index, '/') === false ? '' : substr($index, 0, strrpos($index, '/') + 1);
    if (!@mkdir($dest, 0750, true) && !is_dir($dest)) throw new RuntimeException('Could not create the demo folder.');
    $written = 0; $count = 0; $skipped = [];
    foreach ($entries as $i => $name) {
        if ($prefix !== '' && strpos($name, $prefix) !== 0) { $skipped[] = $name; continue; }
        $rel = substr($name, strlen($prefix));
        $segs = explode('/', $rel);
        $hidden = false;
        foreach ($segs as $sg) if ($sg === '' || $sg[0] === '.') $hidden = true;
        $base = strtolower(basename($rel));
        if ($hidden || !mime_for($rel) || preg_match('/\.map$/', $base) || in_array($base, ['sw.js', 'service-worker.js', 'flutter_service_worker.js'], true)) { $skipped[] = $rel; continue; }
        $target = $dest . '/' . $rel;
        if (!is_dir(dirname($target)) && !@mkdir(dirname($target), 0750, true)) throw new RuntimeException('Could not write ' . $rel);
        $in = $z->getStream($z->getNameIndex($i));
        $out = fopen($target, 'wb');
        if (!$in || !$out) throw new RuntimeException('Could not unpack ' . $rel);
        while (!feof($in)) {
            $buf = fread($in, 65536);
            $written += strlen($buf);
            if ($written > MAX_ZIP_BYTES) { fclose($in); fclose($out); throw new RuntimeException('The unpacked app is too large.'); }
            fwrite($out, $buf);
        }
        fclose($in); fclose($out);
        $count++;
    }
    $z->close();
    if (!is_file($dest . '/index.html')) throw new RuntimeException('No index.html at the top of the app.');
    return ['files' => $count, 'skipped' => count($skipped)];
}

/* ---------- actions ---------- */
switch ($a) {
case 'logout':
    db()->prepare('DELETE FROM admin_tokens WHERE id = ?')->execute([$tok['id']]);
    set_cookie(ADMIN_COOKIE, '', 1, '/', 'Strict');
    json_out(['ok' => true]);

case 'password':
    $hash = db()->query('SELECT pass_hash FROM admin WHERE id = 1')->fetchColumn();
    if (!password_verify((string) ($in['current'] ?? ''), $hash)) json_out(['error' => 'Your current password is not right.'], 403);
    if (strlen((string) ($in['new'] ?? '')) < 10) json_out(['error' => 'Use at least 10 characters.'], 400);
    db()->prepare('UPDATE admin SET pass_hash = ? WHERE id = 1')->execute([password_hash((string) $in['new'], PASSWORD_DEFAULT)]);
    db()->prepare('DELETE FROM admin_tokens WHERE id != ?')->execute([$tok['id']]);
    json_out(['ok' => true]);

case 'list':
    $demos = [];
    foreach (db()->query('SELECT * FROM demos ORDER BY sort, name') as $d) {
        $demos[] = demo_public($d) + ['enabled' => (int) $d['enabled'], 'sort' => (int) $d['sort'], 'source' => $d['source'],
            'tips_text' => $d['tips'], 'files_ok' => demo_root($d) !== null, 'updated_at' => (int) $d['updated_at']];
    }
    $links = [];
    foreach (db()->query('SELECT * FROM links ORDER BY id DESC LIMIT 300') as $l) $links[] = link_row($l);
    json_out(['demos' => $demos, 'links' => $links, 'now' => now(), 'storage' => strpos(private_dir(), SITE_ROOT) === 0 ? 'inside' : 'outside']);

case 'link_create':
    $apps = array_values(array_unique(array_filter(array_map('strval', (array) ($in['apps'] ?? [])), function ($s) { return (bool) demo_by_slug($s); })));
    if (!$apps) json_out(['error' => 'Choose at least one demo.'], 400);
    $mode = in_array($in['mode'] ?? '', ['single', 'shared', 'limited'], true) ? $in['mode'] : 'single';
    $max = $mode === 'limited' ? max(2, min(500, (int) ($in['max_uses'] ?? 3))) : ($mode === 'single' ? 1 : 0);
    $dur = max(5, min(7 * 24 * 60, (int) ($in['duration'] ?? DEFAULT_MINUTES)));
    $token = rand_token(18);
    db()->prepare('INSERT INTO links (token, pin, label, apps, mode, max_uses, uses, duration, tips, created_at) VALUES (?,?,?,?,?,?,0,?,?,?)')
        ->execute([$token, new_pin(), mb_substr(trim((string) ($in['label'] ?? '')), 0, 80), json_encode($apps), $mode, $max, $dur, !empty($in['tips']) ? 1 : 0, now()]);
    json_out(['ok' => true, 'link' => link_row(get_link(['id' => db()->lastInsertId()]))]);

case 'link_revoke':
    $l = get_link($in);
    db()->prepare('UPDATE links SET revoked = 1 WHERE id = ?')->execute([$l['id']]);
    json_out(['ok' => true, 'link' => link_row(get_link($in))]);

case 'link_extend':
    $l = get_link($in);
    $mins = max(1, min(24 * 60, (int) ($in['minutes'] ?? 15)));
    $add = $mins * 60; $now = now();
    if ($l['mode'] === 'shared') {
        if ($l['activated_at']) db()->prepare('UPDATE links SET expires_at = MAX(expires_at, ?) + ?, revoked = 0 WHERE id = ?')->execute([$now, $add, $l['id']]);
        else db()->prepare('UPDATE links SET duration = duration + ?, revoked = 0 WHERE id = ?')->execute([$mins, $l['id']]);
    } else {
        $n = db()->prepare('SELECT COUNT(*) FROM sessions WHERE link_id = ?');
        $n->execute([$l['id']]);
        if ((int) $n->fetchColumn()) db()->prepare('UPDATE sessions SET expires_at = MAX(expires_at, ?) + ? WHERE link_id = ?')->execute([$now, $add, $l['id']]);
        else db()->prepare('UPDATE links SET duration = duration + ? WHERE id = ?')->execute([$mins, $l['id']]);
        db()->prepare('UPDATE links SET revoked = 0 WHERE id = ?')->execute([$l['id']]);
    }
    json_out(['ok' => true, 'link' => link_row(get_link($in))]);

case 'link_newpin':
    $l = get_link($in);
    db()->prepare('DELETE FROM sessions WHERE link_id = ?')->execute([$l['id']]);
    db()->prepare('UPDATE links SET pin = ?, uses = 0, activated_at = NULL, expires_at = NULL, revoked = 0 WHERE id = ?')->execute([new_pin(), $l['id']]);
    json_out(['ok' => true, 'link' => link_row(get_link($in))]);

case 'link_delete':
    $l = get_link($in);
    db()->prepare('DELETE FROM links WHERE id = ?')->execute([$l['id']]);
    json_out(['ok' => true]);

case 'demo_save':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    $accent = preg_match('/^#[0-9a-fA-F]{6}$/', (string) ($in['accent'] ?? '')) ? $in['accent'] : $d['accent'];
    db()->prepare('UPDATE demos SET name = ?, tagline = ?, description = ?, tips = ?, accent = ?, enabled = ?, sort = ?, updated_at = ? WHERE id = ?')->execute([
        mb_substr(trim((string) ($in['name'] ?? $d['name'])), 0, 60) ?: $d['name'],
        mb_substr(trim((string) ($in['tagline'] ?? $d['tagline'])), 0, 90),
        mb_substr(trim((string) ($in['description'] ?? $d['description'])), 0, 400),
        mb_substr(trim(str_replace("\r", '', (string) ($in['tips'] ?? $d['tips']))), 0, 1500),
        $accent, isset($in['enabled']) ? (int) (bool) $in['enabled'] : (int) $d['enabled'],
        isset($in['sort']) ? (int) $in['sort'] : (int) $d['sort'], now(), $d['id']]);
    json_out(['ok' => true]);

case 'demo_upload':
    $f = $_FILES['zip'] ?? [];
    if ($err = upload_error($f)) json_out(['error' => $err], 400);
    $existing = !empty($in['slug']) ? demo_by_slug((string) $in['slug']) : null;
    if (!empty($in['slug']) && !$existing) json_out(['error' => 'Demo not found.'], 404);
    if ($existing) { $slug = $existing['slug']; }
    else {
        $name = trim((string) ($in['name'] ?? ''));
        if ($name === '') json_out(['error' => 'Give the demo a name.'], 400);
        $slug = $base = slugify($name); $n = 2;
        while (demo_by_slug($slug)) $slug = $base . '-' . $n++;
    }
    $folder = $slug . '-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3));
    $dest = private_dir() . '/uploads/' . $folder;
    try { $res = extract_build($f['tmp_name'], $dest); }
    catch (Throwable $e) { rrmdir($dest); json_out(['error' => $e->getMessage()], 400); }
    if ($existing) {
        db()->prepare("UPDATE demos SET dir = ?, source = 'upload', updated_at = ? WHERE id = ?")->execute(['up:' . $folder, now(), $existing['id']]);
        if (strpos($existing['dir'], 'up:') === 0) rrmdir(private_dir() . '/uploads/' . substr($existing['dir'], 3));
    } else {
        $sort = (int) db()->query('SELECT COALESCE(MAX(sort), 0) + 10 FROM demos')->fetchColumn();
        db()->prepare("INSERT INTO demos (slug, name, tagline, description, tips, source, dir, icon, accent, enabled, sort, created_at, updated_at)
            VALUES (?, ?, ?, ?, '', 'upload', ?, '', '#5b5bff', 1, ?, ?, ?)")
            ->execute([$slug, mb_substr($name, 0, 60), mb_substr(trim((string) ($in['tagline'] ?? '')), 0, 90), '', 'up:' . $folder, $sort, now(), now()]);
    }
    json_out(['ok' => true, 'slug' => $slug] + $res);

case 'demo_icon':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    $f = $_FILES['icon'] ?? [];
    if ($err = upload_error($f)) json_out(['error' => $err], 400);
    if ($f['size'] > 3 * 1024 * 1024) json_out(['error' => 'Use an image under 3 MB.'], 400);
    $info = @getimagesize($f['tmp_name']);
    $ext = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
    if (!$ext) json_out(['error' => 'Use a PNG, JPG or WebP image.'], 400);
    $dir = private_dir() . '/media';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $name = $d['slug'] . '-' . time() . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) json_out(['error' => 'Could not save the icon.'], 500);
    if (strpos($d['icon'], 'up:') === 0) @unlink($dir . '/' . basename(substr($d['icon'], 3)));
    db()->prepare('UPDATE demos SET icon = ?, updated_at = ? WHERE id = ?')->execute(['up:' . $name, now(), $d['id']]);
    json_out(['ok' => true]);

case 'demo_delete':
    $d = demo_by_slug((string) ($in['slug'] ?? ''));
    if (!$d) json_out(['error' => 'Demo not found.'], 404);
    $seed = is_file(SEED_DIR . '/' . $d['slug'] . '.pack.php');
    if ($seed) {
        // Demos that ship with the website can only be hidden (they would come back on the next update).
        db()->prepare("UPDATE demos SET enabled = 0, updated_at = ? WHERE id = ?")->execute([now(), $d['id']]);
        if (strpos($d['dir'], 'up:') === 0) {
            rrmdir(private_dir() . '/uploads/' . substr($d['dir'], 3));
            db()->prepare("UPDATE demos SET dir = ?, source = 'seed' WHERE id = ?")->execute(['seed:' . $d['slug'], $d['id']]);
        }
        json_out(['ok' => true, 'hidden' => true]);
    }
    if (strpos($d['dir'], 'up:') === 0) rrmdir(private_dir() . '/uploads/' . substr($d['dir'], 3));
    if (strpos($d['icon'], 'up:') === 0) @unlink(private_dir() . '/media/' . basename(substr($d['icon'], 3)));
    db()->prepare('DELETE FROM demos WHERE id = ?')->execute([$d['id']]);
    json_out(['ok' => true]);
}

json_out(['error' => 'Unknown action'], 404);
