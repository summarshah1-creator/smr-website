<?php
/* Invoice page: /i/<token>. A clean A4 invoice the client can open on their phone and save as a PDF (print). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/clients.php';
security_headers(true);
header('Cache-Control: no-store');
$i = inv_by_token((string) ($_GET['k'] ?? ''));
$owner = admin_token() !== null;
if (!$i) { http_response_code(404); }
if ($i && !$owner) {
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua !== '' && !preg_match('/bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|curl|wget|python|headless/i', $ua))
        cl_db()->prepare('UPDATE invoices SET views = views + 1 WHERE id = ?')->execute([(int) $i['id']]);
}
$cfg = cl_cfg();
$logo = (string) @file_get_contents(SITE_ROOT . '/assets/brand/smr-graphics-dark.svg');
$logo = preg_replace('/<svg /', '<svg aria-hidden="true" ', $logo, 1);
$items = $i ? (json_decode($i['items'], true) ?: []) : [];
$meth = ['card' => 'Card', 'cash' => 'Cash', 'other' => 'Other'];
?><!doctype html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?= $i ? h('Invoice ' . inv_no($i) . ' · ' . $cfg['biz']) : 'Invoice' ?></title>
<meta property="og:title" content="<?= $i ? h('Invoice ' . inv_no($i) . ' · ' . money((int) $i['total']) . ' paid') : 'Invoice' ?>">
<meta property="og:description" content="<?= h($cfg['biz']) ?> · tap to view or save as PDF">
<meta property="og:image" content="<?= h(job_host()) ?>/demo-admin/icon-512.png">
<link rel="icon" href="/demo-admin/icon-192.png">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;background:#eceaf2;font:15px/1.5 Manrope,system-ui,sans-serif;color:#15151f}
.bar{position:sticky;top:0;z-index:2;display:flex;gap:8px;justify-content:center;padding:10px;background:#12111f}
.bar button,.bar a{border:0;border-radius:999px;padding:10px 18px;font:800 14px Manrope,sans-serif;cursor:pointer;text-decoration:none}
.bar .p{background:linear-gradient(110deg,#5b5bff,#d63bff);color:#fff}.bar .s{background:#2a2940;color:#fff}
.pg{max-width:820px;margin:18px auto 40px;background:#fff;border-radius:14px;padding:38px 40px;box-shadow:0 20px 50px -30px rgba(20,10,60,.5)}
.hd{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.hd svg{height:46px;width:auto}
.ttl{text-align:right}.ttl h1{font:800 30px Sora,sans-serif;margin:0;letter-spacing:-.02em}.ttl div{color:#6b6b80;font-size:13.5px}
.paid{display:inline-block;margin-top:6px;padding:4px 12px;border-radius:999px;background:#e7f8ef;color:#0f8a5a;font:800 12px Manrope,sans-serif;letter-spacing:.1em}
.two{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:28px 0 22px}.two h3{font:800 11px Manrope,sans-serif;letter-spacing:.12em;color:#8a8aa0;margin:0 0 6px;text-transform:uppercase}
.two p{margin:0;white-space:pre-line;font-size:14px}
table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;font:800 11px Manrope,sans-serif;letter-spacing:.1em;color:#8a8aa0;text-transform:uppercase;padding:10px 8px;border-bottom:2px solid #15151f}
td{padding:11px 8px;border-bottom:1px solid #ecebf2;vertical-align:top}td.r,th.r{text-align:right;white-space:nowrap}tr.info td{color:#8a8aa0}
.tot{display:flex;justify-content:flex-end;margin-top:14px}.tot div{min-width:260px}.tot p{display:flex;justify-content:space-between;margin:6px 0}.tot .big{font:800 20px Sora,sans-serif;border-top:2px solid #15151f;padding-top:10px}
.ft{margin-top:34px;padding-top:16px;border-top:1px solid #ecebf2;color:#6b6b80;font-size:13px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
.nf{max-width:420px;margin:80px auto;text-align:center;padding:30px;background:#fff;border-radius:14px}
@media (max-width:620px){.pg{margin:0;border-radius:0;padding:24px 18px}.two{grid-template-columns:1fr;gap:14px}.hd svg{height:36px}.ttl h1{font-size:24px}th.q,td.q,th.e,td.e{display:none}}
@media print{body{background:#fff}.bar{display:none}.pg{box-shadow:none;margin:0;max-width:none;padding:0}@page{size:A4;margin:16mm}}
</style></head><body>
<?php if (!$i): ?><div class="nf"><h2>Invoice not found</h2><p>Please ask SMR for a new link: <?= h($cfg['phone']) ?></p></div>
<?php else: ?>
<div class="bar"><button class="p" onclick="window.print()">Save as PDF</button><a class="s" href="https://wa.me/447931814538" target="_blank" rel="noopener">Questions? WhatsApp</a></div>
<div class="pg">
  <div class="hd"><div><?= $logo ?></div><div class="ttl"><h1>Invoice</h1><div><?= h(inv_no($i)) ?> · <?= date('j F Y', (int) $i['created']) ?></div><?php if ((int) $i['paid']): ?><span class="paid">PAID</span><?php endif; ?></div></div>
  <div class="two">
    <div><h3>From</h3><p><b><?= h($cfg['biz']) ?></b><?= "\n" . h($cfg['addr']) . "\n" . h($cfg['email']) . ' · ' . h($cfg['phone']) . "\n" . h($cfg['web']) . ($cfg['vat'] !== '' ? "\nVAT no. " . h($cfg['vat']) : '') ?></p></div>
    <div><h3>Bill to</h3><p><b><?= h($i['client']) ?></b><?= $i['person'] !== '' && $i['person'] !== $i['client'] ? "\n" . h($i['person']) : '' ?><?= $i['address'] !== '' ? "\n" . h($i['address']) : '' ?><?= $i['email'] !== '' ? "\n" . h($i['email']) : '' ?></p></div>
  </div>
  <?php if ($i['title'] !== ''): ?><p style="margin:0 0 10px;font-weight:700"><?= h($i['title']) ?></p><?php endif; ?>
  <table><thead><tr><th>Description</th><th class="r q">Qty</th><th class="r e">Each</th><th class="r">Amount</th></tr></thead><tbody>
  <?php foreach ($items as $it): $q = (int) ($it['q'] ?? 1); $p = (int) ($it['p'] ?? 0); ?>
    <tr class="<?= !empty($it['info']) ? 'info' : '' ?>"><td><?= h($it['d'] ?? '') ?><?= !empty($it['info']) ? ' <small>(part of the job)</small>' : '' ?></td><td class="r q"><?= $q ?></td><td class="r e"><?= money($p) ?></td><td class="r"><?= !empty($it['info']) ? '' : money($q * $p) ?></td></tr>
  <?php endforeach; ?>
  </tbody></table>
  <div class="tot"><div>
    <p class="big"><span>Total</span><span><?= money((int) $i['total']) ?></span></p>
    <?php if ((int) $i['paid']): ?><p><span>Paid <?= date('j M Y', (int) $i['paid_at']) ?><?= $i['method'] !== '' ? ' · ' . h($meth[$i['method']] ?? ucfirst($i['method'])) : '' ?></span><span><?= money((int) $i['total']) ?></span></p><p><b>Balance due</b><b>£0</b></p><?php endif; ?>
  </div></div>
  <?php if ($i['note'] !== ''): ?><p style="font-size:13.5px"><?= nl2br(h($i['note'])) ?></p><?php endif; ?>
  <div class="ft"><span><?= h($cfg['footer']) ?></span><span><?= h($cfg['biz']) ?> · <?= h($cfg['web']) ?></span></div>
</div>
<?php endif; ?>
</body></html>
