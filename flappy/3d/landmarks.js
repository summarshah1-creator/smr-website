/* landmarks.js — LANDMARKS. Galaxy, Town Hall (live clock), Central Mosque, Chaiikhana, madrasa. PLAN = pipe-game town order. */
import * as THREE from 'three';
import { BUILD, box, cyl, mat, noise, signPanel, tex } from './core.js';
import { DARK, GLASS, PAVING, RENDER, ROOF_BROWN, brickTex, forecourt, hipRoof, stoneTex, windowSet } from './materials.js';


// ---- The Galaxy: curved drum, overhanging roof edge, mesh cladding, raised letters, sign boards, banded base ----
export const meshTex = tex(512, 512, (x, w, h) => { x.fillStyle = '#a49886'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) for (let j = 0; j < h; j += 4) { if ((i + j) / 4 % 2) { x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(i, j, 4, 4); } }
  x.fillStyle = 'rgba(70,60,50,.55)'; for (let i = 0; i < w; i += 64) x.fillRect(i, 0, 3, h); x.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 3; i < w; i += 64) x.fillRect(i, 0, 2, h);
  noise(x, w, h, 3000, .05); }, 6, 1);
export const bandTex = tex(256, 256, (x, w, h) => { for (let y = 0; y < h; y += 32) { x.fillStyle = '#dcbba3'; x.fillRect(0, y, w, 22); x.fillStyle = '#bd9d86'; x.fillRect(0, y + 22, w, 10); for (let c = (y / 32 % 2) * 32; c < w; c += 64) { x.fillStyle = '#c7a890'; x.fillRect(c, y, 2, 22); } } noise(x, w, h, 1200, .06); }, 8, 2);
export const FONT5 = { G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"], A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"], X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"], Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"] };
export const SBT = new Map(); export function signBoard(g, w, h, draw, x, y, z, ry = 0) { let t = SBT.get(draw.toString() + w + h); if (!t) { t = tex(256, Math.round(256 * h / w), (c, W, H) => draw(c, W, H)); SBT.set(draw.toString() + w + h, t); } const s = new THREE.Group();
  box(w + .2, h + .2, .25, mat(0xdedede, { roughness: .4 }), 0, 0, 0, s); const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .35 })); f.position.z = .13; s.add(f);
  s.position.set(x, y, z); s.rotation.y = ry; g.add(s); return s; }
