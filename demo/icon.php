<?php
/* Demo icons and thumbnails, only for people who can see that demo. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';

$slug = (string) ($_GET['s'] ?? '');
$demo = preg_match('/^[a-z0-9-]{1,41}$/', $slug) ? demo_by_slug($slug) : null;
$ok = false;
if ($demo) {
    if (admin_token()) $ok = true;
    elseif ($vs = visitor_session()) {
        [$l, $s] = $vs;
        $ok = session_state($l, $s) === 'ok' && in_array($slug, link_apps($l), true);
    }
    // The PIN screen shows the icons of the apps in that link.
    if (!$ok && ($l = link_by_token((string) ($_GET['k'] ?? '')))) {
        [$st] = link_status($l);
        $ok = $st !== 'revoked' && $st !== 'expired' && in_array($slug, link_apps($l), true);
    }
}
$path = $ok ? demo_icon_path($demo) : null;
if ($ok && !$path) {
    // No icon uploaded yet: a simple branded letter tile.
    $letter = h(mb_strtoupper(mb_substr(trim($demo['name']), 0, 1)) ?: 'S');
    security_headers(false);
    header('Content-Type: image/svg+xml');
    header('Cache-Control: private, max-age=300');
    echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b5bff"/><stop offset="1" stop-color="#d63bff"/></linearGradient></defs>'
        . '<rect width="256" height="256" fill="url(#g)"/><text x="128" y="128" dy=".35em" text-anchor="middle" font-family="Sora,Arial,sans-serif" font-weight="700" font-size="128" fill="#fff">' . $letter . '</text></svg>';
    exit;
}
if (!$path || !($mime = mime_for($path)) || strpos($mime, 'image/') !== 0) { http_response_code(404); exit; }
security_headers(false);
header('Content-Type: ' . $mime);
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'");
header('Cache-Control: private, max-age=86400');
header('Content-Length: ' . filesize($path));
readfile($path);
