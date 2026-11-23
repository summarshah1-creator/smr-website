/* Inspire FM · Quran Stories: list, explore (map, timeline, characters), favourites, bookmarks, search,
   reader with full (chaptered) and short versions, key ayat with recitation, tafsir / hadith boxes. */
(function () {
'use strict';
const X = window.IFMX, ST = window.IFM_STORIES; if (!X || !ST) return;
const { $, $$, esc, store, toast, copy, TOOLS } = X;
const IC = window.IFM_IC, TILE = window.IFM_TILE;
const FX = window.IFM_STORY_X || {}, ERAS = window.IFM_STORY_ERAS || [], MAP = window.IFM_SQMAP;
const BY = Object.fromEntries(ST.map((s, i) => [s.id, Object.assign(s, { n: i + 1, x: FX[s.id] })]));
const pad = n => String(n).padStart(3, '0');
const ayUrl = k => { const [a, b] = k.split(':'); return `https://everyayah.com/data/Alafasy_128kbps/${pad(a)}${pad(b)}.mp3`; };
const pattern = `<svg class="sq-pat" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="sqp" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 2l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/></pattern></defs><rect width="120" height="120" fill="url(#sqp)"/></svg>`;
const img = (s, cls) => `<div class="sq-img ${cls || ''}" style="--a:${s.g[0]};--b:${s.g[1]}">${pattern}<span class="sq-ph">${IC('book')}</span><img src="img/stories/${s.id}.webp" alt="" loading="lazy" onerror="this.remove()" onload="this.parentNode.classList.add('has')"></div>`;
const favs = () => store.get('sqFav', []), marks = () => store.get('sqMark', {});
const back = t => `<button type="button" class="dk-back" data-back><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>${t}</button>`;
const ERA = Object.fromEntries(ERAS.map((e, i) => [e[0], { k: e[0], t: e[1], s: e[2], i }]));
const ERA_C = ['#8a6a1d', '#0f4c5c', '#7c5a2a', '#9a3412', '#5b21b6', '#166534', '#0e7490', '#be185d', '#b45309', '#475569'];
const KIND = { p: ['Prophet', 'star', '#4c7d16'], g: ['Believer', 'heart', '#0e7490'], r: ['Ruler', 'medal', '#b45309'], b: ['Opposed the truth', 'flame', '#9f1239'], a: ['Animal', 'dove', '#7c5a2a'], s: ['Angel or jinn', 'sparkle', '#6d28d9'] };
const QT = store.get('sqQT', {});
async function arabic(el) { const k = el.dataset.ar; if (QT[k]) { el.textContent = QT[k]; return; }
  try { const r = await fetch(`https://api.quran.com/api/v4/verses/by_key/${k}?fields=text_uthmani`); const j = await r.json(); QT[k] = j.verse.text_uthmani; store.set('sqQT', QT); el.textContent = QT[k]; } catch (e) { el.remove(); } }

/* ---------- map ---------- */
const PRJ = (() => { if (!MAP) return null; const [W0, E0, , N0] = MAP.b, c = Math.cos(MAP.c * Math.PI / 180), sx = MAP.w / ((E0 - W0) * c); return (lat, lng) => [(lng - W0) * c * sx, (N0 - lat) * sx]; })();
const LABELS = [['Mediterranean Sea', 34.0, 27.0, 0, 'sea'], ['Red Sea', 21.0, 38.4, 58, 'sea'], ['The Gulf', 27.3, 51.0, 35, 'sea'], ['Gulf of Aden', 12.4, 48.5, 0, 'sea'], ['Caspian', 40.6, 51.0, 0, 'sea'], ['Black Sea', 41.7, 33.5, 0, 'sea'],
  ['EGYPT', 26.3, 29.5, 0, 'land'], ['ARABIA', 24.5, 44.0, 0, 'land'], ['IRAQ', 33.4, 43.2, 0, 'land'], ['SHAM', 34.8, 38.0, 0, 'land'], ['ANATOLIA', 39.2, 33.5, 0, 'land'], ['YEMEN', 16.3, 47.5, 0, 'land'], ['PERSIA', 32.5, 53.5, 0, 'land'], ['NUBIA', 18.5, 31.0, 0, 'land']];
const VIEWS = { all: ['Whole region', null], holy: ['Holy Land & Sham', [29.0, 38.4, 33.6, 37.8]], iraq: ['Iraq', [29.5, 38.5, 40.5, 48.5]], arabia: ['Arabia & Yemen', [12.5, 24.0, 37.0, 50.0]], egypt: ['Egypt', [24.0, 32.0, 27.0, 35.5]] };
function pins() { const L = []; ST.forEach(s => (s.x && s.x.place || []).forEach(p => L.push({ s, n: p[0], lat: p[1], lng: p[2], sure: p[3] }))); return L; }
function mapSvg(view, only, cls) {
  if (!MAP) return '';
  let vb = [0, 0, MAP.w, MAP.h];
  const L = pins().filter(p => !only || only.includes(p.s.id));
  if (view && view !== 'all' && VIEWS[view]) { const [s, n, w, e] = VIEWS[view][1]; const [x0, y0] = PRJ(n, w), [x1, y1] = PRJ(s, e); vb = [x0, y0, x1 - x0, y1 - y0]; }
  else if (only) { const P = L.map(p => PRJ(p.lat, p.lng)); const xs = P.map(p => p[0]), ys = P.map(p => p[1]); let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const pw = Math.max(110, (x1 - x0) * 1.6), ph = pw * .62; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; vb = [cx - pw / 2, cy - ph / 2, pw, ph]; }
  { const asp = only ? 1 / .62 : MAP.w / MAP.h, cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2; if (vb[2] / vb[3] < asp) vb[2] = vb[3] * asp; else vb[3] = vb[2] / asp; vb[0] = cx - vb[2] / 2; vb[1] = cy - vb[3] / 2; }
  const k = vb[2] / MAP.w, r = (only ? 13 : 17) * k, fs = 17 * k;
  // cluster pins that overlap at this zoom
  const C = []; L.forEach(p => { const [x, y] = PRJ(p.lat, p.lng); const c = C.find(c => Math.hypot(c.x - x, c.y - y) < r * 1.9); if (c) c.p.push(p); else C.push({ x, y, p: [p] }); });
  const lab = LABELS.map(([t, la, lo, rot, kd]) => { const [x, y] = PRJ(la, lo); return `<text x="${x}" y="${y}" class="sm-${kd}" font-size="${(kd === 'sea' ? 9 : 10) * k}" transform="rotate(${rot} ${x} ${y})" text-anchor="middle">${t}</text>`; }).join('');
  const pinsSvg = C.map((c, i) => { const s = c.p[0].s, col = ERA_C[(ERA[s.x.era] || {}).i || 0]; const many = new Set(c.p.map(p => p.s.id)).size;
    return `<g class="sm-pin" data-spin="${i}" tabindex="0" role="button" aria-label="${esc(c.p.map(p => p.s.t).join(', '))}"><circle cx="${c.x}" cy="${c.y}" r="${r * 1.9}" fill="${col}" opacity=".18"/><circle cx="${c.x}" cy="${c.y}" r="${r}" fill="${many > 1 ? '#16181b' : col}" stroke="#fff" stroke-width="${r * .28}" ${c.p.every(p => !p.sure) ? `stroke-dasharray="${r * .5} ${r * .35}"` : ''}/><text x="${c.x}" y="${c.y + fs * .36}" font-size="${fs}" text-anchor="middle" class="sm-n">${many > 1 ? many : s.n}</text></g>`; }).join('');
  return { html: `<svg class="sm-svg ${cls || ''}" viewBox="${vb.map(v => v.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of where the stories took place">
    <rect x="-200" y="-200" width="${MAP.w + 400}" height="${MAP.h + 400}" class="sm-sea"/>
    <path d="${MAP.land}" class="sm-land" stroke-width="${.8 * k}"/><path d="${MAP.lake}" class="sm-sea" stroke-width="${.5 * k}"/><path d="${MAP.riv}" class="sm-riv" stroke-width="${1.1 * k}"/>
    ${lab}${pinsSvg}</svg>`, C };
}

TOOLS.stories = ['Quran Stories', null, node => {
  let tab = 'list', cat = 'all', q = '', A = null, view = null, mapV = 'all', who = 'all';
  const size = () => store.get('sqSize', 1.05), full = () => store.get('sqMode', 'full') === 'full';
  const sc = () => node.closest('#scrBody') || document.scrollingElement;
  const top = () => sc().scrollTo({ top: 0, behavior: 'instant' });
  node.innerHTML = `<div class="sq">
    <div class="sq-top"><button type="button" class="sq-ib" data-set aria-label="Text size">${IC('gauge')}</button>
      <div class="sq-seg">${[['list', 'list'], ['fav', 'heart'], ['mark', 'checklist'], ['search', 'eye']].map(([k, i]) => `<button type="button" data-tab="${k}" aria-pressed="${k === tab}" aria-label="${k}">${IC(i)}</button>`).join('')}</div>
      <button type="button" class="sq-ib" data-shareapp aria-label="Share">${IC('link')}</button></div>
    <div class="sq-body"></div></div>`;
  const body = $('.sq-body', node);
  const last = () => { const id = store.get('sqLast'); return id && BY[id]; };
  const fullText = s => s.x ? s.x.ch.map(c => c[0] + ' ' + c[1].map(i => typeof i === 'string' ? i : i.slice(1).join(' ')).join(' ')).join(' ') + ' ' + s.x.who.map(w => w[0] + ' ' + w[2]).join(' ') : '';

  function list() {
    view = null; let L = ST;
    if (tab === 'fav') L = ST.filter(s => favs().includes(s.id));
    if (tab === 'mark') L = ST.filter(s => marks()[s.id] != null);
    if (cat !== 'all') L = L.filter(s => s.c === cat);
    if (tab === 'search' && q) { const n = q.toLowerCase(); L = L.filter(s => (s.t + ' ' + s.s + ' ' + s.r + ' ' + s.p.join(' ') + ' ' + fullText(s)).toLowerCase().includes(n)); }
    const lr = last();
    body.innerHTML = `${tab === 'search' ? `<div class="dk-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" class="sqQ" placeholder="Search stories, people, places…" value="${esc(q)}"></div>` : ''}
      ${tab === 'list' && lr ? `<button type="button" class="sq-last" data-open="${lr.id}"><span>${IC('book')}</span><div><small>Last read</small><b>${esc(lr.t)}</b></div></button>` : ''}
      ${tab === 'list' ? `<div class="sq-explore">${[['map', 'pin', 'Map', 'Where they happened', '#0e7490'], ['time', 'clock', 'Timeline', 'When they happened', '#b45309'], ['who', 'person', 'Characters', 'Who\'s who', '#6d28d9']].map(([k, i, t, d, c]) => `<button type="button" data-view="${k}" style="--c:${c}">${TILE ? TILE(i, c, 'sq-xt') : IC(i)}<b>${t}</b><small>${d}</small></button>`).join('')}</div>` : ''}
      <div class="dk-sugg">${window.IFM_STORY_CATS.map(([k, n]) => `<button type="button" class="${cat === k ? 'ch' : ''}" data-cat="${k}">${n}</button>`).join('')}</div>
      ${L.length ? `<div class="sq-list">${L.map(s => `<button type="button" class="sq-tile" data-open="${s.id}">${img(s)}<div class="sq-cap"><b>${s.n}. ${esc(s.t)}</b><small>${esc(s.s)} · ${esc(s.r)}</small></div>${favs().includes(s.id) ? `<span class="sq-heart">${IC('heart')}</span>` : ''}</button>`).join('')}</div>` : `<div class="tk-empty">${tab === 'fav' ? 'Tap the heart on a story to keep it here.' : tab === 'mark' ? 'Stories you bookmark show here, ready to carry on reading.' : 'No stories match that.'}</div>`}`;
    const i = $('.sqQ', body); if (i) { i.oninput = () => { q = i.value; const pos = i.selectionStart; list(); const j = $('.sqQ', body); j.focus(); j.setSelectionRange(pos, pos); }; if (!q) i.focus(); }
  }

  /* ---------- explore: map ---------- */
  function showMap() {
    view = 'map'; stop();
    const m = mapSvg(mapV);
    const none = ST.filter(s => s.x && !s.x.place.length);
    body.innerHTML = `${back('Stories')}
      <div class="sq-xh"><h3>Where the stories happened</h3><p>Tap a pin. Solid pins are places named in the Qur\'an or clearly known; dashed pins are places given by scholars of tafsir.</p></div>
      <div class="dk-sugg">${Object.entries(VIEWS).map(([k, [t]]) => `<button type="button" class="${mapV === k ? 'ch' : ''}" data-mv="${k}">${t}</button>`).join('')}</div>
      <div class="sm-wrap">${m.html}</div>
      <div class="sm-card" hidden></div>
      <div class="sm-leg"><span><i style="background:#16181b"></i>Dark pins hold several stories: tap to see them</span>${ERAS.filter(e => ST.some(s => s.x && s.x.era === e[0] && s.x.place.length)).map(e => `<span><i style="background:${ERA_C[ERA[e[0]].i]}"></i>${esc(e[1])}</span>`).join('')}</div>
      <h3 class="tb-sec">No fixed place</h3><p class="sq-note">The Qur\'an doesn\'t tie these stories to a place on the map.</p>
      <div class="sq-mini">${none.map(s => `<button type="button" data-open="${s.id}">${img(s)}<b>${esc(s.t)}</b></button>`).join('')}</div>`;
    $$('.sm-pin', body).forEach(g => { const fn = () => { const c = m.C[+g.dataset.spin]; const card = $('.sm-card', body); const seen = new Set();
      card.innerHTML = c.p.filter(p => !seen.has(p.s.id + p.n) && seen.add(p.s.id + p.n)).map(p => `<button type="button" data-open="${p.s.id}">${img(p.s)}<div><b>${p.s.n}. ${esc(p.s.t)}</b><small>${IC('pin')} ${esc(p.n)}</small><small class="${p.sure ? 'ok' : 'tf'}">${p.sure ? 'Named in the Qur\'an or clearly known' : 'Place given by scholars of tafsir'}</small></div></button>`).join('');
      card.hidden = false; $$('.sm-pin', body).forEach(x => x.classList.toggle('on', x === g)); card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
      g.addEventListener('click', fn); g.addEventListener('keydown', e => { if (e.key === 'Enter') fn(); }); });
  }

  /* ---------- explore: timeline ---------- */
  function showTime() {
    view = 'time'; stop();
    body.innerHTML = `${back('Stories')}
      <div class="sq-xh"><h3>When the stories happened</h3><p>From the first people to just before Islam. The Qur\'an rarely gives dates, so this shows the order of eras, not exact years.</p></div>
      <ol class="sq-tl">${ERAS.map((e, i) => { const L = ST.filter(s => s.x && s.x.era === e[0]); if (!L.length) return ''; return `<li style="--c:${ERA_C[i]}"><div class="sq-tlh"><b>${esc(e[1])}</b><small>${esc(e[2])}</small></div>
        <div class="sq-tll">${L.map(s => `<button type="button" data-open="${s.id}">${img(s)}<div><b>${s.n}. ${esc(s.t)}</b><small>${esc(s.x.eraNote)}</small></div></button>`).join('')}</div></li>`; }).join('')}</ol>`;
  }

  /* ---------- explore: characters ---------- */
  function people() { const M = new Map(); ST.forEach(s => (s.x ? s.x.who : []).forEach(([n, k, d]) => { const key = n.toLowerCase(); if (!M.has(key)) M.set(key, { n, k, d, s: [] }); M.get(key).s.push(s); })); return [...M.values()]; }
  function showWho() {
    view = 'who'; stop();
    const P = people(), kinds = Object.keys(KIND).filter(k => P.some(p => p.k === k));
    const L = who === 'all' ? P : P.filter(p => p.k === who);
    body.innerHTML = `${back('Stories')}
      <div class="sq-xh"><h3>Who\'s who</h3><p>${P.length} people, animals and beings from the stories. Prophets are shown with a symbol, never a picture.</p></div>
      <div class="dk-sugg"><button type="button" class="${who === 'all' ? 'ch' : ''}" data-who="all">Everyone</button>${kinds.map(k => `<button type="button" class="${who === k ? 'ch' : ''}" data-who="${k}">${KIND[k][0]}s</button>`.replace('Opposed the truths', 'Opposed the truth').replace('Angel or jinns', 'Angels and jinn').replace('Prophets', 'Prophets')).join('')}</div>
      <div class="sq-who">${L.map(whoCard).join('')}</div>`;
  }
  const whoCard = p => { const K = KIND[p.k] || KIND.g; return `<div class="sq-wc" style="--c:${K[2]}">${TILE ? TILE(K[1], K[2], 'sq-wt') : IC(K[1])}<div><b>${esc(p.n)}</b><small class="sq-wk">${K[0]}</small><p>${esc(p.d)}</p>${p.s ? `<div class="sq-wl">${p.s.map(s => `<button type="button" data-open="${s.id}">${esc(s.t)}</button>`).join('')}</div>` : ''}</div></div>`; };

  /* ---------- reader ---------- */
  function stop() { if (A) { A.pause(); A = null; } $$('.sq-play.on,.sq-qp.on', body).forEach(b => b.classList.remove('on')); }
  function item(i) {
    if (typeof i === 'string') return `<p>${esc(i)}</p>`;
    const [t, a, b] = i;
    if (t === 'q') return `<figure class="sq-q"><div class="sq-ar" lang="ar" dir="rtl" data-ar="${a}"></div><blockquote>${esc(b)}</blockquote><figcaption><button type="button" class="sq-qp" data-ay="${a}">${IC('radio')}<span>Listen</span></button><a href="https://quran.com/${a.replace(':', '/')}" target="_blank" rel="noopener">Qur\'an ${a}</a></figcaption></figure>`;
    if (t === 't' || t === 'h') return `<aside class="sq-box ${t}"><span>${t === 'h' ? IC('chat') + ' From the hadith' : IC('book') + ' From tafsir'}</span><p>${esc(b)}</p><small>${esc(a)}</small></aside>`;
    if (t === '?') return `<div class="sq-think"><span>${IC('quiz')} Think first</span><p>${esc(a)}</p><button type="button" data-reveal>Show the answer</button><p class="sq-ans" hidden>${esc(b)}</p></div>`;
    return '';
  }
  function read(id) {
    stop(); view = 'read'; const s = BY[id]; store.set('sqLast', id);
    const prev = ST[s.n - 2], next = ST[s.n], x = s.x, F = x && full();
    const mins = Math.max(1, Math.round((F ? fullText(s) : s.p.join(' ')).split(/\s+/).length / 200));
    const where = x ? (() => { const m = x.place.length ? mapSvg(null, [s.id], 'mini') : null; const e = ERA[x.era];
      return `<section class="sq-where"><h3>Where & when</h3>${m ? `<div class="sm-wrap mini">${m.html}</div>` : ''}<p><b>${IC('pin')} ${x.place.length ? x.place.map(p => esc(p[0])).join(' · ') : 'No fixed place'}</b><br><small>${esc(x.placeNote)}</small></p><p><b>${IC('clock')} ${esc(e ? e.t : '')}</b><br><small>${esc(x.eraNote)}</small></p><div class="sq-wbtn"><button type="button" data-view="map">See all on the map</button><button type="button" data-view="time">See the timeline</button></div></section>`; })() : '';
    body.innerHTML = `<div class="sq-read" style="--fs:${size()}rem">
      <div class="sq-prog"><i></i></div>
      <div class="sq-rh">${back('Stories')}
        <select class="sq-jump" aria-label="Choose a story">${ST.map(o => `<option value="${o.id}"${o.id === id ? ' selected' : ''}>Story ${o.n}: ${esc(o.t)}</option>`).join('')}</select></div>
      ${img(s, 'hero')}
      <h2 class="sq-title">${s.n}. ${esc(s.t)}</h2>
      <p class="sq-ref">${esc(s.s)} · <a href="https://quran.com/${s.k[0].replace(':', '/')}" target="_blank" rel="noopener">${esc(s.r)}</a> · ${mins} min read</p>
      ${x ? `<div class="sq-mode" role="group" aria-label="Version"><button type="button" data-mode="full" aria-pressed="${F}">Full story</button><button type="button" data-mode="short" aria-pressed="${!F}">Short version</button></div>` : ''}
      <div class="sq-acts"><button type="button" class="sq-play" data-play>${IC('radio')}<span>Listen to the ayat</span></button>
        <button type="button" class="sq-ib${favs().includes(id) ? ' on' : ''}" data-fav aria-label="Favourite">${IC('heart')}</button>
        <button type="button" class="sq-ib${marks()[id] != null ? ' on' : ''}" data-mark aria-label="Bookmark">${IC('checklist')}</button>
        <button type="button" class="sq-ib" data-share aria-label="Share">${IC('link')}</button></div>
      ${F ? `<nav class="sq-chs" aria-label="Chapters">${x.ch.map((c, i) => `<button type="button" data-ch="${i}"><small>${i + 1}</small>${esc(c[0])}</button>`).join('')}</nav>
        <div class="sq-text full">${x.ch.map((c, i) => `<section class="sq-chap" id="sqc${i}"><h3><small>Chapter ${i + 1}</small>${esc(c[0])}</h3>${c[1].map(item).join('')}</section>`).join('')}</div>`
        : `<div class="sq-text">${s.p.map(t => `<p>${esc(t)}</p>`).join('')}</div>`}
      ${x ? `<section class="sq-cast"><h3>Who\'s who</h3><div class="sq-who">${x.who.map(([n, k, d]) => whoCard({ n, k, d })).join('')}</div></section>` : ''}
      ${x && x.wow.length ? `<section class="sq-wow"><h3>${IC('sparkle')} Did you know?</h3>${x.wow.map(([t, src]) => `<div><p>${esc(t)}</p><small>${esc(src)}</small></div>`).join('')}</section>` : ''}
      ${where}
      <div class="sq-lessons"><b>Lessons from this story</b><ul>${s.l.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      ${x ? `<details class="sq-src"><summary>Sources for this story</summary><ul>${x.src.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p>Retold in our own words. The story itself follows the Qur\'an; extra detail comes only from hadith or tafsir and is labelled. Recitation by Mishary Alafasy.</p></details>` : ''}
      <div class="sq-nav">${prev ? `<button type="button" data-open="${prev.id}"><small>Previous</small><b>${esc(prev.t)}</b></button>` : '<span></span>'}${next ? `<button type="button" data-open="${next.id}"><small>Next</small><b>${esc(next.t)}</b></button>` : ''}</div></div>`;
    top();
    $$('[data-ar]', body).forEach(arabic);
    const pos = marks()[id]; if (pos) setTimeout(() => sc().scrollTo({ top: pos, behavior: 'smooth' }), 200);
    $('.sq-jump', body).onchange = e => read(e.target.value);
  }
  // reading progress
  const onScroll = () => { if (view !== 'read') return; const r = $('.sq-read', body), bar = $('.sq-prog i', body); if (!r || !bar) return; const el = sc(); const h = r.offsetHeight - el.clientHeight; bar.style.width = Math.min(100, Math.max(0, (el.scrollTop / Math.max(1, h)) * 100)) + '%'; };
  (node.closest('#scrBody') || window).addEventListener('scroll', onScroll, { passive: true });

  node.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]'); if (t) { stop(); tab = t.dataset.tab; $$('[data-tab]', node).forEach(b => b.setAttribute('aria-pressed', b === t)); list(); top(); return; }
    const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; list(); return; }
    const o = e.target.closest('[data-open]'); if (o) { read(o.dataset.open); return; }
    const v = e.target.closest('[data-view]'); if (v) { ({ map: showMap, time: showTime, who: showWho })[v.dataset.view](); top(); return; }
    const mv = e.target.closest('[data-mv]'); if (mv) { mapV = mv.dataset.mv; showMap(); return; }
    const w = e.target.closest('[data-who]'); if (w) { who = w.dataset.who; showWho(); return; }
    if (e.target.closest('[data-back]')) { stop(); if (view === 'read' || !view) list(); else list(); top(); return; }
    const md = e.target.closest('[data-mode]'); if (md) { store.set('sqMode', md.dataset.mode); read(store.get('sqLast')); return; }
    const ch = e.target.closest('[data-ch]'); if (ch) { const el = $('#sqc' + ch.dataset.ch, body); if (el) sc().scrollTo({ top: el.getBoundingClientRect().top - sc().getBoundingClientRect().top + sc().scrollTop - 70, behavior: 'smooth' }); return; }
    const rv = e.target.closest('[data-reveal]'); if (rv) { rv.nextElementSibling.hidden = false; rv.remove(); return; }
    const qa = e.target.closest('[data-ay]'); if (qa) { const was = qa.classList.contains('on'); stop(); if (was) return; qa.classList.add('on'); A = new Audio(ayUrl(qa.dataset.ay)); A.onended = stop; A.play().catch(() => { stop(); toast('Couldn\'t play. Check your connection'); }); return; }
    const id = store.get('sqLast'); const s = BY[id];
    if (e.target.closest('[data-fav]')) { let F = favs(); F = F.includes(id) ? F.filter(x => x !== id) : [id, ...F]; store.set('sqFav', F); e.target.closest('[data-fav]').classList.toggle('on', F.includes(id)); toast(F.includes(id) ? 'Added to favourites' : 'Removed'); return; }
    if (e.target.closest('[data-mark]')) { const M = marks(); const y = sc().scrollTop; if (M[id] != null) delete M[id]; else M[id] = y; store.set('sqMark', M); e.target.closest('[data-mark]').classList.toggle('on', M[id] != null); toast(M[id] != null ? 'Bookmarked where you are' : 'Bookmark removed'); return; }
    if (e.target.closest('[data-share]')) { const txt = `${s.t} (${s.r})\n\n${s.p.join('\n\n')}\n\nRead the full story in Quran Stories, in the Inspire FM 105.1 app`; X.share({ title: s.t, text: txt }); return; }
    if (e.target.closest('[data-shareapp]')) { X.share({ title: 'Quran Stories', text: 'Quran Stories in the Inspire FM 105.1 app', url: X.siteUrl('tb-stories') }); return; }
    const z = e.target.closest('[data-sz]'); if (z) { const v2 = Math.min(1.5, Math.max(.9, size() + (+z.dataset.sz) * .08)); store.set('sqSize', v2); $('.sq-read', body).style.setProperty('--fs', v2 + 'rem'); return; }
    if (e.target.closest('[data-set]')) { const v2 = size() >= 1.3 ? .95 : +(size() + .12).toFixed(2); store.set('sqSize', v2); const r = $('.sq-read', body); if (r) r.style.setProperty('--fs', v2 + 'rem'); toast('Text size ' + Math.round(v2 * 100 / 1.05) + '%'); return; }
    const p = e.target.closest('[data-play]'); if (p) {
      if (A) { stop(); return; }
      let i = 0; p.classList.add('on');
      const go = () => { if (i >= s.k.length) { stop(); return; } A = new Audio(ayUrl(s.k[i])); A.onended = () => { i++; go(); }; A.play().catch(() => { stop(); toast('Tap again to play'); }); };
      go();
    }
  });
  list();
}];
})();
