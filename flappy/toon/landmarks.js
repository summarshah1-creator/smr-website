/* toon/landmarks.js — LUTON LANDMARKS (cartoon). Each builder returns { g, w, name, dyn?, tick? }:
   g is baked (merged), dyn holds moving parts (clock hands, flags) kept separate, tick(t) animates them.
   Batch 1: Galaxy, Town Hall, Central Mosque, Hat Factory, Kenilworth Road, Marsh Farm, the airport, SMR billboard. */
import { THREE, M, BASIC, P, rboxGeo, hipRoof, canvasTex, signTex, rr, sigM, shadeHex, FONT } from './core.js';
import { GLASS, WHITE, DARK, COPING, BRICKS, ROOFS, treeG } from './street.js';

export const LM = {};
const RND = Math.random;
const winGrid = (p, x0, x1, y0, y1, z, cols, rows, w, h, frame = WHITE) => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = x0 + (x1 - x0) * (cols === 1 ? .5 : c / (cols - 1)), y = y0 + (y1 - y0) * (rows === 1 ? .5 : r / (rows - 1)); p.box(w + .2, h + .2, .16, frame, x, y, z, .05); p.box(w, h, .1, GLASS, x, y, z + .06, .03); } };
const arch = (p, x, y, w, h, z, m = GLASS, frame = WHITE) => { p.shape([[-w / 2, 0], [w / 2, 0], [w / 2, h - w / 2], [w / 2, h, 0, h], [-w / 2, h, -w / 2, h - w / 2], [-w / 2, 0]], .1, frame, x, y, z, null, .05); p.shape([[-w / 2 + .12, .12], [w / 2 - .12, .12], [w / 2 - .12, h - w / 2], [w / 2 - .12, h - .12, 0, h - .12], [-w / 2 + .12, h - .12, -w / 2 + .12, h - w / 2], [-w / 2 + .12, .12]], .06, m, x, y, z + .08, null, .02); };

