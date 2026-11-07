<?php
/* SMR Digital Demo Manager: shared code. Not web accessible (.htaccess deny + this guard). */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }

/* Starting admin PIN (bcrypt). Once the owner changes it in Account, the stored one in the database is used instead. */
const ADMIN_PIN_HASH = '$2y$10$/Ox20Bw9b0Zh.LZRKN0EVO7PbGuNICoXK3zJ4qS5rP5OOICQrSnF.';
const VISITOR_COOKIE = 'smr_demo';
const ADMIN_COOKIE = 'smr_admin';
const DEFAULT_MINUTES = 45;
const WHATSAPP = '447931814538';
const MAIN_SITE = '/#digital';
const MAX_ZIP_BYTES = 200 * 1024 * 1024;     // uncompressed total
const MAX_ZIP_FILES = 6000;

define('SITE_ROOT', dirname(__DIR__));
define('SEED_DIR', SITE_ROOT . '/demo-data/seed');

date_default_timezone_set('Europe/London');

/* Private storage: outside the web root when the host allows it. Otherwise an unguessable folder
   inside demo-data (the host serves static files directly, so .htaccess alone is not enough). */
function private_dir(): string {
    static $dir = null;
    if ($dir !== null) return $dir;
    $outside = dirname(SITE_ROOT) . '/smr-demo-private';
    if ((is_dir($outside) || @mkdir($outside, 0750, true)) && is_writable($outside)) { $dir = $outside; return $dir; }
    $cfg = SITE_ROOT . '/demo-data/private-path.php';
    $name = is_file($cfg) ? (string) include $cfg : '';
    if (!preg_match('/^p-[a-f0-9]{32}$/', $name)) {
        $name = 'p-' . bin2hex(random_bytes(16));
        file_put_contents($cfg, "<?php\nif (!defined('SMR_DEMO')) { http_response_code(404); exit; }\nreturn '" . $name . "';\n");
    }
    $inside = SITE_ROOT . '/demo-data/' . $name;
    if (!is_dir($inside)) @mkdir($inside, 0750, true);
    if (!file_exists($inside . '/.htaccess')) @file_put_contents($inside . '/.htaccess', "Require all denied\n");
    $dir = $inside;
    return $dir;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $path = private_dir() . '/demo.sqlite';
    $pdo = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA foreign_keys = ON');
    migrate($pdo);
    sync_seeds($pdo);
    return $pdo;
}

function migrate(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS demos (
        id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, tagline TEXT DEFAULT '',
        description TEXT DEFAULT '', tips TEXT DEFAULT '', source TEXT NOT NULL DEFAULT 'upload',
        dir TEXT NOT NULL, icon TEXT DEFAULT '', thumb TEXT DEFAULT '', accent TEXT DEFAULT '#5b5bff',
        seed_version TEXT DEFAULT '', enabled INTEGER DEFAULT 1, sort INTEGER DEFAULT 100,
        created_at INTEGER, updated_at INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, pin TEXT NOT NULL, label TEXT DEFAULT '',
        apps TEXT NOT NULL, mode TEXT NOT NULL DEFAULT 'single', max_uses INTEGER DEFAULT 1, uses INTEGER DEFAULT 0,
        duration INTEGER NOT NULL DEFAULT 30, tips INTEGER DEFAULT 1, created_at INTEGER, activated_at INTEGER,
        expires_at INTEGER, revoked INTEGER DEFAULT 0)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY, link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
        created_at INTEGER, expires_at INTEGER, last_seen INTEGER, ua TEXT DEFAULT '')");
    $pdo->exec("CREATE TABLE IF NOT EXISTS attempts (k TEXT NOT NULL, at INTEGER NOT NULL)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS attempts_k ON attempts(k, at)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK (id = 1), pass_hash TEXT NOT NULL, created_at INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS admin_tokens (id TEXT PRIMARY KEY, csrf TEXT NOT NULL, created_at INTEGER, expires_at INTEGER)");
}

