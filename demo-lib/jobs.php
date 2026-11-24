<?php
/* SMR Admin → Jobs & payments.
   Every job has a client agreement page (/j/<token>): quote, what's included, deadline, payment plan,
   a free "on the house" extra and the client's old unpaid balance. Nothing is active until they agree
   (and pay any deposit). Payments: Stripe Checkout (card, Apple Pay, Google Pay) or cash marked by the owner.
   Reminders: automatic emails to the client + ready-to-send WhatsApp messages + pushes to the owner.
   Money is kept in pence. Times are unix seconds, Europe/London. */
if (!defined('SMR_DEMO')) { http_response_code(404); exit; }
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/push.php';
require_once __DIR__ . '/mail.php';
require_once __DIR__ . '/proofs.php';

const JOB_TERMS = [
    'upfront' => 'Full payment up front',
    'deposit' => 'Deposit, then the rest before hand-over',
    'ondelivery' => 'Pay on delivery / collection',
    'bydate' => 'Pay by a set date',
];
const JOB_HANDOVER = ['collection' => 'Collection', 'delivery' => 'Delivery', 'digital' => 'Sent digitally', 'fitting' => 'Fitted / installed', 'golive' => 'Goes live'];
const JOB_AREAS = ['graphics' => 'Graphics', 'digital' => 'Digital', 'marketing' => 'Marketing', 'plates' => 'Plates', 'direct' => 'SMR Direct'];
/* Free "on the house" extras the admin suggests (owner rule, Nov 2026: give every client a taster that surprises them). */
const JOB_EXTRAS = [
    'graphics' => ['5 social media posts to launch it', 'Your logo cleaned up + vector files (SVG, PDF, PNG)', 'Matching Instagram story + WhatsApp status version', 'A digital version for your website and Google profile', 'QR code that links to your menu / website'],
    'digital' => ['Google Business profile tidy-up', '5 launch posts for your new site / app', 'Instagram highlight covers to match', 'A QR code poster for the counter / window', 'Quick check of your online presence with tips'],
    'marketing' => ['A free extra week of stories', 'Instagram highlight covers', 'Bio + link-in-bio tidy-up', 'A short promo video from your photos', '3 ready-made replies for your DMs'],
    'plates' => ['Matching key ring', 'Photo of your car with the new plates for your socials', 'Free plate screws / pads'],
    'direct' => ['5 launch posts', 'A QR code poster for the counter / window', 'Google Business profile tidy-up'],
];
/* Quick check of a client's branding and online presence (prompts the owner, ticks become the free extra). */
const JOB_AUDIT = [
    'Logo only as a low-res picture (no vector)', 'No Google Business profile, or out of date', 'Instagram bio / highlights messy or missing', 'No website, or not mobile-friendly',
    'Menu / prices not online', 'Inconsistent colours and fonts across their stuff', 'Few or no Google reviews', 'No WhatsApp Business catalogue / quick replies',
    'Old or poor photos', 'No QR code in the shop / on print',
];
const JOB_DEFAULT_TERMS = "Work starts once you've agreed to this quote and any deposit is paid.\nDeadlines depend on us getting your content, photos and approvals in time.\nTwo rounds of changes are included; bigger changes are quoted separately.\nFinished work is handed over once it's paid as agreed above.\nCash payments must be paid by the due date shown.";

