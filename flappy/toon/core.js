/* toon/core.js — ENGINE for "Kabootar Rush: Luton" (cartoon runner).
   Renderer, warm cartoon lighting, the curved-world bend (every material goes through curve()), cached materials (M),
   rounded-shape helpers (part maker P), crisp canvas signs, world-sized textures, and bake() which merges a building
   into one mesh per material with soft ground shading painted into the vertices. */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from '../3d/BufferGeometryUtils.js';
export { THREE, mergeGeometries, mergeVertices };
export const qs = new URLSearchParams(location.search);
let lowSaved = '0'; try { lowSaved = localStorage.getItem('kr_low') || '0'; } catch (e) { }
export const LOW = qs.get('low') === '1' || lowSaved === '1';
export const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1.25 : 2.5)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
export const MAXANI = renderer.capabilities.getMaxAnisotropy();
export const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xcfe6fb, 90, 240);
export const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .3, 420);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
export const hemi = new THREE.HemisphereLight(0xcfe6ff, 0xe8c9a0, 1.05); scene.add(hemi);
export const sun = new THREE.DirectionalLight(0xfff0d8, 2.3); sun.castShadow = !LOW; sun.shadow.mapSize.set(1024, 1024);
{ const c = sun.shadow.camera; c.left = -16; c.right = 16; c.top = 22; c.bottom = -12; c.near = 1; c.far = 90; sun.shadow.bias = -.0005; sun.shadow.normalBias = .04; sun.shadow.radius = 3; }
scene.add(sun, sun.target);

// ---- the curved world: everything bends down and slightly sideways with distance (in view space) ----
export const CURVE = { value: new THREE.Vector2(.0017, -.0005) };
const bend = s => { s.uniforms.uCurve = CURVE; s.vertexShader = 'uniform vec2 uCurve;\n' + s.vertexShader.replace('#include <project_vertex>',
  '#include <project_vertex>\n{ float zz = min(mvPosition.z, 0.0); mvPosition.y -= uCurve.x * zz * zz; mvPosition.x += uCurve.y * zz * zz; gl_Position = projectionMatrix * mvPosition; }'); };
export const curve = m => { m.onBeforeCompile = bend; m.customProgramCacheKey = () => 'curve'; return m; };

// ---- materials: cached, curved. vcM() = the same look with vertex shading (used by bake) ----
const MC = new Map(); export const M = (c, o = {}) => { const k = c + '|' + JSON.stringify(o, (k, v) => v && v.isTexture ? v.uuid : v); if (!MC.has(k)) MC.set(k, curve(new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, metalness: 0 }, o)))); return MC.get(k); };
export const BASIC = (c, o = {}) => { const k = 'b' + c + JSON.stringify(o, (k, v) => v && v.isTexture ? v.uuid : v); if (!MC.has(k)) MC.set(k, curve(new THREE.MeshBasicMaterial(Object.assign({ color: c }, o)))); return MC.get(k); };
const VC = new Map(); const vcM = m => { if (!VC.has(m)) { const n = m.clone(); n.vertexColors = true; curve(n); VC.set(m, n); } return VC.get(m); };

// ---- canvas textures (sharp: 2x, mipmaps, anisotropy) ----
export const FONT = '"Lilita One", "Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
export const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAXANI; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; };
export const rr = (x, X, Y, W, H, R) => { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); };
// shop / street sign: rounded board, gradient, bold rounded letters with an outline and a soft shine
export const signTex = (txt, o = {}) => canvasTex(o.w || 1024, o.h || 256, (x, w, h) => {
  const bg = o.bg || '#e8332a', fg = o.fg || '#fff', R = o.r ?? h * .22;
  if (bg !== 'none') { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, o.bg2 || shadeHex(bg, 26)); g.addColorStop(1, bg); x.fillStyle = g; rr(x, 4, 4, w - 8, h - 8, R); x.fill();
    if (o.border) { x.lineWidth = h * .05; x.strokeStyle = o.border; rr(x, h * .05, h * .05, w - h * .1, h - h * .1, R * .85); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.16)'; rr(x, 10, 8, w - 20, h * .38, R * .8); x.fill(); }
  const sub = o.sub; let fs = (o.size || .56) * h * (sub ? .82 : 1); x.font = `${fs}px ${FONT}`; while (x.measureText(txt).width > w * .9 && fs > 10) { fs -= 4; x.font = `${fs}px ${FONT}`; }
  x.textAlign = 'center'; x.textBaseline = 'middle'; const ty = sub ? h * .4 : h * .53;
  if (o.stroke !== false) { x.lineJoin = 'round'; x.lineWidth = fs * .16; x.strokeStyle = o.stroke || 'rgba(0,0,0,.35)'; x.strokeText(txt, w / 2, ty + fs * .04); }
  x.fillStyle = fg; x.fillText(txt, w / 2, ty);
  if (sub) { const s2 = h * .2; x.font = `${s2}px ${FONT}`; x.fillStyle = o.subc || fg; x.fillText(sub, w / 2, h * .78); } });
