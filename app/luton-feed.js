/* Inspire FM · What's happening in Luton
   One feed of announcements, events, community news and station updates. Every item opens a full article
   (pictures, the details, logos of who is behind it, and buttons to the right place).
   Also builds the "Report hate & Islamophobia" page (#iam). */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, D } = X;
const G = k => (window.IFM_GFX ? window.IFM_GFX(k) : '');
const TYPES = {
  ann: ['Announcement', '#c0392b'],
  event: ['Event', '#7c3aed'],
  comm: ['Community', '#0e7490'],
  ifm: ['Inspire FM', '#6f6d68']
};
const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const today = new Date().toISOString().slice(0, 10);
const LG = {
  'human-appeal': ['img/org/human-appeal.webp', 'Human Appeal'], 'luton-council': ['img/org/luton-council.webp', 'Luton Council'],
  'uni-beds': ['img/org/uni-beds.webp', 'University of Bedfordshire'], 'beds-pcc': ['img/org/beds-pcc.webp', 'Bedfordshire Police and Crime Commissioner'],
  faces: ['img/org/faces.webp', 'FACES Luton'], 'raise-up': ['img/org/raise-up.webp', 'The Raise Up Foundation'],
  courtney: ['img/org/courtney-foundation.webp', 'The Courtney Foundation'], police: ['img/org/beds-police.webp', 'Bedfordshire Police'],
  lcm: ['img/org/lcm.webp', 'Luton Council of Mosques'], undertaker: ['img/org/muslim-undertaker.webp', 'The Muslim Undertaker'],
  foodbank: ['ngs/logos/vol/luton-foodbank-logo.webp', 'Luton Foodbank'], frasers: ['ngs/logos/frasers-plus.webp', 'Frasers Plus'],
  panto: ['ngs/logos/muslim-panto.webp', 'Muslim Panto'], skt: ['ngs/logos/skt-welfare.svg', 'SKT Welfare'],
  inspire: ['img/logo.webp', 'Inspire FM 105.1'], jwc: ['winter/img/jwa-sm.png', 'Jummah Winter Campaign']
};
const jg = () => { try { return (window.JWC_LIVE && window.JWC_LIVE.settings.jgUrl) || (D.appeal && D.appeal.url); } catch (e) { return D.appeal && D.appeal.url; } };
const maps = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);

