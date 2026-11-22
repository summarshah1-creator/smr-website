/* Road vehicles v3, drawn at game size (1 unit = 1 game pixel), facing right, wheels on y = G.
   VEHICLES[key] = { n, w, h, weight (how often it appears), speed [min,max], colours: [[name, body, extra?]...], d(c, x, G, col) } */
(function () {
const OUT = '#1b1a24';
const path = (c, pts) => { c.beginPath(); pts.forEach((p, i) => { if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath(); };
const fill = (c, col, pts, line = true) => { path(c, pts); c.fillStyle = col; c.fill(); if (line) { c.strokeStyle = OUT; c.lineWidth = 1; c.stroke(); } };
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const disc = (c, col, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.fill(); };
const SH = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [f(n >> 16), f(n >> 8 & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
const wheel = (c, x, G, r, rim, cal, spokes = 5, ring) => { if (window.__WREC) { const T = c.getTransform(), p = T.transformPoint(new DOMPoint(x, G - r)); window.__WREC.push({ x: p.x, y: p.y, r: r * Math.hypot(T.a, T.b), rim, spokes, ring }); }
  disc(c, 'rgba(0,0,0,.25)', x, G, r * .9); disc(c, OUT, x, G - r, r + .8); disc(c, '#16171a', x, G - r, r); disc(c, rim, x, G - r, r * .64);
  if (ring) { c.strokeStyle = ring; c.lineWidth = .7; c.beginPath(); c.arc(x, G - r, r * .64, 0, 7); c.stroke(); }
  c.strokeStyle = SH(rim, .55); c.lineWidth = .8; for (let i = 0; i < spokes; i++) { const a = i * 2 * Math.PI / spokes - .3; c.beginPath(); c.moveTo(x, G - r); c.lineTo(x + Math.cos(a) * r * .6, G - r + Math.sin(a) * r * .6); c.stroke(); }
  if (cal) { c.fillStyle = cal; c.fillRect(x + r * .15, G - r - r * .42, r * .3, r * .62); } disc(c, '#5a5d66', x, G - r, r * .16); };
const arch = (c, x, G, r) => { c.beginPath(); c.arc(x, G - r + .5, r + 1.5, Math.PI, 0); c.closePath(); c.fillStyle = '#0d0e10'; c.fill(); };
const glass = (c, pts, tint = '#26303a') => { if (window.__GREC) { const T = c.getTransform(); window.__GREC.push(pts.map(([px, py]) => { const q = T.transformPoint(new DOMPoint(px, py)); return [q.x, q.y]; })); } fill(c, tint, pts); c.save(); path(c, pts); c.clip(); c.fillStyle = 'rgba(255,255,255,.2)'; const [x0, y0] = pts[0]; c.beginPath(); c.moveTo(x0 + 7, y0 - 20); c.lineTo(x0 + 12, y0 - 20); c.lineTo(x0 + 3, y0 + 10); c.lineTo(x0 - 2, y0 + 10); c.fill(); c.restore(); };
const shine = (c, x, y, w) => R(c, 'rgba(255,255,255,.28)', x, y, w, 1);
const person = (c, x, y, top, skin = '#c58c5c', helmet) => { R(c, top, x - 1.5, y, 3, 5); disc(c, helmet || skin, x, y - 1.5, helmet ? 2.2 : 1.6); };
const RS = (c, cx, cy, px, txt = 'MR RUSHED') => { c.font = `700 ${px}px Silk`; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(txt).width;
  c.lineWidth = px * .28; c.strokeStyle = '#ffffff'; c.lineJoin = 'round'; c.strokeText(txt, cx, cy);
  const g = c.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, '#2f7fe6'); g.addColorStop(.55, '#5a8ff0'); g.addColorStop(1, '#ff4f9a');
  c.save(); c.globalAlpha = .88; c.fillStyle = g; c.fillText(txt, cx, cy); c.restore(); };
const V = {};
const COMMON = [['Black', '#1e2024'], ['White', '#eceef2'], ['Silver', '#b9bec6'], ['Grey', '#6e737b'], ['Blue', '#2c4f8f'], ['Red', '#b8252a']];

/* Rolls-Royce Phantom: very long saloon, two-tone with dark upper body, upright chrome grille, short boot */
V.phantom = { n: 'Rolls-Royce Phantom', w: 74, h: 22, weight: 2, speed: [24, 40],
  colours: [['Black over silver', '#d7dade', '#16171a'], ['All black', '#1a1b1f', '#0e0f12'], ['Arctic white', '#f1f2f4', '#f1f2f4'], ['Midnight blue', '#1f2d4f', '#141c33'], ['Silver over black', '#1a1b1f', '#b9bec6']],
  d(c, x, G, [, low, top]) {
  arch(c, x + 14, G, 6.4); arch(c, x + 59, G, 6.4);
  fill(c, top, [[x + 1, G - 12], [x + 2, G - 15], [x + 9, G - 16.5], [x + 20, G - 23.5], [x + 30, G - 25.2], [x + 50, G - 25], [x + 58, G - 17.5], [x + 71.5, G - 16.5], [x + 72.5, G - 13], [x + 1, G - 13]]);
  fill(c, low, [[x + 1, G - 6], [x + 1, G - 13.5], [x + 72.5, G - 13.5], [x + 73.5, G - 11], [x + 73.5, G - 6], [x + 70, G - 4.5], [x + 3, G - 4.5]]);
  glass(c, [[x + 18, G - 17], [x + 23, G - 22.6], [x + 31, G - 23.8], [x + 49.5, G - 23.6], [x + 55.5, G - 17]], '#1a1d22'); R(c, top, x + 35.5, G - 24, 1.8, 7); R(c, top, x + 46, G - 24, 1.2, 7);
  R(c, '#d6dbe0', x + 18, G - 17.2, 37.5, .6); R(c, 'rgba(0,0,0,.3)', x + 35, G - 13, .7, 8); R(c, 'rgba(0,0,0,.25)', x + 21, G - 13, .7, 8); R(c, '#e8ecf0', x + 31, G - 11.8, 6, .8);
  R(c, '#e8ecf0', x + 1, G - 7, 72, .7); shine(c, x + 25, G - 24.8, 24); R(c, 'rgba(255,255,255,.25)', x + 4, G - 12.6, 66, .6);
  fill(c, '#eef1f4', [[x + 70.5, G - 15.8], [x + 73.6, G - 15.4], [x + 73.6, G - 8], [x + 70.5, G - 8]]); for (let i = 0; i < 3; i++) R(c, '#9aa2ab', x + 71.1 + i * .9, G - 15, .4, 6.5);
  R(c, '#fff8d8', x + 69, G - 14.2, 2, 2.4); R(c, '#e8ecf0', x + 71.6, G - 18, .7, 1.6); R(c, '#d42a2a', x + 1, G - 13, 1.6, 4.5);
  wheel(c, x + 14, G, 6, '#3a3d44', null, 8, '#d6dbe0'); wheel(c, x + 59, G, 6, '#3a3d44', null, 8, '#d6dbe0');
} };

/* Mercedes-AMG C63 Black Series coupé: low, wide arches, fastback, big carbon wing, red calipers */
V.c63 = { n: 'Mercedes-AMG C63 Black Series', w: 62, h: 21, weight: 2, speed: [40, 70],
  colours: [['Matte grey', '#9aa0a8'], ['Black', '#1e2024'], ['White', '#eceef2'], ['Fire red', '#c02028']],
  d(c, x, G, [, B]) { const D = SH(B, .8);
  arch(c, x + 12, G, 5.6); arch(c, x + 49, G, 5.6);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 13], [x + 4, G - 15.5], [x + 13, G - 16.5], [x + 20, G - 21.5], [x + 31, G - 22.5], [x + 40, G - 17.5], [x + 56, G - 15.5], [x + 60.5, G - 11.5], [x + 61, G - 6], [x + 58, G - 4], [x + 2, G - 4]]);
  glass(c, [[x + 16.5, G - 16.8], [x + 21, G - 20.8], [x + 30.6, G - 21.2], [x + 37.6, G - 16.8]], '#1a1d22'); R(c, '#141416', x + 25.5, G - 21, 1.4, 4.5);
  R(c, '#141416', x + 2, G - 21, 1, 5.5); R(c, '#141416', x + 9, G - 21, 1, 5); fill(c, '#202226', [[x - .5, G - 22.5], [x + 12, G - 22.5], [x + 11, G - 21], [x - .5, G - 21]], false);
  R(c, D, x + 1.5, G - 8, 59, 2.4); R(c, '#141416', x + 17, G - 5.4, 26, 1.2); shine(c, x + 20, G - 22, 10); shine(c, x + 4, G - 15, 52); R(c, 'rgba(0,0,0,.25)', x + 40, G - 14, .7, 8);
  R(c, '#d42a2a', x + 1, G - 13.5, 2.4, 2.4); R(c, '#e8ecf0', x + 56, G - 13.8, 4, 1.1); R(c, '#141416', x + 58, G - 9.5, 3, 4); R(c, '#141416', x + 59, G - 5, 3.5, 1);
  wheel(c, x + 12, G, 5.4, '#1b1c20', '#d42a2a', 10); wheel(c, x + 49, G, 5.4, '#1b1c20', '#d42a2a', 10);
} };

/* Mercedes G-Wagon: a brick on wheels, round headlights, spare wheel on the back */
V.gwagon = { n: 'Mercedes G-Wagon', w: 62, h: 33, weight: 3, speed: [28, 50],
  colours: [['Black', '#1e2024'], ['Matte black', '#2a2b2f'], ['White', '#eceef2'], ['Grey', '#7a7f87'], ['Olive', '#4d5a3a']],
  d(c, x, G, [, B]) {
  arch(c, x + 13, G, 6.3); arch(c, x + 48, G, 6.3);
  fill(c, B, [[x + 2, G - 5], [x + 2, G - 29], [x + 3, G - 31], [x + 41, G - 31], [x + 44, G - 21], [x + 59, G - 20.5], [x + 60, G - 18], [x + 60, G - 5]]);
  R(c, '#3a3d44', x + 3, G - 32.5, 37, 1.2); shine(c, x + 4, G - 30, 36);
  glass(c, [[x + 5, G - 21.5], [x + 5, G - 29], [x + 39.5, G - 29], [x + 42.5, G - 21.5]], '#2c3540'); R(c, B, x + 16, G - 29, 1.8, 7.5); R(c, B, x + 28, G - 29, 1.8, 7.5);
  R(c, '#2c2f35', x + 2.5, G - 13, 57, 3); R(c, '#55585f', x + 3, G - 13.5, 56, .7);
  disc(c, OUT, x + 1, G - 17, 5.4); disc(c, '#25272c', x + 1, G - 17, 4.6); disc(c, '#c9ced4', x + 1, G - 17, 1.6);
  disc(c, '#e8ecf0', x + 58, G - 17, 2.2); disc(c, '#fff8d8', x + 58, G - 17, 1.4); R(c, '#e8a33c', x + 53, G - 21.5, 3, 1.2); R(c, '#c9ced4', x + 58.5, G - 12, 2, 6);
  wheel(c, x + 13, G, 6, '#2a2c31', null, 5); wheel(c, x + 48, G, 6, '#2a2c31', null, 5);
} };

/* VW Golf hatchback */
V.golf = { n: 'VW Golf', w: 56, h: 20, weight: 8, speed: [30, 55], colours: COMMON.concat([['Lapiz blue', '#1f5fbf']]),
  d(c, x, G, [, B]) { const D = SH(B, .82);
  arch(c, x + 11, G, 5.3); arch(c, x + 44, G, 5.3);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 14], [x + 3, G - 16.5], [x + 7, G - 19.5], [x + 29, G - 20], [x + 39, G - 15.5], [x + 52, G - 14.2], [x + 54.5, G - 11], [x + 54.5, G - 5]]);
  glass(c, [[x + 8, G - 16], [x + 9, G - 18.4], [x + 28.4, G - 18.6], [x + 35.6, G - 16]], '#26303a'); R(c, B, x + 20, G - 18.8, 1.6, 2.8); fill(c, B, [[x + 3, G - 16], [x + 8.6, G - 18.8], [x + 8.2, G - 16], [x + 3, G - 16]], false);
  R(c, D, x + 1.5, G - 8, 53, 3); shine(c, x + 6, G - 19, 22); R(c, 'rgba(0,0,0,.18)', x + 3, G - 13.5, 50, .7);
  R(c, '#d42a2a', x + 1, G - 15, 2, 3.5); R(c, '#e8ecf0', x + 50, G - 14, 4, 1.6); R(c, '#2a2c31', x + 52, G - 11, 2.5, 3); disc(c, '#cfd4da', x + 47.5, G - 12.5, .9);
  wheel(c, x + 11, G, 5, '#9aa2ab', null, 5); wheel(c, x + 44, G, 5, '#9aa2ab', null, 5);
} };

