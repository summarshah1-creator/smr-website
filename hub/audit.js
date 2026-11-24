/* Luton Community Hub: audit.js (quality pass, 24 Nov 2026)
   1) A "Sources" footer (official links + "Last checked 24 Nov 2026") and the right disclaimer at the bottom of every
      section that states facts, rules, figures or offers. Pages that already show their own sources keep them and get
      the disclaimer only.
   2) Accessibility tidy-up after each render: icon-only buttons and unlabelled fields get a readable name.
   3) Typed date boxes become proper date pickers (from / to), joined back into one line when the form is sent.
   Loaded after ux.js. Works on its own, from outside, so the other files stay as they are. */
(() => {
'use strict';
const CHECKED = '24 Nov 2026';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- disclaimers, one per topic ---------- */
const DIS = {
  legal: 'General guidance only, not legal advice. Laws and official guidance change, so check the source or take advice for your situation.',
  fin: 'General guidance only, not financial or tax advice. Check HMRC’s guidance or a qualified adviser before you claim or decide.',
  fund: 'Funding information only, not financial advice. Always check eligibility, amounts and deadlines on the funder’s own website before you apply.',
  safe: 'General guidance only, not legal advice. If a child or adult is in immediate danger, call 999. For other worries, follow your safeguarding policy and talk to your safeguarding lead.',
  hs: 'General guidance only. It doesn’t replace your own risk assessment or advice from your venue, insurer or the HSE.',
  careers: 'General careers information, not personal advice. Entry requirements, pay and courses change, so check with the college, employer or the National Careers Service.',
  offers: 'Offers are run by the brands, not by the hub. Check the terms, who qualifies and the end date with the brand before you rely on one.',
  dir: 'Information supplied by organisations and public sources. Details can change, so check with them before you go.',
  help: 'Information supplied by organisations and public sources. Details can change, so check with them before you go. In an emergency call 999; for urgent health advice call NHS 111.',
  prayer: 'Times come from each masjid’s own timetable and can change, especially in Ramadan and when the clocks change. Check with the masjid.',
  stats: 'Official figures as published. Quote the source and year, and check the funder hasn’t asked for a different year or area.',
};
const GOV = (p, t) => ['https://www.gov.uk/' + p, t];
const S = {
  luton: ['https://www.luton.gov.uk/', 'Luton Council'],
  cc: ['https://www.gov.uk/government/organisations/charity-commission', 'Charity Commission'],
  ccreg: ['https://register-of-charities.charitycommission.gov.uk/', 'Register of charities'],
  gias: ['https://get-information-schools.service.gov.uk/', 'Get Information about Schools'],
  ico: ['https://ico.org.uk/for-organisations/', 'ICO guidance for organisations'],
  hse: ['https://www.hse.gov.uk/', 'Health and Safety Executive'],
  ncs: ['https://nationalcareers.service.gov.uk/', 'National Careers Service'],
  fr: ['https://www.fundraisingregulator.org.uk/code', 'Fundraising Regulator: Code of Fundraising Practice'],
  ga: GOV('claim-gift-aid', 'GOV.UK: Claim Gift Aid'),
  nmw: GOV('national-minimum-wage-rates', 'GOV.UK: minimum wage rates'),
  appr: GOV('become-apprentice', 'GOV.UK: become an apprentice'),
  fca: ['https://www.findapprenticeship.service.gov.uk/', 'Find an apprenticeship'],
  kcsie: GOV('government/publications/keeping-children-safe-in-education--2', 'Keeping children safe in education'),
  dbs: GOV('government/organisations/disclosure-and-barring-service', 'Disclosure and Barring Service'),
  nhs: ['https://111.nhs.uk/', 'NHS 111'],
  ca: ['https://www.citizensadvice.org.uk/', 'Citizens Advice'],
  ben: GOV('browse/benefits', 'GOV.UK: benefits'),
  g360: ['https://grantnav.threesixtygiving.org/', '360Giving GrantNav'],
  blcf: ['https://blcf.org.uk/', 'Bedfordshire & Luton Community Foundation'],
  ons: ['https://www.ons.gov.uk/', 'Office for National Statistics'],
  imd: GOV('government/statistics/english-indices-of-deprivation-2025', 'English Indices of Deprivation 2025'),
  ncvo: ['https://www.ncvo.org.uk/help-and-guidance/involving-volunteers/', 'NCVO: involving volunteers'],
  vol: GOV('volunteering', 'GOV.UK: volunteering'),
  rail: ['https://www.railcard.co.uk/', 'National Railcards'],
  asa: ['https://www.asa.org.uk/codes-and-rulings/advertising-codes.html', 'ASA advertising codes'],
};
/* route -> [disclaimer, sources]. Empty sources = the page lists its own sources (or links to each organisation). */
const MAP = {
  help: ['help', [S.luton, S.ca, S.nhs, S.ben]], needs: ['dir', []], volunteering: ['dir', [S.ncvo, S.vol]], training: ['dir', []], probono: ['dir', []],
  prayer: ['prayer', []], calendar: ['dir', []], venues: ['dir', []], events: ['dir', []], activities: ['dir', []],
  discounts: ['offers', []], youth: ['offers', [S.rail]], staff: ['offers', []], freekit: ['offers', []],
  careers: ['careers', [S.ncs, S.appr, S.fca, S.nmw]],
  funding: ['fund', [S.blcf, S.g360]], pastfunders: ['fund', [S.g360]], sponsor: ['fund', [S.asa]], partners: ['fund', []], numbers: ['stats', [S.ons, S.imd, S.luton]],
  writer: ['fund', [S.fr]], impact: ['fund', []], appeals: ['fin', [S.fr, S.ga]], donate: ['fin', [S.fr, S.ga]],
  howto: ['legal', [S.ico, S.asa]], forms: ['legal', [S.ico]],
  policies: ['legal', [S.cc, S.ico, S.kcsie, S.hse]], templates: ['legal', [S.cc, S.ico]],
  directory: ['dir', [S.ccreg, S.gias, S.luton]], org: ['dir', [S.ccreg]],
  giftaid: ['fin', []], dbshelp: ['safe', []], riskbuild: ['hs', []], dpcheck: ['legal', []], bidcheck: ['fund', []], appealkit: ['fin', []],
  volrole: ['legal', []], toc: ['fund', []], evplan: ['hs', []], evpromo: ['legal', [S.ico]], seasonal: ['dir', []],
  hours: ['legal', [S.ncvo]], setup: ['dir', [S.ccreg]],
};
const TOOLMAP = { ga_calc: 'giftaid', dbs_lvl: 'dbshelp', ra_build: 'riskbuild', dp_chk: 'dpcheck', bid_ck: 'bidcheck', ap_kit: 'appealkit', v_role: 'volrole', toc_ws: 'toc', ev_plan: 'evplan', cl_find: 'careers', f_match: 'funding', h_who: 'help', tr_need: 'training', sp_plan: 'sponsor', sp_who: 'sponsor', sp_val: 'sponsor', fk_check: 'freekit', d_need: 'help', clash: 'calendar' };
const reportBtn = () => document.querySelector('[data-xq="logo-report"]') ? '' : '';
const footer = (key, hasOwn) => { const m = MAP[key]; if (!m) return ''; const [d, src] = m;
  const links = src.length && !hasOwn ? `<span class="hsrc-l">${src.map(([u, t]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ')}</span>` : '';
  const rep = ['dir', 'help', 'prayer', 'offers'].includes(d) ? ` <button type="button" class="linkbtn" data-xq="logo-report">Report a change</button>` : '';
  return `<aside class="hsrc" aria-label="Sources and disclaimer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21a9 9 0 110-18 9 9 0 010 18zM12 11v5M12 8h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><div>${hasOwn ? '' : `<b>${src.length ? 'Sources' : 'About this information'} · last checked ${CHECKED}</b>`}${links}<p>${esc(DIS[d])}${rep}</p></div></aside>`; };

const routeKey = () => { const h = (location.hash || '#home').slice(1); const [v, ...rest] = h.split('-'); if (v === 'tool') return TOOLMAP[rest.join('-')] || null; return v; };
function addFooter() {
  const main = $('#main'); if (!main || $('.hsrc', main) || $('.landing', main)) return;
  const key = routeKey(); if (!key || !MAP[key]) return;
  const w = $(':scope > .wrap', main) || main; const own = !!$('.t3src', w);
  const html = footer(key, own); if (!html) return;
  const before = $(':scope > .minnudge', w) || $(':scope > .fnote', w);
  before ? before.insertAdjacentHTML('beforebegin', html) : w.insertAdjacentHTML('beforeend', html);
}

/* ---------- accessibility tidy-up ---------- */
const nameOf = el => (el.getAttribute('aria-label') || el.title || el.innerText || '').trim();
const nearText = el => { let n = el; for (let up = 0; up < 3 && n; up++, n = n.parentElement) { let p = n.previousElementSibling; for (let i = 0; i < 3 && p; i++, p = p.previousElementSibling) { const t = (p.innerText || '').trim(); if (t && !p.matches('input,select,textarea,button')) return t.split('\n')[0].slice(0, 90); } } return ''; };
function a11y() {
  $$('#main button, .modal button, .sheet button').forEach(b => { if (nameOf(b)) return;
    let n = '';
    if (b.dataset.sharem) n = 'Share: ' + b.dataset.sharem.split('\n')[0];
    else if (b.dataset.lpprev) n = 'Preview: ' + b.dataset.lpprev;
    else if (b.matches('[data-close]')) n = 'Close';
    else if (b.dataset.save || b.className.includes('save')) n = 'Save';
    else { const t = b.closest('[data-title]'); n = t ? t.dataset.title : ''; }
    if (!n) { const s = b.querySelector('svg title'); n = s ? s.textContent : ''; }
    if (n) b.setAttribute('aria-label', n.slice(0, 120)); });
  $$('#main input:not([type=hidden]), #main select, #main textarea, .modal input:not([type=hidden]), .modal select, .modal textarea').forEach(i => {
    if (i.getAttribute('aria-hidden') === 'true' || i.labels?.length || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby')) return;
    const t = nearText(i) || i.placeholder || (i.name || '').replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
    if (t) i.setAttribute('aria-label', t); });
}

/* ---------- typed "Dates" boxes become date pickers ---------- */
const fmt = v => { if (!v) return ''; const d = new Date(v + 'T12:00:00'); return isNaN(d) ? v : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); };
function datePickers() {
  $$('#main input[name=dates]:not([type=hidden])').forEach(inp => {
    const lab = inp.closest('label'); const box = document.createElement('label'); box.className = 'f hdr8';
    const t = lab ? ([...lab.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()) || {}).textContent?.trim() || 'Dates' : 'Dates';
    box.innerHTML = `${esc(t)}<span class="hdr8-r"><span class="hdr8-c"><small>From</small><input class="in" type="date" name="dates_from" aria-label="${esc(t)}: from"></span><span class="hdr8-c"><small>To (optional)</small><input class="in" type="date" name="dates_to" aria-label="${esc(t)}: to"></span></span><input type="hidden" name="dates">`;
    (lab || inp).replaceWith(box);
    const [a, b] = $$('input[type=date]', box); a.addEventListener('change', () => { if (b.value && b.value < a.value) b.value = ''; b.min = a.value; });
  });
}
document.addEventListener('submit', e => { const f = e.target; const h = f.querySelector && f.querySelector('.hdr8 input[name=dates]'); if (!h) return;
  const a = f.querySelector('[name=dates_from]').value, b = f.querySelector('[name=dates_to]').value; h.value = a ? (b && b !== a ? fmt(a) + ' to ' + fmt(b) : fmt(a)) : ''; }, true);


/* ---------- your work, kept on the server too ----------
   Tool answers, plans, checklists, reminders and saved items were only kept in this browser. They are now copied
   to the hub server (your own private space: data/users/<you>, only you can read it) a moment after each change,
   and brought back when you open the hub on another visit or after clearing the browser. Newest copy wins. */
const WORK = /^lch-(tool-|t3|ra-|ap-|reminders$|soccal|evticks$|dpticks$|bidck$|vrind$|savedTools$|saved$|statpick$|spquiz$|sponsorck$|polprog$|pitch$|kit$|clash$|hourslog$|legalticks$|fundAns$|gatab$|budget|evbud|minutes|caps-)/;
let wdb = null, wme = null, wTimer = 0, wBusy = false;
const wGather = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (WORK.test(k)) o[k] = localStorage.getItem(k); } return o; };
const wPush = () => { clearTimeout(wTimer); wTimer = setTimeout(async () => { if (!wdb || !wme || wBusy) return; const keys = wGather(), at = Date.now();
  try { const raw = JSON.stringify(keys); if (raw.length > 190000) return; await wdb.collection('data/users/' + wme).doc('work').set({ keys, at }); localStorage.setItem('lch-__workat', String(at)); } catch (e) { } }, 1500); };