/* ---------- the stories ---------- */
function stories() {
  const F = [];
  F.push({
    id: 'winter', k: 'ann', t: 'Jummah Winter Campaign: collections every Friday', when: 'Every Friday until 25 December', gfx: 'appeal', logos: ['jwc', 'human-appeal', 'foodbank', 'inspire'],
    sum: 'Buckets go round at Jummah in masjids across Luton every Friday until Christmas, for Luton Foodbank. Human Appeal matches every pound.',
    body: [['p', 'Every Friday this winter, masjids across Luton are holding bucket collections at Jummah for Luton Foodbank. Inspire FM runs the campaign with the masjids, and Human Appeal is matching everything that is given, so every pound becomes two.'],
      ['stats', [['£20', 'feeds one person for three days'], ['£70', 'a full family food parcel'], ['×2', 'matched by Human Appeal']]],
      ['h', 'How it works'], ['list', ['Each masjid is booked in for a Friday between 9 October and 25 December.', 'Volunteers hold buckets at the doors after Jummah.', 'Every penny goes to Luton Foodbank, and Human Appeal doubles it.', 'Can\'t make it on a Friday? You can give online at any time.']],
      ['h', 'Why it matters'], ['p', 'Winter is the hardest time of year for many families in Luton, with heating bills on top of food. Luton Foodbank works with more than 100 local agencies to get emergency food to people who need it, and the Jummah collections keep the shelves stocked through the coldest months.']],
    links: [['Find your masjid\'s Friday', '#winter', 1], ['Give online', jg()], ['About Luton Foodbank', '#foodbank']]
  });
  F.push({
    id: 'iam', k: 'ann', t: 'Islamophobia Awareness Month: Don\'t Let It Slide', when: 'November 2026', gfx: 'iam', logos: ['luton-council', 'lcm', 'uni-beds', 'beds-pcc'],
    sum: 'This year\'s theme asks all of us not to let anti-Muslim hate slide. What\'s happening in Luton, the latest figures, and how to report it.',
    body: [['p', 'November is Islamophobia Awareness Month. The 2026 theme is "Don\'t Let It Slide": recognising Islamophobia whenever it happens and dealing with it, from challenging stereotypes and speaking out to standing with people who are targeted.'],
      ['h', 'In Luton this month'], ['p', 'Luton Council, the Luton Council of Mosques, the University of Bedfordshire and the Police and Crime Commissioner are holding a free event on Friday 20 November at the University of Bedfordshire\'s Luton campus. Speakers will discuss the findings of the "Everybody Knows" report, with workshops on how communities, people and organisations can work together to challenge Islamophobia.'],
      ['h', 'The "Everybody Knows" report'], ['p', '"Everybody Knows: Islamophobia, Safety and Belonging in Our Town" was published in July 2026 by FACES Luton, The Raise Up Foundation and The Courtney Foundation. More than two-thirds of the Luton Muslims who took part said they had experienced or witnessed anti-Muslim hate in the previous six months. The Police and Crime Commissioner called it a wake-up call for every public agency, business and person in the town.'],
      ['stats', [['2 in 3', 'Luton Muslims surveyed saw or faced anti-Muslim hate in six months'], ['4,478', 'anti-Muslim hate crimes recorded by police in the year to March 2025'], ['45%', 'of religious hate crimes in England and Wales targeted Muslims']]],
      ['p', 'Across England and Wales, police recorded 4,478 anti-Muslim hate crimes in the year to March 2025, around a fifth more than the year before. Muslims were the target in nearly half of all religious hate crimes. Many incidents are never reported, which is why every report counts.'],
      ['h', 'If it happens to you or someone near you'], ['list', ['In an emergency, or if you are in danger, call 999.', 'Report it to Bedfordshire Police on 101, or online through True Vision, even if it feels small.', 'Prefer not to go to the police? Report it to Stop Hate UK or Tell MAMA, who can support you.', 'Write down what happened, when and where, and keep screenshots of anything online.']]],
    links: [['Report hate & get support', '#iam', 1], ['Book the free Luton event', 'https://tinyurl.com/IAMLuton'], ['Luton Council: the event', 'https://www.luton.gov.uk/news/2026/luton-marks-islamophobia-awareness-month']],
    src: [['Luton Council, Nov 2026', 'https://www.luton.gov.uk/news/2026/luton-marks-islamophobia-awareness-month'], ['Bedfordshire PCC statement', 'https://www.bedfordshire.pcc.police.uk/news/2026/everybody-knows-islamophobia-safety-and-belonging-in-our-town-statement-of-support/'], ['Home Office hate crime figures', 'https://www.gov.uk/government/statistics/hate-crime-england-and-wales-year-ending-march-2025/hate-crime-england-and-wales-year-ending-march-2025']]
  });
  F.push({
    id: 'bombay', k: 'comm', t: 'Bombay Pizza: feeding Luton together', when: '14 and 15 November 2026', img: 'ngs/media/foodbank/news-bombay.webp', logos: ['foodbank'],
    sum: 'For its launch weekend on Hitchin Road, Bombay Pizza gave 1 pizza to Luton Foodbank for every 4 sold, with over 100 guaranteed.',
    body: [['p', 'To celebrate opening its new Luton branch on Hitchin Road, Bombay Pizza teamed up with Luton Foodbank for its launch weekend on 14 and 15 November.'],
      ['stats', [['4 : 1', 'for every 4 pizzas sold, 1 donated'], ['100+', 'pizzas guaranteed for the foodbank']]],
      ['p', 'Every fourth pizza went to the foodbank, with more than 100 pizzas guaranteed whatever the weekend\'s sales, so families using the foodbank could have a hot meal as well as their food parcel.'],
      ['quote', 'We are absolutely delighted to partner with Bombay Pizza.', 'Salma Khan, CEO, Luton Foodbank'],
      ['p', 'Local businesses can do the same: a collection point in store, a launch-day pledge or a staff food drive all make a real difference over winter.']],
    links: [['Luton Foodbank', '#foodbank', 1], ['Give money online', 'https://lutonfoodbank.org.uk/give-foodmoney/give-money/'], ['Bombay Pizza on the map', maps('Bombay Pizza Hitchin Road Luton')]]
  });
  F.push({
    id: 'overcome', k: 'comm', t: '£726.39 raised at We Shall Overcome Luton', when: 'November 2026', img: 'ngs/media/foodbank/news-overcome.webp', logos: ['foodbank'],
    sum: 'A night of music at The George II, with Community Events Music Management and the National Education Union, raised £726.39 for Luton Foodbank.',
    body: [['p', 'Thank you to everyone who came, donated and performed at We Shall Overcome Luton at The George II.'],
      ['stats', [['£726.39', 'raised for Luton Foodbank']]],
      ['p', 'The night was put on with Community Events Music Management and the National Education Union. Every penny raised goes to emergency food for people in crisis across Luton.'],
      ['p', 'We Shall Overcome is a grassroots movement of music and arts events that raise money and food for local anti-poverty causes. If you run events in Luton, the foodbank would love to hear from you.']],
    links: [['Luton Foodbank', '#foodbank', 1], ['Give money online', 'https://lutonfoodbank.org.uk/give-foodmoney/give-money/'], ['Email the foodbank', 'mailto:info@lutonfoodbank.org.uk']]
  });
  F.push({
    id: 'frasers', k: 'comm', t: 'Donate food at Frasers Plus Luton', when: 'November 2026', img: 'ngs/media/foodbank/news-fraserplus.webp', logos: ['frasers', 'foodbank'],
    sum: 'Frasers Plus Luton now has a Luton Foodbank donation point by TSB. Add one extra item to your shop and drop it in.',
    body: [['p', 'Frasers Plus Luton is supporting Luton Foodbank with a donation point by TSB. If you can, pick up one extra item on your weekly shop and drop it in.'],
      ['h', 'Most needed right now'], ['chips', ['UHT milk', 'Rice (500g)', 'Tinned meat', 'Tinned vegetables', 'Tinned fruit', 'Fruit juice', 'Breakfast cereal', 'Instant noodles', 'Soup', 'Baked beans', 'Tinned tomatoes', 'Tinned fish', 'Pasta sauce', 'Tea bags', 'Sugar (500g)']],
      ['h', 'Other drop-off points in Luton'], ['points', [
        ['ngs/logos/frasers-plus.webp', 'Frasers Plus Luton', 'Donation point by TSB', maps('Frasers Plus Luton')],
        ['ngs/logos/discover-islam.svg', 'Discover Islam', '37C Upper George Street, LU1 2RD · Mon to Sat, 10am to 5pm', maps('Discover Islam 37C Upper George Street Luton LU1 2RD')],
        ['ngs/logos/nationwide.svg', 'Nationwide', '77/79 George Street, LU1 2AP', maps('Nationwide 77 George Street Luton LU1 2AP')],
        ['ngs/logos/coop.svg', 'Co-op Birdsfoot Lane', '259 Birdsfoot Lane, LU3 2HX', maps('Co-op 259 Birdsfoot Lane Luton LU3 2HX')],
        ['ngs/logos/coop.svg', 'Co-op Hitchin Road', '628 Hitchin Road, Stopsley, LU2 7UG', maps('Co-op 628 Hitchin Road Stopsley Luton LU2 7UG')],
        ['ngs/logos/sainsburys.svg', "Sainsbury's", 'Dunstable Road', maps("Sainsbury's Dunstable Road Luton")]]]],
    links: [['Full most-needed list', 'https://lutonfoodbank.org.uk/give-foodmoney/give-food/', 1], ['Luton Foodbank', '#foodbank']]
  });
  F.push({
    id: 'trustees', k: 'comm', t: 'Thank you to Luton Foodbank\'s trustees', when: 'Trustees\' Week, November 2026', img: 'ngs/media/foodbank/news-trustees.webp', fit: 1, logos: ['foodbank'],
    sum: 'This Trustees\' Week, Luton Foodbank thanked the 13 volunteers who govern the charity behind the scenes.',
    body: [['p', 'This Trustees\' Week, Luton Foodbank celebrated its trustees. They give their time to run the charity behind the scenes, so the frontline team can focus on making sure no-one in Luton goes hungry.'],
      ['faces', 13],
      ['p', 'Trustees are volunteers. They look after the foodbank\'s money, plans and safeguarding, and make sure it is run well for the people who need it.'],
      ['p', 'Interested in becoming a trustee or volunteering? Get in touch with the foodbank.']],
    links: [['Volunteer with the foodbank', 'mailto:info@lutonfoodbank.org.uk?subject=Volunteering', 1], ['Luton Foodbank', '#foodbank']]
  });
  /* events from Inspire FM's halal events list, plus one more from the NGS listings */
  const O = window.IFM_OUT, HE = ((O && O.HE) || []).slice();
  HE.push({ t: 'A Night for Palestine: Qawwali & Comedy', k: 'fun', s: '2026-11-28', e: '2026-11-28', when: 'Sat 28 November', where: 'Venue Central, 196A Leagrave Road', pc: 'LU3 1RH', cost: 'Paid', p: 'VIP front row £30, table of 10 £230', ages: 'Adults and families', d: 'SKT Welfare fundraiser for Gaza: live qawwali from Zaheer Abbas, comedy and hosting from Salman Malik, and a three-course meal.', url: 'https://www.tickettailor.com/events/sktwelfare/2432355', by: 'SKT Welfare', area: 'luton' });
  const kindOf = e => /quran|recitation/i.test(e.t) ? 'quran' : /islamophobia/i.test(e.t) ? 'iam' : /panto/i.test(e.t) ? 'panto' : /comedy takeover/i.test(e.t) ? 'comedy' : /qawwali/i.test(e.t) ? 'qawwali' : /undertaker|night alone/i.test(e.t) ? 'night' : /conference/i.test(e.t) ? 'conference' : e.k === 'fun' ? 'comedy' : 'talk';
  const logosOf = e => /islamophobia/i.test(e.t) ? ['luton-council', 'lcm', 'uni-beds', 'beds-pcc'] : /undertaker/i.test(e.t) ? ['undertaker'] : /panto/i.test(e.t) ? ['panto'] : /comedy takeover/i.test(e.t) ? ['human-appeal'] : /palestine/i.test(e.t) ? ['skt'] : [];
  HE.filter(e => (e.e || e.s) >= today).sort((a, b) => a.s.localeCompare(b.s)).forEach((e, i) => {
    const d = new Date(e.s + 'T12:00');
    const extra = /quran|recitation/i.test(e.t) ? [['p', 'Young people and adults recite before judges, with prizes across age groups and levels. It is a chance to hear some beautiful recitation and to encourage children who are learning.'], ['p', 'Islamic Centre Milton Keynes is about 30 minutes from Luton by car. Check the centre\'s website or social media for the start time and how to enter.']]
      : /comedy takeover/i.test(e.t) ? [['p', 'Tickets usually sell out, so book early. Under 16s must come with an adult.']]
      : /panto/i.test(e.t) ? [['p', 'There are several shows on the day. Book online and pick the time that suits your family.']] : [];
    F.push({
      id: 'ev' + i, k: 'event', t: e.t, when: e.when, where: e.where, cost: e.p, date: [d.getDate(), M[d.getMonth()]], gfx: kindOf(e), logos: logosOf(e),
      sum: e.d,
      body: [['facts', [['When', e.when], ['Where', e.where + (e.pc && e.pc !== e.where ? ', ' + e.pc : '')], ['Price', e.p || e.cost || 'See website'], ['Who for', e.ages || 'Everyone'], ['Run by', /undertaker/i.test(e.t) ? 'The Muslim Undertaker (Ahmed Hraichie)' : e.by]]], ['p', e.d]].concat(extra),
      links: [['Tickets & details', e.url, 1], ['Directions', maps(e.where + ' ' + (e.pc || ''))], ['All halal events', '#events']]
    });
  });
  /* station */
  const pods = (D.pods || []).slice().sort((a, b) => (b.ds || '').localeCompare(a.ds || '')).slice(0, 2);
  pods.forEach((p, i) => { const s = D.shows[p.s] || {}; const g = [].concat(p.gu || []);
    F.push({ id: 'pod' + i, k: 'ifm', t: 'New episode: ' + p.t, when: p.date || '', img: s.img, logos: ['inspire'], sum: (s.n || 'Podcast') + (p.len ? ' · ' + p.len : '') + '. ' + (p.d || ''),
      body: [['facts', [['Show', s.n || 'Podcast'], ['Host', (s.p || []).join(', ')], ['Guests', g.join(', ')], ['Length', p.len]].filter(x => x[1])], ['p', p.d || ''], ['p', s.d || '']],
      links: [['Listen now', '#listen', 1, 'pods'], ['All podcasts', '#listen', 0, 'pods']] }); });
  /* mix the types so the list reads like a feed */
  const by = {}; F.forEach(x => (by[x.k] = by[x.k] || []).push(x));
  const order = ['ann', 'event', 'comm', 'ifm'], out = [];
  for (let i = 0; out.length < F.length; i++) order.forEach(k => { if (by[k] && by[k][i]) out.push(by[k][i]); });
  return out;
}

