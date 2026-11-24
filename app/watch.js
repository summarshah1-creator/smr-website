/* Inspire FM · Watch free (Islamic kids & learning channels, played through YouTube's privacy-enhanced player)
   and the app-style home screen for phones. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, I, store, toast, copy, today, hm, hijri, greg, dur, D } = X;

/* Channels: official YouTube channels, embedded with YouTube's own player (uploads playlist = "UU" + channel id). */
const CH = [
  { k: 'eternity', n: 'Towards Eternity', by: 'Towards Eternity', c: 'dawah', yt: '', handle: '@TowardsEternity', age: 'Teens & adults', d: 'Revert stories and Islam explained clearly, in more than 10 languages.', g: ['#79a4b7', '#2b424f'], m: 'moon',
    v: [['XCN6O7QibMM', 'Portuguese church student becomes Muslim'], ['3W0973c6Z_s', '"I cried when the adhan was called": a revert story']] },
  { k: 'yqrem', n: 'Daily Reminders', by: 'Yaqeen Institute', c: 'dawah', yt: '', handle: '@YaqeenInstitute', age: 'Teens & adults', d: 'Short, sincere reminders and lectures on faith, worship and doubt.', g: ['#c0b389', '#563e31'], m: 'heart',
    v: [['dXyKSnpzz8E', 'The Days of Allah'], ['d-jT7hkoHtM', 'Loving the world too much'], ['JH-9I4aiDgk', 'Allah provides for you'], ['fObB8rOAKN0', 'The scholar who pretended he could not hear'], ['aet-5Qurdog', 'To kill or be killed by a prophet'], ['_C5ox2zZl0U', 'Atheism: doubting your doubts'], ['5OpWnUeYTy4', 'Freeing yourself from other than Allah'], ['Tn0cK99H50Y', 'Khatm al-Quran du\'a 2026']] },
  { k: 'hijab', n: 'Mohammed Hijab', by: 'Mohammed Hijab', c: 'dawah', yt: '', handle: '@MohammedHijab', age: 'Adults', d: 'Debates and talks making the case for Islam.', g: ['#a3a3a3', '#171717'], m: 'mic',
    v: [['3k6MBedWTww', 'Full debate: Tawheed vs Trinity']] },
  { k: 'omarhana', n: 'Omar & Hana', by: 'Digital Durian', c: 'kids', yt: 'UC178EmfQAV3OT-UpuO6WUMg', age: 'Ages 2–8', d: 'Two young siblings learn manners, prayer and family values through short stories and catchy songs.', g: ['#b19e6e', '#a06f56'], m: 'song',
    v: [['XBCQK9dTGRI', '60-minute compilation'], ['-mzf85eISp8', 'Fasting in Ramadan'], ['v7jwUpVxo04', 'Picking up litter (Season 2, Ep 1)'], ['DHVPFNWrLwE', 'Omar & Hana story'], ['pXgICSXhu7I', '30-minute compilation'], ['Y1eZ_JydvZE', 'Learning about Islam'], ['JxN5C0_3384', 'Play nicely together']] },
  { k: 'zaky', n: 'Zaky & Friends', by: 'One4Kids', c: 'kids', yt: 'UC5vfWTTPnKdFp-8s0KbqJhw', age: 'Ages 2–10', d: 'Zaky the bear and friends teach duas, salah and good manners.', g: ['#bab0d5', '#665186'], m: 'star',
    v: [['0HVH-KWSC8c', 'Zaky & Friends 40-minute compilation'], ['65Ea4kZSOjw', 'Zaky\'s Football Match'], ['br4tKFjTcLk', 'Learn Surah Al-Ma\'un with Zaky'], ['Et_qrn15zFo', 'A Day with Zaky & Friends: 5 episodes'], ['llz1efYNTxs', 'Being dutiful and kind to our parents'], ['nwj-s6CjtO4', 'Remembering Allah with Zaky & Friends'], ['-yrKea2ZtOw', 'Guess the Animal: a Zaky game']] },
  { k: 'iqra', n: 'IQRA Cartoon', by: 'IQRA Cartoon', c: 'quran', yt: 'UCSL4Dn-FQlvHZiSKipQZMqw', age: 'Ages 4–12', d: 'A non-profit studio animating the stories of the prophets from the Qur\'an and hadith, made simple for children.', g: ['#67a08b', '#234239'], m: 'book',
    v: [['W45DrRGECQE', 'Prophet Ibrahim (AS)'], ['_RUNc_lZBVA', 'Prophet Salih (AS)'], ['o4tcfC9LArs', 'Prophet Hud (AS)'], ['lNP_QsSQkoA', 'Prophet Muhammad ﷺ: Childhood'], ['cKAjkIkvwqI', 'After the Prophet\'s last battle (Ep 52)'], ['iGVnSOXG4cI', 'Final episode: Last Breath']] },
  { k: 'sotp', n: 'Stories of the Prophets', by: 'Quran Stories', c: 'quran', yt: 'UCvWyP-vFhlS1-XENpD6w68A', age: 'All ages', d: 'Animated stories of the prophets from the Qur\'an, in English.', g: ['#94aac6', '#414b67'], m: 'moon',
    v: [['XyMVBBH2-Oc', 'Prophet stories in English']] },
  { k: 'heroes', n: 'Muslim Heroes & Inventors', by: 'IQRA Cartoon', c: 'learn', yt: 'UCg9GieceMt5qeEJ6QLR3rFQ', age: 'Ages 7+', d: 'Animated history of the Muslim scholars and inventors who shaped our world.', g: ['#629f97', '#263b3a'], m: 'bulb',
    v: [['-fD_sIUUaV0', 'The first university: Fatima al-Fihri'], ['wNPRIMoRBqA', 'The father of chemistry: Jabir ibn Hayyan'], ['gnVvp8V32ts', 'Camera obscura'], ['PBXzJ9WDuDk', 'The first galaxy: al-Sufi'], ['Lgb8k4S9txI', 'The first person to fly'], ['fFezw1fx8Hk', 'The soap bar: al-Razi'], ['ueQBoijrOEs', 'Ice cream cones'], ['RPelA5dJWfM', 'The fountain pen']] },
  { k: 'kalam', n: 'Kalam Kids', by: 'Ms. Abrar & Ms. Rinad', c: 'kids', yt: 'UCdr_45nR1o2P4ycckLh1xOQ', age: 'Toddlers', d: 'Gentle sing-along videos that teach Arabic and Islam to babies and toddlers.', g: ['#dec3d2', '#894d66'], m: 'abc',
    v: [['KTQq_cGLnek', 'Manners in Islam (in Arabic)'], ['84bYbtb9YC4', 'Ramadan learning for kids']] },
  { k: 'yaqeen', n: 'The Firsts', by: 'Yaqeen Institute · Dr. Omar Suleiman', c: 'talks', yt: 'UC3vHW2h22WE-pNi5WJtRIjg', age: 'Teens & adults', d: 'The lives of the Companions of the Prophet ﷺ, one episode each.', g: ['#a0a5ac', '#181b21'], m: 'mic',
    v: [['ywfl3oZ5WWU', 'Mu\'adh ibn Jabal (ra): Most knowledgeable & beloved'], ['JuMj14TSrdU', 'Abdullah ibn Salam (ra): The righteous rabbi'], ['QrrIdK5AjgI', 'Umm Ayman (ra): The woman who never stopped caring'], ['gVobZS1AR_k', 'Julaybib (ra): The most beautiful story'], ['_UkePBl_LEw', 'Safina (ra): He spoke to a lion'], ['-rHYYdac6Ks', 'Umm Mahjan (ra): The woman who cleaned the masjid'], ['Uk8xOtLBPwc', 'Juwayriya bint al-Harith (ra)']] },
  { k: 'bilal', n: 'Bilal Assad', by: 'Ustadh Bilal Assad', c: 'talks', yt: '', handle: '@BilalAssad', age: 'Teens & adults', d: 'Heartfelt talks on faith, family and character.', g: ['#dec3c3', '#603c3c'], m: 'mic',
    v: [['rjmwmbDSZEs', 'Don\'t waste your life'], ['bdowOe-05J4', 'Save your family from the Fire'], ['4X3iTKnMpXU', 'How to find barakah'], ['ikkKRnBGab4', 'Who Allah loves'], ['E3ivH2P1_6w', 'Do you really love Allah and the Prophet ﷺ?'], ['QiKYLEcpgu8', 'Two of the seven in His shade']] },
  { k: 'menk', n: 'Mufti Menk', by: 'Mufti Menk', c: 'talks', yt: 'UCNB_OaI4524fASt8h0IL8dw', age: 'Teens & adults', d: 'Short, uplifting reminders for everyday life.', g: ['#79af8d', '#283f31'], m: 'heart',
    v: [['vPJvf9-RklY', 'Don\'t yell at people'], ['ReGOQI8bHDg', 'Friday reminder: full lecture'], ['wZujzTbbv_I', 'Let it come from the heart'], ['ICLSEes1pBA', 'Light Upon Light conference, London'], ['F1ZX4OP0JzQ', 'Relax... Allah hasn\'t forgotten you'], ['vC5zTQ4xgL8', 'How to make Allah happy with you'], ['sXAUmKu5JaU', 'Silent strength: let Allah defend you']] },
];
const VID = CH.flatMap(c => c.v.map(([id, t]) => ({ id, t, c })));
const thumb = id => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
const CATS = [['all', 'All'], ['dawah', 'Dawah'], ['kids', 'Kids learning'], ['talks', 'Talks'], ['ch:menk', 'Mufti Menk'], ['ch:bilal', 'Bilal Assad'], ['quran', 'Prophets'], ['learn', 'Muslim heroes'], ['saved', 'Saved']];
const ROWS = [['dawah', 'Dawah & good watches', 'Islam explained, revert stories, reminders'], ['kids', 'Kids learning', 'Cartoons, songs and stories'], ['ch:menk', 'Mufti Menk', 'Reminders & lectures'], ['ch:bilal', 'Bilal Assad', 'Talks on faith & family'], ['quran', 'Stories of the prophets', 'From the Qur\'an'], ['talks', 'More talks', 'The Companions'], ['learn', 'Muslim heroes', 'Scholars & inventors']];
const MOT = {
  song: '<path d="M40 14v24a7 7 0 1 1-4-6.3V20l-14 4v18a7 7 0 1 1-4-6.3V18z" fill="#fff" opacity=".9"/>',
  book: '<path d="M32 22c-6-5-15-6-22-3v26c7-3 16-2 22 3 6-5 15-6 22-3V19c-7-3-16-2-22 3z" fill="#fff" opacity=".9"/><path d="M32 22v26" stroke="currentColor" stroke-width="2"/>',
  star: '<path d="M32 10l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="#fff" opacity=".9"/>',
  abc: '<text x="32" y="44" text-anchor="middle" font-family="Amiri, serif" font-size="30" fill="#fff">أ ب</text>',
  moon: '<path d="M40 12a20 20 0 1 0 12 32 16 16 0 1 1-12-32z" fill="#fff" opacity=".9"/>',
  quran: '<path d="M14 40l18-8 18 8-18 8z" fill="#fff" opacity=".9"/><path d="M18 38V20l14 6 14-6v18" fill="none" stroke="#fff" stroke-width="3"/>',
  bulb: '<path d="M32 10a14 14 0 0 0-8 25v5h16v-5a14 14 0 0 0-8-25z" fill="#fff" opacity=".9"/><rect x="25" y="43" width="14" height="4" rx="2" fill="#fff"/>',
  mic: '<rect x="25" y="10" width="14" height="26" rx="7" fill="#fff" opacity=".9"/><path d="M19 30a13 13 0 0 0 26 0M32 43v8" stroke="#fff" stroke-width="3" fill="none"/>',
  heart: '<path d="M32 50S12 38 12 24a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 14-20 26-20 26z" fill="#fff" opacity=".9"/>'
};
const pat = '<pattern id="wp8" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M14 0l4 10 10 4-10 4-4 10-4-10L0 14l10-4z" fill="#fff" opacity=".07"/></pattern>';
let artN = 0;
const art = (c, big) => { const id = 'wg' + (++artN); return `<svg class="wv-art" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.g[0]}"/><stop offset="1" stop-color="${c.g[1]}"/></linearGradient>${pat.replace('wp8', id + 'p')}</defs><rect width="160" height="90" fill="url(#${id})"/><rect width="160" height="90" fill="url(#${id}p)"/><circle cx="128" cy="20" r="46" fill="#fff" opacity=".08"/><g transform="translate(${big ? 96 : 100} ${big ? 14 : 18}) scale(${big ? .9 : .8})" color="${c.g[1]}">${MOT[c.m]}</g></svg>`; };
const vcard = (x, wide) => `<button class="wv-card ${wide ? 'wide' : ''}" type="button" data-vid="${x.id}"><span class="wv-th">${art(x.c)}<img src="${thumb(x.id)}" alt="" decoding="async" onerror="this.remove()"><i class="wv-pl"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></i></span><span class="wv-tt"><b>${esc(x.t)}</b><small>${esc(x.c.n)}</small></span></button>`;
const card = c => c.v.length ? vcard({ id: c.v[0][0], t: c.n, c }) : `<button class="wv-card" type="button" data-wv="${c.k}"><span class="wv-th">${art(c)}<i class="wv-pl"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></i></span><span class="wv-tt"><b>${esc(c.n)}</b><small>${esc(c.age)} · all episodes</small></span></button>`;
/* ---------- Watch page: Free to watch library ---------- */
const pick = c => c === 'all' ? CH : c.startsWith('ch:') ? CH.filter(x => x.k === c.slice(3)) : c === 'talks' ? CH.filter(x => x.c === 'talks' && x.k !== 'menk' && x.k !== 'bilal') : CH.filter(x => x.c === c);
const savedV = () => store.get('wvSavedV', []).map(id => VID.find(v => v.id === id)).filter(Boolean);
/* demo playlists: hand-picked mixes from the library, shown under the categories */
const PL = [
  { n: 'Jummah reminders', s: 'Short talks for Friday', ic: 'heart', g: ['#305552', '#263b3a'], f: v => v.c.k === 'menk' || v.c.k === 'bilal', max: 10 },
  { n: 'Bedtime stories', s: 'Prophets’ stories for kids', ic: 'book', g: ['#414b67', '#4a4966'], f: v => v.c.c === 'quran', max: 10 },
  { n: 'Learn with the kids', s: 'Songs, letters and duas', ic: 'song', g: ['#a06f56', '#6e4a3e'], f: v => v.c.c === 'kids', max: 12 },
  { n: 'Muslim heroes', s: 'Scholars, inventors, Companions', ic: 'bulb', g: ['#386964', '#2a4544'], f: v => v.c.c === 'learn' || /Companion|Firsts/i.test(v.c.n), max: 12 },
  { n: 'On the go', s: 'Quick reminders under 10 minutes', ic: 'star', g: ['#8b73b4', '#54436f'], f: (v, i) => v.c.c === 'talks' && i % 2 === 0, max: 8 }];