function jobs_db(): PDO {
    static $done = false;
    $pdo = db();
    if ($done) return $pdo;
    $done = true;
    $pdo->exec("CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, client TEXT NOT NULL, person TEXT DEFAULT '', phone TEXT DEFAULT '', email TEXT DEFAULT '',
        area TEXT DEFAULT 'graphics', title TEXT NOT NULL, items TEXT DEFAULT '[]', total INTEGER DEFAULT 0, deadline INTEGER DEFAULT 0,
        handover TEXT DEFAULT 'collection', terms TEXT DEFAULT 'deposit', deposit_pct INTEGER DEFAULT 50, pay_by INTEGER DEFAULT 0,
        card_ok INTEGER DEFAULT 1, cash_ok INTEGER DEFAULT 1, auto_email INTEGER DEFAULT 1, extra TEXT DEFAULT '', notes TEXT DEFAULT '', public_note TEXT DEFAULT '',
        status TEXT DEFAULT 'draft', sent_at INTEGER DEFAULT 0, agreed_at INTEGER DEFAULT 0, agreed_name TEXT DEFAULT '', agreed_ip TEXT DEFAULT '', changed_at INTEGER DEFAULT 0,
        delivered_at INTEGER DEFAULT 0, override INTEGER DEFAULT 0, cancelled_at INTEGER DEFAULT 0, views INTEGER DEFAULT 0, last_view INTEGER DEFAULT 0,
        n_agree INTEGER DEFAULT 0, created INTEGER, updated INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS job_pays (
        id INTEGER PRIMARY KEY, job_id INTEGER NOT NULL, n INTEGER DEFAULT 1, label TEXT NOT NULL, amount INTEGER NOT NULL, due_type TEXT NOT NULL, due INTEGER DEFAULT 0,
        status TEXT DEFAULT 'due', method TEXT DEFAULT '', paid_at INTEGER DEFAULT 0, session TEXT DEFAULT '', stage INTEGER DEFAULT 0, wa_due INTEGER DEFAULT 0, last_rem INTEGER DEFAULT 0)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS job_pays_j ON job_pays(job_id)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS job_events (id INTEGER PRIMARY KEY, job_id INTEGER, at INTEGER, what TEXT)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS job_kv (k TEXT PRIMARY KEY, v TEXT)");
    return $pdo;
}
function job_kv(string $k, string $def = ''): string { $st = jobs_db()->prepare('SELECT v FROM job_kv WHERE k = ?'); $st->execute([$k]); $v = $st->fetchColumn(); return $v === false ? $def : (string) $v; }
function job_kv_set(string $k, string $v): void { jobs_db()->prepare('INSERT OR REPLACE INTO job_kv (k, v) VALUES (?, ?)')->execute([$k, $v]); }
function jobs_cfg(): array {
    $c = json_decode(job_kv('cfg'), true) ?: [];
    return $c + ['terms' => JOB_DEFAULT_TERMS, 'stripe' => '', 'push' => 1, 'email_from' => '10:00'];
}
function jobs_cfg_public(): array {
    $c = jobs_cfg();
    $k = $c['stripe'] !== '' ? mail_decrypt($c['stripe']) : '';
    return ['terms' => $c['terms'], 'stripe' => $k !== '', 'stripe_hint' => $k !== '' ? substr($k, 0, 8) . '…' . substr($k, -4) : '', 'stripe_test' => strpos($k, 'sk_test_') === 0,
        'push' => (int) $c['push'], 'mail' => (bool) mail_cfg()];
}
function jobs_stripe_key(): string { $c = jobs_cfg(); return $c['stripe'] !== '' ? mail_decrypt($c['stripe']) : ''; }

function money(int $p): string { return '£' . number_format($p / 100, $p % 100 ? 2 : 0); }
function job_ev(int $id, string $what): void { jobs_db()->prepare('INSERT INTO job_events (job_id, at, what) VALUES (?, ?, ?)')->execute([$id, now(), mb_substr($what, 0, 300)]); }
function job_by_id(int $id): ?array { $st = jobs_db()->prepare('SELECT * FROM jobs WHERE id = ?'); $st->execute([$id]); return $st->fetch() ?: null; }
function job_by_token(string $t): ?array {
    if (!preg_match('/^[A-Za-z0-9_-]{12,40}$/', $t)) return null;
    $st = jobs_db()->prepare('SELECT * FROM jobs WHERE token = ?'); $st->execute([$t]); return $st->fetch() ?: null;
}
function job_pays(int $id): array { $st = jobs_db()->prepare('SELECT * FROM job_pays WHERE job_id = ? ORDER BY n'); $st->execute([$id]); return $st->fetchAll(); }
function job_host(): string {
    $host = preg_replace('/^www\./', '', preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
    if ($host === '') $host = 'smrgraphics.co.uk';
    return (preg_match('/^(127\.|localhost)/', $host) ? 'http' : 'https') . '://' . $host;
}
function job_url(array $j): string { return job_host() . '/j/' . $j['token']; }
/* Same client = same phone number (last 10 digits), else the same name. */
function job_who(array $j): string {
    $d = preg_replace('/\D/', '', (string) $j['phone']);
    return strlen($d) >= 10 ? 'p' . substr($d, -10) : 'n' . strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $j['client']));
}