/* Mercedes-AMG A45 hot hatch: black roof, rear spoiler, red calipers */
V.a45 = { n: 'Mercedes-AMG A45', w: 58, h: 21, weight: 4, speed: [38, 65], colours: [['Sun yellow', '#f6d21a'], ['Mountain grey', '#7a7f87'], ['White', '#eceef2'], ['Black', '#1e2024'], ['Red', '#c02028']],
  d(c, x, G, [, Y]) { const Yd = SH(Y, .8);
  arch(c, x + 11, G, 5.5); arch(c, x + 46, G, 5.5);
  fill(c, Y, [[x + 1, G - 5], [x + 1, G - 13], [x + 4, G - 17], [x + 10, G - 20.5], [x + 29, G - 21], [x + 39, G - 14.5], [x + 54, G - 12.8], [x + 57, G - 9.5], [x + 57, G - 5]]);
  fill(c, '#141416', [[x + 9, G - 20.7], [x + 29, G - 21.1], [x + 30, G - 19.6], [x + 9, G - 19.4]], false);
  fill(c, '#141416', [[x + 2, G - 19], [x + 11, G - 20.8], [x + 10, G - 19.2], [x + 4, G - 17.6]]);
  glass(c, [[x + 8.5, G - 14.5], [x + 11, G - 19.2], [x + 28.6, G - 19.4], [x + 35.6, G - 14.5]], '#1d232b'); R(c, Y, x + 21, G - 19.6, 1.6, 5);
  R(c, Yd, x + 1.5, G - 7.5, 55, 2.5); R(c, '#141416', x + 16, G - 6, 26, 1.5); shine(c, x + 12, G - 14, 40);
  R(c, '#d42a2a', x + 1, G - 13, 2, 3); R(c, '#e8ecf0', x + 52, G - 12.2, 4, 1.3); R(c, '#141416', x + 54.5, G - 10, 2.5, 4.5);
  wheel(c, x + 11, G, 5.3, '#1b1c20', '#d42a2a', 10); wheel(c, x + 46, G, 5.3, '#1b1c20', '#d42a2a', 10);
} };

/* Audi RS3 saloon */
V.rs3 = { n: 'Audi RS3 saloon', w: 62, h: 22, weight: 2, speed: [38, 65], colours: [['Kyalami green', '#2f8a4a'], ['Nardo grey', '#8c9096'], ['Black', '#1e2024'], ['Glacier white', '#eceef2'], ['Ascari blue', '#1f4fa8']],
  d(c, x, G, [, K]) { const Kd = SH(K, .78);
  arch(c, x + 12, G, 5.5); arch(c, x + 50, G, 5.5);
  fill(c, K, [[x + 1, G - 5], [x + 1, G - 13], [x + 3, G - 15.5], [x + 11, G - 16], [x + 18, G - 21.5], [x + 35, G - 22], [x + 43, G - 15.5], [x + 58, G - 14], [x + 61, G - 10], [x + 61, G - 5]]);
  glass(c, [[x + 15, G - 16.2], [x + 19.2, G - 20.6], [x + 34.4, G - 20.8], [x + 39.6, G - 16.2]], '#1d232b'); R(c, '#141416', x + 26.5, G - 21, 1.6, 5);
  R(c, '#141416', x + 1, G - 16.2, 9, 1); R(c, Kd, x + 1.5, G - 8, 59, 2.6); shine(c, x + 20, G - 21.4, 14); shine(c, x + 4, G - 14.8, 54);
  R(c, '#d42a2a', x + 1, G - 14, 2.2, 2.5); R(c, '#e8ecf0', x + 56, G - 13.2, 4.2, 1.2); fill(c, '#141416', [[x + 58.5, G - 12], [x + 61.2, G - 11.5], [x + 61.2, G - 6.5], [x + 58.5, G - 6.5]], false);
  wheel(c, x + 12, G, 5.3, '#2a2c31', '#d42a2a', 5); wheel(c, x + 50, G, 5.3, '#2a2c31', '#d42a2a', 5);
} };

/* UK emergency vehicles (from the owner's photos). lb = blue lamp positions (x from the back, y above the ground) for the flashing lights */
const TXT = (c, t, x, y, px, col) => { c.font = '700 ' + px + 'px Arial, Helvetica, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(t, x, y); };
// Police: white Toyota Corolla estate, half-Battenburg (fluorescent yellow / blue blocks), POLICE in blue, red/yellow chevrons at the back, blue light bar
V.police = { n: 'Police car', w: 64, h: 26, weight: .5, speed: [30, 48], colours: [['Police', '#f4f5f7']], lb: [[21, -24.6], [29, -24.6]],
  d(c, x, G) { const W0 = '#f4f5f7', YL = '#d4ef1c', BL = '#1f4fc8';
  arch(c, x + 12, G, 5.5); arch(c, x + 51, G, 5.5);
  fill(c, W0, [[x + 1, G - 5], [x + 1, G - 15], [x + 3, G - 21], [x + 8, G - 22.6], [x + 40, G - 22.6], [x + 46, G - 16.6], [x + 58, G - 14.6], [x + 62.5, G - 11], [x + 62.5, G - 5]]);
  glass(c, [[x + 5, G - 16.6], [x + 8.5, G - 21.3], [x + 39, G - 21.3], [x + 44.5, G - 16.6]], '#1d232b'); R(c, W0, x + 18, G - 21.4, 1.4, 4.8); R(c, W0, x + 31, G - 21.4, 1.4, 4.8);
  for (let i = 0; i < 11; i++) { const bx = x + 2 + i * 5.2; if (bx > x + 57) break; R(c, i % 2 ? BL : YL, bx, G - 15.6, Math.min(5.2, x + 58 - bx), 5); }
  R(c, YL, x + 58, G - 14.4, 3.6, 2.4); R(c, BL, x + 1, G - 15.6, 1, 5);
  TXT(c, 'POLICE', x + 32, G - 7.6, 4.6, BL);
  for (let i = 0; i < 3; i++) { R(c, i % 2 ? '#f2d21a' : '#e8402a', x + 1, G - 10.4 + i * 1.6, 3, 1.6); }
  R(c, '#c8202a', x + 1.2, G - 19.5, 1.6, 4); R(c, '#e8ecf0', x + 58.5, G - 13, 3.6, 1.4); R(c, '#2a2c31', x + 1, G - 5.6, 61.5, 1.2);
  R(c, OUT, x + 17, G - 25.4, 16, 2.8); R(c, '#2f5ad8', x + 17.5, G - 24.9, 15, 1.8); R(c, '#e8ecf0', x + 24.4, G - 24.9, 1.2, 1.8);
  shine(c, x + 9, G - 22.2, 30); wheel(c, x + 12, G, 5.3, '#c9ced4', null, 5); wheel(c, x + 51, G, 5.3, '#c9ced4', null, 5);
},
  fixMirror(c, x, G, w) { const cx = w - (x + 32); R(c, '#f4f5f7', cx - 11, G - 9.8, 22, 4.4); TXT(c, 'POLICE', cx, G - 7.6, 4.6, '#1f4fc8'); } };
// Ambulance: Ford Transit box body in fluorescent yellow, green/yellow Battenburg, AMBULANCE along the top, blue lights at the corners
V.ambulance = { n: 'Ambulance', w: 78, h: 42, weight: .45, speed: [26, 42], colours: [['NHS', '#e2ee22']], lb: [[3, -40], [49, -40], [59, -32]],
  d(c, x, G) { const Y = '#e2ee22', Y2 = '#f0f86a', GR = '#1c8a3c';
  arch(c, x + 14, G, 6); arch(c, x + 63, G, 6);
  fill(c, Y, [[x + 1, G - 6], [x + 1, G - 39], [x + 52, G - 39], [x + 52, G - 6]]);
  fill(c, Y, [[x + 52, G - 6], [x + 52, G - 30], [x + 58, G - 30.5], [x + 67, G - 19], [x + 75, G - 16.5], [x + 77, G - 12.5], [x + 77, G - 6]]);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const bx = x + 2 + i * 5.6; if (bx > x + 51) break; R(c, (i + r) % 2 ? GR : Y2, bx, G - 23 + r * 5.6, Math.min(5.6, x + 51.5 - bx), 5.6); }
  R(c, GR, x + 52.5, G - 17.5, 23, 3.2); R(c, Y2, x + 60, G - 17.5, 6, 3.2);
  TXT(c, 'AMBULANCE', x + 26.5, G - 34.6, 5.2, GR);
  glass(c, [[x + 18, G - 30], [x + 18, G - 25.5], [x + 26, G - 25.5], [x + 26, G - 30]], '#1d232b');
  glass(c, [[x + 54, G - 20], [x + 54, G - 29], [x + 58, G - 29], [x + 65.5, G - 20]], '#1d232b');
  R(c, '#1e2024', x + 52, G - 8.6, 25, 2.6); R(c, '#1e2024', x + 1, G - 7, 51, 1.4); R(c, '#e8ecf0', x + 72, G - 15, 4.5, 1.8); R(c, '#c8202a', x + 1.2, G - 30, 1.4, 6);
  R(c, OUT, x + 1, G - 40.4, 4, 1.6); R(c, OUT, x + 47, G - 40.4, 4, 1.6); R(c, '#2f5ad8', x + 1.5, G - 40.2, 3, 1.2); R(c, '#2f5ad8', x + 47.5, G - 40.2, 3, 1.2);
  shine(c, x + 3, G - 38.4, 47); wheel(c, x + 14, G, 5.6, '#2a2c31', null, 6); wheel(c, x + 63, G, 5.6, '#2a2c31', null, 6);
},
  fixMirror(c, x, G, w) { const cx = w - (x + 26.5); R(c, '#e2ee22', cx - 17, G - 37, 34, 4.8); TXT(c, 'AMBULANCE', cx, G - 34.6, 5.2, '#1c8a3c'); } };
