<?php
/* SMR Digital Demo Manager (private admin). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(true);
header('Cache-Control: no-store');
$tok = admin_token();
$mode = $tok ? 'app' : 'login';
$mark = preg_replace('/<svg /', '<svg aria-hidden="true" ', (string) @file_get_contents(SITE_ROOT . '/assets/smr-mark.svg'), 1);
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#08080f">
<title>SMR Admin</title>
<link rel="icon" href="/demo-admin/icon-192.png">
<link rel="manifest" href="/demo-admin/manifest.webmanifest">
<link rel="apple-touch-icon" href="/demo-admin/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SMR Admin">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@300&display=swap" rel="stylesheet">
<style>
html{touch-action:manipulation;-webkit-text-size-adjust:100%}
:root{--bg:#08080f;--bg2:#0e0e1a;--card:#12121e;--line:rgba(255,255,255,.09);--ink:#f2f2fa;--muted:#a3a3bd;--a1:#5b5bff;--a2:#d63bff;--grad:linear-gradient(110deg,var(--a1),var(--a2));--ok:#3ddc97;--warn:#ffb547;--bad:#ff5470}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:15px/1.45 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 10% 0%,rgba(91,91,255,.18),transparent 70%),radial-gradient(50% 40% at 100% 0%,rgba(214,59,255,.12),transparent 70%)}
a{color:#e3c8ff}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0}
.wrap{position:relative;max-width:1100px;margin:0 auto;padding:0 16px calc(60px + env(safe-area-inset-bottom))}
.top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 16px 10px;background:rgba(8,8,15,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line);margin:0 -16px 18px}
.logo{display:flex;align-items:center;gap:6px;margin-right:auto}
.logo svg{height:15px;width:auto}
.logo span{font-family:Poppins,sans-serif;font-weight:300;font-size:16px;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.logo b{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-left:6px;font-weight:700}
.tabs{display:flex;gap:4px;padding:4px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
.tabs button{padding:8px 14px;border-radius:10px;font-weight:700;font-size:13.5px;color:var(--muted)}
.tabs button.on{background:var(--grad);color:#fff}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:42px;padding:0 16px;border-radius:13px;font-weight:700;font-size:14px;border:1px solid var(--line);background:rgba(255,255,255,.04);white-space:nowrap;text-decoration:none;color:var(--ink)}
.btn:hover{border-color:rgba(255,255,255,.2)}
.btn.pri{background:var(--grad);border:0;color:#fff;box-shadow:0 10px 26px -12px rgba(214,59,255,.8)}
.btn.sm{height:34px;padding:0 11px;font-size:13px;border-radius:10px}
.btn.bad{color:#ff9db0}
.btn[disabled]{opacity:.5;pointer-events:none}
.btn svg{width:16px;height:16px}
h1{font-family:Sora,sans-serif;font-size:24px;letter-spacing:-.02em}
h2{font-family:Sora,sans-serif;font-size:18px;letter-spacing:-.01em;margin-bottom:12px}
.sub{color:var(--muted);font-size:14px;margin-top:4px}
.bar{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.panel{background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:16px}
label.f{display:block;font-size:12.5px;font-weight:700;color:var(--muted);margin:14px 0 6px;letter-spacing:.02em}
input[type=text],input[type=password],input[type=number],textarea,select{width:100%;height:46px;padding:0 14px;border-radius:13px;border:1px solid var(--line);background:#0c0c16;outline:0;font-size:15px}
textarea{height:auto;min-height:90px;padding:12px 14px;resize:vertical;line-height:1.45}
input:focus,textarea:focus,select:focus{border-color:rgba(214,59,255,.6);box-shadow:0 0 0 3px rgba(214,59,255,.15)}
.pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.pick label{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 10px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.03);cursor:pointer;text-align:center;transition:.15s}
.pick label:hover{border-color:rgba(255,255,255,.2)}
.pick input{position:absolute;opacity:0;pointer-events:none}
.pick img{width:58px;height:58px;border-radius:15px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.pick b{font-size:13.5px;line-height:1.2}
.pick small{font-size:11.5px;color:var(--muted);line-height:1.25}
.pick .ck{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:7px;border:1.5px solid rgba(255,255,255,.25);display:grid;place-items:center}
.pick .ck svg{width:14px;height:14px;opacity:0}
.pick input:checked+.ck{background:var(--grad);border-color:transparent}
.pick input:checked+.ck svg{opacity:1}
.pick label:has(input:checked){border-color:rgba(214,59,255,.65);background:rgba(214,59,255,.08)}
.pick input:focus-visible+.ck{box-shadow:0 0 0 3px rgba(214,59,255,.35)}
.seg{display:flex;flex-wrap:wrap;gap:8px}
.seg label{flex:1 1 170px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);cursor:pointer;background:rgba(255,255,255,.03)}
.seg label:has(input:checked){border-color:rgba(214,59,255,.65);background:rgba(214,59,255,.08)}
.seg input{accent-color:#d63bff;margin-right:6px}
.seg small{display:block;color:var(--muted);font-size:12px;margin-top:3px}
.chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.chips button{height:38px;padding:0 14px;border-radius:11px;border:1px solid var(--line);font-weight:700;font-size:13.5px;background:rgba(255,255,255,.03)}
.chips button.on{background:var(--grad);border-color:transparent;color:#fff}
.chips input{width:90px;height:38px}
.toggle{display:flex;align-items:center;gap:10px;margin-top:14px;font-weight:600;cursor:pointer}
.toggle input{width:20px;height:20px;accent-color:#d63bff}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.list{display:grid;gap:12px}
.lk{border:1px solid var(--line);border-radius:18px;padding:14px;background:rgba(255,255,255,.025)}
.lk .hd{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.lk .hd b{font-size:15.5px;margin-right:auto}
.badge{font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid}
.badge.active{color:var(--ok);border-color:rgba(61,220,151,.4);background:rgba(61,220,151,.08)}
.badge.not_activated,.badge.uses_left{color:#cfc4ff;border-color:rgba(207,196,255,.35);background:rgba(207,196,255,.06)}
.badge.expired{color:var(--warn);border-color:rgba(255,181,71,.4);background:rgba(255,181,71,.08)}
.badge.revoked{color:var(--bad);border-color:rgba(255,84,112,.4);background:rgba(255,84,112,.08)}
.icons{display:flex;gap:5px;flex-wrap:wrap;margin:10px 0}
.icons img{width:30px;height:30px;border-radius:9px;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px 14px;font-size:13px;color:var(--muted);margin-bottom:12px}
.meta span b{display:block;color:var(--ink);font-weight:700;font-size:13.5px}
.cred{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-radius:13px;background:#0c0c16;border:1px solid var(--line);margin-bottom:12px;font-size:13px}
.cred code{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;word-break:break-all;flex:1;min-width:180px;color:#cfc4ff}
.cred .pin{font-family:Sora,sans-serif;font-size:19px;letter-spacing:.18em}
.acts{display:flex;gap:8px;flex-wrap:wrap}
.dm{display:flex;gap:14px;align-items:flex-start;border:1px solid var(--line);border-radius:18px;padding:14px;background:rgba(255,255,255,.025)}
.dm>img{width:64px;height:64px;border-radius:16px;flex:none;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.dm .tx{flex:1;min-width:0}
.dm .tx b{font-size:16px}
.dm .tx p{color:var(--muted);font-size:13px;margin:4px 0 10px}
.dm form{margin-top:10px}
.hidden{display:none!important}
.empty{color:var(--muted);text-align:center;padding:30px}
.toast{position:fixed;z-index:99;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translate(-50%,20px);opacity:0;transition:.25s;padding:12px 18px;border-radius:14px;background:#1b1830;border:1px solid rgba(207,196,255,.4);font-weight:700;pointer-events:none;max-width:calc(100vw - 30px);text-align:center}
.toast.on{opacity:1;transform:translate(-50%,0)}
.toast.bad{background:#2a1420;border-color:rgba(255,84,112,.6)}
.auth{min-height:100vh;display:grid;place-items:center;padding:24px}
.auth .panel{width:100%;max-width:400px}
.auth .logo{justify-content:center;margin:0 0 18px}
.auth .logo svg{height:22px}.auth .logo span{font-size:22px}
.err{color:#ff9db0;font-weight:600;min-height:20px;margin-top:10px;font-size:14px}
.result{border:1px solid rgba(61,220,151,.4);background:rgba(61,220,151,.06)}
.send{border-color:rgba(214,59,255,.35);background:linear-gradient(180deg,rgba(214,59,255,.08),rgba(91,91,255,.03))}
.two{display:grid;grid-template-columns:1fr;gap:0 14px}@media(min-width:640px){.two{grid-template-columns:1fr 1fr}}
.more{margin-top:14px;border-top:1px solid var(--line);padding-top:12px}
.more summary{cursor:pointer;font-weight:700;color:#cfc4ff;font-size:13.5px}
.btn.big{width:100%;height:52px;font-size:16px;margin-top:6px;border-radius:15px}
.btn.wa{background:#25d366;border:0;color:#062b14}
.msg{min-height:190px;font-size:14px}
.usedbn{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:12px 14px;margin:-4px 0 12px;border-radius:14px;background:rgba(61,220,151,.12);border:1px solid rgba(61,220,151,.45)}
.usedbn b{color:#7ff0bd;font-size:14.5px}.usedbn span{flex:1 1 200px;font-size:13px;color:var(--muted)}
.newpin{font-family:Sora,sans-serif;font-size:34px;letter-spacing:.2em;margin:4px 0 10px}
.prog{height:6px;border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:10px}
.prog i{display:block;height:100%;width:0;background:var(--grad);transition:width .2s}
.filt{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.filt button{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line);font-size:12.5px;font-weight:700;color:var(--muted)}
.filt button.on{color:#fff;border-color:rgba(214,59,255,.6);background:rgba(214,59,255,.12)}
.btn.icon{width:38px;padding:0}
.top{flex-wrap:wrap}
.top .tabs{order:3;width:100%}.top .tabs button{flex:1;position:relative}
.cnt{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;border-radius:9px;background:#3ddc97;color:#062b14;font-size:11px;font-weight:800;vertical-align:1px}.cnt:empty{display:none}
.rows{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.02)}
.rw{display:flex;align-items:center;gap:6px;padding:0 6px 0 0;border-top:1px solid var(--line)}
.rw:first-child{border-top:0}
.rw .open{flex:1;min-width:0;display:flex;align-items:center;gap:13px;padding:11px 12px;color:var(--ink);text-decoration:none}
.rw .open:active{background:rgba(255,255,255,.04)}
.rw img{width:46px;height:46px;border-radius:12px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.rw span{min-width:0;display:flex;flex-direction:column;gap:2px}
.rw b{font-size:15.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rw small{font-size:12.5px;color:var(--muted)}
.rw.off img{opacity:.45}
.tag{font-style:normal;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--warn);margin-left:6px}.tag.bad{color:var(--bad)}
.dots{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--muted);flex:none}
.dots:hover,.dots:active{background:rgba(255,255,255,.06);color:var(--ink)}
.dots svg,.btn.icon svg{width:20px;height:20px}
.scrim{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:.2s}
.scrim.on{opacity:1;pointer-events:auto}
.sheet{position:fixed;z-index:90;left:0;right:0;bottom:0;max-height:88vh;overflow:auto;background:#14141f;border-top-left-radius:22px;border-top-right-radius:22px;border:1px solid var(--line);padding:8px 16px calc(18px + env(safe-area-inset-bottom));transform:translateY(105%);transition:transform .25s ease;max-width:560px;margin:0 auto}
.sheet.on{transform:none}
.grab{width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);margin:4px auto 12px}
.sheet h2{margin-bottom:6px}
.sh-h{display:flex;gap:12px;align-items:center;padding:4px 4px 12px;border-bottom:1px solid var(--line);margin-bottom:6px}
.sh-h img{width:44px;height:44px;border-radius:12px}
.sh-h b{display:block;font-size:16px}.sh-h small{color:var(--muted);font-size:12.5px}
.it{display:flex;width:100%;align-items:center;gap:10px;padding:14px 8px;border-radius:12px;font-weight:700;font-size:15px;text-align:left}
.it:hover,.it:active{background:rgba(255,255,255,.05)}
.it.bad{color:#ff9db0}.it.muted{color:var(--muted);justify-content:center}
.grid4{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.grid4 .btn{height:56px;font-size:16px}
.notif{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:14px;border-radius:16px;border:1px solid rgba(61,220,151,.35);background:rgba(61,220,151,.06);margin-bottom:14px}
.notif b{display:block}.notif span{font-size:13px;color:var(--muted)}
.lk .icons{align-items:center}.lk .icons span{font-size:13px;color:var(--muted);margin-left:4px}
.lk .line{font-size:13px;color:var(--muted);margin:2px 0 4px}
.lk .views{font-size:13px;color:var(--muted);margin:0 0 10px}.lk .views b{color:#fff;font-size:14px}
.lk .left{display:flex;align-items:baseline;gap:10px;margin:0 0 12px}.lk .left span{font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.lk .left b{font-family:Sora,sans-serif;font-size:28px;font-variant-numeric:tabular-nums;color:#7ff0bd}
.lk.low .left b{color:var(--warn)}
.lk.active{border-color:rgba(61,220,151,.35)}
.lk.expired,.lk.revoked{opacity:.75}
.feed{display:flex;flex-direction:column;gap:2px}
.ev{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--line);font-size:13.5px}
.ev i{width:8px;height:8px;border-radius:50%;background:#cfc4ff;flex:none}.ev.opened i{background:#3ddc97}.ev.low i{background:var(--warn)}.ev.ended i{background:var(--bad)}
.ev span{flex:1;min-width:0}.ev small{color:var(--muted);font-size:12px;white-space:nowrap}
@media(max-width:600px){.logo b{display:none}}
</style>
</head>
<body>
<?php if ($mode !== 'app'): ?>
<div class="auth">
  <form class="panel" id="auth" autocomplete="off">
    <div class="logo"><?= $mark ?><span>Digital</span></div>
    <h1 style="text-align:center">SMR Admin</h1>
    <p class="sub" style="text-align:center">Enter your admin PIN.</p>
    <input type="password" id="pin" inputmode="numeric" pattern="[0-9]*" maxlength="12" autocomplete="off" aria-label="Admin PIN" autofocus style="margin-top:18px;text-align:center;font-size:24px;letter-spacing:.4em;height:56px">
    <div class="err" id="err" role="alert"></div>
    <button class="btn pri" style="width:100%;margin-top:8px;height:48px" type="submit">Log in</button>
  </form>
</div>
<script>
(function(){var f=document.getElementById('auth'),err=document.getElementById('err'),pin=document.getElementById('pin');
pin.addEventListener('input',function(){pin.value=pin.value.replace(/\D/g,'')});
f.addEventListener('submit',function(e){e.preventDefault();err.textContent='';
  fetch('api.php?a=login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({pin:pin.value})})
  .then(function(r){return r.json()}).then(function(j){if(j.ok)location.reload();else{err.textContent=j.error||'Something went wrong.';pin.value='';pin.focus()}})
  .catch(function(){err.textContent='No connection.'})});})();
</script>
<?php else: ?>
<div class="wrap">
  <div class="top">
    <div class="logo"><?= $mark ?><span>Digital</span><b>Admin</b></div>
    <button class="btn sm icon" id="refresh" aria-label="Refresh" title="Refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button>
    <button class="btn sm icon" id="acct" aria-label="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></button>
    <nav class="tabs" role="tablist">
      <button data-tab="demos" role="tab">My demos</button>
      <button data-tab="send" role="tab">Send</button>
      <button data-tab="live" role="tab">Live<span class="cnt" id="livecnt"></span></button>
    </nav>
  </div>

  <!-- MY DEMOS -->
  <section id="tab-demos" class="tab">
    <div class="bar">
      <div><h1>My demos</h1><p class="sub">Tap an app to open it. No PIN, no time limit.</p></div>
      <button class="btn sm" id="newdemo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add app</button>
    </div>
    <div class="rows" id="demos"></div>
  </section>

  <!-- SEND -->
  <section id="tab-send" class="tab hidden">
    <form class="panel send" id="linkform">
      <h1>Send demos</h1>
      <p class="sub">Pick the apps, create the link, then send it on WhatsApp with the PIN.</p>
      <div class="row" style="justify-content:space-between;margin-top:16px"><label class="f" style="margin:0">1. Which apps?</label><button type="button" class="btn sm" id="selall">Select all</button></div>
      <div class="pick" id="pick" style="margin-top:8px"></div>
      <div class="two">
        <div><label class="f" for="lb">2. Their name (optional)</label><input type="text" id="lb" placeholder="e.g. Ahmed, Kebab House" maxlength="80"></div>
        <div><label class="f" for="ph">Their WhatsApp number (optional)</label><input type="tel" id="ph" placeholder="07..." inputmode="tel" maxlength="20"></div>
      </div>
      <details class="more"><summary>More options (45 minutes, one shared timer)</summary>
        <label class="f">Access type</label>
        <div class="seg">
          <label><input type="radio" name="mode" value="shared" checked>Shared, one timer<small>Works on any of their devices. One clock from the first time the PIN is used.</small></label>
          <label><input type="radio" name="mode" value="single">One device<small>PIN works once, on one device.</small></label>
          <label><input type="radio" name="mode" value="limited">Limited uses<small>PIN works <input type="number" id="maxu" value="3" min="2" max="500" style="width:64px;height:30px;padding:0 6px;display:inline-block"> times, each with its own timer.</small></label>
        </div>
        <label class="f">Session length</label>
        <div class="chips" id="dur"><button type="button" data-m="15">15 min</button><button type="button" data-m="30">30 min</button><button type="button" data-m="45" class="on">45 min</button><button type="button" data-m="60">1 hour</button><button type="button" data-m="120">2 hours</button><input type="number" id="durc" min="5" max="10080" placeholder="mins" aria-label="Custom minutes"></div>
        <label class="toggle"><input type="checkbox" id="tips" checked>Show the feature tour in each app</label>
      </details>
      <div class="err" id="lerr"></div>
      <button class="btn pri big" type="submit">Create link</button>
    </form>
    <div class="panel result hidden" id="created"></div>
  </section>

  <!-- LIVE -->
  <section id="tab-live" class="tab hidden">
    <div class="bar"><div><h1>Live links</h1><p class="sub">Who has opened a demo, how long they have left, and extend or end it.</p></div></div>
    <div class="notif hidden" id="notif"><div><b>Get notified</b><span>When someone opens a demo, and when their time is nearly up.</span></div><button class="btn sm pri" id="notifon">Turn on</button></div>
    <div class="filt" id="filt"><button class="on" data-f="live">Live &amp; waiting</button><button data-f="ended">Ended</button><button data-f="all">All</button></div>
    <div class="list" id="links"></div>
    <h2 style="margin-top:26px">Recent activity</h2>
    <div class="feed" id="feed"></div>
  </section>
</div>

<!-- bottom sheet -->
<div class="scrim" id="scrim"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div id="sheetin"></div></div>
<input type="file" id="fzip" accept=".zip,application/zip" hidden>
<input type="file" id="ficon" accept="image/png,image/jpeg,image/webp" hidden>
<div class="toast" id="toast"></div>
<script>
(function(){
var CSRF=<?= json_encode($tok['csrf']) ?>,D=[],L=[],E=[],skew=0,filter='live',pushN=0;
var $=function(id){return document.getElementById(id)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var toast=function(m,bad){var t=$('toast');t.textContent=m;t.classList.toggle('bad',!!bad);t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on')},3200)};
var api=function(a,body,form){
  var o={method:'POST',credentials:'same-origin',headers:{'X-CSRF':CSRF}};
  if(form)o.body=form;else{o.headers['Content-Type']='application/json';o.body=JSON.stringify(body||{})}
  return fetch('api.php?a='+a,o).then(function(r){return r.json().catch(function(){return{error:'Server error ('+r.status+')'}})}).then(function(j){if(j.login){location.reload()}if(j.error)throw new Error(j.error);return j})};
var nowS=function(){return Math.floor(Date.now()/1000+skew)};
var fmtT=function(t){if(!t)return'';var d=new Date(t*1000),td=new Date();var same=d.toDateString()===td.toDateString();return(same?'Today':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}))+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})};
var fmtD=function(t){return t?new Date(t*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''};
var ago=function(t){var s=nowS()-t;if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' h ago';return fmtT(t)};
var fmtLeft=function(s){if(s<=0)return'0:00';var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
var demoBy=function(s){for(var i=0;i<D.length;i++)if(D[i].slug===s)return D[i]};
var andList=function(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]};
var durTxt=function(m){return m>=60&&m%60===0?(m===60?'1 hour':(m/60)+' hours'):m+' minutes'};
var shareText=function(l){var names=l.apps.map(function(s){var d=demoBy(s);return d?d.name:s}),one=names.length===1;
  return (one?"Here's the demo we spoke about ("+names[0]+"). Have a little look around the app."
         :"Here are the demos we spoke about ("+andList(names)+"). Have a look through the apps.")
    +' Let me know what you think.'
    +'\n\n'+linkPin(l)
    +'\n\nYou have '+durTxt(l.duration)+' from when you enter the PIN. Any questions, just message me.\n\nSummar, SMR Digital'};
var linkPin=function(l){return 'Link to demo:\n'+l.url+'\n\nPIN to access demo:\n'+l.pin};
var waUrl=function(text,phone){var n=String(phone||'').replace(/\D/g,'');if(n.indexOf('00')===0)n=n.slice(2);else if(n.charAt(0)==='0')n='44'+n.slice(1);
  return 'https://wa.me/'+(n.length>=10?n:'')+'?text='+encodeURIComponent(text)};
var copy=function(t,msg){(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast(msg||'Copied')}).catch(function(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast(msg||'Copied')}catch(e){}a.remove()})};
var ICON={dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'};

/* ---------- tabs (hash) ---------- */
var showTab=function(t){if(['demos','send','live'].indexOf(t)<0)t='demos';
  document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('on',b.dataset.tab===t)});
  document.querySelectorAll('.tab').forEach(function(s){s.classList.toggle('hidden',s.id!=='tab-'+t)});window.scrollTo(0,0);if(t==='live'&&typeof load==='function'&&D.length)load();if(t!=='send'&&$('created').dataset.used&&typeof resetSend==='function')resetSend()};
