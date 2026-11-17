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
</style></head><body>
<div class="seg"><button data-v="inbox" class="on">Recommendations</button><button data-v="board">Leaderboard</button></div>
<div id="v"></div>
<script>
var V='inbox',D=null,$=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function when(t){var d=new Date(t*1000);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
function api(a,b){return fetch('api.php?a='+a,b?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),credentials:'same-origin'}:{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(j){if(j.error)throw new Error(j.error);return j})}
function load(){api('admin').then(function(j){D=j;draw();try{parent.postMessage({fkNew:j.new},location.origin)}catch(e){}}).catch(function(e){$('v').innerHTML='<p class="empty">'+esc(e.message)+'</p>'})}
function draw(){if(!D)return;var h='';
 if(V==='inbox'){h='<h2>Places to feature'+(D.new?' <span class="pill">'+D.new+' new</span>':'')+'</h2><p class="mut">Sent from the "Recommend a Luton place" button in the game.</p>';
  if(!D.recs.length)h+='<p class="empty">No recommendations yet.</p>';
  D.recs.forEach(function(r){var q=encodeURIComponent(r.name+' '+(r.address||'')+' Luton');h+='<div class="card'+(r.done?' done':'')+'"><b>'+esc(r.name)+'</b>'+(r.address?'<div class="ad">'+esc(r.address)+'</div>':'')+(r.note?'<div class="nt">'+esc(r.note)+'</div>':'')+'<div class="tm">'+when(r.at)+'</div><div class="row"><a href="https://www.google.com/maps/search/?api=1&query='+q+'" target="_blank" rel="noopener">Map</a><button data-done="'+r.id+'" data-u="'+(r.done?1:0)+'">'+(r.done?'Mark new':'Done')+'</button><button data-del="'+r.id+'">Delete</button></div></div>'});}
 else{var tb=function(rows,t){var s='<h2>'+t+'</h2><div class="card"><table class="lb">';if(!rows.length)s+='<tr><td colspan="3" class="empty">No scores yet.</td></tr>';rows.forEach(function(r,i){s+='<tr><td>'+(i+1)+'</td><td>'+esc(r.name)+'<div class="tm" style="margin:0">'+when(r.at)+'</div></td><td class="s">'+r.score+'</td><td style="width:26px"><button title="Remove" data-sd="'+r.id+'">&times;</button></td></tr>'});return s+'</table></div>'};
  h=tb(D.today,'Today')+tb(D.all,'All time')+'<p class="mut">'+D.entries+' names entered so far. Tap &times; to remove a rude name or a fake score.</p><p class="mut"><a class="lk" href="/flappy/" target="_blank">Open the game</a></p>';}
 $('v').innerHTML=h}
document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.v){V=b.dataset.v;document.querySelectorAll('.seg button').forEach(function(x){x.classList.toggle('on',x===b)});draw();return}
 if(b.dataset.done)return api('rec_done',{id:+b.dataset.done,undo:b.dataset.u==='1'}).then(load);
 if(b.dataset.del){if(confirm('Delete this recommendation?'))api('rec_del',{id:+b.dataset.del}).then(load);return}
 if(b.dataset.sd){if(confirm('Remove this score?'))api('score_del',{id:+b.dataset.sd}).then(load)}});
load();setInterval(load,60000);
</script></body></html>