// Fire engine: red, silver roller shutters with red/yellow checks, crew cab with yellow checks, ladder on the roof, blue light bar
V.fire = { n: 'Fire engine', w: 100, h: 48, weight: .15, speed: [22, 36], colours: [['Fire', '#d01e1e']], lb: [[82, -45], [92, -45], [3, -40.5]],
  d(c, x, G) { const RD = '#d01e1e', RD2 = '#a81616', YL = '#d4ef1c', SV = '#c9ced4';
  arch(c, x + 22, G, 7); arch(c, x + 84, G, 7);
  fill(c, RD, [[x + 1, G - 7], [x + 1, G - 39], [x + 70, G - 39], [x + 70, G - 7]]);
  fill(c, RD, [[x + 70, G - 7], [x + 70, G - 42], [x + 92, G - 42], [x + 96, G - 36], [x + 98.5, G - 22], [x + 98.5, G - 7]]);
  R(c, YL, x + 2, G - 38, 67, 2);
  for (let i = 0; i < 3; i++) { const sx = x + 4 + i * 22; R(c, OUT, sx - .5, G - 34.5, 20, 23); R(c, SV, sx, G - 34, 19, 22); for (let k = 0; k < 10; k++) R(c, '#aeb4bc', sx, G - 33 + k * 2.2, 19, .6); }
  for (let i = 0; i < 12; i++) { const bx = x + 4 + i * 5.5; if (bx > x + 66) break; R(c, i % 2 ? YL : RD, bx, G - 25, Math.min(5.5, x + 66 - bx), 5); }
  glass(c, [[x + 72, G - 26], [x + 72, G - 38], [x + 80, G - 38], [x + 80, G - 26]], '#1d232b'); glass(c, [[x + 82, G - 26], [x + 82, G - 38], [x + 91, G - 38], [x + 95, G - 26]], '#1d232b');
  for (let i = 0; i < 5; i++) { const bx = x + 71 + i * 5.4; R(c, i % 2 ? RD : YL, bx, G - 20, Math.min(5.4, x + 98 - bx), 5); }
  TXT(c, 'FIRE', x + 85, G - 11.5, 4.6, '#ffffff');
  R(c, '#2a2c31', x + 1, G - 9, 97.5, 2.4); R(c, '#2a2c31', x + 93, G - 12, 5.5, 5); R(c, '#e8ecf0', x + 95, G - 15, 3.5, 2); R(c, '#c8202a', x + 1.2, G - 32, 1.4, 6);
  R(c, '#8a9098', x + 8, G - 43, 60, 1.2); R(c, '#8a9098', x + 8, G - 40.4, 60, 1.2); for (let i = 0; i < 13; i++) R(c, '#b9bec6', x + 9 + i * 4.6, G - 43, .8, 3.8); R(c, '#6a7078', x + 14, G - 40, 1, 1.5); R(c, '#6a7078', x + 60, G - 40, 1, 1.5);
  R(c, OUT, x + 80, G - 45.6, 15, 3); R(c, '#2f5ad8', x + 80.5, G - 45.1, 14, 2); R(c, OUT, x + 1, G - 41, 4, 1.8); R(c, '#2f5ad8', x + 1.5, G - 40.8, 3, 1.2);
  shine(c, x + 72, G - 41.4, 18); wheel(c, x + 22, G, 6.6, '#c9ced4', null, 8); wheel(c, x + 84, G, 6.6, '#c9ced4', null, 8);
},
  fixMirror(c, x, G, w) { const cx = w - (x + 85); R(c, '#d01e1e', cx - 6, G - 13.8, 12, 4.6); TXT(c, 'FIRE', cx, G - 11.5, 4.6, '#ffffff'); } };

/* Lamborghini Huracán (rare) */
V.lambo = { n: 'Lamborghini Huracán', w: 66, h: 19, weight: .7, speed: [60, 90], colours: [['Verde Mantis', '#7fcf12'], ['Arancio orange', '#f07a12'], ['Viola purple', '#7b2fc8'], ['Giallo yellow', '#f6d21a']],
  d(c, x, G, [, L]) { const Ld = SH(L, .72);
  arch(c, x + 14, G, 5.6); arch(c, x + 51, G, 5.6);
  fill(c, L, [[x + 1, G - 5], [x + 1, G - 12], [x + 6, G - 13], [x + 19, G - 17.5], [32 + x, G - 18.5], [x + 40, G - 17], [x + 52, G - 11.5], [x + 64, G - 9], [x + 65.5, G - 6], [x + 63, G - 4], [x + 1, G - 4]]);
  glass(c, [[x + 19, G - 16.2], [x + 31.5, G - 17.3], [x + 39, G - 16], [x + 46, G - 12.8], [x + 22, G - 12.8]], '#1d232b');
  fill(c, '#141416', [[x + 21, G - 11], [x + 30, G - 11.5], [x + 26, G - 7]]); R(c, Ld, x + 2, G - 6.5, 61, 1.5); shine(c, x + 20, G - 17.5, 14); R(c, 'rgba(255,255,255,.3)', x + 46, G - 11.6, 12, .8);
  R(c, '#fff4c8', x + 60, G - 9.5, 4, .9); R(c, '#e02a2a', x + 1, G - 11.5, 2, 1.4); R(c, '#141416', x + 1, G - 8, 4, 2);
  wheel(c, x + 14, G, 5.2, '#c9a64a', null, 5); wheel(c, x + 51, G, 5.2, '#c9a64a', null, 5);
} };

/* Ferrari F40 (rare): low wedge, louvred engine cover, big rear wing, 5-spoke silver wheels */
V.f40 = { n: 'Ferrari F40', w: 64, h: 20, weight: .5, speed: [60, 90], colours: [['Rosso Corsa', '#d01f1f'], ['Giallo Modena', '#f4c20d'], ['Nero black', '#1e2024']],
  d(c, x, G, [, B]) { const D = SH(B, .72);
  arch(c, x + 14, G, 5.6); arch(c, x + 50, G, 5.6);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 14], [x + 9, G - 14.5], [x + 22, G - 17], [x + 30, G - 18], [x + 38, G - 16.5], [x + 47, G - 11.5], [x + 62.5, G - 8.5], [x + 63.5, G - 5.5], [x + 61, G - 4], [x + 1, G - 4]]);
  glass(c, [[x + 23, G - 15.6], [x + 29.5, G - 16.8], [x + 37, G - 15.6], [x + 44, G - 12], [x + 25, G - 12]], '#1d232b');
  for (let i = 0; i < 4; i++) R(c, D, x + 10 + i * 3, G - 14.2, 1.6, .8);
  fill(c, B, [[x, G - 20.5], [x + 9, G - 20.5], [x + 9, G - 19], [x, G - 19]]); R(c, D, x + 2, G - 19, 1, 5); R(c, D, x + 7, G - 19, 1, 5);
  fill(c, D, [[x + 32, G - 11], [x + 40, G - 11], [x + 38, G - 8], [x + 33, G - 8]], false); R(c, D, x + 2, G - 7, 60, 1.3); shine(c, x + 24, G - 17.6, 12); R(c, 'rgba(255,255,255,.3)', x + 47, G - 11, 13, .8);
  R(c, '#e02a2a', x + 1, G - 13, 1.6, 2); R(c, '#fff4c8', x + 58, G - 9, 4, .9); R(c, '#f6d21a', x + 40, G - 10, 1.5, 1.6);
  wheel(c, x + 14, G, 5.2, '#b9bec6', null, 5); wheel(c, x + 50, G, 5.2, '#b9bec6', null, 5);
} };

/* Porsche 911 (rare-ish): round frog-eye headlight, sloping rear engine, ducktail */
V.p911 = { n: 'Porsche 911', w: 58, h: 19, weight: 1.2, speed: [50, 80], colours: [['Guards red', '#c41e24'], ['Racing yellow', '#f4c20d'], ['Shark blue', '#1f6fd0'], ['Chalk', '#d8d6cf'], ['GT silver', '#a9aeb6'], ['Lizard green', '#5ec42a']],
  d(c, x, G, [, B]) { const D = SH(B, .78);
  arch(c, x + 12, G, 5.4); arch(c, x + 45, G, 5.4);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 11], [x + 3, G - 13], [x + 7, G - 13.5], [x + 15, G - 17], [x + 25, G - 18.6], [x + 33, G - 17], [x + 40, G - 12.5], [x + 54, G - 10.5], [x + 57, G - 7.5], [x + 57, G - 5]]);
  fill(c, D, [[x + 1.5, G - 13.6], [x + 8, G - 14.4], [x + 7.5, G - 13], [x + 1.5, G - 12.4]], false);
  glass(c, [[x + 14.5, G - 13.5], [x + 18, G - 16.5], [x + 25, G - 17.5], [x + 32, G - 16], [x + 36.5, G - 13]], '#1d232b'); R(c, B, x + 25, G - 17.6, 1.4, 4.4);
  R(c, D, x + 1.5, G - 7, 55, 1.6); shine(c, x + 16, G - 17.8, 16); R(c, 'rgba(255,255,255,.3)', x + 41, G - 12, 12, .7);
  R(c, '#d42a2a', x + 1, G - 11, 3, 1.4); disc(c, '#eef3f6', x + 51.5, G - 10.6, 1.6); R(c, '#141416', x + 54.5, G - 7.5, 2.5, 2);
  wheel(c, x + 12, G, 5, '#9aa2ab', null, 5); wheel(c, x + 45, G, 5, '#9aa2ab', null, 5);
} };

/* Ford Transit-style van: tall long body, short bonnet */
V.van = { n: 'Transit van', w: 74, h: 36, weight: 3, speed: [28, 48], colours: [['White', '#eceef2'], ['Silver', '#b9bec6'], ['Blue', '#1f4fa8'], ['Courier', '#eceef2', '#e8641c'], ['Black', '#1e2024']],
  d(c, x, G, [, B, stripe]) { const D = SH(B, .82);
  arch(c, x + 14, G, 6); arch(c, x + 60, G, 6);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 33], [x + 3, G - 35], [x + 52, G - 35], [x + 56, G - 33], [x + 61, G - 21], [x + 71, G - 18.5], [x + 72.5, G - 15], [x + 72.5, G - 5]]);
  glass(c, [[x + 51, G - 21.5], [x + 51, G - 32], [x + 54.6, G - 32], [x + 59.4, G - 21.5]], '#26303a'); R(c, 'rgba(0,0,0,.25)', x + 49.5, G - 33, .8, 26); R(c, 'rgba(0,0,0,.2)', x + 36, G - 31, .7, 24); R(c, '#2a2c31', x + 36.5, G - 21, 4, 2);
  if (stripe) { R(c, stripe, x + 2, G - 24, 46, 4); R(c, '#ffffff', x + 6, G - 23, 20, 1); }
  R(c, D, x + 1.5, G - 9, 71, 3); R(c, '#2a2c31', x + 1, G - 6.5, 72, 2); shine(c, x + 3, G - 34, 48);
  R(c, '#d42a2a', x + 1, G - 30, 1.6, 8); R(c, '#e8ecf0', x + 66, G - 17.5, 5, 2); R(c, '#2a2c31', x + 69, G - 14, 3.5, 5);
  wheel(c, x + 14, G, 5.6, '#9aa2ab', null, 6); wheel(c, x + 60, G, 5.6, '#9aa2ab', null, 6);
} };

/* small van (Berlingo / Caddy) */
V.smallvan = { n: 'Small van', w: 58, h: 26, weight: 3, speed: [30, 50], colours: [['White', '#eceef2'], ['Red', '#c02028'], ['Grey', '#7a7f87'], ['Royal Mail', '#d6281e', '#f4c20d']],
  d(c, x, G, [, B, stripe]) { const D = SH(B, .82);
  arch(c, x + 11, G, 5.3); arch(c, x + 46, G, 5.3);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 24], [x + 3, G - 26], [x + 37, G - 26], [x + 44, G - 17], [x + 54, G - 15.5], [x + 56.5, G - 12], [x + 56.5, G - 5]]);
  glass(c, [[x + 33, G - 17.5], [x + 34, G - 24.2], [x + 37, G - 24.2], [x + 42, G - 17.5]], '#26303a'); R(c, 'rgba(0,0,0,.25)', x + 31.5, G - 25, .8, 19);
  if (stripe) { R(c, stripe, x + 2, G - 12, 54, 2.2); } R(c, D, x + 1.5, G - 8, 55, 2.6); shine(c, x + 3, G - 25, 33);
  R(c, '#d42a2a', x + 1, G - 22, 1.6, 6); R(c, '#e8ecf0', x + 51, G - 14.5, 4.5, 1.6); R(c, '#2a2c31', x + 54, G - 11, 2.5, 4);
  wheel(c, x + 11, G, 5, '#9aa2ab', null, 5); wheel(c, x + 46, G, 5, '#9aa2ab', null, 5);
} };

