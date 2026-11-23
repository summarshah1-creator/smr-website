/* Hoover Mech exosuit (owner 23 Nov, from his own drawing): chunky glossy red armour, black corrugated hoses,
   a hoover tank for a head with a black lid + handle and a round window where the hero's face shows through.
   drawMech(g, o): origin = ground under the mech, facing right, units = game units at scale 1.
   o = { ph: walk phase, air: 0..1 (legs tuck in the air), su: suit-up progress 0..1 (1 = built), hero(g): draws the hero,
         bob, thr: foot jets on, t: time }
   MECH_LOCKS: when each part locks into place during the suit-up (game plays a clank + sparks at that point). */
(function () {
  const OL = '#141418', RED = ['#ff5a5c', '#e2252b', '#a8141b'], BLK = ['#4a4a54', '#2a2a30', '#141418'], WHITE = '#f6f6f8';
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);   // ease-out with a little overshoot
  // [name, start, end, fromX, fromY, fromRot]
  const PARTS = [
    ['feet', 0, .16, 0, 70, 0], ['shins', .08, .28, 0, 60, 2.2], ['pelvis', .22, .38, 0, 50, 0],
    ['back', .34, .5, -110, 0, -.5], ['chest', .38, .54, 120, 0, .5], ['pack', .48, .62, -60, -90, -.9],
    ['armR', .54, .68, -90, -30, 2.6], ['armF', .58, .72, 100, -40, -2.8], ['pad', .66, .78, 10, -80, 1.2],
    ['head', .72, .88, 0, -150, 3.14], ['lid', .84, .94, 0, -80, 0], ['hose', .9, 1, 0, 0, 0]];
  const P = {}; PARTS.forEach(p => P[p[0]] = p);
  const LOCK = { feet: [0, -6], shins: [0, -40], pelvis: [0, -70], back: [-20, -92], chest: [20, -92], pack: [-37, -104],
    armR: [10, -70], armF: [-20, -60], pad: [-18, -108], head: [4, -126], lid: [4, -152], hose: [36, -110] };
  window.MECH_LOCKS = PARTS.map(p => ({ k: p[0], at: p[2], x: LOCK[p[0]][0], y: LOCK[p[0]][1] }));

  const grad = (g, x0, y0, x1, y1, c) => { const q = g.createLinearGradient(x0, y0, x1, y1); q.addColorStop(0, c[0]); q.addColorStop(.45, c[1]); q.addColorStop(1, c[2]); return q; };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  const fillS = (g, fill, lw) => { g.fillStyle = fill; g.fill(); g.lineWidth = lw || 2.2; g.strokeStyle = OL; g.stroke(); };
  const shine = (g, x, y, w, h, r, a) => { g.save(); g.globalAlpha = (a || .55) * .55; g.fillStyle = '#ff9a9a'; rr(g, x, y, w, h, r); g.fill(); g.restore(); };
  const vents = (g, x, y, w, n, gap) => { g.lineCap = 'round'; for (let i = 0; i < n; i++) { g.strokeStyle = OL; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y + i * gap); g.lineTo(x + w, y + i * gap); g.stroke(); } };
  // corrugated hose along a cubic path, revealed from the start up to `rev` (0..1)
  function hose(g, pts, w, rev) {
    if (rev <= 0) return; const N = 40, L = [];
    for (let i = 0; i <= N; i++) { const u = i / N * rev, a = 1 - u; L.push([a * a * a * pts[0][0] + 3 * a * a * u * pts[1][0] + 3 * a * u * u * pts[2][0] + u * u * u * pts[3][0], a * a * a * pts[0][1] + 3 * a * a * u * pts[1][1] + 3 * a * u * u * pts[2][1] + u * u * u * pts[3][1]]); }
    const path = () => { g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    path(); g.strokeStyle = OL; g.lineWidth = w + 3; g.stroke(); path(); g.strokeStyle = BLK[1]; g.lineWidth = w; g.stroke();
    // ribs: short bars across the hose, lit on the top edge
    for (let i = 1; i < L.length; i++) { const [x0, y0] = L[i - 1], [x1, y1] = L[i], dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      g.strokeStyle = OL; g.lineWidth = 1.1; g.beginPath(); g.moveTo(cx + nx * w * .5, cy + ny * w * .5); g.lineTo(cx - nx * w * .5, cy - ny * w * .5); g.stroke();
      g.strokeStyle = 'rgba(150,150,165,.55)'; g.lineWidth = .9; g.beginPath(); g.moveTo(x0 + nx * w * .42, y0 + ny * w * .42); g.lineTo(x0 + nx * w * .1, y0 + ny * w * .1); g.stroke(); }
  }
  function foot(g, x, y, dark) {   // big black boot block, toe bevel, light plate on top
    g.save(); g.translate(x, y);
    g.scale(1.2, 1.15); g.beginPath(); g.moveTo(-15, 0); g.lineTo(-15, -9); g.quadraticCurveTo(-15, -12, -11, -12); g.lineTo(8, -12); g.lineTo(21, -5); g.quadraticCurveTo(23, -3, 22, 0); g.closePath(); fillS(g, grad(g, 0, -12, 0, 0, dark ? [BLK[1], BLK[2], '#0a0a0c'] : BLK));
    g.beginPath(); g.moveTo(-6, -12); g.lineTo(-4, -17); g.lineTo(7, -17); g.lineTo(10, -12); g.closePath(); fillS(g, dark ? BLK[1] : '#55555f', 1.8);
    if (!dark) { shine(g, -11, -10.5, 18, 1.6, .8, .35); shine(g, -3, -16, 8, 1.2, .6, .4); }
    g.fillStyle = OL; g.fillRect(-15, -2.4, 37, 2.4); g.fillStyle = 'rgba(90,90,100,.5)'; for (let i = -12; i < 18; i += 5) g.fillRect(i, -5.5, 2.6, 2.2);
    g.beginPath(); g.arc(-2, -13, 4.6, 0, 7); fillS(g, grad(g, 0, -17, 0, -9, BLK), 1.6); g.beginPath(); g.arc(-2, -13, 1.6, 0, 7); g.fillStyle = '#8a8a96'; g.fill(); g.restore(); }
  function limb(g, x0, y0, x1, y1, w, dark, stripe) {   // armour segment between two joints
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); g.save(); g.translate(x0, y0); g.rotate(Math.atan2(dy, dx) - Math.PI / 2);
    rr(g, -w / 2, -3, w, L + 6, w * .32); fillS(g, grad(g, -w / 2, 0, w / 2, 0, dark ? [RED[1], RED[2], '#6e0c12'] : RED));
    
    if (!dark) shine(g, w * .12, 2, w * .16, L * .7, w * .08, .4);
    g.strokeStyle = 'rgba(20,20,24,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 3, L * .25); g.lineTo(w / 2 - 3, L * .22); g.stroke(); bolt(g, -w * .28, L * .12, 1.2); bolt(g, w * .28, L * .1, 1.2);
    g.restore(); }
  const bolt = (g, x, y, r) => { r = r || 1.5; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#7a0c12'; g.fill(); g.lineWidth = .8; g.strokeStyle = OL; g.stroke(); g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .4, 0, 7); g.fillStyle = 'rgba(255,120,120,.5)'; g.fill(); };
  const piston = (g, x0, y0, x1, y1) => { g.lineCap = 'round'; g.strokeStyle = OL; g.lineWidth = 4.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#c9ced8'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(mx, my); g.stroke(); g.strokeStyle = '#3a3a44'; g.lineWidth = 3.8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(mx, my); g.stroke(); };
  const joint = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 7); fillS(g, grad(g, x, y - r, x, y + r, BLK)); g.beginPath(); g.arc(x, y, r * .45, 0, 7); fillS(g, BLK[0], 1.4); };
  function leg(g, hx, hy, fx, fy, dark) {   // two-bone leg, knee bends forward
    const T = 31, S = 33, dx = fx - hx, dy = fy - hy, d = Math.min(T + S - .01, Math.hypot(dx, dy)), a = Math.atan2(dy, dx), k = Math.acos((T * T + d * d - S * S) / (2 * T * d)), kx = hx + Math.cos(a - k) * T, ky = hy + Math.sin(a - k) * T;
    return () => { piston(g, hx - 6, hy + 6, (kx + fx) / 2 - 8, (ky + fy) / 2 - 4); limb(g, kx, ky, fx, fy - 12, 24, dark, true); joint(g, kx, ky, 8.5); limb(g, hx, hy, kx, ky, 26, dark, false); foot(g, fx, fy, dark); };
  }
  function fist(g, x, y, dark) {
    g.save(); g.translate(x, y);
    rr(g, -9, -10, 10, 20, 3); fillS(g, grad(g, 0, -10, 0, 10, dark ? [RED[1], RED[2], '#6e0c12'] : RED));   // cuff
    rr(g, -1, -10, 17, 20, 5); fillS(g, grad(g, 0, -10, 0, 10, dark ? [BLK[1], BLK[2], '#0a0a0c'] : BLK));
    g.strokeStyle = OL; g.lineWidth = 1.5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(5, -5 + i * 5.5); g.lineTo(15, -5 + i * 5.5); g.stroke(); }
    rr(g, 2, -14, 9, 7, 3); fillS(g, dark ? BLK[1] : '#4a4a54', 1.5);   // thumb on top
    if (!dark) shine(g, 1, -8.5, 10, 1.6, .8, .35); g.restore(); }
  // arms (owner 23 Nov): ball shoulder, upper arm, elbow joint with a hydraulic piston, forearm with armoured cuff, fist; both arms built the same.
  // armPose works out the joints; the near arm's forearm is where the hose from the backpack plugs in.
  function armPose(sx, sy, a, push) {
    push = push || 0; const A = a + (1.5 - a) * push, U = 25, L = 24, bend = (.2 + Math.max(0, A) * .85) * (1 - push) + .12 * push,
      ex = sx + Math.sin(A) * U, ey = sy + Math.cos(A) * U, fa = A + bend, wx = ex + Math.sin(fa) * L, wy = ey + Math.cos(fa) * L;
    // hose socket: on the back of the forearm, 40% of the way down
    const hx = ex + (wx - ex) * .45 - Math.cos(fa) * 7, hy = ey + (wy - ey) * .45 + Math.sin(fa) * 7;
    return { sx, sy, ex, ey, wx, wy, fa, A, hx, hy };
  }
  function arm(g, P, dark) {
    const { sx, sy, ex, ey, wx, wy, fa } = P;
    piston(g, sx + Math.sin(P.A - .5) * 6, sy + Math.cos(P.A - .5) * 6, ex + Math.sin(fa) * 10 - Math.cos(fa) * 5, ey + Math.cos(fa) * 10 + Math.sin(fa) * 5);
    limb(g, sx, sy, ex, ey, 18, dark, false);
    limb(g, ex, ey, wx, wy, 18, dark, true);
    g.save(); g.translate(ex + (wx - ex) * .55, ey + (wy - ey) * .55); g.rotate(-fa); rr(g, -11, -6, 22, 12, 3); fillS(g, grad(g, -11, 0, 11, 0, dark ? [RED[1], RED[2], '#6e0c12'] : RED), 2);  g.restore();   // armoured cuff
    joint(g, ex, ey, 7.5);
    g.save(); g.translate(wx, wy); g.rotate(Math.atan2(Math.cos(fa), Math.sin(fa))); fist(g, 4, 0, dark); g.restore();
    joint(g, sx, sy, 8.5); }
  function hoseSocket(g, P) { g.beginPath(); g.arc(P.hx, P.hy, 4.6, 0, 7); fillS(g, grad(g, P.hx, P.hy - 5, P.hx, P.hy + 5, BLK), 1.6); }
  function torsoPath(g) { g.beginPath(); g.moveTo(-30, -76); g.lineTo(-33, -104); g.quadraticCurveTo(-32, -115, -20, -116); g.lineTo(18, -116); g.quadraticCurveTo(31, -115, 33, -102); g.lineTo(34, -84); g.quadraticCurveTo(33, -71, 21, -69); g.lineTo(-22, -69); g.quadraticCurveTo(-30, -69, -30, -76); g.closePath(); }
  function torso(g, half) {   // half: -1 = back half only, 1 = front half only, 0 = whole
    g.save(); if (half) { g.beginPath(); half < 0 ? g.rect(-44, -130, 46, 70) : g.rect(2, -130, 44, 70); g.clip(); }
    torsoPath(g); fillS(g, grad(g, 0, -120, 0, -72, RED), 2.4);
    g.save(); torsoPath(g); g.clip();
    g.fillStyle = '#c11a20'; g.fillRect(-34, -78, 70, 10);   // belly band

    g.strokeStyle = 'rgba(20,20,24,.75)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-2, -116); g.lineTo(-2, -80); g.moveTo(-32, -93); g.lineTo(34, -93); g.stroke();   // panel seams
    g.restore();
    rr(g, 6, -114, 24, 18, 4); g.lineWidth = 1.3; g.strokeStyle = 'rgba(20,20,24,.7)'; g.stroke(); rr(g, 7.5, -112.5, 21, 15, 3); g.strokeStyle = 'rgba(255,140,140,.45)'; g.lineWidth = .8; g.stroke();
    [[9, -111], [27, -111], [9, -99], [27, -99], [-26, -110], [-26, -84], [24, -84]].forEach(([x, y]) => bolt(g, x, y, 1.4));
    g.save(); torsoPath(g); g.clip(); for (let i = -40; i < 40; i += 6) { g.fillStyle = (i / 6) % 2 ? '#ffd21f' : '#1a1a1e'; g.beginPath(); g.moveTo(i, -69); g.lineTo(i + 3, -73.5); g.lineTo(i + 6, -73.5); g.lineTo(i + 3, -69); g.closePath(); g.fill(); } g.restore();
    vents(g, 10, -88, 14, 3, 3.8); shine(g, -24, -113, 38, 2.4, 1, .45); shine(g, 27, -108, 2.4, 20, 1, .35);
    g.beginPath(); g.arc(30, -100, 7, 0, 7); fillS(g, grad(g, 30, -107, 30, -93, BLK)); g.beginPath(); g.arc(30, -100, 3.2, 0, 7); g.fillStyle = '#0a0a0c'; g.fill();   // hose socket
    g.restore(); }
  function pack(g) {
    rr(g, -52, -128, 30, 50, 7); fillS(g, grad(g, 0, -128, 0, -78, RED)); vents(g, -46, -112, 14, 3, 4.2); vents(g, -46, -94, 14, 3, 4.2); shine(g, -49, -125, 3.2, 36, 1.6, .4);
    [[-48, -122], [-26, -122], [-48, -83], [-26, -83]].forEach(([x, y]) => bolt(g, x, y, 1.3));
    [-46, -36].forEach(x => { rr(g, x, -80, 7, 6, 2); fillS(g, grad(g, 0, -80, 0, -74, BLK), 1.4); g.beginPath(); g.ellipse(x + 3.5, -74.5, 2.4, 1, 0, 0, 7); g.fillStyle = '#050506'; g.fill(); });
    rr(g, -44, -140, 13, 14, 3); fillS(g, grad(g, 0, -140, 0, -126, BLK)); rr(g, -46, -143, 17, 5, 2); fillS(g, BLK[0], 1.6); }
  function pad(g) {   // big near shoulder pad (no white, owner 23 Nov)
    g.beginPath(); g.moveTo(-46, -98); g.quadraticCurveTo(-48, -124, -24, -126); g.quadraticCurveTo(-2, -126, -1, -106); g.quadraticCurveTo(-1, -93, -12, -91); g.lineTo(-40, -91); g.quadraticCurveTo(-46, -91, -46, -98); g.closePath(); fillS(g, grad(g, 0, -126, 0, -91, RED), 2.4);

  }
