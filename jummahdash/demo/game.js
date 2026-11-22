/* Jummah Dash — demo v0.1 (an SMR Original). Landscape side-scroller: hold to fly with the pressure-cooker jetpack.
   World units: the screen is 320 units tall; buildings/cars come from the Flappy Kabootar drawing code, rendered natively
   at the screen's real resolution (so they're sharper than Flappy). The hero + people are pixel sprites. */
(() => {
'use strict';
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const MOSQUES = [['masjid', 'Luton Central Mosque'], ['masjidali', 'Masjid-e-Ali'], ['suffa', 'Suffa-Tul-Islam']];
const MOSQUE_K = MOSQUES.map(m => m[0]);
let myMosque = (() => { try { return localStorage.getItem('jd_mosque') || ''; } catch (e) { return ''; } })();
let bank = +(localStorage.getItem('jd_bank') || 0), passed = 0;
const VH = 400;                       // world height in units
const G = 300;                        // building ground line
const ROAD_T = 309, ROAD_B = 352;     // road
const PAVE_T = 358;                   // front pavement top
const FLOOR = 390;                    // hero feet when running
const CEIL = 3;                       // invisible ceiling: his head can go right up to the top of the screen (like Barry)
const HW = 48, HH0 = 58, HS = 1.5, HH = HH0 * HS;   // hero sprite cell + its on-screen scale
const BS = .8;                        // buildings drawn a bit smaller so there's more sky to fly in
let S = 1, W = 600, dpr = 1, KR = 2;  // units->px, screen width in units, render scale for buildings

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  // always landscape: if the phone is upright, turn the whole stage 90° (the player just turns the phone)
  const st = $('stage'), port = innerHeight > innerWidth, sw = port ? innerHeight : innerWidth, sh2 = port ? innerWidth : innerHeight;
  st.style.width = sw + 'px'; st.style.height = sh2 + 'px'; st.style.transform = port ? `translateX(${innerWidth}px) rotate(90deg)` : 'none';
  // keep the menu and HUD clear of the notch / Dynamic Island: on an upright phone the island ends up on the left of the turned stage
  st.style.setProperty('--sl', port ? 'max(44px, env(safe-area-inset-top))' : 'max(0px, env(safe-area-inset-left))');
  st.style.setProperty('--sr', port ? 'max(0px, env(safe-area-inset-bottom))' : 'max(0px, env(safe-area-inset-right))');
  cv.width = Math.round(sw * dpr); cv.height = Math.round(sh2 * dpr);
  S = cv.height / VH; W = cv.width / S;
  const k = Math.min(4, Math.max(1, Math.round(S * 10) / 10));
  if (Math.abs(k - KR) > .3) { KR = k; hazeCache.clear(); }
  const kb = Math.min(4, S * BS); if (Math.abs(kb - KB) > .02) { KB = kb; bCache.clear(); hazeCache.clear(); }
}

/* ---------------- assets ---------------- */
/* loading screen: waits for every picture + the fonts, then fades out */
const LOAD = { n: 0, ok: 0, done: false };
const loadStep = () => { const p = LOAD.n ? LOAD.ok / LOAD.n : 1, b = document.getElementById('loadBar'), t = document.getElementById('loadTxt'); if (b) b.style.width = Math.round(p * 100) + '%'; if (t) t.textContent = 'LOADING… ' + Math.round(p * 100) + '%'; if (p >= 1 && !LOAD.done) { LOAD.done = true; (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => document.getElementById('load').classList.add('done'), 250)); } };
const img = src => { const i = new Image(); LOAD.n++; const f = () => { LOAD.ok++; loadStep(); }; i.onload = f; i.onerror = f; i.src = src; return i; };
setTimeout(() => { LOAD.ok = LOAD.n; loadStep(); }, 12000);   // never stuck on the loading screen
addEventListener('load', loadStep);
/* shop state (bank is spent here): owned items, equipped gadgets, outfit, consumables */
let SHOP = (() => { try { return JSON.parse(localStorage.getItem('jd_shop')) || null; } catch (e) { return null; } })() || { own: { classic: 1 }, eq: [], slots: 2, outfit: 'classic', hs500: 0, hs1000: 0, save: 0 };
const saveShop = () => { try { localStorage.setItem('jd_shop', JSON.stringify(SHOP)); } catch (e) {} };
const OUTFIT_KEYS = ['classic', 'eid', 'luton', 'puffer', 'moroccan'];
const heroImgs = {}; OUTFIT_KEYS.forEach(k => heroImgs[k] = img(k === 'classic' ? 'art/hero3.webp?h=cf9cd7d10c' : 'art/hero3_' + k + '.webp?v=5'));
let heroImg = heroImgs[SHOP.outfit] || heroImgs.classic; const HX4 = 6;   // sheet = 6 px per cell unit (smooth cartoon hero, hd/hero_rig.js)
const hasG = id => SHOP.eq.includes(id);   // hero redrawn at 3x the pixels (smooth curves, finer detail)
const HERO_FR = ['run0_normal', 'run1_normal', 'run2_normal', 'run3_normal', 'run4_normal', 'run5_normal', 'fly0_effort', 'fly1_effort', 'fly2_effort', 'fly0_panic', 'fly1_panic', 'fly2_panic', 'glide0_normal', 'glide1_normal', 'land0_effort', 'glide0_ko', 'run0_happy', 'run0_blink', 'hang0_happy', 'hang1_happy', 'hang2_happy', 'hang3_happy', 'fall0_panic', 'fall1_panic', 'fall2_panic', 'fall0_ko', 'sit0_happy', 'sit1_happy'];
const FR = n => HERO_FR.indexOf(n);
let NPC_META = {};   // filled from art/npc.json (hd/build_npc_v3.py)
let NPC_KEYS = [], ESC_KEYS = [], CHAIR_KEYS = [], NPC_W = 0;
const NPC_H = {"pc_m": "bf9a23129c", "pc_f": "0d10d7e436", "pcso": "b96c95a849", "warden": "a66d4454a6", "fan_dad": "416f96e1f2", "fan_f": "a416d60d51", "fan_kid": "7d09983a79", "blonde": "5911071100", "abaya": "98120d714a", "teen": "c21b2888e4", "aunty": "329758884e", "uncle": "6a4f751543", "nurse": "7812a41339", "elder": "9a32510cd8", "builder": "c13eb606d8", "rider": "058fbb3a66", "rider_g": "6c7740c3ed", "rider_o": "5638f8be18", "schoolboy": "7b22f99a30", "shop": "62e2520146", "lad": "a096166c0d", "postie": "17230db312", "sehri": "f13be655e0", "v_woman_0": "b8bad350d0", "v_woman_1": "82be4238c0", "v_woman_2": "52857dbf09", "v_woman_3": "da19a4cbf1", "v_woman_4": "87fd629baf", "v_woman_5": "1cb9a17521", "v_woman_6": "811295b2c0", "v_woman_7": "beeb386555", "v_hijabi_0": "3089bb24dc", "v_hijabi_1": "bce7b5c5b7", "v_hijabi_2": "5e854e22b5", "v_hijabi_3": "fe3054eaa6", "v_hijabi_4": "ad1ec806c7", "v_hijabi_5": "cdede80a81", "v_hijabi_6": "44202cb8d3", "v_hijabi_7": "f77e50f005", "v_aunty_0": "329758884e", "v_aunty_1": "0905cf2b06", "v_aunty_2": "623a5f44ae", "v_aunty_3": "593dd6959d", "v_aunty_4": "2eb8f5ad8f", "v_aunty_5": "b58a3a56be", "v_man_0": "71ff3ee32c", "v_man_1": "18f08fb06f", "v_man_2": "cc78fa10e1", "v_man_3": "080e55fa52", "v_man_4": "7e0895c2cd", "v_man_5": "93036b778a", "v_man_6": "4428567992", "v_man_7": "7ee8375172", "v_student_0": "32dac47fb8", "v_student_1": "23e346d25a", "v_student_2": "385f83195e", "v_student_3": "02b1dc729a", "v_student_4": "7497cb9401", "v_student_5": "c4818404a2", "v_student_6": "9015c2b3cc", "v_student_7": "c3a28395b5", "v_student_8": "c94c86d802", "v_student_9": "2dba1de413", "v_police_0": "c261821f37", "v_police_1": "323ae71bb0", "v_police_2": "3228f384c7", "v_police_3": "039aa4406e", "v_police_4": "323ae71bb0", "v_police_5": "3228f384c7", "v_nurse_0": "236bc65df9", "v_nurse_1": "c357ae592c", "v_nurse_2": "debc7109c1", "v_nurse_3": "7e26062562", "v_nurse_4": "236bc65df9", "v_builder_0": "4d9ae1ee7a", "v_builder_1": "fc3b9d77f4", "v_builder_2": "3fa6f6deab", "v_builder_3": "e017599c9a", "v_builder_4": "559e2da12c", "v_fan_0": "e9d5ba4f11", "v_fan_1": "31736ec649", "v_fan_2": "8f9c30a348", "v_fan_3": "da10b1408c", "v_fan_4": "7b268f68bb", "chair_0": "50f7860105", "chair_1": "aa1323b9dc", "chair_2": "59380dcac0", "chair_3": "1d3aebd3d0", "chair_4": "99bd61c919", "chair_5": "a19d80c6e7", "chair_6": "7cbeb253a5", "chair_7": "91b79ad117", "v_fandad_0": "a3d09d1732", "v_fandad_1": "65a16dd5c7", "v_fandad_2": "f3b3f6fa37", "v_fandad_3": "79b38e4a36", "eesc_a": "a2ac5d8aed", "eesc_b": "35d3514fc0", "eesc_c": "58d3d153a3", "mobility": "4f2caa3907"}; const npcImg = {};
const npcGet = k => npcImg[k] || (npcImg[k] = img('art/npc_' + k + '.webp?h=' + (NPC_H[k] || 1)));   // loaded the first time someone of that kind walks on
fetch('art/npc.json?h=cb2784f590').then(r => r.json()).then(m => { NPC_META = m; const K = Object.keys(m);
  NPC_KEYS = K.filter(k => m[k].type === 'walk'); ESC_KEYS = K.filter(k => m[k].type === 'esc' && k[0] === 'e'); CHAIR_KEYS = K.filter(k => k.startsWith('chair_'));
  NPC_W = NPC_KEYS.reduce((a, k) => a + (m[k].wt || 1), 0); NPC_KEYS.slice(0, 12).forEach(npcGet); ESC_KEYS.forEach(npcGet); npcGet('mobility'); }).catch(() => {});

/* buildings: Flappy landmarks + house runs, drawn at KR px per unit, trimmed, cached (LRU) */
const M = 90, LH = 380;
let STREET = (window.LM_ORDER || Object.keys(window.LANDMARKS || {})).filter(k => window.LANDMARKS && LANDMARKS[k]);   // every Luton building from Flappy Kabootar
/* buildings come in a shuffled deck like Flappy Kabootar: every one shows up before any repeats; sets stay together in order */
const SETS = [['frasers', 'station', 'hatfactory'], ['wardownfield', 'wardown', 'wardownbridge', 'funfair'], ['welcome', 'airport']];
let deck = [], lastUnit = null, setQ = [], houseDeck = [], skyDeck = [];
function buildDeck() {
  const inSet = new Set(SETS.flat());
  const units = SETS.map(u => u.filter(k => LANDMARKS[k])).filter(u => u.length).concat(STREET.filter(k => !inSet.has(k)).map(k => [k]));
  for (let i = units.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [units[i], units[j]] = [units[j], units[i]]; }
  if (lastUnit && units[0].join() === lastUnit.join()) units.push(units.shift());
  lastUnit = units[units.length - 1]; return units;
}
const HOUSE_K = () => Object.keys(window.HOUSES || {});
const bCache = new Map(), hazeCache = new Map();
/* HD buildings: drawn as true pixel art (1 px per unit), smoothed up 4x with Scale2x twice (rounded edges and curves,
   like the hero), then fitted to the exact on-screen size so nothing gets blurred by a second resize */
function scale2x(src, w, h) {
  const out = new Uint32Array(w * h * 4), W2 = w * 2;
  for (let y = 0; y < h; y++) { const ym = y > 0 ? y - 1 : y, yp = y < h - 1 ? y + 1 : y;
    for (let x = 0; x < w; x++) { const P = src[y * w + x], A = src[ym * w + x], D = src[yp * w + x], C = src[y * w + (x > 0 ? x - 1 : x)], B = src[y * w + (x < w - 1 ? x + 1 : x)];
      let e0 = P, e1 = P, e2 = P, e3 = P;
      if (A !== D && C !== B) { if (C === A) e0 = A; if (A === B) e1 = B; if (D === C) e2 = C; if (B === D) e3 = D; }
      const o = y * 2 * W2 + x * 2; out[o] = e0; out[o + 1] = e1; out[o + W2] = e2; out[o + W2 + 1] = e3; } }
  return out;
}
const hdCv = document.createElement('canvas');
function hdUp(src1x, KB) {   // src1x: trimmed 1x canvas -> canvas at KB px per unit, smoothed
  const w = src1x.width, h = src1x.height, d = src1x.getContext('2d').getImageData(0, 0, w, h);
  let px = new Uint32Array(d.data.buffer); px = scale2x(px, w, h); px = scale2x(px, w * 2, h * 2);
  hdCv.width = w * 4; hdCv.height = h * 4; hdCv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(px.buffer), w * 4, h * 4), 0, 0);
  const t = document.createElement('canvas'); t.width = Math.max(1, Math.round(w * KB)); t.height = Math.max(1, Math.round(h * KB));
  const o = t.getContext('2d'); o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high'; o.drawImage(hdCv, 0, 0, t.width, t.height);
  hdCv.width = hdCv.height = 1; return t;
}

/* automatic HD finishing for Flappy's pixel buildings (drawn at N px per unit):
   thick 1-unit ink outlines thinned to fine lines, glass gets sky reflections, flat colours get grain,
   soft light from the top and a darker base */
const NOISE = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const o = c.getContext('2d'), d = o.createImageData(96, 96);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 60; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } o.putImageData(d, 0, 0); return c; })();

const patCache = {};
function brickPat(N) {   // stretcher bond at real brick size (~2 x .66 units), each brick its own tone, thin pale mortar
  const id = 'b' + N; if (patCache[id]) return patCache[id];
  const bw = 2.1 * N, bh = .72 * N, c = document.createElement('canvas'); c.width = Math.round(bw * 8); c.height = Math.round(bh * 8); const o = c.getContext('2d');
  o.fillStyle = 'rgb(200,200,200)'; o.fillRect(0, 0, c.width, c.height);
  for (let r = 0; r < 8; r++) for (let i = -1; i < 9; i++) { const x = i * bw + (r % 2) * bw / 2, y = r * bh, v = 100 + Math.random() * 56 | 0;
    o.fillStyle = `rgb(${v},${v},${v})`; o.fillRect(x + .5, y + .5, bw - 1, bh - 1); o.fillStyle = 'rgba(255,255,255,.18)'; o.fillRect(x + .5, y + .5, bw - 1, Math.max(.6, bh * .2)); }
  return (patCache[id] = c);
}
function tilePat(N) {   // slate courses: overlapping rows with staggered joints
  const id = 't' + N; if (patCache[id]) return patCache[id];
  const tw = 1.6 * N, th = 1.1 * N, c = document.createElement('canvas'); c.width = Math.round(tw * 8); c.height = Math.round(th * 6); const o = c.getContext('2d');
  o.fillStyle = 'rgb(128,128,128)'; o.fillRect(0, 0, c.width, c.height);
  for (let r = 0; r < 6; r++) for (let i = -1; i < 9; i++) { const x = i * tw + (r % 2) * tw / 2, y = r * th, v = 112 + Math.random() * 34 | 0;
    o.fillStyle = `rgb(${v},${v},${v})`; o.fillRect(x + .5, y, tw - 1, th - .8); o.fillStyle = 'rgba(0,0,0,.35)'; o.fillRect(x, y + th - .9, tw, .9); }
  return (patCache[id] = c);
}
function hdFinish(c, o, N, l, top, r) {
  const x0 = Math.max(0, l - 2), y0 = Math.max(0, top - 2), w = Math.min(c.width, r + 3) - x0, h = c.height - y0; if (w < 4 || h < 4) return;
  const img = o.getImageData(x0, y0, w, h), d = img.data, src = new Uint8ClampedArray(d), glass = new Uint8Array(w * h);
  const isInk = i => src[i + 3] > 200 && Math.abs(src[i] - 27) < 12 && Math.abs(src[i + 1] - 26) < 12 && Math.abs(src[i + 2] - 36) < 14;   // Flappy's outline colour #1b1a24 only
  const k = Math.max(1, Math.round(N * .45));   // how far in from each side of a thick line we recolour
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (src[i + 3] < 10) continue;
    if (isInk(i)) {   // thin the outline: an ink pixel next to a coloured pixel within k takes that colour, darkened a little
      let best = -1; for (let s = 1; s <= k && best < 0; s++) for (const [dx, dy] of [[s, 0], [-s, 0], [0, s], [0, -s]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = (yy * w + xx) * 4; if (src[j + 3] > 200 && !isInk(j)) { best = j; break; } }
      if (best >= 0) { d[i] = src[best] * .72; d[i + 1] = src[best + 1] * .72; d[i + 2] = src[best + 2] * .74; }
      continue; }
    const R0 = src[i], G0 = src[i + 1], B0 = src[i + 2];   // glass: cool blue-grey, not too dark, not white
    if (B0 > R0 + 12 && B0 >= G0 - 6 && B0 > 90 && B0 < 235 && R0 < 200) glass[y * w + x] = 1;
    else if (R0 > 120 && R0 < 222 && G0 > 44 && G0 < 128 && B0 > 30 && B0 < 104 && R0 - G0 > 48 && R0 - G0 < 140) glass[y * w + x] = 2;   // brick (not the bright sign reds)
    else if (Math.abs(R0 - G0) < 12 && Math.abs(G0 - B0) < 16 && R0 > 44 && R0 < 112) glass[y * w + x] = 3; }   // slate / dark grey roof
  o.putImageData(img, x0, y0);
  // glass reflections: diagonal light streaks + top-lit gradient, only on glass pixels
  const gm = document.createElement('canvas'); gm.width = w; gm.height = h; const g = gm.getContext('2d'), gd = g.createImageData(w, h);
  for (let p = 0; p < w * h; p++) if (glass[p] === 1) { gd.data[p * 4 + 3] = 255; }
  g.putImageData(gd, 0, 0); g.globalCompositeOperation = 'source-in';
  const lg = g.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, 'rgba(255,255,255,.30)'); lg.addColorStop(.5, 'rgba(255,255,255,.06)'); lg.addColorStop(1, 'rgba(20,40,70,.18)'); g.fillStyle = lg; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,.22)'; const sw = 7 * N;
  for (let sx = -h; sx < w; sx += 26 * N) { g.beginPath(); g.moveTo(sx, h); g.lineTo(sx + h * .6, 0); g.lineTo(sx + h * .6 + sw, 0); g.lineTo(sx + sw, h); g.fill(); }
  o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.drawImage(gm, x0, y0);
  // HD brickwork and roof tiles on top of Flappy's flat brick/slate colours
  for (const [m, pat, a] of [[2, brickPat(N), .35]]) {
    const mc = document.createElement('canvas'); mc.width = w; mc.height = h; const q = mc.getContext('2d'), md = q.createImageData(w, h); let any = 0;
    for (let p = 0; p < w * h; p++) if (glass[p] === m) { md.data[p * 4 + 3] = 255; any = 1; }
    if (!any) continue; q.putImageData(md, 0, 0); q.globalCompositeOperation = 'source-in'; q.globalAlpha = a; q.fillStyle = q.createPattern(pat, 'repeat'); q.fillRect(0, 0, w, h);
    o.globalCompositeOperation = 'overlay'; o.drawImage(mc, x0, y0); o.globalCompositeOperation = 'source-over'; }
  // grain + light: top a touch brighter, bottom a touch darker, all clipped to the building
  o.globalCompositeOperation = 'source-atop';
  o.globalAlpha = .07; o.fillStyle = o.createPattern(NOISE, 'repeat'); o.fillRect(x0, y0, w, h); o.globalAlpha = 1;
  const sh = o.createLinearGradient(0, y0, 0, y0 + h); sh.addColorStop(0, 'rgba(255,250,235,.10)'); sh.addColorStop(.75, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(20,10,30,.16)'); o.fillStyle = sh; o.fillRect(x0, y0, w, h);
  o.restore();
}
let KB = 2;
if (document.fonts) Promise.all(['700 10px Mont', '600 10px Oswald', '700 10px Amiri'].map(f => document.fonts.load(f)).concat(window.HD_READY || [])).then(() => { bCache.clear(); hazeCache.clear(); });   // redraw buildings once the sign fonts are in   // building px per unit = exactly the on-screen size (S * BS)
function buildingCanvas(kind, key, bakeAnim) {
  const id = kind + ':' + key + (bakeAnim ? ':a' : ''); if (bCache.has(id)) { const v = bCache.get(id); bCache.delete(id); bCache.set(id, v); return v; }
  let w, draw;
  if (kind === 'lm') { const L = LANDMARKS[key]; if (!L) return null; w = L.w; const H2 = window.LANDMARKS_HD && LANDMARKS_HD[key];
    draw = H2 ? (o => { const f = (window.SCALE && SCALE[key]) || 1; o.save(); o.translate(M, LH - 6); o.scale(f, f); H2(o, 0, 0); o.restore(); }) : (o => L.d(o, M, LH - 6)); }
  else { const Hh = HOUSES[key]; if (!Hh) return null; w = Math.round(Hh.w * 1.35); const HH = window.HOUSES_HD && HOUSES_HD[key]; draw = o => window.drawScaled(o, HH || Hh.d.bind(Hh), M, LH - 6, 1.35); }
  const N = Math.min(4, Math.ceil(KB + .2));   // drawn natively just above screen size: vector curves, lettering and the sharp sign redraws at full detail, blocks on exact pixels
  const c = document.createElement('canvas'); c.width = (w + 2 * M) * N; c.height = LH * N;
  const o = c.getContext('2d', { willReadFrequently: true }); o.imageSmoothingEnabled = false; o.scale(N, N);
  try { draw(o); } catch (e) { console.warn(key, e); }
  if (kind === 'lm' && window.LM_ANIM && LM_ANIM[key] && (bakeAnim || !LIVE_ANIM.has(key))) try { const af = key !== 'lutonhoo' && window.SCALE && SCALE[key]; if (af) { o.save(); o.translate(M, LH - 6); o.scale(af, af); LM_ANIM[key](o, 0, 0, 0); o.restore(); } else LM_ANIM[key](o, M, LH - 6, 0); } catch (e) {}
  // trim empty space (search on a 1/4 grid, then exact edges)
  const d = o.getImageData(0, 0, c.width, c.height).data; let top = c.height, l = c.width, r = 0;
  for (let y = 0; y < c.height; y += 3) { const row = y * c.width; for (let x = 0; x < c.width; x += 3) if (d[(row + x) * 4 + 3] > 8) { if (y < top) top = y; if (x < l) l = x; if (x > r) r = x; } }
  if (r < l) { l = 0; r = 4; top = c.height - 4; }
  l = Math.max(0, l - 3); top = Math.max(0, top - 3); r = Math.min(c.width - 1, r + 4);
  if (!(window.LANDMARKS_HD && kind === 'lm' && LANDMARKS_HD[key]) && !(kind !== 'lm' && window.HOUSES_HD && HOUSES_HD[key])) hdFinish(c, o, N, l, top, r);   // automatic HD finishing on the Flappy art
  const kb = KB, f = kb / N, t = document.createElement('canvas'); t.width = Math.max(1, Math.round((r - l + 1) * f)); t.height = Math.max(1, Math.round((c.height - top) * f));
  const q = t.getContext('2d'); q.imageSmoothingEnabled = true; q.imageSmoothingQuality = 'high'; q.drawImage(c, l, top, r - l + 1, c.height - top, 0, 0, t.width, t.height);
  c.width = c.height = 1;
  const v = { c: t, k: kb, ox: l / N - M, w, top: top / N - (LH - 6), h: (LH * N - top) / N };
  bCache.set(id, v); while (bCache.size > 30) bCache.delete(bCache.keys().next().value);
  return v;
}
function hazed(id, v) {   // pale, sunset-tinted copy for the far skyline
  if (hazeCache.has(id)) return hazeCache.get(id);
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(v.c.width * .5)); c.height = Math.max(1, Math.round(v.c.height * .5)); const o = c.getContext('2d'); o.imageSmoothingQuality = 'high';
  o.drawImage(v.c, 0, 0, c.width, c.height); o.globalCompositeOperation = 'source-atop'; o.fillStyle = DAY ? 'rgba(168,200,232,.66)' : 'rgba(204,128,150,.72)'; o.fillRect(0, 0, c.width, c.height);
  hazeCache.set(id, c); while (hazeCache.size > 40) hazeCache.delete(hazeCache.keys().next().value); return c;
}

/* vehicles, rendered at KR, both directions */
const NEAR_ONLY = { police: 1, policevan: 1, ambulance: 1, fire: 1, postvan: 1 };   // lettering on the side would read backwards in the far lane
const CAR_KEYS = ['jazz', 'yaris', 'polo', 'fiesta', 'focus', 'zafira', 'avensis', 'x6', 'x7', 'prius', 'prius2', 'taxi2', 'sclass', 'rolls', 'golfr', 'v60', 'xc40', 'corsa', 'fiat500', 'sportage', 'gt3', 'f812', 'lambo', 'astra', 'golf', 'bmw1', 'a3', 'aold', 'a45', 'bmw3', 'c63s', 'c63', 'tesla', 'qashqai', 'rangerover', 'gwagon', 'urus', 'taxi', 'bigvan', 'postvan', 'smallvan', 'police', 'policevan', 'tractor', 'artic', 'moped', 'bike', 'binlorry', 'ambulance', 'fire'];
const carCache = new Map();
/* HD pass for the vehicle art (owner, 21 Nov): the shared Flappy drawings go through a context wrapper that turns the flat body
   colour into a glossy gradient with a reflection band, thins the dark outlines, gives the glass a sky reflection and the rims a
   metallic finish; every model, colour and owner detail stays exactly as drawn */
