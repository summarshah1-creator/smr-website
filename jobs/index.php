<?php
/* Client agreement page for a job: /j/<token>. Quote, what's included, deadline, payment plan, a free extra,
   any old unpaid balance, the terms, "I agree" and the payment buttons. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/jobs.php';
security_headers(true);
header('Cache-Control: no-store');

$j = job_by_token((string) ($_GET['k'] ?? ''));
$owner = admin_token() !== null;
if ($j && $j['status'] === 'cancelled' && !$owner) $j = null;
if (!$j) { http_response_code(404); }
$now = now();
if ($j && !$owner) {
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua !== '' && !preg_match('/bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|embedly|curl|wget|python|headless/i', $ua)) {
        $first = !(int) $j['views'];
        jobs_db()->prepare('UPDATE jobs SET views = views + 1, last_view = ? WHERE id = ?')->execute([$now, (int) $j['id']]);
        if ($first) { job_ev((int) $j['id'], 'They opened the quote'); job_push('👀 ' . $j['client'] . ' opened your quote', $j['title'], 'job-open-' . $j['id']); }
    }
}
// Back from Stripe: check any open card payments straight away
if ($j && isset($_GET['paid'])) foreach (job_pays((int) $j['id']) as $p) job_check_session($p);
if ($j) $j = job_by_id((int) $j['id']);

$area = $j && in_array($j['area'], ['digital', 'graphics', 'marketing', 'plates'], true) ? $j['area'] : 'digital';
$logo = (string) @file_get_contents(SITE_ROOT . '/assets/brand/smr-' . $area . '.svg');
$logoDark = (string) @file_get_contents(SITE_ROOT . '/assets/brand/smr-' . $area . '-dark.svg');
$fix = function ($svg, $id) { return preg_replace(['/<svg /', '/id="g"/', '/url\(#g\)/'], ['<svg aria-hidden="true" ', 'id="' . $id . '"', 'url(#' . $id . ')'], $svg, 1); };
$logo = $fix($logo, 'lg1'); $logoDark = preg_replace(['/id="g"/', '/url\(#g\)/'], ['id="lg2"', 'url(#lg2)'], $fix($logoDark, 'lg2'));

$wa = '447931814538';
$data = null;
if ($j) {
    $pays = job_pays((int) $j['id']);
    [$stage, $label] = job_stage($j, $pays);
    $prev = job_prev_balance($j);
    $cfg = jobs_cfg();
    $data = ['token' => $j['token'], 'owner' => $owner, 'stage' => $stage, 'agreed' => (int) $j['agreed_at'], 'card' => (int) $j['card_ok'] && jobs_stripe_key() !== '', 'cash' => (int) $j['cash_ok'],
        'paidNow' => isset($_GET['paid']), 'title' => $j['title'], 'first' => job_first($j)];
}
$fmtD = function ($t) { return $t ? date('l j F Y', $t) : ''; };
$wame = function ($text) use ($wa) { return 'https://wa.me/' . $wa . '?text=' . rawurlencode($text); };
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#08080f">
<title><?= $j ? h('Quote · ' . $j['title'] . ' · SMR') : 'SMR' ?></title>
<meta property="og:title" content="<?= $j ? h('Your quote: ' . $j['title']) : 'SMR' ?>">
<meta property="og:description" content="What's included, the deadline and how payment works. Tap to view and agree.">
<meta property="og:site_name" content="SMR">
<meta property="og:image" content="<?= h(job_host()) ?>/demo-admin/icon-512.png">
<link rel="icon" href="/demo-admin/icon-192.png">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
html{touch-action:manipulation;-webkit-text-size-adjust:100%;overscroll-behavior:none}
:root{--bg:#08080f;--ink:#15151f;--muted:#6b6b80;--line:#e8e6f0;--a1:#5b5bff;--a2:#d63bff;--grad:linear-gradient(110deg,var(--a1),var(--a2));--wa:#25d366;--ok:#11a36a;--bad:#e5334f;--warn:#c77a00}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:#f2f2fa;font:15px/1.5 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 10% 0%,rgba(91,91,255,.22),transparent 70%),radial-gradient(50% 40% at 100% 0%,rgba(214,59,255,.16),transparent 70%)}
a{color:inherit}button{font:inherit;cursor:pointer}
.hd{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;height:58px;padding:0 16px;padding-top:env(safe-area-inset-top);background:rgba(8,8,15,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.08)}
.hd .lg{margin-right:auto;display:flex}.hd .lg svg{height:26px;width:auto}
.hwa{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:999px;background:var(--wa);color:#fff;font-weight:800;font-size:13px;text-decoration:none}.hwa svg{width:17px;height:17px}
main{position:relative;max-width:720px;margin:0 auto;padding:18px 14px calc(40px + env(safe-area-inset-bottom))}
.paper{background:#fff;color:var(--ink);border-radius:22px;padding:22px 20px;box-shadow:0 30px 60px -30px rgba(0,0,0,.8)}
.top{display:flex;align-items:flex-start;gap:12px;justify-content:space-between}.top .lgd svg{height:30px;width:auto}
.ref{text-align:right;font-size:12px;color:var(--muted);line-height:1.4}.ref b{color:var(--ink)}
h1{font:800 24px/1.15 Sora,sans-serif;letter-spacing:-.02em;margin:22px 0 4px}
.for{color:var(--muted);font-size:14px}.for b{color:var(--ink)}
.pill{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:6px 11px;border-radius:999px;font-size:12.5px;font-weight:800}
.pill.w{background:#fff4e0;color:#9a5c00}.pill.g{background:#e3f7ee;color:#0b7a4f}.pill.r{background:#ffe6ea;color:#b4213a}.pill.p{background:#efeaff;color:#5b3fd6}
.alert{margin-top:16px;padding:14px;border-radius:16px;font-size:14px}.alert b{display:block;font-size:15px;margin-bottom:2px}
.alert.r{background:#fff0f2;border:1px solid #ffc7d0;color:#7d1426}.alert.w{background:#fff8ea;border:1px solid #ffe0a3;color:#6d4300}.alert.g{background:#eafaf2;border:1px solid #b6ecd2;color:#0b5c3b}
.alert a{font-weight:800}
h2{font:700 13px Manrope,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:26px 0 10px}
table{width:100%;border-collapse:collapse;font-size:14.5px}td{padding:10px 0;border-bottom:1px solid var(--line);vertical-align:top}td.q{color:var(--muted);width:46px;white-space:nowrap}td.p{text-align:right;white-space:nowrap;font-weight:700;padding-left:10px}
tr.tot td{border-bottom:0;font:800 18px Sora,sans-serif;padding-top:14px}
.gift{margin-top:18px;display:flex;gap:12px;align-items:flex-start;padding:16px;border-radius:18px;background:linear-gradient(135deg,#f3efff,#ffeefb);border:1px solid #e6dcff}
.gift .ic{width:42px;height:42px;border-radius:13px;background:var(--grad);display:grid;place-items:center;flex:none;color:#fff}.gift .ic svg{width:22px;height:22px}
.gift small{display:block;font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#7b4fd6}.gift b{display:block;font-size:15.5px;margin-top:2px}.gift span{font-size:13px;color:var(--muted)}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fact{padding:12px 14px;border-radius:14px;background:#f6f5fb}.fact small{display:block;font-size:11.5px;color:var(--muted);font-weight:700}.fact b{font-size:14.5px}
.pay{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}.pay:last-child{border-bottom:0}
.pay .n{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:13px;background:#f1eefb;color:#5b3fd6;flex:none}.pay.paid .n{background:var(--ok);color:#fff}
.pay .tx{flex:1;min-width:0}.pay .tx b{display:block;font-size:14.5px}.pay .tx span{font-size:12.5px;color:var(--muted)}.pay .am{font:800 16px Sora,sans-serif;white-space:nowrap}.pay.paid .am{color:var(--ok)}
.pay.late .tx span{color:var(--bad);font-weight:700}
.btns{display:grid;gap:10px;margin-top:14px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:15px;border:0;font-weight:800;font-size:15.5px;text-decoration:none;width:100%}
.btn.pri{background:var(--grad);color:#fff;box-shadow:0 14px 30px -14px rgba(155,70,255,.9)}.btn.wa{background:var(--wa);color:#fff}.btn.ghost{background:#f3f2f8;color:var(--ink)}
.btn[disabled]{opacity:.45;cursor:not-allowed}.btn svg{width:20px;height:20px}
.terms{font-size:13.5px;color:#3c3c4d;padding-left:18px}.terms li{margin:5px 0}
.agree{margin-top:24px;padding:18px;border-radius:20px;background:#f6f4ff;border:1.5px solid #ddd3ff}
.agree h3{font:800 18px Sora,sans-serif;margin-bottom:4px}.agree p{font-size:13.5px;color:var(--muted)}
.agree label.nm{display:block;font-size:12.5px;font-weight:800;color:var(--muted);margin:14px 0 6px}
.agree input[type=text]{width:100%;height:50px;border-radius:14px;border:1.5px solid #d9d4ee;padding:0 14px;font:600 16px Manrope,sans-serif;color:var(--ink);background:#fff;outline:0}
.agree input[type=text]:focus{border-color:#8f6bff}
.ck{display:flex;gap:10px;align-items:flex-start;margin-top:12px;font-size:13.5px;color:#3c3c4d}.ck input{width:22px;height:22px;flex:none;accent-color:#7b4fd6;margin-top:1px}
.done{margin-top:24px;display:flex;gap:12px;align-items:center;padding:16px;border-radius:18px;background:#eafaf2;border:1px solid #b6ecd2;color:#0b5c3b}.done svg{width:28px;height:28px;flex:none}
.foot{text-align:center;color:#8f8fa8;font-size:12.5px;margin-top:22px}.foot a{color:#cfc4ff;font-weight:700;text-decoration:none}
.own{margin-bottom:12px;padding:10px 14px;border-radius:14px;background:rgba(255,181,71,.14);border:1px solid rgba(255,181,71,.45);color:#ffe0a8;font-size:13px;font-weight:700}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);opacity:0;transition:.3s;background:#15151f;color:#fff;padding:12px 18px;border-radius:14px;font-weight:700;z-index:50;box-shadow:0 10px 30px rgba(0,0,0,.4)}.toast.on{opacity:1;transform:translateX(-50%)}
.gone{text-align:center;padding:60px 20px}.gone h1{color:#fff;margin:14px 0 8px}.gone p{color:#a3a3bd;margin-bottom:22px}
@media print{body{background:#fff}.hd,.btns,.agree,.foot,.own{display:none}.paper{box-shadow:none}}
</style>
</head>
<body>
<header class="hd"><a class="lg" href="https://smrgraphics.co.uk" target="_blank" rel="noopener" aria-label="SMR"><?= $logo ?></a>
  <a class="hwa" href="<?= h($wame($j ? 'Hi Summar, about my quote for ' . $j['title'] . ': ' : 'Hi Summar, ')) ?>" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>Ask a question</a></header>
<main>
<?php if (!$j): ?>
  <div class="gone"><h1>This quote isn't available</h1><p>It may have been replaced or cancelled. Message Summar for an up-to-date link.</p>
  <a class="btn wa" href="<?= h($wame('Hi Summar, my quote link isn\'t working. Could you send it again please?')) ?>" target="_blank" rel="noopener">Message on WhatsApp</a></div>
<?php else:
  $items = json_decode($j['items'], true) ?: [];
  $agreed = (int) $j['agreed_at'];
  $firstDue = null; foreach ($pays as $p) if ($p['status'] !== 'paid') { $firstDue = $p; break; }
  $pill = ['agree' => ['w', 'Waiting for your OK'], 'reagree' => ['w', 'Updated · please check and agree again'], 'deposit' => ['p', 'Agreed · payment needed to start'], 'active' => ['p', 'Agreed · work in progress'],
      'owed' => ['r', 'Payment outstanding'], 'done' => ['g', 'Complete · all paid'], 'draft' => ['w', 'Waiting for your OK'], 'cancelled' => ['r', 'Cancelled']][$stage];
?>
  <?php if ($owner): ?><div class="own">Owner preview: this is what they see. Your visits aren't counted.</div><?php endif; ?>
  <article class="paper">
    <div class="top"><span class="lgd"><?= $logoDark ?></span><div class="ref">Quote <b>#<?= (int) $j['id'] + 1000 ?></b><br><?= date('j M Y', (int) $j['created']) ?></div></div>
    <h1><?= h($j['title']) ?></h1>
    <div class="for">Prepared for <b><?= h($j['client']) ?></b><?= $j['person'] !== '' && $j['person'] !== $j['client'] ? ' · ' . h($j['person']) : '' ?></div>
    <span class="pill <?= $pill[0] ?>"><?= h($pill[1]) ?></span>

    <?php if ($prev['sum'] > 0): ?>
      <div class="alert r"><b>Previous balance: <?= money($prev['sum']) ?></b>There's money still owed on <?php echo implode(', ', array_map(function ($o) { return '<a href="' . h($o['url']) . '">' . h($o['title']) . '</a> (' . money($o['owed']) . ')'; }, $prev['jobs'])); ?>. This needs to be cleared before new work starts.</div>
    <?php endif; ?>
    <?php if ((int) $j['changed_at'] && !$agreed): ?><div class="alert w"><b>This quote was updated on <?= date('j M', (int) $j['changed_at']) ?></b>Please check it again and tap "I agree" at the bottom so we can carry on.</div><?php endif; ?>
    <?php if (isset($_GET['paid'])): $allPaid = !array_filter($pays, function ($p) { return $p['status'] !== 'paid'; }); ?>
      <div class="alert g"><b><?= $allPaid || !$firstDue || $firstDue['session'] === '' ? 'Payment received, thank you!' : 'Thank you! Your payment is being confirmed.' ?></b>A receipt is on its way to your email.</div>
    <?php endif; ?>

    <h2>What's included</h2>
    <table><?php foreach ($items as $it): ?><tr><td class="q"><?= (int) $it['q'] ?> ×</td><td><?= h($it['d']) ?></td><td class="p"><?= money((int) $it['q'] * (int) $it['p']) ?></td></tr><?php endforeach; ?>
      <tr class="tot"><td></td><td>Total</td><td class="p"><?= money((int) $j['total']) ?></td></tr></table>

    <?php if (trim($j['extra']) !== ''): ?>
      <div class="gift"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg></span>
        <div><small>On the house from SMR</small><b><?= h($j['extra']) ?></b><span>Free, as a thank-you for working with us.</span></div></div>
    <?php endif; ?>

    <h2>Timings</h2>
    <div class="facts">
      <div class="fact"><small>Ready by</small><b><?= (int) $j['deadline'] ? date('D j M Y', (int) $j['deadline']) : 'To be confirmed' ?></b></div>
      <div class="fact"><small>Hand-over</small><b><?= h(JOB_HANDOVER[$j['handover']] ?? 'Collection') ?></b></div>
    </div>

    <h2>How payment works</h2>
    <div class="pays">
    <?php $i = 0; foreach ($pays as $p): $i++; $paid = $p['status'] === 'paid'; $late = !$paid && (int) $p['due'] && (int) $p['due'] < $now - ($p['due_type'] === 'agree' ? 86400 : 0);
      $when = $paid ? 'Paid ' . date('j M', (int) $p['paid_at']) . ($p['method'] === 'cash' ? ' (cash)' : ($p['method'] === 'card' ? ' (card)' : ''))
        : ($p['due_type'] === 'agree' ? ($agreed ? ($late ? 'Due now' : 'Due now, to start the work') : 'Due when you agree, to start the work')
        : ($p['due_type'] === 'handover' ? 'Due before ' . strtolower(JOB_HANDOVER[$j['handover']] ?? 'hand-over') . ((int) $p['due'] ? ' (' . date('j M', (int) $p['due']) . ')' : '') : 'Due by ' . date('l j M', (int) $p['due'])));
      if ($late && $p['due_type'] !== 'agree') $when = 'Overdue since ' . date('j M', (int) $p['due']); ?>
      <div class="pay<?= $paid ? ' paid' : '' ?><?= $late ? ' late' : '' ?>"><span class="n"><?= $paid ? '✓' : $i ?></span><div class="tx"><b><?= h($p['label']) ?></b><span><?= h($when) ?></span></div><span class="am"><?= money((int) $p['amount']) ?></span></div>
    <?php endforeach; ?>
    </div>
    <?php if ($agreed && $firstDue): $amt = money((int) $firstDue['amount']); ?>
      <div class="btns">
        <?php if ($data['card']): ?><a class="btn pri" href="/jobs/api.php?a=pay&k=<?= h($j['token']) ?>&p=<?= (int) $firstDue['id'] ?>"<?= $owner ? ' onclick="return confirm(\'This opens the real card payment page. Carry on?\')"' : '' ?>><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></svg>Pay <?= $amt ?> by card · Apple Pay · Google Pay</a><?php endif; ?>
        <?php if ((int) $j['cash_ok']): ?><a class="btn <?= $data['card'] ? 'ghost' : 'wa' ?>" href="<?= h($wame('Hi Summar, I\'ll pay the ' . $amt . ' for ' . $j['title'] . ' in cash. I can drop it on: ')) ?>" target="_blank" rel="noopener">Paying cash? Tell Summar when</a><?php endif; ?>
      </div>
      <?php if ((int) $j['cash_ok']): ?><p style="font-size:12.5px;color:var(--muted);margin-top:8px;text-align:center">Cash must be paid by the due date.<?= $data['card'] ? ' Card payments are secure through Stripe.' : '' ?></p><?php endif; ?>
    <?php endif; ?>

    <h2>Good to know</h2>
    <ul class="terms"><?php foreach (array_filter(array_map('trim', explode("\n", $cfg['terms'] . "\n" . $j['public_note']))) as $t): ?><li><?= h($t) ?></li><?php endforeach; ?></ul>

    <?php if ($agreed): ?>
      <div class="done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.7 2.7L16.5 9"/></svg>
        <div><b>Agreed<?= $j['agreed_name'] !== '' && $j['agreed_ip'] !== 'owner' ? ' by ' . h($j['agreed_name']) : '' ?></b><br><span style="font-size:13px"><?= date('j M Y, H:i', $agreed) ?></span></div></div>
    <?php elseif ($stage !== 'cancelled'): ?>
      <form class="agree" id="agree">
        <h3>Happy with everything?</h3>
        <p>Agreeing locks in the price, what's included, the deadline and the payment plan above, so we're both clear from the start.</p>
        <label class="nm" for="nm">Your full name</label>
        <input type="text" id="nm" autocomplete="name" placeholder="e.g. <?= h($j['person'] !== '' ? $j['person'] : 'Your name') ?>" maxlength="80">
        <label class="ck"><input type="checkbox" id="ok"><span>I agree to this quote, the deadline and the payment plan<?= $prev['sum'] > 0 ? ', and I\'ll clear the previous balance of ' . money($prev['sum']) : '' ?>.</span></label>
        <div class="btns"><button class="btn pri" type="submit" id="go" disabled<?= $owner ? ' data-owner="1"' : '' ?>>I agree</button></div>
      </form>
    <?php endif; ?>
  </article>
  <p class="foot">SMR · Luton · <a href="tel:07931814538">07931 814538</a> · <a href="mailto:summar@smrgraphics.co.uk">summar@smrgraphics.co.uk</a></p>
<?php endif; ?>
</main>
<div class="toast" id="toast"></div>
<script>
(function(){
var D=<?= json_encode($data) ?>;if(!D)return;var f=document.getElementById('agree');
var toast=function(t){var e=document.getElementById('toast');e.textContent=t;e.classList.add('on');setTimeout(function(){e.classList.remove('on')},3200)};
if(f){var nm=document.getElementById('nm'),ok=document.getElementById('ok'),go=document.getElementById('go');
  var chk=function(){go.disabled=!(ok.checked&&nm.value.trim().length>=2)};nm.addEventListener('input',chk);ok.addEventListener('change',chk);
  f.addEventListener('submit',function(e){e.preventDefault();if(go.dataset.owner){toast('Owner preview: only the client can agree here.');return}
    go.disabled=true;go.textContent='Saving…';
    fetch('/jobs/api.php?a=agree',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({k:D.token,name:nm.value.trim()})}).then(function(r){return r.json()}).then(function(j){
      if(j.error){toast(j.error);go.disabled=false;go.textContent='I agree';return}var km=location.search.match(/k=[^&]+/);location.replace(location.pathname+'?'+(km?km[0]+'&':'')+'agreed=1')}).catch(function(){toast('No connection. Try again.');go.disabled=false;go.textContent='I agree'})})}
if(/agreed=1/.test(location.search))toast('Thank you! It\'s agreed.');
})();
</script>
</body>
</html>
