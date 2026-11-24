/* Inspire FM — site behaviour. Plain JS, no framework, so it drops into WordPress as one enqueued script. */
(function () {
'use strict';
const D = window.IFM, M = window.IFM_MOSQUES || [];
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = (k, c = '') => `<svg class="ico ${c}" aria-hidden="true"><use href="#i-${k}"/></svg>`;
const pad = n => String(n).padStart(2, '0');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE_LOCAL = /^(acct|_ts|_sync|usedays|savePrompt|dgRemLast|tsx)/;
const store = { get(k, d) { try { const v = localStorage.getItem('ifm_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('ifm_' + k, JSON.stringify(v)); if (!STORE_LOCAL.test(k)) { const ts = JSON.parse(localStorage.getItem('ifm__ts') || '{}'); ts[k] = Date.now(); localStorage.setItem('ifm__ts', JSON.stringify(ts)); document.dispatchEvent(new CustomEvent('ifm:saved', { detail: k })); } } catch (e) {} } };
let toastT; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 3200); }
/* Share: the phone's own share sheet (iPhone / Android, also in the Home Screen app). Where the browser has none
   (most desktops, or a preview frame that blocks it) our own share pop-up opens instead with the usual places. */
const siteUrl = (h = '') => location.origin + location.pathname + (h ? '#' + h.replace(/^#/, '') : '');
async function share(d) { d = Object.assign({ title: 'Inspire FM 105.1' }, d);
  if (navigator.share) { try { await navigator.share(d.url ? d : { title: d.title, text: d.text }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  shareSheet(d); }
function shareSheet(d) { const msg = [d.text, d.url].filter(Boolean).join(' '), m = encodeURIComponent(msg), u = encodeURIComponent(d.url || siteUrl()), t = encodeURIComponent(d.text || d.title);
  const SV = { wa: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.5c0 3 2.5 6.5 6 6.5l1-1.6-1.8-.9-.8.8c-1-.4-2.1-1.5-2.5-2.5l.8-.8-.9-1.8z" fill="currentColor"/>',
    sms: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z" fill="currentColor"/>', x: '<path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" fill="currentColor"/>',
    tg: '<path d="M21 4L3 11l6 2 2 6 3-4 5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' };
  const O = [['WhatsApp', 'wa', '#5d9b74', `https://wa.me/?text=${m}`], ['Messages', 'sms', '#639870', `sms:?&body=${m}`], ['Email', 'mail', '#656b71', `mailto:?subject=${encodeURIComponent(d.title)}&body=${m}`],
    ['Facebook', 'fb', '#6080aa', `https://www.facebook.com/sharer/sharer.php?u=${u}`], ['X', 'x', '#111', `https://twitter.com/intent/tweet?text=${t}&url=${u}`], ['Telegram', 'tg', '#648fa5', `https://t.me/share/url?url=${u}&text=${t}`]];
  modal(`<div class="shs"><h3>Share</h3><p class="shs-p">${esc(d.text || d.title)}</p><div class="shs-g">${O.map(([n, k, c, h]) => `<a href="${h}" target="_blank" rel="noopener" data-shsgo><span style="background:${c}"><svg viewBox="0 0 24 24">${SV[k]}</svg></span>${n}</a>`).join('')}</div>
    <button type="button" class="shs-copy" data-shscopy><svg viewBox="0 0 24 24">${SV.link}</svg><span>${esc(d.url || siteUrl())}</span><b>Copy</b></button></div>`);
  $('#mBody [data-shscopy]').onclick = () => { copy(msg || d.url, 'Link copied'); closeModal(); };
  $$('#mBody [data-shsgo]').forEach(a => a.addEventListener('click', () => setTimeout(closeModal, 300))); }
async function copy(t, ok = 'Copied') { try { await navigator.clipboard.writeText(t); toast(ok); } catch (e) { modal(`<h3 style="font-size:1.4rem;margin-bottom:10px">Copy this</h3><textarea style="width:100%;min-height:180px;border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--paper)">${esc(t)}</textarea>`); } }
let mY = 0; function modal(html) { mY = scrollY; $('#mBody').innerHTML = html; $('#modal').classList.add('on'); document.body.classList.add('lock'); setTimeout(() => { const f = $('#mBody input,#mBody button,#mBody a'); f && f.focus(); }, 60); }
function closeModal() { $('#modal').classList.remove('on'); document.body.classList.remove('lock'); if (Math.abs(scrollY - mY) > 2) window.scrollTo({ top: mY, behavior: 'instant' }); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('.mx')) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenus(); } });

/* ---------- time in Luton (Europe/London), whatever the viewer's clock zone ---------- */
const fmtParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short', hourCycle: 'h23' });
const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function lon(date = new Date()) { const p = {}; fmtParts.formatToParts(date).forEach(x => p[x.type] = x.value); return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second, dow: WD[p.weekday] }; }
function tzOff(y, m, d) { const t = new Date(Date.UTC(y, m - 1, d, 12)); const l = lon(t); return (Date.UTC(l.y, l.m - 1, l.d, l.h, l.mi) - t.getTime()) / 36e5; }
const hm = h => { if (h == null || isNaN(h)) return '--:--'; h = (h + 24) % 24; let H = Math.floor(h), Mi = Math.round((h - H) * 60); if (Mi === 60) { H = (H + 1) % 24; Mi = 0; } return pad(H) + ':' + pad(Mi); };
const toH = s => { const [a, b] = s.split(':').map(Number); return a + b / 60; };
const h12 = s => { const [a, b] = s.split(':').map(Number); return ((a + 11) % 12 + 1) + (b ? ':' + pad(b) : '') + (a >= 12 ? 'pm' : 'am'); };
const hijri = date => { try { return new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' }).format(date).replace(/ AH$/, ' AH'); } catch (e) { return ''; } };
const greg = date => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' }).format(date);

/* ---------- prayer times: astronomical calculation for Luton (PrayTimes method, 18°/18°, angle-based high-latitude rule) ---------- */
const LAT = 51.8787, LNG = -0.4200;
const dtr = d => d * Math.PI / 180, rtd = r => r * 180 / Math.PI;
const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
function sunPos(jd) { const D_ = jd - 2451545, g = fix(357.529 + .98560028 * D_, 360), q = fix(280.459 + .98564736 * D_, 360), L = fix(q + 1.915 * Math.sin(dtr(g)) + .02 * Math.sin(dtr(2 * g)), 360), e = 23.439 - .00000036 * D_; const RA = rtd(Math.atan2(Math.cos(dtr(e)) * Math.sin(dtr(L)), Math.cos(dtr(L)))) / 15; return { decl: rtd(Math.asin(Math.sin(dtr(e)) * Math.sin(dtr(L)))), eqt: q / 15 - fix(RA, 24) }; }
function julian(y, m, d) { if (m <= 2) { y -= 1; m += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
function prayerTimes(y, m, d, asrF = 1) {
  const jd = julian(y, m, d) - LNG / (15 * 24);
  const mid = t => fix(12 - sunPos(jd + t).eqt, 24);
  const ang = (a, t, ccw) => { const p = sunPos(jd + t), n = mid(t); const T = rtd(Math.acos((-Math.sin(dtr(a)) - Math.sin(dtr(p.decl)) * Math.sin(dtr(LAT))) / (Math.cos(dtr(p.decl)) * Math.cos(dtr(LAT))))) / 15; return n + (ccw ? -T : T); };
  const asr = (f, t) => { const p = sunPos(jd + t); const a = -rtd(Math.atan(1 / (f + Math.tan(dtr(Math.abs(LAT - p.decl)))))); return ang(a, t); };
  let t = { fajr: 5 / 24, sunrise: 6 / 24, dhuhr: 12 / 24, asr: 13 / 24, maghrib: 18 / 24, isha: 18 / 24 };
  for (let i = 0; i < 2; i++) t = { fajr: ang(18, t.fajr * 24 / 24, true) / 24, sunrise: ang(.833, t.sunrise, true) / 24, dhuhr: mid(t.dhuhr) / 24, asr: asr(asrF, t.asr) / 24, maghrib: ang(.833, t.maghrib) / 24, isha: ang(18, t.isha) / 24 };
  const tz = tzOff(y, m, d), o = {}; for (const k in t) o[k] = t[k] * 24 + tz - LNG / 15;
  const night = fix(o.sunrise - o.maghrib, 24), port = 18 / 60 * night;
  if (isNaN(o.fajr) || fix(o.sunrise - o.fajr, 24) > port) o.fajr = o.sunrise - port;
  if (isNaN(o.isha) || fix(o.isha - o.maghrib, 24) > port) o.isha = o.maghrib + port;
  o.dhuhr += 1 / 60;
  return o;
}
const PR = [['fajr', 'Fajr', 'Suhur ends'], ['sunrise', 'Sunrise', 'Fajr ends'], ['dhuhr', 'Zuhr', ''], ['asr', 'Asr', ''], ['maghrib', 'Maghrib', 'Iftar'], ['isha', 'Isha', '']];
let asrF = store.get('asr', 1);
function today() { const l = lon(); const t = prayerTimes(l.y, l.m, l.d, asrF); const now = l.h + l.mi / 60 + l.s / 3600; let nx = PR.find(p => p[0] !== 'sunrise' && t[p[0]] > now); let tomorrow = false; if (!nx) { nx = PR[0]; tomorrow = true; } const tgt = tomorrow ? (() => { const dt = new Date(Date.now() + 864e5), L2 = lon(dt); return prayerTimes(L2.y, L2.m, L2.d, asrF).fajr + 24; })() : t[nx[0]]; return { l, t, now, nx, left: tgt - now }; }
const dur = h => { const s = Math.max(0, Math.round(h * 3600)); const H = Math.floor(s / 3600), Mi = Math.floor(s % 3600 / 60), S = s % 60; return H ? `${H}h ${pad(Mi)}m` : `${Mi}m ${pad(S)}s`; };

/* ---------- schedule ---------- */
function showAt(date = new Date()) {
  const l = lon(date), h = l.h + l.mi / 60;
  const prev = D.week[(l.dow + 6) % 7].find(s => s[1] > 24 && h < s[1] - 24);
  if (prev) return { s: prev, start: prev[0] - 24, end: prev[1] - 24, dow: l.dow, h };
  const s = D.week[l.dow].find(x => h >= x[0] && h < x[1]) || D.week[l.dow][0];
  return { s, start: s[0], end: s[1], dow: l.dow, h };
}
function upNext(n = 3) { const out = []; let t = Date.now(); const cur = showAt(); let mark = cur.s; for (let i = 0; i < 48 && out.length < n; i++) { t += 30 * 60e3; const x = showAt(new Date(t)); if (x.s !== mark) { out.push(x); mark = x.s; } } return out; }
const H = h => { h = ((h % 24) + 24) % 24; return pad(Math.floor(h)) + ':' + pad(Math.round((h % 1) * 60)); };
const grad = s => `${s.img ? `url(${s.img}) center/cover no-repeat,` : ''}linear-gradient(135deg,${s.g[0]},${s.g[1]})`;
const who = s => s.p && s.p.length ? s.p.join(' & ') : '';
const hostOf = p => { const s = D.shows[p.s]; return p.h || (s.p || []).join(' & '); };
const guestsOf = p => (p.gu || []).join(', ');
const epWho = p => { const h = hostOf(p), g = guestsOf(p); return [h ? 'Host: ' + h : '', g ? 'Guest' + ((p.gu || []).length > 1 ? 's' : '') + ': ' + g : ''].filter(Boolean).join(' · '); };
const epS = p => p.img ? Object.assign({}, D.shows[p.s], { img: p.img }) : D.shows[p.s];
const artBg = (s, shade) => s.img ? `;background:${shade ? 'linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(0,0,0,.62)),' : ''}${grad(s)}` : '';

/* ---------- intro: beacon switches on and broadcasts, then pulls the wordmark out; the lockup flies into the header. Once per visit. ---------- */
(function () {
  const el = $('#intro'); let seen = false; try { seen = sessionStorage.getItem('ifmIntro'); } catch (e) {}
  if (seen || reduce || (location.hash.slice(1) && location.hash !== '#home')) { el.remove(); return; }
  document.body.classList.add('lock'); let ended = false;
  const end = () => { if (ended) return; ended = true; el.classList.add('done'); document.body.classList.remove('lock'); try { sessionStorage.setItem('ifmIntro', 1); } catch (e) {} setTimeout(() => el.remove(), 900); };
  const fly = () => {
    if (ended) return; const lk = $('#ilk'), tgt = $$('.brand img').find(i => i.offsetWidth) ;
    if (!tgt) return end(); const a = lk.getBoundingClientRect(), b = tgt.getBoundingClientRect();
    lk.style.animation = 'none'; lk.style.transform = 'none'; const a2 = lk.getBoundingClientRect();
    const sc = b.height / a2.height; lk.style.transition = 'transform .75s cubic-bezier(.7,0,.2,1), opacity .4s .45s';
    lk.style.transform = `translate(${b.left - a2.left}px,${b.top - a2.top}px) scale(${sc})`; lk.style.opacity = '0';
    el.classList.add('fly'); tgt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 450, fill: 'backwards' }); setTimeout(end, 650);
  };
  el.onclick = end; setTimeout(end, 2300);
})();

/* ---------- header, menus, drawer, progress, to-top ---------- */
const hdr = $('#hdr');
function closeMenus() { $$('.dd.open').forEach(d => { d.classList.remove('open'); $('button', d).setAttribute('aria-expanded', 'false'); }); }
$$('.nav .dd>button').forEach(b => b.addEventListener('click', e => { const d = b.parentElement, o = d.classList.contains('open'); closeMenus(); if (!o) { d.classList.add('open'); b.setAttribute('aria-expanded', 'true'); } e.stopPropagation(); }));
$$('.nav .dd').forEach(d => { d.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { closeMenus(); d.classList.add('open'); } }); d.addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) d.classList.remove('open'); }); });
document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeMenus(); });
const burger = $('.burger');
function setMenu(o) { document.documentElement.classList.toggle('menu-open', o); document.body.classList.toggle('lock', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }
burger.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('menu-open')));
addEventListener('scroll', () => { const y = scrollY, h = document.documentElement.scrollHeight - innerHeight; $('#progress').style.width = (h > 0 ? y / h * 100 : 0) + '%'; hdr.classList.toggle('sc', y > 10); $('#toTop').classList.toggle('on', y > 900); }, { passive: true });
$('#toTop').onclick = () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

/* ---------- pages (hash routes) ---------- */
const PAGES = $$('.page').map(p => p.dataset.page).concat(['adhan']);
const KEEP = { toolbox: ['prayer', 'duas', 'quran', 'jummah'], listen: ['prayer', 'watch', 'jummah', 'give'], watch: ['listen', 'community', 'eid', 'duas'], prayer: ['toolbox', 'jummah', 'duas', 'quran'], jummah: ['prayer', 'give', 'duas', 'help'], duas: ['quran', 'prayer', 'seasons', 'help'], quran: ['duas', 'prayer', 'seasons', 'listen'], seasons: ['prayer', 'give', 'community', 'duas'], community: ['eid', 'news', 'involved', 'help'], news: ['community', 'listen', 'watch', 'eid'], help: ['give', 'jummah', 'contact', 'community'], involved: ['eid', 'about', 'give', 'contact'], eid: ['give', 'involved', 'community', 'advertise'], give: ['jummah', 'help', 'eid', 'involved'], advertise: ['about', 'eid', 'listen', 'contact'], about: ['involved', 'listen', 'give', 'contact'], contact: ['about', 'involved', 'advertise', 'help'], privacy: ['contact', 'about', 'listen', 'give'] };
const PNAME = { toolbox: ['Islamic Toolbox', 'Tracker, tasbih, qibla', 'star'], listen: ['Listen live', 'On air, schedule & shows', 'waves'], watch: ['Watch', 'Reels & videos', 'video'], prayer: ['Prayer times', 'Today in Luton', 'clock'], jummah: ['Jummah finder', 'Nearest first', 'mosque'], duas: ['Duas', 'For every moment', 'hands'], quran: ['Quran', 'Read & listen', 'book'], seasons: ['Seasonal hubs', 'Ramadan & more', 'moon'], community: ['Events', 'What\'s on in Luton', 'calendar'], news: ['Latest news', 'From the newsroom', 'book'], help: ['Find help', 'Support near you', 'help'], involved: ['Get involved', 'Volunteer with us', 'users'], eid: ['Inspire Eid', 'Book a stall', 'star'], give: ['Give', 'Appeals & zakat', 'heart'], advertise: ['Advertise', 'Packages & booking', 'mega'], about: ['About us', 'Since 1997', 'waves'], contact: ['Contact', 'Talk to us', 'chat'] };
const inited = {};
let pendingTab = null, pendingGoto = null, pendingOffer = null;
document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; if (a.dataset.tab) pendingTab = a.dataset.tab; if (a.dataset.goto) pendingGoto = a.dataset.goto; if (a.dataset.offer) pendingOffer = a.dataset.offer; setMenu(false); closeMenus(); if (a.getAttribute('href') === location.hash) { e.preventDefault(); route(); } });
try { history.scrollRestoration = 'manual'; } catch (e) {}
/* every page and screen opens at the top, even if it was left half-way down last time */
function toTop(el) {
  const go = () => { if (el) el.scrollTop = 0; else { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } };
  go(); requestAnimationFrame(go); setTimeout(go, 120); setTimeout(go, 400);
}
/* back/forward returns to exactly where you were: each history entry gets a number, and its scroll position is kept */
const SPOS = {}; let curN = 0, nSeq = 0, backNav = false;
try { const s = JSON.parse(sessionStorage.getItem('ifmPos') || '{}'); Object.assign(SPOS, s.p || {}); nSeq = s.n || 0; } catch (e) {}
const saveSpos = () => { try { sessionStorage.setItem('ifmPos', JSON.stringify({ p: SPOS, n: nSeq })); } catch (e) {} };
let firstN = 0; const canBack = () => !!(history.state && history.state.n && firstN && history.state.n > firstN); window.IFM_canBack = canBack;
const saveNow = () => { if (curN && !document.documentElement.classList.contains('lf-open') && !document.body.classList.contains('lock')) { SPOS[curN] = scrollY; saveSpos(); } };
document.addEventListener('pointerdown', saveNow, true); document.addEventListener('click', saveNow, true);
let spT; addEventListener('scroll', () => { if (!curN || document.documentElement.classList.contains('lf-open') || document.body.classList.contains('lock')) return; clearTimeout(spT); spT = setTimeout(() => { SPOS[curN] = scrollY; saveSpos(); }, 120); }, { passive: true });
function restoreTo(y) { const go = () => window.scrollTo({ top: y, left: 0, behavior: 'instant' }); go(); requestAnimationFrame(go); setTimeout(go, 120); setTimeout(go, 400); setTimeout(go, 900); }
function route() {
  if (curN && !document.documentElement.classList.contains('lf-open')) SPOS[curN] = SPOS[curN] ?? scrollY;
  const st = history.state || {};
  if (st.n) { backNav = true; curN = st.n; } else { backNav = false; curN = ++nSeq; try { history.replaceState({ ...st, n: curN }, ''); } catch (e) {} delete SPOS[curN]; }
  if (!firstN) firstN = curN;
  saveSpos(); if ($('#modal').classList.contains('on')) { $('#modal').classList.remove('on'); document.body.classList.remove('lock'); }
  let id = location.hash.slice(1) || 'home';
  if (/^tb-/.test(id) && TOOLS[id.slice(3)]) { const t = id.slice(3), here = ($('.page:not([hidden])') || { dataset: {} }).dataset.page; if (here && here !== 'toolbox' && inited[here]) { openTool(t); toTop($('#scrBody')); syncTabs(here); return; } id = 'toolbox'; if (!$('[data-page=toolbox]').hidden && inited.toolbox) { openTool(t); toTop($('#scrBody')); syncTabs(id); return; } setTimeout(() => openTool(t), 30); } else closeTool();
  if (!PAGES.includes(id)) id = 'home';
  $$('.page').forEach(p => p.hidden = p.dataset.page !== id);
  $$('.nav>a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
  const keep = $('.keep'); keep.hidden = id === 'home' || id === 'winter';
  if (KEEP[id]) $('#keepGrid').innerHTML = KEEP[id].map(k => `<a class="tool" href="#${k}" style="min-height:0;padding:18px"><i style="width:42px;height:42px;margin-bottom:10px">${I(PNAME[k][2])}</i><h3 style="font-size:1.1rem">${PNAME[k][0]}</h3><p style="margin-top:4px;font-size:.84rem">${PNAME[k][1]}</p></a>`).join('');
  if (id === 'adhan') { location.replace('#prayer'); setTimeout(() => showAdhan(today().nx, true), 300); return; }
  if (!inited[id] && INIT[id]) { inited[id] = 1; try { INIT[id](); } catch (err) { console.error(err); } }
  if (id === 'listen' && pendingTab) setTab(pendingTab);
  if (id === 'toolbox' && inited.toolbox) { renderTrack(); tsRender(); }
  pendingTab = null;
  document.title = id === 'home' ? 'Inspire FM 105.1 · Radio, Faith & Community · Luton' : (PNAME[id] ? PNAME[id][0] : id[0].toUpperCase() + id.slice(1)) + ' · Inspire FM 105.1';
  if (backNav && SPOS[curN] != null) restoreTo(SPOS[curN]); else if (pendingGoto && $('#' + pendingGoto)) { const g = pendingGoto; setTimeout(() => $('#' + g).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 60); } else toTop();
  if (pendingOffer && id === 'eid') { const o = pendingOffer; setTimeout(() => { const b = $(`#eidOffers [data-o="${o}"]`); b && b.click(); }, 80); }
  pendingGoto = null; pendingOffer = null;
  syncTabs(id); chrome(id); observeReveal();
}
addEventListener('hashchange', route);
const TABS = { contact: 'local', about: 'local', advertise: 'local', privacy: 'local', activities: 'local', iam: 'local', updates: 'local', winter: 'local', events: 'local', deals: 'local', volunteer: 'local', foodbank: 'local', home: 'home', listen: 'listen', watch: 'watch', local: 'local', help: 'local', community: 'local', news: 'local', give: 'local', involved: 'local', eid: 'local', prayer: 'prayer', adhan: 'prayer', toolbox: 'toolbox', duas: 'toolbox', quran: 'toolbox', seasons: 'toolbox', jummah: 'toolbox' };
let lastDepth = 0;
function syncTabs(id) { const t = TABS[id] || 'more'; const tb = $('#tabbar'); if (!tb) return; let on; $$('#tabbar [data-t]').forEach(x => { const m = x.dataset.t === t; x.classList.toggle('on', m); if (m) on = x; x.toggleAttribute('aria-current', m); }); const ind = $('.tab-ind', tb); if (on) { const r = on.getBoundingClientRect(), p = tb.getBoundingClientRect(); ind.style.opacity = 1; ind.style.transform = `translateX(${on.offsetLeft - 4}px)`; } else ind.style.opacity = 0;
  const depth = id === 'home' ? 0 : 1; const pg = $(`.page[data-page="${id}"]`); if (pg) { pg.classList.toggle('back-anim', depth < lastDepth); } lastDepth = depth; }
$('#tabMore').onclick = () => { const o = !document.documentElement.classList.contains('menu-open'); setMenu(o); $('#tabMore').classList.toggle('on', o); if (navigator.vibrate) navigator.vibrate(8); };
$$('#tabbar a').forEach(a_ => a_.addEventListener('click', () => { if (navigator.vibrate) navigator.vibrate(8); }));
addEventListener('resize', () => syncTabs(location.hash.slice(1) || 'home'));

/* ---------- reveal & count-up ---------- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 }) : null;
const cio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const el = en.target, to = +el.dataset.count; cio.unobserve(el); if (reduce || to === 1997) return; const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString('en-GB'); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }), { threshold: .5 }) : null;
function observeReveal() { $$('.reveal:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in')); $$('[data-count]:not([data-c])').forEach(el => { el.dataset.c = 1; cio && cio.observe(el); }); }

/* ---------- rails: drag to scroll, arrow buttons ---------- */
function rail(el) {
  if (!el || el.dataset.r) return; el.dataset.r = 1; let x0, s0, down = false, moved = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; el.classList.add('drag'); } el.scrollLeft = s0 - dx; });
  addEventListener('pointerup', () => { down = false; el.classList.remove('drag'); });
  el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}
$$('.railnav').forEach(n => n.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const r = $('#' + n.dataset.for); r.scrollBy({ left: +b.dataset.d * r.clientWidth * .8, behavior: 'smooth' }); }));

/* ================= PLAYER ================= */
const audio = $('#audio'); let playing = false, loading = false, sleepT = null;
audio.volume = store.get('vol', .9); $('#vol').value = audio.volume;
function setPlayUI() {
  const on = playing || demoOnAir; const ic = loading ? 'load' : on ? 'pause' : 'play';
  $$('[data-play]').forEach(b => { const u = $('use', b); if (u) u.setAttribute('href', '#i-' + ic); const t = $('.t', b); if (t) t.textContent = playing ? 'Pause' : 'Listen live'; b.setAttribute('aria-label', on ? 'Pause Inspire FM' : 'Play Inspire FM live'); });
  { const mt = $('#tabbar .mid'); if (mt) mt.setAttribute('aria-label', on ? 'Now playing: open the player' : 'Listen live'); }
  $('#plBtn use').setAttribute('href', '#i-' + ic); $('#plBtn').setAttribute('aria-label', on ? 'Pause' : 'Play');
  $('#player').classList.toggle('loading', loading); document.body.classList.toggle('playing', on);
  if ($('#npPlay')) { $('#npPlay use').setAttribute('href', '#i-' + ic); $('#np').classList.toggle('playing', on); }
  if ($('.lv-pl use')) $('.lv-pl use').setAttribute('href', '#i-' + (on && npMode === 'live' ? 'pause' : 'play')); $('#oaArt') && $('#oaArt').parentElement.classList.toggle('playing', playing);
  $('#plArt').parentElement.parentElement.classList.toggle('playing', playing);
  const ch = $('#npChip'); if (ch) { const ep = npMode === 'ep'; $('#npcK').textContent = ep ? 'CATCH-UP' : 'LIVE · 105.1'; $('#npcT').textContent = ep ? D.pods[npEp].t : D.shows[showAt().s[2]].n; }
}
function note(html, ms = 9000) { const n = $('#plNote'); n.innerHTML = html; n.classList.add('on'); clearTimeout(n._t); if (ms) n._t = setTimeout(() => n.classList.remove('on'), ms); }
async function play() {
  if (playing) { audio.pause(); audio.removeAttribute('src'); audio.load(); playing = false; setPlayUI(); return; }
  loading = true; setPlayUI();
  audio.src = D.stream + '?t=' + Date.now();
  try { await audio.play(); playing = true; loading = false; setPlayUI(); mediaSession(); }
  catch (e) { loading = false; playing = false; setPlayUI(); note(`The live stream couldn't start here. On inspirefm.org it plays straight from this button. <a href="${D.stream}" target="_blank" rel="noopener">Open the stream ↗</a> or call the studio on 01582 481822.`, 14000); }
}
audio.addEventListener('error', () => { if (!audio.getAttribute('src')) return; loading = false; playing = false; setPlayUI(); note(`The live stream couldn't start here. On inspirefm.org it plays straight from this button. <a href="${D.stream}" target="_blank" rel="noopener">Open the stream ↗</a>`, 14000); });
audio.addEventListener('waiting', () => { if (playing) { loading = true; setPlayUI(); } });
audio.addEventListener('playing', () => { loading = false; playing = true; setPlayUI(); });
document.addEventListener('click', e => { if (e.target.closest('[data-play],#slots .slot.now')) { if (matchMedia('(max-width:760px)').matches) openNP('live', true); else npToggle('live'); } });
$('#plBtn').onclick = e => { e.stopPropagation(); npToggle(npMode); };
$('#player .wrap').addEventListener('click', e => { if (e.target.closest('button,a,input')) return; openNP(npMode); });
$('#vol').oninput = e => { audio.volume = +e.target.value; audio.muted = false; store.set('vol', audio.volume); $('#muteBtn use').setAttribute('href', audio.volume ? '#i-vol' : '#i-mute'); };
$('#muteBtn').onclick = () => { audio.muted = !audio.muted; $('#muteBtn use').setAttribute('href', audio.muted ? '#i-mute' : '#i-vol'); };
$('#sleepBtn').onclick = e => { e.stopPropagation(); $('#sleepM').classList.toggle('on'); };
$('#sleepM').onclick = e => { const b = e.target.closest('button'); if (!b) return; clearTimeout(sleepT); const m = +b.dataset.m; $('#sleepBtn').classList.toggle('on', !!m); $('#sleepM').classList.remove('on'); if (m) { sleepT = setTimeout(() => { if (playing) play(); toast('Sleep timer: Inspire FM stopped. Goodnight!'); $('#sleepBtn').classList.remove('on'); }, m * 60e3); toast(`Inspire FM will stop in ${m} minutes`); } else toast('Sleep timer off'); };
document.addEventListener('click', e => { if (!e.target.closest('#sleepM,#sleepBtn')) $('#sleepM').classList.remove('on'); });
function mediaSession() { if (!('mediaSession' in navigator)) return; const c = showAt(), s = D.shows[c.s[2]]; try { navigator.mediaSession.metadata = new MediaMetadata({ title: s.n, artist: 'Inspire FM 105.1', album: 'Live from Luton' }); navigator.mediaSession.setActionHandler('pause', play); navigator.mediaSession.setActionHandler('play', play); } catch (e) {} }

