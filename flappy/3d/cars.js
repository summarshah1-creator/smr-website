/* cars.js — CARS & TRAFFIC (owner: the Cars & Traffic chat).
   Real meshes (flappy/3d/cars/*.bin + cars.json, made by the car mesh pipeline: interior, badges and source plates removed, decimated,
   scaled to published lengths, nose at -z, wheels on y = 0): A-Class W176 (A45 2018 mesh), C-Class W204 saloon (C63 mesh; owner's photos
   are W205, same family look), Prius Mk3, Audi A1/S1 Sportback. Sources + licences are listed in cars/cars.json (owner reviews licences
   before release). Each model loads ONCE and every copy shares its geometry + materials; colour only swaps the paint material; own UK
   plates (white front, yellow rear). If the meshes fail to load, the coded A-/C-Class shapes (DEFS) and the 3 generic profiles stand in.
   Two detail levels per model (hi near traffic < 16 m, lo far + parked). SMR badges only where the original logo came off cleanly: Mercedes = black disc
   with chrome SMR (front), chrome SMR wordmark (rear); Audi front rings are part of the grille mesh so they stay. Exhaust insides dark, black plate holders.
   Still to find: Polo Mk5, Yaris Mk3, Qashqai, BMW F30/F20, Fiesta Mk7, Corsa E, Jazz, Audi A3 (generic shapes meanwhile).
   Traffic: outgoing lane x -3.6 (nose -z), oncoming x +3.6 turned round; groups pooled. Paint: SMMT 2024 UK colour shares for now. */
import * as THREE from 'three';
import { LOW, box, cyl, mat, rbox, rboxGeo, scene, tex } from './core.js';
import { GLASS } from './materials.js';

/* ================= paint ================= */
export const PAINT = {};
export const paintM = (c, f = 'm') => { const k = c + f; if (PAINT[k]) return PAINT[k]; const solid = f === 's';
  const o = { color: c, roughness: solid ? .3 : f === 'p' ? .28 : .36, metalness: solid ? .02 : .6 };
  return PAINT[k] = LOW ? new THREE.MeshStandardMaterial(o) : new THREE.MeshPhysicalMaterial({ ...o, clearcoat: 1, clearcoatRoughness: .06 }); };
// [colour, finish s=solid m=metallic p=pearl, weight] — SMMT 2024: grey 27.8, black 21.7, blue 14.9, white 14.9, red 7, silver ~6, green 3.5, other ~4.2
export const UK_PAINT = [[0x5b5f66, 'm', 15], [0x868a90, 'm', 12.8], [0x0d0e10, 'p', 21.7], [0x1c3768, 'm', 9], [0x3d6da6, 'm', 5.9], [0xf0f0ed, 's', 9.9], [0xe6e4dc, 'p', 5],
  [0x9b1117, 's', 7], [0xb8bcc1, 'm', 6], [0x253f2e, 'm', 3.5], [0xc0561e, 'm', 2.2], [0x5a4535, 'm', 2]];
const pick = L => { let t = Math.random() * L.reduce((a, b) => a + b[b.length - 1], 0); for (const p of L) if ((t -= p[p.length - 1]) <= 0) return p; return L[0]; };
export const CARC = UK_PAINT.map(p => p[0]);   // kept for houses.js / commercial.js (carG ignores the colour it's given)

/* ================= shared materials ================= */
export const TYRE = mat(0x161616, { roughness: .92 }), RIM = mat(0xb8bcc2, { roughness: .25, metalness: .9 }), TRIM = mat(0x1a1b1e, { roughness: .55 }),
  HEAD = mat(0xf2f4f6, { roughness: .1, metalness: .3, emissive: 0xffffff, emissiveIntensity: .15 }), TAIL = mat(0xa0161a, { roughness: .2, emissive: 0x700000, emissiveIntensity: .4 });
const TRIMD = new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: .95, side: THREE.DoubleSide });

/* ================= helpers ================= */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const spl = (K, u) => { const n = K.length; if (u <= K[0][0]) return K[0][1]; if (u >= K[n - 1][0]) return K[n - 1][1]; let i = 1; while (K[i][0] < u) i++;   // Catmull-Rom through key points
  const p0 = K[Math.max(0, i - 2)], p1 = K[i - 1], p2 = K[i], p3 = K[Math.min(n - 1, i + 1)], h = p2[0] - p1[0], t = (u - p1[0]) / h, t2 = t * t, t3 = t2 * t;
  const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * h, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * h; return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2; };
const Col = () => ({ p: [], n: [], uv: [] });
const put = (C, a, n, uv) => { C.p.push(a.x, a.y, a.z); C.n.push(n.x, n.y, n.z); C.uv.push(uv[0], uv[1]); };
const geoOf = C => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(C.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(C.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(C.uv, 2)); g.userData.shared = 1; g.computeBoundingSphere(); return g; };
const addGeo = (C, geo, m4, uvf) => { const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m4), P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, a = V(), n = V();
  for (let i = 0; i < P.count; i++) { a.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i); const uv = U ? [U.getX(i), U.getY(i)] : [0, 0]; put(C, a, n, uvf ? uvf(uv) : uv); } g.dispose(); };
