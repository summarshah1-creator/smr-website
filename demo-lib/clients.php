<?php
/* SMR Admin → Clients, monthly plans, invoices, care & renewals, leads (owner 24 Nov).
   One page per client pulls together everything they've had from SMR (jobs, proofs, design links, demos),
   their monthly plan (Stripe subscription or cash, failed payments chased with a grace period, never cut off
   automatically), invoices made when they pay (sent by the owner, never automatically), care checks
   (domain / hosting / SSL / uptime checked automatically; security checks, test orders and "ask the business"
   checks prompted) and the leads list. Money in pence, times unix seconds (Europe/London). */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/push.php';
require_once __DIR__ . '/mail.php';
require_once __DIR__ . '/jobs.php';

const CL_TYPES = ['food' => 'Takeaway / restaurant', 'cafe' => 'Café / dessert', 'shop' => 'Shop / retail', 'beauty' => 'Barber / beauty', 'charity' => 'Charity / mosque', 'school' => 'School / education', 'trade' => 'Trades / services', 'pro' => 'Professional (law, finance…)', 'other' => 'Other'];
const LEAD_STATUS = ['new' => 'New', 'talking' => 'Talking', 'quoted' => 'Quoted', 'won' => 'Won', 'later' => 'Later', 'lost' => 'Lost'];
const LEAD_SOURCES = ['whatsapp' => 'WhatsApp', 'instagram' => 'Instagram', 'walkin' => 'Walk-in / met', 'referral' => 'Referral', 'website' => 'Website', 'game' => 'Games', 'calc' => 'Commission calculator', 'other' => 'Other'];
/* Care templates: auto = checked by the server, renew = a date to renew by, check = something to do or ask. every: year / quarter / month / week. */
const CARE_TPL = [
    'up'       => ['auto',  'Website is up',                    'day',     'We open it every day and tell you if it goes down.'],
    'ssl'      => ['auto',  'SSL certificate (the padlock)',     'day',     'Warns you 14 days before it runs out.'],
    'domain'   => ['auto',  'Domain renewal',                    'year',    'Reads the renewal date from the registry and warns you 30 days before.'],
    'hosting'  => ['renew', 'Hosting renewal',                   'year',    ''],
    'appstore' => ['renew', 'App Store / Google Play account',   'year',    'Apple developer account renews yearly.'],
    'email'    => ['renew', 'Business email / Workspace',        'year',    ''],
    'security' => ['check', 'Security check',                    'month',   'Updates installed, admin passwords strong, old staff logins removed, backups running.'],
    'test'     => ['check', 'Spot check: test order / booking',  'month',   'Place a test order (or booking), check the emails, the tablet / printer and the payment.'],
    'content'  => ['check', 'Ask them: menu, prices & hours right?', 'quarter', 'Ready WhatsApp message to the business.'],
    'holiday'  => ['check', 'Ask them: Ramadan / Eid / Christmas hours', 'quarter', 'Ready WhatsApp message to the business.'],
    'backup'   => ['check', 'Backup restore test',               'quarter', 'Restore last night\'s backup somewhere safe and check it works.'],
    'speed'    => ['check', 'Speed & phone check',               'quarter', 'Open it on a phone on 4G: fast, nothing broken, links work.'],
    'google'   => ['check', 'Google Business profile check',     'quarter', 'Hours, photos, link to the site/app, reply to new reviews.'],
];
const CARE_EVERY = ['day' => 86400, 'week' => 7 * 86400, 'month' => 30 * 86400, 'quarter' => 91 * 86400, 'year' => 365 * 86400, 'once' => 0];

