/* commercial.js — SHOPS & COMMERCIAL. Shop rows, car lots, sheds, fuel/MOT canopies, tyre yard, van sales, garages,
   corner parade, takeaways. RIGHT_PLAN = order of buildings on the right of Leagrave Road. Generic names, no real logos. */
import * as THREE from 'three';
import { BUILD, box, cyl, mat, rboxGeo, signPanel, signTex, tex } from './core.js';
import { CLAD, CLAD_BLUE, CLAD_GREY, CLAD_WHITE, DARK, GLASS, GLASSL, HEDGE, PAVING, TARMAC, brickTex, forecourt, hipRoof, windowSet } from './materials.js';
import { CARC, carG, vanG } from './cars.js';


// filler shops between landmarks
BUILD.shops = () => { const g = new THREE.Group(), n = 3, sw = 6, W = n * sw, H = 9; const cols = ['#c9a27a', '#9e5a3c', '#e3ddd0'];
  for (let i = 0; i < n; i++) { const x0 = -W / 2 + sw * i + sw / 2, m = new THREE.MeshStandardMaterial({ map: brickTex(cols[i % 3], '#d8cfc2'), roughness: .9 });
    box(sw, H, 10, m, x0, H / 2, -5, g); windowSet(g, x0 - 1.3, 6.5, 1.4, 1.6, 0, true, 1); windowSet(g, x0 + 1.3, 6.5, 1.4, 1.6, 0, true, 1);
    box(sw - .4, 2.9, .3, GLASS, x0, 1.7, -.2, g); const c = ['#c0392b', '#1f6f9c', '#2f8f4a', '#8e44ad', '#d35400'][(Math.random() * 5) | 0];
    box(sw, .9, .5, mat(c, { roughness: .5 }), x0, 3.6, .1, g);
    const aw = new THREE.Mesh(new THREE.BoxGeometry(sw - .2, .12, 1.4), mat(c)); aw.position.set(x0, 3.0, .7); aw.rotation.x = .35; aw.castShadow = true; g.add(aw);
    box(sw + .02, .3, 10.2, mat(0x6b6158), x0, H + .1, -5, g); }
  return { g, w: W };
};
// car sales lot: tarmac with bay lines, rows of cars, blue railing along the pavement, feather flags, small office cabin
BUILD.carlot = () => { const g = new THREE.Group(), W = 26 + ((Math.random() * 3) | 0) * 6, D = 22;
  const t = new THREE.Mesh(new THREE.PlaneGeometry(W, D), TARMAC); t.rotation.x = -Math.PI / 2; t.position.set(0, .03, -D / 2); t.receiveShadow = true; g.add(t);
  for (let row = 0; row < 3; row++) for (let x = -W / 2 + 1.6; x < W / 2 - 1; x += 2.5) { if (Math.random() < .12) continue; const c = carG(CARC[(Math.random() * CARC.length) | 0]); c.rotation.y = Math.PI / 2 + (row % 2 ? Math.PI : 0); c.position.set(x, .02, -3 - row * 6.5); g.add(c); }
  const rail = mat(0x2c5fa8, { metalness: .5, roughness: .4 }); box(W, .07, .07, rail, 0, .95, -.2, g); box(W, .07, .07, rail, 0, .5, -.2, g); for (let x = -W / 2; x <= W / 2; x += 1.8) box(.08, 1, .08, rail, x, .5, -.2, g);
  [-W / 2 + 2, W / 2 - 2].forEach((fx, i) => { cyl(.04, .04, 4.6, mat(0xdddddd, { metalness: .6 }), fx, 2.3, -.8, g, 6); const f = new THREE.Mesh(new THREE.PlaneGeometry(.6, 2), mat(i ? 0xd42b2b : 0x1f4fb8, { side: THREE.DoubleSide, roughness: .6 })); f.position.set(fx + .42, 3.0, -.8); f.rotation.y = .3; g.add(f); });
  const ox = W / 2 - 4; box(6, 2.8, 3, CLAD_WHITE, ox, 1.4, -D + 2.5, g); windowSet(g, ox, 1.6, 3, 1.1, -D + 4.02, false, 1); const s = signPanel(g, 5.6, .9, signTex('CAR SALES', '#1f4fb8', '#fff'), ox, 3.25, -D + 4.02);
  const hd = new THREE.Mesh(rboxGeo(W, 1.4, 1, .35), HEDGE); hd.position.set(0, .7, -D + .5); hd.castShadow = true; g.add(hd);
  return { g, w: W };
};
// big grey shed: ribbed cladding, shallow pitched roof, coloured fascia with a sign, roller doors or a glazed showroom front
export const SHEDS = [['CAR SALES', 'OVER 120 CARS IN STOCK', '#1f4fb8', CLAD_GREY, 'show'], ['HAND CAR WASH', 'VALETING', '#1d3f8f', CLAD_BLUE, 'wash'], ['CARPETS & FURNITURE', '', '#244f9e', CLAD_GREY, 'doors'], ['MOT CENTRE', 'SERVICING · TYRES', '#c8202a', CLAD_WHITE, 'doors'], ['RECOVERY & TOWING', '24 HOURS', '#e0a020', CLAD_GREY, 'yard']];
export let shedI = 0;
BUILD.shed = () => { const g = new THREE.Group(), [title, sub, col, clad, kind] = SHEDS[shedI++ % SHEDS.length], W = 30, H = 8, D = 26, SET = 9;
  const fz = -SET; box(W, H, D, clad, 0, H / 2, fz - D / 2, g);
  const sh = new THREE.Shape(); sh.moveTo(-D / 2 - .3, 0); sh.lineTo(D / 2 + .3, 0); sh.lineTo(0, 1.6); sh.lineTo(-D / 2 - .3, 0); const rf = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: W + .4, bevelEnabled: false }), mat(0x8e9298, { roughness: .5, metalness: .4 })); rf.rotation.y = Math.PI / 2; rf.position.set(-W / 2 - .2, H, fz - D / 2); rf.castShadow = true; g.add(rf);
  box(W + .2, 1.6, .3, mat(col, { roughness: .4 }), 0, H - .9, fz + .16, g); signPanel(g, W * .6, 1.3, signTex(title, col, '#fff', sub), 0, H - .9, fz + .33);
  if (kind === 'show') { box(W * .6, 4.6, .2, GLASSL, -W * .15, 2.5, fz + .12, g); for (let x = -W * .45; x <= W * .15; x += 2.6) box(.12, 4.6, .3, mat(0xdfe3e6, { metalness: .6 }), x, 2.5, fz + .15, g); }
  else { const n = kind === 'wash' ? 2 : 3; for (let i = 0; i < n; i++) { const dx = -W / 2 + W / (n + 1) * (i + 1); box(5, 5, .2, mat(0x9aa1a8, { metalness: .4, roughness: .5 }), dx, 2.5, fz + .12, g); for (let y = .3; y < 5; y += .35) box(5, .05, .26, mat(0xc0c6cb, { metalness: .5 }), dx, y, fz + .12, g); } }
  if (kind === 'wash') { box(6, 4.5, 4, mat(0xe8e9ea), W / 2 - 4, 2.25, fz + 2, g); signPanel(g, 5.6, 1, signTex('CAR WASH', '#1d3f8f', '#fff'), W / 2 - 4, 3.6, fz + 4.02); }
  // forecourt in front, a few parked cars, low railing
  const t = new THREE.Mesh(new THREE.PlaneGeometry(W, SET), TARMAC); t.rotation.x = -Math.PI / 2; t.position.set(0, .03, -SET / 2); t.receiveShadow = true; g.add(t);
  for (let x = -W / 2 + 2; x < W / 2 - 2; x += 2.6) if (Math.random() < .6) { const c = carG(CARC[(Math.random() * CARC.length) | 0]); c.rotation.y = Math.PI / 2; c.position.set(x, .02, -SET + 2.6); g.add(c); }
  if (kind === 'doors' && title.startsWith('MOT')) { const fen = mat(0xb0302a, { roughness: .6 }); for (let x = -W / 2; x < W / 2; x += .35) box(.22, 1.8, .06, fen, x, .9, -.3, g); }
  else { const rail = mat(0x2c5fa8, { metalness: .5, roughness: .4 }); box(W, .07, .07, rail, 0, .9, -.2, g); for (let x = -W / 2; x <= W / 2; x += 2) box(.08, .95, .08, rail, x, .47, -.2, g); }
  return { g, w: W };
};
// fuel station: canopy on columns, pump islands, kiosk shop, price totem (generic, no brand)
BUILD.fuel = () => { const g = new THREE.Group(), W = 26, D = 22;
  const t = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(0x8c8f94, { roughness: .9 })); t.rotation.x = -Math.PI / 2; t.position.set(0, .03, -D / 2); t.receiveShadow = true; g.add(t);
  box(16, .9, 9, mat(0xf4f4f2, { roughness: .5 }), -2, 5.4, -8, g); box(16.1, .4, 9.1, mat(0x1d8a5a, { roughness: .4 }), -2, 5.05, -8, g);
  [[-8, -5], [4, -5], [-8, -11], [4, -11]].forEach(([x, z]) => box(.45, 5, .45, mat(0xe8e8e8, { metalness: .4 }), x, 2.5, z, g));
  [-5, 1].forEach(x => { box(1.2, .25, 6, mat(0xd8d8d8), x, .12, -8, g); [-10, -6].forEach(z => { box(.7, 1.8, .5, mat(0xf2f2f2), x, 1.15, z, g); box(.55, .5, .52, GLASS, x, 1.6, z, g); }); });
  box(10, 3.6, 7, mat(0xf2f2f0), 8, 1.8, -D + 4, g); box(10.1, .7, 7.1, mat(0x1d8a5a), 8, 3.8, -D + 4, g); box(6, 2.4, .1, GLASSL, 8, 1.4, -D + 7.56, g);
  const tot = new THREE.Group(); tot.position.set(W / 2 - 1.5, 0, -1); g.add(tot); box(1.4, 6, .5, mat(0xf4f4f2), 0, 3, 0, tot);
  signPanel(tot, 1.2, 2.4, tex(64, 128, (x, w, h) => { x.fillStyle = '#1d8a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = 'bold 13px sans-serif'; x.textAlign = 'center'; x.fillText('FUEL', 32, 18); x.fillStyle = '#111'; x.fillRect(4, 30, 56, 90); x.fillStyle = '#ffb030'; x.font = 'bold 15px monospace'; x.fillText('143.9', 32, 60); x.fillText('151.9', 32, 95); }), 0, 4, .26);
  return { g, w: W };
};
/* ---- Leagrave Road, further south (owner's second Street View walk): tyre yard, van sales, MOT garages, Fitzroy Ave corner parade,
        peri peri takeaway, MOT canopy, Rondini Ave, the masjid & madrasa, mock-Tudor semis ---- */
export const palisade = (g, W, col, z = -.2, h = 2) => { const m = mat(col, { roughness: .6, metalness: .3 }); box(W, .08, .06, m, 0, h * .3, z, g); box(W, .08, .06, m, 0, h * .8, z, g); for (let x = -W / 2; x <= W / 2; x += .25) box(.07, h, .04, m, x, h / 2, z + .04, g); };
export const tyreStack = (g, x, z, n) => { const tm = mat(0x1c1c1e, { roughness: .9 }); for (let i = 0; i < n; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(.34, .13, 6, 14), tm); t.rotation.x = Math.PI / 2; t.position.set(x, .13 + i * .26, z); t.castShadow = true; g.add(t); } };
export const PALFLAG = tex(96, 48, (x, w, h) => { ['#111', '#fff', '#16883a'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * h / 3, w, h / 3); }); x.fillStyle = '#d0202a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w * .38, h / 2); x.lineTo(0, h); x.fill(); });
export const flagPole = (g, x, z, hgt = 5) => { cyl(.04, .05, hgt, mat(0xdddddd, { metalness: .6 }), x, hgt / 2, z, g, 6); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), new THREE.MeshStandardMaterial({ map: PALFLAG, side: THREE.DoubleSide })); f.position.set(x + .72, hgt - .4, z); g.add(f); };
export const gableShed = (g, x, w, D, H, front, title, col, kind) => {   // shed with its gable end facing the road
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, H); sh.lineTo(0, H + 2.2); sh.lineTo(-w / 2, H); sh.lineTo(-w / 2, 0);
  const e = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false }), CLAD_GREY); e.position.set(x, 0, -D - 4); e.castShadow = e.receiveShadow = true; g.add(e);
  const f = new THREE.Mesh(new THREE.ShapeGeometry(sh), front); f.position.set(x, 0, -3.98); g.add(f);
  box(w * .55, 4, .15, kind === 'open' ? DARK : mat(0x3a5fb0, { metalness: .4, roughness: .5 }), x - w * .12, 2, -3.9, g);
  if (kind !== 'open') for (let y = .3; y < 4; y += .35) box(w * .55, .05, .2, mat(0x6f8fd0), x - w * .12, y, -3.9, g);
  signPanel(g, w * .8, 1.1, signTex(title, col, '#fff'), x, H - .3, -3.85); };
