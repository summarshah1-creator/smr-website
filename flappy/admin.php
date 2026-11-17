<?php
/* Flappy Kabootar inbox + leaderboard for the owner. Shown inside SMR Admin → Flappy (iframe). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
header('X-Content-Type-Options: nosniff'); header('X-Robots-Tag: noindex, nofollow'); header('X-Frame-Options: SAMEORIGIN'); header('Cache-Control: no-store');
if (!admin_token()) { header('Location: /demo-admin/'); exit; }
?><!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="robots" content="noindex,nofollow"><title>Flappy Kabootar</title>
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
.fld{margin:0 0 14px}.fld label{display:block;font-weight:700;font-size:13px;margin-bottom:5px}.fld input[type=text]{width:100%;background:#12121e;color:#f2f2fa;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;font:500 14px Manrope,sans-serif}.fld small{display:block;color:#a3a3bd;font-size:12px;margin-top:4px}
.tg{display:flex;align-items:center;justify-content:space-between;background:#12121e;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:12px;margin-bottom:8px;font-size:14px}.tg input{width:22px;height:22px}
.opts{display:flex;gap:6px}.opts button{flex:1;background:#12121e;color:#c9c9e0;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px;font:700 13px Manrope,sans-serif}.opts button.on{background:#f2f2fa;color:#08080f}
.save{width:100%;margin-top:6px;background:linear-gradient(110deg,#5b5bff,#d63bff);color:#fff;border:0;border-radius:12px;padding:12px;font:800 14px Manrope,sans-serif}.ok{color:#3ddc97;font-size:13px;text-align:center;margin-top:8px;min-height:16px}
.tip{background:#12121e;border:1px dashed rgba(255,255,255,.18);border-radius:12px;padding:10px 12px;font-size:12.5px;color:#c9c9e0;margin-top:12px}.tip code{color:#d9b3ff}
</style></head><body>
<div class="seg"><button data-v="stats" class="on">Stats</button><button data-v="inbox">Inbox<span id="nb"></span></button><button data-v="board">Leaderboard</button><button data-v="set">Settings</button></div>
<div id="v"></div>
<script>
var V='stats',D=null,ST=null,RANGE=7,$=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function when(t){var d=new Date(t*1000);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function api(a,b){return fetch('api.php?a='+a,b?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),credentials:'same-origin'}:{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(j){if(j.error)throw new Error(j.error);return j})}

var SRC={site:'SMR website banner',wa:'WhatsApp',ig:'Instagram',fb:'Facebook',tt:'TikTok',sc:'Snapchat',x:'X / Twitter',google:'Google search',direct:'Direct / typed / WhatsApp',other:'Other websites',qr:'QR code'};
var DEV={iphone:'iPhone',ipad:'iPad',android:'Android',desktop:'Computer',other:'Other'};
function n(v){return (v||0).toLocaleString('en-GB')}
function ev(k){return (ST.events[k]||{n:0,u:0})}
function bars(rows,lab,key){var m=Math.max.apply(null,rows.map(function(r){return +r[key]}).concat([1]));return '<div class="bars">'+(rows.length?rows.map(function(r){return '<div class="r"><span>'+esc(lab(r))+'</span><i><u style="width:'+(100*r[key]/m)+'%"></u></i><b>'+n(+r[key])+'</b></div>'}).join(''):'<p class="mut">Nothing yet.</p>')+'</div>'}
function loadStats(){api('stats&days='+RANGE).then(function(j){ST=j;if(V==='stats'||V==='set')draw()}).catch(function(e){$('v').innerHTML='<p class="empty">'+esc(e.message)+'</p>'})}
function drawStats(){if(!ST){return '<p class="empty">Loading…</p>'}
 var pl=ev('play'),vi=ev('visit'),h='<div class="rng">'+[[1,'Today'],[7,'7 days'],[30,'30 days'],[0,'All time']].map(function(r){return '<button data-r="'+r[0]+'" class="'+(RANGE===r[0]?'on':'')+'">'+r[1]+'</button>'}).join('')+'</div>';
 h+='<div class="kp">'+[[n(ST.visitors),'People who opened it',n(vi.n)+' visits'],[n(pl.n),'Games played',(pl.u?(pl.n/pl.u).toFixed(1):0)+' games per player'],[n(pl.u),'People who played',(ST.visitors?Math.round(100*pl.u/ST.visitors):0)+'% of visitors'],[n(ST.returning),'Came back another day','returning players'],[ST.best,'Best score','average '+ST.avg],[n(ev('share').n),'Shares',n(ev('card').n)+' score cards made'],[n(ST.app_users),'Playing from home screen',n(ev('hs_open').n)+' opened the how-to'],[n(ev('smr').n),'Clicked through to SMR Digital','from the game footer']].map(function(k){return '<div class="k"><b>'+k[0]+'</b><small>'+k[1]+'</small><em>'+k[2]+'</em></div>'}).join('')+'</div>';
 h+='<h3>Where people came from</h3>'+bars(ST.sources,function(r){return SRC[r.src]||r.src||'Unknown'},'u');
 h+='<h3>Last 30 days</h3><div class="chart">'+ST.daily.map(function(d){var m=Math.max.apply(null,ST.daily.map(function(x){return Math.max(+x.v,+x.g)}).concat([1]));return '<div title="'+d.day+': '+d.v+' people, '+d.g+' games"><s style="height:'+(100*d.v/m)+'%"></s><s class="g" style="height:'+(100*d.g/m)+'%"></s></div>'}).join('')+'</div><div class="leg"><span><i style="background:#5b5bff"></i>People</span><span><i style="background:#d63bff"></i>Games</span></div>';
 h+='<h3>Phones</h3>'+bars(ST.devices,function(r){return DEV[r.dev]||r.dev||'Unknown'},'u');
 h+='<h3>Where games ended (last place passed)</h3>'+bars(ST.places,function(r){return r.place},'n');
 h+='<h3>Other</h3><div class="kp">'+[[n(ev('lb_open').n),'Leaderboard opened'],[n(ev('name').n),'Names put on the leaderboard'],[n(ev('rec').n),'Places recommended'],[n(ev('sound_on').u),'Turned the sound on'],[n(ev('install').n),'Installed it (Android)'],[n(ev('card_save').n),'Score cards saved/shared']].map(function(k){return '<div class="k"><b>'+k[0]+'</b><small>'+k[1]+'</small></div>'}).join('')+'</div>';
 h+='<div class="tip"><b>Track your posts:</b> add a tag to the link so it shows up here by name.<br>WhatsApp: <code>smrgraphics.co.uk/flappykabootar?s=wa</code><br>Instagram: <code>?s=ig</code> · TikTok: <code>?s=tt</code> · Facebook: <code>?s=fb</code> · QR code / flyers: <code>?s=qr</code><br>The banner on your website already uses <code>?s=site</code>.</div>';
 return h}
function drawSet(){if(!ST)return '<p class="empty">Loading…</p>';var c=ST.settings;
 return '<div class="fld"><label>Message on the game\'s home screen</label><input type="text" id="sNotice" maxlength="90" placeholder="e.g. Top score this week wins a free chai!" value="'+esc(c.notice)+'"><small>Leave empty to show nothing.</small></div>'
 +'<label class="tg">Show the leaderboard<input type="checkbox" id="sLb"'+(c.show_leaderboard?' checked':'')+'></label>'
 +'<label class="tg">Show "Recommend a place"<input type="checkbox" id="sRec"'+(c.show_recommend?' checked':'')+'></label>'
 +'<div class="fld" style="margin-top:12px"><label>Difficulty</label><div class="opts" id="sDiff">'+['easy','normal','hard'].map(function(d){return '<button data-d="'+d+'" class="'+(c.difficulty===d?'on':'')+'">'+d[0].toUpperCase()+d.slice(1)+'</button>'}).join('')+'</div><small>Easy = wider gaps between pipes. Changes for everyone within a few minutes.</small></div>'
 +'<button class="save" id="sSave">Save settings</button><p class="ok" id="sOk"></p>'
 +'<div class="tip">Game link: <code>smrgraphics.co.uk/flappykabootar</code> · <a class="lk" href="/flappy/" target="_blank">Open the game</a></div>'}

function load(){api('admin').then(function(j){D=j;draw();try{parent.postMessage({fkNew:j.new},location.origin)}catch(e){}$('nb').textContent=j.new||''}).catch(function(e){$('v').innerHTML='<p class="empty">'+esc(e.message)+'</p>'})}
function draw(){var h='';if(V==='stats'){$('v').innerHTML=drawStats();return}if(V==='set'){$('v').innerHTML=drawSet();return}if(!D)return;
 if(V==='inbox'){h='<h2>Places to feature'+(D.new?' <span class="pill">'+D.new+' new</span>':'')+'</h2><p class="mut">Sent from the "Recommend a Luton place" button in the game.</p>';
  if(!D.recs.length)h+='<p class="empty">No recommendations yet.</p>';
  D.recs.forEach(function(r){var q=encodeURIComponent(r.name+' '+(r.address||'')+' Luton');h+='<div class="card'+(r.done?' done':'')+'"><b>'+esc(r.name)+'</b>'+(r.address?'<div class="ad">'+esc(r.address)+'</div>':'')+(r.note?'<div class="nt">'+esc(r.note)+'</div>':'')+'<div class="tm">'+when(r.at)+'</div><div class="row"><a href="https://www.google.com/maps/search/?api=1&query='+q+'" target="_blank" rel="noopener">Map</a><button data-done="'+r.id+'" data-u="'+(r.done?1:0)+'">'+(r.done?'Mark new':'Done')+'</button><button data-del="'+r.id+'">Delete</button></div></div>'});}
 else{var tb=function(rows,t){var s='<h2>'+t+'</h2><div class="card"><table class="lb">';if(!rows.length)s+='<tr><td colspan="3" class="empty">No scores yet.</td></tr>';rows.forEach(function(r,i){s+='<tr><td>'+(i+1)+'</td><td>'+esc(r.name)+'<div class="tm" style="margin:0">'+when(r.at)+'</div></td><td class="s">'+r.score+'</td><td style="width:26px"><button title="Remove" data-sd="'+r.id+'">&times;</button></td></tr>'});return s+'</table></div>'};
  h=tb(D.today,'Today')+tb(D.all,'All time')+'<p class="mut">'+D.entries+' names entered so far. Tap &times; to remove a rude name or a fake score.</p><p class="mut"><a class="lk" href="/flappy/" target="_blank">Open the game</a></p>';}
 $('v').innerHTML=h}
document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.v){V=b.dataset.v;document.querySelectorAll('.seg button').forEach(function(x){x.classList.toggle('on',x===b)});draw();return}
 if(b.dataset.r!=null){RANGE=+b.dataset.r;ST=null;draw();loadStats();return}
 if(b.dataset.d){document.querySelectorAll('#sDiff button').forEach(function(x){x.classList.toggle('on',x===b)});return}
 if(b.id==='sSave'){var d=document.querySelector('#sDiff .on');api('settings_save',{notice:$('sNotice').value,show_leaderboard:$('sLb').checked,show_recommend:$('sRec').checked,difficulty:d?d.dataset.d:'normal'}).then(function(j){ST.settings=j.settings;$('sOk').textContent='Saved. The game picks it up within a few minutes.'}).catch(function(e){$('sOk').textContent=e.message});return}
 if(b.dataset.done)return api('rec_done',{id:+b.dataset.done,undo:b.dataset.u==='1'}).then(load);
 if(b.dataset.del){if(confirm('Delete this recommendation?'))api('rec_del',{id:+b.dataset.del}).then(load);return}
 if(b.dataset.sd){if(confirm('Remove this score?'))api('score_del',{id:+b.dataset.sd}).then(load)}});
load();loadStats();setInterval(function(){load();if(V==='stats')loadStats()},60000);
</script></body></html>