const origSet = Storage.prototype.setItem, origDel = Storage.prototype.removeItem;
Storage.prototype.setItem = function (k, v) { origSet.call(this, k, v); if (this === localStorage && WORK.test(k) && !wBusy) wPush(); };
Storage.prototype.removeItem = function (k) { origDel.call(this, k); if (this === localStorage && WORK.test(k) && !wBusy) wPush(); };
(async () => { try { if (!window.claude) return; wdb = await claude.use('db'); const u = await claude.use('user'); wme = await u.id(); if (!wdb || !wme) return;
  const d = await wdb.collection('data/users/' + wme).doc('work').get(); const local = +(localStorage.getItem('lch-__workat') || 0);
  if (d && d.exists) { const v = d.data() || {}; if ((v.at || 0) > local && v.keys) { wBusy = true; let n = 0;
      Object.entries(v.keys).forEach(([k, val]) => { if (WORK.test(k) && localStorage.getItem(k) !== val) { origSet.call(localStorage, k, val); n++; } });
      origSet.call(localStorage, 'lch-__workat', String(v.at)); wBusy = false; if (n) window.dispatchEvent(new HashChangeEvent('hashchange')); }
    else if (local > (v.at || 0)) wPush(); }
  else if (Object.keys(wGather()).length) wPush(); } catch (e) { wBusy = false; } })();

