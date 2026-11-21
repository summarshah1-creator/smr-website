<?php
/* SMR Music API. Public: list, play (Range), art, dl (only when downloads are on). Owner (SMR Admin cookie + CSRF): upload, edit, delete, order, settings. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/music.php';
header('X-Robots-Tag: noindex, nofollow');

$a = (string) ($_GET['a'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$tok = admin_token();
$owner = $tok !== null;
// The public page (/player) always asks as a visitor, so the owner sees exactly what everyone sees; the tools live in SMR Admin → Music (/music/?manage=1).
$asVisitor = ($_GET['view'] ?? '') === 'public';

/* ---------- public ---------- */
if ($a === 'list') {
    if (random_int(1, 20) === 1) music_sweep();
    $rows = music_db()->query('SELECT * FROM music_tracks WHERE ready = 1 ORDER BY sort ASC, id DESC')->fetchAll();
    $out = [];
    // Hidden tracks are private: left off the list, but anyone with the track's own link (/player/<slug>) gets that one.
    $want = strtolower((string) ($_GET['t'] ?? ''));
    $own = $owner && !$asVisitor;
    foreach ($rows as $t) { if ($t['hidden'] && !$own && ($want === '' || $t['slug'] !== $want)) continue; $out[] = music_public($t, $own); }
    $res = ['tracks' => $out, 'settings' => music_settings(), 'owner' => $own];
    if ($own) $res['csrf'] = $tok['csrf'];
    json_out($res);
}
if (($a === 'play' || $a === 'dl') && $method !== 'POST') {
    $t = music_track((string) ($_GET['id'] ?? ''));
    if (!$t || !$t['ready']) { http_response_code(404); exit; } // hidden tracks still play for people with the private link (codes can't be guessed)
    $path = music_dir($t['code']) . '/audio.' . $t['ext'];
    if (!is_file($path)) { http_response_code(404); exit; }
    if ($a === 'dl') {
        $allowed = $owner || (int) $t['download'] === 1 || music_settings()['download_all'];
        if (!$allowed) { http_response_code(403); exit; }
        $name = trim(($t['artist'] !== '' ? $t['artist'] . ' - ' : '') . ($t['title'] ?: 'track')) . '.' . $t['ext'];
        music_send($path, MUSIC_AUDIO[$t['ext']] ?? 'application/octet-stream', $name);
    }
    music_send($path, MUSIC_AUDIO[$t['ext']] ?? 'application/octet-stream');
}
if ($a === 'art' && $method !== 'POST') {
    $t = music_track((string) ($_GET['id'] ?? ''));
    if (!$t || $t['art'] === '') { http_response_code(404); exit; }
    $path = music_dir($t['code']) . '/art.' . $t['art'];
    if (!is_file($path)) { http_response_code(404); exit; }
    header('Cache-Control: public, max-age=604800');
    music_send($path, MUSIC_ART[$t['art']] ?? 'image/jpeg');
}
if ($a === 'played' && $method === 'POST') {
    if (!same_origin()) json_out(['error' => 'Bad origin'], 403);
    $key = 'music:' . hash('sha256', client_ip());
    if (!too_many($key, 120, 3600)) {
        note_fail($key);
        music_db()->prepare('UPDATE music_tracks SET plays = plays + 1 WHERE code = ?')->execute([(string) ($_GET['id'] ?? '')]);
    }
    json_out(['ok' => true]);
}

/* ---------- owner ---------- */
if ($method !== 'POST') json_out(['error' => 'Not found'], 404);
if (!same_origin()) json_out(['error' => 'Bad origin'], 403);
if (!$owner) json_out(['error' => 'Log in to SMR Admin first.', 'login' => true], 401);
if (!hash_equals($tok['csrf'], (string) ($_SERVER['HTTP_X_CSRF'] ?? ''))) json_out(['error' => 'Please reload the page.'], 403);
$isJson = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === 0;
$in = $isJson ? (json_decode((string) file_get_contents('php://input'), true) ?: []) : $_POST;

function meta_from(array $in): array {
    return ['title' => music_clean((string) ($in['title'] ?? ''), 200), 'artist' => music_clean((string) ($in['artist'] ?? ''), 200),
        'album' => music_clean((string) ($in['album'] ?? ''), 200), 'year' => music_clean((string) ($in['year'] ?? ''), 10),
        'genre' => music_clean((string) ($in['genre'] ?? ''), 60), 'track_no' => music_clean((string) ($in['track'] ?? ''), 10),
        'lyrics' => mb_substr(str_replace("\r\n", "\n", (string) ($in['lyrics'] ?? '')), 0, 60000),
        'about' => music_clean(str_replace("\r\n", "\n", (string) ($in['about'] ?? '')), 4000),
        'download' => !empty($in['download']) ? 1 : 0];
}

