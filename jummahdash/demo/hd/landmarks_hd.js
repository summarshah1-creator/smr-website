/* Jummah Dash HD buildings: the same Luton landmarks as Flappy Kabootar (same footprint, layout, colours and every
   owner rule), redrawn with roughly 2x the detail (features down to half a unit) from the owner's reference photos.
   HD[key](c, x, G) draws in Flappy's unscaled units; SCALE and the moving parts (LM_ANIM) are applied by the game. */
(function () {
const HD = window.LANDMARKS_HD = {};
const LINE = '#4a4338';
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
  for (let i = 0; i < 4; i++) { const cx = x + 82 + i * 11;
    rect(c, ST, cx - .8, G - 51.6, 5.6, 2, LINE, .3);                                       // capital
    c.fillStyle = lg(c, cx, 0, cx + 4, 0, [[0, '#d8cfba'], [.4, '#fbf8f1'], [1, '#cfc5ae']]); c.fillRect(cx, G - 49.6, 4, 40.6); c.strokeStyle = LINE; c.lineWidth = .35; c.strokeRect(cx, G - 49.6, 4, 40.6);
    for (const f of [1, 2, 3]) line(c, 'rgba(120,105,80,.35)', .25, [[cx + f, G - 49], [cx + f, G - 9.4]]);
    rect(c, ST, cx - .8, G - 9, 5.6, 2, LINE, .3); }
  rect(c, '#2e2924', x + 93, G - 31, 14, 24); c.beginPath(); c.arc(x + 100, G - 31, 7, Math.PI, 0); c.fillStyle = '#2e2924'; c.fill();
  c.beginPath(); c.arc(x + 100, G - 31, 6, Math.PI, 0); c.fillStyle = lg(c, x + 94, G - 37, x + 106, G - 31, [[0, '#cfe0ee'], [1, '#55718a']]); c.fill();
  for (let i = 1; i < 5; i++) { const a = Math.PI + i * Math.PI / 5; line(c, '#f4f2ec', .3, [[x + 100, G - 31], [x + 100 + Math.cos(a) * 6, G - 31 + Math.sin(a) * 6]]); }
  c.fillStyle = lg(c, x + 94, 0, x + 106, 0, [[0, '#7a3f22'], [.5, '#9a5530'], [1, '#6c381e']]); c.fillRect(x + 94, G - 30, 12, 23);
  c.strokeStyle = 'rgba(40,20,10,.6)'; c.lineWidth = .35; [[95, -29], [101, -29], [95, -18], [101, -18]].forEach(([dx, dy]) => c.strokeRect(x + dx, G + dy, 4, 9)); line(c, '#3a1e10', .5, [[x + 100, G - 30], [x + 100, G - 7]]);
  rect(c, '#d9b44a', x + 98.6, G - 19, .8, 1.6);
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
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.ellipse(X + 192 + i * 9, G - 100, 2.5, 42.5 - Math.abs(i) * 2.5, 0, Math.PI, 2 * Math.PI); c.strokeStyle = 'rgba(40,70,40,.22)'; c.lineWidth = .3; c.stroke(); }
  rect(c, '#d7c79a', X + 189, G - 104, 6, 4, LINE, .3);
  rect(c, '#e8e0cf', X + 191.3, G - 156, 1.4, 14); c.beginPath(); c.arc(X + 192, G - 159, 3, 0, 7); c.fillStyle = '#d9b44a'; c.fill(); c.beginPath(); c.arc(X + 193.2, G - 159.6, 2.5, 0, 7); c.fillStyle = '#9cc4e8'; c.fill();
  // front block (continues left over the widening) with tall arched recesses
  brick(c, x, G - 120, 50 + TW, 120, B); c.strokeStyle = LINE; c.lineWidth = .5; c.strokeRect(x + .25, G - 120, 50 + TW - .5, 120);
  rect(c, shade(B, 1.15), x, G - 121, 50 + TW, 2.6, LINE, .35);
  for (let rx = x + 6; rx + 14 < X + TW - 4; rx += 19.5) { if (rx > X + 46 && rx < X + 74) continue;   // keep the entrance clear
    c.beginPath(); c.moveTo(rx, G - 26); c.lineTo(rx, G - 92); c.arc(rx + 7, G - 92, 7, Math.PI, 0); c.lineTo(rx + 14, G - 26); c.closePath(); c.fillStyle = 'rgba(60,15,5,.30)'; c.fill();
    c.save(); c.clip(); brick(c, rx, G - 99, 14, 74, shade(B, .86)); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(rx, G - 99, 2, 74); c.restore();
    line(c, 'rgba(255,220,200,.35)', .4, [[rx + 14.2, G - 92], [rx + 14.2, G - 26]]); rect(c, shade(B, .72), rx - .5, G - 26, 15, 1.4); }
  // green name board with the two round plaques either side (as on the building)
  rect(c, '#1d5a43', X + 3, G - 118, 116, 17, '#0e2e22', .5); rect(c, 'rgba(255,255,255,.12)', X + 3.5, G - 117.5, 115, 1);
  txt(c, 'مرکزی جامع مسجد غوثیہ', X + 61, G - 113.6, 6.2, '#f4f2ec', { f: 'Amiri', rtl: 1 });
  txt(c, 'Luton Central Mosque', X + 61, G - 106.4, 5.6, '#f4f2ec', { f: 'Mont, sans-serif' });
  for (const px of [X - 9, X + 123]) { rect(c, '#1d5a43', px, G - 117, 8, 10, '#0e2e22', .4); txt(c, 'الله', px + 4, G - 112, 4, '#f4f2ec', { f: 'Amiri', rtl: 1 }); }
  // arched windows in the front block
  for (const wx of [x + 18, X + 6, X + 104]) archWin(c, wx, G - 50, 12, 28, { frame: '#efe9dc', g0: '#d8e6e0', g1: '#9db5ab', g2: '#5b7268' });
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
  tree(c, x + 24, G, 1.25); person(c, x + 122, G, '#f4f2ec', '#f4f2ec', '#c58c5c', '#f4f2ec'); person(c, x + 130, G, '#3a6e5a', '#2a2a33', '#c58c5c', '#f4f2ec'); person(c, x + 246, G, '#2a2a33', '#f4f2ec', '#9a6a44', '#1a1a1e');
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
    'GALAXY'.split('').forEach((ch, i) => txt(c, ch, x + 11 + i * 20, G - 83, 11, '#ffffff', { f: 'Oswald, sans-serif', w: 600, sh: 'rgba(80,90,100,.55)' }));
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
  txt(c, 'G A L A X Y', x + 55, G - 126, 9.6, '#ffffff', { f: 'Oswald, sans-serif', w: 600, sh: 'rgba(90,80,65,.7)' }); rect(c, '#f4f2ee', x + 100, G - 131, .8, 10); txt(c, 'G A L A X Y', x + 146, G - 126, 9.6, '#ffffff', { f: 'Oswald, sans-serif', w: 600, sh: 'rgba(90,80,65,.7)' });
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
  tree(c, x + 186, G, 1.2); person(c, x + 22, G, '#d8262f'); person(c, x + 170, G, '#6a4c93');
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
  rect(c, '#bcb6a9', x - 6, G - 3, 452, 3); person(c, x + 200, G, '#1a1a1e', '#1a1a1e', '#a86c44', '#f08a1c'); person(c, x + 212, G, '#2a2a33', '#9aa3ad', '#c58c5c', '#1f3f8a');
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
})();
