/* Festival dressing for Flappy Kabootar: Christmas, New Year, Ramadan, Luton Carnival.
   Off unless switched on (owner rule: nothing changes by itself): ?fest=christmas|newyear|ramadan|carnival, or window.FEST_KIND set from the admin settings. */
window.FEST = (() => {
  const q = new URLSearchParams(location.search), OUT = '#1b1a24';
  const kind = () => q.get('fest') || window.FEST_KIND || '';
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  let sleigh = null, sleighCD = 4, rockets = [], sparks = [], fwCD = .5, confetti = [], dancers = [], danceCD = 3, last = 0;
  const night = () => (window.SKY ? SKY.n : 0);

  /* ---------- the pigeon's Santa hat (drawn in the pigeon's own frame) ---------- */
  function hat(c) { if (kind() !== 'christmas') return;
    const rows = [[4, 8, -8], [4, 7, -9], [3, 6, -10], [2, 5, -11], [1, 3, -12]];
    rows.forEach(([a, b, y]) => { R(c, OUT, a - 1, y, b - a + 3, 1); }); rows.forEach(([a, b, y]) => R(c, '#d42a2a', a, y, b - a + 1, 1)); R(c, '#a81a1e', 5, -9, 3, 1);
    R(c, OUT, 2, -7, 9, 2); R(c, '#f4f2ec', 3, -7, 7, 1); R(c, '#dcdad2', 3, -6, 7, 1);   // fur brim
    R(c, OUT, -1, -14, 3, 3); R(c, '#ffffff', -1, -13, 2, 2); }   // pompom

  /* ---------- sky: Santa's sleigh, fireworks ---------- */
  function sky(c, W, GY, t, dt) { const k = kind(); if (!k) return;
    if (k === 'christmas') { sleighCD -= dt; if (!sleigh && sleighCD <= 0) { sleigh = { x: W + 40, y: GY - 215 - Math.random() * 40 }; sleighCD = 18 + Math.random() * 10; }
      if (sleigh) { sleigh.x -= dt * 34; drawSleigh(c, sleigh.x, sleigh.y + Math.sin(t * 2) * 3, t); if (sleigh.x < -130) sleigh = null; } }
    if (k === 'newyear') { fwCD -= dt; if (fwCD <= 0) { fwCD = .55 + Math.random() * .9; rockets.push({ x: 20 + Math.random() * (W - 40), y: GY - 60, vy: -150 - Math.random() * 40, top: GY - 230 - Math.random() * 60, col: ['#ff4a5a', '#ffd84a', '#4ad8ff', '#8aff6a', '#ff7ae0', '#ffffff'][Math.random() * 6 | 0] }); if (window.SFX && SFX.on && SFX.pop) SFX.pop(); }
      for (let i = rockets.length - 1; i >= 0; i--) { const r = rockets[i]; r.y += r.vy * dt; R(c, '#fff4c0', Math.round(r.x), Math.round(r.y), 1, 3); R(c, 'rgba(255,200,120,.5)', Math.round(r.x), Math.round(r.y) + 3, 1, 4);
        if (r.y <= r.top) { const n = 38; for (let j = 0; j < n; j++) { const a = j / n * Math.PI * 2, s = 40 + Math.random() * 30; sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.4 + Math.random() * .4, col: Math.random() < .2 ? '#ffffff' : r.col }); } rockets.splice(i, 1); if (window.SFX && SFX.on && SFX.bang) SFX.bang(); } }
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.life -= dt; if (p.life <= 0) { sparks.splice(i, 1); continue; } p.vy += 30 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; c.globalAlpha = Math.min(1, p.life); R(c, p.col, Math.round(p.x), Math.round(p.y), p.life > .9 ? 2 : 1, p.life > .9 ? 2 : 1); }
      c.restore(); c.globalAlpha = 1; } }

  function drawSleigh(c, x, y, t) { x = Math.round(x); y = Math.round(y); const g = Math.floor(t * 8) % 2, n = night();
    for (let i = 0; i < 4; i++) { const rx = x + i * 16, ry = y + 4 + (i % 2 ? g : 1 - g);   // reindeer in pairs, legs galloping
      R(c, OUT, rx - 1, ry - 1, 12, 6); R(c, '#8a5a32', rx, ry, 10, 4); R(c, '#a8784a', rx + 1, ry, 6, 1); R(c, OUT, rx - 4, ry - 4, 5, 5); R(c, '#8a5a32', rx - 3, ry - 3, 3, 3);
      R(c, '#5a3a1e', rx - 3, ry - 7, 1, 3); R(c, '#5a3a1e', rx - 4, ry - 7, 3, 1); R(c, '#5a3a1e', rx - 1, ry - 7, 1, 3); R(c, '#5a3a1e', rx - 1, ry - 7, 2, 1);
      const lg = (i + g) % 2; R(c, '#5a3a1e', rx + 1, ry + 4, 1, lg ? 3 : 2); R(c, '#5a3a1e', rx + 8, ry + 4, 1, lg ? 2 : 3);
      if (i === 0) { R(c, '#ff2a2a', rx - 5, ry - 2, 2, 2); if (n > .3) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(rx - 4, ry - 1, 0, rx - 4, ry - 1, 8); gr.addColorStop(0, 'rgba(255,60,60,.7)'); gr.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = gr; c.fillRect(rx - 12, ry - 9, 16, 16); c.restore(); } } }
    c.strokeStyle = '#c9a64a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 60, y + 6); c.lineTo(x + 70, y + 8); c.stroke();   // reins
    const sx = x + 70; R(c, OUT, sx - 1, y + 1, 26, 12); R(c, '#c8202a', sx, y + 2, 24, 9); R(c, '#e8b830', sx, y + 2, 24, 1); R(c, '#e8b830', sx + 2, y + 11, 22, 1); R(c, '#e8b830', sx, y + 12, 1, 1); R(c, '#e8b830', sx + 24, y + 11, 2, 1);   // sleigh + runner
    R(c, '#8a5a32', sx + 14, y - 5, 9, 7); R(c, '#b8925a', sx + 15, y - 4, 7, 2);   // sack of presents
    R(c, OUT, sx + 4, y - 9, 9, 12); R(c, '#d42a2a', sx + 5, y - 8, 7, 10); R(c, '#f4f2ec', sx + 5, y - 3, 7, 1);   // Santa
    R(c, '#f4c8a8', sx + 4, y - 12, 5, 4); R(c, '#f4f2ec', sx + 3, y - 9, 6, 3); R(c, '#d42a2a', sx + 4, y - 15, 6, 3); R(c, '#f4f2ec', sx + 9, y - 16, 2, 2);
    for (let i = 0; i < 6; i++) { const px = sx + 26 + i * 6 + (t * 20 % 6), py = y + 8 + Math.sin(t * 6 + i) * 2; R(c, i % 2 ? '#fff6c8' : '#ffd84a', Math.round(px), Math.round(py), 1, 1); } }   // sparkle trail

  /* ---------- in front of the buildings: Ramadan lanterns, Carnival bunting ---------- */
  const SPAN = 180;
  // strings hang from pipe to pipe: tied to the side of each bottom pipe, a little below its top (never just floating in the air)
  function ramLanterns(c, at, n, t, pi, cnt) {
    for (let i = 1; i < cnt; i++) { const u = i / cnt, [px, py] = at(u), sw = Math.sin(t * 1.6 + i + pi) * 1.5, X = Math.round(px + sw), Y = Math.round(py);
        if (i % 3 === 0) { R(c, '#c9a64a', X, Y, 1, 5); c.fillStyle = n > .3 ? '#fff0a8' : '#e8c860'; c.beginPath(); c.arc(X + .5, Y + 10, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(0,0,0,0)'; c.save(); c.globalCompositeOperation = 'destination-out'; c.restore();
          c.fillStyle = n > .3 ? '#1a1e3a' : '#7fb0d8'; c.beginPath(); c.arc(X + 2.6, Y + 8.6, 4.4, 0, Math.PI * 2); c.fill();   // crescent (the sky-coloured disc bites it)
          R(c, n > .3 ? '#fff0a8' : '#e8c860', X - 5, Y + 8, 1, 1); R(c, n > .3 ? '#fff0a8' : '#e8c860', X - 6, Y + 9, 3, 1); R(c, n > .3 ? '#fff0a8' : '#e8c860', X - 5, Y + 10, 1, 1); }
        else { const col = ['#e8402a', '#2ab0a0', '#8a4ae0', '#e8a02a'][(i + pi) & 3];   // fanous: gold cap, coloured glass, gold base
          R(c, '#c9a64a', X, Y, 1, 4); R(c, OUT, X - 3, Y + 3, 7, 13); R(c, '#c9a64a', X - 2, Y + 4, 5, 2); R(c, col, X - 2, Y + 6, 5, 7); R(c, '#c9a64a', X - 2, Y + 8, 5, 1); R(c, '#c9a64a', X - 1, Y + 13, 3, 2); R(c, '#c9a64a', X, Y + 15, 1, 1);
          R(c, n > .3 ? '#fff6c8' : 'rgba(255,255,255,.45)', X - 1, Y + 9, 1, 3);
          if (n > .3) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X + .5, Y + 10, 0, X + .5, Y + 10, 14); g.addColorStop(0, 'rgba(255,200,110,' + (.5 * n).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = g; c.fillRect(X - 14, Y - 4, 29, 29); c.restore(); } } }
  }
  function front(c, W, GY, t, SCi, pipes, PW) { const k = kind(); if (k !== 'ramadan' && k !== 'carnival') return; const n = night();
    const ps = (pipes || []).slice().sort((a, b) => a.x - b.x), tie = p => Math.max(p.top + p.gap + 7, GY - 175);
    if (k === 'ramadan' && ps.length) {   // a row of lanterns strung from pipe to pipe right across the screen
      const gapX = ps.length > 1 ? ps[1].x - ps[0].x : 150, xs = ps.map(p => p.x), tops = ps.map(p => p.top);
      while (xs[0] > -gapX) { xs.unshift(xs[0] - gapX); tops.unshift(tops[0]); } while (xs[xs.length - 1] < W + gapX) { xs.push(xs[xs.length - 1] + gapX); tops.push(tops[tops.length - 1]); }
      for (const [sag, cnt] of [[18, 7]]) for (let q = 0; q + 1 < xs.length; q++) { const x0 = xs[q] + PW - 1, x1 = xs[q + 1] + 1; if (x1 < -10 || x0 > W + 10) continue;
        const ya = tops[q] - 8, yb = tops[q + 1] - 8, Y0 = ya;   // tied just above the lip of each top pipe
        const at = u => [x0 + (x1 - x0) * u, ya + (yb - ya) * u + Math.sin(u * Math.PI) * sag], seed = Math.round(xs[q] + SCi) / 7 | 0;
        R(c, '#c9a64a', Math.round(x0) - 1, ya - 1, 3, 3); R(c, '#c9a64a', Math.round(x1) - 2, yb - 1, 3, 3);   // tied on the pipes
        c.strokeStyle = '#c9a64a'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i <= 24; i++) { const [px, py] = at(i / 24); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
        ramLanterns(c, at, n, t, seed + (Y0 & 3), cnt); } }
    if (k === 'carnival') for (let pi = 0; pi + 1 < ps.length; pi++) { const A = ps[pi], B = ps[pi + 1], x0 = A.x + PW - 1, x1 = B.x + 1; if (x1 < -10 || x0 > W + 10 || x1 - x0 < 30) continue;
      const ya = tie(A), yb = tie(B), sag = Math.min(28, (x1 - x0) * .16), SPAN = x1 - x0;
      const at = u => [x0 + (x1 - x0) * u, ya + (yb - ya) * u + Math.sin(u * Math.PI) * sag];
      R(c, '#c9a64a', Math.round(x0) - 1, Math.round(ya) - 1, 3, 3); R(c, '#c9a64a', Math.round(x1) - 2, Math.round(yb) - 1, 3, 3);   // little ties on the pipes
      c.strokeStyle = k === 'ramadan' ? '#c9a64a' : '#3a3a3a'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i <= 20; i++) { const [px, py] = at(i / 20); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
      if (k === 'ramadan') ramLanterns(c, at, n, t, pi, 7);
      if (k === 'carnival') for (let i = 1; i < 12; i++) { const u = i / 12, [px, py] = at(u), col = ['#e8302a', '#f2c43a', '#2fa84a', '#2a6fd8', '#e85ca8', '#f07a12'][(i + pi) % 6], sw = Math.sin(t * 3 + i) * 1;
        c.fillStyle = col; c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px + 4, py); c.lineTo(px + sw, py + 9); c.closePath(); c.fill(); } }
    if (k === 'carnival') { if (confetti.length < 70 && Math.random() < .6) confetti.push({ x: Math.random() * W, y: GY - 260, vy: 18 + Math.random() * 20, ph: Math.random() * 6, col: ['#e8302a', '#f2c43a', '#2fa84a', '#2a6fd8', '#e85ca8', '#ffffff'][Math.random() * 6 | 0] });
      const now = t, dt = Math.min(.05, now - (last || now)); last = now;
      for (let i = confetti.length - 1; i >= 0; i--) { const p = confetti[i]; p.y += p.vy * dt; p.x += Math.sin(now * 2 + p.ph) * 12 * dt - 30 * dt; if (p.y > GY + 40 || p.x < -5) { confetti.splice(i, 1); continue; } R(c, p.col, Math.round(p.x), Math.round(p.y), Math.sin(now * 8 + p.ph) > 0 ? 2 : 1, 1); } } }

  // one samba dancer: feathered headdress, sequined costume, waving arms (feet at X, Y)
  function dancer(c, X, Y, d, ph, col, sk) { const b = Math.round(Math.sin(ph * 9) * 1.5), sw = Math.sin(ph * 9);
    c.save(); c.translate(X, Y + b); c.scale(d, 1);

        for (let f = 0; f < 7; f++) { const a = -Math.PI / 2 + (f - 3) * .32; c.strokeStyle = ['#e8302a', '#f2c43a', '#2fa84a', '#2a6fd8', '#e85ca8', '#f07a12', '#ffffff'][(f + Math.round(ph)) % 7]; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -22); c.lineTo(Math.cos(a) * 14, -22 + Math.sin(a) * 14); c.stroke(); }   // feather headdress
        R(c, sk, -1.5, -11, 3, 10); R(c, col, -3, -12, 6, 4); R(c, col, -4, -6, 8, 3); R(c, '#ffd84a', -4, -3, 8, 1);   // costume
        R(c, sk, -2, -20, 4, 5); R(c, col, -4, -22, 8, 2); R(c, '#ffd84a', -1, -23, 2, 2);
        R(c, sk, -5, -14 + Math.round(sw * 3), 2, 1); R(c, sk, 3, -14 - Math.round(sw * 3), 2, 1); R(c, sk, -5, -17 + Math.round(sw * 3), 1, 3); R(c, sk, 4, -17 - Math.round(sw * 3), 1, 3);   // arms waving
        R(c, sk, -2, -1, 1.4, 2); R(c, sk, 1, -1, 1.4, 2);
    c.restore(); }
  const COLS = ['#e8302a', '#f2c43a', '#2fa84a', '#2a6fd8', '#e85ca8', '#f07a12'], SKS = ['#8a5a3a', '#c58c5c', '#5a3a24', '#e8c4a0', '#6b4630'];
  // a carnival-goer walking with the parade: t-shirt, flag waving now and then
  function walker(c, X, Y, ph, col, sk, flag) { const st = Math.round(Math.sin(ph * 7) * 1.5);
    R(c, '#2a2c3a', X - 2, Y - 7, 2, 7 + Math.min(0, st)); R(c, '#2a2c3a', X + 1, Y - 7, 2, 7 - Math.max(0, st));
    R(c, col, X - 3, Y - 15, 7, 8); R(c, sk, X - 2, Y - 20, 5, 5); R(c, '#1b1a24', X - 2, Y - 21, 5, 2);
    if (flag) { const up = Math.round(Math.sin(ph * 5) * 2); R(c, '#6a5a4a', X + 4, Y - 26 + up, 1, 14); R(c, flag[0], X + 5, Y - 26 + up, 8, 2); R(c, flag[1], X + 5, Y - 24 + up, 8, 2); R(c, flag[2], X + 5, Y - 22 + up, 8, 2); }
    else { R(c, sk, X + 4, Y - 19 + Math.round(Math.sin(ph * 6) * 2), 2, 5); } }
  // a parade float: little lorry pulling a decorated flatbed with dancers, a big feather back-piece and a sound system
  function float(c, X, Y, t, seed, dir) { const L = 104, col = COLS[seed % 6], c2 = COLS[(seed + 2) % 6];
    c.save(); c.translate(X, Y); if (dir < 0) { c.scale(-1, 1); c.translate(-L, 0); }
    R(c, '#1b1a24', 0, -16, L - 22, 12); R(c, '#3a3a44', 2, -18, L - 26, 3);   // flatbed
    for (let i = 0; i < L - 24; i += 6) R(c, COLS[(i / 6 + seed) % 6], 1 + i, -15, 6, 10);   // colourful skirt
    for (let i = 0; i < L - 24; i += 4) R(c, i % 8 ? '#ffd84a' : '#ffffff', 1 + i, -6, 2, 2);  // fringe
    R(c, '#2a2a30', L - 24, -24, 22, 20); R(c, col, L - 23, -23, 20, 10); R(c, '#9ad0ff', L - 9, -21, 6, 7); R(c, '#2a2a30', L - 24, -5, 22, 2);   // cab
    [[10, -3], [L - 34, -3], [L - 12, -3]].forEach(([wx, wy]) => { c.fillStyle = '#1b1a24'; c.beginPath(); c.arc(wx, wy, 4, 0, 6.3); c.fill(); R(c, '#9a9aa6', wx - 1, wy - 1, 2, 2); });
    // speaker stack
    R(c, '#1b1a24', 4, -34, 12, 16); [[10, -29], [10, -22]].forEach(([sx, sy]) => { c.fillStyle = '#4a4a56'; c.beginPath(); c.arc(sx, sy, 3.5 + (Math.sin(t * 14) > .3 ? .6 : 0), 0, 6.3); c.fill(); });
    // giant feather back-piece
    for (let f = 0; f < 11; f++) { const a = -Math.PI + .2 + f * .27; c.strokeStyle = COLS[(f + seed) % 6]; c.lineWidth = 3; c.beginPath(); c.moveTo(50, -20); c.lineTo(50 + Math.cos(a) * 30, -20 + Math.sin(a) * 30 + Math.sin(t * 2 + f) * 1.5); c.stroke(); }
    R(c, '#ffd84a', 46, -24, 8, 6);
    dancer(c, 30, -18, 1, t + seed, c2, SKS[seed % 5]); dancer(c, 50, -18, -1, t + seed + 1.3, col, SKS[(seed + 2) % 5]); dancer(c, 68, -18, 1, t + seed + .6, COLS[(seed + 4) % 6], SKS[(seed + 3) % 5]);
    c.restore(); }
  /* ---------- on the road: the carnival parade (road shut to traffic) ---------- */
  const PSPAN = 300;
  let pshift = 0;
  function road(c, W, RD, H, t, SCi) { if (kind() !== 'carnival') return; const drift = t * 10;
    if (window.__paradeAt != null) { pshift = (((60 - window.__paradeAt) - (SCi + drift)) % PSPAN + PSPAN) % PSPAN; window.__paradeAt = null; }   // for recordings: put a float at this x now
    const P0 = SCi + drift + pshift, off = (P0 % PSPAN + PSPAN) % PSPAN, base = Math.floor(P0 / PSPAN);
    for (let x = -off - PSPAN, k = 0; x < W + PSPAN; x += PSPAN, k++) { const sd = (base + k) * 7 + 3, F = Math.abs(sd) % 6;
      float(c, Math.round(x + 60), RD + 14, t, Math.abs(sd), 1);
      for (let i = 0; i < 6; i++) { const wx = Math.round(x + 10 + i * 22 + Math.sin(t + i) * 3); walker(c, wx, RD + 15 + (i % 2) * 2, t + i * .7, COLS[(F + i) % 6], SKS[(i + F) % 5], i % 3 === 1 ? [['#e8302a', '#ffffff', '#2a6fd8'], ['#2fa84a', '#f2c43a', '#1b1a24'], ['#e8302a', '#f2c43a', '#2fa84a']][(i + F) % 3] : null); }
      for (let i = 0; i < 5; i++) dancer(c, Math.round(x + 150 + i * 26), H - 3, i % 2 ? -1 : 1, t + i * .9 + F, COLS[(F + i + 1) % 6], SKS[(F + i) % 5]);
      for (let i = 0; i < 4; i++) walker(c, Math.round(x + 40 + i * 24), H - 2, t + i, COLS[(i + F + 3) % 6], SKS[(i + F + 1) % 5], i === 2 ? ['#e8302a', '#f2c43a', '#2fa84a'] : null); } }
  /* ---------- on the pavement: Christmas trees, carnival dancers ---------- */
  const TSPAN = 230;
  function ground(c, W, GY, t, SCi, dt, step) { const k = kind(); if (!k) return; const n = night();
    if (k === 'christmas') { const off = ((SCi) % TSPAN + TSPAN) % TSPAN;
      for (let x = -off + 40; x < W + 30; x += TSPAN) { const X = Math.round(x), Y = GY + 8;
        R(c, OUT, X - 4, Y - 5, 9, 6); R(c, '#8a4a2a', X - 3, Y - 4, 7, 4);   // pot
        for (const [w, y] of [[22, -12], [18, -20], [13, -27], [8, -33]]) { c.fillStyle = OUT; c.beginPath(); c.moveTo(X - w / 2 - 1, Y + y + 1); c.lineTo(X + w / 2 + 1, Y + y + 1); c.lineTo(X + .5, Y + y - 11); c.closePath(); c.fill();
          c.fillStyle = '#2f6a2e'; c.beginPath(); c.moveTo(X - w / 2, Y + y); c.lineTo(X + w / 2, Y + y); c.lineTo(X + .5, Y + y - 10); c.closePath(); c.fill(); R(c, '#3e8238', X - 1, Y + y - 6, 2, 5); }
        const BL = [[-6, -14], [5, -15], [-3, -22], [4, -23], [0, -29], [-7, -18], [7, -19], [-2, -16], [2, -31]];
        BL.forEach(([bx, by], i) => { const on = Math.floor(t * 3 + i * 1.7) % 3 !== 0, col = ['#ff3a3a', '#ffd84a', '#4ad8ff', '#ff7ae0'][i % 4]; R(c, on ? col : '#5a4a3a', X + bx, Y + by, 2, 2);
          if (on && n > .3) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col; c.globalAlpha = .25; c.fillRect(X + bx - 2, Y + by - 2, 6, 6); c.restore(); } });
        R(c, '#ffd84a', X - 1, Y - 47, 3, 3); R(c, '#ffd84a', X - 2, Y - 46, 5, 1); R(c, '#ffd84a', X, Y - 48, 1, 5);   // star
        R(c, '#c8202a', X + 6, Y - 3, 5, 4); R(c, '#f2c43a', X + 8, Y - 3, 1, 4); R(c, '#2a6fd8', X - 11, Y - 4, 5, 5); R(c, '#f4f2ec', X - 9, Y - 4, 1, 5); } }   // presents
    if (k === 'carnival') { danceCD -= dt; if (danceCD <= 0) { danceCD = 9 + Math.random() * 8; const d = Math.random() < .5 ? -1 : 1, n2 = 2 + (Math.random() * 2 | 0);
        for (let i = 0; i < n2; i++) dancers.push({ x: (d < 0 ? W + 20 : -20) - d * i * 24, d, v: 14 + Math.random() * 6, ph: Math.random() * 6, col: ['#e8302a', '#f2c43a', '#2fa84a', '#2a6fd8', '#e85ca8'][Math.random() * 5 | 0], sk: ['#8a5a3a', '#c58c5c', '#5a3a24', '#e8c4a0'][Math.random() * 4 | 0] }); }
      for (let i = dancers.length - 1; i >= 0; i--) { const p = dancers[i]; p.x += p.d * p.v * dt - (step || 0); p.ph += dt; if (p.x < -60 || p.x > W + 60) { dancers.splice(i, 1); continue; }
        dancer(c, Math.round(p.x), GY + 7, p.d, p.ph, p.col, p.sk); } } }

  // for recordings: bring the sleigh / fireworks / dancers on now
  const kick = (W) => { sleighCD = 0; sleigh = { x: (W || 200) * .78, y: 0 }; sleigh.y = 250 - 225; fwCD = 0; danceCD = 12; if (kind() === 'carnival') for (let i = 0; i < 3; i++) dancers.push({ x: (W || 200) * .3 + i * 28, d: 1, v: 15, ph: i, col: COLS[i * 2 % 6], sk: SKS[i] }); };
  return { kind, hat, sky, front, ground, road, kick };
})();
