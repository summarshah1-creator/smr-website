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
  css.textContent = '#recBox .box{max-height:92%;overflow:auto}#recBox label{display:block;font-family:PS,monospace;font-size:10px;color:#ffd75a;margin:10px 0 4px;text-align:left}'
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
    b.innerHTML = ICON + '<span class="lb">ADD A PLACE</span> <small>for the game</small>';   // owner 22 Nov: short enough to fit the tile
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

  // ---- Admin mode (owner, 23 Nov): Settings → ADMIN MODE → SMR Admin PIN → wear any outfit, own every upgrade, unlimited money ----
  var ADM = (function () { try { return localStorage.getItem('jd_admin') === '1'; } catch (e) { return false; } })();
  var acss = document.createElement('style');
  acss.textContent = '#setAdm{margin-left:8px}#setAdm.on{background:#b8326e;box-shadow:0 5px 0 #6e1a40}'
    + '#admPin .box{width:min(300px,90%);padding:12px 14px}#admPin .dots{display:flex;gap:10px;justify-content:center;margin:6px 0 8px}'
    + '#admPin .dots i{width:34px;height:40px;border-radius:9px;background:#120d2a;border:2px solid #5a4fa0;display:grid;place-items:center;font-style:normal;font-family:PS,monospace;font-size:16px;color:#ffd75a}'
    + '#admPin .dots i.f{border-color:#ffd75a}#admPin .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'
    + '#admPin .kp button{font-family:PS,monospace;font-size:15px;color:#fff;background:#3a3168;border:0;border-radius:10px;padding:9px 0;box-shadow:0 3px 0 #1a1438;cursor:pointer}'
    + '#admPin .kp button:active{transform:translateY(2px);box-shadow:0 1px 0 #1a1438}#admPin .am{min-height:15px;font-family:Silk;font-size:11px;color:#ffb3b3;margin:2px 0 6px}'
    + '#admPin.shake .dots{animation:admsh .35s}@keyframes admsh{20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}'
    + '#admBox .box{width:min(560px,94%);max-height:94%;overflow:auto;padding:12px 16px}#admBox .ab{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:6px 0 10px}'
    + '#admBox .ab .go{margin:0;padding:10px 12px;font-size:11px}#admBox .sl{font-family:PS,monospace;font-size:10px;color:#ffd75a;margin:8px 0 6px;text-align:left}'
    + '#admBox .of{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}#admBox .of button{font-family:Silk;font-size:10px;line-height:1.2;color:#fff;background:#120d2a;border:2px solid #5a4fa0;border-radius:10px;padding:7px 4px;cursor:pointer}'
    + '#admBox .of button.on{border-color:#2fbf4a;background:#143a22}#admBox .gd{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'
    + '#admBox .gd button{font-family:Silk;font-size:10px;line-height:1.2;color:#fff;background:#120d2a;border:2px solid #5a4fa0;border-radius:10px;padding:7px 4px;cursor:pointer}#admBox .gd button.on{border-color:#ffd75a;background:#3a2f10}'
    + '#admBox .st{font-family:Silk;font-size:12px;color:#8dffa9;margin:0 0 4px}#admBox .xb{position:absolute;right:10px;top:8px;width:30px;height:30px;border-radius:50%;border:0;background:#3a3168;color:#fff;font:16px/30px sans-serif;cursor:pointer}';
  document.head.appendChild(acss);
  function stop(e) { e.stopPropagation(); }
  function G() { return window.__jd && window.__jd.SHOP; }
  // game.js keeps bank/ITEMS private, so admin changes go through localStorage + the shared SHOP object (window.__jd.SHOP)
  var OUTFITS = [['classic', 'CLASSIC THOBE'], ['puffer', 'PUFFER JACKET'], ['eid', 'EID THOBE'], ['luton', 'LUTON TOWN KIT'], ['moroccan', 'MOROCCAN DJELLABA']];
  var GADGETS = [['tin', 'COIN MAGNET'], ['chappal', "AMMI'S CHAPPAL"], ['dates', 'LUCKY DATES'], ['envelope', 'EIDI POUCH'], ['cat', 'BILLI THE CAT'], ['jalebi', 'HOT JALEBI'], ['misbaha', 'GOLDEN MISBAHA']];
  function saveS() { try { localStorage.setItem('jd_shop', JSON.stringify(G())); } catch (x) {} }
  function bankLow() { try { return +(localStorage.getItem('jd_bank') || 0) < 500000; } catch (e) { return false; } }
  function unlockAll() {
    var S = G(); if (!S) return;
    OUTFITS.concat(GADGETS).forEach(function (it) { S.own[it[0]] = 1; }); ['ck_copper', 'ck_black', 'st_green', 'st_pink', 'bat_tape', 'bat_alu', 'bat_gold'].forEach(function (k) { S.own[k] = 1; });
    S.slots = 3; S.hs500 = Math.max(S.hs500 || 0, 99); S.hs1000 = Math.max(S.hs1000 || 0, 99); S.save = Math.max(S.save || 0, 99);
    saveS();
  }
  function refillAndReload(reopen) {   // the bank is read when the game loads, so fill it and reload (once)
    try { localStorage.setItem('jd_bank', '999999'); if (reopen) sessionStorage.setItem('jd_adm_open', '1'); sessionStorage.setItem('jd_adm_rl', '1'); } catch (e) {}
    location.reload();
  }
  function snapshot() { try { if (!localStorage.getItem('jd_admin_snap')) localStorage.setItem('jd_admin_snap', JSON.stringify({ shop: localStorage.getItem('jd_shop'), bank: localStorage.getItem('jd_bank') })); } catch (e) {} }
  // what admin runs start with, plus extras (kept on the phone). When a new ride / power-up is added to the game, add it to START here too (owner rule).
  var START = [['', 'NOTHING'], ['tuktuk', 'TUK-TUK'], ['carpet', 'MAGIC CARPET'], ['kabootar', 'FLAPPY KABOOTAR'], ['sandals', 'GRAVITY SANDALS'], ['mech', 'HOOVER MECH'], ['logman', 'LAKRI MAN'], ['box', 'WARP BOX'], ['logmangold', 'GOLDEN LAKRI MAN'], ['hs500', 'HEAD START 500M'], ['hs1000', 'HEAD START 1000M']];
  var TOG = [['god', "CAN'T DIE"], ['boxes', 'RIDE BOX EVERY 10S'], ['magnet', 'COIN MAGNET']];
  var OPT = (function () { try { return JSON.parse(localStorage.getItem('jd_adm_opt')) || {}; } catch (e) { return {}; } })();
  function saveOpt() { try { localStorage.setItem('jd_adm_opt', JSON.stringify(OPT)); } catch (e) {} }
  function applyGod() { window.__god = ADM && OPT.god ? 1 : 0; var S = G(); if (S && ADM) { var i = S.eq.indexOf('tin'); if (OPT.magnet && i < 0) { if (S.eq.length >= S.slots) S.eq.shift(); S.eq.push('tin'); saveS(); } } }
  var prevSt = '', boxT = 0, nextRideI = 0;
  setInterval(function () {
    var J = window.__jd; if (!J) return; var st = J.state;
    if (ADM && st === 'play' && prevSt !== 'play') {   // run just started: give the chosen power-up
      applyGod(); var k = OPT.start || '';
      if (k === 'hs500' || k === 'hs1000') setTimeout(function () { try { J.boost(k === 'hs1000' ? 1000 : 500); } catch (e) {} }, 250);
      else if (k) setTimeout(function () { try { if (k === 'logmangold') { window.__goldLog = 1; J.veh('logman'); } else J.veh(k); } catch (e) {} }, 350);
      boxT = 0;
    }
    if (ADM && OPT.boxes && st === 'play') { boxT += .25; if (boxT >= 10) { boxT = 0; var R = ['tuktuk', 'carpet', 'kabootar', 'sandals', 'mech', 'logman'], r = OPT.start === 'logmangold' ? 'logman' : OPT.start && R.indexOf(OPT.start) >= 0 ? OPT.start : R[nextRideI++ % R.length]; if (OPT.start === 'logmangold') window.__goldLog = 1; try { J.gift('box', r, J.W + 40, 210); } catch (e) {} } }
    prevSt = st;
  }, 250);
  function buildAdmin() {
    if ($('setAdm')) return;
    var done = $('setClose'); if (!done) return;
    var b = document.createElement('button'); b.className = 'go alt' + (ADM ? ' on' : ''); b.id = 'setAdm'; b.textContent = ADM ? 'ADMIN ON' : 'ADMIN MODE';
    done.parentNode.insertBefore(b, done.nextSibling);
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); if (ADM) openAdm(); else openPin(); });
    var holder = $('setBox').parentNode;
    var p = document.createElement('div'); p.className = 'sheet hide'; p.id = 'admPin';
    p.innerHTML = '<div class="box"><h2>ADMIN MODE</h2><p style="margin:0">Enter the admin code</p><div class="dots"><i></i><i></i><i></i><i></i></div><div class="am" id="admM"></div>'
      + '<div class="kp">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 'X', 0, '⌫'].map(function (k) { return '<button data-k="' + k + '">' + (k === 'X' ? '✕' : k) + '</button>'; }).join('') + '</div></div>';
    holder.appendChild(p);
    var pin = '', busy = false;
    function draw() { [].forEach.call(p.querySelectorAll('.dots i'), function (d, i) { d.textContent = i < pin.length ? '•' : ''; d.classList.toggle('f', i < pin.length); }); }
    p.addEventListener('pointerdown', function (e) { stop(e); if (e.target === p) closePin(); });
    p.querySelector('.kp').addEventListener('pointerdown', function (e) {
      var k = e.target.closest('button'); if (!k || busy) return; e.preventDefault(); k = k.dataset.k;
      if (k === 'X') return closePin(); if (k === '⌫') { pin = pin.slice(0, -1); draw(); return; }
      if (pin.length >= 4) return; pin += k; draw();
      if (pin.length === 4) {
        busy = true; $('admM').textContent = 'Checking…'; $('admM').style.color = '#d9d3ff';
        fetch(API + '?a=admin_pin', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin, vid: vid }) })
          .then(function (r) { return r.json(); }).then(function (j) {
            busy = false;
            if (j && j.ok) { ADM = true; try { localStorage.setItem('jd_admin', '1'); } catch (x) {} snapshot(); unlockAll(); refillAndReload(true); return; }
            pin = ''; draw(); $('admM').style.color = ''; $('admM').textContent = (j && j.error) || 'Wrong PIN'; p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
          }).catch(function () { busy = false; pin = ''; draw(); $('admM').style.color = ''; $('admM').textContent = 'No connection. Try again.'; });
      }
    });
    function openPin() { pin = ''; draw(); $('admM').textContent = ''; p.classList.remove('hide'); }
    function closePin() { p.classList.add('hide'); }
    var a = document.createElement('div'); a.className = 'sheet hide'; a.id = 'admBox';
    a.innerHTML = '<div class="box" style="position:relative"><button class="xb" id="admX">✕</button><h2>ADMIN MODE</h2><p class="st">Everything unlocked · money never runs out</p>'
      + '<div class="sl">START EVERY RUN WITH</div><div class="gd" id="admSt"></div>'
      + '<div class="sl">EXTRAS</div><div class="gd" id="admTg"></div>'
      + '<div class="sl">WEAR ANY OUTFIT</div><div class="of" id="admOf"></div>'
      + '<div class="sl">GADGETS ON <small style="color:#d9d3ff">(tap to switch, up to 3)</small></div><div class="gd" id="admGd"></div>'
      + '<div class="ab"><button class="go" id="admShop">OPEN SHOP</button><button class="go alt" id="admFill">TOP UP £999,999</button><button class="go alt" id="admOff">TURN ADMIN OFF</button></div></div>';
    holder.appendChild(a);
    a.addEventListener('pointerdown', function (e) { stop(e); if (e.target === a) a.classList.add('hide'); });
    $('admX').addEventListener('click', function () { a.classList.add('hide'); });
    $('admFill').addEventListener('click', function () { if (window.__jd && window.__jd.state === 'menu') refillAndReload(true); });
    $('admShop').addEventListener('click', function () { a.classList.add('hide'); $('setBox').classList.add('hide'); var sb = $('bShop'); if (sb) sb.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    $('admOff').addEventListener('click', function () {
      if (!confirmOff) { confirmOff = true; $('admOff').textContent = 'TAP AGAIN: PUT MY GAME BACK'; setTimeout(function () { confirmOff = false; $('admOff').textContent = 'TURN ADMIN OFF'; }, 3500); return; }
      ADM = false; try { localStorage.removeItem('jd_admin'); var sn = JSON.parse(localStorage.getItem('jd_admin_snap') || 'null'); localStorage.removeItem('jd_admin_snap');
        if (sn) { if (sn.shop) localStorage.setItem('jd_shop', sn.shop); else localStorage.removeItem('jd_shop'); localStorage.setItem('jd_bank', sn.bank || '0'); } } catch (e) {}
      location.reload();   // the game picks the saved progress back up
    });
    var confirmOff = false;
    function fill() {
      var S = G(); if (!S) return; var of = $('admOf'), gd = $('admGd');
      of.innerHTML = ''; gd.innerHTML = '';
      OUTFITS.forEach(function (it) { var x = document.createElement('button'); x.textContent = it[1]; x.className = S.outfit === it[0] ? 'on' : '';
        x.addEventListener('click', function () { S.own[it[0]] = 1; S.outfit = it[0]; saveS(); fill(); }); of.appendChild(x); });
      GADGETS.forEach(function (it) { var on = S.eq.indexOf(it[0]) >= 0, x = document.createElement('button'); x.textContent = it[1]; x.className = on ? 'on' : '';
        x.addEventListener('click', function () { S.own[it[0]] = 1; var i = S.eq.indexOf(it[0]); if (i >= 0) S.eq.splice(i, 1); else { if (S.eq.length >= S.slots) S.eq.shift(); S.eq.push(it[0]); } saveS(); fill(); }); gd.appendChild(x); });
    }
    function openAdm() { unlockAll(); fill(); fillPlay(); a.classList.remove('hide'); }
    function fillPlay() {
      var st = $('admSt'), tg = $('admTg'); st.innerHTML = ''; tg.innerHTML = '';
      START.forEach(function (o) { var x = document.createElement('button'); x.textContent = o[1]; x.className = OPT.start === o[0] ? 'on' : '';
        x.addEventListener('click', function () { OPT.start = o[0]; saveOpt(); fillPlay(); }); st.appendChild(x); });
      TOG.forEach(function (o) { var x = document.createElement('button'); x.textContent = o[1]; x.className = OPT[o[0]] ? 'on' : '';
        x.addEventListener('click', function () { OPT[o[0]] = !OPT[o[0]]; saveOpt(); applyGod(); fillPlay(); }); tg.appendChild(x); });
    }
    window.__jdAdmin = { openPin: openPin, openAdm: openAdm };
    var q = document.createElement('button'); q.className = 'btn'; q.id = 'bAdm'; q.setAttribute('aria-label', 'Admin');
    q.style.cssText = 'position:absolute;top:58px;right:calc(var(--sr,0px) * .4 + 10px);z-index:5;font:9px PS,monospace;color:#fff;background:#b8326e;padding:7px 10px;pointer-events:auto;' + (ADM ? '' : 'display:none');
    q.textContent = 'ADMIN'; (document.querySelector('.top-r') || document.body).parentNode.appendChild(q);
    q.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); if (window.__jd && window.__jd.state === 'menu') openAdm(); });
    setInterval(function () { if (ADM) q.style.visibility = window.__jd && window.__jd.state === 'menu' ? 'visible' : 'hidden'; }, 300);
    window.__jdAdmShow = function () { q.style.display = ''; };
    // EXIT during a run (admin mode, so "can't die" runs can end): back to the home screen
    var ex = document.createElement('button'); ex.className = 'btn'; ex.id = 'bAdmExit'; ex.textContent = 'EXIT';
    ex.style.cssText = 'position:absolute;top:10px;right:calc(var(--sr,0px) * .4 + 64px);z-index:7;font:10px PS,monospace;color:#fff;background:#b8326e;padding:9px 12px;pointer-events:auto;visibility:hidden';
    q.parentNode.appendChild(ex);
    ex.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); location.reload(); });
    setInterval(function () { var st = window.__jd && window.__jd.state; ex.style.visibility = ADM && st && st !== 'menu' ? 'visible' : 'hidden'; }, 300);
    if (ADM) {
      unlockAll(); applyGod();
      var rl = ''; try { rl = sessionStorage.getItem('jd_adm_rl'); sessionStorage.removeItem('jd_adm_rl'); } catch (e) {}
      if (bankLow() && !rl) return refillAndReload(false);   // money ran low: fill it back up (one reload)
      var ro = ''; try { ro = sessionStorage.getItem('jd_adm_open'); sessionStorage.removeItem('jd_adm_open'); } catch (e) {}
      if (ro) setTimeout(openAdm, 600);
    }
  }
  function ready() { addTile(); watchOver(); buildAdmin(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
