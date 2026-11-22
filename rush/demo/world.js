/* world.js — Leagrave Road in cartoon style: the road + pavements, street props, houses, shops and the Luton landmarks.
   Every building is built facing +z with its front on z = 0 and the back going into -z, centred on x; the game turns it to
   face the road. Buildings are baked (one mesh per material) so a whole street costs few draw calls. No people anywhere. */
import * as THREE from 'three';
import { mergeGeometries } from '/flappy/3d/BufferGeometryUtils.js';
import { T, U, rb, rbs, cyl, sph, plane, roof, canvasTex, sign, board, rr, blobShadow, C } from './kit.js';

/* ================= layout ================= */
export const LANE = 2.6;                                     // lane spacing
export const LX = [-1.5 * LANE, -.5 * LANE, .5 * LANE, 1.5 * LANE];   // left pavement, left road, right road, right pavement
export const RW = LANE, KERB = .22, PAV_H = .16;               // half road width, kerb width, pavement height
export const EDGE = RW + KERB + LANE;                          // back of the pavement
export const baseY = x => Math.abs(x) > RW + KERB * .3 ? PAV_H : 0;

/* ================= textures (big, soft, clean: no pixel noise) ================= */
const roadT = canvasTex(512, 1024, (x, w, h) => { x.fillStyle = '#4d5463'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '20,24,34'},${.012 + Math.random() * .015})`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 30 + Math.random() * 120, 0, 0, 7); x.fill(); }
  [.25, .75].forEach(f => { const g = x.createLinearGradient(w * f - 50, 0, w * f + 50, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(20,24,34,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(w * f - 50, 0, 100, h); });
  x.fillStyle = '#f1f2f4'; for (let y = 0; y < h; y += 256) rr(x, w / 2 - 7, y + 40, 14, 150, 7), x.fill();
  x.fillStyle = '#e4bb4c'; [18, 38, w - 38, w - 18].forEach(c => x.fillRect(c - 6, 0, 12, h)); });
roadT.wrapS = roadT.wrapT = THREE.RepeatWrapping;
const pavT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#cfc5b6'; x.fillRect(0, 0, w, h); const cols = ['#e3dacd', '#ddd3c5', '#e7dfd3', '#d9cebf']; const s = w / 6;
  for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) { x.fillStyle = cols[(i * 7 + j * 5 + (i * j) % 4) % 4]; rr(x, i * s + 2, j * s + 2, s - 4, s - 4, 6); x.fill();
    x.fillStyle = 'rgba(255,255,255,.22)'; rr(x, i * s + 6, j * s + 6, s - 22, 7, 3); x.fill(); }
  x.fillStyle = 'rgba(140,120,100,.12)'; for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 5 + Math.random() * 12, 3 + Math.random() * 7, Math.random() * 3, 0, 7); x.fill(); } });
pavT.wrapS = pavT.wrapT = THREE.RepeatWrapping;
const grassT = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#8db56b'; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(120,170,90,.5)' : 'rgba(150,195,110,.45)'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 18, 5 + Math.random() * 10, Math.random() * 3, 0, 7); x.fill(); } });
grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping;
// windows: crisp painted panes with a soft reflection and different curtains / blinds
const WIN = [0, 1, 2, 3, 4, 5].map(k => canvasTex(256, 320, (x, w, h) => { x.fillStyle = '#f4f2ee'; rr(x, 0, 0, w, h, 18); x.fill();
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, ['#8fb2cf', '#7fa3c4', '#9bb7cf', '#86a9c6', '#95b0c8', '#7a9fc0'][k]); g.addColorStop(1, '#3f5a78'); x.fillStyle = g; rr(x, 18, 18, w - 36, h - 36, 8); x.fill();
  if (k % 3 === 0) { x.fillStyle = ['#e8dcc8', '#c99a8a', '#b9c7a6'][k / 3 % 3 | 0]; rr(x, 18, 18, 60, h - 36, 8); x.fill(); rr(x, w - 78, 18, 60, h - 36, 8); x.fill(); }
  if (k === 1 || k === 4) { x.fillStyle = 'rgba(245,240,230,.75)'; x.fillRect(18, 18, w - 36, (h - 36) * .45); for (let y = 24; y < 18 + (h - 36) * .45; y += 12) { x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(18, y, w - 36, 2); } }
  x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(30, h - 40); x.lineTo(90, 30); x.lineTo(130, 30); x.lineTo(70, h - 40); x.fill();
  x.fillStyle = '#f4f2ee'; x.fillRect(w / 2 - 7, 18, 14, h - 36); x.fillRect(18, h * .36, w - 36, 12); }));
const WINM = WIN.map(t => T(0xffffff, { map: t }));
const shopT = (tint = '#6a8aa8') => canvasTex(512, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, tint); g.addColorStop(1, '#2c3a4c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,240,200,.25)'; for (let i = 0; i < 6; i++) { rr(x, 20 + i * 82, 120, 60, 90, 6); x.fill(); } x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.moveTo(40, h); x.lineTo(140, 0); x.lineTo(200, 0); x.lineTo(100, h); x.fill(); });
const SHOPM = [shopT(), shopT('#7a8f9c'), shopT('#8a7f6a')].map(t => T(0xffffff, { map: t, emissive: 0x332a18, emissiveIntensity: .25 }));

/* ================= little builders ================= */
const win = (g, x, y, w = 1.1, h = 1.35, k = Math.random() * 6 | 0) => { plane(w, h, WINM[k], x, y, .03, g); rb(w + .2, .1, .22, .04, T(C.frame), x, y - h / 2 - .04, .08, g); };
const door = (g, x, w = 1.0, h = 2.1, col = C.door) => { rbs(w, h, .14, .06, T(col), x, 0, .04, g); sph(.05, T(0xe8c35a), x + w * .32, h * .48, .13, g); rbs(w + .2, .12, .2, .05, T(C.frame), x, h, .06, g); };
const wall = (g, w, h, d, m, y = 0, z = 0) => rbs(w, h, d, .12, m, 0, y, z - d / 2, g);
const fascia = (g, t, w, h, y, z = .1, bg = 0x22252b) => { rbs(w + .2, h + .16, .26, .08, T(bg), 0, y - .08, z - .1, g); board(t, w, h, 0, y + h / 2, z + .04, g); };
const glassFront = (g, w, h = 2.4, m = SHOPM[Math.random() * 3 | 0], frame = 0x2a2d33) => { plane(w, h, m, 0, h / 2 + .15, .02, g); const n = Math.max(2, Math.round(w / 1.6));
  for (let i = 0; i <= n; i++) rbs(.1, h + .1, .12, .04, T(frame), -w / 2 + i * w / n, .1, .05, g); rbs(w + .1, .12, .14, .04, T(frame), 0, h + .14, .05, g); rbs(w + .1, .18, .14, .05, T(frame), 0, 0, .05, g); };
const parapet = (g, w, y, d, m) => rbs(w + .1, .3, d + .1, .1, m, 0, y, -d / 2, g);
const chimney = (g, x, y, z, m) => { rbs(.7, 1.1, .6, .1, m, x, y, z, g); cyl(.12, .12, .3, T(0x8a5040), x - .14, y + 1.2, z, g, 10); cyl(.12, .12, .3, T(0x8a5040), x + .14, y + 1.2, z, g, 10); };
const hedge = (g, w, x, z, h = .9) => rbs(w, h, .8, .35, T(C.hedge), x, 0, z, g);
const tree = (g, x, z, s = 1) => { cyl(.13 * s, .18 * s, 1.6 * s, T(C.trunk), x, .8 * s, z, g, 10); [[0, 2.3, 0, .95], [-.55, 1.95, .2, .7], [.55, 2.0, -.15, .72], [.1, 2.7, -.2, .65]].forEach(([a, b, c, r]) => sph(r * s, T(C.tree), x + a * s, b * s, z + c * s, g, 1, .92, 1, 14)); };

/* ================= bake: merge each building into one mesh per material ================= */
export function bake(g) { g.updateMatrixWorld(true); const by = new Map(), inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), m = new THREE.Matrix4();
  g.traverse(o => { if (!o.isMesh) return; m.multiplyMatrices(inv, o.matrixWorld); let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(m);
    for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
    if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    if (!geo.attributes.normal) geo.computeVertexNormals(); const k = o.material.uuid; if (!by.has(k)) by.set(k, { m: o.material, gs: [] }); by.get(k).gs.push(geo); });
  const out = new THREE.Group(); for (const { m, gs } of by.values()) { const merged = mergeGeometries(gs, false); gs.forEach(x => x.dispose()); const me = new THREE.Mesh(merged, m); if (m.transparent) me.renderOrder = 1; out.add(me); }
  out.userData.baked = 1; return out; }

/* ================= the road (tiles that leapfrog) ================= */
export const TILE = 60;
export function roadTile() { const t = new THREE.Group();
  const rm = T(0xffffff, { map: roadT.clone() }); rm.map.needsUpdate = true; rm.map.repeat.set(1, TILE / 12); rm.map.wrapS = rm.map.wrapT = THREE.RepeatWrapping;
  const rd = plane(RW * 2, TILE, rm, 0, 0, 0, t); rd.rotation.x = -Math.PI / 2;
  const pm = T(0xffffff, { map: pavT.clone() }); pm.map.needsUpdate = true; pm.map.repeat.set(1, TILE / LANE); pm.map.wrapS = pm.map.wrapT = THREE.RepeatWrapping;
  [-1, 1].forEach(s => { const p = rbs(LANE, PAV_H, TILE, .02, pm, s * (RW + KERB + LANE / 2), 0, 0, t);
    rbs(KERB, PAV_H + .02, TILE, .06, T(C.kerb), s * (RW + KERB / 2), 0, 0, t);
    const gm = T(0xffffff, { map: grassT }); gm.map.repeat.set(4, TILE / 6); const gr = plane(30, TILE, gm, s * (EDGE + 15), .01, 0, t); gr.rotation.x = -Math.PI / 2; });
  return bake(t); }
/* ================= street props ================= */
const LAMP_M = T(0x5b616d), LAMP_L = T(0xfff4d0, { emissive: 0xfff0c0, emissiveIntensity: .6 });
export const lamp = (() => { const g = new THREE.Group(); cyl(.09, .12, 5.2, LAMP_M, 0, 2.6, 0, g, 10); rbs(.3, .3, .3, .1, LAMP_M, 0, 0, 0, g);
  const arm = rb(1.2, .09, .09, .04, LAMP_M, -.55, 5.15, 0, g); rb(.6, .16, .32, .08, LAMP_M, -1.1, 5.08, 0, g); rb(.5, .05, .26, .02, LAMP_L, -1.1, 4.99, 0, g); return bake(g); })();
export const treeP = (() => { const g = new THREE.Group(); tree(g, 0, 0, 1.15); rbs(1.2, .1, 1.2, .04, T(0x8a7a66), 0, PAV_H - .05, 0, g); return bake(g); })();
export const planter = (() => { const g = new THREE.Group(); rbs(1.4, .6, .8, .12, T(0x7a6f66), 0, 0, 0, g); [[-.4, .1], [0, -.1], [.4, .05]].forEach(([x, z]) => sph(.32, T([0xd98a8a, 0xe8c46a, 0xb89ad6][Math.random() * 3 | 0]), x, .75, z, g, 1, .8, 1, 10)); sph(.5, T(C.hedge), 0, .7, 0, g, 1.3, .6, .7, 12); return bake(g); })();
export const bollard = (() => { const g = new THREE.Group(); cyl(.12, .12, .9, T(0x3a3e47), 0, .45, 0, g, 12); sph(.12, T(0x3a3e47), 0, .9, 0, g); rb(.26, .06, .26, .02, T(0xe8e8e8), 0, .75, 0, g); return bake(g); })();

/* ================= houses (Leagrave Road 1930s semis and terraces) ================= */
const HOUSE_COL = [[C.render, C.brick, C.roofBrown], [C.cream, C.brickDark, C.roofGrey], [C.renderB, C.brick, C.roofRed], [0xe9e4dc, 0xa86a55, C.roofGrey], [0xf1e3cf, C.brickDark, C.roofBrown]];
function semi() { const g = new THREE.Group(), [rc, bc, rf] = HOUSE_COL[Math.random() * HOUSE_COL.length | 0], R = T(rc), B = T(bc), RF = T(rf), W = 12, D = 8, H = 5.4, set = -3.2;
  // front garden: low brick wall, hedge, drive, small lawn
  rbs(W, .55, .3, .1, B, 0, 0, -.2, g); hedge(g, 3.6, -3.6, -.8); hedge(g, 3.6, 3.6, -.8);
  [-1, 1].forEach(s => { const lawn = plane(3.4, 2, T(0xffffff, { map: grassT }), s * 3.7, .03, -1.9, g); lawn.rotation.x = -Math.PI / 2; });
  const hg = new THREE.Group(); hg.position.z = set; g.add(hg);
  wall(hg, W, H * .5, D, B); wall(hg, W, H * .5, D, R, H * .5);                          // brick ground floor, render upstairs
  const rfm = roof(W, D, 2.8, RF); rfm.position.set(0, H, -D / 2); hg.add(rfm); chimney(hg, 0, H + 1.2, -D / 2, B);
  [-1, 1].forEach(s => { const bx = s * 3.3; rbs(2.6, H - .2, .9, .14, s > 0 ? R : R, bx, 0, .45, hg); win(hg, bx, 1.4, 1.9, 1.3); win(hg, bx, 3.95, 1.9, 1.3);
    const br = roof(2.6, .9, .7, RF, 'hip', .15); br.position.set(bx, H - .2, .45); hg.add(br);
    door(hg, s * 5.25, 1.0, 2.1, [0x5b6d82, 0x8a4a46, 0x3f5d4c, 0x2f3540][Math.random() * 4 | 0]); rbs(1.6, .12, 1.0, .05, T(C.frame), s * 5.25, 2.5, .4, hg); win(hg, s * 1.2, 3.95, .9, 1.1); });
  if (Math.random() < .5) { const bin = rbs(.55, .95, .65, .12, T([0x2e7d55, 0x3a3e47, 0x3b5f9a][Math.random() * 3 | 0]), 4.6, 0, -2.4, g); }
  return { g: bake(g), w: W + .6 }; }
function terrace() { const g = new THREE.Group(), B = T([C.brick, C.brickDark, 0xb87a5c][Math.random() * 3 | 0]), RF = T(C.roofGrey), n = 3, w1 = 5, W = n * w1, D = 8, H = 5.6;
  rbs(W, .5, .25, .1, B, 0, 0, -.15, g); const hg = new THREE.Group(); hg.position.z = -1.6; g.add(hg);
  wall(hg, W, H, D, B); const rf = roof(W, D, 2.6, RF, 'gable'); rf.position.set(0, H, -D / 2); hg.add(rf);
  for (let i = 0; i < n; i++) { const x = -W / 2 + w1 * (i + .5); rbs(2.2, 2.9, .7, .1, T(C.white), x - .8, 0, .35, hg); win(hg, x - .8, 1.5, 1.7, 1.4); rbs(2.4, .14, .8, .05, RF, x - .8, 2.9, .35, hg);
    door(hg, x + 1.4, .95, 2.1, [0x2f3540, 0x8a4a46, 0x3f5d4c, 0x5b6d82][i % 4]); win(hg, x - .8, 4.2, 1.2, 1.2); win(hg, x + 1.4, 4.2, .9, 1.2); chimney(hg, -W / 2 + w1 * (i + 1), H + .9, -D / 2, B); }
  return { g: bake(g), w: W + .5 }; }

/* ================= shops + landmarks ================= */
const S = (t, o) => sign(t, o);
// generic street shop: storeys of wall over a glazed shop front with a fascia sign
function shop(o) { const g = new THREE.Group(), W = o.w || 7, D = o.d || 8, fl = o.floors ?? 2, Hg = 3.6, H = Hg + fl * 2.8, M = T(o.wall ?? C.brick);
  wall(g, W, H, D, M); if (o.upper != null) wall(g, W + .02, H - Hg, D, T(o.upper), Hg);
  if (o.roof === 'flat' || !o.roof) parapet(g, W, H, D, T(o.trim ?? C.white)); else { const r = roof(W, D, 2.4, T(o.roofC ?? C.roofGrey), o.roof); r.position.set(0, H, -D / 2); g.add(r); }
  if (o.tudor) { for (let i = -2; i <= 2; i++) rbs(.14, H - Hg - .2, .06, .03, T(0x2b2622), i * W / 5, Hg + .1, .02, g); rbs(W, .14, .06, .03, T(0x2b2622), 0, H - .3, .02, g); }
  for (let f = 0; f < fl; f++) { const n = o.wins ?? Math.max(1, Math.round(W / 2.6)); for (let i = 0; i < n; i++) win(g, -W / 2 + W * (i + .5) / n, Hg + 1.4 + f * 2.8, Math.min(1.3, W / n * .55), 1.4); }
  glassFront(g, W - .5, 2.5, o.glass, o.frame); door(g, W / 2 - 1.0, 1.1, 2.3, 0x2a2d33);
  fascia(g, o.sign, W - .2, o.signH ?? .95, Hg - .9, .12, o.signBg ?? 0x22252b);
  if (o.awning) { const a = rbs(W - .4, .14, 1.2, .06, T(o.awning), 0, Hg - 1.1, .55, g); a.rotation.x = .25; }
  if (o.extra) o.extra(g, W, H, D);
  return { g: bake(g), w: W + 1 }; }
// big retail shed: clad box, glazed entrance, big sign board
function shed(o) { const g = new THREE.Group(), W = o.w || 30, D = o.d || 22, H = o.h || 8, M = T(o.wall ?? 0xd9dbe0), A = T(o.accent ?? 0x5a6472);
  // car park strip in front
  const cp = plane(W, 6, T(0x6a7080), 0, .02, -3, g); cp.rotation.x = -Math.PI / 2; for (let i = -W / 2 + 2; i < W / 2; i += 2.6) { const l = plane(.12, 4, T(0xf2f2f2), i, .03, -3.5, g); l.rotation.x = -Math.PI / 2; }
  const b = new THREE.Group(); b.position.z = -6; g.add(b);
  wall(b, W, H, D, M); rbs(W + .3, .5, D + .3, .2, A, 0, H, -D / 2, b);
  for (let i = 0; i < 4; i++) rbs(W * .98, .06, .02, .02, T(0xc5c8ce), 0, 1.6 + i * 1.6, .02, b);
  const ew = o.entW || W * .35; rbs(ew + .6, H * .78, 1.2, .2, A, o.entX || 0, 0, .6, b); plane(ew, H * .55, SHOPM[0], o.entX || 0, H * .3, 1.22, b);
  fascia(b, o.sign, o.signW || Math.min(W * .5, 14), o.signH || 2.2, H * .62, 1.25, o.signBg ?? 0xffffff);
  if (o.extra) o.extra(b, W, H, D, g);
  return { g: bake(g), w: W + 3 }; }
const BIG = (t, o = {}) => S(t, { w: 1024, h: 220, ...o });

export const LM = {
  // ---- local shops (names on their signs, as in Flappy Kabootar) ----
  alquds: () => shop({ w: 7, floors: 2, wall: C.cream, roof: 'flat', sign: BIG('AL-QUDS', { bg: '#1e2a24', fg: '#e9c56a', sub: 'SWEETS · BAKERY · ARABIC FOOD', subFg: '#e9e2cf' }), signBg: 0x1e2a24 }),
  krispy: () => shop({ w: 7.5, floors: 1, wall: C.brick, roof: 'gable', roofC: C.roofBrown, sign: BIG('Krispy Lemon Chicken', { bg: '#5a2340', fg: '#ffffff', font: '800' }), signBg: 0x5a2340 }),
  gna: () => shop({ w: 7, floors: 2, wall: C.brickDark, roof: 'gable', sign: BIG('G&A FAST FOOD', { bg: '#141414', fg: '#d7322f', sub: 'CHICKEN · PERI PERI · PIZZA · BURGERS', subFg: '#f1f1f1' }), signBg: 0x141414 }),
  kahwa: () => shop({ w: 6.5, floors: 2, wall: C.brick, roof: 'gable', sign: BIG('Kahwa Cafe', { bg: '#4a3326', fg: '#f3e2c4', font: '700' }), signBg: 0x4a3326 }),
  karwan: () => shop({ w: 9, floors: 1, wall: 0xf1efe9, roof: 'flat', sign: BIG('KARWAN', { bg: '#121212', fg: '#e0342f', sub: 'AFGHAN CUISINE', subFg: '#ffffff' }), signBg: 0x121212 }),
  toros: () => shop({ w: 8, floors: 2, wall: 0x3e6b45, upper: 0xa8705a, roof: 'flat', sign: BIG("TORO'S STEAKHOUSE", { bg: '#2c2f33', fg: '#e8e2d4', font: '700' }), signBg: 0x2c2f33 }),
  topspizza: () => shop({ w: 7, floors: 1, wall: 0xf3efe6, roof: 'gable', roofC: C.roofBrown, tudor: 1, sign: BIG('Tops Pizza', { bg: '#1b2a4a', fg: '#ffffff', stroke: '#c8302a' }), signBg: 0x1b2a4a }),
  miamicrispy: () => shop({ w: 7.5, floors: 1, wall: 0xe0782f, roof: 'flat', trim: 0x2a2a2a, sign: BIG('MIAMI CRISPY', { bg: '#e0782f', fg: '#ffffff', stroke: '#9a3c10' }), signBg: 0xe0782f }),
  periperi: () => shop({ w: 9, floors: 1, wall: 0x4d5058, roof: 'gable', roofC: 0x3a3d44, sign: BIG('Peri-Peri', { bg: '#2d3036', fg: '#e0372d', sub: 'ORIGINAL', subFg: '#f2f2f2' }), signBg: 0x2d3036 }),
  cycleking: () => shop({ w: 12, floors: 1, wall: C.brick, roof: 'flat', wins: 4, sign: BIG('CYCLE KING', { bg: '#f2c230', fg: '#c8302a' }), signBg: 0xf2c230 }),
  barak: () => shop({ w: 9, floors: 1, wall: 0x2e3035, roof: 'flat', trim: 0x2e3035, sign: BIG('THE BARAK', { bg: '#111111', fg: '#d8b36a', font: '700' }), signBg: 0x111111,
    extra: g => { rbs(9, .5, 2.2, .1, T(0x8a8f98), 0, 0, 1.1, g); } }),
  chaiiwala: () => shop({ w: 9, floors: 1, wall: 0x2a2c31, roof: 'flat', trim: 0x2a2c31, sign: BIG('chaiiwala', { bg: '#1a1b1f', fg: '#ffffff', font: '600' }), signBg: 0x1a1b1f }),
  kaya: () => shop({ w: 9, floors: 1, wall: 0x2f6b3d, roof: 'flat', trim: 0x1e1e1e, sign: BIG('KAYA LOUNGE', { bg: '#111111', fg: '#ffffff', font: '700' }), signBg: 0x111111 }),
  nadeem: () => { const r = shop({ w: 10, floors: 2, wall: 0xe8e0cf, roof: 'flat', sign: BIG('THE COFFEE POT', { bg: '#7a2e2a', fg: '#fff3dc' }), signBg: 0x7a2e2a,
    extra: (g, W, H) => { cyl(2.4, 2.4, H + 1.4, T(0xe8e0cf), -W / 2 + 1.6, (H + 1.4) / 2, -1.4, g, 28); cyl(2.6, 2.6, .5, T(0x7a2e2a), -W / 2 + 1.6, H + 1.6, -1.4, g, 28); board(BIG('NADEEM PLAZA', { bg: '#e8e0cf', fg: '#7a2e2a' }), 4, .8, -W / 2 + 1.6, H + .4, 1.05, g); } }); return r; },
  oak: () => shop({ w: 14, floors: 1, wall: C.brick, roof: 'gable', wins: 5, glass: SHOPM[1], sign: BIG('OAK STAND', { bg: '#1f3f8f', fg: '#ffffff', sub: 'BLOCKS F G · GATE · BLOCKS D E', subFg: '#f28a2b' }), signBg: 0x1f3f8f,
    extra: (g, W) => { rbs(4, 2.6, .2, .05, T(0x223c86), 0, 0, .25, g); } }),
  foodbank: () => shop({ w: 9, floors: 0, wall: 0xe4e0d8, roof: 'flat', trim: 0x2f7a52, sign: BIG('luton foodbank', { bg: '#ffffff', fg: '#c0392b', font: '700' }), signBg: 0xffffff }),
  // ---- big stores ----
  bandq: () => shed({ w: 34, sign: BIG('B&Q', { bg: '#f08a1c', fg: '#ffffff' }), signBg: 0xf08a1c, accent: 0xd9772a, signW: 7, signH: 3 }),
  bigyellow: () => shed({ w: 24, h: 12, wall: 0xf2c230, accent: 0x2b2b2b, sign: BIG('BIG YELLOW', { bg: '#2b2b2b', fg: '#f2c230', sub: 'SELF STORAGE', subFg: '#ffffff' }), signBg: 0x2b2b2b, signW: 9, signH: 2.6 }),
  currys: () => shed({ w: 30, wall: 0xe8e8ee, accent: 0x4b2a7a, sign: BIG('Currys', { bg: '#4b2a7a', fg: '#ffffff', font: '700' }), signBg: 0x4b2a7a, signW: 9 }),
  lidl: () => shed({ w: 28, wall: 0xdfe2e8, accent: 0x1f4fa0, sign: BIG('LIDL', { bg: '#1f4fa0', fg: '#f6d33c', stroke: '#c8302a' }), signBg: 0x1f4fa0, signW: 5, signH: 3 }),
  matalan: () => shed({ w: 30, wall: 0xe9e9ec, accent: 0xb3262b, sign: BIG('MATALAN', { bg: '#b3262b', fg: '#ffffff', font: '700' }), signBg: 0xb3262b, signW: 11 }),
  tesco: () => shed({ w: 34, wall: 0xc9a98a, accent: 0x7a4a3a, sign: BIG('TESCO extra', { bg: '#ffffff', fg: '#1f4fa0', stroke: '#e0342f' }), signBg: 0xffffff, signW: 10,
    extra: (b, W, H) => { rbs(3.4, H + 6, 3.4, .2, T(0xb08a6c), W / 2 - 4, 0, -1.7, b); const rf = roof(3.6, 3.6, 2.4, T(C.roofRed)); rf.position.set(W / 2 - 4, H + 6, -1.7); b.add(rf); clockFace(b, W / 2 - 4, H + 4.4, .05); } }),
  jdgyms: () => shed({ w: 22, wall: 0x8e949c, accent: 0x222428, sign: BIG('JD GYMS', { bg: '#1b5fb8', fg: '#ffffff' }), signBg: 0x1b5fb8, signW: 8 }),
  orbital: () => shed({ w: 30, h: 11, wall: 0xa7acb3, accent: 0x7ab648, sign: BIG('ORBITAL', { bg: '#3e8f3a', fg: '#ffffff', sub: 'TRAMPOLINE PARK', subFg: '#d9f2b8' }), signBg: 0x3e8f3a, signW: 11, signH: 2.8 }),
  grandbazar: () => shed({ w: 26, h: 7, wall: 0xeaf1ea, accent: 0x2f8a4c, sign: BIG('GRAND BAZAR', { bg: '#2f8a4c', fg: '#ffffff', sub: 'SUPERMARKET', subFg: '#d6f0de' }), signBg: 0x2f8a4c, signW: 12 }),
  nandos: () => shed({ w: 16, h: 6.5, wall: 0x3a3c42, accent: 0xb8794a, sign: BIG("Nando's", { bg: '#3a3c42', fg: '#d8443c', font: '700' }), signBg: 0x3a3c42, signW: 6 }),
  venue: () => shed({ w: 20, h: 7, wall: 0xcfb894, accent: 0x262a30, sign: BIG('VENUE CENTRAL', { bg: '#262a30', fg: '#e8e2d4', font: '600' }), signBg: 0x262a30, signW: 10 }),
  vauxhall: () => shed({ w: 40, h: 10, wall: 0xe8e8e8, accent: 0x9aa0a8, sign: BIG('VAUXHALL', { bg: '#ffffff', fg: '#b3262b' }), signBg: 0xffffff, signW: 10,
    extra: (b, W, H) => { for (let i = 0; i < 5; i++) cyl(.6, .7, 6, T(0xb9bdc4), -W / 2 + 6 + i * 3, H + 3, -6, b, 14); } }),
  // ---- civic, education, health ----
  chiltern: () => office({ w: 34, floors: 4, wall: 0xf2f2f2, band: 0x2f6fb5, sign: BIG('CHILTERN', { bg: '#2f6fb5', fg: '#ffffff' }) }),
  sixthform: () => office({ w: 30, floors: 2, wall: 0xd8b06a, band: 0x8a8f98, sign: BIG('Luton Sixth Form College', { bg: '#d8b06a', fg: '#7a2e2a', font: '700' }) }),
  lewsey: () => office({ w: 24, floors: 2, wall: C.brick, band: 0xdcdcdc, sign: BIG('LEWSEY SPORTS PARK', { bg: '#ffffff', fg: '#3a3a3a' }) }),
  inspire: () => office({ w: 28, floors: 2, wall: C.brickDark, band: 0x4d6b8a, sign: BIG('inspire', { bg: '#a8604d', fg: '#ffffff', font: '600', sub: 'LUTON SPORTS VILLAGE', subFg: '#ffffff' }) }),
  uob: () => office({ w: 30, floors: 4, wall: 0xf0f0f0, band: 0x3e4a5a, sign: BIG('University of Bedfordshire', { bg: '#ffffff', fg: '#b3262b', font: '700' }) }),
  ldh: () => office({ w: 34, floors: 4, wall: 0xc49a6c, band: 0x3c4450, sign: BIG('Luton and Dunstable University Hospital', { bg: '#c49a6c', fg: '#3c2b1c', font: '700' }),
    extra: (g, W) => fascia(g, BIG('EMERGENCY DEPT', { bg: '#d33a2f', fg: '#ffffff' }), 6, .8, 3.0, .7, 0xd33a2f) }),
  frasers: () => { const g = new THREE.Group(); rbs(16, 14, 14, .3, T(0x5e8a9c, { emissive: 0x1d3540, emissiveIntensity: .3 }), -9, 0, -7, g); for (let i = 0; i < 6; i++) rbs(16.1, .12, 14.1, .05, T(0x2c3036), -9, 2.3 * i + 1, -7, g);
    board(BIG('FRASERS PLUS', { bg: '#3a3e48', fg: '#ffffff', font: '600' }), 7, 1.2, -9, 9, .05, g); rbs(18, 11, 14, .2, T(0xd5d6da), 9, 0, -7, g); board(BIG('TK MAXX', { bg: '#d5d6da', fg: '#b3262b' }), 6, 1.2, 9, 9, .05, g); glassFront(g, 8); return { g: bake(g), w: 37 }; },
  galaxy: () => { const g = new THREE.Group(), M = T(0xd9c3a0), B = T(0xb59a75);
    const curve = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 12, 40, 1, false, -Math.PI * .28, Math.PI * .56), M); curve.position.set(0, 6, -16); g.add(curve);
    for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(16.08, 16.08, .25, 40, 1, true, -Math.PI * .28, Math.PI * .56), B); r.position.set(0, 2.6 * i + 1.4, -16); g.add(r); }
    board(BIG('GALAXY', { bg: '#d9c3a0', fg: '#6a5233', font: '700' }), 10, 1.6, 0, 10.2, .1, g); glassFront(g, 12, 2.6); rbs(24, 1, 2, .2, B, 0, 3.1, 0, g); return { g: bake(g), w: 30 }; },
  airport: () => { const g = new THREE.Group(); rbs(40, 9, 18, .3, T(0x8d939c), 0, 0, -13, g); rbs(40.4, .6, 18.4, .2, T(0x6a7079), 0, 9, -13, g);
    board(BIG('London Luton Airport', { bg: '#8d939c', fg: '#ffffff', font: '700' }), 14, 1.6, -6, 6.6, -3.9, g); glassFront(g, 30, 3.2);
    for (let i = -18; i <= 18; i += 6) cyl(.12, .12, 4, T(0xe8e8e8), i, 2, -1.5, g, 8); rbs(40, .25, 4, .12, T(0xf4f4f4), 0, 4, -2, g); return { g: bake(g), w: 44 }; },
  station: () => { const g = new THREE.Group(); rbs(18, 5.5, 10, .2, T(C.brick), 0, 0, -5, g); parapet(g, 18, 5.5, 10, T(0xe7e2d8)); glassFront(g, 6, 2.6); fascia(g, BIG('Luton', { bg: '#ffffff', fg: '#1f3f8f', sub: 'STATION', subFg: '#c8302a' }), 4, 1, 3.4, .12, 0xffffff);
    rbs(30, .3, 6, .1, T(0x6f7680), 0, 6.5, -14, g); for (let i = -12; i <= 12; i += 6) cyl(.2, .2, 6.5, T(0x6f7680), i, 3.25, -12, g, 8); return { g: bake(g), w: 32 }; },
  townhall: () => { const g = new THREE.Group(), S1 = T(0xe9e2d2), S2 = T(0xd8cfbb); rbs(30, 9, 14, .2, S1, 0, 0, -9, g); parapet(g, 30, 9, 14, S2);
    for (let i = 0; i < 7; i++) { cyl(.45, .45, 6, S2, -12 + i * 4, 3 + 1.5, -1.6, g, 14); win(g, -12 + i * 4 + 2, 6.2, 1.3, 2.2); } rbs(30, .6, 2.4, .2, S2, 0, 7.6, -1.3, g);
    rbs(5, 26, 5, .2, S1, 0, 0, -6, g); rbs(5.6, .7, 5.6, .2, S2, 0, 26, -6, g); clockFace(g, 0, 21, -3.45, 1.6); const cap = roof(4.6, 4.6, 2.8, T(0x6d8a7c)); cap.position.set(0, 26.6, -6); g.add(cap);
    door(g, 0, 2.4, 3.2, 0x4a3a2c); return { g: bake(g), w: 34 }; },
  masjid: () => { const g = new THREE.Group(), B = T(0xb0603f), Bd = T(0x8f4a32); rbs(22, 8, 16, .2, B, 0, 0, -10, g); parapet(g, 22, 8, 16, Bd);
    for (let i = 0; i < 5; i++) { const x = -8 + i * 4; rbs(2, 3.6, .2, .9, T(0x3a2a22), x, 1.2, -1.95, g); } sph(5, T(0x4e8a6a), 0, 8.4, -10, g, 1, 1.05, 1, 28); cyl(.25, .25, 1.2, T(0xe2c36a), 0, 14, -10, g, 8);
    cyl(1.1, 1.3, 20, B, 12, 10, -3, g, 18); cyl(1.6, 1.6, .5, Bd, 12, 18, -3, g, 18); cyl(1.4, 1.4, .5, Bd, 12, 20, -3, g, 16); cyl(.9, .9, 2.4, B, 12, 21.4, -3, g, 16); sph(.95, T(0x4e8a6a), 12, 22.6, -3, g, 1, 1.4, 1, 16);
    board(BIG('LUTON CENTRAL MOSQUE', { bg: '#2f5a44', fg: '#f3e6c4' }), 9, 1.1, 0, 6.4, -1.88, g); rbs(26, 1, .3, .1, T(0x2a2a2a), 0, 0, -.2, g); return { g: bake(g), w: 30 }; },
  masjidali: () => { const g = new THREE.Group(), GL = T(0x6f9bc0, { emissive: 0x1a3550, emissiveIntensity: .3 }), S = T(0xeef0f2);
    [-6, 0, 6].forEach((x, i) => { const tri = new THREE.Mesh(new THREE.ConeGeometry(5.2, 9 + i % 2 * 2, 4, 1), GL); tri.rotation.y = Math.PI / 4; tri.position.set(x, (9 + i % 2 * 2) / 2, -6); g.add(tri); });
    rbs(22, 3, 10, .2, S, 0, 0, -6, g); cyl(.12, .12, 14, T(0xd8d8d8), 11, 7, -1, g, 8); rb(2.4, 1.4, .06, .02, T(0x2e8a52), 12.2, 13, -1, g); board(BIG('MASJID-E-ALI', { bg: '#eef0f2', fg: '#7a5a2a' }), 6, .8, 0, 2.2, -.95, g); return { g: bake(g), w: 26 }; },
  suffa: () => shop({ w: 14, floors: 1, wall: 0xf0e6d2, roof: 'flat', trim: 0x3a3a3a, sign: BIG('Suffa-Tul-Islam Masjid', { bg: '#3a3a3a', fg: '#f0e6d2', font: '600' }), signBg: 0x3a3a3a,
    extra: (g, W, H) => { for (let i = 0; i < 4; i++) { const x = -W / 2 + 2 + i * 3.4; rbs(1.8, 2.4, .2, .85, T(0x2a2a2a), x, H - 2.9, .02, g); } } }),
  gurdwara: () => { const g = new THREE.Group(), S = T(0xefe7d6); rbs(26, 9, 14, .2, S, 0, 0, -8, g); parapet(g, 26, 9, 14, T(0xd9c8a8));
    for (let i = 0; i < 8; i++) win(g, -11 + i * 3.1, 6, 1.2, 1.8); sph(2.6, T(0xe2c36a), 0, 11.2, -4, g, 1, 1.2, 1, 22); rbs(6, 2.6, 6, .3, S, 0, 9, -4, g); door(g, 0, 2.2, 3, 0x7a5a2a);
    board(BIG('GURDWARA SAHIB LUTON', { bg: '#1f3f8f', fg: '#ffffff' }), 8, 1, 0, 3.8, .06, g); return { g: bake(g), w: 30 }; },
  stmarys: () => { const g = new THREE.Group(), St = T(0xb9b1a0), Sd = T(0x9c9483); rbs(24, 9, 12, .2, St, 0, 0, -10, g); const r = roof(24, 12, 5, T(C.roofGrey), 'gable'); r.position.set(0, 9, -10); g.add(r);
    for (let i = 0; i < 4; i++) rbs(1.4, 4.6, .2, .7, T(0x4d6b8a), -9 + i * 6, 2.8, -3.95, g); rbs(6, 22, 6, .2, St, -14, 0, -6, g); for (let i = 0; i < 6; i++) rbs(1, 1.2, 1, .1, Sd, -16.5 + i, 22, -3.5, g);
    rbs(60, .9, .5, .1, T(0x8a8270), 0, 0, -.3, g); const lawn = plane(28, 3, T(0xffffff, { map: grassT }), 0, .03, -2, g); lawn.rotation.x = -Math.PI / 2; return { g: bake(g), w: 34 }; },
  lutonhoo: () => { const g = new THREE.Group(), St = T(0xe6dcc6), Sd = T(0xd2c6ac); const lawn = plane(40, 14, T(0x7fae5f), 0, .03, -7, g); lawn.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 6; i++) { const s = plane(40, 1.1, T(0x8dbd6a), 0, .04, -1 - i * 2.3, g); s.rotation.x = -Math.PI / 2; }
    rbs(36, 12, 14, .2, St, 0, 0, -21, g); parapet(g, 36, 12, 14, Sd).position.z = -21; for (let f = 0; f < 3; f++) for (let i = 0; i < 9; i++) win({ add: m => { m.position.z -= 14; g.add(m); } }, -16 + i * 4, 2 + f * 3.6, 1.4, 2.2);
    for (let i = 0; i < 6; i++) cyl(.5, .5, 9, Sd, -7.5 + i * 3, 4.5, -13.2, g, 14); const pd = roof(18, 3, 2.6, Sd, 'gable'); pd.position.set(0, 9.2, -12.5); g.add(pd);
    rbs(4, 1.6, 3, .6, T(0x2a2c30), 10, 0, -5, g); cyl(.06, .06, 6, T(0x2a2c30), 10, 2, -5, g, 6); return { g: bake(g), w: 44 }; },
  marshfarm: () => { const g = new THREE.Group(); [[-10, 40, 0x4a6fa8], [2, 34, 0x5a82b8], [13, 28, 0x3e5f94]].forEach(([x, h, c]) => { rbs(8, h, 8, .2, T(c), x, 0, -10 - (x + 10) * .3, g);
      for (let f = 1; f < h / 2.8; f++) for (let i = 0; i < 3; i++) plane(1.3, 1.3, WINM[(f + i) % 6], x - 2.5 + i * 2.5, f * 2.8, -6 - (x + 10) * .3 + .02, g); });
    const lawn = plane(30, 6, T(0xffffff, { map: grassT }), 0, .03, -3, g); lawn.rotation.x = -Math.PI / 2; tree(g, -6, -2); tree(g, 8, -3, .9); return { g: bake(g), w: 32 }; },
  hatfactory: () => { const g = new THREE.Group(); rbs(12, 15, 10, .2, T(C.brick), 0, 0, -5, g); const r = roof(12, 10, 4, T(C.roofGrey), 'gable'); r.rotation.y = Math.PI / 2; r.position.set(0, 15, -5); g.add(r);
    board(S('', { w: 768, h: 1024, bg: '#3a5fae', fg: '#f06aa6', size: 10, extra: (x, w, h) => { x.fillStyle = '#f06aa6'; x.font = '800 104px Mont, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; ['OPEN', 'TO NEW', 'IDEAS', 'LUTON'].forEach((t, i) => x.fillText(t, w / 2, 200 + i * 210)); } }), 8, 10.5, 0, 7.5, .05, g); return { g: bake(g), w: 15 }; },
  welcome: () => { const g = new THREE.Group(); [-2.2, 2.2].forEach(x => cyl(.12, .12, 3.2, T(0x2a2a2a), x, 1.6, -1, g, 8));
    board(S('Welcome to Luton', { w: 1024, h: 600, bg: '#ffffff', fg: '#4b2a7a', size: 130, extra: (x, w, h) => { x.fillStyle = '#4b2a7a'; x.fillRect(0, h * .62, w, h * .38); x.fillStyle = '#fff'; x.font = '700 60px Mont, Arial'; x.textAlign = 'center'; x.fillText('Home of London Luton Airport', w / 2, h * .82); } }), 4.6, 2.7, 0, 3.2, -.95, g);
    rbs(14, .5, 6, .4, T(0x7fae5f), 0, 0, -3, g); [[-4, .3], [4, -.6]].forEach(([x, z]) => tree(g, x, -3 + z, .8)); return { g: bake(g), w: 16 }; },
  letters: () => { const g = new THREE.Group(); const pl = plane(16, 6, T(0xd9d1c3), 0, .03, -3, g); pl.rotation.x = -Math.PI / 2;
    'LUTON'.split('').forEach((ch, i) => { const t = S(ch, { w: 256, h: 320, bg: 'rgba(0,0,0,0)', fg: '#d8442f', size: 300, stroke: '#a8301f' }); rbs(2.2, 2.6, .6, .2, T(0xd8442f), -5 + i * 2.5, 0, -3, g); board(t, 2.2, 2.6, -5 + i * 2.5, 1.3, -2.68, g); });
    return { g: bake(g), w: 17 }; },
  stockwood: () => { const g = new THREE.Group(); rbs(22, 1.6, .5, .2, T(C.brick), 0, 0, -.4, g); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) rbs(3.6, .9, 3.6, .4, T(C.hedge), -8 + i * 5.3, 0, -4 - j * 5, g);
    tree(g, -9, -12); tree(g, 9, -11, 1.2); board(BIG('STOCKWOOD DISCOVERY CENTRE', { bg: '#2f5a44', fg: '#ffffff' }), 8, .9, 0, 2.2, -.1, g); return { g: bake(g), w: 24 }; },
  funfair: () => { const g = new THREE.Group(); const grass = plane(30, 16, T(0xffffff, { map: grassT }), 0, .03, -8, g); grass.rotation.x = -Math.PI / 2;
    const wh = new THREE.Group(); wh.position.set(4, 9, -10); g.add(wh); const ring = new THREE.Mesh(new THREE.TorusGeometry(7, .18, 8, 40), T(0xf2f2f2)); wh.add(ring);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rb(.12, 7, .12, .05, T(0xdcdcdc), Math.cos(a) * 3.5, Math.sin(a) * 3.5, 0, wh).rotation.z = a + Math.PI / 2; rbs(1, .9, .9, .3, T([0xd8443c, 0xf2c230, 0x4a77b8, 0x3d9a68][i % 4]), Math.cos(a) * 7, Math.sin(a) * 7 - .9, 0, wh); }
    [[-2, 0], [6, 0]].forEach(([x]) => rb(.3, 9.5, .3, .1, T(0xbcbcbc), x - 0, 4.6, -10, g).rotation.z = x < 4 ? -.4 : .4);
    [[-10, -6, 0xd8443c], [-5, -4, 0x4a77b8]].forEach(([x, z, c]) => { cyl(2.4, 2.4, 2.4, T(0xf6f1e6), x, 1.2, z, g, 16); const top = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2, 16), T(c)); top.position.set(x, 3.4, z); g.add(top); });
    return { g: bake(g), w: 32 }; },
  wardown: () => { const g = new THREE.Group(); const w = plane(28, 12, T(0x6fa3c4, { emissive: 0x1f4a6a, emissiveIntensity: .2 }), 0, .05, -9, g); w.rotation.x = -Math.PI / 2;
    const bank = plane(32, 3, T(0xffffff, { map: grassT }), 0, .04, -1.5, g); bank.rotation.x = -Math.PI / 2; rbs(30, .9, .12, .05, T(0x2a2c30), 0, 0, -.3, g);
    for (let i = 0; i < 14; i++) rb(.06, .9, .06, .02, T(0x2a2c30), -14 + i * 2.15, .45, -.3, g); tree(g, -12, -13, 1.3); tree(g, 10, -15, 1.1);
    const bh = rbs(6, 3, 5, .2, T(C.brick), 8, 0, -17, g); const r = roof(6, 5, 2, T(C.roofRed)); r.position.set(8, 3, -17); g.add(r); return { g: bake(g), w: 32 }; },
  spudkingz: () => { const g = new THREE.Group(); rbs(4.6, 2.6, 2.2, .3, T(0x1f2226), 0, .4, -2, g); plane(2.8, 1.1, SHOPM[2], 0, 2, -.88, g); board(BIG('Spud Kingz', { bg: '#1f2226', fg: '#8cc63f' }), 3, .6, 0, 3.4, -.86, g);
    [-1.4, 1.4].forEach(x => { const w = cyl(.35, .35, .2, T(0x2a2a2a), x, .35, -.95, g, 14); w.rotation.x = Math.PI / 2; }); rbs(10, .9, .12, .05, T(0x2a2c30), 0, 0, -.2, g); return { g: bake(g), w: 12 }; },
  smr: () => { const g = new THREE.Group(); rbs(10, 9, 8, .2, T(C.brick), 0, 0, -4, g); const r = roof(10, 8, 3, T(C.roofGrey), 'gable'); r.rotation.y = Math.PI / 2; r.position.set(0, 9, -4); g.add(r);
    board(S('SMR', { w: 1024, h: 700, grad: ['#7b3fe4', '#ff4fa3'], fg: '#ffffff', size: 300, extra: (x, w, h) => { x.fillStyle = '#fff'; x.font = '700 70px Mont, Arial'; x.textAlign = 'center'; x.fillText('APPS · WEBSITES · PRINT', w / 2, h * .8); x.font = '600 48px Mont, Arial'; x.fillText('smrgraphics.co.uk', w / 2, h * .92); } }), 8, 5.4, 0, 5.6, .05, g);
    door(g, 0, 1.2, 2.2, 0x2a2d33); return { g: bake(g), w: 12 }; },
};
// office / college / hospital block: storeys of ribbon windows with coloured bands, glazed entrance and name sign
function office(o) { const g = new THREE.Group(), W = o.w, F = o.floors, H = 1 + F * 3.4, M = T(o.wall), Bd = T(o.band);
  const lawn = plane(W, 4, T(0xffffff, { map: grassT }), 0, .03, -2, g); lawn.rotation.x = -Math.PI / 2;
  const b = new THREE.Group(); b.position.z = -4; g.add(b); wall(b, W, H, 14, M); parapet(b, W, H, 14, Bd);
  for (let f = 0; f < F; f++) { rbs(W + .1, .35, .1, .05, Bd, 0, 1 + f * 3.4 + 2.6, .02, b); const n = Math.round(W / 2.4); for (let i = 0; i < n; i++) plane(1.8, 1.7, WINM[(f * 3 + i) % 6], -W / 2 + (i + .5) * W / n, 1 + f * 3.4 + 1.4, .03, b); }
  rbs(8, 4, 2, .3, Bd, 0, 0, 1, b); plane(6, 2.8, SHOPM[0], 0, 1.5, 2.02, b); board(o.sign, Math.min(W * .6, 16), 1.4, 0, H - 1.2, .08, b); if (o.extra) o.extra(b, W);
  return { g: bake(g), w: W + 2 }; }
function clockFace(g, x, y, z, r = 1.1) { const t = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#f6f2e6'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.lineWidth = 10; c.strokeStyle = '#2a2a2a'; c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillStyle = '#2a2a2a'; c.fillRect(128 + Math.sin(a) * 96 - 4, 128 - Math.cos(a) * 96 - 10, 8, 20); }
  const d = new Date(), hA = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2, mA = d.getMinutes() / 60 * Math.PI * 2; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(hA) * 55, 128 - Math.cos(hA) * 55); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(mA) * 85, 128 - Math.cos(mA) * 85); c.stroke(); });
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), U({ map: t })); m.position.set(x, y, z + .06); g.add(m); }
export const LM_NAMES = { alquds: 'Al-Quds', krispy: 'Krispy Lemon Chicken', gna: 'G&A Fast Food', kahwa: 'Kahwa Cafe', karwan: 'Karwan', toros: "Toro's Steakhouse", topspizza: 'Tops Pizza', miamicrispy: 'Miami Crispy',
  periperi: 'Peri-Peri Original', cycleking: 'Cycle King', barak: 'The Barak', chaiiwala: 'Chaiiwala', kaya: 'Kaya Lounge', nadeem: 'Nadeem Plaza', oak: 'Kenilworth Road · Oak Stand', foodbank: 'Luton Foodbank',
  bandq: 'B&Q', bigyellow: 'Big Yellow', currys: 'Currys', lidl: 'Lidl', matalan: 'Matalan', tesco: 'Tesco Extra', jdgyms: 'JD Gyms', orbital: 'Orbital Trampoline Park', grandbazar: 'Grand Bazar', nandos: "Nando's", venue: 'Venue Central',
  vauxhall: 'Vauxhall', chiltern: 'Chiltern', sixthform: 'Luton Sixth Form College', lewsey: 'Lewsey Sports Park', inspire: 'Inspire Luton Sports Village', uob: 'University of Bedfordshire', ldh: 'Luton & Dunstable Hospital',
  frasers: 'Frasers Plus', galaxy: 'The Galaxy', airport: 'London Luton Airport', station: 'Luton Station', townhall: 'Luton Town Hall', masjid: 'Luton Central Mosque', masjidali: 'Masjid-e-Ali', suffa: 'Suffa-Tul-Islam Masjid',
  gurdwara: 'Gurdwara', stmarys: "St Mary's Church", lutonhoo: 'Luton Hoo', marshfarm: 'Marsh Farm', hatfactory: 'The Hat Factory', welcome: 'Welcome to Luton', letters: 'LUTON letters', stockwood: 'Stockwood Park', funfair: 'Wardown funfair',
  wardown: 'Wardown Park', spudkingz: 'Spud Kingz', smr: 'SMR Studio' };
export const HOUSES = { semi, terrace };
