<?php
/* One proof page picture: ?k=<token>&v=<version id>&i=<page>. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/proofs.php';
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
$s = proof_by_token((string) ($_GET['k'] ?? ''));
$v = $s ? proof_ver((int) ($_GET['v'] ?? 0)) : null;
$it = $v ? proof_item((int) $v['item_id']) : null;
$owner = admin_token() !== null;
if (!$s || !$v || !$it || (int) $it['set_id'] !== (int) $s['id'] || (!(int) $v['ready'] && !$owner) || ((int) $s['archived'] && !$owner)) { http_response_code(404); exit; }
$files = json_decode($v['files'], true) ?: [];
$f = $files[(int) ($_GET['i'] ?? 0)] ?? null;
$path = $f ? proof_dir($s) . '/' . basename($f['f']) : '';
if (!$f || !is_file($path)) { http_response_code(404); exit; }
$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$etag = '"' . substr($f['sha'], 0, 20) . '"';
header('ETag: ' . $etag);
header('Cache-Control: private, max-age=604800, immutable');
if (trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) { http_response_code(304); exit; }
header('Content-Type: ' . (PROOF_EXTS[$ext] ?? 'application/octet-stream'));
header('Content-Length: ' . filesize($path));
readfile($path);
