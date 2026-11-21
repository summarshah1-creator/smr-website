/* Luton landmarks, front-on pixel art. One style: flat colours, 1px dark outline,
   light from the left, same ground line. Each draws with its base on y = G and returns its width. */
(function () {
const OUT = '#1b1a24';
// RK = the scale a landmark is being drawn at (SCALE below). Rects snap to whole screen pixels at that scale, and 1px lines stay 1px, so resized buildings stay crisp.
let RK = 1;
const R = (c, col, x, y, w, h) => { c.fillStyle = col; if (RK === 1) { c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); return; }
  const x0 = Math.round(x * RK), y0 = Math.round(y * RK); let ww = Math.round((x + w) * RK) - x0, hh = Math.round((y + h) * RK) - y0; if (w > 0 && ww < 1) ww = 1; if (h > 0 && hh < 1) hh = 1; c.fillRect(x0 / RK, y0 / RK, ww / RK, hh / RK); };
const SH = (col, k) => { const n = parseInt(col.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.max(0, Math.min(255, Math.round(r * k))); g = Math.max(0, Math.min(255, Math.round(g * k))); b = Math.max(0, Math.min(255, Math.round(b * k))); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); };
const BOX = (c, col, x, y, w, h) => { R(c, OUT, x - 1, y - 1, w + 2, h + 2); R(c, col, x, y, w, h); if (col[0] === '#' && w > 6 && h > 6) { R(c, SH(col, 1.08), x, y, 1, h); R(c, SH(col, 1.1), x, y, w, 1); R(c, SH(col, .86), x + w - 2, y + 1, 2, h - 1); } };
const P = (c, col, pts, out) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = col; c.fill(); if (out) { c.strokeStyle = OUT; c.lineWidth = 1 / RK; c.stroke(); } };
const CIRC = (c, col, cx, cy, r) => { for (let dy = -r; dy <= r; dy++) { const dx = Math.round(Math.sqrt(r * r - dy * dy)); R(c, col, cx - dx, cy + dy, dx * 2 + 1, 1); } };
const T = (c, s, x, y, px, col, align = 'center', bold = true) => { c.font = `${bold ? 700 : 400} ${px}px Silk`; c.textAlign = align; c.textBaseline = 'top'; c.fillStyle = col; c.fillText(s, x, y); };
const TS = (c, s, x, y, px, col, sh, align) => { T(c, s, x + 1, y + 1, px, sh, align); T(c, s, x, y, px, col, align); };
const WIN = (c, x, y, w, h, frame = '#f4f2ec', glass = '#7fa7c4') => { BOX(c, frame, x, y, w, h); R(c, glass, x + 2, y + 2, w - 4, h - 4); R(c, frame, x + 2, y + Math.floor(h / 2), w - 4, 1); R(c, 'rgba(255,255,255,.5)', x + 3, y + 3, 2, 2); };
const BRICK = (c, x, y, w, h, base = '#a8503a', line = '#94452f') => { R(c, base, x, y, w, h); let row = 0; for (let yy = y + 3; yy < y + h; yy += 4, row++) { R(c, line, x, yy, w, 1); for (let xx = x + (row % 2 ? 4 : 0); xx < x + w; xx += 8) R(c, line, xx, yy - 3, 1, 3); } for (let i = 0; i < w * h / 90; i++) { const rx = x + ((i * 37) % w), ry = y + ((i * 53) % h); R(c, SH(base, (i % 3) ? .92 : 1.08), rx, ry - (ry - y) % 4, Math.min(3, x + w - rx), 3); } R(c, 'rgba(0,0,0,.12)', x + w - 4, y, 4, h); };
const GLASS = (c, x, y, w, h, base = '#5f8fb0', cols = 4, rows = 3) => { BOX(c, '#2a333d', x, y, w, h); const pw = (w - 1) / cols, ph = (h - 1) / rows; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const px = x + 1 + i * pw, py = y + 1 + j * ph; R(c, (i + j) % 2 ? base : SH(base, 1.1), px, py, pw - 1, ph - 1); } c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = 'rgba(255,255,255,.18)'; for (let k = -h; k < w; k += 26) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h * .6, y); c.lineTo(x + k + h * .6 + 6, y); c.lineTo(x + k + 6, y + h); c.fill(); } c.restore(); };
const PERSON0 = (c, x, G, top = '#3f6fb5', leg = '#2a2a33', skin = '#c58c5c', head = null) => { R(c, OUT, x - 1, G - 15, 6, 15); R(c, leg, x, G - 6, 4, 6); R(c, OUT, x + 1, G - 6, 1, 6); R(c, top, x, G - 11, 4, 5); R(c, skin, x + 1, G - 14, 2, 3); if (head) R(c, head, x, G - 15, 4, 3); };
const PERSON = () => {}; // no people in front of the buildings (owner rule); PERSON0 is only used for the pedalo riders
const LAMP = (c, x, G, h = 60) => { R(c, '#3a3d44', x, G - h, 2, h); R(c, '#3a3d44', x - 6, G - h, 8, 2); R(c, '#f7e7a1', x - 6, G - h + 2, 4, 2); };
const BOLL = (c, x, G) => { BOX(c, '#c9cdd2', x, G - 8, 3, 8); };
const BIN = (c, x, G, col = '#3a3d44') => { BOX(c, col, x, G - 10, 8, 10); R(c, SH(col, 1.3), x, G - 10, 8, 2); };
const CAR = (c, x, G, col = '#2b3a5a') => { BOX(c, col, x, G - 10, 34, 7); P(c, col, [[x + 6, G - 10], [x + 10, G - 16], [x + 24, G - 16], [x + 29, G - 10]], true); R(c, '#9fc1d8', x + 11, G - 15, 6, 4); R(c, '#9fc1d8', x + 19, G - 15, 6, 4); CIRC(c, OUT, x + 8, G - 3, 3); CIRC(c, OUT, x + 26, G - 3, 3); CIRC(c, '#888', x + 8, G - 3, 1); CIRC(c, '#888', x + 26, G - 3, 1); };
const FLOWERS = (c, x, G, w) => { BOX(c, '#4a4a4f', x, G - 5, w, 5); for (let i = 0; i < w; i += 3) { R(c, '#3f7d33', x + i, G - 8, 2, 3); R(c, i % 2 ? '#e03a3a' : '#f2c14e', x + i, G - 9, 2, 2); } };
// a tree crown made of overlapping lumps (not a perfect ball): the shape is picked from the position, so neighbouring trees differ (round, tall, spreading, uneven)
const CROWN_K = [
  [[0, .05, .78], [-.48, .22, .5], [.48, .22, .5], [-.32, -.4, .5], [.32, -.4, .5], [0, -.58, .42]],
  [[0, .3, .58], [0, -.15, .62], [0, -.62, .42], [-.32, .12, .44], [.32, -.02, .44]],
  [[-.52, .14, .52], [.52, .14, .52], [0, -.06, .66], [-.26, -.48, .44], [.3, -.44, .46], [.78, .3, .3], [-.78, .3, .3]],
  [[0, 0, .72], [-.56, .16, .48], [.5, -.12, .52], [-.16, -.6, .44], [.36, .42, .42]]];
const CROWN = (c, cx, cy, r, dk, col, seed, outline = true) => { const B = CROWN_K[Math.abs(Math.round(seed)) % 4], rr = v => Math.max(2, Math.round(v * r));
  if (outline) B.forEach(([dx, dy, k]) => CIRC(c, OUT, Math.round(cx + dx * r), Math.round(cy + dy * r), rr(k) + 1));
  B.forEach(([dx, dy, k]) => CIRC(c, dk, Math.round(cx + dx * r), Math.round(cy + dy * r), rr(k)));
  B.forEach(([dx, dy, k], i) => { if (dy > .25) return; CIRC(c, col, Math.round(cx + dx * r - r * .12), Math.round(cy + dy * r - r * .14), rr(k * .72)); });
  const hi = SH(col, 1.18); B.slice(0, 3).forEach(([dx, dy, k]) => { if (dy > .2) return; CIRC(c, hi, Math.round(cx + dx * r - r * .26), Math.round(cy + dy * r - r * .3), rr(k * .3)); }); };
const TREE = (c, x, G, s = 1, col = '#4f8a3c', dk = '#3a6b2c') => { R(c, '#5a3d2a', x - 2, G - 22 * s, 4, 22 * s); CROWN(c, x, G - 34 * s, 17 * s, dk, col, Math.round(x / 7)); };
const PLANE = (c, x, y, s = 1) => { const g = '#e9edf2', d = '#9aa3ad'; R(c, OUT, x - 1, y - 1, 46 * s + 2, 8 * s + 2); R(c, g, x, y, 46 * s, 8 * s); R(c, d, x, y + 6 * s, 46 * s, 2 * s); P(c, g, [[x + 46 * s, y], [x + 54 * s, y + 4 * s], [x + 46 * s, y + 8 * s]], true); P(c, '#d64545', [[x, y], [x - 4 * s, y - 12 * s], [x + 8 * s, y - 12 * s], [x + 12 * s, y]], true); P(c, d, [[x + 18 * s, y + 4 * s], [x + 30 * s, y + 4 * s], [x + 20 * s, y + 18 * s], [x + 14 * s, y + 18 * s]], true); for (let i = 0; i < 6; i++) R(c, '#3d6584', x + 16 * s + i * 5 * s, y + 2 * s, 2 * s, 2 * s); };

const L = {};

L.galaxy = { n: 'The Galaxy', w: 200, d(c, x, G) {
  R(c, '#d9c3ac', x, G - 44, 200, 44); for (let j = 0; j < 6; j++) R(c, '#5a5f6e', x, G - 40 + j * 7, 200, 1); R(c, '#4a4f5c', x, G - 8, 200, 8); R(c, OUT, x - 1, G - 45, 202, 1); BOX(c, '#9aa1a8', x + 70, G - 36, 60, 36); for (let i = 0; i < 9; i++) R(c, '#7f868d', x + 72, G - 33 + i * 4, 56, 1);
  BOX(c, '#a89c8c', x + 4, G - 140, 192, 96); for (let i = 16; i < 192; i += 16) R(c, '#968a7a', x + 4 + i, G - 140, 1, 96); R(c, '#b9ae9f', x + 4, G - 140, 192, 4);
  BOX(c, '#ddd4c4', x - 2, G - 150, 204, 10); R(c, '#c7bdab', x - 2, G - 143, 204, 3);
  { c.font = '700 12px Silk'; const tw = Math.ceil(c.measureText('GALAXY').width), s2 = x + 193 - tw, dv = s2 - 4; /* second GALAXY ends at the right edge */
    TS(c, 'GALAXY', dv - 4, G - 126, 12, '#ffffff', '#6f6557', 'right'); R(c, '#f4f2ee', dv, G - 131, 1, 20); R(c, '#6f6557', dv + 1, G - 131, 1, 20); TS(c, 'GALAXY', s2, G - 126, 12, '#ffffff', '#6f6557', 'left'); }
  const bb = [[x + 14, 20, '#1f8fd6'], [x + 38, 28, '#d8262f'], [x + 70, 34, '#ffffff'], [x + 112, 36, '#f2f0f0'], [x + 154, 32, '#2a2a2e']];
  bb.forEach(([bx, w, col]) => BOX(c, col, bx, G - 92, w, 36));
  CIRC(c, '#8ad646', x + 24, G - 80, 5); CIRC(c, '#1f8fd6', x + 24, G - 80, 3); R(c, '#8ad646', x + 26, G - 80, 2, 6); R(c, '#ffffff', x + 18, G - 70, 12, 1); R(c, '#ffffff', x + 18, G - 67, 10, 1); R(c, '#ffffff', x + 18, G - 64, 12, 1);
  CIRC(c, '#ffffff', x + 48, G - 76, 4); CIRC(c, '#ffffff', x + 56, G - 76, 4); P(c, '#ffffff', [[x + 43, G - 74], [x + 61, G - 74], [x + 52, G - 64]]); CIRC(c, '#1aa34a', x + 87, G - 74, 14); CIRC(c, '#f4c430', x + 87, G - 74, 10); CIRC(c, '#2f8fdc', x + 87, G - 74, 6);
  T(c, 'ten', x + 130, G - 86, 8, '#e0558c', 'center', false); CIRC(c, '#e0558c', x + 130, G - 68, 7); CIRC(c, '#f2f0f0', x + 130, G - 68, 5); R(c, '#e0558c', x + 129, G - 72, 2, 8); R(c, '#d8262f', x + 160, G - 78, 6, 6); 
  TREE(c, x + 186, G, 1.2);
} };

L.chaiiwala = { n: 'Chaiiwala and Nando\'s', w: 290, d(c, x, G) {
  // shared sweeping roof over both units
  P(c, '#3a3d44', [[x - 8, G - 112], [x + 296, G - 112], [x + 288, G - 124], [x + 4, G - 124]], true); R(c, '#c9ced4', x - 8, G - 112, 304, 2); for (let i = 0; i < 3; i++) R(c, '#2e3138', x + 6 + i * 2, G - 121 + i * 3, 280 - i * 4, 1);
  // Chaiiwala unit (left, narrower; sign lined up with the Nando's sign)
  BOX(c, '#b9c0c8', x, G - 110, 130, 110);
  BOX(c, '#1d2735', x + 5, G - 106, 120, 34); R(c, '#2a3648', x + 5, G - 106, 120, 2);
  CIRC(c, '#ffffff', x + 20, G - 89, 8); CIRC(c, '#1d2735', x + 20, G - 89, 6); R(c, '#ffffff', x + 17, G - 91, 6, 5); R(c, '#ffffff', x + 19, G - 94, 2, 2);
  TS(c, 'chaiiwala', x + 76, G - 96, 13, '#ffffff', '#0e141c');
  P(c, '#d7dce1', [[x + 3, G - 72], [x + 127, G - 72], [x + 122, G - 66], [x + 8, G - 66]], true);
  // dark glass frontage: warm hanging bulbs, arched mirrors and booths inside, glass door
  BOX(c, '#15191f', x + 5, G - 66, 120, 66); R(c, '#1d232b', x + 6, G - 65, 118, 64);
  for (let i = 0; i < 4; i++) { const ax = x + 14 + i * 28; c.strokeStyle = '#8a6a3a'; c.lineWidth = 1 / RK; c.beginPath(); c.moveTo(ax, G - 22); c.lineTo(ax, G - 40); c.arc(ax + 9, G - 40, 9, Math.PI, 0); c.lineTo(ax + 18, G - 22); c.stroke(); R(c, '#2a2f38', ax + 1, G - 40, 16, 18); }
  for (let i = 0; i < 9; i++) { const lx = x + 11 + i * 13, ly = G - 60 + (i % 3) * 4; R(c, '#3a3a3a', lx, G - 65, 1, ly - (G - 65)); R(c, '#ffd27a', lx - 1, ly, 3, 3); R(c, 'rgba(255,200,110,.25)', lx - 3, ly - 1, 7, 6); }
  for (let i = 0; i < 4; i++) { R(c, '#3a2c22', x + 12 + i * 28, G - 14, 14, 3); R(c, '#2a201a', x + 18 + i * 28, G - 11, 2, 11); }
  for (const fx of [x + 36, x + 64, x + 92]) R(c, '#0d1014', fx, G - 66, 2, 66); R(c, '#0d1014', x + 5, G - 46, 120, 1);
  R(c, 'rgba(255,255,255,.12)', x + 8, G - 64, 3, 60); R(c, 'rgba(255,255,255,.12)', x + 70, G - 64, 3, 60);
  BOX(c, '#0d1014', x + 50, G - 40, 26, 40); R(c, '#4a5868', x + 52, G - 38, 22, 38); R(c, '#ffd27a', x + 60, G - 34, 2, 2); R(c, '#9aa3ad', x + 70, G - 22, 1, 8);
  // Nando's unit (right, a little longer)
  c.save(); c.translate(-50, 0);
  BOX(c, '#3a3d44', x + 180, G - 110, 158, 110); R(c, '#4a4e56', x + 180, G - 110, 158, 2);
  for (let i = 0; i < 18; i++) R(c, ['#8a6a4a', '#a58258', '#6e5236', '#9a7650'][i % 4], x + 184 + i * 6, G - 106, 5, 34);
  T(c, "Nando's", x + 238, G - 98, 16, '#7a1418'); T(c, "Nando's", x + 237, G - 99, 16, '#e0262a');
  GLASS(c, x + 184, G - 72, 108, 72, '#6a8aa6', 6, 2); BOX(c, '#2a2c30', x + 196, G - 40, 16, 40); R(c, '#9fc1d8', x + 198, G - 38, 12, 38);
  R(c, '#5a3d2a', x + 232, G - 24, 2, 24); CIRC(c, '#6f8f4a', x + 233, G - 30, 8);
  BOX(c, '#2a2c30', x + 292, G - 110, 46, 110); for (let j = 0; j < 4; j++) R(c, '#34373c', x + 292, G - 82 + j * 22, 46, 1);
  // simple cockerel in a red ring (generic chicken, not a copy of any real logo)
  { const cx = x + 315, cy = G - 88, RC = '#e0262a'; CIRC(c, RC, cx, cy, 15); CIRC(c, '#2a2c30', cx, cy, 13);
    CIRC(c, RC, cx + 1, cy + 1, 6); R(c, RC, cx - 5, cy - 2, 4, 5); CIRC(c, RC, cx - 5, cy - 5, 3);
    R(c, RC, cx - 7, cy - 10, 2, 2); R(c, RC, cx - 5, cy - 11, 2, 3); R(c, RC, cx - 3, cy - 10, 2, 2);
    R(c, '#f2c43a', cx - 10, cy - 5, 2, 2); R(c, '#2a2c30', cx - 6, cy - 6, 1, 1); R(c, RC, cx - 7, cy - 2, 2, 3);
    R(c, RC, cx + 6, cy - 7, 2, 7); R(c, RC, cx + 8, cy - 9, 2, 7); R(c, RC, cx + 10, cy - 6, 2, 5);
    R(c, '#2a2c30', cx - 1, cy + 1, 5, 1); R(c, '#2a2c30', cx, cy - 1, 4, 1);
    R(c, RC, cx - 1, cy + 7, 1, 4); R(c, RC, cx + 3, cy + 7, 1, 4); R(c, RC, cx - 2, cy + 10, 2, 1); R(c, RC, cx + 2, cy + 10, 2, 1); }
  c.restore();
} };

L.periperi = { n: 'Peri-Peri Original', w: 180, d(c, x, G) {
  BOX(c, '#5b5f66', x, G - 50, 64, 50); BOX(c, '#3d4047', x, G - 62, 64, 12);
  WIN(c, x + 6, G - 44, 52, 36, '#4a4e55', '#f3d28a');
  BOX(c, '#6e737b', x + 64, G - 128, 116, 66); WIN(c, x + 74, G - 118, 44, 36, '#4a4e55', '#efe6cf'); WIN(c, x + 126, G - 118, 44, 36, '#4a4e55', '#efe6cf');
  for (const wx of [x + 78, x + 130]) for (let i = 0; i < 6; i++) { R(c, '#c9c0a8', wx + i * 6, G - 108 + (i % 2) * 3, 4, 1); R(c, i % 3 ? '#d84b3c' : '#4caf50', wx + 3 + i * 6, G - 100, 2, 2); }
  P(c, '#5a3a2e', [[x + 58, G - 128], [x + 186, G - 128], [x + 172, G - 146], [x + 72, G - 146]], true); for (let i = 0; i < 4; i++) R(c, '#4a2f25', x + 66 + i * 3, G - 140 + i * 3, 110 - i * 6, 1);
  BRICK(c, x + 150, G - 162, 14, 18); R(c, OUT, x + 149, G - 163, 16, 1);
  BOX(c, '#3d4047', x + 64, G - 64, 116, 14); R(c, '#4a4e55', x + 64, G - 58, 116, 1);
  BOX(c, '#6e737b', x + 64, G - 50, 116, 50);
  for (const wx of [x + 70, x + 124]) { BOX(c, '#3d4047', wx, G - 46, 50, 44); R(c, '#f7e6b8', wx + 2, G - 44, 46, 40); R(c, '#efd79a', wx + 2, G - 44, 46, 10); R(c, '#e6e2d8', wx + 2, G - 18, 46, 14);
    for (let k = 0; k < 4; k++) { R(c, '#1f2228', wx + 4 + k * 11, G - 42, 9, 6); R(c, k % 2 ? '#e0281a' : '#f2c43a', wx + 5 + k * 11, G - 41, 7, 1); R(c, '#ffffff', wx + 5 + k * 11, G - 39, 5, 1); }
    for (let k = 0; k < 3; k++) { const tx = wx + 6 + k * 15; R(c, '#ffffff', tx, G - 16, 10, 2); R(c, '#4a4e55', tx + 4, G - 14, 2, 10); R(c, k % 2 ? '#4caf50' : '#e0281a', tx - 3, G - 18, 3, 14); R(c, k % 2 ? '#4caf50' : '#e0281a', tx + 10, G - 18, 3, 14); }
    R(c, 'rgba(255,255,255,.3)', wx + 4, G - 44, 2, 38); R(c, '#3d4047', wx + 24, G - 44, 1, 40); }
  BOX(c, '#3d4047', x + 118, G - 46, 8, 46);
  BOX(c, '#f4f2ec', x + 92, G - 64, 60, 12); T(c, 'ORIGINAL', x + 122, G - 62, 8, '#e0281a', 'center', true);
  T(c, 'Peri-Peri', x + 122, G - 79, 16, '#ff9d8c'); T(c, 'Peri-Peri', x + 121, G - 80, 16, '#ff2e1f');
} };

L.frasers = { n: 'Frasers Plus Luton', w: 292, d(c, x, G) {
  // TK Maxx block behind on the right: striped cladding, a few dark windows, purple accent tiles, red shop fascia at street level
  const tx = x + 124, tw = 168, th = 112;
  R(c, '#8a9098', tx + 2, G - th - 7, tw - 4, 1); for (let i = 0; i <= 27; i++) R(c, '#8a9098', tx + 2 + i * 6, G - th - 7, 1, 7);
  BOX(c, '#e9e4dc', tx, G - th, tw, th);
  const CL = ['#ece7df', '#d9c6c2', '#c9c0b9', '#f3efe8', '#beb7b1', '#e2cfd0', '#d6d0c8'];
  for (let row = 0, yy = G - th + 3; yy < G - 40; row++, yy += 5) { let xx = tx + 1, k = 0; while (xx < tx + tw - 1) { const len = Math.min(16 + ((row * 31 + k * 17) % 5) * 9, tx + tw - 1 - xx); R(c, CL[(row * 3 + k * 5) % CL.length], xx, yy, len, 4); R(c, '#b8b0a8', xx, yy + 4, len, 1); xx += len; k++; } }
  for (const [px, py] of [[tx + 112, G - 104], [tx + 40, G - 92], [tx + 150, G - 86], [tx + 70, G - 76], [tx + 128, G - 62], [tx + 20, G - 58]]) { R(c, '#6b35b8', px, py, 7, 4); R(c, '#8b5fd6', px, py, 7, 1); }
  const GW = (wx, wy, w, h) => { BOX(c, '#3e6a70', wx, wy, w, h); R(c, '#5d8d92', wx + 1, wy + 1, w - 2, 2); for (let v = wx + 8; v < wx + w - 2; v += 8) R(c, '#2a4a50', v, wy, 1, h); };
  GW(tx + 78, G - 92, 32, 14); GW(tx + 128, G - 98, 34, 22); GW(tx + 56, G - 66, 22, 8); GW(tx + 92, G - 62, 34, 12); GW(tx + 132, G - 64, 26, 14);
  c.font = '700 12px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#ffffff'; c.fillText('TK MAXX', tx + 52, G - th + 7); c.fillStyle = '#5a5653'; c.fillText('TK MAXX', tx + 51, G - th + 6);
  R(c, '#8e1f2a', tx, G - 40, tw, 6); R(c, '#b3262f', tx + 60, G - 40, tw - 60, 6); R(c, '#e8c9b0', tx + 6, G - 38, 18, 2);
  BOX(c, '#2a3038', tx, G - 34, tw, 34); for (let i = 0; i < 6; i++) { const wx = tx + 3 + i * 27; R(c, '#4d5c66', wx, G - 31, 24, 28); R(c, '#6d808c', wx + 2, G - 29, 4, 24); R(c, '#e7c97a', wx + 6, G - 22, 12, 1); }
  for (let i = 0; i <= 6; i++) R(c, '#d9d3c9', tx + i * 27, G - 34, 2, 34);
  // Frasers Plus: tall glass cube in front on the left
  const fw = 128, fh = 152;
  BOX(c, '#22333a', x, G - fh, fw, fh); R(c, '#7b8a92', x - 1, G - fh - 3, fw + 2, 3);
  const rows = 10, cols = 8, ph = (fh - 2) / rows, pw = (fw - 2) / cols;
  const tint = r => r < 3 ? ['#86bfd8', '#a3d0e3', '#73aecb'] : r < 6 ? ['#3b2f66', '#46397a', '#352b5c'] : ['#3f7f86', '#4f9196', '#3a7278'];
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const T3 = tint(r); R(c, T3[(r * 2 + q * 3) % 3], x + 1 + q * pw, G - fh + 1 + r * ph, pw - 1, ph - 1); }
  for (let k = 0; k < 9; k++) R(c, 'rgba(255,255,255,.18)', x + 8 + k * 13, G - fh + 4 + k * 4, 6, 2);
  // sign on the purple glass: small rainbow tile + FRASERSPLUS / LUTON in white
  { const lx = x + 14, ly = G - 104; R(c, '#1b1a24', lx - 1, ly - 1, 14, 14); const RB = ['#e8417a', '#f08a2a', '#f2d23a', '#3fc27a', '#3a8fe0', '#8a4fd8']; for (let i = 0; i < 6; i++) R(c, RB[i], lx + i * 2, ly, 2, 12); R(c, '#ffffff', lx + 5, ly + 3, 2, 6); R(c, '#ffffff', lx + 3, ly + 5, 6, 2); }
  c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#ffffff'; let fz = 11; do { c.font = `700 ${fz}px Silk`; } while (c.measureText('FRASERSPLUS').width > 90 && --fz > 6); c.fillText('FRASERSPLUS', x + 31, G - 105);
  c.font = '700 8px Silk'; c.textAlign = 'right'; c.fillText('LUTON', x + 121, G - 92);
  // blue entrance canopy, glass doors, bollards
  BOX(c, '#1f4fa8', x + 6, G - 36, fw - 12, 9); c.font = '6px Silk'; c.textAlign = 'center'; c.fillStyle = '#ffffff'; c.fillText('FRASERSPLUS LUTON', x + 64, G - 35);
  BOX(c, '#26313a', x + 8, G - 27, fw - 16, 27); for (let i = 0; i < 7; i++) { R(c, '#8fb7c6', x + 10 + i * 16, G - 25, 14, 25); R(c, '#b8d6e0', x + 11 + i * 16, G - 24, 2, 22); }
  for (let i = 0; i < 9; i++) { R(c, OUT, x - 6 + i * 18, G - 10, 3, 10); R(c, '#4a505c', x - 6 + i * 18, G - 10, 3, 1); }
  // trees in front of TK Maxx
  TREE(c, tx + 24, G, .95, '#6aa83a', '#4f8a2c'); TREE(c, tx + 92, G, .85, '#6aa83a', '#4f8a2c'); TREE(c, tx + 152, G, .95, '#6aa83a', '#4f8a2c');
} };

// the Luton flag, 16 x 10: white cross with dark edging; wheatsheaf on red, beehive on blue, white rose on blue, thistle on red; the bee in the middle
const LUTONFLAG = (c, X, Y) => { const RED = '#d8262a', BLU = '#1f6fc4', YEL = '#f2c51c', WH = '#ffffff', BK = '#1b1a24';
  R(c, WH, X, Y, 16, 10);
  R(c, RED, X, Y, 6.5, 4); R(c, BLU, X + 9.5, Y, 6.5, 4); R(c, BLU, X, Y + 6, 6.5, 4); R(c, RED, X + 9.5, Y + 6, 6.5, 4);
  R(c, BK, X + 6.5, Y, .5, 4); R(c, BK, X, Y + 4, 6.5, .5); R(c, BK, X + 9, Y, .5, 4); R(c, BK, X + 9.5, Y + 4, 6.5, .5);   // dark edging of the cross
  R(c, BK, X + 6.5, Y + 6, .5, 4); R(c, BK, X + 9, Y + 6, .5, 4);
  R(c, YEL, X + 2.5, Y + 1, 1.5, 2.5); R(c, YEL, X + 2, Y + .5, .5, 1); R(c, YEL, X + 4, Y + .5, .5, 1); R(c, YEL, X + 3, Y + .5, .5, .5); R(c, '#c99a10', X + 2.5, Y + 2, 1.5, .5);   // wheatsheaf
  R(c, YEL, X + 11.5, Y + 1, 2, .5); R(c, YEL, X + 11, Y + 1.5, 3, .5); R(c, YEL, X + 10.5, Y + 2, 4, 1.5); R(c, '#c99a10', X + 10.5, Y + 2.5, 4, .25); R(c, BK, X + 13, Y + 3, .5, .5);   // beehive
  R(c, WH, X + 2, Y + 7, 2.5, 2); R(c, WH, X + 2.5, Y + 6.5, 1.5, 3); R(c, YEL, X + 3, Y + 7.5, .5, .5); R(c, '#3e8a3a', X + 1.5, Y + 8.5, .5, .5); R(c, '#3e8a3a', X + 4.5, Y + 7, .5, .5);   // white rose
  R(c, '#8a3a9a', X + 12, Y + 6.5, 1.5, 1); R(c, '#3e8a3a', X + 12, Y + 7.5, 1.5, 1); R(c, '#3e8a3a', X + 12.5, Y + 8.5, .5, 1); R(c, '#3e8a3a', X + 11.5, Y + 9, 2.5, .5);   // thistle
  R(c, '#cfe4f4', X + 6.5, Y + 3.5, 1.2, 1); R(c, '#cfe4f4', X + 8.3, Y + 3.5, 1.2, 1);   // bee: wings
  R(c, BK, X + 7.5, Y + 3, 1, 4); R(c, YEL, X + 7.5, Y + 4, 1, .75); R(c, YEL, X + 7.5, Y + 5.5, 1, .75); };
L.townhall = { n: 'Luton Town Hall', w: 200, d(c, x, G) {
  BOX(c, '#5e9e8a', x + 4, G - 114, 192, 22); for (let i = 0; i < 9; i++) BOX(c, '#3c5a54', x + 10 + i * 21, G - 108, 10, 12);
  BOX(c, '#e8e0cf', x, G - 92, 200, 92); R(c, '#d8cfbb', x, G - 92, 200, 3);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const wx = x + 8 + i * 21; if (wx > x + 78 && wx < x + 114) continue; WIN(c, wx, G - 84 + r * 26, 10, 16, '#f4f2ec', '#6f8fa8'); }
  { const ST = '#e9e3d4', SD = '#d3cab6', GO = '#d4ad3a';
    BOX(c, ST, x + 80, G - 102, 40, 10); BOX(c, ST, x + 83, G - 108, 34, 6);                       // stepped base
    BOX(c, ST, x + 85, G - 172, 30, 64); R(c, SD, x + 85, G - 172, 3, 64); R(c, SD, x + 112, G - 172, 3, 64); R(c, '#f3eee2', x + 89, G - 172, 2, 64); // shaft with corner piers
    BOX(c, ST, x + 82, G - 176, 36, 5);                                                              // ledge under the upper stage
    BOX(c, ST, x + 89, G - 202, 22, 26); R(c, SD, x + 89, G - 202, 2, 26); R(c, SD, x + 109, G - 202, 2, 26);   // upper stage
    BOX(c, '#cfc6b2', x + 95, G - 198, 10, 16); for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) R(c, '#9a927f', x + 96 + i * 2.4, G - 197 + j * 2.6, 1.4, 1.6); BOX(c, ST, x + 93, G - 182, 14, 3);  // grille window + sill
    P(c, ST, [[x + 88, G - 202], [x + 112, G - 202], [x + 110, G - 210], [x + 107, G - 213], [x + 93, G - 213], [x + 90, G - 210]], true); R(c, SD, x + 89, G - 206, 22, 1); R(c, '#9a927f', x + 99, G - 210, 2, 2);  // chamfered top
    BOX(c, '#f4f2ee', x + 98, G - 218, 4, 5); R(c, '#f4f2ee', x + 99, G - 220, 2, 2);                // little finial
    BOX(c, ST, x + 93, G - 168, 14, 4);                                                              // small hood above the clock
    CIRC(c, GO, x + 100, G - 152, 8); CIRC(c, ST, x + 100, G - 152, 6.5); CIRC(c, '#c9a64a', x + 100, G - 152, 5.6); CIRC(c, ST, x + 100, G - 152, 4.8);   // gold ring clock on stone
    R(c, '#5a4a2a', x + 99.5, G - 152.5, 1, 1);   // hands are drawn live (LM_ANIM.townhall)
    R(c, '#bfb6a2', x + 99, G - 144, 3, 34); R(c, '#9a8a5a', x + 99.5, G - 136, 2, 8); R(c, '#9a8a5a', x + 99.5, G - 124, 2, 8); BOX(c, ST, x + 96, G - 112, 8, 4);  // long groove down the middle
  }
  P(c, '#ece5d5', [[x + 76, G - 54], [x + 100, G - 66], [x + 124, G - 54]], true); BOX(c, '#ece5d5', x + 78, G - 54, 44, 54); for (let i = 0; i < 4; i++) R(c, '#f8f5ee', x + 81 + i * 11, G - 52, 4, 44); BOX(c, '#8a4b2a', x + 94, G - 24, 12, 24);
  // war memorial statue: stone plinth, bronze robed figure, palm frond raised, shield at her side
  { const B = '#2f3b37', HI = '#5f8c7c', sx = x + 160;
    BOX(c, '#c9c2b2', sx - 13, G - 30, 26, 30); R(c, '#b3ac9c', sx - 13, G - 10, 26, 2); BOX(c, '#ddd6c6', sx - 16, G - 35, 32, 6); BOX(c, '#ddd6c6', sx - 16, G - 4, 32, 4); BOX(c, '#3e4c47', sx - 10, G - 39, 20, 4); R(c, '#c9a64a', sx - 6, G - 22, 12, 4);
    P(c, B, [[sx - 8, G - 39], [sx + 7, G - 39], [sx + 5, G - 52], [sx + 5, G - 62], [sx + 2, G - 66], [sx - 3, G - 66], [sx - 5, G - 60], [sx - 5, G - 50]], true);
    R(c, HI, sx - 3, G - 60, 1, 20); R(c, HI, sx + 1, G - 56, 1, 16); P(c, HI, [[sx - 5, G - 62], [sx + 4, G - 54], [sx + 4, G - 52], [sx - 5, G - 60]]);
    P(c, B, [[sx - 4, G - 64], [sx - 2, G - 66], [sx - 8, G - 84], [sx - 10, G - 83]], true);
    CIRC(c, OUT, sx, G - 70, 4); CIRC(c, B, sx, G - 70, 3); R(c, HI, sx - 3, G - 73, 6, 1); R(c, B, sx - 1, G - 67, 2, 2);
    R(c, '#3e5a50', sx - 9, G - 96, 1, 13); for (let i = 0; i < 5; i++) { R(c, HI, sx - 9 - (5 - i), G - 96 + i * 2, 5 - i, 1); R(c, HI, sx - 8, G - 96 + i * 2, 5 - i, 1); }
    P(c, B, [[sx + 4, G - 62], [sx + 11, G - 64], [sx + 11, G - 48], [sx + 8, G - 44], [sx + 4, G - 48]], true); R(c, HI, sx + 9, G - 62, 1, 13); }
  for (const fx of [x + 40, x + 168]) { R(c, '#d9d9d9', fx, G - 148, 1, 54); R(c, '#f2f2f2', fx - .5, G - 149, 2, 1); }   // flag poles; the Luton flags themselves wave in LM_ANIM.townhall
} };

L.nadeem = { n: 'Nadeem Plaza', w: 150, d(c, x, G) {
  const cx = x + 75, W = 104, l = cx - W / 2, K = [1.06, 1.1, 1.08, 1.03, 1, .97, .93, .88, .83];
  const cyl = (y, h, base) => { R(c, OUT, l - 1, y, W + 2, h); for (let i = 0; i < 9; i++) R(c, SH(base, K[i]), l + i * W / 9, y, W / 9, h); R(c, OUT, l + W, y, 1, h); };
  const band = (y, h, n, pane, frame) => { R(c, OUT, l - 1, y, W + 2, h); R(c, frame, l, y, W, h); const pw = W / n; for (let i = 0; i < n; i++) R(c, SH(pane, K[Math.min(8, Math.floor(i * 9 / n))]), l + 2 + i * pw, y + 2, pw - 3, h - 4); };
  band(G - 34, 34, 6, '#5d8fbf', '#1f5fa8'); BOX(c, '#2a3a52', cx - 9, G - 30, 18, 30); R(c, '#9fc1d8', cx - 6, G - 27, 12, 14); BOX(c, '#f4f2ec', l + 6, G - 26, 12, 18); R(c, '#d84b3c', l + 8, G - 22, 8, 3);
  BOX(c, '#2b211c', cx - 34, G - 48, 68, 14); T(c, 'COFFEE POT', cx, G - 45, 8, '#ff6a2a'); 
  cyl(G - 48, 14, '#e9e2cf'); BOX(c, '#2b211c', cx - 34, G - 48, 68, 12); T(c, 'COFFEE POT', cx, G - 46, 8, '#ff6a2a');
  band(G - 84, 36, 6, '#d9dcd8', '#1f5fa8'); for (let i = 0; i < 6; i++) { const px = l + 4 + i * W / 6; R(c, '#6f7880', px, G - 78, W / 6 - 7, 2); R(c, '#6f7880', px, G - 72, W / 6 - 9, 1); R(c, '#6f7880', px, G - 66, W / 6 - 8, 1); }
  cyl(G - 150, 66, '#e6dfcc'); for (const yy of [G - 116, G - 94]) { R(c, SH('#e6dfcc', .8), l, yy, W, 2); R(c, SH('#e6dfcc', 1.12), l, yy + 2, W, 1); }
  WIN(c, cx - 32, G - 112, 14, 14, '#f4f2ec', '#8fa9bd'); WIN(c, cx + 18, G - 112, 14, 14, '#f4f2ec', '#8fa9bd');
  TS(c, 'NADEEM', cx, G - 150, 16, '#e0262f', '#7a1717'); TS(c, 'PLAZA', cx, G - 134, 16, '#e0262f', '#7a1717');
  R(c, OUT, l + 5, G - 172, W - 10, 22); R(c, '#20304a', l + 6, G - 171, W - 12, 21); for (let i = 0; i < 8; i++) R(c, SH('#4f7fb5', K[Math.min(8, i)]), l + 8 + i * (W - 16) / 8, G - 169, (W - 16) / 8 - 2, 17); R(c, '#1f5fa8', l + 6, G - 160, W - 12, 1);
  R(c, OUT, l - 5, G - 182, W + 10, 11); const RW = W + 8; for (let i = 0; i < 11; i++) R(c, SH('#f1ebda', [1.05, 1.08, 1.06, 1.03, 1, .98, .96, .93, .9, .87, .84][i]), l - 4 + i * RW / 11, G - 181, RW / 11 + 1, 9); R(c, SH('#f1ebda', .74), l - 4, G - 174, RW, 2); R(c, OUT, l - 5, G - 182, 1, 11); R(c, OUT, l + W + 4, G - 182, 1, 11);
} };

L.welcome = { n: 'Welcome to Luton', w: 260, d(c, x, G) {
  P(c, '#5f9e44', [[x, G], [x + 34, G - 88], [x + 226, G - 88], [x + 260, G]], true); R(c, '#78b85a', x + 36, G - 87, 188, 5);
  for (let i = 0; i < 60; i++) R(c, i % 3 ? '#4f8a36' : '#8cc86a', x + 10 + (i * 37) % 240, G - 80 + (i * 23) % 76, 2, 2);
  P(c, '#55595f', [[x + 20, G - 6], [x + 46, G - 80], [x + 214, G - 80], [x + 240, G - 6]], true);
  for (let i = 0; i < 40; i++) R(c, '#4c5056', x + 40 + (i * 31) % 180, G - 74 + (i * 17) % 66, 2, 1);
  T(c, 'WELCOME TO', x + 130, G - 72, 16, '#f6f6f2'); T(c, 'LUTON', x + 131, G - 58, 40, '#c9c9c4'); T(c, 'LUTON', x + 130, G - 59, 40, '#ffffff');
} };

L.kahwa = { n: 'Kahwa Cafe', w: 110, d(c, x, G) {
  const BR = '#4a2a1e', BH = '#5e3828', CR = '#f3e9d6';
  // slate roof + chimney with aerials
  P(c, '#4e535c', [[x - 6, G - 126], [x + 116, G - 126], [x + 107, G - 154], [x + 3, G - 154]], true); for (let i = 1; i < 7; i++) R(c, '#434850', x - 4 + i * 1.5, G - 126 - i * 4, 120 - i * 3, 1);
  BRICK(c, x + 72, G - 176, 18, 26, '#9a5440', '#84463a'); R(c, OUT, x + 71, G - 177, 20, 1); R(c, '#b9b3a6', x + 70, G - 178, 22, 3); R(c, '#c0603a', x + 76, G - 184, 4, 6); R(c, '#c0603a', x + 82, G - 184, 4, 6);
  R(c, '#9a9a9a', x + 88, G - 206, 2, 30); R(c, '#9a9a9a', x + 80, G - 202, 18, 1); R(c, '#9a9a9a', x + 82, G - 197, 14, 1); R(c, '#9a9a9a', x + 83, G - 192, 12, 1);
  // red brick first floor with two sash windows under white lintels
  BRICK(c, x, G - 128, 110, 72, '#a8503a', '#94452f'); R(c, OUT, x - 1, G - 129, 112, 1);
  for (const wx of [x + 14, x + 66]) { P(c, '#eeeae2', [[wx - 4, G - 112], [wx + 34, G - 112], [wx + 31, G - 120], [wx - 1, G - 120]], true); R(c, '#d8d2c6', wx + 13, G - 120, 4, 8);
    BOX(c, '#f4f2ec', wx, G - 110, 30, 44); R(c, '#9db3c4', wx + 3, G - 107, 24, 18); R(c, '#9db3c4', wx + 3, G - 86, 24, 17); R(c, '#f4f2ec', wx + 3, G - 89, 24, 3); R(c, '#e6e2da', wx + 4, G - 106, 7, 16); R(c, '#e6e2da', wx + 19, G - 106, 7, 16); R(c, '#d8d4cc', wx - 2, G - 66, 34, 3); }
  // dark brown fascia with the name (8px = the font's own crisp size)
  BOX(c, BR, x - 3, G - 62, 116, 20); R(c, BH, x - 2, G - 61, 114, 2); R(c, '#3a2016', x - 2, G - 44, 114, 2);
  c.font = '700 8px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#1e100a'; c.fillText('KAHWA CAFE', x + 71, G - 55); c.fillStyle = CR; c.fillText('KAHWA CAFE', x + 70, G - 56);
  // round hanging sign: sun, coffee bean, mountains, water lines
  { const sx = x + 14, sy = G - 66; CIRC(c, OUT, sx, sy, 13); CIRC(c, '#5a3424', sx, sy, 12); CIRC(c, BR, sx, sy, 10);
    for (const [a, b] of [[-5, -8], [-2, -9], [1, -9], [4, -8]]) R(c, CR, sx + a, sy + b, 1, 2);
    P(c, CR, [[sx - 8, sy + 2], [sx - 4, sy - 3], [sx - 2, sy], [sx, sy - 4], [sx + 3, sy], [sx + 5, sy - 3], [sx + 8, sy + 2]], false);
    P(c, BR, [[sx - 6, sy + 2], [sx - 4, sy - 1], [sx - 2, sy + 2]], false); P(c, BR, [[sx + 3, sy + 2], [sx + 5, sy - 1], [sx + 7, sy + 2]], false);
    R(c, CR, sx - 1, sy - 5, 3, 4); R(c, BR, sx, sy - 4, 1, 2);
    for (const [a, w] of [[4, 14], [6, 10], [8, 6]]) R(c, CR, sx - w / 2, sy + a, w, 1);
    R(c, '#2a1810', x + 0, G - 68, 4, 2); }
  // glazed shopfront between posts the same brown as the sign
  BOX(c, BR, x - 2, G - 42, 8, 42); BOX(c, BR, x + 104, G - 42, 8, 42); R(c, BH, x - 1, G - 41, 2, 41); R(c, BH, x + 105, G - 41, 2, 41);
  R(c, '#2a1810', x + 6, G - 42, 98, 42);
  // door with shelves of jars behind
  BOX(c, '#141416', x + 8, G - 40, 25, 40); R(c, '#5a3c26', x + 11, G - 37, 19, 37); for (const yy of [G - 32, G - 24, G - 16]) { R(c, '#8a6040', x + 12, yy, 11, 1); for (let i = 0; i < 4; i++) R(c, ['#e8b060', '#c0703a', '#f0d090', '#a05030'][i], x + 12 + i * 3, yy - 3, 2, 3); }
  R(c, '#3a2a1e', x + 11, G - 12, 19, 12); R(c, '#141416', x + 27, G - 26, 1, 10);
  // big window: warm light, pendant lamp, plant, chairs, grey brick below
  R(c, '#141416', x + 35, G - 40, 67, 27); R(c, '#c8945c', x + 37, G - 38, 63, 23); R(c, '#dcae74', x + 37, G - 38, 63, 6); R(c, '#a87848', x + 37, G - 20, 63, 5);
  R(c, '#141416', x + 60, G - 38, 1, 6); P(c, '#2a2a2e', [[x + 54, G - 29], [x + 56, G - 32], [x + 65, G - 32], [x + 67, G - 29]], false); R(c, '#ffe6a0', x + 57, G - 29, 7, 1);
  for (const cx of [x + 43, x + 70]) { R(c, '#8a5a30', cx, G - 25, 2, 9); R(c, '#8a5a30', cx + 9, G - 25, 2, 9); R(c, '#8a5a30', cx, G - 21, 11, 2); for (let i = 0; i < 4; i++) R(c, '#a8703c', cx + 1 + i * 3, G - 29 + (i % 2), 1, 7); }
  R(c, '#3a7a3a', x + 92, G - 30, 2, 14); for (const [a, b, w] of [[-5, -32, 6], [2, -34, 5], [-5, -26, 6], [2, -28, 5], [-3, -36, 4]]) R(c, '#4f9a44', x + 92 + a, G + b, w, 2); R(c, '#6a4a2a', x + 89, G - 18, 8, 3);
  R(c, 'rgba(255,255,255,.18)', x + 40, G - 37, 2, 20); R(c, BR, x + 35, G - 14, 67, 2);
  BRICK(c, x + 35, G - 12, 67, 12, '#5c5e66', '#4a4c54');
  for (const lx of [x + 24, x + 56, x + 86]) R(c, '#ffe08a', lx, G - 42, 4, 1);
} };

L.leagrave = { n: '', nolabel: true, w: 148, d(c, x, G) {
  const GR = '#d6d8d8', GD = '#b8bcbc', RW = '#b0503c';
  // brown tiled roof (same slope both ends), three skylights spread evenly, chimney on the left edge
  P(c, '#6e6354', [[x + 4, G - 112], [x + 108, G - 112], [x + 102, G - 150], [x + 10, G - 150]], true); for (let i = 1; i < 10; i++) R(c, '#605646', x + 6 + i * .65, G - 112 - i * 4, 100 - i * 1.3, 1);
  for (const sx of [x + 18, x + 49, x + 80]) { BOX(c, '#3a4048', sx, G - 140, 14, 8); R(c, '#7f98ac', sx + 1, G - 139, 12, 3); }
  BRICK(c, x + 11, G - 164, 14, 16, '#9a5440', '#84463a'); R(c, '#b9b3a6', x + 9, G - 166, 18, 3); R(c, '#c0603a', x + 12, G - 172, 4, 6); R(c, '#c0603a', x + 19, G - 172, 4, 6);
  // light grey rendered house
  BOX(c, GR, x + 8, G - 112, 96, 112); R(c, '#e2e4e4', x + 9, G - 111, 94, 2); R(c, GD, x + 60, G - 112, 1, 112);
  R(c, '#e8eaea', x + 98, G - 110, 3, 110);   // white downpipe on the right
  // left windows: thin pane, two middle panes, thin pane; each with a small opening window across its top
  const BAYWIN = (wx, wy, h, glass, blinds) => { BOX(c, '#f4f4f2', wx, wy, 42, h); const top = wy + 3, ph = h - 6;
    for (const [px, pw] of [[3, 4], [9, 11], [22, 11], [35, 4]]) { R(c, glass, wx + px, top, pw, ph); R(c, SH(glass, 1.08), wx + px, top, pw, 5); R(c, '#f4f4f2', wx + px, top + 5, pw, 1.4);
      if (blinds) for (let i = 1; i < pw; i += 3) R(c, SH(glass, .86), wx + px + i, top + 7, 1, ph - 8); }
  };
  BAYWIN(x + 14, G - 104, 30, '#c8d2da', false); R(c, GD, x + 12, G - 74, 46, 3);
  BOX(c, '#f4f4f2', x + 66, G - 104, 30, 30); R(c, '#9db3c4', x + 69, G - 101, 24, 11); R(c, '#9db3c4', x + 69, G - 88, 24, 11); R(c, GD, x + 64, G - 74, 34, 3);
  { const dx = x + 99, dy = G - 66; R(c, '#5a5e66', dx + 4, dy - 1, 4, 1.4); c.fillStyle = OUT; c.beginPath(); c.ellipse(dx, dy, 4.6, 6, -.35, 0, 7); c.fill(); c.fillStyle = '#7d838c'; c.beginPath(); c.ellipse(dx, dy, 3.8, 5.2, -.35, 0, 7); c.fill(); c.fillStyle = '#9aa1aa'; c.beginPath(); c.ellipse(dx - .8, dy - .8, 2.2, 3.4, -.35, 0, 7); c.fill(); R(c, '#3a3d44', dx + 2, dy + 1, 4, 1); }
  BAYWIN(x + 14, G - 62, 32, '#b8c4ce', true); R(c, GD, x + 12, G - 30, 46, 3);
  BOX(c, '#6e7276', x + 66, G - 54, 22, 54); BOX(c, '#3e4654', x + 70, G - 49, 14, 49); for (const dy of [G - 42, G - 33, G - 24]) P(c, '#9db3c4', [[x + 77, dy - 2.5], [x + 79.5, dy], [x + 77, dy + 2.5], [x + 74.5, dy]], false); R(c, '#c9ced4', x + 81, G - 26, 1.5, 3);
  // red brick pier on the left against the house, wide black garage-style gate, red pier after it
  BRICK(c, x, G - 16, 8, 16, RW, '#984232'); R(c, '#2a2a2e', x, G - 18, 8, 2); R(c, OUT, x, G, 8, 1);
  // the building further back, peeping over the gate: white wall and a red roof, faded because it's behind
  P(c, '#bc6e5c', [[x + 104, G - 51], [x + 131, G - 51], [x + 129.5, G - 55.5], [x + 104, G - 55.5]], false); R(c, '#a85e4e', x + 104, G - 53.5, 26, 1);
  R(c, '#c9cbcc', x + 104, G - 51, 27, 5); R(c, '#bfc1c2', x + 104, G - 51, 27, 1); R(c, '#b4b7b9', x + 130, G - 51, 1, 5);
  BOX(c, '#1e2024', x + 104, G - 46, 36, 46); for (let i = 0; i < 9; i++) R(c, '#34383e', x + 106 + i * 4, G - 44, 2, 44); R(c, '#34383e', x + 104, G - 46, 36, 2); R(c, '#4a4e56', x + 104, G - 24, 36, 1);
  BRICK(c, x + 140, G - 16, 8, 16, RW, '#984232'); R(c, '#2a2a2e', x + 140, G - 18, 8, 2); R(c, OUT, x + 140, G, 8, 1);
  // block-paved drive, wall to wall
  R(c, '#b06a54', x + 8, G - 3, 132, 3); for (let i = 0; i < 33; i++) R(c, '#9a5a46', x + 8 + i * 4, G - 3, 1, 3);
  // three cars parked nose-in, so we see their backs: black saloon, blue saloon, red hatchback
  const BACK = (bx, col, light) => { const D = SH(col, .78);
    P(c, col, [[bx, G - 4], [bx, G - 16], [bx + 3, G - 19], [bx + 31, G - 19], [bx + 34, G - 16], [bx + 34, G - 4]], true);
    P(c, D, [[bx + 6, G - 19], [bx + 9, G - 28], [bx + 25, G - 28], [bx + 28, G - 19]], true); R(c, '#2a3038', bx + 9, G - 26, 16, 6); R(c, 'rgba(255,255,255,.25)', bx + 10, G - 25, 6, 1);
    R(c, light, bx + 1, G - 15, 7, 3); R(c, light, bx + 26, G - 15, 7, 3); R(c, '#f2c94c', bx + 12, G - 11, 10, 4); R(c, D, bx + 1, G - 7, 32, 2);
    R(c, '#141416', bx + 2, G - 4, 6, 4); R(c, '#141416', bx + 26, G - 4, 6, 4); };
  // red A45-style hot hatch from behind: same height and plate as the others, roof spoiler, big rear window, plain black bottom
  const HATCH = (bx, col) => { const L = SH(col, 1.15);   // narrower than the saloons
    P(c, col, [[bx, G - 4], [bx, G - 15], [bx + 2.2, G - 18], [bx + 4.4, G - 26], [bx + 26.6, G - 26], [bx + 28.8, G - 18], [bx + 31, G - 15], [bx + 31, G - 4]], true);
    R(c, '#141416', bx + 2.8, G - 28, 25.5, 2); R(c, '#e83030', bx + 10.5, G - 27.5, 10, .6);
    P(c, '#22262c', [[bx + 5.5, G - 18], [bx + 7.2, G - 25], [bx + 23.8, G - 25], [bx + 25.5, G - 18]], false); R(c, 'rgba(255,255,255,.22)', bx + 8.9, G - 24, 5, 1);
    P(c, '#7a0c10', [[bx + 1.7, G - 16], [bx + 6.6, G - 17], [bx + 7.8, G - 14], [bx + 2.2, G - 13]], false); P(c, '#7a0c10', [[bx + 29.3, G - 16], [bx + 24.4, G - 17], [bx + 23.2, G - 14], [bx + 28.8, G - 13]], false); R(c, '#f0f0f0', bx + 2.8, G - 15, 3, .6); R(c, '#f0f0f0', bx + 24.9, G - 15, 3, .6);
    R(c, '#f2c94c', bx + 10, G - 11, 10, 4); R(c, L, bx + 3.3, G - 12.5, 24.5, .6);
    R(c, '#141416', bx + 1.1, G - 7, 29, 3);
    R(c, '#141416', bx + 2.2, G - 4, 6, 4); R(c, '#141416', bx + 22.1, G - 4, 6, 4); };
  // the drive is full: even gaps from wall to car, between the cars, and to the far wall; the red one sits in front of the gate
  BACK(x + 16, '#1c1d22', '#c8202a'); BACK(x + 58, '#2e3d6e', '#e0302a'); HATCH(x + 100.5, '#d8141c');
} };

L.uob = { n: 'University of Bedfordshire', w: 200, d(c, x, G) {
  BOX(c, '#3e3f45', x, G - 140, 80, 140); for (let r = 0; r < 5; r++) for (let i = 0; i < 4; i++) WIN(c, x + 6 + i * 18, G - 132 + r * 22, 14, 14, '#e9e9e6', '#7fa7c4');
  BOX(c, '#3d6584', x + 80, G - 96, 26, 96); for (let j = 0; j < 6; j++) R(c, '#5f8fb0', x + 82, G - 94 + j * 16, 22, 14);
  BOX(c, '#ececea', x + 106, G - 176, 94, 120); for (let j = 0; j < 8; j++) R(c, '#dadad7', x + 106, G - 170 + j * 15, 94, 1);
  BOX(c, '#ececea', x + 150, G - 190, 44, 16); R(c, '#9a3b8a', x + 194, G - 120, 4, 40);
  P(c, '#c8272e', [[x + 140, G - 150], [x + 144, G - 162], [x + 148, G - 150]]); P(c, '#c8272e', [[x + 148, G - 150], [x + 153, G - 166], [x + 158, G - 150]]); P(c, '#c8272e', [[x + 158, G - 150], [x + 162, G - 162], [x + 166, G - 150]]);
  T(c, 'UNIVERSITY OF', x + 153, G - 144, 8, '#7a2a2a', 'center', false); T(c, 'BEDFORDSHIRE', x + 153, G - 134, 8, '#7a2a2a', 'center', false);
  BOX(c, '#2a3644', x + 106, G - 56, 94, 56); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) R(c, '#3d4e60', x + 108 + i * 15, G - 54 + j * 18, 13, 16);
} };

L.wardown = { n: 'Wardown Park', w: 210, d(c, x, G) {
  CROWN(c, x + 170, G - 60, 30, '#2f5f3a', '#356b40', 3, false); CROWN(c, x + 196, G - 50, 22, '#356b40', '#3d7848', 2, false);
  BRICK(c, x + 96, G - 58, 80, 42, '#a8553f', '#93492f'); R(c, OUT, x + 95, G - 59, 82, 1); R(c, OUT, x + 95, G - 58, 1, 42); R(c, OUT, x + 176, G - 58, 1, 42);
  P(c, '#b5503a', [[x + 88, G - 58], [x + 184, G - 58], [x + 168, G - 78], [x + 104, G - 78]], true); for (let i = 0; i < 4; i++) R(c, '#9e4532', x + 96 + i * 3, G - 74 + i * 4, 80 - i * 6, 1);
  for (const dx of [x + 106, x + 146]) { BOX(c, '#5b3a2c', dx, G - 50, 20, 34); R(c, '#e8dccb', dx + 3, G - 47, 14, 10); R(c, '#5b3a2c', dx + 9, G - 47, 2, 10); }
  BOX(c, '#c8352b', x + 168, G - 50, 6, 10);
  R(c, '#3d6b78', x, G - 16, 210, 16);
  R(c, '#7a7068', x, G - 18, 210, 2);
  R(c, '#5a3d2a', x + 38, G - 70, 6, 54); CIRC(c, OUT, x + 40, G - 78, 33); CIRC(c, '#7da443', x + 40, G - 78, 32); CIRC(c, '#94bb52', x + 32, G - 86, 18);
  for (let i = 0; i < 14; i++) R(c, i % 2 ? '#6e9638' : '#86b049', x + 10 + i * 4.5, G - 70, 3, 18 + (i % 3) * 8);
} };

L.airport = { n: 'London Luton Airport', w: 420, d(c, x, G) {
  BOX(c, '#5d6670', x, G - 150, 420, 150); R(c, '#68717b', x, G - 150, 420, 5); for (let i = 0; i < 42; i++) R(c, '#545c66', x + i * 10, G - 144, 1, 92);
  TS(c, 'LLA', x + 210, G - 136, 40, '#ffffff', '#2a333d');
  TS(c, 'LONDON LUTON AIRPORT', x + 210, G - 86, 16, '#ffffff', '#2a333d');
  BOX(c, '#f1f1f1', x - 4, G - 54, 428, 7); for (let i = 0; i < 16; i++) R(c, '#e3e3e3', x + 6 + i * 27, G - 47, 2, 47);
  BOX(c, '#2a333d', x, G - 47, 420, 47); for (let i = 0; i < 16; i++) R(c, i % 3 === 1 ? '#f2c14e' : '#3d4b5a', x + 4 + i * 26, G - 43, 22, 38);
  P(c, '#2bb3b1', [[x + 150, G], [x + 150, G - 30], [x + 170, G - 40], [x + 170, G]], true); P(c, '#2bb3b1', [[x + 300, G], [x + 300, G - 30], [x + 320, G - 40], [x + 320, G]], true);
  BOX(c, '#d84b6a', x + 60, G - 24, 12, 24); BOX(c, '#f2c14e', x + 240, G - 20, 12, 20); BOX(c, '#e8641c', x + 252, G - 14, 8, 14);
} };

L.hatfactory = { n: 'The Hat Factory', w: 140, d(c, x, G) {
  // gable end of the old factory: brick wall rising to a point, stone bands either side, the "If you can dream it" mural, metal hoarding at street level
  const B = '#8f4a35', BL = '#7c3f2c', W = 140, top = G - 208, eave = G - 176;
  BRICK(c, x, eave, W, 176, B, BL);
  c.save(); c.beginPath(); c.moveTo(x, eave); c.lineTo(x + W / 2, top); c.lineTo(x + W, eave); c.closePath(); c.clip(); BRICK(c, x, top, W, 34, B, BL); c.restore();
  P(c, '#e8e3d8', [[x - 3, eave + 1], [x + W / 2, top - 3], [x + W + 3, eave + 1], [x + W, eave + 2], [x + W / 2, top + 1], [x, eave + 2]]);
  R(c, OUT, x - 1, eave, 1, 176); R(c, OUT, x + W, eave, 1, 176);
  // three pale stone bands on each side of the mural
  for (const yy of [G - 152, G - 116, G - 80]) { R(c, '#e8e1d2', x, yy, 14, 4); R(c, '#cfc6b4', x, yy + 4, 14, 1); R(c, '#e8e1d2', x + W - 14, yy, 14, 4); R(c, '#cfc6b4', x + W - 14, yy + 4, 14, 1); }
  // mural: patterned tiles, big pink capitals with a blue shadow so they stand out
  const mx = x + 16, mw = W - 32, my = G - 170, mh = 122;
  BOX(c, '#c98a7c', mx, my, mw, mh); const pc = ['#d9a596', '#a9b6c8', '#c77a6e', '#e2c7a8', '#9fb0a8', '#d8a8b8'];
  for (let i = 0; i * 4 < mw - 4; i++) for (let j = 0; j * 4 < mh - 4; j++) if ((i + j) % 2 === 0) R(c, pc[(i * 3 + j * 5) % 6], mx + 2 + i * 4, my + 2 + j * 4, 3, 3);
  const words = ['IF YOU', 'CAN', 'DREAM IT', 'YOU MUST', 'DO IT']; let fz = 14; c.font = `700 ${fz}px Silk`; while (fz > 9 && words.some(w => c.measureText(w).width > mw - 8)) c.font = `700 ${--fz}px Silk`;
  c.textAlign = 'center'; c.textBaseline = 'top';
  words.forEach((w, k) => { const ty = my + 8 + k * 22; c.fillStyle = '#1f3f8f'; c.fillText(w, mx + mw / 2 + 2, ty + 2); c.fillStyle = '#3a6fd8'; c.fillText(w, mx + mw / 2 + 1, ty + 1); c.fillStyle = '#f9d2de'; c.fillText(w, mx + mw / 2, ty); });
  // small dark sign under the mural
  BOX(c, '#1f2a4a', x + W / 2 - 16, G - 44, 32, 10); R(c, '#ffffff', x + W / 2 - 12, G - 41, 24, 1); R(c, '#9fb3d8', x + W / 2 - 10, G - 38, 20, 1);
  // metal sheet hoarding around the bottom, a little wider than the building
  BOX(c, '#9aa1a8', x - 8, G - 30, W + 16, 30); for (let i = 0; i * 12 < W + 16; i++) { R(c, i % 2 ? '#aab1b8' : '#8e959c', x - 8 + i * 12, G - 30, 12, 30); R(c, '#6e757c', x - 8 + i * 12, G - 30, 1, 30); for (let k = 0; k < 5; k++) R(c, 'rgba(255,255,255,.18)', x - 6 + i * 12, G - 27 + k * 6, 8, 1); }
  R(c, '#5d646b', x - 8, G - 30, W + 16, 2); for (let i = 0; i < 6; i++) { R(c, '#3a3d44', x - 6 + i * 29, G - 3, 4, 3); }
} };

L.letters = { n: 'Step Forward Luton', w: 190, d(c, x, G) {
  BOX(c, '#ecebe7', x, G - 110, 120, 110); for (let i = 0; i < 6; i++) { P(c, '#c1544f', [[x + i * 20, G - 110], [x + i * 20 + 6, G - 110], [x + i * 20 + 26, G - 70], [x + i * 20 + 20, G - 70]]); P(c, '#2a2a2e', [[x + i * 20 + 20, G - 110], [x + i * 20 + 24, G - 110], [x + i * 20 + 4, G - 70], [x + i * 20, G - 70]]); }
  BRICK(c, x + 120, G - 86, 70, 86, '#8a6a54', '#7a5c48'); R(c, OUT, x + 119, G - 87, 72, 1);
  R(c, '#b9b6ae', x, G - 6, 190, 6);
  T(c, 'LUTON', x + 96, G - 52, 40, '#9c3410'); T(c, 'LUTON', x + 94, G - 54, 40, '#ec5a1c');
} };

L.oak = { n: 'Kenilworth Road, Oak Stand', w: 210, d(c, x, G) {
  // pitched slate roof so it reads as the house the Oak Stand entrance is built into
  for (const cx of [x + 40, x + 156]) { BRICK(c, cx, G - 160, 16, 26); R(c, OUT, cx - 1, G - 161, 18, 1); R(c, '#c96a4a', cx + 2, G - 165, 4, 5); R(c, '#c96a4a', cx + 9, G - 165, 4, 5); }
  P(c, '#4b4b50', [[x - 4, G - 112], [x + 214, G - 112], [x + 192, G - 146], [x + 18, G - 146]], true); for (let i = 1; i < 8; i++) R(c, '#3e3e43', x + 2 + i * 2, G - 112 - i * 4, 206 - i * 4, 1); R(c, '#5a5a60', x + 18, G - 147, 174, 2);
  BRICK(c, x, G - 112, 210, 112, '#a8503a', '#94452f'); R(c, OUT, x - 1, G - 113, 212, 1);
  for (let i = 0; i < 6; i++) { R(c, '#e8e0cf', x + 10 + i * 34, G - 104, 22, 3); WIN(c, x + 12 + i * 34, G - 100, 18, 24); }
  BOX(c, '#1e3fa3', x + 34, G - 64, 142, 18);
  BOX(c, '#ecebe7', x + 36, G - 46, 138, 46); BOX(c, '#22305a', x + 76, G - 40, 56, 40); R(c, '#e8641c', x + 74, G - 40, 2, 40); R(c, '#e8641c', x + 132, G - 40, 2, 40);
  BOX(c, '#22305a', x + 48, G - 36, 14, 36); R(c, '#e8641c', x + 46, G - 36, 2, 36); BOX(c, '#22305a', x + 146, G - 36, 16, 36); R(c, '#e8641c', x + 144, G - 36, 2, 36); R(c, '#e8641c', x + 153, G - 36, 1, 36);
  for (const dx of [x + 10, x + 186]) { BOX(c, '#f4f2ec', dx, G - 38, 14, 38); CIRC(c, '#9fb7c9', dx + 7, G - 32, 3); }
} };

L.krispy = { n: 'Krispy Lemon Chicken', w: 140, d(c, x, G) {
  // flats over the shop: about Toro's height, sign level with Toro's sign
  BRICK(c, x, G - 150, 140, 150, '#a8503a', '#94452f'); R(c, OUT, x - 1, G - 151, 142, 1); R(c, OUT, x - 1, G - 150, 1, 150); R(c, OUT, x + 140, G - 150, 1, 150); BOX(c, '#3a3a3e', x - 4, G - 156, 148, 6);
  for (let i = 0; i < 3; i++) { const wx = x + 10 + i * 44, wy = G - 132; WIN(c, wx, wy, 32, 44); R(c, '#e6ddd0', wx - 2, wy + 44, 36, 3); R(c, '#c9bfb0', wx - 2, wy + 47, 36, 1); R(c, '#e6ddd0', wx - 2, wy - 3, 36, 3); }
  R(c, '#f4f6c8', x + 8, G - 80, 8, 4); R(c, '#f4f6c8', x + 124, G - 80, 8, 4); R(c, '#3a3a3e', x + 11, G - 76, 2, 4); R(c, '#3a3a3e', x + 127, G - 76, 2, 4);
  BOX(c, '#6e1f33', x + 4, G - 70, 132, 22); R(c, '#f2c96b', x + 6, G - 51, 128, 1);
  T(c, 'KRISPY LEMON', x + 60, G - 67, 8, '#f2c96b'); T(c, 'CHICKEN', x + 60, G - 58, 8, '#f2c96b');
  CIRC(c, '#ffffff', x + 125, G - 59, 5); R(c, '#f2c14e', x + 129, G - 61, 4, 2); R(c, '#d84b3c', x + 124, G - 66, 3, 3); R(c, '#1b1a24', x + 126, G - 60, 1, 1);
  BOX(c, '#c62828', x + 4, G - 48, 132, 8); T(c, 'BURGERS . PIZZA . CHIPS', x + 70, G - 48, 8, '#ffffff', 'center', false);
  BOX(c, '#d9d7d1', x + 8, G - 40, 126, 40); for (let i = 0; i < 8; i++) R(c, '#c6c3bb', x + 8, G - 38 + i * 5, 126, 1);
  BOX(c, '#c62828', x + 8, G - 40, 3, 40); BOX(c, '#c62828', x + 131, G - 40, 3, 40);
  BOX(c, '#2b2b30', x + 16, G - 36, 24, 36); R(c, '#e7c35a', x + 19, G - 30, 18, 2); R(c, '#e7c35a', x + 19, G - 24, 18, 2);
  BOX(c, '#2a2a30', x + 46, G - 36, 80, 30); R(c, '#e8d9b8', x + 48, G - 34, 76, 26); R(c, '#1f2a3a', x + 52, G - 33, 20, 9); R(c, '#1f2a3a', x + 76, G - 33, 20, 9); R(c, '#1f2a3a', x + 100, G - 33, 20, 9);
  for (let k = 0; k < 3; k++) { R(c, '#f2c43a', x + 54 + k * 24, G - 31, 14, 1); R(c, '#ffffff', x + 54 + k * 24, G - 28, 10, 1); R(c, '#e0393a', x + 64 + k * 24, G - 28, 5, 2); }
  R(c, '#c9ced4', x + 48, G - 18, 76, 2); R(c, '#9aa3ad', x + 48, G - 16, 76, 8); R(c, '#e7c35a', x + 54, G - 21, 10, 3); R(c, '#d84b3c', x + 70, G - 21, 8, 3); R(c, 'rgba(255,255,255,.3)', x + 50, G - 34, 2, 24);
} };

L.sixthform = { n: 'Luton Sixth Form College', w: 244, d(c, x, G) {
  BRICK(c, x, G - 70, 244, 70, '#d9a84e', '#c9973f'); R(c, OUT, x - 1, G - 71, 246, 1); R(c, OUT, x + 244, G - 70, 1, 70); R(c, '#3d3d42', x, G - 6, 244, 6);
  BOX(c, '#6e7178', x + 150, G - 92, 70, 22); for (let i = 0; i < 3; i++) R(c, '#5aa6a4', x + 154 + i * 22, G - 88, 18, 12);
  P(c, '#c8452e', [[x + 58, G - 100], [x + 66, G - 110], [x + 134, G - 110], [x + 142, G - 100]], true); R(c, '#d9a84e', x + 58, G - 100, 84, 4);
  BOX(c, '#2a3a4c', x + 62, G - 90, 76, 90); for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) R(c, j === 3 ? '#4d6478' : '#3e566c', x + 64 + i * 11, G - 88 + j * 22, 9, 20);
  BOX(c, '#7a7f87', x + 46, G - 96, 108, 6); for (const px of [x + 60, x + 86, x + 112, x + 138]) R(c, '#f4f2ec', px, G - 90, 3, 90);
  WIN(c, x + 16, G - 48, 16, 26, '#3d3d42', '#5aa6a4');
  T(c, 'Luton', x + 184, G - 58, 16, '#22252b'); T(c, 'SIXTH FORM', x + 184, G - 40, 8, '#5e6b5a'); T(c, 'COLLEGE', x + 184, G - 30, 8, '#5e6b5a', 'center', false);
  for (let i = 0; i < 6; i++) R(c, '#2e8b57', x + 214 + i * 6, G - 28, 2, 28); R(c, '#2e8b57', x + 212, G - 28, 32, 2); R(c, '#2e8b57', x + 212, G - 16, 32, 1);   // green gate in front of the extended end
} };


L.masjid = { n: 'Luton Central Mosque', w: 270, d(c, x, G) {
  // tall front block (continues left via WIDEN) with its own green name sign and the main entrance; dome hall to the right; minaret at the end
  const B = '#b8483a', BL = '#a33d31', TW = 130;
  CIRC(c, OUT, x + 192, G - 100, 43); CIRC(c, '#5d7a4a', x + 192, G - 100, 42); CIRC(c, '#6f8f58', x + 181, G - 112, 21); R(c, '#e8e0cf', x + 191, G - 156, 2, 14); CIRC(c, '#d9b44a', x + 192, G - 156, 3); CIRC(c, '#e8e0cf', x + 193, G - 157, 2);
  BRICK(c, x, G - 120, TW, 120, B, BL); R(c, OUT, x - 1, G - 121, TW + 2, 1);
  // tall arched recesses across the whole front block (also over the extended left part)
  for (let i = 0; i < 9; i++) { const rx = x - 42 + i * 20; if (rx + 14 > x + TW - 6) break; const top = G - 90, bot = G - 26, D = SH(B, .76), w = 14, r = w / 2;
    CIRC(c, SH(B, .62), rx + r, top, r + 1); R(c, SH(B, .62), rx - 1, top, w + 2, bot - top); CIRC(c, D, rx + r, top + 1, r); R(c, D, rx, top + 1, w, bot - top - 1);
    R(c, SH(B, .6), rx, top - 2, 2, bot - top + 2); R(c, SH(B, 1.14), rx + w, top, 1, bot - top); R(c, SH(B, .9), rx - 1, bot, w + 2, 2); }
  R(c, SH(B, 1.12), x, G - 120, TW, 3);
  // green name board on the tall block: Arabic line + Luton Central Mosque (spans onto the WIDEN part)
  BOX(c, '#1f5a44', x + 3, G - 118, 116, 16); R(c, '#2a6e54', x + 3, G - 118, 116, 1);
  c.font = '700 8px Amiri'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f4f2ec'; c.direction = 'rtl'; c.fillText('مرکزی جامع مسجد غوثیه', x + 61, G - 114); c.direction = 'ltr';
  T(c, 'LUTON CENTRAL MOSQUE', x + 61, G - 110, 8, '#f4f2ec', 'center', false);
  for (const wx of [x + 6, x + 104]) { R(c, OUT, wx - 1, G - 45, 14, 24); R(c, '#a7b9a8', wx, G - 44, 12, 23); CIRC(c, OUT, wx + 6, G - 44, 7); CIRC(c, '#a7b9a8', wx + 6, G - 44, 6); R(c, '#e8e0cf', wx + 5, G - 50, 1, 28); }
  // main entrance: light wooden double door, green arched sign, in a brick arch
  { const dx = x + 61; CIRC(c, SH(B, .78), dx, G - 34, 15); R(c, SH(B, .78), dx - 15, G - 34, 30, 34); CIRC(c, OUT, dx, G - 34, 12); CIRC(c, '#1f5a44', dx, G - 34, 11); R(c, '#1f5a44', dx - 11, G - 34, 22, 3);
    R(c, '#f4f2ec', dx - 7, G - 40, 14, 1); R(c, '#f4f2ec', dx - 5, G - 37, 10, 1); R(c, OUT, dx - 11, G - 31, 22, 31); R(c, '#d9b07a', dx - 10, G - 30, 20, 30); R(c, '#b8905c', dx, G - 30, 1, 30);
    for (const px of [dx - 8, dx + 2]) { R(c, '#c9a06a', px, G - 27, 6, 10); R(c, '#c9a06a', px, G - 14, 6, 11); } R(c, '#8a8a8a', dx - 2, G - 18, 1, 5); R(c, '#8a8a8a', dx + 2, G - 18, 1, 5); }
  // dome hall
  BRICK(c, x + TW, G - 92, 250 - TW, 92, B, BL); R(c, OUT, x + TW, G - 93, 250 - TW, 1);
  BOX(c, '#ecebe7', x + TW + 3, G - 102, 247 - TW, 12); c.font = '700 9px Amiri'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1f5a34'; c.direction = 'rtl'; c.fillText('\u0644\u0627 \u0625\u0644\u0647 \u0625\u0644\u0627 \u0627\u0644\u0644\u0647 \u0645\u062d\u0645\u062f \u0631\u0633\u0648\u0644 \u0627\u0644\u0644\u0647', x + 190, G - 96); c.direction = 'ltr';
  for (let i = 0; i < 6; i++) { const wx = x + 135 + i * 19; R(c, OUT, wx - 1, G - 80, 14, 22); R(c, '#a7b9a8', wx, G - 79, 12, 21); CIRC(c, OUT, wx + 6, G - 79, 7); CIRC(c, '#a7b9a8', wx + 6, G - 79, 6); R(c, '#e8e0cf', wx, G - 70, 12, 1); R(c, '#e8e0cf', wx + 5, G - 85, 1, 26); R(c, SH(B, .8), wx - 2, G - 88, 16, 2); }
  R(c, SH(B, .85), x + TW, G - 52, 250 - TW, 3);
  // the front block stands proud of the dome hall: shadow on the hall + a dark corner line all the way down
  R(c, OUT, x + TW, G - 121, 1, 121);   // same weight as the roof outline
  R(c, OUT, x + 249, G - 231, 16, 231); BRICK(c, x + 250, G - 230, 14, 230, '#b04536', '#9a3b2e');
  BOX(c, '#9a3b2e', x + 246, G - 200, 22, 6); BOX(c, '#9a3b2e', x + 246, G - 140, 22, 5); BOX(c, '#9a3b2e', x + 248, G - 236, 18, 6); BOX(c, '#b04536', x + 252, G - 248, 10, 12); R(c, '#3a3d44', x + 256, G - 258, 2, 10); CIRC(c, '#d9b44a', x + 257, G - 261, 2);
  // front wall with railings; a gap with the green gates swung open in front of the entrance
  for (let i = 0; i < 11; i++) { BRICK(c, x - 10 + i * 27, G - 22, 6, 22, '#c0503f', '#a8443a'); R(c, OUT, x - 10 + i * 27, G - 23, 6, 1); R(c, '#e8d8c0', x - 11 + i * 27, G - 24, 8, 2);
    if (i === 2) { const gx = x - 4 + i * 27;
      for (const [ax, bx] of [[gx, gx + 6], [gx + 21, gx + 15]]) { c.strokeStyle = '#1f4a34'; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, G - 22); c.lineTo(bx, G - 20); c.moveTo(ax, G - 2); c.lineTo(bx, G - 1); c.moveTo(ax, G - 12); c.lineTo(bx, G - 11); c.stroke(); for (let k = 0; k < 3; k++) { const xx = ax + (bx - ax) * k / 2; R(c, '#1f4a34', Math.round(xx), G - 22 + k, 1, 21 - k); R(c, '#d9b44a', Math.round(xx), G - 24 + k, 1, 2); } }
      continue; }
    if (i < 10) { BRICK(c, x - 4 + i * 27, G - 12, 21, 12, '#c0503f', '#a8443a'); for (let k = 0; k < 6; k++) R(c, '#2a2a2e', x - 2 + i * 27 + k * 3, G - 22, 1, 10); R(c, '#2a2a2e', x - 4 + i * 27, G - 22, 21, 1); } }
} };

L.tesco = { n: 'Tesco Extra', w: 200, d(c, x, G) {
  c.save(); c.translate(-20, 0);
  BRICK(c, x + 72, G - 150, 30, 40, '#a8503a', '#94452f'); R(c, OUT, x + 71, G - 151, 32, 41); BRICK(c, x + 72, G - 150, 30, 40, '#a8503a', '#94452f');
  P(c, '#3a3a3e', [[x + 66, G - 150], [x + 108, G - 150], [x + 98, G - 162], [x + 76, G - 162]], true);
  BOX(c, '#f4f2ec', x + 72, G - 148, 30, 7); T(c, 'TESCO', x + 87, G - 148, 8, '#d8262f', 'center', false);
  { const cx = x + 87; CIRC(c, OUT, cx, G - 128, 7); CIRC(c, '#f4f2ec', cx, G - 128, 6); R(c, OUT, cx, G - 133, 1, 5); R(c, OUT, cx, G - 128, 4, 1); R(c, OUT, cx - 1, G - 129, 2, 2); }
  P(c, '#3d3f45', [[x + 16, G - 66], [x + 224, G - 66], [x + 206, G - 116], [x + 34, G - 116]], true);
  for (let i = 0; i < 12; i++) R(c, '#34363c', x + 30 + i * 2, G - 112 + i * 4, 180 - i * 4, 1);
  BRICK(c, x + 20, G - 66, 200, 66, '#a8503a', '#94452f'); R(c, OUT, x + 19, G - 67, 202, 1);
  BOX(c, '#ecebe7', x + 16, G - 70, 208, 4);
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#f4f2ec'; c.font = '700 16px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText('TESCO', x + 84, G - 92); c.fillStyle = '#d8262f'; c.fillText('TESCO', x + 84, G - 92);
  c.font = '700 12px Silk'; c.strokeText('Extra', x + 146, G - 91); c.fillStyle = '#1f4fa8'; c.fillText('Extra', x + 146, G - 91);
  BOX(c, '#c8202a', x + 40, G - 62, 70, 11);
  GLASS(c, x + 40, G - 52, 70, 52, '#7d8f9a', 5, 2); for (let i = 0; i < 4; i++) CIRC(c, ['#d84b3c', '#e8a33c', '#7fae4e', '#d84b3c'][i], x + 52 + i * 15, G - 32, 5);
  BOX(c, '#2a2f3a', x + 112, G - 52, 80, 52); for (let i = 0; i < 4; i++) CIRC(c, '#f7e7a1', x + 122 + i * 20, G - 50, 1);
  for (let i = 0; i < 9; i++) { R(c, '#9aa3ad', x + 116 + i * 7, G - 14, 6, 1); R(c, '#9aa3ad', x + 116 + i * 7, G - 14, 1, 10); R(c, '#2f4fa8', x + 116 + i * 7, G - 6, 6, 2); }
  BOX(c, '#1f4fa8', x + 160, G - 40, 30, 40); BOX(c, '#3a3d44', x + 166, G - 32, 8, 10); BOX(c, '#3a3d44', x + 178, G - 32, 8, 10);
  BOX(c, '#1a1a1e', x + 200, G - 52, 20, 52); BOX(c, '#cfe6f2', x + 203, G - 48, 14, 26); R(c, '#e8c766', x + 205, G - 30, 10, 6);
  for (let i = 0; i < 4; i++) R(c, '#cfcac0', x + 24 + i * 4, G - 52, 1, 52);
  c.restore();
} };

L.currys = { n: 'Currys', w: 360, d(c, x, G) {
  for (const wx of [x, x + 260]) { BRICK(c, wx, G - 104, 100, 104, '#d2a46a', '#bf9259'); R(c, OUT, wx - 1, G - 105, 102, 1); BOX(c, '#ecebe7', wx, G - 118, 100, 14); R(c, '#3a3d44', wx, G - 10, 100, 10); }
  BOX(c, '#22408a', x + 8, G - 98, 76, 22); T(c, 'Carphone', x + 46, G - 96, 8, '#ffffff', 'center', false); T(c, 'Warehouse', x + 46, G - 86, 8, '#ffffff', 'center', false);
  BOX(c, '#22408a', x + 276, G - 98, 76, 22); T(c, 'Carphone', x + 314, G - 96, 8, '#ffffff', 'center', false); T(c, 'Warehouse', x + 314, G - 86, 8, '#ffffff', 'center', false);
  BOX(c, '#f1f1ee', x + 84, G - 166, 192, 166); P(c, '#f6f6f3', [[x + 78, G - 166], [x + 104, G - 182], [x + 256, G - 182], [x + 282, G - 166]], true); for (let i = 0; i < 12; i++) R(c, '#dcdcd8', x + 92 + i * 16, G - 160, 1, 26);
  // the new standalone Currys sign: purple panel, thin white ring, lowercase name
  BOX(c, '#3f2a9c', x + 92, G - 154, 176, 48); R(c, '#4c36b0', x + 93, G - 153, 174, 2);
  c.strokeStyle = '#ece8fa'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 180, G - 130, 23, 0, 7); c.stroke();
  c.font = '700 8px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#251766'; c.fillText('currys', x + 181, G - 133); c.fillStyle = '#ffffff'; c.fillText('currys', x + 180, G - 134);
  GLASS(c, x + 96, G - 104, 168, 104, '#4a6a86', 8, 3); BOX(c, '#c9ced4', x + 92, G - 68, 176, 5);
  for (const bx of [x + 92, x + 106, x + 246, x + 260]) { BOX(c, '#1f6f3f', bx, G - 26, 9, 14); R(c, '#e8e8e8', bx + 4, G - 12, 1, 12); }
} };

L.venue = { n: 'Venue Central', w: 220, d(c, x, G) {
  const B = '#d9c2a0';
  BOX(c, B, x, G - 130, 220, 130); for (let i = 0; i < 7; i++) R(c, SH(B, .93), x, G - 110 + i * 16, 220, 1);
  for (const px of [x + 30, x + 62, x + 158, x + 190]) { R(c, SH(B, 1.06), px, G - 112, 6, 112); R(c, SH(B, .85), px + 6, G - 112, 2, 112); }
  BOX(c, '#2a2624', x - 4, G - 116, 228, 6); R(c, '#3a3532', x - 4, G - 112, 228, 1);
  BOX(c, '#151515', x + 34, G - 138, 152, 22); R(c, '#e8e3d8', x + 34, G - 138, 152, 1);
  T(c, 'VENUE', x + 70, G - 134, 8, '#efe9dd', 'center', false); T(c, 'CENTRAL', x + 150, G - 134, 8, '#efe9dd', 'center', false);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; R(c, '#b9ab98', Math.round(x + 110 + Math.cos(a) * 7), Math.round(G - 130 + Math.sin(a) * 7), 2, 2); } T(c, 'VC', x + 110, G - 134, 8, '#efe9dd', 'center', false);
  BOX(c, '#8e7f72', x + 50, G - 124, 120, 6); T(c, 'BRITANNIA ESTATES', x + 110, G - 125, 8, '#e8e0d2', 'center', false);
  const TW = (wx, w, h) => { BOX(c, '#14161a', wx, G - 14 - h, w, h); for (let j = 0; j < 4; j++) R(c, j === 3 ? '#e9e4d6' : '#26303c', wx + 2, G - 12 - h + j * (h / 4), w - 4, h / 4 - 2); R(c, 'rgba(255,255,255,.15)', wx + 3, G - 12 - h, 2, h - 4); };
  TW(x + 14, 12, 82); TW(x + 44, 12, 82); TW(x + 172, 12, 82); TW(x + 200, 12, 82);
  BOX(c, '#14161a', x + 78, G - 100, 64, 100); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) R(c, j < 2 ? '#2a3542' : '#f2d79a', x + 80 + i * 16, G - 98 + j * 25, 14, 23); R(c, '#14161a', x + 108, G - 48, 4, 48);
  for (const lx of [x + 8, x + 206]) { BOX(c, '#2a2a2e', lx, G - 128, 6, 4); CIRC(c, 'rgba(255,250,220,.55)', lx + 3, G - 120, 5); CIRC(c, '#fffbe6', lx + 3, G - 123, 2); }
} };

L.sign = { n: 'Welcome to Luton sign', w: 74, d(c, x, G) {
  R(c, '#5f8f3c', x - 4, G - 4, 82, 4); for (let i = 0; i < 13; i++) R(c, i % 2 ? '#4f7f30' : '#78a84c', x - 2 + i * 6.3, G - 6, 2, 2);
  BOX(c, '#5a4636', x + 4, G - 50, 4, 50); BOX(c, '#5a4636', x + 66, G - 50, 4, 50); BOX(c, '#5a4636', x + 3, G - 52, 68, 3);
  BOX(c, '#f6f4f0', x + 8, G - 49, 58, 26); T(c, 'LUTON', x + 28, G - 45, 8, '#4a2a6a', 'center'); R(c, '#4a2a6a', x + 12, G - 35, 32, 1);
  P(c, '#4a2a6a', [[x + 50, G - 46], [x + 60, G - 46], [x + 60, G - 38], [x + 55, G - 34], [x + 50, G - 38]]); R(c, '#f6f4f0', x + 54, G - 45, 2, 8); R(c, '#f6f4f0', x + 51, G - 42, 8, 2);
  const fx = x + 10, fy = G - 30, fw = 54, fh = 22; R(c, OUT, fx - 1, fy - 1, fw + 2, fh + 2); R(c, '#1a1a1a', fx, fy, fw, 7); R(c, '#f4f4f2', fx, fy + 7, fw, 8); R(c, '#1f8f4a', fx, fy + 15, fw, 7);
  P(c, '#d32f2f', [[fx, fy], [fx + 18, fy + fh / 2], [fx, fy + fh]]);
} };

L.chiltern = { n: 'The Chiltern Hotel', w: 350, d(c, x, G) {
  const Wc = '#f1efeb';
  BOX(c, '#e6e3dd', x + 40, G - 134, 60, 10);
  BOX(c, Wc, x, G - 124, 350, 100); R(c, '#dcd8d0', x, G - 124, 350, 3);
  for (let r = 0; r < 4; r++) { const yy = G - 118 + r * 24; R(c, '#e2ded6', x, yy + 15, 350, 3); for (let i = 0; i < 16; i++) { const wx = x + 4 + i * 21.5; R(c, OUT, wx - 1, yy - 1, 19, 15); R(c, '#f4f1ea', wx, yy, 17, 13); R(c, '#e6e1d4', wx + 5, yy, 1, 13); R(c, '#e6e1d4', wx + 11, yy, 1, 13); if ((i * 7 + r * 3) % 9 === 0) R(c, '#3a4656', wx + 6, yy, 5, 13); } }
  R(c, '#1f5fb8', x, G - 26, 350, 2);
  BOX(c, '#9aa3ad', x + 4, G - 24, 104, 4); GLASS(c, x + 6, G - 20, 100, 20, '#4fa9b8', 6, 1); BOX(c, '#3ac3d0', x + 12, G - 12, 40, 12);
  BOX(c, '#3a3d44', x + 260, G - 24, 60, 24); for (let i = 0; i < 12; i++) R(c, '#4a4e56', x + 262 + i * 5, G - 22, 2, 20);
  BOX(c, '#2a2f3a', x + 110, G - 24, 150, 24); for (let i = 0; i < 6; i++) R(c, '#f2d79a', x + 114 + i * 24, G - 20, 18, 14);
  P(c, '#1f5fb8', [[x + 116, G - 18], [x + 120, G - 26], [x + 146, G - 26], [x + 150, G - 18]], true); P(c, '#1f5fb8', [[x + 216, G - 18], [x + 220, G - 26], [x + 246, G - 26], [x + 250, G - 18]], true);
  BOX(c, '#ecebe7', x + 151, G - 26, 64, 26); T(c, 'WELCOME', x + 183, G - 23, 8, '#4a4d54', 'center', false); BOX(c, '#3a3d44', x + 174, G - 16, 18, 16); R(c, '#8a1d2a', x + 179, G - 14, 8, 14);
  BOX(c, '#e8e6e0', x + 104, G - 44, 158, 6); R(c, '#e8e6e0', x + 168, G - 38, 3, 12); R(c, '#e8e6e0', x + 195, G - 38, 3, 12);
  BOX(c, '#1f5fb8', x + 96, G - 70, 174, 28); R(c, '#2f72cc', x + 96, G - 70, 174, 3);
  CIRC(c, OUT, x + 183, G - 70, 13); CIRC(c, '#1f5fb8', x + 183, G - 70, 12); R(c, '#1f5fb8', x + 170, G - 70, 27, 3); T(c, 'C', x + 183, G - 81, 8, '#ffffff', 'center', false);
  T(c, 'THE', x + 112, G - 61, 8, '#ffffff', 'center', false); TS(c, 'CHILTERN', x + 181, G - 66, 16, '#ffffff', '#123c78'); T(c, 'HOTEL', x + 250, G - 61, 8, '#ffffff', 'center', false);
} };

L.chaiikhana = { n: 'Chaiikhana', w: 200, d(c, x, G) {
  const CL = (bx, by, w, h) => { BOX(c, '#3a3d42', bx, by, w, h); for (let yy = by + 4; yy < by + h; yy += 5) { R(c, '#2c2f34', bx, yy, w, 1); R(c, '#464a50', bx, yy + 1, w, 1); } };
  CL(x + 84, G - 56, 116, 56); BOX(c, '#2a2c30', x + 84, G - 60, 116, 4);
  BOX(c, '#26282c', x + 150, G - 50, 34, 26); for (let i = 0; i < 9; i++) R(c, '#3a3d42', x + 151, G - 48 + i * 3, 32, 1);
  CIRC(c, 'rgba(255,250,220,.6)', x + 140, G - 50, 4); CIRC(c, '#fffbe6', x + 140, G - 50, 2); BOX(c, '#c86a8a', x + 188, G - 56, 10, 4);
  CL(x, G - 66, 84, 66); BOX(c, '#22252a', x - 2, G - 70, 88, 6);
  BOX(c, '#1c1e22', x + 8, G - 60, 50, 26); R(c, '#c9cfd4', x + 10, G - 58, 46, 22); R(c, '#9aa3ad', x + 10, G - 45, 46, 1);
  for (const [bx, col] of [[x + 14, '#2e7d32'], [x + 24, '#8ad646']]) { BOX(c, '#d8dce0', bx, G - 54, 7, 10); R(c, col, bx + 1, G - 50, 5, 5); }
  R(c, '#5a6068', x + 38, G - 54, 14, 8); BOX(c, '#2a2c30', x + 6, G - 34, 54, 3);
  BOX(c, '#151618', x + 10, G - 30, 48, 18); R(c, '#e0458a', x + 14, G - 19, 3, 3); R(c, '#e0458a', x + 19, G - 19, 3, 3); R(c, '#f26a2a', x + 13, G - 15, 8, 2); R(c, '#2fb35a', x + 44, G - 16, 10, 2);
  BOX(c, '#1a1a1e', x + 62, G - 58, 14, 34); for (let i = 0; i < 9; i++) R(c, '#c8c8c8', x + 64, G - 54 + i * 3, 8, 1); R(c, '#e0458a', x + 63, G - 58, 12, 3); BOX(c, '#f0a8c8', x + 63, G - 28, 12, 6);
} };

L.stmarys = { n: "St Mary's Church", w: 300, d(c, x, G) {
  const ST = '#c9c2ad', DK = '#3a3d48';
  const CHK = (bx, by, w, h, k = 4) => { BOX(c, ST, bx, by, w, h); for (let i = 0; i * k < w; i++) for (let j = 0; j * k < h; j++) if ((i + j) % 2) R(c, DK, bx + i * k, by + j * k, Math.min(k, w - i * k), Math.min(k, h - j * k)); };
  const CREN = (bx, by, w) => { for (let i = 0; i < w; i += 8) BOX(c, ST, bx + i, by - 5, 5, 5); BOX(c, '#b8b19b', bx - 1, by, w + 2, 3); };
  const GW = (wx, wy, w, h) => { R(c, OUT, wx - 2, wy - 2, w + 4, h + 4); R(c, '#ebe7da', wx - 1, wy - 1, w + 2, h + 2); R(c, '#252833', wx, wy, w, h); P(c, '#ebe7da', [[wx - 1, wy], [wx + w / 2, wy - w / 2], [wx + w + 1, wy]]); P(c, '#252833', [[wx + 1, wy], [wx + w / 2, wy - w / 2 + 2], [wx + w - 1, wy]]); for (let i = 1; i < 4; i++) R(c, '#ebe7da', wx + i * w / 4, wy - 4, 1, h + 4); R(c, '#ebe7da', wx, wy + h * .2, w, 1); };
  // tower
  CHK(x + 226, G - 196, 52, 196, 5); CREN(x + 226, G - 196, 52); BOX(c, ST, x + 224, G - 210, 10, 14); BOX(c, ST, x + 270, G - 210, 10, 14); R(c, '#3a3d44', x + 251, G - 228, 1, 30); P(c, '#e8b04a', [[x + 248, G - 230], [x + 256, G - 230], [x + 252, G - 226]]); R(c, '#3a3d44', x + 245, G - 222, 14, 1);
  BOX(c, '#b8b19b', x + 226, G - 130, 52, 4); GW(x + 234, G - 172, 10, 24); GW(x + 260, G - 172, 10, 24); GW(x + 248, G - 110, 6, 14);
  // nave right
  CHK(x + 150, G - 120, 80, 120, 4); CREN(x + 150, G - 120, 80); GW(x + 164, G - 74, 16, 44); GW(x + 196, G - 74, 16, 44);
  BOX(c, ST, x + 214, G - 36, 32, 36); P(c, '#252833', [[x + 222, G], [x + 222, G - 18], [x + 230, G - 26], [x + 238, G - 18], [x + 238, G]], true);
  // main chancel with gable
  CHK(x + 20, G - 130, 132, 130, 4); CREN(x + 20, G - 130, 132);
  P(c, ST, [[x + 84, G - 130], [x + 117, G - 160], [x + 150, G - 130]], true); c.save(); c.beginPath(); c.moveTo(x + 86, G - 130); c.lineTo(x + 117, G - 158); c.lineTo(x + 148, G - 130); c.closePath(); c.clip(); for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) R(c, DK, x + 84 + i * 4, G - 162 + j * 4, 4, 4); c.restore();
  BOX(c, ST, x + 115, G - 168, 4, 10); BOX(c, ST, x + 112, G - 165, 10, 3);
  GW(x + 30, G - 100, 28, 74); GW(x + 66, G - 100, 28, 74); GW(x + 104, G - 106, 36, 82);
  for (const bx of [x + 60, x + 98]) BOX(c, '#b8b19b', bx, G - 110, 6, 110);
  BOX(c, '#b8b19b', x, G - 110, 22, 110); CREN(x, G - 110, 22);
} };

L.grandbazar = { n: 'Grand Bazar Supermarket', w: 300, d(c, x, G) {
  // long side of the shed: plain rectangle with the roof edge sloping away on top (no gable from this side)
  const NV = '#243a6a', LM = '#a6cf2a', CL = '#cdd2d9';
  P(c, '#a3a9b0', [[x - 2, G - 106], [x + 302, G - 106], [x + 296, G - 114], [x + 4, G - 114]], true); for (let i = 8; i < 296; i += 6) R(c, '#8f959c', x + i, G - 113, 1, 7);
  BOX(c, CL, x, G - 106, 300, 106); for (let i = 0; i < 300; i += 25) R(c, '#bcc2ca', x + i, G - 106, 1, 26);
  BOX(c, NV, x + 2, G - 102, 296, 22); R(c, '#2f4a82', x + 2, G - 102, 296, 2); R(c, '#1b2c52', x + 2, G - 82, 296, 2);
  const LOGO = (cx, cy, r) => { CIRC(c, OUT, cx, cy, r + 1); CIRC(c, '#ffffff', cx, cy, r); CIRC(c, NV, cx, cy, r - 2); c.font = `700 ${r > 10 ? 8 : 8}px Silk`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = LM; c.fillText('G', cx - 3.5, cy + .5); c.fillStyle = '#ffffff'; c.fillText('B', cx + 3.5, cy + .5); };
  LOGO(x + 92, G - 92, 13);
  T(c, 'GRAND', x + 132, G - 96, 8, LM); T(c, 'BAZAR', x + 172, G - 96, 8, '#ffffff'); T(c, 'SUPERMARKET', x + 230, G - 96, 8, LM);
  R(c, '#2a2d34', x + 40, G - 78, 3, 3); R(c, '#2a2d34', x + 220, G - 78, 3, 3);                                   // little cameras
  BOX(c, '#3a4250', x + 2, G - 76, 296, 76); R(c, '#8a929c', x + 2, G - 76, 296, 3);
  // entrance doors
  BOX(c, '#2a303a', x + 6, G - 70, 34, 70); R(c, '#86a2b8', x + 8, G - 68, 14, 66); R(c, '#86a2b8', x + 24, G - 68, 14, 66); R(c, '#c9ced4', x + 20, G - 40, 2, 8); R(c, '#c9ced4', x + 24, G - 40, 2, 8); R(c, 'rgba(255,255,255,.3)', x + 10, G - 66, 3, 30);
  // white poster panel with the logo and the green swoosh
  BOX(c, '#f6f6f2', x + 44, G - 72, 50, 72); T(c, 'FRESH', x + 69, G - 68, 8, NV, 'center', false); LOGO(x + 69, G - 50, 10);
  T(c, 'GRAND', x + 69, G - 37, 8, NV, 'center', true); P(c, LM, [[x + 44, G - 14], [x + 94, G - 26], [x + 94, G], [x + 44, G]]); R(c, NV, x + 50, G - 8, 38, 1);
  // produce window graphics, one picture per pane
  const pics = [['#e86a2a', '#f2c14e', '#6fae3a'], ['#c8402e', '#e8a33c', '#3f7a2e'], ['#7fae4e', '#d84b3c', '#f4d35e'], ['#d8462e', '#f08a3c', '#a83a2a'], ['#5f9a3a', '#e8c24a', '#c8402e'], ['#e8a33c', '#7a3a8a', '#6fae3a'], ['#c83a3a', '#f2c14e', '#4f8a3c']];
  for (let i = 0; i < 7; i++) { const px = x + 98 + i * 26, [a1, a2, a3] = pics[i]; R(c, '#2a303a', px - 2, G - 72, 2, 72); R(c, SH(a1, .75), px, G - 70, 24, 68);
    CIRC(c, a2, px + 7, G - 56, 6); CIRC(c, a3, px + 17, G - 48, 7); CIRC(c, a1, px + 9, G - 34, 6); CIRC(c, a2, px + 18, G - 22, 5); CIRC(c, a3, px + 6, G - 14, 5);
    R(c, 'rgba(255,255,255,.22)', px + 2, G - 68, 3, 64); R(c, 'rgba(255,255,255,.12)', px, G - 44, 24, 1); }
  R(c, '#2a303a', x + 280, G - 72, 2, 72);
  BOX(c, LM, x + 283, G - 70, 13, 68); CIRC(c, '#ffffff', x + 289.5, G - 54, 4); CIRC(c, NV, x + 289.5, G - 54, 3); R(c, '#ffffff', x + 285, G - 40, 9, 1); R(c, '#ffffff', x + 285, G - 36, 7, 1);
} };

L.lewsey = { n: 'Lewsey Sports Park', w: 280, d(c, x, G) {
  const CLAD = (bx, by, w, h) => { BOX(c, '#ece6d6', bx, by, w, h); for (let yy = by + 4; yy < by + h; yy += 4) R(c, '#d6cfbd', bx, yy, w, 1); };
  CLAD(x + 120, G - 140, 160, 140); CLAD(x + 210, G - 156, 70, 18); R(c, '#4a4d54', x + 120, G - 122, 160, 2); R(c, '#4a4d54', x + 120, G - 92, 160, 2);
  BOX(c, '#ecebe7', x + 124, G - 116, 152, 20); for (let i = 0; i < 6; i++) R(c, '#a9c3d4', x + 140 + i * 22, G - 113, 18, 14); BOX(c, '#3a3d44', x + 126, G - 112, 10, 8);
  CLAD(x + 26, G - 150, 98, 14);
  BRICK(c, x + 20, G - 136, 100, 136, '#a5643f', '#8f5434'); R(c, OUT, x + 19, G - 137, 102, 1); R(c, OUT, x + 19, G - 136, 1, 136); BOX(c, '#3a3d44', x + 18, G - 138, 104, 3);
  c.font = '14px PS'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#5a2e1a'; c.fillText('LEWSEY', x + 71, G - 127); c.fillStyle = '#f4f2ec'; c.fillText('LEWSEY', x + 70, G - 128); T(c, 'SPORTS PARK', x + 70, G - 110, 8, '#f4f2ec');
  BOX(c, '#f4f2ec', x + 40, G - 100, 60, 13); c.font = '700 8px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e8641c'; c.fillText('active', x + 70, G - 93); R(c, '#2fa84a', x + 44, G - 97, 3, 3);
  for (const vx of [x + 40, x + 82]) { BOX(c, '#ecebe7', vx, G - 84, 14, 10); for (let i = 0; i < 4; i++) R(c, '#9a9a9a', vx, G - 82 + i * 2, 14, 1); }
  for (let i = 0; i < 6; i++) R(c, '#b9744e', x + 30 + i * 16, G - 20, 5, 4);
  BOX(c, '#e9ecef', x + 120, G - 62, 160, 13); BOX(c, '#ffffff', x + 184, G - 61, 78, 11); T(c, 'ENTRANCE', x + 223, G - 59, 8, '#22408a', 'center', false);
  BOX(c, '#f4f4f4', x + 124, G - 50, 152, 50); BOX(c, '#ffffff', x + 126, G - 46, 18, 46);
  for (let i = 0; i < 6; i++) R(c, i < 2 ? '#7a8590' : '#3a4250', x + 148 + i * 21, G - 46, 18, 44); R(c, '#e9ecef', x + 148, G - 40, 126, 1); BOX(c, '#2f6fb5', x + 158, G - 32, 4, 4);
  CLAD(x, G - 70, 22, 70); BOX(c, '#ecebe7', x - 2, G - 54, 24, 4); BOX(c, '#3a4250', x + 4, G - 46, 12, 46); R(c, '#c8202a', x + 16, G - 46, 2, 46);
} };

L.alquds = { n: 'Al-Quds', w: 160, d(c, x, G) {
  const Y = '#efe2a2';
  c.save(); c.translate(0, -10);
  P(c, '#4a4d54', [[x - 4, G - 150], [x + 164, G - 150], [x + 150, G - 166], [x + 10, G - 166]], true); BRICK(c, x + 22, G - 176, 14, 12, '#7a4a3a', '#6a3e30'); BRICK(c, x + 128, G - 176, 14, 12, '#7a4a3a', '#6a3e30');
  BRICK(c, x, G - 150, 160, 90, Y, '#ddd08a'); R(c, OUT, x - 1, G - 151, 162, 1); R(c, OUT, x - 1, G - 150, 1, 90); R(c, OUT, x + 160, G - 150, 1, 90); BOX(c, '#f4f2ec', x - 2, G - 152, 164, 4);
  const AW = (wx, wy, w, h) => { R(c, OUT, wx - 1, wy - 1, w + 2, h + 2); R(c, '#f4f2ec', wx, wy, w, h); R(c, '#8a9aa8', wx + 2, wy + 2, w - 4, h - 4); R(c, '#d8c98a', wx - 2, wy - 4, w + 4, 3); R(c, '#d8c98a', wx + 2, wy - 6, w - 4, 2); R(c, '#f4f2ec', wx - 2, wy + h, w + 4, 2); };
  AW(x + 12, G - 140, 16, 26); AW(x + 68, G - 140, 26, 26); AW(x + 132, G - 140, 16, 26); AW(x + 12, G - 96, 16, 26); AW(x + 132, G - 96, 16, 26);
  P(c, '#3a3d44', [[x + 52, G - 98], [x + 60, G - 106], [x + 100, G - 106], [x + 108, G - 98]], true); BOX(c, '#f4f2ec', x + 54, G - 98, 52, 30); for (let i = 0; i < 3; i++) R(c, '#8a9aa8', x + 57 + i * 16, G - 95, 14, 24);
  R(c, '#2a2a2e', x + 150, G - 150, 2, 96);
  BOX(c, '#2a2c30', x - 2, G - 62, 164, 6);
  BOX(c, '#2a2c30', x, G - 56, 160, 56); for (let i = 0; i < 10; i++) R(c, '#34363b', x, G - 54 + i * 5, 160, 1);
  BOX(c, '#3a3a3a', x + 4, G - 56, 152, 26); R(c, '#4a4a4a', x + 4, G - 56, 152, 2);
  TS(c, 'AL-QUDS', x + 74, G - 55, 16, '#f2c43a', '#7a5a10'); T(c, 'ARABIC . GRILL . SHAWARMA', x + 80, G - 40, 8, '#e0263a', 'center', false);
  c.font = '700 8px Amiri'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.direction = 'rtl'; c.fillText('حلال', x + 152, G - 44); c.direction = 'ltr';
  BOX(c, '#1a1c20', x + 6, G - 28, 150, 28); R(c, '#2a2c30', x + 6, G - 30, 150, 2);
  BOX(c, '#1a1c20', x + 8, G - 26, 22, 26); R(c, '#cfa968', x + 10, G - 24, 18, 24); R(c, '#e9cf98', x + 11, G - 23, 3, 22); R(c, '#9aa3ad', x + 26, G - 14, 1, 6);
  R(c, '#b8894e', x + 32, G - 26, 122, 26); R(c, '#cf9f5c', x + 32, G - 26, 122, 9); for (let k = 0; k < 122; k += 6) R(c, '#a6773f', x + 32 + k, G - 26, 1, 9);
  for (let i = 0; i < 6; i++) { const lx = x + 40 + i * 20; R(c, '#3a2a1e', lx, G - 26, 1, 4); R(c, '#f7d27a', lx - 2, G - 22, 5, 2); R(c, 'rgba(255,220,140,.35)', lx - 4, G - 20, 9, 3); }
  for (let i = 0; i < 5; i++) { const tx2 = x + 38 + i * 24; R(c, '#5a3a24', tx2, G - 11, 14, 2); R(c, '#4a2e1c', tx2 + 6, G - 9, 2, 9); R(c, '#7a1e22', tx2 - 3, G - 13, 3, 13); R(c, '#7a1e22', tx2 + 14, G - 13, 3, 13); }
  for (const fx of [x + 52, x + 74, x + 92, x + 114, x + 134]) R(c, '#1a1c20', fx, G - 26, 2, 26); R(c, '#1a1c20', x + 32, G - 17, 122, 1);
  R(c, 'rgba(255,255,255,.18)', x + 36, G - 24, 2, 20); R(c, 'rgba(255,255,255,.18)', x + 96, G - 24, 2, 20);
  CIRC(c, '#2fb35a', x + 41, G - 21, 3); R(c, '#ffffff', x + 40, G - 22, 2, 1);
  c.restore();
  BOX(c, '#2a2c30', x, G - 10, 160, 10); for (let i = 0; i < 20; i++) R(c, i % 2 ? '#3a3d44' : '#30333a', x + 1 + i * 8, G - 9, 7, 8);
} };

L.karwan = { n: 'Karwan Afghan Cuisine', w: 230, d(c, x, G) {
  TREE(c, x + 168, G - 60, 1.3, '#4f8a3c', '#3a6b2c');
  BOX(c, '#f1efea', x, G - 74, 230, 74);
  BOX(c, '#121214', x + 2, G - 72, 168, 22); T(c, 'KARWAN', x + 70, G - 70, 16, '#e0262a'); T(c, 'AFGHAN CUISINE', x + 70, G - 57, 8, '#ffffff', 'center', false); T(c, '5-7', x + 10, G - 66, 8, '#ffffff', 'center', false); T(c, '01582', x + 148, G - 60, 8, '#ffffff', 'center', false);
  BOX(c, '#121214', x + 172, G - 72, 46, 22); T(c, 'WELCOME', x + 195, G - 71, 8, '#ffffff', 'center', false); T(c, 'KARWAN', x + 195, G - 63, 8, '#e0262a', 'center', false);
  BOX(c, '#2aa8b8', x + 220, G - 76, 12, 18); R(c, '#ffffff', x + 224, G - 72, 1, 8); R(c, '#ffffff', x + 227, G - 72, 1, 8);
  for (const [wx, ww] of [[x + 6, 34], [x + 46, 74], [x + 126, 40]]) { BOX(c, '#2a2a2e', wx, G - 46, ww, 26); R(c, '#6a4a34', wx + 2, G - 44, ww - 4, 22); R(c, '#8a6a4a', wx + 2, G - 44, ww - 4, 6);
    for (let k = 0; k * 12 < ww - 8; k++) { const lx = wx + 6 + k * 12; R(c, '#2a1e16', lx, G - 44, 1, 3); R(c, '#ffd27a', lx - 1, G - 41, 3, 2); }
    for (let k = 0; k * 14 < ww - 10; k++) { const tx = wx + 4 + k * 14; R(c, '#f1efea', tx, G - 30, 9, 2); R(c, '#4a2e1c', tx + 4, G - 28, 1, 6); R(c, '#8a1d2a', tx - 2, G - 32, 2, 10); }
    R(c, 'rgba(255,255,255,.2)', wx + 3, G - 44, 2, 20); BOX(c, '#3a3f4a', wx, G - 20, ww, 20); R(c, '#4a505a', wx + 1, G - 19, ww - 2, 2); }
  BOX(c, '#2a2a2e', x + 176, G - 46, 40, 46); R(c, '#4a505a', x + 178, G - 44, 16, 44); R(c, '#1a1a1e', x + 196, G - 44, 18, 44);
} };

L.suffa = { n: 'Suffa-Tul-Islam Masjid', w: 300, d(c, x, G) {
  // as built now: white rendered hall, dark roof fascia, big black pointed arch ribs, arched glass entrance with the name band; no dome yet
  const WH = '#f3f1ec', WD = '#dcd8d0', BK = '#1c1e22';
  const ARCH = (ax, w, top, base, lw = 4) => { c.strokeStyle = BK; c.lineWidth = lw; c.beginPath(); c.moveTo(ax, base); c.quadraticCurveTo(ax, top + (base - top) * .3, ax + w / 2, top); c.quadraticCurveTo(ax + w, top + (base - top) * .3, ax + w, base); c.stroke(); };
  const AWIN = (wx, wy, w, h) => { c.fillStyle = BK; c.beginPath(); c.moveTo(wx, wy + h); c.lineTo(wx, wy + w * .45); c.quadraticCurveTo(wx, wy, wx + w / 2, wy - 2); c.quadraticCurveTo(wx + w, wy, wx + w, wy + w * .45); c.lineTo(wx + w, wy + h); c.closePath(); c.fill();
    c.fillStyle = '#3a4250'; c.fillRect(wx + 2, wy + w * .45, w - 4, h - w * .45 - 2); R(c, BK, wx + w / 2 - .5, wy, 1, h); R(c, 'rgba(255,255,255,.18)', wx + 3, wy + w * .5, 1, h * .5); };
  // right wing: low hall under a dark curved canopy on black arch legs
  BOX(c, WH, x + 196, G - 46, 104, 46); R(c, WD, x + 196, G - 46, 104, 2);
  for (let i = 0; i < 4; i++) { const ox = x + 204 + i * 24; BOX(c, '#2a2f38', ox, G - 34, 16, 30); R(c, '#4a5562', ox + 2, G - 32, 5, 26); }
  c.fillStyle = BK; c.beginPath(); c.moveTo(x + 194, G - 52); c.quadraticCurveTo(x + 250, G - 66, x + 304, G - 54); c.lineTo(x + 304, G - 48); c.quadraticCurveTo(x + 250, G - 59, x + 194, G - 46); c.closePath(); c.fill();
  for (const ax of [x + 214, x + 262]) ARCH(ax, 28, G - 56, G, 3);
  // main hall
  BOX(c, WH, x, G - 104, 200, 104); R(c, WD, x + 196, G - 104, 4, 104); for (let i = 0; i < 5; i++) R(c, SH(WH, .985), x, G - 90 + i * 18, 200, 1);
  BOX(c, '#2e333a', x - 4, G - 112, 208, 9); R(c, '#454b54', x - 4, G - 112, 208, 2); for (const lx of [x + 30, x + 100, x + 170]) CIRC(c, '#f4f0dc', lx, G - 101, 1.5);
  AWIN(x + 17, G - 74, 18, 28); AWIN(x + 165, G - 74, 18, 28);
  // entrance: arched glass top in a black frame, black name band, black glass doors
  { const ex = x + 58, ew = 84; c.fillStyle = BK; c.beginPath(); c.moveTo(ex, G - 64); c.lineTo(ex, G - 84); c.quadraticCurveTo(ex, G - 100, ex + ew / 2, G - 101); c.quadraticCurveTo(ex + ew, G - 100, ex + ew, G - 84); c.lineTo(ex + ew, G - 64); c.closePath(); c.fill();
    c.fillStyle = '#9fb3c4'; c.beginPath(); c.moveTo(ex + 3, G - 65); c.lineTo(ex + 3, G - 84); c.quadraticCurveTo(ex + 3, G - 97, ex + ew / 2, G - 98); c.quadraticCurveTo(ex + ew - 3, G - 97, ex + ew - 3, G - 84); c.lineTo(ex + ew - 3, G - 65); c.closePath(); c.fill();
    for (let i = 1; i < 4; i++) R(c, BK, ex + i * ew / 4 - 1, G - 98, 2, 34); R(c, 'rgba(255,255,255,.35)', ex + 8, G - 90, 2, 22);
    BOX(c, BK, ex - 2, G - 64, ew + 4, 22); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '8px Silk'; c.fillStyle = '#ffffff'; c.fillText('SUFFA-TUL-ISLAM', ex + ew / 2, G - 58); c.font = '700 8px Silk'; c.fillText('MASJID', ex + ew / 2, G - 49);
    BOX(c, BK, ex, G - 42, ew, 42); for (let i = 0; i < 4; i++) { R(c, '#2a3038', ex + 2 + i * 20.5, G - 40, 19, 40); R(c, '#3a4450', ex + 4 + i * 20.5, G - 38, 3, 34); } R(c, '#8a8e94', ex + 39, G - 24, 1, 6); R(c, '#8a8e94', ex + 44, G - 24, 1, 6); }
  // big black arch ribs across the front corners
  ARCH(x + 8, 36, G - 98, G); ARCH(x + 156, 36, G - 98, G);   // kept inside the hall with wall showing either side
  // lawn and low brick boundary wall (gap at the gate)
  R(c, '#4f9a3c', x - 6, G - 5, 312, 5); for (let i = 0; i < 50; i++) R(c, '#78c25a', x - 4 + (i * 37) % 308, G - 5 + (i % 3), 2, 1);
  for (const [wx, ww] of [[x - 6, 62], [x + 144, 162]]) { BRICK(c, wx, G - 12, ww, 12, '#b86a4a', '#9a563a'); R(c, OUT, wx, G - 13, ww, 1); R(c, '#d9c9b0', wx, G - 13, ww, 2); }
} };

L.lutonhoo = { n: 'Luton Hoo Estate', w: 330, lawn: 10, d(c, x, G) {
  const ST = '#dcc79a', SD = '#c4ad7f', SL = '#ead9b0', RF = '#7c8592', RD = '#5f6874';
  const stone = (sx, sy, w, h, col = ST) => { BOX(c, col, sx, sy, w, h); for (let yy = sy + 5; yy < sy + h - 1; yy += 6) R(c, SH(col, .94), sx + 1, yy, w - 2, 1); };
  const win = (wx, wy, w, h) => { BOX(c, '#efe6cf', wx, wy, w, h); R(c, '#4d5d6e', wx + 2, wy + 2, w - 4, h - 4); R(c, '#efe6cf', wx + Math.floor(w / 2), wy + 2, 1, h - 4); R(c, '#efe6cf', wx + 2, wy + Math.floor(h / 2), w - 4, 1); R(c, 'rgba(255,255,255,.35)', wx + 2, wy + 2, 2, h - 4); R(c, SD, wx - 2, wy - 3, w + 4, 2); R(c, SL, wx - 2, wy + h + 1, w + 4, 2); };
  // chimney stacks behind the roof
  for (const cx of [x + 58, x + 104, x + 132, x + 214, x + 244, x + 290]) { BOX(c, SD, cx, G - 162, 8, 26); R(c, '#8a7a5c', cx - 1, G - 164, 10, 3); R(c, '#9a5a3c', cx + 1, G - 167, 2, 3); R(c, '#9a5a3c', cx + 5, G - 167, 2, 3); }
  // grey mansard roof with dormers
  P(c, RF, [[x + 22, G - 128], [x + 316, G - 128], [x + 308, G - 146], [x + 30, G - 146]], true);
  for (let i = 0; i < 20; i++) R(c, RD, x + 34 + i * 14, G - 145, 1, 16);
  for (const dx of [x + 82, x + 116, x + 196, x + 230, x + 268]) { BOX(c, ST, dx, G - 142, 10, 12); R(c, '#4d5d6e', dx + 2, G - 139, 6, 8); P(c, RD, [[dx - 1, G - 142], [dx + 11, G - 142], [dx + 5, G - 147]], true); }
  // main block, two storeys + parapet
  stone(x + 26, G - 128, 288, 98);
  R(c, SL, x + 22, G - 132, 296, 4); R(c, OUT, x + 22, G - 133, 296, 1); for (let i = 0; i < 48; i++) R(c, SD, x + 24 + i * 6, G - 131, 2, 2);
  R(c, SL, x + 26, G - 84, 288, 3); R(c, SD, x + 26, G - 81, 288, 1);
  for (let i = 0; i < 10; i++) { const wx = x + 92 + i * 22; if (wx > x + 146 && wx < x + 196) continue; win(wx, G - 118, 10, 22); win(wx, G - 74, 10, 28); }
  // left rounded bow with grey dome cap
  stone(x + 6, G - 134, 64, 104, SL);
  for (let yy = G - 130; yy < G - 32; yy += 6) R(c, SH(SL, .93), x + 7, yy, 62, 1);
  R(c, SD, x + 6, G - 134, 8, 104); R(c, SD, x + 62, G - 134, 8, 104);
  P(c, RF, [[x + 6, G - 135], [x + 70, G - 135], [x + 62, G - 148], [x + 48, G - 154], [x + 28, G - 154], [x + 14, G - 148]], true);
  R(c, RD, x + 36, G - 160, 4, 7); R(c, '#c9a64a', x + 37, G - 163, 2, 3);
  for (const wx of [x + 18, x + 33, x + 48]) { win(wx, G - 122, 9, 22); win(wx, G - 76, 9, 28); }
  CIRC(c, '#4d5d6e', x + 38, G - 93, 3);
  // centre portico: pediment over columns
  stone(x + 150, G - 136, 46, 106, SL);
  P(c, SL, [[x + 146, G - 136], [x + 200, G - 136], [x + 173, G - 150]], true); P(c, SD, [[x + 156, G - 138], [x + 190, G - 138], [x + 173, G - 146]]);
  win(x + 166, G - 122, 14, 24); R(c, '#3a3226', x + 162, G - 74, 22, 44); R(c, '#5a4a34', x + 164, G - 72, 18, 42); R(c, '#c9a64a', x + 172, G - 52, 2, 2);
  for (const cx of [x + 152, x + 160, x + 186, x + 194]) { R(c, '#f2e6c6', cx, G - 82, 4, 52); R(c, SD, cx + 3, G - 82, 1, 52); R(c, SL, cx - 1, G - 84, 6, 2); }
  // terrace with white balustrade and central steps
  stone(x, G - 30, 330, 12, '#e6dcc4');
  for (let i = 0; i < 54; i++) if (i < 22 || i > 32) R(c, '#cfc3a6', x + 3 + i * 6, G - 27, 3, 7);
  R(c, '#f4eedd', x, G - 31, 330, 2);
  // stone plinth under the terrace, then a low striped lawn (it carries on behind the neighbours: L.lutonhoo.lawn)
  R(c, OUT, x, G - 18, 330, 9); R(c, '#d3c6a4', x, G - 18, 330, 8); for (let i = 0; i < 28; i++) R(c, '#c4b694', x + 4 + i * 12, G - 15, 6, 1);
  for (let k = 0; k < 3; k++) R(c, k % 2 ? '#d9cfb6' : '#efe8d6', x + 128 - k * 4, G - 18 + k * 6, 90 + k * 8, 6);
  for (const [lx, lw] of [[x - 4, 124], [x + 222, 112]]) for (let i = 0; i * 11 < lw; i++) R(c, i % 2 ? '#6aa848' : '#54903a', lx + i * 11, G - 10, Math.min(11, lw - i * 11), 10);
  R(c, '#2f5a26', x - 4, G - 11, 124, 2); R(c, '#2f5a26', x + 222, G - 11, 112, 2);
  // topiary: cones and balls along the terrace
  const cone = (tx, h) => { P(c, '#2f6a2c', [[tx - 5, G - 10], [tx + 5, G - 10], [tx, G - 10 - h]], true); R(c, '#3f8436', tx - 2, G - 6 - h * .6, 2, h * .4); };
  const ball = (tx, r) => { CIRC(c, OUT, tx, G - 10 - r, r + 1); CIRC(c, '#2f6a2c', tx, G - 10 - r, r); R(c, '#3f8436', tx - r + 2, G - 12 - r * 1.4, 3, 2); };
  cone(x + 112, 22); cone(x + 232, 22); ball(x + 126, 6); ball(x + 218, 6); ball(x + 266, 7); cone(x + 318, 18);
  // fountain in front of the steps: round stone pool, tiered basin, statue, spray
  const fx = x + 173;
  BOX(c, '#2f6a2c', fx - 46, G - 28, 92, 14); for (let i = 0; i < 15; i++) R(c, '#3f8436', fx - 44 + i * 6, G - 27, 3, 2);
  R(c, OUT, fx - 41, G - 15, 82, 14); R(c, '#e6dcc4', fx - 40, G - 14, 80, 12); R(c, '#cfc3a6', fx - 40, G - 4, 80, 2); R(c, '#3f7fa8', fx - 35, G - 12, 70, 7); R(c, '#5fa0c8', fx - 30, G - 11, 22, 1); R(c, '#5fa0c8', fx + 8, G - 8, 18, 1); R(c, '#2f6a94', fx - 35, G - 6, 70, 1);
  R(c, OUT, fx - 4, G - 34, 8, 24); R(c, '#cfc3a6', fx - 3, G - 34, 6, 24); R(c, OUT, fx - 15, G - 35, 30, 5); R(c, '#e6dcc4', fx - 14, G - 34, 28, 3); R(c, '#bfe3f5', fx - 13, G - 31, 26, 1);
  R(c, OUT, fx - 4, G - 46, 8, 11); R(c, '#cfc3a6', fx - 3, G - 46, 6, 11); R(c, OUT, fx - 8, G - 47, 16, 3); R(c, '#e6dcc4', fx - 7, G - 46, 14, 1);
  R(c, OUT, fx - 5, G - 55, 10, 9); R(c, '#9a9f96', fx - 2, G - 54, 4, 7); R(c, '#9a9f96', fx - 4, G - 52, 2, 3); R(c, '#9a9f96', fx + 2, G - 52, 2, 3);
  // spray + falling water are animated in LM_ANIM.lutonhoo
  // bench on the lawn
  R(c, '#3a2a20', x + 286, G - 10, 18, 2); R(c, '#3a2a20', x + 286, G - 14, 18, 2); R(c, '#2a2f38', x + 287, G - 8, 2, 8); R(c, '#2a2f38', x + 301, G - 8, 2, 8);
  // helicopter is drawn (and takes off) in LM_ANIM.lutonhoo

} };

L.ldh = { n: 'Luton and Dunstable Hospital', w: 344, d(c, x, G) {
  x += 44;   // room for the longer left wing
  // tall grey hospital block behind
  BOX(c, '#a9adb3', x + 152, G - 236, 148, 236); R(c, '#bfc3c8', x + 152, G - 236, 148, 3); BOX(c, '#7e848c', x + 196, G - 250, 70, 14); for (let i = 0; i < 6; i++) R(c, '#6a7078', x + 200 + i * 11, G - 247, 6, 9);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) R(c, (r + i) % 3 ? '#5f7a92' : '#7b94aa', x + 157 + i * 20, G - 226 + r * 18, 16, 11);
  // dark side blocks with louvres
  BOX(c, '#2e3238', x - 40, G - 132, 106, 132); for (let i = 0; i < 9; i++) R(c, '#3e434b', x - 38, G - 128 + i * 4, 102, 2); R(c, '#4a5562', x + 18, G - 86, 44, 12); R(c, '#4a5562', x - 34, G - 86, 44, 12);
  BOX(c, '#2e3238', x + 270, G - 124, 30, 124); for (let i = 0; i < 9; i++) R(c, '#3e434b', x + 272, G - 120 + i * 4, 26, 2);
  // tan cladding box with diagonal panel joints
  const TN = '#d9a77a'; BOX(c, TN, x + 64, G - 156, 208, 110); R(c, SH(TN, 1.06), x + 64, G - 156, 208, 2);
  c.save(); c.beginPath(); c.rect(x + 64, G - 156, 208, 40); c.clip(); c.strokeStyle = SH(TN, .86); c.lineWidth = 1; for (let i = -2; i < 20; i++) { c.beginPath(); c.moveTo(x + 64 + i * 12, G - 156); c.lineTo(x + 76 + i * 12, G - 116); c.stroke(); } c.restore();
  for (const yy of [G - 116, G - 84]) R(c, SH(TN, .9), x + 64, yy, 208, 1); for (let i = 1; i < 9; i++) R(c, SH(TN, .9), x + 64 + i * 23, G - 116, 1, 70);
  // tall glass window in a dark frame
  BOX(c, '#26292e', x + 86, G - 134, 50, 88); R(c, '#7f9fb8', x + 90, G - 130, 42, 80); R(c, '#26292e', x + 110, G - 130, 2, 80); R(c, '#26292e', x + 90, G - 104, 42, 2); R(c, 'rgba(255,255,255,.3)', x + 94, G - 126, 3, 50); R(c, '#9fb7c9', x + 90, G - 70, 42, 20);
  // name on the cladding
  T(c, 'LUTON AND DUNSTABLE', x + 205, G - 108, 8, '#eef2f5', 'center', false); T(c, 'UNIVERSITY HOSPITAL', x + 205, G - 98, 8, '#eef2f5', 'center', false);
  // ground floor: dark brick and glass doors
  BOX(c, '#4a4e56', x - 40, G - 46, 330, 46); for (let i = 0; i < 11; i++) R(c, '#3e424a', x - 40, G - 44 + i * 4, 330, 1);
  BOX(c, '#23272d', x - 34, G - 42, 42, 42); R(c, '#6a8aa6', x - 30, G - 40, 16, 22); R(c, '#6a8aa6', x - 10, G - 40, 16, 22); R(c, '#6a8aa6', x - 30, G - 16, 36, 12);
  BOX(c, '#23272d', x + 14, G - 42, 56, 42); R(c, '#6a8aa6', x + 18, G - 40, 22, 22); R(c, '#6a8aa6', x + 44, G - 40, 22, 22); BOX(c, '#2e3238', x + 40, G - 18, 26, 18);
  BOX(c, '#1c1f24', x + 90, G - 42, 56, 42); for (let i = 0; i < 4; i++) R(c, '#7a96ae', x + 92 + i * 13.5, G - 40, 12, 40); R(c, '#1c1f24', x + 117, G - 40, 2, 40);
  BOX(c, '#1c1f24', x + 168, G - 42, 70, 42); for (let i = 0; i < 3; i++) R(c, '#7a96ae', x + 170 + i * 22, G - 40, 20, 40); R(c, '#d8262f', x + 196, G - 34, 18, 18);
  // signage canopy: black MAIN ENTRANCE, red EMERGENCY DEPT with the red leg
  BOX(c, '#121418', x - 44, G - 58, 208, 14); T(c, 'MAIN ENTRANCE', x + 104, G - 55, 8, '#ffffff', 'center', true);
  BOX(c, '#e3171f', x + 162, G - 60, 100, 16); T(c, 'EMERGENCY DEPT', x + 212, G - 56, 8, '#ffffff', 'center', true);
  P(c, '#e3171f', [[x + 248, G - 44], [x + 262, G - 44], [x + 262, G], [x + 254, G], [x + 254, G - 30]], true);
  // low curved planter wall with stone coping and a rail
  c.fillStyle = '#3a3e44'; c.beginPath(); c.moveTo(x - 46, G); c.lineTo(x - 46, G - 8); c.quadraticCurveTo(x + 129, G - 16, x + 304, G - 8); c.lineTo(x + 304, G); c.closePath(); c.fill();
  c.strokeStyle = '#d6d2c8'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 46, G - 8); c.quadraticCurveTo(x + 129, G - 16, x + 304, G - 8); c.stroke();
  c.strokeStyle = '#9aa0a8'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 186, G - 20); c.lineTo(x + 240, G - 26); c.stroke(); for (const px of [x + 190, x + 214, x + 236]) R(c, '#9aa0a8', px, G - 24, 1, 12);
} };

L.masjidali = { n: 'Masjid-e-Ali', w: 320, d(c, x, G) {
  const CL = '#c9ccd0';
  const SHED = (bx, w, h, peak) => { P(c, CL, [[bx, G], [bx, G - h], [bx + w / 2, G - h - peak], [bx + w, G - h], [bx + w, G]], true); c.save(); c.beginPath(); c.moveTo(bx, G); c.lineTo(bx, G - h); c.lineTo(bx + w / 2, G - h - peak); c.lineTo(bx + w, G - h); c.lineTo(bx + w, G); c.closePath(); c.clip(); for (let i = 0; i < w; i += 4) R(c, '#b3b7bc', bx + i, G - h - peak, 1, h + peak); c.restore(); R(c, '#f0f0ee', bx, G - h - 1, 2, 2); P(c, 'rgba(0,0,0,0)', [[bx - 2, G - h], [bx + w / 2, G - h - peak - 2], [bx + w + 2, G - h]], true); };
  SHED(x, 160, 84, 22); SHED(x + 160, 160, 84, 22);
  BOX(c, '#141416', x + 8, G - 66, 102, 32); c.font = '700 18px Amiri'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#d9b05a'; c.direction = 'rtl'; c.fillText('لبيك يا حسين', x + 59, G - 50); c.direction = 'ltr';
  BOX(c, '#141416', x + 210, G - 66, 102, 32); c.fillStyle = '#d9b05a'; c.font = '700 14px Amiri'; c.direction = 'rtl'; c.fillText('مسجد علي', x + 261, G - 50); c.direction = 'ltr';
  P(c, '#2f3f55', [[x + 92, G], [x + 160, G - 124], [x + 228, G]], true); c.save(); c.beginPath(); c.moveTo(x + 97, G); c.lineTo(x + 160, G - 116); c.lineTo(x + 223, G); c.closePath(); c.clip();
  for (let i = 0; i < 17; i++) R(c, i % 2 ? '#4a6a8a' : '#5d82a4', x + 94 + i * 8, G - 120, 8, 120); for (let j = 0; j < 10; j++) R(c, '#2f3f55', x + 92, G - 116 + j * 12, 136, 1); R(c, 'rgba(255,255,255,.2)', x + 130, G - 80, 5, 80); c.restore();
  BOX(c, '#2f3f55', x + 150, G - 30, 20, 30); R(c, '#9fc1d8', x + 152, G - 28, 16, 28); R(c, '#2f3f55', x + 159, G - 28, 2, 28);
  R(c, '#6a6e76', x + 160, G - 160, 1, 36); CIRC(c, '#c9ccd0', x + 160, G - 161, 3); P(c, '#5a2a4a', [[x + 161, G - 154], [x + 170, G - 148], [x + 161, G - 144]]);
} };

L.jdgyms = { n: 'JD Gyms', w: 288, d(c, x0, G) { const x = x0 - 36;   // middle block keeps its layout; the wings are trimmed to 84 wide
  const CL = '#c9ced6';
  for (const bx of [x0, x0 + 204]) { BOX(c, CL, bx, G - 104, 84, 104); for (let i = 0; i < 6; i++) R(c, '#b6bcc5', bx, G - 88 + i * 14, 84, 1); BOX(c, '#3a3f4a', bx - 2, G - 112, 88, 10); R(c, '#4a505c', bx - 2, G - 107, 88, 1); BOX(c, '#2a3036', bx + 6, G - 56, 72, 56); for (let i = 0; i < 4; i++) R(c, '#3e4a56', bx + 9 + i * 17, G - 52, 14, 48); }   // side wings 30% narrower
  BOX(c, '#d4d8de', x + 112, G - 144, 136, 144);
  P(c, '#cdd1d7', [[x + 96, G - 152], [x + 264, G - 152], [x + 256, G - 162], [x + 104, G - 162]], true); for (const px of [x + 104, x + 252]) BOX(c, '#9aa3ad', px, G - 152, 4, 152);
  BOX(c, '#2f3a4c', x + 112, G - 148, 136, 46); R(c, '#3a4760', x + 112, G - 148, 136, 3);
  CIRC(c, OUT, x + 140, G - 125, 18); CIRC(c, '#ffffff', x + 140, G - 125, 17);
  c.font = '700 15px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2f3a4c'; c.fillText('JD', x + 141, G - 124);
  c.font = '700 18px Silk'; c.fillStyle = '#ffffff'; c.fillText('GYMS', x + 204, G - 124); c.textBaseline = 'top';
  const BR = (bx, by, sx, sy) => { R(c, '#8be03a', bx, by, 9 * sx, 3); R(c, '#8be03a', sx < 0 ? bx - 3 : bx, by, 3, 9 * sy); };
  BR(x + 166, G - 142, 1, 1); BR(x + 242, G - 142, -1, 1); BR(x + 166, G - 109, 1, -1); BR(x + 242, G - 109, -1, -1);
  P(c, '#cdd1d7', [[x + 98, G - 92], [x + 262, G - 92], [x + 254, G - 102], [x + 106, G - 102]], true); R(c, '#9aa3ad', x + 106, G - 92, 148, 2);
  BOX(c, '#26303d', x + 116, G - 90, 128, 90); for (let i = 0; i < 6; i++) R(c, '#33404f', x + 118 + i * 21, G - 88, 19, 40);
  BOX(c, '#121418', x + 112, G - 53, 136, 12); T(c, 'WELCOME JD GYMS LUTON', x + 180, G - 51, 8, '#ffffff', 'center', false);
  R(c, '#9fc1d8', x + 150, G - 40, 60, 40); R(c, '#26303d', x + 179, G - 40, 2, 40); R(c, 'rgba(255,255,255,.3)', x + 156, G - 38, 3, 30);
} };

L.bigyellow = { n: 'Big Yellow Self Storage', w: 300, d(c, x, G) {
  const Y = '#f6d21a';
  BOX(c, Y, x, G - 150, 300, 110); for (let i = 0; i < 75; i++) R(c, '#e6c210', x + i * 4, G - 150, 1, 110); R(c, '#d9b70c', x, G - 96, 300, 2); R(c, '#2a2a2e', x, G - 151, 300, 2);
  const SG = (sx, sy, w, h, l1, l2) => { BOX(c, '#1a1a1e', sx, sy, w, h); T(c, l1, sx + w / 2, sy + 2, 8, '#ffffff', 'center', false); if (l2) T(c, l2, sx + w / 2, sy + 11, 8, '#f6d21a', 'center', false); };
  SG(x + 14, G - 132, 56, 22, 'SELF', 'STORAGE'); SG(x + 196, G - 132, 90, 22, 'BOXES &', 'PACKING');
  BOX(c, '#1a1a1e', x + 102, G - 146, 62, 42); T(c, 'THE BIG', x + 133, G - 143, 8, '#ffffff', 'center', false); T(c, 'YELLOW', x + 133, G - 133, 8, Y); T(c, 'SELF', x + 133, G - 123, 8, Y); T(c, 'STORAGE', x + 133, G - 113, 8, '#ffffff', 'center', false);
  BOX(c, '#f1f1ee', x + 4, G - 42, 256, 8); BOX(c, '#3a3d44', x, G - 40, 300, 40); for (let i = 0; i < 30; i++) R(c, '#30333a', x + i * 10, G - 40, 1, 40);
  BOX(c, '#f4f4f2', x + 6, G - 34, 70, 34); T(c, 'Reception', x + 30, G - 32, 8, '#c8202a', 'center', false); R(c, '#9fc1d8', x + 50, G - 24, 22, 24); R(c, '#2a2a2e', x + 60, G - 24, 1, 24);
  for (let i = 0; i < 22; i++) R(c, '#2a2a2e', x + 84 + i * 10, G - 22, 1, 22); R(c, '#2a2a2e', x + 84, G - 22, 216, 1);
  BOX(c, '#f4f2ec', x + 250, G - 34, 16, 12); R(c, '#c8202a', x + 252, G - 32, 12, 3); R(c, '#9aa3ad', x + 257, G - 22, 2, 22);
} };

L.bandq = { n: 'B&Q', w: 440, d(c, x, G) {
  const CL = '#c9ced6';
  BOX(c, CL, x, G - 76, 440, 76); for (let i = 0; i < 6; i++) R(c, '#b6bcc5', x, G - 66 + i * 12, 440, 1); BOX(c, '#e8641c', x - 2, G - 82, 444, 6); R(c, '#c94e10', x - 2, G - 78, 444, 2);
  for (const bx of [x + 10, x + 330]) { BOX(c, '#3a3f4a', bx, G - 30, 100, 30); for (let i = 0; i < 8; i++) R(c, '#2e333c', bx + 4 + i * 12, G - 28, 10, 28); }
  BOX(c, CL, x + 150, G - 150, 140, 150); BOX(c, '#e8641c', x + 146, G - 158, 148, 10); R(c, '#c94e10', x + 146, G - 150, 148, 2);
  GLASS(c, x + 154, G - 146, 132, 104, '#4a6a86', 6, 4);
  BOX(c, '#e8641c', x + 166, G - 140, 108, 44); R(c, '#f58a3c', x + 166, G - 140, 108, 3);
  c.font = '700 40px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (const [ch, cx, px] of [['B', x + 188, 40], ['&', x + 220, 22], ['Q', x + 252, 40]]) { c.font = ch === '&' ? `${px}px PS` : `700 ${px}px Silk`; c.fillStyle = '#9a3a08'; c.fillText(ch, cx + 2, G - 116); c.fillStyle = '#ffffff'; c.fillText(ch, cx, G - 118); }
  BOX(c, '#e8641c', x + 154, G - 42, 132, 8);
  BOX(c, '#2a3036', x + 170, G - 34, 100, 34); R(c, '#9fc1d8', x + 186, G - 30, 30, 30); R(c, '#9fc1d8', x + 224, G - 30, 30, 30);
} };

L.lidl = { n: 'Lidl', w: 260, d(c, x, G) {
  P(c, '#d6d9de', [[x - 8, G - 118], [x + 268, G - 118], [x + 260, G - 128], [x, G - 128]], true);
  BOX(c, '#c9b8a3', x, G - 118, 260, 52); for (let i = 0; i < 52; i++) R(c, ['#b8a690', '#d6c8b4', '#a8967f', '#cfc0aa'][i % 4], x + i * 5, G - 118, 3, 52);
  GLASS(c, x, G - 66, 170, 66, '#4a6a86', 8, 2);
  // inside: bright store, shelves stocked with goods, fruit & veg crates at the front
  R(c, '#e9eef2', x + 2, G - 62, 166, 46); for (let k = 0; k < 3; k++) { const sy = G - 58 + k * 13; R(c, '#9aa3ad', x + 4, sy + 9, 162, 2); for (let i = 0; i < 40; i++) R(c, ['#d84b3c', '#1f52b0', '#f2c43a', '#2f8a4a', '#e8a33c', '#ffffff', '#b8292f'][(i * 3 + k * 5) % 7], x + 5 + i * 4, sy + 2 + ((i + k) % 3), 3, 7 - ((i + k) % 3)); }
  for (let i = 0; i < 6; i++) { const cx = x + 8 + i * 27; R(c, '#7a5a3a', cx, G - 18, 22, 6); for (let k = 0; k < 5; k++) CIRC(c, ['#2f8a4a', '#d84b3c', '#e8a33c', '#f2d23a', '#7fbf4a', '#d84b6a'][i], cx + 3 + k * 4, G - 20, 2); }
  R(c, 'rgba(120,160,190,.3)', x + 2, G - 62, 166, 58); for (let i = 0; i < 9; i++) R(c, '#3a4a5a', x + i * 21, G - 66, 2, 66); R(c, 'rgba(255,255,255,.35)', x + 30, G - 62, 3, 40); R(c, 'rgba(255,255,255,.35)', x + 110, G - 62, 3, 40);
  BOX(c, '#2a3036', x + 170, G - 66, 90, 66); for (let i = 0; i < 4; i++) { CIRC(c, '#7fbf4a', x + 186 + i * 20, G - 40, 6); CIRC(c, '#f4f2ec', x + 186 + i * 20, G - 40, 3); } for (const px of [x + 172, x + 214, x + 256]) BOX(c, '#ecebe7', px, G - 66, 4, 66);
  const LOGO = (lx, ly, sz) => { BOX(c, '#1f52b0', lx, ly, sz, sz); CIRC(c, '#d32f2f', lx + sz / 2, ly + sz / 2, sz / 2 - 3); CIRC(c, '#ffe23a', lx + sz / 2, ly + sz / 2, sz / 2 - 5); T(c, 'LIDL', lx + sz / 2, ly + sz / 2 - 4, 8, '#1f52b0'); R(c, '#d32f2f', lx + sz / 2 - 3, ly + sz / 2 - 7, 2, 2); };
  LOGO(x + 108, G - 116, 44);
  for (let i = 0; i < 8; i++) { R(c, '#ecebe7', x + 14 + i * 20, G - 16, 2, 16); R(c, '#9aa3ad', x + 14 + i * 20, G - 12, 20, 1); }
} };

L.matalan = { n: 'Matalan', w: 360, d(c, x, G) {
  const RD = '#d2232a'; c.save(); c.translate(-40, 0);
  for (const [bx, bw] of [[x + 40, 110], [x + 290, 110]]) {
    BOX(c, '#f1efe9', bx, G - 78, bw, 78); BOX(c, RD, bx - 2, G - 84, bw + 4, 6); R(c, '#a81a20', bx - 2, G - 79, bw + 4, 1);
    for (let i = 0; i < 3; i++) { const px = bx + 6 + i * (bw - 12) / 3; BRICK(c, px, G - 78, 12, 78, '#a8503a', '#94452f'); R(c, OUT, px - 1, G - 78, 1, 78); }
    BRICK(c, bx, G - 30, bw, 30, '#a8503a', '#94452f'); R(c, RD, bx, G - 31, bw, 2);
  }
  BOX(c, '#26303d', x + 62, G - 74, 36, 44); for (let j = 0; j < 3; j++) R(c, RD, x + 62, G - 74 + j * 15, 36, 2); R(c, RD, x + 79, G - 74, 2, 44);
  BOX(c, RD, x + 352, G - 44, 30, 44); R(c, '#a81a20', x + 366, G - 44, 2, 44);
  for (const [px, col] of [[x + 106, '#f4f2ec'], [x + 126, '#2a6fa8'], [x + 316, '#2a6fa8'], [x + 334, '#f4f2ec']]) BOX(c, col, px, G - 28, 14, 20);
  BRICK(c, x + 150, G - 130, 140, 130, '#a8503a', '#94452f'); R(c, OUT, x + 149, G - 131, 142, 1);
  P(c, RD, [[x + 132, G - 158], [x + 308, G - 158], [x + 298, G - 150], [x + 142, G - 150]], true); BOX(c, RD, x + 154, G - 150, 132, 26); R(c, '#e8424a', x + 154, G - 150, 132, 2);
  T(c, 'MATALAN', x + 220, G - 145, 16, '#ffffff');
  for (const [gx, red] of [[x + 158, false], [x + 224, true]]) { BOX(c, '#26303d', gx, G - 118, 58, 118); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) R(c, (i + j) % 2 ? '#4a6a86' : '#5d7d98', gx + 2 + i * 14, G - 116 + j * 18, 12, 16); R(c, RD, gx, G - 46, 58, 3); if (red) { BOX(c, RD, gx, G - 44, 58, 44); R(c, '#a81a20', gx + 28, G - 44, 2, 44); } else { R(c, '#9fc1d8', gx + 6, G - 40, 46, 40); R(c, RD, gx + 28, G - 40, 2, 40); R(c, RD, gx + 6, G - 26, 46, 2); } }
  for (let i = 0; i < 13; i++) { const bx = x + 46 + i * 28; BOX(c, RD, bx, G - 14, 4, 14); R(c, '#f06a70', bx, G - 14, 1, 14); }
  c.restore();
} };

L.spudkingz = { n: 'Spud Kingz', w: 210, d(c, x, G) {
  for (const wx of [x + 118, x + 140]) { CIRC(c, OUT, wx, G - 9, 9); CIRC(c, '#1a1a1e', wx, G - 9, 8); CIRC(c, '#9aa3ad', wx, G - 9, 4); CIRC(c, '#2a2a2e', wx, G - 9, 1.5); }   // wheels sit under the trailer
  P(c, '#141416', [[x + 4, G - 9], [x + 4, G - 78], [x + 14, G - 86], [x + 196, G - 86], [x + 206, G - 78], [x + 206, G - 9]], true); R(c, 'rgba(255,255,255,.12)', x + 8, G - 82, 194, 2); R(c, 'rgba(255,255,255,.08)', x + 20, G - 70, 6, 46);
  BOX(c, '#d9dde2', x + 48, G - 80, 136, 6); P(c, '#c9ced4', [[x + 46, G - 80], [x + 186, G - 80], [x + 180, G - 90], [x + 52, G - 90]], true);
  BOX(c, '#d9dde2', x + 52, G - 72, 128, 34); R(c, '#2a2c30', x + 56, G - 70, 120, 26); for (let i = 0; i < 4; i++) BOX(c, ['#c8202a', '#2f6fb5', '#9aa3ad', '#e8a33c'][i], x + 110 + i * 5, G - 52, 4, 8); R(c, '#e8e8e6', x + 140, G - 52, 26, 8); R(c, '#d9dde2', x + 52, G - 44, 128, 3);
  BOX(c, '#f4f2ec', x + 184, G - 76, 16, 46); for (let i = 0; i < 10; i++) R(c, '#9aa3ad', x + 186, G - 72 + i * 4, 12, 1);
  T(c, 'Crowned in Flavour', x + 112, G - 37, 8, '#d9b05a', 'center', false); T(c, 'ROOTED IN COMMUNITY', x + 112, G - 28, 8, '#d9b05a', 'center', false);
  R(c, '#2a2a2e', x + 196, G - 9, 3, 9);
  // sign frame bolted to the trailer roof: two posts + black board, text on one line, potato sitting on top
  const SX = x + 110;   // a thin black rail behind the letters, bolted to the roof with two posts
  for (const px of [SX - 72, SX + 69]) R(c, '#141416', px, G - 104, 3, 18);
  { c.font = '700 18px Silk'; const tw = c.measureText('Spud Kingz').width; R(c, '#141416', Math.round(SX - tw / 2) + 4, G - 105, Math.round(tw) - 8, 3); }
  c.font = '700 18px Silk'; const w1 = c.measureText('Spud ').width, w2 = c.measureText('Kingz').width, sx0 = Math.round(SX - (w1 + w2) / 2);
  TS(c, 'Spud', sx0, G - 113, 18, '#5fd36a', '#0a0a0c', 'left'); TS(c, 'Kingz', sx0 + w1, G - 113, 18, '#f6c933', '#0a0a0c', 'left');
  // open jacket potato: oval brown skin, split along the top with fluffy filling and butter, crown on top
  const EL = (col, rx, ry, oy) => { c.fillStyle = col; c.beginPath(); c.ellipse(SX, G - 122 + (oy || 0), rx, ry, 0, 0, 7); c.fill(); };
  EL(OUT, 20, 11); EL('#b9803c', 19, 10); EL('#9c6a2e', 18, 6, 4); R(c, '#7a5230', SX - 13, G - 118, 2, 2); R(c, '#7a5230', SX + 11, G - 116, 2, 2); R(c, '#d29a52', SX - 15, G - 126, 3, 2);
  P(c, OUT, [[SX - 14, G - 127], [SX - 8, G - 133], [SX + 8, G - 133], [SX + 14, G - 127], [SX + 8, G - 123], [SX - 8, G - 123]], true);
  P(c, '#c99a5e', [[SX - 12, G - 127], [SX - 7, G - 132], [SX + 7, G - 132], [SX + 12, G - 127], [SX + 7, G - 124], [SX - 7, G - 124]], true);
  R(c, '#dcb27a', SX - 6, G - 131, 4, 2); R(c, '#dcb27a', SX + 3, G - 130, 3, 2); R(c, '#9c6a2e', SX - 9, G - 126, 3, 1); R(c, '#9c6a2e', SX + 5, G - 125, 4, 1);
  P(c, '#f2c43a', [[SX - 11, G - 135], [SX - 10, G - 147], [SX - 5, G - 140], [SX, G - 150], [SX + 5, G - 140], [SX + 10, G - 147], [SX + 11, G - 135]], true);
} };

L.station = { n: 'Luton Station', w: 270, d(c, x, G) {
  // viaduct + overhead wires behind (the train runs on top of this in the game)
  for (const px of [x + 20, x + 130, x + 240]) { BOX(c, '#9aa0a6', px, G - 92, 10, 30); R(c, '#6a6e76', px + 4, G - 136, 2, 44); R(c, '#6a6e76', px - 6, G - 132, 16, 2); }
  BOX(c, '#b3b8be', x - 6, G - 92, 282, 8); R(c, '#8a9098', x - 6, G - 86, 282, 2); R(c, '#4a4d54', x - 6, G - 94, 282, 2); R(c, '#3a3d44', x - 6, G - 129, 282, 1);
  // glass block right
  BOX(c, '#26303d', x + 210, G - 66, 60, 66); R(c, '#cfd8e0', x + 212, G - 64, 56, 22); R(c, '#2a5fb0', x + 212, G - 40, 56, 40); R(c, '#cfd8e0', x + 239, G - 64, 1, 64); BOX(c, '#3a3d44', x + 206, G - 70, 68, 5);
  // brick hall
  BRICK(c, x, G - 74, 210, 74, '#7a4e3a', '#6a4232'); R(c, OUT, x - 1, G - 75, 212, 1); R(c, OUT, x - 1, G - 74, 1, 74); BOX(c, '#b9b3a6', x - 2, G - 78, 214, 4);
  for (let i = 0; i < 3; i++) WIN(c, x + 34 + i * 20, G - 64, 16, 12, '#f4f2ec', '#5a6470');
  WIN(c, x + 2, G - 64, 12, 22, '#f4f2ec', '#9fc1d8');
  // door + Welcome to Luton sign
  BOX(c, '#1f3f8a', x + 104, G - 60, 62, 22); BOX(c, '#ffffff', x + 106, G - 58, 58, 18); T(c, 'Welcome to', x + 135, G - 58, 8, '#1f3f8a', 'center', false); T(c, 'Luton', x + 135, G - 49, 8, '#1f3f8a');
  BOX(c, '#1f3f8a', x + 112, G - 38, 46, 38); R(c, '#3a3d44', x + 116, G - 36, 38, 36); BOX(c, '#b08a5a', x + 116, G - 36, 14, 36); R(c, '#9aa3ad', x + 136, G - 22, 16, 2); PERSON(c, x + 140, G, '#d84b6a', '#2a2a33', '#e2b38a', '#1a1a1e');
  // National Rail sign
  BOX(c, '#d32f2f', x + 192, G - 70, 14, 20); R(c, '#ffffff', x + 195, G - 64, 8, 1); R(c, '#ffffff', x + 195, G - 59, 8, 1); R(c, '#ffffff', x + 197, G - 66, 2, 2); R(c, '#ffffff', x + 199, G - 57, 2, 2); BOX(c, '#f4f2ec', x + 192, G - 50, 14, 8);
  // posters, cash machine, defib
  BOX(c, '#f4f2ec', x + 6, G - 36, 18, 22); R(c, '#d84b6a', x + 9, G - 32, 12, 6); BOX(c, '#1f3f8a', x + 28, G - 38, 16, 24); R(c, '#f4f2ec', x + 30, G - 36, 12, 20); BOX(c, '#f4f2ec', x + 48, G - 36, 14, 22);
  BOX(c, '#1a1a1e', x + 70, G - 44, 18, 32); R(c, '#3fb04a', x + 70, G - 44, 18, 3); R(c, '#9fc1d8', x + 74, G - 38, 10, 8); R(c, '#5a6470', x + 74, G - 26, 10, 4);
  BOX(c, '#f4f2ec', x + 92, G - 38, 14, 22); BOX(c, '#f4f2ec', x + 164, G - 38, 18, 24); BOX(c, '#f2c43a', x + 186, G - 34, 12, 14); R(c, '#2e8b3a', x + 189, G - 31, 6, 4);
} };

L.inspire = { n: 'Inspire Luton Sports Village', w: 440, d(c, x, G) {
  const B = '#a8503a', BL = '#94452f';
  // middle lower wing
  BRICK(c, x + 120, G - 104, 110, 104, B, BL); R(c, OUT, x + 119, G - 105, 112, 1); BOX(c, '#e8e8e6', x + 118, G - 108, 114, 4);
  for (const wx of [x + 130, x + 170, x + 206]) { BOX(c, '#26303d', wx, G - 90, 18, 30); R(c, '#4a6a86', wx + 2, G - 88, 14, 26); BOX(c, '#26303d', wx, G - 44, 18, 30); R(c, '#3a4a5a', wx + 2, G - 42, 14, 26); }
  // right: glass + brick portico
  BOX(c, '#e8e8e6', x + 226, G - 146, 218, 6);
  GLASS(c, x + 232, G - 140, 204, 140, '#5d82a4', 10, 4); R(c, '#26303d', x + 232, G - 70, 204, 3);
  for (const px of [x + 230, x + 278, x + 326, x + 374, x + 420]) { BRICK(c, px, G - 140, 14, 140, B, BL); R(c, OUT, px - 1, G - 140, 1, 140); R(c, OUT, px + 14, G - 140, 1, 140); }
  BRICK(c, x + 230, G - 140, 204, 12, B, BL); R(c, OUT, x + 229, G - 141, 206, 1);
  BOX(c, '#26303d', x + 296, G - 40, 26, 40); R(c, '#9fc1d8', x + 298, G - 38, 10, 38); R(c, '#9fc1d8', x + 310, G - 38, 10, 38);
  // left tall sports hall with the logo
  BRICK(c, x, G - 160, 156, 160, B, BL); R(c, OUT, x - 1, G - 161, 158, 1); R(c, OUT, x - 1, G - 160, 1, 160); R(c, OUT, x + 156, G - 160, 1, 160); BOX(c, '#e8e8e6', x - 2, G - 164, 160, 5);
  c.strokeStyle = '#f4f2ec'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x + 78, G - 108, 70, 30, 0, 0, Math.PI * 2); c.stroke();
  CIRC(c, '#f4f2ec', x + 26, G - 126, 3); P(c, '#f4f2ec', [[x + 16, G - 106], [x + 24, G - 120], [x + 30, G - 118], [x + 22, G - 104]]); P(c, '#f4f2ec', [[x + 24, G - 120], [x + 38, G - 130], [x + 40, G - 127], [x + 28, G - 116]]);
  T(c, 'inspire', x + 88, G - 124, 16, '#f4f2ec'); T(c, 'Luton Sports Village', x + 82, G - 104, 8, '#f4f2ec', 'center', false);
  BOX(c, '#f4f2ec', x + 8, G - 52, 8, 6);
} };

L.stockwood = { n: 'Stockwood Discovery Centre', w: 380, d(c, x, G) {
  // trees behind
  for (const [tx, r, kd] of [[x + 20, 30, 3], [x + 120, 36, 0], [x + 250, 34, 2], [x + 340, 30, 1]]) CROWN(c, tx, G - 90, r, '#3f6f34', '#4f8a3c', kd);
  // one-storey building: grey brick wall + timber cafe front
  BRICK(c, x, G - 52, 160, 52, '#a8a49c', '#96928a'); R(c, OUT, x - 1, G - 53, 162, 1); BOX(c, '#e8e3d6', x - 2, G - 56, 164, 4);
  BOX(c, '#c9a36a', x + 70, G - 52, 90, 52); for (let i = 0; i < 5; i++) { BOX(c, '#b08a52', x + 72 + i * 17, G - 46, 15, 46); R(c, '#2a2f38', x + 74 + i * 17, G - 44, 11, 42); R(c, 'rgba(255,255,255,.18)', x + 75 + i * 17, G - 42, 2, 30); }
  BOX(c, '#d9c49a', x + 66, G - 58, 98, 6);
  // pergola entrance
  for (const px of [x + 18, x + 48]) BOX(c, '#c9a36a', px, G - 44, 4, 44); BOX(c, '#c9a36a', x + 12, G - 48, 44, 4); for (let i = 0; i < 6; i++) R(c, '#a8844e', x + 14 + i * 7, G - 50, 3, 2);
  BOX(c, '#3a2a20', x + 26, G - 36, 18, 36); R(c, '#9fc1d8', x + 28, G - 34, 6, 30); R(c, '#9fc1d8', x + 36, G - 34, 6, 30);
  BOX(c, '#5a2a6a', x + 4, G - 72, 150, 13); T(c, 'STOCKWOOD DISCOVERY', x + 79, G - 70, 8, '#ffffff', 'center');
  // walled garden: brick wall + trellis
  BRICK(c, x + 164, G - 46, 216, 46, '#a8603e', '#94523a'); R(c, OUT, x + 163, G - 47, 218, 1);
  for (let i = 0; i < 27; i++) R(c, '#c9a36a', x + 166 + i * 8, G - 62, 1, 16); for (let j = 0; j < 4; j++) R(c, '#c9a36a', x + 164, G - 62 + j * 5, 216, 1);
  BOX(c, '#e8e3d6', x + 270, G - 76, 8, 30); P(c, '#e8e3d6', [[x + 270, G - 76], [x + 274, G - 86], [x + 278, G - 76]], true);
  // knot-garden hedges
  for (let i = 0; i < 6; i++) { BOX(c, '#3f7d33', x + 168 + i * 35, G - 14, 30, 14); R(c, '#5a9a44', x + 170 + i * 35, G - 14, 26, 3); }
  // urns with flowers
  const URN = (ux) => { BOX(c, '#e8e3d6', ux, G - 20, 6, 20); BOX(c, '#e8e3d6', ux - 5, G - 30, 16, 10); for (let i = 0; i < 7; i++) CIRC(c, ['#d84b3c', '#f2c14e', '#e0458a', '#7a4fb5'][i % 4], ux - 4 + i * 2.4, G - 33 - (i % 2) * 2, 2); };
  URN(x + 196); URN(x + 344);
  // well with iron arch
  BOX(c, '#a8a49c', x + 252, G - 14, 34, 14); R(c, '#8a8680', x + 252, G - 10, 34, 1); c.strokeStyle = '#1a1a1e'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 256, G - 14); c.quadraticCurveTo(x + 269, G - 60, x + 282, G - 14); c.stroke(); R(c, '#1a1a1e', x + 268, G - 50, 2, 6);
  // spiral topiary
  for (const tx of [x + 226, x + 316]) for (let k = 0; k < 4; k++) CIRC(c, k % 2 ? '#4f8a3c' : '#3f7d33', tx, G - 18 - k * 9, 6 - k);
} };

L.gurdwara = { n: 'Guru Nanak Gurdwara', w: 440, d(c, x, G) {
  const B = '#9a6a4e', BL = '#87593f', WH = '#f1efea', GD = '#e0b23a';
  const AW = (wx, wy, w, h, lit) => { R(c, OUT, wx - 1, wy - 1, w + 2, h + 2); R(c, WH, wx, wy, w, h); R(c, lit ? '#f6d98a' : '#c9d6e0', wx + 1, wy + 1, w - 2, h - 2); CIRC(c, OUT, wx + w / 2, wy, w / 2 + 1); CIRC(c, WH, wx + w / 2, wy, w / 2); CIRC(c, lit ? '#f6d98a' : '#c9d6e0', wx + w / 2, wy, w / 2 - 1); R(c, WH, wx + w / 2, wy - w / 2, 1, h + w / 2); R(c, WH, wx, wy + h * .4, w, 1); R(c, WH, wx - 2, wy + h, w + 4, 2); };
  // trees behind
  for (const tx of [x + 10, x + 430]) { CIRC(c, OUT, tx, G - 70, 26); CIRC(c, '#2f5f34', tx, G - 70, 25); }
  // main brick body
  BRICK(c, x + 30, G - 150, 380, 150, B, BL); R(c, OUT, x + 29, G - 151, 382, 1); BOX(c, WH, x + 28, G - 154, 384, 4);
  BRICK(c, x + 150, G - 160, 140, 10, B, BL); BOX(c, WH, x + 148, G - 162, 144, 3);
  // upper windows
  for (let i = 0; i < 6; i++) AW(x + 40 + i * 20, G - 136, 12, 18, i % 3 === 0);
  for (let i = 0; i < 6; i++) AW(x + 290 + i * 20, G - 136, 12, 18, i % 2 === 0);
  for (const wx of [x + 156, x + 172, x + 256, x + 272]) AW(wx, G - 140, 12, 20, true);
  for (const wx of [x + 160, x + 270]) AW(wx, G - 98, 12, 20, true);
  // ground floor (under the deck)
  R(c, '#6e4a36', x + 30, G - 40, 380, 40); for (let i = 0; i < 12; i++) { BOX(c, WH, x + 40 + i * 31, G - 32, 16, 18); R(c, i % 3 ? '#c9d6e0' : '#f6d98a', x + 42 + i * 31, G - 30, 12, 14); }
  // deck + railing
  BOX(c, WH, x - 2, G - 46, 444, 6); for (let i = 0; i < 74; i++) R(c, '#c9ced4', x + i * 6, G - 58, 1, 12); R(c, '#c9ced4', x, G - 58, 440, 1);
  // side arcades
  for (const [ax, aw] of [[x, 110], [x + 330, 110]]) { BOX(c, WH, ax, G - 112, aw, 10); const n = 4; for (let i = 0; i <= n; i++) { const px = ax + 2 + i * (aw - 8) / n; BOX(c, WH, px, G - 102, 5, 56); } for (let i = 0; i < n; i++) { const cx = ax + 4 + (i + .5) * (aw - 8) / n; CIRC(c, WH, cx, G - 102, 12); CIRC(c, '#9aa3ad', cx, G - 98, 9); R(c, '#9aa3ad', cx - 9, G - 98, 18, 8); } R(c, WH, ax, G - 104, aw, 2); for (let i = 0; i <= n; i++) BOX(c, WH, ax + 2 + i * (aw - 8) / n, G - 40, 5, 40); }
  for (let i = 0; i < n2(); i++); function n2() { return 0; }
  // central portal
  BOX(c, WH, x + 186, G - 190, 68, 190); P(c, B, [[x + 194, G - 60], [x + 194, G - 140], [x + 220, G - 172], [x + 246, G - 140], [x + 246, G - 60]]); for (let j = 0; j < 20; j++) R(c, BL, x + 194, G - 142 + j * 4, 52, 1);
  CIRC(c, OUT, x + 220, G - 124, 10); CIRC(c, WH, x + 220, G - 124, 9); CIRC(c, '#f6d98a', x + 220, G - 124, 7); R(c, WH, x + 220, G - 131, 1, 14); R(c, WH, x + 213, G - 124, 14, 1);
  P(c, WH, [[x + 206, G - 74], [x + 220, G - 90], [x + 234, G - 74]], true); BOX(c, '#f6d98a', x + 208, G - 74, 24, 28); R(c, WH, x + 219, G - 74, 2, 28);
  for (const cx of [x + 186, x + 248]) { BOX(c, WH, cx, G - 168, 6, 168); R(c, '#dcd8d0', cx + 4, G - 168, 2, 168); }
  BOX(c, WH, x + 180, G - 196, 80, 8);
  // dome + finials
  BOX(c, WH, x + 196, G - 214, 48, 18); for (let i = 0; i < 4; i++) R(c, '#9aa3ad', x + 200 + i * 11, G - 210, 8, 12);
  CIRC(c, OUT, x + 220, G - 216, 21); CIRC(c, WH, x + 220, G - 216, 20); R(c, WH, x + 199, G - 216, 42, 6); R(c, '#dcd8d0', x + 230, G - 232, 6, 18); R(c, GD, x + 219, G - 246, 3, 10); CIRC(c, GD, x + 220, G - 236, 2);
  for (const fx of [x + 184, x + 256]) { CIRC(c, OUT, fx, G - 200, 5); CIRC(c, GD, fx, G - 200, 4); R(c, GD, fx, G - 207, 1, 3); }
  // corner towers
  for (const tx of [x + 26, x + 404]) { BOX(c, WH, tx, G - 176, 12, 176); R(c, GD, tx, G - 150, 12, 2); CIRC(c, OUT, tx + 6, G - 180, 8); CIRC(c, WH, tx + 6, G - 180, 7); R(c, '#3a3d44', tx + 5, G - 194, 2, 8); }
  // sign
  BOX(c, WH, x + 158, G - 51, 124, 26); R(c, '#1f2f6a', x + 160, G - 49, 120, 1); R(c, '#1f2f6a', x + 160, G - 27, 120, 1);   // room under LUTON so nothing looks cut off
  T(c, 'GURU NANAK GURDWARA', x + 220, G - 46, 8, '#1f2f6a', 'center', false); T(c, 'LUTON', x + 220, G - 37, 8, '#1f2f6a', 'center', false);
  for (const kx of [x + 152, x + 284]) { CIRC(c, '#1f3f8a', kx + 2, G - 37, 3); R(c, '#1f3f8a', kx + 1, G - 45, 2, 13); }
  // stairs
  for (const [sx, dir] of [[x + 120, 1], [x + 290, -1]]) for (let i = 0; i < 10; i++) R(c, i % 2 ? '#b9bcc0' : '#a8abb0', sx + (dir > 0 ? i * 3 : 30 - i * 3), G - 44 + i * 4.4, 30, 4);
} };

L.cycleking = { n: 'Cycle King', w: 344, d(c, x, G) {
  const B = '#9a4a34', BL = '#86402c', Y = '#f7d21e', RD = '#d8262f', WF = '#f2f0ea';
  // three brick blocks over the shops: tall left, low middle, tall right, each with a stepped parapet
  const block = (bx, bw, top) => { BRICK(c, bx, G - top, bw, top - 44, B, BL); R(c, OUT, bx - 1, G - top - 1, bw + 2, 1); R(c, OUT, bx - 1, G - top, 1, top - 44); R(c, OUT, bx + bw, G - top, 1, top - 44); R(c, '#7a3a28', bx, G - top, bw, 2); };
  block(x, 130, 160); block(x + 130, 104, 124); block(x + 234, 110, 150);
  for (const [px, pw, top] of [[x + 6, 24, 160], [x + 52, 26, 160], [x + 100, 24, 160], [x + 240, 26, 150], [x + 304, 34, 150]]) { BRICK(c, px, G - top - 8, pw, 8, B, BL); R(c, OUT, px - 1, G - top - 9, pw + 2, 1); R(c, OUT, px - 1, G - top - 8, 1, 8); R(c, OUT, px + pw, G - top - 8, 1, 8); }
  const win = (wx, wy, w, h) => { BOX(c, WF, wx, wy, w, h); R(c, '#6f8aa0', wx + 2, wy + 2, w - 4, h - 4); R(c, WF, wx + Math.floor(w / 2), wy + 2, 1, h - 4); R(c, WF, wx + 2, wy + 5, w - 4, 1); R(c, 'rgba(255,255,255,.4)', wx + 2, wy + 7, 2, h - 9); };
  win(x + 22, G - 150, 28, 18); R(c, '#e8e4dc', x + 22, G - 154, 28, 3); win(x + 84, G - 150, 22, 18);
  win(x + 16, G - 108, 26, 18); win(x + 56, G - 108, 22, 18); win(x + 96, G - 108, 16, 18);
  BOX(c, WF, x + 144, G - 120, 26, 10); R(c, '#6f8aa0', x + 146, G - 118, 22, 6); BOX(c, WF, x + 180, G - 120, 26, 10); R(c, '#6f8aa0', x + 182, G - 118, 22, 6); R(c, WF, x + 138, G - 108, 3, 40); R(c, WF, x + 220, G - 108, 3, 40);
  win(x + 244, G - 136, 14, 18); win(x + 274, G - 118, 18, 18); win(x + 308, G - 118, 22, 18); win(x + 274, G - 140, 18, 12);
  // yellow fascias with red frames, level with the other shop signs
  const sign = (sx, sw) => { BOX(c, RD, sx, G - 68, sw, 22); R(c, Y, sx + 2, G - 66, sw - 4, 18); };
  sign(x - 2, 132); sign(x + 130, 104); sign(x + 234, 112);
  const burst = (bx, by) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; R(c, RD, Math.round(bx + Math.cos(a) * 5) - 1, Math.round(by + Math.sin(a) * 3) - 1, 3, 2); } R(c, RD, bx - 5, by - 2, 11, 5); R(c, Y, bx - 3, by - 1, 7, 2); };
  const bike = (bx, by, col) => { c.strokeStyle = col; c.lineWidth = 1; for (const wx of [bx, bx + 9]) { c.beginPath(); c.arc(wx + .5, by + .5, 3, 0, 7); c.stroke(); } R(c, col, bx + 2, by - 3, 6, 1); R(c, col, bx + 4, by - 3, 1, 3); R(c, col, bx + 7, by - 5, 1, 3); R(c, col, bx + 6, by - 6, 3, 1); };
  burst(x + 9, G - 57); burst(x + 119, G - 57);
  T(c, 'CYCLE KING', x + 64, G - 63, 10, RD);
  R(c, RD, x + 132, G - 66, 100, 4); for (let i = 0; i < 14; i++) R(c, '#ffffff', x + 140 + i * 6, G - 65, 3, 1);
  T(c, 'CYCLE KING', x + 174, G - 59, 8, RD); bike(x + 214, G - 54, '#1b1a24');
  T(c, '7 DAYS A WEEK', x + 290, G - 60, 8, RD);
  // shopfronts: red pilasters, big windows full of bikes
  BOX(c, '#e9e6e0', x - 2, G - 46, 348, 46);
  for (const [wx, ww] of [[x + 4, 56], [x + 68, 56], [x + 140, 40], [x + 240, 46], [x + 292, 46]]) {
    BOX(c, '#3a4048', wx, G - 42, ww, 38); R(c, '#c8d4dc', wx + 2, G - 40, ww - 4, 4); for (let i = 0; i < 4; i++) R(c, '#f4f6e6', wx + 6 + i * (ww / 4), G - 39, ww / 8, 1);
    const cols = ['#e0302a', '#2a6fd8', '#f2c43a', '#3fae5a', '#e8641c', '#b23ad8', '#f4f2ec'];
    for (let row = 0; row < 2; row++) for (let i = 0; i * 13 < ww - 14; i++) bike(wx + 3 + i * 13 + row * 5, G - 24 + row * 13, cols[(i * 3 + row * 2 + wx) % cols.length]);
  }
  for (const px of [x - 2, x + 62, x + 128, x + 232, x + 286, x + 342]) BOX(c, RD, px, G - 46, 4, 46);
  BOX(c, '#2a2f38', x + 184, G - 42, 40, 42); R(c, '#9fb7c9', x + 187, G - 39, 15, 34); R(c, '#9fb7c9', x + 206, G - 39, 15, 34); R(c, '#2a2f38', x + 203, G - 39, 2, 34);
} };

L.toros = { n: "Toro's Steakhouse", w: 220, d(c, x, G) {
  const B = '#6a4234', BL = '#5a382c', WH = '#efece4';
  c.save(); c.translate(0, -18);
  BRICK(c, x, G - 178, 200, 130, B, BL); R(c, OUT, x - 1, G - 179, 202, 1); R(c, OUT, x - 1, G - 178, 1, 130); BOX(c, WH, x - 2, G - 184, 204, 8); R(c, '#d8d4ca', x - 2, G - 178, 204, 2);
  for (const [px, pw] of [[x + 20, 40], [x + 120, 44]]) { BOX(c, WH, px, G - 108, pw, 60); P(c, WH, [[px - 4, G - 108], [px + pw / 2, G - 120], [px + pw + 4, G - 108]], true); R(c, '#d8d4ca', px, G - 106, pw, 2); }
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const wx = x + 10 + i * 40, wy = r ? G - 102 : G - 166; WIN(c, wx, wy, 16, r ? 40 : 36, '#f4f2ec', '#9fb7c9'); R(c, WH, wx - 2, wy + (r ? 40 : 36), 20, 3); }
  for (let i = 0; i < 25; i++) R(c, WH, x + 2 + i * 8, G - 52, 4, 2);
  // shopfront sign: black fascia with a thin gold frame, bull head, TORO'S in red with a white edge, STEAKHOUSE in white
  BOX(c, '#1f1d1e', x - 2, G - 50, 204, 24); R(c, '#c9a64a', x, G - 48, 200, 1); R(c, '#c9a64a', x, G - 29, 200, 1);
  { const bx = x + 14, by = G - 38; P(c, '#f4f2ec', [[bx - 9, by - 7], [bx - 5, by - 3], [bx + 5, by - 3], [bx + 9, by - 7], [bx + 7, by - 1], [bx + 4, by], [bx + 3, by + 6], [bx, by + 8], [bx - 3, by + 6], [bx - 4, by], [bx - 7, by - 1]]); R(c, '#1f1d1e', bx - 3, by + 1, 2, 2); R(c, '#1f1d1e', bx + 1, by + 1, 2, 2); R(c, '#d8262f', bx - 1, by + 6, 2, 1); }
  c.font = '700 16px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#f4f2ec'; c.strokeText("TORO'S", x + 76, G - 38); c.fillStyle = '#d8262f'; c.fillText("TORO'S", x + 76, G - 38);
  T(c, 'STEAKHOUSE', x + 162, G - 42, 8, '#f4f2ec', 'center', false); R(c, '#c9a64a', x + 132, G - 33, 60, 1);
  c.restore();
  BOX(c, '#2f6a2e', x, G - 46, 200, 46); for (let i = 0; i < 180; i++) R(c, i % 2 ? '#24561f' : '#3e8238', x + (i * 37) % 198, G - 45 + (i * 13) % 44, 2, 2);
  // four windows, each looking into a different part of the restaurant (warm dark wood inside, a soft glare on the glass)
  const HEAD = (hx, hy, skin, hair, top) => { R(c, top, hx - 3, hy + 4, 7, 6); R(c, skin, hx - 2, hy, 5, 4); R(c, hair, hx - 2, hy - 1, 5, 2); };
  const CHAIR = (cx2, cy2, col) => { R(c, col, cx2, cy2 - 6, 2, 9); R(c, col, cx2, cy2 + 1, 6, 2); R(c, col, cx2 + 5, cy2 + 1, 1, 4); };
  for (let i = 0; i < 4; i++) { const wx = x + 10 + i * 36, wy = G - 41; BOX(c, '#1f1d1e', wx, G - 42, 30, 38);
    R(c, '#4a3026', wx + 1, wy, 28, 36); R(c, '#5a3a2c', wx + 1, wy, 28, 2); R(c, '#2e1e18', wx + 1, wy + 28, 28, 8); for (let k = 0; k < 4; k++) R(c, '#3a261e', wx + 1 + k * 8, wy + 29, 1, 7);   // wall, floor boards
    if (i === 0) {   // a table for two by the window, pendant lamp
      R(c, '#1a1210', wx + 14, wy, 1, 7); R(c, '#e8b84a', wx + 12, wy + 7, 5, 2); R(c, 'rgba(255,214,140,.25)', wx + 8, wy + 9, 13, 10);
      HEAD(wx + 8, wy + 14, '#c58c5c', '#1b1b1d', '#2f4a8a'); HEAD(wx + 21, wy + 14, '#e0b48a', '#5a3a1e', '#a83a32');
      R(c, '#7a4e32', wx + 6, wy + 22, 18, 2); R(c, '#5a3a24', wx + 14, wy + 24, 2, 6); R(c, '#f4f2ec', wx + 9, wy + 21, 4, 1); R(c, '#f4f2ec', wx + 17, wy + 21, 4, 1); R(c, '#b02a22', wx + 14, wy + 19, 1, 3);
    } else if (i === 1) {   // red leather booth with a family, framed bull picture on the wall
      BOX(c, '#c9a64a', wx + 9, wy + 3, 12, 8); R(c, '#2a1a14', wx + 11, wy + 5, 8, 4); R(c, '#f4f2ec', wx + 13, wy + 6, 4, 2);
      R(c, '#8a1e1e', wx + 2, wy + 15, 26, 10); R(c, '#a82a26', wx + 2, wy + 15, 26, 2);
      HEAD(wx + 7, wy + 13, '#8a5a3a', '#1b1b1d', '#e8e4dc'); HEAD(wx + 15, wy + 15, '#c58c5c', '#2a1a14', '#3e7a4a'); HEAD(wx + 23, wy + 13, '#c58c5c', '#1b1b1d', '#5a5f6e');
      R(c, '#7a4e32', wx + 3, wy + 24, 24, 2); R(c, '#f2c43a', wx + 8, wy + 23, 3, 1); R(c, '#e0703a', wx + 17, wy + 23, 4, 1);
    } else if (i === 2) {   // the counter: grill glow, a chef in whites, menu boards
      R(c, '#1f1d1e', wx + 2, wy + 3, 26, 7); for (let k = 0; k < 3; k++) { R(c, '#f4f2ec', wx + 4 + k * 8, wy + 5, 6, 1); R(c, '#f4f2ec', wx + 4 + k * 8, wy + 7, 4, 1); }
      R(c, '#e06a2a', wx + 2, wy + 12, 26, 3); R(c, 'rgba(255,150,60,.35)', wx + 2, wy + 11, 26, 6);
      HEAD(wx + 15, wy + 12, '#e0b48a', '#f4f2ec', '#f4f2ec'); R(c, '#f4f2ec', wx + 12, wy + 9, 7, 3);
      R(c, '#6a4a3a', wx + 1, wy + 20, 28, 9); R(c, '#8a6450', wx + 1, wy + 20, 28, 2); R(c, '#c9a64a', wx + 4, wy + 18, 3, 2); R(c, '#9aa3ad', wx + 22, wy + 17, 4, 3);
    } else {   // tall table with stools and a big plant in the corner
      R(c, '#e8b84a', wx + 20, wy + 6, 4, 2); R(c, '#1a1210', wx + 21, wy, 1, 6);
      R(c, '#7a4e32', wx + 10, wy + 17, 16, 2); R(c, '#5a3a24', wx + 17, wy + 19, 2, 10); CHAIR(wx + 8, wy + 20, '#2a1a14'); R(c, '#2a1a14', wx + 25, wy + 21, 2, 8);
      HEAD(wx + 21, wy + 9, '#8a5a3a', '#1b1b1d', '#c8202a'); R(c, '#f4f2ec', wx + 13, wy + 15, 3, 2); R(c, '#b07a3a', wx + 18, wy + 15, 2, 2);
      R(c, '#7a5a3a', wx + 2, wy + 22, 5, 7); CIRC(c, '#2f6a2e', wx + 5, wy + 16, 5); CIRC(c, '#3e8238', wx + 4, wy + 14, 3);
    }
    R(c, 'rgba(255,255,255,.1)', wx + 1, wy, 28, 36); P(c, 'rgba(255,255,255,.14)', [[wx + 3, wy + 36], [wx + 9, wy + 36], [wx + 21, wy], [wx + 15, wy]]);   // glass glare
  }
  BOX(c, '#3a2a20', x + 164, G - 40, 18, 40); R(c, '#9fc1d8', x + 167, G - 37, 12, 16); CIRC(c, '#f2c43a', x + 173, G - 14, 2);
  // neighbours
} };

L.gna = { n: 'G and A Fast Food', w: 150, d(c, x, G) {
  c.save(); c.translate(0, -16);
  P(c, '#7a4a3a', [[x - 8, G - 118], [x + 158, G - 118], [x + 146, G - 150], [x + 4, G - 150]], true); for (let i = 1; i < 8; i++) R(c, '#6a3e30', x - 6 + i * 1.5, G - 118 - i * 4, 164 - i * 3, 1); for (let i = 0; i < 40; i++) R(c, '#8a5646', x + 4 + (i * 13) % 140, G - 146 + (i * 7) % 26, 3, 1);
  BRICK(c, x + 112, G - 172, 22, 30, '#8a4a36', '#76402e'); R(c, OUT, x + 111, G - 173, 24, 1); R(c, '#b9b3a6', x + 110, G - 174, 26, 3); R(c, '#9a9a9a', x + 128, G - 200, 2, 28); R(c, '#9a9a9a', x + 120, G - 194, 16, 1); R(c, '#9a9a9a', x + 122, G - 188, 12, 1);
  BRICK(c, x, G - 120, 150, 70, '#5a3e34', '#4a332a'); R(c, OUT, x - 1, G - 121, 152, 1); BOX(c, '#c9ced4', x + 44, G - 116, 62, 60); for (let i = 0; i < 3; i++) R(c, '#6a7a8a', x + 47 + i * 20, G - 113, 16, 54);
  BOX(c, '#121214', x - 2, G - 52, 154, 26); BOX(c, '#e9e6df', x + 2, G - 50, 30, 22); for (let i = 0; i < 5; i++) { R(c, '#f2f2f2', x + 35, G - 49 + i * 4, 8 + (i * 3) % 5, 2); R(c, '#c8202a', x + 34, G - 47 + i * 4, 14, 1); }
  P(c, '#e0391e', [[x + 82, G - 52], [x + 84, G - 56], [x + 88, G - 53], [x + 92, G - 57], [x + 96, G - 53], [x + 100, G - 56], [x + 102, G - 52]], true);
  T(c, 'G', x + 78, G - 52, 16, '#e0391e'); T(c, 'A', x + 106, G - 52, 16, '#e0391e'); c.font = '16px PS'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#e0391e'; c.fillText('&', x + 92, G - 51); R(c, '#e0391e', x + 74, G - 36, 36, 1); T(c, 'FAST FOOD', x + 92, G - 35, 8, '#e0391e', 'center', false);
  R(c, '#e0391e', x + 124, G - 50, 1, 8); R(c, '#e0391e', x + 128, G - 50, 1, 8); R(c, '#e0391e', x + 132, G - 50, 1, 8); R(c, '#e0391e', x + 136, G - 50, 1, 8); T(c, '01582', x + 132, G - 40, 8, '#ffffff', 'center', false);
  // stencil portrait on the white slatted panel next to the sign: smiling bald man, beard, dark suit, open white collar
  { const px = x + 2, py = G - 50, PIC = ['..............................','........kkkk..................','......kk....kk................','.....k........k...............','....kg.........k..............','....kg..kk..kk..k.............','....kgg.gkg.gk..k.............','....kgg......k..k.............','....kkg.....kk..k.............','....kkgk.......k..............','....kkg.kkkkkk.k..............','.....kkk......kk..............','.....kkkkkkkkkkk..............','......kkkkkkkkk...............','.....kk.gkkkkk.kk.............','...kkkk.s.kkk.s.kkkk..........','..kkkkkk.s.k.s.kkkkkkk........','.kkkkkkkk.s.s.kkkkkkkkkk......','kkkkkkkkkk.s.kkkkkkkkkkkkk....','kkkkkkkkkk.s.kkkkkkkkkkkkkk...','kkkkkkkkkkk.kkkkkkkkkkks.kkk..','kkkkkkkkkkk.kkkkkkkkkkkkkkkkk.'];
    for (let j = 0; j < 22; j++) for (let i = 0; i < 30; i++) { const ch = PIC[j][i] || '.'; c.fillStyle = ch === 'k' ? '#1b1b1d' : ch === 'g' ? '#78787c' : ch === 's' ? '#f6f6f6' : (j % 3 === 2 ? '#d4d4d4' : '#ececec'); c.fillRect(px + i, py + j, 1, 1); }
    R(c, OUT, px - 1, py - 1, 32, 1); R(c, OUT, px - 1, py + 22, 32, 1); R(c, OUT, px - 1, py - 1, 1, 24); R(c, OUT, px + 30, py - 1, 1, 24); }
  c.restore();
  // black shopfront, three lit windows: warm wood walls, pendant lights, booths and tables, glass double doors
  BOX(c, '#121214', x, G - 42, 150, 42);
  for (const [wx, ww] of [[x + 8, 44], [x + 98, 44]]) { R(c, '#e3bf8c', wx, G - 39, ww, 37); for (let k = 0; k < ww; k += 5) R(c, '#cfa874', wx + k, G - 39, 1, 20); R(c, '#f3e6cc', wx, G - 19, ww, 17);
    for (let k = 0; k < 3; k++) { const lx = wx + 7 + k * 15; R(c, '#3a2a1e', lx, G - 39, 1, 5); R(c, '#2a1e16', lx - 2, G - 34, 5, 3); R(c, '#ffd98a', lx - 1, G - 31, 3, 1); }
    R(c, '#b0573e', wx + 3, G - 16, 12, 9); R(c, '#8a4230', wx + 3, G - 16, 12, 2); R(c, '#e9e3d8', wx + 20, G - 15, 10, 2); R(c, '#4a3a2e', wx + 24, G - 13, 2, 9); R(c, '#e9e3d8', wx + ww - 12, G - 17, 9, 2); R(c, '#4a3a2e', wx + ww - 8, G - 15, 2, 11);
    R(c, '#121214', wx + Math.floor(ww / 2), G - 39, 1, 37); R(c, 'rgba(255,255,255,.25)', wx + 2, G - 37, 2, 30); }
  BOX(c, '#1a1a1d', x + 54, G - 40, 42, 40); for (const dx of [x + 56, x + 76]) { R(c, '#efe0c2', dx, G - 38, 18, 38); R(c, '#e3bf8c', dx, G - 38, 18, 14); R(c, '#9aa3ad', dx + (dx === x + 56 ? 15 : 1), G - 22, 2, 8); R(c, 'rgba(255,255,255,.3)', dx + 2, G - 36, 2, 30); }
  R(c, '#1a1a1d', x + 74, G - 40, 2, 40);
  BOX(c, '#f4f4f2', x + 14, G - 37, 18, 7); T(c, 'OPEN', x + 23, G - 37, 6, '#1a1a1d', 'center', true);
} };

L.topspizza = { n: 'Tops Pizza', w: 180, d(c, x, G) {
  const U = 22;
  BRICK(c, x, G - 120 - U, 180, 76, '#6a3e30', '#5a3428'); R(c, OUT, x - 1, G - 121 - U, 182, 1);
  P(c, '#3a3436', [[x - 6, G - 118 - U], [x + 186, G - 118 - U], [x + 172, G - 130 - U], [x + 8, G - 130 - U]], true);
  P(c, '#ece7e0', [[x + 50, G - 118 - U], [x + 90, G - 166 - U], [x + 130, G - 118 - U]], true); c.save(); c.beginPath(); c.moveTo(x + 52, G - 118 - U); c.lineTo(x + 90, G - 164 - U); c.lineTo(x + 128, G - 118 - U); c.closePath(); c.clip();
  for (let i = 0; i < 6; i++) R(c, '#2a2426', x + 54 + i * 15, G - 166 - U, 3, 48); R(c, '#2a2426', x + 50, G - 140 - U, 80, 3); c.restore(); P(c, '#2a2426', [[x + 46, G - 116 - U], [x + 90, G - 170 - U], [x + 134, G - 116 - U], [x + 128, G - 116 - U], [x + 90, G - 162 - U], [x + 52, G - 116 - U]]);
  WIN(c, x + 80, G - 150 - U, 20, 18, '#f4f2ec', '#9fb7c9');
  for (const bx of [x + 22, x + 112]) { const y0 = G - 106 - U;
    P(c, '#3a3436', [[bx - 2, y0], [bx + 46, y0], [bx + 40, y0 - 5], [bx + 4, y0 - 5]], true);
    P(c, '#f4f2ec', [[bx, y0], [bx + 8, y0], [bx + 8, y0 + 26], [bx, y0 + 23]], true); P(c, '#f4f2ec', [[bx + 36, y0], [bx + 44, y0], [bx + 44, y0 + 23], [bx + 36, y0 + 26]], true);
    R(c, '#9fb4c6', bx + 2, y0 + 3, 4, 18); R(c, '#9fb4c6', bx + 38, y0 + 3, 4, 18);
    BOX(c, '#f4f2ec', bx + 8, y0, 28, 26); R(c, '#b9c9d6', bx + 10, y0 + 2, 11, 22); R(c, '#b9c9d6', bx + 23, y0 + 2, 11, 22); R(c, '#f4f2ec', bx + 10, y0 + 8, 24, 1); R(c, '#e8e4dc', bx + 11, y0 + 9, 4, 14); R(c, '#e8e4dc', bx + 29, y0 + 9, 4, 14);
    P(c, '#d9d4cb', [[bx - 2, y0 + 26], [bx + 46, y0 + 26], [bx + 40, y0 + 32], [bx + 4, y0 + 32]], true); }
  // sign (higher)
  BOX(c, '#121214', x - 2, G - 68, 184, 22); R(c, '#e0262a', x + 50, G - 68, 2, 22);
  { const hx = x + 27, WL = '#f4f2ec', HT = '#18181d', HS = '#4a4a56';   // top hat: tall crown that flares a little at the top, red band, wide brim curling up at the ends
    for (let y = 0; y < 13; y++) { const hw = y < 5 ? 5 : 4, yy = G - 68 + y; R(c, WL, hx - hw - 1, yy, 1, 1); R(c, WL, hx + hw, yy, 1, 1); R(c, HT, hx - hw, yy, hw * 2, 1); }
    R(c, WL, hx - 6, G - 69, 12, 1); R(c, HS, hx - 3, G - 67, 1, 9); R(c, '#2c2c34', hx - 5, G - 68, 10, 1);
    R(c, '#e0262a', hx - 4, G - 59, 8, 2);
    R(c, HT, hx - 11, G - 55, 22, 3); R(c, HT, hx - 11, G - 57, 2, 2); R(c, HT, hx + 9, G - 57, 2, 2);   // brim, ends curling up
    R(c, WL, hx - 9, G - 56, 4, 1); R(c, WL, hx + 5, G - 56, 4, 1); R(c, WL, hx - 11, G - 58, 2, 1); R(c, WL, hx + 9, G - 58, 2, 1); R(c, WL, hx - 12, G - 58, 1, 5); R(c, WL, hx + 11, G - 58, 1, 5);
    R(c, WL, hx - 11, G - 53, 1, 1); R(c, WL, hx + 10, G - 53, 1, 1); R(c, WL, hx - 10, G - 52, 20, 1);
    R(c, HS, hx - 8, G - 54, 5, 1); }
  T(c, 'Tops Pizza', x + 118, G - 69, 16, '#f2e0b8'); T(c, 'DELIVERY', x + 150, G - 56, 8, '#e0262a', 'center', false);
  // tall glass shopfront
  BOX(c, '#1c1830', x, G - 46, 180, 46); R(c, '#e0262a', x, G - 46, 180, 1); R(c, '#4a6cff', x + 1, G - 45, 178, 2); R(c, '#4a6cff', x + 1, G - 45, 2, 44); R(c, '#4a6cff', x + 177, G - 45, 2, 44); R(c, 'rgba(120,150,255,.35)', x + 3, G - 43, 174, 2);
  R(c, '#f1f2f4', x + 4, G - 42, 172, 40); R(c, '#e3e6ea', x + 4, G - 18, 172, 16); R(c, '#dfe3e8', x + 4, G - 42, 172, 3);
  const PO = (px, py, w, h) => { BOX(c, '#e0262a', px, py, w, h); R(c, '#f2c43a', px + 2, py + 2, w - 4, 3); R(c, '#ffffff', px + 2, py + 7, w - 6, 1); R(c, '#ffffff', px + 2, py + 10, w - 8, 1); R(c, '#f2c43a', px + 2, py + h - 4, 6, 2); };
  PO(x + 8, G - 40, 16, 20); PO(x + 40, G - 40, 14, 16); PO(x + 100, G - 40, 14, 16); PO(x + 150, G - 40, 16, 20);
  for (let i = 0; i < 7; i++) R(c, '#c8ccd2', x + 58 + i * 6, G - 40, 4, 6); R(c, '#e0262a', x + 120, G - 38, 24, 8); R(c, '#ffffff', x + 123, G - 36, 18, 1); R(c, '#ffffff', x + 123, G - 33, 14, 1);
  R(c, '#b9c0c8', x + 60, G - 22, 66, 3); R(c, '#e9ecef', x + 60, G - 19, 66, 17); R(c, '#e0262a', x + 66, G - 16, 54, 2); for (let i = 0; i < 4; i++) R(c, '#d0a060', x + 70 + i * 12, G - 26, 9, 3);
  for (let i = 0; i < 4; i++) { const cx2 = x + 10 + i * 11, col = i % 2 ? '#1c1c20' : '#e0262a'; R(c, col, cx2, G - 14, 7, 3); R(c, col, cx2, G - 20, 2, 9); R(c, '#2a2a2e', cx2 + 1, G - 11, 1, 9); R(c, '#2a2a2e', cx2 + 5, G - 11, 1, 9); }
  for (const fx of [x + 56, x + 134]) R(c, '#3a3d44', fx, G - 42, 2, 42); R(c, '#3a3d44', x + 4, G - 22, 50, 1);
  R(c, '#2a2a2e', x + 138, G - 30, 36, 28); R(c, '#e8a33c', x + 141, G - 27, 30, 2); T(c, 'OPEN', x + 156, G - 23, 8, '#f2c43a', 'center', false);
} };

L.kaya = { n: 'Kaya Lounge', w: 310, d(c, x, G) {   // drawn 310 wide at SCALE .85: 15% lower and 15% wider than before
  CROWN(c, x + 236, G - 82, 43, '#3f6f34', '#4f8a3c', 0); CROWN(c, x + 288, G - 70, 26, '#2f5f2c', '#3a6b33', 1);
  BOX(c, '#2a2826', x - 2, G - 66, 306, 8);
  BOX(c, '#2f5a2a', x, G - 58, 302, 58); for (let i = 0; i < 410; i++) R(c, ['#3e7a34', '#5a9a44', '#244a20', '#9ad06a', '#e8eedc'][i % 5], x + (i * 37) % 300, G - 56 + (i * 23) % 54, 2 + (i % 2), 2);
  BOX(c, '#0e1014', x + 20, G - 50, 44, 50); R(c, '#2a2e36', x + 26, G - 46, 32, 46); CIRC(c, '#eef4ff', x + 22, G - 52, 2); CIRC(c, '#eef4ff', x + 70, G - 52, 2);
  BOX(c, '#1c1b1e', x + 4, G - 96, 120, 32); T(c, 'KAYA', x + 60, G - 94, 16, '#eceae4'); T(c, 'L O U N G E', x + 60, G - 77, 8, '#eceae4', 'center', false);
  CIRC(c, '#c83a6a', x + 16, G - 86, 6); CIRC(c, '#1c1b1e', x + 16, G - 86, 5); T(c, '18', x + 16, G - 90, 8, '#ffffff', 'center', false);
  R(c, '#e8262f', x + 109, G - 92, 3, 15); P(c, '#e8262f', [[x + 104, G - 78], [x + 116, G - 78], [x + 110.5, G - 69]]);   // red arrow pointing down
  CIRC(c, '#f4f4f4', x + 150, G - 60, 3); CIRC(c, '#f4f4f4', x + 230, G - 60, 3);
} };

// Vauxhall Luton plant (Kimpton Road): white 1950s office block with big window grids and the badge panel, the grey ribbed block with red trim
// and "Home of the Vauxhall Vivaro", the long low shed with a red van picture; silver chimneys and grey vent towers behind; brown wooden fence in front
L.vauxhall = { n: 'Vauxhall Luton Plant', w: 470, d(c, x, G) {
  const WH = '#eceef0', WL = '#d9dce0', GR = '#b7bcc2', GD = '#a2a8af', RD = '#d42a2a', TL = '#5f8f94';
  // behind: the long white main hall, tall silver chimneys, grey vent towers, teal plant rooms
  BOX(c, '#e6e8eb', x + 150, G - 150, 322, 70); for (let i = 0; i < 322; i += 5) R(c, '#d6d9dd', x + 150 + i, G - 150, 1, 70); R(c, '#c9ced4', x + 148, G - 153, 326, 3);
  for (const cx of [x + 196, x + 250, x + 286]) { BOX(c, '#c9ced4', cx, G - 214, 9, 64); R(c, '#e8ecef', cx + 1, G - 214, 2, 64); R(c, '#9aa3ad', cx - 1, G - 216, 11, 3); R(c, '#9aa3ad', cx - 3, G - 160, 15, 2); }
  for (const [vx, vh] of [[x + 40, 34], [x + 82, 30], [x + 352, 36], [x + 396, 40], [x + 440, 32]]) { const vb = vx > x + 150 ? G - 150 : G - 128; BOX(c, '#8a9098', vx, vb - vh, 22, vh); for (let i = 0; i < vh; i += 4) R(c, '#7d838b', vx, vb - vh + i, 22, 1); R(c, '#9aa1a8', vx - 1, vb - 2 - vh, 24, 3); }
  for (const [tx, tw] of [[x + 100, 50], [x + 306, 30]]) { BOX(c, TL, tx, G - 150, tw, 22); P(c, '#4f7d82', [[tx - 2, G - 150], [tx + tw / 2, G - 158], [tx + tw + 2, G - 150]], true); R(c, RD, tx, G - 150, 1, 22); R(c, '#3f7fc0', tx + 6, G - 162, 12, 8); }
  // left: the white office block
  BOX(c, WH, x, G - 128, 168, 128); R(c, WL, x, G - 128, 168, 2); R(c, '#9aa1a8', x - 2, G - 131, 172, 3);
  const grid = (gx, gy, cols, rows, cw, ch, dark) => { R(c, '#3a3f46', gx - 1, gy - 1, cols * cw + 1, rows * ch + 1); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) R(c, (i + j * 3) % 7 === 2 ? '#c9d8e2' : dark ? '#5d6b78' : '#8fa6b8', gx + i * cw, gy + j * ch, cw - 1, ch - 1); };
  grid(x + 4, G - 116, 14, 3, 7, 7, true); grid(x + 4, G - 72, 14, 3, 7, 7, false); R(c, WL, x + 4, G - 50, 98, 3);
  grid(x + 154, G - 120, 2, 14, 6, 7, false);                                                           // tall stair window
  BOX(c, '#c3c7cc', x + 104, G - 118, 46, 42); CIRC(c, OUT, x + 127, G - 101, 11); CIRC(c, '#c8202a', x + 127, G - 101, 10); CIRC(c, '#e8ecef', x + 127, G - 101, 7); CIRC(c, '#c8202a', x + 127, G - 101, 6);
  P(c, '#f4f6f8', [[x + 123, G - 106], [x + 126, G - 106], [x + 127.5, G - 100], [x + 129, G - 106], [x + 132, G - 106], [x + 128.5, G - 97], [x + 126.5, G - 97]]);   // simple red badge with a V (not the real griffin)
  T(c, 'VAUXHALL', x + 127, G - 86, 8, '#3a3f46', 'center', false);
  R(c, '#8a5a3a', x, G - 14, 168, 14); for (let i = 0; i < 168; i += 4) R(c, '#7a4e32', x + i, G - 14, 1, 14);                 // brick plinth
  // middle: grey ribbed block with red edges, red-framed windows and the slogan
  BOX(c, GR, x + 168, G - 112, 182, 112); for (let i = 3; i < 182; i += 3) R(c, GD, x + 168 + i, G - 112, 1, 112);
  R(c, RD, x + 168, G - 114, 182, 2); R(c, RD, x + 348, G - 112, 2, 112); R(c, RD, x + 168, G - 112, 2, 112);
  
  const rwin = (wx, wy, ww, wh, cols, rows) => { BOX(c, RD, wx, wy, ww, wh); R(c, '#3f4a55', wx + 2, wy + 2, ww - 4, wh - 4); const cw = (ww - 4) / cols, ch = (wh - 4) / rows; for (let i = 1; i < cols; i++) R(c, '#f4f6f8', Math.round(wx + 2 + i * cw), wy + 2, 1, wh - 4); for (let j = 1; j < rows; j++) R(c, '#f4f6f8', wx + 2, Math.round(wy + 2 + j * ch), ww - 4, 1); R(c, 'rgba(255,255,255,.15)', wx + 2, wy + 2, ww - 4, (wh - 4) / 2); };
  rwin(x + 186, G - 84, 40, 24, 4, 3); rwin(x + 236, G - 84, 20, 24, 2, 3); rwin(x + 266, G - 86, 70, 26, 7, 3);
  rwin(x + 186, G - 50, 40, 30, 4, 4); rwin(x + 236, G - 50, 20, 30, 2, 4); rwin(x + 266, G - 52, 70, 32, 7, 4);
  // right: long low shed with a red line, HOME OF VAUXHALL and a red van
  BOX(c, '#e4e6e9', x + 350, G - 80, 120, 80); for (let i = 3; i < 120; i += 4) R(c, '#d4d7db', x + 350 + i, G - 80, 1, 80); R(c, RD, x + 350, G - 82, 120, 2); R(c, '#c9ced4', x + 350, G - 92, 120, 10); for (let i = 0; i < 120; i += 6) R(c, '#9aa1a8', x + 350 + i, G - 92, 1, 10);
  { const vx = x + 390, vy = G - 70; P(c, '#c8202a', [[vx, vy + 14], [vx, vy + 4], [vx + 4, vy], [vx + 22, vy], [vx + 30, vy + 7], [vx + 34, vy + 9], [vx + 34, vy + 14]], true); R(c, '#3f4a55', vx + 23, vy + 2, 6, 5); R(c, '#a81a1e', vx + 2, vy + 9, 30, 1); CIRC(c, OUT, vx + 7, vy + 15, 3); CIRC(c, OUT, vx + 27, vy + 15, 3); CIRC(c, '#9aa3ad', vx + 7, vy + 15, 1); CIRC(c, '#9aa3ad', vx + 27, vy + 15, 1); }
  BOX(c, RD, x + 448, G - 30, 18, 30); R(c, '#3a3f46', x + 450, G - 28, 14, 28);                                                // red door
  // front: a low brick wall with a hedge on the left half, then brick piers and two sets of blue mesh gates (one with the Gate 2 sign)
  const PIER = px => { BRICK(c, px, G - 40, 14, 40, '#9a5038', '#84442e'); R(c, OUT, px - 1, G - 41, 16, 1); R(c, '#6a6f77', px - 1, G - 43, 16, 3); for (let k = 0; k < 4; k++) R(c, '#2a3a8a', px + 1 + k * 3, G - 46, 1, 3); };
  BRICK(c, x - 2, G - 20, 238, 20, '#9a5038', '#84442e'); R(c, OUT, x - 3, G - 21, 240, 1); R(c, '#c9c4b8', x - 3, G - 23, 240, 3);
  for (const [hx, hw] of [[x + 10, 44], [x + 178, 52]]) { BOX(c, '#3f7a34', hx, G - 34, hw, 14); for (let k = 0; k < hw; k += 3) R(c, k % 2 ? '#4f8f3e' : '#356b2c', hx + k, G - 34 + (k % 4), 2, 2); R(c, '#5a9a48', hx + 2, G - 33, hw - 4, 1); }   // clipped hedges on the wall
  const GATE = (gx, gw) => { R(c, '#2a3f9a', gx, G - 36, gw, 3); R(c, '#2a3f9a', gx, G - 18, gw, 2); R(c, '#2a3f9a', gx, G - 3, gw, 3);
    for (let k = 0; k <= gw; k += Math.round(gw / 6)) R(c, '#2a3f9a', gx + Math.min(k, gw - 2), G - 36, 2, 36);
    c.fillStyle = 'rgba(42,63,154,.35)'; for (let yy = G - 33; yy < G - 3; yy += 2) c.fillRect(gx, yy, gw, 1); for (let xx = gx; xx < gx + gw; xx += 2) c.fillRect(xx, G - 33, 1, 30);
    for (let k = 2; k < gw; k += 4) R(c, '#1f2f7a', gx + k, G - 39, 1, 3); };
  PIER(x + 236); GATE(x + 250, 100); PIER(x + 350); GATE(x + 364, 92); PIER(x + 456);
  BOX(c, '#f4f6f8', x + 256, G - 34, 58, 20); CIRC(c, '#c8202a', x + 263, G - 28, 4); CIRC(c, '#f4f6f8', x + 263, G - 28, 2);
  for (const lx of [x + 172, x + 344]) { R(c, '#9aa3ad', lx, G - 96, 2, 96); R(c, '#9aa3ad', lx, G - 96, 10, 2); R(c, '#e8ecef', lx + 8, G - 95, 4, 2); }
} };

/* ---------- extra detail from the photos ---------- */
const BUS = (c, x, G) => { BOX(c, '#17a3b5', x, G - 24, 48, 21); R(c, '#1c2a33', x + 2, G - 21, 36, 8); for (let i = 1; i < 4; i++) R(c, '#17a3b5', x + 2 + i * 9, G - 21, 1, 8); R(c, '#1c2a33', x + 40, G - 21, 7, 13); R(c, '#111316', x + 39, G - 24, 9, 2); R(c, '#ff8a1e', x + 40, G - 24, 5, 1); P(c, '#f4f6f8', [[x + 32, G - 13], [x + 36, G - 13], [x + 39, G - 5], [x + 35, G - 5]]); R(c, '#e3a321', x, G - 6, 48, 1); CIRC(c, OUT, x + 10, G - 2, 3.4); CIRC(c, '#b9bec6', x + 10, G - 2, 1.4); CIRC(c, OUT, x + 38, G - 2, 3.4); CIRC(c, '#b9bec6', x + 38, G - 2, 1.4); };
const POSTBOX = (c, x, G) => { BOX(c, '#c8202a', x, G - 14, 7, 14); R(c, '#8a141b', x, G - 15, 7, 2); R(c, OUT, x + 2, G - 11, 3, 1); };
const SHELTER = (c, x, G) => { R(c, '#8a9098', x, G - 22, 30, 2); R(c, '#8a9098', x, G - 22, 1, 22); R(c, '#8a9098', x + 29, G - 22, 1, 22); R(c, 'rgba(180,210,230,.45)', x + 1, G - 20, 28, 14); BOX(c, '#c8202a', x + 6, G - 7, 18, 2); };
const BIRCH = (c, x, G) => { R(c, '#efece4', x, G - 30, 2, 30); for (let i = 0; i < 4; i++) R(c, OUT, x, G - 26 + i * 7, 2, 1); for (let i = 0; i < 8; i++) R(c, '#7e9a5a', x - 6 + (i * 5) % 14, G - 40 + (i * 7) % 14, 2, 2); };
const MOPED = (c, x, G) => { CIRC(c, OUT, x + 4, G - 4, 4); CIRC(c, OUT, x + 22, G - 4, 4); CIRC(c, '#666', x + 4, G - 4, 2); CIRC(c, '#666', x + 22, G - 4, 2); BOX(c, '#8a1d2a', x + 4, G - 12, 18, 5); BOX(c, '#14182a', x - 2, G - 26, 14, 12); R(c, '#3f7de0', x, G - 20, 10, 2); PERSON(c, x + 12, G - 6, '#2a3a5a', '#22222a', '#c58c5c', '#14141a'); };
const EX = {
  toros(c, x, G) { },
  gurdwara(c, x, G) { R(c, '#b9b3a6', x - 6, G - 3, 452, 3); for (let i = 0; i < 60; i++) R(c, i % 2 ? '#a39d90' : '#cfc9bc', x - 4 + (i * 37) % 448, G - 3 + (i % 3), 2, 1); PERSON(c, x + 200, G, '#1a1a1e'); PERSON(c, x + 212, G, '#2a2a33', '#9aa3ad', '#c58c5c', '#1f3f8a'); },
  stockwood(c, x, G) { PERSON(c, x + 90, G, '#2f4a8a'); PERSON(c, x + 98, G, '#e0458a'); },
  inspire(c, x, G) { R(c, '#6fbf4a', x, G - 4, 230, 4); for (const tx of [x + 150, x + 196]) { R(c, '#5a3d2a', tx, G - 26, 2, 26); CIRC(c, '#5f8f3c', tx + 1, G - 30, 6); }
    for (const lx of [x + 170, x + 260]) { R(c, '#9aa0a8', lx, G - 120, 3, 120); R(c, '#9aa0a8', lx, G - 120, 12, 2); BOX(c, '#2f6fb5', lx + 4, G - 104, 10, 30); R(c, '#7fc3e8', lx + 6, G - 100, 6, 6); }
    for (let i = 0; i < 8; i++) BOLL(c, x + 340 + i * 12, G); BOX(c, '#f2c43a', x + 238, G - 8, 8, 8); PERSON(c, x + 360, G, '#2f4a8a'); },
  matalan(c, x, G) { PERSON(c, x + 160, G, '#2f4a8a'); PERSON(c, x + 212, G, '#d84b6a'); },
  spudkingz(c, x, G) { PERSON(c, x + 76, G, '#2bb3c8', '#1a1a1e', '#6a4028', '#1a1a1e'); },
  bandq(c, x, G) { TREE(c, x + 40, G, 1.2, '#6faa3e', '#4f8a2c'); TREE(c, x + 410, G, 1.1, '#6faa3e', '#4f8a2c'); CAR(c, x + 300, G, '#f4f4f4'); CAR(c, x + 116, G, '#7a8290'); R(c, '#9aa3ad', x + 136, G - 70, 2, 70); BOX(c, '#ecebe7', x + 128, G - 72, 18, 3); },
  lidl(c, x, G) { TREE(c, x - 10, G, 1.5, '#4f8a3c', '#3a6b2c'); for (const bx of [x + 150, x + 236]) { BOX(c, '#1f52b0', bx, G - 30, 10, 26); R(c, '#ffe23a', bx + 2, G - 24, 6, 6); } },
  jdgyms(c, x, G) { R(c, '#b98a62', x - 6, G - 3, 300, 3); for (let i = 0; i < 37; i++) R(c, '#a8784f', x - 4 + i * 8, G - 3, 1, 3); },
  bigyellow(c, x, G) { for (let i = 0; i < 9; i++) { BOX(c, '#f4f2ec', x + 10 + i * 8, G - 10, 3, 10); R(c, '#f6d21a', x + 10 + i * 8, G - 6, 3, 2); } BOX(c, '#e8c84a', x + 80, G - 14, 8, 10); CIRC(c, OUT, x + 300, G - 8, 9); CIRC(c, '#4f8a3c', x + 300, G - 8, 8); },
  masjidali(c, x, G) { R(c, '#9a4a36', x + 96, G - 6, 224, 6); for (let i = 0; i < 11; i++) { if (i === 3 || i === 4) continue; CIRC(c, OUT, x + 100 + i * 20, G - 9, 6); CIRC(c, '#5f8f3c', x + 100 + i * 20, G - 9, 5); CIRC(c, '#7fb04a', x + 98 + i * 20, G - 11, 2); }
    for (const bx of [x + 136, x + 182]) { BOX(c, '#1a1a1e', bx, G - 14, 4, 14); R(c, '#d9b05a', bx, G - 15, 4, 2); }
    BOX(c, '#b9bcc0', x + 40, G - 10, 46, 10); BOX(c, '#3a3d44', x + 48, G - 16, 30, 6); for (let i = 0; i < 6; i++) R(c, i % 2 ? '#7fa7c4' : '#e8e8e8', x + 42 + i * 7, G - 8, 4, 4);
    const px = x + 62; BOX(c, '#2a2a2e', px - 2, G - 40, 4, 24); for (let i = 0; i < 5; i++) BOX(c, '#d6d9de', px - 3, G - 58 - i * 8, 6, 6); R(c, '#e0458a', px - 3, G - 22, 6, 3); R(c, '#e8a33c', px - 4, G - 19, 8, 3);
    R(c, '#c9ccd0', px - 1, G - 120, 2, 64); CIRC(c, OUT, px, G - 116, 10); CIRC(c, '#e8eaee', px, G - 116, 9); CIRC(c, '#c9ccd0', px, G - 116, 6);
    // open hand ornament on top of the pole: palm, four fingers (middle longest), thumb out to the side, dark grey outline
    { const HW = '#eceef1', HS = '#c9ccd2', HO = '#4a4e56';
      const parts = [[px - 6, G - 136, 13, 14],                                     // palm
        [px - 6, G - 146, 2, 11], [px - 3, G - 149, 2, 14], [px, G - 148, 2, 13], [px + 3, G - 144, 2, 9],   // fingers
        [px + 6, G - 131, 2, 4], [px + 7, G - 134, 2, 4], [px + 8, G - 137, 2, 4]];                      // thumb, angled out
      parts.forEach(([a, b, w, h]) => R(c, HO, a - 1, b - 1, w + 2, h + 2));
      parts.forEach(([a, b, w, h]) => R(c, HW, a, b, w, h));
      R(c, HO, px - 7, G - 122, 1, 1); R(c, HO, px + 7, G - 122, 1, 1);           // rounded heel of the palm
      R(c, HS, px + 5, G - 135, 1, 12); R(c, HS, px - 5, G - 124, 10, 1);       // shading
      for (const fx of [px - 6, px - 3, px, px + 3]) R(c, HS, fx + 1, G - 136, 1, 2);
      R(c, HS, px - 1, G - 131, 2, 4); R(c, HO, px - 1, G - 130, 2, 2); }      // small eye in the palm
  },   // the green flag on this pole is drawn (waving) in LM_ANIM.masjidali
  karwan(c, x, G) { R(c, '#c96a5a', x - 6, G - 3, 242, 3); },
  lewsey(c, x, G) { for (let i = 0; i < 4; i++) R(c, '#6a4a34', x - 14, G - 4 - i * 4, 36, 2); R(c, '#f2c14e', x + 8, G - 22, 30, 2); for (const px of [x + 8, x + 22, x + 36]) R(c, '#f2c14e', px, G - 22, 2, 22);
    BOX(c, '#2f6fb5', x + 24, G - 42, 10, 12); R(c, '#ffffff', x + 27, G - 39, 4, 4); R(c, '#f2c14e', x + 40, G - 2, 80, 2); for (let i = 0; i < 6; i++) R(c, '#f2c14e', x + 44 + i * 13, G - 2, 1, 2); },
  stmarys(c, x, G) { R(c, '#6fbf4a', x - 10, G - 4, 320, 4); for (const gx of [x + 40, x + 80, x + 130, x + 186, x + 268, x + 278]) { BOX(c, '#8f8b80', gx, G - 14, 6, 14); R(c, '#8f8b80', gx + 1, G - 15, 4, 1); }
    TREE(c, x - 2, G, 1.3, '#4f8a3c', '#3a6b2c'); CIRC(c, OUT, x + 270, G - 12, 13); CIRC(c, '#3f7d33', x + 270, G - 12, 12); R(c, '#5a3d2a', x + 160, G - 24, 2, 24); CIRC(c, '#7fbf4a', x + 154, G - 30, 7); CIRC(c, '#7fbf4a', x + 168, G - 28, 6); },
  chaiikhana(c, x, G) { const CONE = (cx) => { P(c, '#f4c430', [[cx, G], [cx + 4, G - 12], [cx + 8, G]], true); CIRC(c, '#2f4fa8', cx + 4, G - 5, 2); R(c, '#d32f2f', cx + 2, G - 5, 5, 1); BOX(c, '#3a3d44', cx - 1, G - 2, 10, 2); };
    PERSON(c, x + 34, G, '#22252a', '#7f9ab8', '#c58c5c', '#3a3d44'); },
  chiltern(c, x, G) { const HEDGE = (hx, w, h) => { BOX(c, '#c5b13a', hx, G - h, w, h); for (let i = 0; i < w * h / 6; i++) R(c, (i % 3) ? '#a99a28' : '#e2cf58', hx + (i * 13) % w, G - h + (i * 7) % h, 2, 2); };
    HEDGE(x - 10, 130, 12); HEDGE(x + 240, 120, 12); BOX(c, '#2a2c33', x + 120, G - 6, 6, 6); BOX(c, '#2a2c33', x + 234, G - 6, 6, 6);
    P(c, '#5f8f2c', [[x + 266, G - 12], [x + 280, G - 70], [x + 294, G - 12]]); for (let i = 0; i < 8; i++) R(c, '#a8b83a', x + 274 + (i * 5) % 14, G - 60 + i * 6, 2, 2);
    CIRC(c, OUT, x + 330, G - 30, 19); CIRC(c, '#4f8a3c', x + 330, G - 30, 18); CIRC(c, '#6faa4e', x + 324, G - 36, 9); R(c, '#9aa3ad', x + 304, G - 40, 2, 28); CIRC(c, '#e8e8e8', x + 305, G - 42, 3); PERSON(c, x + 160, G, '#2f4a8a'); },
  venue(c, x, G) { R(c, '#d9cdb6', x - 6, G - 2, 232, 2); const POT = (px, col, h, leaf) => { BOX(c, col, px, G - 7, 8, 7); R(c, '#5a3d2a', px + 3, G - 7 - h, 2, h); CIRC(c, leaf, px + 4, G - 9 - h, 6); };
    POT(x + 60, '#2a2a2e', 18, '#a84a3a'); POT(x + 146, '#2a2a2e', 18, '#b2402e'); POT(x + 34, '#f0ede6', 8, '#5f8f3c'); POT(x + 164, '#e8e3d8', 6, '#6faa4e'); BOX(c, '#2a2a2e', x + 180, G - 8, 18, 8); for (let i = 0; i < 5; i++) CIRC(c, i % 2 ? '#f4f2ec' : '#5f8f3c', x + 183 + i * 3, G - 10, 2); PERSON(c, x + 100, G, '#2a2a33', '#1a1a1e', '#c58c5c', '#1a1a1e'); },
  currys(c, x, G) { TREE(c, x + 60, G, 1.1, '#6faa3e', '#4f8a2c'); TREE(c, x + 300, G, 1.4, '#7fb04a', '#5a8a34'); for (let i = 0; i < 6; i++) BOLL(c, x + 6 + i * 10, G);
  },
  tesco(c, x, G) { for (const cx of [x + 4, x + 24, x + 120, x + 176]) { P(c, '#e8641c', [[cx, G], [cx + 3, G - 12], [cx + 6, G]], true); R(c, '#ffffff', cx + 1, G - 6, 4, 2); } for (const bx of [x + 98, x + 188, x + 194]) BOLL(c, bx, G); PERSON(c, x + 92, G, '#5a6e8a'); },
  masjid(c, x, G) { TREE(c, x - 26, G, 1.3, '#5f8f3c', '#47702c'); PERSON(c, x + 72, G, '#f4f2ec', '#f4f2ec', '#c58c5c', '#f4f2ec'); PERSON(c, x + 80, G, '#3a6e5a', '#2a2a33', '#c58c5c', '#f4f2ec'); PERSON(c, x + 196, G, '#2a2a33', '#f4f2ec', '#c58c5c', '#1a1a1e'); },
  galaxy(c, x, G) { R(c, 'rgba(0,0,0,.16)', x + 4, G - 140, 14, 96); R(c, 'rgba(0,0,0,.08)', x + 18, G - 140, 10, 96); R(c, 'rgba(0,0,0,.18)', x + 180, G - 140, 16, 96); R(c, 'rgba(255,255,255,.12)', x + 60, G - 140, 30, 96);
    BOX(c, '#c9ced4', x + 6, G - 140, 188, 8); for (let i = 0; i < 24; i++) R(c, '#a9aeb4', x + 8 + i * 8, G - 139, 1, 6);
    SHELTER(c, x + 92, G); POSTBOX(c, x + 132, G); PERSON(c, x + 22, G, '#d8262f'); PERSON(c, x + 170, G, '#6a4c93'); },
  townhall(c, x, G) {
    for (let i = 0; i < 9; i++) { const lx = 4 + i * 22; if ((lx > 74 && lx < 126) || (lx > 140 && lx < 180)) continue; R(c, '#d6ccb6', x + lx, G - 92, 1, 92); } // wall lines, kept off the portico and the statue
    FLOWERS(c, x + 30, G, 40); FLOWERS(c, x + 172, G, 26); LAMP(c, x + 6, G, 56); PERSON(c, x + 178, G, '#2f4a8a'); PERSON(c, x + 186, G, '#e8e0cf', '#3a3a44'); },
  letters(c, x, G) { for (let i = 0; i < 10; i++) R(c, '#a8a59c', x + i * 19, G - 6, 1, 6); BOX(c, '#c58f52', x - 20, G - 14, 20, 14); R(c, '#a8743e', x - 20, G - 9, 20, 1); BOX(c, '#c58f52', x + 172, G - 12, 22, 12);
    PERSON(c, x + 58, G - 4, '#1a1a1e', '#2a2a33', '#e2b38a', '#f4f2ec'); PERSON(c, x + 66, G - 4, '#5a6e8a', '#5a6e8a', '#e2b38a', '#e8c766');  },
  hatfactory(c, x, G) { for (let i = 0; i < 9; i++) P(c, i % 2 ? '#4f8a3c' : '#6faa4e', [[x + 160, G - 2], [x + 152 + i * 3, G - 22 - (i % 3) * 4], [x + 164, G - 2]]); BOX(c, '#4a2f25', x + 146, G - 4, 34, 4);
    PERSON(c, x + 66, G, '#3a3d44'); PERSON(c, x + 150, G, '#e0558c'); },
  chaiiwala(c, x, G) { for (const bx of [x + 180, x + 206, x + 232]) BOLL(c, bx, G); R(c, '#c96a4a', x + 130, G - 3, 160, 3); },
  nadeem(c, x, G) { R(c, '#c25a3c', x - 6, G - 3, 162, 3); for (let i = 0; i < 20; i++) R(c, '#a84a30', x - 4 + i * 8, G - 3, 1, 3);
    for (const bx of [x + 2, x + 132, x + 142]) BOX(c, '#1a1a1e', bx, G - 12, 3, 12);
    PERSON(c, x + 66, G, '#1a1a1e', '#1a1a1e', '#c58c5c', '#1a1a1e'); PERSON(c, x + 74, G, '#1a1a1e', '#1a1a1e', '#c58c5c', '#1a1a1e'); PERSON(c, x + 120, G, '#7a6a4a', '#2a2a33'); PERSON(c, x + 26, G, '#3a3d44');
    BOX(c, '#5a4030', x + 104, G - 7, 12, 2); R(c, '#5a4030', x + 105, G - 5, 1, 5); R(c, '#5a4030', x + 114, G - 5, 1, 5); },
  oak(c, x, G) { BRICK(c, x + 2, G - 12, 26, 12); BRICK(c, x + 178, G - 14, 8, 14);
    PERSON(c, x + 118, G, '#b8292f', '#1a1a1e', '#c58c5c', '#1a1a1e');
    for (let i = 0; i < 6; i++) R(c, '#f4f2ec', x + 12 + i * 34, G - 74, 18, 2); for (const tx of [x + 72, x + 150]) { BOX(c, '#e8e0cf', tx, G - 44, 12, 4); } },
  periperi(c, x, G) { for (let i = 0; i < 6; i++) CIRC(c, '#fff4cc', x + 74 + i * 18, G - 47, 1); for (let i = 0; i < 5; i++) { BOX(c, '#22252b', x + 76 + i * 20, G - 44, 16, 6); R(c, i % 2 ? '#e0281a' : '#f2c14e', x + 78 + i * 20, G - 42, 12, 2); }
    R(c, '#f4f6c8', x + 178, G - 56, 3, 3); },
  krispy(c, x, G) { },
  uob(c, x, G) { R(c, '#5f9e3c', x + 80, G - 6, 110, 6); R(c, '#4f8a33', x + 84, G - 2, 100, 2); for (let i = 0; i < 9; i++) BOLL(c, x + 86 + i * 12, G); TREE(c, x + 30, G, .9); TREE(c, x + 96, G, .9); PERSON(c, x + 150, G - 6, '#1a1a1e'); },
  sixthform(c, x, G) { LAMP(c, x - 6, G, 80); for (let i = 0; i < 6; i++) R(c, '#2e8b57', x + 2 + i * 4, G - 26, 2, 26); R(c, '#2e8b57', x + 2, G - 26, 24, 2); P(c, '#e8e8e8', [[x - 2, G - 64], [x + 46, G - 64], [x + 40, G - 58], [x + 4, G - 58]], true);
    PERSON(c, x + 40, G, '#9aa3ad', '#2a2a33'); PERSON(c, x + 74, G, '#3a6ea5'); PERSON(c, x + 120, G, '#5a3a2e', '#1a1a1e', '#c58c5c', '#1f6f6a'); PERSON(c, x + 166, G, '#2f4a8a'); for (let i = 0; i < 3; i++) P(c, i === 1 ? '#d8262f' : '#f4f2ec', [[x + 174 + i * 7, G - 64], [x + 180 + i * 7, G - 72], [x + 183 + i * 7, G - 72], [x + 177 + i * 7, G - 64]]); },
  wardown(c, x, G) { BOX(c, '#6b4a32', x + 186, G - 24, 18, 3); R(c, '#3a2a20', x + 188, G - 21, 2, 5); R(c, '#3a2a20', x + 200, G - 21, 2, 5); PERSON(c, x + 194, G - 20, '#d84b3c'); for (const dx of [x + 20, x + 150]) { R(c, '#f4f2ec', dx, G - 9, 5, 3); R(c, '#2e7d32', dx + 4, G - 11, 2, 2); }
    for (let i = 0; i < 20; i++) R(c, OUT, x + 4 + i * 10, G - 20, 1, 4); R(c, OUT, x, G - 20, 210, 1); PERSON(c, x + 70, G - 14, '#1a1a1e'); PERSON(c, x + 76, G - 14, '#f28c28'); },
  welcome(c, x, G) { for (let i = 0; i < 10; i++) R(c, '#3a3d44', x + 52 + i * 17, G - 96, 1, 8); R(c, '#3a3d44', x + 52, G - 96, 154, 1); },
  airport(c, x, G) { PERSON(c, x + 40, G, '#5a6e8a'); BOX(c, '#c8202a', x + 46, G - 7, 5, 7); PERSON(c, x + 110, G, '#1f6f6a'); BOX(c, '#2a2a2e', x + 116, G - 6, 5, 6); PERSON(c, x + 360, G, '#e8e0cf', '#2a2a33'); BOX(c, '#3f6fb5', x + 366, G - 7, 5, 7); PERSON(c, x + 220, G, '#c58c5c'); },
};
Object.keys(EX).forEach(k => { const d0 = L[k].d; L[k].d = (c, x, G) => { d0(c, x, G); EX[k](c, x, G); }; });

/* ---------- wider buildings: extra sections either side ---------- */
const WIDEN = {
  sixthform: { w: 354, dx: 110, pre(c, x, G) {
    BRICK(c, x, G - 70, 112, 70, '#d9a84e', '#c9973f'); R(c, OUT, x - 1, G - 71, 114, 1); R(c, OUT, x - 1, G - 70, 1, 70); R(c, '#3d3d42', x, G - 6, 112, 6);
    for (let i = 0; i < 3; i++) WIN(c, x + 10 + i * 34, G - 52, 18, 28, '#3d3d42', '#5aa6a4');
    P(c, '#e8e8e8', [[x + 4, G - 64], [x + 70, G - 64], [x + 62, G - 58], [x + 10, G - 58]], true); R(c, '#e8e8e8', x + 12, G - 58, 2, 58); R(c, '#e8e8e8', x + 60, G - 58, 2, 58);
    for (let i = 0; i < 10; i++) R(c, '#2e8b57', x + 4 + i * 6, G - 28, 2, 28); R(c, '#2e8b57', x + 4, G - 28, 58, 2);
  } },
  tesco: { w: 380, dx: 70, pre(c, x, G) {
    P(c, '#3d3f45', [[x - 4, G - 66], [x + 384, G - 66], [x + 370, G - 96], [x + 10, G - 96]], true); for (let i = 0; i < 7; i++) R(c, '#34363c', x + 8 + i * 2, G - 93 + i * 4, 364 - i * 4, 1);
    BRICK(c, x, G - 66, 380, 66, '#a8503a', '#94452f'); R(c, OUT, x - 1, G - 67, 382, 1); BOX(c, '#ecebe7', x - 4, G - 70, 388, 4);
    R(c, '#2a2f3a', x + 4, G - 50, 60, 50); for (let i = 0; i < 5; i++) BOX(c, '#ecebe7', x + 6 + i * 13, G - 50, 3, 50);
    for (let i = 0; i < 12; i++) { R(c, '#9aa3ad', x + 8 + i * 4.5, G - 12, 4, 1); R(c, '#9aa3ad', x + 8 + i * 4.5, G - 12, 1, 9); }
    BOX(c, '#c8202a', x + 20, G - 62, 10, 8); P(c, '#d64545', [[x + 20, G - 84], [x + 30, G - 84], [x + 25, G - 76]], true);
    BOX(c, '#9aa3ad', x + 320, G - 54, 40, 54); for (let i = 0; i < 12; i++) R(c, '#868e98', x + 320, G - 52 + i * 4, 40, 1); BOX(c, '#d64545', x + 300, G - 50, 6, 10);
  } },
  suffa: { w: 344, dx: 44, post(c, x, G) { TREE(c, x - 18, G - 2, 2.1, '#5f9a3e', '#47702c'); } },   // big tree in front of the left corner
  masjid: { w: 320, dx: 50, pre(c, x, G) {
    const B = '#b8483a', BL = '#a33d31';
    BRICK(c, x, G - 120, 54, 120, B, BL); R(c, OUT, x - 1, G - 121, 55, 1); R(c, OUT, x - 1, G - 120, 1, 120); R(c, SH(B, 1.12), x, G - 120, 52, 3);
    
    for (const wx of [x + 18]) { R(c, OUT, wx - 1, G - 45, 14, 24); R(c, '#a7b9a8', wx, G - 44, 12, 23); CIRC(c, OUT, wx + 6, G - 44, 7); CIRC(c, '#a7b9a8', wx + 6, G - 44, 6); R(c, '#e8e0cf', wx + 5, G - 50, 1, 28); }
    for (let i = 0; i < 2; i++) { BRICK(c, x + 6 + i * 27, G - 22, 6, 22, '#c0503f', '#a8443a'); R(c, OUT, x + 6 + i * 27, G - 23, 6, 1); R(c, '#e8d8c0', x + 5 + i * 27, G - 24, 8, 2); BRICK(c, x + 12 + i * 27, G - 12, 21, 12, '#c0503f', '#a8443a'); for (let k = 0; k < 6; k++) R(c, '#2a2a2e', x + 14 + i * 27 + k * 3, G - 22, 1, 10); R(c, '#2a2a2e', x + 12 + i * 27, G - 22, 21, 1); }
  } },
  galaxy: { w: 330, dx: 124, pre(c, x, G) {
    // long left wing (no red): striped beige brick piers, cream lintels, gym windows and doors, GALAXY letters in the top glass panels
    const WW = 132; BOX(c, '#c9b7a3', x, G - 104, WW, 104); BOX(c, '#d8d2c6', x - 2, G - 110, WW + 4, 6);
    R(c, '#9aa6b0', x, G - 96, WW, 26); for (let i = 0; i < 6; i++) R(c, '#b4bec7', x + 2 + i * 20, G - 94, 18, 22);
    'GALAXY'.split('').forEach((ch, i) => TS(c, ch, x + 11 + i * 20, G - 90, 12, '#ffffff', '#6f7a84'));
    R(c, '#6f7a84', x, G - 70, WW, 2);
    for (let i = 0; i < 5; i++) { const bx = x + 12 + i * 24;
      BOX(c, '#ece0c4', bx, G - 66, 12, 8); R(c, '#1a1c21', bx, G - 58, 12, 30); for (let k = 0; k < 3; k++) R(c, '#262930', bx, G - 50 + k * 8, 12, 1);   // black panels down to the bottom of the banners
      R(c, '#5c6670', bx, G - 28, 12, 5);
      R(c, '#7f9bb0', bx, G - 23, 12, 23); R(c, '#9db6c8', bx, G - 23, 12, 2); R(c, '#2a3542', bx, G - 23, 12, 1); for (const v of [3, 8]) R(c, '#2a3542', bx + v, G - 23, 1, 23);
      if (i === 2) { BOX(c, '#1f6fd6', bx - 1, G - 29, 14, 6); CIRC(c, '#8ad646', bx + 2, G - 26, 1.6); R(c, '#ffffff', bx + 5, G - 27, 6, 1); R(c, '#ffffff', bx + 5, G - 25, 5, 1);
        R(c, '#3a4552', bx + 1, G - 22, 10, 22); R(c, '#9db6c8', bx + 2, G - 21, 3.5, 20); R(c, '#9db6c8', bx + 6.5, G - 21, 3.5, 20); R(c, '#c9ced4', bx + 5, G - 12, 2, 3); }
    }
    for (let i = 0; i < 6; i++) { const px = x + i * 24; R(c, '#d9c3ac', px, G - 68, 12, 68); R(c, '#e8d6c2', px, G - 68, 2, 68); R(c, '#c3ab94', px + 10, G - 68, 2, 68); for (let j = 0; j < 8; j++) R(c, '#5a5f6e', px, G - 62 + j * 8, 12, 1); R(c, '#4a4f5c', px, G - 12, 12, 12); }
    for (const px of [x + 24, x + 72]) { BOX(c, '#1f6fd6', px + 1, G - 60, 10, 30); CIRC(c, '#8ad646', px + 6, G - 55, 3); CIRC(c, '#1f6fd6', px + 6, G - 55, 1.6); for (let j = 0; j < 4; j++) R(c, '#ffffff', px + 5, G - 50 + j * 4, 2, 2); }
  } },
  venue: { w: 420, dx: 120, pre(c, x, G) {
    const B = '#e6dccb'; BOX(c, B, x, G - 66, 124, 66); for (let i = 0; i < 4; i++) R(c, SH(B, .94), x, G - 50 + i * 12, 124, 1); R(c, SH(B, .85), x + 120, G - 66, 4, 66);
    BOX(c, '#4a4d54', x - 2, G - 84, 128, 18); for (let i = 0; i < 9; i++) R(c, '#6a6e76', x, G - 82 + i * 2, 124, 1); for (let i = 0; i < 9; i++) R(c, '#33363c', x + i * 15, G - 84, 2, 18);
    BOX(c, '#2a2c30', x - 1, G - 64, 126, 16); T(c, 'VENUE', x + 30, G - 60, 8, '#efe9dd', 'center', false); T(c, 'CENTRAL', x + 90, G - 60, 8, '#efe9dd', 'center', false);
    CIRC(c, OUT, x + 57, G - 56, 7); CIRC(c, '#b08a3e', x + 57, G - 56, 6); CIRC(c, '#d9b866', x + 57, G - 56, 4); T(c, 'vc', x + 57, G - 60, 8, '#2a2c30', 'center', false);
    BOX(c, '#1a1c20', x + 54, G - 44, 44, 44); R(c, '#e9eef2', x + 56, G - 42, 18, 40); R(c, '#cfd8de', x + 76, G - 42, 20, 40); R(c, '#1a1c20', x + 74, G - 42, 2, 40); R(c, '#3a3d44', x + 80, G - 30, 14, 30);
    BOX(c, '#e8c84a', x + 34, G - 30, 5, 5); BOX(c, '#3a3d44', x + 114, G - 72, 4, 72);
    BOX(c, '#8a8478', x + 12, G - 6, 10, 6);
  }, post(c, x, G) {
    const B = '#d9c2a0'; BOX(c, B, x + 220, G - 124, 80, 124); for (let i = 0; i < 7; i++) R(c, SH(B, .93), x + 220, G - 104 + i * 16, 80, 1); R(c, SH(B, .86), x + 220, G - 124, 3, 124);
    BOX(c, SH(B, 1.04), x + 218, G - 130, 84, 6); BOX(c, '#14161a', x + 246, G - 104, 26, 92); for (let j = 0; j < 4; j++) R(c, j === 3 ? '#f2d79a' : '#26303c', x + 248, G - 102 + j * 23, 22, 21); R(c, '#2a2626', x + 242, G - 12, 34, 3);
    BOX(c, '#2a2a2e', x + 290, G - 120, 6, 4); CIRC(c, 'rgba(255,250,220,.55)', x + 293, G - 112, 5); CIRC(c, '#fffbe6', x + 293, G - 115, 2); BRICK(c, x + 302, G - 110, 0, 0);
    BOX(c, '#2a2a2e', x + 264, G - 8, 20, 8); for (let i = 0; i < 6; i++) CIRC(c, i % 2 ? '#f4f2ec' : '#5f8f3c', x + 266 + i * 3, G - 10, 2);
  } },
};
Object.keys(WIDEN).forEach(k => { const o = WIDEN[k], d0 = L[k].d; L[k].w = o.w; L[k].d = (c, x, G) => { if (o.pre) o.pre(c, x, G); d0(c, x + o.dx, G); if (o.post) o.post(c, x + (o.dx || 0), G); }; });

/* ---------- size tweaks: draw at 1x off-screen, then scale with crisp pixels ---------- */
// text drawn after a landmark is scaled, so small lettering stays crisp (sx/sy = original coordinates)
const SHARP = {
  frasers(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // the blue sign over the doors redrawn crisp, text kept inside the box
    const x0 = X(6), x1 = X(122), y0 = Y(36), y1 = Y(27); R(c, OUT, x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2); R(c, '#1f4fa8', x0, y0, x1 - x0, y1 - y0); R(c, '#2a62c4', x0, y0, x1 - x0, 1);
    let fz = 8; c.font = fz + 'px Silk'; while (c.measureText('FRASERSPLUS LUTON').width > x1 - x0 - 8 && fz > 6) { fz--; c.font = fz + 'px Silk'; }
    c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#ffffff'; c.fillText('FRASERSPLUS LUTON', Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2 - fz / 2)); },
  grandbazar(c, x, G, f) {   // the GB badges redrawn crisp at screen size: navy disc, white ring, pixel G (lime) and B (white)
    const NV = '#243a6a', LM = '#a6cf2a', GL = ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'], BL = ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'];
    for (const [cx0, cy0, r0] of [[92, 92, 13], [69, 50, 10]]) { const cx = Math.round(x + cx0 * f), cy = Math.round(G - cy0 * f), r = Math.round(r0 * f);
      CIRC(c, OUT, cx, cy, r + 1); CIRC(c, '#ffffff', cx, cy, r); CIRC(c, NV, cx, cy, r - 2);
      const put = (gl, ox, col) => gl.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') R(c, col, ox + i, cy - 3 + j, 2, 1); }));   // bold strokes
      put(GL, cx - 7, LM); put(BL, cx + 1, '#ffffff'); } },
  vauxhall(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // crisp lettering on the scaled-up plant
    const t0 = Y(110); T(c, 'HOME OF THE', X(259), t0, 8, '#d42a2a', 'center', true); c.save(); c.font = '700 16px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; c.lineWidth = 3; c.lineJoin = 'round'; c.strokeStyle = '#f4f6f8'; c.strokeText('VAUXHALL VIVARO', X(259), t0 + 9); c.fillStyle = '#d42a2a'; c.fillText('VAUXHALL VIVARO', X(259), t0 + 9); c.restore();
    R(c, '#c3c7cc', X(105), Y(87), X(149) - X(105), Y(78) - Y(87)); T(c, 'VAUXHALL', X(127), Y(86), 8, '#3a3f46', 'center', false); T(c, 'VAUXHALL', X(294), Y(33), 8, '#1f2f5a', 'center', false); T(c, 'Gate 2', X(294), Y(33) + 10, 8, '#3a3f46', 'center', false); },
  kaya(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // crisp KAYA / L O U N G E on the scaled-down sign
    R(c, '#1c1b1e', X(26), Y(95), X(100) - X(26), Y(65) - Y(95)); const t0 = Y(96) + 2; T(c, 'KAYA', X(60), t0, 16, '#eceae4'); T(c, 'L O U N G E', X(60), t0 + 16, 8, '#eceae4', 'center', false); },
  kahwa(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // crisp KAHWA CAFE, centred on the board right of the round sign
    R(c, '#4a2a1e', X(29), Y(58), X(112) - X(29), Y(45) - Y(58)); c.font = '700 8px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; const cx = X(70.5), ty = Math.round((Y(60) + Y(44)) / 2) - 4; c.fillStyle = '#1e100a'; c.fillText('KAHWA CAFE', cx + 1, ty + 1); c.fillStyle = '#f3e9d6'; c.fillText('KAHWA CAFE', cx, ty); },
  lewsey(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // crisp ENTRANCE inside its white panel
    R(c, '#ffffff', X(185), Y(60), X(261) - X(185), Y(51) - Y(60)); T(c, 'ENTRANCE', X(223), Math.round((Y(61) + Y(50)) / 2) - 4, 8, '#22408a', 'center', false); },
  tesco(c, x, G, f) { const X = v => Math.round(x + 77 + v * f), Y = v => Math.round(G - v * f);   // crisp Welcome inside its red box over the door
    T(c, 'Welcome', X(75), Y(60.6), Math.round(8 * f), '#ffffff', 'center', false); },
  chiltern(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // crisp WELCOME over the door
    R(c, '#ecebe7', X(152), Y(25), X(214) - X(152), Y(17) - Y(25)); T(c, 'WELCOME', X(183), Y(22.5), 8, '#3e4148', 'center', false); },
  krispy(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    // crisp, slightly taller sign after the 0.82 scale-down
    const sx = X(4), sw = Math.round(132 * f), top = Y(76), bot = Y(48);
    BOX(c, '#6e1f33', sx, top, sw, bot - top); R(c, '#f2c96b', sx + 2, bot - 2, sw - 4, 1);
    { const cx = sx + Math.round(sw * .44); c.font = '700 8px Silk'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#f2c96b'; for (const [t, ty] of [['KRISPY LEMON', top + 2], ['CHICKEN', top + 11]]) c.fillText(t, Math.round(cx - c.measureText(t).width / 2), ty); }
    const cx = sx + sw - 11, cy = top + 11; CIRC(c, '#ffffff', cx, cy, 4); R(c, '#f2c14e', cx + 3, cy - 1, 3, 2); R(c, '#d84b3c', cx - 1, cy - 6, 3, 2); R(c, '#1b1a24', cx + 1, cy - 1, 1, 1);
    BOX(c, '#c62828', sx, bot, sw, 10); c.font = '8px Silk'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#ffffff'; { let t = 'BURGERS \u00b7 PIZZA \u00b7 CHIPS'; if (c.measureText(t).width > sw - 4) t = 'BURGERS\u00b7PIZZA\u00b7CHIPS'; c.fillText(t, Math.round(sx + (sw - c.measureText(t).width) / 2), bot + 1); } },
  spudkingz(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    const fs = Math.max(8, Math.round(12 * f / .64)); c.font = `700 ${fs}px Silk`; c.textBaseline = 'middle'; const w1 = c.measureText('Spud ').width, w2 = c.measureText('Kingz').width, sx0 = Math.round(X(110) - (w1 + w2) / 2);
    R(c, '#141416', sx0 + 3, Y(105), Math.round(w1 + w2) - 6, 2);
    c.textAlign = 'left'; c.strokeStyle = '#0a0a0c'; c.lineWidth = 2; c.lineJoin = 'round'; c.strokeText('Spud', sx0, Y(103)); c.strokeText('Kingz', sx0 + w1, Y(103)); c.fillStyle = '#5fd36a'; c.fillText('Spud', sx0, Y(103)); c.fillStyle = '#f6c933'; c.fillText('Kingz', sx0 + w1, Y(103));
    const ts = Math.max(5, Math.round(7 * f / .64)), lh = Math.max(ts + 1, Math.round(8 * f / .64)); BOX(c, '#141416', X(30), Y(40) - 1, Math.round(160 * f), lh * 2 + 2); c.textAlign = 'center'; c.font = `${ts}px Silk`; c.fillStyle = '#d9b05a'; c.fillText('CROWNED IN FLAVOUR', X(112), Y(40) + Math.round(lh / 2)); c.fillText('ROOTED IN COMMUNITY', X(112), Y(40) + Math.round(lh * 1.5)); },
  masjid(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);   // v = unscaled coords incl. the 50px widening
    BOX(c, '#1f5a44', X(53), Y(118), Math.round(116 * f), Math.round(16 * f)); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 8px Amiri'; c.fillStyle = '#f4f2ec'; c.direction = 'rtl'; c.fillText('\u0645\u0631\u06a9\u0632\u06cc \u062c\u0627\u0645\u0639 \u0645\u0633\u062c\u062f \u063a\u0648\u062b\u06cc\u0647', X(111), Y(113)); c.direction = 'ltr';
    T(c, 'LUTON CENTRAL MOSQUE', X(111), Y(108) - 3, 8, '#f4f2ec', 'center', false);
    BOX(c, '#ecebe7', X(183), Y(102), Math.round(117 * f), Math.round(12 * f)); c.font = '700 10px Amiri'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1f5a34'; c.direction = 'rtl';
    c.fillText('\u0644\u0627 \u0625\u0644\u0647 \u0625\u0644\u0627 \u0627\u0644\u0644\u0647 \u0645\u062d\u0645\u062f \u0631\u0633\u0648\u0644 \u0627\u0644\u0644\u0647', X(241), Y(96)); c.direction = 'ltr'; },
  suffa(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    BOX(c, "#1c1e22", X(96), Y(64), Math.round(96 * f), Math.round(22 * f)); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '8px Silk'; c.fillStyle = '#ffffff'; c.fillText('SUFFA-TUL-ISLAM', X(144), Y(58)); c.font = '700 8px Silk'; c.fillText('MASJID', X(144), Y(49)); },
  oak(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    BOX(c, '#1e3fa3', X(34), Y(64), Math.round(142 * f), Math.round(18 * f)); T(c, 'OAK STAND', X(105), Y(64) + 4, 8, '#ffffff');
    T(c, 'F.G', X(44), Y(64) + 4, 8, '#ffffff', 'center', false); T(c, 'D.E', X(166), Y(64) + 4, 8, '#ffffff', 'center', false); },
  currys(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    for (const sx of [8, 276]) { BOX(c, '#22408a', X(sx), Y(98), Math.round(76 * f), Math.round(22 * f)); T(c, 'Carphone', X(sx + 38), Y(98) + 3, 8, '#ffffff', 'center', false); T(c, 'Warehouse', X(sx + 38), Y(98) + 14, 8, '#ffffff', 'center', false); }
    BOX(c, '#3f2a9c', X(92), Y(154), Math.round(176 * f), Math.round(48 * f)); R(c, '#4c36b0', X(92) + 1, Y(154) + 1, Math.round(176 * f) - 2, 2);
    c.strokeStyle = '#ece8fa'; c.lineWidth = 1.5; c.beginPath(); c.arc(X(180), Y(130), 25, 0, 7); c.stroke();
    c.font = '700 8px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#251766'; c.fillText('currys', X(180) + 1, Y(130) - 3); c.fillStyle = '#ffffff'; c.fillText('currys', X(180), Y(130) - 4); },
  chaiikhana(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    BOX(c, '#151618', X(-4), Y(88), Math.round(96 * f), 17); T(c, 'CHAIIKHANA', X(44), Y(88) + 4, 8, '#f4f4f2', 'center', true);
    T(c, 'ORDER', X(34), Y(30) + 2, 8, '#e0458a', 'center', true); },
};
const SCALE = { jdgyms: 1.3, vauxhall: 1.25, kaya: .85, galaxy: 1.25, leagrave: .9, letters: .8, townhall: 1.2, masjidali: 1.5, inspire: 1.21, funfair: 1.25, airport: 1.2, sixthform: 1.44, uob: 1.2, chiltern: 1.2, lewsey: 1.2, grandbazar: 1.2, lidl: 1.2, matalan: 1.5, bandq: 1.56, tesco: 1.5, cycleking: .98, topspizza: .82, alquds: .82, kahwa: .82, gna: .82, toros: .82, krispy: .82, lutonhoo: 1.5, currys: 1.15, masjid: 1.32, suffa: 1.08, oak: .82, chaiikhana: .85, spudkingz: .48, nadeem: 1.52, chaiiwala: 1.32, frasers: 1.6, stmarys: 1.02, hatfactory: 1.3 };
// (SCALE is applied at the end of the file, once every landmark is defined)

/* things drawn after scaling, so they keep their own size */
const POST = {
  // Mr Rushed's ice cream van and his black Donner Rush food truck, parked up together in the Currys car park
  currys(c, x, G) { const V = window.VEHICLES; if (V && V.mrrushed && V.mrrushed.parked) { V.mrrushed.parked(c, x + 94, G, .79, null); if (V.donner) V.donner.parked(c, x + 226, G, .81); /* both vans 25% smaller (owner, 18 Nov) */ } },
};
Object.keys(POST).forEach(k => { const d0 = L[k].d; L[k].d = (c, x, G) => { d0(c, x, G); POST[k](c, x, G); }; });

/* ---------- in-between houses (not landmarks) ---------- */
const HOUSES = {};
const ROOF = (c, x, G, w, h, top, col = '#5a4e48') => { P(c, col, [[x - 3, G - h], [x + w + 3, G - h], [x + w - 8, G - h - top], [x + 8, G - h - top]], true); for (let i = 1; i < top / 4; i++) R(c, SH(col, .86), x + 4 + i, G - h - i * 4, w - 8 - i * 2, 1); };
const CHIM = (c, x, y) => { if (window.__CHREC) window.__CHREC.push([x + 7, y - 6]); BRICK(c, x, y, 14, 22, '#9a4a36', '#844030'); R(c, OUT, x - 1, y - 1, 16, 1); for (let i = 0; i < 3; i++) { BOX(c, '#c86a4a', x + 1 + i * 5, y - 6, 3, 6); } };
const DOOR = (c, x, G, col = '#f4f2ec') => { BOX(c, col, x, G - 26, 12, 26); R(c, '#9fc1d8', x + 3, G - 23, 6, 4); CIRC(c, '#d9b44a', x + 9, G - 12, 1); };
const BAY = (c, x, G, w, h, roof = '#4a3e38') => { BOX(c, '#f4f2ec', x, G - h, w, h); for (let i = 0; i < 3; i++) R(c, '#dfe6ec', x + 2 + i * (w - 4) / 3, G - h + 2, (w - 4) / 3 - 2, h - 4); for (let i = 0; i < 3; i++) R(c, '#f4f2ec', x + 2 + i * (w - 4) / 3 + 3, G - h + 4, 1, h - 8); P(c, roof, [[x - 2, G - h], [x + w + 2, G - h], [x + w - 4, G - h - 8], [x + 4, G - h - 8]], true); };
const WALL = (c, x, G, w) => { for (let i = 0; i < w; i += 4) BRICK(c, x + i, G - 9, 4, 9, '#b0533c', '#94452f'); R(c, OUT, x, G - 10, w, 1); };
HOUSES.terrace = { w: 120, d(c, x, G) {
  for (let k = 0; k < 2; k++) { const hx = x + k * 60, col = k ? '#c85a48' : '#a8503a';
    BRICK(c, hx, G - 70, 60, 70, col, SH(col, .88)); R(c, OUT, hx - 1, G - 71, 62, 1); R(c, '#e8e0cf', hx, G - 44, 60, 2);
    WIN(c, hx + 8, G - 64, 16, 18); WIN(c, hx + 34, G - 64, 16, 18); BAY(c, hx + 6, G, 26, 22); DOOR(c, hx + 40, G); R(c, '#e8e0cf', hx + 38, G - 28, 16, 2); }
  ROOF(c, x, G, 120, 70, 18); CHIM(c, x + 10, G - 104); CHIM(c, x + 96, G - 104); R(c, '#3a3d44', x + 22, G - 124, 1, 22); R(c, '#3a3d44', x + 16, G - 122, 13, 1); R(c, '#3a3d44', x + 18, G - 118, 9, 1); R(c, '#3a3d44', x + 24, G - 104, 2, 2);
  WALL(c, x, G, 28); WALL(c, x + 60, G, 28); BIN(c, x + 102, G, '#2f6f3a');
} };
HOUSES.pebble = { w: 70, d(c, x, G) {
  const PB = '#ece3cf'; BOX(c, PB, x, G - 72, 70, 72); for (let i = 0; i < 40; i++) R(c, '#d8cdb4', x + (i * 17) % 68, G - 70 + (i * 13) % 50, 1, 1); R(c, '#1a1a1e', x, G - 8, 70, 8);
  ROOF(c, x, G, 70, 72, 14); CHIM(c, x + 50, G - 100);
  BOX(c, '#f4f2ec', x + 6, G - 66, 32, 22); for (let i = 0; i < 3; i++) R(c, '#dfe6ec', x + 8 + i * 10, G - 64, 8, 18); R(c, '#2a2a2e', x + 20, G - 40, 6, 6);
  BAY(c, x + 4, G - 8, 34, 26); WIN(c, x + 46, G - 66, 14, 16); DOOR(c, x + 48, G - 8); R(c, '#b9b3a6', x + 44, G - 8, 20, 3);
} };
HOUSES.semi = { w: 90, d(c, x, G) {
  BOX(c, '#e3c47a', x, G - 70, 90, 70); for (let i = 0; i < 40; i++) R(c, '#d1b064', x + (i * 23) % 88, G - 68 + (i * 11) % 66, 1, 1);
  BRICK(c, x, G - 26, 90, 26, '#b0533c', '#94452f');
  P(c, '#5a4e48', [[x - 3, G - 70], [x + 93, G - 70], [x + 80, G - 90], [x + 10, G - 90]], true);
  P(c, '#e3c47a', [[x + 4, G - 70], [x + 22, G - 104], [x + 40, G - 70]], true); c.save(); c.beginPath(); c.moveTo(x + 6, G - 70); c.lineTo(x + 22, G - 100); c.lineTo(x + 38, G - 70); c.closePath(); c.clip(); for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i + j) % 2) R(c, '#b0533c', x + 4 + i * 4, G - 104 + j * 4, 4, 4); c.restore();
  BOX(c, '#f4f2ec', x + 6, G - 66, 32, 24); for (let i = 0; i < 3; i++) R(c, '#dfe6ec', x + 8 + i * 10, G - 64, 8, 20); BAY(c, x + 6, G - 2, 32, 22);
  WIN(c, x + 50, G - 64, 30, 18); BOX(c, '#b0533c', x + 44, G - 34, 46, 34); P(c, '#5a4e48', [[x + 42, G - 34], [x + 92, G - 34], [x + 88, G - 40], [x + 46, G - 40]], true); BOX(c, '#c8892a', x + 50, G - 28, 12, 28); WIN(c, x + 68, G - 28, 16, 14);
  CHIM(c, x + 60, G - 106);
} };
HOUSES.render = { w: 70, d(c, x, G) {
  BOX(c, '#f1e9dc', x, G - 70, 70, 70); R(c, '#1a1a1e', x, G - 6, 70, 6); ROOF(c, x, G, 70, 70, 12, '#6a5a50'); CHIM(c, x + 8, G - 96);
  BOX(c, '#f4f2ec', x + 6, G - 64, 34, 20); for (let i = 0; i < 3; i++) R(c, '#dfe6ec', x + 8 + i * 10, G - 62, 9, 16); BAY(c, x + 6, G - 6, 34, 24, '#3a3d44');
  WIN(c, x + 48, G - 64, 14, 14); DOOR(c, x + 50, G - 6); R(c, '#3a3d44', x + 52, G - 22, 4, 4); BOX(c, '#4a6a3a', x + 40, G - 10, 6, 6); BIN(c, x + 62, G, '#3a3d44');
} };
const TERR = (wall, roof, door, n = 4, painted) => ({ w: n * 58, d(c, x, G) {
  for (let k = 0; k < n; k++) { const hx = x + k * 58, col = painted ? wall[k % wall.length] : k % 2 ? SH(wall, .94) : wall;
    if (painted) { BOX(c, col, hx, G - 66, 58, 66); R(c, SH(col, .9), hx + 56, G - 66, 2, 66); } else BRICK(c, hx, G - 66, 58, 66, col, SH(col, .86)); R(c, OUT, hx - 1, G - 67, 60, 1); R(c, '#e8e0cf', hx, G - 40, 58, 2);
    WIN(c, hx + 7, G - 60, 16, 16); WIN(c, hx + 33, G - 60, 16, 16); BAY(c, hx + 5, G, 26, 22); DOOR(c, hx + 38, G, door[k % door.length]); R(c, '#e8e0cf', hx + 36, G - 28, 16, 2); WALL(c, hx, G, 26); }
  ROOF(c, x, G, n * 58, 66, 16, roof);
  for (let k = 1; k < n; k++) if (n < 4 || k % 2) CHIM(c, x + k * 58 - 5, G - 98);
  R(c, '#3a3d44', x + 63, G - 120, 1, 24); R(c, '#3a3d44', x + 57, G - 118, 13, 1); R(c, '#3a3d44', x + 59, G - 114, 9, 1);
  BIN(c, x + n * 58 - 12, G, '#2f6f3a');
} });
HOUSES.rowGrey = TERR('#9a9a96', '#3e4248', ['#2f4fa8', '#f4f2ec', '#8a1d2a']);
HOUSES.rowYellow = TERR('#d9b86a', '#7a3e30', ['#f4f2ec', '#2f6f3a', '#1a1a1e']);
HOUSES.rowBrown = TERR('#7a5038', '#4a5a52', ['#c8892a', '#f4f2ec', '#2f4fa8'], 3);
HOUSES.rowRed = TERR('#b0533c', '#3e3a38', ['#f4f2ec', '#1a1a1e', '#2f6f3a'], 3);
HOUSES.rowPainted = TERR(['#f1e6cf', '#cfe0e6', '#ecd6d2'], '#4a4e56', ['#2f4fa8', '#8a1d2a', '#2f6f3a'], 3, true);
HOUSES.pairRed = TERR('#9a4a36', '#4a3e38', ['#f4f2ec', '#c8892a'], 2);
// bungalow: low and wide, hipped roof, one chimney sitting on the roof
HOUSES.bungalow = { w: 84, d(c, x, G) {
  BRICK(c, x, G - 34, 84, 34, '#b8644a', '#9a5038'); R(c, OUT, x - 1, G - 35, 86, 1);
  P(c, '#5a4e48', [[x - 4, G - 34], [x + 88, G - 34], [x + 70, G - 56], [x + 14, G - 56]], true); for (let i = 1; i < 5; i++) R(c, SH('#5a4e48', .86), x - 2 + i * 3.5, G - 34 - i * 4, 88 - i * 7, 1);
  CHIM(c, x + 56, G - 70); WIN(c, x + 6, G - 28, 22, 16); DOOR(c, x + 36, G); WIN(c, x + 56, G - 28, 22, 16); WALL(c, x + 50, G, 30);
} };
// new-build: brick with grey cladding panel and a porch canopy
HOUSES.newbuild = { w: 72, d(c, x, G) {
  BRICK(c, x, G - 74, 72, 74, '#c27a52', '#a8653f'); R(c, OUT, x - 1, G - 75, 74, 1); BOX(c, '#6e747c', x + 40, G - 74, 32, 30); for (let i = 0; i < 5; i++) R(c, '#5e646c', x + 40, G - 70 + i * 6, 32, 1);
  P(c, '#3e4248', [[x - 3, G - 74], [x + 75, G - 74], [x + 62, G - 92], [x + 10, G - 92]], true);
  WIN(c, x + 8, G - 66, 22, 18, '#f4f2ec', '#7f97a8'); WIN(c, x + 46, G - 66, 18, 16, '#2a2c30', '#7f97a8'); WIN(c, x + 8, G - 34, 22, 20, '#f4f2ec', '#7f97a8');
  BOX(c, '#3a3d44', x + 42, G - 36, 26, 3); DOOR(c, x + 48, G, '#3a3d44'); BIN(c, x + 64, G, '#3a3d44');
} };
window.HOUSES = HOUSES;

window.LM_ANIM = {
  train(c, x, G) { const W = '#e9ecef', B = '#5f9fd6'; for (let k = 0; k < 3; k++) { const cx = x + k * 66; R(c, OUT, cx - 1, G - 121, 64, 30); R(c, W, cx, G - 120, 62, 28); R(c, '#f2c43a', cx, G - 116, 62, 2); R(c, '#9aa3ad', cx, G - 94, 62, 2);
      for (let i = 0; i < 3; i++) R(c, '#1a1c22', cx + 6 + i * 18, G - 111, 12, 7); R(c, OUT, cx + 46, G - 113, 10, 19); R(c, B, cx + 47, G - 112, 8, 17); R(c, '#1a1c22', cx + 48, G - 110, 6, 5); }
    P(c, W, [[x + 198, G - 120], [x + 210, G - 116], [x + 218, G - 98], [x + 218, G - 92], [x + 198, G - 92]], true); R(c, '#1a1c22', x + 204, G - 114, 8, 8); R(c, '#f2c43a', x + 214, G - 98, 3, 2);
    T(c, 'ThamesLink', x + 30, G - 104, 8, '#3a3d44', 'center', false); },
  plane(c, x, y, a) { c.save(); c.translate(x, y); c.rotate(a); const g = '#f2f2f4', d = '#a8b0ba', o = '#e8641c';
    R(c, OUT, -31, -6, 62, 11); R(c, g, -30, -5, 60, 9); R(c, d, -30, 2, 60, 2); P(c, g, [[30, -5], [40, 0], [30, 4]], true); R(c, '#1a2a44', 32, -3, 4, 2);
    P(c, o, [[-30, -5], [-36, -20], [-24, -20], [-18, -5]], true); P(c, d, [[-6, 0], [10, 0], [-2, 16], [-10, 16]], true); P(c, d, [[-6, -2], [8, -2], [-2, -12], [-8, -12]], true);
    for (let i = 0; i < 8; i++) R(c, '#3d6584', -14 + i * 5, -3, 2, 2); R(c, o, -30, -1, 60, 1); c.restore(); }
};
const WATER = (c, x, G, w, t) => {
  // flowing water: three bands of ripples drifting at different speeds, plus glints (world-anchored so segments join up)
  c.save(); c.beginPath(); c.rect(x, G - 16, w, 16); c.clip(); R(c, '#3d6b78', x, G - 16, w, 16);
  R(c, '#46798a', x, G - 16, w, 3); R(c, '#356170', x, G - 4, w, 4);
  [[G - 13, 26, 14, '#7fb0bb'], [G - 9, 18, 22, '#6c9ba6'], [G - 5, 32, 9, '#5d8e9a']].forEach(([y, gap, sp, col], r) => { const o = (t * sp) % gap; for (let i = -1; i < w / gap + 1; i++) { const rx = x + i * gap + o + r * 7; R(c, col, rx, y + Math.round(Math.sin(t * 2 + i + r) * 0.6), 8 + (i % 2) * 4, 1); } });
  for (let i = 0; i < Math.ceil(w / 50); i++) { const ph = (t * 1.3 + i * .37) % 1; if (ph < .35) R(c, '#e8f4f6', x + ((i * 53 + Math.floor(t * 9)) % (w - 10)), G - 12 + (i % 3) * 3, 2, 1); }
  c.restore(); };
// Luton Hoo: working fountain + helicopter that spools up and takes off as you fly towards it
window.LM_ANIM.lutonhoo = (c, x, G, t) => {
  const k = 1.5, SW = (typeof W !== 'undefined' ? W : 300);
  c.save(); c.translate(x, G); c.scale(k, k);
  // fountain (local coords of the unscaled drawing, ground = 0)
  const fx = 173;
  for (let i = 0; i < 6; i++) { const ph = (t * .5 + i / 6) % 1; R(c, '#9fd0ea', fx - 32 + ((i * 23 + Math.floor(t * 6)) % 60), -11 + (i % 3) * 2, 3, 1); if (ph < .5) R(c, '#ffffff', fx - 30 + ((i * 37 + Math.floor(t * 4)) % 56), -10 + (i % 2) * 3, 1, 1); }
  for (let j = 0; j < 28; j++) { const ph = (t * .85 + j / 28) % 1, sd = j % 2 ? 1 : -1, outer = j % 4 > 1;
    const xe = outer ? 30 : 13, ye = outer ? -12 : -33, px = fx + sd * xe * ph, py = -63 - 9 * ph + (ye + 72) * ph * ph;
    R(c, ph < .15 ? '#ffffff' : '#bfe3f5', px, py, 1, 2); }
  for (let j = 0; j < 8; j++) { const ph = (t * 1.4 + j / 8) % 1, sd = j % 2 ? 1 : -1; R(c, '#bfe3f5', fx + sd * (14 + (j % 3)), -34 + ph * 22, 1, 2); }
  R(c, '#ffffff', fx, -66 - Math.round(Math.abs(Math.sin(t * 6)) * 2), 1, 3);
  // helicopter: parked on the lawn, takes off once the estate is ahead of you, climbs and flies off
  const lift = Math.max(0, Math.min(1, (SW * .34 - x) / (SW * 1.1))), spin = .35 + Math.min(1, Math.max(0, (SW * .75 - x) / (SW * .35)));
  const hx = 34 - lift * lift * 150, hy = -6 - lift * 150 - lift * lift * 40, tilt = -lift * .16;
  if (hx > -120 && hy > -320) {
    c.save(); c.translate(hx + 20, hy - 14); c.rotate(tilt); c.translate(-20, 14);
    if (lift === 0) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-4, 1, 52, 2); }
    // skids
    R(c, '#2a2f38', -2, 0, 46, 2); R(c, '#2a2f38', 44, -1, 2, 2); R(c, '#2a2f38', 6, -6, 2, 6); R(c, '#2a2f38', 30, -6, 2, 6);
    // thick tail boom, fin and tail rotor
    P(c, '#1e2740', [[34, -20], [66, -19], [68, -15], [34, -11]], true); R(c, '#2b3550', 36, -14, 30, 1);
    P(c, '#1e2740', [[62, -19], [70, -31], [74, -31], [70, -15]], true); R(c, '#c9a64a', 66, -22, 3, 1);
    const ta = t * 30 * spin, tl = 7; c.strokeStyle = '#9aa3b0'; c.lineWidth = 1.5; for (const a of [ta, ta + Math.PI / 2]) { c.beginPath(); c.moveTo(71 - Math.cos(a) * tl, -24 - Math.sin(a) * tl); c.lineTo(71 + Math.cos(a) * tl, -24 + Math.sin(a) * tl); c.stroke(); }
    CIRC(c, '#2a2f38', 71, -24, 1);
    // cabin + glass
    P(c, '#1e2740', [[0, -10], [4, -22], [14, -27], [30, -27], [38, -20], [38, -8], [4, -6]], true);
    P(c, '#5e7894', [[2, -12], [6, -21], [15, -25], [20, -25], [20, -12]]); R(c, 'rgba(255,255,255,.45)', 8, -22, 6, 1); R(c, '#2b3550', 20, -25, 1, 13); R(c, '#9aa3b0', 24, -16, 10, 1); R(c, '#e23a3a', 37, -12, 1, 2);
    // mast + main rotor (blur disc + spinning blade)
    R(c, '#2a2f38', 18, -31, 3, 4); c.fillStyle = 'rgba(70,80,96,' + (.08 + spin * .12) + ')'; c.fillRect(-18, -34, 78, 3);
    const ma = t * 22 * spin, L = 39; for (const o of [0, Math.PI]) { const len = Math.round(L * Math.cos(ma + o)); R(c, '#2a2f38', Math.min(20, 20 + len), -33, Math.abs(len) || 1, 2); }
    CIRC(c, '#3a4250', 20, -32, 2);
    c.restore();
    if (lift > 0 && lift < .35) { c.fillStyle = 'rgba(220,230,210,' + (.35 - lift) + ')'; for (let i = 0; i < 6; i++) { const d = 10 + ((t * 40 + i * 9) % 30); c.fillRect(54 + d, -3 - (i % 2), 3, 1); c.fillRect(-14 - d, -3 - (i % 2), 3, 1); } }
  }
  c.restore(); };
// green flag on the Masjid-e-Ali alam pole, black writing on it, waving as you fly past
// Town Hall clock shows the real time
window.LM_ANIM.townhall = (c, x, G, t) => { const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60, cx = x + 100, cy = G - 152;
  c.save(); c.lineCap = 'round'; c.strokeStyle = '#3e3018'; c.lineWidth = 1;
  const hand = (a, len) => { c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(a) * len, cy - Math.cos(a) * len); c.stroke(); };
  hand(h / 12 * 2 * Math.PI, 2.6); c.lineWidth = .7; hand(m / 60 * 2 * Math.PI, 4.1); c.fillStyle = '#c9a64a'; c.fillRect(cx - .5, cy - .5, 1, 1); c.restore();
  // the two Luton flags on the roof, waving: the flag is drawn once at 8x, then laid down in thin columns that ripple more the further they are from the pole
  let F = window.__lutonFlag; if (!F) { F = window.__lutonFlag = document.createElement('canvas'); F.width = 128; F.height = 80; const g = F.getContext('2d'), pk = RK; g.scale(8, 8); RK = 8; try { LUTONFLAG(g, 0, 0); } finally { RK = pk; } }
  const tt = (typeof t === 'number' ? t : performance.now() / 1000), sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  [x + 41, x + 169].forEach((fx, n) => { for (let i = 0; i < 32; i++) { const u = i / 32, dy = Math.sin(tt * 4.2 - u * 7 + n * 1.7) * 1.1 * u, sh = Math.cos(tt * 4.2 - u * 7 + n * 1.7) * u;
      c.drawImage(F, i * 4, 0, 4, 80, fx + u * 16, G - 147 + dy, .55, 10); if (sh > .25) { c.fillStyle = 'rgba(0,0,0,' + ((sh - .25) * .22).toFixed(3) + ')'; c.fillRect(fx + u * 16, G - 147 + dy, .55, 10); } } });
  c.imageSmoothingEnabled = sm; };
window.LM_ANIM.masjidali = (c, x, G, t) => { const fx = x + 63, N = 32, Y0 = G - 112;
  // drawn on its own small canvas at whole pixels, then stamped on without smoothing: a solid flag, nothing see-through at any scale
  const F = window.__mflag || (window.__mflag = document.createElement('canvas')); F.width = N + 2; F.height = 40; const g = F.getContext('2d'); g.clearRect(0, 0, F.width, F.height);
  const col = []; for (let i = 0; i < N; i++) { const k = i / (N - 1), dy = Math.sin(t * 4.5 - i * .32) * 2.4 * k; col.push([Math.round(8 + i * .2 + dy), Math.round(24 - i * .12)]); }
  g.fillStyle = OUT; col.forEach(([tp, h], i) => g.fillRect(i + 1, tp - 1, 1, h + 2)); g.fillRect(N + 1, col[N - 1][0], 1, col[N - 1][1]);
  col.forEach(([tp, h], i) => { g.fillStyle = (i >> 2) % 2 ? '#1f8f3a' : '#23994a'; g.fillRect(i + 1, tp, 1, h);
    g.fillStyle = '#101012'; if (i > 3 && i < N - 3) { if ((i * 5) % 7 < 4) g.fillRect(i + 1, tp + 6 + ((i * 3) % 3), 1, 1); if ((i * 7) % 9 < 5) g.fillRect(i + 1, tp + 11 + ((i * 2) % 3), 1, 1); if (i % 6 === 2) g.fillRect(i + 1, tp + 5, 1, 9); if ((i * 11) % 13 < 5) g.fillRect(i + 1, tp + 16 + (i % 2), 1, 1); } });
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false; c.drawImage(F, fx - 1, Y0); c.imageSmoothingEnabled = sm;
  c.fillStyle = '#e8eaee'; c.fillRect(fx - 2, G - 105, 2, 26); };
window.LM_ANIM.wardown = (c, x, G, t) => {
  WATER(c, x, G, 210, t);
  // ducks paddling about: a mallard drake, a brown hen and a duckling following her
  const duck = (dx, dy, f, kind) => { const X = Math.round(dx), Y = Math.round(dy), o = f > 0 ? 0 : 1, at = (a, w) => f > 0 ? X + a : X + 7 - a - w;
    R(c, 'rgba(255,255,255,.45)', at(-3, 3), Y + 3, 3, 1);
    if (kind === 2) { R(c, '#c9a24a', at(1, 3), Y + 1, 3, 2); R(c, '#e8c860', at(3, 2), Y, 2, 2); R(c, '#f08a2a', at(5, 1), Y + 1, 1, 1); return; }
    R(c, OUT, at(0, 7), Y, 7, 4); R(c, kind ? '#8a6a44' : '#9a8a78', at(1, 5), Y + 1, 5, 2); R(c, kind ? '#6a4e30' : '#5a5f6e', at(0, 2), Y + 1, 2, 2);
    R(c, OUT, at(5, 3), Y - 3, 3, 4); R(c, kind ? '#7a5a3a' : '#2e8b57', at(5, 2), Y - 2, 2, 2); if (!kind) R(c, '#f4f2ec', at(5, 2), Y, 2, 1); R(c, '#f2c43a', at(7, 1), Y - 1, 1, 1); };
  { const p1 = Math.sin(t * .35), p2 = Math.sin(t * .35 - .5), d1 = Math.cos(t * .35) >= 0 ? 1 : -1;
    duck(x + 40 + p1 * 22, G - 10 + Math.sin(t * 2.2) * .6, d1, 0); duck(x + 60 + p2 * 22, G - 8 + Math.sin(t * 2.4 + 1) * .6, d1, 1); duck(x + 70 + p2 * 22 - d1 * 6, G - 7 + Math.sin(t * 2.8 + 2) * .5, d1, 2);
    const p3 = Math.sin(t * .28 + 2); duck(x + 170 + p3 * 14, G - 9 + Math.sin(t * 2) * .6, Math.cos(t * .28 + 2) >= 0 ? 1 : -1, 0); }
  c.save(); c.beginPath(); c.rect(x, G - 16, 210, 16); c.clip();
  // pedalo boat gliding back and forth, bobbing on the water
  const span = 150, ph = (t * 14) % (span * 2), dir = ph < span ? 1 : -1, bx = Math.round(x + 8 + (ph < span ? ph : span * 2 - ph)), by = Math.round(G - 12 + Math.sin(t * 3) * 1);
  R(c, 'rgba(255,255,255,.55)', bx - dir * 6 + (dir < 0 ? 22 : 0), by + 6, 8, 1); R(c, 'rgba(255,255,255,.35)', bx - dir * 12 + (dir < 0 ? 22 : 0), by + 7, 6, 1);
  c.restore();
  PERSON0(c, bx + 5, by + 5, '#e8641c', '#2a2a33'); PERSON0(c, bx + 16, by + 5, '#2a2a33', '#2a2a33', '#e2b38a');
  BOX(c, '#2f7fd0', bx, by, 26, 7); R(c, '#1f5fa8', bx + 1, by + 5, 24, 1); R(c, '#4fa0ea', bx + 1, by - 3, 4, 3); R(c, '#4fa0ea', bx + 21, by - 3, 4, 3); R(c, '#f4f2ec', bx + 11, by + 2, 4, 2);
};
window.LANDMARKS = L;
L.smr = { n: 'SMR Digital', w: 210, d(c, x, G) {
  // old red-brick building, side on: a blank gable wall carrying a big SMR billboard, the narrow front with sash windows on the right
  const WT = G - 150, BR = '#9c4a36', BL = '#86402e';
  // gable wall (pitched top) + front strip
  P(c, OUT, [[x + 8, G], [x + 8, WT - 1], [x + 88, WT - 30], [x + 168, WT - 1], [x + 168, G]]);
  c.save(); c.beginPath(); c.moveTo(x + 9, G); c.lineTo(x + 9, WT); c.lineTo(x + 88, WT - 29); c.lineTo(x + 167, WT); c.lineTo(x + 167, G); c.closePath(); c.clip(); BRICK(c, x + 9, WT - 30, 158, 180, BR, BL); c.restore();
  P(c, '#5a5b62', [[x + 6, WT + 1], [x + 88, WT - 31], [x + 170, WT + 1], [x + 170, WT + 4], [x + 88, WT - 27], [x + 6, WT + 4]], true);   // stone coping
  BOX(c, '#8a3f2e', x + 80, WT - 46, 16, 18); R(c, '#6e3226', x + 80, WT - 34, 16, 2); for (const k of [83, 90]) { BOX(c, '#b8643e', x + k, WT - 52, 4, 6); }   // chimney + pots
  BRICK(c, x + 168, WT + 8, 34, 142, '#8a4030', '#763628'); R(c, OUT, x + 167, WT + 8, 1, 142); R(c, OUT, x + 202, WT + 8, 1, 142); P(c, '#4a4b52', [[x + 166, WT + 9], [x + 176, WT - 4], [x + 204, WT - 4], [x + 204, WT + 9]], true);
  for (let f = 0; f < 3; f++) { const wy = WT + 18 + f * 38; BOX(c, '#f1ede4', x + 176, wy, 18, 26); R(c, '#3a4a5a', x + 178, wy + 2, 14, 10); R(c, '#3a4a5a', x + 178, wy + 14, 14, 10); R(c, '#f1ede4', x + 178, wy + 12, 14, 2); R(c, '#d9d2c2', x + 174, wy + 26, 22, 2); R(c, '#d9d2c2', x + 175, wy - 3, 20, 2); }
  BOX(c, '#1f3a5c', x + 176, G - 30, 18, 30); R(c, '#9fb7c9', x + 179, G - 27, 12, 8); R(c, '#e3c46a', x + 189, G - 16, 2, 2); R(c, '#d9d2c2', x + 174, G - 33, 22, 2);   // front door
  // drainpipe and a couple of tie-plates on the wall
  R(c, OUT, x + 162, WT + 2, 3, 148); R(c, '#3c3e44', x + 163, WT + 2, 1, 148); for (const [ax, ay] of [[30, 30], [146, 30]]) { CIRC(c, OUT, x + ax, G - ay, 3); CIRC(c, '#3c3e44', x + ax, G - ay, 2); }
  // billboard: steel frame bolted to the wall, three lamp arms over the top
  const b = L.smr.board; R(c, '#2a2c33', x + b.x - 4, G - b.y - 4, b.w + 8, b.h + 8); R(c, OUT, x + b.x - 5, G - b.y - 5, b.w + 10, 1); R(c, OUT, x + b.x - 5, G - b.y + b.h + 4, b.w + 10, 1);
  R(c, '#9aa0aa', x + b.x - 3, G - b.y - 3, b.w + 6, 1); R(c, '#0e0e1a', x + b.x, G - b.y, b.w, b.h);
  R(c, '#2a2c33', x + b.x + 10, G - b.y + b.h + 4, b.w - 20, 2);   // walkway under it
  for (let i = 0; i < 3; i++) { const lx = x + b.x + 24 + i * (b.w - 48) / 2; R(c, OUT, lx, G - b.y - 14, 2, 10); R(c, OUT, lx, G - b.y - 14, 8, 2); BOX(c, '#c9ccd2', lx + 6, G - b.y - 13, 6, 3); }
  // low-res stand-in for the artwork (the sharp copy is drawn over it in the game)
  T(c, 'SMR', x + b.x + b.w / 2, G - b.y + 8, 16, '#ffffff', 'center', true);
  // shop sign-ish name plate at the bottom of the wall
  BOX(c, '#1b1d24', x + 40, G - 30, 96, 10); T(c, 'SMR STUDIO', x + 88, G - 29, 8, '#e9e4d6', 'center', false); BOX(c, '#3a3d44', x + 70, G - 18, 36, 18); R(c, '#9fb7c9', x + 72, G - 16, 15, 16); R(c, '#9fb7c9', x + 89, G - 16, 15, 16);
}, board: { x: 14, y: 140, w: 148, h: 82 } };
L.marshfarm = { n: 'Marsh Farm Estate', w: 378, d(c, x, G) {
  // Lea Bank, Five Springs and Penhill: three 15-storey blocks in blue patchwork cladding, the far ones smaller
  const PAL = ['#4b88c8', '#3a76bf', '#2c66b4', '#22529e', '#1b4288', '#163672'];   // lightest panels kept darker than the sky
  const hash = (a, b, cc) => { const v = Math.sin(a * 91.7 + b * 47.3 + cc * 13.1) * 43758.5; return v - Math.floor(v); };
  const tower = (tx, w, h, sd, bal, strip) => { const top = G - h, FL = Math.floor(h / 15);
    BOX(c, PAL[2], tx, top, w, h);
    const cw = 6, cols = Math.ceil(w / cw); const base = []; for (let i = 0; i < cols; i++) base.push(Math.floor(hash(sd, i, 0) * 4));
    for (let f = 0; f < 15; f++) for (let i = 0; i < cols; i++) { const n = hash(sd, i, f + 1), k = Math.max(0, Math.min(5, base[i] + (n < .25 ? -1 : n > .8 ? 2 : n > .6 ? 1 : 0)));
      R(c, PAL[k], tx + i * cw, top + f * FL, Math.min(cw, w - i * cw), FL); }
    // balconies: a recessed dark column with white rails on every floor
    if (bal) { const [bx, bw] = bal; R(c, '#132548', tx + bx, top + 2, bw, h - 2); for (let f = 0; f < 15; f++) { R(c, '#eef2f6', tx + bx, top + f * FL + FL - 3, bw, 1); R(c, '#2a4f86', tx + bx, top + f * FL + FL - 2, bw, 2); } }
    // windows: white frames, grey-blue glass
    for (let f = 0; f < 15; f++) for (let i = 0; i < cols; i++) { if (bal && i * cw >= bal[0] - 4 && i * cw < bal[0] + bal[1]) continue; if (strip && i * cw >= strip[0] - 3 && i * cw < strip[0] + strip[1]) continue; if (i % 2) continue;   // a regular grid of windows, every floor
      const wx = tx + i * cw, wy = top + f * FL + 2; R(c, '#f2f4f6', wx, wy, 5, FL - 4); R(c, '#6f8fa8', wx + 1, wy + 1, 3, FL - 6 > 0 ? FL - 6 : 1); }
    // stairwell: a column of tall windows all the way up
    if (strip) { const [sx, sw] = strip; R(c, '#e9edf2', tx + sx, top + 3, sw, h - 3); for (let f = 0; f < 15; f++) { R(c, '#7d97ad', tx + sx + 1, top + f * FL + 2, sw - 2, FL - 3); R(c, '#e9edf2', tx + sx + (sw >> 1), top + f * FL + 2, 1, FL - 3); } }
    R(c, '#a9c3dc', tx, top, w, 2); R(c, OUT, tx - 1, top - 1, w + 2, 1); R(c, 'rgba(10,20,50,.14)', tx + w - 4, top, 4, h); };
  // three tall blocks of about the same size side by side: the middle one a little shorter, the right one a little thinner
  tower(x + 4, 104, 300, 1, [8, 16], [58, 12]);
  tower(x + 140, 104, 282, 2, [8, 16], [58, 12]);
  tower(x + 276, 88, 300, 3, [6, 14], [50, 11]);
  for (const [ax, top] of [[x + 26, 300], [x + 76, 300], [x + 162, 282], [x + 212, 282], [x + 296, 300], [x + 342, 300]]) { R(c, '#7a8088', ax, G - top - 9, 1, 9); R(c, '#9aa0a8', ax - 2, G - top - 6, 5, 1); }   // aerials
  // trees along the front
  TREE(c, x + 18, G, 1.5); TREE(c, x + 124, G, 1.7); TREE(c, x + 262, G, 1.6); TREE(c, x + 350, G, 1.8);
} };

L.orbital = { n: 'Orbital Trampoline Park', w: 620, d(c, x, G) {
  // long grey shed: a ribbon of windows under the roof, ORBITAL / TRAMPOLINE PARK boards, lime-green ground floor; deep dark canopy over the entrance on the right
  const CL = '#8c949e', RB = '#7b838d', LM = '#a9c935', LMD = '#93b12a', DK = '#3b4048', GN = '#8cc63f', GL = '#6f8fa8', MW = 450, E = x + MW;
  P(c, '#9aa2ac', [[x - 2, G - 150], [x + 622, G - 150], [x + 616, G - 156], [x + 4, G - 156]], true);
  BOX(c, CL, x, G - 150, MW, 150); for (let i = 2; i < MW; i += 3) R(c, RB, x + i, G - 150, 1, 106);   // the grey cladding makes up most of the height
  R(c, '#a4abb4', x, G - 150, MW, 2); R(c, '#6c737c', x, G - 122, MW, 1); R(c, '#6c737c', x, G - 76, MW, 1); R(c, '#6c737c', x, G - 46, MW, 2);
  // ribbon of windows under the roof
  BOX(c, '#c9ced4', x + 6, G - 142, MW - 12, 16); for (let i = 0; i < 28; i++) { R(c, GL, x + 8 + i * 15.6, G - 140, 13, 12); R(c, 'rgba(255,255,255,.22)', x + 9 + i * 15.6, G - 139, 3, 10); }
  // the boards: ORBITAL in green slanted letters, TRAMPOLINE PARK in white
  BOX(c, DK, x + 10, G - 112, 190, 32); BOX(c, DK, x + 212, G - 108, 228, 24);
  c.save(); c.translate(x + 108, G - 110); c.transform(1, 0, -.28, 1, 0, 0); c.font = '700 24px Silk'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#4f7a1c'; c.fillText('ORBITAL', 1, 4); c.fillStyle = GN; c.fillText('ORBITAL', 0, 2); c.beginPath(); c.rect(-140, 2, 280, 10); c.clip(); c.fillStyle = '#b8e05c'; c.fillText('ORBITAL', 0, 2); c.restore();   // two-tone lime like the real sign
  { c.font = '700 16px Silk'; let fz = 16; if (c.measureText('TRAMPOLINE PARK').width > 220) fz = 8; T(c, 'TRAMPOLINE PARK', x + 326, G - 104 + (16 - fz) / 2, fz, '#f2f4f6', 'center', true); }
  // lime ground floor with windows (blinds) and a side door
  BOX(c, LM, x, G - 44, MW, 44); for (let i = 0; i < MW; i += 30) R(c, LMD, x + i, G - 44, 1, 44);   // the lime band is low, just the ground floor
  for (let k = 0; k < 7; k++) { const wx = x + 14 + k * 56; BOX(c, '#2a2d34', wx, G - 36, 34, 18); for (let n = 0; n < 4; n++) R(c, '#e9ecef', wx + 2, G - 34 + n * 4, 30, 2); R(c, '#9aa3ad', wx + 16, G - 36, 1, 18); }
  // Costa corner: red board over the door
  BOX(c, '#b0182a', E - 46, G - 62, 40, 14); T(c, 'COSTA', E - 26, G - 59, 8, '#f6efe4', 'center', false);
  BOX(c, '#1f2228', E - 38, G - 40, 22, 40); R(c, '#9aa3ad', E - 20, G - 24, 1, 6); R(c, '#2a6fd8', E - 34, G - 40, 6, 4);
  // entrance block: deep dark canopy, glass front, BOUNCE THIS WAY panel, brick pillar
  BOX(c, '#4a5058', E, G - 150, 170, 20); R(c, '#5d646d', E, G - 150, 170, 2); R(c, '#2b2f36', E, G - 132, 170, 2);
  R(c, '#24272d', E + 1, G - 130, 168, 130); for (let i = 0; i < 168; i += 3) R(c, '#2b2f36', E + 1 + i, G - 130, 1, 70);
  for (const lx of [E + 44, E + 104]) { R(c, '#55595f', lx, G - 128, 1, 10); BOX(c, '#6d737b', lx - 3, G - 119, 7, 3); }
  BOX(c, DK, E + 4, G - 62, 12, 62); for (let k = 0; k < 6; k++) R(c, '#c9ced4', E + 9, G - 58 + k * 9, 2, 6);   // tall TRAMPOLINE PARK fin
  BOX(c, '#2c3138', E + 18, G - 62, 104, 62);
  for (let i = 0; i < 4; i++) { R(c, '#7f99ad', E + 20 + i * 15, G - 60, 13, 60); R(c, 'rgba(255,255,255,.2)', E + 21 + i * 15, G - 58, 2, 40); }
  BOX(c, GN, E + 82, G - 60, 38, 60); T(c, 'BOUNCE', E + 101, G - 56, 8, '#ffffff', 'center', false); T(c, 'THIS', E + 101, G - 47, 8, '#ffffff', 'center', false); T(c, 'WAY', E + 101, G - 38, 8, '#ffffff', 'center', false);
  for (let k = 0; k < 2; k++) P(c, '#d8f08a', [[E + 87 + k * 12, G - 22], [E + 93 + k * 12, G - 16], [E + 87 + k * 12, G - 10], [E + 91 + k * 12, G - 10], [E + 97 + k * 12, G - 16], [E + 91 + k * 12, G - 22]]);
  BRICK(c, E + 136, G - 130, 22, 130, '#8a6a52', '#755842'); R(c, OUT, E + 135, G - 130, 1, 130); R(c, OUT, E + 158, G - 130, 1, 130);
  BOX(c, '#f2f4f6', E + 126, G - 50, 8, 8); R(c, '#1f5fb0', E + 128, G - 48, 4, 4);   // little blue sign
} };

L.barak = { n: 'The Barak Steakhouse', w: 220, d(c, x, G) {
  // single-storey brick restaurant up on a raised brick platform, with a ramp (white handrail) and steps up to the door
  const PL = G - 18, GD = '#d9a35e', NV = '#1f252d', BR = '#8f4a36', BL = '#7a3e2e';
  BRICK(c, x + 10, PL, 202, 18, BR, BL); R(c, OUT, x + 9, PL - 1, 204, 1); R(c, '#9a5a44', x + 10, PL, 202, 2);
  // building
  BRICK(c, x + 18, PL - 36, 186, 36, '#9a4e38', '#84402e'); R(c, OUT, x + 17, PL - 36, 1, 36); R(c, OUT, x + 204, PL - 36, 1, 36);
  for (const px of [x + 22, x + 50, x + 78]) { BOX(c, NV, px, PL - 34, 24, 33); R(c, GD, px + 2, PL - 32, 20, 1); R(c, GD, px + 2, PL - 4, 20, 1); }
  // panel 1: the B with a fork through it
  T(c, 'B', x + 34, PL - 27, 16, GD, 'center', false); R(c, GD, x + 27, PL - 30, 1, 10); for (const k of [25, 27, 29]) R(c, GD, x + k, PL - 31, 1, 3);
  // panel 2: bull's head
  { const bx = x + 62, by = PL - 18; R(c, GD, bx - 4, by - 6, 9, 7); R(c, GD, bx - 3, by + 1, 7, 3); R(c, '#e8dccb', bx - 2, by + 2, 5, 1); P2(c, bx - 4, by - 6, -1); P2(c, bx + 4, by - 6, 1); R(c, NV, bx - 2, by - 4, 1, 1); R(c, NV, bx + 2, by - 4, 1, 1); }
  // panel 3: the logo and STEAK HOUSE
  { const cx = x + 90, cy = PL - 18;   // crossed fork and knife in a gold ring
    CIRC(c, GD, cx, cy, 8); CIRC(c, NV, cx, cy, 7); for (let i = -5; i <= 5; i++) { R(c, GD, cx + i, cy + i, 1, 1); R(c, '#e8dccb', cx - i, cy + i, 1, 1); } R(c, GD, cx - 6, cy - 6, 1, 2); R(c, GD, cx - 4, cy - 6, 1, 2); R(c, '#e8dccb', cx + 4, cy - 6, 2, 3); }
  // main sign over the door: black board, gold frame, THE BARAK
  BOX(c, '#121418', x + 104, PL - 35, 74, 14); R(c, GD, x + 105, PL - 34, 72, 1); R(c, GD, x + 105, PL - 23, 72, 1); R(c, GD, x + 105, PL - 34, 1, 12); R(c, GD, x + 176, PL - 34, 1, 12);   // taller board
  T(c, 'THE BARAK', x + 141, PL - 32, 8, GD, 'center', false); R(c, GD, x + 108, PL - 29, 2, 2); R(c, GD, x + 172, PL - 29, 2, 2);   // clean letters, centred both ways
  // glass double door, small window, notice board
  BOX(c, '#3a3d44', x + 124, PL - 20, 26, 20); R(c, '#9fb7c9', x + 126, PL - 18, 10, 18); R(c, '#9fb7c9', x + 138, PL - 18, 10, 18); R(c, '#c9ced4', x + 134, PL - 12, 1, 4); R(c, '#c9ced4', x + 139, PL - 12, 1, 4);
  BOX(c, '#3a3d44', x + 182, PL - 26, 10, 12); R(c, '#f4f2ec', x + 183, PL - 25, 8, 10); R(c, '#c9ced4', x + 184, PL - 23, 6, 1); R(c, '#c9ced4', x + 184, PL - 20, 5, 1);
  // big hipped tiled roof with a white fascia
  P(c, '#4a4b52', [[x + 6, PL - 37], [x + 216, PL - 37], [x + 190, PL - 68], [x + 32, PL - 68]], true);
  for (let i = 1; i < 8; i++) { const y = PL - 37 - i * 4, k = i / 8; R(c, '#3e3f45', x + 6 + 26 * k, y, 210 - 52 * k, 1); }
  BOX(c, '#f4f2ec', x + 6, PL - 39, 210, 3);
  // hanging baskets under the eaves
  for (const hx of [x + 48, x + 104, x + 178, x + 200]) { R(c, '#2a2a2e', hx, PL - 36, 1, 3); CIRC(c, OUT, hx, PL - 30, 4); CIRC(c, '#4f8a3c', hx, PL - 30, 3); R(c, '#6faa4e', hx - 1, PL - 32, 2, 2); }
  // ramp up from the left: sloped brick wall with a white handrail, then steps up on the right
  P(c, BR, [[x - 4, G], [x + 120, G], [x + 120, PL - 2], [x - 4, G - 3]], true); for (let i = 0; i < 6; i++) R(c, BL, x + i * 20, G - 4 - i * 2.2, 18, 1);
  for (let i = 0; i < 2; i++) { c.strokeStyle = i ? '#f4f4f2' : OUT; c.lineWidth = i ? 1.4 : 2.6; c.beginPath(); c.moveTo(x - 2, G - 10); c.lineTo(x + 122, PL - 9); c.stroke(); }
  for (const px of [x + 12, x + 52, x + 92]) { const py = G - 10 - (px - x + 2) / 124 * (G - 10 - (PL - 9)); R(c, '#f4f4f2', px, py, 1.4, (G - 3 - (px - x + 4) / 124 * 15) - py); }
  for (let i = 0; i < 5; i++) { R(c, OUT, x + 150 + i * 6, G - 3.6 * (i + 1), 44 - i * 6, 3.6); R(c, i % 2 ? '#b9bcc0' : '#c9ccd0', x + 151 + i * 6, G - 3.6 * (i + 1) + 1, 42 - i * 6, 2.6); }
} };
const P2 = (c, x, y, d) => { R(c, '#e8dccb', x + (d > 0 ? 1 : -2), y - 2, 2, 2); R(c, '#e8dccb', x + (d > 0 ? 3 : -4), y - 4, 2, 2); };   // bull's horns

L.miamicrispy = { n: 'Miami Crispy', w: 150, d(c, x, G) {
  // set-back dark brick first floor with small white windows
  BRICK(c, x + 8, G - 116, 134, 50, '#3e302b', '#332824'); R(c, OUT, x + 7, G - 117, 136, 1); BOX(c, '#d8d4cc', x + 6, G - 120, 138, 4);
  for (let i = 0; i < 5; i++) { BOX(c, '#f4f2ec', x + 16 + i * 18, G - 108, 12, 12); R(c, '#b9c9d6', x + 18 + i * 18, G - 106, 8, 8); R(c, '#f4f2ec', x + 21 + i * 18, G - 106, 1, 8); }
  BOX(c, '#f4f2ec', x + 108, G - 110, 28, 16); R(c, '#b9c9d6', x + 110, G - 108, 11, 12); R(c, '#b9c9d6', x + 123, G - 108, 11, 12);
  CHIM(c, x + 12, G - 136); R(c, '#3a3d44', x + 20, G - 152, 1, 18); R(c, '#3a3d44', x + 14, G - 150, 13, 1); R(c, '#3a3d44', x + 16, G - 146, 9, 1);
  // mossy tiled roof over the shop
  P(c, '#4d5a3a', [[x - 3, G - 62], [x + 153, G - 62], [x + 142, G - 80], [x + 8, G - 80]], true); for (let i = 1; i < 5; i++) R(c, '#3f4a30', x + 2 + i * 2, G - 62 - i * 4, 146 - i * 4, 1); for (let i = 0; i < 30; i++) R(c, '#6f8a46', x + 8 + (i * 29) % 136, G - 78 + (i * 7) % 15, 2, 1);
  // orange cladding fascia + big white letters
  BOX(c, '#e8501e', x - 2, G - 62, 154, 22); for (let i = 0; i < 5; i++) R(c, '#c8401a', x, G - 58 + i * 4, 150, 1); R(c, '#ff7a3a', x - 1, G - 61, 152, 1);
  TS(c, 'MIAMI CRISPY', x + 75, G - 58, 14, '#ffffff', '#9a2a10');
  // orange framed glass shopfront
  BOX(c, '#e8641c', x, G - 40, 150, 36); for (const [gx, gw] of [[x + 4, 44], [x + 70, 76]]) { R(c, '#dfe6ea', gx, G - 37, gw, 31); R(c, '#f2f4f5', gx, G - 37, gw, 8);
    for (let k = 0; k * 14 < gw - 12; k++) { R(c, '#1f2228', gx + 3 + k * 14, G - 36, 12, 6); R(c, '#e8641c', gx + 4 + k * 14, G - 35, 10, 1); R(c, '#ffffff', gx + 4 + k * 14, G - 33, 7, 1); }
    R(c, '#c9ced4', gx, G - 20, gw, 2); R(c, '#3a3d44', gx, G - 18, gw, 12); for (let k = 0; k * 10 < gw - 6; k++) { R(c, '#e8641c', gx + 3 + k * 10, G - 24, 6, 2); R(c, '#2a2a2e', gx + 5 + k * 10, G - 22, 1, 4); }
    R(c, 'rgba(160,200,215,.35)', gx, G - 37, gw, 31); R(c, '#ffffff', gx + 2, G - 35, 2, 27); }
  R(c, '#8a6a4a', x + 52, G - 37, 15, 33); R(c, '#e8641c', x + 58, G - 37, 1, 33); R(c, '#d0703a', x + 54, G - 20, 4, 2); R(c, '#d0703a', x + 61, G - 20, 4, 2);
  T(c, 'Luton', x + 120, G - 26, 8, '#e8641c', 'center'); P(c, '#e8641c', [[x + 84, G - 30], [x + 90, G - 24], [x + 96, G - 30], [x + 93, G - 33], [x + 90, G - 31], [x + 87, G - 33]]);
  BOX(c, '#4a4e56', x, G - 4, 150, 4);
} };

L.foodbank = { n: 'Luton Foodbank', w: 300, d(c, x, G) {
  // green corrugated warehouse
  BOX(c, '#2f7a5a', x, G - 112, 300, 64); for (let i = 3; i < 300; i += 4) R(c, '#26674b', x + i, G - 110, 1, 62); BOX(c, '#1f5a40', x - 3, G - 118, 306, 7); R(c, '#3f9a72', x - 2, G - 117, 304, 1);
  // yellow brick base
  BRICK(c, x, G - 48, 156, 48, '#d9b46a', '#c69f56'); BRICK(c, x + 252, G - 48, 48, 48, '#d9b46a', '#c69f56'); R(c, OUT, x - 1, G - 49, 302, 1);
  // window with bars + grey door
  BOX(c, '#f4f2ec', x + 10, G - 42, 28, 26); R(c, '#3a3d44', x + 12, G - 40, 24, 22); for (let i = 0; i < 6; i++) R(c, '#9aa3ad', x + 13 + i * 4, G - 40, 1, 22);
  BOX(c, '#7f8e98', x + 70, G - 42, 20, 42); R(c, '#b9c9d6', x + 74, G - 38, 12, 12); R(c, '#3a3d44', x + 86, G - 22, 2, 2); BOX(c, '#4a4e56', x + 96, G - 36, 10, 8);
  // big open loading bay with shelves and crates
  BOX(c, '#1f5a40', x + 156, G - 98, 96, 98); R(c, '#17171b', x + 160, G - 92, 88, 92); BOX(c, '#3f8a68', x + 158, G - 98, 92, 6);
  for (const sy of [G - 70, G - 46]) R(c, '#9aa3ad', x + 164, sy, 80, 2); R(c, '#2a6fd8', x + 166, G - 78, 10, 8); R(c, '#e8a33c', x + 180, G - 80, 12, 10); R(c, '#3fae5a', x + 200, G - 78, 10, 8); R(c, '#d8d0b8', x + 222, G - 80, 14, 10);
  R(c, '#2a6fd8', x + 168, G - 54, 12, 8); R(c, '#2a6fd8', x + 182, G - 54, 12, 8); R(c, '#c8892a', x + 210, G - 56, 16, 10);
  for (let k = 0; k < 3; k++) BOX(c, k % 2 ? '#3fae5a' : '#2a6fd8', x + 222, G - 10 - k * 8, 16, 8); PERSON(c, x + 200, G, '#6a3fb0', '#2a2a33', '#7a4a2a', '#1a1a1e');
  // Luton Foodbank sign on the cladding
  BOX(c, '#ffffff', x + 14, G - 106, 132, 34);
  T(c, 'luton', x + 30, G - 102, 8, '#d32f2f', 'left'); T(c, 'food', x + 20, G - 91, 13, '#5a5a5e', 'left', true); c.font = '700 13px Silk'; const fw = c.measureText('food').width; T(c, 'bank', x + 20 + fw, G - 91, 13, '#d32f2f', 'left', true);
  { const hx = x + 131, hy = G - 90; CIRC(c, OUT, hx - 5, hy - 4, 7); CIRC(c, OUT, hx + 5, hy - 4, 7); P(c, OUT, [[hx - 12, hy - 2], [hx + 12, hy - 2], [hx, hy + 12]]);
    CIRC(c, '#ffffff', hx - 5, hy - 4, 6); CIRC(c, '#ffffff', hx + 5, hy - 4, 6); P(c, '#ffffff', [[hx - 11, hy - 2], [hx + 11, hy - 2], [hx, hy + 10]]); CIRC(c, '#f2a71e', hx, hy - 1, 4); CIRC(c, '#f7c64a', hx - 1, hy - 2, 2); R(c, '#ffffff', hx - 2, hy - 3, 1, 1); }
  // two kids carrying a crate
  PERSON(c, x + 108, G, '#ffffff', '#1a1a1e', '#c58c5c', '#3a2a1e'); PERSON(c, x + 134, G, '#ffffff', '#1a1a1e', '#e2b38a', '#5a3a1e');
} };

// ---- Wardown Park chain: field + play area | lake | bridge over the stream | funfair ----
L.wardownfield = { n: 'Wardown Park', w: 200, d(c, x, G) {
  CROWN(c, x + 30, G - 52, 26, '#356b40', '#3d7848', 1, false); CROWN(c, x + 168, G - 58, 30, '#2f5f3a', '#356b40', 2, false); TREE(c, x + 100, G - 4, 1.5, '#5f9a3e', '#4a7f30');
  BOX(c, '#5fae4a', x - 2, G - 16, 204, 16); for (let i = 0; i < 90; i++) R(c, i % 2 ? '#4f9a3c' : '#78c25a', x + (i * 37) % 200, G - 15 + (i * 7) % 14, 2, 2);
  BOX(c, '#2f6a3a', x + 6, G - 36, 44, 18); T(c, 'WARDOWN', x + 28, G - 34, 8, '#ffffff', 'center', false); T(c, 'PARK', x + 28, G - 26, 8, '#f2c43a'); R(c, '#4a3326', x + 12, G - 18, 3, 10); R(c, '#4a3326', x + 42, G - 18, 3, 10);
  // play area: soft surface, swings, slide, climbing frame
  BOX(c, '#c8503a', x + 58, G - 8, 130, 6);
  P(c, '#d32f2f', [[x + 62, G - 8], [x + 70, G - 48], [x + 72, G - 48], [x + 66, G - 8]]); P(c, '#d32f2f', [[x + 106, G - 8], [x + 100, G - 48], [x + 102, G - 48], [x + 110, G - 8]]); BOX(c, '#d32f2f', x + 68, G - 50, 36, 3);
  for (const sx of [x + 78, x + 94]) { R(c, '#9aa3ad', sx, G - 47, 1, 26); R(c, '#9aa3ad', sx + 5, G - 47, 1, 26); BOX(c, '#1a1a1e', sx - 1, G - 22, 8, 2); }
  PERSON(c, x + 79, G - 20, '#2a6fd8', '#2a2a33');
  BOX(c, '#2a6fd8', x + 124, G - 40, 22, 32); R(c, '#f2c43a', x + 124, G - 44, 22, 4); for (let i = 0; i < 4; i++) R(c, '#f4f2ec', x + 117, G - 38 + i * 8, 7, 1); R(c, '#9aa3ad', x + 116, G - 40, 1, 32); R(c, '#9aa3ad', x + 123, G - 40, 1, 32);
  P(c, '#f2c43a', [[x + 146, G - 38], [x + 150, G - 38], [x + 182, G - 8], [x + 176, G - 8]], true); PERSON(c, x + 160, G - 18, '#e0558c', '#2a2a33');
  PERSON(c, x + 50, G - 8, '#5a6e8a'); PERSON(c, x + 190, G - 8, '#3a8a5a', '#2a2a33', '#7a4a2a');
} };
L.wardownbridge = { n: 'Wardown Park Bridge', w: 170, d(c, x, G) {
  CROWN(c, x + 150, G - 56, 30, '#2f5f3a', '#356b40', 0, false); CROWN(c, x + 14, G - 50, 26, '#356b40', '#3d7848', 3, false);
  R(c, '#5a3d2a', x + 74, G - 64, 6, 48); CIRC(c, OUT, x + 77, G - 78, 37); CIRC(c, '#7da443', x + 77, G - 78, 36); CIRC(c, '#94bb52', x + 68, G - 88, 20);
  for (let i = 0; i < 16; i++) R(c, i % 2 ? '#6e9638' : '#86b049', x + 44 + i * 4.3, G - 70, 3, 20 + (i % 3) * 9);
} };
L.funfair = { n: 'Wardown Funfair', w: 400, d(c, x, G) {
  BOX(c, '#5fae4a', x - 2, G - 16, 404, 16); for (let i = 0; i < 140; i++) R(c, i % 2 ? '#4f9a3c' : '#78c25a', x + (i * 41) % 400, G - 15 + (i * 7) % 14, 2, 2);
  // big wheel A-frame legs (wheel itself turns in the animation)
  for (const s of [-1, 1]) { P(c, '#c8d0d8', [[x + 72, G - 92], [x + 72 + s * 30, G - 6], [x + 72 + s * 26, G - 6], [x + 72 - s * 2, G - 92]], true); }
  BOX(c, '#d32f2f', x + 46, G - 14, 52, 8); T(c, 'BIG WHEEL', x + 72, G - 14, 8, '#ffffff', 'center', false);
  // pendulum ride tower
  for (const s of [-1, 1]) P(c, '#f2c43a', [[x + 196, G - 150], [x + 196 + s * 34, G - 6], [x + 196 + s * 28, G - 6], [x + 196 - s * 2, G - 150]], true);
  BOX(c, '#e8641c', x + 160, G - 14, 72, 8); for (let i = 0; i < 8; i++) R(c, i % 2 ? '#f2c43a' : '#d32f2f', x + 162 + i * 9, G - 12, 5, 4);
  // carousel: striped tent
  const STRIPE = (cx, top, w, h, a = '#d32f2f', b = '#f2c43a') => { P(c, OUT, [[cx - w / 2 - 1, top + h + 1], [cx, top - 1], [cx + w / 2 + 1, top + h + 1]]); for (let i = 0; i < 8; i++) P(c, i % 2 ? a : b, [[cx, top], [cx - w / 2 + i * w / 8, top + h], [cx - w / 2 + (i + 1) * w / 8, top + h]]); for (let i = 0; i < 8; i++) { R(c, i % 2 ? a : b, cx - w / 2 + i * w / 8, top + h, w / 8, 3); CIRC(c, i % 2 ? a : b, cx - w / 2 + i * w / 8 + w / 16, top + h + 3, w / 16); } R(c, '#f2c43a', cx - 1, top - 6, 2, 6); };
  STRIPE(x + 280, G - 66, 76, 22); BOX(c, '#f4e2b0', x + 246, G - 40, 68, 32); for (let i = 0; i < 6; i++) { R(c, '#d9b44a', x + 252 + i * 11, G - 40, 1, 26); BOX(c, ['#f4f2ec', '#e0558c', '#2a6fd8'][i % 3], x + 248 + i * 11, G - 26 + (i % 2) * 4, 9, 6); } BOX(c, '#c8892a', x + 244, G - 10, 72, 4);
  // stalls with striped canopies
  for (const [sx, a, b, label] of [[x + 112, '#2a6fd8', '#f4f2ec', 'DUCKS'], [x + 330, '#d32f2f', '#f4f2ec', 'CANDY'], [x + 362, '#3fae5a', '#f2c43a', 'DONUT']]) {
    BOX(c, '#f4e2b0', sx, G - 30, 32, 22); for (let i = 0; i < 4; i++) R(c, i % 2 ? a : b, sx - 2 + i * 9, G - 40, 9, 8); R(c, OUT, sx - 2, G - 41, 36, 1); R(c, '#3a3d44', sx + 2, G - 22, 28, 2); T(c, label.split(' ')[0], sx + 16, G - 20, 8, a === '#f4f2ec' ? '#d32f2f' : a, 'center', false); }
  // bunting
  for (let i = 0; i < 24; i++) { const bx = x + 100 + i * 12; P(c, ['#d32f2f', '#f2c43a', '#2a6fd8', '#3fae5a'][i % 4], [[bx, G - 48 + Math.abs(i % 6 - 3)], [bx + 8, G - 48 + Math.abs(i % 6 - 3)], [bx + 4, G - 42 + Math.abs(i % 6 - 3)]]); }
  for (const [px, col] of [[x + 104, '#2a6fd8'], [x + 150, '#e0558c'], [x + 236, '#3a8a5a'], [x + 322, '#e8641c'], [x + 352, '#5a6e8a']]) PERSON(c, px, G - 2, col);
} };
window.LM_ANIM.wardownbridge = (c, x, G, t) => {
  WATER(c, x, G, 170, t);
  // the bridge crosses the lake: left end lands on the far bank (set back, higher), right end on the near, roadside bank
  R(c, '#5f9e44', x, G - 19, 48, 3);   // far bank
  c.save(); const KS = 13 / 162; c.transform(1, KS, 0, 1, 0, -KS * (x + 166));
  // white suspension footbridge: stone piers, twin-post towers, sagging cables, lattice railings
  const WH = '#f4f4f0', SD = '#c9c9c2', ST = '#d8cfbe', L0 = x + 4, L1 = x + 166, TA = x + 16, TB = x + 152, TY = G - 64, DY = G - 26;
  for (const tx of [TA, TB]) { BOX(c, '#8a6a5a', tx - 6, G - 18, 20, 18); R(c, '#76584a', tx - 6, G - 10, 20, 1); BOX(c, ST, tx - 3, TY, 5, DY - TY + 8); BOX(c, ST, tx + 5, TY, 5, DY - TY + 8); BOX(c, ST, tx - 4, TY - 4, 15, 6); R(c, '#e8e0d0', tx - 3, TY - 3, 13, 1); }
  // cables (left and right spans dip toward the middle)
  c.strokeStyle = WH; c.lineWidth = 1.5; const cab = (x0, x1, y0, sag) => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, DY - 10 + sag, x1, y0); c.stroke(); };
  const cy = xx => { const u = (xx - (TA + 3)) / (TB - TA); return (1 - u) * (1 - u) * (TY + 2) + 2 * u * (1 - u) * (DY - 16) + u * u * (TY + 2); };
  cab(TA + 3, TB + 3, TY + 2, -6); c.beginPath(); c.moveTo(L0, DY - 6); c.lineTo(TA - 2, TY + 2); c.stroke(); c.beginPath(); c.moveTo(L1, DY - 6); c.lineTo(TB + 8, TY + 2); c.stroke();
  for (let hx = TA + 12; hx < TB - 6; hx += 8) R(c, SD, hx, Math.round(cy(hx)), 1, Math.max(0, DY - 10 - Math.round(cy(hx))));
  // deck + lattice railing
  BOX(c, WH, L0, DY, L1 - L0, 4); R(c, SD, L0, DY + 3, L1 - L0, 1); R(c, WH, L0, DY - 11, L1 - L0, 2);
  c.save(); c.beginPath(); c.rect(L0, DY - 9, L1 - L0, 9); c.clip(); c.strokeStyle = WH; c.lineWidth = 1; for (let i = L0 - 10; i < L1 + 10; i += 6) { c.beginPath(); c.moveTo(i, DY - 9); c.lineTo(i + 9, DY); c.moveTo(i + 9, DY - 9); c.lineTo(i, DY); c.stroke(); } c.restore();
  for (let i = L0; i <= L1; i += 18) R(c, WH, i, DY - 12, 2, 12);
  PERSON(c, x + 62, DY, '#d84b6a', '#2a2a33'); PERSON(c, x + 72, DY, '#2a2a33', '#7f9ab8', '#7a4a2a');
  c.restore();
  WATER(c, x, G, 60, t);   // the lake runs in front of the far (left) leg; only the near, roadside leg stands in front of it
};
window.LM_ANIM.funfair = (c, x, G, t) => {
  // big wheel turning
  const cx = x + 72, cy = G - 92, r = 56, a0 = t * .35, cols = ['#d32f2f', '#f2c43a', '#2a6fd8', '#3fae5a', '#e0558c', '#e8641c'];
  c.strokeStyle = OUT; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.strokeStyle = '#e8eef4'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, r - 8, 0, 7); c.stroke();
  for (let i = 0; i < 12; i++) { const a = a0 + i * Math.PI / 6; c.strokeStyle = '#c8d0d8'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.stroke();
    const gx = Math.round(cx + Math.cos(a) * r), gy = Math.round(cy + Math.sin(a) * r); R(c, '#3a3d44', gx, gy, 1, 4); BOX(c, cols[i % 6], gx - 4, gy + 3, 9, 7); R(c, '#f4f2ec', gx - 2, gy + 5, 5, 2); }
  CIRC(c, OUT, cx, cy, 5); CIRC(c, '#f2c43a', cx, cy, 4); for (let i = 0; i < 12; i++) { const a = -a0 + i * .52; if (((t * 4 + i) | 0) % 2) R(c, '#fff6b0', Math.round(cx + Math.cos(a) * (r - 4)), Math.round(cy + Math.sin(a) * (r - 4)), 1, 1); }
  // pendulum ride swinging
  const px = x + 196, py = G - 148, sw = Math.sin(t * 1.1) * 1.15, L2 = 112, ex = px + Math.sin(sw) * L2, ey = py + Math.cos(sw) * L2;
  c.save(); c.translate(px, py); c.rotate(-sw); R(c, OUT, -4, 0, 8, L2); R(c, '#e8641c', -3, 0, 6, L2); for (let i = 8; i < L2; i += 12) R(c, '#f2c43a', -3, i, 6, 4); c.restore();
  c.save(); c.translate(ex, ey); c.rotate(-sw + Math.sin(t * 2.6) * .25); BOX(c, '#2a6fd8', -16, -5, 32, 10); for (let i = 0; i < 6; i++) { CIRC(c, '#e2b38a', -13 + i * 5, -7, 2); R(c, '#f2c43a', -14 + i * 5, -2, 3, 1); } c.restore();
  CIRC(c, OUT, px, py, 5); CIRC(c, '#9aa3ad', px, py, 4); BOX(c, '#d32f2f', px - 4, py - 10, 8, 6);
};

window.LM_ORDER = ['galaxy', 'townhall', 'stmarys', 'letters', 'frasers', 'station', 'smr', 'hatfactory', 'chaiiwala', 'chaiikhana', 'spudkingz', 'miamicrispy', 'barak', 'masjid', 'masjidali', 'suffa', 'gurdwara', 'ldh', 'lutonhoo', 'foodbank', 'inspire', 'nadeem', 'oak', 'periperi', 'toros', 'cycleking', 'gna', 'kahwa', 'leagrave', 'topspizza', 'alquds', 'kaya', 'karwan', 'krispy', 'tesco', 'currys', 'bandq', 'matalan', 'lidl', 'jdgyms', 'bigyellow', 'orbital', 'grandbazar', 'lewsey', 'marshfarm', 'venue', 'chiltern', 'uob', 'sixthform', 'wardownfield', 'wardown', 'wardownbridge', 'funfair', 'stockwood', 'welcome', 'vauxhall', 'airport'];
Object.keys(SCALE).forEach(k => { const f = SCALE[k], d0 = L[k].d, w0 = L[k].w, M = 80, H = 320; L[k].w = Math.round(w0 * f);
  // drawn natively at the new size (not a stretched picture), so edges, lines and text stay sharp
  L[k].d = (c, x, G) => { const pk = RK; c.save(); c.translate(Math.round(x), Math.round(G)); c.scale(f, f); c.beginPath(); c.rect(-M, -H, w0 + M * 2, H); c.clip(); RK = f; try { d0(c, 0, 0); } finally { RK = pk; c.restore(); } if (SHARP[k]) SHARP[k](c, x, G, f); }; });
window.SCALE = SCALE;
// draw any landmark/house function natively at a scale (used for the houses in index.html)
window.drawScaled = (c, d0, x, G, f) => { const pk = RK; c.save(); c.translate(Math.round(x), Math.round(G)); c.scale(f, f); c.beginPath(); c.rect(-200, -400, 2000, 400); c.clip(); RK = f; try { d0(c, 0, 0); } finally { RK = pk; c.restore(); } };
})();
