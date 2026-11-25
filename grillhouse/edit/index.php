<?php
// Grill House menu editor (owner's phone). Served through PHP with no-cache so SiteGround's proxy never keeps an old copy.
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Robots-Tag: noindex, nofollow');
readfile(__DIR__ . '/editor.html');
