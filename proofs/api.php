<?php
/* Client side of a proof: sign off items, or ask for changes. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/proofs.php';
require_once dirname(__DIR__) . '/demo-lib/mail.php';
security_headers(false);
header('Cache-Control: no-store');
$a = $_GET['a'] ?? '';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['error' => 'Bad request'], 400);
$ip = 'proof:' . hash('sha256', client_ip());
if (too_many($ip, 40, 3600)) json_out(['error' => 'Too many tries. Please message Summar.'], 429);
$in = json_decode((string) file_get_contents('php://input'), true) ?: [];
$s = proof_by_token((string) ($in['k'] ?? ''));
if (!$s || (int) $s['archived']) json_out(['error' => 'This proof isn\'t available any more.'], 404);
if (admin_token()) json_out(['error' => 'Owner preview: only the client can sign off or ask for changes here.'], 400);
$name = mb_substr(trim(preg_replace('/\s+/', ' ', (string) ($in['name'] ?? ''))), 0, 80);
if (mb_strlen($name) < 3 || !preg_match('/\s/', $name)) json_out(['error' => 'Type your full name (first and last).'], 400);
$now = now(); $pdo = proofs_db();
$items = []; foreach (proof_items((int) $s['id']) as $it) $items[(int) $it['id']] = $it;

if ($a === 'approve') {
    if (empty($in['agree']) || (int) ($in['checks'] ?? 0) < count(PROOF_CHECKS)) json_out(['error' => 'Tick every check and the sign-off statement first.'], 400);
    $done = [];
    foreach ((array) ($in['items'] ?? []) as $iid) {
        $it = $items[(int) $iid] ?? null;
        if (!$it || $it['status'] === 'approved' || !(int) $it['cur_ver']) continue;
        $v = proof_ver((int) $it['cur_ver']); if (!$v || !(int) $v['ready']) continue;
        $hash = proof_ver_hash($v);
        $pdo->prepare("UPDATE proof_items SET status = 'approved', ok_ver = ?, updated = ? WHERE id = ?")->execute([(int) $v['id'], $now, (int) $it['id']]);
        proof_ev((int) $s['id'], 'approve', PROOF_STATEMENT, (int) $it['id'], (int) $v['id'], $name, $hash);
        $done[] = $it['name'] . ' (v' . $v['v'] . ', ref ' . strtoupper(substr($hash, 0, 10)) . ')';
    }
    if (!$done) json_out(['error' => 'Nothing to sign off.'], 400);
    $pdo->prepare('UPDATE proof_sets SET updated = ? WHERE id = ?')->execute([$now, (int) $s['id']]);
    $left = 0; foreach (proof_items((int) $s['id']) as $it) if ($it['status'] !== 'approved') $left++;
    json_out_then(['ok' => true], function () use ($s, $done, $name, $left, $now) {
        proof_push('✅ ' . $s['client'] . ' signed off', implode(', ', array_map(function ($d) { return preg_replace('/ \(.*/', '', $d); }, $done)) . ($left ? ' · ' . $left . ' still to sign off' : ' · all signed off, good to go'), 'proof-ok-' . $s['id']);
        if (filter_var((string) $s['email'], FILTER_VALIDATE_EMAIL) && ($cfg = mail_cfg())) {
            try {
                $t = 'Hi ' . proof_first($s) . ",\n\nThis confirms that " . $name . ' signed off the following on ' . date('j M Y \a\t H:i', $now) . ":\n\n- " . implode("\n- ", $done)
                    . "\n\nStatement agreed: " . PROOF_STATEMENT . "\n\nYou can see the signed-off proof any time here:\n" . proof_url($s) . "\n\nSummar\nSMR";
                [$m] = mail_build($cfg, [$s['email']], [], 'Signed off: ' . $s['title'], $t); smtp_send($cfg, [$s['email']], $m);
            } catch (Throwable $e) {}
        }
    });
}
if ($a === 'changes') {
    $it = $items[(int) ($in['item'] ?? 0)] ?? null;
    $text = mb_substr(trim((string) ($in['text'] ?? '')), 0, 3000);
    if (!$it) json_out(['error' => 'Item not found.'], 404);
    if (mb_strlen($text) < 3) json_out(['error' => 'Tell us what needs changing.'], 400);
    if ($it['status'] === 'approved') json_out(['error' => 'This item is already signed off. Message Summar if you need a change.'], 400);
    $pdo->prepare("UPDATE proof_items SET status = 'changes', updated = ? WHERE id = ?")->execute([$now, (int) $it['id']]);
    proof_ev((int) $s['id'], 'changes', $text, (int) $it['id'], (int) $it['cur_ver'], $name);
    $pdo->prepare('UPDATE proof_sets SET updated = ? WHERE id = ?')->execute([$now, (int) $s['id']]);
    json_out_then(['ok' => true], function () use ($s, $it, $text) {
        proof_push('✏️ Changes asked: ' . $s['client'], $it['name'] . ': ' . mb_strimwidth(preg_replace('/\s+/', ' ', $text), 0, 140, '…'), 'proof-ch-' . $it['id']);
    });
}
json_out(['error' => 'Unknown'], 400);
