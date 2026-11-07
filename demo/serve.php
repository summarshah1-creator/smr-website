<?php
/* Session gate for demo files: /demo/run/<slug>/<path>
   Every request is checked against the visitor's server-side session (or an admin login). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';

function deny(int $code, string $title, string $msg): void {
    http_response_code($code);
    security_headers(false);
    header('Cache-Control: no-store');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'");
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if (strpos($accept, 'text/html') === false) { header('Content-Type: text/plain; charset=utf-8'); echo $title; exit; }
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . h($title) . '</title>'
        . '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#08080f;color:#eef;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px">'
        . '<div><h1 style="font-size:20px;margin:0 0 8px">' . h($title) . '</h1><p style="color:#aab;margin:0 0 18px">' . h($msg) . '</p>'
        . '<a href="/demo/" target="_top" style="color:#d6a0ff">SMR Digital demos</a></div>';
    exit;
}

// Browsers send "Service-Worker: script" when fetching a service worker. Demos never get one.
if (($_SERVER['HTTP_SERVICE_WORKER'] ?? '') !== '') deny(403, 'Service workers are disabled', 'Not available in demos.');

$uri = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
if (!preg_match('#^/demo/run/([a-z0-9][a-z0-9-]{0,40})(/.*)?$#', $uri, $m)) deny(404, 'Not found', 'This page does not exist.');
$slug = $m[1];
$rest = $m[2] ?? '';
if ($rest === '') { header('Location: /demo/run/' . $slug . '/', true, 302); exit; }

// Who is asking?
$admin = admin_token();
$vs = $admin ? null : visitor_session();
if (!$admin) {
    if (!$vs) deny(403, 'This demo is private', 'Open it from your SMR Digital demo link.');
    [$link, $sess] = $vs;
    $state = session_state($link, $sess);
    if ($state !== 'ok') deny(403, 'Your demo session has ended', 'Please request a new PIN from SMR Digital.');
    if (!in_array($slug, link_apps($link), true)) deny(403, 'Not part of your demo', 'This app is not included in your demo link.');
}

$demo = demo_by_slug($slug);
if (!$demo || (!$admin && !(int) $demo['enabled'])) deny(404, 'Demo not found', 'This demo is not available.');
$root = demo_root($demo);
if (!$root) deny(404, 'Demo not found', 'The files for this demo are missing.');

// Resolve the file safely inside the demo folder.
$parts = [];
foreach (explode('/', $rest) as $seg) {
    if ($seg === '') continue;
    $seg = rawurldecode($seg);
    if ($seg === '..' || $seg === '.' || $seg[0] === '.' || strpbrk($seg, "\\\0") !== false) deny(404, 'Not found', 'This file does not exist.');
    $parts[] = $seg;
}
$rel = implode('/', $parts);
$file = $root . ($rel === '' ? '' : '/' . $rel);
if (is_dir($file)) $file = rtrim($file, '/') . '/index.html';
$real = realpath($file);
if (!$real && strpos(basename($rel), '.') === false) $real = realpath($root . '/index.html'); // app routes
if (!$real || strpos($real, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($real)) deny(404, 'Not found', 'This file does not exist.');

$base = strtolower(basename($real));
if (preg_match('/\.map$/', $base) || in_array($base, ['sw.js', 'service-worker.js', 'flutter_service_worker.js', 'serviceworker.js'], true)) {
    deny(404, 'Not found', 'This file does not exist.');
}
$mime = mime_for($real);
if (!$mime) deny(403, 'Not allowed', 'This file type is not served.');

security_headers(false);
header('X-Frame-Options: SAMEORIGIN');
header("Content-Security-Policy: frame-ancestors 'self'; object-src 'none'");
header('Permissions-Policy: geolocation=(self), camera=(self), microphone=()');

if (strpos($mime, 'text/html') === 0) {
    if (!$admin) {
        db()->prepare('UPDATE sessions SET last_seen = ?, last_app = ? WHERE id = ?')->execute([now(), $slug, $sess['id']]);
    }
    $top = $admin ? '/demo/?preview=1#app=' . $slug : link_path($link) . '#app=' . $slug;
    $html = (string) file_get_contents($real);
    // Flutter web builds use <base href="/">; point it at this demo's folder.
    $html = preg_replace('#<base\s+href=["\']/["\']\s*/?>#i', '<base href="/demo/run/' . $slug . '/">', $html, 1);
    // Feel like an app: no zooming.
    $vp = '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">';
    $html = preg_match('#<meta[^>]+name=["\']viewport["\'][^>]*>#i', $html) ? preg_replace('#<meta[^>]+name=["\']viewport["\'][^>]*>#i', $vp, $html, 1) : $html;
    $guard = guard_snippet($top) . (strpos($html, $vp) === false ? $vp : '');
    if (preg_match('#<head[^>]*>#i', $html, $hm, PREG_OFFSET_CAPTURE)) {
        $at = $hm[0][1] + strlen($hm[0][0]);
        $html = substr($html, 0, $at) . $guard . substr($html, $at);
    } else {
        $html = $guard . $html;
    }
    header('Content-Type: ' . $mime);
    header('Cache-Control: private, no-store');
    header('Content-Length: ' . strlen($html));
    echo $html;
    exit;
}

