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
  if (Math.abs(k - KR) > .3) { KR = k; bCache.clear(); hazeCache.clear(); }
}

/* ---------------- assets ---------------- */
const img = src => { const i = new Image(); i.src = src; return i; };
const heroImg = img('art/hero4.png'), HX4 = 4;   // hero sheet upscaled 4x with Scale2x (rounder edges, still crisp)
const HERO_FR = ['run0_normal', 'run1_normal', 'run2_normal', 'run3_normal', 'run4_normal', 'run5_normal', 'fly0_effort', 'fly1_effort', 'fly2_effort', 'fly0_panic', 'fly1_panic', 'fly2_panic', 'glide0_normal', 'glide1_normal', 'land0_effort', 'glide0_ko', 'run0_happy', 'run0_blink'];
const FR = n => HERO_FR.indexOf(n);
const NPC_META = {"pc_m":{"w":95,"h":175,"n":11,"type":"walk","k":2},"pc_f":{"w":95,"h":149,"n":11,"type":"walk","k":2},"pcso":{"w":98,"h":147,"n":11,"type":"walk","k":2},"warden":{"w":98,"h":147,"n":11,"type":"walk","k":2},"fan_dad":{"w":87,"h":204,"n":11,"type":"walk","k":2},"fan_f":{"w":95,"h":136,"n":11,"type":"walk","k":2},"fan_kid":{"w":101,"h":147,"n":11,"type":"walk","k":2},"blonde":{"w":95,"h":139,"n":11,"type":"walk","k":2},"abaya":{"w":97,"h":139,"n":11,"type":"walk","k":2},"teen":{"w":95,"h":139,"n":11,"type":"walk","k":2},"aunty":{"w":95,"h":144,"n":11,"type":"walk","k":2},"uncle":{"w":95,"h":139,"n":11,"type":"walk","k":2},"nurse":{"w":95,"h":152,"n":11,"type":"walk","k":2},"elder":{"w":97,"h":144,"n":11,"type":"walk","k":2},"builder":{"w":97,"h":152,"n":11,"type":"walk","k":2},"rider":{"w":101,"h":134,"n":11,"type":"walk","k":2},"rider_g":{"w":107,"h":147,"n":11,"type":"walk","k":2},"rider_o":{"w":107,"h":147,"n":11,"type":"walk","k":2},"schoolboy":{"w":95,"h":134,"n":11,"type":"walk","k":2},"shop":{"w":95,"h":134,"n":11,"type":"walk","k":2},"lad":{"w":95,"h":134,"n":11,"type":"walk","k":2},"esc_a":{"w":108,"h":155,"n":5,"type":"esc","k":2},"esc_b":{"w":147,"h":163,"n":5,"type":"esc","k":2},"esc_c":{"w":147,"h":150,"n":5,"type":"esc","k":2},"esc_d":{"w":147,"h":155,"n":5,"type":"esc","k":2},"esc_e":{"w":108,"h":163,"n":5,"type":"esc","k":2}};   // sprite sheets: walkers = walk0-3, blink0-3, shock, cheer, dizzy; e-scooters = ride0-2, shock, cheer
const NPC_KEYS = Object.keys(NPC_META).filter(k => NPC_META[k].type === 'walk'), ESC_KEYS = Object.keys(NPC_META).filter(k => NPC_META[k].type === 'esc');
const npcImg = {}; Object.keys(NPC_META).forEach(k => npcImg[k] = img('art/npc_' + k + '.png?v=4'));

/* buildings: Flappy landmarks + house runs, drawn at KR px per unit, trimmed, cached (LRU) */
const M = 90, LH = 380;
const STREET = ['galaxy', 'townhall', 'masjid', 'chaiikhana', 'spudkingz', 'miamicrispy', 'barak', 'stmarys', 'hatfactory', 'chaiiwala', 'masjidali', 'suffa', 'nadeem', 'oak', 'periperi', 'toros', 'kahwa', 'topspizza', 'alquds', 'kaya', 'karwan', 'krispy', 'grandbazar', 'gna', 'cycleking', 'smr', 'currys', 'letters', 'gurdwara', 'ldh', 'frasers', 'station'];
const HOUSE_K = () => Object.keys(window.HOUSES || {});
const bCache = new Map(), hazeCache = new Map();
function buildingCanvas(kind, key) {
  const id = kind + ':' + key; if (bCache.has(id)) { const v = bCache.get(id); bCache.delete(id); bCache.set(id, v); return v; }
  let w, draw;
  if (kind === 'lm') { const L = LANDMARKS[key]; if (!L) return null; w = L.w; draw = o => L.d(o, M, LH - 6); }
  else { const Hh = HOUSES[key]; if (!Hh) return null; w = Math.round(Hh.w * 1.35); draw = o => window.drawScaled(o, Hh.d.bind(Hh), M, LH - 6, 1.35); }
  const c = document.createElement('canvas'); c.width = Math.ceil((w + 2 * M) * KR); c.height = Math.ceil(LH * KR);
  const o = c.getContext('2d'); o.imageSmoothingEnabled = false; o.scale(KR, KR);
  try { draw(o); } catch (e) { console.warn(key, e); }
  // trim empty space so drawing stays cheap
  const d = o.getImageData(0, 0, c.width, c.height).data; let top = c.height, l = c.width, r = 0;
  for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (d[(y * c.width + x) * 4 + 3] > 8) { if (y < top) top = y; if (x < l) l = x; if (x > r) r = x; }
  const t = document.createElement('canvas'); t.width = Math.max(1, r - l + 2); t.height = Math.max(1, c.height - top);
  t.getContext('2d').drawImage(c, -l, -top);
  const v = { c: t, ox: l / KR - M, w, top: top / KR - (LH - 6), h: (c.height - top) / KR };   // ox: x offset of trimmed image vs building x; top: y vs ground (negative)
  bCache.set(id, v); while (bCache.size > 14) bCache.delete(bCache.keys().next().value);
  return v;
}
function hazed(id, v) {   // pale, sunset-tinted copy for the far skyline
  if (hazeCache.has(id)) return hazeCache.get(id);
  const c = document.createElement('canvas'); c.width = v.c.width; c.height = v.c.height; const o = c.getContext('2d');
  o.drawImage(v.c, 0, 0); o.globalCompositeOperation = 'source-atop'; o.fillStyle = 'rgba(204,128,150,.72)'; o.fillRect(0, 0, c.width, c.height);
  hazeCache.set(id, c); while (hazeCache.size > 10) hazeCache.delete(hazeCache.keys().next().value); return c;
}