BUILD.tyreyard = () => { const g = new THREE.Group(), W = 22; forecourt(g, W, 14); palisade(g, W, 0xb83a2a);
  for (let i = 0; i < 18; i++) tyreStack(g, -W / 2 + 1.5 + (i % 9) * 2.2, -5 - (i / 9 | 0) * 3, 4 + (Math.random() * 4 | 0));
  box(10, 2.6, 4, mat(0x2b2b2e), 3, 1.3, -12, g); for (let i = 0; i < 14; i++) tyreStack(g, -1 + (i % 7) * 1.2, -10.6 - (i / 7 | 0) * .8, 7);
  cyl(.12, .12, 6, mat(0x777777), -W / 2 + 1.5, 3, -.8, g, 6); signPanel(g, 1.6, 4, tex(64, 160, (x, w, h) => { x.fillStyle = '#1d3f8f'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffd84a'; x.font = 'bold 14px sans-serif'; x.textAlign = 'center'; ['MOTORS', 'TYRES', 'MOT', 'REPAIRS', 'SERVICE'].forEach((t, i) => x.fillText(t, w / 2, 24 + i * 28)); }), -W / 2 + 1.5, 4.2, -.65);
  flagPole(g, -W / 2 + 3.2, -.8); flagPole(g, W / 2 - 2, -.8, 4.5); return { g, w: W }; };
BUILD.vanlot = () => { const g = new THREE.Group(), W = 28; forecourt(g, W, 18); palisade(g, W, 0x1f4fb8, -.2, 2.2);
  for (let r = 0; r < 2; r++) for (let x = -W / 2 + 2; x < W / 2 - 8; x += 2.8) { const v = vanG([0xf2f2f2, 0xf2f2f2, 0xe8e8e8, 0x9aa3ad][(Math.random() * 4) | 0]); v.rotation.y = Math.PI / 2; v.position.set(x, 0, -4 - r * 7); g.add(v); }
  const cx = W / 2 - 4.5; box(7, 3.2, 6, mat(0xf2f0ea), cx, 1.6, -9, g); const rf = hipRoof(7, 6, 1.4, mat(0x8a8f96, { metalness: .4, roughness: .5 })); rf.position.set(cx, 3.2, -6); g.add(rf);
  windowSet(g, cx - 1, 1.7, 1.6, 1.2, -5.98, false, 1); box(1, 2.1, .1, mat(0x30343a), cx + 2, 1.05, -5.97, g); signPanel(g, 6.6, .8, signTex('COMMERCIAL VAN SALES', '#1f4fb8', '#fff'), cx, 3.8, -5.6);
  return { g, w: W }; };
BUILD.garages = () => { const g = new THREE.Group(), W = 27; forecourt(g, W, 5);
  const OR = new THREE.MeshStandardMaterial({ map: CLAD('#e06a3a').map, roughness: .55, metalness: .3 });
  gableShed(g, -9, 8.6, 16, 5, OR, 'MOT · TYRES', '#1d3f8f'); gableShed(g, 0, 8.6, 16, 5, CLAD_BLUE, 'TYRES · EXHAUSTS', '#c8202a', 'open'); gableShed(g, 9, 8.6, 16, 5, OR, 'BODY SHOP', '#1d3f8f');
  for (let i = 0; i < 3; i++) { const c = carG(CARC[(Math.random() * CARC.length) | 0]); c.rotation.y = Math.PI / 2 * (i % 2 ? 1 : -1); c.position.set(-8 + i * 8, .02, -1.6); g.add(c); }
  palisade(g, 6, 0xc8302a, -.2, 1.6); return { g, w: W }; };
// corner parade: two storeys, flats over three shops (takeaway, food & wine with fruit outside, business centre)
BUILD.parade = () => { const g = new THREE.Group(), W = 21, H = 6.4, D = 11; const bm = new THREE.MeshStandardMaterial({ map: brickTex('#b8a48a', '#d6cbbb'), roughness: .9 });
  box(W, H, D, bm, 0, H / 2, -2 - D / 2, g); box(W + .3, .3, D + .3, mat(0xe8e2d6), 0, H + .1, -2 - D / 2, g);
  [[-7, '#c8202a', 'TAKEAWAY', 'glass'], [0, '#1d7a3a', 'FOOD & WINE', 'glass'], [7, '#5a6270', 'BUSINESS CENTRE', 'shut']].forEach(([x, c, t, k]) => {
    signPanel(g, 6.4, .9, signTex(t, c, '#fff'), x, 3.35, -1.9); box(6.6, 1, .25, mat(c), x, 3.35, -2.1, g);
    if (k === 'glass') { box(5.6, 2.4, .1, GLASSL, x, 1.5, -1.98, g); box(5.8, .12, .14, mat(0xdddddd), x, 2.75, -1.95, g); } else { box(5.6, 2.6, .12, mat(0x9aa1a8, { metalness: .4 }), x, 1.4, -1.98, g); for (let y = .2; y < 2.7; y += .3) box(5.6, .04, .16, mat(0xc0c6cb), x, y, -1.95, g); }
    windowSet(g, x - 1.4, 5, 1.6, 1.3, -1.98, true, 1); windowSet(g, x + 1.4, 5, 1.6, 1.3, -1.98, true, 1); });
  for (let i = 0; i < 6; i++) { box(.6, .3, .45, mat(0x8a6a3a), -2 + i * .65, .65, -1.2, g); box(.55, .15, .4, mat([0xf0a020, 0xd03020, 0x6ab030, 0xf0d040][i % 4]), -2 + i * .65, .86, -1.2, g); } box(4.2, .5, .5, mat(0x6a5a40), -.4, .25, -1.2, g);
  forecourt(g, W, 2, PAVING); return { g, w: W }; };
BUILD.periperi = () => { const g = new THREE.Group(), W = 12; forecourt(g, W, 6, PAVING);
  box(W, 4.4, 9, CLAD('#3a3d44'), 0, 2.2, -6 - 4.5, g); box(W - 2, 2.6, .1, GLASSL, 0, 1.4, -5.98, g); box(W, .9, .3, mat(0xffffff), 0, 3.4, -5.9, g);
  signPanel(g, 6, .8, signTex('PERI PERI', '#ffffff', '#d0202a'), 0, 3.4, -5.74);
  const wood = mat(0x8a5a30, { roughness: .9 }); [-3, 2].forEach(x => { box(2.2, .08, .9, wood, x, .78, -3, g); [-.75, .75].forEach(o => box(2.2, .06, .3, wood, x, .45, -3 + o, g)); [-.9, .9].forEach(o => box(.08, .78, .08, wood, x + o, .39, -3, g)); });
  return { g, w: W }; };
// old fuel-station canopy now an MOT & tyre centre: pink/red fascia, tyre racks under it
BUILD.motcanopy = () => { const g = new THREE.Group(), W = 22; forecourt(g, W, 18);
  box(18, .9, 9, mat(0xf2f2f2), 0, 5.2, -7, g); box(18.1, .7, 9.1, mat(0xd8506a, { roughness: .5 }), 0, 4.75, -7, g);
  [-4.5, 0, 4.5].forEach(x => signPanel(g, 3, .6, signTex('MOT', '#d8506a', '#fff'), x, 4.75, -2.43));
  [[-8, -3], [8, -3], [-8, -11], [8, -11]].forEach(([x, z]) => box(.45, 4.4, .45, mat(0xe0e0e0), x, 2.2, z, g));
  box(14, 2.4, 1, mat(0x404448, { metalness: .4 }), 0, 1.2, -14, g); for (let i = 0; i < 20; i++) tyreStack(g, -6.3 + (i % 10) * 1.4, -13.3 - (i / 10 | 0) * .1, 3);
  for (let i = 0; i < 3; i++) { const c = carG(CARC[(Math.random() * CARC.length) | 0]); c.rotation.y = .3; c.position.set(-6 + i * 5, .02, -6.5); g.add(c); }
  signPanel(g, 7, 1, signTex('MOTOR CITY', '#1d3f8f', '#fff', 'MOT · TYRES · SERVICING'), 0, 3.4, -2.42);
  return { g, w: W }; };
export const RIGHT_PLAN = ['carlot', 'shed', 'carlot', 'shed', 'fuel', 'shed', 'carlot', 'shed', 'tyreyard', 'vanlot', 'garages', 'garages', 'fitzroy', 'parade', 'periperi', 'motcanopy', 'shed'];
