/* Luton Community Hub: engagement layer
   1) Questionnaires open as a step-by-step pop-up (one question per screen, progress, tiles, auto-advance).
   2) Few options = tiles, many options = searchable dropdown, across forms and page filters.
   3) Listen: the device's own voice (best British voice it has, picker + speed), with a mini player
      that stays on screen while you browse. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const st = { get(k, d) { try { return JSON.parse(localStorage.getItem('lch-' + k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('lch-' + k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem('lch-' + k); } catch (e) { } } };
const signedIn = () => !!st.get('profile', null);
const toast = t => { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); setTimeout(() => e.classList.remove('on'), 1900); };
let uid = 0; const nid = p => 'ux' + p + (++uid);

/* ---------- line icons (one consistent set) ---------- */
const PATHS = {
  yes: 'M5 12.5l4.5 4.5L19 7', no: 'M6 6l12 12M18 6L6 18', school: 'M3 9l9-5 9 5-9 5zM7 11.5V16c0 1.5 2.5 3 5 3s5-1.5 5-3v-4.5M21 9v5',
  faith: 'M4 21V11a8 8 0 0116 0v10M4 21h16M9 21v-5a3 3 0 016 0v5M12 3v0', heart: 'M12 20s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.4-7 10-7 10z',
  people: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 6.5M18 14a6 6 0 013.5 6',
  youth: 'M12 8a3 3 0 100-6 3 3 0 000 6zM8 22l1-7-3-3 3-3h6l3 3-3 3 1 7', money: 'M16 6.5A4 4 0 009.5 9c0 4.5 1 6-1.5 9H17M7 13h7',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', clock: 'M12 21a9 9 0 110-18 9 9 0 010 18zM12 7v5l3 2', home: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',
  food: 'M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 0-3 3-3 6s1 3 3 3v9', health: 'M3 12h4l2-5 4 10 2-5h6', book: 'M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2zM4 5v16',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7', ball: 'M12 21a9 9 0 110-18 9 9 0 010 18zM12 7l4 3-1.5 4.5h-5L8 10z', art: 'M12 3a9 9 0 100 18c1 0 1.5-.7 1.5-1.5S13 18 13 17a2 2 0 012-2h2a4 4 0 004-4c0-4.4-4-8-9-8zM7.5 11h.01M10 7h.01M15 7h.01',
  older: 'M12 6a2 2 0 100-4 2 2 0 000 4zM9 22l1.5-8L9 10l3-2 2 3 3 1M17 13v9', child: 'M12 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6 10l6 1 6-1M12 11v5M9 22l3-6 3 6',
  screen: 'M3 5h18v12H3zM8 21h8M12 17v4', phone: 'M8 2h8a1 1 0 011 1v18a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2', mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z', pin: 'M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11zM12 12a2 2 0 100-4 2 2 0 000 4z', globe: 'M12 21a9 9 0 110-18 9 9 0 010 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  shield: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z', building: 'M4 21V5l8-3 8 3v16M4 21h16M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4', small: 'M4 20h4v-5H4z',
  med: 'M4 20h4v-5H4zM10 20h4V10h-4z', big: 'M4 20h4v-5H4zM10 20h4V10h-4zM16 20h4V4h-4z', spark: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', hand: 'M7 11V7a2 2 0 014 0v4m0-1V5a2 2 0 014 0v6m0-2a2 2 0 014 0v5a7 7 0 01-7 7h-1a7 7 0 01-6-3l-3-5a2 2 0 013-2l2 2',
  play: 'M7 4l13 8-13 8z', pause: 'M7 4h4v16H7zM14 4h4v16h-4z', prev: 'M18 5L9 12l9 7zM6 5v14', next: 'M6 5l9 7-9 7zM18 5v14', x: 'M6 6l12 12M18 6L6 18', chev: 'M6 9l6 6 6-6', search: 'M11 18a7 7 0 110-14 7 7 0 010 14zM20 20l-4-4',
  listen: 'M3 14v-2a9 9 0 0118 0v2M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2zM21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2z', dot: 'M12 15a3 3 0 100-6 3 3 0 000 6z', save: 'M5 3h11l3 3v15H5zM8 3v5h7M8 21v-7h8v7',
  back: 'M15 18l-6-6 6-6', star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', vid: 'M3 6h13v12H3zM16 10l5-3v10l-5-3', chat: 'M4 5h16v11H9l-5 4z', run: 'M13 4a2 2 0 100-.01M7 21l3-6 3 2v4M10 15l1-5 4 2 3-1M6 10l4-2'
};
const svg = (n, c = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${c}" aria-hidden="true"><path d="${PATHS[n] || PATHS.dot}"/></svg>`;
const ICON_RULES = [[/^yes\b/i, 'yes'], [/^no\b/i, 'no'], [/school|academ|college|education|pupil|learn|tutor/i, 'school'], [/mosque|masjid|faith|church|gurdwara|temple|relig|muslim|islam|christian/i, 'faith'],
  [/charit|donat|give|fundrais|raise money|zakat|sadaqah/i, 'heart'], [/young|youth|teen|16|17|student/i, 'youth'], [/child|famil|parent|baby|kids/i, 'child'], [/older|elder|senior|retire/i, 'older'],
  [/food|meal|hunger|kitchen|cook/i, 'food'], [/health|mental|wellbeing|medical|nhs|care/i, 'health'], [/environment|green|climate|garden|nature/i, 'leaf'], [/sport|football|fitness|active|run/i, 'ball'],
  [/art|creative|music|cultur|design/i, 'art'], [/digital|online|tech|website|computer/i, 'screen'], [/instagram|tiktok|facebook|whatsapp|social|linkedin/i, 'phone'], [/email|newsletter|letter/i, 'mail'],
  [/poster|leaflet|print|banner|flyer|card/i, 'print'], [/video|film/i, 'vid'], [/money|£|grant|fund|income|amount|budget|cost|sponsor/i, 'money'], [/week|month|day|date|deadline|soon|year/i, 'cal'],
  [/morning|evening|afternoon|weekend|hour|time|free/i, 'clock'], [/luton|area|local|where|town|near/i, 'pin'], [/national|uk|england|anywhere/i, 'globe'], [/safe|protect|polic|insur|security|data/i, 'shield'],
  [/community|people|everyone|group|volunteer|partner/i, 'people'], [/home|housing|shelter|premises|venue|building/i, 'building'], [/small|under|less|few|micro/i, 'small'], [/medium|between/i, 'med'], [/large|over|more than|big/i, 'big'],
  [/running now|current/i, 'run'], [/coming|upcoming|plan/i, 'cal'], [/finish|previous|done|already/i, 'yes'], [/help|support|access/i, 'hand'], [/not sure|any|other|all\b/i, 'spark']];
const iconFor = t => { for (const [re, n] of ICON_RULES) if (re.test(t)) return n; return 'dot'; };
const textOf = el => (typeof el === 'string' ? el : el?.textContent || '').replace(/\s+/g, ' ').trim();

/* =========================================================================
   One picker for every dropdown (owner 25 Nov): bottom sheet on phones, popover on desktop.
   The phone's own picker never opens; the search box only shows for long lists (>8) and never
   pops the keyboard by itself on touch screens.
   ========================================================================= */
const PHONE = () => matchMedia('(max-width:640px)').matches, COARSE = () => matchMedia('(pointer:coarse)').matches;
let PK = null;
function pkClose(opts = {}) { if (!PK) return Promise.resolve(); const p = PK; PK = null;
  p.el.classList.remove('on'); p.anchor?.setAttribute('aria-expanded', 'false'); setTimeout(() => p.el.remove(), 230);
  if (opts.focus !== false && p.anchor?.isConnected) p.anchor.focus({ preventScroll: true });
  if (p.hist && !opts.popped) return new Promise(res => { let done = false; const fin = () => { if (done) return; done = true; removeEventListener('popstate', fin); res(); }; addEventListener('popstate', fin); setTimeout(fin, 450); try { history.back(); } catch (e) { fin(); } });
  return Promise.resolve(); }
addEventListener('popstate', () => { if (PK && PK.hist) pkClose({ popped: true, focus: false }); });
function uxPick({ anchor, title = '', options, isOn, onPick, multi = false, limit = 0 }) {
  if (PK) { const same = PK.anchor === anchor; pkClose({ focus: false }); if (same) return; }
  const opts = typeof options === 'function' ? options() : options, id = nid('pk'), phone = PHONE(), many = opts.length > 8;
  const el = document.createElement('div'); el.className = 'pk' + (phone ? ' sheet' : ' pop'); el.dataset.ux = '1';
  el.innerHTML = `<div class="pk-scrim"></div><div class="pk-box" role="dialog" aria-modal="${phone}" aria-label="${esc(title || 'Choose')}">
  ${phone ? `<div class="pk-grab" aria-hidden="true"></div><div class="pk-head"><b>${esc(title || 'Choose one')}</b><button type="button" class="ib pk-x" aria-label="Close">${svg('x')}</button></div>` : ''}
  ${many ? `<div class="pk-s">${svg('search')}<input class="pk-q" type="search" placeholder="Type to search" autocomplete="off" enterkeyhint="search" aria-controls="${id}" aria-label="Search ${esc(title || 'options')}"></div>` : ''}
  <ul class="pk-ul" id="${id}" role="listbox" tabindex="-1" ${multi ? 'aria-multiselectable="true"' : ''} aria-label="${esc(title || 'Options')}"></ul>
  ${multi ? `<div class="pk-foot"><span class="pk-n"></span><button type="button" class="btn p sm pk-done">Done</button></div>` : ''}</div>`;
  document.body.append(el);
  const box = $('.pk-box', el), ul = $('.pk-ul', el), q = $('.pk-q', el); let act = Math.max(0, opts.findIndex(o => isOn(o)));
  const vis = () => { const t = (q?.value || '').trim().toLowerCase(); return opts.filter(o => !t || o.label.toLowerCase().includes(t)); };
  const count = () => { const n = $('.pk-n', el); if (!n) return; const k = opts.filter(isOn).length; n.textContent = k ? `${k} chosen${limit ? ` (up to ${limit})` : ''}` : limit ? `Pick up to ${limit}` : 'Pick as many as you like'; };
  const list = () => { const v = vis(); act = Math.min(act, Math.max(0, v.length - 1));
    ul.innerHTML = v.length ? v.map((o, i) => `<li role="option" id="${id}-${i}" data-i="${opts.indexOf(o)}" aria-selected="${!!isOn(o)}" ${o.dis ? 'aria-disabled="true"' : ''} class="${i === act ? 'act' : ''}">${multi ? `<span class="tk">${svg('yes')}</span>` : ''}<span class="pk-l">${esc(o.label)}</span>${o.n != null ? `<small>${esc(o.n)}</small>` : ''}${!multi ? `<span class="pk-tick">${isOn(o) ? svg('yes') : ''}</span>` : ''}</li>`).join('') : '<li class="none" role="presentation">Nothing matches. Try another word.</li>';
    ul.setAttribute('aria-activedescendant', v.length ? `${id}-${act}` : ''); count(); };
  const place = () => { if (phone || !anchor?.isConnected) return; const r = anchor.getBoundingClientRect(), w = Math.min(Math.max(r.width, 260), 440, innerWidth - 16), below = innerHeight - r.bottom - 12, above = r.top - 12, up = below < 260 && above > below;
    box.style.width = w + 'px'; box.style.left = Math.min(Math.max(8, r.left), innerWidth - w - 8) + 'px'; box.style.maxHeight = Math.max(180, Math.min(420, up ? above : below)) + 'px';
    if (up) { box.style.top = ''; box.style.bottom = (innerHeight - r.top + 6) + 'px'; } else { box.style.bottom = ''; box.style.top = (r.bottom + 6) + 'px'; } };
  const pick = async i => { const o = opts[i]; if (!o || o.dis) return;
    if (multi) { if (limit && !isOn(o) && opts.filter(isOn).length >= limit) { toast(`Pick up to ${limit}`); return; } onPick(o); setTimeout(() => { if (el.isConnected) list(); }, 30); return; }
    await pkClose(); onPick(o); };
  PK = { el, anchor, hist: false, place };
  if (phone) { try { history.pushState({ ...(history.state || {}), pk: 1 }, ''); PK.hist = true; } catch (e) { } }
  anchor?.setAttribute('aria-expanded', 'true'); list(); place();
  requestAnimationFrame(() => { el.classList.add('on'); if (q && !COARSE()) q.focus({ preventScroll: true }); else ul.focus({ preventScroll: true }); $('.act', ul)?.scrollIntoView({ block: 'nearest' }); });
  $('.pk-scrim', el).addEventListener('click', () => pkClose());
  $('.pk-x', el)?.addEventListener('click', () => pkClose());
  $('.pk-done', el)?.addEventListener('click', () => pkClose());
  q?.addEventListener('input', () => { act = 0; list(); });
  ul.addEventListener('click', e => { const li = e.target.closest('li[role=option]'); if (li) pick(+li.dataset.i); });
  box.addEventListener('keydown', e => { const n = $$('li[role=option]', ul).length;
    if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(n - 1, act + 1); list(); $('.act', ul)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); list(); $('.act', ul)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Home' && e.target !== q) { e.preventDefault(); act = 0; list(); }
    else if (e.key === 'End' && e.target !== q) { e.preventDefault(); act = n - 1; list(); }
    else if (e.key === 'Enter' || (e.key === ' ' && e.target !== q)) { e.preventDefault(); const li = $$('li[role=option]', ul)[act]; if (li) pick(+li.dataset.i); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); pkClose(); }
    else if (e.key === 'Tab') { if (phone) { e.preventDefault(); (e.target === q ? ul : (q || ul)).focus(); } else pkClose({ focus: false }); }
    else if (q && !e.ctrlKey && !e.metaKey && e.key.length === 1 && e.target !== q) { q.focus(); } });
  // swipe the sheet down to close
  if (phone) { let y0 = null; box.addEventListener('touchstart', e => { y0 = (e.target.closest('.pk-ul') && ul.scrollTop > 0) ? null : e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchmove', e => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) box.style.transform = `translateY(${dy}px)`; }, { passive: true });
    box.addEventListener('touchend', e => { if (y0 == null) return; const dy = (e.changedTouches[0]?.clientY || y0) - y0; box.style.transform = ''; y0 = null; if (dy > 90) pkClose(); }); }
  return el;
}
addEventListener('resize', () => { if (PK && !PK.el.classList.contains('sheet')) PK.place?.(); });
addEventListener('scroll', e => { if (!PK || PK.el.classList.contains('sheet') || PK.el.contains(e.target)) return; const r = PK.anchor?.getBoundingClientRect(); if (!r || r.bottom < 0 || r.top > innerHeight) pkClose({ focus: false }); else PK.place?.(); }, true);

/* A plain select the hub keeps compact (filters, tables, settings): same look as a field, opens the picker */
const selList = s => [...s.options].filter(o => !o.hidden).map(o => ({ label: textOf(o), value: o.value, dis: o.disabled }));
const selLabel = s => { const l = s.closest('label'); return s.getAttribute('aria-label') || (l ? textOf([...l.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ')) : '') || s.getAttribute('title') || ''; };
function pkSync(s) { const b = s._pkb; if (!b) return; const o = s.selectedOptions?.[0], t = o ? textOf(o) : ''; const v = $('.pkb-v', b); if (v.textContent !== t) v.textContent = t || 'Choose'; v.classList.toggle('cbx-ph', !s.value); b.disabled = s.disabled; }
function pickerFor(s) {
  if (s._pkb || s.multiple) return; const b = document.createElement('button'); b.type = 'button';
  b.className = 'pkb ' + [...s.classList].filter(c => c !== 'ux-native').join(' '); b.dataset.ux = '1';
  b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false'); const lab = selLabel(s); if (lab) b.setAttribute('aria-label', lab + ': ' + (s.selectedOptions?.[0] ? textOf(s.selectedOptions[0]) : ''));
  if (s.getAttribute('style')) b.setAttribute('style', s.getAttribute('style'));
  b.innerHTML = `<span class="pkb-v"></span>${svg('chev', 'pkb-ch')}`;
  s._pkb = b; s.dataset.pk = '1'; s.classList.add('ux-native'); s.tabIndex = -1; s.setAttribute('aria-hidden', 'true'); s.after(b); pkSync(s);
  b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (b.disabled) return;
    uxPick({ anchor: b, title: lab, options: () => selList(s), isOn: o => s.value === o.value, onPick: o => { if (s.value !== o.value) { s.value = o.value; fire(s, 'input'); fire(s); } pkSync(s); if (lab) b.setAttribute('aria-label', lab + ': ' + o.label); } }); });
  b.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); b.click(); } });
  s.addEventListener('change', () => pkSync(s));
}
// backstops: a hidden select never gets focus, and any select we missed is converted the moment it's touched
document.addEventListener('focusin', e => { const s = e.target; if (s?.tagName !== 'SELECT') return; if (!s._pkb && !s.classList.contains('ux-native')) pickerFor(s); const b = s._pkb || (s.nextElementSibling?.matches?.('.cbx,.tiles') ? s.nextElementSibling.querySelector('button') : null); s.blur(); b?.focus({ preventScroll: true }); }, true);
['pointerdown', 'mousedown', 'touchstart'].forEach(t => document.addEventListener(t, e => { const s = e.target?.closest?.('select'); if (!s || s.multiple) return; e.preventDefault(); if (!s._pkb && !s.classList.contains('ux-native')) pickerFor(s); if (t !== 'touchstart') setTimeout(() => s._pkb?.click(), 0); }, { capture: true, passive: false }));
document.addEventListener('click', e => { const l = e.target.closest?.('label'); if (!l || e.target.closest('button,a,input,textarea')) return; const s = l.control || $('select', l); if (s?.tagName === 'SELECT' && s.classList.contains('ux-native')) { e.preventDefault(); (s._pkb || l.querySelector('.cbx-btn,.tile2'))?.focus({ preventScroll: true }); } }, true);

