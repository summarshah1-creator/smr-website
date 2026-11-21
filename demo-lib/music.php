<?php
/* SMR Music: shared code for the music player (/music/). Tracks live in private storage, the list in the shared database. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';

const MUSIC_MAX = 120 * 1024 * 1024;   // largest audio file (bytes)
const MUSIC_ART_MAX = 8 * 1024 * 1024;
const MUSIC_AUDIO = ['mp3' => 'audio/mpeg', 'm4a' => 'audio/mp4', 'aac' => 'audio/aac', 'wav' => 'audio/wav',
    'flac' => 'audio/flac', 'ogg' => 'audio/ogg', 'oga' => 'audio/ogg', 'opus' => 'audio/ogg', 'webm' => 'audio/webm'];
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
        $done = true;
    }
    return $pdo;
}
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
    return ['title' => (string) ($s['title'] ?? 'SMR Music'), 'sub' => (string) ($s['sub'] ?? 'Original tracks by SMR'),
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
        'art' => $t['art'] !== '' ? 'api.php?a=art&id=' . $t['code'] . '&v=' . $t['updated_at'] : '',
        'src' => 'api.php?a=play&id=' . $t['code'] . '&v=' . $t['updated_at'],
        'lyrics' => $t['lyrics'], 'download' => (bool) $t['download'] || $s['download_all'], 'ext' => $t['ext']];
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
