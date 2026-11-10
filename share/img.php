<?php
require __DIR__ . '/lib.php';
$id = $_GET['id'] ?? '';
if (!share_meta($id)) { http_response_code(404); exit; }
$f = share_dir() . "/$id.jpg";
header('Content-Type: image/jpeg');
header('Content-Length: ' . filesize($f));
header('Cache-Control: public, max-age=86400');
header('X-Content-Type-Options: nosniff');
readfile($f);