// ---- The Galaxy (leisure centre): long navy block with stars, glass drum with a dome, big rounded lettering ----
LM.galaxy = () => { const g = new THREE.Group(), p = P(g), W = 44, H = 15, D = 18;
  const face = M(0xffffff, { map: canvasTex(1024, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b1f6b'); gr.addColorStop(1, '#4a3ab8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { const s = RND() * 3 + 1; x.fillStyle = `rgba(255,255,255,${.3 + RND() * .7})`; x.beginPath(); x.arc(RND() * w, RND() * h, s, 0, 7); x.fill(); } }), roughness: .5, emissive: 0x2a1f70, emissiveIntensity: .25 });
  p.box(W, H, D, face, 0, H / 2, -D / 2, .4); p.box(W + .4, .8, D + .4, M(0xe6e2f5), 0, H + .2, -D / 2, .3);
  p.cyl(6, 6, H + 3, GLASS, -W / 2 + 3, (H + 3) / 2, -2, 40); for (let i = 0; i < 6; i++) p.tor(6.05, .12, WHITE, -W / 2 + 3, 2 + i * 2.8, -2, [Math.PI / 2, 0, 0]);
  p.lathe([[0, 0], [6.2, 0], [5.6, 1.6], [4, 3], [0, 3.8]], M(0xd8d2f0, { roughness: .3, metalness: .2 }), -W / 2 + 3, H + 3, -2);
  const t = signTex('the galaxy', { bg: 'none', fg: '#ffffff', size: .78, stroke: '#3a2a9a', w: 1024, h: 220 }); p.sign(t, 26, 5.6, 5, H - 4.2, .3, 0, .05, 0x3a2a9a);
  const ring = M(0xffc83d, { emissive: 0xff9a00, emissiveIntensity: .5, roughness: .3 }); p.sph(1.6, M(0xff7a3d, { emissive: 0xff5a1d, emissiveIntensity: .4 }), 18.5, H - 4, .6, [1, 1, 1], 24); p.tor(2.6, .22, ring, 18.5, H - 4, .6, [1.2, .3, 0]);
  p.box(24, 4.2, .3, M(0x1b1640), 4, 2.1, .1, .1); for (let i = 0; i < 8; i++) p.box(2.4, 3.6, .12, GLASS, -7 + i * 3, 1.9, .3, .05); p.box(26, .6, 3, M(0xe6e2f5), 4, 4.5, 1.2, .2);
  for (let i = 0; i < 5; i++) p.sign(signTex(['CINEMA', 'BOWLING', 'GYM', 'FOOD', 'ARCADE'][i], { bg: ['#ff3b6b', '#2fb3ff', '#30d158', '#ff9f0a', '#bf5af2'][i], size: .5, w: 512, h: 160 }), 4, 1.2, -6 + i * 5, 6.4, .35);
  return { g, w: W + 4, name: 'THE GALAXY' }; };

// ---- Luton Town Hall: white stone, portico, clock tower with a dome and lantern; the clock shows the real time ----
LM.townhall = () => { const g = new THREE.Group(), p = P(g), dyn = new THREE.Group(), q = P(dyn), W = 34, H = 13, D = 14, st = M(0xf5eedf, { roughness: .8 }), st2 = M(0xe9dfca, { roughness: .8 });
  p.box(W, H, D, st, 0, H / 2, -D / 2 - 2, .15); p.box(W + .6, .9, D + .6, st2, 0, H + .2, -D / 2 - 2, .2); p.box(W + .4, 1.2, D + .4, st2, 0, .6, -D / 2 - 2, .1);
  for (let i = 0; i < 10; i++) { const x = -W / 2 + 2 + i * 3.35; if (Math.abs(x) < 6) continue; arch(p, x, 1.6, 1.6, 3.2, -1.88); arch(p, x, 7.2, 1.5, 3, -1.88); }
  for (let i = 0; i < 6; i++) { p.cyl(.45, .5, 8, st, -5 + i * 2, 5.2, 1.2, 20); p.cyl(.65, .65, .4, st2, -5 + i * 2, 1.2, 1.2, 20); p.box(1.2, .5, 1.2, st2, -5 + i * 2, 9.4, 1.2, .1); }
  p.box(12.5, 1, 3.6, st2, 0, 10, -.2, .1); p.shape([[-6.6, 0], [6.6, 0], [0, 2.6], [-6.6, 0]], 3.4, st, 0, 10.5, -.2, null, .08);
  for (let i = 0; i < 4; i++) p.box(14 - i * .8, .3, 1 + i * .7, st2, 0, .15 + i * .3, 3.8 - i * .35, .05);
  const tx = 0, tz = -8, TW = 6.5; p.box(TW, 14, TW, st, tx, H + 7, tz, .15); p.box(TW + .6, .7, TW + .6, st2, tx, H + .6, tz, .15); p.box(TW + .5, .6, TW + .5, st2, tx, H + 14, tz, .15);
  const clockT = canvasTex(512, 512, (x, w, h) => { const r = w / 2; x.fillStyle = '#fffdf5'; x.beginPath(); x.arc(r, r, r - 6, 0, 7); x.fill(); x.lineWidth = 18; x.strokeStyle = '#d4a93a'; x.stroke(); x.fillStyle = '#2b2f36'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.save(); x.translate(r, r); x.rotate(a); x.fillRect(-6, -r + 30, 12, i % 3 ? 26 : 44); x.restore(); } });
  const faces = [{ x: tx, z: tz + TW / 2 + .02, ry: 0 }, { x: tx + TW / 2 + .02, z: tz, ry: Math.PI / 2 }, { x: tx - TW / 2 - .02, z: tz, ry: -Math.PI / 2 }];
  const hands = []; faces.forEach(f => { p.add(new THREE.CircleGeometry(2.3, 48), sigM(clockT), f.x, H + 9, f.z, [0, f.ry, 0]); p.tor(2.35, .14, M(0xd4a93a, { metalness: .6, roughness: .3 }), f.x, H + 9, f.z, [0, f.ry, 0]);
    const hm = M(0x23262c); const pv = new THREE.Group(); pv.position.set(f.x + Math.sin(f.ry) * .08, H + 9, f.z + Math.cos(f.ry) * .08); pv.rotation.y = f.ry; dyn.add(pv);
    const hh = new THREE.Mesh(rboxGeo(.22, 1.3, .06, .1), hm); hh.geometry.translate(0, .55, 0); const mh = new THREE.Mesh(rboxGeo(.14, 1.9, .06, .07), hm); mh.geometry.translate(0, .8, 0);
    const H1 = new THREE.Group(); H1.add(hh); const M1 = new THREE.Group(); M1.add(mh); M1.position.z = .04; pv.add(H1, M1); hands.push([H1, M1]); });
  p.cyl(2.6, 3.4, 4, st, tx, H + 16.4, tz, 8); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; p.cyl(.22, .22, 3.6, st2, tx + Math.cos(a) * 3, H + 16.4, tz + Math.sin(a) * 3, 10); }
  p.lathe([[0, 0], [3.3, 0], [3, 1.6], [2, 3], [0, 3.7]], M(0x6fa898, { roughness: .45, metalness: .2 }), tx, H + 18.4, tz);
  p.cyl(.05, .05, 4.5, DARK, tx, H + 24, tz, 8); const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4, 12, 1), M(0xffffff, { side: THREE.DoubleSide, map: canvasTex(256, 150, (x, w, h) => { x.fillStyle = '#f08a1a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.fillRect(0, h * .4, w, h * .2); x.fillStyle = '#1f3260'; x.beginPath(); x.arc(w * .5, h * .5, h * .22, 0, 7); x.fill(); }) }));
  flag.position.set(tx + 1.25, H + 25.4, tz); dyn.add(flag); const fp = flag.geometry.attributes.position, fx = Float32Array.from(fp.array);
  [-12, 12].forEach(x => { const t = treeG(1, .9); t.position.set(x, 0, 4.5); g.add(t); });
  const tick = (t) => { const d = new Date(), hr = d.getHours() % 12 + d.getMinutes() / 60, mn = d.getMinutes() + d.getSeconds() / 60; hands.forEach(([H1, M1]) => { H1.rotation.z = -hr / 12 * 6.283; M1.rotation.z = -mn / 60 * 6.283; });
    for (let i = 0; i < fp.count; i++) { const x0 = fx[i * 3]; fp.setZ(i, Math.sin(x0 * 2.6 - t * 6) * .18 * (x0 + 1.2)); } fp.needsUpdate = true; };
  return { g, w: W + 2, name: 'LUTON TOWN HALL', dyn, tick }; };

// ---- Luton Central Mosque: cream walls, big green dome, minaret with a gold crescent, arched windows ----
LM.masjid = () => { const g = new THREE.Group(), p = P(g), W = 24, H = 9, D = 16, cr = M(0xfaf0dc, { roughness: .8 }), gr = M(0x1f9a5a, { roughness: .35, metalness: .15 }), gold = M(0xf2c14e, { metalness: .8, roughness: .25, emissive: 0x7a5a10, emissiveIntensity: .3 });
  p.box(W, H, D, cr, 0, H / 2, -D / 2 - 1, .15); p.box(W + .5, .6, D + .5, M(0xe8dcc0), 0, H + .2, -D / 2 - 1, .15);
  for (let i = 0; i < 5; i++) arch(p, -8 + i * 4, 1.4, 2, 4.6, -.88, GLASS, M(0x1f9a5a, { roughness: .4 }));
  p.cyl(5, 5, 2.4, cr, 2, H + 1.4, -9, 32); p.lathe([[0, 0], [5.4, 0], [5.8, 1.4], [5.4, 3.4], [4, 5.4], [1.6, 6.8], [.3, 7.6], [0, 7.8]], gr, 2, H + 2.6, -9, 40);
  p.cyl(.12, .12, 1.4, gold, 2, H + 11, -9, 10); p.sph(.4, gold, 2, H + 11.7, -9, [1, 1, 1], 16); p.tor(.6, .12, gold, 2, H + 12.6, -9, [0, 0, .5], Math.PI * 1.3);
  const mx = -W / 2 + 2, mz = -2; p.cyl(1.1, 1.3, 24, cr, mx, 12, mz, 24); [8, 16].forEach(y => { p.cyl(1.8, 1.4, .7, M(0xe8dcc0), mx, y, mz, 24); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; p.cyl(.06, .06, .8, WHITE, mx + Math.cos(a) * 1.7, y + .7, mz + Math.sin(a) * 1.7, 6); } p.tor(1.7, .06, WHITE, mx, y + 1.1, mz, [Math.PI / 2, 0, 0]); });
  p.cyl(1.2, 1.2, 1.6, cr, mx, 24.8, mz, 24); p.lathe([[0, 0], [1.4, 0], [1.3, 1.2], [.6, 2.4], [0, 2.9]], gr, mx, 25.6, mz, 24); p.cyl(.06, .06, 1, gold, mx, 28.8, mz, 8); p.tor(.35, .07, gold, mx, 29.6, mz, [0, 0, .5], Math.PI * 1.3);
  arch(p, 7, .2, 3.4, 6, -.8, M(0x8a5a2a, { roughness: .5 }), gold); p.sign(signTex('LUTON CENTRAL MOSQUE', { bg: '#1f7a4a', size: .5, border: '#f2c14e' }), 12, 1.6, 0, 7.6, -.75);
  for (let x = -W / 2; x <= W / 2; x += .5) p.cyl(.04, .04, 1.2, DARK, x, .6, 3, 6); p.box(W, .08, .08, DARK, 0, 1.2, 3, .02); p.box(W, .5, .35, M(0xe8dcc0), 0, .25, 3, .08);
  return { g, w: W + 3, name: 'LUTON CENTRAL MOSQUE' }; };

// ---- The Hat Factory: red-brick gable end with a big pointed top and the famous mural ----
LM.hatfactory = () => { const g = new THREE.Group(), p = P(g), W = 15, H = 13, D = 20, br = BRICKS[1];
  p.shape([[-W / 2, 0], [W / 2, 0], [W / 2, H], [0, H + 5.5], [-W / 2, H], [-W / 2, 0]], D, br, 0, 0, -D / 2, null, .15);
  p.shape([[-W / 2 - .3, H - .3], [0, H + 5.8], [W / 2 + .3, H - .3], [W / 2 + .3, H + .3], [0, H + 6.4], [-W / 2 - .3, H + .3]], .5, M(0xe8dcc0), 0, 0, .1, null, .05);
  const mural = canvasTex(1024, 1024, (x, w, h) => { const gg = x.createLinearGradient(0, 0, w, h); gg.addColorStop(0, '#2c6fd6'); gg.addColorStop(1, '#1d3f9a'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) { x.fillStyle = ['#ff5aa8', '#ffd23f', '#35d0ff', '#ffffff'][i % 4]; x.globalAlpha = .25; x.beginPath(); x.arc(RND() * w, RND() * h, 40 + RND() * 120, 0, 7); x.fill(); } x.globalAlpha = 1;
    x.textAlign = 'center'; x.lineJoin = 'round'; x.font = `230px ${FONT}`; x.lineWidth = 30; x.strokeStyle = '#7a1050'; ['HAT', 'FACTORY'].forEach((t, i) => { x.strokeText(t, w / 2, 380 + i * 250); x.fillStyle = '#ff6fbe'; x.fillText(t, w / 2, 380 + i * 250); });
    x.fillStyle = '#ffd23f'; x.font = `70px ${FONT}`; x.fillText('ARTS CENTRE', w / 2, 860); x.fillStyle = '#1b1b1b'; x.beginPath(); x.ellipse(w / 2, 150, 150, 40, 0, 0, 7); x.fill(); x.fillRect(w / 2 - 90, 50, 180, 100); x.fillStyle = '#ff5aa8'; x.fillRect(w / 2 - 90, 115, 180, 25); });
  p.sign(mural, 11.5, 11.5, 0, 7.4, .2, 0, .05, 0xe8dcc0); for (let i = 0; i < 3; i++) p.box(14.6, .3, .3, M(0xe8dcc0), 0, 1 + i * .01 + (i ? 0 : 0), .15, .05);
  p.box(12, 1.6, .3, M(0x8a9098, { metalness: .5, roughness: .4 }), 0, .8, .4, .05);
  return { g, w: W + 3, name: 'THE HAT FACTORY' }; };

// ---- Kenilworth Road: the Oak Stand rising behind a row of terraced houses, floodlights, orange everything ----
LM.kenilworth = () => { const g = new THREE.Group(), p = P(g), W = 40, OR = M(0xf27d1b, { roughness: .45 }), NV = M(0x1f3260, { roughness: .5 }), br = BRICKS[0];
  for (let i = 0; i < 5; i++) { const x = -W / 2 + 4 + i * 8; p.box(7.8, 6.4, 7, br, x, 3.2, -3.5, .06); p.box(2, 2.3, .2, M(i === 2 ? 0xf27d1b : 0x2f5fb8), x + 2, 1.15, .02, .05); p.box(2.4, 1.5, .1, GLASS, x - 1.5, 2, .05, .03); p.box(2.4, 1.3, .1, GLASS, x - 1.5, 4.8, .05, .03); }
  p.shape([[-3.9, 0], [3.9, 0], [0, 2.4], [-3.9, 0]], W, ROOFS[2], 0, 6.4, -3.5, [0, Math.PI / 2, 0], 0);
  const sw = W + 6; for (let r = 0; r < 9; r++) { p.box(sw, 1.1, 2, r % 2 ? OR : M(0xffffff), 0, 7 + r * 1.1, -10 - r * 1.6, .1); }
  p.box(sw + 2, .5, 18, M(0xe9ecf0, { metalness: .3, roughness: .4 }), 0, 19, -17, .2); for (let i = 0; i < 6; i++) p.cyl(.25, .25, 19, NV, -sw / 2 + i * sw / 5, 9.5, -25, 12);
  p.sign(signTex('KENILWORTH ROAD', { bg: '#f27d1b', fg: '#ffffff', size: .55, stroke: '#7a3a00' }), 18, 2.6, 0, 18.2, -7.6);
  p.sign(signTex('OAK STAND', { bg: '#1f3260', size: .6 }), 6, 1.4, 0, 6.6, .35);
  [-1, 1].forEach(s => { const x = s * (W / 2 + 4), z = -14; p.cyl(.35, .5, 30, M(0xd0d5dc, { metalness: .5, roughness: .35 }), x, 15, z, 12); p.box(5, 3, .6, M(0x3a3f47), x, 30.5, z, .2);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) p.cyl(.45, .45, .2, BASIC(0xfffbe6), x - 1.8 + c * 1.2, 29.6 + r * .95, z + .35, 14, [Math.PI / 2, 0, 0]); });
  return { g, w: W + 12, name: 'KENILWORTH ROAD · OAK STAND' }; };

// ---- Marsh Farm: three tall blocks in blue patchwork cladding ----
LM.marshfarm = () => { const g = new THREE.Group(), p = P(g);
  const clad = canvasTex(256, 1024, (x, w, h) => { const C = ['#3f7fd0', '#5a9be6', '#2f63b8', '#7ab4f0', '#4f8ad8']; for (let r = 0; r < 32; r++) for (let c = 0; c < 4; c++) { x.fillStyle = C[(r * 3 + c * 7 + (RND() * 2 | 0)) % 5]; x.fillRect(c * 64, r * 32, 64, 32); }
    for (let r = 0; r < 16; r++) for (let c = 0; c < 4; c++) { x.fillStyle = '#e8f6ff'; rr(x, c * 64 + 10, r * 64 + 14, 44, 32, 6); x.fill(); x.fillStyle = '#5aa0dc'; rr(x, c * 64 + 14, r * 64 + 18, 36, 24, 4); x.fill(); } });
  const cm = M(0xffffff, { map: clad, roughness: .5 });
  [[-9, -8, 46], [3, -16, 40], [12, -6, 43]].forEach(([x, z, h]) => { p.box(9, h, 9, cm, x, h / 2, z, .2); p.box(9.6, .8, 9.6, WHITE, x, h + .3, z, .2); p.box(1.6, h, .4, M(0xe9ecf0), x + 3, h / 2, z + 4.6, .1); p.cyl(.05, .05, 3, DARK, x - 2, h + 2, z, 6); });
  for (let i = 0; i < 4; i++) { const t = treeG(i % 3, 1.1); t.position.set(-14 + i * 9, 0, 3); g.add(t); }
  p.sign(signTex('MARSH FARM', { bg: '#2f6fd0', size: .6 }), 7, 1.6, -14, 1.6, 4.5);
  return { g, w: 36, name: 'MARSH FARM' }; };

// ---- London Luton Airport: curved glass terminal, control tower, parked plane ----
export const planeG = (tail = 0xff6a1a) => { const g = new THREE.Group(), p = P(g), wm = M(0xf7f7f9, { roughness: .3, metalness: .1 }), tm = M(tail, { roughness: .35 });
  p.cap(1.5, 16, wm, 0, 0, 0, [Math.PI / 2, 0, 0]); p.sph(1.5, wm, 0, 0, -9, [1, 1, 1.4], 20); p.shape([[0, 0], [9, -3.5], [9, -5], [0, -3.2]], .35, wm, 0, -.4, 0, [Math.PI / 2, 0, 0], .1).scale.set(1, 1, 1);
  p.shape([[0, 0], [-9, -3.5], [-9, -5], [0, -3.2]], .35, wm, 0, -.4, 0, [Math.PI / 2, 0, 0], .1); p.shape([[0, 0], [0, 4.5], [-2.2, 5], [-3.6, 0]], .3, tm, 0, 1.2, 6, [0, Math.PI / 2, 0], .1);
  p.shape([[0, 0], [3.4, -1.4], [3.4, -2.2], [0, -1.6]], .2, wm, 0, .5, 8.4, [Math.PI / 2, 0, 0], .05); p.shape([[0, 0], [-3.4, -1.4], [-3.4, -2.2], [0, -1.6]], .2, wm, 0, .5, 8.4, [Math.PI / 2, 0, 0], .05);
  [-4.5, 4.5].forEach(x => p.cyl(.75, .75, 3, M(0xd8dde3, { metalness: .4, roughness: .3 }), x, -1.3, -1.8, 18, [Math.PI / 2, 0, 0])); for (let i = 0; i < 14; i++) [-1, 1].forEach(s => p.box(.35, .35, .1, GLASS, s * 1.42, .4, -7 + i * 1, .1, [0, Math.PI / 2, 0]));
  p.box(1.6, .5, .4, GLASS, 0, .55, -10.6, .2); return g; };
LM.airport = () => { const g = new THREE.Group(), p = P(g), W = 50;
  p.box(W, 9, 16, M(0xe9eef5, { roughness: .4 }), 0, 4.5, -10, .3); p.box(W - 4, 7, .3, GLASS, 0, 4.2, -1.9, .1); for (let i = 0; i < 12; i++) p.box(.25, 7.2, .4, WHITE, -W / 2 + 4 + i * 3.8, 4.2, -1.75, .05);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, W + 2, 40, 1, false, -.55, 1.1), M(0xf7f9fc, { roughness: .35, metalness: .25 })); roof.rotation.z = Math.PI / 2; roof.position.set(0, -3.6, -10); roof.castShadow = true; g.add(roof);
  p.cyl(1.2, 1.6, 22, M(0xe9eef5), W / 2 - 5, 11, -16, 20); p.cyl(3, 2.6, 3, GLASS, W / 2 - 5, 23, -16, 24); p.cyl(3.3, 3.3, .5, WHITE, W / 2 - 5, 24.7, -16, 24); p.cyl(.05, .05, 3, DARK, W / 2 - 5, 26.5, -16, 6);
  p.sign(signTex('LONDON LUTON AIRPORT', { bg: '#ffffff', fg: '#3a2a8a', stroke: false, size: .5, border: '#ff6a1a' }), 22, 2.6, -4, 9.8, -1.6);
  const pl = planeG(0x7a3fd1); pl.position.set(-10, 3.2, -26); pl.rotation.y = .4; pl.scale.setScalar(.9); g.add(pl);
  return { g, w: W + 4, name: 'LONDON LUTON AIRPORT' }; };

