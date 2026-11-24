/* Inspire FM · long rows of filter bubbles become one tidy drop-down.
   Any single-choice group with 7 or more bubbles (one pressed at a time) is shown as a drop-down with a green arrow;
   choosing an option presses the original bubble, so each page's own code keeps working unchanged. */
(function () {
'use strict';
const MIN = 7;
const SKIP = '#tabbar, .st-wrap, .dg-grid, .dg-cal, .pill2, [data-nodd]';
const txt = b => { if (b.dataset.label) return b.dataset.label.trim(); const t = b.querySelector('b,strong'); return (t ? t.textContent : [...b.childNodes].map(n => n.textContent).join(' ')).replace(/\s+/g, ' ').trim(); };
const sig = btns => btns.map(txt).join('|');
const pressed = btns => btns.findIndex(b => b.getAttribute('aria-pressed') === 'true');
function eligible(el) {
  if (el.closest(SKIP)) return null;
  const btns = [...el.children].filter(c => c.tagName === 'BUTTON' && c.hasAttribute('aria-pressed') && !c.hidden);
  if (btns.length < MIN) return null;
  if (btns.filter(b => b.getAttribute('aria-pressed') === 'true').length !== 1) return null;
  return btns;
}
function build(el, btns) {
  let w = el.previousElementSibling; if (!w || !w.classList.contains('ddw')) { w = document.createElement('label'); w.className = 'ddw'; w.innerHTML = '<span class="ddl">' + (el.dataset.ddl || 'Category') + '</span><select class="dd"></select><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; el.parentNode.insertBefore(w, el);
    w.querySelector('select').addEventListener('change', e => { const b = w._btns && w._btns[+e.target.value]; if (b) b.click(); }); }
  const s = w.querySelector('select'), lab = el.getAttribute('aria-label') || (el.closest('[aria-label]') || {}).getAttribute && el.closest('[aria-label]').getAttribute('aria-label') || 'Filter';
  s.setAttribute('aria-label', lab);
  s.innerHTML = btns.map((b, i) => { const t = txt(b).replace(/[<>&]/g, ''); return `<option value="${i}">${/^all$/i.test(t) ? 'All' : t}</option>`; }).join('');
  s.value = String(pressed(btns)); w._btns = btns; w._sig = sig(btns); el.classList.add('dd-hid'); el._dd = w;
}
function sync(el) { const w = el._dd; if (!w) return; const btns = eligible(el); if (!btns) { w.remove(); el.classList.remove('dd-hid'); el._dd = null; return; } if (sig(btns) !== w._sig || btns.some((b, i) => b !== w._btns[i])) build(el, btns); else w.querySelector('select').value = String(pressed(btns)); }
let q = 0;
function scan() { q = 0; const seen = new Set(); document.querySelectorAll('button[aria-pressed]').forEach(b => { const p = b.parentElement; if (!p || seen.has(p)) return; seen.add(p); if (p._dd) { sync(p); return; } const btns = eligible(p); if (btns) build(p, btns); });
  document.querySelectorAll('.ddw').forEach(w => { const el = w.nextElementSibling; if (!el || el._dd !== w) w.remove(); }); }
const later = () => { if (!q) q = requestAnimationFrame(scan); };
new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'hidden'] });
scan();
})();

/* Inspire FM · desktop: the Toolbox is exclusive to phones. On a computer the Toolbox page only invites people to get it
   on their phone (screenshots, what's included, a QR code and how to add it to the Home Screen). */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$ } = X;
/* owner rule: the Toolbox tools are phone-only; on a computer the Toolbox page is just the invite */
const DESK = [];
const isDesk = () => matchMedia('(min-width: 761px)').matches;
const appUrl = () => location.origin + location.pathname + '?getapp=1#toolbox';

function promoHTML() {
  const phoneOnly = $$('.page[data-page="toolbox"] .tbt');
  const ic = phoneOnly.slice(0, 12).map((t, i) => { const a = t.querySelector('.ai'); const name = (t.querySelector('b') || {}).textContent || '';
    return `<li>${a ? a.outerHTML.replace(/id="([^"]+)"/g, `id="$1-dp${i}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-dp${i})`) : ''}<span>${name}</span></li>`; }).join('');
  return `<section class="dp" id="deskPromo"><div class="wrap dp-in">
    <div class="dp-copy"><span class="eyebrow">Only on your phone</span><h2>Get the full Islamic Toolbox in your pocket.</h2>
      <p>Prayer alerts with the adhan, a tasbih that counts with every tap, the qibla wherever you are, your prayer tracker and streaks, all saved on your phone. Free, with no app store needed.</p>
      <ul class="dp-tools">${ic}</ul>
      <ul class="dp-why"><li>Prayer time alerts with the adhan</li><li>Events, news and appeals from Luton</li><li>Janazah notices as they're announced</li><li>Opens in one tap, full screen</li></ul></div>
    <div class="dp-phones" aria-hidden="true">${['home', 'toolbox', 'ramadan'].map((n, i) => `<div class="dp-ph p${i}"><img src="img/promo/${n}.webp" alt="" loading="lazy"></div>`).join('')}</div>
    <div class="dp-qr"><div class="dp-code" id="dpCode"></div><b>Scan with your phone camera</b>
      <ol><li><b>iPhone:</b> open it in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.</li><li><b>Android:</b> in Chrome, tap the menu, then <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>
      <small>All ${$$('.page[data-page="toolbox"] .tbt').length} tools are made for your phone, so the Toolbox lives there.</small></div>
  </div></section>`;
}
function drawQR() {
  const box = $('#dpCode'); if (!box || box.dataset.done) return;
  const go = () => { try { const q = window.qrcode(0, 'M'); q.addData(appUrl()); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); box.dataset.done = 1; } catch (e) {} };
  if (window.qrcode) go(); else { const s = document.createElement('script'); s.src = 'qrcode.min.js'; s.onload = go; document.head.appendChild(s); }
}
function apply() {
  const pg = $('.page[data-page="toolbox"]'); if (!pg) return;
  const on = isDesk(); document.documentElement.classList.toggle('desk', on);
  $$('.tbt', pg).forEach(t => t.classList.toggle('mob-only', !DESK.includes(t.getAttribute('href'))));
  $$('.tb-sec', pg).forEach(h => { const g = h.nextElementSibling; if (g && g.classList.contains('tb-grid')) h.classList.toggle('mob-only', !$$('.tbt', g).some(t => DESK.includes(t.getAttribute('href')))); });
  if (on && !$('#deskPromo')) { const hero = $('.tb-hero', pg); (hero || pg.firstElementChild).insertAdjacentHTML('afterend', promoHTML()); }
  if (on) drawQR();
  /* a small invite on the desktop home page too */
  const home = $('.page[data-page="home"]');
  if (on && home && !$('#deskInvite')) { const anchor = home.querySelector('.hero') || home.firstElementChild;
    anchor.insertAdjacentHTML('afterend', `<a class="di" id="deskInvite" href="#toolbox"><div class="wrap di-in"><img src="img/promo/toolbox.webp" alt=""><div><b>The Inspire FM Islamic Toolbox, on your phone</b><span>Prayer alerts, tasbih, qibla, Quran, duas and more. Scan the QR code to add it free.</span></div><span class="di-go">Get it on your phone</span></div></a>`); }
}
apply(); addEventListener('resize', () => { clearTimeout(apply._t); apply._t = setTimeout(apply, 200); });

/* opened from the QR code on a phone: show how to add it to the Home Screen */
if (/[?&]getapp=1/.test(location.search) && !isDesk() && !(matchMedia('(display-mode: standalone)').matches || navigator.standalone))
  setTimeout(() => { window.IFM_SYNC && IFM_SYNC.open('home'); }, 1500);
})();

/* Inspire FM · long lists in the Toolbox show their first few items, then a "Show all" button.
   Research (NN/g 2018): most attention goes on the first screen or two, and on phones people stop before the end
   of very long pages. Each list re-applies the limit when it is redrawn (search, filters), unless the person
   already asked to see everything. */
(function () {
'use strict';
const LISTS = [
  { sel: '#scr #jList', n: 6, item: '.jm', word: 'masjids' },
  { sel: '#scr .dk-list', n: 4, item: '.dk-card', word: 'duas' },
  { sel: '#scr .sq-list', n: 6, item: '.sq-tile', word: 'stories' },
  { sel: '#scr #surahs', n: 12, item: null, word: 'surahs' }
];
const open = new WeakSet();
function apply(L) {
  document.querySelectorAll(L.sel).forEach(list => {
    const items = [...list.children].filter(c => (!L.item || c.matches(L.item)) && !c.classList.contains('ll-more'));
    let btn = list.nextElementSibling && list.nextElementSibling.classList.contains('ll-more') ? list.nextElementSibling : null;
    if (open.has(list) || items.length <= L.n + 2) { items.forEach(c => c.classList.remove('ll-hid')); if (btn) btn.remove(); return; }
    items.forEach((c, i) => { const h = i >= L.n; if (c.classList.contains('ll-hid') !== h) c.classList.toggle('ll-hid', h); });
    if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.className = 'll-more'; list.after(btn);
      btn.onclick = () => { open.add(list); items.forEach(c => c.classList.remove('ll-hid')); list.querySelectorAll('.ll-hid').forEach(c => c.classList.remove('ll-hid')); btn.remove(); }; }
    const t = `Show all ${items.length} ${L.word}`; if (btn.textContent !== t) btn.textContent = t;
  });
}
let q = 0;
const run = () => { q = 0; LISTS.forEach(apply); };
new MutationObserver(() => { if (!q) q = requestAnimationFrame(run); }).observe(document.body, { childList: true, subtree: true });
/* a new search or filter starts a fresh, short list again */
document.addEventListener('input', e => { if (e.target.closest && e.target.closest('#scr')) LISTS.forEach(L => document.querySelectorAll(L.sel).forEach(l => open.delete(l))); }, true);
document.addEventListener('ifm:tool', () => LISTS.forEach(L => document.querySelectorAll(L.sel).forEach(l => open.delete(l))));
run();
})();

/* Toolbox, grouped: a Today card (next prayer + your four most recent tools), then every tool in calm two-column group cards with one colour each.
   The original tiles stay in the page (hidden) so search, live status lines and other scripts keep working; the grouped view mirrors them. */
