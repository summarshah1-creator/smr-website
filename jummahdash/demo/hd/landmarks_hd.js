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
})();