function onAir() {
  const c = showAt(), s = D.shows[c.s[2]], nx = upNext(3);
  if (npMode !== 'ep') { $('#plShow').textContent = s.n; $('#plArt').style.setProperty('--art', grad(s)); } if (npMode !== 'ep') $('#plNext').textContent = nx[0] ? `Up next ${H(nx[0].start)} · ${D.shows[nx[0].s[2]].n}` : '';
  $('#plArt').style.setProperty('--art', grad(s));
  if ($('#oaShow')) {
    $('#oaShow').textContent = s.n; $('#oaDesc').textContent = s.d; $('#oaArt').style.setProperty('--art', grad(s));
    const len = c.end - c.start, done = (c.h - c.start + 24) % 24; $('#oaProg').style.width = Math.min(100, done / len * 100) + '%';
    $('#oaStart').textContent = H(c.start); $('#oaEnd').textContent = H(c.end); $('#oaLeft').textContent = Math.max(1, Math.round((len - done) * 60)) + ' min left';
    $('#oaNext').innerHTML = nx.map((x, i) => `<div><b>${H(x.start)}</b><span>${i ? '' : 'Up next · '}${esc(D.shows[x.s[2]].n)}</span></div>`).join('');
  }
}

/* ================= HOME ================= */
function heroCanvas() {
  const cv = $('#heroCanvas'); if (!cv) return; const cx = cv.getContext('2d'); let w, h, dpr, t0 = performance.now();
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const draw = t => {
    const k = (t - t0) / 1000; cx.clearRect(0, 0, w, h);
    const ox = w > 900 ? w * .72 : w * .85, oy = h * .48;
    const g = cx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(w, h) * .7); g.addColorStop(0, 'rgba(164,163,161,.20)'); g.addColorStop(1, 'rgba(164,163,161,0)'); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const r = ((k * 60 + i * 110) % 990) + 30, a = Math.max(0, 1 - r / 990) * (playing ? .5 : .28); cx.beginPath(); cx.arc(ox, oy, r, Math.PI * .62, Math.PI * 1.38); cx.strokeStyle = `rgba(164,163,161,${a})`; cx.lineWidth = 10 - r / 140; cx.lineCap = 'round'; cx.stroke(); }
    cx.beginPath(); cx.arc(ox + 18, oy, 7 + Math.sin(k * 3) * 1.5, 0, 7); cx.fillStyle = 'rgba(164,163,161,.6)'; cx.fill();
    if (!reduce && !document.hidden && !$('[data-page=home]').hidden) requestAnimationFrame(draw); else setTimeout(() => requestAnimationFrame(draw), 600);
  };
  requestAnimationFrame(draw);
}
function rotWord() { const words = ['the community', 'Luton\'s families', 'young people', 'every masjid', 'the whole town'], el = $('#rotWord'); let i = 0; if (reduce) return; setInterval(() => { el.classList.add('out'); setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove('out'); el.classList.add('in'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('in'))); }, 450); }, 2800); }
const podCard = (p, i) => { const s = D.shows[p.s]; return `<button class="pod" type="button" data-pod="${i}"><div class="art${s.logo ? ' lg' : ''}" style="--a:${s.g[0]};--b:${s.g[1]}${artBg(epS(p), !s.logo)}">${s.logo ? '' : `<b>${esc(s.n)}</b>`}<span class="pl">${I('play')}</span></div><div class="bd"><h4>${esc(p.t)}</h4>${epWho(p) ? `<div class="pwho">${esc(epWho(p))}</div>` : ''}<p>${esc(p.d)}</p><div class="mt"><span class="chip">${esc(p.c)}</span>${esc(p.len)}</div></div></button>`; };
const IG_REELS = 'https://www.instagram.com/inspirefmluton/reels/';
/* Latest reels carousel. Sources, first that has reels wins:
   1. D.reelFeed: a JSON feed of the @inspirefmluton account (e.g. Behold.so, free), newest first, picked up automatically
   2. D.reels: reel links pasted in data.js
   Reels don't autoplay: tap one to play it with Instagram's own player. */
let IGL = [];
const igCode = u => ((u || '').match(/\/(?:reel|p|tv)\/([\w-]+)/) || [])[1];
const igCard = (r, i) => { const c = igCode(r.ig); if (!c) return ''; return `<button type="button" class="igc" data-igr="${i}" aria-label="Play reel${r.t ? ': ' + esc(r.t) : ''}">${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy">` : `<iframe class="igc-fr" src="https://www.instagram.com/reel/${c}/embed/" loading="lazy" tabindex="-1" scrolling="no" title=""></iframe>`}<span class="igc-p"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>${r.t ? `<span class="igc-c">${esc(r.t)}</span>` : ''}<span class="igc-tap"></span></button>`; };
const igAll = () => `<a class="igr-all${IGL.length ? '' : ' solo'}" href="${IG_REELS}" target="_blank" rel="noopener"><span class="igr-ic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg></span><b>${IGL.length ? 'More reels' : 'Watch our latest reels'}</b><span>@inspirefmluton on Instagram</span><i>Open Instagram <svg><use href="#i-arrow"/></svg></i></a>`;
const reelsHTML = () => IGL.map(igCard).join('') + igAll();
function paintReels() { ['#reelRail', '#reelRail2'].forEach(s => { const r = $(s); if (!r) return; r.innerHTML = reelsHTML(); const sw = r.closest('.sec') && r.closest('.sec').querySelector('.swipe'); if (sw) sw.hidden = IGL.length < 2; }); }
window.IFM_loadReels = () => loadReels();
function loadReels() { IGL = (D.reels || []).filter(r => igCode(r.ig)); paintReels();
  if (D.reelFeed) fetch(D.reelFeed).then(r => r.json()).then(j => { const L = (Array.isArray(j) ? j : j.posts || j.data || []).filter(p => /video|reel/i.test(p.mediaType || p.media_type || '') || /\/reel\//.test(p.permalink || '')).slice(0, 12).map(p => ({ ig: p.permalink, img: p.thumbnailUrl || p.thumbnail_url || (p.sizes && p.sizes.medium && p.sizes.medium.mediaUrl) || '', t: (p.prunedCaption || p.caption || '').split('\n')[0].slice(0, 90) })); if (L.length) { IGL = L; paintReels(); } }).catch(() => {}); }
document.addEventListener('click', e => { const b = e.target.closest('[data-igr]'); if (!b || b.closest('.rail.drag')) return; const r = IGL[+b.dataset.igr], c = igCode(r && r.ig); if (!c) return; let v = $('#igv'); if (!v) { v = document.createElement('div'); v.id = 'igv'; v.className = 'igv'; v.innerHTML = '<button class="igv-x" type="button" aria-label="Close">×</button><iframe allow="autoplay; encrypted-media; clipboard-write" allowtransparency="true" title="Inspire FM reel"></iframe><a target="_blank" rel="noopener">Open in Instagram</a>'; document.body.appendChild(v); v.addEventListener('click', ev => { if (ev.target === v || ev.target.closest('.igv-x')) { v.hidden = true; $('iframe', v).src = 'about:blank'; document.body.classList.remove('lock'); } }); } $('iframe', v).src = `https://www.instagram.com/reel/${c}/embed/`; $('a', v).href = r.ig; v.hidden = false; document.body.classList.add('lock'); });
/* autoplay reels as they scroll into view (muted, like Instagram); pause when they leave */
const vio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { const v = en.target, card = v.closest('.reel,.rf-item');
  if (en.isIntersecting && en.intersectionRatio > .6 && !document.hidden) { if (!v.src) v.src = v.dataset.src; const p = v.play(); p && p.then(() => card && card.classList.remove('paused')).catch(() => {}); }
  else { v.pause(); card && card.classList.add('paused'); } }), { threshold: [0, .6, 1] }) : null;
function watchVideos(root) { if (document.documentElement.classList.contains('ax-lite')) return; $$('video[data-src]', root).forEach(v => { if (v._w) return; v._w = 1; vio ? vio.observe(v) : (v.src = v.dataset.src); v.addEventListener('timeupdate', () => { const c = v.closest('.reel,.rf-item'), b = c && $('.prog i,.rf-bar b', c); if (b && v.duration) b.style.width = (v.currentTime / v.duration * 100) + '%'; }); }); }
let rfMuted = true;
function openFeed(start) {
  const f = $('#rfeed'); $('#rfList').innerHTML = D.reels.map((r, i) => `<div class="rf-item" data-i="${i}"><video muted playsinline loop preload="none" poster="vid/${r.id}.jpg" data-src="vid/${r.id}.mp4"></video><div class="rf-side"><button type="button" data-like aria-label="Like">${I('heart')}</button><button type="button" data-rshare="${i}" aria-label="Share">${I('share')}</button><a href="${D.social.instagram}" target="_blank" rel="noopener" aria-label="Open on Instagram">${I('insta')}</a></div><div class="rf-bar"><p style="margin:0 0 10px;font-weight:600">${esc(r.t)}<br><small style="opacity:.75;font-weight:500">@inspirefmluton · ${esc(r.tag)}</small></p><i><b></b></i></div></div>`).join('');
  f.hidden = false; document.body.classList.add('lock'); watchVideos(f); $$('#rfList video').forEach(v => v.muted = rfMuted);
  requestAnimationFrame(() => { $('#rfList').scrollTop = start * $('#rfList').clientHeight; });
  if (playing) { play(); toast('Radio paused while you watch'); }
}
function closeFeed() { $$('#rfList video').forEach(v => { v.pause(); vio && vio.unobserve(v); }); $('#rfList').innerHTML = ''; $('#rfeed').hidden = true; document.body.classList.remove('lock'); }
$('#rfX').onclick = closeFeed;
$('#rfSnd').onclick = () => { rfMuted = !rfMuted; $$('#rfList video').forEach(v => v.muted = rfMuted); $('#rfSnd use').setAttribute('href', rfMuted ? '#i-mute' : '#i-vol'); };
$('#rfList').addEventListener('click', e => { const l = e.target.closest('[data-like]'); if (l) { l.classList.toggle('on'); if (navigator.vibrate) navigator.vibrate(12); return; } const s = e.target.closest('[data-rshare]'); if (s) { copy(`${D.reels[+s.dataset.rshare].t} · watch on Instagram: ${D.social.instagram}`, 'Link copied'); return; } const it = e.target.closest('.rf-item'); if (it && !e.target.closest('a,button')) { const v = $('video', it); v.paused ? v.play() : v.pause(); } });
addEventListener('keydown', e => { if ($('#rfeed').hidden) return; if (e.key === 'Escape') closeFeed(); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); $('#rfList').scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * innerHeight, behavior: 'smooth' }); } });
document.addEventListener('click', e => { const r = e.target.closest('[data-reel]'); if (r && !r.closest('.rail.drag')) openFeed(+r.dataset.reel); });
function podModal(i) { const p = D.pods[i], s = D.shows[p.s], h = hostOf(p), gu = p.gu || [];
  const people = `<div class="presby"><span>${p.demo ? 'Sample episode' : 'On this episode'}</span>${h ? `<button type="button" class="presc" disabled>Host · ${esc(h)}</button>` : ''}${gu.map(g => `<button type="button" class="presc" disabled>Guest · ${esc(g)}</button>`).join('')}${!gu.length && !p.demo ? '<small style="color:var(--mut);width:100%">No guest on this one.</small>' : ''}</div>`;
  const play = p.mp3 ? `<audio controls preload="none" src="${p.mp3}" style="width:100%;margin:6px 0 14px"></audio>` : `<div style="border-radius:18px;padding:18px;background:${epS(p).img ? `linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(0,0,0,.62)),${grad(epS(p))}` : grad(s)};color:#fff;display:flex;gap:14px;align-items:center;margin:16px 0;min-height:150px"><span style="width:52px;height:52px;border-radius:50%;background:#fff;color:#111;display:grid;place-items:center">${I('play')}</span><div><b style="font-family:var(--display)">${esc(p.len)}${p.demo ? ' episode' : ''}</b><div style="font-size:.85rem;opacity:.9">${p.demo ? 'A sample episode. Real episodes come in automatically from the podcast feed.' : 'Opens in the podcast app.'}</div></div></div>`;
  const links = p.url ? `<a class="btn g" href="${p.url}" target="_blank" rel="noopener">${I('play')}Open the episode</a>` : `<a class="btn g" href="${D.social.mixcloud}" target="_blank" rel="noopener">${I('mix')}Listen on Mixcloud</a><a class="btn ghost" href="${D.social.youtube}" target="_blank" rel="noopener">${I('yt')}YouTube</a>`;
  modal(`<span class="eyebrow">${esc(s.n)}${p.date ? ' · ' + esc(p.date) : ''}</span><h3 style="font-size:1.6rem;margin:10px 0">${esc(p.t)}</h3><p style="color:var(--char)">${esc(p.d)}</p>${people}${play}<div style="display:flex;gap:10px;flex-wrap:wrap">${links}</div>`); }
document.addEventListener('click', e => { const b = e.target.closest('[data-pod]'); if (b) { closeModal(); openNP('ep', true, +b.dataset.pod); } });

function evCard(ev) {
  const gc = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.t)}&dates=${ev.start.replace(/-/g, '')}/${(ev.end || ev.start).replace(/-/g, '')}&details=${encodeURIComponent(ev.d + ' — Inspire FM 105.1')}&location=${encodeURIComponent(ev.where)}`;
  const src = ev.from === 'you' ? `<span class="src pend">${I('clock')}Pending review · only you can see this</span>` : ev.from === 'web' ? `<span class="src web">${I('globe')}Run by ${esc(ev.srcName || '')}</span>` : ev.from === 'inspire' ? `<span class="src">${I('waves')}Inspire FM</span>` : '';
  return `<article class="ev reveal ${ev.pending ? 'pending' : ''} ${ev.example ? 'example' : ''}" style="--hue:${ev.hue}"><div class="top"><span>${esc(ev.c)}</span><h3>${esc(ev.t)}</h3></div><div class="bd">${src}<div class="meta"><div>${I('cal')}${esc(ev.when)}</div><div>${I('pin')}${esc(ev.where)}</div></div><p>${esc(ev.d)}</p>${ev.example ? '' : `<div class="acts">${/^https?:/.test(ev.cta[1]) ? `<a class="btn sm g" href="${esc(ev.cta[1])}" target="_blank" rel="noopener">${esc(ev.cta[0])}</a>` : `<a class="btn sm g" href="#${ev.cta[1]}">${esc(ev.cta[0])}</a>`}<a class="cal" href="${gc}" target="_blank" rel="noopener">${I('calendar')}Add to calendar</a></div>`}</div></article>`;
}
const newsCard = (n, i) => { const s = n.src || [], one = s.length === 1; return `<a class="nw2 reveal" ${one ? `href="${esc(s[0][1])}" target="_blank" rel="noopener"` : `role="button" tabindex="0" data-nw="${i}"`}><div class="nw2-m"><span class="nw2-c">${esc(n.c)}</span>${n.date ? `<span>${esc(n.date)}</span>` : ''}<span class="nw2-s">${s.map(x => esc(x[0])).join(' · ')}</span></div><h4>${esc(n.t)}</h4><p>${esc(n.d)}</p></a>`; };

function marquee() {
  if (!$('#mtrack')) return;
  const tr = $('#mtrack'), m = $('#marq'); const lg = D.partners.filter(p => p.logo), wm = D.partners.filter(p => !p.logo), mix = []; for (let i = 0; i < Math.max(lg.length, wm.length); i++) { lg[i] && mix.push(lg[i]); wm[i] && mix.push(wm[i]); } const one = mix.map(p => `<button type="button" data-pt="${esc(p.n)}" title="${esc(p.n)}">${p.logo ? `<img src="${p.logo}" alt="${esc(p.n)}">` : `<span class="wm">${esc(p.n)}</span>`}</button>`).join('');
  tr.innerHTML = one + one; let x = 0, paused = false, drag = false, sx = 0, sxv = 0;
  const loop = () => { const half = tr.scrollWidth / 2; if (!paused && !drag && !reduce) x -= .45; if (x <= -half) x += half; if (x > 0) x -= half; tr.style.transform = `translateX(${x}px)`; requestAnimationFrame(loop); };
  m.addEventListener('mouseenter', () => paused = true); m.addEventListener('mouseleave', () => paused = false);
  m.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; sxv = x; m.classList.add('drag'); m._mv = false; });
  addEventListener('pointermove', e => { if (drag) { if (Math.abs(e.clientX - sx) > 4) m._mv = true; x = sxv + (e.clientX - sx); } });
  addEventListener('pointerup', () => { drag = false; m.classList.remove('drag'); });
  m.addEventListener('click', e => { const b = e.target.closest('[data-pt]'); if (!b || m._mv) return; const p = D.partners.find(q => q.n === b.dataset.pt); modal(`<div style="height:90px;display:flex;align-items:center;margin-bottom:10px">${p.logo ? `<img src="${p.logo}" alt="" style="max-height:80px;max-width:220px;object-fit:contain">` : `<b style="font-family:var(--display);font-size:1.6rem;text-transform:uppercase">${esc(p.n)}</b>`}</div><span class="chip">${esc(p.k)}</span><h3 style="font-size:1.5rem;margin:10px 0 6px">${esc(p.n)}</h3><p style="color:var(--char)">${esc(p.d)}</p>${p.url ? `<a class="btn g" href="${p.url}" target="_blank" rel="noopener">Visit website ↗</a>` : ''}`); });
  requestAnimationFrame(loop);
}
function appealMeter() {
  const a = D.appeal, raised = viewEx ? 11840 : a.raised, pct = Math.min(100, raised / a.target * 100);
  setTimeout(() => { $$('#apMeter,.apm').forEach(m => m.style.width = Math.max(pct, raised ? 2 : 0) + '%'); }, 300);
  $$('#apRaised,.apr').forEach(r => r.textContent = '£' + raised.toLocaleString('en-GB'));
}
function amounts() {
  if (!$('.amts') || !$('#amtNote')) return;
  const upd = v => { $('#amtNote').textContent = v >= 70 ? `£${v} = ${Math.floor(v / 70)} family parcel${v >= 140 ? 's' : ''}, doubled to £${v * 2} with Human Appeal's match.` : `£${v} = ${v / 20 >= 1 ? Math.floor(v / 20) + ' food parcel' + (v >= 40 ? 's' : '') + ', ' + Math.floor(v / 20) * 3 + ' days of food' : 'half a parcel'}, doubled to £${v * 2} with the match.`; $('#apGo').innerHTML = `${I('heart')}Donate £${v}`; };
  $('.amts').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('.amts button').forEach(x => x.classList.toggle('on', x === b)); upd(+b.dataset.amt); }); upd(20);
}

/* ================= PRAYER: live clock, bands, page ================= */
function tickClock() {
  const T = today(), l = T.l, now = new Date();
  const ck = `${pad(l.h)}:${pad(l.mi)}<small>:${pad(l.s)}</small>`;
  ['#clk', '#clk2'].forEach(s => { const el = $(s); if (el) el.innerHTML = ck; });
  const ds = `${greg(now)}<br>${hijri(now)}`; ['#dts', '#dts2'].forEach(s => { const el = $(s); if (el && el.innerHTML !== ds) el.innerHTML = ds; });
  const next = T.nx[1];
  $('#hdrSalah').innerHTML = `<span class="dot"></span><span>${next} in <b>${dur(T.left)}</b></span>`;
  if ($('#btNext')) { $('#btNext').textContent = next; $('#btIn').textContent = 'in ' + dur(T.left); const mh = PR.filter(p => p[0] !== 'sunrise').slice(0, 3).concat(PR.slice(4)).slice(0, 6).map(([k, n]) => `<i class="${T.nx[0] === k ? 'n' : ''}">${n}<b>${hm(T.t[k])}</b></i>`).join(''); if ($('#btTimes')._h !== mh) { $('#btTimes').innerHTML = mh; $('#btTimes')._h = mh; } if (l.s === 0) $('#btLockT').textContent = lockTime(); }
  if ($('#homeTimes')) { const html = PR.map(([k, n]) => `<div class="pt ${T.nx[0] === k ? 'next' : T.t[k] < T.now ? 'past' : ''}"><span>${n}</span><b>${hm(T.t[k])}</b></div>`).join(''); if ($('#homeTimes')._h !== html) { $('#homeTimes').innerHTML = html; $('#homeTimes')._h = html; } $('#homeNext').innerHTML = `${next} in<b>${dur(T.left)}</b><a href="#prayer" style="font-size:.8rem">Full timetable ›</a>`; }
  if (inited.prayer) {
    const html = PR.map(([k, n, sub]) => `<div class="prow ${T.nx[0] === k ? 'next' : T.t[k] < T.now ? 'past' : ''}"><span><b>${n}</b>${sub ? `<br><small>${sub}</small>` : ''}</span><small>${k === 'dhuhr' && l.dow === 5 ? 'Jummah · see finder' : ''}</small><span class="tm">${hm(T.t[k])}</span></div>`).join('');
    if ($('#pTable')._h !== html) { $('#pTable').innerHTML = html; $('#pTable')._h = html; drawArc(T); }
    const nT = hm(T.left + T.now), inT = 'in ' + dur(T.left).replace(/ \d+s$/, '');
    $('#pNextIn').textContent = dur(T.left); $('#pNextTxt').innerHTML = `until <b>${next}</b> at ${hm(T.left + T.now)}`;
  }
  if (inited.jummah && l.s === 0) renderJ();
  alertTick(T);
}
let reminder = false;
function drawArc(T) {
  const x = h => 20 + (h - T.t.fajr + 1) / (T.t.isha - T.t.fajr + 2) * 560, W = 600;
  const sr = T.t.sunrise, ss = T.t.maghrib, pts = []; for (let h = sr; h <= ss; h += .1) { const k = (h - sr) / (ss - sr); pts.push(`${x(h).toFixed(1)},${(110 - Math.sin(k * Math.PI) * 90).toFixed(1)}`); }
  const nk = Math.min(1, Math.max(0, (T.now - sr) / (ss - sr))), sunX = x(Math.min(ss, Math.max(sr, T.now))), sunY = 110 - Math.sin(nk * Math.PI) * 90;
  $('#sunArc').innerHTML = `<svg viewBox="0 0 ${W} 150" role="img" aria-label="The sun's path today"><line x1="10" y1="110" x2="590" y2="110" stroke="rgba(255,255,255,.18)" stroke-width="2"/><polyline points="${pts.join(' ')}" fill="none" stroke="rgba(164,163,161,.6)" stroke-width="3" stroke-dasharray="6 6"/>${PR.map(([k, n]) => `<g><line x1="${x(T.t[k])}" y1="104" x2="${x(T.t[k])}" y2="116" stroke="#a4a3a1" stroke-width="2"/><text x="${x(T.t[k])}" y="138" fill="#babcb9" font-size="13" text-anchor="middle" font-family="DM Sans">${n}</text></g>`).join('')}${T.now > sr && T.now < ss ? `<circle cx="${sunX}" cy="${sunY}" r="11" fill="#bdb285"/><circle cx="${sunX}" cy="${sunY}" r="18" fill="#bdb285" opacity=".2"/>` : `<circle cx="${x(T.now > ss ? Math.min(T.now, T.t.isha + 1) : Math.max(T.now, T.t.fajr - 1))}" cy="40" r="9" fill="#e0e2de"/>`}</svg>`;
}
function initPrayer() {
  $$('[data-asr]').forEach(b => { b.setAttribute('aria-pressed', +b.dataset.asr === asrF); b.onclick = () => { asrF = +b.dataset.asr; store.set('asr', asrF); $$('[data-asr]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pTable')._h = ''; $('#homeTimes') && ($('#homeTimes')._h = ''); tickClock(); drawWp(); }; });
  const sel = $('#wpMasjid'); sel.innerHTML += M.map(m => `<option value="${m.id}">${esc(m.n)}</option>`).join('');
  ['wpType', 'wpMasjid', 'wpStyle'].forEach(id => $('#' + id).onchange = drawWp);
  document.fonts && document.fonts.ready.then(drawWp); drawWp();
  $('#wpSave').onclick = saveWp;
  const mwDraw = () => { const cv = document.createElement('canvas'); renderMonthWall(cv, store.get('mwSty', 'dark'), M.find(m => m.id === store.get('masjid', ''))); $('#mwImg').src = cv.toDataURL('image/jpeg', .86); $('#mwMonth').textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'Europe/London' }).format(new Date()); $$('#mwall .mockT').forEach(e => e.textContent = lockTime()); $$('#mwall .mockD').forEach(e => e.textContent = lockDate()); return cv; };
  $$('[data-mw]').forEach(b => { b.setAttribute('aria-pressed', b.dataset.mw === store.get('mwSty', 'dark')); b.onclick = () => { store.set('mwSty', b.dataset.mw); $$('[data-mw]').forEach(x => x.setAttribute('aria-pressed', x === b)); mwDraw(); }; });
  $('#mwSave').onclick = () => { const cv = mwDraw(); cv.toBlob(b => saveBlob(b, `inspire-fm-prayer-wallpaper-${monthSlug()}.png`, $('#mwNote')), 'image/png'); };
  mwDraw(); document.fonts && document.fonts.ready.then(mwDraw); Object.values(LOGO_IMG).forEach(i => i.complete || i.addEventListener('load', mwDraw, { once: true }));
  Object.values(LOGO_IMG).forEach(i => i.complete || i.addEventListener('load', drawWp, { once: true })); $('#wpCopy').onclick = () => { const T = today(); copy(`Prayer times, Luton · ${greg(new Date())}\n` + PR.map(([k, n]) => `${n}: ${hm(T.t[k])}`).join('\n') + '\n\nInspire FM 105.1 · inspirefm.org', 'Times copied'); };
}