// Static asset (with byte ranges for video on iPhone).
$size = filesize($real);
header('Content-Type: ' . $mime);
// Always ask the server if there's a newer version (cheap 304 when unchanged), so app updates show at once.
$etag = '"' . substr(md5($real . '|' . filemtime($real) . '|' . $size), 0, 20) . '"';
header('Cache-Control: private, no-cache');
header('ETag: ' . $etag);
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($real)) . ' GMT');
if (!isset($_SERVER['HTTP_RANGE']) && trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) { http_response_code(304); exit; }
header('Accept-Ranges: bytes');
$start = 0; $end = $size - 1;
if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $r)) {
    if ($r[1] === '' && $r[2] !== '') { $start = max(0, $size - (int) $r[2]); }
    else { $start = (int) $r[1]; if ($r[2] !== '') $end = min($end, (int) $r[2]); }
    if ($start > $end || $start >= $size) { http_response_code(416); header("Content-Range: bytes */$size"); exit; }
    http_response_code(206);
    header("Content-Range: bytes $start-$end/$size");
}
$len = $end - $start + 1;
header('Content-Length: ' . $len);
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') exit;
$fp = fopen($real, 'rb');
fseek($fp, $start);
while ($len > 0 && !feof($fp)) {
    $chunk = fread($fp, min(65536, $len));
    echo $chunk;
    $len -= strlen($chunk);
    if (connection_aborted()) break;
}
fclose($fp);

/* Light casual-copy deterrents + service worker off. Inputs, touch and scrolling keep working. */
function guard_snippet(string $top): string {
    $topJs = json_encode($top, JSON_UNESCAPED_SLASHES);
    return '<style id="smr-demo-guard">img,video,svg{-webkit-user-drag:none;-webkit-touch-callout:none}'
        . 'html{touch-action:manipulation}body{-webkit-user-select:none;user-select:none}img:not([src]),img[src=""]{visibility:hidden}'
        . 'input,textarea,select,[contenteditable],[contenteditable] *{-webkit-user-select:text;user-select:text}'
        . '@media print{html,body{display:none!important}}</style>'
        . '<script>(function(){'
        . 'document.addEventListener(\'gesturestart\',function(e){e.preventDefault()},{passive:false});document.addEventListener(\'gesturechange\',function(e){e.preventDefault()},{passive:false});document.addEventListener(\'touchmove\',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});'
        . 'try{if(window.top===window.self){location.replace(' . $topJs . ');return}}catch(e){}'
        . 'try{var sw=navigator.serviceWorker;if(sw){if(sw.getRegistrations)sw.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});'
        . 'var off=function(){return Promise.reject(new Error("Service workers are off in SMR demos"))};'
        . 'try{Object.defineProperty(sw,"register",{value:off,configurable:true})}catch(e){try{sw.register=off}catch(_){}}}}catch(e){}'
        . 'var ed=function(t){return t&&t.closest&&t.closest("input,textarea,select,[contenteditable]")};'
        . 'document.addEventListener("contextmenu",function(e){if(!ed(e.target))e.preventDefault()},true);'
        . 'document.addEventListener("dragstart",function(e){var t=e.target;if(t&&/^(IMG|VIDEO|svg|A)$/.test(t.tagName||t.nodeName))e.preventDefault()},true);'
        . 'document.addEventListener("keydown",function(e){var k=(e.key||"").toLowerCase();if((e.ctrlKey||e.metaKey)&&(k==="s"||k==="p"||k==="u"))e.preventDefault()},true);'
        . '})();</script>';
}
