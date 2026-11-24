/* Inspire FM · Duas: Hisn al-Muslim (267) + Qur'anic duas, tagged for search, with real recited audio
   (HisnMuslim.com recitation per dua, Mishary Alafasy per ayah via everyayah.com). No text-to-speech. */
(function () {
'use strict';
const X = window.IFMX, H = window.IFM_HISN; if (!X || !H) return;
const { $, $$, esc, store, toast, copy, TOOLS } = X;

/* ---------- search: forgiving of spelling, slang and missing letters ---------- */
const STOP = new Set('can not cant go get got keep anymore all time stop i im am a an the my me and or to of is it its be been so very really just like feel feeling feels felt dua duas doa dua for when what how do does want need some about with in on at this that what which who you your please help'.split(' '));
const SWAP = { cant: 'can not', cannot: 'can not', dont: 'do not', wont: 'will not', idk: 'do not know', im: 'i am', ive: 'i have', isnt: 'is not', doesnt: 'does not', didnt: 'did not', havent: 'have not', u: 'you', ur: 'your', bc: 'because', cuz: 'because', coz: 'because', rn: 'right now', tbh: '', ngl: '', smth: 'something', sum1: 'someone', mum: 'mum mother', mom: 'mum mother', dad: 'dad father', bf: 'boyfriend', gf: 'girlfriend', hubby: 'husband', wifey: 'wife', ppl: 'people', pls: '', plz: '' };
function norm(s) {
  s = (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9؀-ۿ]+/g, ' ');
  s = s.replace(/(.)\1{2,}/g, '$1$1');
  return s.split(' ').map(w => SWAP[w] !== undefined ? SWAP[w] : w).join(' ').replace(/\s+/g, ' ').trim();
}
function lev(a, b) { if (Math.abs(a.length - b.length) > 2) return 9; const m = a.length, n = b.length; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
const stem = w => w.length > 5 ? w.replace(/(ings|ing|ness|ies|ed|es|ly|s)$/, '') : w;
function idx(text) { const t = norm(text); return { t: ' ' + t + ' ', w: [...new Set(t.split(' ').filter(Boolean).map(stem))] }; }
function score(q, I) {
  const qn = norm(q); if (!qn) return 0; let s = 0;
  if (qn.length > 3 && I.t.includes(' ' + qn + ' ')) s += 12; else if (qn.length > 4 && I.t.includes(qn)) s += 6;
  const toks = qn.split(' ').filter(w => w && !STOP.has(w)).map(stem); if (!toks.length) return s;
  let hit = 0;
  toks.forEach(t => {
    let best = 0;
    for (const w of I.w) {
      if (w === t) { best = 3; break; }
      if (t.length >= 3 && w.startsWith(t)) best = Math.max(best, 2);
      else if (t.length >= 4 && w.length >= 4) { const d = lev(t, w); if (d <= (t.length >= 7 ? 2 : 1)) best = Math.max(best, 1.6); }
    }
    if (best) hit++; s += best;
  });
  return hit ? s * (hit / toks.length) : 0;
}
window.IFM_SEARCH = { norm, score, idx, lev };

/* ---------- data ---------- */
const CATS = Object.fromEntries(H.cats.map(c => [c[0], c]));
const CH = Object.fromEntries(H.ch.map(c => [c[0], { id: c[0], en: c[1], ar: c[2], cat: c[3], tags: c[4], src: c[5] }]));
const ALL = [];
H.d.forEach(r => { const c = CH[r[1]]; ALL.push({ ref: 'h' + r[0], id: r[0], ch: r[1], cat: c.cat, title: c.en, ar: r[2], arn: r[3], tr: r[4], en: r[5], note: r[6], rep: r[7], src: r[8], kind: r[9], audio: [`https://www.hisnmuslim.com/audio/ar/${r[0]}.mp3`] }); });
H.q.forEach(r => { const [s, a] = r[0][0].split(':'); ALL.push({ ref: 'q' + r[0][0], keys: r[0], ch: 0, cat: 'quran', title: r[1], ar: r[2], tr: r[3], en: r[4], tags: r[5], src: [`Qur'an ${s}:${r[0].length > 1 ? a + '-' + r[0][r[0].length - 1].split(':')[1] : a}`], kind: 'd', audio: r[0].map(k => { const [x, y] = k.split(':'); return `https://everyayah.com/data/Alafasy_128kbps/${String(x).padStart(3, '0')}${String(y).padStart(3, '0')}.mp3`; }) }); });
const BY = Object.fromEntries(ALL.map(d => [d.ref, d]));
ALL.forEach(d => { const c = CH[d.ch]; d.I = idx([d.title, c ? c.tags : '', d.tags || '', CATS[d.cat][1], d.en, d.tr].join(' ')); d.Ih = idx([d.title, c ? c.tags : '', d.tags || ''].join(' ')); });
const CHS = H.ch.map(c => CH[c[0]]);
CHS.forEach(c => { c.items = ALL.filter(d => d.ch === c.id); c.I = idx(c.en + ' ' + c.tags + ' ' + CATS[c.cat][1]); });
const QD = ALL.filter(d => d.cat === 'quran');
const ESSENTIAL = ['h121', 'h120', 'h122', 'h123', 'h124', 'q2:201', 'q3:173', 'h79', 'h88', 'h86', 'h84', 'q20:25', 'q17:24', 'h136', 'h139', 'h154', 'h193', 'h144'];
const SUGG = ['anxious', 'exam', "can't sleep", 'leaving the house', 'debt', 'parents', 'grief', 'angry', 'travel', 'forgiveness', 'new baby', 'sick', 'morning adhkar', 'marriage', 'scared', 'evil eye', 'rain', 'istikhara', 'job interview', 'after salah'];

function search(q, n = 40) {
  const R = ALL.map(d => ({ d, s: score(q, d.Ih) * 1.4 + score(q, d.I) })).filter(x => x.s > 1.2).sort((a, b) => b.s - a.s);
  return R.slice(0, n).map(x => x.d);
}

/* ---------- audio: one player for the whole app ---------- */
let A = null, cur = null, queue = [], qi = 0, onEnd = null;
function stop() { if (A) { A.pause(); A.onended = null; A = null; } if (cur) cur.forEach(b => { b.classList.remove('on'); b.style.removeProperty('--p'); }); cur = null; cancelAnimationFrame(raf); }
let raf = 0;
function tick() { if (!A || !cur) return; const p = A.duration ? (qi + A.currentTime / A.duration) / queue.length : 0; cur.forEach(b => b.style.setProperty('--p', (p * 100).toFixed(1) + '%')); raf = requestAnimationFrame(tick); }
function play(d, btns, done) {
  const same = cur && cur[0] && cur[0].dataset.play === d.ref; stop(); if (same) return;
  queue = d.audio.slice(); qi = 0; cur = btns; onEnd = done; btns.forEach(b => b.classList.add('on'));
  const next = () => {
    if (qi >= queue.length) { const f = onEnd; stop(); f && f(); return; }
    A = new Audio(queue[qi]); A.preload = 'auto';
    A.onended = () => { qi++; next(); };
    A.onerror = () => { toast("Couldn't load the recitation. Check your connection."); stop(); };
    A.play().catch(() => { toast('Tap again to play'); stop(); });
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  };
  next();
  let L = store.get('duaRc2', []).filter(x => x !== d.ref); L.unshift(d.ref); store.set('duaRc2', L.slice(0, 12));
}
window.IFM_PLAY_STOP = stop;

/* ---------- view prefs ---------- */
const P = () => store.get('duaView', { ar: 1, tr: 1, en: 1, big: 0 });
const saved = () => store.get('duaBm2', []);
const isSaved = r => saved().includes(r);

/* ---------- card ---------- */
const ic = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M6 3.5h12v17l-6-4.2-6 4.2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  saved: '<svg viewBox="0 0 24 24"><path d="M6 3.5h12v17l-6-4.2-6 4.2z" fill="currentColor"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  go: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
};
function card(d, o = {}) {
  const v = P(), c = CATS[d.cat];
  const src = d.src && d.src.length ? d.src.join(' · ') : 'Hisn al-Muslim';
  return `<article class="dk-card${d.kind === 'h' ? ' hd' : ''}" data-ref="${d.ref}" style="--c:${c[2]}">
    ${o.title !== false ? `<div class="dk-h"><span class="dk-cat">${esc(c[1])}</span><b>${esc(d.title)}</b></div>` : ''}
    ${d.kind === 'h' ? '<span class="dk-kind">Guidance from the Sunnah</span>' : ''}
    ${v.ar ? `<p class="dk-ar${v.big ? ' big' : ''}" lang="ar" dir="rtl">${esc(d.ar)}</p>${d.arn ? `<p class="dk-arn" lang="ar" dir="rtl">${esc(d.arn)}</p>` : ''}` : ''}
    ${v.tr && d.tr ? `<p class="dk-tr">${esc(d.tr)}</p>` : ''}
    ${v.en ? `<p class="dk-en">${esc(d.en)}</p>` : ''}
    ${d.note ? `<p class="dk-note">${esc(d.note)}</p>` : ''}
    <div class="dk-foot">
      <button type="button" class="dk-play" data-play="${d.ref}" aria-label="Listen to the recitation"><span class="dk-pi">${ic.play}${ic.stop}</span><span>Listen</span></button>
      ${d.rep ? `<span class="dk-rep">${esc(d.rep)}</span>` : ''}
      <span class="dk-src">${esc(src)}</span>
      <button type="button" class="dk-ib${isSaved(d.ref) ? ' on' : ''}" data-save="${d.ref}" aria-label="Save">${isSaved(d.ref) ? ic.saved : ic.save}</button>
      <button type="button" class="dk-ib" data-copy="${d.ref}" aria-label="Copy">${ic.copy}</button>
      <button type="button" class="dk-ib" data-share="${d.ref}" aria-label="Share">${ic.share}</button>
    </div></article>`;
}
function text(d) { return `${d.title}\n\n${d.ar}\n\n${d.tr ? d.tr + '\n\n' : ''}${d.en}${d.rep ? ' (' + d.rep + ')' : ''}\n(${d.src && d.src.length ? d.src.join(', ') : 'Hisn al-Muslim'})\n\nShared from the Inspire FM 105.1 app`; }
function wire(root) {
  if (root._wired) return; root._wired = 1;
  root.addEventListener('click', e => {
    const p = e.target.closest('[data-play]'); if (p) { const d = BY[p.dataset.play]; const btns = $$(`[data-play="${d.ref}"]`, root); const auto = root.querySelector('.dk-auto input'); play(d, btns, () => { if (auto && auto.checked) { const cards = $$('.dk-card', root); const i = cards.findIndex(c => c.dataset.ref === d.ref); const nx = cards[i + 1]; if (nx) { nx.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => nx.querySelector('[data-play]').click(), 450); } } }); return; }
    const s = e.target.closest('[data-save]'); if (s) { const r = s.dataset.save; let L = saved(); L = L.includes(r) ? L.filter(x => x !== r) : [r, ...L]; store.set('duaBm2', L); $$(`[data-save="${r}"]`).forEach(b => { b.classList.toggle('on', L.includes(r)); b.innerHTML = L.includes(r) ? ic.saved : ic.save; }); toast(L.includes(r) ? 'Saved' : 'Removed from saved'); renderTbSaved(); return; }
    const c = e.target.closest('[data-copy]'); if (c) { copy(text(BY[c.dataset.copy]), 'Dua copied'); return; }
    const sh = e.target.closest('[data-share]'); if (sh) { const t = text(BY[sh.dataset.share]); X.share({ title: 'Dua', text: t }); return; }
  });
}
window.IFM_DUA = { get: r => BY[r], card, wire, play, stop, search, all: ALL };