BUILD.galaxy = () => { const g = new THREE.Group(), R = 26, ARC = 1.15, H = 17;
  // wing on the left: banded piers with dark recesses between them
  const wing = new THREE.Group(); g.add(wing); const WW = 16; wing.position.x = -22;
  box(WW, 12, 14, new THREE.MeshStandardMaterial({ map: bandTex, roughness: .9 }), 0, 6, -7.5, wing);
  for (let i = 0; i < 4; i++) { const px = -WW / 2 + 2 + i * 4; box(2.2, 9, .8, DARK, px, 4.5, -.3, wing); box(1, 1.8, .1, mat(0x2f7fd0, { roughness: .4 }), px, 6, .15, wing); }
  box(WW, 3, 14, mat(0x9aa4ae, { roughness: .3, metalness: .4 }), 0, 13.5, -7.5, wing); box(WW + .4, .6, 14.6, mat(0xe0d4bc), 0, 15.2, -7.5, wing);
  // the drum: a slice of a big cylinder bulging towards the street
  const cz = -R + 3; const drum = new THREE.Group(); drum.position.set(4, 0, cz); g.add(drum);
  const seg = (r, h, y, m, open = false) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48, 1, open, -ARC / 2, ARC), m); c.position.y = y; c.castShadow = c.receiveShadow = true; drum.add(c); return c; };
  seg(R - .3, 5, 2.5, new THREE.MeshStandardMaterial({ map: bandTex, roughness: .9 }));
  seg(R, 10, 10, new THREE.MeshStandardMaterial({ map: meshTex, roughness: .8 }));
  seg(R - .2, 1.4, 15.7, mat(0xc7d3dd, { roughness: .15, metalness: .5 }));   // clerestory glass
  seg(R + .5, 1.2, 17, mat(0xe7dcc4, { roughness: .6 }));                        // overhanging cream coping
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(R + .5, R + .5, .3, 48, 1, false, -ARC / 2, ARC), mat(0xf5eee0)); cap.position.y = 17.7; drum.add(cap);
  // steel rails round the drum
  [6.2, 12.4, 13.6].forEach(y => { const t = new THREE.Mesh(new THREE.TorusGeometry(R + .08, .07, 4, 64, ARC), mat(0xd9d4ca, { metalness: .6, roughness: .3 })); t.rotation.x = Math.PI / 2; t.rotation.z = Math.PI / 2 - ARC / 2; t.position.y = y; drum.add(t); });
  // raised letters GALAXY | GALAXY following the curve (each pixel a little block)
  const LM = mat(0xf6f4ef, { roughness: .4 }); const word = 'GALAXY|GALAXY', px = .3; const total = word.length * 2.1;
  [...word].forEach((ch, k) => { const ang = (k * 2.1 - total / 2 + 1) / R; const lg = new THREE.Group(); lg.position.set(Math.sin(ang) * (R + .12), 0, Math.cos(ang) * (R + .12)); lg.rotation.y = ang; drum.add(lg);
    if (ch === '|') { box(.12, 2.8, .1, LM, 0, 14.0 - 1.2, 0, lg); return; }
    FONT5[ch].forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') box(px, px, .2, LM, (i - 2) * px, 13.9 - j * px, 0, lg); })); });
  // sign boards fixed to the drum
  const boards = [[-.33, 2.2, 3.2, (x, w, h) => { x.fillStyle = '#2f8fd8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7ad050'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, h * .38, w * .2, 0, 7); x.stroke(); x.fillStyle = '#fff'; x.fillRect(w * .25, h * .7, w * .5, 10); }],
    [-.2, 2.6, 3.6, (x, w, h) => { x.fillStyle = '#d42b2b'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.fillText('FEEL', w / 2, 60); x.fillText('GOOD', w / 2, 96); x.beginPath(); const cx = w / 2, cy = h * .66; x.moveTo(cx, cy + 40); x.bezierCurveTo(cx - 70, cy - 10, cx - 30, cy - 60, cx, cy - 20); x.bezierCurveTo(cx + 30, cy - 60, cx + 70, cy - 10, cx, cy + 40); x.fill(); }],
    [-.05, 3.4, 3.6, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); [[.42, '#3aa043'], [.34, '#f5d23c'], [.25, '#2e8fe0']].forEach(([r, c]) => { x.fillStyle = c; x.beginPath(); x.arc(w / 2, h / 2, w * r, 0, 7); x.fill(); }); x.fillStyle = '#fff'; x.beginPath(); x.arc(w * .44, h * .45, 9, 0, 7); x.arc(w * .56, h * .45, 9, 0, 7); x.fill(); }],
    [.17, 3.2, 3.6, (x, w, h) => { x.fillStyle = '#fbf8fb'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8795a'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.fillText('tenpin', w / 2, h * .4); x.strokeStyle = '#b874c8'; x.lineWidth = 10; x.beginPath(); x.arc(w / 2, h * .72, 34, 0, 7); x.stroke(); }],
    [.32, 3.0, 3.4, (x, w, h) => { x.fillStyle = '#2b2b30'; x.fillRect(0, 0, w, h); x.fillStyle = '#e03030'; x.font = 'bold 60px sans-serif'; x.fillText('★', 20, h * .6); x.fillStyle = '#eee'; x.fillRect(w * .45, h * .45, w * .45, 18); }]];
  boards.forEach(([a, w, h, d]) => signBoard(drum, w, h, d, Math.sin(a) * (R + .25), 8.6, Math.cos(a) * (R + .25), a));
  // ground floor: shutter set back into the wall, red post box, bin
  const sa = .1; const sh = new THREE.Group(); sh.position.set(Math.sin(sa) * (R - .6), 0, Math.cos(sa) * (R - .6)); sh.rotation.y = sa; drum.add(sh);
  box(6, 4.3, .2, mat(0x8f979e, { roughness: .5, metalness: .4 }), 0, 2.15, 0, sh); for (let y = .3; y < 4.3; y += .3) box(6, .05, .26, mat(0xb6bdc3, { metalness: .5, roughness: .4 }), 0, y, 0, sh);
  const pb = cyl(.32, .32, 1.4, mat(0xc8202a, { roughness: .4 }), 0, .7, 0, null, 16); const pbt = cyl(.38, .38, .14, mat(0xa81a22), 0, 1.45, 0, null, 16); const po = new THREE.Group(); po.add(pb, pbt); po.position.set(Math.sin(.24) * (R + 1), 0, Math.cos(.24) * (R + 1)); drum.add(po);
  return { g, w: 46 };
};
// ---- Luton Town Hall: white stone, window grid, copper roof, clock tower, portico, memorial ----
export const clockTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.draw = () => { const x = c.getContext('2d'), d = new Date();
  x.fillStyle = '#efe6cf'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#f7f1e2'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.strokeStyle = '#b98f2e'; x.lineWidth = 6; x.stroke(); x.fillStyle = '#2a2a2a';
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.fillRect(64 + Math.sin(a) * 48 - 2, 64 - Math.cos(a) * 48 - 2, 4, 4); }
  const hand = (a, l, w) => { x.lineWidth = w; x.beginPath(); x.moveTo(64, 64); x.lineTo(64 + Math.sin(a) * l, 64 - Math.cos(a) * l); x.stroke(); }; x.strokeStyle = '#222';
  hand((d.getHours() % 12 + d.getMinutes() / 60) / 12 * 6.283, 30, 6); hand(d.getMinutes() / 60 * 6.283, 44, 4); t.needsUpdate = true; }; t.userData.draw(); return t; })();