/* ---------- styles ---------- */
const css = document.createElement('style');
css.textContent = `.hsrc{display:flex;gap:10px;align-items:flex-start;margin:22px 0 6px;padding:12px 14px;border-radius:14px;background:var(--soft,#EEEDF8);font-size:13px;line-height:1.5;color:inherit}
.hsrc>svg{flex:none;width:18px;height:18px;margin-top:1px;color:#4545D6}.hsrc b{display:block;margin-bottom:2px}.hsrc-l{display:block;margin-bottom:4px}
.hsrc a{color:inherit;text-decoration:underline;text-underline-offset:2px}.hsrc p{margin:0;opacity:.85}.hsrc .linkbtn{font-size:13px}
.t3src+.hsrc{margin-top:8px}
.hdr8-r{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}.hdr8-c{display:flex;flex-direction:column;gap:4px;min-width:0}.hdr8-c small{font-size:13px;opacity:.75;font-weight:400}.hdr8-c .in{min-width:0;width:100%}
.cfnext{margin:0 0 14px;padding:14px 16px;border-radius:16px;background:linear-gradient(135deg,#EEF0FF,#F6EEFF);border:1px solid #DCD9F7}.cfnext h3{margin:0 0 8px;font-size:17px}
.cfnext ol{margin:0;padding-left:22px;display:grid;gap:8px;line-height:1.5}.cfnext li::marker{font-weight:800;color:#4545D6}
.cfpay{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0;padding:8px 10px;border-radius:10px;background:var(--soft,#F3F2FA)}.cfpay span{display:flex;flex-direction:column;min-width:0}.cfpay small{font-size:11.5px;opacity:.7}.cfpay b{font-size:14px}
.cf .cfmore{display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:#4545D6;text-decoration:underline;text-underline-offset:2px}
@media print{.hsrc{break-inside:avoid;background:none;border:1px solid #ccc}}`;
document.head.appendChild(css);

/* ---------- run after every render ---------- */
/* one proof notice per page (the brief, studio and systems pages had two saying the same thing) */
function dedupe() { const m = $('#main'); if (!m) return; const no = $('.noorder', m); if (!no) return;
  $$('.notice', m).forEach(n => { if (n !== no && !n.closest('.ux-hid') && /proof/i.test(n.textContent) && /approve/i.test(n.textContent) && n.textContent.length < 200) n.remove(); }); }
let q = 0; const run = () => { q = 0; try { datePickers(); dedupe(); addFooter(); a11y(); } catch (e) { } };
const sched = () => { if (!q) q = requestAnimationFrame(run); };
const start = () => { const m = $('#main'); if (!m) return setTimeout(start, 50); new MutationObserver(sched).observe(m, { childList: true, subtree: true }); new MutationObserver(sched).observe(document.body, { childList: true }); sched(); };
start();
window.LCH_AUDIT = { MAP, DIS, CHECKED };
})();