/* Demos shipped in the repo (demo-data/seed). A new seed version re-points the demo at the seed files. */
function sync_seeds(PDO $pdo): void {
    $file = SEED_DIR . '/seeds.php';
    if (!is_file($file)) return;
    $stamp = (string) filemtime($file) . ':' . filesize($file);
    $flag = private_dir() . '/.seeds-synced';
    if (is_file($flag) && trim((string) file_get_contents($flag)) === $stamp) return;
    $seeds = include $file;
    if (!is_array($seeds)) return;
    $now = time();
    foreach ($seeds as $i => $s) {
        $row = $pdo->prepare('SELECT * FROM demos WHERE slug = ?');
        $row->execute([$s['slug']]);
        $d = $row->fetch();
        if (!$d) {
            $pdo->prepare('INSERT INTO demos (slug,name,tagline,description,tips,source,dir,icon,accent,seed_version,enabled,sort,created_at,updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?,?)')->execute([
                $s['slug'], $s['name'], $s['tagline'] ?? '', $s['description'] ?? '', implode("\n", $s['tips'] ?? []), 'seed',
                'seed:' . $s['slug'], 'seed:' . $s['slug'], $s['accent'] ?? '#5b5bff', $s['version'] ?? '1', ($i + 1) * 10, $now, $now]);
        } elseif (($d['seed_version'] ?? '') !== ($s['version'] ?? '1')) {
            // Newer files pushed from chat: point the demo back at the seed files (text the admin edited stays).
            // New version pushed from chat: new files and the shipped text (name, tour, etc.).
            $pdo->prepare("UPDATE demos SET dir = ?, source = 'seed', seed_version = ?, updated_at = ?,
                icon = CASE WHEN icon LIKE 'up:%' THEN icon ELSE ? END,
                name = ?, tagline = ?, description = ?, tips = ?, accent = ?, sort = ? WHERE id = ?")
                ->execute(['seed:' . $s['slug'], $s['version'] ?? '1', $now, 'seed:' . $s['slug'],
                    $s['name'], $s['tagline'] ?? '', $s['description'] ?? '', implode("\n", $s['tips'] ?? []), $s['accent'] ?? '#5b5bff', ($i + 1) * 10, $d['id']]);
        }
    }
    @file_put_contents($flag, $stamp);
}

/* ---------- helpers ---------- */
function now(): int { return time(); }
function is_https(): bool {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') == 443);
}
function same_origin(): bool {
    $o = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($o === '') return true;
    $u = parse_url($o);
    $host = ($u['host'] ?? '') . (isset($u['port']) ? ':' . $u['port'] : '');
    return strcasecmp($host, (string) ($_SERVER['HTTP_HOST'] ?? '')) === 0;
}
function client_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }
function rand_token(int $bytes = 24): string { return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '='); }
function new_pin(): string { return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT); }
function h($s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }

function set_cookie(string $name, string $value, int $expires, string $path, string $samesite): void {
    setcookie($name, $value, ['expires' => $expires, 'path' => $path, 'secure' => is_https(), 'httponly' => true, 'samesite' => $samesite]);
}

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function security_headers(bool $page = true): void {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cross-Origin-Opener-Policy: same-origin');
    if ($page) {
        header('X-Frame-Options: DENY');
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
    }
}

/* Rate limiting on failed attempts. */
function too_many(string $key, int $max, int $window): bool {
    $st = db()->prepare('SELECT COUNT(*) FROM attempts WHERE k = ? AND at > ?');
    $st->execute([$key, now() - $window]);
    return (int) $st->fetchColumn() >= $max;
}
function note_fail(string $key): void {
    db()->prepare('INSERT INTO attempts (k, at) VALUES (?, ?)')->execute([$key, now()]);
    if (random_int(1, 50) === 1) db()->prepare('DELETE FROM attempts WHERE at < ?')->execute([now() - 86400]);
}

/* ---------- demos ---------- */
function demo_by_slug(string $slug): ?array {
    $st = db()->prepare('SELECT * FROM demos WHERE slug = ?');
    $st->execute([$slug]);
    return $st->fetch() ?: null;
}
/* Seed demos ship as demo-data/seed/<slug>.pack.php (exits if requested, then a ZIP).
   They are unpacked once per version into private storage and served from there. */
