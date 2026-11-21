/* street.js — STREET. Road + pavement tiles, kerbs, drains, lamp columns, trees, telegraph poles + wires, side-road
   junctions, railway. spawnProps() adds street furniture ahead of the player; resetStreet() on restart. */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from './BufferGeometryUtils.js';
import { BUILD, LOW, ROAD, box, cyl, live, mat, rbox, scene, shade, signPanel, signTex, tex } from './core.js';
import { DARK, LEAF, grey, mul, pbrTex, speck, toNormal } from './materials.js';


// side road off the main road with give-way lines and a street-name plate
export const junction = (name) => () => { const g = new THREE.Group(), W = 9;
  const t = new THREE.Mesh(new THREE.PlaneGeometry(W, 40), roadM); t.rotation.x = -Math.PI / 2; t.rotation.z = Math.PI / 2; t.position.set(0, .215, -15); t.receiveShadow = true; g.add(t);
  for (let x = -W / 2 + .4; x < 0; x += .9) box(.5, .02, .18, mat(0xecebe4), x, .23, 4.6, g); box(.15, .02, 4, mat(0xecebe4), 0, .23, 2.6, g);
  const pl = new THREE.Group(); pl.position.set(W / 2 + .8, 0, 1); g.add(pl); [-.8, .8].forEach(x => box(.07, 1.1, .07, DARK, x, .55, 0, pl)); signPanel(pl, 2, .45, signTex(name, '#fff', '#111'), 0, 1.0, .05);
  return { g, w: W }; };
BUILD.fitzroy = junction('FITZROY AVE'); BUILD.rondini = junction('RONDINI AVE');
// the railway behind the commercial side: ballast, two tracks, overhead line masts
export const railG = (() => { const g = new THREE.Group(); const L = 18;
  box(7, .3, L, mat(0x8a8178, { roughness: 1 }), 0, .15, 0, g); [-1.6, 1.6].forEach(tx => [-.72, .72].forEach(rx => box(.1, .15, L, mat(0x6a6a6e, { metalness: .7, roughness: .4 }), tx + rx, .38, 0, g)));
  for (let z = -L / 2; z < L / 2; z += .8) [-1.6, 1.6].forEach(tx => box(2.2, .1, .25, mat(0x5a4a3c), tx, .32, z, g));
  const st = mat(0x8e959c, { metalness: .5, roughness: .5 }); box(.3, 7.5, .3, st, -4, 3.75, 0, g); box(.3, 7.5, .3, st, 4, 3.75, 0, g); box(8.6, .35, .35, st, 0, 7.4, 0, g); [-1.6, 1.6].forEach(tx => box(.05, .05, L, mat(0x333333), tx, 6.4, 0, g));
  return g; })();
/* ================= the street: road, kerbs, pavements, lamps, trees ================= */
export const roadTex = new THREE.TextureLoader().load('road.jpg'); roadTex.colorSpace = THREE.SRGBColorSpace; roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.repeat.set(1, 36); roadTex.anisotropy = 8;
export const pavTex = pbrTex(256, 256, (x, w, h, H, R) => { x.fillStyle = H ? '#000' : '#a39d91'; x.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const v = (R() - .5) * 16; x.fillStyle = H ? grey(200 + v) : shade('#b9b3a7', v); x.fillRect(c * 64 + 1, r * 64 + 1, 62, 62); if (!H && R() < .25) { x.fillStyle = 'rgba(0,0,0,.05)'; x.beginPath(); x.arc(c * 64 + R() * 60, r * 64 + R() * 60, 3 + R() * 6, 0, 7); x.fill(); } }
  speck(x, w, h, 4000, H ? .35 : .07, R); }, null, 2); pavTex.repeat.set(2, 166); if (pavTex.userData.normal) pavTex.userData.normal.repeat.set(2, 166);
