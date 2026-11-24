<?php
/* Private feed for the owner's phone, unlocked by the secret key shown in SMR Admin → Today → Settings.
   ?k=KEY            JSON for the Scriptable widget (Home Screen + Lock Screen)
   ?k=KEY&f=ics      calendar subscription for iPhone Calendar (meetings + hard deadlines)
   Every call also runs the reminder check, so the widget refreshing keeps reminders on time. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
require_once dirname(__DIR__) . '/demo-lib/planner.php';
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
$k = (string) ($_GET['k'] ?? '');
if (!preg_match('/^[A-Za-z0-9_-]{24,}$/', $k) || !hash_equals(pl_key(), $k)) {
    if (too_many('feed:' . hash('sha256', client_ip()), 20, 3600)) { http_response_code(429); exit; }
    note_fail('feed:' . hash('sha256', client_ip()));
    http_response_code(404); exit;
}
if (($_GET['f'] ?? '') === 'js') {   // widget code for the self-updating loader
    header('Content-Type: text/javascript; charset=utf-8');
    readfile(__DIR__ . '/widget.js'); exit;
}
if (($_GET['f'] ?? '') === 'ics') {
    header('Content-Type: text/calendar; charset=utf-8');
    header('Content-Disposition: inline; filename="smr-admin.ics"');
    echo pl_ics();
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    try { pl_tick(); } catch (Throwable $e) {}
    exit;
}
$now = now();
$S = pl_summary($now);
$slim = function ($t) { return $t ? ['id' => $t['id'], 'title' => $t['title'], 'person' => $t['person'], 'why' => $t['why'], 'pri' => $t['pri'], 'owes' => $t['owes'], 'wait' => $t['wait']] : null; };
json_out_then([
    'now' => $now,
    'next' => $slim($S['next']),
    'top' => array_map($slim, array_slice($S['top'], 0, 5)),
    'today' => $S['today'], 'tomorrow' => $S['tomorrow'], 'soon' => array_slice($S['soon'], 0, 4),
    'overdue' => $S['overdue'], 'due_today' => $S['due_today'], 'open' => $S['open'], 'done_today' => $S['done_today'],
    'owing' => array_keys($S['owing']),
    'cl' => (function () use ($now) { try {
        require_once dirname(__DIR__) . '/demo-lib/clients.php';
        $c = clients_summary($now); $pdo = cl_db();
        $leads = []; foreach ($pdo->query("SELECT * FROM leads WHERE status NOT IN ('won','lost') AND next_at > 0 ORDER BY next_at LIMIT 6")->fetchAll() as $l)
            $leads[] = ['name' => $l['business'] !== '' ? $l['business'] : $l['name'], 'what' => $l['what'], 'next' => (int) $l['next_at'], 'next_what' => $l['next_what'], 'value' => (int) $l['value']];
        $care = []; foreach ($pdo->query("SELECT * FROM cl_care WHERE status = 'on'")->fetchAll() as $k) { [$st, $lab] = care_state($k, $now); if ($st === 'due' || $st === 'bad') $care[] = ['client' => (cl_get((int) $k['client_id'])['name'] ?? ''), 'title' => $k['title'], 'label' => $lab, 'bad' => $st === 'bad']; }
        $JS = jobs_summary(array_map(function ($j) use ($now) { return job_row($j, $now); }, jobs_db()->query("SELECT * FROM jobs WHERE status IN ('sent','agreed','delivered')")->fetchAll()));
        return ['leads' => $c['leads_due'], 'unpaid' => count($c['bills']), 'care' => $c['care_due'] + $c['care_bad'], 'monthly' => $c['monthly'], 'inv' => $c['inv_unsent'], 'open_leads' => $c['leads_open'], 'pipeline' => $c['pipeline'],
            'bills' => array_slice($c['bills'], 0, 5), 'lead_list' => $leads, 'care_list' => array_slice($care, 0, 5),
            'job_overdue' => $JS['overdue'], 'job_owed' => $JS['owed'], 'debtors' => $JS['debtors'], 'to_agree' => $JS['agree'], 'reminders' => $JS['remind']];
    } catch (Throwable $e) { return null; } })(),
    'open_url' => '/demo-admin/#today',
], function () { pl_tick(); });
