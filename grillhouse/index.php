<?php
// Serve the menu with no caching so SiteGround's proxy never stores a stale/empty copy.
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
readfile(__DIR__ . '/menu.html');