export const street = new THREE.Group(); scene.add(street);
export const roadM = new THREE.MeshStandardMaterial({ map: roadTex, roughness: .88 }), pavM = new THREE.MeshStandardMaterial({ map: pavTex, normalMap: pavTex.userData.normal, roughness: .92 });
if (!LOW) new THREE.ImageLoader().load('road.jpg', im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const n = toNormal(c, 1.4); n.repeat.copy(roadTex.repeat); roadM.normalMap = n; roadM.normalScale.set(.35, .35); roadM.needsUpdate = true; });
export const KERB = pbrTex(64, 64, (x, w, h, H, R) => { x.fillStyle = H ? grey(200) : '#b4aea2'; x.fillRect(0, 0, w, h); speck(x, w, h, 900, H ? .4 : .1, R); x.fillStyle = H ? '#000' : 'rgba(0,0,0,.35)'; x.fillRect(0, 0, w, 2); }, null, 2); KERB.repeat.set(1, 440); if (KERB.userData.normal) KERB.userData.normal.repeat.set(1, 440);
export const kerbM = new THREE.MeshStandardMaterial({ map: KERB, normalMap: KERB.userData.normal, roughness: .9 });
export const tiles = []; export const TILE = 400;
for (let k = 0; k < 2; k++) { const t = new THREE.Group(); const rd = new THREE.Mesh(new THREE.PlaneGeometry(11, TILE), roadM); rd.rotation.x = -Math.PI / 2; rd.receiveShadow = true; t.add(rd);
  [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(5, .2, TILE), pavM); p.position.set(s * 8, .1, 0); p.receiveShadow = true; t.add(p); const kb = new THREE.Mesh(new THREE.BoxGeometry(.3, .22, TILE), kerbM); kb.position.set(s * 5.6, .11, 0); kb.receiveShadow = true; t.add(kb); });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(400, TILE), new THREE.MeshStandardMaterial({ map: tex(256, 256, (x, w, h) => { x.fillStyle = '#5a9a46'; x.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { x.fillStyle = ['#4c8a3a', '#6aac52', '#7fbe62', '#447e34'][i % 4]; x.fillRect(Math.random() * w, Math.random() * h, 1, 2 + Math.random() * 3); } }, 60, 60), roughness: 1 })); gr.rotation.x = -Math.PI / 2; gr.position.y = -.02; gr.receiveShadow = true; t.add(gr);
  t.position.z = -k * TILE + TILE / 2 - 20; street.add(t); tiles.push(t); }
export const lampG = (() => { const g = new THREE.Group(); const m = mat(0x8b9096, { metalness: .6, roughness: .45 });   // galvanised UK column with a swan neck and a flat LED head
  cyl(.07, .12, 7.4, m, 0, 3.7, 0, g, 10); cyl(.16, .16, .9, m, 0, .45, 0, g, 10); const neck = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 7.3, 0), new THREE.Vector3(0, 8.1, 0), new THREE.Vector3(-1.1, 8.0, 0)), 8, .055, 6), m); neck.castShadow = true; g.add(neck);
  rbox(.9, .12, .34, .05, mat(0x5b6066, { metalness: .5, roughness: .4 }), -1.45, 7.98, 0, g); box(.7, .02, .24, mat(0xfff8e0, { emissive: 0xfff1c8, emissiveIntensity: .5 }), -1.45, 7.91, 0, g); return g; })();
