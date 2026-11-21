/* core.js — ENGINE (owner: the integrator chat). Renderer, scene, camera, lights, sky + reflections, clouds,
   shared helpers (mat, tex, box, cyl, rod, rbox, signs), the BUILD registry, live list, and bake() which merges each
   building into one mesh per material and lays world-sized textures on it. Other files import from here; this file imports nothing of ours. */
import * as THREE from 'three';
import { mergeGeometries } from './BufferGeometryUtils.js';


/* ================= renderer, scene, camera ================= */
export const qs = new URLSearchParams(location.search);
export let LOW = qs.get('low') === '1' || localStorage.getItem('fk3d_low') === '1';
export const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(LOW ? 1 : 2, devicePixelRatio || 1));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
document.body.prepend(renderer.domElement);
export const scene = new THREE.Scene();
export const FOG = new THREE.Color(0xcfe2f2); scene.fog = new THREE.Fog(FOG, 60, 210);
export const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .1, 400);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
// sky dome
{ const g = new THREE.SphereGeometry(300, 32, 16), m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x3d86d0) }, mid: { value: new THREE.Color(0x9cc7ee) }, bot: { value: FOG } },
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top,mid,bot; varying vec3 p; void main(){ float h=p.y; vec3 c = h>0.2? mix(mid,top,smoothstep(.2,.8,h)) : mix(bot,mid,smoothstep(-.05,.2,h)); gl_FragColor=vec4(c,1.); }' });
  const sky = new THREE.Mesh(g, m); sky.name = 'sky'; scene.add(sky); }
export const hemi = new THREE.HemisphereLight(0xdfefff, 0x6b6250, .75); scene.add(hemi);
// reflections: a small sky + ground + bright sun baked into an environment map, so glass, paint and metal pick up the sky
{ const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { top: { value: new THREE.Color(0x2f78c4) }, mid: { value: new THREE.Color(0xc4dcf2) }, gr: { value: new THREE.Color(0x5e5a52) } },
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top,mid,gr; varying vec3 p; void main(){ float h=p.y; vec3 c = h>0. ? mix(mid,top,smoothstep(0.,.7,h)) : mix(mid*.75,gr,smoothstep(0.,-.12,h)); gl_FragColor=vec4(c,1.); }' })));
  const sb = new THREE.Mesh(new THREE.SphereGeometry(.7, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(14, 12, 9) })); sb.position.set(-30, 45, 20).normalize().multiplyScalar(8); es.add(sb);
  scene.environment = pm.fromScene(es, .02).texture; scene.environmentIntensity = .6; }
export const sun = new THREE.DirectionalLight(0xfff1d8, 2.3); sun.position.set(-30, 45, 20); sun.castShadow = true;
sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
scene.add(sun, sun.target);
// soft clouds (billboards)
export const cloudTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  [[70, 80, 46], [128, 62, 58], [186, 80, 44], [110, 88, 40], [160, 92, 36]].forEach(([a, b, r]) => { const g = x.createRadialGradient(a, b, 4, a, b, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.7, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
export const clouds = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, opacity: .95 })); s.scale.set(60 + Math.random() * 40, 26 + Math.random() * 14, 1); s.position.set((Math.random() - .5) * 260, 55 + Math.random() * 35, -Math.random() * 300); scene.add(s); clouds.push(s); }
/* ================= helpers: materials, canvas textures ================= */
export const MAT = {}; export const mat = (c, o = {}) => { const k = c + JSON.stringify(o); return MAT[k] || (MAT[k] = new THREE.MeshStandardMaterial({ color: c, roughness: .85, metalness: 0, ...o })); };
export const tex = (w, h, draw, rx = 1, ry = 1) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };
export const noise = (x, w, h, n, a) => { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } };
export function shade(hex, v) { const n = parseInt(hex.slice(1), 16); const r = Math.max(0, Math.min(255, (n >> 16) + v)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + v)), b = Math.max(0, Math.min(255, (n & 255) + v)); return `rgb(${r | 0},${g | 0},${b | 0})`; }
export const textTex = (txt, bg, fg, font, w = 512, h = 128, sub) => tex(w, h, (x) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h / 2 + (sub ? -10 : 2)); if (sub) { x.font = '22px sans-serif'; x.fillText(sub, w / 2, h - 22); } });
export const box = (w, h, d, m, x = 0, y = 0, z = 0, g) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; if (g) g.add(b); return b; };
export const cyl = (rt, rb, h, m, x, y, z, g, seg = 16, open = false, ts = 0, tl = Math.PI * 2) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open, ts, tl), m); c.position.set(x, y, z); c.castShadow = c.receiveShadow = true; if (g) g.add(c); return c; };
export const rod = (a, b, r, m, g, seg = 6) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), L = A.distanceTo(Bv); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg, 1), m); c.position.copy(A).add(Bv).multiplyScalar(.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize()); c.castShadow = true; c.receiveShadow = true; if (g) g.add(c); return c; };
// box with rounded edges (cars, vans, bins, hedges)
export const RBG = {}; export const rboxGeo = (w, h, d, r) => { r = Math.min(r, w / 2.2, h / 2.2, d / 2.2); const k = [w, h, d, r].map(v => v.toFixed(3)).join(); if (RBG[k]) return RBG[k]; const b = r * .6, W = w - 2 * b, Hh = h - 2 * b, q = Math.max(.001, Math.min(r * .7, W / 2 - .001, Hh / 2 - .001)), s = new THREE.Shape();
  s.moveTo(-W / 2 + q, -Hh / 2); s.lineTo(W / 2 - q, -Hh / 2); s.quadraticCurveTo(W / 2, -Hh / 2, W / 2, -Hh / 2 + q); s.lineTo(W / 2, Hh / 2 - q); s.quadraticCurveTo(W / 2, Hh / 2, W / 2 - q, Hh / 2); s.lineTo(-W / 2 + q, Hh / 2); s.quadraticCurveTo(-W / 2, Hh / 2, -W / 2, Hh / 2 - q); s.lineTo(-W / 2, -Hh / 2 + q); s.quadraticCurveTo(-W / 2, -Hh / 2, -W / 2 + q, -Hh / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 3 }); g.translate(0, 0, -(d - 2 * b) / 2); g.userData.shared = 1; return RBG[k] = g; };
