<?php
/* Grill House menu editor: the owner's phone saves here; SMR sees versions in admin.php.
   Files live in private_dir()/grillhouse-menu/ (current.json, v/<ver>.json, audio/<id>.<ext>). */
define('SMR_DEMO', 1);
require dirname(__DIR__, 2) . '/demo-lib/bootstrap.php';
header('X-Robots-Tag: noindex, nofollow');
date_default_timezone_set('Europe/London');

function gh_dir(string $sub = ''): string {
    $d = private_dir() . '/grillhouse-menu' . ($sub ? '/' . $sub : '');
    if (!is_dir($d)) @mkdir($d, 0770, true);
    return $d;
}
function gh_read(string $f) { return is_file($f) ? json_decode((string)file_get_contents($f), true) : null; }
function gh_write(string $f, $data): void { $t = $f . '.tmp' . bin2hex(random_bytes(3)); file_put_contents($t, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); rename($t, $f); }
function gh_versions(): array {
    $out = [];
    foreach (glob(gh_dir('v') . '/*.json') ?: [] as $f) { $v = gh_read($f); if ($v) { unset($v['st']); $out[] = $v; } }
    usort($out, fn($a, $b) => strcmp($b['ver'], $a['ver']));
    return $out;
}
function gh_new_ver(): string { return date('Ymd-His') . '-' . bin2hex(random_bytes(2)); }
/* voice notes arrive as data: URLs; keep them as files and point the note at them */
function gh_audio(array &$st): void {
    if (empty($st['notes']) || !is_array($st['notes'])) { $st['notes'] = []; return; }
    foreach ($st['notes'] as &$n) {
        if (!is_array($n) || empty($n['audio']) || strpos($n['audio'], 'data:') !== 0) continue;
        if (!preg_match('#^data:(audio/[a-z0-9.+-]+)(?:;[^,]*)?;base64,(.+)$#is', $n['audio'], $m)) { $n['audio'] = ''; continue; }
        $bin = base64_decode($m[2], true); if ($bin === false || strlen($bin) > 15000000) { $n['audio'] = ''; continue; }
        $ext = stripos($m[1], 'mp4') !== false || stripos($m[1], 'aac') !== false ? 'm4a' : (stripos($m[1], 'ogg') !== false ? 'ogg' : 'webm');
        $id = bin2hex(random_bytes(10));
        file_put_contents(gh_dir('audio') . "/$id.$ext", $bin);
        $n['audio'] = 'api.php?a=voice&id=' . $id;
    }
    unset($n);
    $st['notes'] = array_values(array_filter($st['notes'], fn($n) => is_array($n) && (!empty($n['text']) || !empty($n['audio']))));
}

$a = $_GET['a'] ?? '';

if ($a === 'voice') {
    $id = $_GET['id'] ?? '';
    if (!preg_match('/^[a-f0-9]{20}$/', $id)) { http_response_code(404); exit; }
    foreach (['m4a' => 'audio/mp4', 'webm' => 'audio/webm', 'ogg' => 'audio/ogg'] as $e => $type) {
        $f = gh_dir('audio') . "/$id.$e";
        if (is_file($f)) { header('Content-Type: ' . $type); header('Content-Length: ' . filesize($f)); header('Cache-Control: private, max-age=31536000'); header('Accept-Ranges: none'); readfile($f); exit; }
    }
    http_response_code(404); exit;
}

if ($a === 'load') {
    $cur = gh_read(gh_dir() . '/current.json');
    json_out(['ok' => true, 'ver' => $cur['ver'] ?? null, 'st' => $cur['st'] ?? null]);
}

if ($a === 'save') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false], 405);
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 40000000) json_out(['ok' => false, 'error' => 'too big'], 413);
    $in = json_decode($raw, true);
    if (!is_array($in) || empty($in['st']['sections']) || !is_array($in['st']['sections'])) json_out(['ok' => false, 'error' => 'bad'], 400);
    // light limit: 120 saves an hour from one place
    $rl = gh_dir() . '/rl-' . substr(hash('sha256', client_ip()), 0, 16);
    $hits = array_filter(gh_read($rl) ?: [], fn($t) => $t > time() - 3600);
    if (count($hits) >= 120) json_out(['ok' => false, 'error' => 'slow down'], 429);
    $hits[] = time(); gh_write($rl, array_values($hits));

    $st = $in['st'];
    gh_audio($st);
    $lines = array_slice(array_map(fn($l) => mb_substr((string)$l, 0, 400), is_array($in['lines'] ?? null) ? $in['lines'] : []), 0, 300);
    $ver = gh_new_ver();
    $rec = ['ver' => $ver, 'at' => time(), 'lines' => $lines, 'notes' => count(array_filter($st['notes'], fn($n) => !empty($n['text']))), 'voice' => count(array_filter($st['notes'], fn($n) => !empty($n['audio']))), 'by' => 'owner', 'st' => $st];
    gh_write(gh_dir('v') . "/$ver.json", $rec);
    gh_write(gh_dir() . '/current.json', ['ver' => $ver, 'st' => $st]);
    $n = count($lines);
    $body = ($n ? $n . ' menu change' . ($n > 1 ? 's' : '') : 'No menu changes')
        . ($rec['notes'] ? ' · ' . $rec['notes'] . ' note' . ($rec['notes'] > 1 ? 's' : '') : '')
        . ($rec['voice'] ? ' · ' . $rec['voice'] . ' voice note' . ($rec['voice'] > 1 ? 's' : '') : '');
    json_out_then(['ok' => true, 'ver' => $ver, 'st' => $st], function () use ($body) {
        require_once dirname(__DIR__, 2) . '/demo-lib/push.php';
        if (function_exists('push_all')) push_all('Grill House saved the menu', $body, '/grillhouse/edit/admin.php', 'gh-menu');
    });
}

/* ---- SMR only ---- */
if (!admin_token()) json_out(['ok' => false, 'error' => 'login'], 403);

if ($a === 'versions') json_out(['ok' => true, 'versions' => gh_versions(), 'current' => (gh_read(gh_dir() . '/current.json') ?: [])['ver'] ?? null]);

if ($a === 'version') {
    $v = $_GET['v'] ?? '';
    if (!preg_match('/^[0-9]{8}-[0-9]{6}-[a-f0-9]{4}$/', $v)) json_out(['ok' => false], 400);
    $rec = gh_read(gh_dir('v') . "/$v.json");
    json_out($rec ? ['ok' => true] + $rec : ['ok' => false], $rec ? 200 : 404);
}

if ($a === 'restore' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $v = $_POST['v'] ?? '';
    if (!preg_match('/^[0-9]{8}-[0-9]{6}-[a-f0-9]{4}$/', $v)) json_out(['ok' => false], 400);
    $old = gh_read(gh_dir('v') . "/$v.json");
    if (!$old) json_out(['ok' => false], 404);
    $ver = gh_new_ver();
    gh_write(gh_dir('v') . "/$ver.json", ['ver' => $ver, 'at' => time(), 'lines' => $old['lines'] ?? [], 'notes' => $old['notes'] ?? 0, 'voice' => $old['voice'] ?? 0, 'by' => 'smr', 'from' => $v, 'st' => $old['st']]);
    gh_write(gh_dir() . '/current.json', ['ver' => $ver, 'st' => $old['st']]);
    json_out(['ok' => true, 'ver' => $ver]);
}

json_out(['ok' => false, 'error' => 'unknown'], 400);
