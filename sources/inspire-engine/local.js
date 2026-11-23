/* Inspire FM · Local: one place for local help, support and community in Luton. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc } = X;
const host = $('#localHub'); if (!host) return;

/* Help directory needs (same keys as help.js) */
const NEEDS_UNUSED = [['food', 'bowl', 'Food & meals', '#e0662f'], ['housing', 'home', 'Housing', '#1d72c2'], ['money', 'pound', 'Money & bills', '#1f8a4c'], ['talk', 'chat', 'Someone to talk to', '#0e8a90'], ['clothes', 'shirt', 'Clothes', '#7a3ee0'], ['baby', 'bottle', 'Baby & kids', '#e0457b'], ['refugee', 'globe', 'Asylum & refugee', '#c28a00'], ['skills', 'book', 'English, jobs & skills', '#5a4a8a']];
/* Tiles copied from the Toolbox so the icons match */
const COMM = [['#tb-jamaat', 'Live jamaat times masjid prayer'], ['#tb-jummah', 'Jummah friday masjid'], ['#tb-janazah', 'Janazah funeral death notices'], ['#tb-notices', 'Noticeboard community notices lost found events'], ['#tb-business', 'Halal business directory shops food restaurants']];
const MORE = [['#winter', 'Jummah Winter Campaign', 'Friday collections for Luton Foodbank, matched by Human Appeal', 'img:winter/img/jwa-sm.png'], ['#activities', 'Activities & clubs', 'Sport, clubs and days out, with directions', 'activities'], ['#events', 'Halal events coming up', 'Muslim talks, family shows, halal comedy & days out', 'events'], ['#deals', 'Discounts for young people', 'Travel, food, cinema, gym & student deals', 'deals'], ['#foodbank', 'Luton Foodbank', 'Get food help, give, and tips for getting through winter', 'foodbank'], ['#iam', 'Report hate & Islamophobia', 'Know your rights, report it and get support', 'iam'], ['#help', 'Find help in Luton', 'Food, clothes, money, housing, someone to talk to', 'help'], ['#volunteer', 'Volunteer in Luton', 'Charities, council & groups that need you', 'volunteer'], ['#community', "What's on", 'Classes, groups & community notices', 'community'], ['#news', 'Luton news', 'Today\'s local stories from Luton Council, The Lutonian and more', 'news'], ['#give', 'Give', 'Appeals & sadaqah you can trust', 'give'], ['#involved', 'Volunteer at Inspire FM', 'Presenting, production & events at the station', 'involved'], ['#eid', 'Inspire Eid', "Luton's family Eid festival", 'eid'], ['#contact', 'Message the studio', 'Shout-outs, stories & requests', 'contact']];
const URGENT = [['999', 'Emergency', 'Police, fire, ambulance', '999'], ['111', 'NHS 111', 'Urgent medical help', '111'], ['116 123', 'Samaritans', 'Free, 24 hours', '116123'], ['Text 85258', 'Shout', 'Free text support, 24/7', 'sms:85258']];

let n = 0;
function tile(href, kw) {
  const t = document.querySelector(`.page[data-page="toolbox"] .tbt[href="${href}"]`); if (!t) return '';
  const c = t.cloneNode(true); n++;
  $$('[id]', c).forEach(el => { const o = el.id; el.id = o + '-lc' + n; c.innerHTML = c.innerHTML.split(`url(#${o})`).join(`url(#${o}-lc${n})`); });
  $$('small[id]', c).forEach(s => s.removeAttribute('id'));
  c.dataset.kw = kw; return c.outerHTML;
}
const sym = k => `<svg aria-hidden="true"><use href="#i-${k}"/></svg>`;

host.innerHTML = `
  <div class="tb-search lc-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" id="lcQ" placeholder="What do you need? Food, housing, janazah…" aria-label="Search local help"></div>
  <a class="lc-wo" href="#updates" id="lcWo" data-kw="What's happening in Luton news announcements updates events halal talks family shows community foodbank"><div class="lc-wo-h"><span class="lc-wo-k">What's happening in Luton</span><span class="lc-wo-all">See all <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></span></div><div class="lc-wo-l" id="lcWoL"></div><span class="lc-wo-live"><i></i>Updates, events &amp; news from around Luton</span></a>
  <h3 class="tb-sec">Around Luton</h3>
  <div class="lc-list lc-cards">${MORE.map(([h, t, sub, ic]) => `<a href="${h}" class="lc-card" data-kw="${t} ${sub}"><span class="lc-ico${ic.startsWith('img:') ? ' lc-img' : ''}">${ic.startsWith('img:') ? `<img src="${ic.slice(4)}" alt="">` : window.IFM_LOCAL_IC ? window.IFM_LOCAL_IC(ic) : ''}</span><div><b>${esc(t)}</b><small>${esc(sub)}</small></div><svg class="lc-go" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></a>`).join('')}</div>
  <h3 class="tb-sec">Need help right now?</h3>
  <div class="lc-urg">${URGENT.map(([num, t, s, tel]) => `<a href="${tel.startsWith('sms') ? tel : 'tel:' + tel}" data-kw="${t} ${s} urgent emergency crisis"><b>${esc(num)}</b><span>${esc(t)}</span><small>${esc(s)}</small></a>`).join('')}</div>
  <div id="lcTbW" hidden><h3 class="tb-sec">From the Toolbox</h3><div class="tb-grid lc-tbres">${[...document.querySelectorAll('.page[data-page="toolbox"] .tbt')].map(t => tile(t.getAttribute('href'), (t.getAttribute('href') === '#tb-dress' ? 'how to dress clothes clothing modest modesty hijab abaya jilbab niqab thobe awrah cover what to wear outfit brothers sisters ' : '') + t.textContent)).join('')}</div></div>
  <p class="tb-none" id="lcNone" hidden>Nothing here matches. Try <a href="#help">Find help</a> or the Toolbox.</p>`;

/* missing symbols fall back to a dot */
$$('use', host).forEach(u => { const id = (u.getAttribute('href') || '').slice(1); if (id && !document.getElementById(id)) u.closest('svg').outerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>'; });

$$('[data-need]', host).forEach(b => b.onclick = () => {
  location.hash = '#help';
  setTimeout(() => { const btn = document.querySelector(`#hfNeeds [data-k="${b.dataset.need}"]`); if (btn && btn.getAttribute('aria-pressed') !== 'true') btn.click(); }, 120);
});
const q = $('#lcQ');
q.addEventListener('input', () => {
  const v = q.value.trim().toLowerCase(); let any = false;
  $$('[data-kw]', host).forEach(el => { const hit = !v || (el.dataset.kw + ' ' + el.textContent).toLowerCase().includes(v); el.hidden = !hit; any = any || hit; });
  $$('.tb-sec', host).forEach(h => { const box = h.nextElementSibling; const empty = !!v && !$$('[data-kw]', box).some(e => !e.hidden); h.hidden = empty; box.hidden = empty; });
  const tw = $('#lcTbW'); if (tw) { const hit = !!v && $$('[data-kw]', tw).some(e => !e.hidden); tw.hidden = !hit; any = any || hit; }
  $('#lcNone').hidden = any;
});
})();