document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){if(location.hash!=='#'+b.dataset.tab)history.replaceState(null,'','#'+b.dataset.tab);showTab(b.dataset.tab)})});
window.addEventListener('hashchange',function(){showTab(location.hash.slice(1))});
showTab(location.hash.slice(1));

/* ---------- sheet ---------- */
var sheet=$('sheet'),scrim=$('scrim');
var openSheet=function(html,bind){$('sheetin').innerHTML=html;sheet.classList.add('on');scrim.classList.add('on');if(bind)bind($('sheetin'))};
var closeSheet=function(){sheet.classList.remove('on');scrim.classList.remove('on')};
scrim.addEventListener('click',closeSheet);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});
var item=function(act,label,icon,cls){return '<button class="it'+(cls?' '+cls:'')+'" data-act="'+act+'">'+(icon||'')+'<span>'+label+'</span></button>'};

/* ---------- load ---------- */
var load=function(){return api('list').then(function(j){D=j.demos;L=j.links;E=j.events||[];pushN=j.push_devices||0;skew=j.now-Date.now()/1000;renderDemos();renderPick();renderLinks();renderFeed();renderNotif()}).catch(function(e){toast(e.message,true)})};

/* ---------- my demos ---------- */
var renderDemos=function(){$('demos').innerHTML=D.length?D.map(function(d){
  return '<div class="rw'+(d.enabled?'':' off')+'" data-slug="'+esc(d.slug)+'"><a class="open" href="/demo/?preview=1#app='+esc(d.slug)+'"><img src="'+esc(d.icon)+'" alt=""><span><b>'+esc(d.name)+(d.enabled?'':' <i class="tag">Hidden</i>')+(d.files_ok?'':' <i class="tag bad">Files missing</i>')+'</b><small>Updated '+fmtD(d.updated_at)+'</small></span></a>'
   +'<button class="dots" data-opts aria-label="Options for '+esc(d.name)+'">'+ICON.dots+'</button></div>'}).join(''):'<div class="empty">No demos yet.</div>'};