/* ---------- timetable / wallpaper maker ---------- */
const LOGO_IMG = { dark: new Image(), green: new Image(), light: new Image() }; LOGO_IMG.dark.src = 'img/logo-dark.webp'; LOGO_IMG.green.src = 'img/logo-green.webp'; LOGO_IMG.light.src = 'img/logo.webp';
const WPAL = { dark: ['#0f1113', '#fff', '#a4a3a1', '#9da09d', '#1f2122'], green: ['#a4a3a1', '#0f1113', '#fff', '#293021', '#98aa7e'], light: ['#f5f6f4', '#16181b', '#7b7a78', '#707173', '#e7e9e3'] };
function renderWall(cv, sty, mq) {
  const pal = WPAL[sty], c = cv.getContext('2d'), l = lon(); cv.width = 1080; cv.height = 2340;
  const g = c.createLinearGradient(0, 0, 0, 2340); g.addColorStop(0, pal[0]); g.addColorStop(1, sty === 'dark' ? '#181c15' : sty === 'green' ? '#7b7a78' : '#e1e5dc'); c.fillStyle = g; c.fillRect(0, 0, 1080, 2340);
  c.strokeStyle = sty === 'green' ? '#fff' : pal[2]; c.globalAlpha = .13; c.lineCap = 'round'; c.lineWidth = 70; c.beginPath(); c.arc(1180, 1180, 520, Math.PI * .62, Math.PI * 1.38); c.stroke(); c.beginPath(); c.arc(1180, 1180, 280, Math.PI * .62, Math.PI * 1.38); c.stroke(); c.globalAlpha = 1;
  const T = prayerTimes(l.y, l.m, l.d, asrF), now = l.h + l.mi / 60, nx = (PR.find(p => p[0] !== 'sunrise' && T[p[0]] > now) || PR[0])[0];
  const top = 980;
  c.fillStyle = pal[3]; c.font = '700 38px Saira'; c.fillText('PRAYER TIMES · LUTON', 90, top);
  c.fillStyle = pal[1]; c.font = '800 70px Saira'; c.fillText(new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' }).format(new Date()), 90, top + 84);
  c.fillStyle = sty === 'green' ? '#0f1113' : pal[2]; c.font = '600 40px DM Sans'; c.fillText(hijri(new Date()), 90, top + 146);
  PR.forEach(([k, n], i) => { const y = top + 250 + i * 118, on = k === nx; c.fillStyle = on ? (sty === 'green' ? '#0f1113' : pal[2]) : pal[4]; roundRect(c, 80, y - 76, 920, 100, 28); c.fill(); c.fillStyle = on ? (sty === 'green' ? '#fff' : '#151412') : pal[1]; c.font = '600 46px Saira'; c.fillText(n, 124, y - 10); c.font = '800 54px Saira'; c.textAlign = 'right'; c.fillText(hm(T[k]), 956, y - 8); c.textAlign = 'left'; });
  let y2 = top + 250 + 6 * 118 + 20;
  if (mq) { c.fillStyle = sty === 'green' ? '#0f1113' : pal[2]; c.font = '700 36px Saira'; c.fillText('JUMMAH · ' + mq.n.toUpperCase().slice(0, 30), 90, y2); c.fillStyle = pal[1]; c.font = '600 42px DM Sans'; c.fillText(mq.j.map(h12).join('   ·   '), 90, y2 + 56); y2 += 120; }
  const lg = LOGO_IMG[sty]; if (lg.complete && lg.naturalWidth) { const lw = 470, lh = lw * lg.naturalHeight / lg.naturalWidth; c.drawImage(lg, 90, y2 + 10, lw, lh); c.fillStyle = pal[3]; c.font = '600 28px DM Sans'; c.fillText('Listen live · inspirefm.org', 90, y2 + 40 + lh); } else { c.fillStyle = pal[3]; c.font = '600 30px DM Sans'; c.fillText('Inspire FM 105.1 · inspirefm.org', 90, y2 + 20); }
}
/* Monthly lock-screen wallpaper: 1290x2796 (iPhone Pro Max; scales for others). The clock, date and lock-screen widgets
   use roughly the top 31%, the torch/camera buttons the bottom 11%, so the table sits between 33% and 87%. */
function renderMonthWall(cv, sty, mq) {
  const W = 1290, H = 2796, pal = WPAL[sty], c = cv.getContext('2d'), l = lon(); cv.width = W; cv.height = H;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, pal[0]); g.addColorStop(1, sty === 'dark' ? '#181c15' : sty === 'green' ? '#7b7a78' : '#e1e5dc'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = sty === 'green' ? '#fff' : pal[2]; c.globalAlpha = .1; c.lineCap = 'round'; c.lineWidth = 80; c.beginPath(); c.arc(W + 120, 560, 600, Math.PI * .62, Math.PI * 1.38); c.stroke(); c.beginPath(); c.arc(W + 120, 560, 330, Math.PI * .62, Math.PI * 1.38); c.stroke(); c.globalAlpha = 1;
  const acc = sty === 'green' ? '#0f1113' : pal[2], days = new Date(l.y, l.m, 0).getDate();
  const mn = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(l.y, l.m - 1, 2));
  const top = Math.round(H * .335), bottom = Math.round(H * .868), X0 = 70, X1 = W - 70;
  // card behind the table for legibility
  c.fillStyle = sty === 'light' ? 'rgba(255,255,255,.72)' : sty === 'green' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.05)'; roundRect(c, X0 - 20, top - 30, X1 - X0 + 40, bottom - top + 40, 44); c.fill();
  c.fillStyle = acc; c.font = '700 34px Saira'; c.fillText('PRAYER TIMES · LUTON', X0 + 24, top + 34);
  c.fillStyle = pal[1]; c.font = '800 64px Saira'; c.fillText(mn, X0 + 24, top + 104);
  c.fillStyle = pal[3]; c.font = '600 30px DM Sans'; c.textAlign = 'right'; c.fillText(hijri(new Date(l.y, l.m - 1, 1)).replace(/^\d+\s*/, '') + (asrF === 2 ? ' · Asr Hanafi' : ''), X1 - 24, top + 100); c.textAlign = 'left';
  const cols = ['', 'Fajr', 'Sunrise', 'Zuhr', 'Asr', 'Maghrib', 'Isha'], xs = [X0 + 24, 395, 545, 690, 835, 1000, X1 - 24];
  const hy = top + 168; c.font = '700 26px Saira'; c.fillStyle = pal[3];
  cols.forEach((t, i) => { if (!t) return; c.textAlign = 'right'; c.fillText(t.toUpperCase(), xs[i], hy); }); c.textAlign = 'left';
  const rows0 = hy + 22, rh = (bottom - 70 - rows0) / days, fs = Math.min(34, rh * .64);
  for (let d = 1; d <= days; d++) {
    const T = prayerTimes(l.y, l.m, d, asrF), y = rows0 + d * rh - rh * .28, dow = new Date(l.y, l.m - 1, d).getDay();
    if (dow === 5) { c.fillStyle = acc; c.globalAlpha = sty === 'green' ? .16 : .2; roundRect(c, X0, y - rh * .74, X1 - X0, rh * .98, Math.min(20, rh * .4)); c.fill(); c.globalAlpha = 1; }
    c.fillStyle = dow === 5 ? acc : pal[1]; c.font = `700 ${fs}px Saira`; c.fillText(String(d).padStart(2, ' '), xs[0], y);
    c.fillStyle = pal[3]; c.font = `600 ${fs * .72}px DM Sans`; c.fillText(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow], xs[0] + fs * 1.5, y);
    c.fillStyle = pal[1]; c.font = `600 ${fs}px Saira`; c.textAlign = 'right';
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach((k, i) => { c.globalAlpha = k === 'sunrise' ? .62 : 1; c.fillText(hm(T[k]), xs[i + 1], y); }); c.globalAlpha = 1; c.textAlign = 'left';
  }
  c.fillStyle = pal[3]; c.font = '600 26px DM Sans'; c.fillText((mq ? `Jummah: ${mq.n.slice(0, 26)} ${mq.j.map(h12).join(', ')}` : 'Fridays highlighted') + ' · Start times', X0 + 24, bottom - 18);
  const lg = LOGO_IMG[sty]; if (lg.complete && lg.naturalWidth) { const lw = 230, lh = lw * lg.naturalHeight / lg.naturalWidth; c.drawImage(lg, X1 - 24 - lw, bottom - 18 - lh + 8, lw, lh); }
}
function renderMonth(cv, sty, mq) {
  const pal = WPAL[sty], c = cv.getContext('2d'), l = lon(); cv.width = 1240; cv.height = 1754; c.fillStyle = sty === 'dark' ? '#fff' : pal[0]; if (sty === 'dark') { pal[1] = '#16181b'; } c.fillRect(0, 0, 1240, 1754);
  const P = sty === 'dark' ? ['#fff', '#16181b', '#7b7a78', '#707173', '#edefea'] : pal;
  const days = new Date(l.y, l.m, 0).getDate(), mn = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(l.y, l.m - 1, 2));
  c.fillStyle = P[2]; c.fillRect(0, 0, 1240, 14); c.font = '700 30px Saira'; c.fillText('PRAYER TIMETABLE · LUTON', 70, 92); { const lg = LOGO_IMG[sty === 'green' ? 'green' : 'light']; if (lg.complete && lg.naturalWidth) { const lw = 330; c.drawImage(lg, 1240 - 70 - lw, 48, lw, lw * lg.naturalHeight / lg.naturalWidth); } }
  c.fillStyle = P[1]; c.font = '800 70px Saira'; c.fillText(mn, 70, 172);
  const cols = ['Date', 'Day', 'Fajr', 'Sunrise', 'Zuhr', 'Asr', 'Maghrib', 'Isha'], xs = [70, 190, 330, 470, 620, 760, 900, 1060];
  c.font = '700 24px Saira'; c.fillStyle = P[3]; cols.forEach((t, i) => c.fillText(t.toUpperCase(), xs[i], 240));
  const rh = (1754 - 340) / days;
  for (let d = 1; d <= days; d++) { const T = prayerTimes(l.y, l.m, d, asrF), y = 250 + d * rh, dow = new Date(l.y, l.m - 1, d).getDay(); if (d === l.d || dow === 5) { c.fillStyle = d === l.d ? P[2] : P[4]; c.globalAlpha = d === l.d ? .3 : 1; c.fillRect(60, y - rh + 8, 1120, rh - 2); c.globalAlpha = 1; } c.fillStyle = P[1]; c.font = '600 ' + Math.min(26, rh * .6) + 'px DM Sans'; c.fillText(d, xs[0], y); c.fillText(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow], xs[1], y); ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach((k, i) => c.fillText(hm(T[k]), xs[i + 2], y)); }
  c.fillStyle = P[3]; c.font = '500 22px DM Sans'; c.fillText((mq ? `Jummah at ${mq.n}: ${mq.j.map(h12).join(', ')}. ` : '') + 'Start times calculated for Luton. Fridays shaded. inspirefm.org', 70, 1720);
}
function lockTime() { const l = lon(); return pad(l.h) + ':' + pad(l.mi); }
const lockDate = () => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' }).format(new Date());
function drawWp() {
  const cv = $('#wpCanvas'); if (!cv) return; const type = $('#wpType').value, sty = $('#wpStyle').value, mq = M.find(m => m.id === ($('#wpMasjid').value || store.get('masjid', '')));
  if (type === 'wall' || type === 'mwall') { (type === 'mwall' ? renderMonthWall : renderWall)(cv, sty, mq); const u = cv.toDataURL('image/jpeg', .88); $$('#mockPhones .wpImg').forEach(i => i.src = u); $$('.mockT').forEach(e => e.textContent = lockTime()); $$('.mockD').forEach(e => e.textContent = lockDate()); $('#mockPhones').hidden = false; $('#mockPaper').hidden = true; }
  else { renderMonth(cv, sty, mq); $('#paperImg').src = cv.toDataURL('image/jpeg', .9); $('#mockPhones').hidden = true; $('#mockPaper').hidden = false; }
}
function bentoWall() { const im = $('#btWall'); if (!im) return; const cv = document.createElement('canvas'); renderWall(cv, 'dark', M.find(m => m.id === store.get('masjid', ''))); im.src = cv.toDataURL('image/jpeg', .82); $('#btLockT').textContent = lockTime(); $('#btLockD').textContent = lockDate(); }
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
let dl = null; if (window.claude && window.claude.use) window.claude.use('downloads').then(x => dl = x).catch(() => {});
const monthSlug = () => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Europe/London' }).format(new Date()).toLowerCase().replace(/\s+/g, '-');
async function saveBlob(b, name, note) {
  if (dl) { try { await dl.save({ filename: name, data: b }); return; } catch (e) { if (e && /declin|cancel|abort/i.test(String(e.message || e))) return; } }
  try { const f = new File([b], name, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { await navigator.share({ files: [f] }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { if (note) note.textContent = 'Press and hold the picture to save it to your phone.'; }
}
function saveWp() {
  drawWp(); const cv = $('#wpCanvas'), name = { wall: 'inspire-fm-prayer-wallpaper-today.png', mwall: `inspire-fm-prayer-wallpaper-${monthSlug()}.png`, month: 'inspire-fm-prayer-timetable.png' }[$('#wpType').value];
  cv.toBlob(async b => {
    if (dl) { try { await dl.save({ filename: name, data: b }); return; } catch (e) { if (e && /declin|cancel|abort/i.test(String(e.message || e))) return; } }
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); $('#wpNote').textContent = 'If nothing downloaded, press and hold the preview to save it.'; } catch (e) { $('#wpNote').textContent = 'Press and hold the preview to save it to your phone.'; }
  }, 'image/png');
}

/* ================= JUMMAH FINDER ================= */
let jMe = null, jLabel = '', jQ = '';
const JF = new Set();
const miles = (a, b) => { const R = 3958.8, r = Math.PI / 180, dl_ = (b[0] - a[0]) * r, dg = (b[1] - a[1]) * r, x = Math.sin(dl_ / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
/* postcode lookup: the offline Luton postcode table (ngs/help-data.js), then postcodes.io, then the district centre */
let pcLoading = null;
const loadPC = () => window.NGSPC ? Promise.resolve() : (pcLoading = pcLoading || new Promise(res => { const a = document.createElement('script'); a.src = 'ngs/help-data.js'; a.onload = a.onerror = () => res(); document.body.appendChild(a); }));
const pcCache = {};
function loadHelpData() { return loadPC(); }
async function geocode(v) {
  const p = v.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (p.length < 2) return null;
  await loadPC(); const PC = window.NGSPC || { lu: {}, oc: {} };
  const b36 = s => parseInt(s, 36);
  const lu = o => { if (pcCache[o]) return pcCache[o]; const t = {}, raw = (PC.lu || {})[o]; if (raw) raw.split(';').forEach(e => { const inc = e.slice(0, 3), [a, b] = e.slice(3).split(','); t[inc] = [51.7 + b36(a) / 1e4, -1 + b36(b) / 1e4]; }); return pcCache[o] = t; };
  if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(p)) {
    const o = p.slice(0, -3), inc = p.slice(-3), hit = lu(o)[inc]; if (hit) return { ll: hit, label: o + ' ' + inc, exact: 1 };
    try { const ctl = new AbortController(); setTimeout(() => ctl.abort(), 5000); const r = await fetch('https://api.postcodes.io/postcodes/' + p, { signal: ctl.signal }); const j = await r.json(); if (j.result) return { ll: [j.result.latitude, j.result.longitude], label: j.result.postcode, exact: 1 }; } catch (e) {}
    if ((PC.oc || {})[o]) return { ll: PC.oc[o], label: o, exact: 0 }; return null; }
  if ((PC.oc || {})[p]) return { ll: PC.oc[p], label: p, exact: 0 };
  try { const r = await fetch('https://api.postcodes.io/outcodes/' + p); const j = await r.json(); if (j.result) return { ll: [j.result.latitude, j.result.longitude], label: j.result.outcode, exact: 0 }; } catch (e) {}
  return null;
}
const PCRE = { test: v => /^[A-Z]{1,2}\d[A-Z\d]?(\d[A-Z]{2})?$/i.test(String(v).replace(/\s+/g, '')) };
function initJummah() {
  $('#jForm').addEventListener('submit', async e => { e.preventDefault(); const v = $('#jIn').value.trim(); jQ = ''; jMe = null; if (!v) { $('#jMsg').textContent = ''; renderJ(); return; }
    if (PCRE.test(v) || /^LU\d/i.test(v)) { $('#jMsg').classList.remove('err'); $('#jMsg').textContent = 'Finding your postcode…'; const r = await geocode(v); if (!r) { $('#jMsg').textContent = 'We couldn\'t find that postcode. Check it, or try just the first part, like LU4.'; $('#jMsg').classList.add('err'); renderJ(); return; } jMe = r.ll; jLabel = r.label; $('#jMsg').textContent = r.exact ? `Showing Jummah closest to ${r.label}.` : `Showing Jummah closest to the ${r.label} area (approximate).`; try { sessionStorage.setItem('ifmPc', v); } catch (e) {} }
    else { jQ = v.toLowerCase(); $('#jMsg').textContent = ''; }
    renderJ(); });
  let jT = 0; $('#jIn').addEventListener('input', e => { const v = e.target.value.trim(); clearTimeout(jT);
    if (!v) { jQ = ''; jMe = null; jLabel = ''; $('#jMsg').textContent = ''; $('#jMsg').classList.remove('err'); try { sessionStorage.removeItem('ifmPc'); } catch (x) {} renderJ(); return; }
    if (PCRE.test(v) || /^LU\d/i.test(v)) { if (/\d[A-Z]{2}$/i.test(v.replace(/\s/g, ''))) jT = setTimeout(() => $('#jForm').requestSubmit(), 500); return; }
    jT = setTimeout(() => { jQ = v.toLowerCase(); jMe = null; $('#jMsg').textContent = ''; renderJ(); }, 180); });
  $('#jLoc').onclick = () => { if (!navigator.geolocation) { $('#jMsg').textContent = 'Location isn\'t available here. Type your postcode instead.'; return; } $('#jMsg').textContent = 'Finding your location…'; $('#jMsg').classList.remove('err'); $('#jLoc').classList.add('busy');
    navigator.geolocation.getCurrentPosition(p => { $('#jLoc').classList.remove('busy'); jMe = [p.coords.latitude, p.coords.longitude]; jLabel = 'you'; jQ = ''; $('#jIn').value = ''; const far = miles(jMe, [LAT, LNG]) > 25; $('#jMsg').textContent = far ? 'You seem to be outside Luton, so these are Luton\'s venues by distance from you.' : 'Showing Jummah closest to you.'; renderJ(); $('#jList').scrollIntoView({ behavior: 'smooth', block: 'start' }); },
      err => { $('#jLoc').classList.remove('busy'); $('#jMsg').classList.add('err'); $('#jMsg').textContent = err && err.code === 1 ? 'Location is switched off for this site. Allow it in your browser settings, or type your postcode above.' : 'We couldn\'t get your location just now. Type your postcode above instead.'; $('#jIn').focus(); }, { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }); };
  $('#jFilt').onclick = e => { const b = e.target.closest('button'); if (!b) return; const f = b.dataset.f; JF.has(f) ? JF.delete(f) : JF.add(f); b.setAttribute('aria-pressed', JF.has(f)); renderJ(); };
  $('#jChk').innerHTML = `Jamaat times from Inspire FM's Luton Jummah list, checked ${esc(window.IFM_MOSQUES_CHECKED || '')}. Times can change, especially when the clocks go back or forward. Something wrong? <a href="#contact">Tell us</a> and we'll update it for everyone.`;
  try { const v = sessionStorage.getItem('ifmPc'); if (v) { $('#jIn').value = v; $('#jForm').requestSubmit ? $('#jForm').requestSubmit() : $('#jForm').dispatchEvent(new Event('submit')); return; } } catch (e) {}
  renderJ();
}
const LOGOFILES = new Set(['akbaria', 'bpjm', 'turkish-ca', 'al-bilal', 'al-furqan', 'al-hira', 'al-huda', 'al-jalal', 'as-sunnah', 'bait-ul-abraar', 'bury-park-jamia', 'bushmead', 'dallow-centre', 'dunstable-masjid', 'faizan-e-mushkil-kusha', 'farley-hill-cc', 'farley-hill-masjid', 'ghosia-trust', 'hockwell-ring', 'ibrahim', 'irshad', 'jalalabad', 'keech-hospice', 'kokni', 'leagrave-hall', 'lewsey-cc', 'lucas-gardens', 'luton-central', 'luton-islamic-centre', 'madinah', 'masjid-e-ali', 'masjid-e-noor', 'raynham-way-cc', 'saints-area', 'shah-jalal', 'suffa-tul-islam', 'venue-central', 'yusuf-hall', 'zakariya', 'zuhri-academy']);
const mlogo = m => LOGOFILES.has(m.id) ? `<img src="img/m/${m.id}.webp" alt="" loading="lazy">` : `<span class="mono">${esc(m.n.split(/\s+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join(''))}</span>`;
function renderJ() {
  const l = lon(), now = l.h + l.mi / 60, isFri = l.dow === 5;
  let L = M.map(m => ({ m, d: jMe && m.ll ? miles(jMe, m.ll) : null }));
  if (jQ) L = L.filter(x => (x.m.n + ' ' + x.m.a).toLowerCase().includes(jQ));
  L = L.filter(({ m }) => (!JF.has('women') || m.w === 'yes' || m.w === 'second') && (!JF.has('early') || m.j.some(t => toH(t) < 12.75)) && (!JF.has('late') || m.j.some(t => toH(t) >= 13.5)) && (!JF.has('multi') || m.j.length > 1) && (!JF.has('masjid') || m.t === 'Masjid'));
  L.sort((a, b) => jMe ? a.d - b.d : a.m.n.localeCompare(b.m.n));
  const reach = (x, t) => { const walk = x.d != null ? x.d * 20 / 60 + 5 / 60 : 0; return toH(t) - (isFri ? now : -99) - walk; };
  $('#jSum').innerHTML = `${L.length} Jummah ${L.length === 1 ? 'venue' : 'venues'}${jQ ? ` matching “${esc(jQ)}”` : ''}${jMe ? ` · closest to ${esc(jLabel)} first` : ''}<small>${jMe ? 'Distances are straight-line. Walking times assume about 20 minutes a mile.' : 'Add your postcode to see the nearest first.'}</small>`;
  $('#jList').innerHTML = L.length ? L.map(x => { const m = x.m; let nxSet = false;
    const times = m.j.map(t => { let cls = ''; if (isFri) { if (toH(t) < now) cls = 'gone'; else if (!nxSet && reach(x, t) > 0) { cls = 'nx'; nxSet = true; } } return `<span class="${cls}" title="${cls === 'gone' ? 'Already started' : ''}">${h12(t)}</span>`; }).join('');
    const tags = [m.t !== 'Masjid' ? m.t : '', m.w === 'yes' ? 'Women\'s area' : m.w === 'second' ? 'Women: 2nd jamaat' : '', m.j.length > 1 ? m.j.length + ' jamaats' : '', m.j.some(t => toH(t) >= 13.5) ? 'Late jamaat' : ''].filter(Boolean);
    const dest = encodeURIComponent(m.n + ', ' + m.a); const dir = jMe ? `https://www.google.com/maps/dir/?api=1&origin=${jMe[0]},${jMe[1]}&destination=${dest}&travelmode=walking` : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    return `<article class="jm">${x.d != null ? `<span class="dist">${x.d < .1 ? '<0.1' : x.d.toFixed(1)} mi</span>` : ''}<div class="jm-h"><div class="jm-logo">${mlogo(m)}</div><div><h4>${esc(m.n)}</h4><div class="ad">${esc(m.a)}</div></div></div><div class="jt">${times}</div>${tags.length ? `<div class="jtag">${tags.map(t => `<em>${esc(t)}</em>`).join('')}</div>` : ''}<div class="acts"><a href="${dir}" target="_blank" rel="noopener">${I('compass')}Directions</a>${m.web ? `<a href="${esc(m.web)}" target="_blank" rel="noopener">${I('clock')}Timetable</a>` : ''}${m.tel ? `<a href="tel:${m.tel.replace(/\s/g, '')}">${I('phone')}Call</a>` : ''}</div></article>`; }).join('') : `<div class="hf-empty">Nothing matches all of those. Try removing a filter, or search a postcode instead.</div>`;
  const nb = $('#jNext');
  if (jMe && L.length) {
    let best = null; if (isFri) L.slice(0, 12).forEach(x => x.m.j.forEach(t => { const r = reach(x, t); if (r > 0 && (!best || toH(t) < toH(best.t))) best = { x, t, r }; }));
    if (best) { nb.hidden = false; nb.innerHTML = `<div class="big">${h12(best.t)}</div><p>The next Jummah you can still reach is at <b>${esc(best.x.m.n)}</b>, ${best.x.d < .1 ? "under 0.1" : best.x.d.toFixed(1)} miles away (about ${Math.max(2, Math.round(best.x.d * 20))} min walk). You have <b>${dur(best.r)}</b> to get there.</p><a class="btn g sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin=${jMe[0]},${jMe[1]}&destination=${encodeURIComponent(best.x.m.n + ', ' + best.x.m.a)}&travelmode=walking">Go</a>`; }
    else if (!isFri) { const x = L[0]; nb.hidden = false; nb.innerHTML = `<div class="big">${h12(x.m.j[0])}</div><p>Your nearest Jummah is <b>${esc(x.m.n)}</b>, ${x.d < .1 ? "under 0.1" : x.d.toFixed(1)} miles away. ${x.m.j.length > 1 ? 'Jamaats at ' + x.m.j.map(h12).join(' and ') + '.' : ''} On Fridays we'll show the next jamaat you can still make.</p><button class="btn g sm" type="button" data-pin="${x.m.id}">Save as my masjid</button>`; }
    else { nb.hidden = false; nb.innerHTML = `<div class="big">–</div><p>All nearby Jummah jamaats have started for today. Zuhr can still be prayed at home or at any masjid.</p>`; }
  } else nb.hidden = true;
}
document.addEventListener('click', e => { const s = e.target.closest('[data-share]'); if (s) { const m = M.find(x => x.id === s.dataset.share); share({ title: 'Jummah at ' + m.n, text: `Jummah at ${m.n} (${m.a}): ${m.j.map(h12).join(', ')}. Find every Jummah in Luton on Inspire FM:`, url: siteUrl('jummah') }); }
  const p = e.target.closest('[data-pin]'); if (p) { store.set('masjid', p.dataset.pin); toast('Saved. We\'ll use it on your wallpaper and timetable.'); } });

/* ================= LISTEN ================= */
function setTab(t) { $$('.tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.t === t)); $$('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== t); }
function initListen() {
  $('.tabs').onclick = e => { const b = e.target.closest('[role=tab]'); if (b) setTab(b.dataset.t); };
  const l = lon(); let sel = l.dow; const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = () => { $('#days').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = (l.dow + i) % 7; const dt = new Date(Date.now() + i * 864e5).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' }).replace(',', ''), rel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : ''; return `<button type="button" data-d="${d}" aria-pressed="${d === sel}" data-label="${dt}${rel ? ` (${rel})` : ''}">${rel || names[d].slice(0, 3)}<small>${rel ? dt : dt.replace(/^\w+ /, '')}</small></button>`; }).join(''); };
  /* today: what's on now at the top, then what's coming up; shows that have already finished fold away under
     "Earlier today", each with Listen again when an episode of that show is on the podcast feed */
  let early = false;
  const slot = (s, k, cur) => { const sh = D.shows[s[2]], isNow = k === 'now', past = k === 'past';
    const ep = past ? D.pods.findIndex(p => p.s === s[2] && p.mp3) : -1;
    const tag = isNow ? '<span class="sl-tag on"><i></i>On air now</span>' : k === 'next' ? '<span class="sl-tag">Up next</span>' : '';
    const ra = isNow ? `<button class="btn sm g" data-play type="button">${I('play')}<span class="t">Listen live</span></button>`
      : past ? (ep >= 0 ? `<button class="btn sm ghost" data-pod="${ep}" type="button">${I('play')}Listen again</button>` : '<span class="sl-norep">No replay yet</span>')
      : `<button class="remind" type="button" data-rem="${esc(sh.n)}|${H(s[0])}|${names[sel]}">Remind me</button>`;
    return `<div class="slot ${isNow ? 'now' : ''} ${past ? 'past' : ''}"><span class="tm">${tag}${H(s[0])} – ${H(s[1])}</span><span class="sw" style="--a:${sh.g[0]};--b:${sh.g[1]}${artBg(sh)}"></span><div><h4>${esc(sh.n)}</h4>${who(sh) ? `<p class="who">with ${esc(who(sh))}</p>` : ''}<p>${esc(sh.d)}</p></div><span class="ra">${ra}</span></div>`; };
  const slots = () => { const cur = showAt(), W = D.week[sel];
    if (sel !== cur.dow) { $('#slots').innerHTML = W.map(s => slot(s, '', cur)).join(''); return; }
    const ni = W.indexOf(cur.s), past = ni < 0 ? [] : W.slice(0, ni), rest = ni < 0 ? W : W.slice(ni);
    $('#slots').innerHTML = rest.map((s, x) => slot(s, s === cur.s ? 'now' : x === 1 || (ni < 0 && x === 0) ? 'next' : '', cur)).join('')
      + (past.length ? `<button type="button" class="sl-early" id="slEarly" aria-expanded="${early}">${early ? 'Hide' : 'Show'} earlier today <small>${past.length} show${past.length > 1 ? 's' : ''} · listen again where available</small>${I('down')}</button><div class="sl-past"${early ? '' : ' hidden'}>${past.map(s => slot(s, 'past', cur)).join('')}</div>` : ''); };
  $('#slots').addEventListener('click', e => { if (e.target.closest('#slEarly')) { early = !early; slots(); } });
  let onNow = showAt().s; setInterval(() => { const c = showAt(); if (c.s !== onNow) { onNow = c.s; slots(); } }, 30e3);
  $('#days').onclick = e => { const b = e.target.closest('button'); if (!b) return; sel = +b.dataset.d; days(); slots(); };
  days(); slots();
  $('#slots').addEventListener('click', e => { const b = e.target.closest('[data-rem]'); if (!b) return; const [n, t, d] = b.dataset.rem.split('|'); const gc = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(n + ' on Inspire FM')}&details=${encodeURIComponent('Listen live on 105.1 FM or inspirefm.org')}&recur=RRULE:FREQ%3DWEEKLY`; modal(`<h3 style="font-size:1.5rem;margin-bottom:8px">${esc(n)}</h3><p style="color:var(--char)">${esc(d)} at ${esc(t)} on Inspire FM 105.1.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn g" href="${gc}" target="_blank" rel="noopener">${I('calendar')}Add to Google Calendar</a><a class="btn ghost" href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent('Salaam! Looking forward to ' + n + ' on ' + d + '.')}" target="_blank" rel="noopener">${I('whatsapp')}Message the show</a></div>`); });
  const cats = ['All', ...new Set(Object.values(D.shows).map(s => s.c))]; let sc = 'All';
  const pres = [...new Set(Object.values(D.shows).flatMap(s => s.p || []))].sort((a, b) => a.replace(/^(Sister|Brother|Imaam|Sheikh|Dr) /, '').localeCompare(b.replace(/^(Sister|Brother|Imaam|Sheikh|Dr) /, ''))); let sp = 'All';
  const shows = () => { $('#showFilt').innerHTML = cats.map(c => `<button type="button" aria-pressed="${c === sc}" data-c="${c}">${c}</button>`).join(''); $('#presFilt').innerHTML = `<label for="presSel">Presenter</label><select id="presSel"><option value="All">All presenters</option>${pres.map(p => `<option${p === sp ? ' selected' : ''}>${esc(p)}</option>`).join('')}</select>${sp !== 'All' ? '<button type="button" id="presClr">Clear</button>' : ''}`; const list = Object.entries(D.shows).filter(([, s]) => (sc === 'All' || s.c === sc) && (sp === 'All' || (s.p || []).includes(sp))); $('#showGrid').innerHTML = (list.length ? '' : '<p style="color:var(--mut)">No shows match. Try another category or presenter.</p>') + list.map(([id, s]) => { const slots_ = []; D.week.forEach((d, i) => d.forEach(x => { if (x[2] === id) slots_.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]); })); const when = D.week.flat().find(x => x[2] === id); return `<button class="showc" type="button" data-show="${id}"><div class="art${s.logo ? ' lg' : ''}" style="--a:${s.g[0]};--b:${s.g[1]}${artBg(s)}"></div><div class="bd"><span class="chip">${esc(s.c)}</span><h4 style="margin-top:8px">${esc(s.n)}</h4>${who(s) ? `<p class="who">with ${esc(who(s))}</p>` : ''}<p>${esc(s.d)}</p><p style="color:var(--mut);font-size:.8rem">${when ? ([...new Set(slots_)].length === 7 ? 'Daily' : [...new Set(slots_)].join(', ')) + ' · ' + H(when[0]) : 'Podcast · listen any time'}</p></div></button>`; }).join(''); };
  $('#showFilt').onclick = e => { const b = e.target.closest('button'); if (b) { sc = b.dataset.c; shows(); } };
  $('#presFilt').onchange = e => { if (e.target.id === 'presSel') { sp = e.target.value; shows(); } };
  $('#presFilt').onclick = e => { if (e.target.id === 'presClr') { sp = 'All'; shows(); } };
  $('#mBody').addEventListener('click', e => { const b = e.target.closest('[data-pres]'); if (!b) return; sp = b.dataset.pres; sc = 'All'; closeModal(); shows(); const g = $('#presFilt'); g && g.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  shows();
  $('#showGrid').onclick = e => { const b = e.target.closest('[data-show]'); if (!b) return; const s = D.shows[b.dataset.show]; const eps = D.pods.map((p, i) => [p, i]).filter(([p]) => p.s === b.dataset.show); modal(`<div style="height:${s.img ? 200 : 140}px;border-radius:18px;background:${grad(s)};margin-bottom:16px"></div><span class="chip">${esc(s.c)}</span><h3 style="font-size:1.7rem;margin:10px 0 6px">${esc(s.n)}</h3><p style="color:var(--char)">${esc(s.d)}</p>${who(s) ? `<div class="presby"><span>Presented by</span>${s.p.map(n => `<button type="button" class="presc" data-pres="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}${eps.length ? `<b style="font-family:var(--display)">Latest episodes</b><div style="display:grid;gap:8px;margin-top:8px">${eps.map(([p, i]) => `<button class="cal" style="justify-content:flex-start;border-radius:12px;padding:10px 12px" type="button" data-pod="${i}">${I('play')}${esc(p.t)} · ${esc(p.len)}</button>`).join('')}</div>` : ''}`); };
  const pc = ['All', ...new Set(D.pods.map(p => p.c))]; let pcs = 'All';
  const latest = () => { const seen = new Set(); $('#podLatest').innerHTML = D.pods.map((p, i) => [p, i]).sort((a, b) => (b[0].ds || '').localeCompare(a[0].ds || '')).filter(([p]) => !seen.has(p.s) && seen.add(p.s)).map(([p, i]) => podCard(p, i).replace('class="pod"', 'class="pod" style="width:auto"')).join(''); }; latest();
  const pods = () => { $('#podFilt').innerHTML = pc.map(c => `<button type="button" aria-pressed="${c === pcs}" data-c="${c}">${c}</button>`).join(''); $('#podGrid').innerHTML = D.pods.map((p, i) => [p, i]).filter(([p]) => pcs === 'All' || p.c === pcs).map(([p, i]) => podCard(p, i).replace('class="pod"', 'class="pod" style="width:auto"')).join(''); };
  $('#podFilt').onclick = e => { const b = e.target.closest('button'); if (b) { pcs = b.dataset.c; pods(); } }; pods();
}
function initWatch() {
  paintReels(); rail($('#reelRail2'));
  const cats = ['All', ...new Set(D.videos.map(v => v.c))]; let c = 'All';
  const pal = ['#1d2d28,#a4a3a1', '#212630,#ab8f62', '#364c52,#99b7b3', '#463b5c,#bbb191', '#493441,#d6bfb3', '#222324,#a4a3a1'];
  const r = () => { $('#vidFilt').innerHTML = cats.map(x => `<button type="button" aria-pressed="${x === c}" data-c="${x}">${x}</button>`).join(''); $('#vidGrid').innerHTML = D.videos.filter(v => c === 'All' || v.c === c).map((v, i) => { const g = pal[i % pal.length].split(','); return `<a class="showc" href="${D.social.youtube}" target="_blank" rel="noopener" style="text-decoration:none"><div class="art" style="--a:${g[0]};--b:${g[1]};aspect-ratio:16/9;display:grid;place-items:center"><span style="position:relative;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.9);color:#111;display:grid;place-items:center">${I('play')}</span><span style="position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.6);color:#fff;font-size:.75rem;border-radius:6px;padding:2px 7px">${esc(v.len)}</span></div><div class="bd"><span class="chip">${esc(v.c)}</span><h4 style="margin-top:8px">${esc(v.t)}</h4></div></a>`; }).join(''); };
  $('#vidFilt').onclick = e => { const b = e.target.closest('button'); if (b) { c = b.dataset.c; r(); } }; r();
}

/* ================= DUAS / QURAN / SEASONS ================= */
function initDuas() {
  let cat = 'all', q = '';
  $('#duaFilt').innerHTML = [['all', 'All']].concat(D.duaCats).map(([k, n]) => `<button type="button" data-c="${k}" aria-pressed="${k === 'all'}">${n}</button>`).join('');
  const r = () => { const L = D.duas.filter(d => (cat === 'all' || d.c === cat) && (!q || (d.t + d.en + d.tr + d.c).toLowerCase().includes(q))); $('#duaList').innerHTML = L.length ? L.map(d => `<article class="dua reveal"><span class="chip">${esc(D.duaCats.find(c => c[0] === d.c)[1])}</span><h4>${esc(d.t)}</h4><p class="ar" lang="ar">${d.ar}</p><p class="trn">${esc(d.tr)}</p><p class="en">${esc(d.en)}</p><div class="src"><span>${esc(d.src)}</span><div><button type="button" data-say="${esc(d.en)}">${I('speak')}Listen</button><button type="button" class="bm ${store.get('duaBm', []).includes(D.duas.indexOf(d)) ? 'on' : ''}" data-bm="${D.duas.indexOf(d)}">${store.get('duaBm', []).includes(D.duas.indexOf(d)) ? 'Saved' : 'Save'}</button><button type="button" data-cp="${D.duas.indexOf(d)}">${I('copy')}Copy</button></div></div></article>`).join('') : '<div class="hf-empty">No duas match that. Try another word.</div>'; observeReveal(); };
  $('#duaFilt').onclick = e => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; $$('#duaFilt button').forEach(x => x.setAttribute('aria-pressed', x === b)); r(); };
  $('#duaQ').oninput = e => { q = e.target.value.toLowerCase().trim(); r(); };
  $('#duaList').onclick = e => { const c = e.target.closest('[data-cp]'); if (c) { const d = D.duas[+c.dataset.cp]; copy(`${d.t}\n\n${d.ar}\n\n${d.tr}\n\n“${d.en}”\n(${d.src})\n\nShared from Inspire FM 105.1 · inspirefm.org/duas`, 'Dua copied'); } const s = e.target.closest('[data-say]'); if (s) speak(s.dataset.say);
    const b = e.target.closest('[data-bm]'); if (b) { const i = +b.dataset.bm; let L = store.get('duaBm', []); L = L.includes(i) ? L.filter(x => x !== i) : [i, ...L]; store.set('duaBm', L); b.classList.toggle('on', L.includes(i)); b.textContent = L.includes(i) ? 'Saved' : 'Save'; toast(L.includes(i) ? 'Saved to your Toolbox' : 'Removed'); }
    const any = e.target.closest('[data-cp],[data-say]'); if (any) { const i = +(any.dataset.cp || D.duas.findIndex(x => x.en === any.dataset.say)); let R = store.get('duaRc', []).filter(x => x !== i); R.unshift(i); store.set('duaRc', R.slice(0, 8)); } };
  r();
}
function initQuran() {
  /* Quran: a reader for all 114 surahs inside the app. Arabic (Uthmani), English (Sahih International) and transliteration
     come from the free alquran.cloud service and are kept on the phone after the first open; recitation by Mishary Alafasy.
     Continue where you left off, quick picks for the surahs people read most, a daily reading goal and bookmarks. */
  const root = $('#qReader'); if (!root || root.dataset.v2) return; root.dataset.v2 = 1;
  const S = D.surahs.split(';').map((x, i) => { const [n, e, a] = x.split('|'); return { i: i + 1, n, e, a: +a }; });
  const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const goalMin = 5; let secs = store.get('qGoal_' + dkey(new Date()), 0);
  const pos = () => store.get('qPos', { s: 1, a: 1 });
  const PICK = [[18, 'Al-Kahf', 'Friday sunnah', 1], [36, 'Ya-Sin', 'The heart of the Quran', 1], [67, 'Al-Mulk', 'Before you sleep', 1], [2, 'Ayat al-Kursi', 'Al-Baqarah 255', 255], [56, "Al-Waqi'ah", 'Read in the evening', 1], [112, 'The last three', 'Al-Ikhlas, Al-Falaq, An-Nas', 1], [55, 'Ar-Rahman', 'The Most Merciful', 1], [2, 'Last of Al-Baqarah', 'Ayahs 285 and 286 at night', 285]];
  const fri = new Date().getDay() === 5;
  const star = (n, cls = '') => `<span class="q2-no ${cls}"><svg viewBox="0 0 40 40"><path d="M20 2l5.3 5.9 7.9-.6.6 7.9L39.7 20l-5.9 5.3.6 7.9-7.9.6L20 38l-5.3-5.9-7.9.6-.6-7.9L.3 20l5.9-5.3-.6-7.9 7.9-.6z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><b>${n}</b></span>`;
  const home = () => { const p = pos(), s = S[p.s - 1], pct = Math.round((p.a - 1) / s.a * 100), gp = Math.min(1, secs / (goalMin * 60));
    root.innerHTML = `<div class="q2">
      <button type="button" class="q2-hero" data-open="${p.s}" data-at="${p.a}"><span class="q2-hpat" aria-hidden="true"></span><span class="q2-htx"><small>${store.get('qPos', null) ? 'Continue reading' : 'Start here'}</small><b>${esc(s.n)}</b><em>${esc(s.e)} · ayah ${p.a} of ${s.a}</em><i class="q2-bar"><u style="width:${pct}%"></u></i><span class="q2-go">${I('play')}${store.get('qPos', null) ? 'Continue' : 'Start reading'}</span></span>
        <span class="q2-ring" style="--p:${gp}"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/><circle cx="18" cy="18" r="15.5" fill="none" stroke="#c2d0ac" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="${gp * 100} 100" transform="rotate(-90 18 18)"/></svg><b>${Math.floor(secs / 60)}<small>/${goalMin} min</small></b><em>today</em></span></button>
      <h3 class="q2-h">Read today</h3><div class="q2-picks" data-noswipe>${PICK.map(([n, t, d, a]) => `<button type="button" class="q2-pick${fri && n === 18 ? ' hot' : ''}" data-open="${n}" data-at="${a}"><b>${esc(t)}</b><small>${fri && n === 18 ? 'It’s Friday · read it today' : esc(d)}</small></button>`).join('')}</div>
      ${store.get('qBm', []).length ? `<h3 class="q2-h">Bookmarks</h3><div class="q2-picks" data-noswipe>${store.get('qBm', []).map(([n, a]) => `<button type="button" class="q2-pick bm" data-open="${n}" data-at="${a}"><b>${esc(S[n - 1].n)} ${a}</b><small>${esc(S[n - 1].e)}</small></button>`).join('')}</div>` : ''}
      <div class="q2-lh"><h3 class="q2-h">All 114 surahs</h3><div class="q2-seg" role="group" aria-label="Show" data-nodd><button type="button" data-f="all" aria-pressed="true">All</button><button type="button" data-f="short" aria-pressed="false">Short</button><button type="button" data-f="j30" aria-pressed="false">Juz 30</button></div></div>
      <div class="q2-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" id="q2Q" placeholder="Search by name, meaning or number" aria-label="Search surahs"></div>
      <div class="q2-list" id="q2L"></div></div>`;
    let f = 'all';
    const list = () => { const q = ($('#q2Q').value || '').toLowerCase().trim(); const L = S.filter(s => (f === 'all' || (f === 'short' && s.a <= 20) || (f === 'j30' && s.i >= 78)) && (!q || (s.i + ' ' + s.n + ' ' + s.e).toLowerCase().includes(q)));
      $('#q2L').innerHTML = L.length ? L.map(s => `<button type="button" class="q2-s" data-open="${s.i}">${star(s.i)}<span><b>${esc(s.n)}</b><small>${esc(s.e)}</small></span><em>${s.a} ayahs</em></button>`).join('') : '<p class="q2-empty">No surah matches that.</p>'; };
    $('#q2Q').oninput = list; root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { f = b.dataset.f; root.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b)); list(); });
    list(); };
  root.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) openR(+o.dataset.open, +(o.dataset.at || 1)); });
  /* ---------- reader ---------- */
  const R = document.createElement('div'); R.className = 'q2r'; R.hidden = true; R.setAttribute('role', 'dialog'); R.setAttribute('aria-modal', 'true'); document.body.appendChild(R);
  const opt = () => Object.assign({ th: 'paper', sz: 2, tr: true, tl: false }, store.get('qOpt', {}));
  const SZ = [1.5, 1.75, 2, 2.35, 2.7];
  const audio = new Audio(); audio.preload = 'none'; let cur = null, playing = -1, timer = 0;
  const load = async n => { const k = 'q2_' + n, c = store.get(k, null); if (c) return c;
    const r = await fetch(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,en.sahih,en.transliteration`); const j = await r.json(); if (j.code !== 200) throw 0;
    const [a, e, t] = j.data; const d = { n, name: a.name, en: a.englishName, mean: a.englishNameTranslation, rev: a.revelationType, ay: a.ayahs.map((x, i) => ({ g: x.number, a: x.text, e: e.ayahs[i].text, t: t.ayahs[i].text })) };
    if (n !== 1 && n !== 9 && d.ay[0]) { const w = d.ay[0].a.split(' '); if (/^بِسْمِ/.test(w[0])) d.ay[0].a = w.slice(4).join(' '); }
    try { store.set(k, d); } catch (er) {} return d; };
  const fallback = n => { const f = D.quranFeatured.find(x => x.s === n); if (!f) return null; return { n, name: '', en: f.n, mean: S[n - 1].e, rev: '', off: 1, ay: f.ar.split('۝').map(x => x.trim()).filter(Boolean).map((a, i) => ({ g: 0, a, e: '', t: '' })) }; };
  async function openR(n, at = 1) { const s = S[n - 1]; stop(); const o = opt();
    R.innerHTML = `<div class="q2r-bar"><button type="button" class="q2r-x" data-q="close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button><span><b>${esc(s.n)}</b><small id="q2rPos">${s.a} ayahs</small></span><button type="button" class="q2r-x" data-q="opts" aria-label="Reading settings"><b style="font-family:var(--display)">Aa</b></button></div>
      <div class="q2r-body ${o.th}" id="q2rB" style="--qsz:${SZ[o.sz]}rem"><div class="q2r-load"><i></i><i></i><i></i><p>Opening ${esc(s.n)}…</p></div></div>
      <div class="q2r-play"><button type="button" data-q="prev" aria-label="Previous ayah"><svg viewBox="0 0 24 24"><path d="M7 6v12M19 6l-9 6 9 6z" fill="currentColor"/></svg></button><button type="button" class="pp" data-q="pp" aria-label="Play">${I('play')}</button><button type="button" data-q="next" aria-label="Next ayah"><svg viewBox="0 0 24 24"><path d="M17 6v12M5 6l9 6-9 6z" fill="currentColor"/></svg></button><span id="q2rNow">Recited by Mishary Alafasy</span></div>`;
    R.hidden = false; requestAnimationFrame(() => R.classList.add('on')); document.body.classList.add('lock');
    let d; try { d = await load(n); } catch (e) { d = fallback(n); }
    const B = $('#q2rB'); if (!B) return;
    if (!d) { B.innerHTML = `<div class="q2r-off"><b>You’re offline</b><p>${esc(s.n)} needs the internet the first time you open it. After that it’s saved on your phone.</p><button type="button" class="btn g sm" data-q="retry">Try again</button></div>`; R.onclick2 = () => openR(n, at); return; }
    cur = d; store.set('qLast', s.n);
    B.innerHTML = `<div class="q2r-head"><svg class="q2r-orn" viewBox="0 0 300 70" aria-hidden="true"><path d="M10 35h70M220 35h70" stroke="currentColor" stroke-width="1"/><path d="M80 35q20-30 70-30t70 30q-20 30-70 30T80 35z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M86 35q18-24 64-24t64 24q-18 24-64 24T86 35z" fill="none" stroke="currentColor" stroke-width=".6"/><circle cx="10" cy="35" r="3" fill="currentColor"/><circle cx="290" cy="35" r="3" fill="currentColor"/></svg>
      <b class="q2r-ar" lang="ar">${esc(d.name || s.n)}</b><small>${esc(s.n)} · ${esc(s.e)}${d.rev ? ' · ' + (d.rev === 'Meccan' ? 'Makki' : 'Madani') : ''} · ${s.a} ayahs</small></div>
      ${n !== 1 && n !== 9 ? `<p class="q2r-bis" lang="ar">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>` : ''}
      ${d.off ? '<p class="q2r-note">Showing the Arabic saved in the app. Connect to the internet for the translation and recitation.</p>' : ''}
      ${d.ay.map((x, i) => `<div class="q2r-ay" data-i="${i}" id="q2a${i + 1}"><p class="a" lang="ar">${esc(x.a)} <span class="m">﴿${AR(i + 1)}﴾</span></p>${o.tl && x.t ? `<p class="t">${esc(x.t)}</p>` : ''}${o.tr && x.e ? `<p class="e"><b>${i + 1}</b>${esc(x.e)}</p>` : ''}<div class="q2r-act"><button type="button" data-q="pay" data-i="${i}">${I('play')}Play</button><button type="button" data-q="bm" data-i="${i}">${(store.get('qBm', []).some(b => b[0] === n && b[1] === i + 1)) ? 'Bookmarked' : 'Bookmark'}</button><button type="button" data-q="share" data-i="${i}">Share</button></div></div>`).join('')}
      <div class="q2r-end"><b>${esc(s.n)} complete</b>${n < 114 ? `<button type="button" class="btn g sm" data-q="nexts">Next: ${esc(S[n].n)}</button>` : ''}</div>`;
    const el = $('#q2a' + at); if (el && at > 1) setTimeout(() => el.scrollIntoView({ block: 'start' }), 60); else B.scrollTop = 0;
    timer = setInterval(() => { if (R.hidden || document.hidden) return; secs++; if (secs % 10 === 0) store.set('qGoal_' + dkey(new Date()), secs); if (secs === goalMin * 60) toast('Reading goal reached today. MashaAllah!'); }, 1000);
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { const i = +en.target.dataset.i; store.set('qPos', { s: n, a: i + 1 }); const p = $('#q2rPos'); if (p) p.textContent = `Ayah ${i + 1} of ${s.a}`; } }), { root: B, rootMargin: '0px 0px -70% 0px' });
    B.querySelectorAll('.q2r-ay').forEach(a => io.observe(a)); R._io = io; }
  const play = i => { if (!cur || !cur.ay[i] || !cur.ay[i].g) { toast('Recitation needs the internet'); return; } playing = i; audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${cur.ay[i].g}.mp3`; audio.play().catch(() => toast('Tap play again to start the recitation'));
    R.querySelectorAll('.q2r-ay.on').forEach(x => x.classList.remove('on')); const el = $('#q2a' + (i + 1)); if (el) { el.classList.add('on'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } ppUI(); };
  const stop = () => { audio.pause(); playing = -1; ppUI(); };
  const ppUI = () => { const b = R.querySelector('.pp'); if (b) { b.innerHTML = !audio.paused && playing >= 0 ? '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>' : I('play'); } const t = $('#q2rNow'); if (t) t.textContent = playing >= 0 ? `Ayah ${playing + 1} · Mishary Alafasy` : 'Recited by Mishary Alafasy'; };
  audio.addEventListener('ended', () => { if (cur && playing + 1 < cur.ay.length) play(playing + 1); else { stop(); R.querySelectorAll('.q2r-ay.on').forEach(x => x.classList.remove('on')); } });
  audio.addEventListener('pause', ppUI); audio.addEventListener('play', ppUI);
  const close = () => { stop(); clearInterval(timer); if (R._io) R._io.disconnect(); R.classList.remove('on'); document.body.classList.remove('lock'); setTimeout(() => { R.hidden = true; R.innerHTML = ''; }, 300); home(); };
  R.addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) { const ay = e.target.closest('.q2r-ay'); if (ay) { R.querySelectorAll('.q2r-ay.sel').forEach(x => x !== ay && x.classList.remove('sel')); ay.classList.toggle('sel'); } return; }
    const q = b.dataset.q, i = +b.dataset.i;
    if (q === 'close') close(); else if (q === 'retry') R.onclick2 && R.onclick2();
    else if (q === 'pp') { if (!audio.paused) audio.pause(); else if (playing >= 0) audio.play(); else play(Math.max(0, pos().s === (cur && cur.n) ? pos().a - 1 : 0)); }
    else if (q === 'next') play(Math.min((cur ? cur.ay.length : 1) - 1, playing + 1)); else if (q === 'prev') play(Math.max(0, playing - 1));
    else if (q === 'pay') play(i);
    else if (q === 'bm') { let L = store.get('qBm', []); const k = [cur.n, i + 1], has = L.some(x => x[0] === k[0] && x[1] === k[1]); L = has ? L.filter(x => !(x[0] === k[0] && x[1] === k[1])) : [k].concat(L).slice(0, 12); store.set('qBm', L); b.textContent = has ? 'Bookmark' : 'Bookmarked'; toast(has ? 'Bookmark removed' : 'Bookmarked'); }
    else if (q === 'share') { const x = cur.ay[i], s = S[cur.n - 1], txt = `${x.a}\n\n“${x.e}”\n(Quran ${cur.n}:${i + 1}, ${s.n})\n\nShared from the Inspire FM app`; if (navigator.share) navigator.share({ text: txt }).catch(() => {}); else copy(txt, 'Ayah copied'); }
    else if (q === 'nexts') openR(cur.n + 1, 1);
    else if (q === 'opts') { const o = opt(); modal(`<div class="q2o"><h3>Reading settings</h3><b>Page</b><div class="q2o-th">${[['paper', 'Paper'], ['modern', 'Light'], ['dark', 'Night']].map(([k, t]) => `<button type="button" data-th="${k}" class="${k}" aria-pressed="${o.th === k}"><span lang="ar">بِسْمِ</span>${t}</button>`).join('')}</div>
        <b>Arabic size</b><div class="q2o-sz"><button type="button" data-sz="-1" aria-label="Smaller">A−</button><span lang="ar" style="font-size:${SZ[o.sz]}rem">ٱلْحَمْدُ</span><button type="button" data-sz="1" aria-label="Bigger">A+</button></div>
        <label class="q2o-sw"><input type="checkbox" id="q2oTr" ${o.tr ? 'checked' : ''}> English translation</label><label class="q2o-sw"><input type="checkbox" id="q2oTl" ${o.tl ? 'checked' : ''}> Transliteration (how to say it)</label></div>`);
      const save = () => { store.set('qOpt', o); const B = $('#q2rB'); if (B) { B.className = 'q2r-body ' + o.th; B.style.setProperty('--qsz', SZ[o.sz] + 'rem'); } };
      document.querySelectorAll('.q2o [data-th]').forEach(x => x.onclick = () => { o.th = x.dataset.th; document.querySelectorAll('.q2o [data-th]').forEach(y => y.setAttribute('aria-pressed', y === x)); save(); });
      document.querySelectorAll('.q2o [data-sz]').forEach(x => x.onclick = () => { o.sz = Math.max(0, Math.min(4, o.sz + +x.dataset.sz)); document.querySelector('.q2o-sz span').style.fontSize = SZ[o.sz] + 'rem'; save(); });
      const rer = () => { save(); const p = pos(); if (cur) openR(cur.n, p.s === cur.n ? p.a : 1); };
      $('#q2oTr').onchange = e => { o.tr = e.target.checked; rer(); }; $('#q2oTl').onchange = e => { o.tl = e.target.checked; rer(); }; } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !R.hidden) close(); });
  home();
}
function initSeasons() {
  const now = Date.now(), days = d => Math.max(0, Math.ceil((Date.parse(d) - now) / 864e5));
  const S = [
    { n: 'Ramadan 1448', when: '2027-02-08', bg: 'linear-gradient(160deg,#212630,#121519)', items: ['Daily suhur & iftar timetable for Luton', 'Taraweeh and khatam reminders', 'Let\'s Eat Together & the Big Iftar', 'Zakat calculator & fitrana'] },
    { n: 'Dhul Hijjah 1448', when: '2027-05-07', bg: 'linear-gradient(160deg,#2b251a,#594e35)', items: ['The best ten days: daily deeds', 'Day of Arafah fasting reminder', 'Qurbani: how and where to give', 'Inspire Eid al-Adha'] },
    { n: 'Rabi\' al-Awwal 1449', when: '2027-08-04', bg: 'linear-gradient(160deg,#1d2d28,#486449)', items: ['Seerah Stories series', 'Nasheed specials', 'Talks across Luton\'s masjids', 'Family activity packs'] }
  ];
  $('#seasonCards').innerHTML = S.map(s => `<article class="season reveal" style="background:${s.bg}"><span class="eyebrow" style="color:#fff">Seasonal hub</span><h3>${esc(s.n)}</h3><ul>${s.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul><div class="cd">${days(s.when)} days<small>Expected around ${new Date(s.when).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, subject to moon sighting</small></div></article>`).join('');
  observeReveal();
}

