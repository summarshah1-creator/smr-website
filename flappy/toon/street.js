/* toon/street.js — STREET & HOUSES (Leagrave Road, cartoon style). Road with 3 lanes, kerbs, pavements, sky + clouds,
   lamps, trees, pillar boxes, bins, telegraph poles + wires; 1930s semis, red-brick terraces, a shop parade, a car lot,
   the Welcome to Luton sign; cartoon cars. One model per thing; colours picked from palettes when it appears. */
import { THREE, scene, M, BASIC, P, rboxGeo, hipRoof, canvasTex, worldTex, signTex, rr, sigM, shadeHex, FONT, curve, MAXANI } from './core.js';

export const ROADW = 7.6, PAVW = 3.6, TILE = 240;
// 4 lanes: left pavement, left road lane (traffic going your way), right road lane (oncoming), right pavement
export const LANES = [-(ROADW / 2 + PAVW / 2), -ROADW / 4, ROADW / 4, ROADW / 2 + PAVW / 2];
const RND = Math.random, pick = a => a[(RND() * a.length) | 0];

// ---------- textures ----------
const roadTex = (() => { const t = canvasTex(512, 1024, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#454b57'); g.addColorStop(.5, '#525967'); g.addColorStop(1, '#454b57'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${RND() < .5 ? '0,0,0' : '255,255,255'},${RND() * .045})`; const s = 2 + RND() * 5; x.beginPath(); x.arc(RND() * w, RND() * h, s, 0, 7); x.fill(); }
    const px = m => (m / ROADW + .5) * w; x.fillStyle = '#f4f2ea'; for (let y = 0; y < h; y += 256) { rr(x, px(0) - 6, y + 40, 12, 150, 6); x.fill(); }
    x.fillStyle = '#f2c21b'; [-1, 1].forEach(s => { [-.14, .14].forEach(o => x.fillRect(px(s * (ROADW / 2 - .35) + o) - 5, 0, 10, h)); }); }, true); t.repeat.set(1, TILE / 24); return t; })();