export function shadeHex(hex, v) { const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, ((n >> s) & 255) + v)); return '#' + ((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0'); }
// textures laid at real-world size by bake(): t.userData.world = [metres across, metres up]
export const worldTex = (w, h, draw, world) => { const t = canvasTex(w, h, draw, true); t.userData.world = world; return t; };

// ---- shapes ----
const RBG = new Map();
export const rboxGeo = (w, h, d, r) => { r = Math.min(r, w / 2.05, h / 2.05, d / 2.05); const k = [w, h, d, r].map(v => v.toFixed(3)).join(); if (RBG.has(k)) return RBG.get(k);
  const b = r * .7, W = w - 2 * b, Hh = h - 2 * b, q = Math.max(.001, Math.min(r * .8, W / 2 - .001, Hh / 2 - .001)), s = new THREE.Shape();
  s.moveTo(-W / 2 + q, -Hh / 2); s.lineTo(W / 2 - q, -Hh / 2); s.quadraticCurveTo(W / 2, -Hh / 2, W / 2, -Hh / 2 + q); s.lineTo(W / 2, Hh / 2 - q); s.quadraticCurveTo(W / 2, Hh / 2, W / 2 - q, Hh / 2); s.lineTo(-W / 2 + q, Hh / 2); s.quadraticCurveTo(-W / 2, Hh / 2, -W / 2, Hh / 2 - q); s.lineTo(-W / 2, -Hh / 2 + q); s.quadraticCurveTo(-W / 2, -Hh / 2, -W / 2 + q, -Hh / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 4 }); g.translate(0, 0, -(d - 2 * b) / 2); g.computeVertexNormals(); g.userData.shared = 1; RBG.set(k, g); return g; };
// part maker bound to a group: every call returns the mesh
export function P(g) {
  const add = (geo, m, x = 0, y = 0, z = 0, rot) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (rot) me.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  return {
    add,
    box: (w, h, d, m, x, y, z, r = .06, rot) => add(r > 0 ? rboxGeo(w, h, d, r) : new THREE.BoxGeometry(w, h, d), m, x, y, z, rot),
    cyl: (rt, rb, h, m, x, y, z, seg = 24, rot) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, rot),
    sph: (r, m, x, y, z, s = [1, 1, 1], seg = 24) => { const me = add(new THREE.SphereGeometry(r, seg, Math.ceil(seg * .75)), m, x, y, z); me.scale.set(...s); return me; },
    cap: (r, l, m, x, y, z, rot) => add(new THREE.CapsuleGeometry(r, l, 6, 16), m, x, y, z, rot),
    tor: (r, t, m, x, y, z, rot, arc = Math.PI * 2) => add(new THREE.TorusGeometry(r, t, 12, 32, arc), m, x, y, z, rot),
    lathe: (pts, m, x, y, z, seg = 32) => add(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), m, x, y, z),
    plane: (w, h, m, x, y, z, rot) => add(new THREE.PlaneGeometry(w, h), m, x, y, z, rot),
    shape: (pts, depth, m, x, y, z, rot, bev = .06) => { const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach(p => p.length === 2 ? s.lineTo(...p) : s.quadraticCurveTo(...p)); const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 10 }); geo.translate(0, 0, -depth / 2); return add(geo, m, x, y, z, rot); },
    rod: (a, b, r, m, seg = 10) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), L = A.distanceTo(Bv); const me = add(new THREE.CylinderGeometry(r, r, L, seg), m); me.position.copy(A).add(Bv).multiplyScalar(.5); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Bv.clone().sub(A).normalize()); return me; },
    sign: (tex, w, h, x, y, z, ry = 0, depth = .18, frame = 0x2a2d33) => { const fm = M(frame, { roughness: .5 }); add(rboxGeo(w + .16, h + .16, depth, .07), fm, x, y, z - depth / 2, [0, ry, 0]); const pm = sigM(tex); const p = add(new THREE.PlaneGeometry(w, h), pm, x + Math.sin(ry) * .01, y, z + .005 + Math.cos(ry) * .0, [0, ry, 0]); p.castShadow = false; return p; },
  };
}
const SM = new Map(); export const sigM = t => { if (!SM.has(t)) SM.set(t, curve(new THREE.MeshStandardMaterial({ map: t, roughness: .45, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .18 }))); return SM.get(t); };

