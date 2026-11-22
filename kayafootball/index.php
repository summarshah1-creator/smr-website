<?php
// Kaya Matchday Studio: served with no caching so testers always get the latest version.
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
readfile(__DIR__ . '/app.html');
