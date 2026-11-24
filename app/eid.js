/* Inspire FM · Eid. Countdown to the next Eid, your masjid's Eid salah, moon sighting, a get-ready checklist, the
   sunnahs, takbir and duas, making it special for children, Eid charity, Inspire Eid and local Eid events.
   Brought over from the Muslim Toolkit Eid app and re-themed for Inspire FM. Religious text awaiting scholars' review. */
(() => {
const X = window.IFMX; if (!X || !X.TOOLS) return;
const { $, $$, esc, store } = X;
const HP = d => { try { const p = new Intl.DateTimeFormat('en-GB-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Europe/London' }).formatToParts(d); const g = t => parseInt((p.find(x => x.type === t) || {}).value); return { d: g('day'), m: g('month'), y: g('year') }; } catch (e) { return null; } };
const day0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 12); };
const fmt = d => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
function nextEid(m, dd) { const t0 = day0(); for (let i = 0; i < 400; i++) { const d = new Date(t0.getTime() + i * 864e5), h = HP(d); if (h && h.m === m && h.d === dd) return { date: d, days: i, y: h.y }; } return null; }
const EIDS = () => { const f = nextEid(10, 1), a = nextEid(12, 10); return [Object.assign({ k: 'fitr', n: 'Eid al-Fitr', s: 'after Ramadan' }, f), Object.assign({ k: 'adha', n: 'Eid al-Adha', s: 'with Hajj and Qurbani' }, a)].filter(e => e.date).sort((x, y) => x.days - y.days); };
const REVIEW = '<span class="eid-rv">Awaiting scholars’ review</span>';
const PREP = {
  fitr: ['Pay Zakat al-Fitr before the Eid salah', 'Check your masjid’s Eid salah time and plan your route', 'Get your best clothes ready the night before', 'Gifts or Eidi ready for the children', 'Invite a neighbour, a revert or someone on their own', 'Make the most of the last nights of Ramadan'],
  adha: ['Arrange your Qurbani in good time', 'Fast the Day of Arafah if you are not on Hajj', 'Make the most of the first ten days of Dhul Hijjah', 'Check your masjid’s Eid salah time and plan your route', 'Get your best clothes ready the night before', 'Gifts or Eidi ready for the children']
};
const SUNNAH = [['Ghusl', 'Take a bath before going out for the Eid salah.'], ['Best clothes', 'Wear the best clothes you have. Men may wear perfume.'], ['Dates before Eid al-Fitr', 'Eat an odd number of dates before leaving for the Eid al-Fitr salah.'], ['Wait on Eid al-Adha', 'On Eid al-Adha, wait to eat until after the salah, ideally from your Qurbani.'], ['Takbir on the way', 'Say the takbir out loud as you walk to the salah.'], ['A different way home', 'Go to the salah one way and come back another.'], ['Greet each other', 'Say “Taqabbal Allahu minna wa minkum”: may Allah accept from us and from you.']];
const YOUNG = ['Let them help decorate the house the night before', 'An Eid treasure hunt with small gifts and notes', 'Give Eidi in envelopes they decorate themselves', 'Take them to the Eid salah and let them say the takbir with you', 'A family photo in Eid clothes, every year in the same spot', 'Let them choose a charity and give part of their Eidi', 'Invite their friends round for an Eid party or games'];
const CHARITY = [['Zakat al-Fitr', 'Due from every Muslim who can afford it, paid before the Eid al-Fitr salah so everyone can celebrate.', '#tb-zakat', 'Work it out'], ['Qurbani', 'The sacrifice for Eid al-Adha, shared with family, friends and people in need.', '#give', 'Ways to give'], ['Sadaqah on Eid', 'Visit the sick and the elderly, feed someone, or give to a local appeal.', '#give', 'Local appeals']];
const EVENTS = [['Eid community lunch', 'Open to anyone spending Eid alone', 'Example listing'], ['Eid fun day', 'Rides, food stalls and activities for families', 'Example listing']];

