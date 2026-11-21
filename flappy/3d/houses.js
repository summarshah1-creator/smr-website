/* houses.js — HOUSES. Terraces, 1930s semis, Tudor semis. One model per house type; variation = colours/options picked from
   palettes (RENDER, LBRICK, roofs, doors). LEFT_PLAN = order of buildings on the left of Leagrave Road. */
import * as THREE from 'three';
import { BUILD, box, cyl, mat, rbox, rboxGeo, shade, tex } from './core.js';
import { GLASS, GLASSL, HEDGE, LBRICK, PAVING, RENDER, ROOF_BROWN, ROOF_GREY, ROOF_RED, brickTex, doorM, hipRoof, windowSet } from './materials.js';
import { CARC, carG } from './cars.js';


// ---- terraced houses (Luton red brick, bay windows, pitched roofs, chimneys) ----
export const BR1 = brickTex('#9c4a32', '#c9b9a6'), BR2 = brickTex('#b5583c', '#cdbfae'), BR3 = brickTex('#8a5a44', '#c6b8a6');
export const SLATE = new THREE.MeshStandardMaterial({ map: tex(256, 256, (x, w, h) => { x.fillStyle = '#3f434b'; x.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = 0; c < 9; c++) { x.fillStyle = shade('#4b5059', (Math.random() - .5) * 20); x.fillRect(c * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(c * 32 + (r % 2) * 16, r * 16 + 13, 32, 2); } }, .12, .12), roughness: .6 });
BUILD.terrace = () => { const g = new THREE.Group(), n = 4, hw = 5.2, W = n * hw, H = 6.6, D = 9;
  for (let i = 0; i < n; i++) { const x0 = -W / 2 + i * hw + hw / 2, painted = Math.random() < .25, wm = painted ? mat(0xf1ece2) : new THREE.MeshStandardMaterial({ map: [BR1, BR2, BR3][(i + (Math.random() * 3 | 0)) % 3], roughness: .95 });
    box(hw, H, D, wm, x0, H / 2, -D / 2, g);
    // bay window: three-sided box sticking out, with its own little roof
    const bw = 2.4, bd = .8; box(bw, 2.4, bd, mat(painted ? 0xe8e2d6 : 0x9a4630), x0 - .9, 1.35, bd / 2, g);
    windowSet(g, x0 - .9, 1.55, 2.0, 1.3, bd + .01, false, 2); box(bw + .3, .18, bd + .35, mat(0x55504a), x0 - .9, 2.65, bd / 2, g);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(.01, 1.5, .6, 4, 1), mat(0x6a4a3c)); br.rotation.y = Math.PI / 4; br.scale.set(1, 1, .45); br.position.set(x0 - .9, 3.0, .4); g.add(br);
    // door with step and fanlight
    box(1.1, 2.2, .2, mat([0x1f3b6b, 0x7a1f1f, 0x2e5a3a, 0x222222][i % 4], { roughness: .4 }), x0 + 1.5, 1.2, -.05, g); box(1.2, .25, .4, mat(0xd8d2c6), x0 + 1.5, .12, .2, g);
    box(.9, .35, .12, GLASSL, x0 + 1.5, 2.55, -.02, g); box(.05, .08, .1, mat(0xd4b04a, { metalness: .8, roughness: .3 }), x0 + 1.85, 1.2, .1, g);
    // upstairs windows
    windowSet(g, x0 - .9, 4.4, 1.6, 1.3, 0, true, 1); windowSet(g, x0 + 1.4, 4.4, 1.1, 1.3, 0, true, 0);
    // chimney on the party wall
    if (i % 2 === 0) { box(.9, 1.6, .9, wm, x0 - hw / 2, H + 2.4, -D / 2, g); box(1.1, .15, 1.1, mat(0x7a6a5e), x0 - hw / 2, H + 3.25, -D / 2, g); for (let k = 0; k < 2; k++) cyl(.12, .14, .5, mat(0xa45a3a), x0 - hw / 2 - .2 + k * .4, H + 3.55, -D / 2, g, 8); }
    // front wall + gate
    box(hw - 1.6, .7, .25, wm, x0 - .8, .35, 1.8, g); box(hw - 1.6, .1, .32, mat(0xd8d0c2), x0 - .8, .74, 1.8, g);
  }
  // pitched roof (slate) as a prism along the row
  const sh = new THREE.Shape(); sh.moveTo(-D / 2 - .3, 0); sh.lineTo(D / 2 + .3, 0); sh.lineTo(0, 2.6); sh.lineTo(-D / 2 - .3, 0);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: W + .2, bevelEnabled: false }); const roof = new THREE.Mesh(rg, SLATE); roof.rotation.y = Math.PI / 2; roof.position.set(-W / 2 - .1, H, -D / 2); roof.castShadow = roof.receiveShadow = true; g.add(roof);
  box(W, .15, .4, mat(0x2b2a2e), 0, H + .05, .1, g); // gutter
  return { g, w: W };
};
export const binG = (g, x, z, c) => { rbox(.6, .95, .7, .05, mat(c, { roughness: .55 }), x, .52, z, g); rbox(.68, .07, .8, .03, mat(c, { roughness: .5 }), x, 1.02, z + .02, g); [-1, 1].forEach(e => { const wh = cyl(.1, .1, .06, mat(0x151515), x + e * .27, .1, z - .32, g, 10); wh.rotation.z = Math.PI / 2; }); };
// one 1930s semi-detached pair: mirror-image houses, outer bays, doors in the middle, hipped roof, drives in front
BUILD.semi = (tudor) => { const g = new THREE.Group(), HW = 6.4, W = HW * 2, H = 5.6, D = 9, SET = 6;
  const r = Math.random, up = tudor ? RENDER[0] : RENDER[(r() * RENDER.length) | 0], allRender = !tudor && r() < .35, lo = allRender ? up : LBRICK[(r() * 3) | 0], roof = [ROOF_BROWN, ROOF_GREY, ROOF_RED][(r() * 3) | 0];
  const z0 = -SET;   // house front line, the drive is in front of it
  box(W, 2.8, D, lo, 0, 1.4, z0 - D / 2, g); box(W, H - 2.8, D, up, 0, 2.8 + (H - 2.8) / 2, z0 - D / 2, g);
  box(W + .1, .12, D + .1, mat(0xe6e0d4), 0, 2.84, z0 - D / 2, g);                                  // band between the floors
  const R = hipRoof(W, D, 3.4, roof); R.position.set(0, H, z0); g.add(R);
  box(.9, 1.4, .9, lo, -1.4, H + 2.6, z0 - D / 2, g); box(.9, 1.4, .9, lo, 1.4, H + 2.6, z0 - D / 2, g); [-1.4, 1.4].forEach(cx => { box(1.05, .14, 1.05, mat(0x7a6a5e), cx, H + 3.35, z0 - D / 2, g); cyl(.12, .14, .45, mat(0xa45a3a), cx, H + 3.6, z0 - D / 2, g, 8); });
  if (r() < .3) { box(3.2, 1.8, 2.4, up, (r() < .5 ? -1 : 1) * 3, H + 1.2, z0 - D * .62, g); windowSet(g, (r() < .5 ? -1 : 1) * 3, H + 1.2, 1.6, 1, z0 - D * .62 + 1.21, false, 1); }   // loft conversion dormer
  [-1, 1].forEach(sd => { const hx = sd * HW / 2, bx = sd * (HW - 1.6);
    // two-storey square bay with its own little hipped roof
    box(2.8, 2.8, .9, lo, bx, 1.4, z0 + .45, g); box(2.8, H - 2.8 - .2, .9, up, bx, 2.8 + (H - 3) / 2, z0 + .45, g);
    windowSet(g, bx, 1.55, 2.3, 1.45, z0 + .92, true, 2); windowSet(g, bx, 4.15, 2.3, 1.35, z0 + .92, true, 2);
    if (tudor) { const TB = mat(0x1d1b1c); [-1.33, 1.33].forEach(e => box(.14, H - 3, .05, TB, bx + e, 2.8 + (H - 3) / 2, z0 + .93, g)); box(2.8, .14, .05, TB, bx, H - .35, z0 + .93, g); box(2.8, .14, .05, TB, bx, 3.05, z0 + .93, g);}
    [-1, 1].forEach(e => { const sw = box(.08, 1.3, .55, GLASS, bx + e * 1.41, 1.55, z0 + .45, g); const sw2 = box(.08, 1.2, .55, GLASS, bx + e * 1.41, 4.15, z0 + .45, g); });
    const br = hipRoof(2.8, .9, .45, roof, .15); br.position.set(bx, H - .2, z0 + .9); g.add(br);
    const tb = hipRoof(2.8, .9, .3, roof, .1); tb.position.set(bx, 2.82, z0 + .9); g.add(tb);              // tiled band over the ground-floor bay
    // front door with a little porch canopy, upstairs landing window
    const dx = sd * 1.35; box(1.05, 2.2, .15, doorM(['#f4f4f0', '#1f2f4e', '#5a1c1c', '#2d4a33', '#3a3a3c'][(r() * 5) | 0]), dx, 1.1, z0 + .02, g); box(1.5, .15, .9, mat(0xa9a296, { roughness: .9 }), dx, .075, z0 + .45, g); box(1.6, .12, .9, mat(0xe9e5dc), dx, 2.45, z0 + .45, g);
    windowSet(g, dx, 4.2, .8, 1.1, z0 + .02, true, 0);
    // drive: block paving, low brick wall with a gap, a car on it, bins
    const dr = new THREE.Mesh(new THREE.PlaneGeometry(HW, SET), PAVING); dr.rotation.x = -Math.PI / 2; dr.position.set(hx, .03, -SET / 2); dr.receiveShadow = true; g.add(dr);
    box(.25, .75, SET - .3, LBRICK[0], sd * (HW - .12), .37, -SET / 2, g);
    box(HW - 3.4, .7, .25, LBRICK[0], hx + sd * 1.5, .35, -.15, g); box(HW - 3.3, .08, .32, mat(0xd8d0c2), hx + sd * 1.5, .72, -.15, g);
    if (r() < .75) { const c = carG(CARC[(r() * CARC.length) | 0]); c.position.set(hx - sd * .6, .02, -SET / 2 - .2); g.add(c); }
    binG(g, sd * (HW - .7), z0 + 1.0, [0x2f4f2f, 0x2a2a2a, 0x3a5aa0][(r() * 3) | 0]);
    if (r() < .5) { const h = new THREE.Mesh(rboxGeo(HW - 3.6, .95, .75, .25), HEDGE); h.position.set(hx + sd * 1.6, .45, -.75); h.castShadow = true; g.add(h); }
  });
  const PIPE = mat(0x2b2b2d, { roughness: .5 }); [-1, 1].forEach(e => cyl(.05, .05, H, PIPE, e * (W / 2 - .1), H / 2, z0 + .07, g, 6));   // downpipes
  if (r() < .35) { const dsh = new THREE.Mesh(new THREE.SphereGeometry(.36, 12, 6, 0, Math.PI * 2, 0, .75), mat(0xe8e8e8, { roughness: .4, side: THREE.DoubleSide })); dsh.rotation.x = -Math.PI / 2 + .35; dsh.position.set((r() < .5 ? -1 : 1) * 2.5, H - .9, z0 + .3); g.add(dsh); }
  if (r() < .5) { const ax = (r() < .5 ? -1 : 1) * 1.4, ay = H + 3.35, az = z0 - D / 2; cyl(.025, .025, 1.7, PIPE, ax, ay + .85, az, g, 4); for (let i = 0; i < 6; i++) box(.75 - i * .08, .03, .03, PIPE, ax, ay + 1.55, az + .3 - i * .13, g); }
  return { g, w: W + .4 };
};
BUILD.tudor = () => BUILD.semi(true);
export const LEFT_PLAN = ['semi', 'semi', 'tudor', 'semi', 'tudor', 'tudor', 'semi', 'rondini', 'semi', 'madrasa', 'semi', 'tudor', 'semi', 'semi'];