/* ---------- pieces ---------- */
const pic = (x, cls) => x.img ? `<span class="${cls}${x.fit ? ' lf-fit' : ''}" style="background-image:url('${x.img}')"></span>` : `<span class="${cls} lf-g">${G(x.gfx)}</span>`;
const chip = x => `<span class="lf-chip" style="--c:${TYPES[x.k][1]}">${TYPES[x.k][0]}</span>`;
const logoRow = x => (x.logos || []).filter(k => LG[k]).map(k => `<span class="lf-lg" title="${esc(LG[k][1])}"><img src="${LG[k][0]}" alt="${esc(LG[k][1])}" loading="lazy"></span>`).join('');
const isExt = h => /^(https?:|mailto:|tel:)/.test(h || '');
const btn = ([label, href, primary, tab]) => href ? `<a class="lf-btn${primary ? ' on' : ''}" href="${esc(href)}"${isExt(href) ? ' target="_blank" rel="noopener"' : ' data-close'}${tab ? ` data-tab="${tab}"` : ''}>${esc(label)}${isExt(href) ? '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'}</a>` : '';
const block = ([t, a, b]) => {
  if (t === 'p') return `<p>${esc(a)}</p>`;
  if (t === 'h') return `<h3>${esc(a)}</h3>`;
  if (t === 'list') return `<ul class="lf-ul">${a.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
  if (t === 'chips') return `<div class="lf-chips">${a.map(s => `<span>${esc(s)}</span>`).join('')}</div>`;
  if (t === 'quote') return `<blockquote class="lf-q">“${esc(a)}”<cite>${esc(b)}</cite></blockquote>`;
  if (t === 'stats') return `<div class="lf-stats">${a.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}</div>`;
  if (t === 'facts') return `<dl class="lf-facts">${a.filter(r => r[1]).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  if (t === 'faces') return `<div class="lf-faces">${Array.from({ length: a }, (_, i) => `<img src="ngs/media/foodbank/trustee-${i + 1}.webp" alt="Luton Foodbank trustee" loading="lazy">`).join('')}</div>`;
  if (t === 'points') return `<div class="lf-pts">${a.map(([lg, n, ad, u]) => `<a href="${u}" target="_blank" rel="noopener"><span><img src="${lg}" alt=""></span><div><b>${esc(n)}</b><small>${esc(ad)}</small></div><em>Directions</em></a>`).join('')}</div>`;
  return '';
};

/* ---------- article view ---------- */
let FEED = [];
const ov = document.createElement('div'); ov.className = 'lf-ov'; ov.hidden = true; document.body.appendChild(ov);
function openStory(id) {
  const x = FEED.find(f => f.id === id); if (!x) return;
  ov.innerHTML = `<div class="lf-art" role="dialog" aria-modal="true" aria-label="${esc(x.t)}">
    <div class="lf-top"><button type="button" class="lf-back" data-close aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span>What's happening</span><button type="button" class="lf-share" aria-label="Share"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></div>
    <div class="lf-hero">${pic(x, 'lf-hi')}${x.date ? `<span class="lf-date"><b>${x.date[0]}</b>${x.date[1]}</span>` : ''}</div>
    <div class="lf-body">${chip(x)}<h2>${esc(x.t)}</h2><div class="lf-meta">${[x.when, x.where].filter(Boolean).map(esc).join(' · ')}</div>
      ${x.logos && x.logos.length ? `<div class="lf-lgs">${logoRow(x)}</div>` : ''}
      ${x.body.map(block).join('')}
      <div class="lf-btns">${(x.links || []).map(btn).join('')}</div>
      ${x.src ? `<div class="lf-src"><b>Sources</b>${x.src.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join('')}</div>` : ''}</div></div>`;
  lfY = scrollY; ov.hidden = false; document.documentElement.classList.add('lf-open'); ov.scrollTop = 0;
  $('.lf-share', ov).onclick = () => { const d = { title: x.t, text: x.sum, url: location.href.split('#')[0] + '#updates' }; X.share(d); };
  history.pushState({ lf: 1 }, '');
}
let lfY = 0; function closeStory(noBack) { if (ov.hidden) return; ov.hidden = true; document.documentElement.classList.remove('lf-open'); const y = lfY; window.scrollTo({ top: y, behavior: 'instant' }); requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' })); if (!noBack && history.state && history.state.lf) history.back(); }
ov.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (!c) return; if (c.tagName === 'A') { closeStory(true); if (history.state && history.state.lf) { const h = c.getAttribute('href'); e.preventDefault(); history.replaceState(null, ''); location.hash = h; } } else closeStory(); });
addEventListener('popstate', () => closeStory(true));
document.addEventListener('click', e => { const a = e.target.closest('[data-story]'); if (!a) return; e.preventDefault(); openStory(a.dataset.story); });

