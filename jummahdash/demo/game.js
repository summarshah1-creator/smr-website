/* Jummah Dash — demo v0.1 (an SMR Original). Landscape side-scroller: hold to fly with the pressure-cooker jetpack.
   World units: the screen is 320 units tall; buildings/cars come from the Flappy Kabootar drawing code, rendered natively
   at the screen's real resolution (so they're sharper than Flappy). The hero + people are pixel sprites. */
(() => {
'use strict';
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const VH = 400;                       // world height in units
const G = 300;                        // building ground line
const ROAD_T = 309, ROAD_B = 352;     // road
const PAVE_T = 358;                   // front pavement top
const FLOOR = 390;                    // hero feet when running
const CEIL = 26;                      // invisible ceiling (top of his head can't go above this)
const HW = 48, HH0 = 58, HS = 1.5, HH = HH0 * HS;   // hero sprite cell + its on-screen scale
const BS = .8;                        // buildings drawn a bit smaller so there's more sky to fly in
let S = 1, W = 600, dpr = 1, KR = 2;  // units->px, screen width in units, render scale for buildings

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
  S = cv.height / VH; W = cv.width / S;
  const k = Math.min(4, Math.max(1, Math.round(S * 10) / 10));
  if (Math.abs(k - KR) > .3) { KR = k; bCache.clear(); hazeCache.clear(); }
}

/* ---------------- assets ---------------- */
const img = src => { const i = new Image(); i.src = src; return i; };
const heroImg = img('art/hero.png');
const HERO_FR = ['run0_normal', 'run1_normal', 'run2_normal', 'run3_normal', 'run4_normal', 'run5_normal', 'fly0_effort', 'fly1_effort', 'fly2_effort', 'fly0_panic', 'fly1_panic', 'fly2_panic', 'glide0_normal', 'glide1_normal', 'land0_effort', 'glide0_ko', 'run0_happy', 'run0_blink'];
const FR = n => HERO_FR.indexOf(n);
const NPC_META = {"pc_m":{"w":47,"h":88,"n":11,"type":"walk"},"pc_f":{"w":47,"h":75,"n":11,"type":"walk"},"pcso":{"w":50,"h":74,"n":11,"type":"walk"},"warden":{"w":50,"h":74,"n":11,"type":"walk"},"fan_dad":{"w":43,"h":102,"n":11,"type":"walk"},"fan_f":{"w":47,"h":69,"n":11,"type":"walk"},"fan_kid":{"w":51,"h":74,"n":11,"type":"walk"},"blonde":{"w":47,"h":70,"n":11,"type":"walk"},"abaya":{"w":49,"h":70,"n":11,"type":"walk"},"teen":{"w":47,"h":70,"n":11,"type":"walk"},"aunty":{"w":47,"h":72,"n":11,"type":"walk"},"uncle":{"w":47,"h":70,"n":11,"type":"walk"},"nurse":{"w":47,"h":76,"n":11,"type":"walk"},"elder":{"w":49,"h":72,"n":11,"type":"walk"},"builder":{"w":49,"h":76,"n":11,"type":"walk"},"rider":{"w":50,"h":67,"n":11,"type":"walk"},"rider_g":{"w":54,"h":74,"n":11,"type":"walk"},"rider_o":{"w":54,"h":74,"n":11,"type":"walk"},"schoolboy":{"w":47,"h":67,"n":11,"type":"walk"},"shop":{"w":47,"h":67,"n":11,"type":"walk"},"lad":{"w":47,"h":67,"n":11,"type":"walk"},"esc_a":{"w":54,"h":78,"n":5,"type":"esc"},"esc_b":{"w":74,"h":82,"n":5,"type":"esc"},"esc_c":{"w":74,"h":75,"n":5,"type":"esc"},"esc_d":{"w":74,"h":78,"n":5,"type":"esc"},"esc_e":{"w":54,"h":82,"n":5,"type":"esc"}};   // sprite sheets: walkers = walk0-3, blink0-3, shock, cheer, dizzy; e-scooters = ride0-2, shock, cheer
const NPC_KEYS = Object.keys(NPC_META).filter(k => NPC_META[k].type === 'walk'), ESC_KEYS = Object.keys(NPC_META).filter(k => NPC_META[k].type === 'esc');
const npcImg = {}; Object.keys(NPC_META).forEach(k => npcImg[k] = img('art/npc_' + k + '.png?v=3'));

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

function seedStars() { stars = []; for (let i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random() * .55, r: Math.random() < .2 ? 1.2 : .7, p: Math.random() * 6 }); }
function reset() {
  t = 0; dist = 0; speed = 0; coins = 0; obs = []; coinList = []; steam = []; sparks = []; panicT = 0; deadT = 0;
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
  if (wantLm) { let k; do { k = STREET[Math.random() * STREET.length | 0]; } while (lastLm.includes(k) || !LANDMARKS[k]); lastLm.push(k); if (lastLm.length > 10) lastLm.shift();
    street.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * BS, gap: 6 + Math.random() * 14 }); }
  else { const hk = HOUSE_K(); const k = hk[Math.random() * hk.length | 0]; street.push({ kind: 'hs', key: k, x, w: Math.round(HOUSES[k].w * 1.35) * BS, gap: 0, run: prev && prev.kind === 'hs' ? (prev.run || 1) + 1 : 1 }); }
}
function fillStreet() { while (!street.length || street[street.length - 1].x < W + 600) { nextBuilding(); const b = street[street.length - 1]; setTimeout(() => buildingCanvas(b.kind, b.key), 0); } }   // built ~1.5 screens ahead so there's no hitch
function fillSkyline() { let x = skyline.length ? skyline[skyline.length - 1].x + skyline[skyline.length - 1].w : -100; while (x < W * 2.2) { const k = STREET[Math.random() * STREET.length | 0]; if (!LANDMARKS[k]) continue; skyline.push({ kind: 'lm', key: k, x, w: LANDMARKS[k].w * .5 }); x += LANDMARKS[k].w * .5 - 16; } }