BUILD.townhall = () => { const g = new THREE.Group(), W = 38, H = 13, D = 16, SM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: .9 });
  box(W, H, D, SM, 0, H / 2, -D / 2, g);
  box(W + .6, .5, D + .6, mat(0xf1ebdc), 0, H + .1, -D / 2, g); box(W + .3, .3, .5, mat(0xd9d1bf), 0, 4.6, .15, g);   // cornice + string course
  // copper mansard roof with dormers
  const rfg = new THREE.CylinderGeometry(.7, 1, 1, 4, 1); rfg.rotateY(Math.PI / 4); const rf = new THREE.Mesh(rfg, mat(0x5f9c86, { roughness: .6, metalness: .2 })); rf.scale.set(W * .71, 2.2, D * .71); rf.position.set(0, H + 1.4, -D / 2); rf.castShadow = true; g.add(rf);
  for (let i = -7; i <= 7; i++) if (Math.abs(i) > 1) { box(1, 1, .6, mat(0x6ea995), i * 2.4, H + 1.3, -.9, g); box(.6, .6, .1, GLASS, i * 2.4, H + 1.3, -.58, g); }
  // window grid with deep reveals
  for (let fl = 0; fl < 3; fl++) for (let i = -7; i <= 7; i++) { if (Math.abs(i) < 2) continue; const y = 2.4 + fl * 3.6; box(1.4, 2.2, .5, mat(0xdcd4c2), i * 2.4, y, -.2, g); windowSet(g, i * 2.4, y, 1.05, 1.9, .06, fl > 0, 1); }
  // portico: steps, 4 columns, pediment
  for (let s = 0; s < 4; s++) box(10 - s * .5, .25, 2.4 - s * .5, mat(0xe4ddcd), 0, .12 + s * .25, 2.6 - s * .25, g);
  for (let i = 0; i < 4; i++) { const cx = -3.3 + i * 2.2; cyl(.42, .48, 7.6, mat(0xf2eee4), cx, 4.8, 2.4, g, 16); box(1.1, .3, 1.1, mat(0xe6dfcf), cx, 8.7, 2.4, g); box(1.1, .3, 1.1, mat(0xe6dfcf), cx, 1.1, 2.4, g); }
  box(9, .8, 2.8, mat(0xefe9da), 0, 9.2, 2.2, g);
  const ped = new THREE.Shape(); ped.moveTo(-4.8, 0); ped.lineTo(4.8, 0); ped.lineTo(0, 2); ped.lineTo(-4.8, 0); const pg = new THREE.Mesh(new THREE.ExtrudeGeometry(ped, { depth: 2.8, bevelEnabled: false }), mat(0xf3eee2)); pg.position.set(0, 9.6, .8); pg.castShadow = true; g.add(pg);
  box(2.2, 3.4, .3, mat(0x7a3a22, { roughness: .5 }), 0, 2.7, .35, g);
  // clock tower rising from the middle, set back
  const T = new THREE.Group(); T.position.set(0, H, -5); g.add(T);
  box(6, 18, 6, SM, 0, 9, 0, T); box(6.6, .5, 6.6, mat(0xf1ebdc), 0, 18.2, 0, T); box(5, 3, 5, SM, 0, 19.9, 0, T); box(5.6, .4, 5.6, mat(0xf1ebdc), 0, 21.6, 0, T); box(3, 2.2, 3, SM, 0, 22.9, 0, T); box(3.4, .3, 3.4, mat(0xf1ebdc), 0, 24.1, 0, T);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshStandardMaterial({ map: clockTex, roughness: .5 })); const a = i * Math.PI / 2; f.position.set(Math.sin(a) * 3.03, 14.5, Math.cos(a) * 3.03); f.rotation.y = a; T.add(f);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.75, .12, 6, 32), mat(0xc9a24a, { metalness: .7, roughness: .3 })); rim.position.copy(f.position); rim.rotation.y = a; T.add(rim); }
  for (let k = -1; k <= 1; k++) { const s = box(.6, 7, .3, mat(0x323a46, { roughness: .3 }), k * 1.4, 7, 3.0, T); }
  // flags on the roof (Luton colours), war memorial in front
  [-14, 14].forEach(fx => { cyl(.06, .06, 5, mat(0xeeeeee, { metalness: .6 }), fx, H + 2.5, -1, g, 6); const fl = box(1.6, 1, .05, mat(0x1f5aa8), fx + .82, H + 4.4, -1, g); fl.userData.flag = 1; });
  const mem = new THREE.Group(); mem.position.set(8, 0, 6); g.add(mem); box(2, 1, 2, mat(0xcfc8b8), 0, .5, 0, mem); box(1.2, 4, 1.2, mat(0xd9d2c2), 0, 3, 0, mem);
  const bronze = mat(0x3d4a3e, { metalness: .5, roughness: .45 }); cyl(.25, .3, 1.2, bronze, 0, 5.6, 0, mem, 8); const hd = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 8), bronze); hd.position.set(0, 6.4, 0); mem.add(hd); box(.12, 1.2, .12, bronze, .3, 6.5, 0, mem);
  return { g, w: 44 };
};
// ---- Luton Central Mosque: red brick, tall arched recesses, green dome, minaret, gold railings ----
export const archTex = tex(256, 512, (x, w, h) => { const b = brickTex('#b24a2c', '#c58a6c').image; x.drawImage(b, 0, 0, w, h / 2); x.drawImage(b, 0, h / 2, w, h / 2); });
BUILD.masjid = () => { const g = new THREE.Group(), W = 26, H = 10, D = 16; const BM = new THREE.MeshStandardMaterial({ map: brickTex('#b44c2e', '#c98e70'), roughness: .9 });
  box(W, H, D, BM, 0, H / 2, -D / 2, g); box(W + .4, .4, D + .4, mat(0x9a3c22), 0, H + .2, -D / 2, g);
  // tall arched recesses (real depth: dark inset with a round top)
  for (let i = 0; i < 7; i++) { const x = -W / 2 + 2.2 + i * 3.6; box(1.8, 6.5, .5, mat(0x8a3a22), x, 4.2, -.2, g); const a = cyl(.9, .9, .5, mat(0x8a3a22), x, 7.45, -.2, g, 16, false, 0, Math.PI); a.rotation.x = Math.PI / 2; a.rotation.z = Math.PI / 2;
    box(1.2, 4.4, .1, GLASS, x, 3.8, .06, g); const aa = cyl(.6, .6, .12, GLASS, x, 6.0, .06, g, 16, false, 0, Math.PI); aa.rotation.x = Math.PI / 2; aa.rotation.z = Math.PI / 2; }
  // green name board on the front
  signBoard(g, 9, 1.8, (x, w, h) => { x.fillStyle = '#17603a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8d38a'; x.lineWidth = 4; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 15px sans-serif'; x.fillText('LUTON CENTRAL MOSQUE', w / 2, h * .68); x.font = 'bold 14px serif'; x.fillText('مسجد', w / 2, h * .33); }, -6, H - 1.3, .3);
  // drum + green dome + crescent
  const DG = new THREE.Group(); DG.position.set(4, H, -7); g.add(DG);
  cyl(5, 5, 2.4, BM, 0, 1.2, 0, DG, 24); cyl(5.3, 5.3, .3, mat(0x9a3c22), 0, 2.5, 0, DG, 24);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const w = box(.8, 1.4, .2, GLASS, Math.sin(a) * 5.02, 1.3, Math.cos(a) * 5.02, DG); w.rotation.y = a; }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x5e9a6a, { roughness: .45, metalness: .25 })); dome.position.y = 2.6; dome.castShadow = true; DG.add(dome);
  const gold = mat(0xd8b44a, { metalness: .85, roughness: .25 }); cyl(.12, .12, 1.6, gold, 0, 8.3, 0, DG, 8); const cr = new THREE.Mesh(new THREE.TorusGeometry(.5, .1, 6, 16, Math.PI * 1.3), gold); cr.position.y = 9.4; cr.rotation.z = -.6; DG.add(cr);
  // minaret
  const M = new THREE.Group(); M.position.set(-W / 2 + 1.6, 0, -3); g.add(M);
  cyl(1.1, 1.25, 24, BM, 0, 12, 0, M, 12); for (let k = 0; k < 3; k++) cyl(1.35, 1.35, .3, mat(0x9a3c22), 0, 6 + k * 7, 0, M, 12);
  cyl(1.8, 1.4, .8, mat(0xd8cfc0), 0, 24.4, 0, M, 16); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; cyl(.04, .04, .8, gold, Math.sin(a) * 1.75, 25.2, Math.cos(a) * 1.75, M, 4); }
  cyl(.9, .9, 2.4, BM, 0, 26, 0, M, 12); const md = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 12), mat(0x5e9a6a, { roughness: .45, metalness: .25 })); md.position.y = 28.4; M.add(md); cyl(.06, .06, 1, gold, 0, 30, 0, M, 6);
  // low wall with gold railings, open gates
  box(W + 2, .9, .5, BM, 0, .45, 3.2, g); for (let x = -W / 2 - .8; x <= W / 2 + .8; x += .35) { if (Math.abs(x - 2) < 1.6) continue; cyl(.03, .03, 1.3, gold, x, 1.55, 3.2, g, 4); }
  box(W + 2, .06, .06, gold, 0, 2.15, 3.2, g);
  return { g, w: 30 };
};
// ---- Chaiikhana: dark timber kiosk, open serving hatch, big sign box, pink menu ----
export let WOODT; BUILD.chaiikhana = () => { const g = new THREE.Group(), W = 6, H = 3.6, D = 4; const wood = new THREE.MeshStandardMaterial({ map: WOODT || (WOODT = tex(128, 128, (x, w, h) => { x.fillStyle = '#30343a'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 12) { x.fillStyle = '#25282d'; x.fillRect(0, y, w, 2); } noise(x, w, h, 500, .06); }, 3, 2)), roughness: .8 });
  box(W, H, D, wood, 0, H / 2, -D / 2, g);
  // hatch: recess with lit inside, counter sticking out
  box(3.6, 1.6, .1, mat(0xffe7b0, { emissive: 0x6a4a20, emissiveIntensity: .6 }), -.6, 2.1, -.9, g); box(3.6, .08, 1.0, DARK, -.6, 2.95, -.45, g); box(3.6, 1.7, .05, mat(0x1d1f24), -.6, 2.15, -1.0, g);
  for (let i = 0; i < 2; i++) cyl(.18, .18, .5, mat(0xc0c4ca, { metalness: .9, roughness: .2 }), -1.8 + i * .6, 1.6, -.6, g, 12);
  box(4, .12, .6, mat(0x3a3e45), -.6, 1.3, .2, g);
  box(3.6, .9, .06, mat(0x1d1f24), -.6, .75, .02, g);
  signBoard(g, 5.4, 1.1, (x, w, h) => { x.fillStyle = '#26282d'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2f2f2'; x.font = '600 34px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('chaiikhana', w / 2, h / 2 + 2); }, 0, H + .55, .25);
  signBoard(g, .9, 1.8, (x, w, h) => { x.fillStyle = '#e0457a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; for (let i = 0; i < 14; i++) x.fillRect(10, 30 + i * 30, w - 20, 8); }, 2.4, 1.9, .2);
  cyl(.35, .3, 1, mat(0x1c1c1c), 2.6, .5, 1.2, g, 12);
  return { g, w: 9 };
};
// the masjid & madrasa: cream render, arched windows, white wall with a sign board
BUILD.madrasa = () => { const g = new THREE.Group(), W = 16, H = 6.4, D = 12; const cm = RENDER[3];
  box(W, H, D, cm, 0, H / 2, -5 - D / 2, g); const rf = hipRoof(W, D, 2.2, ROOF_BROWN); rf.position.set(0, H, -5); g.add(rf);
  for (let i = 0; i < 3; i++) { const x = -4.5 + i * 4.5; box(1.6, 1.8, .1, GLASS, x, 1.6, -4.97, g); const a = new THREE.Mesh(new THREE.CircleGeometry(.8, 16, 0, Math.PI), GLASS); a.position.set(x, 2.5, -4.9); g.add(a);
    const fr = new THREE.Mesh(new THREE.TorusGeometry(.85, .07, 4, 16, Math.PI), mat(0xffffff)); fr.position.set(x, 2.5, -4.9); g.add(fr); windowSet(g, x, 4.8, 2, 1.2, -4.97, true, 1); }
  box(W + 2, 1.2, .35, mat(0xf4f4f2), 0, .6, -.3, g); box(W + 2, .1, .45, mat(0xdcdcd6), 0, 1.25, -.3, g);
  const sb = new THREE.Group(); sb.position.set(-W / 2 + 2.5, 0, -.1); g.add(sb); [-1, 1].forEach(x => box(.1, 2.4, .1, DARK, x, 1.2, 0, sb));
  signPanel(sb, 2.4, 1.6, tex(160, 110, (x, w, h) => { x.fillStyle = '#f4f7f2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1d6a3a'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#1d6a3a'; x.textAlign = 'center'; x.font = 'bold 16px serif'; x.fillText('MASJID', w / 2, 40); x.fillText('& MADRASA', w / 2, 66); x.font = '12px serif'; x.fillText('High School', w / 2, 90); }), 0, 2, .06);
  forecourt(g, W + 2, 5, PAVING); return { g, w: W + 2 }; };
export const PLAN = ['terrace', 'galaxy', 'shops', 'terrace', 'townhall', 'chaiikhana', 'terrace', 'masjid', 'shops', 'terrace'];
