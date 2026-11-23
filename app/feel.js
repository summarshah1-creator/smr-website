/* Inspire FM · How I feel: type a feeling in your own words → Qur'an, duas, Sunnah, psychology, and help in Luton. */
(function () {
'use strict';
const X = window.IFMX, L = window.IFM_FEEL, SR = window.IFM_SEARCH, DU = window.IFM_DUA; if (!X || !L || !SR) return;
const { $, $$, esc, store, toast, TOOLS } = X;
const { F, S, SRC, G } = L;
F.forEach(f => { f.I = SR.idx([f.n, f.tags, f.say.join(' ')].join(' ')); });
const BYID = Object.fromEntries(F.map(f => [f.id, f]));
const CRISIS = /\b(kill(ing)? my ?self|suicid|end (it|my life|it all)|want(ed)? to die|wanna die|don ?t want to (live|be here)|no reason to live|better off dead|self ?harm|hurt(ing)? my ?self|cut(ting)? my ?self|overdose)/;
const UNSAFE = /\b(hits? me|beat(s|ing)? me|hurting me|abus|forced (to )?marr|threaten|controls? me|scared of my (husband|wife|dad|father|mum|mother|brother|family))/;
function match(q) {
  const n = SR.norm(q); const out = [];
  if (CRISIS.test(n)) out.push(BYID.crisis);
  if (UNSAFE.test(n)) out.push(BYID.unsafe);
  F.map(f => ({ f, s: SR.score(q, f.I) * (f.crisis ? 0.35 : 1) })).filter(x => x.s > 1.4).sort((a, b) => b.s - a.s).forEach(x => { if (!out.includes(x.f)) out.push(x.f); });
  return out.slice(0, 5);
}
const PROMPTS = F.filter(f => !f.crisis).flatMap(f => f.say.map(s => [s, f.id]));
const qurl = k => { const [s, a] = k.split(':'); return `https://everyayah.com/data/Alafasy_128kbps/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`; };
const sun = r => { const m = r.match(/^(Bukhari|Muslim|Abu Dawud|Tirmidhi|Ibn Majah|Nasa'i) (\d+)/); if (!m) return ''; const k = { Bukhari: 'bukhari', Muslim: 'muslim', 'Abu Dawud': 'abudawud', Tirmidhi: 'tirmidhi', 'Ibn Majah': 'ibnmajah', "Nasa'i": 'nasai' }[m[1]]; return `https://sunnah.com/${k}:${m[2]}`; };
const QT = {};
async function arabic(keys, node) {
  for (const k of keys) {
    const el = node.querySelector(`[data-ar="${k}"]`); if (!el) continue;
    const hit = window.IFM_HISN_QT && window.IFM_HISN_QT[k];
    if (hit || QT[k]) { el.textContent = hit || QT[k]; continue; }
    try { const r = await fetch(`https://api.quran.com/api/v4/verses/by_key/${k}?fields=text_uthmani`); const j = await r.json(); QT[k] = j.verse.text_uthmani; el.textContent = QT[k]; } catch (e) { el.remove(); }
  }
}
let A = null;
function playAyah(k, btn) { if (A) { A.pause(); const was = A._btn; A = null; $$('.fl-ay .on').forEach(b => b.classList.remove('on')); if (was === btn) return; } A = new Audio(qurl(k)); A._btn = btn; btn.classList.add('on'); A.onended = () => { btn.classList.remove('on'); A = null; }; A.play().catch(() => { btn.classList.remove('on'); toast('Tap again to play'); }); }

function svc(id) { const s = S[id]; if (!s) return ''; const ext = /^https?:/.test(s[3]); return `<a class="fl-svc${s[5] ? ' lu' : ''}" href="${s[3]}"${ext ? ' target="_blank" rel="noopener"' : ''}><div><b>${esc(s[0])}</b>${s[5] ? '<span class="fl-lu">Luton</span>' : ''}<small>${esc(s[1])}</small><em>${esc(s[2])}</em></div><span class="fl-cta">${esc(s[4])}</span></a>`; }

function breathe(node) {
  const o = document.createElement('div'); o.className = 'fl-br'; o.innerHTML = `<div class="fl-br-c"><div class="fl-ring"></div><b id="flBrT">Breathe in</b><small id="flBrS">4 seconds</small></div><p>Breathe in through your nose for 4, out slowly for 6. On each out-breath, say <i>SubhanAllah</i> in your heart.</p><button type="button" class="btn g">Done</button>`;
  document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('on'));
  let n = 0, t; const step = () => { const inn = n % 2 === 0; o.classList.toggle('out', !inn); $('#flBrT', o).textContent = inn ? 'Breathe in' : 'Breathe out… SubhanAllah'; $('#flBrS', o).textContent = inn ? '4 seconds' : '6 seconds'; n++; t = setTimeout(step, inn ? 4000 : 6000); }; step();
  o.querySelector('button').onclick = () => { clearTimeout(t); o.classList.remove('on'); setTimeout(() => o.remove(), 300); };
}

function detail(f, node) {
  const log = store.get('feelLog', []); log.unshift([f.id, Date.now()]); store.set('feelLog', log.slice(0, 60));
  const dua = (f.d || []).map(r => DU && DU.get(r)).filter(Boolean);
  const ex = '';
  node.innerHTML = `${ex}<button type="button" class="dk-back" data-home><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>All feelings</button>
  <div class="fl-hero${f.crisis ? ' cr' : ''}" style="--c:${f.c}">${IFM_TILE(f.e, f.c, 'lg')}<h2>${esc(f.n)}</h2><p>${esc(f.hi)}</p>${f.try ? '<button type="button" class="fl-try" data-breathe>' + IFM_IC('wind') + ' Breathe with me, 1 minute</button>' : ''}</div>
  ${f.crisis ? `<h3 class="tb-sec">Talk to someone now</h3><div class="fl-svcs">${f.help.map(svc).join('')}</div>` : ''}
  ${f.both && f.both.length ? `<h3 class="tb-sec">Where faith and psychology agree</h3><div class="fl-both">${f.both.map(b => `<div><p><span class="fl-tag i">Islam</span>${esc(b[0])}</p><p><span class="fl-tag p">Psychology</span>${esc(b[1])}</p><p class="do"><span class="fl-tag d">Try this</span>${esc(b[2])}</p></div>`).join('')}</div>` : ''}
  ${f.q && f.q.length ? `<h3 class="tb-sec">From the Qur'an</h3><div class="fl-ays">${f.q.map(q => `<div class="fl-ay"><p class="ar" lang="ar" dir="rtl" data-ar="${q[0]}"></p><p class="en">“${esc(q[1])}”</p>${q[2] ? `<small>${esc(q[2])}</small>` : ''}<div class="fl-ayf"><a href="https://quran.com/${q[0].replace(':', '/')}" target="_blank" rel="noopener">Qur'an ${q[0]}</a><button type="button" data-ayah="${q[0]}">▶ Listen</button></div></div>`).join('')}</div>` : ''}
  ${dua.length ? `<h3 class="tb-sec">Duas to say</h3><div class="dk-list" id="flDuas">${dua.map(d => DU.card(d)).join('')}</div>` : ''}
  ${f.h && f.h.length ? `<h3 class="tb-sec">The Prophet ﷺ said</h3><div class="fl-had">${f.h.map(h => { const u = sun(h[1]); return `<blockquote><p>${esc(h[0])}</p><cite>${u ? `<a href="${u}" target="_blank" rel="noopener">${esc(h[1])}</a>` : esc(h[1])} · ${esc(h[2])}</cite></blockquote>`; }).join('')}</div>` : ''}
  ${f.sun && f.sun.length ? `<h3 class="tb-sec">Sunnah practices</h3><ul class="fl-ul">${f.sun.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
  ${f.psy && f.psy.length ? `<h3 class="tb-sec">What psychology suggests</h3><div class="fl-psy">${f.psy.map(p => `<div><b>${esc(p[0])}</b><p>${esc(p[1])}</p></div>`).join('')}</div>` : ''}
  ${!f.crisis ? `<h3 class="tb-sec">Help in Luton & beyond</h3><div class="fl-svcs">${f.help.map(svc).join('')}</div>` : ''}
  ${!f.crisis && f.id !== 'grateful' ? `<div class="fl-urg">If you ever feel you can't keep yourself safe: <a href="tel:999">999</a> · <a href="tel:111">111 option 2</a> · Samaritans <a href="tel:116123">116 123</a></div>` : ''}
  <details class="fl-src"><summary>Sources</summary><ul>${f.src.map(k => SRC[k] ? `<li><a href="${SRC[k][1]}" target="_blank" rel="noopener">${esc(SRC[k][0])}</a></li>` : '').join('')}</ul><p>Qur'an meanings are written in plain English by us. Hadith gradings follow sunnah.com. This is guidance, not a fatwa or a diagnosis.</p></details>`;
  arabic((f.q || []).map(q => q[0]), node);
  if (DU) DU.wire(node);
  const ex2 = $('#flExit', node); if (ex2) ex2.onclick = () => { location.replace('https://www.bbc.co.uk/weather'); };
}

TOOLS.feel = ['How I feel', null, node => {
  node.innerHTML = `<div class="fl"><div class="fl-intro"><b>How are you feeling?</b><small>Say it in your own words. Nothing you type leaves your phone.</small></div>
    <div class="dk-search fl-s"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" id="flQ" placeholder="I feel…" autocomplete="off" aria-label="How are you feeling"></div>
    <div class="fl-sug" id="flSug"></div><div id="flBody"></div></div>`;
  const Q = $('#flQ', node), sug = $('#flSug', node), body = $('#flBody', node);
  let ph = 0; const PH = ['I feel anxious…', "I can't sleep…", 'I miss my mum…', "I'm stressed about exams…", 'I feel far from Allah…', "I'm so angry…"];
  const phT = setInterval(() => { if (!document.body.contains(node)) return clearInterval(phT); if (!Q.value) Q.placeholder = PH[ph++ % PH.length]; }, 2600);
  function home() {
    const log = store.get('feelLog', []).slice(0, 7).map(x => BYID[x[0]]).filter(Boolean);
    body.innerHTML = `
      ${G.map(([g, gn]) => `<h3 class="tb-sec">${esc(gn)}</h3><div class="fl-grid">${F.filter(f => f.g === g).map(f => `<button type="button" class="fl-f${f.crisis === 2 ? ' cr' : ''}" data-f="${f.id}" style="--c:${f.c}">${IFM_TILE(f.e, f.c)}<b>${esc(f.n)}</b></button>`).join('')}</div>`).join('')}
      <p class="dk-credit">Built from the Qur'an and authentic Sunnah, scholar-reviewed Islamic psychology (Yaqeen Institute, Khalil Center, Stanford Muslim Mental Health Lab) and NHS guidance. Local services checked November 2026.</p>`;
    sug.innerHTML = PROMPTS.filter((_, i) => i % 4 === 0).slice(0, 10).map(([s, id]) => `<button type="button" data-f="${id}">${esc(s)}</button>`).join('');
  }
  function results(q) {
    const M = match(q); const n = SR.norm(q);
    const P = PROMPTS.map(([s, id]) => ({ s, id, sc: SR.score(q, SR.idx(s)) + (SR.norm(s).startsWith(n) ? 4 : 0) })).filter(x => x.sc > 1).sort((a, b) => b.sc - a.sc).slice(0, 8);
    sug.innerHTML = P.map(p => `<button type="button" data-f="${p.id}">${esc(p.s)}</button>`).join('');
    body.innerHTML = M.length ? `${M[0].crisis === 2 ? `<div class="fl-now"><b>You don't have to go through this alone.</b><a href="tel:116123">Call Samaritans 116 123</a><a href="tel:111">NHS 111, option 2</a><a href="tel:999">999 if you're in danger</a></div>` : ''}<p class="dk-count">It sounds like you might be feeling…</p><div class="fl-res">${M.map(f => `<button type="button" class="fl-r" data-f="${f.id}" style="--c:${f.c}">${IFM_TILE(f.e, f.c)}<div><b>${esc(f.n)}</b><small>${esc(f.hi.split('. ')[0])}.</small></div></button>`).join('')}</div>` : `<div class="tk-empty">We couldn't match that yet. Try one of the feelings below, or different words.</div>`;
  }
  Q.addEventListener('input', () => { Q.value.trim().length > 1 ? results(Q.value) : home(); });
  node.addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (b) { detail(BYID[b.dataset.f], body); sug.innerHTML = ''; (node.closest('#scrBody') || document.scrollingElement).scrollTo({ top: 0, behavior: 'instant' }); return; }
    if (e.target.closest('[data-home]')) { if (A) A.pause(); Q.value = ''; home(); return; }
    if (e.target.closest('[data-breathe]')) { breathe(node); return; }
    const a = e.target.closest('[data-ayah]'); if (a) playAyah(a.dataset.ayah, a);
  });
  home();
  const want = sessionStorage.getItem('feelOpen'); if (want && BYID[want]) { sessionStorage.removeItem('feelOpen'); detail(BYID[want], body); }
}];
})();
