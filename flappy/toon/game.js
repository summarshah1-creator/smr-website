/* toon/game.js — GAME: Kabootar Rush: Luton. 3 lanes down Leagrave Road and past Luton's landmarks; swipe to change lane,
   up to flap over roadworks, down to swoop under bus gates; land on bus roofs; collect golden seeds. */
import { THREE, scene, camera, renderer, sun, LOW, qs, bake, drop, M, BASIC, P, canvasTex, signTex, rr, FONT } from './core.js';
import { LANES, tiles, TILE, clouds, spawnProps, resetStreet, getPropZ, BUILD, ROADW, GLASS, WHITE, DARK, setCarMaker } from './street.js';
import { LM, planeG } from './landmarks.js';
import { pig, animPig, blob } from './pigeon.js';
import { vehicle, pickVehicle } from './vehicles.js';
setCarMaker(() => vehicle(pickVehicle(true)));
try { await Promise.race([document.fonts.load('60px "Lilita One"'), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
const $ = id => document.getElementById(id), RND = Math.random, pick = a => a[(RND() * a.length) | 0];
const CRUISE = 1.35, DUCK = .5, G = 32, JUMPV = 11.6, BUSH = 3.3;

// ---------- route: what lines each side of the road (@ = landmark) ----------
const ROUTE = [
  ['welcome', 'semi', 'semi', 'tudor', 'semi', '@townhall', 'terrace', 'semi', 'tudor', '@masjid', 'parade', 'semi', 'semi', '@hatfactory', 'terrace', 'terrace', '@marshfarm', 'semi', 'tudor', '@smr', 'parade', 'semi'],
  ['carlot', 'semi', 'parade', 'semi', '@galaxy', 'terrace', 'semi', 'carlot', '@kenilworth', 'parade', 'semi', 'tudor', '@airport', 'terrace', 'semi', 'parade', 'semi', 'carlot', 'semi', 'terrace']];
let sideZ = [8, 8], routeI = [0, 0]; const live = [], ticks = [], marks = [];
function placeSide(i) { const s = i ? 1 : -1, key = ROUTE[i][routeI[i]++ % ROUTE[i].length], lm = key[0] === '@', b = lm ? LM[key.slice(1)]() : BUILD[key]();
  const box = new THREE.Box3().setFromObject(b.g), front = box.max.z, z = sideZ[i] - b.w / 2, X = s * (ROADW / 2 + 4.1 + front);
  b.g.position.set(X, .24 * (lm ? 0 : 1), z); b.g.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; const baked = bake(b.g); scene.add(baked); live.push({ g: baked, z1: sideZ[i] + 4 });
  if (b.dyn) { b.dyn.position.copy(b.g.position); b.dyn.rotation.copy(b.g.rotation); scene.add(b.dyn); live.push({ g: b.dyn, z1: sideZ[i] + 4, tick: b.tick }); }
  if (b.name) marks.push({ z, name: b.name, done: false });
  sideZ[i] -= b.w + .6; }

// ---------- obstacles (one model each, cloned) ----------
const stripe = (a, b, n = 8) => canvasTex(256, 64, (x, w, h) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo((i + 1) * w / n + h * .6, 0); x.lineTo((i + 1) * w / n, h); x.lineTo(i * w / n - h * .6, h); x.fill(); } });
const LAMP = M(0xffb020, { emissive: 0xff8a00, emissiveIntensity: 1 });
const OB = {};
OB.low = (() => { const g = new THREE.Group(), p = P(g), sm = M(0xffffff, { map: stripe('#e8302a', '#ffffff'), roughness: .4 }), leg = M(0x2b2f36, { roughness: .5 });
  p.box(2.7, .42, .22, sm, 0, 1.0, 0, .1); p.box(2.7, .3, .2, sm, 0, .45, 0, .1); [-1.15, 1.15].forEach(x => { p.box(.16, 1.2, .16, leg, x, .6, 0, .05); p.box(.5, .12, .9, leg, x, .06, 0, .05); }); p.sph(.17, LAMP, 1.15, 1.35, 0, [1, 1.1, 1], 14); p.cyl(.09, .09, .1, leg, 1.15, 1.2, 0, 10);
  return g; })();
OB.bar = (() => { const g = new THREE.Group(), p = P(g), sm = M(0xffffff, { map: stripe('#ffcf1a', '#22252b', 10), roughness: .4 }), post = M(0x3a3f47, { roughness: .4, metalness: .3 });
  [-1.45, 1.45].forEach(x => p.box(.24, 4.2, .24, post, x, 2.1, 0, .08)); p.box(3.1, .65, .3, sm, 0, 1.4, 0, .14); p.sign(signTex('BUS GATE', { bg: '#1f5fbf', size: .55, sub: 'NO ENTRY', h: 300 }), 2.6, 1.3, 0, 3.2, .18); return g; })();
// golden seeds: one instanced mesh
const SEEDMAX = 420, seedGeo = new THREE.SphereGeometry(.2, 16, 12); seedGeo.scale(.8, 1.35, .55);
const seedMesh = new THREE.InstancedMesh(seedGeo, M(0xffc83a, { metalness: .65, roughness: .22, emissive: 0xc07a00, emissiveIntensity: .45 }), SEEDMAX); seedMesh.castShadow = false; seedMesh.frustumCulled = false; scene.add(seedMesh);
const seeds = []; const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

// ---------- state ----------
const B = { lane: 1, x: 0, y: CRUISE, vy: 0, z: 0, air: false, duckT: 0, speed: 15, base: 0, dead: false, stumbleT: 0, lastStumble: -9 };
let state = 'menu', score = 0, seedsN = 0, best = 0, rowZ = -60, obs = [], t0 = 0, shake = 0, planeT = 6, planes = [];
try { best = +(localStorage.getItem('kr_best') || 0); } catch (e) { }
const OBW = { low: 1.3, bar: .5 };
function addObstacle(kind, lane, z, moving) { let g, len, h = 0;
  if (kind === 'veh') { const vk = pickVehicle(moving && RND() < .5); g = vehicle(vk); len = g.userData.len; h = g.userData.h; if (!moving) g.rotation.y = Math.PI; g.position.set(LANES[lane], .02, z); }
  else { g = OB[kind].clone(); len = OBW[kind]; g.position.set(LANES[lane], 0, z); }
  scene.add(g); const o = { kind, lane, z, len, h, g, v: moving ? 9 + RND() * 3 : 0 }; obs.push(o); return o; }
function seedLine(lane, z0, n, yf) { for (let i = 0; i < n; i++) { const z = z0 - i * 2.4; seeds.push({ x: LANES[lane], y: yf ? yf(i) : CRUISE + .1, z, alive: true }); } }
function spawnRow() { const z = rowZ; let L = [0, 1, 2].map(() => { const r = RND(); return r < .24 ? null : r < .42 ? 'low' : r < .55 ? 'bar' : r < .85 ? 'veh' : 'vehM'; });
  if (L.every(k => k === 'veh' || k === 'vehM')) L[(RND() * 3) | 0] = null; if (!L.includes(null) && RND() < .5) L[(RND() * 3) | 0] = null;
  const made = L.map((k, lane) => !k ? null : k === 'vehM' ? addObstacle('veh', lane, z - 70, true) : addObstacle(k, lane, z, false));
  const free = [0, 1, 2].filter(l => !L[l]), sl = free.length ? pick(free) : (RND() * 3) | 0, k = L[sl];
  if (!k) seedLine(sl, z + 10, 9); else if (k === 'low') seedLine(sl, z + 7, 7, i => CRUISE + .1 + Math.sin(i / 6 * Math.PI) * 2.2); else if (k === 'veh') { const o = made[sl]; seedLine(sl, z + o.len / 2 - .5, Math.max(2, Math.floor(o.len / 2.4)), () => o.h + CRUISE * .7); }
  rowZ -= 30 + Math.min(14, B.speed * .4); }

// ---------- HUD + controls ----------
function setHUD() { $('sc').textContent = String(Math.floor(score)).padStart(5, '0'); $('sd').textContent = seedsN; }
function reset() { [...live].forEach(o => drop(o.g)); live.length = 0; obs.forEach(o => scene.remove(o.g)); obs = []; seeds.length = 0; marks.length = 0; planes.forEach(p => scene.remove(p.g)); planes = [];
  sideZ = [8, 8]; routeI = [0, 0]; rowZ = -70; resetStreet(); Object.assign(B, { lane: 1, x: 0, y: CRUISE, vy: 0, z: 0, air: false, duckT: 0, speed: 15, base: 0, dead: false, stumbleT: 0, lastStumble: -9 });
  score = 0; seedsN = 0; setHUD(); tiles.forEach((t, i) => t.position.z = -i * TILE + TILE / 2 - 20); fill(); }
function start() { if (state === 'play') return; if (state === 'dead') reset(); state = 'play'; t0 = performance.now(); $('start').classList.add('hide'); $('over').classList.add('hide'); $('hud').classList.remove('hide'); }
function laneTo(d) { if (state !== 'play') return; const nl = Math.max(0, Math.min(2, B.lane + d)); if (nl === B.lane) { stumble(); return; }
  if (obs.some(o => o.lane === nl && B.z > o.z - o.len / 2 - .2 && B.z < o.z + o.len / 2 + .6 && (o.kind !== 'veh' || B.y - .35 < o.h) && (o.kind !== 'low' || B.y - .35 < 1.45) && (o.kind !== 'bar' || B.y + .35 > 1.05))) { stumble(); return; }
  B.lane = nl; }
function jump() { if (state !== 'play') return; if (!B.air) { B.air = true; B.vy = JUMPV; B.duckT = 0; } }
function duck() { if (state !== 'play') return; B.duckT = .7; if (B.air) B.vy = Math.min(B.vy, -18); }
function stumble() { shake = .35; const now = performance.now() / 1000; if (now - B.lastStumble < 5) { B.lastStumble = now; return; } B.lastStumble = now; flash('#ff3b30'); }
function flash(c) { const f = $('flash'); f.style.background = c; f.style.opacity = .35; setTimeout(() => f.style.opacity = 0, 120); }
function crash() { if (B.dead) return; B.dead = true; state = 'dead'; shake = .7; flash('#ffffff'); B.vy = 7; if (score > best) { best = Math.floor(score); try { localStorage.setItem('kr_best', best); } catch (e) { } }
  setTimeout(() => { $('ovs').innerHTML = `<b>${Math.floor(score)}</b><span>score</span>`; $('ovd').innerHTML = `<b>${seedsN}</b><span>seeds</span>`; $('ovb').textContent = 'Best ' + best; $('over').classList.remove('hide'); $('hud').classList.add('hide'); }, 900); }
let sx = null, sy = null, fired = false;
addEventListener('pointerdown', e => { if (e.target.closest('button')) return; sx = e.clientX; sy = e.clientY; fired = false; });
addEventListener('pointermove', e => { if (sx == null || fired) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) < 28) return; fired = true; if (Math.abs(dx) > Math.abs(dy)) laneTo(dx > 0 ? 1 : -1); else if (dy < 0) jump(); else duck(); });
addEventListener('pointerup', () => { sx = null; });
addEventListener('keydown', e => { const k = e.code; if (k === 'ArrowLeft' || k === 'KeyA') laneTo(-1); if (k === 'ArrowRight' || k === 'KeyD') laneTo(1); if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') { if (state !== 'play') start(); else jump(); } if (k === 'ArrowDown' || k === 'KeyS') duck(); });
$('go').onclick = start; $('again').onclick = start; $('pause').onclick = () => { if (state === 'play') { state = 'paused'; $('pz').classList.remove('hide'); } }; $('resume').onclick = () => { $('pz').classList.add('hide'); state = 'play'; };
$('lo').textContent = 'Low detail: ' + (LOW ? 'ON' : 'OFF'); $('lo').onclick = () => { try { localStorage.setItem('kr_low', LOW ? '0' : '1'); } catch (e) { } location.reload(); };

// ---------- world upkeep ----------
const pushLive = (g, z1) => { scene.add(g); live.push({ g, z1: z1 + 6 }); };
function fill() { while (sideZ[0] > B.z - 240) placeSide(0); while (sideZ[1] > B.z - 240) placeSide(1); while (getPropZ() > B.z - 220) spawnProps(pushLive); if (state !== 'menu') while (rowZ > B.z - 200) spawnRow(); }
let markT = 0;
function step(dt) { const t = performance.now() / 1000;
  if (state === 'paused') return;
  if (state === 'play') { B.speed = Math.min(30, B.speed + dt * .22); score += B.speed * dt * .5; B.z -= B.speed * dt; }
  else if (state === 'menu') B.z -= 9 * dt; else if (state === 'dead') B.z -= Math.max(0, 6 - (performance.now() - t0) * 0) * dt * 0;
  // roofs under the pigeon
  B.base = 0; for (const o of obs) if (o.kind === 'veh' && o.lane === B.lane && Math.abs(B.x - LANES[o.lane]) < 1.2 && B.z > o.z - o.len / 2 - .3 && B.z < o.z + o.len / 2 + .3 && B.y - .35 >= o.h - .25) B.base = o.h;
  const cruise = B.base + (B.duckT > 0 ? DUCK : (B.base ? CRUISE * .7 : CRUISE)); B.duckT = Math.max(0, B.duckT - dt);
  if (B.dead) { B.vy -= G * dt; B.y = Math.max(.4, B.y + B.vy * dt); }
  else if (B.air) { B.vy -= G * dt; B.y += B.vy * dt; if (B.y <= cruise && B.vy < 0) { B.y = cruise; B.air = false; B.vy = 0; } }
  else { if (B.y > cruise + .6) { B.air = true; B.vy = 0; } else B.y += (cruise - B.y) * Math.min(1, dt * 12); }
  B.x += (LANES[B.lane] - B.x) * Math.min(1, dt * 13);
  // obstacles: move, collide, recycle
  for (let i = obs.length - 1; i >= 0; i--) { const o = obs[i]; if (o.v && state === 'play') { o.z += o.v * dt; o.g.position.z = o.z; }
    if (o.z - o.len / 2 > B.z + 20) { scene.remove(o.g); obs.splice(i, 1); continue; }
    if (state !== 'play' || Math.abs(B.x - LANES[o.lane]) > 1.1) continue; const z0 = o.z - o.len / 2, z1 = o.z + o.len / 2; if (B.z - .5 > z1 || B.z + .5 < z0) continue;
    const bot = B.y - .35, top = B.y + .35; let hit = false;
    if (o.kind === 'low') hit = bot < 1.45; else if (o.kind === 'bar') hit = top > 1.05; else if (o.kind === 'veh') hit = bot < o.h - .3 && B.base !== o.h;
    if (hit) { if (Math.abs(B.x - LANES[o.lane]) > .6) { B.lane = B.x < LANES[o.lane] ? Math.max(0, o.lane - 1) : Math.min(2, o.lane + 1); stumble(); } else crash(); } }
  LAMP.emissiveIntensity = .6 + Math.max(0, Math.sin(t * 7)) * 1.6;
  // seeds
  let n = 0; for (let i = seeds.length - 1; i >= 0; i--) { const s = seeds[i]; if (s.z > B.z + 12) { seeds.splice(i, 1); continue; } if (!s.alive) continue;
    if (state === 'play' && Math.abs(s.z - B.z) < 1 && Math.abs(s.x - B.x) < 1.2 && Math.abs(s.y - B.y) < 1.3) { s.alive = false; seedsN++; score += 10; continue; }
    if (s.z < B.z - 150 || n >= SEEDMAX) continue; _e.set(0, t * 3 + s.z * .3, 0); _q.setFromEuler(_e); _v.set(s.x, s.y + Math.sin(t * 4 + s.z) * .08, s.z); _m.compose(_v, _q, _s); seedMesh.setMatrixAt(n++, _m); }
  seedMesh.count = n; seedMesh.instanceMatrix.needsUpdate = true;
  fill();
  for (let i = live.length - 1; i >= 0; i--) { const o = live[i]; if (o.tick) o.tick(t); if (o.z1 > B.z + 40) { drop(o.g); live.splice(i, 1); } }
  tiles.forEach(tl => { if (tl.position.z - TILE / 2 > B.z + 30) tl.position.z -= TILE * 2; });
  clouds.forEach(c => { c.position.z += dt * 1.5; if (c.position.z > B.z + 80) c.position.z -= 420; });
  // planes taking off over the town now and then
  planeT -= dt; if (planeT < 0) { planeT = 18 + RND() * 20; const g = planeG(pick([0x7a3fd1, 0xff6a1a, 0x1f6fd0])); const dir = RND() < .5 ? -1 : 1; g.position.set(-dir * 140, 38 + RND() * 14, B.z - 150 - RND() * 60); g.rotation.set(-.12, dir * Math.PI / 2, 0); g.scale.setScalar(1.3); scene.add(g); planes.push({ g, dir }); }
  for (let i = planes.length - 1; i >= 0; i--) { const p = planes[i]; p.g.position.x += p.dir * 42 * dt; p.g.position.y += 4 * dt; p.g.position.z -= B.speed * 0 * dt; if (Math.abs(p.g.position.x) > 160) { scene.remove(p.g); planes.splice(i, 1); } }
  // landmark name pill
  for (const m of marks) if (!m.done && B.z < m.z + 6) { m.done = true; if (state === 'play') { $('lm').textContent = m.name; $('lm').classList.add('show'); markT = 2.6; } }
  markT -= dt; if (markT < 0) $('lm').classList.remove('show');
  // pigeon
  const bank = (B.x - LANES[B.lane]) * .28; animPig(dt, { flapRate: B.air ? (B.vy > 0 ? 26 : 9) : B.duckT > 0 ? 5 : 15, bank: B.dead ? t * 8 : bank, pitch: B.dead ? -1.2 : B.air ? Math.max(-.5, Math.min(.45, B.vy * .04)) : B.duckT > 0 ? -.25 : -.08 });
  pig.position.set(B.x, B.y, B.z); if (B.dead) pig.position.z = B.z + Math.min(1.5, (performance.now() - t0) * 0);
  blob.position.set(B.x, B.base + .26, B.z); const hb = 1 / (1 + (B.y - B.base) * .35); blob.scale.setScalar(hb); blob.material.opacity = hb;
  // camera: close behind and above, a little lag; shake on stumbles
  shake = Math.max(0, shake - dt); const sk = shake * shake * 1.2;
  const cx = B.x * .78 + (RND() - .5) * sk, cy = 4.9 + B.y * .42 + (RND() - .5) * sk, cz = B.z + 8.4;
  camera.position.x += (cx - camera.position.x) * Math.min(1, dt * 9); camera.position.y += (cy - camera.position.y) * Math.min(1, dt * 6); camera.position.z = cz; camera.lookAt(B.x * .62, 1.2 + B.y * .5, B.z - 9);
  sun.position.set(B.x - 26, 42, B.z + 16); sun.target.position.set(B.x, 0, B.z - 8); scene.getObjectByName('sky').position.set(0, 0, B.z); scene.getObjectByName('ground').position.set(0, -.02, B.z - 250);
  if (state === 'play') setHUD(); }
let last = performance.now(), fpsN = 0, fpsT = 0;
function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); renderer.render(scene, camera); fpsN++; fpsT += dt; if (fpsT > 1) { $('fps').textContent = Math.round(fpsN / fpsT) + ' fps'; fpsN = 0; fpsT = 0; } requestAnimationFrame(loop); }
window.__kr = { B, start, laneTo, jump, duck, get state() { return state; }, obs, seeds };
window.__step = (ms, n = 1) => { for (let i = 0; i < n; i++) step(ms / 1000); renderer.render(scene, camera); };
reset(); camera.position.set(0, 5.5, 8.4); $('loading').classList.add('hide'); $('start').classList.remove('hide');
if (!qs.has('manual')) requestAnimationFrame(loop); else __step(16, 2);
