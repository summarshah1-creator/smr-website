/* Inspire FM · Pray along: a full-screen, phone-on-the-floor guide to a whole prayer.
   Big posture picture, the words in Arabic / transliteration / English (you choose), real recitation,
   repeat counter (e.g. 1 of 3), tap-anywhere or automatic advance, adjustable speed, keeps the screen awake. */
(function () {
'use strict';
const X = window.IFMX, SL = window.IFM_SALAH; if (!X || !SL) return;
const { $, $$, esc, store, toast } = X;
const IC = window.IFM_IC;
const pad = n => String(n).padStart(3, '0');
const WBW = { fatiha: [4, 4, 2, 3, 4, 3, 9].map((n, i) => [1, i + 1, n]), surah: [4, 3, 4, 5].map((n, i) => [112, i + 1, n]) };
const SHORT = { niyyah: 'Stand facing the qiblah and intend the prayer in your heart.', takbir: 'Raise your hands and say the takbir.', thana: 'Hands folded. Say quietly:', taawwudh: 'Say quietly:', fatiha: 'Recite al-Fatihah, then say Amin.', surah: 'Recite a short surah.', ruku: 'Bow, hands on knees, back straight.', rise: 'Stand up straight.', sujud1: 'Prostrate: forehead, nose, palms, knees and toes down.', jalsa: 'Sit up, calm and still.', sujud2: 'Prostrate again.', stand: 'Say Allahu akbar and stand up.', tashahhud: 'Sit and recite the tashahhud.', salawat: 'Send blessings on the Prophet ﷺ.', dua: 'Make this dua.', salam: 'Turn right, then left.', after: 'After the prayer.' };
const SCH = {
  h: { takbir: 'Raise your hands to your earlobes and say the takbir.', thana: 'Fold your hands below the navel. Say quietly:', fatiha: 'Recite al-Fatihah, then say Amin quietly.', ruku: 'Bow, hands on knees, back straight.', tashahhud: 'Sit on your left foot. Raise your finger at "la ilaha".' },
  s: { takbir: 'Raise your hands to your shoulders and say the takbir.', thana: 'Fold your hands on your chest. Say quietly:', fatiha: 'Recite al-Fatihah, then say Amin.', ruku: 'Raise your hands, then bow with hands on knees.', rise: 'Raise your hands and stand up straight.', tashahhud: 'Sit and raise your finger at "illallah".' }
};
const doText = (k, st, v) => (SCH[v.school] || {})[k] || SHORT[k] || st.d;
const REPS = { ruku: 3, sujud1: 3, sujud2: 3 };
const CUE = { takbir: 'Allahu akbar', ruku: 'Allahu akbar', sujud1: 'Allahu akbar', jalsa: 'Allahu akbar', sujud2: 'Allahu akbar', stand: 'Allahu akbar', rise: "Sami'allahu liman hamidah" };

const P = () => { const v = Object.assign({ voice: 1, speed: 1, auto: 0, gap: 4, school: 'h' }, store.get('paOpts', {})); if (!v.w) v.w = v.tr && !v.ar ? 'tr' : v.en && !v.ar && !v.tr ? 'en' : 'ar'; v.ar = v.w === 'ar' ? 1 : 0; v.tr = v.w === 'tr' ? 1 : 0; v.en = v.w === 'en' ? 1 : 0; return v; };

/* Steps whose words have no reliable online recitation. Before launch, the station records them as
   audio/salah/<name>.mp3 (see audio/salah/README.txt); they are picked up automatically when present. */
const LOCAL = { takbir: ['takbir'], taawwudh: ['taawwudh'], salam: ['salam'] };
const EXTRA = { taawwudh: ['https://everyayah.com/data/Alafasy_128kbps/001001.mp3'] };
let localOk = null;
function checkLocal() { if (localOk) return localOk; localOk = Promise.all(Object.entries(LOCAL).map(async ([k, n]) => { const u = `audio/salah/${n[0]}.mp3`; try { const r = await fetch(u, { method: 'HEAD' }); return [k, r.ok && /audio|mpeg/.test(r.headers.get('content-type') || '') ? u : null]; } catch (e) { return [k, null]; } })).then(L => Object.fromEntries(L)); return localOk; }
const audioFor = (k, st, loc) => st.au || [loc && loc[k], ...(EXTRA[k] || [])].filter(Boolean);
/* Automatic timing for each step.
   ACT = seconds to physically move into this position (or finish it), at a calm pace.
   With recitation on: wait for the recitation (including repeats), then ACT + a short breath.
   With recitation off: time to read the instruction + time to recite the words yourself
   (about 1.3 Arabic words a second, slower from transliteration) x repeats, then ACT.
   Pace: Relaxed 1.4x, Normal 1x, Brisk 0.8x. */
const ACT = { niyyah: 5, takbir: 3, thana: 1, taawwudh: 1, fatiha: 2, surah: 1, ruku: 3, rise: 3, sujud1: 4, jalsa: 3, sujud2: 3, stand: 4, tashahhud: 2, salawat: 1, dua: 1, salam: 5, after: 4 };
const PACE = { r: 1.4, n: 1, b: .8 };
function stepSecs(k, st, v, afterAudio) {
  const w = words(k, st), n = t => (t || '').trim().split(/\s+/).filter(t => t && !/^[﴾﴿]/.test(t)).length;
  let s;
  if (afterAudio) s = (ACT[k] || 2) + 1.5;
  else {
    const say = n(w.ar) + n(w.ar2), rate = v.w === 'ar' ? 1.3 : 1.1;
    s = 1.5 + n(doText(k, st, v)) / 3 + (say ? say / rate * (REPS[k] || 1) : 0) + (ACT[k] || 2);
  }
  return Math.min(90, Math.max(4, Math.round(s * (PACE[v.pace] || 1))));
}

function words(k, st) {
  const h = st.ref ? SL.H(st.ref) : {}, x = st.extra ? SL.H(st.extra) : null;
  return { ar: st.ar || h.ar || '', tr: st.tr || h.tr || '', en: st.en || h.en || '', ar2: x ? x.ar : '', tr2: x ? x.tr : '', en2: x ? x.en : '' };
}

function open(prayer) {
  const PR = SL.PRAYERS.find(p => p[0] === prayer) || SL.PRAYERS[0];
  const L = SL.seq(PR[2]);
  let i = 0, A = null, rep = 0, timer = 0, paused = false, wake = null, LOC = {};
  checkLocal().then(m => { LOC = m; if (o.isConnected) $('.pa-play', o).style.visibility = audioFor(L[i][1], SL.S[L[i][1]], LOC).length ? '' : 'hidden'; });
  const o = document.createElement('div'); o.className = 'pa'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Pray along');
  document.body.appendChild(o); document.body.classList.add('lock');
  const keepAwake = async () => { try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) {} };
  keepAwake(); const vis = () => { if (document.visibilityState === 'visible' && o.isConnected) keepAwake(); }; document.addEventListener('visibilitychange', vis);
  try { history.pushState({ pa: 1 }, ''); } catch (e) {}
  const onPop = () => close(true); addEventListener('popstate', onPop);

  let waitId = 0;
  function stopAudio() { waitId++; const nb = o.querySelector('[data-next] span'); if (nb) nb.textContent = nb.textContent.replace(/ ·.*/, ''); clearTimeout(timer); if (A) { A.onended = null; A.pause(); A = null; } o.classList.remove('speaking'); const r = $('.pa-ring', o); if (r) r.classList.remove('go'); }
  function close(fromPop) { clearInterval(flip); stopAudio(); removeEventListener('popstate', onPop); document.removeEventListener('visibilitychange', vis); try { wake && wake.release(); } catch (e) {} o.classList.remove('on'); document.body.classList.remove('lock'); setTimeout(() => o.remove(), 280); if (!fromPop) try { history.back(); } catch (e) {} }

  function shell() {
    const v = P();
    o.innerHTML = `<div class="pa-top"><button type="button" class="pa-x" data-close aria-label="Close">${IC('x')}</button>
        <div class="pa-meta"><b>${esc(PR[1])}</b><span class="pa-rk"></span></div>
        <button type="button" class="pa-x" data-opts aria-label="Settings">${IC('gauge')}</button></div>
      <div class="pa-bar"><i></i></div>
      <div class="pa-stage" data-tapnext><div class="pa-figwrap"><div class="pa-poses"></div><span class="pa-cue"></span></div><div class="pa-copy"></div></div>
      <div class="pa-ctl"><button type="button" class="pa-b" data-prev aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>
        <button type="button" class="pa-b pa-play" data-play aria-label="Play">${IC('radio')}<span>Listen</span></button>
        <button type="button" class="pa-next" data-next><span>Next</span><svg viewBox="0 0 40 40" class="pa-ring"><circle cx="20" cy="20" r="17"/></svg></button></div>
      <div class="pa-opts" hidden></div>`;
    requestAnimationFrame(() => o.classList.add('on'));
  }
  function opts() {
    const v = P(), box = $('.pa-opts', o);
    const tg = (k, n) => `<button type="button" data-o="${k}" aria-pressed="${!!v[k]}">${n}</button>`;
    box.innerHTML = `<div class="pa-sheet"><b>Show the words in</b><div class="pa-row">${[['ar', 'Arabic'], ['tr', 'Transliteration'], ['en', 'English']].map(([k, n]) => `<button type="button" data-wsel="${k}" aria-pressed="${v.w === k}">${n}</button>`).join('')}</div>
      <b>Recitation</b><div class="pa-row">${tg('voice', 'Recite the words to me')}${[0.75, 1, 1.25].map(s => `<button type="button" data-speed="${s}" aria-pressed="${v.speed === s}">${s}×</button>`).join('')}</div>
      <b>Moving on</b><div class="pa-row"><button type="button" data-auto="0" aria-pressed="${!v.auto}">When I tap</button><button type="button" data-auto="1" aria-pressed="${!!v.auto}">Automatically</button></div>
      ${v.auto ? `<div class="pa-row"><span>Pace</span>${[['r', 'Relaxed'], ['n', 'Normal'], ['b', 'Brisk']].map(([g, t]) => `<button type="button" data-pace="${g}" aria-pressed="${(v.pace || 'n') === g}">${t}</button>`).join('')}</div>` : ''}
      <b>School</b><div class="pa-row"><button type="button" data-school="h" aria-pressed="${v.school === 'h'}">Hanafi</button><button type="button" data-school="s" aria-pressed="${v.school === 's'}">Shafi'i / others</button></div>
      <button type="button" class="btn g" data-done>Done</button></div>`;
  }
  let flip = 0;
  function pose(st, dir) {
    clearInterval(flip); const box = $('.pa-poses', o); const names = st.img || ['stand'];
    const show = n => { const cur = box.querySelector('img.on'); if (cur && cur.dataset.n === n) return;
      $$('img:not(.on)', box).forEach(x => x.remove());
      const im = new Image(); im.src = `img/salah/${n}.webp`; im.alt = ''; im.dataset.n = n; im.style.setProperty('--d', dir || 0); box.appendChild(im);
      const fade = () => requestAnimationFrame(() => requestAnimationFrame(() => { im.classList.add('on'); if (cur) { cur.classList.remove('on'); cur.classList.add('out'); setTimeout(() => cur.remove(), 450); } }));
      im.decode ? im.decode().then(fade, fade) : fade(); };
    show(names[0]);
    if (names.length > 1) { let j = 0; flip = setInterval(() => { j = (j + 1) % names.length; dir = 0; show(names[j]); }, 1800); }
  }
  function step(dir) {
    stopAudio(); rep = 0;
    const [r, k] = L[i], st = SL.S[k], v = P(), w = words(k, st);
    $('.pa-rk', o).innerHTML = `Rak'ah ${r} of ${PR[2]} · ${Array.from({ length: PR[2] }, (_, j) => `<i class="${j + 1 < r ? 'd' : j + 1 === r ? 'c' : ''}"></i>`).join('')}`;
    $('.pa-bar i', o).style.width = ((i + 1) / L.length * 100) + '%';
    pose(st, dir);
    $('.pa-cue', o).textContent = CUE[k] ? 'Say: ' + CUE[k] : ''; $('.pa-cue', o).classList.toggle('on', !!CUE[k]);
    const wb = WBW[k];
    const arHTML = wb ? (k === 'fatiha' ? SL.FAT : SL.IKH).split(' ').filter(t => t && !/^[﴾﴿]/.test(t) && !/^﴿/.test(t)).length && buildWords(k) : esc(w.ar);
    const sc = st.sc ? st.sc[v.school] : '';
    $('.pa-copy', o).innerHTML = `<small class="pa-step">Step ${i + 1} of ${L.length}</small><h2>${esc(st.t)}</h2><p class="pa-do">${esc(doText(k, st, v))}</p>
      ${REPS[k] && w.ar ? `<div class="pa-rep">${[1, 2, 3].map(n => `<i data-n="${n}"></i>`).join('')}<span>Say it 3 times</span></div>` : ''}
      ${w.ar && v.ar ? `<p class="pa-ar" lang="ar" dir="rtl">${arHTML}${w.ar2 ? `<br>${esc(w.ar2)}` : ''}</p>` : ''}
      ${w.tr && v.tr ? `<p class="pa-tr">${esc(w.tr)}${w.tr2 ? ` · ${esc(w.tr2)}` : ''}</p>` : ''}
      ${w.en && v.en ? `<p class="pa-en">${esc(w.en)}${w.en2 ? ` ${esc(w.en2)}` : ''}</p>` : ''}
      ${wb && v.ar ? '<small class="pa-hint">Tap any word to hear it on its own.</small>' : ''}`;
    const au = audioFor(k, st, LOC); $('.pa-play', o).style.visibility = au.length ? '' : 'hidden';
    $('[data-prev]', o).disabled = i === 0;
    $('[data-next] span', o).textContent = i === L.length - 1 ? 'Finish' : 'Next';
    if (navigator.vibrate) navigator.vibrate(12);
    $('.pa-stage', o).scrollTop = 0;
    if (au.length && v.voice) timer = setTimeout(() => play(), 600); else if (v.auto) wait(stepSecs(k, st, v, false));
  }
  function buildWords(k) {
    const src = k === 'fatiha' ? SL.FAT : SL.IKH;
    const ayat = src.split(/\s*﴿[^﴾]*﴾\s*/).filter(Boolean);
    return ayat.map((a, ai) => a.trim().split(/\s+/).map((wd, wi) => { const [s, n] = WBW[k][ai] || [1, 1]; return `<span class="pa-w" data-w="${pad(s)}_${pad(n)}_${pad(wi + 1)}">${esc(wd)}</span>`; }).join(' ') + ` <span class="pa-n">﴿${'١٢٣٤٥٦٧'[ai]}﴾</span>`).join(' ');
  }
  function play() {
    const [, k] = L[i], st = SL.S[k], v = P(); const list = audioFor(k, st, LOC); if (!list.length) return;
    stopAudio(); let j = 0; o.classList.add('speaking');
    const total = REPS[k] || 1;
    const next = () => {
      if (j >= list.length) {
        rep++; const dots = $$('.pa-rep i', o); dots.forEach((d, n) => d.classList.toggle('on', n < rep));
        if (rep < total) { j = 0; timer = setTimeout(next, 700); return; }
        o.classList.remove('speaking'); A = null; $$('.pa-w.cur', o).forEach(x => x.classList.remove('cur')); if (P().auto) wait(stepSecs(k, st, P(), true)); return;
      }
      if (WBW[k]) { const ws = $$('.pa-w', o); $$('.pa-w.cur', o).forEach(x => x.classList.remove('cur')); const [sn, an] = WBW[k][j] || []; const cur = ws.filter(x => x.dataset.w.startsWith(`${pad(sn)}_${pad(an)}_`)); cur.forEach(x => x.classList.add('cur')); const stg = $('.pa-stage', o); if (cur[0] && stg) { const r = cur[0].getBoundingClientRect(), sr = stg.getBoundingClientRect(); if (r.top < sr.top + 40 || r.bottom > sr.bottom - 60) stg.scrollTo({ top: stg.scrollTop + r.top - sr.top - sr.height * .3, behavior: 'smooth' }); } }
      A = new Audio(list[j]); A.playbackRate = v.speed; A.onended = () => { j++; next(); }; A.onerror = () => { j++; next(); };
      A.play().catch(() => { o.classList.remove('speaking'); toast('Tap Listen to start the recitation'); });
    };
    next();
  }
  function wait(secs) { const v = P(), ring = $('.pa-ring', o); v.gap = secs || 5; ring.style.setProperty('--t', v.gap + 's'); ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go'); const nx = $('[data-next] span', o), lbl = nx.textContent.replace(/ ·.*/, ''), id = ++waitId; let left = v.gap; const tick = () => { if (!o.isConnected || id !== waitId || !ring.classList.contains('go')) { if (id === waitId) nx.textContent = lbl; return; } nx.textContent = left > 0 ? `${lbl} · ${left}` : lbl; left--; if (left >= 0) setTimeout(tick, 1000); }; tick(); timer = setTimeout(() => go(1), v.gap * 1000); }
  function go(d) {
    if (d > 0 && i >= L.length - 1) { stopAudio(); done(); return; }
    i = Math.max(0, Math.min(L.length - 1, i + d)); step(d);
  }
  function done() {
    const n = store.get('paDone', 0) + 1; store.set('paDone', n);
    clearInterval(flip); $('.pa-stage', o).innerHTML = `<div class="pa-end">${SL.pic(SL.S.salam, 'pa-fig')}<h2>Masha'Allah, you prayed ${esc(PR[1])}</h2><p>May Allah accept it from you. You've prayed along ${n} time${n > 1 ? 's' : ''}.</p><button type="button" class="btn g" data-again>Pray along again</button><button type="button" class="btn ghost" data-close>Close</button></div>`;
    $('.pa-ctl', o).hidden = true;
  }
  shell(); step(0);

  /* tap anywhere on the picture/words to go on; swipe left/right between steps */
  let sx = 0, sy = 0, moved = false;
  o.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = false; }, { passive: true });
  o.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && e.target.closest('.pa-stage')) { moved = true; go(dx < 0 ? 1 : -1); } }, { passive: true });
  o.addEventListener('click', e => {
    if (moved) { moved = false; return; }
    const w = e.target.closest('[data-w]'); if (w) { stopAudio(); A = new Audio(`https://audio.qurancdn.com/wbw/${w.dataset.w}.mp3`); $$('.pa-w.on', o).forEach(x => x.classList.remove('on')); w.classList.add('on'); A.onended = () => w.classList.remove('on'); A.play().catch(() => {}); return; }
    if (e.target.closest('[data-close]')) { close(); return; }
    if (e.target.closest('[data-again]')) { $('.pa-ctl', o).hidden = false; i = 0; shell(); step(0); return; }
    if (e.target.closest('[data-next]')) { go(1); return; }
    if (e.target.closest('[data-prev]')) { go(-1); return; }
    if (e.target.closest('[data-play]')) { if (A) stopAudio(); else play(); return; }
    if (e.target.closest('[data-opts]')) { const b = $('.pa-opts', o); b.hidden = !b.hidden; if (!b.hidden) { stopAudio(); opts(); } return; }
    const ob = e.target.closest('[data-o],[data-wsel],[data-speed],[data-auto],[data-gap],[data-pace],[data-school]'); if (ob) {
      const v = P();
      if (ob.dataset.o) v[ob.dataset.o] = v[ob.dataset.o] ? 0 : 1; if (ob.dataset.wsel) v.w = ob.dataset.wsel;
      if (ob.dataset.speed) v.speed = +ob.dataset.speed; if (ob.dataset.auto) v.auto = +ob.dataset.auto; if (ob.dataset.gap) v.gap = +ob.dataset.gap; if (ob.dataset.pace) v.pace = ob.dataset.pace; if (ob.dataset.school) v.school = ob.dataset.school;
      store.set('paOpts', v); opts(); return;
    }
    if (e.target.closest('[data-done]')) { $('.pa-opts', o).hidden = true; step(0); return; }
    if (e.target.closest('[data-tapnext]') && !e.target.closest('button,a')) go(1);
  });
}
window.IFM_PRAYALONG = { open, opts: P };
})();