var curSlug=null;
$('demos').addEventListener('click',function(e){var b=e.target.closest('[data-opts]');if(!b)return;var slug=b.closest('[data-slug]').dataset.slug,d=demoBy(slug);curSlug=slug;
  openSheet('<div class="sh-h"><img src="'+esc(d.icon)+'" alt=""><div><b>'+esc(d.name)+'</b><small>'+esc(d.tagline)+'</small></div></div>'
    +item('open','Open demo')+item('send','Send this demo')+item('edit','Edit name, text and feature tour')+item('icon','Change icon')+item('zip','Replace with a new ZIP')
    +item('toggle',d.enabled?'Hide from customers':'Show to customers')+(d.source==='seed'?'':item('del','Delete','', 'bad'))+item('close','Cancel','','muted'),
  function(el){el.addEventListener('click',function(ev){var it=ev.target.closest('[data-act]');if(!it)return;var a=it.dataset.act;
    if(a==='close')closeSheet();
    if(a==='open')location.href='/demo/?preview=1#app='+slug;
    if(a==='send'){closeSheet();document.querySelectorAll('#pick input').forEach(function(i){i.checked=i.value===slug});location.hash='send'}
    if(a==='icon'){closeSheet();$('ficon').click()}
    if(a==='zip'){closeSheet();$('fzip').click()}
    if(a==='toggle')api('demo_save',{slug:slug,enabled:d.enabled?0:1}).then(function(){closeSheet();toast(d.enabled?'Hidden':'Visible again');load()}).catch(function(e){toast(e.message,true)});
    if(a==='del'){if(confirm('Delete '+d.name+' and its files?'))api('demo_delete',{slug:slug}).then(function(){closeSheet();toast('Deleted');load()}).catch(function(e){toast(e.message,true)})}
    if(a==='edit')editDemo(d)})})});
