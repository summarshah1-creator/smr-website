import * as THREE from 'three';
import { BUILD, LOW, ROAD, bake, box, camera, clouds, cyl, drop, live, mat, qs, renderer, scene, sun, tex } from './core.js';
import { trafficReset, trafficTick } from './cars.js';
import { LEFT_PLAN } from './houses.js';
import { PLAN, clockTex } from './landmarks.js';
import { RIGHT_PLAN } from './commercial.js';
import { TILE, propZ, resetStreet, spawnProps, tiles } from './street.js';
import { animPigeon, pig } from './pigeon.js';


let sideZ = [5, 5], planI = [0, 4];
const LANES = ROAD ? [-3.6, 0, 3.6] : [0], PR = 1.9, GAP = 7.0, ROW = 30;
const pipeTex = tex(512, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); [[0, '#2f7f22'], [.15, '#4fb033'], [.3, '#8fe36a'], [.36, '#c8f7a8'], [.45, '#6fd04a'], [.7, '#4aa832'], [1, '#2f7f22']].forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '20,60,10' : '230,255,210'},${Math.random() * .12})`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1); } }, 1, 6);
const rimM = new THREE.MeshStandardMaterial({ color: 0x8be668, roughness: .3, side: THREE.DoubleSide }), innerM = new THREE.MeshStandardMaterial({ color: 0x1d4012, roughness: .9, side: THREE.BackSide }), boltM = mat(0x3e8a2a, { roughness: .4, metalness: .3 });
const pipeM = new THREE.MeshStandardMaterial({ map: pipeTex, color: 0xffffff, roughness: .32, metalness: .1, emissive: 0x1d4a12, emissiveIntensity: .35 }), capM = new THREE.MeshStandardMaterial({ map: pipeTex, side: THREE.DoubleSide, color: 0xffffff, roughness: .28, metalness: .1, emissive: 0x1d4a12, emissiveIntensity: .35 }), ringM = mat(0x2f7a1e);
// one big pipe pair per row: in the middle you have to fly through the gap; to one side you can also swing round it
const rows = []; let rowZ = -40, lastX = 1;
function spawnRow() { const r = { z: rowZ, g: new THREE.Group(), done: false }; r.g.position.z = rowZ; scene.add(r.g);
  const px = 0;
  // traffic island under the pipe: kerbed, rounded ends, Keep Left bollards, chevrons painted on the road either side
  const IW = 4.6, IL = 7.5, kerbM = mat(0xb8b2a6), isl = mat(0x9c968b);
  box(IW, .22, IL - IW, kerbM, 0, .11, 0, r.g); box(IW - .4, .26, IL - IW, isl, 0, .13, 0, r.g);
  [-1, 1].forEach(e => { cyl(IW / 2, IW / 2, .22, kerbM, 0, .11, e * (IL - IW) / 2, r.g, 28); cyl(IW / 2 - .2, IW / 2 - .2, .26, isl, 0, .13, e * (IL - IW) / 2, r.g, 28);
    const bz = e * (IL / 2 - .5); cyl(.28, .32, 1.1, mat(0xf4f4f0, { roughness: .4 }), 0, .7, bz, r.g, 14); cyl(.3, .3, .12, mat(0x222222), 0, 1.3, bz, r.g, 14);
    const sg = new THREE.Mesh(new THREE.CircleGeometry(.36, 20), mat(0x1f5fb8, { roughness: .4, emissive: 0x0a2450, emissiveIntensity: .3 })); sg.position.set(0, 1.85, bz + e * .04); sg.rotation.y = e > 0 ? 0 : Math.PI; r.g.add(sg);
    cyl(.05, .05, 1.2, mat(0x9aa3ad, { metalness: .6 }), 0, 1.3, bz, r.g, 6);
    const ar = box(.12, .32, .02, mat(0xffffff), 0, 1.85, bz + e * .05, r.g); ar.rotation.z = .7;
    for (let k = 0; k < 4; k++) { const ch = box(1.6, .02, .32, mat(0xecebe4, { roughness: .9 }), 0, .015, e * (IL / 2 + 1.2 + k * 1.2), r.g); ch.rotation.y = .6 * (k % 2 ? 1 : -1); } });
  for (let k = -1; k <= 1; k += 2) box(.18, .02, 6, mat(0xecebe4), k * 2.6, .015, 0, r.g);
  const mid = 5.0 + Math.random() * 4.5, lo = mid - GAP / 2, hi = mid + GAP / 2; Object.assign(r, { px, lo, hi });
  cyl(PR, PR, lo - 1.2, pipeM, px, (lo - 1.2) / 2, 0, r.g, 40); cyl(PR, PR, 40, pipeM, px, hi + 1.2 + 20, 0, r.g, 40);
  // the ends you fly between are open: a thick lip, a dark hollow inside going down into the pipe
  [[lo - .6, 1], [hi + .6, -1]].forEach(([y, d]) => { const L = PR + .45, I = PR - .1;
    cyl(L, L, 1.2, capM, px, y, 0, r.g, 48, true);
    const rim = new THREE.Mesh(new THREE.RingGeometry(I, L, 48, 1), rimM); rim.rotation.x = d > 0 ? -Math.PI / 2 : Math.PI / 2; rim.position.set(px, y + d * .6, 0); r.g.add(rim);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(I, I, 3, 48, 1, true), innerM); inner.position.set(px, y + d * .6 - d * 1.5, 0); r.g.add(inner);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(I, 32), mat(0x050805)); floor.rotation.x = d > 0 ? -Math.PI / 2 : Math.PI / 2; floor.position.set(px, y + d * .6 - d * 3, 0); r.g.add(floor);
    cyl(L + .02, L + .02, .14, ringM, px, y - d * .6, 0, r.g, 48, true);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; const bolt = new THREE.Mesh(new THREE.SphereGeometry(.07, 6, 4), boltM); bolt.position.set(px + Math.sin(a) * (L + .01), y, Math.cos(a) * (L + .01)); r.g.add(bolt); } });
  const bk = bake(r.g); scene.remove(r.g); bk.userData.baked = 1; r.g = bk; scene.add(bk); rows.push(r); rowZ -= ROW; }
/* ================= game state + controls ================= */
let state = 'menu', score = 0, best = +(localStorage.getItem('fk3d_best') || 0);
const B = { x: 0, y: 5, z: 0, vy: 0, lane: 1, flapT: 0 }; let speed = 12;
const $ = id => document.getElementById(id);
function reset() { resetStreet(); [...live].forEach(o => drop(o.g)); live.length = 0; rows.forEach(r => drop(r.g)); rows.length = 0;
  sideZ = [5, 5]; planI = [0, ROAD ? 0 : 4]; rowZ = -40; lastX = 1; Object.assign(B, { x: 0, y: 5, z: 0, vy: 0, lane: ROAD ? 1 : 0 }); trafficReset(B); score = 0; speed = 12; $('score').textContent = '0'; }
function start() { reset(); state = 'play'; $('start').classList.add('hide'); $('over').classList.add('hide'); $('score').classList.remove('hide'); flap(); }
function flap() { if (state !== 'play') return; B.vy = 7.6; B.flapT = 0; }
function lane(d) { if (!ROAD || state !== 'play') return; B.lane = Math.max(0, Math.min(2, B.lane + d)); }
function die() { if (state !== 'play') return; state = 'dead'; if (score > best) { best = score; localStorage.setItem('fk3d_best', best); } setTimeout(() => { $('ovs').textContent = 'Score ' + score + ' · Best ' + best; $('over').classList.remove('hide'); }, 700); }
$('go').onclick = e => { e.stopPropagation(); start(); }; $('again').onclick = e => { e.stopPropagation(); start(); };
$('lo').textContent = 'Low detail: ' + (LOW ? 'ON' : 'OFF'); $('lo').onclick = e => { e.stopPropagation(); localStorage.setItem('fk3d_low', LOW ? '0' : '1'); location.reload(); };
let tx = null, ty = null, tt = 0;
addEventListener('pointerdown', e => { if (e.target.closest('button')) return; tx = e.clientX; ty = e.clientY; tt = performance.now(); });
addEventListener('pointerup', e => { if (tx == null) return; const dx = e.clientX - tx, dy = e.clientY - ty; if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) lane(dx > 0 ? 1 : -1); else flap(); tx = null; });
addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') { if (state !== 'play') start(); else flap(); } if (e.code === 'ArrowLeft') lane(-1); if (e.code === 'ArrowRight') lane(1); });
/* ================= main loop ================= */
let last = performance.now(), fpsT = 0, fpsN = 0, clockT = 0; window.__fk3 = { B, rows, get state() { return state; }, start, flap, lane };
function step(dt) {
  const t = performance.now() / 1000;
  if (state === 'play' || state === 'dead') {
    if (state === 'play') { speed = Math.min(19, 12 + score * .25); B.z -= speed * dt; }
    B.vy -= 20 * dt; B.y += B.vy * dt; if (B.y > 15) { B.y = 15; B.vy = Math.min(0, B.vy); }
    B.x += (LANES[B.lane] - B.x) * Math.min(1, dt * 9);
    if (B.y < (ROAD ? 2.6 : .5)) { if (ROAD) { B.y = 2.6; B.vy = Math.max(0, B.vy); } else { B.y = .5; B.vy = 0; die(); } }
    if (state === 'play') rows.forEach(r => { const dx = 0, dz = B.z - r.z; if (dx * dx + dz * dz < (PR + .55) ** 2 && (B.y - .35 < r.lo || B.y + .35 > r.hi)) die();
      if (!r.done && r.z > B.z + PR) { r.done = true; score++; $('score').textContent = score; } });
  } else { B.y = 5 + Math.sin(t * 2) * .4; B.z -= 6 * dt; }
  // keep the town and pipes coming
  while (sideZ[0] > B.z - 230) spawnSideFix(0);
  while (sideZ[1] > B.z - 230) spawnSideFix(1);
  while (propZ > B.z - 230) spawnProps();
  if (state === 'play' && !ROAD) while (rowZ > B.z - 200) spawnRow();
  for (let i = live.length - 1; i >= 0; i--) if (live[i].z1 > B.z + 40) { drop(live[i].g); live.splice(i, 1); }
  for (let i = rows.length - 1; i >= 0; i--) if (rows[i].z > B.z + 30) { drop(rows[i].g); rows.splice(i, 1); }
  trafficTick(dt, B);
  tiles.forEach(tl => { if (tl.position.z - TILE / 2 > B.z + 30) tl.position.z -= TILE * 2; });
  clouds.forEach(c => { if (c.position.z > B.z + 50) c.position.z -= 320; });
  // pigeon pose: wings flap, body tilts with climb and lane change
  B.flapT += dt; animPigeon(dt, B.flapT, B.vy, state === 'dead');
  pig.position.set(B.x, B.y, B.z); pig.rotation.x = Math.max(-.5, Math.min(.6, B.vy * .05)); pig.rotation.z = (B.x - LANES[B.lane]) * .25;
  // camera behind and above, like a runner game
  let cy = Math.max(3.6, B.y + 2.0); rows.forEach(r => { if (r.z > B.z - 2 && r.z < B.z + 9) cy = Math.max(r.lo + 1, Math.min(cy, r.hi - 1)); });
  camera.position.lerp(new THREE.Vector3(B.x * .55, cy, B.z + 6.2), Math.min(1, dt * 6)); camera.position.y = Math.min(camera.position.y, cy + .3); camera.lookAt(B.x * .7, B.y + .2, B.z - 10);
  sun.position.set(B.x - 30, 45, B.z + 20); sun.target.position.set(B.x, 0, B.z - 12); scene.getObjectByName('sky').position.set(0, 0, B.z);
  clockT += dt; if (clockT > 5) { clockT = 0; clockTex.userData.draw(); }
}
function spawnSideFix(i) { const s = i ? 1 : -1; const PL = ROAD ? (i ? RIGHT_PLAN : LEFT_PLAN) : PLAN, kind = PL[planI[i]++ % PL.length], b = BUILD[kind](); const z = sideZ[i] - b.w / 2;
  b.g.position.set(s * 10.6, 0, z); b.g.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; const baked = bake(b.g); baked.userData.baked = 1; scene.add(baked); live.push({ g: baked, z1: sideZ[i] }); sideZ[i] -= b.w + (ROAD ? (i ? 1 : .6) : 1.5); return true; }
function loop(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); renderer.render(scene, camera);
  fpsN++; fpsT += dt; if (fpsT > 1) { $('fps').textContent = Math.round(fpsN / fpsT) + ' fps'; fpsN = 0; fpsT = 0; } requestAnimationFrame(loop); }
window.__shot = (px, py, pz, lx, ly, lz) => { camera.position.set(px, B.y * 0 + py, B.z + pz); camera.lookAt(lx, ly, B.z + lz); renderer.render(scene, camera); };
window.__step = (ms, n = 1) => { for (let i = 0; i < n; i++) step(ms / 1000); renderer.render(scene, camera); };
if (ROAD) { document.querySelector('#start h1').textContent = 'LEAGRAVE ROAD 3D'; document.querySelector('#start p').innerHTML = 'Leagrave Road, Luton, modelled from Street View. No pipes for now. <b>Swipe left/right</b> to change lane, <b>tap</b> to hop up. You can\'t crash.'; $('score').style.display = 'none'; $('tag').textContent = 'ROAD MODEL'; }
reset(); if (!qs.has('manual')) requestAnimationFrame(loop); else __step(16);