/* Payment plan from the terms. due_type: agree = when they agree, handover = before hand-over (the deadline), date = by pay_by. */
function job_plan(array $j): array {
    $t = (int) $j['total'];
    if ($t <= 0) return [];
    switch ($j['terms']) {
        case 'upfront': return [['Full payment', $t, 'agree']];
        case 'ondelivery': return [['Payment on ' . strtolower(JOB_HANDOVER[$j['handover']] ?? 'hand-over'), $t, 'handover']];
        case 'bydate': return [['Payment', $t, 'date']];
        default:
            $pct = max(10, min(90, (int) $j['deposit_pct']));
            $dep = (int) round($t * $pct / 100);
            return [['Deposit (' . $pct . '%)', $dep, 'agree'], ['Balance before ' . strtolower(JOB_HANDOVER[$j['handover']] ?? 'hand-over'), $t - $dep, 'handover']];
    }
}
function job_due_for(array $j, string $type): int {
    if ($type === 'agree') return (int) $j['agreed_at'];
    if ($type === 'handover') return (int) $j['deadline'];
    return (int) $j['pay_by'];
}
/* Rebuild unpaid rows from the plan (paid rows are kept as they are). */
function job_sync_pays(array $j): void {
    $pdo = jobs_db();
    $old = job_pays((int) $j['id']);
    $paid = array_values(array_filter($old, function ($p) { return $p['status'] === 'paid'; }));
    $paidSum = array_sum(array_map(function ($p) { return (int) $p['amount']; }, $paid));
    $pdo->prepare("DELETE FROM job_pays WHERE job_id = ? AND status != 'paid'")->execute([(int) $j['id']]);
    $plan = job_plan($j); $n = count($paid); $covered = $paidSum;
    $ins = $pdo->prepare('INSERT INTO job_pays (job_id, n, label, amount, due_type, due) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($plan as $p) {
        $amt = $p[1];
        if ($covered >= $amt) { $covered -= $amt; continue; }     // already paid by earlier payments
        $amt -= $covered; $covered = 0;
        $ins->execute([(int) $j['id'], ++$n, $p[0], $amt, $p[2], job_due_for($j, $p[2])]);
    }
}
function job_owed(array $pays, bool $dueOnly = false, int $now = 0): int {
    $s = 0;
    foreach ($pays as $p) if ($p['status'] !== 'paid' && (!$dueOnly || ((int) $p['due'] && (int) $p['due'] <= $now))) $s += (int) $p['amount'];
    return $s;
}
/* Unpaid money on this client's OTHER live jobs (agreed or delivered). */
function job_prev_balance(array $j): array {
    $who = job_who($j); $out = []; $sum = 0;
    foreach (jobs_db()->query("SELECT * FROM jobs WHERE status IN ('agreed','delivered') AND id != " . (int) $j['id'])->fetchAll() as $o) {
        if (job_who($o) !== $who) continue;
        $owed = 0;
        foreach (job_pays((int) $o['id']) as $p) if ($p['status'] !== 'paid' && ((int) $p['due'] && (int) $p['due'] <= now() || $o['status'] === 'delivered')) $owed += (int) $p['amount'];
        if ($owed > 0) { $out[] = ['title' => $o['title'], 'owed' => $owed, 'url' => job_url($o), 'id' => (int) $o['id']]; $sum += $owed; }
    }
    return ['sum' => $sum, 'jobs' => $out];
}
/* Where a job stands, in plain words. */
function job_stage(array $j, array $pays): array {
    if ($j['status'] === 'cancelled') return ['cancelled', 'Cancelled'];
    if ($j['status'] === 'draft') return ['draft', 'Draft · not sent yet'];
    if (!(int) $j['agreed_at']) return [(int) $j['changed_at'] ? 'reagree' : 'agree', (int) $j['changed_at'] ? 'Changed · waiting for them to agree again' : 'Waiting for them to agree'];
    $first = null; foreach ($pays as $p) if ($p['due_type'] === 'agree' && $p['status'] !== 'paid') $first = $p;
    if ($j['status'] === 'delivered') return job_owed($pays) > 0 ? ['owed', 'Handed over · ' . money(job_owed($pays)) . ' still owed'] : ['done', 'Complete · all paid'];
    if ($first) return ['deposit', 'Agreed · waiting for ' . strtolower(preg_replace('/ \(.*/', '', $first['label'])) . ' (' . money((int) $first['amount']) . ')'];
    return ['active', 'In progress'];
}
/* Hand-over lock: money due at agreement or before hand-over must be paid first. */
function job_lock(array $j, array $pays): int {
    $s = 0;
    foreach ($pays as $p) if ($p['status'] !== 'paid' && in_array($p['due_type'], ['agree', 'handover'], true)) $s += (int) $p['amount'];
    return $s;
}