/* bin lorry (rare): green body with the crusher at the back, white cab */
V.binlorry = { n: 'Bin lorry', w: 92, h: 42, weight: 1, speed: [18, 30], colours: [['Luton council', '#2f8a4a'], ['Grey', '#6e737b']],
  d(c, x, G, [, B]) { const D = SH(B, .78);
  arch(c, x + 20, G, 7); arch(c, x + 47, G, 7); arch(c, x + 78, G, 7);
  fill(c, B, [[x + 6, G - 9], [x + 6, G - 38], [x + 58, G - 40], [x + 62, G - 38], [x + 62, G - 9]]); for (let i = 0; i < 5; i++) R(c, D, x + 10 + i * 10, G - 37, 1, 26);
  fill(c, D, [[x + 1, G - 9], [x + 1, G - 30], [x + 8, G - 38], [x + 8, G - 9]]); R(c, '#2a2c31', x + 1, G - 15, 6, 5); R(c, '#f4c20d', x + 1.5, G - 14.5, 5, .8);
  R(c, '#eef0f2', x + 10, G - 30, 44, 7); R(c, B, x + 13, G - 28.4, 3, 3.6); R(c, '#2a2c31', x + 18, G - 28, 30, 1); R(c, '#2a2c31', x + 18, G - 25.6, 22, 1);
  fill(c, '#eceef2', [[x + 62, G - 9], [x + 62, G - 38], [x + 80, G - 38], [x + 86, G - 31], [x + 90.5, G - 28], [x + 90.5, G - 9]]);
  glass(c, [[x + 72, G - 26], [x + 72, G - 36], [x + 79.4, G - 36], [x + 85, G - 30], [x + 85, G - 26]], '#26303a'); R(c, '#2a2c31', x + 64, G - 27, 6, 1); R(c, '#f4c20d', x + 70, G - 40, 6, 2);
  R(c, '#2a2c31', x + 6, G - 11, 85, 3); R(c, '#f4c20d', x + 6, G - 12, 85, .9); R(c, '#e8ecf0', x + 87, G - 20, 3.5, 2.5);
  wheel(c, x + 20, G, 6.5, '#9aa2ab', null, 6); wheel(c, x + 47, G, 6.5, '#9aa2ab', null, 6); wheel(c, x + 78, G, 6.5, '#9aa2ab', null, 6);
} };

/* box lorry (rare) */
V.lorry = { n: 'Box lorry', w: 100, h: 44, weight: .9, speed: [22, 36], colours: [['White box, blue cab', '#eceef2', '#1f4fa8'], ['White box, red cab', '#eceef2', '#c02028'], ['Grey box, white cab', '#b9bec6', '#eceef2']],
  d(c, x, G, [, box, cab]) {
  arch(c, x + 18, G, 7); arch(c, x + 32, G, 7); arch(c, x + 86, G, 7);
  fill(c, box, [[x + 1, G - 10], [x + 1, G - 43], [x + 72, G - 43], [x + 72, G - 10]]); R(c, 'rgba(0,0,0,.08)', x + 2, G - 20, 69, 9); for (let i = 1; i < 6; i++) R(c, 'rgba(0,0,0,.12)', x + 1 + i * 12, G - 42, .7, 31);
  R(c, '#2a2c31', x + 1, G - 12, 99, 3);
  fill(c, cab, [[x + 73, G - 9], [x + 73, G - 38], [x + 90, G - 38], [x + 95, G - 31], [x + 98.5, G - 28], [x + 98.5, G - 9]]); R(c, cab, x + 73, G - 43, 15, 5);
  glass(c, [[x + 82, G - 26], [x + 82, G - 36], [x + 89.4, G - 36], [x + 94, G - 30], [x + 94, G - 26]], '#26303a'); R(c, '#2a2c31', x + 75, G - 27, 5, 1);
  R(c, '#e8ecf0', x + 95, G - 18, 3.5, 2.5); R(c, '#d42a2a', x + 1, G - 16, 1.6, 4); R(c, '#2a2c31', x + 96, G - 13, 3, 4);
  wheel(c, x + 18, G, 6.5, '#9aa2ab', null, 6); wheel(c, x + 32, G, 6.5, '#9aa2ab', null, 6); wheel(c, x + 86, G, 6.5, '#9aa2ab', null, 6);
} };

/* motorbike with rider */
/* motorbike: sports bike with tank, fairing, exhaust, forks and a rider in leathers */
V.motorbike = { n: 'Motorbike', w: 32, h: 24, weight: 1.6, speed: [40, 75], colours: [['Black', '#1e2024'], ['Black', '#1e2024'], ['Deep red', '#a8202a']],
  d(c, x, G, [, B]) {
  wheel(c, x + 6, G, 5, '#3a3d44', null, 6, '#9aa3ad'); wheel(c, x + 26, G, 5, '#3a3d44', null, 6, '#9aa3ad');
  c.strokeStyle = '#2a2c31'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 6, G - 5); c.lineTo(x + 13, G - 9); c.stroke();   // swing arm
  c.strokeStyle = '#b9bec6'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 26, G - 5); c.lineTo(x + 23, G - 15); c.stroke();  // forks
  R(c, '#6a6f77', x + 2, G - 9, 9, 2); R(c, '#9aa3ad', x + 2, G - 9, 3, 2);                                                        // exhaust
  R(c, '#2a2c31', x + 11, G - 10, 8, 4); R(c, '#4a4d54', x + 12, G - 9, 3, 2);                                                       // engine
  fill(c, B, [[x + 5, G - 12], [x + 11, G - 13], [x + 16, G - 16], [x + 22, G - 16], [x + 27, G - 13], [x + 25, G - 9], [x + 19, G - 9], [x + 15, G - 11], [x + 8, G - 10]]);   // tank + fairing
  R(c, SH(B, 1.3), x + 17, G - 15.5, 4, 1); R(c, '#26303a', x + 23, G - 17, 3, 2); R(c, '#e8ecf0', x + 26.5, G - 13, 2, 1.6); R(c, '#d42a2a', x + 3.5, G - 12.5, 1.6, 1.2);
  // rider in leathers, tucked in
  R(c, '#1b1b1f', x + 9, G - 14, 6, 2); R(c, '#1b1b1f', x + 13, G - 14, 2, 6); R(c, '#2a2a30', x + 12, G - 9, 3, 3);                 // leg
  fill(c, '#22232a', [[x + 9, G - 14], [x + 11, G - 21], [x + 17, G - 22], [x + 19, G - 19], [x + 15, G - 14]]); R(c, B, x + 12, G - 20, 4, 1);
  c.strokeStyle = '#22232a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + 17, G - 20); c.lineTo(x + 22, G - 16.5); c.stroke();
  disc(c, OUT, x + 18, G - 24, 3.1); disc(c, B, x + 18, G - 24, 2.6); R(c, '#26303a', x + 18.6, G - 25, 2.6, 1.6); R(c, 'rgba(255,255,255,.5)', x + 16.6, G - 25.8, 1.4, .6);
} };

/* delivery moped: step-through scooter, rider in a branded-colour jacket, big insulated box on the back */
V.moped = { n: 'Delivery moped', w: 30, h: 27, weight: 3, speed: [28, 48], colours: [['Teal delivery', '#00c2b3', '#f4f2ec'], ['Orange delivery', '#ff7a12', '#f4f2ec'], ['Black delivery', '#1e2024', '#39d353'], ['Teal delivery', '#00c2b3', '#f4f2ec'], ['Orange delivery', '#ff7a12', '#f4f2ec']],
  d(c, x, G, [, B, A]) {
  wheel(c, x + 6, G, 3.6, '#4a4d54', null, 5); wheel(c, x + 24, G, 3.6, '#4a4d54', null, 5);
  fill(c, '#e9ecf0', [[x + 3, G - 6], [x + 4, G - 11], [x + 12, G - 11], [x + 14, G - 6], [x + 20, G - 6], [x + 22, G - 15], [x + 24, G - 15], [x + 25, G - 6], [x + 22, G - 4], [x + 6, G - 4]]);   // body + leg shield
  R(c, '#b9bec6', x + 5, G - 7, 8, 1); R(c, '#2a2c31', x + 22, G - 19, 2, 5); R(c, '#2a2c31', x + 20, G - 20, 6, 1.4); R(c, '#f4f2ec', x + 25, G - 13, 1.6, 1.6); R(c, '#d42a2a', x + 2.6, G - 9, 1.4, 1.2);
  R(c, '#1b1b1f', x + 4, G - 12.5, 9, 2);                                                                                         // seat
  // the box: insulated, rider's colour, a white stripe (no logos)
  R(c, OUT, x, G - 25, 11, 12); R(c, B, x + .5, G - 24.5, 10, 11); R(c, SH(B, .8), x + .5, G - 15, 10, 1.5); R(c, A, x + 1.5, G - 21, 8, 1.2); R(c, SH(B, 1.2), x + 1, G - 24, 9, 1);
  // rider: jacket in the same colour, dark trousers, white helmet
  R(c, '#1e2024', x + 11, G - 14, 6, 2.4); R(c, '#1e2024', x + 15, G - 13, 2.4, 6); R(c, '#f4f2ec', x + 15, G - 7.5, 3.6, 1.4);
  fill(c, B, [[x + 10.5, G - 13], [x + 11, G - 21], [x + 15, G - 23], [x + 17.5, G - 20], [x + 16.5, G - 13]]); R(c, A, x + 11.5, G - 17, 5, .8);
  c.strokeStyle = B; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 15.5, G - 20); c.lineTo(x + 21, G - 19.5); c.stroke(); R(c, '#1b1b1f', x + 20.4, G - 20.2, 1.4, 1.4);
  disc(c, OUT, x + 14.6, G - 25.4, 3); disc(c, '#f4f2ec', x + 14.6, G - 25.4, 2.5); R(c, '#26303a', x + 15.4, G - 26.2, 2.4, 1.6); R(c, B, x + 12.6, G - 27.6, 3, .8);
} };

/* bicycle: spoked wheels, proper diamond frame, rider pedalling; some are delivery riders with a backpack box */
V.bike = { n: 'Bicycle', w: 26, h: 26, weight: 2, speed: [12, 22], colours: [['Hi-vis', '#d4ff2a'], ['Red top', '#c02028'], ['Blue top', '#1f4fa8'], ['Black top', '#1e2024'], ['Teal delivery', '#00c2b3', '#00c2b3'], ['Orange delivery', '#ff7a12', '#ff7a12']],
  d(c, x, G, [, top, box]) {
  wheel(c, x + 5, G, 4.4, '#cfd4da', null, 8); wheel(c, x + 21, G, 4.4, '#cfd4da', null, 8);
  const F = '#2f6fd0'; c.strokeStyle = OUT; c.lineWidth = 2; const frame = () => { c.beginPath(); c.moveTo(x + 5, G - 4.4); c.lineTo(x + 10, G - 4.4); c.lineTo(x + 17.5, G - 11); c.lineTo(x + 9, G - 11); c.lineTo(x + 5, G - 4.4); c.moveTo(x + 9, G - 11); c.lineTo(x + 10, G - 4.4); c.moveTo(x + 17.5, G - 11); c.lineTo(x + 21, G - 4.4); c.moveTo(x + 17.5, G - 11); c.lineTo(x + 18.5, G - 14); c.moveTo(x + 9, G - 11); c.lineTo(x + 8.5, G - 13); c.stroke(); };
  frame(); c.strokeStyle = F; c.lineWidth = 1; frame(); R(c, '#1b1b1f', x + 6.8, G - 14, 4, 1.4); R(c, '#2a2c31', x + 17.5, G - 15, 3.4, 1.2);
  disc(c, '#2a2c31', x + 10, G - 4.4, 1.6); R(c, '#9aa3ad', x + 5, G - 4.8, 5, .6);                                          // crank + chain
  // rider: one leg down, one up, leaning to the bars
  c.strokeStyle = '#22232a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + 9, G - 15); c.lineTo(x + 12, G - 9); c.lineTo(x + 11, G - 2.8); c.moveTo(x + 9, G - 15); c.lineTo(x + 13, G - 12); c.lineTo(x + 9, G - 6); c.stroke();
  R(c, '#f4f2ec', x + 10, G - 3.2, 3, 1.2); R(c, '#f4f2ec', x + 8, G - 6.6, 3, 1.2);
  fill(c, top, [[x + 7.5, G - 15], [x + 10, G - 22], [x + 14, G - 22], [x + 12, G - 15]]); c.strokeStyle = top; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 12.5, G - 20.5); c.lineTo(x + 18.5, G - 15.5); c.stroke();
  if (box) { R(c, OUT, x + 4.5, G - 25, 7, 8); R(c, box, x + 5, G - 24.5, 6, 7); R(c, '#f4f2ec', x + 5.5, G - 21.5, 5, .8); }
  disc(c, OUT, x + 13, G - 24.6, 2.4); disc(c, '#c58c5c', x + 13, G - 24.6, 1.9); disc(c, '#f4f2ec', x + 12.6, G - 25.6, 2); R(c, '#f4f2ec', x + 11, G - 25.6, 4, 1);
} };

