<?php
/* POST a JPEG (raw body) -> {"ok":true,"url":"https://host/m/<id>"} */
require __DIR__ . '/lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out($a, int $code = 200) { http_response_code($code); echo json_encode($a); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(['ok' => false, 'error' => 'POST only'], 405);
$len = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($len <= 0 || $len > 4 * 1024 * 1024) out(['ok' => false, 'error' => 'That picture is too big to share.'], 413);
$data = file_get_contents('php://input', false, null, 0, 4 * 1024 * 1024 + 1);
if ($data === false || strlen($data) > 4 * 1024 * 1024 || substr($data, 0, 3) !== "\xFF\xD8\xFF") out(['ok' => false, 'error' => 'Only JPEG pictures can be shared.'], 415);
$info = @getimagesizefromstring($data);
if (!$info || ($info[2] ?? 0) !== IMAGETYPE_JPEG || $info[0] < 50 || $info[1] < 50 || $info[0] > 4000 || $info[1] > 4000) out(['ok' => false, 'error' => 'That picture could not be shared.'], 415);
// rate limits: 20 an hour per visitor, 400 a day overall
$dir = share_dir(); $now = time();
$rlf = $dir . '/_rate.json'; $fp = fopen($rlf, 'c+'); flock($fp, LOCK_EX);
$rl = json_decode((string) stream_get_contents($fp), true); if (!is_array($rl)) $rl = [];
$ip = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|smr-share');
foreach ($rl as $k => $ts) { $rl[$k] = array_values(array_filter((array) $ts, fn($t) => $t > $now - 86400)); if (!$rl[$k]) unset($rl[$k]); }
$mine = array_filter($rl[$ip] ?? [], fn($t) => $t > $now - 3600);
$all = array_sum(array_map('count', $rl));
if (count($mine) >= 20 || $all >= 400) { flock($fp, LOCK_UN); fclose($fp); out(['ok' => false, 'error' => 'Too many links made just now. Please try again later.'], 429); }
$rl[$ip][] = $now; ftruncate($fp, 0); rewind($fp); fwrite($fp, json_encode($rl)); flock($fp, LOCK_UN); fclose($fp);
$kind = ($_SERVER['HTTP_X_KIND'] ?? '') === 'plate' ? 'plate' : 'mockup';
$title = mb_substr(trim(preg_replace('/[\x00-\x1F]+/', ' ', rawurldecode((string) ($_SERVER['HTTP_X_TITLE'] ?? '')))), 0, 80);
$abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; $id = '';
for ($i = 0; $i < 10; $i++) $id .= $abc[random_int(0, strlen($abc) - 1)];
file_put_contents("$dir/$id.jpg", $data);
file_put_contents("$dir/$id.json", json_encode(['t' => $now, 'kind' => $kind, 'title' => $title, 'w' => $info[0], 'h' => $info[1]]));
if (random_int(1, 25) === 1) share_cleanup();
out(['ok' => true, 'url' => share_host() . '/m/' . $id, 'days' => SHARE_DAYS]);
