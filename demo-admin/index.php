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
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#08080f">
<title>Demo Manager · SMR Digital</title>
<link rel="icon" href="/assets/icon.png">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@300&display=swap" rel="stylesheet">
<style>
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
.newpin{font-family:Sora,sans-serif;font-size:34px;letter-spacing:.2em;margin:4px 0 10px}
.prog{height:6px;border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:10px}
.prog i{display:block;height:100%;width:0;background:var(--grad);transition:width .2s}
.filt{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.filt button{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line);font-size:12.5px;font-weight:700;color:var(--muted)}
.filt button.on{color:#fff;border-color:rgba(214,59,255,.6);background:rgba(214,59,255,.12)}
@media(max-width:600px){.top{flex-wrap:wrap}.tabs{order:3;width:100%}.tabs button{flex:1}.logo b{display:none}}
</style>
</head>
<body>
<?php if ($mode !== 'app'): ?>
<div class="auth">
  <form class="panel" id="auth" autocomplete="off">
    <div class="logo"><?= $mark ?><span>Digital</span></div>
    <h1 style="text-align:center">Demo Manager</h1>
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
    <div class="logo"><?= $mark ?><span>Digital</span><b>Demo Manager</b></div>
    <div class="tabs" role="tablist"><button class="on" data-tab="links" role="tab">Access links</button><button data-tab="demos" role="tab">Demos</button></div>
    <a class="btn sm" href="/demo/?preview=1" target="_blank" rel="noopener" title="See the showroom with every demo">Preview</a>
    <button class="btn sm" id="more" title="Account">Account</button>
  </div>

  <div class="panel hidden" id="account">
    <h2>Account</h2>
    <div class="row">
      <input type="password" id="curpw" placeholder="Current PIN" inputmode="numeric" style="max-width:200px" autocomplete="off">
      <input type="password" id="newpw" placeholder="New PIN (6+ digits)" inputmode="numeric" style="max-width:200px" autocomplete="off">
      <button class="btn sm" id="savepw">Change PIN</button>
      <button class="btn sm bad" id="logout">Log out</button>
    </div>
  </div>

  <!-- LINKS -->
  <section id="tab-links">
    <div class="bar">
      <div><h1>Access links</h1><p class="sub">Each link has its own 6-digit PIN and timer. Send both to the person you are pitching.</p></div>
      <button class="btn pri" id="newlink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>New demo link</button>
    </div>

    <form class="panel hidden" id="linkform">
      <h2>New demo link</h2>
      <label class="f" for="lb">Who is it for? (only you see this)</label>
      <input type="text" id="lb" placeholder="e.g. Ahmed, Kebab House Dunstable" maxlength="80">
      <div class="row" style="justify-content:space-between;margin-top:14px"><label class="f" style="margin:0">Demos they can open</label><button type="button" class="btn sm" id="selall">Select all</button></div>
      <div class="pick" id="pick" style="margin-top:8px"></div>
      <label class="f">Access type</label>
      <div class="seg">
        <label><input type="radio" name="mode" value="single" checked>One person<small>PIN works once. The timer starts when they enter it.</small></label>
        <label><input type="radio" name="mode" value="shared">Shared, one timer<small>Anyone with the PIN, one clock from the first use.</small></label>
        <label><input type="radio" name="mode" value="limited">Limited uses<small>PIN works <input type="number" id="maxu" value="3" min="2" max="500" style="width:64px;height:30px;padding:0 6px;display:inline-block"> times, each with its own timer.</small></label>
      </div>
      <label class="f">Session length</label>
      <div class="chips" id="dur"><button type="button" data-m="15">15 min</button><button type="button" data-m="30" class="on">30 min</button><button type="button" data-m="45">45 min</button><button type="button" data-m="60">1 hour</button><button type="button" data-m="120">2 hours</button><input type="number" id="durc" min="5" max="10080" placeholder="mins" aria-label="Custom minutes"></div>
      <label class="toggle"><input type="checkbox" id="tips" checked>Show the quick tour tips when they open each app</label>
      <div class="err" id="lerr"></div>
      <div class="row"><button class="btn pri" type="submit">Create link and PIN</button><button class="btn" type="button" id="cancel">Cancel</button></div>
    </form>

    <div class="panel result hidden" id="created"></div>
    <div class="filt" id="filt"><button class="on" data-f="all">All</button><button data-f="live">Active / waiting</button><button data-f="expired">Expired</button><button data-f="revoked">Revoked</button></div>
    <div class="list" id="links"></div>
  </section>

  <!-- DEMOS -->
  <section id="tab-demos" class="hidden">
    <div class="bar">
      <div><h1>Demos</h1><p class="sub">Upload a built website or Flutter Web app as a ZIP (for Flutter, zip the <b>build/web</b> folder). Use sample data only.</p></div>
      <button class="btn pri" id="newdemo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add demo</button>
    </div>
    <form class="panel hidden" id="demoform">
      <h2>Add a demo</h2>
      <label class="f" for="dn">App name</label><input type="text" id="dn" maxlength="60" placeholder="e.g. Kebab House" required>
      <label class="f" for="dt">Short line (optional)</label><input type="text" id="dt" maxlength="90" placeholder="e.g. Takeaway ordering app · Dunstable">
      <label class="f" for="dz">ZIP of the built app</label><input type="file" id="dz" accept=".zip,application/zip" required>
      <div class="prog hidden" id="dprog"><i></i></div>
      <div class="err" id="derr"></div>
      <div class="row"><button class="btn pri" type="submit">Upload</button><button class="btn" type="button" id="dcancel">Cancel</button></div>
    </form>
    <div class="list" id="demos"></div>
  </section>
</div>
<div class="toast" id="toast"></div>
<script>
(function(){
var CSRF=<?= json_encode($tok['csrf']) ?>,D=[],L=[],skew=0,filter='all';
var $=function(id){return document.getElementById(id)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var toast=function(m,bad){var t=$('toast');t.textContent=m;t.classList.toggle('bad',!!bad);t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on')},3200)};
var api=function(a,body,form){
  var o={method:'POST',credentials:'same-origin',headers:{'X-CSRF':CSRF}};
  if(form)o.body=form;else{o.headers['Content-Type']='application/json';o.body=JSON.stringify(body||{})}
  return fetch('api.php?a='+a,o).then(function(r){return r.json().catch(function(){return{error:'Server error ('+r.status+')'}})}).then(function(j){if(j.login){location.reload()}if(j.error)throw new Error(j.error);return j})};
var fmtT=function(t){if(!t)return'—';var d=new Date(t*1000);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+', '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})};
var fmtLeft=function(s){if(s<=0)return'—';var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+'h ':'')+(h?String(m).padStart(2,'0'):m)+'m '+String(x).padStart(2,'0')+'s'};
var nowS=function(){return Math.floor(Date.now()/1000+skew)};
var STAT={active:'Active',not_activated:'Not opened yet',uses_left:'Waiting',expired:'Expired',revoked:'Revoked'};
var MODE={single:'One person',shared:'Shared timer',limited:'Limited uses'};
var demoBy=function(s){for(var i=0;i<D.length;i++)if(D[i].slug===s)return D[i]};
var shareText=function(l){var names=l.apps.map(function(s){var d=demoBy(s);return d?d.name:s}).join(', ');
  return 'Here is your private SMR Digital demo'+(names?' ('+names+')':'')+':\n'+l.url+'\nPIN: '+l.pin+'\nYour '+(l.duration>=60&&l.duration%60===0?(l.duration/60)+'-hour':l.duration+'-minute')+' session starts when you enter the PIN.'};
var copy=function(t){(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('Copied link and PIN')}).catch(function(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Copied link and PIN')}catch(e){prompt('Copy this:',t)}a.remove()})};

/* tabs */
document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('on',x===b)});$('tab-links').classList.toggle('hidden',b.dataset.tab!=='links');$('tab-demos').classList.toggle('hidden',b.dataset.tab!=='demos')})});
$('more').addEventListener('click',function(){$('account').classList.toggle('hidden')});
$('logout').addEventListener('click',function(){api('logout').then(function(){location.reload()})});
$('savepw').addEventListener('click',function(){api('password',{current:$('curpw').value,'new':$('newpw').value}).then(function(){toast('PIN changed');$('curpw').value=$('newpw').value=''}).catch(function(e){toast(e.message,true)})});