/* e-scooter with two lads on it: the rider in front with his hood up, his mate behind in a grey tracksuit, hood up, holding on */
V.escooter = { n: 'E-scooter', w: 28, h: 30, weight: 1.6, speed: [18, 28], colours: [['Black hoodie', '#1c1c21'], ['Navy hoodie', '#1f2a44'], ['Khaki hoodie', '#5a5a3c'], ['Black North Face', '#18181c', '#f4f2ec']],
  d(c, x, G, [, top, logo]) {
  const LEG = '#141418', TR = '#7f848c', TRD = '#6a6f77', SKIN = '#8a5a3a', SKIN2 = '#c58c5c';
  // wheels, low deck, stem and bars
  wheel(c, x + 4.5, G, 2.7, '#4a4d54', null, 4); wheel(c, x + 22.5, G, 2.7, '#4a4d54', null, 4);
  R(c, OUT, x + 3, G - 6, 19, 3); R(c, '#2a2c31', x + 3.5, G - 5.5, 18, 2); R(c, '#3e8be0', x + 6, G - 4, 12, .6);
  c.strokeStyle = OUT; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 21.5, G - 4.5); c.lineTo(x + 24, G - 24); c.stroke(); c.strokeStyle = '#4a4d54'; c.lineWidth = 1; c.stroke();
  R(c, OUT, x + 21.5, G - 25.5, 6, 2); R(c, '#2a2c31', x + 22, G - 25, 5, 1); R(c, '#f4f2ec', x + 24.6, G - 18, 1.6, 1.4); R(c, '#e02a2a', x + 2.6, G - 6, 1, 1.2);
  // the mate behind: grey tracksuit, hood up, arms round the rider
  R(c, OUT, x + 5, G - 15, 7, 10); R(c, TRD, x + 5.5, G - 14.5, 2.4, 9); R(c, TR, x + 8.6, G - 14.5, 2.6, 9); R(c, '#f4f2ec', x + 5, G - 6.8, 3, 1.4); R(c, '#f4f2ec', x + 8.4, G - 6.8, 3, 1.4);
  fill(c, TR, [[x + 4.5, G - 14.5], [x + 5, G - 23], [x + 8, G - 25], [x + 12, G - 23], [x + 12.5, G - 14.5]]); R(c, TRD, x + 5.5, G - 16, 7, 1); R(c, '#f4f2ec', x + 8, G - 22, .8, 4);
  disc(c, OUT, x + 8.4, G - 26.2, 3.2); disc(c, TR, x + 8.4, G - 26.2, 2.6); R(c, SKIN, x + 9.6, G - 26.6, 1.6, 2.2); R(c, TRD, x + 9.4, G - 28.2, 2, 1);
  // the rider: hood up, dark joggers, white trainers, leaning on the bars
  R(c, OUT, x + 12, G - 15, 7, 10); R(c, LEG, x + 12.5, G - 14.5, 2.6, 9); R(c, '#22222a', x + 15.6, G - 14.5, 2.6, 9); R(c, '#f4f2ec', x + 12, G - 6.8, 3.4, 1.4); R(c, '#f4f2ec', x + 15.4, G - 6.8, 3.6, 1.4);
  fill(c, top, [[x + 11.5, G - 14.5], [x + 12, G - 23.5], [x + 15.5, G - 25.5], [x + 19, G - 23], [x + 19.5, G - 14.5]]); R(c, SH(top, .75), x + 12, G - 16, 7.5, 1.2);
  if (logo) { R(c, logo, x + 13.2, G - 21.5, 2.2, 1); R(c, logo, x + 13.6, G - 20.5, 1.4, .8); }
  c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 17, G - 21.5); c.lineTo(x + 23, G - 24.5); c.stroke(); c.strokeStyle = top; c.lineWidth = 1.1; c.stroke(); R(c, SKIN2, x + 22.6, G - 25.3, 1.4, 1.2);
  c.strokeStyle = OUT; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + 10.5, G - 20); c.lineTo(x + 15, G - 19.5); c.stroke(); c.strokeStyle = TR; c.lineWidth = .9; c.stroke();   // mate's arm round him
  disc(c, OUT, x + 15.6, G - 27.6, 3.3); disc(c, top, x + 15.6, G - 27.6, 2.7); R(c, SKIN, x + 16.8, G - 28, 1.7, 2.4); R(c, SH(top, .7), x + 16.6, G - 29.8, 2.2, 1); R(c, '#f4f2ec', x + 15.2, G - 24.6, .6, 2.2);
} };

/* pickup truck (Ranger-style double cab) */
V.pickup = { n: 'Pickup truck', w: 70, h: 27, weight: 0.25, speed: [30, 50], colours: [['White', '#eceef2'], ['Black', '#1e2024'], ['Silver', '#b9bec6'], ['Orange', '#e0661c'], ['Blue', '#1f4fa8']],
  d(c, x, G, [, B]) { const D = SH(B, .8);
  arch(c, x + 13, G, 6.2); arch(c, x + 56, G, 6.2);
  fill(c, B, [[x + 1, G - 6], [x + 1, G - 17], [x + 26, G - 17], [x + 28, G - 18], [x + 31, G - 27], [x + 50, G - 27.5], [x + 56, G - 19.5], [x + 67, G - 18], [x + 69, G - 14], [x + 69, G - 6]]);
  R(c, '#2a2c31', x + 2, G - 18.5, 25, 1.5); R(c, 'rgba(0,0,0,.2)', x + 27, G - 17, .8, 10);
  glass(c, [[x + 31.5, G - 19.5], [x + 33.5, G - 25.6], [x + 49, G - 25.8], [x + 53.6, G - 19.5]], '#26303a'); R(c, B, x + 41.5, G - 26, 1.4, 6.5);
  R(c, D, x + 1.5, G - 10, 67, 2.6); R(c, '#2a2c31', x + 1, G - 7, 68, 2); shine(c, x + 32, G - 27, 17);
  R(c, '#d42a2a', x + 1, G - 16, 1.6, 4); R(c, '#e8ecf0', x + 64, G - 17, 4.5, 1.8); R(c, '#2a2c31', x + 66, G - 14, 3, 5);
  wheel(c, x + 13, G, 6, '#2a2c31', null, 6); wheel(c, x + 56, G, 6, '#2a2c31', null, 6);
} };

/* Toyota Prius taxi (Luton private hire, owner's photos 21 Nov): low pointed nose, long raked screen, roof peaks over the front seats and
   slopes all the way down to a high cut-off tail with a spoiler; black pillars, rising crease, boomerang tail lamp, roof TAXI sign, silver alloys */
V.taxi = { n: 'Prius taxi', w: 60, h: 25, weight: 4, speed: [30, 50], colours: [['Black', '#1c1e22'], ['White', '#eef0f3'], ['Silver', '#b9bec6'], ['Grey', '#6e737b'], ['Dark blue', '#22304e']],
  d(c, x, G, [, B]) { const D = SH(B, .78), L = SH(B, 1.18);
  arch(c, x + 12.5, G, 5.4); arch(c, x + 47, G, 5.4);
  fill(c, B, [[x + 2, G - 4.6], [x + 1, G - 8], [x + 1.2, G - 14.4], [x + 3.6, G - 16.6], [x + 9, G - 17.6], [x + 18, G - 20.6], [x + 26, G - 22.2], [x + 31, G - 22], [x + 36, G - 19.6], [x + 45, G - 14.6], [x + 54, G - 12.6], [x + 58.4, G - 11.2], [x + 60, G - 8.6], [x + 59.4, G - 4.6]]);
  // glass: one long glasshouse with black pillars (Prius style), small rear quarter light
  glass(c, [[x + 44.2, G - 14.6], [x + 35.6, G - 19.4], [x + 31, G - 21.2], [x + 26, G - 21.4], [x + 18, G - 19.8], [x + 10.4, G - 17.2], [x + 10.6, G - 15.4], [x + 44.2, G - 14.6]], '#1f2731');
  R(c, '#121318', x + 28.6, G - 21.4, 1.6, 6.6); R(c, '#121318', x + 17, G - 19.8, 1.4, 4.6); R(c, '#121318', x + 10.4, G - 15.8, 34, .9);
  fill(c, '#121318', [[x + 44.2, G - 14.6], [x + 47, G - 14], [x + 41.6, G - 16.4]], false);   // black A-pillar triangle
  R(c, 'rgba(255,255,255,.22)', x + 20, G - 20.3, 8, .5); R(c, 'rgba(255,255,255,.18)', x + 32, G - 20.6, 4, .5);
  fill(c, '#121318', [[x + 1.4, G - 16], [x + 9.6, G - 17.4], [x + 9.4, G - 16.2], [x + 1.4, G - 15]], false);   // spoiler + split glass
  // bodywork: rising crease, darker sill, door shuts, handles, fuel cap
  c.strokeStyle = D; c.lineWidth = .7; c.beginPath(); c.moveTo(x + 52, G - 10.4); c.quadraticCurveTo(x + 28, G - 11.4, x + 4, G - 13.4); c.stroke();
  R(c, 'rgba(255,255,255,.22)', x + 6, G - 14.2, 44, .5); R(c, D, x + 4, G - 6.6, 52, 2); R(c, SH(B, .55), x + 17.6, G - 5.4, 25, 1);
  R(c, 'rgba(0,0,0,.35)', x + 29.4, G - 14.4, .6, 9); R(c, 'rgba(0,0,0,.35)', x + 42.6, G - 14.2, .6, 8.6); R(c, 'rgba(0,0,0,.3)', x + 17.4, G - 15, .6, 8.6);
  R(c, L, x + 36, G - 12.6, 2.6, .8); R(c, L, x + 23.6, G - 13, 2.6, .8); R(c, 'rgba(0,0,0,.25)', x + 6.4, G - 13, 2.2, 1.6);
  // lamps: slim swept headlamp, foglight, boomerang tail lamp, mirror
  fill(c, '#eef6ff', [[x + 51.6, G - 12.6], [x + 57.8, G - 11.3], [x + 58.8, G - 10.2], [x + 53.4, G - 10.8]], false); R(c, '#fff3c8', x + 57, G - 10.9, 1.4, .8);
  R(c, '#121318', x + 55.8, G - 7.6, 3.6, 1.6); R(c, '#fff8d8', x + 57.6, G - 7.2, 1.2, .8);
  fill(c, '#c81e2a', [[x + 1.2, G - 14.6], [x + 4.6, G - 15], [x + 3.4, G - 13.2], [x + 2, G - 10.8], [x + 1.1, G - 10.8]], false); R(c, '#ff7a6a', x + 1.6, G - 14.4, 2.2, .6);
  fill(c, B, [[x + 41.4, G - 15.4], [x + 44.2, G - 15.8], [x + 44.4, G - 14.2], [x + 41.6, G - 14.2]]);
  // roof sign
  fill(c, '#fbf8e6', [[x + 22, G - 22], [x + 22.6, G - 25.6], [x + 31.4, G - 25.6], [x + 32, G - 22]]); R(c, '#e8c21a', x + 22.2, G - 22.8, 9.6, .8);
  c.save(); c.fillStyle = '#16171c'; c.font = '700 2.6px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TAXI', x + 27, G - 24.2); c.restore();
  wheel(c, x + 12.5, G, 5.2, '#c3c8cf', null, 5, '#8a9099'); wheel(c, x + 47, G, 5.2, '#c3c8cf', null, 5, '#8a9099');
} };