const pavTex = (() => { const t = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#d9ccb6'; x.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const v = (RND() - .5) * 14; x.fillStyle = shadeHex('#ece1cd', v); rr(x, c * 85 + 3, r * 85 + 3, 79, 79, 8); x.fill(); } }, true); t.repeat.set(2, TILE / 1.8); return t; })();
export const GLASS = M(0xffffff, { map: canvasTex(128, 192, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#d6f0ff'); g.addColorStop(.45, '#7fbde8'); g.addColorStop(1, '#3e7cb8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(w * .15, h); x.lineTo(w * .45, h); x.lineTo(w * .95, 0); x.lineTo(w * .65, 0); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.moveTo(w * .55, h); x.lineTo(w * .62, h); x.lineTo(w, h * .3); x.lineTo(w, h * .18); x.fill(); }), roughness: .15, metalness: .1 });
export const brickT = (c, m) => worldTex(256, 256, (x, w, h) => { x.fillStyle = m; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) { x.fillStyle = shadeHex(c, (RND() - .5) * 26); rr(x, k * 64 + (r % 2) * 32 + 3, r * 32 + 3, 58, 26, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.08)'; rr(x, k * 64 + (r % 2) * 32 + 6, r * 32 + 5, 52, 8, 4); x.fill(); } }, [1.6, .9]);
const tileT = c => worldTex(256, 256, (x, w, h) => { x.fillStyle = shadeHex(c, -40); x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let k = -1; k < 9; k++) { const g = x.createLinearGradient(0, r * 32, 0, r * 32 + 30); g.addColorStop(0, shadeHex(c, -12)); g.addColorStop(1, shadeHex(c, 14 + (RND() - .5) * 18)); x.fillStyle = g; rr(x, k * 32 + (r % 2) * 16 + 2, r * 32, 29, 30, 6); x.fill(); } }, [2.2, 2.2]);
const pavingT = worldTex(128, 128, (x, w, h) => { x.fillStyle = '#9d8f80'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) { x.fillStyle = pick(['#c9b8a4', '#b9a690', '#d4c4b0']); rr(x, k * 32 + (r % 2) * 16 + 2, r * 16 + 2, 28, 12, 4); x.fill(); } }, [1.6, 1.6]);
const leafT = c => worldTex(128, 128, (x, w, h) => { x.fillStyle = shadeHex(c, -30); x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.fillStyle = shadeHex(c, (RND() - .3) * 50); x.beginPath(); x.arc(RND() * w, RND() * h, 4 + RND() * 7, 0, 7); x.fill(); } }, [1.3, 1.3]);
export const BRICKS = [brickT('#b4573c', '#e6d5c2'), brickT('#a94a35', '#dccbb8'), brickT('#c26a45', '#eadbc8')].map(t => M(0xffffff, { map: t, roughness: .85 }));
export const ROOFS = ['#9b4a32', '#7d4a3a', '#5d6470', '#a85a3a'].map(c => M(0xffffff, { map: tileT(c), roughness: .7 }));
export const RENDER = ['#fbf1dc', '#f6e5c6', '#e8f2e4', '#f5e0d4', '#e8eef6', '#fff7e8', '#f2e8ff'].map(c => M(c, { roughness: .9 }));
export const HEDGE = M(0xffffff, { map: leafT('#4fa33a'), roughness: .9 }), LAWN = M(0x86cf5a, { roughness: .95 }), PAVING = M(0xffffff, { map: pavingT, roughness: .9 });
export const WHITE = M(0xffffff, { roughness: .45 }), DARK = M(0x2b2f36, { roughness: .5 }), COPING = M(0xf1e9dc, { roughness: .7 });

// ---------- sky, ground, road tiles ----------
const sky = new THREE.Mesh(new THREE.SphereGeometry(380, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { a: { value: new THREE.Color(0x3d9cf0) }, b: { value: new THREE.Color(0xbfe4ff) }, c: { value: new THREE.Color(0xfff2da) } },
  vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: 'uniform vec3 a,b,c; varying vec3 p; void main(){ float h = p.y; vec3 col = mix(b, a, smoothstep(.02,.55,h)); col = mix(c, col, smoothstep(-.05,.12,h)); gl_FragColor = vec4(col,1.); }' }));
sky.name = 'sky'; sky.renderOrder = -1; scene.add(sky);
export const clouds = []; { const cm = M(0xffffff, { roughness: 1, emissive: 0xffffff, emissiveIntensity: .45 });
  for (let i = 0; i < 16; i++) { const g = new THREE.Group(), p = P(g), n = 4 + (RND() * 4 | 0); for (let k = 0; k < n; k++) p.sph(3 + RND() * 3.5, cm, (k - n / 2) * 3.4, RND() * 2, RND() * 2, [1, .75, 1], 16); g.children.forEach(m => { m.castShadow = false; m.receiveShadow = false; });
    g.position.set((RND() < .5 ? -1 : 1) * (30 + RND() * 70), 34 + RND() * 30, -RND() * 320); g.scale.setScalar(.8 + RND() * .9); scene.add(g); clouds.push(g); } }
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 900, 20, 90), M(0x8fd468, { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.02; ground.receiveShadow = true; ground.name = 'ground'; scene.add(ground);
export const tiles = []; { const roadM = M(0xffffff, { map: roadTex, roughness: .85 }), pavM = M(0xffffff, { map: pavTex, roughness: .9 }), kerbM = M(0xe7e2d8, { roughness: .6 });
  for (let i = 0; i < 2; i++) { const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.PlaneGeometry(ROADW, TILE, 4, 80), roadM); r.rotation.x = -Math.PI / 2; r.receiveShadow = true; g.add(r);
    [-1, 1].forEach(s => { const pv = new THREE.Mesh(new THREE.BoxGeometry(PAVW + 1.2, .24, TILE, 2, 1, 80), pavM); pv.position.set(s * (ROADW / 2 + .3 + (PAVW + 1.2) / 2), .12, 0); pv.receiveShadow = true; g.add(pv);
      const kb = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, TILE, 10, 80), kerbM); kb.rotation.x = Math.PI / 2; kb.position.set(s * (ROADW / 2 + .16), .1, 0); kb.receiveShadow = true; g.add(kb); });
    g.position.z = -i * TILE; scene.add(g); tiles.push(g); } }

// ---------- cartoon car (shared shapes, palette colours) ----------
const CARCOL = [0xe8402f, 0x2f7de8, 0xf4f4f4, 0x2b2f36, 0x9aa3ad, 0xf2b705, 0x3fae5a, 0x7a4fd1, 0x1f3f7a, 0xc8ccd2];
let carMaker = null; export const setCarMaker = f => { carMaker = f; };   // game.js plugs in the real Luton car models
export function carG(col = pick(CARCOL)) { if (carMaker) return carMaker(); const g = new THREE.Group(), p = P(g), bm = M(col, { roughness: .3, metalness: .25 }), tm = M(0x23262c, { roughness: .6 });
  p.box(1.9, .8, 4.2, bm, 0, .75, 0, .34); p.box(1.66, .72, 2.3, bm, 0, 1.38, -.25, .3); p.box(1.7, .5, 2.0, GLASS, 0, 1.38, -.25, .22);
  [[-1, 1.3], [1, 1.3], [-1, -1.35], [1, -1.35]].forEach(([s, z]) => { p.cyl(.4, .4, .32, tm, s * .86, .4, z, 20, [0, 0, Math.PI / 2]); p.cyl(.22, .22, .34, WHITE, s * .87, .4, z, 16, [0, 0, Math.PI / 2]); });
  [-1, 1].forEach(s => { p.sph(.17, M(0xfff8d8, { emissive: 0xfff2c0, emissiveIntensity: .5 }), s * .62, .86, 2.08, [1, .7, .5], 12); p.box(.38, .16, .08, M(0xff3b30, { emissive: 0xc00000, emissiveIntensity: .4 }), s * .6, .92, -2.1, .05); });
  p.box(.6, .16, .04, M(0xf2c21b), 0, .55, -2.12, .02); p.box(.6, .16, .04, WHITE, 0, .55, 2.12, .02); return g; }

// ---------- props ----------
const PROP = {};
PROP.lamp = (() => { const g = new THREE.Group(), p = P(g), m = M(0x7d8794, { roughness: .4, metalness: .4 }); p.cyl(.09, .15, 7.2, m, 0, 3.6, 0, 14); p.cyl(.2, .2, .8, m, 0, .4, 0, 14);
  p.add(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 7.1, 0), new THREE.Vector3(0, 8.1, 0), new THREE.Vector3(-1.2, 8.0, 0)), 12, .07, 8), m);
  p.box(1, .2, .45, m, -1.5, 7.98, 0, .09); p.box(.8, .05, .3, M(0xfff6d8, { emissive: 0xfff1c0, emissiveIntensity: .8 }), -1.5, 7.86, 0, .02); return g; })();