const hdNorm = (() => { const t = document.createElement('canvas').getContext('2d'); return s => { t.fillStyle = '#000'; t.fillStyle = s; return t.fillStyle; }; })();
const hdSh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})`; };
window.hdCtx = (o, body, top, bot) => {
  const B = body ? hdNorm(body) : null, GLS = new Set(['#26303a', '#2a3038', '#22262c', '#2a323c', '#1f2a3a', '#3f4a55', '#2a2f38']), TYRE = '#16171a', OUTL = '#1b1a24';
  const bodyGrad = () => { const gr = o.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, hdSh(B, 1.32)); gr.addColorStop(.3, hdSh(B, 1.08)); gr.addColorStop(.42, hdSh(B, 1.2)); gr.addColorStop(.5, B); gr.addColorStop(.8, hdSh(B, .86)); gr.addColorStop(1, hdSh(B, .68)); return gr; };
  const glassGrad = () => { const gr = o.createLinearGradient(0, top, 0, top + (bot - top) * .55); gr.addColorStop(0, '#9cb6ca'); gr.addColorStop(.5, '#3c4a58'); gr.addColorStop(1, '#1a2028'); return gr; };
  const swap = () => { const fs = o.fillStyle; if (typeof fs !== 'string') return null; const f = fs.toLowerCase(); if (B && f === B) { o.fillStyle = bodyGrad(); return fs; } if (GLS.has(f)) { o.fillStyle = glassGrad(); return fs; } return null; };
  return new Proxy(o, { get(t, p) {
    if (p === 'fill') return (...a) => { const k = swap(); t.fill(...a); if (k) t.fillStyle = k; };
    if (p === 'fillRect') return (...a) => { const k = swap(); t.fillRect(...a); if (k) t.fillStyle = k; };
    if (p === 'stroke') return (...a) => { const lw = t.lineWidth, ss = typeof t.strokeStyle === 'string' ? t.strokeStyle.toLowerCase() : ''; if (ss === OUTL || ss === '#000000') t.lineWidth = Math.min(lw, .55); t.stroke(...a); t.lineWidth = lw; };
    const v = t[p]; return typeof v === 'function' ? v.bind(t) : v; }, set(t, p, v) { t[p] = v; return true; } });
};
function carSprite(k, ci, flip) {
  const id = k + ci + flip + '@' + KR; if (carCache.has(id)) return carCache.get(id);
  const V = VEHICLES[k]; const col = V.colours[ci % V.colours.length]; const SC = 1.6, k2 = KR * SC;
  const c = document.createElement('canvas'); c.width = Math.ceil((V.w + 6) * k2); c.height = Math.ceil(90 * k2); const o = c.getContext('2d');
  o.scale(k2, k2); window.__WREC = []; try { V.d(V.v3 ? o : hdCtx(o, col[1], 86 - (V.h || 24), 86), 3, 86, col); } catch (e) {} const wr = window.__WREC; window.__WREC = null;
  // specular sweep across the bodywork
  o.setTransform(1, 0, 0, 1, 0, 0); if (!(wr || []).some(w => w.under)) { o.globalCompositeOperation = 'source-atop'; const sg = o.createLinearGradient(c.width * .2, 0, c.width * .55, c.height); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.48, 'rgba(255,255,255,.1)'); sg.addColorStop(.52, 'rgba(255,255,255,0)'); o.fillStyle = sg; o.fillRect(0, 0, c.width, c.height); o.globalCompositeOperation = 'source-over'; }
  let out = c;
  if (flip) { const f = document.createElement('canvas'); f.width = c.width; f.height = c.height; const g = f.getContext('2d'); g.translate(f.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
    if (V.fixMirror) { g.scale(k2, k2); try { V.fixMirror(hdCtx(g, col[1], 86 - (V.h || 24), 86), 3, 86, f.width / k2); } catch (e) {} } out = f; }
  const wh = (wr || []).map(w => ({ x: (flip ? c.width - w.x : w.x) / KR, y: w.y / KR, r: w.r / KR, rim: w.rim, spokes: w.spokes || 5, wi: w.wi }));
  const under = (wr || []).some(w => w.under);
  let lt = null; if (V.lights) { const Lr = V.lights(), W2 = c.width / KR, m = q => ({ x: flip ? W2 - q.x * SC : q.x * SC, y: q.y * SC, t: q.t }); lt = { bl: Lr.bl.map(m), hl: Lr.hl.map(m) }; }
  const v = { c: out, w: (V.w + 6) * SC, h: 90 * SC, gy: 86 * SC, sp: V.speed, wh, under, lt };
  carCache.set(id, v); if (carCache.size > 40) carCache.delete(carCache.keys().next().value); return v;
}
function drawTrafficCar(c) { const far = c.lane === 0, sp = carSprite(c.k, c.ci, far), gy = (far ? ROAD_T + 19 : ROAD_B - 3) + c.yo, X = px(c.x), Y = px(gy - sp.gy), k = c.crash, K = far ? .9 : 1;   // far lane a touch smaller (further away)
  ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.beginPath(); ctx.ellipse(c.x + sp.w / 2, gy, sp.w * .44 * K, 2.8 * K, 0, 0, 7); ctx.fill();
  ctx.save(); if (k && k.rot) { const cx = c.x + sp.w / 2, cy = gy - 10; ctx.translate(cx, cy); ctx.rotate(k.rot); ctx.translate(-cx, -cy); }
  else if (!k) { const b = Math.sin((c.roll || 0) * .09) * .35; ctx.translate(0, b); }   // a little suspension bob
  if (K !== 1) { ctx.translate(X + sp.w / 2, gy); ctx.scale(K, K); ctx.translate(-X - sp.w / 2, -gy); }
  const roll = (c.roll || 0) * (far ? -1 : 1);
  if (sp.under) { if (sp.wh.length) drawWheels(sp, X, Y, roll); ctx.drawImage(sp.c, X, Y, sp.w, sp.h); }   // wheels behind the body: the arches overhang them
  else { ctx.drawImage(sp.c, X, Y, sp.w, sp.h); if (sp.wh.length) drawWheels(sp, X, Y, roll); }
  if ((c.run || c.police) && sp.lt) {   // blue lights: roof, side and bumper lamps flash in two alternating groups (double strobe), headlights wig-wag with them
    const ph = Math.floor(performance.now() / 70) % 8, A = ph === 0 || ph === 2, B = ph === 4 || ph === 6, mid = sp.w / 2; ctx.globalCompositeOperation = 'lighter';
    sp.lt.bl.forEach(p => { const on = p.x < mid ? A : B; if (!on) return; const R = p.t === 'r' ? 26 : p.t === 's' ? 15 : 12, x = X + p.x, y = Y + p.y, g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(225,240,255,1)'); g.addColorStop(.18, 'rgba(70,130,255,.9)'); g.addColorStop(1, 'rgba(40,80,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2); });
    sp.lt.hl.forEach(p => { if (!(A || B)) return; const x = X + p.x, y = Y + p.y, R = 15, g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(.25, 'rgba(255,250,220,.6)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2); });
    ctx.globalCompositeOperation = 'source-over'; }
  else if (c.run || c.police) { const on = Math.floor(performance.now() / 120) % 2, lx = c.x + sp.w / 2, ly = gy - (VEHICLES[c.k].h || 24) * CSC * .9; ctx.globalCompositeOperation = 'lighter';
    [[-4, on], [4, !on]].forEach(([o, lit]) => { if (!lit) return; const r = ctx.createRadialGradient(lx + o * 2, ly, 0, lx + o * 2, ly, 34); r.addColorStop(0, 'rgba(200,225,255,1)'); r.addColorStop(.15, 'rgba(70,130,255,.85)'); r.addColorStop(1, 'rgba(40,80,255,0)'); ctx.fillStyle = r; ctx.fillRect(lx + o * 2 - 34, ly - 34, 68, 68); });
    ctx.globalCompositeOperation = 'source-over'; }
  if (c.tail && Math.floor(performance.now() / 180) % 2) { const hx = far ? c.x + 4 : c.x + sp.w - 8, hy = gy - 9; ctx.globalCompositeOperation = 'lighter';   // flashing its headlights at the car in front
    const r = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26); r.addColorStop(0, 'rgba(255,255,235,1)'); r.addColorStop(.2, 'rgba(255,250,200,.7)'); r.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = r; ctx.fillRect(hx - 26, hy - 26, 52, 52); ctx.globalCompositeOperation = 'source-over'; }
  if (k && k.fire && k.t < 9) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const fx = c.x + sp.w * (.35 + Math.random() * .3), fy = gy - 14 - Math.random() * 10, r = ctx.createRadialGradient(fx, fy, 0, fx, fy, 9); r.addColorStop(0, 'rgba(255,220,120,.9)'); r.addColorStop(1, 'rgba(255,80,0,0)'); ctx.fillStyle = r; ctx.fillRect(fx - 9, fy - 9, 18, 18); } ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore(); }
// turning wheels: the rim + spokes are redrawn over each wheel every frame, rotated by how far the car has rolled
function drawWheels(sp, x0, y0, roll) { for (const w of sp.wh) { const cx = x0 + w.x, cy = y0 + w.y, r = w.r * .64; if (r < 1.2) continue;
  if (sp.under) { ctx.beginPath(); ctx.arc(cx, cy, w.r * .98, 0, 7); ctx.fillStyle = '#1b1c20'; ctx.fill(); }
  const WI = window.WHEEL_IMG; if (w.wi != null && WI && WI.complete && WI.naturalWidth) {   // the owner's wheel pictures, turning
    const R = w.r * .985; ctx.save(); ctx.translate(cx, cy); ctx.rotate(roll / w.r); ctx.drawImage(WI, (w.wi % 5) * 128, (w.wi / 5 | 0) * 128, 128, 128, -R, -R, R * 2, R * 2); ctx.restore(); continue; }
  ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = w.rim || '#9aa2ab'; ctx.fill(); ctx.beginPath(); ctx.arc(-r * .2, -r * .2, r * .55, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
  ctx.rotate(roll / w.r); ctx.strokeStyle = 'rgba(40,42,48,.85)'; ctx.lineWidth = Math.max(.6, r * .2); for (let i = 0; i < w.spokes; i++) { const a = i * 2 * Math.PI / w.spokes; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .25, Math.sin(a) * r * .25); ctx.lineTo(Math.cos(a) * r * .92, Math.sin(a) * r * .92); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, r * .24, 0, 7); ctx.fillStyle = '#5a5d66'; ctx.fill(); ctx.restore(); } }

/* £1 coin: gold 12-sided with a silver centre, pre-drawn at a few spin widths */
const COIN_R = 9; let coinFrames = [], coinK = 0;
function makeCoins() {   // the 12-sided £1: nickel-brass outer ring, nickel-plated centre, milled edge, raised £1, turning (16 frames)
  coinK = KR; coinFrames = [];
  for (let f = 0; f < 16; f++) {
    const ang = f / 16 * Math.PI, sx = Math.cos(ang), ax = Math.max(.1, Math.abs(sx)), R = COIN_R * KR, c = document.createElement('canvas'); c.width = c.height = Math.ceil(R * 2 + 8); const o = c.getContext('2d');
    o.translate(c.width / 2, c.height / 2);
    const dod = (r, sc2) => { o.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .26; o.lineTo(Math.cos(a) * r * sc2, Math.sin(a) * r); } o.closePath(); };
    o.save(); o.translate(KR * 1.2, KR * 1.6); dod(R, ax); o.fillStyle = 'rgba(30,14,40,.3)'; o.fill(); o.restore();   // soft drop shadow so it stands off the background
    const th = R * .16 * Math.sqrt(1 - ax * ax);   // edge thickness showing as it turns
    if (th > .3) { o.save(); o.translate(sx >= 0 ? th : -th, 0); dod(R, ax); const eg = o.createLinearGradient(0, -R, 0, R); eg.addColorStop(0, '#d8a83a'); eg.addColorStop(.5, '#8a6418'); eg.addColorStop(1, '#5a3e0c'); o.fillStyle = eg; o.fill(); for (let i = -8; i <= 8; i++) { o.fillStyle = 'rgba(60,40,8,.5)'; o.fillRect(-R * ax - 1, i * R / 8.4, R * 2 * ax + 2, R / 30); } o.restore(); }
    dod(R, ax); let gg = o.createLinearGradient(-R * ax, -R, R * ax, R); gg.addColorStop(0, '#fff4b0'); gg.addColorStop(.35, '#f2c94a'); gg.addColorStop(.7, '#c8962a'); gg.addColorStop(1, '#8a6214'); o.fillStyle = gg; o.fill(); o.strokeStyle = '#6b4a12'; o.lineWidth = Math.max(.6, KR * .45); o.stroke();
    dod(R * .9, ax); o.strokeStyle = 'rgba(255,240,180,.55)'; o.lineWidth = Math.max(.4, KR * .3); o.stroke();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; o.fillStyle = 'rgba(120,84,20,.45)'; o.beginPath(); o.arc(Math.cos(a) * R * .8 * ax, Math.sin(a) * R * .8, R * .028, 0, 7); o.fill(); }   // lettering round the ring
    o.beginPath(); o.ellipse(0, 0, R * .6 * ax, R * .6, 0, 0, 7); gg = o.createLinearGradient(-R * .6 * ax, -R * .6, R * .6 * ax, R * .6); gg.addColorStop(0, '#ffffff'); gg.addColorStop(.4, '#dde2ea'); gg.addColorStop(1, '#8a909c'); o.fillStyle = gg; o.fill(); o.strokeStyle = 'rgba(90,96,108,.7)'; o.lineWidth = Math.max(.4, KR * .3); o.stroke();
    if (ax > .35) { o.save(); o.scale(ax, 1); o.font = `900 ${R * .78}px Mont, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = 'rgba(255,255,255,.8)'; o.fillText('£1', -R * .03, R * .07); o.fillStyle = '#7a808c'; o.fillText('£1', R * .02, R * .03); o.restore(); }
    o.save(); dod(R, ax); o.clip(); o.globalCompositeOperation = 'lighter'; const sh2 = o.createLinearGradient(-R, -R, R, R); const p2 = (f / 16 + .2) % 1; sh2.addColorStop(Math.max(0, p2 - .12), 'rgba(255,255,255,0)'); sh2.addColorStop(p2, 'rgba(255,255,255,.45)'); sh2.addColorStop(Math.min(1, p2 + .12), 'rgba(255,255,255,0)'); o.fillStyle = sh2; o.fillRect(-R, -R, R * 2, R * 2); o.restore();
    coinFrames.push(c);
  }
}

/* ---------------- sound (tiny WebAudio kit) ---------------- */
let AC = null, sndOn = true, hissG = null;
function audio() {
  if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const n = AC.createBufferSource(); n.buffer = b; n.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = .7;
  hissG = AC.createGain(); hissG.gain.value = 0; n.connect(f); f.connect(hissG); hissG.connect(AC.destination); n.start();
}
function tone(freq, dur, type = 'sine', vol = .12, slide = 0) {
  if (!AC || !sndOn) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .02);
}
const SFX = { coin() { tone(1320, .09, 'square', .05); setTimeout(() => tone(1760, .12, 'square', .045), 55); },
  zap() { tone(120, .5, 'sawtooth', .16, .5); tone(900, .25, 'square', .06, .3); }, thud() { tone(140, .25, 'triangle', .3, .4); },
  warn() { tone(880, .08, 'square', .05); }, whoosh() { tone(500, .5, 'sawtooth', .05, .3); }, boom() { tone(90, .6, 'sawtooth', .22, .3); } };

/* traffic sounds, ported from Flappy Kabootar (engine model, siren/wail/nee-naw, horns, skids, crashes) */
Object.assign(SFX, (() => {
  const A = () => { if (!sndOn) return null; audio(); if (AC && AC.state === 'suspended') AC.resume(); return AC; };
  const tn = (f0, f1, dur, type = 'square', vol = .12, delay = 0) => { const a = A(); if (!a) return; const t0 = a.currentTime + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + .02); };
  const nz = (dur, f0, f1, vol = .18, delay = 0) => { const a = A(); if (!a) return; const t0 = a.currentTime + delay, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = b; const fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur); n.connect(fl).connect(g).connect(a.destination); n.start(t0); };
  const engine = (D, f, vol, bike) => { const a = A(); if (!a) return; const t0 = a.currentTime, N = 28, re = new Float32Array(N), im = new Float32Array(N);
    for (let h = 1; h < N; h++) im[h] = Math.pow(h, bike ? -.75 : -.9) * (h % 2 ? 1 : (bike ? .55 : .8)) * (1 + .35 * Math.sin(h * 1.7));
    const wave = a.createPeriodicWave(re, im), o = a.createOscillator(), o2 = a.createOscillator(); o.setPeriodicWave(wave); o2.setPeriodicWave(wave);
    const set = (p, k) => { p.setValueAtTime(f[0] * k, t0); p.exponentialRampToValueAtTime(f[1] * k, t0 + D * .45); p.exponentialRampToValueAtTime(f[2] * k, t0 + D); }; set(o.frequency, 1); set(o2.frequency, 1.006);
    const am = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(); am.gain.value = .65; lfo.type = 'triangle'; set(lfo.frequency, .5); lg.gain.value = .35; lfo.connect(lg); lg.connect(am.gain);
    const sh = a.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) cv[i] = Math.tanh((i / 511.5 - 1) * (bike ? 3.2 : 2.6)); sh.curve = cv;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4; lp.frequency.setValueAtTime(bike ? 1200 : 700, t0); lp.frequency.exponentialRampToValueAtTime(bike ? 4200 : 2600, t0 + D * .45); lp.frequency.exponentialRampToValueAtTime(bike ? 1400 : 650, t0 + D);
    const g = a.createGain(); g.gain.setValueAtTime(vol * .04, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + D * .45); g.gain.exponentialRampToValueAtTime(vol * .03, t0 + D); g.gain.linearRampToValueAtTime(0, t0 + D + .04);
    const og = a.createGain(); og.gain.value = .5; o.connect(og); o2.connect(og); og.connect(am); am.connect(sh); sh.connect(lp); lp.connect(g); g.connect(a.destination);
    [o, o2, lfo].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); };
  const sir = (D, base, lfoF, dep, types, peak, glide) => { const a = A(); if (!a) return; const t0 = a.currentTime, o = a.createOscillator(), o2 = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = types[0]; o2.type = types[1]; l.type = 'triangle'; l.frequency.value = lfoF; lg.gain.value = dep; l.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    [o, o2].forEach(x => { x.frequency.setValueAtTime(base, t0); x.frequency.linearRampToValueAtTime(base + glide, t0 + D * .42); x.frequency.linearRampToValueAtTime(base - glide, t0 + D); });
    f.type = 'lowpass'; f.frequency.value = 2500; const m = a.createGain(); m.gain.value = .22; o.connect(f); o2.connect(m); m.connect(f); f.connect(g); g.connect(a.destination);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); [o, o2, l].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); };
  return {
    zoom(bike) { engine(bike ? 1.6 : 1.9, bike ? [150, 265, 120] : [62, 108, 48], bike ? .16 : .2, bike); nz(1.2, 300, 1500, .03, .3); },
    rev(bike) { engine(1.1, bike ? [110, 210, 170] : [45, 82, 66], bike ? .09 : .11, bike); },
    siren() { sir(5.5, 930, 3, 340, ['triangle', 'sawtooth'], .036, 70); },
    wail() { sir(6, 1050, .55, 380, ['triangle', 'square'], .033, 60); },
    neenaw() { const a = A(); if (!a) return; const t0 = a.currentTime, D = 6.5, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(); o.type = 'sawtooth'; for (let k = 0, tt = 0; tt < D; k++, tt += .55) o.frequency.setValueAtTime(k % 2 ? 640 : 790, t0 + tt);
      f.type = 'lowpass'; f.frequency.value = 1900; o.connect(f); f.connect(g); g.connect(a.destination); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.03, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); o.start(t0); o.stop(t0 + D + .05); },
    airhorn(at) { [0, .45].forEach(d => { tn(233, 228, .38, 'sawtooth', .042, (at || 0) + d); tn(294, 290, .38, 'sawtooth', .036, (at || 0) + d); }); },
    horn(v) { v = v == null ? .5 : v; const n = v < .5 ? 1 : 2, f = 380 + v * 140; for (let i = 0; i < n; i++) { tn(f, f, .18 + (v > .8 ? .35 : 0), 'square', .021, i * .28); tn(f * 1.26, f * 1.26, .18 + (v > .8 ? .35 : 0), 'square', .015, i * .28); } },
    skid(v) { v = v == null ? .5 : v; const a = A(); if (!a) return; const t0 = a.currentTime, D = .9 + v * .5, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * D), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      n.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9; f.frequency.setValueAtTime(1900 + v * 900, t0); f.frequency.linearRampToValueAtTime(1300 + v * 500, t0 + D); const g = a.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.2, t0 + .06); g.gain.exponentialRampToValueAtTime(.001, t0 + D); n.connect(f); f.connect(g); g.connect(a.destination); n.start(t0); n.stop(t0 + D); },
    bump() { nz(.12, 900, 300, .14); tn(160, 70, .12, 'square', .05); },
    crash() { const a = A(); if (!a) return; const t0 = a.currentTime, sr = a.sampleRate, nb = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(sr * 1.1), sr), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / sr * 9);
      for (let k = 0; k < 36; k++) { const p = Math.floor((.05 + Math.pow(Math.random(), 1.6) * .9) * sr), f = 3000 + Math.random() * 4500, Am = .1 + Math.random() * .35; for (let i = 0; i < sr * .05 && p + i < d.length; i++) d[p + i] += Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / sr * 90) * Am; }
      nb.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = .45; const g = a.createGain(); g.gain.value = .22; nb.connect(f); f.connect(g); g.connect(a.destination); nb.start(t0); tn(70, 40, .35, 'sine', .3); },
    thudBig(v) { v = v == null ? .5 : v; nz(.3 + v * .25, 1200 + v * 500, 160, .22); tn(120, 45, .3, 'triangle', .16); tn(420, 300, .25, 'square', .03, .02); nz(.5, 5000, 3000, .03, .08); }
  }; })());

/* ---------------- game state ---------------- */
let state = 'menu', t = 0, dist = 0, speed = 0, coins = 0, best = +(localStorage.getItem('jd_best') || 0);
const hero = { x: 0, y: FLOOR, vy: 0, thrust: false, ground: true, landT: 0, rot: 0, run: 0, dead: false, vx: 0, bounce: 0, blink: 0 };
let holding = false;
let street = [], skyline = [], cars = [], npcs = [], obs = [], coinList = [], steam = [], sparks = [], stars = [];
let mobs = [], mobCD = 12; window.__mobsOn = () => mobs.some(m => m.x > 150 && m.x < 650); let nextObs = 0, nextNpc = 0, nextCar = 0, panicT = 0, deadT = 0;
let flashT = 0, flashCol = '#fff', shake = 0, banner = null, rings = [], veh = null, inv = 0, gifts = [], nextGift = 0, nextEidi = 0, eidi = 0, pops = [], dust = [], revived = 0;
const stats = { steamed: 0, dodged: 0, missed: 0 };

function seedStars() { stars = []; for (let i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random() * .55, r: Math.random() < .2 ? 1.2 : .7, p: Math.random() * 6 }); }
function reset() {
  t = 0; dist = 0; speed = 0; coins = 0; obs = []; coinList = []; steam = []; sparks = []; panicT = 0; deadT = 0;
  RUN = newRun(); lastCoin = 0; mtQueue = []; boost = null; usedSave = 0; $('hsBox') && $('hsBox').classList.remove('on'); heroImg = heroImgs[SHOP.outfit] || heroImgs.classic;
  flashT = 0; shake = 0; banner = null; rings = []; veh = null; inv = 0; gifts = []; eidi = 0; pops = []; dust = []; revived = 0; nextGift = 2200; nextEidi = 1600; stats.steamed = stats.dodged = stats.missed = 0;
  Object.assign(hero, { x: -40, y: FLOOR, vy: 0, thrust: false, ground: true, landT: 0, rot: 0, run: 0, dead: false, vx: 0, bounce: 0 });
  nextObs = 380; nextNpc = 0; nextCar = 0;
  if (!street.length) fillStreet(); if (!skyline.length) fillSkyline();
  if (!cars.length) for (let i = 0; i < 6; i++) spawnCar(Math.random() * W);
  if (!npcs.length) for (let i = 0; i < 5; i++) spawnNpc(60 + Math.random() * (W - 60));
}

/* street: a landmark, then 1–3 houses, then a landmark… (no repeats close together) */
let lastLm = [];
/* spacing (owner, 21 Nov): terraces and corner shops can join up, but standalone buildings get room either side, and the big stores
   and sites get a car-park-sized space, so a bungalow never sits right up against Tesco */
const BIG_LM = new Set(['tesco', 'currys', 'bandq', 'lidl', 'matalan', 'jdgyms', 'bigyellow', 'orbital', 'grandbazar', 'frasers', 'vauxhall', 'airport', 'ldh', 'stockwood', 'chiltern', 'uob', 'sixthform', 'inspire', 'marshfarm', 'venue', 'lutonhoo', 'foodbank', 'lewsey', 'masjid', 'masjidali', 'gurdwara', 'stmarys', 'galaxy', 'townhall', 'suffa', 'chaiiwala', 'barak', 'kaya', 'nadeem']);
const ATTACHED = new Set(['kahwa', 'gna', 'topspizza', 'alquds', 'krispy', 'toros', 'cycleking', 'oak', 'miamicrispy', 'periperi', 'smr', 'hatfactory']);
const DETACHED_H = new Set(['bungalow', 'newbuild']);
const rnd2 = (a, b) => a + Math.random() * (b - a);
function gapBetween(a, kind, key) { if (!a) return 0;
  if (a.kind === 'lm' && a.inSet) return 0;   // sets (Frasers → station → Hat Factory, Wardown, airport) stay together
  const bigA = a.kind === 'lm' && BIG_LM.has(a.key), bigB = kind === 'lm' && BIG_LM.has(key);
  if (bigA || bigB) return rnd2(26, 70);
  const detA = a.kind === 'hs' ? DETACHED_H.has(a.key) : !ATTACHED.has(a.key), detB = kind === 'hs' ? DETACHED_H.has(key) : !ATTACHED.has(key);
  if (a.kind === 'hs' && kind === 'hs' && !detA && !detB) return Math.random() < .6 ? 0 : rnd2(8, 28);   // rows of houses often join
  if (!detA && !detB) return Math.random() < .5 ? 0 : rnd2(6, 20);   // shop built onto a terrace
  return rnd2(10, 42); }