function job_token(): string {
    do { $t = rand_token(12); } while (job_by_token($t));
    return $t;
}
function job_items_clean($items): array {
    $out = [];
    foreach ((array) $items as $it) {
        $d = mb_substr(trim((string) ($it['d'] ?? '')), 0, 200);
        if ($d === '') continue;
        $q = max(1, min(100000, (int) ($it['q'] ?? 1)));
        $p = max(0, (int) round(((float) ($it['p'] ?? 0)) * 100));   // price each, in pounds from the form
        $out[] = ['d' => $d, 'q' => $q, 'p' => $p];
        if (count($out) >= 40) break;
    }
    return $out;
}
function job_total(array $items): int { $t = 0; foreach ($items as $it) $t += $it['q'] * $it['p']; return $t; }

/* ---------- messages (WhatsApp text the owner sends, emails sent automatically) ---------- */
function job_first(array $j): string { $n = trim((string) ($j['person'] !== '' ? $j['person'] : $j['client'])); return $n !== '' ? preg_split('/[\s,(]+/', $n)[0] : 'there'; }
function job_msg_send(array $j): string {
    $x = trim((string) $j['extra']);
    return 'Hi ' . job_first($j) . ", here's your quote for " . $j['title'] . ":\n" . job_url($j)
        . "\n\nIt shows everything that's included, the deadline and how payment works. Just tap \"I agree\" at the bottom and we'll get started."
        . ($x !== '' ? "\n\nI've also added something on the house for you: " . $x . ' 🎁' : '') . "\n\nAny questions, just message me. Summar, SMR";
}
function job_msg_rem(array $j, array $p, int $stage): string {
    $f = job_first($j); $amt = money((int) $p['amount']); $u = job_url($j);
    $when = (int) $p['due'] ? date('l j M', (int) $p['due']) : 'now';
    switch ($stage) {
        case 1: return "Hi $f, just a heads-up: $amt for " . $j['title'] . " is due on $when. You can pay by card here: $u (or cash if we've arranged it). Thanks!";
        case 2: return "Hi $f, $amt for " . $j['title'] . " is due today. Pay by card here: $u. Thanks!";
        case 3: return "Hi $f, $amt for " . $j['title'] . " is now overdue. Please pay today here: $u, or let me know when you're dropping the cash. Thanks.";
        default: return "Hi $f, $amt for " . $j['title'] . " is still outstanding and well overdue. I can't carry on with the work or hand anything over until it's paid: $u. Please sort it today.";
    }
}
function job_email(array $j, string $subject, string $text): bool {
    if (!filter_var((string) $j['email'], FILTER_VALIDATE_EMAIL)) return false;
    $cfg = mail_cfg(); if (!$cfg) return false;
    try {
        [$msg] = mail_build($cfg, [$j['email']], [], $subject, $text);
        smtp_send($cfg, [$j['email']], $msg);
        return true;
    } catch (Throwable $e) { job_ev((int) $j['id'], 'Email failed: ' . $e->getMessage()); return false; }
}
function job_push(string $title, string $body, string $tag): void {
    if (!(int) jobs_cfg()['push']) return;
    try { push_all($title, $body, '/demo-admin/#jobs', $tag); } catch (Throwable $e) {}
}

