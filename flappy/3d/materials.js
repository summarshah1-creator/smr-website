/* materials.js — TEXTURES & BUILDING PARTS. Canvas textures with matching normal maps (pbrTex), bricks, roof tiles, render,
   paving, tarmac, cladding, glass + window interiors, doors, windowSet(), hipRoof(). Give every new surface texture a real-world size
   (the "world" argument of pbrTex, in metres) so bake() tiles it at true scale. Cache materials: never make one per building. */
import * as THREE from 'three';
import { LOW, box, cyl, mat, noise, rod, shade, tex } from './core.js';


export const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const speck = (x, w, h, n, a, R) => { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * a})`; x.fillRect(R() * w, R() * h, 1 + R() * 1.5, 1 + R() * 1.5); } };
export const grey = v => { v = Math.max(0, Math.min(255, v | 0)); return `rgb(${v},${v},${v})`; };
// height picture -> normal map (so bricks, tiles, ribs and paving catch the light)
export const toNormal = (src, str) => { const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), o = x.createImageData(w, h);
  const H = (X, Y) => d[((((Y % h) + h) % h) * w + (((X % w) + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const nx = (H(X - 1, y) - H(X + 1, y)) * str, ny = (H(X, y + 1) - H(X, y - 1)) * str, l = Math.hypot(nx, ny, 1), i = (y * w + X) * 4; o.data[i] = (nx / l * .5 + .5) * 255; o.data[i + 1] = (ny / l * .5 + .5) * 255; o.data[i + 2] = (1 / l * .5 + .5) * 255; o.data[i + 3] = 255; }
  x.putImageData(o, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
// colour + normal map drawn from the same seed. world = metres one copy of the picture covers; bake() lays it on every building at that real size
export let SEED = 1; export const pbrTex = (w, h, draw, world, str = 2) => { const s = SEED++ * 7919; const mk = Hm => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h, Hm, mul(s)); return c; };
  const t = new THREE.CanvasTexture(mk(false)); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.userData = { world, normal: LOW ? null : toNormal(mk(true), str) }; return t; };
export const BT = {}; export const brickTex = (base, mortar) => BT[base + mortar] || (BT[base + mortar] = pbrTex(256, 256, (x, w, h, H, R) => { x.fillStyle = H ? '#1c1c1c' : mortar; x.fillRect(0, 0, w, h);
  for (let r = 0; r < 16; r++) for (let c = -1; c < 9; c++) { const off = r % 2 ? 16 : 0, v = (R() - .5) * 30, burnt = R() < .08 ? -34 : 0, bx = c * 32 + off + 1, by = r * 16 + 1;
    if (H) { x.fillStyle = grey(185 + v); x.fillRect(bx, by, 30, 14); x.fillStyle = grey(215 + v); x.fillRect(bx + 2, by + 2, 26, 10); if (R() < .2) { x.fillStyle = grey(120); x.fillRect(bx + R() * 26, by + R() * 10, 3, 2); } }
    else { x.fillStyle = shade(base, v + burnt); x.fillRect(bx, by, 30, 14); x.fillStyle = 'rgba(0,0,0,.09)'; x.fillRect(bx, by + 11, 30, 3); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(bx, by, 30, 2); } }
  speck(x, w, h, 2600, H ? .3 : .09, R); }, [1.8, 1.2], 2.6));
export const LEAF = (c1, sz = [1.2, 1.2]) => pbrTex(128, 128, (x, w, h, H, R) => { x.fillStyle = H ? '#151515' : shade(c1, -38); x.fillRect(0, 0, w, h);
  for (let i = 0; i < 1100; i++) { const v = (R() - .5) * 56, s = 2 + R() * 4, px = R() * w, py = R() * h, a = R() * 3; x.fillStyle = H ? grey(150 + v * 2) : shade(c1, v); x.beginPath(); x.ellipse(px, py, s, s * .55, a, 0, 7); x.fill(); } }, sz, 3);
export const HEDGE = new THREE.MeshStandardMaterial({ map: LEAF('#3f7a35'), roughness: .95 });
export const stoneTex = tex(256, 256, (x, w, h) => { x.fillStyle = '#e9e3d4'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) { x.fillStyle = '#cfc7b4'; x.fillRect(0, r * 32, w, 2); for (let c = 0; c < 4; c++) x.fillRect(c * 64 + (r % 2) * 32, r * 32, 2, 32); } noise(x, w, h, 2500, .06); });
// what you see through a window: dark room, curtains / nets / blinds, a soft reflection streak
export const winTex = k => tex(128, 160, (x, w, h) => { const R = mul(k * 31 + 5), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#10151b'); g.addColorStop(.6, '#24282c'); g.addColorStop(1, '#38322a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,236,200,.07)'; x.fillRect(w * .15, h * .15, w * .7, h * .55);
  if (k === 3 || k === 6) { x.fillStyle = 'rgba(220,215,200,.6)'; for (let y = 0; y < h; y += 7) x.fillRect(0, y, w, 4); }
  if (k === 2 || k === 5) { x.fillStyle = 'rgba(240,240,235,.6)'; x.fillRect(0, h * .35, w, h * .65); x.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < w; i += 6) x.fillRect(i, h * .35, 2, h * .65); }
  if (k === 1 || k === 4 || k === 5) { const c = k === 4 ? [150, 40, 40] : k === 5 ? [90, 110, 140] : [214, 196, 160]; [0, 1].forEach(s => { const cw = w * (.18 + R() * .14); for (let i = 0; i < cw; i += 3) { const v = Math.sin(i * .9) * 25; x.fillStyle = `rgb(${c[0] + v | 0},${c[1] + v | 0},${c[2] + v | 0})`; x.fillRect(s ? w - i - 3 : i, 0, 3, h); } }); }
  const rg = x.createLinearGradient(0, 0, w, h); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.45, 'rgba(255,255,255,.08)'); rg.addColorStop(.55, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, w, h); });
export const GLASSES = [0, 1, 2, 3, 4, 5, 6].map(k => new THREE.MeshStandardMaterial({ map: winTex(k), roughness: .05, metalness: .25 }));
export const DOORT = {}; export const doorM = c => DOORT[c] || (DOORT[c] = new THREE.MeshStandardMaterial({ roughness: .4, map: tex(64, 128, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2;
  [[8, 52, 20, 30], [36, 52, 20, 30], [8, 90, 20, 30], [36, 90, 20, 30]].forEach(r => x.strokeRect(...r)); x.fillStyle = 'rgba(255,255,255,.12)'; [[9, 53], [37, 53], [9, 91], [37, 91]].forEach(([a, b]) => x.fillRect(a, b, 18, 2));
  const gg = x.createLinearGradient(0, 8, 0, 42); gg.addColorStop(0, '#8fa8ba'); gg.addColorStop(1, '#3e4c58'); x.fillStyle = gg; x.fillRect(8, 8, 48, 34); x.strokeStyle = 'rgba(255,255,255,.5)'; x.strokeRect(8, 8, 48, 34); x.beginPath(); x.moveTo(32, 8); x.lineTo(32, 42); x.stroke();
  x.fillStyle = '#c9b26a'; x.fillRect(22, 86, 20, 3); x.fillRect(52, 70, 3, 12); }) }));
export const GLASS = mat(0x1a242e, { roughness: .04, metalness: .7 }), GLASSL = mat(0x6f94b4, { roughness: .04, metalness: .55 }), WHITE = mat(0xf4f2ec), DARK = mat(0x26252c), FRAME = mat(0xf7f5ef, { roughness: .6 });
// a window set into a wall: dark glass recessed, white frame, sill that sticks out
export function windowSet(g, x, y, w, h, z = 0, sill = true, bars = 1) {
  box(w, h, .06, GLASSES[(Math.random() * GLASSES.length) | 0], x, y, z + .01, g);   // glass, with a white frame round it (four strips, not a solid board)
  box(w + .16, .1, .12, FRAME, x, y + h / 2 + .03, z + .03, g); box(w + .16, .1, .12, FRAME, x, y - h / 2 - .03, z + .03, g); box(.1, h, .12, FRAME, x - w / 2 - .03, y, z + .03, g); box(.1, h, .12, FRAME, x + w / 2 + .03, y, z + .03, g);
  for (let i = 1; i < bars + 1; i++) box(.06, h, .14, FRAME, x - w / 2 + i * w / (bars + 1), y, z + .01, g);
  box(w, .06, .14, FRAME, x, y + h * .18, z + .01, g);
  if (sill) box(w + .3, .1, .3, mat(0xe4ded2), x, y - h / 2 - .1, z + .12, g);
}
// Leagrave Road (B579) parts: hipped roofs for the 1930s semis
export function hipRoof(W, D, R, m, over = .35) {   // hipped roof: rectangle base at y=0 (x -W/2..W/2, z 0..-D), ridge along x
  const w = W / 2 + over, z0 = over, z1 = -D - over, zm = -D / 2, rx = Math.max(0, w - (D / 2 + over));
  const v = [[-w, 0, z0], [w, 0, z0], [w, 0, z1], [-w, 0, z1], [-rx, R, zm], [rx, R, zm]];
  const tri = [[0, 1, 5], [0, 5, 4], [2, 3, 4], [2, 4, 5], [1, 2, 5], [3, 0, 4]], pos = [], uv = [];
  tri.forEach(t => t.forEach(i => { pos.push(...v[i]); uv.push(v[i][0] * .5, (v[i][2] + v[i][1]) * .5); }));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  const me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; if (W < 3.5) return me;
  const grp = new THREE.Group(); grp.add(me); const RM = mat(0x4e3a32, { roughness: .8 }), up = p => [p[0], p[1] + .07, p[2]];
  [[0, 4], [1, 5], [2, 5], [3, 4], [4, 5]].forEach(([a, b]) => { if (a === 4 && rx < .01) return; rod(up(v[a]), up(v[b]), .09, RM, grp); });
  const FS = mat(0xf2f0ea, { roughness: .5 }), GU = mat(0x2b2b2d, { roughness: .45 });
  box(2 * w, .26, .05, FS, 0, -.12, z0 + .02, grp); box(2 * w, .26, .05, FS, 0, -.12, z1 - .02, grp); box(.05, .26, z0 - z1, FS, -w - .02, -.12, (z0 + z1) / 2, grp); box(.05, .26, z0 - z1, FS, w + .02, -.12, (z0 + z1) / 2, grp);
  [z0 + .1, z1 - .1].forEach(z => { const c = cyl(.08, .08, 2 * w, GU, 0, -.02, z, grp, 6); c.rotation.z = Math.PI / 2; });
  return grp; }
export const roofTex = (c) => new THREE.MeshStandardMaterial({ roughness: .8, map: pbrTex(256, 256, (x, w, h, H, R) => { x.fillStyle = H ? '#000' : shade(c, -45); x.fillRect(0, 0, w, h);
  for (let r = 0; r < 16; r++) for (let k = -1; k < 9; k++) { const tx = k * 32 + (r % 2) * 16 + 1, ty = r * 16, v = (R() - .5) * 30;
    if (H) { const gr = x.createLinearGradient(0, ty, 0, ty + 15); gr.addColorStop(0, '#505050'); gr.addColorStop(1, '#f2f2f2'); x.fillStyle = gr; x.fillRect(tx, ty, 30, 15); }
    else { x.fillStyle = shade(c, v); x.fillRect(tx, ty, 30, 14); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(tx, ty + 12, 30, 3); x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(tx, ty, 30, 2); if (R() < .12) { x.fillStyle = 'rgba(95,115,60,.3)'; x.fillRect(tx + R() * 20, ty + 3, 5 + R() * 8, 8); } } }
  speck(x, w, h, 1800, H ? .25 : .08, R); }, [2.4, 3.2], 3) });
export const ROOF_BROWN = roofTex('#7a4a3a'), ROOF_GREY = roofTex('#5a5c62'), ROOF_RED = roofTex('#93503c');
export const renderM = (c) => new THREE.MeshStandardMaterial({ roughness: .95, map: pbrTex(128, 128, (x, w, h, H, R) => { x.fillStyle = H ? '#707070' : c; x.fillRect(0, 0, w, h);   // pebbledash-ish render
  for (let i = 0; i < 2600; i++) { const a = R(), s = 1 + R() * 1.8; x.fillStyle = H ? `rgba(255,255,255,${.25 + a * .55})` : `rgba(${a < .5 ? '0,0,0' : '255,255,255'},${R() * .1})`; x.fillRect(R() * w, R() * h, s, s); } }, [1.3, 1.3], 1.8) });
export const RENDER = [renderM('#f2efe8'), renderM('#e8e2d6'), renderM('#d7d4cd'), renderM('#efe6d2')];
export const LBRICK = [new THREE.MeshStandardMaterial({ map: brickTex('#9a4a34', '#cbbcaa'), roughness: .95 }), new THREE.MeshStandardMaterial({ map: brickTex('#b0603e', '#d0c2b0'), roughness: .95 }), new THREE.MeshStandardMaterial({ map: brickTex('#8e5644', '#c7b9a7'), roughness: .95 })];
export const PAVING = new THREE.MeshStandardMaterial({ roughness: .9, map: pbrTex(128, 128, (x, w, h, H, R) => { x.fillStyle = H ? '#000' : '#7a6f66'; x.fillRect(0, 0, w, h);
  for (let r = 0; r < 16; r++) for (let k = -1; k < 8; k++) { const px = k * 16 + (r % 2) * 8 + 1, py = r * 8 + 1; if (H) { x.fillStyle = grey(190); x.fillRect(px, py, 14, 6); x.fillStyle = grey(225); x.fillRect(px + 1, py + 1, 12, 4); } else { x.fillStyle = shade(['#a89b8c', '#8f7f72', '#b3a596'][(r * 3 + k + (R() * 2 | 0)) % 3], (R() - .5) * 18); x.fillRect(px, py, 14, 6); } }
  speck(x, w, h, 700, H ? .2 : .07, R); }, [1.6, 1.6], 2.2) });
export const TARMAC = new THREE.MeshStandardMaterial({ roughness: .9, map: pbrTex(512, 512, (x, w, h, H, R) => { x.fillStyle = H ? '#808080' : '#4d5057'; x.fillRect(0, 0, w, h); speck(x, w, h, 26000, H ? .55 : .13, R);
  if (!H) { for (let i = 0; i < 7; i++) { x.fillStyle = `rgba(0,0,0,${.05 + R() * .07})`; x.beginPath(); x.ellipse(R() * w, R() * h, 20 + R() * 60, 10 + R() * 40, R() * 3, 0, 7); x.fill(); } x.fillStyle = '#e2e0d8'; for (let i = 0; i < 8; i++) x.fillRect(i * 64, 0, 4, 180); } }, [20, 20], 1.2) });
export const CLAD = (c) => new THREE.MeshStandardMaterial({ roughness: .5, metalness: .35, map: pbrTex(128, 128, (x, w, h, H, R) => { x.fillStyle = H ? '#404040' : c; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 16) { if (H) { x.fillStyle = grey(160); x.fillRect(i, 0, 2, h); x.fillRect(i + 8, 0, 2, h); x.fillStyle = grey(240); x.fillRect(i + 2, 0, 6, h); } else { x.fillStyle = 'rgba(255,255,255,.17)'; x.fillRect(i + 2, 0, 3, h); x.fillStyle = 'rgba(0,0,0,.17)'; x.fillRect(i + 8, 0, 3, h); } }
  if (!H) for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(60,50,40,.06)'; x.fillRect(R() * w, 0, 2 + R() * 6, h * (.3 + R() * .7)); }   // rain streaks
  speck(x, w, h, 500, H ? .15 : .05, R); }, [2.4, 2.4], 3) });
export const CLAD_GREY = CLAD('#b9bdc2'), CLAD_BLUE = CLAD('#244f9e'), CLAD_WHITE = CLAD('#e8e9ea');
export const forecourt = (g, W, D, m = TARMAC) => { const t = new THREE.Mesh(new THREE.PlaneGeometry(W, D), m); t.rotation.x = -Math.PI / 2; t.position.set(0, .03, -D / 2); t.receiveShadow = true; g.add(t); };