/* Big panel van (owner's photo 21 Nov, Sprinter-shaped, generic, no badges): long flat-roofed load box, short sloping bonnet,
   black bumpers + lower cladding, sliding door, slim upright tail lamps, silver steel wheels */
V.bigvan = { n: 'Big panel van', w: 88, h: 33, weight: 2, speed: [26, 44], colours: [['White', '#f0f2f4'], ['Silver', '#b9bec6'], ['Grey', '#7a7f87'], ['Black', '#1e2024'], ['Blue', '#244f96']],
  d(c, x, G, [, B]) { const D = SH(B, .8), L = SH(B, 1.12);
  arch(c, x + 16, G, 6.6); arch(c, x + 71, G, 6.6);
  fill(c, B, [[x + 1.6, G - 6], [x + 1, G - 30], [x + 3, G - 32], [x + 64, G - 32], [x + 67, G - 31], [x + 76, G - 20.6], [x + 83, G - 18.4], [x + 86.4, G - 15.6], [x + 87, G - 9], [x + 86, G - 6]]);
  R(c, 'rgba(255,255,255,.35)', x + 4, G - 31.2, 60, .8); R(c, 'rgba(0,0,0,.08)', x + 3, G - 18, 60, 10);
  // cab: windscreen + door window, A pillar, mirror
  glass(c, [[x + 66.4, G - 30.4], [x + 75, G - 21], [x + 75.4, G - 19.4], [x + 66, G - 19.4]], '#1f2731');
  glass(c, [[x + 57, G - 29.4], [x + 64.6, G - 29.4], [x + 64.6, G - 19.4], [x + 57, G - 19.4]], '#26303a');
  R(c, '#121318', x + 64.6, G - 30, 1.6, 11); fill(c, '#16171c', [[x + 74.6, G - 22], [x + 77.6, G - 22.4], [x + 77.8, G - 19.6], [x + 74.6, G - 19.4]], false);
  // panel lines: cab door, sliding door + rail, handles, fuel cap
  R(c, 'rgba(0,0,0,.3)', x + 56.4, G - 30, .7, 22); R(c, 'rgba(0,0,0,.3)', x + 66.4, G - 18.6, .7, 10.6); R(c, 'rgba(0,0,0,.28)', x + 31, G - 30, .7, 22); R(c, 'rgba(0,0,0,.22)', x + 3, G - 29.6, 53, .6);
  R(c, D, x + 58.6, G - 17.2, 3, .9); R(c, D, x + 51, G - 17.2, 3, .9); R(c, 'rgba(0,0,0,.2)', x + 11, G - 16, 2.4, 2);
  // bonnet + grille + lamps
  R(c, 'rgba(0,0,0,.18)', x + 76, G - 19.6, 9, .6); fill(c, '#eaf2ff', [[x + 80.6, G - 17.2], [x + 86, G - 15.4], [x + 86.4, G - 13.6], [x + 81.4, G - 14.4]], false);
  R(c, '#16171c', x + 85.6, G - 13, 1.6, 4); R(c, '#e8a33c', x + 79.6, G - 15.6, 1.4, .8);
  // black bumpers + cladding
  fill(c, '#1b1c20', [[x + 1.4, G - 9], [x + 87.2, G - 9], [x + 87.4, G - 5.6], [x + 86, G - 4.6], [x + 2.2, G - 4.6], [x + 1, G - 6]], false); R(c, '#2e3036', x + 2, G - 8.8, 85, .6);
  fill(c, '#c81e2a', [[x + 1, G - 22], [x + 2.6, G - 22], [x + 2.6, G - 13], [x + 1, G - 13]], false); R(c, '#ff7a6a', x + 1.2, G - 21.6, 1.2, 2);
  wheel(c, x + 16, G, 6.2, '#c7ccd3', null, 6, '#8a9099'); wheel(c, x + 71, G, 6.2, '#c7ccd3', null, 6, '#8a9099');
} };

/* Mobility scooter with an older gent (owner's photo): silver four-wheeler, tall tiller with a basket, black seat with a high back,
   orange flag on a pole; flat cap, glasses, yellow jacket, beige trousers. Rides on the pavement, slowly */
V.mobility = { n: 'Mobility scooter', w: 36, h: 34, weight: 0, speed: [9, 13], colours: [['Silver', '#9aa2ac'], ['Red', '#b8252a'], ['Blue', '#2c5aa0']],
  d(c, x, G, [, B]) { const D = SH(B, .72), L = SH(B, 1.25);
  // flag pole + flag at the back
  R(c, '#9aa0a8', x + 2, G - 34, .7, 26); fill(c, '#ff7a1a', [[x + 2.6, G - 34], [x + 7, G - 32.4], [x + 2.6, G - 30.6]], false);
  // rear cowling + deck + front fairing
  fill(c, B, [[x + 3, G - 6], [x + 3.4, G - 11], [x + 7, G - 13], [x + 13, G - 12.4], [x + 14, G - 7], [x + 26, G - 7], [x + 27, G - 16], [x + 29.6, G - 24], [x + 31.2, G - 23.6], [x + 30, G - 15], [x + 33.6, G - 11], [x + 34.6, G - 6]]);
  R(c, L, x + 5, G - 12.2, 7, .7); R(c, D, x + 13.6, G - 7.4, 13, 1.6); R(c, 'rgba(255,255,255,.35)', x + 28.4, G - 22.6, .6, 8);
  R(c, '#c81e2a', x + 3, G - 10.4, 1.4, 2.4); R(c, '#e8a33c', x + 22, G - 6.6, 1.6, .8);
  // seat with high back
  fill(c, '#1e1f24', [[x + 9.6, G - 13], [x + 18.6, G - 13], [x + 19, G - 15.6], [x + 9.6, G - 15.6]]); fill(c, '#1e1f24', [[x + 7.4, G - 15], [x + 9.8, G - 15], [x + 10.6, G - 28], [x + 7.6, G - 28.6]]); R(c, '#3a3c44', x + 8.2, G - 27.6, 1, 11);
  R(c, '#2a2c32', x + 13.6, G - 13, 1.4, 6); 
  // basket on the tiller
  fill(c, '#2a2c32', [[x + 30.4, G - 21], [x + 35.6, G - 21], [x + 35, G - 15.4], [x + 31, G - 15.4]]); c.strokeStyle = '#55585f'; c.lineWidth = .35; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + 31 + i * 1.3, G - 21); c.lineTo(x + 31.4 + i * 1.2, G - 15.6); c.stroke(); }
  R(c, '#9fd4f0', x + 31.6, G - 23, 2.4, 2.4);
  // rider: trousers, jacket, arm to the tiller, head, cap, glasses
  fill(c, '#b8a07a', [[x + 11, G - 16], [x + 21, G - 16.6], [x + 22.6, G - 15], [x + 22, G - 8.6], [x + 19.6, G - 8.6], [x + 19.8, G - 13.4], [x + 11, G - 13.4]]);
  fill(c, '#2a2420', [[x + 18.4, G - 9], [x + 24, G - 9], [x + 24.4, G - 7.4], [x + 18.4, G - 7.4]]);
  fill(c, '#f2b81e', [[x + 10.4, G - 15.4], [x + 10.2, G - 25], [x + 12.4, G - 27.4], [x + 16.6, G - 27.2], [x + 18, G - 24.6], [x + 17.6, G - 15.4]]); R(c, '#d4960e', x + 10.6, G - 21, 7, .7);
  c.strokeStyle = OUT; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 15, G - 24.6); c.lineTo(x + 20, G - 20); c.lineTo(x + 27.6, G - 21.6); c.stroke();
  c.strokeStyle = '#f2b81e'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + 15, G - 24.6); c.lineTo(x + 20, G - 20); c.lineTo(x + 27, G - 21.5); c.stroke();
  disc(c, '#e8b48a', x + 28.4, G - 21.6, 1.1); R(c, '#1e1f24', x + 28.6, G - 25, 1, 3.4);
  disc(c, OUT, x + 15.4, G - 29.6, 3); disc(c, '#e8b48a', x + 15.4, G - 29.6, 2.5); R(c, '#e8e6e0', x + 13, G - 29.4, 1.2, 2);
  fill(c, '#8f8a80', [[x + 12.2, G - 31], [x + 13, G - 33.2], [x + 17.4, G - 33], [x + 19, G - 31.4]]); R(c, '#6e6a62', x + 12.4, G - 31.2, 6.6, .6);
  R(c, '#2a2c32', x + 16.4, G - 30, 2, .5); R(c, '#2a2c32', x + 17.4, G - 30.2, .4, 1.2); R(c, '#c07a5a', x + 17.6, G - 28.4, .6, .5);
  wheel(c, x + 7, G, 3.4, '#c7ccd3', null, 5); wheel(c, x + 30, G, 3.4, '#c7ccd3', null, 5);
} };

/* Luton single-deck town bus: teal, dark window band, white swoosh behind the front door, gold skirt line, orange destination screen */
V.bus = { n: 'Luton bus', w: 112, h: 44, weight: 1.6, speed: [20, 32], colours: [['Teal', '#17a3b5']],
  d(c, x, G, [, B]) { const D = SH(B, .8);
  arch(c, x + 20, G, 7); arch(c, x + 88, G, 7);
  fill(c, B, [[x + 1, G - 6], [x + 1, G - 40], [x + 4, G - 43], [x + 104, G - 43], [x + 108, G - 40], [x + 111, G - 30], [x + 111, G - 6]]);
  R(c, '#1c2a33', x + 4, G - 37, 82, 15); for (let i = 1; i < 6; i++) R(c, B, x + 4 + i * 14, G - 37, 1.4, 15); R(c, 'rgba(255,255,255,.18)', x + 6, G - 36, 78, 1);
  R(c, '#1c2a33', x + 89, G - 37, 9, 28); R(c, B, x + 93, G - 37, .8, 28);
  glass(c, [[x + 100, G - 22], [x + 100, G - 39], [x + 106, G - 39], [x + 110, G - 30], [x + 110, G - 22]], '#1c2a33');
  R(c, '#111316', x + 100, G - 41, 9, 3.4); R(c, '#ff8a1e', x + 101, G - 40.2, 5, 1.6); R(c, '#ff8a1e', x + 107, G - 40.4, 1.4, 2);
  fill(c, '#f4f6f8', [[x + 74, G - 22], [x + 82, G - 22], [x + 88, G - 8], [x + 82, G - 8]], false);
  R(c, '#e3a321', x + 2, G - 10, 109, .9); R(c, D, x + 1.5, G - 9, 109, 3);
  disc(c, '#ffffff', x + 37, G - 16.5, 2.4); disc(c, B, x + 37, G - 16.5, 1.5); R(c, '#ffffff', x + 36.4, G - 17.6, 1.2, 2.2);
  c.font = '700 6px Silk'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText('arriva', x + 41, G - 16.3);   // Arriva name on the side
  R(c, '#2a2c31', x + 108, G - 12, 3, 4); R(c, '#f4f6f8', x + 107, G - 17, 3, 2); R(c, '#d42a2a', x + 1, G - 20, 1.6, 6); shine(c, x + 4, G - 42, 100);
  wheel(c, x + 20, G, 6.5, '#b9bec6', null, 8); wheel(c, x + 88, G, 6.5, '#b9bec6', null, 8);
} };