const TREEM = ['#5cb83f', '#4aa33a', '#6cc24a'].map(c => M(0xffffff, { map: leafT(c), roughness: .9 })), BARK = M(0x7a5236, { roughness: .9 });
export const treeG = (k = (RND() * 3) | 0, s = 1) => { const g = new THREE.Group(), p = P(g); p.cyl(.18, .3, 3.2, BARK, 0, 1.6, 0, 12); p.rod([0, 2.4, 0], [.8, 3.6, .2], .1, BARK); p.rod([0, 2.6, 0], [-.7, 3.7, -.3], .1, BARK);
  const n = 7; for (let i = 0; i < n; i++) { const a = i / n * 6.28 + k, d = i ? 1.1 : 0; p.sph(i ? 1.15 + (i % 3) * .2 : 1.6, TREEM[k % 3], Math.cos(a) * d, 4.2 + (i ? (i % 2) * .7 : .6), Math.sin(a) * d, [1, .9, 1], 18); } g.scale.setScalar(s); return g; };
PROP.trees = [0, 1, 2].map(k => treeG(k));
export const PILLAR = PROP.pillar = (() => { const g = new THREE.Group(), p = P(g), r = M(0xd8231f, { roughness: .35 }); p.cyl(.32, .34, 1.3, r, 0, .65, 0, 20); p.sph(.34, r, 0, 1.3, 0, [1, .55, 1], 20); p.box(.36, .06, .1, DARK, 0, 1.05, .31, .02); p.cyl(.38, .38, .08, DARK, 0, .04, 0, 20); return g; })();
export const BINP = PROP.bin = (() => { const g = new THREE.Group(), p = P(g); p.box(.62, .95, .7, M(0x2b2f36, { roughness: .5 }), 0, .55, 0, .07); p.box(.68, .08, .78, M(0x3f8f3a), 0, 1.04, .02, .04); return g; })();
const poleM = M(0x8a6a4a, { roughness: .9 }); PROP.pole = (() => { const g = new THREE.Group(), p = P(g); p.cyl(.13, .18, 9, poleM, 0, 4.5, 0, 10); p.box(1.6, .12, .12, poleM, 0, 8.6, 0, .03); return g; })();
export const STOP = PROP.stop = (() => { const g = new THREE.Group(), p = P(g), m = M(0x3a3f47, { roughness: .4, metalness: .3 }); [-1.6, 1.6].forEach(x => p.cyl(.06, .06, 2.6, m, x, 1.3, -.7, 10)); p.box(3.6, .14, 1.6, m, 0, 2.65, -.1, .06);
  p.box(3.3, 2.1, .05, M(0xcfe9ff, { transparent: true, opacity: .35, roughness: .1 }), 0, 1.4, -.72, 0); p.box(2.4, .1, .4, M(0x9a6a3a), 0, .55, -.5, .04); p.cyl(.05, .05, 3.2, m, 2.2, 1.6, .4, 8);
  p.sign(signTex('BUS', { bg: '#e0201a', size: .7, w: 256, h: 256, r: 128 }), .6, .6, 2.2, 3.0, .45); return g; })();
