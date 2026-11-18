/* Flappy Kabootar: sky, time of day and weather.
   - Day / sunrise / sunset / night from the real position of the sun over Luton (works offline).
   - Live Luton weather from the game's server (api.php?a=cfg → wx, Open-Meteo, cached 15 min); clear sky if it isn't there.
   - Everything here sits behind the pipes and the pigeon.
   Preview: ?sky=dawn|day|sunset|dusk|night  ?hour=19.5  ?wx=clear|cloudy|fog|drizzle|rain|storm|snow */
(function () {
  const q = new URLSearchParams(location.search);
  const FS = q.get('sky'), FH = q.get('hour'), FW = q.get('wx');
  const LAT = 51.879, LON = -0.417, RD = Math.PI / 180;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const css = (c, a) => a == null ? 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')' : 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';

  function sunAlt(ms) { const d = ms / 864e5 - 10957.5, g = (357.529 + .98560028 * d) * RD, ql = 280.459 + .98564736 * d;
    const L = (ql + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)) * RD, e = (23.439 - 3.6e-7 * d) * RD;
    const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)), dec = Math.asin(Math.sin(e) * Math.sin(L));
    const gmst = ((18.697374558 + 24.06570982441908 * d) % 24 + 24) % 24, ha = (gmst * 15 + LON) * RD - ra;
    const alt = Math.asin(Math.sin(LAT * RD) * Math.sin(dec) + Math.cos(LAT * RD) * Math.cos(dec) * Math.cos(ha));
    sunAlt.az = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(LAT * RD) - Math.tan(dec) * Math.cos(LAT * RD)) / RD + 180 + 360) % 360;   // compass bearing of the sun
    return alt / RD; }
  const moonPhase = ms => (((ms - Date.UTC(2000, 0, 6, 18, 14)) / 864e5 / 29.530588) % 1 + 1) % 1;

  // sky colours by sun height (evening; mornings are a touch pinker)
  const KEYS = [[35, '#3b97d6', '#c4e8f7'], [10, '#4a95d4', '#d6ecf2'], [4, '#5487c4', '#f4d6a0'], [1, '#4b5f9e', '#f7a35c'], [-2, '#34407e', '#e9775f'],
    [-5, '#222a62', '#9c4f74'], [-9, '#101741', '#3b2f5e'], [-14, '#060a22', '#141b3e'], [-90, '#05081c', '#10163a']].map(k => [k[0], hex(k[1]), hex(k[2])]);
  const MORN = { 1: hex('#f6b07a'), '-2': hex('#d9809a'), '-5': hex('#7d5a8c') };
  function skyCols(alt, morning) { for (let i = 0; i < KEYS.length - 1; i++) { const a = KEYS[i], b = KEYS[i + 1]; if (alt <= a[0] && alt >= b[0] || i === 0 && alt > a[0]) {
    const k = i === 0 && alt > a[0] ? 0 : (a[0] - alt) / (a[0] - b[0]); const ab = morning && MORN[a[0]] || a[2], bb = morning && MORN[b[0]] || b[2];
    return [mix(a[1], b[1], k), mix(ab, bb, k)]; } } const z = KEYS[KEYS.length - 1]; return [z[1], z[2]]; }

  // weather codes (WMO) → what to draw
  function fromCode(code, cloud) { const o = { cover: .1, fog: 0, rain: 0, drizzle: 0, storm: 0, snow: 0 };
    if (code === 1) o.cover = .25; else if (code === 2) o.cover = .5; else if (code === 3) o.cover = .92;
    else if (code === 45 || code === 48) { o.fog = 1; o.cover = .85; }
    else if (code >= 51 && code <= 57) { o.drizzle = 1; o.rain = [.25, .35, .45][Math.min(2, (code - 51) >> 1)] || .3; o.cover = .95; }
    else if (code >= 61 && code <= 67) { o.rain = code === 61 || code === 66 ? .45 : code === 63 ? .65 : .9; o.cover = 1; }
    else if (code >= 71 && code <= 77) { o.snow = code === 71 || code === 77 ? .4 : code === 73 ? .65 : .9; o.cover = 1; }
    else if (code >= 80 && code <= 82) { o.rain = [.45, .65, .9][code - 80]; o.cover = .9; }
    else if (code === 85 || code === 86) { o.snow = code === 85 ? .5 : .85; o.cover = 1; }
    else if (code >= 95) { o.rain = .85; o.storm = 1; o.cover = 1; }
    if (cloud != null && !(code >= 45)) o.cover = Math.max(code <= 3 ? 0 : o.cover, clamp(cloud / 100));
    return o; }
  const PRESET_WX = { clear: 0, cloudy: 3, fog: 45, drizzle: 53, rain: 63, heavy: 65, storm: 95, snow: 73, rainbow: 2 };
  const PRESET_SKY = { dawn: [1.5, 1, 115], morning: [14, 1, 140], day: [35, 0, 180], afternoon: [18, 0, 220], sunset: [.8, 0, 245], dusk: [-5, 0, 255], night: [-25, 0, 0] };

  let liveSky = true, liveWx = true, tgt = fromCode(0), first = true, wind = 12, snowd = 0;
  const cur = Object.assign({}, tgt);
  const S = window.SKY = { alt: 35, morning: false, n: 0, gold: 0, grey: 0, lightA: 0, snowAcc: 0, flash: 0, cur, wind: 0,
    cloudCol: 'rgba(255,255,255,.85)', top: KEYS[0][1], bot: KEYS[0][2] };
  if (FW && PRESET_WX[FW] != null) { tgt = fromCode(PRESET_WX[FW]); Object.assign(cur, tgt); if (FW === 'snow') S.snowAcc = 1; first = false; liveWx = false; }
  let lastRain = FW === 'rainbow' ? Date.now() : 0;

  S.cfg = c => { if (!c) return; if (c.sky_live === false) liveSky = false; if (c.wx_live === false) liveWx = false;
    if (FW || !liveWx || !c.wx || !c.wx.ok) return;
    tgt = fromCode(+c.wx.code, c.wx.cloud); wind = +c.wx.wind || 10; snowd = +c.wx.snowd || 0;
    if (first) { Object.assign(cur, tgt); S.snowAcc = Math.max(tgt.snow > 0 ? .85 : 0, snowd > 0 ? clamp(.45 + snowd * 25) : 0); first = false; } };
  // keep the weather fresh while the game is open (every 10 minutes)
  setInterval(() => { if (document.hidden || FW) return; fetch('api.php?a=cfg', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(S.cfg).catch(() => {}); }, 3e5);   // weather checked every 5 minutes

  let lastSun = -9;
  function sun() { const fs = S.forceSky || FS; if (fs && PRESET_SKY[fs]) { S.alt = PRESET_SKY[fs][0]; S.morning = !!PRESET_SKY[fs][1]; S.az = PRESET_SKY[fs][2]; S.phase = .45; return; }
    let ms = Date.now(); if (FH != null && !isNaN(+FH)) { const d = new Date(); d.setHours(0, 0, 0, 0); ms = d.getTime() + (+FH) * 36e5 + performance.now() * (+q.get('tspd') || 0); }
    if (S.forceHour != null) { const d = new Date(); d.setHours(0, 0, 0, 0); ms = d.getTime() + S.forceHour * 36e5; }
    if (!liveSky) { S.alt = 35; S.az = 180; S.morning = false; S.phase = .45; return; }
    S.alt = sunAlt(ms); S.az = sunAlt.az; S.morning = sunAlt(ms + 6e5) > S.alt; S.phase = moonPhase(ms); }

  // ---------- particles ----------
  const drops = [], flakes = [], splash = [], stars = [];
  for (let i = 0; i < 80; i++) stars.push({ x: Math.random(), y: Math.random(), s: Math.random() < .15 ? 2 : 1, p: Math.random() * 7, k: 1 + Math.random() * 2.5 });
  let boltT = 8, bolt = null, flock = null, flockT = 8, kite = null, kiteT = 30;

  S.tick = (dt, t, v, W, OY, H, BE, GY, ROAD) => {
    if (t - lastSun > 2 || q.get('tspd')) { lastSun = t; sun(); }
    const k = Math.min(1, dt / 14); for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k;
    S.n = clamp((3 - S.alt) / 12); S.gold = clamp(1 - Math.abs(S.alt - 2) / 8) * (1 - cur.cover * .8);
    S.grey = Math.min(.9, clamp((cur.cover - .5) / .5) * .7 + cur.rain * .25 + cur.fog * .3 + cur.snow * .2);
    S.lightA = clamp((S.n - .12) / .45); S.wind = wind;
    // late at night (from about 11pm to 5am) the town gets a bit darker and lights go off here and there
    { const now = S.forceHour != null ? S.forceHour : FH != null && !isNaN(+FH) ? (+FH + performance.now() * (+q.get('tspd') || 0) / 36e5) % 24 : new Date().getHours() + new Date().getMinutes() / 60;
      S.hour = now; const h = now < 12 ? now + 24 : now; S.late = (FS === 'night' && q.get('late')) || S.forceHour === 1.5 ? S.n : clamp((h - 22.5) / 3) * (1 - clamp((h - 28.5) / 1.5)) * S.n; }
    // rainbow: just after real rain stops, while the sun is out and fairly low
    if (cur.rain > .15) lastRain = Date.now(); const since = (Date.now() - lastRain) / 6e4;
    const rbT = lastRain && since < 20 && cur.rain < .1 && S.alt > 3 && S.alt < 42 && cur.cover < .75 && S.n < .2 ? clamp(1 - since / 20) : 0; S.rainbow = (S.rainbow || 0) + (rbT - (S.rainbow || 0)) * Math.min(1, dt / 4);
    // where the sunlight comes from: -1 = from the left (morning, east), +1 = from the right (evening, west); how strong it is
    S.sx = clamp(((S.az == null ? 180 : S.az) - 180) / 80, -1, 1); S.dirK = clamp(S.alt / 5) * (1 - cur.cover * .85) * (1 - S.n);
    // a small flock now and then on a dry, bright day
    if (!flock && S.n < .35 && cur.rain < .2 && cur.storm < .2) { flockT -= dt; if (flockT <= 0) { flockT = 25 + Math.random() * 40; const n = 5 + (Math.random() * 5 | 0), y = -OY + 30 + Math.random() * Math.max(40, OY + GY - 230), dir = Math.random() < .7 ? -1 : 1;
      flock = { x: dir < 0 ? W + 20 : -40, y, dir, v: 16 + Math.random() * 10, b: Array.from({ length: n }, (_, i) => ({ dx: (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 7, dy: Math.ceil(i / 2) * 4 + Math.random() * 2, p: Math.random() * 6 })) }; } }
    if (flock) { flock.x += flock.dir * flock.v * dt - v * .05 * dt; if (flock.x < -80 || flock.x > W + 80) flock = null; }
    // a red kite circling high up now and then (they're everywhere around Luton)
    kiteT -= dt; if (!kite && kiteT <= 0) { kiteT = 80 + Math.random() * 120; if (S.n < .3 && cur.rain < .2 && cur.storm < .2) kite = { cx: W + 40, cy: -OY + 40 + Math.random() * Math.max(30, OY + GY - 250), r: 14 + Math.random() * 10, a: Math.random() * 6, life: 0 }; }
    if (kite) { kite.life += dt; kite.a += dt * .8; kite.cx -= (v * .06 + 4) * dt; if (kite.cx < -60) kite = null; }
    // snow settles while it snows, melts slowly after
    if (cur.snow > .15) S.snowAcc = Math.min(1, S.snowAcc + dt / 45 * cur.snow); else if (snowd <= 0 && !FW) S.snowAcc = Math.max(0, S.snowAcc - dt / 240);
    let [top, bot] = skyCols(S.alt, S.morning); const gt = mix(hex('#8796a6'), hex('#0d1120'), S.n), gb = mix(hex('#c3cbd3'), hex('#1d2234'), S.n);
    S.top = mix(top, gt, S.grey); S.bot = mix(bot, gb, S.grey);
    let cc = mix([255, 255, 255], hex('#ffcaa6'), S.gold); cc = mix(cc, hex('#3a4468'), S.n); cc = mix(cc, mix(hex('#c4cad2'), hex('#2a3044'), S.n), clamp(S.grey * 1.1));
    if (cur.storm > .3) cc = mix(cc, mix(hex('#6f7884'), hex('#1a1e2c'), S.n), cur.storm * .6);
    S.cloudCol = css(cc, (.85 - S.n * .2).toFixed(2)); S.cloudN = Math.round(3 + cur.cover * 9);
    // rain
    const want = Math.round((cur.rain > .03 ? cur.rain : 0) * 240), slant = .12 + Math.min(.35, wind / 90);
    while (drops.length < want) drops.push({ x: Math.random() * (W + 80), y: -OY - Math.random() * (H + OY + BE), v: 250 + Math.random() * 140, l: 5 + Math.random() * 6 });
    if (drops.length > want) drops.length = want;
    const bottom = H + BE;
    drops.forEach(d => { d.y += d.v * dt * (cur.drizzle > .5 ? .7 : 1); d.x -= (d.v * slant + v * .35) * dt;
      const floor = d.g || (d.g = GY + 2 + Math.random() * (bottom - GY));
      if (d.y > floor) { if (splash.length < 60 && Math.random() < .6 && cur.drizzle < .5) splash.push({ x: d.x, y: floor, t: 0 }); d.y = -OY - Math.random() * 40; d.x = Math.random() * (W + 80); d.g = 0; }
      if (d.x < -20) d.x += W + 60; });
    for (let i = splash.length - 1; i >= 0; i--) { splash[i].t += dt; splash[i].x -= v * .5 * dt; if (splash[i].t > .22) splash.splice(i, 1); }
    // snow
    const wf = Math.round((cur.snow > .03 ? cur.snow : 0) * 150);
    while (flakes.length < wf) { const z = Math.random(); flakes.push({ x: Math.random() * (W + 40), y: -OY - Math.random() * (H + OY + BE), v: 16 + z * 34, s: .45 + z * .9, a: .45 + z * .5, p: Math.random() * 7 }); }
    if (flakes.length > wf) flakes.length = wf;
    flakes.forEach(f => { f.y += f.v * dt; f.x += (Math.sin(t * 1.3 + f.p) * (4 + f.s * 6) - wind * .4 - v * .3) * dt; if (f.y > bottom) { f.y = -OY - 5; f.x = Math.random() * (W + 40); } if (f.x < -10) f.x += W + 30; });
    // lightning, far away and soft
    if (cur.storm > .5) { boltT -= dt; if (boltT <= 0) { boltT = 7 + Math.random() * 9; S.flash = 1; const bx = W * (.15 + Math.random() * .7), pts = [[bx, -OY]]; let y = -OY, x = bx;
      while (y < GY - 150) { y += 8 + Math.random() * 10; x += (Math.random() - .5) * 14; pts.push([x, y]); } bolt = { pts, t: 0 }; } }
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt * 2.8); if (bolt) { bolt.t += dt; if (bolt.t > .25) bolt = null; }
  };

  // pixel disc helpers (row by row, whole units, so the sun and moon stay pixel art)
  function disc(c, cx, cy, r, col, cut) { c.fillStyle = col; for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); let x0 = cx - w, x1 = cx + w;
    if (cut) { const sw = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))) ; const sx0 = cx + cut - sw, sx1 = cx + cut + sw; if (cut > 0) x1 = Math.min(x1, sx0); else x0 = Math.max(x0, sx1); }
    if (x1 > x0) c.fillRect(x0, cy + dy, x1 - x0, 1); } }

  // the moon drawn in detail at 8x (seas, craters, soft edge, the real phase with a soft line between day and night) and shrunk onto the sky
  let moonC = null, moonP = -1;
  function moonArt(p) { const q = Math.round(p * 120) / 120; if (moonC && q === moonP) return moonC; moonP = q; const R = 80, D = R * 2 + 4; if (!moonC) { moonC = document.createElement('canvas'); moonC.width = moonC.height = D; }
    const g = moonC.getContext('2d'), im = g.createImageData(D, D), d = im.data, k = Math.cos(q * 2 * Math.PI), wax = q < .5;
    const seas = [[-.32, -.36, .3, .24], [.08, -.3, .2, .17], [.3, -.05, .22, .2], [.62, -.22, .13, .15], [-.55, .02, .3, .42], [.1, .2, .16, .12], [-.2, .42, .22, .12], [.36, .36, .12, .1]];
    const craters = [[-.15, .68, .07], [.55, .5, .05], [-.62, -.5, .05], [.2, -.62, .04], [-.4, .3, .035], [.68, .15, .035], [-.05, -.05, .03]];
    const hash = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };
    for (let py = 0; py < D; py++) for (let px = 0; px < D; px++) { const x = (px - D / 2 + .5) / R, y = (py - D / 2 + .5) / R, rr = x * x + y * y; if (rr > 1.02) continue;
      const edge = Math.max(0, Math.min(1, (1 - Math.sqrt(rr)) * R / 1.4 + .5));
      let v = 1; for (const [sx, sy, ax, ay] of seas) { const e = ((x - sx) / ax) ** 2 + ((y - sy) / ay) ** 2; if (e < 1) v -= .17 * (1 - e * e); }
      for (const [cx, cy, cr] of craters) { const dd = Math.hypot(x - cx, y - cy) / cr; if (dd < 1.25) v += dd < .8 ? -.09 : dd < 1.05 ? .1 : 0; }
      v += (hash(px >> 2, py >> 2) - .5) * .05; v *= 1 - .18 * rr;                      // a little grain, darker towards the edge
      const h = Math.sqrt(Math.max(0, 1 - y * y)), side = wax ? x : -x, t2 = (side - k * h) / .09, litK = Math.max(0, Math.min(1, t2 * .5 + .5));
      const b = .16 + .84 * litK, o = (py * D + px) * 4;                                 // the dark part keeps a faint earthshine
      d[o] = Math.min(255, 245 * v * b + 18 * (1 - litK)); d[o + 1] = Math.min(255, 240 * v * b + 22 * (1 - litK)); d[o + 2] = Math.min(255, 222 * v * b + 38 * (1 - litK)); d[o + 3] = 255 * edge * (.35 + .65 * Math.max(litK, .0)); }
    g.putImageData(im, 0, 0); return moonC; }

  S.drawSky = (c, W, OY, GY, t, SC) => {
    const g = c.createLinearGradient(0, -OY, 0, GY); g.addColorStop(0, css(S.top)); g.addColorStop(1, css(S.bot)); c.fillStyle = g; c.fillRect(0, -OY, W, GY + OY);
    const clear = 1 - clamp((cur.cover - .35) / .5);
    // stars
    const sa = clamp((S.n - .55) / .35) * clear; if (sa > .02) stars.forEach(s => { const a = sa * (.55 + .45 * Math.sin(t * s.k + s.p)); const x = Math.round(((s.x * (W + 40) - SC * .02) % (W + 40) + W + 40) % (W + 40) - 20), y = Math.round(-OY + 6 + s.y * (OY + GY - 110));
      c.fillStyle = 'rgba(255,250,235,' + a.toFixed(2) + ')'; c.fillRect(x, y, 1, 1); if (s.s > 1) { c.fillStyle = 'rgba(255,250,235,' + (a * .45).toFixed(2) + ')'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); } });
    // moon (real phase)
    const ma = clamp((S.n - .4) / .4) * clamp(1 - (cur.cover - .6) / .35); if (ma > .02) { const mx = Math.round(W * .26), my = Math.round(-OY + Math.max(36, OY * .5 + 20)), r = 9;
      c.globalAlpha = ma; const glow = c.createRadialGradient(mx, my, 4, mx, my, 34); glow.addColorStop(0, 'rgba(220,230,255,.25)'); glow.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = glow; c.fillRect(mx - 34, my - 34, 68, 68);
      const p = S.phase == null ? .45 : S.phase; c.imageSmoothingEnabled = true; c.drawImage(moonArt(p), mx - r - 1, my - r - 1, 2 * r + 2, 2 * r + 2); c.imageSmoothingEnabled = false;
      c.globalAlpha = 1; }
    // sun
    const su = clamp((S.alt + 3) / 3) * clamp(1 - (cur.cover - .55) / .35); if (su > .02) { const sx = Math.round(W * clamp(.5 + ((S.az == null ? 220 : S.az) - 180) / 200, .06, .94)), sy = Math.round(Math.max(-OY + 30, GY - 34 - S.alt * 7)), low = clamp(1 - S.alt / 12);
      c.globalAlpha = su; const hc = mix(hex('#fff6c8'), hex('#ffb060'), low), gl = c.createRadialGradient(sx, sy, 6, sx, sy, 60 + low * 40);
      gl.addColorStop(0, css(hc, .55)); gl.addColorStop(1, css(hc, 0)); c.fillStyle = gl; c.fillRect(sx - 110, sy - 110, 220, 220);
      disc(c, sx, sy, 11, css(mix(hex('#ffe58a'), hex('#ff9a3c'), low))); disc(c, sx, sy, 8, css(mix(hex('#fff8d8'), hex('#ffc070'), low))); c.globalAlpha = 1; }
    if (flock) { c.fillStyle = S.gold > .3 ? 'rgba(70,40,40,.75)' : 'rgba(40,44,56,.7)'; flock.b.forEach(b => { const x = Math.round(flock.x + b.dx * -flock.dir), y = Math.round(flock.y + b.dy), up = Math.sin(t * 9 + b.p) > 0;
      c.fillRect(x, y, 1, 1); if (up) { c.fillRect(x - 2, y - 1, 2, 1); c.fillRect(x + 1, y - 1, 2, 1); } else { c.fillRect(x - 2, y, 2, 1); c.fillRect(x + 1, y, 2, 1); } }); }
    if (kite) { const x = Math.round(kite.cx + Math.cos(kite.a) * kite.r * 1.6), y = Math.round(kite.cy + Math.sin(kite.a) * kite.r * .5), f = Math.cos(kite.a) > 0 ? 1 : -1, bank = Math.round(Math.sin(kite.a) * 1.5);
      const P = (col, a, b, w, h) => { c.fillStyle = col; c.fillRect(f > 0 ? x + a : x - a - w, y + b, w, h); };
      P('#6a3a22', -2, 0, 5, 2); P('#8a4a2a', -1, 0, 3, 1);                                   // body
      P('#5a3020', -8, -1 - bank, 6, 1); P('#5a3020', 3, -1 + bank, 6, 1); P('#2a1a12', -9, -1 - bank, 1, 1); P('#2a1a12', 9, -1 + bank, 1, 1);   // long angled wings, dark tips
      P('#b8643a', -5, 2, 3, 1); P('#b8643a', -6, 3, 1, 1); P('#b8643a', -3, 3, 1, 1);           // rusty forked tail
      P('#d8d0c0', 3, 0, 1, 1); }
    // rainbow, on the side of the sky away from the sun
    if (S.rainbow > .02) { const sx = clamp(.5 + ((S.az == null ? 220 : S.az) - 180) / 200, .06, .94), cx = W * (1 - sx), cy = GY + 90, R0 = W * 1.4;
      const cols = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6', '#bf5af2']; c.save(); c.globalAlpha = .32 * S.rainbow; c.lineWidth = 8;
      cols.forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(cx, cy, R0 - i * 8, Math.PI, 2 * Math.PI); c.stroke(); }); c.globalAlpha = .1 * S.rainbow; c.strokeStyle = '#ffffff'; c.lineWidth = 24; c.beginPath(); c.arc(cx, cy, R0 - 72, Math.PI, 2 * Math.PI); c.stroke(); c.restore(); }
    // far lightning: lights the sky only (buildings are drawn over it)
    if (S.flash > 0) { const f = S.flash > .6 ? 1 : S.flash > .45 ? .3 : S.flash; c.fillStyle = 'rgba(205,215,255,' + (f * .32).toFixed(2) + ')'; c.fillRect(0, -OY, W, GY + OY); }
    if (bolt) { c.strokeStyle = 'rgba(240,244,255,' + (1 - bolt.t * 4).toFixed(2) + ')'; c.lineWidth = 1.2; c.beginPath(); bolt.pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
  };

  // ---------- per-building extras made once from the building's picture (lights at night, settled snow) ----------
  const LRU = (n) => { const m = new Map(); return { has: k => m.has(k), get(k, make) { let v = m.get(k); if (v) { m.delete(k); m.set(k, v); return v; } v = make(k); m.set(k, v); if (m.size > n) m.delete(m.keys().next().value); return v; } }; };
  const lightsC = LRU(16), snowC = LRU(16), carN = LRU(40);
  let rs = 1; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
  const seedOf = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 2147483647; return h || 1; };
  // how each building looks at night. win: 'rooms' (separate rooms, some lit), 'whole' (one big space behind panels of glass: all on together), 'none'
  // board: light the whole sign board (not just the letters) · letters:false = no lit lettering · up: number of floodlights on the ground
  // winX / upX: part of the width (0-1) · winMaxY: only glass this close to the ground · relight: keep pale buildings from going grey
  const NIGHT = {
    galaxy: { win: 'whole', up: 3, upA: .12, upCol: [200, 220, 255] }, townhall: { up: 4, upA: .42, relight: .15 }, stmarys: { win: 'whole', wholeA: 110, winCol: [255, 200, 120], up: 3, upA: .3, upCol: [255, 185, 110] }, letters: { up: 2, upA: .25, relight: .25 },
    frasers: { win: 'whole', winX: [0, .43], wholeA: 95, letters: false }, station: { win: 'whole' }, hatfactory: { win: 'none', letters: false, up: 3, upH: .8, upA: .3 },
    chaiiwala: { win: 'whole', whiteText: [[5, 72, 125, 106]], glow: [[140, 80, 235, 102], [248, 72, 282, 104]] }, chaiikhana: { board: 1 }, spudkingz: {}, miamicrispy: { board: 1, win: 'whole' }, masjid: { up: 4, upA: .45, upCol: [225, 240, 255], relight: .12 }, masjidali: { up: 3, upA: .3, upCol: [225, 240, 255], win: 'whole', wholeA: 120, letters: false },
    suffa: { up: 2, upA: .18, upCol: [225, 240, 255] }, gurdwara: { up: 4, upA: .4, upCol: [255, 205, 110], relight: .12 }, ldh: {}, lutonhoo: { up: 5, upA: .5, upCol: [255, 210, 150], relight: .1 }, foodbank: { win: 'whole' }, inspire: { win: 'whole', letters: false },
    nadeem: { relight: .3, winMinY: 56, board: 1, glow: [[0, 118, 150, 152]], curtains: 1 }, oak: { letters: false }, periperi: { board: 1, win: 'whole' }, toros: {}, cycleking: { board: 1 }, gna: { board: 1 }, kahwa: { enclosed: 1 }, leagrave: { letters: false },
    topspizza: { board: 1, lit: [[0, 46, 180, 68]], whiteText: [[56, 56, 180, 68]] }, alquds: { board: 1 }, kaya: {}, karwan: { board: 1 }, krispy: { board: 1, onlyTop: true },
    tesco: { win: 'whole', board: 1 }, smr: { win: 'rooms', letters: false, maxBoardH: 1 }, currys: { win: 'whole', board: 1, boardMinH: 75, warm: [[110, 22, 135, 39, 0], [160, 29, 176, 39, 110], [221, 35, 247, 54, 0], [288, 41, 301, 52, 110]] }, bandq: { win: 'whole', board: 1, lit: [[166, 96, 274, 140]], whiteText: [[166, 96, 274, 140]] }, matalan: { win: 'whole', board: 1 }, lidl: { win: 'whole', board: 1 },
    jdgyms: { win: 'whole' }, bigyellow: {}, grandbazar: { win: 'whole', board: 1, wholeA: 120 }, lewsey: { win: 'whole' }, venue: { up: 4, upA: .45, upCol: [255, 200, 150], relight: .1 }, chiltern: { board: 1, curtains: 1, whiteText: [[98, 43, 268, 69]] },
    uob: { up: 2, upA: .18, upCol: [220, 230, 255] }, sixthform: { win: 'whole', letters: false }, marshfarm: { letters: false, minWin: 6, warmOnly: 1 }, orbital: { win: 'whole', winMinY: 70 }, wardown: { up: 1, upX: [.4, .75], upH: .6, upA: .15 }, stockwood: { up: 3, upA: .25 }, welcome: { up: 2, upA: .3 }, airport: { win: 'whole', winMaxY: 62 } };
  const LANDMARKS_KEYS = window.LANDMARKS || {};
  const isGlass = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return b > r + 18 && b >= g - 8 && mx > 85 && mx < 236 && (mx - mn) / mx < .52; };

  function makeLights(sp) { const W0 = sp.c.width, H0 = sp.c.height, src = sp.c.getContext('2d').getImageData(0, 0, W0, H0).data;
    const cfg = NIGHT[sp.k] || {}, house = !LANDMARKS_KEYS[sp.k], N = W0 * H0, gy = H0 - 6, bx0 = (W0 - sp.w) / 2;
    const out = new ImageData(W0, H0), o = out.data, glass = new Uint8Array(N), used = new Uint8Array(N);
    const lum = i => { const j = i * 4; return src[j + 3] > 200 ? Math.max(src[j], src[j + 1], src[j + 2]) : -1; };
    const setp = (i, c, a) => { const j = i * 4; o[j] = c[0]; o[j + 1] = c[1]; o[j + 2] = c[2]; o[j + 3] = a; };
    for (let i = 0; i < N; i++) { const j = i * 4; if (src[j + 3] > 200 && isGlass(src[j], src[j + 1], src[j + 2])) glass[i] = 1; }
    const inX = (x, r) => !r || (x >= bx0 + sp.w * r[0] && x <= bx0 + sp.w * r[1]);
    // ---- signs: find sign boards (a solid dark or coloured panel with lighter lettering on it) ----
    const boards = [], stack = [];
    if (cfg.letters !== false && LANDMARKS_KEYS[sp.k]) { const vis = new Uint8Array(N);
      for (let i = 0; i < N; i++) { if (vis[i] || src[i * 4 + 3] < 200 || glass[i]) continue; const j = i * 4, r = src[j], g = src[j + 1], b = src[j + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const dark = mx < 90, sat = mx >= 100 && (mx - mn) / mx > .45, pale = mn > 205; if (!dark && !sat && !pale) { vis[i] = 1; continue; }
        const comp = []; stack.push(i); vis[i] = 1;
        while (stack.length) { const p = stack.pop(); comp.push(p); const x = p % W0; for (const nb of [p - 1, p + 1, p - W0, p + W0]) { if (nb < 0 || nb >= N || vis[nb] || Math.abs((nb % W0) - x) > 1) continue; const k = nb * 4;
          if (src[k + 3] < 200) continue; if (Math.abs(src[k] - r) + Math.abs(src[k + 1] - g) + Math.abs(src[k + 2] - b) > 60) continue; vis[nb] = 1; stack.push(nb); } }
        if (comp.length < 50) continue; let y0 = 1e9, y1 = 0, x0 = 1e9, x1 = 0; comp.forEach(p => { const y = (p / W0) | 0, x = p % W0; if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; });
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1; if (bw < 14 || bh < 5 || bh > (cfg.maxBoardH || 40) || bw < bh * 1.2) continue;
        const inC = new Set(comp), bl = mx; let op = 0; const text = [];
        // enclosed: only count lettering that has the board both above and below it (so wall above a sign that sticks up isn't lit)
        let cTop = null, cBot = null; if (cfg.enclosed) { cTop = {}; cBot = {}; comp.forEach(p => { const x = p % W0, y = (p / W0) | 0; if (cTop[x] == null || y < cTop[x]) cTop[x] = y; if (cBot[x] == null || y > cBot[x]) cBot[x] = y; }); }
        const all = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const q = y * W0 + x; if (src[q * 4 + 3] > 200) op++; if (inC.has(q)) continue; if (cTop && !(cTop[x] < y && cBot[x] > y)) continue; if (src[q * 4 + 3] < 200) continue; /* see-through pixels in a sign's box are never filled in black */ all.push(q); if (glass[q]) continue; const l = lum(q); if (l > bl + 38 || (l > 200 && dark) || (pale && l >= 0 && l < bl - 40)) text.push(q); }
        { let tx0 = 1e9, tx1 = 0, ty0 = 1e9, ty1 = 0; text.forEach(q => { const x = q % W0, y = (q / W0) | 0; if (x < tx0) tx0 = x; if (x > tx1) tx1 = x; if (y < ty0) ty0 = y; if (y > ty1) ty1 = y; });
          if (ty1 - ty0 < 3) continue; }   // a thin line (a kerb, a trim) isn't lettering
        if (op < bw * bh * .9 || text.length < 6 || text.length > bw * bh * .45 || comp.length < bw * bh * .3) continue;
        boards.push({ comp, text, all, y0, y1, x0, x1, dark, pale }); } }
    // nothing inside a sign is ever mistaken for a window
    const prot = new Uint8Array(N); boards.forEach(bd => { if (bd.pale) { bd.all.forEach(p => { const j = p * 4, mx = Math.max(src[j], src[j + 1], src[j + 2]), mn = Math.min(src[j], src[j + 1], src[j + 2]); if (!(mx > 165 && (mx - mn) / mx < .09)) prot[p] = 1; }); return; } bd.comp.forEach(p => prot[p] = 1); bd.all.forEach(p => prot[p] = 1); });
    // ---- windows ----
    rs = seedOf(sp.k || 'x'); const seen = new Uint8Array(N), mode = cfg.win || 'rooms';
    if (mode !== 'none') for (let i = 0; i < N; i++) { if (!glass[i] || seen[i] || prot[i]) continue; const comp = []; stack.push(i); seen[i] = 1;
      while (stack.length) { const p = stack.pop(); comp.push(p); const x = p % W0; [p - 1, p + 1, p - W0, p + W0].forEach(nb => { if (nb >= 0 && nb < N && !seen[nb] && glass[nb] && Math.abs((nb % W0) - x) <= 1) { seen[nb] = 1; stack.push(nb); } }); }
      let y0 = 1e9, y1 = 0, x0 = 1e9, x1 = 0; comp.forEach(p => { const y = (p / W0) | 0, x = p % W0; if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; });
      if (x1 - x0 < 2 || y1 - y0 < 2 || comp.length / ((x1 - x0 + 1) * (y1 - y0 + 1)) < .55) continue;
      // real glass is mostly one flat colour; soft-edged lettering (blue-grey blends) isn't a window
      { const cnt = new Map(); let best = 0; comp.forEach(p => { const j = p * 4, k = (src[j] << 16) | (src[j + 1] << 8) | src[j + 2], v = (cnt.get(k) || 0) + 1; cnt.set(k, v); if (v > best) best = v; }); if (comp.length < (cfg.minWin || 26) || x1 - x0 < (cfg.minWin ? 1 : 3) || y1 - y0 < (cfg.minWin ? 2 : 3) || best < comp.length * .45) continue; }
      if (!inX((x0 + x1) / 2, cfg.winX) || (cfg.winMaxY && gy - y0 > cfg.winMaxY) || (cfg.winMinY && gy - y0 < cfg.winMinY)) continue;   // winMinY: leave the shop floor to the shop's own lighting
      let col, a;
      if (mode === 'whole') { col = cfg.winCol || [255, 226, 168]; a = cfg.wholeA || 150; }      // one big lit space behind panels of glass: all on, all the same
      else { if (rnd() > .62) continue; const pick = rnd(); col = house || cfg.warmOnly ? [255, 214, 130] : pick < .55 ? [255, 214, 130] : pick < .85 ? [255, 228, 170] : [236, 240, 255]; a = 235; }   // houses: every lit room the same warm yellow
      comp.forEach(p => { const y = (p / W0) | 0, sh = 1 - .16 * (y - y0) / Math.max(1, y1 - y0); setp(p, [col[0] * sh, col[1] * sh, col[2] * sh], a); used[p] = 1; }); }
    let use = boards.filter(b => !b.pale && !(cfg.boardMinH && gy - b.y1 < cfg.boardMinH * ((window.SCALE && window.SCALE[sp.k]) || 1))); if (cfg.onlyTop && boards.length) { const t = Math.min(...boards.map(b => b.y0)); use = boards.filter(b => b.y0 === t); }
    if (cfg.noBoardX) use = use.filter(b => !inX((b.x0 + b.x1) / 2, cfg.noBoardX));
    // a lit sign keeps exactly its daytime look (same letters, same colours, nothing redrawn): the board and/or its lettering simply aren't darkened
    const orig = (p, a) => { const j = p * 4; setp(p, [src[j], src[j + 1], src[j + 2]], a); };
    const bright = p => { const j = p * 4; setp(p, [Math.min(255, src[j] * 1.12 + 10), Math.min(255, src[j + 1] * 1.12 + 10), Math.min(255, src[j + 2] * 1.12 + 10)], 255); };
    const whiter = (p, k) => { const j = p * 4; setp(p, [src[j] + (255 - src[j]) * k, src[j + 1] + (255 - src[j + 1]) * k, src[j + 2] + (255 - src[j + 2]) * k], 255); };
    use.forEach(bd => { if (cfg.board) bd.comp.forEach(bright); bd.all.forEach(p => orig(p, 255)); bd.text.forEach(p => whiter(p, .35)); if (cfg.textBoost) bd.text.forEach(p => { const j = p * 4; if (Math.min(src[j], src[j + 1], src[j + 2]) > 150) setp(p, [255, 255, 255], 255); }); });
    // lettering painted straight on a wall (no board), lit like illuminated letters
    const SC = (window.SCALE && window.SCALE[sp.k]) || 1;
    // a whole panel lit from behind: kept at its daytime colour
    (cfg.lit || []).forEach(([a, b, c2, d2]) => { const X0 = Math.round(bx0 + a * SC), X1 = Math.round(bx0 + c2 * SC), Y0 = Math.round(gy - d2 * SC), Y1 = Math.round(gy - b * SC);
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const q = y * W0 + x; if (src[q * 4 + 3] > 200) bright(q); } });
    // windows inside parked vans and food trucks: a soft warm light from inside
    (cfg.warm || []).forEach(([a, b, c2, d2, al]) => { const X0 = Math.round(bx0 + a * SC), X1 = Math.round(bx0 + c2 * SC), Y0 = Math.round(gy - d2 * SC), Y1 = Math.round(gy - b * SC);
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const q = y * W0 + x, j = q * 4; if (src[j + 3] < 200) continue; const l = Math.max(src[j], src[j + 1], src[j + 2]);
        if (l < 90) setp(q, [255, 214, 150], al || 120); else setp(q, [Math.min(255, src[j] * 1.1 + 10), Math.min(255, src[j + 1] * 1.08 + 8), Math.min(255, src[j + 2] + 4)], 235); } });
    (cfg.glow || []).forEach(([a, b, c2, d2]) => { const X0 = Math.round(bx0 + a * SC), X1 = Math.round(bx0 + c2 * SC), Y0 = Math.round(gy - d2 * SC), Y1 = Math.round(gy - b * SC);
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const q = y * W0 + x, j = q * 4; if (src[j + 3] < 200) continue; const r = src[j], g = src[j + 1], bb = src[j + 2], mx = Math.max(r, g, bb), mn = Math.min(r, g, bb);
        if (mx > 150 && (mx - mn) / mx > .55) setp(q, [r + (255 - r) * .22, g + (255 - g) * .22, bb + (255 - bb) * .22], 255); } });
    (cfg.whiteText || []).forEach(([a, b, c2, d2]) => { const X0 = Math.round(bx0 + a * SC), X1 = Math.round(bx0 + c2 * SC), Y0 = Math.round(gy - d2 * SC), Y1 = Math.round(gy - b * SC);
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const q = y * W0 + x, j = q * 4; if (src[j + 3] < 200) continue; const mn = Math.min(src[j], src[j + 1], src[j + 2]); if (mn > 120) { const k = Math.min(1, (mn - 120) / 60); setp(q, [255, 255, 255], Math.round(255 * k)); } } });
    // curtained windows (hotels, flats): some lit through the curtains, some just a glow at the edges and the gap, the rest closed and dark
    if (cfg.curtains) { const cv = new Uint8Array(N); rs = seedOf((sp.k || 'c') + 'cur');
      const isC = q => { const j = q * 4; if (src[j + 3] < 200 || o[j + 3]) return false; const r = src[j], g = src[j + 1], b = src[j + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx > 165 && (mx - mn) / mx < .09; };
      for (let i = 0; i < N; i++) { if (cv[i] || prot[i] || !isC(i)) continue; const comp = []; stack.push(i); cv[i] = 1;
        while (stack.length) { const p = stack.pop(); comp.push(p); const x = p % W0; for (const nb of [p - 1, p + 1, p - W0, p + W0]) if (nb >= 0 && nb < N && !cv[nb] && !prot[nb] && Math.abs((nb % W0) - x) <= 1 && isC(nb)) { cv[nb] = 1; stack.push(nb); } }
        if (comp.length < 30 || comp.length > 1400) continue; let y0 = 1e9, y1 = 0, x0 = 1e9, x1 = 0; comp.forEach(p => { const y = (p / W0) | 0, x = p % W0; if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; });
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1; if (comp.length < bw * bh * .7 || bw > 40 || bh > 60) continue;
        const k = rnd(), mid = Math.round((x0 + x1) / 2);
        comp.forEach(p => { const x = p % W0, y = (p / W0) | 0, j = p * 4;
          if (k < .3) { const v = 1 - .12 * (y - y0) / bh; setp(p, [255 * v, 222 * v, 160 * v], 230); }                                     // lit room, light through the curtain
          else if (k < .55) { const edge = x === x0 || x === x1 || Math.abs(x - mid) <= 0 || y === y1; setp(p, edge ? [255, 210, 140] : [52, 48, 54], edge ? 220 : 150); }   // glow round the edges / gap
          else setp(p, [40, 42, 54], 150); }); } }                                                                                 // closed, dark

    const lc = document.createElement('canvas'); lc.width = W0; lc.height = H0; lc.getContext('2d').putImageData(out, 0, 0);
    const fc = document.createElement('canvas'); fc.width = W0; fc.height = H0; const f = fc.getContext('2d');
    // some buildings are pale (cream, white stone) and shouldn't go grey at night: lift them back a little
    if (cfg.relight) { f.globalAlpha = cfg.relight; f.drawImage(sp.c, 0, 0); f.globalAlpha = 1; }
    // floodlights: two to four lamps on the ground washing the front with warm light
    if (cfg.up) { let top = H0; for (let y = 0; y < H0 && top === H0; y++) for (let x = 0; x < W0; x += 2) if (src[(y * W0 + x) * 4 + 3] > 60) { top = y; break; }
      const bh = Math.max(40, gy - top), r = cfg.upX || [0, 1], ux0 = bx0 + sp.w * r[0], uw = sp.w * (r[1] - r[0]), nL = cfg.up;
      const mk = document.createElement('canvas'); mk.width = W0; mk.height = H0; const m = mk.getContext('2d'); m.globalCompositeOperation = 'lighter';
      const xs = [], rad = Math.min(70, uw / nL * .8); for (let i = 0; i < nL; i++) { const cx = ux0 + uw * (i + .5) / nL; xs.push(cx); m.save(); m.translate(cx, gy); m.scale(1, bh * (cfg.upH || .95) / rad); const rg = m.createRadialGradient(0, 0, 2, 0, 0, rad);
        rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(.55, 'rgba(255,255,255,.45)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); m.fillStyle = rg; m.fillRect(-rad, -rad, rad * 2, rad); m.restore(); }
      const uc = document.createElement('canvas'); uc.width = W0; uc.height = H0; const u = uc.getContext('2d'); u.drawImage(sp.c, 0, 0); u.globalCompositeOperation = 'destination-in'; u.drawImage(mk, 0, 0);
      const uC = cfg.upCol || [255, 200, 130]; u.globalCompositeOperation = 'source-atop'; u.fillStyle = 'rgba(' + uC.join(',') + ',.3)'; u.fillRect(0, 0, W0, H0);
      f.drawImage(uc, 0, 0); f.globalCompositeOperation = 'lighter'; f.globalAlpha = cfg.upA == null ? .28 : cfg.upA; f.drawImage(uc, 0, 0); f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1; f.fillStyle = '#3a3d44'; xs.forEach(cx => f.fillRect(Math.round(cx) - 3, gy - 3, 6, 3)); f.fillStyle = 'rgba(255,240,200,.95)'; xs.forEach(cx => f.fillRect(Math.round(cx) - 2, gy - 4, 4, 1)); }
    // a soft glow behind the lights (the lights themselves stay sharp on top)
    const sm = document.createElement('canvas'); sm.width = Math.ceil(W0 / 6); sm.height = Math.ceil(H0 / 6); const sx = sm.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(lc, 0, 0, sm.width, sm.height);
    f.imageSmoothingEnabled = true; f.globalAlpha = .32; f.drawImage(sm, 0, 0, W0, H0); f.globalAlpha = .16; f.drawImage(sm, -2, -2, W0 + 4, H0 + 4);
    f.globalAlpha = 1; f.imageSmoothingEnabled = false; f.drawImage(lc, 0, 0); return fc; }

  function n2(x, y, s) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, h = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); return (h(ix, iy) * (1 - ux) + h(ix + 1, iy) * ux) * (1 - uy) + (h(ix, iy + 1) * (1 - ux) + h(ix + 1, iy + 1) * ux) * uy; }
  function noise(x, s) { const i = Math.floor(x), fr = x - i, h = n => { let v = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); }; const u = fr * fr * (3 - 2 * fr); return h(i) * (1 - u) + h(i + 1) * u; }
  function makeSnow(sp) { const W0 = sp.c.width, H0 = sp.c.height, src = sp.c.getContext('2d').getImageData(0, 0, W0, H0).data, out = new ImageData(W0, H0), o = out.data, sd = seedOf(sp.k || 's') % 1000;
    const A = (x, y) => x < 0 || x >= W0 || y < 0 || y >= H0 ? 0 : src[(y * W0 + x) * 4 + 3] > 60;
    const put = (x, y, c) => { if (x < 0 || x >= W0 || y < 0 || y >= H0) return; const j = (y * W0 + x) * 4; o[j] = c[0]; o[j + 1] = c[1]; o[j + 2] = c[2]; o[j + 3] = 255; };
    const WH = [255, 255, 255], MID = [236, 242, 250], SH = [196, 210, 228];
    for (let x = 0; x < W0; x++) { for (let y = 1; y < H0 - 8; y++) { if (!A(x, y) || A(x, y - 1)) continue;
      // a top surface: skip steep sides, patchy depth so it sits only in places
      if (A(x - 1, y - 3) || A(x + 1, y - 3)) continue;
      const nz = noise(x / 9 + y * .07, sd) * .75 + noise(x / 31, sd + 5) * .45; let d = nz < .24 ? 0 : nz < .38 ? 2 : nz < .56 ? 3 : nz < .76 ? 4 : 5;
      if (A(x - 1, y - 2) || A(x + 1, y - 2)) d = Math.min(d, 3);
      for (let k = 0; k < d; k++) if (A(x, y + k)) put(x, y + k, k === 0 ? WH : k === d - 1 && d > 1 ? SH : MID);
      if (d >= 4 && !A(x - 1, y - 1) && !A(x + 1, y - 1)) put(x, y - 1, WH); } }
    // window sills
    for (let y = 0; y < H0 - 1; y++) for (let x = 0; x < W0; x++) { const j = (y * W0 + x) * 4, jb = j + W0 * 4; if (src[j + 3] < 200 || src[jb + 3] < 200) continue;
      if (isGlass(src[j], src[j + 1], src[j + 2]) && !isGlass(src[jb], src[jb + 1], src[jb + 2]) && noise(x / 7 + y, sd + 9) > .45) put(x, y + 1, WH); }
    // smooth it: the blocky 1-pixel snow is grown to 3x detail with soft rounded edges, kept on the building, then shaded
    const K = 3, m1 = document.createElement('canvas'); m1.width = W0; m1.height = H0; m1.getContext('2d').putImageData(out, 0, 0);
    const c = document.createElement('canvas'); c.width = W0 * K; c.height = H0 * K; const cx = c.getContext('2d'); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.drawImage(m1, 0, 0, c.width, c.height);
    const CW = c.width, CH = c.height, im = cx.getImageData(0, 0, CW, CH), d = im.data, on = new Uint8Array(CW * CH);
    const A1 = (x, y) => { x = (x / K) | 0; y = (y / K) | 0; return x >= 0 && x < W0 && y >= 0 && y < H0 && src[(y * W0 + x) * 4 + 3] > 60; };
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const i = y * CW + x; if (d[i * 4 + 3] > 100 && (A1(x, y) || A1(x, y + 2))) on[i] = 1; }
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const i = y * CW + x, j = i * 4; if (!on[i]) { d[j + 3] = 0; continue; }
      const up = y > 0 && on[i - CW], dn = y < CH - 1 && on[i + CW], dn2 = y < CH - 2 && on[i + CW * 2];
      const col = !up ? [255, 255, 255] : !dn ? [182, 198, 222] : !dn2 ? [214, 225, 240] : [240, 245, 252]; d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; d[j + 3] = 255; }
    cx.putImageData(im, 0, 0); c.K = K; return c; }
  // made in the background a little ahead of time (one at a time), so a new building never makes the game stutter;
  // only something already on screen with nothing ready is made straight away (at most one a frame)
  const todo = []; let busy = false, syncUsed = 0;
  const pump = () => { busy = false; const j = todo.shift(); if (!j) return; (j[0] === 'l' ? lightsC : snowC).get(j[1], j[0] === 'l' ? makeLights : makeSnow); if (todo.length) { busy = true; setTimeout(pump, 60); } };
  const want = (kind, sp, onScreen) => { const C = kind === 'l' ? lightsC : snowC; if (C.has(sp)) return C.get(sp);
    if (onScreen && syncUsed < 1) { syncUsed++; return C.get(sp, kind === 'l' ? makeLights : makeSnow); }
    if (!todo.some(j => j[0] === kind && j[1] === sp)) todo.push([kind, sp]); if (!busy) { busy = true; setTimeout(pump, 30); } return null; };
  S.frame = () => { syncUsed = 0; };
  S.lightsNow = sp => lightsC.get(sp, makeLights);
  S.lights = (sp, on) => want('l', sp, on);
  S.snow = (sp, on) => want('s', sp, on);
  S.ahead = (list, W) => { if (S.season() !== 'summer') { const l = list.find(l => l.x < W + 700 && !(seasonC.has(l.sp) && seasonC.get(l.sp, () => ({}))[S.season()])); if (l) S.seasonal(l.sp, true); }
    if (S.n > .05 || cur.snow > .05 || S.snowAcc > .02) list.forEach(l => { if (l.x < W + 700) { if (S.n > .05) want('l', l.sp, false); if (S.snowAcc > .02 || cur.snow > .05) want('s', l.sp, false); } }); };
  // vehicle windows at night: a soft warm glow from inside (brighter on buses and coaches, faint in cars)
  const carW = LRU(40);
  S.carWin = (cnv, sp, flip) => carW.get(cnv, () => { const c = document.createElement('canvas'); c.width = cnv.width; c.height = cnv.height; const x = c.getContext('2d');
    if (flip) { x.translate(c.width, 0); x.scale(-1, 1); }
    const big = sp.k === 'bus' || sp.k === 'coach', polys = sp.gl || []; let area = 0;
    polys.forEach(pts => { x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); const g = x.createLinearGradient(0, Math.min(...pts.map(q => q[1])), 0, Math.max(...pts.map(q => q[1])));
      g.addColorStop(0, big ? 'rgba(255,236,190,.75)' : 'rgba(255,226,170,.28)'); g.addColorStop(1, big ? 'rgba(255,214,150,.55)' : 'rgba(255,214,150,.12)'); x.fillStyle = g; x.fill(); });
    if (big) { // bus / coach side windows: the dark glass along the top half of the body
      const W0 = cnv.width, H0 = cnv.height, d = cnv.getContext('2d').getImageData(0, 0, W0, H0).data, out = x.getImageData(0, 0, W0, H0), o = out.data; let top = H0, bot = 0;
      for (let y = 0; y < H0; y++) for (let xx = 0; xx < W0; xx += 3) if (d[(y * W0 + xx) * 4 + 3] > 60) { if (y < top) top = y; if (y > bot) bot = y; }
      const yl = top + (bot - top) * .5;
      for (let y = top; y < yl; y++) for (let xx = 0; xx < W0; xx++) { const j = (y * W0 + xx) * 4, r = d[j], g = d[j + 1], b = d[j + 2]; if (d[j + 3] < 200) continue;
        if (Math.max(r, g, b) < 70 && b >= r - 2) { o[j] = 255; o[j + 1] = 228; o[j + 2] = 170; o[j + 3] = 150; } }
      x.setTransform(1, 0, 0, 1, 0, 0); x.putImageData(out, 0, 0); }
    return c; });
  // ---------- seasons: trees change with the real date (spring blossom, summer green, autumn colours, bare in winter) ----------
  // ---------- prayer times for Luton (worked out on the phone: Fajr 18°, Isha 17°, Asr Hanafi; 1/7 of the night when the sun never gets low enough in summer) ----------
  S.prayers = (date) => { const d0 = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12), d = d0 / 864e5 - 10957.5;
    const g = (357.529 + .98560028 * d) * RD, ql = 280.459 + .98564736 * d, L = (ql + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)) * RD, e = (23.439 - 3.6e-7 * d) * RD;
    const dec = Math.asin(Math.sin(e) * Math.sin(L)), ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RD / 15, eqt = ((ql / 15 - ((ra % 24) + 24) % 24) % 24 + 36) % 24 - 12;
    const noon = 12 - LON / 15 - eqt, ph = LAT * RD;
    const H = alt => { const c = (Math.sin(alt * RD) - Math.sin(ph) * Math.sin(dec)) / (Math.cos(ph) * Math.cos(dec)); return c < -1 || c > 1 ? null : Math.acos(c) / RD / 15; };
    const hs = H(-.833), rise = noon - hs, set = noon + hs, night = 24 - (set - rise);
    const hf = H(-18), hi = H(-17), fajr = hf != null && noon - hf > rise - night / 7 ? noon - hf : rise - night / 7, isha = hi != null && noon + hi < set + night / 7 ? noon + hi : set + night / 7;
    const asr = noon + H(Math.atan(1 / (2 + Math.tan(Math.abs(ph - dec)))) / RD);
    const at = h => d0 - 12 * 36e5 + h * 36e5; return { fajr: at(fajr), dhuhr: at(noon + 2 / 60), asr: at(asr), maghrib: at(set + 1 / 60), isha: at(isha) }; };
  // adhan time: the 15 minutes leading up to each prayer, until it starts (?prayer=isha to try it any time)
  S.adhanNow = () => { const f = q.get('prayer'); if (f) return /^(fajr|dhuhr|asr|maghrib|isha)$/.test(f) ? f : 'isha'; const now = Date.now(), p = S.prayers(new Date()); for (const k in p) if (now >= p[k] - 15 * 6e4 && now < p[k] + 60e3) return k; return ''; };
  S.seasonOf = (date) => { const m = date.getMonth() + 1, d = date.getDate();
    if (m === 12 || m <= 2) return 'winter'; if (m === 3 && d < 15) return 'winter'; if (m === 3 || m === 4) return 'spring'; if (m >= 5 && m <= 8) return 'summer';
    if (m === 9 && d < 20) return 'summer'; if (m === 9 || m === 10) return 'autumn'; return 'lateautumn'; };
  S.season = () => S.forceSeason || (q.get('season')) || S.seasonOf(new Date());
  // how far the trees have turned (0 = all green, 1 = fully orange), stepping up once a week from 20 Sep to the end of Nov (?turn=.5 to preview)
  const dayOf = (d, m, dd) => (Date.UTC(d.getFullYear(), m - 1, dd));
  S.turn = (date) => { const f = parseFloat(q.get('turn')); if (f >= 0) return f; const d = date || new Date(), t0 = dayOf(d, 9, 20), t1 = dayOf(d, 11, 30), now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    if (now < t0) return .1; if (now > t1) return .9; const wk = Math.floor((now - t0) / 6048e5), W = (t1 - t0) / 6048e5, p = Math.min(1, wk / W); return .1 + .75 * p * p; };
  // grass, hedges and shrubs drying out through the winter: nothing until 25 Nov, then a little more straw/brown each week, greening up again Mar-Apr (?dry=.3 to preview)
  S.dry = (date) => { const f = parseFloat(q.get('dry')); if (f >= 0) return f; const d = date || new Date(), y = d.getFullYear(), now = Date.UTC(y, d.getMonth(), d.getDate()), m = d.getMonth() + 1;
    const start = m >= 6 ? Date.UTC(y, 10, 25) : Date.UTC(y - 1, 10, 25); if (now < start) return 0; const wk = Math.floor((now - start) / 6048e5);
    const peak = Math.min(.5, wk * .045); const mar1 = Date.UTC(m >= 6 ? y + 1 : y, 2, 1), apr30 = Date.UTC(m >= 6 ? y + 1 : y, 3, 30);
    if (now < mar1) return peak; if (now > apr30) return 0; const left = Math.max(0, Math.ceil((apr30 - now) / 6048e5)), tot = Math.ceil((apr30 - mar1) / 6048e5); return Math.min(.5, Math.floor((mar1 - start) / 6048e5) * .045) * left / tot; };
  const DRY_STRAW = [184, 166, 92], DRY_BROWN = [146, 114, 64], dryC = {};
  // a ground colour (grass, lawn stripes) dried by today's amount; brown = 0..1 how much of the mix is brown rather than straw
  S.dryCol = (hex, brown) => { const k = hex + (brown || 0); if (dryC[k]) return dryC[k]; const dr = S.dry(); if (!dr) return (dryC[k] = hex);
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), bb = parseInt(hex.slice(5, 7), 16), rel = (r + g + bb) / 330, bw = brown || .3;
    const tr = (DRY_STRAW[0] * (1 - bw) + DRY_BROWN[0] * bw) * rel, tg = (DRY_STRAW[1] * (1 - bw) + DRY_BROWN[1] * bw) * rel, tb = (DRY_STRAW[2] * (1 - bw) + DRY_BROWN[2] * bw) * rel;
    const h2 = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); return (dryC[k] = '#' + h2(r + (tr - r) * dr) + h2(g + (tg - g) * dr) + h2(bb + (tb - bb) * dr)); };
  const seasonC = LRU(24);
  function makeSeason(sp, sea) { const W0 = sp.c.width, H0 = sp.c.height, cx = sp.c.getContext('2d'), im = cx.getImageData(0, 0, W0, H0), d = im.data, N = W0 * H0;
    const green = new Uint8Array(N); for (let i = 0; i < N; i++) { const j = i * 4; if (d[j + 3] < 200) continue; const r = d[j], g = d[j + 1], b = d[j + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx < 40 || mx > 235) continue;
      const sat = (mx - mn) / mx; if (sat < .22 || g < r || g < b - 10) continue; let h; { const dd = mx - mn; h = mx === g ? 60 * ((b - r) / dd + 2) : mx === b ? 60 * ((r - g) / dd + 4) : 60 * (((g - b) / dd) % 6); } if (h > 68 && h < 165) green[i] = 1; }
    const seen = new Uint8Array(N), st = []; rs = seedOf((sp.k || 't') + sea); let any = false; const branches = [], canopies = []; const DRY = S.dry(), TURN = S.turn();
    for (let i = 0; i < N; i++) { if (!green[i] || seen[i]) continue; const comp = []; st.push(i); seen[i] = 1;
      while (st.length) { const p = st.pop(); comp.push(p); const x = p % W0; for (const nb of [p - 1, p + 1, p - W0, p + W0]) if (nb >= 0 && nb < N && !seen[nb] && green[nb] && Math.abs((nb % W0) - x) <= 1) { seen[nb] = 1; st.push(nb); } }
      const tiny = comp.length < 20; if (tiny && TRUNKLESS[sp.k] !== 1) continue; let y0 = 1e9, y1 = 0, x0 = 1e9, x1 = 0; comp.forEach(p => { const y = (p / W0) | 0, x = p % W0; if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; });
      const w = x1 - x0 + 1, h = y1 - y0 + 1, fill = comp.length / (w * h);
      const isTree = () => { if (comp.length < 110) return false; if (w < 8 || h < 8 || fill > .86 || fill < .4 || w > h * 2.6) return false;     // round-ish canopies only (no hedges, lawns, signs)
        if (fill < .62 && h > w * 1.15) return false;                                                                                           // conifers stay green
        { let top = 0; for (let x = x0; x <= x1; x++) if (green[y0 * W0 + x]) top++; if (top > w * .6) return false; }                          // flat top edge = a sign or hedge
        if (TRUNKLESS[sp.k]) return true;
        // only real trees: a brown trunk just under (or inside the bottom of) the crown; produce, signs and green domes stay as they are
        const cx = (x0 + x1) >> 1, rx = Math.max(2, w / 3 | 0); for (let y = y1 - 3; y <= y1 + 5; y++) for (let x = cx - rx; x <= cx + rx; x++) { if (x < 0 || x >= W0 || y < 0 || y >= H0) continue; const j = (y * W0 + x) * 4; if (d[j + 3] < 200) continue;
          const r = d[j], g = d[j + 1], b = d[j + 2]; if (r > g + 12 && g > b + 4 && r > 55 && r < 150 && g < 110) return true; } return false; };
      // pieces of a park tree cut off by things in front of it (a swing frame, pillars) change with the rest of that tree
      const dryIt = () => { if (!DRY || NODRY[sp.k] || tiny) return; const cols = new Map(); comp.forEach(p => { const j = p * 4, key = (d[j] >> 3) << 10 | (d[j + 1] >> 3) << 5 | (d[j + 2] >> 3); cols.set(key, (cols.get(key) || 0) + 1); });
        const sorted = [...cols.values()].sort((a, b) => b - a), textured = sorted.length > 1 && sorted[1] > comp.length * .08, ground = y1 >= H0 - 14; if (!textured && !ground) return;
        let ml = 0; comp.forEach(p => { const j = p * 4; ml += d[j] + d[j + 1] + d[j + 2]; }); ml /= comp.length; any = true;
        comp.forEach(p => { const j = p * 4, x = p % W0, y = (p / W0) | 0, rel = Math.min(1.4, (d[j] + d[j + 1] + d[j + 2]) / ml) * ml / 330, bw = .15 + n2(x / 4, y / 4, 5) * .6;
          for (let c = 0; c < 3; c++) { const tgt = (DRY_STRAW[c] * (1 - bw) + DRY_BROWN[c] * bw) * rel; d[j + c] = Math.max(0, Math.min(255, d[j + c] + (tgt - d[j + c]) * DRY)); } }); };
      let forced = null; if (!isTree()) { const TL = TRUNKLESS[sp.k]; if (!TL) { dryIt(); continue; }
        if (TL === 2 && y1 < H0 - 12) forced = canopies[0] || { pal: [214, 120, 40], tt: TURN };
        else if (TL === 1) { const rect = green[y0 * W0 + x0] + green[y0 * W0 + x1] + green[y1 * W0 + x0] + green[y1 * W0 + x1] >= 3 && w >= 20 && h >= 10 || fill > .75 && w >= h * 4 && w >= 12;   /* or a flat strip of grass: lawns stay green until the grass itself turns */   /* a sign board or a wall, not part of a crown */
          const m = tiny ? 0 : 6, hit = !rect && canopies.find(c => x0 <= c.x1 + m && x1 >= c.x0 - m && y0 <= c.y1 + m && y1 >= c.y0 - m); if (hit) forced = hit; }
        if (!forced) { dryIt(); continue; } }
      let ml = 0; comp.forEach(p => { const j = p * 4; ml += d[j] + d[j + 1] + d[j + 2]; }); ml /= comp.length;                                                                   // evergreens stay green
      any = true; const pick = rnd(), pal = forced ? forced.pal : (pick < .4 ? [214, 120, 40] : pick < .7 ? [196, 72, 38] : pick < .9 ? [222, 170, 52] : [150, 96, 52]), tt = forced ? forced.tt : Math.max(.05, Math.min(1, TURN + (rnd() - .5) * .55)), thin = .36 * Math.max(0, Math.min(1, (tt - .6) / .3)); if (!forced) canopies.push({ x0, x1, y0, y1, pal, tt });
      comp.forEach(p => { const j = p * 4, r = d[j], g = d[j + 1], b = d[j + 2], rel = Math.min(1.45, (r + g + b) / ml), x = p % W0, y = (p / W0) | 0;
        const nz = n2(x / 3, y / 3, 7) * .65 + n2(x / 8, y / 8, 3) * .35;          // clumpy, not stripy
        if (sea === 'spring') { d[j] = Math.min(255, r * .92 + 22); d[j + 1] = Math.min(255, g * 1.06 + 14); d[j + 2] = b * .9 + 6;
          const bl = n2(x / 2.2, y / 2.2, 11); if (bl > .74) { const w2 = bl > .86; d[j] = 252; d[j + 1] = w2 ? 246 : 198; d[j + 2] = w2 ? 248 : 214; } }
        else if (sea === 'autumn' || sea === 'lateautumn') { const tr = pal[0] * rel, tg = pal[1] * rel, tb = pal[2] * rel;
          // each tree has turned by its own amount, in clumps: some still mostly green, some well on the way to orange
          const nt = n2(x / 9 + 3, y / 9, 9) * .75 + n2(x / 3.5, y / 3.5, 4) * .25, k = .92 * Math.max(0, Math.min(1, (tt - nt) / .22 + .5)), ky = k > .05 && k < .7 ? .25 : 0;   // the edge of a turned clump goes a little yellow first
          d[j] = Math.min(255, r + (tr - r) * k + (226 * rel - r) * ky * (1 - k)); d[j + 1] = Math.min(255, g + (tg - g) * k + (190 * rel - g) * ky * (1 - k)); d[j + 2] = Math.min(255, b + (tb - b) * k);
          if (sea === 'lateautumn' && nz < thin) d[j + 3] = 0; }
        else if (sea === 'winter') { if (nz < .9) d[j + 3] = 0; else { d[j] = 150 * rel; d[j + 1] = 110 * rel; d[j + 2] = 70 * rel; } } });
      if ((sea === 'winter' || sea === 'lateautumn' && thin > .08) && !forced) { branches.push([x0, x1, y0, y1]);
        // the dark outline round the crown goes where the leaves have gone
        for (let pass = 0; pass < 2; pass++) for (let y = y0 - 2; y <= y1 + 1; y++) for (let x = x0 - 2; x <= x1 + 2; x++) { if (x < 1 || y < 1 || x >= W0 - 1 || y >= H0 - 1) continue; const j = (y * W0 + x) * 4;
          if (d[j + 3] < 200 || Math.max(d[j], d[j + 1], d[j + 2]) > 50 || y > y1 - 2) continue; let holes = 0; for (const o2 of [-4, 4, -W0 * 4, W0 * 4]) if (d[j + o2 + 3] < 30) holes++; if (holes >= 2) d[j + 3] = 0; } } }
    if (!any) return sp.c;
    const c = document.createElement('canvas'); c.width = W0; c.height = H0; const o = c.getContext('2d'); o.putImageData(im, 0, 0);
    // bare branches: the trunk carries on up into the crown and splits into boughs and twigs
    const BR = sea === 'winter' ? '#5a4232' : 'rgba(90,66,50,.85)', TW = sea === 'winter' ? '#7a5c46' : 'rgba(122,92,70,.7)';
    const line = (ax, ay, bx, by, col) => { o.fillStyle = col; const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) | 0; for (let i = 0; i <= n; i++) o.fillRect(Math.round(ax + (bx - ax) * i / n), Math.round(ay + (by - ay) * i / n), 1, 1); };
    branches.forEach(([x0, x1, y0, y1]) => { const mx = Math.round((x0 + x1) / 2), w = x1 - x0, h = y1 - y0, top = y0 + h * .18;
      line(mx, y1 + 2, mx, top, BR); line(mx + 1, y1 + 2, mx + 1, y0 + h * .45, BR);
      for (let k = 0; k < 4; k++) { const sy = y1 - h * (.2 + k * .17), side = k % 2 ? 1 : -1, ex = mx + side * w * (.32 + rnd() * .14), ey = sy - h * (.16 + rnd() * .1);
        line(mx, sy, ex, ey, BR); line(ex, ey, ex + side * 3, ey - 4, TW); line((mx + ex) / 2, (sy + ey) / 2, (mx + ex) / 2 - side * 2, (sy + ey) / 2 - 5, TW); line(ex, ey, ex - side * 1, ey - 5, TW); }
      line(mx, top, mx - 3, top - 4, TW); line(mx, top, mx + 3, top - 5, TW); });
    return c; }
  const NOSEASON = {};
  // greenery that never dries out: Kaya's living wall is artificial
  const NODRY = { kaya: 1 };
  // park trees drawn as plain round crowns (no trunk showing): change them with the seasons too
  const TRUNKLESS = { wardownfield: 1, wardownbridge: 1, stockwood: 1, gurdwara: 2, kaya: 3, chiltern: 1, wardown: 1 };
  S.seasonal = (sp, on) => { const sea = S.season(); if ((sea === 'summer' && !S.dry()) || NOSEASON[sp.k]) return sp.c; const key = sp; const v = seasonC.get(key, () => ({}));
    if (v[sea]) return v[sea]; if (on || !S.__warm) { v[sea] = makeSeason(sp, sea); return v[sea]; } return sp.c; };
  S.carNight = cnv => carN.get(cnv, cc => { const c = document.createElement('canvas'); c.width = cc.width; c.height = cc.height; const x = c.getContext('2d'); x.drawImage(cc, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(8,12,34,.6)'; x.fillRect(0, 0, c.width, c.height); return c; });

  // ---------- town layer: buildings are drawn here, then tinted for night / golden hour / grey days ----------
  let TL = null, tx = null;
  S.townBegin = (W, OY, GY) => { const a = S.n * .42 + (S.late || 0) * .1 + S.gold * .14 + S.grey * .12; S.tintA = a; if (a < .02 && S.lightA < .02 && S.dirK * Math.abs(S.sx) < .05) return null;
    const w = Math.ceil(W * 2), h = Math.ceil((GY + OY) * 2); if (!TL) { TL = document.createElement('canvas'); tx = TL.getContext('2d'); }
    if (TL.width !== w || TL.height !== h) { TL.width = w; TL.height = h; }
    tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, w, h); tx.setTransform(2, 0, 0, 2, 0, OY * 2); tx.imageSmoothingEnabled = false; return tx; };
  S.townEnd = (main, W, OY, GY, list, M, LH) => { const n = S.n, a = S.tintA;
    // sunlight from one side: each building a touch darker on the side away from the sun, warmer on the sun side when the sun is low
    const dk = S.dirK * Math.abs(S.sx); if (dk > .03) { tx.save(); tx.globalCompositeOperation = 'source-atop';
      list.forEach(l => { if (l.x > W + 40 || l.x + l.sp.w < -40) return; const x0 = l.x, x1 = l.x + l.sp.w, sun = S.sx < 0 ? x0 : x1, away = S.sx < 0 ? x1 : x0;
        const g = tx.createLinearGradient(sun, 0, away, 0); g.addColorStop(0, 'rgba(255,190,110,' + (S.gold * dk * .22).toFixed(3) + ')'); g.addColorStop(.45, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,26,60,' + (dk * .2).toFixed(3) + ')');
        tx.fillStyle = g; tx.fillRect(Math.min(x0, x1) - 2, GY - 330, l.sp.w + 4, 330); }); tx.restore(); }
    tx.save(); tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'source-atop';
    const col = mix(mix(hex('#8a95a3'), hex('#ff9a4a'), clamp(S.gold / (S.gold + S.grey * .9 + .001))), hex('#0a1030'), clamp(n * 1.4));
    tx.fillStyle = css(col, Math.min(.62, a).toFixed(3)); tx.fillRect(0, 0, TL.width, TL.height); tx.restore();
    // snow stays pale at night (moonlit), so it reads against the dark buildings
    if (S.snowAcc > .02 && n > .02) { tx.globalAlpha = Math.min(1, S.snowAcc) * n * .85; list.forEach(l => { if (l.x > W + 120 || l.x + l.sp.w < -120) return; const sn = S.snow(l.sp, l.x < W); if (sn) { tx.imageSmoothingEnabled = true; tx.drawImage(sn, Math.round(l.x - M), GY - LH + 6, sn.width / 3, sn.height / 3); tx.imageSmoothingEnabled = false; } }); tx.globalAlpha = 1; }
    if (S.lightA > .02) { list.forEach(l => { if (l.x > W + 120 || l.x + l.sp.w < -120) return; if (window.isClosed && isClosed(l.sp.k)) return; const lc = S.lights(l.sp, l.x < W); if (!lc) return;
      // each building has its own bedtime: houses first, shops with signs stay on longest (late-night takeaways)
      if (l.bed == null) l.bed = l.house ? Math.random() : .35 + Math.random() * .65; const cfgN = NIGHT[l.sp.k] || {}, keep = window.SHUT_K && SHUT_K[l.sp.k] ? 1 : cfgN.board ? .75 : l.house ? .12 : .4, off = (S.late || 0) > l.bed;   // shops with shutters keep their signs lit; the shutter closes the front instead
      tx.globalAlpha = S.lightA * (off ? keep : 1); tx.drawImage(lc, Math.round(l.x - M), GY - LH + 6); }); tx.globalAlpha = 1; }
    main.drawImage(TL, 0, -OY, TL.width / 2, TL.height / 2); };

  // fog over the town (not the pipes)
  S.drawFog = (c, W, OY, GY, t) => { const f = cur.fog; if (f < .03) return; const col = mix(hex('#dfe3e6'), hex('#3a4258'), S.n);
    const g = c.createLinearGradient(0, GY - 230, 0, GY); g.addColorStop(0, css(col, 0)); g.addColorStop(.55, css(col, (.32 * f).toFixed(2))); g.addColorStop(1, css(col, (.5 * f).toFixed(2))); c.fillStyle = g; c.fillRect(0, GY - 230, W, 230);
    for (let i = 0; i < 4; i++) { const x = ((i * 173 - t * (6 + i * 2)) % (W + 240) + W + 240) % (W + 240) - 120, y = GY - 40 - i * 34, rg = c.createRadialGradient(x, y, 4, x, y, 110);
      rg.addColorStop(0, css(col, (.22 * f).toFixed(2))); rg.addColorStop(1, css(col, 0)); c.fillStyle = rg; c.fillRect(x - 110, y - 50, 220, 100); } };

  // ground: settled snow and night shade (pavement / road / verge)
  S.drawGround = (c, W, GY, ROAD, H, BE, SCi, between) => { const a = S.snowAcc; if (a > .02) {
      c.fillStyle = 'rgba(246,249,255,' + (a * .88).toFixed(2) + ')'; c.fillRect(0, GY, W, ROAD - GY - 2);
      c.fillStyle = 'rgba(200,212,228,' + (a * .6).toFixed(2) + ')'; const po = SCi % 12; for (let x = -po; x < W; x += 12) c.fillRect(Math.round(x), GY + 3, 1, 1);
      c.fillStyle = 'rgba(235,240,248,' + (a * .55).toFixed(2) + ')'; c.fillRect(0, ROAD, W, 2); c.fillRect(0, H - 3, W, 2);
      if (BE > 0) { c.fillStyle = 'rgba(246,249,255,' + (a * .85).toFixed(2) + ')'; c.fillRect(0, H + 2, W, BE); } }
    if (between) between();   // things standing on the ground (fox, snowmen) get the same night shade as the ground
    if (S.n > .02) { c.fillStyle = 'rgba(8,12,34,' + (S.n * .5).toFixed(2) + ')'; c.fillRect(0, GY, W, H + BE - GY + 4); } };

  // rain, splashes, snowflakes (in front of the town, behind the pipes and pigeon)
  S.drawPrecip = (c, S0) => { if (drops.length) { const night = S.n, slant = .12 + Math.min(.35, wind / 90), al = (cur.drizzle > .5 ? .3 : .42) + cur.rain * .15;
      c.strokeStyle = css(mix(hex('#d8e4f4'), hex('#8090b8'), night), al.toFixed(2)); c.lineWidth = Math.max(.35, 1.4 / S0); c.beginPath();
      drops.forEach(d => { const l = cur.drizzle > .5 ? d.l * .55 : d.l; c.moveTo(d.x, d.y); c.lineTo(d.x + l * slant, d.y - l); }); c.stroke();
      c.fillStyle = css(mix(hex('#e4ecf8'), hex('#8b98bd'), night), .6); splash.forEach(s => { const k = s.t / .22, r = 1 + k * 3; c.fillRect(Math.round(s.x - r), Math.round(s.y - 1 - k * 2), 1, 1); c.fillRect(Math.round(s.x + r), Math.round(s.y - 1 - k * 2), 1, 1); }); }
    if (flakes.length) { const fc = S.n > .5 ? '226,234,255' : '255,255,255'; flakes.forEach(f => { c.fillStyle = 'rgba(' + fc + ',' + f.a.toFixed(2) + ')'; c.beginPath(); c.arc(f.x, f.y, f.s * .6, 0, 6.3); c.fill(); }); } };

  // snow on top of the bottom pipe caps
  S.capSnow = (c, x, cy, PW) => { const a = S.snowAcc; if (a < .05) return; c.globalAlpha = Math.min(1, a * 1.2); c.fillStyle = '#ffffff'; c.fillRect(Math.round(x - 3), cy - 2, PW + 6, 2);
    c.fillRect(Math.round(x + 2), cy - 3, PW - 8, 1); c.fillStyle = '#d4deec'; c.fillRect(Math.round(x - 3), cy, PW + 6, 1); c.globalAlpha = 1; };

  // shadows on the ground, falling away from the sun (always a soft contact shadow)
  S.pipeShadow = (c, x, PW, ROAD, GY) => { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(Math.round(x) - 2, ROAD - 4, PW + 4, 2);
    const k = S.dirK; if (k < .05) return; const L = Math.min(34, 7 / Math.tan(Math.max(4, S.alt) * RD)) * -S.sx, d = ROAD - 4 - GY - 1;
    c.fillStyle = 'rgba(20,24,40,' + (.2 * k).toFixed(3) + ')'; c.beginPath(); c.moveTo(x, ROAD - 4); c.lineTo(x + PW, ROAD - 4); c.lineTo(x + PW + L, ROAD - 4 - d); c.lineTo(x + L, ROAD - 4 - d); c.closePath(); c.fill(); };
  S.carShadow = (c, x0, w, groundY) => { const k = .35 + .65 * S.dirK, off = -S.sx * 4 * S.dirK; c.fillStyle = 'rgba(10,12,20,' + (.22 * k).toFixed(3) + ')'; c.beginPath(); c.ellipse(x0 + w / 2 + off, groundY - .5, w * .48, 2.2, 0, 0, 6.3); c.fill(); };
  // car lights at night
  S.carLights = (c, x0, y0, w, groundY, ht, dir) => { const a = S.lightA; if (a < .03) return; const fy = groundY - Math.max(4, ht * .32), fx = dir > 0 ? x0 + w - 2 : x0 + 2, ex = fx + dir * 46;
    const g = c.createLinearGradient(fx, 0, ex, 0); g.addColorStop(0, 'rgba(255,240,190,' + (.42 * a).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(fx, fy - 1.5); c.lineTo(ex, fy - 5); c.lineTo(ex, fy + 6); c.lineTo(fx, fy + 1.5); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,248,215,' + a.toFixed(2) + ')'; c.fillRect(Math.round(fx - (dir > 0 ? 1 : 0)), Math.round(fy - 1), 2, 2);
    c.fillStyle = 'rgba(255,40,40,' + (a * .9).toFixed(2) + ')'; c.fillRect(Math.round(dir > 0 ? x0 + 1 : x0 + w - 3), Math.round(fy - 1), 2, 2); };
  // ---------- owner's preview panel (?panel=1, opened from SMR Admin): try any time of day, weather and season ----------
  S.preview = o => { if ('sky' in o) { S.forceHour = o.sky === 'late' ? 1.5 : null; S.forceSky = o.sky === 'late' ? 'night' : o.sky || null; lastSun = -9; }
    if ('wx' in o) { if (o.wx && PRESET_WX[o.wx] != null) { tgt = fromCode(PRESET_WX[o.wx]); Object.assign(cur, tgt); S.snowAcc = o.wx === 'snow' ? 1 : 0; liveWx = false; } else { liveWx = true; tgt = fromCode(0); Object.assign(cur, tgt); S.snowAcc = 0; first = true; fetch('api.php?a=cfg', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(S.cfg).catch(() => {}); } }
    if ('season' in o) S.forceSeason = o.season || null; };
  if (q.get('panel')) addEventListener('DOMContentLoaded', () => { const p = document.createElement('div'); p.id = 'pvP';
    p.style.cssText = 'position:fixed;left:8px;bottom:calc(env(safe-area-inset-bottom) + 8px);z-index:80;background:rgba(15,14,22,.82);color:#fff;border-radius:10px;padding:8px 8px 6px;font:600 11px -apple-system,Segoe UI,Roboto,sans-serif;display:flex;flex-direction:column;gap:5px;max-width:150px';
    const sel = (lab, key, opts) => { const w = document.createElement('label'); w.style.cssText = 'display:flex;flex-direction:column;gap:2px'; w.textContent = lab; const s2 = document.createElement('select'); s2.style.cssText = 'font:600 12px -apple-system,sans-serif;border-radius:6px;padding:3px';
      opts.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; s2.appendChild(o); }); s2.value = key === 'sky' ? (FS || '') : key === 'wx' ? (FW || '') : (q.get('season') || '');
      s2.addEventListener('change', () => S.preview({ [key]: s2.value })); w.appendChild(s2); p.appendChild(w); };
    const t0 = document.createElement('b'); t0.textContent = 'Preview (only you)'; t0.style.cssText = 'font-size:11px;opacity:.8'; p.appendChild(t0);
    sel('Time', 'sky', [['', 'Live (real time)'], ['dawn', 'Sunrise'], ['morning', 'Morning'], ['day', 'Midday'], ['afternoon', 'Afternoon'], ['sunset', 'Sunset'], ['dusk', 'Dusk'], ['night', 'Night'], ['late', 'Late night (1am)']]);
    sel('Weather', 'wx', [['', 'Live (real weather)'], ['clear', 'Clear'], ['cloudy', 'Cloudy'], ['fog', 'Fog'], ['drizzle', 'Drizzle'], ['rain', 'Rain'], ['heavy', 'Heavy rain'], ['storm', 'Storm'], ['snow', 'Snow'], ['rainbow', 'Rainbow (after rain)']]);
    sel('Season', 'season', [['', 'Live (today)'], ['spring', 'Spring blossom'], ['summer', 'Summer'], ['autumn', 'Autumn'], ['lateautumn', 'Late autumn'], ['winter', 'Winter']]);
    ['pointerdown', 'touchstart', 'click'].forEach(ev => p.addEventListener(ev, e => e.stopPropagation(), { passive: true })); document.body.appendChild(p); });
})();
