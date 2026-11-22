/* kit.js — the cartoon look for Delivery Rush (Subway Surfers style, our own colours).
   Soft toon shading (smooth ramp, no hard bands), rounded shapes everywhere, crisp high-res signs, and the "curved world"
   bend: every material bends the world down and slightly sideways with distance, like Subway Surfers. No real-time shadows
   (blob shadows instead), so it stays fast on phones. */
import * as THREE from 'three';

export const BEND = { z: { value: 0 }, k: { value: .0016 }, kx: { value: 0 } };
export const LOW = localStorage.getItem('rr_low') === '1';

// smooth toon ramp: dark side never goes black, a soft step into the lit side, a warm top light
const RAMP = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 1; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, '#8a8aa0'); g.addColorStop(.36, '#aeb0c2'); g.addColorStop(.5, '#f0eef0'); g.addColorStop(.8, '#fffcf4'); g.addColorStop(1, '#ffffff'); x.fillStyle = g; x.fillRect(0, 0, 256, 1);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; })();

const bendVS = `
  vec4 mvPosition = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
  #endif
  vec4 bwp = modelMatrix * mvPosition;
  float bdz = min(0.0, bwp.z - uBendZ);
  bwp.y -= bdz * bdz * uBendK;
  bwp.x += bdz * bdz * uBendKX;
  mvPosition = viewMatrix * bwp;
  gl_Position = projectionMatrix * mvPosition;`;
export function bendify(m) {
  m.onBeforeCompile = sh => { sh.uniforms.uBendZ = BEND.z; sh.uniforms.uBendK = BEND.k; sh.uniforms.uBendKX = BEND.kx;
    sh.vertexShader = 'uniform float uBendZ; uniform float uBendK; uniform float uBendKX;\n' + sh.vertexShader.replace('#include <project_vertex>', bendVS); };
  m.customProgramCacheKey = () => 'bend'; return m; }
const MC = new Map();
/** cartoon material (cached by colour + options) */
export const T = (c, o = {}) => { const k = c + '|' + JSON.stringify(o, (kk, v) => v && v.isTexture ? v.uuid : v); if (MC.has(k)) return MC.get(k);
  const m = bendify(new THREE.MeshToonMaterial({ color: c, gradientMap: RAMP, ...o })); MC.set(k, m); return m; };
/** unlit material (signs, glows) */
export const U = (o) => bendify(new THREE.MeshBasicMaterial(o));

/* ---------- rounded box: real rounded edges and corners (not a bevel hack) ---------- */
const RBC = new Map();
export function RBGeo(w, h, d, r, s = r < .07 ? 1 : r < .2 ? 2 : 3) { const k = [w, h, d, r, s].map(v => +v.toFixed(3)).join(); if (RBC.has(k)) return RBC.get(k);
  r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001); const n = s * 2 + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), P = g.attributes.position, N = g.attributes.normal, ins = [w / 2 - r, h / 2 - r, d / 2 - r];
  const map = (u, i) => { const kk = Math.round((u + .5) * n); if (kk <= s) return -(ins[i] + r * Math.cos(Math.PI / 2 * kk / s)); if (kk >= n - s) return ins[i] + r * Math.cos(Math.PI / 2 * (n - kk) / s); return -ins[i] + 2 * ins[i] * (kk - s) / (n - 2 * s); };
  const v = new THREE.Vector3(), inn = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) { v.set(map(P.getX(i), 0), map(P.getY(i), 1), map(P.getZ(i), 2)); inn.set(Math.max(-ins[0], Math.min(ins[0], v.x)), Math.max(-ins[1], Math.min(ins[1], v.y)), Math.max(-ins[2], Math.min(ins[2], v.z)));
    v.sub(inn); const L = v.length(); if (L > 1e-6) { v.multiplyScalar(r / L); N.setXYZ(i, v.x / r, v.y / r, v.z / r); } v.add(inn); P.setXYZ(i, v.x, v.y, v.z); }
  g.computeBoundingSphere(); g.userData.shared = 1; RBC.set(k, g); return g; }
const add = (g, m, x, y, z, parent) => { const me = new THREE.Mesh(g, m); me.position.set(x, y, z); if (parent) parent.add(me); return me; };
/** rounded box, centred at x,y,z */
export const rb = (w, h, d, r, m, x = 0, y = 0, z = 0, p) => add(RBGeo(w, h, d, r), m, x, y, z, p);
/** rounded box sitting on y (bottom at y) */
export const rbs = (w, h, d, r, m, x = 0, y = 0, z = 0, p) => add(RBGeo(w, h, d, r), m, x, y + h / 2, z, p);
const CG = new Map(), cg = (k, f) => CG.get(k) || (CG.set(k, f()), CG.get(k));
export const cyl = (rt, rb_, h, m, x, y, z, p, seg = 20) => add(cg('c' + [rt, rb_, h, seg], () => new THREE.CylinderGeometry(rt, rb_, h, seg)), m, x, y, z, p);
export const sph = (r, m, x, y, z, p, sx = 1, sy = 1, sz = 1, seg = 20) => { const me = add(cg('s' + [r, seg], () => new THREE.SphereGeometry(r, seg, Math.round(seg * .7))), m, x, y, z, p); me.scale.set(sx, sy, sz); return me; };
export const capsule = (r, l, m, x, y, z, p) => add(cg('k' + [r, l], () => new THREE.CapsuleGeometry(r, l, 6, 14)), m, x, y, z, p);
export const plane = (w, h, m, x, y, z, p) => add(cg('p' + [w, h], () => new THREE.PlaneGeometry(w, h)), m, x, y, z, p);
/** hipped / gable roof from a profile, with a small rounded ridge */
export function roof(w, d, h, m, kind = 'hip', over = .25) { const W = w / 2 + over, D = d / 2 + over, rx = kind === 'hip' ? Math.max(.05, W - D) : W;
  const v = [[-W, 0, D], [W, 0, D], [W, 0, -D], [-W, 0, -D], [-rx, h, 0], [rx, h, 0]], f = [[0, 1, 5], [0, 5, 4], [2, 3, 4], [2, 4, 5], [1, 2, 5], [3, 0, 4]], pos = [];
  f.forEach(t => t.forEach(i => pos.push(...v[i]))); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, m)); const rid = new THREE.Mesh(cg('rid' + rx, () => { const c = new THREE.CapsuleGeometry(.09, Math.max(.01, rx * 2), 4, 8); c.rotateZ(Math.PI / 2); return c; }), m); rid.position.y = h; grp.add(rid); return grp; }