/* ================= COMMUNITY / NEWS / HELP / INVOLVED ================= */
const WO_SRC = [['LC', 'Luton Council events', 'luton.gov.uk · events & town-centre programme', 'https://www.luton.gov.uk/'], ['SF', 'Step Forward Luton', 'Town-wide what\'s on guide', 'https://www.luton.gov.uk/'], ['CT', 'The Culture Trust', 'Hat Factory, Wardown House, Stockwood', 'https://culturetrust.com/'], ['LP', 'Luton Point', 'Town-centre events', 'https://lutonpoint.co.uk/'], ['LT', 'Luton Library Theatre', 'Shows and community theatre', 'https://www.lutonlibrarytheatre.co.uk/'], ['GL', 'Grassroots Luton', 'Community news and events', 'https://www.grassrootsluton.org.uk/'], ['EB', 'Eventbrite & Skiddle', 'Ticketed events tagged Luton', 'https://www.eventbrite.co.uk/'], ['MQ', 'Luton masjids', 'Talks, classes and appeals from the Jummah list', '#jummah']];
/* real events from the halal outings list (outings-data.js), updated by SMR Digital by hand */
const WO_KIND = { talk: 'Talk', fun: 'Family', day: 'Day out' };
const WO_HUES = ['#463b5c', '#1d2d28', '#493441', '#212630', '#7b6d51', '#364c52'];
const woReal = () => ((window.IFM_OUT && IFM_OUT.HE) || []).filter(e => e.area !== 'far').map((e, i) => ({ id: 'he' + i, t: e.t, when: e.when, start: e.s, end: e.e || e.s, where: e.where + (e.area === 'near' ? ' (near Luton)' : ''), c: WO_KIND[e.k] || 'Community', d: e.d, cta: ['Details & tickets', e.url], hue: WO_HUES[i % WO_HUES.length], from: 'web', srcName: e.by }));
let evSubs = store.get('evsubs', []);
function initCommunity() {
  $('#srcList').innerHTML = WO_SRC.map(([k, n, d, u]) => `<a class="sr" href="${u}" ${u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><i>${k}</i><span><b>${esc(n)}</b><small>${esc(d)}</small></span></a>`).join('');
  let when = 'all', from = 'all', cat = 'All', q = '';
  const all = () => D.events.map(e => ({ ...e, from: 'inspire' })).concat(evSubs.map(e => ({ ...e, from: 'you', pending: true })), woReal()).filter((e, i, L) => L.findIndex(x => x.t.toLowerCase() === e.t.toLowerCase()) === i);
  const FROM = [['all', 'Everything'], ['inspire', 'Inspire FM'], ['web', 'Around Luton'], ['you', 'Listed by you']];
  const r = () => {
    const now = Date.now(), wk = now + 7 * 864e5, mo = now + 31 * 864e5;
    const L = all().filter(e => { const s = Date.parse(e.start), en = Date.parse(e.end || e.start) + 864e5; if (en < now) return false;
      if (when === 'week' && s > wk) return false; if (when === 'month' && s > mo) return false; if (when === 'later' && s <= mo) return false;
      return (from === 'all' || e.from === from) && (cat === 'All' || e.c === cat) && (!q || (e.t + e.d + e.where).toLowerCase().includes(q)); }).sort((x, y) => Date.parse(x.start) - Date.parse(y.start));
    const cats = ['All', ...new Set(all().map(e => e.c))];
    $('#woFrom').innerHTML = FROM.map(([k, n]) => `<button type="button" data-f="${k}" aria-pressed="${k === from}">${n}</button>`).join('');
    $('#evFilt').innerHTML = cats.map(x => `<button type="button" aria-pressed="${x === cat}" data-c="${x}">${x}</button>`).join('');
    $('#allEvents').innerHTML = L.length ? L.map(evCard).join('') : `<div class="hf-empty" style="grid-column:1/-1">Nothing listed for that yet. Know something that's on? <button class="btn sm g" type="button" data-addev>List it here</button></div>`;
    observeReveal(); };
  $('#woWhen').onclick = e => { const b = e.target.closest('button'); if (!b) return; when = b.dataset.w; $$('#woWhen button').forEach(x => x.setAttribute('aria-pressed', x === b)); r(); };
  $('#woFrom').onclick = e => { const b = e.target.closest('button'); if (b) { from = b.dataset.f; r(); } };
  $('#evFilt').onclick = e => { const b = e.target.closest('button'); if (b) { cat = b.dataset.c; r(); } };
  $('#woQ').oninput = e => { q = e.target.value.toLowerCase().trim(); r(); };
  window._woRender = r; r();
}
function addEventModal() {
  const tmin = new Date().toISOString().slice(0, 10);
  modal(`<span class="eyebrow">What's on in Luton</span><h3 style="font-size:1.6rem;margin:10px 0 4px">List your event</h3><p style="color:var(--char);margin:0 0 14px">Free for community groups, masjids, schools, charities and local businesses. We check every listing before it goes live, usually within a day.</p>
  <form class="form" id="evForm" style="padding:0;border:0" novalidate><label>Event name<input id="evT" maxlength="80"></label><div class="row"><label>Date<input type="date" id="evD" min="${tmin}"></label><label>Start time<input type="time" id="evTm"></label></div><div class="row"><label>Venue<input id="evV" placeholder="e.g. Hat Factory, Bute Street"></label><label>Postcode<input id="evP" autocapitalize="characters" maxlength="9"></label></div><div class="row"><label>Type<select id="evC"><option>Community</option><option>Faith</option><option>Family</option><option>Youth</option><option>Charity</option><option>Business</option><option>Sport</option><option>Arts & culture</option></select></label><label>Cost<select id="evCost"><option>Free</option><option>Paid</option><option>Donation</option></select></label></div><label>What's happening?<textarea id="evDesc" maxlength="400"></textarea></label><div class="row"><label>Organiser<input id="evO"></label><label>Contact (email or phone)<input id="evW"></label></div><label>Link for tickets or info (optional)<input id="evL" type="url" placeholder="https://"></label><label>Poster or photo (optional)<input id="evImg" type="file" accept="image/*"></label><label class="cons"><input type="checkbox" id="evOk"> This event is real, open to the public, and I'm allowed to share it. Inspire FM may edit the listing.</label><button class="btn g" type="submit">Send for review</button><div class="fmsg" role="status"></div></form>`);
  $('#evForm').onsubmit = e => { e.preventDefault(); const v = id => $('#' + id).value.trim(), out = $('#evForm .fmsg');
    const miss = [['evT', 'event name'], ['evD', 'date'], ['evV', 'venue'], ['evDesc', 'what\'s happening'], ['evW', 'contact']].find(([id]) => !v(id)); if (miss || !$('#evOk').checked) { out.className = 'fmsg on err'; out.textContent = miss ? `Please add the ${miss[1]}.` : 'Please tick the box to confirm.'; return; }
    const ev = { id: 'u' + Date.now(), t: v('evT'), when: new Date(v('evD')).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' }) + (v('evTm') ? ' · ' + h12(v('evTm')) : ''), start: v('evD'), end: v('evD'), where: v('evV') + (v('evP') ? ', ' + v('evP').toUpperCase() : ''), c: v('evC'), d: v('evDesc') + (v('evCost') !== 'Free' ? ` (${v('evCost')})` : ' (Free)'), cta: ['Details', 'community'], hue: '#496079', link: v('evL') };
    evSubs.push(ev); store.set('evsubs', evSubs);
    const body = `New What's on listing\n\n${ev.t}\n${ev.when}\n${ev.where}\nType: ${ev.c}\n${ev.d}\nOrganiser: ${v('evO')}\nContact: ${v('evW')}\nLink: ${v('evL') || '-'}`;
    out.className = 'fmsg on'; out.innerHTML = `<b>Thanks!</b> Your listing is waiting for review and shows as "Pending" on this device. On the live site it goes straight to the Inspire team's approval queue. For now, also <a href="mailto:${D.email}?subject=${encodeURIComponent('What\'s on listing: ' + ev.t)}&body=${encodeURIComponent(body)}">email it to us</a>${$('#evImg').files.length ? ' and attach your poster' : ''}.`;
    window._woRender && window._woRender(); };
}
document.addEventListener('click', e => { if (e.target.closest('#addEvBtn,[data-addev]')) addEventModal(); });
function initNews() { const N = D.news, cats = ['All', ...new Set(N.map(n => n.c))]; let c = 'All', q = ''; const r = () => { $('#newsFilt').innerHTML = cats.map(x => `<button type="button" aria-pressed="${x === c}" data-c="${x}">${x}</button>`).join(''); $('#allNews').innerHTML = N.map((n, i) => [n, i]).filter(([n]) => (c === 'All' || n.c === c) && (!q || (n.t + n.d).toLowerCase().includes(q))).map(([n, i]) => newsCard(n, i)).join('') || '<div class="hf-empty">No stories match.</div>'; observeReveal(); }; $('#newsFilt').onclick = e => { const b = e.target.closest('button'); if (b) { c = b.dataset.c; r(); } }; $('#allNews').onclick = e => { const a = e.target.closest('[data-nw]'); if (!a) return; e.preventDefault(); const n = N[+a.dataset.nw]; modal(`<h3 class="nw2-mh">${esc(n.t)}</h3><p class="nw2-md">${esc(n.d)}</p><p class="nw2-mk">Reported by ${n.src.length} sites</p><div class="nw2-v">${n.src.map(x => `<a href="${esc(x[1])}" target="_blank" rel="noopener">View on ${esc(x[0])}<svg><use href="#i-arrow"/></svg></a>`).join('')}</div>`); }; $('#newsQ').oninput = e => { q = e.target.value.toLowerCase(); r(); }; r(); }
function initHelp() { loadHelpData(); }
const OFFERS = { present: ['mic', 'Present or produce', 'Host a show, research guests, run the desk.'], news: ['book', 'Report & write', 'News, articles and community stories.'], film: ['video', 'Film & edit', 'Reels, events and YouTube.'], events: ['users', 'Events & stewarding', 'Inspire Eid, Big Iftar, collections.'], fund: ['heart', 'Fundraise', 'Jummah collections and appeals.'], tech: ['globe', 'Tech & web', 'Streaming, website and the app.'], biz: ['star', 'Sponsor as a business', 'Back a show, an appeal or Inspire Eid.'], other: ['chat', 'Something else', 'Tell us what you\'re good at.'] };
function formHelper(form, fields, subject, intro, onDone) {
  form.onsubmit = e => { e.preventDefault(); const out = $('.fmsg', form); const vals = fields.filter(([id]) => $('#' + id)).map(([id, label, req]) => { const el = $('#' + id); return [label, el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.value.trim(), req, el]; });
    const miss = vals.find(v => v[2] && (!v[1] || v[1] === 'No')); if (miss) { out.className = 'fmsg on err'; out.textContent = `Please fill in: ${miss[0].toLowerCase()}.`; miss[3].focus(); return; }
    const body = intro + '\n\n' + vals.filter(v => v[3].type !== 'checkbox').map(v => `${v[0]}: ${v[1] || '-'}`).join('\n');
    out.className = 'fmsg on'; out.innerHTML = `<b>Nearly done.</b> Your message is ready. Send it by email or WhatsApp, or copy it. On the live site this form sends straight to the Inspire FM team.<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><a class="btn sm g" href="mailto:${D.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">${I('mail')}Email it</a><a class="btn sm" href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener">${I('whatsapp')}WhatsApp</a><button class="btn sm ghost" type="button" data-copytext>${I('copy')}Copy</button></div><small style="display:block;margin-top:8px;color:var(--mut)">To: ${D.email} · ${D.whatsappLabel}</small>`;
    $('[data-copytext]', out).onclick = () => copy(body, 'Message copied'); onDone && onDone(); };
}
function initInvolved() {
  let sel = 'present'; const box = $('#invOffers');
  box.innerHTML = Object.entries(OFFERS).map(([k, [ic, t, d]]) => `<button class="offer" type="button" data-o="${k}" aria-pressed="${k === sel}"><i>${I(ic)}</i><b>${t}</b><span>${d}</span></button>`).join('');
  box.onclick = e => { const b = e.target.closest('[data-o]'); if (!b) return; sel = b.dataset.o; $$('.offer', box).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#invRole').value = OFFERS[sel][1]; $('#invForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  $('#invForm').innerHTML = `<b style="font-family:var(--display);font-size:1.3rem">Tell us about you</b><div class="row"><label>Your name<input id="invName" autocomplete="name"></label><label>Phone or email<input id="invWho"></label></div><div class="row"><label>I'd like to<input id="invRole" value="${OFFERS[sel][1]}"></label><label>When are you free?<select id="invWhen"><option>Weekday daytime</option><option>Weekday evenings</option><option>Weekends</option><option>Ramadan & Eid only</option><option>Flexible</option></select></label></div><label>Anything we should know? (experience, languages, ideas)<textarea id="invMsg"></textarea></label><label class="cons"><input type="checkbox" id="invOk"> I'm 16 or over (under-16s: ask a parent to get in touch) and happy for Inspire FM to contact me about volunteering.</label><button class="btn g" type="submit">Send</button><div class="fmsg" role="status"></div>`;
  formHelper($('#invForm'), [['invName', 'Name', 1], ['invWho', 'Contact', 1], ['invRole', 'Would like to', 0], ['invWhen', 'Available', 0], ['invMsg', 'About me', 0], ['invOk', 'Consent', 1]], 'Volunteering with Inspire FM', 'Salaam Inspire FM, I\'d like to get involved.');
  const Q = [['What would you most enjoy?', [['Talking and meeting people', 1], ['Making things look good', 2], ['Organising and helping on the day', 3], ['Writing and finding stories', 4]]]], map = { 1: 'present', 2: 'film', 3: 'events', 4: 'news' };
  $('#qzO').innerHTML = Q[0][1].map(([t, v]) => `<button type="button" data-v="${v}">${t}</button>`).join('');
  $('#qzO').onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = map[b.dataset.v]; $('#qzT').innerHTML = `You'd be great at <span style="color:var(--g)">${OFFERS[k][1].toLowerCase()}</span>.`; $('#qzO').innerHTML = `<button type="button" data-go="${k}">Yes, sign me up ›</button><button type="button" data-again>Start again</button>`; };
  $('#quiz').addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { const b = $(`#invOffers [data-o="${g.dataset.go}"]`); b.click(); } if (e.target.closest('[data-again]')) { inited.involved = 0; INIT.involved(); } });
}