switch ($a) {
    case 'up_start': {
        $ext = strtolower(preg_replace('/[^a-z0-9]/i', '', (string) ($in['ext'] ?? '')));
        $size = (int) ($in['size'] ?? 0);
        if (!isset(MUSIC_AUDIO[$ext])) json_out(['error' => 'That file type isn\'t supported. Use MP3, M4A, WAV, FLAC, OGG or AAC.'], 400);
        if ($size <= 0 || $size > MUSIC_MAX) json_out(['error' => 'Files can be up to 120 MB.'], 400);
        $m = meta_from($in);
        if ($m['title'] === '') $m['title'] = 'Untitled';
        $code = rand_token(12);
        @mkdir(music_dir($code), 0750, true);
        $min = (int) music_db()->query('SELECT COALESCE(MIN(sort), 0) FROM music_tracks')->fetchColumn();
        music_db()->prepare('INSERT INTO music_tracks (code, title, artist, album, year, genre, track_no, duration, ext, size, lyrics, about, download, slug, sort, ready, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)')->execute([$code, $m['title'], $m['artist'], $m['album'], $m['year'], $m['genre'], $m['track_no'],
            (float) ($in['duration'] ?? 0), $ext, $size, $m['lyrics'], $m['about'], $m['download'], music_slug($m['title']), $min - 1, now(), now()]);
        json_out(['ok' => true, 'id' => $code]);
    }
    case 'up_chunk': {
        // One piece of the audio file (up to 2 MB), in order; joined on the server.
        $t = music_track((string) ($in['id'] ?? ''));
        if (!$t || $t['ready']) json_out(['error' => 'Upload not found.'], 404);
        $off = (int) ($in['off'] ?? -1);
        $f = $_FILES['file'] ?? null;
        if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) json_out(['error' => 'The upload was interrupted. Try again.'], 400);
        $part = music_dir($t['code']) . '/audio.part';
        $have = is_file($part) ? filesize($part) : 0;
        if ($off !== $have) json_out(['error' => 'Out of order.', 'have' => $have], 409);
        if ($have + filesize($f['tmp_name']) > (int) $t['size']) json_out(['error' => 'Too much data.'], 400);
        file_put_contents($part, file_get_contents($f['tmp_name']), FILE_APPEND | LOCK_EX);
        json_out(['ok' => true, 'have' => filesize($part)]);
    }
    case 'up_finish': {
        $t = music_track((string) ($in['id'] ?? ''));
        if (!$t) json_out(['error' => 'Upload not found.'], 404);
        $dir = music_dir($t['code']); $part = "$dir/audio.part";
        if (!is_file($part) || filesize($part) !== (int) $t['size']) json_out(['error' => 'The file didn\'t arrive in full. Try again.'], 400);
        rename($part, "$dir/audio." . $t['ext']);
        music_db()->prepare('UPDATE music_tracks SET ready = 1, updated_at = ? WHERE code = ?')->execute([now(), $t['code']]);
        json_out(['ok' => true, 'track' => music_public(music_track($t['code']), true)]);
    }
    case 'set_art': {
        // Album art: a picture file (from the tags or picked by hand). remove=1 takes it off.
        $t = music_track((string) ($in['id'] ?? ''));
        if (!$t) json_out(['error' => 'Track not found.'], 404);
        $dir = music_dir($t['code']);
        foreach (glob("$dir/art.*") ?: [] as $old) @unlink($old);
        if (!empty($in['remove'])) {
            music_db()->prepare("UPDATE music_tracks SET art = '', updated_at = ? WHERE code = ?")->execute([now(), $t['code']]);
        } else {
            $f = $_FILES['file'] ?? null;
            if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) json_out(['error' => 'Picture didn\'t upload.'], 400);
            if (filesize($f['tmp_name']) > MUSIC_ART_MAX) json_out(['error' => 'Picture is over 8 MB.'], 400);
            $info = @getimagesize($f['tmp_name']);
            $map = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
            $ext = $map[$info[2] ?? 0] ?? null;
            if (!$ext) json_out(['error' => 'Use a JPG, PNG or WebP picture.'], 400);
            move_uploaded_file($f['tmp_name'], "$dir/art.$ext");
            music_db()->prepare('UPDATE music_tracks SET art = ?, updated_at = ? WHERE code = ?')->execute([$ext, now(), $t['code']]);
        }
        json_out(['ok' => true, 'track' => music_public(music_track($t['code']), true)]);
    }
    case 'update': {
        $t = music_track((string) ($in['id'] ?? ''));
        if (!$t) json_out(['error' => 'Track not found.'], 404);
        $m = meta_from($in + ['title' => $t['title']]);
        if ($m['title'] === '') $m['title'] = 'Untitled';
        $hidden = !empty($in['hidden']) ? 1 : 0;
        music_db()->prepare('UPDATE music_tracks SET title=?, artist=?, album=?, year=?, genre=?, track_no=?, lyrics=?, about=?, download=?, hidden=?, updated_at=? WHERE code=?')
            ->execute([$m['title'], $m['artist'], $m['album'], $m['year'], $m['genre'], $m['track_no'], $m['lyrics'], $m['about'], $m['download'], $hidden, now(), $t['code']]);
        json_out(['ok' => true, 'track' => music_public(music_track($t['code']), true)]);
    }
    case 'duration': {
        music_db()->prepare('UPDATE music_tracks SET duration = ? WHERE code = ? AND duration < 1')->execute([(float) ($in['duration'] ?? 0), (string) ($in['id'] ?? '')]);
        json_out(['ok' => true]);
    }
    case 'delete': {
        $t = music_track((string) ($in['id'] ?? ''));
        if (!$t) json_out(['error' => 'Track not found.'], 404);
        rrmdir_any(music_dir($t['code']));
        music_db()->prepare('DELETE FROM music_tracks WHERE code = ?')->execute([$t['code']]);
        json_out(['ok' => true]);
    }
    case 'order': {
        $ids = array_values(array_filter((array) ($in['ids'] ?? []), 'is_string'));
        $st = music_db()->prepare('UPDATE music_tracks SET sort = ? WHERE code = ?');
        foreach ($ids as $i => $c) $st->execute([$i, $c]);
        json_out(['ok' => true]);
    }
    case 'settings': {
        $s = music_settings();
        if (isset($in['title'])) $s['title'] = music_clean((string) $in['title'], 60) ?: 'SMR Music';
        if (isset($in['sub'])) $s['sub'] = music_clean((string) $in['sub'], 120);
        if (isset($in['download_all'])) $s['download_all'] = !empty($in['download_all']);
        music_kv('settings', json_encode($s));
        json_out(['ok' => true, 'settings' => music_settings()]);
    }
}
json_out(['error' => 'Unknown action'], 400);