export const barkM = new THREE.MeshStandardMaterial({ roughness: 1, map: pbrTex(64, 128, (x, w, h, H, R) => { x.fillStyle = H ? grey(120) : '#5a4a3e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { const px = R() * w; x.fillStyle = H ? grey(40 + R() * 60) : 'rgba(0,0,0,.25)'; x.fillRect(px, R() * h, 2 + R() * 2, 10 + R() * 40); } speck(x, w, h, 500, .2, R); }, null, 3) });
barkM.normalMap = barkM.map.userData.normal;
export const LEAFM = ['#4f8a3c', '#3f7a35', '#5f9844'].map(c => { const t = LEAF(c); t.repeat.set(2, 2); const m = new THREE.MeshStandardMaterial({ map: t, roughness: .9 }); if (t.userData.normal) { t.userData.normal.repeat.set(2, 2); m.normalMap = t.userData.normal; } return m; });
// tree: trunk + branches, crown of lumpy leaf clusters merged into one mesh
export const makeTree = seed => { const R = mul(seed), g = new THREE.Group(), wood = [], leaf = [];
  const tr = new THREE.CylinderGeometry(.15, .27, 3.4, 8, 3); tr.translate(0, 1.7, 0); wood.push(tr);
  for (let i = 0; i < 4; i++) { const a = R() * 6.3, e = .6 + R() * .5, L = 1.4 + R() * .8, A = new THREE.Vector3(0, 2.4 + R() * .8, 0), Bv = A.clone().add(new THREE.Vector3(Math.cos(a) * e * L, L * .8, Math.sin(a) * e * L)); const b = new THREE.CylinderGeometry(.05, .1, A.distanceTo(Bv), 5); b.translate(0, A.distanceTo(Bv) / 2, 0); b.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize())); b.translate(A.x, A.y, A.z); wood.push(b); }
  const n = 11 + (R() * 5 | 0); for (let i = 0; i < n; i++) { const r = .75 + R() * .8, a = R() * 6.3, d = R() * 1.5; let geo = new THREE.IcosahedronGeometry(r, 2); geo.deleteAttribute('uv'); geo.deleteAttribute('normal'); geo = mergeVertices(geo); const p = geo.attributes.position, s = R() * 10;
    for (let j = 0; j < p.count; j++) { const x = p.getX(j), y = p.getY(j), z = p.getZ(j), k = 1 + Math.sin(x * 4.3 + s) * Math.sin(y * 3.9 + s) * Math.sin(z * 4.1) * .28 + Math.sin(x * 9 + z * 7 + s) * .07; p.setXYZ(j, x * k, y * k * .85, z * k); }
    geo.translate(Math.cos(a) * d, 4.2 + R() * 1.6 - d * .3, Math.sin(a) * d); const uv = new Float32Array(p.count * 2); for (let j = 0; j < p.count; j++) { uv[j * 2] = (p.getX(j) + p.getZ(j)) * .5; uv[j * 2 + 1] = p.getY(j) * .5; } geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.computeVertexNormals(); leaf.push(geo); }
  const wm = new THREE.Mesh(mergeGeometries(wood.map(x => x.index ? x.toNonIndexed() : x)), barkM), lm = new THREE.Mesh(mergeGeometries(leaf), LEAFM[seed % 3]);
  [wm, lm].forEach(m => { m.castShadow = true; m.receiveShadow = true; g.add(m); }); return g; };
export const TREES = [1, 2, 3, 4, 5].map(makeTree);
export let propZ = 5, poleN = 0, lastPole = null;
export function resetStreet() { propZ = 5; lastPole = null; poleN = 0; }
export const WIRE = new THREE.LineBasicMaterial({ color: 0x222222 });
export const poleG = (() => { const g = new THREE.Group(), w = new THREE.MeshStandardMaterial({ roughness: .95, map: barkM.map, color: 0x9a8a72 }); cyl(.13, .17, 9.2, w, 0, 4.6, 0, g, 8); box(1.5, .1, .1, w, 0, 8.7, 0, g); [-.55, 0, .55].forEach(x => cyl(.04, .04, .14, mat(0xdddddd), x, 8.8, 0, g, 6)); return g; })();
export const drainG = (() => { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ roughness: .5, metalness: .6, map: tex(32, 64, (x, w, h) => { x.fillStyle = '#2a2a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#0a0a0a'; for (let y = 4; y < h - 2; y += 6) x.fillRect(4, y, w - 8, 3); }) }); const d = new THREE.Mesh(new THREE.PlaneGeometry(.4, .7), m); d.rotation.x = -Math.PI / 2; g.add(d); return g; })();
export function spawnProps() { const z = propZ; [-1, 1].forEach(s => { const l = lampG.clone(); l.position.set(s * 6.1, 0, z); l.rotation.y = s > 0 ? 0 : Math.PI; scene.add(l); live.push({ g: l, z1: z + 2 }); });
  if (ROAD) { const rg = railG.clone(); rg.position.set(52, 0, z - 9); scene.add(rg); live.push({ g: rg, z1: z });
    const pz = z - 4; if ((poleN++ & 1) === 0) { const pg = poleG.clone(); pg.position.set(6.5, 0, pz); scene.add(pg); live.push({ g: pg, z1: pz + 2 });
      if (lastPole !== null) { const wg = new THREE.Group(); [-.55, 0, .55].forEach(o => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(6.5 + o, 8.6 - Math.sin(t * Math.PI) * .7, lastPole + (pz - lastPole) * t)); } wg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), WIRE)); }); scene.add(wg); live.push({ g: wg, z1: pz + 2 }); }
      lastPole = pz; } }
  [-1, 1].forEach(s => { const d = drainG.clone(); d.position.set(s * 5.15, .012, z - 7); scene.add(d); live.push({ g: d, z1: z - 6 }); });
  if (Math.random() < (ROAD ? .15 : .6)) { const t = TREES[(Math.random() * TREES.length) | 0].clone(); t.rotation.y = Math.random() * 6; const s = Math.random() < .5 ? -1 : 1; t.position.set(s * 8.6, 0, z - 9); scene.add(t); live.push({ g: t, z1: z - 6 }); }
  propZ -= 18; }