export const rbox = (w, h, d, r, m, x = 0, y = 0, z = 0, g) => { const b = new THREE.Mesh(rboxGeo(w, h, d, r), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; if (g) g.add(b); return b; };
/* ================= buildings: each one a little model with depth =================
   local space: front face at z = 0 facing +z, width along x (centred), building goes back into -z */
export const BUILD = {};
export const signTex = (txt, bg, fg, sub) => tex(512, 96, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 46px sans-serif'; x.fillText(txt, w / 2, sub ? 38 : 50); if (sub) { x.font = 'bold 20px sans-serif'; x.fillText(sub, w / 2, 76); } }, 1, 1);
export const signPanel = (g, w, h, t, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .5 })); m.position.set(x, y, z); g.add(m); return m; };
/* ================= spawning the town ahead, dropping it behind ================= */
export const live = [];
/* ================= pipes in 3 lanes ================= */
export const ROAD = /[?&]road=1/.test(location.search);
export function worldUV(geo, ws) { const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i)); let u, v;
    if (ny > .9) { u = x; v = z; } else { v = y / Math.max(.25, Math.sqrt(1 - ny * ny)); u = nx > nz ? z : x; } uv[i * 2] = u / ws[0]; uv[i * 2 + 1] = v / ws[1]; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
export function pbrMat(m) { if (m.userData.pbr) return; m.userData.pbr = 1; m.map.repeat.set(1, 1); const n = m.map.userData.normal; if (n && !m.normalMap) { m.normalMap = n; m.normalScale.set(1, 1); } m.needsUpdate = true; }
export function bake(g) { // merge every mesh of a building into one mesh per material: far fewer draw calls
  g.updateMatrixWorld(true); const by = new Map(), keep = [];
  g.traverse(o => { if (!o.isMesh) return; if (o.userData.flag) { keep.push(o); return; } const k = o.material.uuid; if (!by.has(k)) by.set(k, { m: o.material, gs: [] }); let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); const ws = o.material.map && o.material.map.userData && o.material.map.userData.world; if (ws) { worldUV(geo, ws); pbrMat(o.material); } for (const a of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(a)) geo.deleteAttribute(a); by.get(k).gs.push(geo); });
  const out = new THREE.Group(); by.forEach(({ m, gs }) => { const geo = mergeGeometries(gs, false); gs.forEach(x => x.dispose()); const me = new THREE.Mesh(geo, m); me.castShadow = !LOW; me.receiveShadow = true; out.add(me); });
  keep.forEach(o => { o.updateMatrixWorld(true); const c = o.clone(); c.matrix.copy(o.matrixWorld); c.matrix.decompose(c.position, c.quaternion, c.scale); out.add(c); });
  g.traverse(o => { if (o.isMesh && !o.geometry.userData.shared) o.geometry.dispose(); }); return out; }
export const drop = g => { scene.remove(g); if (g.userData.baked) g.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); };
