<?php
/* Reminder check for a SiteGround cron job (Site Tools → Devs → Cron Jobs, every 5 minutes):
     php /home/<user>/www/smrgraphics.co.uk/public_html/demo-admin/cron.php
   or over the web with the planner key: /demo-admin/cron.php?k=KEY */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
require_once dirname(__DIR__) . '/demo-lib/planner.php';
if (PHP_SAPI !== 'cli') {
    header('Cache-Control: no-store');
    $k = (string) ($_GET['k'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{24,}$/', $k) || !hash_equals(pl_key(), $k)) { http_response_code(404); exit; }
    header('Content-Type: application/json');
}
echo json_encode(['ok' => true, 'log' => pl_tick()]), "\n";