/* ---------- Stripe Checkout (card, Apple Pay, Google Pay). No webhook needed: we check the session on return and in the tick. ---------- */
function stripe_call(string $method, string $path, array $data = []): array {
    $key = jobs_stripe_key();
    if ($key === '') throw new RuntimeException('Card payments are not set up yet.');
    $body = http_build_query($data);
    $url = 'https://api.stripe.com/v1/' . $path . ($method === 'GET' && $body !== '' ? '?' . $body : '');
    if (function_exists('curl_init')) {
        $c = curl_init($url);
        curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25, CURLOPT_USERPWD => $key . ':', CURLOPT_CUSTOMREQUEST => $method]);
        if ($method !== 'GET') curl_setopt($c, CURLOPT_POSTFIELDS, $body);
        $res = curl_exec($c); $code = (int) curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    } else {
        $ctx = stream_context_create(['http' => ['method' => $method, 'timeout' => 25, 'ignore_errors' => true,
            'header' => "Authorization: Basic " . base64_encode($key . ':') . "\r\nContent-Type: application/x-www-form-urlencoded\r\n", 'content' => $method === 'GET' ? '' : $body]]);
        $res = @file_get_contents($url, false, $ctx); $code = 0;
        foreach ($http_response_header ?? [] as $h) if (preg_match('#^HTTP/\S+ (\d+)#', $h, $m)) $code = (int) $m[1];
    }
    $j = json_decode((string) $res, true) ?: [];
    if ($code < 200 || $code >= 300) throw new RuntimeException('Stripe: ' . ($j['error']['message'] ?? 'no answer'));
    return $j;
}
function job_checkout(array $j, array $p): string {
    $s = stripe_call('POST', 'checkout/sessions', [
        'mode' => 'payment',
        'line_items[0][quantity]' => 1,
        'line_items[0][price_data][currency]' => 'gbp',
        'line_items[0][price_data][unit_amount]' => (int) $p['amount'],
        'line_items[0][price_data][product_data][name]' => mb_substr($j['title'] . ' · ' . $p['label'], 0, 120),
        'line_items[0][price_data][product_data][description]' => mb_substr('SMR · ' . $j['client'], 0, 200),
        'customer_email' => filter_var((string) $j['email'], FILTER_VALIDATE_EMAIL) ? $j['email'] : null,
        'client_reference_id' => 'job' . $j['id'] . '-pay' . $p['id'],
        'metadata[job]' => (int) $j['id'], 'metadata[pay]' => (int) $p['id'],
        'success_url' => job_host() . '/jobs/api.php?a=back&k=' . $j['token'] . '&sid={CHECKOUT_SESSION_ID}',
        'cancel_url' => job_url($j),
        'expires_at' => now() + 3600,
    ]);
    jobs_db()->prepare('UPDATE job_pays SET session = ? WHERE id = ?')->execute([(string) $s['id'], (int) $p['id']]);
    return (string) $s['url'];
}
/* Marks a payment paid if its Stripe session went through. Returns true when it was just marked. */
function job_check_session(array $p): bool {
    if ($p['status'] === 'paid' || $p['session'] === '' || jobs_stripe_key() === '') return false;
    try { $s = stripe_call('GET', 'checkout/sessions/' . rawurlencode($p['session'])); } catch (Throwable $e) { return false; }
    if (($s['payment_status'] ?? '') !== 'paid') return false;
    job_mark_paid((int) $p['id'], 'card');
    return true;
}
function job_mark_paid(int $payId, string $method): void {
    $pdo = jobs_db();
    $st = $pdo->prepare('SELECT * FROM job_pays WHERE id = ?'); $st->execute([$payId]); $p = $st->fetch();
    if (!$p || $p['status'] === 'paid') return;
    $pdo->prepare("UPDATE job_pays SET status = 'paid', method = ?, paid_at = ?, wa_due = 0 WHERE id = ?")->execute([$method, now(), $payId]);
    $j = job_by_id((int) $p['job_id']);
    if (!$j) return;
    job_ev((int) $j['id'], money((int) $p['amount']) . ' paid (' . ($method === 'card' ? 'card' : $method) . '): ' . $p['label']);
    if ($method === 'card') job_push('💷 Paid: ' . money((int) $p['amount']), $j['client'] . ' · ' . $j['title'] . ' · ' . $p['label'], 'job-paid-' . $payId);
}

