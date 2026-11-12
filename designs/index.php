<?php
/* Finished designs for a client: /d/<token>. Works for 14 days, then it shows a friendly "expired" page. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/designs.php';
designs_sweep();
security_headers(true);
header('Cache-Control: no-store');

$token = (string) ($_GET['k'] ?? '');
$s = set_by_token($token);
if (!$s && preg_match('/^[A-Za-z0-9_-]{16,40}$/', $token) && is_dir(inbox_dir() . '/' . $token)) { try { $s = designs_import($token); } catch (Throwable $e) { $s = set_by_token($token); } }
$owner = admin_token() !== null;
$state = 'ok';
if (!$s || !(int) $s['ready']) $state = 'gone';
elseif ((int) $s['archived_at'] > 0 || (int) $s['expires_at'] < now()) $state = $owner ? 'ok' : 'expired';

if ($state === 'ok' && !$owner) {
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua !== '' && !preg_match('/bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|embedly|curl|wget|python|headless/i', $ua))
        db()->prepare('UPDATE design_sets SET views = views + 1, last_view = ? WHERE id = ?')->execute([now(), $s['id']]);
}
if ($state !== 'ok') http_response_code($state === 'gone' ? 404 : 410);

$mark = preg_replace('/<svg /', '<svg aria-hidden="true" ', (string) @file_get_contents(SITE_ROOT . '/assets/smr-mark.svg'), 1);
$host = 'https://' . (preg_replace('/^www\./', '', preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'))) ?: 'smrgraphics.co.uk');
$data = null; $og = '';
if ($state === 'ok') {
    $designs = set_public($s, '/designs/f.php?k=' . $s['token']);
    $first = $designs[0]['sizes'][0]['pages'][0] ?? null;
    if ($first) $og = $host . $first['prev'];
    $data = ['title' => $s['title'], 'client' => $s['client'], 'expires' => (int) $s['expires_at'], 'archived' => (int) $s['archived_at'] > 0,
        'owner' => $owner, 'url' => set_url($s), 'designs' => $designs];
}
$name = $s ? trim((string) $s['client']) : '';
$first = $name !== '' ? preg_split('/[\s,]+/', $name)[0] : '';
$pageTitle = $state === 'ok' ? (($s['title'] !== '' ? $s['title'] : 'Your designs') . ' · SMR Digital') : 'SMR Digital';
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#08080f">
<title><?= h($pageTitle) ?></title>
<meta property="og:title" content="<?= h($state === 'ok' ? ($first !== '' ? $first . ', your designs are ready' : 'Your designs are ready') : 'SMR Digital') ?>">
<meta property="og:description" content="Designed by SMR Digital. Share them to Instagram, WhatsApp, TikTok, Facebook and LinkedIn, or save them to your phone.">
<meta property="og:site_name" content="SMR Digital">
<?php if ($og): ?><meta property="og:image" content="<?= h($og) ?>"><?php endif; ?>
<link rel="icon" href="/demo-admin/icon-192.png">
<link rel="apple-touch-icon" href="/demo-admin/apple-touch-icon.png">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@300&display=swap" rel="stylesheet">
<style>
html{touch-action:manipulation;-webkit-text-size-adjust:100%;overscroll-behavior:none}
:root{--bg:#08080f;--card:#12121e;--line:rgba(255,255,255,.09);--ink:#f2f2fa;--muted:#a3a3bd;--a1:#5b5bff;--a2:#d63bff;--grad:linear-gradient(110deg,var(--a1),var(--a2));--wa:#25d366}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:15px/1.45 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;overscroll-behavior:none}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 10% 0%,rgba(91,91,255,.16),transparent 70%),radial-gradient(50% 40% at 100% 0%,rgba(214,59,255,.11),transparent 70%)}
a{color:inherit}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
svg{flex:none}
.hd{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;background:rgba(8,8,15,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.lg{display:flex;align-items:center;gap:6px;text-decoration:none;margin-right:auto}
.lg svg{height:15px;width:auto}
.lg span{font-family:Poppins,sans-serif;font-weight:300;font-size:16px;line-height:1.25;padding-bottom:.15em;margin-bottom:-.15em;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.hwa{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:999px;background:var(--wa);color:#fff;font-weight:800;font-size:13px;text-decoration:none;box-shadow:0 6px 18px -8px rgba(37,211,102,.8)}
.hwa svg{width:17px;height:17px}
main{position:relative;max-width:1080px;margin:0 auto;padding:12px 16px calc(28px + env(safe-area-inset-bottom))}
.intro .eb{font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#cfc4ff}
.intro h1{font-family:Sora,sans-serif;font-size:21px;line-height:1.15;letter-spacing:-.02em;margin-top:3px}
.intro p{color:var(--muted);font-size:13px;margin-top:3px}
.owner{margin-top:10px;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,181,71,.4);background:rgba(255,181,71,.08);color:#ffcf86;font-size:12.5px;font-weight:700}
.picker{display:flex;gap:8px;overflow-x:auto;margin:10px -16px 0;padding:2px 16px 4px;scrollbar-width:none}
.picker::-webkit-scrollbar{display:none}
.picker button{flex:none;display:flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.035);font-weight:700;font-size:13px;max-width:200px}
.picker button img{width:32px;height:32px;border-radius:9px;object-fit:cover;background:#1a1a28}
.picker button span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.picker button.on{border-color:transparent;background:linear-gradient(#141420,#141420) padding-box,var(--grad) border-box;border:1.5px solid transparent}
.sizes{display:flex;gap:4px;padding:3px;border-radius:13px;background:rgba(255,255,255,.04);border:1px solid var(--line);margin-top:8px}
.sizes button{flex:1;padding:5px 8px;border-radius:10px;font-weight:800;font-size:13.5px;color:var(--muted);line-height:1.15}
.sizes button small{display:block;font-weight:600;font-size:11px;opacity:.8}
.sizes button.on{background:var(--grad);color:#fff}
.view{position:relative;margin-top:8px}
.track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:18px;background:repeating-conic-gradient(#14141f 0% 25%,#101019 0% 50%) 0 0/22px 22px;border:1px solid var(--line)}
.track::-webkit-scrollbar{display:none}
.slide{flex:0 0 100%;scroll-snap-align:center;display:grid;place-items:center;padding:10px;height:var(--vh,52vh)}
.slide img{max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;box-shadow:0 14px 34px -14px rgba(0,0,0,.7);background:#fff1}
.pg{position:absolute;top:10px;left:10px;padding:5px 10px;border-radius:999px;background:rgba(8,8,15,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-size:12px;font-weight:800;border:1px solid var(--line)}
.arr{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;background:rgba(8,8,15,.72);border:1px solid var(--line);display:none;place-items:center}
.arr svg{width:18px;height:18px}.arr.l{left:10px}.arr.r{right:10px}
.dots{display:flex;justify-content:center;gap:6px;margin-top:8px;min-height:6px}
.dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.22);transition:.2s}
.dots i.on{width:18px;border-radius:4px;background:#cfc4ff}
.sec{font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:10px 2px 7px}
.share{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pl{border:1px solid var(--line);border-radius:16px;padding:9px;background:rgba(255,255,255,.03)}
.pl .nm{display:flex;align-items:center;gap:7px;font-weight:800;font-size:14px;margin-bottom:7px}
.pl .nm i{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;color:#fff}
.pl .nm i svg{width:16px;height:16px}
.pl .bt{display:flex;gap:6px}
.pl .bt button{flex:1;height:36px;border-radius:10px;background:rgba(255,255,255,.07);font-weight:800;font-size:13px;border:1px solid var(--line)}
.pl .bt button:active,.mini button:active{transform:scale(.97)}
.ig{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285aeb 90%)}
.wa{background:var(--wa)}.tt{background:#111;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}.fb{background:#1877f2}.li{background:#0a66c2}
.mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.mini button{display:flex;align-items:center;justify-content:center;gap:7px;height:44px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.03);font-weight:800;font-size:13px}
.mini button i{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;color:#fff}
.mini button i svg{width:14px;height:14px}
.save{display:flex;gap:8px;margin-top:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 16px;border-radius:14px;font-weight:800;font-size:15px;border:1px solid var(--line);background:rgba(255,255,255,.05);text-decoration:none;color:var(--ink);white-space:nowrap}
.btn svg{width:18px;height:18px}
.btn.pri{flex:1;background:var(--grad);border:0;color:#fff;box-shadow:0 12px 28px -14px rgba(214,59,255,.9)}
.btn.wa{background:var(--wa);border:0;color:#fff}
.btn[disabled]{opacity:.55;pointer-events:none}
.exp{text-align:center;color:var(--muted);font-size:12.5px;margin-top:10px}
.brand{margin-top:22px;border-radius:20px;padding:18px;border:1px solid var(--line);background:linear-gradient(160deg,rgba(91,91,255,.14),rgba(214,59,255,.08) 60%,rgba(255,255,255,.02))}
.brand .lg{margin:0 0 8px}
.brand h2{font-family:Sora,sans-serif;font-size:17px;letter-spacing:-.01em}
.brand p{color:var(--muted);font-size:13.5px;margin-top:4px}
.brand .row{display:flex;gap:8px;margin-top:12px}
.brand .row .btn{flex:1;height:44px;font-size:14px}
.links{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.links a{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;border:1px solid var(--line);font-size:12.5px;font-weight:700;text-decoration:none;color:#ddd6ff;background:rgba(255,255,255,.03)}
.links a svg{width:14px;height:14px}
.foot{text-align:center;color:#6f6f8a;font-size:12px;margin-top:16px}
/* sheet */
.scrim{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:.2s}
.scrim.on{opacity:1;pointer-events:auto}
.sheet{position:fixed;z-index:90;left:0;right:0;bottom:0;max-height:90vh;overflow:auto;background:#14141f;border-top-left-radius:22px;border-top-right-radius:22px;border:1px solid var(--line);padding:8px 18px calc(18px + env(safe-area-inset-bottom));transform:translateY(105%);transition:transform .25s ease;max-width:520px;margin:0 auto}
.sheet.on{transform:none}
.grab{width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.2);margin:2px auto 12px}
.sh-h{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.sh-h i{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;color:#fff}
.sh-h i svg{width:20px;height:20px}
.sh-h b{font-family:Sora,sans-serif;font-size:17px;display:block}
.sh-h small{color:var(--muted);font-size:12.5px}
.sh-x{margin-left:auto;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.07);display:grid;place-items:center}
.sh-x svg{width:16px;height:16px}
.steps{list-style:none;counter-reset:s;display:grid;gap:8px;margin:4px 0 12px}
.steps li{counter-increment:s;display:flex;gap:10px;font-size:14px;line-height:1.4}
.steps li::before{content:counter(s);flex:none;width:22px;height:22px;border-radius:50%;background:rgba(207,196,255,.14);color:#cfc4ff;font-weight:800;font-size:12px;display:grid;place-items:center;margin-top:-1px}
.note{font-size:12.5px;color:#ffcf86;background:rgba(255,181,71,.08);border:1px solid rgba(255,181,71,.3);border-radius:12px;padding:9px 11px;margin-bottom:12px}
.pages{display:grid;gap:8px}
.pages button{display:flex;align-items:center;gap:10px;padding:7px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.04);font-weight:800;font-size:14px;text-align:left}
.pages button img{width:44px;height:44px;object-fit:cover;border-radius:8px;background:#1a1a28}
.pages button span{flex:1}
.pages button em{font-style:normal;font-size:12px;color:var(--muted);font-weight:700;padding-right:6px}
.pages button.done em{color:#3ddc97}
.sheet .btn{width:100%}
.sheet .btn+.btn{margin-top:8px}
.toast{position:fixed;z-index:99;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translate(-50%,20px);opacity:0;transition:.25s;padding:12px 18px;border-radius:14px;background:#1b1830;border:1px solid rgba(207,196,255,.4);font-weight:700;pointer-events:none;max-width:calc(100vw - 32px);text-align:center;font-size:14px}
.toast.on{opacity:1;transform:translate(-50%,0)}
/* expired */
.gone{min-height:calc(100vh - 56px);display:grid;place-items:center;padding:24px;text-align:center}
.gone .card{max-width:420px;border:1px solid var(--line);border-radius:22px;padding:28px 22px;background:rgba(255,255,255,.03)}
.gone .ic{width:58px;height:58px;border-radius:18px;margin:0 auto 14px;display:grid;place-items:center;background:rgba(207,196,255,.1);color:#cfc4ff}
.gone .ic svg{width:28px;height:28px}
.gone h1{font-family:Sora,sans-serif;font-size:22px}
.gone p{color:var(--muted);margin:8px 0 18px}
.gone .btn{width:100%}.gone .btn+.btn{margin-top:8px}
@media(min-width:900px){
  main{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:28px;padding-top:26px;align-items:start}
  .colL{position:sticky;top:76px}
  .sheet{bottom:auto;top:50%;border-radius:22px;transform:translateY(-46%);opacity:0;pointer-events:none;transition:.2s;padding-bottom:20px}
  .sheet.on{transform:translateY(-50%);opacity:1;pointer-events:auto}
  .grab{display:none}
  .arr{display:grid}
  .intro h1{font-size:28px}
  .picker{margin:14px 0 0;padding:2px 0 4px;flex-wrap:wrap}
  .hd{padding:0 max(16px,calc((100vw - 1080px)/2 + 16px))}
}
</style>
</head>
<body>
<header class="hd">
  <a class="lg" href="/#digital" aria-label="SMR Digital"><?= $mark ?><span>Digital</span></a>
  <a class="hwa" id="hwa" href="https://wa.me/<?= WHATSAPP ?>" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>Message us</a>
</header>
<?php if ($state !== 'ok'): ?>
<div class="gone"><div class="card">
  <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
  <h1><?= $state === 'expired' ? 'This link has expired' : 'This link isn’t available' ?></h1>
  <p><?= $state === 'expired' ? 'Design links work for ' . DESIGN_DAYS . ' days. Message us and we’ll send you a fresh one.' : 'It may have been removed. Message us and we’ll sort it out.' ?></p>
  <a class="btn wa" href="https://wa.me/<?= WHATSAPP ?>?text=<?= rawurlencode('Hi Summar, my designs link' . ($s && $s['title'] !== '' ? ' (' . $s['title'] . ')' : '') . ' has expired. Could you send me a new one please?') ?>" target="_blank" rel="noopener">Ask for a new link on WhatsApp</a>
  <a class="btn" href="/#digital">Visit SMR Digital</a>
</div></div>
<?php else: ?>
<main>
  <div class="colL">
    <div class="intro">
      <div class="eb"><?= $first !== '' ? 'Hi ' . h($first) . ', your designs are ready' : 'Your designs are ready' ?></div>
      <h1><?= h($s['title'] !== '' ? $s['title'] : 'Your designs') ?></h1>
      <p id="sum"></p>
      <?php if ($owner): ?><div class="owner"><?= (int) $s['archived_at'] > 0 || (int) $s['expires_at'] < now() ? 'Owner view: this link has ended, the client sees an “expired” page.' : 'Owner view: the client sees this page.' ?></div><?php endif; ?>
    </div>
    <div class="picker" id="picker" hidden></div>
    <div class="sizes" id="sizes" hidden></div>
    <div class="view">
      <div class="track" id="track"></div>
      <div class="pg" id="pg"></div>
      <button class="arr l" id="prev" aria-label="Previous page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <button class="arr r" id="next" aria-label="Next page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>
    </div>
    <div class="dots" id="dots"></div>
  </div>
  <div class="colR">
    <div class="sec">Share it</div>
    <div class="share">
      <div class="pl"><div class="nm"><i class="ig" data-ic="ig"></i>Instagram</div><div class="bt"><button data-go="ig-story">Story</button><button data-go="ig-post">Post</button></div></div>
      <div class="pl"><div class="nm"><i class="wa" data-ic="wa"></i>WhatsApp</div><div class="bt"><button data-go="wa-status">Status</button><button data-go="wa-chat">Chat</button></div></div>
    </div>
    <div class="mini">
      <button data-go="tiktok"><i class="tt" data-ic="tt"></i>TikTok</button>
      <button data-go="facebook"><i class="fb" data-ic="fb"></i>Facebook</button>
      <button data-go="linkedin"><i class="li" data-ic="li"></i>LinkedIn</button>
    </div>
    <div class="save">
      <button class="btn pri" id="save"></button>
      <button class="btn" id="zip" aria-label="Download everything as a ZIP"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg><span>All</span></button>
    </div>
    <p class="exp" id="exp"></p>
    <div class="brand">
      <a class="lg" href="/#digital"><?= $mark ?><span>Digital</span></a>
      <h2>Designed by SMR Digital</h2>
      <p>Social media, branding, print, apps and websites for local businesses. Need changes, more designs or something new?</p>
      <div class="row">
        <a class="btn" href="/#digital">Find out more</a>
        <a class="btn wa" id="enq" href="https://wa.me/<?= WHATSAPP ?>" target="_blank" rel="noopener">Enquire</a>
      </div>
      <div class="links">
        <a href="/#marketing">Social media</a>
        <a href="/#graphics">Print &amp; branding</a>
        <a href="/#digital">Apps &amp; websites</a>
        <a href="https://instagram.com/smrdigitaluk" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>@smrdigitaluk</a>
      </div>
    </div>
    <p class="foot">© SMR Digital · Luton · summar@smrgraphics.co.uk</p>
  </div>
</main>
<div class="scrim" id="scrim"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div id="sheetin"></div></div>
<div class="toast" id="toast"></div>
<script>
(function(){
var S=<?= json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>,WA='<?= WHATSAPP ?>';
var $=function(id){return document.getElementById(id)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var IC={
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  wa:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>',
  tt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.6"/></svg>',
  fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"/></svg>',
  li:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 10v7M7 6.5v.01M11 17v-7M11 13.5a3 3 0 0 1 6 0V17"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>'};
document.querySelectorAll('[data-ic]').forEach(function(e){e.innerHTML=IC[e.dataset.ic]});
var UA=navigator.userAgent,IOS=/iPhone|iPad|iPod/.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
    MOBILE=IOS||/Android|Mobi/i.test(UA);
var CAN=false;try{CAN=!!(navigator.canShare&&navigator.canShare({files:[new File([new Blob(['x'],{type:'image/png'})],'x.png',{type:'image/png'})]}))}catch(e){}
var KIND={post:'Post',story:'Story',wide:'Landscape',other:'Size'};
var sizeLabel=function(z){return (z.kind==='other'?z.w+' × '+z.h:KIND[z.kind])};
var di=0,si=0,pi=0;
var D=function(){return S.designs[di]},Z=function(){return D().sizes[si]};
var toast=function(m){var t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on')},3600)};
var plural=function(n,w){return n+' '+w+(n===1?'':'s')};
var slug=function(s){return String(s||'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'design'};

/* ---------- summary ---------- */
var total=0;S.designs.forEach(function(d){d.sizes.forEach(function(z){total+=z.pages.length})});
var until=new Date(S.expires*1000).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
$('sum').textContent=(S.designs.length>1?plural(S.designs.length,'design')+' · ':'')+plural(total,'file')+' · ready to share or save';
$('exp').textContent=S.archived?'This link has ended.':'This link works until '+until+'. Save your designs before then.';
$('enq').href='https://wa.me/'+WA+'?text='+encodeURIComponent('Hi Summar, I got my designs'+(S.title?' ('+S.title+')':'')+'. I\'d like to ask about ');
$('hwa').href='https://wa.me/'+WA+'?text='+encodeURIComponent('Hi Summar, about my designs'+(S.title?' ('+S.title+')':'')+': ');

/* ---------- picker / sizes / pages ---------- */
var renderPicker=function(){var p=$('picker');if(S.designs.length<2){p.hidden=true;return}p.hidden=false;
  p.innerHTML=S.designs.map(function(d,i){return '<button data-d="'+i+'"'+(i===di?' class="on"':'')+'><img src="'+esc(d.sizes[0].pages[0].prev)+'" alt=""><span>'+esc(d.name)+'</span></button>'}).join('')};
var renderSizes=function(){var z=D().sizes,b=$('sizes');if(z.length<2){b.hidden=true;return}b.hidden=false;
  b.innerHTML=z.map(function(x,i){return '<button data-s="'+i+'"'+(i===si?' class="on"':'')+'>'+esc(sizeLabel(x))+'<small>'+x.w+' × '+x.h+(x.pages.length>1?' · '+x.pages.length+' pages':'')+'</small></button>'}).join('')};
var fitH=function(){var z=Z(),w=$('track').clientWidth-24,ideal=w*z.h/z.w+24,max=window.innerWidth>=900?Math.max(380,window.innerHeight-$('track').getBoundingClientRect().top-window.scrollY-40):Math.max(250,window.innerHeight-$('track').getBoundingClientRect().top-window.scrollY-262);$('track').style.setProperty('--vh',Math.round(Math.min(ideal,max))+'px')};
var renderPages=function(){var z=Z(),t=$('track');pi=0;
  t.innerHTML=z.pages.map(function(p,i){return '<div class="slide"><img src="'+esc(p.prev)+'" alt="'+esc(D().name+', '+sizeLabel(z)+', page '+(i+1))+'" '+(i>1?'loading="lazy" ':'')+'draggable="false"></div>'}).join('');
  t.scrollLeft=0;fitH();
  $('dots').innerHTML=z.pages.length>1?z.pages.map(function(_,i){return '<i'+(i===0?' class="on"':'')+'></i>'}).join(''):'';
  setPg()};
var setPg=function(){var n=Z().pages.length;$('pg').textContent=(n>1?'Page '+(pi+1)+' of '+n+' · ':'')+sizeLabel(Z())+' · '+Z().w+'×'+Z().h;
  $('dots').querySelectorAll('i').forEach(function(d,i){d.classList.toggle('on',i===pi)});
  $('prev').style.visibility=pi>0?'visible':'hidden';$('next').style.visibility=pi<n-1?'visible':'hidden'};
$('track').addEventListener('scroll',function(){var t=$('track'),i=Math.round(t.scrollLeft/t.clientWidth);if(i!==pi){pi=i;setPg()}},{passive:true});
var go=function(d){var t=$('track');t.scrollTo({left:(pi+d)*t.clientWidth,behavior:'smooth'})};
$('prev').addEventListener('click',function(){go(-1)});$('next').addEventListener('click',function(){go(1)});
document.addEventListener('keydown',function(e){if($('sheet').classList.contains('on'))return;if(e.key==='ArrowLeft')go(-1);if(e.key==='ArrowRight')go(1)});
$('picker').addEventListener('click',function(e){var b=e.target.closest('[data-d]');if(!b)return;di=+b.dataset.d;si=0;renderPicker();renderSizes();renderPages();saveLabel()});
$('sizes').addEventListener('click',function(e){var b=e.target.closest('[data-s]');if(!b)return;si=+b.dataset.s;renderSizes();renderPages();saveLabel()});
window.addEventListener('resize',fitH);

/* ---------- files ---------- */
var cache={};
var fileName=function(d,z,i,p){return slug(S.title||S.client||'SMR')+'_'+slug(d.name)+'_'+sizeLabel(z).replace(/\W+/g,'')+'_'+z.w+'x'+z.h+(z.pages.length>1?'_page-'+(i+1):'')+'.'+(p.ext==='jpeg'?'jpg':p.ext)};
var getFile=function(d,z,i){var p=z.pages[i];if(!cache[p.id])cache[p.id]=fetch(p.src,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error('load');return r.blob()});
  return cache[p.id].then(function(b){return new File([b],fileName(d,z,i,p),{type:p.mime||b.type})})};
var getFiles=function(d,z,idx){return Promise.all(idx.map(function(i){return getFile(d,z,i)}))};
var range=function(n){var a=[];for(var i=0;i<n;i++)a.push(i);return a};
var download=function(d,z,idx){idx.forEach(function(i,k){setTimeout(function(){var a=document.createElement('a');a.href=z.pages[i].src+'&dl=1&n='+encodeURIComponent(fileName(d,z,i,z.pages[i]));a.download=fileName(d,z,i,z.pages[i]);document.body.appendChild(a);a.click();a.remove()},k*450)})};
var doShare=function(files){return navigator.share({files:files}).then(function(){return true}).catch(function(e){if(e&&e.name==='AbortError')return false;throw e})};

/* ---------- sheet ---------- */
var sheet=$('sheet'),scrim=$('scrim');
var open=function(html,bind){$('sheetin').innerHTML=html;sheet.classList.add('on');scrim.classList.add('on');sheet.scrollTop=0;if(bind)bind($('sheetin'))};
var close=function(){sheet.classList.remove('on');scrim.classList.remove('on')};
scrim.addEventListener('click',close);
$('sheetin').addEventListener('click',function(e){if(e.target.closest('[data-x]'))close()});
var head=function(cls,ic,t,sub){return '<div class="sh-h"><i class="'+cls+'">'+IC[ic]+'</i><div><b>'+esc(t)+'</b><small>'+esc(sub)+'</small></div><button class="sh-x" data-x aria-label="Close">'+IC.x+'</button></div>'};
var steps=function(a){return '<ol class="steps">'+a.filter(Boolean).map(function(s){return '<li><span>'+s+'</span></li>'}).join('')+'</ol>'};

var P={
  'ig-story':{cls:'ig',ic:'ig',name:'Instagram Story',want:'story',one:true,app:'Instagram',pick:'<b>Instagram</b>, then <b>Story</b>',web:'https://www.instagram.com/',webOk:false},
  'ig-post':{cls:'ig',ic:'ig',name:'Instagram Post',want:'post',app:'Instagram',pick:'<b>Instagram</b>, then <b>Post</b> (Feed)',web:'https://www.instagram.com/',webOk:true,multi:'If Instagram only shows one picture, tap <b>Save</b> instead, then make the post in Instagram and pick the pages in order.'},
  'wa-status':{cls:'wa',ic:'wa',name:'WhatsApp Status',want:'story',app:'WhatsApp',pick:'<b>WhatsApp</b>, then <b>My status</b> at the top',web:'',webOk:false},
  'wa-chat':{cls:'wa',ic:'wa',name:'WhatsApp chat or group',want:'post',app:'WhatsApp',pick:'<b>WhatsApp</b>, then the chat or group',web:'https://web.whatsapp.com/',webOk:true},
  'tiktok':{cls:'tt',ic:'tt',name:'TikTok',want:'story',app:'TikTok',pick:'<b>TikTok</b>. More than one picture becomes a swipeable photo post, add a sound if you like',web:'https://www.tiktok.com/upload',webOk:true},
  'facebook':{cls:'fb',ic:'fb',name:'Facebook',want:'post',app:'Facebook',pick:'<b>Facebook</b>, then Feed (post) or Story',web:'https://www.facebook.com/',webOk:true},
  'linkedin':{cls:'li',ic:'li',name:'LinkedIn',want:'post',app:'LinkedIn',pick:'<b>LinkedIn</b>. All pages go into one post',web:'https://www.linkedin.com/feed/?shareActive=true',webOk:true}
};
/* The size that suits the platform, else the one on screen. */
var sizeFor=function(want){var d=D(),z=Z();if(z.kind===want)return z;for(var i=0;i<d.sizes.length;i++)if(d.sizes[i].kind===want)return d.sizes[i];return z};

var platform=function(key){var c=P[key],d=D(),z=sizeFor(c.want),n=z.pages.length,miss=z.kind!==c.want&&(c.want==='story'||c.want==='post');
  var sub=sizeLabel(z)+' · '+z.w+' × '+z.h+(n>1?' · '+n+' pages':'');
  var missNote=miss?'<div class="note">There’s no '+(c.want==='story'?'Story':'Post')+' size for this design, so the '+sizeLabel(z)+' size is used'+(c.want==='story'?' (it shows with space above and below).':'.')+'</div>':'';
  if(!CAN){ // computer (or a browser that can't share files)
    var h=head(c.cls,c.ic,c.name,sub)+missNote;
    if(!c.webOk){h+='<div class="note">'+(key==='ig-story'?'Instagram Stories can only be posted from the phone app.':'WhatsApp Status can only be posted from your phone.')+' Open this link on your phone and tap <b>'+esc(c.name.split(' ').pop())+'</b> there.</div>'
      +'<button class="btn pri" data-copy>Copy this link</button><button class="btn" data-dl>'+IC.dl+'Download '+(n>1?'the '+n+' pages':'it')+'</button>';}
    else h+=steps(['Download '+(n>1?'the '+n+' pages':'the design')+' (button below).','Open '+c.app+' and start a new '+(key==='wa-chat'?'message':'post')+'.',n>1?'Add the pictures in order, page 1 first.':'Add the picture.'])
      +'<button class="btn pri" data-dl>'+IC.dl+'Download '+(n>1?n+' pages':'')+'</button><a class="btn" href="'+c.web+'" target="_blank" rel="noopener">Open '+c.app+'</a>';
    open(h,function(el){var b=el.querySelector('[data-dl]');if(b)b.addEventListener('click',function(){download(d,z,range(n));toast(n>1?'Downloading '+n+' pages…':'Downloading…')});
      var cp=el.querySelector('[data-copy]');if(cp)cp.addEventListener('click',function(){copyLink()})});
    return}
  if(c.one&&n>1){ // Stories: one page at a time
    open(head(c.cls,c.ic,c.name,sub)+missNote+'<div class="note">Stories take one page at a time. Share page 1, post it, then come back here for page 2.</div>'
      +steps(['Tap a page below.','Choose '+c.pick+'.','Post it, then come back for the next page.'])
      +'<div class="pages">'+z.pages.map(function(p,i){return '<button data-i="'+i+'"><img src="'+esc(p.prev)+'" alt=""><span>Share page '+(i+1)+'</span><em>'+(i===0?'Start here':'')+'</em></button>'}).join('')+'</div>',
      function(el){getFiles(d,z,range(n)).catch(function(){});
        el.querySelectorAll('[data-i]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;
          getFile(d,z,i).then(function(f){return doShare([f])}).then(function(ok){if(ok){b.classList.add('done');b.querySelector('em').textContent='✓ Shared';var nx=el.querySelector('[data-i="'+(i+1)+'"] em');if(nx&&!nx.textContent)nx.textContent='Next'}})
            .catch(function(){toast('Tap the page again to share it')})})})});
    return}
  open(head(c.cls,c.ic,c.name,sub)+missNote+steps(['Tap <b>Share</b> below.','Choose '+c.pick+'.',n>1?'All '+n+' pages go together, already in order.':null])
    +(n>1&&c.multi?'<div class="note">'+c.multi+'</div>':'')
    +'<button class="btn pri" data-go disabled>'+IC.share+'<span>Getting '+(n>1?'pages':'it')+' ready…</span></button>',
    function(el){var b=el.querySelector('[data-go]'),files=null;
      getFiles(d,z,range(n)).then(function(f){files=f;b.disabled=false;b.querySelector('span').textContent='Share'+(n>1?' '+n+' pages':'')}).catch(function(){b.querySelector('span').textContent='Couldn’t load. Check your signal.'});
      b.addEventListener('click',function(){if(!files)return;doShare(files).then(function(ok){if(ok){close();toast('Shared')}}).catch(function(){toast('Sharing didn’t open. Try Save instead.')})})});
};
document.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){platform(b.dataset.go)})});

/* ---------- save ---------- */
var saveLabel=function(){var n=Z().pages.length,t=IOS&&CAN?'Save to Photos':MOBILE?'Save to phone':(n>1?'Download '+n+' pages':'Download');$('save').innerHTML=IC.dl+'<span>'+t+'</span>'};
$('save').addEventListener('click',function(){var d=D(),z=Z(),n=z.pages.length;
  if(IOS&&CAN){open(head('wa','dl','Save to Photos',sizeLabel(z)+' · '+z.w+' × '+z.h+(n>1?' · '+n+' pages':''))+steps(['Tap <b>Save</b> below.','Choose <b>Save '+(n>1?n+' Images':'Image')+'</b> in the menu.','They’ll be in your Photos app.'])
      +'<button class="btn pri" data-sv disabled>'+IC.dl+'<span>Getting ready…</span></button>',
    function(el){var b=el.querySelector('[data-sv]'),files=null;el.querySelector('.sh-h i').style.background='var(--grad)';
      getFiles(d,z,range(n)).then(function(f){files=f;b.disabled=false;b.querySelector('span').textContent='Save'+(n>1?' '+n+' pages':'')}).catch(function(){b.querySelector('span').textContent='Couldn’t load. Check your signal.'});
      b.addEventListener('click',function(){if(files)doShare(files).then(function(ok){if(ok){close();toast('Saved')}}).catch(function(){download(d,z,range(n))})})});return}
  download(d,z,range(n));toast(MOBILE?'Saving to your Downloads. They’ll show in your Gallery or Photos.':(n>1?'Downloading '+n+' pages…':'Downloading…'))});

/* ---------- download everything (ZIP, no compression) ---------- */
var CRC=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
var crc32=function(u){var c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
var makeZip=function(items){var parts=[],cd=[],off=0,enc=new TextEncoder();
  items.forEach(function(it){var nm=enc.encode(it.name),u=it.data,c=crc32(u),h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(12,33,true);h.setUint32(14,c,true);h.setUint32(18,u.length,true);h.setUint32(22,u.length,true);h.setUint16(26,nm.length,true);
    parts.push(h.buffer,nm,u);var e=new DataView(new ArrayBuffer(46));
    e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x0800,true);e.setUint16(14,33,true);e.setUint32(16,c,true);e.setUint32(20,u.length,true);e.setUint32(24,u.length,true);e.setUint16(28,nm.length,true);e.setUint32(42,off,true);
    cd.push(e.buffer,nm);off+=30+nm.length+u.length});
  var cdSize=cd.reduce(function(a,b){return a+(b.byteLength||b.length)},0),end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,items.length,true);end.setUint16(10,items.length,true);end.setUint32(12,cdSize,true);end.setUint32(16,off,true);
  return new Blob(parts.concat(cd,[end.buffer]),{type:'application/zip'})};
$('zip').addEventListener('click',function(){var b=$('zip'),sp=b.querySelector('span'),jobs=[];
  S.designs.forEach(function(d){d.sizes.forEach(function(z){z.pages.forEach(function(_,i){jobs.push([d,z,i])})})});
  b.disabled=true;var done=0;sp.textContent='0/'+jobs.length;
  Promise.all(jobs.map(function(j){return getFile(j[0],j[1],j[2]).then(function(f){return f.arrayBuffer()}).then(function(ab){sp.textContent=(++done)+'/'+jobs.length;
      return{name:(S.designs.length>1?slug(j[0].name)+'/':'')+f_name(j),data:new Uint8Array(ab)}})}))
  .then(function(items){var z=makeZip(items),a=document.createElement('a');a.href=URL.createObjectURL(z);a.download=slug(S.title||S.client||'SMR-designs')+'.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},60000);toast('Downloaded everything as a ZIP')})
  .catch(function(){toast('Couldn’t download. Check your signal and try again.')})
  .then(function(){b.disabled=false;sp.textContent='All'})});
var f_name=function(j){return fileName(j[0],j[1],j[2],j[1].pages[j[2]])};
var copyLink=function(){var t=S.url;(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('Link copied. Send it to your phone.')}).catch(function(){prompt('Copy this link:',t)})};

renderPicker();renderSizes();renderPages();saveLabel();
})();
</script>
<?php endif; ?>
</body>
</html>
<?php if (!empty($GLOBALS['DESIGNS_IMPORTED'])) { if (function_exists('fastcgi_finish_request')) fastcgi_finish_request(); designs_notify_imported(); } ?>
