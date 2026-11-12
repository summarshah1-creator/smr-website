<?php
/* Features presentation for a demo: /demo/deck.php?s=<slug>&p=<page> (slide image) or &pdf=1 (download).
   Same gate as the demo apps: a live visitor session whose link includes the app and its presentation, or the owner. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(false);

$slug = (string) ($_GET['s'] ?? '');
if (!preg_match('/^[a-z0-9][a-z0-9-]{0,40}$/', $slug)) { http_response_code(404); exit; }
$deck = deck_row($slug);
if (!$deck) { http_response_code(404); exit; }
$admin = admin_token() !== null;
$link = null;
if (!$admin) {
    $vs = visitor_session();
    if (!$vs) { http_response_code(403); exit; }
    [$link, $sess] = $vs;
    if (session_state($link, $sess) !== 'ok' || !in_array($slug, link_apps($link), true) || !(int) ($link['deck'] ?? 1)) { http_response_code(403); exit; }
}
$dir = deck_dir($slug);
if (!empty($_GET['pdf'])) {
    $path = "$dir/deck.pdf";
    if (!(int) $deck['pdf'] || !is_file($path)) { http_response_code(404); exit; }
    $d = demo_by_slug($slug);
    $name = preg_replace('/[^A-Za-z0-9 ._-]+/', '', ($d['name'] ?? $slug) . ' - features presentation') . '.pdf';
    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: ' . (!empty($_GET['dl']) ? 'attachment' : 'inline') . '; filename="' . $name . '"');
    header('Cache-Control: private, max-age=300');
    readfile($path);
    exit;
}
$p = max(1, (int) ($_GET['p'] ?? 1));
if ($p > (int) $deck['pages']) { http_response_code(404); exit; }
$path = null;
foreach (['webp', 'jpg', 'png'] as $e) if (is_file("$dir/$p.$e")) { $path = "$dir/$p.$e"; break; }
if (!$path) { http_response_code(404); exit; }
$etag = '"' . $deck['updated_at'] . '-' . $p . '"';
header('ETag: ' . $etag);
header('Cache-Control: private, no-cache');
if (trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) { http_response_code(304); exit; }
$ext = pathinfo($path, PATHINFO_EXTENSION);
header('Content-Type: ' . ['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'png' => 'image/png'][$ext]);
header('Content-Length: ' . filesize($path));
// First slide seen by a visitor = "opened the presentation" (once every 6 hours per link and app).
if ($p === 1 && $link && !$admin) {
    $d = demo_by_slug($slug);
    $txt = 'opened the ' . ($d['name'] ?? $slug) . ' presentation';
    $st = db()->prepare("SELECT 1 FROM events WHERE link_id = ? AND type = 'deck' AND text = ? AND at > ?");
    $st->execute([$link['id'], $txt, now() - 6 * 3600]);
    if (!$st->fetchColumn()) {
        readfile($path);
        if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
        require_once dirname(__DIR__) . '/demo-lib/push.php';
        link_event($link, 'deck', $txt);
        exit;
    }
}
readfile($path);
