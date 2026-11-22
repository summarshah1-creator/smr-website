/* toon/vehicles.js — LUTON TRAFFIC (cartoon): the vehicles you actually see in Luton, as obstacles.
   Each model is a smooth side profile (rounded, extruded, narrowed at the top and ends), built once and cloned.
   Colours come from the real UK mix (SMMT 2024: grey, black, blue, white, red, silver, green), no badges or logos. */
import { THREE, M, P, canvasTex, signTex, rboxGeo, mergeGeometries } from './core.js';
import { GLASS, WHITE } from './street.js';

const RND = Math.random;
// UK colour mix (share of new cars, 2024): grey 28%, black 22%, blue 15%, white 15%, red 7%, silver 6%, green 3.5%, other ~3.5%
const PAINTS = [[0x6b7078, 15], [0x4a4f57, 13], [0x1d1f24, 22], [0x1f4fa8, 9], [0x3f7fd6, 6], [0xf4f5f6, 15], [0xd3262e, 7], [0xc3c8ce, 6], [0x2e6b4a, 3.5], [0xf0b81a, 1.5], [0xe86a1a, 2]];
const TOT = PAINTS.reduce((a, p) => a + p[1], 0);
export const paintPick = () => { let r = RND() * TOT; for (const [c, w] of PAINTS) { r -= w; if (r < 0) return c; } return PAINTS[0][0]; };
const PC = new Map(); const paint = c => { if (!PC.has(c)) PC.set(c, M(c, { roughness: .28, metalness: .3 })); return PC.get(c); };
const TYRE = M(0x1b1d22, { roughness: .8 }), RIM = M(0xd8dde3, { roughness: .25, metalness: .7 }), TRIM = M(0x23262c, { roughness: .55 }), HEAD = M(0xfff8e0, { emissive: 0xfff2c8, emissiveIntensity: .7, roughness: .2 }), TAIL = M(0xff3b30, { emissive: 0xb00000, emissiveIntensity: .6, roughness: .2 });
const plateT = (bg) => canvasTex(256, 64, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = 'bold 44px "Arial Narrow", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('LU24 RSH', w / 2, 48); });
const PLATEF = M(0xffffff, { map: plateT('#f6f6f2'), roughness: .4 }), PLATER = M(0xffffff, { map: plateT('#f7d21c'), roughness: .4 });

// side profile -> smooth body: extrude across the width, then pull the top in (tumblehome) and round the ends in plan
function body(pts, width, bev, belt) { const s = new THREE.Shape(); s.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) pts[i].length === 2 ? s.lineTo(...pts[i]) : s.quadraticCurveTo(...pts[i]);
  const g = new THREE.ExtrudeGeometry(s, { depth: width - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10 }); g.translate(0, 0, -(width - 2 * bev) / 2); g.rotateY(-Math.PI / 2);
  const p = g.attributes.position; let zmin = 1e9, zmax = -1e9; for (let i = 0; i < p.count; i++) { zmin = Math.min(zmin, p.getZ(i)); zmax = Math.max(zmax, p.getZ(i)); }
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i), e = Math.min(z - zmin, zmax - z), k = (y > belt ? 1 - Math.min(.16, (y - belt) * .22) : 1) * (1 - .1 * Math.max(0, 1 - e / .7)); p.setX(i, p.getX(i) * k); }
  g.computeVertexNormals(); g.userData.shared = 1; return g; }
