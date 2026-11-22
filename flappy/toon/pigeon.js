/* toon/pigeon.js — THE HERO: a chubby cartoon pigeon (big shiny eyes, green-purple neck shimmer, wings with the two black bars).
   pig = the model (faces -z); animPig(dt, s) flaps, squashes, banks and tilts it from the game state. */
import { THREE, scene, M, P, canvasTex } from './core.js';

export const pig = new THREE.Group(); const body = new THREE.Group(); pig.add(body); const p = P(body);
const GREY = M(0xa9b3c6, { roughness: .55 }), GREY2 = M(0x8d97ad, { roughness: .55 }), BELLY = M(0xc9d1df, { roughness: .6 });
const NECK = M(0xffffff, { map: canvasTex(256, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); ['#3fd18a', '#7a5cff', '#2fc4a0', '#b05cff', '#3fd18a'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c)); x.fillStyle = g; x.fillRect(0, 0, w, h); }), roughness: .25, metalness: .35 });
p.sph(.55, GREY, 0, 0, 0, [1, .92, 1.28], 32); p.sph(.42, BELLY, 0, -.12, -.32, [1, .9, 1.05], 28); p.sph(.4, NECK, 0, .3, -.48, [1.02, .95, .9], 28);
const head = new THREE.Group(); head.position.set(0, .62, -.66); body.add(head); const h = P(head);
h.sph(.34, M(0x9ea9bf, { roughness: .5 }), 0, 0, 0, [1, 1, 1.05], 32);
[-1, 1].forEach(s => { h.sph(.115, M(0xffffff, { roughness: .2 }), s * .2, .07, -.2, [1, 1, 1], 20); h.sph(.085, M(0xff8a1d, { roughness: .2 }), s * .245, .075, -.25, [1, 1, 1], 18); h.sph(.05, M(0x111111, { roughness: .1 }), s * .27, .08, -.285, [1, 1, 1], 14); h.sph(.022, M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }), s * .27, .11, -.31, [1, 1, 1], 10); });
h.add(new THREE.ConeGeometry(.08, .3, 16), M(0x3a3f47, { roughness: .35 }), 0, -.05, -.42, [-Math.PI / 2, 0, 0]); h.sph(.07, M(0xf2f2ee, { roughness: .6 }), 0, .03, -.34, [1, .7, 1.1], 14);
// wings: rounded shape, grey with two dark bars, hinged at the shoulder
const wingTex = canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#b7c0d2'; x.fillRect(0, 0, w, h); x.fillStyle = '#7d879d'; x.fillRect(w * .62, 0, w * .38, h); x.fillStyle = '#2b2f3a'; [.34, .5].forEach(f => x.fillRect(w * f, h * .1, w * .07, h * .8)); });
const wingM = M(0xffffff, { map: wingTex, roughness: .55, side: THREE.DoubleSide });
const wingShape = s => { const sh = new THREE.Shape(); sh.moveTo(0, .18); sh.quadraticCurveTo(.6, .32, 1.25, .12); sh.quadraticCurveTo(1.45, .02, 1.3, -.08); sh.quadraticCurveTo(.9, -.22, .55, -.3); sh.quadraticCurveTo(.2, -.32, 0, -.2); sh.lineTo(0, .18);
  const g = new THREE.ExtrudeGeometry(sh, { depth: .06, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2, curveSegments: 12 }); g.rotateX(Math.PI / 2); const pa = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < pa.count; i++) uv.setXY(i, pa.getX(i) / 1.45, (pa.getZ(i) + .32) / .64); if (s < 0) { g.scale(-1, 1, 1); g.computeVertexNormals(); } return g; };
export const wings = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(s * .42, .22, -.12); body.add(pv); const m = new THREE.Mesh(wingShape(s), wingM); m.castShadow = true; pv.add(m); return pv; });
const tail = new THREE.Group(); tail.position.set(0, .08, .62); body.add(tail); { const sh = new THREE.Shape(); sh.moveTo(-.18, 0); sh.lineTo(.18, 0); sh.quadraticCurveTo(.42, .55, .3, .7); sh.quadraticCurveTo(0, .8, -.3, .7); sh.quadraticCurveTo(-.42, .55, -.18, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2, curveSegments: 10 }); g.rotateX(-Math.PI / 2 + .25); const tm = new THREE.Mesh(g, M(0xffffff, { map: canvasTex(64, 128, (x, w, hh) => { x.fillStyle = '#9aa4b8'; x.fillRect(0, 0, w, hh); x.fillStyle = '#2b2f3a'; x.fillRect(0, hh * .05, w, hh * .2); }), roughness: .55 })); tm.castShadow = true; tail.add(tm); }
[-1, 1].forEach(s => { p.cyl(.035, .035, .25, M(0xff6a5a), s * .16, -.5, .2, 8, [.6, 0, 0]); p.sph(.07, M(0xff6a5a), s * .16, -.6, .3, [1, .5, 1.4], 10); });
pig.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(pig);
// blob shadow (soft, always under the pigeon even when the real shadow is off)
export const blob = new THREE.Mesh(new THREE.CircleGeometry(.75, 24), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false }));
blob.rotation.x = -Math.PI / 2; scene.add(blob);
let ft = 0;
export function animPig(dt, s) { // s: { flapRate, air, bank, pitch, dead, t }
  ft += dt * s.flapRate; const a = Math.sin(ft), up = a > 0 ? a : a * .7;
  wings.forEach((w, i) => { const sd = i ? 1 : -1; w.rotation.z = sd * (-.25 + up * .95); w.rotation.y = sd * a * .18; });
  body.position.y = -a * .06; body.scale.set(1 + a * .02, 1 - a * .03, 1); head.rotation.x = Math.sin(ft * .5) * .06; head.position.z = -.66 + Math.sin(ft * .5) * .02;
  tail.rotation.x = -a * .12; pig.rotation.set(s.pitch, 0, s.bank);
  if (s.dead) { pig.rotation.z += dt * 0; } }