function nextBuilding() {
  const prev = street[street.length - 1];
  const wantLm = !prev || prev.kind === 'hs' && (prev.run || 0) >= 1 + (Math.random() * 2 | 0);
  if (setQ.length || wantLm) { let k;
    if (setQ.length) k = setQ.shift();
    else { let u; do { if (!deck.length) deck = buildDeck(); u = deck.shift().filter(x => x !== myMosque); } while (!u.length); k = u.shift(); setQ = u; }
    lastLm.push(k); if (lastLm.length > 10) lastLm.shift();
    const x = prev ? prev.x + prev.w + gapBetween(prev, 'lm', k) : -60;
    street.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * BS, inSet: setQ.length > 0 }); }
  else { if (!houseDeck.length) { houseDeck = HOUSE_K().slice(); for (let i = houseDeck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [houseDeck[i], houseDeck[j]] = [houseDeck[j], houseDeck[i]]; } }
    const k = houseDeck.shift(), x = prev ? prev.x + prev.w + gapBetween(prev, 'hs', k) : -60;
    street.push({ kind: 'hs', key: k, x, w: Math.round(HOUSES[k].w * 1.35) * BS, run: prev && prev.kind === 'hs' ? (prev.run || 1) + 1 : 1 }); }
}
const bakeQ = [];
function fillStreet() { while (!street.length || street[street.length - 1].x < W + 900) { nextBuilding(); const b = street[street.length - 1]; bakeQ.push(b); } }
function bakeOne() { const b = bakeQ.shift(); if (b) buildingCanvas(b.kind, b.key); }   // one picture per frame, well before it scrolls on   // built ~1.5 screens ahead so there's no hitch
function fillSkyline() { let x = skyline.length ? skyline[skyline.length - 1].x + skyline[skyline.length - 1].w : -100; while (x < W * 2.2) { if (!skyDeck.length) { skyDeck = STREET.slice(); for (let i = skyDeck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [skyDeck[i], skyDeck[j]] = [skyDeck[j], skyDeck[i]]; } } const k = skyDeck.shift(); if (!LANDMARKS[k] || k === myMosque || street.some(b => b.key === k)) continue; skyline.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * .5 }); x += LANDMARKS[k].w * .5 - 16; } }

/* ---------- traffic (ported from Flappy Kabootar, owner 21 Nov): two lanes, far lane drives left, near lane drives right.
   One car per lane space (they queue behind slower ones), overtaking when the other lane is clear, fly-pasts, police chases,
   blue-light runs (traffic pulls in), rare spin-outs and head-ons with a jam and horns. All with sound. ---------- */
const LD = (ROAD_B - 3) - (ROAD_T + 19), EMK = { police: 108, policevan: 100, ambulance: 96, fire: 82 }, CSC = 1.6, VK = 2.2;
let pairCD = 120, zoomCD = 20, crashCD = 60, otCD = 6, headCD = 120, jamT = 0, chaseCD = 90, hornT = 2, lastCarK = '';
const cBody = c => { const L = VEHICLES[c.k].w * CSC; return [c.x + 3 * CSC, c.x + 3 * CSC + L]; };
function pickCarK() { const ks = CAR_KEYS.filter(k => VEHICLES[k]), tot = ks.reduce((a, k) => a + (VEHICLES[k].weight || 1), 0);
  for (let n = 0; n < 4; n++) { let r = Math.random() * tot; for (const k of ks) { r -= VEHICLES[k].weight || 1; if (r <= 0) { if (k !== lastCarK || n === 3) { lastCarK = k; return k; } break; } } } return ks[0]; }
function spawnCar(x, key, zoom, laneF) {
  const k = key || pickCarK(), V = VEHICLES[k]; if (!V) return false;
  const lane = laneF != null ? laneF : (V.w > 105 || NEAR_ONLY[k]) ? 1 : Math.random() < .5 ? 0 : 1, dir = lane ? 1 : -1, L = V.w * CSC;
  const quick = !zoom && Math.random() < .15, v = zoom ? (130 + Math.random() * 110) * VK : ((V.speed ? V.speed[0] + Math.random() * (V.speed[1] - V.speed[0]) : 30) * VK) * (quick ? 1.35 : 1);
  const sv = dir * v - speed * .92, sx = x != null ? x : (sv > 0 ? -L - 30 : W + 30);
  if (cars.some(c => c.lane === lane && sx < c.x + c.L + 24 && c.x < sx + L + 24)) return false;
  const c = { k, ci: Math.random() * 6000 | 0, lane, dir, x: sx, v, cv: v, yo: 0, L, zoom: !!zoom }; cars.push(c);
  if (zoom) SFX.zoom(k === 'motorbike');
  if (EMK[k] && !zoom) { c.emerg = 1; c.rolled = c.headRolled = c.otRolled = 1;
    if (jamT <= 0 && k !== 'police' && Math.random() < .5) { c.run = 1; c.v = c.cv = EMK[k] * VK; if (k === 'fire') { SFX.neenaw(); SFX.airhorn(1.2); } else if (k === 'ambulance') SFX.wail(); else SFX.siren(); } }
  return c;
}
function startChase() { const ks = ['lambo', 'gt3', 'f812', 'c63', 'a45', 'urus', 'golfr', 'gwagon'], f = spawnCar(null, ks[Math.random() * ks.length | 0], true, 1); if (!f) return;
  f.v = f.cv = (150 + Math.random() * 50) * VK; f.flee = 1; const PL = VEHICLES.police.w * CSC;
  cars.push({ k: 'police', ci: 0, lane: f.lane, dir: f.dir, x: f.dir > 0 ? f.x - PL - 50 - Math.random() * 30 : f.x + f.L + 50 + Math.random() * 30, v: f.v + 6 * VK, cv: f.v + 6 * VK, yo: 0, L: PL, zoom: true, police: 1, run: 1, emerg: 1, rolled: 1, headRolled: 1 });
  chaseCD = 240 + Math.random() * 300; zoomCD = Math.max(zoomCD, 20); SFX.siren(); }