const WIRE = M(0x24262b, { roughness: .6 });
export const live = [];
let propZ = 0, propN = 0, lastPole = null;
export function resetStreet() { propZ = 0; propN = 0; lastPole = null; }
export function spawnProps(add) { const z = propZ - 9, n = propN++;
  [-1, 1].forEach(s => { const x = s * (ROADW / 2 + PAVW + .9); if (n % 2 === 0) { const l = PROP.lamp.clone(); l.position.set(x, .24, z); l.rotation.y = s > 0 ? 0 : Math.PI; add(l, z); }
    else if (RND() < .5) { const t = pick(PROP.trees).clone(); t.position.set(s * (ROADW / 2 + PAVW + 1.6), .24, z); t.rotation.y = RND() * 6; t.scale.setScalar(.9 + RND() * .35); add(t, z); }
  });
  if (n % 3 === 1) { const pz = z, x = ROADW / 2 + PAVW + 1.1, pg = PROP.pole.clone(); pg.position.set(x, .24, pz); add(pg, pz);
    if (lastPole !== null) { const g = new THREE.Group(); [-.6, 0, .6].forEach(o => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector3(x + o, 8.7 - Math.sin(t * Math.PI) * .8, lastPole + (pz - lastPole) * t)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, .025, 4), WIRE)); }); add(g, pz); }
    lastPole = pz; }
  propZ -= 18; return propZ; }