/* =========================================================================
   Dropdown with search (single + multi). Works with a native control or a list of actions.
   ========================================================================= */
let openCbx = null;
function closeCbx() { if (!openCbx) return; const c = openCbx; openCbx = null; $('.cbx-pop', c).hidden = true; $('.cbx-btn', c).setAttribute('aria-expanded', 'false'); }
function cbx({ label = '', placeholder = 'Choose', options, multi = false, onPick, isOn, summary, limit = 0 }) {
  const id = nid('l'), w = document.createElement('div'); w.className = 'cbx' + (multi ? ' multi' : ''); w.dataset.ux = '1';
  w.innerHTML = `<button type="button" class="cbx-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}">${label ? `<span class="cbx-lab">${esc(label)}</span>` : ''}<span class="cbx-val"></span>${svg('chev', 'cbx-ch')}</button>
  <div class="cbx-pop" hidden><div class="cbx-s">${svg('search')}<input class="cbx-q" type="search" placeholder="Type to search" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="${id}" aria-autocomplete="list" aria-label="Search ${esc(label || 'options')}"></div>
  <ul class="cbx-ul" id="${id}" role="listbox" ${multi ? 'aria-multiselectable="true"' : ''}></ul>${multi ? `<div class="cbx-foot"><span class="cbx-n"></span><button type="button" class="btn p sm cbx-done">Done</button></div>` : ''}</div>`;
  const btn = $('.cbx-btn', w), pop = $('.cbx-pop', w), q = $('.cbx-q', w), ul = $('.cbx-ul', w);
  let act = 0;
  const paintVal = () => { const on = options.filter(o => isOn(o)); const v = $('.cbx-val', w);
    if (summary) v.textContent = summary(on); else v.textContent = multi ? (on.length ? on.length > 2 ? `${on.length} chosen` : on.map(o => o.label).join(', ') : placeholder) : (on[0]?.label || placeholder);
    v.classList.toggle('cbx-ph', !on.length); const n = $('.cbx-n', w); if (n) n.textContent = on.length ? `${on.length} chosen${limit ? ` (up to ${limit})` : ''}` : limit ? `Pick up to ${limit}` : 'Pick as many as you like'; };
  const list = () => { const s = q.value.trim().toLowerCase(); const vis = options.filter(o => !s || o.label.toLowerCase().includes(s)); act = Math.min(act, Math.max(0, vis.length - 1));
    ul.innerHTML = vis.length ? vis.map((o, i) => `<li role="option" id="${id}-${i}" data-i="${options.indexOf(o)}" aria-selected="${isOn(o)}" class="${i === act ? 'act' : ''}">${multi ? `<span class="tk">${svg('yes')}</span>` : ''}<span>${esc(o.label)}</span>${o.n != null ? `<small>${esc(o.n)}</small>` : ''}${!multi && isOn(o) ? svg('yes', 'sel') : ''}</li>`).join('') : '<li class="none" role="presentation">Nothing matches. Try another word.</li>';
    q.setAttribute('aria-activedescendant', vis.length ? `${id}-${act}` : ''); };
  const inline = () => w.classList.contains('wz-cbx');
  if (options.length <= 8) $('.cbx-s', w).hidden = true;
  ul.tabIndex = -1;
  const open = () => { if (!inline()) { uxPick({ anchor: btn, title: label || placeholder, options, multi, limit, isOn, onPick: o => { onPick(o); setTimeout(() => { if (w.isConnected) paintVal(); }, 30); } }); return; }
    if (openCbx && openCbx !== w) closeCbx(); openCbx = w; pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); q.value = ''; act = Math.max(0, options.findIndex(o => isOn(o))); list(); setTimeout(() => { if (options.length > 8 && !COARSE()) q.focus({ preventScroll: true }); else ul.focus({ preventScroll: true }); $('.act', ul)?.scrollIntoView({ block: 'nearest' }); }, 10); };
  const pick = i => { const o = options[i]; if (!o) return; if (multi && limit && !isOn(o) && options.filter(isOn).length >= limit) { toast(`Pick up to ${limit}`); return; }
    onPick(o); setTimeout(() => { if (!w.isConnected) return; paintVal(); if (multi) list(); }, 30); if (!multi) { closeCbx(); btn.focus({ preventScroll: true }); } };
  btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (!inline()) return open(); pop.hidden ? open() : closeCbx(); });
  btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  q.addEventListener('input', () => { act = 0; list(); });
  pop.addEventListener('keydown', e => { const n = $$('li[role=option]', ul).length;
    if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(n - 1, act + 1); list(); $('.act', ul)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); list(); $('.act', ul)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); const li = $$('li[role=option]', ul)[act]; if (li) pick(+li.dataset.i); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeCbx(); btn.focus(); }
    else if (e.key === 'Tab') closeCbx(); });
  ul.addEventListener('mousedown', e => e.preventDefault());
  ul.addEventListener('click', e => { const li = e.target.closest('li[role=option]'); if (li) pick(+li.dataset.i); });
  $('.cbx-done', w)?.addEventListener('click', () => { closeCbx(); btn.focus(); });
  w.refresh = paintVal; paintVal(); return w;
}
document.addEventListener('click', e => { if (openCbx && !openCbx.contains(e.target)) closeCbx(); });