// glasshouse windows: the cabin outline inset a little, dark glass, sitting just proud of the body sides
function windows(pts, width, bev) { const g = body(pts, width, bev, -9); g.userData.shared = 1; return g; }
// models: side profiles in metres (x = along the car, front at +x; y = up)
const MODELS = {
  hatch: { name: 'hatchback (Corsa / Fiesta / Polo)', w: 1.78, wb: 2.5, wr: .34, wf: .3,
    b: [[-1.98, .3], [1.95, .3], [2.05, .48, 2.04, .66], [2.0, .82, 1.75, .9], [.85, 1.08], [-1.5, 1.42], [-1.95, 1.3, -1.98, 1.0], [-2.02, .5, -1.98, .3]],
    c: [[.75, 1.06], [.05, 1.46, -.25, 1.48], [-1.5, 1.44], [-1.82, 1.1]], belt: 1.0, h: 1.5 },
  saloon: { name: 'saloon (3 Series)', w: 1.82, wb: 2.8, wr: .36, wf: .32,
    b: [[-2.3, .3], [2.3, .3], [2.4, .46, 2.38, .62], [2.32, .78, 2.0, .84], [.95, .98], [-1.75, 1.0], [-2.3, .98, -2.38, .8], [-2.42, .48, -2.3, .3]],
    c: [[.9, .96], [.1, 1.4, -.2, 1.42], [-1.15, 1.4], [-1.85, .98]], belt: .95, h: 1.45 },
  prius: { name: 'Prius (taxi)', w: 1.76, wb: 2.7, wr: .33, wf: .3,
    b: [[-2.2, .3], [2.2, .3], [2.3, .45, 2.27, .62], [2.2, .74, 1.95, .8], [1.0, .98], [-1.95, 1.12], [-2.25, 1.05, -2.28, .8], [-2.32, .46, -2.2, .3]],
    c: [[.95, .96], [.15, 1.44, -.3, 1.48], [-1.0, 1.44], [-2.05, 1.08]], belt: .98, h: 1.5 },
  suv: { name: 'Qashqai', w: 1.84, wb: 2.65, wr: .4, wf: .36,
    b: [[-2.15, .42], [2.1, .42], [2.2, .6, 2.2, .82], [2.15, 1.0, 1.9, 1.06], [.9, 1.2], [-1.85, 1.38], [-2.2, 1.3, -2.22, 1.0], [-2.25, .62, -2.15, .42]],
    c: [[.8, 1.18], [.15, 1.66, -.15, 1.7], [-1.7, 1.66], [-2.0, 1.3]], belt: 1.2, h: 1.7 },
  van: { name: 'Transit van', w: 2.0, wb: 3.3, wr: .38, wf: .34,
    b: [[-2.7, .38], [2.6, .38], [2.75, .6, 2.74, .9], [2.7, 1.12, 2.3, 1.2], [1.6, 1.4], [1.0, 2.35, .6, 2.48], [-2.6, 2.5], [-2.75, 2.45, -2.75, 2.2], [-2.75, .6, -2.7, .38]],
    c: [[1.55, 1.42], [1.02, 2.2, .8, 2.24], [.35, 2.24], [.35, 1.45]], belt: 1.45, h: 2.5 },
};
const GEO = {}; for (const [k, m] of Object.entries(MODELS)) GEO[k] = { body: body(m.b, m.w, .1, m.belt), cab: windows(m.c, m.w - .08, .06) };
const taxiSign = (() => { const t = signTex('TAXI', { bg: '#ffd21a', fg: '#1b1b1b', size: .7, stroke: false, w: 256, h: 96 }); return M(0xffffff, { map: t, emissive: 0xffe066, emissiveMap: t, emissiveIntensity: .5 }); })();
export const VEH = {};
function car(kind, col, extra) { const m = MODELS[kind], G = GEO[kind], g = new THREE.Group(), p = P(g), pm = paint(col);
  const b = new THREE.Mesh(G.body, pm), c = new THREE.Mesh(G.cab, GLASS); [b, c].forEach(o => { o.castShadow = true; o.receiveShadow = true; g.add(o); });
  const zf = m.b[1][0], zr = m.b[0][0], rf = m.c[1][2], rb = m.c[2][0]; p.box(m.w * .84, .09, rf - rb + .2, pm, 0, m.c[2][1] + .03, (rf + rb) / 2, .04);
  [[m.wb / 2 + .05], [-m.wb / 2 + .05]].forEach(([z]) => [-1, 1].forEach(s => { p.cyl(m.wr, m.wr, .3, TYRE, s * (m.w / 2 - .12), m.wr, z, 22, [0, 0, Math.PI / 2]); p.cyl(m.wr * .6, m.wr * .6, .32, RIM, s * (m.w / 2 - .11), m.wr, z, 16, [0, 0, Math.PI / 2]); p.tor(m.wr + .06, .07, TRIM, s * (m.w / 2 - .02), m.wr, z, [0, Math.PI / 2, 0], Math.PI); }));
  [-1, 1].forEach(s => { p.sph(.16, HEAD, s * m.w * .3, m.b[2][3] + .04, zf + .02, [1.4, .7, .4], 14); p.box(.36, .16, .08, TAIL, s * m.w * .33, m.b[m.b.length - 2][1] * .8 + .25, zr - .04, .05); p.box(.12, .1, .2, pm, s * (m.w / 2 + .04), m.belt + .06, m.c[0][0] - .2, .04); });
  p.box(m.w * .9, .2, .14, TRIM, 0, .42, zf + .08, .07); p.box(m.w * .9, .2, .14, TRIM, 0, .42, zr - .08, .07);
  const pf = p.plane(.52, .13, PLATEF, 0, .55, zf + .17); const pr = p.plane(.52, .13, PLATER, 0, .62, zr - .17, [0, Math.PI, 0]); pf.castShadow = pr.castShadow = false;
  if (extra === 'taxi') { p.box(.7, .26, .3, taxiSign, 0, m.h + .14, -.3, .08); }
  g.rotation.y = 0; g.userData.h = m.h; g.userData.len = zf - zr + .3; return g; }
