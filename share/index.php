<?php
/* View-only page for a shared mock-up: smrgraphics.co.uk/m/<id> */
require __DIR__ . '/lib.php';
$id = $_GET['id'] ?? '';
$m = share_meta($id);
$plate = ($m['kind'] ?? '') === 'plate';
$title = $m ? ($m['title'] ?: ($plate ? 'Number plate mock-up' : 'Print mock-up')) : 'This link has expired';
$img = $m ? share_host() . '/share/img.php?id=' . $id : '';
$until = $m ? date('j F Y', $m['t'] + SHARE_DAYS * 86400) : '';
$cta = $plate ? ['/plates', 'Design your own plates', 'Made with SMR Plates · See it on your car'] : ['/#graphics', 'Make your own mock-up', 'Made with SMR Graphics · Mock-up Studio'];
$wa = 'https://wa.me/' . WHATSAPP . '?text=' . rawurlencode($plate ? "Hi SMR Plates! I saw this plate mock-up and I'd like a quote: " . share_host() . "/m/$id" : "Hi SMR Graphics! I saw this mock-up and I'd like a quote: " . share_host() . "/m/$id");
if (!$m) http_response_code(404);
header('X-Robots-Tag: noindex, nofollow');
$mark = @file_get_contents(SITE_ROOT . '/assets/smr-mark.svg') ?: '';
?><!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow">
<title><?= h($title) ?> · SMR</title>
<meta property="og:title" content="<?= h($title) ?>">
<meta property="og:description" content="<?= h($cta[2]) ?>">
<?php if ($img): ?><meta property="og:image" content="<?= h($img) ?>"><meta property="og:image:width" content="<?= (int) $m['w'] ?>"><meta property="og:image:height" content="<?= (int) $m['h'] ?>"><meta name="twitter:card" content="summary_large_image"><?php endif; ?>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@700&family=Manrope:wght@500;700&family=Poppins:wght@300&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0;background:#0b0b12;color:#f2f2f7;font-family:Manrope,system-ui,-apple-system,sans-serif}
.top{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
.top a{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none}.top svg{height:22px;width:auto}
.top span{font:300 22px/1 Poppins,system-ui,sans-serif;background:linear-gradient(110deg,<?= $plate ? '#ffd23f,#ff7a2f' : '#2f6bff,#a43bff' ?>);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:3px}
main{max-width:1100px;margin:0 auto;padding:18px 16px 40px}
h1{font:700 22px/1.2 Sora,system-ui,sans-serif;margin:4px 0 4px}p.sub{margin:0 0 14px;color:#9a9ab0;font-size:13.5px}
.pic{border-radius:16px;overflow:hidden;background:#14141e;box-shadow:0 24px 60px -24px rgba(0,0,0,.8)}.pic img{display:block;width:100%;height:auto;-webkit-user-drag:none;user-select:none}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.b{flex:1 1 220px;display:flex;align-items:center;justify-content:center;gap:9px;padding:15px;border-radius:16px;font:700 15px Sora,system-ui,sans-serif;text-decoration:none}
.b.pri{background:linear-gradient(110deg,<?= $plate ? '#ffd23f,#ff7a2f' : '#2f6bff,#a43bff' ?>);color:<?= $plate ? '#1a0f00' : '#fff' ?>}.b.wa{background:#25d366;color:#06351a}
.note{margin-top:14px;font-size:12px;color:#7d7d95;text-align:center}
.gone{padding:60px 10px;text-align:center}.gone p{color:#9a9ab0}
</style></head><body>
<div class="top"><a href="<?= h($cta[0]) ?>"><?= $mark ?><span><?= $plate ? 'Plates' : 'Graphics' ?></span></a></div>
<main>
<?php if ($m): ?>
  <h1><?= h($title) ?></h1><p class="sub"><?= h($cta[2]) ?></p>
  <div class="pic"><img src="/share/img.php?id=<?= h($id) ?>" alt="<?= h($title) ?>" draggable="false"></div>
  <div class="row"><a class="b pri" href="<?= h($cta[0]) ?>"><?= h($cta[1]) ?></a><a class="b wa" href="<?= h($wa) ?>" target="_blank" rel="noopener">Get a quote on WhatsApp</a></div>
  <p class="note">This is a preview made on smrgraphics.co.uk. The link works until <?= h($until) ?>.<?= $plate ? ' Show plates are for display and off-road use only.' : '' ?></p>
<?php else: ?>
  <div class="gone"><h1>This link has expired</h1><p>Shared mock-ups are kept for <?= SHARE_DAYS ?> days.</p><div class="row" style="max-width:520px;margin:20px auto 0"><a class="b pri" href="/plates">Design plates</a><a class="b pri" href="/#graphics">Mock-up Studio</a></div></div>
<?php endif; ?>
</main></body></html>