function spawnCar(x) {
  const k = CAR_KEYS[Math.random() * CAR_KEYS.length | 0]; if (!VEHICLES[k]) return;
  const far = Math.random() < .5, V = VEHICLES[k];
  const v = (V.speed ? (V.speed[0] + Math.random() * (V.speed[1] - V.speed[0])) : 30) * 2.2;
  cars.push({ k, ci: Math.random() * 10 | 0, far, x: x !== undefined ? x : (far ? W + 30 : -160), v: far ? -v : v });
}
function spawnNpc(x) {
  const esc = Math.random() < .16, k = esc ? ESC_KEYS[Math.random() * ESC_KEYS.length | 0] : NPC_KEYS[Math.random() * NPC_KEYS.length | 0];
  const dir = Math.random() < .5 ? -1 : 1;
  npcs.push({ k, esc, x: x !== undefined ? x : (dir > 0 && esc ? -90 : W + 60), y: PAVE_T + 18 + Math.random() * 26, dir, v: esc ? 70 + Math.random() * 50 : 16 + Math.random() * 14,
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
function heroCircles() { const x = hero.x, y = hero.y, k = HS; return [[x + 2 * k, y - 20 * k, 10 * k], [x + 6 * k, y - 42 * k, 9 * k], [x - 12 * k, y - 30 * k, 8 * k]]; }
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let k = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; k = Math.max(0, Math.min(1, k)); const qx = ax + dx * k - px, qy = ay + dy * k - py; return Math.sqrt(qx * qx + qy * qy); }

function die(why) {
  if (hero.dead) return; hero.dead = true; hero.vx = Math.max(120, speed * .9); hero.vy = -170; hero.bounce = 0; deadT = 0; state = 'dead';
  if (why === 'zap') { SFX.zap(); for (let i = 0; i < 30; i++) sparks.push({ x: hero.x, y: hero.y - 30, vx: (Math.random() - .5) * 260, vy: (Math.random() - .5) * 260, l: .5 + Math.random() * .4, c: Math.random() < .5 ? '#bff4ff' : '#fff6a8' }); }
  else { SFX.boom(); for (let i = 0; i < 40; i++) sparks.push({ x: hero.x + 10, y: hero.y - 30, vx: (Math.random() - .5) * 320, vy: (Math.random() - .7) * 300, l: .6 + Math.random() * .5, c: ['#ff5a3a', '#ffd75a', '#ffffff', '#ff9a2a'][i % 4] }); }
}

/* ---------------- update ---------------- */
function update(dt) {
  t += dt;
  const playing = state === 'play' || state === 'intro';
  // speed: walk-in, then builds up over the run (Jetpack-style)
  if (state === 'intro') speed += (120 - speed) * Math.min(1, dt * 2);
  else if (state === 'play') speed = Math.min(300, 150 + dist * .012);
  else if (state === 'dead') speed = Math.max(0, speed - 160 * dt);
  else if (state === 'menu') speed = 55;
  const dx = speed * dt; if (state !== 'menu') dist += dx;

  // scroll the world
  street.forEach(b => b.x -= dx); while (street.length && street[0].x + street[0].w + 40 < -20) street.shift(); fillStreet();
  skyline.forEach(b => b.x -= dx * .32); while (skyline.length && skyline[0].x + skyline[0].w < -50) skyline.shift(); fillSkyline();
  cars.forEach(c => c.x += c.v * dt - dx * .92); cars = cars.filter(c => c.x > -260 && c.x < W + 300);
  if ((nextCar -= dt) <= 0) { spawnCar(); nextCar = 1.2 + Math.random() * 2.6; }

  // people on the front pavement
  npcs.forEach(p => {
    const busy = p.react > 0 || p.fall > 0 || p.moodT > 0 || p.idle < 0;
    const mv = p.fall > 0 ? 0 : p.esc ? 1 : busy ? (p.mood === 'cheer' ? .3 : .1) : 1;
    p.x += p.dir * p.v * mv * dt - dx; if (!busy || p.esc) p.ph += dt * (p.esc ? 14 : p.v * .32);
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
  if (playing && !hero.dead) {
    hero.thrust = holding && state === 'play';
    if (hero.thrust) { if (!hero.wasThrust) { hero.vy = Math.min(hero.vy, -90); for (let i = 0; i < 8; i++) { const nz = nozzle(); steam.push({ x: nz[0], y: nz[1], vx: -speed * .3 - 40 - Math.random() * 60, vy: 120 + Math.random() * 120, r: 3 + Math.random() * 2.5, l: .45, l0: .6 }); } } hero.vy -= 1900 * dt; hero.ground = false; if (hissG && sndOn) hissG.gain.setTargetAtTime(.05, AC.currentTime, .03); }
    else if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
    hero.wasThrust = hero.thrust; hero.vy += 820 * dt; hero.vy = Math.max(-300, Math.min(420, hero.vy)); hero.y += hero.vy * dt;
    if (hero.y >= FLOOR) { if (!hero.ground && hero.vy > 120) { hero.landT = .14; SFX.thud && tone(180, .08, 'triangle', .08); } hero.y = FLOOR; hero.vy = 0; hero.ground = true; }
    if (hero.y - HH < CEIL) { hero.y = CEIL + HH; hero.vy = Math.max(0, hero.vy); }
    hero.landT -= dt; hero.run += dt * (6 + speed / 22);
    hero.rot += ((hero.ground ? 0 : Math.max(-.18, Math.min(.22, hero.vy / 1400))) - hero.rot) * Math.min(1, dt * 8);
    // steam out of the nozzle
    const nz = nozzle();
    if (hero.thrust) for (let i = 0; i < 2; i++) steam.push({ x: nz[0] + (Math.random() - .5) * 3, y: nz[1], vx: -speed * .35 - 30 - Math.random() * 40, vy: 150 + Math.random() * 90, r: 2.5 + Math.random() * 2, l: .5 + Math.random() * .35, l0: .8 });
    else if (Math.random() < dt * 10) steam.push({ x: nz[0], y: nz[1], vx: -speed * .3 - 10, vy: 30, r: 1.6, l: .4, l0: .4 });
  } else if (hissG) hissG.gain.setTargetAtTime(0, AC.currentTime, .06);
  if (state === 'menu') { hero.x = W * .28; hero.y = FLOOR - 120 + Math.sin(t * 2.2) * 10; hero.run += dt * 8; hero.thrust = true; const nz = nozzle(); if (Math.random() < .7) steam.push({ x: nz[0], y: nz[1], vx: -60 - Math.random() * 40, vy: 140 + Math.random() * 60, r: 2.5 + Math.random() * 2, l: .5, l0: .7 }); }
  if (hero.dead) {
    deadT += dt; hero.vy += 900 * dt; hero.y += hero.vy * dt; hero.x += (hero.vx - speed) * dt * .25; hero.vx *= Math.pow(.4, dt);
    hero.rot += dt * (hero.bounce < 2 ? 9 : 0);
    if (hero.y >= FLOOR + 6) { hero.y = FLOOR + 6; if (hero.bounce < 2 && hero.vy > 80) { hero.vy = -hero.vy * .42; hero.bounce++; SFX.thud(); } else { hero.vy = 0; hero.rot += (Math.round(hero.rot / Math.PI) * Math.PI + Math.PI / 2 - hero.rot) * Math.min(1, dt * 10); } }
    if (deadT > 1.6 && $('over').classList.contains('hide')) showOver();
  }

  // obstacles
  if (state === 'play') { nextObs -= dx; if (nextObs <= 0) nextObs = spawnPattern(); }
  panicT = Math.max(0, panicT - dt);
  obs.forEach(o => {
    if (o.type === 'zap') { o.x -= dx; if (o.spin) o.ang += o.spin * dt; }
    if (o.type === 'rocket') {
      if (o.warn > 0) { o.warn -= dt; o.y += (hero.y - 30 - o.y) * Math.min(1, dt * 3); panicT = .3; if ((o.warn * 6 | 0) !== ((o.warn + dt) * 6 | 0)) SFX.warn(); if (o.warn <= 0) { o.lock = .45; } }
      else if (o.lock > 0) { o.lock -= dt; panicT = .3; if (o.lock <= 0) { o.v = speed + 360; SFX.whoosh(); } }
      else { o.x -= o.v * dt; if (Math.random() < .9) sparks.push({ x: o.x + 14, y: o.y + (Math.random() - .5) * 3, vx: 60 + Math.random() * 60, vy: (Math.random() - .5) * 40, l: .35, c: Math.random() < .5 ? '#ffd75a' : '#ff7a3a' }); }
    }
    if (!hero.dead && (state === 'play')) {
      const hc = heroCircles();
      if (o.type === 'zap') { const ax = o.x - Math.cos(o.ang) * o.len / 2, ay = o.y - Math.sin(o.ang) * o.len / 2, bx = o.x + Math.cos(o.ang) * o.len / 2, by = o.y + Math.sin(o.ang) * o.len / 2;
        if (hc.some(([x, y, r]) => segDist(x, y, ax, ay, bx, by) < r + 3.5)) die('zap'); }
      if (o.type === 'rocket' && o.v && hc.some(([x, y, r]) => Math.hypot(x - o.x, y - o.y) < r + 6)) die('rocket');
    }
  });
  obs = obs.filter(o => o.x > -200);
  // coins
  coinList.forEach(c => { c.x -= dx; if (!c.got && !hero.dead && state === 'play') { const hc = heroCircles(); if (hc.some(([x, y, r]) => Math.hypot(x - c.x, y - c.y) < r + COIN_R + 2)) { c.got = 1; coins++; SFX.coin(); for (let i = 0; i < 5; i++) sparks.push({ x: c.x, y: c.y, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, l: .3, c: '#fff3b0' }); } } });
  coinList = coinList.filter(c => c.x > -20 && !c.got);
  // particles
  steam.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= Math.pow(.25, dt); p.vx *= Math.pow(.6, dt); p.r += dt * 16; p.l -= dt; if (p.y > FLOOR + 4) { p.y = FLOOR + 4; p.vy = -p.vy * .2; p.vx -= 40 * dt * 10; } });
  steam = steam.filter(p => p.l > 0);
  sparks.forEach(p => { p.x += p.vx * dt - dx * .3; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt; }); sparks = sparks.filter(p => p.l > 0);
  if (state === 'play' || state === 'dead') { $('dist').textContent = Math.floor(dist / 10) + 'm'; $('coins').textContent = coins; }
}
function nozzle() { const c = Math.cos(hero.rot), s = Math.sin(hero.rot), lx = -14 * HS, ly = -16 * HS; return [hero.x + lx * c - ly * s, hero.y + lx * s + ly * c]; }

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
  ctx.setTransform(S, 0, 0, S, 0, 0);
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
  obs.forEach(o => { if (o.type === 'zap') drawZap(o); else drawRocket(o); });
  // people + hero, sorted by depth (feet y)
  const list = npcs.map(p => ({ y: p.y, f: () => drawNpc(p) })); list.push({ y: hero.dead ? FLOOR + 6 : (hero.ground ? FLOOR : FLOOR + 1), f: drawHero });
  list.sort((a, b) => a.y - b.y).forEach(o => o.f());
  // steam (soft, HD) over everything near him
  ctx.fillStyle = '#f4f1fa'; steam.forEach(p => { ctx.globalAlpha = Math.max(0, p.l / p.l0) * .85; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;
  sparks.forEach(p => { ctx.globalAlpha = Math.min(1, p.l * 3); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 1.6, 1.6); }); ctx.globalAlpha = 1;
  // rocket warnings on the right edge
  obs.forEach(o => { if (o.type === 'rocket' && (o.warn > 0 || o.lock > 0)) { const blink = o.lock > 0 || Math.floor(t * 8) % 2; const x = W - 18;
    ctx.fillStyle = o.lock > 0 ? '#ff3a3a' : '#ffd75a'; ctx.globalAlpha = blink ? 1 : .45; ctx.beginPath(); ctx.moveTo(x, o.y - 10); ctx.lineTo(x + 11, o.y + 9); ctx.lineTo(x - 11, o.y + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1a1024'; ctx.font = '700 12px Silk'; ctx.textAlign = 'center'; ctx.fillText('!', x, o.y + 6); ctx.globalAlpha = 1; } });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vigCv, 0, 0);
}

function drawHero() {
  if (!heroImg.complete) return;
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
  ctx.translate(hero.x, hero.y); ctx.rotate(hero.rot); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(heroImg, f * HW, 0, HW, HH0, -HW * HS / 2, -HH, HW * HS, HH);
  ctx.restore(); ctx.imageSmoothingEnabled = true;
}
function drawNpc(p) {
  const im = npcImg[p.k], M = NPC_META[p.k]; if (!im.complete || !im.naturalWidth) return;
  const sc = .9, w = M.w * sc, h = M.h * sc;
  let facing = p.dir;
  if ((p.react > 0 || p.moodT > 0) && !p.esc) facing = p.look;
  else if (p.idle < 0 && !p.esc) facing = (p.idle < -.8 ? -p.dir : p.dir);      // looks back over the shoulder
  let f;
  if (p.esc) f = p.react > 0 ? 3 : p.moodT > 0 ? 4 : Math.floor(p.ph) % 3;
  else if (p.fall > 0) f = 10;
  else if (p.react > 0) f = 8;
  else if (p.moodT > 0) f = 9;
  else { const still = p.idle < 0; f = (still ? 0 : Math.floor(p.ph) % 4) + (p.blink < 0 ? 4 : 0); }
  const walking = !p.esc && !(p.react > 0 || p.moodT > 0 || p.idle < 0 || p.fall > 0);
  const bob = p.esc ? (Math.floor(p.ph * .5) % 2) * .6 : walking ? (Math.floor(p.ph) % 2) * 1.2 : 0, hop = Math.sin(p.hop * Math.PI) * p.hopH;
  ctx.fillStyle = 'rgba(30,10,30,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, w * (p.fall > 0 ? .6 : .36), 2, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(p.x, p.y - bob - hop);
  if (p.fall > 0) {   // tip over backwards, lie there, then pop back up
    const T = 1.9 - p.fall, k = T < .25 ? T / .25 : p.fall < .35 ? p.fall / .35 : 1;
    ctx.rotate(p.fallDir * k * Math.PI / 2 * .92); ctx.translate(0, k * 2);
  }
  if (facing < 0) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, f * M.w, 0, M.w, M.h, -w / 2, -h, w, h); ctx.restore(); ctx.imageSmoothingEnabled = true;
  if (p.fall > 0 && p.fall < 1.6) {   // little stars circling
    const cx = p.x + p.fallDir * h * .62, cy = p.y - 14;
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; ctx.fillStyle = i % 2 ? '#ffe36a' : '#ffffff'; drawStar(cx + Math.cos(a) * 10, cy + Math.sin(a) * 3.5, 2.6); }
  }
  if ((p.react > 0 || p.moodT > 0) && !p.esc) { const y = p.y - h - 10 - hop; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, y, 6, 0, 7); ctx.fill(); ctx.strokeStyle = '#1a1024'; ctx.lineWidth = .8; ctx.stroke();
    ctx.fillStyle = p.moodT > 0 ? '#2fbf4a' : '#e8352a'; ctx.font = '700 9px Silk'; ctx.textAlign = 'center'; ctx.fillText(p.moodT > 0 ? '♥' : '!', p.x, y + 3.5); }
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
function start() { audio(); if (AC && AC.state === 'suspended') AC.resume(); reset(); state = 'intro'; hero.x = -30; $('menu').classList.add('hide'); $('over').classList.add('hide'); $('hud').style.display = 'block'; }
function showOver() { const m = Math.floor(dist / 10); if (m > best) { best = m; try { localStorage.setItem('jd_best', best); } catch (e) {} }
  $('oD').textContent = m + 'm'; $('oC').textContent = coins; $('oB').textContent = best + 'm';
  $('ovT').textContent = ['MISSED THE KHUTBAH!', 'SO CLOSE, AKHI!', 'THE IMAM STARTED!', 'BACK OF THE SAFF FOR YOU'][Math.random() * 4 | 0];
  $('over').classList.remove('hide'); }
$('menu').addEventListener('pointerdown', e => { e.preventDefault(); start(); holding = false; });
$('again').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); start(); });
$('snd').addEventListener('pointerdown', e => { e.stopPropagation(); sndOn = !sndOn; $('snd').textContent = sndOn ? '🔊' : '🔇'; if (!sndOn && hissG) hissG.gain.value = 0; });
const down = e => { if (e.target.closest && e.target.closest('.btn,.panel')) return; holding = true; audio(); };
window.addEventListener('pointerdown', down); window.addEventListener('touchstart', e => { if (e.target.closest && e.target.closest('.btn,.panel')) return; e.preventDefault(); holding = true; audio(); }, { passive: false }); window.addEventListener('touchend', e => { if (!e.touches.length) holding = false; }); window.addEventListener('touchcancel', () => holding = false); window.addEventListener('pointerup', () => holding = false); window.addEventListener('pointercancel', () => holding = false);
window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (state === 'menu') start(); else if (state === 'dead' && !$('over').classList.contains('hide')) start(); else holding = true; } });
window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') holding = false; });
document.addEventListener('gesturestart', e => e.preventDefault());
window.addEventListener('resize', resize);

resize(); seedStars(); reset(); hero.x = W * .28;
let last = performance.now();
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
window.__jd = { get state() { return state; }, start, hero, get obs() { return obs; }, spawnRocket: () => obs.push({ type: "rocket", x: W + 40, y: hero.y - 30, warn: 1.5, lock: 0, v: 0 }), setHold: v => holding = v, get dist() { return dist; } };
})();
