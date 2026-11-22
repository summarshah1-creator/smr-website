/* Delivery Rush (working title) — an SMR Original. Subway Surfers-style endless runner down Leagrave Road, Luton, in our own
   cartoon style. You're a delivery rider running the order; dodge oncoming traffic and street clutter across 4 lanes
   (pavement · road · road · pavement), run up ramps onto parked buses, grab £ tips and power-ups.
   Files: kit.js (look), rider.js (hero), vehicles.js (traffic), world.js (street, houses, landmarks), game.js (this). No other people.
   Hooks for checks: window.__rr = { start, step(ms, n), power(k), lane(d), jump(), roll(), B, god() } and ?manual=1. */
import * as THREE from 'three';
import { BEND, LOW, T, U, rb, rbs, cyl, sph, plane, canvasTex, sign, board, rr, blobShadow, C } from './kit.js';
import { rider, shadow, animRider, setOutfit, OUTFITS } from './rider.js';
import { vehicle } from './vehicles.js';
import { mergeGeometries } from '/flappy/3d/BufferGeometryUtils.js';
import { LX, LANE, RW, KERB, PAV_H, EDGE, baseY, TILE, roadTile, lamp, treeP, planter, bollard, HOUSES, LM, LM_NAMES, bake } from './world.js';

const $ = id => document.getElementById(id), qs = new URLSearchParams(location.search);
/* ================= renderer, scene, light, sky ================= */
const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1 : 2)); renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping; document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(), HORIZON = new THREE.Color(0xbfe0f6);
scene.fog = new THREE.Fog(HORIZON, 60, 160); scene.background = HORIZON;
const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, .1, 260);
scene.add(new THREE.HemisphereLight(0xf2f7ff, 0xd8c2a0, 1.35));
const sun = new THREE.DirectionalLight(0xfff2dc, 1.55); sun.position.set(-6, 12, 5); scene.add(sun); scene.add(sun.target);
// sky dome: soft gradient + painted clouds (not bent)
const sky = new THREE.Mesh(new THREE.SphereGeometry(240, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, map: canvasTex(16, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2f86d8'); g.addColorStop(.38, '#6db6ee'); g.addColorStop(.5, '#bfe0f6'); g.addColorStop(1, '#f2e2c6'); x.fillStyle = g; x.fillRect(0, 0, w, h); }) }));
scene.add(sky);
const cloudT = canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#fff'; [[70, 80, 46], [120, 62, 58], [175, 78, 44], [128, 88, 52], [210, 92, 30], [40, 96, 28]].forEach(([a, b, r]) => { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }); });
const clouds = []; for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, transparent: true, opacity: .92, fog: false, depthWrite: false })); s.scale.set(40, 20, 1); s.position.set((Math.random() - .5) * 200, 45 + Math.random() * 30, -60 - Math.random() * 160); scene.add(s); clouds.push(s); }

/* ================= street: road tiles, props, buildings ================= */
const tiles = [roadTile(), roadTile(), roadTile(), roadTile(), roadTile()]; tiles.forEach(t => scene.add(t));
const world = []; let sideZ = [0, 0], propZ = 0;
const LMK = Object.keys(LM); let deck = [], lmMarks = [], sinceLM = [0, 0];
const dealLM = () => { if (!deck.length) deck = LMK.slice().sort(() => Math.random() - .5); return deck.pop(); };
function spawnSide(i) { const s = i ? 1 : -1; let b, name = null;
  if (sinceLM[i] >= (i ? 1 : 2) && Math.random() < .75) { const k = dealLM(); b = LM[k](); name = LM_NAMES[k]; sinceLM[i] = 0; }
  else { b = (Math.random() < .6 ? HOUSES.semi : HOUSES.terrace)(); sinceLM[i]++; }
  const z = sideZ[i] - b.w / 2; b.g.position.set(s * (EDGE + .05), 0, z); b.g.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(b.g);
  world.push({ g: b.g, z1: sideZ[i] + 4, own: 1 }); if (name) lmMarks.push({ z, name, shown: false }); sideZ[i] -= b.w; }
function spawnProps() { const z = propZ;
  [-1, 1].forEach(s => { const r = Math.random(); let g;
    if (r < .5) { g = lamp.clone(); g.rotation.y = s > 0 ? 0 : Math.PI; g.position.set(s * (EDGE - .3), PAV_H, z); }
    else if (r < .75) { g = treeP.clone(); g.position.set(s * (EDGE - .55), PAV_H, z); }
    else if (r < .9) { g = planter.clone(); g.position.set(s * (EDGE - .55), PAV_H, z); g.rotation.y = Math.PI / 2; }
    else { g = bollard.clone(); g.position.set(s * (RW + KERB + .25), PAV_H, z); }
    scene.add(g); world.push({ g, z1: z + 3 }); });
  propZ -= 9 + Math.random() * 7; }

/* ================= obstacles (cartoon, Subway Surfers shapes) ================= */
const P = {};
const keepB = g => bake(g);
const stripeT = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#d6463a'; for (let i = -2; i < 10; i++) { x.beginPath(); x.moveTo(i * 64, h); x.lineTo(i * 64 + 32, h); x.lineTo(i * 64 + 32 + 50, 0); x.lineTo(i * 64 + 50, 0); x.fill(); } });
const STRIPE = T(0xffffff, { map: stripeT }), DARK = T(0x3a3e47);
// low barrier: jump it (red & white chevrons on chunky legs) — like Subway Surfers' track barrier
P.low = (() => { const g = new THREE.Group(); rbs(2.3, .5, .28, .1, STRIPE, 0, .45, 0, g); [-1, 1].forEach(s => { rbs(.22, .55, .22, .08, DARK, s * .95, 0, 0, g); rbs(.5, .12, .7, .05, DARK, s * .95, 0, 0, g); });
  sph(.12, T(0xffb23a, { emissive: 0xff8a00, emissiveIntensity: .9 }), .95, 1.08, 0, g); blobShadow(2.6, .9, g); return keepB(g); })();
// high barrier: roll under (ROAD WORKS board up on a frame)
const RWT = sign('ROAD WORKS', { bg: '#d6463a', fg: '#ffffff', w: 768, h: 192, round: 28 });
P.high = (() => { const g = new THREE.Group(); rbs(2.4, .8, .2, .12, T(0xd6463a), 0, 1.35, 0, g); board(RWT, 2.2, .6, 0, 1.75, .11, g); board(RWT, 2.2, .6, 0, 1.75, -.11, g, Math.PI);
  [-1, 1].forEach(s => { rbs(.18, 2.2, .18, .07, DARK, s * 1.15, 0, 0, g); rbs(.5, .12, .7, .05, DARK, s * 1.15, 0, 0, g); }); rbs(2.3, .14, .16, .06, STRIPE, 0, 1.1, 0, g); blobShadow(2.6, .9, g); return keepB(g); })();