/* load */
var load=function(){return api('list').then(function(j){D=j.demos;L=j.links;skew=j.now-Date.now()/1000;renderPick();renderLinks();renderDemos()}).catch(function(e){toast(e.message,true)})};

/* ---------- links ---------- */
var renderPick=function(){var keep={};document.querySelectorAll('#pick input:checked').forEach(function(i){keep[i.value]=1});
  $('pick').innerHTML=D.filter(function(d){return d.enabled}).map(function(d){return '<label><input type="checkbox" value="'+esc(d.slug)+'"'+(keep[d.slug]?' checked':'')+'><span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><img src="'+esc(d.icon)+'" alt=""><b>'+esc(d.name)+'</b><small>'+esc(d.tagline)+'</small></label>'}).join('')||'<p class="sub">No demos yet. Add one in the Demos tab.</p>'};
$('selall').addEventListener('click',function(){var all=document.querySelectorAll('#pick input'),any=[].some.call(all,function(i){return!i.checked});all.forEach(function(i){i.checked=any});this.textContent=any?'Clear all':'Select all'});
var dur=30;
$('dur').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;dur=+b.dataset.m;$('durc').value='';this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)})});
$('durc').addEventListener('input',function(){var v=+this.value;if(v>=5){dur=v;$('dur').querySelectorAll('button').forEach(function(x){x.classList.remove('on')})}});
$('newlink').addEventListener('click',function(){$('linkform').classList.remove('hidden');$('created').classList.add('hidden');$('lb').focus()});
$('cancel').addEventListener('click',function(){$('linkform').classList.add('hidden')});
$('linkform').addEventListener('submit',function(e){e.preventDefault();$('lerr').textContent='';
  var apps=[].map.call(document.querySelectorAll('#pick input:checked'),function(i){return i.value});
  if(!apps.length){$('lerr').textContent='Choose at least one demo.';return}
  var mode=document.querySelector('[name=mode]:checked').value;
  api('link_create',{label:$('lb').value,apps:apps,mode:mode,max_uses:+$('maxu').value,duration:dur,tips:$('tips').checked}).then(function(j){
    $('linkform').classList.add('hidden');$('lb').value='';
    var l=j.link,c=$('created');c.classList.remove('hidden');
    c.innerHTML='<h2>Link ready'+(l.label?' for '+esc(l.label):'')+'</h2><p class="sub">Send the link and PIN together. The '+l.duration+'-minute timer starts when the PIN is entered.</p>'
      +'<div class="newpin">'+esc(l.pin)+'</div><div class="cred"><code>'+esc(l.url)+'</code></div>'
      +'<div class="acts"><button class="btn pri sm" data-c>Copy link &amp; PIN</button><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(shareText(l))+'">Send on WhatsApp</a><button class="btn sm" data-x>Close</button></div>';
    c.querySelector('[data-c]').onclick=function(){copy(shareText(l))};c.querySelector('[data-x]').onclick=function(){c.classList.add('hidden')};
    c.scrollIntoView({behavior:'smooth',block:'start'});
    load()}).catch(function(e){$('lerr').textContent=e.message})});