var editDemo=function(d){openSheet('<h2>Edit '+esc(d.name)+'</h2><form id="ef"><label class="f">Name</label><input type="text" name="name" value="'+esc(d.name)+'" maxlength="60">'
   +'<label class="f">Short line</label><input type="text" name="tagline" value="'+esc(d.tagline)+'" maxlength="90">'
   +'<label class="f">Description</label><textarea name="description" maxlength="400">'+esc(d.description)+'</textarea>'
   +'<label class="f">Feature tour (one point per line)</label><textarea name="tips" maxlength="1500" style="min-height:150px">'+esc(d.tips_text)+'</textarea>'
   +'<div class="row" style="margin-top:12px"><label class="f" style="margin:0">Card colour</label><input type="color" name="accent" value="'+esc(d.accent)+'" style="width:48px;height:36px;border:0;background:none"><label class="f" style="margin:0 0 0 10px">Order</label><input type="number" name="sort" value="'+d.sort+'" style="width:90px;height:38px"></div>'
   +'<div class="row" style="margin-top:14px"><button class="btn pri" type="submit">Save</button><button class="btn" type="button" data-x>Cancel</button></div></form>',
  function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelector('#ef').addEventListener('submit',function(e){e.preventDefault();var f=e.target,o={slug:d.slug};
    ['name','tagline','description','tips','accent','sort'].forEach(function(k){o[k]=f.elements[k].value});
    api('demo_save',o).then(function(){closeSheet();toast('Saved');load()}).catch(function(er){toast(er.message,true)})})})};