// cones: three in a row (jump)
P.cones = (() => { const g = new THREE.Group(), O = T(0xee7a2f), W = T(0xf4f1ea); [-.75, 0, .75].forEach(x => { rbs(.6, .08, .6, .03, O, x, 0, 0, g); const c = new THREE.Mesh(new THREE.ConeGeometry(.24, .8, 16), O); c.position.set(x, .48, 0); g.add(c);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, .15, 16), W); b.position.set(x, .5, 0); g.add(b); }); blobShadow(2.4, .8, g); return keepB(g); })();
// wheelie bins pair (jump)
P.bins = [[0x3a3e47, 0x3a3e47], [0x2e7d55, 0x3a3e47], [0x3b5f9a, 0x3a3e47]].map(([a, b]) => { const g = new THREE.Group(); [-.45, .45].forEach((x, i) => { const c = T(i ? a : b); rbs(.68, 1.0, .75, .12, c, x, .08, 0, g); rbs(.74, .1, .82, .05, c, x, 1.08, .02, g); [-1, 1].forEach(s => { const w = cyl(.09, .09, .07, DARK, x + s * .26, .09, .32, g, 12); w.rotation.z = Math.PI / 2; }); }); blobShadow(2, 1, g); return keepB(g); });
// skip: jump on and run along the top
P.skip = (() => { const g = new THREE.Group(), Y = T(0xe8b53a); const sh = new THREE.Shape(); sh.moveTo(-1.5, 0); sh.lineTo(1.5, 0); sh.lineTo(1.95, 1.25); sh.lineTo(-1.95, 1.25); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 1.8, bevelEnabled: true, bevelSize: .08, bevelThickness: .08, bevelSegments: 2 }); geo.translate(0, 0, -.9); const m = new THREE.Mesh(geo, Y); m.rotation.y = Math.PI / 2; g.add(m);
  rbs(1.7, .25, 3.6, .12, T(0xa08f7d), 0, 1.05, 0, g); [[-.3, .5, 0xb2695a], [.4, -.8, 0x8f8a82], [0, 1.2, 0xc2a98a]].forEach(([x, z, c]) => rbs(.6, .35, .7, .12, T(c), x, 1.2, z, g)); blobShadow(2.4, 4.2, g); return keepB(g); })();
// bus shelter: dodge it (roof walkable with trainers). Advert = SMR Digital ordering app
const ADT = canvasTex(512, 900, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6d4fb0'); g.addColorStop(1, '#e0609c'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.textAlign = 'center';
  x.font = '900 74px Mont, Arial'; ['YOUR OWN', 'ORDERING', 'APP'].forEach((t, i) => x.fillText(t, w / 2, 220 + i * 90)); x.font = '700 44px Mont, Arial'; x.fillText('0% commission', w / 2, 540); x.font = '900 56px Mont, Arial'; x.fillText('SMR DIGITAL', w / 2, 780); });
P.shelter = (() => { const g = new THREE.Group(), F = T(0x3e4452), GL = new THREE.MeshBasicMaterial({ color: 0xcfe3ee, transparent: true, opacity: .28, depthWrite: false }), L = 4, H = 2.5, D = 1.4;
  rbs(D + .4, .16, L + .3, .07, F, 0, H, 0, g); [[-D / 2, -L / 2], [-D / 2, L / 2], [D / 2, -L / 2], [D / 2, L / 2]].forEach(([x, z]) => rbs(.1, H, .1, .04, F, x, 0, z, g));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(L, H - .4), GL); back.rotation.y = Math.PI / 2; back.position.set(D / 2, H / 2 + .1, 0); g.add(back);
  rbs(.14, 1.9, 1.2, .06, F, 0, .25, -L / 2 - .1, g); board(ADT, 1.05, 1.8, 0, 1.2, -L / 2 - .18, g, Math.PI); board(ADT, 1.05, 1.8, 0, 1.2, -L / 2 - .02, g); rbs(.45, .08, 2.6, .03, T(0x9aa3ae), D / 2 - .35, .55, 0, g);
  blobShadow(2.2, 4.8, g); return keepB(g); })();
// ramp up onto a parked bus / van (yellow planks + black-and-yellow edge)
const rampT = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#d9a441'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 64) { x.fillStyle = 'rgba(90,60,20,.35)'; x.fillRect(0, y, w, 6); x.fillStyle = 'rgba(255,240,200,.25)'; x.fillRect(0, y + 8, w, 6); } });
const rampG = (L, H) => { const g = new THREE.Group(), deck = new THREE.Mesh(new THREE.BoxGeometry(2.3, .16, Math.hypot(L, H)), T(0xffffff, { map: rampT })); deck.rotation.x = Math.atan2(H, L); deck.position.set(0, H / 2, 0); g.add(deck);
  [-1, 1].forEach(s => { const side = new THREE.Mesh(new THREE.BoxGeometry(.16, .3, Math.hypot(L, H)), T(0x2f3138)); side.rotation.x = deck.rotation.x; side.position.set(s * 1.15, H / 2 + .1, 0); g.add(side); });
  rbs(2.3, H, .3, .08, T(0x5a4a3a), 0, 0, -L / 2 + .15, g); blobShadow(2.6, L + .4, g); return keepB(g); };
P.ramp = { bus: rampG(5, 3.3), van: rampG(4.2, 2.45), car: rampG(3, 1.55) };

/* ================= coins (instanced £ tips) + sparkles ================= */
const MAXC = 400, coinGeo = (() => { const side = new THREE.CylinderGeometry(.38, .38, .1, 30, 1, true); side.rotateX(Math.PI / 2); const f = new THREE.CircleGeometry(.38, 30); f.translate(0, 0, .05); const b = new THREE.CircleGeometry(.38, 30); b.rotateY(Math.PI); b.translate(0, 0, -.05);
  [side, f, b].forEach(q => { for (const k of Object.keys(q.attributes)) if (!['position', 'normal', 'uv'].includes(k)) q.deleteAttribute(k); }); return mergeGeometries([side.toNonIndexed(), f.toNonIndexed(), b.toNonIndexed()], true); })();