/* ---------- screen ---------- */
function mount(node) {
  wire(node);
  let view = { k: 'home' };
  const hist = [];
  node.innerHTML = `<div class="dk">
    <div class="dk-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" class="dkQ" placeholder="What do you need a dua for?" aria-label="Search duas" autocomplete="off"><button type="button" class="dkX" hidden aria-label="Clear">×</button></div>
    <div class="dk-sugg dkSug"></div>
    <div class="dk-opts dkOpts"></div>
    <div class="dkBody"></div></div>`;
  const body = $('.dkBody', node), Q = $('.dkQ', node), sug = $('.dkSug', node);
  const opts = () => { const v = P(); $('.dkOpts', node).innerHTML = [['ar', 'Arabic'], ['tr', 'Transliteration'], ['en', 'Meaning'], ['big', 'Large Arabic']].map(([k, n]) => `<button type="button" data-v="${k}" aria-pressed="${!!v[k]}">${n}</button>`).join(''); };
  opts();
  $('.dkOpts', node).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const v = P(); v[b.dataset.v] = v[b.dataset.v] ? 0 : 1; if (!v.ar && !v.tr && !v.en) v.ar = 1; store.set('duaView', v); opts(); render(); };
  let ph = 0; const PH = ['Try: anxious, exam, leaving the house…', "Try: can't sleep, debt, parents…", 'Try: angry, grief, travel, rain…', 'Try: new baby, sick, istikhara…'];
  const phT = setInterval(() => { if (!document.body.contains(node)) return clearInterval(phT); if (!Q.value) Q.placeholder = PH[ph++ % PH.length]; }, 3200);

  function suggest(q) {
    const qn = norm(q);
    if (!qn) { sug.innerHTML = SUGG.map(s => `<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join(''); return; }
    const words = new Set(); CHS.forEach(c => (c.tags + ' ' + c.en.toLowerCase()).split(/\s+/).forEach(w => w.length > 2 && words.add(w.replace(/[^a-z'-]/g, ''))));
    QD.forEach(d => d.tags.split(' ').forEach(w => w.length > 2 && words.add(w)));
    const last = qn.split(' ').pop(); const L = [...words].filter(w => w && w.startsWith(last) && w !== last).slice(0, 8);
    const C = CHS.filter(c => score(q, c.I) > 2).slice(0, 4).map(c => c.en);
    sug.innerHTML = L.map(w => `<button type="button" data-q="${esc(qn.slice(0, qn.length - last.length) + w)}">${esc(w)}</button>`).join('') + C.map(t => `<button type="button" class="ch" data-q="${esc(t)}">${esc(t)}</button>`).join('');
  }
  sug.onclick = e => { const b = e.target.closest('[data-q]'); if (!b) return; Q.value = b.dataset.q; go({ k: 'search', q: Q.value }, true); };
  Q.addEventListener('input', () => { $('.dkX', node).hidden = !Q.value; suggest(Q.value); if (Q.value.trim().length > 1) go({ k: 'search', q: Q.value }, false); else if (!Q.value) go({ k: 'home' }, false); });
  $('.dkX', node).onclick = () => { Q.value = ''; $('.dkX', node).hidden = true; suggest(''); go({ k: 'home' }, false); Q.focus(); };

  function go(v, push) { stop(); if (push && view.k !== 'search') hist.push(view); view = v; render(); if (push) node.closest('#scrBody, .page') && (node.closest('#scrBody') || document.scrollingElement).scrollTo({ top: 0, behavior: 'instant' }); }
  function back() { view = hist.pop() || { k: 'home' }; render(); }
  const backBtn = t => `<button type="button" class="dk-back" data-back>${ic.back}${esc(t)}</button>`;

  function render() {
    suggest(Q.value);
    if (view.k === 'home') {
      const sv = saved().map(r => BY[r]).filter(Boolean), rc = store.get('duaRc2', []).map(r => BY[r]).filter(Boolean).filter(d => !saved().includes(d.ref)).slice(0, 6);
      body.innerHTML = `
        <a class="dk-feel" href="#tb-feel">${IFM_TILE('chat', '#385c66', 'sm')}<div><b>How are you feeling?</b><small>Tell us in your own words and get duas, ayat and local support</small></div>${ic.go}</a>
        <h3 class="tb-sec">Browse</h3>
        <div class="dk-cats">${H.cats.map(c => { const n = c[0] === 'quran' ? QD.length : ALL.filter(d => d.cat === c[0]).length; return `<button type="button" class="dk-cat-t" data-cat="${c[0]}" style="--c:${c[2]}"><b>${esc(c[1])}</b><small>${n} duas</small></button>`; }).join('')}</div>
        ${sv.length ? `<h3 class="tb-sec">Saved</h3><div class="dk-list">${sv.map(d => card(d)).join('')}</div>` : ''}
        ${rc.length ? `<h3 class="tb-sec">Recently played</h3><div class="dk-mini">${rc.map(d => `<button type="button" data-open="${d.ref}"><b>${esc(d.title)}</b><span lang="ar" dir="rtl">${esc(d.ar.slice(0, 60))}${d.ar.length > 60 ? '…' : ''}</span></button>`).join('')}</div>` : ''}
        <h3 class="tb-sec">Essential duas</h3><div class="dk-list">${ESSENTIAL.map(r => BY[r]).filter(Boolean).map(d => card(d)).join('')}</div>
        <p class="dk-credit">Duas from <b>Hisn al-Muslim</b> (Fortress of the Muslim) by Sa'id al-Qahtani, with recitations from HisnMuslim.com. Qur'anic duas recited by Mishary Alafasy. Meanings are close translations; for rulings please ask your imam.</p>`;
    } else if (view.k === 'cat') {
      const c = CATS[view.c];
      if (view.c === 'quran') body.innerHTML = `${backBtn('All duas')}<div class="dk-head" style="--c:${c[2]}"><b>${esc(c[1])}</b><small>${QD.length} duas from the Qur'an, recited by Mishary Alafasy</small></div><label class="dk-auto"><input type="checkbox" checked> Play the next one automatically</label><div class="dk-list">${QD.map(d => card(d)).join('')}</div>`;
      else { const L = CHS.filter(x => x.cat === view.c); body.innerHTML = `${backBtn('All duas')}<div class="dk-head" style="--c:${c[2]}"><b>${esc(c[1])}</b><small>${L.length} chapters · ${L.reduce((n, x) => n + x.items.length, 0)} duas</small></div><div class="dk-chs">${L.map(x => `<button type="button" data-ch="${x.id}"><div><b>${esc(x.en)}</b><small lang="ar" dir="rtl">${esc(x.ar)}</small></div><span>${x.items.length}</span>${ic.go}</button>`).join('')}</div>`; }
    } else if (view.k === 'ch') {
      const x = CH[view.id], c = CATS[x.cat];
      body.innerHTML = `${backBtn(c[1])}<div class="dk-head" style="--c:${c[2]}"><b>${esc(x.en)}</b><small lang="ar" dir="rtl">${esc(x.ar)}</small></div>${x.items.length > 1 ? '<label class="dk-auto"><input type="checkbox" checked> Play the next one automatically</label>' : ''}<div class="dk-list">${x.items.map(d => card(d, { title: false })).join('')}</div>`;
    } else if (view.k === 'one') {
      body.innerHTML = `${backBtn('Back')}<div class="dk-list">${card(BY[view.r])}</div>`;
    } else if (view.k === 'search') {
      const R = search(view.q);
      const chs = CHS.map(c => ({ c, s: score(view.q, c.I) })).filter(x => x.s > 2.5).sort((a, b) => b.s - a.s).slice(0, 4);
      body.innerHTML = R.length ? `<p class="dk-count">${R.length} dua${R.length > 1 ? 's' : ''} for <b>${esc(view.q)}</b></p>${chs.length ? `<div class="dk-chs sm">${chs.map(({ c }) => `<button type="button" data-ch="${c.id}"><div><b>${esc(c.en)}</b></div><span>${c.items.length}</span>${ic.go}</button>`).join('')}</div>` : ''}<div class="dk-list">${R.map(d => card(d)).join('')}</div>` : `<div class="tk-empty">No duas match <b>${esc(view.q)}</b> yet. Try another word, like <i>worry</i>, <i>travel</i> or <i>sleep</i>.</div>`;
    }
  }
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-back]'); if (b) { stop(); back(); return; }
    const c = e.target.closest('[data-cat]'); if (c) { go({ k: 'cat', c: c.dataset.cat }, true); return; }
    const h = e.target.closest('[data-ch]'); if (h) { go({ k: 'ch', id: +h.dataset.ch }, true); return; }
    const o = e.target.closest('[data-open]'); if (o) { go({ k: 'one', r: o.dataset.open }, true); return; }
  });
  render();
  node._open = r => go({ k: 'one', r }, true);
}

