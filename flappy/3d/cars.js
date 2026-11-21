/* cars.js — CARS & TRAFFIC. One shared geometry per car model; colour = paint material picked from that model's factory
   paint list (weighted by how common each colour is). carG() for parked cars, busG(), vanG(), trafficReset()/trafficTick(). */
import * as THREE from 'three';
import { box, cyl, mat, rbox, scene, tex } from './core.js';
import { GLASS } from './materials.js';


export const vanG = (col = 0xf2f2f2) => { const g = new THREE.Group(), m = mat(col, { roughness: .4, metalness: .3 }); rbox(2, 2.1, 5, .18, m, 0, 1.35, .2, g); rbox(1.9, .9, 1.2, .2, m, 0, .9, -2.6, g); box(1.85, .7, .1, GLASS, 0, 1.75, -2.25, g); box(2.02, .6, 1.2, GLASS, 0, 1.9, -1.6, g);
  [[-1, 1.7], [1, 1.7], [-1, -2.2], [1, -2.2]].forEach(([x, z]) => { const w = cyl(.38, .38, .3, mat(0x111111), x, .38, z, g, 12); w.rotation.z = Math.PI / 2; }); return g; };
// cars: rounded body + glasshouse from a side profile, wheels with rims, lights, UK plates (white front, yellow rear)
export const CARGEO = (() => { const prof = (pts, w, b) => { const s = new THREE.Shape(); s.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) pts[i].length === 2 ? s.lineTo(...pts[i]) : s.quadraticCurveTo(...pts[i]); const g = new THREE.ExtrudeGeometry(s, { depth: w - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 6 }); g.translate(0, 0, -(w - 2 * b) / 2); g.rotateY(-Math.PI / 2); return g; };
  const T = [
    { body: [[-2.05, .32], [2.0, .32], [2.12, .45, 2.12, .62], [2.08, .76, 1.9, .82], [.95, .96], [-1.55, .98], [-2.0, .96, -2.08, .82], [-2.12, .45, -2.05, .32]], cab: [[.9, .92], [.15, 1.36, -.05, 1.4], [-.95, 1.4], [-1.55, .94]] },          // saloon
    { body: [[-1.85, .32], [1.85, .32], [1.97, .45, 1.97, .62], [1.93, .76, 1.75, .83], [.85, .97], [-1.75, .99], [-1.9, .9, -1.92, .7], [-1.95, .45, -1.85, .32]], cab: [[.8, .93], [.05, 1.42, -.2, 1.45], [-1.55, 1.42], [-1.78, .95]] },     // hatchback
    { body: [[-2.1, .45], [2.05, .45], [2.17, .6, 2.17, .8], [2.12, .98, 1.95, 1.02], [1.0, 1.12], [-1.95, 1.14], [-2.12, 1.05, -2.15, .9], [-2.18, .6, -2.1, .45]], cab: [[.95, 1.08], [.3, 1.62, .05, 1.66], [-1.75, 1.64], [-2.02, 1.1]] } ];  // SUV
  return T.map(t => ({ body: Object.assign(prof(t.body, 1.76, .07), { userData: { shared: 1 } }), cab: Object.assign(prof(t.cab, 1.5, .06), { userData: { shared: 1 } }), wy: t.body[0][1] + .02, len: t.body[1][0] - t.body[0][0], fz: t.body[2][0], rz: t.body[0][0] - .07 })); })();
