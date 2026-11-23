/* Inspire FM · Learn to pray: wudu, every position with what to say (Arabic, transliteration, meaning, real recitation),
   a guided practice mode for each prayer, and progress. Based on Hisn al-Muslim and authentic hadith; notes where schools differ. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, toast, TOOLS } = X;
const IC = window.IFM_IC, DU = window.IFM_DUA;
const pad = n => String(n).padStart(3, '0');
const ay = k => { const [s, a] = k.split(':'); return `https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`; };
const hisn = id => `https://www.hisnmuslim.com/audio/ar/${id}.mp3`;
const H = r => (DU && DU.get(r)) || {};

/* ---- posture figures (side view, line art) ---- */
const T = 'stroke-width="13"', L = 'stroke-width="9"';
const FIG = {
  stand: `<path d="M60 38v34" ${T}/><path d="M60 72v44" ${L}/><path d="M60 42l2 28" ${L}/><circle cx="60" cy="21" r="10" fill="currentColor" stroke="none"/>`,
  takbir: `<path d="M60 38v34" ${T}/><path d="M60 72v44" ${L}/><path d="M60 42l11 10-1-30" ${L}/><circle cx="60" cy="21" r="10" fill="currentColor" stroke="none"/>`,
  qiyam: `<path d="M60 38v34" ${T}/><path d="M60 72v44" ${L}/><path d="M61 42l8 18-9 2" ${L}/><circle cx="60" cy="21" r="10" fill="currentColor" stroke="none"/>`,
  ruku: `<path d="M46 72v44" ${L}/><path d="M46 70h38" ${T}/><path d="M80 72l-28 22" ${L}/><circle cx="99" cy="73" r="10" fill="currentColor" stroke="none"/>`,
  rise: `<path d="M60 38v34" ${T}/><path d="M60 72v44" ${L}/><path d="M60 42l-1 28" ${L}/><circle cx="60" cy="21" r="10" fill="currentColor" stroke="none"/>`,
  sujud: `<path d="M24 114h26l-8-32" ${L}/><path d="M42 82l34 18" ${T}/><path d="M74 100l6 14h14" ${L}/><circle cx="92" cy="104" r="9.5" fill="currentColor" stroke="none"/>`,
  sit: `<path d="M50 112h28l-30-6" ${L}/><path d="M50 104l2-40" ${T}/><path d="M53 70l8 22 14 10" ${L}/><circle cx="53" cy="47" r="10" fill="currentColor" stroke="none"/>`,
  salam: `<path d="M50 112h28l-30-6" ${L}/><path d="M50 104l2-40" ${T}/><path d="M53 70l8 22 14 10" ${L}/><circle cx="53" cy="47" r="10" fill="currentColor" stroke="none"/><path d="M72 36a20 20 0 0 1 0 22M34 36a20 20 0 0 0 0 22" stroke-width="3.5" opacity=".55"/><path d="m72 58 5-3m-43 3-5-3" stroke-width="3.5" opacity=".55"/>`
};
const fig = (k, cls) => `<svg class="sl-fig ${cls || ''}" viewBox="0 0 128 128" aria-hidden="true"><rect x="8" y="117" width="112" height="7" rx="3.5" fill="currentColor" opacity=".18"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${FIG[k]}</g></svg>`;

const pic = (st, cls) => st.img ? `<span class="sl-pic ${cls || ''}${st.img.length > 1 ? ' two' : ''}">${st.img.map((n, i) => `<img src="img/salah/${n}.webp" alt=""${st.img.length > 1 ? ` data-lbl="${i ? 'Then left' : 'Right first'}"` : ''}>`).join('')}</span>` : fig(st.f, cls);

const FAT = ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'مَٰلِكِ يَوْمِ ٱلدِّينِ', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'].map((t, i) => t + ' \uFD3F' + '١٢٣٤٥٦٧'[i] + '\uFD3E').join(' ');
const QT = window.IFM_HISN_QT || {};
const IKH = ['112:1', '112:2', '112:3', '112:4'].map((k, i) => (QT[k] || '') + ' \uFD3F' + '١٢٣٤'[i] + '\uFD3E').join(' ');