var upload=function(a,fd,done){var x=new XMLHttpRequest();x.open('POST','api.php?a='+a);x.setRequestHeader('X-CSRF',CSRF);
  toast('Uploading…');
  x.upload.onprogress=function(e){if(e.lengthComputable)toast('Uploading '+Math.round(e.loaded/e.total*100)+'%')};
  x.onload=function(){var j;try{j=JSON.parse(x.responseText)}catch(e){j={error:x.status===413?'That file is too big for the server.':'Server error ('+x.status+')'}}if(j.error)toast(j.error,true);else{done(j);load()}};
  x.onerror=function(){toast('Upload failed. Check your connection.',true)};x.send(fd)};
$('ficon').addEventListener('change',function(){if(!this.files[0]||!curSlug)return;var fd=new FormData();fd.append('slug',curSlug);fd.append('icon',this.files[0]);this.value='';upload('demo_icon',fd,function(){toast('Icon updated')})});
$('fzip').addEventListener('change',function(){if(!this.files[0])return;var fd=new FormData();fd.append('zip',this.files[0]);this.value='';
  if(curSlug){fd.append('slug',curSlug);upload('demo_upload',fd,function(j){toast('Demo replaced ('+j.files+' files)')})}
  else{fd.append('name',newName);upload('demo_upload',fd,function(j){toast('Demo added ('+j.files+' files)')})}});
