<?php
// Jummah Dash demo (hidden, not linked). Served with no caching so updates show straight away.
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Robots-Tag: noindex, nofollow');
readfile(__DIR__ . '/game.html');
