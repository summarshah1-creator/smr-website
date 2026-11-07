<?php
/* SMR Digital private demo showroom. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(true);
header('Cache-Control: no-store');

$token = (string) ($_GET['k'] ?? '');
$preview = isset($_GET['preview']) && admin_token();
$view = 'landing';
$demos = [];
$expires = 0;
$tips = true;
$link = null;
$pinApps = [];

if ($preview) {
    $view = 'showroom';
    foreach (db()->query('SELECT * FROM demos ORDER BY sort, name') as $d) $demos[] = demo_public($d) + ['enabled' => (int) $d['enabled']];
} else {
    $vs = visitor_session();
    if ($token === '' && $vs) { header('Location: ' . link_path($vs[0]), true, 302); exit; }
    if ($token !== '') {
        $link = link_by_token($token);
        if (!$link) {
            $view = 'invalid';
        } elseif ($vs && (int) $vs[0]['id'] === (int) $link['id']) {
            [$l, $s] = $vs;
            if (session_state($l, $s) === 'ok') {
                $view = 'showroom';
                $expires = session_expiry($l, $s);
                $tips = (bool) $l['tips'];
                $allowed = link_apps($l);
                $all = [];
                foreach (db()->query('SELECT * FROM demos WHERE enabled = 1 ORDER BY sort, name') as $d) $all[$d['slug']] = $d;
                foreach ($allowed as $slug) if (isset($all[$slug])) $demos[] = demo_public($all[$slug]);
            } else {
                $view = 'expired';
            }
        } else {
            [$st] = link_status($link);
            $view = ($st === 'revoked' || $st === 'expired') ? 'expired' : 'pin';
            if ($view === 'pin') {
                $all = [];
                foreach (db()->query('SELECT * FROM demos WHERE enabled = 1') as $d) $all[$d['slug']] = $d;
                foreach (link_apps($link) as $slug) if (isset($all[$slug])) {
                    $pd = demo_public($all[$slug]);
                    $pinApps[] = ['name' => $pd['name'], 'icon' => $pd['icon'] . '&k=' . rawurlencode($token)];
                }
            }
        }
    }
}

// Link previews (WhatsApp, iMessage...): app icon + "<App> Demo - SMR Digital".
$pageTitle = 'SMR Digital · Private demos';
$og = null;
if ($link && !$preview) {
    $names = [];
    foreach (link_apps($link) as $sl) { $dd = demo_by_slug($sl); if ($dd) $names[] = $dd['name']; }
    if (count($names) === 1) $pageTitle = $names[0] . ' Demo - SMR Digital';
    elseif (count($names) === 2) $pageTitle = $names[0] . ' & ' . $names[1] . ' Demos - SMR Digital';
    else $pageTitle = 'App Demos - SMR Digital';
    $scheme = is_https() || !preg_match('/^(127\.|localhost)/', (string) ($_SERVER['HTTP_HOST'] ?? '')) ? 'https' : 'http';
    $base = $scheme . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'smrgraphics.co.uk'));
    $og = ['title' => $pageTitle, 'url' => $base . link_path($link),
        'image' => $base . '/demo/og.php?k=' . rawurlencode($link['token']) . '&v=' . substr(md5($link['apps']), 0, 6),
        'desc' => (count($names) === 1 ? 'A private demo of the ' . $names[0] . ' app' : 'Private demos of ' . (count($names) > 1 ? implode(', ', array_slice($names, 0, -1)) . ' and ' . end($names) : 'our apps')) . ', designed & built by SMR Digital.'];
}
$mark = (string) @file_get_contents(SITE_ROOT . '/assets/smr-mark.svg');
$mark = preg_replace('/<svg /', '<svg aria-hidden="true" focusable="false" ', $mark, 1);
$waRequest = 'https://wa.me/' . WHATSAPP . '?text=' . rawurlencode("Hi Summar, my SMR Digital demo session has ended. Could I have a new PIN please?");
$waAsk = 'https://wa.me/' . WHATSAPP . '?text=' . rawurlencode("Hi Summar, I'd like a demo of the SMR Digital apps please.");
$waHelp = 'https://wa.me/' . WHATSAPP . '?text=' . rawurlencode("Hi Summar, I'm looking at the SMR Digital demos and have a question.");
$boot = ['view' => $view, 'token' => $token, 'preview' => $preview, 'now' => now(), 'expires' => $expires, 'tips' => $tips, 'demos' => $demos];
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#08080f">
<title><?= h($pageTitle) ?></title>
<?php if ($og): ?>
<link rel="icon" href="<?= h($og['image']) ?>">
<link rel="apple-touch-icon" href="<?= h($og['image']) ?>">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SMR Digital">
<meta property="og:title" content="<?= h($og['title']) ?>">
<meta property="og:description" content="<?= h($og['desc']) ?>">
<meta property="og:url" content="<?= h($og['url']) ?>">
<meta property="og:image" content="<?= h($og['image']) ?>">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="600">
<meta property="og:image:height" content="600">
<meta name="twitter:card" content="summary">
<meta name="description" content="<?= h($og['desc']) ?>">
<?php else: ?>
<link rel="icon" href="/assets/icon.png">
<?php endif; ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700&family=Poppins:wght@300&display=swap" rel="stylesheet">
<style>
html{touch-action:manipulation;-webkit-text-size-adjust:100%}
:root{--bg:#08080f;--bg2:#0e0e1a;--card:#13131f;--line:rgba(255,255,255,.09);--ink:#f2f2fa;--muted:#a3a3bd;--a1:#5b5bff;--a2:#d63bff;--grad:linear-gradient(110deg,var(--a1),var(--a2));--hh:58px;--warn:#ffb547;--bad:#ff5470}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--bg);color:var(--ink);font-family:Manrope,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
body.locked{overflow:hidden}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.glow{position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 15% 0%,rgba(91,91,255,.22),transparent 70%),radial-gradient(50% 40% at 100% 10%,rgba(214,59,255,.16),transparent 70%)}
/* header */
.hd{position:fixed;z-index:50;top:0;left:0;right:0;height:calc(var(--hh) + env(safe-area-inset-top));padding:env(safe-area-inset-top) max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left));display:flex;align-items:center;gap:8px;background:rgba(8,8,15,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.hd::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--grad);opacity:.55}
.brand{display:flex;flex-direction:column;justify-content:center;gap:3px;min-width:0;margin-right:auto}
.brand small{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);white-space:nowrap;font-weight:600}
.brand .lg{display:flex;align-items:center;gap:5px;height:15px}
.brand .lg svg{height:13px;width:auto;display:block}
.brand .lg span{font-family:Poppins,sans-serif;font-weight:300;font-size:14px;letter-spacing:.02em;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.timer{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px 10px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.04);line-height:1;min-width:86px;transition:background .3s,border-color .3s}
.timer small{font-size:8.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);font-weight:700;white-space:nowrap}
.timer b{font-family:Sora,sans-serif;font-size:15px;font-variant-numeric:tabular-nums;margin-top:3px;letter-spacing:.02em}
.timer.low{border-color:rgba(255,181,71,.6);background:rgba(255,181,71,.12)}.timer.low b{color:var(--warn)}
.timer.crit{border-color:rgba(255,84,112,.7);background:rgba(255,84,112,.16);animation:pulse 1s ease-in-out infinite}.timer.crit b{color:var(--bad)}
@keyframes pulse{50%{box-shadow:0 0 0 4px rgba(255,84,112,.18)}}
.hbtn{height:38px;padding:0 12px;border-radius:12px;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13px;white-space:nowrap}
.hbtn.homebtn{background:rgba(255,255,255,.06);border:1px solid var(--line);font-size:14px}.hbtn.homebtn svg{width:17px;height:17px}
body.owner .hbtn.all,body.owner .viewsw+.hbtn,body.owner .hbtn.exit{display:none}
.hbtn.all{background:var(--grad);color:#fff;box-shadow:0 6px 18px -8px rgba(214,59,255,.7)}
.hbtn.all svg{width:15px;height:15px}
.hbtn.icon{width:38px;padding:0;justify-content:center;border:1px solid var(--line);background:rgba(255,255,255,.04)}
.hbtn.icon svg{width:18px;height:18px}
.hbtn.exit{border:1px solid var(--line)}
.menu{position:fixed;z-index:60;top:calc(var(--hh) + env(safe-area-inset-top) + 6px);right:max(12px,env(safe-area-inset-right));width:240px;background:#151522;border:1px solid var(--line);border-radius:16px;padding:6px;box-shadow:0 20px 50px -10px rgba(0,0,0,.7);display:none}
.menu.on{display:block}
.menu a,.menu button{display:flex;width:100%;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;font-size:14px;font-weight:600;text-align:left}
.menu a:hover,.menu button:hover{background:rgba(255,255,255,.06)}
.menu svg{width:18px;height:18px;flex:none;opacity:.85}
.menu hr{border:0;border-top:1px solid var(--line);margin:4px 6px}
@media(max-width:560px){.hbtn.exit,.hbtn.all .lbl-long{display:none}}
@media(min-width:561px){.hbtn.all .lbl-short{display:none}}
@media(max-width:360px){.brand small{font-size:8.5px}.timer{min-width:76px;padding:5px 7px}.hbtn{padding:0 9px}}
/* main */
main{position:relative;padding:calc(var(--hh) + env(safe-area-inset-top) + 26px) max(18px,env(safe-area-inset-right)) calc(40px + env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));max-width:1080px;margin:0 auto}
.eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#cfc4ff}
.eyebrow i{width:7px;height:7px;border-radius:50%;background:var(--grad);box-shadow:0 0 12px var(--a2)}
h1{font-family:Sora,sans-serif;font-size:clamp(26px,6.4vw,40px);line-height:1.08;letter-spacing:-.02em;margin:12px 0 10px}
h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{color:var(--muted);font-size:15.5px;line-height:1.55;max-width:560px}
.grid{display:grid;grid-template-columns:1fr;gap:12px;margin-top:24px}
@media(min-width:700px){.grid{grid-template-columns:1fr 1fr;gap:16px}}
@media(min-width:1000px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{position:relative;display:flex;gap:14px;align-items:center;padding:14px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.02));border:1px solid var(--line);text-align:left;width:100%;transition:transform .2s,border-color .2s,background .2s;overflow:hidden}
.card:hover{transform:translateY(-2px);border-color:rgba(214,59,255,.45)}
.card:active{transform:scale(.985)}
.card::before{content:"";position:absolute;inset:auto -30% -60% auto;width:140px;height:140px;border-radius:50%;background:var(--acc,#5b5bff);opacity:.13;filter:blur(30px)}
.card img{width:66px;height:66px;border-radius:17px;flex:none;object-fit:cover;background:#1c1c2a;box-shadow:0 8px 22px -10px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.08)}
.card .tx{min-width:0;flex:1}
.card h3{font-family:Sora,sans-serif;font-size:16.5px;letter-spacing:-.01em}
.card .tg{font-size:12.5px;color:#cfc4ff;font-weight:600;margin-top:3px}
.card p{font-size:13px;color:var(--muted);line-height:1.45;margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .go{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.06);border:1px solid var(--line)}
.card .go svg{width:16px;height:16px}
.card .off{position:absolute;top:10px;right:12px;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--warn)}
.note{margin-top:26px;display:flex;gap:10px;align-items:flex-start;color:var(--muted);font-size:13px;line-height:1.5;padding:14px 16px;border-radius:16px;border:1px dashed var(--line)}
.note svg{width:18px;height:18px;flex:none;margin-top:1px;color:#cfc4ff}
.note a{color:#e3c8ff;font-weight:700}
/* app view */
.stage{position:fixed;z-index:10;left:0;right:0;bottom:0;top:calc(var(--hh) + env(safe-area-inset-top));background:#000;display:none}
.stage.on{display:block}
.stage iframe{display:block;width:100%;height:100%;border:0;background:#fff}
.stage .dev{width:100%;height:100%}
@media(min-width:900px){
 .stage.phone{background:radial-gradient(60% 50% at 50% 0%,rgba(91,91,255,.18),transparent 70%),var(--bg);display:none;align-items:center;justify-content:center;padding:22px}
 .stage.phone.on{display:flex}
 .stage.phone .dev{width:auto;height:100%;max-height:900px;aspect-ratio:430/900;border-radius:44px;padding:12px;background:#111118;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 40px 90px -30px rgba(0,0,0,.9),0 0 80px -30px rgba(214,59,255,.35)}
 .stage.phone iframe{border-radius:33px}
}
.viewsw{display:none}
@media(min-width:900px){.viewsw{display:inline-flex}}
/* tips */
.pinapps{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 10px;margin:16px auto 0;max-width:360px}
.pinapps span{display:flex;flex-direction:column;align-items:center;gap:6px;width:66px}
.pinapps img{width:52px;height:52px;border-radius:14px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.1),0 8px 20px -10px rgba(0,0,0,.8)}
.pinapps small{font-size:11px;font-weight:700;color:var(--muted);line-height:1.2;text-align:center}
.tip{position:fixed;z-index:40;left:max(12px,env(safe-area-inset-left));bottom:calc(14px + env(safe-area-inset-bottom));width:min(340px,calc(100vw - 24px));padding:14px 14px 12px;border-radius:18px;background:rgba(20,20,34,.97);border:1px solid rgba(214,59,255,.35);box-shadow:0 18px 50px -12px rgba(0,0,0,.8);display:none;font-size:14px;line-height:1.45}
.tip.on{display:block;animation:up .35s ease}
@keyframes up{from{opacity:0;transform:translateY(10px)}}
.tip .tt{display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:#cfc4ff;margin-bottom:6px}
.tip .tt button{width:28px;height:28px;margin:-6px -6px -6px 0;border-radius:50%;display:grid;place-items:center}
.tip .tt svg{width:15px;height:15px}
.tip .row{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
.tip .row button{padding:7px 13px;border-radius:10px;font-weight:700;font-size:13px;border:1px solid var(--line)}
.tip .row .nx{background:var(--grad);border:0;color:#fff}
.tip{left:auto;bottom:auto;top:calc(var(--hh) + env(safe-area-inset-top) + 10px);right:max(10px,env(safe-area-inset-right));width:min(270px,calc(100vw - 90px));padding:10px 11px 9px;border-radius:14px;font-size:12.5px;line-height:1.4;background:rgba(14,14,26,.62);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(214,59,255,.3);box-shadow:0 8px 24px -10px rgba(0,0,0,.6)}
.tip.on{animation:tipin .35s ease}
@keyframes tipin{from{opacity:0;transform:translateY(-6px)}}
.tip .tt{font-size:9.5px;margin-bottom:4px}
.tip .tt button{width:24px;height:24px}
.tip .row{margin-top:7px;gap:6px}
.tip .row button{padding:5px 10px;font-size:12px;border-radius:9px}
.tipmini{position:fixed;z-index:40;top:calc(var(--hh) + env(safe-area-inset-top) + 10px);right:max(10px,env(safe-area-inset-right));height:30px;padding:0 11px;border-radius:999px;background:rgba(14,14,26,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(214,59,255,.35);color:#e3d8ff;font-size:12px;font-weight:800;display:none;align-items:center;gap:5px}
.tipmini.on{display:inline-flex}
.timer.owner{border-color:rgba(61,220,151,.45);background:rgba(61,220,151,.08)}.timer.owner b{color:#7ff0bd;font-size:13px}
.toast{position:fixed;z-index:70;left:50%;top:calc(var(--hh) + env(safe-area-inset-top) + 12px);transform:translate(-50%,-20px);opacity:0;pointer-events:none;padding:12px 16px;border-radius:14px;background:#2a1420;border:1px solid rgba(255,84,112,.6);color:#ffd7de;font-weight:700;font-size:14px;transition:.3s;width:max-content;max-width:calc(100vw - 24px);text-align:center}
.toast.on{opacity:1;transform:translate(-50%,0)}
/* pin + expired + landing */
.center{min-height:100%;display:flex;align-items:center;justify-content:center;padding:calc(30px + env(safe-area-inset-top)) 20px calc(30px + env(safe-area-inset-bottom));position:relative}
.panel{width:100%;max-width:420px;text-align:center;position:relative}
.panel .big{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:28px}
.panel .big small{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}
.panel .big .lg{display:flex;align-items:center;gap:8px}
.panel .big svg{height:26px;width:auto}
.panel .big span{font-family:Poppins,sans-serif;font-weight:300;font-size:27px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.panel h1{font-size:clamp(24px,7vw,32px)}
.panel .lead{margin:0 auto}
.pinbox{margin:26px auto 0;display:flex;gap:8px;justify-content:center;position:relative}
.pinbox span{width:46px;height:58px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.04);display:grid;place-items:center;font-family:Sora,sans-serif;font-size:24px;font-weight:700;transition:border-color .2s,background .2s}
.pinbox span.f{border-color:rgba(214,59,255,.55);background:rgba(214,59,255,.08)}
.pinbox span.cur{border-color:#cfc4ff;box-shadow:0 0 0 3px rgba(207,196,255,.15)}
.pinbox input{position:absolute;inset:0;width:100%;height:100%;opacity:.01;font-size:16px;letter-spacing:40px;color:transparent;caret-color:transparent;background:transparent;border:0;outline:0}
.err{min-height:22px;margin-top:14px;color:#ff9db0;font-weight:600;font-size:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;border-radius:16px;font-weight:800;font-size:15.5px;margin-top:8px}
.btn.pri{background:var(--grad);color:#fff;box-shadow:0 12px 30px -12px rgba(214,59,255,.8)}
.btn.pri[disabled]{opacity:.5}
.btn.sec{border:1px solid var(--line);background:rgba(255,255,255,.04)}
.btn svg{width:19px;height:19px}
.small{margin-top:18px;font-size:13.5px;color:var(--muted)}
.small a{color:#e3c8ff;font-weight:700}
.clock{width:72px;height:72px;margin:0 auto 18px;border-radius:22px;display:grid;place-items:center;background:rgba(255,84,112,.1);border:1px solid rgba(255,84,112,.35);color:#ff9db0}
.clock svg{width:34px;height:34px}
#expired{position:fixed;inset:0;z-index:100;background:var(--bg);overflow:auto;display:none}
#expired.on{display:flex}
@media print{body *{display:none!important}body::after{content:"SMR Digital demos are not available to print.";display:block;padding:40px;font:16px sans-serif}}
</style>
</head>
<body<?= $preview ? ' class="owner"' : '' ?>>
<div class="glow"></div>

<?php if ($view === 'showroom'): ?>
<header class="hd" id="hd">
  <a class="brand" href="#" data-home aria-label="All demos">
    <small>Designed &amp; Built by</small>
    <span class="lg"><?= $mark ?><span>Digital</span></span>
  </a>
  <?php if ($preview): ?>
  <a class="hbtn homebtn" href="/demo-admin/#demos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>Home</a>
  <?php else: ?>
  <div class="timer" id="timer" role="timer" aria-live="off">
    <small>Session expires in</small><b id="clock">--:--</b>
  </div>
  <?php endif; ?>
  <button class="hbtn all" data-home type="button" aria-label="All demos">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>
    <span class="lbl-long">All Demos</span><span class="lbl-short">All</span>
  </button>
  <button class="hbtn icon viewsw" id="viewsw" type="button" title="Switch phone / full width" aria-label="Switch phone or full width view">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>
  </button>
  <button class="hbtn icon" id="menubtn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu">
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>
  </button>
  <a class="hbtn exit" href="<?= $preview ? '/demo-admin/' : h(MAIN_SITE) ?>"><?= $preview ? 'Admin' : 'Exit' ?></a>
</header>
<nav class="menu" id="menu" aria-label="Demo menu">
  <button type="button" data-home><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>All Demos</button>
  <button type="button" id="tipsbtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.7-.8 1.2v.4M12 17h.01"/></svg>Show this app's features</button>
  <a href="<?= h($waHelp) ?>" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z"/></svg>Message SMR on WhatsApp</a>
  <hr>
  <a href="<?= $preview ? '/demo-admin/' : h(MAIN_SITE) ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l4-4-4-4M14 12H4"/></svg><?= $preview ? 'Back to SMR Admin' : 'Exit demo' ?></a>
</nav>

<main id="home">
  <span class="eyebrow"><i></i><?= $preview ? 'Owner view · all demos' : 'Private demo' ?></span>
  <?php if ($preview): ?>
  <h1>Your <em>demo apps</em></h1>
  <p class="lead">Tap any app to open it, then <b>All Demos</b> to come back. No PIN and no time limit here.
  <?php else: ?>
  <h1>Have a look at <em>our apps</em></h1>
  <p class="lead">Here are demos of some of the apps SMR Digital has designed and built, each with different features. Tap one to try it: everything uses sample data, so press any button you like. Use <b>All Demos</b> at the top to come back here.
  <?php endif; ?></p>
  <div class="grid" id="grid"></div>
  <div class="note">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>
    <span>These are live previews of apps SMR Digital designed and built. Your own version would carry your branding, menu and prices. <a href="<?= h($waHelp) ?>" target="_blank" rel="noopener">Ask a question</a></span>
  </div>
</main>

<div class="stage" id="stage"><div class="dev"><iframe id="frame" title="Demo app" allow="geolocation; camera; clipboard-write; fullscreen" referrerpolicy="same-origin"></iframe></div></div>

<div class="tip" id="tip" role="dialog" aria-live="polite" aria-label="Feature tour">
  <div class="tt"><span id="tipn">Feature tour</span><button type="button" id="tipx" aria-label="Close tips"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div id="tipt"></div>
  <div class="row"><button type="button" id="tipskip">Skip</button><button type="button" class="nx" id="tipnext">Next</button></div>
</div>
<button class="tipmini" id="tipmini" type="button" aria-label="Show the feature tour">? Features</button>
<div class="toast" id="toast" role="alert"></div>
<?php endif; ?>

<?php if ($view === 'pin'): ?>
<div class="center">
  <form class="panel" id="pinform" autocomplete="off">
    <div class="big"><small>Designed &amp; Built by</small><span class="lg"><?= $mark ?><span>Digital</span></span></div>
    <span class="eyebrow"><i></i>Private demo</span>
    <h1>Have a look at <em>our apps</em></h1>
    <?php if ($pinApps): ?>
    <p class="lead"><?= count($pinApps) === 1 ? 'This is the app you are about to view:' : 'These are the ' . count($pinApps) . ' apps you are about to view:' ?></p>
    <div class="pinapps"><?php foreach ($pinApps as $pa): ?><span><img src="<?= h($pa['icon']) ?>" alt="" width="52" height="52" draggable="false"><small><?= h($pa['name']) ?></small></span><?php endforeach; ?></div>
    <?php endif; ?>
    <p class="lead" style="margin-top:14px">Enter the 6-digit PIN that came with your link to open <?= count($pinApps) === 1 ? 'it' : 'them' ?>. This link was made just for you.</p>
    <label class="pinbox" id="pinbox" for="pin">
      <span></span><span></span><span></span><span></span><span></span><span></span>
      <input id="pin" name="pin" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" aria-label="6-digit PIN" autofocus>
    </label>
    <div class="err" id="err" role="alert"></div>
    <button class="btn pri" id="go" type="submit" disabled>Open my demos</button>
    <p class="small">Your session starts as soon as the PIN is accepted. No PIN? <a href="<?= h($waAsk) ?>" target="_blank" rel="noopener">Request one</a></p>
  </form>
</div>
<?php endif; ?>

<?php if ($view === 'landing' || $view === 'invalid'): ?>
<div class="center">
  <div class="panel">
    <div class="big"><small>Designed &amp; Built by</small><span class="lg"><?= $mark ?><span>Digital</span></span></div>
    <span class="eyebrow"><i></i>Private demos</span>
    <h1><?= $view === 'invalid' ? 'This link is <em>not valid</em>' : 'SMR Digital <em>demos</em>' ?></h1>
    <p class="lead"><?= $view === 'invalid' ? 'Please check the link you were sent, or ask SMR Digital for a new one.' : 'The demo showroom is private. Open it from the link and PIN SMR Digital sent you.' ?></p>
    <a class="btn pri" style="margin-top:26px" href="<?= h($waAsk) ?>" target="_blank" rel="noopener">Request a demo on WhatsApp</a>
    <a class="btn sec" href="<?= h(MAIN_SITE) ?>">Return to SMR Digital Website</a>
  </div>
</div>
<?php endif; ?>

<div id="expired" class="<?= $view === 'expired' ? 'on' : '' ?>">
  <div class="center" style="width:100%">
    <div class="panel">
      <div class="big"><small>Designed &amp; Built by</small><span class="lg"><?= $mark ?><span>Digital</span></span></div>
      <div class="clock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2.5h6"/></svg></div>
      <h1>Your Demo Session Has Expired</h1>
      <p class="lead">Your access to the SMR Digital demos has ended. To continue exploring, please request a new PIN.</p>
      <a class="btn pri" style="margin-top:26px" href="<?= h($waRequest) ?>" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z"/></svg>Request New PIN</a>
      <a class="btn sec" href="<?= h(MAIN_SITE) ?>">Return to SMR Digital Website</a>
    </div>
  </div>
</div>

<script>
(function(){
var B=<?= json_encode($boot, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
var $=function(id){return document.getElementById(id)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var expiredOn=function(){var f=$('frame');if(f){f.src='about:blank';f.remove()}var t=$('tip');if(t)t.classList.remove('on');$('expired').classList.add('on');document.body.classList.add('locked');stopped=true};
var stopped=B.view==='expired';
if(stopped)document.body.classList.add('locked');

/* Casual-copy deterrents for the showroom itself (inputs keep working). */
document.addEventListener('contextmenu',function(e){if(!(e.target.closest&&e.target.closest('input,textarea')))e.preventDefault()});
document.addEventListener('dragstart',function(e){if(e.target.tagName==='IMG')e.preventDefault()});

/* ---------- PIN screen ---------- */
if(B.view==='pin'){
  var pin=$('pin'),boxes=$('pinbox').querySelectorAll('span'),go=$('go'),err=$('err');
  var paint=function(){var v=pin.value.replace(/\D/g,'').slice(0,6);if(pin.value!==v)pin.value=v;
    boxes.forEach(function(b,i){b.textContent=v[i]?'•':'';b.classList.toggle('f',!!v[i]);b.classList.toggle('cur',i===v.length&&document.activeElement===pin)});
    go.disabled=v.length!==6;if(v.length===6&&!busy)submit()};
  var busy=false;
  var submit=function(){if(busy)return;busy=true;go.disabled=true;go.textContent='Checking…';err.textContent='';
    fetch('/demo/api.php?a=redeem',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({token:B.token,pin:pin.value})})
    .then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})})
    .then(function(r){
      if(r.j.ok){go.textContent='Opening…';location.replace(location.pathname+location.search);return}
      if(r.j.error==='expired'||r.j.error==='used'){expiredOn();return}
      err.textContent=r.j.error||'Something went wrong.';pin.value='';busy=false;go.textContent='Open my demos';paint();pin.focus()})
    .catch(function(){err.textContent='No connection. Please try again.';busy=false;go.textContent='Open my demos';paint()})};
  pin.addEventListener('input',paint);pin.addEventListener('focus',paint);pin.addEventListener('blur',paint);
  $('pinform').addEventListener('submit',function(e){e.preventDefault();if(pin.value.length===6)submit()});
  paint();
}

/* ---------- Showroom ---------- */
if(B.view!=='showroom')return;
var demos=B.demos,bySlug={};demos.forEach(function(d){bySlug[d.slug]=d});
var grid=$('grid');
grid.innerHTML=demos.length?demos.map(function(d){return '<button class="card" type="button" data-open="'+esc(d.slug)+'" style="--acc:'+esc(d.accent||'#5b5bff')+'">'
  +'<img src="'+esc(d.icon)+'" alt="" width="66" height="66" draggable="false">'
  +'<span class="tx"><h3>'+esc(d.name)+'</h3><span class="tg">'+esc(d.tagline||'')+'</span><p>'+esc(d.description||'')+'</p></span>'
  +'<span class="go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>'
  +(d.enabled===0?'<span class="off">Hidden</span>':'')+'</button>'}).join(''):'<p class="lead">No demos have been added to this link yet.</p>';

var stage=$('stage'),frame=$('frame'),home=$('home'),current=null;
var phone=true;try{phone=localStorage.getItem('smrDemoView')!=='full'}catch(e){}
var setPhone=function(){stage.classList.toggle('phone',phone)};setPhone();
$('viewsw').addEventListener('click',function(){phone=!phone;setPhone();try{localStorage.setItem('smrDemoView',phone?'phone':'full')}catch(e){}});

/* Each time an app is opened it starts from scratch (intro, empty basket). */
var fresh=function(){try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&k.indexOf('smrDemo')!==0)localStorage.removeItem(k)}}catch(e){}
  try{for(var j=sessionStorage.length-1;j>=0;j--){var q=sessionStorage.key(j);if(q&&q.indexOf('smrTip')!==0)sessionStorage.removeItem(q)}}catch(e){}};
var show=function(slug){
  if(stopped)return;
  closeMenu();
  if(slug&&bySlug[slug]){
    if(current!==slug){fresh();frame.src='/demo/run/'+encodeURIComponent(slug)+'/';current=slug}
    stage.classList.add('on');home.style.display='none';document.body.classList.add('locked');
    document.title=bySlug[slug].name+' Demo - SMR Digital';
    startTips(slug,false);
  }else{
    if(current){frame.src='about:blank';current=null}
    stage.classList.remove('on');home.style.display='';document.body.classList.remove('locked');
    document.title=<?= json_encode($pageTitle) ?>;clearTimeout(tipT);$('tip').classList.remove('on');mini.classList.remove('on');
  }
};
var route=function(){var m=/app=([a-z0-9-]+)/.exec(location.hash);if(B.preview&&!m){location.replace('/demo-admin/#demos');return}show(m?m[1]:null)};
grid.addEventListener('click',function(e){var c=e.target.closest('[data-open]');if(c)location.hash='app='+c.getAttribute('data-open')});
document.querySelectorAll('[data-home]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();if(B.preview){location.href='/demo-admin/#demos';return}if(location.hash)history.pushState(null,'',location.pathname+location.search);show(null)})});
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);

/* menu */
var menu=$('menu'),mb=$('menubtn');
var closeMenu=function(){menu.classList.remove('on');mb.setAttribute('aria-expanded','false')};
mb.addEventListener('click',function(e){e.stopPropagation();var on=menu.classList.toggle('on');mb.setAttribute('aria-expanded',on?'true':'false')});
document.addEventListener('click',function(e){if(!menu.contains(e.target)&&e.target!==mb)closeMenu()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});

/* guided tips */
var tip=$('tip'),tipI=0,tipList=[];
var seen=function(s){try{return sessionStorage.getItem('smrTip:'+s)==='1'}catch(e){return false}};
var markSeen=function(s){try{sessionStorage.setItem('smrTip:'+s,'1')}catch(e){}};
var paintTip=function(){$('tipn').textContent='Feature tour · '+(tipI+1)+' of '+tipList.length;$('tipt').textContent=tipList[tipI];$('tipnext').textContent=tipI===tipList.length-1?'Done':'Next';$('tipskip').style.display=tipI===tipList.length-1?'none':''};
var tipT,mini=$('tipmini');
var startTips=function(slug,force){var d=bySlug[slug];tipList=(d&&d.tips)||[];clearTimeout(tipT);tip.classList.remove('on');mini.classList.remove('on');
  if(!tipList.length)return;
  if(!force&&(!B.tips||seen(slug))){mini.classList.add('on');return}
  tipT=setTimeout(function(){if(current!==slug)return;tipI=0;paintTip();tip.classList.add('on')},force?0:4000)};
var endTips=function(){tip.classList.remove('on');if(current){markSeen(current);mini.classList.add('on')}};
mini.addEventListener('click',function(){if(current)startTips(current,true)});
$('tipnext').addEventListener('click',function(){if(tipI<tipList.length-1){tipI++;paintTip()}else endTips()});
$('tipskip').addEventListener('click',endTips);$('tipx').addEventListener('click',endTips);
$('tipsbtn').addEventListener('click',function(){closeMenu();if(current)startTips(current,true);else{toast('Open an app first, then tap this again.',false)}});

var toastT;var toast=function(msg,bad){var t=$('toast');t.textContent=msg;t.style.borderColor=bad===false?'rgba(207,196,255,.5)':'';t.style.background=bad===false?'#1b1830':'';t.style.color=bad===false?'#eee':'';t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},5000)};

route();

/* ---------- session clock (server is the source of truth) ---------- */
if(B.preview)return;
var offset=B.now-Date.now()/1000,expires=B.expires,warned=false,timer=$('timer'),clock=$('clock');
var tick=function(){
  if(stopped)return;
  var left=Math.max(0,Math.round(expires-(Date.now()/1000+offset)));
  var m=Math.floor(left/60),s=left%60;
  clock.textContent=(m>=60?Math.floor(m/60)+':'+String(m%60).padStart(2,'0'):m)+':'+String(s).padStart(2,'0');
  timer.classList.toggle('low',left<=300&&left>60);
  timer.classList.toggle('crit',left<=60);
  if(left<=60&&left>0&&!warned){warned=true;toast('1 minute left. Your demo session is about to end.')}
  if(left>60)warned=false;
  if(left<=0){check(true)}
};
var checking=false;
var check=function(final){if(checking||stopped)return;checking=true;
  fetch('/demo/api.php?a=state',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
    checking=false;
    if(j.state!=='ok'){expiredOn();return}
    offset=j.now-Date.now()/1000;expires=j.expires_at;
  }).catch(function(){checking=false;if(final&&expires-(Date.now()/1000+offset)<=-5)expiredOn()})};
tick();setInterval(tick,1000);setInterval(check,30000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)check(false)});
})();
</script>
<script>/* app feel: no pinch or double-tap zoom */(function(){document.addEventListener('gesturestart',function(e){e.preventDefault()},{passive:false});document.addEventListener('gesturechange',function(e){e.preventDefault()},{passive:false});document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});})();</script>
</body>
</html>
