<?php
/* SMR Admin: a client's uploaded logo (Clients tab). Owner only. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
if (!admin_token()) { http_response_code(403); exit; }
$f = private_dir() . '/clogo/' . (int) ($_GET['id'] ?? 0) . '.png';
if (!is_file($f)) { http_response_code(404); exit; }
header('Content-Type: image/png');
header('Cache-Control: private, max-age=31536000, immutable');
header('Content-Length: ' . filesize($f));
readfile($f);
