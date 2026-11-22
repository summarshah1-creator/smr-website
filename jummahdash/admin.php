<?php
/* Jummah Dash stats, inbox and settings for the owner. Shown inside SMR Admin → Games → Jummah Dash (iframe). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
header('X-Content-Type-Options: nosniff'); header('X-Robots-Tag: noindex, nofollow'); header('X-Frame-Options: SAMEORIGIN'); header('Cache-Control: no-store');
if (!admin_token()) { header('Location: /demo-admin/'); exit; }
?><!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow"><title>Jummah Dash</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{background:#08080f;color:#f2f2fa;font:15px/1.45 Manrope,system-ui,-apple-system,sans-serif;padding:14px 2px 40px}
h2{font:700 17px Sora,Manrope,sans-serif;margin:4px 0 10px;display:flex;align-items:center;gap:8px}.pill{font:700 11px Manrope,sans-serif;background:linear-gradient(110deg,#5b5bff,#d63bff);border-radius:99px;padding:2px 9px}
.seg{display:flex;gap:6px;margin:0 0 14px}.seg button{flex:1;background:#12121e;color:#a3a3bd;border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:9px;font:700 13px Manrope,sans-serif}.seg button.on{background:#f2f2fa;color:#08080f}
.card{background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:12px 14px;margin-bottom:10px}.card.done{opacity:.5}
.card b{font-size:16px}.card .ad{color:#c9c9e0;font-size:13px;margin-top:2px}.card .nt{margin-top:6px;font-size:14px;white-space:pre-wrap}.card .tm{color:#7d7d99;font-size:12px;margin-top:6px}
.row{display:flex;gap:6px;margin-top:10px}.row a,.row button{flex:1;text-align:center;text-decoration:none;background:#1b1b2b;color:#f2f2fa;border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:7px 4px;font:600 12px Manrope,sans-serif}
.lb{width:100%;border-collapse:collapse}.lb td{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.07)}.lb td:first-child{color:#a3a3bd;width:28px}.lb td.s{text-align:right;font-weight:800}.lb button{background:none;border:0;color:#ff6b8a;font-size:16px;padding:0 4px}
.empty{color:#a3a3bd;text-align:center;padding:30px 10px}.mut{color:#a3a3bd;font-size:13px;margin:-4px 0 12px}a.lk{color:#b9a8ff}
.seg{flex-wrap:wrap}.seg button{flex:1 1 22%;padding:9px 4px;font-size:12px}#nb{display:inline-block;margin-left:5px;background:#d63bff;color:#fff;border-radius:99px;padding:0 6px;font-size:10px}#nb:empty{display:none}
.rng{display:flex;gap:6px;margin:0 0 12px}.rng button{flex:1;background:#12121e;color:#a3a3bd;border:1px solid rgba(255,255,255,.09);border-radius:99px;padding:6px;font:700 12px Manrope,sans-serif}.rng button.on{background:linear-gradient(110deg,#5b5bff,#d63bff);color:#fff;border-color:transparent}
.kp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}.k{background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:11px 12px}.k b{display:block;font:800 22px Sora,Manrope,sans-serif}.k small{color:#a3a3bd;font-size:12px}.k em{display:block;font-style:normal;color:#7d7d99;font-size:11px;margin-top:2px}
.bars .r{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}.bars .r span{flex:0 0 118px;color:#c9c9e0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bars .r i{flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.06);position:relative;overflow:hidden}.bars .r i u{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#5b5bff,#d63bff);border-radius:6px}.bars .r b{flex:0 0 38px;text-align:right}
.chart{display:flex;align-items:flex-end;gap:3px;height:110px;padding-top:6px}.chart div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;height:100%}.chart s{display:block;background:#5b5bff;border-radius:3px 3px 0 0;min-height:1px}.chart s.g{background:#d63bff}.leg{display:flex;gap:12px;font-size:11px;color:#a3a3bd;margin-top:6px}.leg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}
h3{font:700 14px Sora,Manrope,sans-serif;margin:14px 0 8px}
.fld{margin:0 0 14px}.fld label{display:block;font-weight:700;font-size:13px;margin-bottom:5px}.fld input[type=text],.fld input[type=url]{width:100%;background:#12121e;color:#f2f2fa;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;font:500 14px Manrope,sans-serif}.fld small{display:block;color:#a3a3bd;font-size:12px;margin-top:4px}
.tg{display:flex;align-items:center;justify-content:space-between;background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px;margin-bottom:8px;font-size:14px}.tg input{width:22px;height:22px}
.opts{display:flex;gap:6px}.opts button{flex:1;background:#12121e;color:#c9c9e0;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px;font:700 13px Manrope,sans-serif}.opts button.on{background:#f2f2fa;color:#08080f}
.save{width:100%;margin-top:6px;background:linear-gradient(110deg,#5b5bff,#d63bff);color:#fff;border:0;border-radius:12px;padding:12px;font:800 14px Manrope,sans-serif}.ok{color:#3ddc97;font-size:13px;text-align:center;margin-top:8px;min-height:16px}
.newg{margin:0 0 12px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#ff8a3d,#e8458a);color:#fff;font-weight:700;box-shadow:0 6px 18px rgba(232,69,138,.25)}.newg b{display:block;font-size:30px;line-height:1.05}.newg small{display:block;font-weight:600;opacity:.92;font-size:12.5px;margin-top:4px}
.card.fest{border-left:4px solid #7a5cff;padding:10px 12px;margin:8px 0;border-radius:12px;background:#12121e}.card.fest.soon{border-left-color:#ffb347;background:linear-gradient(90deg,rgba(255,179,71,.12),#12121e)}.card.fest p{margin:4px 0 0;font-size:12.5px;color:#c9c9e0}
.tip{background:#12121e;border:1px dashed rgba(255,255,255,.18);border-radius:12px;padding:10px 12px;font-size:12.5px;color:#c9c9e0;margin-top:12px}.tip code{color:#d9b3ff}
.addbtn{display:block;width:100%;margin:4px 0 10px;padding:13px;border:0;border-radius:12px;background:#2fb35a;color:#fff;font:700 15px inherit;font-family:inherit;cursor:pointer}.addsc.hide,.hide.addsc{display:none!important}.addsc{display:flex;flex-wrap:wrap;gap:8px}.addsc input,.addsc select{flex:1 1 120px;background:#0d0d16;color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;font:inherit}.addsc button{flex:1 1 100%}.addsc .tm{flex:1 1 100%;color:#ff8a8a}

.since{margin:0 0 16px;padding:16px;border-radius:18px;background:linear-gradient(135deg,#ff8a3d,#e8458a 55%,#a23bff);color:#fff;box-shadow:0 10px 26px rgba(232,69,138,.28)}
.since .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font:800 12px Manrope,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.95}.since .hd span{font-weight:600;letter-spacing:0;text-transform:none;opacity:.85}
.since .big{font:800 40px/1 Sora,Manrope,sans-serif;margin:10px 0 2px}.since .big small{font:700 15px Manrope,sans-serif;margin-left:6px}
.since .g{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}.since .g div{background:rgba(255,255,255,.16);border-radius:12px;padding:9px 8px}.since .g b{display:block;font:800 19px Sora,Manrope,sans-serif}.since .g small{font-size:11px;font-weight:600;opacity:.92;line-height:1.25;display:block}
.since .g div.hl{background:#fff;color:#c2185b}.since .none{font-weight:600;margin-top:8px;opacity:.95}
.secT{display:flex;align-items:center;gap:8px;font:800 12px Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#a3a3bd;margin:18px 0 10px}.secT:after{content:'';flex:1;height:1px;background:rgba(255,255,255,.1)}
.kp3{grid-template-columns:repeat(3,1fr)}.kp3 .k b{font-size:20px}
.rng{position:sticky;top:0;z-index:2;background:#08080f;padding:6px 0;margin:0 0 10px}
.dv{display:flex;align-items:center;gap:10px;background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:10px 12px;margin-bottom:8px}.dv .i{flex:1;min-width:0}.dv b{font-size:14px}.dv small{display:block;color:#a3a3bd;font-size:12px}.dv button{flex:none;background:#1b1b2b;color:#f2f2fa;border:1px solid rgba(255,255,255,.15);border-radius:99px;padding:7px 12px;font:700 12px Manrope,sans-serif}.dv.me{border-color:#3ddc97}.dv.me button{background:#3ddc97;color:#06210f;border-color:transparent}
textarea#sBt{width:100%;box-sizing:border-box;background:#0d0d16;color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;font:inherit;resize:vertical}
</style></head><body>

</head><body>
<div class="seg"><button data-v="stats" class="on">Stats</button><button data-v="inbox">Inbox<span id="nb"></span></button><button data-v="set">Settings</button></div>
<div id="v"></div>
<script>
var V='stats',D=null,ST=null,TD=null,SINCE=null,SEEN=0,DEVS=null,RANGE=7,$=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function when(t){var d=new Date(t*1000);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function n(v){return (v||0).toLocaleString('en-GB')}
function api(a,b){return fetch('api.php?a='+a,b?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),credentials:'same-origin'}:{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(j){if(j.error)throw new Error(j.error);return j})}
// what happened since the owner last opened this page (time kept on this phone); own devices are never counted
(function(){var K='jd_adm_seen';try{SEEN=+localStorage.getItem(K)||0}catch(e){}
  api('since&t='+SEEN).then(function(j){SINCE=j;if(V==='stats')draw();try{localStorage.setItem(K,String(j.now))}catch(e){}}).catch(function(){})})();
var SRC={site:'SMR website',wa:'WhatsApp',ig:'Instagram',fb:'Facebook',tt:'TikTok',sc:'Snapchat',x:'X / Twitter',google:'Google search',direct:'Direct / typed / WhatsApp',other:'Other websites',qr:'QR code',homescreen:'Home screen app'};
var DEV={iphone:'iPhone',ipad:'iPad',android:'Android',desktop:'Computer',other:'Other'};
function ev(S,k){return (S.events[k]||{n:0,u:0})}
function bars(rows,lab,key){var m=Math.max.apply(null,rows.map(function(r){return +r[key]}).concat([1]));return '<div class="bars">'+(rows.length?rows.map(function(r){return '<div class="r"><span>'+esc(lab(r))+'</span><i><u style="width:'+(100*r[key]/m)+'%"></u></i><b>'+n(+r[key])+'</b></div>'}).join(''):'<p class="mut">Nothing yet.</p>')+'</div>'}
function kp(list,cls){return '<div class="kp '+(cls||'')+'">'+list.map(function(k){return '<div class="k"><b>'+k[0]+'</b><small>'+k[1]+'</small>'+(k[2]?'<em>'+k[2]+'</em>':'')+'</div>'}).join('')+'</div>'}
function sinceBox(){if(!SINCE)return '<div class="since"><div class="hd">Since you last checked</div><p class="none">Loading…</p></div>';var j=SINCE;
 if(!SEEN)return '<div class="since"><div class="hd">Since you last checked</div><p class="none">From now on this box shows everything new since you last opened Jummah Dash here: games, brand-new players and more.</p></div>';
 var at=new Date(SEEN*1000).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 var c=[[j.new_players,'brand-new players',1],[j.players,'players'],[j.returning,'came back'],[j.visits,'visits'],[n(j.best)+'m','best run'],[n(Math.round(j.avg))+'m','average run'],[j.shares,'shares'],[j.recs,'places recommended',j.recs>0],[j.home,'played from home screen']];
 return '<div class="since"><div class="hd">Since you last checked <span>'+esc(at)+'</span></div><div class="big">'+n(j.games)+'<small>new game'+(j.games===1?'':'s')+'</small></div>'+(j.games||j.visits?'<div class="g">'+c.map(function(x){return '<div'+(x[2]?' class="hl"':'')+'><b>'+(typeof x[0]==='number'?n(x[0]):x[0])+'</b><small>'+x[1]+'</small></div>'}).join('')+'</div>':'<p class="none">Nothing new yet. Your own phones are never counted.</p>')+'</div>'}
function todayBox(){if(!TD)return '<div class="secT">Today</div><p class="mut">Loading…</p>';var p=ev(TD,'play');
 return '<div class="secT">Today</div>'+kp([[n(p.n),'Games'],[n(p.u),'Players'],[n(TD.new),'New people'],[n(TD.opens),'Visits'],[n(TD.best)+'m','Best run'],[n(ev(TD,'share').n),'Shares']],'kp3')}
function drawStats(){var h=sinceBox()+todayBox()+'<div class="secT">More</div><div class="rng">'+[[7,'This week'],[30,'This month'],[0,'All time']].map(function(r){return '<button data-r="'+r[0]+'" class="'+(RANGE===r[0]?'on':'')+'">'+r[1]+'</button>'}).join('')+'</div>';
 if(!ST)return h+'<p class="empty">Loading…</p>';var S=ST,pl=ev(S,'play');
 h+='<h3 style="margin-top:0">Visitors</h3>'+kp([[n(S.opens),'Total opens','every time the game was opened'],[n(S.unique),'Unique people','different phones/computers'],[n(S.new),'New people','first time ever in this period'],[n(S.returning),'Returning people','opened it on 2+ different days'],[n(S.app_users),'Playing from home screen','installed the app'],[(S.unique?(S.opens/S.unique).toFixed(1):0),'Opens per person','on average']]);
 h+='<h3>Playing</h3>'+kp([[n(pl.n),'Games played',(pl.u?(pl.n/pl.u).toFixed(1):0)+' games per player'],[n(pl.u),'People who played',(S.unique?Math.round(100*pl.u/S.unique):0)+'% of visitors'],[n(S.best)+'m','Best run','average '+n(S.avg)+'m'],[ '£'+n(S.coins),'Coins collected','in finished runs'],[n(ev(S,'share').n),'Shares','from the Share tile'],[n(ev(S,'smr').n),'Opened SMR Digital','from Designed & built by']]);
 h+='<h3>Where people came from</h3>'+bars(S.sources,function(r){return SRC[r.src]||r.src||'Unknown'},'u');
 h+='<h3>Last 30 days</h3><div class="chart">'+S.daily.map(function(d){var m=Math.max.apply(null,S.daily.map(function(x){return Math.max(+x.v,+x.g)}).concat([1]));return '<div title="'+d.day+': '+d.v+' people, '+d.g+' games"><s style="height:'+(100*d.v/m)+'%"></s><s class="g" style="height:'+(100*d.g/m)+'%"></s></div>'}).join('')+'</div><div class="leg"><span><i style="background:#5b5bff"></i>People</span><span><i style="background:#d63bff"></i>Games</span></div>';
 h+='<h3>Phones</h3>'+bars(S.devices,function(r){return DEV[r.dev]||r.dev||'Unknown'},'u');
 h+='<h3>Best runs</h3><div class="card"><table class="lb">'+(S.top.length?S.top.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td>'+when(r.at)+'<div class="tm" style="margin:0">'+esc(DEV[r.dev]||r.dev||'')+(+r.app?' · home screen':'')+(r.extra?' · £'+esc(r.extra):'')+'</div></td><td class="s">'+n(+r.val)+'m</td></tr>'}).join(''):'<tr><td colspan="3" class="empty">No runs yet.</td></tr>')+'</table></div>';
 h+='<h3>Other</h3>'+kp([[n(ev(S,'hs_open').n),'Opened Get the app'],[n(ev(S,'install').n),'Installed it (Android)'],[n(ev(S,'rec').n),'Places recommended'],[n(ev(S,'shop').n),'Opened the shop']]);
 h+='<div class="tip"><b>Track your posts:</b> add a tag to the link so it shows up here by name.<br>WhatsApp: <code>smrgraphics.co.uk/jummahdash/demo/?s=wa</code><br>Instagram: <code>?s=ig</code> · TikTok: <code>?s=tt</code> · QR code: <code>?s=qr</code></div>';
 return h}
var DEVN={iphone:'iPhone',ipad:'iPad',android:'Android phone',desktop:'Computer',other:'Device'};
function drawDevs(){if(!DEVS){api('devices').then(function(j){DEVS=j.devices;var d=$('devs');if(d)d.innerHTML=drawDevs()});return '<p class="mut">Loading…</p>'}
 if(!DEVS.length)return '<p class="mut">No devices yet.</p>';
 return DEVS.map(function(d){return '<div class="dv'+(d.mine?' me':'')+'"><div class="i"><b>'+(DEVN[d.dev]||'Device')+(d.app?' · home screen app':'')+'</b><small>Last played '+when(d.last)+' · '+n(d.games)+' game'+(d.games===1?'':'s')+(d.best?' · best '+n(d.best)+'m':'')+' · ID '+esc(d.id)+'</small></div><button data-own="'+esc(d.vid)+'" data-on="'+(d.mine?0:1)+'">'+(d.mine?'✓ Mine':'This is me')+'</button></div>'}).join('')}
function drawSet(){var c=ST?ST.settings:{show_recommend:true};
 return '<h3 style="margin-top:4px">Game</h3><label class="tg">Show "Recommend a place" on the menu<input type="checkbox" id="sRec"'+(c.show_recommend?' checked':'')+'></label>'
 +'<button class="save" id="sSave">Save settings</button><p class="ok" id="sOk"></p>'
 +'<h3>Your devices</h3><p class="mut" style="margin:0 0 10px">Your own phones are left out of every number. Any phone you play on while logged in to SMR Admin is spotted by itself; tick any other phone or tablet of yours here (the one at the top is usually the one you just played on).</p><div id="devs">'+drawDevs()+'</div>'
 +'<div class="tip">Game link: <code>smrgraphics.co.uk/jummahdash/demo/</code> · <a class="lk" href="/jummahdash/demo/" target="_blank">Open the game</a></div>'}
function drawInbox(){if(!D)return '<p class="empty">Loading…</p>';var h='<h2>Places to feature'+(D.new?' <span class="pill">'+D.new+' new</span>':'')+'</h2><p class="mut">Sent from the "Recommend a place" button in the game.</p>';
 if(!D.recs.length)h+='<p class="empty">No recommendations yet.</p>';
 D.recs.forEach(function(r){var q=encodeURIComponent(r.name+' '+(r.address||'')+' Luton');h+='<div class="card'+(+r.done?' done':'')+'"><b>'+esc(r.name)+'</b>'+(r.address?'<div class="ad">'+esc(r.address)+'</div>':'')+(r.note?'<div class="nt">'+esc(r.note)+'</div>':'')+'<div class="tm">'+when(r.at)+'</div><div class="row"><a href="https://www.google.com/maps/search/?api=1&query='+q+'" target="_blank" rel="noopener">Map</a><button data-done="'+r.id+'" data-u="'+(+r.done?1:0)+'">'+(+r.done?'Mark new':'Done')+'</button><button data-del="'+r.id+'">Delete</button></div></div>'});
 return h}
function draw(){$('v').innerHTML=V==='stats'?drawStats():V==='set'?drawSet():drawInbox()}
function load(){api('admin').then(function(j){D=j;$('nb').textContent=j.new||'';try{parent.postMessage({jdNew:j.new},location.origin)}catch(e){}if(V==='inbox')draw()}).catch(function(e){if(V==='inbox')$('v').innerHTML='<p class="empty">'+esc(e.message)+'</p>'})}
function loadToday(){api('stats&days=1').then(function(j){TD=j;if(V==='stats')draw()}).catch(function(){})}
function loadStats(){api('stats&days='+RANGE).then(function(j){ST=j;if(V==='stats')draw()}).catch(function(e){if(V==='stats')$('v').innerHTML='<p class="empty">'+esc(e.message)+'</p>'})}
document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.v){V=b.dataset.v;document.querySelectorAll('.seg button').forEach(function(x){x.classList.toggle('on',x===b)});draw();return}
 if(b.dataset.r!=null){RANGE=+b.dataset.r;ST=null;draw();loadStats();return}
 if(b.dataset.own){b.disabled=true;api('owner',{vid:b.dataset.own,on:b.dataset.on==='1'}).then(function(j){DEVS=j.devices;$('devs').innerHTML=drawDevs();loadToday();loadStats();api('since&t='+SEEN).then(function(x){SINCE=x;draw()})});return}
 if(b.id==='sSave'){api('settings_save',{show_recommend:$('sRec').checked}).then(function(j){if(ST)ST.settings=j.settings;$('sOk').textContent='Saved. The game picks it up next time it opens.'}).catch(function(er){$('sOk').textContent=er.message});return}
 if(b.dataset.done){api('rec_done',{id:+b.dataset.done,undo:b.dataset.u==='1'}).then(load);return}
 if(b.dataset.del){if(confirm('Delete this recommendation?'))api('rec_del',{id:+b.dataset.del}).then(load)}});
draw();load();loadToday();loadStats();setInterval(function(){load();if(V==='stats'){loadToday();loadStats()}},60000);
</script></body></html>