/* ================= INSPIRE EID ================= */
function initEid() {
  const tgt = Date.parse('2027-02-08T00:00:00Z');
  const tick = () => { const s = Math.max(0, (tgt - Date.now()) / 1000); $('#eidCd').innerHTML = [['days', s / 86400], ['hours', s % 86400 / 3600], ['mins', s % 3600 / 60], ['secs', s % 60]].map(([n, v]) => `<div><b>${pad(Math.floor(v))}</b><span>${n}</span></div>`).join(''); };
  tick(); setInterval(tick, 1000); $('#eidCdNote').textContent = 'Countdown to Ramadan 1448 (expected around 8 February 2027). Inspire Eid follows at the end of the month.';
  const TL = [['May 2022', 'Back after the pandemic', 'Inspire Eid returned to Lewsey Park for Eid al-Fitr after a two-year gap, with Luton Sixth Form College and Barnfield College.'], ['July 2022', 'Eid al-Adha for every family', 'A two-day festival at Lewsey Park. Children from refugee families came as guests with The Raise Up Foundation.'], ['April 2023', 'The region\'s largest community Eid', 'Thousands at Lewsey Park, both Luton MPs on site and coverage on BBC Look East.'], ['June 2023', 'Eid al-Adha at Lewsey Park', 'Two days of affordable rides, food and family entertainment.'], ['April 2024', '40,000+ visitors', 'Our biggest yet, with free ride vouchers for families through the Every Child Smiles project with Luton Foodbank and schools.'], ['2025', 'Stockwood Park', 'Inspire Eid moved to Stockwood Park as the festival kept growing.'], ['2027', 'What\'s next', 'We\'re working with Luton Council on a safe, well-run festival. Register your interest and we\'ll tell you first.']];
  $('#eidTl').innerHTML = TL.map(([y, t, d]) => `<div class="tl reveal"><span class="y">${y}</span><h4>${t}</h4><p>${d}</p></div>`).join('');
  const OF = { stall: ['store', 'Book a stall', 'Food, retail, henna, kids\' activities'], sponsor: ['star', 'Sponsor', 'Stage, rides, zones or the whole festival'], volunteer: ['users', 'Volunteer', 'Stewards, info points, set-up'], vouchers: ['ticket', 'Ride vouchers', 'For schools and charities'] };
  let sel = 'stall';
  $('#eidOffers').innerHTML = Object.entries(OF).map(([k, [ic, t, d]]) => `<button class="offer" type="button" data-o="${k}" aria-pressed="${k === sel}"><i>${I(ic)}</i><b>${t}</b><span>${d}</span></button>`).join('');
  const form = () => { const extra = { stall: `<div class="row"><label>Stall type<select id="eT"><option>Hot food</option><option>Desserts & drinks</option><option>Clothing & retail</option><option>Henna & beauty</option><option>Kids' activity</option><option>Charity</option><option>Other</option></select></label><label>Pitch size<select id="eS"><option>3m × 3m gazebo</option><option>6m × 3m</option><option>Food van / trailer</option><option>Not sure</option></select></label></div><div class="row"><label>Do you need power?<select id="eP"><option>No</option><option>Yes, low (lights, card machine)</option><option>Yes, high (cooking)</option></select></label><label>Food hygiene rating (if food)<select id="eH"><option>Not food</option><option>5</option><option>4</option><option>3 or below</option><option>Awaiting inspection</option></select></label></div>`, sponsor: `<div class="row"><label>Interested in<select id="eT"><option>Headline sponsor</option><option>Stage sponsor</option><option>Funfair / rides</option><option>Every Child Smiles vouchers</option><option>Prayer area</option><option>Not sure, tell me the options</option></select></label><label>Budget (optional)<input id="eS" placeholder="e.g. £500"></label></div>`, volunteer: `<div class="row"><label>Role<select id="eT"><option>Steward</option><option>Info point</option><option>Set-up / pack-down</option><option>First aid (qualified)</option><option>Photography / filming</option></select></label><label>Age<select id="eS"><option>18+</option><option>16–17</option></select></label></div>`, vouchers: `<div class="row"><label>School or organisation<input id="eT"></label><label>Roughly how many children?<input id="eS" inputmode="numeric"></label></div>` }[sel];
    $('#eidForm').innerHTML = `<b style="font-family:var(--display);font-size:1.3rem">${OF[sel][1]} · Inspire Eid 2027</b><div class="row"><label>Your name<input id="eN" autocomplete="name"></label><label>Business / organisation<input id="eB"></label></div><div class="row"><label>Phone<input id="eP2" autocomplete="tel"></label><label>Email<input id="eE" type="email" autocomplete="email"></label></div>${extra}<label>Anything else?<textarea id="eM"></textarea></label><label class="cons"><input type="checkbox" id="eOk"> I understand this is a request, not a confirmed booking. Prices and the pitch plan are confirmed once the date is set.</label><button class="btn g" type="submit">Send request</button><div class="fmsg" role="status"></div>`;
    const ff = [['eN', 'Name', 1], ['eB', 'Organisation', 0], ['eP2', 'Phone', 1], ['eE', 'Email', 0]]; if ($('#eT')) ff.push(['eT', 'Type', 0]); if ($('#eS')) ff.push(['eS', 'Size / detail', 0]); if ($('#eP')) ff.push(['eP', 'Power', 0]); if ($('#eH')) ff.push(['eH', 'Hygiene rating', 0]); ff.push(['eM', 'Notes', 0], ['eOk', 'Agreed', 1]);
    formHelper($('#eidForm'), ff, `Inspire Eid 2027: ${OF[sel][1]}`, `Salaam Inspire FM, Inspire Eid 2027 request: ${OF[sel][1]}.`, burst); };
  $('#eidOffers').onclick = e => { const b = e.target.closest('[data-o]'); if (!b) return; sel = b.dataset.o; $$('#eidOffers .offer').forEach(x => x.setAttribute('aria-pressed', x === b)); form(); };
  if (!D.eidOpen) {
    $('#eidLockWrap').classList.add('locked'); $$('#eidOffers .offer').forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', 'false'); });
    $('#eidBookLead').textContent = 'Bookings for stalls, sponsors, volunteers and ride vouchers open as soon as the date and venue are confirmed.';
    const lk = $('#eidLock'); lk.hidden = false; lk.innerHTML = `<span class="lk">${I('lock')}</span><div><b>Opens when Inspire Eid 2027 is announced</b><p>We're waiting on the moon sighting and the council's event approval. Leave your details below and you'll be first to know.</p></div>`;
    $('#eidForm').innerHTML = `<b style="font-family:var(--display);font-size:1.3rem">Tell me when bookings open</b><div class="row"><label>Your name<input id="nN" autocomplete="name"></label><label>Email or WhatsApp number<input id="nW"></label></div><label>I'm interested in<select id="nI"><option>Booking a stall</option><option>Sponsoring</option><option>Volunteering</option><option>Ride vouchers for my school / charity</option><option>Just coming along</option></select></label><label class="cons"><input type="checkbox" id="nOk"> Inspire FM can contact me about Inspire Eid 2027.</label><button class="btn g" type="submit">${I('clock')}Notify me</button><div class="fmsg" role="status"></div>`;
    formHelper($('#eidForm'), [['nN', 'Name', 1], ['nW', 'Contact', 1], ['nI', 'Interested in', 0], ['nOk', 'Consent', 1]], 'Inspire Eid 2027: notify me', 'Salaam Inspire FM, please tell me when Inspire Eid 2027 bookings open.', burst);
  } else form();
  confetti(); observeReveal();
}
let burst = () => {};
function confetti() {
  const cv = $('#confetti'), c = cv.getContext('2d'); let P = [];
  const size = () => { cv.width = cv.clientWidth * 1.5; cv.height = cv.clientHeight * 1.5; }; size(); addEventListener('resize', size);
  const add = (n, y0) => { for (let i = 0; i < n; i++) P.push({ x: Math.random() * cv.width, y: y0 != null ? y0 : Math.random() * -cv.height, v: 1 + Math.random() * 2.2, r: Math.random() * 6.3, s: 5 + Math.random() * 7, c: ['#a4a3a1', '#bbb191', '#ffffff', '#bccba1'][i % 4], w: Math.random() * .04 }); };
  add(reduce ? 0 : 70); burst = () => { if (!reduce) add(120, -20); };
  const loop = () => { c.clearRect(0, 0, cv.width, cv.height); P.forEach(p => { p.y += p.v; p.x += Math.sin(p.r) * .6; p.r += p.w + .02; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.globalAlpha = .75; if (p.s > 9) { c.beginPath(); c.arc(0, 0, p.s / 3, 0, 7); c.fill(); } else c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); if (p.y > cv.height + 20) { p.y = -20; p.x = Math.random() * cv.width; } }); if (P.length > 200) P = P.slice(-200); if (!$('[data-page=eid]').hidden) requestAnimationFrame(loop); else setTimeout(() => requestAnimationFrame(loop), 800); };
  loop();
}

