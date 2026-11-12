<?php
/* Designs: import a delivery dropped by the "Publish designs" GitHub workflow.
   POST ?a=import&job=<token>. Only folders the workflow uploaded over FTP can be imported. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/designs.php';
security_headers(false);
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_out(['error' => 'POST only'], 405);
$a = $_GET['a'] ?? '';
if ($a === 'import') {
    if (too_many('dimport:' . hash('sha256', client_ip()), 20, 3600)) json_out(['error' => 'Too many tries.'], 429);
    try {
        $s = designs_import((string) ($_GET['job'] ?? ''));
    } catch (Throwable $e) {
        note_fail('dimport:' . hash('sha256', client_ip()));
        json_out(['error' => $e->getMessage()], 400);
    }
    $url = set_url($s);
    json_out_then(['ok' => true, 'url' => $url, 'client' => $s['client'], 'title' => $s['title'], 'expires' => date('j M Y', (int) $s['expires_at'])], 'designs_notify_imported');
}
json_out(['error' => 'Unknown action'], 400);