const coinT = canvasTex(256, 256, (x, w, h) => { const g = x.createRadialGradient(100, 90, 10, 128, 128, 128); g.addColorStop(0, '#fff6b8'); g.addColorStop(.55, '#ffcf3a'); g.addColorStop(1, '#e09a10'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.lineWidth = 14; x.strokeStyle = '#e8a320'; x.beginPath(); x.arc(128, 128, 104, 0, 7); x.stroke(); x.fillStyle = '#d18810'; x.font = 'bold 160px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('£', 132, 140); x.fillStyle = '#fff2b0'; x.fillText('£', 126, 134); });
const coinMesh = new THREE.InstancedMesh(coinGeo, [U({ color: 0xf0b01c }), U({ map: coinT }), U({ map: coinT })], MAXC); coinMesh.frustumCulled = false; coinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(coinMesh);
const coins = []; const addCoin = (x, y, z) => { if (coins.length < MAXC) coins.push({ x, y, z, got: 0 }); };
const line = (x, z, n, y) => { for (let i = 0; i < n; i++) addCoin(x, y, z - i * 2.2); };
const arc = (x, z, h, y0) => { for (let i = 0; i < 7; i++) { const t = (i - 3) / 3; addCoin(x, y0 + h * (1 - t * t) + .6, z + t * 4); } };
const sparkT = canvasTex(128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 64, 2, 64, 64, 60); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(.25, 'rgba(255,240,170,.8)'); g.addColorStop(1, 'rgba(255,220,120,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.95)'; [[64, 4, 6, 120], [4, 64, 120, 6]].forEach(([a, b, c, d]) => { x.beginPath(); x.ellipse(64, 64, c / 2, d / 2, 0, 0, 7); x.fill(); }); });
const sparks = []; for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkT, transparent: true, depthWrite: false, depthTest: false })); s.visible = false; scene.add(s); sparks.push({ s, t: 0 }); }
const spark = (x, y, z, sc = 1.3) => { const p = sparks.find(q => q.t <= 0) || sparks[0]; p.t = .28; p.sc = sc; p.s.position.set(x, y, z); p.s.visible = true; };
// dust puffs on landing / lane switch
const puffT = canvasTex(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,250,240,.9)'); g.addColorStop(1, 'rgba(255,250,240,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const puffs = []; for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); puffs.push({ s, t: 0, vx: 0 }); }
const puff = (x, y, z, n = 4) => { for (let k = 0; k < n; k++) { const p = puffs.find(q => q.t <= 0); if (!p) return; p.t = .45; p.vx = (Math.random() - .5) * 3; p.s.position.set(x + (Math.random() - .5) * .5, y + .15, z + .2); p.s.visible = true; } };

/* ================= power-ups ================= */
const ICON = {}; const icon = (k, d) => { const c = document.createElement('canvas'); c.width = c.height = 160; d(c.getContext('2d')); ICON[k] = c; };
const ring = (x, col) => { x.fillStyle = col; x.beginPath(); x.arc(80, 80, 74, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = 'rgba(255,255,255,.9)'; x.stroke(); };
icon('magnet', x => { ring(x, '#d6463a'); x.lineCap = 'butt'; x.strokeStyle = '#fff'; x.lineWidth = 26; x.beginPath(); x.arc(80, 76, 30, Math.PI, 0, true); x.stroke(); x.fillStyle = '#cfd6de'; x.fillRect(37, 74, 26, 26); x.fillRect(97, 74, 26, 26); });
icon('x2', x => { ring(x, '#e8a320'); x.fillStyle = '#fff'; x.font = '900 70px Mont, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('2x', 80, 84); });
icon('shoes', x => { ring(x, '#2fa6b0'); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(36, 104); x.lineTo(38, 62); x.quadraticCurveTo(62, 56, 74, 74); x.lineTo(116, 82); x.quadraticCurveTo(130, 86, 128, 104); x.closePath(); x.fill(); x.fillStyle = '#ffd24a'; x.fillRect(36, 102, 92, 10);
  x.beginPath(); x.moveTo(50, 46); x.lineTo(60, 30); x.lineTo(70, 46); x.fill(); x.beginPath(); x.moveTo(80, 50); x.lineTo(90, 34); x.lineTo(100, 50); x.fill(); });
icon('rocket', x => { ring(x, '#3f9467'); x.fillStyle = '#fff'; rr(x, 52, 36, 56, 62, 12); x.fill(); x.fillStyle = '#2b6b49'; x.fillRect(52, 50, 56, 6); x.fillStyle = '#ffb347'; x.beginPath(); x.moveTo(62, 100); x.lineTo(80, 136); x.lineTo(98, 100); x.fill(); x.fillStyle = '#fff2b0'; x.beginPath(); x.moveTo(70, 100); x.lineTo(80, 122); x.lineTo(90, 100); x.fill(); });
icon('board', x => { ring(x, '#6d4fb0'); x.save(); x.translate(80, 84); x.rotate(-.5); x.fillStyle = '#fff'; rr(x, -56, -14, 112, 28, 14); x.fill(); x.fillStyle = '#ff6fb0'; rr(x, -46, -8, 92, 16, 8); x.fill(); x.restore(); });
icon('box', x => { ring(x, '#7a5bb5'); x.fillStyle = '#fff'; rr(x, 40, 52, 80, 66, 10); x.fill(); x.fillStyle = '#ff6fb0'; x.fillRect(73, 52, 14, 66); x.fillRect(40, 76, 80, 12); x.fillStyle = '#7a5bb5'; x.font = '900 44px Mont, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', 80, 86); });
const ICON_URL = {}; for (const k in ICON) ICON_URL[k] = ICON[k].toDataURL();
const PDEF = { magnet: { name: 'TIP MAGNET', base: 10 }, x2: { name: 'DOUBLE TIPS', base: 10 }, shoes: { name: 'SUPER TRAINERS', base: 10 }, rocket: { name: 'ROCKET BAG', base: 6.5 }, box: { name: 'MYSTERY ORDER' }, board: { name: 'HOVERBOARD' } };
const pwMat = {}; for (const k in ICON) { const t = new THREE.CanvasTexture(ICON[k]); t.colorSpace = THREE.SRGBColorSpace; pwMat[k] = U({ map: t, transparent: true, toneMapped: false }); }
const pwGlow = U({ map: sparkT, transparent: true, depthWrite: false, opacity: .7, toneMapped: false });
const pickups = []; const pickupG = k => { const g = new THREE.Group(); const disc = new THREE.Mesh(new THREE.CircleGeometry(.62, 32), pwMat[k]); g.add(disc); const back = disc.clone(); back.rotation.y = Math.PI; g.add(back);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), pwGlow); gl.position.z = -.05; g.add(gl); return g; };