/* Tiles: few options, big tap targets with an icon each */
function tiles({ options, multi = false, onPick, isOn, label = '', limit = 0, compact = false }) {
  const w = document.createElement('div'); w.className = 'tiles' + (compact ? ' compact' : '') + (options.length <= 2 ? ' two' : ''); w.dataset.ux = '1';
  w.setAttribute('role', multi ? 'group' : 'radiogroup'); if (label) w.setAttribute('aria-label', label);
  const paint = () => { w.innerHTML = options.map((o, i) => { const on = isOn(o); return `<button type="button" class="tile2${on ? ' on' : ''}" role="${multi ? 'checkbox' : 'radio'}" aria-checked="${on}" data-i="${i}" tabindex="${multi || on || (!options.some(isOn) && !i) ? 0 : -1}">${compact ? '' : `<span class="ti2">${svg(o.icon || iconFor(o.label))}</span>`}<span class="tl2">${esc(o.label)}</span>${o.n != null ? `<small>${esc(o.n)}</small>` : ''}<span class="tk2">${svg('yes')}</span></button>`; }).join(''); };
  w.addEventListener('click', e => { const b = e.target.closest('.tile2'); if (!b) return; e.preventDefault(); const o = options[+b.dataset.i];
    if (multi && limit && !isOn(o) && options.filter(isOn).length >= limit) { toast(`Pick up to ${limit}`); return; }
    onPick(o); setTimeout(() => { if (w.isConnected) { paint(); $(`[data-i="${b.dataset.i}"]`, w)?.focus({ preventScroll: true }); } }, 20); });
  w.addEventListener('keydown', e => { if (multi || !/Arrow(Left|Right|Up|Down)/.test(e.key)) return; const bs = $$('.tile2', w), i = bs.indexOf(document.activeElement); if (i < 0) return; e.preventDefault(); const j = (i + (/Right|Down/.test(e.key) ? 1 : bs.length - 1)) % bs.length; bs[j].focus(); });
  w.refresh = paint; paint(); return w;
}

