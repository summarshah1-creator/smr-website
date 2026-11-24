<?php
/* Client proof page: /p/<token>. Check every item, cycle through versions and pages, see it in place (Mock-up Studio),
   sign off with a checklist + typed full name, or ask for changes. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/proofs.php';
security_headers(true);
header('Cache-Control: no-store');

$s = proof_by_token((string) ($_GET['k'] ?? ''));
$owner = admin_token() !== null;
if ($s && (int) $s['archived'] && !$owner) $s = null;
if (!$s) http_response_code(404);
if ($s && !$owner) {
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua !== '' && !preg_match('/bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|embedly|curl|wget|python|headless/i', $ua)) {
        $first = !(int) $s['views'];
        proofs_db()->prepare('UPDATE proof_sets SET views = views + 1, last_view = ? WHERE id = ?')->execute([now(), (int) $s['id']]);
        if ($first) { proof_ev((int) $s['id'], 'note', 'They opened the proof'); proof_push('👀 ' . $s['client'] . ' opened the proof', $s['title'], 'proof-open-' . $s['id']); }
    }
}
$area = $s && in_array($s['area'], ['digital', 'graphics', 'marketing', 'plates'], true) ? $s['area'] : 'graphics';
$logo = preg_replace('/<svg /', '<svg aria-hidden="true" ', (string) @file_get_contents(SITE_ROOT . '/assets/brand/smr-' . $area . '.svg'), 1);
$data = $s ? proof_public($s, false) + ['owner' => $owner, 'url' => proof_url($s), 'area' => $area] : null;
$og = '';
if ($s) foreach ($data['items'] as $it) if ($it['vers']) { $og = proof_host() . end($it['vers'])['pages'][0]['src']; break; }
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#0e0d1b">
<title><?= $s ? h('Proof · ' . $s['title'] . ' · SMR') : 'SMR' ?></title>
<meta property="og:title" content="<?= $s ? h('Your proof to check: ' . $s['title']) : 'SMR' ?>">
<meta property="og:description" content="Check every item, then sign it off or ask for changes.">
<?php if ($og): ?><meta property="og:image" content="<?= h($og) ?>"><?php endif; ?>
<link rel="icon" href="/demo-admin/icon-192.png">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#12111f;--card:#fbf9f4;--ink:#1d1b26;--muted:#6f6b7d;--line:#e7e2d8;--a1:#5b5bff;--a2:#d63bff;--grad:linear-gradient(110deg,var(--a1),var(--a2));--wa:#25d366;--ok:#11a36a;--bad:#d6334f;--warn:#b86e00}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:#f2f2fa;font:15px/1.5 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 10% 0%,rgba(91,91,255,.2),transparent 70%),radial-gradient(50% 40% at 100% 0%,rgba(214,59,255,.14),transparent 70%)}
a{color:inherit}button{font:inherit;cursor:pointer;color:inherit;background:none;border:0}
.hd{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;height:58px;padding:0 16px;background:rgba(14,13,27,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.08)}
.hd .lg{margin-right:auto;display:flex}.hd .lg svg{height:26px;width:auto}
.hwa{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:999px;background:var(--wa);color:#fff;font-weight:800;font-size:13px;text-decoration:none}.hwa svg{width:17px;height:17px}
main{position:relative;max-width:760px;margin:0 auto;padding:18px 14px calc(110px + env(safe-area-inset-bottom))}
.top .eb{font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#cfc4ff}
.top h1{font:800 25px/1.15 Sora,sans-serif;letter-spacing:-.02em;margin:4px 0 2px}.top p{color:#b9b4cc;font-size:14px}
.prog{margin:14px 0 4px;height:8px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden}.prog i{display:block;height:100%;background:linear-gradient(90deg,#3ddc97,#14a46c);border-radius:9px;transition:width .5s}
.progt{font-size:13px;color:#b9b4cc;font-weight:700}
.how{margin-top:16px;background:var(--card);color:var(--ink);border-radius:18px;padding:14px 16px}
.how b{display:block;font:800 15px Sora,sans-serif;margin-bottom:6px}.how ul{padding-left:18px;font-size:13.5px;color:#3c3a48}.how li{margin:3px 0}.how small{display:block;margin-top:8px;color:var(--muted);font-size:12.5px}
.note{margin-top:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-size:13.5px;color:#e4e0f2;white-space:pre-wrap}
.item{margin-top:18px;background:var(--card);color:var(--ink);border-radius:22px;overflow:hidden;box-shadow:0 30px 60px -34px rgba(0,0,0,.9)}
.ih{display:flex;align-items:center;gap:10px;padding:14px 16px 10px}.ih .num{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:13px;background:#efeaff;color:#5b3fd6;flex:none}
.ih .tx{flex:1;min-width:0}.ih b{display:block;font:800 17px Sora,sans-serif;line-height:1.2}.ih span{font-size:12.5px;color:var(--muted)}
.pill{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;padding:5px 10px;border-radius:999px;white-space:nowrap}
.pill.waiting{background:#fff4e0;color:#9a5c00}.pill.approved{background:#e3f7ee;color:#0b7a4f}.pill.changes{background:#ffe6ea;color:#b4213a}
.vt{display:flex;gap:6px;padding:0 16px 10px;overflow-x:auto}.vt button{flex:none;padding:7px 12px;border-radius:10px;border:1px solid var(--line);font-weight:800;font-size:12.5px;color:var(--muted);background:#fff}.vt button.on{background:var(--ink);color:#fff;border-color:var(--ink)}.vt button em{font-style:normal;font-weight:700;opacity:.7;margin-left:4px}
.stage{position:relative;background:repeating-conic-gradient(#ece8df 0 25%,#f6f3ec 0 50%) 0 0/22px 22px;display:flex;align-items:center;justify-content:center;min-height:200px;padding:14px}
.stage img{display:block;max-width:100%;max-height:68vh;width:auto;height:auto;box-shadow:0 12px 30px -10px rgba(0,0,0,.45);background:#fff;cursor:zoom-in}
.nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:rgba(20,18,32,.72);color:#fff;display:grid;place-items:center;font-size:20px}.nav.l{left:8px}.nav.r{right:8px}
.pg{display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 16px 0;font-size:12.5px;color:var(--muted);font-weight:700}
.pg .dots{display:flex;gap:5px}.pg .dots i{width:7px;height:7px;border-radius:50%;background:#d8d2c6}.pg .dots i.on{background:#5b3fd6}
.old{margin:10px 16px 0;padding:10px 12px;border-radius:12px;background:#fff4e0;color:#7a4a00;font-size:13px;font-weight:700;display:flex;gap:8px;align-items:center;justify-content:space-between}.old button{text-decoration:underline;font-weight:800}
.chg{margin:10px 16px 0;padding:10px 12px;border-radius:12px;background:#efeaff;color:#3f2c99;font-size:13px}.chg b{display:block;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
.hist{margin:10px 16px 0;font-size:12.5px;color:var(--muted)}.hist div{padding:6px 0;border-top:1px solid var(--line)}.hist b{color:var(--ink)}
.acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 16px 16px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:50px;border-radius:15px;border:0;font-weight:800;font-size:15px;text-decoration:none;width:100%}
.btn.pri{background:var(--grad);color:#fff;box-shadow:0 14px 30px -14px rgba(155,70,255,.9)}.btn.ok{background:#14a46c;color:#fff}.btn.ghost{background:#f0ede6;color:var(--ink)}.btn.wa{background:var(--wa);color:#fff}
.btn.sm{height:40px;font-size:13.5px;border-radius:12px}
.btn[disabled]{opacity:.45;cursor:not-allowed}
.mk{margin:0 16px 4px}.mk a{display:flex;align-items:center;justify-content:center;gap:8px;height:40px;border-radius:12px;border:1.5px dashed #c9bff0;color:#5b3fd6;font-weight:800;font-size:13.5px;text-decoration:none}
.cert{margin:12px 16px 16px;padding:14px;border-radius:16px;background:#eafaf2;border:1px solid #b6ecd2;color:#0b5c3b;display:flex;gap:12px;align-items:flex-start}.cert svg{width:28px;height:28px;flex:none}.cert b{display:block;font-size:15px}.cert span{font-size:12.5px;display:block}.cert code{font:700 12px ui-monospace,Menlo,monospace;background:#d4f3e3;padding:1px 6px;border-radius:5px}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:30;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(14,13,27,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid rgba(255,255,255,.08)}
.bar .btn{max-width:720px;margin:0 auto}
.done{margin-top:18px;padding:18px;border-radius:20px;background:linear-gradient(135deg,#14a46c,#11865a);color:#fff;text-align:center}.done b{display:block;font:800 19px Sora,sans-serif}
.foot{text-align:center;color:#8f8fa8;font-size:12.5px;margin-top:24px}.foot a{color:#cfc4ff;font-weight:700;text-decoration:none}
.own{margin-bottom:12px;padding:10px 14px;border-radius:14px;background:rgba(255,181,71,.14);border:1px solid rgba(255,181,71,.45);color:#ffe0a8;font-size:13px;font-weight:700}
/* sheets */
.scrim{position:fixed;inset:0;z-index:60;background:rgba(3,3,10,.6);opacity:0;pointer-events:none;transition:opacity .25s}.scrim.on{opacity:1;pointer-events:auto}
.sheet{position:fixed;z-index:61;left:0;right:0;bottom:0;max-height:92vh;overflow:auto;background:var(--card);color:var(--ink);border-radius:22px 22px 0 0;padding:16px 18px calc(18px + env(safe-area-inset-bottom));transform:translateY(105%);transition:transform .3s cubic-bezier(.2,.8,.2,1);max-width:620px;margin:0 auto}
.sheet.on{transform:none}
.sheet h2{font:800 20px Sora,sans-serif;margin-bottom:4px}.sheet p.sub{font-size:13.5px;color:var(--muted)}
.sheet .its{display:flex;gap:8px;overflow-x:auto;margin:12px 0}.sheet .its div{flex:none;width:86px;text-align:center;font-size:11.5px;font-weight:700;color:var(--muted)}.sheet .its img{width:86px;height:64px;object-fit:contain;background:#efebe3;border-radius:10px;display:block;margin-bottom:4px}
.ck{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line);font-size:14px;font-weight:600}.ck:first-of-type{border-top:0}.ck input{width:22px;height:22px;flex:none;accent-color:#14a46c;margin-top:1px}
.stmt{margin:12px 0;padding:12px 14px;border-radius:14px;background:#f2efe7;border:1px solid var(--line);font-size:13px;color:#3c3a48}
label.f{display:block;font-size:12.5px;font-weight:800;color:var(--muted);margin:12px 0 6px}
.sheet input[type=text],.sheet textarea{width:100%;border-radius:14px;border:1.5px solid #d9d2c3;padding:12px 14px;font:600 16px Manrope,sans-serif;color:var(--ink);background:#fff;outline:0}
.sheet textarea{min-height:120px;resize:vertical;font-weight:500}
.sheet input:focus,.sheet textarea:focus{border-color:#8f6bff}
.sheet .row{display:flex;gap:10px;margin-top:14px}
/* full-screen viewer */
.vw{position:fixed;inset:0;z-index:70;background:#0b0a14;display:none;flex-direction:column}.vw.on{display:flex}
.vw .vh{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 14px 10px;color:#fff}.vw .vh b{flex:1;font-size:14px}.vw .vh button{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.1);font-size:20px}
.vw .sc{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;align-items:center;justify-content:center}.vw .sc img{max-width:100%;max-height:100%;background:#fff}.vw .sc.z{display:block}.vw .sc.z img{max-width:none;max-height:none;width:240%}
.vw small{color:#a3a3bd;text-align:center;padding:8px 0 calc(10px + env(safe-area-inset-bottom));font-size:12.5px}
.toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);opacity:0;transition:.3s;background:#fbf9f4;color:#1d1b26;padding:12px 18px;border-radius:14px;font-weight:700;z-index:80;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:90vw}.toast.on{opacity:1;transform:translateX(-50%)}
.gone{text-align:center;padding:60px 20px}.gone h1{color:#fff;margin:14px 0 8px;font:800 24px Sora,sans-serif}.gone p{color:#a3a3bd;margin-bottom:22px}
</style>
</head>
<body>
<header class="hd"><a class="lg" href="https://smrgraphics.co.uk" target="_blank" rel="noopener" aria-label="SMR"><?= $logo ?></a>
  <a class="hwa" href="https://wa.me/447931814538?text=<?= rawurlencode($s ? 'Hi Summar, about my proof for ' . $s['title'] . ': ' : 'Hi Summar, ') ?>" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>Ask a question</a></header>
<main id="m">
<?php if (!$s): ?>
  <div class="gone"><h1>This proof isn't available</h1><p>It may have been replaced. Message Summar for an up-to-date link.</p>
  <a class="btn wa" href="https://wa.me/447931814538?text=<?= rawurlencode('Hi Summar, my proof link isn\'t working. Could you send it again please?') ?>" target="_blank" rel="noopener">Message on WhatsApp</a></div>
<?php endif; ?>
</main>
<div class="scrim" id="scrim"></div><div class="sheet" id="sheet"></div>
<div class="vw" id="vw"><div class="vh"><b id="vwt"></b><button id="vwz" aria-label="Zoom">⤢</button><button id="vwx" aria-label="Close">×</button></div><div class="sc" id="vws"><img id="vwi" alt=""></div><small>Pinch or tap ⤢ to zoom in and check the small print.</small></div>
<div class="toast" id="toast"></div>
<script>
(function(){
var D=<?= json_encode($data) ?>;if(!D)return;
var $=function(id){return document.getElementById(id)},esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var toast=function(t){var e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('on')},3400)};
var fmt=function(t){var d=new Date(t*1000);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})};
var MK={'Roller banner':'roller','Vinyl banner':'vinyl','Poster':'poster','Flyer / leaflet':'flyer','Menu':'menu','Business card':'card','Sticker':'sticker','Sign board':'sign','A-board':'aboard'};
var S={};D.items.forEach(function(it){S[it.id]={v:it.vers.length-1,p:0}});
var cur=function(it){return it.vers[S[it.id].v]};
var latest=function(it){return S[it.id].v===it.vers.length-1};
var waiting=function(){return D.items.filter(function(it){return it.status==='waiting'&&it.vers.length})};
var render=function(){
  var n=D.items.length,ok=D.items.filter(function(it){return it.status==='approved'}).length;
  var h=(D.owner?'<div class="own">Owner preview: this is what they see. Signing off only works for the client.</div>':'')
   +'<div class="top"><div class="eb">Proof to check</div><h1>'+esc(D.title)+'</h1><p>For '+esc(D.client)+'</p></div>'
   +'<div class="prog"><i style="width:'+(n?Math.round(ok/n*100):0)+'%"></i></div><div class="progt">'+ok+' of '+n+' signed off</div>';
  if(ok<n)h+='<div class="how"><b>Please check carefully before you sign off</b><ul>'+D.checks.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul><small>Tap any picture to see it full size and zoom in. Colours on screens vary a little, so printed colours can look slightly different. Nothing is printed or published until you sign it off.</small></div>';
  if(D.note)h+='<div class="note">'+esc(D.note)+'</div>';
  D.items.forEach(function(it,ix){
    var V=cur(it),st=S[it.id],pages=V?V.pages:[],pg=pages[st.p]||pages[0];
    var stl={waiting:'Waiting for you',approved:'✓ Signed off',changes:'Changes asked'}[it.status]||'Waiting for you';
    h+='<section class="item" id="it'+it.id+'"><div class="ih"><span class="num">'+(ix+1)+'</span><div class="tx"><b>'+esc(it.name)+'</b><span>'+esc(it.kind||'')+(it.vers.length>1?(it.kind?' · ':'')+it.vers.length+' versions':'')+'</span></div><span class="pill '+it.status+'">'+stl+'</span></div>';
    if(it.vers.length>1)h+='<div class="vt">'+it.vers.map(function(v,i){return '<button data-ver="'+it.id+':'+i+'" class="'+(i===st.v?'on':'')+'">Version '+v.v+(i===it.vers.length-1?'<em>latest</em>':'')+(it.ok===v.id?'<em>✓</em>':'')+'</button>'}).join('')+'</div>';
    if(pg)h+='<div class="stage"><img src="'+esc(pg.src)+'" alt="'+esc(it.name)+'" data-full="'+it.id+'" loading="lazy">'+(pages.length>1?'<button class="nav l" data-pg="'+it.id+':-1" aria-label="Previous page">‹</button><button class="nav r" data-pg="'+it.id+':1" aria-label="Next page">›</button>':'')+'</div>';
    if(pages.length>1)h+='<div class="pg">Page '+(st.p+1)+' of '+pages.length+'<span class="dots">'+pages.map(function(_,i){return '<i class="'+(i===st.p?'on':'')+'"></i>'}).join('')+'</span></div>';
    if(V&&V.note)h+='<div class="chg"><b>What changed in version '+V.v+'</b>'+esc(V.note)+'</div>';
    if(!latest(it))h+='<div class="old">You\'re looking at an older version.<button data-ver="'+it.id+':'+(it.vers.length-1)+'">See the latest</button></div>';
    var ch=it.acts.filter(function(a){return a.kind==='changes'});
    if(ch.length)h+='<div class="hist">'+ch.map(function(a){var vn=(it.vers.filter(function(v){return v.id===a.ver})[0]||{}).v;return '<div><b>'+esc(a.name)+'</b> asked for changes'+(vn?' on version '+vn:'')+' · '+fmt(a.at)+'<br>“'+esc(a.text)+'”</div>'}).join('')+'</div>';
    if(MK[it.kind]&&pg)h+='<div class="mk" style="margin-top:12px"><a href="/?mockup='+MK[it.kind]+'&img='+encodeURIComponent(pg.src)+'&back='+encodeURIComponent(location.href)+'#graphics">See it for real (true-size mock-up)</a></div>';
    var ap=it.acts.filter(function(a){return a.kind==='approve'}).pop();
    if(it.status==='approved'&&ap){var av=(it.vers.filter(function(v){return v.id===ap.ver})[0]||{}).v;
      h+='<div class="cert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.7 2.7L16.5 9"/></svg><div><b>Signed off by '+esc(ap.name)+'</b><span>'+fmt(ap.at)+(av?' · version '+av:'')+'</span><span>Reference <code>'+esc(ap.ref)+'</code></span></div></div>'}
    else if(it.status==='changes'&&latest(it))h+='<div class="chg" style="margin:12px 16px 16px;background:#fff4e0;color:#7a4a00"><b>Thanks, we\'re on it</b>We\'re making your changes. The new version will appear right here for you to check.</div>';
    else if(V&&latest(it))h+='<div class="acts"><button class="btn ghost" data-chg="'+it.id+'">Request changes</button><button class="btn ok" data-ok="'+it.id+'">Sign off</button></div>';
    else h+='<div style="height:14px"></div>';
    h+='</section>';
  });
  if(n&&ok===n)h+='<div class="done"><b>All signed off. Thank you!</b>We\'ll get it made exactly as approved.</div>';
  h+='<p class="foot">SMR · Luton · <a href="tel:07931814538">07931 814538</a> · <a href="mailto:summar@smrgraphics.co.uk">summar@smrgraphics.co.uk</a></p>';
  $('m').innerHTML=h;
  var w=waiting();var bar=$('bar');if(bar)bar.remove();
  if(w.length>1){bar=document.createElement('div');bar.className='bar';bar.id='bar';bar.innerHTML='<button class="btn pri" data-all>Sign off all '+w.length+' items</button>';document.body.appendChild(bar)}
};
/* sheets */
var open=function(html,bind){var sh=$('sheet');sh.innerHTML=html;sh.classList.add('on');$('scrim').classList.add('on');if(bind)bind(sh)};
var close=function(){$('sheet').classList.remove('on');$('scrim').classList.remove('on')};
$('scrim').addEventListener('click',close);
var post=function(a,body){if(D.owner){toast('Owner preview: only the client can do this.');return Promise.reject(new Error('owner'))}
  return fetch('/proofs/api.php?a='+a,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({k:D.token},body))}).then(function(r){return r.json()}).then(function(j){if(j.error)throw new Error(j.error);return j})};
var signOff=function(ids){
  var its=D.items.filter(function(it){return ids.indexOf(it.id)>=0});
  open('<h2>Sign off '+(its.length>1?its.length+' items':esc(its[0].name))+'</h2><p class="sub">Tick each one once you\'ve checked it.</p>'
   +'<div class="its">'+its.map(function(it){var p=(it.vers[it.vers.length-1].pages[0]||{}).src||'';return '<div><img src="'+esc(p)+'" alt="">'+esc(it.name)+' · v'+it.vers[it.vers.length-1].v+'</div>'}).join('')+'</div>'
   +D.checks.map(function(c,i){return '<label class="ck"><input type="checkbox" class="cb"><span>I\'ve checked: '+esc(c.charAt(0).toLowerCase()+c.slice(1))+'</span></label>'}).join('')
   +'<div class="stmt">'+esc(D.statement)+'</div>'
   +'<label class="f" for="pn">Your full name</label><input type="text" id="pn" autocomplete="name" placeholder="First and last name" maxlength="80">'
   +'<label class="ck" style="border-top:0"><input type="checkbox" id="pa"><span>I agree with the statement above and sign this off.</span></label>'
   +'<div class="row"><button class="btn ghost" data-x style="flex:1">Not yet</button><button class="btn ok" id="pgo" style="flex:1.4" disabled>Sign off</button></div>',function(sh){
    var go=sh.querySelector('#pgo'),chk=function(){var all=[].every.call(sh.querySelectorAll('.cb'),function(c){return c.checked});go.disabled=!(all&&sh.querySelector('#pa').checked&&/\S+\s+\S+/.test(sh.querySelector('#pn').value.trim()))};
    sh.addEventListener('input',chk);sh.addEventListener('change',chk);sh.querySelector('[data-x]').addEventListener('click',close);
    go.addEventListener('click',function(){go.disabled=true;go.textContent='Signing off…';
      post('approve',{items:ids,name:sh.querySelector('#pn').value.trim(),checks:sh.querySelectorAll('.cb:checked').length,agree:1}).then(function(){toast('Signed off. Thank you!');setTimeout(function(){location.reload()},900)})
      .catch(function(e){if(e.message!=='owner')toast(e.message);go.disabled=false;go.textContent='Sign off'})})})};
var changes=function(id){var it=D.items.filter(function(x){return x.id===id})[0];
  open('<h2>What needs changing?</h2><p class="sub">'+esc(it.name)+' · version '+it.vers[it.vers.length-1].v+'. Be as exact as you can, e.g. “Change the phone number to 07…” or “Make the logo bigger”.</p>'
   +'<label class="f" for="ct">Changes</label><textarea id="ct" placeholder="List everything you want changed"></textarea>'
   +'<label class="f" for="cn">Your full name</label><input type="text" id="cn" autocomplete="name" placeholder="First and last name" maxlength="80">'
   +'<div class="row"><button class="btn ghost" data-x style="flex:1">Cancel</button><button class="btn pri" id="cgo" style="flex:1.4">Send changes</button></div>',function(sh){
    sh.querySelector('[data-x]').addEventListener('click',close);
    sh.querySelector('#cgo').addEventListener('click',function(){var b=this;b.disabled=true;
      post('changes',{item:id,text:sh.querySelector('#ct').value,name:sh.querySelector('#cn').value.trim()}).then(function(){toast('Sent. We\'ll send you a new version.');setTimeout(function(){location.reload()},900)})
      .catch(function(e){if(e.message!=='owner')toast(e.message);b.disabled=false})})})};
/* viewer */
var viewer=function(id){var it=D.items.filter(function(x){return x.id===id})[0],V=cur(it),pg=V.pages[S[id].p];
  $('vwi').src=pg.src;$('vwt').textContent=it.name+' · version '+V.v+(V.pages.length>1?' · page '+(S[id].p+1):'');$('vws').classList.remove('z');$('vw').classList.add('on')};
$('vwx').addEventListener('click',function(){$('vw').classList.remove('on')});
$('vwz').addEventListener('click',function(){$('vws').classList.toggle('z')});
$('vwi').addEventListener('dblclick',function(){$('vws').classList.toggle('z')});
document.addEventListener('click',function(e){var b;
  if((b=e.target.closest('[data-ver]'))){var p=b.dataset.ver.split(':');S[p[0]].v=+p[1];S[p[0]].p=0;render();return}
  if((b=e.target.closest('[data-pg]'))){var q=b.dataset.pg.split(':'),it=D.items.filter(function(x){return x.id===+q[0]})[0],n=cur(it).pages.length;S[q[0]].p=(S[q[0]].p+ +q[1]+n)%n;render();return}
  if((b=e.target.closest('[data-full]')))return viewer(+b.dataset.full);
  if((b=e.target.closest('[data-ok]')))return signOff([+b.dataset.ok]);
  if((b=e.target.closest('[data-chg]')))return changes(+b.dataset.chg);
  if(e.target.closest('[data-all]'))return signOff(waiting().map(function(it){return it.id}));
});
/* swipe between pages */
var sx=0,sid=0;document.addEventListener('touchstart',function(e){var st=e.target.closest('.stage');if(!st||e.touches.length>1){sid=0;return}sx=e.touches[0].clientX;sid=+st.parentNode.id.slice(2)},{passive:true});
document.addEventListener('touchend',function(e){if(!sid)return;var dx=e.changedTouches[0].clientX-sx;var it=D.items.filter(function(x){return x.id===sid})[0];if(Math.abs(dx)>50&&cur(it).pages.length>1){var n=cur(it).pages.length;S[sid].p=(S[sid].p+(dx<0?1:-1)+n)%n;render()}sid=0});
render();
})();
</script>
</body>
</html>
