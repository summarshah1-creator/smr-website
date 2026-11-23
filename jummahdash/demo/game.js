/* Jummah Dash — demo v0.1 (an SMR Original). Landscape side-scroller: hold to fly with the pressure-cooker jetpack.
   World units: the screen is 320 units tall; buildings/cars come from the Flappy Kabootar drawing code, rendered natively
   at the screen's real resolution (so they're sharper than Flappy). The hero + people are pixel sprites. */
(() => {
'use strict';
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const MOSQUES = [['masjid', 'Luton Central Mosque'], ['masjidali', 'Masjid-e-Ali'], ['suffa', 'Suffa-Tul-Islam']];
const MOSQUE_K = MOSQUES.map(m => m[0]);
const MECHDEMO = /[?&]mechdemo=1/.test(location.search) || window.__MECHDEMO;   // Hoover Mech demo: every gift box is the mech, the first one comes straight away
const RIDEDEMO = /[?&]ridedemo=1/.test(location.search) || window.__RIDEDEMO;   // owner 23 Nov: power-up demo: boxes come often, every ride except Flappy Kabootar in turn, never the same twice running
let rdBag = [], rdLast = '';
function rideDemoNext() { if (!rdBag.length) { rdBag = RIDES.filter(k => k !== 'kabootar').sort(() => Math.random() - .5); if (rdBag[0] === rdLast) rdBag.push(rdBag.shift()); } return rdLast = rdBag.shift(); }
const FKDEMO = !MECHDEMO && /[?&]fkdemo=1/.test(location.search);   // Flappy Kabootar mode demo: the gift box is always the pigeon
let myMosque = (() => { try { return localStorage.getItem('jd_mosque') || 'masjid'; } catch (e) { return 'masjid'; } })();   // owner 23 Nov: Luton Central Mosque by default, no first-time picker (change it in Settings)
let bank = +(localStorage.getItem('jd_bank') || 0), passed = 0;
const VH = 400;                       // world height in units
const G = 300;                        // building ground line
const ROAD_T = 309, ROAD_B = 352;     // road
const PAVE_T = 358;                   // front pavement top
const FLOOR = 390;                    // hero feet when running
const CEIL = 3;                       // invisible ceiling: his head can go right up to the top of the screen (like Barry)
const HW = 48, HH0 = 58, HS = 1.06, HH = HH0 * HS;   // hero sprite cell + its on-screen scale (owner 22 Nov: whole hero ≈ the height of Barry's jetpack in Jetpack Joyride, ~12% of the screen)
const HSR = 1.5, HHR = HH0 * HSR;   // size he's drawn at inside the rides (tuk-tuk, carpet, pigeon, Corolla roof), which kept their size
const NPCK = .733;   // owner 22 Nov: walkers ≈ JJ's scientists, ~9.5% of the screen
const BS = .8;                        // buildings drawn a bit smaller so there's more sky to fly in
let GFX = (() => { try { return localStorage.getItem('jd_gfx') || 'hd'; } catch (e) { return 'hd'; } })();
let S = 1, W = 600, dpr = 1, KR = 2;  // units->px, screen width in units, render scale for buildings

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, GFX === 'lo' ? 1.2 : 1.75);   // Settings → Graphics: SMOOTH draws less sharp for older phones
  // always landscape: if the phone is upright, turn the whole stage 90° (the player just turns the phone)
  const st = $('stage'), port = innerHeight > innerWidth, sw = port ? innerHeight : innerWidth, sh2 = port ? innerWidth : innerHeight;
  st.style.width = sw + 'px'; st.style.height = sh2 + 'px'; st.style.transform = port ? `translateX(${innerWidth}px) rotate(90deg)` : 'none';
  // keep the menu and HUD clear of the notch / Dynamic Island: on an upright phone the island ends up on the left of the turned stage
  // owner 22 Nov: same safe margin on BOTH sides (whichever way round the phone is, the Dynamic Island side never gets buttons)
  const safe = port ? 'max(44px, env(safe-area-inset-top))' : 'max(env(safe-area-inset-left), env(safe-area-inset-right))';
  st.style.setProperty('--sl', safe); st.style.setProperty('--sr', safe);
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
const heroImgs = {}; OUTFIT_KEYS.forEach(k => heroImgs[k] = img(k === 'classic' ? 'art/hero3.webp?h=3043153507' : 'art/hero3_' + k + '.webp?h=' + ({"eid": "a7e90643c1", "luton": "2065c9a3d3", "puffer": "d4fdc4d8de", "moroccan": "68919091f1"})[k]));
const sandImgs = {}; OUTFIT_KEYS.forEach(k => sandImgs[k] = img('art/hero3s_' + k + '.webp?v=1'));   // owner 23 Nov: same frames with thin brown shoes + glowing green soles (run0-5, glide0)
let heroImg = heroImgs[SHOP.outfit] || heroImgs.classic; const HX4 = 6;   // sheet = 6 px per cell unit (smooth cartoon hero, hd/hero_rig.js)
const hasG = id => SHOP.eq.includes(id);   // hero redrawn at 3x the pixels (smooth curves, finer detail)
const HERO_FR = ['run0_normal', 'run1_normal', 'run2_normal', 'run3_normal', 'run4_normal', 'run5_normal', 'fly0_effort', 'fly1_effort', 'fly2_effort', 'fly0_panic', 'fly1_panic', 'fly2_panic', 'glide0_normal', 'glide1_normal', 'land0_effort', 'glide0_ko', 'run0_happy', 'run0_blink', 'hang0_happy', 'hang1_happy', 'hang2_happy', 'hang3_happy', 'fall0_panic', 'fall1_panic', 'fall2_panic', 'fall0_ko', 'sit0_happy', 'sit1_happy'];
const FR = n => HERO_FR.indexOf(n);
let NPC_META = {};   // filled from art/npc.json (hd/build_npc_v3.py)
let NPC_KEYS = [], ESC_KEYS = [], CHAIR_KEYS = [], NPC_W = 0;
const NPC_H = {"pc_m": "3558e2cda4", "pc_f": "d3ca09098e", "pcso": "97082a3efa", "warden": "3111be9fb0", "fan_dad": "685ba5be8c", "fan_f": "bd2f3ff5bf", "fan_kid": "ce309ba878", "blonde": "bdc4a1a155", "abaya": "3f5693513d", "teen": "e0cc4f3780", "aunty": "e6aa4be39c", "uncle": "b8076a8d1d", "nurse": "8d7181607e", "elder": "f06b987256", "builder": "e66dda48a2", "rider": "76f9a2c0ff", "rider_g": "705462ce67", "rider_o": "904b220e1a", "schoolboy": "fd1a660784", "shop": "400b7208b0", "lad": "5427630c3b", "postie": "01e27b9c50", "sehri": "f463041407", "v_woman_0": "5174f35921", "v_woman_1": "160b83ea5e", "v_woman_2": "8ef4b19768", "v_woman_3": "7a35813ecb", "v_woman_4": "16ee36be5c", "v_woman_5": "83d4fb0181", "v_woman_6": "407c80ecfb", "v_woman_7": "5987da499e", "v_hijabi_0": "763c4231c8", "v_hijabi_1": "a50539b123", "v_hijabi_2": "cbdbcd5e34", "v_hijabi_3": "727ada3a77", "v_hijabi_4": "c690619a5b", "v_hijabi_5": "93c9cb65db", "v_hijabi_6": "16ff68d51b", "v_hijabi_7": "ee08c0e916", "v_aunty_0": "e6aa4be39c", "v_aunty_1": "30e65c18fe", "v_aunty_2": "17dbb70caa", "v_aunty_3": "d36c2caf13", "v_aunty_4": "8a78cc31b6", "v_aunty_5": "784a64fe7d", "v_man_0": "82ab48d725", "v_man_1": "ff5f9fdf62", "v_man_2": "88b0f2215e", "v_man_3": "6640292e19", "v_man_4": "ba3268830d", "v_man_5": "1d56a6a4cd", "v_man_6": "81bc514887", "v_man_7": "8d80a093c2", "v_student_0": "9b4d21a6c7", "v_student_1": "60ebba8183", "v_student_2": "05c32aba56", "v_student_3": "8cc9c764ab", "v_student_4": "750a752d5a", "v_student_5": "1b65ef83b6", "v_student_6": "0caeb47d16", "v_student_7": "6bf4f6fcb9", "v_student_8": "aa9dd5c10a", "v_student_9": "2c85c26c46", "v_police_0": "255816cb35", "v_police_1": "6bfb092797", "v_police_2": "af49ff93a0", "v_police_3": "50ea5153f0", "v_police_4": "6bfb092797", "v_police_5": "af49ff93a0", "v_nurse_0": "58010a757c", "v_nurse_1": "bacb097ccf", "v_nurse_2": "cd26ce8066", "v_nurse_3": "1f332206f9", "v_nurse_4": "58010a757c", "v_builder_0": "ef6c0e90e0", "v_builder_1": "71794ba105", "v_builder_2": "1d512e945c", "v_builder_3": "a148dc5162", "v_builder_4": "0305b4ca00", "v_fan_0": "d3a10a47a2", "v_fan_1": "cc020b4723", "v_fan_2": "87c66ce327", "v_fan_3": "0531fe318e", "v_fan_4": "43009cf915", "chair_0": "50f7860105", "chair_1": "aa1323b9dc", "chair_2": "59380dcac0", "chair_3": "1d3aebd3d0", "chair_4": "99bd61c919", "chair_5": "a19d80c6e7", "chair_6": "7cbeb253a5", "chair_7": "91b79ad117", "v_fandad_0": "4ec464e923", "v_fandad_1": "754eb33e55", "v_fandad_2": "d3b2b24118", "v_fandad_3": "18746e07df", "eesc_a": "e907355984", "eesc_b": "576b803538", "eesc_c": "8155bd2a06", "mobility": "4f2caa3907"}; const npcImg = {};
const npcGet = k => npcImg[k] || (npcImg[k] = img('art/npc_' + k + '.webp?h=' + (NPC_H[k] || 1)));   // loaded the first time someone of that kind walks on
fetch('art/npc.json?h=cb2784f590').then(r => r.json()).then(m => { NPC_META = m; const K = Object.keys(m);
  NPC_KEYS = K.filter(k => m[k].type === 'walk'); ESC_KEYS = K.filter(k => m[k].type === 'esc' && k[0] === 'e'); CHAIR_KEYS = K.filter(k => k.startsWith('chair_'));
  NPC_W = NPC_KEYS.reduce((a, k) => a + (m[k].wt || 1), 0); NPC_KEYS.slice(0, 12).forEach(npcGet); ESC_KEYS.forEach(npcGet); npcGet('mobility'); }).catch(() => {});

/* buildings: Flappy landmarks + house runs, drawn at KR px per unit, trimmed, cached (LRU) */
const M = 90, LH = 440;
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
// realistic building sizes for Jummah Dash (owner, 22 Nov): real heights (planning docs, listings, typical UK figures; project doc
// claude/jummah-dash-building-scale.md). One scale for everything up to 12 m (19.9 units a metre: a 9 m house = 179) so doors, shop fronts
// and storeys match from building to building; taller buildings ease in towards the top of the screen (Town Hall tower / Marsh Farm 44 m = 353).
// The food trailers keep their size (owner). Multipliers on top of Flappy's own sizes.
const JK = {"masjid":0.926,"marshfarm":1.3356,"nadeem":0.88,"hatfactory":0.932,"vauxhall":1.055,"townhall":1.282,"gurdwara":0.949,"ldh":1.267,"lutonhoo":1.269,"frasers":1.03,"matalan":0.851,"masjidali":0.94,"tesco":1.085,"bandq":1.09,"stmarys":1.395,"uob":1.325,"jdgyms":0.9,"currys":0.971,"smr":0.938,"inspire":0.821,"galaxy":1.588,"lewsey":1.01,"funfair":1.526,"airport":1.465,"gna":1.2134,"cycleking":1.0153,"kahwa":1.2134,"chaiiwala":0.92,"toros":1.2134,"chiltern":1.17,"sixthform":1.404,"alquds":1.2134,"leagrave":1.091,"topspizza":1.2134,"lidl":0.91,"orbital":1.455,"bigyellow":1.822,"venue":1.335,"oak":1.2134,"grandbazar":1.226,"station":1.391,"periperi":1.113,"suffa":1.366,"miamicrispy":1.01,"foodbank":1.165,"wardownbridge":0.815,"karwan":1.372,"kaya":1.232,"krispy":1.2134,"barak":1.256,"murganos":1.2134}, JKH = {"semi":1.17,"terrace":1.17,"rowGrey":1.17,"rowYellow":1.17,"rowBrown":1.17,"rowRed":1.17,"rowPainted":1.17,"pairRed":1.17,"pebble":1.17,"render":1.17,"newbuild":1.17,"bungalow":1.17};
// owner 22 Nov (later): every building scaled up together so the Town Hall tower (finial removed) stops a finial's height
// below the top of the screen; Marsh Farm towers may go off the top. Marsh Farm 30% wider (WX).
const BSC = 1.108, WX = { marshfarm: 1.3 };
if (LANDMARKS.marshfarm && !LANDMARKS.marshfarm._wx) { LANDMARKS.marshfarm.w = Math.round(LANDMARKS.marshfarm.w * WX.marshfarm); LANDMARKS.marshfarm._wx = 1; }
const jkL = k => (JK[k] || 1) * BSC, jkH = k => (JKH[k] || 1) * BSC;
const jkOf = b => b.kind === 'lm' ? jkL(b.key) : jkH(b.key);
let KB = 2;
if (document.fonts) Promise.all(['700 10px Mont', '600 10px Oswald', '700 10px Amiri'].map(f => document.fonts.load(f)).concat(window.HD_READY || [])).then(() => { bCache.clear(); hazeCache.clear(); });   // redraw buildings once the sign fonts are in   // building px per unit = exactly the on-screen size (S * BS)
function buildingCanvas(kind, key, bakeAnim) {
  const id = kind + ':' + key + (bakeAnim ? ':a' : ''); if (bCache.has(id)) { const v = bCache.get(id); bCache.delete(id); bCache.set(id, v); return v; }
  let w, draw;
  const jk = kind === 'lm' ? jkL(key) : jkH(key);
  if (kind === 'lm') { const L = LANDMARKS[key]; if (!L) return null; w = Math.round(L.w * jk); const H2 = window.LANDMARKS_HD && LANDMARKS_HD[key];
    draw = H2 ? (o => { const f = (window.SCALE && SCALE[key]) || 1; o.save(); o.translate(M, LH - 6); o.scale(f, f); H2(o, 0, 0); o.restore(); }) : (o => L.d(o, M, LH - 6)); }
  else { const Hh = HOUSES[key]; if (!Hh) return null; w = Math.round(Hh.w * 1.35 * jk); const HH = window.HOUSES_HD && HOUSES_HD[key]; draw = o => window.drawScaled(o, HH || Hh.d.bind(Hh), M, LH - 6, 1.35); }
  const N = Math.min(4, Math.ceil(KB + .2));   // drawn natively just above screen size: vector curves, lettering and the sharp sign redraws at full detail, blocks on exact pixels
  const c = document.createElement('canvas'); c.width = (w + 2 * M) * N; c.height = LH * N;
  const o = c.getContext('2d', { willReadFrequently: true }); o.imageSmoothingEnabled = false; o.scale(N, N);
  if (jk !== 1) { o.translate(M, LH - 6); o.scale(jk, jk); o.translate(-M, -(LH - 6)); }
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
const CAR_KEYS = ['jazz', 'yaris', 'polo', 'fiesta', 'focus', 'zafira', 'avensis', 'x6', 'x7', 'prius', 'prius2', 'taxi2', 'sclass', 'rolls', 'golfr', 'v60', 'xc40', 'corsa', 'fiat500', 'sportage', 'gt3', 'f812', 'lambo', 'astra', 'golf', 'bmw1', 'a3', 'a45', 'bmw3', 'c63s', 'c63', 'tesla', 'qashqai', 'rangerover', 'gwagon', 'urus', 'taxi', 'bigvan', 'postvan', 'smallvan', 'police', 'policevan', 'tractor', 'artic', 'binlorry', 'ambulance', 'fire', 'bus', 'dd', 'coach', 'moped_b', 'moped_g', 'moped_o', 'motorbike', 'cycle_0', 'cycle_1', 'cycle_2', 'cycle_3', 'cycle_4'];
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
function carSprite(k, ci, flip, fr = 0) {
  const id = k + ci + flip + '@' + KR + '#' + fr; if (carCache.has(id)) return carCache.get(id);
  const V = VEHICLES[k]; const col = V.colours[ci % V.colours.length]; const SC = 1.6, k2 = KR * SC;
  const c = document.createElement('canvas'); c.width = Math.ceil((V.w + 6) * k2); c.height = Math.ceil(90 * k2); const o = c.getContext('2d');
  o.scale(k2, k2); window.__WREC = []; window.__RF = fr; try { V.d(V.v3 ? o : hdCtx(o, col[1], 86 - (V.h || 24), 86), 3, 86, col); } catch (e) {} const wr = window.__WREC; window.__WREC = null;
  // specular sweep across the bodywork
  o.setTransform(1, 0, 0, 1, 0, 0); if (!(wr || []).some(w => w.under)) { o.globalCompositeOperation = 'source-atop'; const sg = o.createLinearGradient(c.width * .2, 0, c.width * .55, c.height); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.48, 'rgba(255,255,255,.1)'); sg.addColorStop(.52, 'rgba(255,255,255,0)'); o.fillStyle = sg; o.fillRect(0, 0, c.width, c.height); o.globalCompositeOperation = 'source-over'; }
  let out = c;
  if (flip) { const f = document.createElement('canvas'); f.width = c.width; f.height = c.height; const g = f.getContext('2d'); g.translate(f.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
    if (V.fixMirror) { g.scale(k2, k2); try { V.fixMirror(hdCtx(g, col[1], 86 - (V.h || 24), 86), 3, 86, f.width / k2); } catch (e) {} } out = f; }
  const wh = (wr || []).map(w => ({ x: (flip ? c.width - w.x : w.x) / KR, y: w.y / KR, r: w.r / KR, rim: w.rim, spokes: w.spokes || 5, wi: w.wi, well: w.well, cal: w.cal, cf: w.cf, fl: flip ? 1 : 0 }));
  const under = (wr || []).some(w => w.under);
  let lt = null; if (V.lights) { const Lr = V.lights(), W2 = c.width / KR, m = q => ({ x: flip ? W2 - q.x * SC : q.x * SC, y: q.y * SC, t: q.t }); lt = { bl: Lr.bl.map(m), hl: Lr.hl.map(m) }; }
  const v = { c: out, w: (V.w + 6) * SC, h: 90 * SC, gy: 86 * SC, sp: V.speed, wh, under, lt };
  carCache.set(id, v); if (carCache.size > 140) carCache.delete(carCache.keys().next().value); return v;
}
function drawTrafficCar(c) { const VV = VEHICLES[c.k], far = c.lane === 0, sp = carSprite(c.k, c.ci, far, VV.frames > 1 ? Math.floor((c.roll || 0) * .25) % VV.frames : 0), gy = (far ? ROAD_T + 19 : ROAD_B - 3) + c.yo, X = px(c.x), Y = px(gy - sp.gy), k = c.crash, K = far ? .9 : 1;   // far lane a touch smaller (further away)
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
  if (sp.under) { ctx.beginPath(); if (w.well) { ctx.arc(cx, cy, w.r * 1.16, Math.PI, 0); ctx.lineTo(cx + w.r * 1.16, cy + w.r * .2); ctx.lineTo(cx - w.r * 1.16, cy + w.r * .2); } else ctx.arc(cx, cy, w.r * .98, 0, 7); ctx.fillStyle = '#141418'; ctx.fill(); }
  const WI = window.WHEEL_IMG; if (w.wi != null && WI && WI.complete && WI.naturalWidth) {   // the owner's wheel pictures, turning
    const R = w.r * .985;
    if (w.cal) {   // brake caliper (owner 22 Nov): behind the wheel on the rear-facing side (left when the car faces right), front ones a bit bigger; doesn't turn
      const k = w.cf ? 1 : .82, a0 = w.fl ? 0 : Math.PI, sp = .42 * k; ctx.save(); ctx.translate(cx, cy);
      ctx.fillStyle = '#121216'; ctx.beginPath(); ctx.arc(0, 0, R * .8, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,122,128,.35)'; ctx.lineWidth = R * .04; ctx.beginPath(); ctx.arc(0, 0, R * .6, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, R * (.42 + .3 * k), a0 - sp, a0 + sp); ctx.arc(0, 0, R * .4, a0 + sp * .8, a0 - sp * .8, true); ctx.closePath();
      ctx.fillStyle = w.cal; ctx.fill(); ctx.lineWidth = R * .03; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, R * (.38 + .28 * k), a0 - sp * .7, a0 - sp * .1); ctx.lineWidth = R * .05; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(roll / w.r); ctx.drawImage(WI, (w.wi % 5) * 128, (w.wi / 5 | 0) * 128, 128, 128, -R, -R, R * 2, R * 2); ctx.restore(); continue; }
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
// Settings → Sound: separate volumes (owner 22 Nov). Every sound goes through one of these buses: jet (jetpack), coins, traffic (cars, convoy, sirens), fx (everything else)
let MIX = null; const VOL = (() => { const d = { jet: 100, coins: 100, traffic: 100, fx: 100, music: 45 }; try { return Object.assign(d, JSON.parse(localStorage.getItem('jd_mix') || '{}')); } catch (e) { return d; } })();
let SHAKE = (() => { try { return localStorage.getItem('jd_shake') !== '0'; } catch (e) { return true; } })();
function applyMix() { if (!MIX) return; for (const k in VOL) MIX[k].gain.value = Math.max(0, Math.min(1, VOL[k] / 100)); }
// Sound with the iPhone silent switch on (same as Flappy Kabootar): ask for 'playback' audio, and keep a silent looping
// <audio> playing so older iPhones stay in that mode. Paused when the page is hidden or the sound is off.
let keepAud = null;
function playback() { if (!sndOn) return; try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  try { if (!keepAud) { const n = 4000, b = new ArrayBuffer(44 + n), v = new DataView(b), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true); for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
      keepAud = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))); keepAud.loop = true; keepAud.setAttribute('playsinline', ''); keepAud.preload = 'auto'; }
    if (keepAud.paused) { const p = keepAud.play(); if (p && p.catch) p.catch(() => {}); } } catch (e) {} }
addEventListener('pointerdown', () => { playback(); if (AC && AC.state === 'suspended') AC.resume(); }, true);
document.addEventListener('visibilitychange', () => { if (!keepAud) return; if (document.hidden) keepAud.pause(); else playback(); });
function audio() {
  playback(); if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const n = AC.createBufferSource(); n.buffer = b; n.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = .7;
  MIX = {}; ['jet', 'coins', 'traffic', 'fx', 'music'].forEach(k => { MIX[k] = AC.createGain(); MIX[k].connect(AC.destination); }); applyMix();
  hissG = AC.createGain(); hissG.gain.value = 0; n.connect(f); f.connect(hissG); hissG.connect(MIX.jet); n.start();
  fetch('art/snd/horn.mp3?h=08c4e34100').then(r => r.arrayBuffer()).then(a => new Promise((ok, no) => AC.decodeAudioData(a, ok, no))).then(b => { HORN_BUF = b; }).catch(() => {});   // owner's real horn recording
}
let HORN_BUF = null;
function tone(freq, dur, type = 'sine', vol = .12, slide = 0, bus = null) {
  if (!AC || !sndOn) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = type; freq *= 1 + (Math.random() - .5) * .04; o.frequency.setValueAtTime(freq, t);   // every sound a touch different each time
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(bus || (MIX ? MIX.fx : AC.destination)); o.start(t); o.stop(t + dur + .02);
}
const SFX = { charge() { if (!AC || !sndOn) return; [[392, 0], [523, .15], [659, .3], [784, .45], [659, .62], [784, .74]].forEach(([f, d]) => setTimeout(() => { tone(f, .14, 'square', .035, 0, MIX && MIX.fx); tone(f * 2, .14, 'sine', .02, 0, MIX && MIX.fx); }, d * 1000)); },   // ballpark organ 'charge!'
  mutate() {   // a creaking, growling transformation
    if (!AC || !sndOn) return; const bus = MIX ? MIX.fx : AC.destination, t0 = AC.currentTime;
    const o = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(55, t0 + 1.2); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t0); lp.frequency.linearRampToValueAtTime(1400, t0 + .8); lp.frequency.linearRampToValueAtTime(300, t0 + 1.3);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.12, t0 + .2); g.gain.setValueAtTime(.12, t0 + .9); g.gain.exponentialRampToValueAtTime(.0001, t0 + 1.4); o.connect(lp); lp.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + 1.5);
    for (let i = 0; i < 7; i++) { const at = t0 + .1 + i * .13 + Math.random() * .05, c = AC.createOscillator(), cg = AC.createGain(); c.type = 'square'; c.frequency.setValueAtTime(260 + Math.random() * 200, at); c.frequency.exponentialRampToValueAtTime(90, at + .07); cg.gain.setValueAtTime(.03, at); cg.gain.exponentialRampToValueAtTime(.0001, at + .08); c.connect(cg); cg.connect(bus); c.start(at); c.stop(at + .1); }   // wood creaks
    setTimeout(() => { tone(90, .4, 'sawtooth', .09, .5, bus); tone(180, .3, 'square', .05, .6, bus); }, 720); },
  planeT() {   // owner 23 Nov: jet climbing out of the airport: deep roar rising and fading, a whine on top
    if (!AC || !sndOn) return; const t0 = AC.currentTime, D = 6.5, bus = MIX ? MIX.traffic : AC.destination;
    const n = AC.createBufferSource(), b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { last = last * .985 + (Math.random() * 2 - 1) * .15; d[i] = last; } n.buffer = b; n.loop = true;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(380, t0); lp.frequency.linearRampToValueAtTime(900, t0 + 2.5); lp.frequency.linearRampToValueAtTime(500, t0 + D);
    const g = AC.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.55, t0 + 1.6); g.gain.setValueAtTime(.55, t0 + 3); g.gain.exponentialRampToValueAtTime(.0001, t0 + D);
    n.connect(lp); lp.connect(g); g.connect(bus); n.start(t0); n.stop(t0 + D + .1);
    const o = AC.createOscillator(), og = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1900, t0); o.frequency.linearRampToValueAtTime(2600, t0 + 3); o.frequency.linearRampToValueAtTime(2200, t0 + D); og.gain.setValueAtTime(.0001, t0); og.gain.exponentialRampToValueAtTime(.012, t0 + 1.5); og.gain.exponentialRampToValueAtTime(.0001, t0 + D); o.connect(og); og.connect(bus); o.start(t0); o.stop(t0 + D + .1); },
  trainT() {   // Thameslink rolling through: rumble, wheel clacks over the joints, and a short two-tone horn
    if (!AC || !sndOn) return; const t0 = AC.currentTime, D = 4.2, bus = MIX ? MIX.traffic : AC.destination;
    const n = AC.createBufferSource(), b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { last = last * .97 + (Math.random() * 2 - 1) * .2; d[i] = last; } n.buffer = b; n.loop = true;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; const g = AC.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.4, t0 + .8); g.gain.setValueAtTime(.4, t0 + 2.8); g.gain.exponentialRampToValueAtTime(.0001, t0 + D);
    n.connect(lp); lp.connect(g); g.connect(bus); n.start(t0); n.stop(t0 + D + .1);
    for (let c = 0; c < 9; c++) for (const dd of [0, .09]) { const at = t0 + .4 + c * .4 + dd, o = AC.createOscillator(), og = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(70, at + .06); const env = Math.sin(Math.PI * (c + .5) / 9); og.gain.setValueAtTime(.09 * env, at); og.gain.exponentialRampToValueAtTime(.0001, at + .08); o.connect(og); og.connect(bus); o.start(at); o.stop(at + .1); }
    [[0, 554], [.35, 440]].forEach(([dt, f]) => { const at = t0 + .3 + dt, o = AC.createOscillator(), og = AC.createGain(), lp2 = AC.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 1800; o.type = 'sawtooth'; o.frequency.value = f; og.gain.setValueAtTime(.0001, at); og.gain.exponentialRampToValueAtTime(.03, at + .04); og.gain.setValueAtTime(.03, at + .28); og.gain.exponentialRampToValueAtTime(.0001, at + .34); o.connect(lp2); lp2.connect(og); og.connect(bus); o.start(at); o.stop(at + .4); }); },
  tukHorn() {   // owner 23 Nov: his own horn (named tukHorn: the traffic kit's car horn() used to overwrite it) recording (art/snd/horn.mp3, cut + cleaned + faded); synth air horn only until it has loaded
    if (!AC || !sndOn) return; const bus = MIX ? MIX.fx : AC.destination, t0 = AC.currentTime;
    if (HORN_BUF) { const src = AC.createBufferSource(), g = AC.createGain(); src.buffer = HORN_BUF; g.gain.value = 1; src.connect(g); g.connect(bus); src.start(t0); return; }   // only his recording, nothing mixed in
    const blast = (st, len) => { const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2600; f.Q.value = 1.2; const g = AC.createGain(); g.gain.setValueAtTime(.0001, t0 + st); g.gain.exponentialRampToValueAtTime(.07, t0 + st + .02); g.gain.setValueAtTime(.07, t0 + st + len - .05); g.gain.exponentialRampToValueAtTime(.0001, t0 + st + len); f.connect(g); g.connect(bus);
      [349, 440, 523, 351].forEach((fr, i) => { const o = AC.createOscillator(); o.type = i === 3 ? 'square' : 'sawtooth'; o.frequency.setValueAtTime(fr * .94, t0 + st); o.frequency.exponentialRampToValueAtTime(fr, t0 + st + .05); o.connect(f); o.start(t0 + st); o.stop(t0 + st + len + .02); }); };
    blast(0, .15); blast(.2, .42); tone(90, .35, 'sine', .14, .45, bus); },
  coin(m = 1) { tone(1320 * m, .09, 'square', .04, 0, MIX && MIX.coins); setTimeout(() => tone(1760 * m, .12, 'square', .036, 0, MIX && MIX.coins), 55); },   /* pitch climbs on a coin streak (owner 23 Nov) */   /* coin ping 20% quieter (owner 22 Nov) */
  zap() { tone(120, .5, 'sawtooth', .16, .5); tone(900, .25, 'square', .06, .3); }, thud() { tone(140, .25, 'triangle', .3, .4); },
  warn() { tone(880, .08, 'square', .05); },
  stomp() { tone(58, .16, 'triangle', .11, .55, MIX && MIX.fx); tone(130, .07, 'square', .035, .4, MIX && MIX.fx); setTimeout(() => tone(900 + Math.random() * 300, .03, 'square', .015, .6, MIX && MIX.fx), 20); },
  stompJump() {   // Big Stomper-style blast-off: a short thruster roar (filtered noise sweeping up) over a low boom
    if (!AC || !sndOn) return; const t0 = AC.currentTime, n = AC.createBufferSource(), L = AC.sampleRate * .35, buf = AC.createBuffer(1, L, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 1.6); n.buffer = buf;
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .8; f.frequency.setValueAtTime(700, t0); f.frequency.exponentialRampToValueAtTime(3800, t0 + .18);
    const g = AC.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.22, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + .33);
    n.connect(f); f.connect(g); g.connect(MIX ? MIX.fx : AC.destination); n.start(t0); n.stop(t0 + .36);
    tone(75, .22, 'triangle', .12, .55, MIX && MIX.fx); tone(150, .1, 'square', .04, 1.8, MIX && MIX.fx); },
  mechStart() { tone(140, .9, 'sawtooth', .05, 3.2, MIX && MIX.fx); tone(70, .5, 'square', .04, 1.5, MIX && MIX.fx); },
  clank(big) { tone(big ? 150 : 210 + Math.random() * 80, .09, 'square', big ? .1 : .07, .45, MIX && MIX.fx); tone(1400 + Math.random() * 600, .05, 'triangle', .04, .8, MIX && MIX.fx); setTimeout(() => tone(2600 + Math.random() * 500, .03, 'square', .02, 1, MIX && MIX.fx), 25); },
  mechOn() { tone(320, .35, 'sawtooth', .06, 2.6, MIX && MIX.fx); setTimeout(() => { tone(90, .45, 'square', .09, .5, MIX && MIX.fx); tone(880, .25, 'triangle', .05, 1.5, MIX && MIX.fx); }, 120); }, whoosh() { tone(500, .5, 'sawtooth', .05, .3); }, boom() { tone(90, .6, 'sawtooth', .22, .3); } };

/* traffic sounds, ported from Flappy Kabootar (engine model, siren/wail/nee-naw, horns, skids, crashes) */
Object.assign(SFX, (() => {
  const A = () => { if (!sndOn) return null; audio(); if (AC && AC.state === 'suspended') AC.resume(); return AC; };
  const tn = (f0, f1, dur, type = 'square', vol = .12, delay = 0) => { const a = A(); if (!a) return; const t0 = a.currentTime + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g).connect((MIX ? MIX.traffic : a.destination)); o.start(t0); o.stop(t0 + dur + .02); };
  const nz = (dur, f0, f1, vol = .18, delay = 0) => { const a = A(); if (!a) return; const t0 = a.currentTime + delay, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = b; const fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur); n.connect(fl).connect(g).connect((MIX ? MIX.traffic : a.destination)); n.start(t0); };
  const engine = (D, f, vol, bike) => { const a = A(); if (!a) return; const t0 = a.currentTime, N = 28, re = new Float32Array(N), im = new Float32Array(N);
    for (let h = 1; h < N; h++) im[h] = Math.pow(h, bike ? -.75 : -.9) * (h % 2 ? 1 : (bike ? .55 : .8)) * (1 + .35 * Math.sin(h * 1.7));
    const wave = a.createPeriodicWave(re, im), o = a.createOscillator(), o2 = a.createOscillator(); o.setPeriodicWave(wave); o2.setPeriodicWave(wave);
    const set = (p, k) => { p.setValueAtTime(f[0] * k, t0); p.exponentialRampToValueAtTime(f[1] * k, t0 + D * .45); p.exponentialRampToValueAtTime(f[2] * k, t0 + D); }; set(o.frequency, 1); set(o2.frequency, 1.006);
    const am = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(); am.gain.value = .65; lfo.type = 'triangle'; set(lfo.frequency, .5); lg.gain.value = .35; lfo.connect(lg); lg.connect(am.gain);
    const sh = a.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) cv[i] = Math.tanh((i / 511.5 - 1) * (bike ? 3.2 : 2.6)); sh.curve = cv;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4; lp.frequency.setValueAtTime(bike ? 1200 : 700, t0); lp.frequency.exponentialRampToValueAtTime(bike ? 4200 : 2600, t0 + D * .45); lp.frequency.exponentialRampToValueAtTime(bike ? 1400 : 650, t0 + D);
    const g = a.createGain(); g.gain.setValueAtTime(vol * .04, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + D * .45); g.gain.exponentialRampToValueAtTime(vol * .03, t0 + D); g.gain.linearRampToValueAtTime(0, t0 + D + .04);
    const og = a.createGain(); og.gain.value = .5; o.connect(og); o2.connect(og); og.connect(am); am.connect(sh); sh.connect(lp); lp.connect(g); g.connect((MIX ? MIX.traffic : a.destination));
    [o, o2, lfo].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); };
  const sir = (D, base, lfoF, dep, types, peak, glide) => { const a = A(); if (!a) return; const t0 = a.currentTime, o = a.createOscillator(), o2 = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = types[0]; o2.type = types[1]; l.type = 'triangle'; l.frequency.value = lfoF; lg.gain.value = dep; l.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    [o, o2].forEach(x => { x.frequency.setValueAtTime(base, t0); x.frequency.linearRampToValueAtTime(base + glide, t0 + D * .42); x.frequency.linearRampToValueAtTime(base - glide, t0 + D); });
    f.type = 'lowpass'; f.frequency.value = 2500; const m = a.createGain(); m.gain.value = .22; o.connect(f); o2.connect(m); m.connect(f); f.connect(g); g.connect((MIX ? MIX.traffic : a.destination));
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); [o, o2, l].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); };
  return {
    zoom(bike) { engine(bike ? 1.6 : 1.9, bike ? [150, 265, 120] : [62, 108, 48], bike ? .16 : .2, bike); nz(1.2, 300, 1500, .03, .3); },
    rev(bike) { engine(1.1, bike ? [110, 210, 170] : [45, 82, 66], bike ? .09 : .11, bike); },
    siren() { sir(5.5, 930, 3, 340, ['triangle', 'sawtooth'], .036, 70); },
    wail() { sir(6, 1050, .55, 380, ['triangle', 'square'], .033, 60); },
    neenaw() { const a = A(); if (!a) return; const t0 = a.currentTime, D = 6.5, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(); o.type = 'sawtooth'; for (let k = 0, tt = 0; tt < D; k++, tt += .55) o.frequency.setValueAtTime(k % 2 ? 640 : 790, t0 + tt);
      f.type = 'lowpass'; f.frequency.value = 1900; o.connect(f); f.connect(g); g.connect((MIX ? MIX.traffic : a.destination)); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.03, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); o.start(t0); o.stop(t0 + D + .05); },
    airhorn(at) { [0, .45].forEach(d => { tn(233, 228, .38, 'sawtooth', .042, (at || 0) + d); tn(294, 290, .38, 'sawtooth', .036, (at || 0) + d); }); },
    horn(v) { v = v == null ? .5 : v; const n = v < .5 ? 1 : 2, f = 380 + v * 140; for (let i = 0; i < n; i++) { tn(f, f, .18 + (v > .8 ? .35 : 0), 'square', .021, i * .28); tn(f * 1.26, f * 1.26, .18 + (v > .8 ? .35 : 0), 'square', .015, i * .28); } },
    skid(v) { v = v == null ? .5 : v; const a = A(); if (!a) return; const t0 = a.currentTime, D = .9 + v * .5, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * D), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      n.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9; f.frequency.setValueAtTime(1900 + v * 900, t0); f.frequency.linearRampToValueAtTime(1300 + v * 500, t0 + D); const g = a.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.2, t0 + .06); g.gain.exponentialRampToValueAtTime(.001, t0 + D); n.connect(f); f.connect(g); g.connect((MIX ? MIX.traffic : a.destination)); n.start(t0); n.stop(t0 + D); },
    bump() { nz(.12, 900, 300, .14); tn(160, 70, .12, 'square', .05); },
    crash() { const a = A(); if (!a) return; const t0 = a.currentTime, sr = a.sampleRate, nb = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(sr * 1.1), sr), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / sr * 9);
      for (let k = 0; k < 36; k++) { const p = Math.floor((.05 + Math.pow(Math.random(), 1.6) * .9) * sr), f = 3000 + Math.random() * 4500, Am = .1 + Math.random() * .35; for (let i = 0; i < sr * .05 && p + i < d.length; i++) d[p + i] += Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / sr * 90) * Am; }
      nb.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = .45; const g = a.createGain(); g.gain.value = .22; nb.connect(f); f.connect(g); g.connect((MIX ? MIX.traffic : a.destination)); nb.start(t0); tn(70, 40, .35, 'sine', .3); },
    thudBig(v) { v = v == null ? .5 : v; nz(.3 + v * .25, 1200 + v * 500, 160, .22); tn(120, 45, .3, 'triangle', .16); tn(420, 300, .25, 'square', .03, .02); nz(.5, 5000, 3000, .03, .08); }
  }; })());

/* ---------------- game state ---------------- */
let paused = false, state = 'menu', t = 0, dist = 0, speed = 0, coins = 0, best = +(localStorage.getItem('jd_best') || 0);
const hero = { x: 0, y: FLOOR, vy: 0, thrust: false, ground: true, landT: 0, rot: 0, run: 0, dead: false, vx: 0, bounce: 0, blink: 0, heat: 0, oh: 0, dashT: 0, dashOff: 0 };
/* skill systems (owner 23 Nov): jetpack overheat, steam dash (swipe right), near-miss boost */
let dashCD = 0, nearMult = 1, nearT = 0, speedKick = 0;
const HEAT_UP = 2.8, HEAT_DOWN = 1.4, OH_TIME = 1.1, DASH_CD = 2.2;
let holding = false;
let street = [], skyline = [], cars = [], npcs = [], obs = [], coinList = [], steam = [], sparks = [], stars = [];
let mobs = [], mobCD = 12; window.__mobsOn = () => mobs.some(m => m.x > 150 && m.x < 650); let nextObs = 0, nextNpc = 0, nextCar = 0, panicT = 0, deadT = 0;
let runT = 0, firstBox = 0, lastBoxRide = 'kabootar';   // owner 22 Nov: every run's first gift box comes at 20 s and is the Flappy Kabootar one
let btins = 0, nextTin = 1e9, tinFly = []; const TINDEMO = /[?&]tindemo=1/.test(location.search) || !!window.__TINDEMO;
let flashT = 0, flashCol = '#fff', shake = 0, banner = null, rings = [], veh = null, inv = 0, gifts = [], nextGift = 0, nextEidi = 0, eidi = 0, pops = [], dust = [], revived = 0;
const stats = { steamed: 0, dodged: 0, missed: 0 };

function seedStars() { stars = []; for (let i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random() * .55, r: Math.random() < .2 ? 1.2 : .7, p: Math.random() * 6 }); }
function reset() {
  t = 0; dist = 0; speed = 0; coins = 0; obs = []; wrecks = []; coinList = []; steam = []; sparks = []; panicT = 0; deadT = 0;
  RUN = newRun(); lastCoin = 0; mtQueue = []; boost = null; usedSave = 0; $('hsBox') && $('hsBox').classList.remove('on'); heroImg = heroImgs[SHOP.outfit] || heroImgs.classic;
  hero.heat = 0; hero.oh = 0; hero.dashT = 0; hero.dashOff = 0; hero.threaded = 0; dashCD = 0; nearMult = 1; nearT = 0; speedKick = 0;
  flashT = 0; shake = 0; banner = null; rings = []; horns = []; hornCD = 0; veh = null; inv = 0; gifts = []; eidi = 0; pops = []; dust = []; revived = 0; nextGift = RIDEDEMO ? 600 : MECHDEMO ? 1400 : FKDEMO ? 500 : 1e9; runT = 0; convoyT = 150 + Math.random() * 150; firstBox = 0; lastBoxRide = ''; nextEidi = 1600; btins = 0; tinFly = []; tinHud(); nextTin = TINDEMO ? 300 : 5200 + Math.random() * 4000; stats.steamed = stats.dodged = stats.missed = 0;
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
const ATTACHED = new Set(['kahwa', 'gna', 'topspizza', 'alquds', 'krispy', 'toros', 'murganos', 'cycleking', 'oak', 'miamicrispy', 'periperi', 'smr', 'hatfactory']);
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
    street.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * BS * jkL(k), inSet: setQ.length > 0 }); }
  else { if (!houseDeck.length) { houseDeck = HOUSE_K().slice(); for (let i = houseDeck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [houseDeck[i], houseDeck[j]] = [houseDeck[j], houseDeck[i]]; } }
    const k = houseDeck.shift(), x = prev ? prev.x + prev.w + gapBetween(prev, 'hs', k) : -60;
    street.push({ kind: 'hs', key: k, x, w: Math.round(HOUSES[k].w * 1.35 * jkH(k)) * BS, run: prev && prev.kind === 'hs' ? (prev.run || 1) + 1 : 1 }); }
}
const bakeQ = [];
function fillStreet() { while (!street.length || street[street.length - 1].x < W + 900) { nextBuilding(); const b = street[street.length - 1]; bakeQ.push(b); } }
function bakeOne() { const b = bakeQ.shift(); if (b) buildingCanvas(b.kind, b.key); }   // one picture per frame, well before it scrolls on   // built ~1.5 screens ahead so there's no hitch
function fillSkyline() { let x = skyline.length ? skyline[skyline.length - 1].x + skyline[skyline.length - 1].w : -100; while (x < W * 2.2) { if (!skyDeck.length) { skyDeck = STREET.slice(); for (let i = skyDeck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [skyDeck[i], skyDeck[j]] = [skyDeck[j], skyDeck[i]]; } } const k = skyDeck.shift(); if (!LANDMARKS[k] || k === myMosque || street.some(b => b.key === k)) continue; skyline.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * .5 * (JK[k] || 1) }); x += LANDMARKS[k].w * .5 - 16; } }

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
  if (CVZ && lane === 1 && !key) return false;   // convoy zooming off: keep its lane empty
  const c = { k, ci: Math.random() * 6000 | 0, lane, dir, x: sx, v, cv: v, yo: 0, L, zoom: !!zoom }; cars.push(c);
  if (zoom) SFX.zoom(k === 'motorbike');
  if (EMK[k] && !zoom) { c.emerg = 1; c.rolled = c.headRolled = c.otRolled = 1;
    if (jamT <= 0 && k !== 'police' && Math.random() < .5) { c.run = 1; c.v = c.cv = EMK[k] * VK; if (k === 'fire') { SFX.neenaw(); SFX.airhorn(1.2); } else if (k === 'ambulance') SFX.wail(); else SFX.siren(); } }
  return c;
}
// owner 22 Nov: the convoy: M4, C63, Abarth, A-Class, then the long S-Class at the back, nose to tail, about every 45 s (random 38-52 s)
const CONVOY = ['m4c', 'c63w', 'abarth', 'aclass', 'slwb']; let convoyT = 1e9;   // owner 22 Nov: once per run, at a random moment in the first minute (set in reset()) window.__convoy = () => { convoyT = 0; };
// convoy sound (owner 22 Nov): the real M4 + C63 recordings. A burble loop per car that fades in as it nears the screen, is fullest
// in frame (still under the game), drops to a quiet background once it has gone and then fades out; every few seconds the M4
// revs and creeps forward, then the C63 does the same (rev clip + loop ducked + a touch of pitch)
const CVS = (() => { const N = ['m4_loop', 'm4_rev', 'm4_rev2', 'c63_loop', 'c63_rev', 'c63_rev2'], buf = {}; let loading = false, bus = null; const voice = {}; let m4T = 3, c63T = 0;
  function load() { if (loading || !AC) return; loading = true; N.forEach(n => fetch('art/snd/' + n + '.mp3?h=' + {"c63_loop": "d3e40a71af", "c63_rev": "a88aec5009", "c63_rev2": "832547414b", "horn": "08c4e34100", "m4_loop": "d8f509bb3d", "m4_rev": "88bd8ce917", "m4_rev2": "82e5130046"}[n]).then(r => r.arrayBuffer()).then(a => new Promise((ok, no) => AC.decodeAudioData(a, ok, no))).then(b => { buf[n] = b; }).catch(() => {})); }
  function vol(c) { const m = c.x + c.L / 2, d = m < 0 ? -m : m > W ? m - W : 0;   // distance outside the screen
    if (!d) return 1; if (d < 220) return 1 - .72 * d / 220; return Math.max(0, .28 * (1 - (d - 220) / 520)); }
  function mk(k) { const s = AC.createBufferSource(); s.buffer = buf[k + '_loop']; s.loop = true; s.loopStart = .05; s.loopEnd = s.buffer.duration - .05;
    const lg = AC.createGain(), g = AC.createGain(); g.gain.value = 0; let p = null; try { p = AC.createStereoPanner(); } catch (e) {}
    s.connect(lg); lg.connect(g); if (p) { g.connect(p); p.connect(bus); } else g.connect(bus); s.start(); return { s, lg, g, p };   // loop -> duck (lg) -> car level (g) -> pan -> bus
  }
  function rev(c, k) { const v = voice[k]; if (!v) return; const n = Math.random() < .7 || !buf[k + '_rev2'] ? k + '_rev' : k + '_rev2'; if (!buf[n]) return;
    const s = AC.createBufferSource(), g = AC.createGain(), t = AC.currentTime; s.buffer = buf[n]; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.2, t + .06);
    s.connect(g); g.connect(v.g); s.start(t); v.revEnd = t + s.buffer.duration - .25; s.onended = () => { try { g.disconnect(); } catch (e) {} }; }
  let zoomT = 0;
  function zoom() { zoomT = 4.5; ['m4', 'c63'].forEach(k => { const v = voice[k]; if (!v || !buf[k + '_rev']) return; const s = AC.createBufferSource(), g = AC.createGain(), t = AC.currentTime; s.buffer = buf[k + '_rev']; s.playbackRate.value = 1.12;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.35, t + .08); s.connect(g); g.connect(v.g); s.start(t); v.revEnd = t + s.buffer.duration / 1.12 - .25; s.onended = () => { try { g.disconnect(); } catch (e) {} }; }); }
  return { zoom() { if (sndOn && AC) zoom(); }, tick(dt) { if (zoomT > 0) zoomT -= dt; const on = cars.filter(c => c.convoy && (c.k === 'm4c' || c.k === 'c63w'));
      if (on.length && AC && !loading) load();
      const live = sndOn && AC && state === 'play' && !document.hidden;
      if (!bus && AC) { bus = AC.createGain(); bus.gain.value = .18; /* 40% quieter (owner 22 Nov) */ bus.connect(MIX ? MIX.traffic : AC.destination); }
      // rev-and-creep timing: only while the M4 or C63 is near the screen
      const m4 = on.find(c => c.k === 'm4c'), c63 = on.find(c => c.k === 'c63w'), near = c => c && c.x + c.L > -60 && c.x < W + 60;
      [m4, c63].forEach(c => { if (c && c.lg) { c.lg.t += dt; if (c.lg.t > 2.6) c.lg = null; } });
      if (near(m4) || near(c63)) { m4T -= dt; if (m4T <= 0 && m4 && !m4.lg) { m4.lg = { t: 0 }; if (live) rev(m4, 'm4'); m4T = 3.6 + Math.random() * 2.6; c63T = 1.1 + Math.random() * .9; }
        if (c63T > 0) { c63T -= dt; if (c63T <= 0 && c63 && !c63.lg) { c63.lg = { t: 0 }; if (live) rev(c63, 'c63'); } } }
      else m4T = Math.min(m4T, 1.2);
      ['m4', 'c63'].forEach(k => { const c = k === 'm4' ? m4 : c63; let v = voice[k];
        if (!AC || !buf[k + '_loop']) return; if (!v && c && live) v = voice[k] = mk(k); if (!v) return;
        const t = AC.currentTime; if (v.revEnd && t > v.revEnd) v.revEnd = 0;
        v.g.gain.setTargetAtTime(c && live ? Math.max(vol(c), zoomT > 1.5 ? .9 : 0) * (k === 'm4' ? 1 : .95) : 0, t, zoomT > 0 ? .5 : .12); v.lg.gain.setTargetAtTime(v.revEnd ? .4 : 1, t, .1);
        if (v.p && c) v.p.pan.setTargetAtTime(Math.max(-.8, Math.min(.8, ((c.x + c.L / 2) / W - .5) * 1.6)), t, .15);
        v.s.playbackRate.setTargetAtTime(zoomT > 0 ? 1.28 : c && c.lg && c.lg.t > .3 && c.lg.t < 1.4 ? 1.1 : 1, t, zoomT > 0 ? .6 : .25);
        if (!c || !live) { v.gone = (v.gone || 0) + dt; if (v.gone > 2) { try { v.s.stop(); v.g.disconnect(); if (v.p) v.p.disconnect(); } catch (e) {} voice[k] = null; } } else v.gone = 0; }); } }; })();
let CVZ = 0;   // owner 22 Nov: once the C63 has left the screen, the whole convoy floors it and zooms off to the right
function convoyTick(dt) { CVS.tick(dt);
  const cv = cars.filter(c => c.convoy); if (!cv.length) CVZ = 0;
  else { const m4 = cv.find(c => c.k === 'm4c'), c63 = cv.find(c => c.k === 'c63w');
    if (!CVZ && m4 && c63 && c63.x + c63.L < 0 && m4.x < W) { CVZ = 1; CVS.zoom(); }
    if (CVZ) { const back = Math.min(...cv.map(c => c.x));   // nothing in their lane in front of them: off-screen ones go, on-screen ones get out of the way first
      cars = cars.filter(c => c.convoy || c.lane !== 1 || c.x + c.L < back - 30 || (c.x > -c.L && c.x < W));
      cars.forEach(c => { if (!c.convoy && c.lane === 1 && c.x + c.L > back - 30) { c.v = Math.max(c.v, speed * .92 + 360); c.zoom = true; } }); } }
  convoyT -= dt; if (convoyT > 0 || jamT > 0 || state === 'menu') return; if (!CONVOY.every(k => VEHICLES[k])) { convoyT = 2; return; }
  const lane = 1, dir = 1, v = 44 * VK, gap = 14, Ls = CONVOY.map(k => VEHICLES[k].w * CSC), tot = Ls.reduce((a, b) => a + b, 0) + gap * (Ls.length - 1);
  const sv = dir * v - speed * .92, x0 = sv > 0 ? -tot - 40 : W + 40;
  if (cars.some(c => c.lane === lane && x0 - 40 < c.x + c.L && c.x < x0 + tot + 40)) { convoyT = 1; return; }
  let x = x0; for (let i = CONVOY.length - 1; i >= 0; i--) { const L = Ls[i]; cars.push({ k: CONVOY[i], ci: 0, lane, dir, x, v, cv: v, yo: 0, L, convoy: 1, rolled: 1, headRolled: 1, otRolled: 1 }); x += L + gap; }
  convoyT = 300 + Math.random() * 180; }   // owner 23 Nov (evening): rarer: every 5-8 minutes after the first
function startChase() { const ks = ['lambo', 'gt3', 'f812', 'c63', 'a45', 'urus', 'golfr', 'gwagon'], f = spawnCar(null, ks[Math.random() * ks.length | 0], true, 1); if (!f) return;
  f.v = f.cv = (150 + Math.random() * 50) * VK; f.flee = 1; const PL = VEHICLES.police.w * CSC;
  cars.push({ k: 'police', ci: 0, lane: f.lane, dir: f.dir, x: f.dir > 0 ? f.x - PL - 50 - Math.random() * 30 : f.x + f.L + 50 + Math.random() * 30, v: f.v + 6 * VK, cv: f.v + 6 * VK, yo: 0, L: PL, zoom: true, police: 1, run: 1, emerg: 1, rolled: 1, headRolled: 1 });
  chaseCD = 240 + Math.random() * 300; zoomCD = Math.max(zoomCD, 20); SFX.siren(); }
function hitCar(car, sp, fire) { car.crash = { t: 0, rot: 0, st: 'hit', road: true, spin: sp, v0: car.cv, len: .35, ty: car.yo, fire, snd: .9 }; car.ot = null; car.drift = null; }
function startJam(cx, T) { jamT = T; cars.forEach(o => { if (!o.crash) o.free = o.dir > 0 ? o.x > cx : o.x + o.L < cx; }); }
let csmoke = [];
function smokeAt(x, y, dark) { if (csmoke.length < 90) csmoke.push({ x, y, vx: (Math.random() - .5) * 20, vy: -14 - Math.random() * 12, r: 3, a: dark ? .6 : .45, dark }); }
window.__tinApi = { addCoins: n => { if (POSTBANK) { bankAdd(n); return; } coins += n; $('coins').textContent = '£' + coins; }, get SHOP() { return SHOP; }, saveShop: () => saveShop(), get ITEMS() { return ITEMS; }, iconFor: (a, b, c) => iconFor(a, b, c), drawCorolla: (...a) => drawCorolla(...a), coin: () => SFX.coin(), tone: (...a) => tone(...a) };
window.__tins = n => { btins = n || 1; die && die('rocket'); };
window.__kit = () => ({ rideIcon, drawRocket, drawZap, drawGift, drawVehicle, drawLaser, drawCorolla, carSprite, makeCoins, coins: () => coinFrames, FK_ICON, setHero: im => { heroImg = im; }, hero, cv });   // poster/sketch tool hook
window.__cars = () => cars; window.__spawn = (k, x) => spawnCar(x == null ? W * .5 : x, k, 0, 1);   // test hook: put a chosen car in the near lane
window.__lm = (key, x) => { street.push({ kind: 'lm', key, x: x == null ? W * .5 : x, w: LANDMARKS[key].w * BS * jkL(key) }); };   // test hook: put a landmark on the street
// strict lanes (owner, 22 Nov): never two cars overlapping in one lane. An overtaker only starts when there is room for it in
// front of the car it passes, and only pulls back in when its own lane is clear around it (with space front and back).
function slotFree(c) { return !cars.some(q => q !== c && !q.crash && q.lane === c.lane && !(q.ot && q.ot.out > .2) && q.x < c.x + c.L + 26 && q.x + q.L > c.x - 26); }
function roomAfter(c, a) { const need = c.L + 80; return !cars.some(q => q !== c && q !== a && !q.crash && q.lane === c.lane && !(q.ot && q.ot.out > .2) && (c.dir > 0 ? q.x + q.L > a.x + a.L - 4 && q.x < a.x + a.L + need : q.x < a.x + 4 && q.x + q.L > a.x - need)); }
function updateTraffic(dt, dx) {
  const moving = state !== 'dead' || speed > 5, scroll = dx * .92;
  cars.forEach(c => { let ahead = null, gap = 1e9;
    cars.forEach(o => { const intoMine = o.lane !== c.lane && o.ot && o.ot.out > .3 && o.dir !== c.dir;   // an overtaker coming the other way in my lane: brake for it
      if (o === c || (o.crash && !o.crash.road) || (o.lane !== c.lane && !(o.crash && o.crash.road) && !intoMine) || (o.ot && o.ot.out > .5 && !intoMine)) return; const d = c.dir > 0 ? o.x - (c.x + c.L) : c.x - (o.x + o.L); if (d > -4 && d < gap) { gap = d; ahead = o; } });
    if (!c.ot && !c.emerg && !c.crash && jamT <= 0 && ahead && ahead.dir === c.dir && gap < 60 && roomAfter(c, ahead) && ((c.zoom && !(c.police && ahead.flee)) || (c.v > ahead.cv + 6 * VK && !c.otRolled && (c.otRolled = 1) && otCD <= 0 && Math.random() < .35)) && c.L < 140) {
      const vo = c.zoom ? c.v : Math.max(c.v, ahead.cv + 34 * VK) * 1.35, rel = Math.max(20, vo - ahead.cv), Tp = (gap + ahead.L + c.L + 40) / rel + .9;
      const need = vo * Tp + 60, x0 = c.dir > 0 ? c.x - 10 : c.x - need, x1 = c.dir > 0 ? c.x + c.L + need : c.x + c.L + 10;
      const clear = !cars.some(o => { if (o === c || o.crash) return false; if (o.lane === c.lane && !(o.ot && o.ot.out > .2)) return false; const reach = o.dir === c.dir ? 0 : o.cv * Tp;
        return c.dir > 0 ? o.x < x1 + reach && o.x + o.L > c.x - 10 : o.x + o.L > x0 - reach && o.x < c.x + c.L + 10; });
      if (clear) { c.ot = { out: 0, past: ahead }; if (!c.zoom) otCD = 14 + Math.random() * 22; if (c.x > -40 && c.x < W + 40) SFX.rev(c.k === 'motorbike'); }
    }
    if (c.crash) return;
    if (c.ot) { const o = c.ot, side = c.lane ? -1 : 1;
      if (!o.abort && o.out > .2) { const fx = c.dir > 0 ? c.x + c.L : c.x; if (cars.some(q => q !== c && !q.crash && q.lane !== c.lane && (c.dir > 0 ? q.x > fx - 4 && q.x < fx + 90 : q.x + q.L < fx + 4 && q.x + q.L > fx - 90))) o.abort = true; }
      if (o.abort) { const fr = slotFree(c); if (fr) o.out = Math.max(0, o.out - dt * 3); c.yo = side * LD * (o.out * o.out * (3 - 2 * o.out)); c.cv = Math.min(c.v, cars.includes(o.past) ? o.past.cv : c.v) * (fr ? .8 : .55); if (o.out <= 0) { c.ot = null; c.yo = 0; } return; }
      const passed = !cars.includes(o.past) || (c.dir > 0 ? c.x > o.past.x + o.past.L + 20 : c.x + c.L < o.past.x - 20);
      const back = passed && slotFree(c); o.out = Math.max(0, Math.min(1, o.out + (back ? -dt * 2.2 : dt * 2.4))); c.yo = side * LD * (o.out * o.out * (3 - 2 * o.out));
      c.cv = c.zoom ? c.v : Math.max(c.v, o.past.cv + 34 * VK) * 1.35; if (passed && o.out <= 0) { c.ot = null; c.yo = 0; } return; }
    let tg = ahead && ahead.dir !== c.dir && !ahead.crash ? (gap < 90 ? 0 : c.v * .5) : ahead && gap < 40 ? Math.min(c.v, ahead.crash ? 0 : ahead.cv) * (gap < 14 ? .85 : 1) : c.v;
    if (jamT > 0 && !c.free && !ahead && c.x > -10 && c.x + c.L < W + 10 && (c.dir > 0 ? c.x > W * .25 : c.x < W * .75)) tg = 0;
    if (c.convoy && ahead && ahead.convoy && !ahead.crash) tg = ahead.cv + (gap - 14) * .6;   // the convoy holds together, nose to tail
    if (c.convoy && CVZ) { tg = ahead && ahead.convoy ? ahead.cv + (gap - 12) * 1.2 : speed * .92 + 330; c.lg = null; }   // zoom off to the right
    else if (c.convoy && c.lg) { const p = c.lg.t;   // rev, creep forward, ease off (owner 22 Nov: M4 + C63), never into the car in front
      if (p > .3 && p < 1.4) tg = ahead && ahead.convoy ? ahead.cv + (gap - 5) * 1.6 : ahead && gap < 70 ? tg : c.v * 1.6; else if (p >= 1.4 && p < 2.4 && !(ahead && ahead.convoy)) tg = c.v * .8;
      if (ahead && gap < 6) tg = Math.min(tg, ahead.cv); }
    if (c.drift) tg = c.v; if (c.pull) tg *= 1 - .65 * c.pull; if (c.run) tg = c.v * (c.out > .5 || !ahead ? 1 : .55);
    c.cv = c.cv + (tg - c.cv) * Math.min(1, dt * (tg < c.cv ? 5 : c.convoy && CVZ ? 1.8 : 1.1)); if (ahead && gap < 4 && !(c.run && c.out > .4)) c.cv = Math.min(c.cv, ahead.cv); });
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
  zoomCD -= dt; if (moving && jamT <= 0 && zoomCD <= 0 && Math.random() < dt * .03) { const ks = ['lambo', 'f812', 'gt3', 'golfr', 'c63', 'urus', 'a45']; if (spawnCar(null, ks[Math.random() * ks.length | 0], true)) zoomCD = 30 + Math.random() * 40; }
  cars.forEach(c => { if ((c.zoom && Math.random() < dt * 30) || (c.ot && c.ot.out > .1 && Math.random() < dt * 16)) dust.push({ x: c.dir > 0 ? c.x : c.x + c.L + 6, y: (c.lane ? ROAD_B - 5 : ROAD_T + 17) + c.yo, vx: -c.dir * 30 - scroll / dt * 0, vy: -6, r: 1.5, l: .5 }); });
  for (let i = csmoke.length - 1; i >= 0; i--) { const p = csmoke[i]; p.x += p.vx * dt - scroll; p.y += p.vy * dt; p.r += 9 * dt; p.a -= .4 * dt; if (p.a <= 0) csmoke.splice(i, 1); }
  cars = cars.filter(c => c.x > -c.L - (c.convoy ? 1300 : 300) && c.x < W + (c.convoy ? (CVZ ? 260 : 1300) : 320));
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
// JALEBI (owner 23 Nov, a gadget): some coin trails turn into hot jalebis worth £3 each
let JALEBI = null, jalT = 0;
const JAL_ART = img('art/jalebi.webp?h=35f7aa9f66');
function jalebiImg() { if (JALEBI) return JALEBI; if (JAL_ART.complete && JAL_ART.naturalWidth) { const S = Math.round(26 * KR), c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; const k = S / Math.max(JAL_ART.width, JAL_ART.height); g.drawImage(JAL_ART, (S - JAL_ART.width * k) / 2, (S - JAL_ART.height * k) / 2, JAL_ART.width * k, JAL_ART.height * k); return JALEBI = c; } const S = Math.round(22 * KR), c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.translate(S / 2, S / 2); g.scale(S / 22, S / 22);
  const sp = () => { g.beginPath(); for (let a = 0; a < Math.PI * 5.2; a += .15) { const r = 1.2 + a * .52; const x = Math.cos(a) * r, y = Math.sin(a) * r * .92; a ? g.lineTo(x, y) : g.moveTo(x, y); } };
  g.lineCap = g.lineJoin = 'round'; sp(); g.strokeStyle = '#7a2e05'; g.lineWidth = 4.6; g.stroke(); sp(); g.strokeStyle = '#ff8a14'; g.lineWidth = 3.1; g.stroke(); sp(); g.strokeStyle = 'rgba(255,230,150,.85)'; g.lineWidth = 1; g.setLineDash([2, 3]); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(255,255,255,.9)'; [[-3, -5], [4, -2], [-5, 3], [2, 5]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, .7, 0, 7); g.fill(); }); return JALEBI = c; }
function jalebiPop(c) { if (t - jalT > .6) { jalT = t; pops.push({ x: c.x, y: c.y - 14, txt: 'JALEBI! +£3', col: '#ff9a2a', t: 0 }); tone(880, .08, 'triangle', .05, 1.3); } }

function spawnPattern() {
  const x0 = W + 60, top = CEIL + 14, bot = FLOOR - 14, r = Math.random(), m = dist / 10;
  if (r < .3) { // line / wave of coins
    const n = 8 + (Math.random() * 8 | 0), y0 = top + 20 + Math.random() * (bot - top - 60), wave = Math.random() < .5;
    const jb = hasG('jalebi') && Math.random() < .22; for (let i = 0; i < n; i++) coinList.push({ x: x0 + i * 18, y: y0 + (wave ? Math.sin(i / 2.2) * 26 : 0), got: 0, j: jb });
    return 140 + n * 18;
  }
  if (r < .42) { // block of coins
    const cols = 6 + (Math.random() * 5 | 0), rows = 3 + (Math.random() * 2 | 0), y0 = top + 20 + Math.random() * (bot - top - rows * 18 - 30);
    const jb = hasG('jalebi') && Math.random() < .22; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) coinList.push({ x: x0 + i * 18, y: y0 + j * 18, got: 0, j: jb });
    return 160 + cols * 18;
  }
  if (m > 220 && !veh && Math.random() < .14) { const mid = (top + bot) / 2, pk = Math.random();   // owner 23 Nov: set pieces with two ways through
    if (pk < .34 && !obs.some(o => o.type === 'laser')) {   // speed-camera gate: two beams with a narrow gap and a coin line through it; the safe way is right above or below
      [mid - 30, mid + 30].forEach((y, i) => obs.push({ type: 'laser', x: W / 2, y, ph: 'in', pt: 0, slide: 0, d: i * .05 }));
      const ax = hero.x + speed * 1.75; for (let i = 0; i < 12; i++) coinList.push({ x: ax + i * 18, y: mid, got: 0 }); return speed * 3.8; }
    if (pk < .67) {   // rotating zapper ringed with coins: skim the ring (near-miss bonus) or go round the top or bottom with nothing
      const cx = x0 + 70; obs.push({ type: 'zap', x: cx, y: mid, len: 96, ang: 0, spin: 1.15, seed: Math.random() * 99 });
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; coinList.push({ x: cx + Math.cos(a) * 66, y: mid + Math.sin(a) * 66, got: 0 }); } return 360; }
    // rocket run: top and bottom lanes fire first, then the middle; coins sit in the middle lane (dash through or slip out late), the safe line between is empty
    const ln = [CEIL + 44, FLOOR - 44, mid - 6]; ln.forEach((y, i) => obs.push({ type: 'rocket', x: W + 40, y, warn: 1.3 + (i === 2 ? .9 : 0), lock: 0, v: 0, fixY: 1 })); SFX.warn();
    const ax = hero.x + speed * 2.2; for (let i = 0; i < 10; i++) coinList.push({ x: ax + i * 18, y: mid - 6, got: 0 }); return 460; }
  if (mechArmour()) {   // owner 23 Nov (like the SAM suit in JJ2): in the mech there are no lasers or cables, only rockets, a bit more often
    const k = Math.random(), base = -(85 * MCH - 30), mk = (oy, d) => obs.push({ type: 'rocket', x: W + 40 + d * 30, y: hero.y - 30 + oy, warn: 1.4 + d * .3, lock: 0, v: 0, off: oy });
    SFX.warn();
    if (k < .55) { mk(base + (Math.random() - .5) * 130 * MCH, 0); return 230; }
    if (k < .85) { mk(base - 55 * MCH, 0); mk(base + 45 * MCH, 1); return 300; }
    [-70, 0, 70].forEach((o, i) => mk(base + o * MCH, i)); return 360;
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
function heroCircles() { const x = hero.x, y = hero.y, k = HS; if (boost && !boost.out) return [[x, y - 40, 20]]; if (veh) return vehCircles(); return [[x + 2 * k, y - 18.9 * k, 6.5 * k], [x + 5 * k, y - 36.8 * k, 6 * k]]; }   // hit area follows the shorter legs (owner 22 Nov)
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let k = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; k = Math.max(0, Math.min(1, k)); const qx = ax + dx * k - px, qy = ay + dy * k - py; return Math.sqrt(qx * qx + qy * qy); }

/* Billi the Cat (owner 23 Nov: works exactly like Flash the dog in Jetpack Joyride): a gadget; runs along the pavement with him,
   jumps for coins (and gift boxes) near the ground, now and then trips a passer-by, and rides along on every power-up. */
function carpetWave(u) { return Math.sin(t * 6.5 - u * 7) * (2.2 + u * 3.2) + Math.sin(t * 3.1 - u * 3) * 1.2; }   // the carpet's ripple, u = 0 tail .. 1 front
const CAT = (() => { const K = { on: 0, ride: 0, x: 0, y: 0, vy: 0, air: 0, ph: 0, sit: 0, got: 0 };
  function rideSpot() { if (boost && !boost.out) return [hero.x - 18, hero.y - 30];
    if (!veh) return null; const k = veh.k;
    if (k === 'tuktuk') return [hero.x - 16 * 1.2, hero.y - 87 * 1.2];   // on the roof
    if (k === 'carpet') { const r = hero.rot || 0, ox = -30, oy = -1 + carpetWave(.2); return [hero.x + Math.cos(r) * ox - Math.sin(r) * oy, hero.y + Math.sin(r) * ox + Math.cos(r) * oy]; }   // sits on the cloth and rides its ripple
    if (k === 'kabootar') return [hero.x - 16, hero.y - 26];
    if (k === 'mech') return veh.su >= 1 ? [hero.x - 18 * MCH, hero.y - 125 * MCH] : null; return null; }
  K.tick = dt => { K.on = hasG('cat') && (state === 'play' || state === 'intro' || state === 'dead') && hero.x > -60; if (!K.on) { K.x = hero.x - 40; K.y = FLOOR; return; }
    const rs = state === 'play' ? rideSpot() : null; K.ride = !!rs;
    if (K.land > 0) K.land -= dt;
    if (rs) { if (!K.att) { if (!K.jmp) K.jmp = { t: 0, x0: K.x, y0: K.y }; const J = K.jmp; J.t = Math.min(1, J.t + dt / .5); const e = J.t * J.t * (3 - 2 * J.t);   // owner 23 Nov: leaps up onto the ride in an arc, lands with a little squash, then he's part of it
        K.x = J.x0 + (rs[0] - J.x0) * e; K.y = J.y0 + (rs[1] - J.y0) * e - Math.sin(Math.PI * J.t) * 70; K.jvy = J.t < .5 ? -1 : 1; if (J.t >= 1) { K.att = 1; K.jmp = null; K.land = .25; tone(900, .05, 'sine', .02, 1.3, MIX && MIX.fx); } }
      else { K.x = rs[0]; K.y = rs[1]; } K.vy = 0; K.air = 0; K.sit = 1;
      coinList.forEach(c => { if (!c.got && Math.hypot(c.x - K.x, c.y - (K.y - 8)) < 60) { const k2 = Math.min(1, dt * 8); c.x += (K.x - c.x) * k2; c.y += (K.y - 8 - c.y) * k2; if (Math.hypot(c.x - K.x, c.y - K.y + 8) < 12) grab(c); } }); return; }
    K.att = 0; K.jmp = null; K.sit = hero.dead ? 1 : 0;   // owner 23 Nov: walks/runs in at the start (no sitting) - only sits once he's down
    if (K.y < FLOOR - 40 && !K.air) { K.air = 1; K.vy = 0; }   // dropped off a ride
    let tx = hero.x - 34;
    if (state === 'play' && !hero.dead) {   // look for a coin or gift box low enough to jump for
      let best = null, bd = 1e9; coinList.forEach(c => { if (c.got) return; const ax = c.x - K.x; if (ax > -10 && ax < 190 && c.y > FLOOR - 150 && ax < bd) { bd = ax; best = c; } });
      if (best) { tx = Math.min(W - 40, best.x); if (!K.air && best.x - K.x < 60 + Math.max(0, FLOOR - best.y) * .4 && best.y < FLOOR - 16) { K.air = 1; K.vy = -Math.sqrt(2 * 1700 * Math.max(20, FLOOR - best.y + 6)); tone(1500, .05, 'sine', .02, 1.4, MIX && MIX.fx); } } }
    else tx = hero.x - 26;
    K.x += Math.max(-260 * dt, Math.min(320 * dt, (tx - K.x) * Math.min(1, dt * 5)));
    if (K.air) { K.vy += 1700 * dt; K.y += K.vy * dt; if (K.y >= FLOOR) { K.y = FLOOR; K.air = 0; K.vy = 0; } } else K.y = FLOOR;
    K.ph += dt * (K.sit ? 0 : Math.PI * 2 * Math.max(2.6, Math.min(4.2, speed * .016)));   // owner 23 Nov: a proper running gallop, quicker as the game speeds up
    coinList.forEach(c => { if (!c.got && Math.hypot(c.x - K.x, c.y - (K.y - 9)) < 16) grab(c); });
    if (state === 'play' && !K.air && !K.sit) npcs.forEach(p => { if (p.esc || p.fall > 0 || p.catChk || Math.abs(p.x - K.x) > 10) return; p.catChk = 1;   // now and then someone trips over the cat
      if (Math.random() < .25) { p.fall = 99; p.fall0 = 99; p.landed = 0; p.fallDir = 1; p.done = 1; RUN.catTrips = (RUN.catTrips || 0) + 1; SFX.thud(); meow(); } }); };
  function grab(c) { c.got = 1; coins += nearMult * (c.j ? 3 : 1); if (c.j) jalebiPop(c); lastCoin = dist; RUN.catCoins = (RUN.catCoins || 0) + 1; POL.coin(c); $('coins').textContent = '£' + coins; }
  function meow() { if (!AC) return; tone(820, .22, 'sine', .035, .72, MIX && MIX.fx); setTimeout(() => tone(600, .18, 'sine', .03, .8, MIX && MIX.fx), 120); }
  // drawing (owner 23 Nov: same style as the hero): drawn in the hero's own frame units (thick dark outline, soft gradients,
  // big glossy eye with a highlight, blush), then scaled by the same factor as his sheet, so lines and shading match him.
  const OUT = '#141016', LW = 9, FUR = ['#ffbf6e', '#f5922f', '#c8651c'], STR = 'rgba(176,74,14,.75)', CRM = ['#fff6e8', '#f2d6b4'];
  const FS = .303 / 6 * 1.06;   // hero frame unit -> game unit (his sheet scale x HX4 x HS)
  function headAt(g, hx, hy, mode, G, F, fur) {
    // head (big, like his): ears, round head, cream muzzle, big glossy eye, pink nose, smile, whiskers, blush
    const ear = (bx0, by0, tx, ty, bx1, by1, inner, front) => { g.beginPath(); g.moveTo(hx + bx0, hy + by0); g.quadraticCurveTo(hx + tx - 18, hy + ty + 40, hx + tx, hy + ty); g.quadraticCurveTo(hx + tx + 16, hy + ty + 40, hx + bx1, hy + by1);
        if (front) { g.fillStyle = fur(hy + ty, hy + by0); g.fill(); g.lineWidth = LW; g.strokeStyle = OUT; g.stroke(); } else { g.closePath(); F(G(0, hy + ty, 0, hy + by0, [[0, FUR[1]], [1, FUR[2]]])); }
        g.beginPath(); g.moveTo(hx + bx0 + 24, hy + by0 - 2); g.quadraticCurveTo(hx + tx - 6, hy + ty + 50, hx + tx, hy + ty + 34); g.quadraticCurveTo(hx + tx + 6, hy + ty + 50, hx + bx1 - 24, hy + by1 - 2); g.closePath(); g.fillStyle = inner; g.fill(); };
    ear(20, -100, 72, -190, 98, -70, '#e89a8c', 0);   // far ear: smaller, behind the head
    g.beginPath(); g.ellipse(hx, hy, 140, 122, 0, 0, 7); F(G(hx - 140, hy - 122, hx + 100, hy + 122, [[0, FUR[2]], [.35, FUR[1]], [.8, FUR[0]], [1, FUR[1]]]));
    if (mode === 'run') { g.beginPath(); g.ellipse(hx - 82, hy + 70, 74, 58, -.4, 0, 7); g.fillStyle = FUR[1]; g.fill(); }   // neck: covers the line where head and body meet
    else { g.beginPath(); g.ellipse(hx - 20, hy + 96, 80, 40, 0, 0, 7); g.fillStyle = FUR[1]; g.fill(); }
    ear(-78, -64, -40, -205, 22, -114, '#ffb0a0', 1);   // near ear: bigger, on the front of the head
    g.save(); g.beginPath(); g.ellipse(hx, hy, 140, 122, 0, 0, 7); g.clip(); g.fillStyle = STR; [[-40, -118, .1], [0, -122, 0], [40, -118, -.1]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(hx + x, hy + y, 14, 50, r, 0, 7); g.fill(); });
      g.beginPath(); g.ellipse(hx - 110, hy + 10, 55, 16, .3, 0, 7); g.fill(); g.restore();
    g.beginPath(); g.ellipse(hx + 78, hy + 48, 70, 52, 0, 0, 7); g.fillStyle = G(0, hy, 0, hy + 100, [[0, CRM[0]], [1, CRM[1]]]); g.fill();
    g.beginPath(); g.moveTo(hx + 118, hy + 6); g.quadraticCurveTo(hx + 146, hy + 4, hx + 142, hy + 22); g.quadraticCurveTo(hx + 132, hy + 34, hx + 116, hy + 22); g.closePath(); F('#ff8f9e', 6);
    g.strokeStyle = OUT; g.lineWidth = 7; g.beginPath(); g.moveTo(hx + 128, hy + 30); g.quadraticCurveTo(hx + 124, hy + 58, hx + 96, hy + 56); g.moveTo(hx + 128, hy + 30); g.quadraticCurveTo(hx + 136, hy + 56, hx + 160, hy + 50); g.stroke();
    const bl = (t % 3.4) < .14 || mode !== 'run' && (t % 2.2) < .12;
    if (bl) { g.lineWidth = 9; g.beginPath(); g.moveTo(hx + 28, hy - 22); g.quadraticCurveTo(hx + 58, hy - 4, hx + 88, hy - 24); g.stroke(); }
    else { g.beginPath(); g.ellipse(hx + 58, hy - 26, 38, 46, 0, 0, 7); F('#ffffff', 8); g.save(); g.beginPath(); g.ellipse(hx + 58, hy - 26, 38, 46, 0, 0, 7); g.clip();
      g.beginPath(); g.ellipse(hx + 72, hy - 20, 26, 34, 0, 0, 7); g.fillStyle = G(0, hy - 54, 0, hy + 14, [[0, '#9be26a'], [1, '#3f9a2a']]); g.fill();
      g.beginPath(); g.ellipse(hx + 76, hy - 20, 10, 26, 0, 0, 7); g.fillStyle = '#120a05'; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(hx + 64, hy - 38, 8, 0, 7); g.fill(); g.restore(); }
    g.fillStyle = 'rgba(230,110,80,.3)'; g.beginPath(); g.ellipse(hx + 48, hy + 42, 26, 13, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4; [[-6, -10], [10, 8]].forEach(([a, b2]) => { g.beginPath(); g.moveTo(hx + 150, hy + 36 + a); g.lineTo(hx + 225, hy + 30 + b2); g.stroke(); });
  }
  // owner 23 Nov: built into the power-ups: Billi lying on the ride (mech shoulder pad, carpet, tuk-tuk roof...), paws draped over the edge when hang
  K.lie = (g, sc = 1, o = {}) => { g.save(); const sq = K.land > 0 ? Math.sin(K.land / .25 * Math.PI) * .18 : 0; g.scale(FS / sc * (1 + sq * .6), FS / sc * (1 - sq)); g.lineJoin = 'round'; g.lineCap = 'round';
    const G = (x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach(([o2, k]) => q.addColorStop(o2, k)); return q; };
    const F = (fill, lw = LW) => { g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = OUT; g.stroke(); };
    const fur = (y0, y1) => G(0, y0, 0, y1, [[0, FUR[0]], [.45, FUR[1]], [1, FUR[2]]]);
    const limb = (pts, w, col) => { const p = () => { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); }; p(); g.lineWidth = w + LW * 2; g.strokeStyle = OUT; g.stroke(); p(); g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
    const paw = (x, y, a = 0) => { g.beginPath(); g.ellipse(x, y, 42, 22, a, 0, 7); F(G(0, y - 22, 0, y + 22, [[0, CRM[0]], [1, CRM[1]]])); };
    const sw = Math.sin(t * 3.2) * 18, wind = o.wind ? Math.sin(t * 14) * 10 : 0;
    // tail: hangs down behind (mech), or streams out behind in the wind / lies curled on the cloth
    const tl = () => { g.beginPath(); g.moveTo(-200, -80); if (o.hang) g.bezierCurveTo(-280, -60, -300, 60 + sw, -250, 150 + sw); else if (o.wind) g.bezierCurveTo(-300, -110 + wind, -380, -60 - wind, -470, -90 + wind); else g.bezierCurveTo(-300, -60, -360, -20 + sw * .5, -330, -110 + sw); };
    tl(); g.lineWidth = 50 + LW * 2; g.strokeStyle = OUT; g.stroke(); tl(); g.lineWidth = 50; g.strokeStyle = FUR[1]; g.stroke(); g.save(); tl(); g.lineWidth = 50; g.setLineDash([26, 40]); g.strokeStyle = STR; g.stroke(); g.restore();
    // far front leg (darker) under the body
    if (o.hang) limb([[90, -70], [140, 0], [150, 90]], 52, '#d9761f'); else limb([[70, -50], [210, -30]], 52, '#d9761f');
    if (o.hang) paw(158, 104, .2); else paw(226, -24);
    // loaf body + haunch
    g.beginPath(); g.moveTo(-235, -14); g.bezierCurveTo(-260, -150, -170, -220, -40, -226); g.bezierCurveTo(100, -232, 190, -180, 180, -90); g.bezierCurveTo(176, -30, 140, -8, 90, -8); g.lineTo(-200, -8); g.closePath(); F(fur(-232, 0));
    g.save(); g.clip(); g.fillStyle = STR; [[-170, -200, .35], [-90, -222, .2], [-10, -226, .05]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, 26, 70, r, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(255,240,220,.5)'; g.beginPath(); g.ellipse(-30, -12, 170, 30, 0, 0, 7); g.fill(); g.restore();
    g.beginPath(); g.ellipse(-130, -96, 108, 84, -.2, 0, 7); F(fur(-180, -12));   // haunch
    g.save(); g.beginPath(); g.ellipse(-130, -96, 108, 84, -.2, 0, 7); g.clip(); g.fillStyle = STR; [[-180, -150], [-130, -168]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 20, 52, .4, 0, 7); g.fill(); }); g.restore();
    paw(-50, -16);   // back foot tucked under
    g.beginPath(); g.ellipse(130, -90, 58, 70, 0, 0, 7); g.fillStyle = G(0, -160, 0, -20, [[0, CRM[0]], [1, CRM[1]]]); g.fill();   // cream chest
    // near front leg: draped over the edge, or stretched out in front
    if (o.hang) { limb([[120, -80], [170, -10], [180, 80]], 58, FUR[1]); paw(190, 94, .2); } else { limb([[110, -40], [250, -20]], 58, FUR[1]); paw(266, -16); }
    headAt(g, 210, -300, 'lie', G, F, fur);
    g.restore(); };
  K.built = () => K.att && veh && (veh.k === 'mech' || veh.k === 'carpet' || veh.k === 'tuktuk');
  K.draw = (g = ctx) => { if (K.jmp) { const sv = [K.sit, K.air, K.vy, K.jmp]; K.sit = 0; K.air = 1; K.vy = K.jvy * 100; K.jmp = null; K.draw(g); [K.sit, K.air, K.vy, K.jmp] = sv; return; }
    const run = !K.sit && !K.air, p = K.ph, sw = run ? Math.sin(p) : 0, cw = run ? Math.cos(p) : 0;
    const G = (x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, k]) => q.addColorStop(o, k)); return q; };
    const F = (fill, lw = LW) => { g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = OUT; g.stroke(); };
    const fur = (y0, y1) => G(0, y0, 0, y1, [[0, FUR[0]], [.45, FUR[1]], [1, FUR[2]]]);
    g.save(); g.translate(K.x, K.y); if (!K.ride) { g.fillStyle = 'rgba(20,10,30,.22)'; g.beginPath(); g.ellipse(0, .5, 13, 2.2, 0, 0, 7); g.fill(); }
    g.scale(FS, FS); g.lineJoin = 'round'; g.lineCap = 'round';
    const cyc0 = p / (Math.PI * 2), bob = run ? -Math.pow(Math.sin(Math.PI * (((cyc0 + .2) % 1 + 1) % 1)), 2) * 34 : 0, tilt = K.air ? (K.vy < 0 ? -.18 : .14) : run ? Math.sin(p) * .07 : 0;
    // a leg: upper + lower part joined at the knee (front legs bend forward, back legs bend at the hock), cream paw
    const leg = (hx0, hy0, px, py, back, far) => {   // owner 23 Nov: knees on the front of the leg; back legs: knee forward, hock behind, like a real cat
      const ex = back && !K.sit ? px - 34 : px, ey = back && !K.sit ? py - 74 : py;   // back legs end at the hock first
      const U = K.sit ? 200 : back ? 105 : 110, L = K.sit ? 200 : back ? 95 : 120, dx = ex - hx0, dy = ey - hy0, d = Math.max(1, Math.min(U + L - 1, Math.hypot(dx, dy))), a0 = Math.atan2(dy, dx),
        k = K.sit ? 0 : -Math.acos(Math.max(-1, Math.min(1, (U * U + d * d - L * L) / (2 * U * d)))), kx = hx0 + Math.cos(a0 + k) * U, ky = hy0 + Math.sin(a0 + k) * U;
      const path = () => { g.beginPath(); g.moveTo(hx0, hy0); g.lineTo(kx, ky); if (back && !K.sit) g.lineTo(ex, ey); g.lineTo(px, py - 14); };
      path(); g.lineWidth = (back ? 70 : 58) + LW * 2; g.strokeStyle = OUT; g.stroke(); path(); g.lineWidth = back ? 70 : 58; g.strokeStyle = far ? '#d9761f' : FUR[1]; g.stroke();
      g.beginPath(); g.ellipse(px + 14, py - 8, 40, 22, 0, 0, 7); F(G(0, py - 30, 0, py + 14, [[0, far ? '#e8cfa8' : CRM[0]], [1, CRM[1]]])); };
    // trot: each paw is planted (sliding back with the street) for half the step, then lifted and swung forward
    const ST = .4, SL = 80, step = u => { u = ((u % 1) + 1) % 1; if (u < ST) return [SL - 2 * SL * u / ST, 0]; const q = (u - ST) / (1 - ST), e = q * q * (3 - 2 * q); return [-SL + 2 * SL * e, -Math.sin(Math.PI * q) * 80]; };   // gallop: short planted phase, long fast reach, paws tucked up high
    const cyc = p / (Math.PI * 2);
    g.save(); g.translate(0, bob); g.rotate(tilt);
    if (K.sit) {   // sitting: upright body, tail curled round the front paws
      g.lineWidth = 50 + LW * 2; g.strokeStyle = OUT; const tl = () => { g.beginPath(); g.moveTo(-150, -60); g.bezierCurveTo(-260, -20, -120, 20, 120, -6); }; tl(); g.stroke(); tl(); g.lineWidth = 50; g.strokeStyle = FUR[2]; g.stroke();
      g.beginPath(); g.moveTo(-170, -10); g.bezierCurveTo(-240, -200, -130, -330, 20, -330); g.bezierCurveTo(140, -330, 170, -200, 140, -10); g.closePath(); F(fur(-330, 0));
      g.save(); g.clip(); g.fillStyle = STR; [[-150, -230], [-170, -160], [-160, -90]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 70, 16, -.25, 0, 7); g.fill(); }); g.fillStyle = CRM[0]; g.beginPath(); g.ellipse(80, -170, 70, 120, -.1, 0, 7); g.fill(); g.restore();
      leg(40, -170, 52, 0, 0, 0); leg(108, -170, 118, 0, 0, 0);
    } else {
      // tail (swishes)
      const tw = Math.sin(t * 6) * 30, tl = () => { g.beginPath(); g.moveTo(-210, -250); g.bezierCurveTo(-330, -270, -360, -380 + tw, -300, -480 + tw); };
      tl(); g.lineWidth = 50 + LW * 2; g.strokeStyle = OUT; g.stroke(); tl(); g.lineWidth = 50; g.strokeStyle = FUR[1]; g.stroke();
      g.save(); tl(); g.lineWidth = 50; g.setLineDash([26, 40]); g.strokeStyle = STR; g.stroke(); g.restore();
      // far legs (darker), then body, then near legs; gallop: back and front pairs swing opposite
      const P = (u, bx) => K.air ? (bx < 0 ? [bx - 80, -40] : [bx + 90, -50]) : (() => { const [sx, sy] = step(u); return [bx + sx, sy]; })();
      const fb = P(cyc + .08, -150), ff = P(cyc + .58, 120);   // gallop: back legs land together, then the front pair
      leg(-150, -230, fb[0], fb[1], 1, 1); leg(115, -230, ff[0], ff[1], 0, 1);
      g.beginPath(); g.moveTo(-250, -260); g.bezierCurveTo(-260, -360, -120, -380, 40, -370); g.bezierCurveTo(190, -360, 220, -250, 170, -175); g.bezierCurveTo(120, -130, -170, -125, -235, -175); g.closePath(); F(fur(-380, -130));
      g.save(); g.clip(); g.fillStyle = STR; [[-160, -360, .35], [-70, -372, .2], [20, -370, .05]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, 26, 70, r, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(255,240,220,.55)'; g.beginPath(); g.ellipse(-20, -150, 170, 34, 0, 0, 7); g.fill(); g.restore();
      const nb = P(cyc, -130), nf = P(cyc + .5, 135);   // near pair (just ahead of the far pair)
      leg(-130, -215, nb[0], nb[1], 1, 0); leg(135, -220, nf[0], nf[1], 0, 0);
    }
    const hx = K.sit ? 40 : 220, hy = K.sit ? -400 : -380; headAt(g, hx, hy, K.sit ? 'sit' : 'run', G, F, fur);
    g.restore(); g.restore(); };
  return K; })();
window.__cat = CAT;
function overheat() { hero.heat = 1; hero.oh = OH_TIME; hero.thrust = false; tone(1500, .45, 'square', .035, .3, MIX && MIX.fx); tone(160, .4, 'sawtooth', .05, .5, MIX && MIX.fx); shake = Math.max(shake, .1);
  pops.push({ x: hero.x + 10, y: hero.y - 80, txt: 'OVERHEAT!', col: '#ff6a3a', t: 0 }); for (let i = 0; i < 16; i++) { const nz = nozzle(); steam.push({ x: nz[0], y: nz[1] - 20, vx: (Math.random() - .5) * 160, vy: -Math.random() * 160, r: 4 + Math.random() * 4, l: .7, l0: .8 }); } }
function steamDash() { if (state !== 'play' || hero.dead || veh || boost || dashCD > 0 || paused || REVEAL || (FM && FM.ph)) return;
  hero.dashT = .3; dashCD = DASH_CD; hero.threaded = 0; hero.vy = 0; speedKick = Math.max(speedKick, 150); shake = Math.max(shake, .06); RUN.dash = (RUN.dash || 0) + 1;
  SFX.whoosh(); tone(240, .25, 'sawtooth', .06, 2.2, MIX && MIX.fx);
  for (let i = 0; i < 18; i++) { const nz = nozzle(); steam.push({ x: nz[0] - 10, y: nz[1] - 10 + (Math.random() - .5) * 20, vx: -260 - Math.random() * 200, vy: (Math.random() - .5) * 60, r: 3 + Math.random() * 4, l: .45, l0: .55 }); } }
function nearMiss(x, y) { nearMult = Math.min(5, nearMult + 1); nearT = 3; speedKick = Math.max(speedKick, 90); RUN.near = (RUN.near || 0) + 1;
  tone(700 + nearMult * 120, .12, 'square', .04, 1.5, MIX && MIX.fx); pops.push({ x: hero.x + 30, y: hero.y - 70, txt: 'CLOSE! x' + nearMult, col: '#7fe3ff', t: 0 }); SMT = .2; flashT = Math.max(flashT, .05); flashCol = '170,235,255';
  for (let i = 0; i < 8; i++) sparks.push({ x, y, vx: (Math.random() - .5) * 160, vy: (Math.random() - .5) * 160, l: .3, c: i % 2 ? '#7fe3ff' : '#ffffff' }); }
function skillTick(dt) {
  dashCD = Math.max(0, dashCD - dt); speedKick = Math.max(0, speedKick - 110 * dt);
  if (nearT > 0) { nearT -= dt; if (nearT <= 0) nearMult = 1; }
  if (hero.dashT > 0) { hero.dashT -= dt; hero.dashOff += (110 - hero.dashOff) * Math.min(1, dt * 14);
    if (Math.random() < dt * 60) speedLines.push({ y: hero.y - 10 - Math.random() * 50, l: .25 });
    if (hero.dashT <= 0 && hero.threaded) { coins += 5; $('coins').textContent = '£' + coins; nearMult = Math.min(5, nearMult + 1); nearT = 3; pops.push({ x: hero.x + 20, y: hero.y - 90, txt: 'THREADED! +£5', col: '#ffd21f', t: 0 }); tone(990, .2, 'square', .05, 1.6, MIX && MIX.fx); } }
  else hero.dashOff += (0 - hero.dashOff) * Math.min(1, dt * 1.6);
  if (state === 'play' && !hero.dead) hero.x = W * .28 + hero.dashOff;
  speedLines.forEach(l => l.l -= dt); while (speedLines.length && speedLines[0].l <= 0) speedLines.shift();
}
let speedLines = [];
function die(why) {
  if (boost && !boost.out) return;
  if (veh && veh.k === 'mech' && veh.su < 1.05) return;   // can't be hit while the suit is building round him
  if (hero.dashT > 0 && !veh) { hero.threaded = 1; return; }   // a steam dash goes straight through
  if (hero.dead || inv > 0) return; if (window.__god) { window.__hits = (window.__hits || 0) + 1; window.__hitW = why; return; }
  if (veh && veh.k === 'tuktuk' && veh.nb > .4) { inv = .35; shake = .2; flashT = .08; flashCol = '255,220,120'; SFX.boom(); pops.push({ x: hero.x + 20, y: hero.y - 90, txt: 'SMASH!', col: '#ffd21f', t: 0 }); for (let i = 0; i < 18; i++) sparks.push({ x: hero.x + 30, y: hero.y - 30, vx: Math.random() * 260, vy: (Math.random() - .5) * 260, l: .5, c: ['#ffd75a', '#ffffff', '#ff9a2a'][i % 3] }); return; }
  if (veh) { vehCrash(); return; }
  POL.died(why); hero.dead = true; hero.vx = speed; hero.vy = -140; hero.flail = 0; hero.squash = 0; hero.bounce = 0; hero.slide = 0; hero.restT = 0; deadT = 0; state = 'dead'; holding = false;
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
  else if (state === 'play') speed = Math.min(300, 150 + dist * .012) + speedKick;
  else if (state === 'dead') speed = hero.shockT > 0 ? speed * Math.pow(.25, dt) : Math.max(0, speed - (hero.slide ? 75 : 30) * dt);
  else if (state === 'menu') speed = 55;
  if (state === 'play' && veh && veh.nb) speed *= 1 + .8 * veh.nb;   // tuk-tuk nitro
  const dx = speed * dt; if (state !== 'menu') dist += dx;

  // scroll the world
  street.forEach(b => { b.x -= dx; if (!b.past && b.kind === 'lm' && MOSQUE_K.includes(b.key) && b.x + b.w < hero.x && state === 'play') { b.past = 1; passed++; } }); while (street.length && street[0].x + street[0].w + 40 < -20) street.shift(); fillStreet();
  skyline.forEach(b => b.x -= dx * .32); while (skyline.length && skyline[0].x + skyline[0].w < -50) skyline.shift(); fillSkyline();
  updateTraffic(dt, dx); convoyTick(dt); MYCAR.tick(dt);

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
  skillTick(dt); CAT.tick(dt); hornTick(dt); wreckTick(dt); POL.tick(dt);
  if (boost) boostUpdate(dt);
  if (playing && !hero.dead && boost && !boost.out) { /* riding on the Corolla roof */ }
  else if (playing && !hero.dead && veh) vehUpdate(dt);
  else if (playing && !hero.dead) {
    hero.thrust = holding && state === 'play' && hero.oh <= 0 && hero.dashT <= 0;
    if (hero.dashT > 0) hero.vy = 0;   // the dash goes dead straight
    if (hero.thrust) { hero.heat += dt / HEAT_UP; if (hero.heat >= 1) overheat(); }
    else if (hero.oh > 0) { hero.oh -= dt; if (Math.random() < dt * 30) { const nz = nozzle(); steam.push({ x: nz[0] - 4, y: nz[1] - 30, vx: -30 - Math.random() * 40, vy: -60 - Math.random() * 60, r: 3 + Math.random() * 3, l: .5, l0: .6 }); } if (hero.oh <= 0) hero.heat = .55; }
    else hero.heat = Math.max(0, hero.heat - dt / HEAT_DOWN);
    if (hero.thrust) { if (!hero.wasThrust) { if (hero.ground) hero.sq = -.55; hero.vy = Math.min(hero.vy, -90); for (let i = 0; i < 8; i++) { const nz = nozzle(); steam.push({ x: nz[0], y: nz[1], vx: -speed * .3 - 40 - Math.random() * 60, vy: 120 + Math.random() * 120, r: 3 + Math.random() * 2.5, l: .45, l0: .6 }); } } hero.vy -= 1900 * dt; hero.ground = false; if (hissG && sndOn) hissG.gain.setTargetAtTime(.03, AC.currentTime, .03); /* jetpack hiss 30% then another 15% quieter (owner 22 Nov) */ }
    else if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
    hero.wasThrust = hero.thrust; hero.vy += (hasG('chappal') ? 1150 : 820) * dt; hero.vy = Math.max(-300, Math.min(hasG('chappal') ? 540 : 420, hero.vy)); hero.y += hero.vy * dt;
    if (hero.y >= FLOOR) { if (!hero.ground && hero.vy > 120) { hero.landT = .14; hero.sq = Math.min(1, hero.vy / 420); for (let i = 0; i < 6; i++) steam.push({ x: hero.x - 10 * HS, y: hero.y - 16 * HS, vx: (Math.random() - .5) * 140, vy: -10 - Math.random() * 30, r: 2 + Math.random() * 2, l: .35, l0: .45 }); tone(180, .08, 'triangle', .08); for (let i = 0; i < 6; i++) dust.push({ x: hero.x + (Math.random() - .5) * 20, y: FLOOR, vx: (Math.random() - .5) * 120, vy: -Math.random() * 30, r: 2, l: .45 }); npcs.forEach(p => { if (!p.esc && p.fall <= 0 && Math.abs(p.x - hero.x) < 150) { p.flee = 1.6 + Math.random() * .8; p.dir = p.x > hero.x ? 1 : -1; } }); } hero.y = FLOOR; hero.vy = 0; hero.ground = true; }
    if (hero.y - HH < CEIL) { hero.y = CEIL + HH; hero.vy = Math.max(0, hero.vy); }
    hero.landT -= dt; hero.run += dt * (6 + speed / 22);
    hero.rot += ((hero.ground ? 0 : Math.max(-.3, Math.min(.3, hero.vy / 1000))) - hero.rot) * Math.min(1, dt * 8);   // owner 23 Nov: leans back climbing, forward dropping
    // steam out of the nozzle
    const nz = nozzle();
    if (hero.thrust && Math.random() < .6) steam.push({ x: nz[0] + (Math.random() - .5) * 3, y: nz[1] + 20, vx: -speed * .35 - 30 - Math.random() * 40, vy: 120 + Math.random() * 80, r: 2.5 + Math.random() * 2, l: .45 + Math.random() * .3, l0: .75 });
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
    if (hero.slide && speed <= 2) { hero.restT = (hero.restT || 0) + dt; if (hero.restT > .7 && $('over').classList.contains('hide') && $('eidiBox').classList.contains('hide') && !(window.TIN && TIN.busy)) endRun(); }
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
      if (o.warn > 0) { o.warn -= dt; if (!o.fixY) o.y += (Math.max(CEIL + 12, Math.min(FLOOR - 12, hero.y - 30 + (o.off || 0))) - o.y) * Math.min(1, dt * 3); panicT = .3; if ((o.warn * 6 | 0) !== ((o.warn + dt) * 6 | 0)) SFX.warn(); if (o.warn <= 0) { o.lock = .45; } }
      else if (o.lock > 0) { o.lock -= dt; panicT = .3; if (o.lock <= 0) { o.v = speed + 360; SFX.whoosh(); } }
      else { o.x -= o.v * dt; if (o.defl) { o.y += o.vy * dt; o.vy += (o.dud ? 1100 : 240) * dt; o.rot += o.spin * dt; if (o.dud && o.y > FLOOR - 8) rocketPop(o); } o.tr = o.tr || []; o.trT = (o.trT || 0) + dt; if (o.trT > .018) { o.trT = 0; o.tr.push({ x: o.x + 22, y: o.y + (Math.random() - .5) * 2, a: 0, r: 2 + Math.random() * 1.5 }); } o.tr.forEach(p => { p.a += dt; p.r += dt * 9; p.y -= dt * 4; }); while (o.tr.length && o.tr[0].a > 1.1) o.tr.shift(); }
    }
    if (!hero.dead && state === 'play' && !(boost && !boost.out)) {   // near misses: how close each hazard came while it was passing
      const hc = heroCircles(); let d = 99;
      if (o.type === 'zap') { const ax = o.x - Math.cos(o.ang) * o.len / 2, ay = o.y - Math.sin(o.ang) * o.len / 2, bx = o.x + Math.cos(o.ang) * o.len / 2, by = o.y + Math.sin(o.ang) * o.len / 2; hc.forEach(([x, y, r]) => d = Math.min(d, segDist(x, y, ax, ay, bx, by) - r)); }
      else if (o.type === 'rocket' && o.v && !o.defl) hc.forEach(([x, y, r]) => d = Math.min(d, Math.hypot(x - o.x, y - o.y) - r));
      else if (o.type === 'laser' && o.ph === 'fire') hc.forEach(([x, y, r]) => d = Math.min(d, Math.abs(y - o.y) - r));
      if (d < 99) o.nm = Math.min(o.nm == null ? 99 : o.nm, d);
      const gone = o.type === 'zap' ? o.x + Math.abs(Math.cos(o.ang)) * o.len / 2 < hero.x - 24 : o.type === 'rocket' ? o.x < hero.x - 40 : o.type === 'laser' && o.ph === 'out';
      if (gone && !o.nmd) { o.nmd = 1; if (o.nm != null && o.nm > 0 && o.nm < 16 && hero.dashT <= 0) nearMiss(hero.x + 10, hero.y - 30); }
    }
    if (!hero.dead && (state === 'play')) {
      const hc = heroCircles();
      if (o.type === 'zap') { const ax = o.x - Math.cos(o.ang) * o.len / 2, ay = o.y - Math.sin(o.ang) * o.len / 2, bx = o.x + Math.cos(o.ang) * o.len / 2, by = o.y + Math.sin(o.ang) * o.len / 2;
        if (hc.some(([x, y, r]) => segDist(x, y, ax, ay, bx, by) < r + 1.5)) { if (mechArmour()) mechShock(o.x, o.y); else if (veh && veh.k === 'logman' && veh.morph >= 1) logZap(o); else die('zap'); } }
      if (o.type === 'rocket' && o.v && !o.defl && mechShieldUp() && o.x < hero.x + 112 * MCH && o.x > hero.x && Math.abs(o.y - (hero.y - 90 * MCH)) < 98 * MCH) { mechDeflect(o); shieldBlock(o.x, o.y); }   // hits the shield first
      if (o.type === 'rocket' && o.v && !o.defl && hc.some(([x, y, r]) => Math.hypot(x - o.x, y - o.y) < r + 4)) { if (mechShieldUp()) mechDeflect(o); else die('rocket'); }
      if (o.type === 'laser' && o.ph === 'fire' && hc.some(([x, y, r]) => Math.abs(y - o.y) < r + 2.5)) { if (veh && veh.k === 'tuktuk') { tukLaser(o); } else if (mechShieldUp()) { if (Math.random() < .3) shieldBlock(hero.x + 98 * MCH, o.y); veh.shHit = Math.max(veh.shHit || 0, .6); } else die('laser'); }
    }
  });
  obs = obs.filter(o => o.x > -200 && !(o.defl && (o.x > W + 200 || o.y < -160 || o.y > VH + 100)));
  if (state === 'play' || state === 'intro') giftsUpdate(dt, dx);
  rings.forEach(r => r.t += dt); rings = rings.filter(r => r.t < .6);
  pops.forEach(p => { p.t += dt; p.y -= 18 * dt; }); pops = pops.filter(p => p.t < 1.1);
  dust.forEach(p => { p.x += p.vx * dt - dx; p.y += p.vy * dt; p.vy += 60 * dt; p.r += dt * 9; p.l -= dt; }); dust = dust.filter(p => p.l > 0);
  if (flashT > 0) flashT -= dt; if (shake > 0) shake -= dt; if (banner) { banner.t += dt; if (banner.t > 1.8) banner = null; }
  // coins
  coinList.forEach(c => { c.x -= dx;
    if (!c.got && !hero.dead && state === 'play' && (hasG('tin') || (veh && (veh.k === 'kabootar' || veh.nb > .3 || (veh.k === 'mech' && veh.su >= 1))) || boost)) { const hx = hero.x + (veh && veh.k === 'mech' ? 30 * MCH : 4), hy = hero.y - (veh && veh.k === 'kabootar' ? 44 : veh && veh.k === 'mech' ? 100 * MCH : veh ? 36 : 24), d = Math.hypot(hx - c.x, hy - c.y); if (d < (boost ? 260 : 170) || c.mag) { c.mag = 1; const k = Math.min(1, dt * 9); c.x += (hx - c.x) * k; c.y += (hy - c.y) * k; } }
    if (!c.got && !hero.dead && state === 'play') { const hc = heroCircles(); if (hc.some(([x, y, r]) => Math.hypot(x - c.x, y - c.y) < r + COIN_R + 2)) { c.got = 1; coins += nearMult * (c.j ? 3 : 1); if (c.j) jalebiPop(c); if (veh && veh.k === 'tuktuk') veh.fuel = Math.min(1, veh.fuel + .04); lastCoin = dist; POL.coin(c); } } });
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
  ['dodge15', 'Dodge 15 hazards in one run', 'dodged', 15, 1], ['masjid2', 'Fly past 2 other masjids in one run', 'masjids', 2, 1], ['carpet', 'Ride the magic carpet', 'carpet', 1, 0], ['kabootar', 'Hold on to Flappy Kabootar', 'kabootar', 1, 0], ['mech', 'Suit up in the Hoover Mech', 'mech', 1, 0], ['stomp3', 'Stomp 3 people over in the Hoover Mech in one run', 'stomped', 3, 1], ['deflect3', 'Block 3 rockets with the Hoover Mech shield in one run', 'deflect', 3, 1], ['shop1', 'Buy something in the shop', 'bought', 1, 0],
  ['eidi2', 'Grab 2 Eidi envelopes in one run', 'eidi', 2, 1], ['slide50', 'Slide 50m on your face in total', 'slide', 50, 0], ['ground200', 'Run 200m along the pavement in one run', 'groundm', 200, 1],
  ['steam10', 'Steam 10 people in one run', 'steamed', 10, 1], ['run1000', 'Fly 1,000m in one run', 'dist', 1000, 1], ['nocoin300', 'Fly 300m without grabbing a £1', 'nocoin', 300, 1],
  ['jump5', 'Jump 5 times in the tuk-tuk in one run', 'jumps', 5, 1], ['flip10', 'Flip gravity 10 times in one run', 'flips', 10, 1], ['hs1', 'Use a head start', 'hs', 1, 0], ['flap15', 'Flap Flappy Kabootar 15 times in one run', 'flaps', 15, 1], ['laser5', 'Survive 5 speed-camera lasers in one run', 'lasers', 5, 1], ['bank1000', 'Collect £1,000 in total', 'coinsT', 1000, 0],
  ['coins150', 'Collect £150 in one run', 'coins', 150, 1], ['steam25', 'Steam 25 people in one run', 'steamed', 25, 1], ['run2000', 'Fly 2,000m in one run', 'dist', 2000, 1],
  ['cheer20', 'Make 20 people cheer in one run', 'cheer', 20, 1], ['games25', 'Play 25 games', 'games', 25, 0], ['slide300', 'Slide 300m on your face in total', 'slide', 300, 0],
];
const RANKS = ['Beginner', 'Learner', 'Regular', 'Front Row', 'Early Bird', 'Back Row Legend', 'Imam\'s Favourite', 'Jummah Legend'];
let RUN = null, lastCoin = 0, mtQueue = [], mtT = 0;
function newRun() { return { flaps: 0, flips: 0, hs: 0, kabootar: 0, sandals: 0, dist: 0, coins: 0, steamed: 0, cheer: 0, dodged: 0, masjids: 0, eidi: 0, jumps: 0, groundm: 0, nocoin: 0, lasers: 0, tuktuk: 0, carpet: 0, slide: 0, mech: 0, stomped: 0, deflect: 0 }; }
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
  else if (mtQueue.length) { $('mtTxt').textContent = mtQueue.shift(); el.classList.add('on'); mtT = 2.6; setTimeout(() => POL.missionStar(), 900); }
}
function missionsEndRun() {   // bank running totals, award stars, swap finished missions for new ones, rank up every 3 stars
  MS.prog.games = (MS.prog.games || 0) + 1; MS.prog.coinsT = (MS.prog.coinsT || 0) + coins;
  ['slide', 'tuktuk', 'carpet', 'kabootar', 'sandals', 'mech', 'hs'].forEach(k => MS.prog[k] = (MS.prog[k] || 0) + (RUN[k] || 0));
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
  if (state === 'play' && !FM) runT += dt;
  if (FIRSTRUN && !firstBox && state === 'play' && !veh && !boost && runT >= 8.5) { firstBox = 1; gifts.push({ k: 'box', ride: 'tuktuk', x: W + 40, y: FLOOR - 52, b: 0 }); obs = obs.filter(o => o.type !== 'rocket' && o.type !== 'laser'); nextGift = 2600 + Math.random() * 1800; }   // owner 23 Nov: new players get the tuk-tuk early, low and easy
  if (FIRSTRUN && veh && veh.k === 'tuktuk' && veh.asm >= 1 && !RUN.hornLesson) { RUN.hornLesson = 1; setTimeout(() => { if (!veh || veh.k !== 'tuktuk' || state !== 'play') return; obs.push({ type: 'zap', x: W + 70, y: FLOOR - 75, len: 120, ang: Math.PI / 2, spin: 0, seed: 7, lesson: 1 }); pops.push({ x: hero.x + 60, y: hero.y - 130, txt: 'HIT HORN TO BREAK IT!', col: '#ffd21f', t: 0 }); const hb = $('bHorn'); hb && hb.classList.add('teach'); setTimeout(() => hb && hb.classList.remove('teach'), 3500); }, 1300); }
  if (!FKDEMO && !MECHDEMO && !RIDEDEMO && !firstBox && state === 'play' && !veh && !boost && runT >= 20) { firstBox = 1; gifts.push({ k: 'box', ride: (() => { let k = nextRide(); for (let n = 0; n < 4 && k === lastBoxRide; n++) k = nextRide(); return lastBoxRide = k; })(), x: W + 40, y: CEIL + 90 + Math.random() * (FLOOR - CEIL - 200), b: 0 }); nextGift = 2600 + Math.random() * 1800; }
  if (state === 'play' && !veh && !boost) { nextGift -= dx; if (nextGift <= 0) { const rr = () => { let k = nextRide(); for (let i = 0; i < 4 && k === lastBoxRide; i++) k = nextRide(); return lastBoxRide = k; }; gifts.push({ k: 'box', ride: RIDEDEMO ? rideDemoNext() : MECHDEMO ? 'mech' : FKDEMO ? 'kabootar' : rr(), x: W + 40, y: CEIL + 80 + Math.random() * (FLOOR - CEIL - 180), b: Math.random() * 6 }); nextGift = RIDEDEMO ? 900 + Math.random() * 500 : MECHDEMO ? 2400 + Math.random() * 1200 : FKDEMO ? 700 + Math.random() * 300 : (2600 + Math.random() * 1800) * (hasG('dates') ? .5 : 1); } }
  if (state === 'play') { nextTin -= dx; if (nextTin <= 0) { gifts.push({ k: 'btin', x: W + 30, y: CEIL + 60 + Math.random() * (FLOOR - CEIL - 140), b: Math.random() * 6 }); nextTin = TINDEMO ? 900 + Math.random() * 500 : 7000 + Math.random() * 5000; } }
  if (state === 'play') { nextEidi -= dx; if (nextEidi <= 0) { gifts.push({ k: 'eidi', x: W + 30, y: CEIL + 50 + Math.random() * (FLOOR - CEIL - 120), b: Math.random() * 6 }); nextEidi = (2200 + Math.random() * 2400) * (hasG('envelope') ? .5 : 1); } }
  gifts.forEach(gf => { gf.x -= dx; gf.b += dt;
    if (gf.k === 'btin') { if (gf.y0 === undefined) gf.y0 = gf.y; gf.x += dx * (gf.k === 'btin' ? .45 : .3); const A = gf.k === 'btin' ? 80 : 50; gf.y = Math.max(CEIL + 40, Math.min(FLOOR - 50, gf.y0 + Math.sin(gf.b * (gf.k === 'btin' ? 2.1 : 1.7)) * A)); }
    if (gf.k === 'btin') { gf.tr = gf.tr || []; gf.tr.unshift([gf.x, gf.y + Math.sin(gf.b * 3) * 4]); if (gf.tr.length > 9) gf.tr.pop(); }
    if (!gf.got && !hero.dead && state === 'play' && heroCircles().some(([x, y, r]) => Math.hypot(x - gf.x, y - gf.y) < r + (gf.k === 'box' ? 26 : gf.k === 'btin' ? 18 : 13))) {
      gf.got = 1;
      if (gf.k === 'box') { const rk = gf.ride || nextRide(); let seen = []; try { seen = JSON.parse(localStorage.getItem('jd_seenRides') || '[]'); } catch (e) {}
        if (seen.includes(rk) && rk !== 'kabootar') quickRide(rk); else { if (!seen.includes(rk)) { seen.push(rk); try { localStorage.setItem('jd_seenRides', JSON.stringify(seen)); } catch (e) {} } startReveal(rk); } }
      else if (gf.k === 'btin') { btins++; tinHud(false, btins - 1); $('tinHud').style.display = 'flex'; tinFly.push({ x: gf.x, y: gf.y, t: 0 }); pops.push({ x: gf.x, y: gf.y - 16, txt: "AMMI'S TIN!", col: '#7fb6ff', t: 0 }); tone(330, .08, 'square', .06); setTimeout(() => tone(240, .1, 'square', .05), 70); for (let i = 0; i < 10; i++) sparks.push({ x: gf.x, y: gf.y, vx: (Math.random() - .5) * 140, vy: (Math.random() - .5) * 140, l: .4, c: i % 2 ? '#ffd75a' : '#7fb6ff' }); }
      else { eidi++; RUN.eidi++; pops.push({ x: gf.x, y: gf.y - 12, txt: 'EIDI!', col: '#7dffa0', t: 0 }); tone(988, .1, 'square', .05); setTimeout(() => tone(1318, .16, 'square', .05), 90); for (let i = 0; i < 10; i++) sparks.push({ x: gf.x, y: gf.y, vx: (Math.random() - .5) * 140, vy: (Math.random() - .5) * 140, l: .4, c: i % 2 ? '#ffd75a' : '#7dffa0' }); }
    } });
  gifts = gifts.filter(gf => gf.x > -40 && !gf.got);
}
function drawGift(gf) {
  const y = gf.k === 'box' ? gf.y : gf.y + Math.sin(gf.b * 3) * 4;   // power-up tokens stay put (fixed to the street, like JJ); only the tin floats
  ctx.save(); ctx.translate(gf.x, y);
  if (gf.k === 'btin') {   // owner 23 Nov: no ring: the tin just floats with a soft shiny glow round it and a motion trail behind it
    ctx.restore();
    // owner 23 Nov: motion lines behind the tin, alive: each one stretches and shrinks on its own beat and bends along the path the tin
    // has just floated through (so they curve up and down with the wave), with little speed dashes peeling off the ends
    { const Yat = bb => (gf.y0 === undefined ? gf.y : Math.max(CEIL + 40, Math.min(FLOOR - 50, gf.y0 + Math.sin(bb * 2.1) * 80))) + Math.sin(bb * 3) * 4, V = 230;
      ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,210,90,.9)'; ctx.shadowBlur = 6;
      [[-13, .55, 0, 4.1], [-5, .9, 1.7, 5.3], [3, 1, 3.1, 4.6], [11, .6, 4.4, 6.1]].forEach(([o, a2, ph, sp], li) => {
        const pul = .5 + .5 * Math.sin(gf.b * sp + ph), L = 18 + 46 * pul, N = 8, pts = [];
        for (let k = 0; k <= N; k++) { const d = L * k / N; pts.push([gf.x - 16 - d, Yat(gf.b - d / V) - 5 + o * (1 - .25 * k / N)]); }
        ctx.lineWidth = 2.2 + pul * 1.6;
        const g2 = ctx.createLinearGradient(pts[0][0], 0, pts[N][0], 0); g2.addColorStop(0, `rgba(255,250,225,${.95 * a2})`); g2.addColorStop(1, 'rgba(255,240,190,0)');
        ctx.strokeStyle = g2; ctx.beginPath(); pts.forEach(([px, py], k) => k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
        const f = ((gf.b * (1.3 + li * .25) + ph) % 1), dd = L + 6 + f * 34, dl = 6 + 8 * (1 - f);   // a speed dash drifting off behind it
        const x1 = gf.x - 16 - dd, y1 = Yat(gf.b - dd / V) - 5 + o * .75, y2 = Yat(gf.b - (dd + dl) / V) - 5 + o * .75;
        ctx.globalAlpha = (1 - f) * .7 * a2; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,246,210,1)'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - dl, y2); ctx.stroke(); ctx.globalAlpha = 1; });
      ctx.restore(); }
    ctx.save(); ctx.translate(gf.x, y); ctx.rotate(Math.sin(gf.b * 2.2) * .12);
    const pu = .8 + Math.sin(gf.b * 4) * .2;
    { const hl = ctx.createRadialGradient(0, -5, 6, 0, -5, 30); hl.addColorStop(0, `rgba(255,232,150,${.45 * pu})`); hl.addColorStop(1, 'rgba(255,232,150,0)'); ctx.fillStyle = hl; ctx.beginPath(); ctx.ellipse(0, -5, 30, 26, 0, 0, 7); ctx.fill(); }
    ctx.save(); ctx.shadowColor = `rgba(255,224,120,${.95 * pu})`; ctx.shadowBlur = 16; window.TIN && TIN.mini(ctx, 0, -5, 15); ctx.shadowBlur = 7; ctx.shadowColor = 'rgba(255,250,220,.9)'; window.TIN && TIN.mini(ctx, 0, -5, 15); ctx.restore();   // shiny glow hugging the tin
    const sw = (gf.b * .9) % 1.6 - .3; if (sw < 1 && window.TIN) {   // owner 23 Nov: the shine only runs over the round tin itself (masked to the tin's own pixels)
      if (!TINSH) { TINSH = document.createElement('canvas'); TINSH.width = TINSH.height = 192; TINSHX = TINSH.getContext('2d'); }
      const q = TINSHX; q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, 192, 192); q.setTransform(3, 0, 0, 3, 96, 96); TIN.mini(q, 0, -5, 15);
      q.globalCompositeOperation = 'source-in'; const xs = -24 + sw * 48, lg = q.createLinearGradient(xs - 10, 0, xs + 10, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,255,255,.75)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      q.fillStyle = lg; q.beginPath(); q.moveTo(xs + 2, -32); q.lineTo(xs + 14, -32); q.lineTo(xs - 2, 22); q.lineTo(xs - 14, 22); q.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(TINSH, -32, -32, 64, 64); ctx.restore(); }
    for (let i = 0; i < 2; i++) { const ph = (gf.b * 1.4 + i * .5) % 1, sz = Math.sin(ph * Math.PI) * 3.5, px = i ? 13 : -12, py = i ? -16 : 2; if (sz > .3) { ctx.fillStyle = '#fffbe6'; ctx.beginPath(); ctx.moveTo(px, py - sz * 2); ctx.lineTo(px + sz * .5, py); ctx.lineTo(px, py + sz * 2); ctx.lineTo(px - sz * .5, py); ctx.closePath(); ctx.moveTo(px - sz * 2, py); ctx.lineTo(px, py + sz * .5); ctx.lineTo(px + sz * 2, py); ctx.lineTo(px, py - sz * .5); ctx.fill(); } }   // twinkles on its edge
    ctx.restore(); return; }
  const gl = ctx.createRadialGradient(0, 0, 2, 0, 0, 24); gl.addColorStop(0, gf.k === 'box' ? 'rgba(255,255,255,.55)' : 'rgba(255,230,120,.5)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill();
  if (gf.k === 'box') {   // owner 22 Nov: JJ-style ride token: a big glowing tile showing the ride inside, its name beside it, target brackets
    const S = 30;   // owner 23 Nov: a shiny 3D app icon: chrome metal edge, SMR Digital gradient behind the ride, spinning round like JJ's tokens
    const hal = ctx.createRadialGradient(0, 0, 8, 0, 0, 48); hal.addColorStop(0, 'rgba(170,120,255,.45)'); hal.addColorStop(1, 'rgba(255,90,180,0)'); ctx.fillStyle = hal; ctx.beginPath(); ctx.arc(0, 0, 48, 0, 7); ctx.fill();
    // owner 23 Nov: holographic see-through face (SMR Digital blue -> violet -> pink) inside a clean polished metal rim, turning round like a coin
    const ang = gf.b * 2.2, cs = Math.cos(ang), sn = Math.sin(ang), sxk = Math.max(.06, Math.abs(cs)), R = S + 4, RR = 11;
    const rimG = (dark) => { const g2 = ctx.createLinearGradient(0, -R, 0, R); if (dark) { g2.addColorStop(0, '#9aa2b0'); g2.addColorStop(.5, '#5d6573'); g2.addColorStop(1, '#8a92a0'); }
      else { g2.addColorStop(0, '#ffffff'); g2.addColorStop(.18, '#c9cfd9'); g2.addColorStop(.45, '#f4f6fa'); g2.addColorStop(.62, '#8c94a3'); g2.addColorStop(.85, '#e6e9ef'); g2.addColorStop(1, '#a7aebb'); } return g2; };
    // thickness: the rim repeated a few times behind the front as it turns, so it reads as a solid metal edge (no separate side panel)
    const TH = 7 * Math.abs(sn), N = Math.ceil(TH / 1.2), sd = (sn >= 0 ? 1 : -1) * (cs >= 0 ? 1 : -1);
    for (let k = N; k >= 1; k--) { ctx.save(); ctx.translate(sd * TH * k / N, 0); ctx.scale(sxk, 1); ctx.strokeStyle = rimG(1); ctx.lineWidth = 5; roundRect(-R + 2.5, -R + 2.5, R * 2 - 5, R * 2 - 5, RR - 1); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.scale(sxk, 1);
    // hologram face: see-through gradient with moving rainbow bands and fine scan lines
    ctx.save(); roundRect(-S, -S, S * 2, S * 2, 8); ctx.clip();
    { const fg = ctx.createLinearGradient(-S, -S, S, S); fg.addColorStop(0, 'rgba(70,140,255,.62)'); fg.addColorStop(.5, 'rgba(140,80,255,.55)'); fg.addColorStop(1, 'rgba(255,70,170,.62)'); ctx.fillStyle = fg; ctx.fillRect(-S, -S, S * 2, S * 2);
      const sh = ((gf.b * .35 + sn * .25) % 1 + 1) % 1, hg = ctx.createLinearGradient(-S * 2, -S, S * 2, S); [0, .14, .28, .42].forEach((o, n) => { const p = (sh + o) % 1; hg.addColorStop(Math.max(0, p - .05), 'rgba(255,255,255,0)'); hg.addColorStop(p, ['rgba(120,255,240,.28)', 'rgba(255,255,255,.3)', 'rgba(255,150,240,.28)', 'rgba(160,200,255,.26)'][n]); hg.addColorStop(Math.min(1, p + .05), 'rgba(255,255,255,0)'); });
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hg; ctx.fillRect(-S, -S, S * 2, S * 2); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255,255,255,.07)'; for (let yy = -S; yy < S; yy += 3) ctx.fillRect(-S, yy, S * 2, 1); }
    { const ic = rideIcon(gf.ride); if (ic) { ctx.imageSmoothingQuality = 'high'; ctx.shadowColor = 'rgba(200,150,255,.8)'; ctx.shadowBlur = 8;
      if (gf.ride === 'kabootar') ctx.drawImage(ic, -S + 5, -S + 5, S * 2 - 10, S * 2 - 10); else ctx.drawImage(ic, -S + 3, -S + 3, S * 2 - 6, S * 2 - 6); ctx.shadowBlur = 0; ctx.imageSmoothingQuality = 'low'; } }
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(-S, -S); ctx.lineTo(S, -S); ctx.lineTo(S, -S * .2); ctx.quadraticCurveTo(0, -S * .05, -S, -S * .35); ctx.closePath(); ctx.fill();   // glass sheen
    ctx.restore();
    // polished metal rim
    ctx.lineWidth = 5.5; ctx.strokeStyle = rimG(0); roundRect(-R + 2.75, -R + 2.75, R * 2 - 5.5, R * 2 - 5.5, RR - 1); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(30,30,50,.55)'; roundRect(-R, -R, R * 2, R * 2, RR); ctx.stroke(); roundRect(-S - .3, -S - .3, S * 2 + .6, S * 2 + .6, 8); ctx.stroke();
    { const p = (sn + 1) / 2, lg = ctx.createLinearGradient(-R, -R, R, R); lg.addColorStop(Math.max(0, p - .12), 'rgba(255,255,255,0)'); lg.addColorStop(p, `rgba(255,255,255,${.85 * Math.abs(cs)})`); lg.addColorStop(Math.min(1, p + .12), 'rgba(255,255,255,0)');
      ctx.lineWidth = 3; ctx.strokeStyle = lg; roundRect(-R + 2.75, -R + 2.75, R * 2 - 5.5, R * 2 - 5.5, RR - 1); ctx.stroke(); }   // glint running round the rim as it turns
    ctx.restore();
    // target brackets round the tile
    ctx.strokeStyle = '#7dffa0'; ctx.lineWidth = 2; const B = S + 12, L = 8; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { ctx.beginPath(); ctx.moveTo(sx * B, sy * (B - L)); ctx.lineTo(sx * B, sy * B); ctx.lineTo(sx * (B - L), sy * B); ctx.stroke(); });
    // name beside it, like JJ's LIL STOMPER label
    const nm = (VEH_NAME[gf.ride] || 'RIDE').split(' '); ctx.font = '13px PS'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    nm.forEach((w, i) => { const yy = -S - 12 + (i - nm.length + 1) * 14; ctx.fillStyle = '#0b2a18'; ctx.fillText(w, -B - 3, yy + 1.5); ctx.fillStyle = '#7dffa0'; ctx.fillText(w, -B - 4, yy); });
    ctx.strokeStyle = 'rgba(125,255,160,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-B - 4, -S - 8); ctx.lineTo(-B + 2, -B + 4); ctx.stroke();
  } else {               // Eidi envelope: green with a gold crescent seal
    ctx.rotate(Math.sin(gf.b * 2.4) * .12);
    ctx.fillStyle = '#0f3d26'; roundRect(-12, -8.5, 24, 17, 3); ctx.fill(); ctx.fillStyle = '#1f8a4c'; roundRect(-11, -7.5, 22, 15, 2.5); ctx.fill();
    ctx.fillStyle = '#25a35a'; ctx.beginPath(); ctx.moveTo(-11, -7.5); ctx.lineTo(0, 2); ctx.lineTo(11, -7.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffd75a'; ctx.lineWidth = .8; ctx.strokeRect(-9.5, -6, 19, 12);
    ctx.fillStyle = '#ffd75a'; ctx.beginPath(); ctx.arc(0, 1.5, 3.4, 0, 7); ctx.fill(); ctx.fillStyle = '#1f8a4c'; ctx.beginPath(); ctx.arc(1.3, .8, 2.8, 0, 7); ctx.fill();
  }
  ctx.restore();
}
const BLANK_HERO = (() => { const c = document.createElement('canvas'); c.width = c.height = 2; return c; })();
const RIDE_ICON = {}, FK_ICON = img('art/fk-icon.png?h=6f7419c1df');
   // owner 23 Nov: zapper ends = his silver balls with the hole the beam comes out of (cut from his sheet)
const ZBR = 13;   // ball radius on screen
let ZBC = null;   // the silver ball, drawn once at 4x and reused
function zapBallArt() { const R = ZBR, S = 5, P = 6, c = document.createElement('canvas'); c.width = c.height = (R * 2 + P * 2) * S; const g = c.getContext('2d'); g.scale(S, S); g.translate(R + P, R + P);
  // owner 23 Nov: drawn for the game (not his picture): polished chrome ball reflecting the sky and street, with one "eye" the beam comes out of (faces +x)
  g.fillStyle = '#101216'; g.beginPath(); g.arc(0, 0, R + .9, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, R, 0, 7); g.clip();
  const env = g.createLinearGradient(0, -R, 0, R); env.addColorStop(0, '#f4f8ff'); env.addColorStop(.28, '#b9c8dc'); env.addColorStop(.46, '#59606c'); env.addColorStop(.52, '#2c3038'); env.addColorStop(.62, '#8a8f98'); env.addColorStop(.85, '#c9c3b8'); env.addColorStop(1, '#6d6a66');
  g.fillStyle = env; g.fillRect(-R, -R, R * 2, R * 2);   // chrome: sky on top, dark horizon line, the street below
  const sh = g.createRadialGradient(-R * .3, -R * .2, R * .2, 0, 0, R * 1.05); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.75, 'rgba(10,12,18,.15)'); sh.addColorStop(1, 'rgba(10,12,18,.65)'); g.fillStyle = sh; g.fillRect(-R, -R, R * 2, R * 2);   // roundness
  g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(-R * .38, -R * .5, R * .32, R * .16, -.5, 0, 7); g.fill();   // window highlight
  g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-R * .62, -R * .1, R * .08, R * .2, -.2, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .9; g.beginPath(); g.arc(0, 0, R - .8, Math.PI * .2, Math.PI * .65); g.stroke();   // rim light
  g.restore();
  g.strokeStyle = '#0b0c10'; g.lineWidth = .9; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); return c; }
function zapBall(x, y, ang, glow) {   // ang = way the hole faces
  if (!ZBC) ZBC = zapBallArt(); const R = ZBR, D = (R * 2 + 12);
  ctx.save(); ctx.translate(x, y); ctx.drawImage(ZBC, -D / 2, -D / 2, D, D); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.clip(); ctx.rotate(ang);   // the chrome keeps its lighting (sky on top); only the eye turns to face the other ball
  // the eye: a raised chrome collar, a dark iris ring and the socket the beam fires from
  const cl = ctx.createLinearGradient(R * .3, -R * .7, R * .95, R * .7); cl.addColorStop(0, '#ffffff'); cl.addColorStop(.4, '#9aa3b0'); cl.addColorStop(.7, '#4a505b'); cl.addColorStop(1, '#c4cad3'); ctx.fillStyle = cl; ctx.beginPath(); ctx.ellipse(R * .66, 0, R * .32, R * .66, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#1c1f25'; ctx.lineWidth = .55; ctx.stroke();
  ctx.fillStyle = '#17191e'; ctx.beginPath(); ctx.ellipse(R * .72, 0, R * .23, R * .5, 0, 0, 7); ctx.fill();

  const hx = R * .72, gl = Math.max(0, glow);
  const hole = ctx.createRadialGradient(hx, 0, 0, hx, 0, R * .5); hole.addColorStop(0, `rgba(255,255,235,${gl})`); hole.addColorStop(.35, `rgba(255,200,60,${gl})`); hole.addColorStop(1, `rgba(200,90,10,${.9 * gl})`);
  ctx.fillStyle = gl > .05 ? hole : '#3a2410'; ctx.beginPath(); ctx.ellipse(hx, 0, R * .2, R * .46, 0, 0, 7); ctx.fill();
  if (gl > .05) { ctx.fillStyle = `rgba(255,255,255,${gl})`; ctx.beginPath(); ctx.ellipse(hx + 1, 0, R * .07, R * .2, 0, 0, 7); ctx.fill(); ctx.strokeStyle = `rgba(255,150,20,${.9 * gl})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(hx, 0, R * .2, R * .46, 0, 0, 7); ctx.stroke(); }   // iris ring + white-hot pupil
  if (gl > .05) { ctx.globalCompositeOperation = 'lighter'; const hg = ctx.createRadialGradient(hx + 2, 0, 0, hx + 2, 0, 14); hg.addColorStop(0, `rgba(255,236,160,${.8 * gl})`); hg.addColorStop(.5, `rgba(255,170,40,${.35 * gl})`); hg.addColorStop(1, 'rgba(255,140,20,0)'); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx + 2, 0, 14, 0, 7); ctx.fill(); }
  ctx.restore(); }
function ballCrackle(x, y, ang, a) {   // little jagged arcs licking round the hole side only (the rest of the ball stays plain silver)
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = ctx.lineJoin = 'round';
  for (let k = 0; k < 2; k++) { const a0 = ang - .7 + Math.random() * 1.0, n = 4; ctx.beginPath(); for (let i = 0; i <= n; i++) { const b = a0 + i * .32, r = ZBR + 1 + Math.random() * 5; const px = x + Math.cos(b) * r, py = y + Math.sin(b) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.strokeStyle = `rgba(255,214,80,${.5 * a})`; ctx.lineWidth = 2.6; ctx.stroke(); ctx.strokeStyle = `rgba(255,255,230,${.9 * a})`; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.restore(); }
const CARPET_ICON = img('art/icon_carpet.webp?h=d79b0ad5d2');   // owner 23 Nov: his carpet render on the token (the drawn one looked like bacon)
function rideIcon(k) { if (k === 'carpet' && CARPET_ICON.complete && CARPET_ICON.naturalWidth) return CARPET_ICON; if (k === 'logman') return CARD.logman && CARD.logman.complete && CARD.logman.naturalWidth ? CARD.logman : null; if (RIDE_ICON[k]) return RIDE_ICON[k];
  if (k === 'kabootar') return FK_ICON.complete && FK_ICON.naturalWidth ? FK_ICON : null;   // the real Flappy Kabootar app icon
  const c = document.createElement('canvas'); c.width = c.height = 192; const g = c.getContext('2d'); g.scale(3, 3); g.lineJoin = g.lineCap = 'round'; g.lineWidth = 2; g.strokeStyle = '#1a1024';
  const lg = (y0, y1, stops) => { const q = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => q.addColorStop(o, col)); return q; };
  const shape = (f, fill) => { g.beginPath(); f(); g.fillStyle = fill; g.fill(); g.stroke(); };
  const shine = (f) => { g.save(); g.beginPath(); f(); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill(); g.restore(); };
  g.save(); g.fillStyle = 'rgba(0,30,80,.18)'; g.beginPath(); g.ellipse(32, 57, 21, 3.2, 0, 0, 7); g.fill(); g.restore();   // soft shadow under every icon
  if (k === 'tuktuk') {
    shape(() => { g.moveTo(11, 41); g.lineTo(11, 21); g.quadraticCurveTo(12, 10, 23, 9); g.lineTo(41, 9); g.quadraticCurveTo(50, 10, 52, 21); g.lineTo(55, 41); g.closePath(); }, lg(9, 41, [[0, '#3a3a44'], [1, '#121216']]));
    shine(() => { g.moveTo(15, 20); g.quadraticCurveTo(17, 13, 25, 12); g.lineTo(38, 12); g.lineTo(37, 15); g.lineTo(25, 15); g.quadraticCurveTo(19, 16, 17, 21); g.closePath(); });
    g.fillStyle = lg(14, 34, [[0, '#d9f3ff'], [1, '#7cc4ea']]); g.beginPath(); g.moveTo(44, 14); g.quadraticCurveTo(48, 16, 50, 34); g.lineTo(44, 34); g.closePath(); g.fill();
    g.fillStyle = '#5a3a2a'; g.fillRect(15, 15, 26, 19); g.fillStyle = '#e8a06a'; g.beginPath(); g.arc(30, 25, 5, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(30, 21.5, 5, Math.PI, 0); g.fill(); g.fillStyle = '#fff'; g.fillRect(25, 29, 10, 5);
    shape(() => { g.moveTo(8, 50); g.lineTo(8, 36); g.lineTo(46, 36); g.quadraticCurveTo(56, 38, 57, 46); g.lineTo(57, 50); g.closePath(); }, lg(36, 50, [[0, '#ffe680'], [.5, '#f7c51e'], [1, '#c48f00']]));
    g.fillStyle = '#141414'; g.fillRect(9, 42, 47, 3); shine(() => { g.rect(10, 37.5, 34, 2); });
    g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(54, 41, 2.2, 0, 7); g.fill();
    [17, 47].forEach(x => { g.fillStyle = '#141418'; g.beginPath(); g.arc(x, 51, 7, 0, 7); g.fill(); const r = g.createRadialGradient(x - 1, 50, 0, x, 51, 4); r.addColorStop(0, '#ffffff'); r.addColorStop(1, '#8a909c'); g.fillStyle = r; g.beginPath(); g.arc(x, 51, 3.2, 0, 7); g.fill(); });
  } else if (k === 'carpet') {
    g.translate(0, -6);   // centred in the tile
    const wav = (yy) => { g.moveTo(6, yy); g.quadraticCurveTo(19, yy - 8, 32, yy - 1); g.quadraticCurveTo(45, yy + 6, 58, yy - 4); };
    shape(() => { wav(30); g.lineTo(58, 44); g.quadraticCurveTo(45, 54, 32, 47); g.quadraticCurveTo(19, 40, 6, 48); g.closePath(); }, lg(22, 52, [[0, '#ff5a5a'], [.55, '#c41e2e'], [1, '#7a1020']]));
    g.strokeStyle = '#ffd75a'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(10, 33); g.quadraticCurveTo(20, 27, 32, 33); g.quadraticCurveTo(44, 40, 54, 31); g.moveTo(10, 44); g.quadraticCurveTo(20, 37, 32, 43); g.quadraticCurveTo(44, 50, 54, 41); g.stroke();
    const md = g.createRadialGradient(31, 37, 0, 32, 38, 7); md.addColorStop(0, '#fff3b0'); md.addColorStop(1, '#d89a1a'); g.fillStyle = md; g.beginPath(); g.moveTo(32, 32); g.lineTo(39, 38); g.lineTo(32, 44); g.lineTo(25, 38); g.closePath(); g.fill(); g.strokeStyle = '#7a4a00'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = '#ffd75a'; g.lineWidth = 1.6; for (const [x, y] of [[6, 30], [6, 48], [58, 26], [58, 44]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x < 30 ? -3.5 : 3.5), y + 5); g.stroke(); }
    shine(() => { g.moveTo(10, 30); g.quadraticCurveTo(19, 25, 30, 30); g.lineTo(30, 32); g.quadraticCurveTo(19, 28, 10, 32); g.closePath(); });
    g.fillStyle = '#fff'; [[17, 15, 2.6], [47, 13, 3.2], [32, 9, 2]].forEach(([x, y, r]) => { g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * .3, y - r * .3); g.lineTo(x + r, y); g.lineTo(x + r * .3, y + r * .3); g.lineTo(x, y + r); g.lineTo(x - r * .3, y + r * .3); g.lineTo(x - r, y); g.lineTo(x - r * .3, y - r * .3); g.closePath(); g.fill(); });
  } else if (k === 'mech') {   // the Hoover Mech itself, standing in the tile
    if (!window.drawMech) return null; g.save(); g.translate(31, 60); g.scale(.33, .33); g.lineWidth = 2.2; window.drawMech(g, { su: 1, ph: 0, air: 0 }); g.restore();
  } else {   // gravity sandals: a pair of chappals seen from above, glowing green straps, a curved flip arrow
    const sole = (cx, cy, rot) => { g.save(); g.translate(cx, cy); g.rotate(rot);
      shape(() => { g.moveTo(0, -17); g.bezierCurveTo(8, -17, 9, -6, 7, 2); g.bezierCurveTo(6, 10, 7, 17, 0, 17); g.bezierCurveTo(-7, 17, -6, 10, -7, 2); g.bezierCurveTo(-9, -6, -8, -17, 0, -17); }, lg(-17, 17, [[0, '#e9c38a'], [1, '#a8743c']]));
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-2.5, -8, 2.5, 6, -.1, 0, 7); g.fill();
      g.lineWidth = 4.2; g.strokeStyle = '#1a1024'; g.beginPath(); g.moveTo(-6.5, -2); g.quadraticCurveTo(0, -9, 6.5, -2); g.stroke(); g.lineWidth = 2.6; g.strokeStyle = '#3bea6a'; g.stroke();
      g.lineWidth = 3.4; g.strokeStyle = '#1a1024'; g.beginPath(); g.moveTo(0, -5.5); g.lineTo(0, -13); g.stroke(); g.lineWidth = 1.8; g.strokeStyle = '#3bea6a'; g.stroke(); g.restore(); };
    sole(23, 35, -.18); sole(42, 37, .14);
    const ag = g.createLinearGradient(8, 0, 56, 0); ag.addColorStop(0, '#7dffa0'); ag.addColorStop(1, '#ffffff');
    g.lineWidth = 4.6; g.strokeStyle = '#1a1024'; g.beginPath(); g.arc(32, 17, 16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.lineWidth = 2.6; g.strokeStyle = ag; g.stroke();
    g.fillStyle = '#ffffff'; g.strokeStyle = '#1a1024'; g.lineWidth = 1.5; g.beginPath(); const ax = 32 + Math.cos(Math.PI * 1.9) * 16, ay = 17 + Math.sin(Math.PI * 1.9) * 16; g.moveTo(ax + 5, ay - 1); g.lineTo(ax - 2, ay - 5); g.lineTo(ax - 1, ay + 4); g.closePath(); g.fill(); g.stroke();
  }
  return (RIDE_ICON[k] = c); }
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* rides: tuk-tuk (drives on the pavement, tap to jump) and magic carpet (hold to rise, glides down). One hit = the ride blows up and he's thrown clear. */
const VEH_NAME = { tuktuk: 'TUK-TUK', carpet: 'MAGIC CARPET', kabootar: 'FLAPPY KABOOTAR', sandals: 'GRAVITY SANDALS', mech: 'HOOVER MECH', logman: 'LAKRI MAN' };
const RIDES = ['tuktuk', 'carpet', 'kabootar', 'sandals', 'mech', 'logman'];
const MCH = 1.08;   // Hoover Mech size (owner 23 Nov: doubled, then 25% smaller: about 45% of the screen tall)
// gift-box rides come from a shuffled deck: every ride once before any repeats, never the same one twice in a row, kept between games (owner, 22 Nov)
function nextRide() { let bag = []; try { bag = JSON.parse(localStorage.getItem('jd_ridebag') || '[]').filter(k => RIDES.includes(k)); } catch (e) {}
  let last = ''; try { last = localStorage.getItem('jd_lastride') || ''; } catch (e) {}
  if (!bag.length) {   // owner 23 Nov: every ride twice per bag, Flappy Kabootar once (a bit rarer); jumbled, never the same one twice in a row
    let fkb = 0; try { fkb = +(localStorage.getItem('jd_fkbag') || 0); localStorage.setItem('jd_fkbag', fkb ? 0 : 1); } catch (e) {}
    const base = RIDES.flatMap(k => k === 'kabootar' ? (fkb ? [k] : []) : [k, k]);   // owner 23 Nov: Flappy Kabootar rarer: in every other bag only
    for (let tries = 0; tries < 60; tries++) { bag = base.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (bag[0] !== last && bag.every((k, i) => !i || k !== bag[i - 1])) break; } }
  const k = bag.shift(); try { localStorage.setItem('jd_ridebag', JSON.stringify(bag)); localStorage.setItem('jd_lastride', k); } catch (e) {} return k; }
/* Flappy Kabootar crossover: the exact pigeon from Flappy Kabootar, drawn big (each art pixel = PK units) */
const PIG_COL = { o: '#1b1a24', h: '#7f899e', e: '#f08a2a', k: '#1b1a24', c: '#eef0f4', b: '#3a3d44', n: '#4fa36a', p: '#8a5fb0', l: '#c3cad8', g: '#9aa3b5', d: '#7d8698', t: '#5a6476', f: '#e88a7a', w: '#d4dae4', K: '#2e3442' };
const PIG_BODY = ['...................ooo...', '..................ohhhoo.', '..................ohekhho', '.................oohhhhcbb', '...ooooooooooooonnhhhooo.', '..otlllllllllllnnnhho....', '.ottgglllllllllppnno.....', 'oKttggggggggggppnnno.....', 'oKttgggggggggggppgo......', '.ooKdgggggggggggggo......', '...odddgggggggggggo......', '....oodddddddddddo.......', '......ooooffoffoo........'];
const PIG_WINGS = [['.oooo.......', 'owwwwoo.....', '.oggwwwoo...', '..oKgggwwo..', '...ogKKggwo.', '....oggKKggo'], ['oooooooooo..', 'owwwwwwwwwoo', 'oggggggggggo', 'oKKKgKKKgggo', '.ogggggggoo.', '..ooooooo...'], ['oooooooooo..', 'owwwwwwwwwoo', '.oggggggggo.', '..oKKgKKgo..', '...oggggo...', '....oggo....', '.....oo.....']];
const PK = 2.4, pigCv = [0, 1, 2].map(f => { const c = document.createElement('canvas'); c.width = 30 * PK; c.height = 26 * PK; const x = c.getContext('2d');
  const paint = (rows, ox, oy) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.') continue; x.fillStyle = PIG_COL[ch]; x.fillRect((ox + i) * PK, (oy + j) * PK, PK, PK); } });
  paint(PIG_BODY, 2, 12); paint(PIG_WINGS[f], 7, 12 + [-9, -4, -3][f] + 7); x.fillStyle = 'rgba(140,255,190,.35)'; x.fillRect(19 * PK, 16 * PK, 2 * PK, 2 * PK); return c; });
// owner 22 Nov: ride pigeon redrawn at double detail (60x52 art pixels in the old 30x26 frame), 8 wingbeat frames
const PIG_N = 8, pigArt = (() => { const out = [];
  const shade = (x, y0, y1, a, b) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const wing = (x, ang, spread) => { x.save(); x.translate(13.2, 17.4); x.rotate(ang);
    // primaries: long separate feathers fanning out at the tip
    for (let i = 0; i < 6; i++) { const a = -.08 + i * .1 * spread, L = 13.5 - i * .9; x.save(); x.rotate(a); x.beginPath(); x.ellipse(-L * .55, 0, L * .55, 1.35, 0, 0, 7);
      x.fillStyle = i < 4 ? '#3a4050' : '#55607a'; x.fill(); x.lineWidth = .45; x.strokeStyle = '#1b1a24'; x.stroke(); x.restore(); }
    // secondaries + coverts (the main wing panel)
    x.beginPath(); x.moveTo(1.2, -1.4); x.quadraticCurveTo(-4, -3.2, -9.5, -1.6); x.quadraticCurveTo(-10.6, .6, -9.2, 2.2);
    for (let i = 0; i < 5; i++) { const px = -9.2 + i * 2.1; x.quadraticCurveTo(px + 1.05, 3.6, px + 2.1, 2.4); }
    x.quadraticCurveTo(1.6, 2.6, 1.2, -1.4); x.closePath();
    x.fillStyle = shade(x, -3, 3, '#e2e7ef', '#a7b0c2'); x.fill(); x.lineWidth = .55; x.strokeStyle = '#1b1a24'; x.stroke();
    // the two black wing bars
    x.strokeStyle = '#262a36'; x.lineWidth = 1; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-2.2, -.6); x.quadraticCurveTo(-4.6, .6, -6.4, 2.2); x.stroke();
    x.beginPath(); x.moveTo(-5, -1.2); x.quadraticCurveTo(-7.2, 0, -8.6, 1.8); x.stroke();
    // feather edges
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = .35; x.beginPath(); x.moveTo(.4, -1.6); x.quadraticCurveTo(-4, -2.7, -8.8, -1.4); x.stroke();
    x.restore(); };
  for (let f = 0; f < PIG_N; f++) { const c = document.createElement('canvas'); c.width = 60; c.height = 52; const x = c.getContext('2d'); x.scale(2, 2);
    const ph = f / PIG_N * Math.PI * 2, ang = .55 - Math.cos(ph) * 1.05, spread = 1 + Math.max(0, Math.sin(ph)) * .9;   // down-stroke spreads the primaries, up-stroke folds them
    const far = (a) => { x.save(); x.globalAlpha = 1; x.filter = 'brightness(.72)'; wing(x, a - .25, spread * .8); x.restore(); };
    if (ang < -.1) far(ang);   // far wing peeks up behind the body on the up-stroke
    // tail fan: five feathers with the dark band at the tips
    for (let i = 0; i < 5; i++) { const ty = 16.9 + i * 1.35; x.save(); x.translate(6, 19.2); x.rotate(-.32 + i * .16); x.beginPath(); x.ellipse(-3.4, 0, 3.6, 1.05, 0, 0, 7);
      const tg = x.createLinearGradient(-7, 0, 0, 0); tg.addColorStop(0, '#2e3442'); tg.addColorStop(.28, '#2e3442'); tg.addColorStop(.32, '#9aa3b5'); tg.addColorStop(1, '#b8c0ce');
      x.fillStyle = tg; x.fill(); x.lineWidth = .45; x.strokeStyle = '#1b1a24'; x.stroke(); x.restore(); }
    // feet
    x.strokeStyle = '#c75a50'; x.lineWidth = .9; x.lineCap = 'round'; [[10.6, 9.4], [14, 12.8]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a, 23.4); x.lineTo(a - .4, 25.2); x.lineTo(b - .4, 25.4); x.moveTo(a - .4, 25.2); x.lineTo(a + .9, 25.5); x.stroke(); });
    // body
    const bp = new Path2D(); bp.moveTo(4.6, 17.4); bp.quadraticCurveTo(8, 14.8, 15, 15.2); bp.quadraticCurveTo(18.6, 15.2, 19.4, 13.6);
    bp.lineTo(23.6, 13.6); bp.quadraticCurveTo(23.4, 17.4, 21.4, 20.4); bp.quadraticCurveTo(18.6, 24.4, 12.4, 24.2); bp.quadraticCurveTo(6.6, 23.8, 4.6, 21.4); bp.closePath();
    x.fillStyle = shade(x, 15, 24.5, '#cfd5e1', '#7a8396'); x.fill(bp);
    const ng = x.createLinearGradient(18, 13, 22, 20); ng.addColorStop(0, '#5fbf7e'); ng.addColorStop(.5, '#3f9466'); ng.addColorStop(1, '#8a5fb0');
    x.save(); x.clip(bp); x.fillStyle = ng; x.beginPath(); x.ellipse(20.6, 17.2, 3.4, 3.6, -.3, 0, 7); x.fill();
    x.fillStyle = 'rgba(190,255,215,.45)'; x.beginPath(); x.ellipse(20.2, 16, 1.2, .9, -.4, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(11.5, 16.4, 5.5, 1.1, -.05, 0, 7); x.fill();
    x.fillStyle = 'rgba(40,40,60,.18)'; x.beginPath(); x.ellipse(13, 23.6, 7, 1.8, 0, 0, 7); x.fill(); x.restore();
    x.lineWidth = .6; x.strokeStyle = '#1b1a24'; x.stroke(bp);
    // head
    x.beginPath(); x.arc(21.6, 12.6, 2.9, 0, 7); x.fillStyle = shade(x, 9.7, 15.5, '#9aa4b8', '#6f798e'); x.fill(); x.lineWidth = .6; x.strokeStyle = '#1b1a24'; x.stroke();
    // beak + white cere
    x.beginPath(); x.moveTo(24.1, 12.4); x.lineTo(27.2, 13.6); x.lineTo(24.2, 14.2); x.closePath(); x.fillStyle = '#3a3d44'; x.fill(); x.lineWidth = .4; x.stroke();
    x.fillStyle = '#f1f3f7'; x.beginPath(); x.ellipse(24.5, 12.5, .8, .5, .2, 0, 7); x.fill();
    // eye: orange ring, pupil, glint
    x.fillStyle = '#f08a2a'; x.beginPath(); x.arc(22.5, 12.1, 1.05, 0, 7); x.fill(); x.fillStyle = '#1b1a24'; x.beginPath(); x.arc(22.6, 12.1, .5, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.fillRect(22.7, 11.5, .5, .5);
    wing(x, ang, spread);
    // crisp pixel edges: no half-see-through pixels
    const id = x.getImageData(0, 0, 60, 52), d = id.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; x.putImageData(id, 0, 0);
    out.push(c); }
  window.__pigArt = out; return out; })();
function runStarted() {
  if (!localStorage.getItem('jd_skilltip')) { try { localStorage.setItem('jd_skilltip', '1'); } catch (e) {} setTimeout(() => pops.push({ x: hero.x + 40, y: hero.y - 110, txt: 'TAP DASH (OR SWIPE RIGHT)!', col: '#ffd21f', t: 0 }), 2500); setTimeout(() => pops.push({ x: hero.x + 40, y: hero.y - 110, txt: 'FLY CLOSE TO HAZARDS = x2 COINS', col: '#7fe3ff', t: 0 }), 7000); }   // start of the run proper: offer head starts (like their HEAD START buttons), golden misbaha ride
  usedSave = 0;
  if (SHOP.hs500 > 0 || SHOP.hs1000 > 0) { $('hs5').style.display = SHOP.hs500 > 0 ? '' : 'none'; $('hs10').style.display = SHOP.hs1000 > 0 ? '' : 'none'; $('hs5n').textContent = 'x' + SHOP.hs500; $('hs10n').textContent = 'x' + SHOP.hs1000; $('hsBox').classList.add('on'); clearTimeout(runStarted.t); runStarted.t = setTimeout(() => $('hsBox').classList.remove('on'), 3800); }
  if (hasG('misbaha')) setTimeout(() => { if (state === 'play' && !veh && !boost && !hero.dead) startVehicle(nextRide()); }, 600);
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
  if (!boost.out) { boost.left -= speed * dt;
    // owner 22 Nov: the Corolla jumps too (tap = jump, hold = higher), to grab the coins up in the air
    { const press = holding && !boost.held; boost.held = holding; boost.jy = boost.jy || 0; boost.vy = boost.vy || 0; boost.sq = Math.max(0, (boost.sq || 0) - dt * 5);
      if (press && boost.jy >= -.5) { boost.vy = -620; boost.jt = 0; SFX.whoosh(); tone(260, .14, 'triangle', .07, 1.8); }
      boost.jt = (boost.jt || 0) + dt; boost.vy += (holding && boost.vy < 0 && boost.jt < .45 ? 650 : 1900) * dt; boost.jy += boost.vy * dt;
      if (FLOOR + boost.jy - 110 < CEIL) { boost.jy = CEIL + 110 - FLOOR; boost.vy = Math.max(0, boost.vy); }
      if (boost.jy >= 0) { if (boost.vy > 200) { boost.sq = Math.min(1, boost.vy / 700); shake = .12; tone(110, .15, 'triangle', .1); } boost.jy = 0; boost.vy = 0; } }
    hero.y = FLOOR + boost.jy; hero.vy = 0; hero.rot = 0; hero.run += dt * 30; shake = Math.max(shake, .04);
    if (!boost.jy && Math.random() < dt * 30) dust.push({ x: hero.x - 70, y: FLOOR, vx: -200 - Math.random() * 200, vy: -Math.random() * 40, r: 3, l: .5 });
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
    ctx.save(); ctx.translate(hero.x - 6, FLOOR + (boost.jy || 0) - 47 + Math.sin(hero.run * 2) * .8); ctx.imageSmoothingEnabled = true; ctx.drawImage(heroImg, FR('land0_effort') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HSR / 2, -HHR, HW * HSR, HHR); ctx.restore(); }
  if (!boost.out && boost.jy) { ctx.fillStyle = 'rgba(20,10,30,.25)'; ctx.beginPath(); ctx.ellipse(x, FLOOR + 3, 70, 4, 0, 0, 7); ctx.fill(); }
  drawCorolla(ctx, x, FLOOR + 2 + (boost.out ? 0 : boost.jy || 0), 1.05, true);
}
/* owner 23 Nov, from his Jetpack Joyride 2 recording: grab the token -> white flash -> the game freezes under a big title card
   (teal energy band, the ride's picture, its name, an arrow streak; ~1.6 s) -> the band wipes off -> the ride's parts fly in
   from off screen with white streaks and lock onto him one by one -> a final white flash and off he goes. */
let REVEAL = null; const CARD = {}; ['mech', 'carpet', 'sandals', 'kabootar', 'tuktuk', 'logman'].forEach(k => { CARD[k] = img('art/card/' + k + '.webp?v=1'); });
function quickRide(k) {   // owner 23 Nov: repeat pickups skip the title card: a flash, a quick snap-together and straight back into play
  flashT = .18; flashCol = '255,255,255'; inv = Math.max(inv, 1.2); tone(880, .06, 'square', .05); setTimeout(() => tone(1320, .1, 'square', .05), 60);
  startVehicle(k, true); if (!veh) return; if (k === 'mech') veh.su = Math.max(veh.su || 0, .72); else if (k === 'logman') veh.morph = .2; else { veh.asm = .5; veh.fast = 1; } POL.fx.push({ k: 'ring', x: hero.x, y: hero.y - 30, t: 0, l: .4, col: '255,255,255' }); }
function startReveal(k) { REVEAL = { k, t: 0, seed: Math.random() * 99 }; flashT = .3; flashCol = '255,255,255'; inv = Math.max(inv, 2.5);
  tone(392, .12, 'sawtooth', .05, 2); setTimeout(() => { tone(523, .1, 'square', .06); setTimeout(() => tone(659, .1, 'square', .06), 80); setTimeout(() => tone(988, .25, 'square', .06), 160); }, 120); }
function revealTick(dt) { REVEAL.t += dt; if (flashT > 0) flashT -= dt; if (REVEAL.t >= 1.75) { const k = REVEAL.k; REVEAL = null; startVehicle(k, true); } }
function drawReveal() {
  const r = REVEAL, T = r.t, cy = VH * .54, bh = VH * .4, inA = Math.min(1, T / .22), out = Math.max(0, (T - 1.45) / .3), sx = out * W * 1.2;
  ctx.save(); ctx.fillStyle = `rgba(30,40,60,${.45 * (1 - out)})`; ctx.fillRect(0, 0, W, VH);
  if (T < .14) { ctx.fillStyle = `rgba(255,255,255,${1 - T / .14})`; ctx.fillRect(0, 0, W, VH); }
  ctx.translate(sx - (1 - inA) * W * 1.1, 0);
  let sd = r.seed; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280; sd = r.seed + Math.floor(T * 22);   // jagged edges flicker ~22 times a second
  const edge = (y0, dir) => { ctx.beginPath(); ctx.moveTo(-20, y0); for (let x = -20; x <= W + 40; x += 18) ctx.lineTo(x, y0 - dir * (rnd() * 10 + (x / W) * 18)); ctx.lineTo(W + 40, cy); ctx.lineTo(-20, cy); ctx.closePath(); };
  const tg = ctx.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2); tg.addColorStop(0, '#2fe6f0'); tg.addColorStop(.12, '#0f6f7a'); tg.addColorStop(.5, '#0b4d5a'); tg.addColorStop(.88, '#0f6f7a'); tg.addColorStop(1, '#2fe6f0');
  ctx.fillStyle = '#7ff6ff'; edge(cy - bh / 2 - 6, 1); ctx.fill(); edge(cy + bh / 2 + 6, -1); ctx.fill();
  ctx.fillStyle = tg; edge(cy - bh / 2, 1); ctx.fill(); edge(cy + bh / 2, -1); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';   // speed streaks + shards racing right
  for (let i = 0; i < 14; i++) { const yy = cy - bh * .42 + rnd() * bh * .84, len = 40 + rnd() * 140, xx = ((rnd() * W + T * 900) % (W + 200)) - 100; ctx.fillStyle = `rgba(160,250,255,${.25 + rnd() * .35})`; ctx.fillRect(xx, yy, len, 2 + rnd() * 2); }
  const ax = W * .5 + ((T * 700) % (W * .6)), ay = cy + bh * .18; const ag = ctx.createLinearGradient(ax - 220, 0, ax + 30, 0); ag.addColorStop(0, 'rgba(120,240,255,0)'); ag.addColorStop(1, 'rgba(220,255,255,.9)'); ctx.fillStyle = ag;
  ctx.beginPath(); ctx.moveTo(ax - 220, ay - 5); ctx.lineTo(ax, ay - 5); ctx.lineTo(ax - 10, ay - 16); ctx.lineTo(ax + 30, ay); ctx.lineTo(ax - 10, ay + 16); ctx.lineTo(ax, ay + 5); ctx.lineTo(ax - 220, ay + 5); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // the ride's picture, punching in from the left with a little overshoot
  const pk = Math.min(1, Math.max(0, (T - .08) / .35)), pop = pk < 1 ? 1 + Math.sin(pk * Math.PI) * .12 : 1, art = CARD[r.k] && CARD[r.k].complete && CARD[r.k].naturalWidth ? CARD[r.k] : rideIcon(r.k);
  if (art) { const ah = bh * 1.18 * pop, aw = art.width / art.height * ah, axp = W * .2 - (1 - pk) * 180; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(art, axp - aw / 2, cy - ah * .55, aw, ah); ctx.imageSmoothingQuality = 'low'; }
  // the name
  const nm = VEH_NAME[r.k] || 'NEW RIDE', tk = Math.min(1, Math.max(0, (T - .18) / .25)), tx = W * .42 + (1 - tk) * 120;
  ctx.globalAlpha = tk; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '11px PS'; ctx.fillStyle = '#ffe14a'; ctx.fillText(r.k === 'kabootar' ? 'SMR CROSSOVER' : 'POWER-UP!', tx + 2, cy - 30);
  ctx.font = '38px PS'; ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = '#06222a'; ctx.strokeText(nm, tx, cy + 4); ctx.fillStyle = '#fff'; ctx.fillText(nm, tx, cy + 4);
  ctx.restore(); ctx.globalAlpha = 1;
}
function startVehicle(k, fromReveal) {
  if (k === 'kabootar' && !window.__oldPigeon && FMS.enter()) return;
  RUN[k] = 1;
  veh = { k, t: 0, vy: 0, jumps: 0, held: false, wob: 0, g: 1, s: 1, flap: 0, fuel: 1, nb: 0, ht: 0 }; if (k === 'kabootar') veh.tip = 1; if (k === 'tuktuk' && !RUN.nitroTip) { RUN.nitroTip = 1; setTimeout(() => pops.push({ x: hero.x + 30, y: hero.y - 110, txt: 'TAP TO JUMP · HOLD TO GO HIGHER!', col: '#ffd21f', t: 0 }), 900); setTimeout(() => pops.push({ x: hero.x + 60, y: hero.y - 140, txt: 'HIT HORN TO BLAST HAZARDS!', col: '#ffe680', t: 0 }), 2600); } if (k === 'tuktuk') hornCD = 0; hero.thrust = false; if (k === 'kabootar') hero.vy = -200;
  if (k === 'mech') { veh.su = 0; veh.wp = 0; veh.air = 1; veh.shOn = 0; veh.bat = 1; veh.shA = 0; hero.y = Math.max(hero.y, CEIL + 172 * MCH); hero.vy = 0; veh.lk = 0; SFX.mechStart(); rings.push({ x: hero.x, y: hero.y - 30, t: 0 }); veh.noBanner = fromReveal; return; }   // banner comes after the suit-up (skipped when the title card already showed)
  if (k === 'logman') { veh.gold = !!(window.__goldLog || /goldlog=1/.test(location.search) || Math.random() < 1 / 200); window.__goldLog = 0; if (veh.gold) { window.LOGMAN_GOLD_PRELOAD && LOGMAN_GOLD_PRELOAD(); setTimeout(() => { pops.push({ x: hero.x + 20, y: hero.y - 130, txt: 'GOLDEN LAKRI MAN! 1 IN 200', col: '#ffd75a', t: 0 }); flashT = .2; flashCol = '255,220,120'; [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => tone(f, .14, 'triangle', .06), i * 90)); }, 1300); RUN.goldLog = 1; } veh.morph = 0; veh.ph = 0; veh.face = 'angry'; inv = Math.max(inv, 1.8); SFX.mutate && SFX.mutate(); return; }   // no part assembly: he mutates (drawn in drawVehicle)
  if (fromReveal) { veh.asm = 0; veh.lockd = 0; } else { banner = { k, t: 0 }; flashT = .12; flashCol = '255,255,255'; } rings.push({ x: hero.x, y: hero.y - 30, t: 0 });
  tone(523, .1, 'square', .06); setTimeout(() => tone(659, .1, 'square', .06), 90); setTimeout(() => tone(784, .2, 'square', .06), 180);
}
function vehCircles() { const x = hero.x, y = hero.y;
  if (veh.k === 'kabootar') return [[x, y - 18, 17], [x + 30, y - 38, 8], [x - 14, y - 50, 11], [x - 13, y - 74, 10]];
  if (veh.k === 'mech') return [[x - 2 * MCH, y - 30 * MCH, 24 * MCH], [x, y - 92 * MCH, 34 * MCH], [x + 4 * MCH, y - 132 * MCH, 22 * MCH], [x + 40 * MCH, y - 84 * MCH, 12 * MCH]];
  if (veh.k === 'sandals') { const sg = veh.s < 0 ? -1 : 1, q = HS / 1.5; return [[x + 3 * q, y - 31 * q * sg, 10 * q], [x + 7 * q, y - 58 * q * sg, 9 * q]]; }
  if (veh.k === 'logman') { if ((veh.morph || 0) < 1) return [[x, y - 20, 12], [x + 4, y - 44, 12]]; const q = LMS * (window.LOGMAN_H || 685) / 685; return [[x + 2, y - 16 * q, 11 * q], [x + 4, y - 44 * q, 12 * q], [x + 6, y - 64 * q, 12 * q]]; }
  return veh.k === 'tuktuk' ? [[x - 5, y - 26, 21], [x + 19, y - 19, 14], [x - 2, y - 58, 14]] : [[x, y - 8, 16], [x + 4, y - 36, 12]]; }
function vehUpdate(dt) {
  if (veh.asm !== undefined && veh.asm < 1) { const a0 = veh.asm; veh.asm = Math.min(1, veh.asm + dt / (veh.fast ? .4 : 1.15)); inv = Math.max(inv, .4);
    for (let i = 0; i < 3; i++) { const at = .22 + i * .2 + .32; if (a0 < at && veh.asm >= at) { tone(180 - i * 20, .09, 'square', .07); tone(900 + i * 150, .05, 'triangle', .04); shake = Math.max(shake, .06); for (let j = 0; j < 8; j++) sparks.push({ x: hero.x + (i - 1) * 22, y: hero.y - 40, vx: (Math.random() - .5) * 160, vy: (Math.random() - .5) * 160, l: .3, c: '#fff' }); } }
    if (a0 < 1 && veh.asm >= 1) { flashT = .2; flashCol = '255,255,255'; tone(784, .2, 'square', .06); setTimeout(() => tone(1046, .25, 'square', .06), 90); } }
  veh.t += dt; hero.run += dt * (6 + speed / 22); if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
  if (veh.k === 'kabootar') {   // flappy controls: tap to flap
    const press = holding && !veh.held; veh.held = holding; veh.flap -= dt;
    veh.wp = ((veh.wp || 0) + dt * (hero.vy < 0 ? 5.2 : 2.6)) % 1; veh.wf = Math.floor(veh.wp * PIG_N);   // wings always beating, quicker on the way up
    if (press) { hero.vy = -270; veh.flap = .28; veh.wp = 0; veh.taps = (veh.taps || 0) + 1; RUN.flaps++; tone(700, .05, 'square', .04, 1.4); for (let i = 0; i < 4; i++) sparks.push({ x: hero.x - 10, y: hero.y - 90, vx: -80 - Math.random() * 60, vy: 40 + Math.random() * 60, l: .4, c: '#e8ecf4' }); }
    hero.vy += 860 * dt; hero.y += hero.vy * dt;
    if (hero.y >= FLOOR) { hero.y = FLOOR; hero.vy = 0; }
    if (hero.y - 96 < CEIL) { hero.y = CEIL + 96; hero.vy = Math.max(0, hero.vy); }   // the pigeon can fly right up to the top of the screen
    hero.rot = Math.max(-.35, Math.min(.5, hero.vy / 700));
    return;
  }
  if (veh.k === 'mech') {   // Hoover Mech (owner 23 Nov): Transformer-style suit-up in slow motion, then stomps along; tap = jump, hold = higher,
    // keep holding on the way down = foot jets slow the fall; heavy landings knock people over; the hose sucks coins in
    if (veh.su < 1.15) { const rd = dt / SLOW, p0 = veh.su; veh.su += rd / 1.6; hero.vy = 0; holding = false; veh.held = true;
      (window.MECH_LOCKS || []).forEach(L => { if (p0 < L.at && veh.su >= L.at) { const lx = hero.x + L.x * MCH, ly = hero.y + L.y * MCH; SFX.clank(L.k === 'head' || L.k === 'chest' ? 1 : 0); shake = Math.max(shake, L.k === 'feet' ? .1 : .05);
        for (let i = 0; i < 10; i++) sparks.push({ x: lx, y: ly, vx: (Math.random() - .5) * 220, vy: (Math.random() - .7) * 200, l: .25 + Math.random() * .25, c: ['#ffd75a', '#ffffff', '#ff9a2a'][i % 3] }); } });
      if (p0 < 1 && veh.su >= 1) { obs = obs.filter(o => o.type !== 'laser'); SFX.mechOn(); flashT = .07; flashCol = '255,240,210'; shake = .18; if (!veh.noBanner) banner = { k: 'mech', t: 0 }; rings.push({ x: hero.x, y: hero.y - 90 * MCH, t: 0 }); for (let i = 0; i < 12; i++) steam.push({ x: hero.x - 40 * MCH, y: hero.y - 100 * MCH, vx: -60 - Math.random() * 90, vy: -20 - Math.random() * 40, r: 4 + Math.random() * 4, l: .7, l0: .9 }); }
      if (veh.su >= 1 && !RUN.mechTip) { RUN.mechTip = 1; setTimeout(() => pops.push({ x: hero.x + 30, y: hero.y - 160 * MCH, txt: 'HOLD TO FLY · HOLD SHIELD TO BLOCK!', col: '#ffd21f', t: 0 }), 500); }
      return; }
    // owner 23 Nov: foot thrusters work like his jetpack: hold to fly up anywhere on the screen, let go to drop
    // owner 23 Nov: jumps exactly like JJ2's Big Stomper (frame-by-frame from his recording): a crouch, then a snappy blast-off
    // (~0.2 s to mid-screen), a short hang at the top, a fast heavy drop; holding keeps the foot thrusters on to hover/climb
    veh.held = holding; const onG = hero.y >= FLOOR - .5; veh.crouch = Math.max(0, (veh.crouch || 0) - dt);
    if (holding && !veh.wasT && onG) { veh.crouch = .07; veh.launch = .22; hero.vy = -1500; SFX.stompJump && SFX.stompJump();
      for (let i = 0; i < 14; i++) dust.push({ x: hero.x + (Math.random() - .5) * 70, y: FLOOR, vx: (Math.random() < .5 ? -1 : 1) * (80 + Math.random() * 160), vy: -Math.random() * 50, r: 3.5, l: .5 }); }
    veh.wasT = holding; veh.launch = Math.max(0, (veh.launch || 0) - dt);
    // timings from the recording: up in ~0.23 s, ~0.25 s hang at the top, down in ~0.3 s
    const grav = hero.vy < -150 ? 6500 : hero.vy < 150 ? 900 : 3400;
    veh.thr = veh.launch > 0 ? 1.4 : holding && !onG && veh.launch <= 0 ? 1 : 0;
    if (veh.thr && veh.launch <= 0) hero.vy -= (hero.vy > -150 ? 1300 : 0) * dt + (hero.vy > 0 ? 3000 * dt : 0);   // hold: thrusters keep him up / climb slowly
    hero.vy += grav * dt; hero.vy = Math.max(veh.thr && veh.launch <= 0 ? Math.min(hero.vy, -1500) : -1500, Math.min(1100, hero.vy)); hero.y += hero.vy * dt;
    veh.lean += (((hero.vy < -200 ? .2 : hero.vy > 300 ? -.06 : 0)) - (veh.lean || 0)) * Math.min(1, dt * 12) || 0;
    if (hero.y - 172 * MCH < CEIL) { hero.y = CEIL + 172 * MCH; hero.vy = Math.max(0, hero.vy); }
    if (veh.thr && Math.random() < dt * 7) tone(85 + Math.random() * 30, .07, 'sawtooth', .022, 1.3, MIX && MIX.fx);
    if (veh.thr && Math.random() < dt * 30) sparks.push({ x: hero.x + (Math.random() < .5 ? -9 : 9) * MCH + (Math.random() - .5) * 8, y: hero.y + 6, vx: -speed * .3 + (Math.random() - .5) * 40, vy: 160 + Math.random() * 120, l: .2 + Math.random() * .15, c: Math.random() < .5 ? '#bfe8ff' : '#6ab8ff' });
    if (hero.y >= FLOOR) { if (hero.vy > 250) { const v = Math.min(1, hero.vy / 900); shake = .16 + v * .2; SFX.thudBig(.35 + v * .55); SFX.clank && SFX.clank(1); veh.sq = Math.max(.6, v); rings.push({ x: hero.x, y: FLOOR - 4, t: 0 });
        for (let i = 0; i < 16; i++) dust.push({ x: hero.x + (Math.random() - .5) * 90, y: FLOOR, vx: (Math.random() - .5) * 260, vy: -Math.random() * 60, r: 3.5, l: .6 });
        npcs.forEach(p => { if (!p.esc && p.fall <= 0 && Math.abs(p.x - hero.x) < 70 + v * 70) { p.fall = 99; p.fall0 = 99; p.landed = 0; p.fallDir = p.x < hero.x ? -1 : 1; p.done = 1; RUN.stomped = (RUN.stomped || 0) + 1; } }); }
      hero.y = FLOOR; hero.vy = 0; }
    veh.sq = Math.max(0, (veh.sq || 0) - dt * 4);
    veh.air += ((onG ? 0 : 1) - veh.air) * Math.min(1, dt * 10);
    const G = window.MECH_GAIT || { A: 24, ST: .55 };
    if (onG) { const p0 = veh.wp; veh.wp += dt * Math.max(60, speed) * G.ST / (2 * G.A * MCH);   // planted feet move exactly with the street, so they never slide
      if (Math.floor(p0 * 2) !== Math.floor(veh.wp * 2)) { const fr = Math.floor(veh.wp * 2) % 2 === 0, fx = hero.x + ((fr ? 9 : -9) + G.A) * MCH;   // a foot slams down: thump, shake, dust
        SFX.stomp(); shake = Math.max(shake, .07); if (Math.random() < .5) POL.crack(fx); for (let i = 0; i < 6; i++) dust.push({ x: fx + (Math.random() - .5) * 20, y: FLOOR, vx: (Math.random() - .5) * 120 - speed * .3, vy: -Math.random() * 30, r: 2.5 + Math.random() * 1.5, l: .45 }); } }
    veh.blink = ((veh.blink || 0) + dt * .45) % 1; veh.shock = Math.max(0, (veh.shock || 0) - dt); veh.shT = (veh.shT || 0) - dt;
    { if (veh.bat == null) veh.bat = 1; const want = shHold && state === 'play' && (veh.shOn ? veh.bat > 0 : veh.bat > .15);   // hold to keep it up; let go and it recharges straight away
      if (want && !veh.shOn) { veh.shOn = 1; RUN.shield = (RUN.shield || 0) + 1; tone(220, .3, 'sawtooth', .05, 3, MIX && MIX.fx); setTimeout(() => tone(880, .25, 'sine', .05, 1.4, MIX && MIX.fx), 80); }
      if (!want && veh.shOn) { veh.shOn = 0; tone(600, .2, 'sine', .04, .4, MIX && MIX.fx); }
      if (veh.shOn) veh.bat = Math.max(0, veh.bat - dt / SH_ON); else veh.bat = Math.min(1, veh.bat + dt / SH_CD); }
    veh.shA = (veh.shA || 0) + ((veh.shOn ? 1 : 0) - (veh.shA || 0)) * Math.min(1, dt * 12); veh.shHit = Math.max(0, (veh.shHit || 0) - dt * 3);
    hero.rot = 0;
    return;
  }
  if (veh.k === 'sandals') {   // gravity sandals: tap to flip between pavement and the top of the screen
    const press = holding && !veh.held; veh.held = holding;
    if (press) { veh.g = -veh.g; RUN.flips++; POL.flipFx(); tone(veh.g < 0 ? 520 : 390, .14, 'triangle', .06, veh.g < 0 ? 1.8 : .55); for (let i = 0; i < 8; i++) sparks.push({ x: hero.x + (Math.random() - .5) * 20, y: hero.y, vx: (Math.random() - .5) * 120, vy: (Math.random() - .5) * 120, l: .4, c: '#7dffa0' }); }
    hero.vy += veh.g * 2700 * dt; hero.vy = Math.max(-900, Math.min(900, hero.vy)); hero.y += hero.vy * dt;
    const top = CEIL + 2; veh.on = 0;
    if (hero.y >= FLOOR) { if (hero.vy > 300) { shake = .08; tone(140, .08, 'triangle', .07); } hero.y = FLOOR; hero.vy = 0; veh.on = 1; }
    if (hero.y <= top) { if (hero.vy < -300) { shake = .08; tone(160, .08, 'triangle', .07); } hero.y = top; hero.vy = 0; veh.on = 1; }
    veh.s += ((veh.g < 0 ? -1 : 1) - veh.s) * Math.min(1, dt * 14); hero.rot = 0;
    if (veh.on && Math.random() < dt * 20) sparks.push({ x: hero.x - 6, y: hero.y, vx: -speed * .4 - 30, vy: (Math.random() - .5) * 30, l: .3, c: '#7dffa0' });
    return;
  }
  if (veh.k === 'logman') {   // Lakri Man: tap = big leap, tap again in the air = flip leap, hold in the air = windmill arms slow the fall; zappers can't hurt wood
    const press = holding && !veh.held; veh.held = holding; const onG = hero.y >= FLOOR - .5; veh.sq = Math.max(0, (veh.sq || 0) - dt * 5);
    if (veh.morph < 1) { veh.morph = Math.min(1, veh.morph + dt / 1.35); if (veh.morph >= 1) { veh.face = 'grin'; veh.sq = .8; shake = Math.max(shake, .25); veh.life = LOG_LIFE * (veh.gold ? 2 : 1); veh.batHP = SHOP.bat === 'bat_tape' ? 10 : BAT_HP; veh.swT = -1; veh.streak = 0; } }
    if (veh.morph >= 1) { veh.life -= dt; if (veh.life < 5 && Math.floor(veh.life * 4) !== Math.floor((veh.life + dt) * 4)) { tone(220 + Math.random() * 80, .07, 'square', .03, .6, MIX && MIX.fx); for (let i = 0; i < 4; i++) sparks.push({ x: hero.x + (Math.random() - .5) * 20, y: hero.y - Math.random() * 70, vx: (Math.random() - .5) * 120, vy: -Math.random() * 120, l: .4, c: '#a8622a' }); if (veh.life < 3) veh.face = 'scared'; }   // owner 23 Nov: he can't stay a log for ever: he starts creaking and cracking, then turns back
      if (veh.life <= 0) { logRevert(); return; }
      batTick(dt); }
    else {
      if (press && onG) { hero.vy = -720; veh.jn = 1; veh.sq = -.6; RUN.jumps++; SFX.whoosh(); tone(220, .12, 'square', .05, 1.6); veh.face = 'laugh'; for (let i = 0; i < 8; i++) dust.push({ x: hero.x - 20 + Math.random() * 40, y: FLOOR, vx: -60 - Math.random() * 90, vy: -Math.random() * 40, r: 3, l: .5 }); }
      else if (press && !onG && (veh.jn || 1) < 3) { veh.jn = (veh.jn || 1) + 1; const big = veh.jn === 3; hero.vy = Math.min(hero.vy, 0) - (big ? 560 : 620); veh.flipT = 0; veh.flipD = big ? .62 : .45; veh.flipN = big ? 2 : 1; SFX.whoosh(); tone(big ? 440 : 330, .12, 'square', .05, 1.8); veh.face = big ? 'laugh' : 'grin'; rings.push({ x: hero.x, y: hero.y - 40, t: 0 }); if (big) pops.push({ x: hero.x + 20, y: hero.y - 120, txt: 'TRIPLE!', col: '#ffb04a', t: 0 }); } }   // owner 23 Nov: jump, flip, then a double flip
    if (veh.flipT !== undefined) { veh.flipT += dt; if (veh.flipT > (veh.flipD || .45)) veh.flipT = undefined; }
    veh.spin = !onG && holding && veh.morph >= 1 && hero.vy > -100 ? (veh.spin || 0) + dt * 22 : 0;
    let g = 1900; if (veh.spin) { g = 600; if (hero.vy > 140) hero.vy = 140; if (Math.random() < dt * 8) tone(160 + Math.random() * 40, .05, 'triangle', .02, 1.4, MIX && MIX.fx); }
    hero.vy += g * dt; hero.y += hero.vy * dt; if (hero.y - 90 < CEIL) { hero.y = CEIL + 90; hero.vy = Math.max(0, hero.vy); }
    if (hero.y >= FLOOR) { if (hero.vy > 250 && veh.morph >= 1) { veh.sq = Math.min(1, hero.vy / 800); shake = Math.max(shake, .1); tone(110, .14, 'triangle', .08); veh.face = 'smile'; for (let i = 0; i < 8; i++) dust.push({ x: hero.x + (Math.random() - .5) * 50, y: FLOOR, vx: (Math.random() - .5) * 160, vy: -Math.random() * 40, r: 3, l: .5 }); }
      hero.y = FLOOR; hero.vy = 0; veh.jn = 0; }
    if (onG) veh.ph += dt * (speed / 26); hero.rot = 0; veh.ft = (veh.ft || 0) - dt; if (veh.ft <= 0 && onG && veh.morph >= 1) { veh.ft = 2 + Math.random() * 2; veh.face = ['smile', 'grin', 'smug', 'smile'][Math.random() * 4 | 0]; }
    return;
  }
  if (veh.k === 'tuktuk') {
    // owner 22 Nov: works like Jetpack Joyride's rides: tap = jump, hold = jump much higher, keep holding on the way down =
    // little thrusters under the floor slow the fall (about 1.2 s of thrust per jump). No more nitro.
    const press = holding && !veh.held; veh.held = holding; const onG = hero.y >= FLOOR - .5; veh.sq = Math.max(0, (veh.sq || 0) - dt * 5);
    if (press && onG) { hero.vy = -640; veh.jt = 0; veh.gl = 1.2; veh.sq = -.6; RUN.jumps++; SFX.whoosh(); tone(300, .14, 'triangle', .07, 1.8); for (let i = 0; i < 8; i++) dust.push({ x: hero.x - 30 + Math.random() * 50, y: FLOOR, vx: -60 - Math.random() * 90, vy: -Math.random() * 40, r: 3, l: .5 }); }
    else if (press && !onG && !veh.dj) {   // owner 23 Nov: double jump: a second boost in the air takes him right up to the top of the screen
      veh.dj = 1; hero.vy = Math.min(hero.vy, 0) - 660; veh.jt = 0; veh.gl = 1.2; veh.sq = -.7; veh.dbl = .35; RUN.jumps++; SFX.whoosh(); tone(420, .16, 'triangle', .07, 2); tone(90, .2, 'sawtooth', .05, 1.6);
      for (let i = 0; i < 14; i++) [-30, 22].forEach(tx => sparks.push({ x: hero.x + tx, y: hero.y - 2, vx: (Math.random() - .5) * 120, vy: 160 + Math.random() * 160, l: .3 + Math.random() * .15, c: ['#ffffff', '#ffd75a', '#ff8a2a'][i % 3] }));
      rings.push({ x: hero.x, y: hero.y, t: 0 }); }
    if (veh.dbl > 0) veh.dbl -= dt;
    veh.jt = (veh.jt || 0) + dt; let g = 1900; veh.thr = 0;
    if (!onG && holding) { if (hero.vy < 0 && veh.jt < .45) g = 650; else if (hero.vy >= -40 && veh.gl > 0) { g = 700; veh.gl -= dt; veh.thr = 1; if (hero.vy > 110) hero.vy = 110; } }
    hero.vy += g * dt; hero.y += hero.vy * dt;
    if (hero.y - 84 < CEIL) { hero.y = CEIL + 84; hero.vy = Math.max(0, hero.vy); }
    if (veh.thr && Math.random() < dt * 50) [-30, 22].forEach(tx => sparks.push({ x: hero.x + tx, y: hero.y - 2, vx: -speed * .3 + (Math.random() - .5) * 30, vy: 140 + Math.random() * 90, l: .22 + Math.random() * .12, c: Math.random() < .5 ? '#ffd75a' : '#ff8a2a' }));
    if (veh.thr && Math.random() < dt * 6) tone(70 + Math.random() * 20, .08, 'sawtooth', .03, 1.2);
    if (hero.y >= FLOOR) { if (hero.vy > 200) { veh.sq = Math.min(1, hero.vy / 700); shake = .12; tone(120, .15, 'triangle', .1); for (let i = 0; i < 10; i++) dust.push({ x: hero.x + (Math.random() - .5) * 60, y: FLOOR, vx: (Math.random() - .5) * 180, vy: -Math.random() * 40, r: 3, l: .5 }); npcs.forEach(p => { if (!p.esc && Math.abs(p.x - hero.x) < 90 && p.fall <= 0) { p.react = .9; p.hop = 1; p.hopH = 16; p.look = hero.x > p.x ? 1 : -1; } }); }
      hero.y = FLOOR; hero.vy = 0; veh.dj = 0; }
    hero.rot = Math.max(-.22, Math.min(.18, hero.vy / 2400));
    if (Math.random() < dt * 14) steam.push({ x: hero.x - 40, y: hero.y - 10, vx: -speed * .4 - 30, vy: -10 - Math.random() * 20, r: 2, l: .5, l0: .6 });
  } else {
    if (holding) hero.vy -= 1150 * dt; hero.vy += 480 * dt; hero.vy = Math.max(-210, Math.min(230, hero.vy)); hero.y += hero.vy * dt;
    if (hero.y >= FLOOR - 6) { hero.y = FLOOR - 6; hero.vy = 0; }
    if (hero.y - 70 < CEIL) { hero.y = CEIL + 70; hero.vy = Math.max(0, hero.vy); }
    hero.rot = Math.max(-.12, Math.min(.12, hero.vy / 1600));
    if (Math.random() < dt * 24) sparks.push({ x: hero.x - 30 + Math.random() * 10, y: hero.y - 2 + Math.random() * 6, vx: -speed * .5 - 20, vy: (Math.random() - .5) * 20, l: .5, c: Math.random() < .5 ? '#ffd75a' : '#fff3b0' });
  }
}
/* Hoover Mech armour (owner 23 Nov, like the SAM suit in Jetpack Joyride 2): zappers and lasers only crackle over the suit, rockets bounce off */
function mechArmour() { return veh && veh.k === 'mech' && veh.su >= 1; }
/* SHIELD button (owner 23 Nov): his near arm comes up in front and a red holographic shield blocks lasers and rockets.
   2.5 s up, then 3.5 s to recharge (ring on the button). Without it, lasers and rockets wreck the mech; zappers only crackle. */
const SH_ON = 2.5, SH_CD = 3.5;   // a full battery lasts 2.5 s held; empty to full takes 3.5 s once you let go
let shHold = false, shPid = null;
function mechShieldUp() { return mechArmour() && (veh.shA || 0) > .55; }
function shieldBtn() { const b = $('bShield'); if (!b) return; const on = mechArmour() && state === 'play'; b.classList.toggle('hide', !on); if (!on) return;
  b.style.setProperty('--cd', ((veh.bat == null ? 1 : veh.bat) * 100).toFixed(1) + '%'); b.classList.toggle('act', !!veh.shOn); b.classList.toggle('ready', !veh.shOn && veh.bat > .99); b.classList.toggle('low', veh.bat < .2); }
function shieldBlock(x, y) { veh.shHit = 1; SFX.clank(0); tone(500, .12, 'sine', .05, 1.8, MIX && MIX.fx); for (let i = 0; i < 12; i++) sparks.push({ x, y, vx: Math.random() * 200, vy: (Math.random() - .5) * 240, l: .3 + Math.random() * .25, c: ['#ff5a4a', '#ffd0c8', '#ffffff'][i % 3] }); }
function mechShock(x, y) { veh.shock = .35; if ((veh.shT || 0) <= 0) { veh.shT = .22; tone(110 + Math.random() * 40, .18, 'sawtooth', .06, .6, MIX && MIX.fx); tone(1700 + Math.random() * 900, .07, 'square', .025, .5, MIX && MIX.fx); }
  for (let i = 0; i < 3; i++) sparks.push({ x: hero.x + (Math.random() - .3) * 70 * MCH, y: hero.y - Math.random() * 160 * MCH, vx: (Math.random() - .5) * 220, vy: (Math.random() - .5) * 220, l: .2 + Math.random() * .2, c: Math.random() < .5 ? '#fff6a8' : '#bff4ff' }); }

/* ---------- Tuk-tuk HORN BLAST (owner 23 Nov): a proper power-up move ----------
   HORN button (or H / D key) while in the tuk-tuk: a two-tone desi truck horn, the bulb horn on the front squeezes, the tuk-tuk rocks back,
   and a shockwave of sound rolls out in front: zappers shatter, flying rockets are blown back, incoming rockets are cancelled, lasers shut
   down and people on the pavement are knocked flat. Every hazard it clears pays £2. 3.2 s to recharge (ring on the button). */
var TINSH = null, TINSHX = null;
const HORN_CD = 1.8; var horns = [], hornCD = 0;   // owner 23 Nov: recharges quicker (was 3.2 s)
function tukLaser(o) {   // owner 23 Nov: the tuk-tuk is laser-proof: the beam just crackles over the bodywork
  if (Math.random() < .5) sparks.push({ x: hero.x + (Math.random() - .5) * 70, y: o.y + (Math.random() - .5) * 8, vx: (Math.random() - .5) * 220, vy: (Math.random() - .5) * 220, l: .25, c: Math.random() < .5 ? '#ff9ad8' : '#ffffff' });
  if (!o.tukP) { o.tukP = 1; pops.push({ x: hero.x + 20, y: hero.y - 120, txt: 'LASER-PROOF!', col: '#ff9ad8', t: 0 }); tone(1600, .08, 'square', .03, .5, MIX && MIX.fx); }
  if ((o.tukT = (o.tukT || 0) - 1 / 60) <= 0) { o.tukT = .12; tone(200 + Math.random() * 120, .07, 'sawtooth', .025, .6, MIX && MIX.fx); } }
function hornOrigin() { return [hero.x + 48, hero.y - 58]; }
function hornBlast() { if (state !== 'play' || hero.dead || paused || !veh || veh.k !== 'tuktuk' || hornCD > 0 || (veh.asm !== undefined && veh.asm < 1)) return;
  hornCD = HORN_CD; const [x, y] = hornOrigin(); horns.push({ x, y, t: 0, R: W - x + 80, hit: 0, notes: [0, 1, 2, 3, 4].map(i => ({ d: i * .05, a: -.5 + i * .25, s: 120 + Math.random() * 60, w: Math.random() * 6, ch: i % 2 ? '♫' : '♪' })) });
  veh.hornK = .32; veh.rock = .25; shake = Math.max(shake, .16); flashT = .06; flashCol = '255,236,170'; SFX.tukHorn();
  pops.push({ x: hero.x + 10, y: hero.y - 120, txt: 'PAAP PAAP!', col: '#ffd21f', t: 0 }); RUN.horns = (RUN.horns || 0) + 1;
  for (let i = 0; i < 10; i++) dust.push({ x: x - 10, y: FLOOR - 2, vx: 60 + Math.random() * 160, vy: -20 - Math.random() * 40, r: 2 + Math.random() * 2, l: .5 }); }
function hornPay(x, y, txt) { coins += 2; $('coins').textContent = '£' + coins; pops.push({ x, y: y - 20, txt: txt + ' +£2', col: '#ffe680', t: 0 }); RUN.honked = (RUN.honked || 0) + 1; }
// owner 23 Nov: whatever the horn's pulse hits shorts out and breaks: zapper beams stutter and die, the balls drop and bounce;
// speed-camera lasers flicker out and their boxes fall; rockets lose their flame, tumble down and pop on the road
var wrecks = [];
function wreckZap(o) { const c = Math.cos(o.ang), s = Math.sin(o.ang), hl = o.len / 2;
  const ball = (x, y, a) => ({ x, y, a, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 80, spin: (Math.random() < .5 ? -1 : 1) * (3 + Math.random() * 5), b: 0, sm: 0 });
  wrecks.push({ k: 'zap', t: 0, seed: o.seed || 1, A: ball(o.x - c * hl, o.y - s * hl, o.ang), B: ball(o.x + c * hl, o.y + s * hl, o.ang + Math.PI) });
  tone(95, .5, 'sawtooth', .07, .6, MIX && MIX.fx); tone(2400, .06, 'square', .04, .3, MIX && MIX.fx); setTimeout(() => tone(1700, .05, 'square', .035, .5, MIX && MIX.fx), 120); setTimeout(() => tone(60, .3, 'sawtooth', .05, .4, MIX && MIX.fx), 380); }
function wreckLaser(o) { const e = (1 - o.slide) * 40, box = (x, s) => ({ x, y: o.y, s, vx: s * (20 + Math.random() * 40), vy: -60 - Math.random() * 60, a: 0, spin: s * (2 + Math.random() * 3), b: 0, sm: 0 });
  wrecks.push({ k: 'laser', t: 0, L: box(10 - e, 1), R: box(W - 10 + e, -1), y: o.y });
  tone(140, .4, 'sawtooth', .07, .5, MIX && MIX.fx); tone(2000, .05, 'square', .04, .3, MIX && MIX.fx); setTimeout(() => tone(1500, .05, 'square', .035, .4, MIX && MIX.fx), 140); }
function dudRocket(o) { o.defl = 1; o.dud = 1; o.v = speed * .55; o.vy = -160 - Math.random() * 80; o.rot = 0; o.spin = (Math.random() < .5 ? -1 : 1) * (4 + Math.random() * 4);
  for (let i = 0; i < 16; i++) sparks.push({ x: o.x, y: o.y, vx: (Math.random() - .5) * 260, vy: (Math.random() - .5) * 260, l: .35, c: ['#fff6a8', '#ffffff', '#9fd8ff'][i % 3] });
  tone(1800, .05, 'square', .04, .4, MIX && MIX.fx); tone(220, .35, 'sawtooth', .05, .3, MIX && MIX.fx); }
function rocketPop(o) { for (let i = 0; i < 22; i++) sparks.push({ x: o.x, y: o.y, vx: (Math.random() - .5) * 320, vy: -Math.random() * 260, l: .45, c: ['#ffd75a', '#ff8a2a', '#ffffff', '#888'][i % 4] });
  for (let i = 0; i < 6; i++) wrecks.push({ k: 'puff', t: 0, x: o.x + (Math.random() - .5) * 16, y: o.y - Math.random() * 10, r: 6 + Math.random() * 6, vy: -20 - Math.random() * 30 });
  SFX.thud && SFX.thud(); shake = Math.max(shake, .12); o.x = -999; }
function wreckTick(dt) { const G2 = FLOOR - 4;
  const fall = (p, r) => { p.vy += 1100 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.a += p.spin * dt;
    if (p.y > G2 - r) { p.y = G2 - r; if (p.vy > 120) { p.vy = -p.vy * .38; p.spin *= .6; p.vx *= .6; p.b++; if (p.b === 1) { SFX.thud && SFX.thud(); for (let i = 0; i < 6; i++) sparks.push({ x: p.x, y: p.y + r, vx: (Math.random() - .5) * 160, vy: -Math.random() * 120, l: .3, c: '#fff3a0' }); } } else { p.vy = 0; p.spin *= .9; p.vx = 0; } }
    p.sm += dt; if (p.sm > .07) { p.sm = 0; wrecks.push({ k: 'puff', t: 0, x: p.x, y: p.y - 4, r: 3 + Math.random() * 3, vy: -25 - Math.random() * 20, dark: 1 }); } };
  wrecks.forEach(w => { w.t += dt;
    if (w.k === 'zap') { [w.A, w.B].forEach(p => { p.x -= speed * dt; if (w.t > .45) fall(p, ZBR); if (w.t < 1.2 && Math.random() < .25) sparks.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, l: .25, c: Math.random() < .5 ? '#fff3a0' : '#ffffff' }); }); }
    else if (w.k === 'laser') { [w.L, w.R].forEach(p => { if (w.t > .4) { fall(p, 10); if (p.b) p.x -= speed * dt; } if (w.t < 1.1 && Math.random() < .2) sparks.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 180, vy: (Math.random() - .5) * 180, l: .25, c: Math.random() < .5 ? '#f0b0ff' : '#ffffff' }); }); }
    else if (w.k === 'puff') { w.x -= speed * dt * .6; w.y += w.vy * dt; w.r += dt * 14; } });
  wrecks = wrecks.filter(w => w.k === 'puff' ? w.t < .9 : w.t < 4.5 && (w.k !== 'zap' || w.A.x > -60 || w.B.x > -60)); }
function drawWrecks() {
  wrecks.forEach(w => { if (w.k === 'puff') { const k = w.t / .9; ctx.fillStyle = w.dark ? `rgba(70,70,78,${(.35 * (1 - k)).toFixed(3)})` : `rgba(150,140,130,${(.5 * (1 - k)).toFixed(3)})`; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, 7); ctx.fill(); } });
  wrecks.forEach(w => {
    if (w.k === 'zap') { const A = w.A, B = w.B, live = w.t < .45;
      if (live && Math.random() < .65) {   // the beam stutters: broken jagged pieces from each hole, cutting in and out
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = ctx.lineJoin = 'round';
        [[A, B], [B, A]].forEach(([p, q]) => { const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, len = L * (.15 + Math.random() * .4);
          ctx.beginPath(); ctx.moveTo(p.x + ux * ZBR * .8, p.y + uy * ZBR * .8); for (let i = 1; i <= 6; i++) { const k = i / 6, j = (Math.random() - .5) * 16; ctx.lineTo(p.x + ux * len * k - uy * j, p.y + uy * len * k + ux * j); }
          ctx.strokeStyle = 'rgba(255,200,60,.6)'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.3; ctx.stroke(); }); ctx.restore(); }
      const gl = w.t < .45 ? (Math.random() < .5 ? .9 : .15) : Math.max(0, .6 - (w.t - .45)) * (Math.random() < .6 ? 1 : .2);
      zapBall(A.x, A.y, A.a, gl); zapBall(B.x, B.y, B.a, gl); if (w.t < 1.1) { ballCrackle(A.x, A.y, A.a, Math.random()); ballCrackle(B.x, B.y, B.a, Math.random()); } }
    else if (w.k === 'laser') { const live = w.t < .4;
      if (live && Math.random() < .55) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x0 = w.L.x + 12 + Math.random() * (W * .3), x1 = x0 + 40 + Math.random() * W * .3; ctx.fillStyle = 'rgba(230,70,255,.55)'; ctx.fillRect(x0, w.y - 3, x1 - x0, 6); ctx.fillStyle = 'rgba(255,235,255,.9)'; ctx.fillRect(x0, w.y - 1, x1 - x0, 2); ctx.restore(); }
      [w.L, w.R].forEach(p => laserBox(p.x, p.y, p.s, p.a, live && Math.random() < .5 ? '#ffe0ff' : '#2a0f33')); } });
  // the dud rockets' sputtering sparks
  obs.forEach(o => { if (o.dud && Math.random() < .5) sparks.push({ x: o.x, y: o.y, vx: (Math.random() - .5) * 120, vy: (Math.random() - .5) * 120, l: .2, c: Math.random() < .5 ? '#fff3a0' : '#bfe4ff' }); }); }
function hornTick(dt) { if (hornCD > 0) hornCD -= dt; if (veh && veh.k === 'tuktuk') { if (veh.hornK > 0) veh.hornK -= dt; if (veh.rock > 0) veh.rock -= dt; }
  horns.forEach(h => { h.t += dt; h.x -= speed * dt * 0; const r = h.t * 1100;
    obs.forEach(o => { if (o.honk) return; let px, py;
      if (o.type === 'zap') { const ca = Math.cos(o.ang), sa = Math.sin(o.ang), hl = o.len / 2; const u = Math.max(-hl, Math.min(hl, (h.x - o.x) * ca + (h.y - o.y) * sa)); px = o.x + ca * u; py = o.y + sa * u; }
      else if (o.type === 'rocket') { if (!o.v) { if (r >= h.R * .92) { o.honk = 1; hornPay(W - 110, o.y + 20, 'ROCKET CANCELLED!'); } return; } if (o.defl) return; px = o.x; py = o.y; }
      else if (o.type === 'laser') { if (o.ph === 'out' || o.d > 0) return; if (r > 180) { o.honk = 1; wreckLaser(o); for (let i = 0; i < 14; i++) sparks.push({ x: i % 2 ? W - 18 : 18, y: o.y, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, l: .4, c: ['#ff9ad8', '#ffffff', '#ffd21f'][i % 3] }); tone(300, .25, 'sawtooth', .05, .3, MIX && MIX.fx); hornPay(W / 2, o.y, 'SHORTED OUT'); } return; }
      else return;
      const dx = px - h.x, dy = py - h.y; if (dx < -10 || Math.hypot(dx, dy) > r || Math.abs(dy) > 80 + dx * .8) return;
      if (o.type === 'zap') { o.honk = 1; wreckZap(o); const ca = Math.cos(o.ang), sa = Math.sin(o.ang);
        for (let i = 0; i < 14; i++) { const u = (Math.random() - .5) * o.len; sparks.push({ x: o.x + ca * u, y: o.y + sa * u, vx: 120 + Math.random() * 260, vy: (Math.random() - .5) * 300, l: .35 + Math.random() * .3, c: ['#fff6a8', '#ffffff', '#ffd21f', '#bff4ff'][i % 4] }); }
        hornPay(o.x, o.y, 'SHORTED OUT'); }
      else { dudRocket(o); hornPay(o.x, o.y, 'SHORTED OUT'); } });
    npcs.forEach(p => { if (p.esc || p.fall > 0 || p.honk) return; const dx = p.x - h.x; if (dx < -10 || dx > r || dx > h.R) return; p.honk = 1;
      p.fall = 99; p.fall0 = 99; p.landed = 0; p.fallDir = 1; p.done = 1; if (Math.random() < .5) SFX.thud(); coins += 1; $('coins').textContent = '£' + coins;
      for (let i = 0; i < 5; i++) sparks.push({ x: p.x, y: FLOOR - 30, vx: 60 + Math.random() * 120, vy: -80 - Math.random() * 120, l: .4, c: '#fff3b0' }); });
  });
  obs = obs.filter(o => !o.honk); horns = horns.filter(h => h.t < 1); }
// owner 23 Nov: clear, see-through sound waves that bend the picture behind them (a moving lens), wiggling as they roll out
const WARP = document.createElement('canvas'), wctx = WARP.getContext('2d');
function warpRing(cx, cy, R, th, amp, ph, a0, a1, N) {   // device px: magnify the strip of screen under the ring, sector by sector, each with its own wobble
  for (let j = 0; j < N; j++) { const b0 = a0 + (a1 - a0) * j / N, b1 = a0 + (a1 - a0) * (j + 1) / N, bm = (b0 + b1) / 2, taper = Math.sin(Math.PI * (j + .5) / N);
    const sc = 1 + amp * taper * (.7 + .3 * Math.sin(j * .55 + ph)), rot = amp * taper * .25 * Math.sin(j * .8 + ph * 1.3), ri = Math.max(1, R - th), ro = R + th;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; [b0, bm, b1].forEach(b => [ri, ro].forEach(rr => { const px = cx + Math.cos(b) * rr, py = cy + Math.sin(b) * rr; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }));
    x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(WARP.width, x1 + 2); y1 = Math.min(WARP.height, y1 + 2); if (x1 - x0 < 2 || y1 - y0 < 2) continue;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, ro, b0, b1); ctx.arc(cx, cy, ri, b1, b0, true); ctx.closePath(); ctx.clip();
    ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx, -cy); ctx.drawImage(WARP, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); ctx.restore(); } }
function glassBand(cx, cy, R, th, a, span) {   // the faint glassy body of the wave: a soft bright crest, a thin rim and a slight shadow on its inside
  if (a <= .01) return; [[1, .6], [.82, .3], [.62, .15]].forEach(([k, m]) => { const sp = span * k, g = ctx.createRadialGradient(cx, cy, Math.max(1, R - th), cx, cy, R + th);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.38, `rgba(20,10,40,${.07 * a * m})`); g.addColorStop(.62, `rgba(255,255,255,${.3 * a * m})`); g.addColorStop(.78, `rgba(220,240,255,${.14 * a * m})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = th * 2; ctx.beginPath(); ctx.arc(cx, cy, R, -sp, sp); ctx.stroke(); }); }
function drawHorns() { if (!horns.length) return;
  if (WARP.width !== cv.width || WARP.height !== cv.height) { WARP.width = cv.width; WARP.height = cv.height; }
  wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.clearRect(0, 0, WARP.width, WARP.height); wctx.drawImage(cv, 0, 0);   // what's on screen right now
  const m = ctx.getTransform(), D = m.a, X = x => x * D + m.e, Y = y => y * D + m.f;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
  horns.forEach(h => { const T = h.t, fade = Math.max(0, 1 - Math.max(0, T - .3) / .7), [hx, hy] = T < .4 ? hornOrigin() : [h.x, h.y];
    const cx = X(h.x), cy = Y(h.y), front = T * 1100 * D, th = 30 * D;
    // the big wave that clears everything, with two ripples following it
    [[0, 1], [70, .6], [135, .35]].forEach(([back, k]) => { const R = front - back * D; if (R < 12 * D) return; const a = fade * k;
      warpRing(cx, cy, R, th * (.6 + .4 * k), .11 * a, T * 34 + back, -1.25, 1.25, 28); glassBand(cx, cy, R, th * (.6 + .4 * k), a, 1.2); });
    // little waves pumping out of the horn while it sounds
    const ox = X(hx), oy = Y(hy);
    for (let k = 0; k < 7; k++) { const age = T - k * .07; if (age <= 0 || age > .5) continue; const R = (12 + age * 460) * D, a = (1 - age / .5) * fade;
      warpRing(ox, oy, R, 12 * D, .08 * a, age * 60 + k, -.9, .9, 12); glassBand(ox, oy, R, 12 * D, a * .9, .85); } });
  ctx.restore(); }
function hornBtn() { const b = $('bHorn'); if (!b) return; const on = state === 'play' && !hero.dead && veh && veh.k === 'tuktuk' && !(veh.asm !== undefined && veh.asm < 1); b.classList.toggle('hide', !on); if (!on) return;
  b.style.setProperty('--cd', ((1 - Math.max(0, hornCD) / HORN_CD) * 100).toFixed(1) + '%'); b.classList.toggle('ready', hornCD <= 0); b.classList.toggle('act', veh.hornK > .15); }
function mechDeflect(o) { o.defl = 1; o.v = -(speed + 420); o.vy = -260 - Math.random() * 160; o.rot = Math.PI; o.spin = (Math.random() < .5 ? -1 : 1) * (5 + Math.random() * 4);
  SFX.clank(1); tone(600, .12, 'square', .05, 1.8, MIX && MIX.fx); shake = Math.max(shake, .12); flashT = .05; flashCol = '255,240,200';
  for (let i = 0; i < 16; i++) sparks.push({ x: o.x, y: o.y, vx: Math.random() * 260, vy: (Math.random() - .5) * 260, l: .35 + Math.random() * .25, c: ['#ffd75a', '#ffffff', '#ff9a2a'][i % 3] });
  pops.push({ x: hero.x + 30, y: hero.y - 175 * MCH, txt: 'DEFLECTED!', col: '#7fe3ff', t: 0 }); RUN.deflect = (RUN.deflect || 0) + 1; }
function vehCrash() {
  const k = veh.k; veh = null; inv = 1.8; shake = .3; flashT = .15; flashCol = '255,200,120'; SFX.boom();
  hero.vy = -480; hero.ground = false;
  const cols = { tuktuk: ['#f7c51e', '#141414', '#ffe066', '#c9ced8'], carpet: ['#b3202e', '#ffd75a', '#7a1020', '#ffe9a8'], kabootar: ['#eef0f4', '#9aa3b5', '#7f899e', '#4fa36a'], sandals: ['#7dffa0', '#2fbf4a', '#c9a06a', '#ffffff'], mech: ['#e2252b', '#141418', '#ffffff', '#ff5a5c'], logman: ['#e8781e', '#b8500e', '#ffa64a', '#5a2a0a'] }[k];
  POL.chunks(cols); if (k === 'kabootar') pops.push({ x: hero.x + 20, y: hero.y - 140, txt: 'COO!', col: '#e8ecf4', t: 0 });
  for (let i = 0; i < 26; i++) sparks.push({ x: hero.x + (Math.random() - .5) * 50, y: hero.y - 20 + (Math.random() - .5) * 30, vx: (Math.random() - .4) * 300, vy: -Math.random() * 280, l: .9 + Math.random() * .5, c: cols[i % 4] });
  for (let i = 0; i < 12; i++) steam.push({ x: hero.x + (Math.random() - .5) * 40, y: hero.y - 20, vx: (Math.random() - .5) * 120, vy: -Math.random() * 80, r: 5 + Math.random() * 4, l: .7, l0: .9 });
  pops.push({ x: hero.x, y: hero.y - 70, txt: { tuktuk: 'TUK-TUK GONE!', carpet: 'CARPET GONE!', kabootar: 'KABOOTAR FLEW OFF!', sandals: 'SANDALS SNAPPED!', mech: 'MECH WRECKED!', logman: 'STRIKE OUT!' }[k], col: '#ffd75a', t: 0 });
}
const LMS = .096;   // Lakri Man scale: a bit taller than the hero (owner 23 Nov)
const LOG_LIFE = 24, BAT_HP = 6, BAT_CD = .45;
function batAngle() { if (!veh || (veh.swT == null) || veh.swT < 0) return null; const k = veh.swT / .34; if (k < .25) return 2.4 + k / .25 * .5; const f = (k - .25) / .45; if (f < 1) return 2.9 - f * f * 4.5; return -1.6 + Math.min(1, (k - .7) / .3) * 1.6; }   // wind up behind the head, whip round, follow through
function batSwing() { if (!veh || veh.k !== 'logman' || veh.morph < 1 || (veh.batHP || 0) <= 0 || state !== 'play' || paused || (veh.batCD || 0) > 0) return; veh.swT = 0; veh.batCD = BAT_CD; veh.hitDone = 0; veh.face = 'angry'; SFX.whoosh(); tone(200, .1, 'triangle', .04, 2.4, MIX && MIX.fx); }
function batTick(dt) { if (veh.batCD > 0) veh.batCD -= dt; if (veh.swT < 0) return; if (veh.swT === 0) veh.missed = 0; veh.swT += dt; if (veh.swT > .34) { veh.swT = -1; return; }
  if (veh.swT < .08 || veh.swT > .26) return;   // the bat's sweet spot is on the forward whip
  const q = LMS * (window.LOGMAN_H || 685) / 685, wide = SHOP.bat === 'bat_alu' || veh.gold ? 1.3 : 1, bx0 = hero.x - 6, bx1 = hero.x + 95 * q * wide, by0 = hero.y - 105 * q, by1 = hero.y - 8;
  const inBox = (x, y, m = 0) => x > bx0 - m && x < bx1 + m && y > by0 - m && y < by1 + m; let hit = 0;
  obs.forEach(o => { if (o.honk) return;
    if (o.type === 'zap') { const ca = Math.cos(o.ang), sa = Math.sin(o.ang), hl = o.len / 2; let near = false; for (let u = -1; u <= 1; u += .25) if (inBox(o.x + ca * hl * u, o.y + sa * hl * u, 12)) near = true; if (near) { o.honk = 1; wreckZap(o); batHit(o.x, o.y, 'BASE HIT!'); hit++; } }
    else if (o.type === 'rocket' && o.v && !o.defl && inBox(o.x, o.y, 22)) { o.defl = 1; o.v = -(speed + 560); o.vy = -260 - Math.random() * 160; o.rot = Math.PI; o.spin = (Math.random() < .5 ? -1 : 1) * (7 + Math.random() * 4); o.homer = 1; batHit(o.x, o.y, 'HOME RUN!'); SFX.charge && SFX.charge(); setTimeout(() => homeRunLands(), 700 + Math.random() * 300); hit++; }
    else if (o.type === 'laser' && (o.ph === 'fire' || o.ph === 'warn') && o.y > by0 - 10 && o.y < by1 + 10) { o.honk = 1; wreckLaser(o); batHit(hero.x + 60 * q, o.y, 'BATTED!'); hit++; } });
  if (!hit && veh.swT > .25 && !veh.missed) { veh.missed = 1; if (veh.streak > 1) pops.push({ x: hero.x + 20, y: hero.y - 110, txt: 'STREAK OVER', col: '#c8c0e0', t: 0 }); veh.streak = 0; }
  if (hit) { veh.batHP -= SHOP.bat === 'bat_gold' && Math.random() < .3 ? 0 : 1; if (veh.batHP <= 0) { pops.push({ x: hero.x + 30, y: hero.y - 140, txt: 'BAT SNAPPED!', col: '#ff8a4a', t: 0 }); tone(300, .2, 'square', .06, .4, MIX && MIX.fx); POL.chunks(['#c06a2c', '#8a4a1c', '#e09050']); veh.face = 'sad'; } } }
function batHit(x, y, txt) { veh.face = 'grin'; shake = Math.max(shake, .14); HITT = .06; tone(180, .12, 'square', .07, .5, MIX && MIX.fx); if (SHOP.bat === 'bat_alu') tone(2600, .25, 'sine', .05, .98, MIX && MIX.fx); else tone(900, .06, 'square', .05, .6, MIX && MIX.fx);
  veh.streak = (veh.streak || 0) + 1; const mult = Math.min(5, veh.streak), pay = 2 * mult + (SHOP.bat === 'bat_gold' || veh.gold ? 3 : 0); coins += pay; $('coins').textContent = '£' + coins; RUN.honked = (RUN.honked || 0) + 1;
  pops.push({ x, y: y - 20, txt: txt + ' +£' + pay, col: '#ffe680', t: 0 }); if (mult > 1) pops.push({ x: hero.x + 10, y: hero.y - 140, txt: '×' + mult + ' STREAK', col: '#7dffa0', t: 0 });
  if (SHOP.bat === 'bat_gold' || veh.gold) for (let i = 0; i < 4; i++) POL.fx.push({ k: 'spill', x, y, vx: 40 + Math.random() * 120, vy: -120 - Math.random() * 120, t: 0, l: 1.2, b: 0, sp: Math.random() * 6 });
  for (let i = 0; i < 14; i++) sparks.push({ x, y, vx: 80 + Math.random() * 280, vy: (Math.random() - .5) * 260, l: .4, c: ['#ffffff', '#ffd75a', '#c06a2c'][i % 3] }); }
function homeRunLands() {   // the batted rocket comes down somewhere off to the right
  if (state !== 'play') return; const r = Math.random(), x = W * (.55 + Math.random() * .35), y = FLOOR - 10;
  for (let i = 0; i < 16; i++) sparks.push({ x, y: y - 20, vx: (Math.random() - .5) * 300, vy: -Math.random() * 260, l: .5, c: ['#ffd75a', '#ff8a2a', '#ffffff'][i % 3] }); SFX.thud && SFX.thud(); shake = Math.max(shake, .1);
  if (r < .3) { for (let i = 0; i < 12; i++) coinList.push({ x: x + 30 + (i % 4) * 16, y: y - 30 - Math.floor(i / 4) * 16, got: 0 }); pops.push({ x, y: y - 60, txt: 'COIN SHOWER!', col: '#ffd75a', t: 0 }); }
  else if (r < .55) { for (let i = 0; i < 8; i++) POL.fx.push({ k: 'feather', x: x + (Math.random() - .5) * 30, y: y - 40 - Math.random() * 30, vx: (Math.random() - .5) * 120, vy: -40 - Math.random() * 60, t: 0, l: 1.6, a: Math.random() * 6, sp: (Math.random() - .5) * 8 }); pops.push({ x, y: y - 60, txt: 'PIGEONS!', col: '#e8ecf4', t: 0 }); tone(1800, .05, 'triangle', .02, .7, MIX && MIX.fx); }
  else if (r < .85) { pops.push({ x, y: y - 60, txt: 'CAR ALARM!', col: '#ff8a8a', t: 0 }); for (let i = 0; i < 8; i++) setTimeout(() => tone(i % 2 ? 880 : 660, .16, 'square', .025, 0, MIX && MIX.traffic), i * 180); }
  else { coins += 10; $('coins').textContent = '£' + coins; pops.push({ x, y: y - 60, txt: 'GRAND SLAM! +£10', col: '#ffd75a', t: 0 }); flashT = .1; flashCol = '255,230,150'; [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .12, 'square', .05), i * 80)); } }
function logRevert() {   // back to normal: he splinters back into the hero with a puff, never a death
  const x = hero.x, y = hero.y; POL.chunks(['#c06a2c', '#8a4a1c', '#e09050', '#5a2a0a']); for (let i = 0; i < 12; i++) steam.push({ x: x + (Math.random() - .5) * 40, y: y - 20 - Math.random() * 50, vx: (Math.random() - .5) * 140, vy: -30 - Math.random() * 60, r: 4 + Math.random() * 4, l: .6, l0: .7 });
  flashT = .12; flashCol = '255,200,140'; tone(392, .12, 'square', .05); setTimeout(() => tone(262, .2, 'square', .05), 110); pops.push({ x, y: y - 100, txt: 'BACK TO NORMAL!', col: '#ffd75a', t: 0 });
  veh = null; inv = 1.6; hero.vy = -380; hero.ground = false; }
function logZap(o) { if (Math.random() < .5) sparks.push({ x: hero.x + (Math.random() - .5) * 30, y: hero.y - 40 - Math.random() * 30, vx: (Math.random() - .5) * 220, vy: (Math.random() - .5) * 220, l: .25, c: Math.random() < .5 ? '#fff6a8' : '#ffffff' });
  if (!o.logP) { o.logP = 1; veh.face = 'smug'; pops.push({ x: hero.x + 20, y: hero.y - 110, txt: "WOOD DON'T CONDUCT!", col: '#ffb04a', t: 0 }); tone(1600, .06, 'square', .03, .5, MIX && MIX.fx); } }
const LMC = {};   // the hero split for the mutation: body without the cooker, and the cooker on its own (art/cookmask.webp)
function heroSplit(f) { const key = (heroImg.src || '') + ':' + f; if (LMC[key]) return LMC[key]; if (!COOKMASK.complete || !COOKMASK.naturalWidth || !heroImg.naturalWidth) return null;
  const cw = HW * HX4, ch = HH0 * HX4, mk = op => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d'); g.drawImage(heroImg, f * cw, 0, cw, ch, 0, 0, cw, ch); g.globalCompositeOperation = op; g.drawImage(COOKMASK, f * cw, 0, cw, ch, 0, 0, cw, ch); return c; };
  return LMC[key] = { body: mk('destination-out'), cook: mk('destination-in') }; }
function drawLogVeh() { const x = hero.x, y = hero.y, m = veh.morph || 0, onG = y >= FLOOR - .5, st = { ph: veh.ph, air: onG ? 0 : 1, face: veh.face, t, spin: veh.spin || 0, flip: veh.flipT !== undefined ? veh.flipT / (veh.flipD || .45) * Math.PI * 2 * (veh.flipN || 1) : 0, bat: (veh.batHP || 0) > 0, swing: batAngle(), swingE: 0, skin: veh.gold ? 'gold' : '', batK: veh.gold ? 'gold' : ({ bat_tape: 'tape', bat_alu: 'alu', bat_gold: 'gold' }[SHOP.bat] || ''), squash: veh.sq || 0 };
  ctx.fillStyle = 'rgba(30,10,30,.25)'; ctx.beginPath(); ctx.ellipse(x, FLOOR + 1, 16, 3, 0, 0, 7); ctx.fill();
  if (m >= 1) { if (veh.gold) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y - 40, 4, x, y - 40, 60); gl.addColorStop(0, 'rgba(255,215,90,.35)'); gl.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 60, y - 100, 120, 110); ctx.restore(); if (Math.random() < .5) POL.fx.push({ k: 'star', x: x - 10 + (Math.random() - .5) * 20, y: y - Math.random() * 70, vx: -speed * .3 - 20, vy: -10 - Math.random() * 30, t: 0, l: .7, r: 1.4 + Math.random(), col: Math.random() < .5 ? '#ffd75a' : '#fff6c0' }); }
    drawLogman(ctx, x, y, LMS, st); return; }
  // ---- the mutation (owner 23 Nov: like the Hulk): he shakes and turns orange, the cooker drops off, his body stretches and his head is squashed into the log, then the log man bursts out ----
  const f = FR('run0_normal'), sp = heroSplit(f), e = k => Math.max(0, Math.min(1, k));
  const shakeA = (m < .7 ? 1.5 + m * 5 : 0), jx = (Math.random() - .5) * shakeA, jy = (Math.random() - .5) * shakeA;
  const orange = e(m / .45), stretch = e((m - .25) / .4), out = e((m - .55) / .25), grow = e((m - .5) / .35);
  if (sp && out < 1) { ctx.save(); ctx.translate(x + jx, y + jy); ctx.globalAlpha = 1 - out;
    const sx = 1 - stretch * .35 + Math.sin(m * 40) * .03 * stretch, sy = 1 + stretch * .55; ctx.scale(sx, sy);
    tintCv.width = sp.body.width; tintCv.height = sp.body.height; const tc = tintCv.getContext('2d'); tc.drawImage(sp.body, 0, 0); tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = `rgba(232,120,30,${(orange * .85).toFixed(3)})`; tc.fillRect(0, 0, tintCv.width, tintCv.height);
    tc.globalCompositeOperation = 'source-over'; ctx.drawImage(tintCv, -HW * HS / 2, -HH, HW * HS, HH);
    if (stretch > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const vg = ctx.createRadialGradient(0, -HH * .6, 0, 0, -HH * .6, 30); vg.addColorStop(0, `rgba(255,150,40,${(.5 * stretch).toFixed(3)})`); vg.addColorStop(1, 'rgba(255,120,20,0)'); ctx.fillStyle = vg; ctx.fillRect(-40, -HH - 20, 80, HH + 20); ctx.restore(); }   // veins of orange light
    ctx.restore(); }
  // the cooker comes off: falls and bounces away on the pavement
  if (sp) { if (!veh.ck) veh.ck = { x: x - 10, y: y - 30, vx: -70, vy: -160, a: 0, b: 0 }; const C = veh.ck; if (m > .3) { const dt = 1 / 60; C.vy += 1100 * dt; C.x += (C.vx - speed * .5) * dt; C.y += C.vy * dt; C.a -= 7 * dt * (C.b ? .4 : 1); if (C.y > FLOOR - 8) { C.y = FLOOR - 8; if (C.vy > 120) { C.vy = -C.vy * .4; C.b++; if (C.b === 1) { tone(700, .08, 'square', .05, .7, MIX && MIX.fx); tone(1100, .06, 'square', .04, .8, MIX && MIX.fx); } } else C.vy = 0; } }
    ctx.save(); ctx.translate(m > .3 ? C.x : x + jx, m > .3 ? C.y : y + jy); if (m > .3) { ctx.rotate(C.a); ctx.translate(10, -(HH - 30)); } ctx.drawImage(sp.cook, -HW * HS / 2, -HH, HW * HS, HH); ctx.restore(); }
  if (grow > 0) { const ov = grow < 1 ? 1 + Math.sin(grow * Math.PI) * .18 : 1; ctx.save(); ctx.globalAlpha = Math.min(1, grow * 1.6); ctx.translate(x, y); ctx.scale(.55 + .45 * grow * ov, (.4 + .6 * grow) * ov); drawLogman(ctx, 0, 0, LMS, { ph: 0, air: 0, face: grow < .6 ? 'angry' : 'shock', t }); ctx.restore(); }
  if (m > .5 && m < .62 && !veh.burst) { veh.burst = 1; flashT = .14; flashCol = '255,180,90'; shake = Math.max(shake, .3); for (let i = 0; i < 26; i++) sparks.push({ x: x + (Math.random() - .5) * 30, y: y - 40 - Math.random() * 40, vx: (Math.random() - .5) * 380, vy: -Math.random() * 300, l: .7, c: ['#e8781e', '#ffa64a', '#b8500e', '#fff0c0'][i % 4] }); for (let i = 0; i < 10; i++) steam.push({ x: x + (Math.random() - .5) * 40, y: y - 30 - Math.random() * 40, vx: (Math.random() - .5) * 160, vy: -40 - Math.random() * 60, r: 4 + Math.random() * 4, l: .6, l0: .7 }); }
}
function drawVehicle() {
  const x = hero.x, y = hero.y, k = veh.k; if (k === 'logman') { drawLogVeh(); return; }
  if (k === 'kabootar') {   // owner 22 Nov: he rides ON the Flappy pigeon (sitting on its back, wings flapping over his legs)
    const f = veh.wf | 0, K = 1.4, U = PK * K;   // owner 22 Nov: half the old size
    ctx.save(); ctx.translate(x, y); ctx.rotate(hero.rot * .5);
    ctx.fillStyle = 'rgba(30,10,30,.18)'; ctx.beginPath(); ctx.ellipse(0, FLOOR - y + 2, 24 * (1 - Math.min(.6, (FLOOR - y) / 400)), 3, 0, 0, 7); ctx.fill();
    const backY = -9 * U, hf = 'sit' + (Math.floor(t * 3) % 2) + '_happy', rw = HW * HS, rh = HH0 * HS;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(heroImg, FR(hf) * HW * HX4, 0, HW * HX4, HH0 * HX4, -1.5 * U - rw / 2, backY + 7.5 - rh, rw, rh); ctx.imageSmoothingQuality = 'low';
    ctx.imageSmoothingEnabled = false; ctx.drawImage(pigArt[f], -14 * U, -25 * U, 30 * U, 26 * U); ctx.imageSmoothingEnabled = true;
    ctx.restore();
    // TAP TO FLY: big, pulsing, with a tapping finger; stays until he has tapped 3 times (at least 2.5 s)
    if (veh.t < 2.5 || (veh.taps || 0) < 3) { veh.tipA = Math.min(1, (veh.tipA || 0) + .08); } else veh.tipA = Math.max(0, (veh.tipA || 0) - .05);
    if (veh.tipA > 0 && veh.t < 12) { const a = veh.tipA, s = 1 + Math.sin(t * 8) * .07, tp = (t * 2.2) % 1, dn = tp < .25;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, VH * .26); ctx.scale(s, s); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(20,16,32,.72)'; ctx.beginPath(); ctx.roundRect(-118, -30, 236, 60, 30); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd21f'; ctx.stroke();
      ctx.font = '700 28px Silk'; ctx.lineWidth = 6; ctx.strokeStyle = '#1b1a24'; ctx.strokeText('TAP TO FLY', 18, 2); ctx.fillStyle = '#fff'; ctx.fillText('TAP TO FLY', 18, 2);
      // finger tapping, with a ripple on each tap
      ctx.save(); ctx.translate(-88, dn ? 4 : -2); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1a24'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(-5, -18, 10, 24, 5); ctx.roundRect(-14, -2, 28, 20, 8); ctx.fill(); ctx.stroke(); ctx.restore();
      if (tp < .5) { ctx.strokeStyle = 'rgba(255,210,31,' + (1 - tp * 2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-88, -18, 6 + tp * 28, 0, 7); ctx.stroke(); }
      ctx.restore(); }
    return;
  }
  if (k === 'mech' && window.drawMech) {
    ctx.save(); ctx.translate(x, y);
    if (veh.su < 1.1) { ctx.save(); ctx.globalAlpha = Math.min(.35, veh.su * 3) * (1 - Math.max(0, veh.su - 1) * 10); ctx.globalCompositeOperation = 'lighter'; const q = ctx.createRadialGradient(0, -60, 0, 0, -60, 140); q.addColorStop(0, 'rgba(255,220,150,.9)'); q.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = q; ctx.beginPath(); ctx.arc(0, -60, 140, 0, 7); ctx.fill(); ctx.restore(); }
    const lift = FLOOR - y; ctx.fillStyle = 'rgba(20,10,30,.28)'; ctx.beginPath(); ctx.ellipse(0, lift + 1, 64 * MCH * (1 - Math.min(.5, lift / 400)), 4 + 3 * MCH, 0, 0, 7); ctx.fill();
    const sq = Math.max(veh.sq || 0, (veh.crouch || 0) * 10); ctx.rotate(veh.lean || 0); ctx.scale(MCH * (1 + sq * .1), MCH * (1 - sq * .14)); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    window.drawMech(ctx, { su: veh.su, ph: veh.wp, air: veh.air, bob: (4.5 * Math.exp(-((veh.wp * 2) % 1) * 7) - 1) * (1 - veh.air), thr: veh.thr, t, blink: veh.blink,
      push: veh.shA || 0, shield: veh.shA || 0, hit: veh.shHit || 0, cat: g => { if (CAT.built()) { g.save(); g.translate(-18, -125); CAT.lie(g, MCH, { hang: 1 }); g.restore(); } },
      hero: (g) => { const w = HW * HS / MCH, h = HH0 * HS / MCH; g.drawImage(heroImg, FR('run0_happy') * HW * HX4, 0, HW * HX4, HH0 * HX4, -w / 2 + 2, -70 - h + 4, w, h); } });   // he stands in the chest at his normal size while the suit builds round him
    if (veh.shock > 0) {   // electricity crawling over the suit: jagged arcs re-drawn every frame, the suit flashes pale blue
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = Math.min(1, veh.shock / .2); { const q = ctx.createRadialGradient(0, -90, 0, 0, -90, 110); q.addColorStop(0, `rgba(160,232,255,${.28 * a})`); q.addColorStop(1, 'rgba(160,232,255,0)'); ctx.fillStyle = q; ctx.beginPath(); ctx.arc(0, -90, 110, 0, 7); ctx.fill(); } ctx.globalAlpha = a; ctx.lineJoin = 'round';
      for (let k = 0; k < 4; k++) { let x0 = -40 + Math.random() * 80, y0 = -170 + Math.random() * 160; ctx.strokeStyle = k % 2 ? '#fff6a8' : '#c8f4ff'; ctx.shadowColor = '#7fe3ff'; ctx.shadowBlur = 8; ctx.lineWidth = 1.6 + Math.random();
        ctx.beginPath(); ctx.moveTo(x0, y0); for (let j = 0; j < 6; j++) { x0 += (Math.random() - .5) * 28; y0 += (Math.random() - .3) * 24; ctx.lineTo(x0, y0); } ctx.stroke(); }
      ctx.restore(); }
    ctx.restore(); return;
  }
  if (k === 'sandals') {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, veh.s);
    const on = veh.on, fn = on ? 'run' + (Math.floor(hero.run) % 6) + '_normal' : 'glide0_normal';
    if (Math.random() < .3) sparks.push({ x: x + (Math.random() - .5) * 22, y: y - 2 * veh.s, vx: -speed * .2 + (Math.random() - .5) * 30, vy: (Math.random() * 50 + 15) * veh.s, l: .25, c: Math.random() < .5 ? '#7dff9c' : '#d6ffe0' });
    const sim = sandImgs[SHOP.outfit] || sandImgs.classic, sfi = on ? Math.floor(hero.run) % 6 : 6, sok = sim.complete && sim.naturalWidth;
    ctx.imageSmoothingEnabled = true; if (sok) ctx.drawImage(sim, sfi * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH); else ctx.drawImage(heroImg, FR(fn) * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH);
    if (!sok) { ctx.save(); ctx.shadowColor = '#4dff7a'; ctx.shadowBlur = 12; ctx.fillStyle = '#3dff6e'; roundRect(-8, -4, 26, 4.5, 2); ctx.fill(); ctx.restore(); ctx.fillStyle = '#e4ffe9'; ctx.fillRect(-5, -3.2, 20, 1.2); }
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(hero.rot);
  if (k === 'tuktuk') {   // auto-rickshaw, side on; he sits fully inside, seen through the open side (owner, 21 Nov)
    const onG = hero.y >= FLOOR - .5, bob = onG ? Math.sin(hero.run * 2.2) * 1 + Math.sin(hero.run * 5.3) * .4 : 0, nose = onG ? 0 : Math.max(-.16, Math.min(.08, hero.vy / 2600));
    ctx.rotate(nose); ctx.fillStyle = 'rgba(30,10,30,.3)'; ctx.beginPath(); ctx.ellipse(2, (FLOOR - y) + 1, 52 * (1 - Math.min(.5, (FLOOR - y) / 400)), 5, 0, 0, 7); ctx.fill();
    if (veh.rock > 0) ctx.rotate(-Math.sin(veh.rock / .25 * Math.PI) * .07);   // rocks back on the horn blast
    { const sq = veh.sq || 0; ctx.scale(1.2 * (1 + sq * .08), 1.2 * (1 - sq * .12)); }   // bigger tuk-tuk (owner 22 Nov), squash on landing, stretch on take-off
    ctx.translate(0, bob);
    // owner 23 Nov: redrawn to match the new car renders: real tyres with tread and sidewall, chrome rims that blur when fast
    const wheel = (wx, r) => { ctx.save(); ctx.translate(wx, -r - bob);
      ctx.fillStyle = '#0e0e12'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      const sw = ctx.createRadialGradient(0, 0, r * .55, 0, 0, r); sw.addColorStop(0, '#2a2a30'); sw.addColorStop(.7, '#1a1a1f'); sw.addColorStop(1, '#0a0a0d'); ctx.fillStyle = sw; ctx.beginPath(); ctx.arc(0, 0, r * .97, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r * .86, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
      const rg = ctx.createLinearGradient(0, -r * .6, 0, r * .6); rg.addColorStop(0, '#ffffff'); rg.addColorStop(.35, '#c9cfd8'); rg.addColorStop(.6, '#7d8592'); rg.addColorStop(1, '#d9dde4'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, r * .6, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a3e46'; ctx.beginPath(); ctx.arc(0, 0, r * .46, 0, 7); ctx.fill();
      const fast = speed > 260; ctx.rotate(hero.run * 3);
      if (fast) { const bl = ctx.createRadialGradient(0, 0, r * .1, 0, 0, r * .46); bl.addColorStop(0, '#e6e9ee'); bl.addColorStop(1, '#8d94a0'); ctx.fillStyle = bl; ctx.globalAlpha = .75; ctx.beginPath(); ctx.arc(0, 0, r * .46, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.fillStyle = '#dfe3e9'; for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * 1.0472); ctx.globalAlpha = fast ? .35 : 1; ctx.fillRect(-r * .06, -r * .46, r * .12, r * .4); ctx.restore(); } ctx.globalAlpha = 1;
      ctx.fillStyle = '#1b1d22'; ctx.beginPath(); ctx.arc(0, 0, r * .17, 0, 7); ctx.fill(); ctx.fillStyle = '#e04848'; ctx.beginPath(); ctx.arc(0, 0, r * .09, 0, 7); ctx.fill();
      ctx.restore(); };
    wheel(-28, 9);
    if (onG && Math.random() < .5) dust.push({ x: x - 50, y: y - 8, vx: -40 - Math.random() * 30, vy: -10 - Math.random() * 12, r: 1.6 + Math.random(), l: .45 });   // exhaust
    // inside first: dark cabin, seat, then our hero (scaled to fit), all clipped to the side opening
    const OP = (np) => { if (!np) ctx.beginPath(); ctx.moveTo(-38, -36); ctx.lineTo(-38, -66); ctx.quadraticCurveTo(-37, -76, -26, -77); ctx.lineTo(10, -77); ctx.quadraticCurveTo(18, -76, 20, -66); ctx.lineTo(22, -36); ctx.closePath(); };
    ctx.save(); OP(); ctx.clip(); ctx.fillStyle = '#2a1e2e'; ctx.fillRect(-40, -80, 64, 46); ctx.fillStyle = '#8a1e2e'; roundRect(-36, -52, 26, 14, 3); ctx.fill(); ctx.fillStyle = '#a8283a'; roundRect(-36, -64, 8, 26, 3); ctx.fill();
    const hs = .72; ctx.drawImage(heroImg, FR('run0_happy') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HSR * hs / 2 - 2, -HHR * hs - 22, HW * HSR * hs, HHR * hs);
    ctx.fillStyle = '#1a1a1e'; ctx.fillRect(8, -58, 2, 18); ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.ellipse(10, -58, 2, 5, -.4, 0, 7); ctx.fill();   // handlebar in front of him
    ctx.restore();
    // body (owner 23 Nov redraw): glossy yellow paint with a clear-coat reflection, panel lines, black stripe, chrome bumper, step and mudguards
    const BODY = () => { ctx.beginPath(); ctx.moveTo(-46, -10); ctx.lineTo(-46, -34); ctx.quadraticCurveTo(-46, -40, -40, -40); ctx.lineTo(24, -40); ctx.lineTo(38, -22); ctx.quadraticCurveTo(42, -14, 40, -8); ctx.lineTo(-44, -8); ctx.closePath(); };
    { const pg = ctx.createLinearGradient(0, -40, 0, -8); pg.addColorStop(0, '#fff3a0'); pg.addColorStop(.18, '#ffd935'); pg.addColorStop(.55, '#f5bd12'); pg.addColorStop(.85, '#c98f00'); pg.addColorStop(1, '#8a5e00'); ctx.fillStyle = pg; BODY(); ctx.fill();
      ctx.save(); BODY(); ctx.clip();
      const rf = ctx.createLinearGradient(-46, 0, 42, 0); rf.addColorStop(0, 'rgba(255,255,255,0)'); rf.addColorStop(.3, 'rgba(255,255,255,.42)'); rf.addColorStop(.45, 'rgba(255,255,255,.08)'); rf.addColorStop(.7, 'rgba(255,255,255,.3)'); rf.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rf; ctx.beginPath(); ctx.moveTo(-46, -38); ctx.quadraticCurveTo(0, -35, 30, -37); ctx.lineTo(34, -32); ctx.quadraticCurveTo(0, -30, -46, -33); ctx.fill();   // clear-coat reflection band
      ctx.fillStyle = 'rgba(120,70,0,.25)'; ctx.beginPath(); ctx.ellipse(-28, -6, 15, 9, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.ellipse(30, -6, 13, 8, 0, Math.PI, 0); ctx.fill();   // shadow in the wheel arches
      ctx.restore();
      ctx.strokeStyle = '#4a3200'; ctx.lineWidth = 1.1; BODY(); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,55,0,.5)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(22, -39); ctx.quadraticCurveTo(20, -24, 24, -10); ctx.stroke();   // front cowl seam
      ctx.beginPath(); ctx.moveTo(-40, -39); ctx.lineTo(-40, -10); ctx.stroke(); }
    { const sg = ctx.createLinearGradient(0, -26, 0, -20); sg.addColorStop(0, '#3a3a40'); sg.addColorStop(.4, '#111114'); sg.addColorStop(1, '#000'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-46, -26); ctx.lineTo(35.5, -26); ctx.lineTo(37, -21); ctx.lineTo(-46, -21); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-46, -25.6, 81, .7); }   // black stripe with a gloss line
    ctx.fillStyle = '#1a1a1e'; roundRect(-38, -9.5, 58, 3.5, 1.5); ctx.fill(); ctx.fillStyle = '#5a5e66'; ctx.fillRect(-36, -9.2, 54, .8);   // step under the opening
    { const mg = ctx.createLinearGradient(0, -20, 0, -8); mg.addColorStop(0, '#2c2c33'); mg.addColorStop(1, '#0c0c10'); ctx.strokeStyle = mg; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(30, -8, 11, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }   // front mudguard
    { const cb = ctx.createLinearGradient(0, -15, 0, -9); cb.addColorStop(0, '#ffffff'); cb.addColorStop(.4, '#b9c0cc'); cb.addColorStop(1, '#5d6573'); ctx.fillStyle = cb; roundRect(36, -15, 7.5, 5.5, 2); ctx.fill(); }   // chrome front bumper
    ctx.fillStyle = '#f4f4f6'; roundRect(-27, -17.5, 22, 7, 1.2); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = .5; ctx.stroke(); ctx.fillStyle = '#1a1a1e'; ctx.font = '700 5.4px Mont, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LUTON', -16, -12.2);   // plate
    // canopy: black fabric roof curving down to the windscreen, frame round the opening, stitching and a soft sheen
    { const cg = ctx.createLinearGradient(0, -88, 0, -36); cg.addColorStop(0, '#3a3a44'); cg.addColorStop(.25, '#1e1e24'); cg.addColorStop(1, '#141418'); ctx.fillStyle = cg; }
    ctx.beginPath(); ctx.moveTo(-48, -34); ctx.lineTo(-48, -70); ctx.quadraticCurveTo(-46, -86, -26, -87); ctx.lineTo(12, -87); ctx.quadraticCurveTo(28, -86, 32, -70); ctx.lineTo(38, -40); ctx.lineTo(24, -40); ctx.lineTo(22, -36); ctx.lineTo(-38, -36); ctx.closePath();
    OP(true); ctx.fill('evenodd'); ctx.strokeStyle = '#000'; ctx.lineWidth = .9; ctx.stroke();
    ctx.save(); ctx.setLineDash([2, 1.6]); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(-45, -70); ctx.quadraticCurveTo(-43, -83, -26, -84); ctx.lineTo(12, -84); ctx.quadraticCurveTo(25, -83, 29, -70); ctx.stroke(); ctx.restore();   // stitching
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(-44, -72); ctx.quadraticCurveTo(-42, -84, -26, -85); ctx.lineTo(10, -85); ctx.lineTo(10, -82.5); ctx.lineTo(-26, -82.5); ctx.quadraticCurveTo(-40, -81, -42, -70); ctx.fill();
    { const gr2 = ctx.createLinearGradient(0, -77, 0, -36); gr2.addColorStop(0, '#e8ecf2'); gr2.addColorStop(1, '#7d8592'); ctx.strokeStyle = gr2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(-40, -64); ctx.quadraticCurveTo(-38, -73, -28, -73); ctx.lineTo(4, -73); ctx.stroke(); }   // chrome grab rail
    ctx.fillStyle = '#ffd21f'; ctx.fillRect(-48, -76, 3, 30); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-48, -76, 1, 30);   // yellow stripe on the back
    { const ws = ctx.createLinearGradient(22, -82, 35, -44); ws.addColorStop(0, 'rgba(210,235,255,.75)'); ws.addColorStop(.5, 'rgba(140,190,230,.45)'); ws.addColorStop(1, 'rgba(90,140,190,.6)'); ctx.fillStyle = ws; ctx.beginPath(); ctx.moveTo(22, -82); ctx.quadraticCurveTo(28, -80, 31, -70); ctx.lineTo(35, -44); ctx.lineTo(26, -44); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(25, -76); ctx.lineTo(29, -52); ctx.stroke(); }   // windscreen with a glint
    ctx.fillStyle = '#1a1a1e'; ctx.fillRect(34, -54, 5, 1.4); { const mr = ctx.createLinearGradient(38, -58, 41, -50); mr.addColorStop(0, '#ffffff'); mr.addColorStop(1, '#8a92a0'); ctx.fillStyle = mr; roundRect(38.4, -58.5, 3, 6, 1.2); ctx.fill(); }   // mirror
    // headlight: chrome bezel, glowing lens, a soft cone of light that spreads and shimmers, and a pool of light on the road
    { const fl = .9 + .1 * Math.sin(t * 23) * Math.sin(t * 7.1), lx = 39.5, ly = -26;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [len, sp, a] of [[120, 26, .07], [100, 17, .09], [80, 9, .12]]) { const bg = ctx.createLinearGradient(lx, 0, lx + len, 0); bg.addColorStop(0, `rgba(255,246,200,${(a * fl).toFixed(3)})`); bg.addColorStop(.6, `rgba(255,240,190,${(a * .5 * fl).toFixed(3)})`); bg.addColorStop(1, 'rgba(255,240,190,0)');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(lx, ly - 2.5); ctx.quadraticCurveTo(lx + len * .5, ly - sp * .55 - 2, lx + len, ly - sp * .4); ctx.lineTo(lx + len, ly + sp * 1.1); ctx.quadraticCurveTo(lx + len * .5, ly + sp * .75, lx, ly + 2.5); ctx.closePath(); ctx.fill(); }
      const gy = FLOOR - y; if (gy < 70) { const pa = (1 - gy / 70) * .18 * fl, pl = ctx.createRadialGradient(lx + 70, gy, 2, lx + 70, gy, 46); pl.addColorStop(0, `rgba(255,240,190,${pa.toFixed(3)})`); pl.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = pl; ctx.beginPath(); ctx.ellipse(lx + 70, gy, 46, 6, 0, 0, 7); ctx.fill(); }
      const hg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 12); hg.addColorStop(0, `rgba(255,250,220,${(.75 * fl).toFixed(3)})`); hg.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(lx, ly, 12, 0, 7); ctx.fill();
      ctx.restore();
      const bz = ctx.createLinearGradient(lx - 4, ly - 4, lx + 4, ly + 4); bz.addColorStop(0, '#ffffff'); bz.addColorStop(.5, '#9aa2b0'); bz.addColorStop(1, '#4a5260'); ctx.fillStyle = bz; ctx.beginPath(); ctx.arc(lx - 1, ly, 4.4, 0, 7); ctx.fill();
      const ln = ctx.createRadialGradient(lx - 1.6, ly - 1.2, 0, lx - 1, ly, 3.3); ln.addColorStop(0, '#ffffff'); ln.addColorStop(.5, '#fff6c8'); ln.addColorStop(1, '#ffd56a'); ctx.fillStyle = ln; ctx.beginPath(); ctx.arc(lx - 1, ly, 3.3, 0, 7); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,255,240,${(.55 * fl).toFixed(3)})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(lx - 7, ly); ctx.lineTo(lx + 5, ly); ctx.moveTo(lx - 1, ly - 6); ctx.lineTo(lx - 1, ly + 6); ctx.stroke(); ctx.restore(); }
    wheel(30, 8);
    // thrusters (owner 23 Nov): metal nozzles that glow hot, and a real roaring jet out of them: white-hot core, yellow and orange layers,
    // shock diamonds, a heat glow on the nozzle and the road, embers; a much bigger blast on the double jump; a tiny blue pilot flame in the air
    { veh.heat = (veh.heat || 0) + (((veh.thr || veh.dbl > 0) ? 1 : 0) - (veh.heat || 0)) * .18; const H = veh.heat, big = veh.dbl > 0 ? Math.min(1, veh.dbl / .35) : 0, air = !onG;
      [-30, 22].forEach((tx, ni) => {
        if (H > .03 || big > 0) { const L = (26 + 12 * Math.random()) * H + 34 * big, w = 4.6 + 2.4 * big;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const gl = ctx.createRadialGradient(tx, -3, 0, tx, -3, 16 + L * .4); gl.addColorStop(0, `rgba(255,190,90,${(.55 * Math.max(H, big)).toFixed(3)})`); gl.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(tx, -3, 16 + L * .4, 0, 7); ctx.fill();
          const jet = (wd, len, c0, c1, c2) => { const g2 = ctx.createLinearGradient(0, -4, 0, -4 + len); g2.addColorStop(0, c0); g2.addColorStop(.45, c1); g2.addColorStop(1, c2); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(tx - wd, -4);
            for (let k = 1; k <= 6; k++) { const yy = -4 + len * k / 6, ww = wd * (1 - k / 6) * (1 + .18 * Math.sin(t * 60 + k * 2 + ni)); ctx.lineTo(tx - ww + (Math.random() - .5) * .8, yy); }
            for (let k = 6; k >= 1; k--) { const yy = -4 + len * k / 6, ww = wd * (1 - k / 6) * (1 + .18 * Math.cos(t * 57 + k * 2 + ni)); ctx.lineTo(tx + ww + (Math.random() - .5) * .8, yy); } ctx.lineTo(tx + wd, -4); ctx.closePath(); ctx.fill(); };
          jet(w * 1.25, L * 1.05, 'rgba(255,170,60,.7)', 'rgba(255,90,20,.45)', 'rgba(200,40,10,0)');
          jet(w * .85, L * .85, 'rgba(255,240,150,.95)', 'rgba(255,190,60,.7)', 'rgba(255,120,30,0)');
          jet(w * .42, L * .55, 'rgba(255,255,255,1)', 'rgba(210,235,255,.9)', 'rgba(150,200,255,0)');
          for (let d = 0; d < 3; d++) { const yy = -4 + ((t * 140 + d * 9) % (L * .5 + 1)); const dw = 2.2 * (1 - (yy + 4) / (L * .55 + 1)); if (dw > .2) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(tx, yy - dw * 1.6); ctx.lineTo(tx + dw, yy); ctx.lineTo(tx, yy + dw * 1.6); ctx.lineTo(tx - dw, yy); ctx.closePath(); ctx.fill(); } }   // shock diamonds
          const gy2 = FLOOR - y; if (gy2 < 90) { const pa = (1 - gy2 / 90) * .35 * Math.max(H, big), pg2 = ctx.createRadialGradient(tx, gy2, 1, tx, gy2, 30); pg2.addColorStop(0, `rgba(255,170,70,${pa.toFixed(3)})`); pg2.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = pg2; ctx.beginPath(); ctx.ellipse(tx, gy2, 30, 5, 0, 0, 7); ctx.fill(); }
          ctx.restore();
          if (Math.random() < .35) sparks.push({ x: x + tx * 1.2, y: y + (L - 4) * 1.2, vx: -speed * .3 + (Math.random() - .5) * 60, vy: 80 + Math.random() * 120, l: .25, c: Math.random() < .5 ? '#ffd75a' : '#ffffff' }); }
        else if (air) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const pf = 4 + Math.random() * 2, pg3 = ctx.createLinearGradient(0, -4, 0, -4 + pf); pg3.addColorStop(0, 'rgba(180,220,255,.9)'); pg3.addColorStop(1, 'rgba(80,140,255,0)'); ctx.fillStyle = pg3; ctx.beginPath(); ctx.moveTo(tx - 2, -4); ctx.quadraticCurveTo(tx, -4 + pf * 1.4, tx + 2, -4); ctx.fill(); ctx.restore(); }   // pilot flame
        // nozzle: metal bell, darker inside, the rim glowing hot after use
        const nz = ctx.createLinearGradient(tx - 6, 0, tx + 6, 0); nz.addColorStop(0, '#3a3e46'); nz.addColorStop(.35, '#c9cfd8'); nz.addColorStop(.6, '#7d8592'); nz.addColorStop(1, '#2a2d33'); ctx.fillStyle = nz;
        ctx.beginPath(); ctx.moveTo(tx - 4, -10); ctx.lineTo(tx + 4, -10); ctx.lineTo(tx + 6, -4); ctx.lineTo(tx - 6, -4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = .6; ctx.stroke();
        ctx.fillStyle = '#1a1a1e'; ctx.fillRect(tx - 5, -11.2, 10, 1.6);
        ctx.fillStyle = `rgb(${Math.round(40 + 215 * H)},${Math.round(40 + 120 * H)},${Math.round(45 + 20 * H)})`; ctx.beginPath(); ctx.ellipse(tx, -4, 5.4, 1.5, 0, 0, 7); ctx.fill(); });
    }
    { const ex = ctx.createLinearGradient(0, -18, 0, -12); ex.addColorStop(0, '#ffffff'); ex.addColorStop(.5, '#9aa2b0'); ex.addColorStop(1, '#4a5260'); ctx.fillStyle = ex; roundRect(-54, -17, 9, 5, 2); ctx.fill(); ctx.fillStyle = '#121214'; ctx.beginPath(); ctx.ellipse(-54, -14.5, 1.2, 2.2, 0, 0, 7); ctx.fill(); }   // chrome exhaust
    { const hk = Math.max(0, veh.hornK || 0) / .32, sq = Math.sin(hk * Math.PI);   // brass bulb horn on the front pillar: the rubber bulb squeezes and the bell flares when he honks
      ctx.save(); ctx.translate(30, -54); ctx.lineJoin = 'round';
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(-3, 0, 4.2 * (1 - sq * .45), 3.4 * (1 + sq * .25), 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(-4, -1.2, 1.6, 1, 0, 0, 7); ctx.fill();
      const bg = ctx.createLinearGradient(0, -3, 0, 3); bg.addColorStop(0, '#fff0a8'); bg.addColorStop(.45, '#e0a42a'); bg.addColorStop(1, '#8a5a10'); ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(0, -1.2); ctx.lineTo(9, -1.4); ctx.quadraticCurveTo(12, -1.6, 14, -4.6 - sq * 1.6); ctx.lineTo(14, 4.6 + sq * 1.6); ctx.quadraticCurveTo(12, 1.6, 9, 1.4); ctx.lineTo(0, 1.2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5a3a08'; ctx.lineWidth = .7; ctx.stroke(); ctx.fillStyle = '#3a2408'; ctx.beginPath(); ctx.ellipse(14, 0, 1.3, 4.4 + sq * 1.6, 0, 0, 7); ctx.fill(); ctx.restore(); }
    if (CAT.built()) { ctx.save(); ctx.translate(-16, -87); CAT.lie(ctx, 1.2, { wind: 1 }); ctx.restore(); }   // Billi flat on the roof, tail streaming
    // (nitro gauge removed, owner 22 Nov)
    if (onG && Math.floor(t * 20) % 3 === 0) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-60 - i * 6, -50 + i * 12); ctx.lineTo(-72 - i * 6, -50 + i * 12); ctx.stroke(); } }   // speed lines
  } else {   // magic carpet: a real cloth ripple running nose to tail, shaded folds, border + medallion, swinging tassels
    const W2 = 50, n = 24;
    ctx.fillStyle = 'rgba(30,10,30,.18)'; ctx.beginPath(); ctx.ellipse(0, (FLOOR - y), 38, 3, 0, 0, 7); ctx.fill();
    const wave = i => carpetWave(i / n);
    const pts = []; for (let i = 0; i <= n; i++) pts.push([-W2 + i * (W2 * 2 / n), wave(i)]);
    const mid = Math.floor(n * .55);
    if (CAT.built()) { const ci = Math.round(n * .2), [cx, cy] = pts[ci], [cx2, cy2] = pts[ci + 2]; ctx.save(); ctx.translate(cx, cy - 1.5); ctx.rotate(Math.atan2(cy2 - cy, cx2 - cx)); CAT.lie(ctx, 1, { wind: 1 }); ctx.restore(); }   // Billi lying on the cloth, riding its ripple
    ctx.drawImage(heroImg, FR('sit' + (Math.floor(t * 3) % 2) + '_happy') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2 - 3, -HH + 8 + pts[mid][1], HW * HS, HH);   // owner 23 Nov: same size as when he's running; the carpet sits under him
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
  if (o.ph === 'warn') { const f = .6 + .4 * Math.abs(Math.sin(o.pt * 18));   // owner 23 Nov: warning line stands out on the busy street: dark backing, glow, bright dashes
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(20,0,30,.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx + 10, y); ctx.lineTo(rx - 10, y); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(230,70,255,${(.28 * f).toFixed(3)})`; ctx.lineWidth = 10; ctx.stroke(); ctx.restore();
    ctx.strokeStyle = `rgba(255,150,255,${f})`; ctx.lineWidth = 2.4; ctx.setLineDash([10, 6]); ctx.lineDashOffset = -o.pt * 60; ctx.beginPath(); ctx.moveTo(lx + 10, y); ctx.lineTo(rx - 10, y); ctx.stroke(); ctx.lineDashOffset = 0; ctx.setLineDash([]);
    ctx.fillStyle = `rgba(240,110,255,${f})`; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(lx + 12 + Math.random() * 6, y + (Math.random() - .5) * 4, 1.4, 0, 7); ctx.arc(rx - 12 - Math.random() * 6, y + (Math.random() - .5) * 4, 1.4, 0, 7); ctx.fill(); } }
  if (o.ph === 'warn') { const k = o.pt / 1.45; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const ex of [lx + 12, rx - 12]) { const cg = ctx.createRadialGradient(ex, y, 0, ex, y, 6 + k * 12); cg.addColorStop(0, `rgba(255,220,255,${.4 + k * .5})`); cg.addColorStop(1, 'rgba(220,60,255,0)'); ctx.fillStyle = cg; ctx.fillRect(ex - 20, y - 20, 40, 40); } ctx.restore(); }   // charging up
  if (o.ph === 'fire') { const p = Math.min(1, o.pt / .08), th = 5 + Math.sin(t * 40) * 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(200,40,255,${.25 * p})`; ctx.fillRect(lx, y - 15, rx - lx, 30); ctx.fillStyle = `rgba(230,70,255,${.55 * p})`; ctx.fillRect(lx, y - th * 1.6, rx - lx, th * 3.2);
    ctx.fillStyle = `rgba(255,235,255,${.95 * p})`; ctx.fillRect(lx, y - th * .45, rx - lx, th * .9); ctx.restore();
    if (Math.random() < .5) sparks.push({ x: lx + 12, y, vx: 40 + Math.random() * 60, vy: (Math.random() - .5) * 60, l: .25, c: '#f0b0ff' }); }
  [[lx, 1], [rx, -1]].forEach(([x, s]) => laserBox(x, y, s, 0, o.ph === 'fire' ? '#ffe0ff' : o.ph === 'warn' && Math.floor(t * 10) % 2 ? '#e84aff' : '#4a1a5a'));
}
function laserBox(x, y, s, a, lamp) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, 1);
    ctx.fillStyle = '#1a1024'; roundRect(-12, -10, 22, 20, 4); ctx.fill(); const bx = ctx.createLinearGradient(0, -9, 0, 9); bx.addColorStop(0, '#ffe04a'); bx.addColorStop(1, '#d9a10f'); ctx.fillStyle = bx; roundRect(-11, -9, 20, 18, 3); ctx.fill();
    ctx.fillStyle = '#1a1024'; ctx.fillRect(-9, -6, 4, 12); ctx.fillStyle = '#2b2b33'; roundRect(4, -6, 8, 12, 2); ctx.fill();
    ctx.fillStyle = lamp; ctx.beginPath(); ctx.arc(9, 0, 3.4, 0, 7); ctx.fill(); ctx.restore(); }

/* end of a run: Eidi envelopes first (their Final Spin, without the slot machine), then the results */
function endRun() {
  mtQueue = []; mtT = 0; $('mtoast').classList.remove('on');
  if (SHOP.save > 0 && !usedSave) { saveMe(); return; }
  postRun();
}
function tinHud(bump, n) {   // tin counter under the money (owner 23 Nov), like JJ's spin tokens
  let el = $('tinHud'); if (!el) { const c = document.querySelector('#hud .c'); if (!c) return; el = document.createElement('div'); el.id = 'tinHud'; el.className = 'c';
    el.style.cssText = 'margin-top:4px;display:none;align-items:center;gap:6px;transition:transform .15s;transform-origin:left center'; el.innerHTML = '<img src="art/tin/closed.webp?v=1" style="width:24px;height:auto;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))"><span id="tinHudN"></span>'; c.after(el); }
  const k = n == null ? btins : n; el.style.display = k > 0 ? 'flex' : 'none'; $('tinHudN').textContent = '×' + k; if (bump) { el.style.transform = 'scale(1.4)'; setTimeout(() => el.style.transform = '', 170); } }
function tinTarget() { const el = $('tinHud'), r = el && el.getBoundingClientRect(), cr = cv.getBoundingClientRect(); if (!r || !r.width || !cr.width) return [40, 70]; const k = W / cr.width; return [(r.left - cr.left + 12) * k, (r.top - cr.top + r.height / 2) * k]; }
// owner 23 Nov evening: the results screen (with RUN AGAIN) comes first; tins and Eidi from the run are banked and can be opened from there or the home screen any time
let FIRSTRUN = !localStorage.getItem('jd_played');
let BANK_T = +(localStorage.getItem('jd_bankT') || 0), BANK_E = +(localStorage.getItem('jd_bankE') || 0), POSTBANK = false, BANK_FROM = 'over';
const saveBanked = () => { try { localStorage.setItem('jd_bankT', BANK_T); localStorage.setItem('jd_bankE', BANK_E); } catch (e) {} };
function postRun() { if (btins > 0) BANK_T += btins; btins = 0; if (eidi > 0) BANK_E += eidi; eidi = 0; saveBanked(); showOver(); }
function bankAdd(n) { bank += n; shopBankSave(); const ob = $('ovBankMoney'); if (ob) { ob.textContent = '+£' + (+(ob.dataset.n || 0) + n); ob.dataset.n = +(ob.dataset.n || 0) + n; } refreshHome(); }
function bankedButtons() { const host = $('ovBank'), hb = $('hBanked'); const html = (BANK_T ? `<button class="go bk" data-bk="t"><img src="art/tin/closed.webp?v=1" alt="">OPEN AMMI'S TINS ×${BANK_T}</button>` : '') + (BANK_E ? `<button class="go bk" data-bk="e"><span class="eicon">✉</span>OPEN EIDI ×${BANK_E}</button>` : '');
  if (host) host.innerHTML = html + '<span id="ovBankMoney" class="bkm"></span>'; if (hb) { hb.innerHTML = html; hb.hidden = !html; }
  document.querySelectorAll('[data-bk]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); openBanked(b.dataset.bk, b.closest('#home') ? 'home' : 'over'); })); }
function openBanked(which, from) { BANK_FROM = from; POSTBANK = true; $('over').classList.add('hide'); if (from === 'home') $('home').classList.add('hide');
  if (which === 't' && BANK_T > 0 && window.TIN) { const n = BANK_T; BANK_T = 0; saveBanked(); TIN.open(n, bankedDone); }
  else if (which === 'e' && BANK_E > 0) { eidi = BANK_E; BANK_E = 0; saveBanked(); openEidi(); } else bankedDone(); }
function bankedDone() { POSTBANK = false; eidi = 0; $('eidiBox').classList.add('hide'); saveShop(); bankedButtons(); if (BANK_FROM === 'home') { $('home').classList.remove('hide'); refreshHome(); } else $('over').classList.remove('hide'); }
function openEidi() {
  const box = $('eidiBox'), row = $('eidiRow'); row.innerHTML = ''; let left = eidi, won = 0, life = false;
  $('eidiTxt').textContent = 'Tap each envelope to open it'; $('eidiGo').classList.add('hide');
  const PRIZES = [[10, 34], [20, 24], [50, 14], [100, 6], ['life', 22]];
  for (let i = 0; i < eidi; i++) { const c = document.createElement('button'); c.className = 'env';
    c.innerHTML = '<div class="f"><span>عيدي</span></div><div class="b"></div>';
    c.addEventListener('pointerdown', e => { e.stopPropagation(); if (c.classList.contains('open')) return; c.classList.add('open');
      let r = Math.random() * 100, p = PRIZES[0][0]; for (const [v, w] of PRIZES) { if ((r -= w) < 0) { p = v; break; } }
      if (p === 'life' && (life || revived)) p = 20;
      if (p === 'life' && POSTBANK) { SHOP.save = (SHOP.save || 0) + 1; c.querySelector('.b').innerHTML = '<b>❤</b><small>SECOND<br>CHANCE</small>'; tone(660, .2, 'square', .06); setTimeout(() => tone(990, .3, 'square', .06), 120); p = null; }
      if (p === 'life') { life = true; c.querySelector('.b').innerHTML = '<b>❤</b><small>SECOND<br>CHANCE</small>'; tone(660, .2, 'square', .06); setTimeout(() => tone(990, .3, 'square', .06), 120); }
      else if (p != null) { won += p; if (POSTBANK) bankAdd(p); else coins += p; c.querySelector('.b').innerHTML = `<b>£${p}</b><small>EIDI</small>`; SFX.coin(); }
      if (--left === 0) { if (POSTBANK) life = false; $('eidiTxt').textContent = life ? 'Second chance! Get back up and keep going.' : `You got £${won} in Eidi!`; const go = $('eidiGo'); go.textContent = life ? 'GET BACK UP!' : 'CARRY ON'; go.classList.remove('hide'); go.dataset.life = life ? 1 : ''; }
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
  { const cyc = Math.floor(t / per); if (b.tc !== cyc && ph < .25 && b.x < W && b.x + 300 * k > 0) { b.tc = cyc; SFX.trainT && SFX.trainT(); } }   // owner 23 Nov: train sound as it rolls through
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
  // owner 23 Nov: a proper airliner (white with an orange swoosh, orange tail and engine, no airline name), gear tucking up, flashing lights and a long drifting exhaust trail
  const path = q => [x0 + 40 + q * 520, Gs - 120 - Math.pow(q, 1.5) * 220], [px2, py] = path(p), a = -.2 - p * .09, sc = 1.55;
  const cyc = Math.floor(t / per); if (b.pc !== cyc && p < .1) { b.pc = cyc; SFX.planeT && SFX.planeT(); }
  ctx.save(); ctx.scale(k, k);
  for (let i = 1; i < 46; i++) { const q = p - i * .009; if (q < .05) break; const [qx, qy] = path(q), age = i / 46, spread = 1 + i * .22, drift = i * .5;   // exhaust: two thin trails that thicken, soften and drift as they age
    for (const ey of [5.5, 7.5]) { ctx.fillStyle = `rgba(232,236,242,${((1 - age) * .2).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(qx - 40 + Math.sin(i * 1.7) * .8, qy + ey + drift * .3, 2.2 * spread, 1.2 * spread, a, 0, 7); ctx.fill(); } }
  ctx.translate(px2, py); ctx.rotate(a); ctx.scale(sc, sc);
  const W2 = '#fbfcfe', OR = '#ff6a14', ORd = '#d9500a';
  // far wing + far engine
  ctx.fillStyle = '#c6ced8'; ctx.beginPath(); ctx.moveTo(1, -.6); ctx.lineTo(-7, -6); ctx.lineTo(-4.6, -6.2); ctx.lineTo(7, -1); ctx.fill();
  // tailplane (far)
  ctx.fillStyle = '#d4dae2'; ctx.beginPath(); ctx.moveTo(-18, -.6); ctx.lineTo(-22.5, -3.2); ctx.lineTo(-21, -3.2); ctx.lineTo(-15, -.6); ctx.fill();
  // fuselage
  const fg = ctx.createLinearGradient(0, -3.2, 0, 3.2); fg.addColorStop(0, '#ffffff'); fg.addColorStop(.45, W2); fg.addColorStop(.75, '#dfe5ec'); fg.addColorStop(1, '#a9b3bf');
  const BODY = () => { ctx.beginPath(); ctx.moveTo(-21, -1.4); ctx.quadraticCurveTo(-23.5, 1.4, -19, 2.6); ctx.lineTo(14, 3); ctx.bezierCurveTo(20, 3, 23, 2, 23.4, .4); ctx.bezierCurveTo(23, -1.6, 20, -2.9, 15, -3); ctx.lineTo(-15, -3); ctx.quadraticCurveTo(-18.5, -2.8, -21, -1.4); ctx.closePath(); };
  ctx.fillStyle = fg; BODY(); ctx.fill();
  ctx.save(); BODY(); ctx.clip();
  ctx.fillStyle = OR; ctx.beginPath(); ctx.moveTo(-24, 3.5); ctx.lineTo(-24, -3.5); ctx.lineTo(-13, -3.5); ctx.bezierCurveTo(-6, 1.2, 2, 2.6, 12, -3.5); ctx.lineTo(24, -3.5); ctx.lineTo(24, -1.6); ctx.bezierCurveTo(12, -1.2, 4, 3.6, -9, 3.5); ctx.closePath(); ctx.fill();   // orange swoosh along the side
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-22, -2.7, 44, .5);   // top shine
  ctx.fillStyle = 'rgba(40,50,70,.12)'; ctx.fillRect(-22, 1.6, 46, 2);   // belly shade
  ctx.restore(); ctx.strokeStyle = 'rgba(30,40,60,.35)'; ctx.lineWidth = .25; BODY(); ctx.stroke();
  // windows, doors, cockpit
  ctx.fillStyle = '#2c3a4e'; for (let i = 0; i < 26; i++) { const wx = -13 + i * 1.05; if (Math.abs(wx - (-2)) < .9) continue; ctx.beginPath(); ctx.ellipse(wx, -1.05, .28, .38, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(60,70,90,.45)'; ctx.lineWidth = .2; for (const dx of [-15.5, 14.6]) { ctx.strokeRect(dx, -2.2, 1, 3.2); }
  ctx.fillStyle = '#1e2a3c'; ctx.beginPath(); ctx.moveTo(19.6, -1.6); ctx.lineTo(21.8, -1.4); ctx.lineTo(22.4, -.6); ctx.lineTo(19.6, -.6); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(180,220,255,.6)'; ctx.fillRect(20, -1.45, .7, .25);
  // tail fin (orange, curved leading edge)
  const tg = ctx.createLinearGradient(-22, -12, -14, -2); tg.addColorStop(0, '#ff8a3a'); tg.addColorStop(1, ORd); ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-15.5, -2.8); ctx.lineTo(-21.4, -11.8); ctx.lineTo(-18.2, -11.8); ctx.lineTo(-10.5, -2.9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(-14.9, -3.1); ctx.lineTo(-20.6, -11.4); ctx.lineTo(-20, -11.4); ctx.lineTo(-14.3, -3.1); ctx.fill();
  // near tailplane
  ctx.fillStyle = '#e6ebf1'; ctx.beginPath(); ctx.moveTo(-16.5, .2); ctx.lineTo(-22.8, 2.6); ctx.lineTo(-21, 2.8); ctx.lineTo(-13.5, .8); ctx.fill();
  // near wing with flap line and sharklet
  const wg = ctx.createLinearGradient(0, 0, 0, 9); wg.addColorStop(0, '#f3f6f9'); wg.addColorStop(1, '#b9c2cd'); ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(-2.5, 1.4); ctx.lineTo(-10.5, 9.4); ctx.lineTo(-8.2, 9.6); ctx.lineTo(6.5, 2.2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(70,80,100,.4)'; ctx.lineWidth = .2; ctx.beginPath(); ctx.moveTo(-1.6, 2.6); ctx.lineTo(-8.8, 8.8); ctx.stroke();
  ctx.fillStyle = OR; ctx.beginPath(); ctx.moveTo(-10.5, 9.4); ctx.lineTo(-11.6, 11.6); ctx.lineTo(-10.6, 11.6); ctx.lineTo(-8.2, 9.6); ctx.fill();   // sharklet
  // engine (orange nacelle) under the wing
  const eg = ctx.createLinearGradient(0, 2.4, 0, 6.6); eg.addColorStop(0, '#ff9a4a'); eg.addColorStop(.55, OR); eg.addColorStop(1, '#b84206'); ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(1, 4.6, 4.4, 1.9, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#2a2d33'; ctx.beginPath(); ctx.ellipse(5.2, 4.6, .6, 1.6, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#c6ccd4'; ctx.beginPath(); ctx.ellipse(-3.6, 4.6, .9, 1.1, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-2, 3, 5, .4);
  // landing gear tucking up
  const g2 = Math.max(0, 1 - Math.max(0, p - .18) / .14); if (g2 > 0) { ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = .5; ctx.fillStyle = '#18191d'; for (const gx of [-2, 15.5]) { ctx.beginPath(); ctx.moveTo(gx, 2.8); ctx.lineTo(gx - 1 + g2, 2.8 + 3 * g2); ctx.stroke(); ctx.beginPath(); ctx.arc(gx - 1 + g2, 2.8 + 3.2 * g2, .9 * g2, 0, 7); ctx.fill(); } }
  // lights: red beacon, white strobes, wingtip nav
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bl = (t * 1.1) % 1 < .12, st = (t * .9 + .5) % 1 < .06;
  const lamp = (x, y, r, col) => { const lg = ctx.createRadialGradient(x, y, 0, x, y, r); lg.addColorStop(0, `rgba(${col},1)`); lg.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  if (bl) lamp(-2, -3.3, 3, '255,60,40'); if (st) { lamp(-11.2, 11.4, 4, '255,255,255'); lamp(-23, 0, 3, '255,255,255'); } lamp(-11, 11, 1.3, '60,255,120');
  if (p < .35) { ctx.globalAlpha = .5; lamp(23, 1.6, 4, '255,250,220'); ctx.globalAlpha = 1; }   // landing light on the climb-out
  ctx.restore();
  ctx.restore(); }

function px(v) { return Math.round(v * S) / S; }
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';
  if (!skyCv || skyCv.width !== cv.width || skyCv.height !== cv.height) buildSky();
  ctx.drawImage(skyCv, 0, 0);
  const shx = shake > 0 && SHAKE ? (Math.random() - .5) * shake * 14 : 0, shy = shake > 0 && SHAKE ? (Math.random() - .5) * shake * 14 : 0;
  ctx.setTransform(S, 0, 0, S, shx * S, shy * S);
  if (hero.dead && state === 'dead') { const z = 1 + Math.min(.12, deadT * .1), cx = hero.x, cy = hero.y - 30; ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); }   // camera eases in on the crash
  drawJet();
  // far hazy skyline (smaller, slower)
  const sk = .5;
  skyline.forEach(b => { const v = buildingCanvas(b.kind, b.key); if (!v) return; const h = hazed(b.kind + ':' + b.key + '@' + KR, v);
    ctx.drawImage(h, b.x + v.ox * sk, G - 8 + v.top * sk, v.c.width / v.k * sk, v.c.height / v.k * sk); });
  // main street buildings
  ctx.imageSmoothingEnabled = true;
  const tA = performance.now() / 1000;
  street.forEach(b => { if (b.x > W + 40 || b.x + b.w < -40) return; const v = buildingCanvas(b.kind, b.key); if (!v) return;
    const jb = jkOf(b), jS = () => { ctx.save(); ctx.translate(b.x, G); ctx.scale(jb, jb); ctx.translate(-b.x, -G); };
    if (b.key === 'airport') { jS(); drawTakeoff(b, tA); ctx.restore(); }
    ctx.drawImage(v.c, px(b.x + v.ox * BS), px(G + v.top * BS), v.c.width / S, v.c.height / S);
    if (b.key === 'lutonhoo') { // owner 22 Nov: helicopter spools up as soon as it's fully on screen, lifts off just after, climbs away over ~3.5 s
      const hr = b.x + 172 * BS * jb; if (!b.hooT && hr < W - 12) b.hooT = tA; const e = b.hooT ? tA - b.hooT : -1;
      window.HOO = { spin: e < 0 ? .35 : Math.min(1.35, .35 + e / .6), lift: e < .55 ? 0 : Math.min(1, (e - .55) / 3.5) }; }
    if (b.kind === 'lm' && LIVE_ANIM.has(b.key)) { const af = b.key !== 'lutonhoo' && window.SCALE && SCALE[b.key] || 1, k = BS * af; jS(); ctx.save(); ctx.scale(k, k); try { LM_ANIM[b.key](ctx, b.x / k, G / k, tA); } catch (e) {} ctx.restore(); ctx.restore(); } window.HOO = null;
    if (b.key === 'station') { jS(); drawTrain(b, tA); ctx.restore(); } });
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
  coinList.forEach(c => { if (c.j) { const J = jalebiImg(), s3 = J.width / KR; ctx.save(); ctx.translate(c.x, c.y + Math.sin(t * 4 + c.x * .1) * .8); ctx.rotate(Math.sin(t * 2 + c.x) * .25); ctx.drawImage(J, -s3 / 2, -s3 / 2, s3, s3); ctx.restore(); return; }
    const f = coinFrames[Math.floor((t * 14 + c.x * .05)) % 16]; const s2 = f.width / KR; ctx.drawImage(f, c.x - s2 / 2, c.y - s2 / 2 + Math.sin(t * 4 + c.x * .1) * .8, s2, s2); POL.glint(c, s2); });
  // obstacles
  obs.forEach(o => { if (o.type === 'zap') drawZap(o); else if (o.type === 'laser') drawLaser(o); else drawRocket(o); }); drawWrecks(); POL.draw();
  gifts.forEach(drawGift);
  // people + hero, sorted by depth (feet y)
  const list = npcs.map(p => ({ y: p.y, f: () => drawNpc(p) })); mobs.forEach(m => list.push({ y: m.y, f: () => { const M = NPC_META.mobility, im = npcGet('mobility'); if (!M || !im.naturalWidth) return; const sc = .9 * NPCK / M.k, w = M.w * sc, h = M.h * sc, f = Math.floor(m.roll / 9) % M.n;
    ctx.save(); ctx.translate(m.x, m.y); if (m.d < 0) ctx.scale(-1, 1); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, f * M.w, 0, M.w, M.h, -w / 2, -h, w, h); ctx.imageSmoothingQuality = 'low'; ctx.restore(); } })); list.push({ y: hero.dead ? FLOOR + 6 : (hero.ground ? FLOOR : FLOOR + 1), f: drawHero }); if (CAT.on && !CAT.ride) list.push({ y: FLOOR + 2, f: () => CAT.draw() });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  dust.forEach(p => { ctx.globalAlpha = Math.max(0, p.l * 1.6) * .6; ctx.fillStyle = '#d8ccc6'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
  rings.forEach(r => { ctx.strokeStyle = `rgba(255,255,255,${.8 * (1 - r.t / .6)})`; ctx.lineWidth = 3 * (1 - r.t / .6) + .5; ctx.beginPath(); ctx.arc(r.x, r.y, 10 + r.t * 220, 0, 7); ctx.stroke(); });
  // steam (soft, HD) over everything near him
  ctx.fillStyle = STEAMC[SHOP.st] || '#f4f1fa'; steam.forEach(p => { ctx.globalAlpha = Math.max(0, p.l / p.l0) * .85; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;
  sparks.forEach(p => { ctx.globalAlpha = Math.min(1, p.l * 3); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 1.6, 1.6); }); ctx.globalAlpha = 1; POL.drawTop();
  drawHorns();   // the horn's sound waves bend everything drawn so far
  // rocket warnings on the right edge
  obs.forEach(o => { if (o.type === 'rocket' && (o.warn > 0 || o.lock > 0)) { const x = W - 20; POL.warnLine(o);   // small red ! that follows him, then a big flashing starburst just before it fires
    ctx.save(); ctx.translate(x + (o.lock > 0 ? (Math.random() - .5) * 2.4 : 0), o.y);
    if (o.lock > 0) { const s2 = 1.6 + Math.sin(t * 30) * .12; ctx.translate(-8, 0); ctx.scale(s2, s2); ctx.fillStyle = '#ffd21f'; ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * 2, r = i % 2 ? 9 : 15; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#d8141c'; ctx.font = '900 17px Mont, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 1); }
    else {   // owner 22 Nov: big, obvious, shaking warning
      const sh = 2.2, pul = 1 + Math.sin(t * 22) * .1; ctx.translate(-6 + (Math.random() - .5) * sh * 2, (Math.random() - .5) * sh * 2); ctx.rotate(Math.sin(t * 40) * .12); ctx.scale(pul, pul);
      const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 30); gl.addColorStop(0, 'rgba(255,40,40,.55)'); gl.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(18, 14); ctx.lineTo(-18, 14); ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.fillStyle = Math.floor(t * 10) % 2 ? '#e8161e' : '#ff4a2a'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = '900 22px Mont, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 3); }
    ctx.restore(); } });
  pops.forEach(p => { ctx.globalAlpha = Math.min(1, (1.1 - p.t) * 3); ctx.font = '12px PS'; ctx.textAlign = 'center'; ctx.fillStyle = '#160c28'; ctx.fillText(p.txt, p.x + 1.5, p.y + 1.5); ctx.fillStyle = p.col; ctx.fillText(p.txt, p.x, p.y); }); ctx.globalAlpha = 1;
  drawSkillHud();
  if (CAT.on && CAT.ride && !CAT.built()) { if (CAT.att) { ctx.save(); ctx.translate(CAT.x, CAT.y); CAT.lie(ctx, 1, { wind: 1 }); ctx.restore(); } else CAT.draw(); }   // built-in rides draw him themselves
  if (banner) drawBanner();
  tinFly.forEach(f => { f.t += 1 / 60; const k = Math.min(1, f.t / .55), e = k * k * (3 - 2 * k), [tx, ty] = tinTarget(), x = f.x + (tx - f.x) * e, y = f.y + (ty - f.y) * e - Math.sin(k * Math.PI) * 60; ctx.save(); ctx.translate(x, y); ctx.scale(1 - e * .45, 1 - e * .45); ctx.rotate(k * 6.283); window.TIN && TIN.mini(ctx, 0, 0, 15); ctx.restore(); if (k >= 1 && !f.done) { f.done = 1; tinHud(true); } });
  tinFly = tinFly.filter(f => !f.done);
  if (REVEAL) drawReveal();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vigCv, 0, 0);
  if (flashT > 0) { ctx.fillStyle = `rgba(${flashCol},${Math.min(.75, flashT * 4)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}

function drawSkillHud() {
  if (state !== 'play') return;
  speedLines.forEach(l => { ctx.strokeStyle = `rgba(255,255,255,${(l.l * 2.4).toFixed(2)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(hero.x - 40, l.y); ctx.lineTo(hero.x - 120 - l.l * 200, l.y); ctx.stroke(); });
  ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '700 13px Oswald, Mont, sans-serif';
  if (nearMult > 1) { const a = Math.min(1, nearT * 2), x = 14, y = 100; ctx.globalAlpha = a; ctx.fillStyle = 'rgba(10,20,40,.6)'; ctx.beginPath(); ctx.roundRect(x, y - 11, 86, 22, 11); ctx.fill();
    ctx.fillStyle = '#7fe3ff'; ctx.fillText('CLOSE x' + nearMult, x + 10, y); ctx.fillStyle = 'rgba(127,227,255,.35)'; ctx.fillRect(x + 8, y + 7, 70, 2); ctx.fillStyle = '#7fe3ff'; ctx.fillRect(x + 8, y + 7, 70 * Math.max(0, nearT / 3), 2); ctx.globalAlpha = 1; }
  ctx.restore();
}
function drawHeat() { heatHud(); }   // owner 23 Nov: the cooker gauge lives under the money now (HUD), not over the street
let heatPuffT = 0;
function heatHud() { const el = $('heatBar'); if (!el) return; const show = !veh && !boost && !hero.dead && state === 'play'; el.classList.toggle('show', show && (hero.heat > .03 || hero.oh > 0)); if (!show) return;
  const k = hero.oh > 0 ? 1 : hero.heat; el.style.setProperty('--h', (k * 100).toFixed(1) + '%');
  el.classList.toggle('warm', k >= .5 && k < .78 && hero.oh <= 0); el.classList.toggle('hot', k >= .78 && hero.oh <= 0); el.classList.toggle('burnt', hero.oh > 0);
  $('heatTxt').textContent = hero.oh > 0 ? 'COOLING…' : k >= .78 ? 'TOO HOT!' : 'COOKER';
  if ((hero.oh > 0 || k > .88) && (heatPuffT -= 1 / 60) <= 0) { heatPuffT = hero.oh > 0 ? .12 : .25; const p = document.createElement('i'); p.className = 'hsmoke'; p.style.left = (20 + Math.random() * 70) + '%'; el.appendChild(p); setTimeout(() => p.remove(), 1100); } }
function drawHeatOld() {
  if (veh || boost || hero.dead || state !== 'play' || (hero.heat < .05 && hero.oh <= 0)) return;
  const x = hero.x - 30, y1 = hero.y - 58, h = 34, k = hero.heat, fl = (k > .8 || hero.oh > 0) && Math.floor(t * 10) % 2;
  ctx.save(); ctx.fillStyle = 'rgba(10,12,20,.55)'; ctx.beginPath(); ctx.roundRect(x - 3.5, y1 - 2, 7, h + 4, 3.5); ctx.fill();
  const col = hero.oh > 0 ? '#ff3a2a' : k < .5 ? '#5be37a' : k < .8 ? '#ffc23a' : '#ff5a3a'; ctx.fillStyle = fl ? '#ffffff' : col;
  ctx.beginPath(); ctx.roundRect(x - 2, y1 + h * (1 - k), 4, h * k, 2); ctx.fill(); ctx.restore(); }
function drawHero() { const hi = heroImg, alt = SHOP.ck ? ckSheet(hi) : null; if (alt) { heroImg = alt; heroImg.complete = true; } try { drawHero0(); } finally { heroImg = hi; } }
function drawHero0() {
  if (!heroImg.complete || state === 'menu') return;
  drawHeat();
  if (boost) { drawBoost(); if (!boost.out) return; }
  if (veh && veh.asm !== undefined && veh.asm < 1 && veh.k !== 'mech') {   // ride parts flying in and locking on (JJ style)
    const v = veh; veh = null; drawHero(); veh = v; const hi = heroImg; heroImg = BLANK_HERO;
    const ONE = veh.k === 'carpet' || veh.k === 'sandals', DIRS = veh.k === 'carpet' ? [[-700, 140]] : veh.k === 'sandals' ? [[0, 420]] : [[-60, -520], [-640, 60], [620, -160]], x = hero.x, y = hero.y;
    for (let i = 0; i < DIRS.length; i++) { const p = Math.min(1, Math.max(0, (veh.asm - .22 - i * .2) / .32)); if (p <= 0) continue; const e = 1 - Math.pow(1 - p, 3), ox = DIRS[i][0] * (1 - e), oy = DIRS[i][1] * (1 - e);
      if (p < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,255,255,${.75 * (1 - p)})`; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + DIRS[i][0] * 1.2, y - 40 + DIRS[i][1] * 1.2); ctx.lineTo(x + ox, y - 40 + oy); ctx.stroke(); ctx.restore(); }
      ctx.save(); if (!ONE) { ctx.beginPath(); ctx.rect(x - 160 + i * 107, y - 240, 107, 300); ctx.clip(); } ctx.translate(ox, oy); drawVehicle(); ctx.restore();
      if (p >= 1 && p - .001 < 1 && veh.asm < .22 + i * .2 + .32 + .08) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g2 = ctx.createRadialGradient(x - 107 + i * 107, y - 40, 0, x - 107 + i * 107, y - 40, 60); g2.addColorStop(0, 'rgba(255,255,255,.95)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillRect(x - 167 + i * 107, y - 100, 120, 120); ctx.restore(); } }
    heroImg = hi; return; }
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
  if (!hero.dead) POL.heroPre();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(heroImg, f * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH, HW * HS, HH); ctx.imageSmoothingQuality = 'low';
  if (!hero.dead) POL.heroPost(); else POL.deadPost(f);
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
  const sc = .9 * NPCK / (M.k || 1), w = M.w * sc, h = M.h * sc;
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
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, f * M.w, 0, M.w, M.h, -w / 2, -h, w, h); ctx.imageSmoothingQuality = 'low'; ctx.restore(); ctx.imageSmoothingEnabled = true;   // people drawn from the full-size sheets with high-quality smoothing, so no detail is lost at any size
  if (p.fall > 0 && (M.v3 ? (p.fall0 || 1.9) - p.fall > .3 : p.fall < 1.6)) {   // little stars circling the head
    const cx = M.v3 ? p.x + p.fallDir * 26 : p.x + p.fallDir * h * .62, cy = M.v3 ? p.y - 13 : p.y - 14;
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; ctx.fillStyle = i % 2 ? '#ffe36a' : '#ffffff'; drawStar(cx + Math.cos(a) * 10, cy + Math.sin(a) * 3.5, 2.6); }
  }
  // (no speech bubbles: the faces and bodies do the reacting)
}
function drawStar(x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function drawZap(o) {   // owner 22 Nov: JJ-style electric beam: no casing or dark outline, glowing, jagged and random, crackling orbs at the ends
  const c = Math.cos(o.ang), s = Math.sin(o.ang), cax = o.x - c * o.len / 2, cay = o.y - s * o.len / 2, cbx = o.x + c * o.len / 2, cby = o.y + s * o.len / 2;
  const ax = cax + c * ZBR * .85, ay = cay + s * ZBR * .85, bx = cbx - c * ZBR * .85, by = cby - s * ZBR * .85;
  const fr = Math.floor(t * 22), R = n => { const v = Math.sin(n * 127.1 + o.seed * 311.7 + fr * 74.7) * 43758.5453; return v - Math.floor(v); };
  const bolt = (seed, amp, n) => { ctx.beginPath(); ctx.moveTo(ax, ay);
    for (let i = 1; i < n; i++) { const k = i / n, env = Math.sin(k * Math.PI) * .7 + .3, j = (R(seed * 31 + i) - .5) * 2 * amp * env; ctx.lineTo(ax + (bx - ax) * k - s * j, ay + (by - ay) * k + c * j); }
    ctx.lineTo(bx, by); };
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round';
  bolt(20, 5, 9); ctx.strokeStyle = 'rgba(255,176,30,.45)'; ctx.lineWidth = 9; ctx.stroke(); bolt(21, 4, 11); ctx.strokeStyle = 'rgba(255,214,60,.7)'; ctx.lineWidth = 4.5; ctx.stroke();   // golden body of the beam (shows on a bright sky too)
  ctx.globalCompositeOperation = 'lighter';
  const pulse = .8 + .2 * R(99);
  // soft uneven glow (a few wobbling wide strokes, not one neat tube)
  for (let g = 0; g < 3; g++) { bolt(10 + g, 7, 7); ctx.strokeStyle = `rgba(255,${170 + g * 25},40,${(.16 * pulse).toFixed(3)})`; ctx.lineWidth = 26 - g * 7; ctx.stroke(); }
  // crackling strands
  bolt(1, 9, 16); ctx.strokeStyle = 'rgba(255,200,60,.85)'; ctx.lineWidth = 3.4; ctx.stroke();
  bolt(2, 6, 18); ctx.strokeStyle = 'rgba(255,236,140,.95)'; ctx.lineWidth = 2.2; ctx.stroke();
  bolt(3, 3.5, 20); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.3; ctx.stroke();
  if (R(7) < .5) { bolt(4, 13, 12); ctx.strokeStyle = 'rgba(255,220,90,.6)'; ctx.lineWidth = 1.1; ctx.stroke(); }
  ctx.restore();
  // owner 23 Nov: silver balls with the beam coming out of their holes, crackling
  zapBall(cax, cay, o.ang, .9 + .1 * R(3)); zapBall(cbx, cby, o.ang + Math.PI, .9 + .1 * R(4)); ballCrackle(cax, cay, o.ang, .8); ballCrackle(cbx, cby, o.ang + Math.PI, .8);
  if (Math.random() < .3) sparks.push({ x: ax + (bx - ax) * Math.random(), y: ay + (by - ay) * Math.random(), vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, l: .22, c: Math.random() < .5 ? '#fff3a0' : '#ffffff' });
}
function drawRocket(o) {   // silver missile (owner 23 Nov: silver body, blue nose + fins, one blue + one white stripe), fins, roaring flame, long trail of smoke puffs
  if (o.warn > 0 || o.lock > 0) return;
  (o.tr || []).forEach(p => { const k = p.a / 1.1; ctx.fillStyle = `rgba(${150 - k * 40},${120 - k * 30},${100 - k * 20},${(.55 * (1 - k)).toFixed(3)})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.save(); ctx.translate(o.x, o.y); if (o.rot) ctx.rotate(o.rot); ctx.scale(1.35, 1.35);   // chunkier rockets (owner 23 Nov)
  let gr; if (!o.dud) { const fl = 10 + Math.random() * 8; gr = ctx.createLinearGradient(16, 0, 16 + fl, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.3, '#ffe07a'); gr.addColorStop(.7, '#ff8a2a'); gr.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(15, -4); ctx.quadraticCurveTo(16 + fl, -1, 16 + fl * 1.15, 0); ctx.quadraticCurveTo(16 + fl, 1, 15, 4); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(17, 0, 0, 17, 0, 14); gl.addColorStop(0, 'rgba(255,190,90,.7)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = gl; ctx.fillRect(3, -14, 28, 28); ctx.restore(); }
  ctx.fillStyle = '#2d8fe6'; ctx.beginPath(); ctx.moveTo(10, -4.4); ctx.lineTo(17, -9); ctx.lineTo(17, -4.4); ctx.fill(); ctx.beginPath(); ctx.moveTo(10, 4.4); ctx.lineTo(17, 9); ctx.lineTo(17, 4.4); ctx.fill();   // tail fins
  gr = ctx.createLinearGradient(0, -5, 0, 5); gr.addColorStop(0, '#f2f4f7'); gr.addColorStop(.3, '#c9ced6'); gr.addColorStop(.55, '#9aa1ac'); gr.addColorStop(.8, '#d4d8de'); gr.addColorStop(1, '#7d838d'); ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(-14, -4.4); ctx.lineTo(15, -4.4); ctx.lineTo(16.5, -3); ctx.lineTo(16.5, 3); ctx.lineTo(15, 4.4); ctx.lineTo(-14, 4.4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(40,40,50,.55)'; ctx.lineWidth = .5; ctx.stroke();
  ctx.fillStyle = '#2d8fe6'; ctx.fillRect(-11, -4.4, 2.6, 8.8); ctx.fillStyle = '#ffffff'; ctx.fillRect(-8.4, -4.4, 2, 8.8); ctx.fillStyle = 'rgba(30,40,60,.35)'; ctx.fillRect(-6.4, -4.4, .4, 8.8); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, -4.4, .6, 8.8); ctx.fillRect(9, -4.4, .6, 8.8);
  gr = ctx.createLinearGradient(0, -4, 0, 4); gr.addColorStop(0, '#7cc4ff'); gr.addColorStop(.45, '#2d8fe6'); gr.addColorStop(1, '#1a5fa8'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-14, -4.4); ctx.quadraticCurveTo(-22, -2, -24, 0); ctx.quadraticCurveTo(-22, 2, -14, 4.4); ctx.closePath(); ctx.fill();   // nose cone
  ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(-5.6, -3.4, 14.6, .8);
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
function refreshHome() { try { bankedButtons(); } catch (e) {}
  $('hBest').textContent = best + 'm'; $('hBank').textContent = '£' + bank.toLocaleString('en-GB'); $('misStars').textContent = '★'.repeat(MS.stars) + '☆'.repeat(3 - MS.stars);
  $('outName').textContent = (ITEMS.outfit.find(o => o.id === SHOP.outfit) || {}).name.split(' ')[0].toLowerCase(); $('mineName').textContent = mosName();
}
let pickThenPlay = false;
// the masjid cards (first-time pop-up, and Settings → My masjid)
function fillMasjids(L, onPick) { L.innerHTML = '';
  MOSQUES.forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'mcard' + (k === myMosque ? ' on' : '');
    const c = document.createElement('canvas'); c.width = 320; c.height = 200; b.appendChild(c); b.appendChild(document.createTextNode(n));
    b.addEventListener('pointerdown', e => { e.stopPropagation(); myMosque = k; try { localStorage.setItem('jd_mosque', k); } catch (e2) {} [...L.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); refreshHome(); street = []; skyline = []; fillStreet(); fillSkyline(); if (onPick) onPick(); });
    L.appendChild(b); setTimeout(() => thumb(c, k), 0); }); }
function openPick() {
  // owner 22 Nov: no DONE button: picking a masjid closes the pop-up (and starts the run if PLAY opened it); after that it lives in Settings
  fillMasjids($('mlist'), () => setTimeout(() => { $('pick').classList.add('hide'); if (pickThenPlay) { pickThenPlay = false; start(); } }, 260));
  $('pick').classList.remove('hide');
}
function setSound(on) { sndOn = !!on; $('snd').classList.toggle('off', !sndOn); if (!sndOn && hissG) hissG.gain.value = 0; if (sndOn) playback(); else if (keepAud) keepAud.pause(); syncSet(); }
function syncSet() { const S1 = $('setSnd'), G1 = $('setGfx'), K1 = $('setShk'); if (!S1) return; [...S1.children].forEach(b => b.classList.toggle('on', (b.dataset.v === '1') === sndOn)); [...G1.children].forEach(b => b.classList.toggle('on', b.dataset.v === GFX));
  [...K1.children].forEach(b => b.classList.toggle('on', (b.dataset.v === '1') === SHAKE)); document.querySelectorAll('#setBox input[data-mix]').forEach(r => { r.value = VOL[r.dataset.mix]; r.nextElementSibling.textContent = VOL[r.dataset.mix] + '%'; });
  $('setVols').classList.toggle('off', !sndOn); }
function openSettings() { if (state !== 'menu') return; fillMasjids($('setMl')); syncSet(); $('setBox').classList.remove('hide'); }
function share(txt) {
  const data = { title: 'Jummah Dash', text: txt, url: location.href.split('#')[0] };
  if (navigator.share) navigator.share(data).catch(() => {});
  else { try { navigator.clipboard.writeText(txt + ' ' + data.url); toast('Link copied'); } catch (e) { toast(data.url); } }
}
function start() {
  if (!myMosque) { pickThenPlay = true; openPick(); return; }
  audio(); if (AC && AC.state === 'suspended') AC.resume();
  street = []; skyline = []; reset(); passed = 0; state = 'intro'; hero.x = -30;
  ['home', 'over', 'pick', 'how'].forEach(id => $(id).classList.add('hide')); $('hud').style.display = 'block';
}
function goHome() { boost = null; $('hsBox').classList.remove('on'); $('saveMe').classList.add('hide'); clearInterval(saveMe.iv); hero.dead = false; deadT = 0; veh = null; inv = 0; obs = []; coinList = []; gifts = []; $('eidiBox') && $('eidiBox').classList.add('hide'); window.TIN && TIN.close(); state = 'menu'; ['over'].forEach(id => $(id).classList.add('hide')); $('hud').style.display = 'none'; $('home').classList.remove('hide'); refreshHome(); }
function saveMe() {   // their SAVE ME: spend a Second Chance to carry on, 3 second countdown
  const box = $('saveMe'); $('smN').textContent = 'You have ' + SHOP.save; box.classList.remove('hide'); let left = 3; $('smT').textContent = left;
  clearInterval(saveMe.iv); saveMe.iv = setInterval(() => { left--; $('smT').textContent = Math.max(0, left); if (left <= 0) { clearInterval(saveMe.iv); box.classList.add('hide'); usedSave = 1; postRun(); } }, 1000);
}
function showOver() {
  missionsEndRun(); const m = Math.floor(dist / 10); const nb = m > best && best > 0; setTimeout(() => POL.over(nb), 30); if (m > best) { best = m; try { localStorage.setItem('jd_best', best); } catch (e) {} }
  bank += coins; try { localStorage.setItem('jd_bank', bank); } catch (e) {}
  $('oD').textContent = m + 'm'; $('oC').textContent = '£' + coins; $('oB').textContent = best + 'm';
  $('ovT').textContent = ['MISSED THE KHUTBAH!', 'SO CLOSE, AKHI!', 'THE IMAM STARTED!', 'BACK OF THE SAFF FOR YOU'][Math.random() * 4 | 0];
  $('ovWhy').textContent = `Still no sign of ${mosName()}…` + (passed ? ` You flew past ${passed} other masjid${passed > 1 ? 's' : ''}.` : '');
  $('oS').textContent = stats.steamed; $('oZ').textContent = stats.dodged; $('oM').textContent = stats.missed;
  const lm = lastMissions; $('ovMis').innerHTML = (lm && lm.got.length ? `<div class="mdone">${lm.got.map(x => '<div>✔ MISSION COMPLETE · ' + x + '</div>').join('')}${lm.rankUp ? '<div class="lvl">RANK UP! ' + lm.rankUp.toUpperCase() + '</div>' : ''}<div class="rew">+£${lm.reward} to your bank</div></div>` : '') + rankHtml() + '<div id="ovRows"></div>';
  missionRows($('ovRows')); bankedButtons();
  try { localStorage.setItem('jd_played', '1'); } catch (e) {}
  $('over').classList.remove('hide'); }
document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.tile,.go,.seg button,.mcard')) { audio(); tone(1250, .035, 'square', .03, .7, MIX && MIX.fx); } }, true);   // every button clicks (owner 23 Nov)
const tap = (id, fn) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(e); });
// owner 22 Nov: taps on or near anything you can press never start the game (24 px dead zone round every button, the whole menu column)
const nearBtn = e => { const x = e.clientX, y = e.clientY, M = 24;
  return [...document.querySelectorAll('#home .side, #home .stats, #home .credit, #home .badge, #snd')].some(el => { const r = el.getBoundingClientRect(); return r.width && x > r.left - M && x < r.right + M && y > r.top - M && y < r.bottom + M; }); };
tap('home', e => { if (e.target.closest('.tile,.credit') || nearBtn(e)) return; start(); });
tap('bSmr', () => $('smrInfo').classList.remove('hide')); tap('smrClose', () => $('smrInfo').classList.add('hide'));
$('smrOpen').addEventListener('pointerdown', e => e.stopPropagation());
$('bShield').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); shHold = true; shPid = e.pointerId; try { $('bShield').setPointerCapture(e.pointerId); } catch (x) {} });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => $('bShield').addEventListener(ev, e => { if (e.pointerId === shPid) { shHold = false; shPid = null; } }));
$('bShield').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
/* DASH button (owner 23 Nov: the swipe gets eaten by some phones/apps), bottom-left; the swipe still works too */
$('bDash').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); steamDash(); });
$('bDash').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
function dashBtn() { const b = $('bDash'); const on = state === 'play' && !veh && !boost && !hero.dead && !REVEAL && !(FM && FM.ph); b.classList.toggle('hide', !on); if (!on) return; b.style.setProperty('--cd', ((1 - dashCD / DASH_CD) * 100).toFixed(1) + '%'); b.classList.toggle('ready', dashCD <= 0); b.classList.toggle('act', hero.dashT > 0); }
window.addEventListener('keydown', e => { if (e.code === 'KeyS') shHold = true; if (e.code === 'KeyD' || e.code === 'ArrowRight') steamDash(); if (e.code === 'KeyH' || e.code === 'KeyD') hornBlast(); if (e.code === 'KeyB' || e.code === 'KeyS') batSwing(); });
$('bHorn').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); hornBlast(); });
$('bBat').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); batSwing(); const b = $('bBat'); b.classList.add('act'); setTimeout(() => b.classList.remove('act'), 120); });
$('bBat').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
function batBtn() { const b = $('bBat'); if (!b) return; const on = state === 'play' && !hero.dead && veh && veh.k === 'logman' && veh.morph >= 1 && (veh.batHP || 0) > 0 && !REVEAL; b.classList.toggle('hide', !on); if (!on) return; b.style.setProperty('--cd', ((1 - Math.max(0, veh.batCD || 0) / BAT_CD) * 100).toFixed(1) + '%'); b.classList.toggle('ready', (veh.batCD || 0) <= 0); }
$('bHorn').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false }); window.addEventListener('keyup', e => { if (e.code === 'KeyS') shHold = false; });
tap('bSet', openSettings); tap('setClose', () => $('setBox').classList.add('hide')); $('setBox').addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target.id === 'setBox') $('setBox').classList.add('hide'); });
[...$('setSnd').children].forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); setSound(b.dataset.v === '1'); }));
[...$('setShk').children].forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); SHAKE = b.dataset.v === '1'; try { localStorage.setItem('jd_shake', SHAKE ? '1' : '0'); } catch (x) {} syncSet(); }));
document.querySelectorAll('#setBox input[data-mix]').forEach(r => { r.addEventListener('pointerdown', e => e.stopPropagation()); r.addEventListener('input', () => { VOL[r.dataset.mix] = +r.value; r.nextElementSibling.textContent = r.value + '%'; applyMix(); try { localStorage.setItem('jd_mix', JSON.stringify(VOL)); } catch (x) {} });
  r.addEventListener('change', () => { if (!sndOn) return; audio(); const k = r.dataset.mix; if (k === 'coins') SFX.coin(); else if (k === 'fx') SFX.warn(); else if (k === 'jet' && hissG) { hissG.gain.setTargetAtTime(.03, AC.currentTime, .03); hissG.gain.setTargetAtTime(0, AC.currentTime + .5, .08); } else if (k === 'traffic' && SFX.horn) SFX.horn(.5); }); });
[...$('setGfx').children].forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); GFX = b.dataset.v; try { localStorage.setItem('jd_gfx', GFX); } catch (x) {} syncSet(); resize(); }));
$('pick').addEventListener('pointerdown', e => { if (e.target.id === 'pick') { pickThenPlay = false; $('pick').classList.add('hide'); } }); tap('pickClose', () => $('pick').classList.add('hide'));
tap('bHow', () => $('how').classList.remove('hide'));

/* ================= SHOP: utilities, gadgets (2 slots, buy a 3rd), outfits ================= */
const CKFIN = { ck_copper: ['#5a2410', '#c8642a', '#ffc89a', '#b8501c', '#6a2a10'], ck_black: ['#050507', '#2a2c34', '#8a90a0', '#1a1b22', '#050507'] };
const BATIMG = { bat_tape: img('art/logman/n_bat_tape.webp?h=cd8c120502'), bat_alu: img('art/logman/n_bat_alu.webp?h=3212c216ea'), bat_gold: img('art/logman/n_bat_gold.webp?h=7c4a9247bd') };
const STEAMC = { st_green: '#b6f7c6', st_pink: '#ffc4e2' };
// cooker finish: the cooker pixels (art/cookmask.webp, same place in every outfit sheet) recoloured along a metal ramp, made once per outfit + finish
const COOKMASK = img('art/cookmask.webp?h=7ac58ac59b'); const CKC = {};
function ckSheet(src) { const fin = SHOP.ck; if (!fin || !CKFIN[fin] || !src.complete || !src.naturalWidth || !COOKMASK.complete || !COOKMASK.naturalWidth) return null; const key = fin + ':' + src.src; if (CKC[key]) return CKC[key];
  const w = src.naturalWidth, h = src.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0); const d = g.getImageData(0, 0, w, h);
  const mc = document.createElement('canvas'); mc.width = w; mc.height = h; const mg = mc.getContext('2d', { willReadFrequently: true }); mg.drawImage(COOKMASK, 0, 0, w, h); const md = mg.getImageData(0, 0, w, h).data;
  const ramp = CKFIN[fin].map(hx => [parseInt(hx.slice(1, 3), 16), parseInt(hx.slice(3, 5), 16), parseInt(hx.slice(5, 7), 16)]), R = [ramp[0], ramp[1], ramp[3], ramp[2]];   // dark → mid → light
  for (let i = 0; i < d.data.length; i += 4) { if (md[i] < 128) continue; const L = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 765, p = L * 3, k = Math.min(2, Math.floor(p)), f = p - k, A = R[k], B = R[k + 1]; d.data[i] = A[0] + (B[0] - A[0]) * f; d.data[i + 1] = A[1] + (B[1] - A[1]) * f; d.data[i + 2] = A[2] + (B[2] - A[2]) * f; }
  g.putImageData(d, 0, 0); return CKC[key] = c; }
const ITEMS = {
  util: [
    { id: 'hs500', name: 'HEAD START 500M', desc: "Your uncle's Corolla blasts you 500m down the road. Tap it as the run starts.", price: 250, use: 1 },
    { id: 'hs1000', name: 'HEAD START 1000M', desc: 'The full uncle experience. 1,000m, no stopping, no seatbelt.', price: 600, use: 1 },
    { id: 'save', name: 'SECOND CHANCE', desc: 'A spare Eidi. When you go down, tap SAVE ME to carry on where you fell.', price: 300, use: 1 },
    { id: 'slot', name: 'EXTRA GADGET SLOT', desc: 'Use 3 gadgets at once instead of 2.', price: 3000 },
  ],
  gadget: [
    { id: 'tin', name: 'COIN MAGNET', desc: 'Every £1 coin near you flies straight to you.', price: 750 },
    { id: 'chappal', name: "AMMI'S CHAPPAL", desc: 'Heavier on the way down, like you just heard it coming. Sharper control.', price: 400 },
    { id: 'dates', name: 'LUCKY DATES', desc: 'Gift boxes turn up twice as often, so more rides.', price: 1200 },
    { id: 'envelope', name: 'EIDI POUCH', desc: 'Eidi envelopes turn up twice as often.', price: 900 },
    { id: 'cat', name: 'BILLI THE CAT', desc: 'Your cat runs alongside you, jumps for coins you miss and trips up the odd person. Rides along on every power-up.', price: 3000 },
    { id: 'jalebi', name: 'HOT JALEBI', desc: 'Some coin trails turn into hot jalebis worth £3 each. Sticky fingers, full pockets.', price: 1800 },
    { id: 'misbaha', name: 'GOLDEN MISBAHA', desc: 'Start every run on a random ride: tuk-tuk, carpet, Flappy Kabootar, the sandals or the Hoover Mech.', price: 2500 },
  ],
  style: [
    { id: 'ck_copper', name: 'COPPER COOKER', desc: "Polished copper, like Nani's best pan.", price: 300, k: 'ck' },
    { id: 'ck_black', name: 'BLACK CHROME COOKER', desc: 'Murdered-out black chrome. Very serious.', price: 400, k: 'ck' },
    { id: 'st_green', name: 'GREEN STEAM', desc: 'Your jetpack puffs out mint-green steam.', price: 200, k: 'st' },
    { id: 'st_pink', name: 'PINK STEAM', desc: 'Candyfloss-pink steam clouds behind you.', price: 250, k: 'st' },
    { id: 'bat_tape', name: 'TAPED BAT', desc: "Lakri Man's bat wrapped in grip tape: lasts 10 hits instead of 6.", price: 500, k: 'bat' },
    { id: 'bat_alu', name: 'ALUMINIUM BAT', desc: 'A wider swing and that metal TING on every hit.', price: 800, k: 'bat' },
    { id: 'bat_gold', name: 'GOLDEN BAT', desc: 'Coins burst out on every hit, and it sometimes shrugs off the damage.', price: 1200, k: 'bat' },
  ],
  outfit: [
    { id: 'classic', name: 'CLASSIC THOBE', desc: 'Fresh white thobe. Ironed this morning. Probably.', price: 0 },
    { id: 'puffer', name: 'PUFFER JACKET', desc: 'Navy quilted puffer coat. Luton in November.', price: 1000 },
    { id: 'eid', name: 'EID THOBE', desc: 'Cream thobe with gold embroidery for Eid day.', price: 1500 },
    { id: 'luton', name: 'LUTON TOWN KIT', desc: 'Orange and navy, Hatters through and through.', price: 2000 },
    { id: 'moroccan', name: 'MOROCCAN DJELLABA', desc: 'Striped wool djellaba with a pointed hood.', price: 2500 },
  ],
};
let shopTab = 'util';
const shopBankSave = () => { try { localStorage.setItem('jd_bank', bank); } catch (e) {} };
function iconFor(cv, tab, it) {
  const c = cv.getContext('2d'), S = cv.width = cv.height = 116; c.clearRect(0, 0, S, S); c.save(); c.scale(2, 2); c.lineJoin = 'round';
  const O = '#1a1024', rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
  if (tab === 'outfit') { const im = heroImgs[it.id]; const f = FR('run1_normal'); if (im.complete && im.naturalWidth) { c.imageSmoothingEnabled = true; c.drawImage(im, f * HW * HX4, 0, HW * HX4, HH0 * HX4, 5, 4, 48, 58); } else im.onload = () => iconFor(cv, tab, it); }
  else if (it.id === 'hs500' || it.id === 'hs1000') { drawCorolla(c, 29, 40, .34, true); c.font = '9px PS'; c.textAlign = 'center'; c.fillStyle = O; c.fillText(it.id === 'hs500' ? '500' : '1000', 30, 54); c.fillStyle = '#ffd75a'; c.fillText(it.id === 'hs500' ? '500' : '1000', 29, 53); }
  else if (it.id === 'save') { c.translate(29, 30); c.rotate(-.15); c.fillStyle = '#0f3d26'; rr(-17, -12, 34, 24, 4); c.fill(); c.fillStyle = '#1f8a4c'; rr(-15.5, -10.5, 31, 21, 3); c.fill(); c.fillStyle = '#25a35a'; c.beginPath(); c.moveTo(-15.5, -10.5); c.lineTo(0, 3); c.lineTo(15.5, -10.5); c.fill(); c.fillStyle = '#ffd75a'; c.beginPath(); c.arc(0, 2, 5, 0, 7); c.fill(); c.fillStyle = '#1f8a4c'; c.beginPath(); c.arc(2, 1, 4, 0, 7); c.fill(); c.fillStyle = '#ff5a6a'; c.font = '12px PS'; c.fillText('+', 10, -9); }
  else if (tab === 'style' && it.k === 'ck') { const fin = CKFIN[it.id], g2 = c.createLinearGradient(16, 0, 42, 0); fin.forEach((col, i) => g2.addColorStop(i / (fin.length - 1), col));
    c.fillStyle = O; rr(15, 14, 28, 34, 6); c.fill(); c.fillStyle = g2; rr(17, 16, 24, 30, 5); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(21, 18, 3, 26); c.fillStyle = O; rr(24, 6, 10, 9, 3); c.fill(); c.fillStyle = '#e0262e'; c.beginPath(); c.arc(29, 8, 5, Math.PI, 0); c.fill(); c.fillStyle = O; c.fillRect(20, 47, 6, 5); c.fillRect(32, 47, 6, 5); }
  else if (tab === 'style' && it.k === 'bat') { const B = BATIMG[it.id]; if (B && B.complete && B.naturalWidth) { c.save(); c.translate(29, 29); c.rotate(.75); c.drawImage(B, -B.naturalWidth * .11, -26, B.naturalWidth * .22, 52); c.restore(); } else if (B) B.onload = () => iconFor(cv, tab, it); }
  else if (tab === 'style' && it.k === 'st') { const col = STEAMC[it.id]; [[18, 38, 9], [30, 30, 11], [42, 36, 8], [26, 20, 7], [38, 18, 6]].forEach(([x, y, r]) => { c.fillStyle = 'rgba(30,20,40,.35)'; c.beginPath(); c.arc(x + 1, y + 1.5, r, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x - r * .35, y - r * .35, r * .35, 0, 7); c.fill(); }); }
  else if (it.id === 'slot') { c.strokeStyle = '#ffd75a'; c.setLineDash([4, 3]); c.lineWidth = 2; rr(13, 13, 32, 32, 7); c.stroke(); c.setLineDash([]); c.fillStyle = '#ffd75a'; c.fillRect(26, 20, 6, 18); c.fillRect(20, 26, 18, 6); }
  else if (it.id === 'tin') {   // owner 23 Nov: COIN MAGNET (id stays 'tin' so saves keep it): red horseshoe magnet, silver tips, a coin being pulled in
    c.save(); c.lineCap = 'butt'; c.strokeStyle = O; c.lineWidth = 17; c.beginPath(); c.moveTo(14, 12); c.lineTo(14, 30); c.arc(29, 30, 15, Math.PI, 0, true); c.lineTo(44, 12); c.stroke();
    const mg = c.createLinearGradient(0, 14, 0, 48); mg.addColorStop(0, '#ff5a5a'); mg.addColorStop(.5, '#e0262e'); mg.addColorStop(1, '#9e141c'); c.strokeStyle = mg; c.lineWidth = 12; c.beginPath(); c.moveTo(14, 19); c.lineTo(14, 30); c.arc(29, 30, 15, Math.PI, 0, true); c.lineTo(44, 19); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2.5; c.beginPath(); c.arc(29, 30, 18, Math.PI * .95, Math.PI * .55, true); c.stroke();
    c.fillStyle = O; c.fillRect(7.5, 5, 13, 15); c.fillRect(37.5, 5, 13, 15); const sg = c.createLinearGradient(8, 0, 20, 0); sg.addColorStop(0, '#f4f6fa'); sg.addColorStop(.5, '#b9c0cc'); sg.addColorStop(1, '#8a92a0'); c.fillStyle = sg; c.fillRect(9.5, 7, 9, 11); c.fillRect(39.5, 7, 9, 11);
    c.fillStyle = '#ffd75a'; c.strokeStyle = O; c.lineWidth = 1.5; c.beginPath(); c.arc(29, 4.5, 4, 0, 7); c.fill(); c.stroke(); c.strokeStyle = '#fff3b0'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(24, 10); c.lineTo(22, 13); c.moveTo(34, 10); c.lineTo(36, 13); c.stroke(); c.restore(); }
  else if (it.id === 'chappal') { c.translate(29, 30); c.rotate(-.5); c.fillStyle = O; c.beginPath(); c.ellipse(0, 0, 11, 23, 0, 0, 7); c.fill(); c.fillStyle = '#8a5428'; c.beginPath(); c.ellipse(0, 0, 9, 21, 0, 0, 7); c.fill(); c.fillStyle = '#b97a3e'; c.beginPath(); c.ellipse(0, -2, 6.5, 17, 0, 0, 7); c.fill(); c.strokeStyle = '#5a3416'; c.lineWidth = 4; c.beginPath(); c.moveTo(-9, -6); c.quadraticCurveTo(0, -14, 9, -6); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.2; [-28, -16].forEach(a => { c.beginPath(); c.moveTo(14, a + 20); c.lineTo(22, a + 14); c.stroke(); }); }
  else if (it.id === 'dates') { c.fillStyle = '#e9e1cf'; c.beginPath(); c.ellipse(29, 42, 22, 6, 0, 0, 7); c.fill(); [[19, 34], [29, 32], [39, 34], [24, 25], [34, 25], [29, 18]].forEach(([x, y]) => { c.fillStyle = O; c.beginPath(); c.ellipse(x, y, 6.5, 9, .3, 0, 7); c.fill(); c.fillStyle = '#7a3a12'; c.beginPath(); c.ellipse(x, y, 5, 7.5, .3, 0, 7); c.fill(); c.fillStyle = 'rgba(255,200,140,.5)'; c.beginPath(); c.ellipse(x - 1.5, y - 2.5, 1.5, 3, .3, 0, 7); c.fill(); }); }
  else if (it.id === 'envelope') { [[-6, 6, '#16703c'], [0, 0, '#1f8a4c'], [6, -6, '#25a35a']].forEach(([dx, dy, col]) => { c.fillStyle = '#0f3d26'; rr(13 + dx, 18 + dy, 30, 21, 3); c.fill(); c.fillStyle = col; rr(14.5 + dx, 19.5 + dy, 27, 18, 2); c.fill(); c.fillStyle = '#ffd75a'; c.beginPath(); c.arc(28 + dx, 30 + dy, 3, 0, 7); c.fill(); }); }
  else if (it.id === 'cat') { const sv = { x: CAT.x, y: CAT.y, sit: CAT.sit, air: CAT.air, ride: CAT.ride }; CAT.x = 29; CAT.y = 50; CAT.sit = 1; CAT.air = 0; CAT.ride = 1; c.save(); c.translate(29, 50); c.scale(1.5, 1.5); c.translate(-29, -50); CAT.draw(c); c.restore(); Object.assign(CAT, sv); }
  else if (it.id === 'jalebi') { const J = JAL_ART.complete && JAL_ART.naturalWidth ? JAL_ART : jalebiImg(); c.imageSmoothingQuality = 'high'; c.drawImage(J, 6, 4, 46, 46); }
  else if (it.id === 'misbaha') { c.lineWidth = 1; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x = 29 + Math.cos(a) * 17, y = 26 + Math.sin(a) * 15; c.fillStyle = O; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.fillStyle = i % 8 === 0 ? '#fff3b0' : '#e8b830'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
    c.fillStyle = '#e8b830'; c.fillRect(27, 41, 4, 9); c.fillStyle = '#c8901c'; c.beginPath(); c.moveTo(24, 50); c.lineTo(34, 50); c.lineTo(29, 56); c.fill(); }
  c.restore();
}
function owned(tab, it) { return tab === 'style' ? !!SHOP.own[it.id] : tab === 'outfit' ? !!SHOP.own[it.id] || it.price === 0 : tab === 'gadget' ? !!SHOP.own[it.id] : it.id === 'slot' ? SHOP.slots >= 3 : false; }
function renderShop() {
  $('shBank').textContent = bank.toLocaleString('en-GB');
  document.querySelectorAll('.shopTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === shopTab));
  $('slotInfo').innerHTML = shopTab === 'gadget' ? `Gadgets on:<br><b style="color:#ffd75a">${SHOP.eq.length} / ${SHOP.slots}</b>` : shopTab === 'util' ? `Head starts: ${SHOP.hs500 + SHOP.hs1000}<br>Second chances: ${SHOP.save}` : '';
  const L = $('shopList'); L.innerHTML = '';
  ITEMS[shopTab].forEach((it, i) => {
    const row = document.createElement('div'); row.className = 'item'; row.style.animationDelay = i * .04 + 's';
    const own = owned(shopTab, it), on = shopTab === 'gadget' ? hasG(it.id) : shopTab === 'outfit' ? SHOP.outfit === it.id : shopTab === 'style' ? SHOP[it.k] === it.id : false; if (on) row.classList.add('on');
    const cnt = it.use ? `<span class="own">You have ${SHOP[it.id] || 0}</span>` : '';
    let btn, cls = '';
    if (it.use) btn = '£' + it.price.toLocaleString('en-GB');
    else if (!own) btn = '£' + it.price.toLocaleString('en-GB');
    else if (it.id === 'slot') { btn = 'OWNED'; cls = 'eq'; }
    else if (on) { btn = shopTab === 'outfit' ? 'WEARING' : shopTab === 'style' ? 'IN USE' : 'EQUIPPED'; cls = 'on'; }
    else { btn = shopTab === 'outfit' ? 'WEAR' : shopTab === 'style' ? 'USE' : 'EQUIP'; cls = 'eq'; }
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
    POL.buy(row);
    if (!it.use && tab === 'gadget' && SHOP.eq.length < SHOP.slots) SHOP.eq.push(it.id);
    if (!it.use && tab === 'outfit') SHOP.outfit = it.id;
    if (tab === 'style') SHOP[it.k] = it.id;
  } else if (tab === 'style') { SHOP[it.k] = SHOP[it.k] === it.id ? '' : it.id; tone(660, .06, 'square', .04);
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
tap('smNo', () => { clearInterval(saveMe.iv); $('saveMe').classList.add('hide'); usedSave = 1; postRun(); });
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
  // owner 22 Nov: look for a new version when the game opens, every time it comes back on screen and every minute (browser and Home Screen app);
  // a new version loads straight away on the home screen, or once the run is over, so nobody is thrown out mid-game. Saved coins/shop stay.
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => { const up = () => reg.update().catch(() => {});
    up(); document.addEventListener('visibilitychange', () => { if (!document.hidden) up(); }); addEventListener('pageshow', up); addEventListener('focus', up); setInterval(up, 60000); }).catch(() => {});
  let had = !!navigator.serviceWorker.controller, want = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!had) { had = true; return; } want = true; });
  setInterval(() => { if (!want) return; const vis = id => $(id) && !$(id).classList.contains('hide');
    if ((state === 'menu' && vis('home')) || (state === 'dead' && vis('over'))) location.reload(); }, 1000);
}
tap('bMis', () => { $('misRank').innerHTML = rankHtml(); missionRows($('misRows')); $('mis').classList.remove('hide'); }); tap('misClose', () => $('mis').classList.add('hide')); tap('howClose', () => $('how').classList.add('hide'));
tap('bShare', () => share('Late for Jummah? Play Jummah Dash – an SMR Original 🕌💨'));
tap('again', start); tap('ovHome', goHome);
tap('eidiGo', () => { if (POSTBANK) { bankedDone(); return; } if ($('eidiGo').dataset.life) revive(); else { $('eidiBox').classList.add('hide'); eidi = 0; showOver(); } });
tap('ovShare', () => share(`I flew ${Math.floor(dist / 10)}m and grabbed £${coins} trying to get to Jummah 😂 Beat that on Jummah Dash:`));
tap('snd', () => setSound(!sndOn));
const noHold = el => el && el.closest && el.closest('.btn,#home,.sheet,#over,#eidiBox,#pz,#rot,#bShield,#bDash,#bHorn,#bBat');
window.addEventListener('pointerdown', e => { if (noHold(e.target)) return; holding = true; audio(); swipe = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, done: 0 }; });
let swipe = null;   // swipe right = steam dash
window.addEventListener('pointermove', e => { if (e.pointerType === 'touch' || !swipe || swipe.done || e.pointerId !== swipe.id) return; const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, dt2 = performance.now() - swipe.t;
  if (dt2 < 350 && dx > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { swipe.done = 1; steamDash(); } else if (dt2 >= 350) swipe = null; });
window.addEventListener('touchstart', e => { if (noHold(e.target)) return; e.preventDefault(); holding = true; audio(); for (const tc of e.changedTouches) tSwipe[tc.identifier] = { x: tc.clientX, y: tc.clientY, t: performance.now() }; }, { passive: false });
/* steam dash on phones (owner 23 Nov: swipe wasn't firing): touch events, because the page's touch-action lets the browser cancel pointer moves sideways.
   A quick flick right of 28px+ dashes, from any finger, even while another finger holds to fly. */
const tSwipe = {};
window.addEventListener('touchmove', e => { for (const tc of e.changedTouches) { const s0 = tSwipe[tc.identifier]; if (!s0 || s0.done) continue; const dx = tc.clientX - s0.x, dy = tc.clientY - s0.y, el = performance.now() - s0.t;
  if (dx > 28 && dx > Math.abs(dy) * .9 && el < 450) { s0.done = 1; steamDash(); } else if (el >= 450) { s0.x = tc.clientX; s0.y = tc.clientY; s0.t = performance.now(); } } }, { passive: true });
window.addEventListener('touchend', e => { for (const tc of e.changedTouches) delete tSwipe[tc.identifier]; });
window.addEventListener('touchend', e => { holding = [...e.touches].some(t => !noHold(t.target)); }); window.addEventListener('touchcancel', () => holding = false);
window.addEventListener('pointerup', e => { if (e.pointerType === 'touch') return; holding = false; }); window.addEventListener('pointercancel', () => holding = false);
window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (state === 'menu') start(); else if (state === 'dead' && !$('over').classList.contains('hide')) start(); else holding = true; } });
window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') holding = false; });
document.addEventListener('gesturestart', e => e.preventDefault());
/* phone browsers (owner 22 Nov): a welcome screen asks for rotation lock (iPhone) or full screen (Android); if the screen turns
   in the browser the game pauses and asks again; any turn mid-run pauses the game (tap to carry on) so nobody dies in the flip */
const UA = navigator.userAgent, IOS = /iPhone|iPad|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), AND = /Android/i.test(UA);
const PHONE = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 520;
let welcomed = false, anyway = false, lastPort = null;
const running = () => state === 'play' || state === 'intro';
const pauseGame = () => { if (running() && !paused) { paused = true; holding = false; $('pz').classList.remove('hide'); } };
tap('pz', () => setTimeout(() => { paused = false; $('pz').classList.add('hide'); }, 120));
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
function rotCheck() {
  const port = innerHeight > innerWidth, fs = !!(document.fullscreenElement || document.webkitFullscreenElement), r = $('rot');
  if (lastPort !== null && port !== lastPort) pauseGame(); lastPort = port;
  let m = '';
  if (PHONE && !isApp) {
    if (!welcomed) m = 'welcome';
    else if (!port && IOS && !anyway) m = 'lock';
    else if (!port && AND && !fs && !anyway) m = 'fs';
  }
  r.dataset.os = IOS ? 'ios' : AND ? 'and' : 'oth'; r.dataset.m = m; r.classList.toggle('hide', !m);
  if (m && m !== 'welcome') pauseGame();
}
const goFull = async () => { if (!AND) return; try { const d = document.documentElement; await (d.requestFullscreen ? d.requestFullscreen({ navigationUI: 'hide' }) : d.webkitRequestFullscreen()); } catch (e) {} try { await screen.orientation.lock('landscape'); } catch (e) {} };
tap('rotGo', () => { welcomed = true; if (innerWidth > innerHeight) anyway = true; goFull(); rotCheck(); if (!$('rot').classList.contains('hide')) { anyway = true; rotCheck(); } });   // owner 22 Nov: PLAY always opens the game (already sideways = just play)
tap('rotFs', () => { goFull(); setTimeout(rotCheck, 400); });
tap('rotAny', () => { anyway = true; rotCheck(); });
const reflow = () => { resize(); rotCheck(); };
window.addEventListener('resize', reflow); window.addEventListener('orientationchange', () => { pauseGame(); [80, 250, 600].forEach(d => setTimeout(reflow, d)); });
if (window.visualViewport) visualViewport.addEventListener('resize', reflow);
document.addEventListener('fullscreenchange', () => setTimeout(reflow, 100));
[60, 300, 900].forEach(d => setTimeout(reflow, d));   // first open: Safari settles its size a moment after load
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

/* ---------- Add your car (owner 22 Nov): a request to the owner (first name, car, photo), shared with Flappy Kabootar via /flappy/carreq.js.
   Once he approves it in SMR Admin, this phone gets a message (in the game, and as a notification if turned on) and its car drives past
   at least every 30 s; approved cars from other players turn up now and then. ---------- */
const MYCAR = (() => { let t = 6, pubT = 40 + Math.random() * 30; const pub = [], mine = [];
  function reg(k, img, model) { const U = window.CARS_U || .0204, w = Math.round(4450 * U) + 2, h = Math.max(20, Math.round((w - 2) * img.height / img.width));
    VEHICLES[k] = { n: model || 'Your car', w, h, weight: 0, speed: [32, 48], colours: [[k, '#ffffff']], v3: 1, user: 1, d(c, x, G) { c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(img, x, G - h, w - 2, h); } };
    for (const id of [...carCache.keys()]) if (id.startsWith(k)) carCache.delete(id); }
  function load(src, k, model, cb) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { reg(k, im, model); if (cb) cb(); }; im.src = src; }
  function check() { if (!window.SMRCar) return; SMRCar.poll(j => {
      (j.cars || []).forEach(c => { const k = 'u' + c.id; if (mine.includes(k)) return; load(SMRCar.img(c.id, c.done_at || c.at), k, c.model, () => { if (!mine.includes(k)) mine.push(k); t = Math.min(t, 4); }); });
      MSG.add(j.msgs || []); }); }
  fetch('/flappy/api.php?a=cfg', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(c => { (c && c.cars || []).slice(0, 30).forEach(cr => load('/flappy/api.php?a=carimg&id=' + cr.id + '&v=' + cr.at, 'u' + cr.id, cr.model, () => { if (!pub.includes('u' + cr.id)) pub.push('u' + cr.id); })); }).catch(() => {});
  setTimeout(check, 1500); setInterval(check, 60000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  return { check, tick(dt) { if (state !== 'play' || (boost && !boost.out) || CVZ || jamT > 0) return;
    if (mine.length) { t -= dt; if (t <= 0) t = spawnCar(null, mine[Math.random() * mine.length | 0], false, Math.random() < .5 ? 0 : 1) ? 30 : 1; }
    const others = pub.filter(k => !mine.includes(k)); if (others.length) { pubT -= dt; if (pubT <= 0) pubT = spawnCar(null, others[Math.random() * others.length | 0], false, Math.random() < .5 ? 0 : 1) ? 45 + Math.random() * 40 : 2; } } };
})();
// messages from the owner about a car: shown when the player isn't mid-run
const MSG = (() => { const q = []; let open = false;
  function show() { if (open || !q.length || state === 'play' || state === 'intro') return; const m = q.shift(); open = true; $('msgT').textContent = m.title || 'Message'; $('msgB').textContent = m.body || ''; $('msgBox').classList.remove('hide'); if (window.SMRCar) SMRCar.seen([m.id]); }
  $('msgOk').addEventListener('click', () => { $('msgBox').classList.add('hide'); open = false; setTimeout(show, 450); });
  $('msgBox').addEventListener('pointerdown', e => e.stopPropagation());
  setInterval(show, 1000);
  return { add(list) { list.forEach(m => { if (!q.some(x => x.id === m.id)) q.push(m); }); show(); } };
})();
(() => { const cm = $('carBox'); let rd = null, flip = false, stage = 0, busy = false;
  const btn = $('cS'), st = $('cSt'), no = $('cNo'), err = $('cE');
  const setBtn = () => { btn.classList.toggle('sure', stage === 1); btn.classList.toggle('yes', stage === 2); btn.textContent = stage === 1 ? 'ARE YOU SURE?' : stage === 2 ? 'YES, SEND IT' : 'SEND REQUEST'; };
  const close = () => { const a = document.activeElement; if (a && a.blur) a.blur(); cm.classList.add('hide'); };
  try { const n = localStorage.getItem('smr_first'); if (n) $('cN').value = n; } catch (e) {}
  tap('bCar', () => { $('carF').classList.remove('hide'); $('carOk').classList.add('hide'); err.textContent = ''; cm.classList.remove('hide'); });
  cm.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === cm) close(); }); cm.addEventListener('keydown', e => e.stopPropagation());
  $('cX').addEventListener('click', close); $('cC').addEventListener('click', close);
  function preview() { const src = flip ? SMRCar.flip(rd.cut ? rd.cut.c : rd.img) : (rd.cut ? rd.cut.c : rd.img), cv = $('cCv'), w = 480, h = Math.round(w * .45), x = cv.getContext('2d'); cv.width = w; cv.height = h; x.clearRect(0, 0, w, h);
    const k = Math.min((w - 30) / src.width, (h - 24) / src.height), dw = src.width * k, dh = src.height * k;
    if (rd.cut) { x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(w / 2, h - 12, dw * .46, 6, 0, 0, 7); x.fill(); }
    x.imageSmoothingQuality = 'high'; x.drawImage(src, (w - dw) / 2, rd.cut ? h - 12 - dh : (h - dh) / 2, dw, dh); $('cPv').classList.add('on'); }
  $('cFl').addEventListener('click', () => { if (!rd) return; flip = !flip; preview(); });
  $('cF').addEventListener('change', async e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    if (!window.SMRCar) { err.textContent = "Couldn't load. Check your signal and try again."; return; }
    rd = null; flip = false; stage = 0; setBtn(); no.classList.remove('on'); err.textContent = ''; $('cPv').classList.remove('on'); busy = true; btn.disabled = true; st.textContent = 'Checking your photo…';
    try { rd = await SMRCar.read(f); const im = new Image(); im.src = rd.photo; await im.decode(); rd.img = im; preview();
      st.textContent = rd.cut ? 'Looking good! We\'ll tidy it up and make the game car.' : 'Got it! We\'ll make the game car from this.';
      if (rd.flag === 'crop') no.innerHTML = '<b>IS THE WHOLE CAR IN?</b>We can’t see both bumpers. For the best result, take the photo from further back so the whole car fits in.';
      else if (rd.flag === 'front') no.innerHTML = '<b>WE NEED A SIDE VIEW</b>This looks like the front or back of the car. If it\'s the only photo you have we can still try, but it won’t look as good. A side-on photo works best.';
      if (rd.flag) { no.classList.add('on'); stage = 1; setBtn(); }
    } catch (x) { rd = null; st.textContent = ''; err.textContent = x && x.message && x.message.length > 8 ? x.message : "That photo didn't work. Try another one."; }
    finally { busy = false; btn.disabled = false; } });
  btn.addEventListener('click', async () => { if (busy) return; err.textContent = '';
    const name = $('cN').value.trim(), model = $('cM').value.trim();
    if (!name) { err.textContent = 'Please add your first name.'; return; } if (!model) { err.textContent = 'Please type your car.'; return; } if (!rd) { err.textContent = 'Please add a photo of your car.'; return; }
    if (stage === 1) { stage = 2; setBtn(); return; }
    busy = true; btn.disabled = true; btn.textContent = 'SENDING…'; try { localStorage.setItem('smr_first', name); } catch (x) {}
    try { await SMRCar.submit({ name, model, photo: rd.photo, cut: rd.cut ? (flip ? SMRCar.flip(rd.cut.c) : rd.cut.c) : null, flag: rd.flag, game: 'jd' });
      stage = 0; setBtn(); $('carF').classList.add('hide'); $('carOk').classList.remove('hide'); $('cNs').textContent = ''; $('cNt').classList.toggle('hide', !SMRCar.canNotify() || Notification.permission === 'granted');
      if (SMRCar.canNotify() && Notification.permission === 'granted') SMRCar.notify().catch(() => {});
    } catch (x) { err.textContent = x.message; } finally { busy = false; btn.disabled = false; if (stage === 0) btn.textContent = 'SEND REQUEST'; } });
  $('cNt').addEventListener('click', async () => { try { await SMRCar.notify(); $('cNt').classList.add('hide'); $('cNs').textContent = "Done! We'll send a notification when your car is ready."; }
    catch (x) { $('cNs').textContent = /iPhone|iPad/.test(navigator.userAgent) && !navigator.standalone ? 'On iPhone, add Jummah Dash to your Home Screen first, then turn notifications on. You\'ll still see the message here in the game.' : 'Notifications are off, but you\'ll still see the message here in the game.'; } });
})();
// owner 22 Nov: an X on every pop-up (uses the pop-up's own close button when it has one, so its tidy-up still runs)
(() => { const CL = { pick: () => { pickThenPlay = false; $('pick').classList.add('hide'); }, msgBox: () => $('msgOk').click() };
  const add = s => { if (!s.id || s.id === 'shop' || s.querySelector(':scope > .box > .sx')) return; const box = s.querySelector(':scope > .box'); if (!box) return;
    const x = document.createElement('button'); x.className = 'sx'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.textContent = '×'; box.appendChild(x);
    x.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (CL[s.id]) return CL[s.id](); const own = s.querySelector('#' + s.id + 'Close, #cX, #recX, #smrClose');
      if (own && own.offsetParent !== null) { own.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); own.click(); } if (!s.classList.contains('hide')) s.classList.add('hide'); }); };
  const all = () => document.querySelectorAll('.sheet').forEach(add); all(); addEventListener('DOMContentLoaded', all); setTimeout(all, 1500);
  new MutationObserver(all).observe($('ui'), { childList: true }); })();
resize(); seedStars(); reset(); refreshHome(); if (myMosque) setTimeout(refreshHome, 300);
if (!myMosque) setTimeout(() => { if (!myMosque && state === 'menu') { pickThenPlay = false; openPick(); } }, 900);   // first time: pick your masjid (later: Settings)

/* FLAPPY KABOOTAR MODE (owner 22 Nov, demo, not live): grabbing the Flappy Kabootar gift box freezes the run, the screen breaks into
   pixels and you're in the real Flappy Kabootar game (fk/: a separate copy with every Flappy rule, sky fixed at ~1pm, landscape),
   riding the pigeon through the pipes, picking up £1 coins in the gaps. Crash = pixels again and you carry on the run.
   ?fkdemo=1 = the gift box is always the pigeon and keeps coming back. Old ride: window.__oldPigeon = 1. */
let FM = null;
const FMS = (() => { const tmp = document.createElement('canvas'), tg = tmp.getContext('2d'), snap = document.createElement('canvas'); let fr = null, ready = false;
  function frame0() { if (fr) return fr; fr = document.createElement('iframe'); fr.src = 'fk/index.html?h=baaaab3e34&hour=13&jd=1'; fr.setAttribute('allow', 'autoplay');
    fr.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;pointer-events:none;z-index:2;background:#000';
    $('cv').after(fr); return fr; }
  window.__jdFkReady = () => { ready = true; };
  window.__jdHero = () => ({ im: heroImg, sx: FR('sit' + (Math.floor(t * 3) % 2) + '_happy') * HW * HX4, sw: HW * HX4, sh: HH0 * HX4, w: HW, h: HH0 });
  window.__jdCoin = () => { coins += 10; SFX.coin();   // owner 23 Nov: every coin in Flappy Kabootar mode is worth £10
 $('coins').textContent = '£' + coins; };
  window.__jdFkDone = r => { if (!FM || FM.ph !== 'play') return; FM.res = r; FM.ph = 'out'; FM.t = 0; fr.style.opacity = 0; fr.style.pointerEvents = 'none'; };
  const fw = () => fr && fr.contentWindow;
  function enter() { frame0(); if (!ready || !fw().__jdGo) return false;
    snap.width = cv.width; snap.height = cv.height; snap.getContext('2d').drawImage(cv, 0, 0);
    FM = { ph: 'in', t: 0, go: 0 }; holding = false; RUN.kabootar = 1; veh = null; hero.thrust = false; if (hissG) try { hissG.gain.cancelScheduledValues(AC.currentTime); hissG.gain.setValueAtTime(0, AC.currentTime); } catch (e) {}   // no jetpack hiss in Flappy world
    [988, 784, 659, 523, 392, 523, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .07, 'square', .05), i * 55));   // 8-bit "going in"
    return true; }
  function pixelate(src, b) { const tw = Math.max(1, Math.ceil(cv.width / b)), th = Math.max(1, Math.ceil(cv.height / b)); if (tmp.width !== tw || tmp.height !== th) { tmp.width = tw; tmp.height = th; }
    tg.imageSmoothingEnabled = true; tg.imageSmoothingQuality = 'medium'; tg.drawImage(src, 0, 0, tw * b * src.width / cv.width, th * b * src.height / cv.height, 0, 0, tw, th);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, tw, th, 0, 0, tw * b, th * b); }
  function step(dt) { FM.t += dt; if (FM.ph === 'in' && FM.t > 1.05) { FM.ph = 'play'; fr.style.opacity = 1; fr.style.pointerEvents = 'auto'; try { fr.focus(); } catch (e) {} } }
  function frame() { const fc = fw() && fw().__jdCanvas && fw().__jdCanvas();
    if (FM.ph === 'in') { const k = FM.t;
      if (k < .5) { const e = k / .5; pixelate(snap, 1 + e * e * 30); }
      else { if (!FM.go) { FM.go = 1; fw().__jdGo(sndOn); } const e = Math.min(1, (k - .5) / .55); if (fc && fc.width) pixelate(fc, Math.max(1, 31 * (1 - e) * (1 - e))); }
      if (k < .12) { ctx.fillStyle = `rgba(255,255,255,${.6 - k * 5})`; ctx.fillRect(0, 0, cv.width, cv.height); }
      return; }
    if (FM.ph === 'out') { const k = FM.t;
      if (k < .45) { if (fc && fc.width) pixelate(fc, 1 + (k / .45) * (k / .45) * 30); return; }
      if (!FM.back) { FM.back = 1; backToGame(); }
      draw(); const e = Math.min(1, (k - .45) / .55); if (e < 1) pixelate(cv, Math.max(1, 31 * (1 - e) * (1 - e))); else { FM = null; try { fw().__jdEnd(); } catch (e2) {} }
      return; } }
  function backToGame() {   // back in the run: in the air, invincible for a moment, nothing dangerous right on top of him
    hero.y = FLOOR - 150; hero.vy = -380; hero.ground = false; hero.rot = 0; inv = 2.4; veh = null; holding = false;
    obs = obs.filter(o => o.x > W + 60 && o.type !== 'laser'); shake = .25;
    const r = FM.res || { score: 0, coins: 0 }, n = r.score; RUN.fkPipes = Math.max(RUN.fkPipes || 0, n);
    pops.push({ x: hero.x + 30, y: hero.y - 90, txt: n ? n + (n === 1 ? ' PIPE!' : ' PIPES!') + (r.coins ? ' +£' + r.coins * 10 : '') : 'KABOOTAR FLEW OFF!', col: '#ffd21f', t: 0 });
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .08, 'square', .05), i * 60)); }
  setTimeout(frame0, 2500);   // load it in the background so it's ready the moment he grabs the box
  return { enter, step, frame, preload: frame0 };
})();
let last = performance.now();
let SLOW = 1;   // slow motion while the Hoover Mech suits up

/* ================= POLISH PASS (owner 23 Nov evening: every animation given more life) ================= */
var HITT = 0, SMT = 0;   // hit-stop freeze, near-miss slow motion
const POL = (() => { const P = { fx: [], flock: [], nextFlock: 4, streak: 0, streakT: 0, lastRun: 0, lastHold: false, zapSeen: new WeakSet(), lastRide: null };
  const star = (g, x, y, r, a, col) => { g.save(); g.globalAlpha = a; g.fillStyle = col || '#fffbe0'; g.beginPath(); g.moveTo(x, y - r * 2); g.lineTo(x + r * .45, y - r * .45); g.lineTo(x + r * 2, y); g.lineTo(x + r * .45, y + r * .45); g.lineTo(x, y + r * 2); g.lineTo(x - r * .45, y + r * .45); g.lineTo(x - r * 2, y); g.lineTo(x - r * .45, y - r * .45); g.closePath(); g.fill(); g.restore(); };
  P.star = star;
  // ---- jet flame: white-hot core, yellow and orange layers, flicker, shock diamonds, heat glow ----
  P.jet = (g, x, y, L, w, heat) => { g.save(); g.globalCompositeOperation = 'lighter';
    const gl = g.createRadialGradient(x, y, 0, x, y, 10 + L * .45); gl.addColorStop(0, `rgba(255,${190 - heat * 60},90,.55)`); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, 10 + L * .45, 0, 7); g.fill();
    const layer = (wd, len, c0, c1, c2, ph) => { const lg = g.createLinearGradient(0, y, 0, y + len); lg.addColorStop(0, c0); lg.addColorStop(.45, c1); lg.addColorStop(1, c2); g.fillStyle = lg; g.beginPath(); g.moveTo(x - wd, y);
      for (let k = 1; k <= 7; k++) { const yy = y + len * k / 7, ww = wd * (1 - k / 7) * (1 + .22 * Math.sin(t * 55 + k * 1.9 + ph)); g.lineTo(x - ww + (Math.random() - .5), yy); }
      for (let k = 7; k >= 1; k--) { const yy = y + len * k / 7, ww = wd * (1 - k / 7) * (1 + .22 * Math.cos(t * 51 + k * 2.3 + ph)); g.lineTo(x + ww + (Math.random() - .5), yy); } g.lineTo(x + wd, y); g.closePath(); g.fill(); };
    const hot = heat > .7 ? (heat - .7) / .3 : 0;
    layer(w * 1.3, L * 1.05, `rgba(255,${150 - hot * 60},${50 - hot * 30},.75)`, 'rgba(255,80,20,.45)', 'rgba(200,40,10,0)', 0);
    layer(w * .85, L * .82, 'rgba(255,240,150,.95)', 'rgba(255,190,60,.7)', 'rgba(255,120,30,0)', 1.7);
    layer(w * .4, L * .5, 'rgba(255,255,255,1)', 'rgba(210,235,255,.85)', 'rgba(150,200,255,0)', 3.1);
    for (let d = 0; d < 3; d++) { const yy = y + ((t * 150 + d * 8) % (L * .45 + 1)), dw = 2 * (1 - (yy - y) / (L * .5 + 1)); if (dw > .2) { g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(x, yy - dw * 1.6); g.lineTo(x + dw, yy); g.lineTo(x, yy + dw * 1.6); g.lineTo(x - dw, yy); g.closePath(); g.fill(); } }
    g.restore(); };
  // ---- hero, drawn inside his own transform ----
  P.heroPre = () => { if (state !== 'play' && state !== 'intro') return;
    const sq = hero.sq || 0; if (sq) { ctx.scale(1 + sq * .14, 1 - sq * .18); }
    if (hero.thrust) { const j = (hero.heat > .7 ? 1.6 : .5) * hero.heat; ctx.translate((Math.random() - .5) * j, (Math.random() - .5) * j);   // the cooker rattles under pressure
      const nx = -14 * HS, ny = -16 * HS, L = 36 + Math.random() * 12 + (hero.thrustT < .12 ? 18 : 0); P.jet(ctx, nx, ny, L, 7, hero.heat); }
    else if (!hero.ground && hero.oh <= 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const pf = 4 + Math.random() * 2, lg = ctx.createLinearGradient(0, -16 * HS, 0, -16 * HS + pf); lg.addColorStop(0, 'rgba(180,220,255,.85)'); lg.addColorStop(1, 'rgba(80,140,255,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(-14 * HS - 2, -16 * HS); ctx.quadraticCurveTo(-14 * HS, -16 * HS + pf * 1.4, -14 * HS + 2, -16 * HS); ctx.fill(); ctx.restore(); } };   // pilot flame while gliding
  P.heroPost = () => { if (state !== 'play' && state !== 'intro') return; const h = hero.heat || 0;
    if (h > .62 || hero.oh > 0) { const k = hero.oh > 0 ? .8 : (h - .62) / .38, pu = .6 + .4 * Math.sin(t * (10 + k * 20));   // the cooker glows red-hot before it blows
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const cx = -13 * HS, cy = -31 * HS, rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15 * HS); rg.addColorStop(0, `rgba(255,70,30,${(.55 * k * pu).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,40,20,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, 15 * HS, 0, 7); ctx.fill(); ctx.restore(); } };
  P.deadPost = f => { if (hero.soot > 0) { tintCv.width = HW * HX4; tintCv.height = HH0 * HX4; const tc = tintCv.getContext('2d'); tc.drawImage(heroImg, f * HW * HX4, 0, HW * HX4, HH0 * HX4, 0, 0, HW * HX4, HH0 * HX4); tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = 'rgba(30,24,22,.62)'; tc.fillRect(0, 0, tintCv.width, tintCv.height); ctx.drawImage(tintCv, -HW * HS / 2, -HH, HW * HS, HH); }   // sooty from the rocket
    if (hero.fizz > 0 && Math.random() < .6) sparks.push({ x: hero.x + (Math.random() - .5) * 30, y: hero.y - Math.random() * 50, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 60, l: .4, c: Math.random() < .5 ? '#e88aff' : '#ffffff' }); };
  // ---- coins ----
  P.coin = c => { P.streak = P.streakT > 0 ? Math.min(14, P.streak + 1) : 0; P.streakT = .45; SFX.coin(1 + P.streak * .035);
    for (let i = 0; i < 3; i++) P.fx.push({ k: 'star', x: c.x + (Math.random() - .5) * 10, y: c.y + (Math.random() - .5) * 10, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 70, t: 0, l: .38, r: 1.6 + Math.random() * 1.2 });
    const last = P.fx.find(f => f.k === 'plus' && f.t < .25); if (last) { last.n += 1; last.x = c.x; last.y = c.y - 8; last.t = 0; } else P.fx.push({ k: 'plus', x: c.x, y: c.y - 8, t: 0, l: .7, n: 1 });
    P.fx.push({ k: 'cstretch', x: c.x, y: c.y, t: 0, l: .16 });
    const el = $('coins'); if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } };
  P.glint = (c, s2) => { const ph = (t * .9 + c.x * .013) % 3; if (ph < .35) star(ctx, c.x + s2 * .18, c.y - s2 * .2, 1.4 * Math.sin(ph / .35 * Math.PI), .95); };
  // ---- warnings and hits ----
  P.warnLine = o => { const a = .25 + .2 * Math.sin(t * 20); ctx.save(); const lg = ctx.createLinearGradient(W - 40, 0, W * .45, 0); lg.addColorStop(0, `rgba(255,40,40,${a + .3})`); lg.addColorStop(1, 'rgba(255,40,40,0)'); ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = t * 80; ctx.beginPath(); ctx.moveTo(W - 40, o.y); ctx.lineTo(W * .45, o.y); ctx.stroke(); ctx.restore(); };
  P.died = why => { HITT = .1; hero.soot = why === 'rocket' ? 1 : 0; hero.fizz = why === 'laser' ? 1.3 : 0; const n = Math.min(10, 3 + Math.floor(coins / 20));
    for (let i = 0; i < n; i++) P.fx.push({ k: 'spill', x: hero.x, y: hero.y - 30, vx: 40 + Math.random() * 160, vy: -160 - Math.random() * 160, t: 0, l: 2.2, b: 0, sp: Math.random() * 6 }); };
  P.chunks = cols => { for (let i = 0; i < 12; i++) P.fx.push({ k: 'chunk', x: hero.x + (Math.random() - .5) * 60, y: hero.y - 10 - Math.random() * 50, vx: (Math.random() - .3) * 320, vy: -120 - Math.random() * 260, t: 0, l: 1.6, a: Math.random() * 6, sp: (Math.random() - .5) * 14, w: 4 + Math.random() * 8, h: 3 + Math.random() * 5, c: cols[i % cols.length], b: 0 }); };
  P.crack = x => P.fx.push({ k: 'crack', x, y: FLOOR + 1, t: 0, l: 1.4, seed: Math.random() * 100 });
  P.flipFx = () => { P.fx.push({ k: 'ring', x: hero.x, y: veh.g < 0 ? CEIL + 6 : FLOOR, t: 0, l: .45, col: '125,255,160' }); P.fx.push({ k: 'streak', x: hero.x, y0: hero.y, t: 0, l: .3 }); };
  P.over = (newBest) => { const box = document.querySelector('#over .card'); if (box) { box.classList.remove('popin'); void box.offsetWidth; box.classList.add('popin'); }
    const count = (id, to, pre, suf) => { const el = $(id); if (!el) return; const t0 = performance.now(), D = 900; const step = () => { const k = Math.min(1, (performance.now() - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + Math.round(to * e).toLocaleString('en-GB') + suf; if (k < 1) { if (Math.random() < .5) tone(900 + k * 600, .03, 'square', .02, 0, MIX && MIX.fx); requestAnimationFrame(step); } }; step(); };
    count('oD', Math.floor(dist / 10), '', 'm'); count('oC', coins, '£', '');
    if (newBest) setTimeout(() => { const b = document.createElement('div'); b.className = 'nbest'; b.textContent = 'NEW BEST!'; (box || document.body).appendChild(b); setTimeout(() => b.remove(), 3200);
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .14, 'square', .05), i * 90)); P.confetti(); }, 950); };
  P.confetti = () => { const host = $('over') || document.body; for (let i = 0; i < 46; i++) { const d = document.createElement('i'); d.className = 'cf'; d.style.left = (Math.random() * 100) + '%'; d.style.background = ['#ffd75a', '#7dffa0', '#7fb6ff', '#ff8ac0', '#ffffff', '#c58bff'][i % 6]; d.style.animationDelay = (Math.random() * .4) + 's'; d.style.animationDuration = (1.6 + Math.random() * 1.2) + 's'; d.style.setProperty('--dx', ((Math.random() - .5) * 120) + 'px'); host.appendChild(d); setTimeout(() => d.remove(), 3200); } };
  P.buy = row => { if (row) { row.classList.remove('bought'); void row.offsetWidth; row.classList.add('bought'); } tone(2093, .05, 'square', .05); setTimeout(() => { tone(1568, .45, 'triangle', .07, .3); tone(2637, .35, 'sine', .05, .3); }, 40); for (let i = 0; i < 6; i++) setTimeout(() => SFX.coin(1 + i * .05), 120 + i * 70);
    if (row) { const r = row.getBoundingClientRect(); for (let i = 0; i < 10; i++) { const d = document.createElement('i'); d.className = 'bcoin'; d.style.left = (r.left + r.width * .2) + 'px'; d.style.top = (r.top + r.height / 2) + 'px'; d.style.setProperty('--dx', ((Math.random() - .3) * 160) + 'px'); d.style.setProperty('--dy', (-60 - Math.random() * 80) + 'px'); document.body.appendChild(d); setTimeout(() => d.remove(), 900); } } };
  P.missionStar = () => { const el = $('mtoast'); if (!el) return; const r = el.getBoundingClientRect(), s = document.createElement('i'); s.className = 'mstar'; s.textContent = '★'; s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px'; document.body.appendChild(s);
    requestAnimationFrame(() => { s.style.left = (innerWidth - 60) + 'px'; s.style.top = '18px'; s.style.transform = 'translate(-50%,-50%) scale(.6) rotate(360deg)'; s.style.opacity = '0.2'; }); setTimeout(() => s.remove(), 1000); setTimeout(() => tone(1568, .12, 'triangle', .05), 700); };
  // ---- per-frame ----
  P.tick = dt => { P.streakT -= dt; if (hero.sq) { hero.sq += (0 - hero.sq) * Math.min(1, dt * 9); if (Math.abs(hero.sq) < .01) hero.sq = 0; }
    hero.thrustT = hero.thrust ? (hero.thrustT || 0) + dt : 0; if (hero.fizz > 0) hero.fizz -= dt;
    const play = state === 'play' && !hero.dead;
    if (play && !veh && !boost) {
      if (hero.thrust && Math.random() < dt * (1.5 + hero.heat * 9)) { steam.push({ x: hero.x - 12 * HS, y: hero.y - 47 * HS, vx: -30 - Math.random() * 30, vy: -70 - Math.random() * 50, r: 1.6 + Math.random() * 1.4, l: .35, l0: .4 }); if (Math.random() < .3) tone(3200 + Math.random() * 800, .04, 'sawtooth', .012, .6, MIX && MIX.jet); }   // valve spits
      if (hero.ground) { const rf = Math.floor(hero.run) % 6; if (rf !== P.lastRun && (rf === 1 || rf === 4)) for (let i = 0; i < 2; i++) dust.push({ x: hero.x + (rf === 1 ? 4 : -4) + (Math.random() - .5) * 6, y: FLOOR, vx: -speed * .25 - 20 - Math.random() * 30, vy: -10 - Math.random() * 15, r: 1.4 + Math.random(), l: .35 }); P.lastRun = rf; } }
    if (play && veh) {
      if (veh.k === 'carpet' && Math.random() < dt * 26) { const end = Math.random() < .5 ? -1 : 1; P.fx.push({ k: 'star', x: hero.x + end * 48, y: hero.y - 2 + (Math.random() - .5) * 6, vx: -speed * .3 - 20, vy: 20 + Math.random() * 30, t: 0, l: .6, r: 1.2 + Math.random(), col: Math.random() < .5 ? '#ffd75a' : '#fff3b0' }); }
      if (veh.k === 'mech' && veh.su >= 1 && Math.random() < dt * 2.5) steam.push({ x: hero.x + (Math.random() < .5 ? -20 : 8) * MCH, y: hero.y - (60 + Math.random() * 50) * MCH, vx: -30 - Math.random() * 40, vy: -40 - Math.random() * 40, r: 2 + Math.random() * 2, l: .45, l0: .5 });
      if (veh.k === 'kabootar' && holding && !P.lastHold) for (let i = 0; i < 3; i++) P.fx.push({ k: 'feather', x: hero.x - 10 + Math.random() * 20, y: hero.y - 30, vx: -speed * .3 - 30 - Math.random() * 40, vy: -20 + Math.random() * 40, t: 0, l: 1.4, a: Math.random() * 6, sp: (Math.random() - .5) * 6 }); }
    P.lastHold = holding;
    obs.forEach(o => { if (o.type === 'zap' && !P.zapSeen.has(o) && o.x - o.len / 2 < W) { P.zapSeen.add(o); tone(140, .25, 'sawtooth', .03, 1.4, MIX && MIX.fx); tone(2600, .05, 'square', .015, .6, MIX && MIX.fx); }
      if (o.type === 'laser' && o.ph === 'fire') shake = Math.max(shake, .035);
      if (o.type === 'laser' && o.ph === 'in' && !o.whir) { o.whir = 1; tone(180, .4, 'sawtooth', .03, 2.2, MIX && MIX.fx); }
      if (o.type === 'rocket' && o.v && !o.defl) npcs.forEach(p => { if (!p.esc && p.fall <= 0 && !p.ducked && Math.abs(p.x - o.x) < 70 && o.y > FLOOR - 110) { p.ducked = 1; p.react = .8; p.hop = 1; p.hopH = 6; p.look = 1; } }); });
    // pigeons on the pavement that scatter as he comes
    if (state === 'play' && (P.nextFlock -= dt) <= 0) { P.nextFlock = 9 + Math.random() * 12; const n = 3 + (Math.random() * 4 | 0), x0 = W + 30; for (let i = 0; i < n; i++) P.flock.push({ x: x0 + i * (10 + Math.random() * 14), y: FLOOR + 2 + Math.random() * 10, fly: 0, vx: 0, vy: 0, ph: Math.random() * 6, d: Math.random() < .5 ? 1 : -1 }); }
    P.flock.forEach(b => { b.ph += dt * 6; if (!b.fly) { b.x -= speed * dt; if (Math.abs(b.x - hero.x) < 110 + Math.random() * 30 && FLOOR - hero.y < 160) { b.fly = 1; b.vx = (60 + Math.random() * 80) * (Math.random() < .7 ? 1 : -1); b.vy = -140 - Math.random() * 80; if (Math.random() < .4) tone(1800 + Math.random() * 400, .05, 'triangle', .015, .7, MIX && MIX.fx); } }
      else { b.x += (b.vx - speed * .4) * dt; b.y += b.vy * dt; b.vy += 30 * dt; } });
    P.flock = P.flock.filter(b => b.x > -40 && b.y > -40 && b.x < W + 400);
    P.fx.forEach(f => { f.t += dt;
      if (f.k === 'star' || f.k === 'feather') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.k === 'feather' ? 20 : 60) * dt; if (f.k === 'feather') { f.a += f.sp * dt; f.vx *= Math.pow(.6, dt); } }
      else if (f.k === 'plus') f.y -= 40 * dt;
      else if (f.k === 'spill' || f.k === 'chunk') { f.vy += 1000 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.sp && (f.a = (f.a || 0) + f.sp * dt); if (f.y > FLOOR) { f.y = FLOOR; if (f.vy > 100 && f.b < 3) { f.vy = -f.vy * .4; f.vx *= .7; f.b++; if (f.k === 'spill' && f.b === 1) tone(1500 + Math.random() * 400, .05, 'square', .02, 0, MIX && MIX.coins); } else { f.vy = 0; f.vx *= .9; } } f.x -= (hero.dead ? 0 : speed * .2) * dt; }
      else if (f.k === 'crack') f.x -= speed * dt; });
    P.fx = P.fx.filter(f => f.t < f.l);
    if (P.lastRide !== (veh && veh.k)) P.lastRide = veh && veh.k; };
  // ---- drawn with the world ----
  P.draw = () => {
    P.flock.forEach(b => { ctx.save(); ctx.translate(b.x, b.y); if (b.d < 0) ctx.scale(-1, 1); ctx.fillStyle = '#7b8090'; ctx.beginPath(); ctx.ellipse(0, -3, 4.2, 2.6, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#5c6070'; ctx.beginPath(); ctx.arc(3.6, -5.2 + (b.fly ? 0 : Math.max(0, Math.sin(b.ph)) * 1.6), 1.7, 0, 7); ctx.fill(); ctx.fillStyle = '#5a8a6a'; ctx.fillRect(2.4, -4.4, 1.6, 1.2);
      ctx.fillStyle = '#e0b040'; ctx.fillRect(5, -5.4 + (b.fly ? 0 : Math.max(0, Math.sin(b.ph)) * 1.6), 1.3, .7);
      if (b.fly) { const w = Math.sin(b.ph * 4) * 4; ctx.fillStyle = '#9aa0b0'; ctx.beginPath(); ctx.moveTo(-1, -4); ctx.lineTo(-4, -4 - w); ctx.lineTo(2, -4); ctx.fill(); } else { ctx.strokeStyle = '#c86a6a'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, 0); ctx.stroke(); } ctx.restore(); });
    P.fx.forEach(f => { const k = f.t / f.l;
      if (f.k === 'crack') { ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#4a3c44'; ctx.lineWidth = 1; let x = f.x, y = f.y; ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(f.x, f.y); const a = Math.PI + (i / 4) * Math.PI + Math.sin(f.seed + i) * .3, r = 10 + 8 * Math.abs(Math.sin(f.seed * 3 + i)); ctx.lineTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * .25 + 2); } ctx.stroke(); ctx.restore(); }
      else if (f.k === 'spill') { const fr = coinFrames[Math.floor(t * 14 + f.sp * 3) % 16]; if (fr) { const s2 = fr.width / KR * .85; ctx.drawImage(fr, f.x - s2 / 2, f.y - s2, s2, s2); } }
      else if (f.k === 'chunk') { ctx.save(); ctx.translate(f.x, f.y - f.h / 2); ctx.rotate(f.a); ctx.globalAlpha = Math.min(1, (1 - k) * 3); ctx.fillStyle = f.c; ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .6; ctx.strokeRect(-f.w / 2, -f.h / 2, f.w, f.h); ctx.restore(); }
      else if (f.k === 'feather') { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#eef0f4'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 1.4, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = .4; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke(); ctx.restore(); }
      else if (f.k === 'ring') { ctx.strokeStyle = `rgba(${f.col},${(1 - k).toFixed(3)})`; ctx.lineWidth = 2.5 * (1 - k) + .5; ctx.beginPath(); ctx.ellipse(f.x, f.y, 10 + k * 60, 3 + k * 9, 0, 0, 7); ctx.stroke(); }
      else if (f.k === 'streak') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(0, f.y0, 0, hero.y); lg.addColorStop(0, 'rgba(125,255,160,0)'); lg.addColorStop(1, `rgba(125,255,160,${(.6 * (1 - k)).toFixed(3)})`); ctx.fillStyle = lg; ctx.fillRect(hero.x - 6, Math.min(f.y0, hero.y), 12, Math.abs(hero.y - f.y0)); ctx.restore(); } }); };
  P.drawTop = () => {
    P.fx.forEach(f => { const k = f.t / f.l;
      if (f.k === 'star') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; star(ctx, f.x, f.y, f.r * (1 - k * .5), 1 - k, f.col); ctx.restore(); }
      else if (f.k === 'plus') { ctx.save(); ctx.globalAlpha = Math.min(1, (1 - k) * 2); ctx.font = '700 9px Oswald, Mont, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(40,20,0,.8)'; const tx = '+' + f.n * nearMult; ctx.strokeText(tx, f.x, f.y); ctx.fillStyle = '#ffe27a'; ctx.fillText(tx, f.x, f.y); ctx.restore(); }
      else if (f.k === 'cstretch') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(f.x, f.y, 4 + k * 12, 0, 7); ctx.stroke(); ctx.restore(); } });
    if (state === 'play' && speed > 380) { const a = Math.min(.35, (speed - 380) / 900); ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.lineWidth = 1; for (let i = 0; i < 8; i++) { const y = ((i * 97 + Math.floor(t * 30) * 53) % (VH - 40)) + 20, x = W - ((t * 900 + i * 180) % (W * .6)), L = 30 + (i % 3) * 20; if (x > W * .55 || x < W * .1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y); ctx.stroke(); } } ctx.restore(); } };
  // ---- background music: a light desi-flavoured beat that picks up with speed (Settings → Music slider) ----
  let mT = 0, mStep = 0, NB = null; const HIJ = [0, 1, 4, 5, 7, 8, 10, 12];
  P.music = () => { if (!AC || !sndOn || !MIX || !MIX.music || state !== 'play' || paused || (VOL.music || 0) <= 0) { mT = 0; return; } const now = AC.currentTime; if (mT < now) mT = now + .05;
    if (!NB) { NB = AC.createBuffer(1, AC.sampleRate * .5, AC.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const bpm = 98 + Math.min(32, Math.max(0, speed - 200) / 25), st = 60 / bpm / 4;
    while (mT < now + .2) { const s = mStep % 16, bar = Math.floor(mStep / 16) % 4, at = mT, out = MIX.music;
      const osc = (type, f0, f1, dur, vol) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f0, at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, at + dur); g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(.0001, at + dur); o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + .02); };
      const nz = (fq, q, dur, vol, type) => { const n = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); n.buffer = NB; f.type = type || 'bandpass'; f.frequency.value = fq; f.Q.value = q; g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(.0001, at + dur); n.connect(f); f.connect(g); g.connect(out); n.start(at, Math.random() * .3); n.stop(at + dur + .02); };
      if (s === 0 || s === 6 || s === 8 || (s === 11 && bar % 2)) osc('sine', 120, 45, .22, .5);   // kick (dhol-ish pattern)
      if (s === 4 || s === 12) { nz(1800, .8, .14, .35); osc('triangle', 220, 180, .08, .12); }   // clap/snare
      if (s % 2 === 0) nz(8000, 1, .03, s % 4 === 2 ? .12 : .06, 'highpass');   // hats
      if (s === 2 || s === 10 || s === 14) osc('sine', 330, 260, .09, .1);   // tabla-ish tik
      const root = [62, 62, 60, 58][bar], bassN = [0, 0, 7, 0, 5, 5, 3, 0][s >> 1];
      if (s % 2 === 0) osc('triangle', 440 * Math.pow(2, (root - 69 - 12 + bassN) / 12), 0, st * 1.8, .16);   // bass
      if (bar === 3 && s % 2 === 0) osc('square', 440 * Math.pow(2, (62 - 69 + HIJ[(s >> 1) % 8]) / 12), 0, st * 1.6, .035);   // a little Hijaz riff every 4th bar
      mT += st; mStep++; } };
  return P; })();
window.__pol = POL;
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; shieldBtn(); dashBtn(); hornBtn(); batBtn(); SLOW = veh && veh.k === 'mech' && veh.su < 1.05 ? .12 : Math.min(1, SLOW + dt * 3); if (FM) { if (!paused) { FMS.step(dt); if (FM && FM.ph === 'out' && FM.back) update(dt); } FMS.frame(); requestAnimationFrame(frame); return; } if (REVEAL && !paused) { revealTick(dt); holding = false; } else if (!paused) { let k = 1; if (HITT > 0) { HITT -= dt; k = 0; } else if (SMT > 0) { SMT -= dt; k = .35; } update(dt * SLOW * k); } else holding = false; draw(); if (bakeQ.length) bakeOne(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
window.__jd = { zap: (x, y, len = 120, ang = Math.PI / 2) => obs.push({ type: 'zap', x, y, len, ang, spin: 0, seed: 1 }), horn: () => hornBlast(), get hornCD() { return hornCD; }, get fm() { return FM; }, get speed() { return speed; }, get coinList() { return coinList; }, get W() { return W; }, get gifts() { return gifts; }, get runT() { return runT; }, veh: k => startVehicle(k), laser: () => [CEIL + 40, (CEIL + FLOOR) / 2].forEach((y, i) => obs.push({ type: 'laser', x: W / 2, y, ph: 'in', pt: 0, slide: 0, d: i * .12 })), eidi: n => { eidi = n; }, kill: w => die(w), gift: (k, r, x, y) => gifts.push({ k, ride: r, x: x || W * .6, y: y || 200, b: 0 }), get state() { return state; }, start, hero, get obs() { return obs; }, spawnRocket: () => obs.push({ type: "rocket", x: W + 40, y: hero.y - 30, warn: 1.5, lock: 0, v: 0 }), setHold: v => holding = v, get dist() { return dist; }, mis: (s, c) => { RUN.steamed = s; coins = c; }, get npcs() { return npcs; }, boost: m => startBoost(m), get SHOP() { return SHOP; }, bc: (k, kd) => buildingCanvas(kd || "lm", k), carSprite: (k, ci, f) => carSprite(k, ci, f), queue: k => deck.unshift([k]), street: () => street, npc: x => spawnNpc(x), car: (x, k, l) => spawnCar(x, k, false, l), get STREET() { return STREET; } };
})();