/* ================= save data: tips bank, best, missions, upgrades, outfits ================= */
const SAVE = (() => { try { return JSON.parse(localStorage.getItem('rr_save')) || {}; } catch (e) { return {}; } })();
const D = Object.assign({ bank: 0, best: 0, boards: 3, mult: 1, ms: null, msDone: 0, up: { magnet: 0, x2: 0, shoes: 0, rocket: 0 }, outfit: 0, owned: [0], runs: 0, mute: 0 }, SAVE);
const save = () => { try { localStorage.setItem('rr_save', JSON.stringify(D)); } catch (e) {} };
const upT = k => PDEF[k].base * (1 + D.up[k] * .2);           // each upgrade level adds 20% time
const UPCOST = [500, 1500, 3500, 7000, 12000];
const MS_POOL = [
  { id: 'coins', txt: n => `Collect ${n} tips in one run`, n: [100, 250, 500, 900], ev: 'coin', run: 1 },
  { id: 'jump', txt: n => `Jump ${n} times`, n: [25, 50, 100, 200], ev: 'jump' },
  { id: 'roll', txt: n => `Roll ${n} times`, n: [15, 40, 80, 150], ev: 'roll' },
  { id: 'dist', txt: n => `Run ${n}m in one run`, n: [500, 1200, 2500, 4000], ev: 'dist', run: 1 },
  { id: 'score', txt: n => `Score ${n.toLocaleString()} in one run`, n: [5000, 15000, 40000, 90000], ev: 'score', run: 1 },
  { id: 'power', txt: n => `Pick up ${n} power-ups`, n: [5, 12, 25, 40], ev: 'power' },
  { id: 'bus', txt: n => `Run along ${n} bus roofs`, n: [3, 8, 15, 30], ev: 'bus' },
  { id: 'board', txt: n => `Use ${n} hoverboards`, n: [1, 3, 6, 10], ev: 'board' },
  { id: 'lm', txt: n => `Pass ${n} Luton landmarks`, n: [10, 25, 50, 90], ev: 'lm' },
  { id: 'rocket', txt: n => `Fly the Rocket Bag ${n} times`, n: [2, 5, 10, 18], ev: 'rocket' }];
function newMissions() { const lv = Math.min(3, Math.floor((D.mult - 1) / 2)); const pool = MS_POOL.slice().sort(() => Math.random() - .5).slice(0, 3); D.ms = pool.map(m => ({ id: m.id, n: m.n[lv], c: 0 })); save(); }
if (!D.ms) newMissions();
const msDef = id => MS_POOL.find(m => m.id === id);
let runMs = {};
function msEvent(ev, v = 1, abs = false) { if (!D.ms) return; for (const m of D.ms) { const d = msDef(m.id); if (d.ev !== ev || m.c >= m.n) continue;
  if (d.run) { runMs[m.id] = abs ? v : (runMs[m.id] || 0) + v; m.c = Math.max(m.c, Math.min(m.n, runMs[m.id])); } else m.c = Math.min(m.n, m.c + v);
  if (m.c >= m.n) { toast('MISSION DONE!', 'gold'); SND.power(); } }
  if (D.ms.every(m => m.c >= m.n)) { D.mult = Math.min(30, D.mult + 1); D.msDone++; toast('MULTIPLIER x' + D.mult + '!', 'gold'); newMissions(); } }

/* ================= sound ================= */
let AC = null;
const sfx = (f, d = .12, type = 'sine', vol = .15, slide = 0, delay = 0) => { if (D.mute) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); } catch (e) {} };
const SND = { coin: () => { sfx(1568, .08, 'square', .04); sfx(2093, .12, 'square', .035, 0, .05); }, jump: () => sfx(300, .2, 'triangle', .13, 380), roll: () => sfx(240, .22, 'sawtooth', .05, -140), lane: () => sfx(600, .07, 'triangle', .045, 220),
  land: () => sfx(120, .1, 'sine', .12, -40), hit: () => { sfx(110, .5, 'sawtooth', .2, -70); sfx(60, .6, 'square', .12, -20); }, bump: () => sfx(170, .22, 'square', .1, -60),
  power: () => [660, 880, 1100, 1320].forEach((f, i) => sfx(f, .14, 'triangle', .09, 0, i * .07)), end: () => sfx(700, .3, 'sine', .06, -320), boardOn: () => sfx(200, .35, 'sawtooth', .07, 600), click: () => sfx(900, .05, 'triangle', .05) };

/* ================= game state ================= */
let state = 'menu', speed = 0, score = 0, coinN = 0, runT = 0, dist = 0, lmPassed = 0;
const B = { lane: 2, prev: 2, x: LX[2], y: 0, vy: 0, z: 0, air: false, roll: 0, rollQ: false, phase: 0, lean: 0, land: 0, stumble: 0, lastStumble: -99, dead: 0, inv: 0, onTop: null };
const PW = { magnet: 0, x2: 0, shoes: 0, rocket: 0, board: 0 };
const obs = []; let genZ = -40, freeLane = 2, rowN = 0, lastPower = 0;
scene.add(rider); scene.add(shadow); setOutfit(D.outfit);

/* ================= level generator =================
   Rows every ~18-26 m. Each row blocks 1-3 lanes but always leaves one lane fully free near the last free lane.
   Road lanes: oncoming cars/vans/buses (timed to reach the row as you do), parked buses with a ramp up onto the roof.
   Pavements: bins, cones, low/high barriers, skips, bus shelters. Coins in lines, arcs over jumps, trails along roofs. */
