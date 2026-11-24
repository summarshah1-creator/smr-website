<?php
// Luton Community Hub (live copy). No caching of the page; every script/style gets ?v=<file time> so phones fetch new versions.
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
$vid = (string) ($_COOKIE['hub_vid'] ?? '');
if (!preg_match('/^[A-Za-z0-9_-]{20,40}$/', $vid)) { $vid = rand_token(18); set_cookie('hub_vid', $vid, now() + 2 * 365 * 86400, '/', 'Lax'); }
$who = json_encode(['me' => $vid, 'owner' => (bool) admin_token()]);
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Robots-Tag: noindex, nofollow');
$h = file_get_contents(__DIR__ . '/app.html');
$h = preg_replace_callback('/(src|href)="([a-z0-9_-]+\.(?:js|css))"/i', function ($m) {
    $f = __DIR__ . '/' . $m[2]; return $m[1] . '="' . $m[2] . (is_file($f) ? '?v=' . filemtime($f) : '') . '"';
}, $h);
$h = str_replace('<script src="server.js', '<script>window.__HUB_WHO=' . $who . ';</script><script src="server.js', $h);
echo $h;
