/* vehicles.js — cartoon traffic (Subway Surfers-style chunky toys, no real makes or badges).
   Every model is built once per type + colour and cloned (geometry and materials shared). All face -z; the game turns
   oncoming ones round. Sizes in metres; .dims = { w, h, l, top } (top = roof you can run on). */
import * as THREE from 'three';
import { T, rb, rbs, cyl, sph, blobShadow, canvasTex, board, sign, C } from './kit.js';

const GLASS = T(0x2c3a4e, { emissive: 0x1b2840, emissiveIntensity: .25 }), GLASS2 = T(0x4f6c8c), TYRE = T(0x24262b), HUB = T(0xc9ced6), BLACK = T(0x2b2d33),
  LAMP = T(0xfff6d8, { emissive: 0xfff2c0, emissiveIntensity: .7 }), TAIL = T(0xd8443c, { emissive: 0xb02020, emissiveIntensity: .5 }), PLATE_F = T(0xf6f6f2), PLATE_R = T(0xf2cf3a), CHROME = T(0xd9dde3);
export const PAINT = [0xe9e9ec, 0x2e3036, 0x9aa1ab, 0x5f6672, 0x3d5c8c, 0xb5473f, 0xdcd9d2, 0x41484f, 0x7d8f6f, 0xc9a36a, 0x6b4a68, 0x3e7f8a];
const wheel = (g, x, z, r = .34, w = .24) => { const t = cyl(r, r, w, TYRE, x, r, z, g, 18); t.rotation.z = Math.PI / 2; const h = cyl(r * .55, r * .55, w + .02, HUB, x, r, z, g, 14); h.rotation.z = Math.PI / 2; return t; };
const plates = (g, y, zf, zr, w = .5) => { rb(w, .12, .03, .02, PLATE_F, 0, y, zf - .015, g); rb(w, .12, .03, .02, PLATE_R, 0, y, zr + .015, g); };
const lights = (g, y, zf, zr, x) => { [-1, 1].forEach(s => { rb(.28, .12, .06, .04, LAMP, s * x, y, zf, g); rb(.26, .12, .06, .04, TAIL, s * x, y, zr, g); }); };

function car(kind, paint) {
  const g = new THREE.Group(), P = T(paint), W = kind === 'suv' ? 1.9 : 1.78, L = kind === 'hatch' ? 4.0 : kind === 'suv' ? 4.5 : 4.6, BH = kind === 'suv' ? .95 : .78, CH = kind === 'suv' ? .72 : .62, clr = kind === 'suv' ? .22 : .16;
  // body: rounded slab, then a rounded cabin set back from the nose
  rbs(W, BH, L, .28, P, 0, clr, 0, g);
  const cabL = kind === 'hatch' ? L * .58 : kind === 'suv' ? L * .62 : L * .5, cabZ = kind === 'hatch' ? L * .12 : kind === 'suv' ? L * .08 : L * .04;
  rbs(W * .9, CH, cabL, .3, P, 0, clr + BH - .12, cabZ, g);
  // glass: wraps the cabin (front, back, sides) slightly proud of it
  rbs(W * .92, CH * .66, cabL * .9, .22, GLASS, 0, clr + BH - .02, cabZ, g);
  rbs(W * .93, .09, cabL * .55, .04, P, 0, clr + BH + CH * .32, cabZ, g);                         // pillar band between the windows
  // bumpers, grille, lights, plates, mirrors, wheels
  rb(W * .96, .22, .28, .1, BLACK, 0, clr + .2, -L / 2 + .06, g); rb(W * .96, .22, .28, .1, BLACK, 0, clr + .2, L / 2 - .06, g);
  rb(W * .5, .16, .06, .05, BLACK, 0, clr + .45, -L / 2 - .005, g);
  lights(g, clr + .55, -L / 2 + .02, L / 2 - .02, W * .34); plates(g, clr + .25, -L / 2 - .08, L / 2 + .08);
  [-1, 1].forEach(s => rb(.14, .1, .2, .04, P, s * (W / 2 + .04), clr + BH + .05, cabZ - cabL / 2 + .25, g));
  [-1, 1].forEach(s => { wheel(g, s * (W / 2 - .2), -L / 2 + .85); wheel(g, s * (W / 2 - .2), L / 2 - .85); });
  if (kind === 'taxi') { rb(.6, .18, .26, .06, T(0xf6f3e8, { emissive: 0xf2e6a0, emissiveIntensity: .35 }), 0, clr + BH + CH - .04, cabZ, g); }
  blobShadow(W + .5, L + .6, g, .03);
  g.userData.dims = { w: W, h: clr + BH + CH, l: L, top: clr + BH + CH - .08 }; return g; }