/* ---------- crisp sign textures (drawn at high resolution so nothing looks pixelated) ---------- */
export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
export const rr = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
/** sign: text on a board. o = { bg, fg, font, sub, subFg, stroke, w, h, align, grad:[c1,c2], round } */
export function sign(txt, o = {}) { const W = o.w || 1024, H = o.h || 256; return canvasTex(W, H, (x, w, h) => {
  if (o.grad) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); x.fillStyle = g; } else x.fillStyle = o.bg || '#222';
  if (o.round) { rr(x, 0, 0, w, h, o.round); x.fill(); } else x.fillRect(0, 0, w, h);
  if (o.border) { x.strokeStyle = o.border; x.lineWidth = h * .06; x.strokeRect(h * .03, h * .03, w - h * .06, h * .06 > 0 ? h - h * .06 : h); }
  x.fillStyle = o.fg || '#fff'; x.textAlign = o.align || 'center'; x.textBaseline = 'middle'; const fs = o.size || h * (o.sub ? .5 : .62);
  x.font = (o.font || '800') + ' ' + fs + 'px ' + (o.family || 'Mont, "Arial Black", Arial, sans-serif');
  let tw = x.measureText(txt).width, sc = Math.min(1, (w * .9) / tw); x.save(); const ax = o.align === 'left' ? w * .05 : w / 2; x.translate(ax, o.sub ? h * .4 : h * .53); x.scale(sc, 1);
  if (o.stroke) { x.lineWidth = fs * .12; x.strokeStyle = o.stroke; x.lineJoin = 'round'; x.strokeText(txt, 0, 0); } x.fillText(txt, 0, 0); x.restore();
  if (o.sub) { x.fillStyle = o.subFg || x.fillStyle; x.font = '700 ' + h * .2 + 'px Mont, Arial, sans-serif'; x.fillText(o.sub, w / 2, h * .82); }
  if (o.extra) o.extra(x, w, h); }); }
/** a flat sign board (unlit, slightly glowing) fixed to a parent */
export const board = (t, w, h, x, y, z, p, ry = 0) => { const m = add(cg('p' + [w, h], () => new THREE.PlaneGeometry(w, h)), U({ map: t, toneMapped: false }), x, y, z, p); m.rotation.y = ry; return m; };

/* ---------- soft blob shadow ---------- */
export const SHADOW_T = canvasTex(128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(20,18,40,.5)'); g.addColorStop(.6, 'rgba(20,18,40,.25)'); g.addColorStop(1, 'rgba(20,18,40,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
export const SHADOW_M = U({ map: SHADOW_T, transparent: true, depthWrite: false });
export function blobShadow(w, l, p, y = .02) { const m = new THREE.Mesh(cg('sh', () => { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; }), SHADOW_M); m.scale.set(w, 1, l); m.position.y = y; m.renderOrder = -1; if (p) p.add(m); return m; }

/* ---------- palette: muted, warm, grown-up (not primary-colour kiddy) ---------- */
export const C = {
  road: 0x4a5266, roadLine: 0xf6f7f9, yellow: 0xf2c53c, kerb: 0xd9d6cf, pave: 0xe8dcc6, paveDark: 0xd8c8ae, grass: 0x7cc25a, grassDark: 0x62a845, hedge: 0x4f9a46, tree: 0x63b04a, trunk: 0x8a5e3e,
  brick: 0xc8613f, brickDark: 0xa84d33, render: 0xfbf1df, renderB: 0xf2e4cb, cream: 0xfff3dc, grey: 0xbcc3ce, slate: 0x5f6a82, roofBrown: 0x8e4f3a, roofGrey: 0x5d6782, roofRed: 0xbb5a3e,
  white: 0xffffff, frame: 0xffffff, glass: 0x66a3d6, glassDark: 0x335577, door: 0x3f6fa8, metal: 0x9aa6b6, dark: 0x2e3340, black: 0x22252c,
  green: 0x2fae6a, teal: 0x1fb0b8, orange: 0xf28a2c, red: 0xe2503f, blue: 0x3f7fd6, purple: 0x7a52c8, gold: 0xffc93a };