export const getPropZ = () => propZ;

// ---------- buildings: local front at z=0 facing the road (+z), depth goes into -z, width along x ----------
export const BUILD = {};
const DOORS = ['#d8323a', '#2f5fb8', '#2e8b57', '#f4f4f0', '#22262c', '#7a3fb5', '#f2a81d'];
function win(p, x, y, w, h, z, sill = true) { p.box(w + .24, h + .24, .2, WHITE, x, y, z, .06); p.box(w, h, .1, GLASS, x, y, z + .07, .03); p.box(w, .08, .14, WHITE, x, y + h * .18, z + .1, .02); p.box(.08, h, .14, WHITE, x, y, z + .1, .02); if (sill) p.box(w + .5, .14, .36, COPING, x, y - h / 2 - .14, z + .16, .05); }
function door(p, x, z, col) { p.box(1.25, 2.35, .2, WHITE, x, 1.17, z, .05); p.box(1.05, 2.2, .14, M(col, { roughness: .35 }), x, 1.12, z + .06, .05); p.box(.7, .55, .05, GLASS, x, 1.75, z + .14, .02); p.sph(.07, M(0xd9b04a, { metalness: .8, roughness: .3 }), x + .36, 1.1, z + .17, [1, 1, 1], 10); p.box(1.7, .16, 1, COPING, x, .08, z + .5, .05); }
BUILD.semi = (o = {}) => { const g = new THREE.Group(), p = P(g), W = 13, D = 8.5, H = 6, tudor = o.tudor, allRender = !tudor && RND() < .35, br = pick(BRICKS), up = tudor ? RENDER[0] : pick(RENDER), lo = allRender ? up : br, roof = pick(ROOFS);
  p.box(W, H / 2, D, lo, 0, H / 4, -D / 2, .08); p.box(W, H / 2, D, up, 0, H * .75, -D / 2, .08);
  const rf = hipRoof(W, D, 3.4, roof, .45); rf.position.set(0, H, 0); g.add(rf);
  [-1, 1].forEach(sd => { const bx = sd * (W / 2 - 2.1), bw = 3, bd = 1;
    p.box(bw, H - .2, bd, sd < 0 ? up : (allRender ? up : br), bx, (H - .2) / 2, bd / 2, .1); p.box(bw, H / 2, bd + .02, lo, bx, H / 4, bd / 2, .1);
    win(p, bx, 1.7, 2.4, 1.5, bd + .02); win(p, bx, 4.4, 2.4, 1.4, bd + .02);
    if (tudor) { const TB = M(0x2a2420); [-1.2, 1.2, 0].forEach(e => p.box(.14, 2.6, .06, TB, bx + e, 4.4, bd + .12, .02)); }
    const br2 = hipRoof(bw, bd + .1, .7, roof, .2); br2.position.set(bx, H - .2, bd + .05); g.add(br2);
    door(p, sd * 1.2, .02, pick(DOORS)); p.box(2, .2, .9, roof, sd * 1.2, 2.75, .45, .08);
    p.box(5.6, .1, 3.6, sd < 0 ? PAVING : LAWN, sd * 3.5, .06, 2.6, .04);
    if (sd > 0 || RND() < .5) { const c = carG(); c.position.set(sd * 3.6, .12, 2.9); c.rotation.y = Math.PI / 2 + (RND() - .5) * .1; c.scale.setScalar(.86); g.add(c); } });
  const ch = br; p.box(1.1, 2.4, 1.1, ch, 0, H + 2.4, -D / 2, .06); p.box(1.35, .2, 1.35, COPING, 0, H + 3.6, -D / 2, .05); [-.25, .25].forEach(x => p.cyl(.15, .17, .6, M(0xc0643c), x, H + 4, -D / 2, 12));
  p.box(W, .7, .3, br, 0, .35, 4.6, .1); p.box(W + .1, .14, .42, COPING, 0, .75, 4.6, .06); if (RND() < .6) p.box(4.4, 1.1, .8, HEDGE, -3.6, .62, 4.0, .4);
  if (RND() < .35) { const d = new THREE.Mesh(new THREE.SphereGeometry(.4, 16, 8, 0, Math.PI * 2, 0, .8), M(0xeeeeee, { roughness: .4, side: THREE.DoubleSide })); d.rotation.x = -1.2; d.position.set(pick([-1, 1]) * 4.6, H - 1, .4); g.add(d); }
  return { g, w: W + .5 }; };
