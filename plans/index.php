<?php
/* Client page for a monthly plan: /c/<token>. What's included, the monthly price, set up card payments (Stripe), status. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/clients.php';
security_headers(true);
header('Cache-Control: no-store');
$p = cl_plan_by_token((string) ($_GET['k'] ?? ''));
$owner = admin_token() !== null;
if (!$p) http_response_code(404);
if ($p && isset($_GET['done'])) { cl_plan_sync($p); $p = cl_plan((int) $p['id']); }
$c = $p ? cl_get((int) $p['client_id']) : null;
$now = now();
$bills = $p ? cl_bills((int) $p['id']) : [];
$open = null; foreach ($bills as $b) if ($b['status'] !== 'paid' && $b['status'] !== 'void' && (int) $b['due'] <= $now + 3 * 86400) { $open = $b; break; }
$card = jobs_stripe_key() !== '';
$logo = preg_replace('/<svg /', '<svg aria-hidden="true" ', (string) @file_get_contents(SITE_ROOT . '/assets/brand/smr-digital.svg'), 1);
$incl = $p ? array_values(array_filter(array_map('trim', explode("\n", (string) $p['incl'])))) : [];
?><!doctype html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#08080f">
<title><?= $p ? h($p['title'] . ' · SMR') : 'SMR' ?></title>
<meta property="og:title" content="<?= $p ? h('Your monthly plan: ' . $p['title']) : 'SMR' ?>">
<meta property="og:description" content="<?= $p ? h(money((int) $p['amount']) . ' a month · tap to set up your payment') : '' ?>">
<meta property="og:image" content="<?= h(job_host()) ?>/demo-admin/icon-512.png">
<link rel="icon" href="/demo-admin/icon-192.png">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html{touch-action:manipulation}body{margin:0;background:#08080f;color:#fff;font:15px/1.55 Manrope,system-ui,sans-serif}
.w{max-width:520px;margin:0 auto;padding:22px 18px 40px}.lg{display:flex;justify-content:center;padding:6px 0 18px}.lg svg{height:40px;width:auto}
.card{background:#fbf9f4;color:#15151f;border-radius:22px;padding:22px;margin-bottom:14px}
.k{font:800 11px Manrope,sans-serif;letter-spacing:.12em;color:#8a6bd8;text-transform:uppercase}
h1{font:800 24px/1.2 Sora,sans-serif;margin:6px 0 4px;letter-spacing:-.01em}.pr{font:800 34px Sora,sans-serif;margin:10px 0 2px;background:linear-gradient(110deg,#5b5bff,#d63bff);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.3}
.sub{color:#6b6b80;font-size:13.5px}ul{margin:12px 0 0;padding:0;list-style:none}li{padding:8px 0 8px 28px;border-top:1px solid #ecebf2;position:relative;font-size:14.5px}li:first-child{border-top:0}
li:before{content:"";position:absolute;left:2px;top:12px;width:16px;height:16px;border-radius:50%;background:#e7f8ef url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f8a5a' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 12.5l4 4 8-9'/%3E%3C/svg%3E") center/11px no-repeat}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px;border-radius:16px;border:0;font:800 16px Manrope,sans-serif;text-decoration:none;cursor:pointer;margin-top:12px}
.pri{background:linear-gradient(110deg,#5b5bff,#d63bff);color:#fff}.wa{background:#25d366;color:#fff}.ok{display:flex;gap:10px;align-items:center;padding:14px;border-radius:14px;background:#e7f8ef;color:#0f6b46;font-weight:700;margin-top:12px}
.bad{padding:14px;border-radius:14px;background:#fff0f2;color:#b01e3a;font-weight:700;margin-top:12px}.sm{font-size:12.5px;color:#8a8aa0;margin-top:12px}
.own{background:#ffc061;color:#3a2600;padding:10px 14px;border-radius:12px;font-weight:800;font-size:13px;margin-bottom:14px}
</style></head><body><div class="w">
<div class="lg"><?= $logo ?></div>
<?php if (!$p): ?><div class="card"><h1>Plan not found</h1><p class="sub">Please message Summar on WhatsApp: 07931 814538.</p></div>
<?php else: ?>
<?php if ($owner): ?><div class="own">Owner preview: this is what <?= h($c['name'] ?? 'they') ?> see<?= isset($c) ? 's' : '' ?>.</div><?php endif; ?>
<div class="card">
  <div class="k">Your monthly plan<?= $c ? ' · ' . h($c['name']) : '' ?></div>
  <h1><?= h($p['title']) ?></h1>
  <div class="pr"><?= money((int) $p['amount']) ?><span style="font-size:16px"> a month</span></div>
  <div class="sub">Fixed monthly price. No commission. Cancel any time with a month's notice.</div>
  <?php if ($incl): ?><ul><?php foreach ($incl as $x): ?><li><?= h($x) ?></li><?php endforeach; ?></ul><?php endif; ?>
</div>
<div class="card">
<?php if ($p['method'] === 'card'): ?>
  <?php if ($p['stripe_sub'] !== '' && $p['status'] === 'active'): ?>
    <div class="ok">✓ Card payments are set up. You'll be charged <?= money((int) $p['amount']) ?> each month and get a receipt by email.</div>
    <?php if ($open && $open['status'] === 'failed' && $open['pay_url'] !== ''): ?><div class="bad">This month's payment didn't go through. You can pay it (or use a different card) here:</div><a class="btn pri" href="<?= h($open['pay_url']) ?>">Pay <?= money((int) $open['amount']) ?> now</a><?php endif; ?>
  <?php elseif ($p['status'] === 'paused' || $p['status'] === 'ended'): ?>
    <div class="bad">This plan is <?= $p['status'] === 'paused' ? 'paused' : 'no longer active' ?>. Please message Summar to sort it.</div>
  <?php elseif ($card): ?>
    <div class="k">Set up your payment</div>
    <p class="sub" style="margin:6px 0 0">Secure card payment through Stripe (card, Apple Pay or Google Pay). Takes about a minute. Your first payment is today, then the same day each month.</p>
    <a class="btn pri" href="/plans/api.php?a=start&k=<?= h($p['token']) ?>">Set up monthly payment</a>
  <?php else: ?>
    <p class="sub">Card payments are being set up. Summar will message you.</p>
  <?php endif; ?>
<?php else: ?>
  <div class="k">How you pay</div><p class="sub" style="margin:6px 0 0">Cash or card each month, around the <?= date('jS', mktime(0, 0, 0, 1, max(1, (int) $p['day']))) ?>. <?= $open ? 'This month\'s ' . money((int) $open['amount']) . ' is ' . ((int) $open['due'] < $now ? 'due now.' : 'due ' . date('j M', (int) $open['due']) . '.') : '' ?></p>
<?php endif; ?>
  <a class="btn wa" href="https://wa.me/447931814538?text=<?= rawurlencode('Hi Summar, about my monthly plan (' . $p['title'] . '): ') ?>" target="_blank" rel="noopener">Questions? Message on WhatsApp</a>
  <p class="sm">SMR Digital · <?= h(cl_cfg()['email']) ?> · smrgraphics.co.uk</p>
</div>
<?php endif; ?>
</div></body></html>