const add = o => { o.g.position.set(o.x, o.y0 || 0, o.z); scene.add(o.g); obs.push(o); return o; };
const isPav = l => l === 0 || l === 3;
function genRow() {
  const z = genZ, nb = runT < 5 ? 1 : Math.random() < .18 ? 1 : Math.random() < .6 ? 2 : 3;
  const cand = [0, 1, 2, 3].filter(l => Math.abs(l - freeLane) <= 2), nf = cand[Math.random() * cand.length | 0];
  const lanes = [0, 1, 2, 3].filter(l => l !== nf).sort(() => Math.random() - .5).slice(0, nb), tRow = Math.max(.5, (B.z - z) / Math.max(speed, 8));
  for (const l of lanes) { const x = LX[l], y0 = baseY(x);
    if (isPav(l)) { const r = Math.random();
      if (r < .22) { add({ g: P.bins[Math.random() * 3 | 0].clone(), x, z, w: 1.9, len: .8, kind: 'low', h: 1.15, y0 }); if (Math.random() < .7) arc(x, z, 1.9, y0); }
      else if (r < .4) { add({ g: P.cones.clone(), x, z, w: 2.2, len: .6, kind: 'low', h: .9, y0 }); if (Math.random() < .6) arc(x, z, 1.7, y0); }
      else if (r < .56) { add({ g: P.low.clone(), x, z, w: 2.3, len: .35, kind: 'low', h: .95, y0 }); arc(x, z, 1.7, y0); }
      else if (r < .72) { add({ g: P.high.clone(), x, z, w: 2.3, len: .3, kind: 'high', h: 1.0, y0 }); line(x, z + 2, 3, y0 + .5); }
      else if (r < .88) { add({ g: P.skip.clone(), x, z, w: 1.9, len: 3.9, kind: 'block', top: y0 + 1.33, y0 }); line(x, z + 1.5, 3, y0 + 2.1); }
      else { const g = P.shelter.clone(); g.rotation.y = l === 0 ? Math.PI : 0; add({ g, x, z, w: 1.9, len: 4.4, kind: 'block', top: y0 + 2.66, y0 }); } }
    else { const r = Math.random();
      if (r < .1) { add({ g: P.low.clone(), x, z, w: 2.3, len: .35, kind: 'low', h: .95 }); arc(x, z, 1.7, 0); continue; }
      if (r < .17) { add({ g: P.high.clone(), x, z, w: 2.3, len: .3, kind: 'high', h: 1.0 }); continue; }
      if (r < .4) {   // parked bus (or van) with a ramp: run up and along the roof, like the trains
        const kind = Math.random() < .7 ? 'bus' : 'van', g = vehicle(kind), d = g.userData.dims; g.rotation.y = Math.PI;
        add({ g, x, z: z - d.l / 2, w: Math.min(d.w, 2.4), len: d.l, kind: 'block', top: d.top, veh: kind });
        const rl = kind === 'bus' ? 5 : 4.2; add({ g: P.ramp[kind].clone(), x, z: z + rl / 2, w: 2.3, len: rl, kind: 'ramp', top: d.top, rz0: z + rl, rz1: z });
        line(x, z + rl - .5, 3, .6); line(x, z - 1, Math.floor(d.l / 2.2), d.top + .55); continue; }
      const kind = r < .55 ? 'bus' : r < .67 ? 'van' : 'car', moving = Math.random() < .7, g = vehicle(kind), d = g.userData.dims; g.rotation.y = Math.PI;
      const v = moving ? (kind === 'bus' ? 5.5 : 6.5 + Math.random() * 3) : 0;
      add({ g, x, z: z - d.l / 2 - v * tRow, w: Math.min(d.w, 2.4), len: d.l, kind: 'block', top: d.top, v, veh: kind });
      if (kind === 'car' && !moving) line(x, z - .5, 2, d.top + .55); } }
  // coins down the free lane
  line(LX[nf], z + 3, 6 + (Math.random() * 5 | 0), baseY(LX[nf]) + .65);
  // power-ups now and then (in the free lane)
  if (++rowN - lastPower > 5 && Math.random() < .35) { lastPower = rowN; const ks = ['magnet', 'x2', 'shoes', 'rocket', 'magnet', 'box']; const k = ks[Math.random() * ks.length | 0], g = pickupG(k); const pz = z - 8;
    g.position.set(LX[nf], baseY(LX[nf]) + 1.1, pz); scene.add(g); pickups.push({ g, k, x: LX[nf], z: pz }); }
  freeLane = nf; genZ -= 14 + Math.random() * 6 + speed * .3; }

/* ================= HUD ================= */
const fmt = n => String(Math.floor(n)).padStart(6, '0');
const PIN = '<svg class="pin" viewBox="0 0 24 30"><path d="M12 1C6 1 2 5.4 2 11c0 7.5 10 18 10 18s10-10.5 10-18C22 5.4 18 1 12 1z" fill="#ff6f61" stroke="#fff" stroke-width="2"/><circle cx="12" cy="11" r="4" fill="#fff"/></svg>';
let toastT = 0; function toast(t, cls = '', pin = 0) { const e = $('toast'); e.className = 'show ' + cls; e.innerHTML = (pin ? PIN : '') + '<span></span>'; e.lastChild.textContent = t; toastT = 1.6; }
function hud() { $('sc').textContent = fmt(score); $('cn').textContent = coinN; const m = D.mult * (PW.x2 > 0 ? 2 : 1); $('mul').textContent = 'x' + m; $('mul').classList.toggle('hot', PW.x2 > 0);
  $('bct').textContent = D.boards; $('bbtn').classList.toggle('off', D.boards <= 0 || PW.board > 0);
  const ks = ['rocket', 'board', 'magnet', 'x2', 'shoes'].filter(k => PW[k] > 0), box = $('pw');
  if (box.dataset.k !== ks.join()) { box.dataset.k = ks.join(); box.innerHTML = ks.map(k => `<div class="pwr" data-k="${k}"><img src="${ICON_URL[k]}"><span><i></i></span></div>`).join(''); }
  box.querySelectorAll('.pwr').forEach(e => { const k = e.dataset.k, tot = k === 'board' ? 30 : upT(k); e.querySelector('i').style.width = Math.max(0, PW[k] / tot * 100) + '%'; }); }
function menuHud() { $('best').textContent = D.best.toLocaleString(); $('bank').textContent = D.bank.toLocaleString(); $('mMult').textContent = 'x' + D.mult;
  $('msList').innerHTML = D.ms.map(m => { const d = msDef(m.id), done = m.c >= m.n; return `<div class="ms${done ? ' done' : ''}"><b></b><span>${d.txt(m.n)}</span><em>${done ? 'DONE' : m.c + '/' + m.n}</em></div>`; }).join(''); }

/* ================= controls ================= */
function lane(d) { if (state !== 'play') return; const n = Math.max(0, Math.min(3, B.lane + d)); if (n === B.lane) { B.lean = d * .8; SND.bump(); return; } B.prev = B.lane; B.lane = n; B.lean = d; SND.lane(); if (!B.air) puff(B.x, B.y, B.z, 2); }
function jump() { if (state !== 'play' || PW.rocket > 0) return; if (!B.air) { B.vy = PW.shoes > 0 ? 17 : 12.2; B.air = true; B.roll = 0; B.onTop = null; SND.jump(); msEvent('jump'); puff(B.x, B.y, B.z, 3); } }
function roll() { if (state !== 'play' || PW.rocket > 0) return; if (B.air) { B.vy = -24; B.rollQ = true; } else if (B.roll <= 0) { B.roll = .001; SND.roll(); msEvent('roll'); } }
function useBoard() { if (state !== 'play' || D.boards <= 0 || PW.board > 0) return; D.boards--; save(); PW.board = 30; toast('HOVERBOARD!', 'gold'); SND.boardOn(); msEvent('board'); hud(); }
let tx = null, ty = null, swiped = false, lastTap = 0;
addEventListener('pointerdown', e => { if (e.target.closest('button,.scr .card,.sheet')) return; tx = e.clientX; ty = e.clientY; swiped = false; if (state === 'menu' && !e.target.closest('.scr')) { start(); tx = null; } });
addEventListener('pointermove', e => { if (tx == null || swiped || state !== 'play') return; const dx = e.clientX - tx, dy = e.clientY - ty, th = Math.min(36, innerWidth * .06);
  if (Math.abs(dx) > th || Math.abs(dy) > th) { swiped = true; if (Math.abs(dx) > Math.abs(dy)) lane(dx > 0 ? 1 : -1); else if (dy < 0) jump(); else roll(); } });
addEventListener('pointerup', () => { if (tx != null && !swiped && state === 'play') { const n = performance.now(); if (n - lastTap < 300) useBoard(); lastTap = n; } tx = null; });
addEventListener('keydown', e => { if (e.repeat) return; const k = e.code;
  if (state === 'menu' && (k === 'Space' || k === 'Enter')) { start(); return; }
  if (k === 'ArrowLeft' || k === 'KeyA') lane(-1); if (k === 'ArrowRight' || k === 'KeyD') lane(1); if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') jump(); if (k === 'ArrowDown' || k === 'KeyS') roll();
  if (k === 'KeyE' || k === 'ShiftLeft') useBoard(); if (k === 'Escape' || k === 'KeyP') pause(); });