/* intercity coach: white, tall black window band, curved front screen with mirrors, blue + red name stripe and rear slashes */
V.coach = { n: 'Intercity coach', w: 120, h: 50, weight: 1.1, speed: [26, 40], colours: [['White', '#f2f3f5']],
  d(c, x, G, [, B]) { const D = SH(B, .84);
  arch(c, x + 24, G, 7.5); arch(c, x + 92, G, 7.5);
  fill(c, B, [[x + 1, G - 6], [x + 1, G - 44], [x + 6, G - 49], [x + 104, G - 49], [x + 112, G - 46], [x + 117, G - 36], [x + 119, G - 22], [x + 119, G - 6]]);
  fill(c, '#14161a', [[x + 4, G - 28], [x + 4, G - 44], [x + 8, G - 47], [x + 98, G - 47], [x + 98, G - 28]], false); R(c, 'rgba(255,255,255,.14)', x + 8, G - 45, 86, 1); for (let i = 1; i < 6; i++) R(c, '#22252b', x + 4 + i * 16, G - 46, .8, 18);
  glass(c, [[x + 100, G - 24], [x + 100, G - 46], [x + 110, G - 46], [x + 116, G - 36], [x + 117.5, G - 24]], '#2a3440');
  fill(c, B, [[x + 110, G - 44], [x + 116, G - 44], [x + 116, G - 41], [x + 113, G - 41], [x + 113, G - 34], [x + 111, G - 34]]);
  R(c, '#1f5fc0', x + 34, G - 24, 22, 3.2); R(c, '#d8262f', x + 58, G - 24, 20, 3.2);
  for (let i = 0; i < 6; i++) fill(c, '#3a3d44', [[x + 82 + i * 2.4, G - 21], [x + 84 + i * 2.4, G - 27], [x + 85 + i * 2.4, G - 27], [x + 83 + i * 2.4, G - 21]], false);
  R(c, D, x + 1.5, G - 9, 117, 3); for (const sx of [x + 40, x + 56, x + 72]) R(c, SH(B, .9), sx, G - 18, .7, 9);
  R(c, '#2a2c31', x + 115, G - 12, 4, 4); R(c, '#f4f6f8', x + 114, G - 17, 4, 2.4); R(c, '#d42a2a', x + 1, G - 22, 1.8, 8); shine(c, x + 6, G - 48.5, 98);
  wheel(c, x + 24, G, 7, '#c9ced4', null, 8); wheel(c, x + 92, G, 7, '#c9ced4', null, 8);
} };

/* Mr Rushed ice cream van (Luton business): Sprinter van, pink waffle-cone lattice, blue drip top, roof sign with cones */
V.mrrushed = { n: 'Mr Rushed ice cream van', w: 98, h: 60, weight: 0, speed: [16, 26], colours: [['Pink', '#ee3d6c']],
  d(c, x, G, [, B]) { const BL = '#2f9be6', BD = '#1f7cc4', D = SH(B, .8);
  arch(c, x + 20, G, 7); arch(c, x + 78, G, 7);
  const body = [[x + 1, G - 8], [x + 1, G - 44], [x + 3, G - 47], [x + 68, G - 47], [x + 70, G - 42], [x + 80, G - 41], [x + 92, G - 27], [x + 96, G - 24], [x + 97, G - 14], [x + 97, G - 8]];
  fill(c, B, body);
  c.save(); path(c, body); c.clip(); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = .7;
  for (let i = -60; i < 110; i += 6) { c.beginPath(); c.moveTo(x + i, G); c.lineTo(x + i + 50, G - 50); c.stroke(); c.beginPath(); c.moveTo(x + i, G - 50); c.lineTo(x + i + 50, G); c.stroke(); }
  // blue drip top
  c.fillStyle = BL; c.fillRect(x, G - 48, 72, 10); for (let i = 0; i < 9; i++) { const dx = x + 3 + i * 8, h = [5, 8, 4, 9, 6, 7, 4, 8, 5][i]; c.fillRect(dx, G - 39, 4, h); c.beginPath(); c.arc(dx + 2, G - 39 + h, 2, 0, 7); c.fill(); }
  c.fillRect(x + 68, G - 44, 14, 5); c.restore();
  R(c, 'rgba(255,255,255,.35)', x + 4, G - 46, 64, 1);
  // cab glass + bonnet
  glass(c, [[x + 70, G - 26], [x + 70, G - 39], [x + 79, G - 39], [x + 90, G - 27], [x + 90, G - 26]], '#26303a'); R(c, D, x + 74, G - 39, 1, 13);
  R(c, '#1e2024', x + 87, G - 33, 3, 4);                                                        // mirror
  // serving window: same blue drip / pink pattern, just a shade darker with an outline, centred on the side
  c.fillStyle = 'rgba(20,20,60,.18)'; c.fillRect(x + 24, G - 38, 26, 18); c.strokeStyle = OUT; c.lineWidth = 1; c.strokeRect(x + 24, G - 38, 26, 18); R(c, 'rgba(255,255,255,.55)', x + 24, G - 20, 26, 1.2);
  // roof sign box with MR RUSHED, one big cone at the front
  fill(c, BL, [[x + 9, G - 47], [x + 9, G - 61], [x + 61, G - 61], [x + 61, G - 47]]); R(c, BD, x + 9, G - 49, 52, 2); R(c, 'rgba(255,255,255,.35)', x + 10, G - 60, 50, .8);
  fill(c, '#ffffff', [[x + 12, G - 49.6], [x + 12, G - 59], [x + 58, G - 59], [x + 58, G - 49.6]]); fill(c, '#f2559a', [[x + 13.2, G - 50.6], [x + 13.2, G - 58], [x + 56.8, G - 58], [x + 56.8, G - 50.6]], false);
  RS(c, x + 35, G - 54.2, 6);
  { const cx = x + 70; fill(c, '#d9a35a', [[cx - 4.5, G - 54], [cx + 4.5, G - 54], [cx, G - 43]]); c.strokeStyle = '#b07a3a'; c.lineWidth = .6; for (const o of [-2, 1]) { c.beginPath(); c.moveTo(cx + o - 1.5, G - 52); c.lineTo(cx + o + 2, G - 47); c.stroke(); }
    disc(c, OUT, cx, G - 56.5, 5.4); disc(c, '#fff4e8', cx, G - 56.5, 4.8); disc(c, '#f7a8c4', cx + 1.2, G - 58, 2.6); disc(c, '#ffffff', cx - 2, G - 58.5, 1); }
  R(c, D, x + 1.5, G - 11, 95, 3); R(c, '#2a2c31', x + 92, G - 13, 5, 5); R(c, '#f4f6f8', x + 93, G - 20, 3.5, 2.5); R(c, '#d42a2a', x + 1, G - 22, 1.6, 6);
  wheel(c, x + 20, G, 6.5, '#c9ced4', null, 8); wheel(c, x + 78, G, 6.5, '#c9ced4', null, 8);
} };

{ const f = 1.3, d0 = V.mrrushed.d; V.mrrushed.w = Math.round(98 * f); V.mrrushed.h = Math.round(60 * f);   // bigger and more prominent than ordinary vans
  V.mrrushed.d = (c, x, G, col) => { c.save(); c.translate(x, G); c.scale(f, f); d0(c, 0, 0, col); c.restore(); };
  // parked copies for the car park scenery: any size, any name on the roof sign (Donna Rushed is his second van)
  V.mrrushed.parked = (c, x, G, s, name) => { c.save(); c.translate(x, G); c.scale(s, s); d0(c, 0, 0, V.mrrushed.colours[0]);
    // parked and serving: window open, flap propped up over it, someone inside holding out a cone
    R(c, '#f8e6c8', 24, -38, 26, 18); R(c, '#fff4dc', 24, -38, 26, 4); R(c, '#e8d4b0', 24, -24, 26, 4);
    disc(c, OUT, 37, -30.5, 3.6); disc(c, '#c58c5c', 37, -30.5, 3); R(c, '#3a2a20', 34, -34, 6, 2); R(c, OUT, 32, -27, 10, 7); R(c, '#ffffff', 33, -26, 8, 6); R(c, '#f2559a', 33, -26, 8, 1.5);
    fill(c, '#d9a35a', [[42, -27], [46, -27], [44, -21]]); disc(c, OUT, 44, -28.5, 2.6); disc(c, '#f7a8c4', 44, -28.5, 2.1);
    R(c, '#c9ced4', 22, -20.5, 30, 2); R(c, '#9aa0a8', 22, -18.5, 30, .8);
    fill(c, '#f2559a', [[21, -38], [53, -38], [55, -43], [19, -43]]); R(c, 'rgba(255,255,255,.4)', 20, -42.5, 34, 1);
    if (name) { const wide = name.length > 9, a = wide ? 3 : 9, b = wide ? 64 : 61;
      if (wide) { c.fillStyle = '#2f9be6'; c.fillRect(a, -61, b - a, 14); c.fillStyle = '#1f7cc4'; c.fillRect(a, -49, b - a, 2); }
      c.fillStyle = '#ffffff'; c.fillRect(a + 2.5, -59, b - a - 5, 9.4); c.fillStyle = '#f2559a'; c.fillRect(a + 3.6, -58, b - a - 7.2, 7.4); RS(c, (a + b) / 2, -54.2, wide ? 5.2 : 6, name); } c.restore();
    if (!name) { const X = u => Math.round(x + u * s), Y = v => Math.round(G + v * s);
      c.fillStyle = OUT; c.fillRect(X(4) - 1, Y(-62) - 1, X(66) - X(4) + 2, Y(-47) - Y(-62) + 2); c.fillStyle = '#2f9be6'; c.fillRect(X(4), Y(-62), X(66) - X(4), Y(-47) - Y(-62));
      c.fillStyle = '#ffffff'; c.fillRect(X(6), Y(-60), X(64) - X(6), Y(-49) - Y(-60)); c.fillStyle = '#f2559a'; c.fillRect(X(7), Y(-59), X(63) - X(7), Y(-50) - Y(-59));
      RS(c, X(35), Y(-54.5) + .5, 8); } };
  // when the sprite is mirrored for the near lane, repaint the roof sign so MR RUSHED still reads the right way round
  V.mrrushed.fixMirror = (c, x0, G, Wc) => { const X = u => Wc - x0 - u * f, Y = u => G + u * f;
    c.fillStyle = '#f2559a'; c.fillRect(X(56.8), Y(-58), (56.8 - 13.2) * f, 7.4 * f); RS(c, X(35), Y(-54.2), 6 * f); }; }
// the bus drives mirrored in the near lane: repaint its Arriva name so it still reads left to right
V.bus.fixMirror = (c, x0, G, Wc) => { const X = u => Wc - x0 - u, B = V.bus.colours[0][1];
  c.fillStyle = B; c.fillRect(X(70), G - 20, 36, 7.5);
  disc(c, '#ffffff', X(63), G - 16.5, 2.4); disc(c, B, X(63), G - 16.5, 1.5); R(c, '#ffffff', X(63) - .6, G - 17.6, 1.2, 2.2);
  c.font = '700 6px Silk'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText('arriva', X(63) + 4, G - 16.3); };