$('filt').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;filter=b.dataset.f;this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});renderLinks()});
var leftOf=function(l){return l.status==='active'?Math.max(0,l.expires_at-nowS()):0};
var renderLinks=function(){
  var list=L.filter(function(l){if(filter==='all')return true;if(filter==='live')return l.status==='active'||l.status==='not_activated'||l.status==='uses_left';return l.status===filter});
  $('links').innerHTML=list.length?list.map(function(l){
    var uses=l.mode==='shared'?l.uses+' opened':l.uses+' of '+l.max_uses+' used';
    return '<div class="lk" data-id="'+l.id+'"><div class="hd"><b>'+esc(l.label||'Untitled link')+'</b><span class="badge '+l.status+'">'+STAT[l.status]+'</span></div>'
    +'<div class="icons">'+l.apps.map(function(s){var d=demoBy(s);return d?'<img src="'+esc(d.icon)+'" alt="'+esc(d.name)+'" title="'+esc(d.name)+'">':''}).join('')+'</div>'
    +'<div class="meta"><span>Access<b>'+MODE[l.mode]+' · '+l.duration+' min</b></span><span>Uses<b>'+uses+'</b></span><span>Created<b>'+fmtT(l.created_at)+'</b></span><span>First opened<b>'+fmtT(l.activated_at)+'</b></span><span>Expires<b>'+fmtT(l.expires_at)+'</b></span><span>Time left<b data-left>'+fmtLeft(leftOf(l))+'</b></span></div>'
    +'<div class="cred"><span class="pin">'+esc(l.pin)+'</span><code>'+esc(l.url)+'</code></div>'
    +'<div class="acts"><button class="btn sm pri" data-a="copy">Copy link &amp; PIN</button>'
    +'<button class="btn sm" data-a="ext15">+15 min</button><button class="btn sm" data-a="ext30">+30 min</button>'
    +'<button class="btn sm" data-a="newpin">New PIN</button>'
    +(l.status!=='revoked'?'<button class="btn sm bad" data-a="revoke">Revoke</button>':'')
    +'<button class="btn sm bad" data-a="del" title="Delete link">Delete</button></div></div>'}).join(''):'<div class="empty">No links here yet. Tap <b>New demo link</b> to make one.</div>'};
