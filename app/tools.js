/* Inspire FM · Sunnah Toolbox apps: live jamaat, janazah, noticeboard, halal directory, Hijri calendar,
   Ramadan timetable, inheritance, Hajj & Umrah guide, kids' corner. Each one renders into its own app screen. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, I, store, toast, copy, prayerTimes, hm, h12, toH, lon, greg, hijri, today, dur, pad, M, D, TOOLS } = X;
const PR5 = [['fajr', 'Fajr'], ['sunrise', 'Sunrise'], ['dhuhr', 'Zuhr'], ['asr', 'Asr'], ['maghrib', 'Maghrib'], ['isha', 'Isha']];
const mLogo = m => X.LOGOFILES.has(m.id) ? `<span class="mlg"><img src="img/m/${m.id}.webp" alt=""></span>` : `<span class="tk-pill">${esc(m.n.slice(0, 2))}</span>`;
const today0 = () => { const l = lon(); return new Date(l.y, l.m - 1, l.d); };
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dLong = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

/* send box: the preview has no inbox, so build a ready-to-send message */
function sendBox(out, subject, body, okText, to) {
  const T2 = to || { email: D.email, wa: D.whatsapp, who: 'the Inspire team', lab: D.whatsappLabel };
  out.className = 'fmsg on'; out.innerHTML = `<b>${okText || 'Sent for review.'}</b> On inspirefm.org this goes straight to ${T2.who} to check. For now, send it: <div class="tk-row" style="margin-top:8px"><a class="btn sm g" href="mailto:${T2.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">${I('mail')}Email</a><a class="btn sm" href="https://wa.me/${T2.wa}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener">${I('whatsapp')}WhatsApp</a><button class="btn sm ghost" type="button">${I('copy')}Copy</button></div><small style="display:block;margin-top:6px;color:var(--mut)">${T2.email} · ${T2.lab}</small>`;
  $('button', out).onclick = () => copy(body, 'Copied');
}
function form(node, fields, submitText, onSubmit) {
  const f = document.createElement('form'); f.className = 'tk-card'; f.noValidate = true;
  f.innerHTML = fields.map(x => x.row ? `<div class="tk-2">${x.row.map(fld).join('')}</div>` : fld(x)).join('') + `<button class="btn g" type="submit" style="margin-top:10px">${submitText}</button><div class="fmsg" role="status" style="margin-top:10px"></div>`;
  function fld(x) { if (x.check) return `<label class="cons" style="display:flex;gap:8px;font-weight:400;margin-top:8px"><input type="checkbox" name="${x.id}" style="width:auto"> ${x.l}</label>`;
    const inp = x.opts ? `<select name="${x.id}">${x.opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>` : x.area ? `<textarea name="${x.id}" rows="3" placeholder="${esc(x.ph || '')}"></textarea>` : `<input name="${x.id}" type="${x.type || 'text'}" placeholder="${esc(x.ph || '')}">`;
    return `<label style="margin-top:8px">${x.l}${inp}</label>`; }
  f.onsubmit = e => { e.preventDefault(); const v = {}; [...f.elements].forEach(el => { if (el.name) v[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim(); });
    const all = fields.flatMap(x => x.row || [x]); const miss = all.find(x => x.req && !v[x.id]); const out = $('.fmsg', f);
    if (miss) { out.className = 'fmsg on err'; out.textContent = miss.check ? 'Please tick the box to confirm.' : `Please add: ${miss.l.toLowerCase()}.`; return; }
    onSubmit(v, out, all); };
  node.appendChild(f); return f;
}
const lines = (all, v) => all.filter(x => !x.check).map(x => `${x.l}: ${v[x.id] || '-'}`).join('\n');

/* ================= LIVE JAMAAT ================= */
const JAM = id => (D.jamaat || {})[id] || (window.IFM_JAMAAT || {})[id];
const jt = (J, k, P) => { const v = J && J[k]; if (!v) return null; if (v[0] === '+') { const h = P[k] + (+v.slice(1)) / 60; return hm(h); } return v; };
TOOLS.jamaat = ['Live jamaat', 'jummah', node => {
  const draw = () => {
    const id = store.get('masjid', ''), m = M.find(x => x.id === id), J = JAM(id), T = today(), P = T.t;
    node.innerHTML = `${id ? '<button type="button" class="ja-back" id="jaAll">‹ All masjids</button>' : ''}<label>My masjid<select id="jaSel"><option value="">Choose your masjid…</option>${M.map(x => `<option value="${x.id}" ${x.id === id ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select></label>`;
    if (!m) { const L = M.filter(x => JAM(x.id)); node.insertAdjacentHTML('beforeend', `<div class="ja-all">${L.map(x => { const J2 = JAM(x.id); return `<button type="button" class="ja-m" data-pick="${x.id}"><span class="ja-h">${mLogo(x)}<b>${esc(x.n)}</b></span><span class="ja-t">${PR5.filter(p => p[0] !== 'sunrise').map(([k, n]) => { const fri = k === 'dhuhr' && new Date().getDay() === 5 && x.j && x.j.length; return `<i><small>${fri ? 'Jumuah' : n}</small>${fri ? x.j[x.j.length - 1] : (jt(J2, k, P) || '–')}</i>`; }).join('')}</span></button>`; }).join('')}</div>`); bind(); $$('[data-pick]', node).forEach(b => b.onclick = () => { store.set('masjid', b.dataset.pick); draw(); toast('Saved as your masjid'); }); return; }
    let nxt = null; const rows = PR5.filter(p => p[0] !== 'sunrise').map(([k, n]) => { const j = jt(J, k, P); if (j && !nxt && toH(j) > T.now) nxt = [n, j]; return `<tr${T.nx[0] === k ? ' class="on"' : ''}><td><b>${n}</b></td><td>${hm(P[k])}</td><td>${j ? `<b>${h12(j)}</b>` : '<span style="color:var(--mut)">–</span>'}</td></tr>`; }).join('');
    node.insertAdjacentHTML('beforeend', `<div class="tk-card" style="display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center">${mLogo(m)}<div><h4>${esc(m.n)}</h4><p style="margin:0">${esc(m.a)}</p></div></div>
      ${nxt ? `<div class="tk-card tk-dk"><small style="color:var(--g);font-weight:600">NEXT JAMAAT</small><div class="tk-big">${h12(nxt[1])}</div><p>${nxt[0]} · in ${dur(toH(nxt[1]) - T.now)}</p></div>` : ''}
      <div class="tk-card"><table class="tk-tbl"><tr><th>Prayer</th><th>Starts</th><th>Jamaat</th></tr>${rows}<tr><td><b>Jummah</b></td><td>Fridays</td><td><b>${m.j.map(h12).join(' · ')}</b></td></tr></table>
      ${J ? '' : `<p style="font-size:.84rem"><span class="tk-pill warn">Daily jamaat times not loaded yet</span><br>Start times are calculated for Luton; Jummah is from Inspire FM's list. ${m.web ? 'This masjid publishes its timetable online: Inspire FM checks it every week and the jamaat times appear here.' : 'This masjid hasn\'t got a timetable online yet: once it shares times through the Inspire masjid portal they appear here for everyone.'}</p>`}</div>
      <div class="tk-row">${(J && J.src) || m.web ? `<a class="btn sm g" target="_blank" rel="noopener" href="${esc((J && J.src) || m.web)}">Masjid timetable ↗</a>` : ''}${m.tel ? `<a class="btn sm ghost" href="tel:${m.tel.replace(/\s/g, '')}">${I('phone')}Call</a>` : ''}<a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.n + ', ' + m.a)}">${I('compass')}Directions</a></div>
      <h4 style="margin-top:6px">Run this masjid?</h4>`);
    form(node, [{ row: [{ id: 'f', l: 'Fajr jamaat', type: 'time' }, { id: 'z', l: 'Zuhr', type: 'time' }] }, { row: [{ id: 'a', l: 'Asr', type: 'time' }, { id: 'm', l: 'Maghrib', ph: 'e.g. 5 mins after adhan' }] }, { row: [{ id: 'i', l: 'Isha', type: 'time' }, { id: 'from', l: 'From date', type: 'date' }] }, { id: 'who', l: 'Your name & role', req: 1 }, { id: 'c', l: 'Phone or email', req: 1 }, { id: 'ok', l: 'I\'m authorised to update times for this masjid.', check: 1, req: 1 }], 'Send jamaat times', (v, out, all) => sendBox(out, `Jamaat times: ${m.n}`, `Jamaat times update for ${m.n}\n\n${lines(all, v)}`, 'Thank you.'));
    bind();
  };
  const bind = () => { const a = $('#jaAll'); if (a) a.onclick = () => { store.set('masjid', ''); draw(); }; $('#jaSel').onchange = e => { store.set('masjid', e.target.value); const t = $('#tbJaS'); if (t) t.textContent = (M.find(x => x.id === e.target.value) || {}).n || 'My masjid'; draw(); toast('Saved as your masjid'); }; };
  draw();
}];

/* ================= JANAZAH ================= */
TOOLS.janazah = ['Janazah notices', null, node => {
  const subs = store.get('janazah', []);
  node.innerHTML = `<div class="tk-card tk-dk" style="text-align:center"><p lang="ar" style="font-family:var(--ar);font-size:1.6rem;color:#fff;margin:0">إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</p><p style="margin:4px 0 0">To Allah we belong and to Him we return.</p></div>
    <div class="tk-card" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><h4>Janazah alerts</h4><p style="margin:0">A notification when a janazah is announced in Luton.</p></div><button class="sw" type="button" role="switch" id="jzOn" aria-checked="${!!store.get('jzAlerts', false)}" aria-label="Janazah alerts"><i></i></button></div>
    <h4>Notices</h4>
    <div id="jzList">${subs.length ? subs.map(n => `<div class="nb"><span class="tk-pill warn">Pending review · only you can see this</span><h4>${esc(n.name)}</h4><p>Janazah salah: <b>${esc(n.when)}</b> at ${esc(n.where)}</p><p>Burial: ${esc(n.burial || 'to be confirmed')}</p><small>Contact: ${esc(n.contact)}</small></div>`).join('') : `<div class="tk-empty">No janazah notices right now.<br>Notices are checked by Inspire FM with the family or masjid before they're published, then read on air and sent to everyone with alerts on.</div>`}</div>
    <h4>Submit a notice</h4>`;
  $('#jzOn').onclick = e => { const on = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', on); store.set('jzAlerts', on); toast(on ? 'Janazah alerts on' : 'Janazah alerts off'); };
  const venues = M.map(m => m.n).concat(['Other (add below)']);
  form(node, [{ id: 'name', l: 'Name of the deceased', req: 1 }, { row: [{ id: 'date', l: 'Date', type: 'date', req: 1 }, { id: 'time', l: 'Janazah time', ph: 'e.g. after Zuhr', req: 1 }] }, { id: 'where', l: 'Janazah salah at', opts: venues }, { id: 'other', l: 'Other venue (if not listed)' }, { id: 'burial', l: 'Burial place', ph: 'e.g. Vale Cemetery' }, { id: 'contact', l: 'Family contact (phone)', req: 1 }, { id: 'note', l: 'Anything else (optional)', area: 1 }, { id: 'ok', l: 'I\'m family, or authorised by the family or masjid, to share this.', check: 1, req: 1 }], 'Send notice', (v, out, all) => {
    const n = { name: v.name, when: `${v.date ? new Date(v.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}, ${v.time}`, where: v.other || v.where, burial: v.burial, contact: v.contact };
    const L = store.get('janazah', []); L.unshift(n); store.set('janazah', L.slice(0, 5));
    sendBox(out, `Janazah notice: ${v.name}`, `Janazah notice\n\n${lines(all, v)}`, 'JazakAllah khair. We\'ll check it with you before it\'s published.');
  });
}];

/* ================= NOTICEBOARD ================= */
const NB_CATS = ['Classes & halaqas', 'Lost & found', 'Volunteers wanted', 'Free & offered', 'Jobs', 'Announcements'];
TOOLS.notices = ['Community noticeboard', null, node => {
  let cat = 'All';
  const draw = () => {
    const L = store.get('notices', []).filter(n => cat === 'All' || n.cat === cat);
    node.innerHTML = `<div class="tk-seg" id="nbSeg">${['All', ...NB_CATS].map(c => `<button type="button" aria-pressed="${c === cat}">${c}</button>`).join('')}</div>
      <div class="tk-row" style="justify-content:space-between"><b style="font-family:var(--display)">${cat === 'All' ? 'Latest notices' : esc(cat)}</b><button class="btn sm g" type="button" id="nbNew">+ Post a notice</button></div>
      <div id="nbList" style="display:grid;gap:10px">${L.length ? L.map(n => `<div class="nb"><div class="tk-row"><span class="tk-pill blue">${esc(n.cat)}</span><span class="tk-pill warn">Pending review</span></div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p><small>${esc(n.area || 'Luton')} · ${esc(n.contact)}</small></div>`).join('') : `<div class="tk-empty">Nothing on the board${cat === 'All' ? '' : ' in this section'} yet.<br>Classes, lost & found, volunteers wanted, things to give away: post it free. Every notice is checked before it goes up, and comes down after 30 days.</div>`}</div><div id="nbForm"></div>`;
    $$('#nbSeg button').forEach(b => b.onclick = () => { cat = b.textContent; draw(); });
    $('#nbNew').onclick = () => { const box = $('#nbForm'); if (box.childElementCount) return; form(box, [{ id: 'cat', l: 'Section', opts: NB_CATS }, { id: 'title', l: 'Title', req: 1, ph: 'e.g. Free Quran classes for sisters' }, { id: 'body', l: 'Details', area: 1, req: 1 }, { id: 'area', l: 'Area of Luton', ph: 'e.g. Bury Park' }, { id: 'contact', l: 'How people contact you', req: 1 }, { id: 'ok', l: 'This is genuine, follows the community guidelines, and can be published with my contact details.', check: 1, req: 1 }], 'Send for review', (v, out, all) => { const L2 = store.get('notices', []); L2.unshift({ cat: v.cat, title: v.title, body: v.body, area: v.area, contact: v.contact }); store.set('notices', L2.slice(0, 20)); sendBox(out, `Noticeboard: ${v.title}`, `Noticeboard post\n\n${lines(all, v)}`); setTimeout(draw, 4000); }); box.scrollIntoView({ behavior: 'smooth' }); };
  };
  draw();
}];

/* ================= HALAL BUSINESS DIRECTORY ================= */
const BZ_CATS = ['Food & drink', 'Legal & finance', 'Home & trades', 'Retail', 'Education', 'Health & beauty', 'Events', 'Other'];
const BZ = (D.businesses || [
  { n: 'Hannah Solicitors', c: 'Legal & finance', a: 'Luton', url: 'https://www.hannahsolicitors.co.uk/', logo: 'img/p/hannah.webp', partner: 1 },
  { n: 'Woolfe & Co', c: 'Legal & finance', a: 'Solicitors', url: 'https://www.woolfelaw.com/', partner: 1 },
  { n: 'Butt Solicitors', c: 'Legal & finance', a: 'Luton', url: '', partner: 1 },
  { n: 'AA Carpets & Furniture', c: 'Home & trades', a: 'Luton', url: '', logo: 'img/p/aa-carpets.webp', partner: 1 },
  { n: 'CTP', c: 'Other', a: 'Trusted partner', url: 'https://ctportal.org/', logo: 'img/p/ctp.webp', partner: 1 }
]);
TOOLS.business = ['Halal business directory', null, node => {
  const SMR = { email: 'summar@smrgraphics.co.uk', wa: '447931814538', who: 'SMR Digital', lab: '07931 814538' };
  const AREAS = ['Luton', 'Dunstable', 'Houghton Regis', 'Bedford', 'Milton Keynes', 'Online / UK-wide'];
  const MATTERS = [['cert', 'Halal certified'], ['owned', 'Muslim-owned'], ['local', 'Local & independent'], ['partner', 'Inspire FM partner'], ['offer', 'Has an offer for listeners']];
  const Q = [['What do you need?', 'c', BZ_CATS.map(c => [c, c])], ['Where?', 'ar', AREAS.map(x => [x, x]).concat([['', 'Anywhere']])], ['What matters most to you?', 'm', MATTERS.concat([['', 'Just show me everything']])]];
  const F = Object.assign({ c: '', ar: store.get('bzArea', 'Luton'), m: [], q: '', sort: 'feat' }, {});
  let step = -1;
  const all = () => BZ.map(b => ({ ar: /luton/i.test(b.a) ? 'Luton' : /online|ctportal/i.test((b.url || '') + b.a) ? 'Online / UK-wide' : '', ...b, tags: b.tags || (b.partner ? ['partner'] : []) }))
    .concat(store.get('bizSubs', []).map(b => ({ ...b, pending: 1, tags: b.tags || [] })));
  const match = b => (!F.c || b.c === F.c) && (!F.ar || b.ar === F.ar || b.ar === 'Online / UK-wide' || !b.ar) && F.m.every(t => (b.tags || []).includes(t)) && (!F.q || [b.n, b.c, b.a, b.d || ''].join(' ').toLowerCase().includes(F.q));
  const pill = (t, cls = '') => `<span class="tk-pill ${cls}">${t}</span>`;
  const card = b => `<div class="nb ${b.partner ? 'bz-feat' : ''}" style="grid-template-columns:${b.logo ? '64px ' : ''}1fr;display:grid;gap:12px;align-items:center">${b.logo ? `<img src="${b.logo}" alt="" style="width:64px;height:48px;object-fit:contain">` : ''}<div><div class="tk-row">${b.partner ? pill(IFM_IC('starf') + ' Featured', 'bz-gold') + pill('Recommended by Inspire FM') : ''}${b.pending ? pill('Waiting for SMR Digital to check', 'warn') : ''}${pill(esc(b.c), 'grey')}${(b.tags || []).filter(t => t !== 'partner').map(t => pill(esc((MATTERS.find(m => m[0] === t) || [, t])[1]), 'bz-tag')).join('')}</div><h4 style="margin-top:6px">${esc(b.n)}</h4><small>${esc([b.ar, b.a !== b.ar ? b.a : ''].filter(Boolean).join(' · '))}</small>${b.url ? `<div><a class="more" style="font-size:.85rem" href="${esc(b.url)}" target="_blank" rel="noopener">Website ↗</a></div>` : ''}</div></div>`;
  function quiz() {
    const box = $('#bzQuiz');
    if (step < 0) { box.innerHTML = `<button type="button" class="bz-qstart" id="bzQGo"><span><b>Not sure where to start?</b><small>Answer 3 quick questions and we'll find the right business.</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg></button>`; $('#bzQGo').onclick = () => { step = 0; F.m = []; quiz(); }; return; }
    if (step >= Q.length) { box.innerHTML = `<div class="bz-qdone"><span>${esc([F.c || 'Any business', F.ar || 'anywhere', F.m.length ? F.m.map(t => MATTERS.find(m => m[0] === t)[1]).join(', ') : ''].filter(Boolean).join(' · '))}</span><button type="button" id="bzQRe">Change answers</button></div>`; $('#bzQRe').onclick = () => { step = 0; quiz(); }; return; }
    const [h, k, opts] = Q[step];
    box.innerHTML = `<div class="bz-q"><div class="bz-qh"><small>Question ${step + 1} of ${Q.length}</small><button type="button" id="bzQX" aria-label="Close questions">Skip</button></div><h4>${h}</h4><div class="bz-qo">${opts.map(([v, l]) => `<button type="button" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>${step ? '<button type="button" class="bz-qb" id="bzQBack">Back</button>' : ''}</div>`;
    $$('#bzQuiz [data-v]').forEach(b => b.onclick = () => { const v = b.dataset.v; if (k === 'm') F.m = v ? [v] : []; else F[k] = v; if (k === 'ar' && v) store.set('bzArea', v); step++; sync(); quiz(); draw(); });
    $('#bzQX').onclick = () => { step = -1; quiz(); }; const bk = $('#bzQBack'); if (bk) bk.onclick = () => { step--; quiz(); };
  }
  function sync() { $('#bzC').value = F.c; $('#bzA').value = F.ar; $$('#bzM button').forEach(b => b.setAttribute('aria-pressed', F.m.includes(b.dataset.m))); }
  const draw = () => {
    let L = all().filter(match);
    L.sort(F.sort === 'az' ? (x, y) => x.n.localeCompare(y.n) : (x, y) => (y.partner ? 1 : 0) - (x.partner ? 1 : 0) || x.n.localeCompare(y.n));
    const n = [F.c, F.ar && F.ar !== 'Luton' ? F.ar : '', ...F.m, F.q].filter(Boolean).length;
    $('#bzCount').innerHTML = `<b>${L.length}</b> ${L.length === 1 ? 'business' : 'businesses'}${F.ar ? ' in ' + esc(F.ar) : ''}${n ? ' <button type="button" id="bzClr">Clear filters</button>' : ''}`;
    const clr = $('#bzClr'); if (clr) clr.onclick = () => { Object.assign(F, { c: '', ar: 'Luton', m: [], q: '' }); $('#bzQ').value = ''; step = -1; sync(); quiz(); draw(); };
    $('#bzList').innerHTML = L.length ? L.map(card).join('') : `<div class="tk-empty">No businesses match yet. The directory is new and growing.<div class="tk-row" style="justify-content:center;margin-top:10px"><button class="btn sm" type="button" data-clr>Clear filters</button><button class="btn sm g" type="button" data-add>Add a business</button></div></div>`;
    const c2 = $('#bzList [data-clr]'); if (c2) c2.onclick = () => $('#bzClr') && $('#bzClr').click();
    const ad = $('#bzList [data-add]'); if (ad) ad.onclick = () => $('#bzNew').click();
  };
  node.innerHTML = `<div class="bz-why"><small>Spend with purpose</small><h3>Earn halal, spend halal, keep it local.</h3><p>Islam asks us to earn and spend in a halal way, and to keep wealth moving through the community rather than in a few hands (Surah al-Hashr 59:7). This directory makes it easy to find halal and Muslim-owned businesses near you, and every honest local business is welcome on it, whoever runs it.</p><span class="wx-rev">Awaiting review</span></div>
    <div id="bzQuiz"></div>
    <div class="bz-fil"><input type="search" id="bzQ" placeholder="Search: takeaway, solicitor, butcher…" aria-label="Search businesses">
      <div class="bz-sel"><label><span>Category</span><select id="bzC"><option value="">All</option>${BZ_CATS.map(c => `<option>${c}</option>`).join('')}</select></label><label><span>Area</span><select id="bzA">${AREAS.map(a => `<option>${a}</option>`).join('')}<option value="">Anywhere</option></select></label><label><span>Sort</span><select id="bzS"><option value="feat">Featured</option><option value="az">A to Z</option></select></label></div>
      <div class="bz-m" id="bzM" data-nodd>${MATTERS.map(([k, l]) => `<button type="button" data-m="${k}" aria-pressed="false">${l}</button>`).join('')}</div></div>
    <div class="bz-count" id="bzCount"></div>
    <div id="bzList" style="display:grid;gap:10px"></div><div class="tk-card tk-dk"><h4 style="color:#fff">Own a local business?</h4><p>Get found by thousands of Inspire FM listeners. Every new listing is checked by SMR Digital before it goes live.</p><div class="bz-tiers"><div class="bz-tier"><i>①</i><span><b>Free listing</b><small>Name, category, area, phone and website.</small></span></div><div class="bz-tier"><i>${IFM_IC('starf')}</i><span><b>Featured</b><small>Top of your category, gold card, your logo and photos, offers and a "Recommended by Inspire FM" badge.</small></span></div><div class="bz-tier"><i>${IFM_IC('radio')}</i><span><b>Featured + on air</b><small>Everything in Featured, plus mentions and ads on Inspire FM 105.1.</small></span></div></div><div class="tk-row" style="margin-top:10px"><button class="btn sm g" type="button" id="bzNew">+ List free</button><button class="btn sm" type="button" id="bzFeat" style="background:#a68a5a;color:#111">${IFM_IC('starf')} Get featured</button></div></div><div id="bzForm"></div>
    <p class="notice">Directory by SMR Digital for Inspire FM. Halal status is confirmed by each business. If something isn't right, <a href="https://wa.me/447931814538?text=${encodeURIComponent('Hi SMR Digital, about a listing in the Inspire FM halal directory: ')}" target="_blank" rel="noopener">tell SMR Digital</a>.</p>`;
  $('#bzQ').oninput = e => { F.q = e.target.value.toLowerCase().trim(); draw(); };
  $('#bzC').onchange = e => { F.c = e.target.value; draw(); };
  $('#bzA').onchange = e => { F.ar = e.target.value; if (F.ar) store.set('bzArea', F.ar); draw(); };
  $('#bzS').onchange = e => { F.sort = e.target.value; draw(); };
  $$('#bzM button').forEach(b => b.onclick = () => { const k = b.dataset.m; F.m = F.m.includes(k) ? F.m.filter(x => x !== k) : F.m.concat(k); sync(); draw(); });
  $('#bzFeat').onclick = () => { const box = $('#bzForm'); box.innerHTML = ''; form(box, [{ id: 'n', l: 'Business name', req: 1 }, { id: 'tier', l: 'Package', opts: ['Featured', 'Featured + on air'] }, { id: 'c', l: 'Category', opts: BZ_CATS }, { row: [{ id: 'p', l: 'Phone', req: 1 }, { id: 'e', l: 'Email' }] }, { id: 'm', l: 'Anything to tell us', area: 1 }], 'Ask for prices', (v, out, all) => sendBox(out, `Featured listing: ${v.n}`, `Featured listing enquiry\n\n${lines(all, v)}`, 'Thanks. SMR Digital will send prices.', SMR)); box.scrollIntoView({ behavior: 'smooth' }); };
  $('#bzNew').onclick = () => { const box = $('#bzForm'); if (box.childElementCount) { box.scrollIntoView({ behavior: 'smooth' }); return; } form(box, [{ id: 'n', l: 'Business name', req: 1 }, { row: [{ id: 'c', l: 'Category', opts: BZ_CATS }, { id: 'ar', l: 'Area', opts: AREAS }] }, { id: 'a', l: 'Address or street', req: 1 }, { row: [{ id: 'p', l: 'Phone' }, { id: 'w', l: 'Website or Instagram' }] }, { id: 'h', l: 'Halal certification (if any)', ph: 'e.g. HMC, HFA, self-certified' }, { id: 'o', l: 'Offer for Inspire FM listeners (optional)', ph: 'e.g. 10% off with the app' }, { id: 'd', l: 'Short description', area: 1 }, { id: 'mo', l: 'This business is Muslim-owned', check: 1 }, { id: 'li', l: 'This is a local, independent business', check: 1 }, { id: 'ok', l: 'I own or manage this business, and the details are accurate.', check: 1, req: 1 }], 'Send listing', (v, out, all) => {
    const tags = [v.h ? 'cert' : '', v.mo ? 'owned' : '', v.li ? 'local' : '', v.o ? 'offer' : ''].filter(Boolean);
    const L = store.get('bizSubs', []); L.unshift({ n: v.n, c: v.c, ar: v.ar, a: v.a, url: v.w, d: v.d, tags }); store.set('bizSubs', L.slice(0, 10)); draw();
    sendBox(out, `Directory listing: ${v.n}`, `Halal directory listing\n\n${lines(all, v)}\nMuslim-owned: ${v.mo ? 'Yes' : 'No'}\nLocal & independent: ${v.li ? 'Yes' : 'No'}`, 'Thanks for listing your business.', SMR); }); box.scrollIntoView({ behavior: 'smooth' }); };
  sync(); quiz(); draw();
  const css = 'bzCss'; if (!document.getElementById(css)) { const st = document.createElement('style'); st.id = css; st.textContent = `
.bz-why{position:relative;padding:16px;border-radius:20px;background:linear-gradient(150deg,#283f31,#395546);color:#fff;display:grid;gap:6px}.bz-why small{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#c1ceb5}.bz-why h3{margin:0;font-family:var(--display);font-size:1.2rem;color:#fff}.bz-why p{margin:0;font-size:.9rem;line-height:1.5;color:rgba(255,255,255,.88)}.bz-why .wx-rev{justify-self:start;font-size:.66rem;font-weight:600;padding:3px 8px;border-radius:999px;background:rgba(178,158,113,.22);color:#d0c4a9}
.bz-qstart{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:64px;padding:12px 16px;border-radius:18px;border:2px dashed #7b5b42;background:#f8f7f2;color:#111;font:inherit;text-align:left;cursor:pointer}.bz-qstart b{display:block}.bz-qstart small{color:#5d574c}.bz-qstart svg{width:20px;height:20px;flex:none;color:#7b5b42}
.bz-q{display:grid;gap:10px;padding:16px;border-radius:20px;background:#f8f7f2;border:1.5px solid #d1c6ac}.bz-qh{display:flex;justify-content:space-between;align-items:center}.bz-qh small{font-weight:600;color:#684a38;font-size:.76rem;letter-spacing:.06em;text-transform:uppercase}.bz-qh button,.bz-qb{min-height:40px;border:0;background:none;color:#684a38;font:inherit;font-weight:600;cursor:pointer;padding:0 6px}.bz-qb{justify-self:start}
.bz-q h4{margin:0;font-family:var(--display);font-size:1.15rem}.bz-qo{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bz-qo button{min-height:52px;border-radius:14px;border:1.5px solid #d1c6ac;background:#fff;color:#111;font:inherit;font-weight:600;font-size:.9rem;padding:8px 10px;cursor:pointer;text-align:left}.bz-qo button:active{background:#d5ceb2}
.bz-qdone{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;background:#f8f7f2;border:1.5px solid #d1c6ac;font-weight:600;font-size:.9rem}.bz-qdone button{flex:none;min-height:40px;border-radius:999px;border:1.5px solid #7b5b42;background:none;color:#684a38;font:inherit;font-weight:600;padding:0 12px;cursor:pointer}
.bz-fil{display:grid;gap:10px}.bz-sel{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.bz-sel label{display:grid;gap:4px;margin:0;min-width:0}.bz-sel span{font-size:.72rem;font-weight:600;color:var(--mut);letter-spacing:.04em}.bz-sel select{min-height:46px;width:100%;min-width:0;padding:0 8px;font-size:.88rem}
.bz-m{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}.bz-m::-webkit-scrollbar{display:none}.bz-m button{flex:none;min-height:40px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-weight:600;font-size:.84rem;padding:0 13px;cursor:pointer}.bz-m button[aria-pressed=true]{background:#283f31;color:#fff;border-color:#283f31}
.bz-count{display:flex;align-items:center;gap:6px;font-size:.9rem;color:var(--mut)}.bz-count b{color:var(--ink)}.bz-count button{margin-left:auto;min-height:36px;border:0;background:none;color:#7b5b42;font:inherit;font-weight:600;cursor:pointer}
.tk-pill.bz-gold{background:#ebe8da;color:#684a38}.tk-pill.bz-tag{background:#e6f2ea;color:#283f31}`; document.head.appendChild(st); }
}];

/* ================= HIJRI CALENDAR ================= */
const hp = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
const hmName = new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', { month: 'long' });
function H(d) { const p = {}; hp.formatToParts(d).forEach(x => p[x.type] = x.value); return { d: +p.day, m: +p.month, y: parseInt(p.year) }; }
const HEV = [[1, 1, 'Islamic New Year'], [1, 10, 'Day of Ashura'], [3, 12, 'Mawlid an-Nabi (12 Rabi\' al-Awwal)'], [7, 27, 'Isra & Mi\'raj'], [8, 15, 'Mid-Sha\'ban'], [9, 1, 'Ramadan begins'], [9, 27, 'Laylat al-Qadr (27th night)'], [10, 1, 'Eid al-Fitr'], [12, 1, 'First 10 days of Dhul Hijjah'], [12, 9, 'Day of Arafah'], [12, 10, 'Eid al-Adha']];
const evOf = h => HEV.find(e => e[0] === h.m && e[1] === h.d);
TOOLS.hijri = ['Hijri calendar', null, node => {
  let off = 0; const t0 = today0();
  const draw = () => {
    const first = new Date(t0.getFullYear(), t0.getMonth() + off, 1), days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const hA = H(first), hB = H(new Date(first.getFullYear(), first.getMonth(), days));
    const title = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), htitle = `${hmName.format(first)}${hA.m !== hB.m ? ' – ' + hmName.format(new Date(first.getFullYear(), first.getMonth(), days)) : ''} ${hB.y} AH`;
    let cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="h">${d}</div>`).join('') + '<div class="hc-d pad"></div>'.repeat((first.getDay() + 6) % 7);
    for (let i = 1; i <= days; i++) { const d = new Date(first.getFullYear(), first.getMonth(), i), h = H(d), ev = evOf(h), wd = [13, 14, 15].includes(h.d);
      cells += `<div class="hc-d ${ymd(d) === ymd(t0) ? 'today' : ''} ${ev ? 'ev' : wd ? 'wd' : ''}" title="${ev ? esc(ev[2]) : wd ? 'White day (sunnah fast)' : ''}"><b>${i}</b><small>${h.d === 1 ? hmName.format(d).slice(0, 5) : h.d}</small></div>`; }
    const up = []; for (let i = 0; i < 400 && up.length < 8; i++) { const d = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + i), e = evOf(H(d)); if (e) up.push([d, e[2], i]); }
    node.innerHTML = `<div class="tk-card tk-dk"><small style="color:var(--g);font-weight:600">TODAY</small><div style="font-family:var(--display);font-size:1.6rem;font-weight:600">${hijri(new Date())}</div><p style="margin:0">${greg(new Date())}</p></div>
      <div class="tk-row" style="justify-content:space-between"><button class="btn sm ghost" type="button" data-m="-1">‹</button><div style="text-align:center"><b style="font-family:var(--display);font-size:1.15rem">${title}</b><br><small style="color:var(--mut)">${htitle}</small></div><button class="btn sm ghost" type="button" data-m="1">›</button></div>
      <div class="hc-grid">${cells}</div>
      <div class="tk-row" style="font-size:.76rem;color:var(--mut)"><span><i style="display:inline-block;width:12px;height:3px;background:#8b73b4;vertical-align:middle"></i> Islamic date</span><span><i style="display:inline-block;width:12px;height:3px;background:#b1a17b;vertical-align:middle"></i> White days (13–15)</span></div>
      <h4>Coming up</h4><div class="tk-card" style="padding:6px 14px"><table class="tk-tbl">${up.map(([d, n, i]) => `<tr><td><b>${esc(n)}</b><br><small style="color:var(--mut)">${hijri(d)}</small></td><td style="text-align:right">${dLong(d)}<br><small style="color:var(--mut)">${i === 0 ? 'Today' : 'in ' + i + ' days'}</small></td></tr>`).join('')}</table></div>
      <p class="notice">Dates use the Umm al-Qura calendar and may differ by a day locally, subject to the moon sighting followed by Luton's masjids.</p>`;
    $$('[data-m]', node).forEach(b => b.onclick = () => { off += +b.dataset.m; draw(); });
  };
  draw();
}];

/* ================= RAMADAN TIMETABLE ================= */
TOOLS.ramadan = ['Ramadan timetable', null, node => {
  const t0 = today0(); let start = null, days = [];
  for (let i = 0; i < 420; i++) { const d = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + i - 30), h = H(d); if (h.m === 9) { if (!start && h.d <= 2) start = d; if (start) days.push([d, h]); } else if (start) break; }
  if (!days.length) { node.innerHTML = '<div class="tk-empty">Ramadan dates will appear here.</div>'; return; }
  const yr = days[0][1].y, inR = days.some(([d]) => ymd(d) === ymd(t0)), until = Math.ceil((days[0][0] - t0) / 864e5);
  const T = today(), rows = days.map(([d, h]) => { const P = prayerTimes(d.getFullYear(), d.getMonth() + 1, d.getDate(), X.asr()); const last10 = h.d >= 21, odd = last10 && h.d % 2 === 1; return `<tr class="${ymd(d) === ymd(t0) ? 'on' : ''} ${last10 ? 'rm-l10' : ''} ${odd ? 'rm-odd' : ''}"><td>${h.d}${odd ? ' ' + IFM_IC('sparkle') : ''}</td><td>${dLong(d)}</td><td><b>${hm(P.fajr)}</b></td><td><b>${hm(P.maghrib)}</b></td></tr>`; }).join('');
  const P0 = T.t;
  node.innerHTML = `<div class="tk-card tk-dk" style="text-align:center"><small style="color:var(--g);font-weight:600">RAMADAN ${yr} AH · LUTON</small>${inR ? `<div class="tk-big" style="margin:8px 0">${T.now < P0.maghrib ? dur(P0.maghrib - T.now) : '–'}</div><p>${T.now < P0.maghrib ? `until iftar at ${hm(P0.maghrib)}` : `Suhur ends tomorrow at ${hm(prayerTimes(t0.getFullYear(), t0.getMonth() + 1, t0.getDate() + 1, 1).fajr)}`}</p>` : `<div class="tk-big" style="margin:8px 0">${until} days</div><p>Expected to begin ${days[0][0].toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, subject to moon sighting</p>`}</div>
    <div class="tk-row"><button class="btn sm g" type="button" id="rmCopy">${I('copy')}Copy timetable</button><a class="btn sm ghost" href="#prayer" data-goto="maker">${I('download')}Make a wallpaper</a></div>
    <div class="tk-card" style="padding:6px 10px"><table class="tk-tbl"><tr><th>Day</th><th>Date</th><th>Suhur ends</th><th>Iftar</th></tr>${rows}</table></div>
    <p class="notice">Suhur ends at Fajr (18°) and iftar is at sunset (Maghrib), calculated for Luton. Many masjids advise stopping eating a few minutes before. The shaded rows are the last ten days, and the star marks the odd nights, when Laylat al-Qadr is sought. Each Islamic night begins at Maghrib the evening before, so the 21st night starts at iftar on the 20th.</p>`;
  $('#rmCopy').onclick = () => copy(`Ramadan ${yr} timetable · Luton (Inspire FM)\nDay  Date  Suhur ends  Iftar\n` + days.map(([d, h]) => { const P = prayerTimes(d.getFullYear(), d.getMonth() + 1, d.getDate(), 1); return `${h.d}  ${dLong(d)}  ${hm(P.fajr)}  ${hm(P.maghrib)}`; }).join('\n') + '\ninspirefm.org', 'Timetable copied');
}];

/* ================= INHERITANCE (fara'id) ================= */
TOOLS.inherit = ['Inheritance calculator', null, node => {
  const S = Object.assign({ est: '', debt: '', fun: '', beq: '', g: 'm', wives: 0, husb: 0, sons: 0, dau: 0, fa: 0, mo: 0, bro: 0, sis: 0 }, store.get('inh', {}));
  const ctr = (k, l, max) => `<div class="ctr"><button type="button" data-dec="${k}">−</button><span>${l}</span><span style="display:flex;gap:10px;align-items:center"><output>${S[k]}</output><button type="button" data-inc="${k}" data-max="${max}">+</button></span></div>`;
  const draw = () => {
    node.innerHTML = `      <div class="tk-card"><h4>The estate</h4><div class="tk-2"><label>Total value £<input inputmode="decimal" data-v="est" value="${S.est}"></label><label>Funeral costs £<input inputmode="decimal" data-v="fun" value="${S.fun}"></label><label>Debts £<input inputmode="decimal" data-v="debt" value="${S.debt}"></label><label>Bequests (wasiyyah) £<input inputmode="decimal" data-v="beq" value="${S.beq}"></label></div></div>
      <div class="tk-card" style="display:grid;gap:10px"><h4>The deceased was</h4><div class="tk-seg"><button type="button" data-g="m" aria-pressed="${S.g === 'm'}">A man</button><button type="button" data-g="f" aria-pressed="${S.g === 'f'}">A woman</button></div>
        <h4 style="margin-top:6px">Surviving family</h4>${S.g === 'm' ? ctr('wives', 'Wives', 4) : ctr('husb', 'Husband', 1)}${ctr('sons', 'Sons', 20)}${ctr('dau', 'Daughters', 20)}${ctr('fa', 'Father', 1)}${ctr('mo', 'Mother', 1)}${ctr('bro', 'Full brothers', 20)}${ctr('sis', 'Full sisters', 20)}</div>
      <div class="tk-card" id="inhOut"></div><p class="notice">A guide based on Surah an-Nisa 4:11–12, 176, for close family only. Under English law the estate is <b>not</b> shared this way without an Islamic will, so speak to a scholar and a solicitor.</p>`;
    $$('[data-v]', node).forEach(i => i.oninput = () => { S[i.dataset.v] = i.value; store.set('inh', S); calc(); });
    $$('[data-g]', node).forEach(b => b.onclick = () => { S.g = b.dataset.g; S.wives = 0; S.husb = 0; store.set('inh', S); draw(); });
    $$('[data-inc],[data-dec]', node).forEach(b => b.onclick = () => { const k = b.dataset.inc || b.dataset.dec, mx = +(b.dataset.max || 20); S[k] = Math.max(0, Math.min(b.dataset.inc ? mx : 99, S[k] + (b.dataset.inc ? 1 : -1))); store.set('inh', S); b.closest('.ctr').querySelector('output').textContent = S[k]; calc(); });
    calc();
  };
  function calc() {
    const n = k => Math.max(0, parseFloat(String(S[k]).replace(/[,£]/g, '')) || 0);
    const gross = n('est'), afterDebt = Math.max(0, gross - n('fun') - n('debt')), beq = Math.min(n('beq'), afterDebt / 3), net = afterDebt - beq;
    const kids = S.sons + S.dau > 0, sib = S.bro + S.sis, H = []; let note = [];
    const add = (who, cnt, frac, type, label) => H.push({ who, cnt, frac, type, label });
    let spouse = 0;
    if (S.g === 'm' && S.wives) { spouse = kids ? 1 / 8 : 1 / 4; add(S.wives > 1 ? `Wives (${S.wives})` : 'Wife', S.wives, spouse, 'fixed', kids ? '1/8' : '1/4'); }
    if (S.g === 'f' && S.husb) { spouse = kids ? 1 / 4 : 1 / 2; add('Husband', 1, spouse, 'fixed', kids ? '1/4' : '1/2'); }
    if (S.mo) { let f = (kids || sib >= 2) ? 1 / 6 : 1 / 3, lb = f === 1 / 6 ? '1/6' : '1/3'; if (!kids && sib < 2 && S.fa && spouse) { f = (1 - spouse) / 3; lb = '1/3 of the remainder'; note.push('Mother gets a third of what is left after the spouse (the Umariyyatayn cases).'); } add('Mother', 1, f, 'fixed', lb); }
    if (S.fa) { if (S.sons) add('Father', 1, 1 / 6, 'fixed', '1/6'); else if (S.dau) add('Father', 1, 1 / 6, 'fixres', '1/6 + residue'); else add('Father', 1, 0, 'res', 'Residue'); }
    if (S.dau && !S.sons) add(S.dau > 1 ? `Daughters (${S.dau})` : 'Daughter', S.dau, S.dau === 1 ? 1 / 2 : 2 / 3, 'fixed', S.dau === 1 ? '1/2' : '2/3');
    if (S.sons) add(`Sons (${S.sons})${S.dau ? ` & daughters (${S.dau})` : ''}`, S.sons * 2 + S.dau, 0, 'res', `Residue, ${S.dau ? 'a son twice a daughter' : 'shared equally'}`);
    const blocked = S.sons || S.fa;
    if (sib && blocked) note.push('Brothers and sisters don\'t inherit here: they are excluded by a son or the father.');
    if (sib && !blocked) { if (S.bro) add(`Brothers (${S.bro})${S.sis ? ` & sisters (${S.sis})` : ''}`, S.bro * 2 + S.sis, 0, 'res', 'Residue, a brother twice a sister');
      else if (S.dau) add(S.sis > 1 ? `Sisters (${S.sis})` : 'Sister', S.sis, 0, 'res', 'Residue (with daughters)');
      else add(S.sis > 1 ? `Sisters (${S.sis})` : 'Sister', S.sis, S.sis === 1 ? 1 / 2 : 2 / 3, 'fixed', S.sis === 1 ? '1/2' : '2/3'); }
    const fixedSum = H.filter(h => h.type !== 'res').reduce((a, h) => a + h.frac, 0);
    if (fixedSum > 1 + 1e-9) { H.forEach(h => { if (h.type !== 'res') h.frac /= fixedSum; else h.frac = 0; }); note.push(`The fixed shares add up to more than the whole, so each is reduced proportionally ('awl).`); }
    else { const R = 1 - fixedSum; const res = H.filter(h => h.type === 'res' || h.type === 'fixres'); const pure = H.filter(h => h.type === 'res');
      if (R > 1e-9) { if (pure.length) pure[0].frac += R; else if (res.length) res[0].frac += R; else { const rd = H.filter(h => !/Wife|Wives|Husband/.test(h.who)); const tot = rd.reduce((a, h) => a + h.frac, 0); if (tot > 0) { rd.forEach(h => h.frac += R * h.frac / tot); note.push('What is left returns to the relatives with fixed shares, not the spouse (radd).'); } else if (H.length) note.push(`${Math.round(R * 100)}% has no heir in this list: it passes to more distant relatives. Ask a scholar.`); } } }
    const out = $('#inhOut'); const col = ['#a4a3a1', '#52708d', '#a77b68', '#8772ac', '#ae778a', '#386466', '#7e6d44'];
    if (!H.length) { out.innerHTML = '<div class="tk-empty">Add the surviving family to see the shares.</div>'; return; }
    const money = v => '£' + v.toLocaleString('en-GB', { maximumFractionDigits: 2, minimumFractionDigits: v % 1 ? 2 : 0 });
    out.innerHTML = `<h4>Shares</h4>${gross ? `<p>Estate ${money(gross)} − funeral & debts ${money(gross - afterDebt)} − bequests ${money(beq)}${n('beq') > afterDebt / 3 ? ' (capped at one third)' : ''} = <b>${money(net)}</b> to share</p>` : '<p>Enter the estate value to see amounts.</p>'}
      <div class="inh-bar">${H.filter(h => h.frac > 0).map((h, i) => `<span style="width:${h.frac * 100}%;background:${col[i % col.length]}" title="${esc(h.who)}"></span>`).join('')}</div>
      <div class="inh-res">${H.map((h, i) => { const each = h.cnt > 1 ? (/Sons|Brothers/.test(h.who) ? `<br><small class="f">${/& /.test(h.who) ? `each son/brother ${money(net * h.frac * 2 / h.cnt)}, each daughter/sister ${money(net * h.frac / h.cnt)}` : `each ${money(net * h.frac / h.cnt)}`}</small>` : `<br><small class="f">each ${money(net * h.frac / h.cnt)}</small>`) : ''; return `<div class="inh-r" style="border-left:5px solid ${col[i % col.length]}"><span><b>${esc(h.who)}</b><br><small class="f">${esc(h.label)}</small></span><span class="v">${(h.frac * 100).toFixed(1)}%</span><span class="v">${gross ? money(net * h.frac) : ''}${gross ? each : ''}</span></div>`; }).join('')}</div>
      ${note.length ? `<p style="font-size:.84rem">${note.map(esc).join('<br>')}</p>` : ''}<p class="notice">Doesn't cover grandparents, grandchildren, half-siblings or other relatives. Check with a scholar before acting on it.</p>`;
  }
  draw();
}];

/* ================= HAJJ & UMRAH ================= */
const TALB = 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ';
const TALB_T = 'Labbayk Allahumma labbayk, labbayk la sharika laka labbayk, innal-hamda wan-ni\'mata laka wal-mulk, la sharika lak.';
/* steps: [title, what to do, tips[], arabic?, transliteration?] */
const STEPS = {
  umrah: [
    ['Get ready for ihram', 'Before you reach the miqat: trim nails, remove unwanted hair, take a ghusl and (men) put on unscented perfume on the body, not the ihram. Men put on the two white sheets; women wear their normal modest clothes. Pray two rak\'ahs if it isn\'t a disliked time.', ['Flying from the UK, the plane crosses the miqat before landing in Jeddah. Change into ihram at home or at the airport, and make your intention when the crew announce the miqat.', 'Going to Madinah first? Then you enter ihram later, at Dhul Hulayfah (Abyar Ali) on the way to Makkah. Most taxis and the train stop there for it.', 'Keep your ihram in your hand luggage, not your suitcase.']],
    ['Intention and Talbiyah', 'At the miqat, make the intention: "O Allah, I intend Umrah." Then begin the Talbiyah, men aloud and women quietly, and keep repeating it until you start tawaf.', ['From now on, the ihram rules apply: no perfume, no cutting hair or nails, no hunting, no marital relations, and men don\'t cover the head or wear stitched clothes.', 'If you\'re worried something might stop you finishing (illness, delays), add: "If I am held back, my place is wherever I am held back."'], TALB, TALB_T],
    ['Arrive and enter Masjid al-Haram', 'Settle into your hotel, rest if you need to, then go to the Haram in wudu. Enter with your right foot, saying the dua for entering a masjid. When you first see the Kaaba, it\'s a moment for your own dua.', ['Check your Umrah permit time in the Nusuk app and screenshot it: the QR code scans without signal.', 'Agree a meeting point with your group before you go in, e.g. a numbered gate. Phones die and signal drops inside.', 'Carry your shoes in a small drawstring bag rather than leaving them on the racks.']],
    ['Tawaf: seven circuits', 'Start at the Black Stone corner (the green light on the wall marks the line). Face it, raise your right hand and say "Bismillah, Allahu Akbar", then walk anticlockwise with the Kaaba on your left. Seven circuits, each one starting at the same line.', ['Men: uncover the right shoulder for this tawaf (idtiba\') and walk briskly in the first three circuits if it\'s safe to.', 'There\'s no fixed dua for each circuit: make dua in any language. Between the Yemeni corner and the Black Stone, say "Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina \'adhaban-nar."', 'Lost count? Go with the lower number you\'re sure of.', 'Too busy on the ground floor? The first floor and roof are longer laps but much calmer. Wheelchairs use the first floor.']],
    ['Two rak\'ahs and Zamzam', 'Cover the shoulder again and pray two rak\'ahs behind Maqam Ibrahim if there\'s space, or anywhere in the masjid. Then drink Zamzam, facing the qibla, and make dua.', ['Don\'t push to pray right behind the Maqam: anywhere in the masjid is fine.', 'Zamzam coolers are all around the mataf and along the Sa\'i. Take a small refillable bottle.']],
    ['Sa\'i: Safa to Marwah', 'Go up Safa, face the Kaaba, praise Allah and make dua. Walk to Marwah (one lap), then back to Safa (two), finishing at Marwah on the seventh. You don\'t need wudu for Sa\'i, but it\'s better.', ['Men jog lightly between the two green lights. Women walk normally.', 'The upper floors of the Mas\'a are usually quieter, and there are lanes for wheelchairs.']],
    ['Halq or taqsir', 'Men shave the whole head (best) or shorten the hair all over. Women gather their hair and cut a fingertip\'s length from the end. Your Umrah is complete and the ihram rules are lifted. Alhamdulillah.', ['There are barbers around the Marwah end. Check the blade is new and fresh.', 'Women can cut their own hair in private, or a mahram or sister can do it.']]
  ],
  hajj: [['8 Dhul Hijjah · Day of Tarwiyah', 'Enter ihram for Hajj from where you\'re staying, make the intention and go to Mina. Pray Zuhr, Asr, Maghrib, Isha and the next Fajr there, shortening the four-rak\'ah prayers.', ['Your group handles transport between the sites: stay with them and wear your ID card at all times.']], ['9 Dhul Hijjah · Day of Arafah', 'The heart of Hajj. Go to Arafah, pray Zuhr and Asr combined and shortened, and spend the afternoon in dua until sunset. Leave after sunset for Muzdalifah.', ['Bring an umbrella, water and a small cooling spray: the heat is the biggest danger.', 'Write your dua list before the day so you don\'t forget anyone.']], ['Night at Muzdalifah', 'Pray Maghrib and Isha together, rest under the open sky and collect small pebbles for the stoning. Leave after Fajr. The elderly, women and the weak may leave after midnight.', ['A light mat and a thin blanket make the night much easier.']], ['10 Dhul Hijjah · Day of Eid', 'Stone Jamrat al-Aqabah with seven pebbles, have your sacrifice (hady) offered, shave or cut your hair, then do Tawaf al-Ifadah and Sa\'i.', ['Most UK groups buy a sacrifice voucher for you: keep the receipt.']], ['11–13 Dhul Hijjah · Days of Tashreeq', 'Spend the nights in Mina. Each day after Zuhr, stone all three jamarat, small, middle then large, with seven pebbles each. You may leave Mina before sunset on the 12th.', ['Follow the one-way routes to the Jamarat bridge and go at your group\'s allocated time.']], ['Farewell tawaf', 'Tawaf al-Wada\' is the last thing you do in Makkah before you leave.', []]]
};
/* advice cards: [icon, title, points[]] */
const ADV = {
  plan: [
    ['passport', 'Visa: two ways to go', ['British passport holders can use the Saudi tourist eVisa for Umrah outside the Hajj season (apply at visa.visitsaudi.com, usually issued within a few days), or a dedicated Umrah visa through Nusuk or an agent.', 'Book your Umrah visa through Nusuk and you\'ll need confirmed Nusuk hotel and transport bookings first.', 'Your passport needs at least six months left on it. What counts is the passport you hold, not UK residency.', 'Each year Makkah closes to Umrah visitors for several weeks around Hajj. Check the season dates before you book.']],
    ['phone', 'Nusuk: the app you can\'t skip', ['Nusuk is the official Saudi app. The visa gets you into the country; the Nusuk permit gets you into the mataf to do Umrah. You need both.', 'Book your Umrah permit for the night you arrive, and your Rawdah visit in Madinah, as early as you can. Permits are free.', 'Screenshot every permit: the QR codes work without signal.', 'Nusuk shows a live crowd level for the Haram. Check it before you leave the hotel.']],
    ['syringe', 'Health', ['Meningitis ACWY vaccination is required at least 10 days before you arrive. Ask your GP or a travel clinic, and keep the certificate with your passport.', 'Take travel insurance with medical cover and enough of any regular medication, in original packaging.', 'Feel unwell after you get home (fever, headache, stiff neck)? Call your GP or NHS 111 and say you\'ve been on Umrah.']],
    ['plane', 'Flights from Luton and London', ['Direct flights to Jeddah run from Heathrow (Saudia and British Airways). Budget airlines and one-stop routes (via Istanbul, Cairo, the Gulf or Europe) are often far cheaper but much longer.', 'Some of the cheapest deals are hand-luggage only. Check the bag size: an ihram, a few changes of clothes and a shoe bag fit in a cabin bag.', 'Fly into Jeddah and out of Madinah (or the reverse) to save a long journey. It\'s called an open-jaw ticket.', 'Avoid UK school holidays and Ramadan if cost matters: prices can jump by a third or more.']],
    ['bed', 'Hotels', ['Being close to the Haram matters more than stars: you\'ll walk there five times a day. Budget hotels are usually 1–2 km away; the closest cost the most.', 'A cheaper option is a hotel further out with a free shuttle bus, or splitting: fewer nights close in Makkah, more nights in Madinah, which is cheaper.', 'Check the hotel is officially registered (it\'ll show in Nusuk) and get the name and address in writing. Avoid "or similar".', 'In Madinah, the hotels by the north and west gates of Masjid an-Nabawi are closest to the women\'s areas and the Rawdah gates.']],
    ['pound', 'Doing it on a budget', ['Go off-peak: the quiet months after Hajj season reopens and outside school holidays are cheapest.', 'DIY can save a lot if you\'re confident: book a refundable hotel first, then the visa and Nusuk permit, then flights.', 'Share a room as a family or a group of friends: triple and quad rooms cut the cost per person.', 'Use the Haramain train and shared transport rather than private cars, and eat where the locals eat a few streets back from the Haram.', 'Five to seven nights is enough for a first Umrah: often three or four in Makkah and two or three in Madinah.']],
    ['shield', 'Don\'t get scammed', ['Book packages that include flights with an ATOL-protected company, and check the number on the CAA website.', 'Pay by credit card where you can, keep every receipt and get everything in writing.', 'Be wary of prices that look too good, cash-only deals and agents who won\'t name the hotel.', 'If it goes wrong, report it to Action Fraud (0300 123 2040).']]
  ],
  makkah: [
    ['train', 'Jeddah airport to Makkah', ['The Haramain high-speed train runs from the airport station to Makkah in under an hour and is the cheapest comfortable option. Book on the Haramain app, ideally a few days ahead.', 'From the Makkah train station you\'ll still need a short taxi to your hotel.', 'Uber and Careem work at the airport: fares are shown up front but surge at busy times. Expect roughly SAR 200–300 to Makkah.', 'Families with heavy bags often find a pre-booked fixed-price transfer easiest. Book the return at the same time.']],
    ['car', 'Getting around', ['Careem is the most widely used ride app, with Uber too. Short hops around Makkah are usually SAR 15–30.', 'Around prayer times, especially Maghrib, Isha and Jummah, roads near the Haram jam and some close. If your hotel is within a kilometre, walking is often quicker.', 'Agree the fare before you get into a street taxi.']],
    ['clock', 'Beating the crowds', ['Calmest times for tawaf: the middle of the night (around 2–4am) and after Fajr. Mid-morning on weekdays is good for a first look around.', 'Busiest: straight after each prayer, Friday, and after Maghrib and Isha in Ramadan.', 'Arrive 45–60 minutes before a prayer if you want a place inside.', 'Women\'s prayer areas are marked on every level. The ones near the mataf fill first; the first floor and roof usually have room.']],
    ['card', 'Money and phone', ['Cards (and Apple or Google Pay) work almost everywhere. Tell your bank you\'re travelling and carry some small riyal notes for stalls and tips.', 'Install a Saudi eSIM before you fly so you have data from landing, and keep your UK number for calls on WhatsApp. Airport SIMs need a passport and fingerprint.', 'Download offline maps of Makkah and Madinah, and bring a power bank.']],
    ['bag', 'Shopping and supplies', ['Forgot something? Ihram, belts, sandals, prayer mats and unscented toiletries are sold all around the Haram and in the malls under the Clock Tower.', 'Prices drop a few streets back from the Haram. Supermarkets are cheaper than the shops right by the gates for water, snacks and essentials.', 'Leave space in your case: dates, prayer mats and gifts fill it on the way home.']],
    ['drop', 'Bringing Zamzam home', ['You can take one sealed 5-litre Zamzam carton per person, bought at the airport or official outlets. It goes in the hold, never in your hand luggage.', 'Most Gulf and Saudi airlines carry it free; some budget and connecting airlines count it in your allowance. Check with yours before you fly.']],
    ['thermo', 'Staying well', ['Even in winter Makkah days are warm (20–30°C) and nights cooler; in summer it\'s extremely hot. Drink Zamzam or water constantly and use an umbrella in the sun.', 'You\'ll walk 10–20 km a day. Break in your sandals before you go, and rest between tawafs.', '"Umrah cough" is common from the crowds and air conditioning: pack throat sweets and a mask.']],
    ['kaaba', 'Ziyarat in Makkah', ['Popular visits include Jabal an-Nour (the cave of Hira), Jabal Thawr, Mina, Muzdalifah and Arafah. Go early in the morning to avoid the heat.', 'Hotels and Nusuk can book a ziyarat tour, or take a taxi for a couple of hours.']]
  ],
  madinah: [
    ['mosque', 'Visiting Masjid an-Nabawi', ['Madinah has no ihram rites: it\'s a visit to the Prophet\'s ﷺ masjid. A prayer there is worth a thousand elsewhere.', 'After praying, go to give salam to the Prophet ﷺ, then Abu Bakr and \'Umar (may Allah be pleased with them), moving with the flow of people.', 'The early hours before Fajr are the calmest time to visit.']],
    ['gate', 'The Rawdah', ['Entry to the Rawdah is by Nusuk appointment only. Book as soon as your dates are fixed: slots go quickly.', 'Men and women have separate entrances and times; the app tells you which gate.', 'Arrive early for your slot. Inside, you\'ll have a short time: pray two rak\'ahs and make dua.']],
    ['pin', 'Ziyarat in Madinah', ['Masjid Quba: the Prophet ﷺ said praying there is like the reward of an Umrah. Make wudu at your hotel and go.', 'Jabal Uhud and the martyrs\' graveyard, Masjid al-Qiblatayn, and Jannat al-Baqi (open to men after Fajr and Asr).', 'Go between sunrise and Zuhr when it\'s quieter.']],
    ['train', 'Makkah ↔ Madinah', ['The Haramain train takes around two hours between the cities, against four to five by road.', 'Book seats a few days ahead and allow time for a taxi to and from each station.', 'Heading to Makkah for Umrah? Wear your ihram, or have it in your hand luggage, and make your intention at Dhul Hulayfah.']]
  ],
  wear: [
    ['person', 'Men', ['Two white unstitched sheets (izar and rida\'). Bring two sets so you have a spare; thicker cotton or towelling in winter.', 'An ihram belt with zip pockets for phone, cards and passport copy, and a few safety pins.', 'Sandals that leave the ankle and the top of the foot bare, with proper cushioning, not cheap flip-flops.', 'Loose everyday clothes for after Umrah, and a light jumper for the cool nights and air conditioning.']],
    ['person', 'Women', ['There\'s no special ihram for women: any loose, modest clothes in any colour. The face and hands stay uncovered while in ihram.', 'Two or three breathable abayas or long dresses, easy-pin scarves and underscarves.', 'Comfortable closed shoes or slip-on flats and socks for the marble floors.', 'A light cardigan for air-conditioned areas.']],
    ['backpack', 'Carry every day', ['A small cross-body bag or pouch: phone, power bank, card, some riyals, hotel card with the address in Arabic.', 'A drawstring shoe bag, a pocket prayer mat, tissues and a refillable bottle.', 'Unscented soap, shampoo, deodorant and wipes while in ihram.']],
    ['shop', 'Where to get it in Luton', ['Islamic shops around Bury Park and Dunstable Road stock ihram, belts and unscented toiletries. Buy before you go so you can try them on.', 'Your local masjid or Hajj group may hold a free Umrah workshop: it\'s worth going to one.']]
  ],
  pack: ['Passport with 6+ months left', 'Visa printed and saved on your phone', 'Nusuk Umrah and Rawdah permits (screenshots)', 'Meningitis ACWY certificate', 'Travel insurance documents', 'Hotel bookings with Arabic address', 'Ihram x2 and belt (men)', 'Safety pins', 'Sandals that are already broken in', 'Shoe bag', 'Unscented toiletries', 'Pocket dua book or this app saved to your home screen', 'Refillable water bottle', 'Medication in original packs', 'Throat sweets and face masks', 'Plasters and blister pads', 'Power bank and long charging cable', 'Saudi eSIM installed', 'Some Saudi riyals in small notes', 'Umbrella for the sun', 'Light jumper for the evenings', 'Space in your case for Zamzam and gifts']
};
const HJ_SRC = [['UK government: pilgrimage travel advice', 'https://www.gov.uk/foreign-travel-advice/saudi-arabia/pilgrimage'], ['TravelHealthPro: Hajj and Umrah health', 'https://travelhealthpro.org.uk/factsheet/19/hajj-and-umrah'], ['Nusuk: official Umrah platform', 'https://umrah.nusuk.sa'], ['Saudi eVisa portal', 'https://visa.visitsaudi.com'], ['Check an ATOL number (CAA)', 'https://www.caa.co.uk/atol-protection/check-atol/'], ['Haramain high-speed railway', 'https://sar.hhr.sa'], ['Action Fraud', 'https://www.actionfraud.police.uk']];
TOOLS.hajj = ['Hajj & Umrah guide', null, node => {
  let tab = store.get('hjTab', 'umrah');
  const TABS = [['umrah', IFM_IC('kaaba') + ' Umrah steps'], ['plan', IFM_IC('calendar') + ' Plan & book'], ['makkah', IFM_IC('pin') + ' In Makkah'], ['madinah', IFM_IC('mosque') + ' Madinah'], ['wear', IFM_IC('shirt') + ' Wear'], ['pack', IFM_IC('checklist') + ' Checklist'], ['hajj', IFM_IC('tent') + ' Hajj']];
  const card = c => `<details class="tk-card hj-c"><summary><span class="hj-i">${IFM_IC(c[0])}</span><b>${esc(c[1])}</b><svg><use href="#i-down"/></svg></summary><ul>${c[2].map(p => `<li>${esc(p)}</li>`).join('')}</ul></details>`;
  const draw = () => {
    store.set('hjTab', tab);
    const list = STEPS[tab] || (tab === 'pack' ? ADV.pack : null), done = store.get('hj_' + tab, []);
    let body = '';
    if (tab === 'umrah' || tab === 'hajj') body = `<div class="tk-card tk-dk"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--display);font-size:1.1rem">${tab === 'hajj' ? 'Hajj at-Tamattu\', day by day' : 'Umrah, step by step'}</b><span>${done.length}/${list.length}</span></div><div class="inh-bar" style="background:rgba(255,255,255,.12)"><span style="width:${done.length / list.length * 100}%;background:var(--g)"></span></div><p style="margin:0">Tap a step to open it. Tick it off when it's done.</p></div>`
      + list.map((s, i) => { const on = done.includes(i); return `<details class="st-step hj-s ${on ? 'done' : ''}" ${!on && i === done.length ? 'open' : ''}><summary><i>${on ? '✓' : i + 1}</i><b>${esc(s[0])}</b></summary><div class="hj-b"><p>${esc(s[1])}</p>${s[3] ? `<p class="ar" lang="ar">${s[3]}</p><p style="font-style:italic">${esc(s[4])}</p><button class="btn sm ghost" type="button" data-say="${esc(s[4])}">${I('speak')}Listen</button>` : ''}${s[2].length ? `<div class="hj-tip"><b>Tips</b><ul>${s[2].map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}<button class="btn sm ${on ? 'ghost' : 'g'}" type="button" data-i="${i}">${on ? 'Mark as not done' : '✓ Done'}</button></div></details>`; }).join('');
    else if (tab === 'pack') body = `<div class="tk-card tk-dk"><div style="display:flex;justify-content:space-between"><b style="font-family:var(--display);font-size:1.1rem">Packing checklist</b><span>${done.length}/${list.length}</span></div><div class="inh-bar" style="background:rgba(255,255,255,.12)"><span style="width:${done.length / list.length * 100}%;background:var(--g)"></span></div></div>` + list.map((s, i) => { const on = done.includes(i); return `<button class="st-step ${on ? 'done' : ''}" type="button" data-i="${i}" style="align-items:center"><i>${on ? '✓' : ''}</i><span>${esc(s)}</span></button>`; }).join('') + `<button class="btn sm ghost" type="button" id="hjCopy">${I('copy')}Copy the list</button>`;
    else body = ADV[tab].map(card).join('');
    node.innerHTML = `<div class="tk-seg" id="hjSeg">${TABS.map(([k, n]) => `<button type="button" data-t="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div><div style="display:grid;gap:10px">${body}</div>
      ${tab === 'plan' ? '<p class="notice">Rules, fees and season dates change every year. Always check Nusuk and the UK government\'s travel advice before you book.</p>' : ''}
      <p class="notice">Some details differ between the schools of thought: follow your scholar or group leader. Tips gathered from official guidance and experienced pilgrims.</p>
      <details class="tk-card hj-c"><summary><span class="hj-i">${IFM_IC('link')}</span><b>Official links</b><svg><use href="#i-down"/></svg></summary><ul>${HJ_SRC.map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a></li>`).join('')}</ul></details>`;
    const seg = $('#hjSeg'); seg.querySelector('[aria-pressed=true]').scrollIntoView({ inline: 'center', block: 'nearest' });
    $$('#hjSeg button').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
    $$('[data-i]', node).forEach(b => b.onclick = e => { e.preventDefault(); const i = +b.dataset.i; let L = store.get('hj_' + tab, []); L = L.includes(i) ? L.filter(x => x !== i) : L.concat(i); store.set('hj_' + tab, L); if (navigator.vibrate) navigator.vibrate(8); if (L.length === list.length) { toast(tab === 'pack' ? 'All packed! Safe travels.' : 'May Allah accept it from you.'); X.burst(); } draw(); });
    $$('[data-say]', node).forEach(b => b.onclick = () => X.speak(b.dataset.say));
    const c = $('#hjCopy'); if (c) c.onclick = () => copy('Umrah packing checklist (Inspire FM)\n' + ADV.pack.map(x => '☐ ' + x).join('\n'), 'Checklist copied');
  };
  draw();
}];

/* ================= KIDS' CORNER ================= */

/* ---------- nicer read-aloud: best voice on the device, female/male choice, speed, line highlighting ---------- */
const FEM = /samantha|serena|kate|martha|stephanie|libby|sonia|hazel|susan|female|moira|tessa|karen|fiona|victoria|allison|ava|zira|jenny|aria|emma|amy|maisie|abbie|olivia|natasha|clara|catherine|siri.*(voice 2|female)/i;
const MAL = /daniel|arthur|oliver|george|ryan|thomas|male|alex|fred|rishi|aaron|guy|brian|eric|david|mark|jamie|gordon|lee|william|siri.*(voice 1|voice 3|male)/i;
const voiceScore = v => (/natural|neural|premium|enhanced|siri/i.test(v.name) ? 50 : 0) + (/google/i.test(v.name) ? 20 : 0) + (/en-GB/i.test(v.lang) ? 15 : /^en/i.test(v.lang) ? 8 : -100) + (v.localService ? 2 : 0);
function voices() { try { return speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)); } catch (e) { return []; } }
function pickVoice() { const pref = store.get('kVoice', 'auto'), L = voices(); if (!L.length) return null; if (pref === 'female') return L.find(v => FEM.test(v.name)) || L[0]; if (pref === 'male') return L.find(v => MAL.test(v.name)) || L[0]; return L.find(v => v.name === pref) || L[0]; }
function readLines(lines, onLine, onEnd) { try { speechSynthesis.cancel(); } catch (e) { return; } const v = pickVoice(), rate = store.get('kRate', .92); let i = 0;
  const next = () => { if (i >= lines.length) { onLine(-1); onEnd && onEnd(); return; } const u = new SpeechSynthesisUtterance(lines[i]); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB'; u.rate = rate; u.pitch = store.get('kVoice', 'auto') === 'female' ? 1.08 : 1; onLine(i); u.onend = () => { i++; next(); }; u.onerror = () => { onLine(-1); }; speechSynthesis.speak(u); }; next(); }

const STORIES = [
  { t: 'The ark in the desert', who: 'Prophet Nuh (AS)', g: ['#568aa1', '#414b67'], p: ['Prophet Nuh called his people to worship Allah alone for hundreds of years, but only a few listened.', 'Allah told him to build a huge ship, far from any sea. People laughed as he hammered away. Nuh kept building, because he trusted Allah.', 'Then the rain came and the earth burst with water. Nuh, the believers and pairs of every animal were safe inside the ark.', 'Lesson: keep doing the right thing, even when others laugh at you.'] },
  { t: 'A prayer from inside the whale', who: 'Prophet Yunus (AS)', g: ['#48847d', '#263b3a'], p: ['Prophet Yunus left his people in frustration before Allah told him to. He boarded a ship, a storm hit, and he ended up in the sea.', 'A giant whale swallowed him. In the darkness he called out: "There is no god but You, glory be to You, I was among the wrongdoers."', 'Allah heard him. The whale brought him safely to the shore, and his people later believed.', 'Lesson: when we make a mistake, we can always turn back to Allah.'] },
  { t: 'Building the Kaaba', who: 'Prophet Ibrahim & Isma\'il (AS)', g: ['#a68a5a', '#5a3e34'], p: ['Allah told Prophet Ibrahim to build a house for worshipping Him, in the valley of Makkah.', 'Ibrahim laid the stones while his son Isma\'il passed them up to him. As they worked they made dua: "Our Lord, accept this from us."', 'Today millions of people pray towards that same house, the Kaaba, every single day.', 'Lesson: do good work together, and ask Allah to accept it.'] },
  { t: 'Water for a thirsty dog', who: 'From the Prophet ﷺ', g: ['#a4a3a1', '#2f4c3a'], p: ['The Prophet ﷺ told of a man walking on a hot day who found a well and drank.', 'Then he saw a dog panting and licking the damp ground from thirst. He climbed back down, filled his leather sock with water and gave it to the dog.', 'Allah thanked him for it and forgave him. (Bukhari)', 'Lesson: kindness to every living thing matters to Allah.'] }
];
const ABJ = [['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tha'], ['ج', 'Jeem'], ['ح', 'Haa'], ['خ', 'Khaa'], ['د', 'Daal'], ['ذ', 'Dhaal'], ['ر', 'Ra'], ['ز', 'Zay'], ['س', 'Seen'], ['ش', 'Sheen'], ['ص', 'Saad'], ['ض', 'Daad'], ['ط', 'Taa'], ['ظ', 'Dhaa'], ['ع', 'Ayn'], ['غ', 'Ghayn'], ['ف', 'Fa'], ['ق', 'Qaaf'], ['ك', 'Kaaf'], ['ل', 'Laam'], ['م', 'Meem'], ['ن', 'Noon'], ['ه', 'Ha'], ['و', 'Waw'], ['ي', 'Ya']];
const QUIZ = [['How many times a day do Muslims pray?', ['3', '5', '7'], 1], ['Which month do Muslims fast in?', ['Shawwal', 'Ramadan', 'Muharram'], 1], ['What is the first pillar of Islam?', ['Hajj', 'Zakat', 'Shahadah'], 2], ['Which direction do we face to pray?', ['The Kaaba in Makkah', 'The sunrise', 'Our house'], 0], ['What do we say before we eat?', ['Alhamdulillah', 'Bismillah', 'SubhanAllah'], 1], ['Which prophet built the ark?', ['Nuh (AS)', 'Musa (AS)', 'Yusuf (AS)'], 0]];
TOOLS.kids = ["Kids' corner", null, node => {
  let tab = 'stories', qi = 0, score = 0;
  try { speechSynthesis.onvoiceschanged = () => { if (tab === 'stories' && node.isConnected && !$('[data-read].on', node)) draw(); }; } catch (e) {}
  const draw = () => {
    node.innerHTML = `<div class="tk-seg" id="kdSeg">${[['stories', IFM_IC('book') + ' Stories'], ['letters', 'ا Letters'], ['quiz', IFM_IC('quiz') + ' Quiz']].map(([k, n]) => `<button type="button" data-t="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div><div id="kdBody" style="display:grid;gap:12px"></div>`;
    $$('#kdSeg button').forEach(b => b.onclick = () => { tab = b.dataset.t; qi = 0; score = 0; draw(); });
    const B = $('#kdBody');
    if (tab === 'stories') { const vs = voices(), pref = store.get('kVoice', 'auto');
      B.innerHTML = `<details class="tk-card kv kv-d"><summary><b>Story voice</b><small>Change voice or speed</small></summary><div class="tk-seg" id="kvSeg">${[['auto', 'Best'], ['female', 'Female'], ['male', 'Male']].map(([k, n]) => `<button type="button" data-kv="${k}" aria-pressed="${pref === k}">${n}</button>`).join('')}</div>${vs.length > 1 ? `<select id="kvAll" aria-label="All voices"><option value="">More voices on this phone (${vs.length})…</option>${vs.map(v => `<option value="${esc(v.name)}" ${pref === v.name ? 'selected' : ''}>${esc(v.name.replace(/\s*\(.*\)/, ''))} · ${esc(v.lang)}</option>`).join('')}</select>` : ''}<label class="kv-r">Speed<input type="range" id="kvRate" min=".7" max="1.15" step=".05" value="${store.get('kRate', .92)}"></label><small style="color:var(--mut)">On iPhone, the most natural voices are in Settings › Accessibility › Spoken Content › Voices (download an "Enhanced" or "Premium" voice).</small></details>`
        + STORIES.map((s, i) => `<article class="kid-st" style="--a:${s.g[0]};--b:${s.g[1]}"><small style="font-weight:600;letter-spacing:.1em;text-transform:uppercase;opacity:.85">${esc(s.who)}</small><h4>${esc(s.t)}</h4>${s.p.map((x, j) => `<p data-l="${j}"${j === s.p.length - 1 ? ' style="font-weight:600"' : ''}>${esc(x)}</p>`).join('')}<button class="btn sm w" type="button" data-read="${i}">${I('speak')}Read it to me</button></article>`).join('') + '<p class="notice">Stories retold simply for children. Prophets are never pictured, out of respect.</p>';
      $$('[data-kv]', B).forEach(b => b.onclick = () => { store.set('kVoice', b.dataset.kv); draw(); setTimeout(() => readLines(['Assalamu alaikum! Shall I read you a story?'], () => {}), 50); });
      const ka = $('#kvAll'); if (ka) ka.onchange = () => { if (ka.value) { store.set('kVoice', ka.value); $$('[data-kv]', B).forEach(b => b.setAttribute('aria-pressed', 'false')); readLines(['Assalamu alaikum! Shall I read you a story?'], () => {}); } };
      $('#kvRate').oninput = e => store.set('kRate', +e.target.value); }
    if (tab === 'letters') { B.innerHTML = `<div class="tk-card tk-dk" style="text-align:center"><div id="abBig" style="font-family:var(--ar);font-size:5rem;line-height:1.2">ا</div><b id="abName" style="font-family:var(--display);font-size:1.3rem">Alif</b><p style="margin:4px 0 0">Tap a letter to hear its name</p></div><div class="ab-grid">${ABJ.map(([l, n], i) => `<button type="button" data-ab="${i}">${l}<small>${n}</small></button>`).join('')}</div>`; }
    if (tab === 'quiz') quiz(B);
    $$('[data-read]', B).forEach(b => b.onclick = () => { const art = b.closest('.kid-st'), s = STORIES[+b.dataset.read];
      if (b.classList.contains('on')) { speechSynthesis.cancel(); b.classList.remove('on'); $$('p', art).forEach(p => p.classList.remove('rd')); return; }
      if (s.audio) { const a = new Audio(s.audio); a.play(); return; } /* recorded narration, when Inspire adds it */
      $$('[data-read].on', B).forEach(x => x.classList.remove('on')); b.classList.add('on');
      readLines([s.t + '.'].concat(s.p), i => { $$('p', art).forEach(p => p.classList.toggle('rd', +p.dataset.l === i - 1)); if (i < 0) b.classList.remove('on'); }); });
    $$('[data-ab]', B).forEach(b => b.onclick = () => { const [l, n] = ABJ[+b.dataset.ab]; $('#abBig').textContent = l; $('#abName').textContent = n; $$('[data-ab]', B).forEach(x => x.classList.toggle('on', x === b)); X.speak(n); if (navigator.vibrate) navigator.vibrate(8); });
  };
  function quiz(B) {
    if (qi >= QUIZ.length) { B.innerHTML = `<div class="tk-card tk-dk" style="text-align:center"><div style="font-size:3rem">${IFM_IC('starf').repeat(Math.max(1, Math.round(score / 2)))}</div><div class="tk-big">${score}/${QUIZ.length}</div><p>${score === QUIZ.length ? 'MashaAllah, full marks!' : 'Well done! Try again for more stars.'}</p><button class="btn g" type="button" id="qzRe">Play again</button></div>`; $('#qzRe').onclick = () => { qi = 0; score = 0; quiz(B); }; if (score === QUIZ.length) X.burst(); return; }
    const [q, o] = QUIZ[qi];
    B.innerHTML = `<div class="tk-card tk-dk"><small style="color:var(--g);font-weight:600">QUESTION ${qi + 1} OF ${QUIZ.length}</small><h4 style="color:#fff;font-size:1.4rem;margin-top:6px">${esc(q)}</h4></div>${o.map((x, i) => `<button class="st-step" type="button" data-o="${i}" style="grid-template-columns:40px 1fr;align-items:center"><i>${'ABC'[i]}</i><b>${esc(x)}</b></button>`).join('')}`;
    $$('[data-o]', B).forEach(b => b.onclick = () => { const ok = +b.dataset.o === QUIZ[qi][2]; b.classList.add('done'); b.querySelector('i').textContent = ok ? '✓' : '×'; if (!ok) { b.style.borderColor = '#ad6f6d'; const r = $(`[data-o="${QUIZ[qi][2]}"]`, B); r.classList.add('done'); } else score++; if (navigator.vibrate) navigator.vibrate(ok ? 15 : [30, 40, 30]); $$('[data-o]', B).forEach(x => x.disabled = true); setTimeout(() => { qi++; quiz(B); }, 1100); });
  }
  draw();
}];


/* Toolbox search */
const KW = { iam: 'islamophobia hate crime report racism abuse attack tell mama police support', feel: 'how i feel feelings mood mental health anxiety sad depressed stressed lonely grief angry help support', ayah: 'quran memorise challenge streak hifz learn', track: 'salah prayer log', tasbih: 'dhikr counter beads', qibla: 'compass direction kaaba', weather: 'weather forecast rain umbrella temperature sun wind snow cold hot pollen air quality accuweather met office', quran: 'read recite surah', duas: 'supplication dua', alerts: 'adhan notification azan reminder', wall: 'prayer wallpaper lock screen iphone home screen monthly timetable download', jamaat: 'mosque masjid times iqamah', jummah: 'friday mosque', janazah: 'funeral death', notices: 'noticeboard lost found classes jobs', business: 'halal shops restaurants directory', hijri: 'islamic calendar date', ramadan: 'suhoor sehri iftar fasting timetable', dates: 'eid islamic dates', zakat: 'charity money sadaqah giving', inherit: 'inheritance will estate faraid', hajj: 'umrah makkah madinah ihram pilgrimage', kids: 'children stories alphabet quiz' };
const q = $('#tbQ');
if (q) q.addEventListener('input', () => { const v = q.value.toLowerCase().trim(); let any = 0;
  $$('[data-page=toolbox] .tb-sec').forEach(h => { const g = h.nextElementSibling; let n = 0;
    $$('.tbt, .tb-more a', g).forEach(a => { const k = (a.getAttribute('href') || '').replace('#tb-', '').replace('#', ''); const hit = !v || (a.textContent + ' ' + (KW[k] || '') + ' ' + k).toLowerCase().includes(v); a.hidden = !hit; if (hit) n++; });
    h.hidden = g.hidden = !n; any += n; });
  $('#tbNone').hidden = !!any; });

/* status lines on the icons */
const m = M.find(x => x.id === store.get('masjid', '')); if (m && $('#tbJaS')) $('#tbJaS').textContent = m.n.length > 18 ? m.n.slice(0, 17) + '…' : m.n;
})();
