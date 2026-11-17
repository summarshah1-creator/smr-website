/* Luton landmarks, front-on pixel art. One style: flat colours, 1px dark outline,
   light from the left, same ground line. Each draws with its base on y = G and returns its width. */
(function () {
const OUT = '#1b1a24';
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const SH = (col, k) => { const n = parseInt(col.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.max(0, Math.min(255, Math.round(r * k))); g = Math.max(0, Math.min(255, Math.round(g * k))); b = Math.max(0, Math.min(255, Math.round(b * k))); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); };
const BOX = (c, col, x, y, w, h) => { R(c, OUT, x - 1, y - 1, w + 2, h + 2); R(c, col, x, y, w, h); if (col[0] === '#' && w > 6 && h > 6) { R(c, SH(col, 1.08), x, y, 1, h); R(c, SH(col, 1.1), x, y, w, 1); R(c, SH(col, .86), x + w - 2, y + 1, 2, h - 1); } };
const P = (c, col, pts, out) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = col; c.fill(); if (out) { c.strokeStyle = OUT; c.lineWidth = 1; c.stroke(); } };
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
const TREE = (c, x, G, s = 1, col = '#4f8a3c', dk = '#3a6b2c') => { R(c, '#5a3d2a', x - 2, G - 22 * s, 4, 22 * s); CIRC(c, OUT, x, G - 34 * s, 17 * s + 1); CIRC(c, dk, x, G - 34 * s, 17 * s); CIRC(c, col, x - 3, G - 37 * s, 13 * s); CIRC(c, '#6fae4e', x - 7, G - 41 * s, 6 * s); };
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
  TS(c, 'chaiiwala', x + 74, G - 95, 12, '#ffffff', '#0e141c');
  P(c, '#d7dce1', [[x + 3, G - 72], [x + 127, G - 72], [x + 122, G - 66], [x + 8, G - 66]], true);
  BOX(c, '#26303d', x + 5, G - 66, 120, 66); for (let i = 0; i < 5; i++) { R(c, '#3a4656', x + 9 + i * 23, G - 64, 1, 64); CIRC(c, '#f5c46b', x + 17 + i * 23, G - 58, 1); }
  BOX(c, '#3a4656', x + 50, G - 40, 26, 40); R(c, '#9fc1d8', x + 53, G - 37, 20, 37);
  // Nando's unit (right, a little longer)
  c.save(); c.translate(-50, 0);
  BOX(c, '#3a3d44', x + 180, G - 110, 158, 110); R(c, '#4a4e56', x + 180, G - 110, 158, 2);
  for (let i = 0; i < 18; i++) R(c, ['#8a6a4a', '#a58258', '#6e5236', '#9a7650'][i % 4], x + 184 + i * 6, G - 106, 5, 34);
  T(c, "Nando's", x + 238, G - 98, 16, '#7a1418'); T(c, "Nando's", x + 237, G - 99, 16, '#e0262a');
  GLASS(c, x + 184, G - 72, 108, 72, '#6a8aa6', 6, 2); BOX(c, '#2a2c30', x + 196, G - 40, 16, 40); R(c, '#9fc1d8', x + 198, G - 38, 12, 38);
  R(c, '#5a3d2a', x + 232, G - 24, 2, 24); CIRC(c, '#6f8f4a', x + 233, G - 30, 8);
  BOX(c, '#2a2c30', x + 292, G - 110, 46, 110); for (let j = 0; j < 4; j++) R(c, '#34373c', x + 292, G - 82 + j * 22, 46, 1);
  CIRC(c, '#e0262a', x + 315, G - 88, 15); CIRC(c, '#2a2c30', x + 315, G - 88, 13); R(c, '#e0262a', x + 313, G - 98, 4, 6); CIRC(c, '#e0262a', x + 315, G - 86, 4); R(c, '#e0262a', x + 313, G - 82, 4, 8); R(c, '#e0262a', x + 310, G - 76, 10, 2);
  c.restore();
} };

L.periperi = { n: 'Peri-Peri Original', w: 180, d(c, x, G) {
  BOX(c, '#5b5f66', x, G - 50, 64, 50); BOX(c, '#3d4047', x, G - 62, 64, 12); T(c, 'PERI', x + 32, G - 59, 8, '#ff5a4a', 'center', false);
  WIN(c, x + 6, G - 44, 52, 36, '#4a4e55', '#f3d28a');
  BOX(c, '#6e737b', x + 64, G - 128, 116, 66); WIN(c, x + 74, G - 118, 44, 36, '#4a4e55', '#efe6cf'); WIN(c, x + 126, G - 118, 44, 36, '#4a4e55', '#efe6cf');
  for (const wx of [x + 78, x + 130]) for (let i = 0; i < 6; i++) { R(c, '#c9c0a8', wx + i * 6, G - 108 + (i % 2) * 3, 4, 1); R(c, i % 3 ? '#d84b3c' : '#4caf50', wx + 3 + i * 6, G - 100, 2, 2); }
  P(c, '#5a3a2e', [[x + 58, G - 128], [x + 186, G - 128], [x + 172, G - 146], [x + 72, G - 146]], true); for (let i = 0; i < 4; i++) R(c, '#4a2f25', x + 66 + i * 3, G - 140 + i * 3, 110 - i * 6, 1);
  BRICK(c, x + 150, G - 162, 14, 18); R(c, OUT, x + 149, G - 163, 16, 1);
  BOX(c, '#3d4047', x + 64, G - 64, 116, 14); R(c, '#4a4e55', x + 64, G - 58, 116, 1);
  BOX(c, '#6e737b', x + 64, G - 50, 116, 50); WIN(c, x + 70, G - 46, 50, 44, '#3d4047', '#f6e2a8'); WIN(c, x + 124, G - 46, 50, 44, '#3d4047', '#f6e2a8');
  R(c, '#d84b3c', x + 78, G - 14, 6, 6); R(c, '#4caf50', x + 90, G - 14, 6, 6); R(c, '#ffffff', x + 132, G - 22, 36, 4); R(c, '#2d2d33', x + 140, G - 40, 8, 14);
  T(c, 'Peri-Peri', x + 122, G - 80, 16, '#ff9d8c'); T(c, 'Peri-Peri', x + 121, G - 81, 16, '#ff2e1f');
  BOX(c, '#f4f2ec', x + 98, G - 63, 48, 9); T(c, 'ORIGINAL', x + 122, G - 62, 8, '#e0281a', 'center', false);
} };

L.frasers = { n: 'Frasers Plus Luton', w: 170, d(c, x, G) {
  BOX(c, '#b8bcc2', x + 118, G - 120, 52, 120); for (let i = 0; i < 6; i++) R(c, '#a3a8af', x + 118, G - 110 + i * 18, 52, 2); T(c, 'TK MAXX', x + 144, G - 112, 8, '#8a9098', 'center', false);
  BOX(c, '#4f86a8', x, G - 156, 120, 156);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) R(c, (i + j) % 3 ? '#5e95b8' : '#76aacb', x + 2 + i * 20, G - 154 + j * 20, 18, 18);
  BOX(c, '#1e2a4a', x + 6, G - 108, 108, 34); CIRC(c, '#e04d8a', x + 18, G - 91, 5); CIRC(c, '#3fb5e5', x + 22, G - 91, 3);
  T(c, 'FRASERSPLUS', x + 68, G - 102, 8, '#ffffff'); T(c, 'LUTON', x + 68, G - 88, 8, '#cfd8ea', 'center', false);
  BOX(c, '#26314d', x + 34, G - 22, 52, 22); R(c, '#4f86a8', x + 38, G - 18, 44, 18);
} };

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
    R(c, '#5a4a2a', x + 99, G - 158, 1.4, 6); R(c, '#5a4a2a', x + 100, G - 152, 4, 1.4);
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
  for (const fx of [x + 40, x + 168]) { R(c, '#d9d9d9', fx, G - 140, 1, 46); R(c, '#2a3f8f', fx + 1, G - 140, 8, 6); R(c, '#d8262f', fx + 1, G - 138, 8, 2); }
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
  T(c, 'WELCOME TO', x + 130, G - 72, 16, '#f6f6f2'); T(c, 'LUTON', x + 131, G - 51, 40, '#c9c9c4'); T(c, 'LUTON', x + 130, G - 52, 40, '#ffffff');
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
  CIRC(c, '#2f5f3a', x + 170, G - 60, 30); CIRC(c, '#356b40', x + 196, G - 50, 22);
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