let o_blink = 0;
  function headTank(g, hero, glass) {
    // tank body with a round window (the hero's face shows through it: drawn first, the tank is cut out round it)
    const tank = () => { g.beginPath(); g.moveTo(-20, -142); g.lineTo(28, -142); g.lineTo(28, -118); g.quadraticCurveTo(28, -110, 20, -110); g.lineTo(-12, -110); g.quadraticCurveTo(-20, -110, -20, -118); g.closePath(); };
    g.save(); tank(); g.fillStyle = grad(g, -20, 0, 28, 0, ['#b3171e', '#f03036', '#a8141b']); g.fill(); g.lineWidth = 2.4; g.strokeStyle = OL; g.stroke(); g.restore();
    g.save(); tank(); g.clip(); shine(g, -6, -140, 3.5, 26, 1.8, .38); shine(g, 19, -139, 2.4, 20, 1.2, .3); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-20, -116, 48, 6);
    g.fillStyle = 'rgba(90,6,10,.55)'; g.fillRect(-20, -138, 48, 2.4); g.restore();
    [-16, 4, 24].forEach(x => bolt(g, x, -113.5, 1.2));
    // one glowing laser eye (side view) and a thin slit for a mouth (owner 23 Nov)
    const on = glass ? 1 : .25, bl = o_blink > .94 ? .25 : 1;
    g.beginPath(); g.ellipse(18, -130, 5.2, 4.2 * bl + .6, 0, 0, 7); fillS(g, '#14161c', 2);
    g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = '#ff3a2a'; g.shadowBlur = 10 * on;
    g.fillStyle = `rgba(255,70,40,${.9 * on})`; g.beginPath(); g.ellipse(19, -130, 3.2, 2.6 * bl, 0, 0, 7); g.fill();
    g.fillStyle = `rgba(255,170,90,${on})`; g.beginPath(); g.ellipse(19.6, -130.4, 1.3, 1.1 * bl, 0, 0, 7); g.fill(); g.restore();
    g.lineCap = 'round'; g.strokeStyle = OL; g.lineWidth = 2.2; g.beginPath(); g.moveTo(15, -119.5); g.lineTo(24, -119.5); g.stroke();
    // little amber power light on the side
    g.beginPath(); g.arc(-12, -126, 2.6, 0, 7); g.fillStyle = glass ? '#ffcf3a' : '#6a5a2a'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = OL; g.stroke();
  }
  function lid(g) {
    rr(g, -24, -146, 56, 7, 3); fillS(g, grad(g, 0, -146, 0, -139, BLK));   // rim
    g.beginPath(); g.moveTo(-19, -146); g.quadraticCurveTo(-18, -163, 4, -164); g.quadraticCurveTo(26, -163, 27, -146); g.closePath(); fillS(g, grad(g, 0, -159, 0, -143, ['#3c3c46', '#202026', '#101014']));
    g.strokeStyle = 'rgba(120,120,135,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-14, -150); g.quadraticCurveTo(4, -155, 22, -150); g.stroke(); g.beginPath(); g.moveTo(-10, -155); g.quadraticCurveTo(4, -159, 18, -155); g.stroke();

    // carry handle + exhaust stub
    g.lineCap = 'round'; g.strokeStyle = OL; g.lineWidth = 6; g.beginPath(); g.moveTo(-8, -161); g.quadraticCurveTo(-6, -174, 4, -174); g.quadraticCurveTo(13, -174, 14, -163); g.stroke(); g.strokeStyle = '#2e2e36'; g.lineWidth = 3.4; g.stroke();
    rr(g, 14, -170, 8, 9, 2); fillS(g, grad(g, 0, -170, 0, -161, BLK), 1.6);
  }
  const GA = 24, GST = .55, GH = 26;   // stride half-length, share of the step the foot is planted, how high the knee comes up
  window.MECH_GAIT = { A: GA, ST: GST };
  // holographic red shield held out in front (owner 23 Nov): curved hex-grid panel, bright rim, scanlines, flicker, ripple when hit
  function drawShield(g, k, t, hit) {
    const cx = 66, cy = -90, R = 96 * (.3 + .7 * k), Wd = 32 * k;
    g.save(); g.globalCompositeOperation = 'lighter';
    const shape = () => { g.beginPath(); g.ellipse(cx, cy, Wd, R, 0, -Math.PI / 2, Math.PI / 2); g.ellipse(cx - Wd * .55, cy, Wd * .45, R, 0, Math.PI / 2, -Math.PI / 2, true); g.closePath(); };
    const fl = .85 + Math.sin(t * 40) * .06 + Math.random() * .06, a = k * fl * (1 + hit * .8);
    shape(); const q = g.createLinearGradient(cx - Wd, 0, cx + Wd, 0); q.addColorStop(0, `rgba(255,30,30,${.16 * a})`); q.addColorStop(.65, `rgba(255,50,40,${.42 * a})`); q.addColorStop(1, `rgba(255,150,130,${.7 * a})`); g.fillStyle = q; g.fill();
    g.save(); shape(); g.clip();
    g.strokeStyle = `rgba(255,140,125,${.6 * a})`; g.lineWidth = 1; const hs = 7.5;   // hex grid
    for (let row = -16; row <= 16; row++) for (let col = -3; col <= 3; col++) { const hx = cx + col * hs * 1.5, hy = cy + row * hs * .87 + (col % 2 ? hs * .43 : 0) + ((t * 18) % (hs * .87)); g.beginPath(); for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](hx + Math.cos(an) * hs * .5, hy + Math.sin(an) * hs * .5); } g.closePath(); g.stroke(); }
    g.fillStyle = `rgba(255,200,190,${.12 * a})`; for (let y = cy - R; y < cy + R; y += 4) g.fillRect(cx - Wd, y + ((t * 30) % 4), Wd * 2, 1);   // scanlines
    if (hit > 0) { const rq = g.createRadialGradient(cx + Wd * .5, cy, 0, cx + Wd * .5, cy, R); rq.addColorStop(0, `rgba(255,230,220,${.6 * hit})`); rq.addColorStop(1, 'rgba(255,80,60,0)'); g.fillStyle = rq; g.fillRect(cx - Wd, cy - R, Wd * 2, R * 2); }
    g.restore();
    g.shadowColor = '#ff2020'; g.shadowBlur = 18; g.strokeStyle = `rgba(255,170,160,${a})`; g.lineWidth = 3.2; g.beginPath(); g.ellipse(cx, cy, Wd, R, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.lineWidth = 1.2; g.strokeStyle = `rgba(255,90,80,${.7 * a})`; g.beginPath(); g.ellipse(cx - Wd * .55, cy, Wd * .45, R, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.restore(); }
  window.drawMech = function (g, o) {
    const su = o.su == null ? 1 : o.su, built = su >= 1, ph = o.ph || 0, air = o.air || 0, bob = o.bob || 0;
    const prog = k => { const p = P[k]; return Math.max(0, Math.min(1, (su - p[1]) / (p[2] - p[1]))); };
    const at = (k, f) => { const p = prog(k); if (p <= 0) return; const e = ease(p), q = P[k]; g.save();
      const L = LOCK[k]; g.translate(q[3] * (1 - e), q[4] * (1 - e)); g.translate(L[0], L[1]); g.rotate(q[5] * (1 - e)); g.translate(-L[0], -L[1]);
      if (p < 1) g.globalAlpha = Math.min(1, p * 4); f(); g.restore(); };
    g.save(); g.lineJoin = 'round';
    // walking: feet step in turn (each foot plants and slides back with the street), body bobs on each step
    o_blink = o.blink || 0; const tuck = air;
    const gait = (u) => { u = ((u % 1) + 1) % 1; if (u < GST) return [GA - 2 * GA * u / GST, 0]; const q = (u - GST) / (1 - GST), e = q * q * (3 - 2 * q); return [-GA + 2 * GA * e, -Math.sin(Math.PI * q) * GH * (1 - .35 * q)]; };
    const [rx, ry] = gait(ph + .5), [fx2, fy2] = gait(ph);
    const fRx = -9 + rx * (1 - tuck), fRy = ry * (1 - tuck) - tuck * 14, fFx = 9 + fx2 * (1 - tuck), fFy = fy2 * (1 - tuck) - tuck * 8;
    const by = built ? bob : 0, aw = Math.sin(ph * Math.PI * 2) * (1 - tuck);   // arms swing with the steps
    if (o.thr) { g.save(); g.globalCompositeOperation = 'lighter'; [[fRx, fRy], [fFx, fFy]].forEach(([x, y]) => { const L = 22 + Math.random() * 12, q = g.createLinearGradient(0, y, 0, y + L); q.addColorStop(0, 'rgba(255,255,235,.95)'); q.addColorStop(.35, 'rgba(120,200,255,.8)'); q.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = q; g.beginPath(); g.moveTo(x - 7, y); g.quadraticCurveTo(x - 4, y + L * .6, x + 3, y + L); g.quadraticCurveTo(x + 8, y + L * .6, x + 11, y); g.closePath(); g.fill(); }); g.restore(); }
    // back parts (behind the hero)
    g.save(); g.translate(0, by);
    if (su > P.feet[1]) { const legR = leg(g, -10, -70, fRx, fRy - by, true); at('feet', () => { if (prog('shins') <= 0) foot(g, fRx, fRy - by, true); }); at('shins', () => legR()); }
    const PR = armPose(8, -106, -rx / GA * .55 * (1 - tuck) - tuck * .5, 0), PF = armPose(-22, -104, -fx2 / GA * .6 * (1 - tuck) - tuck * .6, o.push || 0);
    at('armR', () => arm(g, PR, true));
    at('pack', () => pack(g));
    g.restore();
    // the hero, standing inside; parts close round him
    if (o.hero) { g.save(); g.translate(0, by); o.hero(g, su); g.restore(); }
    g.save(); g.translate(0, by);
    if (su > P.feet[1]) { const legF = leg(g, 12, -70, fFx, fFy - by, false); at('feet', () => { if (prog('shins') <= 0) foot(g, fFx, fFy - by, false); }); at('shins', () => legF()); }
    at('pelvis', () => { rr(g, -26, -80, 50, 14, 5); fillS(g, grad(g, 0, -80, 0, -66, BLK));  });
    if (built) torso(g, 0); else { at('back', () => torso(g, -1)); at('chest', () => torso(g, 1)); }
    at('head', () => headTank(g, o.hero, built || prog('lid') > .5));
    at('lid', () => lid(g));
    if (su > P.hose[1]) hose(g, [[28, -122], [44, -122], [44, -100], [32, -100]], 7, prog('hose'));
    // hose from the top of the backpack loops out behind and plugs into the near forearm, so it follows the arm
    const hp = () => [[-38, -143], [-78, -156], [PF.hx - 46 - Math.max(0, PF.hx + 20) * .4, PF.hy + 26], [PF.hx, PF.hy]];
    if (su > P.hose[1]) hose(g, hp(), 8, prog('hose'));
    at('armF', () => { arm(g, PF, false); hoseSocket(g, PF); });
    if (su > P.hose[1] && prog('hose') >= 1) { g.save(); g.beginPath(); g.arc(PF.hx, PF.hy, 9, 0, 7); g.clip(); hose(g, hp(), 8, 1); g.restore(); hoseSocket(g, PF); }
    at('pad', () => pad(g));
    if (o.cat && su >= 1) o.cat(g);   // Billi lying on the shoulder pad (owner 23 Nov)
    g.restore();
    if (o.shield > 0) drawShield(g, o.shield, o.t || 0, o.hit || 0);
    // power-on flash at the end of the suit-up
    if (su > .94 && su < 1.12) { const a = 1 - Math.abs(su - 1.02) / .1; g.save(); g.globalCompositeOperation = 'lighter'; const q = g.createRadialGradient(10, -110, 0, 10, -110, 90); q.addColorStop(0, `rgba(255,240,200,${.7 * a})`); q.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = q; g.beginPath(); g.arc(10, -110, 90, 0, 7); g.fill(); g.restore(); }
    g.restore();
  };
})();
