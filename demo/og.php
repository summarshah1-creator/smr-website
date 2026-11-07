<?php
/* Link preview image for a demo link (WhatsApp, iMessage etc.): the app icon, or the icons of the apps in the link. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';

$l = link_by_token((string) ($_GET['k'] ?? ''));
$paths = [];
if ($l) foreach (link_apps($l) as $slug) { $d = demo_by_slug($slug); if ($d && ($p = demo_icon_path($d))) $paths[] = $p; }
if (!$paths) { http_response_code(404); exit; }

$cache = private_dir() . '/og';
if (!is_dir($cache)) @mkdir($cache, 0750, true);
$key = $cache . '/' . hash('sha256', implode('|', array_map(function ($p) { return $p . filemtime($p); }, $paths))) . '.png';

header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=86400');
if (!is_file($key)) {
    if (!function_exists('imagecreatetruecolor')) { // no image library: send the first icon as it is
        header('Content-Type: ' . (mime_for($paths[0]) ?: 'image/webp'));
        readfile($paths[0]);
        exit;
    }
    $load = function (string $p) {
        $ext = strtolower(pathinfo($p, PATHINFO_EXTENSION));
        if ($ext === 'webp' && function_exists('imagecreatefromwebp')) return @imagecreatefromwebp($p);
        if ($ext === 'png') return @imagecreatefrompng($p);
        if ($ext === 'jpg' || $ext === 'jpeg') return @imagecreatefromjpeg($p);
        return false;
    };
    $paths = array_slice($paths, 0, 4);
    $S = 600;
    $img = imagecreatetruecolor($S, $S);
    if (count($paths) === 1) {
        $src = $load($paths[0]);
        if ($src) imagecopyresampled($img, $src, 0, 0, 0, 0, $S, $S, imagesx($src), imagesy($src));
    } else {
        imagefill($img, 0, 0, imagecolorallocate($img, 14, 14, 26));
        $n = count($paths); $cols = 2; $rows = $n > 2 ? 2 : 1;
        $cell = 250; $gap = 30;
        $ox = (int) (($S - ($cols * $cell + ($cols - 1) * $gap)) / 2);
        $oy = (int) (($S - ($rows * $cell + ($rows - 1) * $gap)) / 2);
        foreach ($paths as $i => $p) {
            $src = $load($p); if (!$src) continue;
            $x = $ox + ($i % $cols) * ($cell + $gap); $y = $oy + intdiv($i, $cols) * ($cell + $gap);
            if ($n === 3 && $i === 2) $x = (int) (($S - $cell) / 2);
            imagecopyresampled($img, $src, $x, $y, 0, 0, $cell, $cell, imagesx($src), imagesy($src));
        }
    }
    imagepng($img, $key, 6);
}
header('Content-Type: image/png');
header('Content-Length: ' . filesize($key));
readfile($key);