function van(paint) { const g = new THREE.Group(), P = T(paint), W = 2.0, L = 5.4, H = 2.35, clr = .28;
  rbs(W, H - clr, L * .72, .26, P, 0, clr, L * .14, g);                       // load box
  rbs(W, 1.2, L * .3, .32, P, 0, clr, -L * .35 + .05, g);                    // bonnet
  rbs(W * .98, H - clr - .35, L * .3, .3, P, 0, clr + .3, -L * .3, g);        // cab
  rbs(W * .99, .62, L * .22, .2, GLASS, 0, clr + 1.15, -L * .33, g);          // windscreen / side windows
  rb(W * .96, .24, .3, .1, BLACK, 0, clr + .18, -L / 2 + .08, g); rb(W * .96, .24, .3, .1, BLACK, 0, clr + .18, L / 2 - .08, g);
  lights(g, clr + .7, -L / 2 + .06, L / 2 - .06, W * .36); plates(g, clr + .3, -L / 2 - .08, L / 2 + .08);
  [-1, 1].forEach(s => { wheel(g, s * (W / 2 - .22), -L / 2 + 1.0, .38); wheel(g, s * (W / 2 - .22), L / 2 - 1.0, .38); });
  blobShadow(W + .6, L + .7, g, .03); g.userData.dims = { w: W, h: H, l: L, top: H - .05 }; return g; }

// bus: our own Luton bus (muted teal + cream, generic, destination board "LUTON TOWN CENTRE")
const DEST = sign('LUTON TOWN CENTRE', { bg: '#151515', fg: '#ffb03a', w: 1024, h: 160, font: '800' });
function bus(livery = 0) { const g = new THREE.Group(), body = T([0x2f8f97, 0x7b5aa6, 0x5b6b8a][livery]), band = T(0xf1ead9), W = 2.45, L = 11, H = 3.15, clr = .3;
  rbs(W, H - clr, L, .38, body, 0, clr, 0, g);
  rbs(W * 1.005, 1.0, L * .96, .2, GLASS, 0, clr + 1.35, .15, g);                           // side window band
  rbs(W * 1.01, .22, L * .985, .1, band, 0, clr + 1.08, 0, g);                               // cream belt line
  rbs(W * .9, 1.6, .3, .2, GLASS, 0, clr + .9, -L / 2 + .05, g);                            // big windscreen
  board(DEST, 1.6, .25, 0, clr + 2.62, -L / 2 - .06, g, Math.PI);
  rb(W * .96, .3, .3, .12, BLACK, 0, clr + .2, -L / 2 + .05, g); rb(W * .96, .3, .3, .12, BLACK, 0, clr + .2, L / 2 - .05, g);
  lights(g, clr + .45, -L / 2 + .02, L / 2 - .02, W * .38); plates(g, clr + .7, -L / 2 - .08, L / 2 + .08, .55);
  rbs(W * .7, .22, L * .5, .1, T(0xdfe3e8), 0, H - .05, .6, g);                             // roof pod
  [-1, 1].forEach(s => { wheel(g, s * (W / 2 - .25), -L / 2 + 2.4, .5, .3); wheel(g, s * (W / 2 - .25), L / 2 - 2.6, .5, .3); });
  blobShadow(W + .7, L + .8, g, .03); g.userData.dims = { w: W, h: H + .2, l: L, top: H + .17 }; return g; }

const PROTO = new Map();
const proto = (k, f) => PROTO.get(k) || (PROTO.set(k, f()), PROTO.get(k));
const pick = a => a[Math.random() * a.length | 0];
/** make a vehicle of kind 'car' | 'van' | 'bus' (random type + colour); returns a clone that shares geometry/materials */
export function vehicle(kind) {
  let key, f;
  if (kind === 'bus') { const l = Math.random() < .75 ? 0 : 1 + (Math.random() * 2 | 0); key = 'bus' + l; f = () => bus(l); }
  else if (kind === 'van') { const c = pick([0xeeeeee, 0xeeeeee, 0xdedede, 0x3d5c8c, 0x2e3036]); key = 'van' + c; f = () => van(c); }
  else { const t = pick(['hatch', 'hatch', 'saloon', 'saloon', 'suv', 'taxi']), c = t === 'taxi' ? pick([0x2e3036, 0xe9e9ec, 0x9aa1ab]) : pick(PAINT); key = t + c; f = () => car(t, c); }
  const p = proto(key, f), g = p.clone(); g.userData.dims = p.userData.dims; return g; }