/* helpers to drive native controls so the hub's own logic keeps working */
const fire = (el, t = 'change') => el.dispatchEvent(new Event(t, { bubbles: true }));
const selOpts = s => { const ph = s.required || /^(choose|select|pick)/i.test(textOf(s.options[0])); return [...s.options].filter(o => !(o.value === '' && ph)).map(o => ({ label: textOf(o), value: o.value, el: o })); };
const groupOpts = inputs => inputs.map(i => { const l = i.closest('label'); return { label: textOf(l) || i.value, value: i.value, el: i }; });
const limitFrom = el => { const m = textOf(el.closest('fieldset') || el.parentElement).match(/up to (\d+)/i); return m ? +m[1] : 0; };

/* =========================================================================
   In-page enhancement: selects, checkbox groups and category chip rows
   ========================================================================= */
const SKIP_SEL = '[data-ttsrate],[data-inbst],[data-ux-keep],table select,.ttsbar select,#lplay select';
function enhanceSelect(s) {
  if (s._pkb || s.classList.contains('ux-native') || s.multiple) return;
  const opts = selOpts(s);
  if (s.dataset.uxd || s.matches(SKIP_SEL) || s.closest('.wz,.ux-hid') || WZ_FORMS[s.form?.id] || opts.length < 2) { if (!s.closest('.wz-hidnat')) pickerFor(s); return; }
  s.dataset.uxd = '1';
  const lab = s.closest('label'), labelTxt = lab ? textOf([...lab.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ')) : '';
  const isOn = o => s.value === o.value, onPick = o => { s.value = o.value; fire(s, 'input'); fire(s); };
  let ui;
  if (opts.length <= 6) ui = tiles({ options: opts, isOn, onPick, label: labelTxt, compact: opts.length > 3 || !!s.closest('[data-df],.dlbox,.form.join') || s.dataset.df != null });
  else ui = cbx({ options: opts.map(o => ({ ...o, n: null })), isOn, onPick, placeholder: textOf(s.options[0]) || 'Choose' });
  s.classList.add('ux-native'); s.tabIndex = -1; s.setAttribute('aria-hidden', 'true'); s.after(ui);
}
function enhanceChecks(g) {
  if (g.dataset.uxd || g.closest('.wz,.ux-hid') || WZ_FORMS[g.closest('form')?.id]) return; const ins = $$('input[type=checkbox]', g); if (ins.length <= 6) return; g.dataset.uxd = '1';
  const opts = groupOpts(ins), legend = textOf(g.closest('fieldset')?.querySelector('legend')), limit = limitFrom(g);
  const ui = cbx({ options: opts, multi: true, limit, isOn: o => o.el.checked, onPick: o => o.el.click(), placeholder: 'Choose' + (legend ? '' : ''), label: '' });
  g.classList.add('ux-native'); g.after(ui);
}
function enhanceChipRow(r) {
  if (r.dataset.uxd || r.closest('.wz,.ux-hid,.mhead,.story,#lplay')) return; const kids = [...r.children]; if (kids.length < 7 || !kids.every(k => /^(BUTTON|A)$/.test(k.tagName))) return;
  if (!kids.every(k => textOf(k).length < 44)) return; r.dataset.uxd = '1';
  const curOf = () => kids.find(k => k.classList.contains('on') || k.classList.contains('p') && !k.classList.contains('s') || k.getAttribute('aria-pressed') === 'true' || k.getAttribute('aria-current')) || kids[0];
  const cur = curOf();
  const opts = kids.map(k => { const t = textOf(k), m = t.match(/^(.*?)\s*·?\s*(\d+)$/); return { label: m ? m[1].replace(/\s*·\s*$/, '') : t, n: m ? m[2] : null, el: k }; });
  const ui = cbx({ options: opts, isOn: o => o.el === cur, onPick: o => o.el.click(), label: r.closest('.dtabs') || /dtabs/.test(r.className) ? 'Showing' : 'Category' });
  ui.classList.add('chipcbx'); r.classList.add('ux-hid'); r.after(ui);
}
function enhance(root) {
  $$('form', root).forEach(f => { if (WZ_FORMS[f.id] && !f.dataset.wzd) launcher(f); });
  $$('select', root).forEach(enhanceSelect);
  $$('.checks, .seg.radios', root).forEach(enhanceChecks);
  $$('.scroll, .dtabs', root).forEach(enhanceChipRow);
  pageListenBtn();
  adminListenCard();
}

/* =========================================================================
   Step-by-step questionnaires
   ========================================================================= */
const WZ_FORMS = {
  fundQuiz: { t: 'Find funding that suits you', d: 'Answer a few quick questions and we’ll rank the funds that fit you best.', icon: 'money', done: 'Here are your best matches' },
  polForm: { ask: { type: 'What type of organisation are you?' }, t: 'Which policies do you need?', d: 'Quick yes or no questions. We’ll show what the law asks of you, with templates.', icon: 'shield', done: 'Here’s your list' },
  qForm: { ask: { example: 'Want to start from an example?', name: 'What’s the campaign?', dates: 'When is it?', goals: 'What do you want it to do?', aud: 'Who needs to see it?', ch: 'Where will they see it?', lang: 'Any languages besides English?', acc: 'Any access needs?', want: 'What would you like us to make?', video: 'Any video?', tier: 'What level?' }, t: 'Plan your campaign with us', d: 'Tell us what you’re running and we’ll come back with a plan, at community rates.', icon: 'spark', done: 'Thanks, your brief is with us' },
  reviewForm: { ask: { when: 'Which campaign is it?', campaign: 'Tell us about it', ch: 'Where did it go out?' }, t: 'Get a free campaign review', d: 'Show us what you’ve made so far and we’ll tell you what to keep, fix and add.', icon: 'star', done: 'Thanks, we’ll be in touch' },
  matchForm: { t: 'Get matched to volunteering', d: 'Tell us what you enjoy and when you’re free. We’ll let you know when a role fits.', icon: 'hand', done: 'You’re on the list',
    ask: { first: 'First, who are you?', interests: 'What would you enjoy doing?', area: 'Where in Luton are you?', ageband: 'Just to check', avail: 'When are you free?' } },
};
Object.assign(WZ_FORMS, window.LCH_WZ || {});
let WZ = null;

function unitsOf(form) {
  const units = []; let bold = null;
  const atomic = fs => !$('fieldset', fs) && ($$('label.f', fs).length + $$('.checks,.seg.radios', fs).length + $$(':scope > select', fs).length) <= 1;
  const walk = (node, sec) => { for (const c of [...node.children]) {
    if (c.matches('button,[type=submit],.fqh,details,script')) continue;
    if (c.matches('fieldset')) { const lg = textOf($(':scope>legend', c)).replace(/^\d+\.?\s*/, ''); if (atomic(c)) units.push({ el: c, title: lg, sec }); else walk(c, lg || sec); continue; }
    if (c.matches('label.f,label.chk')) { units.push({ el: c, sec }); continue; }
    if (c.matches('.checks,.seg.radios')) { units.push({ el: c, title: bold ? textOf(bold) : '', sec, extra: bold }); bold = null; continue; }
    if (c.matches('b')) { bold = c; continue; }
    if (c.matches('small.note,p.note') && units.length) continue;
    if (c.children.length) walk(c, sec); } };
  walk(form, '');
  return units.map(u => {
    const ctl = $$('input,select,textarea', u.el).filter(i => i.type !== 'hidden'), choice = ctl.filter(i => /radio|checkbox/.test(i.type)), sel = ctl.find(i => i.tagName === 'SELECT');
    let kind = 'text';
    if (u.el.matches('label.chk')) kind = 'consent'; else if (choice.length > 1 || (sel && !ctl.some(i => i !== sel))) kind = 'choice'; else if (ctl.some(i => i.type === 'file')) kind = 'file'; else if (ctl.some(i => i.tagName === 'TEXTAREA')) kind = 'long';
    let title = u.title; if (!title && u.el.matches('label')) title = textOf([...u.el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' '));
    if (!title && kind === 'choice') title = u.sec || 'Choose';
    const hint = u.el.matches('label') ? textOf($(':scope>small', u.el)) : textOf($(':scope>small.note', u.el));
    return { ...u, ctl, choice, sel, kind, title, hint, multi: choice[0]?.type === 'checkbox', limit: limitFrom(u.el) || (/up to (\d+)/i.exec(hint)?.[1] | 0) };
  }).filter(u => u.ctl.length);
}
function stepsOf(units) {
  const steps = []; let cur = null;
  units.forEach(u => {
    if (u.kind === 'text' && cur && cur.kind === 'text' && cur.units.length < 3 && cur.sec === u.sec) { cur.units.push(u); return; }
    if (u.kind === 'consent' && cur && (cur.kind === 'consent')) { cur.units.push(u); return; }
    cur = { kind: u.kind, sec: u.sec, units: [u] }; steps.push(cur);
  });
  return steps;
}
const snap = form => { const o = {}; $$('input,select,textarea', form).forEach(i => { if (!i.name || i.type === 'file') return; if (/radio|checkbox/.test(i.type)) { if (i.checked) (o[i.name] = o[i.name] || []).push(i.value); } else o[i.name] = [i.value]; }); return o; };
const applySnap = (form, o) => { $$('input,select,textarea', form).forEach(i => { if (!i.name || i.type === 'file' || !(i.name in o)) return; if (/radio|checkbox/.test(i.type)) i.checked = o[i.name].includes(i.value); else i.value = o[i.name][0] ?? ''; }); };
const progKey = id => 'wz-' + id + '-' + location.hash.replace(/^#/, '');

function launcher(form) {
  form.dataset.wzd = '1'; const cfg = WZ_FORMS[form.id], saved = signedIn() ? st.get(progKey(form.id), null) : null, done = st.get('wzdone-' + form.id + '-' + location.hash, 0);
  const n = stepsOf(unitsOf(form)).length, mins = Math.max(1, Math.round(n * 0.35));
  const el = document.createElement('div'); el.className = 'wzl'; el.dataset.ux = '1';
  el.innerHTML = `<span class="wzl-i">${svg(cfg.icon)}</span><div class="wzl-t"><h2>${esc(cfg.t)}</h2><p>${esc(cfg.d)}</p><p class="wzl-m">${svg('clock')} ${n} quick question${n === 1 ? '' : 's'} · about ${mins} minute${mins === 1 ? '' : 's'}${saved ? ` · <b>saved at question ${saved.step + 1}</b>` : ''}</p></div>
  <div class="wzl-a">${saved ? `<button type="button" class="btn p" data-wzgo="${form.id}" data-wzat="${saved.step}">Continue</button><button type="button" class="btn s sm" data-wzgo="${form.id}" data-wzfresh>Start again</button>` : `<button type="button" class="btn p" data-wzgo="${form.id}">${done ? 'Change my answers' : 'Start'}</button>`}</div>`;
  form.classList.add('ux-hid'); form.before(el);
  const fqh = $('.fqh', form); if (fqh) fqh.classList.add('ux-hid');
  if (WZ && WZ.reopen === form.id) { const at = WZ.reopenAt; WZ = null; setTimeout(() => openWizard(form, at), 60); }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-wzgo]'); if (!b) return; const f = document.getElementById(b.dataset.wzgo); if (!f) return;
  if ('wzfresh' in b.dataset) st.del(progKey(f.id)); else if (b.dataset.wzat) { const s = st.get(progKey(f.id), null); if (s) applySnap(f, s.vals); }
  openWizard(f, +(b.dataset.wzat || 0)); });

function shell() {
  let d = $('#wz'); if (d) return d;
  document.body.insertAdjacentHTML('beforeend', `<div class="wz" id="wz" role="dialog" aria-modal="true" aria-labelledby="wzT" hidden><div class="wz-scrim" data-wzx></div><div class="wz-box">
  <div class="wz-top"><div class="wz-meta"><span class="wz-k" id="wzK"></span><span class="wz-c" id="wzC"></span></div><button type="button" class="ib wz-close" data-wzx aria-label="Close">${svg('x')}</button>
  <div class="wz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Progress"><i id="wzBar"></i></div><p class="wz-win" id="wzWin" aria-live="polite"></p></div>
  <div class="wz-body" id="wzBody"></div>
  <div class="wz-foot"><button type="button" class="btn s wz-back" data-wzback>${svg('back')}<span>Back</span></button><button type="button" class="linkbtn wz-later" data-wzlater hidden>${svg('save')} Save and finish later</button><button type="button" class="btn p wz-next" data-wznext>Next</button></div></div></div>`);
  return $('#wz');
}
function openWizard(form, at = 0) {
  const units = unitsOf(form), steps = stepsOf(units); if (!steps.length) return;
  const d = shell(); closeCbx();
  WZ = { form, units, steps, i: Math.min(at, steps.length - 1), ph: [], cfg: WZ_FORMS[form.id], ret: document.activeElement };
  units.forEach(u => { const c = document.createComment('wz'); u.el.before(c); WZ.ph.push([c, u.el]); });
  d.hidden = false; requestAnimationFrame(() => d.classList.add('in'));
  document.body.classList.add('wz-lock'); $$('body > header, body > main, body > footer, body > .strip').forEach(x => x.inert = true);
  $('[data-wzlater]', d).hidden = !signedIn();
  paintStep(); window.LCH_TRACK?.('questionnaire_started', { form: form.id });
}
function restore() { if (!WZ) return; WZ.ph.forEach(([c, el]) => { el.classList.remove('wz-unit'); $$('.wz-hidnat', el).forEach(x => x.classList.remove('wz-hidnat')); el.classList.remove('wz-hidnat'); if (c.parentNode) c.replaceWith(el); }); WZ.ph = []; }
function closeWizard(keep = true) {
  const d = $('#wz'); if (!d || !WZ) return; const f = WZ.form, ret = WZ.ret;
  if (keep && signedIn() && WZ.i > 0) st.set(progKey(f.id), { step: WZ.i, vals: snap_all() });
  restore(); d.classList.remove('in'); setTimeout(() => { d.hidden = true; $('#wzBody').innerHTML = ''; }, 220);
  document.body.classList.remove('wz-lock'); $$('body > header, body > main, body > footer, body > .strip').forEach(x => x.inert = false);
  WZ = null; if (keep) { const l = f.previousElementSibling; if (l && l.classList.contains('wzl')) { l.remove(); delete f.dataset.wzd; launcher(f); } } ret?.focus?.({ preventScroll: true });
}
const snap_all = () => { const o = {}; WZ.units.forEach(u => u.ctl.forEach(i => { if (!i.name || i.type === 'file') return; if (/radio|checkbox/.test(i.type)) { if (i.checked) (o[i.name] = o[i.name] || []).push(i.value); } else o[i.name] = [i.value]; })); return o; };
const WINS = (i, n) => i === 0 ? 'Let’s get started' : i === n - 1 ? 'Last one' : i === Math.floor(n / 2) ? 'Halfway there. Nice going.' : i === 1 ? 'Good start' : i >= n - 3 ? 'Nearly done' : '';
function paintStep() {
  const { steps, i, cfg } = WZ, s = steps[i], n = steps.length, body = $('#wzBody'), askOf = st0 => { const nm = st0.units[0].ctl[0]?.name; return cfg.ask?.[nm]; };
  // put back any unit from a previous step (keep it inside the dialog but out of view)
  WZ.units.forEach(u => { if (u.el.parentNode === body || body.contains(u.el)) { u.el.remove(); } });
  $('#wzK').textContent = s.sec || cfg.t; $('#wzC').textContent = `${i + 1} of ${n}`;
  $('#wzBar').style.width = Math.round((i + 1) / n * 100) + '%'; $('.wz-bar').setAttribute('aria-valuenow', Math.round((i + 1) / n * 100));
  $('#wzWin').textContent = WINS(i, n);
  body.innerHTML = ''; const u0 = s.units[0];
  const h = document.createElement('h2'); h.id = 'wzT'; h.className = 'wz-q'; body.append(h);
  if (s.kind === 'choice') {
    h.textContent = askOf(s) || u0.title; if (u0.hint) body.insertAdjacentHTML('beforeend', `<p class="wz-h">${esc(u0.hint)}</p>`);
    const u = u0; let opts, isOn, onPick;
    if (u.sel && !u.choice.length) { opts = selOpts(u.sel); isOn = o => u.sel.value === o.value; onPick = o => { u.sel.value = o.value; if (!u.sel.getAttribute('onchange')) fire(u.sel); else WZ.pendingInline = u.sel; }; }
    else { opts = groupOpts(u.choice); isOn = o => o.el.checked; onPick = o => { if (u.multi) o.el.checked = !o.el.checked; else o.el.checked = true; }; }
    const single = !(u.multi), few = opts.length <= 6;
    const ui = few ? tiles({ options: opts, multi: !single, isOn, onPick: o => { onPick(o); if (single && WZ) { clearErr(); setTimeout(() => { if (WZ && WZ.steps[WZ.i] === s) next(); }, 320); } }, label: u.title, limit: u.limit })
      : cbx({ options: opts, multi: !single, isOn, onPick: o => { onPick(o); clearErr(); }, limit: u.limit, placeholder: single ? 'Choose one' : 'Choose' });
    if (!few) ui.classList.add('wz-cbx');
    if (u.multi && few) body.insertAdjacentHTML('beforeend', `<p class="wz-h">${u.limit ? `Pick up to ${u.limit}.` : 'Pick all that apply.'}</p>`);
    body.append(ui); u.el.classList.add('wz-hidnat'); body.append(u.el);
    if (!few && (!single || !opts.some(isOn))) setTimeout(() => { if (ui.isConnected && $('.cbx-pop', ui).hidden) $('.cbx-btn', ui)?.click(); }, 260);
  } else {
    h.textContent = askOf(s) || (s.kind === 'consent' ? 'One last thing' : s.units.length > 1 ? (s.sec || 'A few details') : u0.title);
    s.units.forEach(u => { u.el.classList.add('wz-unit'); body.append(u.el); if (s.units.length === 1 && s.kind !== 'consent') { const t = [...u.el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (t) u.el.classList.add('wz-solo'); } });
  }
  body.insertAdjacentHTML('beforeend', '<p class="wz-err" id="wzErr" role="alert" hidden></p>');
  const nb = $('[data-wznext]'), last = i === n - 1, sub = $('button:not([type=button])', WZ.form);
  nb.textContent = last ? (textOf(sub) || 'Finish') : 'Next'; $('[data-wzback]').style.visibility = i ? 'visible' : 'hidden';
  if (s.kind === 'choice' && !u0.multi && opts_len(u0) <= 6) nb.classList.add('quiet'); else nb.classList.remove('quiet');
  body.scrollTop = 0; setTimeout(() => { const f = $('.tile2[tabindex="0"], input:not([type=hidden]):not(.cbx-q), textarea, .cbx-btn', body); (f || nb).focus({ preventScroll: true }); }, 60);
  if (signedIn()) st.set(progKey(WZ.form.id), { step: i, vals: snap_all() });
}
const opts_len = u => u.sel && !u.choice.length ? selOpts(u.sel).length : u.choice.length;
const clearErr = () => { const e = $('#wzErr'); if (e) e.hidden = true; };
function valid(s) { for (const u of s.units) for (const c of u.ctl) { if (!c.checkValidity()) { const e = $('#wzErr'); e.textContent = c.validity.valueMissing ? (s.kind === 'choice' ? 'Choose one to carry on.' : c.type === 'checkbox' ? 'Please tick this to carry on.' : 'Please fill this in.') : c.validationMessage; e.hidden = false; if (!/radio|checkbox|select/i.test(c.type + c.tagName)) c.focus(); return false; } } return true; }
function next() { if (!WZ) return; const s = WZ.steps[WZ.i]; if (!valid(s)) return;
  if (WZ.pendingInline) { const el = WZ.pendingInline; WZ.pendingInline = null; WZ.reopen = WZ.form.id; WZ.reopenAt = WZ.i + 1; const keepWZ = WZ; restore(); keepWZ.ph = []; fire(el); return; }
  if (WZ.i < WZ.steps.length - 1) { WZ.i++; paintStep(); return; } finish(); }
function finish() {
  const f = WZ.form, cfg = WZ.cfg; for (let k = 0; k < WZ.steps.length; k++) if (!WZ.steps[k].units.every(u => u.ctl.every(c => c.checkValidity()))) { WZ.i = k; paintStep(); valid(WZ.steps[k]); return; }
  st.del(progKey(f.id)); st.set('wzdone-' + f.id + '-' + location.hash, 1);
  const body = $('#wzBody'); restore(); body.innerHTML = `<div class="wz-done"><span class="wz-tick">${svg('yes')}</span><h2 id="wzT">${esc(cfg.done)}</h2><p>All done. That took less than you thought.</p></div>`;
  $('#wzBar').style.width = '100%'; $('#wzWin').textContent = ''; $('.wz-foot').classList.add('ux-hid');
  window.LCH_TRACK?.('questionnaire_submitted', { form: f.id });
  setTimeout(() => { const d = $('#wz'); d.classList.remove('in'); setTimeout(() => { d.hidden = true; $('.wz-foot').classList.remove('ux-hid'); }, 220); document.body.classList.remove('wz-lock'); $$('body > header, body > main, body > footer, body > .strip').forEach(x => x.inert = false); WZ = null;
    const sub = $('button:not([type=button])', f); f.requestSubmit ? f.requestSubmit(sub || undefined) : f.submit(); }, 900);
}
document.addEventListener('click', e => { if (!WZ) return; const t = e.target.closest('[data-wznext],[data-wzback],[data-wzx],[data-wzlater]'); if (!t) return;
  if ('wznext' in t.dataset) next(); else if ('wzback' in t.dataset) { if (WZ.i) { WZ.i--; paintStep(); } } else if ('wzlater' in t.dataset) { closeWizard(true); toast('Saved. Pick up where you left off any time.'); } else closeWizard(true); });
document.addEventListener('keydown', e => { if (!WZ || $('#wz').hidden) return;
  if (e.key === 'Escape') { if (openCbx) return; e.preventDefault(); e.stopImmediatePropagation(); closeWizard(true); return; }
  if (e.key === 'Enter' && e.target.matches('input:not([type=checkbox]):not([type=radio]):not(.cbx-q)')) { e.preventDefault(); next(); return; }
  if (e.key === 'Tab') { const box = $('.wz-box'), f = $$('button:not([hidden]):not([disabled]),input:not([type=hidden]),select:not(.ux-native),textarea,[tabindex="0"]', box).filter(x => x.offsetParent !== null && !x.closest('.wz-hidnat,[hidden]')); if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } }, true);
addEventListener('hashchange', () => { if (WZ && !WZ.reopen) closeWizard(true); });

/* =========================================================================
   Listen: the phone or computer's own voice (best British voice it has), with a mini player
   ========================================================================= */
const L = { segs: [], i: 0, title: '', key: '', playing: false, rate: st.get('ttsrate', 1), engine: null, chunk: 0, chunks: [], onSeg: null, gen: 0, pause: null };
const splitChunks = t => { const out = []; let cur = ''; (t.match(/[^.!?]+[.!?]*\s*/g) || [t]).forEach(s => { if ((cur + s).length > 220 && cur) { out.push(cur.trim()); cur = ''; } cur += s; }); if (cur.trim()) out.push(cur.trim()); return out; };
let voice = null;
/* natural British voices first (Google UK, Apple Serena/Daniel/Kate/Arthur, Microsoft Sonia/Ryan online), then any en-GB, then any English */
const VPREF = [/sonia.*natural|sonia online/i, /ryan.*natural|ryan online/i, /libby|maisie|thomas.*natural|natural/i, /google uk english female/i, /google uk english male/i, /serena/i, /daniel/i, /kate/i, /arthur/i, /martha|stephanie|oliver/i];
const allVoices = () => { try { return window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { return []; } };
const englishVoices = () => { const vs = allVoices().filter(v => /^en/i.test(v.lang)); const gb = v => /en[-_]GB/i.test(v.lang) ? 0 : 1, rank = v => { const i = VPREF.findIndex(r => r.test(v.name)); return i < 0 ? 99 : i; };
  return vs.sort((a, b) => gb(a) - gb(b) || rank(a) - rank(b) || a.name.localeCompare(b.name)); };
const bestVoice = () => { const vs = englishVoices(), saved = st.get('ttsvname', ''); return (saved && vs.find(v => v.name === saved)) || vs[0] || allVoices()[0] || null; };
const pickVoice = () => new Promise(res => { if (!window.speechSynthesis) return res(null); const v = bestVoice(); if (v) return res(v);
  let done = false; const fin = () => { if (done) return; done = true; res(bestVoice()); }; speechSynthesis.addEventListener?.('voiceschanged', fin, { once: true }); setTimeout(fin, 1200); });
const vLabel = v => v.name.replace(/^(Microsoft|Google)\s+/i, '').replace(/\s*-\s*English.*$/i, '').replace(/\s*\(.*?\)\s*/g, ' ').trim() + (/natural|online|google|serena|daniel|kate|arthur/i.test(v.name) ? ' · natural' : '') + (/en[-_]GB/i.test(v.lang) ? '' : ' (' + v.lang + ')');
async function chooseEngine() { if (window.speechSynthesis && window.SpeechSynthesisUtterance) { voice = await pickVoice(); if (voice) return 'device'; }
  try { if (window.claude) { L.cl = await claude.use('tts'); if (L.cl) return 'app'; } } catch (e) { } return null; }
function stopAll() { L.gen++; clearTimeout(L.pause); try { speechSynthesis.cancel(); } catch (e) { } try { L.cl?.stop(); } catch (e) { } }
/* lock screen / headphone buttons where the browser allows it */
function mediaSession() { const ms = navigator.mediaSession; if (!ms) return; try { ms.metadata = new MediaMetadata({ title: L.segs[L.i]?.label || L.title, artist: L.title, album: 'Luton Community Hub', artwork: [{ src: 'brand/hub-icon-256.png', sizes: '256x256', type: 'image/png' }] });
  ms.playbackState = L.playing ? 'playing' : 'paused'; ms.setActionHandler('play', () => { if (!L.playing) LCHListen.toggle(); }); ms.setActionHandler('pause', () => { if (L.playing) LCHListen.toggle(); }); ms.setActionHandler('previoustrack', () => LCHListen.skip(-1)); ms.setActionHandler('nexttrack', () => LCHListen.skip(1)); } catch (e) { } }
async function speakSeg() {
  const g = ++L.gen, seg = L.segs[L.i]; if (!seg) { L.playing = false; paintPlayer(); return; }
  L.onSeg?.(L.i); paintPlayer(); mediaSession();
  if (L.engine === 'app') { try { await L.cl.speak([{ text: seg.text, id: String(L.i) }], { rate: L.rate }); } catch (e) { } if (g === L.gen && L.playing) nextSeg(); return; }
  L.chunks = splitChunks(seg.text); const run = () => { if (g !== L.gen) return; if (L.chunk >= L.chunks.length) { L.chunk = 0; return nextSeg(); }
    const u = new SpeechSynthesisUtterance(L.chunks[L.chunk]); if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB'; u.rate = L.rate;
    u.onend = () => { if (g !== L.gen) return; L.chunk++; run(); }; u.onerror = ev => { if (g !== L.gen || ev.error === 'interrupted' || ev.error === 'canceled') return; L.chunk++; run(); };
    try { speechSynthesis.resume(); } catch (e) { } speechSynthesis.speak(u); };
  run();
}
/* a short pause between sections, so it sounds like someone reading it, not a list */
function nextSeg() { if (L.i < L.segs.length - 1) { const g = L.gen; L.pause = setTimeout(() => { if (g !== L.gen || !L.playing) return; L.i++; L.chunk = 0; speakSeg(); }, 650); } else { L.playing = false; L.gen++; paintPlayer(true); mediaSession(); } }
const LCHListen = window.LCHListen = {
  async play({ title, segments, start = 0, key = '', onSegment = null }) {
    stopAll(); Object.assign(L, { segs: segments.filter(s => s.text && s.text.trim()), i: start, title, key, onSeg: onSegment, chunk: 0 });
    if (!L.segs.length) return; showPlayer(); $('#lpSt').textContent = 'Getting ready…';
    if (!L.engine) L.engine = await chooseEngine();
    if (!L.engine) { hidePlayer(); readInstead(); return; }
    window.LCH_TRACK?.('listen_start', { key, voice: voice?.name || L.engine }); L.playing = true; speakSeg(); },
  toggle() { if (!L.segs.length) return; if (L.playing) { L.playing = false; L.gen++; clearTimeout(L.pause); try { speechSynthesis.cancel(); } catch (e) { } try { L.cl?.pause(); } catch (e) { } paintPlayer(); mediaSession(); }
    else { L.playing = true; if (L.engine === 'app') { try { L.cl.resume(); } catch (e) { speakSeg(); } paintPlayer(); } else speakSeg(); } },
  skip(d) { if (!L.segs.length) return; const j = Math.max(0, Math.min(L.segs.length - 1, L.i + d)); stopAll(); L.i = j; L.chunk = 0; L.playing = true; speakSeg(); },
  rate(r) { L.rate = r; st.set('ttsrate', r); try { L.cl?.setRate(r); } catch (e) { } if (L.playing && L.engine === 'device') { stopAll(); speakSeg(); } paintPlayer(); },
  voice(name) { const v = englishVoices().find(x => x.name === name) || allVoices().find(x => x.name === name); if (!v) return; voice = v; st.set('ttsvname', v.name); if (L.playing && L.engine === 'device') { stopAll(); speakSeg(); } },
  stop() { stopAll(); L.playing = false; L.segs = []; hidePlayer(); },
  state: () => ({ playing: L.playing, i: L.i, n: L.segs.length, key: L.key, engine: L.engine, voice: voice?.name || '' })
};
function readInstead() { const box = $('#mbox'); if (!box) return; box.innerHTML = `<div class="mhead"><h3>Read instead</h3><button class="ib" data-close aria-label="Close">${svg('x')}</button></div><p>This phone or browser doesn’t have a voice that can read aloud. On iPhone you can add one in Settings → Accessibility → Spoken Content → Voices; on Android in Settings → Text-to-speech. Here it is to read for now:</p><div class="msg">${esc(L.segs.map(s => s.text).join('\n\n'))}</div>`; $('#modal').classList.add('open'); }
function showPlayer() { let p = $('#lplay'); if (!p) { document.body.insertAdjacentHTML('beforeend', `<div class="lplay" id="lplay" role="region" aria-label="Audio player"><div class="lp-prog"><i id="lpBar"></i></div>
  <div class="lp-in"><span class="lp-ic">${svg('listen')}</span><div class="lp-t"><b id="lpT"></b><span id="lpSt" aria-live="polite"></span></div>
  <div class="lp-c"><button type="button" class="lpb" data-lp="prev" aria-label="Previous part">${svg('prev')}</button><button type="button" class="lpb main" data-lp="pp" aria-label="Pause">${svg('pause')}</button><button type="button" class="lpb" data-lp="next" aria-label="Next part">${svg('next')}</button><button type="button" class="lpr" data-lp="set" aria-label="Voice and speed"></button><button type="button" class="lpb x" data-lp="x" aria-label="Stop and close">${svg('x')}</button></div></div>
  <div class="lp-set" id="lpSet" hidden><label class="lp-sl"><span>Voice</span><select id="lpVoice" aria-label="Voice"></select></label><div class="lp-sl"><span>Speed</span><div class="lp-rates" role="group" aria-label="Speed">${[0.8, 1, 1.2, 1.5].map(r => `<button type="button" data-lprate="${r}">${(r + '').replace(/^(\d)$/, '$1.0')}×</button>`).join('')}</div></div><p class="note" style="margin:0">Uses your phone or computer’s own voices. Your choice is remembered on this device.</p></div></div>`); p = $('#lplay'); }
  p.hidden = false; requestAnimationFrame(() => p.classList.add('in')); document.body.classList.add('lp-on'); paintPlayer(); }
function fillVoices() { const s = $('#lpVoice'); if (!s) return; const vs = englishVoices(); s.innerHTML = vs.length ? vs.map(v => `<option value="${esc(v.name)}" ${voice && v.name === voice.name ? 'selected' : ''}>${esc(vLabel(v))}</option>`).join('') : '<option>No voices on this device</option>'; s.disabled = !vs.length; }
function hidePlayer() { const p = $('#lplay'); if (!p) return; p.classList.remove('in'); document.body.classList.remove('lp-on'); $('#lpSet') && ($('#lpSet').hidden = true); setTimeout(() => { if (!L.segs.length) p.hidden = true; }, 250); }
function paintPlayer(ended) { const p = $('#lplay'); if (!p) return; const s = L.segs[L.i];
  $('#lpT').textContent = L.title; $('#lpSt').textContent = ended ? 'Finished. Tap play to hear it again.' : s ? `${L.i + 1} of ${L.segs.length}${s.label ? ' · ' + s.label : ''}` : '';
  const pp = $('[data-lp="pp"]', p); pp.innerHTML = svg(L.playing ? 'pause' : 'play'); pp.setAttribute('aria-label', L.playing ? 'Pause' : 'Play');
  $('[data-lp="set"]', p).textContent = (L.rate + '').replace(/^(\d)$/, '$1.0') + '×'; $$('[data-lprate]', p).forEach(b => b.classList.toggle('on', +b.dataset.lprate === L.rate)); $('#lpBar').style.width = (L.segs.length ? (L.i + (ended ? 1 : 0.5)) / L.segs.length * 100 : 0) + '%';
  $$('[data-pglisten]').forEach(b => b.classList.toggle('on', L.playing && L.key === b.dataset.pglisten)); }
document.addEventListener('click', e => { const r = e.target.closest('[data-lprate]'); if (r) return LCHListen.rate(+r.dataset.lprate); const b = e.target.closest('[data-lp]'); if (!b) return; const a = b.dataset.lp;
  if (a === 'pp') { if (!L.playing && L.i >= L.segs.length - 1 && $('#lpSt').textContent.startsWith('Finished')) { L.i = 0; L.chunk = 0; L.playing = true; speakSeg(); } else LCHListen.toggle(); }
  if (a === 'prev') LCHListen.skip(-1); if (a === 'next') LCHListen.skip(1); if (a === 'x') LCHListen.stop();
  if (a === 'set') { const s = $('#lpSet'); s.hidden = !s.hidden; if (!s.hidden) fillVoices(); } });
document.addEventListener('change', e => { if (e.target.id === 'lpVoice') LCHListen.voice(e.target.value); });
try { speechSynthesis.addEventListener?.('voiceschanged', () => { if (!voice) voice = bestVoice(); fillVoices(); }); } catch (e) { }
/* some phones stop reading after ~15 s in the background: give it a nudge when you come back */
document.addEventListener('visibilitychange', () => { if (!document.hidden && L.playing && L.engine === 'device') { try { if (!speechSynthesis.speaking) speakSeg(); else speechSynthesis.resume(); } catch (e) { } } });

/* Listen to this page */
function pageSegments() { const m = $('#main'); if (!m) return []; const segs = []; let cur = { label: '', text: '' };
  const skip = 'nav,form,button,.back,.noprint,.ux-hid,[aria-hidden="true"],script,style,.wzl,.cbx,.tiles,.row,select,svg,.tag,.badge,.pow,.chips,.lplay';
  const push = () => { if (cur.text.trim().length > 20) segs.push({ label: cur.label, text: cur.text.trim() }); };
  const walk = n => { for (const c of n.children) { if (c.matches(skip) || c.hidden || c.offsetParent === null && c.tagName !== 'DETAILS') continue;
    if (/^H[1-3]$/.test(c.tagName)) { push(); cur = { label: textOf(c).slice(0, 40), text: textOf(c) + '. ' }; continue; }
    if (/^(P|LI|H4|DT|DD|TD|BLOCKQUOTE|FIGCAPTION)$/.test(c.tagName) || (c.children.length === 0 && textOf(c).length > 30)) { const t = textOf(c); if (t) cur.text += t.replace(/([^.!?:])$/, '$1.') + ' '; if (cur.text.length > 1400) { push(); cur = { label: cur.label, text: '' }; } continue; }
    walk(c); } };
  walk(m); push(); return segs.slice(0, 14); }
function pageListenBtn() { paintPlayer(); }
document.addEventListener('click', e => { const b = e.target.closest('[data-pglisten]'); if (!b) return; if (L.key === b.dataset.pglisten && L.segs.length) return LCHListen.toggle();
  const h1 = textOf($('#main h1')); LCHListen.play({ title: h1 || 'This page', segments: pageSegments(), key: b.dataset.pglisten }); });
document.addEventListener('click', e => { const b = e.target.closest('[data-footlisten]'); if (!b) return; e.preventDefault(); const h1 = textOf($('#main h1')); LCHListen.play({ title: h1 || 'This page', segments: pageSegments(), key: 'page-' + (location.hash || '#home') }); });

/* owner page: Listen card (the device's own voice; nothing to pay for) */
function adminListenCard() { const h = location.hash; if (!/^#(magadmin)$/.test(h)) return; const host = $('#main .wrap'); if (!host || $('#ttsCard', host)) return; if (!/Monday drafts/.test(textOf($('h1', host)))) return;
  host.insertAdjacentHTML('beforeend', `<section class="dlbox ttscard" id="ttsCard" style="margin-top:14px"><div class="tts-h"><span class="lp-ic">${svg('listen')}</span><div><h3 style="margin:0">Listen</h3><p class="note" style="margin:0">Read aloud with each reader’s own phone or computer voice. It picks the most natural British voice they have, and they can change the voice and speed in the player.</p></div></div>
  <div class="row" style="margin-top:12px"><button type="button" class="btn s sm" data-ttstry>Play a sample</button></div></section>`); }
document.addEventListener('click', e => { const b = e.target.closest('[data-ttstry]'); if (!b) return;
  LCHListen.play({ title: 'Voice sample', segments: [{ label: 'Sample', text: 'Hello, and welcome to Luton This Week, from the Luton Community Hub. Here’s what matters for your organisation this week.' }], key: 'sample' }); });

/* ---------- boot ---------- */
let busy = false, qd = false;
let wzObs = false;
const run = () => { qd = false; if (busy) return; busy = true; try { enhance(document.getElementById('main') || document.body); const m = $('#modal.open #mbox'); if (m) enhance(m);
  const wz = $('#wz'); if (wz) { if (!wzObs) { wzObs = true; new MutationObserver(queue).observe(wz, { childList: true, subtree: true }); } $$('select', wz).forEach(enhanceSelect); }
  $$('select').forEach(s => { if (s._pkb) pkSync(s); else if (!s.classList.contains('ux-native') && !s.multiple && !s.closest('.wz-hidnat')) enhanceSelect(s); }); } catch (e) { console.warn('ux', e); } busy = false; };
const queue = () => { if (qd) return; qd = true; requestAnimationFrame(run); };
const start = () => { const m = $('#main'); if (!m) return setTimeout(start, 50); new MutationObserver(queue).observe(m, { childList: true, subtree: true }); new MutationObserver(queue).observe(document.body, { childList: true }); const mb = $('#mbox'); if (mb) new MutationObserver(queue).observe(mb, { childList: true, subtree: true });
  const built = $('footer .built'); if (built && !$('[data-footlisten]', built.parentNode)) built.insertAdjacentHTML('beforebegin', `<p class="flisten"><button type="button" class="pgl" data-footlisten>${svg('listen')}<em>Listen to this page</em></button></p>`);
  queue(); };
start();
})();
