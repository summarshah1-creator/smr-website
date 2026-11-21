<?php
// Link-preview picture for WhatsApp / Instagram / iMessage: 1200×630 JPEG with the album art in the middle
// over a blurred, darkened copy of it. Kept small (WhatsApp skips previews over ~300 KB). Cached per track version.
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/music.php';
$slug = strtolower(preg_replace('/[^a-z0-9-]/i', '', (string) ($_GET['t'] ?? '')));
$t = $slug !== '' ? music_by_slug($slug) : null;
$fallback = dirname(__DIR__) . '/assets/icon-512.png';
if (!$t || $t['art'] === '' || !function_exists('imagecreatetruecolor')) {
    $p = $t && $t['art'] !== '' ? music_dir($t['code']) . '/art.' . $t['art'] : $fallback;
    header('Content-Type: ' . ($p === $fallback ? 'image/png' : (MUSIC_ART[$t['art']] ?? 'image/jpeg')));
    header('Cache-Control: public, max-age=86400');
    readfile($p); exit;
}
$sq = !empty($_GET['sq']); // sq=1: 512×512 cover for the page icon (share sheet header, Home Screen icon)
$cache = music_dir($t['code']) . '/' . ($sq ? 'sq-' : 'og-') . $t['updated_at'] . '.jpg';
if (!is_file($cache) && $sq) {
    $raw = @file_get_contents(music_dir($t['code']) . '/art.' . $t['art']);
    $im = $raw !== false ? @imagecreatefromstring($raw) : false;
    if (!$im) { header('Content-Type: image/png'); readfile($fallback); exit; }
    $sw = imagesx($im); $sh = imagesy($im); $side = min($sw, $sh);
    $out = imagecreatetruecolor(512, 512);
    imagecopyresampled($out, $im, 0, 0, (int) (($sw - $side) / 2), (int) (($sh - $side) / 2), 512, 512, $side, $side);
    foreach (glob(music_dir($t['code']) . '/sq-*.jpg') ?: [] as $old) @unlink($old);
    imagejpeg($out, $cache, 86);
}
if (!is_file($cache)) {
    $src = music_dir($t['code']) . '/art.' . $t['art'];
    $raw = @file_get_contents($src);
    $im = $raw !== false ? @imagecreatefromstring($raw) : false;
    if (!$im) { header('Content-Type: image/png'); readfile($fallback); exit; }
    $sw = imagesx($im); $sh = imagesy($im); $side = min($sw, $sh); $sx = (int) (($sw - $side) / 2); $sy = (int) (($sh - $side) / 2);
    $W = 1200; $H = 630;
    $out = imagecreatetruecolor($W, $H);
    // background: the cover blown up and blurred (shrink right down, then back up), then darkened
    $small = imagecreatetruecolor(60, 32);
    imagecopyresampled($small, $im, 0, 0, $sx, $sy + (int) ($side * .24), 60, 32, $side, (int) ($side * .52));
    for ($i = 0; $i < 6; $i++) imagefilter($small, IMG_FILTER_GAUSSIAN_BLUR);
    $mid = imagecreatetruecolor(300, 158);
    imagecopyresampled($mid, $small, 0, 0, 0, 0, 300, 158, 60, 32);
    for ($i = 0; $i < 8; $i++) imagefilter($mid, IMG_FILTER_GAUSSIAN_BLUR);
    imagecopyresampled($out, $mid, 0, 0, 0, 0, $W, $H, 300, 158);
    for ($i = 0; $i < 6; $i++) imagefilter($out, IMG_FILTER_GAUSSIAN_BLUR);
    imagefilter($out, IMG_FILTER_BRIGHTNESS, -70);
    // the album art, square, in the middle with a soft shadow
    $S = 540; $x = (int) (($W - $S) / 2); $y = (int) (($H - $S) / 2);
    for ($k = 18; $k > 0; $k -= 3) { $c = imagecolorallocatealpha($out, 0, 0, 0, 120 - (int) (18 - $k) * 2); imagefilledrectangle($out, $x - $k, $y - $k + 8, $x + $S + $k, $y + $S + $k + 8, $c); }
    imagecopyresampled($out, $im, $x, $y, $sx, $sy, $S, $S, $side, $side);
    foreach (glob(music_dir($t['code']) . '/og-*.jpg') ?: [] as $old) @unlink($old);
    imagejpeg($out, $cache, 82);
}
header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=86400');
header('Content-Length: ' . filesize($cache));
readfile($cache);