addEventListener('touchmove', e => e.preventDefault(), { passive: false });

/* ================= run lifecycle ================= */
function clearRun() { obs.forEach(o => scene.remove(o.g)); obs.length = 0; pickups.forEach(p => scene.remove(p.g)); pickups.length = 0; coins.length = 0; }
function clearWorld() { world.forEach(w => { scene.remove(w.g); if (w.own) w.g.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); }); world.length = 0; lmMarks = []; }
function reset() { clearRun(); clearWorld(); Object.assign(B, { lane: 2, prev: 2, x: LX[2], y: 0, vy: 0, z: 0, air: false, roll: 0, rollQ: false, phase: 0, lean: 0, land: 0, stumble: 0, lastStumble: -99, dead: 0, inv: 0, onTop: null });
  for (const k in PW) PW[k] = 0; speed = 0; score = 0; coinN = 0; runT = 0; dist = 0; lmPassed = 0; genZ = -45; freeLane = 2; rowN = 0; lastPower = 0; runMs = {};
  sideZ = [10, 10]; propZ = 8; sinceLM = [1, 0]; tiles.forEach((t, k) => t.position.z = -k * TILE + TILE / 2 - 10); fill(); }
function fill() { while (sideZ[0] > B.z - 170) spawnSide(0); while (sideZ[1] > B.z - 170) spawnSide(1); while (propZ > B.z - 170) spawnProps(); if (state === 'play') while (genZ > B.z - 160) genRow(); }
function start() { if (state === 'play') return; if (state !== 'menu') reset(); state = 'play'; speed = 9; document.body.className = 'play'; $('hint').classList.add('show'); setTimeout(() => $('hint').classList.remove('show'), 3500);
  D.runs++; save(); hud(); try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); } catch (e) {} }
function pause() { if (state === 'play') { state = 'paused'; menuHud(); document.body.className = 'paused'; } else if (state === 'paused') { state = 'play'; document.body.className = 'play'; last = performance.now(); } }
function crash() { if (state !== 'play') return;
  if (PW.board > 0) { PW.board = 0; B.inv = 1.4; toast('BOARD SMASHED!', 'red'); SND.bump(); shake = .35; puff(B.x, B.y, B.z, 6); return; }
  state = 'dead'; B.dead = .001; SND.hit(); shake = .6; D.bank += coinN; const nb = score > D.best; if (nb) D.best = Math.floor(score); save();
  setTimeout(() => { $('oScore').textContent = Math.floor(score).toLocaleString(); $('oCoins').textContent = coinN; $('oBest').textContent = D.best.toLocaleString(); $('oNew').style.display = nb ? '' : 'none'; $('oBank').textContent = D.bank.toLocaleString(); menuHud(); $('oMs').innerHTML = $('msList').innerHTML; document.body.className = 'over'; SND.end(); }, 1200); }
function stumble() { if (PW.board > 0) { crash(); return; } if (runT - B.lastStumble < 4.5) { crash(); return; } B.lastStumble = runT; B.stumble = .6; shake = .25; SND.bump(); toast('WATCH IT!', 'red'); B.lane = B.prev; }
function power(k) { SND.power(); msEvent('power');
  if (k === 'box') { const r = Math.random(); if (r < .45) { const n = [100, 200, 400][Math.random() * 3 | 0]; coinN += n; msEvent('coin', n); toast('+£' + n + ' TIPS!', 'gold'); } else if (r < .75) { D.boards++; save(); toast('+1 HOVERBOARD', 'gold'); } else { const ks = ['magnet', 'x2', 'shoes', 'rocket']; power(ks[Math.random() * 4 | 0]); return; } hud(); return; }
  PW[k] = upT(k); toast(PDEF[k].name + '!', 'gold'); if (k === 'rocket') { B.air = true; B.roll = 0; B.onTop = null; msEvent('rocket'); } }

