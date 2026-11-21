<?php
// Home Screen manifest: opens straight to the track the visitor saved (or the SMR Player home).
header('Content-Type: application/manifest+json');
header('Cache-Control: no-cache');
$slug = strtolower(preg_replace('/[^a-z0-9-]/i', '', (string) ($_GET['t'] ?? '')));
echo json_encode(['name' => 'SMR Player', 'short_name' => 'SMR Player', 'start_url' => '/player' . ($slug !== '' ? '/' . $slug : ''), 'scope' => '/',
    'display' => 'standalone', 'background_color' => '#0b0912', 'theme_color' => '#0b0912',
    'icons' => [['src' => '/assets/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png']]], JSON_UNESCAPED_SLASHES);