/* ================= GIVE ================= */
let viewEx = true, gType = 'zakat', apF = 'all';
function initGive() {
  /* appeal shown in full swing; SWAP the sample figures (11840 raised, impactExample, stories, feedback) for real ones */
  $('#gTypes').innerHTML = D.giveTypes.map(t => `<button class="gtype" type="button" data-g="${t.id}" aria-pressed="${t.id === gType}"><span class="ar" lang="ar">${t.ar}</span><b>${t.n}</b></button>`).join('');
  $('#gTypes').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; gType = b.dataset.g; $$('#gTypes .gtype').forEach(x => x.setAttribute('aria-pressed', x === b)); calc(); apF = gType === 'fitrana' || gType === 'fidya' ? 'all' : gType; renderAppeals(); };
  calc(); renderGive();
  $('#copyBank').onclick = () => copy('Inspire FM bank details will be added here at launch.', 'Copied');
  // wheel
  drawWheel(0); let rot = 0, spinning = false, range = 'small';
  $('#chRange').onclick = e => { const b = e.target.closest('button'); if (!b) return; range = b.dataset.r; $$('#chRange button').forEach(x => x.setAttribute('aria-pressed', x === b)); };
  $('#spinBtn').onclick = () => { if (spinning) return; spinning = true; const A = D.appeals, n = A.length, pick = Math.floor(Math.random() * n), seg = 360 / n; rot += 360 * 5 + (360 - (pick * seg + seg / 2)) - rot % 360; $('#wheel').style.transform = `rotate(${rot}deg)`;
    setTimeout(() => { spinning = false; const a = A[pick], amts = { small: [5, 10, 15, 20], mid: [20, 25, 50, 70], big: [70, 100, 150, 250] }[range], amt = amts[Math.floor(Math.random() * amts.length)];
      $('#chRes').innerHTML = `<div class="card"><span style="color:#acafab;font-size:.82rem">The wheel chose</span><div><b>£${amt}</b> for <b style="color:#fff">${esc(a.t)}</b></div><p style="color:#caccc9;margin:6px 0 12px">${esc(a.d)}${a.unit && amt >= a.unit[0] ? ` £${a.unit[0]} ${esc(a.unit[1])}.` : ''}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn g sm" href="${a.url}" ${a.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${I('heart')}Give £${amt}</a><button class="btn sm ghost" style="color:#fff" type="button" onclick="document.getElementById('spinBtn').click()">Spin again</button></div></div>`; burst(); }, reduce ? 50 : 4300); };
}
function drawWheel() {
  const cv = $('#wheel'), c = cv.getContext('2d'), A = D.appeals, n = A.length, R = 270, cx = 280, cy = 280, cols = ['#a4a3a1', '#2d2f30', '#7c7a78', '#3e4042', '#9eb084', '#252627', '#535250', '#343637'];
  c.clearRect(0, 0, 560, 560);
  A.forEach((a, i) => { const s = -Math.PI / 2 + i * 2 * Math.PI / n, e = s + 2 * Math.PI / n; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, s, e); c.closePath(); c.fillStyle = cols[i % cols.length]; c.fill(); c.strokeStyle = '#0f1113'; c.lineWidth = 3; c.stroke(); c.save(); c.translate(cx, cy); c.rotate(s + Math.PI / n); c.textAlign = 'right'; c.fillStyle = i % 2 ? '#fff' : '#151412'; c.font = '700 19px Saira'; const t = a.t.length > 20 ? a.t.slice(0, 19) + '…' : a.t; c.fillText(t, R - 20, 7); c.restore(); });
  c.beginPath(); c.arc(cx, cy, R, 0, 7); c.strokeStyle = '#a4a3a1'; c.lineWidth = 6; c.stroke();
  for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n; c.beginPath(); c.arc(cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8), 4, 0, 7); c.fillStyle = '#fff'; c.fill(); }
}
function calc() {
  const t = D.giveTypes.find(x => x.id === gType), box = $('#gCalc'), R = D.rates;
  let right = '';
  if (t.calc === 'zakat') right = `<div class="cf"><label>Cash (bank, home, wallets) £<input type="number" min="0" data-z="cash" inputmode="decimal"></label><label>Gold & silver value £<input type="number" min="0" data-z="gold"></label><label>Savings, ISAs, investments £<input type="number" min="0" data-z="inv"></label><label>Business stock & money owed to you £<input type="number" min="0" data-z="biz"></label><label>Debts due now (subtract) £<input type="number" min="0" data-z="debt"></label><label>Nisab basis<select data-z="basis"><option value="silver">Silver (612.36g) – recommended</option><option value="gold">Gold (87.48g)</option></select></label><label>Today's price per gram £<input type="number" min="0" step="0.01" data-z="price" placeholder="e.g. silver price"></label></div><div class="gres"><div><small>Your zakat</small><b id="zOut">£0.00</b><small id="zNisab">Enter today's price to check nisab</small></div><a class="btn g" href="#appeals" id="zGo">Give zakat</a></div><p style="font-size:.8rem">A guide only. For your own situation, ask a scholar.</p>`;
  else if (t.calc === 'fitrana') right = `<div class="cf"><label>People in your household<input type="number" min="1" value="4" data-f="n"></label><label>Amount per person £<input type="number" min="0" step="0.5" value="${R.fitrana}" data-f="r"></label></div><div class="gres"><div><small>Zakat al-Fitr to pay</small><b id="fOut">£0</b><small>Before Eid al-Fitr prayer</small></div><a class="btn g" href="#appeals">Pay fitrana</a></div><p style="font-size:.8rem">Rate set each year by the station's scholars; change it to match your masjid.</p>`;
  else if (t.calc === 'fidya') right = `<div class="cf"><label>Type<select data-f="t"><option value="fidya">Fidya (can't make up the fast)</option><option value="kaffarah">Kaffarah (broke a fast deliberately)</option></select></label><label>Number of fasts<input type="number" min="1" value="1" data-f="n"></label><label>Rate per fast £<input type="number" min="0" step="0.5" value="${R.fidyaDay}" data-f="r"></label></div><div class="gres"><div><small>Amount to pay</small><b id="fOut">£0</b><small id="fSub"></small></div><a class="btn g" href="#appeals">Pay now</a></div><p style="font-size:.8rem">Kaffarah is feeding 60 people for each fast. Rates are a guide; check with a scholar.</p>`;
  else right = `<div class="cf" style="grid-template-columns:1fr"><label>Choose an amount<div class="amts" style="margin:6px 0 0" id="sAmts">${[5, 10, 20, 50, 100].map(v => `<button type="button" data-v="${v}" class="${v === 20 ? 'on' : ''}">£${v}</button>`).join('')}</div></label></div><div class="gres"><div><small>Your ${esc(t.n.toLowerCase())}</small><b id="sOut">£20</b><small id="sSub">${t.id === 'jariyah' ? 'Keeps rewarding you for as long as it benefits people' : 'Every amount counts'}</small></div><a class="btn g" href="#appeals">See ${esc(t.n.toLowerCase())} appeals</a></div>`;
  box.innerHTML = `<div><span class="eyebrow">${esc(t.n)}</span><h3 style="margin-top:10px"><span lang="ar" style="font-family:var(--ar);color:var(--g);margin-right:10px">${t.ar}</span>${esc(t.n)}</h3><p>${esc(t.d)}</p><p style="font-size:.86rem">The appeals below are filtered to the ones that accept ${esc(t.n.toLowerCase())}.</p></div><div>${right}</div>`;
  const zk = () => { const g = k => +($(`[data-z="${k}"]`, box).value || 0); const net = g('cash') + g('gold') + g('inv') + g('biz') - g('debt'); const price = g('price'), basis = $('[data-z=basis]', box).value, nis = price ? price * (basis === 'gold' ? 87.48 : 612.36) : 0; const due = (!price || net >= nis) && net > 0 ? net * .025 : 0; $('#zOut').textContent = '£' + due.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); $('#zNisab').textContent = price ? (net >= nis ? `Above nisab (£${nis.toLocaleString('en-GB', { maximumFractionDigits: 0 })}): zakat is due` : `Below nisab (£${nis.toLocaleString('en-GB', { maximumFractionDigits: 0 })}): no zakat due`) : 'Enter today\'s price per gram to check nisab'; };
  const fk = () => { const n = +($('[data-f=n]', box).value || 0), r = +($('[data-f=r]', box).value || 0), ty = $('[data-f=t]', box); const tot = ty && ty.value === 'kaffarah' ? n * r * 60 : n * r; $('#fOut').textContent = '£' + tot.toLocaleString('en-GB'); if ($('#fSub')) $('#fSub').textContent = ty && ty.value === 'kaffarah' ? `${n * 60} meals: 60 people fed for each fast` : `${n} meal${n === 1 ? '' : 's'} for someone in need`; };
  box.oninput = box.onchange = () => { if (t.calc === 'zakat') zk(); else if (t.calc) fk(); };
  if (t.calc === 'zakat') zk(); else if (t.calc) fk();
  const sa = $('#sAmts', box); if (sa) sa.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', sa).forEach(x => x.classList.toggle('on', x === b)); $('#sOut').textContent = '£' + b.dataset.v; };
}
function renderAppeals() {
  const F = [['all', 'All'], ['local', 'In Luton'], ['intl', 'Worldwide'], ...D.giveTypes.filter(t => !t.calc || t.calc === 'zakat').map(t => [t.id, t.n])];
  $('#apFilt').innerHTML = F.map(([k, n]) => `<button type="button" data-f="${k}" aria-pressed="${k === apF}">${n}</button>`).join('');
  $('#apFilt').onclick = e => { const b = e.target.closest('button'); if (b) { apF = b.dataset.f; renderAppeals(); } };
  const L = D.appeals.filter(a => apF === 'all' || (apF === 'local' ? a.local : apF === 'intl' ? !a.local : a.types.includes(apF)));
  $('#apList').innerHTML = L.map(a => { const raised = a.target ? (viewEx && a.id === 'jwa' ? 11840 : a.raised) : 0, pct = a.target ? Math.min(100, raised / a.target * 100) : 0; const ext = a.url.startsWith('http');
    return `<article class="ap reveal"><div class="im ${a.img ? '' : 'art'}" style="${a.img ? `background-image:url(${a.img})` : `--a:${a.art[0]};--b:${a.art[1]}`}">${a.live ? '<span class="lvb">LIVE APPEAL</span>' : ''}<span class="org">${esc(a.org)} · ${esc(a.where)}</span></div><div><div class="tg">${a.types.map(t => `<span class="chip">${esc(D.giveTypes.find(g => g.id === t).n)}</span>`).join('')}${a.match ? `<span class="chip" style="background:#f3efe8;color:#5a4b30">${IFM_IC('sparkle')} ${esc(a.match)}</span>` : ''}${a.soon ? `<span class="chip" style="background:#eef1f5;color:#496079">${esc(a.soon)}</span>` : ''}</div><h3 style="margin-top:10px">${esc(a.t)}</h3><p>${esc(a.d)}</p>${a.target ? `<div class="meter"><i style="width:${Math.max(pct, raised ? 2 : 0)}%"></i></div><div class="mrow"><span><b>£${raised.toLocaleString('en-GB')}</b> raised</span><span>of £${a.target.toLocaleString('en-GB')}</span></div>` : ''}</div><div class="act">${a.unit ? `<div class="unit"><b>£${a.unit[0]}</b> ${esc(a.unit[1])}</div>` : ''}<a class="btn g" href="${a.url}" ${ext ? 'target="_blank" rel="noopener"' : ''}>${I('heart')}${ext ? 'Donate' : 'Get in touch'}</a><button class="btn ghost sm" type="button" data-shareap="${a.id}">${I('share')}Share</button></div></article>`; }).join('');
  observeReveal();
}
document.addEventListener('click', e => { const s = e.target.closest('[data-shareap]'); if (s) { const a = D.appeals.find(x => x.id === s.dataset.shareap); share({ title: a.t, text: `${a.t} (${a.org}): ${a.d} #LetsFeedLutonTogether`, url: a.url.startsWith('http') ? a.url : siteUrl('give') }); } });
let fbRate = 0;
function renderGive() {
  renderAppeals();
  const st = viewEx ? 3 : D.journeyStage;
  $('#journey').innerHTML = D.journey.map(([t, d], i) => `<div class="jst ${i < st ? 'done' : i === st ? 'cur' : ''}"><i>${i < st ? '✓' : i + 1}</i><b>${t}</b><small>${d}</small></div>`).join('');
  const im = viewEx ? D.impactExample : D.impactReal;
  if (im.people.length) { const mx = Math.max(...im.people), tot = im.people.reduce((a, b) => a + b, 0); $('#benTotal').innerHTML = `${tot.toLocaleString('en-GB')} people reached`; $('#benBars').innerHTML = im.people.map((p, i) => `<div title="${im.months[i]}: ${p} people, ${im.parcels[i]} parcels"><span style="height:${p / mx * 100}%"></span><small>${im.months[i]}</small></div>`).join(''); $('#benNote').textContent = viewEx ? 'Example figures to show the layout. Real numbers are added by staff each month.' : 'Updated monthly by the Inspire FM team.'; }
  else { $('#benTotal').textContent = 'Figures coming in'; $('#benBars').innerHTML = '<div class="empty">The first month\'s numbers appear here once the appeal\'s collections have been counted and delivered.</div>'; $('#benNote').textContent = 'Switch to the example view (top right) to see how it looks once the year fills up.'; }
  const now = Date.now();
  let nxt = D.collections.find(c => Date.parse(c[0] + 'T14:00:00Z') > now);
  $('#collCal').innerHTML = D.collections.map(([d, id]) => { const m = M.find(x => x.id === id), dt = new Date(d + 'T12:00:00Z'), past = Date.parse(d + 'T14:00:00Z') < now; return `<div class="cc ${past ? 'past' : ''} ${nxt && nxt[0] === d ? 'next' : ''}"><div class="d"><b>${dt.getUTCDate()}</b><small>${dt.toLocaleDateString('en-GB', { month: 'short' })}</small></div><div><b style="font-family:var(--display)">${esc(m ? m.n : id)}</b><div style="font-size:.8rem;color:var(--mut)">${m ? 'Jummah ' + m.j.map(h12).join(', ') : 'Luton'}${past ? ' · collected' : nxt && nxt[0] === d ? ' · next collection' : ''}</div></div>${m && LOGOFILES.has(m.id) ? `<img src="img/m/${m.id}.webp" alt="">` : ''}</div>`; }).join('') + `<p class="notice" style="margin:4px 0 0">More masjids are joining. Collections happen every Friday at participating masjids until 25 December.</p>`;
  const stories = D.stories.filter(s => viewEx || !s.example);
  $('#storyRail').innerHTML = stories.length ? stories.map(s => `<article class="story"><div class="im" style="background-image:url(${s.img})"><em>${esc(s.k)}</em></div><div class="bd"><h4>${esc(s.t)}</h4><p>${esc(s.d)}</p></div></article>`).join('') : `<div class="hf-empty" style="width:100%">Stories from this year's appeals are added here with photos as collections are delivered. <button class="btn sm" type="button" onclick="document.querySelector('#viewSeg [data-v=example]').click()">See an example</button></div>`; rail($('#storyRail'));
  const fbs = D.feedback.filter(f => viewEx || !f.example).concat(store.get('fb', []).filter(() => false));
  $('#fbSum').innerHTML = fbs.length ? `<b style="font-family:var(--display);font-size:2.4rem">${(fbs.reduce((a, f) => a + f.r, 0) / fbs.length).toFixed(1)}</b><span style="color:#a08c56;font-size:1.3rem">${IFM_IC('starf').repeat(5)}</span><span style="color:var(--mut)">${fbs.length} review${fbs.length === 1 ? '' : 's'}</span>` : '<span style="color:var(--mut)">No feedback published yet. Be the first: it\'s checked by our team before it appears.</span>';
  $('#fbWall').innerHTML = fbs.map(f => `<div class="fb"><span class="st">${IFM_IC('starf').repeat(f.r)}${IFM_IC('star').repeat(5 - f.r)}</span><p>${esc(f.t)}</p><small>${esc(f.n)} · ${esc(f.a)}</small></div>`).join('');
  $('#fbAppeal').innerHTML = D.appeals.map(a => `<option>${esc(a.t)}</option>`).join('');
  $('#fbStars').innerHTML = [1, 2, 3, 4, 5].map(i => `<button type="button" role="radio" aria-checked="${i === fbRate}" aria-label="${i} star${i > 1 ? 's' : ''}" data-s="${i}" class="${i <= fbRate ? 'on' : ''}">${IFM_IC('starf')}</button>`).join('');
  $('#fbStars').onclick = e => { const b = e.target.closest('button'); if (!b) return; fbRate = +b.dataset.s; $$('#fbStars button').forEach((x, i) => { x.classList.toggle('on', i < fbRate); x.setAttribute('aria-checked', i + 1 === fbRate); }); };
  if (!$('#fbForm')._b) { $('#fbForm')._b = 1; $('#fbForm').addEventListener('submit', e => { e.preventDefault(); const out = $('#fbMsg'); if (!fbRate || !$('#fbText').value.trim() || !$('#fbOk').checked) { out.className = 'fmsg on err'; out.textContent = 'Please add a star rating, your feedback and tick the box.'; return; } const body = `Donor feedback (${fbRate}/5) for ${$('#fbAppeal').value}\nFrom: ${$('#fbName').value || 'Anonymous'}\n\n${$('#fbText').value}`; out.className = 'fmsg on'; out.innerHTML = `JazakAllah khair! On the live site your feedback goes to our team to check before it's published. For now: <a href="mailto:${D.email}?subject=${encodeURIComponent('Donor feedback')}&body=${encodeURIComponent(body)}">email it to us</a> (${D.email}).`; }); }
  const pk = ['All', ...new Set(D.partners.map(p => p.k))]; let pc = $('#pFilt')._c || 'All';
  $('#pFilt').innerHTML = pk.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === pc}">${k}</button>`).join('');
  $('#pFilt').onclick = e => { const b = e.target.closest('button'); if (b) { $('#pFilt')._c = b.dataset.k; renderGive(); } };
  $('#partnerGrid').innerHTML = D.partners.filter(p => pc === 'All' || p.k === pc).map(p => `<div class="pcard">${p.logo ? `<div class="lg"><img src="${p.logo}" alt="${esc(p.n)}"></div>` : `<div class="lg"><span class="mono-p">${esc(p.n.split(/\s+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join(''))}</span></div>`}<span class="chip" style="align-self:flex-start">${esc(p.k)}</span><b style="font-family:var(--display);font-size:1.1rem">${esc(p.n)}</b><p>${esc(p.d)}</p>${p.url ? `<a class="more" href="${p.url}" target="_blank" rel="noopener">Visit ↗</a>` : ''}</div>`).join('');
}

/* ================= ADVERTISE: five-step booking ================= */
function initAdvertise() {
  const st = { step: 0, pk: new Set(['spot']), from: '', weeks: '4', biz: '', name: '', phone: '', email: '', web: '', msg: '', files: [] };
  const S = ['Choose package', 'Select dates', 'Your business', 'Upload assets', 'Review & submit'];
  const steps = () => { $('#adSteps').innerHTML = S.map((s, i) => `<span class="${i === st.step ? 'on' : i < st.step ? 'done' : ''}"><i>${i < st.step ? '✓' : i + 1}</i>${s}</span>`).join(''); };
  const nav = (back = true, next = 'Next') => `<div class="wiz-nav">${back ? `<button class="btn ghost" type="button" data-w="-1">${I('left')}Back</button>` : '<span></span>'}<button class="btn g" type="button" data-w="1">${next}${I('arrow')}</button></div>`;
  const tmin = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const views = [
    () => `<div class="pkgs">${D.packages.map(p => `<button class="pkg" type="button" data-pk="${p.id}" aria-pressed="${st.pk.has(p.id)}"><b>${p.n}</b><p>${p.d}</p><ul>${p.inc.map(x => `<li>${x}</li>`).join('')}</ul></button>`).join('')}</div><p class="notice">Choose as many as you like. Combine radio, digital and social for an integrated campaign: we'll suggest the best mix and price.</p>` + nav(false),
    () => `<div class="form"><div class="row"><label>Start date<input type="date" id="adFrom" min="${tmin}" value="${st.from}"></label><label>How long?<select id="adWeeks">${['1', '2', '4', '8', '12'].map(w => `<option ${w === st.weeks ? 'selected' : ''} value="${w}">${w} week${w === '1' ? '' : 's'}</option>`).join('')}<option value="ramadan" ${st.weeks === 'ramadan' ? 'selected' : ''}>All of Ramadan</option></select></label></div><p class="notice" style="margin:0">Ramadan and Eid weeks book up first. We'll confirm availability.</p></div>` + nav(),
    () => `<div class="form"><div class="row"><label>Business name<input id="adBiz" value="${esc(st.biz)}"></label><label>Your name<input id="adName" value="${esc(st.name)}" autocomplete="name"></label></div><div class="row"><label>Phone<input id="adPhone" value="${esc(st.phone)}" autocomplete="tel"></label><label>Email<input id="adEmail" type="email" value="${esc(st.email)}" autocomplete="email"></label></div><label>Website or social link<input id="adWeb" value="${esc(st.web)}"></label><label>What do you want to promote?<textarea id="adMsg">${esc(st.msg)}</textarea></label></div>` + nav(),
    () => `<div class="drop" id="adDrop"><b style="font-family:var(--display);color:var(--ink);font-size:1.15rem">Drop your logo, artwork or script here</b><p>Or <label style="color:var(--g3);font-weight:600;cursor:pointer;text-decoration:underline">choose files<input type="file" id="adFile" multiple hidden accept="image/*,.pdf,.doc,.docx,.mp3,.wav"></label>. Don't have any? We can make them for you.</p><div class="flist" id="adList">${st.files.map(f => `<span>${IFM_IC('clip')} ${esc(f.name)} · ${(f.size / 1024).toFixed(0)} KB</span>`).join('')}</div></div><label class="cons" style="margin-top:12px;display:flex;gap:8px"><input type="checkbox" id="adMake"> I'd like Inspire FM to write and voice my advert / make my reel</label>` + nav(),
    () => { const pk = D.packages.filter(p => st.pk.has(p.id)).map(p => p.n); return `<div class="form"><b style="font-family:var(--display);font-size:1.3rem">Your campaign</b><div class="ptable" style="padding:12px;gap:4px"><div class="prow"><span>Packages</span><span></span><b>${esc(pk.join(', ') || '–')}</b></div><div class="prow"><span>Starts</span><span></span><b>${st.from ? new Date(st.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible'}</b></div><div class="prow"><span>Length</span><span></span><b>${st.weeks === 'ramadan' ? 'All of Ramadan' : st.weeks + ' weeks'}</b></div><div class="prow"><span>Business</span><span></span><b>${esc(st.biz || '–')}</b></div><div class="prow"><span>Files</span><span></span><b>${st.files.length || 'None yet'}</b></div></div><p style="color:var(--char);margin:0">Next: our team reviews it and sends your plan and price within two working days. Once approved you pay online and your campaign moves through <b>Awaiting review → Approved → Scheduled → Live → Completed</b>, with updates by email.</p><label class="cons"><input type="checkbox" id="adOk"> I agree that adverts follow Ofcom's rules and Inspire FM's content standards.</label><div class="fmsg" id="adOut" role="status"></div></div>` + nav(true, 'Submit for review'); }
  ];
  const save = () => { const v = id => $('#' + id) ? $('#' + id).value : null; if (st.step === 1) { st.from = v('adFrom'); st.weeks = v('adWeeks'); } if (st.step === 2) { st.biz = v('adBiz'); st.name = v('adName'); st.phone = v('adPhone'); st.email = v('adEmail'); st.web = v('adWeb'); st.msg = v('adMsg'); } };
  const show = () => { steps(); $('#adWiz').innerHTML = views[st.step](); const dr = $('#adDrop'); if (dr) { const add = fl => { st.files.push(...fl); $('#adList').innerHTML = st.files.map(f => `<span>${IFM_IC('clip')} ${esc(f.name)} · ${(f.size / 1024).toFixed(0)} KB</span>`).join(''); }; $('#adFile').onchange = e => add([...e.target.files]); dr.ondragover = e => { e.preventDefault(); dr.classList.add('over'); }; dr.ondragleave = () => dr.classList.remove('over'); dr.ondrop = e => { e.preventDefault(); dr.classList.remove('over'); add([...e.dataTransfer.files]); }; } };
  $('#adWiz').addEventListener('click', e => { const p = e.target.closest('[data-pk]'); if (p) { const id = p.dataset.pk; st.pk.has(id) ? st.pk.delete(id) : st.pk.add(id); p.setAttribute('aria-pressed', st.pk.has(id)); return; }
    const w = e.target.closest('[data-w]'); if (!w) return; save(); const d = +w.dataset.w;
    if (d > 0 && st.step === 0 && !st.pk.size) { toast('Choose at least one package'); return; }
    if (d > 0 && st.step === 2 && (!st.biz || !(st.phone || st.email))) { toast('Add your business name and a phone or email'); return; }
    if (d > 0 && st.step === 4) { const out = $('#adOut'); if (!$('#adOk').checked) { out.className = 'fmsg on err'; out.textContent = 'Please tick the box to agree to the advertising standards.'; return; } const body = `Advertising request\n\nPackages: ${D.packages.filter(p => st.pk.has(p.id)).map(p => p.n).join(', ')}\nStart: ${st.from || 'Flexible'}\nLength: ${st.weeks}\nBusiness: ${st.biz}\nContact: ${st.name} · ${st.phone} · ${st.email}\nWebsite: ${st.web}\nPromoting: ${st.msg}\nFiles: ${st.files.map(f => f.name).join(', ') || 'none'}`; out.className = 'fmsg on'; out.innerHTML = `<b>Ready to send.</b> On the live site this goes straight into the Inspire FM bookings dashboard with your files attached. For now, send it by <a href="mailto:${D.email}?subject=${encodeURIComponent('Advertising: ' + st.biz)}&body=${encodeURIComponent(body)}">email</a> (${D.email}) or <a href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener">WhatsApp</a>, attaching your files.`; return; }
    st.step = Math.max(0, Math.min(4, st.step + d)); show(); $('#adSteps').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  show();
}

/* ================= ABOUT / CONTACT / FOOTER TOOLS ================= */
function initAbout() { const TL = [['1997', 'Radio Ramadhan Luton', 'Four friends start a Ramadan station to give Luton a spiritual connection during the holy month.'], ['1997–2009', 'Every Ramadan', 'The station returns each year on a temporary licence, growing as its messages reach more people.'], ['2010', 'Full-time on 105.1 FM', 'A community radio licence from Ofcom. Inspire FM goes on air all year from 10 August 2010.'], ['2022', '25 years of inspiring', 'A gala dinner with Luton\'s MPs, councillors, masjids and partners marks 25 years.'], ['Today', '150+ volunteers', 'Live radio, Inspire Eid, the Jummah Winter Appeal, the Big Iftar with partners, and now this website.']]; $('#aboutTl').innerHTML = TL.map(([y, t, d]) => `<div class="tl reveal"><span class="y">${y}</span><h4>${t}</h4><p>${d}</p></div>`).join(''); observeReveal(); }
function initContact() { formHelper($('#contactForm'), [['cName', 'Name', 1], ['cWho', 'Contact', 1], ['cTopic', 'Topic', 0], ['cMsg', 'Message', 1], ['cOk', 'Consent', 1]], 'Message via inspirefm.org', 'Salaam Inspire FM,'); }
$('#nlForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#nlEmail').value.trim(), out = $('#nlMsg'); if (!/^\S+@\S+\.\S+$/.test(v)) { out.className = 'fmsg on err'; out.textContent = 'Please enter a valid email address.'; return; } out.className = 'fmsg on'; out.innerHTML = `Thanks! On the live site you'll get a confirmation email to finish signing up. For now, <a href="mailto:${D.email}?subject=Newsletter%20sign-up&body=${encodeURIComponent('Please add ' + v + ' to the Thursday email.')}">send us this request</a>.`; });
// dark mode
const setDark = d => { document.documentElement.classList.toggle('dark', d); $('#darkBtn span').textContent = d ? 'Light mode' : 'Dark mode'; $('#darkBtn use').setAttribute('href', d ? '#i-sun' : '#i-moon'); store.set('dark', d); };
setDark(store.get('dark', true)); $('#darkBtn').onclick = () => setDark(!document.documentElement.classList.contains('dark'));
// read aloud
function speak(t) { if (!('speechSynthesis' in window)) { toast('Reading aloud isn\'t supported in this browser'); return; } speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'en-GB'; u.rate = 1; speechSynthesis.speak(u); return u; }
$('#ttsBtn').onclick = () => { if (document.body.classList.contains('ttsing')) { speechSynthesis.cancel(); document.body.classList.remove('ttsing'); $('#ttsBtn span').textContent = 'Listen to this page'; return; } const pg = $('.page:not([hidden])'); const t = $$('h1,h2,h3,h4,p', pg).map(e => e.innerText.trim()).filter(Boolean).join('. ').slice(0, 4000); const u = speak(t); if (!u) return; document.body.classList.add('ttsing'); $('#ttsBtn').classList.add('tts-on'); $('#ttsBtn span').textContent = 'Stop reading'; u.onend = () => { document.body.classList.remove('ttsing'); $('#ttsBtn span').textContent = 'Listen to this page'; }; };
// language: Google Translate on the live domain
$('#langSel').onchange = e => { const l = e.target.value; document.documentElement.dir = ['ar', 'ur', 'fa', 'ps', 'ckb', 'iw', 'yi'].includes(l) ? 'rtl' : 'ltr'; if (l === 'en') { document.cookie = 'googtrans=; path=/; max-age=0'; document.documentElement.dir = 'ltr'; location.reload(); return; } document.cookie = `googtrans=/en/${l}; path=/`; if (!window.google || !google.translate) { window.gtInit = () => { new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gt'); }; const s = document.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit'; s.onerror = () => { toast('Translation switches on once the site is live on inspirefm.org.'); document.documentElement.dir = 'ltr'; }; document.body.appendChild(s); setTimeout(() => { if (!window.google || !google.translate) { toast('Translation switches on once the site is live on inspirefm.org.'); document.documentElement.dir = 'ltr'; } }, 3000); } else location.reload(); };
$('#yr').textContent = new Date().getFullYear();


/* ================= PRAYER ALERTS, ADHAN, QIBLA, WEB APP ================= */
const AL_DEF = { on: false, p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true, sunrise: false }, lead: 10, sound: 'adhan', fajr: 'adhan', jummah: '45' };
let AL = Object.assign({}, AL_DEF, store.get('alerts', {})); AL.p = Object.assign({}, AL_DEF.p, AL.p || {});
const saveAL = () => { store.set('alerts', AL); pushSync(); };
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let swReg = null;
try { if ('serviceWorker' in navigator && !/claude\.ai|claudeusercontent/.test(location.host)) Promise.resolve().then(r => swReg = r).catch(() => {}); } catch (e) {}
/* push server (set on the live site): IFM.push = { server: 'https://…/subscribe', vapid: '…' } */
async function pushSync() {
  const P = D.push; if (!P || !swReg || !('PushManager' in window)) return;
  try { let sub = await swReg.pushManager.getSubscription(); if (AL.on && !sub) { const k = Uint8Array.from(atob(P.vapid.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)); sub = await swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: k }); }
    if (sub) await fetch(P.server, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub, settings: AL, masjid: store.get('masjid', ''), asr: asrF, tz: 'Europe/London', lat: LAT, lng: LNG }) }); } catch (e) {}
}
/* sounds: the adhan file comes from Inspire FM (audio/adhan.mp3, audio/adhan-fajr.mp3); the chime is made in the browser */
let actx = null, adhanAud = null;
function chime() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime;
  [[523.25, 0], [659.25, .35], [783.99, .7], [1046.5, 1.05]].forEach(([f, d]) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t0 + d); g.gain.linearRampToValueAtTime(.22, t0 + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + d + 2.4); o.connect(g).connect(actx.destination); o.start(t0 + d); o.stop(t0 + d + 2.5); }); } catch (e) {} }