// ---- hip roof (rectangle footprint W x D at y=0, z from 0 back to -D), rounded ridge ----
export function hipRoof(W, D, R, m, over = .4) { const w = W / 2 + over, z0 = over, z1 = -D - over, rx = Math.max(0, w - (z0 - z1) / 2), zm = (z0 + z1) / 2;
  const v = [[-w, 0, z0], [w, 0, z0], [w, 0, z1], [-w, 0, z1], [-rx, R, zm], [rx, R, zm]], f = [[0, 1, 5], [0, 5, 4], [1, 2, 5], [2, 3, 4], [2, 4, 5], [3, 0, 4]], pos = [], uv = [];
  f.forEach(t => t.forEach(i => { pos.push(...v[i]); uv.push(v[i][0] * .5, v[i][2] * .5); })); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  const grp = new THREE.Group(), me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; grp.add(me); const p = P(grp), RM = M(0x8a3f2c, { roughness: .6 }), up = a => [a[0], a[1] + .05, a[2]];
  [[0, 4], [1, 5], [2, 5], [3, 4], [4, 5]].forEach(([a, b]) => { if (a === 4 && rx < .01) return; p.rod(up(v[a]), up(v[b]), .11, RM); });
  const FS = M(0xffffff, { roughness: .45 }); p.box(2 * w, .3, .1, FS, 0, -.12, z0, .04); p.box(2 * w, .3, .1, FS, 0, -.12, z1, .04); p.box(.1, .3, z0 - z1, FS, -w, -.12, zm, .04); p.box(.1, .3, z0 - z1, FS, w, -.12, zm, .04);
  return grp; }

// ---- bake: one mesh per material, soft shading near the ground, world-sized textures ----
function worldUV(geo, ws) { const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i)); let u, v;
    if (ny > .9) { u = x; v = z; } else { v = y / Math.max(.25, Math.sqrt(1 - ny * ny)); u = nx > nz ? z : x; } uv[i * 2] = u / ws[0]; uv[i * 2 + 1] = v / ws[1]; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
export function bake(g) { g.updateMatrixWorld(true); const by = new Map();
  g.traverse(o => { if (!o.isMesh) return; let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(o.matrixWorld);
    for (const a of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(a)) geo.deleteAttribute(a); geo.clearGroups();
    if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    const ws = o.material.map && o.material.map.userData.world; if (ws) worldUV(geo, ws);
    if (!by.has(o.material)) by.set(o.material, []); by.get(o.material).push({ geo, cast: o.castShadow }); });
  const out = new THREE.Group();
  by.forEach((list, m) => { const geo = mergeGeometries(list.map(l => l.geo)); const p = geo.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), v = .62 + .38 * Math.min(1, Math.max(0, y / 2.4)) ** .8; c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = v; }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); const me = new THREE.Mesh(geo, vcM(m)); me.castShadow = list.some(l => l.cast); me.receiveShadow = true; out.add(me); });
  g.traverse(o => { if (o.isMesh && !o.geometry.userData.shared) o.geometry.dispose(); }); out.userData.baked = 1; return out; }
export const drop = g => { scene.remove(g); if (g.userData.baked) g.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); };