var newName='';
$('newdemo').addEventListener('click',function(){openSheet('<h2>Add an app</h2><p class="sub">Upload a ZIP of the built website or Flutter Web app (for Flutter, zip the build/web folder). Use sample data only.</p><label class="f">App name</label><input type="text" id="nn" maxlength="60" placeholder="e.g. Kebab House"><div class="row" style="margin-top:14px"><button class="btn pri" data-go>Choose ZIP</button><button class="btn" data-x>Cancel</button></div>',
  function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelector('[data-go]').onclick=function(){newName=el.querySelector('#nn').value.trim();if(!newName){toast('Give the app a name first',true);return}curSlug=null;closeSheet();$('fzip').click()}})});

/* ---------- send ---------- */
var renderPick=function(){var keep={};document.querySelectorAll('#pick input:checked').forEach(function(i){keep[i.value]=1});
  $('pick').innerHTML=D.filter(function(d){return d.enabled}).map(function(d){return '<label><input type="checkbox" value="'+esc(d.slug)+'"'+(keep[d.slug]?' checked':'')+'><span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><img src="'+esc(d.icon)+'" alt=""><b>'+esc(d.name)+'</b><small>'+esc(d.tagline)+'</small></label>'}).join('')||'<p class="sub">No demos yet.</p>'};
$('selall').addEventListener('click',function(){var all=document.querySelectorAll('#pick input'),any=[].some.call(all,function(i){return!i.checked});all.forEach(function(i){i.checked=any});this.textContent=any?'Clear all':'Select all'});
var dur=45;
$('dur').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;dur=+b.dataset.m;$('durc').value='';this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)})});
$('durc').addEventListener('input',function(){var v=+this.value;if(v>=5){dur=v;$('dur').querySelectorAll('button').forEach(function(x){x.classList.remove('on')})}});
var resetT;
var resetSend=function(){clearTimeout(resetT);var c=$('created');c.classList.add('hidden');c.innerHTML='';delete c.dataset.used;
  document.querySelectorAll('#pick input').forEach(function(i){i.checked=false});$('lb').value='';$('ph').value='';$('lerr').textContent='';
  if(!$('tab-send').classList.contains('hidden')){window.scrollTo({top:0,behavior:'smooth'});toast('Ready for a new link')}};
var showMessage=function(l,phone){var c=$('created');clearTimeout(resetT);delete c.dataset.used;c.classList.remove('hidden');
  c.innerHTML='<h2>Link ready'+(l.label?' for '+esc(l.label):'')+'</h2><p class="sub">Pick a message, check it, then send it. You can edit it first.</p>'
    +'<div class="filt" style="margin:12px 0 8px"><button class="on" data-kind="short">Link &amp; PIN</button><button data-kind="full">Full message</button></div>'
    +'<textarea class="msg" id="msgtxt"></textarea>'
    +'<a class="btn big wa" id="wasend" target="_blank" rel="noopener" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z"/></svg>Send on WhatsApp</a>'
    +'<div class="acts" style="margin-top:10px"><button class="btn sm" data-lp>Copy link &amp; PIN</button><button class="btn sm" data-c>Copy full message</button><button class="btn sm" data-x>Done</button></div>';
  var ta=c.querySelector('#msgtxt'),wa=c.querySelector('#wasend');ta.value=linkPin(l);
  c.querySelectorAll('[data-kind]').forEach(function(k){k.onclick=function(){c.querySelectorAll('[data-kind]').forEach(function(x){x.classList.toggle('on',x===k)});ta.value=k.dataset.kind==='full'?shareText(l):linkPin(l);upd()}});
  var upd=function(){wa.href=waUrl(ta.value,phone)};upd();ta.addEventListener('input',upd);
  /* Once it's been copied or sent, show that clearly and clear the box after 2 minutes so the same link isn't sent twice by mistake. */
  var used=function(how){if(c.dataset.used)return;c.dataset.used='1';
    var bn=document.createElement('div');bn.className='usedbn';bn.innerHTML='<b>✓ '+how+(l.label?' for '+esc(l.label):'')+'</b><span>This link belongs to '+(l.label?esc(l.label):'that person')+'. For someone else, make a new one.</span><button class="btn sm pri" type="button" data-new>New link</button>';
    c.insertBefore(bn,c.firstChild);bn.querySelector('[data-new]').onclick=resetSend;
    clearTimeout(resetT);resetT=setTimeout(resetSend,120000)};
  wa.addEventListener('click',function(){used('Sent on WhatsApp');setTimeout(function(){toast('Sent links are in the Live tab')},800)});
  c.querySelector('[data-c]').onclick=function(){copy(shareText(l),'Full message copied');used('Copied')};c.querySelector('[data-lp]').onclick=function(){copy(linkPin(l),'Link and PIN copied');used('Copied')};c.querySelector('[data-x]').onclick=resetSend;
  c.scrollIntoView({behavior:'smooth',block:'start'})};