function seed_cache(string $slug, string $version): ?string {
    $safeV = preg_replace('/[^A-Za-z0-9._-]/', '_', $version !== '' ? $version : '1');
    $base = private_dir() . '/seed/' . $slug;
    $dir = $base . '/' . $safeV;
    if (is_file($dir . '/app/index.html')) return $dir;
    $pack = SEED_DIR . '/' . $slug . '.pack.php';
    if (!is_file($pack) || !class_exists('ZipArchive')) return null;
    $lock = fopen(private_dir() . '/.unpack.lock', 'c');
    flock($lock, LOCK_EX);
    try {
        if (is_file($dir . '/app/index.html')) return $dir;
        $raw = (string) file_get_contents($pack);
        $at = strpos($raw, '__halt_compiler();');
        if ($at === false) return null;
        if (!is_dir($base)) @mkdir($base, 0750, true);
        $tmpZip = $base . '/.tmp-' . bin2hex(random_bytes(4)) . '.zip';
        file_put_contents($tmpZip, substr($raw, $at + strlen('__halt_compiler();')));
        unset($raw);
        $tmpDir = $base . '/.tmp-' . bin2hex(random_bytes(4));
        $z = new ZipArchive();
        $ok = $z->open($tmpZip) === true;
        if ($ok) {
            for ($i = 0; $i < $z->numFiles; $i++) {
                $n = (string) $z->getNameIndex($i);
                if ($n === '' || $n[0] === '/' || preg_match('#(^|/)\.\.(/|$)#', $n)) { $ok = false; break; }
            }
            $ok = $ok && $z->extractTo($tmpDir);
            $z->close();
        }
        @unlink($tmpZip);
        if (!$ok || !is_file($tmpDir . '/app/index.html')) { rrmdir_any($tmpDir); return null; }
        foreach (glob($base . '/*', GLOB_ONLYDIR) ?: [] as $old) rrmdir_any($old); // older versions
        rename($tmpDir, $dir);
        return $dir;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
function rrmdir_any(string $dir): void {
    if (!is_dir($dir)) return;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($it as $f) { $f->isDir() && !$f->isLink() ? @rmdir($f->getPathname()) : @unlink($f->getPathname()); }
    @rmdir($dir);
}
function demo_root(array $d): ?string {
    [$kind, $rel] = array_pad(explode(':', $d['dir'], 2), 2, '');
    if ($kind === 'seed') {
        $c = seed_cache($rel, (string) $d['seed_version']);
        $path = $c ? realpath($c . '/app') : false;
    } else {
        $path = realpath(private_dir() . '/uploads/' . $rel);
    }
    return $path && is_dir($path) ? $path : null;
}
function demo_icon_path(array $d): ?string {
    if (!$d['icon']) return null;
    [$kind, $rel] = array_pad(explode(':', $d['icon'], 2), 2, '');
    if ($kind === 'seed') {
        $c = seed_cache($d['slug'], (string) $d['seed_version']);
        $p = $c ? realpath($c . '/icon.webp') : false;
    } else {
        $p = realpath(private_dir() . '/media/' . basename($rel));
    }
    return $p && is_file($p) ? $p : null;
}
function demo_public(array $d): array {
    return ['slug' => $d['slug'], 'name' => $d['name'], 'tagline' => $d['tagline'], 'description' => $d['description'],
        'tips' => array_values(array_filter(array_map('trim', explode("\n", (string) $d['tips'])))), 'accent' => $d['accent'],
        'icon' => '/demo/icon.php?s=' . rawurlencode($d['slug']) . '&v=' . (int) $d['updated_at']];
}

/* ---------- links & visitor sessions ---------- */
function link_apps(array $l): array { return json_decode($l['apps'], true) ?: []; }

/* Expiry timestamp that applies to one visitor session (server is the only source of truth). */
function session_expiry(array $l, array $s): int {
    return $l['mode'] === 'shared' ? (int) $l['expires_at'] : (int) $s['expires_at'];
}

function link_by_token(string $token): ?array {
    if (!preg_match('/^[A-Za-z0-9_-]{16,64}$/', $token)) return null;
    $st = db()->prepare('SELECT * FROM links WHERE token = ?');
    $st->execute([$token]);
    return $st->fetch() ?: null;
}

/* Returns [link, session] for the visitor cookie, or null. Does not check expiry. */
function visitor_session(): ?array {
    $raw = $_COOKIE[VISITOR_COOKIE] ?? '';
    if (!preg_match('/^[A-Za-z0-9_-]{30,64}$/', $raw)) return null;
    $id = hash('sha256', $raw);
    $st = db()->prepare('SELECT s.*, l.id AS lid FROM sessions s JOIN links l ON l.id = s.link_id WHERE s.id = ?');
    $st->execute([$id]);
    $s = $st->fetch();
    if (!$s) return null;
    $st = db()->prepare('SELECT * FROM links WHERE id = ?');
    $st->execute([$s['link_id']]);
    $l = $st->fetch();
    return $l ? [$l, $s] : null;
}

/* 'ok' | 'expired' | 'revoked' */
function session_state(array $l, array $s): string {
    if ((int) $l['revoked']) return 'revoked';
    return session_expiry($l, $s) > now() ? 'ok' : 'expired';
}

/* Admin: overall status of a link. */
function link_status(array $l): array {
    $now = now();
    if ((int) $l['revoked']) return ['revoked', 0];
    if (!$l['activated_at']) return ['not_activated', 0];
    if ($l['mode'] === 'shared') {
        $left = max(0, (int) $l['expires_at'] - $now);
        return [$left > 0 ? 'active' : 'expired', $left];
    }
    $st = db()->prepare('SELECT MAX(expires_at) FROM sessions WHERE link_id = ?');
    $st->execute([$l['id']]);
    $max = (int) $st->fetchColumn();
    $left = max(0, $max - $now);
    if ($left > 0) return ['active', $left];
    if ((int) $l['uses'] < (int) $l['max_uses']) return ['uses_left', 0];
    return ['expired', 0];
}

/* ---------- admin auth ---------- */
function admin_hash(): string {
    // Passwords set with the old setup code (before the PIN switch) are ignored.
    $h = db()->query('SELECT pass_hash FROM admin WHERE id = 1 AND created_at > 1794063536')->fetchColumn();
    return $h ? (string) $h : ADMIN_PIN_HASH;
}
function admin_token(): ?array {
    $raw = $_COOKIE[ADMIN_COOKIE] ?? '';
    if (!preg_match('/^[A-Za-z0-9_-]{30,64}$/', $raw)) return null;
    $st = db()->prepare('SELECT * FROM admin_tokens WHERE id = ? AND expires_at > ?');
    $st->execute([hash('sha256', $raw), now()]);
    return $st->fetch() ?: null;
}
function admin_login_cookie(): array {
    $raw = rand_token(32);
    $csrf = rand_token(24);
    $exp = now() + 30 * 86400;
    db()->prepare('INSERT INTO admin_tokens (id, csrf, created_at, expires_at) VALUES (?,?,?,?)')->execute([hash('sha256', $raw), $csrf, now(), $exp]);
    db()->prepare('DELETE FROM admin_tokens WHERE expires_at < ?')->execute([now()]);
    set_cookie(ADMIN_COOKIE, $raw, $exp, '/', 'Strict');
    return ['csrf' => $csrf];
}

/* Files the gate will serve, and how. Anything else is refused. */
function mime_for(string $path): ?string {
    static $map = [
        'html' => 'text/html; charset=utf-8', 'htm' => 'text/html; charset=utf-8', 'css' => 'text/css; charset=utf-8',
        'js' => 'text/javascript; charset=utf-8', 'mjs' => 'text/javascript; charset=utf-8', 'json' => 'application/json',
        'webmanifest' => 'application/manifest+json', 'txt' => 'text/plain; charset=utf-8', 'xml' => 'application/xml',
        'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'gif' => 'image/gif', 'webp' => 'image/webp',
        'avif' => 'image/avif', 'svg' => 'image/svg+xml', 'ico' => 'image/x-icon', 'bmp' => 'image/bmp',
        'woff' => 'font/woff', 'woff2' => 'font/woff2', 'ttf' => 'font/ttf', 'otf' => 'font/otf',
        'mp4' => 'video/mp4', 'webm' => 'video/webm', 'mp3' => 'audio/mpeg', 'wav' => 'audio/wav', 'ogg' => 'audio/ogg', 'm4a' => 'audio/mp4',
        'wasm' => 'application/wasm', 'bin' => 'application/octet-stream', 'frag' => 'text/plain', 'vert' => 'text/plain',
        'otf2' => 'font/otf', 'pdf' => 'application/pdf', 'csv' => 'text/csv',
    ];
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    return $map[$ext] ?? null;
}
