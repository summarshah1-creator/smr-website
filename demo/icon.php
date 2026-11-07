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
}
$path = $ok ? demo_icon_path($demo) : null;
if (!$path || !($mime = mime_for($path)) || strpos($mime, 'image/') !== 0) { http_response_code(404); exit; }
security_headers(false);
header('Content-Type: ' . $mime);
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'");
header('Cache-Control: private, max-age=86400');
header('Content-Length: ' . filesize($path));
readfile($path);