/* ---------- reminders (called from pl_tick, so at most every 4 min) ---------- */
function jobs_tick(): array {
    $now = now(); $log = proofs_tick();
    $pdo = jobs_db();
    $h = (int) date('G', $now) * 60 + (int) date('i', $now);
    $emailOk = $h >= 9 * 60 && $h < 19 * 60;   // clients only get emails in the day
    foreach ($pdo->query("SELECT * FROM jobs WHERE status IN ('sent','agreed','delivered')")->fetchAll() as $j) {
        $id = (int) $j['id'];
        // Not agreed yet: nudge the owner every 2 days
        if ($j['status'] === 'sent' && !(int) $j['agreed_at'] && $now - max((int) $j['sent_at'], (int) $j['changed_at']) > 2 * 86400 && $now - (int) $j['n_agree'] > 2 * 86400) {
            $pdo->prepare('UPDATE jobs SET n_agree = ? WHERE id = ?')->execute([$now, $id]);
            job_push('Not agreed yet: ' . $j['client'], $j['title'] . ' · sent ' . date('j M', (int) $j['sent_at']) . '. Chase them before you start any work.', 'job-agree-' . $id);
            $log[] = 'agree ' . $id;
        }
        if (!(int) $j['agreed_at']) continue;
        foreach (job_pays($id) as $p) {
            if ($p['status'] === 'paid') continue;
            if ($p['session'] !== '' && job_check_session($p)) { $log[] = 'paid ' . $p['id']; continue; }
            $due = (int) $p['due'];
            if (!$due) continue;
            // stage 1: 2 days before (only if it was set well ahead), 2: due day, 3: 3 days late, 4: a week late
            $want = 0;
            if ($now >= $due + 7 * 86400) $want = 4; elseif ($now >= $due + 3 * 86400) $want = 3; elseif ($now >= pl_day0_j($due) + 10 * 3600 || $now >= $due) $want = 2; elseif ($now >= $due - 2 * 86400 && $due - (int) $j['agreed_at'] > 3 * 86400) $want = 1;
            if ($p['due_type'] === 'agree') $want = $now >= $due + 7 * 86400 ? 4 : ($now >= $due + 3 * 86400 ? 3 : ($now >= $due + 86400 ? 2 : 0));
            if ($want <= (int) $p['stage']) continue;
            if (!$emailOk && $want < 4) continue;
            $pdo->prepare('UPDATE job_pays SET stage = ?, wa_due = ?, last_rem = ? WHERE id = ?')->execute([$want, $want, $now, (int) $p['id']]);
            $sent = (int) $j['auto_email'] && $emailOk ? job_email($j, ['', 'Reminder: ', 'Due today: ', 'Overdue: ', 'Final reminder: '][$want] . money((int) $p['amount']) . ' for ' . $j['title'], job_msg_rem($j, $p, $want)) : false;
            job_ev($id, 'Reminder ' . $want . ' for ' . money((int) $p['amount']) . ($sent ? ' emailed' : '') . '; WhatsApp ready to send');
            $title = $want >= 4 ? '🛑 ' . $j['client'] . ' still owes ' . money((int) $p['amount']) : ($want === 3 ? 'Overdue: ' . $j['client'] . ' · ' . money((int) $p['amount']) : 'Payment reminder ready: ' . $j['client']);
            $body = $want >= 4 ? 'A week overdue. Stop work and don\'t hand anything over until it\'s paid. Tap to send the firm message.'
                : ($sent ? 'Email sent to them. ' : '') . 'Tap to send the WhatsApp reminder (it\'s written for you).';
            job_push($title, $body, 'job-rem-' . $p['id']);
            $log[] = 'rem ' . $p['id'] . ':' . $want;
        }
    }
    return $log;
}
function pl_day0_j(int $t): int { return (int) strtotime(date('Y-m-d 00:00:00', $t)); }

