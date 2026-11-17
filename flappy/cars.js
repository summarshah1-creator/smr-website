/* Side-on pixel cars, facing right, wheels on y = G. Same outline and light as the landmarks. */
(function () {
const OUT = '#1b1a24';
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const P = (c, col, pts) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = OUT; c.lineWidth = 1; c.stroke(); };
const CIRC = (c, col, cx, cy, r) => { for (let dy = -r; dy <= r; dy++) { const dx = Math.round(Math.sqrt(r * r - dy * dy)); R(c, col, cx - dx, cy + dy, dx * 2 + 1, 1); } };
const WHEEL = (c, cx, G, r, rim, spokes, cal) => { CIRC(c, OUT, cx, G - r, r + 1); CIRC(c, '#121214', cx, G - r, r); CIRC(c, rim, cx, G - r, r - 3); if (cal) R(c, cal, cx + 2, G - r - 4, 3, 7);
  for (let i = 0; i < spokes; i++) { const a = i * 2 * Math.PI / spokes; for (let t = 2; t < r - 3; t++) R(c, '#3a3d44', cx + Math.cos(a) * t, G - r + Math.sin(a) * t, 1, 1); } CIRC(c, '#4a4d54', cx, G - r, 2); };
const C = {};

/* Rolls-Royce Cullinan: tall boxy SUV, upright grille at the front, long flat roof */
const cullinan = (body, dark, stripe) => ({ w: 104, d(c, x, G) {
  R(c, 'rgba(0,0,0,.22)', x + 4, G - 2, 98, 3);
  P(c, body, [[x + 2, G - 10], [x + 2, G - 30], [x + 8, G - 34], [x + 18, G - 52], [x + 70, G - 53], [x + 80, G - 36], [x + 100, G - 33], [x + 103, G - 28], [x + 103, G - 10]]);
  R(c, 'rgba(255,255,255,.12)', x + 20, G - 51, 50, 2);
  P(c, '#20232a', [[x + 12, G - 34], [x + 20, G - 49], [x + 68, G - 50], [x + 77, G - 36]]); R(c, body, x + 36, G - 50, 3, 16); R(c, body, x + 56, G - 50, 3, 16); R(c, 'rgba(255,255,255,.25)', x + 64, G - 48, 2, 10);
  R(c, dark, x + 2, G - 14, 101, 5); R(c, '#2a2c30', x + 22, G - 15, 54, 2);
  if (stripe) R(c, stripe, x + 10, G - 32, 86, 1);
  R(c, '#121214', x + 99, G - 31, 4, 16); for (let i = 0; i < 3; i++) R(c, '#3a3d44', x + 100, G - 29 + i * 5, 3, 1);
  R(c, '#d8e4f0', x + 92, G - 30, 6, 3); R(c, '#e8e8e8', x + 101, G - 36, 1, 3); R(c, '#2a2c30', x + 70, G - 37, 6, 4);
  R(c, '#c83a2a', x + 2, G - 30, 2, 8); R(c, '#2a2c30', x + 44, G - 30, 6, 1); R(c, '#2a2c30', x + 64, G - 30, 6, 1);
  WHEEL(c, x + 22, G, 12, '#1d1f24', 10); WHEEL(c, x + 84, G, 12, '#1d1f24', 10);
} });
C.cullinanMatte = Object.assign(cullinan('#77767a', '#4e4e52', '#e8892a'), { n: 'Cullinan (matte grey)' });
C.cullinanGrey = Object.assign(cullinan('#b9b8c0', '#8e8d96', null), { n: 'Cullinan (light grey)' });

/* Mercedes-AMG A35: yellow hot hatch. Real proportions: long low body, short overhangs, wheels ~1/3 of height. */
C.amg = { n: 'AMG A35 (yellow)', w: 104, d(c, x, G) {
  const Y = '#f6d21a', Yd = '#cfa90a', Yl = '#fde88a';
  R(c, 'rgba(0,0,0,.25)', x + 6, G - 2, 94, 3);
  P(c, Y, [[x + 3, G - 6], [x + 2, G - 20], [x + 6, G - 25], [x + 22, G - 36], [x + 58, G - 37], [x + 72, G - 25], [x + 96, G - 21], [x + 102, G - 16], [x + 102, G - 6]]);
  P(c, '#141416', [[x + 22, G - 36], [x + 58, G - 37], [x + 60, G - 35], [x + 22, G - 34]]);
  P(c, '#141416', [[x + 2, G - 30], [x + 18, G - 33], [x + 18, G - 31], [x + 6, G - 28]]); R(c, '#141416', x + 8, G - 28, 2, 3);
  P(c, '#1a1c22', [[x + 12, G - 26], [x + 23, G - 34], [x + 57, G - 34], [x + 69, G - 25]]); R(c, Y, x + 38, G - 34, 2, 9); R(c, '#141416', x + 12, G - 26, 57, 1); R(c, 'rgba(255,255,255,.3)', x + 60, G - 32, 2, 5);
  R(c, Yl, x + 20, G - 24, 74, 1); R(c, Yd, x + 4, G - 13, 96, 2); R(c, '#141416', x + 26, G - 8, 50, 2);
  R(c, '#c8202a', x + 2, G - 21, 3, 3); R(c, '#e8eef4', x + 92, G - 20, 8, 2); R(c, '#141416', x + 97, G - 15, 5, 7); R(c, '#141416', x + 64, G - 26, 5, 3);
  R(c, '#a88908', x + 30, G - 20, 4, 1); R(c, '#a88908', x + 50, G - 20, 4, 1); R(c, '#a88908', x + 44, G - 25, 1, 17);
  for (const wx of [x + 20, x + 84]) { c.save(); c.beginPath(); c.rect(wx - 12, G - 22, 24, 13); c.clip(); CIRC(c, OUT, wx, G - 8, 11); CIRC(c, '#0e0f12', wx, G - 8, 10); c.restore(); }
  WHEEL(c, x + 20, G, 8, '#18191c', 10, '#c8202a'); WHEEL(c, x + 84, G, 8, '#18191c', 10, '#c8202a');
} };

/* Audi RS3 saloon: green, longer, lower, with a boot. */
C.rs3 = { n: 'RS3 saloon (green)', w: 112, d(c, x, G) {
  const Gr = '#55c91e', Gd = '#3a9a12', Gl = '#9be86a';
  R(c, 'rgba(0,0,0,.25)', x + 6, G - 2, 102, 3);
  P(c, Gr, [[x + 3, G - 6], [x + 2, G - 20], [x + 6, G - 23], [x + 22, G - 25], [x + 32, G - 35], [x + 66, G - 36], [x + 80, G - 25], [x + 104, G - 21], [x + 110, G - 16], [x + 110, G - 6]]);
  P(c, '#141416', [[x + 32, G - 35], [x + 66, G - 36], [x + 68, G - 34], [x + 32, G - 33]]); R(c, '#141416', x + 4, G - 24, 10, 2);
  P(c, '#1a1c22', [[x + 24, G - 25], [x + 33, G - 33], [x + 65, G - 33], [x + 77, G - 25]]); R(c, Gr, x + 48, G - 33, 2, 8); R(c, '#141416', x + 24, G - 25, 53, 1); R(c, 'rgba(255,255,255,.3)', x + 68, G - 31, 2, 5);
  R(c, Gl, x + 10, G - 23, 92, 1); R(c, Gd, x + 4, G - 13, 104, 2); R(c, '#141416', x + 28, G - 8, 52, 2);
  R(c, '#c8202a', x + 2, G - 20, 3, 3); R(c, '#e8eef4', x + 98, G - 20, 10, 2); R(c, '#141416', x + 104, G - 16, 6, 9); for (let i = 0; i < 3; i++) R(c, '#2e3138', x + 105, G - 15 + i * 3, 4, 1);
  R(c, '#141416', x + 72, G - 26, 5, 3); R(c, '#2f6f12', x + 40, G - 19, 4, 1); R(c, '#2f6f12', x + 60, G - 19, 4, 1); R(c, '#2f6f12', x + 53, G - 25, 1, 17);
  for (const wx of [x + 22, x + 90]) { c.save(); c.beginPath(); c.rect(wx - 12, G - 22, 24, 13); c.clip(); CIRC(c, OUT, wx, G - 8, 11); CIRC(c, '#0e0f12', wx, G - 8, 10); c.restore(); }
  WHEEL(c, x + 22, G, 8, '#18191c', 5, '#c8202a'); WHEEL(c, x + 90, G, 8, '#18191c', 5, '#c8202a');
  for (const cx of [x + 22, x + 90]) for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5; R(c, '#d8dce2', cx + Math.cos(a) * 5, G - 8 + Math.sin(a) * 5, 1, 1); }
} };
window.CARS = C; window.CAR_ORDER = ['cullinanMatte', 'cullinanGrey', 'amg', 'rs3'];
})();
