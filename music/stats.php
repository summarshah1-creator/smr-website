<?php
/* SMR Admin → Analytics: pick a project (SMR Player tracks, Flappy Kabootar) and see its numbers. Owner only. Owner devices are never counted. */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/music.php';
header('X-Content-Type-Options: nosniff'); header('X-Robots-Tag: noindex, nofollow'); header('X-Frame-Options: SAMEORIGIN'); header('Cache-Control: no-store');
if (!admin_token()) { header('Location: /demo-admin/'); exit; }
$tok = admin_token();
?><!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow"><title>Analytics</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{background:#08080f;color:#f2f2fa;font:15px/1.45 Manrope,system-ui,-apple-system,sans-serif;padding:12px 2px 40px}
select,input,button{font:inherit;color:inherit}
.pick{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}.pick label{font:700 12px Manrope,sans-serif;color:#a3a3bd;letter-spacing:.06em;text-transform:uppercase}
.pick select{width:100%;background:#12121e;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px 14px;font-weight:800;font-size:15px;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#a3a3bd 50%),linear-gradient(135deg,#a3a3bd 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 15px) 50%;background-size:5px 5px;background-repeat:no-repeat}
.rng{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.rng button{flex:1 1 auto;background:#12121e;color:#a3a3bd;border:1px solid rgba(255,255,255,.09);border-radius:99px;padding:7px 10px;font:700 12.5px Manrope,sans-serif}.rng button.on{background:#f2f2fa;color:#0b0912;border-color:#f2f2fa}
.cust{display:none;gap:8px;margin:-4px 0 12px}.cust.on{display:flex}.cust input{flex:1;background:#12121e;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px;color-scheme:dark}
.newg{margin:0 0 12px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#8b5cff,#ff4fa3);color:#fff;box-shadow:0 6px 18px rgba(255,79,163,.22)}.newg b{display:block;font:800 16px Sora,Manrope,sans-serif;margin-bottom:4px}.newg span{display:inline-block;margin:2px 10px 0 0;font-weight:700;font-size:14px}
.kp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}@media(min-width:640px){.kp{grid-template-columns:repeat(4,1fr)}}
.k{background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:11px 12px}.k b{display:block;font:800 24px Sora,Manrope,sans-serif;letter-spacing:-.02em}.k span{display:block;color:#c9c9e0;font-size:12.5px;font-weight:700}.k small{display:block;color:#7d7d99;font-size:11.5px;margin-top:2px}
.k.hi{background:linear-gradient(160deg,rgba(139,92,255,.25),rgba(255,79,163,.12));border-color:rgba(167,139,250,.35)}
h3{font:700 14px Sora,Manrope,sans-serif;margin:16px 0 8px}
.card{background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 14px}
.fun .r,.bars .r{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}.fun .r span,.bars .r span{flex:0 0 118px;color:#c9c9e0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fun .r i,.bars .r i{flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden}.fun .r i s,.bars .r i s{display:block;height:100%;background:linear-gradient(90deg,#8b5cff,#ff4fa3);border-radius:6px}.fun .r b,.bars .r b{flex:0 0 54px;text-align:right}
.chart{display:flex;align-items:flex-end;gap:3px;height:120px;padding-top:6px}.chart div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;position:relative}.chart s{display:block;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#ff4fa3,#8b5cff);min-height:1px}.chart u{display:block;height:3px;margin-top:2px;border-radius:2px;background:#3ddc97}
.cl{display:flex;justify-content:space-between;color:#7d7d99;font-size:11px;margin-top:4px}.lg{display:flex;gap:12px;font-size:12px;color:#a3a3bd;margin-top:6px}.lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}
.log .e{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13.5px}.log .e:last-child{border:0}.log .e em{font-style:normal;flex:0 0 74px;color:#7d7d99;font-size:12px}.log .e b{font-weight:700}.log .e small{display:block;color:#7d7d99;font-size:12px}
.dv .d{display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13.5px}.dv .d:last-child{border:0}.dv .d div{flex:1;min-width:0}.dv .d small{display:block;color:#7d7d99;font-size:12px}.dv .d button{background:#1b1b2b;border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:6px 10px;font-weight:700;font-size:12px}.dv .d.me{opacity:.55}.dv .d .tag{display:inline-block;background:#3ddc97;color:#04210f;border-radius:6px;padding:0 6px;font-size:11px;font-weight:800;margin-left:6px}
.tip{background:#12121e;border:1px dashed rgba(255,255,255,.18);border-radius:12px;padding:10px 12px;font-size:12.5px;color:#c9c9e0;margin-top:12px}.tip code{color:#d9b3ff}
.empty{color:#a3a3bd;text-align:center;padding:22px 10px}
iframe{width:100%;height:calc(100vh - 110px);min-height:480px;border:0;background:transparent}
</style><link rel="stylesheet" href="stats-light.css?v=<?= @filemtime(__DIR__ . '/stats-light.css') ?>"><script>(function(){var d=document.documentElement,t;try{t=localStorage.getItem('smr_theme')}catch(e){}if(t!=='dark')d.classList.add('lt');addEventListener('message',function(e){if(e.origin===location.origin&&e.data&&e.data.smrTheme)d.classList.toggle('lt',e.data.smrTheme!=='dark')})})();</script></head><body>
<div class="pick"><label for="proj">Project</label><select id="proj"><option value="music:">SMR Player · all tracks</option></select></div>
<div id="v"></div>
<script>
var $=function(i){return document.getElementById(i)},P=localStorage.getItem('an_proj')||'',R=localStorage.getItem('an_rng')||'7',D=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ymd(d){return d.toLocaleDateString('en-CA',{timeZone:'Europe/London'})}
function when(t){var d=new Date(t*1000),td=ymd(new Date());return (ymd(d)===td?'Today':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}))+'<br>'+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function dur(s){s=Math.round(s||0);if(s<60)return s+'s';var m=Math.floor(s/60);if(m<60)return m+'m '+(s%60)+'s';return Math.floor(m/60)+'h '+(m%60)+'m'}
function n(x){return (x||0).toLocaleString('en-GB')}
function pl(x,w){return n(x)+' '+w+(x===1?'':'s')}
function range(){var t=new Date(),to=ymd(t),f=to;if(R==='y'){var y=new Date(Date.now()-864e5);f=to=ymd(y)}else if(R==='all')f='2000-01-01';else if(R==='c'){f=$('cf')&&$('cf').value||to;to=$('ct')&&$('ct').value||to}else if(R!=='1'){f=ymd(new Date(Date.now()-(+R-1)*864e5))}return[f,to]}
var EVN={open:'Opened the link',play:'Pressed play',listen:'Listened 30s+',p25:'Reached 25%',p50:'Reached halfway',p75:'Reached 75%',done:'Finished the track',time:'Listening time',dl:'Downloaded the MP3',home:'Tapped Add to Home Screen',install:'Installed to Home Screen',fav:'Tapped Save to Favourites',copy:'Copied the link',share:'Shared',video:'Watched the video',fs:'Video full screen',lyrics:'Opened the lyrics',keep:'Opened Keep this track'};
function load(){
  var pr=$('proj').value;if($('proj').dataset.f){P=pr;localStorage.setItem('an_proj',pr)}
  if(pr==='flappy'){ $('v').innerHTML='<iframe src="/flappy/admin.php"></iframe>';return }
  var tr=pr.split(':')[1]||'',r=range(),key='an_seen_'+pr,since=+(localStorage.getItem(key)||0);
  if(!D)$('v').innerHTML='<div class="empty">Loading…</div>';
  fetch('/music/api.php?a=stats&track='+encodeURIComponent(tr)+'&from='+r[0]+'&to='+r[1]+'&since='+since,{credentials:'same-origin',cache:'no-store'}).then(function(x){return x.json()}).then(function(j){D=j;if(fillTracks(j.tracks,pr)){load();return}render(j,since);localStorage.setItem(key,String(j.now))}).catch(function(){$('v').innerHTML='<div class="empty">Couldn’t load the numbers. Pull down to refresh.</div>'});
}
function fillTracks(ts,fetched){var s=$('proj');if(s.dataset.f)return false;s.dataset.f=1;
  (ts||[]).forEach(function(t){var o=document.createElement('option');o.value='music:'+t.code;o.textContent='SMR Player · '+t.title+(+t.hidden?' (private link)':'');s.appendChild(o)});
  var o=document.createElement('option');o.value='flappy';o.textContent='Flappy Kabootar (game)';s.appendChild(o);
  var has=function(v){return [].some.call(s.options,function(x){return x.value===v})};
  var want=P&&has(P)?P:(ts&&ts.length?'music:'+ts[0].code:'music:');s.value=want;return want!==fetched}
function E(k){return (D.ev[k]||{n:0,u:0,v:0})}
function render(j,since){
  if($('proj').value==='flappy')return;
  var h='<div class="rng">'+[['1','Today'],['y','Yesterday'],['7','7 days'],['30','30 days'],['all','All time'],['c','Pick dates']].map(function(x){return '<button data-r="'+x[0]+'"'+(R===x[0]?' class="on"':'')+'>'+x[1]+'</button>'}).join('')+'</div>';
  h+='<div class="cust'+(R==='c'?' on':'')+'"><input type="date" id="cf" value="'+(R==='c'?j.from:'')+'"><input type="date" id="ct" value="'+(R==='c'?j.to:'')+'"></div>';
  if(j.since){var s=j.since;h+='<div class="newg"><b>Since you last checked</b>'+(s.plays||s.opens||s.new?'<span>+'+n(s.plays)+' plays</span><span>+'+n(s.new)+' new devices</span><span>+'+n(s.listens)+' listens 30s+</span><span>+'+n(s.opens)+' link opens</span>'+(s.dl?'<span>+'+n(s.dl)+' downloads</span>':''):'<span>Nothing new yet</span>')+'</div>'}
  var plays=E('play'),secs=E('time').v;
  h+='<div class="kp">'+
   k('Plays',plays.n,'pressed play','hi')+k('Listeners',j.listeners,'different devices that played it','hi')+
   k('New devices',j.new,'first time ever','hi')+k('Returning',j.returning,'came back again')+
   k('Link opens',E('open').n,pl(E('open').u,'device'))+k('Listened 30s+',E('listen').n,pl(E('listen').u,'device'))+
   k('Finished',E('done').n,pl(E('done').u,'device'))+k('Listening time',dur(secs),j.listeners?'avg '+dur(secs/Math.max(1,E('time').u))+' each':'')+
   k('Downloads',E('dl').n,'MP3, '+pl(E('dl').u,'device'))+k('Home Screen',E('home').n+E('install').n,'taps on Add to Home Screen')+
   k('Opened from Home Screen',j.hsopen,pl(j.hsdev,'device'))+k('Shares',E('share').n+E('copy').n,n(E('share').n)+' shared · '+n(E('copy').n)+' copied')+
   k('Video',E('video').n,pl(E('video').u,'device')+' · '+n(E('fs').n)+' full screen')+k('Lyrics opened',E('lyrics').n,pl(E('lyrics').u,'device'))+
   k('Keep this track',E('keep').n,'opened the save pop-up')+k('Favourites',E('fav').n,'tapped Save to Favourites')+'</div>';
  // how far people listen (devices)
  var st=[['Pressed play',E('play').u],['Reached 25%',E('p25').u],['Reached halfway',E('p50').u],['Reached 75%',E('p75').u],['Finished',E('done').u]],mx=Math.max(1,st[0][1]);
  h+='<h3>How far people listen</h3><div class="card fun">'+st.map(function(x){return '<div class="r"><span>'+x[0]+'</span><i><s style="width:'+Math.round(x[1]/mx*100)+'%"></s></i><b>'+n(x[1])+'</b></div>'}).join('')+'</div>';
  // daily chart
  var ds=Object.keys(j.days);if(ds.length>1){var m2=1;ds.forEach(function(d){m2=Math.max(m2,j.days[d].plays)});var show=ds.slice(-45);
    h+='<h3>Plays per day</h3><div class="card"><div class="chart">'+show.map(function(d){var x=j.days[d];return '<div title="'+d+': '+x.plays+' plays, '+x.listeners+' listeners, '+x.new+' new"><s style="height:'+Math.round(x.plays/m2*100)+'%"></s>'+(x.new?'<u></u>':'')+'</div>'}).join('')+'</div><div class="cl"><span>'+show[0]+'</span><span>'+show[show.length-1]+'</span></div><div class="lg"><span><i style="background:#ff4fa3"></i>plays</span><span><i style="background:#3ddc97"></i>new devices that day</span></div></div>'}
  h+=bars('Where people came from',j.src,{direct:'Direct / typed or pasted link',homescreen:'Home Screen app',site:'SMR website',instagram:'Instagram app',facebook:'Facebook app',tiktok:'TikTok app',snapchat:'Snapchat app',google:'Google',linkedin:'LinkedIn app'});
  h+=bars('Devices',j.dev,{});
  h+=bars('Browser or Home Screen app',j.app,{'0':'Browser','1':'Home Screen app'});
  // activity log
  var tn={};(j.tracks||[]).forEach(function(t){tn[t.code]=t.title});
  h+='<h3>Activity log</h3><div class="card log">'+(j.log.length?j.log.map(function(e){return '<div class="e"><em>'+when(e.at)+'</em><div><b>'+esc(EVN[e.ev]||e.ev)+(e.ev==='time'?' · '+dur(e.val):'')+'</b><small>'+esc(e.dev||'Device')+' #'+esc(e.vid.slice(0,6))+(e.src?' · '+esc(e.src):'')+(+e.app?' · Home Screen':'')+(!j.track&&tn[e.track]?' · '+esc(tn[e.track]):'')+'</small></div></div>'}).join(''):'<div class="empty">No activity in this time yet.</div>')+'</div>';
  // devices
  h+='<h3>Devices</h3><div class="card dv">'+(j.devices.length?j.devices.map(function(d){var me=+d.owner;return '<div class="d'+(me?' me':'')+'"><div><b>'+esc(d.label&&!me?d.label:(d.dev||'Device'))+' #'+esc(d.vid.slice(0,6))+'</b>'+(me?'<span class="tag">YOU · not counted</span>':'')+'<small>'+n(+d.plays)+' plays · '+dur(+d.secs)+' listened'+(+d.dls?' · '+d.dls+' downloads':'')+'<br>First seen '+when(d.first_at).replace('<br>',' ')+' · last '+when(d.last_at).replace('<br>',' ')+'</small></div><button data-me="'+esc(d.vid)+'" data-v="'+(me?0:1)+'">'+(me?'Not mine':'This is me')+'</button></div>'}).join(''):'<div class="empty">No devices yet.</div>')+'</div>';
  h+='<div class="tip">Your own phone and computer are never counted. Any device logged in to SMR Admin is left out automatically. To be sure, open <code>smrgraphics.co.uk/player?me=1</code> once on each of your devices and browsers, or tap <b>This is me</b> above. Devices are counted with an anonymous id kept on each phone, so clearing the browser or private browsing can show up as a new device.</div>';
  $('v').innerHTML=h;
}
function k(l,v,s,c){return '<div class="k'+(c?' '+c:'')+'"><b>'+(typeof v==='number'?n(v):esc(v))+'</b><span>'+esc(l)+'</span>'+(s?'<small>'+esc(s)+'</small>':'')+'</div>'}
function bars(t,a,lab){if(!a||!a.length)return '';var mx=Math.max.apply(null,a.map(function(x){return x.n}).concat(1));return '<h3>'+t+'</h3><div class="card bars">'+a.map(function(x){return '<div class="r"><span>'+esc(lab[x.k]||x.k||'Unknown')+'</span><i><s style="width:'+Math.round(x.n/mx*100)+'%"></s></i><b>'+n(x.n)+'</b></div>'}).join('')+'</div>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-r]');if(b){R=b.dataset.r;localStorage.setItem('an_rng',R);if(R==='c'){render(D);return}load();return}
  b=e.target.closest('[data-me]');if(b){fetch('/music/api.php?a=dev_mine',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF':CSRF},body:JSON.stringify({vid:b.dataset.me,mine:+b.dataset.v})}).then(load)}});
document.addEventListener('change',function(e){if(e.target.id==='proj'){D=null;load()}if(e.target.id==='cf'||e.target.id==='ct'){if($('cf').value&&$('ct').value)load()}});
var CSRF=<?= json_encode($tok['csrf']) ?>;
load();setInterval(function(){if(document.visibilityState==='visible'&&P!=='flappy')load()},60000);
</script></body></html>