$('linkform').addEventListener('submit',function(e){e.preventDefault();$('lerr').textContent='';
  var apps=[].map.call(document.querySelectorAll('#pick input:checked'),function(i){return i.value});
  if(!apps.length){$('lerr').textContent='Choose at least one app.';return}
  var mode=document.querySelector('[name=mode]:checked').value,phone=$('ph').value;
  api('link_create',{label:$('lb').value,apps:apps,mode:mode,max_uses:+$('maxu').value,duration:dur,tips:$('tips').checked}).then(function(j){
    $('lb').value='';$('ph').value='';document.querySelectorAll('#pick input').forEach(function(i){i.checked=false});
    load().then(function(){showMessage(j.link,phone)})}).catch(function(er){$('lerr').textContent=er.message})});

/* ---------- live ---------- */
var STAT={active:'Live now',not_activated:'Not opened yet',uses_left:'Waiting',expired:'Ended',revoked:'Ended early'};
var leftOf=function(l){return l.status==='active'?Math.max(0,l.expires_at-nowS()):0};
var isLive=function(l){return l.status==='active'||l.status==='not_activated'||l.status==='uses_left'};
var renderLinks=function(){
  var n=L.filter(function(l){return l.status==='active'}).length;$('livecnt').textContent=n?n:'';
  var list=L.filter(function(l){return filter==='all'||(filter==='live'?isLive(l):!isLive(l))});
  $('links').innerHTML=list.length?list.map(function(l){
    var names=l.apps.map(function(s){var d=demoBy(s);return d?d.name:s});
    var app=l.last_app&&demoBy(l.last_app)?demoBy(l.last_app).name:'';
    var line=l.status==='not_activated'?'Sent '+fmtT(l.created_at)+' · not opened yet'
      :l.status==='active'?'Opened '+fmtT(l.activated_at)+(app?' · last looked at '+esc(app):'')+(l.devices>1?' · '+l.devices+' devices':'')
      :l.activated_at?'Opened '+fmtT(l.activated_at)+(app?' · last looked at '+esc(app):''):'Sent '+fmtT(l.created_at);
    return '<div class="lk '+l.status+'" data-id="'+l.id+'"><div class="hd"><b>'+esc(l.label||'No name')+'</b><span class="badge '+l.status+'">'+STAT[l.status]+'</span></div>'
    +'<div class="icons">'+l.apps.map(function(s){var d=demoBy(s);return d?'<img src="'+esc(d.icon)+'" alt="" title="'+esc(d.name)+'">':''}).join('')+'<span>'+esc(andList(names))+'</span></div>'
    +'<p class="line">'+line+'</p>'
    +'<p class="views"><b>'+(l.views||0)+'</b> '+(l.views===1?'click':'clicks')+' on the link'+(l.last_view?' · last opened '+fmtT(l.last_view):'')+'</p>'
    +(l.status==='active'?'<div class="left"><span>Time left</span><b data-left>'+fmtLeft(leftOf(l))+'</b></div>':'')
    +'<div class="acts"><button class="btn sm pri" data-a="extend">'+(l.status==='active'?'Extend':(l.status==='expired'||l.status==='revoked'?'Give more time':'Add time'))+'</button>'
    +(isLive(l)?'<button class="btn sm bad" data-a="end">End now</button>':'')
    +'<button class="btn sm icon" data-a="more" aria-label="More">'+ICON.dots+'</button></div></div>'}).join(''):'<div class="empty">'+(filter==='live'?'No live links. Send some demos from the <b>Send</b> tab.':'Nothing here yet.')+'</div>'};
$('filt').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;filter=b.dataset.f;this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});renderLinks()});
var run=function(act,body,msg){return api(act,body).then(function(){closeSheet();toast(msg);load()}).catch(function(e){toast(e.message,true)})};
$('links').addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var id=+b.closest('[data-id]').dataset.id,l=L.filter(function(x){return x.id===id})[0],a=b.dataset.a;
  if(a==='extend')openSheet('<h2>Add time'+(l.label?' for '+esc(l.label):'')+'</h2><p class="sub">'+(l.status==='active'?'Added on to the time they have left.':(l.activated_at?'Their demo opens again straight away with this much time.':'Makes their session longer when they open it.'))+'</p><div class="grid4"><button class="btn" data-m="10">+10 min</button><button class="btn" data-m="15">+15 min</button><button class="btn" data-m="30">+30 min</button><button class="btn" data-m="60">+1 hour</button></div><button class="btn big" data-x style="margin-top:10px">Cancel</button>',
    function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelectorAll('[data-m]').forEach(function(m){m.onclick=function(){run('link_extend',{id:id,minutes:+m.dataset.m},'Added '+m.textContent.replace('+',''))}})});
  if(a==='end'&&confirm('End this demo now? They will see the expired screen straight away.'))run('link_revoke',{id:id},'Demo ended');
  if(a==='more')openSheet('<h2>'+esc(l.label||'Demo link')+'</h2><div class="cred"><span class="pin">'+esc(l.pin)+'</span><code>'+esc(l.url)+'</code></div>'
    +item('lp','Copy link & PIN')+item('copy','Copy full message')+item('wa','Send again on WhatsApp')+item('pin','New PIN (old one stops working)')+item('del','Delete link','','bad')+item('close','Cancel','','muted'),
    function(el){el.addEventListener('click',function(ev){var it=ev.target.closest('[data-act]');if(!it)return;var x=it.dataset.act;
      if(x==='close')closeSheet();
      if(x==='copy'){copy(shareText(l),'Message copied');closeSheet()}
      if(x==='lp'){copy(linkPin(l),'Link and PIN copied');closeSheet()}
      if(x==='wa'){window.open(waUrl(linkPin(l),''),'_blank');closeSheet()}
      if(x==='pin'&&confirm('Make a new PIN? The old PIN stops working and the timer resets.'))run('link_newpin',{id:id},'New PIN made');
      if(x==='del'&&confirm('Delete this link for good?'))run('link_delete',{id:id},'Link deleted')})})});