function cl_db(): PDO {
    static $done = false;
    $pdo = jobs_db();
    if ($done) return $pdo;
    $done = true;
    $pdo->exec("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT NOT NULL, person TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '',
        type TEXT DEFAULT 'other', address TEXT DEFAULT '', website TEXT DEFAULT '', instagram TEXT DEFAULT '', notes TEXT DEFAULT '', status TEXT DEFAULT 'active',
        source TEXT DEFAULT '', keyp TEXT DEFAULT '', keyn TEXT DEFAULT '', created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS cl_plans (id INTEGER PRIMARY KEY, client_id INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, kind TEXT DEFAULT 'monthly', title TEXT NOT NULL,
        incl TEXT DEFAULT '', amount INTEGER DEFAULT 0, day INTEGER DEFAULT 1, start INTEGER DEFAULT 0, status TEXT DEFAULT 'draft', method TEXT DEFAULT 'card', grace INTEGER DEFAULT 14,
        stripe_sess TEXT DEFAULT '', stripe_sub TEXT DEFAULT '', stripe_cust TEXT DEFAULT '', sub_status TEXT DEFAULT '', last_sync INTEGER DEFAULT 0, paused_at INTEGER DEFAULT 0,
        notes TEXT DEFAULT '', created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS cl_bills (id INTEGER PRIMARY KEY, plan_id INTEGER NOT NULL, client_id INTEGER NOT NULL, period TEXT NOT NULL, amount INTEGER NOT NULL, due INTEGER NOT NULL,
        status TEXT DEFAULT 'due', method TEXT DEFAULT '', paid_at INTEGER DEFAULT 0, stage INTEGER DEFAULT 0, wa_due INTEGER DEFAULT 0, last_rem INTEGER DEFAULT 0, extra_days INTEGER DEFAULT 0,
        stripe_inv TEXT DEFAULT '', pay_url TEXT DEFAULT '', fail_msg TEXT DEFAULT '', created INTEGER)");
    $pdo->exec("CREATE UNIQUE INDEX IF NOT EXISTS cl_bills_pp ON cl_bills(plan_id, period)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, no INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, client_id INTEGER DEFAULT 0, client TEXT DEFAULT '', person TEXT DEFAULT '',
        phone TEXT DEFAULT '', email TEXT DEFAULT '', address TEXT DEFAULT '', title TEXT DEFAULT '', items TEXT DEFAULT '[]', total INTEGER DEFAULT 0, paid INTEGER DEFAULT 1, paid_at INTEGER DEFAULT 0,
        method TEXT DEFAULT '', src TEXT DEFAULT 'manual', src_id INTEGER DEFAULT 0, note TEXT DEFAULT '', views INTEGER DEFAULT 0, sent_at INTEGER DEFAULT 0, sent_via TEXT DEFAULT '', created INTEGER)");
    $pdo->exec("CREATE UNIQUE INDEX IF NOT EXISTS invoices_src ON invoices(src, src_id) WHERE src != 'manual'");
    $pdo->exec("CREATE TABLE IF NOT EXISTS cl_care (id INTEGER PRIMARY KEY, client_id INTEGER NOT NULL, tpl TEXT DEFAULT '', kind TEXT DEFAULT 'check', title TEXT NOT NULL, target TEXT DEFAULT '',
        every TEXT DEFAULT 'month', due INTEGER DEFAULT 0, client_pays INTEGER DEFAULT 0, price INTEGER DEFAULT 0, last_done INTEGER DEFAULT 0, last_run INTEGER DEFAULT 0, last_ok INTEGER DEFAULT 1,
        last_result TEXT DEFAULT '', fails INTEGER DEFAULT 0, pushed INTEGER DEFAULT 0, status TEXT DEFAULT 'on', notes TEXT DEFAULT '', created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS cl_care_log (id INTEGER PRIMARY KEY, care_id INTEGER NOT NULL, at INTEGER, ok INTEGER, text TEXT)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY, name TEXT DEFAULT '', business TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '', area TEXT DEFAULT '',
        what TEXT DEFAULT '', value INTEGER DEFAULT 0, source TEXT DEFAULT '', status TEXT DEFAULT 'new', next_at INTEGER DEFAULT 0, next_what TEXT DEFAULT '', notes TEXT DEFAULT '',
        lost_why TEXT DEFAULT '', client_id INTEGER DEFAULT 0, via TEXT DEFAULT '', created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS cl_log (id INTEGER PRIMARY KEY, client_id INTEGER, at INTEGER, what TEXT)");
    return $pdo;
}
function cl_cfg(): array {
    $c = json_decode(job_kv('cl_cfg'), true) ?: [];
    return $c + ['biz' => 'SMR Graphics', 'addr' => "Luton, Bedfordshire", 'email' => 'summar@smrgraphics.co.uk', 'phone' => '07931 814538', 'web' => 'smrgraphics.co.uk',
        'vat' => '', 'footer' => 'Thank you for your business.', 'grace' => 14, 'next_no' => 1001];
}
function cl_log(int $cid, string $what): void { cl_db()->prepare('INSERT INTO cl_log (client_id, at, what) VALUES (?, ?, ?)')->execute([$cid, now(), mb_substr($what, 0, 300)]); }
function cl_kp(string $phone): string { $d = preg_replace('/\D/', '', $phone); return strlen($d) >= 10 ? substr($d, -10) : ''; }
function cl_kn(string $name): string { return strtolower(preg_replace('/[^a-z0-9]/i', '', preg_replace('/\b(ltd|limited|the|uk)\b/i', '', $name))); }
function cl_get(int $id): ?array { $st = cl_db()->prepare('SELECT * FROM clients WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
/* Same client = same phone (last 10 digits) or the same name (ignoring Ltd/The, spaces and case). */
function cl_find(string $phone, string $name): ?array {
    $kp = cl_kp($phone); $kn = cl_kn($name);
    if ($kp !== '') { $st = cl_db()->prepare('SELECT * FROM clients WHERE keyp = ? LIMIT 1'); $st->execute([$kp]); if ($r = $st->fetch()) return $r; }
    if ($kn !== '') { $st = cl_db()->prepare('SELECT * FROM clients WHERE keyn = ? LIMIT 1'); $st->execute([$kn]); if ($r = $st->fetch()) return $r; }
    return null;
}
function cl_upsert(array $f, string $source = ''): int {
    $name = trim((string) ($f['name'] ?? '')); if ($name === '') return 0;
    $old = cl_find((string) ($f['phone'] ?? ''), $name);
    if ($old) {   // fill gaps only
        $up = [];
        foreach (['person', 'phone', 'email'] as $k) if (trim((string) $old[$k]) === '' && trim((string) ($f[$k] ?? '')) !== '') $up[$k] = trim((string) $f[$k]);
        if ($up) { $up['keyp'] = cl_kp($up['phone'] ?? $old['phone']); $up['updated'] = now(); $s = implode(', ', array_map(function ($k) { return "$k = ?"; }, array_keys($up)));
            cl_db()->prepare("UPDATE clients SET $s WHERE id = ?")->execute(array_merge(array_values($up), [(int) $old['id']])); }
        return (int) $old['id'];
    }
    cl_db()->prepare('INSERT INTO clients (name, person, phone, email, type, source, keyp, keyn, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?)')
        ->execute([$name, trim((string) ($f['person'] ?? '')), trim((string) ($f['phone'] ?? '')), strtolower(trim((string) ($f['email'] ?? ''))), $f['type'] ?? 'other', $source, cl_kp((string) ($f['phone'] ?? '')), cl_kn($name), now(), now()]);
    return (int) cl_db()->lastInsertId();
}
/* Everyone already in Jobs, Proofs and Designs becomes a client (once; quick to re-run). */
function cl_sync(): void {
    $pdo = cl_db();
    foreach ($pdo->query("SELECT client, person, phone, email FROM jobs WHERE status != 'cancelled'")->fetchAll() as $j) cl_upsert(['name' => $j['client'], 'person' => $j['person'], 'phone' => $j['phone'], 'email' => $j['email']], 'jobs');
    try { foreach ($pdo->query('SELECT client, person, phone, email FROM proof_sets')->fetchAll() as $s) cl_upsert(['name' => $s['client'], 'person' => $s['person'], 'phone' => $s['phone'], 'email' => $s['email']], 'proofs'); } catch (Throwable $e) {}
    try { foreach ($pdo->query("SELECT client, phone FROM design_sets WHERE client != ''")->fetchAll() as $s) cl_upsert(['name' => $s['client'], 'phone' => $s['phone']], 'designs'); } catch (Throwable $e) {}
}
function cl_same(array $c, string $phone, string $name): bool {
    $kp = cl_kp($phone);
    return ($kp !== '' && $kp === $c['keyp']) || (cl_kn($name) !== '' && cl_kn($name) === $c['keyn']);
}
function cl_jobs(array $c): array {
    $out = [];
    foreach (cl_db()->query('SELECT * FROM jobs ORDER BY created DESC')->fetchAll() as $j) if (cl_same($c, (string) $j['phone'], (string) $j['client'])) $out[] = $j;
    return $out;
}

/* ---------- invoices ---------- */
function inv_url(array $i): string { return job_host() . '/i/' . $i['token']; }
function inv_no(array $i): string { return 'SMR-' . $i['no']; }
function inv_by_token(string $t): ?array { if (!preg_match('/^[A-Za-z0-9_-]{12,40}$/', $t)) return null; $st = cl_db()->prepare('SELECT * FROM invoices WHERE token = ?'); $st->execute([$t]); return $st->fetch() ?: null; }
function inv_get(int $id): ?array { $st = cl_db()->prepare('SELECT * FROM invoices WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
function inv_make(array $f): int {
    $pdo = cl_db();
    if (($f['src'] ?? 'manual') !== 'manual') { $st = $pdo->prepare('SELECT id FROM invoices WHERE src = ? AND src_id = ?'); $st->execute([$f['src'], (int) $f['src_id']]); if ($id = $st->fetchColumn()) return (int) $id; }
    $cfg = cl_cfg(); $no = max((int) $cfg['next_no'], (int) $pdo->query('SELECT COALESCE(MAX(no), 0) + 1 FROM invoices')->fetchColumn());
    $cfg['next_no'] = $no + 1; job_kv_set('cl_cfg', json_encode($cfg));
    do { $tok = rand_token(12); } while (inv_by_token($tok));
    $pdo->prepare('INSERT INTO invoices (no, token, client_id, client, person, phone, email, address, title, items, total, paid, paid_at, method, src, src_id, note, created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$no, $tok, (int) ($f['client_id'] ?? 0), $f['client'] ?? '', $f['person'] ?? '', $f['phone'] ?? '', $f['email'] ?? '', $f['address'] ?? '', $f['title'] ?? '', json_encode($f['items'] ?? []),
            (int) $f['total'], (int) ($f['paid'] ?? 1), (int) ($f['paid_at'] ?? now()), $f['method'] ?? '', $f['src'] ?? 'manual', (int) ($f['src_id'] ?? 0), $f['note'] ?? '', now()]);
    $id = (int) $pdo->lastInsertId();
    if (!empty($f['client_id'])) cl_log((int) $f['client_id'], 'Invoice ' . 'SMR-' . $no . ' made (' . money((int) $f['total']) . ')');
    return $id;
}
/* Called from job_mark_paid: every job payment gets its own paid invoice, ready for the owner to send. */
function inv_from_job_pay(int $payId): int {
    $st = jobs_db()->prepare('SELECT * FROM job_pays WHERE id = ?'); $st->execute([$payId]); $p = $st->fetch();
    if (!$p || $p['status'] !== 'paid') return 0;
    $j = job_by_id((int) $p['job_id']); if (!$j) return 0;
    $cid = cl_upsert(['name' => $j['client'], 'person' => $j['person'], 'phone' => $j['phone'], 'email' => $j['email']], 'jobs');
    $items = json_decode($j['items'], true) ?: [];
    $lines = [];
    if (count(job_plan($j)) > 1 || (int) $p['amount'] !== (int) $j['total']) {   // part payment: show the job, then this payment
        foreach ($items as $it) $lines[] = ['d' => $it['d'], 'q' => $it['q'], 'p' => $it['p'], 'info' => 1];
        $lines[] = ['d' => $p['label'] . ' of ' . money((int) $j['total']), 'q' => 1, 'p' => (int) $p['amount']];
    } else foreach ($items as $it) $lines[] = $it;
    $c = cl_get($cid);
    return inv_make(['client_id' => $cid, 'client' => $j['client'], 'person' => $j['person'], 'phone' => $j['phone'], 'email' => $j['email'], 'address' => $c['address'] ?? '',
        'title' => $j['title'] . (count(job_plan($j)) > 1 ? ' · ' . $p['label'] : ''), 'items' => $lines, 'total' => (int) $p['amount'], 'paid_at' => (int) $p['paid_at'] ?: now(), 'method' => $p['method'], 'src' => 'job', 'src_id' => $payId]);
}
function inv_from_bill(array $b): int {
    $pl = cl_plan((int) $b['plan_id']); $c = cl_get((int) $b['client_id']); if (!$pl || !$c) return 0;
    $mon = date('F Y', strtotime($b['period'] . '-01'));
    return inv_make(['client_id' => (int) $c['id'], 'client' => $c['name'], 'person' => $c['person'], 'phone' => $c['phone'], 'email' => $c['email'], 'address' => $c['address'],
        'title' => $pl['title'] . ' · ' . $mon, 'items' => [['d' => $pl['title'] . ' (' . $mon . ')', 'q' => 1, 'p' => (int) $b['amount']]], 'total' => (int) $b['amount'], 'paid_at' => (int) $b['paid_at'] ?: now(),
        'method' => $b['method'], 'src' => 'bill', 'src_id' => (int) $b['id']]);
}
function inv_msg(array $i): string {
    $f = trim((string) ($i['person'] !== '' ? $i['person'] : $i['client'])); $f = $f !== '' ? preg_split('/[\s,(]+/', $f)[0] : 'there';
    return 'Hi ' . $f . ', thanks for your payment of ' . money((int) $i['total']) . '. Here\'s your invoice (' . inv_no($i) . ") for your records:\n" . inv_url($i) . "\n\nYou can download it as a PDF from that page. Summar, SMR";
}
function inv_row(array $i): array {
    return ['id' => (int) $i['id'], 'no' => inv_no($i), 'url' => inv_url($i), 'client_id' => (int) $i['client_id'], 'client' => $i['client'], 'person' => $i['person'], 'phone' => $i['phone'], 'email' => $i['email'],
        'title' => $i['title'], 'total' => (int) $i['total'], 'paid_at' => (int) $i['paid_at'], 'method' => $i['method'], 'src' => $i['src'], 'sent_at' => (int) $i['sent_at'], 'sent_via' => $i['sent_via'],
        'views' => (int) $i['views'], 'created' => (int) $i['created'], 'msg' => inv_msg($i)];
}

/* ---------- monthly plans ---------- */
function cl_plan(int $id): ?array { $st = cl_db()->prepare('SELECT * FROM cl_plans WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
function cl_plan_by_token(string $t): ?array { if (!preg_match('/^[A-Za-z0-9_-]{12,40}$/', $t)) return null; $st = cl_db()->prepare('SELECT * FROM cl_plans WHERE token = ?'); $st->execute([$t]); return $st->fetch() ?: null; }
function cl_plan_url(array $p): string { return job_host() . '/c/' . $p['token']; }
function cl_bills(int $planId): array { $st = cl_db()->prepare('SELECT * FROM cl_bills WHERE plan_id = ? ORDER BY period DESC'); $st->execute([$planId]); return $st->fetchAll(); }
function cl_plan_checkout(array $p): string {
    $c = cl_get((int) $p['client_id']);
    $s = stripe_call('POST', 'checkout/sessions', [
        'mode' => 'subscription',
        'line_items[0][quantity]' => 1,
        'line_items[0][price_data][currency]' => 'gbp',
        'line_items[0][price_data][unit_amount]' => (int) $p['amount'],
        'line_items[0][price_data][recurring][interval]' => 'month',
        'line_items[0][price_data][product_data][name]' => mb_substr($p['title'], 0, 120),
        'customer_email' => $c && filter_var((string) $c['email'], FILTER_VALIDATE_EMAIL) ? $c['email'] : null,
        'client_reference_id' => 'plan' . $p['id'],
        'metadata[plan]' => (int) $p['id'], 'subscription_data[metadata][plan]' => (int) $p['id'],
        'success_url' => job_host() . '/plans/api.php?a=back&k=' . $p['token'] . '&sid={CHECKOUT_SESSION_ID}',
        'cancel_url' => cl_plan_url($p),
        'expires_at' => now() + 3600,
    ]);
    cl_db()->prepare('UPDATE cl_plans SET stripe_sess = ? WHERE id = ?')->execute([(string) $s['id'], (int) $p['id']]);
    return (string) $s['url'];
}
/* Reads the plan's subscription + its recent invoices from Stripe into cl_bills. */
function cl_plan_sync(array $p): void {
    $pdo = cl_db();
    if (jobs_stripe_key() === '') return;
    if ($p['stripe_sub'] === '' && $p['stripe_sess'] !== '') {
        try { $s = stripe_call('GET', 'checkout/sessions/' . rawurlencode($p['stripe_sess'])); } catch (Throwable $e) { return; }
        if (($s['status'] ?? '') === 'complete' && !empty($s['subscription'])) {
            $pdo->prepare("UPDATE cl_plans SET stripe_sub = ?, stripe_cust = ?, status = 'active', start = CASE WHEN start = 0 THEN ? ELSE start END, day = ?, updated = ? WHERE id = ?")
                ->execute([(string) $s['subscription'], (string) ($s['customer'] ?? ''), now(), (int) date('j'), now(), (int) $p['id']]);
            cl_log((int) $p['client_id'], 'Monthly plan set up by card: ' . $p['title'] . ' · ' . money((int) $p['amount']) . '/month');
            try { push_all('🔁 Monthly plan set up', cl_get((int) $p['client_id'])['name'] . ' · ' . money((int) $p['amount']) . ' a month', '/demo-admin/#clients', 'plan-up-' . $p['id']); } catch (Throwable $e) {}
            $p = cl_plan((int) $p['id']);
        }
    }
    if ($p['stripe_sub'] === '') return;
    try {
        $sub = stripe_call('GET', 'subscriptions/' . rawurlencode($p['stripe_sub']));
        $inv = stripe_call('GET', 'invoices', ['subscription' => $p['stripe_sub'], 'limit' => 6]);
    } catch (Throwable $e) { return; }
    $pdo->prepare('UPDATE cl_plans SET sub_status = ?, last_sync = ? WHERE id = ?')->execute([(string) ($sub['status'] ?? ''), now(), (int) $p['id']]);
    if (($sub['status'] ?? '') === 'canceled' && $p['status'] === 'active') { $pdo->prepare("UPDATE cl_plans SET status = 'ended', updated = ? WHERE id = ?")->execute([now(), (int) $p['id']]); cl_log((int) $p['client_id'], 'Subscription cancelled in Stripe'); }
    foreach (array_reverse($inv['data'] ?? []) as $i) {
        if (($i['status'] ?? '') === 'draft' || ($i['status'] ?? '') === 'void') continue;
        $per = date('Y-m', (int) ($i['period_start'] ?? $i['created'])); if (($i['billing_reason'] ?? '') === 'subscription_create') $per = date('Y-m', (int) $i['created']);
        $paid = ($i['status'] ?? '') === 'paid';
        $failed = !$paid && (int) ($i['attempt_count'] ?? 0) > 0;
        $st = $pdo->prepare('SELECT * FROM cl_bills WHERE plan_id = ? AND (stripe_inv = ? OR period = ?)'); $st->execute([(int) $p['id'], (string) $i['id'], $per]); $b = $st->fetch();
        if (!$b) {
            $pdo->prepare('INSERT INTO cl_bills (plan_id, client_id, period, amount, due, status, stripe_inv, pay_url, created) VALUES (?,?,?,?,?,?,?,?,?)')
                ->execute([(int) $p['id'], (int) $p['client_id'], $per, (int) $i['amount_due'], (int) ($i['due_date'] ?? 0) ?: (int) $i['created'], 'due', (string) $i['id'], (string) ($i['hosted_invoice_url'] ?? ''), now()]);
            $st->execute([(int) $p['id'], (string) $i['id'], $per]); $b = $st->fetch();
        } else $pdo->prepare('UPDATE cl_bills SET stripe_inv = ?, pay_url = ? WHERE id = ?')->execute([(string) $i['id'], (string) ($i['hosted_invoice_url'] ?? ''), (int) $b['id']]);
        if ($paid && $b['status'] !== 'paid') cl_bill_paid((int) $b['id'], 'card', (int) ($i['status_transitions']['paid_at'] ?? now()));
        elseif ($failed && $b['status'] === 'due') {
            $pdo->prepare("UPDATE cl_bills SET status = 'failed', fail_msg = ? WHERE id = ?")->execute([mb_substr((string) ($i['last_finalization_error']['message'] ?? 'The card payment didn\'t go through'), 0, 200), (int) $b['id']]);
            cl_log((int) $p['client_id'], 'Card payment failed for ' . date('F', strtotime($per . '-01')));
        }
    }
}
function cl_bill_paid(int $billId, string $method, int $at = 0): void {
    $pdo = cl_db(); $st = $pdo->prepare('SELECT * FROM cl_bills WHERE id = ?'); $st->execute([$billId]); $b = $st->fetch();
    if (!$b || $b['status'] === 'paid') return;
    $pdo->prepare("UPDATE cl_bills SET status = 'paid', method = ?, paid_at = ?, wa_due = 0 WHERE id = ?")->execute([$method, $at ?: now(), $billId]);
    $st->execute([$billId]); $b = $st->fetch();
    cl_log((int) $b['client_id'], money((int) $b['amount']) . ' paid for ' . date('F Y', strtotime($b['period'] . '-01')) . ' (' . $method . ')');
    inv_from_bill($b);
    if ((int) $b['stage'] >= 1) { try { push_all('💷 Paid after a reminder', cl_get((int) $b['client_id'])['name'] . ' paid ' . money((int) $b['amount']), '/demo-admin/#clients', 'bill-paid-' . $billId); } catch (Throwable $e) {} }
}
/* Where a monthly payment stands. Grace = days of service while unpaid before the owner is asked to decide. */
function cl_bill_state(array $b, array $p, int $now): array {
    if ($b['status'] === 'paid') return ['paid', 'Paid ' . date('j M', (int) $b['paid_at'])];
    if ($b['status'] === 'void') return ['void', 'Written off'];
    $late = (int) floor(($now - (int) $b['due']) / 86400); $g = (int) $p['grace'] + (int) $b['extra_days'];
    if ($late < 0) return ['soon', 'Due ' . date('j M', (int) $b['due'])];
    $why = $b['status'] === 'failed' ? 'Card failed' : 'Unpaid';
    if ($late >= $g) return ['grace', $why . ' · ' . $late . ' days · grace period over'];
    return ['late', $why . ' · day ' . ($late + 1) . ' of ' . $g . ' grace'];
}
function cl_bill_msg(array $b, array $p, array $c, int $stage): string {
    $f = trim((string) ($c['person'] !== '' ? $c['person'] : $c['name'])); $f = $f !== '' ? preg_split('/[\s,(]+/', $f)[0] : 'there';
    $mon = date('F', strtotime($b['period'] . '-01')); $amt = money((int) $b['amount']);
    $link = $b['pay_url'] !== '' ? $b['pay_url'] : cl_plan_url($p);
    $how = $p['method'] === 'card' ? "You can pay or update your card here: $link" : 'Cash or card is fine, just let me know when.';
    switch ($stage) {
        case 1: return $b['status'] === 'failed' ? "Hi $f, just a heads-up: this month's $amt for " . $p['title'] . " didn't go through on your card (it happens, usually an expired card). $how Thanks!"
                                                 : "Hi $f, a quick reminder that this month's $amt for " . $p['title'] . " is due. $how Thanks!";
        case 2: return "Hi $f, $mon's $amt for " . $p['title'] . " is still outstanding. $how Thanks.";
        default: return "Hi $f, $mon's $amt for " . $p['title'] . ' is now well overdue. Please sort it this week so your service carries on without any interruption. ' . $how;
    }
}
function cl_plan_row(array $p, int $now): array {
    $c = cl_get((int) $p['client_id']) ?: ['name' => '', 'person' => '', 'phone' => ''];
    $bills = array_map(function ($b) use ($p, $c, $now) {
        [$st, $label] = cl_bill_state($b, $p, $now);
        return ['id' => (int) $b['id'], 'period' => $b['period'], 'month' => date('M Y', strtotime($b['period'] . '-01')), 'amount' => (int) $b['amount'], 'due' => (int) $b['due'], 'status' => $b['status'],
            'state' => $st, 'label' => $label, 'method' => $b['method'], 'paid_at' => (int) $b['paid_at'], 'pay_url' => $b['pay_url'], 'wa_due' => (int) $b['wa_due'],
            'msg' => (int) $b['wa_due'] ? cl_bill_msg($b, $p, $c, (int) $b['wa_due']) : cl_bill_msg($b, $p, $c, 1)];
    }, cl_bills((int) $p['id']));
    $f = trim((string) ($c['person'] !== '' ? $c['person'] : $c['name'])); $f = $f !== '' ? preg_split('/[\s,(]+/', $f)[0] : 'there';
    return ['id' => (int) $p['id'], 'client_id' => (int) $p['client_id'], 'client' => $c['name'], 'phone' => $c['phone'], 'kind' => $p['kind'], 'title' => $p['title'], 'incl' => $p['incl'], 'amount' => (int) $p['amount'],
        'day' => (int) $p['day'], 'start' => (int) $p['start'], 'status' => $p['status'], 'method' => $p['method'], 'grace' => (int) $p['grace'], 'sub_status' => $p['sub_status'], 'card_set' => $p['stripe_sub'] !== '',
        'paused_at' => (int) $p['paused_at'], 'notes' => $p['notes'], 'url' => cl_plan_url($p), 'bills' => $bills,
        'msg_setup' => "Hi $f, here's the link to set up your monthly payment for " . $p['title'] . ' (' . money((int) $p['amount']) . " a month):\n" . cl_plan_url($p) . "\n\nIt's a secure card payment through Stripe; it takes a minute. Any questions, just message me. Summar, SMR"];
}

/* ---------- care checks ---------- */
function care_next(string $every, int $from): int { $d = CARE_EVERY[$every] ?? 0; return $d ? $from + $d : 0; }
function care_host(string $t): string { $t = trim(strtolower($t)); $t = preg_replace('#^https?://#', '', $t); $t = preg_replace('#[/?\#].*$#', '', $t); return preg_replace('/^www\./', '', $t); }
function care_http(string $url, int $timeout = 12): array {
    if (!function_exists('curl_init')) return [0, 'no curl'];
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 5, CURLOPT_TIMEOUT => $timeout, CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (SMR care check)', CURLOPT_HTTPHEADER => ['Accept: text/html,application/json']]);
    $body = curl_exec($c); $code = (int) curl_getinfo($c, CURLINFO_HTTP_CODE); $err = curl_error($c); curl_close($c);
    return [$code, $code ? (string) $body : $err];
}
function care_ssl_days(string $host): ?int {
    $ctx = stream_context_create(['ssl' => ['capture_peer_cert' => true, 'SNI_enabled' => true, 'peer_name' => $host, 'verify_peer' => false, 'verify_peer_name' => false]]);
    $s = @stream_socket_client('ssl://' . $host . ':443', $en, $es, 10, STREAM_CLIENT_CONNECT, $ctx);
    if (!$s) return null;
    $p = stream_context_get_params($s); fclose($s);
    $cert = @openssl_x509_parse($p['options']['ssl']['peer_certificate'] ?? null);
    return $cert ? (int) floor(((int) $cert['validTo_time_t'] - now()) / 86400) : null;
}
function care_domain_exp(string $host): ?int {
    $parts = explode('.', $host); $dom = count($parts) > 2 && in_array(implode('.', array_slice($parts, -2)), ['co.uk', 'org.uk', 'me.uk', 'ac.uk', 'ltd.uk', 'plc.uk'], true) ? implode('.', array_slice($parts, -3)) : implode('.', array_slice($parts, -2));
    $url = preg_match('/\.uk$/', $dom) ? 'https://rdap.nominet.uk/uk/domain/' . $dom : 'https://rdap.org/domain/' . $dom;
    [$code, $body] = care_http($url, 15);
    if ($code !== 200) return null;
    $j = json_decode($body, true);
    foreach ($j['events'] ?? [] as $e) if (($e['eventAction'] ?? '') === 'expiration' && !empty($e['eventDate'])) return (int) strtotime($e['eventDate']);
    return null;
}
/* Runs one automatic check. Returns [ok, text, newDue]. */
function care_run(array $k): array {
    $host = care_host((string) $k['target']);
    if ($host === '') return [false, 'No website address set', 0];
    if ($k['tpl'] === 'up') {
        [$code, $b] = care_http('https://' . $host . '/');
        $ok = $code >= 200 && $code < 400;
        return [$ok, $ok ? 'Up (' . $code . ')' : ($code ? 'Down: error ' . $code : 'Down: ' . mb_substr($b, 0, 80)), 0];
    }
    if ($k['tpl'] === 'ssl') {
        $d = care_ssl_days($host);
        if ($d === null) return [false, 'Couldn\'t read the certificate', 0];
        return [$d > 14, $d >= 0 ? 'Valid for ' . $d . ' more days' : 'EXPIRED ' . (-$d) . ' days ago', now() + max(0, $d - 14) * 86400];
    }
    if ($k['tpl'] === 'domain') {
        $t = care_domain_exp($host);
        if (!$t) return [true, 'Renewal date not public for this domain: set it by hand', (int) $k['due']];
        $d = (int) floor(($t - now()) / 86400);
        return [$d > 30, 'Renews ' . date('j M Y', $t) . ' (' . $d . ' days)', $t];
    }
    return [true, '', (int) $k['due']];
}
function care_state(array $k, int $now): array {
    if ($k['status'] !== 'on') return ['off', 'Paused'];
    if ($k['kind'] === 'auto' && $k['tpl'] !== 'domain') return [(int) $k['last_ok'] ? 'ok' : 'bad', $k['last_result'] !== '' ? $k['last_result'] : 'Not checked yet'];
    $due = (int) $k['due'];
    if (!$due) return ['ok', $k['last_result'] !== '' ? $k['last_result'] : 'No date set'];
    $d = (int) floor(($due - $now) / 86400);
    $warn = $k['kind'] === 'check' ? 0 : ($k['tpl'] === 'domain' ? 30 : 21);
    if ($k['tpl'] === 'domain' && !(int) $k['last_ok'] && $d > 30) return ['ok', $k['last_result']];
    if ($d < 0) return ['bad', ($k['kind'] === 'check' ? 'Due ' : 'Expired? Was due ') . (-$d) . ' day' . (-$d === 1 ? '' : 's') . ' ago'];
    if ($d <= $warn || ($k['kind'] === 'check' && $d === 0)) return ['due', $d === 0 ? 'Due today' : ($k['kind'] === 'check' ? 'Due in ' . $d . ' days' : 'Renews in ' . $d . ' days · ' . date('j M', $due))];
    return ['ok', ($k['kind'] === 'check' ? 'Next: ' : 'Renews ') . date('j M Y', $due)];
}
function care_msg(array $k, array $c): string {
    $f = trim((string) ($c['person'] !== '' ? $c['person'] : $c['name'])); $f = $f !== '' ? preg_split('/[\s,(]+/', $f)[0] : 'there';
    switch ($k['tpl']) {
        case 'content': return "Hi $f, quick check from SMR: are the menu, prices and opening hours on your " . ($c['website'] !== '' ? 'site / app' : 'app') . " all still right? If anything's changed, just send it over and I'll update it for you.";
        case 'holiday': return "Hi $f, with the holidays coming up, will your opening hours change (Ramadan / Eid / Christmas)? Send me the times and I'll put them on your site / app and Google so customers know.";
        case 'domain': case 'hosting': case 'appstore': case 'email':
            return "Hi $f, just to let you know your " . strtolower(preg_replace('/ renewal$/i', '', $k['title'])) . ' is due for renewal on ' . date('j F', (int) $k['due']) . ((int) $k['price'] ? ' (' . money((int) $k['price']) . ')' : '') . ". I'll sort it so nothing goes offline; let me know if you have any questions.";
        default: return '';
    }
}
function care_row(array $k, int $now, ?array $c = null): array {
    [$st, $label] = care_state($k, $now);
    $c = $c ?: (cl_get((int) $k['client_id']) ?: ['name' => '', 'person' => '', 'website' => '', 'phone' => '']);
    $lg = cl_db()->prepare('SELECT at, ok, text FROM cl_care_log WHERE care_id = ? ORDER BY at DESC LIMIT 6'); $lg->execute([(int) $k['id']]);
    return ['id' => (int) $k['id'], 'client_id' => (int) $k['client_id'], 'client' => $c['name'], 'phone' => $c['phone'], 'tpl' => $k['tpl'], 'kind' => $k['kind'], 'title' => $k['title'], 'target' => $k['target'],
        'every' => $k['every'], 'due' => (int) $k['due'], 'client_pays' => (int) $k['client_pays'], 'price' => (int) $k['price'], 'last_done' => (int) $k['last_done'], 'last_run' => (int) $k['last_run'],
        'last_result' => $k['last_result'], 'status' => $k['status'], 'notes' => $k['notes'], 'state' => $st, 'label' => $label, 'tip' => CARE_TPL[$k['tpl']][3] ?? '',
        'msg' => care_msg($k, $c), 'log' => $lg->fetchAll()];
}

/* ---------- leads ---------- */
function lead_row(array $l, int $now): array {
    $due = (int) $l['next_at'] && (int) $l['next_at'] <= $now + 3600 && !in_array($l['status'], ['won', 'lost'], true);
    return ['id' => (int) $l['id'], 'name' => $l['name'], 'business' => $l['business'], 'phone' => $l['phone'], 'email' => $l['email'], 'area' => $l['area'], 'what' => $l['what'],
        'value' => (int) $l['value'], 'source' => $l['source'], 'status' => $l['status'], 'next_at' => (int) $l['next_at'], 'next_what' => $l['next_what'], 'notes' => $l['notes'],
        'lost_why' => $l['lost_why'], 'client_id' => (int) $l['client_id'], 'via' => $l['via'], 'created' => (int) $l['created'], 'updated' => (int) $l['updated'], 'due' => $due];
}
/* Turns a few lines about a lead ("Ali from Spice Hut wants a website, 07…, met at the expo, follow up Friday") into fields. AI if the key is set, else a simple guess. */
function lead_parse(string $text): array {
    $out = ['notes' => $text];
    if (preg_match('/(?:\+44\s?|0)7[\d\s]{9,12}/', $text, $m)) $out['phone'] = trim($m[0]);
    if (preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $text, $m)) $out['email'] = strtolower($m[0]);
    require_once __DIR__ . '/ai.php';
    if (ai_key() === '') {   // simple guess: "Bilal from Spice Hut …" / "Spice Hut (Bilal) …"
        if (preg_match('/^\s*([A-Z][a-z]+)\s+(?:from|at)\s+(.+?)(?=\s+(?:in|wants?|needs?|is|looking|asked)\b|[,.(]|$)/u', $text, $m)) { $out['name'] = $m[1]; $out['business'] = trim($m[2]); }
        else $out['name'] = mb_substr(trim(preg_split('/[\n,.]| wants| needs/', $text)[0]), 0, 60);
        if (preg_match('/\b(?:wants?|needs?|looking for|asked (?:about|for))\s+(.+?)(?=[,.]|$)/i', $text, $m)) $out['what'] = mb_substr(trim($m[1]), 0, 120);
        foreach (['digital' => '/\b(app|website|site|ordering|online)\b/i', 'marketing' => '/\b(social|instagram|tiktok|marketing|posts)\b/i', 'plates' => '/\bplates?\b/i', 'graphics' => '/\b(logo|banner|leaflet|flyer|menu|print|card|sign|vinyl)\b/i'] as $k => $re) if (preg_match($re, $text)) { $out['area'] = $k; break; }
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (preg_match('/\b(today|tomorrow|next week|' . implode('|', $days) . ')\b/i', $text, $m)) { $w = strtolower($m[1]); $out['next_at'] = $w === 'today' ? strtotime('today 10:00') : ($w === 'tomorrow' ? strtotime('tomorrow 10:00') : ($w === 'next week' ? strtotime('monday next week 10:00') : strtotime('next ' . $w . ' 10:00'))); }
        return $out;
    }
    $today = date('l j F Y');
    $sys = 'You turn a business owner\'s quick note about a sales lead into JSON. The owner runs SMR (graphic design & print, websites & apps, social media marketing, number plates) in Luton, UK. Today is ' . $today . '. Reply with JSON only.';
    $q = "Note:\n" . $text . "\n\nReturn {\"name\":person's name or \"\",\"business\":business name or \"\",\"phone\":\"\",\"email\":\"\",\"area\":one of graphics|digital|marketing|plates|direct|\"\",\"what\":short description of what they want (max 12 words),\"value\":rough value in pounds as a number or 0,\"source\":one of whatsapp|instagram|walkin|referral|website|game|calc|other|\"\",\"status\":one of new|talking|quoted|won|later|lost,\"next_days\":days from today until the next follow-up (number, 0 = today, -1 if none said),\"next_what\":what to do next (max 10 words) or \"\",\"missing\":[up to 3 short questions to ask the owner about things that matter but weren't said]}";
    try {
        $r = ai_call([['type' => 'text', 'text' => $q]], 500, $sys);
        if (preg_match('/\{.*\}/s', $r, $m) && ($j = json_decode($m[0], true))) {
            foreach (['name', 'business', 'phone', 'email', 'what', 'next_what'] as $k) if (!empty($j[$k])) $out[$k] = mb_substr((string) $j[$k], 0, 160);
            if (isset(JOB_AREAS[$j['area'] ?? ''])) $out['area'] = $j['area'];
            if (isset(LEAD_SOURCES[$j['source'] ?? ''])) $out['source'] = $j['source'];
            if (isset(LEAD_STATUS[$j['status'] ?? ''])) $out['status'] = $j['status'];
            if (!empty($j['value'])) $out['value'] = (int) round((float) $j['value'] * 100);
            if (isset($j['next_days']) && (int) $j['next_days'] >= 0) $out['next_at'] = strtotime('today 10:00') + (int) $j['next_days'] * 86400;
            $out['missing'] = array_slice(array_map('strval', (array) ($j['missing'] ?? [])), 0, 3);
            $out['ai'] = 1;
        }
    } catch (Throwable $e) { $out['ai_err'] = $e->getMessage(); }
    if (empty($out['name']) && empty($out['business'])) $out['name'] = mb_substr(trim(strtok($text, "\n,.")), 0, 80);
    return $out;
}

/* ---------- the client page ---------- */
function cl_summary_row(array $c, array $plans, array $care, int $now): array {
    $monthly = 0; $problem = 0;
    foreach ($plans as $p) { if ($p['client_id'] !== (int) $c['id']) continue; if ($p['status'] === 'active') $monthly += $p['amount']; foreach ($p['bills'] as $b) if (in_array($b['state'], ['late', 'grace'], true)) $problem++; }
    $cdue = 0; foreach ($care as $k) if ($k['client_id'] === (int) $c['id'] && in_array($k['state'], ['due', 'bad'], true)) $cdue++;
    return ['id' => (int) $c['id'], 'name' => $c['name'], 'person' => $c['person'], 'phone' => $c['phone'], 'email' => $c['email'], 'type' => $c['type'], 'status' => $c['status'], 'website' => $c['website'],
        'monthly' => $monthly, 'problem' => $problem, 'care_due' => $cdue, 'updated' => (int) $c['updated'], 'created' => (int) $c['created']];
}
function cl_page(array $c, int $now): array {
    $pdo = cl_db();
    $jobs = array_map(function ($j) use ($now) { return job_row($j, $now); }, cl_jobs($c));
    $proofs = []; $designs = []; $demos = [];
    try { foreach ($pdo->query('SELECT * FROM proof_sets ORDER BY created DESC')->fetchAll() as $s) if (cl_same($c, (string) $s['phone'], (string) $s['client'])) { $st = proof_state($s); $proofs[] = ['id' => (int) $s['id'], 'title' => $s['title'], 'state' => $st['state'], 'n' => $st['n'], 'url' => proof_url($s), 'created' => (int) $s['created']]; } } catch (Throwable $e) {}
    try { foreach ($pdo->query('SELECT * FROM design_sets ORDER BY created_at DESC')->fetchAll() as $s) if (cl_same($c, (string) $s['phone'], (string) $s['client'])) $designs[] = ['id' => (int) $s['id'], 'title' => $s['title'], 'views' => (int) $s['views'], 'created' => (int) $s['created_at'], 'archived' => (int) $s['archived_at'] > 0, 'url' => job_host() . '/d/' . $s['token']]; } catch (Throwable $e) {}
    $kn = cl_kn($c['name']); $pn = trim((string) $c['person']);
    if ($kn !== '') foreach ($pdo->query('SELECT * FROM links ORDER BY created_at DESC LIMIT 400')->fetchAll() as $l) {
        $lab = cl_kn((string) $l['label']);
        if ($lab !== '' && (strpos($lab, $kn) !== false || ($pn !== '' && strlen(cl_kn($pn)) > 2 && strpos($lab, cl_kn($pn)) !== false)))
            $demos[] = ['label' => $l['label'], 'apps' => (string) $l['apps'], 'views' => (int) $l['views'], 'last' => (int) $l['last_view'], 'created' => (int) $l['created_at'], 'revoked' => (int) $l['revoked']];
    }
    $plans = array_map(function ($p) use ($now) { return cl_plan_row($p, $now); }, $pdo->query('SELECT * FROM cl_plans WHERE client_id = ' . (int) $c['id'] . ' ORDER BY created DESC')->fetchAll());
    $care = array_map(function ($k) use ($now, $c) { return care_row($k, $now, $c); }, $pdo->query('SELECT * FROM cl_care WHERE client_id = ' . (int) $c['id'] . " ORDER BY kind = 'auto' DESC, due")->fetchAll());
    $invs = array_map('inv_row', $pdo->query('SELECT * FROM invoices WHERE client_id = ' . (int) $c['id'] . ' ORDER BY created DESC')->fetchAll());
    $leads = array_map(function ($l) use ($now) { return lead_row($l, $now); }, $pdo->query('SELECT * FROM leads WHERE client_id = ' . (int) $c['id'])->fetchAll());
    $log = $pdo->query('SELECT at, what FROM cl_log WHERE client_id = ' . (int) $c['id'] . ' ORDER BY at DESC LIMIT 30')->fetchAll();
    foreach ($jobs as $j) foreach (array_slice($j['events'], 0, 6) as $e) $log[] = ['at' => (int) $e['at'], 'what' => $j['title'] . ': ' . $e['what']];
    usort($log, function ($a, $b) { return $b['at'] <=> $a['at']; }); $log = array_slice($log, 0, 30);

    // stats
    $spent = 0; $owed = 0; $onTime = 0; $nPaid = 0; $areas = []; $first = (int) $c['created']; $last = 0;
    foreach ($jobs as $j) {
        if ($j['stage'] === 'cancelled') continue;
        $areas[$j['area']] = 1; $first = min($first, $j['created']); $last = max($last, $j['created']);
        foreach ($j['pays'] as $p) if ($p['status'] === 'paid') { $spent += $p['amount']; $nPaid++; if (!$p['due'] || $p['paid_at'] <= $p['due'] + 86400) $onTime++; }
        $owed += $j['overdue'] + ($j['stage'] === 'owed' ? $j['owed'] - $j['overdue'] : 0);   // only money that's actually due now
    }
    $monthly = 0;
    foreach ($plans as $p) { if ($p['status'] === 'active') $monthly += $p['amount']; $areas['digital'] = 1; foreach ($p['bills'] as $b) { if ($b['status'] === 'paid') { $spent += $b['amount']; $nPaid++; if ($b['paid_at'] <= $b['due'] + 3 * 86400) $onTime++; } elseif (in_array($b['state'], ['late', 'grace'], true)) $owed += $b['amount']; } }
    $nJobs = count(array_filter($jobs, function ($j) { return $j['stage'] !== 'cancelled' && $j['stage'] !== 'draft'; }));
    $stats = ['spent' => $spent, 'owed' => $owed, 'jobs' => $nJobs, 'avg' => $nJobs ? (int) round(array_sum(array_map(function ($j) { return $j['total']; }, $jobs)) / max(1, count($jobs))) : 0,
        'monthly' => $monthly, 'first' => $first, 'last' => $last, 'on_time' => $nPaid ? (int) round($onTime * 100 / $nPaid) : null, 'paid_n' => $nPaid,
        'proofs' => count($proofs), 'demo_views' => array_sum(array_map(function ($d) { return $d['views']; }, $demos)), 'design_views' => array_sum(array_map(function ($d) { return $d['views']; }, $designs))];

    // ideas: simple rules from what they've had
    $ideas = [];
    $food = in_array($c['type'], ['food', 'cafe'], true);
    if ($owed > 0) $ideas[] = ['k' => 'owe', 't' => 'Owes ' . money($owed) . ': chase it before taking on new work'];
    if (!isset($areas['digital'])) $ideas[] = ['k' => 'digital', 't' => $food ? 'Their own ordering app: 0% commission, show them what Just Eat / Uber Eats cost them (calculator)' : 'A website or booking app (show them a demo)'];
    if (!isset($areas['marketing'])) $ideas[] = ['k' => 'marketing', 't' => 'Monthly social media: posts, stories and a reel each month'];
    if (!isset($areas['graphics'])) $ideas[] = ['k' => 'graphics', 't' => $food ? 'Menu boards, leaflets and a window vinyl to match their brand' : 'Branded print: cards, leaflets, a roller banner'];
    if ((isset($areas['digital']) || $c['website'] !== '') && !$care) $ideas[] = ['k' => 'care', 't' => 'Set up care checks for their site (domain, SSL, up-time, monthly spot check)'];
    if (isset($areas['digital']) && !$monthly) $ideas[] = ['k' => 'plan', 't' => 'Move them onto a monthly plan (hosting, updates, support)'];
    if ($last && $now - $last > 120 * 86400) $ideas[] = ['k' => 'checkin', 't' => 'No new job for ' . (int) floor(($now - $last) / 2592000) . ' months: send a friendly check-in with an idea'];
    if ($spent >= 30000 && $owed === 0) $ideas[] = ['k' => 'refer', 't' => 'Happy, paying client: ask for a referral (£50 refer-a-business)'];
    return ['client' => $c + ['id' => (int) $c['id']], 'jobs' => $jobs, 'proofs' => $proofs, 'designs' => $designs, 'demos' => array_slice($demos, 0, 12), 'plans' => $plans, 'care' => $care,
        'invoices' => $invs, 'leads' => $leads, 'log' => $log, 'stats' => $stats, 'ideas' => $ideas, 'areas' => array_keys($areas)];
}

/* ---------- background: monthly bills, Stripe sync, care checks, follow-ups (from pl_tick; at most every 4 min) ---------- */
function clients_tick(): array {
    $pdo = cl_db(); $now = now(); $log = [];
    $h = (int) date('G', $now);
    // 1) cash plans: make this month's bill on the billing day
    foreach ($pdo->query("SELECT * FROM cl_plans WHERE status = 'active' AND method = 'cash'")->fetchAll() as $p) {
        $per = date('Y-m', $now); $day = min((int) $p['day'] ?: 1, (int) date('t', $now));
        $due = (int) strtotime(date('Y-m-', $now) . sprintf('%02d', $day) . ' 10:00:00');
        if ($now >= $due - 3 * 86400 && (int) $p['start'] <= $due) $pdo->prepare('INSERT OR IGNORE INTO cl_bills (plan_id, client_id, period, amount, due, created) VALUES (?,?,?,?,?,?)')->execute([(int) $p['id'], (int) $p['client_id'], $per, (int) $p['amount'], $due, $now]);
    }
    // 2) card plans: sync with Stripe every 6 hours (or soon after a setup link)
    foreach ($pdo->query("SELECT * FROM cl_plans WHERE method = 'card' AND status IN ('sent','active','paused') AND (stripe_sub != '' OR stripe_sess != '')")->fetchAll() as $p)
        if ($now - (int) $p['last_sync'] > ($p['stripe_sub'] === '' ? 600 : 6 * 3600)) { cl_plan_sync($p); $log[] = 'sync ' . $p['id']; }
    // 3) chase unpaid / failed monthly payments: ready WhatsApp texts; pushes only on the first failure and when grace runs out
    foreach ($pdo->query("SELECT b.*, p.grace, p.title, p.status AS pst FROM cl_bills b JOIN cl_plans p ON p.id = b.plan_id WHERE b.status IN ('due','failed')")->fetchAll() as $b) {
        if ($b['pst'] === 'ended') continue;
        $late = (int) floor(($now - (int) $b['due']) / 86400); if ($late < 0 && $b['status'] !== 'failed') continue;
        $g = (int) $b['grace'] + (int) $b['extra_days'];
        $want = $late >= $g ? 4 : ($late >= 7 ? 3 : ($late >= 3 ? 2 : 1));
        if ($want <= (int) $b['stage']) continue;
        if ($h < 9 || $h >= 20) continue;
        $pdo->prepare('UPDATE cl_bills SET stage = ?, wa_due = ?, last_rem = ? WHERE id = ?')->execute([$want, min($want, 3), $now, (int) $b['id']]);
        $c = cl_get((int) $b['client_id']); $nm = $c ? $c['name'] : 'A client';
        if ($want === 1 && $b['status'] === 'failed') { try { push_all('Card payment failed: ' . $nm, money((int) $b['amount']) . ' for ' . $b['title'] . '. The reminder is written for you: tap to send it.', '/demo-admin/#clients', 'bill-' . $b['id']); } catch (Throwable $e) {} }
        if ($want === 4) { try { push_all('Grace period over: ' . $nm, money((int) $b['amount']) . ' unpaid for ' . $late . ' days. Decide: give them more time, or pause their service.', '/demo-admin/#clients', 'bill-' . $b['id']); } catch (Throwable $e) {} }
        cl_log((int) $b['client_id'], 'Payment reminder ' . $want . ' ready (' . money((int) $b['amount']) . ')');
        $log[] = 'bill ' . $b['id'] . ':' . $want;
    }
    // 4) automatic care checks: one site at a time, daily (domain weekly)
    $st = $pdo->prepare("SELECT * FROM cl_care WHERE kind = 'auto' AND status = 'on' AND target != '' AND last_run < ? ORDER BY last_run LIMIT 2");
    $st->execute([$now - 20 * 3600]);
    foreach ($st->fetchAll() as $k) {
        if ($k['tpl'] === 'domain' && $now - (int) $k['last_run'] < 6 * 86400) continue;
        [$ok, $txt, $due] = care_run($k);
        $fails = $ok ? 0 : (int) $k['fails'] + 1;
        $pdo->prepare('UPDATE cl_care SET last_run = ?, last_ok = ?, last_result = ?, due = ?, fails = ?, updated = ? WHERE id = ?')->execute([$now, (int) $ok, $txt, $due ?: (int) $k['due'], $fails, $now, (int) $k['id']]);
        $pdo->prepare('INSERT INTO cl_care_log (care_id, at, ok, text) VALUES (?,?,?,?)')->execute([(int) $k['id'], $now, (int) $ok, $txt]);
        // tell the owner once when something goes wrong (website down = 2 checks in a row), and once when it's fixed
        $bad = !$ok && ($k['tpl'] !== 'up' || $fails >= 2);
        if ($bad && !(int) $k['pushed']) { $c = cl_get((int) $k['client_id']); try { push_all('⚠ ' . ($c['name'] ?? '') . ': ' . $k['title'], $txt, '/demo-admin/#clients', 'care-' . $k['id']); } catch (Throwable $e) {} $pdo->prepare('UPDATE cl_care SET pushed = 1 WHERE id = ?')->execute([(int) $k['id']]); }
        if ($ok && (int) $k['pushed']) $pdo->prepare('UPDATE cl_care SET pushed = 0 WHERE id = ?')->execute([(int) $k['id']]);
        $log[] = 'care ' . $k['id'] . ($ok ? ' ok' : ' bad');
        if ($k['tpl'] === 'up' && !$ok && $fails === 1) { $pdo->prepare('UPDATE cl_care SET last_run = ? WHERE id = ?')->execute([$now - 20 * 3600 + 900, (int) $k['id']]); }   // re-check in 15 min
    }
    return $log;
}
/* What Today, the morning briefing and the badge show. */
function clients_summary(int $now): array {
    $pdo = cl_db();
    $s = ['monthly' => 0, 'plans' => 0, 'bills' => [], 'grace' => 0, 'inv_unsent' => 0, 'care_due' => 0, 'care_bad' => 0, 'leads_due' => 0, 'leads_open' => 0, 'pipeline' => 0];
    foreach ($pdo->query("SELECT * FROM cl_plans WHERE status IN ('active','paused','sent')")->fetchAll() as $p) {
        if ($p['status'] === 'active') { $s['monthly'] += (int) $p['amount']; $s['plans']++; }
        foreach ($pdo->query('SELECT * FROM cl_bills WHERE plan_id = ' . (int) $p['id'] . " AND status IN ('due','failed')")->fetchAll() as $b) {
            [$st] = cl_bill_state($b, $p, $now);
            if ($st === 'late' || $st === 'grace') { $s['bills'][] = ['client' => (cl_get((int) $p['client_id'])['name'] ?? ''), 'amount' => (int) $b['amount'], 'state' => $st, 'wa' => (int) $b['wa_due']]; if ($st === 'grace') $s['grace']++; }
        }
    }
    $s['inv_unsent'] = (int) $pdo->query('SELECT COUNT(*) FROM invoices WHERE sent_at = 0 AND created > ' . ($now - 60 * 86400))->fetchColumn();
    foreach ($pdo->query("SELECT * FROM cl_care WHERE status = 'on'")->fetchAll() as $k) { [$st] = care_state($k, $now); if ($st === 'due') $s['care_due']++; if ($st === 'bad') $s['care_bad']++; }
    foreach ($pdo->query("SELECT * FROM leads WHERE status NOT IN ('won','lost')")->fetchAll() as $l) { $s['leads_open']++; $s['pipeline'] += (int) $l['value']; if ((int) $l['next_at'] && (int) $l['next_at'] <= $now + 3600) $s['leads_due']++; }
    return $s;
}