BUILD.tudor = () => BUILD.semi({ tudor: true });
BUILD.terrace = () => { const g = new THREE.Group(), p = P(g), n = 4, hw = 5.2, W = n * hw, H = 6.6, D = 9, br = pick(BRICKS), roof = ROOFS[2];
  p.box(W, H, D, br, 0, H / 2, -D / 2, .06);
  const s = new THREE.Shape(); s.moveTo(-D / 2 - .4, 0); s.lineTo(D / 2 + .4, 0); s.lineTo(0, 2.8); s.lineTo(-D / 2 - .4, 0); const rg = new THREE.ExtrudeGeometry(s, { depth: W + .6, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-W / 2 - .3, H, -D / 2); p.add(rg, roof);
  for (let i = 0; i < n; i++) { const x0 = -W / 2 + i * hw + hw / 2; p.box(2.6, 2.8, .9, COPING, x0 - .9, 1.5, .45, .1); win(p, x0 - .9, 1.6, 2.1, 1.5, .92, false); p.box(3, .3, 1.2, roof, x0 - .9, 3.05, .45, .1);
    door(p, x0 + 1.5, 0, pick(DOORS)); win(p, x0 - .9, 4.7, 1.6, 1.4, 0); win(p, x0 + 1.4, 4.7, 1.1, 1.4, 0);
    if (i % 2 === 0) { const cx = x0 - hw / 2; p.box(1, 1.8, 1, br, cx, H + 2.5, -D / 2, .05); [-.22, .22].forEach(o => p.cyl(.14, .16, .5, M(0xc0643c), cx + o, H + 3.6, -D / 2, 10)); }
    p.box(hw - .4, .7, .3, br, x0, .35, 2.2, .1); p.box(hw - .3, .12, .4, COPING, x0, .74, 2.2, .05); }
  return { g, w: W + .6 }; };
const SHOPS = [['PERI PERI', '#d8251f'], ['FOOD & WINE', '#1e8a4a'], ['BARBERS', '#1f3f8f'], ['PIZZA & KEBAB', '#e86a10'], ['PHONE REPAIRS', '#6a2bbf'], ['DESSERTS', '#e0408a'], ['CHICKEN', '#c8102e'], ['BAKERY', '#b5651d']];
BUILD.parade = () => { const g = new THREE.Group(), p = P(g), W = 21, H = 7, D = 10, br = pick(BRICKS);
  p.box(W, H, D, br, 0, H / 2, -D / 2, .06); p.box(W + .3, .4, D + .3, COPING, 0, H + .2, -D / 2, .08);
  [-7, 0, 7].forEach(x => { const [t, c] = pick(SHOPS); p.box(6.6, 3.3, .3, M(0x2b2f36), x, 1.65, .1, .05); p.box(5.8, 2.6, .1, GLASS, x, 1.5, .27, .03);
    p.sign(signTex(t, { bg: c, size: .6 }), 6.2, 1.1, x, 3.9, .5); const aw = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 6.2, 18, 1, true, 0, Math.PI / 2), M(0xffffff, { map: canvasTex(256, 64, (xx, w, h) => { for (let i = 0; i < 8; i++) { xx.fillStyle = i % 2 ? '#fff' : c; xx.fillRect(i * 32, 0, 32, h); } }), side: THREE.DoubleSide, roughness: .7 }));
    aw.rotation.z = Math.PI / 2; aw.rotation.y = 0; aw.position.set(x, 3.0, .3); aw.rotation.x = Math.PI; aw.castShadow = true; g.add(aw);
    win(p, x - 1.6, 5.4, 1.8, 1.4, 0); win(p, x + 1.6, 5.4, 1.8, 1.4, 0); });
  return { g, w: W + .5 }; };