setInterval(function(){var reload=false;document.querySelectorAll('#links [data-left]').forEach(function(el){var l=L.filter(function(x){return x.id===+el.closest('[data-id]').dataset.id})[0];if(!l)return;var s=leftOf(l);el.textContent=fmtLeft(s);el.closest('.lk').classList.toggle('low',s<=300);if(s<=0)reload=true});if(reload)load()},1000);
var EV={opened:'opened',low:'low',ended:'ended'};
var renderFeed=function(){$('feed').innerHTML=E.length?E.map(function(e){var who=e.label||'Someone';return '<div class="ev '+esc(EV[e.type]||'')+'"><i></i><span><b>'+esc(who)+'</b>'+(e.text.charAt(0)==="'"?'':' ')+esc(e.text.replace(' Tap to extend.',''))+'</span><small>'+ago(e.at)+'</small></div>'}).join(''):'<div class="empty">No activity yet.</div>'};

/* ---------- notifications ---------- */
var pushOK='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
var standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;
var renderNotif=function(){var n=$('notif');if(!pushOK){if(/iPhone|iPad/.test(navigator.userAgent)&&!standalone){n.classList.remove('hidden');n.innerHTML='<div><b>Get notified</b><span>Add SMR Admin to your Home Screen first (Share, then Add to Home Screen), open it from there, then turn on notifications.</span></div>'}return}
  navigator.serviceWorker.getRegistration('/demo-admin/').then(function(r){return r&&r.pushManager.getSubscription()}).then(function(sub){n.classList.toggle('hidden',!!sub&&Notification.permission==='granted')})};
var b64=function(s){s=s.replace(/-/g,'+').replace(/_/g,'/');var p=s.length%4?4-s.length%4:0;var r=atob(s+'===='.slice(0,p)),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
var enablePush=function(){if(!pushOK){toast('This browser cannot show notifications',true);return Promise.resolve()}
  return Notification.requestPermission().then(function(p){if(p!=='granted')throw new Error('Notifications were not allowed. You can allow them in your phone settings.');
    return Promise.all([navigator.serviceWorker.register('/demo-admin/sw.js',{scope:'/demo-admin/'}).then(function(){return navigator.serviceWorker.ready}),api('push_key')])})
  .then(function(r){return r[0].pushManager.getSubscription().then(function(s){return s||r[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(r[1].key)})})})
  .then(function(sub){return api('push_subscribe',sub.toJSON())}).then(function(){toast('Notifications are on');load()}).catch(function(e){toast(e.message,true)})};
$('notifon').addEventListener('click',enablePush);
if(pushOK)navigator.serviceWorker.register('/demo-admin/sw.js',{scope:'/demo-admin/'}).catch(function(){});

/* ---------- settings ---------- */
$('acct').addEventListener('click',function(){openSheet('<h2>Settings</h2>'
  +'<label class="f">Notifications</label><div class="row"><button class="btn sm pri" data-act="pushon">Turn on for this device</button><button class="btn sm" data-act="pushtest">Send a test</button></div><p class="sub" style="margin-top:6px">'+(pushN?pushN+' device'+(pushN>1?'s':'')+' getting notifications.':'No devices getting notifications yet.')+'</p>'
  +'<label class="f">Change PIN</label><div class="row"><input type="password" id="curpw" placeholder="Current PIN" inputmode="numeric" style="max-width:160px"><input type="password" id="newpw" placeholder="New PIN (6+ digits)" inputmode="numeric" style="max-width:180px"><button class="btn sm" data-act="pin">Save</button></div>'
  +'<div class="row" style="margin-top:18px"><button class="btn sm bad" data-act="logout">Log out</button><button class="btn sm" data-act="close">Close</button></div>',
  function(el){el.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
    if(a==='close')closeSheet();
    if(a==='pushon')enablePush().then(closeSheet);
    if(a==='pushtest')api('push_test').then(function(){toast(pushN?'Test sent':'Turn notifications on first')}).catch(function(e){toast(e.message,true)});
    if(a==='pin')api('password',{current:el.querySelector('#curpw').value,'new':el.querySelector('#newpw').value}).then(function(){toast('PIN changed');closeSheet()}).catch(function(e){toast(e.message,true)});
    if(a==='logout')api('logout').then(function(){location.reload()})})})});

load();setInterval(load,30000);
/* Refresh: clear anything the browser kept and load the newest version of SMR Admin. */
var hardRefresh=function(){toast('Refreshing…');var tab=location.hash||'#demos';
  var clear=window.caches&&caches.keys?caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}):Promise.resolve();
  try{Object.keys(sessionStorage).forEach(function(k){sessionStorage.removeItem(k)})}catch(e){}
  clear.catch(function(){}).then(function(){location.replace(location.pathname+'?r='+Date.now()+tab)})};
$('refresh').addEventListener('click',hardRefresh);
if(/[?&]r=\d/.test(location.search))history.replaceState(null,'',location.pathname+location.hash);
var hiddenAt=0;
document.addEventListener('visibilitychange',function(){if(document.hidden){hiddenAt=Date.now();return}
  if(hiddenAt&&Date.now()-hiddenAt>10*60*1000){location.reload();return}load()});
})();
</script>
<?php endif; ?>
<script>/* app feel: no pinch or double-tap zoom */(function(){document.addEventListener('gesturestart',function(e){e.preventDefault()},{passive:false});document.addEventListener('gesturechange',function(e){e.preventDefault()},{passive:false});document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});})();</script>
</body>
</html>