function hitCar(car, sp, fire) { car.crash = { t: 0, rot: 0, st: 'hit', road: true, spin: sp, v0: car.cv, len: .35, ty: car.yo, fire, snd: .9 }; car.ot = null; car.drift = null; }
function startJam(cx, T) { jamT = T; cars.forEach(o => { if (!o.crash) o.free = o.dir > 0 ? o.x > cx : o.x + o.L < cx; }); }
let csmoke = [];
function smokeAt(x, y, dark) { if (csmoke.length < 90) csmoke.push({ x, y, vx: (Math.random() - .5) * 20, vy: -14 - Math.random() * 12, r: 3, a: dark ? .6 : .45, dark }); }
window.__cars = () => cars;
function updateTraffic(dt, dx) {
  const moving = state !== 'dead' || speed > 5, scroll = dx * .92;
  cars.forEach(c => { let ahead = null, gap = 1e9;
    cars.forEach(o => { if (o === c || (o.crash && !o.crash.road) || (o.lane !== c.lane && !(o.crash && o.crash.road)) || (o.ot && o.ot.out > .5)) return; const d = c.dir > 0 ? o.x - (c.x + c.L) : c.x - (o.x + o.L); if (d > -4 && d < gap) { gap = d; ahead = o; } });
    if (!c.ot && !c.emerg && !c.crash && jamT <= 0 && ahead && gap < 60 && ((c.zoom && !(c.police && ahead.flee)) || (c.v > ahead.cv + 6 * VK && !c.otRolled && (c.otRolled = 1) && otCD <= 0 && Math.random() < .35)) && c.L < 140) {
      const vo = c.zoom ? c.v : Math.max(c.v, ahead.cv + 34 * VK) * 1.35, rel = Math.max(20, vo - ahead.cv), Tp = (gap + ahead.L + c.L + 40) / rel + .9;
      const need = vo * Tp + 60, x0 = c.dir > 0 ? c.x - 10 : c.x - need, x1 = c.dir > 0 ? c.x + c.L + need : c.x + c.L + 10;
      const clear = !cars.some(o => { if (o === c || o.crash) return false; if (o.lane === c.lane && !(o.ot && o.ot.out > .2)) return false; const reach = o.dir === c.dir ? 0 : o.cv * Tp;
        return c.dir > 0 ? o.x < x1 + reach && o.x + o.L > c.x - 10 : o.x + o.L > x0 - reach && o.x < c.x + c.L + 10; });
      if (clear) { c.ot = { out: 0, past: ahead }; if (!c.zoom) otCD = 14 + Math.random() * 22; if (c.x > -40 && c.x < W + 40) SFX.rev(c.k === 'motorbike'); }
    }
    if (c.crash) return;
    if (c.ot) { const o = c.ot, side = c.lane ? -1 : 1;
      if (!o.abort && o.out > .2) { const fx = c.dir > 0 ? c.x + c.L : c.x; if (cars.some(q => q !== c && !q.crash && q.lane !== c.lane && (c.dir > 0 ? q.x > fx - 4 && q.x < fx + 90 : q.x + q.L < fx + 4 && q.x + q.L > fx - 90))) o.abort = true; }
      if (o.abort) { o.out = Math.max(0, o.out - dt * 3); c.yo = side * LD * (o.out * o.out * (3 - 2 * o.out)); c.cv = Math.min(c.v, o.past.cv) * .8; if (o.out <= 0) { c.ot = null; c.yo = 0; } return; }
      const passed = !cars.includes(o.past) || (c.dir > 0 ? c.x > o.past.x + o.past.L + 20 : c.x + c.L < o.past.x - 20);
      o.out = Math.max(0, Math.min(1, o.out + (passed ? -dt * 2.2 : dt * 2.4))); c.yo = side * LD * (o.out * o.out * (3 - 2 * o.out));
      c.cv = c.zoom ? c.v : Math.max(c.v, o.past.cv + 34 * VK) * 1.35; if (passed && o.out <= 0) { c.ot = null; c.yo = 0; } return; }
    let tg = ahead && gap < 40 ? Math.min(c.v, ahead.crash ? 0 : ahead.cv) * (gap < 14 ? .85 : 1) : c.v;
    if (jamT > 0 && !c.free && !ahead && c.x > -10 && c.x + c.L < W + 10 && (c.dir > 0 ? c.x > W * .25 : c.x < W * .75)) tg = 0;
    if (c.drift) tg = c.v; if (c.pull) tg *= 1 - .65 * c.pull; if (c.run) tg = c.v * (c.out > .5 || !ahead ? 1 : .55);
    c.cv = c.cv + (tg - c.cv) * Math.min(1, dt * (tg < c.cv ? 5 : 1.1)); if (ahead && gap < 4 && !(c.run && c.out > .4)) c.cv = Math.min(c.cv, ahead.cv); });
  // blue lights: others slow and tuck in to the kerb, the emergency vehicle goes down the middle
  const RUNS = cars.filter(e => e.run && !e.crash);
  cars.forEach(c => { if (c.run || c.crash || c.drift || c.flee || c.zoom) return; let near = false;
    RUNS.forEach(e => { const dd = e.dir > 0 ? c.x - (e.x + e.L) : e.x - (c.x + c.L); if (dd > -c.L - e.L && dd < (e.lane === c.lane ? 220 : 160)) near = true; });
    c.pull = (c.pull || 0) + ((near ? 1 : 0) - (c.pull || 0)) * Math.min(1, dt * 2.5); if (c.pull < .01) c.pull = 0; if (!c.ot && c.pull) c.yo = (c.lane ? 1 : -1) * 4 * c.pull; });
  RUNS.forEach(e => { if (e.police && e.zoom) return; const blk = cars.some(o => o !== e && !o.crash && o.lane === e.lane && (() => { const q = e.dir > 0 ? o.x - (e.x + e.L) : e.x - (o.x + o.L); return q > -o.L && q < 100; })());
    e.out = (e.out || 0) + ((blk ? 1 : 0) - (e.out || 0)) * Math.min(1, dt * 2); e.yo = (e.lane ? -1 : 1) * LD * .5 * e.out; });
  if (jamT > 0 && jamT < 60) { hornT -= dt; if (hornT <= 0) { hornT = 1.5 + Math.random() * 4; SFX.horn(Math.random()); } }
  otCD -= dt; crashCD -= dt; headCD -= dt; if (jamT > 0) { jamT -= dt; if (jamT <= 0) cars.forEach(c => c.free = 0); }
  // head-on: about 1 in 200 meetings, never twice close together
  if (moving && (headCD <= 0 && jamT <= 0 || window.__headOn)) cars.forEach(c => { if ((headCD > 0 && !window.__headOn) || c.headRolled || c.crash || c.ot || c.drift || /bike|moped|escooter/.test(c.k)) return;
    const q = cars.find(o => o.lane !== c.lane && !o.crash && !o.ot && !o.police && !o.flee && !o.run && (() => { const d = c.dir > 0 ? o.x - (c.x + c.L) : c.x - (o.x + o.L); return d > 80 && d < 260; })());
    if (!q || c.x < 0 || c.x + c.L > W) return; c.headRolled = 1; if (Math.random() < (window.__headOn ? 1 : .005)) { c.drift = { q, out: 0 }; headCD = 300; } });
  cars.forEach(c => { const d = c.drift; if (!d) return; const q = d.q; if (!cars.includes(q) || q.crash) { c.drift = null; c.yo = 0; return; }
    d.out = Math.min(.62, d.out + dt * .45); c.yo = (c.lane ? -1 : 1) * LD * d.out;
    if (d.out > .35 && c.x < q.x + q.L && q.x < c.x + c.L) { hitCar(c, (Math.random() < .5 ? 1 : -1) * (1 + Math.random() * 1.5), window.__headOn || Math.random() < .25); hitCar(q, (Math.random() < .5 ? 1 : -1) * (.8 + Math.random() * 1.2), false); window.__headOn = 0;
      SFX.crash(); SFX.thudBig(1); SFX.bump(); shake = Math.max(shake, .25); const cx = c.x + c.L / 2; startJam(cx, 45 + Math.random() * 30); for (let i = 0; i < 10; i++) smokeAt(cx + (Math.random() - .5) * 30, ROAD_T + 19 + LD * .5 - 8); } });
  // spin-outs: a fast car loses it (far side: stops in the road and causes a jam; near side: ends up against the kerb)
  cars.forEach(c => { if (c.rolled || c.police || c.crash || c.drift || c.ot || c.L > 145 || /bike|moped|escooter/.test(c.k) || !(c.zoom || c.v > 62 * VK) || c.x < W * .35 || c.x > W * .8 || !moving) return; c.rolled = 1;
    if ((crashCD > 0 || Math.random() > .017) && !window.__spin) return; window.__spin = 0;
    const st = ['spin', 'spin', 'slide', 'side'][Math.random() * 4 | 0];
    c.crash = { t: 0, rot: 0, st, spin: (Math.random() < .5 ? 1 : -1) * (st === 'slide' ? 1.6 : st === 'spin' ? 4 : 6 + Math.random() * 4), v0: c.cv, len: 1 + Math.random() * .7, ty: c.lane ? 5 : LD * (.3 + Math.random() * .35), road: !c.lane, fire: Math.random() < .3, snd: Math.random() };
    crashCD = 240; SFX.skid(c.crash.snd); if (!c.lane) startJam(c.x + c.L / 2, 25 + Math.random() * 25); });
  cars.forEach(c => { const k = c.crash; if (k) { k.t += dt; const sl = Math.max(0, 1 - k.t / k.len); c.cv = k.v0 * sl * sl; c.yo += (k.ty - c.yo) * Math.min(1, dt * 2.2); if (k.st === 'hit') k.rot = k.spin * .12 * Math.min(1, k.t / k.len);
      if (sl > 0) k.rot += k.spin * dt * sl; else if (!k.done) { k.done = true; SFX.thudBig(k.snd); }
      if (k.st === 'side' && !k.b1 && k.t > k.len * .4) { k.b1 = 1; SFX.bump(); }
      if (k.done && k.st !== 'hit') { const want = k.st === 'side' ? Math.PI / 2 * Math.sign(k.spin) : 0, cur = ((k.rot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); let dl = want - cur; dl = ((dl + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; k.rot += dl * Math.min(1, dt * 4); }
      if (k.t < (k.fire ? 9 : 4) && Math.random() < dt * (k.fire ? 14 : 9)) smokeAt(c.x + c.L / 2 + (Math.random() - .5) * c.L * .5, (c.lane ? ROAD_B - 14 : ROAD_T + 10) + c.yo, k.fire); }
    c.x += c.dir * c.cv * dt - scroll; c.roll = (c.roll || 0) + c.cv * dt; });
  pairCD -= dt; if (moving && jamT <= 0 && (pairCD <= 0 && Math.random() < dt * .01 || window.__pair)) { const lane = Math.random() < .5 ? 0 : 1, r = spawnCar(null, 'reliant', false, lane);
    if (r) { window.__pair = 0; r.v = r.cv = 26 * VK; r.rolled = r.headRolled = r.otRolled = 1; const ML = VEHICLES.mini.w * CSC, mx = r.dir > 0 ? r.x - ML - 6 : r.x + r.L + 6;
      cars.push({ k: 'mini', ci: 0, lane, dir: r.dir, x: mx, v: r.v, cv: r.v, yo: 0, L: ML, rolled: 1, headRolled: 1, otRolled: 1, tail: r, beepT: 1 }); pairCD = 200 + Math.random() * 200; } }
  cars.forEach(c => { if (!c.tail) return; const r = c.tail; if (!cars.includes(r) || r.crash) { c.tail = null; return; }   // stays glued to the three-wheeler's bumper
    const gap = c.dir > 0 ? r.x - (c.x + c.L) : c.x - (r.x + r.L); c.cv = r.cv + (gap - 5) * 2; c.ot = null;
    if ((c.beepT -= dt) <= 0) { c.beepT = 1.6 + Math.random() * 2.4; if (c.x > -40 && c.x < W + 40) SFX.horn(Math.random() * .6); } });
  chaseCD -= dt; if (moving && jamT <= 0 && (chaseCD <= 0 && Math.random() < dt * .02 || window.__chase)) { window.__chase = 0; startChase(); }
  zoomCD -= dt; if (moving && jamT <= 0 && zoomCD <= 0 && Math.random() < dt * .03) { const ks = ['lambo', 'f812', 'gt3', 'golfr', 'c63', 'urus', 'a45', 'motorbike', 'motorbike']; if (spawnCar(null, ks[Math.random() * ks.length | 0], true)) zoomCD = 30 + Math.random() * 40; }
  cars.forEach(c => { if ((c.zoom && Math.random() < dt * 30) || (c.ot && c.ot.out > .1 && Math.random() < dt * 16)) dust.push({ x: c.dir > 0 ? c.x : c.x + c.L + 6, y: (c.lane ? ROAD_B - 5 : ROAD_T + 17) + c.yo, vx: -c.dir * 30 - scroll / dt * 0, vy: -6, r: 1.5, l: .5 }); });
  for (let i = csmoke.length - 1; i >= 0; i--) { const p = csmoke[i]; p.x += p.vx * dt - scroll; p.y += p.vy * dt; p.r += 9 * dt; p.a -= .4 * dt; if (p.a <= 0) csmoke.splice(i, 1); }
  cars = cars.filter(c => c.x > -c.L - 300 && c.x < W + 320);
  if (cars.length < (jamT > 0 ? 10 : 5) && Math.random() < dt * (jamT > 0 ? 2.5 : 1)) spawnCar();
}
function spawnNpc(x) {
  if (!NPC_KEYS.length) return;
  const chair = CHAIR_KEYS.length && Math.random() < .01, esc = !chair && Math.random() < .16;   // wheelchair users: 1 in 100 people
  let k; if (chair) k = CHAIR_KEYS[Math.random() * CHAIR_KEYS.length | 0]; else if (esc) k = ESC_KEYS[Math.random() * ESC_KEYS.length | 0];
  else { let r = Math.random() * NPC_W; k = NPC_KEYS.find(q => (r -= NPC_META[q].wt || 1) <= 0) || NPC_KEYS[0]; }
  npcGet(k); const dir = Math.random() < .5 ? -1 : 1;
  npcs.push({ k, esc: esc || chair, chair, x: x !== undefined ? x : (dir > 0 && esc ? -90 : W + 60), y: PAVE_T + 16 + Math.random() * 22, dir, v: esc ? 70 + Math.random() * 50 : chair ? 14 + Math.random() * 8 : 16 + Math.random() * 14,
    ph: Math.random() * 4, react: 0, hop: 0, hopH: 9, look: 0, blink: 1 + Math.random() * 4, mood: '', moodT: 0, fall: 0, fallDir: 1, idle: 2 + Math.random() * 6, done: 0 });
}

/* ---------------- obstacles + coins ---------------- */
function spawnPattern() {
  const x0 = W + 60, top = CEIL + 14, bot = FLOOR - 14, r = Math.random(), m = dist / 10;
  if (r < .3) { // line / wave of coins
    const n = 8 + (Math.random() * 8 | 0), y0 = top + 20 + Math.random() * (bot - top - 60), wave = Math.random() < .5;
    for (let i = 0; i < n; i++) coinList.push({ x: x0 + i * 18, y: y0 + (wave ? Math.sin(i / 2.2) * 26 : 0), got: 0 });
    return 140 + n * 18;
  }
  if (r < .42) { // block of coins
    const cols = 6 + (Math.random() * 5 | 0), rows = 3 + (Math.random() * 2 | 0), y0 = top + 20 + Math.random() * (bot - top - rows * 18 - 30);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) coinList.push({ x: x0 + i * 18, y: y0 + j * 18, got: 0 });
    return 160 + cols * 18;
  }
  if (r < .62 && r >= .5 && m > 150 && !obs.some(o => o.type === 'laser')) { // speed-camera lasers: slide in, warn, fire, slide out (they stay on screen, not scrolling)
    const n = 1 + (Math.random() * (m > 400 ? 3 : 2) | 0), ys = [];
    const lanes = [CEIL + 40, (CEIL + FLOOR) / 2 - 30, (CEIL + FLOOR) / 2 + 20, FLOOR - 40]; while (ys.length < n) { const y = lanes[Math.random() * 4 | 0]; if (!ys.includes(y)) ys.push(y); }
    ys.forEach((y, i) => obs.push({ type: 'laser', x: W / 2, y, ph: 'in', pt: 0, slide: 0, d: i * .12 }));
    return speed * 3.6;
  }
  if (r < .5 && m > 120) { // firework rocket with a warning
    if (m > 700 && Math.random() < .4) { [-70, 0, 70].forEach((oy, i) => obs.push({ type: 'rocket', x: W + 40 + i * 30, y: hero.y - 30 + oy, warn: 1.5 + i * .25, lock: 0, v: 0, off: oy })); SFX.warn(); return 320; }
    obs.push({ type: 'rocket', x: W + 40, y: hero.y - 30, warn: 1.5, lock: 0, v: 0 }); SFX.warn();
    return 200;
  }
  // sparking cable between two insulators: vertical, horizontal, diagonal, sometimes spinning
  const kind = Math.random(), len = 70 + Math.random() * 60 + Math.min(40, m / 20);
  let ang = kind < .35 ? Math.PI / 2 : kind < .6 ? 0 : kind < .85 ? (Math.random() < .5 ? .7 : -.7) : 0;
  const spin = kind >= .85 && m > 60 ? (Math.random() < .5 ? 1 : -1) * (.9 + Math.random() * .8) : 0;
  const half = Math.abs(Math.sin(ang)) * len / 2 + 8;
  const cy = top + half + Math.random() * Math.max(1, (bot - top) - 2 * half);
  obs.push({ type: 'zap', x: x0 + len / 2, y: spin ? (top + bot) / 2 : cy, len: spin ? 80 : len, ang, spin, seed: Math.random() * 99 });
  if (Math.random() < .6) { const off = (cy < (top + bot) / 2 ? 60 : -60); for (let i = 0; i < 5; i++) coinList.push({ x: x0 + len + 30 + i * 18, y: Math.min(bot - 10, Math.max(top + 10, cy + off)), got: 0 }); }
  return 190 + len * .6 + Math.random() * 90;
}

/* hero hit circles (world units, relative to feet) */
function heroCircles() { const x = hero.x, y = hero.y, k = HS; if (boost && !boost.out) return [[x, y - 40, 20]]; if (veh) return vehCircles(); return [[x + 2 * k, y - 21 * k, 6.5 * k], [x + 5 * k, y - 39 * k, 6 * k]]; }
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let k = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; k = Math.max(0, Math.min(1, k)); const qx = ax + dx * k - px, qy = ay + dy * k - py; return Math.sqrt(qx * qx + qy * qy); }

function die(why) {
  if (boost && !boost.out) return;
  if (hero.dead || inv > 0) return;
  if (veh && veh.k === 'tuktuk' && veh.nb > .4) { inv = .35; shake = .2; flashT = .08; flashCol = '255,220,120'; SFX.boom(); pops.push({ x: hero.x + 20, y: hero.y - 90, txt: 'SMASH!', col: '#ffd21f', t: 0 }); for (let i = 0; i < 18; i++) sparks.push({ x: hero.x + 30, y: hero.y - 30, vx: Math.random() * 260, vy: (Math.random() - .5) * 260, l: .5, c: ['#ffd75a', '#ffffff', '#ff9a2a'][i % 3] }); return; }
  if (veh) { vehCrash(); return; }
  hero.dead = true; hero.vx = speed; hero.vy = -140; hero.flail = 0; hero.squash = 0; hero.bounce = 0; hero.slide = 0; hero.restT = 0; deadT = 0; state = 'dead'; holding = false;
  hero.shockT = why === 'rocket' ? 0 : .5; if (why === 'rocket') hero.vy = -260; flashT = .18; flashCol = why === 'rocket' ? '255,170,60' : why === 'laser' ? '230,110,255' : '200,240,255'; shake = .35;
  if (why === 'zap') { SFX.zap(); for (let i = 0; i < 30; i++) sparks.push({ x: hero.x, y: hero.y - 30, vx: (Math.random() - .5) * 260, vy: (Math.random() - .5) * 260, l: .5 + Math.random() * .4, c: Math.random() < .5 ? '#bff4ff' : '#fff6a8' }); }
  else if (why === 'laser') { SFX.zap(); for (let i = 0; i < 26; i++) sparks.push({ x: hero.x, y: hero.y - 30, vx: (Math.random() - .5) * 260, vy: (Math.random() - .5) * 260, l: .5 + Math.random() * .4, c: Math.random() < .5 ? '#ffd0d0' : '#ff5050' }); }
  else { SFX.boom(); for (let i = 0; i < 40; i++) sparks.push({ x: hero.x + 10, y: hero.y - 30, vx: (Math.random() - .5) * 320, vy: (Math.random() - .7) * 300, l: .6 + Math.random() * .5, c: ['#ff5a3a', '#ffd75a', '#ffffff', '#ff9a2a'][i % 4] }); }
}

/* ---------------- update ---------------- */
function update(dt) {
  t += dt;
  const playing = state === 'play' || state === 'intro';
  // speed: walk-in, then builds up over the run (Jetpack-style)
  if (state === 'intro') speed += (120 - speed) * Math.min(1, dt * 2);
  else if (state === 'play' && boost) speed = boost.out ? speed + (Math.min(300, 150 + dist * .012) - speed) * Math.min(1, dt * 3) : Math.min(1150, speed + 1500 * dt);
  else if (state === 'play') speed = Math.min(300, 150 + dist * .012);
  else if (state === 'dead') speed = hero.shockT > 0 ? speed * Math.pow(.25, dt) : Math.max(0, speed - (hero.slide ? 75 : 30) * dt);
  else if (state === 'menu') speed = 55;
  if (state === 'play' && veh && veh.nb) speed *= 1 + .8 * veh.nb;   // tuk-tuk nitro
  const dx = speed * dt; if (state !== 'menu') dist += dx;

  // scroll the world
  street.forEach(b => { b.x -= dx; if (!b.past && b.kind === 'lm' && MOSQUE_K.includes(b.key) && b.x + b.w < hero.x && state === 'play') { b.past = 1; passed++; } }); while (street.length && street[0].x + street[0].w + 40 < -20) street.shift(); fillStreet();
  skyline.forEach(b => b.x -= dx * .32); while (skyline.length && skyline[0].x + skyline[0].w < -50) skyline.shift(); fillSkyline();
  updateTraffic(dt, dx);

  // now and then an older gent on a mobility scooter trundles along the pavement (owner, 21 Nov); people step round him
  mobCD -= dt; if (state !== 'menu' && mobCD <= 0) { mobCD = 35 + Math.random() * 50; const d = Math.random() < .5 ? -1 : 1; mobs.push({ x: W + 30, d, v: 20 + Math.random() * 8, ci: Math.random() * 3 | 0, y: PAVE_T + 30 + Math.random() * 8, roll: 0 }); }
  mobs.forEach(m => { m.x += m.d * m.v * dt - dx; m.roll += m.v * dt; }); mobs = mobs.filter(m => m.x > -200 && m.x < W + 200);
  // people on the front pavement
  npcs.forEach(p => {
    if (p.flee > 0) { p.flee -= dt; p.idle = 3; }
    const busy = (p.react > 0 || p.fall > 0 || p.moodT > 0 || p.idle < 0) && !(p.flee > 0);
    const mv = p.fall > 0 ? 0 : p.esc ? 1 : p.flee > 0 ? 3.4 : busy ? (p.mood === 'cheer' ? .3 : .1) : 1;
    p.x += p.dir * p.v * mv * dt - dx; if (!busy || p.esc) p.ph += dt * (p.esc ? 14 : p.v * .32 * (p.flee > 0 ? 3 : 1));
    p.blink -= dt; if (p.blink < -.13) p.blink = 1.5 + Math.random() * 4;
    if (!p.esc) { p.idle -= dt; if (p.idle < -1.6) p.idle = 4 + Math.random() * 8; }   // now and then stop and look round
    if (p.react > 0) p.react -= dt; if (p.moodT > 0) p.moodT -= dt; if (p.hop > 0) p.hop = Math.max(0, p.hop - dt * 2.6);
    if (p.fall > 0) { p.fall -= dt; if (!p.landed && p.fall0 - p.fall > .2) { p.landed = 1; for (let i = 0; i < 5; i++) dust.push({ x: p.x + p.fallDir * 14 + (Math.random() - .5) * 18, y: p.y, vx: (Math.random() - .5) * 70, vy: -Math.random() * 20, r: 2, l: .4 }); } }
    if (state === 'menu' || p.fall > 0) return;
    const ddx = hero.x - p.x, ad = Math.abs(ddx), up = FLOOR - hero.y;
    if (hero.dead) {   // he tumbles into people: they go over (cartoon), see stars, get back up
      if (!p.esc && ad < 26 && up < 40 && Math.abs(hero.vx) > 20 && !p.done) { p.fall = 99; p.fall0 = 99; p.landed = 0; p.fallDir = ddx > 0 ? -1 : 1; p.done = 1; SFX.thud(); }
      return;
    }
    if (state !== 'play') return;
    // the steam blast from the cooker knocks people over (Jetpack Joyride's bullets): only right under the nozzle, close to the ground
    if (hero.thrust && !veh && !p.esc && p.fall <= 0 && Math.abs(p.x - nozzle()[0] + 4) < 11 && FLOOR - hero.y < 210) {
      p.fall = 99; p.fall0 = 99; p.landed = 0; p.fallDir = p.x < hero.x ? -1 : 1; p.done = 1; stats.steamed++; RUN.steamed++; tone(220, .12, 'triangle', .07, .6);
      for (let i = 0; i < 8; i++) steam.push({ x: p.x + (Math.random() - .5) * 14, y: p.y - Math.random() * 24, vx: (Math.random() - .5) * 90, vy: -Math.random() * 40, r: 3 + Math.random() * 3, l: .5, l0: .7 });
      return;
    }
    if (p.flee > 0) return;
    if (!p.done && hero.ground && ddx < 0 && ad < 70) { p.done = 1; p.react = .7; p.hop = 1; p.hopH = 24; p.look = -1; }          // jump out of his way
    else if (!p.done && ad < 80 && up < 130) { p.done = 1; p.react = 1.1; p.hop = 1; p.hopH = 9; p.look = ddx > 0 ? 1 : -1; }    // he whooshes past low: shocked
    else if (!p.done && ad < 60 && up >= 130) { const fan = /fan/.test(p.k);                                                       // he flies over high
      if (fan || Math.random() < .45) { p.done = 1; p.mood = 'cheer'; p.moodT = 1.3; RUN.cheer++; p.look = ddx > 0 ? 1 : -1; p.hop = 1; p.hopH = 6; } else p.done = 1; }
    if (p.done && ad > 160) p.done = 0;
  });
  npcs = npcs.filter(p => p.x > -140 && p.x < W + 160);
  if ((nextNpc -= dt) <= 0) { spawnNpc(); nextNpc = .9 + Math.random() * 2.2; }

  // hero
  if (state === 'intro') { hero.x += (W * .28 - hero.x) * Math.min(1, dt * 2.2) + 30 * dt; if (hero.x >= W * .28 - 2) { hero.x = W * .28; state = 'play'; runStarted(); } }
  if (inv > 0) inv -= dt;
  if (boost) boostUpdate(dt);
  if (playing && !hero.dead && boost && !boost.out) { /* riding on the Corolla roof */ }
  else if (playing && !hero.dead && veh) vehUpdate(dt);
  else if (playing && !hero.dead) {
    hero.thrust = holding && state === 'play';
    if (hero.thrust) { if (!hero.wasThrust) { hero.vy = Math.min(hero.vy, -90); for (let i = 0; i < 8; i++) { const nz = nozzle(); steam.push({ x: nz[0], y: nz[1], vx: -speed * .3 - 40 - Math.random() * 60, vy: 120 + Math.random() * 120, r: 3 + Math.random() * 2.5, l: .45, l0: .6 }); } } hero.vy -= 1900 * dt; hero.ground = false; if (hissG && sndOn) hissG.gain.setTargetAtTime(.05, AC.currentTime, .03); }
    else if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
    hero.wasThrust = hero.thrust; hero.vy += (hasG('chappal') ? 1150 : 820) * dt; hero.vy = Math.max(-300, Math.min(hasG('chappal') ? 540 : 420, hero.vy)); hero.y += hero.vy * dt;
    if (hero.y >= FLOOR) { if (!hero.ground && hero.vy > 120) { hero.landT = .14; tone(180, .08, 'triangle', .08); for (let i = 0; i < 6; i++) dust.push({ x: hero.x + (Math.random() - .5) * 20, y: FLOOR, vx: (Math.random() - .5) * 120, vy: -Math.random() * 30, r: 2, l: .45 }); npcs.forEach(p => { if (!p.esc && p.fall <= 0 && Math.abs(p.x - hero.x) < 150) { p.flee = 1.6 + Math.random() * .8; p.dir = p.x > hero.x ? 1 : -1; } }); } hero.y = FLOOR; hero.vy = 0; hero.ground = true; }
    if (hero.y - HH < CEIL) { hero.y = CEIL + HH; hero.vy = Math.max(0, hero.vy); }
    hero.landT -= dt; hero.run += dt * (6 + speed / 22);
    hero.rot += ((hero.ground ? 0 : Math.max(-.18, Math.min(.22, hero.vy / 1400))) - hero.rot) * Math.min(1, dt * 8);
    // steam out of the nozzle
    const nz = nozzle();
    if (hero.thrust) for (let i = 0; i < 2; i++) steam.push({ x: nz[0] + (Math.random() - .5) * 3, y: nz[1], vx: -speed * .35 - 30 - Math.random() * 40, vy: 150 + Math.random() * 90, r: 2.5 + Math.random() * 2, l: .5 + Math.random() * .35, l0: .8 });
    else if (Math.random() < dt * 10) steam.push({ x: nz[0], y: nz[1], vx: -speed * .3 - 10, vy: 30, r: 1.6, l: .4, l0: .4 });
  } else if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
  if (state === 'menu') { hero.x = -200; hero.y = FLOOR; }
  if (hero.dead) {
    deadT += dt;
    if (hero.shockT > 0) { hero.shockT -= dt; if (hero.shockT <= 0) { hero.vy = -120; } }        // frozen, frazzled for a moment
    else {
      hero.vy += 1100 * dt; hero.y += hero.vy * dt;
      if (!hero.slide) { hero.rot += dt * (3.2 + hero.vx / 160); hero.flail = (hero.flail || 0) + dt; } if (hero.squash > 0) hero.squash = Math.max(0, hero.squash - dt * 4);
      if (hero.y >= FLOOR + 4) { hero.y = FLOOR + 4;
        if (hero.bounce < 2 && hero.vy > 90) { hero.vy = -hero.vy * .42; hero.bounce++; hero.squash = 1; hero.rot += 1.2; SFX.thud(); shake = .15; for (let i = 0; i < 8; i++) dust.push({ x: hero.x + (Math.random() - .5) * 24, y: FLOOR + 2, vx: (Math.random() - .5) * 140, vy: -Math.random() * 50, r: 2.5, l: .5 }); }
        else { hero.vy = 0; hero.slide = 1; { const tgt = -Math.PI / 2, cur = ((hero.rot % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI; hero.rot = cur + (tgt - cur) * Math.min(1, dt * 10); }   // ends up on his back, sliding
          if (speed > 8 && Math.random() < .8) dust.push({ x: hero.x - 12 + (Math.random() - .5) * 10, y: FLOOR + 3, vx: -speed * .3 - Math.random() * 40, vy: -Math.random() * 25, r: 1.8 + Math.random() * 1.5, l: .55 }); } }
    }
    if (hero.slide && speed <= 2) { hero.restT = (hero.restT || 0) + dt; if (hero.restT > .7 && $('over').classList.contains('hide') && $('eidiBox').classList.contains('hide')) endRun(); }
  }

  // obstacles
  if (state === 'play' && !boost) { nextObs -= dx; if (nextObs <= 0) nextObs = spawnPattern(); }
  panicT = Math.max(0, panicT - dt);
  obs.forEach(o => {
    if (o.type === 'zap') { o.x -= dx; if (o.spin) o.ang += o.spin * dt; if (!o.passed && o.x + o.len / 2 < hero.x - 20 && !hero.dead) { o.passed = 1; stats.dodged++; } }
    if (o.type === 'laser') { if (o.d > 0) { o.d -= dt; return; } o.pt += dt;
      if (o.ph === 'in') { o.slide = Math.min(1, o.pt / .4); if (o.pt > .4) { o.ph = 'warn'; o.pt = 0; } }
      else if (o.ph === 'warn') { if ((o.pt * 5 | 0) !== ((o.pt - dt) * 5 | 0)) tone(1200, .05, 'square', .03); if (o.pt > 1.45) { o.ph = 'fire'; o.pt = 0; tone(140, 1, 'sawtooth', .07, .9); shake = Math.max(shake, .1); } }
      else if (o.ph === 'fire') { if (o.pt > 1.15) { o.ph = 'out'; o.pt = 0; if (!hero.dead) { stats.dodged++; RUN.lasers++; } } }
      else if (o.ph === 'out') { o.slide = 1 - Math.min(1, o.pt / .4); if (o.pt > .4) o.x = -999; } }
    if (o.type === 'rocket') {
      if (o.warn > 0) { o.warn -= dt; o.y += (Math.max(CEIL + 12, Math.min(FLOOR - 12, hero.y - 30 + (o.off || 0))) - o.y) * Math.min(1, dt * 3); panicT = .3; if ((o.warn * 6 | 0) !== ((o.warn + dt) * 6 | 0)) SFX.warn(); if (o.warn <= 0) { o.lock = .45; } }
      else if (o.lock > 0) { o.lock -= dt; panicT = .3; if (o.lock <= 0) { o.v = speed + 360; SFX.whoosh(); } }
      else { o.x -= o.v * dt; o.tr = o.tr || []; o.trT = (o.trT || 0) + dt; if (o.trT > .018) { o.trT = 0; o.tr.push({ x: o.x + 22, y: o.y + (Math.random() - .5) * 2, a: 0, r: 2 + Math.random() * 1.5 }); } o.tr.forEach(p => { p.a += dt; p.r += dt * 9; p.y -= dt * 4; }); while (o.tr.length && o.tr[0].a > 1.1) o.tr.shift(); }
    }
    if (!hero.dead && (state === 'play')) {
      const hc = heroCircles();
      if (o.type === 'zap') { const ax = o.x - Math.cos(o.ang) * o.len / 2, ay = o.y - Math.sin(o.ang) * o.len / 2, bx = o.x + Math.cos(o.ang) * o.len / 2, by = o.y + Math.sin(o.ang) * o.len / 2;
        if (hc.some(([x, y, r]) => segDist(x, y, ax, ay, bx, by) < r + 1.5)) die('zap'); }
      if (o.type === 'rocket' && o.v && hc.some(([x, y, r]) => Math.hypot(x - o.x, y - o.y) < r + 4)) die('rocket');
      if (o.type === 'laser' && o.ph === 'fire' && hc.some(([x, y, r]) => Math.abs(y - o.y) < r + 2.5)) die('laser');
    }
  });
  obs = obs.filter(o => o.x > -200);
  if (state === 'play' || state === 'intro') giftsUpdate(dt, dx);
  rings.forEach(r => r.t += dt); rings = rings.filter(r => r.t < .6);
  pops.forEach(p => { p.t += dt; p.y -= 18 * dt; }); pops = pops.filter(p => p.t < 1.1);
  dust.forEach(p => { p.x += p.vx * dt - dx; p.y += p.vy * dt; p.vy += 60 * dt; p.r += dt * 9; p.l -= dt; }); dust = dust.filter(p => p.l > 0);
  if (flashT > 0) flashT -= dt; if (shake > 0) shake -= dt; if (banner) { banner.t += dt; if (banner.t > 1.8) banner = null; }
  // coins
  coinList.forEach(c => { c.x -= dx;
    if (!c.got && !hero.dead && state === 'play' && (hasG('tin') || (veh && (veh.k === 'kabootar' || veh.nb > .3)) || boost)) { const hx = hero.x + 4, hy = hero.y - (veh && veh.k === 'kabootar' ? 60 : 36), d = Math.hypot(hx - c.x, hy - c.y); if (d < (boost ? 260 : 170) || c.mag) { c.mag = 1; const k = Math.min(1, dt * 9); c.x += (hx - c.x) * k; c.y += (hy - c.y) * k; } }
    if (!c.got && !hero.dead && state === 'play') { const hc = heroCircles(); if (hc.some(([x, y, r]) => Math.hypot(x - c.x, y - c.y) < r + COIN_R + 2)) { c.got = 1; coins++; if (veh && veh.k === 'tuktuk') veh.fuel = Math.min(1, veh.fuel + .04); lastCoin = dist; SFX.coin(); for (let i = 0; i < 5; i++) sparks.push({ x: c.x, y: c.y, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, l: .3, c: '#fff3b0' }); } } });
  coinList.forEach(c => { if (!c.got && c.x < -18 && !c.m) { c.m = 1; stats.missed++; } });
  coinList = coinList.filter(c => c.x > -20 && !c.got);
  // particles
  steam.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= Math.pow(.25, dt); p.vx *= Math.pow(.6, dt); p.r += dt * 16; p.l -= dt; if (p.y > FLOOR + 4) { p.y = FLOOR + 4; p.vy = -p.vy * .2; p.vx -= 40 * dt * 10; } });
  steam = steam.filter(p => p.l > 0);
  sparks.forEach(p => { p.x += p.vx * dt - dx * .3; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt; }); sparks = sparks.filter(p => p.l > 0);
  if (state === 'play') { if (hero.ground && !veh) RUN.groundm += dx / 10; RUN.nocoin = Math.max(RUN.nocoin, (dist - lastCoin) / 10); missionsTick(dt); }
  if (state === 'dead' && hero.slide) RUN.slide += dx / 10;
  if (state === 'play' || state === 'dead') { $('dist').textContent = Math.floor(dist / 10) + 'm'; $('coins').textContent = '£' + coins; }
}
function nozzle() { const c = Math.cos(hero.rot), s = Math.sin(hero.rot), lx = -14 * HS, ly = -16 * HS; return [hero.x + lx * c - ly * s, hero.y + lx * s + ly * c]; }



/* ================= missions (3 at a time, stars, ranks), like Jetpack Joyride ================= */
const MISSIONS = [
  ['run500', 'Fly 500m in one run', 'dist', 500, 1], ['coins50', 'Collect £50 in one run', 'coins', 50, 1], ['steam3', 'Steam 3 people in one run', 'steamed', 3, 1],
  ['tuktuk', 'Ride a tuk-tuk', 'tuktuk', 1, 0], ['cheer5', 'Make 5 people cheer in one run', 'cheer', 5, 1], ['games3', 'Play 3 games', 'games', 3, 0],
  ['dodge15', 'Dodge 15 hazards in one run', 'dodged', 15, 1], ['masjid2', 'Fly past 2 other masjids in one run', 'masjids', 2, 1], ['carpet', 'Ride the magic carpet', 'carpet', 1, 0], ['kabootar', 'Hold on to Flappy Kabootar', 'kabootar', 1, 0], ['shop1', 'Buy something in the shop', 'bought', 1, 0],
  ['eidi2', 'Grab 2 Eidi envelopes in one run', 'eidi', 2, 1], ['slide50', 'Slide 50m on your face in total', 'slide', 50, 0], ['ground200', 'Run 200m along the pavement in one run', 'groundm', 200, 1],
  ['steam10', 'Steam 10 people in one run', 'steamed', 10, 1], ['run1000', 'Fly 1,000m in one run', 'dist', 1000, 1], ['nocoin300', 'Fly 300m without grabbing a £1', 'nocoin', 300, 1],
  ['jump5', 'Jump 5 times in the tuk-tuk in one run', 'jumps', 5, 1], ['flip10', 'Flip gravity 10 times in one run', 'flips', 10, 1], ['hs1', 'Use a head start', 'hs', 1, 0], ['flap15', 'Flap Flappy Kabootar 15 times in one run', 'flaps', 15, 1], ['laser5', 'Survive 5 speed-camera lasers in one run', 'lasers', 5, 1], ['bank1000', 'Collect £1,000 in total', 'coinsT', 1000, 0],
  ['coins150', 'Collect £150 in one run', 'coins', 150, 1], ['steam25', 'Steam 25 people in one run', 'steamed', 25, 1], ['run2000', 'Fly 2,000m in one run', 'dist', 2000, 1],
  ['cheer20', 'Make 20 people cheer in one run', 'cheer', 20, 1], ['games25', 'Play 25 games', 'games', 25, 0], ['slide300', 'Slide 300m on your face in total', 'slide', 300, 0],
];
const RANKS = ['Beginner', 'Learner', 'Regular', 'Front Row', 'Early Bird', 'Back Row Legend', 'Imam\'s Favourite', 'Jummah Legend'];
let RUN = null, lastCoin = 0, mtQueue = [], mtT = 0;
function newRun() { return { flaps: 0, flips: 0, hs: 0, kabootar: 0, sandals: 0, dist: 0, coins: 0, steamed: 0, cheer: 0, dodged: 0, masjids: 0, eidi: 0, jumps: 0, groundm: 0, nocoin: 0, lasers: 0, tuktuk: 0, carpet: 0, slide: 0 }; }
RUN = newRun();
let MS = (() => { try { return JSON.parse(localStorage.getItem('jd_ms')) || null; } catch (e) { return null; } })() || { active: ['run500', 'coins50', 'steam3'], done: [], prog: {}, stars: 0, rank: 0, newDone: [] };
const saveMS = () => { try { localStorage.setItem('jd_ms', JSON.stringify(MS)); } catch (e) {} };
const mDef = id => MISSIONS.find(m => m[0] === id);
function mValue(m) {   // current value of a mission (this run, or running total)
  const [, , k, , perRun] = m; const r = { ...RUN, dist: dist / 10, coins, dodged: stats.dodged, masjids: passed };
  if (perRun) return r[k] || 0;
  if (k === 'games') return (MS.prog.games || 0);
  if (k === 'coinsT') return (MS.prog.coinsT || 0) + coins;
  return (MS.prog[k] || 0) + (r[k] || 0);
}
function missionsTick(dt) {
  MS.active.forEach(id => { if (MS.newDone.includes(id) || MS.done.includes(id)) return; const m = mDef(id); if (m && mValue(m) >= m[3]) { MS.newDone.push(id); mtQueue.push(m[1]); tone(784, .1, 'square', .05); setTimeout(() => tone(1046, .18, 'square', .05), 100); } });
  const el = $('mtoast'); if (mtT > 0) { mtT -= dt; if (mtT <= 0) el.classList.remove('on'); }
  else if (mtQueue.length) { $('mtTxt').textContent = mtQueue.shift(); el.classList.add('on'); mtT = 2.6; }
}
function missionsEndRun() {   // bank running totals, award stars, swap finished missions for new ones, rank up every 3 stars
  MS.prog.games = (MS.prog.games || 0) + 1; MS.prog.coinsT = (MS.prog.coinsT || 0) + coins;
  ['slide', 'tuktuk', 'carpet', 'kabootar', 'sandals', 'hs'].forEach(k => MS.prog[k] = (MS.prog[k] || 0) + (RUN[k] || 0));
  MS.active.forEach(id => { const m = mDef(id); if (!MS.newDone.includes(id) && m && mValue(m) >= m[3]) MS.newDone.push(id); });
  const got = MS.newDone.slice(); let rankUp = null, reward = 0;
  got.forEach(id => { if (!MS.done.includes(id)) { MS.done.push(id); MS.stars++; reward += 25; } });
  while (MS.stars >= 3) { MS.stars -= 3; MS.rank++; rankUp = RANKS[Math.min(MS.rank, RANKS.length - 1)]; reward += 100 * MS.rank; }
  bank += reward;
  lastMissions = { got: got.map(id => mDef(id)[1]), rankUp, reward };
  MS.active = MS.active.filter(id => !got.includes(id));
  while (MS.active.length < 3) { const next = MISSIONS.find(m => !MS.done.includes(m[0]) && !MS.active.includes(m[0])); if (!next) break; MS.active.push(next[0]); }
  MS.newDone = []; saveMS();
}
let lastMissions = null;
function missionRows(el) {
  el.innerHTML = MS.active.map(id => { const m = mDef(id); if (!m) return ''; const v = Math.min(m[3], Math.floor(mValue(m))), doneNow = MS.newDone.includes(id) || v >= m[3];
    return `<div class="mrow${doneNow ? ' ok' : ''}"><span class="mi">${doneNow ? '✔' : '★'}</span><span class="mt">${m[1]}<em>${doneNow ? 'Done!' : (m[3] > 1 ? v + ' / ' + m[3] : '')}</em><i style="width:${Math.round(v / m[3] * 100)}%"></i></span></div>`; }).join('');
}
function rankHtml() { const n = RANKS[Math.min(MS.rank, RANKS.length - 1)]; return `<div class="rank"><b>${MS.rank + 1}. ${n.toUpperCase()}</b><span>${'★'.repeat(MS.stars)}${'☆'.repeat(3 - MS.stars)}</span></div>`; }

/* ================= Jetpack Joyride systems, our way ================= */
/* gift box (= their vehicle token): rainbow box with a ?, gives a ride. Eidi envelopes (= spin tokens): opened at the end of a run. */
function giftsUpdate(dt, dx) {
  if (state === 'play' && !veh && !boost) { nextGift -= dx; if (nextGift <= 0) { gifts.push({ k: 'box', x: W + 30, y: CEIL + 70 + Math.random() * (FLOOR - CEIL - 160), b: Math.random() * 6 }); nextGift = (2600 + Math.random() * 1800) * (hasG('dates') ? .5 : 1); } }
  if (state === 'play') { nextEidi -= dx; if (nextEidi <= 0) { gifts.push({ k: 'eidi', x: W + 30, y: CEIL + 50 + Math.random() * (FLOOR - CEIL - 120), b: Math.random() * 6 }); nextEidi = (2200 + Math.random() * 2400) * (hasG('envelope') ? .5 : 1); } }
  gifts.forEach(gf => { gf.x -= dx; gf.b += dt;
    if (!gf.got && !hero.dead && state === 'play' && heroCircles().some(([x, y, r]) => Math.hypot(x - gf.x, y - gf.y) < r + 13)) {
      gf.got = 1;
      if (gf.k === 'box') startVehicle(RIDES[Math.random() * RIDES.length | 0]);
      else { eidi++; RUN.eidi++; pops.push({ x: gf.x, y: gf.y - 12, txt: 'EIDI!', col: '#7dffa0', t: 0 }); tone(988, .1, 'square', .05); setTimeout(() => tone(1318, .16, 'square', .05), 90); for (let i = 0; i < 10; i++) sparks.push({ x: gf.x, y: gf.y, vx: (Math.random() - .5) * 140, vy: (Math.random() - .5) * 140, l: .4, c: i % 2 ? '#ffd75a' : '#7dffa0' }); }
    } });
  gifts = gifts.filter(gf => gf.x > -40 && !gf.got);
}
function drawGift(gf) {
  const y = gf.y + Math.sin(gf.b * 3) * 4;
  ctx.save(); ctx.translate(gf.x, y);
  const gl = ctx.createRadialGradient(0, 0, 2, 0, 0, 24); gl.addColorStop(0, gf.k === 'box' ? 'rgba(255,255,255,.55)' : 'rgba(255,230,120,.5)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill();
  if (gf.k === 'box') {   // spinning rainbow gift box with a ?
    ctx.rotate(Math.sin(gf.b * 2) * .15); const s = 12, hue = (gf.b * 90) % 360;
    const g2 = ctx.createLinearGradient(-s, -s, s, s); g2.addColorStop(0, `hsl(${hue},90%,62%)`); g2.addColorStop(.5, `hsl(${(hue + 120) % 360},90%,60%)`); g2.addColorStop(1, `hsl(${(hue + 240) % 360},90%,58%)`);
    ctx.fillStyle = '#1a1024'; roundRect(-s - 2, -s - 2, s * 2 + 4, s * 2 + 4, 6); ctx.fill(); ctx.fillStyle = g2; roundRect(-s, -s, s * 2, s * 2, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; roundRect(-s + 2, -s + 2, s * 2 - 4, s * .7, 3); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 15px Silk'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 1); ctx.textBaseline = 'alphabetic';
  } else {               // Eidi envelope: green with a gold crescent seal
    ctx.rotate(Math.sin(gf.b * 2.4) * .12);
    ctx.fillStyle = '#0f3d26'; roundRect(-12, -8.5, 24, 17, 3); ctx.fill(); ctx.fillStyle = '#1f8a4c'; roundRect(-11, -7.5, 22, 15, 2.5); ctx.fill();
    ctx.fillStyle = '#25a35a'; ctx.beginPath(); ctx.moveTo(-11, -7.5); ctx.lineTo(0, 2); ctx.lineTo(11, -7.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffd75a'; ctx.lineWidth = .8; ctx.strokeRect(-9.5, -6, 19, 12);
    ctx.fillStyle = '#ffd75a'; ctx.beginPath(); ctx.arc(0, 1.5, 3.4, 0, 7); ctx.fill(); ctx.fillStyle = '#1f8a4c'; ctx.beginPath(); ctx.arc(1.3, .8, 2.8, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* rides: tuk-tuk (drives on the pavement, tap to jump) and magic carpet (hold to rise, glides down). One hit = the ride blows up and he's thrown clear. */
const VEH_NAME = { tuktuk: 'TUK-TUK', carpet: 'MAGIC CARPET', kabootar: 'FLAPPY KABOOTAR', sandals: 'GRAVITY SANDALS' };
const RIDES = ['tuktuk', 'carpet', 'kabootar', 'sandals'];
/* Flappy Kabootar crossover: the exact pigeon from Flappy Kabootar, drawn big (each art pixel = PK units) */
const PIG_COL = { o: '#1b1a24', h: '#7f899e', e: '#f08a2a', k: '#1b1a24', c: '#eef0f4', b: '#3a3d44', n: '#4fa36a', p: '#8a5fb0', l: '#c3cad8', g: '#9aa3b5', d: '#7d8698', t: '#5a6476', f: '#e88a7a', w: '#d4dae4', K: '#2e3442' };
const PIG_BODY = ['...................ooo...', '..................ohhhoo.', '..................ohekhho', '.................oohhhhcbb', '...ooooooooooooonnhhhooo.', '..otlllllllllllnnnhho....', '.ottgglllllllllppnno.....', 'oKttggggggggggppnnno.....', 'oKttgggggggggggppgo......', '.ooKdgggggggggggggo......', '...odddgggggggggggo......', '....oodddddddddddo.......', '......ooooffoffoo........'];
const PIG_WINGS = [['.oooo.......', 'owwwwoo.....', '.oggwwwoo...', '..oKgggwwo..', '...ogKKggwo.', '....oggKKggo'], ['oooooooooo..', 'owwwwwwwwwoo', 'oggggggggggo', 'oKKKgKKKgggo', '.ogggggggoo.', '..ooooooo...'], ['oooooooooo..', 'owwwwwwwwwoo', '.oggggggggo.', '..oKKgKKgo..', '...oggggo...', '....oggo....', '.....oo.....']];
const PK = 2.4, pigCv = [0, 1, 2].map(f => { const c = document.createElement('canvas'); c.width = 30 * PK; c.height = 26 * PK; const x = c.getContext('2d');
  const paint = (rows, ox, oy) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.') continue; x.fillStyle = PIG_COL[ch]; x.fillRect((ox + i) * PK, (oy + j) * PK, PK, PK); } });
  paint(PIG_BODY, 2, 12); paint(PIG_WINGS[f], 7, 12 + [-9, -4, -3][f] + 7); x.fillStyle = 'rgba(140,255,190,.35)'; x.fillRect(19 * PK, 16 * PK, 2 * PK, 2 * PK); return c; });
function runStarted() {   // start of the run proper: offer head starts (like their HEAD START buttons), golden misbaha ride
  usedSave = 0;
  if (SHOP.hs500 > 0 || SHOP.hs1000 > 0) { $('hs5').style.display = SHOP.hs500 > 0 ? '' : 'none'; $('hs10').style.display = SHOP.hs1000 > 0 ? '' : 'none'; $('hs5n').textContent = 'x' + SHOP.hs500; $('hs10n').textContent = 'x' + SHOP.hs1000; $('hsBox').classList.add('on'); clearTimeout(runStarted.t); runStarted.t = setTimeout(() => $('hsBox').classList.remove('on'), 3800); }
  if (hasG('misbaha')) setTimeout(() => { if (state === 'play' && !veh && !boost && !hero.dead) startVehicle(RIDES[Math.random() * RIDES.length | 0]); }, 600);
}
/* HEAD START: uncle's silver Corolla hatchback flies down the pavement with him holding on to the roof */
let boost = null, usedSave = 0;
function startBoost(m) {
  const k = m === 1000 ? 'hs1000' : 'hs500'; if (!(SHOP[k] > 0) || boost || state !== 'play' || hero.dead) return;
  SHOP[k]--; saveShop(); $('hsBox').classList.remove('on'); RUN.hs = 1;
  if (veh) veh = null; boost = { left: m * 10, t: 0, out: 0, cx: hero.x, ox: 0 }; hero.vy = 0; hero.y = FLOOR; hero.thrust = false;
  obs = obs.filter(o => o.type === 'laser' ? false : true); banner = { k: 'boost', t: 0 }; flashT = .12; flashCol = '255,255,255';
  tone(220, .25, 'sawtooth', .05, 2.2); setTimeout(() => tone(330, .3, 'sawtooth', .05, 2), 120);
}
function boostUpdate(dt) {
  boost.t += dt;
  if (!boost.out) { boost.left -= speed * dt; hero.y = FLOOR; hero.vy = 0; hero.rot = 0; hero.run += dt * 30; shake = Math.max(shake, .04);
    if (Math.random() < dt * 30) dust.push({ x: hero.x - 70, y: FLOOR, vx: -200 - Math.random() * 200, vy: -Math.random() * 40, r: 3, l: .5 });
    npcs.forEach(p => { if (!p.esc && p.fall <= 0 && p.x > hero.x - 40 && p.x < hero.x + 260 && !p.done) { p.done = 1; p.react = .8; p.hop = 1; p.hopH = 30; p.look = -1; } });
    obs = obs.filter(o => o.type === 'laser' || o.x > W);
    if (boost.left <= 0) { boost.out = 1; boost.ot = 0; hero.vy = -620; hero.ground = false; inv = 1.2; pops.push({ x: hero.x + 20, y: hero.y - 120, txt: 'CHEERS UNCLE!', col: '#ffd75a', t: 0 }); tone(660, .12, 'square', .05); setTimeout(() => tone(880, .2, 'square', .05), 100); } }
  else { boost.ot += dt; boost.ox += (600 + boost.ot * 900) * dt; if (boost.ox > W + 200) boost = null; }
}
function drawCorolla(c, x, y, s, uncle) {   // E10-style 5-door hatch, silver, side on, facing right; y = road
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(20,10,30,.32)'; c.beginPath(); c.ellipse(0, 1, 78, 5, 0, 0, 7); c.fill();
  const P = (pts, f) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = f; c.fill(); };
  // outline body (one shape with a rounded nose and tail)
  c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = '#1a1024';
  const body = () => { c.beginPath(); c.moveTo(-76, -12); c.quadraticCurveTo(-78, -24, -72, -28); c.lineTo(-62, -30); c.lineTo(-50, -46); c.quadraticCurveTo(-46, -49, -38, -49); c.lineTo(6, -49); c.quadraticCurveTo(12, -48, 16, -44); c.lineTo(34, -30); c.lineTo(66, -26); c.quadraticCurveTo(76, -24, 77, -16); c.lineTo(77, -10); c.quadraticCurveTo(76, -6, 70, -6); c.lineTo(-72, -6); c.quadraticCurveTo(-77, -7, -76, -12); c.closePath(); };
  body(); c.stroke(); const gr = c.createLinearGradient(0, -49, 0, -6); gr.addColorStop(0, '#f2f4f7'); gr.addColorStop(.45, '#cfd3da'); gr.addColorStop(.55, '#b9bec8'); gr.addColorStop(1, '#8d939f'); c.fillStyle = gr; c.fill();
  // glass: rear hatch, rear door, front door, windscreen
  P([[-58, -31], [-48, -45], [-36, -46], [-36, -31]], '#33415a'); P([[-33, -31], [-33, -46], [-6, -46], [-6, -31]], '#33415a'); P([[-3, -31], [-3, -46], [8, -46], [13, -43], [29, -31]], '#33415a');
  c.fillStyle = 'rgba(200,230,255,.35)'; P([[-31, -33], [-31, -44], [-22, -44], [-27, -33]], 'rgba(200,230,255,.28)'); P([[-1, -33], [-1, -44], [6, -44], [-0, -33]], 'rgba(200,230,255,.28)');
  c.fillStyle = '#1a1024'; c.fillRect(-36, -47, 3, 17); c.fillRect(-6, -47, 3, 17);
  if (uncle) { c.save(); c.beginPath(); c.rect(-3, -46, 32, 15); c.clip(); c.fillStyle = '#c98a5a'; c.beginPath(); c.ellipse(9, -37, 5, 6, 0, 0, 7); c.fill(); c.fillStyle = '#d9d9de'; c.beginPath(); c.ellipse(11, -33, 5, 4, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(8, -43, 5.5, 2.6, 0, Math.PI, 0); c.fill(); c.fillRect(2.5, -43, 11, 1.6); c.fillStyle = '#1a1024'; c.fillRect(12, -39, 1.6, 1.6); c.restore(); }
  // body lines: shoulder highlight, rubbing strip, door cuts, handles
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-68, -27); c.lineTo(64, -24); c.stroke();
  c.fillStyle = '#4a4f5a'; c.fillRect(-70, -19, 138, 3);
  c.strokeStyle = 'rgba(40,40,55,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-34, -30); c.lineTo(-34, -9); c.moveTo(-4, -30); c.lineTo(-4, -9); c.moveTo(30, -30); c.lineTo(32, -9); c.stroke();
  c.fillStyle = '#2a2d36'; c.fillRect(-27, -26, 6, 1.6); c.fillRect(3, -26, 6, 1.6);
  // lights, mirror, bumpers
  P([[70, -24], [76, -21], [76, -16], [69, -18]], '#fff6c8'); P([[69, -15], [76, -14], [76, -11], [70, -11]], '#ff9a2a');
  P([[-76, -24], [-71, -26], [-70, -17], [-76, -16]], '#d22a2a');
  P([[24, -36], [30, -37], [30, -32], [25, -32]], '#9aa0aa');
  c.fillStyle = '#5a5f6a'; c.fillRect(-77, -12, 10, 5); c.fillRect(66, -12, 11, 5);
  // wheels with the plain silver trims from the photo
  [-48, 49].forEach(wx => { c.fillStyle = '#121218'; c.beginPath(); c.arc(wx, -10, 13, 0, 7); c.fill(); c.fillStyle = '#1a1024'; c.beginPath(); c.arc(wx, -10, 11.5, 0, 7); c.fill(); c.fillStyle = '#c9cdd5'; c.beginPath(); c.arc(wx, -10, 8, 0, 7); c.fill();
    c.strokeStyle = '#8a909c'; c.lineWidth = 1.2; const a = (typeof hero !== 'undefined' ? hero.run : 0) * 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(wx + Math.cos(a + i) * 3, -10 + Math.sin(a + i) * 3); c.lineTo(wx + Math.cos(a + i) * 7.5, -10 + Math.sin(a + i) * 7.5); c.stroke(); } c.fillStyle = '#5a5f6a'; c.beginPath(); c.arc(wx, -10, 2.2, 0, 7); c.fill(); });
  c.restore();
}
function drawBoost() {
  const x = hero.x + (boost.out ? boost.ox : 0) + 6;
  if (!boost.out) {   // hero crouched on the roof, holding on
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(255,255,255,${.25 + i * .1})`; ctx.lineWidth = 1.5; const yy = FLOOR - 20 - i * 14 - Math.random() * 8; ctx.beginPath(); ctx.moveTo(x - 90 - Math.random() * 60, yy); ctx.lineTo(x - 140 - Math.random() * 120, yy); ctx.stroke(); }
    ctx.save(); ctx.translate(hero.x - 6, FLOOR - 47 + Math.sin(hero.run * 2) * .8); ctx.imageSmoothingEnabled = true; ctx.drawImage(heroImg, FR('land0_effort') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH); ctx.restore(); }
  drawCorolla(ctx, x, FLOOR + 2, 1.05, true);
}
function startVehicle(k) {
  RUN[k] = 1;
  veh = { k, t: 0, vy: 0, jumps: 0, held: false, wob: 0, g: 1, s: 1, flap: 0, fuel: 1, nb: 0, ht: 0 }; if (k === 'kabootar') veh.tip = 1; if (k === 'tuktuk' && !RUN.nitroTip) { RUN.nitroTip = 1; setTimeout(() => pops.push({ x: hero.x + 30, y: hero.y - 110, txt: 'HOLD FOR NITRO!', col: '#ffd21f', t: 0 }), 900); } hero.thrust = false; if (k === 'kabootar') hero.vy = -200;
  banner = { k, t: 0 }; rings.push({ x: hero.x, y: hero.y - 30, t: 0 }); flashT = .12; flashCol = '255,255,255';
  tone(523, .1, 'square', .06); setTimeout(() => tone(659, .1, 'square', .06), 90); setTimeout(() => tone(784, .2, 'square', .06), 180);
}
function vehCircles() { const x = hero.x, y = hero.y;
  if (veh.k === 'kabootar') return [[x + 2, y - 30, 13], [x, y - 62, 11], [x + 2, y - 103, 13]];
  if (veh.k === 'sandals') { const sg = veh.s < 0 ? -1 : 1; return [[x + 3, y - 31 * sg, 10], [x + 7, y - 58 * sg, 9]]; }
  return veh.k === 'tuktuk' ? [[x - 4, y - 22, 18], [x + 16, y - 16, 12], [x - 2, y - 48, 12]] : [[x, y - 8, 16], [x + 4, y - 36, 12]]; }
function vehUpdate(dt) {
  veh.t += dt; hero.run += dt * (6 + speed / 22); if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
  if (veh.k === 'kabootar') {   // flappy controls: tap to flap
    const press = holding && !veh.held; veh.held = holding; veh.flap -= dt;
    if (press) { hero.vy = -270; veh.flap = .28; veh.tip = 0; RUN.flaps++; tone(700, .05, 'square', .04, 1.4); for (let i = 0; i < 4; i++) sparks.push({ x: hero.x - 10, y: hero.y - 90, vx: -80 - Math.random() * 60, vy: 40 + Math.random() * 60, l: .4, c: '#e8ecf4' }); }
    hero.vy += 860 * dt; hero.y += hero.vy * dt;
    if (hero.y >= FLOOR) { hero.y = FLOOR; hero.vy = 0; }
    if (hero.y - 118 < CEIL) { hero.y = CEIL + 118; hero.vy = Math.max(0, hero.vy); }   // the pigeon can fly right up to the top of the screen
    hero.rot = Math.max(-.35, Math.min(.5, hero.vy / 700));
    return;
  }
  if (veh.k === 'sandals') {   // gravity sandals: tap to flip between pavement and the top of the screen
    const press = holding && !veh.held; veh.held = holding;
    if (press) { veh.g = -veh.g; RUN.flips++; tone(veh.g < 0 ? 520 : 390, .14, 'triangle', .06, veh.g < 0 ? 1.8 : .55); for (let i = 0; i < 8; i++) sparks.push({ x: hero.x + (Math.random() - .5) * 20, y: hero.y, vx: (Math.random() - .5) * 120, vy: (Math.random() - .5) * 120, l: .4, c: '#7dffa0' }); }
    hero.vy += veh.g * 2700 * dt; hero.vy = Math.max(-900, Math.min(900, hero.vy)); hero.y += hero.vy * dt;
    const top = CEIL + 2; veh.on = 0;
    if (hero.y >= FLOOR) { if (hero.vy > 300) { shake = .08; tone(140, .08, 'triangle', .07); } hero.y = FLOOR; hero.vy = 0; veh.on = 1; }
    if (hero.y <= top) { if (hero.vy < -300) { shake = .08; tone(160, .08, 'triangle', .07); } hero.y = top; hero.vy = 0; veh.on = 1; }
    veh.s += ((veh.g < 0 ? -1 : 1) - veh.s) * Math.min(1, dt * 14); hero.rot = 0;
    if (veh.on && Math.random() < dt * 20) sparks.push({ x: hero.x - 6, y: hero.y, vx: -speed * .4 - 30, vy: (Math.random() - .5) * 30, l: .3, c: '#7dffa0' });
    return;
  }
  if (veh.k === 'tuktuk') {
    const press = holding && !veh.held; veh.held = holding;
    // NITRO (owner, 21 Nov): tap = hop, hold = rocket boost out of the exhaust. Faster, pulls coins in, and smashes through
    // zappers/lasers/rockets without losing the tuk-tuk. Tank drains in ~2.5 s, refills slowly and with every coin
    veh.ht = holding ? veh.ht + dt : 0; const want = veh.ht > .22 && veh.fuel > .02 ? 1 : 0;
    if (want && veh.nb < .05) { SFX.whoosh(); tone(90, .5, 'sawtooth', .12, 2.2); shake = .12; }
    veh.nb += (want - veh.nb) * Math.min(1, dt * (want ? 6 : 3)); if (veh.nb < .01) veh.nb = 0;
    if (want) veh.fuel = Math.max(0, veh.fuel - dt / 2.5); else veh.fuel = Math.min(1, veh.fuel + dt / 9);
    if (veh.nb > .3) { if (Math.random() < dt * 40) sparks.push({ x: hero.x - 54, y: hero.y - 14 + (Math.random() - .5) * 5, vx: -speed * .6 - 120 - Math.random() * 80, vy: (Math.random() - .5) * 40, l: .25 + Math.random() * .2, c: Math.random() < .5 ? '#ffd75a' : '#ff7a2a' }); shake = Math.max(shake, .03); }
    if (press && hero.y >= FLOOR - .5) { hero.vy = -520; RUN.jumps++; tone(330, .12, 'triangle', .07, 1.6); for (let i = 0; i < 6; i++) dust.push({ x: hero.x - 20 + Math.random() * 30, y: FLOOR, vx: -60 - Math.random() * 80, vy: -Math.random() * 30, r: 2.5, l: .5 }); }
    hero.vy += 1500 * dt; hero.y += hero.vy * dt;
    if (hero.y >= FLOOR) { if (hero.vy > 200) { shake = .12; tone(120, .15, 'triangle', .1); for (let i = 0; i < 8; i++) dust.push({ x: hero.x + (Math.random() - .5) * 50, y: FLOOR, vx: (Math.random() - .5) * 160, vy: -Math.random() * 40, r: 3, l: .5 }); npcs.forEach(p => { if (!p.esc && Math.abs(p.x - hero.x) < 90 && p.fall <= 0) { p.react = .9; p.hop = 1; p.hopH = 16; p.look = hero.x > p.x ? 1 : -1; } }); }
      hero.y = FLOOR; hero.vy = 0; }
    hero.rot = Math.max(-.25, Math.min(.2, hero.vy / 2200));
    if (Math.random() < dt * 14) steam.push({ x: hero.x - 34, y: hero.y - 8, vx: -speed * .4 - 30, vy: -10 - Math.random() * 20, r: 2, l: .5, l0: .6 });
  } else {
    if (holding) hero.vy -= 1150 * dt; hero.vy += 480 * dt; hero.vy = Math.max(-210, Math.min(230, hero.vy)); hero.y += hero.vy * dt;
    if (hero.y >= FLOOR - 6) { hero.y = FLOOR - 6; hero.vy = 0; }
    if (hero.y - 70 < CEIL) { hero.y = CEIL + 70; hero.vy = Math.max(0, hero.vy); }
    hero.rot = Math.max(-.12, Math.min(.12, hero.vy / 1600));
    if (Math.random() < dt * 24) sparks.push({ x: hero.x - 30 + Math.random() * 10, y: hero.y - 2 + Math.random() * 6, vx: -speed * .5 - 20, vy: (Math.random() - .5) * 20, l: .5, c: Math.random() < .5 ? '#ffd75a' : '#fff3b0' });
  }
}
function vehCrash() {
  const k = veh.k; veh = null; inv = 1.8; shake = .3; flashT = .15; flashCol = '255,200,120'; SFX.boom();
  hero.vy = -480; hero.ground = false;
  const cols = { tuktuk: ['#f7c51e', '#141414', '#ffe066', '#c9ced8'], carpet: ['#b3202e', '#ffd75a', '#7a1020', '#ffe9a8'], kabootar: ['#eef0f4', '#9aa3b5', '#7f899e', '#4fa36a'], sandals: ['#7dffa0', '#2fbf4a', '#c9a06a', '#ffffff'] }[k];
  if (k === 'kabootar') pops.push({ x: hero.x + 20, y: hero.y - 140, txt: 'COO!', col: '#e8ecf4', t: 0 });
  for (let i = 0; i < 26; i++) sparks.push({ x: hero.x + (Math.random() - .5) * 50, y: hero.y - 20 + (Math.random() - .5) * 30, vx: (Math.random() - .4) * 300, vy: -Math.random() * 280, l: .9 + Math.random() * .5, c: cols[i % 4] });
  for (let i = 0; i < 12; i++) steam.push({ x: hero.x + (Math.random() - .5) * 40, y: hero.y - 20, vx: (Math.random() - .5) * 120, vy: -Math.random() * 80, r: 5 + Math.random() * 4, l: .7, l0: .9 });
  pops.push({ x: hero.x, y: hero.y - 70, txt: { tuktuk: 'TUK-TUK GONE!', carpet: 'CARPET GONE!', kabootar: 'KABOOTAR FLEW OFF!', sandals: 'SANDALS SNAPPED!' }[k], col: '#ffd75a', t: 0 });
}
function drawVehicle() {
  const x = hero.x, y = hero.y, k = veh.k;
  if (k === 'kabootar') {   // the exact Flappy pigeon (small); one arm reaches up over his head and his fist grips its tail
    const f = veh.flap > .14 ? 2 : veh.flap > 0 ? 1 : Math.floor(t * 4) % 2 ? 0 : 1, SX = -3, SY = -47, GX = -1, GY = -88, EX = -13, EY = -64;   // shoulder at the top of the thobe, not on his chest   // shoulder (in the sprite) + grip, feet-relative
    const col = { luton: ['#f67a20', '#d65c10'], puffer: ['#2c2c34', '#1c1c22'], moroccan: ['#963a2e', '#74281f'], eid: ['#fcf0ce', '#e8d4a2'] }[SHOP.outfit] || ['#f8f6fa', '#d4d4e4'];
    ctx.save(); ctx.translate(x, y); ctx.rotate(hero.rot * .5);
    ctx.save(); ctx.translate(GX, GY); ctx.rotate(Math.sin(t * 5) * .05); ctx.translate(-GX, -GY); ctx.imageSmoothingEnabled = true; const hf = 'hang' + (Math.floor(t * 8) % 4) + '_happy';
    ctx.drawImage(heroImg, FR(hf) * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH);
    // sleeve: from inside the shoulder, up across his ear and over the top of his head (black outline, white sleeve, no joint showing)
    const arm = () => { ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(EX, EY); ctx.lineTo(GX, GY + 3); };   // bent arm: elbow out behind his head, hand just above his hair
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1a161e'; ctx.lineWidth = 9; arm(); ctx.stroke(); ctx.strokeStyle = col[0]; ctx.lineWidth = 6; arm(); ctx.stroke();
    ctx.strokeStyle = col[1]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(SX + 1, SY - 1); ctx.lineTo(EX + 2, EY + 1); ctx.lineTo(GX + 2, GY + 5); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(GX, GY); ctx.rotate(-.08 - hero.rot * .3); ctx.imageSmoothingEnabled = false; ctx.drawImage(pigCv[f], -14 * PK, -24.6 * PK);   // its feet (14, 24.6) in his fist
     ctx.imageSmoothingEnabled = true; ctx.restore();
    ctx.fillStyle = '#d48a58'; ctx.strokeStyle = '#1a161e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(GX, GY + 1, 4.4, 3.8, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#a8643c'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(GX - 2.8, GY + 1.6); ctx.lineTo(GX + 2.8, GY + 1.6); ctx.stroke(); ctx.fillStyle = '#ecaa74'; ctx.fillRect(GX - 2.5, GY - 1.2, 2, 1.2);
    ctx.restore();
    if (veh.t < 3.2) { const a = Math.min(1, veh.t * 3, (3.2 - veh.t) * 2), s = 1 + Math.sin(t * 9) * .06; ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, VH * .3); ctx.scale(s, s); ctx.font = '700 26px Silk'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      ctx.lineWidth = 6; ctx.strokeStyle = '#1b1a24'; ctx.strokeText('TAP TO FLAP', 0, 0); ctx.fillStyle = '#fff'; ctx.fillText('TAP TO FLAP', 0, 0); ctx.restore(); }
    return;
  }
  if (k === 'sandals') {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, veh.s);
    const on = veh.on, fn = on ? 'run' + (Math.floor(hero.run) % 6) + '_normal' : 'glide0_normal';
    const gl = ctx.createRadialGradient(4, -2, 1, 4, -2, 22); gl.addColorStop(0, 'rgba(125,255,160,.75)'); gl.addColorStop(1, 'rgba(125,255,160,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(4, -2, 24, 9, 0, 0, 7); ctx.fill();
    ctx.imageSmoothingEnabled = true; ctx.drawImage(heroImg, FR(fn) * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH);
    ctx.fillStyle = '#2fbf4a'; ctx.fillRect(-6, -3, 22, 3); ctx.fillStyle = '#b6ffc4'; ctx.fillRect(-4, -3, 18, 1);
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(hero.rot);
  if (k === 'tuktuk') {   // auto-rickshaw, side on; he sits fully inside, seen through the open side (owner, 21 Nov)
    const onG = hero.y >= FLOOR - .5, bob = onG ? Math.sin(hero.run * 2.2) * 1 + Math.sin(hero.run * 5.3) * .4 : 0, nose = onG ? 0 : Math.max(-.16, Math.min(.08, hero.vy / 2600));
    ctx.rotate(nose); ctx.fillStyle = 'rgba(30,10,30,.3)'; ctx.beginPath(); ctx.ellipse(2, (FLOOR - y) + 1, 44, 4.5, 0, 0, 7); ctx.fill(); ctx.translate(0, bob);
    const wheel = (wx, r) => { ctx.save(); ctx.translate(wx, -r - bob); ctx.fillStyle = '#141418'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); const rg = ctx.createRadialGradient(-r * .2, -r * .2, 0, 0, 0, r * .55); rg.addColorStop(0, '#e8ecf2'); rg.addColorStop(1, '#7a808c'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, 7); ctx.fill();
      ctx.rotate(hero.run * 3); ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = 1.1; for (let i = 0; i < 5; i++) { const a = i * 1.2566; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * .5, Math.sin(a) * r * .5); ctx.stroke(); } ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, 7); ctx.fill(); ctx.restore(); };
    wheel(-28, 9);
    if (onG && Math.random() < .5) dust.push({ x: x - 50, y: y - 8, vx: -40 - Math.random() * 30, vy: -10 - Math.random() * 12, r: 1.6 + Math.random(), l: .45 });   // exhaust
    // inside first: dark cabin, seat, then our hero (scaled to fit), all clipped to the side opening
    const OP = (np) => { if (!np) ctx.beginPath(); ctx.moveTo(-38, -36); ctx.lineTo(-38, -66); ctx.quadraticCurveTo(-37, -76, -26, -77); ctx.lineTo(10, -77); ctx.quadraticCurveTo(18, -76, 20, -66); ctx.lineTo(22, -36); ctx.closePath(); };
    ctx.save(); OP(); ctx.clip(); ctx.fillStyle = '#2a1e2e'; ctx.fillRect(-40, -80, 64, 46); ctx.fillStyle = '#8a1e2e'; roundRect(-36, -52, 26, 14, 3); ctx.fill(); ctx.fillStyle = '#a8283a'; roundRect(-36, -64, 8, 26, 3); ctx.fill();
    const hs = .72; ctx.drawImage(heroImg, FR('run0_happy') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS * hs / 2 - 2, -HH * hs - 22, HW * HS * hs, HH * hs);
    ctx.fillStyle = '#1a1a1e'; ctx.fillRect(8, -58, 2, 18); ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.ellipse(10, -58, 2, 5, -.4, 0, 7); ctx.fill();   // handlebar in front of him
    ctx.restore();
    // body: rear box + belly, green with a yellow band, black trim
    const body = ctx.createLinearGradient(0, -40, 0, -6); body.addColorStop(0, '#ffe066'); body.addColorStop(.5, '#f7c51e'); body.addColorStop(1, '#c48f00'); ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(-46, -10); ctx.lineTo(-46, -34); ctx.quadraticCurveTo(-46, -40, -40, -40); ctx.lineTo(24, -40); ctx.lineTo(38, -22); ctx.quadraticCurveTo(42, -14, 40, -8); ctx.lineTo(-44, -8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#3a2a00'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#141414'; ctx.fillRect(-46, -25, 82, 4.4); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-46, -25, 82, .8); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-42, -38, 62, 2);
    ctx.fillStyle = '#1a1a1e'; ctx.font = '700 6px Mont, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LUTON', -14, -12.4);
    // canopy: black fabric roof curving down to the windscreen, frame round the opening
    ctx.fillStyle = '#1e1e24'; ctx.beginPath(); ctx.moveTo(-48, -34); ctx.lineTo(-48, -70); ctx.quadraticCurveTo(-46, -86, -26, -87); ctx.lineTo(12, -87); ctx.quadraticCurveTo(28, -86, 32, -70); ctx.lineTo(38, -40); ctx.lineTo(24, -40); ctx.lineTo(22, -36); ctx.lineTo(-38, -36); ctx.closePath();
    OP(true); ctx.fill('evenodd'); ctx.strokeStyle = '#000'; ctx.lineWidth = .8; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(-44, -72); ctx.quadraticCurveTo(-42, -84, -26, -85); ctx.lineTo(10, -85); ctx.lineTo(10, -82); ctx.lineTo(-26, -82); ctx.quadraticCurveTo(-40, -81, -42, -70); ctx.fill();
    ctx.fillStyle = '#ffd21f'; ctx.fillRect(-48, -76, 3, 30);   // yellow stripe on the back
    ctx.fillStyle = 'rgba(180,220,245,.55)'; ctx.beginPath(); ctx.moveTo(22, -82); ctx.quadraticCurveTo(28, -80, 31, -70); ctx.lineTo(35, -44); ctx.lineTo(26, -44); ctx.closePath(); ctx.fill();   // windscreen
    ctx.fillStyle = '#d8d8dc'; ctx.fillRect(35, -54, 5, 1.6); ctx.fillRect(39, -56, 1.4, 4);   // mirror
    ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(38, -26, 3.2, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,246,190,.35)'; ctx.beginPath(); ctx.moveTo(40, -28); ctx.lineTo(70, -34); ctx.lineTo(70, -18); ctx.lineTo(40, -24); ctx.fill();
    wheel(30, 8);
    if (veh.nb > .02) { const L = (34 + Math.random() * 14) * veh.nb; ctx.save(); ctx.globalCompositeOperation = 'lighter';   // rocket flame out of the exhaust
      const fg = ctx.createLinearGradient(-50, 0, -50 - L, 0); fg.addColorStop(0, 'rgba(255,255,230,.95)'); fg.addColorStop(.3, 'rgba(255,200,60,.85)'); fg.addColorStop(.75, 'rgba(255,90,20,.5)'); fg.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-48, -19); ctx.quadraticCurveTo(-50 - L * .5, -22 - Math.random() * 3, -50 - L, -14); ctx.quadraticCurveTo(-50 - L * .5, -6 + Math.random() * 3, -48, -9); ctx.closePath(); ctx.fill();
      const gl = ctx.createRadialGradient(-50, -14, 0, -50, -14, 26); gl.addColorStop(0, 'rgba(255,170,60,.5)'); gl.addColorStop(1, 'rgba(255,120,30,0)'); ctx.fillStyle = gl; ctx.fillRect(-80, -44, 60, 60); ctx.restore(); }
    ctx.fillStyle = '#3a3a40'; roundRect(-52, -18, 7, 6, 2); ctx.fill();   // exhaust / nitro pipe
    { const gx = -20, gy = -100; ctx.fillStyle = 'rgba(20,10,30,.55)'; roundRect(gx - 1, gy - 1, 42, 6, 3); ctx.fill(); const fg2 = ctx.createLinearGradient(gx, 0, gx + 40, 0); fg2.addColorStop(0, '#ff7a2a'); fg2.addColorStop(1, '#ffe066'); ctx.fillStyle = fg2; roundRect(gx, gy, Math.max(2, 40 * veh.fuel), 4, 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 5px Mont, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('NITRO', gx - 3, gy + 4); }
    if (onG && Math.floor(t * 20) % 3 === 0) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-60 - i * 6, -50 + i * 12); ctx.lineTo(-72 - i * 6, -50 + i * 12); ctx.stroke(); } }   // speed lines
  } else {   // magic carpet: a real cloth ripple running nose to tail, shaded folds, border + medallion, swinging tassels
    const W2 = 50, n = 24;
    ctx.fillStyle = 'rgba(30,10,30,.18)'; ctx.beginPath(); ctx.ellipse(0, (FLOOR - y), 38, 3, 0, 0, 7); ctx.fill();
    const wave = i => { const u = i / n; return Math.sin(t * 6.5 - u * 7) * (2.2 + u * 3.2) + Math.sin(t * 3.1 - u * 3) * 1.2; };
    const pts = []; for (let i = 0; i <= n; i++) pts.push([-W2 + i * (W2 * 2 / n), wave(i)]);
    const mid = Math.floor(n * .55);
    ctx.drawImage(heroImg, FR('sit' + (Math.floor(t * 3) % 2) + '_happy') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2 - 4, -HH + 10.5 + pts[mid][1], HW * HS, HH);
    const TH = 5;
    ctx.fillStyle = '#4a0c18'; ctx.beginPath(); pts.forEach(([px2, py], i) => i ? ctx.lineTo(px2, py + 1) : ctx.moveTo(px2, py + 1)); for (let i = n; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + TH + 1); ctx.closePath(); ctx.fill();   // underside / thickness
    for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], sl = (y1 - y0) / (x1 - x0), lit = Math.max(.72, Math.min(1.25, 1 - sl * 1.4));
      ctx.fillStyle = `rgb(${Math.min(255, 180 * lit) | 0},${Math.min(255, 32 * lit) | 0},${Math.min(255, 46 * lit) | 0})`; ctx.beginPath(); ctx.moveTo(x0, y0 - 2); ctx.lineTo(x1 + .4, y1 - 2); ctx.lineTo(x1 + .4, y1 + TH - 1); ctx.lineTo(x0, y0 + TH - 1); ctx.closePath(); ctx.fill(); }
    const band = (dy, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([px2, py], i) => i ? ctx.lineTo(px2, py + dy) : ctx.moveTo(px2, py + dy)); ctx.stroke(); };
    band(-1.4, '#ffd75a', 1); band(TH - 2, '#ffd75a', 1); band(TH * .3, '#1e3a8a', .7);
    ctx.fillStyle = '#ffd75a'; for (let i = 2; i < n - 1; i += 3) { const [px2, py] = pts[i]; ctx.beginPath(); ctx.moveTo(px2, py - .8); ctx.lineTo(px2 + 1.6, py + 1.2); ctx.lineTo(px2, py + 3); ctx.lineTo(px2 - 1.6, py + 1.2); ctx.closePath(); ctx.fill(); }
    { const [mx, my] = pts[Math.floor(n / 2)]; ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.ellipse(mx, my + 1.2, 6, 2.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd75a'; ctx.beginPath(); ctx.ellipse(mx, my + 1.2, 3, 1.1, 0, 0, 7); ctx.fill(); }
    [[0, -1], [n, 1]].forEach(([i, s]) => { const [px2, py] = pts[i]; for (let j = 0; j < 4; j++) { const sw = Math.sin(t * 9 + j + i) * 2.2; ctx.strokeStyle = j % 2 ? '#ffd75a' : '#f0c040'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px2, py - 1 + j * 1.6); ctx.quadraticCurveTo(px2 + s * 3, py + j * 1.6 + sw * .5, px2 + s * 6.5, py + j * 1.6 + sw); ctx.stroke(); } });
  }
  ctx.restore();
}
function drawBanner() {   // their vehicle title card: a glowing band across the screen with the ride's name
  const k = banner.t, a = k < .2 ? k / .2 : k > 1.5 ? Math.max(0, (1.8 - k) / .3) : 1, y = VH * .42, h = 46;
  ctx.globalAlpha = a; const g2 = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g2.addColorStop(0, 'rgba(255,120,60,0)'); g2.addColorStop(.25, 'rgba(255,90,70,.85)'); g2.addColorStop(.5, 'rgba(255,200,150,.95)'); g2.addColorStop(.75, 'rgba(255,90,70,.85)'); g2.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, y - h / 2, W, h);
  const sx = (1 - Math.min(1, k / .25)) * W * .6;
  const nm = banner.k === 'boost' ? 'HEAD START!' : VEH_NAME[banner.k];
  if (banner.k === 'kabootar') { ctx.font = '9px PS'; ctx.textAlign = 'left'; ctx.fillStyle = '#ffd75a'; ctx.fillText('SMR CROSSOVER', W * .45 + sx, y - 14); }
  ctx.font = '22px PS'; ctx.textAlign = 'left'; ctx.fillStyle = '#160c28'; ctx.fillText(nm, W * .45 + sx + 2, y + 10); ctx.fillStyle = '#fff'; ctx.fillText(nm, W * .45 + sx, y + 8);
  ctx.globalAlpha = 1;
}
function drawLaser(o) {   // speed-camera emitters both sides; thin flickering warning line, then a thick red beam
  if (o.d > 0) return;
  const e = (1 - o.slide) * 40, lx = 10 - e, rx = W - 10 + e, y = o.y;
  if (o.ph === 'warn') { const f = .35 + .35 * Math.abs(Math.sin(o.pt * 18)); ctx.strokeStyle = `rgba(230,70,255,${f})`; ctx.lineWidth = 1; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(lx + 10, y); ctx.lineTo(rx - 10, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `rgba(240,110,255,${f})`; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(lx + 12 + Math.random() * 6, y + (Math.random() - .5) * 4, 1.4, 0, 7); ctx.arc(rx - 12 - Math.random() * 6, y + (Math.random() - .5) * 4, 1.4, 0, 7); ctx.fill(); } }
  if (o.ph === 'warn') { const k = o.pt / 1.45; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const ex of [lx + 12, rx - 12]) { const cg = ctx.createRadialGradient(ex, y, 0, ex, y, 6 + k * 12); cg.addColorStop(0, `rgba(255,220,255,${.4 + k * .5})`); cg.addColorStop(1, 'rgba(220,60,255,0)'); ctx.fillStyle = cg; ctx.fillRect(ex - 20, y - 20, 40, 40); } ctx.restore(); }   // charging up
  if (o.ph === 'fire') { const p = Math.min(1, o.pt / .08), th = 5 + Math.sin(t * 40) * 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(200,40,255,${.25 * p})`; ctx.fillRect(lx, y - 15, rx - lx, 30); ctx.fillStyle = `rgba(230,70,255,${.55 * p})`; ctx.fillRect(lx, y - th * 1.6, rx - lx, th * 3.2);
    ctx.fillStyle = `rgba(255,235,255,${.95 * p})`; ctx.fillRect(lx, y - th * .45, rx - lx, th * .9); ctx.restore();
    if (Math.random() < .5) sparks.push({ x: lx + 12, y, vx: 40 + Math.random() * 60, vy: (Math.random() - .5) * 60, l: .25, c: '#f0b0ff' }); }
  [[lx, 1], [rx, -1]].forEach(([x, s]) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, 1);
    ctx.fillStyle = '#1a1024'; roundRect(-12, -10, 22, 20, 4); ctx.fill(); const bx = ctx.createLinearGradient(0, -9, 0, 9); bx.addColorStop(0, '#ffe04a'); bx.addColorStop(1, '#d9a10f'); ctx.fillStyle = bx; roundRect(-11, -9, 20, 18, 3); ctx.fill();
    ctx.fillStyle = '#1a1024'; ctx.fillRect(-9, -6, 4, 12); ctx.fillStyle = '#2b2b33'; roundRect(4, -6, 8, 12, 2); ctx.fill();
    ctx.fillStyle = o.ph === 'fire' ? '#ffe0ff' : o.ph === 'warn' && Math.floor(t * 10) % 2 ? '#e84aff' : '#4a1a5a'; ctx.beginPath(); ctx.arc(9, 0, 3.4, 0, 7); ctx.fill(); ctx.restore(); });
}

/* end of a run: Eidi envelopes first (their Final Spin, without the slot machine), then the results */
function endRun() {
  mtQueue = []; mtT = 0; $('mtoast').classList.remove('on');
  if (SHOP.save > 0 && !usedSave) { saveMe(); return; }
  if (eidi > 0) openEidi(); else showOver();
}
function openEidi() {
  const box = $('eidiBox'), row = $('eidiRow'); row.innerHTML = ''; let left = eidi, won = 0, life = false;
  $('eidiTxt').textContent = 'Tap each envelope to open it'; $('eidiGo').classList.add('hide');
  const PRIZES = [[10, 34], [20, 24], [50, 14], [100, 6], ['life', 22]];
  for (let i = 0; i < eidi; i++) { const c = document.createElement('button'); c.className = 'env';
    c.innerHTML = '<div class="f"><span>عيدي</span></div><div class="b"></div>';
    c.addEventListener('pointerdown', e => { e.stopPropagation(); if (c.classList.contains('open')) return; c.classList.add('open');
      let r = Math.random() * 100, p = PRIZES[0][0]; for (const [v, w] of PRIZES) { if ((r -= w) < 0) { p = v; break; } }
      if (p === 'life' && (life || revived)) p = 20;
      if (p === 'life') { life = true; c.querySelector('.b').innerHTML = '<b>❤</b><small>SECOND<br>CHANCE</small>'; tone(660, .2, 'square', .06); setTimeout(() => tone(990, .3, 'square', .06), 120); }
      else { won += p; coins += p; c.querySelector('.b').innerHTML = `<b>£${p}</b><small>EIDI</small>`; SFX.coin(); }
      if (--left === 0) { $('eidiTxt').textContent = life ? 'Second chance! Get back up and keep going.' : `You got £${won} in Eidi!`; const go = $('eidiGo'); go.textContent = life ? 'GET BACK UP!' : 'CARRY ON'; go.classList.remove('hide'); go.dataset.life = life ? 1 : ''; }
    });
    row.appendChild(c); }
  box.classList.remove('hide');
}
function revive(keep) {   // second chance (Eidi or Save Me): he jumps back up and the run carries on
  $('eidiBox').classList.add('hide'); $('saveMe').classList.add('hide'); if (!keep) { revived = 1; eidi = 0; }
  hero.dead = false; hero.slide = 0; hero.rot = 0; hero.y = FLOOR; hero.vy = -560; hero.ground = false; inv = 2.4; state = 'play';
  obs = obs.filter(o => o.type !== 'rocket' && (o.type !== 'zap' || o.x > hero.x + 200)); rings.push({ x: hero.x, y: hero.y - 30, t: 0 }); flashT = .12; flashCol = '255,255,255';
}

/* ---------------- draw ---------------- */
let skyCv = null, vigCv = null; const DAY = /[?&]day=1/.test(location.search);   // midday sky (posters / testing)
function buildSky() {
  skyCv = document.createElement('canvas'); skyCv.width = cv.width; skyCv.height = cv.height; const o = skyCv.getContext('2d');
  const sky = o.createLinearGradient(0, 0, 0, cv.height);
  if (DAY) { sky.addColorStop(0, '#2f86de'); sky.addColorStop(.45, '#5aaef0'); sky.addColorStop(.75, '#a8d8fa'); sky.addColorStop(1, '#d8efff'); }
  else { sky.addColorStop(0, '#1c1f52'); sky.addColorStop(.32, '#4a3684'); sky.addColorStop(.55, '#b85d8e'); sky.addColorStop(.68, '#f08c6e'); sky.addColorStop(.74, '#ffc27c'); sky.addColorStop(1, '#ffd49a'); }
  o.fillStyle = sky; o.fillRect(0, 0, cv.width, cv.height); o.scale(S, S);
  if (DAY) { const sg = o.createRadialGradient(W * .8, 46, 4, W * .8, 46, 150); sg.addColorStop(0, 'rgba(255,255,240,1)'); sg.addColorStop(.12, 'rgba(255,250,210,.7)'); sg.addColorStop(1, 'rgba(255,250,210,0)'); o.fillStyle = sg; o.fillRect(0, 0, W, VH);
    o.fillStyle = 'rgba(255,255,255,.92)'; [[90, 70, 1], [330, 40, .8], [560, 95, 1.1], [760, 150, .7], [880, 60, .9]].forEach(([x, y, s]) => { for (let i = 0; i < 6; i++) { o.beginPath(); o.ellipse(x + (i - 2.5) * 16 * s, y + (i % 2 ? -5 : 2) * s, 20 * s, 11 * s, 0, 0, 7); o.fill(); } });
    vigCv = document.createElement('canvas'); vigCv.width = cv.width; vigCv.height = cv.height; return; }
  stars.forEach(s => { o.globalAlpha = .3 + .4 * Math.random(); o.fillStyle = '#fff7e6'; o.fillRect(s.x * W, s.y * VH, s.r, s.r); }); o.globalAlpha = 1;
  const sg = o.createRadialGradient(W * .78, G - 30, 4, W * .78, G - 30, 210); sg.addColorStop(0, 'rgba(255,236,190,.95)'); sg.addColorStop(.12, 'rgba(255,214,150,.55)'); sg.addColorStop(1, 'rgba(255,190,130,0)');
  o.fillStyle = sg; o.fillRect(0, 0, W, VH);
  vigCv = document.createElement('canvas'); vigCv.width = cv.width; vigCv.height = cv.height; const v = vigCv.getContext('2d');
  const vg = v.createRadialGradient(cv.width / 2, cv.height * .55, cv.height * .35, cv.width / 2, cv.height * .55, cv.width * .75);
  vg.addColorStop(0, 'rgba(10,6,24,0)'); vg.addColorStop(1, 'rgba(10,6,24,.42)'); v.fillStyle = vg; v.fillRect(0, 0, cv.width, cv.height);
}
/* a jet crossing the sky every 25-50 s, climbing slightly, leaving a contrail that spreads and fades (owner, 21 Nov) */
const JET = window.__JET = { t: 8 + Math.random() * 10, on: null, trail: [] };
function drawJet() { const now = performance.now() / 1000, dt = Math.min(.05, now - (JET.last || now)); JET.last = now;
  if (!JET.on) { JET.t -= dt; if (JET.t <= 0) { const dir = Math.random() < .5 ? 1 : -1; JET.on = { x: dir > 0 ? -40 : W + 40, y: 26 + Math.random() * 40, dir, v: 34 + Math.random() * 10, climb: -(1 + Math.random() * 1.4), s: .8 + Math.random() * .35 }; JET.trail = []; JET.drop = 0; } }
  const j = JET.on;
  if (j) { j.x += j.dir * j.v * dt; j.y += j.climb * dt; JET.drop += dt; if (JET.drop > .08) { JET.drop = 0; JET.trail.push({ x: j.x - j.dir * 14 * j.s, y: j.y + 1.4 * j.s, t: now }); } if (j.x < -80 || j.x > W + 80) { JET.on = null; JET.t = 25 + Math.random() * 25; } }
  for (const p of JET.trail) { const age = now - p.t; if (age > 9) continue; const a = (1 - age / 9) * .55, r = 1.1 + age * .7; ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.beginPath(); ctx.ellipse(p.x, p.y + age * .6, r * 1.6, r, 0, 0, 7); ctx.fill(); }
  while (JET.trail.length && now - JET.trail[0].t > 9) JET.trail.shift();
  if (!j) return; ctx.save(); ctx.translate(j.x, j.y); ctx.scale(j.dir * j.s, j.s); ctx.rotate(-.04);
  ctx.fillStyle = '#9aa6b4'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-9, 7); ctx.lineTo(-5.4, 7); ctx.lineTo(4, .6); ctx.fill();   // far wing
  const fg = ctx.createLinearGradient(0, -2.4, 0, 2.4); fg.addColorStop(0, '#ffffff'); fg.addColorStop(1, '#c4ccd6'); ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(-14, -1.2); ctx.quadraticCurveTo(-15, 1.6, -12, 1.8); ctx.lineTo(10, 1.8); ctx.quadraticCurveTo(15, 1.6, 15.6, 0); ctx.quadraticCurveTo(14, -1.8, 10, -1.8); ctx.lineTo(-12, -1.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a5ab8'; ctx.beginPath(); ctx.moveTo(-11, -1.6); ctx.lineTo(-15, -7.4); ctx.lineTo(-12.6, -7.4); ctx.lineTo(-7, -1.6); ctx.fill();   // tail fin
  ctx.fillStyle = '#d8dee6'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-16, 2.4); ctx.lineTo(-14.6, 2.4); ctx.lineTo(-10, .4); ctx.fill();
  ctx.fillStyle = '#e4e8ee'; ctx.beginPath(); ctx.moveTo(-1, .6); ctx.lineTo(-7, 6.4); ctx.lineTo(-4, 6.4); ctx.lineTo(5, 1); ctx.fill();   // near wing
  ctx.fillStyle = '#8a96a6'; ctx.beginPath(); ctx.ellipse(-2.6, 3.6, 2, .9, 0, 0, 7); ctx.fill();   // engine
  ctx.fillStyle = '#2a5ab8'; ctx.fillRect(-8, -.3, 18, .5); ctx.fillStyle = '#3a4656'; for (let i = 0; i < 9; i++) ctx.fillRect(-6 + i * 2, -1, .7, .6); ctx.fillRect(12, -1.1, 1.8, .8);
  ctx.restore(); }

/* live animations from Flappy (owner, 21 Nov): the moving parts of the buildings (Luton Hoo helicopter + fountain, Town Hall clock +
   flags, Masjid-e-Ali flag, Wardown ducks + pedalo, the bridge water, the funfair) are drawn every frame on top of the building
   picture, a Thameslink train runs along the station viaduct and planes take off from behind the airport */
const LIVE_ANIM = new Set(Object.keys(window.LM_ANIM || {}).filter(k => k !== 'train' && k !== 'plane' && k !== 'wardownbridge'));
function drawTrain(b, t) { const k = BS * ((window.SCALE && SCALE.station) || 1), x0 = b.x / k, Gs = G / k; const span = 270, per = 9, ph = (t % per) / per, off = -230 + ph * (span + 460);
  ctx.save(); ctx.scale(k, k); ctx.beginPath(); ctx.rect(x0 - 6, Gs - 150, span + 12, 58); ctx.clip();
  const tx = x0 + off, deck = Gs - 94;
  for (let c2 = 0; c2 < 3; c2++) { const cx = tx + c2 * 68, L2 = c2 === 2 ? 70 : 64;
    const gr = ctx.createLinearGradient(0, deck - 30, 0, deck); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.6, '#e6eaee'); gr.addColorStop(1, '#b8c0c8'); ctx.fillStyle = gr;
    ctx.beginPath(); if (c2 === 2) { ctx.moveTo(cx, deck - 2); ctx.lineTo(cx, deck - 28); ctx.lineTo(cx + 54, deck - 28); ctx.quadraticCurveTo(cx + 66, deck - 26, cx + 70, deck - 10); ctx.lineTo(cx + 70, deck - 2); } else { ctx.roundRect ? ctx.roundRect(cx, deck - 28, L2, 26, 3) : ctx.rect(cx, deck - 28, L2, 26); } ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .4; ctx.stroke();
    ctx.fillStyle = '#1e2a40'; ctx.fillRect(cx + 2, deck - 21, (c2 === 2 ? 52 : L2 - 4), 7); for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(160,190,220,.35)'; ctx.fillRect(cx + 4 + i * 9, deck - 20.4, 6, 2); }
    ctx.fillStyle = '#4a8ad6'; for (const d of [16, 44]) if (c2 < 2 || d < 40) { ctx.fillRect(cx + d, deck - 25, 7, 21); ctx.fillStyle = '#26303a'; ctx.fillRect(cx + d + 1, deck - 23, 5, 6); ctx.fillStyle = '#4a8ad6'; }
    ctx.fillStyle = '#f2c43a'; if (c2 === 2) { ctx.beginPath(); ctx.moveTo(cx + 56, deck - 12); ctx.quadraticCurveTo(cx + 66, deck - 11, cx + 70, deck - 4); ctx.lineTo(cx + 70, deck - 2); ctx.lineTo(cx + 56, deck - 2); ctx.fill(); ctx.fillStyle = '#26303a'; ctx.beginPath(); ctx.moveTo(cx + 56, deck - 26); ctx.lineTo(cx + 62, deck - 25); ctx.quadraticCurveTo(cx + 67, deck - 21, cx + 68, deck - 15); ctx.lineTo(cx + 56, deck - 15); ctx.fill(); ctx.fillStyle = '#fff6d0'; ctx.fillRect(cx + 66, deck - 8, 2.4, 1.6); }
    ctx.fillStyle = '#2a2c32'; ctx.fillRect(cx + 2, deck - 3, L2 - 4, 2); for (const wx of [cx + 10, cx + L2 - 12]) { ctx.beginPath(); ctx.arc(wx, deck - 1.4, 2.2, 0, 7); ctx.fillStyle = '#1a1a1e'; ctx.fill(); }
    ctx.fillStyle = '#5a6070'; ctx.font = '700 4px Mont, sans-serif'; ctx.textBaseline = 'middle'; if (c2 === 1) ctx.fillText('Thameslink', cx + 4, deck - 8); }
  ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = .6; for (let i = 0; i < 3; i++) { const px2 = tx + 20 + i * 68; ctx.beginPath(); ctx.moveTo(px2, deck - 28); ctx.lineTo(px2 + 6, deck - 35); ctx.lineTo(px2 + 12, deck - 35); ctx.stroke(); }
  ctx.restore(); }
function drawTakeoff(b, t) { const k = BS * ((window.SCALE && SCALE.airport) || 1), x0 = b.x / k, Gs = G / k, per = 16, ph = (t % per) / per; if (ph > .7) return; const p = ph / .7;
  const px2 = x0 + 40 + p * 520, py = Gs - 120 - Math.pow(p, 1.5) * 220, a = -.22 - p * .08, sc = 1.5;
  ctx.save(); ctx.scale(k, k);
  for (let i = 0; i < 26; i++) { const q = p - i * .012; if (q < .1) break; const qx = x0 + 40 + q * 520 - 34, qy = Gs - 120 - Math.pow(q, 1.5) * 220 + 6, al = (1 - i / 26) * .14; ctx.fillStyle = `rgba(220,224,230,${al.toFixed(3)})`; ctx.beginPath(); ctx.ellipse(qx, qy, 3 + i * .5, 1.6 + i * .25, a, 0, 7); ctx.fill(); }
  ctx.translate(px2, py); ctx.rotate(a); ctx.scale(sc, sc);
  ctx.fillStyle = '#a8b2be'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-12, 9); ctx.lineTo(-7.6, 9); ctx.lineTo(5, .6); ctx.fill();
  const fg = ctx.createLinearGradient(0, -3, 0, 3); fg.addColorStop(0, '#ffffff'); fg.addColorStop(1, '#c4ccd6'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-19, -1.6); ctx.quadraticCurveTo(-20, 2, -16, 2.4); ctx.lineTo(13, 2.4); ctx.quadraticCurveTo(20, 2, 21, 0); ctx.quadraticCurveTo(19, -2.4, 13, -2.4); ctx.lineTo(-16, -2.4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = .25; ctx.stroke();
  ctx.fillStyle = '#e8641c'; ctx.beginPath(); ctx.moveTo(-15, -2.2); ctx.lineTo(-20, -10); ctx.lineTo(-16.6, -10); ctx.lineTo(-9, -2.2); ctx.fill(); ctx.fillRect(-12, -.4, 24, .7);
  ctx.fillStyle = '#d8dee6'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-21, 3); ctx.lineTo(-19, 3); ctx.lineTo(-13, .4); ctx.fill();
  ctx.fillStyle = '#eef0f4'; ctx.beginPath(); ctx.moveTo(-1, .8); ctx.lineTo(-9, 8.6); ctx.lineTo(-5, 8.6); ctx.lineTo(7, 1.2); ctx.fill(); ctx.fillStyle = '#8a96a6'; ctx.beginPath(); ctx.ellipse(-3.4, 4.6, 2.6, 1.1, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#3a4656'; for (let i = 0; i < 12; i++) ctx.fillRect(-9 + i * 2, -1.4, .8, .7); ctx.fillRect(16, -1.5, 2.4, 1);
  if (p < .25) { ctx.fillStyle = '#2a2a2e'; ctx.fillRect(-4, 2.4, .6, 2.4); ctx.fillRect(10, 2.4, .6, 2.4); }
  ctx.restore(); }

function px(v) { return Math.round(v * S) / S; }
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';
  if (!skyCv || skyCv.width !== cv.width || skyCv.height !== cv.height) buildSky();
  ctx.drawImage(skyCv, 0, 0);
  const shx = shake > 0 ? (Math.random() - .5) * shake * 14 : 0, shy = shake > 0 ? (Math.random() - .5) * shake * 14 : 0;
  ctx.setTransform(S, 0, 0, S, shx * S, shy * S);
  drawJet();
  // far hazy skyline (smaller, slower)
  const sk = .5;
  skyline.forEach(b => { const v = buildingCanvas(b.kind, b.key); if (!v) return; const h = hazed(b.kind + ':' + b.key + '@' + KR, v);
    ctx.drawImage(h, b.x + v.ox * sk, G - 8 + v.top * sk, v.c.width / v.k * sk, v.c.height / v.k * sk); });
  // main street buildings
  ctx.imageSmoothingEnabled = true;
  const tA = performance.now() / 1000;
  street.forEach(b => { if (b.x > W + 40 || b.x + b.w < -40) return; const v = buildingCanvas(b.kind, b.key); if (!v) return;
    if (b.key === 'airport') drawTakeoff(b, tA);
    ctx.drawImage(v.c, px(b.x + v.ox * BS), px(G + v.top * BS), v.c.width / S, v.c.height / S);
    if (b.kind === 'lm' && LIVE_ANIM.has(b.key)) { const af = b.key !== 'lutonhoo' && window.SCALE && SCALE[b.key] || 1, k = BS * af; ctx.save(); ctx.scale(k, k); try { LM_ANIM[b.key](ctx, b.x / k, G / k, tA); } catch (e) {} ctx.restore(); }
    if (b.key === 'station') drawTrain(b, tA); });
  // far pavement, road, kerb
  ctx.fillStyle = '#b3a3a3'; ctx.fillRect(0, G, W, ROAD_T - G); ctx.fillStyle = '#8c7c84'; ctx.fillRect(0, ROAD_T - 2, W, 2);
  const off = (dist % 30);
  ctx.fillStyle = '#9c8c92'; for (let x = -off; x < W; x += 30) ctx.fillRect(x, G, .6, ROAD_T - G - 2);
  const rg = ctx.createLinearGradient(0, ROAD_T, 0, ROAD_B); rg.addColorStop(0, '#4a4456'); rg.addColorStop(1, '#3a3546'); ctx.fillStyle = rg; ctx.fillRect(0, ROAD_T, W, ROAD_B - ROAD_T);
  ctx.fillStyle = '#d6b23c'; ctx.fillRect(0, ROAD_T + 2, W, .9); ctx.fillRect(0, ROAD_T + 4, W, .9);
  ctx.fillStyle = '#ece6dc'; const d2 = dist % 60; for (let x = -d2; x < W; x += 60) ctx.fillRect(x, (ROAD_T + ROAD_B) / 2 - .8, 32, 1.6);
  // sun glint on the road
  const gl = ctx.createRadialGradient(W * .78, ROAD_T + 16, 2, W * .78, ROAD_T + 16, 120); gl.addColorStop(0, 'rgba(255,200,140,.28)'); gl.addColorStop(1, 'rgba(255,200,140,0)'); ctx.fillStyle = gl; ctx.fillRect(0, ROAD_T, W, ROAD_B - ROAD_T);
  // cars (far lane then near lane)
  { const depth = c => c.lane === 0 || (c.yo < -LD * .5) ? 0 : 1;   // an overtaking car is drawn at the depth of the lane it has pulled into
    [0, 1].forEach(dl => cars.filter(c => depth(c) === dl).sort((p, q) => p.yo - q.yo).forEach(drawTrafficCar));
    csmoke.forEach(p => { ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.dark ? '#3a3438' : '#c8c4cc'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1; }
  // kerb + front pavement
  ctx.fillStyle = '#d4c8c2'; ctx.fillRect(0, ROAD_B, W, 4); ctx.fillStyle = '#8f8088'; ctx.fillRect(0, ROAD_B + 4, W, 2);
  const pg = ctx.createLinearGradient(0, PAVE_T - 2, 0, VH); pg.addColorStop(0, '#cbb8b0'); pg.addColorStop(1, '#a8949a'); ctx.fillStyle = pg; ctx.fillRect(0, ROAD_B + 6, W, VH - ROAD_B - 6);
  ctx.fillStyle = 'rgba(110,92,104,.55)'; const d3 = dist % 34;
  for (let r = 0; r < 4; r++) { const y = ROAD_B + 6 + r * 11; ctx.fillRect(0, y, W, .7); const o2 = r % 2 ? 17 : 0; for (let x = -d3 - o2; x < W; x += 34) ctx.fillRect(x, y, .7, 11); }
  ctx.fillStyle = 'rgba(16,8,38,.2)'; ctx.fillRect(0, 0, W, ROAD_B);   // knock the backdrop back a touch
  // coins
  if (coinK !== KR) makeCoins();
  coinList.forEach(c => { const f = coinFrames[Math.floor((t * 14 + c.x * .05)) % 16]; const s2 = f.width / KR; ctx.drawImage(f, c.x - s2 / 2, c.y - s2 / 2 + Math.sin(t * 4 + c.x * .1) * .8, s2, s2); });
  // obstacles
  obs.forEach(o => { if (o.type === 'zap') drawZap(o); else if (o.type === 'laser') drawLaser(o); else drawRocket(o); });
  gifts.forEach(drawGift);
  // people + hero, sorted by depth (feet y)
  const list = npcs.map(p => ({ y: p.y, f: () => drawNpc(p) })); mobs.forEach(m => list.push({ y: m.y, f: () => { const M = NPC_META.mobility, im = npcGet('mobility'); if (!M || !im.naturalWidth) return; const sc = .9 / M.k, w = M.w * sc, h = M.h * sc, f = Math.floor(m.roll / 9) % M.n;
    ctx.save(); ctx.translate(m.x, m.y); if (m.d < 0) ctx.scale(-1, 1); ctx.drawImage(im, f * M.w, 0, M.w, M.h, -w / 2, -h, w, h); ctx.restore(); } })); list.push({ y: hero.dead ? FLOOR + 6 : (hero.ground ? FLOOR : FLOOR + 1), f: drawHero });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  dust.forEach(p => { ctx.globalAlpha = Math.max(0, p.l * 1.6) * .6; ctx.fillStyle = '#d8ccc6'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
  rings.forEach(r => { ctx.strokeStyle = `rgba(255,255,255,${.8 * (1 - r.t / .6)})`; ctx.lineWidth = 3 * (1 - r.t / .6) + .5; ctx.beginPath(); ctx.arc(r.x, r.y, 10 + r.t * 220, 0, 7); ctx.stroke(); });
  // steam (soft, HD) over everything near him
  ctx.fillStyle = '#f4f1fa'; steam.forEach(p => { ctx.globalAlpha = Math.max(0, p.l / p.l0) * .85; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;
  sparks.forEach(p => { ctx.globalAlpha = Math.min(1, p.l * 3); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 1.6, 1.6); }); ctx.globalAlpha = 1;
  // rocket warnings on the right edge
  obs.forEach(o => { if (o.type === 'rocket' && (o.warn > 0 || o.lock > 0)) { const x = W - 20;   // small red ! that follows him, then a big flashing starburst just before it fires
    ctx.save(); ctx.translate(x + (o.lock > 0 ? (Math.random() - .5) * 2.4 : 0), o.y);
    if (o.lock > 0) { const s2 = 1 + Math.sin(t * 30) * .08; ctx.scale(s2, s2); ctx.fillStyle = '#ffd21f'; ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * 2, r = i % 2 ? 9 : 15; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#d8141c'; ctx.font = '900 17px Mont, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 1); }
    else { const blink = Math.floor(t * 8) % 2; ctx.globalAlpha = blink ? 1 : .55; ctx.fillStyle = '#e8161e'; ctx.font = '900 16px Mont, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText('!', 0, 0); ctx.fillText('!', 0, 0); }
    ctx.restore(); } });
  pops.forEach(p => { ctx.globalAlpha = Math.min(1, (1.1 - p.t) * 3); ctx.font = '12px PS'; ctx.textAlign = 'center'; ctx.fillStyle = '#160c28'; ctx.fillText(p.txt, p.x + 1.5, p.y + 1.5); ctx.fillStyle = p.col; ctx.fillText(p.txt, p.x, p.y); }); ctx.globalAlpha = 1;
  if (banner) drawBanner();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vigCv, 0, 0);
  if (flashT > 0) { ctx.fillStyle = `rgba(${flashCol},${Math.min(.75, flashT * 4)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}

function drawHero() {
  if (!heroImg.complete || state === 'menu') return;
  if (boost) { drawBoost(); if (!boost.out) return; }
  if (veh) { drawVehicle(); return; }
  if (inv > 0 && Math.floor(t * 14) % 2) return;
  let f;
  if (hero.dead) f = hero.shockT > 0 || hero.slide ? FR('fall0_ko') : FR('fall' + (Math.floor((hero.flail || 0) * 14) % 3) + '_panic');   // arms flailing as he tumbles
  else if (state === 'menu') f = FR('fly' + (Math.floor(t * 9) % 3) + '_effort');
  else if (hero.ground) f = hero.landT > 0 ? FR('land0_effort') : FR('run' + (Math.floor(hero.run) % 6) + '_normal');
  else if (hero.thrust) f = FR('fly' + (Math.floor(t * 12) % 3) + (panicT > 0 ? '_panic' : '_effort'));
  else f = FR('glide' + (Math.floor(t * 6) % 2) + '_normal');
  ctx.save(); ctx.translate(hero.x, hero.y); ctx.rotate(hero.rot); ctx.imageSmoothingEnabled = false;
  // soft shadow on the pavement
  ctx.restore(); ctx.save();
  const gap = Math.max(0, FLOOR - hero.y); ctx.fillStyle = `rgba(30,10,30,${Math.max(.08, .32 - gap / 600)})`; ctx.beginPath(); ctx.ellipse(hero.x, FLOOR + 1, 20 - Math.min(10, gap / 25), 3.4, 0, 0, 7); ctx.fill();
  ctx.translate(hero.x, hero.y - (hero.slide ? HW * HS * .4 : 0)); ctx.rotate(hero.rot); if (hero.dead && hero.squash > 0) ctx.scale(1 + hero.squash * .18, 1 - hero.squash * .22); ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = true; ctx.drawImage(heroImg, f * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH);
  if (hero.dead && hero.shockT > 0) {   // frazzled: flashes electric white/blue with crackles round him
    if (Math.floor(t * 24) % 2) { tintCv.width = HW * HX4; tintCv.height = HH0 * HX4; const tc = tintCv.getContext('2d'); tc.drawImage(heroImg, f * HW * HX4, 0, HW * HX4, HH0 * HX4, 0, 0, HW * HX4, HH0 * HX4);
      tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = flashCol === '255,90,90' ? 'rgba(255,220,220,.9)' : 'rgba(220,245,255,.92)'; tc.fillRect(0, 0, tintCv.width, tintCv.height); ctx.drawImage(tintCv, -HW * HS / 2, -HH, HW * HS, HH); }
    ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { ctx.beginPath(); let a = Math.random() * 6.3, r0 = 18 + Math.random() * 14; ctx.moveTo(Math.cos(a) * r0, -40 + Math.sin(a) * r0); for (let j = 0; j < 4; j++) { a += (Math.random() - .5) * 1.2; r0 += 6; ctx.lineTo(Math.cos(a) * r0, -40 + Math.sin(a) * r0); } ctx.stroke(); }
  }
  ctx.restore(); ctx.imageSmoothingEnabled = true;
}
const tintCv = document.createElement('canvas');
function drawNpc(p) {
  const im = npcGet(p.k), M = NPC_META[p.k]; if (!M || !im.complete || !im.naturalWidth) return;
  const sc = .9 / (M.k || 1), w = M.w * sc, h = M.h * sc;
  let facing = p.dir; if (p.flee > 0) facing = p.dir;
  if ((p.react > 0 || p.moodT > 0) && !p.esc) facing = p.look;
  if (p.fall > 0 && M.v3) facing = -p.fallDir;   // lying frame has the head behind: head goes the way they fell
  else if (p.idle < 0 && !p.esc) facing = (p.idle < -.8 ? -p.dir : p.dir);      // looks back over the shoulder
  let f;
  if (p.esc) f = p.react > 0 ? 3 : p.moodT > 0 ? 4 : Math.floor(p.ph) % 3;
  else if (p.fall > 0) f = M.v3 ? ((p.fall0 || 1.9) - p.fall < .22 ? 15 : 16) : (p.fall0 || 1.9) - p.fall < .2 ? 8 : 10;
  else if (p.flee > 0) f = M.n > 11 ? 11 + Math.floor(p.ph) % 4 : 8;      // panic run: legs going, arms up
  else if (p.react > 0) f = 8;
  else if (p.moodT > 0) f = 9;
  else { const still = p.idle < 0; f = (still ? 0 : Math.floor(p.ph) % 4) + (p.blink < 0 ? 4 : 0); }
  const walking = !p.esc && (p.flee > 0 || !(p.react > 0 || p.moodT > 0 || p.idle < 0 || p.fall > 0));
  const bob = p.esc ? (Math.floor(p.ph * .5) % 2) * .6 : walking ? (Math.floor(p.ph) % 2) * 1.2 : 0, hop = Math.sin(p.hop * Math.PI) * p.hopH;
  if (!M.v3) { ctx.fillStyle = 'rgba(30,10,30,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, w * (p.fall > 0 ? .6 : .36), 2, 0, 0, 7); ctx.fill(); }
  ctx.save(); ctx.translate(p.x, p.y - bob - hop);
  if (p.fall > 0 && !M.v3) {   // knocked flat like Jetpack Joyride's scientists: snap back, slam down, small bounce, then lie there
    const T = (p.fall0 || 1.9) - p.fall; let a, lift = 0;
    if (T < .06) { a = -.35 * (T / .06); lift = 5 * (T / .06); }
    else if (T < .2) { const k = (T - .06) / .14; a = -.35 + (Math.PI / 2 + .35) * k * k; lift = 5 * (1 - k); }
    else if (T < .34) { const k = (T - .2) / .14; a = Math.PI / 2 - .16 * Math.sin(k * Math.PI); lift = 3 * Math.sin(k * Math.PI); }
    else a = Math.PI / 2;
    ctx.translate(0, -lift); ctx.rotate(p.fallDir * a); if (T > .2) ctx.translate(0, 3);
  }
  if (facing < 0) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true;
  ctx.drawImage(im, f * M.w, 0, M.w, M.h, -w / 2, -h, w, h); ctx.restore(); ctx.imageSmoothingEnabled = true;
  if (p.fall > 0 && (M.v3 ? (p.fall0 || 1.9) - p.fall > .3 : p.fall < 1.6)) {   // little stars circling the head
    const cx = M.v3 ? p.x + p.fallDir * 26 : p.x + p.fallDir * h * .62, cy = M.v3 ? p.y - 13 : p.y - 14;
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; ctx.fillStyle = i % 2 ? '#ffe36a' : '#ffffff'; drawStar(cx + Math.cos(a) * 10, cy + Math.sin(a) * 3.5, 2.6); }
  }
  // (no speech bubbles: the faces and bodies do the reacting)
}
function drawStar(x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function drawZap(o) {
  const c = Math.cos(o.ang), s = Math.sin(o.ang), ax = o.x - c * o.len / 2, ay = o.y - s * o.len / 2, bx = o.x + c * o.len / 2, by = o.y + s * o.len / 2;
  const path = (seed, amp) => { ctx.beginPath(); const n = 14; ctx.moveTo(ax, ay);
    for (let i = 1; i < n; i++) { const k = i / n, j = Math.sin(t * 40 + i * 1.7 + o.seed + seed) * amp + Math.sin(t * 23 + i * 3.1) * amp * .4; ctx.lineTo(ax + (bx - ax) * k - s * j, ay + (by - ay) * k + c * j); }
    ctx.lineTo(bx, by); };
  ctx.lineCap = ctx.lineJoin = 'round';
  // dark backing so it stands out against the shops
  const pulse = .75 + .25 * Math.sin(t * 9 + o.seed);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.strokeStyle = 'rgba(6,2,22,.62)'; ctx.lineWidth = 20; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.strokeStyle = `rgba(40,160,255,${.28 * pulse})`; ctx.lineWidth = 30; ctx.stroke();
  ctx.strokeStyle = `rgba(60,190,255,${.4 * pulse})`; ctx.lineWidth = 16; ctx.stroke();
  ctx.strokeStyle = `rgba(110,215,255,${.7 * pulse})`; ctx.lineWidth = 8; ctx.stroke();
  path(0, 3.8); ctx.strokeStyle = 'rgba(170,235,255,1)'; ctx.lineWidth = 5; ctx.stroke();
  path(2, 2.4); ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 2; ctx.stroke();
  path(4, 1.4); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
  // insulator nodes (grey caps, orange bands, little lamp)
  [[ax, ay, 1], [bx, by, -1]].forEach(([x, y, sd]) => { ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const hg = ctx.createRadialGradient(0, 0, 2, 0, 0, 19); hg.addColorStop(0, 'rgba(200,245,255,.9)'); hg.addColorStop(.5, 'rgba(70,190,255,.35)'); hg.addColorStop(1, 'rgba(40,140,255,0)'); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, 19, 0, 7); ctx.fill();
    ctx.rotate(t * 3 * sd + o.seed); ctx.fillStyle = 'rgba(160,230,255,.85)'; ctx.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, r = i % 2 ? 8 : 13 + Math.sin(t * 20 + i) * 1.6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.rotate(o.ang); const mg = ctx.createLinearGradient(0, -6, 0, 6); mg.addColorStop(0, '#f4f6fa'); mg.addColorStop(.45, '#b8c0cc'); mg.addColorStop(1, '#5a6272'); ctx.fillStyle = mg; roundRect(-6.5, -6, 13, 12, 3); ctx.fill(); ctx.strokeStyle = '#1a1024'; ctx.lineWidth = .8; ctx.stroke();
    ctx.fillStyle = '#2a3040'; ctx.fillRect(-6.5, -2, 13, 1.2); ctx.fillRect(-6.5, 1.4, 13, 1.2); ctx.fillStyle = Math.floor(t * 10) % 2 ? '#bff4ff' : '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, 7); ctx.fill();
    ctx.restore(); });
  if (Math.random() < .25) sparks.push({ x: ax + (bx - ax) * Math.random(), y: ay + (by - ay) * Math.random(), vx: (Math.random() - .5) * 80, vy: -Math.random() * 60, l: .25, c: '#dff8ff' });
}
function drawRocket(o) {   // white missile (longer than Barry's), red tip band, fins, roaring flame, long trail of smoke puffs
  if (o.warn > 0 || o.lock > 0) return;
  (o.tr || []).forEach(p => { const k = p.a / 1.1; ctx.fillStyle = `rgba(${150 - k * 40},${120 - k * 30},${100 - k * 20},${(.55 * (1 - k)).toFixed(3)})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.save(); ctx.translate(o.x, o.y);
  const fl = 10 + Math.random() * 8; let gr = ctx.createLinearGradient(16, 0, 16 + fl, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.3, '#ffe07a'); gr.addColorStop(.7, '#ff8a2a'); gr.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(15, -4); ctx.quadraticCurveTo(16 + fl, -1, 16 + fl * 1.15, 0); ctx.quadraticCurveTo(16 + fl, 1, 15, 4); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(17, 0, 0, 17, 0, 14); gl.addColorStop(0, 'rgba(255,190,90,.7)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = gl; ctx.fillRect(3, -14, 28, 28); ctx.restore();
  ctx.fillStyle = '#c8ccd4'; ctx.beginPath(); ctx.moveTo(10, -4.4); ctx.lineTo(17, -9); ctx.lineTo(17, -4.4); ctx.fill(); ctx.beginPath(); ctx.moveTo(10, 4.4); ctx.lineTo(17, 9); ctx.lineTo(17, 4.4); ctx.fill();   // tail fins
  gr = ctx.createLinearGradient(0, -5, 0, 5); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, '#f4f6f8'); gr.addColorStop(.8, '#b8bec8'); gr.addColorStop(1, '#8a909a'); ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(-14, -4.4); ctx.lineTo(15, -4.4); ctx.lineTo(16.5, -3); ctx.lineTo(16.5, 3); ctx.lineTo(15, 4.4); ctx.lineTo(-14, 4.4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(40,40,50,.55)'; ctx.lineWidth = .5; ctx.stroke();
  ctx.fillStyle = '#d8262e'; ctx.fillRect(-12, -4.4, 3, 8.8); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, -4.4, .6, 8.8); ctx.fillRect(9, -4.4, .6, 8.8);
  gr = ctx.createLinearGradient(0, -4, 0, 4); gr.addColorStop(0, '#5a5e68'); gr.addColorStop(1, '#22242a'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-14, -4.4); ctx.quadraticCurveTo(-22, -2, -24, 0); ctx.quadraticCurveTo(-22, 2, -14, 4.4); ctx.closePath(); ctx.fill();   // nose cone
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-9, -3.4, 18, .8);
  ctx.restore();
}

/* ---------------- flow ---------------- */
const mosName = () => (MOSQUES.find(m => m[0] === myMosque) || [, 'your masjid'])[1];
function toast(msg) { const t2 = $('toast'); t2.textContent = msg; t2.classList.remove('hide'); clearTimeout(toast.t); toast.t = setTimeout(() => t2.classList.add('hide'), 2200); }
function thumb(cnv, key) {   // a masjid drawn small for the picker / the home tile
  const v = buildingCanvas('lm', key); if (!v) return; const o = cnv.getContext('2d'); o.clearRect(0, 0, cnv.width, cnv.height);
  const k = Math.min(cnv.width * .94 / v.c.width, cnv.height * .9 / v.c.height); o.imageSmoothingQuality = 'high';
  o.drawImage(v.c, (cnv.width - v.c.width * k) / 2, cnv.height - v.c.height * k - 2, v.c.width * k, v.c.height * k);
}
function refreshHome() {
  $('hBest').textContent = best + 'm'; $('hBank').textContent = '£' + bank.toLocaleString('en-GB'); $('misStars').textContent = '★'.repeat(MS.stars) + '☆'.repeat(3 - MS.stars);
  $('outName').textContent = (ITEMS.outfit.find(o => o.id === SHOP.outfit) || {}).name.split(' ')[0].toLowerCase(); $('mosName').textContent = myMosque ? mosName() : 'Pick one'; $('mineName').textContent = mosName();
  if (myMosque) thumb($('mosThumb'), myMosque);
}
function openPick() {
  const L = $('mlist'); L.innerHTML = '';
  MOSQUES.forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'mcard' + (k === myMosque ? ' on' : '');
    const c = document.createElement('canvas'); c.width = 320; c.height = 200; b.appendChild(c); b.appendChild(document.createTextNode(n));
    b.addEventListener('pointerdown', e => { e.stopPropagation(); myMosque = k; try { localStorage.setItem('jd_mosque', k); } catch (e2) {} [...L.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); refreshHome(); street = []; skyline = []; fillStreet(); fillSkyline(); });
    L.appendChild(b); setTimeout(() => thumb(c, k), 0); });
  $('pick').classList.remove('hide');
}
function share(txt) {
  const data = { title: 'Jummah Dash', text: txt, url: location.href.split('#')[0] };
  if (navigator.share) navigator.share(data).catch(() => {});
  else { try { navigator.clipboard.writeText(txt + ' ' + data.url); toast('Link copied'); } catch (e) { toast(data.url); } }
}
function start() {
  if (!myMosque) { openPick(); return; }
  audio(); if (AC && AC.state === 'suspended') AC.resume();
  street = []; skyline = []; reset(); passed = 0; state = 'intro'; hero.x = -30;
  ['home', 'over', 'pick', 'how'].forEach(id => $(id).classList.add('hide')); $('hud').style.display = 'block';
}
function goHome() { boost = null; $('hsBox').classList.remove('on'); $('saveMe').classList.add('hide'); clearInterval(saveMe.iv); hero.dead = false; deadT = 0; veh = null; inv = 0; obs = []; coinList = []; gifts = []; $('eidiBox') && $('eidiBox').classList.add('hide'); state = 'menu'; ['over'].forEach(id => $(id).classList.add('hide')); $('hud').style.display = 'none'; $('home').classList.remove('hide'); refreshHome(); }
function saveMe() {   // their SAVE ME: spend a Second Chance to carry on, 3 second countdown
  const box = $('saveMe'); $('smN').textContent = 'You have ' + SHOP.save; box.classList.remove('hide'); let left = 3; $('smT').textContent = left;
  clearInterval(saveMe.iv); saveMe.iv = setInterval(() => { left--; $('smT').textContent = Math.max(0, left); if (left <= 0) { clearInterval(saveMe.iv); box.classList.add('hide'); usedSave = 1; if (eidi > 0) openEidi(); else showOver(); } }, 1000);
}
function showOver() {
  missionsEndRun(); const m = Math.floor(dist / 10); if (m > best) { best = m; try { localStorage.setItem('jd_best', best); } catch (e) {} }
  bank += coins; try { localStorage.setItem('jd_bank', bank); } catch (e) {}
  $('oD').textContent = m + 'm'; $('oC').textContent = '£' + coins; $('oB').textContent = best + 'm';
  $('ovT').textContent = ['MISSED THE KHUTBAH!', 'SO CLOSE, AKHI!', 'THE IMAM STARTED!', 'BACK OF THE SAFF FOR YOU'][Math.random() * 4 | 0];
  $('ovWhy').textContent = `Still no sign of ${mosName()}…` + (passed ? ` You flew past ${passed} other masjid${passed > 1 ? 's' : ''}.` : '');
  $('oS').textContent = stats.steamed; $('oZ').textContent = stats.dodged; $('oM').textContent = stats.missed;
  const lm = lastMissions; $('ovMis').innerHTML = (lm && lm.got.length ? `<div class="mdone">${lm.got.map(x => '<div>✔ MISSION COMPLETE · ' + x + '</div>').join('')}${lm.rankUp ? '<div class="lvl">RANK UP! ' + lm.rankUp.toUpperCase() + '</div>' : ''}<div class="rew">+£${lm.reward} to your bank</div></div>` : '') + rankHtml() + '<div id="ovRows"></div>';
  missionRows($('ovRows'));
  $('over').classList.remove('hide'); }
const tap = (id, fn) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(e); });
tap('home', e => { if (e.target.closest('.tile')) return; start(); });
tap('bMos', openPick); tap('pickClose', () => $('pick').classList.add('hide'));
tap('bHow', () => $('how').classList.remove('hide'));

/* ================= SHOP: utilities, gadgets (2 slots, buy a 3rd), outfits ================= */
const ITEMS = {
  util: [
    { id: 'hs500', name: 'HEAD START 500M', desc: "Your uncle's Corolla blasts you 500m down the road. Tap it as the run starts.", price: 250, use: 1 },
    { id: 'hs1000', name: 'HEAD START 1000M', desc: 'The full uncle experience. 1,000m, no stopping, no seatbelt.', price: 600, use: 1 },
    { id: 'save', name: 'SECOND CHANCE', desc: 'A spare Eidi. When you go down, tap SAVE ME to carry on where you fell.', price: 300, use: 1 },
    { id: 'slot', name: 'EXTRA GADGET SLOT', desc: 'Wear 3 gadgets at once instead of 2.', price: 3000 },
  ],
  gadget: [
    { id: 'tin', name: 'CHARITY TIN', desc: 'Every £1 coin near you jumps straight into the tin. Sadaqah never felt so good.', price: 750 },
    { id: 'chappal', name: "AMMI'S CHAPPAL", desc: 'Heavier on the way down, like you just heard it coming. Sharper control.', price: 400 },
    { id: 'dates', name: 'LUCKY DATES', desc: 'Gift boxes turn up twice as often, so more rides.', price: 1200 },
    { id: 'envelope', name: 'EIDI POUCH', desc: 'Eidi envelopes turn up twice as often.', price: 900 },
    { id: 'misbaha', name: 'GOLDEN MISBAHA', desc: 'Start every run on a random ride: tuk-tuk, carpet, Flappy Kabootar or the sandals.', price: 2500 },
  ],
  outfit: [
    { id: 'classic', name: 'CLASSIC THOBE', desc: 'Fresh white thobe. Ironed this morning. Probably.', price: 0 },
    { id: 'puffer', name: 'PUFFER JACKET', desc: 'Black puffer over the thobe. Luton in November.', price: 1000 },
    { id: 'eid', name: 'EID THOBE', desc: 'Cream with gold embroidery and brown leather sandals.', price: 1500 },
    { id: 'luton', name: 'LUTON TOWN KIT', desc: 'Orange and navy, Hatters through and through.', price: 2000 },
    { id: 'moroccan', name: 'MOROCCAN DJELLABA', desc: 'Striped djellaba, pointed hood, yellow babouche slippers.', price: 2500 },
  ],
};
let shopTab = 'util';
const shopBankSave = () => { try { localStorage.setItem('jd_bank', bank); } catch (e) {} };
function iconFor(cv, tab, it) {
  const c = cv.getContext('2d'), S = cv.width = cv.height = 116; c.clearRect(0, 0, S, S); c.save(); c.scale(2, 2); c.lineJoin = 'round';
  const O = '#1a1024', rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
  if (tab === 'outfit') { const im = heroImgs[it.id]; const f = FR('run1_normal'); if (im.complete) { c.imageSmoothingEnabled = true; c.drawImage(im, f * HW * HX4, 0, HW * HX4, HH0 * HX4, 5, 4, 48, 58); } else im.onload = () => iconFor(cv, tab, it); }
  else if (it.id === 'hs500' || it.id === 'hs1000') { drawCorolla(c, 29, 40, .34, true); c.font = '9px PS'; c.textAlign = 'center'; c.fillStyle = O; c.fillText(it.id === 'hs500' ? '500' : '1000', 30, 54); c.fillStyle = '#ffd75a'; c.fillText(it.id === 'hs500' ? '500' : '1000', 29, 53); }
  else if (it.id === 'save') { c.translate(29, 30); c.rotate(-.15); c.fillStyle = '#0f3d26'; rr(-17, -12, 34, 24, 4); c.fill(); c.fillStyle = '#1f8a4c'; rr(-15.5, -10.5, 31, 21, 3); c.fill(); c.fillStyle = '#25a35a'; c.beginPath(); c.moveTo(-15.5, -10.5); c.lineTo(0, 3); c.lineTo(15.5, -10.5); c.fill(); c.fillStyle = '#ffd75a'; c.beginPath(); c.arc(0, 2, 5, 0, 7); c.fill(); c.fillStyle = '#1f8a4c'; c.beginPath(); c.arc(2, 1, 4, 0, 7); c.fill(); c.fillStyle = '#ff5a6a'; c.font = '12px PS'; c.fillText('+', 10, -9); }
  else if (it.id === 'slot') { c.strokeStyle = '#ffd75a'; c.setLineDash([4, 3]); c.lineWidth = 2; rr(13, 13, 32, 32, 7); c.stroke(); c.setLineDash([]); c.fillStyle = '#ffd75a'; c.fillRect(26, 20, 6, 18); c.fillRect(20, 26, 18, 6); }
  else if (it.id === 'tin') { c.fillStyle = O; rr(14, 12, 30, 38, 5); c.fill(); const gr = c.createLinearGradient(15, 0, 43, 0); gr.addColorStop(0, '#9e1a24'); gr.addColorStop(.4, '#e0303c'); gr.addColorStop(1, '#8a1420'); c.fillStyle = gr; rr(16, 14, 26, 34, 4); c.fill(); c.fillStyle = '#c9cdd5'; c.fillRect(16, 14, 26, 5); c.fillStyle = O; c.fillRect(23, 15.5, 12, 2); c.fillStyle = '#fff'; c.beginPath(); c.arc(29, 32, 6, 0, 7); c.fill(); c.fillStyle = '#e0303c'; c.beginPath(); c.arc(31, 31, 5, 0, 7); c.fill(); c.fillStyle = '#ffd75a'; c.beginPath(); c.arc(29, 8, 5, 0, 7); c.fill(); c.fillStyle = '#b8860b'; c.font = '7px PS'; c.textAlign = 'center'; c.fillText('£', 29, 11); }
  else if (it.id === 'chappal') { c.translate(29, 30); c.rotate(-.5); c.fillStyle = O; c.beginPath(); c.ellipse(0, 0, 11, 23, 0, 0, 7); c.fill(); c.fillStyle = '#8a5428'; c.beginPath(); c.ellipse(0, 0, 9, 21, 0, 0, 7); c.fill(); c.fillStyle = '#b97a3e'; c.beginPath(); c.ellipse(0, -2, 6.5, 17, 0, 0, 7); c.fill(); c.strokeStyle = '#5a3416'; c.lineWidth = 4; c.beginPath(); c.moveTo(-9, -6); c.quadraticCurveTo(0, -14, 9, -6); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.2; [-28, -16].forEach(a => { c.beginPath(); c.moveTo(14, a + 20); c.lineTo(22, a + 14); c.stroke(); }); }
  else if (it.id === 'dates') { c.fillStyle = '#e9e1cf'; c.beginPath(); c.ellipse(29, 42, 22, 6, 0, 0, 7); c.fill(); [[19, 34], [29, 32], [39, 34], [24, 25], [34, 25], [29, 18]].forEach(([x, y]) => { c.fillStyle = O; c.beginPath(); c.ellipse(x, y, 6.5, 9, .3, 0, 7); c.fill(); c.fillStyle = '#7a3a12'; c.beginPath(); c.ellipse(x, y, 5, 7.5, .3, 0, 7); c.fill(); c.fillStyle = 'rgba(255,200,140,.5)'; c.beginPath(); c.ellipse(x - 1.5, y - 2.5, 1.5, 3, .3, 0, 7); c.fill(); }); }
  else if (it.id === 'envelope') { [[-6, 6, '#16703c'], [0, 0, '#1f8a4c'], [6, -6, '#25a35a']].forEach(([dx, dy, col]) => { c.fillStyle = '#0f3d26'; rr(13 + dx, 18 + dy, 30, 21, 3); c.fill(); c.fillStyle = col; rr(14.5 + dx, 19.5 + dy, 27, 18, 2); c.fill(); c.fillStyle = '#ffd75a'; c.beginPath(); c.arc(28 + dx, 30 + dy, 3, 0, 7); c.fill(); }); }
  else if (it.id === 'misbaha') { c.lineWidth = 1; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x = 29 + Math.cos(a) * 17, y = 26 + Math.sin(a) * 15; c.fillStyle = O; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.fillStyle = i % 8 === 0 ? '#fff3b0' : '#e8b830'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
    c.fillStyle = '#e8b830'; c.fillRect(27, 41, 4, 9); c.fillStyle = '#c8901c'; c.beginPath(); c.moveTo(24, 50); c.lineTo(34, 50); c.lineTo(29, 56); c.fill(); }
  c.restore();
}
function owned(tab, it) { return tab === 'outfit' ? !!SHOP.own[it.id] || it.price === 0 : tab === 'gadget' ? !!SHOP.own[it.id] : it.id === 'slot' ? SHOP.slots >= 3 : false; }
function renderShop() {
  $('shBank').textContent = bank.toLocaleString('en-GB');
  document.querySelectorAll('.shopTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === shopTab));
  $('slotInfo').innerHTML = shopTab === 'gadget' ? `Gadgets on:<br><b style="color:#ffd75a">${SHOP.eq.length} / ${SHOP.slots}</b>` : shopTab === 'util' ? `Head starts: ${SHOP.hs500 + SHOP.hs1000}<br>Second chances: ${SHOP.save}` : '';
  const L = $('shopList'); L.innerHTML = '';
  ITEMS[shopTab].forEach((it, i) => {
    const row = document.createElement('div'); row.className = 'item'; row.style.animationDelay = i * .04 + 's';
    const own = owned(shopTab, it), on = shopTab === 'gadget' ? hasG(it.id) : shopTab === 'outfit' ? SHOP.outfit === it.id : false; if (on) row.classList.add('on');
    const cnt = it.use ? `<span class="own">You have ${SHOP[it.id] || 0}</span>` : '';
    let btn, cls = '';
    if (it.use) btn = '£' + it.price.toLocaleString('en-GB');
    else if (!own) btn = '£' + it.price.toLocaleString('en-GB');
    else if (it.id === 'slot') { btn = 'OWNED'; cls = 'eq'; }
    else if (on) { btn = shopTab === 'outfit' ? 'WEARING' : 'EQUIPPED'; cls = 'on'; }
    else { btn = shopTab === 'outfit' ? 'WEAR' : 'EQUIP'; cls = 'eq'; }
    if ((it.use || !own) && bank < it.price) cls = 'no';
    row.innerHTML = `<canvas></canvas><div class="it"><b>${it.name}${cnt}</b><span>${it.desc}</span></div><button class="buy ${cls}">${btn}</button>`;
    iconFor(row.querySelector('canvas'), shopTab, it);
    row.querySelector('.buy').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); shopAction(shopTab, it, row); });
    L.appendChild(row);
  });
}
function shopAction(tab, it, row) {
  const own = owned(tab, it);
  if (it.use || !own) {
    if (bank < it.price) { row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); tone(150, .15, 'square', .05); toast(`You need £${(it.price - bank).toLocaleString('en-GB')} more`); return; }
    bank -= it.price; shopBankSave(); MS.prog.bought = (MS.prog.bought || 0) + 1; saveMS();
    if (it.use) SHOP[it.id] = (SHOP[it.id] || 0) + 1; else if (it.id === 'slot') SHOP.slots = 3; else SHOP.own[it.id] = 1;
    tone(880, .08, 'square', .05); setTimeout(() => tone(1318, .14, 'square', .05), 80);
    if (!it.use && tab === 'gadget' && SHOP.eq.length < SHOP.slots) SHOP.eq.push(it.id);
    if (!it.use && tab === 'outfit') SHOP.outfit = it.id;
  } else if (tab === 'gadget') {
    if (hasG(it.id)) SHOP.eq = SHOP.eq.filter(x => x !== it.id);
    else { if (SHOP.eq.length >= SHOP.slots) SHOP.eq.shift(); SHOP.eq.push(it.id); }
    tone(660, .06, 'square', .04);
  } else if (tab === 'outfit') { SHOP.outfit = it.id; tone(660, .06, 'square', .04); }
  heroImg = heroImgs[SHOP.outfit] || heroImgs.classic; saveShop(); renderShop(); refreshHome();
}
function openShop(tab) { shopTab = tab || 'util'; renderShop(); $('shop').classList.remove('hide'); }
document.querySelectorAll('.shopTabs button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); shopTab = b.dataset.tab; tone(520, .04, 'square', .03); renderShop(); }));
tap('bShop', () => openShop('util')); tap('bOutfit', () => openShop('outfit')); tap('shopClose', () => $('shop').classList.add('hide'));
$('shop').addEventListener('pointerdown', e => e.stopPropagation());
tap('hs5', () => startBoost(500)); tap('hs10', () => startBoost(1000));
tap('smGo', () => { clearInterval(saveMe.iv); SHOP.save--; saveShop(); usedSave = 1; $('saveMe').classList.add('hide'); revive(true); toast('SECOND CHANCE!'); });
tap('smNo', () => { clearInterval(saveMe.iv); $('saveMe').classList.add('hide'); usedSave = 1; if (eidi > 0) openEidi(); else showOver(); });
if (/[?&]rich=1/.test(location.search)) { bank = Math.max(bank, 99999); shopBankSave(); }   // owner testing: fill the bank

/* Get the app: Android/Chrome install prompt, iPhone steps; hidden once it's installed */
let instEvt = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); instEvt = e; });
const isApp = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
if (isApp) $('bInst').style.display = 'none';
tap('bInst', () => {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  $('instGo').style.display = instEvt ? '' : 'none';
  $('instSteps').innerHTML = instEvt ? '<li>Tap <b>INSTALL</b> below</li><li>Jummah Dash goes on your Home Screen</li>'
    : ios ? '<li>Open this page in <b>Safari</b></li><li>Tap the <b>Share</b> button (square with an arrow)</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b></li>'
    : '<li>Tap the <b>⋮</b> menu in your browser</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b></li>';
  $('inst').classList.remove('hide');
});
tap('instGo', async () => { if (!instEvt) return; instEvt.prompt(); const r = await instEvt.userChoice; instEvt = null; if (r.outcome === 'accepted') { $('inst').classList.add('hide'); $('bInst').style.display = 'none'; } });
tap('instClose', () => $('inst').classList.add('hide'));
/* keep the game on the phone (service worker); a new version takes over next time the home screen is showing */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  let had = !!navigator.serviceWorker.controller, want = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!had) { had = true; return; } want = true; });
  setInterval(() => { if (want && state === 'menu' && $('home') && !$('home').classList.contains('hide')) location.reload(); }, 1000);
}
tap('bMis', () => { $('misRank').innerHTML = rankHtml(); missionRows($('misRows')); $('mis').classList.remove('hide'); }); tap('misClose', () => $('mis').classList.add('hide')); tap('howClose', () => $('how').classList.add('hide'));
tap('bShare', () => share('Late for Jummah? Play Jummah Dash – an SMR Original 🕌💨'));
tap('again', start); tap('ovHome', goHome);
tap('eidiGo', () => { if ($('eidiGo').dataset.life) revive(); else { $('eidiBox').classList.add('hide'); eidi = 0; showOver(); } });
tap('ovShare', () => share(`I flew ${Math.floor(dist / 10)}m and grabbed £${coins} trying to get to Jummah 😂 Beat that on Jummah Dash:`));
tap('snd', () => { sndOn = !sndOn; $('snd').textContent = sndOn ? '🔊' : '🔇'; if (!sndOn && hissG) hissG.gain.value = 0; });
const noHold = el => el && el.closest && el.closest('.btn,#home,.sheet,#over,#eidiBox');
window.addEventListener('pointerdown', e => { if (noHold(e.target)) return; holding = true; audio(); });
window.addEventListener('touchstart', e => { if (noHold(e.target)) return; e.preventDefault(); holding = true; audio(); }, { passive: false });
window.addEventListener('touchend', e => { if (!e.touches.length) holding = false; }); window.addEventListener('touchcancel', () => holding = false);
window.addEventListener('pointerup', () => holding = false); window.addEventListener('pointercancel', () => holding = false);
window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (state === 'menu') start(); else if (state === 'dead' && !$('over').classList.contains('hide')) start(); else holding = true; } });
window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') holding = false; });
document.addEventListener('gesturestart', e => e.preventDefault());
window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => setTimeout(resize, 200));
// home screen: smoky steam pouring out of the two cooker nozzles. The canvas sits ON TOP of the art, and the art (minus the two dark
// nozzle openings) is cut back out of it every frame, so the steam shows inside the openings, disappears behind the front lip,
// then reappears below it: it looks like it comes from inside the holes, and it still passes behind the cooker, thobe and legs.
(() => {
  const sc = $('steamCv'), wrap = $('heroWrap'), o = sc.getContext('2d'), occ = img('art/hero_occ.png?h=893c2284b9');
  const NZ = [[.1708, .6063], [.3124, .6278]], AX = [-.24, .97];
  const mk = (inner, outer) => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, inner); r.addColorStop(.62, inner.replace(/[\d.]+\)$/, '0.9)')); r.addColorStop(.82, inner.replace(/[\d.]+\)$/, '0.35)')); r.addColorStop(1, outer); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; };
  const SHADE = mk('rgba(150,152,170,1)', 'rgba(150,152,170,0)'), LIGHT = mk('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), CORE = mk('rgba(244,244,250,1)', 'rgba(240,240,248,0)');
  let P = [], lastT = performance.now(), acc = 0;
  function step(now) {
    requestAnimationFrame(step);
    if (state !== 'menu' || document.hidden) { P.length = 0; lastT = now; return; }
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    const ww = wrap.clientWidth, wh = wrap.clientHeight; if (!ww) return;
    const pr = Math.min(2, window.devicePixelRatio || 1), cw = Math.round(ww * 1.8 * pr), ch = Math.round(wh * 1.4 * pr);
    if (sc.width !== cw || sc.height !== ch) { sc.width = cw; sc.height = ch; }
    const k = ww / 300, ax = .8 * ww;                                     // art sits .8 of its width into the canvas
    acc += dt * 120;
    while (acc > 1) { acc--; for (const [fx, fy] of NZ) {
      const x = ax + fx * ww, y = fy * wh, sp = (95 + Math.random() * 70) * k, j = (Math.random() - .5) * 12 * k;
      P.push({ x: x + j * .97, y: y + j * .24 - AX[1] * 2 * k, vx: AX[0] * sp + (Math.random() - .5) * 14 * k, vy: AX[1] * sp, r: (1.6 + Math.random() * 1.8) * k, g: (9 + Math.random() * 11) * k, l: 0, L: .9 + Math.random() * .8, s: Math.random() * 6.3 });
    } }
    o.setTransform(pr, 0, 0, pr, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, cw, ch);
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.l += dt; if (p.l > p.L) { P.splice(i, 1); continue; }
      const drag = Math.pow(.16, dt); p.vx = p.vx * drag - 55 * k * dt; p.vy = p.vy * drag + 6 * k * dt;
      p.vx += Math.sin(p.l * 5 + p.s) * 22 * k * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.g * dt; }
    for (const [im2, dx, dy, aMul, rMul] of [[SHADE, .2, .24, .85, 1.08], [LIGHT, -.14, -.16, .95, .86], [CORE, -.05, -.06, .9, .5]]) {
      for (const p of P) { const t2 = p.l / p.L, a = (t2 < .05 ? t2 / .05 : 1 - (t2 - .05) / .95) * aMul * (im2 === CORE ? Math.max(0, 1 - t2 * 2.2) : 1); if (a <= .01) continue;
        const r = p.r * rMul; o.globalAlpha = a; o.drawImage(im2, p.x + dx * r - r, p.y + dy * r - r, r * 2, r * 2); } }
    o.globalAlpha = 1;
    if (occ.complete && occ.naturalWidth) { o.globalCompositeOperation = 'destination-out'; o.drawImage(occ, ax, 0, ww, wh); o.globalCompositeOperation = 'source-over'; }
  }
  requestAnimationFrame(step);
})();