export const PAINT = {}; export const paintM = c => PAINT[c] || (PAINT[c] = new THREE.MeshStandardMaterial({ color: c, roughness: .22, metalness: .55 }));
export const TYRE = mat(0x141414, { roughness: .9 }), RIM = mat(0xb8bcc2, { roughness: .25, metalness: .9 }), TRIM = mat(0x1c1d20, { roughness: .6 }), HEAD = mat(0xf2f4f6, { roughness: .1, metalness: .3, emissive: 0xffffff, emissiveIntensity: .15 }), TAIL = mat(0xa0161a, { roughness: .2, emissive: 0x700000, emissiveIntensity: .4 });
export const PLATEF = new THREE.MeshStandardMaterial({ map: tex(128, 32, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = 'bold 22px monospace'; x.textAlign = 'center'; x.fillText('LT24 KBR', w / 2, 24); }), roughness: .4 }), PLATER = new THREE.MeshStandardMaterial({ map: tex(128, 32, (x, w, h) => { x.fillStyle = '#f7d21c'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = 'bold 22px monospace'; x.textAlign = 'center'; x.fillText('LT24 KBR', w / 2, 24); }), roughness: .4 });
export const carG = (col) => { const g = new THREE.Group(), t = (Math.random() * 10) | 0, k = t < 5 ? 0 : t < 8 ? 1 : 2, G = CARGEO[k], pm = paintM(col);
  const b = new THREE.Mesh(G.body, pm), c = new THREE.Mesh(G.cab, GLASS); [b, c].forEach(m => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
  box(1.8, .16, G.len + .1, TRIM, 0, G.wy + .06, (G.fz + G.rz) / 2 + .03, g);                                                   // dark sill / bumper line
  const wb = G.len * .31, wz = (G.fz + G.rz) / 2 + .03, wr = k === 2 ? .38 : .33;
  [[-1, wb], [1, wb], [-1, -wb], [1, -wb]].forEach(([s, z]) => { const ar = cyl(wr + .07, wr + .07, .02, TRIM, s * .885, wr, wz + z, g, 14); ar.rotation.z = Math.PI / 2; const ty = cyl(wr, wr, .24, TYRE, s * .82, wr, wz + z, g, 14); ty.rotation.z = Math.PI / 2; const rm = cyl(wr * .62, wr * .62, .02, RIM, s * .945, wr, wz + z, g, 10); rm.rotation.z = Math.PI / 2; });
  [-1, 1].forEach(s => { box(.4, .12, .06, HEAD, s * .58, G.wy + .38, G.fz + .02, g); box(.36, .13, .06, TAIL, s * .62, G.wy + .45, G.rz + .04, g); box(.1, .08, .16, pm, s * .93, G.wy + .66, G.fz - 1.15, g); });
  box(.7, .14, .05, TRIM, 0, G.wy + .26, G.fz + .04, g); const pf = new THREE.Mesh(new THREE.PlaneGeometry(.52, .12), PLATEF); pf.position.set(0, G.wy + .12, G.fz + .08); g.add(pf); const pr = new THREE.Mesh(new THREE.PlaneGeometry(.52, .12), PLATER); pr.position.set(0, G.wy + .3, G.rz - .02); pr.rotation.y = Math.PI; g.add(pr);
  return g; };
/* ================= traffic: outgoing on the left, oncoming on the right, round the islands ================= */
export const busG = () => { const g = new THREE.Group(), tm = mat(0x1d8a8a, { roughness: .4, metalness: .2 }); rbox(2.5, 3, 11, .3, tm, 0, 1.75, 0, g); rbox(2.54, 1.1, 10.4, .1, GLASS, 0, 2.3, -.1, g); box(2.4, 1.3, .1, GLASS, 0, 2.2, -5.52, g);
  box(2.54, .25, 11, mat(0xf2f2f2), 0, .45, 0, g); [[-1.2, 3.6], [1.2, 3.6], [-1.2, -3.6], [1.2, -3.6]].forEach(([x, z]) => { const w = cyl(.5, .5, .3, mat(0x111111), x, .5, z, g, 14); w.rotation.z = Math.PI / 2; }); return g; };
export const traffic = []; export let trafT = 0; export const CARC = [0xc0392b, 0x1f3b6b, 0xdddddd, 0x222222, 0x2f8f4a, 0x9aa3ad, 0xe0b030];
export function spawnCar(dir, B) { const bus = Math.random() < .12, g = bus ? busG() : carG(CARC[(Math.random() * CARC.length) | 0]); const x = dir < 0 ? -3.6 : 3.6, z = dir < 0 ? B.z - 30 - Math.random() * 70 : B.z - 140 - Math.random() * 60;
  if (traffic.some(c => c.dir === dir && Math.abs(c.z - z) < 14)) return; g.position.set(x, 0, z); if (dir > 0) g.rotation.y = Math.PI; scene.add(g); traffic.push({ g, z, dir, v: dir < 0 ? 7 + Math.random() * 3 : 11 + Math.random() * 4 }); }
export function trafficReset(B) { traffic.forEach(c => scene.remove(c.g)); traffic.length = 0; trafT = 0; for (let k = 0; k < 8; k++) spawnCar(k % 2 ? 1 : -1, B); }
export function trafficTick(dt, B) { trafT -= dt; if (trafT <= 0) { trafT = .5 + Math.random() * .9; spawnCar(Math.random() < .5 ? -1 : 1, B); }
  for (let i = traffic.length - 1; i >= 0; i--) { const c = traffic[i]; c.z += c.dir * c.v * dt; c.g.position.z = c.z; if (c.z > B.z + 25 || c.z < B.z - 260) { scene.remove(c.g); traffic.splice(i, 1); } } }