// ---- SMR billboard on a red-brick gable ----
let smrImg = null; { const im = new Image(); im.onload = () => { smrImg = im; }; im.src = '../smr-mark.svg'; }
LM.smr = () => { const g = new THREE.Group(), p = P(g), W = 12, H = 9, br = BRICKS[2];
  p.shape([[-W / 2, 0], [W / 2, 0], [W / 2, H], [0, H + 3.4], [-W / 2, H], [-W / 2, 0]], 9, br, 0, 0, -4.5, null, .12);
  const t = canvasTex(1024, 576, (x, w, h) => { const gg = x.createLinearGradient(0, 0, w, h); gg.addColorStop(0, '#1a1036'); gg.addColorStop(1, '#3a1660'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
    if (smrImg) x.drawImage(smrImg, 60, 140, 260, 260 * smrImg.height / smrImg.width || 260); else { x.fillStyle = '#fff'; x.font = `150px ${FONT}`; x.fillText('SMR', 60, 330); }
    const lines = [['WEBSITES & APPS', ['#7b5cff', '#ff4fa3']], ['GRAPHIC DESIGN', ['#3a8bff', '#a35cff']], ['PRINTING', ['#ff4fa3', '#ff9a3d']]];
    lines.forEach(([s, c], i) => { const gr = x.createLinearGradient(380, 0, 980, 0); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); x.fillStyle = gr; x.font = `78px ${FONT}`; x.fillText(s, 380, 170 + i * 110); });
    x.fillStyle = '#ffffff'; x.font = `46px ${FONT}`; x.fillText('smrgraphics.co.uk', 380, 500); });
  p.sign(t, 10, 5.6, 0, 6, .25, 0, .3, 0x1b1d22); [-3.5, 3.5].forEach(x => p.box(.2, 1.6, .5, DARK, x, 2.4, .5, .05)); p.sign(signTex('SMR STUDIO', { bg: '#2b2f36', size: .55 }), 3.2, .7, 0, 2.6, .2);
  return { g, w: W + 3, name: 'SMR STUDIO' }; };
// landmarks still to add (the 2D game's full list) — built in later batches
export const TODO = ['Masjid-e-Ali', 'Suffa-Tul-Islam Masjid', 'Luton & Dunstable Hospital', 'Luton Hoo', 'Wardown Park', 'Stockwood Park', 'Frasers / TK Maxx', 'Currys + Mr Rushed', 'Vauxhall plant', 'Orbital Trampoline Park', 'Big Yellow', 'Tesco', 'Matalan', 'B&Q', 'Lidl', 'JD Gyms', 'Grand Bazar', 'Kahwa Cafe', 'G&A', 'Krispy Lemon Chicken', "Toro's", 'Cycle King', 'Kaya Lounge', 'Spud Kingz', 'Peri-Peri Original', 'Miami Crispy', 'The Barak', 'Karwan', 'Chaiiwala', 'Chaiikhana', 'Al-Quds', 'Tops Pizza', 'Nadeem Plaza', 'Gurdwara', 'Lewsey', 'Luton Sixth Form', 'Chiltern', "Nando's"];
