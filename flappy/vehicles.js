/* Road vehicles v3, drawn at game size (1 unit = 1 game pixel), facing right, wheels on y = G.
   VEHICLES[key] = { n, w, h, weight (how often it appears), speed [min,max], colours: [[name, body, extra?]...], d(c, x, G, col) } */
(function () {
const OUT = '#1b1a24';
const path = (c, pts) => { c.beginPath(); pts.forEach((p, i) => { if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath(); };
const fill = (c, col, pts, line = true) => { path(c, pts); c.fillStyle = col; c.fill(); if (line) { c.strokeStyle = OUT; c.lineWidth = 1; c.stroke(); } };
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const disc = (c, col, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.fill(); };
const SH = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [f(n >> 16), f(n >> 8 & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
const wheel = (c, x, G, r, rim, cal, spokes = 5, ring) => { disc(c, 'rgba(0,0,0,.25)', x, G, r * .9); disc(c, OUT, x, G - r, r + .8); disc(c, '#16171a', x, G - r, r); disc(c, rim, x, G - r, r * .64);
  if (ring) { c.strokeStyle = ring; c.lineWidth = .7; c.beginPath(); c.arc(x, G - r, r * .64, 0, 7); c.stroke(); }
  c.strokeStyle = SH(rim, .55); c.lineWidth = .8; for (let i = 0; i < spokes; i++) { const a = i * 2 * Math.PI / spokes - .3; c.beginPath(); c.moveTo(x, G - r); c.lineTo(x + Math.cos(a) * r * .6, G - r + Math.sin(a) * r * .6); c.stroke(); }
  if (cal) { c.fillStyle = cal; c.fillRect(x + r * .15, G - r - r * .42, r * .3, r * .62); } disc(c, '#5a5d66', x, G - r, r * .16); };
const arch = (c, x, G, r) => { c.beginPath(); c.arc(x, G - r + .5, r + 1.5, Math.PI, 0); c.closePath(); c.fillStyle = '#0d0e10'; c.fill(); };
const glass = (c, pts, tint = '#26303a') => { fill(c, tint, pts); c.save(); path(c, pts); c.clip(); c.fillStyle = 'rgba(255,255,255,.2)'; const [x0, y0] = pts[0]; c.beginPath(); c.moveTo(x0 + 7, y0 - 20); c.lineTo(x0 + 12, y0 - 20); c.lineTo(x0 + 3, y0 + 10); c.lineTo(x0 - 2, y0 + 10); c.fill(); c.restore(); };
const shine = (c, x, y, w) => R(c, 'rgba(255,255,255,.28)', x, y, w, 1);
const person = (c, x, y, top, skin = '#c58c5c', helmet) => { R(c, top, x - 1.5, y, 3, 5); disc(c, helmet || skin, x, y - 1.5, helmet ? 2.2 : 1.6); };
const RS = (c, cx, cy, px) => { c.font = `700 ${px}px Silk`; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText('MR RUSHED').width;
  c.lineWidth = px * .28; c.strokeStyle = '#ffffff'; c.lineJoin = 'round'; c.strokeText('MR RUSHED', cx, cy);
  const g = c.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, '#2f7fe6'); g.addColorStop(.55, '#5a8ff0'); g.addColorStop(1, '#ff4f9a');
  c.save(); c.globalAlpha = .88; c.fillStyle = g; c.fillText('MR RUSHED', cx, cy); c.restore(); };
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
V.motorbike = { n: 'Motorbike', w: 26, h: 22, weight: 2, speed: [40, 75], colours: [['Black', '#1e2024'], ['Red', '#c02028'], ['Blue', '#1f4fa8'], ['Green', '#3fae3a'], ['Orange', '#f07a12']],
  d(c, x, G, [, B]) {
  wheel(c, x + 5, G, 4.4, '#3a3d44', null, 6); wheel(c, x + 21, G, 4.4, '#3a3d44', null, 6);
  fill(c, B, [[x + 4, G - 9], [x + 9, G - 13], [x + 18, G - 13.5], [x + 22, G - 10], [x + 16, G - 6.5], [x + 9, G - 7]]); R(c, '#9aa2ab', x + 9, G - 6.5, 7, 2); R(c, '#2a2c31', x + 18, G - 15, 1, 6);
  R(c, '#3a3d44', x + 9, G - 17, 3, 5); R(c, '#2a2c31', x + 10, G - 20, 5, 4); R(c, '#2a2c31', x + 13, G - 18, 6, 1.5); disc(c, OUT, x + 13, G - 22.5, 2.6); disc(c, B, x + 13, G - 22.5, 2.2); R(c, '#26303a', x + 13.5, G - 23, 2, 1.2);
  R(c, '#e8ecf0', x + 22, G - 12, 2, 1.4); R(c, '#d42a2a', x + 2.5, G - 10, 1.5, 1);
} };

/* bicycle with rider (slow) */
V.bike = { n: 'Bicycle', w: 22, h: 21, weight: 2, speed: [12, 20], colours: [['Hi-vis', '#d4ff2a'], ['Red top', '#c02028'], ['Blue top', '#1f4fa8'], ['Black top', '#1e2024']],
  d(c, x, G, [, top]) {
  for (const wx of [x + 4.5, x + 17.5]) { c.strokeStyle = OUT; c.lineWidth = 1.4; c.beginPath(); c.arc(wx, G - 4, 3.8, 0, 7); c.stroke(); }
  c.strokeStyle = '#2f6fd0'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4.5, G - 4); c.lineTo(x + 9, G - 9); c.lineTo(x + 15, G - 9); c.lineTo(x + 17.5, G - 4); c.moveTo(x + 9, G - 9); c.lineTo(x + 11, G - 4); c.lineTo(x + 15, G - 9); c.stroke();
  R(c, '#2a2c31', x + 8, G - 10.5, 3, 1); R(c, '#2a2c31', x + 15, G - 12, 2, 3);
  c.strokeStyle = '#2a2c31'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 9.5, G - 11); c.lineTo(x + 11, G - 6); c.lineTo(x + 12, G - 4); c.stroke();
  fill(c, top, [[x + 8.5, G - 11], [x + 12, G - 18], [x + 14, G - 17], [x + 11, G - 11]], false); R(c, top, x + 12.5, G - 16, 3, 1.2);
  disc(c, '#c58c5c', x + 13.5, G - 19.5, 1.6); disc(c, '#f4f2ec', x + 13.2, G - 20.5, 1.7);
} };

/* pickup truck (Ranger-style double cab) */
V.pickup = { n: 'Pickup truck', w: 70, h: 27, weight: 2.5, speed: [30, 50], colours: [['White', '#eceef2'], ['Black', '#1e2024'], ['Silver', '#b9bec6'], ['Orange', '#e0661c'], ['Blue', '#1f4fa8']],
  d(c, x, G, [, B]) { const D = SH(B, .8);
  arch(c, x + 13, G, 6.2); arch(c, x + 56, G, 6.2);
  fill(c, B, [[x + 1, G - 6], [x + 1, G - 17], [x + 26, G - 17], [x + 28, G - 18], [x + 31, G - 27], [x + 50, G - 27.5], [x + 56, G - 19.5], [x + 67, G - 18], [x + 69, G - 14], [x + 69, G - 6]]);
  R(c, '#2a2c31', x + 2, G - 18.5, 25, 1.5); R(c, 'rgba(0,0,0,.2)', x + 27, G - 17, .8, 10);
  glass(c, [[x + 31.5, G - 19.5], [x + 33.5, G - 25.6], [x + 49, G - 25.8], [x + 53.6, G - 19.5]], '#26303a'); R(c, B, x + 41.5, G - 26, 1.4, 6.5);
  R(c, D, x + 1.5, G - 10, 67, 2.6); R(c, '#2a2c31', x + 1, G - 7, 68, 2); shine(c, x + 32, G - 27, 17);
  R(c, '#d42a2a', x + 1, G - 16, 1.6, 4); R(c, '#e8ecf0', x + 64, G - 17, 4.5, 1.8); R(c, '#2a2c31', x + 66, G - 14, 3, 5);
  wheel(c, x + 13, G, 6, '#2a2c31', null, 6); wheel(c, x + 56, G, 6, '#2a2c31', null, 6);
} };

/* Toyota Prius taxi (Luton private hire) */
V.taxi = { n: 'Prius taxi', w: 60, h: 24, weight: 4, speed: [30, 50], colours: [['Silver', '#b9bec6'], ['White', '#eceef2'], ['Black', '#1e2024'], ['Grey', '#6e737b']],
  d(c, x, G, [, B]) { const D = SH(B, .8);
  arch(c, x + 12, G, 5.3); arch(c, x + 48, G, 5.3);
  fill(c, B, [[x + 1, G - 5], [x + 1, G - 13], [x + 3, G - 15.5], [x + 10, G - 17], [x + 22, G - 22], [x + 33, G - 22], [x + 43, G - 15], [x + 57, G - 13], [x + 59, G - 10], [x + 59, G - 5]]);
  glass(c, [[x + 12, G - 16.5], [x + 22.5, G - 20.6], [x + 32.4, G - 20.6], [x + 40, G - 15.4], [x + 12, G - 15.4]], '#26303a'); R(c, B, x + 26, G - 20.8, 1.4, 5.4);
  fill(c, '#f6d21a', [[x + 24, G - 22], [x + 25, G - 24.5], [x + 31, G - 24.5], [x + 32, G - 22]]); R(c, '#1b1a24', x + 26, G - 23.8, 4, .8);
  R(c, D, x + 1.5, G - 8, 57, 2.4); shine(c, x + 4, G - 13.6, 52); R(c, '#2a6fd8', x + 20, G - 12.5, 14, 1.4);
  R(c, '#d42a2a', x + 1, G - 13, 2, 2.6); R(c, '#e8ecf0', x + 54, G - 12.2, 4, 1.3); R(c, '#2a2c31', x + 56.5, G - 9.5, 2.5, 3.5);
  wheel(c, x + 12, G, 5, '#9aa2ab', null, 5); wheel(c, x + 48, G, 5, '#9aa2ab', null, 5);
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
  // when the sprite is mirrored for the near lane, repaint the roof sign so MR RUSHED still reads the right way round
  V.mrrushed.fixMirror = (c, x0, G, Wc) => { const X = u => Wc - x0 - u * f, Y = u => G + u * f;
    c.fillStyle = '#f2559a'; c.fillRect(X(56.8), Y(-58), (56.8 - 13.2) * f, 7.4 * f); RS(c, X(35), Y(-54.2), 6 * f); }; }
// the bus drives mirrored in the near lane: repaint its Arriva name so it still reads left to right
V.bus.fixMirror = (c, x0, G, Wc) => { const X = u => Wc - x0 - u, B = V.bus.colours[0][1];
  c.fillStyle = B; c.fillRect(X(70), G - 20, 36, 7.5);
  disc(c, '#ffffff', X(63), G - 16.5, 2.4); disc(c, B, X(63), G - 16.5, 1.5); R(c, '#ffffff', X(63) - .6, G - 17.6, 1.2, 2.2);
  c.font = '700 6px Silk'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText('arriva', X(63) + 4, G - 16.3); };
window.VEHICLES = V; window.VEHICLE_ORDER = ['phantom', 'c63', 'gwagon', 'golf', 'a45', 'rs3', 'p911', 'f40', 'lambo', 'taxi', 'pickup', 'van', 'smallvan', 'binlorry', 'lorry', 'bus', 'coach', 'mrrushed', 'motorbike', 'bike'];
})();
