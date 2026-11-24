<?php
/* Client side of a job: agree to the quote, pay by card (Stripe Checkout), come back from Stripe. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/jobs.php';
security_headers(false);
header('Cache-Control: no-store');
$a = $_GET['a'] ?? '';
$ip = 'job:' . hash('sha256', client_ip());

if ($a === 'agree') {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['error' => 'Bad request'], 400);
    if (too_many($ip, 20, 3600)) json_out(['error' => 'Too many tries. Please message Summar.'], 429);
    $in = json_decode((string) file_get_contents('php://input'), true) ?: [];
    $j = job_by_token((string) ($in['k'] ?? ''));
    if (!$j || $j['status'] === 'cancelled') json_out(['error' => 'This quote isn\'t available any more.'], 404);
    if (admin_token()) json_out(['error' => 'Owner preview: only the client can agree here.'], 400);
    if ((int) $j['agreed_at']) json_out(['ok' => true]);
    $name = mb_substr(trim(preg_replace('/\s+/', ' ', (string) ($in['name'] ?? ''))), 0, 80);
    if (mb_strlen($name) < 2) json_out(['error' => 'Type your name to agree.'], 400);
    $now = now();
    jobs_db()->prepare("UPDATE jobs SET status = 'agreed', agreed_at = ?, agreed_name = ?, agreed_ip = ?, changed_at = 0, sent_at = MAX(sent_at, ?), updated = ? WHERE id = ?")
        ->execute([$now, $name, client_ip(), $now, $now, (int) $j['id']]);
    $j = job_by_id((int) $j['id']);
    job_sync_pays($j);
    job_ev((int) $j['id'], 'Agreed by ' . $name . ' (' . date('j M Y H:i', $now) . ')');
    $pays = job_pays((int) $j['id']); $first = null; foreach ($pays as $p) if ($p['status'] !== 'paid') { $first = $p; break; }
    json_out_then(['ok' => true], function () use ($j, $first, $name) {
        job_push('✅ ' . $j['client'] . ' agreed', $j['title'] . ' · ' . money((int) $j['total']) . ($first && $first['due_type'] === 'agree' ? ' · waiting for ' . money((int) $first['amount']) . ' to start' : ' · good to start'), 'job-agreed-' . $j['id']);
        job_email($j, 'Agreed: ' . $j['title'], 'Hi ' . job_first($j) . ",\n\nThanks " . $name . ", that's agreed: " . $j['title'] . ' for ' . money((int) $j['total']) . ".\n"
            . ($first && $first['due_type'] === 'agree' ? "\nTo get started, the " . strtolower($first['label']) . ' of ' . money((int) $first['amount']) . " is due now. You can pay here:\n" . job_url($j) . "\n" : "\nYour quote and payment plan are always here:\n" . job_url($j) . "\n")
            . "\nSummar\nSMR");
    });
}

if ($a === 'pay') {
    $j = job_by_token((string) ($_GET['k'] ?? ''));
    if (!$j || $j['status'] === 'cancelled') { http_response_code(404); exit('This quote isn\'t available.'); }
    if (too_many($ip . ':pay', 30, 3600)) { http_response_code(429); exit('Too many tries. Please message Summar.'); }
    if (!(int) $j['agreed_at']) { header('Location: ' . job_url($j)); exit; }
    $st = jobs_db()->prepare("SELECT * FROM job_pays WHERE id = ? AND job_id = ? AND status != 'paid'"); $st->execute([(int) ($_GET['p'] ?? 0), (int) $j['id']]);
    $p = $st->fetch();
    if (!$p) { header('Location: ' . job_url($j) . '?paid=1'); exit; }
    try { $url = job_checkout($j, $p); }
    catch (Throwable $e) { http_response_code(503); exit('Card payment isn\'t available right now. Please message Summar on WhatsApp: 07931 814538.'); }
    header('Location: ' . $url, true, 303); exit;
}

if ($a === 'back') {
    $j = job_by_token((string) ($_GET['k'] ?? ''));
    if (!$j) { http_response_code(404); exit; }
    $sid = (string) ($_GET['sid'] ?? '');
    if (preg_match('/^cs_[A-Za-z0-9_]{10,200}$/', $sid)) {
        $st = jobs_db()->prepare('SELECT * FROM job_pays WHERE job_id = ? AND session = ?'); $st->execute([(int) $j['id'], $sid]);
        if ($p = $st->fetch()) job_check_session($p);
    }
    header('Location: ' . job_url($j) . '?paid=1', true, 303); exit;
}
json_out(['error' => 'Unknown'], 400);
