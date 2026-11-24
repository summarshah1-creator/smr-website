/* Luton Community Hub: tools4.js
   1) Event budget, built into the Event planner: pick the event type and it fills the usual cost lines (venue, food,
      printing, insurance, equipment, licences, DBS and so on), every amount editable, income lines (tickets, sponsors,
      grants, donations, sales) marked confirmed or expected, contingency, live totals and the amount still to raise.
      Saved (on the device and on the server through audit.js), printable, copyable, and it carries into the Funding
      bid checklist. Ideas taken from Eventbrite's event budget template, NCVO's project budget guidance and the
      "costs / confirmed income / still to raise" layout funders such as The National Lottery Community Fund ask for.
   2) Gating: pages added by later files (tools3, guides, legal, this file) go through the same sign-in check as the rest.
   Loaded after tools3.js / guides.js. */
(window.LCH_EXT = window.LCH_EXT || []).push(L => {
const T = L.T3; if (!T) return;
const { V, store, esc, toast } = L;
const { tAns, si, $, $$ } = T;
const slugK = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'event';
const money = n => '£' + (Math.round((+n || 0) * 100) / 100).toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const num = v => { const n = parseFloat(String(v ?? '').replace(/[£,\s]/g, '')); return isFinite(n) && n > 0 ? n : 0; };
let uid = Date.now() % 1e6; const nid = () => 'b' + (++uid).toString(36);

/* ---------- typical lines by event ---------- */
const KINDS = [['fund', 'Fundraiser'], ['comm', 'Community day or fair'], ['faith', 'Faith or cultural event'], ['family', 'Family or children’s event'], ['talk', 'Talk, workshop or meeting'], ['sport', 'Sports event']];
const preset = (a = {}) => { const x = a.extra || [], k = a.kind || 'comm', c = [], inc = [];
  const C = (cat, label, note = '', amt = '') => c.push({ id: nid(), cat, label, note, amt });
  const I = (cat, label, note = '', conf = false) => inc.push({ id: nid(), cat, label, note, amt: '', conf });
  C('Venue', a.venue === 'out' ? 'Site or park hire' : 'Venue or room hire', 'Ask what’s included: tables, chairs, cleaning, heating, kitchen use.');
  C('Equipment', k === 'talk' ? 'Projector, screen and microphone' : 'Equipment hire (tables, gazebos, PA)', 'Borrow first: try the Venues, Equipment & Services page.');
  if (x.includes('food') || ['fund', 'comm', 'faith', 'family'].includes(k)) C('Food & drink', 'Food and drink', 'Allow for allergy-safe options and water.');
  C('Publicity', 'Printing: posters and flyers', 'Get two quotes. Design and print at community rates from the Studio.');
  C('Insurance', 'Public liability insurance', 'Check whether your policy or the venue’s already covers this event.');
  if (x.includes('alc')) C('Licences', 'Temporary Event Notice', 'GOV.UK fee £21.', '21');
  if (x.includes('music')) C('Licences', 'Music licence (if the venue doesn’t have one)', 'Ask the venue first; PPL PRS can quote.');
  if (x.includes('road')) C('Licences', 'Road closure', 'Ask Luton Council’s Highways team for the fee and allow 12 weeks.');
  if (x.includes('collect')) C('Licences', 'Street collection permit', 'Luton Council charges no fee.', '0');
  if (x.includes('kids') || k === 'family') C('Safeguarding', 'DBS checks', 'Standard and enhanced checks are free for volunteers; an umbrella body may charge an admin fee.');
  C('Safety', 'First aid kit and cover', 'A stocked kit and a named first aider; bigger events may need a first aid provider.');
  if (x.includes('inflat')) C('Activities', 'Bouncy castle or rides hire', 'Ask for the inspection certificate and their insurance.');
  if (k === 'family') C('Activities', 'Craft and activity materials');
  if (k === 'sport') C('Activities', 'Pitch or court hire, kit and medals');
  if (k === 'talk') C('People', 'Speaker expenses or fees');
  if (x.includes('raffle')) C('Prizes', 'Raffle prizes (bought)', 'Ask local businesses to donate prizes instead.');
  C('People', 'Volunteer expenses (travel, food)', 'Pay back real costs with receipts.');
  C('Other', 'Decorations, signs and name badges');
  C('Other', 'Thank-you gifts or cards');
  if (x.includes('tix')) inc.push({ id: nid(), cat: 'Tickets', label: 'Ticket sales', note: '', amt: '', qty: '', price: '', conf: false });
  I('Sponsorship', 'Local business sponsorship', 'Cash or in-kind: printing, food, prizes.');
  if (k !== 'talk') I('Grants', 'Grant', 'See the Funding finder for small grants.');
  I('Donations', 'Donations on the day');
  if (x.includes('raffle')) I('Raffle', 'Raffle or tombola');
  if (x.includes('food') || ['fund', 'comm', 'faith'].includes(k)) I('Sales', 'Food and stall sales');
  return { kind: k, cost: c, inc, cont: 10, ga: false, at: Date.now() }; };

const evA = () => tAns('ev_plan');
const bKey = () => 'evbud-' + slugK(evA()?.name || 'my-event');
const getB = () => { let b = store.get(bKey(), null); if (!b || !b.cost) { b = preset(evA() || {}); store.set(bKey(), b); } return b; };
const putB = b => { b.at = Date.now(); store.set(bKey(), b); store.set('evbud-last', { key: bKey(), name: evA()?.name || 'Your event', date: evA()?.date || '' }); };
const lineAmt = l => l.qty !== undefined && (l.qty !== '' || l.price !== '') ? num(l.qty) * num(l.price) : num(l.amt);
const totals = b => { const cost = b.cost.reduce((s, l) => s + lineAmt(l), 0), cont = cost * (num(b.cont) / 100);
  const dons = b.inc.filter(l => l.cat === 'Donations').reduce((s, l) => s + lineAmt(l), 0), ga = b.ga ? dons * 0.25 : 0;
  const conf = b.inc.filter(l => l.conf).reduce((s, l) => s + lineAmt(l), 0), exp = b.inc.filter(l => !l.conf).reduce((s, l) => s + lineAmt(l), 0) + ga;
  const all = cost + cont; return { cost, cont, all, conf, exp, ga, raise: Math.max(0, all - conf), net: conf + exp - all }; };

/* ---------- view ---------- */
const row = (l, g) => `<div class="bgl" data-bid="${l.id}" data-g="${g}">
  <div class="bgl-m"><input class="in bgl-l" value="${esc(l.label)}" aria-label="What it’s for" data-bf="label">${l.note ? `<small>${esc(l.note)}</small>` : ''}</div>
  ${l.qty !== undefined ? `<div class="bgl-q"><input class="in" inputmode="numeric" placeholder="Qty" value="${esc(l.qty)}" aria-label="Number of tickets" data-bf="qty"><span>×</span><input class="in" inputmode="decimal" placeholder="£ each" value="${esc(l.price)}" aria-label="Price per ticket" data-bf="price"></div>` : `<label class="bgl-a"><span>£</span><input class="in" inputmode="decimal" placeholder="0" value="${esc(l.amt)}" aria-label="Amount for ${esc(l.label)}" data-bf="amt"></label>`}
  ${g === 'inc' ? `<button type="button" class="bgl-c${l.conf ? ' on' : ''}" data-bconf aria-pressed="${!!l.conf}">${l.conf ? si('check') + ' Confirmed' : 'Expected'}</button>` : ''}
  <button type="button" class="bgl-x" data-bdel aria-label="Remove ${esc(l.label)}">×</button></div>`;
const sumHTML = (b, t) => `<div class="bgsum" aria-live="polite">
  <div><small>Total costs</small><b>${money(t.all)}</b>${t.cont ? `<small>incl. ${num(b.cont)}% contingency (${money(t.cont)})</small>` : ''}</div>
  <div><small>Income confirmed</small><b>${money(t.conf)}</b><small>Expected: ${money(t.exp)}${t.ga ? ' incl. Gift Aid' : ''}</small></div>
  <div class="bgraise${t.raise ? '' : ' ok'}"><small>Amount to raise</small><b>${money(t.raise)}</b><small>${t.raise ? (t.net >= 0 ? 'Covered if expected income comes in' : `Still short by ${money(-t.net)} even with expected income`) : 'Fully covered by confirmed income'}</small></div></div>`;
const budget = () => { const b = getB(), t = totals(b), a = evA();
  return `<section class="toolsec bgsec" id="evbudget" aria-labelledby="bgh"><div class="bghd"><h2 id="bgh">Event budget</h2><p class="note">${a ? `For <b>${esc(a.name || 'your event')}</b>. ` : ''}Start from the usual costs for your type of event, put in your own amounts and see what’s left to raise. Saved as you type.</p></div>
  <div class="bgtype"><label class="f">Type of event<select class="in" data-bkind data-uxd="1">${KINDS.map(([v, l]) => `<option value="${v}"${b.kind === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label><button type="button" class="btn s sm" data-breset>Refill the usual lines</button></div>
  ${sumHTML(b, t)}
  <h3>Costs</h3><div class="bglist">${b.cost.map(l => row(l, 'cost')).join('')}</div><button type="button" class="btn s sm bgadd" data-badd="cost">+ Add a cost</button>
  <label class="bgcont">Contingency for surprises <span><input class="in" inputmode="decimal" value="${esc(b.cont)}" data-bcont aria-label="Contingency percent"> %</span></label>
  <h3>Income</h3><div class="bglist">${b.inc.map(l => row(l, 'inc')).join('')}</div><button type="button" class="btn s sm bgadd" data-badd="inc">+ Add income</button>
  <label class="bgga"><input type="checkbox" data-bga ${b.ga ? 'checked' : ''}> Add Gift Aid on donations (25p for every £1 from UK taxpayers who make a declaration) <a href="#giftaid">Gift Aid calculator</a></label>
  <div class="row noprint bgbtns"><button type="button" class="btn p sm" data-bbid>Use in a funding bid</button><button type="button" class="btn s sm" data-bprint>${si('print')} Print or PDF</button><button type="button" class="btn s sm" data-bcopy>Copy</button></div>
  <p class="note">Ask for two quotes for anything over £100 and keep every receipt. Funders usually want to see costs, income you already have and what you’re asking them for.</p></section>`; };
const text = b => { const t = totals(b), a = evA(), L2 = (l, g) => `- ${l.label}: ${money(lineAmt(l))}${g === 'inc' ? (l.conf ? ' (confirmed)' : ' (expected)') : ''}`;
  return `Event budget${a?.name ? ': ' + a.name : ''}\n\nCosts\n${b.cost.filter(l => lineAmt(l)).map(l => L2(l, 'cost')).join('\n') || '- (no amounts yet)'}${t.cont ? `\n- Contingency ${num(b.cont)}%: ${money(t.cont)}` : ''}\nTotal costs: ${money(t.all)}\n\nIncome\n${b.inc.filter(l => lineAmt(l)).map(l => L2(l, 'inc')).join('\n') || '- (none yet)'}${t.ga ? `\n- Gift Aid on donations (estimate): ${money(t.ga)}` : ''}\nConfirmed: ${money(t.conf)} · Expected: ${money(t.exp)}\n\nAmount to raise: ${money(t.raise)}`; };
const printTable = b => { const t = totals(b), a = evA(), tr = (l, g) => `<tr><td>${esc(l.label)}</td><td>${g === 'inc' ? (l.conf ? 'Confirmed' : 'Expected') : esc(l.cat)}</td><td style="text-align:right">${money(lineAmt(l))}</td></tr>`;
  return `<div id="bgprint"><h2>Event budget${a?.name ? ': ' + esc(a.name) : ''}</h2>${a?.date ? `<p>${esc(new Date(a.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</p>` : ''}
  <table class="t3t"><tr><th>Costs</th><th></th><th style="text-align:right">£</th></tr>${b.cost.filter(l => lineAmt(l)).map(l => tr(l, 'cost')).join('')}${t.cont ? `<tr><td>Contingency</td><td>${num(b.cont)}%</td><td style="text-align:right">${money(t.cont)}</td></tr>` : ''}<tr><th colspan="2">Total costs</th><th style="text-align:right">${money(t.all)}</th></tr></table>
  <table class="t3t" style="margin-top:10px"><tr><th>Income</th><th></th><th style="text-align:right">£</th></tr>${b.inc.filter(l => lineAmt(l)).map(l => tr(l, 'inc')).join('')}${t.ga ? `<tr><td>Gift Aid on donations</td><td>Estimate</td><td style="text-align:right">${money(t.ga)}</td></tr>` : ''}<tr><th colspan="2">Confirmed income</th><th style="text-align:right">${money(t.conf)}</th></tr></table>
  <p style="font-size:18px;margin-top:12px"><b>Amount to raise: ${money(t.raise)}</b></p></div>`; };

const refresh = (full) => { const s = $('#evbudget'); if (!s) return; if (full) { s.outerHTML = budget(); return; } const b = getB(), t = totals(b), sm = $('.bgsum', s); if (sm) sm.outerHTML = sumHTML(b, t); };
const findL = (b, id) => b.cost.find(l => l.id === id) || b.inc.find(l => l.id === id);
document.addEventListener('input', e => { const i = e.target; if (!i.closest('#evbudget')) return; const b = getB();
  if (i.matches('[data-bcont]')) { b.cont = i.value; putB(b); return refresh(); }
  const r = i.closest('[data-bid]'); if (!r) return; const l = findL(b, r.dataset.bid); if (!l) return; l[i.dataset.bf] = i.value; putB(b); refresh(); });
document.addEventListener('change', e => { const i = e.target; if (!i.closest('#evbudget')) return;
  if (i.matches('[data-bkind]')) { const b = getB(); if (!b.cost.some(l => num(l.amt)) && !b.inc.some(l => lineAmt(l))) { const n = preset({ ...(evA() || {}), kind: i.value }); n.cont = b.cont; putB(n); refresh(true); } else { b.kind = i.value; putB(b); toast('Tap “Refill the usual lines” to load the lines for this type'); } }
  if (i.matches('[data-bga]')) { const b = getB(); b.ga = i.checked; putB(b); refresh(); } });
document.addEventListener('click', e => { const s = e.target.closest('#evbudget'); if (!s) return; const b = getB();
  const add = e.target.closest('[data-badd]'); if (add) { const g = add.dataset.badd; (g === 'cost' ? b.cost : b.inc).push({ id: nid(), cat: g === 'cost' ? 'Other' : 'Other', label: g === 'cost' ? 'New cost' : 'New income', amt: '', conf: false }); putB(b); refresh(true); setTimeout(() => { const r = $$('#evbudget .bgl[data-g="' + g + '"]').pop(); const inp = r && $('.bgl-l', r); if (inp) { inp.focus(); inp.select(); } }, 30); return; }
  const del = e.target.closest('[data-bdel]'); if (del) { const id = del.closest('[data-bid]').dataset.bid; b.cost = b.cost.filter(l => l.id !== id); b.inc = b.inc.filter(l => l.id !== id); putB(b); refresh(true); return; }
  const cf = e.target.closest('[data-bconf]'); if (cf) { const l = findL(b, cf.closest('[data-bid]').dataset.bid); l.conf = !l.conf; putB(b); refresh(true); return; }
  if (e.target.closest('[data-breset]')) { const has = b.cost.some(l => num(l.amt)) || b.inc.some(l => lineAmt(l)); if (has && !confirm('Replace your lines with the usual ones for this type of event? Your amounts will be cleared.')) return; const n = preset({ ...(evA() || {}), kind: $('[data-bkind]', s).value }); n.cont = b.cont; putB(n); refresh(true); toast('Usual lines filled in'); return; }
  if (e.target.closest('[data-bcopy]')) { navigator.clipboard?.writeText(text(b)).then(() => toast('Budget copied'), () => toast('Couldn’t copy')); return; }
  if (e.target.closest('[data-bprint]')) { let p = $('#bgprintwrap'); if (!p) { p = document.createElement('div'); p.id = 'bgprintwrap'; p.hidden = true; document.body.append(p); } p.innerHTML = printTable(b); const btn = document.createElement('button'); btn.dataset.t3print = 'ev_plan'; btn.dataset.t3el = 'bgprint'; btn.dataset.t3title = 'Event budget'; p.append(btn); btn.click(); return; }
  if (e.target.closest('[data-bbid]')) { const t = totals(b); store.set('evbud-bid', { name: evA()?.name || 'Your event', text: text(b), all: t.all, raise: t.raise, conf: t.conf, at: Date.now() }); location.hash = 'bidcheck'; toast('Budget added to your bid checklist'); return; } });

/* ---------- into the Event planner page and the bid checklist ---------- */
const plan0 = V.evplan; if (plan0) V.evplan = id => plan0(id).replace(/<\/div>\s*$/, budget() + '</div>');
const bid0 = V.bidcheck; if (bid0) V.bidcheck = id => { const s = store.get('evbud-bid', null); const card = s ? `<section class="dlbox bgbid"><b>Your event budget: ${esc(s.name)}</b><p>Total costs <b>${money(s.all)}</b> · confirmed income <b>${money(s.conf)}</b> · amount to raise <b>${money(s.raise)}</b>. ${s.raise ? 'Ask the funder for no more than the amount to raise, and show your other income in the bid.' : 'Your confirmed income already covers the costs, so a funder may ask why you need the grant. Explain what extra it would pay for.'}</p><div class="msg" id="bgbidtxt" hidden>${esc(s.text)}</div><div class="row"><button class="btn s sm" data-copy="#bgbidtxt">Copy the budget</button><a class="btn s sm" href="#evplan">Edit in the Event planner</a></div></section>` : `<p class="note bgbidn">Planning an event? Build the budget in the <a href="#evplan">Event planner</a> and it will appear here, ready for your bid.</p>`;
  return bid0(id).replace(/(<div class="sec-h">[\s\S]*?<\/div><\/div>)/, '$1' + card); };

/* ---------- styles ---------- */
const css = document.createElement('style'); css.textContent = `
.bgsec{margin-top:18px}.bghd h2{display:flex;align-items:center;gap:8px;margin:0}.bghd .note{margin:6px 0 10px}
.bgtype{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px}.bgtype .f{flex:1 1 220px;margin:0}
.bgsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 14px;position:sticky;top:64px;z-index:3}
.bgsum>div{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:14px;background:#fff;border:1.5px solid var(--line,#D9D8E6);box-shadow:0 4px 14px rgba(30,30,80,.06);min-width:0}
.bgsum small{font-size:11.5px;opacity:.72;line-height:1.3}.bgsum b{font-size:19px;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.bgsum .bgraise{background:#FFF4E6;border-color:#F3C58B}.bgsum .bgraise.ok{background:#E9F7EF;border-color:#9AD5B1}
.bgsec h3{margin:16px 0 8px;font-size:16px}.bglist{display:grid;gap:8px}
.bgl{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:start;padding:8px;border-radius:12px;background:#fff;border:1px solid var(--line,#D9D8E6)}
.bgl-m{min-width:0;display:flex;flex-direction:column;gap:3px}.bgl-m small{font-size:12px;opacity:.7;line-height:1.35;padding:0 2px}.bgl .in{min-height:40px;padding:8px 10px}
.bgl-a{display:flex;align-items:center;gap:4px;width:112px}.bgl-a span{font-weight:700}.bgl-a .in{width:100%;text-align:right}
.bgl-q{display:flex;align-items:center;gap:4px;width:170px}.bgl-q .in{width:100%;text-align:right}
.bgl-c{min-height:40px;padding:0 10px;border-radius:10px;border:1.5px solid var(--line,#D9D8E6);background:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap}
.bgl-c.on{background:#E9F7EF;border-color:#16865F;color:#0E6B4A}.bgl-c .si{width:14px;height:14px}
.bgl-x{width:40px;height:40px;border-radius:10px;border:0;background:transparent;font-size:22px;line-height:1;cursor:pointer;color:#8A8899}.bgl-x:hover{background:#F3F2FA;color:#C23A3A}
.bgadd{margin-top:8px}.bgcont{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0 0;font-weight:600}.bgcont span{display:flex;align-items:center;gap:4px}.bgcont .in{width:70px;text-align:right}
.bgga{display:flex;gap:8px;align-items:flex-start;margin:12px 0;font-size:14px;line-height:1.45}.bgga input{margin-top:3px;width:18px;height:18px}.bgga a{white-space:nowrap}
.bgbtns{margin-top:12px}.bgbid{margin:0 0 14px}.bgbid p{margin:6px 0 10px}.bgbidn{margin:0 0 12px}
@media(max-width:620px){.bgsum{top:56px;gap:6px;padding:6px 0;background:var(--bg,#F6F5F1)}.bgsum>div{padding:8px}.bgsum b{font-size:15.5px}.bgsum small+b+small,.bgsum b+small{display:none}.bgsum small{font-size:11px}
 .bgl{grid-template-columns:1fr auto;grid-template-areas:"m x" "a c"}.bgl-m{grid-area:m}.bgl-x{grid-area:x}.bgl-a,.bgl-q{grid-area:a;width:auto}.bgl-c{grid-area:c}.bgl[data-g="cost"] .bgl-a{grid-column:1/-1}}
@media print{.bgsum{position:static}}`;
document.head.appendChild(css);

/* ---------- gating for pages added after f2.js ---------- */
if (T.gate) Object.keys(V).forEach(T.gate);
});