(function () {
  'use strict';
  const X = window.IFMX; if (!X) return;
  const get = () => X.store.get('tbRecent', []);
  document.addEventListener('ifm:tool', e => { const k = e.detail; if (!k) return; const R = get().filter(x => x !== k); R.unshift(k); X.store.set('tbRecent', R.slice(0, 8)); setTimeout(draw, 400); });
  const G = [['pray', 'Pray', '#5c5b59', '#bfbebc', ['prayer', 'track', 'alerts', 'qibla', 'tasbih', 'jamaat']], ['quran', 'Quran and duas', '#305552', '#8bbdb5', ['quran', 'ayah', 'duas', 'stories', 'feel']], ['life', 'Life and family', '#7b5b42', '#b19e6e', ['revert', 'wedding', 'baby', 'health', 'family', 'loss']], ['learn', 'Learn', '#596a9c', '#b8c7d8', ['salah', 'dress', 'kids', 'watch']], ['future', 'Future and careers', '#26313b', '#b2a271', ['pathfinder', 'skills']], ['local', 'Masjid and local', '#8b73b4', '#d2cee4', ['jummah', 'food', 'business', 'notices', 'janazah', 'iam']], ['dates', 'Hajj, seasons and dates', '#894d66', '#dec3d2', ['hajj', 'ramadan', 'eid', 'hijri', 'dates', 'weather']], ['money', 'Money', '#39596b', '#a9c4d0', ['zakat', 'money', 'inherit']]];
  const P = { clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', check: '<rect x="4.5" y="4" width="15" height="16" rx="2.5"/><path d="M8.5 10l2 2 4-4M8.5 16h7"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>', compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', beads: '<circle cx="12" cy="5" r="1.6"/><circle cx="17" cy="7.5" r="1.6"/><circle cx="18.5" cy="13" r="1.6"/><circle cx="7" cy="7.5" r="1.6"/><circle cx="5.5" cy="13" r="1.6"/><circle cx="8.5" cy="17.5" r="1.6"/><circle cx="15.5" cy="17.5" r="1.6"/><path d="M12 19v2.5"/>', users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 14.2c2.6-.3 5 1.4 5 4.3"/>', book: '<path d="M3.5 6c3-1.5 6-1.5 8.5.5 2.5-2 5.5-2 8.5-.5v13c-3-1.5-6-1.5-8.5.5-2.5-2-5.5-2-8.5-.5z"/><path d="M12 6.5v13"/>', spark: '<path d="M12 3c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6z"/><path d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z"/>', hands: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 12V5a1.5 1.5 0 0 1 3 0v7M14 12V7.5a1.5 1.5 0 0 1 3 0V14c0 4-2.2 6.5-6 6.5S5 18 5 15l-1-3.2a1.5 1.5 0 0 1 2.6-1.3L8 13"/>', scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7"/><path d="M8.5 9h6M8.5 12.5h6M8.5 16h4"/>', heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>', sun: '<path d="M3 17h18M6.5 17a5.5 5.5 0 0 1 11 0"/><path d="M12 6.5v2M5.5 9.5l1.4 1.4M18.5 9.5l-1.4 1.4M2.5 13h2M19.5 13h2"/>', rings: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M12 3.5l1.8 2.2-1.8 2-1.8-2z"/>', baby: '<circle cx="12" cy="9" r="5"/><path d="M10 9h0M14 9h0M10.5 11.3c.9.6 2.1.6 3 0"/><path d="M6.5 20c.8-2.6 3-4.2 5.5-4.2s4.7 1.6 5.5 4.2"/>', pulse: '<path d="M3 12h4l2-4 3.5 8 2.5-5.5 1.5 1.5h4.5"/>', family: '<circle cx="8" cy="6.5" r="2.5"/><circle cx="16" cy="6.5" r="2.5"/><circle cx="12" cy="13" r="2"/><path d="M4.5 20v-5a3.5 3.5 0 0 1 7 0M12.5 15a3.5 3.5 0 0 1 7 0v5M9.5 20v-2.5a2.5 2.5 0 0 1 5 0V20"/>', moon: '<path d="M15.5 4.5a8 8 0 1 0 4 12.5 6.5 6.5 0 1 1-4-12.5z"/>', mat: '<rect x="6.5" y="3.5" width="11" height="17" rx="1.5"/><path d="M9.5 9.5L12 6.5l2.5 3V13h-5z"/><path d="M9 16.5h6"/>', hanger: '<path d="M12 8.5V7.6a2 2 0 1 0-2-2"/><path d="M12 8.5l-8.5 6.2a1.5 1.5 0 0 0 .9 2.8h15.2a1.5 1.5 0 0 0 .9-2.8z"/>', star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/>', play: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10.5 9.5v5l4-2.5z"/>', mosque: '<path d="M5 20v-7a7 7 0 0 1 14 0v7"/><path d="M12 6V3.5M3 20h18M10 20v-3.5a2 2 0 0 1 4 0V20"/>', food: '<path d="M4 13h16a8 8 0 0 1-16 0z"/><path d="M9 4c-1 1.5 1 2.5 0 4M12 3.5c-1 1.5 1 2.5 0 4M15 4c-1 1.5 1 2.5 0 4"/>', shop: '<path d="M4 9.5L5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>', pin: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12.5h5"/><circle cx="16" cy="16" r="1.4"/>', candle: '<path d="M12 3.5c1.8 2.2 1.8 3.8 0 5-1.8-1.2-1.8-2.8 0-5z"/><rect x="9.5" y="10.5" width="5" height="10" rx="1"/>', shield: '<path d="M12 3.5l7.5 3V12c0 4.5-3.2 7.4-7.5 8.5C7.7 19.4 4.5 16.5 4.5 12V6.5z"/><path d="M12 8v4.5M12 15.5h0"/>', kaaba: '<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9M4 11l8 4 8-4"/>', lantern: '<path d="M12 2.5v2.5M9 5h6l1 2.5H8z"/><path d="M8 7.5h8c1.2 3.6 1.2 8.4 0 12H8c-1.2-3.6-1.2-8.4 0-12z"/><path d="M12 11v5"/>', crescent: '<path d="M14 4.5a7.5 7.5 0 1 0 5 12.4A6 6 0 1 1 14 4.5z"/><path d="M18.5 4l.7 1.6 1.7.2-1.3 1.1.4 1.7-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2z"/>', cal: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4M8 14h2M12 14h2M8 17h2"/>', calmoon: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/><path d="M13.5 12.5a3 3 0 1 0 1.8 4.6 2.4 2.4 0 1 1-1.8-4.6z"/>', cloud: '<circle cx="9" cy="8" r="3"/><path d="M9 2.5v1.5M3.5 8H5M5 4l1 1M13 4l-1 1"/><path d="M8 19.5h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.3A2.9 2.9 0 0 0 8 19.5z"/>', coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9 15l6-6M9.5 9.5h0M14.5 14.5h0"/>', bank: '<path d="M3.5 9L12 4l8.5 5zM5 20h14M6.5 11v6M10 11v6M14 11v6M17.5 11v6"/>', scale: '<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>' };
  const ICK = { prayer: 'clock', track: 'check', alerts: 'bell', qibla: 'compass', tasbih: 'beads', jamaat: 'users', quran: 'book', ayah: 'spark', duas: 'hands', stories: 'scroll', feel: 'heart', revert: 'sun', wedding: 'rings', baby: 'baby', health: 'pulse', family: 'family', loss: 'moon', salah: 'mat', dress: 'hanger', kids: 'star', watch: 'play', jummah: 'mosque', food: 'food', business: 'shop', notices: 'pin', janazah: 'candle', iam: 'shield', hajj: 'kaaba', ramadan: 'lantern', eid: 'crescent', hijri: 'calmoon', dates: 'cal', weather: 'cloud', zakat: 'coin', money: 'bank', inherit: 'scale' };
  const ico = k => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[ICK[k]] || P.star}</svg>`;
  let tilesRef = {}, uid = 0;
  const art = k => { const t = tilesRef[k], a = t && t.querySelector('.ai svg'); if (!a) return ico(k); const n = ++uid; return a.outerHTML.replace(/id="([\w-]+)"/g, `id="$1_v${n}"`).replace(/url\(#([\w-]+)\)/g, `url(#$1_v${n})`).replace(/href="#([\w-]+)"/g, (m, x) => /^g|^c/.test(x) ? `href="#${x}_v${n}"` : m); };
  const keyOf = t => { const h = t.getAttribute('href') || ''; return h.startsWith('#tb-') ? h.slice(4) : h.slice(1); };
  let pg, wrap;
  function draw() {
    pg = document.querySelector('[data-page=toolbox]'); if (!pg) return; const s = pg.querySelector('.tb-search'); if (!s) return; wrap = s.parentNode; pg.classList.add('tbv2');
    const tiles = {}; pg.querySelectorAll('.tbt:not(.v2x)').forEach(t => { if (!t.closest('.tv2')) tiles[keyOf(t)] = t; });
    if (!Object.keys(tiles).length) return; tilesRef = tiles;
    const grpOf = k => G.find(g => g[4].includes(k)), all = G.flatMap(g => g[4]), extra = Object.keys(tiles).filter(k => !all.includes(k));
    const def = ['prayer', 'quran', 'jummah', 'duas'], R = get().filter(k => tiles[k]).concat(def.filter(k => tiles[k])).filter((k, i, a) => a.indexOf(k) === i).slice(0, 4);
    const nx = (document.getElementById('tbNext') || {}).textContent || '', inn = (document.getElementById('tbIn') || {}).textContent || '';
    const item = (k, g) => { const t = tiles[k]; if (!t) return ''; const sm = t.querySelector('small'); return `<a class="tv2-i" href="${t.getAttribute('href')}" data-k="${k}" style="--gc:${g[2]};--gl:${g[3]}"><span class="tv2-ic art">${art(k)}</span><b>${t.querySelector('b').textContent}</b><small>${sm ? sm.textContent : ''}</small></a>`; };
    const groups = G.concat(extra.length ? [['more', 'More', '#52575e', '#d2d6da', extra]] : []);
    let box = wrap.querySelector('.tv2'); if (!box) { box = document.createElement('div'); box.className = 'tv2'; s.insertAdjacentElement('afterend', box); }
    const keepY = scrollY, keepH = box.offsetHeight; if (keepH) box.style.minHeight = keepH + 'px';
    box.innerHTML = `<div class="tv2-today"><div class="tv2-th"><span>Recently opened</span></div><div class="tv2-rec">${R.map(k => { const g = grpOf(k) || groups[groups.length - 1]; return `<a href="${tiles[k].getAttribute('href')}" data-k="${k}" style="--gc:${g[2]};--gl:${g[3]}"><span class="tv2-ic big art">${art(k)}</span><small>${tiles[k].querySelector('b').textContent}</small></a>`; }).join('')}</div></div>`
      + groups.map(g => { const L = g[4].filter(k => tiles[k]); return L.length ? `<section class="tv2-g" data-g="${g[0]}" style="--gc:${g[2]};--gl:${g[3]}"><h3><i></i>${g[1]}<span>${L.length}</span></h3><div class="tv2-l">${L.map(k => item(k, g)).join('')}</div></section>` : ''; }).join('');
    requestAnimationFrame(() => { box.style.minHeight = ''; if (Math.abs(scrollY - keepY) > 2) scrollTo(0, keepY); });
    mirror();
  }
  function mirror() { if (!wrap) return; const v = ((document.getElementById('tbQ') || {}).value || '').trim();
    wrap.querySelectorAll('.tv2-g').forEach(sec => { let n = 0; sec.querySelectorAll('.tv2-i').forEach(a => { const t = pg.querySelector(`.tbt[href="${a.getAttribute('href')}"]`); const hid = !!(v && t && t.hidden); a.hidden = hid; if (!hid) n++; }); sec.hidden = !n; const c = sec.querySelector('h3 span'); if (c) c.textContent = n; });
    const td = wrap.querySelector('.tv2-today'); if (td) td.hidden = !!v; }
  document.addEventListener('input', e => { if (e.target && e.target.id === 'tbQ') setTimeout(mirror, 0); });
  addEventListener('hashchange', () => { if (/^#toolbox/.test(location.hash)) setTimeout(draw, 150); });
  const css = document.createElement('style'); css.textContent = `
.tbv2 .tb-sec,.tbv2 .tb-sec+div,.tbv2 .tb-recent,.tbv2 .tb-more{display:none!important}
.tv2{display:grid;gap:14px;margin:16px 0 8px}
.tv2-today{background:linear-gradient(150deg,#edf0e8,#e0e5d9);border:1px solid #d0d7c7;border-radius:22px;padding:14px 14px 12px}html.dark .tv2-today{background:linear-gradient(150deg,#1f241d,#181c15);border-color:#323a2e}.tv2-today .tv2-th span{color:#4b5c3a}html.dark .tv2-today .tv2-th span{color:#a2b28c}.tv2-th{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.tv2-th span{font-size:.78rem;font-weight:600;color:var(--mut)}.tv2-th b{font-family:var(--display);font-size:.9rem;text-align:right}
.tv2-rec{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.tv2-rec a{display:grid;justify-items:center;gap:6px;text-decoration:none;color:var(--ink);text-align:center}.tv2-rec small{font-size:.72rem;font-weight:600;line-height:1.15}
.tv2-ic{width:38px;height:38px;flex:none;border-radius:12px;display:grid;place-items:center;color:var(--gc);background:color-mix(in srgb,var(--gc) 11%,transparent)}.tv2-ic svg{width:22px;height:22px}.tv2-ic.big{width:54px;height:54px;border-radius:17px}.tv2-ic.big svg{width:28px;height:28px}
.tv2-g{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:12px 12px 6px}.tv2-g h3{display:flex;align-items:center;gap:8px;margin:0 2px 8px;font-family:var(--display);font-size:1rem;color:var(--ink)}.tv2-g h3 i{width:10px;height:10px;border-radius:3px;background:var(--gc)}.tv2-g h3 span{margin-left:auto;font-size:.72rem;font-weight:600;color:var(--mut)}
.tv2-l{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}.tv2-i{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"i b" "i s";column-gap:10px;align-items:center;padding:10px 2px;border-top:1px solid var(--line);text-decoration:none;color:var(--ink);min-width:0}.tv2-l .tv2-i:nth-child(-n+2){border-top:0}
.tv2-i .tv2-ic{grid-area:i}.tv2-i b{grid-area:b;font-size:.88rem;font-weight:600;line-height:1.15;align-self:end}.tv2-i small{grid-area:s;font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:start}
.tv2-ic.art{background:none;border-radius:12px;overflow:hidden}.tv2-ic.art svg{width:100%;height:100%}.tv2-ic.big.art svg{width:100%;height:100%}html.dark .tv2-ic.art{background:none}
.tv2-i:active,.tv2-rec a:active{opacity:.6}
html.dark .tv2-ic{color:var(--gl);background:color-mix(in srgb,var(--gc) 26%,transparent)}
@media(min-width:900px){.tv2{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.tv2-today{grid-column:1/-1}.tv2-rec{grid-template-columns:repeat(4,minmax(0,120px))}.tv2-l{grid-template-columns:repeat(3,minmax(0,1fr))}.tv2-l .tv2-i:nth-child(3){border-top:0}}`;
  document.head.appendChild(css);
  const go = () => setTimeout(draw, 700); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  let lastScroll = 0; addEventListener('scroll', () => { lastScroll = Date.now(); }, { passive: true }); addEventListener('touchmove', () => { lastScroll = Date.now(); }, { passive: true });
  setInterval(() => { if (pg && !pg.hidden && !((document.getElementById('tbQ') || {}).value) && Date.now() - lastScroll > 4000) draw(); }, 60000);
})();

/* Sponsorship: a thin rotating home banner tuned to the time of day, "Supported by" on a few tools, and a 60-second sponsor builder on the Advertise page.
   Every sponsor shown is an EXAMPLE until real sponsors sign up. Nothing is ever shown on grief or loss pages. */
(function () {
  'use strict';
  const X = window.IFMX; if (!X) return;
  const { $, $$, esc, store, toast } = X;
  /* peak-time slots: when people actually open the app */
  const SLOTS = [['morning', 'Morning planning', 5, 10], ['midday', 'Midday', 10, 14], ['school', 'After school', 14, 17], ['evening', 'Evening & food', 17, 22], ['late', 'Late night', 22, 29]];
  const slotNow = () => { const h = new Date().getHours(), hh = h < 5 ? h + 24 : h; return (SLOTS.find(s => hh >= s[2] && hh < s[3]) || SLOTS[0])[0]; };
  const ADS = { morning: [['Example Travel', 'Umrah in February from £1,149 per person, ATOL protected', 'UMRAH50', '£50 off', '#305552'], ['Example Bakery', 'Fresh bread and pastries from 7am, Bury Park', 'FAJR10', '10% off before 9am', '#7b5b42']],
    midday: [['Example Islamic School', 'Open day Saturday: Reception to Year 11', '', 'Book a visit', '#596a9c'], ['Example Opticians', 'Free eye test for over-40s this month', 'INSPIRE', 'Free test', '#8b73b4']],
    school: [['Example Tuition Centre', 'GCSE maths and science, small groups', 'TUTOR20', '20% off first month', '#39596b'], ['Example Football Academy', 'Under-8s to under-14s, Saturdays', '', 'Free first session', '#375e46']],
    evening: [['Example Grill House', 'HMC halal grill, family platters from £29', 'IFM10', '10% off', '#865a48'], ['Example Desserts', 'Kunafa and waffles till late, Dunstable Road', 'SWEET', 'Free topping', '#894d66']],
    late: [['Example Charity', 'Feed a family this winter: £40 a hamper', '', 'Give now', '#234239'], ['Example Quran Academy', 'Online tajweed with qualified teachers', 'QURAN1', 'First month free', '#414b67']] };
  const TOOLSP = { jummah: ['Example Travel', '#305552'], food: ['Example Grill House', '#865a48'], hajj: ['Example Travel', '#305552'], quran: ['Example Quran Academy', '#414b67'], ayah: ['Example Quran Academy', '#414b67'], ramadan: ['Example Charity', '#234239'], baby: ['Example Halal Butchers', '#5a3e34'], wedding: ['Example Bridal & Groomswear', '#7b5b42'], health: ['Example Pharmacy', '#2b5146'] };
  const mono = (n, c) => `<span class="sp-mono" style="--c:${c}">${esc(n.replace(/^Example /, '').split(' ').slice(0, 2).map(w => w[0]).join(''))}</span>`;
  const adPop = a => { X.modal(`<div class="sp-pop">${mono(a[0], a[4])}<em class="sp-tag">Sponsored · example</em><h3>${esc(a[0])}</h3><p>${esc(a[1])}</p>${a[2] ? `<button type="button" class="sp-code" id="spCode">Code <b>${esc(a[2])}</b> · ${esc(a[3])}<i>Copy</i></button>` : `<div class="sp-offer">${esc(a[3])}</div>`}<p class="sp-why">Sponsors help keep the Inspire FM app free and fund the station’s charity work. Every sponsor is checked by the station.</p><a class="btn ghost" href="#advertise" style="width:100%">Advertise with Inspire FM</a></div>`);
    const c = $('#spCode'); if (c) c.onclick = () => { X.copy(a[2]); toast('Code copied'); }; $$('.sp-pop a').forEach(x => x.addEventListener('click', () => X.closeModal())); };
  /* 1. thin home banner carousel */
  const ADS_ON = false; /* example ads only appear in the deck for now */
  const banner = () => { if (!ADS_ON) return; const home = document.getElementById('appHome'); if (!home || home.querySelector('.sp-ban')) return; const pr = home.querySelector('.ah-pr'); if (!pr) return;
    if (store.get('spHide', '') === new Date().toDateString()) return;
    const L = ADS[slotNow()].concat(ADS.evening.slice(0, 1)).filter((a, i, all) => all.findIndex(b => b[0] === a[0]) === i);
    const el = document.createElement('div'); el.className = 'sp-ban'; el.setAttribute('data-noswipe', '');
    el.innerHTML = `<div class="sp-track">${L.map((a, i) => `<button type="button" class="sp-sl" data-ad="${i}" style="--c:${a[4]}">${mono(a[0], a[4])}<span><b>${esc(a[0])}</b><small>${esc(a[1])}</small></span><em>${esc(a[3])}</em></button>`).join('')}</div><span class="sp-ad">Ad</span><div class="sp-dots">${L.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><button type="button" class="sp-x" aria-label="Hide ads for today">×</button>`;
    pr.insertAdjacentElement('afterend', el);
    let i = 0; const tr = el.querySelector('.sp-track'), go = n => { i = (n + L.length) % L.length; tr.style.transform = `translateX(${-i * 100}%)`; $$('.sp-dots i', el).forEach((d, j) => d.classList.toggle('on', j === i)); };
    let t = setInterval(() => go(i + 1), 5000);
    let x0 = null; el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; clearInterval(t); }, { passive: true }); el.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; t = setInterval(() => go(i + 1), 5000); });
    $$('.sp-sl', el).forEach(b => b.onclick = () => adPop(L[+b.dataset.ad]));
    el.querySelector('.sp-x').onclick = e => { e.stopPropagation(); store.set('spHide', new Date().toDateString()); el.remove(); toast('No ads on the home page today'); };
  };
  new MutationObserver(() => banner()).observe(document.body, { childList: true, subtree: true }); setTimeout(banner, 1200);
  /* 2. "Supported by" under the tool title */
  document.addEventListener('ifm:tool', e => { const old = document.querySelector('.sp-by'); if (old) old.remove(); if (!ADS_ON) return; const k = e.detail, s = TOOLSP[k]; if (!s) return; const h = document.getElementById('scrH'); if (!h) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sp-by'; b.innerHTML = `<small>Supported by</small>${mono(s[0], s[1])}<b>${esc(s[0])}</b><em>Sponsored · example</em>`; h.insertAdjacentElement('afterend', b);
    b.onclick = () => adPop(Object.values(ADS).flat().find(a => a[0] === s[0]) || [s[0], 'A local business supporting this tool and Inspire FM.', '', 'Find out more', s[1]]); });
  /* 3. sponsor builder on the Advertise page */
  const RADIO = [['breakfast', 'Breakfast (7–10am)', 14], ['midday', 'Midday (10am–2pm)', 9], ['drive', 'Drive time (4–7pm)', 14], ['evening', 'Evening (7–11pm)', 8], ['jummah', 'Jummah special (Fri 11am–2pm)', 18]];
  const APP = [['banner', 'Home banner', 'A slide in the thin banner on the home screen, in the time slots you pick', 'day', 15], ['section', 'Sponsor a section', '“Supported by” your name on a tool: Jummah finder, Halal food, Hajj guide, Quran…', 'month', 150], ['featured', 'Featured listing', 'Pinned to the top of Halal food or the business directory, labelled Featured', 'month', 60], ['notify', 'Sponsored notification', '“Jummah Mubarak from…”, “Today’s ayah, brought to you by…”: useful, never spammy', 'send', 40], ['takeover', 'Full-day takeover', 'Every home banner slot for one whole day', 'day', 150], ['jummahpk', 'Jummah day package', 'Banner, Jummah finder sponsor and the Jummah notification, every Friday', 'Friday', 250]];
  const ACT = [6, 14, 30, 38, 26, 18, 16, 22, 34, 41, 36, 28, 46, 52, 38, 30, 44, 58, 62, 54, 40, 26, 14, 8];
  const SB = { mode: 'app', app: new Set(['banner']), slots: new Set(['evening']), times: new Set(['drive']), per: 2, weeks: 4, style: 'We write and voice it', sec: 'Jummah finder', notif: 'Jummah Mubarak' };
  function builder() { const pg = document.querySelector('[data-page=advertise] #adSteps'); if (!pg || document.getElementById('spB')) return; const box = document.createElement('div'); box.id = 'spB'; pg.parentNode.insertBefore(box, pg); drawB(); }
  function est() { let t = 0; const L = [];
    if (SB.mode !== 'app') { RADIO.filter(r => SB.times.has(r[0])).forEach(r => { const v = r[2] * SB.per * 7 * SB.weeks; t += v; L.push([r[1].split(' (')[0] + ' radio spots', v]); }); }
    if (SB.mode !== 'radio') APP.filter(a => SB.app.has(a[0])).forEach(a => { const v = a[3] === 'day' ? a[4] * 7 * SB.weeks * (a[0] === 'banner' ? Math.max(1, SB.slots.size) : 1) / (a[0] === 'takeover' ? 7 : 1) : a[3] === 'month' ? a[4] * Math.max(1, Math.round(SB.weeks / 4)) : a[3] === 'Friday' ? a[4] * SB.weeks : a[4] * SB.weeks; t += v; L.push([a[1], v]); });
    return [Math.round(t), L]; }
  function drawB() { const box = document.getElementById('spB'); if (!box) return; const [tot, L] = est(), mx = Math.max(...ACT);
    box.innerHTML = `<div class="spb"><span class="eyebrow">Sponsor in a minute</span><h2>Put your business in front of Luton</h2><p>Pick what you want, see an example price, send it. The team replies within two working days with a plan.</p>
      <div class="spb-mode">${[['radio', 'On air'], ['app', 'In the app'], ['both', 'Both']].map(([k, n]) => `<button type="button" data-sbm="${k}" aria-pressed="${SB.mode === k}">${n}</button>`).join('')}</div>
      ${SB.mode !== 'app' ? `<div class="spb-sec"><b>Radio: when should it play?</b><div class="spb-chips">${RADIO.map(r => `<button type="button" data-sbt="${r[0]}" aria-pressed="${SB.times.has(r[0])}">${r[1]}</button>`).join('')}</div>
        <div class="spb-row"><label>Spots a day<select data-sbv="per">${[1, 2, 4, 6].map(v => `<option ${SB.per == v ? 'selected' : ''}>${v}</option>`).join('')}</select></label><label>Style<select data-sbv="style">${['We write and voice it', 'Your own advert', 'Show sponsorship (“brought to you by”)', 'Informative feature'].map(v => `<option ${SB.style === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div></div>` : ''}
      ${SB.mode !== 'radio' ? `<div class="spb-sec"><b>In the app: where?</b><div class="spb-cards">${APP.map(a => `<button type="button" class="spb-c" data-sba="${a[0]}" aria-pressed="${SB.app.has(a[0])}"><b>${a[1]}</b><small>${a[2]}</small><em>from £${a[4]} / ${a[3]}</em></button>`).join('')}</div>
        ${SB.app.has('banner') ? `<b class="spb-l">When do you want to be seen? <small>(example activity)</small></b><div class="spb-chart">${ACT.map((v, h) => { const hh = h < 5 ? h + 24 : h, s = (SLOTS.find(z => hh >= z[2] && hh < z[3]) || SLOTS[0])[0]; return `<i class="${SB.slots.has(s) ? 'on' : ''}" style="height:${v / mx * 100}%" title="${h}:00"></i>`; }).join('')}</div><div class="spb-chips">${SLOTS.map(s => `<button type="button" data-sbs="${s[0]}" aria-pressed="${SB.slots.has(s[0])}">${s[1]}</button>`).join('')}</div>` : ''}
        ${SB.app.has('section') ? `<label class="spb-one">Which section?<select data-sbv="sec">${['Jummah finder', 'Halal food near me', 'Hajj & Umrah guide', 'Quran', 'Ayah a day', 'Ramadan timetable', 'New baby (aqiqah)', 'Marriage', 'Health'].map(v => `<option ${SB.sec === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}
        ${SB.app.has('notify') || SB.app.has('jummahpk') ? `<label class="spb-one">Which notification?<select data-sbv="notif">${['Jummah Mubarak', 'Ayah of the day', 'Iftar time', 'Eid Mubarak'].map(v => `<option ${SB.notif === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label><div class="spb-phone"><div class="spb-n"><span class="spb-ni">IFM</span><div><b>Inspire FM · now</b><p>${SB.notif === 'Jummah Mubarak' ? 'Jummah Mubarak 🌙 Read Surah al-Kahf today. Your nearest Jummah is in the app.' : SB.notif === 'Ayah of the day' ? 'Today’s ayah is ready. Keep your streak going.' : SB.notif === 'Iftar time' ? 'Iftar in Luton in 15 minutes. Taqabbal Allah.' : 'Eid Mubarak from all at Inspire FM.'}<br><small>Brought to you by Your Business</small></p></div></div></div>` : ''}</div>` : ''}
      <div class="spb-row"><label>How long?<select data-sbv="weeks">${[[1, '1 week'], [2, '2 weeks'], [4, '1 month'], [12, '3 months'], [4.3, 'All of Ramadan']].map(([v, n]) => `<option value="${v}" ${SB.weeks == v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>Business name<input id="sbBiz" placeholder="Your business"></label></div>
      <div class="spb-tot"><div>${L.map(([n, v]) => `<span><em>${esc(n)}</em><b>£${Math.round(v).toLocaleString('en-GB')}</b></span>`).join('') || '<span><em>Pick something above</em></span>'}</div><strong>Example total <b>£${tot.toLocaleString('en-GB')}</b></strong><small>Example rates only: Inspire FM sets the real prices. Charities and Ramadan packages can be discounted.</small></div>
      <div class="spb-row"><label>Your name<input id="sbName" autocomplete="name"></label><label>Phone or email<input id="sbCon"></label></div>
      <div class="spb-go"><button type="button" class="btn g" id="sbSend">Send my request</button></div><div id="sbOut" class="fmsg" role="status"></div>
      <p class="spb-rule">Our promise to listeners: ads are always labelled, never pop up over content, never appear on grief and loss pages, and every sponsor is checked by the station.</p></div>`;
    $$('[data-sbm]', box).forEach(b => b.onclick = () => { SB.mode = b.dataset.sbm; drawB(); });
    $$('[data-sbt]', box).forEach(b => b.onclick = () => { const k = b.dataset.sbt; SB.times.has(k) ? SB.times.delete(k) : SB.times.add(k); drawB(); });
    $$('[data-sba]', box).forEach(b => b.onclick = () => { const k = b.dataset.sba; SB.app.has(k) ? SB.app.delete(k) : SB.app.add(k); drawB(); });
    $$('[data-sbs]', box).forEach(b => b.onclick = () => { const k = b.dataset.sbs; SB.slots.has(k) ? SB.slots.delete(k) : SB.slots.add(k); drawB(); });
    $$('[data-sbv]', box).forEach(s => s.onchange = () => { const k = s.dataset.sbv; SB[k] = ['per', 'weeks'].includes(k) ? +s.value : s.value; drawB(); });
    $('#sbSend', box).onclick = () => { const out = $('#sbOut', box), biz = $('#sbBiz', box).value.trim(), con = $('#sbCon', box).value.trim(); if (!biz || !con) { out.className = 'fmsg on err'; out.textContent = 'Please add your business name and a phone or email.'; return; }
      const [t2, L2] = est(), D = X.D || {}, body = `Sponsorship request\n\nBusiness: ${biz}\nContact: ${$('#sbName', box).value.trim()} · ${con}\nMode: ${SB.mode}\n${SB.mode !== 'app' ? `Radio: ${[...SB.times].join(', ')} · ${SB.per} a day · ${SB.style}\n` : ''}${SB.mode !== 'radio' ? `App: ${[...SB.app].join(', ')}${SB.app.has('banner') ? ' · slots ' + [...SB.slots].join(', ') : ''}${SB.app.has('section') ? ' · section ' + SB.sec : ''}${SB.app.has('notify') ? ' · notification ' + SB.notif : ''}\n` : ''}Length: ${SB.weeks} weeks\nExample estimate: £${t2}\n${L2.map(([n, v]) => `- ${n}: £${Math.round(v)}`).join('\n')}`;
      out.className = 'fmsg on'; out.innerHTML = `<b>Ready to send.</b> On the live app this goes straight to the Inspire FM bookings dashboard. For now, send it by <a href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:${D.email}?subject=${encodeURIComponent('Sponsorship: ' + biz)}&body=${encodeURIComponent(body)}">email</a>.`; };
  }
  new MutationObserver(() => builder()).observe(document.body, { childList: true, subtree: true }); setTimeout(builder, 1000);
  const css = document.createElement('style'); css.textContent = `
.sp-mono{width:36px;height:36px;flex:none;border-radius:11px;background:var(--c);color:#fff;display:grid;place-items:center;font-family:var(--display);font-weight:600;font-size:.86rem}
.sp-ban{position:relative;overflow:hidden;border-radius:18px;background:var(--card,#fff);border:1px solid var(--line);margin:12px 0 0;height:64px}.sp-track{display:flex;height:100%;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.sp-sl{flex:0 0 100%;display:flex;align-items:center;gap:10px;padding:0 44px 0 12px;border:0;background:linear-gradient(90deg,color-mix(in srgb,var(--c) 10%,transparent),transparent);font:inherit;color:var(--ink);text-align:left;min-width:0}.sp-sl>span:not(.sp-mono){flex:1;min-width:0}.sp-ban .sp-mono{flex:0 0 36px;width:36px;padding:0}.sp-sl b{display:block;font-size:.84rem;font-family:var(--display)}.sp-sl small{display:block;font-size:.72rem;color:var(--char);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sp-sl em{flex:none;font-style:normal;font-weight:600;font-size:.68rem;color:#fff;background:var(--c);border-radius:999px;padding:4px 8px}
.sp-ad{position:absolute;left:8px;top:4px;font-size:.54rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);background:var(--card);border-radius:4px;padding:0 3px}.sp-dots{position:absolute;left:0;right:0;bottom:4px;display:flex;justify-content:center;gap:4px}.sp-dots i{width:5px;height:5px;border-radius:50%;background:var(--line)}.sp-dots i.on{background:var(--mut);width:12px;border-radius:4px}
.sp-x{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:50%;background:var(--paper,#f4f4f4);color:var(--mut);font-size:1rem;line-height:1}
.sp-by{display:flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:4px 10px 4px 5px;margin:-4px 0 12px;font:inherit;color:var(--ink);max-width:100%}.sp-by .sp-mono{width:22px;height:22px;border-radius:7px;font-size:.6rem}.sp-by small{font-size:.66rem;color:var(--mut);padding-left:5px}.sp-by b{font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sp-by em{font-style:normal;font-size:.58rem;color:var(--mut);white-space:nowrap}
.sp-pop{text-align:center}.sp-pop .sp-mono{width:64px;height:64px;margin:0 auto 8px;border-radius:20px;font-size:1.4rem}.sp-tag{font-style:normal;font-size:.66rem;font-weight:600;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:2px 8px}.sp-pop h3{margin:8px 0 4px;font-size:1.35rem}.sp-pop p{color:var(--char)}.sp-code{display:flex;justify-content:center;gap:6px;width:100%;border:1.5px dashed var(--g3,#807f7d);background:none;border-radius:14px;padding:12px;font:inherit;color:var(--ink)}.sp-code i{font-style:normal;font-weight:600;color:var(--g3,#807f7d)}.sp-offer{font-weight:600;font-size:1.05rem}.sp-why{font-size:.8rem}
.spb{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:20px 16px;margin-bottom:28px;display:grid;gap:14px}.spb h2{margin:2px 0 0;font-family:var(--display);font-size:1.5rem}.spb>p{margin:0;color:var(--char)}
.spb-mode{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(--paper,#f4f4f4);padding:4px;border-radius:14px}.spb-mode button{border:0;background:none;border-radius:11px;padding:10px;font:inherit;font-weight:600;color:var(--char)}.spb-mode button[aria-pressed=true]{background:var(--g3,#807f7d);color:#fff}
.spb-sec{display:grid;gap:10px}.spb-sec>b,.spb-l{font-family:var(--display)}.spb-l small{font-family:inherit;font-weight:600;color:var(--mut);font-size:.74rem}.spb-chips{display:flex;flex-wrap:wrap;gap:6px}.spb-chips button{border:1.5px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:8px 12px;font:inherit;font-weight:600;font-size:.8rem}.spb-chips button[aria-pressed=true]{background:var(--g3,#807f7d);color:#fff;border-color:var(--g3,#807f7d)}
.spb-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px}.spb-c{display:grid;gap:4px;text-align:left;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);border-radius:16px;padding:11px;font:inherit}.spb-c b{font-family:var(--display);font-size:.9rem}.spb-c small{font-size:.72rem;color:var(--char);line-height:1.35}.spb-c em{font-style:normal;font-weight:600;font-size:.72rem;color:var(--g3,#807f7d)}.spb-c[aria-pressed=true]{border-color:var(--g3,#807f7d);box-shadow:inset 0 0 0 1px var(--g3,#807f7d);background:color-mix(in srgb,var(--g3,#807f7d) 8%,var(--bg))}
.spb-chart{display:flex;align-items:flex-end;gap:2px;height:70px;padding:6px;border-radius:12px;background:var(--paper,#f4f4f4)}.spb-chart i{flex:1;border-radius:3px 3px 0 0;background:var(--line);transition:background .3s}.spb-chart i.on{background:var(--g3,#807f7d)}
.spb-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.spb-row label,.spb-one{display:grid;gap:4px;font-size:.8rem;font-weight:600}.spb select,.spb input{font:inherit;font-size:16px;font-weight:500;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--bg);color:var(--ink);width:100%;box-sizing:border-box}
.spb-phone{background:linear-gradient(160deg,#272b32,#181b21);border-radius:20px;padding:14px}.spb-n{display:flex;gap:10px;background:rgba(255,255,255,.92);border-radius:14px;padding:10px;color:#111}.spb-ni{width:34px;height:34px;flex:none;border-radius:9px;background:#a4a3a1;color:#111;display:grid;place-items:center;font-weight:600;font-size:.7rem}.spb-n b{font-size:.76rem}.spb-n p{margin:2px 0 0;font-size:.82rem;line-height:1.35}.spb-n small{color:#666}
.spb-tot{border-radius:18px;padding:14px;background:color-mix(in srgb,var(--g3,#807f7d) 10%,var(--bg));display:grid;gap:8px}.spb-tot div{display:grid;gap:4px}.spb-tot span{display:flex;justify-content:space-between;font-size:.84rem}.spb-tot em{font-style:normal;color:var(--char)}.spb-tot strong{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line);padding-top:8px}.spb-tot strong b{font-family:var(--display);font-size:1.5rem}.spb-tot small{font-size:.74rem;color:var(--mut)}
.spb-go .btn{width:100%}.spb-rule{margin:0;font-size:.78rem;color:var(--mut)}@media(min-width:900px){.spb{padding:28px}.spb-cards{grid-template-columns:repeat(3,1fr)}}`;
  document.head.appendChild(css);
})();

/* Tab bar bubble: re-measure the grey bubble once the bar has finished resizing (it docks full width inside sections and
   shrinks back on Close), so it never stays stuck where the old, wider tab used to be. */
(function () {
  const tb = document.getElementById('tabbar'); if (!tb) return;
  const place = () => { const on = tb.querySelector('[data-t].on'), ind = tb.querySelector('.tab-ind'); if (!ind) return;
    if (!on || document.documentElement.classList.contains('aptool')) return;
    ind.style.transition = 'none'; ind.style.transform = `translateX(${on.offsetLeft - 4}px)`; ind.style.width = on.offsetWidth + 'px'; void ind.offsetWidth; ind.style.transition = ''; };
  tb.addEventListener('transitionend', e => { if (e.target === tb || e.target.matches('[data-t]')) place(); });
  addEventListener('hashchange', () => { setTimeout(place, 60); setTimeout(place, 380); });
  addEventListener('resize', place);
  new MutationObserver(() => setTimeout(place, 360)).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  setTimeout(place, 800);
})();



















/* Themed prayer card: a flat scene (Makkah, Madinah or Al-Aqsa) coloured for the time of day in Luton, with the sun or moon
   moving with the real prayer times and the live Luton weather on top (cloud, rain, snow, fog, storm). Calm, slow movement only. */
(function () {
  'use strict';
  const X = window.IFMX; if (!X) return;
  const { store } = X;
  /* sky top, sky bottom, sun, wall light, wall shade, arch, base band, ground/strip, cloud */
  const PAL = {
    dawn: ['#5a596b', '#b7a7ac', '#efe7e2', '#c4bbc1', '#9e949e', '#78707c', '#5e5763', '#4c4751', '#e2dadf', 'Fajr'],
    sunrise: ['#686164', '#bd9d8d', '#e6ded1', '#dcccc4', '#b39f99', '#877671', '#6b5d5a', '#534948', '#e7dbd4', 'Sunrise'],
    morning: ['#9bb0bc', '#e0e8ea', '#f3f0e8', '#eeebe6', '#cdc8c1', '#9f9890', '#7f7971', '#526368', '#ffffff', 'Morning'],
    day: ['#96a9b1', '#d4dbd8', '#e9e4d6', '#eae6e0', '#c9c2b9', '#999189', '#7a736c', '#43595a', '#ffffff', 'Zuhr'],
    golden: ['#96a6a8', '#d8d4c6', '#e1d9c6', '#dcd4c7', '#b9ae9e', '#908474', '#73685d', '#4c5b59', '#f6f4ef', 'Asr'],
    sunset: ['#6a646f', '#bb9d98', '#e0d4c5', '#d3c1bc', '#a89696', '#7c6c70', '#605358', '#463e42', '#e3d3d0', 'Maghrib'],
    dusk: ['#4d505d', '#9e98a4', '#eae5df', '#b9b4be', '#938e9c', '#676373', '#514e5c', '#3f3d49', '#cbc7d1', 'Maghrib'],
    night: ['#20222d', '#4b4e5f', '#e5e2d9', '#6b6e7f', '#535667', '#343644', '#2d303d', '#272934', '#5b5e6f', 'Isha'] };
  const LM = [['kaaba', 'Masjid al-Haram', 'Makkah'], ['madinah', 'Masjid an-Nabawi', 'Madinah'], ['aqsa', 'Al-Aqsa', 'Jerusalem']];
  const WX = [['', 'Clear'], ['cloud', 'Cloudy'], ['rain', 'Rain'], ['snow', 'Snow'], ['fog', 'Fog'], ['storm', 'Storm']];
  const period = () => { let T; try { T = X.today(); } catch (e) { return 'day'; } const t = T.t, n = T.now;
    if (n < t.fajr) return 'night'; if (n < t.sunrise) return 'dawn'; if (n < t.sunrise + 1) return 'sunrise'; if (n < t.dhuhr) return 'morning'; if (n < t.asr) return 'day'; if (n < t.maghrib - .7) return 'golden'; if (n < t.maghrib + .4) return 'sunset'; if (n < t.isha) return 'dusk'; return 'night'; };
  const sunXY = k => { try { const T = X.today(), t = T.t, n = T.now; if (/night|dusk/.test(k)) { const f = ((n - t.maghrib + 24) % 24) / ((t.fajr - t.maghrib + 24) % 24 || 10); return [330 - f * 260, 70 + Math.abs(f - .5) * 70]; }
    if (k === 'dawn') return [300, 196]; const f = Math.max(0, Math.min(1, (n - t.sunrise) / (t.maghrib - t.sunrise))); return [50 + f * 300, 205 - Math.sin(f * Math.PI) * 58]; } catch (e) { return [290, 110]; } };
  /* live Luton weather, refreshed every 20 minutes */
  const wxKind = c => c == null ? '' : c >= 95 ? 'storm' : (c >= 71 && c <= 77) || c === 85 || c === 86 ? 'snow' : (c >= 51 && c <= 67) || (c >= 80 && c <= 82) ? 'rain' : c === 45 || c === 48 ? 'fog' : c >= 2 ? 'cloud' : '';
  /* previews from the scene picker only last 10 minutes on this visit, then the real time and the real weather come back */
  const PV = { get(k, d) { return d; try { const o = JSON.parse(sessionStorage.getItem('ifm_pv_' + k) || 'null'); if (o && Date.now() - o.t < 6e5) return o.v; } catch (e) {} return d; }, set(k, v) { try { if (v == null) sessionStorage.removeItem('ifm_pv_' + k); else sessionStorage.setItem('ifm_pv_' + k, JSON.stringify({ v, t: Date.now() })); } catch (e) {} } };
  try { store.set('scPeriod', ''); store.set('scWxPv', null); sessionStorage.removeItem('ifm_pv_p'); sessionStorage.removeItem('ifm_pv_wx'); } catch (e) {}
  const WXT = c => c == null ? '' : c === 0 ? 'Clear' : c === 1 ? 'Mostly clear' : c === 2 ? 'Partly cloudy' : c === 3 ? 'Overcast' : c === 45 || c === 48 ? 'Fog' : c <= 57 ? 'Drizzle' : c <= 67 ? (c >= 65 ? 'Heavy rain' : 'Rain') : c <= 77 ? 'Snow' : c <= 82 ? (c === 82 ? 'Heavy showers' : 'Showers') : c <= 86 ? 'Snow showers' : 'Thunderstorm';
  let wxLive = store.get('scWx', null);
  const getWx = () => { if (wxLive && Date.now() - wxLive.t < 12e5) return; fetch('https://api.open-meteo.com/v1/forecast?latitude=51.88&longitude=-0.42&current=weather_code,cloud_cover,temperature_2m').then(r => r.json()).then(j => { wxLive = { t: Date.now(), k: wxKind(j.current.weather_code), c: j.current.weather_code, cc: j.current.cloud_cover, tp: Math.round(j.current.temperature_2m) }; store.set('scWx', wxLive); apply(true); }).catch(() => {}); };
  const weather = () => PV.get('wx', null) ?? (wxLive ? wxLive.k : '');
  /* ---------- flat drawing ---------- */
  const R = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  const arches = (x0, x1, y, h, w, gap, fill) => { let d = ''; for (let x = x0; x + w <= x1; x += w + gap) d += `M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}Z`; return `<path d="${d}" fill="${fill}"/>`; };
  const scallop = (x0, x1, y, w, fill) => { let d = `M${x0} ${y}`; for (let x = x0; x < x1; x += w) d += `q${w / 2} ${w * .6} ${w} 0`; return `<path d="${d}V${y + 30}H${x0}Z" fill="${fill}"/>`; };
  const minaret = (x, top, P, cap) => { const b = 262; return `<g>${R(x - 5, top + 40, 10, b - top - 40, P[3])}${R(x, top + 40, 5, b - top - 40, P[4])}${R(x - 8, top + 36, 16, 5, P[3])}${R(x - 8, top + 41, 16, 2, P[5])}
      ${R(x - 4, top + 14, 8, 22, P[3])}${R(x, top + 14, 4, 22, P[4])}${R(x - 2, top + 20, 1.6, 8, P[5])}${R(x + .6, top + 20, 1.6, 8, P[5])}${R(x - 6, top + 11, 12, 4, P[3])}
      ${cap === 'green' ? `<path d="M${x - 5} ${top + 11}q5-12 10 0z" fill="#5a7868"/>` : `<path d="M${x - 5} ${top + 11}q5-10 10 0z" fill="${P[4]}"/>`}<path d="M${x} ${top + 3}v-6" stroke="${P[4]}" stroke-width="1.4"/><circle cx="${x}" cy="${top - 4}" r="1.6" fill="${P[4]}"/>
      ${R(x - 1.5, top + 54, 3, 10, P[5])}${R(x - 1.5, top + 74, 3, 10, P[5])}</g>`; };
  const arcade = P => `${R(0, 222, 400, 42, P[3])}${R(0, 218, 400, 5, P[4])}${arches(4, 400, 228, 34, 18, 7, P[5])}${scallop(0, 400, 262, 12, P[6])}`;
  function kaaba(P, L) { const id = 'k' + Math.random().toString(36).slice(2, 7), night = L.night, dim = L.dim, sunL = L.sx < 186, k = L.k;
    /* a stone cube seen from the mataf: left face narrow, right face wide (turned about 30°), eye level near the middle */
    const C = { l: [[138, 160], [186, 148], [186, 265], [138, 259]], r: [[186, 148], [268, 163], [268, 258], [186, 265]] };
    const at = (f, u, v) => { const [a, b, c, d] = C[f]; const tx = a[0] + (b[0] - a[0]) * u, ty = a[1] + (b[1] - a[1]) * u, bx = d[0] + (c[0] - d[0]) * u, by = d[1] + (c[1] - d[1]) * u; return [tx + (bx - tx) * v, ty + (by - ty) * v]; };
    const p = (f, u, v) => at(f, u, v).map(n => n.toFixed(1)).join(' ');
    const q = (f, u0, u1, v0, v1) => `M${p(f, u0, v0)}L${p(f, u1, v0)}L${p(f, u1, v1)}L${p(f, u0, v1)}Z`;
    const g = (n, st) => `<linearGradient id="${id}${n}" x1="0" y1="0" x2="0" y2="1">${st.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
    const litF = sunL ? 'l' : 'r', shF = sunL ? 'r' : 'l', warm = /sunrise|golden|sunset/.test(k);
    /* sun height 0..1 for shadow length */
    const sh = night ? 0 : Math.max(0, Math.min(1, (232 - L.sy) / 130));
    let s = `<defs>${g('bL', night ? [[0, '#2c2b2f'], [1, '#18181a']] : [[0, '#37373b'], [1, '#1f1f21']])}${g('bS', night ? [[0, '#18181a'], [1, '#0c0c10']] : [[0, '#1d1d20'], [1, '#0e0e13']])}
      ${g('gL', dim ? [[0, '#bdae8d'], [1, '#715e42']] : [[0, '#ded7c1'], [.4, '#bba982'], [1, '#836d4b']])}${g('gS', night ? [[0, '#8d7c5d'], [1, '#4f412d']] : [[0, '#a79471'], [1, '#5a4a34']])}
      ${g('wL', night ? [[0, '#cbcace'], [1, '#99989e']] : [[0, '#ffffff'], [1, '#e2e0dd']])}${g('wS', night ? [[0, '#929197'], [1, '#6d6c72']] : [[0, '#d2d1ce'], [1, '#aaa9a6']])}
      ${g('sL', night ? [[0, '#6e6762'], [1, '#544e49']] : [[0, '#9c8a7b'], [1, '#806f62']])}${g('sS', night ? [[0, '#4d4844'], [1, '#3b3633']] : [[0, '#726358'], [1, '#5a4e45']])}
      ${g('fl', [[0, P[3]], [1, P[4]]])}</defs>`;
    /* floor the Kaaba stands on, then its cast shadow away from the sun */
    let floor = `<path d="M0 252H400V286H0Z" fill="url(#${id}fl)"/><path d="M0 252H400" stroke="${P[4]}" stroke-width=".8" opacity=".7"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<path d="M${i * 46 - 20} 286L${200 + (i * 46 - 220) * .55} 252" stroke="${P[4]}" stroke-width=".5" opacity=".5"/>`).join('')}`;
    if (L.snow) floor += `<path d="M0 252H400V286H0Z" fill="#fff" opacity=".55"/>`;
    if (L.wet) floor += `<path d="M0 252H400V286H0Z" fill="#fff" opacity=".07"/><path d="${q(litF, 0, 1, 0, 1)}" transform="translate(0 ${2 * 262}) scale(1 -1)" fill="#000" opacity=".1"/>`;
    const bl = at('l', 0, 1), bf = at('l', 1, 1), br = at('r', 1, 1);
    if (night || dim) floor += `<ellipse cx="203" cy="264" rx="${night ? 80 : 74}" ry="7" fill="#000" opacity="${night ? .28 : .16}"/>`;
    else { const len = 14 + (1 - sh) * 120, dx = (L.sx < 200 ? 1 : -1) * len, dy = 7 + (1 - sh) * 6;
      floor += `<path d="M${bl[0]} ${bl[1]}L${bf[0]} ${bf[1]}L${br[0]} ${br[1]}L${br[0] + dx} ${br[1] + dy}L${bf[0] + dx} ${bf[1] + dy}L${bl[0] + dx} ${bl[1] + dy}Z" fill="${P[6]}" opacity="${warm ? .42 : .3}"/>`; }
    /* stone walls (bricks) on both faces */
    for (const f of ['l', 'r']) { s += `<path d="${q(f, 0, 1, 0, 1)}" fill="url(#${id}${f === litF ? 'sL' : 'sS'})"/>`;
      const rows = 14, cols = f === 'l' ? 5 : 8; for (let r = 1; r < rows; r++) { const v = .55 + r * .45 / rows; s += `<path d="M${p(f, 0, v)}L${p(f, 1, v)}" stroke="#302a25" stroke-width=".45" opacity=".55"/>`; }
      for (let r = 0; r < rows; r++) for (let c = 1; c < cols * 2; c++) { if ((c + r) % 2) continue; const u = c / (cols * 2), v0 = .55 + r * .45 / rows, v1 = .55 + (r + 1) * .45 / rows; s += `<path d="M${p(f, u, v0)}L${p(f, u, v1)}" stroke="#302a25" stroke-width=".4" opacity=".45"/>`; } }
    /* the golden door, running down onto the stone below the cloth */
    const doorG = `url(#${id}${litF === 'r' ? 'gL' : 'gS'})`;
    /* the kiswah: black cloth with the gold band, raised and tied up with ropes, showing its white lining in curves */
    const T = { l: [0, .5, 1], r: [0, .36, .72, 1] }, TV = .58, MID = .7, WB = .9;
    for (const f of ['l', 'r']) { const lit = f === litF, t = T[f], gr = `url(#${id}${lit ? 'gL' : 'gS'})`;
      let blk = `M${p(f, 0, 0)}L${p(f, 1, 0)}L${p(f, 1, TV)}`; for (let i = t.length - 1; i > 0; i--) blk += `Q${p(f, (t[i] + t[i - 1]) / 2, MID + .08)} ${p(f, t[i - 1], TV)}`;
      s += `<path d="${blk}Z" fill="url(#${id}${lit ? 'bL' : 'bS'})"/>`;
      if (f === 'r') s += `<path d="${q('r', .1, .27, .42, .76)}" fill="${doorG}"/><path d="${q('r', .125, .245, .45, .76)}" fill="#584832" opacity=".28"/><path d="M${p('r', .185, .45)}L${p('r', .185, .76)}" stroke="#eae6d7" stroke-width=".5" opacity=".6"/>`;
      s += `<path d="${q(f, 0, 1, .2, .29)}" fill="${gr}"/><path d="M${p(f, 0, .203)}L${p(f, 1, .203)}" stroke="${lit && !dim ? '#eae7d9' : '#b7a888'}" stroke-width=".6" opacity="${lit && !dim ? .9 : .4}"/>`;
      const n = f === 'l' ? 3 : 5; for (let i = 0; i < n; i++) { const u0 = (i + .2) / n, u1 = (i + .72) / n; if (f === 'r' && u1 > .08 && u0 < .3) continue; s += `<path d="${q(f, u0, u1, .37, .42)}" fill="${gr}"/>`; const [mx, my] = at(f, (i + .86) / n, .395); if (i < n - 1) s += `<path d="M${mx.toFixed(1)} ${(my - 2.6).toFixed(1)}a1.5 1.5 0 0 1 1.5 1.5v2.4h-3v-2.4a1.5 1.5 0 0 1 1.5-1.5z" fill="${gr}"/>`; }
      /* white lining: crescents between the ropes, pointed where each rope pulls the cloth up */
      for (let i = 0; i < t.length - 1; i++) { const a = t[i], b = t[i + 1], m = (a + b) / 2;
        s += `<path d="M${p(f, a, TV)}Q${p(f, m, MID + .06)} ${p(f, b, TV)}Q${p(f, m, WB + .16)} ${p(f, a, TV)}Z" fill="url(#${id}${lit ? 'wL' : 'wS'})"/>`;
        s += `<path d="M${p(f, a + .07, .7)}Q${p(f, m, .86)} ${p(f, b - .07, .7)}M${p(f, a + .13, .76)}Q${p(f, m, .9)} ${p(f, b - .13, .76)}" stroke="${lit ? '#c3c1bd' : '#868583'}" stroke-width=".5" fill="none"/>`; }
      for (const u of t) if (u > 0 && u < 1) s += `<path d="M${p(f, u, 0)}L${p(f, u, TV)}" stroke="${night ? '#9e9ca3' : '#e9e9ec'}" stroke-width=".65"/><circle cx="${at(f, u, TV)[0].toFixed(1)}" cy="${at(f, u, TV)[1].toFixed(1)}" r=".9" fill="${night ? '#9e9ca3' : '#f2f2f2'}"/>`; }
    /* light: warm sun wash on the lit side, sky tint on the shaded side, rim light on the corner */
    s += `<path d="${q(litF, 0, 1, 0, 1)}" fill="${P[2]}" opacity="${dim ? .03 : night ? .05 : warm ? .2 : .1}"/><path d="${q(shF, 0, 1, 0, 1)}" fill="${P[0]}" opacity="${night ? .15 : .1}"/>`;
    if (!dim && !night) s += `<path d="M186 148V265" stroke="${P[2]}" stroke-width="1" opacity="${warm ? .7 : .4}"/>`;
    if (night && !dim) s += `<path d="${q('l', 0, 1, .18, .45)}" fill="#d6cbb3" opacity=".06"/><path d="${q('r', 0, 1, .18, .45)}" fill="#d6cbb3" opacity=".06"/>`;
    /* weather on the Kaaba itself */
    if (L.wet) s += `<g stroke="#fff" stroke-width=".55" opacity=".14">${[.1, .26, .44, .6, .78, .92].map(u => `<path d="M${p(litF, u, .02)}L${p(litF, u, .55)}"/>`).join('')}</g>`;
    if (L.snow) { s += `<path d="M136 160.5L186 148.5L270 163.5L270 160L186 144L136 157Z" fill="#fff"/>`;
      for (const f of ['l', 'r']) { s += `<path d="${q(f, 0, 1, .2, .214)}" fill="#fff" opacity=".85"/>`; for (let r = 2; r < 14; r += 3) s += `<path d="M${p(f, .05, .55 + r * .45 / 14)}L${p(f, .95, .55 + r * .45 / 14)}" stroke="#fff" stroke-width=".6" opacity=".5"/>`; } }
    return `${minaret(92, 132, P)}${minaret(312, 132, P)}${arcade(P)}${floor}${s}`; }
  function madinah(P) {
    return `${minaret(70, 140, P, 'green')}${minaret(150, 118, P, 'green')}${minaret(330, 140, P, 'green')}
      <path d="M232 222a14 12 0 0 1 28 0zM280 222a14 12 0 0 1 28 0zM96 222a14 12 0 0 1 28 0z" fill="${P[4]}"/>
      ${R(196, 196, 52, 26, P[3])}${R(222, 196, 26, 26, P[4])}${arches(201, 246, 202, 18, 8, 4, P[5])}
      <path d="M194 197c0-26 14-40 28-44c14 4 28 18 28 44z" fill="#5a7868"/><path d="M222 153c14 4 28 18 28 44h-28z" fill="#456152"/><path d="M222 153v-12" stroke="#a79570" stroke-width="2"/><circle cx="222" cy="139" r="2.4" fill="#a79570"/>
      ${arcade(P)}`; }
  function aqsa(P) { const tree = (x, s, c) => `<path transform="translate(${x} 284) scale(${s})" d="M-34 0v-22c-6-4-4-14 4-15c0-9 9-14 16-10c4-8 16-8 20 0c8-4 17 2 15 10c9 1 11 12 4 16v21z" fill="${c}"/>`;
    return `${tree(40, 1.2, P[7])}${tree(368, 1.3, P[7])}${R(0, 252, 400, 32, P[6])}
      <path d="M68 252a17 14 0 0 1 34 0z" fill="#95999e"/>${R(60, 252, 50, 32, P[4])}${arches(64, 108, 260, 24, 8, 4, P[5])}
      <path d="M126 284V226h148v58z" fill="#46566d"/><path d="M200 226h74v58h-74z" fill="#39465b"/>${R(122, 222, 156, 6, '#303a4b')}
      ${arches(134, 270, 240, 30, 12, 7, '#303a4b')}${[134, 153, 172, 191, 210, 229, 248].map(x => R(x + 3, 248, 6, 14, '#8294ab')).join('')}
      ${R(166, 206, 68, 16, '#46566d')}${R(200, 206, 34, 16, '#39465b')}${arches(170, 232, 208, 12, 6, 4, '#303a4b')}
      <path d="M164 207c0-24 16-38 36-40c20 2 36 16 36 40z" fill="#ae9972"/><path d="M200 167c20 2 36 16 36 40h-36z" fill="#95805d"/><path d="M200 167v-12" stroke="#95805d" stroke-width="2"/><circle cx="200" cy="153" r="2.4" fill="#ae9972"/>
      ${R(330, 232, 3, 52, P[7])}<path d="M333 233h24l-5 7l5 7h-24z" fill="#a09773"/>${tree(110, .7, P[7])}${tree(296, .75, P[7])}`; }
  const DRAW = { kaaba, madinah, aqsa };
  /* real moon phase (0 new, .5 full) */
  const moonPhase = () => { const d = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5; return ((d % 29.530588853) + 29.530588853) % 29.530588853 / 29.530588853; };
  /* the small things change every 20 minutes, so it never looks the same twice */
  const ambient = () => { const n = Math.floor(Date.now() / 12e5), r = i => ((n * 9301 + i * 49297) % 233280) / 233280; return { birds: r(1) < .7, nb: 2 + Math.floor(r(2) * 4), two: r(3) < .4, bd: 26 + Math.floor(r(4) * 16), cl: 1 + Math.floor(r(5) * 3), shoot: r(6) < .6, sd: 2 + Math.floor(r(7) * 20) }; };
  /* how heavy the rain or snow is: from the live weather code, or normal for a preview */
  const level = () => { if (PV.get('wx', null) != null) return 1; const c = wxLive && wxLive.c; return c == null ? 1 : c >= 51 && c <= 57 ? .35 : [61, 71, 77, 80, 85].includes(c) ? .55 : [63, 73, 81].includes(c) ? 1 : 1.7; };
  /* Ramadan lanterns and Eid, read from the Islamic date already on the card */
  const season = () => { const t = (document.getElementById('ahHij') || {}).textContent || '', m = t.match(/(\d+)\s+([A-Za-z' .-]+?)\s+\d{4}/); if (!m) return ''; const d = +m[1], mo = m[2].toLowerCase();
    if (/shaw/.test(mo) && d <= 3) return 'eid'; if (/hij/.test(mo) && d >= 9 && d <= 13) return d === 9 ? 'arafah' : 'eid'; if (/rama/.test(mo)) return 'ramadan'; return ''; };
  const lanterns = (P, night) => { let s = `<path d="M70 150Q200 186 330 150" fill="none" stroke="${night ? '#b0a993' : P[5]}" stroke-width=".8"/>`; for (let i = 1; i < 10; i++) { const t = i / 10, x = 70 + 260 * t, y = 150 + 36 * 2 * t * (1 - t) * .98; s += `<g class="sc-lan" style="--d:${(i % 4) * .4}s;transform-origin:${x}px ${y}px"><path d="M${x} ${y}v4" stroke="${P[5]}" stroke-width=".6"/><path d="M${x - 2.6} ${y + 5}h5.2l-.8 7h-3.6z" fill="${i % 2 ? '#b09873' : '#5a7868'}"/><circle cx="${x}" cy="${y + 8.5}" r="${night ? 5 : 2.5}" fill="#d6cbb3" opacity="${night ? .35 : .5}"/></g>`; } return s; };
  const svg = (lm, k, wx) => { const amb = ambient(), lv = /rain|storm|snow/.test(wx) ? level() : 1, sea = season(); const P = PAL[k], [sx, sy] = sunXY(k), night = /night|dusk/.test(k), dim = /cloud|rain|storm|snow|fog/.test(wx), id = 'f' + Math.random().toString(36).slice(2, 7);
    const cloud = (x, y, s, c, o) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><path d="M-40 10a14 14 0 0 1 10-20a18 18 0 0 1 32-6a14 14 0 0 1 24 6a12 12 0 0 1 14 20z" fill="${c}"/></g>`;
    const cc = wx === 'storm' ? '#727379' : /rain/.test(wx) ? (night ? '#494c59' : '#a0a3a7') : P[8];
    let s = `<svg class="sc-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient></defs>${R(0, 0, 400, 300, `url(#${id})`)}`;
    if (dim) s += R(0, 0, 400, 300, night ? 'rgba(26,28,34,.25)' : wx === 'storm' ? 'rgba(76,78,84,.45)' : 'rgba(146,150,154,.32)');
    if (night && wx !== 'fog' && !/rain|storm/.test(wx)) { s += `<g class="sc-st">${Array.from({ length: 70 }, (_, i) => `<circle cx="${(i * 97 + (i % 7) * 13) % 400}" cy="${(i * 53) % 200}" r="${i % 9 ? .7 : 1.4}" fill="#fff" opacity="${i % 3 ? .55 : .9}" style="--d:${((i * 37) % 50) / 10}s"/>`).join('')}</g>`;
      if (!dim) s += `${amb.shoot ? `<g class="sc-shoot" style="animation-delay:${amb.sd}s"><path d="M0 0l-34 12" stroke="url(#${id}ss)" stroke-width="1.4" stroke-linecap="round"/></g>` : ''}<defs><linearGradient id="${id}ss" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`; }
    if (night) { const mx = 335 + (sx - 200) * .12, my = 74, r = 15, ph = moonPhase(), f = (1 - Math.cos(ph * 2 * Math.PI)) / 2, wax = ph < .5, rx = (r * Math.abs(Math.cos(ph * 2 * Math.PI))).toFixed(2);
      const lit = `M${mx} ${my - r}A${r} ${r} 0 0 ${wax ? 1 : 0} ${mx} ${my + r}A${rx} ${r} 0 0 ${wax ? (f < .5 ? 0 : 1) : (f < .5 ? 1 : 0)} ${mx} ${my - r}Z`;
      s += `<g class="sc-moon" style="opacity:${dim ? .4 : 1}"><defs><clipPath id="${id}mc"><path d="${lit}"/></clipPath><radialGradient id="${id}mg"><stop offset="0" stop-color="#f4f2eb" stop-opacity="${(.12 + f * .3).toFixed(2)}"/><stop offset="1" stop-color="#f4f2eb" stop-opacity="0"/></radialGradient></defs><circle cx="${mx}" cy="${my}" r="${30 + f * 18}" fill="url(#${id}mg)"/><circle cx="${mx}" cy="${my}" r="${r}" fill="#ccccd2" opacity=".08"/>${f > .01 ? `<path d="${lit}" fill="#eceae2"/><g clip-path="url(#${id}mc)" fill="#d0cdc1"><circle cx="${mx - 5}" cy="${my - 4}" r="3"/><circle cx="${mx + 4}" cy="${my + 6}" r="2.2"/><circle cx="${mx + 7}" cy="${my - 6}" r="1.6"/><circle cx="${mx - 8}" cy="${my + 5}" r="1.4"/><circle cx="${mx + 1}" cy="${my - 9}" r="1.1"/></g>` : ''}</g>`; }
    else s += `<g class="sc-sun" style="opacity:${dim ? .35 : 1}"><circle cx="${sx}" cy="${sy}" r="46" fill="${P[2]}" opacity=".18"/><circle class="sc-pulse" cx="${sx}" cy="${sy}" r="34" fill="${P[2]}" opacity=".3"/><circle cx="${sx}" cy="${sy}" r="22" fill="${P[2]}"/></g>`;
    if (!night && !/rain|storm|snow|fog/.test(wx) && amb.birds) { const bc = /sunset|dusk|sunrise|dawn/.test(k) ? '#362f33' : P[6];
      const bird = (y, d, sc, dl) => `<g class="sc-bird" style="--y:${y}px;--dur:${d}s;--dl:${dl}s"><g transform="scale(${sc})"><path class="w" d="M-7 0q3.5-4 7 0q3.5-4 7 0" fill="none" stroke="${bc}" stroke-width="1.5" stroke-linecap="round"/></g></g>`;
      const fl = []; for (let i = 0; i < amb.nb; i++) fl.push(bird(150 + (i % 3) * 9, amb.bd, 1.5 - (i % 3) * .2, -i * 1.1)); if (amb.two) fl.push(bird(178, amb.bd + 12, 1.2, -18), bird(188, amb.bd + 12, 1, -19.4)); s += fl.join(''); }
    const nCl = wx === 'cloud' ? 3 : /rain|storm|snow/.test(wx) ? 4 : wx === 'fog' ? 0 : amb.cl;
    s += `<g class="sc-cl">${[[64, 74, 1], [352, 122, .75], [120, 150, .6], [300, 40, .7]].slice(0, nCl).map(([x, y, sc], i) => cloud(x, y, sc, cc, nCl > 1 ? .95 : .7)).join('')}</g>`;
    if (sea) s += lanterns(P, night);
    s += DRAW[lm](P, { sx, sy, k, night, dim, wet: /rain|storm/.test(wx), snow: wx === 'snow' });
    s += `<defs><linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[1]}" stop-opacity="0"/><stop offset=".45" stop-color="${P[1]}" stop-opacity=".22"/><stop offset="1" stop-color="${P[1]}" stop-opacity=".08"/></linearGradient><radialGradient id="${id}r" cx="${(sx / 400).toFixed(2)}" cy="${(sy / 300).toFixed(2)}" r=".6"><stop offset="0" stop-color="${P[2]}" stop-opacity="${dim ? .05 : .28}"/><stop offset="1" stop-color="${P[2]}" stop-opacity="0"/></radialGradient></defs>${R(0, 120, 400, 165, `url(#${id}t)`)}${R(0, 0, 400, 285, `url(#${id}r)`)}`;
    if (dim) s += R(0, 0, 400, 285, night ? 'rgba(16,18,24,.18)' : 'rgba(126,130,134,.18)');
    if (wx === 'snow') s += R(0, 279, 400, 6, 'rgba(255,255,255,.85)');
    s += R(0, 283, 400, 17, P[7]);
    if (/rain|storm/.test(wx)) s += `<g class="sc-rain" style="animation-duration:${lv < .4 ? 1.7 : lv < .8 ? 1.1 : lv < 1.3 ? .85 : .6}s" stroke="${night ? '#b1b7c6' : '#ffffff'}" stroke-width="${lv < .4 ? .8 : lv > 1.3 ? 1.5 : 1.2}" stroke-linecap="round" opacity="${(.4 + lv * .15).toFixed(2)}">${Array.from({ length: Math.round(60 * lv) }, (_, i) => `<path d="M${(i * 41) % 420 - 10} ${(i * 67) % 300 - 300}l${lv < .4 ? "-1.5 5" : lv > 1.3 ? "-6 18" : "-4 12"}"/><path d="M${(i * 41) % 420 - 10} ${(i * 67) % 300}l${lv < .4 ? "-1.5 5" : lv > 1.3 ? "-6 18" : "-4 12"}"/>`).join('')}</g>`;
    if (wx === 'storm') s += `<rect class="sc-flash" width="400" height="300" fill="#fff"/>`;
    if (wx === 'snow') s += `<g class="sc-snow" fill="#fff" opacity=".85">${Array.from({ length: Math.round(50 * lv) }, (_, i) => `<circle cx="${(i * 53) % 400}" cy="${(i * 71) % 300 - 300}" r="${1 + i % 3 * .6}"/><circle cx="${(i * 53 + 20) % 400}" cy="${(i * 71) % 300}" r="${1 + i % 3 * .6}"/>`).join('')}</g>`;
    if (wx === 'fog') { const fc = night ? '#787a88' : '#eef0ee';
      s += `<defs><filter id="${id}b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter><linearGradient id="${id}fo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fc}" stop-opacity=".25"/><stop offset=".55" stop-color="${fc}" stop-opacity=".5"/><stop offset="1" stop-color="${fc}" stop-opacity=".7"/></linearGradient></defs>
        ${R(0, 0, 400, 283, `url(#${id}fo)`)}
        <g filter="url(#${id}b)" fill="${fc}"><g class="sc-fog a" opacity=".75"><ellipse cx="80" cy="236" rx="140" ry="16"/><ellipse cx="330" cy="246" rx="150" ry="18"/></g>
        <g class="sc-fog b" opacity=".6"><ellipse cx="220" cy="200" rx="170" ry="14"/><ellipse cx="-20" cy="190" rx="90" ry="10"/><ellipse cx="420" cy="214" rx="100" ry="12"/></g>
        <g class="sc-fog c" opacity=".5"><ellipse cx="140" cy="160" rx="160" ry="12"/><ellipse cx="380" cy="150" rx="120" ry="10"/></g>
        <g class="sc-fog a" opacity=".85"><ellipse cx="200" cy="262" rx="260" ry="12"/></g></g>`; }
    return s + '</svg>'; };
  /* ---------- the card ---------- */
  let last = '';
  function apply(force) { const card = document.querySelector('#appHome .ah-pr'); if (!card) return;
    const k = PV.get('p', '') || period(), lm = store.get('scLm', 'kaaba'), wx = weather(), key = k + lm + wx;
    if (!force && card.classList.contains('sc-on') && key === last) return; last = key;
    const P = PAL[k]; card.classList.add('sc-on'); card.style.setProperty('--sc-strip', P[7]); card.style.setProperty('--sc-sky', P[0]);
    let w = card.querySelector('.sc-wrap'); if (!w) { w = document.createElement('div'); w.className = 'sc-wrap'; card.prepend(w); }
    const L = LM.find(x => x[0] === lm), W = WX.find(x => x[0] === wx);
    const sea = season(), live = PV.get('wx', null) == null && wxLive && wxLive.tp != null, wxc = live ? `<span class="sc-wx">${wxLive.tp}° ${WXT(wxLive.c)}</span>` : ''; w.innerHTML = svg(lm, k, wx) + wxc + (sea ? `<span class="sc-ev">${sea === 'eid' ? 'Eid Mubarak' : sea === 'arafah' ? 'Day of Arafah' : 'Ramadan Mubarak'}</span>` : '') + `<button type="button" class="sc-pick" aria-label="Change the scene">${L[2]}<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>`;
    w.querySelector('.sc-pick').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); chooser(); });
    /* the same scene at the top of the prayer times page */
    const bc = document.querySelector('[data-page=prayer] .bigclock'); if (bc) { let pg = bc.querySelector('.sc-pg'); if (!pg) { pg = document.createElement('div'); pg.className = 'sc-pg'; bc.prepend(pg); }
      const hij = (document.getElementById('ahHij') || {}).textContent || '';
      bc.classList.add('sc-has'); pg.style.setProperty('--sc-strip', P[7]); pg.innerHTML = svg(lm, k, wx) + `<div class="sc-pgt"><b>Currently ${P[9]}</b>${season() === 'eid' ? '<span>Eid Mubarak</span>' : season() === 'ramadan' ? '<span>Ramadan Mubarak</span>' : season() === 'arafah' ? '<span>Day of Arafah</span>' : ''}<small>Luton, United Kingdom${PV.get('wx', null) == null && wxLive && wxLive.tp != null ? ` · ${wxLive.tp}° ${WXT(wxLive.c)}` : wx ? ' · ' + W[1] : ''}</small></div><button type="button" class="sc-pick">${L[2]}<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>`;
      pg.querySelector('.sc-pick').onclick = chooser; } }
  function chooser() { const lm = store.get('scLm', 'kaaba'), k = period();
    X.modal(`<div class="sc-ch"><h3>Choose your view</h3><p>The sky follows the prayer times and the real weather in Luton.</p><div class="sc-opts">${LM.map(([id, n, c]) => `<button type="button" data-lm="${id}" aria-pressed="${id === lm}"><span>${svg(id, k, weather())}</span><em><b>${n}</b><small>${c}</small></em>${id === lm ? '<i>✓</i>' : ''}</button>`).join('')}</div></div>`);
    document.querySelectorAll('[data-lm]').forEach(b => b.onclick = () => { store.set('scLm', b.dataset.lm); apply(true); X.closeModal(); }); }
  new MutationObserver(() => { if (document.querySelector('#appHome .ah-pr') && !document.querySelector('#appHome .ah-pr.sc-on')) apply(true); }).observe(document.body, { childList: true, subtree: true });
  setInterval(() => { apply(true); getWx(); }, 120000); addEventListener('hashchange', () => { if (location.hash.startsWith('#prayer')) setTimeout(() => apply(true), 80); }); setTimeout(() => { apply(true); getWx(); }, 900);
  const css = document.createElement('style'); css.textContent = `
#appHome .ah-pr.sc-on{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;background:var(--sc-strip)!important;color:#fff;isolation:isolate;overflow:hidden;box-shadow:0 14px 30px -18px rgba(0,0,0,.55)}
#appHome .ah-pr.sc-on .ah-pr-top{display:contents}#appHome .ah-pr.sc-on .ah-pr-top>span:first-child{order:1;color:#fff;font-size:1.05rem}#appHome .ah-pr.sc-on .ah-pr-top i{background:rgba(255,255,255,.2);color:#fff}
#appHome .ah-pr.sc-on .ah-pr-t{order:2;font-size:2.1rem;line-height:1.1;color:#fff;margin:2px 0 0;text-shadow:0 1px 8px rgba(0,0,0,.18)}#appHome .ah-pr.sc-on .ah-pr-in{order:3;color:rgba(255,255,255,.92);font-size:.84rem;margin:0}
#appHome .ah-pr.sc-on .ah-loc{order:4;color:#fff!important;text-align:center;font-size:.78rem;margin:6px 0 136px;display:flex;align-items:center;gap:6px;opacity:.95}#appHome .ah-pr.sc-on .ah-loc small{color:rgba(255,255,255,.8)!important}
#appHome .ah-pr.sc-on .ah-five{order:5;align-self:stretch}#appHome .ah-pr.sc-on .ah-pr-all{order:6;align-self:stretch;color:#fff;border-top-color:rgba(255,255,255,.14)}
#appHome .ah-pr.sc-on .ah-five span{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.14)}#appHome .ah-pr.sc-on .ah-five span small{color:rgba(255,255,255,.72)}#appHome .ah-pr.sc-on .ah-five span.on{background:#fff;color:#111}#appHome .ah-pr.sc-on .ah-five span.on small{color:#555}
.ah-pr.sc-on .sc-wrap{position:absolute;left:0;right:0;top:0;height:300px;z-index:-1;overflow:hidden}.ah-pr.sc-on .sc-wrap>.sc-svg{position:absolute;inset:0;width:100%;height:100%}
.sc-pick{position:absolute;right:10px;top:10px;display:flex;align-items:center;gap:2px;border:0;background:rgba(0,0,0,.2);color:#fff;border-radius:999px;padding:4px 6px 4px 10px;font:inherit;font-size:.66rem;font-weight:600}.sc-pick svg{width:13px;height:13px}
.sc-cl{animation:scDrift 60s ease-in-out infinite alternate}@keyframes scDrift{to{transform:translateX(34px)}}
.sc-pulse{animation:scPulse 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes scPulse{50%{transform:scale(1.1);opacity:.18}}
.sc-st circle{animation:scTw 4s ease-in-out infinite;animation-delay:var(--d)}@keyframes scTw{50%{opacity:.25}}
.sc-rain{animation:scRain .9s linear infinite}@keyframes scRain{to{transform:translate(-30px,300px)}}.sc-snow{animation:scSnow 14s linear infinite}@keyframes scSnow{to{transform:translate(20px,300px)}}
.sc-fog{animation:scFog 26s ease-in-out infinite alternate}.sc-fog.b{animation-duration:34s;animation-direction:alternate-reverse}.sc-fog.c{animation-duration:44s}@keyframes scFog{to{transform:translateX(40px)}}.sc-flash{opacity:0;animation:scFlash 9s infinite}@keyframes scFlash{0%,92%,96%,100%{opacity:0}93%,95%{opacity:.35}}
.sc-ch h3{font-size:1.35rem;margin:0 0 4px}.sc-ch>p{color:var(--char);margin:0 0 12px;font-size:.86rem}.sc-opts{display:grid;gap:10px}.sc-opts button{position:relative;display:block;width:100%;height:132px;padding:0;border:3px solid transparent;border-radius:20px;overflow:hidden;background:#222;font:inherit;color:#fff;text-align:left;box-shadow:0 10px 22px -16px rgba(0,0,0,.6)}.sc-opts button[aria-pressed=true]{border-color:#a4a3a1}
.sc-opts span{position:absolute;inset:0}.sc-opts span .sc-svg{position:absolute;inset:0;width:100%;height:100%}.sc-opts em{position:absolute;left:0;right:0;bottom:0;padding:22px 14px 10px;font-style:normal;background:linear-gradient(transparent,rgba(0,0,0,.55));display:grid}.sc-opts b{font-family:var(--display);font-size:1.05rem}.sc-opts small{font-size:.76rem;opacity:.9}
.sc-opts i{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:50%;background:#a4a3a1;color:#161c12;display:grid;place-items:center;font-style:normal;font-weight:600;font-size:.85rem}
.sc-pv{margin-top:12px}.sc-pv b{font-size:.84rem}.sc-pv div{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.sc-pv button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:6px 10px;font:inherit;font-size:.74rem;font-weight:600}.sc-pv button[aria-pressed=true]{background:#a4a3a1;border-color:#a4a3a1;color:#161c12}
.sc-pg{position:relative;height:250px;border-radius:24px;overflow:hidden;margin:0 0 14px;background:var(--sc-strip);color:#fff}.sc-pg>.sc-svg{position:absolute;inset:0;width:100%;height:100%}.sc-pgt{position:absolute;left:0;right:0;top:16px;display:grid;justify-items:center;gap:2px;text-align:center;text-shadow:0 1px 8px rgba(0,0,0,.25)}.sc-pgt b{font-family:var(--display);font-size:1.35rem}.sc-pgt span{font-weight:600;font-size:.9rem}.sc-pgt small{font-size:.76rem;opacity:.9}.sc-pg .sc-pick{top:auto;bottom:12px}
.sc-bird{transform:translate(-30px,var(--y));animation:scBird var(--dur) linear infinite;animation-delay:var(--dl)}@keyframes scBird{0%{transform:translate(-30px,var(--y))}50%{transform:translate(200px,calc(var(--y) - 12px))}100%{transform:translate(430px,var(--y))}}.sc-bird .w{animation:scFlap .45s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}@keyframes scFlap{to{transform:scaleY(-.5)}}
.sc-shoot{opacity:0;animation:scShoot 22s linear infinite}@keyframes scShoot{0%{opacity:0;transform:translate(330px,20px)}2%{opacity:1}7%{opacity:0;transform:translate(220px,60px)}100%{opacity:0;transform:translate(220px,60px)}}
.sc-st circle{animation-duration:3.2s}
.sc-wx{position:absolute;left:10px;top:10px;border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.2);color:#fff;font-size:.66rem;font-weight:600}.sc-ev{position:absolute;left:10px;top:36px;border-radius:999px;padding:4px 10px;background:linear-gradient(135deg,#c0b18b,#a08862);color:#292217;font-size:.66rem;font-weight:600}.bigclock.sc-has>.clock,.bigclock.sc-has>.dates{display:none!important}.sc-lan{animation:scLan 4s ease-in-out infinite alternate;animation-delay:var(--d)}@keyframes scLan{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
@media (prefers-reduced-motion:reduce){.sc-lan,.sc-bird,.sc-bird .w,.sc-shoot,.sc-cl,.sc-pulse,.sc-st circle,.sc-rain,.sc-snow,.sc-fog,.sc-flash{animation:none}}`;
  document.head.appendChild(css);
})();