const CARL = ['CAR SALES', 'QUALITY USED CARS', 'CAR SUPERMARKET'];
BUILD.carlot = () => { const g = new THREE.Group(), p = P(g), W = 26, rail = M(0x2f6fd0, { roughness: .4, metalness: .3 });
  p.box(W, .08, 14, M(0x6b7280, { roughness: .9 }), 0, .04, -6, 0); for (let x = -W / 2; x <= W / 2; x += 2) p.cyl(.05, .05, 1.1, rail, x, .55, 1, 8); [.5, 1.05].forEach(y => p.box(W, .08, .08, rail, 0, y, 1, .03));
  for (let r = 0; r < 2; r++) for (let x = -W / 2 + 2; x < W / 2 - 6; x += 2.7) { const c = carG(); c.position.set(x, .08, -2.5 - r * 5.5); c.rotation.y = Math.PI / 2 * (r ? -1 : 1) + Math.PI / 2; c.scale.setScalar(.85); g.add(c); }
  const fl = ['#ff3b30', '#ffd60a', '#0a84ff', '#30d158']; const pts = []; for (let x = -W / 2; x <= W / 2; x += 1) pts.push(x); pts.forEach((x, i) => { if (i % 1 === 0) { const t = p.shape([[-.25, 0], [.25, 0], [0, -.5]], .02, M(fl[i % 4], { side: THREE.DoubleSide }), x, 3.2 - Math.sin((x + W / 2) / W * Math.PI) * .5, -.2, null, 0); t.castShadow = false; } });
  p.cyl(.06, .06, 3.4, rail, -W / 2, 1.7, -.2, 8); p.cyl(.06, .06, 3.4, rail, W / 2, 1.7, -.2, 8);
  p.box(6, 3, 4, WHITE, W / 2 - 4, 1.5, -10, .15); win(p, W / 2 - 4.8, 1.6, 2, 1.2, -7.9, false); p.sign(signTex(pick(CARL), { bg: '#2f6fd0', size: .5 }), 5.6, 1, W / 2 - 4, 3.6, -7.7);
  return { g, w: W + .5 }; };
BUILD.welcome = () => { const g = new THREE.Group(), p = P(g); const t = canvasTex(1024, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#eef3f8'); x.fillStyle = gr; rr(x, 6, 6, w - 12, h - 12, 60); x.fill(); x.lineWidth = 18; x.strokeStyle = '#e8711d'; rr(x, 22, 22, w - 44, h - 44, 48); x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#1f3260'; x.font = `120px ${FONT}`; x.fillText('Welcome to', w / 2, 190); x.fillStyle = '#e8711d'; x.font = `190px ${FONT}`; x.fillText('LUTON', w / 2, 370); x.fillStyle = '#4a5a7a'; x.font = `44px ${FONT}`; x.fillText('Please drive carefully', w / 2, 450); });
  [-2.4, 2.4].forEach(x => p.cyl(.12, .12, 3.4, M(0x9aa3ad, { metalness: .5, roughness: .35 }), x, 1.7, 0, 12)); p.sign(t, 6, 3, 0, 3.8, .1);
  for (let i = 0; i < 9; i++) p.sph(.5, M(pick([0xff5a8a, 0xffd23f, 0xb06bff, 0xff8a3d])), -3 + i * .75, .45, .8, [1, .8, 1], 12); p.box(7.5, .5, 1.6, M(0x8b5a3a), 0, .25, .8, .2);
  return { g, w: 9 }; };