// Luton bus (Arriva-style teal & cream, generic): long rounded body, glazing band, LED destination
const BUSM = M(0x16a9a3, { roughness: .32, metalness: .15 }), CREAM = M(0xf3efe2, { roughness: .4 });
VEH.bus = (() => { const g = new THREE.Group(), p = P(g), L = 11.2;
  p.box(2.55, 2.9, L, BUSM, 0, 1.8, 0, .45); p.box(2.45, .45, L - .4, CREAM, 0, 3.1, 0, .2); p.box(2.6, 1.1, L - 1.4, GLASS, 0, 2.35, -.3, .14); p.box(2.3, 1.45, .12, GLASS, 0, 2.2, L / 2 + .02, .15);
  const led = signTex('LUTON AIRPORT', { bg: '#141414', fg: '#ffb020', size: .5, stroke: false, w: 512, h: 128 }); p.sign(led, 1.9, .4, 0, 3.05, L / 2 + .08, 0, .04);
  [-3.6, 3.4].forEach(z => [-1, 1].forEach(s => { p.cyl(.55, .55, .36, TYRE, s * 1.12, .55, z, 22, [0, 0, Math.PI / 2]); p.cyl(.32, .32, .38, RIM, s * 1.13, .55, z, 14, [0, 0, Math.PI / 2]); }));
  [-1, 1].forEach(s => { p.sph(.2, HEAD, s * .95, .85, L / 2 + .1, [1.3, .8, .4], 12); p.box(.28, .5, .1, TAIL, s * 1.05, 1.1, -L / 2 - .02, .05); });
  p.box(2.6, .4, L - .5, CREAM, 0, .62, 0, .14); p.box(2.4, .3, .2, TRIM, 0, .5, L / 2 + .02, .1);
  g.userData.h = 3.3; g.userData.len = L; return g; })();
// a cartoon black Hackney-style cab is rare in Luton; private-hire Prius taxis are everywhere, so they get the TAXI sign
const KIND = [['hatch', 34], ['prius', 18], ['suv', 16], ['saloon', 12], ['van', 14], ['bus', 6]]; const KT = KIND.reduce((a, k) => a + k[1], 0);
export function pickVehicle(onlyCars) { let r = RND() * KT, k = 'hatch'; for (const [n, w] of KIND) { r -= w; if (r < 0) { k = n; break; } } if (onlyCars && (k === 'bus' || k === 'van')) k = 'hatch'; return k; }
const POOL = {};
export function vehicle(kind) { if (kind === 'bus') return VEH.bus.clone(); if (kind === 'van') return car('van', RND() < .8 ? 0xf4f5f6 : paintPick()); if (kind === 'prius') return car('prius', RND() < .55 ? pickPrius() : paintPick(), 'taxi'); return car(kind, paintPick()); }
const pickPrius = () => [0xf4f5f6, 0x1d1f24, 0x6b7078, 0xc3c8ce][(RND() * 4) | 0];