const M4 = (x, y, z, ry = 0, rz = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, rz)), V(1, 1, 1));
function gridNormals(R) { const S = R.length, W = R[0].length, pos = new Float32Array(S * W * 3), idx = [];      // smooth normals for a loft
  R.forEach((r, i) => r.forEach((v, j) => pos.set([v.x, v.y, v.z], (i * W + j) * 3)));
  for (let i = 0; i < S - 1; i++) for (let j = 0; j < W - 1; j++) { const a = i * W + j, b = a + W, c = b + 1, d = a + 1; idx.push(a, b, d, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const N = g.attributes.normal;
  const out = R.map((r, i) => r.map((_, j) => V(N.getX(i * W + j), N.getY(i * W + j), N.getZ(i * W + j)))); g.dispose(); return out; }
// details-canvas painting helpers (side region: u along the car, y up; faces: x across, y up; rim region)
function painter(D, x, e) { const S = (u, y) => [u / D.L * 1024, 256 - y / 1.6 * 256], F = (X, y) => [(-X / D.W + .5) * 512, 512 - y * 256], B = (X, y) => [512 + (X / D.W + .5) * 512, 512 - y * 256];
  const path = (c, P, f) => { c.beginPath(); P.forEach((p, i) => { const q = f(p[0], p[1]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); };
  const sym = P => P.map(([a, b]) => [-a, b]);
  const H = { S, F, B, x, e, sym,
    poly(P, f, fill, glow) { path(x, P, f); x.fillStyle = fill; x.fill(); if (glow) { path(e, P, f); e.fillStyle = glow; e.fill(); } },
    both(P, f, fill, glow) { H.poly(P, f, fill, glow); H.poly(sym(P), f, fill, glow); },
    line(P, f, col, w = 2, closed) { x.beginPath(); P.forEach((p, i) => { const q = f(p[0], p[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); if (closed) x.closePath(); x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'; x.stroke(); },
    arc: (cx, cy, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }),
    handle(u0, u1, y, h = .035) { H.poly([[u0, y], [u1, y], [u1, y + h], [u0, y + h]], S, 'rgba(0,0,0,0)'); H.line([[u0, y], [u1, y], [u1 - .01, y + h], [u0 + .01, y + h]], S, '#2a2a2c', 2, true); H.line([[u0 + .02, y - .004], [u1 - .02, y - .004]], S, '#0c0c0c', 2); },
    glass(P) { const g = x.createLinearGradient(0, S(0, 1.42)[1], 0, S(0, 1.0)[1]); g.addColorStop(0, '#34424f'); g.addColorStop(.45, '#1b232b'); g.addColorStop(1, '#0a0d11'); H.poly(P, S, g); H.line(P, S, '#050506', 3, true); },
    plate(f, cy, yellow, txt) { const [a, b] = f(.26, cy + .0555), [c, d] = f(-.26, cy - .0555), X0 = Math.min(a, c), Y0 = Math.min(b, d), w = Math.abs(c - a), h = Math.abs(d - b);
      x.fillStyle = '#111'; x.fillRect(X0 - 1, Y0 - 1, w + 2, h + 2); x.fillStyle = yellow ? '#f4c91c' : '#f3f3ee'; x.fillRect(X0, Y0, w, h);
      x.save(); x.fillStyle = '#121212'; x.font = `bold ${Math.round(h * .78)}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.translate(X0 + w / 2, Y0 + h * .55); x.scale(.82, 1); x.fillText(txt, 0, 0); x.restore();
      e.fillStyle = 'rgba(255,255,255,.08)'; e.fillRect(X0, Y0, w, h); },
    rim(draw) { x.save(); x.beginPath(); x.rect(0, 512, 128, 128); x.clip(); x.translate(64, 576); draw(x); x.restore(); } };
  return H; }

/* ================= model builder ================= */
const SEC = [[.94, 0], [.99, .2], [1, .5], [.985, .78], [.94, .93], [.78, .99], [.4, 1], [0, 1]];   // body cross-section (half), bottom to top centre
const TYG = {}; const tyreGeo = (r, w) => TYG[r + '' + w] || (TYG[r + '' + w] = new THREE.LatheGeometry([[.72, -.5], [.95, -.5], [1, -.3], [1, .3], [.95, .5], [.72, .5]].map(([a, b]) => new THREE.Vector2(a * r, b * w)), 12).rotateZ(Math.PI / 2));
function buildModel(D) {
  const L = D.L, C = { paint: Col(), glass: Col(), det: Col(), trim: Col(), lin: Col(), tyre: Col() };
  const cv = document.createElement('canvas'), ev = document.createElement('canvas'); cv.width = ev.width = 1024; cv.height = ev.height = 640;
  const x = cv.getContext('2d'), e = ev.getContext('2d'); e.fillStyle = '#000'; e.fillRect(0, 0, 1024, 640); D.draw(painter(D, x, e));
  const A = x.getImageData(0, 0, 1024, 640).data, alpha = (u, v) => A[((Math.min(639, Math.max(0, ((1 - v) * 640) | 0)) * 1024 + Math.min(1023, Math.max(0, (u * 1024) | 0))) << 2) + 3];
  const sideUV = (u, y) => [u / L, 1 - (1 - y / 1.6) * .4], faceUV = (X, y, rear) => [rear ? .5 + (X / D.W + .5) * .5 : (-X / D.W + .5) * .5, 1 - (512 - y * 256) / 640];
  const covered = Q => { for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) { const s = a / 4, t = b / 4, u = (Q[0][0] * (1 - s) + Q[1][0] * s) * (1 - t) + (Q[3][0] * (1 - s) + Q[2][0] * s) * t, v = (Q[0][1] * (1 - s) + Q[1][1] * s) * (1 - t) + (Q[3][1] * (1 - s) + Q[2][1] * s) * t; if (alpha(u, v) > 100) return true; } return false; };
  const yt = u => spl(D.yt, u), hw = u => spl(D.hw, u), yb = u => { let y = spl(D.yb, u); for (const a of [D.fa, D.ra]) { const d = u - a; if (Math.abs(d) < D.R) y = Math.max(y, D.r + .02 + Math.sqrt(D.R * D.R - d * d)); } return y; };
  // quads from a loft into a collector; side = add an offset copy on the details canvas (only where something is drawn)
  const quads = (R, N, us, cls) => { for (let i = 0; i < R.length - 1; i++) for (let j = 0; j < R[0].length - 1; j++) { const k = cls(i, j, (us[i] + us[i + 1]) / 2); if (!k) continue;
    const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], P = q.map(([a, b]) => R[a][b]), Nn = q.map(([a, b]) => N[a][b]);
    const tri = (Cc, ix, off, uvs) => ix.forEach(t => put(Cc, off ? P[t].clone().addScaledVector(Nn[t], off) : P[t], Nn[t], uvs ? uvs[t] : [0, 0]));
    tri(C[k.m], [0, 1, 3, 1, 2, 3]); if (k.side) { const uvs = q.map(([a], t) => sideUV(us[a], P[t].y)); if (covered(uvs)) tri(C.det, [0, 1, 3, 1, 2, 3], .004, uvs); } } };
  // ---- lower body
  const us = []; for (let u = 0; u < L - .02; u += .15) us.push(u); us.push(L, .035, .08, L - .035, L - .08); [D.fa, D.ra].forEach(a => { for (let d = -D.R; d <= D.R + .001; d += D.R / 5) us.push(a + d); });
  us.sort((a, b) => a - b); for (let i = us.length - 2; i > 0; i--) if (us[i + 1] - us[i] < .025) us.splice(i, 1);
  const ring = u => { const z = u - L / 2, b = yb(u), t = yt(u), w = hw(u), pt = ([fx, fy], s) => V(s * fx * w, b + fy * (t - b) + (fy > .9 ? D.crown * (1 - fx * fx) : 0), z);
    return [...SEC.map(p => pt(p, -1)), ...SEC.slice(0, -1).reverse().map(p => pt(p, 1))]; };
  const BR = us.map(ring), BN = gridNormals(BR), NS = SEC.length - 1;
  quads(BR, BN, us, (i, j) => ({ m: 'paint', side: j < 4 || j >= 2 * NS - 4 }));
  [0, us.length - 1].forEach(i => { const r = BR[i], rear = i > 0, n = V(0, 0, rear ? 1 : -1), c = V(0, r.reduce((s, p) => s + p.y, 0) / r.length, r[0].z), P = [...r, r[0]];   // nose / tail faces
    for (let j = 0; j < P.length - 1; j++) { let a = P[j], b = P[j + 1]; if (b.clone().sub(c).cross(a.clone().sub(c)).z * n.z < 0) [a, b] = [b, a];
      [c, b, a].forEach(p => put(C.paint, p, n, [0, 0])); [c, b, a].forEach(p => put(C.det, p.clone().addScaledVector(n, .004), n, faceUV(p.x, p.y, rear))); } });
  // ---- glasshouse (windscreen, roof, pillars, rear screen); side glass + B-pillar come from the details canvas
  const cs = []; for (let u = D.c0; u < D.c1 - .02; u += .15) cs.push(u); cs.push(D.c1, D.ws1, D.rs0); cs.sort((a, b) => a - b); for (let i = cs.length - 2; i > 0; i--) if (cs[i + 1] - cs[i] < .02) cs.splice(i, 1);
  const cring = u => { const z = u - L / 2, belt = yt(u) - .05, hb = hw(u) * .915, top = Math.max(belt, spl(D.top, u)), k = Math.min(1, (top - belt) / .3), ex = hb + (D.rw - hb) * k, ey = top - .06 * k;
    const half = [[hb, belt], [hb + (ex - hb) * .5 + .01 * k, belt + (ey - belt) * .5], [ex, ey], [ex * .84, top - .014 * k], [0, top]];
    return [...half.map(([a, b]) => V(-a, b, z)), ...half.slice(0, -1).reverse().map(([a, b]) => V(a, b, z))]; };
  const CR = cs.map(cring), CN = gridNormals(CR);
  quads(CR, CN, cs, (i, j, u) => { if (j === 3 || j === 4) return { m: (u < D.ws1 || u > D.rs0) ? 'glass' : 'paint' }; if (j === 2 || j === 5) return { m: (u < D.ws1 && D.apillar) ? 'trim' : 'paint' }; return { m: 'paint', side: true }; });
  // ---- wheels, arch liners, underbody, mirrors
  const rimUV = ([u, v]) => [u * 128 / 1024, 1 - (512 + (1 - v) * 128) / 640];
  [D.fa, D.ra].forEach(a => [-1, 1].forEach(s => { const z = a - L / 2, X = s * D.tr / 2;
    addGeo(C.tyre, tyreGeo(D.r, D.tw), M4(X, D.r, z));
    addGeo(C.det, new THREE.CircleGeometry(D.r * .72, 18), M4(X + s * (D.tw / 2 - .03), D.r, z, s * Math.PI / 2), rimUV);
    addGeo(C.trim, new THREE.CircleGeometry(D.r * .71, 12), M4(X + s * (D.tw / 2 - .11), D.r, z, s * Math.PI / 2));
    addGeo(C.lin, new THREE.CylinderGeometry(D.R - .015, D.R - .015, .34, 10, 1, true, 0, Math.PI), M4(s * (hw(a) - .2), D.r + .02, z, 0, Math.PI / 2)); }));
  addGeo(C.trim, new THREE.BoxGeometry(1.2, .2, L - .5), M4(0, .27, 0));
  [-1, 1].forEach(s => { const u = D.c0 + .2, z = u - L / 2, belt = yt(u), hb = hw(u) * .915;
    addGeo(C.paint, rboxGeo(.21, .115, .1, .035), M4(s * (hb + .13), belt + .09, z)); addGeo(C.trim, new THREE.BoxGeometry(.09, .035, .05), M4(s * (hb + .03), belt + .06, z + .02)); });
  // ---- materials + parts
  const map = new THREE.CanvasTexture(cv), em = new THREE.CanvasTexture(ev); [map, em].forEach(t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; });
  const det = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: .45, alphaTest: .5, roughness: .22, metalness: .25 });
  const parts = [['paint', 'paint'], [GLASS, 'glass'], [det, 'det'], [TRIM, 'trim'], [TRIMD, 'lin'], [TYRE, 'tyre']].filter(([, k]) => C[k].p.length).map(([m, k]) => [geoOf(C[k]), m]);
  return { key: D.key, name: D.name, paints: D.paints || UK_PAINT, parts, tris: parts.reduce((s, [g]) => s + g.attributes.position.count / 3, 0), D }; }

/* ================= the models (metres; u = distance back from the front bumper) ================= */
const DEFS = {
  // Mercedes A-Class W176 facelift 2015-18, 5-door hatch, AMG Line: 4299 long, 1780 wide, 1417-1433 high, wheelbase 2699, track 1553; 225/40 R18
  aclass: { key: 'aclass', name: 'A-Class (W176)', L: 4.299, W: 1.78, fa: .87, ra: 3.569, r: .319, R: .385, tr: 1.553, tw: .225, crown: .03, rw: .655, apillar: 1,
    yt: [[0, .78], [.1, .81], [.35, .86], [.8, .91], [1.2, .955], [1.45, .99], [2.2, 1.0], [2.9, 1.03], [3.4, 1.06], [3.75, 1.08], [4.0, 1.07], [4.2, 1.03], [4.299, .98]],
    yb: [[0, .22], [.4, .2], [.9, .22], [1.3, .23], [3.2, .23], [3.8, .28], [4.299, .32]],
    hw: [[0, .75], [.06, .81], [.2, .86], [.45, .885], [.9, .89], [3.6, .89], [3.95, .88], [4.15, .85], [4.299, .77]],
    c0: 1.45, c1: 4.21, ws1: 2.1, rs0: 3.86, top: [[1.45, .985], [1.62, 1.1], [1.85, 1.25], [2.08, 1.37], [2.45, 1.418], [2.9, 1.41], [3.4, 1.375], [3.75, 1.335], [3.88, 1.29], [4.02, 1.18], [4.14, 1.08], [4.21, 1.04]],
    draw(h) { const { S, F, B, x } = h, fa = this.fa, ra = this.ra, R = this.R, r = this.r;
      // side: skirt, rear bumper vent, front corner intake, door shut lines, handles, glass, B-pillar, lights
      h.poly([[fa + R + .02, .2], [ra - R - .02, .2], [ra - R - .02, .245], [fa + R + .02, .245]], S, '#141416');
      h.poly([[4.12, .36], [4.16, .36], [4.19, .56], [4.15, .56]], S, '#0b0b0c'); h.poly([[0, .25], [.2, .25], [.26, .42], [0, .46]], S, '#0e0e10');
      const fd = fa + R + .06; h.line([[fd, .27], [fd, .72], [fd + .05, 1.0]], S, '#141414'); h.line([[2.6, .27], [2.6, 1.02]], S, '#141414'); h.line([[fd, .27], [ra - R - .1, .27]], S, '#141414');
      const rr = R + .05, ad = Math.acos(-.1 / rr) * 180 / Math.PI; h.line([[ra - .1, 1.05], ...h.arc(ra, r + .02, rr, ad, 168)], S, '#141414');
      h.handle(2.27, 2.45, .925); h.handle(3.1, 3.26, .955);
      h.glass([[1.52, .985], [1.64, 1.07], [2.06, 1.335], [2.3, 1.37], [3.1, 1.35], [3.5, 1.29], [3.79, 1.16], [3.81, 1.1], [3.6, 1.075], [2.9, 1.035], [2.0, 1.0]]);
      h.poly([[2.55, .99], [2.66, .995], [2.66, 1.37], [2.55, 1.37]], S, '#050506'); h.poly([[3.38, 1.05], [3.41, 1.05], [3.41, 1.33], [3.38, 1.33]], S, '#08080a');
      h.poly([[.02, .72], [.3, .8], [.52, .865], [.46, .8], [.25, .72], [.05, .66]], S, '#17191c'); h.poly([[.05, .7], [.3, .775], [.46, .83], [.42, .795], [.22, .72], [.06, .68]], S, '#cfd6dc', '#ffffff');
      h.poly([[3.96, .985], [4.29, .975], [4.29, .84], [4.06, .885]], S, '#7a0b11', '#c0181e'); h.line([[4.02, .93], [4.29, .92]], S, '#ff5a5a', 2);
      // front: lower lip, intake, AMG blade, corner intakes, diamond grille, headlights, plate
      h.both([[0, .19], [.6, .19], [.68, .23], [0, .23]], F, '#0d0d0f'); h.both([[0, .22], [.52, .22], [.6, .345], [0, .345]], F, '#111214');
      for (let k = 0; k < 4; k++) h.both([[0, .24 + k * .025], [.55, .24 + k * .025], [.55, .247 + k * .025], [0, .247 + k * .025]], F, '#2a2b2e');
      h.both([[0, .338], [.62, .338], [.69, .31], [.69, .322], [.63, .352], [0, .352]], F, '#c7cacd'); h.both([[.6, .23], [.69, .24], [.69, .44], [.62, .42]], F, '#0e0f11');
      h.both([[0, .45], [.36, .45], [.31, .69], [0, .69]], F, '#0b0b0c'); const [gx, gy] = F(.34, .685), [gx2, gy2] = F(-.34, .455);
      x.save(); h.poly([[.355, .455], [.308, .685], [-.308, .685], [-.355, .455]], F, 'rgba(0,0,0,0)'); x.clip(); x.fillStyle = '#b9bdc2'; for (let yy = gy; yy < gy2; yy += 5) for (let xx = gx + ((yy - gy) / 5 % 2) * 3; xx < gx2; xx += 6) x.fillRect(xx, yy, 2, 2); x.restore();
      h.line([[.36, .45], [.31, .69], [-.31, .69], [-.36, .45]], F, '#d4d7da', 2, true); h.both([[0, .565], [.335, .565], [.335, .58], [0, .58]], F, '#d9dcdf');
      h.both([[.37, .64], [.45, .735], [.66, .755], [.68, .655], [.52, .625]], F, '#16191d'); h.both([[.4, .65], [.47, .72], [.645, .738], [.66, .668], [.52, .64]], F, '#cfd6dc', '#ffffff');
      h.both([[.39, .643], [.52, .628], [.68, .658], [.68, .668], [.52, .639], [.4, .653]], F, '#ffffff', '#ffffff');
      h.plate(F, .39, false, 'MP65 HHM');
      // rear: diffuser + twin tips + red strip, vents, reflectors, tailgate line, lights, plate
      h.both([[0, .31], [.62, .31], [.68, .37], [0, .37]], B, '#0f1012'); h.both([[.34, .318], [.56, .318], [.58, .36], [.32, .36]], B, '#cfd2d5'); h.both([[.36, .324], [.545, .324], [.56, .353], [.345, .353]], B, '#141414');
      h.both([[0, .37], [.6, .37], [.6, .38], [0, .38]], B, '#b3151b'); h.both([[.71, .34], [.75, .34], [.765, .56], [.725, .56]], B, '#0b0b0c'); h.both([[.6, .41], [.7, .41], [.7, .43], [.6, .43]], B, '#99121a', '#7a0000');
      h.line([[-.46, .7], [.46, .7]], B, '#141414'); h.line([[.46, .7], [.47, .84]], B, '#141414'); h.line([[-.46, .7], [-.47, .84]], B, '#141414');
      h.both([[.46, .862], [.5, .955], [.76, .968], [.77, .845], [.6, .835]], B, '#7a0b11', '#c0181e'); h.both([[.5, .9], [.75, .91], [.75, .918], [.5, .908]], B, '#ff5a5a', '#ff3030'); h.both([[.52, .935], [.75, .945], [.75, .952], [.52, .942]], B, '#ff5a5a', '#ff3030');
      h.plate(B, .775, true, 'MP65 HHM');
      // rims: gloss-black 10-spoke with machined lip
      h.rim(c => { c.fillStyle = '#1d1e21'; c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; c.beginPath(); c.moveTo(Math.cos(a + .11) * 17, Math.sin(a + .11) * 17); c.lineTo(Math.cos(a + .19) * 53, Math.sin(a + .19) * 53); c.arc(0, 0, 53, a + .19, a + Math.PI / 5 - .19); c.lineTo(Math.cos(a + Math.PI / 5 - .11) * 17, Math.sin(a + Math.PI / 5 - .11) * 17); c.closePath(); c.fill(); }
        c.globalCompositeOperation = 'source-over'; c.strokeStyle = '#c9cacc'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 59, 0, 7); c.stroke(); c.fillStyle = '#2b2c2f'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); }); } },
  // Mercedes C-Class W205 saloon 2014-18, AMG Line: 4686 long, 1810 wide, 1442 high, wheelbase 2840, track 1588; 225/45 R18
  cclass: { key: 'cclass', name: 'C-Class (W205)', L: 4.686, W: 1.81, fa: .81, ra: 3.65, r: .33, R: .395, tr: 1.588, tw: .225, crown: .035, rw: .64, apillar: 0,
    yt: [[0, .74], [.12, .78], [.4, .84], [.9, .905], [1.4, .96], [1.8, 1.0], [2.5, 1.005], [3.3, 1.03], [3.6, 1.055], [3.95, 1.07], [4.3, 1.06], [4.55, 1.035], [4.686, .99]],
    yb: [[0, .19], [.4, .18], [.8, .2], [1.3, .22], [3.3, .22], [4.0, .27], [4.686, .3]],
    hw: [[0, .75], [.06, .82], [.2, .87], [.45, .897], [.8, .905], [3.9, .905], [4.3, .89], [4.55, .84], [4.686, .76]],
    c0: 1.78, c1: 4.02, ws1: 2.47, rs0: 3.42, top: [[1.78, .99], [1.95, 1.1], [2.2, 1.26], [2.45, 1.375], [2.7, 1.425], [3.0, 1.44], [3.3, 1.43], [3.5, 1.38], [3.7, 1.25], [3.9, 1.12], [4.02, 1.04]],
    draw(h) { const { S, F, B, x, e } = h, fa = this.fa, ra = this.ra, R = this.R, r = this.r;
      h.poly([[fa + R + .02, .19], [ra - R - .02, .19], [ra - R - .02, .235], [fa + R + .02, .235]], S, '#141416'); h.poly([[fa + R + .05, .24], [ra - R - .05, .24], [ra - R - .05, .248], [fa + R + .05, .248]], S, '#c9ccd0');
      h.poly([[0, .24], [.22, .24], [.3, .4], [0, .44]], S, '#0e0e10');
      const fd = fa + R + .07; h.line([[fd, .26], [fd, .72], [fd + .06, 1.0]], S, '#141414'); h.line([[2.92, .26], [2.92, 1.02]], S, '#141414'); h.line([[fd, .26], [ra - R - .1, .26]], S, '#141414');
      const rr = R + .05, ad = Math.acos(-.08 / rr) * 180 / Math.PI; h.line([[ra - .08, 1.04], ...h.arc(ra, r + .02, rr, ad, 168)], S, '#141414');
      h.line([[3.95, 1.07], [4.6, 1.035]], S, '#1a1a1a', 2);   // boot lid shut line
      h.handle(2.6, 2.79, .935); h.handle(3.38, 3.54, .965);
      h.glass([[1.95, 1.0], [2.06, 1.075], [2.5, 1.355], [2.75, 1.395], [3.25, 1.385], [3.52, 1.3], [3.73, 1.15], [3.8, 1.085], [3.6, 1.06], [2.9, 1.03], [2.25, 1.005]]);
      h.line([[1.98, 1.0], [2.9, 1.025], [3.6, 1.055], [3.8, 1.085]], S, '#c9ccd0', 2);   // chrome window line
      h.poly([[2.86, 1.0], [2.97, 1.005], [2.97, 1.385], [2.86, 1.385]], S, '#050506'); h.poly([[3.47, 1.05], [3.5, 1.05], [3.5, 1.31], [3.47, 1.31]], S, '#08080a');
      h.poly([[.02, .7], [.28, .78], [.5, .835], [.44, .77], [.22, .69], [.04, .64]], S, '#17191c'); h.poly([[.05, .68], [.28, .755], [.44, .8], [.4, .765], [.2, .69], [.06, .66]], S, '#cfd6dc', '#ffffff');
      h.poly([[4.3, 1.055], [4.686, .985], [4.686, .885], [4.45, .93], [4.32, 1.0]], S, '#7a0b11', '#c0181e'); h.line([[4.35, 1.02], [4.68, .95]], S, '#ff5a5a', 2);
      // front: lip, AMG intake with chrome A-wing, corner intakes, twin-louvre grille, headlights with eyebrow, plate
      h.both([[0, .18], [.62, .18], [.7, .22], [0, .22]], F, '#0d0d0f'); h.both([[0, .21], [.5, .21], [.62, .38], [0, .38]], F, '#101113');
      for (let k = 0; k < 5; k++) h.both([[0, .225 + k * .028], [.52, .225 + k * .028], [.52, .232 + k * .028], [0, .232 + k * .028]], F, '#26272a');
      h.both([[0, .3], [.5, .3], [.66, .36], [.66, .372], [.5, .314], [0, .314]], F, '#cdd0d3'); h.both([[.63, .22], [.72, .23], [.73, .45], [.66, .43]], F, '#0e0f11');
      h.both([[0, .41], [.31, .41], [.345, .445], [.345, .65], [.31, .685], [0, .685]], F, '#0f1012'); h.line([[.31, .41], [.345, .445], [.345, .65], [.31, .685], [-.31, .685], [-.345, .65], [-.345, .445], [-.31, .41]], F, '#d4d7da', 3, true);
      h.both([[0, .53], [.34, .53], [.34, .553], [0, .553]], F, '#d6d9dc'); h.both([[0, .575], [.34, .575], [.34, .597], [0, .597]], F, '#d6d9dc');
      h.both([[.39, .6], [.46, .685], [.68, .71], [.69, .615], [.55, .585]], F, '#16191d'); h.both([[.42, .61], [.49, .675], [.665, .695], [.675, .625], [.55, .6]], F, '#cfd6dc', '#ffffff');
      [1, -1].forEach(s => { h.line([[s * .43, .665], [s * .55, .615], [s * .67, .65]], F, '#ffffff', 3); h.line([[s * .43, .665], [s * .55, .615], [s * .67, .65]], F, '#ffffff', 1); e.strokeStyle = '#fff'; e.lineWidth = 3; e.beginPath(); [[.43, .665], [.55, .615], [.67, .65]].forEach(([a, b], i) => { const q = F(s * a, b); i ? e.lineTo(q[0], q[1]) : e.moveTo(q[0], q[1]); }); e.stroke(); });
      h.plate(F, .335, false, 'SM15 BWW');
      // rear: diffuser + chrome tips, reflectors, boot shut line, chrome strip, wedge lights, plate
      h.both([[0, .3], [.64, .3], [.7, .37], [0, .37]], B, '#0f1012'); h.both([[.42, .305], [.64, .305], [.66, .345], [.44, .345]], B, '#d2d5d8'); h.both([[.44, .311], [.625, .311], [.64, .339], [.455, .339]], B, '#121212');
      h.both([[0, .355], [.4, .355], [.4, .363], [0, .363]], B, '#c9ccd0'); h.both([[.62, .41], [.72, .41], [.72, .43], [.62, .43]], B, '#99121a', '#7a0000');
      h.line([[-.62, .62], [.62, .62]], B, '#141414'); h.both([[0, .83], [.42, .83], [.42, .842], [0, .842]], B, '#d6d9dc');
      h.both([[.42, .865], [.44, .93], [.86, .955], [.87, .87], [.62, .845]], B, '#7a0b11', '#c0181e'); h.both([[.46, .885], [.85, .905], [.85, .913], [.46, .893]], B, '#ff5a5a', '#ff3030');
      h.plate(B, .73, true, 'SM15 BWW');
      // rims: 5 twin-spoke, silver
      h.rim(c => { c.fillStyle = '#b7babe'; c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; c.beginPath(); c.moveTo(Math.cos(a + .3) * 20, Math.sin(a + .3) * 20); c.lineTo(Math.cos(a + .34) * 54, Math.sin(a + .34) * 54); c.arc(0, 0, 54, a + .34, a + Math.PI * 2 / 5 - .34); c.lineTo(Math.cos(a + Math.PI * 2 / 5 - .3) * 20, Math.sin(a + Math.PI * 2 / 5 - .3) * 20); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(Math.cos(a - .045) * 26, Math.sin(a - .045) * 26); c.lineTo(Math.cos(a - .05) * 53, Math.sin(a - .05) * 53); c.lineTo(Math.cos(a + .05) * 53, Math.sin(a + .05) * 53); c.lineTo(Math.cos(a + .045) * 26, Math.sin(a + .045) * 26); c.closePath(); c.fill(); }
        c.globalCompositeOperation = 'source-over'; c.strokeStyle = '#d9dbde'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 59, 0, 7); c.stroke(); c.fillStyle = '#8d9095'; c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fill(); }); } } };
/* ================= real meshes (flappy/3d/cars/): cleaned + decimated + scaled to published dimensions by the car mesh pipeline
   (badges, interiors and the source plates removed; our own paint, glass and UK plates). Sources + licences are in cars/cars.json. ================= */
const CAR_V = 2, TL = new THREE.TextureLoader(), MATC = {};
export const MESH = {};
const plateTex = (txt, yellow) => tex(256, 56, (x, w, h) => { x.fillStyle = yellow ? '#f4c91c' : '#f3f3ee'; x.fillRect(0, 0, w, h); x.strokeStyle = '#222'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2);
  x.save(); x.fillStyle = '#111'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.translate(w / 2, h / 2 + 2); x.scale(.8, 1); x.fillText(txt, 0, 0); x.restore(); });
const REGS = ['MP65 HHM', 'SM15 BWW', 'LT16 KBR', 'KX17 RHN', 'AJ17 CNX', 'GX69 YVJ', 'HY14 LGO', 'WG12 XYF', 'KR63 ABO', 'DH65 BHK'];
const plateMat = (k, rear) => MATC['pl' + k + rear] || (MATC['pl' + k + rear] = new THREE.MeshStandardMaterial({ map: plateTex(REGS[Object.keys(MATC).length % REGS.length], rear), roughness: .45, polygonOffset: true, polygonOffsetFactor: -2 }));
// SMR badges in place of every car logo (owner): front = gloss black disc with a chrome SMR across the middle; rear = the chrome SMR wordmark on its own
const SMR_IMG = new Image(); SMR_IMG.src = '../smr-mark.svg';
const chromeMark = (x, X, Y, W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const y = c.getContext('2d'); y.drawImage(SMR_IMG, 0, 0, W, H); y.globalCompositeOperation = 'source-in';
  const g = y.createLinearGradient(0, 0, 0, H); [[0, '#ffffff'], [.38, '#c9ced4'], [.5, '#6e757d'], [.62, '#e8ebee'], [1, '#9aa1a8']].forEach(([o, k]) => g.addColorStop(o, k)); y.fillStyle = g; y.fillRect(0, 0, W, H); x.drawImage(c, X, Y); };
const badgeMat = (front) => { const c = document.createElement('canvas'); c.width = front ? 256 : 512; c.height = front ? 256 : 132; const x = c.getContext('2d'), t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const draw = () => { x.clearRect(0, 0, c.width, c.height);
    if (front) { const d = x.createRadialGradient(100, 90, 8, 128, 128, 128); d.addColorStop(0, '#30343a'); d.addColorStop(.7, '#0d0e10'); d.addColorStop(1, '#050506'); x.fillStyle = d; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 122, 0, 7); x.stroke(); if (SMR_IMG.complete && SMR_IMG.naturalWidth) chromeMark(x, 128 - 96, 128 - 25, 192, 49); }
    else if (SMR_IMG.complete && SMR_IMG.naturalWidth) chromeMark(x, 6, 2, 500, 128);
    t.needsUpdate = true; };
  draw(); SMR_IMG.addEventListener('load', draw);
  return new THREE.MeshStandardMaterial({ map: t, roughness: .16, metalness: front ? .35 : .85, alphaTest: .5, polygonOffset: true, polygonOffsetFactor: -2 }); };
const BADGE_F = badgeMat(true), BADGE_R = badgeMat(false);
const HOLDER = mat(0x101113, { roughness: .55 }), HOLDER_G = rboxGeo(.548, .139, .016, .012), PLATE_G = new THREE.PlaneGeometry(.52, .111), BADGE_G = new THREE.CircleGeometry(1, 28), WORD_G = new THREE.PlaneGeometry(1, 132 / 512); PLATE_G.userData.shared = BADGE_G.userData.shared = WORD_G.userData.shared = 1;
function partMat(k, i, p) { const id = k + ':' + i; if (MATC[id]) return MATC[id];
  if (p.cls === 'tint') return MATC[id] = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(p.t[0], p.t[1], p.t[2]), transparent: true, opacity: p.t[3], roughness: .04, metalness: 0, clearcoat: 1, depthWrite: false });
  const o = { color: new THREE.Color(...p.c), roughness: Math.max(.06, p.r ?? .6), metalness: p.m ?? 0 };
  if (o.metalness > .7) { o.roughness = Math.max(o.roughness, .3); o.color.multiplyScalar(.78); }   // chrome reads as polished metal, not a mirror (exhaust tips, trims)
  if (p.map) { const t = TL.load(`./cars/${p.map}?v=${CAR_V}`); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; o.map = t; if (p.a) o.alphaTest = .5; if (p.e) { o.emissiveMap = t; o.emissive = new THREE.Color(1, 1, 1); o.emissiveIntensity = .35; } }
  return MATC[id] = new THREE.MeshStandardMaterial(o); }
function lodParts(k, M, L, buf) { const S = [0, 1, 2].map(j => L.bmax[j] - L.bmin[j]);
  const parts = L.parts.map((p, i) => { const q = new Int16Array(buf, p.p, p.v * 3), nq = new Int8Array(buf, p.nr, p.v * 4), pos = new Float32Array(p.v * 3), nor = new Float32Array(p.v * 3);
    for (let a = 0; a < p.v * 3; a++) { const j = a % 3; pos[a] = L.bmin[j] + (q[a] + 32768) / 65535 * S[j]; } for (let a = 0; a < p.v; a++) for (let j = 0; j < 3; j++) nor[a * 3 + j] = nq[a * 4 + j] / 127;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', p.uv != null ? new THREE.BufferAttribute(new Float32Array(buf, p.uv, p.v * 2), 2) : new THREE.BufferAttribute(new Float32Array(p.v * 2), 2));
    g.setIndex(new THREE.BufferAttribute(p.i32 ? new Uint32Array(buf, p.ix, p.i) : new Uint16Array(buf, p.ix, p.i), 1)); g.userData.shared = 1; g.computeBoundingSphere();
    return [g, p.cls === 'paint' ? 'paint' : p.cls === 'glass' ? GLASS : partMat(k, (L === M.lo ? 'lo' : 'hi') + i, p)]; });
  // plates + SMR badges as small shared quads/discs at the spots the pipeline measured
  const put = (geo, m, at, rear, sc) => { const gg = geo.clone(); gg.scale(sc, sc, 1); if (!rear) gg.rotateY(Math.PI); gg.translate(at[0], at[1], at[2]); gg.userData.shared = 1; parts.push([gg, m]); };
  const holder = (at, rear) => { const gg = HOLDER_G.clone(); gg.translate(at[0], at[1], at[2] + (rear ? -.008 : .008)); gg.userData.shared = 1; parts.push([gg, HOLDER]); };   // black plate holder the plate sits in
  if (M.plateF) { holder(M.plateF, false); put(PLATE_G, plateMat(k, false), M.plateF, false, 1); } if (M.plateR) { holder(M.plateR, true); put(PLATE_G, plateMat(k, true), M.plateR, true, 1); }
  if (M.badgeF) M.badgeF[4] === 'word' ? put(WORD_G, BADGE_R, M.badgeF, false, M.badgeF[3] * 4.4) : put(BADGE_G, BADGE_F, M.badgeF, false, M.badgeF[3]); if (M.badgeR) put(WORD_G, BADGE_R, M.badgeR, true, M.badgeR[3] * 4.4);   // rear wordmark about 22 cm wide
  return parts; }
try { const man = await (await fetch(`./cars/cars.json?v=${CAR_V}`)).json();
  await Promise.all(Object.entries(man).map(async ([k, M]) => { if (!M.hi) return; const [h, l] = await Promise.all([fetch(`./cars/${k}.bin?v=${CAR_V}`), M.lo ? fetch(`./cars/${k}_lo.bin?v=${CAR_V}`) : null]);
    if (!h.ok) return; const hi = lodParts(k, M, M.hi, await h.arrayBuffer()), lo = l && l.ok ? lodParts(k, M, M.lo, await l.arrayBuffer()) : hi;
    MESH[k] = { key: k, name: M.name, paints: UK_PAINT, parts: lo, hi, tris: M.hi.tris, trisLo: M.lo ? M.lo.tris : M.hi.tris, src: M.src, mesh: 1 }; }));
} catch (err) { console.warn('car meshes not loaded, using the built-in shapes', err); }
export const MODELS = { ...MESH }; for (const k in DEFS) if (!MODELS[k]) MODELS[k] = buildModel(DEFS[k]);

/* ================= generic fallbacks (cars not modelled yet): the old 3 profiles, turned to face -z ================= */
export const CARGEO = (() => { const prof = (pts, w, b) => { const s = new THREE.Shape(); s.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) pts[i].length === 2 ? s.lineTo(...pts[i]) : s.quadraticCurveTo(...pts[i]); const g = new THREE.ExtrudeGeometry(s, { depth: w - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 6 }); g.translate(0, 0, -(w - 2 * b) / 2); g.rotateY(-Math.PI / 2); return g; };
  const T = [
    { body: [[-2.05, .32], [2.0, .32], [2.12, .45, 2.12, .62], [2.08, .76, 1.9, .82], [.95, .96], [-1.55, .98], [-2.0, .96, -2.08, .82], [-2.12, .45, -2.05, .32]], cab: [[.9, .92], [.15, 1.36, -.05, 1.4], [-.95, 1.4], [-1.55, .94]] },
    { body: [[-1.85, .32], [1.85, .32], [1.97, .45, 1.97, .62], [1.93, .76, 1.75, .83], [.85, .97], [-1.75, .99], [-1.9, .9, -1.92, .7], [-1.95, .45, -1.85, .32]], cab: [[.8, .93], [.05, 1.42, -.2, 1.45], [-1.55, 1.42], [-1.78, .95]] },
    { body: [[-2.1, .45], [2.05, .45], [2.17, .6, 2.17, .8], [2.12, .98, 1.95, 1.02], [1.0, 1.12], [-1.95, 1.14], [-2.12, 1.05, -2.15, .9], [-2.18, .6, -2.1, .45]], cab: [[.95, 1.08], [.3, 1.62, .05, 1.66], [-1.75, 1.64], [-2.02, 1.1]] } ];
  return T.map(t => ({ body: Object.assign(prof(t.body, 1.76, .07), { userData: { shared: 1 } }), cab: Object.assign(prof(t.cab, 1.5, .06), { userData: { shared: 1 } }), wy: t.body[0][1] + .02, len: t.body[1][0] - t.body[0][0], fz: t.body[2][0], rz: t.body[0][0] - .07 })); })();
export const PLATEF = new THREE.MeshStandardMaterial({ map: tex(128, 32, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = 'bold 22px monospace'; x.textAlign = 'center'; x.fillText('LT24 KBR', w / 2, 24); }), roughness: .4 }), PLATER = new THREE.MeshStandardMaterial({ map: tex(128, 32, (x, w, h) => { x.fillStyle = '#f7d21c'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = 'bold 22px monospace'; x.textAlign = 'center'; x.fillText('LT24 KBR', w / 2, 24); }), roughness: .4 });
function genericCar(k, pm) { const o = new THREE.Group(), g = new THREE.Group(); g.rotation.y = Math.PI; o.add(g); const G = CARGEO[k];
  const b = new THREE.Mesh(G.body, pm), c = new THREE.Mesh(G.cab, GLASS); b.userData.paint = 1; [b, c].forEach(m => { m.castShadow = !LOW; m.receiveShadow = true; g.add(m); });
  box(1.8, .16, G.len + .1, TRIM, 0, G.wy + .06, (G.fz + G.rz) / 2 + .03, g);
  const wb = G.len * .31, wz = (G.fz + G.rz) / 2 + .03, wr = k === 2 ? .38 : .33;
  [[-1, wb], [1, wb], [-1, -wb], [1, -wb]].forEach(([s, z]) => { const ty = cyl(wr, wr, .24, TYRE, s * .82, wr, wz + z, g, 14); ty.rotation.z = Math.PI / 2; const rm = cyl(wr * .62, wr * .62, .02, RIM, s * .945, wr, wz + z, g, 10); rm.rotation.z = Math.PI / 2; });
  [-1, 1].forEach(s => { box(.4, .12, .06, HEAD, s * .58, G.wy + .38, G.fz + .02, g); box(.36, .13, .06, TAIL, s * .62, G.wy + .45, G.rz + .04, g); });
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(.52, .12), PLATEF); pf.position.set(0, G.wy + .12, G.fz + .08); g.add(pf); const pr = new THREE.Mesh(new THREE.PlaneGeometry(.52, .12), PLATER); pr.position.set(0, G.wy + .3, G.rz - .02); pr.rotation.y = Math.PI; g.add(pr);
  o.userData.key = 'gen' + k; return o; }

/* ================= making cars ================= */
// mix until the rest of the named cars are modelled: [model key, weight]
export const CAR_MIX = [['aclass', 2.2], ['cclass', 1.6], ['prius', 1.2], ['audi', 1.6], ['gen0', .8], ['gen1', 1.4], ['gen2', 1]].filter(([k]) => k.startsWith('gen') || MODELS[k]);
const POOL = {};
function setPaint(g, pm) { g.traverse(o => { if (o.userData.paint) o.material = pm; }); }
const partsGroup = (parts, pm) => { const g = new THREE.Group(); parts.forEach(([geo, m]) => { const me = new THREE.Mesh(geo, m === 'paint' ? pm : m); if (m === 'paint') me.userData.paint = 1; me.castShadow = !LOW && (m === 'paint' || m === TYRE || m === GLASS); me.receiveShadow = true; g.add(me); }); return g; };
export function makeCar(key, p = null, near = false) { const M = MODELS[key], pp = p || pick(M ? M.paints : UK_PAINT), pm = paintM(pp[0], pp[1]);
  if (!M) return genericCar(+key.slice(3), pm);
  if (near && M.hi && !LOW) { const L = new THREE.LOD(); L.addLevel(partsGroup(M.hi, pm), 0); L.addLevel(partsGroup(M.parts, pm), 16); L.userData.key = key; return L; }   // traffic: full detail close up, light version beyond 16 m
  const g = partsGroup(M.parts, pm); g.userData.key = key; return g; }
export const carG = () => makeCar(pick(CAR_MIX)[0]);   // parked cars (houses, lots): the colour argument is ignored, each model picks its own paint

/* ================= vans, buses ================= */
export const vanG = (col = 0xf2f2f2) => { const g = new THREE.Group(), m = mat(col, { roughness: .4, metalness: .3 }); rbox(2, 2.1, 5, .18, m, 0, 1.35, .2, g); rbox(1.9, .9, 1.2, .2, m, 0, .9, -2.6, g); box(1.85, .7, .1, GLASS, 0, 1.75, -2.25, g); box(2.02, .6, 1.2, GLASS, 0, 1.9, -1.6, g);
  [[-1, 1.7], [1, 1.7], [-1, -2.2], [1, -2.2]].forEach(([x, z]) => { const w = cyl(.38, .38, .3, mat(0x111111), x, .38, z, g, 12); w.rotation.z = Math.PI / 2; }); return g; };
export const busG = () => { const g = new THREE.Group(), tm = mat(0x1d8a8a, { roughness: .4, metalness: .2 }); rbox(2.5, 3, 11, .3, tm, 0, 1.75, 0, g); rbox(2.54, 1.1, 10.4, .1, GLASS, 0, 2.3, -.1, g); box(2.4, 1.3, .1, GLASS, 0, 2.2, -5.52, g);
  box(2.54, .25, 11, mat(0xf2f2f2), 0, .45, 0, g); [[-1.2, 3.6], [1.2, 3.6], [-1.2, -3.6], [1.2, -3.6]].forEach(([x, z]) => { const w = cyl(.5, .5, .3, mat(0x111111), x, .5, z, g, 14); w.rotation.z = Math.PI / 2; }); return g; };

/* ================= traffic: outgoing on the left (nose -z), oncoming on the right (turned round) ================= */
export const traffic = []; export let trafT = 0;
function take(key) { const p = POOL[key]; if (p && p.length) return p.pop(); if (key === 'bus') { const g = busG(); g.userData.key = 'bus'; return g; } if (key === 'van') { const g = vanG(); g.userData.key = 'van'; return g; } return makeCar(key, null, true); }
function give(g) { scene.remove(g); (POOL[g.userData.key] || (POOL[g.userData.key] = [])).push(g); }
export function spawnCar(dir, B) { const r = Math.random(), key = r < .08 ? 'bus' : r < .13 ? 'van' : pick(CAR_MIX)[0];
  const x = dir < 0 ? -3.6 : 3.6, z = dir < 0 ? B.z - 30 - Math.random() * 70 : B.z - 140 - Math.random() * 60;
  if (traffic.some(c => c.dir === dir && Math.abs(c.z - z) < 14)) return;
  const g = take(key); if (MODELS[key] || key.startsWith('gen')) { const M = MODELS[key], p = pick(M ? M.paints : UK_PAINT); setPaint(g, paintM(p[0], p[1])); }
  g.position.set(x, 0, z); g.rotation.y = dir > 0 ? Math.PI : 0; scene.add(g); traffic.push({ g, z, dir, v: dir < 0 ? 7 + Math.random() * 3 : 11 + Math.random() * 4 }); }
export function trafficReset(B) { traffic.forEach(c => give(c.g)); traffic.length = 0; trafT = 0; for (let k = 0; k < 8; k++) spawnCar(k % 2 ? 1 : -1, B); }
export function trafficTick(dt, B) { trafT -= dt; if (trafT <= 0) { trafT = .5 + Math.random() * .9; spawnCar(Math.random() < .5 ? -1 : 1, B); }
  for (let i = traffic.length - 1; i >= 0; i--) { const c = traffic[i]; c.z += c.dir * c.v * dt; c.g.position.z = c.z; if (c.z > B.z + 25 || c.z < B.z - 260) { give(c.g); traffic.splice(i, 1); } } }
