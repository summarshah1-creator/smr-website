<?php
// Home Screen manifest: opens straight to the track the visitor saved (or the SMR Player home).
header('Content-Type: application/manifest+json');
header('Cache-Control: no-cache');
$slug = strtolower(preg_replace('/[^a-z0-9-]/i', '', (string) ($_GET['t'] ?? '')));
$icon = ['src' => '/assets/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png']; $name = 'SMR Player';
if ($slug !== '') { define('SMR_DEMO', 1); require dirname(__DIR__) . '/demo-lib/music.php'; $t = music_by_slug($slug); if ($t) $name = $t['title'] . ' - SMR Digital'; if ($t && $t['art'] !== '') $icon = ['src' => '/music/og.php?t=' . $slug . '&sq=1&v=' . $t['updated_at'], 'sizes' => '512x512', 'type' => 'image/jpeg']; }
echo json_encode(['name' => $name, 'short_name' => $name, 'start_url' => '/player' . ($slug !== '' ? '/' . $slug : ''), 'scope' => '/',
    'display' => 'standalone', 'background_color' => '#0b0912', 'theme_color' => '#0b0912',
    'icons' => [$icon]], JSON_UNESCAPED_SLASHES);
