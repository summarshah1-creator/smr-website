/* Jummah Dash HD buildings: the same Luton landmarks as Flappy Kabootar (same footprint, layout, colours and every
   owner rule), redrawn with roughly 2x the detail (features down to half a unit) from the owner's reference photos.
   HD[key](c, x, G) draws in Flappy's unscaled units; SCALE and the moving parts (LM_ANIM) are applied by the game. */
(function () {
const HD = window.LANDMARKS_HD = {};
const LINE = '#4a4338';
const HDIMG = {}; window.HD_READY = Promise.all([['foodbank', 'hd/foodbank.png']].map(([k, src]) => new Promise(res => { const im = new Image(); im.onload = () => { HDIMG[k] = im; res(); }; im.onerror = res; im.src = src; })));
const lg = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
const rect = (c, fill, x, y, w, h, stroke, lw = .45) => { c.fillStyle = fill; c.fillRect(x, y, w, h); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); } };
const poly = (c, fill, pts, stroke, lw = .45) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } };
const line = (c, col, lw, pts) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); };
// a white-painted Georgian sash window in a stone surround, glass reflecting the sky
const sash = (c, x, y, w, h, o = {}) => {
  const ST = o.stone || '#efe9da';
  rect(c, ST, x - 1.2, y - 1.2, w + 2.4, h + 2.2, LINE, .35);                                 // architrave
  rect(c, 'rgba(0,0,0,.10)', x - 1.2, y + h + 1, w + 2.4, .6);
  if (o.key) poly(c, ST, [[x + w / 2 - 1.4, y - 1.2], [x + w / 2 + 1.4, y - 1.2], [x + w / 2 + 1, y + 1], [x + w / 2 - 1, y + 1]], LINE, .3);
  c.fillStyle = lg(c, x, y, x + w * .4, y + h, [[0, '#cfe0ee'], [.45, '#7f9fba'], [1, '#3f5a72']]); c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(x + w * .15, y + h); c.lineTo(x + w * .55, y); c.lineTo(x + w * .75, y); c.lineTo(x + w * .35, y + h); c.fill();
  c.strokeStyle = '#fbfaf6'; c.lineWidth = .7; c.strokeRect(x + .35, y + .35, w - .7, h - .7);  // sash frame
  line(c, '#fbfaf6', .8, [[x, y + h * .5], [x + w, y + h * .5]]);                             // meeting rail
  c.lineWidth = .32; for (const fx of [1 / 3, 2 / 3]) line(c, '#f4f2ec', .32, [[x + w * fx, y], [x + w * fx, y + h]]);
  for (const fy of [.25, .75]) line(c, '#f4f2ec', .32, [[x, y + h * fy], [x + w, y + h * fy]]);
  rect(c, ST, x - 1.6, y + h + .6, w + 3.2, 1.4, LINE, .3);                                   // sill
};


// ---------- shared HD kit (units = Flappy units; features down to ~.3 units) ----------
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`; };
// brick wall: base colour, stretcher bond (2.1 x .72), some bricks lighter/darker, thin pale mortar, soft top light
const brick = (c, x, y, w, h, base, o = {}) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = base; c.fillRect(x, y, w, h);
  const bh = o.bh || .78, bw = o.bw || 2.2;
  for (let yy = y, r = 0; yy < y + h; yy += bh, r++) for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) { const v = rnd(); if (v < .22) { c.fillStyle = v < .11 ? 'rgba(255,230,210,.13)' : 'rgba(40,10,0,.14)'; c.fillRect(xx, yy, bw, bh); } }
  c.beginPath(); for (let yy = y + bh; yy < y + h; yy += bh) { c.moveTo(x, yy); c.lineTo(x + w, yy); }
  for (let yy = y, r = 0; yy < y + h; yy += bh, r++) for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) { c.moveTo(xx, yy); c.lineTo(xx, yy + bh); }
  c.strokeStyle = o.mortar || 'rgba(235,215,195,.38)'; c.lineWidth = .17; c.stroke();
  c.fillStyle = lg(c, 0, y, 0, y + h, [[0, 'rgba(255,240,220,.10)'], [1, 'rgba(30,10,10,.12)']]); c.fillRect(x, y, w, h);
  c.restore();
};
// arched window: frame colour, glass with sky gradient + streak, glazing bars
const archWin = (c, x, y, w, h, o = {}) => {
  const r = w / 2, fr = o.frame || '#f4f2ec';
  c.beginPath(); c.moveTo(x - .6, y + h + .4); c.lineTo(x - .6, y + r); c.arc(x + r, y + r, r + .6, Math.PI, 0); c.lineTo(x + w + .6, y + h + .4); c.closePath(); c.fillStyle = o.surround || 'rgba(0,0,0,.25)'; c.fill();
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + r); c.arc(x + r, y + r, r, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath();
  c.fillStyle = lg(c, x, y, x + w * .5, y + h, [[0, o.g0 || '#dbe9ef'], [.5, o.g1 || '#93aeb8'], [1, o.g2 || '#4e6670']]); c.fill(); c.strokeStyle = fr; c.lineWidth = .55; c.stroke();
  c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x + w * .1, y + h); c.lineTo(x + w * .6, y); c.lineTo(x + w * .85, y); c.lineTo(x + w * .35, y + h); c.fill(); c.restore();
  line(c, fr, .35, [[x + r, y + .4], [x + r, y + h]]); line(c, fr, .35, [[x, y + r + (h - r) * .45], [x + w, y + r + (h - r) * .45]]);
  if (o.sill !== false) rect(c, o.sillCol || '#e8e0cf', x - 1, y + h, w + 2, .9, 'rgba(0,0,0,.35)', .2);
};
const txt = (c, s, x, y, px, col, o = {}) => { c.save(); c.font = `${o.w || 700} ${px}px ${o.f || 'Mont, Arial, sans-serif'}`; c.textAlign = o.a || 'center'; c.textBaseline = 'middle'; if (o.ls) c.letterSpacing = o.ls + 'px';
  if (o.rtl) c.direction = 'rtl'; if (o.sh) { c.fillStyle = o.sh; c.fillText(s, x + px * .06, y + px * .06); } c.fillStyle = col; c.fillText(s, x, y); c.restore(); };
const tree = (c, x, G, s, o = {}) => {   // rounded leafy crown, 3 tones, trunk
  const L0 = o.d || '#3f6f34', L1 = o.m || '#5a9142', L2 = o.l || '#8cc263';
  poly(c, '#6b4a33', [[x - 1.6 * s, G], [x + 1.6 * s, G], [x + 1 * s, G - 14 * s], [x - 1 * s, G - 14 * s]]);
  const B = [[0, -24, 10], [-8, -19, 7.5], [8, -19, 7.5], [-4, -30, 7], [5, -29, 7], [0, -15, 7]];
  for (const [dx, dy, r] of B) { c.beginPath(); c.arc(x + dx * s, G + dy * s, r * s, 0, 7); c.fillStyle = L0; c.fill(); }
  for (const [dx, dy, r] of B) { c.beginPath(); c.arc(x + (dx + 1) * s, G + (dy - 1.2) * s, r * .8 * s, 0, 7); c.fillStyle = L1; c.fill(); }
  for (const [dx, dy, r] of B) { c.beginPath(); c.arc(x + (dx + 2) * s, G + (dy - 2.6) * s, r * .38 * s, 0, 7); c.fillStyle = L2; c.fill(); }
};
const railing = (c, x, y, w, h, o = {}) => { c.save(); rect(c, o.col || '#1e1e22', x, y, w, .7); rect(c, o.col || '#1e1e22', x, y + h - 1.6, w, .5);
  for (let xx = x + .8; xx < x + w; xx += o.gap || 1.6) { rect(c, o.col || '#1e1e22', xx, y, .38, h); if (o.tips) { c.beginPath(); c.moveTo(xx - .3, y); c.lineTo(xx + .19, y - 1.1); c.lineTo(xx + .68, y); c.fillStyle = o.tips; c.fill(); } } c.restore(); };
const person = (c, x, G, top, legs, skin = '#c58c5c', head) => {   // small figure on the far pavement
  rect(c, legs || '#2a2a33', x - 1.3, G - 6.5, 1.1, 6.5); rect(c, legs || '#2a2a33', x + .2, G - 6.5, 1.1, 6.5);
  c.beginPath(); c.moveTo(x - 2.2, G - 6); c.lineTo(x - 1.8, G - 12.5); c.quadraticCurveTo(x, G - 13.6, x + 1.8, G - 12.5); c.lineTo(x + 2.2, G - 6); c.closePath(); c.fillStyle = top; c.fill();
  c.beginPath(); c.arc(x, G - 14.8, 1.6, 0, 7); c.fillStyle = skin; c.fill(); if (head) { c.beginPath(); c.arc(x, G - 15.3, 1.65, Math.PI, 0); c.fillStyle = head; c.fill(); } };

HD.townhall = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const ST = '#efe9da', SD = '#d6cdb7', SDD = '#bcb19a';
  // --- copper-green mansard roof with dormers
  poly(c, lg(c, 0, G - 114, 0, G - 92, [[0, '#7fbca6'], [.5, '#5f9e8a'], [1, '#4d8574']]), [[x + 3, G - 92], [x + 7, G - 114], [x + 193, G - 114], [x + 197, G - 92]], LINE, .5);
  for (let i = 0; i < 64; i++) { const sx = x + 8 + i * 2.9; line(c, i % 3 ? 'rgba(170,230,205,.22)' : 'rgba(40,80,70,.25)', .35, [[sx, G - 113.5], [sx - .9, G - 92.5]]); }
  rect(c, '#3f6f62', x + 6, G - 115, 188, 1.4, LINE, .3);
  for (let i = 0; i < 9; i++) { const wx = x + 10 + i * 21;
    poly(c, '#5f9e8a', [[wx - 1.5, G - 95], [wx - 1.5, G - 109], [wx + 5, G - 112], [wx + 11.5, G - 109], [wx + 11.5, G - 95]], LINE, .4);
    c.fillStyle = lg(c, wx, G - 108, wx + 6, G - 96, [[0, '#b9d2e0'], [1, '#3c5566']]); c.fillRect(wx, G - 108, 10, 12);
    c.strokeStyle = '#2f4f46'; c.lineWidth = .7; c.strokeRect(wx + .35, G - 107.65, 9.3, 11.3); line(c, '#2f4f46', .45, [[wx + 5, G - 108], [wx + 5, G - 96]]); line(c, '#2f4f46', .45, [[wx, G - 102], [wx + 10, G - 102]]); }
  // --- cornice and the stone body
  rect(c, ST, x - 1, G - 94, 202, 3.2, LINE, .4); for (let i = 0; i < 100; i++) rect(c, 'rgba(90,80,60,.28)', x + i * 2 + .4, G - 90.8, 1, .9);
  c.fillStyle = lg(c, 0, G - 90, 0, G, [[0, '#f1ebdd'], [1, '#e2d8c2']]); c.fillRect(x, G - 90, 200, 90);
  c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + .2, G - 90, 199.6, 90);
  c.strokeStyle = 'rgba(120,105,80,.16)'; c.lineWidth = .3;                                   // ashlar blocks
  for (let y = G - 84, r = 0; y < G - 30; y += 5.5, r++) { line(c, 'rgba(120,105,80,.16)', .3, [[x + 1, y], [x + 199, y]]); for (let bx = x + (r % 2 ? 6 : 0); bx < x + 200; bx += 12) line(c, 'rgba(120,105,80,.12)', .3, [[bx, y], [bx, y + 5.5]]); }
  rect(c, SD, x, G - 31, 200, 1.6);                                                            // band over the rusticated ground floor
  for (let y = G - 27; y < G - 1; y += 4) { rect(c, 'rgba(110,95,70,.30)', x + 1, y, 198, .6); rect(c, 'rgba(255,255,255,.35)', x + 1, y + .6, 198, .35); }
  rect(c, 'rgba(0,0,0,.08)', x + 186, G - 90, 14, 90);                                         // end bay a touch in shade
  // --- windows: 3 rows x 9 bays, leaving the middle for the tower and portico
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const wx = x + 8 + i * 21; if (wx > x + 78 && wx < x + 114) continue; sash(c, wx, G - 84 + r * 26, 10, 16, { key: r === 0 }); }
  // --- clock tower: stepped base, shaft with corner piers and a long recessed panel, clock, louvred belfry, chamfered cap
  rect(c, ST, x + 80, G - 102, 40, 10, LINE, .45); rect(c, SD, x + 80, G - 93.5, 40, 1.4); rect(c, ST, x + 83, G - 108, 34, 6, LINE, .45);
  c.fillStyle = lg(c, x + 85, 0, x + 115, 0, [[0, '#d9d0bb'], [.25, '#f3eee2'], [.75, '#ece5d4'], [1, '#d2c8b1']]); c.fillRect(x + 85, G - 172, 30, 64); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 85.2, G - 172, 29.6, 64);
  rect(c, SD, x + 85, G - 172, 3, 64); rect(c, SDD, x + 112, G - 172, 3, 64); line(c, 'rgba(255,255,255,.7)', .5, [[x + 89, G - 172], [x + 89, G - 108]]);
  for (let y = G - 170; y < G - 108; y += 6) line(c, 'rgba(120,105,80,.18)', .3, [[x + 88, y], [x + 112, y]]);
  rect(c, '#ddd4bf', x + 97, G - 143, 6, 34, LINE, .3); rect(c, '#c7bca4', x + 98.2, G - 142, 1, 32); rect(c, '#c7bca4', x + 100.8, G - 142, 1, 32);   // recessed panel
  rect(c, ST, x + 96, G - 112, 8, 4, LINE, .35);
  rect(c, ST, x + 82, G - 176, 36, 5, LINE, .45); rect(c, SD, x + 82, G - 172, 36, 1);
  rect(c, ST, x + 93, G - 168, 14, 4, LINE, .35); rect(c, 'rgba(0,0,0,.12)', x + 93, G - 164, 14, .8);   // hood over the clock
  // clock: gold ring, stone face, 12 ticks (hands are drawn live on top)
  c.beginPath(); c.arc(x + 100, G - 152, 8.3, 0, 7); c.fillStyle = lg(c, x + 92, G - 160, x + 108, G - 144, [[0, '#ffe9a0'], [.5, '#d4ad3a'], [1, '#9c7a22']]); c.fill(); c.strokeStyle = LINE; c.lineWidth = .4; c.stroke();
  c.beginPath(); c.arc(x + 100, G - 152, 6.6, 0, 7); c.fillStyle = '#f6f1e4'; c.fill(); c.strokeStyle = '#b8953a'; c.lineWidth = .35; c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r0 = i % 3 ? 5.4 : 4.8; line(c, '#4a3a1a', i % 3 ? .35 : .6, [[x + 100 + Math.sin(a) * r0, G - 152 - Math.cos(a) * r0], [x + 100 + Math.sin(a) * 6.1, G - 152 - Math.cos(a) * 6.1]]); }
  // belfry with louvres
  c.fillStyle = lg(c, x + 89, 0, x + 111, 0, [[0, '#d9d0bb'], [.3, '#f3eee2'], [1, '#d4cab3']]); c.fillRect(x + 89, G - 202, 22, 26); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 89.2, G - 202, 21.6, 26);
  rect(c, '#5d574a', x + 95, G - 198, 10, 16, LINE, .35); for (let j = 0; j < 7; j++) { rect(c, '#bfb39a', x + 95.4, G - 197.3 + j * 2.2, 9.2, 1.1); rect(c, 'rgba(0,0,0,.25)', x + 95.4, G - 196.2 + j * 2.2, 9.2, .4); }
  rect(c, ST, x + 93, G - 182, 14, 3, LINE, .35);
  // chamfered cap, drum and finial
  poly(c, lg(c, x + 88, 0, x + 112, 0, [[0, '#d9d0bb'], [.4, '#f4efe3'], [1, '#d2c8b1']]), [[x + 88, G - 202], [x + 112, G - 202], [x + 110, G - 210], [x + 107, G - 213], [x + 93, G - 213], [x + 90, G - 210]], LINE, .45);
  line(c, SD, .6, [[x + 89, G - 206], [x + 111, G - 206]]);
  rect(c, '#f4f2ee', x + 97.5, G - 218, 5, 5, LINE, .35); c.beginPath(); c.arc(x + 100, G - 219.5, 1.3, 0, 7); c.fillStyle = '#f4f2ee'; c.fill(); c.stroke();
  // --- entrance portico: pediment, four fluted columns, dark recess, panelled door with a fanlight, steps
  rect(c, '#6e6658', x + 79, G - 52, 42, 46);
  c.fillStyle = lg(c, 0, G - 54, 0, G - 24, [[0, '#3f3a33'], [1, '#5c5548']]); c.fillRect(x + 80, G - 52, 40, 30);
  poly(c, ST, [[x + 74, G - 53], [x + 100, G - 67], [x + 126, G - 53]], LINE, .5); poly(c, '#e2d9c4', [[x + 80, G - 54.5], [x + 100, G - 64.5], [x + 120, G - 54.5]]);
  rect(c, ST, x + 75, G - 55, 50, 2.8, LINE, .4); for (let i = 0; i < 24; i++) rect(c, 'rgba(90,80,60,.25)', x + 76 + i * 2, G - 52.2, 1, .8);
  rect(c, '#2e2924', x + 93, G - 31, 14, 24); c.beginPath(); c.arc(x + 100, G - 31, 7, Math.PI, 0); c.fillStyle = '#2e2924'; c.fill();
  c.beginPath(); c.arc(x + 100, G - 31, 6, Math.PI, 0); c.fillStyle = lg(c, x + 94, G - 37, x + 106, G - 31, [[0, '#cfe0ee'], [1, '#55718a']]); c.fill();
  for (let i = 1; i < 5; i++) { const a = Math.PI + i * Math.PI / 5; line(c, '#f4f2ec', .3, [[x + 100, G - 31], [x + 100 + Math.cos(a) * 6, G - 31 + Math.sin(a) * 6]]); }
  c.fillStyle = lg(c, x + 94, 0, x + 106, 0, [[0, '#7a3f22'], [.5, '#9a5530'], [1, '#6c381e']]); c.fillRect(x + 94, G - 30, 12, 23);
  c.strokeStyle = 'rgba(40,20,10,.6)'; c.lineWidth = .35; [[95, -29], [101, -29], [95, -18], [101, -18]].forEach(([dx, dy]) => c.strokeRect(x + dx, G + dy, 4, 9)); line(c, '#3a1e10', .5, [[x + 100, G - 30], [x + 100, G - 7]]);
  rect(c, '#d9b44a', x + 98.6, G - 19, .8, 1.6);
  for (let i = 0; i < 4; i++) { const cx = x + 82 + i * 11;
    rect(c, ST, cx - .8, G - 51.6, 5.6, 2, LINE, .3);                                       // capital
    c.fillStyle = lg(c, cx, 0, cx + 4, 0, [[0, '#d8cfba'], [.4, '#fbf8f1'], [1, '#cfc5ae']]); c.fillRect(cx, G - 49.6, 4, 40.6); c.strokeStyle = LINE; c.lineWidth = .35; c.strokeRect(cx, G - 49.6, 4, 40.6);
    for (const f of [1, 2, 3]) line(c, 'rgba(120,105,80,.35)', .25, [[cx + f, G - 49], [cx + f, G - 9.4]]);
    rect(c, ST, cx - .8, G - 9, 5.6, 2, LINE, .3); }
  for (let s = 0; s < 3; s++) rect(c, s % 2 ? '#e2d9c4' : '#ece5d5', x + 76 - s * 2, G - 7 + s * 2.3, 48 + s * 4, 2.4, LINE, .3);
  // --- flower beds along the front
  for (const fx of [x + 20, x + 128]) { rect(c, '#8a8070', fx, G - 4, 44, 4, LINE, .35); for (let i = 0; i < 26; i++) { const px = fx + 1.5 + i * 1.6; c.fillStyle = '#3f7a3a'; c.beginPath(); c.arc(px, G - 4.4, 1.1, 0, 7); c.fill(); c.fillStyle = ['#e0453a', '#f2c230', '#f07aa0', '#ffffff'][i % 4]; c.beginPath(); c.arc(px + .3, G - 5.3, .55, 0, 7); c.fill(); } }
  // --- war memorial: plinth with inscription, bronze robed figure holding up a palm frond, shield at her side
  { const sx = x + 160, B = '#2f3b37', HI = '#6c9c8b', MID = '#45584f';
    rect(c, '#cfc8b7', sx - 13, G - 30, 26, 30, LINE, .4); rect(c, '#bdb6a5', sx - 13, G - 10, 26, 2);
    rect(c, '#e2dbcb', sx - 16, G - 35, 32, 6, LINE, .4); rect(c, '#e2dbcb', sx - 16, G - 4, 32, 4, LINE, .4);
    for (let i = 0; i < 4; i++) rect(c, 'rgba(80,70,55,.35)', sx - 8, G - 26 + i * 2.6, 16, .5);
    rect(c, '#c9a64a', sx - 6, G - 15.5, 12, 3, LINE, .25); rect(c, '#3e4c47', sx - 10, G - 39, 20, 4, LINE, .35);
    c.fillStyle = lg(c, sx - 8, 0, sx + 7, 0, [[0, B], [.45, MID], [1, B]]);
    c.beginPath(); c.moveTo(sx - 8, G - 39); c.lineTo(sx + 7, G - 39); c.quadraticCurveTo(sx + 6, G - 50, sx + 5, G - 62); c.quadraticCurveTo(sx + 3, G - 66.5, sx - 1, G - 66.5); c.quadraticCurveTo(sx - 5, G - 64, sx - 5, G - 58); c.quadraticCurveTo(sx - 6, G - 48, sx - 8, G - 39); c.fill(); c.strokeStyle = '#1e2624'; c.lineWidth = .4; c.stroke();
    for (const fx of [-3, 0, 3]) line(c, 'rgba(140,190,170,.5)', .35, [[sx + fx, G - 62], [sx + fx * 1.2, G - 40]]);
    c.fillStyle = B; c.beginPath(); c.moveTo(sx - 4, G - 64); c.lineTo(sx - 2, G - 66); c.lineTo(sx - 8, G - 84); c.lineTo(sx - 10, G - 83); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.arc(sx, G - 70, 3.4, 0, 7); c.fillStyle = MID; c.fill(); c.stroke(); line(c, HI, .4, [[sx - 2, G - 72], [sx + 1, G - 72.5]]);
    line(c, '#3e5a50', .8, [[sx - 9, G - 96], [sx - 9, G - 83]]); for (let i = 0; i < 6; i++) { line(c, HI, .45, [[sx - 9, G - 95 + i * 2], [sx - 13 + i * .5, G - 97 + i * 2.2]]); line(c, HI, .45, [[sx - 9, G - 95 + i * 2], [sx - 5 - i * .5, G - 97 + i * 2.2]]); }
    poly(c, MID, [[sx + 4, G - 62], [sx + 11, G - 64], [sx + 11, G - 48], [sx + 8, G - 44], [sx + 4, G - 48]], '#1e2624', .4); line(c, HI, .4, [[sx + 9.5, G - 62], [sx + 9.5, G - 48]]); }
  // --- flag poles (the Luton flags wave in LM_ANIM.townhall)
  for (const fx of [x + 40, x + 168]) { rect(c, '#e6e6e6', fx, G - 148, 1, 54); rect(c, 'rgba(0,0,0,.18)', fx + .6, G - 148, .4, 54); c.beginPath(); c.arc(fx + .5, G - 148.6, .9, 0, 7); c.fillStyle = '#d4ad3a'; c.fill(); }
  c.restore();
};

// Luton Central Mosque (WIDEN: 320 wide, the original sits at +50). Owner rules: tall front block with its own green name
// board + main entrance through open gates; dome hall; minaret at the end; signs crisp; tree + people out front.
HD.masjid = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const X = x + 50, B = '#b9503d', B2 = '#a8442f', TW = 130;
  // dome (behind everything): copper-green with a soft highlight and a gold crescent finial
  c.beginPath(); c.arc(X + 192, G - 100, 43, Math.PI, 0); c.closePath(); c.fillStyle = lg(c, X + 150, G - 143, X + 230, G - 100, [[0, '#9cc09a'], [.35, '#6f9a6a'], [1, '#4a7048']]); c.fill(); c.strokeStyle = LINE; c.lineWidth = .5; c.stroke();
  for (let i = 1; i < 36; i++) { const a = Math.PI + i * Math.PI / 36, bx = X + 192 + Math.cos(a) * 43, by = G - 100;   // copper seams rising from the rim to the top
    c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(X + 192 + Math.cos(a) * 30, G - 100 - 30, X + 192 + Math.cos(a) * 3, G - 142.4); c.strokeStyle = i % 2 ? 'rgba(30,60,30,.28)' : 'rgba(200,235,200,.22)'; c.lineWidth = .28; c.stroke(); }
  for (let k = 1; k < 5; k++) { c.beginPath(); c.ellipse(X + 192, G - 100, 43 * Math.cos(k * .3), 6, 0, Math.PI, 2 * Math.PI); c.strokeStyle = 'rgba(30,60,30,.12)'; c.lineWidth = .25; }
  rect(c, '#d7c79a', X + 189, G - 104, 6, 4, LINE, .3);
  rect(c, '#e8e0cf', X + 191.3, G - 156, 1.4, 14); c.beginPath(); c.arc(X + 192, G - 159, 3, 0, 7); c.fillStyle = '#d9b44a'; c.fill(); c.beginPath(); c.arc(X + 193.2, G - 159.6, 2.5, 0, 7); c.fillStyle = '#9cc4e8'; c.fill();
  // front block (continues left over the widening) with tall arched recesses
  brick(c, x, G - 120, 50 + TW, 120, B); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x + .25, G - 120, 50 + TW - .5, 120);
  rect(c, shade(B, 1.15), x, G - 121, 50 + TW, 2.6, LINE, .35);
  const AR = [], aN = 9, aStep = (50 + TW - 10) / aN; for (let i = 0; i < aN; i++) AR.push(x + 5 + i * aStep + (aStep - 14) / 2);   // evenly spaced from one end of the block to the other
  for (const rx of AR) {
    c.beginPath(); c.moveTo(rx, G - 26); c.lineTo(rx, G - 92); c.arc(rx + 7, G - 92, 7, Math.PI, 0); c.lineTo(rx + 14, G - 26); c.closePath(); c.fillStyle = 'rgba(60,15,5,.30)'; c.fill();
    c.save(); c.clip(); brick(c, rx, G - 99, 14, 74, shade(B, .86)); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(rx, G - 99, 2, 74); c.restore();
    line(c, 'rgba(255,220,200,.35)', .4, [[rx + 14.2, G - 92], [rx + 14.2, G - 26]]); rect(c, shade(B, .72), rx - .5, G - 26, 15, 1.4); }
  // green name board with the two round plaques either side (as on the building)
  rect(c, 'rgba(0,0,0,.25)', X + 3.8, G - 117, 116, 18);   // signboard: shadow, thick frame, inner panel, fixings
  rect(c, '#0f3a2b', X + 2, G - 119, 118, 19); rect(c, '#1d5a43', X + 3.6, G - 117.4, 114.8, 15.8); c.strokeStyle = '#e8dcc0'; c.lineWidth = .45; c.strokeRect(X + 4.6, G - 116.4, 112.8, 13.8);
  rect(c, 'rgba(255,255,255,.10)', X + 3.6, G - 117.4, 114.8, 3);
  for (const [fx, fy] of [[X + 5.6, G - 115.4], [X + 116.4, G - 115.4], [X + 5.6, G - 104.2], [X + 116.4, G - 104.2]]) { c.beginPath(); c.arc(fx, fy, .45, 0, 7); c.fillStyle = '#c9bfa5'; c.fill(); }
  txt(c, 'مرکزی جامع مسجد غوثیہ', X + 61, G - 111.6, 6, '#f4f2ec', { f: 'Amiri', rtl: 1 });
  txt(c, 'Luton Central Mosque', X + 61, G - 105.6, 4.6, '#f4f2ec', { f: 'Mont, sans-serif' });
  for (const px of [X - 9, X + 123]) { rect(c, '#1d5a43', px, G - 117, 8, 10, '#0e2e22', .4); txt(c, 'الله', px + 4, G - 112, 4, '#f4f2ec', { f: 'Amiri', rtl: 1 }); }
  // arched windows in the front block
  for (const i of [0, 2, 6, 8]) archWin(c, AR[i] + 1, G - 50, 12, 28, { frame: '#efe9dc', g0: '#d8e6e0', g1: '#9db5ab', g2: '#5b7268' });
  // main entrance: brick arch, green arched sign, light oak double doors
  { const dx = X + 61;
    c.beginPath(); c.moveTo(dx - 15, G); c.lineTo(dx - 15, G - 34); c.arc(dx, G - 34, 15, Math.PI, 0); c.lineTo(dx + 15, G); c.closePath(); c.fillStyle = shade(B, .8); c.fill();
    for (let i = 0; i < 13; i++) { const a = Math.PI + i * Math.PI / 12; line(c, 'rgba(240,210,190,.45)', .25, [[dx + Math.cos(a) * 12.5, G - 34 + Math.sin(a) * 12.5], [dx + Math.cos(a) * 15, G - 34 + Math.sin(a) * 15]]); }
    c.beginPath(); c.arc(dx, G - 34, 11.5, Math.PI, 0); c.closePath(); c.fillStyle = '#1d5a43'; c.fill(); c.strokeStyle = '#0e2e22'; c.lineWidth = .4; c.stroke();
    txt(c, 'بسم الله الرحمن الرحيم', dx, G - 38.5, 3.2, '#f4f2ec', { f: 'Amiri', rtl: 1 });
    c.fillStyle = lg(c, dx - 10, 0, dx + 10, 0, [[0, '#c99a62'], [.5, '#e2b77e'], [1, '#c3925a']]); c.fillRect(dx - 10, G - 32, 20, 32); c.strokeStyle = '#6b4a28'; c.lineWidth = .45; c.strokeRect(dx - 10, G - 32, 20, 32);
    line(c, '#6b4a28', .5, [[dx, G - 32], [dx, G]]); for (const px of [dx - 8.4, dx + 1.6]) { c.strokeStyle = 'rgba(110,70,30,.55)'; c.lineWidth = .3; c.strokeRect(px, G - 29, 6.8, 11); c.strokeRect(px, G - 16, 6.8, 13); }
    rect(c, '#9a9a9a', dx - 2, G - 17, .6, 4); rect(c, '#9a9a9a', dx + 1.4, G - 17, .6, 4); }
  // dome hall with the white shahada banner and arched windows
  brick(c, X + TW, G - 92, 120, 92, B); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(X + TW, G - 92, 120, 92);
  rect(c, 'rgba(0,0,0,.16)', X + TW, G - 92, 5, 92);   // the front block stands proud
  rect(c, '#f1efe9', X + TW + 3, G - 103, 117, 12.5, '#9aa39a', .35); rect(c, 'rgba(0,0,0,.06)', X + TW + 3, G - 93, 117, 2);
  txt(c, 'لا إله إلا الله محمد رسول الله', X + TW + 61, G - 96.8, 7.6, '#1f5a34', { f: 'Amiri', rtl: 1 });
  for (let i = 0; i < 6; i++) archWin(c, X + 135 + i * 19, G - 80, 12, 22, { frame: '#efe9dc', g0: '#d8e6e0', g1: '#9db5ab', g2: '#5b7268' });
  rect(c, shade(B, .82), X + TW, G - 52, 120, 2.4); for (let i = 0; i < 6; i++) archWin(c, X + 135 + i * 19, G - 44, 12, 16, { frame: '#efe9dc', g0: '#d8e6e0', g1: '#9db5ab', g2: '#5b7268' });
  // minaret: tall brick shaft, two corbelled bands, balcony, lantern and crescent
  brick(c, X + 250, G - 230, 14, 230, '#b4493a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(X + 250, G - 230, 14, 230);
  rect(c, 'rgba(0,0,0,.18)', X + 260, G - 230, 4, 230);
  for (const [by, bh] of [[200, 6], [140, 5]]) { rect(c, '#9a3b2e', X + 246, G - by, 22, bh, LINE, .4); for (let i = 0; i < 7; i++) rect(c, 'rgba(0,0,0,.25)', X + 247 + i * 3, G - by + bh, 1.6, 1.2); }
  rect(c, '#9a3b2e', X + 248, G - 236, 18, 6, LINE, .4); railing(c, X + 248, G - 240.5, 18, 4.5, { gap: 1.4 });
  brick(c, X + 252, G - 248, 10, 12, '#b4493a'); c.strokeStyle = LINE; c.strokeRect(X + 252, G - 248, 10, 12);
  poly(c, '#5f8f5a', [[X + 251, G - 248], [X + 257, G - 256], [X + 263, G - 248]], LINE, .4);
  rect(c, '#3a3d44', X + 256.4, G - 262, 1.2, 7); c.beginPath(); c.arc(X + 257, G - 263.5, 2, 0, 7); c.fillStyle = '#d9b44a'; c.fill(); c.beginPath(); c.arc(X + 257.9, G - 264, 1.6, 0, 7); c.fillStyle = '#9cc4e8'; c.fill();
  // front boundary: brick piers with stone caps, low brick wall, black railings with gold tips, gates open in front of the door
  for (let i = -2; i < 11; i++) { const px = X - 10 + i * 27; if (px < x - 2) continue;
    brick(c, px, G - 22, 6, 22, '#c4553f'); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(px, G - 22, 6, 22); rect(c, '#efe4d0', px - 1, G - 24, 8, 2.2, LINE, .3);
    if (i === 2) { const gx = X - 4 + 54; for (const [ax, bx] of [[gx, gx + 6], [gx + 21, gx + 15]]) { c.strokeStyle = '#1f4a34'; c.lineWidth = .6; c.beginPath(); for (const yy of [21, 12, 2]) { c.moveTo(ax, G - yy); c.lineTo(bx, G - yy + 1.2); } for (let k = 0; k <= 4; k++) { const t = k / 4; c.moveTo(ax + (bx - ax) * t, G - 21 + t * 1.2); c.lineTo(ax + (bx - ax) * t, G - 2 + t * 1.2); } c.stroke(); } continue; }
    if (i < 10 && px + 27 < x + 330) { brick(c, px + 6, G - 11, 21, 11, '#c4553f'); rect(c, '#efe4d0', px + 6, G - 12, 21, 1.2); railing(c, px + 6, G - 22, 21, 10.5, { gap: 1.7, tips: '#d9b44a' }); } }
  // tree in front of the left corner and a few people heading in
  tree(c, x + 24, G, 1.25);
  c.restore();
};

// Masjid-e-Ali: two silver clad halls, glass pyramid entrance, black wall banners with gold Arabic (never lit at night),
// alam pole with the open hand on top (the green flag waves in LM_ANIM.masjidali at x+63), shrubs, bollards
HD.masjidali = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const shed = (bx, w, h, pk) => { const pts = [[bx, G], [bx, G - h], [bx + w / 2, G - h - pk], [bx + w, G - h], [bx + w, G]];
    poly(c, lg(c, bx, 0, bx + w, 0, [[0, '#d5d8dc'], [.5, '#e4e6e9'], [1, '#c4c8cd']]), pts, LINE, .5);
    c.save(); c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip();
    for (let i = 1; i < w; i += 2.2) { rect(c, 'rgba(110,118,128,.32)', bx + i, G - h - pk, .5, h + pk); rect(c, 'rgba(255,255,255,.45)', bx + i + .5, G - h - pk, .35, h + pk); }
    c.restore(); line(c, '#f6f6f4', 1.1, [[bx - 1, G - h + .4], [bx + w / 2, G - h - pk + .4], [bx + w + 1, G - h + .4]]); line(c, '#9aa0a8', .4, [[bx - 1, G - h + 1.1], [bx + w / 2, G - h - pk + 1.1], [bx + w + 1, G - h + 1.1]]);
    rect(c, '#8d939b', bx, G - 7, w, 7); rect(c, 'rgba(0,0,0,.15)', bx, G - 8, w, 1); };
  shed(x, 160, 84, 22); shed(x + 160, 160, 84, 22);
  // wall banners: black with a gold frame and gold Arabic
  for (const [bx, txtA, px] of [[x + 8, 'لبيك يا حسين', 15], [x + 210, 'مسجد علي', 13]]) {
    rect(c, '#121214', bx, G - 66, 102, 32, '#000', .5); c.strokeStyle = 'rgba(217,176,90,.75)'; c.lineWidth = .5; c.strokeRect(bx + 2, G - 64, 98, 28);
    txt(c, txtA, bx + 51, G - 50.5, px, '#e2b864', { f: 'Amiri', rtl: 1, sh: 'rgba(0,0,0,.6)' }); }
  // glass pyramid with a mullion grid and sky reflections
  poly(c, '#26354a', [[x + 92, G], [x + 160, G - 124], [x + 228, G]], LINE, .6);
  c.save(); c.beginPath(); c.moveTo(x + 97, G); c.lineTo(x + 160, G - 116); c.lineTo(x + 223, G); c.closePath(); c.clip();
  c.fillStyle = lg(c, x + 100, G - 120, x + 200, G, [[0, '#a9cbe4'], [.35, '#6f96bb'], [.7, '#45678c'], [1, '#2c4562']]); c.fillRect(x + 92, G - 124, 136, 124);
  c.fillStyle = 'rgba(255,255,255,.26)'; c.beginPath(); c.moveTo(x + 120, G); c.lineTo(x + 150, G - 110); c.lineTo(x + 158, G - 110); c.lineTo(x + 130, G); c.fill();
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(x + 168, G); c.lineTo(x + 182, G - 60); c.lineTo(x + 186, G - 60); c.lineTo(x + 174, G); c.fill();
  for (let i = 0; i <= 17; i++) rect(c, '#2a3b52', x + 94 + i * 8, G - 124, .7, 124); for (let j = 0; j < 10; j++) rect(c, '#2a3b52', x + 92, G - 116 + j * 12, 136, .7);
  c.restore();
  rect(c, '#26354a', x + 150, G - 30, 20, 30); c.fillStyle = lg(c, x + 152, G - 28, x + 168, G, [[0, '#cfe3f0'], [1, '#5f84a6']]); c.fillRect(x + 152, G - 28, 16, 28); rect(c, '#26354a', x + 159.4, G - 28, 1.2, 28); rect(c, '#b9c2cc', x + 157.5, G - 15, .6, 4); rect(c, '#b9c2cc', x + 161.9, G - 15, .6, 4);
  // roof pole + small maroon pennant on the pyramid
  rect(c, '#6a6e76', x + 159.6, G - 160, .9, 36); c.beginPath(); c.arc(x + 160, G - 161, 2.4, 0, 7); c.fillStyle = '#d6d9de'; c.fill(); poly(c, '#6a2a50', [[x + 160.6, G - 154], [x + 170, G - 149], [x + 160.6, G - 144]], '#3a1a2a', .3);
  // planting strip, shrubs and black bollards with gold bands
  rect(c, '#9a4a36', x + 96, G - 6, 224, 6, LINE, .35);
  for (let i = 0; i < 11; i++) { if (i === 3 || i === 4) continue; const sx = x + 100 + i * 20; c.beginPath(); c.arc(sx, G - 9, 5.6, 0, 7); c.fillStyle = '#3f6f30'; c.fill(); c.beginPath(); c.arc(sx - .8, G - 10.2, 4.3, 0, 7); c.fillStyle = '#5f9a40'; c.fill(); c.beginPath(); c.arc(sx - 1.8, G - 11.6, 1.8, 0, 7); c.fillStyle = '#8cc263'; c.fill(); }
  for (const bx of [x + 136, x + 182]) { rect(c, '#1a1a1e', bx, G - 14, 4, 14, '#000', .3); rect(c, '#d9b05a', bx, G - 12, 4, 1.4); }
  // alam: stepped plinth with tiles, black pole with silver bands, ringed disc and the open hand on top
  rect(c, '#c4c7cb', x + 40, G - 10, 46, 10, LINE, .4); rect(c, '#3a3d44', x + 48, G - 16, 30, 6, LINE, .4);
  for (let i = 0; i < 6; i++) rect(c, i % 2 ? '#7fa7c4' : '#eef0f2', x + 42 + i * 7, G - 7.5, 4.6, 4.6, 'rgba(0,0,0,.3)', .2);
  const px = x + 62;
  rect(c, '#202024', px - 2, G - 40, 4, 24, '#000', .3); rect(c, '#e0458a', px - 3, G - 22, 6, 2.4); rect(c, '#e8a33c', px - 4, G - 19.4, 8, 2.4);
  for (let i = 0; i < 5; i++) { c.fillStyle = lg(c, px - 3, 0, px + 3, 0, [[0, '#a9adb4'], [.5, '#f2f3f5'], [1, '#9da1a8']]); c.fillRect(px - 3, G - 58 - i * 8, 6, 6); c.strokeStyle = '#5a5e66'; c.lineWidth = .3; c.strokeRect(px - 3, G - 58 - i * 8, 6, 6); }
  c.fillStyle = lg(c, px - 1, 0, px + 1, 0, [[0, '#9da1a8'], [.5, '#eceef1'], [1, '#9da1a8']]); c.fillRect(px - 1, G - 120, 2, 64);
  c.beginPath(); c.arc(px, G - 116, 9.6, 0, 7); c.fillStyle = lg(c, px - 9, G - 125, px + 9, G - 107, [[0, '#ffffff'], [.5, '#cfd3d8'], [1, '#9da1a8']]); c.fill(); c.strokeStyle = '#4a4e56'; c.lineWidth = .45; c.stroke();
  c.beginPath(); c.arc(px, G - 116, 6.2, 0, 7); c.strokeStyle = '#8a8e96'; c.lineWidth = .6; c.stroke();
  // open hand: palm, four fingers (middle longest), thumb angled out, a small eye in the palm
  c.save(); c.translate(px, G - 128.5);
  c.beginPath(); c.moveTo(-6.4, 6); c.lineTo(-6.6, -6.5); c.quadraticCurveTo(-6.6, -18.5, -5.2, -18.5); c.quadraticCurveTo(-3.9, -18.5, -3.9, -8);
  c.lineTo(-3.6, -20); c.quadraticCurveTo(-2.6, -21.4, -1.6, -20); c.lineTo(-1.3, -8); c.lineTo(-.8, -19.6); c.quadraticCurveTo(.2, -21, 1.2, -19.6); c.lineTo(1.4, -8);
  c.lineTo(2.1, -15.5); c.quadraticCurveTo(3.1, -16.8, 4.1, -15.5); c.lineTo(4.2, -6); c.lineTo(7.4, -10.5); c.quadraticCurveTo(9, -10.4, 8.6, -8.6); c.lineTo(6.6, -2); c.lineTo(6.4, 6); c.quadraticCurveTo(0, 8.4, -6.4, 6); c.closePath();
  c.fillStyle = lg(c, -7, 0, 8, 0, [[0, '#dfe2e6'], [.45, '#ffffff'], [1, '#c3c7cd']]); c.fill(); c.strokeStyle = '#4a4e56'; c.lineWidth = .5; c.stroke();
  for (const fx of [-5.2, -2.6, .2, 3.1]) line(c, 'rgba(120,125,135,.5)', .3, [[fx, -8.4], [fx, -6.6]]);
  c.beginPath(); c.ellipse(0, -1, 2, 1.3, 0, 0, 7); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#4a4e56'; c.lineWidth = .35; c.stroke(); c.beginPath(); c.arc(0, -1, .7, 0, 7); c.fillStyle = '#2a4a8a'; c.fill();
  c.restore();
  c.restore();
};

// Suffa-Tul-Islam Masjid, as built now (no dome): white render, dark fascia, big black pointed arch ribs, arched glass entrance
// with the black name band, low wing under a curved canopy, lawn + low brick wall, big tree at the left corner (WIDEN +44)
HD.suffa = (c, x0, G) => {
  c.save(); c.lineJoin = 'round'; const x = x0 + 44, WH = '#f4f2ed', BK = '#1c1e22';
  const render = (rx, ry, w, h) => { c.fillStyle = lg(c, rx, 0, rx + w, 0, [[0, '#f7f5f0'], [.8, '#efece5'], [1, '#e2ded6']]); c.fillRect(rx, ry, w, h); for (let yy = ry + 4; yy < ry + h; yy += 9) rect(c, 'rgba(150,140,125,.07)', rx, yy, w, .4); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(rx + .2, ry, w - .4, h); };
  const arch = (ax, w, top, base, lw) => { c.strokeStyle = BK; c.lineWidth = lw; c.lineCap = 'butt'; c.beginPath(); c.moveTo(ax, base); c.quadraticCurveTo(ax, top + (base - top) * .3, ax + w / 2, top); c.quadraticCurveTo(ax + w, top + (base - top) * .3, ax + w, base); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = lw * .2; c.beginPath(); c.moveTo(ax + lw * .25, base); c.quadraticCurveTo(ax + lw * .25, top + (base - top) * .3, ax + w / 2, top + lw * .4); c.stroke(); };
  const awin = (wx, wy, w, h) => { c.beginPath(); c.moveTo(wx, wy + h); c.lineTo(wx, wy + w * .45); c.quadraticCurveTo(wx, wy, wx + w / 2, wy - 2); c.quadraticCurveTo(wx + w, wy, wx + w, wy + w * .45); c.lineTo(wx + w, wy + h); c.closePath(); c.fillStyle = BK; c.fill();
    c.save(); c.clip(); c.fillStyle = lg(c, wx, wy, wx + w, wy + h, [[0, '#9fb0c2'], [.5, '#4a5666'], [1, '#2a3038']]); c.fillRect(wx + 1.5, wy - 1, w - 3, h); c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.moveTo(wx + 3, wy + h); c.lineTo(wx + w * .6, wy); c.lineTo(wx + w * .8, wy); c.lineTo(wx + 5, wy + h); c.fill(); c.restore(); rect(c, BK, wx + w / 2 - .4, wy - 1, .8, h); };
  // right wing under the curved canopy
  render(x + 196, G - 46, 104, 46);
  for (let i = 0; i < 4; i++) { const ox = x + 204 + i * 24; rect(c, '#22272e', ox, G - 34, 16, 30, BK, .4); c.fillStyle = lg(c, ox, G - 34, ox + 16, G - 4, [[0, '#7f90a2'], [1, '#2e3640']]); c.fillRect(ox + 1.2, G - 32.8, 13.6, 27.6); rect(c, '#22272e', ox + 7.6, G - 33, .8, 28); }
  c.fillStyle = BK; c.beginPath(); c.moveTo(x + 194, G - 52); c.quadraticCurveTo(x + 250, G - 66, x + 304, G - 54); c.lineTo(x + 304, G - 48); c.quadraticCurveTo(x + 250, G - 59, x + 194, G - 46); c.closePath(); c.fill();
  for (const ax of [x + 214, x + 262]) arch(ax, 28, G - 56, G, 3);
  // main hall
  render(x, G - 104, 200, 104); rect(c, 'rgba(0,0,0,.07)', x + 194, G - 104, 6, 104);
  rect(c, '#2b3037', x - 4, G - 112, 208, 9, BK, .4); rect(c, '#4a515b', x - 4, G - 112, 208, 1.4); for (const lx of [x + 30, x + 100, x + 170]) { c.beginPath(); c.arc(lx, G - 101.6, 1.3, 0, 7); c.fillStyle = '#fff6d8'; c.fill(); }
  awin(x + 17, G - 74, 18, 28); awin(x + 165, G - 74, 18, 28);
  { const ex = x + 58, ew = 84;   // entrance: arched glass in a black frame, name band, black glass doors
    c.fillStyle = BK; c.beginPath(); c.moveTo(ex, G - 64); c.lineTo(ex, G - 84); c.quadraticCurveTo(ex, G - 100, ex + ew / 2, G - 101); c.quadraticCurveTo(ex + ew, G - 100, ex + ew, G - 84); c.lineTo(ex + ew, G - 64); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.moveTo(ex + 3, G - 65); c.lineTo(ex + 3, G - 84); c.quadraticCurveTo(ex + 3, G - 97, ex + ew / 2, G - 98); c.quadraticCurveTo(ex + ew - 3, G - 97, ex + ew - 3, G - 84); c.lineTo(ex + ew - 3, G - 65); c.closePath(); c.clip();
    c.fillStyle = lg(c, ex, G - 98, ex + ew * .6, G - 64, [[0, '#d7e3ec'], [.5, '#8fa4b6'], [1, '#55687a']]); c.fillRect(ex, G - 100, ew, 40); c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(ex + 8, G - 64); c.lineTo(ex + 22, G - 98); c.lineTo(ex + 28, G - 98); c.lineTo(ex + 14, G - 64); c.fill(); c.restore();
    for (let i = 1; i < 4; i++) rect(c, BK, ex + i * ew / 4 - .7, G - 98, 1.4, 34);
    rect(c, BK, ex - 2, G - 64, ew + 4, 22); txt(c, 'Suffa-Tul-Islam', ex + ew / 2, G - 57.4, 7.4, '#ffffff', { f: 'Georgia, serif', w: 400 }); txt(c, 'Masjid', ex + ew / 2, G - 49, 7.4, '#ffffff', { f: 'Georgia, serif', w: 400 });
    rect(c, BK, ex, G - 42, ew, 42); for (let i = 0; i < 4; i++) { c.fillStyle = lg(c, ex + 2 + i * 20.5, G - 40, ex + 21 + i * 20.5, G, [[0, '#4a5462'], [1, '#22272e']]); c.fillRect(ex + 2 + i * 20.5, G - 40, 19, 40); rect(c, 'rgba(255,255,255,.12)', ex + 4 + i * 20.5, G - 38, 2, 34); }
    rect(c, '#a8acb2', ex + 39, G - 24, .7, 6); rect(c, '#a8acb2', ex + 44.3, G - 24, .7, 6); }
  arch(x + 8, 36, G - 98, G, 4); arch(x + 156, 36, G - 98, G, 4);
  // lawn + low brick boundary wall with stone coping (gap at the gate)
  rect(c, '#4f9a3c', x - 6, G - 5, 312, 5); for (let i = 0; i < 160; i++) rect(c, i % 2 ? '#78c25a' : '#3f8030', x - 5 + (i * 37) % 309, G - 5 + (i % 3) * 1.2, .5, 1.6);
  for (const [wx, ww] of [[x - 6, 62], [x + 144, 162]]) { brick(c, wx, G - 12, ww, 12, '#b86a4a'); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(wx, G - 12, ww, 12); rect(c, '#e3d6bf', wx - .5, G - 13.4, ww + 1, 1.8, LINE, .3); }
  tree(c, x - 18, G - 2, 2.1, { d: '#3f6a2a', m: '#5f9a3e', l: '#96c868' });
  c.restore();
};

// The Galaxy (WIDEN: long left wing, original at +124): curved beige front with GALAXY | GALAXY lettering, logo panels,
// striped base, shelter + postbox + people out front
HD.galaxy = (c, x0, G) => {
  c.save(); c.lineJoin = 'round';
  // ---- left wing
  { const x = x0, WW = 132;
    rect(c, '#cdbca8', x, G - 104, WW, 104, LINE, .5); rect(c, '#dcd5c8', x - 2, G - 110, WW + 4, 6, LINE, .45); rect(c, 'rgba(0,0,0,.12)', x - 2, G - 104.6, WW + 4, .8);
    c.fillStyle = lg(c, 0, G - 96, 0, G - 70, [[0, '#c3ced8'], [1, '#8e9ba7']]); c.fillRect(x, G - 96, WW, 26);
    for (let i = 0; i < 6; i++) { c.fillStyle = lg(c, x + 2 + i * 20, G - 94, x + 20 + i * 20, G - 72, [[0, '#d9e3ea'], [.6, '#a8b6c2'], [1, '#8a99a6']]); c.fillRect(x + 2 + i * 20, G - 94, 18, 22); c.strokeStyle = '#6f7a84'; c.lineWidth = .4; c.strokeRect(x + 2 + i * 20, G - 94, 18, 22); }
    'GALAXY'.split('').forEach((ch, i) => txt(c, ch, x + 11 + i * 20, G - 82.4, 14, '#ffffff', { f: 'Silk, monospace', w: 700, sh: 'rgba(80,90,100,.6)' }));
    rect(c, '#6f7a84', x, G - 70, WW, 1.6);
    for (let i = 0; i < 5; i++) { const bx = x + 12 + i * 24;
      rect(c, '#efe4c9', bx, G - 66, 12, 8, LINE, .35); rect(c, '#1a1c21', bx, G - 58, 12, 30); for (let k = 0; k < 3; k++) rect(c, '#2a2d35', bx, G - 50 + k * 8, 12, .5);
      rect(c, '#5c6670', bx, G - 28, 12, 5); c.fillStyle = lg(c, bx, G - 23, bx + 12, G, [[0, '#b7cad8'], [1, '#5f7a90']]); c.fillRect(bx, G - 23, 12, 23); for (const v of [3, 8]) rect(c, '#2a3542', bx + v, G - 23, .6, 23);
      if (i === 2) { rect(c, '#1f6fd6', bx - 1, G - 29, 14, 6, '#0d3a80', .3); c.beginPath(); c.arc(bx + 2, G - 26, 1.6, 0, 7); c.fillStyle = '#8ad646'; c.fill(); txt(c, 'the gym', bx + 7.6, G - 26, 2.6, '#fff', { f: 'Mont, sans-serif' }); rect(c, '#3a4552', bx + 1, G - 22, 10, 22); } }
    for (let i = 0; i < 6; i++) { const px = x + i * 24; c.fillStyle = lg(c, px, 0, px + 12, 0, [[0, '#e9d8c4'], [.5, '#dcc6ae'], [1, '#c4ac95']]); c.fillRect(px, G - 68, 12, 68); for (let j = 0; j < 8; j++) rect(c, '#5a5f6e', px, G - 62 + j * 8, 12, .6); rect(c, '#4a4f5c', px, G - 12, 12, 12); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = .3; c.strokeRect(px, G - 68, 12, 68); }
    for (const px of [x + 24, x + 72]) { rect(c, '#1f6fd6', px + 1, G - 60, 10, 30, '#0d3a80', .3); c.beginPath(); c.arc(px + 6, G - 54, 2.6, 0, 7); c.fillStyle = '#8ad646'; c.fill(); c.beginPath(); c.arc(px + 6, G - 54, 1.3, 0, 7); c.fillStyle = '#1f6fd6'; c.fill(); txt(c, 'GYM', px + 6, G - 44, 2.8, '#fff', { f: 'Mont, sans-serif' }); } }
  // ---- main drum
  const x = x0 + 124;
  rect(c, '#dcc6ae', x, G - 44, 200, 44); for (let j = 0; j < 6; j++) rect(c, '#5a5f6e', x, G - 40 + j * 7, 200, .7); rect(c, '#4a4f5c', x, G - 8, 200, 8); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 44, 200, 44);
  rect(c, '#9aa1a8', x + 70, G - 36, 60, 36, LINE, .4); for (let i = 0; i < 18; i++) rect(c, i % 2 ? '#7f868d' : '#a9b0b7', x + 71, G - 35 + i * 2, 58, 1);   // roller shutter
  c.fillStyle = lg(c, x + 4, 0, x + 196, 0, [[0, '#8f8373'], [.12, '#b0a493'], [.4, '#bcb09f'], [.85, '#a3978a'], [1, '#857a6c']]); c.fillRect(x + 4, G - 140, 192, 96); c.strokeStyle = LINE; c.strokeRect(x + 4, G - 140, 192, 96);
  for (let i = 16; i < 192; i += 16) { rect(c, 'rgba(70,60,50,.35)', x + 4 + i, G - 140, .7, 96); rect(c, 'rgba(255,255,255,.18)', x + 4.7 + i, G - 140, .4, 96); }
  for (let yy = G - 132; yy < G - 46; yy += 8) rect(c, 'rgba(70,60,50,.12)', x + 4, yy, 192, .4);
  rect(c, '#e3dacb', x - 2, G - 150, 204, 10, LINE, .5); rect(c, '#c7bdab', x - 2, G - 143, 204, 3); for (let i = 0; i < 50; i++) rect(c, 'rgba(120,110,95,.4)', x + i * 4, G - 140, 1.2, 2.4);
  { c.font = '700 15px Silk, monospace'; const tw = c.measureText('GALAXY').width, e2 = x + 194, s2 = e2 - tw, dv = s2 - 5;   // boxy lettering, the second GALAXY runs to the right edge
    txt(c, 'GALAXY', s2, G - 125, 15, '#ffffff', { f: 'Silk, monospace', a: 'left', sh: 'rgba(90,80,65,.75)' }); rect(c, '#f4f2ee', dv, G - 133, 1, 16); rect(c, 'rgba(90,80,65,.6)', dv + 1, G - 133, .6, 16);
    txt(c, 'GALAXY', dv - 5, G - 125, 15, '#ffffff', { f: 'Silk, monospace', a: 'right', sh: 'rgba(90,80,65,.75)' }); }
  // logo panels
  const P1 = [[x + 14, 20, '#1f8fd6'], [x + 38, 28, '#d8262f'], [x + 70, 34, '#ffffff'], [x + 112, 36, '#f4f2f2'], [x + 154, 32, '#2a2a2e']];
  P1.forEach(([bx, w, col]) => { rect(c, 'rgba(0,0,0,.2)', bx + 1, G - 91, w, 36); rect(c, col, bx, G - 92, w, 36, 'rgba(0,0,0,.45)', .4); });
  c.beginPath(); c.arc(x + 24, G - 80, 4.6, 0, 7); c.fillStyle = '#8ad646'; c.fill(); c.beginPath(); c.arc(x + 24, G - 80, 2.4, 0, 7); c.fillStyle = '#1f8fd6'; c.fill(); txt(c, 'the gym', x + 24, G - 67, 3.6, '#fff', { f: 'Mont, sans-serif' });
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 52, G - 64); c.bezierCurveTo(x + 40, G - 72, x + 44, G - 82, x + 52, G - 76); c.bezierCurveTo(x + 60, G - 82, x + 64, G - 72, x + 52, G - 64); c.fill();
  for (const [r, col] of [[14, '#1aa34a'], [10, '#f4c430'], [6, '#2f8fdc']]) { c.beginPath(); c.arc(x + 87, G - 74, r, 0, 7); c.fillStyle = col; c.fill(); }
  txt(c, 'ten', x + 130, G - 85, 7, '#e0558c', { f: 'Mont, sans-serif' }); c.beginPath(); c.arc(x + 130, G - 69, 6.4, 0, 7); c.fillStyle = '#e0558c'; c.fill(); c.beginPath(); c.arc(x + 130, G - 69, 4.6, 0, 7); c.fillStyle = '#f4f2f2'; c.fill(); rect(c, '#e0558c', x + 129.3, G - 73, 1.4, 7.6);
  rect(c, '#d8262f', x + 165, G - 78, 9, 9, '#7a1010', .3);
  // shading on the curve, shelter, postbox, tree, people
  rect(c, 'rgba(0,0,0,.14)', x + 4, G - 140, 14, 96); rect(c, 'rgba(0,0,0,.16)', x + 180, G - 140, 16, 96); rect(c, 'rgba(255,255,255,.10)', x + 60, G - 140, 30, 96);
  { const sx = x + 92; rect(c, '#8a9098', sx, G - 22, 30, 1.6); rect(c, '#8a9098', sx, G - 22, .9, 22); rect(c, '#8a9098', sx + 29, G - 22, .9, 22); rect(c, 'rgba(190,215,235,.5)', sx + 1, G - 20, 28, 14); rect(c, '#c8202a', sx + 6, G - 7, 18, 1.8); }
  rect(c, '#c8202a', x + 132, G - 14, 7, 14, '#6a0e14', .35); rect(c, '#8a141b', x + 131.6, G - 15, 7.8, 1.6); rect(c, '#2a0a0a', x + 133.5, G - 11, 4, .7);
  tree(c, x + 186, G, 1.2);
  c.restore();
};

// St Mary's Church: flint-and-stone chequerwork, crenellated tower with pinnacles + weathervane, nave, chancel gable, pointed
// tracery windows, lawn with headstones
HD.stmarys = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const ST = '#cfc8b3', DK = '#3a3d48';
  const chk = (bx, by, w, h, k) => { c.fillStyle = lg(c, bx, 0, bx + w, 0, [[0, '#c4bca6'], [.5, ST], [1, '#bdb59f']]); c.fillRect(bx, by, w, h);
    for (let i = 0; i * k < w; i++) for (let j = 0; j * k < h; j++) if ((i + j) % 2) { const fx = bx + i * k, fy = by + j * k, ww = Math.min(k, w - i * k), hh = Math.min(k, h - j * k); rect(c, DK, fx + .15, fy + .15, ww - .3, hh - .3); rect(c, 'rgba(120,125,140,.35)', fx + .5, fy + .5, ww * .4, hh * .3); }
    c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(bx, by, w, h); };
  const cren = (bx, by, w) => { for (let i = 0; i < w; i += 8) rect(c, ST, bx + i, by - 5, 5, 5, LINE, .35); rect(c, '#b8b19b', bx - 1, by, w + 2, 3, LINE, .35); };
  const gw = (wx, wy, w, h) => { const top = wy - w / 2;
    c.beginPath(); c.moveTo(wx - 1.5, wy + h + 1.5); c.lineTo(wx - 1.5, wy); c.lineTo(wx + w / 2, top - 1.5); c.lineTo(wx + w + 1.5, wy); c.lineTo(wx + w + 1.5, wy + h + 1.5); c.closePath(); c.fillStyle = '#ece8db'; c.fill(); c.strokeStyle = LINE; c.lineWidth = .4; c.stroke();
    c.beginPath(); c.moveTo(wx, wy + h); c.lineTo(wx, wy); c.lineTo(wx + w / 2, top); c.lineTo(wx + w, wy); c.lineTo(wx + w, wy + h); c.closePath(); c.fillStyle = lg(c, wx, top, wx + w, wy + h, [[0, '#5b6a86'], [.5, '#2c3346'], [1, '#1d2232']]); c.fill();
    const n = Math.max(1, Math.round(w / 6)); for (let i = 1; i < n + 1; i++) line(c, '#ece8db', .45, [[wx + i * w / (n + 1), wy - (w / 2) * (1 - Math.abs(i / (n + 1) - .5) * 2) * .8], [wx + i * w / (n + 1), wy + h]]);
    for (let yy = wy + 6; yy < wy + h; yy += 6) line(c, 'rgba(236,232,219,.6)', .25, [[wx, yy], [wx + w, yy]]);
    if (w >= 16) { c.beginPath(); c.arc(wx + w / 2, wy - w * .12, w * .16, 0, 7); c.strokeStyle = '#ece8db'; c.lineWidth = .45; c.stroke(); }
    c.fillStyle = 'rgba(140,170,220,.18)'; c.fillRect(wx + 1, wy + 2, w * .3, h - 4); };
  // tower with pinnacles and weathervane
  chk(x + 226, G - 196, 52, 196, 5); cren(x + 226, G - 196, 52);
  for (const px of [x + 224, x + 270]) { rect(c, ST, px, G - 210, 10, 14, LINE, .35); poly(c, ST, [[px, G - 210], [px + 5, G - 216], [px + 10, G - 210]], LINE, .35); }
  rect(c, '#3a3d44', x + 251.5, G - 228, .9, 30); poly(c, '#e8b04a', [[x + 248, G - 230], [x + 256, G - 230], [x + 252, G - 226]], '#8a6a20', .25); rect(c, '#3a3d44', x + 245, G - 222, 14, .7);
  rect(c, '#b8b19b', x + 226, G - 130, 52, 4, LINE, .35); gw(x + 234, G - 172, 10, 24); gw(x + 260, G - 172, 10, 24); gw(x + 248, G - 110, 6, 14);
  c.beginPath(); c.arc(x + 252, G - 145, 6.5, 0, 7); c.fillStyle = '#2a2f3a'; c.fill(); c.strokeStyle = '#d9c48a'; c.lineWidth = .6; c.stroke(); line(c, '#d9c48a', .5, [[x + 252, G - 145], [x + 252, G - 150]]); line(c, '#d9c48a', .5, [[x + 252, G - 145], [x + 255, G - 145]]);
  // nave to the right of the chancel
  chk(x + 150, G - 120, 80, 120, 4); cren(x + 150, G - 120, 80); gw(x + 164, G - 74, 16, 44); gw(x + 196, G - 74, 16, 44);
  rect(c, ST, x + 214, G - 36, 32, 36, LINE, .4); c.beginPath(); c.moveTo(x + 222, G); c.lineTo(x + 222, G - 18); c.lineTo(x + 230, G - 26); c.lineTo(x + 238, G - 18); c.lineTo(x + 238, G); c.closePath(); c.fillStyle = '#4a2e1c'; c.fill(); c.stroke(); for (let i = 1; i < 4; i++) line(c, 'rgba(0,0,0,.4)', .3, [[x + 222 + i * 4, G - 22], [x + 222 + i * 4, G]]);
  // chancel with the big gable
  chk(x + 20, G - 130, 132, 130, 4); cren(x + 20, G - 130, 132);
  c.save(); c.beginPath(); c.moveTo(x + 84, G - 130); c.lineTo(x + 117, G - 160); c.lineTo(x + 150, G - 130); c.closePath(); c.clip(); chk(x + 84, G - 162, 66, 32, 4); c.restore(); poly(c, 'rgba(0,0,0,0)', [[x + 84, G - 130], [x + 117, G - 160], [x + 150, G - 130]], LINE, .5);
  rect(c, ST, x + 115, G - 168, 4, 10, LINE, .3); rect(c, ST, x + 112, G - 165, 10, 3, LINE, .3);
  gw(x + 30, G - 100, 28, 74); gw(x + 66, G - 100, 28, 74); gw(x + 104, G - 106, 36, 82);
  for (const bx of [x + 60, x + 98]) { rect(c, '#bcb59f', bx, G - 110, 6, 110, LINE, .35); for (let yy = G - 100; yy < G; yy += 22) poly(c, '#cfc8b3', [[bx - 1, yy], [bx + 7, yy], [bx + 6, yy - 3], [bx, yy - 3]], LINE, .25); }
  rect(c, '#bcb59f', x, G - 110, 22, 110, LINE, .4); cren(x, G - 110, 22);
  // churchyard lawn with headstones
  rect(c, '#6fbf4a', x - 10, G - 4, 320, 4); for (let i = 0; i < 140; i++) rect(c, i % 2 ? '#8fd468' : '#559a38', x - 9 + (i * 41) % 318, G - 4 + (i % 3), .5, 1.6);
  for (const gx of [x + 40, x + 80, x + 130, x + 186, x + 268, x + 278]) { c.beginPath(); c.moveTo(gx, G); c.lineTo(gx, G - 11); c.arc(gx + 3, G - 11, 3, Math.PI, 0); c.lineTo(gx + 6, G); c.closePath(); c.fillStyle = lg(c, gx, 0, gx + 6, 0, [[0, '#9a968a'], [1, '#7f7b70']]); c.fill(); c.strokeStyle = LINE; c.lineWidth = .3; c.stroke(); }
  c.restore();
};

// Guru Nanak Gurdwara: brick body with white trim, lit arched windows, deck with railing, white side arcades, tall white central
// portal with the khanda window, dome with gold finials, corner towers, the blue-lettered sign (room under LUTON), stairs, trees
HD.gurdwara = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const B = '#9e6c4e', WH = '#f4f2ed', GD = '#e0b23a';
  const aw = (wx, wy, w, h, lit) => { c.beginPath(); c.moveTo(wx - 1, wy + h + 1); c.lineTo(wx - 1, wy); c.arc(wx + w / 2, wy, w / 2 + 1, Math.PI, 0); c.lineTo(wx + w + 1, wy + h + 1); c.closePath(); c.fillStyle = WH; c.fill(); c.strokeStyle = LINE; c.lineWidth = .35; c.stroke();
    c.beginPath(); c.moveTo(wx + .6, wy + h); c.lineTo(wx + .6, wy); c.arc(wx + w / 2, wy, w / 2 - .6, Math.PI, 0); c.lineTo(wx + w - .6, wy + h); c.closePath();
    c.fillStyle = lit ? lg(c, 0, wy - w / 2, 0, wy + h, [[0, '#fff0bf'], [1, '#e9b75a']]) : lg(c, wx, wy - w / 2, wx + w, wy + h, [[0, '#e1ebf2'], [.6, '#9fb3c3'], [1, '#6a7f90']]); c.fill();
    line(c, WH, .35, [[wx + w / 2, wy - w / 2], [wx + w / 2, wy + h]]); line(c, WH, .35, [[wx, wy + h * .45], [wx + w, wy + h * .45]]); };
  for (const tx of [x + 10, x + 430]) { c.beginPath(); c.arc(tx, G - 70, 25, 0, 7); c.fillStyle = '#2a5030'; c.fill(); c.beginPath(); c.arc(tx - 4, G - 76, 17, 0, 7); c.fillStyle = '#3a6a3c'; c.fill(); c.beginPath(); c.arc(tx - 9, G - 82, 7, 0, 7); c.fillStyle = '#5a8a50'; c.fill(); }
  brick(c, x + 30, G - 150, 380, 150, B); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x + 30, G - 150, 380, 150); rect(c, WH, x + 28, G - 154, 384, 4, LINE, .4);
  brick(c, x + 150, G - 160, 140, 10, B); rect(c, WH, x + 148, G - 162, 144, 3, LINE, .35);
  for (let i = 0; i < 6; i++) aw(x + 40 + i * 20, G - 136, 12, 18, i % 3 === 0); for (let i = 0; i < 6; i++) aw(x + 290 + i * 20, G - 136, 12, 18, i % 2 === 0);
  for (const wx of [x + 156, x + 172, x + 256, x + 272]) aw(wx, G - 140, 12, 20, true); for (const wx of [x + 160, x + 270]) aw(wx, G - 98, 12, 20, true);
  rect(c, '#6e4a36', x + 30, G - 40, 380, 40); for (let i = 0; i < 12; i++) { rect(c, WH, x + 40 + i * 31, G - 32, 16, 18, LINE, .3); c.fillStyle = i % 3 ? lg(c, 0, G - 30, 0, G - 16, [[0, '#dbe6ee'], [1, '#8aa0b2']]) : '#f6d98a'; c.fillRect(x + 42 + i * 31, G - 30, 12, 14); rect(c, WH, x + 47.6 + i * 31, G - 30, .8, 14); }
  rect(c, WH, x - 2, G - 46, 444, 6, LINE, .4); railing(c, x, G - 58, 440, 12, { col: '#c4cad1', gap: 2 });
  for (const [ax, aw2] of [[x, 110], [x + 330, 110]]) { rect(c, WH, ax, G - 112, aw2, 10, LINE, .4); const n = 4;
    for (let i = 0; i < n; i++) { const cx = ax + 4 + (i + .5) * (aw2 - 8) / n, r = (aw2 - 8) / n / 2 - 2.5; c.beginPath(); c.moveTo(cx - r, G - 46); c.lineTo(cx - r, G - 98); c.arc(cx, G - 98, r, Math.PI, 0); c.lineTo(cx + r, G - 46); c.closePath(); c.fillStyle = 'rgba(70,50,40,.55)'; c.fill(); }
    for (let i = 0; i <= n; i++) { const px = ax + 2 + i * (aw2 - 8) / n; c.fillStyle = lg(c, px, 0, px + 5, 0, [[0, '#ffffff'], [1, '#dcd8d0']]); c.fillRect(px, G - 102, 5, 56); c.strokeStyle = LINE; c.lineWidth = .3; c.strokeRect(px, G - 102, 5, 56); rect(c, WH, px - 1, G - 103, 7, 2, LINE, .25); } }
  // central portal
  c.fillStyle = lg(c, x + 186, 0, x + 254, 0, [[0, '#e9e6de'], [.4, '#ffffff'], [1, '#e2ded5']]); c.fillRect(x + 186, G - 190, 68, 190); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x + 186, G - 190, 68, 190);
  c.save(); c.beginPath(); c.moveTo(x + 194, G - 60); c.lineTo(x + 194, G - 140); c.lineTo(x + 220, G - 172); c.lineTo(x + 246, G - 140); c.lineTo(x + 246, G - 60); c.closePath(); c.clip(); brick(c, x + 194, G - 172, 52, 112, B); c.restore();
  c.beginPath(); c.arc(x + 220, G - 124, 9.6, 0, 7); c.fillStyle = WH; c.fill(); c.strokeStyle = LINE; c.lineWidth = .4; c.stroke(); c.beginPath(); c.arc(x + 220, G - 124, 7.6, 0, 7); c.fillStyle = '#f6d98a'; c.fill();
  txt(c, 'ੴ', x + 220, G - 123.6, 9, '#1f3f8a', { f: 'serif', w: 400 });
  poly(c, WH, [[x + 206, G - 74], [x + 220, G - 90], [x + 234, G - 74]], LINE, .4); c.fillStyle = lg(c, 0, G - 74, 0, G - 46, [[0, '#fff0bf'], [1, '#e9b75a']]); c.fillRect(x + 208, G - 74, 24, 28); rect(c, WH, x + 219.4, G - 74, 1.2, 28);
  for (const cx of [x + 186, x + 248]) { c.fillStyle = lg(c, cx, 0, cx + 6, 0, [[0, '#ffffff'], [1, '#d8d4cc']]); c.fillRect(cx, G - 168, 6, 168); c.strokeStyle = LINE; c.lineWidth = .35; c.strokeRect(cx, G - 168, 6, 168); }
  rect(c, WH, x + 180, G - 196, 80, 8, LINE, .45); for (let i = 0; i < 20; i++) rect(c, 'rgba(0,0,0,.12)', x + 182 + i * 4, G - 189, 1.6, 1.2);
  // dome with ribs, drum, finials
  rect(c, WH, x + 196, G - 214, 48, 18, LINE, .4); for (let i = 0; i < 4; i++) { rect(c, '#9aa3ad', x + 200 + i * 11, G - 210, 8, 12); c.beginPath(); c.arc(x + 204 + i * 11, G - 210, 4, Math.PI, 0); c.fillStyle = '#9aa3ad'; c.fill(); }
  c.beginPath(); c.moveTo(x + 199, G - 214); c.bezierCurveTo(x + 196, G - 236, x + 214, G - 240, x + 220, G - 244); c.bezierCurveTo(x + 226, G - 240, x + 244, G - 236, x + 241, G - 214); c.closePath();
  c.fillStyle = lg(c, x + 200, 0, x + 240, 0, [[0, '#e5e2da'], [.35, '#ffffff'], [1, '#d6d2c8']]); c.fill(); c.strokeStyle = LINE; c.lineWidth = .45; c.stroke();
  for (const dx of [-12, -6, 0, 6, 12]) line(c, 'rgba(150,145,135,.4)', .3, [[x + 220 + dx, G - 214], [x + 220 + dx * .3, G - 241]]);
  rect(c, GD, x + 219.2, G - 254, 1.6, 12); c.beginPath(); c.arc(x + 220, G - 246, 2.2, 0, 7); c.fillStyle = GD; c.fill(); c.beginPath(); c.moveTo(x + 220, G - 258); c.lineTo(x + 218.4, G - 253); c.lineTo(x + 221.6, G - 253); c.fill();
  for (const fx of [x + 184, x + 256]) { c.beginPath(); c.arc(fx, G - 200, 4.2, 0, 7); c.fillStyle = lg(c, fx - 4, G - 204, fx + 4, G - 196, [[0, '#ffe68a'], [1, '#b8861a']]); c.fill(); c.strokeStyle = '#6a4a10'; c.lineWidth = .3; c.stroke(); rect(c, GD, fx - .4, G - 208, .8, 4); }
  for (const tx of [x + 26, x + 404]) { c.fillStyle = lg(c, tx, 0, tx + 12, 0, [[0, '#ffffff'], [1, '#dcd8d0']]); c.fillRect(tx, G - 176, 12, 176); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(tx, G - 176, 12, 176); rect(c, GD, tx, G - 150, 12, 1.6);
    c.beginPath(); c.arc(tx + 6, G - 180, 7, Math.PI, 0); c.closePath(); c.fillStyle = WH; c.fill(); c.stroke(); rect(c, '#3a3d44', tx + 5.4, G - 194, 1.2, 8); poly(c, '#f08a1c', [[tx + 6.6, G - 194], [tx + 12, G - 191.5], [tx + 6.6, G - 189]]); }
  // sign with the two khanda emblems
  rect(c, WH, x + 158, G - 51, 124, 26, LINE, .45); rect(c, '#1f2f6a', x + 160, G - 49, 120, .7); rect(c, '#1f2f6a', x + 160, G - 27.6, 120, .7);
  txt(c, 'GURU NANAK GURDWARA', x + 220, G - 42.4, 6.6, '#1f2f6a', { f: 'Oswald, sans-serif', w: 600, ls: .4 }); txt(c, 'LUTON', x + 220, G - 33.4, 6.4, '#1f2f6a', { f: 'Oswald, sans-serif', w: 600, ls: 1.2 });
  for (const kx of [x + 152, x + 288]) { c.beginPath(); c.arc(kx, G - 38, 3.6, 0, 7); c.strokeStyle = '#1f3f8a'; c.lineWidth = .8; c.stroke(); rect(c, '#1f3f8a', kx - .5, G - 45, 1, 12); }
  for (const [sx, dir] of [[x + 120, 1], [x + 290, -1]]) for (let i = 0; i < 10; i++) rect(c, i % 2 ? '#bfc2c6' : '#a8abb0', sx + (dir > 0 ? i * 3 : 30 - i * 3), G - 44 + i * 4.4, 30, 4.4, 'rgba(0,0,0,.25)', .2);
  rect(c, '#bcb6a9', x - 6, G - 3, 452, 3);
  c.restore();
};

// Luton Hoo Estate: honey stone mansion, grey mansard + dormers + chimneys, rounded bow at the left, pedimented centre portico,
// terrace with white balustrade + steps, striped lawn, topiary, bench. Fountain spray and the helicopter are LM_ANIM.lutonhoo.
HD.lutonhoo = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const ST = '#dfcb9e', SD = '#c4ad7f', SL = '#ecdcb4', RF = '#7c8592', RD = '#5f6874';
  const stone = (sx, sy, w, h, col = ST) => { c.fillStyle = lg(c, sx, sy, sx, sy + h, [[0, shade(col, 1.04)], [1, shade(col, .95)]]); c.fillRect(sx, sy, w, h); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(sx, sy, w, h);
    for (let yy = sy + 3, r = 0; yy < sy + h - 1; yy += 3, r++) { rect(c, 'rgba(140,110,60,.16)', sx + .5, yy, w - 1, .3); for (let xx = sx + (r % 2 ? 3 : 0); xx < sx + w; xx += 6) rect(c, 'rgba(140,110,60,.10)', xx, yy - 3, .3, 3); } };
  const win = (wx, wy, w, h) => { rect(c, '#f2e9d2', wx - 1, wy - 1, w + 2, h + 2, 'rgba(90,70,40,.5)', .3); c.fillStyle = lg(c, wx, wy, wx + w * .6, wy + h, [[0, '#c9d6e0'], [.5, '#6f8296'], [1, '#3e4d5e']]); c.fillRect(wx + .8, wy + .8, w - 1.6, h - 1.6);
    for (const f of [1 / 3, 2 / 3]) rect(c, '#f2e9d2', wx + w * f - .2, wy + .8, .4, h - 1.6); for (const f of [.25, .5, .75]) rect(c, '#f2e9d2', wx + .8, wy + h * f - .2, w - 1.6, .4);
    poly(c, SL, [[wx - 2, wy - 1.2], [wx + w / 2, wy - 3.6], [wx + w + 2, wy - 1.2]], 'rgba(90,70,40,.5)', .25); rect(c, SL, wx - 1.6, wy + h + .6, w + 3.2, 1.2, 'rgba(90,70,40,.5)', .25); };
  for (const cx of [x + 58, x + 104, x + 132, x + 214, x + 244, x + 290]) { stone(cx, G - 162, 8, 26, SD); rect(c, '#8a7a5c', cx - 1, G - 164, 10, 2.4, LINE, .3); for (const px of [1, 5]) rect(c, '#9a5a3c', cx + px, G - 167, 2, 3, LINE, .2); }
  poly(c, lg(c, 0, G - 146, 0, G - 128, [[0, '#8c95a2'], [1, '#6c7582']]), [[x + 22, G - 128], [x + 316, G - 128], [x + 308, G - 146], [x + 30, G - 146]], LINE, .5);
  for (let yy = G - 144; yy < G - 128; yy += 1.6) rect(c, 'rgba(40,45,55,.25)', x + 24 + (G - 128 - yy) * .45, yy, 290 - (G - 128 - yy) * .9, .3);
  for (const dx of [x + 82, x + 116, x + 196, x + 230, x + 268]) { rect(c, ST, dx, G - 142, 10, 12, LINE, .35); c.fillStyle = lg(c, dx, G - 139, dx + 6, G - 131, [[0, '#c9d6e0'], [1, '#3e4d5e']]); c.fillRect(dx + 2, G - 139, 6, 8); rect(c, ST, dx + 4.8, G - 139, .4, 8); poly(c, RD, [[dx - 1, G - 142], [dx + 11, G - 142], [dx + 5, G - 147]], LINE, .35); }
  stone(x + 26, G - 128, 288, 98);
  rect(c, SL, x + 22, G - 132, 296, 4, LINE, .4); for (let i = 0; i < 73; i++) rect(c, 'rgba(120,95,55,.45)', x + 24 + i * 4, G - 128.2, 1.6, 1.4);
  rect(c, SL, x + 26, G - 84, 288, 2.6, LINE, .3);
  for (let i = 0; i < 10; i++) { const wx = x + 92 + i * 22; if (wx > x + 146 && wx < x + 196) continue; win(wx, G - 118, 10, 22); win(wx, G - 74, 10, 28); }
  // rounded bow, shaded like a curve
  c.fillStyle = lg(c, x + 6, 0, x + 70, 0, [[0, '#b89e70'], [.25, '#e4d3a8'], [.55, '#f0e2bd'], [1, '#b49a6c']]); c.fillRect(x + 6, G - 134, 64, 104); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 6, G - 134, 64, 104);
  for (let yy = G - 131; yy < G - 30; yy += 3) rect(c, 'rgba(140,110,60,.14)', x + 6.5, yy, 63, .3);
  poly(c, lg(c, x + 6, 0, x + 70, 0, [[0, '#5f6874'], [.5, '#8c95a2'], [1, '#5f6874']]), [[x + 6, G - 135], [x + 70, G - 135], [x + 62, G - 148], [x + 48, G - 154], [x + 28, G - 154], [x + 14, G - 148]], LINE, .45);
  rect(c, RD, x + 36, G - 160, 4, 7, LINE, .3); c.beginPath(); c.arc(x + 38, G - 162, 1.4, 0, 7); c.fillStyle = '#c9a64a'; c.fill();
  for (const wx of [x + 18, x + 33, x + 48]) { win(wx, G - 122, 9, 22); win(wx, G - 76, 9, 28); }
  c.beginPath(); c.arc(x + 38, G - 93, 3, 0, 7); c.fillStyle = '#3e4d5e'; c.fill(); c.strokeStyle = SL; c.lineWidth = .6; c.stroke();
  // centre portico
  stone(x + 150, G - 136, 46, 106, SL);
  poly(c, SL, [[x + 145, G - 136], [x + 201, G - 136], [x + 173, G - 151]], LINE, .45); poly(c, SD, [[x + 156, G - 138], [x + 190, G - 138], [x + 173, G - 146]]);
  c.beginPath(); c.arc(x + 173, G - 141, 2, 0, 7); c.fillStyle = '#c9a64a'; c.fill();
  win(x + 166, G - 122, 14, 24);
  rect(c, '#3a3226', x + 162, G - 74, 22, 44); c.fillStyle = lg(c, x + 164, 0, x + 182, 0, [[0, '#4a3a28'], [.5, '#6a543a'], [1, '#4a3a28']]); c.fillRect(x + 164, G - 72, 18, 42);
  c.beginPath(); c.arc(x + 173, G - 72, 9, Math.PI, 0); c.fillStyle = lg(c, 0, G - 81, 0, G - 72, [[0, '#c9d6e0'], [1, '#4e5f70']]); c.fill(); rect(c, '#c9a64a', x + 172.4, G - 52, 1.2, 1.2);
  for (const cx of [x + 152, x + 160, x + 186, x + 194]) { c.fillStyle = lg(c, cx, 0, cx + 4, 0, [[0, '#d9caa2'], [.45, '#fbf2dc'], [1, '#c9b78c']]); c.fillRect(cx, G - 82, 4, 52); c.strokeStyle = LINE; c.lineWidth = .3; c.strokeRect(cx, G - 82, 4, 52); rect(c, SL, cx - 1, G - 84, 6, 2, LINE, .25); rect(c, SL, cx - 1, G - 31, 6, 1.6, LINE, .25); }
  // terrace + balustrade
  stone(x, G - 30, 330, 12, '#e8dec7'); rect(c, '#f6f0e0', x, G - 31.4, 330, 1.8, LINE, .3);
  for (let i = 0; i < 82; i++) { const bx = x + 2 + i * 4; if (bx > x + 128 && bx < x + 218) continue; c.beginPath(); c.moveTo(bx, G - 20); c.quadraticCurveTo(bx - .9, G - 24, bx + .7, G - 27.6); c.lineTo(bx + 1.5, G - 27.6); c.quadraticCurveTo(bx + 3.1, G - 24, bx + 2.2, G - 20); c.closePath(); c.fillStyle = '#f4eee0'; c.fill(); c.strokeStyle = 'rgba(120,100,60,.5)'; c.lineWidth = .2; c.stroke(); }
  rect(c, '#d6caa9', x, G - 18, 330, 8, LINE, .4); for (let k = 0; k < 3; k++) rect(c, k % 2 ? '#dcd2ba' : '#f0e9d8', x + 128 - k * 4, G - 18 + k * 6, 90 + k * 8, 6, 'rgba(90,70,40,.35)', .25);
  for (const [lx, lw] of [[x - 4, 124], [x + 222, 112]]) { for (let i = 0; i * 11 < lw; i++) rect(c, i % 2 ? '#6eae4a' : '#56943a', lx + i * 11, G - 10, Math.min(11, lw - i * 11), 10); rect(c, '#2f5a26', lx, G - 11, lw, 1.4); }
  const cone = (tx, h) => { poly(c, lg(c, tx - 5, 0, tx + 5, 0, [[0, '#24562a'], [.5, '#3f8a3a'], [1, '#24562a']]), [[tx - 5, G - 10], [tx + 5, G - 10], [tx, G - 10 - h]], '#183a1c', .35); for (let k = 0; k < 6; k++) rect(c, 'rgba(140,200,110,.35)', tx - 3 + k, G - 12 - k * h / 7, .6, .6); };
  const ball = (tx, r) => { c.beginPath(); c.arc(tx, G - 10 - r, r, 0, 7); c.fillStyle = lg(c, tx - r, G - 10 - 2 * r, tx + r, G - 10, [[0, '#5a9e48'], [1, '#22502a']]); c.fill(); c.strokeStyle = '#183a1c'; c.lineWidth = .35; c.stroke(); };
  cone(x + 112, 22); cone(x + 232, 22); ball(x + 126, 6); ball(x + 218, 6); ball(x + 266, 7); cone(x + 318, 18);
  // fountain base (spray animated in LM_ANIM)
  const fx = x + 173; rect(c, '#2f6a2c', fx - 46, G - 28, 92, 14, '#183a1c', .35);
  rect(c, '#e8dec7', fx - 40, G - 14, 80, 12, LINE, .4); c.fillStyle = lg(c, 0, G - 12, 0, G - 5, [[0, '#7fbde0'], [1, '#2f6a94']]); c.fillRect(fx - 35, G - 12, 70, 7); for (let i = 0; i < 6; i++) rect(c, 'rgba(255,255,255,.5)', fx - 30 + i * 11, G - 10 + (i % 2), 5, .4);
  rect(c, '#d3c6a4', fx - 3, G - 34, 6, 24, LINE, .3); rect(c, '#e8dec7', fx - 15, G - 35, 30, 4, LINE, .35); rect(c, '#bfe3f5', fx - 13, G - 32, 26, 1); rect(c, '#d3c6a4', fx - 3, G - 46, 6, 11, LINE, .3); rect(c, '#e8dec7', fx - 8, G - 47, 16, 2.4, LINE, .3);
  c.fillStyle = '#9a9f96'; c.beginPath(); c.ellipse(fx, G - 51, 3, 4.4, 0, 0, 7); c.fill(); c.beginPath(); c.arc(fx, G - 56.4, 1.6, 0, 7); c.fill();
  rect(c, '#3a2a20', x + 286, G - 10, 18, 1.6); rect(c, '#3a2a20', x + 286, G - 14, 18, 1.6); rect(c, '#2a2f38', x + 287, G - 8, 1.4, 8); rect(c, '#2a2f38', x + 301, G - 8, 1.4, 8);
  c.restore();
};

// ---------- shop kit ----------
const slate = (c, pts, col = '#4e535c') => { poly(c, lg(c, 0, Math.min(...pts.map(q => q[1])), 0, Math.max(...pts.map(q => q[1])), [[0, shade(col, 1.12)], [1, shade(col, .88)]]), pts, LINE, .5);
  c.save(); c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip(); const y0 = Math.min(...pts.map(q => q[1])), y1 = Math.max(...pts.map(q => q[1])), x0 = Math.min(...pts.map(q => q[0])), x1 = Math.max(...pts.map(q => q[0]));
  for (let y = y1 - 1.3, r = 0; y > y0; y -= 1.3, r++) { rect(c, 'rgba(0,0,0,.22)', x0, y, x1 - x0, .28); for (let xx = x0 + (r % 2) * 1.3; xx < x1; xx += 2.6) rect(c, 'rgba(0,0,0,.12)', xx, y - 1.3, .22, 1.3); } c.restore(); };
const stack = (c, x, y, w, h, col, pots = 2) => { brick(c, x, y, w, h, col); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(x, y, w, h); rect(c, '#c4beb1', x - 1, y - 2.4, w + 2, 2.4, LINE, .35);
  for (let i = 0; i < pots; i++) { const px = x + 2 + i * (w - 6) / Math.max(1, pots - 1); c.fillStyle = lg(c, px, 0, px + 3, 0, [[0, '#a84a2a'], [.5, '#d06a3a'], [1, '#9a4224']]); c.fillRect(px, y - 7, 3, 4.6); rect(c, '#8a3a1e', px - .4, y - 7.4, 3.8, 1); } };
const aerial = (c, x, top, h = 30) => { rect(c, '#8f9399', x, top, 1, h); for (let i = 0; i < 4; i++) rect(c, '#8f9399', x - 7 + i * .8, top + 3 + i * 5, 15 - i * 1.6, .7); };
const glare = (c, x, y, w, h) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(x + w * .12, y + h); c.lineTo(x + w * .3, y); c.lineTo(x + w * .42, y); c.lineTo(x + w * .24, y + h); c.fill(); c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(x + w * .5, y + h); c.lineTo(x + w * .62, y); c.lineTo(x + w * .66, y); c.lineTo(x + w * .54, y + h); c.fill(); c.restore(); };
const pend = (c, x, y, len = 5, col = '#2a2a2e') => { rect(c, '#1a1210', x - .2, y, .4, len); poly(c, col, [[x - 2.6, y + len + 2.2], [x - 1.2, y + len], [x + 1.2, y + len], [x + 2.6, y + len + 2.2]]); c.beginPath(); c.ellipse(x, y + len + 2.4, 2.2, .7, 0, 0, 7); c.fillStyle = '#fff0b8'; c.fill();
  const g = c.createRadialGradient(x, y + len + 4, 0, x, y + len + 4, 9); g.addColorStop(0, 'rgba(255,220,140,.35)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 9, y + len, 18, 14); };
const stool = (c, x, G2, col = '#2a1a14') => { rect(c, col, x - 2.4, G2 - 7, 4.8, 1.2); rect(c, col, x - .4, G2 - 6, .8, 6); rect(c, col, x - 1.8, G2 - 1, 3.6, .6); };
const tableT = (c, x, y, w, col = '#7a4e32') => { rect(c, col, x, y, w, 1.4); rect(c, shade(col, .7), x + w / 2 - .5, y + 1.4, 1, 6); };
const plant = (c, x, G2, s = 1) => { rect(c, '#6a4a2a', x - 3 * s, G2 - 4 * s, 6 * s, 4 * s); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .33; c.beginPath(); c.ellipse(x + Math.cos(a) * 5 * s, G2 - 6 * s + Math.sin(a) * 6 * s, 2.6 * s, 1 * s, a, 0, 7); c.fillStyle = i % 2 ? '#3f8a3a' : '#5fae4a'; c.fill(); } };

// Kahwa Cafe: red-brick terrace over a dark brown shopfront; round hanging sign; KAHWA CAFE crisp and centred right of it
HD.kahwa = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const BR = '#4a2a1e', BH = '#6a3e2a', CR = '#f3e9d6';
  slate(c, [[x - 6, G - 126], [x + 116, G - 126], [x + 107, G - 154], [x + 3, G - 154]]);
  stack(c, x + 72, G - 176, 18, 26, '#9a5440'); aerial(c, x + 88.5, G - 206);
  brick(c, x, G - 128, 110, 72, '#a8503a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 128, 110, 72);
  for (const wx of [x + 14, x + 66]) { poly(c, '#f1ede6', [[wx - 4, G - 112], [wx + 34, G - 112], [wx + 31, G - 120], [wx - 1, G - 120]], LINE, .4); rect(c, '#dcd6ca', wx + 13, G - 120, 4, 8, LINE, .25); sash(c, wx + 1, G - 110, 28, 42, { stone: '#f4f2ec' }); }
  rect(c, 'rgba(0,0,0,.25)', x - 3, G - 41.5, 116, 1.2);
  c.fillStyle = lg(c, 0, G - 62, 0, G - 42, [[0, '#6a3e2a'], [.15, BR], [1, '#3a2016']]); c.fillRect(x - 3, G - 62, 116, 20); c.strokeStyle = '#1e100a'; c.lineWidth = .5; c.strokeRect(x - 3, G - 62, 116, 20);
  rect(c, 'rgba(255,220,180,.18)', x - 2, G - 61, 114, .8);
  { const sx = x + 13, sy = G - 52, r = 11.4;   // round sign level with the board; KAHWA CAFE centred between it and the right edge
    c.beginPath(); c.arc(sx, sy, r + .8, 0, 7); c.fillStyle = '#1e100a'; c.fill(); c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fillStyle = lg(c, sx - r, sy - r, sx + r, sy + r, [[0, '#7a4a32'], [1, '#3a2016']]); c.fill();
    c.beginPath(); c.arc(sx, sy, r - 1.8, 0, 7); c.strokeStyle = CR; c.lineWidth = .5; c.stroke();
    for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * .32; line(c, CR, .5, [[sx + Math.cos(a) * 5.8, sy - 1 + Math.sin(a) * 5.8], [sx + Math.cos(a) * 7.6, sy - 1 + Math.sin(a) * 7.6]]); }
    poly(c, CR, [[sx - 6.6, sy + 1.8], [sx - 3.5, sy - 2.6], [sx - 1.8, sy - .4], [sx, sy - 4], [sx + 2.6, sy - .4], [sx + 4.4, sy - 2.6], [sx + 6.6, sy + 1.8]]);
    poly(c, BR, [[sx - 4.8, sy + 1.8], [sx - 3.5, sy - .3], [sx - 2.3, sy + 1.8]]); poly(c, BR, [[sx + 3.2, sy + 1.8], [sx + 4.4, sy - .3], [sx + 5.6, sy + 1.8]]);
    for (const [a, w] of [[3.4, 11.4], [5, 8.4], [6.6, 5.2]]) { c.beginPath(); c.moveTo(sx - w / 2, sy + a); for (let k = 0; k <= 6; k++) c.lineTo(sx - w / 2 + k * w / 6, sy + a + (k % 2 ? -.3 : .3)); c.strokeStyle = CR; c.lineWidth = .45; c.stroke(); }
    const L0 = sx + r + .8, R0 = x + 113; txt(c, 'KAHWA CAFE', (L0 + R0) / 2, sy + .4, 9.6, CR, { f: 'Oswald, sans-serif', w: 600, ls: 1.4, sh: 'rgba(0,0,0,.5)' }); }
  for (const lx of [x + 30, x + 60, x + 90]) { rect(c, '#1e100a', lx, G - 42.6, 4, 1); const g = c.createRadialGradient(lx + 2, G - 41, 0, lx + 2, G - 41, 7); g.addColorStop(0, 'rgba(255,224,150,.6)'); g.addColorStop(1, 'rgba(255,224,150,0)'); c.fillStyle = g; c.fillRect(lx - 6, G - 42, 16, 9); }
  // shopfront: brown posts, door with jar shelves, big window with a warm cafe inside, grey brick stall riser
  for (const px of [x - 2, x + 104]) { c.fillStyle = lg(c, px, 0, px + 8, 0, [[0, BH], [.5, BR], [1, '#2e1810']]); c.fillRect(px, G - 42, 8, 42); c.strokeStyle = '#1e100a'; c.lineWidth = .4; c.strokeRect(px, G - 42, 8, 42); }
  rect(c, '#2a1810', x + 6, G - 42, 98, 42);
  rect(c, '#141416', x + 8, G - 40, 25, 40); c.fillStyle = lg(c, 0, G - 37, 0, G, [[0, '#7a5434'], [1, '#4a3020']]); c.fillRect(x + 11, G - 37, 19, 37);
  for (const yy of [G - 32, G - 24, G - 16]) { rect(c, '#9a7050', x + 12, yy, 11, .7); for (let i = 0; i < 4; i++) { c.fillStyle = ['#e8b060', '#c0703a', '#f0d090', '#a05030'][i]; c.beginPath(); c.roundRect ? c.roundRect(x + 12.4 + i * 2.7, yy - 3.4, 2, 3.4, .5) : c.rect(x + 12.4 + i * 2.7, yy - 3.4, 2, 3.4); c.fill(); } }
  rect(c, '#9aa3ad', x + 27, G - 24, .6, 6); glare(c, x + 11, G - 37, 19, 37);
  c.fillStyle = lg(c, 0, G - 38, 0, G - 15, [[0, '#e8c088'], [.6, '#c8945c'], [1, '#9a6a3c']]); c.fillRect(x + 37, G - 38, 63, 23);
  rect(c, '#141416', x + 35, G - 40, 67, 1.6); rect(c, '#141416', x + 35, G - 40, 1.6, 26); rect(c, '#141416', x + 100.4, G - 40, 1.6, 26);
  pend(c, x + 51, G - 38, 3); pend(c, x + 71, G - 38, 4); pend(c, x + 88, G - 38, 3);
  for (const cx of [x + 44, x + 70]) { tableT(c, cx, G - 22, 11, '#8a5a30'); for (const s2 of [-1.6, 12.2]) { rect(c, '#7a4a24', cx + s2, G - 28, .9, 12); rect(c, '#7a4a24', cx + s2 - (s2 < 0 ? 0 : 1.6), G - 21.6, 2.4, .9); } }
  plant(c, x + 93, G - 15, 1.1); glare(c, x + 37, G - 38, 63, 23);
  rect(c, BR, x + 35, G - 14.6, 67, 2); brick(c, x + 35, G - 12.6, 67, 12.6, '#5c5e66', { bw: 2.4, bh: 1.2 });
  c.restore();
};

// Toro's Steakhouse: dark brick flats (upper floors shorter), white cornice, two white bays, black fascia with gold frame,
// bull head, TORO'S red with a white edge + STEAKHOUSE; living-wall shopfront; four windows each showing a different room
HD.toros = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const WH = '#f1eee6';
  c.save(); c.translate(0, -18);
  brick(c, x, G - 178, 200, 130, '#6a4234'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 178, 200, 130);
  rect(c, WH, x - 2, G - 184, 204, 8, LINE, .45); rect(c, '#d8d4ca', x - 2, G - 178, 204, 2); for (let i = 0; i < 50; i++) rect(c, 'rgba(0,0,0,.16)', x + i * 4, G - 176, 1.6, 1.2);
  for (const [px, pw] of [[x + 20, 40], [x + 120, 44]]) { c.fillStyle = lg(c, px, 0, px + pw, 0, [[0, '#ffffff'], [1, '#dedad2']]); c.fillRect(px, G - 108, pw, 60); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(px, G - 108, pw, 60); poly(c, WH, [[px - 4, G - 108], [px + pw / 2, G - 120], [px + pw + 4, G - 108]], LINE, .45); rect(c, '#d8d4ca', px, G - 106, pw, 1.6); }
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const wx = x + 10 + i * 40, wy = r ? G - 102 : G - 166; sash(c, wx, wy, 16, r ? 38 : 34, { stone: WH, key: r === 0 }); }
  for (let i = 0; i < 25; i++) rect(c, WH, x + 2 + i * 8, G - 52, 4, 1.6);
  c.fillStyle = lg(c, 0, G - 50, 0, G - 26, [[0, '#2a2829'], [1, '#141213']]); c.fillRect(x - 2, G - 50, 204, 24); c.strokeStyle = '#000'; c.lineWidth = .4; c.strokeRect(x - 2, G - 50, 204, 24);
  c.strokeStyle = '#c9a64a'; c.lineWidth = .6; c.strokeRect(x, G - 48.4, 200, 20.8);
  { const bx = x + 14, by = G - 38; c.fillStyle = '#f4f2ec'; c.beginPath(); c.moveTo(bx - 9.5, by - 7.5); c.quadraticCurveTo(bx - 7, by - 2.5, bx - 3.8, by - 2.6); c.lineTo(bx + 3.8, by - 2.6); c.quadraticCurveTo(bx + 7, by - 2.5, bx + 9.5, by - 7.5); c.quadraticCurveTo(bx + 8.6, by - .6, bx + 4.2, by); c.quadraticCurveTo(bx + 3.6, by + 7.6, bx, by + 8.4); c.quadraticCurveTo(bx - 3.6, by + 7.6, bx - 4.2, by); c.quadraticCurveTo(bx - 8.6, by - .6, bx - 9.5, by - 7.5); c.fill();
    for (const ex of [-2, 2]) { c.beginPath(); c.arc(bx + ex, by + .6, .7, 0, 7); c.fillStyle = '#1f1d1e'; c.fill(); } c.beginPath(); c.ellipse(bx, by + 6, 1.8, 1, 0, 0, 7); c.fillStyle = '#c9a64a'; c.fill(); }
  c.save(); c.font = '400 15px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 1.8; c.strokeStyle = '#f4f2ec'; c.strokeText("TORO'S", x + 76, G - 37.6); c.fillStyle = '#d8262f'; c.fillText("TORO'S", x + 76, G - 37.6); c.restore();
  txt(c, 'STEAKHOUSE', x + 162, G - 40.4, 7.4, '#f4f2ec', { f: 'Georgia, serif', w: 400, ls: 1.2 }); rect(c, '#c9a64a', x + 132, G - 34, 60, .6);
  c.restore();
  // living wall
  c.fillStyle = '#24561f'; c.fillRect(x, G - 46, 200, 46); for (let i = 0; i < 900; i++) { const lx = x + (i * 37.3) % 199, ly = G - 45.5 + (i * 13.7) % 45; c.fillStyle = ['#2f6a2e', '#3e8238', '#1c4a18', '#4f9a44'][i % 4]; c.beginPath(); c.ellipse(lx, ly, 1.1, .6, (i % 7) * .45, 0, 7); c.fill(); }
  const head = (hx, hy, skin, hair, top) => { c.beginPath(); c.moveTo(hx - 3.4, hy + 10); c.quadraticCurveTo(hx - 3.6, hy + 4.2, hx, hy + 4); c.quadraticCurveTo(hx + 3.6, hy + 4.2, hx + 3.4, hy + 10); c.fillStyle = top; c.fill(); c.beginPath(); c.arc(hx, hy + 2, 2.2, 0, 7); c.fillStyle = skin; c.fill(); c.beginPath(); c.arc(hx, hy + 1.4, 2.3, Math.PI, 0); c.fillStyle = hair; c.fill(); };
  for (let i = 0; i < 4; i++) { const wx = x + 10 + i * 36, wy = G - 41;
    rect(c, '#1f1d1e', wx, G - 42, 30, 38); c.fillStyle = lg(c, 0, wy, 0, wy + 36, [[0, '#5a3a2c'], [.75, '#4a3026'], [.76, '#2e1e18'], [1, '#24160f']]); c.fillRect(wx + 1, wy, 28, 36); for (let k = 0; k < 5; k++) rect(c, '#3a261e', wx + 1 + k * 6, wy + 28, .4, 8);
    if (i === 0) { pend(c, wx + 14.5, wy, 4, '#c9a64a'); head(c, wx + 8, wy + 13, '#c58c5c', '#1b1b1d', '#2f4a8a'); head(c, wx + 21, wy + 13, '#e0b48a', '#5a3a1e', '#a83a32'); tableT(c, wx + 6, wy + 22, 18); rect(c, '#f4f2ec', wx + 9, wy + 21.2, 4, .8); rect(c, '#f4f2ec', wx + 17, wy + 21.2, 4, .8); rect(c, '#b02a22', wx + 14.4, wy + 19, .6, 2.4); }
    else if (i === 1) { rect(c, '#c9a64a', wx + 9, wy + 3, 12, 8, '#6a4a10', .3); rect(c, '#2a1a14', wx + 10.4, wy + 4.4, 9.2, 5.2); rect(c, '#f4f2ec', wx + 13, wy + 6, 4, 1.6); c.fillStyle = lg(c, 0, wy + 15, 0, wy + 25, [[0, '#b83a30'], [1, '#7a1e1e']]); c.fillRect(wx + 2, wy + 15, 26, 10); head(c, wx + 7, wy + 12, '#8a5a3a', '#1b1b1d', '#e8e4dc'); head(c, wx + 15, wy + 14, '#c58c5c', '#2a1a14', '#3e7a4a'); head(c, wx + 23, wy + 12, '#c58c5c', '#1b1b1d', '#5a5f6e'); tableT(c, wx + 3, wy + 24, 24); }
    else if (i === 2) { rect(c, '#1f1d1e', wx + 2, wy + 3, 26, 7); for (let k = 0; k < 3; k++) { rect(c, '#f4f2ec', wx + 4 + k * 8, wy + 5, 6, .6); rect(c, '#f4f2ec', wx + 4 + k * 8, wy + 7, 4, .6); } c.fillStyle = lg(c, 0, wy + 11, 0, wy + 17, [[0, 'rgba(255,150,60,.6)'], [1, 'rgba(255,150,60,0)']]); c.fillRect(wx + 2, wy + 11, 26, 6); rect(c, '#e06a2a', wx + 2, wy + 12, 26, 2); head(c, wx + 15, wy + 11, '#e0b48a', '#f4f2ec', '#f4f2ec'); rect(c, '#f4f2ec', wx + 12.6, wy + 9, 5, 2.4); rect(c, '#6a4a3a', wx + 1, wy + 20, 28, 9); rect(c, '#8a6450', wx + 1, wy + 20, 28, 1.6); }
    else { pend(c, wx + 21.5, wy, 4, '#c9a64a'); tableT(c, wx + 10, wy + 17, 16); stool(c, wx + 9, wy + 29); stool(c, wx + 26, wy + 29); head(c, wx + 21, wy + 8, '#8a5a3a', '#1b1b1d', '#c8202a'); plant(c, wx + 5, wy + 30, .9); }
    glare(c, wx + 1, wy, 28, 36); }
  rect(c, '#3a2a20', x + 164, G - 40, 18, 40, '#1e140e', .4); c.fillStyle = lg(c, 0, G - 37, 0, G - 21, [[0, '#cfe0ee'], [1, '#6f8aa2']]); c.fillRect(x + 167, G - 37, 12, 16); c.beginPath(); c.arc(x + 173, G - 14, 1.4, 0, 7); c.fillStyle = '#f2c43a'; c.fill();
  c.restore();
};

// G&A Fast Food: brick house with a tiled roof + chimney, big three-pane window, black fascia with the stencil portrait
// panel, CHICKEN/PIZZA list, red G&A with a crown + FAST FOOD, number; black shopfront with warm booths and glass doors
HD.gna = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  c.save(); c.translate(0, -16);
  slate(c, [[x - 8, G - 118], [x + 158, G - 118], [x + 146, G - 150], [x + 4, G - 150]], '#7a4a3a');
  stack(c, x + 112, G - 172, 22, 30, '#8a4a36', 3); aerial(c, x + 128.5, G - 200, 28);
  brick(c, x, G - 120, 150, 70, '#5e4036'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 120, 150, 70);
  rect(c, '#e2e6ea', x + 43, G - 117, 64, 62, LINE, .45); for (let i = 0; i < 3; i++) { c.fillStyle = lg(c, x + 46 + i * 20, G - 114, x + 64 + i * 20, G - 58, [[0, '#d4e0ea'], [.5, '#7f93a6'], [1, '#4a5b6c']]); c.fillRect(x + 46.5 + i * 20, G - 114, 17, 56); } glare(c, x + 46, G - 114, 58, 56); rect(c, '#e2e6ea', x + 42, G - 55, 66, 1.6, LINE, .3);
  c.fillStyle = lg(c, 0, G - 52, 0, G - 26, [[0, '#1e1e22'], [1, '#0c0c0e']]); c.fillRect(x - 2, G - 52, 154, 26); c.strokeStyle = '#000'; c.lineWidth = .4; c.strokeRect(x - 2, G - 52, 154, 26);
  // stencil portrait (smiling bald man, beard, dark suit, open white collar) on a white slatted panel
  { const px = x + 2, py = G - 50; rect(c, '#efefef', px, py, 30, 22, '#000', .4); for (let j = 1; j < 7; j++) rect(c, 'rgba(0,0,0,.1)', px, py + j * 3.2, 30, .3);
    c.fillStyle = '#1b1b1d'; c.beginPath(); c.moveTo(px + 4, py + 22); c.quadraticCurveTo(px + 6, py + 16, px + 12, py + 15.4); c.lineTo(px + 18, py + 15.4); c.quadraticCurveTo(px + 24, py + 16, px + 26, py + 22); c.fill();
    poly(c, '#f6f6f6', [[px + 13, py + 15.4], [px + 15, py + 19], [px + 17, py + 15.4]]);
    c.beginPath(); c.ellipse(px + 15, py + 9, 5, 6, 0, 0, 7); c.fillStyle = '#d4d4d6'; c.fill(); c.strokeStyle = '#1b1b1d'; c.lineWidth = .6; c.stroke();
    c.beginPath(); c.ellipse(px + 15, py + 12.6, 3.6, 2.6, 0, 0, Math.PI); c.fillStyle = '#6a6a70'; c.fill();
    for (const ex of [-2, 2]) { c.beginPath(); c.arc(px + 15 + ex, py + 8.4, .55, 0, 7); c.fillStyle = '#1b1b1d'; c.fill(); }
    c.beginPath(); c.arc(px + 15, py + 11.4, 2, .15 * Math.PI, .85 * Math.PI); c.strokeStyle = '#1b1b1d'; c.lineWidth = .5; c.stroke(); }
  for (const [i, w] of [[0, 'Chicken'], [1, 'Pan Peri'], [2, 'Pizza'], [3, 'Burgers'], [4, 'Kebabs']]) txt(c, w, x + 35, G - 48.6 + i * 4.3, 3, '#f2f2f2', { a: 'left', f: 'Mont, sans-serif' });
  // crown + G&A + FAST FOOD
  poly(c, '#e0391e', [[x + 83, G - 51.6], [x + 84, G - 55.6], [x + 87.4, G - 53.4], [x + 92, G - 57.6], [x + 96.6, G - 53.4], [x + 100, G - 55.6], [x + 101, G - 51.6]]);
  for (const cx of [x + 84, x + 92, x + 100]) { c.beginPath(); c.arc(cx, G - 56.2, .8, 0, 7); c.fillStyle = '#e0391e'; c.fill(); }
  txt(c, 'G&A', x + 92, G - 42.8, 13, '#e0391e', { f: 'Georgia, serif', w: 700 }); rect(c, '#e0391e', x + 76, G - 35.8, 32, .5); txt(c, 'F A S T   F O O D', x + 92, G - 32.6, 3.2, '#e0391e', { f: 'Georgia, serif', w: 700 });
  for (let i = 0; i < 4; i++) rect(c, '#e0391e', x + 124 + i * 4, G - 50, .8, 7); txt(c, '49 38 38', x + 132, G - 39.6, 3.2, '#fff', { f: 'Mont, sans-serif' }); txt(c, '70 70 66', x + 132, G - 35.4, 3.2, '#fff', { f: 'Mont, sans-serif' });
  c.restore();
  rect(c, '#121214', x, G - 42, 150, 42);
  for (const [wx, ww] of [[x + 8, 44], [x + 98, 44]]) { c.fillStyle = lg(c, 0, G - 39, 0, G - 2, [[0, '#ecc896'], [.5, '#e3bf8c'], [.52, '#f3e6cc'], [1, '#e6d4b0']]); c.fillRect(wx, G - 39, ww, 37); for (let k = 0; k < ww; k += 3) rect(c, 'rgba(160,110,60,.25)', wx + k, G - 39, .4, 19);
    for (let k = 0; k < 3; k++) pend(c, wx + 7 + k * 15, G - 39, 3.6);
    rect(c, '#b0573e', wx + 3, G - 16, 12, 9); rect(c, '#8a4230', wx + 3, G - 16, 12, 1.6); tableT(c, wx + 19, G - 15, 11, '#e9e3d8'); tableT(c, wx + ww - 13, G - 17, 10, '#e9e3d8');
    rect(c, '#121214', wx + ww / 2 - .4, G - 39, .8, 37); glare(c, wx, G - 39, ww, 37); }
  rect(c, '#1a1a1d', x + 54, G - 40, 42, 40); for (const dx of [x + 56, x + 76]) { c.fillStyle = lg(c, 0, G - 38, 0, G, [[0, '#e3bf8c'], [.37, '#e3bf8c'], [.38, '#efe0c2'], [1, '#e2d2b0']]); c.fillRect(dx, G - 38, 18, 38); rect(c, '#b6bcc4', dx + (dx === x + 56 ? 15 : 2), G - 22, 1, 8); glare(c, dx, G - 38, 18, 38); }
  rect(c, '#1a1a1d', x + 74.6, G - 40, .8, 40);
  rect(c, '#f4f4f2', x + 14, G - 37, 18, 7, '#000', .3); txt(c, 'OPEN', x + 23, G - 33.4, 4.6, '#1a1a1d', { f: 'Mont, sans-serif' });
  c.restore();
};

// Tops Pizza: brick house with a black-and-white mock-Tudor gable, two white bay windows, black fascia with the top hat
// (tall crown, red band, curled brim), Tops Pizza + DELIVERY; bright glass shopfront with a blue LED trim, posters, counter, stools
HD.topspizza = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const U = 22;
  brick(c, x, G - 120 - U, 180, 76, '#6a3e30'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 120 - U, 180, 76);
  slate(c, [[x - 6, G - 118 - U], [x + 186, G - 118 - U], [x + 172, G - 130 - U], [x + 8, G - 130 - U]], '#3a3436');
  poly(c, '#f0ebe4', [[x + 50, G - 118 - U], [x + 90, G - 166 - U], [x + 130, G - 118 - U]], LINE, .45);
  c.save(); c.beginPath(); c.moveTo(x + 52, G - 118 - U); c.lineTo(x + 90, G - 164 - U); c.lineTo(x + 128, G - 118 - U); c.closePath(); c.clip();
  for (let i = 0; i < 6; i++) rect(c, '#262224', x + 54 + i * 15, G - 166 - U, 2.6, 48); rect(c, '#262224', x + 50, G - 140 - U, 80, 2.4); for (const [a, b] of [[54, 82], [126, 98]]) line(c, '#262224', 2, [[x + a, G - 120 - U], [x + b, G - 140 - U]]); c.restore();
  poly(c, '#262224', [[x + 46, G - 116 - U], [x + 90, G - 170 - U], [x + 134, G - 116 - U], [x + 128, G - 116 - U], [x + 90, G - 163 - U], [x + 52, G - 116 - U]], LINE, .35);
  sash(c, x + 80, G - 150 - U, 20, 16, { stone: '#f4f2ec' });
  for (const bx of [x + 22, x + 112]) { const y0 = G - 106 - U;
    slate(c, [[bx - 2, y0], [bx + 46, y0], [bx + 40, y0 - 5], [bx + 4, y0 - 5]], '#3a3436');
    for (const [a, b] of [[0, 8], [36, 44]]) { rect(c, '#f4f2ec', bx + a, y0, 8, 26, LINE, .35); c.fillStyle = lg(c, bx + a, y0, bx + b, y0 + 26, [[0, '#d4e2ec'], [1, '#6f8aa2']]); c.fillRect(bx + a + 1.6, y0 + 2.6, 4.8, 19); }
    rect(c, '#f4f2ec', bx + 8, y0, 28, 26, LINE, .35); for (const wx of [bx + 10, bx + 23]) { c.fillStyle = lg(c, wx, y0, wx + 11, y0 + 24, [[0, '#dbe6ee'], [1, '#7a94aa']]); c.fillRect(wx, y0 + 2, 11, 22); } rect(c, '#f4f2ec', bx + 10, y0 + 8, 24, .8); glare(c, bx + 10, y0 + 2, 24, 22);
    poly(c, '#dcd7ce', [[bx - 2, y0 + 26], [bx + 46, y0 + 26], [bx + 40, y0 + 32], [bx + 4, y0 + 32]], LINE, .35); }
  // fascia + top hat
  c.fillStyle = lg(c, 0, G - 68, 0, G - 46, [[0, '#1e1e22'], [1, '#0c0c0e']]); c.fillRect(x - 2, G - 68, 184, 22); rect(c, '#e0262a', x + 50, G - 68, 1.6, 22);
  { const hx = x + 27; c.fillStyle = lg(c, hx - 5, 0, hx + 5, 0, [[0, '#0c0c10'], [.4, '#3a3a46'], [1, '#0c0c10']]);
    c.beginPath(); c.moveTo(hx - 5.6, G - 67); c.lineTo(hx + 5.6, G - 67); c.lineTo(hx + 4.4, G - 56); c.lineTo(hx - 4.4, G - 56); c.closePath(); c.fill(); c.strokeStyle = '#f4f2ec'; c.lineWidth = .5; c.stroke();
    rect(c, '#e0262a', hx - 4.5, G - 59, 9, 2);
    c.beginPath(); c.moveTo(hx - 11.4, G - 57.6); c.quadraticCurveTo(hx - 10.4, G - 54, hx - 6, G - 54.6); c.lineTo(hx + 6, G - 54.6); c.quadraticCurveTo(hx + 10.4, G - 54, hx + 11.4, G - 57.6); c.quadraticCurveTo(hx + 10, G - 52, hx, G - 52); c.quadraticCurveTo(hx - 10, G - 52, hx - 11.4, G - 57.6); c.fillStyle = '#121216'; c.fill(); c.strokeStyle = '#f4f2ec'; c.lineWidth = .5; c.stroke(); }
  txt(c, 'Tops Pizza', x + 117, G - 58.6, 16, '#f2e6c4', { f: 'Georgia, serif', w: 700, sh: 'rgba(0,0,0,.6)' }); txt(c, 'DELIVERY', x + 152, G - 49.6, 4.6, '#e0262a', { f: 'Mont, sans-serif', ls: .6 });
  // shopfront
  rect(c, '#1c1830', x, G - 46, 180, 46); rect(c, '#e0262a', x, G - 46, 180, .8); rect(c, '#5a7cff', x + 1, G - 45, 178, 1.4); rect(c, '#5a7cff', x + 1, G - 45, 1.4, 44); rect(c, '#5a7cff', x + 177.6, G - 45, 1.4, 44);
  { const g = c.createLinearGradient(0, G - 46, 0, G - 40); g.addColorStop(0, 'rgba(120,150,255,.5)'); g.addColorStop(1, 'rgba(120,150,255,0)'); c.fillStyle = g; c.fillRect(x + 2, G - 44, 176, 6); }
  c.fillStyle = lg(c, 0, G - 42, 0, G - 2, [[0, '#fbfcfd'], [.6, '#eef0f3'], [1, '#dde1e6']]); c.fillRect(x + 4, G - 42, 172, 40);
  const PO = (px, py, w, h) => { rect(c, '#e0262a', px, py, w, h, '#7a1012', .3); rect(c, '#f2c43a', px + 1.6, py + 1.6, w - 3.2, 2.4); for (const k of [6, 8.6]) rect(c, '#ffffff', px + 1.6, py + k, w - 5 - (k - 6), .6); c.beginPath(); c.arc(px + w / 2, py + h - 5, Math.min(w, h) * .18, 0, 7); c.fillStyle = '#f6c35a'; c.fill(); };
  PO(x + 8, G - 40, 16, 20); PO(x + 40, G - 40, 14, 16); PO(x + 100, G - 40, 14, 16); PO(x + 150, G - 40, 16, 20);
  for (let i = 0; i < 7; i++) rect(c, '#c8ccd2', x + 58 + i * 6, G - 40, 4, 6, '#9aa0a8', .2);
  rect(c, '#b9c0c8', x + 60, G - 22, 66, 2.4); c.fillStyle = lg(c, 0, G - 20, 0, G - 2, [[0, '#f2f4f6'], [1, '#d6dbe0']]); c.fillRect(x + 60, G - 19.6, 66, 17.6); rect(c, '#e0262a', x + 66, G - 16, 54, 1.6);
  for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x + 74.5 + i * 12, G - 24.6, 4.6, 1.6, 0, 0, 7); c.fillStyle = '#d8a860'; c.fill(); c.fillStyle = '#c0392b'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + 72 + i * 12 + k * 2.4, G - 24.8, .5, 0, 7); c.fill(); } }
  for (let i = 0; i < 4; i++) stool(c, x + 13.5 + i * 11, G, i % 2 ? '#1c1c20' : '#e0262a');
  for (const fx of [x + 56, x + 134]) rect(c, '#3a3d44', fx, G - 42, 1.6, 42); rect(c, '#3a3d44', x + 4, G - 22, 50, .6);
  rect(c, '#2a2a2e', x + 138, G - 30, 36, 28, '#000', .3); rect(c, '#e8a33c', x + 141, G - 27, 30, 1.6); txt(c, 'OPEN', x + 156, G - 20.4, 6, '#f2c43a', { f: 'Mont, sans-serif' });
  glare(c, x + 4, G - 42, 172, 40);
  c.restore();
};

// Al-Quds: pale yellow brick, white parapet, arched-headed windows, slate bay, black fascia AL-QUDS gold + ARABIC . GRILL .
// SHAWARMA red + halal; warm restaurant with lamps, tables and red chairs; dark tiled stall riser
HD.alquds = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const Y = '#ecdfa0';
  c.save(); c.translate(0, -10);
  slate(c, [[x - 4, G - 150], [x + 164, G - 150], [x + 150, G - 166], [x + 10, G - 166]], '#4a4d54');
  stack(c, x + 22, G - 176, 14, 12, '#7a4a3a'); stack(c, x + 128, G - 176, 14, 12, '#7a4a3a');
  brick(c, x, G - 150, 160, 90, Y, { mortar: 'rgba(255,255,240,.5)' }); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 150, 160, 90); rect(c, '#f6f4ee', x - 2, G - 152, 164, 4, LINE, .4);
  const aw = (wx, wy, w, h) => { c.beginPath(); c.moveTo(wx - 2.2, wy - 2); c.quadraticCurveTo(wx + w / 2, wy - 6.4, wx + w + 2.2, wy - 2); c.lineTo(wx + w + 2.2, wy); c.lineTo(wx - 2.2, wy); c.closePath(); c.fillStyle = '#d8c98a'; c.fill(); c.strokeStyle = LINE; c.lineWidth = .3; c.stroke(); sash(c, wx + 1, wy + 1, w - 2, h - 2, { stone: '#f4f2ec' }); };
  aw(x + 12, G - 140, 16, 26); aw(x + 68, G - 140, 26, 26); aw(x + 132, G - 140, 16, 26); aw(x + 12, G - 96, 16, 26); aw(x + 132, G - 96, 16, 26);
  slate(c, [[x + 52, G - 98], [x + 60, G - 106], [x + 100, G - 106], [x + 108, G - 98]], '#3a3d44');
  rect(c, '#f4f2ec', x + 54, G - 98, 52, 30, LINE, .4); for (let i = 0; i < 3; i++) { c.fillStyle = lg(c, x + 57 + i * 16, G - 95, x + 71 + i * 16, G - 71, [[0, '#d4e0ea'], [1, '#6f8aa2']]); c.fillRect(x + 57 + i * 16, G - 95, 14, 24); } glare(c, x + 57, G - 95, 46, 24);
  rect(c, '#2a2a2e', x + 150, G - 150, 1.2, 96);
  rect(c, '#2a2c30', x - 2, G - 62, 164, 6, '#000', .3);
  c.fillStyle = lg(c, 0, G - 56, 0, G - 30, [[0, '#3e3e40'], [1, '#262628']]); c.fillRect(x + 4, G - 56, 152, 26); c.strokeStyle = '#000'; c.lineWidth = .4; c.strokeRect(x + 4, G - 56, 152, 26);
  txt(c, 'AL-QUDS', x + 72, G - 48, 12, '#f2c43a', { f: 'Oswald, sans-serif', w: 600, ls: 1.4, sh: '#6a4a08' });
  txt(c, 'ARABIC  ·  GRILL  ·  SHAWARMA', x + 80, G - 37.6, 4.6, '#e0263a', { f: 'Mont, sans-serif', ls: .6 });
  txt(c, 'مطعم القدس', x + 140, G - 48, 5.6, '#ffffff', { f: 'Amiri', rtl: 1 }); txt(c, 'حلال', x + 18, G - 48, 5.6, '#ffffff', { f: 'Amiri', rtl: 1 });
  rect(c, '#1a1c20', x + 6, G - 28, 150, 28); rect(c, '#2a2c30', x + 6, G - 30, 150, 2);
  rect(c, '#1a1c20', x + 8, G - 26, 22, 26); c.fillStyle = lg(c, 0, G - 24, 0, G, [[0, '#dcb478'], [1, '#a87a44']]); c.fillRect(x + 10, G - 24, 18, 24); rect(c, '#a8aeb6', x + 26, G - 14, .6, 6); glare(c, x + 10, G - 24, 18, 24);
  c.fillStyle = lg(c, 0, G - 26, 0, G, [[0, '#d8a868'], [.35, '#b8894e'], [1, '#8a6238']]); c.fillRect(x + 32, G - 26, 122, 26); for (let k = 0; k < 122; k += 3) rect(c, 'rgba(120,80,40,.3)', x + 32 + k, G - 26, .4, 9);
  for (let i = 0; i < 6; i++) pend(c, x + 40 + i * 20, G - 26, 3, '#3a2a1e');
  for (let i = 0; i < 5; i++) { const tx2 = x + 38 + i * 24; tableT(c, tx2, G - 11, 14, '#5a3a24'); for (const sx2 of [tx2 - 3, tx2 + 14]) { c.fillStyle = '#8a2226'; c.beginPath(); c.roundRect ? c.roundRect(sx2, G - 13, 3, 13, .6) : c.rect(sx2, G - 13, 3, 13); c.fill(); } }
  for (const fx of [x + 52, x + 74, x + 92, x + 114, x + 134]) rect(c, '#1a1c20', fx, G - 26, 1.4, 26); rect(c, '#1a1c20', x + 32, G - 17, 122, .6);
  glare(c, x + 32, G - 26, 122, 26); c.beginPath(); c.arc(x + 41, G - 21, 2.6, 0, 7); c.fillStyle = '#2fb35a'; c.fill(); txt(c, 'حلال', x + 41, G - 21, 1.8, '#fff', { f: 'Amiri', rtl: 1 });
  c.restore();
  rect(c, '#2a2c30', x, G - 10, 160, 10); for (let i = 0; i < 40; i++) rect(c, i % 2 ? '#3a3d44' : '#30333a', x + .5 + i * 4, G - 9.5, 3.6, 4.2); for (let i = 0; i < 40; i++) rect(c, i % 2 ? '#30333a' : '#3a3d44', x + .5 + i * 4, G - 5, 3.6, 4.2);
  c.restore();
};

// Krispy Lemon Chicken (from the photo): one storey of red brick over the shop under a flat roof with a dark fascia that
// overhangs; two white uPVC casements set right up under the fascia (one opened), wall lamps; maroon sign straight under the
// windows (Krispy Lemon / Chicken, Original est. 2007, running chicken, phone); white strip of dishes over a red-framed shopfront
HD.krispy = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const TOP = G - 112;
  brick(c, x, TOP, 140, 64, '#a8503a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, TOP, 140, 64);
  c.fillStyle = lg(c, 0, TOP - 7, 0, TOP, [[0, '#4a4b50'], [1, '#26272b']]); c.fillRect(x - 6, TOP - 7, 152, 7); c.strokeStyle = '#141416'; c.lineWidth = .4; c.strokeRect(x - 6, TOP - 7, 152, 7); rect(c, '#5c5d63', x - 6, TOP - 7, 152, .8);
  rect(c, 'rgba(0,0,0,.28)', x, TOP, 140, 2.4);   // shadow under the eaves
  const win = (wx, openL) => { const wy = TOP + 3, w = 30, h = 30; rect(c, '#f6f6f2', wx, wy, w, h, '#9a9890', .4);
    for (const [a, b] of [[2, 12], [16, 12]]) { c.fillStyle = lg(c, wx + a, wy, wx + a + b, wy + h, [[0, '#cfdbe4'], [.55, '#7a8fa2'], [1, '#4f6070']]); c.fillRect(wx + a, wy + 2, b, h - 4); }
    rect(c, '#f6f6f2', wx + 14, wy, 2, h); rect(c, '#f6f6f2', wx + 2, wy + 10, 12, 1.4); glare(c, wx + 2, wy + 2, w - 4, h - 4);
    if (openL !== undefined) { const ox = openL ? wx + 2 : wx + 28, d = openL ? -1 : 1; poly(c, '#f6f6f2', [[ox, wy + 2], [ox + d * 5, wy - .6], [ox + d * 5, wy + h + .2], [ox, wy + h - 2]], '#9a9890', .35); c.fillStyle = 'rgba(150,175,195,.7)'; c.beginPath(); c.moveTo(ox + d * 1, wy + 3.4); c.lineTo(ox + d * 4, wy + 1.6); c.lineTo(ox + d * 4, wy + h - 1.4); c.lineTo(ox + d * 1, wy + h - 3); c.fill(); rect(c, '#1a1a1e', openL ? wx + 2 : wx + 16, wy + 2, 12, h - 4); }
    rect(c, '#e6e4de', wx - 2, wy + h, w + 4, 2, '#9a9890', .3); };
  win(x + 30, true); win(x + 82, false);
  for (const lx of [x + 12, x + 122]) { rect(c, '#2a2a2e', lx, G - 86, 6, 4, '#000', .3); rect(c, '#fffbe6', lx + 1, G - 82.6, 4, 1); const g = c.createRadialGradient(lx + 3, G - 82, 0, lx + 3, G - 82, 9); g.addColorStop(0, 'rgba(255,250,220,.5)'); g.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = g; c.fillRect(lx - 6, G - 84, 18, 12); }
  const st = G - 76, sb = G - 50;   // sign (level with Toro's)
  c.fillStyle = lg(c, 0, st, 0, sb, [[0, '#86283e'], [1, '#5a1828']]); c.fillRect(x + 10, st, 120, sb - st); c.strokeStyle = '#2a0810'; c.lineWidth = .5; c.strokeRect(x + 10, st, 120, sb - st);
  txt(c, 'Krispy Lemon', x + 60, st + 8, 9, '#f2c96b', { f: 'Mont, sans-serif', w: 700 }); txt(c, 'Chicken', x + 60, st + 17.4, 9, '#f2c96b', { f: 'Mont, sans-serif', w: 700 }); txt(c, 'Original', x + 60, st + 23.4, 2.8, '#f2c96b', { f: 'Georgia, serif', w: 400 });
  { const bx = x + 112, by = st + 10; c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(bx, by + 1, 4.4, 3, -.2, 0, 7); c.fill(); c.beginPath(); c.arc(bx + 3.4, by - 3, 1.8, 0, 7); c.fill();
    poly(c, '#f2b23e', [[bx + 5, by - 3.4], [bx + 7.4, by - 2.6], [bx + 5, by - 2]]); poly(c, '#d84b3c', [[bx + 2.6, by - 4.6], [bx + 3.4, by - 6.2], [bx + 4.2, by - 4.6]]);
    for (let i = 0; i < 4; i++) line(c, '#ffffff', .8, [[bx - 3.6, by - .4 + i * .4], [bx - 7 - i * .4, by - 4 + i * 1.6]]);
    line(c, '#f2b23e', .6, [[bx - 1, by + 3.6], [bx - 3, by + 7]]); line(c, '#f2b23e', .6, [[bx + 1.4, by + 3.6], [bx + 3.4, by + 7]]); c.beginPath(); c.arc(bx + 3.8, by - 3.2, .35, 0, 7); c.fillStyle = '#1b1a24'; c.fill(); }
  txt(c, '01582 502123', x + 112, st + 21, 3.4, '#ffffff', { f: 'Mont, sans-serif' });
  // white strip of dishes, red underside
  rect(c, '#f6f6f4', x + 4, G - 50, 132, 6, '#9a9890', .3); txt(c, 'BURGERS • KEBAB ROLLS • PIZZA • CHICKEN & CHIPS • STRIPS & CHIPS • JACKET POTATO', x + 70, G - 47, 2.7, '#7a1a22', { f: 'Mont, sans-serif' }); rect(c, '#d62828', x + 4, G - 44, 132, 2);
  // side pillars in grey brick, red-framed shopfront
  for (const px of [x, x + 130]) brick(c, px, G - 42, 10, 42, '#9a9c9e', { bw: 2.4, bh: 1.1 });
  rect(c, '#d62828', x + 10, G - 42, 120, 42);
  c.fillStyle = lg(c, 0, G - 40, 0, G, [[0, '#f2ead6'], [1, '#d8cfb8']]); c.fillRect(x + 13, G - 40, 30, 40); rect(c, '#9aa0a8', x + 13, G - 40, 30, 40, '#1a1a1e', .6);
  c.fillStyle = lg(c, 0, G - 38, 0, G, [[0, '#e8dcc0'], [1, '#b89a70']]); c.fillRect(x + 15, G - 38, 26, 38); rect(c, '#d62828', x + 27.6, G - 40, 1.2, 40);
  txt(c, 'OPEN 7', x + 21.4, G - 32, 3, '#f2c43a', { f: 'Mont, sans-serif' }); txt(c, 'DAYS A', x + 21.4, G - 28.4, 3, '#f2c43a', { f: 'Mont, sans-serif' }); txt(c, 'WEEK', x + 21.4, G - 24.8, 3, '#f2c43a', { f: 'Mont, sans-serif' });
  rect(c, '#1a1a1e', x + 31, G - 30, 8, 14); rect(c, '#c0c6cc', x + 37, G - 20, .6, 5); glare(c, x + 15, G - 38, 26, 38);
  // main window: counter, menu screens, CALL TO ORDER, grey brick stall riser
  c.fillStyle = lg(c, 0, G - 40, 0, G - 14, [[0, '#f6efdc'], [.5, '#e6d6b0'], [1, '#c8a878']]); c.fillRect(x + 46, G - 40, 82, 26); rect(c, '#d62828', x + 85.6, G - 40, 1.2, 26);
  pend(c, x + 60, G - 40, 1.6); pend(c, x + 110, G - 40, 1.6);
  for (let k = 0; k < 3; k++) { const mx = x + 50 + k * 26; rect(c, '#1f2a3a', mx, G - 37, 22, 7, '#000', .2); rect(c, '#f2c43a', mx + 2, G - 35.6, 12, .5); rect(c, '#fff', mx + 2, G - 34, 9, .4); c.beginPath(); c.arc(mx + 18, G - 33.4, 1.4, 0, 7); c.fillStyle = '#e0393a'; c.fill(); }
  txt(c, 'CALL TO ORDER:', x + 72, G - 26.6, 2.8, '#f2c43a', { f: 'Mont, sans-serif' }); txt(c, '01582 502123', x + 72, G - 23, 4, '#f2c43a', { f: 'Mont, sans-serif' });
  rect(c, '#c9ced4', x + 92, G - 22, 34, 1.4); c.fillStyle = lg(c, 0, G - 21, 0, G - 14, [[0, '#b2bac4'], [1, '#8a929c']]); c.fillRect(x + 92, G - 20.6, 34, 6.6); c.beginPath(); c.ellipse(x + 101, G - 23.4, 4.4, 1.3, 0, 0, 7); c.fillStyle = '#e7b04a'; c.fill(); c.beginPath(); c.ellipse(x + 115, G - 23.4, 3.6, 1.2, 0, 0, 7); c.fillStyle = '#d84b3c'; c.fill();
  glare(c, x + 46, G - 40, 82, 26);
  brick(c, x + 44, G - 14, 86, 14, '#a8aaac', { bw: 2.4, bh: 1.1 }); rect(c, '#d62828', x + 44, G - 14.6, 86, 1);
  c.restore();
};

// Karwan Afghan Cuisine: low white unit, black KARWAN AFGHAN CUISINE board with 5-7 + phone, WELCOME KARWAN panel, teal sign,
// three warm dining windows over grey panels, dark door, tree behind, red pavement strip
HD.karwan = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  tree(c, x + 168, G - 60, 1.3, { d: '#3a6b2c', m: '#4f8a3c', l: '#86c060' });
  c.fillStyle = lg(c, 0, G - 74, 0, G, [[0, '#f6f4ef'], [1, '#e6e3dc']]); c.fillRect(x, G - 74, 230, 74); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 74, 230, 74);
  c.fillStyle = lg(c, 0, G - 72, 0, G - 50, [[0, '#1e1e22'], [1, '#0a0a0c']]); c.fillRect(x + 2, G - 72, 168, 22); c.strokeStyle = '#000'; c.strokeRect(x + 2, G - 72, 168, 22);
  txt(c, 'KARWAN', x + 70, G - 64.6, 12.4, '#e8262c', { f: 'Oswald, sans-serif', w: 600, ls: 2.4 }); txt(c, 'AFGHAN  CUISINE', x + 70, G - 54.4, 4.8, '#ffffff', { f: 'Mont, sans-serif', ls: 1.2 });
  txt(c, '5-7', x + 11, G - 62, 5, '#ffffff', { f: 'Mont, sans-serif' }); txt(c, '01582 730111', x + 146, G - 61, 4.4, '#ffffff', { f: 'Mont, sans-serif' });
  rect(c, '#121214', x + 172, G - 72, 46, 22, '#000', .3); txt(c, 'WELCOME', x + 195, G - 65.4, 5.4, '#ffffff', { f: 'Mont, sans-serif', ls: .6 }); txt(c, 'KARWAN', x + 195, G - 58.6, 5.2, '#e8262c', { f: 'Oswald, sans-serif', w: 600, ls: .8 }); txt(c, 'AFGHAN CUISINE', x + 195, G - 53.6, 2.4, '#fff', { f: 'Mont, sans-serif' });
  rect(c, '#2aa8b8', x + 220, G - 76, 12, 18, '#0e5a64', .3); line(c, '#fff', .5, [[x + 224, G - 72], [x + 224, G - 63]]); line(c, '#fff', .5, [[x + 227.6, G - 72], [x + 227.6, G - 63]]); c.beginPath(); c.arc(x + 224, G - 72.6, 1, Math.PI, 0); c.strokeStyle = '#fff'; c.lineWidth = .5; c.stroke();
  for (const [wx, ww] of [[x + 6, 34], [x + 46, 74], [x + 126, 40]]) { rect(c, '#2a2a2e', wx, G - 46, ww, 26); c.fillStyle = lg(c, 0, G - 44, 0, G - 22, [[0, '#9a7a56'], [.3, '#6a4a34'], [1, '#4e3424']]); c.fillRect(wx + 1.6, G - 44.4, ww - 3.2, 22.8);
    for (let k = 0; k * 12 < ww - 8; k++) pend(c, wx + 6 + k * 12, G - 44.4, 2.4, '#2a1e16');
    for (let k = 0; k * 14 < ww - 10; k++) { const tx = wx + 4 + k * 14; tableT(c, tx, G - 30, 9, '#f1efea'); c.fillStyle = '#8a1d2a'; c.fillRect(tx - 2, G - 32, 1.8, 10); }
    glare(c, wx + 1.6, G - 44.4, ww - 3.2, 22.8); c.fillStyle = lg(c, 0, G - 20, 0, G, [[0, '#4a505a'], [1, '#30353e']]); c.fillRect(wx, G - 20, ww, 20); c.strokeStyle = '#1a1a1e'; c.lineWidth = .35; c.strokeRect(wx, G - 20, ww, 20); }
  rect(c, '#2a2a2e', x + 176, G - 46, 40, 46); c.fillStyle = lg(c, 0, G - 44, 0, G, [[0, '#6a7280'], [1, '#3a404a']]); c.fillRect(x + 178, G - 44, 16, 44); rect(c, '#1a1a1e', x + 196, G - 44, 18, 44); glare(c, x + 178, G - 44, 16, 44);
  rect(c, '#c96a5a', x - 6, G - 3, 242, 3);
  c.restore();
};

// Peri-Peri Original (from the photo): one long glass front over the whole width under a deep louvred charcoal fascia with
// red Peri-Peri over the white ORIGINAL label and the phone number; a short clad upper storey on the right two-thirds whose two
// wide windows carry white chevron vinyl with coloured dots; hipped tile roof, ridge tiles, chimney on the right
HD.periperi = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const UP = x + 64, UW = 116, FT = G - 66, UT = G - 102;
  const clad = (bx, by, w, h, col) => { c.fillStyle = lg(c, bx, 0, bx + w, 0, [[0, shade(col, 1.06)], [1, shade(col, .92)]]); c.fillRect(bx, by, w, h); for (let xx = bx + 9; xx < bx + w; xx += 9) rect(c, 'rgba(0,0,0,.12)', xx, by, .3, h); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(bx, by, w, h); };
  stack(c, UP + 96, UT - 26, 12, 16, '#9a5440', 1);
  slate(c, [[UP - 4, UT], [UP + UW + 4, UT], [UP + UW - 10, UT - 15], [UP + 10, UT - 15]], '#4a3a34'); for (let k = UP + 11; k < UP + UW - 10; k += 2.4) { c.beginPath(); c.arc(k, UT - 15, 1.1, Math.PI, 0); c.fillStyle = '#5a463e'; c.fill(); }
  clad(UP, UT, UW, FT - UT, '#7a7e86');
  for (const [wx, ww] of [[UP + 15, 40], [UP + 64, 42]]) { rect(c, '#3a3d44', wx - 1.4, UT + 4, ww + 2.8, 25); c.fillStyle = lg(c, 0, UT + 5, 0, UT + 28, [[0, '#f8f2e0'], [1, '#e8dcc0']]); c.fillRect(wx, UT + 5.4, ww, 22.2);
    c.save(); c.beginPath(); c.rect(wx, UT + 5.4, ww, 22.2); c.clip(); for (let r = 0; r < 4; r++) { const yy = UT + 9 + r * 5.6; c.beginPath(); for (let k = 0; k <= ww / 3; k++) c.lineTo(wx + k * 3, yy + (k % 2 ? -1.6 : 1.6)); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = 'rgba(160,140,110,.35)'; c.lineWidth = .3; c.stroke(); }
      for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(wx + 3 + (i * 13.7) % (ww - 6), UT + 8 + (i * 7.3) % 18, .7, 0, 7); c.fillStyle = ['#e0281a', '#4caf50', '#f2a33a', '#f2d23a'][i % 4]; c.fill(); }
      for (let i = 0; i < 3; i++) { const g = c.createRadialGradient(wx + 8 + i * 13, UT + 10, 0, wx + 8 + i * 13, UT + 10, 4); g.addColorStop(0, 'rgba(255,255,230,.9)'); g.addColorStop(1, 'rgba(255,255,230,0)'); c.fillStyle = g; c.fillRect(wx + 4 + i * 13, UT + 6, 8, 8); } c.restore();
    rect(c, '#3a3d44', wx - 2, UT + 29, ww + 4, 1.4); }
  rect(c, '#e8d24a', UP + 2, UT + 8, 3, 3, '#6a5a10', .2); rect(c, '#2a2a2e', UP + 1, UT + 3, 3, 2);   // alarm box + camera
  // louvred fascia over the full width (lower over the single-storey part on the left)
  const fas = (bx, by, w, h) => { c.fillStyle = '#2e3036'; c.fillRect(bx, by, w, h); for (let yy = by + 1.6; yy < by + h; yy += 3.2) { rect(c, '#3e4148', bx, yy, w, 1.6); rect(c, '#24262a', bx, yy + 1.6, w, .5); } c.strokeStyle = '#141518'; c.lineWidth = .45; c.strokeRect(bx, by, w, h); };
  fas(x - 2, G - 62, 66, 13); fas(UP - 2, FT, UW + 4, 17); rect(c, '#9a9ca2', x - 2, G - 63, 66, 1);
  txt(c, '01582 650 112', x + 14, G - 55.6, 3.6, '#ff3a26', { f: 'Mont, sans-serif' });
  { const tx = UP + 72; rect(c, '#f6f4ee', tx - 11, FT + 10.4, 22, 4.6, '#9a9890', .25); txt(c, 'ORIGINAL', tx, FT + 12.8, 3.2, '#e0281a', { f: 'Mont, sans-serif', ls: .4 });
    c.save(); c.shadowColor = 'rgba(255,70,40,.75)'; c.shadowBlur = 2.4; txt(c, 'Peri-Peri', tx, FT + 5.4, 9.6, '#ff4a2a', { f: 'Georgia, serif', w: 700 }); c.restore(); txt(c, 'Peri-Peri', tx, FT + 5.4, 9.6, '#ff5a3a', { f: 'Georgia, serif', w: 700 }); }
  // glass front
  rect(c, '#55585f', x, G - 49, 180, 49, LINE, .45);
  const pane = (px, pw, inside) => { c.fillStyle = lg(c, 0, G - 47, 0, G - 6, [[0, '#fbf6ea'], [1, '#ece2cc']]); c.fillRect(px, G - 47, pw, 41); inside(px, pw); glare(c, px, G - 47, pw, 41); rect(c, '#3a3d44', px - 1, G - 6, pw + 2, 6); };
  pane(x + 4, 60, (px, pw) => { for (let yy = G - 45; yy < G - 20; yy += 2.2) for (let xx = px + (Math.round((yy - G) / 2.2) % 2 ? 0 : 2); xx < px + pw; xx += 4) rect(c, 'rgba(200,196,186,.6)', xx, yy, .3, 2.2); for (let yy = G - 45; yy < G - 20; yy += 2.2) rect(c, 'rgba(200,196,186,.6)', px, yy, pw, .3);
    rect(c, '#f2d23a', px, G - 45, 3, 30); rect(c, '#3a2c24', px + 6, G - 24, pw - 10, 6); for (let k = 0; k < 3; k++) { tableT(c, px + 10 + k * 17, G - 16, 10, '#ffffff'); c.fillStyle = ['#7ac04a', '#e0281a', '#e0281a'][k]; c.fillRect(px + 8 + k * 17, G - 18, 4, 4); c.fillRect(px + 17 + k * 17, G - 18, 4, 4); } });
  pane(x + 70, 72, (px, pw) => { for (let k = 0; k < 6; k++) { rect(c, '#1f2228', px + 14 + k * 8, G - 44, 7, 4.4, '#000', .2); rect(c, k % 2 ? '#e0281a' : '#f2c43a', px + 15 + k * 8, G - 43.2, 5, .6); rect(c, '#fff', px + 15 + k * 8, G - 41.8, 4, .4); }
    rect(c, '#d84a2a', px + 50, G - 40, 14, 24); for (let k = 0; k < 6; k++) rect(c, '#f2c43a', px + 51 + (k % 3) * 4.4, G - 38 + Math.floor(k / 3) * 8, 3, 3);
    c.fillStyle = lg(c, 0, G - 24, 0, G - 6, [[0, '#f4f0e6'], [1, '#d8d0c0']]); c.fillRect(px + 30, G - 24, 22, 18); rect(c, '#c9c2b2', px + 30, G - 24, 22, 1.2); tableT(c, px + 6, G - 16, 12, '#ffffff'); c.fillStyle = '#7ac04a'; c.fillRect(px + 4, G - 18, 4, 4); });
  rect(c, '#2e3036', x + 143, G - 47, 1.4, 47); c.fillStyle = lg(c, 0, G - 47, 0, G, [[0, '#d8e4ec'], [1, '#90a4b4']]); c.fillRect(x + 145, G - 47, 14, 47); rect(c, '#c0c6cc', x + 147, G - 30, .6, 8); glare(c, x + 145, G - 47, 14, 47);
  clad(x + 160, G - 49, 20, 49, '#8a8e96'); rect(c, '#2e3036', x + 163, G - 44, 13, 10); rect(c, '#5a6070', x + 164, G - 43, 11, 8);
  for (const lx of [x + 1, x + 176]) { rect(c, '#1e2024', lx, G - 46, 3, 3); c.fillStyle = 'rgba(255,248,220,.3)'; c.beginPath(); c.moveTo(lx, G - 43); c.lineTo(lx + 3, G - 43); c.lineTo(lx + 6, G - 32); c.lineTo(lx - 3, G - 32); c.fill(); }
  c.restore();
};

// Miami Crispy (from the photos): the shop front is the big part; a mossy tiled roof about a third of the shop's height runs
// almost its full width; on top, set in from both ends, the dark brick extension (about half the shop's height) with a row of five
// small white windows and one wide three-pane window near its top. Orange cladding fascia, orange-framed glass with orange chairs
HD.miamicrispy = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const OR = '#e8581e', RT = G - 82, EX0 = x + 15, EW = 116, ET = RT - 32;
  // extension
  brick(c, EX0, ET, EW, RT - ET + 2, '#3a2e2a', { mortar: 'rgba(120,110,100,.35)' }); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(EX0, ET, EW, RT - ET + 2);
  rect(c, '#bdb8b0', EX0 - 1.2, ET - 2.2, EW + 2.4, 2.2, LINE, .3); rect(c, '#55504a', EX0 + 94, ET - 6, 3, 4);
  for (let i = 0; i < 5; i++) { const wx = EX0 + 5.4 + i * 9; rect(c, '#f6f6f2', wx, ET + 8, 6.6, 9, '#8a8880', .3); c.fillStyle = lg(c, 0, ET + 9, 0, ET + 16, [[0, '#dfe8ee'], [1, '#7a90a2']]); c.fillRect(wx + .9, ET + 9, 4.8, 7); rect(c, '#f6f6f2', wx + .9, ET + 11.6, 4.8, .6); rect(c, '#9a958c', wx - .4, ET + 17, 7.4, .8); }
  rect(c, '#e4e2dc', EX0 + 69, ET + 5, 26, 2.4, '#8a8880', .3); rect(c, '#f6f6f2', EX0 + 69, ET + 7.4, 26, 10.6, '#8a8880', .3); for (let k = 0; k < 3; k++) { c.fillStyle = lg(c, 0, ET + 8, 0, ET + 17, [[0, '#e2eaf0'], [1, '#7a90a2']]); c.fillRect(EX0 + 70.4 + k * 8.2, ET + 8.6, 7, 8.2); } glare(c, EX0 + 70, ET + 8.6, 24, 8.2);
  // mossy roof
  { const pts = [[x + 1, G - 62], [x + 149, G - 62], [x + 145, RT], [x + 5, RT]]; slate(c, pts, '#4e5844'); c.save(); c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip();
    for (let i = 0; i < 700; i++) { c.beginPath(); c.arc(x + (i * 53.71) % 152, RT + (i * 17.33) % 20, .45 + (i % 3) * .3, 0, 7); c.fillStyle = ['#5f7a34', '#7a943e', '#4a6028', '#8aa448'][i % 4]; c.fill(); } c.restore(); rect(c, '#c8c2b4', x, G - 63, 150, 1.4); }
  // fascia
  c.fillStyle = lg(c, 0, G - 62, 0, G - 40, [[0, '#ff7a3a'], [.08, OR], [1, '#c8401a']]); c.fillRect(x - 2, G - 62, 154, 22); for (let i = 0; i < 6; i++) rect(c, 'rgba(120,30,0,.25)', x - 2, G - 58 + i * 3.4, 154, .35); c.strokeStyle = '#8a2a0c'; c.lineWidth = .4; c.strokeRect(x - 2, G - 62, 154, 22);
  c.save(); c.font = '900 17px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '.4px'; c.lineJoin = 'round'; c.lineCap = 'round';   // big rounded white letters like the real sign
  c.lineWidth = 3; c.strokeStyle = 'rgba(120,30,6,.55)'; c.strokeText('MIAMI CRISPY', x + 75.6, G - 49.8); c.fillStyle = '#ffffff'; c.fillText('MIAMI CRISPY', x + 75, G - 50.6); c.restore();
  rect(c, OR, x, G - 40, 150, 36, '#8a2a0c', .4);
  for (const [gx, gw] of [[x + 4, 44], [x + 70, 76]]) { c.fillStyle = lg(c, 0, G - 37, 0, G - 6, [[0, '#f4f6f7'], [.45, '#dfe6ea'], [1, '#c4ccd2']]); c.fillRect(gx, G - 37, gw, 31);
    for (let k = 0; k * 14 < gw - 12; k++) { rect(c, '#1f2228', gx + 3 + k * 14, G - 36, 12, 6, '#000', .2); rect(c, OR, gx + 4 + k * 14, G - 35, 10, .8); rect(c, '#fff', gx + 4 + k * 14, G - 33.4, 7, .5); }
    rect(c, '#c9ced4', gx, G - 20, gw, 1.6); for (let k = 0; k * 10 < gw - 6; k++) { c.fillStyle = OR; c.beginPath(); c.roundRect ? c.roundRect(gx + 3 + k * 10, G - 25, 6, 9, 1) : c.rect(gx + 3 + k * 10, G - 25, 6, 9); c.fill(); rect(c, '#2a2a2e', gx + 4 + k * 10, G - 16, .6, 9); rect(c, '#2a2a2e', gx + 7.4 + k * 10, G - 16, .6, 9); }
    glare(c, gx, G - 37, gw, 31); }
  c.fillStyle = lg(c, 0, G - 37, 0, G - 4, [[0, '#9a7a56'], [1, '#6a4a30']]); c.fillRect(x + 52, G - 37, 15, 33); rect(c, OR, x + 58.6, G - 37, .8, 33); rect(c, '#e0e0e0', x + 56, G - 20, .6, 4); rect(c, '#e0e0e0', x + 61.6, G - 20, .6, 4);
  txt(c, 'Luton', x + 122, G - 22, 8, OR, { f: 'Mont, sans-serif', w: 900 }); c.fillStyle = OR; c.beginPath(); c.moveTo(x + 92, G - 18); c.bezierCurveTo(x + 84, G - 24, x + 87, G - 30, x + 92, G - 26); c.bezierCurveTo(x + 97, G - 30, x + 100, G - 24, x + 92, G - 18); c.fill();
  rect(c, '#4a4e56', x, G - 4, 150, 4);
  c.restore();
};

// Chaiiwala + Nando's: shared sweeping roof; Chaiiwala = grey ribbed panels, navy sign with the round cup logo and chaiiwala in
// white, dark glass with hanging bulbs, arched mirrors, booths and a glass door; Nando's = wood slats, red name, glass, cockerel tower
HD.chaiiwala = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  poly(c, lg(c, 0, G - 124, 0, G - 112, [[0, '#4a4d54'], [1, '#2e3138']]), [[x - 8, G - 112], [x + 296, G - 112], [x + 288, G - 124], [x + 4, G - 124]], LINE, .45); rect(c, '#d4d9de', x - 8, G - 112, 304, 1.8);
  c.fillStyle = lg(c, x, 0, x + 130, 0, [[0, '#c8cfd6'], [1, '#a8b0b8']]); c.fillRect(x, G - 110, 130, 110); for (let k = 3; k < 130; k += 3.2) rect(c, 'rgba(0,0,0,.1)', x + k, G - 110, .4, 40); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 110, 130, 110);
  c.fillStyle = lg(c, 0, G - 106, 0, G - 72, [[0, '#24304a'], [1, '#162030']]); c.fillRect(x + 5, G - 106, 120, 34); c.strokeStyle = '#0a0e16'; c.strokeRect(x + 5, G - 106, 120, 34);
  { const cx = x + 22, cy = G - 89; c.beginPath(); c.arc(cx, cy, 8.4, 0, 7); c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cx - 3.6, cy - 2.4); c.lineTo(cx + 3.6, cy - 2.4); c.lineTo(cx + 2.6, cy + 3.6); c.lineTo(cx - 2.6, cy + 3.6); c.fill(); c.beginPath(); c.arc(cx + 4, cy + .4, 1.6, -Math.PI / 2, Math.PI / 2); c.strokeStyle = '#fff'; c.lineWidth = .7; c.stroke(); for (const d of [-1.4, 1.2]) line(c, '#fff', .5, [[cx + d, cy - 3.6], [cx + d + .8, cy - 6]]); }
  txt(c, 'chaiiwala', x + 76, G - 89, 15, '#ffffff', { f: 'Mont, sans-serif', w: 600 }); txt(c, '®', x + 116.6, G - 94, 3, '#fff');
  poly(c, '#d7dce1', [[x + 3, G - 72], [x + 127, G - 72], [x + 122, G - 66], [x + 8, G - 66]], LINE, .3);
  rect(c, '#15191f', x + 5, G - 66, 120, 66); c.fillStyle = lg(c, 0, G - 65, 0, G, [[0, '#2a2620'], [1, '#14161a']]); c.fillRect(x + 6, G - 65, 118, 64);
  for (let i = 0; i < 4; i++) { const ax = x + 14 + i * 28; c.beginPath(); c.moveTo(ax, G - 20); c.lineTo(ax, G - 40); c.arc(ax + 9, G - 40, 9, Math.PI, 0); c.lineTo(ax + 18, G - 20); c.fillStyle = 'rgba(200,170,110,.12)'; c.fill(); c.strokeStyle = '#a8844a'; c.lineWidth = .8; c.stroke(); }
  for (let i = 0; i < 9; i++) { const lx = x + 11 + i * 13, ly = G - 58 + (i % 3) * 4; rect(c, '#3a3a3a', lx - .2, G - 65, .4, ly - (G - 65)); c.beginPath(); c.arc(lx, ly + 1.4, 1.5, 0, 7); c.fillStyle = '#ffe2a0'; c.fill(); const g = c.createRadialGradient(lx, ly + 1.4, 0, lx, ly + 1.4, 6); g.addColorStop(0, 'rgba(255,200,110,.45)'); g.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = g; c.fillRect(lx - 6, ly - 5, 12, 12); }
  for (let i = 0; i < 4; i++) { tableT(c, x + 12 + i * 28, G - 14, 14, '#4a3a2c'); stool(c, x + 10 + i * 28, G, '#2a201a'); }
  for (const fx of [x + 36, x + 64, x + 92]) rect(c, '#0d1014', fx, G - 66, 1.4, 66); rect(c, '#0d1014', x + 5, G - 46, 120, .6);
  rect(c, '#0d1014', x + 50, G - 40, 26, 40); c.fillStyle = lg(c, 0, G - 38, 0, G, [[0, '#5a6878'], [1, '#2e3640']]); c.fillRect(x + 52, G - 38, 22, 38); rect(c, '#c0c6cc', x + 70, G - 22, .6, 8);
  glare(c, x + 6, G - 65, 118, 64);
  // Nando's unit
  const N = x - 50;
  rect(c, '#3a3d44', N + 180, G - 110, 158, 110, LINE, .45);
  for (let i = 0; i < 36; i++) { c.fillStyle = lg(c, 0, G - 106, 0, G - 72, [[0, ['#a58258', '#8a6a4a', '#b08c60', '#7a5a3c'][i % 4]], [1, ['#7a5a3c', '#6a4e34', '#8a6a46', '#5e4430'][i % 4]]]); c.fillRect(N + 184 + i * 3, G - 106, 2.4, 34); }
  rect(c, 'rgba(20,14,10,.55)', N + 190, G - 100, 96, 22); c.save(); c.font = '700 19px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 1.6; c.strokeStyle = '#f6efe2'; c.strokeText("Nando's", N + 238, G - 89); c.fillStyle = '#e0262a'; c.fillText("Nando's", N + 238, G - 89); c.restore();
  c.fillStyle = lg(c, 0, G - 72, 0, G, [[0, '#9ab6cc'], [.5, '#6a8aa6'], [1, '#3e5468']]); c.fillRect(N + 184, G - 72, 108, 72); for (let i = 1; i < 6; i++) rect(c, '#2a2c30', N + 184 + i * 18, G - 72, 1, 72); rect(c, '#2a2c30', N + 184, G - 50, 108, .8); glare(c, N + 184, G - 72, 108, 72);
  rect(c, '#2a2c30', N + 196, G - 40, 16, 40); c.fillStyle = lg(c, 0, G - 38, 0, G, [[0, '#cfe0ee'], [1, '#7f9ab0']]); c.fillRect(N + 198, G - 38, 12, 38);
  rect(c, '#5a3d2a', N + 232, G - 24, 2, 24); rect(c, '#3a3d44', N + 228, G - 6, 10, 6); tree(c, N + 233, G - 22, .45, { d: '#3a6b2c', m: '#4f8a3c', l: '#86c060' });
  rect(c, '#2a2c30', N + 292, G - 110, 46, 110, LINE, .4); for (let j = 0; j < 4; j++) rect(c, '#34373c', N + 292, G - 82 + j * 22, 46, .6);
  { const cx = N + 315, cy = G - 88, RC = '#e0262a'; c.beginPath(); c.arc(cx, cy, 14.6, 0, 7); c.strokeStyle = RC; c.lineWidth = 1.6; c.stroke();   // generic cockerel, not a real logo
    c.fillStyle = RC; c.beginPath(); c.ellipse(cx + 1, cy + 1.4, 6, 5, 0, 0, 7); c.fill(); c.beginPath(); c.arc(cx - 4.4, cy - 4.4, 2.8, 0, 7); c.fill();
    for (const [a, b] of [[-6.6, -8.4], [-4.6, -9.2], [-2.6, -8.4]]) { c.beginPath(); c.arc(cx + a, cy + b, 1.1, 0, 7); c.fill(); } poly(c, '#f2c43a', [[cx - 7, cy - 5], [cx - 10, cy - 4], [cx - 7, cy - 3.4]]);
    for (const [a, b] of [[5, -8], [8, -10], [10.4, -6]]) { c.beginPath(); c.moveTo(cx + 4, cy - 1); c.quadraticCurveTo(cx + a, cy + b, cx + a + 2, cy + b + 4); c.strokeStyle = RC; c.lineWidth = 1.4; c.stroke(); }
    line(c, RC, .8, [[cx - 1, cy + 6], [cx - 1.6, cy + 10]]); line(c, RC, .8, [[cx + 3, cy + 6], [cx + 3.4, cy + 10]]); c.beginPath(); c.arc(cx - 5, cy - 4.8, .5, 0, 7); c.fillStyle = '#2a2c30'; c.fill(); }
  // bollards + red paving strip (EX)
  for (const bx of [x + 180, x + 206, x + 232]) { c.fillStyle = lg(c, bx - 2, 0, bx + 2, 0, [[0, '#2a2c30'], [.5, '#5a5e66'], [1, '#1a1c20']]); c.fillRect(bx - 1.8, G - 12, 3.6, 12); rect(c, '#e8e8e8', bx - 1.8, G - 10, 3.6, 1); c.beginPath(); c.arc(bx, G - 12, 1.8, Math.PI, 0); c.fillStyle = '#3a3d44'; c.fill(); }
  rect(c, '#c96a4a', x + 130, G - 3, 160, 3);
  c.restore();
};

// Chaiikhana (from the photos): dark grey clad kiosk with a deep sign box on top (chaiikhana in white), serving hatch with steel
// urns + drinks, pink menu board, ORDER ONLINE + www.chaiikhana.co.uk printed under the hatch; long clad container behind; cones, bin
HD.chaiikhana = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const CL = (bx, by, w, h, col = '#3c3f44') => { c.fillStyle = lg(c, bx, 0, bx + w, 0, [[0, shade(col, 1.1)], [1, shade(col, .9)]]); c.fillRect(bx, by, w, h); for (let yy = by + 2.6; yy < by + h; yy += 2.6) { rect(c, 'rgba(0,0,0,.3)', bx, yy, w, .35); rect(c, 'rgba(255,255,255,.06)', bx, yy + .35, w, .35); } c.strokeStyle = '#141518'; c.lineWidth = .45; c.strokeRect(bx, by, w, h); };
  CL(x + 84, G - 56, 116, 56); rect(c, '#26282c', x + 82, G - 60, 120, 4, '#141518', .3);
  rect(c, '#202226', x + 150, G - 50, 34, 26, '#000', .3); for (let i = 0; i < 9; i++) rect(c, '#3e4146', x + 151, G - 48 + i * 2.8, 32, .9);
  { const g = c.createRadialGradient(x + 140, G - 50, 0, x + 140, G - 50, 8); g.addColorStop(0, 'rgba(255,250,220,.7)'); g.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = g; c.fillRect(x + 132, G - 58, 16, 16); rect(c, '#1a1a1e', x + 137, G - 53, 6, 3); }
  rect(c, '#c86a8a', x + 188, G - 56, 10, 3);
  CL(x, G - 66, 84, 66);
  // sign box on top
  c.fillStyle = lg(c, 0, G - 88, 0, G - 66, [[0, '#4a4d52'], [.08, '#2a2c30'], [1, '#1c1e22']]); c.fillRect(x - 4, G - 88, 92, 20); c.strokeStyle = '#0e0f12'; c.lineWidth = .5; c.strokeRect(x - 4, G - 88, 92, 20); rect(c, '#1c1e22', x - 4, G - 68, 92, 2);
  txt(c, 'chaiikhana', x + 42, G - 78.4, 11, '#f6f6f4', { f: 'Mont, sans-serif', w: 600 });
  // hatch: steel urns, drinks, coffee machine
  rect(c, '#141518', x + 7, G - 61, 52, 28); c.fillStyle = lg(c, 0, G - 59, 0, G - 36, [[0, '#f4f2ec'], [1, '#c8c4bc']]); c.fillRect(x + 9, G - 59, 48, 23);
  for (const ux of [x + 14, x + 24]) { c.fillStyle = lg(c, ux - 3, 0, ux + 3, 0, [[0, '#7a8088'], [.45, '#eef2f6'], [1, '#6a7078']]); c.fillRect(ux - 3, G - 52, 6, 12); rect(c, '#2a2c30', ux - 3.4, G - 53, 6.8, 1.4); rect(c, '#2a2c30', ux - .5, G - 41, 1, 2); }
  for (const [dx, col] of [[x + 32, '#e0458a'], [x + 37, '#f26a2a'], [x + 42, '#8ad646']]) { c.fillStyle = col; c.beginPath(); c.roundRect ? c.roundRect(dx, G - 47, 3.4, 7, .6) : c.rect(dx, G - 47, 3.4, 7); c.fill(); }
  rect(c, '#2a2c30', x + 47, G - 52, 8, 12, '#000', .3); rect(c, '#9aa3ad', x + 48, G - 50, 6, 2);
  rect(c, '#9aa3ad', x + 9, G - 37, 48, 1.4); rect(c, '#2a2c30', x + 6, G - 34, 54, 2.4, '#000', .3);
  txt(c, 'ORDER ONLINE', x + 33, G - 27, 3.4, '#e0458a', { f: 'Mont, sans-serif' }); txt(c, 'www.chaiikhana.co.uk', x + 33, G - 22, 4.4, '#ffffff', { f: 'Mont, sans-serif' });
  for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x + 23 + i * 5, G - 17, 1.2, 0, 7); c.fillStyle = ['#e0458a', '#2fb35a', '#f26a2a', '#4a8ad6', '#ffffff'][i]; c.fill(); }
  // pink menu board
  rect(c, '#1a1a1e', x + 62, G - 60, 14, 36, '#000', .3); rect(c, '#e0458a', x + 63, G - 59, 12, 3); for (let i = 0; i < 10; i++) rect(c, '#d8d8d8', x + 64, G - 54 + i * 2.6, 6 + (i * 3) % 4, .6); rect(c, '#f0a8c8', x + 63, G - 28, 12, 5);
  // bin + cones
  c.fillStyle = lg(c, x + 60, 0, x + 72, 0, [[0, '#1a1a1e'], [.5, '#3a3a40'], [1, '#141416']]); c.fillRect(x + 62, G - 14, 11, 14); rect(c, '#2a2a2e', x + 61, G - 15, 13, 1.6);
  for (const cx of [x - 8, x + 78]) { c.fillStyle = lg(c, cx, 0, cx + 8, 0, [[0, '#d8a020'], [.5, '#f8d040'], [1, '#c89018']]); c.beginPath(); c.moveTo(cx, G - 1); c.lineTo(cx + 3, G - 12); c.lineTo(cx + 5, G - 12); c.lineTo(cx + 8, G - 1); c.fill(); rect(c, '#2a2a2e', cx + 1.2, G - 7, 5.6, 1.6); rect(c, '#2a2a2e', cx - 1, G - 1.6, 10, 1.6); }
  c.restore();
};

// Spud Kingz trailer: black catering trailer on two wheels, open serving hatch with a steel canopy, extractor louvre door, gold
// "Crowned in Flavour / Rooted in Community"; sign on a thin rail with the crowned jacket potato on top
HD.spudkingz = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  for (const wx of [x + 118, x + 140]) { c.beginPath(); c.arc(wx, G - 9, 9, 0, 7); c.fillStyle = '#121214'; c.fill(); c.beginPath(); c.arc(wx, G - 9, 4.8, 0, 7); c.fillStyle = lg(c, wx - 5, G - 14, wx + 5, G - 4, [[0, '#d8dde2'], [1, '#7a828c']]); c.fill(); for (let i = 0; i < 5; i++) { const a = i * 1.2566; c.beginPath(); c.arc(wx + Math.cos(a) * 2.8, G - 9 + Math.sin(a) * 2.8, .5, 0, 7); c.fillStyle = '#4a4e56'; c.fill(); } }
  c.fillStyle = lg(c, 0, G - 86, 0, G - 9, [[0, '#2a2a2e'], [.08, '#161618'], [1, '#0c0c0e']]); c.beginPath(); c.moveTo(x + 4, G - 9); c.lineTo(x + 4, G - 78); c.quadraticCurveTo(x + 4, G - 86, x + 14, G - 86); c.lineTo(x + 196, G - 86); c.quadraticCurveTo(x + 206, G - 86, x + 206, G - 78); c.lineTo(x + 206, G - 9); c.closePath(); c.fill(); c.strokeStyle = '#000'; c.lineWidth = .5; c.stroke();
  rect(c, 'rgba(255,255,255,.18)', x + 10, G - 84, 190, .8); rect(c, '#2a2a2e', x + 4, G - 12, 202, 3);
  poly(c, lg(c, 0, G - 92, 0, G - 80, [[0, '#eef1f4'], [1, '#aeb6be']]), [[x + 46, G - 80], [x + 186, G - 80], [x + 180, G - 92], [x + 52, G - 92]], '#5a6068', .4);
  rect(c, '#d9dde2', x + 50, G - 76, 132, 38, '#5a6068', .4); c.fillStyle = lg(c, 0, G - 72, 0, G - 44, [[0, '#f4f6f8'], [1, '#c0c8d0']]); c.fillRect(x + 54, G - 72, 124, 26);
  for (let i = 0; i < 4; i++) rect(c, ['#c8202a', '#2f6fb5', '#9aa3ad', '#e8a33c'][i], x + 108 + i * 5, G - 56, 4, 8, '#000', .2); rect(c, '#9aa3ad', x + 64, G - 62, 20, 14, '#5a6068', .3); rect(c, '#2a2a2e', x + 66, G - 60, 16, 6); rect(c, '#b6bcc4', x + 140, G - 70, 30, 4); txt(c, 'MENU', x + 155, G - 64, 4, '#2a2a2e', { f: 'Mont, sans-serif' });
  rect(c, '#9aa3ad', x + 50, G - 40, 132, 2.4, '#5a6068', .3);
  rect(c, '#f4f2ec', x + 186, G - 76, 14, 46, '#5a6068', .3); for (let i = 0; i < 14; i++) rect(c, '#8a929c', x + 188, G - 73 + i * 3, 10, .8);
  txt(c, 'Crowned in Flavour', x + 112, G - 32, 7.4, '#d9b05a', { f: 'Georgia, serif', w: 400 }); txt(c, 'ROOTED IN COMMUNITY', x + 112, G - 24, 3.6, '#d9b05a', { f: 'Mont, sans-serif', ls: 1 });
  rect(c, '#2a2a2e', x + 196, G - 9, 2.4, 9);
  const SX = x + 110; for (const px of [SX - 70, SX + 68]) rect(c, '#141416', px, G - 104, 2, 18);
  rect(c, '#141416', SX - 66, G - 104, 132, 2);
  c.save(); c.font = '600 21px Oswald, sans-serif'; c.textBaseline = 'middle'; c.lineJoin = 'round'; const w1 = c.measureText('Spud ').width, w2 = c.measureText('Kingz').width, sx0 = SX - (w1 + w2) / 2; c.lineWidth = 2.4; c.strokeStyle = '#0a0a0c'; c.strokeText('Spud', sx0, G - 111.6); c.strokeText('Kingz', sx0 + w1, G - 111.6); c.fillStyle = lg(c, 0, G - 120, 0, G - 104, [[0, '#8ae68c'], [1, '#3aa848']]); c.fillText('Spud', sx0, G - 111.6); c.fillStyle = lg(c, 0, G - 120, 0, G - 104, [[0, '#ffe070'], [1, '#e0a820']]); c.fillText('Kingz', sx0 + w1, G - 111.6); c.restore();
  c.save(); c.translate(0, -6);
  c.beginPath(); c.ellipse(SX, G - 126, 19, 9.6, 0, 0, 7); c.fillStyle = lg(c, 0, G - 136, 0, G - 116, [[0, '#c9904a'], [1, '#8a5a26']]); c.fill(); c.strokeStyle = '#3a2410'; c.lineWidth = .6; c.stroke();
  for (const [a, b] of [[-12, 4], [10, 5], [-4, 6], [14, -1]]) { c.beginPath(); c.arc(SX + a, G - 126 + b, .7, 0, 7); c.fillStyle = '#6a4220'; c.fill(); }
  c.beginPath(); c.moveTo(SX - 13, G - 129); c.quadraticCurveTo(SX - 6, G - 135, SX, G - 133); c.quadraticCurveTo(SX + 7, G - 136, SX + 13, G - 129); c.quadraticCurveTo(SX, G - 125, SX - 13, G - 129); c.fillStyle = '#f2e2b0'; c.fill();
  rect(c, '#f6d04a', SX - 3, G - 133, 6, 3); for (const [a, b] of [[-7, -130], [5, -131]]) rect(c, '#4a9a3a', SX + a, G + b, 2, .8);
  poly(c, lg(c, 0, G - 150, 0, G - 134, [[0, '#ffe680'], [1, '#d8a020']]), [[SX - 11, G - 135], [SX - 10, G - 147], [SX - 5, G - 140], [SX, G - 150], [SX + 5, G - 140], [SX + 10, G - 147], [SX + 11, G - 135]], '#7a5410', .45);
  for (const [a, b] of [[-10, -147], [0, -150], [10, -147]]) { c.beginPath(); c.arc(SX + a, G + b, 1, 0, 7); c.fillStyle = '#f6e090'; c.fill(); } rect(c, '#c8202a', SX - 1, G - 138.6, 2, 2);
  c.restore();
  c.restore();
};

// Kaya Lounge: low building behind a living wall (artificial: lush greens with small white flowers), dark entrance tunnel with
// spotlights, black KAYA / LOUNGE sign with the gold knot, pink 18+ badge, red arrow pointing down to the door; trees behind
HD.kaya = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  tree(c, x + 236, G - 60, 1.7, { d: '#2f5f2c', m: '#3f6f34', l: '#6a9a4a' }); tree(c, x + 288, G - 58, 1.05, { d: '#244a20', m: '#2f5f2c', l: '#4f7a3a' });
  rect(c, '#2a2826', x - 2, G - 66, 306, 8, '#141210', .4); rect(c, '#3a3836', x - 2, G - 66, 306, 1);
  c.fillStyle = '#1f4a1c'; c.fillRect(x, G - 58, 302, 58);
  for (let i = 0; i < 1500; i++) { const lx = x + (i * 37.31) % 301, ly = G - 57.5 + (i * 23.17) % 57; c.fillStyle = ['#3e7a34', '#5a9a44', '#244a20', '#7ab858', '#2f6a2a'][i % 5]; c.beginPath(); c.ellipse(lx, ly, 1.3, .7, (i % 9) * .35, 0, 7); c.fill(); }
  for (let i = 0; i < 160; i++) { c.beginPath(); c.arc(x + (i * 71.3) % 300, G - 56 + (i * 29.7) % 54, .45, 0, 7); c.fillStyle = i % 4 ? '#f4f6ea' : '#f4d6e6'; c.fill(); }
  rect(c, '#0a0c10', x + 20, G - 50, 44, 50); c.fillStyle = lg(c, 0, G - 46, 0, G, [[0, '#2a2e36'], [1, '#12141a']]); c.fillRect(x + 26, G - 46, 32, 46); rect(c, '#3a3e46', x + 26, G - 46, 32, 1);
  for (const lx of [x + 22, x + 70, x + 150, x + 230]) { c.beginPath(); c.arc(lx, G - 52, 1.6, 0, 7); c.fillStyle = '#f6faff'; c.fill(); const g = c.createRadialGradient(lx, G - 52, 0, lx, G - 52, 8); g.addColorStop(0, 'rgba(240,248,255,.6)'); g.addColorStop(1, 'rgba(240,248,255,0)'); c.fillStyle = g; c.fillRect(lx - 8, G - 60, 16, 16); }
  c.fillStyle = lg(c, 0, G - 96, 0, G - 64, [[0, '#2a282c'], [1, '#141316']]); c.fillRect(x + 4, G - 96, 120, 32); c.strokeStyle = '#000'; c.lineWidth = .5; c.strokeRect(x + 4, G - 96, 120, 32); rect(c, '#3a383c', x + 4, G - 96, 120, .8);
  rect(c, '#2a2826', x + 30, G - 64, 2, 6); rect(c, '#2a2826', x + 96, G - 64, 2, 6);
  txt(c, 'KAYA', x + 62, G - 84, 15, '#f2f0ea', { f: 'Mont, sans-serif', w: 700, ls: 1 }); txt(c, 'L  O  U  N  G  E', x + 62, G - 71.4, 4.6, '#e8e4dc', { f: 'Mont, sans-serif', w: 400 });
  c.save(); c.strokeStyle = '#c9a050'; c.lineWidth = .55; c.beginPath(); c.ellipse(x + 62, G - 80, 4.6, 7, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x + 62, G - 94); c.lineTo(x + 62, G - 66); c.stroke(); c.beginPath(); c.moveTo(x + 58, G - 68); c.quadraticCurveTo(x + 62, G - 64, x + 68, G - 68); c.stroke(); poly(c, '#c9a050', [[x + 68, G - 68], [x + 66, G - 69.6], [x + 66.4, G - 66.6]]); c.restore();
  c.beginPath(); c.arc(x + 16, G - 86, 6, 0, 7); c.fillStyle = '#c83a6a'; c.fill(); c.beginPath(); c.arc(x + 16, G - 86, 4.8, 0, 7); c.fillStyle = '#1c1b1e'; c.fill(); txt(c, '18', x + 16, G - 85.8, 4.6, '#fff', { f: 'Mont, sans-serif' });
  rect(c, '#ffffff', x + 109, G - 92, 3, 14); poly(c, '#ffffff', [[x + 104.4, G - 79], [x + 116.6, G - 79], [x + 110.5, G - 70]]);   // white arrow (owner)
  c.restore();
};

// The Barak Steakhouse: single-storey brick restaurant on a raised brick platform; three navy panels with gold (B with a fork,
// bull's head, crossed fork + knife); THE BARAK board with gold scroll ends, centred; glass double door; hipped tiled roof, white
// fascia, hanging baskets; ramp with a white handrail from the left, steps up on the right
HD.barak = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const PL = G - 18, GD = '#d9a35e', NV = '#1f252d', BR = '#8f4a36';
  brick(c, x + 10, PL, 202, 18, BR); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 10, PL, 202, 18); rect(c, '#b0705a', x + 10, PL, 202, 1.4);
  brick(c, x + 18, PL - 36, 186, 36, '#9a4e38'); c.strokeRect(x + 18, PL - 36, 186, 36);
  for (const px of [x + 22, x + 50, x + 78]) { c.fillStyle = lg(c, 0, PL - 34, 0, PL - 1, [[0, '#2a3240'], [1, '#161b22']]); c.fillRect(px, PL - 34, 24, 33); c.strokeStyle = '#0a0c10'; c.strokeRect(px, PL - 34, 24, 33); c.strokeStyle = GD; c.lineWidth = .4; c.strokeRect(px + 2, PL - 32, 20, 29); c.lineWidth = .45; }
  txt(c, 'B', x + 35, PL - 18, 15, GD, { f: 'Georgia, serif', w: 700 }); line(c, GD, .6, [[x + 30, PL - 28], [x + 30, PL - 9]]); for (const k of [28.6, 30, 31.4]) line(c, GD, .4, [[x + k, PL - 30], [x + k, PL - 26]]);
  { const bx = x + 62, by = PL - 18; c.fillStyle = GD; c.beginPath(); c.moveTo(bx - 4.4, by - 5); c.lineTo(bx + 4.4, by - 5); c.quadraticCurveTo(bx + 4, by + 3, bx + 2.4, by + 5); c.lineTo(bx - 2.4, by + 5); c.quadraticCurveTo(bx - 4, by + 3, bx - 4.4, by - 5); c.fill();
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(bx + d * 4, by - 4); c.quadraticCurveTo(bx + d * 9, by - 5, bx + d * 8, by - 10); c.strokeStyle = GD; c.lineWidth = 1; c.stroke(); }
    c.beginPath(); c.ellipse(bx, by + 3.6, 2.4, 1.2, 0, 0, 7); c.fillStyle = '#e8dccb'; c.fill(); for (const d of [-1.8, 1.8]) { c.beginPath(); c.arc(bx + d, by - 1.4, .5, 0, 7); c.fillStyle = NV; c.fill(); } }
  { const cx = x + 90, cy = PL - 18; c.beginPath(); c.arc(cx, cy, 7.6, 0, 7); c.strokeStyle = GD; c.lineWidth = .8; c.stroke(); line(c, GD, .9, [[cx - 4.6, cy - 4.6], [cx + 4.6, cy + 4.6]]); line(c, '#e8dccb', .9, [[cx + 4.6, cy - 4.6], [cx - 4.6, cy + 4.6]]); }
  // sign board
  c.fillStyle = lg(c, 0, PL - 36, 0, PL - 20.5, [[0, '#1e2228'], [1, '#0c0e12']]); c.fillRect(x + 97, PL - 36, 88, 15.5); c.strokeStyle = GD; c.lineWidth = .6; c.strokeRect(x + 98.6, PL - 34.6, 84.8, 12.7);   // bigger board (owner), kept under the eaves
  for (const [ex, d] of [[x + 100.6, 1], [x + 181.4, -1]]) { c.beginPath(); c.moveTo(ex, PL - 28.2); c.quadraticCurveTo(ex + d * 2.4, PL - 32, ex + d * 4.2, PL - 28.2); c.quadraticCurveTo(ex + d * 2.4, PL - 24.4, ex, PL - 28.2); c.fillStyle = GD; c.fill(); }
  txt(c, 'THE BARAK', x + 141, PL - 28, 9.8, GD, { f: 'Georgia, serif', w: 400, ls: .8 });
  rect(c, '#3a3d44', x + 124, PL - 20, 26, 20, '#1a1c20', .4); for (const dx of [x + 126, x + 138]) { c.fillStyle = lg(c, 0, PL - 18, 0, PL, [[0, '#cfe0ee'], [1, '#6f8aa2']]); c.fillRect(dx, PL - 18, 10, 18); glare(c, dx, PL - 18, 10, 18); } rect(c, '#c9ced4', x + 134.6, PL - 12, .6, 4); rect(c, '#c9ced4', x + 139, PL - 12, .6, 4);
  rect(c, '#3a3d44', x + 182, PL - 26, 10, 12, '#1a1c20', .3); rect(c, '#f4f2ec', x + 183, PL - 25, 8, 10); for (let i = 0; i < 3; i++) rect(c, '#9aa0a8', x + 184, PL - 23 + i * 2.6, 6 - i, .5);
  slate(c, [[x + 6, PL - 37], [x + 216, PL - 37], [x + 190, PL - 68], [x + 32, PL - 68]], '#4a4b52'); rect(c, '#f6f4ee', x + 6, PL - 39, 210, 3, LINE, .35); rect(c, '#d8d6d0', x + 6, PL - 36.4, 210, .6);
  for (const hx of [x + 48, x + 104, x + 178, x + 200]) { rect(c, '#2a2a2e', hx - .2, PL - 36, .4, 3); c.beginPath(); c.arc(hx, PL - 30, 3.6, 0, Math.PI); c.fillStyle = '#3a2a1e'; c.fill(); for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(hx - 3 + (i % 5) * 1.5, PL - 31.4 + Math.floor(i / 5) * 1.6, 1.1, 0, 7); c.fillStyle = ['#4f8a3c', '#6faa4e', '#e85a8a', '#f4f2ec'][i % 4]; c.fill(); } }
  // ramp + handrail, steps
  poly(c, BR, [[x - 4, G], [x + 120, G], [x + 120, PL - 2], [x - 4, G - 3]]); c.save(); c.beginPath(); c.moveTo(x - 4, G); c.lineTo(x + 120, G); c.lineTo(x + 120, PL - 2); c.lineTo(x - 4, G - 3); c.closePath(); c.clip(); brick(c, x - 4, PL - 2, 124, 20, BR); c.restore();
  rect(c, '#b0705a', x - 4, G - 3, 2, 3); line(c, '#b0705a', 1.2, [[x - 4, G - 3], [x + 120, PL - 2]]);
  for (const px of [x + 12, x + 52, x + 92]) { const t = (px - x + 4) / 124, py = G - 11 - t * 6; rect(c, '#f4f4f2', px - .5, py, 1, (G - 3 - t * 13) - py, '#8a8a88', .2); }
  c.lineCap = 'round'; line(c, '#6a6a68', 2, [[x - 2, G - 10], [x + 122, PL - 9]]); line(c, '#f6f6f4', 1.3, [[x - 2, G - 10.2], [x + 122, PL - 9.2]]);
  for (let i = 0; i < 5; i++) { const sy = G - 3.6 * (i + 1); c.fillStyle = lg(c, 0, sy, 0, sy + 3.6, [[0, '#d8dbe0'], [1, '#a8acb2']]); c.fillRect(x + 150 + i * 6, sy, 44 - i * 6, 3.6); c.strokeStyle = '#5a5e64'; c.lineWidth = .3; c.strokeRect(x + 150 + i * 6, sy, 44 - i * 6, 3.6); }
  c.restore();
};

// ---------- big-store kit ----------
const ribbed = (c, x, y, w, h, col, step = 2.4) => { c.fillStyle = col; c.fillRect(x, y, w, h); for (let k = x; k < x + w; k += step) { rect(c, 'rgba(255,255,255,.16)', k, y, step * .35, h); rect(c, 'rgba(0,0,0,.14)', k + step * .62, y, step * .2, h); } c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, y, w, h); };
const panels = (c, x, y, w, h, col, ph = 6) => { c.fillStyle = lg(c, 0, y, 0, y + h, [[0, shade(col, 1.06)], [1, shade(col, .93)]]); c.fillRect(x, y, w, h); for (let yy = y + ph; yy < y + h; yy += ph) rect(c, 'rgba(0,0,0,.13)', x, yy, w, .4); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, y, w, h); };
const curtain = (c, x, y, w, h, cols = 6, rows = 2, tint = ['#cfe0ec', '#6f8ea8', '#3e566c']) => { c.fillStyle = lg(c, 0, y, 0, y + h, [[0, tint[0]], [.45, tint[1]], [1, tint[2]]]); c.fillRect(x, y, w, h); for (let i = 1; i < cols; i++) rect(c, '#2a3038', x + i * w / cols - .5, y, 1, h); for (let j = 1; j < rows; j++) rect(c, '#2a3038', x, y + j * h / rows - .4, w, .8); c.strokeStyle = '#2a3038'; c.lineWidth = .9; c.strokeRect(x, y, w, h); glare(c, x, y, w, h); };
const bollard = (c, x, G, col = '#2a2c30', band = '#e8e8e8') => { c.fillStyle = lg(c, x - 2, 0, x + 2, 0, [[0, shade(col, .7)], [.5, shade(col, 1.5)], [1, shade(col, .6)]]); c.fillRect(x - 1.8, G - 12, 3.6, 12); rect(c, band, x - 1.8, G - 10, 3.6, 1); c.beginPath(); c.arc(x, G - 12, 1.8, Math.PI, 0); c.fillStyle = col; c.fill(); };
const hatch = (c, x, G, col) => {   // small parked hatchback side-on, 30 long
  c.fillStyle = lg(c, 0, G - 13, 0, G - 3, [[0, shade(col, 1.15)], [1, shade(col, .8)]]); c.beginPath(); c.moveTo(x + 1, G - 4); c.lineTo(x + 1, G - 8); c.quadraticCurveTo(x + 2, G - 10, x + 6, G - 10.4); c.lineTo(x + 9, G - 14.6); c.quadraticCurveTo(x + 10, G - 15.4, x + 12, G - 15.4); c.lineTo(x + 22, G - 15.4); c.quadraticCurveTo(x + 25, G - 15, x + 27, G - 10.6); c.quadraticCurveTo(x + 30, G - 10, x + 30, G - 7); c.lineTo(x + 30, G - 4); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = .35; c.stroke();
  c.fillStyle = lg(c, 0, G - 15, 0, G - 10, [[0, '#a8c0d0'], [1, '#3a4a58']]); c.beginPath(); c.moveTo(x + 9.6, G - 10.8); c.lineTo(x + 12.4, G - 14.4); c.lineTo(x + 17.6, G - 14.4); c.lineTo(x + 17.6, G - 10.8); c.fill(); c.beginPath(); c.moveTo(x + 18.6, G - 10.8); c.lineTo(x + 18.6, G - 14.4); c.lineTo(x + 22.4, G - 14.4); c.lineTo(x + 25.4, G - 10.8); c.fill();
  rect(c, 'rgba(0,0,0,.25)', x + 18, G - 10.6, .5, 6); rect(c, '#f4f0d0', x + 28.6, G - 9, 1.4, 1.2); rect(c, '#c02020', x + 1, G - 8.6, 1, 1.6); rect(c, 'rgba(0,0,0,.35)', x, G - 1, 31, 1);
  for (const wx of [x + 7, x + 24]) { c.beginPath(); c.arc(wx, G - 3.4, 3.2, 0, 7); c.fillStyle = '#141416'; c.fill(); c.beginPath(); c.arc(wx, G - 3.4, 1.7, 0, 7); c.fillStyle = '#b8bec6'; c.fill(); } };

// Tesco Extra: long red-brick store under a dark hipped roof (the WIDEN part), raised middle roof with the TESCO Extra board,
// clock tower with TESCO + clock, red-framed entrance (Welcome), dark glazed canopy bay, trolley bay, blue fire door, cash machine, cones
HD.tesco = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  slate(c, [[x - 4, G - 66], [x + 384, G - 66], [x + 370, G - 96], [x + 10, G - 96]], '#3d3f45');
  brick(c, x, G - 66, 380, 66, '#a8503a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 66, 380, 66); rect(c, '#efeee9', x - 4, G - 70, 388, 4, LINE, .4);
  rect(c, '#2a2f3a', x + 4, G - 50, 60, 50); for (let i = 0; i < 5; i++) rect(c, '#ecebe7', x + 6 + i * 13, G - 50, 2.4, 50, '#8a8880', .25);
  for (let i = 0; i < 12; i++) { line(c, '#a8b0ba', .6, [[x + 8 + i * 4.5, G - 12], [x + 12 + i * 4.5, G - 12], [x + 12 + i * 4.5, G - 3]]); rect(c, '#1f4fa8', x + 8 + i * 4.5, G - 4, 3.4, 1.2); }
  rect(c, '#c8202a', x + 20, G - 62, 10, 8, '#6a1010', .3);
  ribbed(c, x + 320, G - 54, 40, 54, '#a2aab4', 1.8); rect(c, '#d64545', x + 300, G - 50, 6, 10);
  const X = x + 50;
  brick(c, X + 72, G - 150, 30, 40, '#a8503a'); c.strokeStyle = LINE; c.strokeRect(X + 72, G - 150, 30, 40);
  slate(c, [[X + 66, G - 150], [X + 108, G - 150], [X + 98, G - 164], [X + 76, G - 164]], '#3a3a3e'); rect(c, '#f6f4ee', X + 72, G - 148.6, 30, 7, LINE, .3); txt(c, 'TESCO', X + 87, G - 145, 5.2, '#d8262f', { f: 'Mont, sans-serif', w: 800 });
  { const cx = X + 87, cy = G - 128; c.beginPath(); c.arc(cx, cy, 7.4, 0, 7); c.fillStyle = '#1b1a24'; c.fill(); c.beginPath(); c.arc(cx, cy, 6.4, 0, 7); c.fillStyle = '#fbfaf6'; c.fill(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; rect(c, '#1b1a24', cx + Math.cos(a) * 5.2 - .3, cy + Math.sin(a) * 5.2 - .3, .6, .6); } line(c, '#1b1a24', .7, [[cx, cy], [cx, cy - 4.4]]); line(c, '#1b1a24', .7, [[cx, cy], [cx + 3, cy]]); }
  slate(c, [[X + 16, G - 66], [X + 224, G - 66], [X + 206, G - 116], [X + 34, G - 116]], '#3d3f45');
  brick(c, X + 20, G - 66, 200, 66, '#a8503a'); c.strokeStyle = LINE; c.strokeRect(X + 20, G - 66, 200, 66); rect(c, '#efeee9', X + 16, G - 70, 208, 4, LINE, .4);
  rect(c, '#f8f6f0', X + 52, G - 101, 128, 18, '#8a8880', .4);
  c.save(); c.font = '900 13px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#d8262f'; c.fillText('TESCO', X + 96, G - 92); c.font = 'italic 700 11px Georgia, serif'; c.fillStyle = '#1f4fa8'; c.fillText('Extra', X + 148, G - 92.4); c.restore();
  for (let i = 0; i < 5; i++) rect(c, '#1f4fa8', X + 76 + i * 8, G - 85, 5, .7);
  rect(c, '#c8202a', X + 40, G - 62, 70, 11, '#6a1010', .35);
  curtain(c, X + 40, G - 52, 70, 52, 5, 2); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(X + 52 + i * 15, G - 30, 4, 0, 7); c.fillStyle = ['#d84b3c', '#e8a33c', '#7fae4e', '#d84b3c'][i]; c.fill(); }
  rect(c, '#2a2f3a', X + 112, G - 52, 80, 52); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(X + 122 + i * 20, G - 50, 1.2, 0, 7); c.fillStyle = '#fff6c8'; c.fill(); }
  for (let i = 0; i < 9; i++) { line(c, '#a8b0ba', .6, [[X + 116 + i * 7, G - 14], [X + 122 + i * 7, G - 14], [X + 122 + i * 7, G - 4]]); rect(c, '#2f4fa8', X + 116 + i * 7, G - 6, 6, 1.6); }
  rect(c, '#1f4fa8', X + 160, G - 40, 30, 40, '#0e2a6a', .4); rect(c, '#3a3d44', X + 166, G - 32, 8, 10); rect(c, '#3a3d44', X + 178, G - 32, 8, 10);
  rect(c, '#1a1a1e', X + 200, G - 52, 20, 52); c.fillStyle = lg(c, 0, G - 48, 0, G - 22, [[0, '#e2f0f8'], [1, '#8ab0c8']]); c.fillRect(X + 203, G - 48, 14, 26); rect(c, '#e8c766', X + 205, G - 30, 10, 6);
  for (let i = 0; i < 4; i++) rect(c, '#d2ccc0', X + 24 + i * 4, G - 52, .8, 52);
  // welcome board (crisp), cones, bollards
  rect(c, '#c8202a', X + 45, G - 61, 60, 9); txt(c, 'Welcome', X + 75, G - 56.4, 5.6, '#ffffff', { f: 'Georgia, serif', w: 700 });
  for (const cx of [x + 4, x + 24, x + 120, x + 176]) { c.fillStyle = lg(c, cx, 0, cx + 6, 0, [[0, '#c8501a'], [.5, '#ff8a3c'], [1, '#b8441a']]); c.beginPath(); c.moveTo(cx, G); c.lineTo(cx + 2.4, G - 12); c.lineTo(cx + 3.6, G - 12); c.lineTo(cx + 6, G); c.fill(); rect(c, '#fff', cx + 1, G - 6.6, 4, 1.6); }
  for (const bx of [x + 98, x + 188, x + 194]) bollard(c, bx, G);
  c.restore();
};

// Currys: white central entrance block with a curved roof edge, the new purple standalone Currys board (ring + lowercase name),
// tall glazed entrance, sand-brick wings with blue Carphone Warehouse boards, trees, green bike stands, bollards, the two vans
HD.currys = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  for (const wx of [x, x + 260]) { brick(c, wx, G - 104, 100, 104, '#d6aa70'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(wx, G - 104, 100, 104); panels(c, wx, G - 118, 100, 14, '#eeeeea', 7); rect(c, '#3a3d44', wx, G - 10, 100, 10);
    c.fillStyle = lg(c, 0, G - 98, 0, G - 76, [[0, '#2c4ea0'], [1, '#1c3478']]); c.fillRect(wx + 8, G - 98, 76, 22); c.strokeStyle = '#0e1e4a'; c.strokeRect(wx + 8, G - 98, 76, 22);
    txt(c, 'Carphone', wx + 46, G - 90.4, 7, '#fff', { f: 'Mont, sans-serif', w: 700 }); txt(c, 'Warehouse', wx + 46, G - 82.6, 7, '#fff', { f: 'Mont, sans-serif', w: 700 }); }
  c.fillStyle = lg(c, x + 84, 0, x + 276, 0, [[0, '#e6e6e2'], [.5, '#fafaf8'], [1, '#e2e2de']]); c.fillRect(x + 84, G - 166, 192, 166); c.strokeStyle = LINE; c.strokeRect(x + 84, G - 166, 192, 166);
  c.beginPath(); c.moveTo(x + 78, G - 166); c.quadraticCurveTo(x + 180, G - 192, x + 282, G - 166); c.closePath(); c.fillStyle = lg(c, 0, G - 186, 0, G - 166, [[0, '#ffffff'], [1, '#dcdcd8']]); c.fill(); c.strokeStyle = LINE; c.stroke(); rect(c, '#c8c8c4', x + 78, G - 167, 204, 1.6);
  for (let i = 0; i < 12; i++) rect(c, 'rgba(0,0,0,.08)', x + 92 + i * 16, G - 160, .6, 54);
  c.fillStyle = lg(c, 0, G - 154, 0, G - 106, [[0, '#4c36b0'], [1, '#33238a']]); c.fillRect(x + 92, G - 154, 176, 48); c.strokeStyle = '#1e1458'; c.strokeRect(x + 92, G - 154, 176, 48);
  c.beginPath(); c.arc(x + 180, G - 130, 19, 0, 7); c.strokeStyle = '#ece8fa'; c.lineWidth = 1; c.stroke(); txt(c, 'currys', x + 180, G - 131, 11, '#ffffff', { f: 'Mont, sans-serif', w: 600 });
  curtain(c, x + 96, G - 104, 168, 104, 8, 3); rect(c, '#d4d8dc', x + 92, G - 68, 176, 4, '#8a9098', .35);
  c.fillStyle = 'rgba(30,40,50,.5)'; c.fillRect(x + 150, G - 40, 60, 40); for (const dx of [x + 152, x + 181]) { c.fillStyle = lg(c, 0, G - 38, 0, G, [[0, '#cfe0ec'], [1, '#6a8aa4']]); c.fillRect(dx, G - 38, 27, 38); } glare(c, x + 150, G - 40, 60, 40);
  for (const bx of [x + 92, x + 106, x + 246, x + 260]) { rect(c, '#1f6f3f', bx, G - 26, 9, 14, '#0e3a20', .3); txt(c, 'P', bx + 4.5, G - 19, 6, '#fff'); rect(c, '#d8d8d8', bx + 4, G - 12, 1, 12); }
  tree(c, x + 60, G, 1.1, { d: '#4f8a2c', m: '#6faa3e', l: '#9ccc66' }); tree(c, x + 300, G, 1.4, { d: '#5a8a34', m: '#7fb04a', l: '#a8d070' }); for (let i = 0; i < 6; i++) bollard(c, x + 6 + i * 10, G);
  const V = window.VEHICLES, hc = (q, b) => window.hdCtx ? hdCtx(q, b, G - 66, G) : q; if (V && V.mrrushed && V.mrrushed.parked) { V.mrrushed.parked(hc(c, null), x + 94, G, .79, null); if (V.donner) V.donner.parked(hc(c, '#141416'), x + 226, G, .81); }
  c.restore();
};

// B&Q: long grey clad warehouse with an orange top band, loading doors, central glazed tower with the orange B&Q board, entrance
// canopy, trees, a lamp column and two parked cars
HD.bandq = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const OR = '#ee6a1c';
  panels(c, x, G - 76, 440, 76, '#cdd2da', 9); rect(c, OR, x - 2, G - 82, 444, 6, '#9a3e08', .4); rect(c, '#c94e10', x - 2, G - 77.4, 444, 1.4);
  for (const bx of [x + 10, x + 330]) { rect(c, '#3a3f4a', bx, G - 30, 100, 30); for (let i = 0; i < 8; i++) { c.fillStyle = lg(c, 0, G - 28, 0, G, [[0, '#4a505c'], [1, '#2e333c']]); c.fillRect(bx + 4 + i * 12, G - 28, 10, 28); for (let k = 0; k < 9; k++) rect(c, 'rgba(0,0,0,.25)', bx + 4 + i * 12, G - 26 + k * 3, 10, .3); } }
  panels(c, x + 150, G - 150, 140, 150, '#cdd2da', 10); rect(c, OR, x + 146, G - 158, 148, 10, '#9a3e08', .4);
  curtain(c, x + 154, G - 146, 132, 104, 6, 4);
  c.fillStyle = lg(c, 0, G - 140, 0, G - 96, [[0, '#ff8a3c'], [.1, OR], [1, '#d45a10']]); c.fillRect(x + 166, G - 140, 108, 44); c.strokeStyle = '#9a3e08'; c.lineWidth = .6; c.strokeRect(x + 166, G - 140, 108, 44);
  c.save(); c.font = '900 30px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 2; c.strokeStyle = '#8a3208'; c.strokeText('B&Q', x + 220, G - 117); c.fillStyle = '#ffffff'; c.fillText('B&Q', x + 220, G - 117); c.restore();
  rect(c, OR, x + 154, G - 42, 132, 8, '#9a3e08', .35); txt(c, 'HOW DIY GETS DONE', x + 220, G - 38, 3.6, '#fff', { f: 'Mont, sans-serif', ls: .6 });
  rect(c, '#2a3036', x + 170, G - 34, 100, 34); for (const dx of [x + 186, x + 224]) { c.fillStyle = lg(c, 0, G - 30, 0, G, [[0, '#d4e4f0'], [1, '#6f8ea8']]); c.fillRect(dx, G - 30, 30, 30); glare(c, dx, G - 30, 30, 30); }
  tree(c, x + 40, G, 1.2, { d: '#4f8a2c', m: '#6faa3e', l: '#9ccc66' }); tree(c, x + 410, G, 1.1, { d: '#4f8a2c', m: '#6faa3e', l: '#9ccc66' });
  rect(c, '#9aa3ad', x + 136, G - 70, 1.6, 70); rect(c, '#ecebe7', x + 128, G - 72, 18, 2.4, '#8a8880', .3);
  hatch(c, x + 300, G, '#f2f2f2'); hatch(c, x + 116, G, '#7a8290');
  c.restore();
};

// Lidl: shallow-pitched silver roof edge, mixed timber/silver vertical cladding band with the Lidl logo square, full-height glass
// shop window (bright shelves, fruit & veg crates), dark wing with the green circles, blue trolley shelters, tree
HD.lidl = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  poly(c, lg(c, 0, G - 128, 0, G - 118, [[0, '#eef0f2'], [1, '#c4c8ce']]), [[x - 8, G - 118], [x + 268, G - 118], [x + 260, G - 128], [x, G - 128]], LINE, .4);
  for (let i = 0; i < 104; i++) { c.fillStyle = lg(c, 0, G - 118, 0, G - 66, [[0, ['#c4b6a2', '#d8ccb8', '#b0a28e', '#cfc2ae', '#a8aeb4', '#c0c6cc'][(i * 7) % 6]], [1, ['#b0a28e', '#c4b8a4', '#9a8c78', '#bcae9a', '#949aa0', '#aab0b6'][(i * 7) % 6]]]); c.fillRect(x + i * 2.5, G - 118, 2.2, 52); }
  c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 118, 260, 52);
  const LOGO = (lx, ly, sz) => { rect(c, '#1f52b0', lx, ly, sz, sz, '#0e2a6a', .4); c.beginPath(); c.arc(lx + sz / 2, ly + sz / 2, sz / 2 - 3, 0, 7); c.fillStyle = '#d32f2f'; c.fill(); c.beginPath(); c.arc(lx + sz / 2, ly + sz / 2, sz / 2 - 4.6, 0, 7); c.fillStyle = '#ffe23a'; c.fill(); c.save(); c.font = `900 ${sz * .3}px Mont, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1f52b0'; c.fillText('LIDL', lx + sz / 2, ly + sz / 2 + .6); c.restore(); c.beginPath(); c.arc(lx + sz * .44, ly + sz * .36, sz * .035, 0, 7); c.fillStyle = '#d32f2f'; c.fill(); };
  LOGO(x + 108, G - 116, 44);
  rect(c, '#3a4a5a', x, G - 66, 170, 66); c.fillStyle = lg(c, 0, G - 62, 0, G - 4, [[0, '#f6f8fa'], [1, '#dfe4e8']]); c.fillRect(x + 2, G - 64, 166, 60);
  for (let k = 0; k < 3; k++) { const sy = G - 60 + k * 13; rect(c, '#9aa3ad', x + 4, sy + 9, 162, 1.4); for (let i = 0; i < 80; i++) rect(c, ['#d84b3c', '#1f52b0', '#f2c43a', '#2f8a4a', '#e8a33c', '#ffffff', '#b8292f'][(i * 3 + k * 5) % 7], x + 5 + i * 2, sy + 2 + ((i + k) % 3), 1.6, 7 - ((i + k) % 3)); }
  for (let i = 0; i < 6; i++) { const cx = x + 8 + i * 27; rect(c, '#8a6a42', cx, G - 18, 22, 6, '#4a3420', .3); for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(cx + 2 + k * 2.3, G - 19.4 - (k % 2), 1.4, 0, 7); c.fillStyle = ['#2f8a4a', '#d84b3c', '#e8a33c', '#f2d23a', '#7fbf4a', '#d84b6a'][i]; c.fill(); } }
  for (let i = 0; i < 9; i++) rect(c, '#3a4a5a', x + i * 21, G - 66, 1.4, 66); glare(c, x + 2, G - 64, 166, 60);
  rect(c, '#2a3036', x + 170, G - 66, 90, 66); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + 186 + i * 20, G - 40, 6, 0, 7); c.fillStyle = '#7fbf4a'; c.fill(); c.beginPath(); c.arc(x + 186 + i * 20, G - 40, 3, 0, 7); c.fillStyle = '#f4f2ec'; c.fill(); } for (const px of [x + 172, x + 214, x + 256]) rect(c, '#efeee9', px, G - 66, 3, 66, '#8a8880', .25);
  for (let i = 0; i < 8; i++) { rect(c, '#efeee9', x + 14 + i * 20, G - 16, 1.4, 16); rect(c, '#9aa3ad', x + 14 + i * 20, G - 12, 20, .8); }
  tree(c, x - 10, G, 1.5, { d: '#3a6b2c', m: '#4f8a3c', l: '#7ab858' });
  for (const bx of [x + 150, x + 236]) { rect(c, '#1f52b0', bx, G - 30, 10, 26, '#0e2a6a', .3); rect(c, '#ffe23a', bx + 2, G - 24, 6, 6); }
  c.restore();
};

// Matalan: tall red-brick entrance block with a red pyramid canopy roof and MATALAN board, two tall glass curtain walls (one with
// red doors), white wings with brick piers and a red top band, brick plinth, red bollards along the front
HD.matalan = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const RD = '#d2232a', X = x - 40;
  for (const [bx, bw] of [[X + 40, 110], [X + 290, 110]]) { panels(c, bx, G - 78, bw, 78, '#f3f1eb', 8); rect(c, RD, bx - 2, G - 84, bw + 4, 6, '#7a1014', .35);
    for (let i = 0; i < 3; i++) { const px = bx + 6 + i * (bw - 12) / 3; brick(c, px, G - 78, 12, 78, '#a8503a'); c.strokeStyle = LINE; c.lineWidth = .35; c.strokeRect(px, G - 78, 12, 78); }
    brick(c, bx, G - 30, bw, 30, '#a8503a'); rect(c, RD, bx, G - 31, bw, 1.6); }
  curtain(c, X + 62, G - 74, 36, 44, 2, 3); for (let j = 0; j < 3; j++) rect(c, RD, X + 62, G - 74 + j * 14.6, 36, 1.4); rect(c, RD, X + 79, G - 74, 1.4, 44);
  rect(c, RD, X + 352, G - 44, 30, 44, '#7a1014', .4); rect(c, '#a81a20', X + 366, G - 44, 1.4, 44);
  for (const [px, col] of [[X + 106, '#f4f2ec'], [X + 126, '#2a6fa8'], [X + 316, '#2a6fa8'], [X + 334, '#f4f2ec']]) { rect(c, col, px, G - 28, 14, 20, '#3a3a3a', .3); rect(c, 'rgba(0,0,0,.15)', px + 2, G - 25, 10, 1); rect(c, 'rgba(0,0,0,.15)', px + 2, G - 22, 7, 1); }
  brick(c, X + 150, G - 130, 140, 130, '#a8503a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(X + 150, G - 130, 140, 130);
  poly(c, lg(c, 0, G - 166, 0, G - 150, [[0, '#e8424a'], [1, '#b01a20']]), [[X + 132, G - 158], [X + 308, G - 158], [X + 298, G - 150], [X + 142, G - 150]], '#6a0e10', .4);
  poly(c, '#a8181e', [[X + 132, G - 158], [X + 308, G - 158], [X + 290, G - 166], [X + 150, G - 166]], '#6a0e10', .4);
  c.fillStyle = lg(c, 0, G - 150, 0, G - 124, [[0, '#e0323a'], [1, '#b81c22']]); c.fillRect(X + 154, G - 150, 132, 26); c.strokeStyle = '#6a0e10'; c.strokeRect(X + 154, G - 150, 132, 26);
  txt(c, 'MATALAN', X + 220, G - 136.6, 13, '#ffffff', { f: 'Mont, sans-serif', w: 400, ls: 1.6 });
  for (const [gx, red] of [[X + 158, false], [X + 224, true]]) { curtain(c, gx, G - 118, 58, red ? 74 : 118, 4, red ? 4 : 6); rect(c, RD, gx, G - 46, 58, 2.4);
    if (red) { c.fillStyle = lg(c, 0, G - 44, 0, G, [[0, '#e0323a'], [1, '#a81a20']]); c.fillRect(gx, G - 44, 58, 44); for (const d of [14.5, 29, 43.5]) rect(c, '#7a1014', gx + d, G - 44, .8, 44); for (const d of [12, 26, 40]) rect(c, '#f0e0e0', gx + d, G - 24, .8, 6); } }
  for (let i = 0; i < 13; i++) bollard(c, X + 48 + i * 28, G, RD, '#ffffff');
  c.restore();
};

// JD Gyms: grey clad wings with dark roof bands, tall central block with a canopy on silver posts, navy sign with the white JD disc,
// GYMS and lime corner brackets, second canopy over the glazed front, black WELCOME JD GYMS LUTON band, glass doors; brick paving
HD.jdgyms = (c, x0, G) => {
  c.save(); c.lineJoin = 'round'; const x = x0 - 36;
  for (const bx of [x0, x0 + 204]) { panels(c, bx, G - 104, 84, 104, '#cdd2da', 14); rect(c, '#3a3f4a', bx - 2, G - 112, 88, 10, '#1a1e24', .4); rect(c, '#4a505c', bx - 2, G - 107, 88, .8); curtain(c, bx + 6, G - 50, 72, 50, 4, 1, ['#5a6878', '#2e3844', '#1e262e']); }
  panels(c, x + 112, G - 144, 136, 144, '#d6dae0', 12);
  poly(c, lg(c, 0, G - 162, 0, G - 152, [[0, '#e2e5e9'], [1, '#b8bec6']]), [[x + 96, G - 152], [x + 264, G - 152], [x + 256, G - 162], [x + 104, G - 162]], LINE, .4); for (const px of [x + 104, x + 252]) { c.fillStyle = lg(c, px, 0, px + 4, 0, [[0, '#8a929c'], [.5, '#e4e8ec'], [1, '#7a828c']]); c.fillRect(px, G - 152, 4, 152); }
  c.fillStyle = lg(c, 0, G - 148, 0, G - 102, [[0, '#384660'], [1, '#26303f']]); c.fillRect(x + 112, G - 148, 136, 46); c.strokeStyle = '#141a24'; c.lineWidth = .5; c.strokeRect(x + 112, G - 148, 136, 46);
  c.beginPath(); c.arc(x + 140, G - 125, 15, 0, 7); c.fillStyle = '#ffffff'; c.fill(); txt(c, 'JD', x + 140, G - 124.4, 14, '#26303f', { f: 'Mont, sans-serif', w: 900 });
  txt(c, 'GYMS', x + 204, G - 124.4, 18, '#ffffff', { f: 'Mont, sans-serif', w: 600, ls: 1 });
  const BR = (bx, by, sx, sy) => { rect(c, '#8be03a', sx < 0 ? bx - 9 : bx, by, 9, 2.2); rect(c, '#8be03a', sx < 0 ? bx - 2.2 : bx, sy < 0 ? by - 7 : by, 2.2, 9); };
  BR(x + 168, G - 142, 1, 1); BR(x + 240, G - 142, -1, 1); BR(x + 168, G - 109.2, 1, -1); BR(x + 240, G - 109.2, -1, -1);
  poly(c, lg(c, 0, G - 102, 0, G - 92, [[0, '#e2e5e9'], [1, '#b8bec6']]), [[x + 98, G - 92], [x + 262, G - 92], [x + 254, G - 102], [x + 106, G - 102]], LINE, .4); rect(c, '#9aa3ad', x + 106, G - 92, 148, 1.6);
  curtain(c, x + 116, G - 90, 128, 37, 6, 1, ['#6a7c90', '#3a4858', '#26303d']);
  rect(c, '#121418', x + 112, G - 53, 136, 12); txt(c, 'WELCOME  JD GYMS  LUTON', x + 180, G - 47, 6, '#ffffff', { f: 'Mont, sans-serif', ls: .8 });
  curtain(c, x + 116, G - 41, 128, 41, 6, 1, ['#5a6a7c', '#3a4858', '#232c38']); c.fillStyle = lg(c, 0, G - 40, 0, G, [[0, '#d4e4f0'], [1, '#7aa0bc']]); c.fillRect(x + 150, G - 40, 60, 40); rect(c, '#26303d', x + 179.4, G - 40, 1.2, 40); glare(c, x + 150, G - 40, 60, 40);
  rect(c, '#b98a62', x0 - 6, G - 3, 300, 3); for (let i = 0; i < 75; i++) rect(c, '#a8784f', x0 - 4 + i * 4, G - 3, .4, 3);
  c.restore();
};

// Big Yellow Self Storage: tall box in bright yellow ribbed cladding, black signs (THE BIG YELLOW SELF STORAGE stack, SELF STORAGE,
// BOXES & PACKING), white band, dark ground floor with the reception (glass + red Reception), black fence, white posts, tree
HD.bigyellow = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const Y = '#f8d418';
  ribbed(c, x, G - 150, 300, 110, Y, 2.4); rect(c, '#d9b70c', x, G - 96, 300, 1.2); rect(c, '#2a2a2e', x, G - 151.4, 300, 2);
  const SG = (sx, sy, w, h, l1, l2) => { rect(c, '#141416', sx, sy, w, h, '#000', .4); txt(c, l1, sx + w / 2, sy + h * .32, 6.4, '#ffffff', { f: 'Mont, sans-serif', w: 900 }); if (l2) txt(c, l2, sx + w / 2, sy + h * .72, 6.4, Y, { f: 'Mont, sans-serif', w: 900 }); };
  SG(x + 14, G - 132, 56, 22, 'SELF', 'STORAGE'); SG(x + 196, G - 132, 90, 22, 'BOXES &', 'PACKING');
  rect(c, '#141416', x + 102, G - 146, 62, 42, '#000', .4); [['THE BIG', '#fff'], ['YELLOW', Y], ['SELF', Y], ['STORAGE', '#fff']].forEach(([t, col], i) => txt(c, t, x + 133, G - 140.6 + i * 9.6, 7.6, col, { f: 'Mont, sans-serif', w: 900 }));
  rect(c, '#f4f4f0', x + 4, G - 42, 256, 8, '#8a8880', .3); rect(c, '#3a3d44', x, G - 40, 300, 40); for (let i = 0; i < 60; i++) rect(c, 'rgba(0,0,0,.18)', x + i * 5, G - 40, .4, 40);
  rect(c, '#f6f6f4', x + 6, G - 34, 70, 34, '#8a8880', .35); txt(c, 'Reception', x + 28, G - 29, 6, '#c8202a', { f: 'Mont, sans-serif', w: 800 }); c.fillStyle = lg(c, 0, G - 24, 0, G, [[0, '#d4e4f0'], [1, '#7aa0bc']]); c.fillRect(x + 50, G - 24, 22, 24); rect(c, '#2a2a2e', x + 60.6, G - 24, .8, 24); glare(c, x + 50, G - 24, 22, 24);
  for (let i = 0; i < 44; i++) rect(c, '#1a1a1e', x + 84 + i * 5, G - 22, .7, 22); rect(c, '#1a1a1e', x + 84, G - 22, 216, 1); rect(c, '#1a1a1e', x + 84, G - 4, 216, .8);
  rect(c, '#f4f2ec', x + 250, G - 34, 16, 12, '#8a8880', .3); rect(c, '#c8202a', x + 252, G - 32, 12, 3); rect(c, '#9aa3ad', x + 257, G - 22, 1.6, 22);
  for (let i = 0; i < 9; i++) { rect(c, '#f4f2ec', x + 10 + i * 8, G - 10, 3, 10, '#8a8880', .2); rect(c, Y, x + 10 + i * 8, G - 6, 3, 2); } rect(c, '#e8c84a', x + 80, G - 14, 8, 10, '#6a5a10', .3);
  tree(c, x + 300, G, .6, { d: '#3a6b2c', m: '#4f8a3c', l: '#7ab858' });
  c.restore();
};

// Orbital Trampoline Park: long grey ribbed shed, ribbon of windows near the roof, slanted two-tone green ORBITAL board + white
// TRAMPOLINE PARK board, low lime ground floor with blinds and a side door, red COSTA board, dark entrance block (canopy, lamps,
// TRAMPOLINE fin, 4 glass panes, green BOUNCE THIS WAY panel with arrows), brick pillar, little blue sign
HD.orbital = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const LM = '#a9c935', DK = '#363b43', GN = '#8cc63f', MW = 450, E = x + MW;
  poly(c, '#a4acb6', [[x - 2, G - 150], [x + 622, G - 150], [x + 616, G - 156], [x + 4, G - 156]], LINE, .4);
  ribbed(c, x, G - 150, MW, 106, '#8c949e', 2.6); for (const yy of [G - 122, G - 76]) rect(c, '#6c737c', x, yy, MW, .8);
  rect(c, '#cfd4da', x + 6, G - 142, MW - 12, 16, '#6c737c', .4); for (let i = 0; i < 28; i++) { c.fillStyle = lg(c, 0, G - 140, 0, G - 128, [[0, '#a8c4d8'], [1, '#4f6a82']]); c.fillRect(x + 8 + i * 15.6, G - 140, 13, 12); glare(c, x + 8 + i * 15.6, G - 140, 13, 12); }
  rect(c, DK, x + 10, G - 112, 190, 32, '#14161a', .4); rect(c, DK, x + 212, G - 108, 228, 24, '#14161a', .4);
  c.save(); c.translate(x + 105, G - 96); c.transform(1, 0, -.25, 1, 0, 0); c.font = '900 25px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#4f7a1c'; c.fillText('ORBITAL', 1, 1.2); c.fillStyle = lg(c, 0, -12, 0, 12, [[0, '#b8e86a'], [.5, GN], [.51, '#6fae2a'], [1, '#5a9a20']]); c.fillText('ORBITAL', 0, 0); c.restore();
  txt(c, 'TRAMPOLINE PARK', x + 326, G - 96, 13, '#f2f4f6', { f: 'Mont, sans-serif', w: 800, ls: 1.4 });
  c.fillStyle = lg(c, 0, G - 44, 0, G, [[0, '#b8d84a'], [1, '#93b12a']]); c.fillRect(x, G - 44, MW, 44); for (let i = 0; i < MW; i += 30) rect(c, '#88a428', x + i, G - 44, .6, 44); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 44, MW, 44);
  for (let k = 0; k < 7; k++) { const wx = x + 14 + k * 56; rect(c, '#2a2d34', wx, G - 36, 34, 18); for (let n = 0; n < 8; n++) rect(c, n % 2 ? '#d8dce0' : '#eef0f2', wx + 1.6, G - 34.4 + n * 1.9, 30.8, 1.9); rect(c, '#9aa3ad', wx + 16.6, G - 36, .8, 18); }
  rect(c, '#b0182a', E - 46, G - 62, 40, 14, '#600a14', .4); txt(c, 'COSTA', E - 26, G - 55, 7, '#f6efe4', { f: 'Georgia, serif', w: 700, ls: 1 });
  rect(c, '#1f2228', E - 38, G - 40, 22, 40); rect(c, '#9aa3ad', E - 20, G - 24, .8, 6); rect(c, '#2a6fd8', E - 34, G - 40, 6, 4);
  rect(c, '#4a5058', E, G - 150, 170, 20, '#1a1d22', .4); rect(c, '#5d646d', E, G - 150, 170, 1.4);
  rect(c, '#24272d', E + 1, G - 130, 168, 130); for (let i = 0; i < 168; i += 3) rect(c, '#2b2f36', E + 1 + i, G - 130, .8, 70);
  for (const lx of [E + 44, E + 104]) { rect(c, '#55595f', lx, G - 128, .8, 10); rect(c, '#6d737b', lx - 3, G - 119, 7, 2.6); rect(c, '#fff6d8', lx - 2, G - 116.6, 5, .8); }
  rect(c, DK, E + 4, G - 62, 12, 62); 'TRAMPOLINE'.split('').forEach((ch, i) => txt(c, ch, E + 10, G - 58 + i * 5.6, 4.2, '#d4d8dc', { f: 'Mont, sans-serif' }));
  rect(c, '#2c3138', E + 18, G - 62, 104, 62); for (let i = 0; i < 4; i++) { c.fillStyle = lg(c, 0, G - 60, 0, G, [[0, '#a8c0d4'], [1, '#56728a']]); c.fillRect(E + 20 + i * 15, G - 60, 13, 60); glare(c, E + 20 + i * 15, G - 60, 13, 60); }
  c.fillStyle = lg(c, 0, G - 60, 0, G, [[0, '#9ad44a'], [1, '#6fae2a']]); c.fillRect(E + 82, G - 60, 38, 60); ['BOUNCE', 'THIS', 'WAY'].forEach((t, i) => txt(c, t, E + 101, G - 52 + i * 8, 6.4, '#fff', { f: 'Mont, sans-serif', w: 900 }));
  for (let k = 0; k < 2; k++) poly(c, '#e8ffb0', [[E + 87 + k * 12, G - 22], [E + 93 + k * 12, G - 16], [E + 87 + k * 12, G - 10], [E + 91 + k * 12, G - 10], [E + 97 + k * 12, G - 16], [E + 91 + k * 12, G - 22]]);
  brick(c, E + 136, G - 130, 22, 130, '#8a6a52'); c.strokeStyle = LINE; c.strokeRect(E + 136, G - 130, 22, 130);
  rect(c, '#f2f4f6', E + 126, G - 50, 8, 8, '#8a8880', .3); rect(c, '#1f5fb0', E + 128, G - 48, 4, 4);
  c.restore();
};

// Grand Bazar Supermarket: long grey shed, sloping roof edge, navy fascia with the GB badge and GRAND BAZAR SUPERMARKET (lime/white),
// glass doors, white FRESH poster with badge + green swoosh, seven produce-photo window panes, lime end panel
HD.grandbazar = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const NV = '#243a6a', LM = '#a6cf2a';
  poly(c, '#a8aeb5', [[x - 2, G - 106], [x + 302, G - 106], [x + 296, G - 114], [x + 4, G - 114]], LINE, .4); for (let i = 8; i < 296; i += 3) rect(c, 'rgba(0,0,0,.14)', x + i, G - 113, .4, 7);
  ribbed(c, x, G - 106, 300, 30, '#cfd4db', 3);
  c.fillStyle = lg(c, 0, G - 102, 0, G - 80, [[0, '#2f4a82'], [1, '#1b2c52']]); c.fillRect(x + 2, G - 102, 296, 22); c.strokeStyle = '#0e1a34'; c.lineWidth = .4; c.strokeRect(x + 2, G - 102, 296, 22);
  const LOGO = (cx, cy, r) => { c.beginPath(); c.arc(cx, cy, r + .8, 0, 7); c.fillStyle = '#ffffff'; c.fill(); c.beginPath(); c.arc(cx, cy, r - 1.2, 0, 7); c.fillStyle = NV; c.fill(); c.save(); c.font = `900 ${r * 1.1}px Mont, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = LM; c.fillText('G', cx - r * .32, cy + r * .05); c.fillStyle = '#fff'; c.fillText('B', cx + r * .38, cy + r * .05); c.restore(); };
  LOGO(x + 92, G - 92, 12.4);
  c.save(); c.font = '900 10px Mont, sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'left'; let tx = x + 110; c.fillStyle = LM; c.fillText('GRAND', tx, G - 91); tx += c.measureText('GRAND ').width; c.fillStyle = '#fff'; c.fillText('BAZAR', tx, G - 91); tx += c.measureText('BAZAR ').width; c.font = '700 7px Mont, sans-serif'; c.fillStyle = LM; c.fillText('SUPERMARKET', tx, G - 90.4); c.restore();
  rect(c, '#2a2d34', x + 40, G - 78, 3, 2.4); rect(c, '#2a2d34', x + 220, G - 78, 3, 2.4);
  rect(c, '#3a4250', x + 2, G - 76, 296, 76); rect(c, '#9aa2ac', x + 2, G - 76, 296, 2.4);
  rect(c, '#2a303a', x + 6, G - 70, 34, 70); for (const dx of [x + 8, x + 24]) { c.fillStyle = lg(c, 0, G - 68, 0, G, [[0, '#c4d8e6'], [1, '#6a88a0']]); c.fillRect(dx, G - 68, 14, 68); glare(c, dx, G - 68, 14, 68); } rect(c, '#c9ced4', x + 20.6, G - 40, 1, 8); rect(c, '#c9ced4', x + 24.4, G - 40, 1, 8);
  rect(c, '#f8f8f4', x + 44, G - 72, 50, 72); txt(c, 'Fresh Everyday', x + 69, G - 66, 4.4, NV, { f: 'Georgia, serif', w: 700 }); LOGO(x + 69, G - 50, 9.4); txt(c, 'GRAND BAZAR', x + 69, G - 36.4, 4.4, NV, { f: 'Mont, sans-serif', w: 900 }); txt(c, 'SUPERMARKET', x + 69, G - 32, 3, LM, { f: 'Mont, sans-serif', w: 700 });
  c.fillStyle = LM; c.beginPath(); c.moveTo(x + 44, G - 12); c.quadraticCurveTo(x + 70, G - 30, x + 94, G - 24); c.lineTo(x + 94, G); c.lineTo(x + 44, G); c.fill(); rect(c, NV, x + 50, G - 8, 38, .8);
  const pics = [['#e86a2a', '#f2c14e', '#6fae3a'], ['#c8402e', '#e8a33c', '#3f7a2e'], ['#7fae4e', '#d84b3c', '#f4d35e'], ['#d8462e', '#f08a3c', '#a83a2a'], ['#5f9a3a', '#e8c24a', '#c8402e'], ['#e8a33c', '#7a3a8a', '#6fae3a'], ['#c83a3a', '#f2c14e', '#4f8a3c']];
  for (let i = 0; i < 7; i++) { const px = x + 98 + i * 26, [a1, a2, a3] = pics[i]; rect(c, '#2a303a', px - 2, G - 72, 2, 72); c.fillStyle = lg(c, 0, G - 70, 0, G - 2, [[0, shade(a1, .9)], [1, shade(a1, .55)]]); c.fillRect(px, G - 70, 24, 68);
    for (let k = 0; k < 22; k++) { const fx = px + 3 + (k * 7.3) % 18, fy = G - 64 + (k * 11.7) % 58, r = 2.2 + (k % 3); c.beginPath(); c.arc(fx, fy, r, 0, 7); c.fillStyle = [a2, a3, a1, '#f6f0e0'][k % 4]; c.fill(); c.beginPath(); c.arc(fx - r * .3, fy - r * .3, r * .35, 0, 7); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }
    glare(c, px, G - 70, 24, 68); }
  rect(c, '#2a303a', x + 280, G - 72, 2, 72); rect(c, LM, x + 283, G - 70, 13, 68); LOGO(x + 289.5, G - 54, 4); rect(c, '#ffffff', x + 285, G - 40, 9, .8); rect(c, '#ffffff', x + 285, G - 36, 7, .8);
  c.restore();
};

// Frasers Plus Luton: tall glass cube (sky-blue top rows, purple band with the rainbow tile + FRASERSPLUS LUTON, teal lower rows),
// blue entrance canopy, glass doors, bollards; TK Maxx block behind on the right with striped cladding, purple tiles, red fascia, trees
HD.frasers = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const tx = x + 124, tw = 168, th = 112;
  rect(c, '#8a9098', tx + 2, G - th - 7, tw - 4, .8); for (let i = 0; i <= 27; i++) rect(c, '#8a9098', tx + 2 + i * 6, G - th - 7, .6, 7);
  rect(c, '#ebe6de', tx, G - th, tw, th, LINE, .45);
  const CL = ['#ece7df', '#d9c6c2', '#c9c0b9', '#f3efe8', '#beb7b1', '#e2cfd0', '#d6d0c8'];
  for (let row = 0, yy = G - th + 3; yy < G - 40; row++, yy += 2.5) { let xx = tx + 1, k = 0; while (xx < tx + tw - 1) { const len = Math.min(10 + ((row * 31 + k * 17) % 7) * 6, tx + tw - 1 - xx); rect(c, CL[(row * 3 + k * 5) % CL.length], xx, yy, len - .4, 2.1); xx += len; k++; } }
  for (const [px, py] of [[tx + 112, G - 104], [tx + 40, G - 92], [tx + 150, G - 86], [tx + 70, G - 76], [tx + 128, G - 62], [tx + 20, G - 58]]) rect(c, '#6b35b8', px, py, 7, 4, '#3a1a6a', .25);
  for (const [wx, wy, w, h] of [[tx + 78, G - 92, 32, 14], [tx + 128, G - 98, 34, 22], [tx + 56, G - 66, 22, 8], [tx + 92, G - 62, 34, 12], [tx + 132, G - 64, 26, 14]]) curtain(c, wx, wy, w, h, Math.max(2, Math.round(w / 8)), 1, ['#7ab0b6', '#3e6a70', '#2a4a50']);
  c.save(); c.font = '900 13px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '-.5px'; c.fillStyle = '#ffffff'; c.fillText('TK maxx', tx + 51, G - th + 13.6); c.fillStyle = '#6a6460'; c.fillText('TK maxx', tx + 50, G - th + 12.6); c.restore();
  rect(c, '#8e1f2a', tx, G - 40, tw, 6); rect(c, '#b3262f', tx + 60, G - 40, tw - 60, 6);
  rect(c, '#2a3038', tx, G - 34, tw, 34); for (let i = 0; i < 6; i++) { curtain(c, tx + 3 + i * 27, G - 31, 24, 28, 2, 1, ['#8a9ca8', '#4d5c66', '#36424a']); rect(c, '#e7c97a', tx + 9 + i * 27, G - 22, 12, .8); }
  for (let i = 0; i <= 6; i++) rect(c, '#ddd7cd', tx + i * 27, G - 34, 1.6, 34);
  const fw = 128, fh = 152; rect(c, '#22333a', x, G - fh, fw, fh); rect(c, '#9aa6ae', x - 1, G - fh - 3, fw + 2, 3, LINE, .3);
  const rows = 10, cols = 8, ph = (fh - 2) / rows, pw = (fw - 2) / cols;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const T3 = r < 3 ? ['#a8d4e8', '#5ea0c4'] : r < 6 ? ['#5a4a8e', '#2e245a'] : ['#6aa8ae', '#2e6a70']; c.fillStyle = lg(c, 0, G - fh + r * ph, 0, G - fh + (r + 1) * ph, [[0, T3[0]], [1, T3[1]]]); c.fillRect(x + 1 + q * pw, G - fh + 1 + r * ph, pw - 1, ph - 1); }
  glare(c, x, G - fh, fw, fh); rect(c, '#9aa6ae', x - 1, G - fh, 1.4, fh); rect(c, '#9aa6ae', x + fw - .4, G - fh, 1.4, fh);
  { const lx = x + 14, ly = G - 106; const RB = ['#e8417a', '#f08a2a', '#f2d23a', '#3fc27a', '#3a8fe0', '#8a4fd8']; for (let i = 0; i < 6; i++) rect(c, RB[i], lx + i * 2.2, ly, 2.2, 13); rect(c, '#fff', lx + 5.4, ly + 3, 2, 7); rect(c, '#fff', lx + 3, ly + 5.6, 7, 2);
    txt(c, 'FRASERSPLUS', x + 70, ly + 6.6, 11, '#ffffff', { f: 'Mont, sans-serif', w: 400, ls: .2 }); txt(c, 'LUTON', x + 112, ly + 17, 6, '#ffffff', { f: 'Mont, sans-serif', w: 700, a: 'right' }); }
  rect(c, '#1f4fa8', x + 6, G - 36, fw - 12, 9, '#0e2a6a', .35); txt(c, 'FRASERSPLUS LUTON', x + 64, G - 31.4, 4.8, '#ffffff', { f: 'Mont, sans-serif', w: 700, ls: .6 });
  rect(c, '#26313a', x + 8, G - 27, fw - 16, 27); for (let i = 0; i < 7; i++) { c.fillStyle = lg(c, 0, G - 25, 0, G, [[0, '#c4dce6'], [1, '#6a96a8']]); c.fillRect(x + 10 + i * 16, G - 25, 14, 25); } glare(c, x + 10, G - 25, 110, 25);
  for (let i = 0; i < 9; i++) bollard(c, x - 4.5 + i * 18, G, '#2a2c30', '#5a5e66');
  for (const [k, s2] of [[24, .95], [92, .85], [152, .95]]) tree(c, tx + k, G, s2, { d: '#4f8a2c', m: '#6aa83a', l: '#9ccc66' });
  c.restore();
};

const ext = (c, s2, x, y, px, face, side, depth = 3, f = 'Mont, sans-serif', w = 900) => { c.save(); c.font = `${w} ${px}px ${f}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.fillStyle = side; for (let d = depth; d > 0; d -= .5) c.fillText(s2, x + d * .8, y + d * .6); c.fillStyle = face; c.fillText(s2, x, y); c.restore(); };

// Step Forward Luton: white wall with the red-and-black lattice, big chunky 3D orange LUTON letters in front, brown brick block
// on the right, paving, planters
HD.letters = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  rect(c, '#efeee9', x, G - 110, 120, 110, LINE, .45);
  c.save(); c.beginPath(); c.rect(x, G - 110, 120, 50); c.clip(); for (let i = -1; i < 7; i++) { line(c, '#c1544f', 3.2, [[x + i * 20, G - 110], [x + i * 20 + 22, G - 66]]); line(c, '#26262a', 3.2, [[x + i * 20 + 22, G - 110], [x + i * 20, G - 66]]); } c.restore();
  brick(c, x + 120, G - 86, 70, 86, '#8a6a54'); c.strokeStyle = LINE; c.strokeRect(x + 120, G - 86, 70, 86);
  rect(c, '#bdbab2', x, G - 6, 190, 6); for (let i = 0; i < 19; i++) rect(c, '#a8a59c', x + i * 10, G - 6, .4, 6);
  ext(c, 'LUTON', x + 95, G - 36, 50, '#f0601e', '#9c3410', 5);
  for (const [px, w2, h2] of [[x - 20, 20, 14], [x + 172, 22, 12]]) { brick(c, px, G - h2, w2, h2, '#c58f52', { bw: 2.6, bh: 1.2 }); rect(c, '#4f8a3c', px + 1, G - h2 - 3, w2 - 2, 3); for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(px + 2 + i * (w2 - 4) / 5, G - h2 - 3, 1.6, 0, 7); c.fillStyle = i % 2 ? '#6faa4e' : '#4f8a3c'; c.fill(); } }
  c.restore();
};

// Luton Station: viaduct with overhead line masts behind, brown brick booking hall with the blue Welcome to Luton board over the
// doors, National Rail sign, posters, ticket machine, defib, glass block with blue panels on the right
HD.station = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  for (const px of [x + 20, x + 130, x + 240]) { panels(c, px, G - 92, 10, 30, '#a0a6ac', 10); rect(c, '#6a6e76', px + 4, G - 136, 1.6, 44); rect(c, '#6a6e76', px - 6, G - 132, 16, 1.6); rect(c, '#9aa0a8', px - 4, G - 133.6, 1.4, 3); rect(c, '#9aa0a8', px + 6.6, G - 133.6, 1.4, 3); }
  line(c, '#4a4d54', .5, [[x - 6, G - 129], [x + 276, G - 129]]); line(c, '#4a4d54', .35, [[x - 6, G - 126], [x + 276, G - 126]]);
  panels(c, x - 6, G - 92, 282, 8, '#b8bec4', 4); rect(c, '#4a4d54', x - 6, G - 94, 282, 2);
  rect(c, '#26303d', x + 210, G - 66, 60, 66); c.fillStyle = lg(c, 0, G - 64, 0, G - 42, [[0, '#e4ecf2'], [1, '#9ab0c4']]); c.fillRect(x + 212, G - 64, 56, 22); c.fillStyle = lg(c, 0, G - 40, 0, G, [[0, '#3a74c8'], [1, '#1f4a94']]); c.fillRect(x + 212, G - 40, 56, 40); rect(c, '#26303d', x + 239.4, G - 64, 1.2, 64); glare(c, x + 212, G - 64, 56, 64); rect(c, '#3a3d44', x + 206, G - 70, 68, 4);
  brick(c, x, G - 74, 210, 74, '#7a4e3a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 74, 210, 74); rect(c, '#bdb7aa', x - 2, G - 78, 214, 4, LINE, .35);
  for (let i = 0; i < 3; i++) sash(c, x + 34 + i * 20, G - 64, 16, 12, { stone: '#f4f2ec' }); sash(c, x + 2, G - 64, 12, 22, { stone: '#f4f2ec' });
  rect(c, '#1f3f8a', x + 104, G - 60, 62, 22, '#0e2050', .4); rect(c, '#ffffff', x + 106, G - 58, 58, 18); txt(c, 'Welcome to', x + 135, G - 53.4, 5, '#1f3f8a', { f: 'Mont, sans-serif', w: 600 }); txt(c, 'Luton', x + 135, G - 45.4, 8, '#1f3f8a', { f: 'Mont, sans-serif', w: 800 });
  rect(c, '#1f3f8a', x + 112, G - 38, 46, 38); rect(c, '#3a3d44', x + 116, G - 36, 38, 36); c.fillStyle = lg(c, 0, G - 36, 0, G, [[0, '#c89a62'], [1, '#9a7444']]); c.fillRect(x + 116, G - 36, 14, 36); c.fillStyle = lg(c, 0, G - 36, 0, G, [[0, '#8aa8c0'], [1, '#3a4a5a']]); c.fillRect(x + 132, G - 36, 22, 36); glare(c, x + 132, G - 36, 22, 36);
  rect(c, '#d32f2f', x + 192, G - 70, 14, 20, '#6a1010', .3); line(c, '#fff', .9, [[x + 194.6, G - 64], [x + 203.4, G - 64]]); line(c, '#fff', .9, [[x + 194.6, G - 57], [x + 203.4, G - 57]]); line(c, '#fff', .9, [[x + 196, G - 66.6], [x + 202, G - 60.6], [x + 196, G - 54.4]]);
  const poster = (px, py, w, h, col) => { rect(c, '#1f3f8a', px - 1, py - 1, w + 2, h + 2); rect(c, '#f6f4ee', px, py, w, h); rect(c, col, px + 2, py + 2, w - 4, h * .35); for (let k = 0; k < 4; k++) rect(c, '#9aa0a8', px + 2, py + h * .5 + k * 2.4, w - 4 - (k % 2) * 3, .6); };
  poster(x + 6, G - 36, 18, 22, '#d84b6a'); poster(x + 28, G - 38, 16, 24, '#3a74c8'); poster(x + 48, G - 36, 16, 22, '#f2a33a'); poster(x + 92, G - 38, 14, 22, '#5aa86a'); poster(x + 164, G - 38, 18, 24, '#8a4fd8');
  rect(c, '#1a1a1e', x + 70, G - 44, 18, 32, '#000', .3); rect(c, '#3fb04a', x + 70, G - 44, 18, 3); c.fillStyle = lg(c, 0, G - 38, 0, G - 30, [[0, '#cfe4f2'], [1, '#6f8ea8']]); c.fillRect(x + 74, G - 38, 10, 8); rect(c, '#5a6470', x + 74, G - 26, 10, 4); rect(c, '#9aa0a8', x + 76, G - 20, 6, 1);
  rect(c, '#f2c43a', x + 186, G - 34, 12, 14, '#7a5a10', .3); rect(c, '#2e8b3a', x + 189, G - 31, 6, 4); line(c, '#fff', .6, [[x + 190, G - 29], [x + 191.6, G - 29], [x + 192.4, G - 30.6], [x + 193.2, G - 27.4], [x + 194, G - 29]]);
  c.restore();
};

// SMR billboard building: red-brick gable end (stone coping, chimney + pots, drainpipe, tie plates), narrow front strip with sash
// windows and a blue door; steel billboard frame with lamp arms: dark board with the real SMR mark, WEBSITES / APPS, GRAPHIC DESIGN,
// PRINTING in the brand gradients and smrgraphics.co.uk; SMR STUDIO plate over the door
const SMR_MARK = new Path2D('M340.2 1.0 L340.2 255.3 L340.7 256.1 L399.6 255.8 L400.9 254.8 L400.6 103.9 L401.1 102.9 L402.2 102.9 L507.3 217.8 L509.9 220.4 L510.7 220.4 L617.9 103.4 L619.7 102.6 L620.2 103.4 L619.7 254.8 L620.7 256.1 L682.2 255.6 L682.7 255.1 L682.4 0.5 L627.7 0.5 L594.9 36.8 L510.4 133.2 L505.8 128.6 L422.1 32.7 L393.2 0.5 L340.7 0.5ZM712.8 0.8 L713.0 191.1 L822.3 85.4 L820.3 83.1 L792.2 63.5 L793.0 62.2 L807.9 61.7 L873.7 56.9 L905.4 55.3 L906.1 56.1 L906.1 59.4 L905.4 60.9 L896.6 112.1 L890.5 145.8 L889.7 147.3 L889.7 150.2 L888.9 150.9 L887.4 150.2 L886.3 148.1 L869.6 126.0 L868.9 126.0 L807.9 183.3 L807.9 184.1 L880.7 253.3 L884.0 255.8 L1000.0 255.6 L997.2 251.7 L926.5 173.3 L926.5 172.3 L927.7 171.3 L929.5 171.0 L938.5 167.2 L949.9 160.6 L957.8 154.2 L964.4 147.0 L970.8 138.1 L975.9 128.3 L980.1 116.5 L982.6 105.9 L984.0 96.9 L984.5 82.8 L982.9 67.6 L980.4 57.1 L976.8 46.5 L971.0 35.2 L964.3 25.9 L958.1 19.5 L948.8 12.5 L937.0 6.4 L925.9 2.9 L911.5 0.6 L808.2 0.0ZM28.8 27.0 L23.6 34.3 L20.2 40.1 L17.0 47.1 L14.1 55.5 L11.4 68.9 L11.5 87.4 L12.9 95.4 L15.0 102.6 L18.1 110.3 L22.4 118.5 L27.1 125.5 L32.5 131.9 L38.3 137.2 L44.7 142.0 L53.7 147.3 L64.8 151.8 L74.8 154.4 L87.9 156.2 L210.1 156.6 L237.9 157.3 L242.0 158.3 L245.8 160.1 L251.7 165.3 L254.1 168.7 L255.8 172.5 L256.9 177.2 L256.9 180.8 L254.8 187.8 L250.6 193.6 L244.8 197.9 L237.9 199.9 L44.5 200.1 L0.0 255.3 L0.3 256.4 L243.3 255.9 L251.2 254.9 L260.7 252.6 L267.9 250.1 L275.6 246.4 L282.1 242.5 L288.0 238.0 L294.7 231.5 L299.1 226.0 L303.5 219.3 L307.1 212.4 L309.7 206.0 L311.9 198.3 L313.3 191.3 L314.4 180.3 L313.1 167.1 L311.1 158.1 L308.7 150.7 L306.0 144.5 L301.6 136.8 L297.1 130.5 L291.6 124.2 L278.7 114.1 L269.7 109.1 L258.9 104.7 L246.9 101.7 L237.1 100.4 L154.3 100.0 L84.3 99.0 L77.2 96.1 L72.0 91.2 L68.3 84.1 L67.5 76.6 L68.0 73.0 L69.1 69.7 L73.6 63.1 L79.7 59.0 L87.4 57.0 L263.6 57.3 L264.8 56.3 L308.3 1.3 L308.0 0.5 L90.3 0.0 L78.7 0.6 L64.0 3.6 L51.2 8.9 L45.3 12.3 L39.1 16.8Z');
HD.smr = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const WT = G - 150, b = { x: 14, y: 140, w: 148, h: 82 };
  c.save(); c.beginPath(); c.moveTo(x + 9, G); c.lineTo(x + 9, WT); c.lineTo(x + 88, WT - 29); c.lineTo(x + 167, WT); c.lineTo(x + 167, G); c.closePath(); c.clip(); brick(c, x + 9, WT - 30, 158, 180, '#9c4a36'); c.restore();
  line(c, LINE, .5, [[x + 9, G], [x + 9, WT], [x + 88, WT - 29], [x + 167, WT], [x + 167, G]]);
  poly(c, '#5e5f66', [[x + 6, WT + 1], [x + 88, WT - 31], [x + 170, WT + 1], [x + 170, WT + 4], [x + 88, WT - 27], [x + 6, WT + 4]], LINE, .35);
  stack(c, x + 80, WT - 46, 16, 18, '#8a3f2e', 2);
  brick(c, x + 168, WT + 8, 34, 142, '#8a4030'); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 168, WT + 8, 34, 142); slate(c, [[x + 166, WT + 9], [x + 176, WT - 4], [x + 204, WT - 4], [x + 204, WT + 9]], '#4a4b52');
  for (let f = 0; f < 3; f++) sash(c, x + 176, WT + 18 + f * 38, 18, 26, { stone: '#f1ede4', key: true });
  rect(c, '#1f3a5c', x + 176, G - 30, 18, 30, '#0e1e30', .35); for (const [a, b2] of [[3, 9], [3, 19]]) rect(c, 'rgba(255,255,255,.1)', x + 179, G - 30 + b2 - 6, 12, 7); c.fillStyle = lg(c, 0, G - 27, 0, G - 19, [[0, '#cfe0ee'], [1, '#7a9ab4']]); c.fillRect(x + 179, G - 27, 12, 5); c.beginPath(); c.arc(x + 190, G - 15, .9, 0, 7); c.fillStyle = '#e3c46a'; c.fill(); rect(c, '#d9d2c2', x + 174, G - 33, 22, 2);
  c.fillStyle = lg(c, x + 162, 0, x + 165, 0, [[0, '#2a2c32'], [.5, '#5a5c64'], [1, '#2a2c32']]); c.fillRect(x + 162, WT + 2, 3, 148); for (const [ax, ay] of [[30, 30], [146, 30]]) { c.beginPath(); c.arc(x + ax, G - ay, 2.6, 0, 7); c.fillStyle = '#3c3e44'; c.fill(); c.strokeStyle = '#1b1a24'; c.lineWidth = .4; c.stroke(); }
  // billboard
  const bx = x + b.x, by = G - b.y; rect(c, '#2a2c33', bx - 4, by - 4, b.w + 8, b.h + 8, '#141418', .5); rect(c, '#9aa0aa', bx - 3, by - 3, b.w + 6, .8);
  c.fillStyle = lg(c, 0, by, 0, by + b.h, [[0, '#18182e'], [1, '#0a0a14']]); c.fillRect(bx, by, b.w, b.h);
  { const g = c.createRadialGradient(bx + b.w / 2, by + b.h * .32, 2, bx + b.w / 2, by + b.h * .32, b.w * .55); g.addColorStop(0, 'rgba(120,80,255,.25)'); g.addColorStop(1, 'rgba(120,80,255,0)'); c.fillStyle = g; c.fillRect(bx, by, b.w, b.h); }
  c.save(); const lw = 84, sc = lw / 1000; c.translate(bx + (b.w - lw) / 2, by + 6); c.scale(sc, sc); c.fillStyle = '#ffffff'; c.fill(SMR_MARK, 'evenodd'); c.restore();
  [['WEBSITES / APPS', '#7b6bff', '#e04bff'], ['GRAPHIC DESIGN', '#3a7bff', '#b04bff'], ['PRINTING', '#ff3d8b', '#ff9a3d']].forEach(([t, a, b2], i) => { c.save(); c.font = '800 7.4px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; const tw = c.measureText(t).width, cx = bx + b.w / 2, y = by + 37 + i * 10; c.fillStyle = lg(c, cx - tw / 2, 0, cx + tw / 2, 0, [[0, a], [1, b2]]); c.fillText(t, cx, y); c.restore(); });
  rect(c, 'rgba(255,255,255,.2)', bx + b.w / 2 - 36, by + 66, 72, .6); txt(c, 'smrgraphics.co.uk', bx + b.w / 2, by + 73, 5.6, '#ffffff', { f: 'Mont, sans-serif', w: 500 });
  rect(c, '#2a2c33', bx + 10, by + b.h + 4, b.w - 20, 2);
  for (let i = 0; i < 3; i++) { const lx = bx + 24 + i * (b.w - 48) / 2; rect(c, '#1b1a24', lx, by - 14, 1.6, 10); rect(c, '#1b1a24', lx, by - 14, 8, 1.6); rect(c, '#c9ccd2', lx + 6, by - 13, 6, 2.6, '#1b1a24', .3); }
  rect(c, '#1b1d24', x + 40, G - 30, 96, 10, '#000', .3); txt(c, 'SMR  STUDIO', x + 88, G - 25, 5.6, '#e9e4d6', { f: 'Mont, sans-serif', w: 700, ls: 1.2 });
  rect(c, '#3a3d44', x + 70, G - 18, 36, 18); for (const dx of [x + 72, x + 89]) { c.fillStyle = lg(c, 0, G - 16, 0, G, [[0, '#cfe0ee'], [1, '#6f8ea8']]); c.fillRect(dx, G - 16, 15, 16); glare(c, dx, G - 16, 15, 16); }
  c.restore();
};

// The Hat Factory: gable end of the old factory (pointed top with a pale coping, stone bands either side), the "If you can dream
// it you must do it" mural (patterned tiles, big pink capitals with blue shadow; never lit at night), small sign, metal hoarding
HD.hatfactory = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const W = 140, top = G - 208, eave = G - 176;
  c.save(); c.beginPath(); c.moveTo(x, G); c.lineTo(x, eave); c.lineTo(x + W / 2, top); c.lineTo(x + W, eave); c.lineTo(x + W, G); c.closePath(); c.clip(); brick(c, x, top, W, 208, '#8f4a35'); c.restore();
  line(c, LINE, .5, [[x, G], [x, eave], [x + W / 2, top], [x + W, eave], [x + W, G]]);
  poly(c, '#ebe6db', [[x - 3, eave + 1], [x + W / 2, top - 3], [x + W + 3, eave + 1], [x + W, eave + 2.6], [x + W / 2, top + 1], [x, eave + 2.6]], LINE, .35);
  for (const yy of [G - 152, G - 116, G - 80]) for (const sx of [x, x + W - 14]) { rect(c, '#ebe4d6', sx, yy, 14, 4, '#9a9288', .25); rect(c, '#cfc6b4', sx, yy + 4, 14, .8); }
  const mx = x + 16, mw = W - 32, my = G - 170, mh = 122;
  rect(c, '#c98a7c', mx, my, mw, mh, '#6a4a40', .4); const pc = ['#d9a596', '#a9b6c8', '#c77a6e', '#e2c7a8', '#9fb0a8', '#d8a8b8', '#f0d8c8', '#8a9cb8'];
  for (let i = 0; i * 2.6 < mw - 1; i++) for (let j = 0; j * 2.6 < mh - 1; j++) { c.fillStyle = pc[(i * 3 + j * 5 + ((i * j) % 7)) % 8]; c.fillRect(mx + .4 + i * 2.6, my + .4 + j * 2.6, 2.2, 2.2); }
  ['IF YOU', 'CAN', 'DREAM IT', 'YOU MUST', 'DO IT'].forEach((w, k) => { const ty = my + 14 + k * 23; c.save(); c.font = '900 15px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    while (c.measureText(w).width > mw - 8) c.font = `900 ${parseFloat(c.font) - .5}px Mont, sans-serif`;
    c.fillStyle = '#1f3f8f'; c.fillText(w, mx + mw / 2 + 1.6, ty + 1.6); c.fillStyle = '#3a6fd8'; c.fillText(w, mx + mw / 2 + .8, ty + .8); c.fillStyle = '#ffb8d8'; c.fillText(w, mx + mw / 2, ty); c.restore(); });
  rect(c, '#1f2a4a', x + W / 2 - 16, G - 44, 32, 10, '#000', .3); rect(c, '#ffffff', x + W / 2 - 12, G - 41, 24, .8); rect(c, '#9fb3d8', x + W / 2 - 10, G - 38, 20, .8);
  for (let i = 0; i * 6 < W + 16; i++) { c.fillStyle = lg(c, x - 8 + i * 6, 0, x - 2 + i * 6, 0, [[0, '#8e959c'], [.5, '#b4bbc2'], [1, '#868d94']]); c.fillRect(x - 8 + i * 6, G - 30, 6, 30); } rect(c, '#5d646b', x - 8, G - 30, W + 16, 1.6); for (let i = 0; i < 6; i++) rect(c, '#3a3d44', x - 6 + i * 29, G - 3, 4, 3);
  for (let i = 0; i < 13; i++) { const a = -Math.PI / 2 + (i - 6) * .2; line(c, i % 2 ? '#4f8a3c' : '#6faa4e', 1.2, [[x + 160, G - 3], [x + 160 + Math.cos(a) * 18, G - 3 + Math.sin(a) * 20]]); } rect(c, '#4a2f25', x + 146, G - 4, 34, 4);
  c.restore();
};

// Luton & Dunstable University Hospital: tall grey ward block behind, dark louvred side blocks, tan cladding box with diagonal
// joints and the name, tall glass window, ground floor of glass doors, black MAIN ENTRANCE and red EMERGENCY DEPT signs (centred),
// red leg, curved low wall with a rail
HD.ldh = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; x += 44; const TN = '#dcaa7c';
  panels(c, x + 152, G - 236, 148, 236, '#aeb2b8', 18); rect(c, '#7e848c', x + 196, G - 250, 70, 14, LINE, .4); for (let i = 0; i < 12; i++) rect(c, '#6a7078', x + 198 + i * 5.6, G - 248, 2.6, 10);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) { c.fillStyle = lg(c, 0, G - 226 + r * 18, 0, G - 215 + r * 18, [[0, (r + i) % 3 ? '#8aa4ba' : '#a8c0d2'], [1, '#4f6a82']]); c.fillRect(x + 157 + i * 20, G - 226 + r * 18, 16, 11); }
  for (const [bx, bw, bh] of [[x - 40, 106, 132], [x + 270, 30, 124]]) { rect(c, '#2e3238', bx, G - bh, bw, bh, LINE, .4); for (let i = 0; i < 18; i++) rect(c, '#3e434b', bx + 2, G - bh + 4 + i * 2.2, bw - 4, 1.2); }
  rect(c, '#4a5562', x + 18, G - 86, 44, 12);
  c.fillStyle = lg(c, x + 64, 0, x + 272, 0, [[0, shade(TN, 1.04)], [1, shade(TN, .94)]]); c.fillRect(x + 64, G - 156, 208, 110); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 64, G - 156, 208, 110);
  c.save(); c.beginPath(); c.rect(x + 64, G - 156, 208, 40); c.clip(); for (let i = -2; i < 20; i++) line(c, shade(TN, .86), .5, [[x + 64 + i * 13, G - 116], [x + 64 + i * 13 + 20, G - 156]]); c.restore();
  for (const yy of [G - 116, G - 84]) rect(c, shade(TN, .88), x + 64, yy, 208, .6); for (let i = 1; i < 9; i++) rect(c, shade(TN, .88), x + 64 + i * 23, G - 116, .6, 70);
  rect(c, '#26292e', x + 86, G - 134, 50, 88); curtain(c, x + 90, G - 130, 42, 80, 2, 3);
  txt(c, 'Luton and Dunstable', x + 205, G - 106, 6.4, '#f4f6f8', { f: 'Mont, sans-serif', w: 500 }); txt(c, 'University Hospital', x + 205, G - 97, 6.4, '#f4f6f8', { f: 'Mont, sans-serif', w: 500 });
  rect(c, '#4a4e56', x - 40, G - 46, 330, 46); for (let i = 0; i < 22; i++) rect(c, '#3e424a', x - 40, G - 44 + i * 2, 330, .5);
  curtain(c, x - 34, G - 42, 42, 42, 2, 2); curtain(c, x + 14, G - 42, 56, 42, 2, 2); rect(c, '#2e3238', x + 40, G - 18, 26, 18); curtain(c, x + 90, G - 42, 56, 42, 4, 1); curtain(c, x + 168, G - 42, 70, 42, 3, 1); rect(c, '#d8262f', x + 196, G - 34, 18, 18);
  rect(c, '#121418', x - 44, G - 58, 208, 14, '#000', .4); txt(c, 'MAIN ENTRANCE', x + 60, G - 51, 7, '#ffffff', { f: 'Mont, sans-serif', w: 800, ls: .8 });
  rect(c, '#e3171f', x + 162, G - 60, 100, 16, '#7a0a0e', .4); txt(c, 'EMERGENCY DEPARTMENT', x + 212, G - 52, 5.6, '#ffffff', { f: 'Mont, sans-serif', w: 800, ls: .4 });
  poly(c, '#e3171f', [[x + 248, G - 44], [x + 262, G - 44], [x + 262, G], [x + 254, G], [x + 254, G - 30]], '#7a0a0e', .35);
  c.fillStyle = '#3a3e44'; c.beginPath(); c.moveTo(x - 46, G); c.lineTo(x - 46, G - 8); c.quadraticCurveTo(x + 129, G - 16, x + 304, G - 8); c.lineTo(x + 304, G); c.closePath(); c.fill();
  for (let i = 0; i < 70; i++) rect(c, 'rgba(0,0,0,.18)', x - 46 + i * 5, G - 8, .4, 8);
  c.strokeStyle = '#dcd8ce'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 46, G - 8); c.quadraticCurveTo(x + 129, G - 16, x + 304, G - 8); c.stroke();
  line(c, '#b8bec6', .8, [[x + 186, G - 20], [x + 240, G - 26]]); for (const px of [x + 190, x + 214, x + 236]) line(c, '#b8bec6', .7, [[px, G - 20.4 - (px - x - 186) * .11], [px, G - 11]]);
  c.restore();
};

// Luton Foodbank: green corrugated warehouse with a dark roof band, yellow-buff brick base, white sign with the real look (red
// "luton", grey "food" + red "bank", white heart with the yolk), barred window, grey door, open loading bay with shelves and crates
HD.foodbank = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  ribbed(c, x, G - 112, 281, 64, '#2f7a5a', 2.2); rect(c, '#1f5a40', x - 3, G - 118, 287, 7, '#0e3a28', .4); rect(c, '#3f9a72', x - 3, G - 118, 287, 1);
  brick(c, x, G - 48, 156, 48, '#dab56c'); brick(c, x + 252, G - 48, 29, 48, '#dab56c');   // right wall 40% narrower (owner) line(c, LINE, .45, [[x, G - 48], [x + 281, G - 48]]);
  // from the owner's photo (35 York St): two dark-framed windows with security grilles + blinds, small plaques, the door right by
  // the garage (white frame, dark inside), red-brick edge where the brick meets the bay
  for (const wx of [x + 14, x + 54]) { rect(c, '#4a4e56', wx, G - 40, 28, 26, '#22242a', .4); c.fillStyle = lg(c, 0, G - 38, 0, G - 16, [[0, '#8a96a2'], [1, '#3e4650']]); c.fillRect(wx + 2, G - 38, 24, 22); for (let k = 0; k < 10; k++) rect(c, 'rgba(230,226,214,.5)', wx + 2, G - 38 + k * 1.4, 24, .6);
    for (let k = 0; k < 9; k++) rect(c, '#2a2c32', wx + 3 + k * 2.6, G - 38, .7, 22); rect(c, '#2a2c32', wx + 2, G - 28, 24, .7); rect(c, '#d8cfb8', wx - 1, G - 14, 30, 1.6, '#8a8270', .25); }
  for (const px of [x + 92, x + 136]) rect(c, '#8a9098', px, G - 44, 10, 5, '#4a4e56', .3);
  rect(c, '#f4f4f2', x + 114, G - 41, 20, 41, '#8a8a84', .35); c.fillStyle = lg(c, 0, G - 39, 0, G, [[0, '#1e2228'], [1, '#2a3038']]); c.fillRect(x + 116, G - 39, 16, 39); rect(c, '#3a5a8a', x + 118, G - 30, 3, 20); rect(c, '#c8202a', x + 124, G - 24, 4, 6);
  poly(c, '#d8dce0', [[x + 131.4, G - 39], [x + 134.6, G - 40.6], [x + 134.6, G + .4], [x + 131.4, G]], '#8a8a84', .3);
  { const cx = x + 138; c.fillStyle = lg(c, cx, 0, cx + 7, 0, [[0, '#e88a1a'], [.5, '#ffb040'], [1, '#d07a10']]); c.beginPath(); c.moveTo(cx, G); c.lineTo(cx + 3, G - 11); c.lineTo(cx + 4.4, G - 11); c.lineTo(cx + 7.4, G); c.fill(); c.beginPath(); c.arc(cx + 3.7, G - 5, 1.6, 0, 7); c.fillStyle = '#2a4ab8'; c.fill(); rect(c, '#c8202a', cx + 2.2, G - 5.3, 3, .6); rect(c, '#2a2a2e', cx - 1, G - 1.4, 9.4, 1.4); }
  brick(c, x + 148, G - 48, 8, 48, '#b0583e', { bw: 2.4, bh: 1.1 });
  rect(c, '#1f5a40', x + 156, G - 98, 96, 98); rect(c, '#17171b', x + 160, G - 92, 88, 92); rect(c, '#3f8a68', x + 158, G - 98, 92, 6);
  // inside the bay (owner): a big white van parked nose-out in the middle, four shelves of green and blue crates either side of it
  c.fillStyle = lg(c, 0, G - 92, 0, G, [[0, '#24242a'], [1, '#121216']]); c.fillRect(x + 160, G - 92, 88, 92);
  const crate = (cx, cy, w, h, col) => { c.fillStyle = lg(c, 0, cy, 0, cy + h, [[0, shade(col, 1.18)], [1, shade(col, .78)]]); c.fillRect(cx, cy, w, h); rect(c, 'rgba(0,0,0,.28)', cx, cy + h * .45, w, .4); rect(c, 'rgba(0,0,0,.45)', cx + w * .3, cy + 1, w * .4, 1.1); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = .3; c.strokeRect(cx, cy, w, h); };
  c.save(); c.beginPath(); c.rect(x + 160, G - 92, 88, 92); c.clip();
  for (const [sx, sw] of [[x + 150, 24], [x + 234, 24]]) { for (const px of [sx, sx + sw - 1.2]) rect(c, '#8a929c', px, G - 82, 1.2, 82);
    for (let k = 0; k < 4; k++) { const sy = G - 62 + k * 19 - 19; rect(c, '#a8b0ba', sx, sy + 15, sw, 1.4); const n = 2; for (let j = 0; j < n; j++) crate(sx + 1.6 + j * 9.6, sy + 7.6, 8.6, 7.2, (j + k + (sx > x + 200 ? 1 : 0)) % 2 ? '#2a6fd8' : '#3fae5a'); } }
  c.restore();
  { const vx = x + 204, vb = G - 1, W2 = 40, H2 = 60, L = vx - W2 / 2, Rr = vx + W2 / 2;   // high-roof panel van, front-on
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(vx, vb, W2 * .62, 2.2, 0, 0, 7); c.fill();
    for (const wx of [L + 1.6, Rr - 7.6]) { c.fillStyle = '#121214'; c.beginPath(); c.roundRect ? c.roundRect(wx, vb - 9, 6, 9, 1.6) : c.rect(wx, vb - 9, 6, 9); c.fill(); }
    // body: tall box, rounded roof corners, a little narrower at the top
    c.fillStyle = lg(c, L, 0, Rr, 0, [[0, '#c8ccd0'], [.18, '#f4f6f8'], [.5, '#ffffff'], [.82, '#eef0f2'], [1, '#b8bcc2']]); c.beginPath(); c.moveTo(L, vb - 8); c.lineTo(L, vb - 30); c.lineTo(L + 1.6, vb - H2 + 6); c.quadraticCurveTo(L + 2, vb - H2, L + 7, vb - H2); c.lineTo(Rr - 7, vb - H2); c.quadraticCurveTo(Rr - 2, vb - H2, Rr - 1.6, vb - H2 + 6); c.lineTo(Rr, vb - 30); c.lineTo(Rr, vb - 8); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = .45; c.stroke();
    // big windscreen with a dark top tint band and a reflection
    c.fillStyle = lg(c, 0, vb - H2 + 8, 0, vb - 31, [[0, '#2a323c'], [.25, '#8aa0b4'], [.7, '#4a5868'], [1, '#2a323c']]); c.beginPath(); c.moveTo(L + 3, vb - 31); c.lineTo(L + 4.4, vb - H2 + 9); c.quadraticCurveTo(vx, vb - H2 + 6.6, Rr - 4.4, vb - H2 + 9); c.lineTo(Rr - 3, vb - 31); c.quadraticCurveTo(vx, vb - 29.6, L + 3, vb - 31); c.fill();
    c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(vx - 12, vb - 30); c.lineTo(vx - 3, vb - H2 + 8); c.lineTo(vx + 3, vb - H2 + 8); c.lineTo(vx - 6, vb - 30); c.fill(); c.restore();
    line(c, '#2a2c30', .6, [[vx - 9, vb - 32], [vx - 1, vb - 36]]); line(c, '#2a2c30', .6, [[vx + 2, vb - 32], [vx + 10, vb - 36]]);   // wipers
    rect(c, '#d84a2a', vx - 9, vb - H2 + 2.6, 18, 3, '#7a1a0a', .2); txt(c, 'FOODBANK', vx, vb - H2 + 4.1, 2.2, '#ffffff', { f: 'Mont, sans-serif', w: 900 });
    // short bonnet, then the grille between swept headlights
    c.fillStyle = lg(c, 0, vb - 30, 0, vb - 22, [[0, '#ffffff'], [1, '#d8dce0']]); c.beginPath(); c.moveTo(L + 1, vb - 29); c.quadraticCurveTo(vx, vb - 31.4, Rr - 1, vb - 29); c.lineTo(Rr - .6, vb - 23); c.lineTo(L + .6, vb - 23); c.fill();
    c.fillStyle = '#1e2126'; c.beginPath(); c.roundRect ? c.roundRect(vx - 9.6, vb - 24, 19.2, 8, 1.4) : c.rect(vx - 9.6, vb - 24, 19.2, 8); c.fill(); for (let k = 0; k < 3; k++) rect(c, '#6a7078', vx - 8.6, vb - 22.6 + k * 2.4, 17.2, .7);
    c.beginPath(); c.arc(vx, vb - 20, 2, 0, 7); c.fillStyle = '#c8ccd2'; c.fill(); c.beginPath(); c.arc(vx, vb - 20, 1.2, 0, 7); c.fillStyle = '#1e2126'; c.fill();
    for (const d of [-1, 1]) { const hx = vx + d * 14.4; c.fillStyle = '#1e2126'; c.beginPath(); c.moveTo(hx - 5 * d, vb - 25); c.lineTo(hx + 4.6 * d, vb - 26.6); c.lineTo(hx + 5.2 * d, vb - 20); c.lineTo(hx - 5 * d, vb - 19.6); c.closePath(); c.fill();
      c.fillStyle = lg(c, hx - 4, 0, hx + 4, 0, [[0, '#f4f8fc'], [1, '#a8b8c8']]); c.beginPath(); c.moveTo(hx - 4.2 * d, vb - 24.4); c.lineTo(hx + 4 * d, vb - 25.8); c.lineTo(hx + 4.4 * d, vb - 20.6); c.lineTo(hx - 4.2 * d, vb - 20.4); c.closePath(); c.fill(); rect(c, '#f2a33a', hx + (d > 0 ? 1.6 : -3.6), vb - 22, 2, 1.2);
      rect(c, '#1e2126', vx + d * (W2 / 2 + 2.6) - 1.8, vb - 36, 3.6, 5.6, '#000', .2); line(c, '#1e2126', .7, [[vx + d * W2 / 2, vb - 32], [vx + d * (W2 / 2 + 2), vb - 33]]); }
    // bumper with fog lights and the white front number plate
    c.fillStyle = lg(c, 0, vb - 16, 0, vb - 7, [[0, '#4a4e56'], [1, '#26292e']]); c.beginPath(); c.roundRect ? c.roundRect(L - .6, vb - 16, W2 + 1.2, 9, 2) : c.rect(L - .6, vb - 16, W2 + 1.2, 9); c.fill();
    for (const d of [-1, 1]) { c.beginPath(); c.arc(vx + d * 15, vb - 11.4, 1.3, 0, 7); c.fillStyle = '#e8eef4'; c.fill(); }
    rect(c, '#f8f8f6', vx - 7, vb - 13.6, 14, 4, '#1b1a24', .3); txt(c, 'LT24 FBK', vx, vb - 11.5, 2.6, '#141416', { f: 'Mont, sans-serif', w: 900 }); }
  rect(c, '#ffffff', x + 14, G - 106, 132, 34, '#8a8880', .4);
  { const im = HDIMG.foodbank; if (im) { const h2 = 30, w2 = h2 * im.width / im.height; c.drawImage(im, x + 80 - w2 / 2, G - 104, w2, h2); }   // the real Luton Foodbank logo (owner's file)
    else { txt(c, 'luton', x + 46, G - 98.6, 8, '#d32f2f', { f: 'Mont, sans-serif', w: 600 }); txt(c, 'foodbank', x + 70, G - 85, 14, '#5a5a5e', { f: 'Mont, sans-serif', w: 600 }); } }
  c.restore();
};

// Inspire Luton Sports Village: tall red-brick sports hall with the white ring logo (figure + inspire / Luton Sports Village), lower
// middle wing with deep-set windows, glass hall front behind brick piers on the right, white copings, green verge, young trees
HD.inspire = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const B = '#a8503a';
  brick(c, x + 120, G - 104, 110, 104, B); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 120, G - 104, 110, 104); rect(c, '#ebebe9', x + 118, G - 108, 114, 4, LINE, .35);
  for (const wx of [x + 130, x + 170, x + 206]) for (const wy of [G - 90, G - 44]) { rect(c, '#26303d', wx, wy, 18, 30); c.fillStyle = lg(c, 0, wy, 0, wy + 30, [[0, '#9ab6cc'], [1, '#3e5468']]); c.fillRect(wx + 2, wy + 2, 14, 26); glare(c, wx + 2, wy + 2, 14, 26); }
  rect(c, '#ebebe9', x + 226, G - 146, 218, 6, LINE, .35);
  curtain(c, x + 232, G - 140, 204, 140, 10, 4); rect(c, '#26303d', x + 232, G - 70, 204, 2.4);
  for (const px of [x + 230, x + 278, x + 326, x + 374, x + 420]) { brick(c, px, G - 140, 14, 140, B); c.strokeStyle = LINE; c.strokeRect(px, G - 140, 14, 140); }
  brick(c, x + 230, G - 140, 204, 12, B); c.strokeRect(x + 230, G - 140, 204, 12);
  rect(c, '#26303d', x + 296, G - 40, 26, 40); for (const dx of [x + 298, x + 310]) { c.fillStyle = lg(c, 0, G - 38, 0, G, [[0, '#d4e4f0'], [1, '#7a9ab4']]); c.fillRect(dx, G - 38, 10, 38); }
  brick(c, x, G - 160, 156, 160, B); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 160, 156, 160); rect(c, '#ebebe9', x - 2, G - 164, 160, 4, LINE, .35);
  c.strokeStyle = '#f6f4ee'; c.lineWidth = 1.3; c.beginPath(); c.ellipse(x + 78, G - 108, 66, 28, 0, 0, 7); c.stroke();
  { const fx = x + 30, fy = G - 120; c.fillStyle = '#f6f4ee'; c.beginPath(); c.arc(fx, fy - 6, 3, 0, 7); c.fill(); c.lineCap = 'round'; line(c, '#f6f4ee', 2.4, [[fx - 1, fy - 1], [fx - 5, fy + 10]]); line(c, '#f6f4ee', 1.8, [[fx - 1, fy], [fx + 8, fy - 6]]); line(c, '#f6f4ee', 1.8, [[fx - 1, fy], [fx - 9, fy + 2]]); line(c, '#f6f4ee', 1.8, [[fx - 5, fy + 10], [fx - 2, fy + 18]]); line(c, '#f6f4ee', 1.8, [[fx - 5, fy + 10], [fx - 11, fy + 15]]); }
  txt(c, 'inspire', x + 88, G - 115, 17, '#f6f4ee', { f: 'Mont, sans-serif', w: 500 }); txt(c, 'Luton Sports Village', x + 88, G - 100, 6.4, '#f6f4ee', { f: 'Mont, sans-serif', w: 500 });
  rect(c, '#f4f2ec', x + 8, G - 52, 8, 6, '#8a8880', .3);
  for (const lx of [x + 170, x + 260]) { c.fillStyle = lg(c, lx, 0, lx + 2.4, 0, [[0, '#8a9098'], [.5, '#d0d4d8'], [1, '#7a8088']]); c.fillRect(lx, G - 120, 2.4, 120); rect(c, '#9aa0a8', lx, G - 120, 12, 1.6); rect(c, '#e8ecef', lx + 9, G - 119, 4, 1.6); c.fillStyle = lg(c, lx + 4, 0, lx + 14, 0, [[0, '#2a62c4'], [1, '#1f4fa8']]); c.fillRect(lx + 4, G - 104, 10, 30); c.beginPath(); c.arc(lx + 9, G - 96, 2.6, 0, 7); c.fillStyle = '#9ad8f4'; c.fill(); line(c, '#ffffff', .5, [[lx + 6, G - 84], [lx + 12, G - 84]]); }
  c.fillStyle = lg(c, 0, G - 5, 0, G, [[0, '#7fcf5a'], [1, '#5aa83a']]); c.fillRect(x, G - 4, 230, 4); for (const tx of [x + 150, x + 196]) { rect(c, '#5a3d2a', tx, G - 24, 1.6, 24); tree(c, tx + .8, G - 22, .45, { d: '#3a6b2c', m: '#5f8f3c', l: '#8ac060' }); }
  c.restore();
};

// Nadeem Plaza: round corner tower in cream render (shaded as a cylinder), blue-framed glass ground floor with the COFFEE POT
// fascia (lit as one cafe), white first-floor band of windows, cream drum with stone rings, two windows, red NADEEM PLAZA in its own
// font, blue clerestory band, white overhanging cap; red brick paving
HD.nadeem = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const cx = x + 75, W = 104, l = cx - W / 2;
  const cylG = (y, h, base) => lg(c, l, 0, l + W, 0, [[0, shade(base, 1.04)], [.3, shade(base, 1.1)], [.6, shade(base, .98)], [1, shade(base, .82)]]);
  const cyl = (y, h, base) => { c.fillStyle = cylG(y, h, base); c.fillRect(l, y, W, h); line(c, LINE, .45, [[l, y], [l, y + h]]); line(c, LINE, .45, [[l + W, y], [l + W, y + h]]); };
  const band = (y, h, n, pane, frame) => { c.fillStyle = cylG(y, h, frame); c.fillRect(l, y, W, h); for (let i = 0; i < n; i++) { const a0 = Math.acos(1 - 2 * i / n), a1 = Math.acos(1 - 2 * (i + 1) / n); const px0 = l + W * (1 - Math.cos(a0)) / 2, px1 = l + W * (1 - Math.cos(a1)) / 2; c.fillStyle = lg(c, 0, y, 0, y + h, [[0, shade(pane, 1.25)], [1, shade(pane, .7)]]); c.fillRect(px0 + 1, y + 2, px1 - px0 - 2, h - 4); } glare(c, l, y, W, h); };
  band(G - 34, 34, 7, '#5d8fbf', '#1f5fa8'); rect(c, '#2a3a52', cx - 9, G - 30, 18, 30); c.fillStyle = lg(c, 0, G - 27, 0, G - 13, [[0, '#d4e4f0'], [1, '#7a9ab4']]); c.fillRect(cx - 6, G - 27, 12, 14); rect(c, '#f4f2ec', l + 6, G - 26, 12, 18, '#8a8880', .3);
  cyl(G - 48, 14, '#e9e2cf'); rect(c, '#2b211c', cx - 34, G - 48, 68, 12, '#000', .3); txt(c, 'COFFEE POT', cx, G - 42, 7, '#ff6a2a', { f: 'Mont, sans-serif', w: 900, ls: .6 });
  band(G - 84, 36, 7, '#d8dcd8', '#1f5fa8'); for (let i = 0; i < 6; i++) { const px = l + 6 + i * W / 6; rect(c, '#6f7880', px, G - 78, W / 6 - 9, 1.2); rect(c, '#6f7880', px, G - 70, W / 6 - 9, 1.2); }
  cyl(G - 150, 66, '#e8e1ce'); for (const yy of [G - 116, G - 94]) { c.fillStyle = cylG(yy, 2, '#c8c0aa'); c.fillRect(l, yy, W, 2); rect(c, 'rgba(255,255,255,.4)', l, yy + 2, W, .6); }
  sash(c, cx - 32, G - 112, 14, 14, { stone: '#f4f2ec' }); sash(c, cx + 18, G - 112, 14, 14, { stone: '#f4f2ec' });
  c.save(); c.font = '900 15px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; for (const [t, ty] of [['NADEEM', G - 141], ['PLAZA', G - 126]]) { c.fillStyle = '#7a1717'; c.fillText(t, cx + .8, ty + .8); c.fillStyle = '#e0262f'; c.fillText(t, cx, ty); } c.restore();
  rect(c, '#1b1a24', l + 5, G - 172, W - 10, 22); c.fillStyle = '#20304a'; c.fillRect(l + 6, G - 171, W - 12, 21); for (let i = 0; i < 8; i++) { c.fillStyle = lg(c, 0, G - 169, 0, G - 152, [[0, '#8ab4dc'], [1, '#2a5a94']]); c.fillRect(l + 8 + i * (W - 16) / 8, G - 169, (W - 16) / 8 - 1.6, 17); } glare(c, l + 6, G - 171, W - 12, 21);
  c.fillStyle = cylG(G - 182, 11, '#f1ebda'); c.fillRect(l - 4, G - 182, W + 8, 11); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(l - 4, G - 182, W + 8, 11); rect(c, 'rgba(0,0,0,.2)', l + 5, G - 171, W - 10, 1.4);
  rect(c, '#c25a3c', x - 6, G - 3, 162, 3); for (let i = 0; i < 40; i++) rect(c, '#a84a30', x - 4 + i * 4, G - 3, .4, 3);
  c.restore();
};

// Kenilworth Road, Oak Stand: the terrace the entrance is cut into (slate roof, chimneys, six first-floor sashes, white door
// cases either side), blue OAK STAND sign with BLOCKS F·G GATE 6 / GATE 7 BLOCKS D·E (never lit), white entrance block, navy
// gates with orange frames
HD.oak = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  for (const cx of [x + 40, x + 156]) stack(c, cx, G - 160, 16, 26, '#a8503a', 2);
  slate(c, [[x - 4, G - 112], [x + 214, G - 112], [x + 192, G - 146], [x + 18, G - 146]], '#4b4b50');
  brick(c, x, G - 112, 210, 112, '#a8503a'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 112, 210, 112);
  for (let i = 0; i < 6; i++) { rect(c, '#ebe3d2', x + 10 + i * 34, G - 104, 22, 3, '#8a8270', .25); sash(c, x + 12 + i * 34, G - 100, 18, 24, { stone: '#f4f2ec' }); rect(c, '#ebe3d2', x + 10 + i * 34, G - 75, 22, 2); }
  c.fillStyle = lg(c, 0, G - 66, 0, G - 46, [[0, '#2a50c0'], [1, '#162e8a']]); c.fillRect(x + 32, G - 66, 146, 20); c.strokeStyle = '#0a1a50'; c.strokeRect(x + 32, G - 66, 146, 20);
  txt(c, 'OAK STAND', x + 105, G - 56, 10, '#ffffff', { f: 'Mont, sans-serif', w: 900, ls: .8 });
  for (const [bx, blk, gate] of [[x + 50, 'F·G', '6'], [x + 160, 'D·E', '7']]) { txt(c, 'BLOCKS', bx - 6, G - 61.4, 2.6, '#fff', { f: 'Mont, sans-serif' }); txt(c, blk, bx - 6, G - 55.4, 6, '#fff', { f: 'Mont, sans-serif', w: 900 }); txt(c, 'GATE', bx + 6, G - 61.4, 2.6, '#fff', { f: 'Mont, sans-serif' }); poly(c, '#ffffff', [[bx + 2.6, G - 58.6], [bx + 9.4, G - 58.6], [bx + 6, G - 51.4]]); txt(c, gate, bx + 6, G - 56.6, 4, '#1e3fa3', { f: 'Mont, sans-serif', w: 900 }); }
  rect(c, '#efeee9', x + 36, G - 46, 138, 46, LINE, .4);
  const gate2 = (gx, gw, gh) => { rect(c, '#e8641c', gx - 2, G - gh, gw + 4, gh); c.fillStyle = lg(c, 0, G - gh, 0, G, [[0, '#2a3a6a'], [1, '#1a2448']]); c.fillRect(gx, G - gh + 2, gw, gh - 2); for (let k = 1; k < gw / 4; k++) rect(c, 'rgba(0,0,0,.25)', gx + k * 4, G - gh + 2, .4, gh - 2); };
  gate2(x + 76, 56, 40); gate2(x + 48, 14, 36); gate2(x + 146, 16, 36);
  for (const dx of [x + 10, x + 186]) { rect(c, '#f6f4ee', dx, G - 38, 14, 38, '#8a8880', .35); rect(c, '#e2ded4', dx + 2, G - 34, 10, 14); rect(c, '#e2ded4', dx + 2, G - 18, 10, 14); c.beginPath(); c.arc(dx + 7, G - 31, 2.4, 0, 7); c.fillStyle = '#a8c0d2'; c.fill(); rect(c, '#c9a64a', dx + 10, G - 18, 1.4, 1); }
  brick(c, x + 2, G - 12, 26, 12, '#a8503a'); brick(c, x + 178, G - 14, 8, 14, '#a8503a');
  c.restore();
};

// Cycle King: three brick blocks over the shops (tall left, low middle, tall right) with stepped parapets and white windows; yellow
// fascias in red frames (CYCLE KING with red bursts, CYCLE KING with a bike + chequer strip, 7 DAYS A WEEK), red pilasters, windows
// packed with bikes, glass doors
HD.cycleking = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const B = '#9a4a34', Y = '#f8d420', RD = '#d8262f';
  for (const [bx, bw, top] of [[x, 130, 160], [x + 130, 104, 124], [x + 234, 110, 150]]) { brick(c, bx, G - top, bw, top - 44, B); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(bx, G - top, bw, top - 44); rect(c, '#c4bcae', bx - 1, G - top - 1.6, bw + 2, 1.6); }
  for (const [px, pw, top] of [[x + 6, 24, 160], [x + 52, 26, 160], [x + 100, 24, 160], [x + 240, 26, 150], [x + 304, 34, 150]]) { brick(c, px, G - top - 8, pw, 8, B); c.strokeStyle = LINE; c.strokeRect(px, G - top - 8, pw, 8); rect(c, '#c4bcae', px - 1, G - top - 9.6, pw + 2, 1.6); }
  for (const [wx, wy, w, h] of [[22, 150, 28, 18], [84, 150, 22, 18], [16, 108, 26, 18], [56, 108, 22, 18], [96, 108, 16, 18], [144, 120, 26, 10], [180, 120, 26, 10], [244, 136, 14, 18], [274, 118, 18, 18], [308, 118, 22, 18], [274, 140, 18, 12]]) sash(c, x + wx, G - wy, w, h, { stone: '#f2f0ea' });
  for (const [sx, sw] of [[x - 2, 132], [x + 130, 104], [x + 234, 112]]) { rect(c, RD, sx, G - 68, sw, 22, '#6a0e0e', .4); c.fillStyle = lg(c, 0, G - 66, 0, G - 48, [[0, '#ffe45a'], [1, '#eec010']]); c.fillRect(sx + 2, G - 66, sw - 4, 18); }
  const burst = (bx, by) => { c.fillStyle = RD; c.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 2.6 : 5.6; c.lineTo(bx + Math.cos(a) * r, by + Math.sin(a) * r * .7); } c.fill(); };
  const bike = (bx, by, col, s2 = 1) => { c.strokeStyle = col; c.lineWidth = .7 * s2; for (const wx of [bx, bx + 9 * s2]) { c.beginPath(); c.arc(wx, by, 3 * s2, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 3 * s2, by - 4 * s2); c.lineTo(bx + 7.6 * s2, by - 4 * s2); c.lineTo(bx + 9 * s2, by); c.moveTo(bx + 3 * s2, by - 4 * s2); c.lineTo(bx + 4.6 * s2, by); c.lineTo(bx + 7.6 * s2, by - 4 * s2); c.moveTo(bx + 2.4 * s2, by - 5 * s2); c.lineTo(bx + 4 * s2, by - 5 * s2); c.moveTo(bx + 7.6 * s2, by - 4 * s2); c.lineTo(bx + 7.2 * s2, by - 5.6 * s2); c.stroke(); };
  burst(x + 10, G - 57); burst(x + 118, G - 57); txt(c, 'CYCLE KING', x + 64, G - 56.6, 10.6, RD, { f: 'Mont, sans-serif', w: 900 });
  rect(c, RD, x + 132, G - 66, 100, 3.6); for (let i = 0; i < 25; i++) rect(c, '#ffffff', x + 133 + i * 4, G - 65.2, 2, 1.8);
  txt(c, 'CYCLE KING', x + 172, G - 55, 8, RD, { f: 'Mont, sans-serif', w: 900 }); bike(x + 208, G - 52.4, '#1b1a24', 1.1);
  txt(c, '7 DAYS A WEEK', x + 290, G - 57, 8, RD, { f: 'Mont, sans-serif', w: 900 });
  rect(c, '#ecebe5', x - 2, G - 46, 348, 46);
  for (const [wx, ww] of [[x + 4, 56], [x + 68, 56], [x + 140, 40], [x + 240, 46], [x + 292, 46]]) { c.fillStyle = lg(c, 0, G - 42, 0, G - 4, [[0, '#f0f2ee'], [1, '#c8ccd0']]); c.fillRect(wx, G - 42, ww, 38); rect(c, '#3a4048', wx, G - 42, ww, 38, null);
    c.fillStyle = lg(c, 0, G - 42, 0, G - 4, [[0, '#e8ecee'], [1, '#aab2ba']]); c.fillRect(wx + 1.4, G - 40.6, ww - 2.8, 35.2);
    const cols = ['#e0302a', '#2a6fd8', '#f2c43a', '#3fae5a', '#e8641c', '#b23ad8', '#2a2a2e'];
    for (let row = 0; row < 3; row++) for (let i = 0; i * 9 < ww - 12; i++) bike(wx + 4 + i * 9 + (row % 2) * 4, G - 32 + row * 10, cols[(i * 3 + row * 2 + Math.round(wx)) % cols.length], .85);
    glare(c, wx + 1.4, G - 40.6, ww - 2.8, 35.2); }
  for (const px of [x - 2, x + 62, x + 128, x + 232, x + 286, x + 342]) { c.fillStyle = lg(c, px, 0, px + 4, 0, [[0, '#a81a20'], [.5, '#e8343a'], [1, '#a81a20']]); c.fillRect(px, G - 46, 4, 46); }
  rect(c, '#2a2f38', x + 184, G - 42, 40, 42); for (const dx of [x + 187, x + 206]) { c.fillStyle = lg(c, 0, G - 39, 0, G - 5, [[0, '#d4e4f0'], [1, '#7a9ab4']]); c.fillRect(dx, G - 39, 15, 34); glare(c, dx, G - 39, 15, 34); }
  c.restore();
};

// Lewsey Sports Park: brown brick block with LEWSEY / SPORTS PARK / active, louvres, white clad hall with a window band and the
// ENTRANCE panel (crisp, inside a taller white panel), glass entrance; small clad block on the left with a red-edged door; steps,
// yellow handrails, blue disabled sign, yellow bay lines
HD.lewsey = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const CLAD = (bx, by, w, h) => { c.fillStyle = lg(c, 0, by, 0, by + h, [[0, '#f2ecdc'], [1, '#e2dac6']]); c.fillRect(bx, by, w, h); for (let yy = by + 2.4; yy < by + h; yy += 2.4) rect(c, 'rgba(120,100,60,.18)', bx, yy, w, .4); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(bx, by, w, h); };
  CLAD(x + 120, G - 140, 160, 140); CLAD(x + 210, G - 156, 70, 18); rect(c, '#4a4d54', x + 120, G - 122, 160, 1.6); rect(c, '#4a4d54', x + 120, G - 92, 160, 1.6);
  rect(c, '#efeee9', x + 124, G - 116, 152, 20); for (let i = 0; i < 6; i++) { c.fillStyle = lg(c, 0, G - 113, 0, G - 99, [[0, '#d4e4ee'], [1, '#7a9ab0']]); c.fillRect(x + 140 + i * 22, G - 113, 18, 14); } glare(c, x + 140, G - 113, 128, 14); rect(c, '#3a3d44', x + 126, G - 112, 10, 8);
  CLAD(x + 26, G - 150, 98, 14);
  brick(c, x + 20, G - 136, 100, 136, '#a5643f'); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x + 20, G - 136, 100, 136); rect(c, '#3a3d44', x + 18, G - 138, 104, 2.6);
  ext(c, 'LEWSEY', x + 70, G - 118, 15, '#f6f4ee', '#5a2e1a', 1.6); txt(c, 'SPORTS PARK', x + 70, G - 104, 7, '#f6f4ee', { f: 'Mont, sans-serif', w: 900, sh: '#5a2e1a' });
  rect(c, '#f6f4ee', x + 40, G - 100, 60, 13); c.save(); c.font = '700 8px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e8641c'; c.fillText('act ve', x + 70, G - 93.4); c.restore();
  { const ix = x + 72.6, iy = G - 94; c.strokeStyle = '#3aa848'; c.lineWidth = .8; c.beginPath(); c.arc(ix, iy, 2.2, Math.PI * .1, Math.PI * 1.6); c.stroke(); c.beginPath(); c.arc(ix + 1.6, iy - 2.6, .8, 0, 7); c.fillStyle = '#3aa848'; c.fill(); }
  for (const vx of [x + 40, x + 82]) { rect(c, '#ebebe7', vx, G - 84, 14, 10, '#8a8880', .3); for (let i = 0; i < 4; i++) rect(c, '#9a9a9a', vx + 1, G - 82.6 + i * 2.2, 12, .9); }
  for (let i = 0; i < 6; i++) rect(c, '#b9744e', x + 30 + i * 16, G - 20, 5, 4);
  rect(c, '#e9ecef', x + 120, G - 64, 160, 15); rect(c, '#ffffff', x + 182, G - 63, 82, 13, '#c8ccd0', .3); txt(c, 'ENTRANCE', x + 223, G - 56.4, 7, '#22408a', { f: 'Mont, sans-serif', w: 800, ls: .8 });
  rect(c, '#f6f6f4', x + 124, G - 50, 152, 50); rect(c, '#ffffff', x + 126, G - 46, 18, 46, '#c8ccd0', .3);
  for (let i = 0; i < 6; i++) { c.fillStyle = lg(c, 0, G - 46, 0, G - 2, i < 2 ? [[0, '#a8b4c0'], [1, '#6a7682']] : [[0, '#5a6a7c'], [1, '#2a3240']]); c.fillRect(x + 148 + i * 21, G - 46, 18, 44); } glare(c, x + 148, G - 46, 124, 44); rect(c, '#e9ecef', x + 148, G - 40, 126, .8); rect(c, '#2f6fb5', x + 158, G - 32, 4, 4);
  CLAD(x, G - 70, 22, 70); rect(c, '#ebebe7', x - 2, G - 54, 24, 4); rect(c, '#3a4250', x + 4, G - 46, 12, 46); rect(c, '#c8202a', x + 16, G - 46, 1.6, 46);
  for (let i = 0; i < 4; i++) rect(c, '#6a4a34', x - 14, G - 4 - i * 4, 36, 2); rect(c, '#f2c14e', x + 8, G - 22, 30, 1.6); for (const px of [x + 8, x + 22, x + 36]) rect(c, '#f2c14e', px, G - 22, 1.6, 22);
  rect(c, '#2f6fb5', x + 24, G - 42, 10, 12, '#0e2a6a', .3); c.beginPath(); c.arc(x + 29, G - 38.6, .9, 0, 7); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.arc(x + 29.6, G - 34, 2.2, .3, 2.6); c.strokeStyle = '#fff'; c.lineWidth = .6; c.stroke();
  rect(c, '#f2c14e', x + 40, G - 2, 80, 1.6); for (let i = 0; i < 6; i++) rect(c, '#f2c14e', x + 44 + i * 13, G - 2, .8, 2);
  c.restore();
};

// a parked car seen from behind (Leagrave Road drive): saloon or hot hatch
const carBack = (c, bx, G, col, hatch2) => { const D = shade(col, .72), L2 = shade(col, 1.25);
  c.fillStyle = lg(c, 0, G - 28, 0, G - 4, [[0, L2], [.4, col], [1, D]]); c.beginPath();
  if (hatch2) { c.moveTo(bx, G - 4); c.lineTo(bx, G - 14); c.quadraticCurveTo(bx, G - 18, bx + 2.6, G - 18.6); c.lineTo(bx + 4.6, G - 26); c.lineTo(bx + 26.4, G - 26); c.lineTo(bx + 28.4, G - 18.6); c.quadraticCurveTo(bx + 31, G - 18, bx + 31, G - 14); c.lineTo(bx + 31, G - 4); }
  else { c.moveTo(bx, G - 4); c.lineTo(bx, G - 15); c.quadraticCurveTo(bx + 1, G - 19, bx + 4, G - 19); c.lineTo(bx + 7, G - 19); c.lineTo(bx + 9.6, G - 27.6); c.lineTo(bx + 24.4, G - 27.6); c.lineTo(bx + 27, G - 19); c.lineTo(bx + 30, G - 19); c.quadraticCurveTo(bx + 33, G - 19, bx + 34, G - 15); c.lineTo(bx + 34, G - 4); }
  c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = .4; c.stroke();
  const W2 = hatch2 ? 31 : 34; c.fillStyle = lg(c, 0, G - 26, 0, G - 19, [[0, '#5a6878'], [1, '#1a2028']]); c.beginPath(); if (hatch2) { c.moveTo(bx + 5.6, G - 18.6); c.lineTo(bx + 7, G - 24.6); c.lineTo(bx + 24, G - 24.6); c.lineTo(bx + 25.4, G - 18.6); } else { c.moveTo(bx + 8.6, G - 19.4); c.lineTo(bx + 10.6, G - 26.4); c.lineTo(bx + 23.4, G - 26.4); c.lineTo(bx + 25.4, G - 19.4); } c.fill();
  rect(c, 'rgba(255,255,255,.25)', bx + W2 * .32, G - 25.6, W2 * .16, .6);
  if (hatch2) { rect(c, '#141416', bx + 2.8, G - 28, 25.4, 2); rect(c, '#e83030', bx + 10.5, G - 27.6, 10, .5); }
  for (const lx of [bx + 1, bx + W2 - 8]) { c.fillStyle = lg(c, lx, 0, lx + 7, 0, [[0, '#7a0c10'], [.5, '#ff3a3a'], [1, '#7a0c10']]); c.fillRect(lx, G - 15.6, 7, 2.8); }
  rect(c, '#f2c94c', bx + W2 / 2 - 5, G - 11.6, 10, 3.6, '#7a6010', .2); rect(c, '#1b1a24', bx + W2 / 2 - 3.4, G - 10.4, 6.8, .5);
  rect(c, hatch2 ? '#141416' : D, bx + 1, G - 7, W2 - 2, 2.4); rect(c, 'rgba(255,255,255,.18)', bx + 2, G - 17.6, W2 - 4, .5);
  for (const tx of [bx + 2, bx + W2 - 8]) { c.fillStyle = '#141416'; c.beginPath(); c.roundRect ? c.roundRect(tx, G - 4.6, 6, 4.6, 1) : c.rect(tx, G - 4.6, 6, 4.6); c.fill(); } };

// Leagrave Road house: light grey rendered semi with a brown tiled roof, three skylights, chimney with pots, white uPVC windows (the
// left ones with top openers, lower one with blinds), satellite dish, grey composite door with diamond glass, red brick piers,
// black gate with the faded back building over it, block-paved drive full: black saloon, blue saloon, red A45-style hatch
HD.leagrave = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const GR = '#d8dada', GD = '#b4b8b8', RW = '#b0503c';
  slate(c, [[x + 4, G - 112], [x + 108, G - 112], [x + 102, G - 150], [x + 10, G - 150]], '#6e6354');
  for (const sx of [x + 18, x + 49, x + 80]) { rect(c, '#2e343c', sx, G - 140, 14, 8, '#14181c', .3); c.fillStyle = lg(c, 0, G - 139, 0, G - 133, [[0, '#b8cad8'], [1, '#5a7088']]); c.fillRect(sx + 1, G - 139, 12, 6); }
  stack(c, x + 11, G - 164, 14, 16, '#9a5440', 2);
  c.fillStyle = lg(c, x + 8, 0, x + 104, 0, [[0, '#e2e4e4'], [1, '#cdd0d0']]); c.fillRect(x + 8, G - 112, 96, 112); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 8, G - 112, 96, 112); rect(c, 'rgba(0,0,0,.12)', x + 60, G - 112, .5, 112);
  c.fillStyle = lg(c, x + 98, 0, x + 101, 0, [[0, '#d0d2d2'], [.5, '#ffffff'], [1, '#c4c6c6']]); c.fillRect(x + 98, G - 110, 3, 110); rect(c, 'rgba(0,0,0,.22)', x + 8, G - 112, 96, 2);
  const BAYWIN = (wx, wy, h, blinds) => { rect(c, '#f6f6f4', wx, wy, 42, h, '#9a9a96', .35); const top = wy + 3, ph = h - 6;
    for (const [px, pw] of [[3, 4], [9, 11], [22, 11], [35, 4]]) { c.fillStyle = lg(c, 0, top, 0, top + ph, [[0, '#dfe8ee'], [.5, '#8aa0b2'], [1, '#56687a']]); c.fillRect(wx + px, top, pw, ph); rect(c, '#f6f6f4', wx + px, top + 5, pw, 1.2);
      if (blinds) for (let i = 0; i < ph - 8; i += 1.6) rect(c, 'rgba(240,240,236,.55)', wx + px, top + 7 + i, pw, .7); }
    glare(c, wx + 3, top, 36, ph); };
  BAYWIN(x + 14, G - 104, 30, false); rect(c, GD, x + 12, G - 74, 46, 2.6);
  rect(c, '#f6f6f4', x + 66, G - 104, 30, 30, '#9a9a96', .35); for (const yy of [G - 101, G - 88]) { c.fillStyle = lg(c, 0, yy, 0, yy + 11, [[0, '#dfe8ee'], [1, '#6a8296']]); c.fillRect(x + 69, yy, 24, 11); } glare(c, x + 69, G - 101, 24, 24); rect(c, GD, x + 64, G - 74, 34, 2.6);
  { const dx = x + 99, dy = G - 66; rect(c, '#5a5e66', dx + 3, dy - .7, 4, 1.4); c.fillStyle = lg(c, dx - 4, dy - 6, dx + 4, dy + 6, [[0, '#c4c8ce'], [1, '#7a8088']]); c.beginPath(); c.ellipse(dx, dy, 4.4, 5.8, -.35, 0, 7); c.fill(); c.strokeStyle = '#3a3d44'; c.lineWidth = .4; c.stroke(); line(c, '#3a3d44', .5, [[dx, dy], [dx - 3.6, dy - 1]]); }
  BAYWIN(x + 14, G - 62, 32, true); rect(c, GD, x + 12, G - 30, 46, 2.6);
  rect(c, '#6e7276', x + 66, G - 54, 22, 54, '#3a3d40', .35); c.fillStyle = lg(c, x + 70, 0, x + 84, 0, [[0, '#4a5262'], [1, '#323a46']]); c.fillRect(x + 70, G - 49, 14, 49);
  for (const dy of [G - 42, G - 33, G - 24]) poly(c, '#b4c8d8', [[x + 77, dy - 2.6], [x + 79.6, dy], [x + 77, dy + 2.6], [x + 74.4, dy]]); rect(c, '#c8ccd2', x + 81.6, G - 28, .8, 6);
  brick(c, x, G - 16, 8, 16, RW); rect(c, '#2a2a2e', x, G - 18, 8, 2); brick(c, x + 140, G - 16, 8, 16, RW); rect(c, '#2a2a2e', x + 140, G - 18, 8, 2);
  c.save(); c.globalAlpha = .75; poly(c, '#bc6e5c', [[x + 104, G - 51], [x + 131, G - 51], [x + 129.5, G - 55.5], [x + 104, G - 55.5]]); rect(c, '#cbcdce', x + 104, G - 51, 27, 5); c.restore();
  rect(c, '#1e2024', x + 104, G - 46, 36, 46); for (let i = 0; i < 17; i++) rect(c, '#34383e', x + 105 + i * 2.1, G - 44, 1, 44); rect(c, '#3a3e44', x + 104, G - 46, 36, 1.6); rect(c, '#4a4e56', x + 104, G - 24, 36, .8);
  rect(c, '#b06a54', x + 8, G - 3, 132, 3); for (let i = 0; i < 66; i++) rect(c, '#9a5a46', x + 8 + i * 2, G - 3, .4, 3); rect(c, '#9a5a46', x + 8, G - 1.6, 132, .3);
  carBack(c, x + 16, G, '#1c1d22'); carBack(c, x + 58, G, '#2e3d6e'); carBack(c, x + 100.5, G, '#d8141c', true);
  c.restore();
};

// Marsh Farm Estate: Lea Bank, Five Springs and Penhill, three 15-storey blocks in blue/white patchwork cladding (the middle one a
// little shorter, the right one thinner), recessed balcony column with white rails, stairwell strip, window grid, aerials, trees
HD.marshfarm = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  const PAL = ['#6aa2d8', '#4b88c8', '#3a76bf', '#2c66b4', '#22529e', '#1b4288', '#163672', '#b8d0e6'];
  const hash = (a, b, cc) => { const v = Math.sin(a * 91.7 + b * 47.3 + cc * 13.1) * 43758.5; return v - Math.floor(v); };
  const tower = (tx, w, h, sd, bal, strip) => { const top = G - h, FL = h / 15, cw = 3, cols = Math.ceil(w / cw);
    for (let f = 0; f < 30; f++) for (let i = 0; i < cols; i++) { const n = hash(sd, Math.floor(i / 2), Math.floor(f / 3)), m = hash(sd + 9, i, f); const k = n > .92 ? 7 : Math.min(6, Math.floor(n * 5 + (m > .8 ? 1 : 0))); c.fillStyle = PAL[k]; c.fillRect(tx + i * cw, top + f * FL / 2, Math.min(cw, w - i * cw), FL / 2 + .1); }
    const [bx, bw] = bal; c.fillStyle = lg(c, tx + bx, 0, tx + bx + bw, 0, [[0, '#0e1c3a'], [1, '#1a3060']]); c.fillRect(tx + bx, top + 2, bw, h - 2); for (let f = 0; f < 15; f++) { rect(c, '#eef2f6', tx + bx, top + f * FL + FL - 3, bw, .8); for (let k = 0; k < bw; k += 2) rect(c, 'rgba(238,242,246,.6)', tx + bx + k, top + f * FL + FL - 6, .3, 3); }
    for (let f = 0; f < 15; f++) for (let i = 0; i < Math.floor(w / 6); i++) { const wx = tx + i * 6 + .5; if (wx + 5 > tx + bx - 1 && wx < tx + bx + bw + 1) continue; if (wx + 5 > tx + strip[0] - 1 && wx < tx + strip[0] + strip[1] + 1) continue;
      const wy = top + f * FL + 2; rect(c, '#f2f4f6', wx, wy, 4.4, FL - 4.4); c.fillStyle = lg(c, 0, wy, 0, wy + FL - 5, [[0, '#a8c0d4'], [1, '#4a6a86']]); c.fillRect(wx + .6, wy + .6, 3.2, FL - 5.6); }
    const [sx, sw] = strip; rect(c, '#e9edf2', tx + sx, top + 3, sw, h - 3); for (let f = 0; f < 15; f++) { c.fillStyle = lg(c, 0, 0, 0, 1, [[0, '#9ab4ca'], [1, '#7d97ad']]); c.fillStyle = '#86a0b6'; c.fillRect(tx + sx + 1, top + f * FL + 2, sw - 2, FL - 3); }
    rect(c, '#c8daea', tx, top, w, 2); c.strokeStyle = '#1b1a24'; c.lineWidth = .5; c.strokeRect(tx, top, w, h); rect(c, 'rgba(10,20,50,.18)', tx + w - 5, top, 5, h);
    for (const ax of [tx + w * .2, tx + w * .7]) { rect(c, '#7a8088', ax, top - 9, .8, 9); rect(c, '#9aa0a8', ax - 2.4, top - 6, 5.6, .6); rect(c, '#9aa0a8', ax - 1.6, top - 3.6, 4, .6); } };
  tower(x + 4, 104, 300, 1, [8, 16], [58, 12]); tower(x + 140, 104, 282, 2, [8, 16], [58, 12]); tower(x + 276, 88, 300, 3, [6, 14], [50, 11]);
  for (const [tx2, s2] of [[18, 1.5], [124, 1.7], [262, 1.6], [350, 1.8]]) tree(c, x + tx2, G, s2, { d: '#3a6b2c', m: '#4f8a3c', l: '#7ab858' });
  c.restore();
};

// Venue Central (Britannia Estates): side wing with louvred grey top, dark board VENUE · vc · CENTRAL, glass door; main block in
// warm render with pilasters, dark roof band, black VENUE CENTRAL board with the VC ring + BRITANNIA ESTATES, tall dark windows,
// big glazed entrance (warm light inside), wall lamps, planters and topiary
HD.venue = (c, x0, G) => {
  c.save(); c.lineJoin = 'round';
  { const x = x0, B = '#e6dccb'; c.fillStyle = lg(c, x, 0, x + 124, 0, [[0, B], [1, shade(B, .92)]]); c.fillRect(x, G - 66, 124, 66); for (let i = 0; i < 4; i++) rect(c, shade(B, .92), x, G - 50 + i * 12, 124, .5); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 66, 124, 66);
    rect(c, '#4a4d54', x - 2, G - 84, 128, 18, '#22242a', .4); for (let i = 0; i < 9; i++) rect(c, '#6a6e76', x, G - 82 + i * 2, 124, .8); for (let i = 0; i < 9; i++) rect(c, '#33363c', x + i * 15, G - 84, 1.4, 18);
    rect(c, '#2a2c30', x - 1, G - 64, 126, 16, '#000', .3); txt(c, 'V E N U E', x + 30, G - 56, 5.6, '#efe9dd', { f: 'Mont, sans-serif', w: 400 }); txt(c, 'C E N T R A L', x + 90, G - 56, 5.6, '#efe9dd', { f: 'Mont, sans-serif', w: 400 });
    c.beginPath(); c.arc(x + 57, G - 56, 6.4, 0, 7); c.fillStyle = lg(c, x + 51, G - 62, x + 63, G - 50, [[0, '#e8c878'], [1, '#9a7a32']]); c.fill(); txt(c, 'vc', x + 57, G - 56.4, 5, '#2a2c30', { f: 'Georgia, serif', w: 700 });
    rect(c, '#1a1c20', x + 54, G - 44, 44, 44); c.fillStyle = lg(c, 0, G - 42, 0, G, [[0, '#f0f4f6'], [1, '#b8c4cc']]); c.fillRect(x + 56, G - 42, 18, 40); c.fillRect(x + 76, G - 42, 20, 40); rect(c, '#1a1c20', x + 74, G - 42, 2, 40); rect(c, '#3a3d44', x + 80, G - 30, 14, 30); glare(c, x + 56, G - 42, 40, 40);
    rect(c, '#e8c84a', x + 34, G - 30, 5, 5, '#6a5a10', .3); rect(c, '#3a3d44', x + 114, G - 72, 4, 72); rect(c, '#8a8478', x + 12, G - 6, 10, 6); }
  const x = x0 + 120, B = '#dcc4a2';
  c.fillStyle = lg(c, x, 0, x + 220, 0, [[0, shade(B, 1.03)], [1, shade(B, .94)]]); c.fillRect(x, G - 130, 220, 130); for (let i = 0; i < 7; i++) rect(c, shade(B, .92), x, G - 110 + i * 16, 220, .5); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x, G - 130, 220, 130);
  for (const px of [x + 30, x + 62, x + 158, x + 190]) { c.fillStyle = lg(c, px, 0, px + 8, 0, [[0, shade(B, 1.08)], [.7, shade(B, 1.02)], [1, shade(B, .82)]]); c.fillRect(px, G - 112, 8, 112); }
  rect(c, '#2a2624', x - 4, G - 116, 228, 6, '#000', .3);
  c.fillStyle = lg(c, 0, G - 140, 0, G - 116, [[0, '#262626'], [1, '#101010']]); c.fillRect(x + 34, G - 140, 152, 24); c.strokeStyle = '#000'; c.strokeRect(x + 34, G - 140, 152, 24); rect(c, '#e8e3d8', x + 34, G - 140, 152, .6);
  txt(c, 'V E N U E', x + 70, G - 131.6, 6.4, '#efe9dd', { f: 'Mont, sans-serif', w: 400 }); txt(c, 'C E N T R A L', x + 150, G - 131.6, 6.4, '#efe9dd', { f: 'Mont, sans-serif', w: 400 });
  c.beginPath(); c.arc(x + 110, G - 131.6, 6.4, 0, 7); c.strokeStyle = '#c8b898'; c.lineWidth = .5; c.stroke(); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; c.beginPath(); c.arc(x + 110 + Math.cos(a) * 7.6, G - 131.6 + Math.sin(a) * 7.6, .35, 0, 7); c.fillStyle = '#b9ab98'; c.fill(); } txt(c, 'VC', x + 110, G - 131.8, 4.4, '#efe9dd', { f: 'Georgia, serif', w: 700 });
  rect(c, '#3a3632', x + 50, G - 123, 120, 5); txt(c, 'B R I T A N N I A   E S T A T E S', x + 110, G - 120.4, 3, '#e8e0d2', { f: 'Mont, sans-serif', w: 400 });
  const TW = (wx, w, h) => { rect(c, '#14161a', wx, G - 14 - h, w, h); for (let j = 0; j < 4; j++) { c.fillStyle = j === 3 ? '#ebe6d8' : lg(c, 0, G - 12 - h + j * h / 4, 0, G - 14 - h + (j + 1) * h / 4, [[0, '#4a5a6c'], [1, '#1e2630']]); c.fillRect(wx + 2, G - 12 - h + j * (h / 4), w - 4, h / 4 - 2); } glare(c, wx + 2, G - 12 - h, w - 4, h - 4); };
  TW(x + 14, 12, 82); TW(x + 44, 12, 82); TW(x + 172, 12, 82); TW(x + 200, 12, 82);
  rect(c, '#14161a', x + 78, G - 100, 64, 100); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = j < 2 ? lg(c, 0, G - 98 + j * 25, 0, G - 75 + j * 25, [[0, '#4a5a6c'], [1, '#22303e']]) : lg(c, 0, G - 98 + j * 25, 0, G - 75 + j * 25, [[0, '#fbe2a8'], [1, '#e8c47a']]); c.fillRect(x + 80 + i * 16, G - 98 + j * 25, 14, 23); } glare(c, x + 80, G - 98, 62, 98);
  for (const lx of [x + 8, x + 206]) { rect(c, '#2a2a2e', lx, G - 128, 6, 4); const g = c.createRadialGradient(lx + 3, G - 122, 0, lx + 3, G - 122, 7); g.addColorStop(0, 'rgba(255,250,220,.6)'); g.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = g; c.fillRect(lx - 5, G - 129, 16, 16); }
  rect(c, '#d9cdb6', x - 6, G - 2, 232, 2);
  const POT = (px, col, h, leaf) => { c.fillStyle = lg(c, px, 0, px + 8, 0, [[0, shade(col, 1.3)], [1, shade(col, .8)]]); c.fillRect(px, G - 7, 8, 7); rect(c, '#5a3d2a', px + 3.4, G - 7 - h, 1.2, h); c.beginPath(); c.arc(px + 4, G - 9 - h, 5.6, 0, 7); c.fillStyle = leaf; c.fill(); c.beginPath(); c.arc(px + 2.6, G - 10.6 - h, 2.6, 0, 7); c.fillStyle = shade(leaf, 1.25); c.fill(); };
  POT(x + 60, '#2a2a2e', 18, '#a84a3a'); POT(x + 146, '#2a2a2e', 18, '#b2402e'); POT(x + 34, '#f0ede6', 8, '#5f8f3c'); POT(x + 164, '#e8e3d8', 6, '#6faa4e');
  rect(c, '#2a2a2e', x + 180, G - 8, 18, 8); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x + 182 + i * 3.4, G - 9, 1.8, 0, 7); c.fillStyle = i % 2 ? '#f4f2ec' : '#6faa4e'; c.fill(); }
  c.restore();
};

// The Chiltern Hotel: long white four-storey block with rows of windows (some curtains drawn), rooftop plant box, blue band, the big
// blue THE CHILTERN HOTEL board with the C crest, white canopy over the entrance, WELCOME (crisp) over the door, blue awnings,
// teal-glass restaurant on the left, golden clipped hedges
HD.chiltern = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const Wc = '#f3f1ed';
  rect(c, '#e6e3dd', x + 40, G - 134, 60, 10, LINE, .35);
  c.fillStyle = lg(c, 0, G - 124, 0, G - 24, [[0, '#fbfaf8'], [1, '#e8e5df']]); c.fillRect(x, G - 124, 350, 100); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 124, 350, 100); rect(c, '#dcd8d0', x, G - 124, 350, 2);
  for (let r = 0; r < 4; r++) { const yy = G - 118 + r * 24; rect(c, '#e4e0d8', x, yy + 15, 350, 2.4); for (let i = 0; i < 16; i++) { const wx = x + 4 + i * 21.5; rect(c, '#b8bcc2', wx - .6, yy - .6, 18.2, 14.2); const cur = ((i * 7 + r * 3) % 5); c.fillStyle = cur === 0 ? '#d8d0c0' : lg(c, 0, yy, 0, yy + 13, [[0, '#c4d4e0'], [1, '#6a8296']]); c.fillRect(wx, yy, 17, 13); if (cur === 1) { rect(c, '#e8e2d4', wx, yy, 5, 13); rect(c, '#e8e2d4', wx + 12, yy, 5, 13); } rect(c, '#f3f1ed', wx + 8, yy, 1, 13); } }
  glare(c, x, G - 118, 350, 90);
  rect(c, '#1f5fb8', x, G - 26, 350, 2);
  rect(c, '#9aa3ad', x + 4, G - 24, 104, 4); curtain(c, x + 6, G - 20, 100, 20, 6, 1, ['#a8e0e8', '#4fa9b8', '#2a7a88']); rect(c, '#3ac3d0', x + 12, G - 12, 40, 12, '#1a6a74', .3);
  rect(c, '#3a3d44', x + 260, G - 24, 60, 24); for (let i = 0; i < 24; i++) rect(c, '#4a4e56', x + 262 + i * 2.4, G - 22, 1, 20);
  rect(c, '#2a2f3a', x + 110, G - 24, 150, 24); for (let i = 0; i < 6; i++) { c.fillStyle = lg(c, 0, G - 20, 0, G - 6, [[0, '#fbe2a8'], [1, '#e0b868']]); c.fillRect(x + 114 + i * 24, G - 20, 18, 14); }
  for (const ax of [x + 116, x + 216]) { c.fillStyle = lg(c, 0, G - 26, 0, G - 18, [[0, '#2f72cc'], [1, '#1a4a94']]); c.beginPath(); c.moveTo(ax, G - 18); c.lineTo(ax + 4, G - 26); c.lineTo(ax + 30, G - 26); c.lineTo(ax + 34, G - 18); c.fill(); for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(ax + 3.4 + k * 6.8, G - 18, 3.4, 0, Math.PI); c.fill(); } }
  rect(c, '#efeee9', x + 151, G - 26, 64, 26, LINE, .35); txt(c, 'WELCOME', x + 183, G - 21.6, 5, '#4a4d54', { f: 'Mont, sans-serif', w: 700, ls: 1 }); rect(c, '#3a3d44', x + 174, G - 16, 18, 16); rect(c, '#8a1d2a', x + 179, G - 14, 8, 14);
  rect(c, '#ebe9e3', x + 104, G - 44, 158, 6, LINE, .35); rect(c, '#ebe9e3', x + 168, G - 38, 2.6, 12); rect(c, '#ebe9e3', x + 195, G - 38, 2.6, 12);
  c.fillStyle = lg(c, 0, G - 70, 0, G - 42, [[0, '#2f72cc'], [1, '#174a9a']]); c.fillRect(x + 96, G - 70, 174, 28); c.strokeStyle = '#0e2a6a'; c.strokeRect(x + 96, G - 70, 174, 28);
  c.beginPath(); c.arc(x + 183, G - 70, 12, Math.PI, 0); c.fillStyle = '#2f72cc'; c.fill(); c.strokeStyle = '#0e2a6a'; c.stroke(); txt(c, 'C', x + 183, G - 75.6, 8, '#ffffff', { f: 'Georgia, serif', w: 700 });
  txt(c, 'THE', x + 114, G - 56, 6.4, '#ffffff', { f: 'Mont, sans-serif', w: 600, ls: 1 }); txt(c, 'CHILTERN', x + 181, G - 56, 15, '#ffffff', { f: 'Mont, sans-serif', w: 400, ls: 1.6 }); txt(c, 'HOTEL', x + 250, G - 56, 6.4, '#ffffff', { f: 'Mont, sans-serif', w: 600, ls: 1 });
  const HEDGE = (hx, w, h) => { c.fillStyle = '#b0a030'; c.beginPath(); c.roundRect ? c.roundRect(hx, G - h, w, h, 2) : c.rect(hx, G - h, w, h); c.fill(); for (let i = 0; i < w * h / 2; i++) { c.beginPath(); c.arc(hx + (i * 13.7) % w, G - h + .6 + (i * 7.3) % (h - .6), .9, 0, 7); c.fillStyle = ['#a99a28', '#e2cf58', '#c5b13a', '#8a7a1a'][i % 4]; c.fill(); } };
  HEDGE(x - 10, 130, 12); HEDGE(x + 240, 120, 12); rect(c, '#2a2c33', x + 120, G - 6, 6, 6); rect(c, '#2a2c33', x + 234, G - 6, 6, 6);
  c.restore();
};

// University of Bedfordshire: dark brick teaching block with a grid of windows, blue glazed link, tall white block with the red
// three-peak crest + UNIVERSITY OF BEDFORDSHIRE, purple fin, glazed ground floor; lawn, bollards, trees
HD.uob = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  brick(c, x, G - 140, 80, 140, '#3e3f45', { mortar: 'rgba(120,120,130,.3)' }); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 140, 80, 140);
  for (let r = 0; r < 5; r++) for (let i = 0; i < 4; i++) sash(c, x + 6 + i * 18, G - 132 + r * 22, 14, 14, { stone: '#e9e9e6' });
  curtain(c, x + 80, G - 96, 26, 96, 1, 6, ['#8ab0cc', '#3d6584', '#24405a']);
  panels(c, x + 106, G - 176, 94, 120, '#efefed', 7.5); panels(c, x + 150, G - 190, 44, 16, '#efefed', 8);
  c.fillStyle = lg(c, x + 194, 0, x + 198, 0, [[0, '#7a2a6a'], [1, '#b04aa0']]); c.fillRect(x + 194, G - 120, 4, 40);
  for (const [a, h2] of [[140, 12], [148, 16], [158, 12]]) poly(c, '#c8272e', [[x + a, G - 150], [x + a + 4.5, G - 150 - h2], [x + a + 9, G - 150]]);
  txt(c, 'UNIVERSITY OF', x + 153, G - 141, 5.6, '#7a2a2a', { f: 'Mont, sans-serif', w: 700, ls: .6 }); txt(c, 'BEDFORDSHIRE', x + 153, G - 134, 5.6, '#7a2a2a', { f: 'Mont, sans-serif', w: 700, ls: .6 });
  curtain(c, x + 106, G - 56, 94, 56, 6, 3, ['#7a90a6', '#3d4e60', '#26323e']);
  c.fillStyle = lg(c, 0, G - 6, 0, G, [[0, '#6fae4a'], [1, '#4f8a33']]); c.fillRect(x + 80, G - 6, 110, 6); for (let i = 0; i < 9; i++) bollard(c, x + 86 + i * 12, G, '#b8bec6', '#6a6e76');
  tree(c, x + 30, G, .9, { d: '#3a6b2c', m: '#4f8a3c', l: '#7ab858' }); tree(c, x + 96, G, .9, { d: '#3a6b2c', m: '#4f8a3c', l: '#7ab858' });
  c.restore();
};

// ---------- park kit ----------
const lawn = (c, x, G, w, h = 16) => { c.fillStyle = lg(c, 0, G - h, 0, G, [[0, '#6fbb52'], [1, '#4f9a3c']]); c.fillRect(x, G - h, w, h); for (let i = 0; i < w * 1.6; i++) { const gx = x + (i * 37.31) % w, gy = G - h + 1 + (i * 7.7) % (h - 1); line(c, i % 3 ? '#4a9238' : '#86cc64', .5, [[gx, gy + 1.6], [gx + (i % 2 ? .6 : -.6), gy]]); } };
const lake = (c, x, G, w, h = 16) => { c.fillStyle = lg(c, 0, G - h, 0, G, [[0, '#4a7e8c'], [.5, '#3d6b78'], [1, '#2e5662']]); c.fillRect(x, G - h, w, h); for (let i = 0; i < w / 3; i++) rect(c, 'rgba(255,255,255,.28)', x + (i * 23.7) % (w - 6), G - h + 2 + (i * 5.3) % (h - 3), 3 + (i % 3) * 2, .5); rect(c, 'rgba(255,255,255,.18)', x, G - h, w, .8); };
const willow = (c, x, G, s2 = 1) => { rect(c, '#5a3d2a', x - 2.6 * s2, G - 52 * s2, 5.2 * s2, 52 * s2); c.beginPath(); c.arc(x, G - 66 * s2, 30 * s2, 0, 7); c.fillStyle = '#6e9638'; c.fill(); c.beginPath(); c.arc(x - 8 * s2, G - 74 * s2, 18 * s2, 0, 7); c.fillStyle = '#94bb52'; c.fill();
  for (let i = 0; i < 46; i++) { const fx = x - 30 * s2 + i * 1.32 * s2, len = (20 + (i * 7) % 16) * s2; c.beginPath(); c.moveTo(fx, G - 66 * s2); c.quadraticCurveTo(fx + 1.4 * s2, G - 66 * s2 + len * .6, fx + .6 * s2, G - 50 * s2 + len * .3); c.strokeStyle = ['#6e9638', '#86b049', '#a8cc60', '#5a8030'][i % 4]; c.lineWidth = 1.3 * s2; c.stroke(); } };

// Luton Sixth Form College: yellow-buff brick, white canopy with posts over the side entrance, tall glazed entrance block with the
// red drum roof and thin white posts, grey plant room with windows, Luton / SIXTH FORM / COLLEGE lettering (not lit), green gates
HD.sixthform = (c, x0, G) => {
  c.save(); c.lineJoin = 'round';
  brick(c, x0, G - 70, 112, 70, '#dcab52'); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x0, G - 70, 112, 70); rect(c, '#3d3d42', x0, G - 6, 112, 6);
  for (let i = 0; i < 3; i++) curtain(c, x0 + 10 + i * 34, G - 52, 18, 28, 2, 2, ['#a8dcd8', '#5aa6a4', '#2e6e6c']);
  poly(c, '#efefee', [[x0 + 4, G - 64], [x0 + 70, G - 64], [x0 + 62, G - 58], [x0 + 10, G - 58]], LINE, .35); rect(c, '#e8e8e8', x0 + 12, G - 58, 1.6, 58); rect(c, '#e8e8e8', x0 + 60, G - 58, 1.6, 58);
  for (let i = 0; i < 10; i++) rect(c, '#2e8b57', x0 + 4 + i * 6, G - 28, 1.6, 28); rect(c, '#2e8b57', x0 + 4, G - 28, 58, 1.6); rect(c, '#2e8b57', x0 + 4, G - 16, 58, 1);
  const x = x0 + 110;
  brick(c, x, G - 70, 244, 70, '#dcab52'); c.strokeStyle = LINE; c.strokeRect(x, G - 70, 244, 70); rect(c, '#3d3d42', x, G - 6, 244, 6);
  panels(c, x + 150, G - 92, 70, 22, '#70747a', 11); for (let i = 0; i < 3; i++) curtain(c, x + 154 + i * 22, G - 88, 18, 12, 1, 1, ['#a8dcd8', '#5aa6a4', '#2e6e6c']);
  c.fillStyle = lg(c, 0, G - 112, 0, G - 100, [[0, '#e05a3e'], [1, '#a8321e']]); c.beginPath(); c.moveTo(x + 58, G - 100); c.lineTo(x + 64, G - 108); c.quadraticCurveTo(x + 100, G - 114, x + 136, G - 108); c.lineTo(x + 142, G - 100); c.closePath(); c.fill(); c.strokeStyle = LINE; c.lineWidth = .4; c.stroke(); rect(c, '#dcab52', x + 58, G - 100, 84, 4);
  curtain(c, x + 62, G - 90, 76, 90, 7, 4, ['#8ab0c8', '#3e566c', '#24323e']);
  rect(c, '#7e838a', x + 46, G - 96, 108, 5, LINE, .35); for (const px of [x + 60, x + 86, x + 112, x + 138]) rect(c, '#f6f4ee', px, G - 91, 2, 91);
  curtain(c, x + 16, G - 48, 16, 26, 1, 2, ['#a8dcd8', '#5aa6a4', '#2e6e6c']);
  for (let i = 0; i < 3; i++) poly(c, i === 1 ? '#d8262f' : '#9aa0a8', [[x + 174 + i * 7, G - 64], [x + 180 + i * 7, G - 64], [x + 176 + i * 7, G - 58], [x + 170 + i * 7, G - 58]]);
  txt(c, 'Luton', x + 186, G - 49, 15, '#26292f', { f: 'Mont, sans-serif', w: 600 }); txt(c, 'SIXTH FORM', x + 186, G - 37, 5.6, '#5e6b5a', { f: 'Mont, sans-serif', w: 600, ls: .6 }); txt(c, 'COLLEGE', x + 186, G - 31, 5.6, '#5e6b5a', { f: 'Mont, sans-serif', w: 600, ls: .6 });
  for (let i = 0; i < 6; i++) rect(c, '#2e8b57', x + 214 + i * 6, G - 28, 1.6, 28); rect(c, '#2e8b57', x + 212, G - 28, 32, 1.6); rect(c, '#2e8b57', x + 212, G - 16, 32, 1);
  rect(c, '#5a5e66', x0 - 6.6, G - 80, 1.4, 80); rect(c, '#5a5e66', x0 - 6.6, G - 80, 7, 1.4); rect(c, '#e8e8e8', x0 - 1, G - 79.6, 4, 2);
  c.restore();
};

// Wardown Park field: park trees, lawn, WARDOWN PARK sign, play area with red swing frame + swings, blue climbing tower with a
// yellow slide and ladder, soft play surface
HD.wardownfield = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  tree(c, x + 30, G - 26, 1.3, { d: '#2f5f3a', m: '#3d7848', l: '#5a9a5a' }); tree(c, x + 168, G - 28, 1.5, { d: '#2a5434', m: '#356b40', l: '#4f8a4f' }); tree(c, x + 100, G - 4, 1.5, { d: '#4a7f30', m: '#5f9a3e', l: '#8ac060' });
  lawn(c, x - 2, G, 204);
  rect(c, '#4a3326', x + 12, G - 18, 2.4, 10); rect(c, '#4a3326', x + 42, G - 18, 2.4, 10); rect(c, '#2f6a3a', x + 6, G - 36, 44, 18, '#e8e4d0', .8); txt(c, 'WARDOWN', x + 28, G - 30.4, 6.4, '#ffffff', { f: 'Mont, sans-serif', w: 800, ls: .6 }); txt(c, 'PARK', x + 28, G - 23, 6.4, '#f2c43a', { f: 'Mont, sans-serif', w: 900, ls: 1 });
  rect(c, '#c8503a', x + 58, G - 8, 130, 6); for (let i = 0; i < 26; i++) rect(c, 'rgba(0,0,0,.12)', x + 58 + i * 5, G - 8, .4, 6);
  c.lineCap = 'round'; for (const [a, b] of [[62, 70], [110, 102]]) line(c, '#d32f2f', 2, [[x + a, G - 8], [x + b, G - 48]]); line(c, '#d32f2f', 2.4, [[x + 68, G - 49], [x + 104, G - 49]]);
  for (const sx of [x + 78, x + 94]) { line(c, '#9aa3ad', .5, [[sx, G - 47], [sx, G - 21]]); line(c, '#9aa3ad', .5, [[sx + 5, G - 47], [sx + 5, G - 21]]); rect(c, '#1a1a1e', sx - 1, G - 22, 8, 1.6); }
  c.fillStyle = lg(c, x + 124, 0, x + 146, 0, [[0, '#3a80e0'], [1, '#1f58b8']]); c.fillRect(x + 124, G - 40, 22, 32); poly(c, '#f2c43a', [[x + 122, G - 40], [x + 135, G - 50], [x + 148, G - 40]], '#8a6a10', .3);
  for (let i = 0; i < 4; i++) rect(c, '#f4f2ec', x + 117, G - 38 + i * 8, 7, 1); rect(c, '#9aa3ad', x + 116, G - 40, 1, 32); rect(c, '#9aa3ad', x + 123, G - 40, 1, 32);
  c.fillStyle = lg(c, 0, G - 38, 0, G - 8, [[0, '#ffd84a'], [1, '#e8a820']]); c.beginPath(); c.moveTo(x + 146, G - 38); c.lineTo(x + 150, G - 38); c.quadraticCurveTo(x + 166, G - 30, x + 182, G - 8); c.lineTo(x + 176, G - 8); c.quadraticCurveTo(x + 162, G - 28, x + 146, G - 34); c.fill();
  c.restore();
};

// Wardown Park lake: boat house (brick, red tiled roof, two doors with cream panels, red sign), willow, park trees; the lake with
// ducks and an empty pedalo moored (drawn in the animation)
HD.wardown = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  tree(c, x + 170, G - 30, 1.5, { d: '#2a5434', m: '#356b40', l: '#4f8a4f' }); tree(c, x + 196, G - 28, 1.1, { d: '#2f5f3a', m: '#3d7848', l: '#5a9a5a' });
  brick(c, x + 96, G - 58, 80, 42, '#a8553f'); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x + 96, G - 58, 80, 42);
  slate(c, [[x + 88, G - 58], [x + 184, G - 58], [x + 168, G - 78], [x + 104, G - 78]], '#b5503a');
  for (const dx of [x + 106, x + 146]) { rect(c, '#5b3a2c', dx, G - 50, 20, 34, '#2a1a10', .35); rect(c, '#ece0cf', dx + 3, G - 47, 14, 10); rect(c, '#5b3a2c', dx + 9.4, G - 47, 1.2, 10); for (let k = 0; k < 5; k++) rect(c, 'rgba(0,0,0,.2)', dx + 3, G - 34 + k * 3.6, 14, .4); }
  rect(c, '#c8352b', x + 168, G - 50, 6, 10, '#6a1010', .3);
  lake(c, x, G, 210); rect(c, '#7a7068', x, G - 18, 210, 2);
  for (let i = 0; i < 20; i++) rect(c, '#1b1a24', x + 4 + i * 10, G - 20, .8, 4); rect(c, '#1b1a24', x, G - 20, 210, .8);
  willow(c, x + 40, G - 2);
  rect(c, '#6b4a32', x + 186, G - 24, 18, 2.4); rect(c, '#3a2a20', x + 188, G - 21.6, 1.6, 5); rect(c, '#3a2a20', x + 200, G - 21.6, 1.6, 5);
  c.restore();
};
window.LM_ANIM.wardown = (c, x, G, t) => {
  const duck = (dx, dy, f, kind) => { c.save(); c.translate(dx, dy); c.scale(f, 1); c.beginPath(); c.ellipse(0, 0, 3.6, 1.8, 0, 0, 7); c.fillStyle = kind ? '#8a6a44' : '#9a8a78'; c.fill(); c.beginPath(); c.arc(2.6, -2, 1.4, 0, 7); c.fillStyle = kind ? '#7a5a3a' : '#2e8b57'; c.fill(); poly(c, '#f2c43a', [[3.8, -2.2], [5.4, -1.8], [3.8, -1.4]]); if (!kind) rect(c, '#f4f2ec', 1.6, -1, 2, .5); rect(c, 'rgba(255,255,255,.4)', -5, 1.8, 3, .5); c.restore(); };
  const p1 = Math.sin(t * .35), d1 = Math.cos(t * .35) >= 0 ? 1 : -1; duck(x + 44 + p1 * 22, G - 8, d1, 0); duck(x + 64 + p1 * 22, G - 6, d1, 1); duck(x + 172, G - 7, -1, 0);
  const bx = x + 120 + Math.sin(t * .2) * 30, by = G - 11; c.fillStyle = lg(c, 0, by - 4, 0, by + 4, [[0, '#4aa0e8'], [1, '#1f5fb0']]); c.beginPath(); c.moveTo(bx - 11, by); c.quadraticCurveTo(bx - 12, by + 4, bx - 6, by + 4); c.lineTo(bx + 8, by + 4); c.quadraticCurveTo(bx + 13, by + 4, bx + 12, by); c.closePath(); c.fill();
  rect(c, '#f4f4f0', bx - 9, by - 1, 20, 1.4); rect(c, '#e8e8e4', bx - 5, by - 6, 3, 5); rect(c, '#e8e8e4', bx + 3, by - 6, 3, 5); rect(c, 'rgba(255,255,255,.5)', bx - 14, by + 4, 8, .6);
};

// Wardown Park bridge: park trees and a big willow; the white suspension footbridge (stone piers, twin-post towers, sagging cables,
// hangers, lattice railings) crossing from the far bank to the near one is drawn in the animation layer with the water
HD.wardownbridge = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  tree(c, x + 150, G - 26, 1.5, { d: '#2a5434', m: '#356b40', l: '#4f8a4f' }); tree(c, x + 14, G - 24, 1.3, { d: '#2f5f3a', m: '#3d7848', l: '#5a9a5a' });
  willow(c, x + 77, G - 4, 1.15);
  c.restore();
};
window.LM_ANIM.wardownbridge = (c, x, G, t) => {
  lake(c, x, G, 170); rect(c, '#5f9e44', x, G - 19, 48, 3);
  c.save(); const KS = 13 / 162; c.transform(1, KS, 0, 1, 0, -KS * (x + 166));
  const WH = '#f6f6f2', SD = '#c9c9c2', ST = '#ddd4c2', L0 = x + 4, L1 = x + 166, TA = x + 16, TB = x + 152, TY = G - 64, DY = G - 26;
  for (const tx of [TA, TB]) { brick(c, tx - 6, G - 18, 20, 18, '#8a6a5a', { bw: 2.4, bh: 1.1 }); for (const k of [-3, 5]) { c.fillStyle = lg(c, tx + k, 0, tx + k + 5, 0, [[0, '#ece4d4'], [1, '#bcb2a0']]); c.fillRect(tx + k, TY, 5, DY - TY + 8); } rect(c, ST, tx - 4, TY - 3, 15, 3, '#8a8270', .3); rect(c, ST, tx - 3, TY + 12, 13, 2); }
  const cy = xx => { const u = (xx - (TA + 3)) / (TB - TA); return (1 - u) * (1 - u) * (TY + 2) + 2 * u * (1 - u) * (DY - 16) + u * u * (TY + 2); };
  c.strokeStyle = WH; c.lineWidth = 1; c.beginPath(); c.moveTo(TA + 3, TY + 2); c.quadraticCurveTo((TA + TB) / 2 + 3, DY - 30, TB + 3, TY + 2); c.stroke(); line(c, WH, 1, [[L0, DY - 6], [TA - 2, TY + 2]]); line(c, WH, 1, [[L1, DY - 6], [TB + 8, TY + 2]]);
  for (let hx = TA + 8; hx < TB - 4; hx += 4) rect(c, SD, hx, cy(hx), .5, Math.max(0, DY - 10 - cy(hx)));
  rect(c, WH, L0, DY, L1 - L0, 3.4, '#9a9a94', .3); rect(c, SD, L0, DY + 3, L1 - L0, .8); rect(c, WH, L0, DY - 11, L1 - L0, 1.6);
  c.save(); c.beginPath(); c.rect(L0, DY - 9.4, L1 - L0, 9.4); c.clip(); for (let i = L0 - 10; i < L1 + 10; i += 3.4) { line(c, WH, .55, [[i, DY - 9.4], [i + 9.4, DY]]); line(c, WH, .55, [[i + 9.4, DY - 9.4], [i, DY]]); } c.restore();
  for (let i = L0; i <= L1; i += 12) rect(c, WH, i, DY - 12, 1.4, 12);
  c.restore();
  c.save(); c.beginPath(); c.rect(x, G - 16, 60, 16); c.clip(); lake(c, x, G, 60); c.restore();
};

// Wardown funfair: lawn, big wheel A-frame (the wheel turns in the animation), BIG WHEEL board, pendulum ride tower, striped
// carousel tent with horses, stalls with striped canopies (DUCKS / CANDY / DONUT), bunting
HD.funfair = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  lawn(c, x - 2, G, 404);
  for (const sd of [-1, 1]) { c.fillStyle = lg(c, x + 72, 0, x + 72 + sd * 30, 0, [[0, '#e8eef4'], [1, '#a8b0b8']]); c.beginPath(); c.moveTo(x + 72, G - 92); c.lineTo(x + 72 + sd * 30, G - 6); c.lineTo(x + 72 + sd * 26, G - 6); c.lineTo(x + 72 - sd * 2, G - 92); c.fill(); }
  rect(c, '#d32f2f', x + 46, G - 14, 52, 8, '#6a0e0e', .3); txt(c, 'BIG WHEEL', x + 72, G - 10, 5.4, '#ffffff', { f: 'Mont, sans-serif', w: 900, ls: .6 });
  for (const sd of [-1, 1]) { c.fillStyle = lg(c, x + 196, 0, x + 196 + sd * 34, 0, [[0, '#ffe066'], [1, '#d8a820']]); c.beginPath(); c.moveTo(x + 196, G - 150); c.lineTo(x + 196 + sd * 34, G - 6); c.lineTo(x + 196 + sd * 28, G - 6); c.lineTo(x + 196 - sd * 2, G - 150); c.fill(); }
  rect(c, '#e8641c', x + 160, G - 14, 72, 8, '#7a2a08', .3); for (let i = 0; i < 8; i++) rect(c, i % 2 ? '#f2c43a' : '#d32f2f', x + 162 + i * 9, G - 12, 5, 4);
  { const cx = x + 280, top = G - 66, w = 76, h = 22; for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#d32f2f' : '#f2c43a'; c.beginPath(); c.moveTo(cx, top); c.lineTo(cx - w / 2 + i * w / 12, top + h); c.lineTo(cx - w / 2 + (i + 1) * w / 12, top + h); c.fill(); } line(c, LINE, .4, [[cx - w / 2, top + h], [cx, top], [cx + w / 2, top + h]]);
    for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(cx - w / 2 + (i + .5) * w / 12, top + h, w / 24, 0, Math.PI); c.fillStyle = i % 2 ? '#d32f2f' : '#f2c43a'; c.fill(); } rect(c, '#d32f2f', cx - 1, top - 6, 2, 6); poly(c, '#f2c43a', [[cx + 1, top - 6], [cx + 6, top - 4.6], [cx + 1, top - 3]]); }
  rect(c, '#f6e6b8', x + 246, G - 40, 68, 32, LINE, .35); for (let i = 0; i < 6; i++) { rect(c, '#d9b44a', x + 252 + i * 11, G - 40, .8, 26); const hy = G - 24 + Math.sin(i * 1.7) * 3; c.fillStyle = ['#f4f2ec', '#e0558c', '#2a6fd8'][i % 3]; c.beginPath(); c.ellipse(x + 252.4 + i * 11, hy, 4, 2.2, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x + 255.4 + i * 11, hy - 2.4, 1.4, 0, 7); c.fill(); }
  for (const [sx, a, b, label] of [[x + 112, '#2a6fd8', '#f4f2ec', 'DUCKS'], [x + 330, '#d32f2f', '#f4f2ec', 'CANDY'], [x + 362, '#3fae5a', '#f2c43a', 'DONUT']]) {
    rect(c, '#f6e6b8', sx, G - 30, 32, 22, LINE, .35); for (let i = 0; i < 8; i++) rect(c, i % 2 ? a : b, sx - 2 + i * 4.5, G - 40, 4.5, 8); for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(sx + .25 + i * 4.5, G - 32, 2.25, 0, Math.PI); c.fillStyle = i % 2 ? a : b; c.fill(); }
    rect(c, '#3a3d44', sx + 2, G - 22, 28, 1.6); txt(c, label, sx + 16, G - 26, 4.6, '#1b1a24', { f: 'Mont, sans-serif', w: 900 }); }
  c.beginPath(); for (let i = 0; i <= 24; i++) { const bx = x + 100 + i * 12; c.lineTo(bx, G - 48 + Math.abs(Math.sin(i * .52)) * 3); } line; c.strokeStyle = '#3a3d44'; c.lineWidth = .4; c.stroke();
  for (let i = 0; i < 24; i++) { const bx = x + 100 + i * 12, by = G - 48 + Math.abs(Math.sin(i * .52)) * 3; poly(c, ['#d32f2f', '#f2c43a', '#2a6fd8', '#3fae5a'][i % 4], [[bx + 1, by], [bx + 9, by], [bx + 5, by + 6]]); }
  c.restore();
};
window.LM_ANIM.funfair = (c, x, G, t) => {
  const cx = x + 72, cy = G - 92, r = 56, a0 = t * .35, cols = ['#d32f2f', '#f2c43a', '#2a6fd8', '#3fae5a', '#e0558c', '#e8641c'];
  c.beginPath(); c.arc(cx, cy, r, 0, 7); c.strokeStyle = '#1b1a24'; c.lineWidth = 2.4; c.stroke(); c.strokeStyle = '#eef2f6'; c.lineWidth = 1.4; c.stroke(); c.beginPath(); c.arc(cx, cy, r - 6, 0, 7); c.strokeStyle = '#c8d0d8'; c.lineWidth = .6; c.stroke();
  for (let i = 0; i < 24; i++) { const a = a0 + i * Math.PI / 12; line(c, '#c8d0d8', .45, [[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]]); }
  for (let i = 0; i < 12; i++) { const a = a0 + i * Math.PI / 6, gx = cx + Math.cos(a) * r, gy = cy + Math.sin(a) * r; rect(c, '#3a3d44', gx - .4, gy, .8, 3.4); c.fillStyle = lg(c, 0, gy + 3, 0, gy + 10, [[0, shade(cols[i % 6], 1.2)], [1, shade(cols[i % 6], .8)]]); c.beginPath(); c.roundRect ? c.roundRect(gx - 4.6, gy + 3, 9.2, 7, 1.6) : c.rect(gx - 4.6, gy + 3, 9.2, 7); c.fill(); rect(c, '#e8f2f8', gx - 3, gy + 4.4, 6, 2.4); }
  for (let i = 0; i < 24; i++) { const a = -a0 + i * .262; c.beginPath(); c.arc(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3), .7, 0, 7); c.fillStyle = i % 2 ? '#fff6b0' : '#ffd060'; c.fill(); }
  c.beginPath(); c.arc(cx, cy, 4.4, 0, 7); c.fillStyle = '#f2c43a'; c.fill(); c.strokeStyle = '#1b1a24'; c.lineWidth = .5; c.stroke();
  const px = x + 196, py = G - 148, sw = Math.sin(t * 1.1) * 1.15, L2 = 112, ex = px + Math.sin(sw) * L2, ey = py + Math.cos(sw) * L2;
  c.save(); c.translate(px, py); c.rotate(-sw); c.fillStyle = lg(c, -3, 0, 3, 0, [[0, '#c84a10'], [.5, '#ff8a3c'], [1, '#c84a10']]); c.fillRect(-3, 0, 6, L2); for (let i = 8; i < L2; i += 12) rect(c, '#f2c43a', -3, i, 6, 4); c.restore();
  c.save(); c.translate(ex, ey); c.rotate(-sw); c.fillStyle = lg(c, 0, -5, 0, 5, [[0, '#4a8ae8'], [1, '#1f4fa8']]); c.beginPath(); c.roundRect ? c.roundRect(-16, -5, 32, 10, 3) : c.rect(-16, -5, 32, 10); c.fill(); for (let i = 0; i < 6; i++) rect(c, '#f2c43a', -14 + i * 5, -7.6, 3.6, 3); c.restore();
  c.beginPath(); c.arc(px, py, 4.6, 0, 7); c.fillStyle = '#9aa3ad'; c.fill(); c.strokeStyle = '#1b1a24'; c.lineWidth = .5; c.stroke(); rect(c, '#d32f2f', px - 4, py - 10, 8, 6, '#6a0e0e', .3);
};

// Stockwood Discovery Centre: park trees behind, grey stone entrance block with a timber pergola + glass doors, purple STOCKWOOD
// DISCOVERY board, timber-framed cafe glazing, walled garden (red brick wall, trellis, white obelisk), knot-garden hedges, stone urns
// with flowers, spiral topiary, the well with its iron arch
HD.stockwood = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  for (const [tx, s2] of [[20, 1.4], [120, 1.7], [250, 1.6], [340, 1.4]]) tree(c, x + tx, G - 50, s2, { d: '#2f5f2c', m: '#3f6f34', l: '#6a9a4a' });
  brick(c, x, G - 52, 160, 52, '#aaa69e', { mortar: 'rgba(80,80,80,.25)' }); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 52, 160, 52); rect(c, '#ebe6d9', x - 2, G - 56, 164, 4, LINE, .3);
  rect(c, '#c9a36a', x + 70, G - 52, 90, 52); for (let i = 0; i < 5; i++) { c.fillStyle = lg(c, x + 72 + i * 17, 0, x + 87 + i * 17, 0, [[0, '#c49a5e'], [1, '#a8844e']]); c.fillRect(x + 72 + i * 17, G - 46, 15, 46); c.fillStyle = lg(c, 0, G - 44, 0, G - 2, [[0, '#5a6878'], [1, '#22283a']]); c.fillRect(x + 74 + i * 17, G - 44, 11, 42); glare(c, x + 74 + i * 17, G - 44, 11, 42); }
  rect(c, '#dcc8a0', x + 66, G - 58, 98, 6, LINE, .3);
  for (const px of [x + 18, x + 48]) { c.fillStyle = lg(c, px, 0, px + 4, 0, [[0, '#d4ae74'], [1, '#a8844e']]); c.fillRect(px, G - 44, 4, 44); } rect(c, '#c9a36a', x + 12, G - 48, 44, 4, '#7a5a2a', .3); for (let i = 0; i < 9; i++) rect(c, '#a8844e', x + 13 + i * 5, G - 50.4, 2, 2.4);
  rect(c, '#3a2a20', x + 26, G - 36, 18, 36); for (const dx of [x + 28, x + 36]) { c.fillStyle = lg(c, 0, G - 34, 0, G, [[0, '#d4e4f0'], [1, '#7a9ab4']]); c.fillRect(dx, G - 34, 6, 30); }
  c.fillStyle = lg(c, 0, G - 72, 0, G - 59, [[0, '#6a3a7e'], [1, '#4a2058']]); c.fillRect(x + 4, G - 72, 150, 13); c.strokeStyle = '#2a0e36'; c.strokeRect(x + 4, G - 72, 150, 13); txt(c, 'STOCKWOOD  DISCOVERY  CENTRE', x + 79, G - 65.4, 5.4, '#ffffff', { f: 'Mont, sans-serif', w: 700, ls: .6 });
  brick(c, x + 164, G - 46, 216, 46, '#a8603e'); c.strokeStyle = LINE; c.strokeRect(x + 164, G - 46, 216, 46); rect(c, '#c8b8a0', x + 163, G - 47.6, 218, 1.6);
  for (let i = 0; i < 54; i++) rect(c, '#c9a36a', x + 166 + i * 4, G - 62, .7, 16); for (let j = 0; j < 4; j++) rect(c, '#c9a36a', x + 164, G - 62 + j * 5, 216, .7);
  c.fillStyle = lg(c, x + 270, 0, x + 278, 0, [[0, '#f4f0e6'], [1, '#c8c2b4']]); c.fillRect(x + 270, G - 76, 8, 30); poly(c, '#ebe6d9', [[x + 270, G - 76], [x + 274, G - 88], [x + 278, G - 76]], LINE, .3);
  for (let i = 0; i < 6; i++) { c.fillStyle = lg(c, 0, G - 14, 0, G, [[0, '#5a9a44'], [1, '#2f6a28']]); c.beginPath(); c.roundRect ? c.roundRect(x + 168 + i * 35, G - 14, 30, 14, 3) : c.rect(x + 168 + i * 35, G - 14, 30, 14); c.fill(); for (let k = 0; k < 20; k++) { c.beginPath(); c.arc(x + 170 + i * 35 + (k * 7.3) % 26, G - 12 + (k * 3.7) % 10, .9, 0, 7); c.fillStyle = k % 2 ? '#6aaa50' : '#3f7d33'; c.fill(); } }
  const URN = ux => { c.fillStyle = lg(c, ux, 0, ux + 6, 0, [[0, '#f4f0e6'], [1, '#c8c2b4']]); c.fillRect(ux, G - 20, 6, 20); c.beginPath(); c.moveTo(ux - 5, G - 30); c.lineTo(ux + 11, G - 30); c.quadraticCurveTo(ux + 9, G - 20, ux + 3, G - 20); c.quadraticCurveTo(ux - 3, G - 20, ux - 5, G - 30); c.fill(); for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(ux - 4 + i * 1.3, G - 32 - (i % 3), 1.4, 0, 7); c.fillStyle = ['#d84b3c', '#f2c14e', '#e0458a', '#7a4fb5', '#5a9a44'][i % 5]; c.fill(); } };
  URN(x + 196); URN(x + 344);
  rect(c, '#aaa69e', x + 252, G - 14, 34, 14, LINE, .35); brick(c, x + 252, G - 14, 34, 14, '#aaa69e', { bw: 2.4, bh: 1.1 }); c.strokeStyle = '#1a1a1e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 256, G - 14); c.quadraticCurveTo(x + 269, G - 60, x + 282, G - 14); c.stroke(); rect(c, '#1a1a1e', x + 268.4, G - 37, 1.2, 8); rect(c, '#7a5a3a', x + 266, G - 30, 6, 4);
  for (const tx of [x + 226, x + 316]) { rect(c, '#e8e3d6', tx - 4, G - 6, 8, 6); for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(tx, G - 10 - k * 7, 6 - k * .9, 3.6, 0, 0, 7); c.fillStyle = k % 2 ? '#4f8a3c' : '#3f7d33'; c.fill(); } }
  c.restore();
};

// Welcome to Luton: the grass bank by the airport road with WELCOME TO LUTON laid out in big white letters on dark tarmac (as seen
// from the planes), mown edge, fence along the top
HD.welcome = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  c.fillStyle = lg(c, 0, G - 88, 0, G, [[0, '#78b85a'], [1, '#4f8a36']]); c.beginPath(); c.moveTo(x, G); c.lineTo(x + 34, G - 88); c.lineTo(x + 226, G - 88); c.lineTo(x + 260, G); c.fill();
  for (let i = 0; i < 260; i++) { const gx = x + 10 + (i * 37.3) % 240, gy = G - 84 + (i * 23.7) % 82; if (gx < x + 34 - (gy - G + 88) * .39 + 34 && gx < x + 20) continue; line(c, i % 3 ? '#4f8a36' : '#8cc86a', .5, [[gx, gy + 1.6], [gx + .4, gy]]); }
  c.fillStyle = lg(c, 0, G - 80, 0, G - 6, [[0, '#4a4e54'], [1, '#5e6268']]); c.beginPath(); c.moveTo(x + 20, G - 6); c.lineTo(x + 46, G - 80); c.lineTo(x + 214, G - 80); c.lineTo(x + 240, G - 6); c.fill();
  for (let i = 0; i < 160; i++) rect(c, i % 2 ? '#3e4248' : '#6a6e74', x + 40 + (i * 31.7) % 180, G - 76 + (i * 17.3) % 68, .8, .5);
  c.save(); c.font = '900 13px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '2px'; c.fillStyle = '#f4f4f0'; c.fillText('WELCOME TO', x + 130, G - 62); c.restore();
  c.save(); c.translate(x + 130, G - 32); c.scale(1, 1.1); c.font = '900 40px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(0,0,0,.25)'; c.fillText('LUTON', 1, 1); c.fillStyle = '#f6f6f2'; c.fillText('LUTON', 0, 0); c.restore();
  for (let i = 0; i < 10; i++) rect(c, '#3a3d44', x + 52 + i * 17, G - 96, 1, 8); rect(c, '#3a3d44', x + 52, G - 96, 154, 1); rect(c, '#3a3d44', x + 52, G - 92, 154, .6);
  c.restore();
};

// Vauxhall Luton plant: long white main hall, tall silver chimneys, grey vent towers, teal plant rooms; white office block with window
// grids and the red V badge (generic, not the griffin) + VAUXHALL; grey ribbed block with red edges, red-framed windows and HOME OF THE
// VAUXHALL VIVARO; long shed with a red van; brick wall with hedges, brick piers, blue mesh gates, Gate 2 sign, lamp posts
HD.vauxhall = (c, x, G) => {
  c.save(); c.lineJoin = 'round'; const RD = '#d42a2a', TL = '#5f8f94';
  ribbed(c, x + 150, G - 150, 322, 70, '#e8eaed', 2.6); rect(c, '#c9ced4', x + 148, G - 153, 326, 3);
  for (const cx of [x + 196, x + 250, x + 286]) { c.fillStyle = lg(c, cx, 0, cx + 9, 0, [[0, '#9aa3ad'], [.4, '#f4f6f8'], [1, '#8a929c']]); c.fillRect(cx, G - 214, 9, 64); rect(c, '#7a828c', cx - 1, G - 216, 11, 2.4); rect(c, '#9aa3ad', cx - 3, G - 160, 15, 1.6); }
  for (const [vx, vh] of [[x + 40, 34], [x + 82, 30], [x + 352, 36], [x + 396, 40], [x + 440, 32]]) { const vb = vx > x + 150 ? G - 150 : G - 128; ribbed(c, vx, vb - vh, 22, vh, '#8a9098', 2); }
  for (const [tx, tw] of [[x + 100, 50], [x + 306, 30]]) { panels(c, tx, G - 150, tw, 22, TL, 5.5); poly(c, '#4f7d82', [[tx - 2, G - 150], [tx + tw / 2, G - 158], [tx + tw + 2, G - 150]], LINE, .3); rect(c, RD, tx, G - 150, 1, 22); }
  panels(c, x, G - 128, 168, 128, '#eef0f2', 16); rect(c, '#9aa1a8', x - 2, G - 131, 172, 3);
  const grid = (gx, gy, cols, rows, cw, ch, dark) => { rect(c, '#3a3f46', gx - 1, gy - 1, cols * cw + 1, rows * ch + 1); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { c.fillStyle = (i + j * 3) % 7 === 2 ? '#c9d8e2' : lg(c, 0, gy + j * ch, 0, gy + (j + 1) * ch, dark ? [[0, '#7a8a98'], [1, '#4a5866']] : [[0, '#a8bccc'], [1, '#6a8090']]); c.fillRect(gx + i * cw, gy + j * ch, cw - 1, ch - 1); } };
  grid(x + 4, G - 116, 14, 3, 7, 7, true); grid(x + 4, G - 72, 14, 3, 7, 7, false); rect(c, '#d9dce0', x + 4, G - 50, 98, 3); grid(x + 154, G - 120, 2, 14, 6, 7, false);
  rect(c, '#c3c7cc', x + 104, G - 118, 46, 42, '#8a9098', .35); c.beginPath(); c.arc(x + 127, G - 101, 10.6, 0, 7); c.fillStyle = '#c8202a'; c.fill(); c.beginPath(); c.arc(x + 127, G - 101, 7.4, 0, 7); c.fillStyle = '#eef2f4'; c.fill(); c.beginPath(); c.arc(x + 127, G - 101, 6.2, 0, 7); c.fillStyle = '#c8202a'; c.fill();
  poly(c, '#f4f6f8', [[x + 123, G - 106], [x + 125.6, G - 106], [x + 127.5, G - 100.4], [x + 129.4, G - 106], [x + 132, G - 106], [x + 128.6, G - 97], [x + 126.4, G - 97]]);
  txt(c, 'VAUXHALL', x + 127, G - 83, 5.6, '#3a3f46', { f: 'Mont, sans-serif', w: 800, ls: .8 });
  brick(c, x, G - 14, 168, 14, '#8a5a3a');
  ribbed(c, x + 168, G - 112, 182, 112, '#b9bec4', 2.6); rect(c, RD, x + 168, G - 114, 182, 2); rect(c, RD, x + 348, G - 112, 2, 112); rect(c, RD, x + 168, G - 112, 2, 112);
  txt(c, 'HOME OF THE', x + 259, G - 104, 5.4, RD, { f: 'Mont, sans-serif', w: 800, ls: .8 });
  c.save(); c.font = '900 11px Mont, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 2.2; c.strokeStyle = '#f4f6f8'; c.strokeText('VAUXHALL VIVARO', x + 259, G - 95); c.fillStyle = RD; c.fillText('VAUXHALL VIVARO', x + 259, G - 95); c.restore();
  const rwin = (wx, wy, ww, wh, cols, rows) => { rect(c, RD, wx, wy, ww, wh); const cw = (ww - 4) / cols, ch = (wh - 4) / rows; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { c.fillStyle = lg(c, 0, wy + 2 + j * ch, 0, wy + 2 + (j + 1) * ch, [[0, '#7a8a98'], [1, '#3f4a55']]); c.fillRect(wx + 2 + i * cw + .4, wy + 2 + j * ch + .4, cw - .8, ch - .8); } glare(c, wx + 2, wy + 2, ww - 4, wh - 4); };
  rwin(x + 186, G - 84, 40, 24, 4, 3); rwin(x + 236, G - 84, 20, 24, 2, 3); rwin(x + 266, G - 86, 70, 26, 7, 3); rwin(x + 186, G - 50, 40, 30, 4, 4); rwin(x + 236, G - 50, 20, 30, 2, 4); rwin(x + 266, G - 52, 70, 32, 7, 4);
  ribbed(c, x + 350, G - 80, 120, 80, '#e6e8eb', 2.6); rect(c, RD, x + 350, G - 82, 120, 2); panels(c, x + 350, G - 92, 120, 10, '#c9ced4', 5);
  { const vx = x + 390, vy = G - 70; c.fillStyle = lg(c, 0, vy, 0, vy + 14, [[0, '#e83030'], [1, '#a81a1e']]); c.beginPath(); c.moveTo(vx, vy + 14); c.lineTo(vx, vy + 4); c.quadraticCurveTo(vx, vy, vx + 4, vy); c.lineTo(vx + 22, vy); c.lineTo(vx + 30, vy + 7); c.quadraticCurveTo(vx + 34, vy + 8, vx + 34, vy + 11); c.lineTo(vx + 34, vy + 14); c.fill(); c.fillStyle = '#3f4a55'; c.beginPath(); c.moveTo(vx + 23, vy + 1.6); c.lineTo(vx + 29, vy + 6.6); c.lineTo(vx + 23, vy + 6.6); c.fill(); for (const wx of [vx + 7, vx + 27]) { c.beginPath(); c.arc(wx, vy + 14, 3, 0, 7); c.fillStyle = '#141416'; c.fill(); c.beginPath(); c.arc(wx, vy + 14, 1.4, 0, 7); c.fillStyle = '#b8bec6'; c.fill(); } }
  rect(c, RD, x + 448, G - 30, 18, 30); rect(c, '#3a3f46', x + 450, G - 28, 14, 28);
  brick(c, x - 2, G - 20, 238, 20, '#9a5038'); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(x - 2, G - 20, 238, 20); rect(c, '#cdc8bc', x - 3, G - 23, 240, 3, LINE, .25);
  for (const [hx, hw] of [[x + 10, 44], [x + 178, 52]]) { c.fillStyle = '#356b2c'; c.beginPath(); c.roundRect ? c.roundRect(hx, G - 35, hw, 15, 3) : c.rect(hx, G - 35, hw, 15); c.fill(); for (let k = 0; k < hw * 2; k++) { c.beginPath(); c.arc(hx + 1 + (k * 7.3) % (hw - 2), G - 33 + (k * 3.3) % 12, 1, 0, 7); c.fillStyle = k % 3 ? '#4f8f3e' : '#6aaa50'; c.fill(); } }
  const PIER = px => { brick(c, px, G - 40, 14, 40, '#9a5038'); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(px, G - 40, 14, 40); rect(c, '#6a6f77', px - 1, G - 43, 16, 3); };
  const GATE = (gx, gw) => { c.strokeStyle = 'rgba(42,63,154,.55)'; c.lineWidth = .3; for (let yy = G - 33; yy < G - 3; yy += 1.4) { c.beginPath(); c.moveTo(gx, yy); c.lineTo(gx + gw, yy); c.stroke(); } for (let xx = gx; xx < gx + gw; xx += 1.4) { c.beginPath(); c.moveTo(xx, G - 33); c.lineTo(xx, G - 3); c.stroke(); }
    rect(c, '#2a3f9a', gx, G - 36, gw, 2.4); rect(c, '#2a3f9a', gx, G - 18, gw, 1.6); rect(c, '#2a3f9a', gx, G - 3, gw, 3); for (let k = 0; k <= gw; k += gw / 6) rect(c, '#2a3f9a', gx + Math.min(k, gw - 1.6), G - 36, 1.6, 36); for (let k = 2; k < gw; k += 3) rect(c, '#1f2f7a', gx + k, G - 39, .7, 3); };
  PIER(x + 236); GATE(x + 250, 100); PIER(x + 350); GATE(x + 364, 92); PIER(x + 456);
  rect(c, '#f6f8fa', x + 256, G - 34, 58, 20, '#8a9098', .35); c.beginPath(); c.arc(x + 264, G - 24, 4, 0, 7); c.fillStyle = '#c8202a'; c.fill(); c.beginPath(); c.arc(x + 264, G - 24, 2, 0, 7); c.fillStyle = '#f6f8fa'; c.fill();
  txt(c, 'VAUXHALL', x + 288, G - 27.4, 5, '#1f2f5a', { f: 'Mont, sans-serif', w: 900 }); txt(c, 'Gate 2', x + 288, G - 20.6, 4.6, '#3a3f46', { f: 'Mont, sans-serif', w: 600 });
  for (const lx of [x + 172, x + 344]) { c.fillStyle = lg(c, lx, 0, lx + 2, 0, [[0, '#8a929c'], [.5, '#d0d4d8'], [1, '#7a828c']]); c.fillRect(lx, G - 96, 2, 96); rect(c, '#9aa3ad', lx, G - 96, 10, 1.6); rect(c, '#e8ecef', lx + 8, G - 95, 4, 1.6); }
  c.restore();
};

// London Luton Airport (owner's photo): big grey terminal in large flat cladding panels, the LLA block logo (two Ls made of three
// squares each, the A as two tilted squares) with London Luton Airport under it, white canopy on slim posts over the front, dark
// glazing with warm-lit check-in inside (only the ground-floor glass lights at night), teal panels with the grey diamond, stair rails
HD.airport = (c, x, G) => {
  c.save(); c.lineJoin = 'round';
  c.fillStyle = lg(c, 0, G - 150, 0, G - 48, [[0, '#5e6670'], [1, '#6e7680']]); c.fillRect(x, G - 150, 420, 102); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 150, 420, 102);
  for (let r = 0; r < 6; r++) { rect(c, 'rgba(0,0,0,.18)', x, G - 150 + r * 17, 420, .5); for (let k = 0; k < 14; k++) rect(c, 'rgba(0,0,0,.12)', x + ((k * 30 + r * 15) % 420), G - 150 + r * 17, .4, 17); }
  rect(c, '#7a828c', x, G - 150, 420, 2.4); ribbed(c, x + 388, G - 150, 32, 102, '#7e8690', 2);
  { const u = 8.6, lx = x + 226, ly = G - 138, sq = (qx, qy) => { c.fillStyle = '#ffffff'; c.fillRect(qx, qy, u, u); };   // LLA mark
    sq(lx, ly); sq(lx, ly + u + .9); sq(lx + u + .9, ly + u + .9);
    const l2 = lx + 2 * u + 7; sq(l2, ly - u * .4); sq(l2, ly + u * .6 + .9); sq(l2 + u + .9, ly + u * .6 + .9);
    const dia = (cx, cy) => { c.save(); c.translate(cx, cy); c.rotate(Math.PI / 4); c.fillStyle = '#ffffff'; c.fillRect(-u * .8, -u * .8, u * 1.6, u * 1.6); c.restore(); };
    dia(lx + 4 * u + 16, ly + u * .5); dia(lx + 5 * u + 21.4, ly + u * .5); }
  txt(c, 'London Luton Airport', x + 290, G - 104, 11.4, '#ffffff', { f: 'Mont, sans-serif', w: 500 });
  // ground floor: dark glazing with warm check-in light, mullions
  rect(c, '#2a333d', x, G - 48, 420, 48);
  for (let i = 0; i < 20; i++) { const gx = x + 2 + i * 21; c.fillStyle = (i % 4 === 1 || i % 4 === 2) ? lg(c, 0, G - 44, 0, G - 4, [[0, '#f8dc94'], [.6, '#e8b860'], [1, '#c89040']]) : lg(c, 0, G - 44, 0, G - 4, [[0, '#6a7e94'], [1, '#2e3a48']]); c.fillRect(gx, G - 44, 19, 40); }
  glare(c, x, G - 44, 420, 40); for (let i = 0; i < 8; i++) { rect(c, ['#c8202a', '#f2c43a', '#3f6fb5', '#2a2a2e'][i % 4], x + 30 + i * 48, G - 14, 6, 10); }
  // white canopy on slim posts
  c.fillStyle = lg(c, 0, G - 60, 0, G - 50, [[0, '#ffffff'], [1, '#d4d8dc']]); c.beginPath(); c.moveTo(x - 6, G - 50); c.lineTo(x - 6, G - 54); c.quadraticCurveTo(x + 210, G - 62, x + 426, G - 56); c.lineTo(x + 426, G - 52); c.quadraticCurveTo(x + 210, G - 56, x - 6, G - 50); c.fill(); c.strokeStyle = '#8a9098'; c.lineWidth = .4; c.stroke();
  for (let i = 0; i < 12; i++) { const px2 = x + 10 + i * 36; c.fillStyle = lg(c, px2, 0, px2 + 2, 0, [[0, '#c4c8cc'], [.5, '#ffffff'], [1, '#aab0b6']]); c.fillRect(px2, G - 54, 2, 54); }
  // teal panels with the grey diamond
  for (const tx of [x + 150, x + 330]) { c.fillStyle = lg(c, tx, 0, tx + 20, 0, [[0, '#3ac8c4'], [1, '#22a4a2']]); c.fillRect(tx, G - 34, 20, 34); c.strokeStyle = '#147a78'; c.lineWidth = .4; c.strokeRect(tx, G - 34, 20, 34); c.save(); c.translate(tx + 10, G - 17); c.rotate(Math.PI / 4); c.fillStyle = '#4a525c'; c.fillRect(-6, -6, 12, 12); c.restore(); poly(c, '#3ac8c4', [[tx + 6, G - 19], [tx + 13, G - 17], [tx + 6, G - 15]]); }
  // stair rails
  for (let i = 0; i < 4; i++) { const rx = x + 250 + i * 18; line(c, '#5a626c', .9, [[rx, G - 16], [rx + 14, G - 22]]); rect(c, '#5a626c', rx, G - 16, .8, 16); rect(c, '#5a626c', rx + 14, G - 22, .8, 22); }
  for (let i = 0; i < 5; i++) rect(c, i % 2 ? '#c8ccd0' : '#dcdfe2', x + 246, G - 3 - i * 0, 80, 0); rect(c, '#cfd2d6', x + 244, G - 4, 84, 4);
  c.restore();
};


// ======================= HOUSES (HD) =======================
// From the owner's Leagrave Road / 3D-game references: red-brick terraces with square bays under little hipped roofs, porches,
// 1930s semis with tile-hung gables, white-rendered rows, uPVC windows (some top openers, nets/blinds), stone sills, downpipes,
// aerials and dishes, low brick front walls with hedges, wheelie bins. Terrace chimneys sit on the party walls. No people.
const HH = {};
const hWin = (c, x, y, w, h, o = {}) => { const fr = o.frame || '#f6f6f2', inn = o.inner;
  rect(c, fr, x, y, w, h, '#8a8a84', .3); const panes = w > 22 ? 3 : w > 13 ? 2 : 1, pw = (w - 2.4) / panes;
  for (let i = 0; i < panes; i++) { const px = x + 1.2 + i * pw; c.fillStyle = lg(c, 0, y, 0, y + h, [[0, '#dfe8ee'], [.55, '#8aa0b2'], [1, '#54667a']]); c.fillRect(px + .4, y + 1.2, pw - .8, h - 2.4);
    if (o.top !== false && h > 12) rect(c, fr, px + .4, y + h * .32, pw - .8, .9);
    if (inn === 'nets') { c.fillStyle = 'rgba(246,244,236,.72)'; c.fillRect(px + .4, y + h * .4, pw - .8, h * .55); for (let k = 0; k < pw; k += 1.2) rect(c, 'rgba(200,196,186,.5)', px + .6 + k, y + h * .4, .3, h * .55); }
    else if (inn === 'blind') { for (let k = 0; k < h * .5; k += 1.2) rect(c, 'rgba(236,232,222,.7)', px + .4, y + 1.2 + k, pw - .8, .7); }
    else if (inn === 'curtain') { rect(c, o.cc || '#b8484a', px + .4, y + 1.2, pw * .3, h - 2.4); rect(c, o.cc || '#b8484a', px + pw * .7 - .4, y + 1.2, pw * .3, h - 2.4); } }
  glare(c, x + 1, y + 1, w - 2, h - 2); rect(c, '#e4dfd2', x - 1.2, y + h, w + 2.4, 1.8, '#8a8270', .25); };
const hDoor = (c, x, G, col, w = 12, h = 26) => { rect(c, '#f4f2ec', x - 1.4, G - h - 1.4, w + 2.8, h + 1.4, '#8a8a84', .3); c.fillStyle = lg(c, x, 0, x + w, 0, [[0, shade(col, 1.12)], [1, shade(col, .85)]]); c.fillRect(x, G - h, w, h);
  c.fillStyle = lg(c, 0, G - h + 2, 0, G - h + 8, [[0, '#d8e6f0'], [1, '#7a94a8']]); c.beginPath(); c.arc(x + w / 2, G - h + 7, w * .32, Math.PI, 0); c.lineTo(x + w / 2 + w * .32, G - h + 9); c.lineTo(x + w / 2 - w * .32, G - h + 9); c.fill();
  for (const [a, b] of [[12, 6], [20, 5]]) rect(c, 'rgba(0,0,0,.14)', x + 2, G - h + a, w - 4, b); c.beginPath(); c.arc(x + w - 2.6, G - h * .46, .8, 0, 7); c.fillStyle = '#d9b44a'; c.fill(); rect(c, '#c9a64a', x + w / 2 - 1.6, G - h * .62, 3.2, .7); };
const hRoof = (c, x, G, w, h, top, col = '#5a4e48') => slate(c, [[x - 3, G - h], [x + w + 3, G - h], [x + w - 8, G - h - top], [x + 8, G - h - top]], col);
const hChim = (c, x, y) => { if (window.__CHREC) window.__CHREC.push([x + 7, y - 6]); stack(c, x, y, 14, 22, '#9a4a36', 3); };
const hBay = (c, x, G, w, h, o = {}) => {   // square bay with a little hipped roof
  const top = G - h; c.fillStyle = o.wall || '#f4f2ec'; c.fillRect(x, top, w, h); c.strokeStyle = LINE; c.lineWidth = .4; c.strokeRect(x, top, w, h);
  hWin(c, x + 2, top + 2, w - 4, h - 8, { inner: o.inner }); if (o.base) brick(c, x, G - 5, w, 5, o.base); else rect(c, '#dcd6c8', x, G - 5, w, 5);
  slate(c, [[x - 2.4, top], [x + w + 2.4, top], [x + w - 3, top - 6], [x + 3, top - 6]], o.roof || '#4a3e38'); };
const hWall = (c, x, G, w, hedge) => { brick(c, x, G - 9, w, 9, '#b0533c', { bw: 2.4, bh: 1.1 }); rect(c, '#c8c0b0', x - .5, G - 10.2, w + 1, 1.4); if (hedge) { c.fillStyle = '#3f7a34'; c.beginPath(); c.roundRect ? c.roundRect(x + 1, G - 16, w - 2, 7, 2.4) : c.rect(x + 1, G - 16, w - 2, 7); c.fill(); for (let i = 0; i < w * 1.4; i++) { c.beginPath(); c.arc(x + 2 + (i * 7.3) % (w - 4), G - 14.6 + (i * 3.1) % 5, .8, 0, 7); c.fillStyle = i % 3 ? '#4f8f3e' : '#6aaa50'; c.fill(); } } };
const hBin = (c, x, G, col = '#3a3d44') => { c.fillStyle = lg(c, x, 0, x + 8, 0, [[0, shade(col, 1.3)], [1, shade(col, .8)]]); c.fillRect(x, G - 10, 8, 10); rect(c, shade(col, 1.4), x - .6, G - 11.4, 9.2, 1.6); c.beginPath(); c.arc(x + 1.6, G - .8, .9, 0, 7); c.fillStyle = '#141416'; c.fill(); };
const hAerial = (c, x, top) => { rect(c, '#3a3d44', x, top, .8, 22); for (let i = 0; i < 3; i++) rect(c, '#3a3d44', x - 5 + i, top + 2 + i * 3.4, 10.8 - i * 2, .6); };
const hDish = (c, x, y) => { c.fillStyle = lg(c, x - 3, y - 4, x + 3, y + 4, [[0, '#e4e8ec'], [1, '#9aa0a8']]); c.beginPath(); c.ellipse(x, y, 3, 4, -.3, 0, 7); c.fill(); rect(c, '#5a5e66', x + 1.6, y - .4, 3, .8); };
const hPipe = (c, x, top, G) => { c.fillStyle = lg(c, x, 0, x + 1.6, 0, [[0, '#1a1a1e'], [.5, '#4a4c52'], [1, '#1a1a1e']]); c.fillRect(x, top, 1.6, G - top); };
const hBrick = (c, x, y, w, h, col) => { brick(c, x, y, w, h, col); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, y, w, h); };

HH.terrace = (c, x, G) => { c.save(); c.lineJoin = 'round';
  for (let k = 0; k < 2; k++) { const hx = x + k * 60, col = k ? '#c25a46' : '#a8503a';
    hBrick(c, hx, G - 70, 60, 70, col); rect(c, '#ece4d2', hx, G - 44, 60, 1.6);
    hWin(c, hx + 8, G - 64, 16, 18, { inner: k ? 'nets' : 'curtain' }); hWin(c, hx + 34, G - 64, 16, 18, { inner: 'blind' });
    hBay(c, hx + 6, G, 26, 26, { inner: 'nets', base: col }); slate(c, [[hx + 36, G - 28], [hx + 56, G - 28], [hx + 53, G - 33], [hx + 39, G - 33]], '#4a3e38'); hDoor(c, hx + 40, G, k ? '#2f4fa8' : '#f4f2ec'); }
  hPipe(c, x + 59, G - 70, G); hRoof(c, x, G, 120, 70, 18); hChim(c, x + 53, G - 106); hAerial(c, x + 22, G - 126); hDish(c, x + 112, G - 58);
  hWall(c, x, G, 28, true); hWall(c, x + 60, G, 28); hBin(c, x + 102, G, '#2f6f3a'); c.restore(); };
HH.pebble = (c, x, G) => { c.save(); c.lineJoin = 'round'; const PB = '#ece3cf';
  c.fillStyle = PB; c.fillRect(x, G - 72, 70, 72); for (let i = 0; i < 700; i++) { c.beginPath(); c.arc(x + (i * 17.31) % 70, G - 72 + (i * 13.7) % 64, .45, 0, 7); c.fillStyle = ['#d8cdb4', '#c4b89c', '#f6f0e0', '#b8ac94'][i % 4]; c.fill(); } c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 72, 70, 72);
  brick(c, x, G - 8, 70, 8, '#3a3a3e'); hRoof(c, x, G, 70, 72, 14); hChim(c, x + 50, G - 102);
  hWin(c, x + 6, G - 66, 32, 22, { inner: 'nets' }); hDish(c, x + 24, G - 40); hBay(c, x + 4, G - 8, 34, 28, { inner: 'blind' });
  hWin(c, x + 46, G - 66, 14, 16); slate(c, [[x + 43, G - 36], [x + 65, G - 36], [x + 62, G - 41], [x + 46, G - 41]], '#4a3e38'); hDoor(c, x + 48, G - 8, '#8a1d2a'); rect(c, '#bdb7aa', x + 44, G - 8, 20, 3); c.restore(); };
// 1930s semi (Leagrave Road): render upper, brick lower, two-storey bay under a tile-hung gable, side porch with a lean-to roof
HH.semi = (c, x, G) => { c.save(); c.lineJoin = 'round';
  c.fillStyle = lg(c, x, 0, x + 90, 0, [[0, '#ead09a'], [1, '#d8b878']]); c.fillRect(x, G - 70, 90, 70); for (let i = 0; i < 260; i++) rect(c, 'rgba(160,120,60,.25)', x + (i * 23.7) % 88, G - 68 + (i * 11.3) % 44, .5, .5);
  hBrick(c, x, G - 26, 90, 26, '#b0533c'); slate(c, [[x - 3, G - 70], [x + 93, G - 70], [x + 80, G - 90], [x + 10, G - 90]], '#5a4e48');
  poly(c, '#d8b070', [[x + 3, G - 70], [x + 22, G - 106], [x + 41, G - 70]], LINE, .4);
  c.save(); c.beginPath(); c.moveTo(x + 5, G - 70); c.lineTo(x + 22, G - 103); c.lineTo(x + 39, G - 70); c.closePath(); c.clip(); for (let r = 0; r < 18; r++) for (let i = 0; i < 20; i++) { c.beginPath(); c.arc(x + 4 + i * 1.8 + (r % 2) * .9, G - 71 + -r * 1.9, .95, 0, Math.PI); c.fillStyle = (i + r) % 5 ? '#b8603e' : '#c8724a'; c.fill(); } c.restore();
  line(c, '#f4f2ec', 1, [[x + 3, G - 70], [x + 22, G - 106], [x + 41, G - 70]]);
  c.fillStyle = '#f4f2ec'; c.fillRect(x + 6, G - 68, 32, 26); hWin(c, x + 7, G - 66, 30, 22, { inner: 'nets' }); hBay(c, x + 6, G - 2, 32, 24, { inner: 'curtain', cc: '#7a4a6a', base: '#b0533c' });
  hWin(c, x + 50, G - 64, 30, 18, { inner: 'blind' }); hBrick(c, x + 44, G - 34, 46, 34, '#b0533c'); slate(c, [[x + 42, G - 34], [x + 92, G - 34], [x + 88, G - 41], [x + 46, G - 41]], '#5a4e48');
  hDoor(c, x + 50, G, '#c8892a'); hWin(c, x + 68, G - 28, 16, 14, { top: false }); hChim(c, x + 60, G - 108); hAerial(c, x + 67, G - 128); hPipe(c, x + 88, G - 70, G - 34); c.restore(); };
HH.render = (c, x, G) => { c.save(); c.lineJoin = 'round';
  c.fillStyle = lg(c, x, 0, x + 70, 0, [[0, '#f6f0e6'], [1, '#e4dccc']]); c.fillRect(x, G - 70, 70, 70); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(x, G - 70, 70, 70); brick(c, x, G - 6, 70, 6, '#3a3a3e');
  hRoof(c, x, G, 70, 70, 12, '#6a5a50'); hChim(c, x + 8, G - 98);
  hWin(c, x + 6, G - 64, 34, 20, { inner: 'blind' }); hBay(c, x + 6, G - 6, 34, 26, { inner: 'nets', roof: '#3a3d44' });
  hWin(c, x + 48, G - 64, 14, 14); slate(c, [[x + 45, G - 34], [x + 67, G - 34], [x + 64, G - 39], [x + 48, G - 39]], '#3a3d44'); hDoor(c, x + 50, G - 6, '#3a3d44'); rect(c, '#2a2c30', x + 52.6, G - 25, 3, 3);
  c.fillStyle = '#4a6a3a'; c.beginPath(); c.arc(x + 43, G - 9, 3.6, 0, 7); c.fill(); rect(c, '#7a5a3a', x + 41, G - 7, 4, 4); hBin(c, x + 62, G); c.restore(); };
const hTerr = (wall, roof, door, n = 4, painted) => (c, x, G) => { c.save(); c.lineJoin = 'round'; const inns = ['nets', 'blind', 'curtain', 'nets'];
  for (let k = 0; k < n; k++) { const hx = x + k * 58, col = painted ? wall[k % wall.length] : k % 2 ? shade(wall, .94) : wall;
    if (painted) { c.fillStyle = lg(c, hx, 0, hx + 58, 0, [[0, shade(col, 1.03)], [1, shade(col, .94)]]); c.fillRect(hx, G - 66, 58, 66); c.strokeStyle = LINE; c.lineWidth = .45; c.strokeRect(hx, G - 66, 58, 66); brick(c, hx, G - 6, 58, 6, '#8a8680'); } else hBrick(c, hx, G - 66, 58, 66, col);
    rect(c, '#ece4d2', hx, G - 40, 58, 1.6);
    hWin(c, hx + 7, G - 60, 16, 16, { inner: inns[(k + 1) % 4] }); hWin(c, hx + 33, G - 60, 16, 16, { inner: inns[(k + 2) % 4], cc: ['#b8484a', '#3a6a8a', '#7a6a3a'][k % 3] });
    hBay(c, hx + 5, G, 26, 26, { inner: inns[k % 4], base: painted ? null : col }); slate(c, [[hx + 35, G - 28], [hx + 55, G - 28], [hx + 52, G - 33], [hx + 38, G - 33]], roof);
    hDoor(c, hx + 38, G, door[k % door.length]); hWall(c, hx, G, 26, k % 2 === 0); if (k % 3 === 1) hDish(c, hx + 52, G - 50); if (k) hPipe(c, hx - .8, G - 66, G); }
  hRoof(c, x, G, n * 58, 66, 16, roof);
  for (let k = 1; k < n; k++) if (n < 4 || k % 2) hChim(c, x + k * 58 - 7, G - 100);   // on the party walls
  hAerial(c, x + 63, G - 120); hBin(c, x + n * 58 - 12, G, '#2f6f3a'); c.restore(); };
HH.rowGrey = hTerr('#9a9a96', '#3e4248', ['#2f4fa8', '#f4f2ec', '#8a1d2a']);
HH.rowYellow = hTerr('#d9b86a', '#7a3e30', ['#f4f2ec', '#2f6f3a', '#1a1a1e']);
HH.rowBrown = hTerr('#7a5038', '#4a5a52', ['#c8892a', '#f4f2ec', '#2f4fa8'], 3);
HH.rowRed = hTerr('#b0533c', '#3e3a38', ['#f4f2ec', '#1a1a1e', '#2f6f3a'], 3);
HH.rowPainted = hTerr(['#f4ead6', '#d4e4ea', '#efdcd8'], '#4a4e56', ['#2f4fa8', '#8a1d2a', '#2f6f3a'], 3, true);
HH.pairRed = hTerr('#9a4a36', '#4a3e38', ['#f4f2ec', '#c8892a'], 2);
HH.bungalow = (c, x, G) => { c.save(); c.lineJoin = 'round';
  hBrick(c, x, G - 34, 84, 34, '#b8644a'); slate(c, [[x - 4, G - 34], [x + 88, G - 34], [x + 70, G - 56], [x + 14, G - 56]], '#5a4e48'); hChim(c, x + 56, G - 72);
  hWin(c, x + 6, G - 28, 22, 16, { inner: 'nets' }); slate(c, [[x + 33, G - 28], [x + 51, G - 28], [x + 48, G - 32], [x + 36, G - 32]], '#5a4e48'); hDoor(c, x + 36, G, '#f4f2ec'); hWin(c, x + 56, G - 28, 22, 16, { inner: 'blind' }); hWall(c, x + 50, G, 30, true); c.restore(); };
HH.newbuild = (c, x, G) => { c.save(); c.lineJoin = 'round';
  hBrick(c, x, G - 74, 72, 74, '#c27a52'); ribbed(c, x + 40, G - 74, 32, 30, '#6e747c', 2.4);
  slate(c, [[x - 3, G - 74], [x + 75, G - 74], [x + 62, G - 92], [x + 10, G - 92]], '#3e4248');
  hWin(c, x + 8, G - 66, 22, 18, { frame: '#f4f2ec', inner: 'blind' }); hWin(c, x + 46, G - 66, 18, 16, { frame: '#2a2c30' }); hWin(c, x + 8, G - 34, 22, 20, { frame: '#f4f2ec', inner: 'nets' });
  rect(c, '#3a3d44', x + 42, G - 36, 26, 2.6, '#1a1c20', .3); hDoor(c, x + 48, G, '#3a3d44'); rect(c, '#2a2c30', x + 62, G - 26, 4, 6); hBin(c, x + 64, G); hPipe(c, x + 70, G - 74, G); c.restore(); };
window.HOUSES_HD = HH;
})();