$('links').addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var id=+b.closest('[data-id]').dataset.id,l=L.filter(function(x){return x.id===id})[0],a=b.dataset.a;
  if(a==='copy')return copy(shareText(l));
  var run=function(act,body,msg){b.disabled=true;api(act,body).then(function(){toast(msg);load()}).catch(function(e){toast(e.message,true);b.disabled=false})};
  if(a==='ext15')run('link_extend',{id:id,minutes:15},'Added 15 minutes');
  if(a==='ext30')run('link_extend',{id:id,minutes:30},'Added 30 minutes');
  if(a==='newpin'&&confirm('Make a new PIN for this link? The old PIN stops working and the timer resets.'))run('link_newpin',{id:id},'New PIN made');
  if(a==='revoke'&&confirm('Revoke this link? Anyone using it is shown the expired screen straight away.'))run('link_revoke',{id:id},'Link revoked');
  if(a==='del'&&confirm('Delete this link for good?'))run('link_delete',{id:id},'Link deleted')});
setInterval(function(){document.querySelectorAll('#links [data-id]').forEach(function(el){var l=L.filter(function(x){return x.id===+el.dataset.id})[0];if(l&&l.status==='active'){var s=leftOf(l);el.querySelector('[data-left]').textContent=fmtLeft(s);if(s<=0)load()}})},1000);

/* ---------- demos ---------- */
$('newdemo').addEventListener('click',function(){$('demoform').classList.remove('hidden');$('dn').focus()});
$('dcancel').addEventListener('click',function(){$('demoform').classList.add('hidden')});
var upload=function(fd,prog,done,fail){var x=new XMLHttpRequest();x.open('POST','api.php?a='+fd.get('_a'));x.setRequestHeader('X-CSRF',CSRF);
  x.upload.onprogress=function(e){if(e.lengthComputable&&prog){prog.classList.remove('hidden');prog.firstChild.style.width=(e.loaded/e.total*100)+'%'}};
  x.onload=function(){var j;try{j=JSON.parse(x.responseText)}catch(e){j={error:x.status===413?'That file is too big for the server.':'Server error ('+x.status+')'}}if(j.error)fail(j.error);else done(j)};
  x.onerror=function(){fail('Upload failed. Check your connection.')};fd.delete('_a');x.send(fd)};
$('demoform').addEventListener('submit',function(e){e.preventDefault();var f=$('dz').files[0];if(!f){$('derr').textContent='Choose the ZIP file.';return}
  var fd=new FormData();fd.append('_a','demo_upload');fd.append('name',$('dn').value);fd.append('tagline',$('dt').value);fd.append('zip',f);$('derr').textContent='';
  var btn=this.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Uploading…';
  upload(fd,$('dprog'),function(j){btn.disabled=false;btn.textContent='Upload';$('demoform').reset();$('demoform').classList.add('hidden');$('dprog').classList.add('hidden');toast('Demo added ('+j.files+' files)');load()},function(m){btn.disabled=false;btn.textContent='Upload';$('derr').textContent=m;$('dprog').classList.add('hidden')})});