L.hatfactory = { n: 'The Hat Factory', w: 180, d(c, x, G) {
  BRICK(c, x, G - 170, 150, 170, '#8f4a35', '#7c3f2c'); R(c, OUT, x - 1, G - 171, 152, 1); R(c, OUT, x - 1, G - 170, 1, 170); R(c, OUT, x + 150, G - 170, 1, 170);
  P(c, '#8f4a35', [[x, G - 170], [x + 60, G - 186], [x + 150, G - 170]], true); P(c, '#e8e3d8', [[x + 52, G - 184], [x + 60, G - 188], [x + 150, G - 172], [x + 150, G - 170]]);
  for (let r = 0; r < 5; r++) { R(c, '#d8cbb0', x, G - 150 + r * 28, 150, 3); for (let i = 0; i < 3; i++) WIN(c, x + 6 + i * 16, G - 144 + r * 28, 12, 20, '#f4f2ec', '#7f97a8'); }
  BOX(c, '#5e5e60', x + 56, G - 140, 10, 100); c.save(); c.translate(x + 64, G - 136); c.rotate(Math.PI / 2); T(c, 'the hat factory', 0, 0, 8, '#ffffff', 'left', false); c.restore();
  BOX(c, '#c86a3a', x + 76, G - 150, 66, 92); const pc = ['#e8e3d8', '#2f4a8a', '#d84b3c', '#f2c14e', '#1f6f6a'];
  for (let i = 0; i < 16; i++) for (let j = 0; j < 22; j++) if ((i + j) % 2 === 0) R(c, pc[(i * 3 + j) % 5], x + 78 + i * 4, G - 148 + j * 4, 3, 3); ['IF YOU', 'CAN', 'DREAM IT', 'YOU MUST', 'DO IT'].forEach((w, k) => { T(c, w, x + 110, G - 140 + k * 15, 8, '#5a1f3a'); T(c, w, x + 109, G - 141 + k * 15, 8, '#f6c6d6'); });
  BOX(c, '#e9e6df', x, G - 30, 150, 30); for (let i = 0; i < 6; i++) R(c, '#7fa7c4', x + 4 + i * 24, G - 26, 20, 26);
  BOX(c, '#b9bdc2', x + 150, G - 120, 30, 120); R(c, '#a3a8af', x + 150, G - 100, 30, 1);
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

L.krispy = { n: 'Krispy Lemon Chicken', w: 170, d(c, x, G) {
  BRICK(c, x, G - 130, 170, 130, '#a8503a', '#94452f'); R(c, OUT, x - 1, G - 131, 172, 1); BOX(c, '#3a3a3e', x - 4, G - 136, 178, 6);
  WIN(c, x + 48, G - 122, 26, 26); WIN(c, x + 104, G - 122, 26, 26); R(c, '#f4f6c8', x + 30, G - 92, 8, 4); R(c, '#f4f6c8', x + 140, G - 92, 8, 4);
  BOX(c, '#6e1f33', x + 34, G - 86, 116, 30); T(c, 'Krispy Lemon', x + 84, G - 82, 8, '#f2c96b'); T(c, 'Chicken', x + 84, G - 71, 8, '#f2c96b');
  CIRC(c, '#ffffff', x + 136, G - 72, 5); R(c, '#f2c14e', x + 140, G - 74, 4, 2); R(c, '#d84b3c', x + 135, G - 79, 3, 3);
  BOX(c, '#c62828', x + 16, G - 54, 152, 8); T(c, 'BURGERS . PIZZA . CHIPS', x + 92, G - 54, 8, '#ffffff', 'center', false);
  BOX(c, '#d9d7d1', x + 16, G - 46, 152, 46); for (let i = 0; i < 9; i++) R(c, '#c6c3bb', x + 16, G - 44 + i * 5, 152, 1);
  BOX(c, '#c62828', x + 16, G - 46, 3, 46); BOX(c, '#c62828', x + 165, G - 46, 3, 46);
  BOX(c, '#2b2b30', x + 24, G - 42, 26, 42); R(c, '#e7c35a', x + 27, G - 36, 20, 2); R(c, '#e7c35a', x + 27, G - 30, 20, 2);
  BOX(c, '#46505a', x + 56, G - 42, 104, 26); R(c, '#e7c35a', x + 80, G - 36, 56, 2); R(c, '#e7c35a', x + 76, G - 30, 64, 3);
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

L.tesco = { n: 'Tesco Extra', w: 240, d(c, x, G) {
  BRICK(c, x + 72, G - 150, 30, 40, '#a8503a', '#94452f'); R(c, OUT, x + 71, G - 151, 32, 41); BRICK(c, x + 72, G - 150, 30, 40, '#a8503a', '#94452f');
  P(c, '#3a3a3e', [[x + 66, G - 150], [x + 108, G - 150], [x + 98, G - 162], [x + 76, G - 162]], true);
  BOX(c, '#f4f2ec', x + 72, G - 148, 30, 7); T(c, 'TESCO', x + 87, G - 148, 8, '#d8262f', 'center', false);
  for (const cx of [x + 80, x + 94]) { CIRC(c, OUT, cx, G - 128, 5); CIRC(c, '#f4f2ec', cx, G - 128, 4); R(c, OUT, cx, G - 131, 1, 3); R(c, OUT, cx, G - 128, 3, 1); }
  P(c, '#3d3f45', [[x - 4, G - 66], [x + 244, G - 66], [x + 222, G - 116], [x + 18, G - 116]], true);
  for (let i = 0; i < 12; i++) R(c, '#34363c', x + 14 + i * 2, G - 112 + i * 4, 212 - i * 4, 1);
  BRICK(c, x, G - 66, 240, 66, '#a8503a', '#94452f'); R(c, OUT, x - 1, G - 67, 242, 1);
  BOX(c, '#ecebe7', x - 4, G - 70, 248, 4);
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#f4f2ec'; c.font = '700 16px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText('TESCO', x + 84, G - 92); c.fillStyle = '#d8262f'; c.fillText('TESCO', x + 84, G - 92);
  c.font = '700 12px Silk'; c.strokeText('Extra', x + 146, G - 91); c.fillStyle = '#1f4fa8'; c.fillText('Extra', x + 146, G - 91);
  BOX(c, '#c8202a', x + 40, G - 60, 70, 8); T(c, 'Welcome', x + 75, G - 60, 8, '#ffffff', 'center', false);
  GLASS(c, x + 40, G - 52, 70, 52, '#7d8f9a', 5, 2); for (let i = 0; i < 4; i++) CIRC(c, ['#d84b3c', '#e8a33c', '#7fae4e', '#d84b3c'][i], x + 52 + i * 15, G - 32, 5);
  BOX(c, '#2a2f3a', x + 112, G - 52, 80, 52); for (let i = 0; i < 4; i++) CIRC(c, '#f7e7a1', x + 122 + i * 20, G - 50, 1);
  for (let i = 0; i < 9; i++) { R(c, '#9aa3ad', x + 116 + i * 7, G - 14, 6, 1); R(c, '#9aa3ad', x + 116 + i * 7, G - 14, 1, 10); R(c, '#2f4fa8', x + 116 + i * 7, G - 6, 6, 2); }
  BOX(c, '#1f4fa8', x + 160, G - 40, 30, 40); BOX(c, '#3a3d44', x + 166, G - 32, 8, 10); BOX(c, '#3a3d44', x + 178, G - 32, 8, 10);
  BOX(c, '#1a1a1e', x + 200, G - 52, 20, 52); BOX(c, '#cfe6f2', x + 203, G - 48, 14, 26); R(c, '#e8c766', x + 205, G - 30, 10, 6);
  for (let i = 0; i < 10; i++) R(c, '#cfcac0', x + 4 + i * 4, G - 52, 1, 52);
} };

L.currys = { n: 'Currys PC World', w: 360, d(c, x, G) {
  for (const wx of [x, x + 260]) { BRICK(c, wx, G - 104, 100, 104, '#d2a46a', '#bf9259'); R(c, OUT, wx - 1, G - 105, 102, 1); BOX(c, '#ecebe7', wx, G - 118, 100, 14); R(c, '#3a3d44', wx, G - 10, 100, 10); }
  BOX(c, '#22408a', x + 8, G - 98, 76, 22); T(c, 'Carphone', x + 46, G - 96, 8, '#ffffff', 'center', false); T(c, 'Warehouse', x + 46, G - 86, 8, '#ffffff', 'center', false);
  BOX(c, '#22408a', x + 276, G - 98, 76, 22); T(c, 'Carphone', x + 314, G - 96, 8, '#ffffff', 'center', false); T(c, 'Warehouse', x + 314, G - 86, 8, '#ffffff', 'center', false);
  BOX(c, '#f1f1ee', x + 84, G - 166, 192, 166); P(c, '#f6f6f3', [[x + 78, G - 166], [x + 104, G - 182], [x + 256, G - 182], [x + 282, G - 166]], true); for (let i = 0; i < 12; i++) R(c, '#dcdcd8', x + 92 + i * 16, G - 160, 1, 26);
  BOX(c, '#5a3fa8', x + 92, G - 154, 176, 48); R(c, '#4a64c8', x + 92, G - 154, 70, 48); R(c, '#5250b8', x + 162, G - 154, 40, 48);
  CIRC(c, OUT, x + 116, G - 130, 15); CIRC(c, '#f4f2ec', x + 116, G - 130, 14); CIRC(c, '#e0472f', x + 116, G - 130, 12); R(c, '#f5a23a', x + 104, G - 132, 24, 4);
  TS(c, 'Currys', x + 196, G - 150, 16, '#ffffff', '#2a2f6a'); TS(c, 'PC World', x + 196, G - 129, 16, '#ffffff', '#2a2f6a');
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
  BOX(c, '#ecebe7', x + 160, G - 26, 46, 26); T(c, 'WELCOME', x + 183, G - 24, 8, '#4a4d54', 'center', false); BOX(c, '#3a3d44', x + 174, G - 16, 18, 16); R(c, '#8a1d2a', x + 179, G - 14, 8, 14);
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
  BOX(c, '#e9ecef', x + 120, G - 58, 160, 8); BOX(c, '#ffffff', x + 186, G - 57, 74, 6); T(c, 'ENTRANCE', x + 223, G - 58, 8, '#22408a', 'center', false);
  BOX(c, '#f4f4f4', x + 124, G - 50, 152, 50); BOX(c, '#ffffff', x + 126, G - 46, 18, 46);
  for (let i = 0; i < 6; i++) R(c, i < 2 ? '#7a8590' : '#3a4250', x + 148 + i * 21, G - 46, 18, 44); R(c, '#e9ecef', x + 148, G - 40, 126, 1); BOX(c, '#2f6fb5', x + 158, G - 32, 4, 4);
  CLAD(x, G - 70, 22, 70); BOX(c, '#ecebe7', x - 2, G - 54, 24, 4); BOX(c, '#3a4250', x + 4, G - 46, 12, 46); R(c, '#c8202a', x + 16, G - 46, 2, 46);
} };

L.alquds = { n: 'Al-Quds', w: 160, d(c, x, G) {
  const Y = '#efe2a2';
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
  BOX(c, '#1a1c20', x + 8, G - 26, 22, 26); R(c, '#c9b48a', x + 10, G - 24, 18, 24); R(c, '#1a1c20', x + 10, G - 13, 18, 2);
  R(c, '#d8c398', x + 32, G - 26, 122, 26); for (let i = 0; i < 5; i++) { R(c, '#3a2a20', x + 40 + i * 24, G - 10, 10, 10); CIRC(c, '#f6c46a', x + 44 + i * 24, G - 23, 2); } R(c, '#1a1c20', x + 92, G - 26, 2, 26); R(c, '#1a1c20', x + 32, G - 14, 122, 2);
  CIRC(c, '#2fb35a', x + 38, G - 20, 3);
} };

L.karwan = { n: 'Karwan Afghan Cuisine', w: 230, d(c, x, G) {
  TREE(c, x + 168, G - 60, 1.3, '#4f8a3c', '#3a6b2c');
  BOX(c, '#f1efea', x, G - 74, 230, 74);
  BOX(c, '#121214', x + 2, G - 72, 168, 22); T(c, 'KARWAN', x + 70, G - 70, 16, '#e0262a'); T(c, 'AFGHAN CUISINE', x + 70, G - 57, 8, '#ffffff', 'center', false); T(c, '5-7', x + 10, G - 66, 8, '#ffffff', 'center', false); T(c, '01582', x + 148, G - 60, 8, '#ffffff', 'center', false);
  BOX(c, '#121214', x + 172, G - 72, 46, 22); T(c, 'WELCOME', x + 195, G - 71, 8, '#ffffff', 'center', false); T(c, 'KARWAN', x + 195, G - 63, 8, '#e0262a', 'center', false);
  BOX(c, '#2aa8b8', x + 220, G - 76, 12, 18); R(c, '#ffffff', x + 224, G - 72, 1, 8); R(c, '#ffffff', x + 227, G - 72, 1, 8);
  for (const [wx, ww] of [[x + 6, 34], [x + 46, 74], [x + 126, 40]]) { BOX(c, '#2a2a2e', wx, G - 46, ww, 22); R(c, '#3e3a36', wx + 2, G - 44, ww - 4, 18); R(c, '#55524e', wx + 2, G - 30, ww - 4, 4); CIRC(c, '#f6c46a', wx + ww / 2, G - 40, 1); BOX(c, '#3a3f4a', wx, G - 22, ww, 22); }
  R(c, '#f1efea', x + 82, G - 46, 2, 22);
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
  BOX(c, '#121418', x - 44, G - 58, 208, 14); T(c, 'MAIN ENTRANCE', x + 104, G - 56, 8, '#ffffff', 'center', true);
  BOX(c, '#e3171f', x + 162, G - 60, 100, 16); T(c, 'EMERGENCY DEPT', x + 212, G - 57, 8, '#ffffff', 'center', true);
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

L.jdgyms = { n: 'JD Gyms', w: 360, d(c, x, G) {
  const CL = '#c9ced6';
  for (const bx of [x, x + 240]) { BOX(c, CL, bx, G - 104, 120, 104); for (let i = 0; i < 6; i++) R(c, '#b6bcc5', bx, G - 88 + i * 14, 120, 1); BOX(c, '#3a3f4a', bx - 2, G - 112, 124, 10); R(c, '#4a505c', bx - 2, G - 107, 124, 1); BOX(c, '#2a3036', bx + 6, G - 56, 108, 56); for (let i = 0; i < 5; i++) R(c, '#3e4a56', bx + 10 + i * 21, G - 52, 17, 48); }
  BOX(c, '#d4d8de', x + 112, G - 144, 136, 144);
  P(c, '#cdd1d7', [[x + 96, G - 152], [x + 264, G - 152], [x + 256, G - 162], [x + 104, G - 162]], true); for (const px of [x + 104, x + 252]) BOX(c, '#9aa3ad', px, G - 152, 4, 152);
  BOX(c, '#2f3a4c', x + 112, G - 148, 136, 46); R(c, '#3a4760', x + 112, G - 148, 136, 3);
  CIRC(c, OUT, x + 140, G - 125, 18); CIRC(c, '#ffffff', x + 140, G - 125, 17); T(c, 'JD', x + 141, G - 133, 16, '#2f3a4c');
  T(c, 'GYMS', x + 204, G - 133, 16, '#ffffff');
  const BR = (bx, by, sx, sy) => { R(c, '#8be03a', bx, by, 9 * sx, 3); R(c, '#8be03a', sx < 0 ? bx - 3 : bx, by, 3, 9 * sy); };
  BR(x + 166, G - 142, 1, 1); BR(x + 242, G - 142, -1, 1); BR(x + 166, G - 109, 1, -1); BR(x + 242, G - 109, -1, -1);
  P(c, '#cdd1d7', [[x + 98, G - 92], [x + 262, G - 92], [x + 254, G - 102], [x + 106, G - 102]], true); R(c, '#9aa3ad', x + 106, G - 92, 148, 2);
  BOX(c, '#26303d', x + 116, G - 90, 128, 90); for (let i = 0; i < 6; i++) R(c, '#33404f', x + 118 + i * 21, G - 88, 19, 40);
  BOX(c, '#121418', x + 134, G - 52, 92, 10); T(c, 'WELCOME JD GYMS LUTON', x + 180, G - 51, 8, '#ffffff', 'center', false);
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

L.bandq = { n: 'B and Q', w: 440, d(c, x, G) {
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
  GLASS(c, x, G - 66, 170, 66, '#4a6a86', 8, 2); for (let i = 0; i < 6; i++) BOX(c, ['#2f8a4a', '#d84b3c', '#2f8a4a', '#e8a33c', '#2f8a4a', '#d84b6a'][i], x + 10 + i * 26, G - 40, 14, 20);
  BOX(c, '#2a3036', x + 170, G - 66, 90, 66); for (let i = 0; i < 4; i++) { CIRC(c, '#7fbf4a', x + 186 + i * 20, G - 40, 6); CIRC(c, '#f4f2ec', x + 186 + i * 20, G - 40, 3); } for (const px of [x + 172, x + 214, x + 256]) BOX(c, '#ecebe7', px, G - 66, 4, 66);
  const LOGO = (lx, ly, sz) => { BOX(c, '#1f52b0', lx, ly, sz, sz); CIRC(c, '#d32f2f', lx + sz / 2, ly + sz / 2, sz / 2 - 3); CIRC(c, '#ffe23a', lx + sz / 2, ly + sz / 2, sz / 2 - 5); T(c, 'LIDL', lx + sz / 2, ly + sz / 2 - 4, 8, '#1f52b0'); R(c, '#d32f2f', lx + sz / 2 - 3, ly + sz / 2 - 7, 2, 2); };
  LOGO(x + 108, G - 116, 44);
  for (let i = 0; i < 8; i++) { R(c, '#ecebe7', x + 14 + i * 20, G - 16, 2, 16); R(c, '#9aa3ad', x + 14 + i * 20, G - 12, 20, 1); }
} };

L.matalan = { n: 'Matalan', w: 440, d(c, x, G) {
  const RD = '#d2232a';
  for (const [bx, bw] of [[x, 150], [x + 290, 150]]) {
    BOX(c, '#f1efe9', bx, G - 78, bw, 78); BOX(c, RD, bx - 2, G - 84, bw + 4, 6); R(c, '#a81a20', bx - 2, G - 79, bw + 4, 1);
    for (let i = 0; i < 3; i++) { const px = bx + 6 + i * (bw - 12) / 3; BRICK(c, px, G - 78, 12, 78, '#a8503a', '#94452f'); R(c, OUT, px - 1, G - 78, 1, 78); }
    BRICK(c, bx, G - 30, bw, 30, '#a8503a', '#94452f'); R(c, RD, bx, G - 31, bw, 2);
  }
  BOX(c, '#26303d', x + 30, G - 74, 36, 44); for (let j = 0; j < 3; j++) R(c, RD, x + 30, G - 74 + j * 15, 36, 2); R(c, RD, x + 47, G - 74, 2, 44);
  BOX(c, RD, x + 372, G - 44, 30, 44); R(c, '#a81a20', x + 386, G - 44, 2, 44);
  for (const [px, col] of [[x + 80, '#f4f2ec'], [x + 104, '#2a6fa8'], [x + 320, '#2a6fa8'], [x + 344, '#f4f2ec']]) BOX(c, col, px, G - 28, 14, 20);
  BRICK(c, x + 150, G - 130, 140, 130, '#a8503a', '#94452f'); R(c, OUT, x + 149, G - 131, 142, 1);
  P(c, RD, [[x + 132, G - 158], [x + 308, G - 158], [x + 298, G - 150], [x + 142, G - 150]], true); BOX(c, RD, x + 154, G - 150, 132, 26); R(c, '#e8424a', x + 154, G - 150, 132, 2);
  T(c, 'MATALAN', x + 220, G - 145, 16, '#ffffff');
  for (const [gx, red] of [[x + 158, false], [x + 224, true]]) { BOX(c, '#26303d', gx, G - 118, 58, 118); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) R(c, (i + j) % 2 ? '#4a6a86' : '#5d7d98', gx + 2 + i * 14, G - 116 + j * 18, 12, 16); R(c, RD, gx, G - 46, 58, 3); if (red) { BOX(c, RD, gx, G - 44, 58, 44); R(c, '#a81a20', gx + 28, G - 44, 2, 44); } else { R(c, '#9fc1d8', gx + 6, G - 40, 46, 40); R(c, RD, gx + 28, G - 40, 2, 40); R(c, RD, gx + 6, G - 26, 46, 2); } }
  for (let i = 0; i < 16; i++) { const bx = x + 6 + i * 28; BOX(c, RD, bx, G - 14, 4, 14); R(c, '#f06a70', bx, G - 14, 1, 14); }
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
  for (const [tx, r] of [[x + 20, 30], [x + 120, 36], [x + 250, 34], [x + 340, 30]]) { CIRC(c, OUT, tx, G - 90, r + 1); CIRC(c, '#3f6f34', tx, G - 90, r); CIRC(c, '#4f8a3c', tx - 6, G - 96, r * .6); }
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
  BOX(c, WH, x + 152, G - 44, 136, 16); T(c, 'GURU NANAK GURDWARA', x + 220, G - 44, 8, '#1f2f6a', 'center', false); T(c, 'LUTON', x + 220, G - 36, 8, '#1f2f6a', 'center', false);
  for (const kx of [x + 155, x + 279]) { CIRC(c, '#1f3f8a', kx + 2, G - 37, 3); R(c, '#1f3f8a', kx + 1, G - 43, 2, 12); }
  // stairs
  for (const [sx, dir] of [[x + 120, 1], [x + 290, -1]]) for (let i = 0; i < 10; i++) R(c, i % 2 ? '#b9bcc0' : '#a8abb0', sx + (dir > 0 ? i * 3 : 30 - i * 3), G - 44 + i * 4.4, 30, 4);
} };

L.toros = { n: "Toro's Steakhouse", w: 220, d(c, x, G) {
  const B = '#6a4234', BL = '#5a382c', WH = '#efece4';
  c.save(); c.translate(0, -18);
  BRICK(c, x, G - 160, 200, 112, B, BL); R(c, OUT, x - 1, G - 161, 202, 1); R(c, OUT, x - 1, G - 160, 1, 112); BOX(c, WH, x - 2, G - 166, 204, 8); R(c, '#d8d4ca', x - 2, G - 160, 204, 2);
  for (const [px, pw] of [[x + 20, 40], [x + 120, 44]]) { BOX(c, WH, px, G - 108, pw, 60); P(c, WH, [[px - 4, G - 108], [px + pw / 2, G - 120], [px + pw + 4, G - 108]], true); R(c, '#d8d4ca', px, G - 106, pw, 2); }
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const wx = x + 10 + i * 40, wy = r ? G - 102 : G - 150; WIN(c, wx, wy, 16, r ? 40 : 30, '#f4f2ec', '#9fb7c9'); R(c, WH, wx - 2, wy + (r ? 40 : 30), 20, 3); }
  for (let i = 0; i < 25; i++) R(c, WH, x + 2 + i * 8, G - 52, 4, 2);
  // shopfront sign: black fascia with a thin gold frame, bull head, TORO'S in red with a white edge, STEAKHOUSE in white
  BOX(c, '#1f1d1e', x - 2, G - 50, 204, 24); R(c, '#c9a64a', x, G - 48, 200, 1); R(c, '#c9a64a', x, G - 29, 200, 1);
  { const bx = x + 14, by = G - 38; P(c, '#f4f2ec', [[bx - 9, by - 7], [bx - 5, by - 3], [bx + 5, by - 3], [bx + 9, by - 7], [bx + 7, by - 1], [bx + 4, by], [bx + 3, by + 6], [bx, by + 8], [bx - 3, by + 6], [bx - 4, by], [bx - 7, by - 1]]); R(c, '#1f1d1e', bx - 3, by + 1, 2, 2); R(c, '#1f1d1e', bx + 1, by + 1, 2, 2); R(c, '#d8262f', bx - 1, by + 6, 2, 1); }
  c.font = '700 16px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#f4f2ec'; c.strokeText("TORO'S", x + 76, G - 38); c.fillStyle = '#d8262f'; c.fillText("TORO'S", x + 76, G - 38);
  T(c, 'STEAKHOUSE', x + 162, G - 42, 8, '#f4f2ec', 'center', false); R(c, '#c9a64a', x + 132, G - 33, 60, 1);
  BOX(c, '#1f1d1e', x + 22, G - 62, 12, 12); CIRC(c, '#c8202a', x + 28, G - 56, 2);
  c.restore();
  BOX(c, '#2f6a2e', x, G - 46, 200, 46); for (let i = 0; i < 180; i++) R(c, i % 2 ? '#24561f' : '#3e8238', x + (i * 37) % 198, G - 45 + (i * 13) % 44, 2, 2);
  for (let i = 0; i < 4; i++) { BOX(c, '#2a2226', x + 10 + i * 36, G - 42, 30, 34); R(c, '#5a6470', x + 12 + i * 36, G - 40, 26, 30); R(c, '#8a96a2', x + 14 + i * 36, G - 38, 3, 26); R(c, '#c8202a', x + 20 + i * 36, G - 26, 6, 1); }
  BOX(c, '#3a2a20', x + 164, G - 40, 18, 40); R(c, '#9fc1d8', x + 167, G - 37, 12, 16); CIRC(c, '#f2c43a', x + 173, G - 14, 2);
  // neighbours
} };

L.gna = { n: 'G and A Fast Food', w: 150, d(c, x, G) {
  c.save(); c.translate(0, -16);
  P(c, '#7a4a3a', [[x - 8, G - 118], [x + 158, G - 118], [x + 146, G - 150], [x + 4, G - 150]], true); for (let i = 1; i < 8; i++) R(c, '#6a3e30', x - 6 + i * 1.5, G - 118 - i * 4, 164 - i * 3, 1); for (let i = 0; i < 40; i++) R(c, '#8a5646', x + 4 + (i * 13) % 140, G - 146 + (i * 7) % 26, 3, 1);
  BRICK(c, x + 112, G - 172, 22, 30, '#8a4a36', '#76402e'); R(c, OUT, x + 111, G - 173, 24, 1); R(c, '#b9b3a6', x + 110, G - 174, 26, 3); R(c, '#9a9a9a', x + 128, G - 200, 2, 28); R(c, '#9a9a9a', x + 120, G - 194, 16, 1); R(c, '#9a9a9a', x + 122, G - 188, 12, 1);
  BRICK(c, x, G - 120, 150, 70, '#5a3e34', '#4a332a'); R(c, OUT, x - 1, G - 121, 152, 1); BOX(c, '#c9ced4', x + 44, G - 116, 62, 60); for (let i = 0; i < 3; i++) R(c, '#6a7a8a', x + 47 + i * 20, G - 113, 16, 54);
  BOX(c, '#121214', x - 2, G - 52, 154, 26); BOX(c, '#e9e6df', x + 2, G - 50, 30, 22); for (let i = 0; i < 5; i++) R(c, '#c8202a', x + 34, G - 48 + i * 4, 14, 1);
  P(c, '#e0391e', [[x + 82, G - 52], [x + 84, G - 56], [x + 88, G - 53], [x + 92, G - 57], [x + 96, G - 53], [x + 100, G - 56], [x + 102, G - 52]], true);
  T(c, 'G', x + 78, G - 52, 16, '#e0391e'); T(c, 'A', x + 106, G - 52, 16, '#e0391e'); c.font = '16px PS'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = '#e0391e'; c.fillText('&', x + 92, G - 51); R(c, '#e0391e', x + 74, G - 36, 36, 1); T(c, 'FAST FOOD', x + 92, G - 35, 8, '#e0391e', 'center', false);
  R(c, '#e0391e', x + 124, G - 50, 1, 8); R(c, '#e0391e', x + 128, G - 50, 1, 8); R(c, '#e0391e', x + 132, G - 50, 1, 8); R(c, '#e0391e', x + 136, G - 50, 1, 8); T(c, '01582', x + 132, G - 40, 8, '#ffffff', 'center', false);
  // thin figure on the white panel next to the sign
  { const px = x + 2, py = G - 50; for (let i = 0; i < 22; i++) R(c, SH('#bdbdbd', 1.12 - i * .012), px, py + i, 30, 1); R(c, '#e8e8e8', px + 2, py + 2, 4, 8);
    P(c, '#1c1c1e', [[px + 5, py + 22], [px + 8, py + 15], [px + 12, py + 13], [px + 20, py + 13], [px + 24, py + 15], [px + 27, py + 22]], true);
    P(c, '#f2f2f2', [[px + 14, py + 13], [px + 16, py + 19], [px + 18, py + 13]], true); R(c, '#1c1c1e', px + 15, py + 14, 2, 4); R(c, '#3a3a3e', px + 11, py + 15, 1, 6); R(c, '#3a3a3e', px + 21, py + 15, 1, 6);
    R(c, '#6a6a6e', px + 14, py + 10, 4, 4); CIRC(c, '#7a7a7e', px + 16, py + 7, 5); R(c, '#4a4a4e', px + 13, py + 6, 2, 5); R(c, '#9a9a9e', px + 18, py + 5, 2, 3);
    P(c, '#111113', [[px + 10, py + 6], [px + 12, py + 1], [px + 17, py], [px + 21, py + 2], [px + 22, py + 5], [px + 18, py + 3], [px + 13, py + 4], [px + 12, py + 8]], true);
    R(c, '#2a2a2c', px + 15, py + 9, 4, 1); R(c, '#3a3a3c', px + 16, py + 11, 3, 1);
    R(c, '#5a4a3a', px + 19, py + 10, 6, 2); R(c, '#e8e8e8', px + 25, py + 10, 1, 2);
    for (const [a, b] of [[26, 8], [27, 6], [26, 4], [27, 2]]) R(c, 'rgba(255,255,255,.75)', px + a, py + b, 1, 1);
    R(c, OUT, px - 1, py - 1, 32, 1); R(c, OUT, px - 1, py + 22, 32, 1); R(c, OUT, px - 1, py - 1, 1, 24); R(c, OUT, px + 30, py - 1, 1, 24); }
  c.restore();
  BOX(c, '#121214', x, G - 42, 150, 42); R(c, '#e8c89a', x + 10, G - 40, 40, 38); R(c, '#e8c89a', x + 98, G - 40, 42, 38); R(c, '#f2e2c4', x + 54, G - 40, 40, 40); R(c, '#121214', x + 73, G - 40, 2, 40); R(c, '#d8cbb4', x + 10, G - 24, 40, 1); R(c, '#d8cbb4', x + 98, G - 24, 42, 1);
  for (const bx of [x + 14, x + 112]) { R(c, '#d8cbb4', bx, G - 12, 22, 6); R(c, '#9a6a4a', bx, G - 6, 22, 2); } BOX(c, '#3a7de0', x + 18, G - 36, 12, 5); T(c, 'OPEN', x + 24, G - 37, 8, '#ffffff', 'center', false);
} };

L.topspizza = { n: 'Tops Pizza', w: 180, d(c, x, G) {
  const U = 22;
  BRICK(c, x, G - 120 - U, 180, 76, '#6a3e30', '#5a3428'); R(c, OUT, x - 1, G - 121 - U, 182, 1);
  P(c, '#3a3436', [[x - 6, G - 118 - U], [x + 186, G - 118 - U], [x + 172, G - 130 - U], [x + 8, G - 130 - U]], true);
  P(c, '#ece7e0', [[x + 50, G - 118 - U], [x + 90, G - 166 - U], [x + 130, G - 118 - U]], true); c.save(); c.beginPath(); c.moveTo(x + 52, G - 118 - U); c.lineTo(x + 90, G - 164 - U); c.lineTo(x + 128, G - 118 - U); c.closePath(); c.clip();
  for (let i = 0; i < 6; i++) R(c, '#2a2426', x + 54 + i * 15, G - 166 - U, 3, 48); R(c, '#2a2426', x + 50, G - 140 - U, 80, 3); c.restore(); P(c, '#2a2426', [[x + 46, G - 116 - U], [x + 90, G - 170 - U], [x + 134, G - 116 - U], [x + 128, G - 116 - U], [x + 90, G - 162 - U], [x + 52, G - 116 - U]]);
  WIN(c, x + 80, G - 150 - U, 20, 18, '#f4f2ec', '#9fb7c9');
  for (const bx of [x + 22, x + 112]) { BOX(c, '#f4f2ec', bx, G - 104 - U, 44, 24); for (let i = 0; i < 3; i++) R(c, '#b9c9d6', bx + 2 + i * 14, G - 102 - U, 12, 20); P(c, '#b9b3a6', [[bx - 2, G - 80 - U], [bx + 46, G - 80 - U], [bx + 40, G - 74 - U], [bx + 4, G - 74 - U]], true); }
  // sign (higher)
  BOX(c, '#121214', x - 2, G - 68, 184, 22); R(c, '#e0262a', x + 50, G - 68, 2, 22);
  { const hx = x + 27; R(c, '#f4f2ec', hx - 8, G - 67, 16, 13); R(c, '#2a2a2e', hx - 7, G - 66, 14, 11); R(c, '#4a4a50', hx - 6, G - 66, 2, 9); R(c, '#e0262a', hx - 7, G - 58, 14, 3);
    R(c, '#f4f2ec', hx - 13, G - 55, 26, 3); R(c, '#2a2a2e', hx - 12, G - 54, 24, 1); R(c, '#f4f2ec', hx - 14, G - 57, 2, 2); R(c, '#f4f2ec', hx + 12, G - 57, 2, 2); }
  T(c, 'Tops Pizza', x + 118, G - 69, 16, '#f2e0b8'); T(c, 'DELIVERY', x + 150, G - 56, 8, '#e0262a', 'center', false);
  // tall glass shopfront
  BOX(c, '#26203a', x, G - 46, 180, 46); R(c, '#9a6ae8', x, G - 46, 180, 2); R(c, '#9a6ae8', x, G - 46, 2, 46); R(c, '#9a6ae8', x + 178, G - 46, 2, 46);
  R(c, '#e9ecef', x + 4, G - 42, 172, 40); for (const fx of [x + 60, x + 118]) R(c, '#3a3d44', fx, G - 42, 2, 42);
  for (let i = 0; i < 3; i++) { BOX(c, '#e0262a', x + 8 + i * 60, G - 40, 22, 16); R(c, '#f2c43a', x + 11 + i * 60, G - 36, 16, 3); R(c, '#ffffff', x + 11 + i * 60, G - 31, 16, 1); }
  for (let i = 0; i < 6; i++) R(c, '#c8ccd2', x + 34 + i * 20, G - 40, 14, 10);
  BOX(c, '#5a6070', x + 70, G - 22, 40, 2); BOX(c, '#3a3d44', x + 124, G - 34, 50, 32); R(c, '#e8a33c', x + 128, G - 30, 42, 3); T(c, 'OPEN', x + 149, G - 26, 8, '#f2c43a', 'center', false);
  BOX(c, '#c8202a', x + 10, G - 18, 26, 4); for (let i = 0; i < 4; i++) BOX(c, i % 2 ? '#2a2a2e' : '#c8202a', x + 10 + i * 9, G - 12, 6, 12);
} };

L.kaya = { n: 'Kaya Lounge', w: 230, d(c, x, G) {
  CIRC(c, OUT, x + 160, G - 82, 44); CIRC(c, '#3f6f34', x + 160, G - 82, 43); CIRC(c, '#4f8a3c', x + 150, G - 92, 26); CIRC(c, '#2f5f2c', x + 210, G - 70, 26);
  BOX(c, '#2a2826', x - 2, G - 66, 226, 8);
  BOX(c, '#2f5a2a', x, G - 58, 222, 58); for (let i = 0; i < 300; i++) R(c, ['#3e7a34', '#5a9a44', '#244a20', '#9ad06a', '#e8eedc'][i % 5], x + (i * 37) % 220, G - 56 + (i * 23) % 54, 2 + (i % 2), 2);
  BOX(c, '#0e1014', x + 20, G - 50, 44, 50); R(c, '#2a2e36', x + 26, G - 46, 32, 46); CIRC(c, '#eef4ff', x + 22, G - 52, 2); CIRC(c, '#eef4ff', x + 70, G - 52, 2);
  BOX(c, '#1c1b1e', x + 4, G - 96, 120, 32); T(c, 'KAYA', x + 60, G - 94, 16, '#eceae4'); T(c, 'L O U N G E', x + 60, G - 77, 8, '#eceae4', 'center', false);
  CIRC(c, '#c83a6a', x + 16, G - 86, 6); CIRC(c, '#1c1b1e', x + 16, G - 86, 5); T(c, '18', x + 16, G - 90, 8, '#ffffff', 'center', false);
  R(c, '#e8262f', x + 109, G - 92, 3, 15); P(c, '#e8262f', [[x + 104, G - 78], [x + 116, G - 78], [x + 110.5, G - 69]]);   // red arrow pointing down
  CIRC(c, '#f4f4f4', x + 150, G - 60, 3);
} };

/* ---------- extra detail from the photos ---------- */
const BUS = (c, x, G) => { BOX(c, '#17a3b5', x, G - 24, 48, 21); R(c, '#1c2a33', x + 2, G - 21, 36, 8); for (let i = 1; i < 4; i++) R(c, '#17a3b5', x + 2 + i * 9, G - 21, 1, 8); R(c, '#1c2a33', x + 40, G - 21, 7, 13); R(c, '#111316', x + 39, G - 24, 9, 2); R(c, '#ff8a1e', x + 40, G - 24, 5, 1); P(c, '#f4f6f8', [[x + 32, G - 13], [x + 36, G - 13], [x + 39, G - 5], [x + 35, G - 5]]); R(c, '#e3a321', x, G - 6, 48, 1); CIRC(c, OUT, x + 10, G - 2, 3.4); CIRC(c, '#b9bec6', x + 10, G - 2, 1.4); CIRC(c, OUT, x + 38, G - 2, 3.4); CIRC(c, '#b9bec6', x + 38, G - 2, 1.4); };
const POSTBOX = (c, x, G) => { BOX(c, '#c8202a', x, G - 14, 7, 14); R(c, '#8a141b', x, G - 15, 7, 2); R(c, OUT, x + 2, G - 11, 3, 1); };
const SHELTER = (c, x, G) => { R(c, '#8a9098', x, G - 22, 30, 2); R(c, '#8a9098', x, G - 22, 1, 22); R(c, '#8a9098', x + 29, G - 22, 1, 22); R(c, 'rgba(180,210,230,.45)', x + 1, G - 20, 28, 14); BOX(c, '#c8202a', x + 6, G - 7, 18, 2); };
const BIRCH = (c, x, G) => { R(c, '#efece4', x, G - 30, 2, 30); for (let i = 0; i < 4; i++) R(c, OUT, x, G - 26 + i * 7, 2, 1); for (let i = 0; i < 8; i++) R(c, '#7e9a5a', x - 6 + (i * 5) % 14, G - 40 + (i * 7) % 14, 2, 2); };
const MOPED = (c, x, G) => { CIRC(c, OUT, x + 4, G - 4, 4); CIRC(c, OUT, x + 22, G - 4, 4); CIRC(c, '#666', x + 4, G - 4, 2); CIRC(c, '#666', x + 22, G - 4, 2); BOX(c, '#8a1d2a', x + 4, G - 12, 18, 5); BOX(c, '#14182a', x - 2, G - 26, 14, 12); R(c, '#3f7de0', x, G - 20, 10, 2); PERSON(c, x + 12, G - 6, '#2a3a5a', '#22222a', '#c58c5c', '#14141a'); };
const EX = {
  toros(c, x, G) { BOX(c, '#f4f2ec', x + 140, G - 26, 12, 18); CIRC(c, '#d32f2f', x + 146, G - 16, 4); CIRC(c, '#2f4fa8', x + 146, G - 16, 3); R(c, '#1a1a1e', x + 140, G - 28, 12, 2); PERSON(c, x - 4, G, '#2a2a33', '#7f9ab8'); },
  gurdwara(c, x, G) { R(c, '#b9b3a6', x - 6, G - 3, 452, 3); for (let i = 0; i < 60; i++) R(c, i % 2 ? '#a39d90' : '#cfc9bc', x - 4 + (i * 37) % 448, G - 3 + (i % 3), 2, 1); PERSON(c, x + 200, G, '#1a1a1e'); PERSON(c, x + 212, G, '#2a2a33', '#9aa3ad', '#c58c5c', '#1f3f8a'); },
  stockwood(c, x, G) { PERSON(c, x + 90, G, '#2f4a8a'); PERSON(c, x + 98, G, '#e0458a'); },
  inspire(c, x, G) { R(c, '#6fbf4a', x, G - 4, 230, 4); for (const tx of [x + 150, x + 196]) { R(c, '#5a3d2a', tx, G - 26, 2, 26); CIRC(c, '#5f8f3c', tx + 1, G - 30, 6); }
    for (const lx of [x + 170, x + 260]) { R(c, '#9aa0a8', lx, G - 120, 3, 120); R(c, '#9aa0a8', lx, G - 120, 12, 2); BOX(c, '#2f6fb5', lx + 4, G - 104, 10, 30); R(c, '#7fc3e8', lx + 6, G - 100, 6, 6); }
    for (let i = 0; i < 8; i++) BOLL(c, x + 340 + i * 12, G); BOX(c, '#f2c43a', x + 238, G - 8, 8, 8); PERSON(c, x + 360, G, '#2f4a8a'); },
  matalan(c, x, G) { PERSON(c, x + 200, G, '#2f4a8a'); PERSON(c, x + 252, G, '#d84b6a'); },
  spudkingz(c, x, G) { PERSON(c, x + 76, G, '#2bb3c8', '#1a1a1e', '#6a4028', '#1a1a1e'); },
  bandq(c, x, G) { TREE(c, x + 40, G, 1.2, '#6faa3e', '#4f8a2c'); TREE(c, x + 410, G, 1.1, '#6faa3e', '#4f8a2c'); CAR(c, x + 300, G, '#f4f4f4'); CAR(c, x + 116, G, '#7a8290'); R(c, '#9aa3ad', x + 136, G - 70, 2, 70); BOX(c, '#ecebe7', x + 128, G - 72, 18, 3); },
  lidl(c, x, G) { TREE(c, x - 10, G, 1.5, '#4f8a3c', '#3a6b2c'); for (const bx of [x + 150, x + 236]) { BOX(c, '#1f52b0', bx, G - 30, 10, 26); R(c, '#ffe23a', bx + 2, G - 24, 6, 6); } },
  jdgyms(c, x, G) { R(c, '#b98a62', x - 6, G - 3, 372, 3); for (let i = 0; i < 46; i++) R(c, '#a8784f', x - 4 + i * 8, G - 3, 1, 3); },
  bigyellow(c, x, G) { for (let i = 0; i < 9; i++) { BOX(c, '#f4f2ec', x + 10 + i * 8, G - 10, 3, 10); R(c, '#f6d21a', x + 10 + i * 8, G - 6, 3, 2); } BOX(c, '#e8c84a', x + 80, G - 14, 8, 10); CIRC(c, OUT, x + 300, G - 8, 9); CIRC(c, '#4f8a3c', x + 300, G - 8, 8); },
  masjidali(c, x, G) { R(c, '#9a4a36', x + 96, G - 6, 224, 6); for (let i = 0; i < 11; i++) { if (i === 3 || i === 4) continue; CIRC(c, OUT, x + 100 + i * 20, G - 9, 6); CIRC(c, '#5f8f3c', x + 100 + i * 20, G - 9, 5); CIRC(c, '#7fb04a', x + 98 + i * 20, G - 11, 2); }
    for (const bx of [x + 136, x + 182]) { BOX(c, '#1a1a1e', bx, G - 14, 4, 14); R(c, '#d9b05a', bx, G - 15, 4, 2); }
    BOX(c, '#b9bcc0', x + 40, G - 10, 46, 10); BOX(c, '#3a3d44', x + 48, G - 16, 30, 6); for (let i = 0; i < 6; i++) R(c, i % 2 ? '#7fa7c4' : '#e8e8e8', x + 42 + i * 7, G - 8, 4, 4);
    const px = x + 62; BOX(c, '#2a2a2e', px - 2, G - 40, 4, 24); for (let i = 0; i < 5; i++) BOX(c, '#d6d9de', px - 3, G - 58 - i * 8, 6, 6); R(c, '#e0458a', px - 3, G - 22, 6, 3); R(c, '#e8a33c', px - 4, G - 19, 8, 3);
    R(c, '#c9ccd0', px - 1, G - 120, 2, 64); CIRC(c, OUT, px, G - 116, 10); CIRC(c, '#e8eaee', px, G - 116, 9); CIRC(c, '#c9ccd0', px, G - 116, 6);
    BOX(c, '#e8eaee', px - 5, G - 136, 10, 14); for (let i = 0; i < 4; i++) R(c, '#e8eaee', px - 5 + i * 3, G - 142, 2, 6); R(c, '#e8eaee', px + 6, G - 132, 2, 6);
    c.font = '700 12px Amiri'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#eef0f2'; c.fillText('الله', px, G - 150);
  },   // the green flag on this pole is drawn (waving) in LM_ANIM.masjidali
  karwan(c, x, G) { R(c, '#c96a5a', x - 6, G - 3, 242, 3); },
  lewsey(c, x, G) { for (let i = 0; i < 4; i++) R(c, '#6a4a34', x - 14, G - 4 - i * 4, 36, 2); R(c, '#f2c14e', x + 8, G - 22, 30, 2); for (const px of [x + 8, x + 22, x + 36]) R(c, '#f2c14e', px, G - 22, 2, 22);
    BOX(c, '#2f6fb5', x + 24, G - 42, 10, 12); R(c, '#ffffff', x + 27, G - 39, 4, 4); R(c, '#f2c14e', x + 40, G - 2, 80, 2); for (let i = 0; i < 6; i++) R(c, '#f2c14e', x + 44 + i * 13, G - 2, 1, 2); },
  stmarys(c, x, G) { R(c, '#6fbf4a', x - 10, G - 4, 320, 4); for (const gx of [x + 40, x + 80, x + 130, x + 186, x + 268, x + 278]) { BOX(c, '#8f8b80', gx, G - 14, 6, 14); R(c, '#8f8b80', gx + 1, G - 15, 4, 1); }
    TREE(c, x - 2, G, 1.3, '#4f8a3c', '#3a6b2c'); CIRC(c, OUT, x + 270, G - 12, 13); CIRC(c, '#3f7d33', x + 270, G - 12, 12); R(c, '#5a3d2a', x + 160, G - 24, 2, 24); CIRC(c, '#7fbf4a', x + 154, G - 30, 7); CIRC(c, '#7fbf4a', x + 168, G - 28, 6); },
  chaiikhana(c, x, G) { const CONE = (cx) => { P(c, '#f4c430', [[cx, G], [cx + 4, G - 12], [cx + 8, G]], true); CIRC(c, '#2f4fa8', cx + 4, G - 5, 2); R(c, '#d32f2f', cx + 2, G - 5, 5, 1); BOX(c, '#3a3d44', cx - 1, G - 2, 10, 2); };
    BIN(c, x + 70, G, '#1a1a1e'); PERSON(c, x + 34, G, '#22252a', '#7f9ab8', '#c58c5c', '#3a3d44'); },
  chiltern(c, x, G) { const HEDGE = (hx, w, h) => { BOX(c, '#c5b13a', hx, G - h, w, h); for (let i = 0; i < w * h / 6; i++) R(c, (i % 3) ? '#a99a28' : '#e2cf58', hx + (i * 13) % w, G - h + (i * 7) % h, 2, 2); };
    HEDGE(x - 10, 130, 12); HEDGE(x + 240, 120, 12); BOX(c, '#2a2c33', x + 120, G - 6, 6, 6); BOX(c, '#2a2c33', x + 234, G - 6, 6, 6);
    P(c, '#5f8f2c', [[x + 266, G - 12], [x + 280, G - 70], [x + 294, G - 12]]); for (let i = 0; i < 8; i++) R(c, '#a8b83a', x + 274 + (i * 5) % 14, G - 60 + i * 6, 2, 2);
    CIRC(c, OUT, x + 330, G - 30, 19); CIRC(c, '#4f8a3c', x + 330, G - 30, 18); CIRC(c, '#6faa4e', x + 324, G - 36, 9); R(c, '#9aa3ad', x + 304, G - 40, 2, 28); CIRC(c, '#e8e8e8', x + 305, G - 42, 3); PERSON(c, x + 160, G, '#2f4a8a'); },
  venue(c, x, G) { R(c, '#d9cdb6', x - 6, G - 2, 232, 2); const POT = (px, col, h, leaf) => { BOX(c, col, px, G - 7, 8, 7); R(c, '#5a3d2a', px + 3, G - 7 - h, 2, h); CIRC(c, leaf, px + 4, G - 9 - h, 6); };
    POT(x + 60, '#2a2a2e', 18, '#a84a3a'); POT(x + 146, '#2a2a2e', 18, '#b2402e'); POT(x + 34, '#f0ede6', 8, '#5f8f3c'); POT(x + 164, '#e8e3d8', 6, '#6faa4e'); BOX(c, '#2a2a2e', x + 180, G - 8, 18, 8); for (let i = 0; i < 5; i++) CIRC(c, i % 2 ? '#f4f2ec' : '#5f8f3c', x + 183 + i * 3, G - 10, 2); PERSON(c, x + 100, G, '#2a2a33', '#1a1a1e', '#c58c5c', '#1a1a1e'); },
  currys(c, x, G) { TREE(c, x + 60, G, 1.1, '#6faa3e', '#4f8a2c'); TREE(c, x + 300, G, 1.4, '#7fb04a', '#5a8a34'); CAR(c, x + 130, G, '#c9ced4'); CAR(c, x + 200, G, '#8a9aaa'); PERSON(c, x + 120, G, '#3a3d44'); PERSON(c, x + 176, G, '#5a6e8a'); for (let i = 0; i < 6; i++) BOLL(c, x + 6 + i * 10, G); },
  tesco(c, x, G) { for (const cx of [x + 8, x + 30, x + 140, x + 196]) { P(c, '#e8641c', [[cx, G], [cx + 3, G - 12], [cx + 6, G]], true); R(c, '#ffffff', cx + 1, G - 6, 4, 2); } for (const bx of [x + 118, x + 228, x + 234]) BOLL(c, bx, G); BIN(c, x + 104, G, '#2f6fb5'); PERSON(c, x + 92, G, '#5a6e8a'); },
  masjid(c, x, G) { TREE(c, x - 26, G, 1.3, '#5f8f3c', '#47702c'); PERSON(c, x + 72, G, '#f4f2ec', '#f4f2ec', '#c58c5c', '#f4f2ec'); PERSON(c, x + 80, G, '#3a6e5a', '#2a2a33', '#c58c5c', '#f4f2ec'); PERSON(c, x + 196, G, '#2a2a33', '#f4f2ec', '#c58c5c', '#1a1a1e'); BIN(c, x + 150, G); },
  galaxy(c, x, G) { R(c, 'rgba(0,0,0,.16)', x + 4, G - 140, 14, 96); R(c, 'rgba(0,0,0,.08)', x + 18, G - 140, 10, 96); R(c, 'rgba(0,0,0,.18)', x + 180, G - 140, 16, 96); R(c, 'rgba(255,255,255,.12)', x + 60, G - 140, 30, 96);
    BOX(c, '#c9ced4', x + 6, G - 140, 188, 8); for (let i = 0; i < 24; i++) R(c, '#a9aeb4', x + 8 + i * 8, G - 139, 1, 6);
    SHELTER(c, x + 92, G); POSTBOX(c, x + 132, G); BIN(c, x + 128 + 18, G); PERSON(c, x + 22, G, '#d8262f'); PERSON(c, x + 170, G, '#6a4c93'); },
  townhall(c, x, G) {
    for (let i = 0; i < 9; i++) { const lx = 4 + i * 22; if ((lx > 74 && lx < 126) || (lx > 140 && lx < 180)) continue; R(c, '#d6ccb6', x + lx, G - 92, 1, 92); } // wall lines, kept off the portico and the statue
    FLOWERS(c, x + 30, G, 40); FLOWERS(c, x + 172, G, 26); CAR(c, x - 34, G, '#1a1a1e'); R(c, '#f2c14e', x - 24, G - 13, 6, 2); LAMP(c, x + 6, G, 56); PERSON(c, x + 178, G, '#2f4a8a'); PERSON(c, x + 186, G, '#e8e0cf', '#3a3a44'); BIN(c, x + 128, G); },
  letters(c, x, G) { for (let i = 0; i < 10; i++) R(c, '#a8a59c', x + i * 19, G - 6, 1, 6); BOX(c, '#c58f52', x - 20, G - 14, 20, 14); R(c, '#a8743e', x - 20, G - 9, 20, 1); BOX(c, '#c58f52', x + 172, G - 12, 22, 12);
    PERSON(c, x + 58, G - 4, '#1a1a1e', '#2a2a33', '#e2b38a', '#f4f2ec'); PERSON(c, x + 66, G - 4, '#5a6e8a', '#5a6e8a', '#e2b38a', '#e8c766');  },
  frasers(c, x, G) { BOX(c, '#2bb3c8', x + 6, G - 16, 26, 14); R(c, '#ffffff', x + 9, G - 13, 20, 3); CIRC(c, OUT, x + 12, G - 2, 2); CIRC(c, OUT, x + 26, G - 2, 2); FLOWERS(c, x + 92, G, 22); TREE(c, x + 160, G, .9); PERSON(c, x + 40, G, '#d84b6a'); PERSON(c, x + 100, G - 6, '#3a6ea5'); PERSON(c, x + 130, G, '#f2c14e'); },
  hatfactory(c, x, G) { LAMP(c, x + 164, G, 120); for (let i = 0; i < 9; i++) P(c, i % 2 ? '#4f8a3c' : '#6faa4e', [[x + 120, G - 2], [x + 112 + i * 3, G - 22 - (i % 3) * 4], [x + 124, G - 2]]); BOX(c, '#4a2f25', x + 104, G - 4, 34, 4);
    for (let i = 0; i < 4; i++) { BOX(c, '#e8641c', x - 30 + i * 10, G - 10, 9, 8); R(c, '#ffffff', x - 30 + i * 10, G - 7, 9, 2); } BOX(c, '#d8262f', x + 86, G - 22, 8, 8); R(c, '#2f6fb5', x + 88, G - 14, 3, 14); R(c, '#f2c14e', x + 82, G - 14, 16, 2); PERSON(c, x + 66, G, '#3a3d44'); PERSON(c, x + 150, G, '#e0558c'); BIN(c, x + 40, G); },
  chaiiwala(c, x, G) { for (const bx of [x + 180, x + 206, x + 232]) BOLL(c, bx, G); R(c, '#c96a4a', x + 130, G - 3, 160, 3); },
  nadeem(c, x, G) { R(c, '#c25a3c', x - 6, G - 3, 162, 3); for (let i = 0; i < 20; i++) R(c, '#a84a30', x - 4 + i * 8, G - 3, 1, 3);
    for (const bx of [x + 2, x + 132, x + 142]) BOX(c, '#1a1a1e', bx, G - 12, 3, 12);
    PERSON(c, x + 66, G, '#1a1a1e', '#1a1a1e', '#c58c5c', '#1a1a1e'); PERSON(c, x + 74, G, '#1a1a1e', '#1a1a1e', '#c58c5c', '#1a1a1e'); PERSON(c, x + 120, G, '#7a6a4a', '#2a2a33'); PERSON(c, x + 26, G, '#3a3d44');
    BOX(c, '#5a4030', x + 104, G - 7, 12, 2); R(c, '#5a4030', x + 105, G - 5, 1, 5); R(c, '#5a4030', x + 114, G - 5, 1, 5); },
  oak(c, x, G) { BIN(c, x + 26, G, '#3a3d44'); BIN(c, x + 36, G, '#3a3d44'); BRICK(c, x + 2, G - 12, 26, 12); BRICK(c, x + 178, G - 14, 8, 14);
    PERSON(c, x + 118, G, '#b8292f', '#1a1a1e', '#c58c5c', '#1a1a1e'); P(c, '#e8641c', [[x + 160, G], [x + 164, G - 12], [x + 168, G]], true); R(c, '#ffffff', x + 162, G - 6, 4, 2);
    for (let i = 0; i < 6; i++) R(c, '#f4f2ec', x + 12 + i * 34, G - 74, 18, 2); for (const tx of [x + 72, x + 150]) { BOX(c, '#e8e0cf', tx, G - 44, 12, 4); } },
  periperi(c, x, G) { for (let i = 0; i < 6; i++) CIRC(c, '#fff4cc', x + 74 + i * 18, G - 47, 1); for (let i = 0; i < 5; i++) { BOX(c, '#22252b', x + 76 + i * 20, G - 44, 16, 6); R(c, i % 2 ? '#e0281a' : '#f2c14e', x + 78 + i * 20, G - 42, 12, 2); }
    R(c, '#f4f6c8', x + 178, G - 56, 3, 3); BOX(c, '#e8e8e8', x + 66, G - 124, 6, 6); R(c, '#e0a020', x + 152, G - 124, 6, 8); CAR(c, x + 168, G, '#1f2430'); R(c, 'rgba(255,60,40,.25)', x + 64, G - 82, 116, 18); },
  krispy(c, x, G) {
    for (let i = 0; i < 6; i++) R(c, '#e7c35a', x + 60 + i * 16, G - 40, 10, 1); R(c, '#4caf50', x + 100, G - 26, 6, 6); },
  uob(c, x, G) { R(c, '#5f9e3c', x + 80, G - 6, 110, 6); R(c, '#4f8a33', x + 84, G - 2, 100, 2); for (let i = 0; i < 9; i++) BOLL(c, x + 86 + i * 12, G); BIRCH(c, x + 30, G); BIRCH(c, x + 96, G); PERSON(c, x + 150, G - 6, '#1a1a1e'); },
  sixthform(c, x, G) { LAMP(c, x - 6, G, 80); for (let i = 0; i < 6; i++) R(c, '#2e8b57', x + 2 + i * 4, G - 26, 2, 26); R(c, '#2e8b57', x + 2, G - 26, 24, 2); P(c, '#e8e8e8', [[x - 2, G - 64], [x + 46, G - 64], [x + 40, G - 58], [x + 4, G - 58]], true);
    PERSON(c, x + 40, G, '#9aa3ad', '#2a2a33'); PERSON(c, x + 74, G, '#3a6ea5'); PERSON(c, x + 120, G, '#5a3a2e', '#1a1a1e', '#c58c5c', '#1f6f6a'); PERSON(c, x + 166, G, '#2f4a8a'); BIN(c, x + 128, G, '#8a9098'); BIN(c, x + 98, G, '#8a9098'); for (let i = 0; i < 3; i++) P(c, i === 1 ? '#d8262f' : '#f4f2ec', [[x + 174 + i * 7, G - 64], [x + 180 + i * 7, G - 72], [x + 183 + i * 7, G - 72], [x + 177 + i * 7, G - 64]]); },
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
    BOX(c, '#9aa3ad', x + 320, G - 54, 40, 54); for (let i = 0; i < 12; i++) R(c, '#868e98', x + 320, G - 52 + i * 4, 40, 1); R(c, '#c9ced4', x + 368, G - 120, 3, 120); BOX(c, '#d64545', x + 300, G - 50, 6, 10);
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
    c.globalAlpha = .55; 'GALAXY'.split('').forEach((ch, i) => T(c, ch, x + 11 + i * 20, G - 90, 12, '#ffffff', 'center', true)); c.globalAlpha = 1;
    R(c, 'rgba(255,255,255,.5)', x + 20, G - 80, 30, 1); R(c, 'rgba(255,255,255,.5)', x + 64, G - 86, 1, 12); R(c, 'rgba(255,255,255,.5)', x + 96, G - 76, 22, 1); CIRC(c, '#ffffff', x + 120, G - 88, 1.5);
    R(c, '#6f7a84', x, G - 70, WW, 2);
    for (let i = 0; i < 5; i++) { const bx = x + 12 + i * 24;
      BOX(c, '#ece0c4', bx, G - 66, 12, 8); R(c, '#1a1c21', bx, G - 58, 12, 30); for (let k = 0; k < 3; k++) R(c, '#262930', bx, G - 50 + k * 8, 12, 1);   // black panels down to the bottom of the banners
      R(c, '#5c6670', bx, G - 28, 12, 5);
      R(c, '#7f9bb0', bx, G - 23, 12, 23); R(c, '#9db6c8', bx, G - 23, 12, 2); R(c, '#2a3542', bx, G - 23, 12, 1); for (const v of [3, 8]) R(c, '#2a3542', bx + v, G - 23, 1, 23);
      if (i === 2) { BOX(c, '#1f6fd6', bx - 1, G - 29, 14, 6); CIRC(c, '#8ad646', bx + 2, G - 26, 1.6); R(c, '#ffffff', bx + 5, G - 27, 6, 1); R(c, '#ffffff', bx + 5, G - 25, 5, 1);
        R(c, '#3a4552', bx + 1, G - 22, 10, 22); R(c, '#9db6c8', bx + 2, G - 21, 3.5, 20); R(c, '#9db6c8', bx + 6.5, G - 21, 3.5, 20); R(c, '#c9ced4', bx + 5, G - 12, 2, 3); }
      else { R(c, '#2a2f38', bx + 2, G - 8, 7, 2); R(c, '#2a2f38', bx + 7, G - 12, 2, 4); R(c, '#8ad646', bx + 1, G - 18, 4, 1); } }
    for (let i = 0; i < 6; i++) { const px = x + i * 24; R(c, '#d9c3ac', px, G - 68, 12, 68); R(c, '#e8d6c2', px, G - 68, 2, 68); R(c, '#c3ab94', px + 10, G - 68, 2, 68); for (let j = 0; j < 8; j++) R(c, '#5a5f6e', px, G - 62 + j * 8, 12, 1); R(c, '#4a4f5c', px, G - 12, 12, 12); }
    for (const px of [x + 24, x + 72]) { BOX(c, '#1f6fd6', px + 1, G - 60, 10, 30); CIRC(c, '#8ad646', px + 6, G - 55, 3); CIRC(c, '#1f6fd6', px + 6, G - 55, 1.6); for (let j = 0; j < 4; j++) R(c, '#ffffff', px + 5, G - 50 + j * 4, 2, 2); }
    for (const bx of [x + 17, x + 89]) { R(c, '#2a9a8a', bx, G - 10, 2, 10); R(c, '#2a9a8a', bx - 1, G - 11, 4, 2); }
  } },
  frasers: { w: 210, dx: 40, pre(c, x, G) {
    BOX(c, '#4f86a8', x, G - 140, 60, 140); for (let i = 0; i < 3; i++) for (let j = 0; j < 7; j++) R(c, (i + j) % 3 ? '#5e95b8' : '#76aacb', x + 2 + i * 20, G - 138 + j * 20, 18, 18);
    BOX(c, '#9aa3ad', x + 4, G - 30, 50, 30); for (let i = 0; i < 6; i++) R(c, '#868e98', x + 4, G - 28 + i * 5, 50, 1);
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
  spudkingz(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    c.font = '700 12px Silk'; c.textBaseline = 'middle'; const w1 = c.measureText('Spud ').width, w2 = c.measureText('Kingz').width, sx0 = Math.round(X(110) - (w1 + w2) / 2);
    R(c, '#141416', sx0 + 3, Y(105), Math.round(w1 + w2) - 6, 2);
    c.textAlign = 'left'; c.strokeStyle = '#0a0a0c'; c.lineWidth = 2; c.lineJoin = 'round'; c.strokeText('Spud', sx0, Y(103)); c.strokeText('Kingz', sx0 + w1, Y(103)); c.fillStyle = '#5fd36a'; c.fillText('Spud', sx0, Y(103)); c.fillStyle = '#f6c933'; c.fillText('Kingz', sx0 + w1, Y(103));
    BOX(c, '#141416', X(30), Y(40), Math.round(160 * f), Math.round(22 * f)); c.textAlign = 'center'; c.font = '7px Silk'; c.fillStyle = '#d9b05a'; c.fillText('CROWNED IN FLAVOUR', X(112), Y(34)); c.fillText('ROOTED IN COMMUNITY', X(112), Y(26)); },
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
  chaiikhana(c, x, G, f) { const X = v => Math.round(x + v * f), Y = v => Math.round(G - v * f);
    BOX(c, '#151618', X(-4), Y(88), Math.round(96 * f), 17); T(c, 'CHAIIKHANA', X(44), Y(88) + 4, 8, '#f4f4f2', 'center', true);
    T(c, 'ORDER', X(34), Y(30) + 2, 8, '#e0458a', 'center', true); },
};
const SCALE = { masjid: 1.1, suffa: .9, oak: .82, chaiikhana: .85, spudkingz: .64, nadeem: 1.2, chaiiwala: 1.1, frasers: 1.3, stmarys: 1.02, hatfactory: 1.3 };
Object.keys(SCALE).forEach(k => { const f = SCALE[k], d0 = L[k].d, w0 = L[k].w, M = 80, H = 320; L[k].w = Math.round(w0 * f);
  L[k].d = (c, x, G) => { const oc = document.createElement('canvas'); oc.width = w0 + M * 2; oc.height = H; const o = oc.getContext('2d'); d0(o, M, H - 10);
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(oc, 0, 0, oc.width, H - 10, x - M * f, G - (H - 10) * f, oc.width * f, (H - 10) * f); c.restore(); if (SHARP[k]) SHARP[k](c, x, G, f); }; });

/* ---------- in-between houses (not landmarks) ---------- */
const HOUSES = {};
const ROOF = (c, x, G, w, h, top, col = '#5a4e48') => { P(c, col, [[x - 3, G - h], [x + w + 3, G - h], [x + w - 8, G - h - top], [x + 8, G - h - top]], true); for (let i = 1; i < top / 4; i++) R(c, SH(col, .86), x + 4 + i, G - h - i * 4, w - 8 - i * 2, 1); };
const CHIM = (c, x, y) => { BRICK(c, x, y, 14, 22, '#9a4a36', '#844030'); R(c, OUT, x - 1, y - 1, 16, 1); for (let i = 0; i < 3; i++) { BOX(c, '#c86a4a', x + 1 + i * 5, y - 6, 3, 6); } };
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
  for (let k = 0; k < n; k += 2) CHIM(c, x + k * 58 + 50, G - 98);
  R(c, '#3a3d44', x + 56, G - 120, 1, 24); R(c, '#3a3d44', x + 50, G - 118, 13, 1); R(c, '#3a3d44', x + 52, G - 114, 9, 1);
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
// green flag on the Masjid-e-Ali alam pole, black writing on it, waving as you fly past
window.LM_ANIM.masjidali = (c, x, G, t) => { const fx = x + 63, N = 32;
  for (let i = 0; i < N; i++) { const k = i / (N - 1), dy = Math.sin(t * 4.5 - i * .32) * 2.4 * k, top = G - 104 + i * .2 + dy, h = 24 - i * .12;
    c.fillStyle = OUT; c.fillRect(fx + i, top - 1, 1, h + 2); c.fillStyle = (i >> 2) % 2 ? '#1f8f3a' : '#23994a'; c.fillRect(fx + i, top, 1, h);
    c.fillStyle = '#101012'; if (i > 3 && i < N - 3) { if ((i * 5) % 7 < 4) c.fillRect(fx + i, top + 6 + ((i * 3) % 3), 1, 1); if ((i * 7) % 9 < 5) c.fillRect(fx + i, top + 11 + ((i * 2) % 3), 1, 1); if (i % 6 === 2) c.fillRect(fx + i, top + 5, 1, 9); if ((i * 11) % 13 < 5) c.fillRect(fx + i, top + 16 + (i % 2), 1, 1); } }
  c.fillStyle = '#e8eaee'; c.fillRect(fx - 2, G - 105, 2, 26); };
window.LM_ANIM.wardown = (c, x, G, t) => {
  WATER(c, x, G, 210, t); for (const dx of [x + 20 + Math.sin(t * .7) * 6, x + 150 - Math.sin(t * .5) * 8]) { R(c, '#f4f2ec', Math.round(dx), G - 9, 5, 3); R(c, '#2e7d32', Math.round(dx) + 4, G - 11, 2, 2); }
  c.save(); c.beginPath(); c.rect(x, G - 16, 210, 16); c.clip();
  // pedalo boat gliding back and forth, bobbing on the water
  const span = 150, ph = (t * 14) % (span * 2), dir = ph < span ? 1 : -1, bx = Math.round(x + 8 + (ph < span ? ph : span * 2 - ph)), by = Math.round(G - 12 + Math.sin(t * 3) * 1);
  R(c, 'rgba(255,255,255,.55)', bx - dir * 6 + (dir < 0 ? 22 : 0), by + 6, 8, 1); R(c, 'rgba(255,255,255,.35)', bx - dir * 12 + (dir < 0 ? 22 : 0), by + 7, 6, 1);
  c.restore();
  PERSON0(c, bx + 5, by + 5, '#e8641c', '#2a2a33'); PERSON0(c, bx + 16, by + 5, '#2a2a33', '#2a2a33', '#e2b38a');
  BOX(c, '#2f7fd0', bx, by, 26, 7); R(c, '#1f5fa8', bx + 1, by + 5, 24, 1); R(c, '#4fa0ea', bx + 1, by - 3, 4, 3); R(c, '#4fa0ea', bx + 21, by - 3, 4, 3); R(c, '#f4f2ec', bx + 11, by + 2, 4, 2);
};
window.LANDMARKS = L;
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
  BOX(c, '#e8641c', x, G - 40, 150, 36); for (const [gx, gw] of [[x + 4, 44], [x + 70, 76]]) { R(c, '#a9c3cf', gx, G - 37, gw, 31); R(c, '#cfe0e8', gx + 2, G - 35, 6, 27); R(c, '#cfe0e8', gx + 10, G - 35, 2, 27); }
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
  CIRC(c, '#356b40', x + 30, G - 52, 26); CIRC(c, '#2f5f3a', x + 168, G - 58, 30); TREE(c, x + 100, G - 4, 1.5, '#5f9a3e', '#4a7f30');
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
  CIRC(c, '#2f5f3a', x + 150, G - 56, 30); CIRC(c, '#356b40', x + 14, G - 50, 26);
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

window.LM_ORDER = ['galaxy', 'townhall', 'stmarys', 'letters', 'frasers', 'station', 'hatfactory', 'chaiiwala', 'chaiikhana', 'spudkingz', 'miamicrispy', 'masjid', 'masjidali', 'suffa', 'gurdwara', 'ldh', 'foodbank', 'inspire', 'nadeem', 'oak', 'periperi', 'toros', 'gna', 'topspizza', 'alquds', 'kaya', 'karwan', 'krispy', 'tesco', 'currys', 'bandq', 'matalan', 'lidl', 'jdgyms', 'bigyellow', 'grandbazar', 'lewsey', 'venue', 'chiltern', 'uob', 'sixthform', 'wardownfield', 'wardown', 'wardownbridge', 'funfair', 'stockwood', 'welcome', 'airport'];
})();
