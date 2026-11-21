<?php
// SMR Player page: smrgraphics.co.uk/player (all public tracks) and /player/<slug> (one track, works for hidden/private tracks too).
// Served through PHP with no-cache so phones always get the latest copy; adds link-preview tags and a per-track Home Screen manifest.
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/music.php';
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' blob:; frame-ancestors 'self'; base-uri 'self'; object-src 'none'");
$h = fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
$slug = strtolower(preg_replace('/[^a-z0-9-]/i', '', (string) ($_GET['t'] ?? '')));
$t = null;
try { $t = $slug !== '' ? music_by_slug($slug) : null; } catch (Throwable $e) {}
$host = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk');
if ($t) {
    $title = $t['title'] . ($t['artist'] !== '' ? ' · ' . $t['artist'] : '');
    $about = trim((string) preg_split('/\n\s*\n/', (string) ($t['about'] ?? ''))[0]);
    $desc = 'Exclusive preview · Tap to listen on SMR Player' . ($about !== '' ? '. ' . mb_strimwidth($about, 0, 140, '…') : '');
    $img = $host . '/music/og.php?t=' . rawurlencode($t['slug']) . '&v=' . $t['updated_at'];
    $url = $host . '/player/' . $t['slug'];
} else {
    $title = 'SMR Player'; $desc = 'Music on SMR Player. Designed & built by SMR Digital.';
    $img = $host . '/assets/icon-512.png'; $url = $host . '/player';
}
$meta = '<meta property="og:site_name" content="SMR Player"><meta property="og:type" content="music.song"><meta property="og:title" content="' . $h($title) . '"><meta property="og:description" content="' . $h($desc) . '"><meta name="description" content="' . $h($desc) . '">'
    . '<meta property="og:image" content="' . $h($img) . '">' . ($t ? '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg">' : '')
    . '<meta property="og:image:alt" content="' . $h($title) . '"><meta property="og:url" content="' . $h($url) . '"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="' . $h($img) . '"><link rel="canonical" href="' . $h($url) . '">';
$html = (string) file_get_contents(__DIR__ . '/player.html');
$html = str_replace('<link rel="manifest" href="manifest.webmanifest">', '<link rel="manifest" href="/music/manifest.php' . ($t ? '?t=' . $h($t['slug']) : '') . '">' . $meta, $html);
if ($t && $t['art'] !== '') { // the track's cover as the page icon: iPhone's share sheet header and the Home Screen icon
    $ico = '/music/og.php?t=' . rawurlencode($t['slug']) . '&sq=1&v=' . $t['updated_at'];
    $html = str_replace('<link rel="apple-touch-icon" href="/assets/icon-512.png">', '<link rel="apple-touch-icon" href="' . $h($ico) . '"><link rel="icon" type="image/jpeg" href="' . $h($ico) . '">', $html);
}
if ($t) $html = str_replace('<meta name="apple-mobile-web-app-title" content="SMR Player">', '<meta name="apple-mobile-web-app-title" content="' . $h($t['title'] . ' - SMR Digital') . '">', $html); // Home Screen name
$html = str_replace('<title>SMR Music</title>', '<title>' . $h($t ? $t['title'] . ' · SMR Player' : 'SMR Player') . '</title>', $html);
echo $html;