/* ---------- render: Local tile + full page ---------- */
function render() {
  FEED = stories();
  const L = $('#lcWoL');
  if (L) {
    const row = x => `<div class="lf-row">${pic(x, 'lf-im')}<span class="lf-tx">${chip(x)}<b>${esc(x.t)}</b></span></div>`;
    const rows = FEED.slice(0, 10).map(row).join('');
    L.innerHTML = `<div class="lf-roll" style="--n:${Math.min(10, FEED.length)}">${rows}${rows}</div>`;
  }
  const P = $('#updList');
  if (P) P.innerHTML = FEED.map(x => `<a class="lf-card" href="#updates" data-story="${x.id}" data-k="${x.k}">${pic(x, 'lf-im')}${x.date ? `<span class="lf-date"><b>${x.date[0]}</b>${x.date[1]}</span>` : ''}<span class="lf-bd">${chip(x)}<b>${esc(x.t)}</b><p>${esc(x.sum || '')}</p><small><span>${[x.when, x.where].filter(Boolean).map(esc).join(' · ')}</span><em>Read more →</em></small>${x.logos && x.logos.length ? `<span class="lf-lgs sm">${logoRow(x)}</span>` : ''}</span></a>`).join('');
}
const chips = $('#updChips');
if (chips) {
  chips.innerHTML = `<button type="button" class="on" data-k="">All</button>` + [['ann', 'Announcements'], ['event', 'Events'], ['comm', 'Community'], ['ifm', 'Inspire FM']].map(([k, n]) => `<button type="button" data-k="${k}">${n}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', chips).forEach(x => x.classList.toggle('on', x === b)); const k = b.dataset.k; $$('#updList .lf-card').forEach(c => { c.hidden = !!k && c.dataset.k !== k; }); });
}

/* ---------- Report hate & Islamophobia page ---------- */
function iamPage() {
  const P = $('#iamPage'); if (!P) return;
  const ev = (((window.IFM_OUT || {}).HE) || []).find(e => /islamophobia/i.test(e.t));
  P.innerHTML = `
  <div class="iam-hero">${G('iam')}<div><span>Islamophobia Awareness Month · November 2026</span><h2>Don't let it slide.</h2><p>Anti-Muslim hate is real in Luton. Here is how to report it, where to get support, and what is happening in the town.</p></div></div>
  <a class="iam-sos" href="tel:999"><b>In danger right now?</b><span>Call 999</span></a>
  <h3 class="iam-h">Report it</h3>
  <div class="iam-grid">
    <a href="tel:101"><img src="img/org/beds-police.webp" alt=""><b>Bedfordshire Police</b><small>Call 101 any time if it is not an emergency, or report online through True Vision, the police's hate crime site.</small><em>Call 101</em></a><a href="https://www.report-it.org.uk/" target="_blank" rel="noopener"><span class="iam-ic" style="--c:#1d4f7a">${(window.IFM_IC || (() => ''))('shield')}</span><b>True Vision</b><small>The official police website for reporting hate crime online, in any part of England.</small><em>Report online</em></a>
    <a href="https://www.stophateuk.org/report-here/" target="_blank" rel="noopener"><span class="iam-ic" style="--c:#e0457b">${(window.IFM_IC || (() => ''))('chat')}</span><b>Stop Hate UK</b><small>Bedfordshire's independent hate reporting service. Confidential support, 24 hours.</small><em>Report to Stop Hate UK</em></a>
    <a href="https://tellmamauk.org/" target="_blank" rel="noopener"><span class="iam-ic" style="--c:#7a2e8e">${(window.IFM_IC || (() => ''))('heart')}</span><b>Tell MAMA</b><small>Records anti-Muslim hate and supports victims. Free helpline 0800 456 1226, WhatsApp 0734 184 6086.</small><em>Report to Tell MAMA</em></a>
    <a href="mailto:communitysafety@luton.gov.uk?subject=Reporting%20a%20hate%20incident"><img src="img/org/luton-council.webp" alt=""><b>Luton Council</b><small>Community Safety team: communitysafety@luton.gov.uk</small><em>Email the council</em></a>
  </div>
  <h3 class="iam-h">What to do</h3>
  <ol class="iam-steps"><li><b>Get safe.</b> Move away from the person and go somewhere with other people around.</li><li><b>Write it down.</b> What was said or done, the time, the place, and what the person looked like.</li><li><b>Keep the evidence.</b> Photos, videos, screenshots and links for anything online. Don't reply to online abuse.</li><li><b>Report it.</b> Even if it seems small. Reports show where hate is happening and help keep others safe.</li><li><b>Look after yourself.</b> Talk to someone you trust. Stop Hate UK and Tell MAMA can support you.</li></ol>
  <h3 class="iam-h">If you see it happen</h3>
  <p class="iam-p">Only step in if it is safe. Stand with the person being targeted, ask if they are OK, and offer to be a witness. Filming from a safe distance can help the police.</p>
  ${ev ? `<h3 class="iam-h">In Luton this month</h3><a class="iam-ev" href="#updates" data-story="iam"><span class="iam-evd"><b>20</b>Nov</span><div><b>${esc(ev.t)}</b><small>${esc(ev.where)} · Free</small><p>Speakers, the "Everybody Knows" report and workshops on challenging Islamophobia.</p><span class="iam-lgs"><img src="img/org/luton-council.webp" alt="Luton Council"><img src="img/org/lcm.webp" alt="Luton Council of Mosques"><img src="img/org/uni-beds.webp" alt="University of Bedfordshire"><img src="img/org/beds-pcc.webp" alt="Bedfordshire PCC"></span></div></a>` : ''}
  <h3 class="iam-h">The facts</h3>
  <div class="lf-stats iam-stats"><div><b>2 in 3</b><span>Luton Muslims surveyed saw or faced anti-Muslim hate in six months ("Everybody Knows", 2026)</span></div><div><b>4,478</b><span>anti-Muslim hate crimes recorded by police in England and Wales, year to March 2025</span></div><div><b>45%</b><span>of all religious hate crimes targeted Muslims</span></div></div>
  <div class="iam-rep"><b>"Everybody Knows: Islamophobia, Safety and Belonging in Our Town"</b><span>A 2026 report on Muslims' experiences in Luton by:</span><div><img src="img/org/faces.webp" alt="FACES Luton"><img src="img/org/raise-up.webp" alt="The Raise Up Foundation"><img src="img/org/courtney-foundation.webp" alt="The Courtney Foundation"></div></div>
  <div class="lf-src"><b>Sources</b><a href="https://www.luton.gov.uk/news/2026/luton-marks-islamophobia-awareness-month" target="_blank" rel="noopener">Luton Council, Nov 2026</a><a href="https://www.bedfordshire.pcc.police.uk/news/2026/everybody-knows-islamophobia-safety-and-belonging-in-our-town-statement-of-support/" target="_blank" rel="noopener">Bedfordshire PCC, July 2026</a><a href="https://www.gov.uk/government/statistics/hate-crime-england-and-wales-year-ending-march-2025/hate-crime-england-and-wales-year-ending-march-2025" target="_blank" rel="noopener">Home Office hate crime statistics</a></div>`;
}
render(); iamPage();
})();
