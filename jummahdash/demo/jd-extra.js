/* Jummah Dash extras (added in the repo by the SMR Admin "Games" work, 22 Nov; keep this file and its <script> line in game.html when deploying):
   1) play stats for SMR Admin → Games → Jummah Dash (posts small events to /jummahdash/api.php; the owner's own phones are left out there)
   2) a "Recommend a place" tile at the bottom of the home menu with a little form (inbox in SMR Admin, push to the owner's phone).
   Hooks into the game only from the outside (DOM + window.__jd), so game.js stays untouched. */
(function () {
  'use strict';
  var API = '/jummahdash/api.php', $ = function (i) { return document.getElementById(i); };
  // ---- device id kept on the phone (not personal: a random string) ----
  var vid = '';
  try { vid = localStorage.getItem('jd_vid') || ''; } catch (e) {}
  if (!vid) { var m = document.cookie.match(/(?:^|; )jd_vid=([a-z0-9]+)/i); vid = m ? m[1] : ''; }
  if (!vid) vid = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 18);
  try { localStorage.setItem('jd_vid', vid); } catch (e) {}
  document.cookie = 'jd_vid=' + vid + ';path=/;max-age=63072000;SameSite=Lax';
  var ua = navigator.userAgent || '', q = new URLSearchParams(location.search);
  var dev = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ipad' : /iPhone|iPod/.test(ua) ? 'iphone' : /Android/.test(ua) ? 'android' : /Windows|Macintosh|Linux|CrOS/.test(ua) ? 'desktop' : 'other';
  var app = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone ? 1 : 0;
  var src = (q.get('s') || q.get('src') || q.get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24);
  if (!src) { if (/Instagram/.test(ua)) src = 'ig'; else if (/FBAN|FBAV/.test(ua)) src = 'fb'; else if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) src = 'tt'; else if (/Snapchat/.test(ua)) src = 'sc'; else if (/WhatsApp/.test(ua)) src = 'wa';
    else if (app) src = 'homescreen'; else { var r = document.referrer || ''; src = !r ? 'direct' : /smrgraphics|smrdigital/.test(r) ? 'site' : /google\./.test(r) ? 'google' : 'other'; } }
  function ev(name, val, extra) {
    try { fetch(API + '?a=ev', { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ev: name, vid: vid, src: src, dev: dev, app: app, val: val || 0, extra: extra || '' }) }).catch(function () {}); } catch (e) {}
  }
  ev('visit');

  // ---- games played and how far they got ----
  var lastState = '';
  setInterval(function () { var s = window.__jd && window.__jd.state; if (!s) return; if (s !== lastState && s === 'intro') ev('play'); lastState = s; }, 300);
  function watchOver() {
    var o = $('over'); if (!o) return;
    var was = o.classList.contains('hide');
    new MutationObserver(function () { var now = o.classList.contains('hide'); if (was && !now) {
      var d = parseInt(($('oD') && $('oD').textContent || '0').replace(/[^0-9]/g, ''), 10) || 0, c = ($('oC') && $('oC').textContent || '').replace(/[^0-9]/g, '');
      ev('over', d, c); } was = now; }).observe(o, { attributes: true, attributeFilter: ['class'] });
  }
  // taps on menu items (the game's own handlers still run)
  addEventListener('pointerdown', function (e) { var t = e.target && e.target.closest ? e.target.closest('#bShare,#bInst,#smrOpen,#bShop,#bOutfit') : null; if (!t) return;
    ev({ bShare: 'share', bInst: 'hs_open', smrOpen: 'smr', bShop: 'shop', bOutfit: 'outfit' }[t.id]); }, true);
  addEventListener('appinstalled', function () { ev('install'); });

  // ---- Recommend a place ----
  var css = document.createElement('style');
  css.textContent = '#bRec .lb{font-size:.86em;white-space:nowrap}#recBox .box{max-height:92%;overflow:auto}#recBox label{display:block;font-family:PS,monospace;font-size:10px;color:#ffd75a;margin:10px 0 4px;text-align:left}'
    + '#recBox input,#recBox textarea{width:100%;box-sizing:border-box;font:15px/1.3 Mont,system-ui,sans-serif;color:#fff;background:#120d2a;border:2px solid #5a4fa0;border-radius:10px;padding:9px 10px;outline:none}'
    + '#recBox input:focus,#recBox textarea:focus{border-color:#ffd75a}#recBox textarea{resize:none;height:64px}'
    + '#recBox .rbt{display:flex;gap:8px;justify-content:center;margin-top:12px}#recBox .rbt .go{margin:0}#recBox .go.alt{background:#3a3168;box-shadow:0 5px 0 #1d1640}'
    + '#recBox .rmsg{min-height:16px;margin:8px 0 0;font-family:Silk;font-size:12px;color:#ffb3b3;text-align:center}#recBox .rmsg.ok{color:#8dffa9}'
    + '#recBox .thx{text-align:center}#recBox .thx b{display:block;font-size:34px;margin:4px 0}';
  document.head.appendChild(css);
  var ICON = '<svg viewBox="0 0 40 40" class="ti"><g stroke="#1a1030" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M6 33l9-4 10 4 9-4V7l-9 4-10-4-9 4z" fill="#bfe8a8"/><path d="M15 7v22M25 11v22" stroke-width="1.4"/><path d="M27 3a7 7 0 0 0-7 7c0 5 7 12 7 12s7-7 7-12a7 7 0 0 0-7-7z" fill="#ff4b4b"/><circle cx="27" cy="10" r="2.6" fill="#fff"/></g></svg>';
  function addTile() {
    var side = document.querySelector('#home .side'); if (!side || $('bRec')) return;
    var b = document.createElement('button'); b.className = 'tile'; b.id = 'bRec';
    b.innerHTML = ICON + '<span class="lb">RECOMMEND A PLACE</span> <small>for the game</small>';
    side.appendChild(b);
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); openRec(); });
    var holder = ($('smrInfo') && $('smrInfo').parentNode) || document.body;
    var s = document.createElement('div'); s.className = 'sheet hide'; s.id = 'recBox';
    s.innerHTML = '<div class="box mbox"><div id="recForm"><h2>RECOMMEND A PLACE</h2><p>Know a Luton spot that should be in the game? A masjid, shop, takeaway, park, anywhere. Tell us and we might add it!</p>'
      + '<label for="recN">PLACE NAME</label><input id="recN" maxlength="80" autocomplete="off" placeholder="e.g. Grand Bazar">'
      + '<label for="recA">WHERE IS IT? (optional)</label><input id="recA" maxlength="160" autocomplete="off" placeholder="Road or area">'
      + '<label for="recT">ANYTHING ELSE? (optional)</label><textarea id="recT" maxlength="500" placeholder="Why it should be in the game"></textarea>'
      + '<p class="rmsg" id="recM"></p><div class="rbt"><button class="go" id="recGo">SEND</button><button class="go alt" id="recX">CLOSE</button></div></div>'
      + '<div id="recThx" class="thx hide"><h2>THANK YOU!</h2><b>🕌</b><p>We\'ll take a look. Keep an eye out for it in the game.</p><div class="rbt"><button class="go" id="recOk">CARRY ON</button></div></div></div>';
    holder.appendChild(s);
    s.addEventListener('pointerdown', function (e) { e.stopPropagation(); if (e.target === s) closeRec(); });
    $('recX').addEventListener('click', closeRec); $('recOk').addEventListener('click', closeRec);
    $('recGo').addEventListener('click', sendRec);
    fetch(API + '?a=cfg', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) { if (c && c.show_recommend === false) b.style.display = 'none'; }).catch(function () {});
  }
  function openRec() { $('recForm').classList.remove('hide'); $('recThx').classList.add('hide'); $('recM').textContent = ''; $('recM').className = 'rmsg'; $('recBox').classList.remove('hide'); }
  function closeRec() { var a = document.activeElement; if (a && a.blur) a.blur(); $('recBox').classList.add('hide'); }
  var busy = false;
  function sendRec() {
    if (busy) return; var n = $('recN').value.trim(), m = $('recM');
    if (!n) { m.textContent = 'Please add the place name.'; $('recN').focus(); return; }
    busy = true; $('recGo').textContent = 'SENDING…';
    fetch(API + '?a=rec', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, address: $('recA').value.trim(), note: $('recT').value.trim() }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        busy = false; $('recGo').textContent = 'SEND';
        if (!j || j.error) { m.textContent = (j && j.error) || 'Could not send. Try again.'; return; }
        ev('rec'); $('recN').value = $('recA').value = $('recT').value = '';
        $('recForm').classList.add('hide'); $('recThx').classList.remove('hide');
      }).catch(function () { busy = false; $('recGo').textContent = 'SEND'; m.textContent = 'No connection. Try again.'; });
  }
  function ready() { addTile(); watchOver(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