// Donner Rush: black box-body food truck (Mr Rushed's second van) with gold + pink flames, parked up in the Currys car park
V.donner = { n: 'Donner Rush food truck', w: 100, h: 66, weight: 0, speed: [16, 26], colours: [['Black', '#141418']],
  d(c, x, G, [, B]) { const GD = '#e8b44a', GL = '#ffe08a', PK = '#e8308c', AL = '#c9ced4', D = '#0c0c0f';
  arch(c, x + 20, G, 7); arch(c, x + 82, G, 7);
  // box body with aluminium edges
  fill(c, B, [[x + 1, G - 9], [x + 1, G - 62], [x + 66, G - 62], [x + 66, G - 9]]);
  // cab (high-roof van nose)
  fill(c, B, [[x + 66, G - 9], [x + 66, G - 56], [x + 80, G - 56], [x + 84, G - 50], [x + 86, G - 38], [x + 96, G - 30], [x + 99, G - 24], [x + 99, G - 9]]);
  // gold and pink flame swooshes along the lower body
  c.save(); path(c, [[x + 1, G - 9], [x + 1, G - 62], [x + 66, G - 62], [x + 66, G - 56], [x + 80, G - 56], [x + 84, G - 50], [x + 86, G - 38], [x + 96, G - 30], [x + 99, G - 24], [x + 99, G - 9]]); c.clip();
  // curved swooshes leaning back, like flames streaming past
  const sw = (x0, y0, col, len, th) => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + len * .45, y0 - len * .15, x0 + len, y0 - len * .55); c.quadraticCurveTo(x0 + len * .5, y0 - len * .05 + th, x0 + th * .4, y0 + th); c.closePath(); c.fillStyle = col; c.fill(); };
  for (let i = 0; i < 10; i++) { const x0 = x - 6 + i * 11; sw(x0, G - 10, i % 2 ? PK : GD, 15 + (i % 3) * 3, 2.6); sw(x0 + 5, G - 16, i % 2 ? GD : PK, 11, 1.8); }
  for (let i = 0; i < 4; i++) sw(x + 1, G - 26 - i * 7, i % 2 ? GD : PK, 7, 1.6);
  c.restore();
  R(c, AL, x + 1, G - 63, 66, 2); R(c, AL, x + 1, G - 62, 1.5, 53); R(c, AL, x + 64.5, G - 62, 2, 53); R(c, AL, x + 1, G - 10, 65, 1.4);
  // serving hatch: flap propped up and out like a canopy, steel kitchen inside with the donner turning
  fill(c, '#3a3d44', [[x + 5, G - 54], [x + 37, G - 54], [x + 40, G - 61], [x + 2, G - 61]]); R(c, '#e8e8e8', x + 3, G - 61, 37, .8); for (const lx of [x + 11, x + 20, x + 29]) R(c, '#fff3b0', lx, G - 55.5, 3, 1);
  R(c, '#2a2a2e', x + 6, G - 54, 1, 6); R(c, '#2a2a2e', x + 36, G - 54, 1, 6);
  R(c, OUT, x + 6, G - 53, 31, 24); R(c, '#aab2bc', x + 7, G - 52, 29, 22); R(c, '#c8d0d8', x + 7, G - 52, 29, 4); R(c, '#8a929c', x + 7, G - 38, 29, 1);
  R(c, '#6a727c', x + 11, G - 50, 1.5, 15); fill(c, '#a8602a', [[x + 8.5, G - 47], [x + 14.5, G - 47], [x + 13, G - 37], [x + 10, G - 37]], false); R(c, 'rgba(255,200,120,.5)', x + 9.5, G - 46, 1, 8); R(c, '#6a727c', x + 8, G - 36, 8, 2);
  for (const bx of [x + 28, x + 32]) { R(c, '#d8dde2', bx, G - 36, 3, 4); R(c, '#9aa0a8', bx, G - 36, 3, 1); }
  R(c, AL, x + 4, G - 30, 35, 2.4); R(c, '#9aa0a8', x + 4, G - 27.6, 35, .8);
  // socials row under the hatch
  [['#fffc00'], ['#d6249f'], ['#111111'], ['#25d366']].forEach(([col], i) => { R(c, OUT, x + 9 + i * 7, G - 25, 5, 5); R(c, col, x + 9.5 + i * 7, G - 24.5, 4, 4); R(c, '#ffffff', x + 11 + i * 7, G - 23, 1, 1); });
  // the Donner Rush badge: gold ring, black disc, pink flames, gold donner, DONNER / RUSH in gold
  { const cx = x + 52, cy = G - 40; disc(c, OUT, cx, cy, 13.4); disc(c, GD, cx, cy, 12.6); disc(c, '#a8761c', cx, cy, 11.6); disc(c, '#0e0a0c', cx, cy, 10.8);
    for (const s of [-1, 1]) { fill(c, PK, [[cx + s * 2.5, cy + 3], [cx + s * 8.5, cy - 1], [cx + s * 6.5, cy - 5], [cx + s * 8, cy - 8.5], [cx + s * 3.6, cy - 4], [cx + s * 2.6, cy - 7]], false);
      fill(c, '#ff7ac0', [[cx + s * 3.6, cy + 2], [cx + s * 7, cy - 1], [cx + s * 5.6, cy - 3.6], [cx + s * 4.2, cy - 2]], false); }
    R(c, GD, cx - .5, cy - 14, 1, 4); fill(c, GD, [[cx - 4.6, cy - 10], [cx + 4.6, cy - 10], [cx + 2.4, cy + .5], [cx - 2.4, cy + .5]]);
    c.strokeStyle = '#a8761c'; c.lineWidth = .5; for (let i = 0; i < 5; i++) { const yy = cy - 8.6 + i * 2, hw = 4.2 - i * .4; c.beginPath(); c.moveTo(cx - hw, yy); c.lineTo(cx + hw, yy + .5); c.stroke(); }
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.font = '700 5.4px Silk'; c.lineWidth = 1.6; c.strokeStyle = OUT; c.strokeText('DONNER', cx, cy + 3.6); c.fillStyle = GL; c.fillText('DONNER', cx, cy + 3.6); R(c, PK, cx - 8, cy + 5.8, 16, .8);
    c.font = '700 5px Silk'; c.lineWidth = 1.5; c.strokeText('RUSH', cx, cy + 8.6); c.fillStyle = GL; c.fillText('RUSH', cx, cy + 8.6); }
  // cab: windows, small badge on the roof and door, mirror, lights
  glass(c, [[x + 69, G - 36], [x + 69, G - 50], [x + 81, G - 50], [x + 84, G - 38], [x + 84, G - 36]], '#26303a'); R(c, D, x + 76, G - 50, 1, 14);
  for (const [bx, by, r] of [[x + 74, G - 53.5, 2.2], [x + 92, G - 26, 2]]) { disc(c, GD, bx, by, r); disc(c, D, bx, by, r - .7); R(c, PK, bx - .6, by - .6, 1.2, 1.2); }
  R(c, '#1e2024', x + 85, G - 44, 3, 5); R(c, D, x + 1.5, G - 12, 97, 3); R(c, '#2a2c31', x + 94, G - 14, 5, 5); R(c, '#f4f6f8', x + 95, G - 22, 3.5, 2.5); R(c, '#d42a2a', x + 1, G - 24, 1.6, 6);
  R(c, '#2a2c31', x - 1, G - 12, 4, 3);
  wheel(c, x + 20, G, 6.8, '#c9ced4', null, 8); wheel(c, x + 82, G, 6.8, '#c9ced4', null, 8);
} };
{ const d0 = V.donner.d; V.donner.parked = (c, x, G, s) => { c.save(); c.translate(x, G); c.scale(s, s); d0(c, 0, 0, V.donner.colours[0]);
    // someone serving in the hatch, wrap in hand
    disc(c, OUT, 22, -43, 3.6); disc(c, '#a8703c', 22, -43, 3); R(c, '#1a1a1a', 19, -46.5, 6, 2); R(c, OUT, 17, -39.5, 10, 9); R(c, '#141418', 18, -38.5, 8, 8); R(c, '#e8308c', 18, -38.5, 8, 1);
    fill(c, '#f4e6c8', [[26, -35], [30, -37], [31, -33.5], [27, -32.5]]); R(c, '#4f9a44', 28, -36, 2, 1); R(c, '#c9ced4', 4, -30, 35, 2.4); c.restore();
    // crisp DONNER / RUSH at the font's own size, breaking out of the ring like the real badge
    const X = u => Math.round(x + u * s), Y = v => Math.round(G + v * s); c.fillStyle = '#0e0a0c'; c.beginPath(); c.arc(X(52), Y(-40) + 4, 9 * s, 0, Math.PI); c.fill();
    c.font = '700 8px Silk'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 2.4; c.strokeStyle = '#1b1a24';
    c.strokeText('DONNER', X(52), Y(-36)); c.fillStyle = '#ffd56a'; c.fillText('DONNER', X(52), Y(-36)); c.fillStyle = '#e8308c'; c.fillRect(X(52) - 15, Y(-36) + 4, 30, 1);
    c.strokeText('RUSH', X(52), Y(-36) + 9); c.fillStyle = '#ffd56a'; c.fillText('RUSH', X(52), Y(-36) + 9); }; }


/* post van (owner, 21 Nov): mid-size red panel van like the postal fleet's, black bumpers + lower trim, sliding door, steel wheels,
   a cream "POST" panel on the side (generic, no real logo) */
V.postvan = { n: 'Post van', w: 70, h: 30, weight: 1.6, speed: [28, 46], colours: [['Post red', '#d8231f']],
  d(c, x, G, [, B]) { const D = SH(B, .8);
  arch(c, x + 13, G, 5.6); arch(c, x + 56, G, 5.6);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 27], [x + 3, G - 29.5], [x + 46, G - 29.5], [x + 50, G - 28], [x + 57, G - 18.5], [x + 66, G - 16.5], [x + 68.5, G - 13], [x + 68.5, G - 5]]);
  glass(c, [[x + 46.5, G - 19], [x + 46.5, G - 27.6], [x + 49.6, G - 27.6], [x + 55.4, G - 19]], '#26303a'); R(c, 'rgba(0,0,0,.25)', x + 45, G - 28, .7, 22); R(c, 'rgba(0,0,0,.2)', x + 30, G - 27, .7, 21); R(c, 'rgba(0,0,0,.25)', x + 6, G - 27, 22, .6);
  R(c, '#2a2c31', x + 31, G - 18, 3.4, 1.6); R(c, '#2a2c31', x + 42, G - 18, 3, 1.6);
  R(c, '#fff8e8', x + 10, G - 24, 18, 7); R(c, B, x + 11, G - 23, 16, 5); c.font = '700 4.6px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffd23a'; c.fillText('POST', x + 19, G - 20.4);
  R(c, '#1c1d22', x + 1, G - 8.5, 67.5, 3.5); R(c, '#1c1d22', x + 60, G - 13, 8.5, 4.5); shine(c, x + 3, G - 29, 42);
  R(c, '#e8ecf0', x + 62, G - 16, 5, 2); R(c, '#f2a33a', x + 64.5, G - 14, 2, 1); R(c, '#d42a2a', x + 1, G - 26, 1.6, 7);
  wheel(c, x + 13, G, 5.3, '#b8bec6', null, 8, '#8a9098'); wheel(c, x + 56, G, 5.3, '#b8bec6', null, 8, '#8a9098');
} };

window.VEHICLES = V; window.VEHICLE_ORDER = ['police', 'ambulance', 'fire', 'phantom', 'c63', 'gwagon', 'golf', 'a45', 'rs3', 'p911', 'f40', 'lambo', 'taxi', 'pickup', 'van', 'bigvan', 'postvan', 'smallvan', 'binlorry', 'lorry', 'bus', 'coach', 'mrrushed', 'motorbike', 'moped', 'bike', 'escooter'];
})();
