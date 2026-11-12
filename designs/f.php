<?php
/* One design file: ?k=<token>&f=<id>[&p=1 preview][&dl=1 download]. Only while the link works (the owner can always see it). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/designs.php';
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

$s = set_by_token((string) ($_GET['k'] ?? ''));
$owner = admin_token() !== null;
if (!$s || (!$owner && ((int) $s['archived_at'] > 0 || (int) $s['expires_at'] < now() || !(int) $s['ready']))) { http_response_code(404); exit; }
$st = db()->prepare('SELECT * FROM design_files WHERE id = ? AND set_id = ?');
$st->execute([(int) ($_GET['f'] ?? 0), $s['id']]);
$f = $st->fetch();
if (!$f) { http_response_code(404); exit; }

$prev = !empty($_GET['p']) && $f['prev'] !== '';
$name = $prev ? $f['prev'] : $f['file'];
$path = set_dir($s) . '/' . $name;
if (!is_file($path)) { http_response_code(404); exit; }
$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
$mime = DESIGN_EXTS[$ext] ?? 'application/octet-stream';

$etag = '"' . $f['id'] . '-' . ($prev ? 'p' : 'o') . '-' . filesize($path) . '"';
header('ETag: ' . $etag);
header('Cache-Control: private, max-age=86400');
if (trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) { http_response_code(304); exit; }
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($path));
if (!empty($_GET['dl'])) {
    $dn = preg_replace('/[^A-Za-z0-9 ._-]+/', '', (string) ($_GET['n'] ?? '')) ?: ('design-' . $f['id'] . '.' . $ext);
    header('Content-Disposition: attachment; filename="' . $dn . '"');
}
readfile($path);