/* vehicles, rendered at KR, both directions */
const CAR_KEYS = ['golf', 'a45', 'rs3', 'taxi', 'van', 'smallvan', 'bus', 'police', 'gwagon', 'c63', 'pickup', 'moped', 'bike', 'coach', 'binlorry', 'ambulance'];
const carCache = new Map();
function carSprite(k, ci, flip) {
  const id = k + ci + flip + '@' + KR; if (carCache.has(id)) return carCache.get(id);
  const V = VEHICLES[k]; const col = V.colours[ci % V.colours.length]; const SC = 1.6, k2 = KR * SC;
  const c = document.createElement('canvas'); c.width = Math.ceil((V.w + 6) * k2); c.height = Math.ceil(90 * k2); const o = c.getContext('2d');
  o.scale(k2, k2); try { V.d(o, 3, 86, col); } catch (e) {}
  let out = c;
  if (flip) { const f = document.createElement('canvas'); f.width = c.width; f.height = c.height; const g = f.getContext('2d'); g.translate(f.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
    if (V.fixMirror) { g.scale(k2, k2); try { V.fixMirror(g, 3, 86, f.width / k2); } catch (e) {} } out = f; }
  const v = { c: out, w: (V.w + 6) * SC, h: 90 * SC, gy: 86 * SC, sp: V.speed };
  carCache.set(id, v); if (carCache.size > 40) carCache.delete(carCache.keys().next().value); return v;
}

/* £1 coin: gold 12-sided with a silver centre, pre-drawn at a few spin widths */
const COIN_R = 9; let coinFrames = [], coinK = 0;
function makeCoins() {
  coinK = KR; coinFrames = [];
  for (let f = 0; f < 8; f++) {
    const sx = Math.max(.12, Math.abs(Math.cos(f / 8 * Math.PI))), R = COIN_R * KR, c = document.createElement('canvas'); c.width = c.height = Math.ceil(R * 2 + 6); const o = c.getContext('2d');
    o.translate(c.width / 2, c.height / 2); o.scale(sx, 1);
    const poly = (r, col) => { o.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .26; o.lineTo(Math.cos(a) * r, Math.sin(a) * r); } o.closePath(); o.fillStyle = col; o.fill(); };
    poly(R + 1.5 * KR / 2, '#6b4a12'); const g = o.createLinearGradient(-R, -R, R, R); g.addColorStop(0, '#fff1a8'); g.addColorStop(.45, '#f0c23a'); g.addColorStop(1, '#a8761a'); poly(R, g);
    const g2 = o.createLinearGradient(-R, -R, R, R); g2.addColorStop(0, '#ffffff'); g2.addColorStop(.5, '#c9ced8'); g2.addColorStop(1, '#8a909c'); poly(R * .62, g2);
    if (sx > .5) { o.fillStyle = '#6b4a12'; o.font = `700 ${R * .8}px Silk`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText('£1', 0, R * .06); }
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

/* ---------------- game state ---------------- */
let state = 'menu', t = 0, dist = 0, speed = 0, coins = 0, best = +(localStorage.getItem('jd_best') || 0);
const hero = { x: 0, y: FLOOR, vy: 0, thrust: false, ground: true, landT: 0, rot: 0, run: 0, dead: false, vx: 0, bounce: 0, blink: 0 };
let holding = false;
let street = [], skyline = [], cars = [], npcs = [], obs = [], coinList = [], steam = [], sparks = [], stars = [];
let nextObs = 0, nextNpc = 0, nextCar = 0, panicT = 0, deadT = 0;
let flashT = 0, flashCol = '#fff', shake = 0, banner = null, rings = [], veh = null, inv = 0, gifts = [], nextGift = 0, nextEidi = 0, eidi = 0, pops = [], dust = [], revived = 0;
const stats = { steamed: 0, dodged: 0, missed: 0 };

function seedStars() { stars = []; for (let i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random() * .55, r: Math.random() < .2 ? 1.2 : .7, p: Math.random() * 6 }); }
function reset() {
  t = 0; dist = 0; speed = 0; coins = 0; obs = []; coinList = []; steam = []; sparks = []; panicT = 0; deadT = 0;
  flashT = 0; shake = 0; banner = null; rings = []; veh = null; inv = 0; gifts = []; eidi = 0; pops = []; dust = []; revived = 0; nextGift = 2200; nextEidi = 1600; stats.steamed = stats.dodged = stats.missed = 0;
  Object.assign(hero, { x: -40, y: FLOOR, vy: 0, thrust: false, ground: true, landT: 0, rot: 0, run: 0, dead: false, vx: 0, bounce: 0 });
  nextObs = 380; nextNpc = 0; nextCar = 0;
  if (!street.length) fillStreet(); if (!skyline.length) fillSkyline();
  if (!cars.length) for (let i = 0; i < 4; i++) spawnCar(Math.random() * W);
  if (!npcs.length) for (let i = 0; i < 5; i++) spawnNpc(60 + Math.random() * (W - 60));
}

/* street: a landmark, then 1–3 houses, then a landmark… (no repeats close together) */
let lastLm = [];
function nextBuilding() {
  const prev = street[street.length - 1]; const x = prev ? prev.x + prev.w + (prev.gap || 0) : -60;
  const wantLm = !prev || prev.kind === 'hs' && (prev.run || 0) >= 1 + (Math.random() * 2 | 0);
  if (wantLm) { let k; const others = MOSQUE_K.filter(m => m !== myMosque && !lastLm.slice(-4).includes(m));
    if (others.length && Math.random() < .3) k = others[Math.random() * others.length | 0];
    else do { k = STREET[Math.random() * STREET.length | 0]; } while (lastLm.includes(k) || !LANDMARKS[k] || k === myMosque); lastLm.push(k); if (lastLm.length > 10) lastLm.shift();
    street.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * BS, gap: 6 + Math.random() * 14 }); }
  else { const hk = HOUSE_K(); const k = hk[Math.random() * hk.length | 0]; street.push({ kind: 'hs', key: k, x, w: Math.round(HOUSES[k].w * 1.35) * BS, gap: 0, run: prev && prev.kind === 'hs' ? (prev.run || 1) + 1 : 1 }); }
}
function fillStreet() { while (!street.length || street[street.length - 1].x < W + 600) { nextBuilding(); const b = street[street.length - 1]; setTimeout(() => buildingCanvas(b.kind, b.key), 0); } }   // built ~1.5 screens ahead so there's no hitch
function fillSkyline() { let x = skyline.length ? skyline[skyline.length - 1].x + skyline[skyline.length - 1].w : -100; while (x < W * 2.2) { const k = STREET[Math.random() * STREET.length | 0]; if (!LANDMARKS[k] || k === myMosque) continue; skyline.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * .5 }); x += LANDMARKS[k].w * .5 - 16; } }