const plVids = p => VID.filter(p.f).slice(0, p.max || 20);
function openPL(i) { const p = PL[i], L = plVids(p);
  window.IFMX.modal(`<div class="wv-plm" style="--a:${p.g[0]};--b:${p.g[1]}"><div class="wv-plh"><span>Playlist</span><h3>${esc(p.n)}</h3><p>${esc(p.s)} · ${L.length} videos</p><button type="button" class="btn g sm" id="plPlay">${I('play')}Play all</button></div><div class="wv-pll">${L.map((x, j) => `<button class="vp-ep" type="button" data-vid="${x.id}"><span class="wv-th">${art(x.c)}<img src="${thumb(x.id)}" alt="" decoding="async" onerror="this.remove()"></span><span><b>${j + 1}. ${esc(x.t)}</b><small>${esc(x.c.n)}</small></span></button>`).join('')}</div></div>`);
  const pp = document.getElementById('plPlay'); if (pp && L[0]) pp.onclick = () => { window.IFMX.closeModal(); openVP(L[0].c.k, L[0].id); };
  document.querySelectorAll('.wv-pll [data-vid]').forEach(b => b.addEventListener('click', () => window.IFMX.closeModal())); }
function mountLibrary() {
  const pg = $('[data-page=watch]'); if (!pg || $('#wvLib')) return;
  const sec = document.createElement('section'); sec.className = 'wv'; sec.id = 'wvLib';
  sec.innerHTML = `<div class="wrap"><div class="tb-search wv-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" id="wvQ" placeholder="Search videos, speakers, shows…" aria-label="Search videos"></div>
    <div class="wv-chips" id="wvChips">${CATS.map(([k, n], i) => `<button type="button" data-c="${k}" aria-pressed="${i === 0}">${n}</button>`).join('')}</div>
    <div id="wvBody"></div></div>`;
  pg.insertBefore(sec, pg.firstChild);
  const rail = L => `<div class="wv-rail">${L.map(x => vcard(x)).join('')}</div>`;
  const grid = L => L.length ? `<div class="wv-grid">${L.map(x => vcard(x, 1)).join('')}</div>` : '';
  const draw = c => {
    const B = $('#wvBody'), q = ($('#wvQ').value || '').trim().toLowerCase();
    if (q) { const L = VID.filter(v => (v.t + ' ' + v.c.n + ' ' + v.c.by + ' ' + v.c.d).toLowerCase().includes(q)); B.innerHTML = L.length ? `<h3 class="wv-rh">${L.length} result${L.length > 1 ? 's' : ''}</h3>${grid(L)}` : `<p class="wv-empty">No videos match “${esc(q)}”.</p>`; return; }
    if (c === 'saved') { const L = savedV(); B.innerHTML = L.length ? grid(L) : `<p class="wv-empty">Tap the bookmark on any video to save it here.</p>`; return; }
    if (c !== 'all') { const cs = pick(c); B.innerHTML = cs.map(ch => `<div class="wv-row">${cs.length > 1 ? `<h3>${esc(ch.n)}<small>${esc(ch.age)}</small></h3>` : ''}${grid(ch.v.map(([id, tt]) => ({ id, t: tt, c: ch })))}</div>`).join(''); return; }
    const feat = VID.find(v => v.c.k === 'inspire') || VID.find(v => v.c.k === 'menk') || VID[0];
    const recent = store.get('wvRecent2', []).map(id => VID.find(v => v.id === id)).filter(Boolean), sv = savedV();
    let h = `<div class="wv-row wv-plr"><h3><span>Playlists<small>Put together by the My Sirat team</small></span></h3><div class="wv-rail">${PL.map((p, i) => { const L = plVids(p); return `<button type="button" class="wv-plc" data-pl="${i}" style="--a:${p.g[0]};--b:${p.g[1]}"><span class="wv-plt">${L.slice(0, 3).map(x => `<img src="${thumb(x.id)}" alt="" decoding="async" onerror="this.remove()">`).join('')}<i>${MOT[p.ic] ? `<svg viewBox="0 0 64 64">${MOT[p.ic]}</svg>` : ''}</i><em>${L.length} videos</em></span><b>${esc(p.n)}</b><small>${esc(p.s)}</small></button>`; }).join('')}</div></div>`;
    /* no big featured banner: the Inspire FM row comes straight after the playlists */
    if (recent.length) h += `<div class="wv-row"><h3>Continue watching</h3>${rail(recent)}</div>`;
    if (sv.length) h += `<div class="wv-row"><h3>Saved</h3>${rail(sv)}</div>`;
    ROWS.forEach(([k, tt, s]) => { const L = pick(k).flatMap(ch => ch.v.map(([id, t2]) => ({ id, t: t2, c: ch }))); if (!L.length) return;
      h += `<div class="wv-row"><h3><span>${tt}<small>${s}</small></span><button type="button" class="wv-all" data-go="${k}">See all</button></h3>${rail(L.slice(0, 10))}</div>`; });
    B.innerHTML = h;
    $$('[data-pl]', B).forEach(b => b.onclick = () => openPL(+b.dataset.pl));
    $$('[data-go]', B).forEach(b => b.onclick = () => { const t2 = $(`#wvChips [data-c="${b.dataset.go}"]`); if (t2) { t2.click(); t2.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } });
  };
  const cur = () => ($('#wvChips [aria-pressed="true"]') || {}).dataset?.c || 'all';
  $('#wvChips').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#wvChips button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#wvQ').value = ''; draw(b.dataset.c); scrollTo({ top: 0 }); };
  $('#wvQ').addEventListener('input', () => draw(cur()));
  window.addEventListener('wv-saved', () => draw(cur()));
  draw('all');
}