function playSound(kind, fajr) {
  stopSound(); if (kind === 'silent') return;
  if (kind === 'chime') { chime(); return; }
  adhanAud = new Audio(fajr ? 'audio/adhan-fajr.mp3' : 'audio/adhan.mp3'); adhanAud.volume = 1;
  if (kind === 'short') adhanAud.addEventListener('timeupdate', () => { if (adhanAud && adhanAud.currentTime > 14) stopSound(); });
  adhanAud.addEventListener('ended', () => $('#adhanOv').classList.remove('on'));
  adhanAud.play().then(() => $('#adhanOv').classList.add('on')).catch(() => { adhanAud = null; chime(); $('#adhanOv').classList.add('on'); setTimeout(() => $('#adhanOv').classList.remove('on'), 4000);
    $('#alNote').textContent = 'Preview: the adhan recording is added from Inspire FM\'s studio at launch, so you\'re hearing the chime for now.'; });
}
function stopSound() { if (adhanAud) { adhanAud.pause(); adhanAud = null; } $('#adhanOv') && $('#adhanOv').classList.remove('on'); }
const DUA_AFTER = 'After the adhan: اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ… “O Allah, Lord of this perfect call and the prayer about to be established…” (Bukhari 614)';
function showAdhan(nx, fromTap) {
  const T = today(), k = nx[0], name = (k === 'dhuhr' && T.l.dow === 5) ? 'Jummah' : nx[1];
  $('#adName').textContent = name; $('#adTime').textContent = hm(prayerTimes(T.l.y, T.l.m, T.l.d, asrF)[k]); $('#adDua').textContent = DUA_AFTER;
  $('#adhanOv').hidden = false; document.body.classList.add('lock');
  if (!fromTap) playSound(k === 'fajr' ? AL.fajr : AL.sound, k === 'fajr');
}
$('#adPlay').onclick = () => { const k = $('#adName').textContent; playSound(k === 'Fajr' ? (AL.fajr === 'silent' ? 'adhan' : AL.fajr) : (AL.sound === 'silent' || AL.sound === 'chime' ? 'adhan' : AL.sound), k === 'Fajr'); };
const closeAdhan = () => { stopSound(); $('#adhanOv').hidden = true; document.body.classList.remove('lock'); };
$('#adStop').onclick = closeAdhan; $('#adMasjid').addEventListener('click', closeAdhan);
function notify(title, body, tag) {
  try { if (swReg && Notification.permission === 'granted') { (navigator.serviceWorker.controller || swReg.active) ? swReg.showNotification(title, { body, icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag, renotify: true, data: { url: '/#adhan' }, actions: [{ action: 'adhan', title: 'Play adhan' }] }) : null; return; }
    if ('Notification' in window && Notification.permission === 'granted') { new Notification(title, { body, icon: 'icons/icon-192.png', tag }); return; } } catch (e) {}
  toast(`${title} · ${body}`);
}
let fired = store.get('fired', {});
function alertTick(T) {
  if (!AL.on) return; const day = `${T.l.y}-${T.l.m}-${T.l.d}`; if (fired.day !== day) fired = { day };
  const L = PR.filter(([k]) => AL.p[k]);
  L.forEach(([k, n]) => { const t = T.t[k], nm = (k === 'dhuhr' && T.l.dow === 5) ? 'Zuhr' : n;
    const lead = +AL.lead; if (lead && !fired[k + 'L'] && T.now >= t - lead / 60 && T.now < t) { fired[k + 'L'] = 1; store.set('fired', fired); notify(`${nm} in ${lead} minutes`, `${nm} starts at ${hm(t)} in Luton.`, k + 'L'); }
    if (!fired[k] && T.now >= t && T.now < t + 2 / 60) { fired[k] = 1; store.set('fired', fired); notify(`It's time for ${nm} · ${hm(t)}`, k === 'sunrise' ? 'Fajr time has ended.' : 'Tap to hear the adhan.', k); if (k !== 'sunrise') showAdhan([k, nm]); } });
  if (AL.jummah && T.l.dow === 5) { const m = M.find(x => x.id === store.get('masjid', '')); if (m && m.j[0] && !fired.j) { const jt = toH(m.j[0]); if (T.now >= jt - AL.jummah / 60 && T.now < jt) { fired.j = 1; store.set('fired', fired); notify(`Jummah at ${m.n}`, `Jamaat at ${h12(m.j[0])}. Leave in good time.`, 'jummah'); } } }
}
function alSetup() { const box = $('#alSet'); if (!box || box._ok) return; box._ok = 1; const ua = navigator.userAgent, sam = /SamsungBrowser|SM-[A-Z0-9]/i.test(ua), ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const os = k => { $$('[data-os]', box).forEach(o => { if (o.tagName === 'BUTTON') o.classList.toggle('on', o.dataset.os === k); else o.hidden = o.dataset.os !== k; }); };
  $$('.alset-t button', box).forEach(b => b.onclick = () => os(b.dataset.os)); os(ios ? 'ios' : sam ? 'sam' : 'and');
  const ch = $('#alChrome'); if (ch) ch.href = 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.android.chrome') + ';end';
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) box.hidden = true; }
function initAlerts() {
  const T = today(), rows = [['fajr', 'Fajr', ''], ['sunrise', 'Sunrise', 'Warning that Fajr is ending'], ['dhuhr', T.l.dow === 5 ? 'Zuhr / Jummah' : 'Zuhr', ''], ['asr', 'Asr', ''], ['maghrib', 'Maghrib', 'Iftar in Ramadan'], ['isha', 'Isha', '']];
  const draw = () => { const T2 = today();
    $('#alRows').innerHTML = rows.map(([k, n, sub]) => `<div class="al-row"><span><b>${n}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="tm">${hm(T2.t[k])}</span><button class="sw sm" type="button" role="switch" aria-checked="${!!AL.p[k]}" data-k="${k}" aria-label="${n} alert"><i></i></button></div>`).join('');
    $('#alOn').setAttribute('aria-checked', AL.on); $('#alPanel').setAttribute('aria-disabled', !AL.on);
    $('#alState').textContent = AL.on ? `On · ${Object.values(AL.p).filter(Boolean).length} prayers` : 'Off';
    $('#alLead').value = AL.lead; $('#alSound').value = AL.sound; $('#alFajr').value = AL.fajr; $('#alJ').value = AL.jummah;
    const tips = [];
    if (isIOS && !standalone()) tips.push(`<div class="tip"><b>iPhone:</b> to get alerts when Inspire isn't open, add it to your Home Screen first (Share › Add to Home Screen). <a href="#prayer" data-ios>Show me how</a></div>`);
    /* preview note removed: the Toolbox explains itself */
    if (AL.jummah && !store.get('masjid', '')) tips.push('<div class="tip">Choose your masjid in the <a href="#jummah">Jummah finder</a> (Save as my masjid) for Jummah reminders.</div>');
    $('#alHow').innerHTML = tips.join(''); };
  $('#alOn').onclick = async () => { AL.on = !AL.on;
    if (AL.on) { try { if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); } catch (e) {} try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) {}
      toast(('Notification' in window && Notification.permission === 'granted') ? 'Prayer alerts on' : 'Prayer alerts on. Allow notifications to get them on your lock screen.'); if (navigator.vibrate) navigator.vibrate(15); }
    saveAL(); draw(); };
  $('#alRows').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; AL.p[b.dataset.k] = !AL.p[b.dataset.k]; saveAL(); draw(); };
  [['alLead', 'lead'], ['alSound', 'sound'], ['alFajr', 'fajr'], ['alJ', 'jummah']].forEach(([id, k]) => $('#' + id).onchange = e => { AL[k] = e.target.value; saveAL(); draw(); if (k === 'sound' || k === 'fajr') playSound(e.target.value === 'silent' ? 'silent' : e.target.value === 'chime' ? 'chime' : 'chime'); });
  $('#alTest').onclick = () => { $('#adName').textContent = today().nx[1]; showAdhan(today().nx, true); playSound('adhan'); };
  $('#alPreview').onclick = () => showAdhan(today().nx);
  $('#ntTxt').textContent = `${T.nx[1]} · ${hm(T.left + T.now)}. Time to pray. Tap to hear the adhan.`; $('#ntTxt2').textContent = `${T.nx[1]} in 10 minutes. Starts at ${hm(T.left + T.now)} in Luton.`;
  draw();
}
/* qibla */
const KAABA = [21.4225, 39.8262];
function qiblaFrom(lat, lng) { const r = Math.PI / 180, f1 = lat * r, f2 = KAABA[0] * r, dl = (KAABA[1] - lng) * r; const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl); return (Math.atan2(y, x) / r + 360) % 360; }
const card16 = d => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(d / 22.5) % 16];
let qDeg = qiblaFrom(LAT, LNG), qPlace = 'Luton';
function qSet() { $('#qbNeedle').style.setProperty('--q', qDeg + 'deg'); $('#qbDeg').textContent = Math.round(qDeg) + '°'; $('#qbDir').textContent = card16(qDeg); $('#qbTxt').innerHTML = `From ${esc(qPlace)} the Kaaba is <b>${Math.round(qDeg)}°</b> from north (${card16(qDeg)}). Hold your phone flat and turn until the Kaaba lines up with the white marker at the top.`; }
function initQibla() {
  qSet(); let on = false;
  const onOri = e => { const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? 360 - e.alpha : null); if (h == null) return; $('#qbRose').style.transform = `rotate(${-h}deg)`; const off = Math.abs(((qDeg - h) + 540) % 360 - 180); const al = off < 5; if (al !== $('#qbDial').classList.contains('aligned')) { $('#qbDial').classList.toggle('aligned', al); if (al && navigator.vibrate) navigator.vibrate([20, 40, 20]); } $('#qbNote').textContent = al ? 'You\'re facing the qibla.' : `Turn ${((qDeg - h + 360) % 360) < 180 ? 'right' : 'left'} ${Math.round(off)}°`; };
  $('#qbStart').onclick = async () => { if (on) return; try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') { const p = await DeviceOrientationEvent.requestPermission(); if (p !== 'granted') throw 0; } } catch (e) { $('#qbNote').textContent = 'Compass access wasn\'t allowed. Use the bearing above with any compass.'; return; }
    if (!('DeviceOrientationEvent' in window)) { $('#qbNote').textContent = 'This device has no compass. Use the bearing above.'; return; }
    on = true; addEventListener('deviceorientationabsolute', onOri); addEventListener('deviceorientation', onOri); $('#qbStart').innerHTML = `${I('compass')}Compass on`;
    setTimeout(() => { if ($('#qbRose').style.transform === '') $('#qbNote').textContent = 'No compass reading here. On a phone, open inspirefm.org to use the live compass. The bearing above is still correct.'; }, 2500); };
  $('#qbLoc').onclick = () => { if (!navigator.geolocation) return; $('#qbNote').textContent = 'Finding your location…'; navigator.geolocation.getCurrentPosition(p => { qDeg = qiblaFrom(p.coords.latitude, p.coords.longitude); qPlace = 'where you are'; qSet(); $('#qbNote').textContent = 'Bearing updated for your location.'; }, () => { $('#qbNote').textContent = 'Couldn\'t get your location, so we\'re using Luton.'; }, { timeout: 8000 }); };
}
/* install the web app */
let bip = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); bip = e; maybeInstall(); });
function iosHelp() { modal(`<span class="eyebrow">Add to Home Screen</span><h3 style="font-size:1.6rem;margin:10px 0 4px">Get Inspire FM on your iPhone</h3><p style="color:var(--char);margin:0">Free, no App Store, takes 10 seconds.</p><div class="ios-steps"><div><i>${I('ios-share')}</i><span>Tap the <b>Share</b> button in Safari's toolbar</span></div><div><i>${I('plus-sq')}</i><span>Scroll down and tap <b>Add to Home Screen</b></span></div><div><i><img src="icons/icon-192.png" alt="" style="width:30px;border-radius:8px"></i><span>Tap <b>Add</b>, then open Inspire FM from your Home Screen and turn on <b>Prayer alerts</b></span></div></div>`); }
function maybeInstall() {
  if (standalone() || store.get('instX', 0) > Date.now()) return; const mobile = matchMedia('(max-width:760px)').matches;
  if (!(bip || (isIOS && mobile))) return; $('#inst').hidden = false;
  if (isIOS && !bip) $('#instTxt').textContent = 'Add it to your Home Screen for prayer alerts with adhan, live radio and Jummah times.';
}
$('#instGo').onclick = async () => { if (bip) { bip.prompt(); const r = await bip.userChoice; if (r.outcome === 'accepted') $('#inst').hidden = true; bip = null; } else iosHelp(); };
$('#instX').onclick = () => { $('#inst').hidden = true; store.set('instX', Date.now() + 7 * 864e5); };
document.addEventListener('click', e => { if (e.target.closest('[data-ios]')) { e.preventDefault(); iosHelp(); } if (e.target.closest('#drawerInstall')) { e.preventDefault(); setMenu(false); bip ? $('#instGo').click() : iosHelp(); } });
setTimeout(maybeInstall, 6000);


/* ================= SUNNAH TOOLBOX ================= */
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
let trOff = 0, tsIdx = 0, tsN = 0, tsSeq = null;
const TS = [['SubhanAllah', 'سُبْحَانَ ٱللَّٰهِ', 33], ['Alhamdulillah', 'ٱلْحَمْدُ لِلَّٰهِ', 33], ['Allahu Akbar', 'ٱللَّٰهُ أَكْبَرُ', 34], ['La ilaha illallah', 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', 100], ['Astaghfirullah', 'أَسْتَغْفِرُ ٱللَّٰهَ', 100], ['Salawat', 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', 100]];
const FIVE = [['fajr', 'Fajr', IFM_IC('dawn')], ['dhuhr', 'Zuhr', IFM_IC('sun')], ['asr', 'Asr', IFM_IC('suncloud')], ['maghrib', 'Maghrib', IFM_IC('sunset')], ['isha', 'Isha', IFM_IC('moon')]];
function trDone(k) { return store.get('pr_' + k, {}); }
function streak() { let n = 0; const d = new Date(); if (Object.keys(trDone(dkey(d))).length < 5) d.setDate(d.getDate() - 1); while (Object.keys(trDone(dkey(d))).length >= 5 && n < 999) { n++; d.setDate(d.getDate() - 1); } return n; }
function renderTrack() {
  const day = new Date(); day.setDate(day.getDate() + trOff); const k = dkey(day), done = trDone(k), T = today();
  const P = prayerTimes(day.getFullYear(), day.getMonth() + 1, day.getDate(), asrF), isToday = trOff === 0;
  $('#trDay').textContent = isToday ? 'Today' : trOff === -1 ? 'Yesterday' : day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const cur = FIVE.slice().reverse().find(([p]) => T.t[p] <= T.now) || FIVE[4];
  $('#trList').innerHTML = FIVE.map(([p, n, e]) => { const fut = isToday && P[p] > T.now, isNow = isToday && cur[0] === p && !fut; return `<div class="trp ${done[p] ? 'done' : ''}" data-p="${p}"><button class="ck" type="button" aria-pressed="${!!done[p]}" aria-label="Mark ${n} as prayed" ${fut || trOff > 0 ? 'disabled style="opacity:.35"' : ''}><svg><use href="#i-check"/></svg></button><span><b>${n}</b> <span aria-hidden="true">${e}</span>${isNow ? '<span class="trn">Now</span>' : ''}</span><span class="tm">${hm(P[p])}</span><button class="bell ${AL.on && AL.p[p] ? '' : 'off'}" type="button" data-bell="${p}" aria-label="${n} alert"><svg><use href="#i-${AL.on && AL.p[p] ? 'vol' : 'mute'}"/></svg></button></div>`; }).join('');
  const c = Object.keys(done).length; $('#trCount').textContent = `${c}/5`; $('#trArc').style.strokeDashoffset = 314 - 314 * c / 5;
  $('#trNowK').textContent = 'Now'; $('#trNowN').textContent = cur[1]; $('#trNowT').textContent = hm(T.t[cur[0]]); $('#trNowNx').textContent = `${T.nx[1]} in ${dur(T.left).replace(/ \d+s$/, '')}`;
  const st = streak(); $('#trStreak').innerHTML = st ? `${IFM_IC('flame')} ${st}-day streak of all five` : 'Pray all five today to start a streak';
  $('#tbTrackS').textContent = `${Object.keys(trDone(dkey(new Date()))).length}/5 today`;
}
function tsRender(bump) { const [n, ar, max] = TS[tsIdx]; $('#tsAr').textContent = ar; $('#tsN').textContent = tsN; $('#tsOf').textContent = `of ${max} · ${n}`; $('#tsArc').style.strokeDashoffset = 553 - 553 * Math.min(1, tsN / max); $('#tsBtn').classList.toggle('done', tsN >= max);
  $$('#tsPre button').forEach((b, i) => b.setAttribute('aria-pressed', i === tsIdx)); const tot = store.get('ts_' + dkey(new Date()), 0); $('#tsTot').textContent = `Total today: ${tot}`; $('#tbTasS').textContent = tot ? `${tot} today` : 'Tap to count'; }
function initToolbox() {
  const tick = () => { const T = today(), now = new Date(); $('#tbDate').textContent = greg(now); $('#tbHijri').textContent = hijri(now); $('#tbNext').textContent = `${T.nx[1]} ${hm(T.left + T.now)}`; $('#tbIn').textContent = 'in ' + dur(T.left); };
  tick(); setInterval(() => { if (!$('[data-page=toolbox]').hidden) tick(); }, 1000);
  $('#tbAlS').textContent = AL.on ? 'On' : 'Off';
  const ram = Math.max(0, Math.ceil((Date.parse('2027-02-08') - Date.now()) / 864e5)); $('#tbSeaS').textContent = `Ramadan in ${ram} days`;
  const q = store.get('qLast', null); if (q) $('#tbQuS').textContent = `Continue ${q}`;
  // tracker
  $('.tl-nav').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; trOff = Math.min(0, trOff + +b.dataset.d); renderTrack(); };
  $('#trList').onclick = e => { const b = e.target.closest('.ck'); const bell = e.target.closest('[data-bell]');
    if (bell) { const p = bell.dataset.bell; if (!AL.on) { AL.on = true; Object.keys(AL.p).forEach(k => AL.p[k] = false); } AL.p[p] = !AL.p[p]; saveAL(); renderTrack(); toast(AL.p[p] ? `${FIVE.find(f => f[0] === p)[1]} alert on` : 'Alert off'); $('#tbAlS').textContent = AL.on ? 'On' : 'Off'; return; }
    if (!b || b.disabled) return; const row = b.closest('.trp'), p = row.dataset.p; const day = new Date(); day.setDate(day.getDate() + trOff); const k = dkey(day), d = trDone(k);
    d[p] ? delete d[p] : d[p] = 1; store.set('pr_' + k, d); renderTrack(); const r = $(`.trp[data-p="${p}"]`); r && r.classList.add('pop'); if (navigator.vibrate) navigator.vibrate(12);
    if (Object.keys(d).length === 5) { toast('All five prayed. Alhamdulillah!'); burst(); } };
  $('#trAll').onclick = () => { const day = new Date(); day.setDate(day.getDate() + trOff); const T = today(); const d = {}; FIVE.forEach(([p]) => { const P = prayerTimes(day.getFullYear(), day.getMonth() + 1, day.getDate(), asrF); if (trOff < 0 || P[p] <= T.now) d[p] = 1; }); store.set('pr_' + dkey(day), d); renderTrack(); };
  renderTrack(); setInterval(() => { if (!$('[data-page=toolbox]').hidden && new Date().getSeconds() === 0) renderTrack(); }, 1000);
  // tasbih
  $('#tsPre').innerHTML = TS.map(([n], i) => `<button type="button" data-i="${i}">${n}</button>`).join('');
  $('#tsPre').onclick = e => { const b = e.target.closest('button'); if (!b) return; tsIdx = +b.dataset.i; tsN = 0; tsSeq = null; tsRender(); };
  $('#tsBtn').addEventListener('pointerdown', e => { e.preventDefault(); tsN++; const k = 'ts_' + dkey(new Date()); store.set(k, store.get(k, 0) + 1);
    const max = TS[tsIdx][2]; if (navigator.vibrate) navigator.vibrate(tsN === max ? [30, 50, 30] : 8);
    if (tsN === max && tsSeq !== null && tsSeq < 2) { tsSeq++; setTimeout(() => { tsIdx = tsSeq; tsN = 0; tsRender(); toast(`Now ${TS[tsIdx][0]}`); }, 500); }
    else if (tsN === max && tsSeq === 2) { tsSeq = null; toast('Set complete. May Allah accept it.'); }
    tsRender(); });
  $('#tsReset').onclick = () => { tsN = 0; tsRender(); };
  $('#tsSeq').onclick = () => { tsSeq = 0; tsIdx = 0; tsN = 0; tsRender(); toast('33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar'); };
  tsRender();
  // saved duas
  renderSaved();
  if (location.hash === '#toolbox' && pendingTool) { const t = pendingTool; setTimeout(() => $('#t-' + t).scrollIntoView({ behavior: 'smooth' }), 80); }
}
let pendingTool = null;
document.addEventListener('click', e => { const t = e.target.closest('[data-tool]:not(#scr)'); if (t) { e.preventDefault(); const el = $('#t-' + t.dataset.tool); el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } });


function renderSaved() {
  if (window.IFM_DUAS_SAVED) return window.IFM_DUAS_SAVED();
  const bm = store.get('duaBm', []), rc = store.get('duaRc', []); const ids = [...new Set(bm.concat(rc))].slice(0, 6);
  $('#tbSaved').innerHTML = ids.length ? ids.map(i => { const d = D.duas[i]; return d ? `<a href="#duas" data-open-dua="${i}"><small>${bm.includes(i) ? 'Saved' : 'Recent'} · ${esc(d.src)}</small><b>${esc(d.t)}</b><span lang="ar">${d.ar.length > 70 ? d.ar.slice(0, 70) + '…' : d.ar}</span></a>` : ''; }).join('') : '';
  { const ts = $('#t-saved'); if (ts) ts.classList.toggle('sv-none', !ids.length); }
}
/* ================= TOOLBOX SCREENS: each tool opens as its own app screen ================= */
const TOOLS = {
  track: ['Prayer tracker', null, ['#t-track']], tasbih: ['Tasbih', null, ['#t-tasbih']], qibla: ['Qibla', 'prayer', ['#qibla .qb']],
  quran: ['Quran', 'quran', ['[data-page=quran] .sec > .wrap']], duas: ['Duas', 'duas', ['#t-saved', '[data-page=duas] .sec > .wrap']],
  jummah: ['Jummah', 'jummah', ['[data-page=jummah] .jf']], alerts: ['Adhan alerts', 'prayer', ['#alerts .al']],
  zakat: ['Zakat & giving', 'give', ['#gCalc', '#gTypes']], dates: ['Islamic dates', 'seasons', ['#seasonCards']],
  wall: ['Prayer wallpaper', 'prayer', ['#mwall .mw', '#maker .wrap']]
};
let curTool = null, moved = [];
function openTool(k) {
  const T = TOOLS[k]; if (!T) return; if (curTool === k) { toTop($('#scrBody')); return; } if (curTool) restoreTool();
  if (!inited.toolbox) { inited.toolbox = 1; INIT.toolbox(); }
  if (T[1] && !inited[T[1]] && INIT[T[1]]) { inited[T[1]] = 1; try { INIT[T[1]](); } catch (e) { console.error(e); } }
  if (k === 'duas') renderSaved();
  const slot = $('#scrSlot'); slot.innerHTML = '';
  if (typeof T[2] === 'function') { const node = document.createElement('div'); node.className = 'tk'; slot.appendChild(node); try { T[2](node); } catch (e) { console.error(e); node.innerHTML = '<div class="tk-empty">Something went wrong loading this tool.</div>'; } } else T[2].forEach(sel => { const el = $(sel); if (!el) return; const ph = document.createComment('tool'); el.parentNode.insertBefore(ph, el); moved.push([el, ph, el.hidden]); el.hidden = false; slot.appendChild(el); });
  $('#scrT').textContent = T[0]; $('#scrH').textContent = T[0];
  const ic = $(`.tbt[href="#tb-${k}"] .ai`); $('#scrIc').innerHTML = ic ? ic.outerHTML.replace(/id="(g\w+)"/g, 'id="$1s"').replace(/url\(#(g\w+)\)/g, 'url(#$1s)') : (window.IFM_TOOL_IC && IFM_TOOL_IC[k] && window.IFM_TILE ? IFM_TILE(IFM_TOOL_IC[k][0], IFM_TOOL_IC[k][1], 'ai') : '');
  curTool = k; document.documentElement.dataset.tool = k; document.dispatchEvent(new CustomEvent('ifm:tool', { detail: k })); toTop($('#scrBody')); $('.scr-bar').classList.remove('sc');
  const w = $('#scrWrap'); w.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => { w.classList.add('on'); document.body.classList.add('scr-open', 'lock'); }));
  if (k === 'track') renderTrack(); if (k === 'tasbih') tsRender(); if (k === 'jummah') renderJ(); if (k === 'quran') store.set('qLast', store.get('qLast', 'Al-Fatihah'));
  if (navigator.vibrate) navigator.vibrate(6);
}
function restoreTool() { moved.forEach(([el, ph, h]) => { ph.parentNode.insertBefore(el, ph); ph.remove(); el.hidden = h; }); moved = []; }
function closeTool() {
  if (!curTool) return; delete document.documentElement.dataset.tool; document.dispatchEvent(new CustomEvent('ifm:tool', { detail: '' })); const w = $('#scrWrap'); w.classList.remove('on'); document.body.classList.remove('scr-open', 'lock'); curTool = null;
  const s = $('#scr'); s.style.transform = '';
  setTimeout(() => { if (!curTool) { restoreTool(); w.hidden = true; } }, 430);
  if (inited.toolbox) { $('#tbAlS').textContent = AL.on ? 'On' : 'Off'; renderTrack(); tsRender(); }
}
$('#scrBack').onclick = () => { if (canBack()) history.back(); else location.hash = '#toolbox'; };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#tabbar a[data-t=toolbox]'); if (!t) return; if (curTool) { e.preventDefault(); e.stopPropagation(); $('#scrBack').click(); } else if (document.body.classList.contains('app-page') && matchMedia('(max-width:760px)').matches) { e.preventDefault(); e.stopPropagation(); if (canBack()) history.back(); else location.hash = '#toolbox'; } }, true);
let backOk = false; addEventListener('hashchange', e => { backOk = /#tb-/.test(location.hash) && /#toolbox$/.test(e.oldURL || ''); });
$('#scrBody').addEventListener('scroll', e => $('.scr-bar').classList.toggle('sc', e.target.scrollTop > 36), { passive: true });
/* swipe from the left edge to go back, like iOS */
(function () { const s = $('#scr'); let x0 = null, y0 = 0, dx = 0, mode = 0;
  s.addEventListener('touchstart', e => { const t = e.touches[0]; mode = 0; if (t.clientX - s.getBoundingClientRect().left < 24) { x0 = t.clientX; y0 = t.clientY; dx = 0; } else x0 = null; }, { passive: true });
  s.addEventListener('touchmove', e => { if (x0 == null) return; const t = e.touches[0], mx = t.clientX - x0, my = Math.abs(t.clientY - y0);
    if (!mode) { if (my > 8 && my > mx) { x0 = null; return; } if (mx > 14 && mx > my * 1.6) { mode = 1; s.classList.add('drag'); } else return; }
    dx = Math.max(0, mx); s.style.transform = `translateX(${dx}px)`; }, { passive: true });
  s.addEventListener('touchend', () => { if (x0 == null || !mode) { x0 = null; return; } s.classList.remove('drag'); x0 = null; mode = 0; if (dx > s.offsetWidth / 3) $('#scrBack').click(); else s.style.transform = ''; });
})();
addEventListener('keydown', e => { if (e.key === 'Escape' && curTool) $('#scrBack').click(); });


/* ================= NOW PLAYING: full-screen player, with a demo sound for the preview ================= */
var demoOnAir = false; let npMode = 'live', npEp = 0, demoWanted = /claude|localhost|127\.0/.test(location.host) || !location.host, ttsU = null, actxNP = null, analyser = null, npRaf = 0, sleepNP = 0;
const dAud = $('#demoAud'); dAud.loop = false;
/* real podcast episodes (Transistor mp3) play in their own audio element, not through the demo visualiser */
const rAud = new Audio(); rAud.preload = 'none';
const isReal = () => npMode === 'ep' && !!(D.pods[npEp] || {}).mp3;
const A = () => isReal() ? rAud : dAud;
const fmtT = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + pad(s % 60); };
function npFill() {
  const live = npMode === 'live'; const c = showAt(), sh = live ? D.shows[c.s[2]] : D.shows[D.pods[npEp].s], ep = D.pods[npEp];
  $('#np').style.setProperty('--npc', sh.g[1] + '88'); npColours(live ? sh : epS(ep)); $('#npArt').style.setProperty('--art', grad(live ? sh : epS(ep))); $('#npArt').classList.toggle('lg', !!(live ? sh : epS(ep)).logo); $('#npLive').hidden = !live;
  $('#npArtT').textContent = live ? sh.n : ep.t; $('#npTitle').textContent = live ? sh.n : ep.t; $('#npSub').textContent = live ? `Live · ${H(c.start)}–${H(c.end)} · Inspire FM 105.1` : `${sh.n} · ${epWho(ep) || ep.len}`;
  $('#npCtx').textContent = live ? 'Playing live' : 'Catch-up'; $('#npSeek').disabled = live; ['npBack', 'npFwd', 'npSpeed'].forEach(id => $('#' + id).style.visibility = live ? 'hidden' : ''); ['npBack', 'npFwd', 'npSpeed'].forEach(id => $('#' + id).hidden = live); $('#npShareL').hidden = !live; $('.np-ctl').classList.toggle('live', live); $('#npShare').style.visibility = live ? 'hidden' : '';
  $('#npListH').textContent = live ? 'Up next on Inspire' : 'More episodes';
  $('#npList').innerHTML = live ? upNext(4).map(x => { const s2 = D.shows[x.s[2]]; return `<div class="np-row"><i style="--art:${grad(s2)}"></i><span><b>${esc(s2.n)}</b><small>${esc(s2.c)}</small></span><span class="t">${H(x.start)}</span></div>`; }).join('')
    : D.pods.map((p, i) => [p, i]).filter(([, i]) => i !== npEp).slice(0, 4).map(([p, i]) => { const s2 = D.shows[p.s]; return `<button class="np-row" type="button" data-npep="${i}"><i style="--art:${grad(epS(p))}"></i><span><b>${esc(p.t)}</b><small>${esc(s2.n)}</small></span><span class="t">${esc(p.len)}</span></button>`; }).join('');
  $('#npDemo').classList.toggle('on', demoWanted); $('#npDemo').hidden = true; $('#npDemo span').textContent = demoWanted ? 'Demo sound on' : 'Demo sound';
  $('#npNote').textContent = isReal() ? `${ep.date ? ep.date + ' · ' : ''}${ep.len} · full episode` : (live ? 'Streaming live from Inspire FM.' : '');
  if (!live) $('#npDur').textContent = A().duration ? fmtT(A().duration) : (isReal() ? ep.len : fmtT(90));
  onAir2();
}
function onAir2() { if (npMode !== 'live') return; const c = showAt(); const len = c.end - c.start, done = (c.h - c.start + 24) % 24; $('#npSeek').value = Math.round(done / len * 1000); $('#npCur').textContent = H(c.start); $('#npDur').textContent = H(c.end); }
function openNP(mode, autoplay, ep) {
  const changing = mode !== npMode || (ep != null && ep !== npEp); if (changing) stopAll(); npMode = mode; if (ep != null) npEp = ep;
  npFill(); const n = $('#np'); n.hidden = false; try { if (parent !== window) parent.postMessage({ ifmPlayer: 1 }, '*'); } catch (e) {} requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('on'))); document.body.classList.add('lock', 'np-open');
  miniInfo(); if (autoplay && !(playing || demoOnAir)) npToggle(mode); viz();
}
function closeNP() { const n = $('#np'); n.classList.remove('on'); try { if (parent !== window) parent.postMessage({ ifmPlayer: 0 }, '*'); } catch (e) {} document.body.classList.remove('lock', 'np-open'); setTimeout(() => { if (!n.classList.contains('on')) n.hidden = true; }, 460); cancelAnimationFrame(npRaf); }
function miniInfo() { if (npMode === 'ep') { const ep = D.pods[npEp], sh = D.shows[ep.s]; $('#plShow').textContent = ep.t; $('#plNext').textContent = sh.n + ' · catch-up'; $('#plArt').style.setProperty('--art', grad(epS(ep))); $('.pl-info .k').innerHTML = '<i style="background:var(--g)"></i>Catch-up'; } else { $('.pl-info .k').innerHTML = '<i></i>Live · 105.1 FM'; onAir(); } }
function stopAll() { if (playing) play(); dAud.pause(); rAud.pause(); demoOnAir = false; try { speechSynthesis.cancel(); } catch (e) {} setPlayUI(); }
function say(text) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = npMode === 'ep' ? dAud.playbackRate : 1; const v = speechSynthesis.getVoices().find(v => /en-GB/.test(v.lang)); if (v) u.voice = v; u.onstart = () => dAud.volume = .3; u.onend = () => dAud.volume = .9; speechSynthesis.speak(u); ttsU = u; } catch (e) {} }
function demoPlay() {
  if (isReal()) { const ep = D.pods[npEp]; if (rAud.getAttribute('src') !== ep.mp3) rAud.src = ep.mp3; const p = rAud.play(); (p && p.then ? p : Promise.resolve()).then(() => { demoOnAir = true; setPlayUI(); }).catch(() => { $('#npNote').textContent = 'Couldn\'t start the episode here. Tap Open the episode to listen.'; }); return; }
  try { if (!actxNP) { actxNP = new (window.AudioContext || window.webkitAudioContext)(); const src = actxNP.createMediaElementSource(dAud); analyser = actxNP.createAnalyser(); analyser.fftSize = 128; src.connect(analyser); analyser.connect(actxNP.destination); } actxNP.resume(); } catch (e) {}
  dAud.loop = npMode === 'live'; dAud.volume = .9; const p = dAud.play();
  (p && p.then ? p : Promise.resolve()).then(() => { demoOnAir = true; setPlayUI(); const c = showAt(), sh = D.shows[c.s[2]], ep = D.pods[npEp];
    if (dAud.currentTime < 2) setTimeout(() => { if (demoOnAir) say(npMode === 'live' ? `You're listening to Inspire F M, one oh five point one, positively inspiring the community. This is ${sh.n}. ${sh.d}` : `Welcome to ${D.shows[ep.s].n}, on Inspire F M. ${ep.t}. ${ep.d}`); }, 1600); }).catch(() => { $('#npNote').textContent = 'Tap play to start listening.'; });
}
function npToggle(mode) {
  if (mode && mode !== npMode) { stopAll(); npMode = mode; npFill(); miniInfo(); }
  if (playing || demoOnAir) { stopAll(); return; }
  if (npMode === 'ep' || demoWanted) demoPlay(); else play();
}
dAud.addEventListener('ended', () => { demoOnAir = false; setPlayUI(); }); rAud.addEventListener('ended', () => { demoOnAir = false; setPlayUI(); });
dAud.addEventListener('timeupdate', () => { if (npMode !== 'ep') return; $('#npCur').textContent = fmtT(dAud.currentTime); $('#npDur').textContent = fmtT(dAud.duration || 90); if (!$('#npSeek')._drag) $('#npSeek').value = Math.round(dAud.currentTime / (dAud.duration || 90) * 1000); });
rAud.addEventListener('timeupdate', () => { if (npMode !== 'ep') return; $('#npCur').textContent = fmtT(rAud.currentTime); $('#npDur').textContent = fmtT(rAud.duration || 1); if (!$('#npSeek')._drag) $('#npSeek').value = Math.round(rAud.currentTime / (rAud.duration || 1) * 1000); });
$('#npSeek').addEventListener('input', e => { e.target._drag = true; if (npMode === 'ep') A().currentTime = e.target.value / 1000 * (A().duration || 90); });
$('#npSeek').addEventListener('change', e => e.target._drag = false);
$('#npPlay').onclick = () => { npToggle(); if (navigator.vibrate) navigator.vibrate(8); };
$('#npBack').onclick = () => A().currentTime = Math.max(0, A().currentTime - 15);
$('#npFwd').onclick = () => A().currentTime = Math.min(A().duration || 90, A().currentTime + 30);
$('#npSpeed').onclick = () => { const r = [1, 1.25, 1.5, 2], n = r[(r.indexOf(dAud.playbackRate) + 1) % r.length]; dAud.playbackRate = n; rAud.playbackRate = n; $('#npSpeed').textContent = n + '×'; };
$('#npSleep').onclick = () => { const o = [0, 15, 30, 60], n = o[(o.indexOf(sleepNP) + 1) % o.length]; sleepNP = n; clearTimeout(sleepT); $('#npSleep').classList.toggle('on', !!n); if (n) { sleepT = setTimeout(() => { stopAll(); sleepNP = 0; $('#npSleep').classList.remove('on'); }, n * 60e3); toast(`Stops in ${n} minutes`); } else toast('Sleep timer off'); };
$('#npLike').onclick = e => { e.currentTarget.classList.toggle('on'); toast(e.currentTarget.classList.contains('on') ? 'Saved to your library' : 'Removed'); if (navigator.vibrate) navigator.vibrate(10); };
$('#npShareL').onclick = () => $('#npShare').click();
$('#npShare').onclick = () => share(npMode === 'live' ? { title: 'Inspire FM 105.1 live', text: `Listening to ${D.shows[showAt().s[2]].n} live on Inspire FM 105.1`, url: siteUrl('listen') } : { title: D.pods[npEp].t, text: `${D.pods[npEp].t} · Inspire FM catch-up`, url: D.pods[npEp].url || siteUrl('listen') });
$('#npDemo').onclick = () => { demoWanted = !demoWanted; const was = playing || demoOnAir; stopAll(); npFill(); if (was) npToggle(); };
$('#npDown').onclick = closeNP;
$('#npList').onclick = e => { const r = e.target.closest('[data-npep]'); if (r) openNP('ep', true, +r.dataset.npep); };
document.addEventListener('click', e => { const d = e.target.closest('[data-npdemo]'); if (d) { demoWanted = true; openNP(d.dataset.npdemo, true, d.dataset.npdemo === 'ep' ? 0 : null); } if (e.target.closest('#lvCard')) openNP('live', true); });
(function () { const p = $('#npIn'); let y0 = null, dy = 0; p.addEventListener('touchstart', e => { if ($('#np').scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true }); p.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); $('#np').style.transition = 'none'; $('#np').style.transform = `translateY(${dy}px)`; }, { passive: true }); p.addEventListener('touchend', () => { if (y0 == null) return; y0 = null; $('#np').style.transition = ''; $('#np').style.transform = ''; if (dy > 120) closeNP(); }); })();
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#np').hidden) closeNP(); });
/* Player colours: sample the show artwork so the whole player takes on its colours */
const npCol = { a: [168, 164, 157], b: [45, 90, 18] }, npColCache = {};
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); }
function npApply(a, b) { npCol.a = a; npCol.b = b; const np = $('#np'); np.style.setProperty('--np1', `rgb(${a})`); np.style.setProperty('--np2', `rgb(${b})`); }
function npColours(s) {
  const fb = () => npApply(hex2rgb(s.g[0]), hex2rgb(s.g[1]));
  if (!s.img) return fb(); if (npColCache[s.img]) return npApply(...npColCache[s.img]);
  fb(); const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data;
    const pick = (y0, y1) => { let r = 0, g = 0, b = 0, n = 0, best = null, bs = -1; for (let y = y0; y < y1; y++) for (let i = 0; i < 24; i++) { const k = (y * 24 + i) * 4, R = d[k], G = d[k + 1], B = d[k + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B), sat = mx ? (mx - mn) / mx : 0; r += R; g += G; b += B; n++; const sc = sat * (mx > 40 && mx < 245 ? 1 : .2); if (sc > bs) { bs = sc; best = [R, G, B]; } } const avg = [r / n, g / n, b / n].map(Math.round); return bs > .25 ? best.map((v, j) => Math.round(v * .6 + avg[j] * .4)) : avg; };
    const deep = c => { let [r, g, b] = c.map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s, l = (mx + mn) / 2; const dd = mx - mn; s = dd ? dd / (1 - Math.abs(2 * l - 1)) : 0;
      if (dd) h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h = (h * 60 + 360) % 360; s = Math.max(s, .5); l = Math.min(Math.max(l, .3), .44);
      const C = (1 - Math.abs(2 * l - 1)) * s, X = C * (1 - Math.abs((h / 60) % 2 - 1)), m = l - C / 2; const [R, G, B] = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X]; return [R, G, B].map(v => Math.round((v + m) * 255)); };
    const A = deep(pick(0, 12)), B = deep(pick(12, 24)); npColCache[s.img] = [A, B]; npApply(A, B); } catch (e) {} }; im.src = s.img; }
function viz() { const cv = $('#npViz'), c = cv.getContext('2d'); cv.width = cv.clientWidth * 2; cv.height = 120; const N = 40, buf = new Uint8Array(64), lv = new Float32Array(N);
  const still = () => document.documentElement.classList.contains('ax-still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = t => { c.clearRect(0, 0, cv.width, cv.height); const on = playing || demoOnAir; if (analyser && demoOnAir) analyser.getByteFrequencyData(buf);
    const w = cv.width / N, [r, g, b] = npCol.a.map(v => Math.min(255, v + 90));
    for (let i = 0; i < N; i++) {
      const env = Math.sin(Math.PI * (i + .5) / N); let v;
      if (!on) v = .1 + .05 * env * (still() ? 1 : (1 + Math.sin(t / 900 + i * .35)));
      else if (analyser && demoOnAir) v = Math.min(1, (buf[Math.floor(Math.pow(i / N, 1.5) * 40)] / 255) * 1.35);
      else v = still() ? .45 * env + .1 : (.22 + .55 * env) * (.55 + .45 * Math.abs(Math.sin(t / 260 + i * .5) * Math.sin(t / 410 - i * .23)));
      lv[i] += (v - lv[i]) * .25; const h = Math.max(6, lv[i] * 116), x = i * w + 3, y = (120 - h) / 2;
      const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `rgba(${r},${g},${b},${.55 + lv[i] * .45})`); gr.addColorStop(1, `rgba(255,255,255,${.35 + lv[i] * .5})`);
      c.fillStyle = gr; c.beginPath(); c.roundRect ? c.roundRect(x, y, w - 6, h, 6) : c.rect(x, y, w - 6, h); c.fill(); }
    if (!$('#np').hidden) npRaf = requestAnimationFrame(draw); };
  cancelAnimationFrame(npRaf); npRaf = requestAnimationFrame(draw); }
function lvCard() { const c = showAt(), sh = D.shows[c.s[2]]; if (!$('#lvShow')) return; $('#lvShow').textContent = sh.n; $('#lvTime').textContent = `${H(c.start)}–${H(c.end)} · ${sh.c}`; $('#lvArt').style.setProperty('--art', grad(sh)); const nx = showAt(new Date(Date.now() + (c.end - c.h) * 36e5 + 6e4)), nsh = D.shows[nx.s[2]]; if ($('#lvNext')) $('#lvNext').innerHTML = `Up next: <b>${esc(nsh.n)}</b> at ${H(nx.start)}`; }
setInterval(() => { lvCard(); onAir2(); }, 30e3);

/* ================= APP CHROME: app bar, large titles, page classes ================= */
const ROOTS = ['home', 'local', 'listen', 'watch', 'toolbox'];
const TITLE = { activities: 'Activities & clubs', iam: 'Report hate & Islamophobia', updates: "What's happening", events: 'Halal events', deals: 'Discounts', volunteer: 'Volunteer in Luton', foodbank: 'Luton Foodbank', winter: 'Winter campaign', local: 'Discover', listen: 'Listen', watch: 'Watch', prayer: 'Prayers', jummah: 'Jummah', duas: 'Duas', quran: 'Quran', seasons: 'Islamic dates', community: "What's on", news: 'Luton news', help: 'Find help', involved: 'Get involved', eid: 'Inspire Eid', give: 'Give', advertise: 'Advertise', about: 'About', contact: 'Contact', privacy: 'Privacy', toolbox: 'Islamic Toolbox' };
function chrome(id) {
  setTimeout(() => document.dispatchEvent(new CustomEvent('ifm:page', { detail: id })), 0);
  document.body.className = document.body.className.replace(/\bpg-\S+/g, '').trim(); document.body.classList.add('pg-' + id);
  $('#abT').textContent = TITLE[id] || ''; $('#appbar').classList.toggle('root', ROOTS.includes(id)); document.body.classList.toggle('root-tab', ROOTS.includes(id));
  const pg = $(`.page[data-page="${id}"]`); if (pg && id !== 'home' && id !== 'eid' && id !== 'winter' && !$('.ltitle', pg)) { const h = document.createElement('h2'); h.className = 'ltitle'; h.textContent = TITLE[id] || ''; pg.prepend(h); }
}
addEventListener('scroll', () => $('#appbar').classList.toggle('sc', scrollY > 30), { passive: true });
$('#abBack').onclick = () => { if (canBack()) history.back(); else location.hash = '#home'; };
/* while something plays, the centre tab opens the full player */
document.addEventListener('click', e => { const m = e.target.closest('#tabbar .mid'); if (m && document.body.classList.contains('playing') && !document.body.classList.contains('np-open')) { e.preventDefault(); e.stopPropagation(); if (location.hash !== '#listen') { location.hash = '#listen'; setTimeout(() => openNP(npMode), 320); } else openNP(npMode); } }, true);
$('#npChip').onclick = e => { if (e.target.closest('#npcTg')) { npToggle(npMode); return; } openNP(npMode); };
$('#abMore').onclick = () => $('#tabMore').click();
/* qibla screen stays put: no scrolling, rubber-banding or pinch */
addEventListener('touchmove', e => { if (e.target.closest && e.target.closest('.scr-body .qb')) e.preventDefault(); }, { passive: false });
/* swipe between the main tabs */
(() => { let sx = 0, sy = 0, st = 0, ok = false;
  /* never change tab when the finger starts on something that moves sideways by itself: any row that scrolls
     horizontally (carousels, chips, rails, tabs), the partner marquee, sliders and maps */
  const sideways = t => { for (let el = t; el && el !== document.body; el = el.parentElement) {
      if (el.scrollWidth > el.clientWidth + 2) { const o = getComputedStyle(el).overflowX; if (o === 'auto' || o === 'scroll') return true; } } return false; };
  const blocked = t => !!t.closest('input,textarea,select,iframe,canvas,.rail,.wv-rail,.ah-stories,.ah-icons,.tk-seg,.wv-chips,.filt,.days,.hc-grid,.qb,.np,.vp,.scr-wrap,.rfeed,.modal,.drawer,.ab-grid,#marq,[data-noswipe]') || sideways(t);
  addEventListener('touchstart', e => { if (!matchMedia('(max-width:760px)').matches || e.touches.length > 1) { ok = false; return; } const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = !blocked(e.target) && sx > 18 && sx < innerWidth - 18; }, { passive: true });
  addEventListener('touchend', e => { if (!ok) return; ok = false; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * .6 || Date.now() - st > 700) return;
    const cur = (location.hash.slice(1) || 'home').replace(/^tb-.*/, 'toolbox'), i = ROOTS.indexOf(TABS[cur] || cur); if (i < 0) return; const j = i + (dx < 0 ? 1 : -1); if (j < 0 || j >= ROOTS.length) return;
    location.hash = '#' + ROOTS[j]; requestAnimationFrame(() => { const p = $(`.page[data-page="${ROOTS[j]}"]`); if (p) { p.classList.remove('sw-l', 'sw-r', 'back-anim'); void p.offsetWidth; p.classList.add(dx < 0 ? 'sw-l' : 'sw-r'); } }); if (navigator.vibrate) navigator.vibrate(6); }, { passive: true });
})();

fetch('jamaat.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j && j.masjids) D.jamaat = Object.assign(D.jamaat || {}, j.masjids); }).catch(() => {});
window.IFMX = { $, $$, esc, I, store, toast, copy, share, siteUrl, modal, closeModal, prayerTimes, hm, h12, toH, lon, greg, hijri, today, dur, pad, M, D, TOOLS, formHelper, burst: () => burst(), asr: () => asrF, LAT, LNG, dkey, miles, geocode: v => geocode(v), LOGOFILES, speak, setMenu, showAt, PR, openNP: (m, ap) => openNP(m, ap), syncTabs: id => syncTabs(id) };
/* ================= boot ================= */
/* NGS features (Find help, halal events, discounts, volunteering, Luton Foodbank) run in a frame from ngs/ */
/* an embedded page must never step the app's own history: links inside it replace instead of adding entries,
   and its back goes to its own start page. If it ever comes back blank, it is reloaded with a spinner. */
function nxTame(f) { try { const w = f.contentWindow; if (!w || w.__ifmTamed) return; w.__ifmTamed = 1; const h = w.history, home = f.dataset.src;
    h.pushState = function (st, t, u) { return h.replaceState(st, t, u); };
    h.back = function () { w.location.replace(home); }; h.go = function (n) { if (n < 0) w.location.replace(home); };
    w.addEventListener('click', e => { if (e.defaultPrevented) return; const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || a.target === '_blank') return; const href = a.getAttribute('href'); if (href.length < 2) return; e.preventDefault(); w.location.replace(href); });
  } catch (e) {} }
function nxHealthy(f) { try { const d = f.contentDocument; return !!(d && d.body && d.body.scrollHeight > 400 && [...d.querySelectorAll('.page')].some(x => !x.hidden && x.offsetHeight > 100)); } catch (e) { return true; } }
function nxReload(f) { f.__ifmTamed = 0; f.parentNode.classList.add('ld'); const done = () => f.parentNode.classList.remove('ld'); f.addEventListener('load', () => { nxTame(f); setTimeout(done, 200); }, { once: true }); setTimeout(done, 6000); const [u, hsh] = f.dataset.src.split('#'); f.src = u + (u.includes('?') ? '&' : '?') + 'r=' + Date.now() + (hsh ? '#' + hsh : ''); }
function nxOpen(id) { const f = $(`.page[data-page="${id}"] .nxf`); if (!f) return; const fit = () => { f.style.height = Math.max(400, innerHeight - f.getBoundingClientRect().top - scrollY - 4) + 'px'; }; if (!f.src) { f.parentNode.classList.add('ld'); const done = () => f.parentNode.classList.remove('ld'); f.addEventListener('load', () => { nxTame(f); setTimeout(done, 150); }, { once: true }); f.addEventListener('load', () => nxTame(f)); addEventListener('message', function m(e) { if (e.source === f.contentWindow && e.data && e.data.ngsReady !== undefined) { done(); removeEventListener('message', m); } }); setTimeout(done, 6000); f.src = f.dataset.src; } else { /* coming back: if the embedded page drifted to another section (in-frame links, back button), put it back */
    try { const want = (f.dataset.src.split('#')[1] || ''), w = f.contentWindow; if (want && w.location.hash.slice(1) !== want) w.location.replace(f.dataset.src); else { w.dispatchEvent(new HashChangeEvent('hashchange')); w.scrollTo(0, 0); } nxTame(f); } catch (e) { f.src = f.dataset.src; }
    setTimeout(() => { if (!$(`.page[data-page="${id}"]`).hidden && !nxHealthy(f)) nxReload(f); }, 1200); }
  fit(); addEventListener('resize', fit); setTimeout(fit, 400); }
const INIT = {
  events() { nxOpen('events'); }, activities() { nxOpen('activities'); }, deals() { nxOpen('deals'); }, volunteer() { nxOpen('volunteer'); }, foodbank() { nxOpen('foodbank'); },
  winter() { const f = $('#wfFrame'); const fit = () => { f.style.height = Math.max(400, innerHeight - f.getBoundingClientRect().top - scrollY) + 'px'; }; f.src = 'winter/index.html'; fit(); addEventListener('resize', fit); setTimeout(fit, 400); },
  home() { heroCanvas(); rotWord(); $('#podRail').innerHTML = D.pods.map(podCard).join(''); loadReels(); rail($('#podRail')); rail($('#reelRail')); if ($('#homeEvents')) $('#homeEvents').innerHTML = D.events.slice(0, 3).map(e => evCard({ ...e, from: 'inspire' })).join(''); if ($('#homeNews')) $('#homeNews').innerHTML = D.news.slice(0, 3).map(newsCard).join(''); marquee(); appealMeter(); amounts(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(bentoWall); },
  listen: initListen, watch: initWatch, prayer() { initPrayer(); initAlerts(); alSetup(); initQibla(); }, jummah: initJummah, duas: initDuas, quran: initQuran, seasons: initSeasons, community: initCommunity, news: initNews, help() { nxOpen('help'); }, involved: initInvolved, eid: initEid, give() { initGive(); appealMeter(); }, advertise: initAdvertise, about: initAbout, contact: initContact, toolbox: initToolbox
};
if (/^#tb-/.test(location.hash)) addEventListener('load', route); else route();
onAir(); tickClock(); lvCard(); addEventListener('load', () => setTimeout(() => { if (document.querySelector('link[data-nxpre]')) return; const l = document.createElement('link'); l.rel = 'prefetch'; l.href = 'ngs/index.html?embed=1'; l.dataset.nxpre = 1; document.head.appendChild(l); }, 2500));
setInterval(tickClock, 1000); setInterval(onAir, 30e3);
if (location.hash === '#jummah' || location.hash === '#help') loadHelpData();
else setTimeout(loadHelpData, 4000);
})();
