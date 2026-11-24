/* Inspire FM · Out & about in Luton: halal events coming up, activities for kids, discounts for young people.
   Data in outings-data.js (activities, family days out and discounts from the NGS app's research, checked November 2026,
   with Christmas, nightlife, adult-only and non-halal food items left out; Muslim events researched for Inspire FM). */
(function () {
'use strict';
const X = window.IFMX, D = window.IFM_OUT; if (!X || !D) return;
const { $, $$, esc, TOOLS, toast } = X;
const IC = (n, c) => window.IFM_IC ? window.IFM_IC(n, c) : '';
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dOf = s => { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const map = x => 'https://www.google.com/maps/search/' + encodeURIComponent(x.where + ' ' + (/^[A-Z]{1,2}\d/.test(x.pc || '') ? x.pc : 'Luton'));
const send = (subj) => `mailto:info@inspirefm.org?subject=${encodeURIComponent(subj)}`;
const note = (txt, subj) => `<p class="oa-note">${txt} <a href="${send(subj)}">Tell us</a>.</p>`;
const chips = (L, cur) => `<div class="dk-sugg oa-chips">${L.map(([k, n]) => `<button type="button" data-f="${k}" class="${cur === k ? 'ch' : ''}">${esc(n)}</button>`).join('')}</div>`;
const AREAS = [['', 'Anywhere'], ['luton', 'In Luton'], ['near', 'Near Luton'], ['far', 'Further afield']];
const areaSeg = (cur, has) => `<div class="oa-age oa-area" role="group" aria-label="Where">${AREAS.filter(([k]) => !k || has.includes(k)).map(([k, n]) => `<button type="button" data-area="${k}" aria-pressed="${cur === k}">${n}</button>`).join('')}</div>`;
const AREA_N = { luton: 'In Luton', near: 'Near Luton', far: 'Further afield' };
const art = (x, list) => window.IFM_OUT_ART ? `<span class="ot-art">${window.IFM_OUT_ART(x, list)}</span>` : '';
const costTag = x => `<span class="oa-t ${x.cost === 'Free' ? 'fr' : x.cost === 'Low' ? 'lo' : 'pd'}">${esc(x.p)}</span>`;
const links = x => `<div class="oa-acts">${x.where ? `<a href="${map(x)}" target="_blank" rel="noopener">${IC('pin')}Directions</a>` : ''}${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${IC('link')}Website</a>` : ''}${x.s ? `<button type="button" data-ics="${esc(x.t)}">${IC('calendar')}Add to calendar</button>` : ''}</div>`;
const wire = (node, draw) => {
  node.addEventListener('click', e => {
    const f = e.target.closest('[data-f]'); if (f) { draw(f.dataset.f); return; }
    const ic = e.target.closest('[data-ics]'); if (ic) { ics(ic.dataset.ics); return; }
    if (e.target.closest('a,button,select')) return;
    const c = e.target.closest('.oa-c'); if (c) c.classList.toggle('open');
  });
};
function ics(title) {
  const x = [...D.HE, ...D.FAM].find(e => e.t === title); if (!x) return;
  const d = s => s.replace(/-/g, ''), end = dOf(x.e); end.setDate(end.getDate() + 1);
  const e2 = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}`;
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Inspire FM//Events//EN', 'BEGIN:VEVENT', `UID:${d(x.s)}-${x.t.length}@inspirefm.org`, `DTSTART;VALUE=DATE:${d(x.s)}`, `DTEND;VALUE=DATE:${e2}`, `SUMMARY:${x.t.replace(/[,;]/g, ' ')}`, `LOCATION:${(x.where + ' ' + (x.pc || '')).replace(/[,;]/g, ' ')}`, `DESCRIPTION:${(x.when + '. ' + (x.url || '')).replace(/[,;]/g, ' ')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'inspire-fm-event.ics'; document.body.appendChild(a); a.click(); a.remove(); toast('Opening your calendar');
}

window.IFM_TOOL_IC = Object.assign(window.IFM_TOOL_IC || {}, { events: ['calendar', '#8b73b4'], kids2: ['smile', '#9f6f55'], deals: ['card', '#a57595'] });

/* ---------- Halal events coming up ---------- */
TOOLS.events = ['Halal events coming up', null, node => {
  const T = today();
  const ALL = [...D.HE.map(x => Object.assign({ halal: 1 }, x)), ...D.FAM].filter(x => dOf(x.e) >= T).sort((a, b) => dOf(a.s) - dOf(b.s));
  const F = [['all', 'All'], ['fun', 'Fun & comedy'], ['talk', 'Talks & learning'], ['fam', 'Family'], ['day', 'Days out'], ['free', 'Free'], ['week', 'Next 7 days']];
  let area = '', cur = 'all';
  const draw = f => { cur = f;
    const lim = new Date(T); lim.setDate(lim.getDate() + 7);
    const L = ALL.filter(x => f === 'all' || (f === 'halal' && x.halal) || (f === 'free' && x.cost === 'Free') || (f === 'week' && dOf(x.s) <= lim) || (f === 'fam' && (x.k === 'fam' || x.fam)) || x.k === f).filter(x => !area || x.area === area);
    node.innerHTML = `<div class="oa">
      <p class="oa-lead">Halal comedy, family shows, Muslim talks and days out in and around Luton.</p>
      ${areaSeg(area, ['luton', 'near', 'far'])}
      ${chips(F, f)}
      ${L.length ? L.map(x => { const s = dOf(x.s), on = s <= T;
        return `<div class="oa-c ev${x.halal ? ' hl' : ''}"><span class="oa-tile">${art(x, 'ev')}<span class="oa-d"><b>${on ? 'Now' : s.getDate()}</b><i>${on ? 'on' : MO[s.getMonth()]}</i></span></span><div class="oa-m">
          <h4>${esc(x.t)}</h4><small>${esc(x.when)}</small>
          <div class="oa-ts">${x.halal ? `<span class="oa-t hl">${x.k === 'fun' ? 'Halal fun' : 'Muslim event'}</span>` : '<span class="oa-t">Day out</span>'}${costTag(x)}<span class="oa-t ar ${x.area}">${AREA_N[x.area] || ''}</span></div>
          <div class="oa-more"><p>${esc(x.d)}</p><p><b>Where:</b> ${esc(x.where)}${x.pc && x.pc !== 'Luton' && x.pc !== 'London' ? ', ' + esc(x.pc) : ''}<br><b>Who for:</b> ${esc(x.ages)}</p>${links(x)}</div></div></div>`; }).join('') : '<div class="tk-empty">Nothing coming up for that filter yet.</div>'}
      ${note(`Checked ${esc(D.checked)}. Dates and tickets can change, so check before you go. Days out leave out Christmas events, nightlife and adult-only shows. Running a halal event in Luton?`, 'Event for the Inspire FM app')}
    </div>`;
  };
  node.addEventListener('click', e => { const a = e.target.closest('[data-area]'); if (a) { area = a.dataset.area; draw(cur); } });
  wire(node, draw); draw('all');
}];

/* ---------- Activities for kids ---------- */
TOOLS.kids2 = ['Activities for kids', null, node => {
  const C = [['all', 'All'], ['free', 'Free'], ['play', 'Indoor fun'], ['sport', 'Sport'], ['swim', 'Swim'], ['out', 'Parks'], ['youth', 'Youth clubs'], ['arts', 'Museums & arts'], ['lib', 'Libraries'], ['hol', 'Holidays'], ['near', 'Nearby'], ['send', 'SEND friendly']];
  const AG = { u5: [0, 4], '5': [5, 11], '12': [12, 17] };
  let age = '', area = '', cur = 'all';
  const draw = f => { cur = f;
    const L = D.WO.filter(x => (f === 'all' || (f === 'free' && x.cost === 'Free') || (f === 'send' && x.send) || x.c === f || (f === 'near' && x.near)) && (!age || (x.a[0] <= AG[age][1] && x.a[1] >= AG[age][0])) && (!area || x.area === area));
    node.innerHTML = `<div class="oa">
      <p class="oa-lead">${D.WO.length} things for children and teens to do in Luton, ${D.WO.filter(x => x.cost === 'Free').length} of them free.</p>
      <div class="oa-age" role="group" aria-label="Age">${[['', 'All ages'], ['u5', 'Under 5'], ['5', '5 to 11'], ['12', '12 to 17']].map(([k, n]) => `<button type="button" data-age="${k}" aria-pressed="${age === k}">${n}</button>`).join('')}</div>
      ${areaSeg(area, ['luton', 'near'])}
      ${chips(C.filter(c => c[0] !== 'near'), f)}
      ${L.length ? L.map(x => `<div class="oa-c"><span class="oa-tile">${art(x, 'kids')}</span><div class="oa-m">
          <h4>${esc(x.t)}</h4><small>${esc(x.org || '')}</small>
          <div class="oa-ts">${costTag(x)}<span class="oa-t">${esc(x.ages)}</span>${x.isNew ? '<span class="oa-t nw">New</span>' : ''}${x.send ? '<span class="oa-t">SEND friendly</span>' : ''}<span class="oa-t ar ${x.area}">${AREA_N[x.area]}</span></div>
          <div class="oa-more"><p>${esc(x.d)}</p><p><b>When:</b> ${esc(x.when)}<br><b>Where:</b> ${esc(x.where)}${x.pc ? ', ' + esc(x.pc) : ''}</p>${x.dc ? `<p class="oa-dc"><b>Deal:</b> ${esc(x.dc)}</p>` : ''}${x.k ? `<p class="oa-k"><b>Good to know:</b> ${esc(x.k)}</p>` : ''}${links(x)}</div></div></div>`).join('') : '<div class="tk-empty">Nothing matches. Try another age or filter.</div>'}
      ${note(`Checked ${esc(D.checked)} from venue and council websites. Prices and times change, so check before you go. Run a kids' activity in Luton?`, 'Kids activity for the Inspire FM app')}
    </div>`;
    $$('[data-age]', node).forEach(b => b.onclick = () => { age = b.dataset.age; draw(f); });
    $$('[data-area]', node).forEach(b => b.onclick = () => { area = b.dataset.area; draw(f); });
  };
  wire(node, draw); draw('all');
}];

/* ---------- Discounts for young people ---------- */
TOOLS.deals = ['Discounts for young people', null, node => {
  const C = [['all', 'Everything'], ['travel', 'Travel'], ['fun', 'Cinema'], ['sport', 'Sport & gym'], ['shop', 'Shopping']];
  const draw = f => {
    const L = D.DL.filter(x => f === 'all' || x.c === f);
    node.innerHTML = `<div class="oa">
      <p class="oa-lead">Money off for young people and students, in Luton and online.</p>
      <div class="oa-sign"><b>Sign up once, save everywhere</b>${D.SIGN.map(s => `<a href="${esc(s.u)}" target="_blank" rel="noopener"><span>${esc(s.n)}</span><small>${esc(s.s)}</small></a>`).join('')}</div>
      ${chips(C, f)}
      ${L.map(x => `<div class="oa-c"><span class="oa-i">${IC({ travel: 'train', fun: 'star', sport: 'medal', shop: 'bag' }[x.c] || 'card')}</span><div class="oa-m">
          <h4>${esc(x.t)}</h4><span class="oa-save">${esc(x.save)}</span>
          <div class="oa-ts"><span class="oa-t">${esc(x.ages)}</span></div>
          <div class="oa-more"><p>${esc(x.d)}</p>${links(x)}</div></div></div>`).join('')}
      ${note('Deals change often and some need a student ID or an app. Know a halal food deal or a local discount for young people in Luton?', 'Discount for the Inspire FM app')}
    </div>`;
  };
  wire(node, draw); draw('all');
}];
})();
