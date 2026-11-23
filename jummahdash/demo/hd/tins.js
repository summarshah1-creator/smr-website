/* Biscuit Tin Spin (owner 23 Nov): Jummah Dash's take on Jetpack Joyride's Final Spin.
   Grab biscuit tins during a run; at the end of the run each tin = one round:
   three blue biscuit tins on the kitchen table, one is shown to hold the jackpot, they shuffle (cup game),
   you pick one, the camera moves in, the lid is prised off and you see what's inside: usually Ammi's sewing kit,
   sometimes money, a second chance, a head start or a free gadget. Then the other two tins open too.
   No brand names on the tins (owner rule). Uses game.js globals: coins, SHOP, saveShop, ITEMS, iconFor, drawCorolla,
   coinFrames, tone, SFX, $. Exposes window.TIN = { open(n, done), close(), mini(ctx, x, y, r) }. */
(() => {
  const css = document.createElement('style');
  css.textContent = `#tinBox{position:absolute;inset:0;pointer-events:auto;z-index:8;background:#140c08}
#tinBox canvas{position:absolute;inset:0;width:100%;height:100%}
#tinBox .tt{position:absolute;left:0;right:0;top:4%;text-align:center;pointer-events:none;transition:opacity .25s}
#tinBox .tt h2{font-family:PS,monospace;font-size:clamp(16px,3vw,26px);color:#ffd75a;margin:0;text-shadow:0 3px 0 #000,0 0 18px rgba(255,200,80,.45)}
#tinBox .tt div{font-family:Silk,monospace;font-size:clamp(11px,1.7vw,15px);color:#fff;margin-top:6px;text-shadow:0 2px 0 #000}
#tinBox .tp{position:absolute;inset:18% 0 14% 0;display:flex}#tinBox .tp button{flex:1;background:none;border:0;cursor:pointer}
#tinBox .tp.off{display:none}
#tinBox #tinGo{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);margin:0;display:flex;align-items:center;gap:10px;font-family:Oswald,Mont,sans-serif;font-weight:700;letter-spacing:2px;font-size:clamp(15px,2.3vw,21px);color:#3a1f00;padding:12px 30px 12px 22px;border-radius:999px;border:2px solid #fff2b8;background:linear-gradient(180deg,#fff1a6 0%,#ffd24a 45%,#f5a623 100%);box-shadow:0 5px 0 #a8620f,0 8px 22px rgba(255,180,40,.45),inset 0 2px 0 rgba(255,255,255,.8);text-shadow:0 1px 0 rgba(255,255,255,.6);overflow:hidden;transition:opacity .25s,transform .12s,box-shadow .12s;animation:tinPulse 1.4s ease-in-out infinite}
#tinBox #tinGo::before{content:'';width:26px;height:22px;flex:none;background:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 22'%3E%3Cpath d='M2 6h5c4 0 6 10 11 10h4M2 16h5c2 0 3-2 4-4M15 8c1-1 2-2 3-2h4' fill='none' stroke='%233a1f00' stroke-width='2.6' stroke-linecap='round'/%3E%3Cpath d='M20 2l4 4-4 4M20 12l4 4-4 4' fill='none' stroke='%233a1f00' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
#tinBox #tinGo[data-k=next]::before{width:20px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 22'%3E%3Cpath d='M4 3l12 8-12 8z' fill='%233a1f00'/%3E%3C/svg%3E")}
#tinBox #tinGo::after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.75),transparent);animation:tinShine 2.2s ease-in-out infinite}
#tinBox #tinGo:active{transform:translateX(-50%) translateY(4px);box-shadow:0 1px 0 #a8620f,0 4px 12px rgba(255,180,40,.4),inset 0 2px 0 rgba(255,255,255,.8)}
#tinBox #tinGo.off{opacity:0;pointer-events:none}
@keyframes tinPulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.06)}}
@keyframes tinShine{0%{left:-60%}55%,100%{left:130%}}
#tinBox .cnt{position:absolute;left:3%;top:5%;font-family:PS,monospace;font-size:12px;color:#9fc0ff}`;
  document.head.appendChild(css);
  const box = document.createElement('div'); box.id = 'tinBox'; box.className = 'hide';
  box.innerHTML = '<canvas></canvas><div class="tt"><h2 id="tinH">AMMI&#39;S TIN</h2><div id="tinT"></div></div><div class="cnt" id="tinN"></div><div class="tp off"><button data-i="0"></button><button data-i="1"></button><button data-i="2"></button></div><button class="go off" id="tinGo">SHUFFLE!</button>';
  const mount = () => { const e = document.getElementById('eidiBox'); if (e) e.after(box); else setTimeout(mount, 200); }; mount();
  const cv = box.querySelector('canvas'), g = cv.getContext('2d'), pick = box.querySelector('.tp'), go = box.querySelector('#tinGo');
  const H2 = box.querySelector('#tinH'), TX = box.querySelector('#tinT'), NN = box.querySelector('#tinN');
  const API = () => window.__tinApi || {};
  const snd = (...a) => { try { API().tone(...a); } catch (e) {} };
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x), lerp = (a, b, k) => a + (b - a) * k;
  const back = x => { x = Math.min(1, Math.max(0, x)); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  /* ---------- art: the lid (no brand: BUTTER BISCUITS, a timber house, biscuits) ---------- */
  function biscuit(c, type, x, y, r, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const gold = (rr) => { const gr = c.createRadialGradient(-rr * .3, -rr * .35, rr * .1, 0, 0, rr * 1.1); gr.addColorStop(0, '#ffe2a0'); gr.addColorStop(.55, '#e9b25a'); gr.addColorStop(1, '#b97a2c'); return gr; };
    c.lineWidth = r * .07; c.strokeStyle = '#7a4a16';
    if (type === 'pretzel') {
      c.lineCap = 'round'; const loop = (s) => { c.beginPath(); c.moveTo(0, r * .55); c.bezierCurveTo(s * r * 1.15, r * .1, s * r * 1.05, -r * .95, s * r * .2, -r * .7); c.bezierCurveTo(-s * r * .25, -r * .5, -s * r * .1, r * .1, s * r * .55, r * .45); };
      for (const s of [1, -1]) { loop(s); c.strokeStyle = '#7a4a16'; c.lineWidth = r * .5; c.stroke(); loop(s); c.strokeStyle = '#e8b25a'; c.lineWidth = r * .36; c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 14; i++) { const a = i * 2.4, d = r * (.3 + (i % 5) * .12); c.fillRect(Math.cos(a) * d, Math.sin(a) * d - r * .1, r * .07, r * .07); }
    } else if (type === 'swirl') {
      c.fillStyle = gold(r); c.beginPath(); c.arc(0, 0, r, 0, 7); c.arc(0, 0, r * .32, 0, 7, true); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(140,80,20,.55)'; c.lineWidth = r * .06; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; c.beginPath(); c.arc(Math.cos(a) * r * .66, Math.sin(a) * r * .66, r * .3, a + 1.2, a + 3.4); c.stroke(); }
    } else if (type === 'square') {
      c.fillStyle = gold(r); c.beginPath(); c.roundRect(-r * .85, -r * .85, r * 1.7, r * 1.7, r * .3); c.fill(); c.stroke();
      c.fillStyle = 'rgba(120,70,20,.5)'; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { c.beginPath(); c.arc(i * r * .45, j * r * .45, r * .06, 0, 7); c.fill(); }
    } else {
      c.fillStyle = gold(r); c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 22; i++) { const a = i * 2.39, d = r * Math.sqrt(i / 22) * .85; c.fillRect(Math.cos(a) * d, Math.sin(a) * d, r * .07, r * .07); }
    }
    c.restore();
  }
  let LID = null;
  function lidArt() {
    if (LID) return LID; const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    let gr = x.createRadialGradient(190, 170, 30, 256, 256, 260); gr.addColorStop(0, '#4a72e6'); gr.addColorStop(.55, '#2445b4'); gr.addColorStop(1, '#0d1d66');
    x.fillStyle = gr; x.beginPath(); x.arc(256, 256, 256, 0, 7); x.fill();
    const ring = (r, col, w) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.arc(256, 256, r, 0, 7); x.stroke(); };
    ring(246, '#f1cf72', 12); ring(229, '#b98a2a', 4); ring(222, 'rgba(241,207,114,.5)', 2);
    // timber house (pale blue line drawing, like the old tins)
    x.save(); x.translate(256, 150); x.strokeStyle = 'rgba(190,212,255,.75)'; x.fillStyle = 'rgba(160,190,250,.22)'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(-150, 10); x.lineTo(-120, -38); x.lineTo(120, -38); x.lineTo(150, 10); x.closePath(); x.fill(); x.stroke();
    for (let i = -140; i <= 140; i += 14) { x.beginPath(); x.moveTo(i, 8); x.lineTo(i + 10, -34); x.stroke(); }
    x.beginPath(); x.rect(-135, 10, 270, 52); x.fill(); x.stroke();
    for (let i = -130; i <= 130; i += 26) { x.beginPath(); x.moveTo(i, 10); x.lineTo(i, 62); x.stroke(); }
    for (let i = -117; i <= 110; i += 52) { x.beginPath(); x.moveTo(i - 13, 14); x.lineTo(i + 13, 58); x.moveTo(i + 13, 14); x.lineTo(i - 13, 58); x.stroke(); }
    x.fillStyle = 'rgba(255,230,150,.35)'; for (let i = -100; i <= 100; i += 50) x.fillRect(i - 8, 26, 16, 18);
    x.beginPath(); x.moveTo(-60, -38); x.lineTo(-60, -60); x.lineTo(-45, -60); x.lineTo(-45, -38); x.stroke();
    x.restore();
    // gold scroll banner
    x.save(); x.translate(256, 262);
    const bn = (y0, h, col) => { x.beginPath(); x.moveTo(-205, y0); x.quadraticCurveTo(0, y0 - 34, 205, y0); x.lineTo(205, y0 + h); x.quadraticCurveTo(0, y0 + h - 34, -205, y0 + h); x.closePath(); x.fillStyle = col; x.fill(); };
    x.fillStyle = '#9a6d16'; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 205, -26); x.lineTo(s * 238, -10); x.lineTo(s * 222, 10); x.lineTo(s * 238, 32); x.lineTo(s * 205, 40); x.fill(); }
    bn(-34, 78, '#c99a2e'); bn(-30, 70, '#f3d47c'); bn(-26, 62, '#1e3aa0');
    x.fillStyle = '#fff'; x.strokeStyle = '#0b1650'; x.lineWidth = 6; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 50px Georgia, "Times New Roman", serif'; x.strokeText('BUTTER', 0, -10); x.fillText('BUTTER', 0, -10);
    x.font = '700 30px Georgia, "Times New Roman", serif'; x.lineWidth = 5; x.strokeText('BISCUITS', 0, 28); x.fillText('BISCUITS', 0, 28);
    x.restore();
    x.font = 'italic 600 20px Georgia, serif'; x.fillStyle = '#f1cf72'; x.textAlign = 'center'; x.fillText('Baked the old way', 256, 334);
    // biscuits along the bottom
    biscuit(x, 'swirl', 178, 400, 40, .3); biscuit(x, 'pretzel', 256, 392, 40); biscuit(x, 'round', 336, 400, 38); biscuit(x, 'square', 214, 448, 26, .4); biscuit(x, 'round', 300, 452, 26);
    // shine
    gr = x.createLinearGradient(80, 40, 380, 470); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(.35, 'rgba(255,255,255,0)'); gr.addColorStop(.7, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.12)');
    x.fillStyle = gr; x.beginPath(); x.arc(256, 256, 244, 0, 7); x.fill();
    return LID = c;
  }

  /* ---------- a tin in 3/4 view: (x, y) = centre of the top of the body; R = radius; k = how far we look down (ellipse squash) ---------- */
  function sideGrad(c, x, R, a, b) { const gr = c.createLinearGradient(x - R, 0, x + R, 0); gr.addColorStop(0, a); gr.addColorStop(.32, b); gr.addColorStop(.45, '#6f93ff'); gr.addColorStop(.58, b); gr.addColorStop(1, a); return gr; }
  function cyl(c, x, y, R, k, h, fill) {   // side band of a cylinder from y to y + h
    c.beginPath(); c.moveTo(x - R, y); c.lineTo(x - R, y + h); c.ellipse(x, y + h, R, R * k, 0, Math.PI, 0, true); c.lineTo(x + R, y); c.ellipse(x, y, R, R * k, 0, 0, Math.PI, false); c.closePath(); c.fillStyle = fill; c.fill();
  }
  function lidAt(c, x, y, R, k, rot = 0) {   // the lid (a little wider than the body) with its rim; y = where the lid's bottom edge sits
    const L = R * .13, RL = R * 1.03; c.save(); c.translate(x, y); c.rotate(rot);
    cyl(c, 0, -L, RL, k, L, sideGrad(c, 0, RL, '#0b1858', '#1d3a9e'));
    c.strokeStyle = '#e7c164'; c.lineWidth = R * .03; c.beginPath(); c.ellipse(0, -L * .35, RL, RL * k, 0, 0, Math.PI); c.stroke();
    c.save(); c.translate(0, -L); c.scale(1, k); c.beginPath(); c.arc(0, 0, RL, 0, 7); c.clip(); c.drawImage(lidArt(), -RL, -RL, RL * 2, RL * 2); c.restore();
    c.strokeStyle = 'rgba(10,16,60,.8)'; c.lineWidth = R * .018; c.beginPath(); c.ellipse(0, -L, RL, RL * k, 0, 0, 7); c.stroke();
    c.restore();
  }
  function bodyAt(c, x, y, R, k) {
    const H = R * .62;
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(x + R * .06, y + H + R * k * .12, R * 1.08, R * k * 1.1, 0, 0, 7); c.fill();
    cyl(c, x, y, R, k, H, sideGrad(c, x, R, '#0a1652', '#2141ad'));
    c.strokeStyle = '#e7c164'; c.lineWidth = R * .035; for (const f of [.1, .9]) { c.beginPath(); c.ellipse(x, y + H * f, R * .995, R * k, 0, .05, Math.PI - .05); c.stroke(); }
    // biscuits printed round the side
    for (let i = 0; i < 5; i++) { const a = .45 + i * .56, sx = Math.cos(a), w = Math.sin(a); c.save(); c.translate(x - sx * R * .9, y + H * .5 + Math.sin(a) * R * k * .9); c.scale(w * .9, 1); biscuit(c, ['round', 'swirl', 'pretzel', 'square', 'round'][i], 0, 0, R * .15); c.restore(); }
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - R * .32, y + H * .2, R * .1, H * .6);
  }
  function inside(c, x, y, R, k, content, reveal) {   // open tin: inner wall + what's inside
    c.save(); c.beginPath(); c.ellipse(x, y, R * .97, R * k * .97, 0, 0, 7); c.clip();
    let gr = c.createLinearGradient(0, y - R * k, 0, y + R * k); gr.addColorStop(0, '#e9edf3'); gr.addColorStop(.45, '#9aa3b2'); gr.addColorStop(1, '#5a6272'); c.fillStyle = gr; c.fillRect(x - R, y - R * k, R * 2, R * k * 2);
    c.fillStyle = 'rgba(30,36,50,.35)'; c.beginPath(); c.ellipse(x, y + R * k * .18, R * .92, R * k * .8, 0, 0, 7); c.fill();
    c.translate(x, y + R * k * .14); c.scale(1, k); drawContent(c, content, R * .86, reveal); c.restore();
    c.strokeStyle = '#d9dde4'; c.lineWidth = R * .05; c.beginPath(); c.ellipse(x, y, R, R * k, 0, 0, 7); c.stroke();
    c.strokeStyle = '#e7c164'; c.lineWidth = R * .02; c.beginPath(); c.ellipse(x, y + R * .015, R * 1.02, R * k * 1.02, 0, 0, Math.PI); c.stroke();
  }
  /* what's inside, drawn flat in the tin's own circle (radius r), as seen from above */
  function drawContent(c, ct, r) {
    const R2 = (a, b) => a + (b - a) * ((Math.sin(ct.seed++ * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const seed0 = ct.seed; ct.seed = ct.s0 || (ct.s0 = 1 + Math.random() * 1000);
    if (ct.t === 'sewing') {
      c.fillStyle = '#6b2b3a'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();   // felt lining
      const spool = (x, y, s, col) => { c.fillStyle = '#c99a5a'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, y, s * .82, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = s * .05; for (let i = 3; i < 8; i++) { c.beginPath(); c.arc(x, y, s * i / 10, 0, 7); c.stroke(); } c.fillStyle = '#8a6030'; c.beginPath(); c.arc(x, y, s * .28, 0, 7); c.fill(); c.fillStyle = '#2a1a0a'; c.beginPath(); c.arc(x, y, s * .12, 0, 7); c.fill(); };
      const button = (x, y, s, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = s * .12; c.beginPath(); c.arc(x, y, s * .75, 0, 7); c.stroke(); c.fillStyle = 'rgba(0,0,0,.55)'; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.arc(x + a * s * .25, y + b * s * .25, s * .12, 0, 7); c.fill(); } };
      // tape measure
      c.fillStyle = '#f3c623'; c.beginPath(); c.arc(-r * .45, r * .3, r * .26, 0, 7); c.fill(); c.strokeStyle = '#a67c00'; c.lineWidth = r * .02; for (let i = 1; i < 6; i++) { c.beginPath(); c.arc(-r * .45, r * .3, r * .045 * i, 0, 7); c.stroke(); }
      c.fillStyle = '#f3c623'; c.save(); c.translate(-r * .2, r * .45); c.rotate(-.3); c.fillRect(0, -r * .04, r * .5, r * .08); c.fillStyle = '#222'; for (let i = 0; i < 10; i++) c.fillRect(i * r * .05, -r * .04, r * .006, r * .04); c.restore();
      // pin cushion tomato
      c.fillStyle = '#d8262e'; c.beginPath(); c.arc(r * .42, -r * .35, r * .22, 0, 7); c.fill(); c.strokeStyle = '#8f1318'; c.lineWidth = r * .015; for (let i = 0; i < 6; i++) { const a = i * 1.047; c.beginPath(); c.moveTo(r * .42, -r * .35); c.lineTo(r * .42 + Math.cos(a) * r * .22, -r * .35 + Math.sin(a) * r * .22); c.stroke(); }
      c.fillStyle = '#2f8a3a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * .628, d = i % 2 ? r * .04 : r * .09; c.lineTo(r * .42 + Math.cos(a) * d, -r * .35 + Math.sin(a) * d); } c.fill();
      for (let i = 0; i < 6; i++) { const a = i * 1.1 + .4, px = r * .42 + Math.cos(a) * r * .14, py = -r * .35 + Math.sin(a) * r * .14; c.fillStyle = ['#fff', '#ffd23a', '#3fa9f5'][i % 3]; c.beginPath(); c.arc(px, py, r * .03, 0, 7); c.fill(); }
      spool(-r * .38, -r * .38, r * .2, '#2c6fd6'); spool(-r * .02, -r * .55, r * .17, '#e2a12a'); spool(r * .05, r * .1, r * .19, '#ea4f9a'); spool(r * .5, r * .2, r * .16, '#2fa65a');
      // scissors
      c.save(); c.translate(r * .2, r * .58); c.rotate(-.5); c.strokeStyle = '#b4bac4'; c.lineWidth = r * .045; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(r * .42, -r * .06); c.moveTo(0, 0); c.lineTo(r * .42, r * .08); c.stroke(); c.strokeStyle = '#2a2a2a'; c.lineWidth = r * .04; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(-r * .1, s * r * .08, r * .08, r * .05, 0, 0, 7); c.stroke(); } c.restore();
      // needles + safety pins
      c.strokeStyle = '#d7dbe2'; c.lineWidth = r * .012; for (let i = 0; i < 4; i++) { const a = R2(0, 6.28), px = R2(-.6, .6) * r, py = R2(-.1, .6) * r; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * r * .28, py + Math.sin(a) * r * .28); c.stroke(); }
      for (let i = 0; i < 14; i++) button(R2(-.75, .75) * r, R2(-.75, .75) * r, r * R2(.045, .075), ['#f4f4f4', '#1c1c1c', '#c83a3a', '#2a5fc2', '#e8b33a', '#7a4a2a'][i % 6]);
      return;
    }
    if (ct.t === 'biscuits' || ct.t === 'peek') {
      const T = ['pretzel', 'swirl', 'round', 'square'];
      const pos = [[0, 0]]; for (let i = 0; i < 6; i++) pos.push([Math.cos(i * 1.047) * r * .5, Math.sin(i * 1.047) * r * .5]); for (let i = 0; i < 10; i++) pos.push([Math.cos(i * .628 + .3) * r * .86, Math.sin(i * .628 + .3) * r * .86]);
      pos.forEach(([x, y], i) => { const cr = r * .2; c.fillStyle = '#fbfaf6'; c.beginPath(); for (let j = 0; j < 24; j++) { const a = j / 24 * 6.283, d = cr * (j % 2 ? 1 : 1.08); c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } c.fill(); c.strokeStyle = '#d8d3c6'; c.lineWidth = r * .01; c.stroke(); biscuit(c, T[i % 4], x, y, cr * .78, i); });
      return;
    }
    if (ct.t === 'coins') {
      c.fillStyle = '#3a2b14'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
      for (let i = 0; i < 46; i++) { const a = i * 2.399, d = r * .92 * Math.sqrt((i + .5) / 46), cx = Math.cos(a) * d, cy = Math.sin(a) * d, cr = r * .13;
        const gr = c.createRadialGradient(cx - cr * .3, cy - cr * .3, cr * .1, cx, cy, cr); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(.5, '#e6c34a'); gr.addColorStop(1, '#a5801e');
        c.fillStyle = gr; c.beginPath(); for (let j = 0; j < 12; j++) c.lineTo(cx + Math.cos(j * .5236 + .26) * cr, cy + Math.sin(j * .5236 + .26) * cr); c.fill(); c.fillStyle = '#c9ced6'; c.beginPath(); c.arc(cx, cy, cr * .62, 0, 7); c.fill(); }
      return;
    }
    if (ct.t === 'none') return;
    // prizes that pop out: a bed of tissue paper
    c.fillStyle = ct.t === 'gadget' ? '#ffd6e8' : '#fff2c6'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = r * .02; for (let i = 0; i < 12; i++) { const a = i * .52; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a + .3) * r * .5, Math.sin(a + .3) * r * .5, Math.cos(a) * r, Math.sin(a) * r); c.stroke(); }
    ct.seed = seed0;
  }
  /* the prize rising out of the open tin (drawn upright) */
  function drawPrize(c, ct, x, y, R, k) {   // only a free gadget pops its icon up out of the tin; the heading names every other prize
    if (k <= 0 || ct.t !== 'gadget') return; c.save(); c.translate(x, y - R * .55 - Math.min(1, k) * R * .35); const s = .3 + .7 * Math.min(1, k); c.scale(s, s);
    const gl = c.createRadialGradient(0, 0, 4, 0, 0, R * .7); gl.addColorStop(0, 'rgba(255,240,170,.8)'); gl.addColorStop(1, 'rgba(255,220,100,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 0, R * .7, 0, 7); c.fill();
    const ic = document.createElement('canvas'); try { API().iconFor(ic, 'gadget', ct.it); } catch (e) {} c.drawImage(ic, -R * .4, -R * .4, R * .8, R * .8); c.restore();
  }

  /* ---------- owner's finished sprites (art/tin/*.webp, made in ChatGPT 23 Nov): the open tin, the lid, the lid flying off, and what's inside.
     The tin picture is 600 wide; its opening is an ellipse centred (300,156), 270 x 138; the outer rim reaches y 308. ---------- */
  const IMG = {}; ['tin', 'lid', 'lidfly', 'sewing', 'few', 'lots', 'eidi', 'keys', 'jackpot', 'gift'].forEach(k => { const im = new Image(); im.src = 'art/tin/' + k + '.webp?v=1'; IMG[k] = im; });
  const ok = k => IMG[k] && IMG[k].complete && IMG[k].naturalWidth;
  const OPX = 300, OPY = 156, ORX = 270, ORY = 138, TW = 600;
  const spriteOf = ct => ({ sewing: 'sewing', jackpot: 'jackpot', save: 'eidi', save2: 'eidi', hs500: 'keys', hs1000: 'keys', gadget: 'gift' })[ct.t] || (ct.amt >= 100 ? 'lots' : 'few');
  function tinS(c, x, y, sc, a = 1) {   // the open tin, opening centred on (x, y)
    c.fillStyle = 'rgba(0,0,0,.38)'; c.beginPath(); c.ellipse(x + 10 * sc, y + 300 * sc, 300 * sc, 70 * sc, 0, 0, 7); c.fill();
    c.drawImage(IMG.tin, x - OPX * sc, y - OPY * sc, TW * sc, IMG.tin.height * sc); }
  function lidS(c, x, y, sc, dx = 0, dy = 0, rot = 0, fly = 0) {   // lid sitting on the rim (dx/dy/rot move it off)
    const im = fly ? IMG.lidfly : IMG.lid, s = sc * 1.03, w = TW * s, h = im.height * s, bottom = y + 165 * sc;
    c.save(); c.translate(x + dx, bottom - h / 2 + dy); c.rotate(rot); c.drawImage(im, -w / 2, -h / 2, w, h); c.restore(); }
  function contentsS(c, x, y, sc, ct, pop = 1) {   // what's inside, clipped so the front rim stays in front of it
    const k = spriteOf(ct), im = IMG[k]; if (!ok(k)) return;
    // owner 23 Nov: the contents sit down IN the tin: clipped to the opening plus only a low mound above the back rim, drawn smaller and lower, with the tin's inner wall shading over the back
    c.save(); c.beginPath(); c.ellipse(x, y, ORX * .985 * sc, ORY * .97 * sc, 0, 0, Math.PI); c.ellipse(x, y - ORY * .1 * sc, ORX * .96 * sc, ORY * 1.25 * sc, 0, Math.PI, 0); c.closePath(); c.clip();
    const w = ORX * 2 * .84 * sc * (.86 + .14 * pop), h = im.height * w / im.width, by = y + ORY * 1.02 * sc + h * .2 - (pop < 1 ? (1 - pop) * 40 * sc : 0);
    c.drawImage(im, x - w / 2, by - h, w, h);
    const sh = c.createLinearGradient(0, y - ORY * sc, 0, y + ORY * .2 * sc); sh.addColorStop(0, 'rgba(10,10,30,.55)'); sh.addColorStop(.55, 'rgba(10,10,30,.18)'); sh.addColorStop(1, 'rgba(10,10,30,0)');
    c.fillStyle = sh; c.beginPath(); c.ellipse(x, y, ORX * sc, ORY * sc, 0, Math.PI, 0); c.lineTo(x + ORX * sc, y + ORY * .2 * sc); c.lineTo(x - ORX * sc, y + ORY * .2 * sc); c.closePath(); c.fill();
    c.restore();
    if (k === 'jackpot') { const gl = c.createRadialGradient(x, y - 20 * sc, 4, x, y - 20 * sc, 320 * sc); gl.addColorStop(0, `rgba(255,220,110,${.45 * pop})`); gl.addColorStop(1, 'rgba(255,220,110,0)'); c.fillStyle = gl; c.fillRect(x - 340 * sc, y - 360 * sc, 680 * sc, 560 * sc); } }

  /* ---------- prizes ---------- */
  const pickW = list => { let r = Math.random() * list.reduce((a, b) => a + b.w, 0); for (const p of list) if ((r -= p.w) < 0) return { ...p }; return { ...list[0] }; };
  const TOP = [{ t: 'jackpot', amt: 300, w: 40 }, { t: 'hs1000', w: 16 }, { t: 'save2', w: 12 }, { t: 'coins', amt: 150, w: 20 }, { t: 'gadget', w: 12 }];
  const LOW = [{ t: 'sewing', w: 62 }, { t: 'coins', amt: 25, w: 16 }, { t: 'coins', amt: 50, w: 10 }, { t: 'save', w: 6 }, { t: 'hs500', w: 6 }];
  function topPrize() { const p = pickW(TOP); if (p.t === 'gadget') { const free = (API().ITEMS.gadget || []).filter(it => !API().SHOP.own[it.id]); if (!free.length) return { t: 'jackpot', amt: 500 }; p.it = free[Math.random() * free.length | 0]; } return p; }
  const WORDS = {
    sewing: () => ['SEWING KIT...', 'Ammi got you again. No biscuits.'],
    jackpot: p => ['JACKPOT!', `+£${p.amt} hidden in Ammi's biscuit tin!`],
    coins: p => [`£${p.amt}!`, p.amt >= 100 ? 'Someone was hiding their savings in here.' : 'Loose change under the buttons.'],
    save: () => ['SECOND CHANCE', 'A spare Eidi, tucked under the needles.'],
    save2: () => ['2 SECOND CHANCES', 'Two spare Eidi envelopes!'],
    hs500: () => ['HEAD START 500M', "Uncle's spare car keys were in there."],
    hs1000: () => ['HEAD START 1000M', "Uncle's car keys AND a full tank!"],
    gadget: p => ['FREE GADGET!', `${p.it.name} is yours. Switch it on in the shop.`],
  };
  function award(p) {
    const A = API(), SH = A.SHOP;
    if (p.t === 'coins' || p.t === 'jackpot') { A.addCoins(p.amt); try { A.coin(); } catch (e) {} }
    else if (p.t === 'save') SH.save++; else if (p.t === 'save2') SH.save += 2;
    else if (p.t === 'hs500') SH.hs500++; else if (p.t === 'hs1000') SH.hs1000++;
    else if (p.t === 'gadget') SH.own[p.it.id] = 1;
    try { A.saveShop(); } catch (e) {}
  }

  /* ---------- the round ---------- */
  let S = null, W = 0, H = 0, DPR = 1, raf = 0, left = 0, doneCb = null, parts = [];
  const msg = (h, t) => { H2.textContent = h; TX.textContent = t || ''; };
  function layout() { W = box.clientWidth || 800; H = box.clientHeight || 400; DPR = Math.min(2, window.devicePixelRatio || 1); cv.width = W * DPR; cv.height = H * DPR; }
  function slotPos(i) { return [W * (.22 + i * .28), H * .58]; }
  function newRound() {
    layout(); const R = Math.min(W * .115, H * .2) * .82, win = Math.random() * 3 | 0;
    S = { ph: 'drop', t: 0, R, win, k: .42, sw: [], tins: [0, 1, 2].map(i => ({ id: i, slot: i, from: i, x: slotPos(i)[0], y: slotPos(i)[1], s: 1, lidY: 0, lidR: 0, lidX: 0, off: 0, fly: 0, a: 1, rise: 0, ct: i === win ? topPrize() : pickW(LOW) })), cam: { z: 1, fx: W / 2, fy: H / 2, sx: W / 2, sy: H / 2 }, chosen: null, pk: .42 };
    S.tins.forEach(tn => { tn.ct.s0 = 1 + Math.random() * 999; });
    msg("AMMI'S TIN", 'One of these has the JACKPOT. Watch it!'); go.classList.add('off'); pick.classList.add('off'); NN.textContent = left > 1 ? `TINS LEFT: ${left}` : '';
  }
  // owner 23 Nov: money wins = ka-ching + coins pouring out + confetti falling from the top
  function kaching(n) { const A = API(); snd(2093, .05, 'square', .05); setTimeout(() => { snd(1568, .5, 'triangle', .07, .3); snd(2637, .4, 'sine', .05, .3); }, 40);
    for (let i = 0; i < n; i++) setTimeout(() => { try { A.coin(); } catch (e) {} }, 140 + i * (60 + Math.random() * 45)); }
  function coinShower(x, y, n) { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 300 + Math.random() * 420; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1.3 + Math.random() * .8, c: '#ffd34a', r: 5 + Math.random() * 3, coin: 1, sp: Math.random() * 6 }); } }
  function confetti(n) { const cols = ['#ffd75a', '#7dffa0', '#7fb6ff', '#ff8ac0', '#ffffff', '#c58bff']; for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: -10 - Math.random() * H * .5, vx: (Math.random() - .5) * 80, vy: 40 + Math.random() * 90, l: 2.4 + Math.random() * 1.2, c: cols[i % cols.length], r: 3 + Math.random() * 3, cf: 1, sp: Math.random() * 6, rs: 4 + Math.random() * 6 }); }
  const TSPD = { drop: 1.7, peek: 1.9, zoom: 2.2, prise: 2.6, pop: 1.5, show: 2, others: 2 };
  function setPh(p) { S.ph = p; S.t = 0; }
  function burst(x, y, n, cols, sp = 260) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = sp * (.4 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .5, l: .9 + Math.random() * .6, c: cols[i % cols.length], r: 2 + Math.random() * 4, sq: Math.random() < .5 }); } }

  function step(dt) {
    if (!S) return; S.t += dt * (TSPD[S.ph] || 1); const T = S.t, R = S.R;   // owner 23 Nov: keep it snappy (shuffle, see your prize, see what you missed, next)
    if (S.ph === 'drop') { S.tins.forEach((tn, i) => { const k = back((T - i * .12) / .55); tn.y = lerp(-R * 2, slotPos(tn.slot)[1], k); }); if (T > 1) setPh('peek'); }
    else if (S.ph === 'peek') {
      const tn = S.tins[S.win]; tn.peek = 1; const up = T < .5 ? ease(T / .5) : T < 1.9 ? 1 : 1 - ease((T - 1.9) / .45);
      tn.lidY = -R * 1.05 * up; tn.lidR = -.25 * up; if (T > .1 && !S.pk1) { S.pk1 = 1; snd(700, .1, 'triangle', .06, 1.5); }
      if (T > 2.35) { tn.peek = 0; tn.lidY = 0; tn.lidR = 0; snd(160, .08, 'square', .06); setPh('ready'); msg("AMMI'S TIN", 'Keep your eye on it...'); go.textContent = 'SHUFFLE!'; go.dataset.k = 'shuffle'; go.classList.remove('off'); }
    }
    else if (S.ph === 'shuffle') {
      if (!S.cur || S.cur.t >= S.cur.d) {
        if (S.cur) S.cur.pair.forEach(tn => { tn.slot = tn.to; });
        if (S.n >= S.N) { S.cur = null; setPh('pick'); msg('PICK A TIN!', 'Which one has the jackpot?'); pick.classList.remove('off'); return; }
        const a = Math.random() * 3 | 0, b = (a + 1 + (Math.random() * 2 | 0)) % 3, ta = S.tins.find(t => t.slot === a), tb = S.tins.find(t => t.slot === b);
        ta.to = b; tb.to = a; S.cur = { pair: [ta, tb], t: 0, d: Math.max(.13, .24 - S.n * .025) }; S.n++; snd(150 + Math.random() * 80, .05, 'square', .05); snd(520, .03, 'triangle', .03);
      }
      const C = S.cur; C.t += dt; const k = ease(C.t / C.d);
      C.pair.forEach((tn, j) => { const [x0, y0] = slotPos(tn.slot), [x1] = slotPos(tn.to), dir = j ? 1 : -1; tn.x = lerp(x0, x1, k); tn.y = y0 + Math.sin(k * Math.PI) * R * .55 * dir; tn.s = 1 + Math.sin(k * Math.PI) * .08 * dir; });
    }
    else if (S.ph === 'pick') { S.tins.forEach((tn, i) => { tn.y = slotPos(tn.slot)[1] - Math.abs(Math.sin(T * 4 + i)) * R * .06; }); }
    else if (S.ph === 'zoom') {
      const k = ease(T / .9), ch = S.chosen; S.tins.forEach(tn => { if (tn !== ch) tn.a = 1 - k; });
      S.cam.z = lerp(1, 1.7, k); S.cam.fx = lerp(W / 2, ch.x, k); S.cam.fy = lerp(H / 2, ch.y, k); S.cam.sx = W / 2; S.cam.sy = lerp(H / 2, H * .52, k); S.pk = lerp(.42, .68, k);
      if (T > 1) setPh('prise');
    }
    else if (S.ph === 'prise') {
      const ch = S.chosen; ch.lidR = Math.sin(T * 34) * .035 * (1 + T); ch.lidY = -Math.abs(Math.sin(T * 9)) * R * .07;
      for (const at of [.15, .5, .85]) if (T > at && !S['sq' + at]) { S['sq' + at] = 1; snd(1500 + at * 400, .09, 'sine', .035, .7); }
      if (T > 1.15) { setPh('pop'); snd(420, .16, 'triangle', .1, 2.2); burst(ch.x, ch.y - R * .3, 26, ch.ct.t === 'sewing' ? ['#f4f4f4', '#c83a3a', '#2a5fc2', '#e8b33a'] : ['#ffd75a', '#fff3b0', '#e8b25a']); }
    }
    else if (S.ph === 'pop') {
      const ch = S.chosen, k = T / .7; ch.lidY = -R * (k * 3.2 + k * k * 2); ch.lidX = R * k * 2.4; ch.lidR = k * 2.6; ch.off = 1;
      if (S.rv) ch.pop = Math.min(1, (ch.pop || 0) + dt * 2.4);
      if (T > .25 && !S.rv) { S.rv = 1; ch.open = 1; ch.pop = 0; award(ch.ct); const w = WORDS[ch.ct.t](ch.ct); msg(w[0], w[1]);
        if (ch.ct.t === 'sewing') [392, 370, 349, 311].forEach((f, i) => setTimeout(() => snd(f, .32, 'sawtooth', .05), i * 260));
        else if (ch.ct.t === 'coins' || ch.ct.t === 'jackpot') { kaching(ch.ct.t === 'jackpot' ? 16 : 9); coinShower(ch.x, ch.y - R * .6, ch.ct.t === 'jackpot' ? 70 : 38); confetti(ch.ct.t === 'jackpot' ? 120 : 70); }
        else { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => snd(f, .16, 'square', .055), i * 90)); burst(ch.x, ch.y - R * .6, 60, ['#ffd75a', '#7dffa0', '#7fb6ff', '#ff8ac0', '#fff'], 380); } }
      if (T > .7) { ch.fly = 1; setPh('show'); }
    }
    else if (S.ph === 'show') { S.chosen.pop = Math.min(1, (S.chosen.pop || 0) + dt * 2.4); S.chosen.rise = back(T / .6); if (T > 2.2) { setPh('others'); } }
    else if (S.ph === 'others') {
      const k = ease(T / .8); S.cam.z = lerp(1.7, 1, k); S.cam.fx = lerp(S.chosen.x, W / 2, k); S.cam.fy = lerp(S.chosen.y, H / 2, k); S.cam.sy = lerp(H * .52, H / 2, k); S.pk = lerp(.68, .5, k);
      S.tins.forEach(tn => { if (tn !== S.chosen) { tn.a = k; const kk = ease((T - .9 - (tn.slot === 0 ? 0 : .35)) / .3); if (kk > 0) { tn.lidY = -R * 5 * kk; tn.lidX = R * 2.2 * kk * (tn.x < W / 2 ? -1 : 1); tn.lidR = kk * (tn.x < W / 2 ? -.6 : .6); tn.open = 1; tn.pop = Math.min(1, (tn.pop || 0) + dt * 2.4); tn.off = 1; if (!tn.pp) { tn.pp = 1; snd(600, .08, 'triangle', .05, 1.6); } } } });
      S.chosen.rise = Math.max(.55, 1 - k * .45);
      if (T > 2) { setPh('end'); left--; NN.textContent = left > 0 ? `TINS LEFT: ${left}` : ''; go.textContent = left > 0 ? `OPEN NEXT TIN (${left})` : 'CARRY ON'; go.dataset.k = 'next'; go.classList.remove('off'); }
    }
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.cf ? 60 : 700) * dt; if (p.cf) { p.vy = Math.min(p.vy, 130); p.x += Math.sin(p.sp + p.l * 3) * 30 * dt; } p.sp += dt * (p.rs || 9); p.l -= dt; }); parts = parts.filter(p => p.l > 0);
  }

  function drawBG() {
    let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1a12'); gr.addColorStop(.42, '#4a2c1c'); gr.addColorStop(.43, '#7a4a28'); gr.addColorStop(1, '#3a2010'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = H * .45 + i * H * .065; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + 6, W * .6, y - 6, W, y + 3); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 14; i++) g.fillRect((i * 97) % W, H * .06, 3, H * .32);   // wallpaper stripes
    gr = g.createRadialGradient(W / 2, H * .5, H * .1, W / 2, H * .5, W * .7); gr.addColorStop(0, 'rgba(255,200,120,.22)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  function drawTinObj(tn) {
    if (tn.a <= 0.01) return;
    if (ok('tin') && ok('lid') && ok('lidfly')) { const sc = S.R * tn.s * 2.3 / TW; g.save(); g.globalAlpha = tn.a;
      tinS(g, tn.x, tn.y, sc);
      if (tn.open || tn.peek) contentsS(g, tn.x, tn.y, sc, tn.peek ? S.tins[S.win].ct : tn.ct, tn.open ? Math.min(1, back(tn.pop || 0)) : 1);
      if (!tn.open || tn.lidY < 0) lidS(g, tn.x, tn.y, sc, tn.lidX, tn.lidY, tn.lidR, tn.off && tn.lidY < -S.R * .4 ? 1 : 0);
      if (tn.open && tn.rise > 0) drawPrize(g, tn.ct, tn.x, tn.y, S.R * tn.s, tn.rise);
      g.restore(); return; } const R = S.R * tn.s, k = tn === S.chosen ? S.pk : (S.ph === 'others' || S.ph === 'end' ? S.pk : S.k);
    g.save(); g.globalAlpha = tn.a; bodyAt(g, tn.x, tn.y, R, k);
    if (tn.open || tn.peek) { inside(g, tn.x, tn.y, R, k, tn.peek ? { t: 'peek', s0: 7 } : tn.ct); }
    else lidAt(g, tn.x + tn.lidX, tn.y + tn.lidY, R, k, tn.lidR);
    if (tn.peek && tn.lidY < -R * .5) { const gl = g.createRadialGradient(tn.x, tn.y, 2, tn.x, tn.y, R * 1.3); gl.addColorStop(0, 'rgba(255,220,120,.6)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.beginPath(); g.arc(tn.x, tn.y, R * 1.3, 0, 7); g.fill(); }
    if ((tn.open || tn.peek) && (tn.lidY < 0)) lidAt(g, tn.x + tn.lidX, tn.y + tn.lidY, R, k, tn.lidR);
    if (tn.open && tn.rise > 0 && !['sewing', 'coins', 'biscuits'].includes(tn.ct.t)) drawPrize(g, tn.ct, tn.x, tn.y, R, tn.rise);
    if (tn.open && tn.rise > 0 && (tn.ct.t === 'coins' || tn.ct.t === 'biscuits')) drawPrize(g, tn.ct, tn.x, tn.y - R * .2, R, tn.rise);
    g.restore();
  }
  function frame(now) {
    const dt = Math.min(.05, (now - (frame.l || now)) / 1000); frame.l = now; step(dt);
    g.setTransform(DPR, 0, 0, DPR, 0, 0); drawBG();
    const C = S.cam; g.setTransform(DPR * C.z, 0, 0, DPR * C.z, DPR * (C.sx - C.fx * C.z), DPR * (C.sy - C.fy * C.z));
    [...S.tins].sort((a, b) => a.y - b.y).forEach(drawTinObj);
    parts.forEach(p => { g.globalAlpha = Math.min(1, p.l * 2); g.fillStyle = p.c;
      if (p.coin) { const k = Math.abs(Math.cos(p.sp)); g.fillStyle = '#b8860b'; g.beginPath(); g.ellipse(p.x, p.y, Math.max(1, p.r * k), p.r, 0, 0, 7); g.fill(); g.fillStyle = k > .3 ? '#ffd94a' : '#e0a92a'; g.beginPath(); g.ellipse(p.x, p.y, Math.max(.6, p.r * .78 * k), p.r * .78, 0, 0, 7); g.fill(); if (k > .5) { g.fillStyle = 'rgba(255,255,230,.8)'; g.fillRect(p.x - p.r * .3 * k, p.y - p.r * .5, p.r * .25 * k, p.r * .35); } return; }
      if (p.cf) { g.save(); g.translate(p.x, p.y); g.rotate(p.sp); g.scale(1, Math.cos(p.sp * 1.3)); g.fillRect(-p.r, -p.r * .45, p.r * 2, p.r * .9); g.restore(); return; }
      if (p.sq) g.fillRect(p.x, p.y, p.r * 1.6, p.r); else { g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); } }); g.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  go.addEventListener('pointerdown', e => { e.stopPropagation(); if (!S) return;
    if (S.ph === 'ready') { go.classList.add('off'); S.n = 0; S.N = 5; S.cur = null; setPh('shuffle'); msg('SHUFFLING...', ''); }
    else if (S.ph === 'end') { if (left > 0) newRound(); else finish(); } });
  pick.querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); if (!S || S.ph !== 'pick') return;
    const i = +b.dataset.i; S.chosen = S.tins.find(t => t.slot === i); pick.classList.add('off'); snd(300, .07, 'square', .06); msg(S.chosen.id === S.win ? 'GOOD EYE...' : 'THIS ONE?', 'Prising the lid off...'); setPh('zoom'); }));
  box.addEventListener('pointerdown', e => e.stopPropagation());
  function finish() { cancelAnimationFrame(raf); S = null; box.classList.add('hide'); const cb = doneCb; doneCb = null; cb && cb(); }
  window.TIN = {
    open(n, done) { left = n; doneCb = done; parts = []; box.classList.remove('hide'); newRound(); cancelAnimationFrame(raf); frame.l = 0; raf = requestAnimationFrame(frame); },
    close() { if (!S && box.classList.contains('hide')) return; cancelAnimationFrame(raf); S = null; doneCb = null; box.classList.add('hide'); },
    mini(c, x, y, r) { if (ok('tin') && ok('lid')) { const sc = r * 2.3 / TW; c.save(); c.translate(0, -r * .2); tinS(c, x, y, sc); lidS(c, x, y, sc); c.restore(); return; } bodyAt(c, x, y, r, .45); lidAt(c, x, y, r, .45, 0); },
    get S() { return S; },
    _art: { lidArt, bodyAt, lidAt, inside, drawPrize, TOP, LOW, tinS, lidS, contentsS, IMG }, get busy() { return !box.classList.contains('hide'); },
  };
  window.addEventListener('resize', () => { if (S && S.ph !== 'zoom') { const oW = W, oH = H; layout(); S.tins.forEach(tn => { tn.x *= W / oW; tn.y *= H / oH; }); } });
})();