/* ---- every step of the prayer ---- */
const S = {
  niyyah: { img: ['stand'], f: 'stand', t: 'Intention (niyyah)', d: 'Stand facing the qiblah. In your heart, intend which prayer you are about to pray (for example, the 2 fard of Fajr). You don\'t need to say it out loud.', n: 'Make sure you have wudu, are clean, covered, and facing the qiblah. Use the Qibla tool if you\'re not sure.' },
  takbir: { img: ['takbir'], sc: { h: 'Hanafi: raise your hands so your thumbs are level with your earlobes.', s: 'Shafi\'i: raise your hands level with your shoulders.' }, f: 'takbir', t: 'Opening takbir', d: 'Raise your hands to your ears (or shoulders) and say:', ar: 'اللَّهُ أَكْبَرُ', tr: 'Allahu akbar', en: 'Allah is the Greatest.', n: 'This "takbirat al-ihram" starts the prayer. From now on, don\'t talk, eat or look around.' },
  thana: { img: ['qiyam'], sc: { h: 'Hanafi: right hand over left, below the navel. This opening dua (Subhanaka) is the usual one.', s: 'Shafi\'i: hands on the chest, just below it. Many say "Wajjahtu wajhiya…" or "Allahumma ba\'id…" instead; all are authentic.' }, f: 'qiyam', t: 'Opening dua (thana)', d: 'Place your right hand over your left on your chest or below the navel, look at the place of sujud, and say quietly:', ref: 'h28', au: [hisn(28)], n: 'Hanafis place the hands below the navel; Shafi\'is and many others on the chest. Both are followed in Luton masjids.' },
  taawwudh: { img: ['qiyam'], f: 'qiyam', t: 'Seek refuge and Bismillah', d: 'Say quietly:', ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ · بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', tr: "A'udhu billahi minash-shaytanir-rajim. Bismillahir-rahmanir-rahim", en: 'I seek refuge in Allah from the accursed Shaytan. In the name of Allah, the Most Gracious, the Most Merciful.' },
  fatiha: { img: ['qiyam'], sc: { h: 'Hanafi: say "Amin" quietly. Behind an imam, stay silent and listen.', s: 'Shafi\'i: recite al-Fatihah even behind the imam, and say "Amin" aloud in loud prayers.' }, f: 'qiyam', t: 'Surah al-Fatihah', d: 'Recite al-Fatihah in every rak\'ah. Then say "Amin".', ar: FAT, tr: "Alhamdu lillahi rabbil-'alamin. Ar-rahmanir-rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an'amta 'alayhim, ghayril-maghdubi 'alayhim wa lad-dallin. (Amin)", en: 'All praise is for Allah, Lord of all the worlds, the Most Gracious, the Most Merciful, Master of the Day of Judgement. You alone we worship and You alone we ask for help. Guide us to the straight path: the path of those You have blessed, not of those who earned anger, nor of those who went astray.', au: ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'].map(ay), n: 'In Fajr, Maghrib and Isha the imam recites the first two rak\'ahs aloud; in Zuhr and Asr everything is quiet.' },
  surah: { img: ['qiyam'], f: 'qiyam', t: 'A short surah', d: 'In the first two rak\'ahs, recite any part of the Qur\'an after al-Fatihah. A good one to learn first is al-Ikhlas:', ar: IKH, tr: 'Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.', en: 'Say: He is Allah, the One. Allah, the Eternal. He does not give birth, nor was He born. And there is none like Him.', au: ['112:1', '112:2', '112:3', '112:4'].map(ay), n: 'In the 3rd and 4th rak\'ahs of a fard prayer, recite al-Fatihah only.' },
  ruku: { img: ['ruku'], sc: { h: 'Hanafi: hands are not raised when going into ruku.', s: 'Shafi\'i: raise your hands to your shoulders as you go into ruku, and again as you rise.' }, f: 'ruku', t: 'Ruku (bowing)', d: 'Say "Allahu akbar" and bow, hands on your knees, back straight. Say three times:', ref: 'h33', au: [hisn(33)], rep: '×3' },
  rise: { img: ['stand'], f: 'rise', t: 'Rising from ruku', d: 'Stand up straight, saying:', ref: 'h38', extra: 'h39', au: [hisn(38), hisn(39)], n: 'Then say "Rabbana wa lakal-hamd" (Our Lord, to You belongs all praise). Stand still for a moment before going down.' },
  sujud1: { img: ['sujud'], f: 'sujud', t: 'Sujud (prostration)', d: 'Say "Allahu akbar" and go down. Forehead and nose, both palms, both knees and the toes of both feet touch the ground. Say three times:', ref: 'h41', au: [hisn(41)], rep: '×3', n: '"The closest a servant is to his Lord is in sujud, so make a lot of dua" (Muslim 482). You can make dua in your own words in sunnah prayers.' },
  jalsa: { img: ['sit-side'], f: 'sit', t: 'Sitting between the two sujud', d: 'Say "Allahu akbar" and sit up, calm and still. Say:', ref: 'h48', au: [hisn(48)] },
  sujud2: { img: ['sujud'], f: 'sujud', t: 'Second sujud', d: 'Say "Allahu akbar" and go down again, exactly as before:', ref: 'h41', au: [hisn(41)], rep: '×3' },
  stand: { img: ['stand'], f: 'stand', t: 'Stand for the next rak\'ah', d: 'Say "Allahu akbar" and stand up for the next rak\'ah.' },
  tashahhud: { img: ['tashahhud'], sc: { h: 'Hanafi: sit on your left foot with the right foot upright. Raise the index finger at "la ilaha" and lower it at "illallah".', s: 'Shafi\'i: in the last sitting, sit on your left hip (tawarruk). Raise the index finger at "illallah" and keep it raised.' }, f: 'sit', t: 'Tashahhud (sitting)', d: 'Sit and recite the tashahhud. Raise your right index finger at "ash-hadu an la ilaha illallah".', ref: 'h52', au: [hisn(52)], n: 'In a 3 or 4 rak\'ah prayer, the first sitting ends here: say "Allahu akbar" and stand up.' },
  salawat: { img: ['sit'], f: 'sit', t: 'Salawat on the Prophet ﷺ', d: 'In the final sitting, after the tashahhud, send blessings on the Prophet ﷺ (Salat al-Ibrahimiyyah):', ref: 'h53', au: [hisn(53)] },
  dua: { img: ['sit'], f: 'sit', t: 'A dua before ending', d: 'Then make a dua. This is the one the Prophet ﷺ taught Abu Bakr to say in his prayer:', ref: 'h57', au: [hisn(57)] },
  salam: { img: ['salam-right', 'salam-left'], f: 'salam', t: 'Salam (ending the prayer)', d: 'Turn your head to the right, then to the left, saying each time:', ar: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', tr: "As-salamu 'alaykum wa rahmatullah", en: 'Peace be upon you and the mercy of Allah.', n: 'Your prayer is complete. Then say "Astaghfirullah" three times and the adhkar after salah.' },
  after: { img: ['sit'], f: 'sit', t: 'After the prayer', d: 'Say "Astaghfirullah" three times, then:', ref: 'h66', au: [hisn(66)], n: 'Then 33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar (the Tasbih tool counts for you), and Ayat al-Kursi.' }
};
const PRAYERS = [
  ['fajr', 'Fajr', 2, 'dawn', '2 sunnah before (very strongly encouraged), then 2 fard.'],
  ['zuhr', 'Zuhr', 4, 'sun', '4 sunnah before, 4 fard, then 2 sunnah. (Shafi\'is often pray 2 before.)'],
  ['asr', 'Asr', 4, 'suncloud', '4 fard. Some pray 4 sunnah before (not confirmed sunnah).'],
  ['maghrib', 'Maghrib', 3, 'sunset', '3 fard, then 2 sunnah.'],
  ['isha', 'Isha', 4, 'moon', '4 fard, 2 sunnah, then Witr (3 rak\'ahs is common in Luton).'],
  ['two', '2 rak\'ah sunnah', 2, 'sparkle', 'Any 2 rak\'ah sunnah or nafl prayer, like Tahiyyat al-Masjid.']
];
function seq(n) {
  const out = [];
  for (let r = 1; r <= n; r++) {
    if (r === 1) out.push([r, 'niyyah'], [r, 'takbir'], [r, 'thana'], [r, 'taawwudh']);
    out.push([r, 'fatiha']); if (r <= 2) out.push([r, 'surah']);
    out.push([r, 'ruku'], [r, 'rise'], [r, 'sujud1'], [r, 'jalsa'], [r, 'sujud2']);
    if (r === n) out.push([r, 'tashahhud'], [r, 'salawat'], [r, 'dua'], [r, 'salam'], [r, 'after']);
    else if (r === 2) out.push([r, 'tashahhud'], [r, 'stand']); else out.push([r, 'stand']);
  }
  return out;
}
const WUDU = [
  ['Intend and say Bismillah', 'Intend in your heart to make wudu for prayer, and say "Bismillah".', 'h12'],
  ['Wash your hands', 'Wash both hands up to the wrists three times, between the fingers too.'],
  ['Rinse your mouth', 'Take water into your mouth with your right hand and rinse it three times.'],
  ['Clean your nose', 'Sniff water gently into your nose with your right hand and blow it out with your left, three times.'],
  ['Wash your face', 'Wash your whole face three times: from the hairline to the chin, and ear to ear.'],
  ['Wash your arms', 'Wash your right arm up to and including the elbow three times, then the left.'],
  ['Wipe your head', 'Wet your hands and wipe over your head from the front to the back and back again, once.'],
  ['Wipe your ears', 'With the same wet hands, wipe the inside of your ears with your index fingers and the back with your thumbs.'],
  ['Wash your feet', 'Wash your right foot up to and including the ankle three times, between the toes too. Then the left.'],
  ['Dua after wudu', 'Look up and say the testimony of faith. Whoever says this, the eight gates of Paradise are opened for him (Muslim 234).', 'h13']
];
const BREAKS = ['Going to the toilet, or passing wind', 'Deep sleep (lying down)', 'Losing consciousness', 'Anything that needs ghusl (a full bath)', 'Bleeding: schools differ. Hanafis say flowing blood breaks wudu; Shafi\'is say it doesn\'t. Ask your imam.'];

/* ---- audio ---- */
let A = null, AB = null;
function stop() { if (A) { A.onended = null; A.pause(); A = null; } if (AB) AB.classList.remove('on'); AB = null; }
function play(list, btn) { const same = AB === btn; stop(); if (same || !list || !list.length) return; let i = 0; AB = btn; btn.classList.add('on'); const go = () => { if (i >= list.length) { stop(); return; } A = new Audio(list[i]); A.onended = () => { i++; go(); }; A.play().catch(() => { stop(); toast('Tap again to play'); }); }; go(); }

function words(st) {
  const h = st.ref ? H(st.ref) : null, x = st.extra ? H(st.extra) : null;
  const ar = st.ar || (h && h.ar) || '', tr = st.tr || (h && h.tr) || '', en = st.en || (h && h.en) || '';
  if (!ar) return '';
  return `<div class="sl-say"><p class="sl-ar" lang="ar" dir="rtl">${esc(ar)}${x ? `<br>${esc(x.ar)}` : ''}</p>
    <p class="sl-tr">${esc(tr)}${x ? ` · ${esc(x.tr)}` : ''}${st.rep ? ` <b>${st.rep}</b>` : ''}</p><p class="sl-en">${esc(en)}${x ? ` ${esc(x.en)}` : ''}</p>
    ${st.au ? `<button type="button" class="sl-play" data-au="${esc(JSON.stringify(st.au))}">${IC('radio')}<span>Listen</span></button>` : ''}</div>`;
}

window.IFM_SALAH = { S, seq, PRAYERS, fig, pic, H, hisn, ay, FAT, IKH };
TOOLS.salah = ['Learn to pray', null, node => {
  const goStep = n => { const L = $$('.sl-step', node); if (!L[n]) return; L.forEach((d, j) => { d.open = j === n; }); setTimeout(() => L[n].scrollIntoView({ behavior: 'smooth', block: 'start' }), 40); };
  let tab = store.get('slTab', 'learn'), pr = store.get('slPr', 'fajr'), idx = 0;
  const done = () => store.get('slDone', []);
  const tabs = [['learn', 'Step by step'], ['practice', 'Pray along'], ['wudu', 'Wudu'], ['times', 'Rak\'ahs']];
  node.innerHTML = `<div class="sl"><div class="seg sl-tabs">${tabs.map(([k, n]) => `<button type="button" data-t="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div><div class="sl-body"></div></div>`;
  const body = $('.sl-body', node);
  function prog() { const d = done(); return `<div class="sl-prog"><div><b>${d.length} of ${Object.keys(S).length - 2}</b><small> steps learned</small></div><i style="--w:${Math.round(d.length / (Object.keys(S).length - 2) * 100)}%"></i></div>`; }
  function learn() {
    const order = ['niyyah', 'takbir', 'thana', 'taawwudh', 'fatiha', 'surah', 'ruku', 'rise', 'sujud1', 'jalsa', 'tashahhud', 'salawat', 'dua', 'salam', 'after'];
    const sch = (window.IFM_PRAYALONG ? window.IFM_PRAYALONG.opts().school : 'h');
    body.innerHTML = `<button type="button" class="sl-cta" data-gopa>${IC('radio')}<div><b>Pray along</b><small>Hands-free guide for a whole prayer</small></div><svg viewBox="0 0 24 24" width="20"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>` + prog() + `<div class="sl-steps">${order.map((k, i) => { const st = S[k], ok = done().includes(k); return `<details class="sl-step${ok ? ' ok' : ''}"><summary>${pic(st)}<div><small>Step ${i + 1}</small><b>${esc(st.t)}</b></div><span class="sl-tick">${ok ? IC('check') : ''}</span></summary>
      <div class="sl-in"><p>${esc(st.d)}</p>${words(st)}${st.sc ? `<p class="sl-note">${esc(st.sc[sch])}</p>` : ''}${st.n ? `<p class="sl-note">${esc(st.n)}</p>` : ''}<div class="sl-nav"><button type="button" class="sl-done${ok ? ' on' : ''}" data-done="${k}">${ok ? '✓ Learned' : 'Mark as learned'}</button>${i < order.length - 1 ? `<button type="button" class="sl-next" data-next="${i}">Next step <span aria-hidden="true">›</span></button>` : `<button type="button" class="sl-next" data-gopa>Try it: Pray along <span aria-hidden="true">›</span></button>`}</div></div></details>`; }).join('')}</div>
      <p class="dk-credit">Differences between the schools (where to place the hands, raising the hands, saying Amin aloud) are all valid. If unsure, follow your local masjid.</p>`;
  }
  function practice() {
    const PA = window.IFM_PRAYALONG, v = PA ? PA.opts() : {};
    const tg = (k, n) => `<button type="button" data-po="${k}" aria-pressed="${!!v[k]}">${n}</button>`;
    body.innerHTML = `<div class="sl-pa"><b>Pray along</b><p>Put your phone in front of you on the prayer mat. It shows each position, says the words for you, and waits for you before moving on. The screen stays on.</p>
      <div class="sl-prgrid">${PRAYERS.map(p => `<button type="button" class="${p[0] === pr ? 'on' : ''}" data-pr="${p[0]}">${IC(p[3])}<b>${esc(p[1])}</b><small>${p[2]} rak'ahs</small></button>`).join('')}</div>
      <span class="sl-lbl">Show the words in</span><div class="sl-ops">${[['ar', 'Arabic'], ['tr', 'Transliteration'], ['en', 'English']].map(([k, n]) => `<button type="button" data-po="${k}" aria-pressed="${v.w === k}">${n}</button>`).join('')}</div>
      <span class="sl-lbl">Move to the next step</span><div class="sl-ops"><button type="button" data-pauto="0" aria-pressed="${!v.auto}">When I tap</button><button type="button" data-pauto="1" aria-pressed="${!!v.auto}">Automatically</button></div>
      ${v.auto ? `<span class="sl-lbl">Pace</span><div class="sl-ops">${[['r', 'Relaxed'], ['n', 'Normal'], ['b', 'Brisk']].map(([k, n]) => `<button type="button" data-ppace="${k}" aria-pressed="${(v.pace || 'n') === k}">${n}</button>`).join('')}</div><small class="sl-tip">Each step waits long enough to read it, say the words and move into the next position. Longer parts like al-Fatihah get more time.</small>` : ''}
      <span class="sl-lbl">Recite the words to me</span><div class="sl-ops"><button type="button" data-pvoice="1" aria-pressed="${!!v.voice}">Yes, so I can learn</button><button type="button" data-pvoice="0" aria-pressed="${!v.voice}">No, I know them</button></div>
      <span class="sl-lbl">School</span><div class="sl-ops"><button type="button" data-psch="h" aria-pressed="${v.school === 'h'}">Hanafi</button><button type="button" data-psch="s" aria-pressed="${v.school === 's'}">Shafi'i / others</button></div>
      <button type="button" class="btn g sl-start" data-start>${IC('radio')} Start ${esc(PRAYERS.find(p => p[0] === pr)[1])}</button>
      <small class="sl-tip">Tap anywhere on the screen to move on, swipe back if you miss something, and tap any word of al-Fatihah to hear it on its own.</small></div>
      <p class="dk-credit">${esc(PRAYERS.find(p => p[0] === pr)[4])}</p>`;
  }
  function wudu() {
    body.innerHTML = `<div class="sl-steps">${WUDU.map(([t, d, ref], i) => `<div class="sl-wu"><span>${i + 1}</span><div><b>${esc(t)}</b><p>${esc(d)}</p>${ref ? words({ ref, au: [hisn(+ref.slice(1))] }) : ''}</div></div>`).join('')}</div>
      <div class="tk-card"><b>What breaks wudu</b><ul class="fl-ul">${BREAKS.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
      <p class="dk-credit">Steps from the Prophet's ﷺ wudu as described in Bukhari 159 and Muslim 226. Washing three times is sunnah; once is the minimum.</p>`;
  }
  function times() {
    body.innerHTML = `<div class="sl-tbl">${PRAYERS.slice(0, 5).map(p => `<div><span>${IC(p[3])}</span><b>${esc(p[1])}</b><em>${p[2]} fard</em><small>${esc(p[4])}</small><button type="button" data-pr="${p[0]}" data-go>Practise</button></div>`).join('')}</div>
      <div class="tk-card"><b>Jumu'ah (Friday)</b><p>On Friday, the 2 rak'ahs of Jumu'ah with the khutbah replace Zuhr for those who attend. Find times in the Jummah tool.</p></div>
      <div class="tk-card"><b>Missed a prayer?</b><p>Pray it as soon as you remember. "Whoever forgets a prayer, let him pray it when he remembers it" (Bukhari 597).</p></div>
      <div class="tk-card"><b>Made a mistake in prayer?</b><p>If you're unsure how many rak'ahs you prayed, go with the lower number, finish, and do two sujud as-sahw (prostrations of forgetfulness) before the salam (Muslim 571).</p></div>`;
  }
  function render() { stop(); store.set('slTab', tab); ({ learn, practice, wudu, times })[tab](); }
  node.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; $$('.sl-tabs button', node).forEach(b => b.setAttribute('aria-pressed', b === t)); render(); return; }
    const p = e.target.closest('[data-pr]'); if (p) { pr = p.dataset.pr; store.set('slPr', pr); idx = 0; if (p.hasAttribute('data-go')) { tab = 'practice'; $$('.sl-tabs button', node).forEach(b => b.setAttribute('aria-pressed', b.dataset.t === 'practice')); } render(); return; }
    const a = e.target.closest('[data-au]'); if (a) { e.preventDefault(); play(JSON.parse(a.dataset.au), a); return; }
    const nx = e.target.closest('[data-next]'); if (nx) { goStep(+nx.dataset.next + 1); return; }
    const d = e.target.closest('[data-done]'); if (d) { const k = d.dataset.done; let D = done(); const adding = !D.includes(k); D = adding ? [...D, k] : D.filter(x => x !== k); store.set('slDone', D); const i = [...$$('.sl-step', body)].findIndex(x => x.querySelector(`[data-done="${k}"]`)); render(); if (navigator.vibrate) navigator.vibrate(8);
      const L = $$('.sl-step', body); if (adding && i < L.length - 1) goStep(i + 1); else if (L[i]) L[i].open = true; return; }
    const po = e.target.closest('[data-po],[data-pauto],[data-psch],[data-ppace],[data-pvoice]'); if (po && window.IFM_PRAYALONG) { const v = window.IFM_PRAYALONG.opts(); if (po.dataset.po) v.w = po.dataset.po; if (po.dataset.pauto) v.auto = +po.dataset.pauto; if (po.dataset.psch) v.school = po.dataset.psch; if (po.dataset.ppace) v.pace = po.dataset.ppace; if (po.dataset.pvoice) v.voice = +po.dataset.pvoice; store.set('paOpts', v); render(); return; }
    if (e.target.closest('[data-start]') && window.IFM_PRAYALONG) { stop(); window.IFM_PRAYALONG.open(pr); return; }
    if (e.target.closest('[data-gopa]')) { tab = 'practice'; $$('.sl-tabs button', node).forEach(b => b.setAttribute('aria-pressed', b.dataset.t === 'practice')); render(); return; }
    if (e.target.closest('[data-next]')) { const L = seq(PRAYERS.find(x => x[0] === pr)[2]); if (idx >= L.length - 1) { toast('Masha\'Allah! You\'ve been through the whole prayer.'); idx = 0; } else idx++; render(); (node.closest('#scrBody') || document.scrollingElement).scrollTo({ top: 0, behavior: 'instant' }); return; }
    if (e.target.closest('[data-prev]')) { idx = Math.max(0, idx - 1); render(); return; }
  });
  render();
}];
})();