/* ---------- the shape sent to the admin page ---------- */
function job_row(array $j, int $now): array {
    $pays = job_pays((int) $j['id']);
    [$stage, $label] = job_stage($j, $pays);
    $prev = job_prev_balance($j);
    $rem = [];
    foreach ($pays as $p) if ($p['status'] !== 'paid' && (int) $p['wa_due']) $rem[] = ['pay' => (int) $p['id'], 'stage' => (int) $p['wa_due'], 'text' => job_msg_rem($j, $p, (int) $p['wa_due'])];
    $ev = jobs_db()->prepare('SELECT at, what FROM job_events WHERE job_id = ? ORDER BY at DESC LIMIT 30'); $ev->execute([(int) $j['id']]);
    return ['id' => (int) $j['id'], 'token' => $j['token'], 'url' => job_url($j), 'client' => $j['client'], 'person' => $j['person'], 'phone' => $j['phone'], 'email' => $j['email'],
        'area' => $j['area'], 'title' => $j['title'], 'items' => json_decode($j['items'], true) ?: [], 'total' => (int) $j['total'], 'deadline' => (int) $j['deadline'],
        'handover' => $j['handover'], 'terms' => $j['terms'], 'deposit_pct' => (int) $j['deposit_pct'], 'pay_by' => (int) $j['pay_by'], 'card_ok' => (int) $j['card_ok'], 'cash_ok' => (int) $j['cash_ok'],
        'auto_email' => (int) $j['auto_email'], 'extra' => $j['extra'], 'notes' => $j['notes'], 'public_note' => $j['public_note'], 'status' => $j['status'],
        'sent_at' => (int) $j['sent_at'], 'agreed_at' => (int) $j['agreed_at'], 'agreed_name' => $j['agreed_name'], 'changed_at' => (int) $j['changed_at'], 'delivered_at' => (int) $j['delivered_at'],
        'override' => (int) $j['override'], 'views' => (int) $j['views'], 'last_view' => (int) $j['last_view'], 'created' => (int) $j['created'],
        'stage' => $stage, 'label' => $label, 'owed' => job_owed($pays), 'overdue' => job_owed($pays, true, $now), 'lock' => job_lock($j, $pays), 'prev' => $prev,
        'pays' => array_map(function ($p) { return ['id' => (int) $p['id'], 'label' => $p['label'], 'amount' => (int) $p['amount'], 'due_type' => $p['due_type'], 'due' => (int) $p['due'],
            'status' => $p['status'], 'method' => $p['method'], 'paid_at' => (int) $p['paid_at'], 'stage' => (int) $p['stage']]; }, $pays),
        'remind' => $rem, 'msg_send' => job_msg_send($j), 'events' => $ev->fetchAll(), 'proof' => proof_for_job((int) $j['id'])];
}
function jobs_summary(array $rows): array {
    $s = ['owed' => 0, 'overdue' => 0, 'agree' => 0, 'active' => 0, 'remind' => 0, 'debtors' => []];
    foreach ($rows as $r) {
        if ($r['stage'] === 'cancelled' || $r['stage'] === 'draft') continue;
        if ($r['agreed_at']) $s['owed'] += $r['owed'];
        $s['overdue'] += $r['overdue'] + ($r['stage'] === 'owed' ? $r['owed'] - $r['overdue'] : 0);
        if (in_array($r['stage'], ['agree', 'reagree'], true)) $s['agree']++;
        if (in_array($r['stage'], ['active', 'deposit'], true)) $s['active']++;
        $s['remind'] += count($r['remind']);
        $od = $r['overdue'] + ($r['stage'] === 'owed' ? $r['owed'] - $r['overdue'] : 0);
        if ($od > 0) $s['debtors'][$r['client']] = ($s['debtors'][$r['client']] ?? 0) + $od;
    }
    return $s;
}