function spawnCar(x) {
  const k = CAR_KEYS[Math.random() * CAR_KEYS.length | 0]; if (!VEHICLES[k]) return;
  const far = Math.random() < .5, V = VEHICLES[k];
  const v = (V.speed ? (V.speed[0] + Math.random() * (V.speed[1] - V.speed[0])) : 30) * 2.2;
  cars.push({ k, ci: Math.random() * 10 | 0, far, x: x !== undefined ? x : (far ? W + 30 : -160), v: far ? -v : v });
}
function spawnNpc(x) {
  const esc = Math.random() < .16, k = esc ? ESC_KEYS[Math.random() * ESC_KEYS.length | 0] : NPC_KEYS[Math.random() * NPC_KEYS.length | 0];
  const dir = Math.random() < .5 ? -1 : 1;
  npcs.push({ k, esc, x: x !== undefined ? x : (dir > 0 && esc ? -90 : W + 60), y: PAVE_T + 16 + Math.random() * 22, dir, v: esc ? 70 + Math.random() * 50 : 16 + Math.random() * 14,
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
function heroCircles() { const x = hero.x, y = hero.y, k = HS; if (veh) return vehCircles(); return [[x + 2 * k, y - 21 * k, 6.5 * k], [x + 5 * k, y - 39 * k, 6 * k]]; }
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let k = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; k = Math.max(0, Math.min(1, k)); const qx = ax + dx * k - px, qy = ay + dy * k - py; return Math.sqrt(qx * qx + qy * qy); }

function die(why) {
  if (hero.dead || inv > 0) return;
  if (veh) { vehCrash(); return; }
  hero.dead = true; hero.vx = speed; hero.vy = 0; hero.bounce = 0; hero.slide = 0; hero.restT = 0; deadT = 0; state = 'dead'; holding = false;
  hero.shockT = why === 'rocket' ? 0 : .5; if (why === 'rocket') hero.vy = -260; flashT = .18; flashCol = why === 'rocket' ? '255,170,60' : why === 'laser' ? '255,90,90' : '255,246,160'; shake = .35;
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
  else if (state === 'play') speed = Math.min(300, 150 + dist * .012);
  else if (state === 'dead') speed = hero.shockT > 0 ? speed * Math.pow(.25, dt) : Math.max(0, speed - (hero.slide ? 75 : 30) * dt);
  else if (state === 'menu') speed = 55;
  const dx = speed * dt; if (state !== 'menu') dist += dx;

  // scroll the world
  street.forEach(b => { b.x -= dx; if (!b.past && b.kind === 'lm' && MOSQUE_K.includes(b.key) && b.x + b.w < hero.x && state === 'play') { b.past = 1; passed++; } }); while (street.length && street[0].x + street[0].w + 40 < -20) street.shift(); fillStreet();
  skyline.forEach(b => b.x -= dx * .32); while (skyline.length && skyline[0].x + skyline[0].w < -50) skyline.shift(); fillSkyline();
  cars.forEach(c => c.x += c.v * dt - dx * .92); cars = cars.filter(c => c.x > -260 && c.x < W + 300);
  if ((nextCar -= dt) <= 0) { spawnCar(); nextCar = 1.2 + Math.random() * 2.6; }

  // people on the front pavement
  npcs.forEach(p => {
    if (p.flee > 0) { p.flee -= dt; p.idle = 3; }
    const busy = (p.react > 0 || p.fall > 0 || p.moodT > 0 || p.idle < 0) && !(p.flee > 0);
    const mv = p.fall > 0 ? 0 : p.esc ? 1 : p.flee > 0 ? 3.4 : busy ? (p.mood === 'cheer' ? .3 : .1) : 1;
    p.x += p.dir * p.v * mv * dt - dx; if (!busy || p.esc) p.ph += dt * (p.esc ? 14 : p.v * .32 * (p.flee > 0 ? 3 : 1));
    p.blink -= dt; if (p.blink < -.13) p.blink = 1.5 + Math.random() * 4;
    if (!p.esc) { p.idle -= dt; if (p.idle < -1.6) p.idle = 4 + Math.random() * 8; }   // now and then stop and look round
    if (p.react > 0) p.react -= dt; if (p.moodT > 0) p.moodT -= dt; if (p.hop > 0) p.hop = Math.max(0, p.hop - dt * 2.6);
    if (p.fall > 0) { p.fall -= dt; }
    if (state === 'menu' || p.fall > 0) return;
    const ddx = hero.x - p.x, ad = Math.abs(ddx), up = FLOOR - hero.y;
    if (hero.dead) {   // he tumbles into people: they go over (cartoon), see stars, get back up
      if (!p.esc && ad < 26 && up < 40 && Math.abs(hero.vx) > 20 && !p.done) { p.fall = 1.9; p.fallDir = ddx > 0 ? -1 : 1; p.done = 1; SFX.thud(); }
      return;
    }
    if (state !== 'play') return;
    // the steam blast from the cooker knocks people over (Jetpack Joyride's bullets): only right under the nozzle, close to the ground
    if (hero.thrust && !veh && !p.esc && p.fall <= 0 && Math.abs(p.x - nozzle()[0] + 4) < 11 && FLOOR - hero.y < 210) {
      p.fall = 1.5; p.fallDir = Math.random() < .5 ? -1 : 1; p.done = 1; stats.steamed++; tone(220, .12, 'triangle', .07, .6);
      for (let i = 0; i < 8; i++) steam.push({ x: p.x + (Math.random() - .5) * 14, y: p.y - Math.random() * 24, vx: (Math.random() - .5) * 90, vy: -Math.random() * 40, r: 3 + Math.random() * 3, l: .5, l0: .7 });
      return;
    }
    if (p.flee > 0) return;
    if (!p.done && hero.ground && ddx < 0 && ad < 70) { p.done = 1; p.react = .7; p.hop = 1; p.hopH = 24; p.look = -1; }          // jump out of his way
    else if (!p.done && ad < 80 && up < 130) { p.done = 1; p.react = 1.1; p.hop = 1; p.hopH = 9; p.look = ddx > 0 ? 1 : -1; }    // he whooshes past low: shocked
    else if (!p.done && ad < 60 && up >= 130) { const fan = /fan/.test(p.k);                                                       // he flies over high
      if (fan || Math.random() < .45) { p.done = 1; p.mood = 'cheer'; p.moodT = 1.3; p.look = ddx > 0 ? 1 : -1; p.hop = 1; p.hopH = 6; } else p.done = 1; }
    if (p.done && ad > 160) p.done = 0;
  });
  npcs = npcs.filter(p => p.x > -140 && p.x < W + 160);
  if ((nextNpc -= dt) <= 0) { spawnNpc(); nextNpc = .9 + Math.random() * 2.2; }

  // hero
  if (state === 'intro') { hero.x += (W * .28 - hero.x) * Math.min(1, dt * 2.2) + 30 * dt; if (hero.x >= W * .28 - 2) { hero.x = W * .28; state = 'play'; } }
  if (inv > 0) inv -= dt;
  if (playing && !hero.dead && veh) vehUpdate(dt);
  else if (playing && !hero.dead) {
    hero.thrust = holding && state === 'play';
    if (hero.thrust) { if (!hero.wasThrust) { hero.vy = Math.min(hero.vy, -90); for (let i = 0; i < 8; i++) { const nz = nozzle(); steam.push({ x: nz[0], y: nz[1], vx: -speed * .3 - 40 - Math.random() * 60, vy: 120 + Math.random() * 120, r: 3 + Math.random() * 2.5, l: .45, l0: .6 }); } } hero.vy -= 1900 * dt; hero.ground = false; if (hissG && sndOn) hissG.gain.setTargetAtTime(.05, AC.currentTime, .03); }
    else if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
    hero.wasThrust = hero.thrust; hero.vy += 820 * dt; hero.vy = Math.max(-300, Math.min(420, hero.vy)); hero.y += hero.vy * dt;
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
      if (!hero.slide) hero.rot += dt * 10;
      if (hero.y >= FLOOR + 4) { hero.y = FLOOR + 4;
        if (hero.bounce < 2 && hero.vy > 90) { hero.vy = -hero.vy * .38; hero.bounce++; SFX.thud(); shake = .15; for (let i = 0; i < 8; i++) dust.push({ x: hero.x + (Math.random() - .5) * 24, y: FLOOR + 2, vx: (Math.random() - .5) * 140, vy: -Math.random() * 50, r: 2.5, l: .5 }); }
        else { hero.vy = 0; hero.slide = 1; hero.rot += (Math.PI / 2 - hero.rot % (Math.PI * 2)) * Math.min(1, dt * 14);   // face down, head first
          if (speed > 8 && Math.random() < .8) dust.push({ x: hero.x - 12 + (Math.random() - .5) * 10, y: FLOOR + 3, vx: -speed * .3 - Math.random() * 40, vy: -Math.random() * 25, r: 1.8 + Math.random() * 1.5, l: .55 }); } }
    }
    if (hero.slide && speed <= 2) { hero.restT = (hero.restT || 0) + dt; if (hero.restT > .7 && $('over').classList.contains('hide') && $('eidiBox').classList.contains('hide')) endRun(); }
  }

  // obstacles
  if (state === 'play') { nextObs -= dx; if (nextObs <= 0) nextObs = spawnPattern(); }
  panicT = Math.max(0, panicT - dt);
  obs.forEach(o => {
    if (o.type === 'zap') { o.x -= dx; if (o.spin) o.ang += o.spin * dt; if (!o.passed && o.x + o.len / 2 < hero.x - 20 && !hero.dead) { o.passed = 1; stats.dodged++; } }
    if (o.type === 'laser') { if (o.d > 0) { o.d -= dt; return; } o.pt += dt;
      if (o.ph === 'in') { o.slide = Math.min(1, o.pt / .4); if (o.pt > .4) { o.ph = 'warn'; o.pt = 0; } }
      else if (o.ph === 'warn') { if ((o.pt * 5 | 0) !== ((o.pt - dt) * 5 | 0)) tone(1200, .05, 'square', .03); if (o.pt > 1.45) { o.ph = 'fire'; o.pt = 0; tone(140, 1, 'sawtooth', .07, .9); shake = Math.max(shake, .1); } }
      else if (o.ph === 'fire') { if (o.pt > 1.15) { o.ph = 'out'; o.pt = 0; if (!hero.dead) stats.dodged++; } }
      else if (o.ph === 'out') { o.slide = 1 - Math.min(1, o.pt / .4); if (o.pt > .4) o.x = -999; } }
    if (o.type === 'rocket') {
      if (o.warn > 0) { o.warn -= dt; o.y += (hero.y - 30 - o.y) * Math.min(1, dt * 3); panicT = .3; if ((o.warn * 6 | 0) !== ((o.warn + dt) * 6 | 0)) SFX.warn(); if (o.warn <= 0) { o.lock = .45; } }
      else if (o.lock > 0) { o.lock -= dt; panicT = .3; if (o.lock <= 0) { o.v = speed + 360; SFX.whoosh(); } }
      else { o.x -= o.v * dt; if (Math.random() < .9) sparks.push({ x: o.x + 14, y: o.y + (Math.random() - .5) * 3, vx: 60 + Math.random() * 60, vy: (Math.random() - .5) * 40, l: .35, c: Math.random() < .5 ? '#ffd75a' : '#ff7a3a' }); }
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
  coinList.forEach(c => { c.x -= dx; if (!c.got && !hero.dead && state === 'play') { const hc = heroCircles(); if (hc.some(([x, y, r]) => Math.hypot(x - c.x, y - c.y) < r + COIN_R + 2)) { c.got = 1; coins++; SFX.coin(); for (let i = 0; i < 5; i++) sparks.push({ x: c.x, y: c.y, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, l: .3, c: '#fff3b0' }); } } });
  coinList.forEach(c => { if (!c.got && c.x < -18 && !c.m) { c.m = 1; stats.missed++; } });
  coinList = coinList.filter(c => c.x > -20 && !c.got);
  // particles
  steam.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= Math.pow(.25, dt); p.vx *= Math.pow(.6, dt); p.r += dt * 16; p.l -= dt; if (p.y > FLOOR + 4) { p.y = FLOOR + 4; p.vy = -p.vy * .2; p.vx -= 40 * dt * 10; } });
  steam = steam.filter(p => p.l > 0);
  sparks.forEach(p => { p.x += p.vx * dt - dx * .3; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt; }); sparks = sparks.filter(p => p.l > 0);
  if (state === 'play' || state === 'dead') { $('dist').textContent = Math.floor(dist / 10) + 'm'; $('coins').textContent = '£' + coins; }
}
function nozzle() { const c = Math.cos(hero.rot), s = Math.sin(hero.rot), lx = -14 * HS, ly = -16 * HS; return [hero.x + lx * c - ly * s, hero.y + lx * s + ly * c]; }


/* ================= Jetpack Joyride systems, our way ================= */
/* gift box (= their vehicle token): rainbow box with a ?, gives a ride. Eidi envelopes (= spin tokens): opened at the end of a run. */
function giftsUpdate(dt, dx) {
  if (state === 'play' && !veh) { nextGift -= dx; if (nextGift <= 0) { gifts.push({ k: 'box', x: W + 30, y: CEIL + 70 + Math.random() * (FLOOR - CEIL - 160), b: Math.random() * 6 }); nextGift = 2600 + Math.random() * 1800; } }
  if (state === 'play') { nextEidi -= dx; if (nextEidi <= 0) { gifts.push({ k: 'eidi', x: W + 30, y: CEIL + 50 + Math.random() * (FLOOR - CEIL - 120), b: Math.random() * 6 }); nextEidi = 2200 + Math.random() * 2400; } }
  gifts.forEach(gf => { gf.x -= dx; gf.b += dt;
    if (!gf.got && !hero.dead && state === 'play' && heroCircles().some(([x, y, r]) => Math.hypot(x - gf.x, y - gf.y) < r + 13)) {
      gf.got = 1;
      if (gf.k === 'box') startVehicle(Math.random() < .5 ? 'tuktuk' : 'carpet');
      else { eidi++; pops.push({ x: gf.x, y: gf.y - 12, txt: 'EIDI!', col: '#7dffa0', t: 0 }); tone(988, .1, 'square', .05); setTimeout(() => tone(1318, .16, 'square', .05), 90); for (let i = 0; i < 10; i++) sparks.push({ x: gf.x, y: gf.y, vx: (Math.random() - .5) * 140, vy: (Math.random() - .5) * 140, l: .4, c: i % 2 ? '#ffd75a' : '#7dffa0' }); }
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
const VEH_NAME = { tuktuk: 'TUK-TUK', carpet: 'MAGIC CARPET' };
function startVehicle(k) {
  veh = { k, t: 0, vy: 0, jumps: 0, held: false, wob: 0 }; hero.thrust = false;
  banner = { k, t: 0 }; rings.push({ x: hero.x, y: hero.y - 30, t: 0 }); flashT = .12; flashCol = '255,255,255';
  tone(523, .1, 'square', .06); setTimeout(() => tone(659, .1, 'square', .06), 90); setTimeout(() => tone(784, .2, 'square', .06), 180);
}
function vehCircles() { const x = hero.x, y = hero.y; return veh.k === 'tuktuk' ? [[x - 4, y - 22, 18], [x + 16, y - 16, 12], [x - 2, y - 48, 12]] : [[x, y - 8, 16], [x + 4, y - 36, 12]]; }
function vehUpdate(dt) {
  veh.t += dt; hero.run += dt * (6 + speed / 22); if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
  if (veh.k === 'tuktuk') {
    const press = holding && !veh.held; veh.held = holding;
    if (press && hero.y >= FLOOR - .5) { hero.vy = -520; tone(330, .12, 'triangle', .07, 1.6); for (let i = 0; i < 6; i++) dust.push({ x: hero.x - 20 + Math.random() * 30, y: FLOOR, vx: -60 - Math.random() * 80, vy: -Math.random() * 30, r: 2.5, l: .5 }); }
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
  const cols = k === 'tuktuk' ? ['#2e9e4f', '#ffd21f', '#1a1a1a', '#c9ced8'] : ['#b3202e', '#ffd75a', '#7a1020', '#ffe9a8'];
  for (let i = 0; i < 26; i++) sparks.push({ x: hero.x + (Math.random() - .5) * 50, y: hero.y - 20 + (Math.random() - .5) * 30, vx: (Math.random() - .4) * 300, vy: -Math.random() * 280, l: .9 + Math.random() * .5, c: cols[i % 4] });
  for (let i = 0; i < 12; i++) steam.push({ x: hero.x + (Math.random() - .5) * 40, y: hero.y - 20, vx: (Math.random() - .5) * 120, vy: -Math.random() * 80, r: 5 + Math.random() * 4, l: .7, l0: .9 });
  pops.push({ x: hero.x, y: hero.y - 70, txt: k === 'tuktuk' ? 'TUK-TUK GONE!' : 'CARPET GONE!', col: '#ffd75a', t: 0 });
}
function drawVehicle() {
  const x = hero.x, y = hero.y, k = veh.k;
  ctx.save(); ctx.translate(x, y); ctx.rotate(hero.rot);
  if (k === 'tuktuk') {
    const bob = hero.y >= FLOOR - .5 ? Math.sin(hero.run * 2.2) * .8 : 0; ctx.translate(0, bob);
    ctx.fillStyle = 'rgba(30,10,30,.28)'; ctx.beginPath(); ctx.ellipse(0, (FLOOR - y) + 1 - bob, 40, 4, 0, 0, 7); ctx.fill();
    const wheel = (wx, r) => { ctx.fillStyle = '#141418'; ctx.beginPath(); ctx.arc(wx, -r, r, 0, 7); ctx.fill(); ctx.fillStyle = '#9aa0ae'; ctx.beginPath(); ctx.arc(wx, -r, r * .5, 0, 7); ctx.fill();
      ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = 1.2; const a = hero.run * 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(wx, -r); ctx.lineTo(wx + Math.cos(a + i * 2.1) * r * .5, -r + Math.sin(a + i * 2.1) * r * .5); ctx.stroke(); } };
    wheel(-24, 8);
    // passenger cab body (green, yellow canopy, black frame), driver = our hero
    ctx.fillStyle = '#1a1024'; roundRect(-38, -40, 64, 34, 7); ctx.fill();
    const body = ctx.createLinearGradient(0, -38, 0, -8); body.addColorStop(0, '#3bbf63'); body.addColorStop(1, '#1f7f3e'); ctx.fillStyle = body; roundRect(-36, -38, 60, 30, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; roundRect(-33, -36, 54, 6, 3); ctx.fill();
    ctx.fillStyle = '#ffd21f'; ctx.fillRect(-36, -18, 60, 3.5); ctx.fillStyle = '#1a1024'; ctx.fillRect(-36, -14.5, 60, 1);
    // hero sitting in the cab (top half shows)
    ctx.save(); ctx.beginPath(); ctx.rect(-40, -110, 80, 82); ctx.clip();
    ctx.drawImage(heroImg, FR('run0_happy') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2 + 2, -HH - 14, HW * HS, HH); ctx.restore();
    // canopy roof on poles
    ctx.fillStyle = '#1a1024'; ctx.fillRect(-33, -78, 3, 40); ctx.fillRect(14, -76, 3, 38);
    ctx.fillStyle = '#1a1024'; roundRect(-42, -90, 66, 16, 7); ctx.fill(); const roof = ctx.createLinearGradient(0, -88, 0, -76); roof.addColorStop(0, '#ffe25a'); roof.addColorStop(1, '#e0a812'); ctx.fillStyle = roof; roundRect(-40, -88, 62, 12, 6); ctx.fill();
    ctx.fillStyle = '#1a1024'; for (let i = 0; i < 6; i++) ctx.fillRect(-36 + i * 10, -77, 4, 2);
    // front: windscreen, nose, headlight, front wheel
    ctx.fillStyle = '#1a1024'; ctx.beginPath(); ctx.moveTo(20, -74); ctx.lineTo(30, -40); ctx.lineTo(36, -16); ctx.lineTo(36, -8); ctx.lineTo(20, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2aa356'; ctx.beginPath(); ctx.moveTo(22, -42); ctx.lineTo(29, -42); ctx.lineTo(34, -17); ctx.lineTo(34, -10); ctx.lineTo(22, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(190,230,255,.55)'; ctx.beginPath(); ctx.moveTo(21, -72); ctx.lineTo(28, -44); ctx.lineTo(22, -44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(33, -30, 3, 0, 7); ctx.fill();
    wheel(26, 7.5);
    ctx.fillStyle = '#1a1024'; ctx.font = '700 7px Silk'; ctx.textAlign = 'center'; ctx.fillText('LUTON', -8, -22);
  } else {
    const W2 = 46, n = 14;
    ctx.fillStyle = 'rgba(30,10,30,.18)'; ctx.beginPath(); ctx.ellipse(0, (FLOOR - y), 34, 3, 0, 0, 7); ctx.fill();
    const wave = i => Math.sin(t * 7 - i * .7) * 3.2;
    // hero sitting on it
    ctx.drawImage(heroImg, FR('glide0_normal') * HW * HX4, 0, HW * HX4, HH0 * HX4, -HW * HS / 2, -HH + 8 + wave(n / 2), HW * HS, HH);
    const pts = []; for (let i = 0; i <= n; i++) pts.push([-W2 + i * (W2 * 2 / n), wave(i)]);
    ctx.beginPath(); pts.forEach(([px2, py], i) => i ? ctx.lineTo(px2, py - 3) : ctx.moveTo(px2, py - 3)); for (let i = n; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 5); ctx.closePath();
    ctx.fillStyle = '#5a0f1c'; ctx.lineWidth = 3; ctx.strokeStyle = '#1a1024'; ctx.stroke(); ctx.fill();
    ctx.beginPath(); pts.forEach(([px2, py], i) => i ? ctx.lineTo(px2, py - 2) : ctx.moveTo(px2, py - 2)); for (let i = n; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 4); ctx.closePath(); ctx.fillStyle = '#b3202e'; ctx.fill();
    ctx.strokeStyle = '#ffd75a'; ctx.lineWidth = .9; ctx.beginPath(); pts.forEach(([px2, py], i) => i ? ctx.lineTo(px2, py - .6) : ctx.moveTo(px2, py - .6)); ctx.stroke();
    ctx.beginPath(); pts.forEach(([px2, py], i) => i ? ctx.lineTo(px2, py + 2.6) : ctx.moveTo(px2, py + 2.6)); ctx.stroke();
    ctx.fillStyle = '#ffd75a'; for (let i = 1; i < n; i += 2) { const [px2, py] = pts[i]; ctx.beginPath(); ctx.moveTo(px2, py - .2); ctx.lineTo(px2 + 2, py + 1); ctx.lineTo(px2, py + 2.2); ctx.lineTo(px2 - 2, py + 1); ctx.closePath(); ctx.fill(); }
    [[0, -1], [n, 1]].forEach(([i, s]) => { const [px2, py] = pts[i]; ctx.strokeStyle = '#ffd75a'; ctx.lineWidth = 1; for (let j = -1; j <= 3; j += 2) { ctx.beginPath(); ctx.moveTo(px2, py + j); ctx.lineTo(px2 + s * 5, py + j + Math.sin(t * 9 + j) * 1.5); ctx.stroke(); } });
  }
  ctx.restore();
}
function drawBanner() {   // their vehicle title card: a glowing band across the screen with the ride's name
  const k = banner.t, a = k < .2 ? k / .2 : k > 1.5 ? Math.max(0, (1.8 - k) / .3) : 1, y = VH * .42, h = 46;
  ctx.globalAlpha = a; const g2 = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g2.addColorStop(0, 'rgba(255,120,60,0)'); g2.addColorStop(.25, 'rgba(255,90,70,.85)'); g2.addColorStop(.5, 'rgba(255,200,150,.95)'); g2.addColorStop(.75, 'rgba(255,90,70,.85)'); g2.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, y - h / 2, W, h);
  const sx = (1 - Math.min(1, k / .25)) * W * .6;
  ctx.font = '22px PS'; ctx.textAlign = 'left'; ctx.fillStyle = '#160c28'; ctx.fillText(VEH_NAME[banner.k], W * .45 + sx + 2, y + 10); ctx.fillStyle = '#fff'; ctx.fillText(VEH_NAME[banner.k], W * .45 + sx, y + 8);
  ctx.globalAlpha = 1;
}
function drawLaser(o) {   // speed-camera emitters both sides; thin flickering warning line, then a thick red beam
  if (o.d > 0) return;
  const e = (1 - o.slide) * 40, lx = 10 - e, rx = W - 10 + e, y = o.y;
  if (o.ph === 'warn') { const f = .35 + .35 * Math.abs(Math.sin(o.pt * 18)); ctx.strokeStyle = `rgba(255,60,60,${f})`; ctx.lineWidth = 1; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(lx + 10, y); ctx.lineTo(rx - 10, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255,80,80,${f})`; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(lx + 12 + Math.random() * 6, y + (Math.random() - .5) * 4, 1.4, 0, 7); ctx.arc(rx - 12 - Math.random() * 6, y + (Math.random() - .5) * 4, 1.4, 0, 7); ctx.fill(); } }
  if (o.ph === 'fire') { const p = Math.min(1, o.pt / .08), th = 4 + Math.sin(t * 40) * .8;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,40,40,${.25 * p})`; ctx.fillRect(lx, y - 13, rx - lx, 26); ctx.fillStyle = `rgba(255,70,60,${.55 * p})`; ctx.fillRect(lx, y - th * 1.6, rx - lx, th * 3.2);
    ctx.fillStyle = `rgba(255,220,220,${.95 * p})`; ctx.fillRect(lx, y - th * .45, rx - lx, th * .9); ctx.restore();
    if (Math.random() < .5) sparks.push({ x: lx + 12, y, vx: 40 + Math.random() * 60, vy: (Math.random() - .5) * 60, l: .25, c: '#ffb0a0' }); }
  [[lx, 1], [rx, -1]].forEach(([x, s]) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, 1);
    ctx.fillStyle = '#1a1024'; roundRect(-12, -10, 22, 20, 4); ctx.fill(); const bx = ctx.createLinearGradient(0, -9, 0, 9); bx.addColorStop(0, '#ffe04a'); bx.addColorStop(1, '#d9a10f'); ctx.fillStyle = bx; roundRect(-11, -9, 20, 18, 3); ctx.fill();
    ctx.fillStyle = '#1a1024'; ctx.fillRect(-9, -6, 4, 12); ctx.fillStyle = '#2b2b33'; roundRect(4, -6, 8, 12, 2); ctx.fill();
    ctx.fillStyle = o.ph === 'fire' ? '#ffd0d0' : o.ph === 'warn' && Math.floor(t * 10) % 2 ? '#ff4a4a' : '#5a1a1a'; ctx.beginPath(); ctx.arc(9, 0, 3.4, 0, 7); ctx.fill(); ctx.restore(); });
}

/* end of a run: Eidi envelopes first (their Final Spin, without the slot machine), then the results */
function endRun() {
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
function revive() {   // second chance from the Eidi: he jumps back up and the run carries on
  $('eidiBox').classList.add('hide'); revived = 1; eidi = 0;
  hero.dead = false; hero.slide = 0; hero.rot = 0; hero.y = FLOOR; hero.vy = -560; hero.ground = false; inv = 2.4; state = 'play';
  obs = obs.filter(o => o.type !== 'rocket' && (o.type !== 'zap' || o.x > hero.x + 200)); rings.push({ x: hero.x, y: hero.y - 30, t: 0 }); flashT = .12; flashCol = '255,255,255';
}

/* ---------------- draw ---------------- */
let skyCv = null, vigCv = null;
function buildSky() {
  skyCv = document.createElement('canvas'); skyCv.width = cv.width; skyCv.height = cv.height; const o = skyCv.getContext('2d');
  const sky = o.createLinearGradient(0, 0, 0, cv.height);
  sky.addColorStop(0, '#1c1f52'); sky.addColorStop(.32, '#4a3684'); sky.addColorStop(.55, '#b85d8e'); sky.addColorStop(.68, '#f08c6e'); sky.addColorStop(.74, '#ffc27c'); sky.addColorStop(1, '#ffd49a');
  o.fillStyle = sky; o.fillRect(0, 0, cv.width, cv.height); o.scale(S, S);
  stars.forEach(s => { o.globalAlpha = .3 + .4 * Math.random(); o.fillStyle = '#fff7e6'; o.fillRect(s.x * W, s.y * VH, s.r, s.r); }); o.globalAlpha = 1;
  const sg = o.createRadialGradient(W * .78, G - 30, 4, W * .78, G - 30, 210); sg.addColorStop(0, 'rgba(255,236,190,.95)'); sg.addColorStop(.12, 'rgba(255,214,150,.55)'); sg.addColorStop(1, 'rgba(255,190,130,0)');
  o.fillStyle = sg; o.fillRect(0, 0, W, VH);
  vigCv = document.createElement('canvas'); vigCv.width = cv.width; vigCv.height = cv.height; const v = vigCv.getContext('2d');
  const vg = v.createRadialGradient(cv.width / 2, cv.height * .55, cv.height * .35, cv.width / 2, cv.height * .55, cv.width * .75);
  vg.addColorStop(0, 'rgba(10,6,24,0)'); vg.addColorStop(1, 'rgba(10,6,24,.42)'); v.fillStyle = vg; v.fillRect(0, 0, cv.width, cv.height);
}
function px(v) { return Math.round(v * S) / S; }
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (!skyCv || skyCv.width !== cv.width || skyCv.height !== cv.height) buildSky();
  ctx.drawImage(skyCv, 0, 0);
  const shx = shake > 0 ? (Math.random() - .5) * shake * 14 : 0, shy = shake > 0 ? (Math.random() - .5) * shake * 14 : 0;
  ctx.setTransform(S, 0, 0, S, shx * S, shy * S);
  // far hazy skyline (smaller, slower)
  const sk = .5;
  skyline.forEach(b => { const v = buildingCanvas(b.kind, b.key); if (!v) return; const h = hazed(b.kind + ':' + b.key + '@' + KR, v);
    ctx.drawImage(h, b.x + v.ox * sk, G - 8 + v.top * sk, v.c.width / KR * sk, v.c.height / KR * sk); });
  // main street buildings
  ctx.imageSmoothingEnabled = true;
  street.forEach(b => { if (b.x > W + 40 || b.x + b.w < -40) return; const v = buildingCanvas(b.kind, b.key); if (!v) return;
    ctx.drawImage(v.c, px(b.x + v.ox * BS), px(G + v.top * BS), v.c.width / KR * BS, v.c.height / KR * BS); });
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
  [true, false].forEach(far => cars.filter(c => c.far === far).forEach(c => { const sp = carSprite(c.k, c.ci, far); const gy = far ? ROAD_T + 19 : ROAD_B - 3;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(c.x + sp.w / 2, gy, sp.w * .46, 2.8, 0, 0, 7); ctx.fill();
    ctx.drawImage(sp.c, px(c.x), px(gy - sp.gy), sp.w, sp.h); }));
  // kerb + front pavement
  ctx.fillStyle = '#d4c8c2'; ctx.fillRect(0, ROAD_B, W, 4); ctx.fillStyle = '#8f8088'; ctx.fillRect(0, ROAD_B + 4, W, 2);
  const pg = ctx.createLinearGradient(0, PAVE_T - 2, 0, VH); pg.addColorStop(0, '#cbb8b0'); pg.addColorStop(1, '#a8949a'); ctx.fillStyle = pg; ctx.fillRect(0, ROAD_B + 6, W, VH - ROAD_B - 6);
  ctx.fillStyle = 'rgba(110,92,104,.55)'; const d3 = dist % 34;
  for (let r = 0; r < 4; r++) { const y = ROAD_B + 6 + r * 11; ctx.fillRect(0, y, W, .7); const o2 = r % 2 ? 17 : 0; for (let x = -d3 - o2; x < W; x += 34) ctx.fillRect(x, y, .7, 11); }
  ctx.fillStyle = 'rgba(16,8,38,.2)'; ctx.fillRect(0, 0, W, ROAD_B);   // knock the backdrop back a touch
  // coins
  if (coinK !== KR) makeCoins();
  coinList.forEach(c => { const f = coinFrames[Math.floor((t * 10 + c.x * .05)) % 8]; const s2 = f.width / KR; ctx.drawImage(f, c.x - s2 / 2, c.y - s2 / 2 + Math.sin(t * 4 + c.x * .1) * .8, s2, s2); });
  // obstacles
  obs.forEach(o => { if (o.type === 'zap') drawZap(o); else if (o.type === 'laser') drawLaser(o); else drawRocket(o); });
  gifts.forEach(drawGift);
  // people + hero, sorted by depth (feet y)
  const list = npcs.map(p => ({ y: p.y, f: () => drawNpc(p) })); list.push({ y: hero.dead ? FLOOR + 6 : (hero.ground ? FLOOR : FLOOR + 1), f: drawHero });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  dust.forEach(p => { ctx.globalAlpha = Math.max(0, p.l * 1.6) * .6; ctx.fillStyle = '#d8ccc6'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
  rings.forEach(r => { ctx.strokeStyle = `rgba(255,255,255,${.8 * (1 - r.t / .6)})`; ctx.lineWidth = 3 * (1 - r.t / .6) + .5; ctx.beginPath(); ctx.arc(r.x, r.y, 10 + r.t * 220, 0, 7); ctx.stroke(); });
  // steam (soft, HD) over everything near him
  ctx.fillStyle = '#f4f1fa'; steam.forEach(p => { ctx.globalAlpha = Math.max(0, p.l / p.l0) * .85; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;
  sparks.forEach(p => { ctx.globalAlpha = Math.min(1, p.l * 3); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 1.6, 1.6); }); ctx.globalAlpha = 1;
  // rocket warnings on the right edge
  obs.forEach(o => { if (o.type === 'rocket' && (o.warn > 0 || o.lock > 0)) { const blink = o.lock > 0 || Math.floor(t * 8) % 2; const x = W - 18;
    ctx.fillStyle = o.lock > 0 ? '#ff3a3a' : '#ffd75a'; ctx.globalAlpha = blink ? 1 : .45; ctx.beginPath(); ctx.moveTo(x, o.y - 10); ctx.lineTo(x + 11, o.y + 9); ctx.lineTo(x - 11, o.y + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1a1024'; ctx.font = '700 12px Silk'; ctx.textAlign = 'center'; ctx.fillText('!', x, o.y + 6); ctx.globalAlpha = 1; } });
  pops.forEach(p => { ctx.globalAlpha = Math.min(1, (1.1 - p.t) * 3); ctx.font = '12px PS'; ctx.textAlign = 'center'; ctx.fillStyle = '#160c28'; ctx.fillText(p.txt, p.x + 1.5, p.y + 1.5); ctx.fillStyle = p.col; ctx.fillText(p.txt, p.x, p.y); }); ctx.globalAlpha = 1;
  if (banner) drawBanner();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vigCv, 0, 0);
  if (flashT > 0) { ctx.fillStyle = `rgba(${flashCol},${Math.min(.75, flashT * 4)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}

function drawHero() {
  if (!heroImg.complete || state === 'menu') return;
  if (veh) { drawVehicle(); return; }
  if (inv > 0 && Math.floor(t * 14) % 2) return;
  let f;
  if (hero.dead) f = FR('glide0_ko');
  else if (state === 'menu') f = FR('fly' + (Math.floor(t * 9) % 3) + '_effort');
  else if (hero.ground) f = hero.landT > 0 ? FR('land0_effort') : FR('run' + (Math.floor(hero.run) % 6) + '_normal');
  else if (hero.thrust) f = FR('fly' + (Math.floor(t * 12) % 3) + (panicT > 0 ? '_panic' : '_effort'));
  else f = FR('glide' + (Math.floor(t * 6) % 2) + '_normal');
  ctx.save(); ctx.translate(hero.x, hero.y); ctx.rotate(hero.rot); ctx.imageSmoothingEnabled = false;
  // soft shadow on the pavement
  ctx.restore(); ctx.save();
  const gap = Math.max(0, FLOOR - hero.y); ctx.fillStyle = `rgba(30,10,30,${Math.max(.08, .32 - gap / 600)})`; ctx.beginPath(); ctx.ellipse(hero.x, FLOOR + 1, 20 - Math.min(10, gap / 25), 3.4, 0, 0, 7); ctx.fill();
  ctx.translate(hero.x, hero.y - (hero.slide ? HW * HS * .4 : 0)); ctx.rotate(hero.rot); ctx.imageSmoothingEnabled = false;
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
  const im = npcImg[p.k], M = NPC_META[p.k]; if (!im.complete || !im.naturalWidth) return;
  const sc = .9 / (M.k || 1), w = M.w * sc, h = M.h * sc;
  let facing = p.dir; if (p.flee > 0) facing = p.dir;
  if ((p.react > 0 || p.moodT > 0) && !p.esc) facing = p.look;
  else if (p.idle < 0 && !p.esc) facing = (p.idle < -.8 ? -p.dir : p.dir);      // looks back over the shoulder
  let f;
  if (p.esc) f = p.react > 0 ? 3 : p.moodT > 0 ? 4 : Math.floor(p.ph) % 3;
  else if (p.fall > 0) f = 10;
  else if (p.flee > 0) f = (Math.floor(t * 12) % 2) ? 8 : Math.floor(p.ph) % 4;
  else if (p.react > 0) f = 8;
  else if (p.moodT > 0) f = 9;
  else { const still = p.idle < 0; f = (still ? 0 : Math.floor(p.ph) % 4) + (p.blink < 0 ? 4 : 0); }
  const walking = !p.esc && (p.flee > 0 || !(p.react > 0 || p.moodT > 0 || p.idle < 0 || p.fall > 0));
  const bob = p.esc ? (Math.floor(p.ph * .5) % 2) * .6 : walking ? (Math.floor(p.ph) % 2) * 1.2 : 0, hop = Math.sin(p.hop * Math.PI) * p.hopH;
  ctx.fillStyle = 'rgba(30,10,30,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, w * (p.fall > 0 ? .6 : .36), 2, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(p.x, p.y - bob - hop);
  if (p.fall > 0) {   // tip over backwards, lie there, then pop back up
    const T = 1.9 - p.fall, k = T < .25 ? T / .25 : p.fall < .35 ? p.fall / .35 : 1;
    ctx.rotate(p.fallDir * k * Math.PI / 2 * .92); ctx.translate(0, k * 2);
  }
  if (facing < 0) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true;
  ctx.drawImage(im, f * M.w, 0, M.w, M.h, -w / 2, -h, w, h); ctx.restore(); ctx.imageSmoothingEnabled = true;
  if (p.fall > 0 && p.fall < 1.6) {   // little stars circling
    const cx = p.x + p.fallDir * h * .62, cy = p.y - 14;
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
  [[ax, ay], [bx, by]].forEach(([x, y]) => { ctx.fillStyle = 'rgba(6,2,22,.6)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(90,200,255,.45)'; ctx.beginPath(); ctx.arc(x, y, 17, 0, 7); ctx.fill(); ctx.restore(); ctx.fillStyle = '#2a2236'; ctx.beginPath(); ctx.arc(x, y, 7.2, 0, 7); ctx.fill(); const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 6.5); g.addColorStop(0, '#d9dbe6'); g.addColorStop(1, '#6d7286'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
    for (let i = 0; i < 8; i++) { ctx.strokeStyle = i % 2 ? '#1a1024' : '#ffd21f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 4.6, i / 8 * Math.PI * 2, (i + 1) / 8 * Math.PI * 2); ctx.stroke(); } ctx.fillStyle = Math.floor(t * 10) % 2 ? '#bff4ff' : '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 7); ctx.fill(); });
  if (Math.random() < .25) sparks.push({ x: ax + (bx - ax) * Math.random(), y: ay + (by - ay) * Math.random(), vx: (Math.random() - .5) * 80, vy: -Math.random() * 60, l: .25, c: '#dff8ff' });
}
function drawRocket(o) {
  if (o.warn > 0 || o.lock > 0) return;
  ctx.save(); ctx.translate(o.x, o.y);
  ctx.fillStyle = '#7a4a1a'; ctx.fillRect(10, -.5, 18, 1);                                    // stick
  ctx.fillStyle = '#d8262e'; ctx.fillRect(-6, -3.5, 16, 7); ctx.fillStyle = '#ffd75a'; ctx.fillRect(-2, -3.5, 2, 7); ctx.fillRect(4, -3.5, 2, 7);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-6, -3.5); ctx.lineTo(-13, 0); ctx.lineTo(-6, 3.5); ctx.closePath(); ctx.fill();
  const fl = 4 + Math.random() * 4; ctx.fillStyle = '#ffb02e'; ctx.beginPath(); ctx.moveTo(10, -2.5); ctx.lineTo(10 + fl, 0); ctx.lineTo(10, 2.5); ctx.fill();
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
  $('hBest').textContent = best + 'm'; $('hBank').textContent = '£' + bank.toLocaleString('en-GB');
  $('mosName').textContent = myMosque ? mosName() : 'Pick one'; $('mineName').textContent = mosName();
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
function goHome() { hero.dead = false; deadT = 0; veh = null; inv = 0; obs = []; coinList = []; gifts = []; $('eidiBox') && $('eidiBox').classList.add('hide'); state = 'menu'; ['over'].forEach(id => $(id).classList.add('hide')); $('hud').style.display = 'none'; $('home').classList.remove('hide'); refreshHome(); }
function showOver() { const m = Math.floor(dist / 10); if (m > best) { best = m; try { localStorage.setItem('jd_best', best); } catch (e) {} }
  bank += coins; try { localStorage.setItem('jd_bank', bank); } catch (e) {}
  $('oD').textContent = m + 'm'; $('oC').textContent = '£' + coins; $('oB').textContent = best + 'm';
  $('ovT').textContent = ['MISSED THE KHUTBAH!', 'SO CLOSE, AKHI!', 'THE IMAM STARTED!', 'BACK OF THE SAFF FOR YOU'][Math.random() * 4 | 0];
  $('ovWhy').textContent = `Still no sign of ${mosName()}…` + (passed ? ` You flew past ${passed} other masjid${passed > 1 ? 's' : ''}.` : '');
  $('oS').textContent = stats.steamed; $('oZ').textContent = stats.dodged; $('oM').textContent = stats.missed;
  $('over').classList.remove('hide'); }
const tap = (id, fn) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(e); });
tap('home', e => { if (e.target.closest('.tile')) return; start(); });
tap('bMos', openPick); tap('pickClose', () => $('pick').classList.add('hide'));
tap('bHow', () => $('how').classList.remove('hide')); tap('howClose', () => $('how').classList.add('hide'));
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
  const sc = $('steamCv'), wrap = $('heroWrap'), o = sc.getContext('2d'), occ = img('art/hero_occ.png');
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
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
window.__jd = { veh: k => startVehicle(k), laser: () => [CEIL + 40, (CEIL + FLOOR) / 2].forEach((y, i) => obs.push({ type: 'laser', x: W / 2, y, ph: 'in', pt: 0, slide: 0, d: i * .12 })), eidi: n => { eidi = n; }, kill: w => die(w), gift: k => gifts.push({ k, x: W * .6, y: 200, b: 0 }), get state() { return state; }, start, hero, get obs() { return obs; }, spawnRocket: () => obs.push({ type: "rocket", x: W + 40, y: hero.y - 30, warn: 1.5, lock: 0, v: 0 }), setHold: v => holding = v, get dist() { return dist; } };
})();
