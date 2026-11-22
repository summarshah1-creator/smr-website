<?php // Delivery runner demo (working title): served through PHP with no-cache headers (SiteGround's proxy can cache static pages)
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0'); header('Pragma: no-cache'); header('Expires: 0');
readfile(__DIR__ . '/index.html');