/* ---------- Video player screen ---------- */
const vp = document.createElement('div'); vp.className = 'vp'; vp.id = 'vp'; vp.hidden = true; vp.setAttribute('role', 'dialog'); vp.setAttribute('aria-modal', 'true');
vp.innerHTML = `<div class="vp-in"><div class="vp-bar"><button type="button" class="vp-x" id="vpX" aria-label="Close"><svg><use href="#i-down"/></svg></button><b id="vpBy"></b><button type="button" class="vp-x vp-sv" id="vpSave" aria-label="Save"><svg viewBox="0 0 24 24"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button><button type="button" class="vp-x" id="vpSh" aria-label="Share"><svg><use href="#i-share"/></svg></button></div>
  <div class="vp-frame" id="vpFrame"></div><div class="vp-info"><small id="vpAge"></small><h2 id="vpT"></h2><p id="vpD"></p></div>
  <div class="vp-list"><h3 id="vpMoreT">More</h3><div id="vpMore"></div></div></div>`;
document.body.appendChild(vp);
let vpCur = null, vpVid = null;
const svUI = () => { const on = !!vpVid && store.get('wvSavedV', []).includes(vpVid); $('#vpSave').classList.toggle('on', on); $('#vpSave').setAttribute('aria-pressed', on); };
function openVP(k, vid) {
  const c = CH.find(x => x.k === k); if (!c) return; vpCur = c;
  if (document.body.classList.contains('playing')) $('#npcTg').click(); /* pause the radio so audio doesn't clash */
  const v = vid ? VID.find(x => x.id === vid) : null;
  $('#vpBy').textContent = c.n; $('#vpT').textContent = v ? v.t : c.n; $('#vpD').textContent = c.d; $('#vpAge').textContent = c.age;
  const src = v ? `https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1&playsinline=1&autoplay=1` : `https://www.youtube.com/embed/videoseries?list=UU${c.yt.slice(2)}&rel=0&playsinline=1`;
  $('#vpFrame').innerHTML = `<img class="vp-poster" src="${v ? thumb(v.id) : ''}" alt="" onerror="this.remove()"><iframe src="${src}" title="${esc(v ? v.t : c.n)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  vpVid = v ? v.id : null; svUI();
  const more = c.v.filter(([id]) => !v || id !== v.id).map(([id, t]) => ({ id, t, c }));
  $('#vpMoreT').textContent = more.length ? `More from ${c.n}` : 'You might also like';
  $('#vpMore').innerHTML = (more.length ? more : VID.filter(x => x.c.c === c.c && x.c !== c).slice(0, 6)).map(x => `<button class="vp-ep" type="button" data-vid="${x.id}"><span class="wv-th">${art(x.c)}<img src="${thumb(x.id)}" alt="" decoding="async" onerror="this.remove()"></span><span><b>${esc(x.t)}</b><small>${esc(x.c.n)}</small></span></button>`).join('');
  vp.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => vp.classList.add('on'))); document.body.classList.add('lock', 'vp-open'); vp.scrollTop = 0;
  if (v) { const R = store.get('wvRecent2', []).filter(x => x !== v.id); R.unshift(v.id); store.set('wvRecent2', R.slice(0, 8)); }
}
function closeVP() { vp.classList.remove('on'); document.body.classList.remove('lock', 'vp-open'); setTimeout(() => { if (!vp.classList.contains('on')) { vp.hidden = true; $('#vpFrame').innerHTML = ''; } }, 420); }
$('#vpX').onclick = closeVP;
$('#vpSh').onclick = () => { if (!vpCur) return; const txt = `Watch “${$('#vpT').textContent}” on My Sirat`, url = location.origin + location.pathname + '#watch'; (window.IFMX.share)({ title: txt, text: txt, url }); };
$('#vpSave').onclick = () => { if (!vpVid) return; let S = store.get('wvSavedV', []); const on = !S.includes(vpVid); S = on ? [vpVid].concat(S) : S.filter(x => x !== vpVid); store.set('wvSavedV', S); svUI(); toast(on ? 'Saved' : 'Removed from saved'); dispatchEvent(new Event('wv-saved')); };
addEventListener('keydown', e => { if (e.key === 'Escape' && !vp.hidden) closeVP(); });
document.addEventListener('click', e => { const v = e.target.closest('[data-vid]'); if (v) { e.preventDefault(); const x = VID.find(y => y.id === v.dataset.vid); if (x) openVP(x.c.k, x.id); return; } const b = e.target.closest('[data-wv]'); if (b) { e.preventDefault(); openVP(b.dataset.wv); } });
addEventListener('hashchange', () => { if (!vp.hidden) closeVP(); });

/* ---------- App home (phones) ---------- */
function wcCard() {
  const L = window.JWC_LIVE; if (!L) return '';
  const t = new Date(), iso = d => d.toISOString().slice(0, 10), td = iso(new Date(t.getTime() - t.getTimezoneOffset() * 6e4));
  if (td > L.settings.lastFriday) return '';
  const next = Object.values(L.booked).filter(b => b.date >= td).sort((a, b) => a.date < b.date ? -1 : 1), d = next.length ? next[0].date : '';
  const who = next.filter(b => b.date === d).map(b => b.name), when = d === td ? 'Collecting today' : d ? 'Next collection ' + new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Every Friday until 25 Dec';
  return ""; `<a class="wc-card" href="#winter"><img src="winter/img/jwa-light.png" alt=""><div><small>Jummah Winter Campaign</small><b>${who.length ? esc(who.join(' & ')) : 'Feed Luton this winter'}</b><span>${when} · for Luton Foodbank, matched by ${esc(L.settings.matchName)}</span></div><em>Give</em></a>`;
}
function mountAppHome() {
  const home = $('[data-page=home]'); if (!home || $('#appHome')) return;
  const pick = ['ayah', 'qibla', 'tasbih', 'duas', 'jummah', 'wall', 'track', 'quran', 'hijri', 'zakat', 'kids', 'hajj'];
  const icons = pick.map(k => { const t = $(`[data-page=toolbox] .tbt[href="#tb-${k}"]`); if (!t) return ''; return `<a class="ah-ic" href="#tb-${k}">${$('.ai', t).outerHTML.replace(/id="(g\w+)"/g, 'id="$1h"').replace(/url\(#(g\w+)\)/g, 'url(#$1h)')}<span>${esc($('b', t).textContent)}</span></a>`; }).join('');
  const s = document.createElement('section'); s.className = 'ah'; s.id = 'appHome';
  s.innerHTML = `<div class="ah-top"><img src="icons/icon-192.png" alt="" class="ah-av"><div><b id="ahHi">Salaam</b><small id="ahDate"></small></div><button type="button" class="ah-btn ah-set" data-settings aria-label="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button><button class="ah-btn" type="button" id="ahMenu" aria-label="Menu"><svg><use href="#i-list"/></svg></button></div>
    <a class="ah-pr" href="#prayer"><div class="ah-pr-top"><span><i>Next</i> <b id="ahNxN">–</b></span><span class="ah-loc">Luton, United Kingdom<small id="ahHij"></small></span></div><div class="ah-pr-t" id="ahNxT">–</div><div class="ah-pr-in" id="ahNxIn"></div><div class="ah-five" id="ahFive"></div><div class="ah-pr-all">View all prayer times <svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></a>
    ${wcCard()}
    <a class="ah-ay" id="ahAyah" href="#tb-ayah"></a>
    <div class="ah-sq2"><div class="ah-oa" id="ahOA"><span class="ah-oa-bg" id="ahOABg"></span><a href="#listen" class="ah-oa-lnk" aria-label="Open Listen"></a><small><i></i>On air now</small><div class="ah-oa-b"><b id="ahShow">Inspire FM</b><span id="ahNext"></span></div><button type="button" class="ah-oa-pl" data-play aria-label="Play Inspire FM live"><svg><use href="#i-play"/></svg></button></div>
    <a class="ah-wx" id="ahWx" href="#tb-weather" aria-label="Open the weather"><div class="ah-wx-h"><small id="ahWxP">Luton</small><span class="ah-wx-hl" id="ahWxHL"></span></div><div class="ah-wx-m"><span class="ah-wx-ic" id="ahWxIc"></span><b id="ahWxT">--°</b></div><span class="ah-wx-c" id="ahWxC">Loading…</span><div class="ah-wx-day" id="ahWxDay"></div></a></div>
    <a class="fbw" href="#foodbank"><span class="fbwl"><img src="ngs/logos/luton-foodbank-logo.webp" alt="Luton Foodbank"></span><div><small class="fbwk">Our partner</small><h3>Luton Foodbank</h3><p>Get food help, find out how you can help out, and tips to get through this winter</p></div><img class="fbwi" src="ngs/media/foodbank/turn-it-down-s.webp" alt=""></a>
    <a class="ah-day" id="ahDay" href="#duas"></a>
    <div class="ah-sec"><h3>Toolbox</h3><a href="#toolbox" class="ah-more">More</a></div>
    <div class="ah-icons">${icons}</div>
    <div class="ah-sec"><h3>Watch free</h3><a href="#watch" class="ah-more">View all</a></div>
    <div class="wv-rail ah-wv">${['XBCQK9dTGRI', 'W45DrRGECQE', '0HVH-KWSC8c', '-fD_sIUUaV0', 'ywfl3oZ5WWU', 'XCN6O7QibMM'].map(id => vcard(VID.find(v => v.id === id))).join('')}</div>`;
  home.insertBefore(s, home.firstChild);
  $('#ahMenu').onclick = () => X.setMenu(!document.documentElement.classList.contains('menu-open'));
  tick(); setInterval(tick, 1000);
}
function tick() {
  if (!$('#appHome')) return;
  const T = today(), l = T.l, hr = l.h;
  $('#ahHi').textContent = 'Assalamu alaikum';
  $('#ahDate').textContent = greg(new Date()).replace(/ \d{4}$/, '');
  $('#ahHij').textContent = hijri(new Date());
  const tgt = (T.now + T.left) % 24;
  $('#ahNxN').textContent = T.nx[1]; $('#ahNxT').textContent = hm(tgt); $('#ahNxIn').textContent = `${dur(T.left)} to ${T.nx[1]}`;
  $('#ahFive').innerHTML = X.PR.filter(p => p[0] !== 'sunrise').map(p => `<span class="${p[0] === T.nx[0] ? 'on' : T.t[p[0]] < T.now ? 'gone' : ''}"><small>${p[1]}</small>${hm(T.t[p[0]])}</span>`).join('');
  const c = X.showAt(), sh = D.shows[c.s[2]]; $('#ahShow').textContent = sh.n; $('#ahNext').textContent = `${hm(c.start % 24)}–${hm(c.end % 24)}`;
  const bg = $('#ahOABg'); if (bg && bg.dataset.k !== c.s[2]) { bg.dataset.k = c.s[2]; bg.style.background = `linear-gradient(180deg,rgba(0,0,0,.05) 20%,rgba(0,0,0,.78)),${sh.img ? `url(${sh.img}) center/cover,` : ''}linear-gradient(135deg,${sh.g[0]},${sh.g[1]})`; }
  const day = $('#ahDay'), key = l.dow === 5 ? 'fri' : 'd' + l.d;
  if (day.dataset.k !== key) { day.dataset.k = key;
    if (l.dow === 5) { day.href = '#quran'; day.innerHTML = `<span class="ah-day-i">${IFM_IC('mosque')}</span><span><small>Jummah Mubarak</small><b>Read Surah Al-Kahf today</b><em>Send salawat on the Prophet ﷺ and make dua in the last hour before Maghrib.</em></span>`; }
    else { const L = D.duas.filter(d => d.en && d.en.length < 170), d = L[l.d % L.length]; day.href = '#duas'; day.innerHTML = `<span class="ah-day-i">${IFM_IC('hands')}</span><span><small>Dua of the day</small><b>${esc(d.t)}</b><em>${esc(d.en)}</em></span>`; }
  }
}

/* ---------- boot ---------- */
mountLibrary(); mountAppHome();
})();