resize(); seedStars(); reset(); refreshHome(); if (myMosque) setTimeout(refreshHome, 300);
let last = performance.now();
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); draw(); if (bakeQ.length) bakeOne(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
window.__jd = { veh: k => startVehicle(k), laser: () => [CEIL + 40, (CEIL + FLOOR) / 2].forEach((y, i) => obs.push({ type: 'laser', x: W / 2, y, ph: 'in', pt: 0, slide: 0, d: i * .12 })), eidi: n => { eidi = n; }, kill: w => die(w), gift: k => gifts.push({ k, x: W * .6, y: 200, b: 0 }), get state() { return state; }, start, hero, get obs() { return obs; }, spawnRocket: () => obs.push({ type: "rocket", x: W + 40, y: hero.y - 30, warn: 1.5, lock: 0, v: 0 }), setHold: v => holding = v, get dist() { return dist; }, mis: (s, c) => { RUN.steamed = s; coins = c; }, get npcs() { return npcs; }, boost: m => startBoost(m), get SHOP() { return SHOP; }, bc: (k, kd) => buildingCanvas(kd || "lm", k), carSprite: (k, ci, f) => carSprite(k, ci, f), queue: k => deck.unshift([k]), street: () => street, npc: x => spawnNpc(x), car: (x, k, l) => spawnCar(x, k, false, l), get STREET() { return STREET; } };
})();
