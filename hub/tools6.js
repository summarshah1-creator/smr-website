/* Luton Community Hub: tools6.js (24 Nov 2026)
   Everything from the NGS app's Student Pathfinder and Skills & Training Finder, brought into Careers & Learning:
   - Course & training finder (#courses): 198 real courses, programmes and jobs-with-training (checked 16 Nov 2026),
     with search, sector, cost, where, how, age and "what happens after" filters, nearest-first by postcode, saved
     courses, warnings about fast-track courses, share and copy. Flow modelled on the National Careers Service course
     finder and Indeed's filters (search first, chips under it, result count, clear filters, detail on tap).
   - Career finder results gain the subjects each career needs, GCSE and post-16 advice for the area, and matching
     local courses.
   - New Careers & Learning tabs: Course finder, GCSE options, Money help at 16 to 18 (7-question checker).
   Data: skills-data.js (window.NGS_SKILLS) and careers-data.js (window.LCH_CAREERS.PF). */
(window.LCH_EXT = window.LCH_EXT || []).push(L => {
const T = L.T3; if (!T) return;
const { V, store, esc, toast, back, TOOL, GLYPH } = L;
const { si, $, $$, addNav, regTool, q1, tCard, TL } = T;
const SK = window.NGS_SKILLS, CD = window.LCH_CAREERS || {}, PF = CD.PF || {};
if (!SK) return;
Object.assign(GLYPH, { i_courses: 'M3 8l9-4 9 4-9 4-9-4zM7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5M21 8v6' });
TOOL.courses = ['hex', 'b', 'y', 'i_courses'];
addNav('find', [['courses', 'Course & training finder', 'tr', `${SK.listings.length} courses and jobs with training, in Luton, nearby and online`]], 'careers');

/* ---------- course finder ---------- */
const COST = [['free', 'Free'], ['funded', 'Free if you qualify'], ['earn', 'Paid while you train'], ['paid', 'Paid course']];
const REACH = [['luton', 'In Luton'], ['nearby', 'Nearby'], ['online', 'Online'], ['uk', 'Further away']];
const MODE = { 'in-person': 'In person', online: 'Online', blended: 'Mixed' };
const OUT = { job: 'Job at the end', interview: 'Guaranteed interview', support: 'Help finding work', demand: 'Jobs in demand', business: 'Start a business' };
const LIVE = { running: 'Running now', rolling: 'Recruits all year', intake: 'Regular intake', ask: 'Ask for dates' };
const SEC = SK.sectors || {};
const cf = () => Object.assign({ q: '', sec: '', cost: [], reach: ['luton', 'nearby', 'online'], mode: '', age: '', out: '', pc: '' }, store.get('cf-filter', {}) || {});
const saved = () => store.get('courses-saved', []) || [];
const dist = (pc, l) => { const P = SK.postcodes || {}, s0 = String(pc || '').toUpperCase().replace(/\s+/g, ''), k = s0.length > 4 ? s0.slice(0, -3) : s0; const p = k && P[k]; if (!p || l.lat == null) return null;
  const R = 3959, r = x => x * Math.PI / 180, dLa = r(l.lat - p[0]), dLo = r(l.lng - p[1]); const a = Math.sin(dLa / 2) ** 2 + Math.cos(r(p[0])) * Math.cos(r(l.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(a)); };
const match = (f, l) => { const age = +f.age || 0;
  if (f.sec && l.sector !== f.sec) return false; if (f.cost.length && !f.cost.includes(l.cost)) return false; if (f.reach.length && !f.reach.includes(l.reach)) return false;
  if (f.mode && l.mode !== f.mode) return false; if (f.out && l.outcome !== f.out) return false; if (age && ((l.ageMin && age < l.ageMin) || (l.ageMax && age > l.ageMax))) return false;
  if (f.q) { const t = [l.title, l.provider, l.summary, l.qual, (l.tags || []).join(' '), (SEC[l.sector] || {}).name].join(' ').toLowerCase(); if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every(w => t.includes(w))) return false; }
  return true; };
const ORD = { luton: 0, nearby: 1, online: 2, uk: 3 };
const results = f => { const l = SK.listings.filter(x => match(f, x)).map(x => ({ x, d: f.pc ? dist(f.pc, x) : null }));
  return l.sort((a, b) => (a.d != null && b.d != null ? a.d - b.d : (a.d == null) - (b.d == null)) || ORD[a.x.reach] - ORD[b.x.reach] || (a.x.cost === 'paid') - (b.x.cost === 'paid')); };
const costTag = l => ({ free: ['g', 'Free'], funded: ['g', 'Free if you qualify'], earn: ['b', 'Paid while you train'], paid: ['o', l.price || 'Paid'] }[l.cost] || ['o', l.price || '']);
const ccard = ({ x: l, d }) => { const [tc, tt] = costTag(l), on = saved().includes(l.id);
  return `<article class="ccard" id="cc-${esc(l.id)}"><div class="cch"><span class="ctag ${tc}">${esc(tt)}</span><span class="ctag">${esc((SEC[l.sector] || {}).name || l.sector)}</span>${l.outcome ? `<span class="ctag y">${esc(OUT[l.outcome] || '')}</span>` : ''}</div>
  <h3>${esc(l.title)}</h3><p class="cprov">${esc(l.provider)}</p><p>${esc(l.summary)}</p>
  <dl class="cdl">${l.qual ? `<dt>You get</dt><dd>${esc(l.qual)}</dd>` : ''}${l.duration ? `<dt>How long</dt><dd>${esc(l.duration)}</dd>` : ''}<dt>Where</dt><dd>${esc(l.place || REACH.find(r => r[0] === l.reach)?.[1] || '')}${d != null ? ` · about ${d < 1 ? 'under 1' : Math.round(d)} mile${Math.round(d) === 1 ? '' : 's'}` : ''} · ${esc(MODE[l.mode] || '')}</dd>${l.price && l.cost !== 'free' ? `<dt>Cost</dt><dd>${esc(l.price)}</dd>` : ''}<dt>When</dt><dd>${esc(LIVE[l.live] || '')}${l.when ? ': ' + esc(l.when) : ''}</dd></dl>
  <details class="cmore"><summary>Who can apply, how to apply, and checks</summary>
    ${(l.eligibility || []).length ? `<h4>Who can apply</h4><ul>${l.eligibility.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}${l.forWho ? `<p><b>Good for:</b> ${esc(l.forWho)}</p>` : ''}${l.needs ? `<p><b>You’ll need:</b> ${esc(Array.isArray(l.needs) ? l.needs.join(', ') : l.needs)}</p>` : ''}
    ${l.outcomeText ? `<h4>What happens after</h4><p>${esc(l.outcomeText)}</p>` : ''}${l.demand ? `<p class="note">${esc(l.demand)}</p>` : ''}
    ${(l.discounts || []).length ? `<h4>Ways to pay less</h4><ul>${l.discounts.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}${l.travel ? `<p><b>Getting there:</b> ${esc(l.travel)}</p>` : ''}${l.worthTrip ? `<p><b>Worth the trip:</b> ${esc(l.worthTrip)}</p>` : ''}
    ${l.apply ? `<h4>How to apply</h4><p>${esc(l.apply)}</p>` : ''}${l.accreditation ? `<p class="note">${esc(l.accreditation)}</p>` : ''}${(l.checks || []).length ? `<p class="note">Checked: ${esc(l.checks.join(' · '))}</p>` : ''}</details>
  <div class="row"><a class="btn p sm" href="${esc(l.link)}" target="_blank" rel="noopener">Course details</a><button type="button" class="btn s sm${on ? ' on' : ''}" data-csave="${esc(l.id)}" aria-pressed="${on}">${si('bookmark')} ${on ? 'Saved' : 'Save'}</button><button type="button" class="btn s sm" data-cshare="${esc(l.id)}">${si('share')} Pass it on</button></div></article>`; };
const filtersHTML = f => `<div class="cfbar"><label class="cfsearch">${si('search')}<input class="in" type="search" id="cfQ" value="${esc(f.q)}" placeholder="Search: forklift, nursing, coding, ESOL…" aria-label="Search courses"></label>
  <div class="cfrow"><select class="in" id="cfSec" data-uxd="1" aria-label="Type of work"><option value="">All types of work</option>${Object.entries(SEC).map(([k, v]) => `<option value="${k}"${f.sec === k ? ' selected' : ''}>${esc(v.name)}</option>`).join('')}</select>
  <input class="in" id="cfPc" value="${esc(f.pc)}" placeholder="Postcode for nearest first" aria-label="Your postcode, for nearest first" autocomplete="postal-code" maxlength="8">
  <input class="in" id="cfAge" value="${esc(f.age)}" inputmode="numeric" placeholder="Age" aria-label="Your age" maxlength="2"></div>
  <div class="t5chips" role="group" aria-label="Cost">${COST.map(([v, l]) => `<label class="t5chip"><input type="checkbox" data-cfc="cost" value="${v}"${f.cost.includes(v) ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <div class="t5chips" role="group" aria-label="Where">${REACH.map(([v, l]) => `<label class="t5chip"><input type="checkbox" data-cfc="reach" value="${v}"${f.reach.includes(v) ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
  <div class="cfrow"><select class="in" id="cfMode" data-uxd="1" aria-label="How"><option value="">In person or online</option>${Object.entries(MODE).map(([k, v]) => `<option value="${k}"${f.mode === k ? ' selected' : ''}>${v}</option>`).join('')}</select><select class="in" id="cfOut" data-uxd="1" aria-label="What happens after"><option value="">Any outcome</option>${Object.entries(OUT).map(([k, v]) => `<option value="${k}"${f.out === k ? ' selected' : ''}>${v}</option>`).join('')}</select></div></div>`;
const listHTML = f => { const r = results(f), w = (SK.warnings || []).filter(x => !f.sec || x.sector === f.sec), sv = saved();
  return `<div class="cfhead"><b>${r.length} course${r.length === 1 ? '' : 's'}</b><span>${sv.length ? `<button type="button" class="linkbtn" data-cfsaved>Saved (${sv.length})</button> · ` : ''}<button type="button" class="linkbtn" data-cfclear>Clear filters</button></span></div>
  ${f.sec ? w.map(x => `<aside class="cfwarn"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></aside>`).join('') : ''}
  ${r.length ? `<div class="cgrid">${r.slice(0, 60).map(ccard).join('')}</div>${r.length > 60 ? `<p class="note">Showing the first 60. Add a search word or a filter to narrow it down.</p>` : ''}` : `<div class="t5empty"><b>Nothing matches all of that</b><span>Try fewer filters, add “Online”, or clear them.</span><button type="button" class="btn s sm" data-cfclear>Clear filters</button></div>`}`; };
const finder = () => { const f = cf(); return `<div class="cfind" id="cfind">${filtersHTML(f)}<div id="cfList" aria-live="polite">${listHTML(f)}</div>
  <p class="note">Every listing is a real course, programme or job with training, checked on the provider’s own site on ${esc(SK.checked)}. Dates, prices and rules change: check with the provider before you apply.</p></div>`; };
V.courses = () => `<div class="wrap fpage">${back('careers', 'Careers & Learning', 'Course & training finder')}<div class="sec-h"><div><h1>Course & training finder</h1><p class="lede">Free and funded courses, apprenticeships and jobs with training in Luton, nearby and online. Search, filter and pass them on to the people you support.</p></div></div>${finder()}</div>`;
let cfT = 0; const cfUpd = () => { const f = cf(); f.q = $('#cfQ')?.value.trim() || ''; f.sec = $('#cfSec')?.value || ''; f.pc = $('#cfPc')?.value.trim() || ''; f.age = ($('#cfAge')?.value || '').replace(/\D/g, ''); f.mode = $('#cfMode')?.value || ''; f.out = $('#cfOut')?.value || '';
  f.cost = $$('[data-cfc=cost]:checked').map(x => x.value); f.reach = $$('[data-cfc=reach]:checked').map(x => x.value); store.set('cf-filter', f); const o = $('#cfList'); if (o) o.innerHTML = listHTML(f); };
document.addEventListener('input', e => { if (e.target.closest('#cfind') && e.target.matches('input')) { clearTimeout(cfT); cfT = setTimeout(cfUpd, 200); } });
document.addEventListener('change', e => { if (e.target.closest('#cfind')) cfUpd(); });
document.addEventListener('click', e => { if (e.target.closest('[data-cfclear]')) { store.set('cf-filter', {}); const w = $('#cfind'); if (w) w.outerHTML = finder(); return; }
  if (e.target.closest('[data-cfsaved]')) { const ids = saved(), o = $('#cfList'); if (o) o.innerHTML = `<div class="cfhead"><b>Saved courses (${ids.length})</b><button type="button" class="linkbtn" data-cfback>Back to all</button></div><div class="cgrid">${SK.listings.filter(x => ids.includes(x.id)).map(x => ccard({ x, d: null })).join('')}</div>`; return; }
  if (e.target.closest('[data-cfback]')) { cfUpd(); return; }
  const s = e.target.closest('[data-csave]'); if (s) { let l = saved(); const id = s.dataset.csave, on = !l.includes(id); l = on ? [id, ...l] : l.filter(x => x !== id); store.set('courses-saved', l); s.classList.toggle('on', on); s.setAttribute('aria-pressed', on); s.innerHTML = `${si('bookmark')} ${on ? 'Saved' : 'Save'}`; toast(on ? 'Course saved' : 'Removed from saved'); return; }
  const sh = e.target.closest('[data-cshare]'); if (sh) { const l = SK.listings.find(x => x.id === sh.dataset.cshare); if (!l) return; const t = `${l.title} (${l.provider})\n${l.summary}\n${costTag(l)[1]}${l.when ? ' · ' + l.when : ''}\n${l.link}`;
    if (navigator.share) navigator.share({ title: l.title, text: t }).catch(() => { }); else navigator.clipboard?.writeText(t).then(() => toast('Copied, ready to pass on')); } });

/* ---------- career finder: subjects, area advice, matching courses ---------- */
const AREA_SEC = { health: ['health', 'care', 'first-aid'], science: ['health'], business: ['office', 'business', 'customer'], law: ['public'], public: ['public', 'security'], tech: ['digital'], engineering: ['engineering', 'aviation'], trades: ['trades', 'construction'], creative: ['creative'], media: ['creative'], education: ['education', 'childcare'], social: ['care'], languages: ['language'], sport: ['sport', 'first-aid'], hosp: ['hospitality', 'aviation', 'customer'] };
const subjN = k => (PF.SUBJ || {})[k] || k;
if (TL.cl_find) { const res0 = TL.cl_find.res; TL.cl_find.res = a => { const r = res0(a); if (!r) return r;
  const ints = (a.int || []).length ? a.int : ['help'], areas = [...new Set(ints.flatMap(k => ((CD.INTERESTS || []).find(i => i[0] === k) || [, , []])[2]))];
  const ax = areas.map(k => [k, (PF.AX || {})[k]]).filter(x => x[1]);
  const secs = [...new Set(areas.flatMap(k => AREA_SEC[k] || []))], age = a.age === 'y' ? 17 : 22;
  const cs = SK.listings.filter(l => secs.includes(l.sector) && ['luton', 'nearby', 'online'].includes(l.reach) && !(l.ageMin && age < l.ageMin) && !(l.ageMax && age > l.ageMax)).sort((p, q) => ORD[p.reach] - ORD[q.reach] || (p.cost === 'paid') - (q.cost === 'paid')).slice(0, 4);
  let html = r.html.replace(/<dt>Apprenticeship<\/dt><dd>([\s\S]*?)<\/dd><\/dl>/g, m => m);
  // subjects on each career card
  html = html.replace(/<div class="cf"><b>([^<]+)<\/b>/g, (m, n) => { const c = (CD.CAREERS || []).find(x => esc(x[1]) === n); const nd = c && (PF.NEED || {})[c[0]]; if (!nd || (!nd[0].length && !nd[1].length)) return m;
    return m + `<span class="cfsub">${nd[0].length ? `<b>Subjects needed:</b> ${esc(nd[0].map(subjN).join(', '))}` : ''}${nd[0].length && nd[1].length ? ' · ' : ''}${nd[1].length ? `<b>Helpful:</b> ${esc(nd[1].slice(0, 4).map(subjN).join(', '))}` : ''}</span>`; });
  const axH = ax.length ? `<h3 style="margin-top:14px">How to get there</h3><div class="cfax">${ax.map(([k, x]) => `<div><b>${esc(((CD.AREAS || {})[k] || [k])[0])}</b>${x.g ? `<p><span>GCSEs:</span> ${esc(x.g)}</p>` : ''}${x.p ? `<p><span>After 16:</span> ${esc(x.p)}</p>` : ''}</div>`).join('')}</div>` : '';
  const csH = cs.length ? `<h3 style="margin-top:14px">Courses to start with</h3><div class="cfcs">${cs.map(l => `<a href="#courses" data-cfgo="${esc(l.sector)}"><b>${esc(l.title)}</b><small>${esc(l.provider)} · ${esc(costTag(l)[1])}</small></a>`).join('')}</div><p class="note"><a href="#courses">See all ${SK.listings.length} courses in the Course & training finder</a></p>` : '';
  html = html.replace('<h3 style="margin-top:14px">Local places to start</h3>', axH + csH + '<h3 style="margin-top:14px">Local places to start</h3>');
  if (!html.includes('cfcs') && csH) html += axH + csH;
  return { ...r, html, copy: r.copy + (cs.length ? `\n\nCourses to start with:\n${cs.map(l => `- ${l.title} (${l.provider}): ${l.link}`).join('\n')}` : '') }; }; }
document.addEventListener('click', e => { const g = e.target.closest('[data-cfgo]'); if (g) { const f = cf(); f.sec = g.dataset.cfgo; store.set('cf-filter', f); } });

/* ---------- money help at 16 to 18 (from the NGS pathfinder) ---------- */
const CHQ = PF.CHQ || [];
if (CHQ.length) regTool('cl_money', { route: 'careers', t: 'Money help at 16 to 18', d: '7 quick questions about a young person starting college or sixth form. You’ll see the money and free help they can ask for.', icon: 'money', done: 'Here’s what they could get',
  qs: CHQ.map((q, i) => q1('m' + i, q[0], q[1].map(o => [o, o]))),
  res: x => { const a = CHQ.map((q, i) => x['m' + i]), age = a[0] === '16, 17 or 18', R = []; const vuln = age && (a[1] === 'Yes' || a[2] === 'Yes' || a[3] === 'Yes');
    if (vuln) R.push(['£1,200', 'Vulnerable student bursary', 'Up to £1,200 a year from the 16 to 19 Bursary Fund if you’re in care, a care leaver, get Income Support or Universal Credit in your own name, or get PIP or DLA plus ESA or Universal Credit.']);
    if (age && (a[4] === 'Yes' || a[2] === 'Yes')) R.push(['Free', 'Free meals at college', 'From the 2026/27 year, students from households on Universal Credit can get free meals at college. Ask student services to set it up.']);
    if (a[4] === 'Not sure' || a[2] === 'Not sure') R.push(['Check', 'You might get free meals', 'If anyone in your household gets Universal Credit, ask your college to check for you.']);
    if (a[5] === 'Yes') R.push(['£180 a week', 'Care to Learn', 'Up to £180 per child per week (outside London) for childcare while you study, paid to your childcare provider.']);
    if (age && !vuln && (a[6] !== 'No' || a[4] === 'Yes')) R.push(['Help', 'College bursary and support funds', 'Help with travel, equipment, kit and trips, based on need. Each college sets its own rules.']);
    if (age) R.push(['Free', 'Free NHS prescriptions, dental and eye tests', 'At 16 to 18 in full-time education, plus a voucher towards glasses or contact lenses.']);
    if (age) R.push(['Half price', '16-17 Saver railcard', 'Half-price train travel for 16 and 17 year olds.']);
    if (!age) R.push(['Ask', 'Advanced Learner Loan or free courses', 'At 19 or over, many Level 3 courses are free (Free Courses for Jobs) or can be paid for with an Advanced Learner Loan. See Free courses for adults.']);
    return { h: 'Money and free help to ask about', html: `<div class="cfmoney">${R.map(([v, t, d]) => `<div><span>${esc(v)}</span><div><b>${esc(t)}</b><p>${esc(d)}</p></div></div>`).join('')}</div><p class="note">Ask the college’s student services team: they decide bursaries and can help with the forms. Amounts from GOV.UK (16 to 19 Bursary Fund, Care to Learn), checked November 2026.</p>`,
      copy: R.map(([v, t, d]) => `${t} (${v}): ${d}`).join('\n'), share: 'A quick check of the money help a young person can get at college or sixth form, on the Luton Community Hub.' }; } });

/* ---------- Careers & Learning: extra tabs ---------- */
const gcseHTML = () => { const G = PF.GC || {}, I = PF.GINFO || {};
  return `<div class="cfgc"><p class="lede" style="font-size:16px">GCSE choices in Year 9 shape what’s easy to study later. Here’s where each option can lead.</p>
  ${(G.sci || []).length ? `<h3>Science</h3><div class="grid">${G.sci.map(s => `<article class="card ocard"><h3>${esc(s[1])}</h3><p>${esc(s[2])}</p>${(PF.GSCI || {})[s[0]] ? `<p class="note">Leads to: ${esc(PF.GSCI[s[0]][0])}. Next: ${esc(PF.GSCI[s[0]][1])}.</p>` : ''}</article>`).join('')}</div>` : ''}
  <h3 style="margin-top:16px">Options and where they lead</h3><div class="grid">${Object.entries(I).map(([n, v]) => `<article class="card ocard"><h3>${esc(n)}</h3><p><b>Careers:</b> ${esc(v[0])}</p><p class="note">Next: ${esc(v[1])}</p></article>`).join('')}</div></div>`; };
const care0 = V.careers; if (care0) V.careers = id => { let h = care0(id); if (typeof h !== 'string') return h;
  h = h.replace(/(<div class="ftabs" role="tablist">[\s\S]*?)(<\/div>)/, `$1<button role="tab" aria-selected="false" data-ftab="courses">Course finder</button><button role="tab" aria-selected="false" data-ftab="gcse">GCSE options</button><button role="tab" aria-selected="false" data-ftab="money">Money at 16 to 18</button>$2`);
  return h.replace(/<\/div>\s*$/, `<div data-fpan="courses" hidden>${finder()}</div><div data-fpan="gcse" hidden>${gcseHTML()}</div><div data-fpan="money" hidden>${TL.cl_money ? tCard('cl_money') : ''}</div></div>`); };

const tr0 = V.training; if (tr0) V.training = id => { const h = tr0(id); return typeof h === 'string' && !id ? h.replace(/(<p class="lede">[\s\S]*?<\/p>)/, `$1<a class="lgcta" href="#courses" style="text-decoration:none;color:inherit">${L.tic ? L.tic('courses', 'ti sm') : ''}<div><b>Looking for a course for someone you support?</b><span>${SK.listings.length} free, funded and paid courses and jobs with training in the Course & training finder.</span></div><span class="btn s sm">Open the finder</span></a>`) : h; };
/* ---------- styles ---------- */
const css = document.createElement('style'); css.textContent = `
.cfbar{display:grid;gap:10px;padding:14px;border-radius:18px;background:#fff;border:1.5px solid var(--line,#D9D8E6);margin-bottom:12px}
.cfsearch{display:flex;align-items:center;gap:8px;padding:0 12px;border-radius:14px;border:1.5px solid var(--line,#D9D8E6);background:#fff}.cfsearch .si{width:20px;height:20px;opacity:.6;flex:none}.cfsearch .in{border:0;padding-left:0;min-height:46px;box-shadow:none}
.cfrow{display:grid;grid-template-columns:2fr 1.4fr .6fr;gap:8px}.cfrow:last-child{grid-template-columns:1fr 1fr}.cfrow .in{min-width:0}
@media(max-width:620px){.cfrow{grid-template-columns:1fr 1fr}.cfrow #cfSec{grid-column:1/-1}}
.cfhead{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 2px 10px;flex-wrap:wrap}.cfhead b{font-size:17px}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
.ccard{display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:18px;background:#fff;border:1.5px solid var(--line,#D9D8E6)}.ccard h3{margin:2px 0 0;font-size:17px}.ccard p{margin:0;line-height:1.5}.cprov{font-weight:700;opacity:.75;font-size:14px}
.cch{display:flex;flex-wrap:wrap;gap:5px}.ctag{display:inline-block;padding:3px 9px;border-radius:999px;background:#EEEDF2;font-size:12px;font-weight:700}.ctag.g{background:#E2F5EA;color:#0E6B4A}.ctag.b{background:#E7EEFF;color:#2E2FA8}.ctag.o{background:#FFF1E3;color:#8A4B0F}.ctag.y{background:#FFF6D6;color:#6B5300}
.cdl{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:6px 0;font-size:14px}.cdl dt{font-weight:700;opacity:.7}.cdl dd{margin:0}
.cmore summary{cursor:pointer;font-weight:700;color:#4545D6;font-size:14px;padding:4px 0}.cmore h4{margin:10px 0 4px;font-size:14px}.cmore ul{margin:0;padding-left:18px;font-size:14px}.cmore p{font-size:14px;margin:4px 0}
.ccard .row{margin-top:auto;padding-top:8px}.ccard .btn.on{background:#EEF0FF;border-color:#4545D6}
.cfwarn{padding:12px 14px;border-radius:14px;background:#FFF4E6;border:1px solid #F3C58B;margin-bottom:10px}.cfwarn p{margin:4px 0 0;font-size:14px;line-height:1.45}
.cfsub{display:block;font-size:13px;margin:4px 0 6px;padding:6px 8px;border-radius:8px;background:#F3F2FA;line-height:1.45}
.cfax{display:grid;gap:8px}.cfax>div{padding:12px;border-radius:14px;background:#fff;border:1px solid var(--line,#D9D8E6)}.cfax p{margin:4px 0 0;font-size:14px;line-height:1.45}.cfax span{font-weight:700}
.cfcs{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}.cfcs a{display:flex;flex-direction:column;gap:2px;padding:12px;border-radius:14px;background:#fff;border:1.5px solid var(--line,#D9D8E6);color:inherit;text-decoration:none}.cfcs a:hover{border-color:#4545D6}.cfcs small{opacity:.72}
.cfmoney{display:grid;gap:8px}.cfmoney>div{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:14px;background:#fff;border:1px solid var(--line,#D9D8E6)}.cfmoney span{flex:none;min-width:84px;padding:8px 6px;border-radius:10px;background:#E2F5EA;color:#0E6B4A;text-align:center;font-weight:800;font-size:14px}.cfmoney p{margin:2px 0 0;font-size:14px;line-height:1.45}
.cfgc h3{margin:12px 0 8px}`;
document.head.appendChild(css);
if (T.gate) Object.keys(V).forEach(T.gate);
});
