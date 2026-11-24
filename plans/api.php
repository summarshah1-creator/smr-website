<?php
/* Monthly plan: start Stripe Checkout (subscription) and come back from it. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/clients.php';
security_headers(false);
header('Cache-Control: no-store');
$a = $_GET['a'] ?? '';
$p = cl_plan_by_token((string) ($_GET['k'] ?? ''));
if (!$p) { http_response_code(404); exit('This plan isn\'t available.'); }
if ($a === 'start') {
    if (too_many('plan:' . hash('sha256', client_ip()), 20, 3600)) { http_response_code(429); exit('Too many tries. Please message Summar.'); }
    if ($p['stripe_sub'] !== '' && $p['status'] === 'active') { header('Location: ' . cl_plan_url($p)); exit; }
    try { $url = cl_plan_checkout($p); } catch (Throwable $e) { http_response_code(503); exit('Card payment isn\'t available right now. Please message Summar on WhatsApp: 07931 814538.'); }
    header('Location: ' . $url, true, 303); exit;
}
if ($a === 'back') { cl_plan_sync($p); header('Location: ' . cl_plan_url($p) . '?done=1', true, 303); exit; }
http_response_code(400); exit;