/* ================= main step ================= */
let shake = 0, last = performance.now(), fpsN = 0, fpsT = 0, hudT = 0, lastGround = 0;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
function step(dt) {
  const t = performance.now() / 1000;
  if (state === 'play') { runT += dt; speed = Math.min(26, 13 + runT * .07); }
  const v = state === 'play' ? speed : state === 'dead' ? Math.max(0, speed * (1 - B.dead * 5)) : 0;
  B.z -= v * dt; dist += v * dt; const mult = D.mult * (PW.x2 > 0 ? 2 : 1);
  if (state === 'play') { score += v * dt * mult * .6; if ((dist | 0) % 50 === 0) msEvent('dist', dist | 0, true); }
  for (const k in PW) if (PW[k] > 0) { PW[k] -= dt; if (PW[k] <= 0) { PW[k] = 0; if (k === 'rocket') { B.inv = 1.2; B.air = true; } } }
  if (B.inv > 0) B.inv -= dt; if (B.stumble > 0) B.stumble -= dt; if (B.land > 0) B.land = Math.max(0, B.land - dt * 5);
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').className = ''; }
  // sideways slide
  const px = B.x; B.x += (LX[B.lane] - B.x) * Math.min(1, dt * 16); B.lean += (0 - B.lean) * Math.min(1, dt * 8);
  // moving traffic
  if (state !== 'dead') for (const o of obs) if (o.v) { o.z += o.v * dt; o.g.position.z = o.z; }
  // ground under the rider: pavement / road, roofs and ramps
  let ground = baseY(B.x), top = null; const zr = .3;
  for (const o of obs) { if (!o.top) continue; if (Math.abs(B.x - o.x) > o.w / 2 + .15 || B.z - zr > o.z + o.len / 2 || B.z + zr < o.z - o.len / 2) continue;
    let h = o.top; if (o.kind === 'ramp') { const f = Math.max(0, Math.min(1, (o.rz0 - B.z) / (o.rz0 - o.rz1))); h = f * o.top; if (B.y < h - .6) continue; } else if (B.y < o.top - .45) continue;
    if (h > ground) { ground = h; top = o; } }
  if (PW.rocket > 0) { B.y += (8 - B.y) * Math.min(1, dt * 2.6); B.vy = 0; B.air = true; }
  else { const g = PW.shoes > 0 ? 30 : 36; B.vy -= g * dt; B.y += B.vy * dt;
    if (B.y <= ground) { const was = B.air && B.vy < -4; B.y = ground; B.vy = 0; if (B.air) { B.air = false; if (was) { B.land = 1; SND.land(); puff(B.x, B.y, B.z, 4); } if (B.rollQ) { B.rollQ = false; B.roll = .001; SND.roll(); msEvent('roll'); } } }
    else if (B.y > ground + .08 && !(top && top.kind === 'ramp')) B.air = true;
    if (top && top.kind === 'ramp' && !B.air) B.y = ground; }
  if (top && top.veh === 'bus' && B.onTop !== top && !B.air) { B.onTop = top; msEvent('bus'); }
  if (B.roll > 0) { B.roll += dt / .65; if (B.roll >= 1) B.roll = 0; }
  // collisions
  if (state === 'play') for (const o of obs) {
    const xo = Math.abs(B.x - o.x) < o.w / 2 + .25, zo = B.z - zr < o.z + o.len / 2 && B.z + zr > o.z - o.len / 2;
    if (xo && zo && !(PW.rocket > 0) && B.inv <= 0 && o.kind !== 'ramp') { let ok = false;
      if (o.top && B.y >= o.top - .5) ok = true; else if (o.kind === 'low' && B.y - (o.y0 || 0) >= o.h - .2) ok = true; else if (o.kind === 'high' && B.roll > 0) ok = true;
      if (!ok) { if (!o.pzo && o.pxo !== false) crash(); else if (!o.hit) { o.hit = 1; stumble(); } } }
    o.pzo = zo; o.pxo = xo; }
  // coins, magnet, sparkles
  const mag = PW.magnet > 0 || PW.rocket > 0;
  for (const c of coins) { if (c.got) continue; const dz = c.z - B.z;
    if (mag && dz < 2 && dz > -16 && (PW.magnet > 0 || Math.abs(c.x - B.x) < 2.6)) { const k = Math.min(1, dt * 10); c.x += (B.x - c.x) * k; c.y += (B.y + 1 - c.y) * k; c.z += (B.z - c.z) * Math.min(1, dt * 8); }
    if (Math.abs(c.x - B.x) < .8 && Math.abs(c.z - B.z) < .9 && c.y > B.y - .4 && c.y < B.y + (B.roll > 0 ? 1.1 : 1.9)) { c.got = 1; coinN++; score += 10 * mult; SND.coin(); spark(c.x, c.y, c.z, 1.1); msEvent('coin'); } }
  for (let i = pickups.length - 1; i >= 0; i--) { const p = pickups[i]; p.g.rotation.y = t * 2.6; p.g.position.y = baseY(p.x) + 1.15 + Math.sin(t * 3.4) * .15;
    if (state === 'play' && Math.abs(p.x - B.x) < 1.1 && Math.abs(p.z - B.z) < 1.1 && B.y < p.g.position.y + .9) { scene.remove(p.g); pickups.splice(i, 1); spark(p.x, p.g.position.y, p.z, 3); power(p.k); } else if (p.z > B.z + 12) { scene.remove(p.g); pickups.splice(i, 1); } }
  if (PW.rocket > 0 && Math.random() < dt * 5) line(LX[Math.random() * 4 | 0], B.z - 45, 5, 8.5);
  for (const m of lmMarks) if (!m.shown && B.z < m.z + 10) { m.shown = true; if (state === 'play') { toast(m.name, 'lm', 1); msEvent('lm'); } }
  // keep the street coming
  fill();
  for (let i = world.length - 1; i >= 0; i--) if (world[i].z1 > B.z + 26) { const w = world[i]; scene.remove(w.g); if (w.own) w.g.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); world.splice(i, 1); }
  for (let i = obs.length - 1; i >= 0; i--) { const o = obs[i]; if (o.z - o.len / 2 > B.z + 14) { scene.remove(o.g); obs.splice(i, 1); } }
  for (let i = coins.length - 1; i >= 0; i--) if (coins[i].got || coins[i].z > B.z + 8) coins.splice(i, 1);
  tiles.forEach(tl => { if (tl.position.z - TILE / 2 > B.z + 20) tl.position.z -= TILE * tiles.length; });
  clouds.forEach(c => { if (c.position.z > B.z - 40) c.position.z -= 200; });
  // coin instances
  const spin = t * 3.4; let n = 0;
  for (const c of coins) { if (c.z < B.z - 160) continue; _e.set(0, spin, 0); _q.setFromEuler(_e); _p.set(c.x, c.y, c.z); _m.compose(_p, _q, _s); coinMesh.setMatrixAt(n++, _m); if (n >= MAXC) break; }
  coinMesh.count = n; coinMesh.instanceMatrix.needsUpdate = true;
  for (const p of sparks) if (p.t > 0) { p.t -= dt; const k = 1 - p.t / .28; p.s.scale.setScalar(p.sc * (.4 + k * 1.2)); p.s.material.opacity = 1 - k; p.s.material.rotation = k * 2; if (p.t <= 0) p.s.visible = false; }
  for (const p of puffs) if (p.t > 0) { p.t -= dt; const k = 1 - p.t / .45; p.s.position.x += p.vx * dt; p.s.position.y += dt * .8; p.s.position.z += v * dt * .2; p.s.scale.setScalar(.4 + k * 1.1); p.s.material.opacity = (1 - k) * .8; if (p.t <= 0) p.s.visible = false; }
  // rider
  if (state === 'play' || state === 'dead') B.phase += dt * (8 + speed * .38);
  if (state === 'dead') B.dead += dt;
  const mode = state === 'menu' ? 'idle' : state === 'dead' ? 'dead' : PW.rocket > 0 ? 'fly' : B.roll > 0 ? 'roll' : B.air ? 'air' : PW.board > 0 ? 'board' : 'run';
  animRider({ t, phase: B.phase, mode: PW.board > 0 && B.air && mode === 'air' ? 'board' : mode, vy: B.vy, roll: B.roll, lean: B.lean + (B.x - px) / Math.max(dt, .001) * .022, land: B.land, stumble: B.stumble, dead: B.dead });
  rider.position.set(B.x, B.y + (PW.board > 0 && state === 'play' ? .22 : 0), B.z); rider.visible = !(B.inv > 0 && B.inv < 50 && Math.sin(t * 40) > .4 && state === 'play');
  shadow.position.set(B.x, ground + .02, B.z); const hs = Math.max(.35, 1 - (B.y - ground) * .16); shadow.scale.set(hs * .9, 1, hs * .9);
  // camera: Subway Surfers framing — high, behind, looking down the lanes; follows lane and height softly
  const camH = PW.rocket > 0 ? 8 : Math.max(0, ground * .85 + Math.max(0, B.y - ground - 1.2) * .5);
  lastGround += (camH - lastGround) * Math.min(1, dt * 4);
  camPos.set(B.x * .72, lastGround + 5.4, B.z + 6.6); camera.position.lerp(camPos, Math.min(1, dt * (state === 'menu' ? 3 : 9)));
  if (shake > 0) { shake -= dt; camera.position.x += (Math.random() - .5) * shake * .5; camera.position.y += (Math.random() - .5) * shake * .5; }
  camLook.set(B.x * .74, lastGround - .4, B.z - 9); camera.lookAt(camLook);
  BEND.z.value = camera.position.z - 6; BEND.kx.value = Math.sin(B.z * .004) * .0009;
  sun.position.set(B.x - 6, 14, B.z + 6); sun.target.position.set(B.x, 0, B.z - 8); sky.position.set(camera.position.x, 0, camera.position.z);
  hudT -= dt; if (hudT <= 0 && state === 'play') { hudT = .08; hud(); }
}
function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (state !== 'paused') step(dt); renderer.render(scene, camera);
  fpsN++; fpsT += dt; if (fpsT > 1) { $('fps').textContent = Math.round(fpsN / fpsT) + ' fps'; fpsN = 0; fpsT = 0; } requestAnimationFrame(loop); }