var renderDemos=function(){$('demos').innerHTML=D.length?D.map(function(d){
  return '<div class="dm" data-slug="'+esc(d.slug)+'"><img src="'+esc(d.icon)+'" alt=""><div class="tx">'
   +'<div class="row" style="gap:8px"><b>'+esc(d.name)+'</b>'+(d.enabled?'':'<span class="badge expired">Hidden</span>')+(d.files_ok?'':'<span class="badge revoked">Files missing</span>')+'<span class="badge not_activated">'+(d.source==='seed'?'From website':'Uploaded')+'</span></div>'
   +'<p>'+esc(d.tagline)+'</p>'
   +'<div class="acts"><a class="btn sm" target="_blank" rel="noopener" href="/demo/?preview=1#app='+esc(d.slug)+'">Preview</a><button class="btn sm" data-d="edit">Edit details</button>'
   +'<label class="btn sm" style="cursor:pointer">Replace ZIP<input type="file" accept=".zip" data-d="zip" hidden></label>'
   +'<label class="btn sm" style="cursor:pointer">Change icon<input type="file" accept="image/png,image/jpeg,image/webp" data-d="icon" hidden></label>'
   +'<button class="btn sm" data-d="toggle">'+(d.enabled?'Hide':'Show')+'</button>'
   +(d.source==='seed'?'':'<button class="btn sm bad" data-d="del">Delete</button>')+'</div>'
   +'<div class="prog hidden"><i></i></div>'
   +'<form class="hidden" data-form><label class="f">Name</label><input type="text" name="name" value="'+esc(d.name)+'" maxlength="60">'
   +'<label class="f">Short line</label><input type="text" name="tagline" value="'+esc(d.tagline)+'" maxlength="90">'
   +'<label class="f">Description</label><textarea name="description" maxlength="400">'+esc(d.description)+'</textarea>'
   +'<label class="f">Quick tour tips (one per line)</label><textarea name="tips" maxlength="1500">'+esc(d.tips_text)+'</textarea>'
   +'<div class="row" style="margin-top:10px"><label class="f" style="margin:0">Card colour</label><input type="color" name="accent" value="'+esc(d.accent)+'" style="width:48px;height:36px;border:0;background:none"><label class="f" style="margin:0 0 0 10px">Order</label><input type="number" name="sort" value="'+d.sort+'" style="width:90px;height:38px"></div>'
   +'<div class="row" style="margin-top:12px"><button class="btn pri sm" type="submit">Save</button><button class="btn sm" type="button" data-d="close">Cancel</button></div></form>'
   +'</div></div>'}).join(''):'<div class="empty">No demos yet.</div>'};
$('demos').addEventListener('click',function(e){var b=e.target.closest('[data-d]');if(!b||b.tagName==='INPUT')return;var box=b.closest('[data-slug]'),slug=box.dataset.slug,d=demoBy(slug);
  if(b.dataset.d==='edit')box.querySelector('[data-form]').classList.remove('hidden');
  if(b.dataset.d==='close')box.querySelector('[data-form]').classList.add('hidden');
  if(b.dataset.d==='toggle')api('demo_save',{slug:slug,enabled:d.enabled?0:1}).then(function(){toast(d.enabled?'Hidden from new links and the showroom':'Visible again');load()}).catch(function(e){toast(e.message,true)});
  if(b.dataset.d==='del'&&confirm('Delete '+d.name+' and its files?'))api('demo_delete',{slug:slug}).then(function(){toast('Demo deleted');load()}).catch(function(e){toast(e.message,true)})});
$('demos').addEventListener('submit',function(e){e.preventDefault();var f=e.target,slug=f.closest('[data-slug]').dataset.slug,o={slug:slug};
  ['name','tagline','description','tips','accent','sort'].forEach(function(k){o[k]=f.elements[k].value});
  api('demo_save',o).then(function(){toast('Saved');load()}).catch(function(e){toast(e.message,true)})});
$('demos').addEventListener('change',function(e){var i=e.target;if(!i.dataset||!i.files||!i.files[0])return;var box=i.closest('[data-slug]'),slug=box.dataset.slug,fd=new FormData();
  if(i.dataset.d==='zip'){if(!confirm('Replace the files for this demo with '+i.files[0].name+'?')){i.value='';return}fd.append('_a','demo_upload');fd.append('slug',slug);fd.append('zip',i.files[0])}
  else{fd.append('_a','demo_icon');fd.append('slug',slug);fd.append('icon',i.files[0])}
  var kind=i.dataset.d;upload(fd,box.querySelector('.prog'),function(j){toast(kind==='zip'?'Demo replaced ('+j.files+' files)':'Icon updated');load()},function(m){toast(m,true);box.querySelector('.prog').classList.add('hidden')});i.value=''});

load();setInterval(load,60000);
})();
</script>
<?php endif; ?>
</body>
</html>