/* ---------- hook into the app ---------- */
TOOLS.duas = ['Duas', null, node => mount(node)];
const pg = $('.page[data-page="duas"] .sec .wrap');
if (pg) { const keep = document.createElement('div'); keep.hidden = true; keep.innerHTML = '<input id="duaQ"><div id="duaFilt"></div><div id="duaList"></div>'; pg.innerHTML = ''; const m = document.createElement('div'); pg.appendChild(m); pg.appendChild(keep); mount(m); }
function renderTbSaved() {
  const el = $('#tbSaved'); if (!el) return;
  const ids = [...new Set(saved().concat(store.get('duaRc2', [])))].slice(0, 6).map(r => BY[r]).filter(Boolean);
  el.innerHTML = ids.length ? ids.map(d => `<a href="#tb-duas"><small>${isSaved(d.ref) ? 'Saved' : 'Recent'} · ${esc((d.src || [])[0] || 'Hisn al-Muslim')}</small><b>${esc(d.title)}</b><span lang="ar">${esc(d.ar.length > 70 ? d.ar.slice(0, 70) + '…' : d.ar)}</span></a>`).join('') : '<div class="hf-empty">Tap the bookmark on any dua and it stays here.</div>';
}
window.IFM_DUAS_SAVED = renderTbSaved;
setTimeout(renderTbSaved, 0);
})();