function render(node) {
  const E = EIDS(); let sel = store.get('eidSel', E[0] && E[0].k) || 'fitr'; if (!E.find(e => e.k === sel)) sel = E[0].k;
  const done = store.get('eidPrep', {}), follow = store.get('eidFollow', []);
  const M = (window.IFM_MOSQUES || []).filter(m => m.n).sort((a, b) => a.n < b.n ? -1 : 1);
  const e = E.find(x => x.k === sel), prepN = PREP[sel].filter((_, i) => done[sel + i]).length;
  node.innerHTML = `<div class="eid">
  <div class="eid-hero"><svg class="eid-art" viewBox="0 0 160 120" aria-hidden="true"><g stroke="#c1b18c" stroke-width="1.4" opacity=".85"><path d="M40 0v30M78 0v18M128 0v26"/></g><g fill="#c1b18c"><path d="M33 30h14l-2 14h-10z"/><path d="M71 18h14l-2 14h-10z"/><path d="M121 26h14l-2 14h-10z"/></g><g fill="#eae7d9" opacity=".9"><rect x="37" y="34" width="6" height="7" rx="1.5"/><rect x="75" y="22" width="6" height="7" rx="1.5"/><rect x="125" y="30" width="6" height="7" rx="1.5"/></g><path d="M118 62a26 26 0 1 0 28 30 21 21 0 1 1-28-30z" fill="#f6f4ef"/></svg>
    <div class="eid-sw">${E.map(x => `<button type="button" data-eid="${x.k}" aria-pressed="${x.k === sel}">${x.n}</button>`).join('')}</div>
    <div class="eid-n"><b>${e.days}</b><span>${e.days === 1 ? 'day' : 'days'} to go</span></div>
    <p class="eid-d">${esc(e.n)} ${e.y} is expected around <b>${fmt(e.date)}</b>.</p>
    <p class="eid-note">Roughly: the date depends on the moon being sighted, so it can move by a day.</p>
    <div class="eid-pg"><i style="--p:${prepN / PREP[sel].length * 100}%"></i><span>${prepN} of ${PREP[sel].length} ready</span></div></div>

  <a class="eid-ie" href="#eid"><small>Presented by Inspire FM</small><b>Inspire Eid: Luton's family Eid festival</b><span>Funfair, food stalls, stage and thousands of smiles. Stalls, sponsors and dates</span><em>Find out more</em></a>

  <h3 class="eid-h">Your masjid’s Eid salah</h3>
  <p class="eid-p">Follow your masjid to get its Eid salah times as soon as it announces them. Masjids add them in the Inspire FM back office: paste their message and it fills itself in.</p>
  <div class="eid-mq">${M.slice(0, 45).map(m => `<label class="eid-mqr"><span><b>${esc(m.n)}</b><small>${follow.includes(m.id) ? 'Following: times will appear here once announced' : esc(m.a || '')}</small></span><input type="checkbox" data-f="${m.id}" ${follow.includes(m.id) ? 'checked' : ''} aria-label="Follow ${esc(m.n)}"></label>`).join('')}</div>

  <h3 class="eid-h">How do we know it’s Eid?</h3>
  <div class="eid-card"><p>An Islamic month begins when the new crescent moon (the hilal) is seen after sunset on the 29th day. If it isn’t seen, the month finishes at 30 days.</p><p>In the UK, masjids follow different approaches: a local sighting, a sighting abroad such as in Saudi Arabia or Morocco, or calculation. That’s why Eid can fall on different days at different masjids. Follow your own masjid’s announcement, and listen to Inspire FM on the night.</p></div>

  <h3 class="eid-h">Get ready for ${esc(e.n)}</h3>
  <div class="eid-ck">${PREP[sel].map((t, i) => { const id = sel + i; return `<label><input type="checkbox" data-p="${id}" ${done[id] ? 'checked' : ''}><span>${esc(t)}</span></label>`; }).join('')}</div>

  <h3 class="eid-h">The sunnahs of Eid day ${REVIEW}</h3>
  <div class="eid-sun">${SUNNAH.filter(s => !(sel === 'fitr' && /Wait on Eid al-Adha/.test(s[0])) && !(sel === 'adha' && /Dates before/.test(s[0]))).map(([t, d]) => `<div><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</div>

  <h3 class="eid-h">Takbir &amp; duas ${REVIEW}</h3>
  <div class="eid-card eid-ar"><small>The takbir of Eid</small><p class="ar" lang="ar" dir="rtl">اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ</p>
    <p class="eid-tr">Allahu akbar, Allahu akbar, la ilaha illallah, wallahu akbar, Allahu akbar, wa lillahil hamd.</p><p class="eid-mn">Allah is the Greatest, Allah is the Greatest. There is no god but Allah. Allah is the Greatest, Allah is the Greatest, and all praise belongs to Allah.</p>
    <button type="button" class="eid-say" data-say="Allahu akbar, Allahu akbar, la ilaha illallah, wallahu akbar, Allahu akbar, wa lillahil hamd">Listen</button></div>
  <div class="eid-card eid-ar"><small>The Eid greeting</small><p class="ar" lang="ar" dir="rtl">تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ</p><p class="eid-tr">Taqabbal Allahu minna wa minkum.</p><p class="eid-mn">May Allah accept from us and from you.</p>
    <button type="button" class="eid-say" data-share-eid>Send an Eid greeting</button></div>

  <h3 class="eid-h">The blessings of Eid ${REVIEW}</h3>
  <div class="eid-card"><p>Eid is a day of thanks and joy that Allah has given the Muslims, twice a year: Eid al-Fitr after the fasts of Ramadan, and Eid al-Adha with the Hajj and the sacrifice.</p><p>It is a day to thank Allah, pray together, keep family ties, forgive, give, and make sure nobody around you is left out of the happiness.</p></div>

  <h3 class="eid-h">Make it special for young people</h3>
  <ul class="eid-ul">${YOUNG.map(t => `<li>${esc(t)}</li>`).join('')}</ul>

  <h3 class="eid-h">Eid charity</h3>
  <div class="eid-ch">${CHARITY.filter(c => sel === 'fitr' ? c[0] !== 'Qurbani' : c[0] !== 'Zakat al-Fitr').map(([t, d, h, b]) => `<a href="${h}"><b>${esc(t)}</b><p>${esc(d)}</p><em>${esc(b)} →</em></a>`).join('')}</div>

  <h3 class="eid-h">Eid events near you</h3>
  <div class="eid-ev">${EVENTS.map(([t, d, x]) => `<div><b>${esc(t)}</b><p>${esc(d)}</p><span>${esc(x)}</span></div>`).join('')}</div>
  <p class="eid-p">Masjids and local organisers add their Eid events from the Inspire FM back office. See everything else on in <a href="#whats-on">What's on</a>.</p></div>`;
  $$('[data-eid]', node).forEach(b => b.onclick = () => { store.set('eidSel', b.dataset.eid); render(node); });
  $$('[data-p]', node).forEach(c => c.onchange = () => { const d = store.get('eidPrep', {}); if (c.checked) d[c.dataset.p] = 1; else delete d[c.dataset.p]; store.set('eidPrep', d); const pg = $('.eid-pg', node); if (pg) { const n = PREP[sel].filter((_, i) => d[sel + i]).length; pg.querySelector('i').style.setProperty('--p', n / PREP[sel].length * 100 + '%'); pg.querySelector('span').textContent = `${n} of ${PREP[sel].length} ready`; } });
  $$('[data-f]', node).forEach(c => c.onchange = () => { let f = store.get('eidFollow', []); f = c.checked ? f.concat(c.dataset.f) : f.filter(x => x !== c.dataset.f); store.set('eidFollow', f); X.toast && X.toast(c.checked ? 'Following for Eid updates' : 'Unfollowed'); const sm = c.closest('label').querySelector('small'); const m = M.find(x => x.id === c.dataset.f); if (sm) sm.textContent = c.checked ? 'Following: times will appear here once announced' : (m && m.a || ''); });
  $$('[data-say]', node).forEach(b => b.onclick = () => X.speak && X.speak(b.dataset.say));
  const sg = $('[data-share-eid]', node); if (sg) sg.onclick = () => (X.share || (o => X.copy(o.text)))({ title: 'Eid Mubarak', text: 'Eid Mubarak! Taqabbal Allahu minna wa minkum: may Allah accept from us and from you.', url: X.siteUrl ? X.siteUrl('tb-eid') : location.href });
}
X.TOOLS.eid = ['Eid', null, render];
if (window.IFM_THEMES) window.IFM_THEMES.eid = { a: '#464543', a2: '#a89572', bg: '#f3f1ee' };
const css = document.createElement('style'); css.textContent = `
.eid{display:grid;gap:0;padding-bottom:12px}
.eid-hero{position:relative;overflow:hidden;border-radius:24px;padding:18px;color:#fff;background:radial-gradient(120% 90% at 100% 0%,#685c41 0%,transparent 55%),linear-gradient(160deg,#293824,#161d18);box-shadow:0 18px 34px -22px rgba(22,29,24,.9)}
.eid-art{position:absolute;right:-6px;top:-4px;width:150px;opacity:.95}
.eid-sw{position:relative;display:flex;gap:8px;margin-bottom:14px;max-width:72%}
.eid-sw button{flex:1;border:1.5px solid rgba(255,255,255,.3);background:rgba(0,0,0,.12);color:#fff;border-radius:999px;padding:8px 6px;font:inherit;font-weight:600;font-size:.8rem}
.eid-sw button[aria-pressed=true]{background:#c1b18c;border-color:#c1b18c;color:#1e1911}
.eid-n{position:relative;display:flex;align-items:baseline;gap:8px}.eid-n b{font-family:var(--display);font-size:3.6rem;line-height:1;letter-spacing:-.03em}.eid-n span{font-weight:600;color:#c1b18c}
.eid-d{position:relative;margin:8px 0 4px;font-size:.92rem;color:#dfe3dc}.eid-d b{color:#fff}
.eid-note{position:relative;margin:0;font-size:.78rem;color:#bbc2b6}
.eid-pg{position:relative;margin-top:14px;display:flex;align-items:center;gap:10px}.eid-pg i{flex:1;height:7px;border-radius:9px;background:rgba(255,255,255,.15);position:relative;overflow:hidden}.eid-pg i::after{content:"";position:absolute;inset:0 auto 0 0;width:var(--p);background:linear-gradient(90deg,#a4a3a1,#c1b18c);border-radius:9px;transition:width .4s}.eid-pg span{font-size:.76rem;font-weight:600;color:#c1b18c}
.eid-ie{display:grid;gap:3px;margin-top:12px;text-decoration:none;color:#1e1911;background:linear-gradient(120deg,#c1b18c,#a89572);border-radius:20px;padding:14px 16px;box-shadow:0 12px 24px -18px rgba(84,70,45,.9)}
.eid-ie small{font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.75}.eid-ie b{font-family:var(--display);font-size:1.08rem;line-height:1.2}.eid-ie span{font-size:.82rem;opacity:.85}.eid-ie em{font-style:normal;font-weight:600;font-size:.82rem;margin-top:4px}
.eid-h{font-family:var(--display);font-size:1.08rem;color:#293824;margin:22px 2px 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}html.dark .eid-h{color:#eceeed}
.eid-rv{font-family:inherit;font-size:.66rem;font-weight:600;background:#f0ece3;color:#584a32;border-radius:999px;padding:2px 8px}
.eid-p{margin:0 2px 8px;font-size:.86rem;color:var(--mut);line-height:1.45}.eid-p a{color:#486449;font-weight:600}
.eid-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px;margin-bottom:10px}
.eid-card p{margin:0 0 8px;font-size:.9rem;line-height:1.5}.eid-card p:last-child{margin:0}
.eid-ar small{display:block;font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#486449;margin-bottom:6px}
.eid-ar .ar{font-family:var(--ar,serif);font-size:1.45rem;line-height:1.8;text-align:right}.eid-ar .eid-tr{font-style:italic;color:var(--char)}.eid-ar .eid-mn{color:var(--mut);font-size:.84rem}
.eid-say{margin-top:4px;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:7px 14px;font:inherit;font-weight:600;font-size:.8rem}
.eid-mq{display:flex;flex-direction:column;gap:6px;max-height:300px;overflow:auto;padding-right:2px}
.tk .eid-mqr{display:flex!important;flex-direction:row!important;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px}
.eid-mqr span{flex:1;min-width:0}.eid-mqr b{display:block;font-size:.88rem}.eid-mqr small{display:block;font-size:.74rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eid-mqr input,.eid-ck input{width:22px;height:22px;accent-color:#486449;flex:none}
.eid-ck{display:flex;flex-direction:column;gap:6px}
.tk .eid-ck label{display:flex!important;flex-direction:row!important;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 12px;font-size:.9rem}
.eid-ck input:checked+span{text-decoration:line-through;color:var(--mut)}
.eid-sun{display:grid;grid-template-columns:1fr 1fr;gap:8px}.eid-sun div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px}
.eid-sun b{display:block;font-family:var(--display);font-size:.92rem;color:#486449}html.dark .eid-sun b{color:#bbbab8}.eid-sun p{margin:4px 0 0;font-size:.8rem;line-height:1.4;color:var(--char)}
.eid-ul{margin:0;padding:0 0 0 2px;list-style:none;display:flex;flex-direction:column;gap:6px}.eid-ul li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;font-size:.88rem}
.eid-ch{display:flex;flex-direction:column;gap:8px}.eid-ch a{display:block;text-decoration:none;color:#fff;background:linear-gradient(160deg,#577455,#293824);border-radius:18px;padding:14px 16px}
.eid-ch b{font-family:var(--display);font-size:1rem}.eid-ch p{margin:4px 0 6px;font-size:.84rem;color:#dfe6db}.eid-ch em{font-style:normal;font-weight:600;color:#c1b18c;font-size:.82rem}
.eid-ev{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px}.eid-ev div{background:var(--card);border:1px dashed #c2bcae;border-radius:16px;padding:12px}
.eid-ev b{display:block;font-size:.9rem}.eid-ev p{margin:4px 0 6px;font-size:.78rem;color:var(--mut)}.eid-ev span{font-size:.66rem;font-weight:600;background:#e6e3dd;color:#595345;border-radius:999px;padding:2px 8px}
.ah-eid{display:flex;align-items:center;gap:12px;margin:0 0 12px;padding:12px 14px;border-radius:20px;background:linear-gradient(120deg,#c1b18c,#a89572);color:#1e1911;text-decoration:none;box-shadow:0 10px 22px -16px rgba(84,70,45,.8)}
.ah-eid i{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.45);display:grid;place-items:center}.ah-eid i svg{width:22px;height:22px}
.ah-eid span{flex:1}.ah-eid small{display:block;font-size:.68rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;opacity:.75}.ah-eid b{font-family:var(--display);font-size:1.1rem}.ah-eid em{font-style:normal;font-weight:600;font-size:.8rem}`;
document.head.appendChild(css);
/* Toolbox tile in the Calendar group, after Ramadan */
const ram = $('[data-page=toolbox] .tbt[href="#tb-ramadan"]');
if (ram && !$('[data-page=toolbox] .tbt[href="#tb-eid"]')) { const E = EIDS()[0];
  ram.insertAdjacentHTML('afterend', `<a class="tbt" href="#tb-eid" data-kw="eid fitr adha takbir moon sighting eidi qurbani zakat al-fitr"><span class="ai"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="geid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c1b18c"/><stop offset="1" stop-color="#435435"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#geid)"/><path d="M38 14a16 16 0 1 0 12 26 13 13 0 1 1-12-26z" fill="#f6f4ef"/><path d="M22 20v6M19 23h6M46 14v4M44 16h4" stroke="#f6f4ef" stroke-width="2.4" stroke-linecap="round"/></svg></span><b>Eid</b><small>${E ? E.days + ' days to go' : 'Countdown'}</small></a>`); }
/* home: an Eid countdown card moves near the top in the 30 days before Eid (the seasonal home page) */
const homeTop = document.querySelector('.page[data-page=home] .ah-top'), E0 = EIDS()[0];
if (homeTop && E0 && E0.days <= 30 && !document.querySelector('.ah-eid')) homeTop.insertAdjacentHTML('afterend', `<a class="ah-eid" href="#tb-eid"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4a8 8 0 1 0 6 13 6.5 6.5 0 1 1-6-13z"/></svg></i><span><small>${esc(E0.n)}, roughly</small><b>${E0.days} days to go</b></span><em>Get ready →</em></a>`);
if (location.hash === '#tb-eid') dispatchEvent(new HashChangeEvent('hashchange'));
})();