const fit = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < .75 ? 64 : 52; camera.updateProjectionMatrix(); }; fit(); addEventListener('resize', fit);

/* ================= menus: shop, missions, outfits ================= */
function shopHtml() {
  const up = ['magnet', 'x2', 'shoes', 'rocket'].map(k => { const lv = D.up[k], cost = UPCOST[lv]; return `<div class="item"><img src="${ICON_URL[k]}"><div><b>${PDEF[k].name}</b><small>${upT(k).toFixed(1)}s · level ${lv}/5</small><div class="lv">${[0, 1, 2, 3, 4].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div></div>${lv < 5 ? `<button class="buy" data-up="${k}">£${cost.toLocaleString()}</button>` : '<button class="buy max">MAX</button>'}</div>`; }).join('');
  const items = `<div class="item"><img src="${ICON_URL.board}"><div><b>HOVERBOARD</b><small>Double tap to ride · saves you once · you have ${D.boards}</small></div><button class="buy" data-buy="board">£300</button></div>
    <div class="item"><img src="${ICON_URL.box}"><div><b>MYSTERY ORDER</b><small>Tips, boards or a power-up</small></div><button class="buy" data-buy="box">£500</button></div>`;
  const outs = OUTFITS.map((o, i) => { const own = D.owned.includes(i); return `<div class="item"><span class="sw" style="background:#${o.c[0].toString(16).padStart(6, '0')}"><i style="background:#${o.c[4].toString(16).padStart(6, '0')}"></i></span><div><b>${o.name}</b><small>${own ? (D.outfit === i ? 'Wearing' : 'Owned') : 'Outfit'}</small></div>${own ? (D.outfit === i ? '<button class="buy max">ON</button>' : `<button class="buy" data-wear="${i}">WEAR</button>`) : `<button class="buy" data-out="${i}">£${o.cost.toLocaleString()}</button>`}</div>`; }).join('');
  $('shopBody').innerHTML = `<h3>Upgrades</h3>${up}<h3>Items</h3>${items}<h3>Outfits</h3>${outs}`; $('shopBank').textContent = D.bank.toLocaleString(); }
$('shopBody').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; SND.click();
  const spend = c => { if (D.bank < c) { toast('NOT ENOUGH TIPS', 'red'); return false; } D.bank -= c; return true; };
  if (b.dataset.up) { const k = b.dataset.up; if (D.up[k] < 5 && spend(UPCOST[D.up[k]])) D.up[k]++; }
  if (b.dataset.buy === 'board' && spend(300)) D.boards++;
  if (b.dataset.buy === 'box' && spend(500)) { const r = Math.random(); if (r < .5) { const n = [300, 700, 1500][Math.random() * 3 | 0]; D.bank += n; toast('+£' + n, 'gold'); } else { const n = 1 + (Math.random() * 3 | 0); D.boards += n; toast('+' + n + ' HOVERBOARDS', 'gold'); } }
  if (b.dataset.out) { const i = +b.dataset.out; if (spend(OUTFITS[i].cost)) { D.owned.push(i); D.outfit = i; setOutfit(i); } }
  if (b.dataset.wear) { D.outfit = +b.dataset.wear; setOutfit(D.outfit); }
  save(); shopHtml(); menuHud(); });
const openSheet = id => { $(id).classList.add('open'); }, closeSheet = id => { $(id).classList.remove('open'); };
$('shopBtn').onclick = e => { e.stopPropagation(); SND.click(); shopHtml(); openSheet('shop'); }; $('shopX').onclick = e => { e.stopPropagation(); closeSheet('shop'); };
$('play').onclick = e => { e.stopPropagation(); start(); }; $('again').onclick = e => { e.stopPropagation(); start(); };
$('home').onclick = e => { e.stopPropagation(); reset(); state = 'menu'; document.body.className = 'menu'; menuHud(); };
$('pauseBtn').onclick = e => { e.stopPropagation(); pause(); }; $('resume').onclick = e => { e.stopPropagation(); pause(); }; $('quit').onclick = e => { e.stopPropagation(); state = 'dead'; B.dead = 2; D.bank += coinN; save(); reset(); state = 'menu'; document.body.className = 'menu'; menuHud(); };
$('bbtn').onclick = e => { e.stopPropagation(); useBoard(); };
const SPK = '<svg viewBox="0 0 24 24"><path d="M3 9h4l5-4v14l-5-4H3z" fill="#fff"/>', setMute = () => { $('mute').innerHTML = SPK + (D.mute ? '<path d="M16 9l6 6M22 9l-6 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>' : '<path d="M15.5 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>'); }; setMute(); $('mute').onclick = e => { e.stopPropagation(); D.mute = D.mute ? 0 : 1; save(); setMute(); };
$('lo').textContent = 'Low detail: ' + (LOW ? 'ON' : 'OFF'); $('lo').onclick = e => { e.stopPropagation(); localStorage.setItem('rr_low', LOW ? '0' : '1'); location.reload(); };
$('bImg').src = ICON_URL.board; if (!matchMedia('(pointer:coarse)').matches) $('hint').firstElementChild.innerHTML = 'ARROW KEYS to move, jump and roll<br>E hoverboard · P pause';
if (qs.has('rich')) { D.bank = 99999; save(); }
reset(); menuHud(); camera.position.set(B.x * .72, 5.4, B.z + 6.6); document.body.className = 'menu';
window.__rr = { start, B, PW, obs, coins, D, get state() { return state; }, power, lane, jump, roll, useBoard, step: (ms, n = 1) => { for (let i = 0; i < n; i++) step(ms / 1000); renderer.render(scene, camera); }, god: () => { B.inv = 1e9; }, scene, camera, renderer, BEND, coins, view: (px, py, pz, lx, ly, lz) => { camera.position.set(B.x + px, B.y + py, B.z + pz); camera.lookAt(B.x + lx, B.y + ly, B.z + lz); renderer.render(scene, camera); } };
$('load').remove();
if (!qs.has('manual')) requestAnimationFrame(loop); else { step(.016); renderer.render(scene, camera); }
