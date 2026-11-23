/* Inspire FM · Ayah a Day: learn one ayah daily, keep a streak, protect it with shields, challenge a friend. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, I, store, toast, copy, TOOLS, D } = X;

/* The path: short surahs everyone prays with. Arabic to be checked by Inspire FM's scholars before launch. */
const S = [
  ['Al-Fatihah', 1, [['بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillahir-rahmanir-rahim', 'In the name of Allah, the Most Compassionate, the Most Merciful.'], ['الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'Al-hamdu lillahi rabbil-\'alamin', 'All praise is for Allah, Lord of all the worlds,'], ['الرَّحْمَٰنِ الرَّحِيمِ', 'Ar-rahmanir-rahim', 'the Most Compassionate, the Most Merciful,'], ['مَالِكِ يَوْمِ الدِّينِ', 'Maliki yawmid-din', 'Master of the Day of Judgement.'], ['إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'Iyyaka na\'budu wa iyyaka nasta\'in', 'You alone we worship, and You alone we ask for help.'], ['اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Ihdinas-siratal-mustaqim', 'Guide us along the straight path,'], ['صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 'Siratal-ladhina an\'amta \'alayhim, ghayril-maghdubi \'alayhim wa lad-dallin', 'the path of those You have blessed, not of those who earned Your anger, nor of those who went astray.']]],
  ['Al-Ikhlas', 112, [['قُلْ هُوَ اللَّهُ أَحَدٌ', 'Qul huwallahu ahad', 'Say: He is Allah, the One.'], ['اللَّهُ الصَّمَدُ', 'Allahus-samad', 'Allah, the Self-Sufficient, whom all depend on.'], ['لَمْ يَلِدْ وَلَمْ يُولَدْ', 'Lam yalid wa lam yulad', 'He has never had offspring, nor was He born,'], ['وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Wa lam yakul-lahu kufuwan ahad', 'and there is none comparable to Him.']]],
  ['Al-Falaq', 113, [['قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', 'Qul a\'udhu bi rabbil-falaq', 'Say: I seek refuge in the Lord of the daybreak'], ['مِن شَرِّ مَا خَلَقَ', 'Min sharri ma khalaq', 'from the evil of what He has created,'], ['وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', 'Wa min sharri ghasiqin idha waqab', 'and from the evil of the night when it settles,'], ['وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', 'Wa min sharrin-naffathati fil-\'uqad', 'and from the evil of those who blow on knots,'], ['وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', 'Wa min sharri hasidin idha hasad', 'and from the evil of an envier when he envies.']]],
  ['An-Nas', 114, [['قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Qul a\'udhu bi rabbin-nas', 'Say: I seek refuge in the Lord of mankind,'], ['مَلِكِ النَّاسِ', 'Malikin-nas', 'the King of mankind,'], ['إِلَٰهِ النَّاسِ', 'Ilahin-nas', 'the God of mankind,'], ['مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', 'Min sharril-waswasil-khannas', 'from the evil of the lurking whisperer'], ['الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', 'Alladhi yuwaswisu fi sudurin-nas', 'who whispers into the hearts of people,'], ['مِنَ الْجِنَّةِ وَالنَّاسِ', 'Minal-jinnati wan-nas', 'from among jinn and people.']]],
  ['Al-Kawthar', 108, [['إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', 'Inna a\'taynakal-kawthar', 'We have given you abundant good (al-Kawthar).'], ['فَصَلِّ لِرَبِّكَ وَانْحَرْ', 'Fa salli li rabbika wanhar', 'So pray to your Lord and sacrifice.'], ['إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', 'Inna shani\'aka huwal-abtar', 'Surely the one who hates you is the one cut off.']]],
  ['Al-\'Asr', 103, [['وَالْعَصْرِ', 'Wal-\'asr', 'By time,'], ['إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', 'Innal-insana lafi khusr', 'people are surely in loss,'], ['إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', 'Illal-ladhina amanu wa \'amilus-salihati wa tawasaw bil-haqqi wa tawasaw bis-sabr', 'except those who believe, do good, and urge one another to the truth and to patience.']]],
  ['An-Nasr', 110, [['إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', 'Idha ja\'a nasrullahi wal-fath', 'When Allah\'s help comes, and the victory,'], ['وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', 'Wa ra\'aytan-nasa yadkhuluna fi dinillahi afwaja', 'and you see people entering Allah\'s religion in crowds,'], ['فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', 'Fa sabbih bi hamdi rabbika wastaghfirh, innahu kana tawwaba', 'then glorify the praise of your Lord and ask His forgiveness. He always accepts repentance.']]],
  ['Quraysh', 106, [['لِإِيلَافِ قُرَيْشٍ', 'Li ilafi Quraysh', 'For the security of Quraysh:'], ['إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ', 'Ilafihim rihlatash-shita\'i was-sayf', 'their security in the journeys of winter and summer,'], ['فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ', 'Fal ya\'budu rabba hadhal-bayt', 'let them worship the Lord of this House,'], ['الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ', 'Alladhi at\'amahum min ju\'in wa amanahum min khawf', 'who fed them against hunger and made them safe from fear.']]],
  ['Al-Kafirun', 109, [['قُلْ يَا أَيُّهَا الْكَافِرُونَ', 'Qul ya ayyuhal-kafirun', 'Say: O disbelievers,'], ['لَا أَعْبُدُ مَا تَعْبُدُونَ', 'La a\'budu ma ta\'budun', 'I do not worship what you worship,'], ['وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', 'Wa la antum \'abiduna ma a\'bud', 'nor do you worship what I worship,'], ['وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ', 'Wa la ana \'abidum-ma \'abadtum', 'nor will I worship what you worship,'], ['وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', 'Wa la antum \'abiduna ma a\'bud', 'nor will you worship what I worship.'], ['لَكُمْ دِينُكُمْ وَلِيَ دِينِ', 'Lakum dinukum wa liya din', 'You have your way, and I have mine.']]]
];
const AY = S.flatMap(([n, no, a]) => a.map((x, i) => ({ s: n, no, i: i + 1, of: a.length, ar: x[0], tr: x[1], en: x[2] })));
const BADGES = [[3, 'First steps', '3-day streak'], [7, 'One week', '7-day streak'], [14, 'Steady', '2 weeks'], [30, 'A month with the Quran', '30 days'], [60, 'Habit made', '60 days'], [100, 'Hundred days', '100 days']];
const dk = d => { const l = X.lon(d); return `${l.y}-${String(l.m).padStart(2, '0')}-${String(l.d).padStart(2, '0')}`; };
const addD = (k, n) => { const [y, m, d] = k.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.toISOString().slice(0, 10); };

/* Real Quran recitation with the words lighting up as they are recited.
   Word by word: each word's own clip (quran.com word audio), the colour sweeps across its letters.
   Full ayah: Mishary Alafasy (everyayah.com), each word lit in turn, timed by its length. */
const p3 = n => String(n).padStart(3, '0');
const plain = w => w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').length || 1;
let RA = null, RT = 0;
function stopRecite(node) { RT++; if (RA) { RA.pause(); RA.src = ''; RA = null; } (node ? $$('.ay-ar [data-w]', node) : []).forEach(w => w.classList.remove('say', 'said')); $$('#ayListen,#ayFull').forEach(b => b.classList.remove('on')); }
function recite(node, a, full, btn) {
  const playing = btn.classList.contains('on'); stopRecite(node); if (playing) return;
  try { speechSynthesis.cancel(); } catch (e) {}
  const ws = $$('.ay-ar [data-w]', node), run = ++RT; btn.classList.add('on');
  const done = () => { if (run !== RT) return; ws.forEach(w => w.classList.remove('say')); btn.classList.remove('on'); RA = null; };
  const fail = () => { if (run !== RT) return; done(); toast('Couldn\'t load the recitation. Check your connection.'); };
  if (full) {
    const tot = ws.reduce((s, w) => s + plain(w.textContent), 0);
    RA = new Audio(`https://everyayah.com/data/Alafasy_128kbps/${p3(a.no)}${p3(a.i)}.mp3`);
    RA.ontimeupdate = () => { if (run !== RT || !RA.duration) return; const f = RA.currentTime / (RA.duration * .94); let acc = 0; ws.forEach(w => { const s = acc / tot; acc += plain(w.textContent); const e = acc / tot; w.classList.toggle('said', f >= e); const on = f >= s && f < e; if (on && !w.classList.contains('say')) { w.style.setProperty('--d', ((e - s) * RA.duration * .94).toFixed(2) + 's'); } w.classList.toggle('say', on); }); };
    RA.onended = () => { ws.forEach(w => w.classList.add('said')); done(); }; RA.onerror = fail; RA.play().catch(fail); return;
  }
  let i = 0;
  const next = () => {
    if (run !== RT) return; if (i >= ws.length) { done(); return; }
    const w = ws[i], k = i + 1; ws.forEach((x, n) => { x.classList.toggle('said', n < i); x.classList.remove('say'); });
    RA = new Audio(`https://audio.qurancdn.com/wbw/${p3(a.no)}_${p3(a.i)}_${p3(k)}.mp3`);
    RA.onloadedmetadata = () => { w.style.setProperty('--d', (RA.duration || 1).toFixed(2) + 's'); void w.offsetWidth; w.classList.add('say'); };
    RA.onended = () => { w.classList.remove('say'); w.classList.add('said'); i++; setTimeout(next, 250); };
    RA.onerror = () => { if (i === 0) fail(); else { i++; next(); } };
    RA.play().catch(() => { if (i === 0) fail(); });
  };
  next();
}
addEventListener('hashchange', () => stopRecite());

function state() {
  const s = Object.assign({ learned: 0, log: {}, shields: 0, used: [], pace: 1, best: 0, buddy: null, remind: true, review: {} }, store.get('ayah', {}));
  /* protect the streak with shields for missed days (like a streak freeze), then compute it */
  const today = dk(new Date()), done = k => (s.log[k] || 0) > 0 || s.used.includes(k);
  const keys = Object.keys(s.log).filter(k => s.log[k] > 0).sort(); const last = keys[keys.length - 1];
  if (last && last < addD(today, -1)) { let gap = 0, k = addD(last, 1); while (k < today && gap < 40) { gap++; k = addD(k, 1); } if (gap <= s.shields) { let k2 = addD(last, 1); while (k2 < today) { s.used.push(k2); k2 = addD(k2, 1); } s.shields -= gap; s._saved = gap; } }
  let st = 0, k = done(today) ? today : addD(today, -1); while (done(k)) { st++; k = addD(k, -1); }
  s.streak = st; s.today = today; s.doneToday = (s.log[today] || 0) >= s.pace;
  if (st > s.best) s.best = st;
  return s;
}
const save = s => { const { streak, today, doneToday, _saved, ...keep } = s; store.set('ayah', keep); };

TOOLS.ayah = ['Ayah a day', null, node => {
  let mode = 'read', step = 0;
  const draw = () => {
    const s = state(); save(s);
    const cur = AY[Math.min(s.learned, AY.length - 1)], fin = s.learned >= AY.length;
    const week = Array.from({ length: 7 }, (_, i) => { const k = addD(s.today, i - 6); const on = (s.log[k] || 0) > 0, sh = s.used.includes(k); const wd = new Date(k + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'narrow' }); return `<span class="ay-d ${on ? 'on' : sh ? 'sh' : ''} ${k === s.today ? 'td' : ''}"><i>${on ? '✓' : sh ? IFM_IC('shield') : ''}</i>${wd}</span>`; }).join('');
    const T = X.today(), mg = T.t.maghrib, now = T.now, left = 24 - now;
    const words = cur.ar.split(' ');
    const hidden = i => mode === 'mem' && (step === 2 || (step === 1 && i % 2 === 1));
    const surahDone = AY.slice(0, s.learned).reduce((a, x) => (x.i === x.of ? a.concat(x.s) : a), []);
    const reviewIdx = [s.learned - 2, s.learned - 4, s.learned - 8].filter(i => i >= 0)[0];
    node.innerHTML = `<div class="ay">
      <div class="ay-top"><div class="ay-flame ${s.doneToday ? 'lit' : ''}"><svg viewBox="0 0 48 48"><path d="M24 4c2 8 12 12 12 24a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 6 5 6-1-7 0-12 2-18z" fill="currentColor"/><path d="M24 26c1 3 6 5 6 10a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 0-5 1-7z" fill="#fff" opacity=".6"/></svg><b>${s.streak}</b></div>
        <div><b class="ay-big">${s.streak} day${s.streak === 1 ? '' : 's'}</b><small>${s.doneToday ? 'Done today. See you tomorrow, in sha Allah.' : `Learn today's ayah before midnight to keep it going · ${Math.floor(left)}h ${Math.round(left % 1 * 60)}m left`}</small></div>
        <div class="ay-sh" title="Streak shields"><span>${IFM_IC('shield')} ${s.shields}</span><small>shields</small></div></div>
      ${s._saved ? `<div class="ay-note">Your shield${s._saved > 1 ? 's' : ''} protected your streak for ${s._saved} missed day${s._saved > 1 ? 's' : ''}.</div>` : ''}
      <div class="ay-week">${week}</div>
      ${fin ? `<div class="ay-card"><b>MashaAllah, you've learned all ${AY.length} ayat on this path.</b><p>Keep your streak by revising one surah a day. New paths (Juz Amma, Ayat al-Kursi, the last two ayat of Al-Baqarah) are coming.</p></div>` : `
      <div class="ay-card">
        <div class="ay-meta"><span>${esc(cur.s)} · ayah ${cur.i} of ${cur.of}</span><span>${s.learned + 1} / ${AY.length}</span></div>
        <div class="ay-modes"><button type="button" data-m="read" aria-pressed="${mode === 'read'}">Read</button><button type="button" data-m="mem" aria-pressed="${mode === 'mem'}">Memorise</button></div>
        <p class="ay-ar" lang="ar" dir="rtl">${words.map((w, i) => `<span class="${hidden(i) ? 'hid' : ''}" data-w="${i}">${w}</span>`).join(' ')}</p>
        ${mode === 'mem' ? `<div class="ay-steps">${['Read it 3 times', 'Fill the gaps', 'From memory'].map((t, i) => `<button type="button" data-st="${i}" class="${i === step ? 'on' : i < step ? 'ok' : ''}">${i + 1}. ${t}</button>`).join('')}</div><p class="ay-hint">${step === 0 ? 'Read it aloud three times, looking at the words.' : step === 1 ? 'Every other word is hidden. Say the whole ayah, tap a word to check it.' : 'All words hidden. Recite it, then tap to check.'}</p>` : `<p class="ay-tr">${esc(cur.tr)}</p><p class="ay-en">${esc(cur.en)}</p>`}
        <div class="tk-row"><button class="btn sm ghost" type="button" id="ayListen">${I('speak')}Listen word by word</button><button class="btn sm ghost" type="button" id="ayFull">Full ayah</button>${mode === 'mem' && step < 2 ? `<button class="btn sm" type="button" id="ayNext">Next step</button>` : ''}<button class="btn sm g" type="button" id="ayDone" ${s.doneToday && s.pace === 1 ? 'disabled' : ''}>${s.doneToday ? '✓ Done today' : '✓ I\'ve learned it'}</button></div>
      </div>`}
      ${reviewIdx != null ? `<details class="ay-card ay-rev"><summary><b>Quick review</b><small>${esc(AY[reviewIdx].s)} ${AY[reviewIdx].i}</small></summary><p class="ay-ar sm" lang="ar" dir="rtl">${AY[reviewIdx].ar.split(' ').map(w => `<span class="hid" data-w>${w}</span>`).join(' ')}</p><p class="ay-hint">Recite it, then tap the words to check.</p><div class="tk-row"><button class="btn sm g" type="button" data-rv="1">I remembered</button><button class="btn sm ghost" type="button" data-rv="0">Needs practice</button></div></details>` : ''}
      <div class="ay-sec">Challenge a friend</div>
      ${s.buddy ? `<div class="ay-card ay-buddy"><div class="ay-meta"><span>You & ${esc(s.buddy.name)}</span><span>Day ${Math.min(30, Math.max(1, Math.round((new Date(s.today) - new Date(s.buddy.start)) / 864e5) + 1))} of 30</span></div><p>Send your tick each day; they send theirs. Keep the chain going together.</p><div class="tk-row"><a class="btn sm g" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Ayah a day, day ${s.streak}${s.doneToday ? ' done' : ''}: ${cur.s} ${cur.i}. Your turn, ${s.buddy.name}! (Inspire FM app)`)}">${I('whatsapp')}Send my tick</a><button class="btn sm ghost" type="button" id="ayEnd">End challenge</button></div></div>`
        : `<div class="ay-card"><p style="margin-top:0">Learning with someone makes you far more likely to keep going. Invite a friend, your spouse or your kids to a 30-day challenge.</p><div class="tk-2"><input id="ayMe" placeholder="Your name" value="${esc(store.get('ayName', ''))}"><input id="ayFr" placeholder="Friend's name"></div><div class="tk-row" style="margin-top:8px"><button class="btn sm g" type="button" id="ayInv">${I('whatsapp')}Invite on WhatsApp</button><button class="btn sm ghost" type="button" id="ayJoin">I have a code</button></div></div>`}
      <div class="ay-sec">Your goal</div>
      <div class="tk-seg" id="ayPace">${[[1, '1 ayah a day'], [2, '2 a day'], [3, '3 a day']].map(([v, t]) => `<button type="button" data-p="${v}" aria-pressed="${s.pace === v}">${t}</button>`).join('')}</div>
      <div class="ay-sec">Badges</div>
      <div class="ay-badges">${BADGES.map(([n, t, d]) => `<div class="ay-b ${s.best >= n ? 'on' : ''}"><i>${n}</i><b>${t}</b><small>${d}</small></div>`).join('')}${S.map(([n]) => `<div class="ay-b sura ${surahDone.includes(n) ? 'on' : ''}"><i>✓</i><b>${esc(n)}</b><small>Surah learned</small></div>`).join('')}</div>
      <p class="notice">Shields: earn one for every 7 days in a row (you can hold 2). If you miss a day, a shield keeps your streak safe. Arabic text to be checked by Inspire FM's scholars before launch.</p></div>`;
    $$('[data-m]', node).forEach(b => b.onclick = () => { mode = b.dataset.m; step = 0; draw(); });
    $$('[data-st]', node).forEach(b => b.onclick = () => { step = +b.dataset.st; draw(); });
    $$('.ay-ar [data-w]', node).forEach(w => w.onclick = () => w.classList.toggle('hid'));
    const nx = $('#ayNext'); if (nx) nx.onclick = () => { step++; draw(); };
    const ls = $('#ayListen'); if (ls) ls.onclick = () => recite(node, cur, false, ls);
    const fl = $('#ayFull'); if (fl) fl.onclick = () => recite(node, cur, true, fl);
    const dn = $('#ayDone'); if (dn) dn.onclick = () => { const s2 = state(); if ((s2.log[s2.today] || 0) >= s2.pace) return; s2.log[s2.today] = (s2.log[s2.today] || 0) + 1; s2.learned = Math.min(AY.length, s2.learned + 1); const s3 = Object.assign(s2, {}); const before = s3.streak; save(s3); const s4 = state(); if (s4.streak > before && s4.streak % 7 === 0 && s4.shields < 2) { s4.shields++; save(s4); toast('7 days! You earned a streak shield'); } else toast(s4.doneToday ? `Day ${s4.streak} done. MashaAllah!` : 'Nice. One more for today\'s goal.'); if (navigator.vibrate) navigator.vibrate([10, 40, 10]); X.burst(); mode = 'read'; step = 0; draw(); };
    $$('[data-rv]', node).forEach(b => b.onclick = () => { toast(b.dataset.rv === '1' ? 'MashaAllah, well remembered' : 'It\'ll come back in your next review'); b.closest('details').open = false; });
    $$('#ayPace button', node).forEach(b => b.onclick = () => { const s2 = state(); s2.pace = +b.dataset.p; save(s2); draw(); });
    const inv = $('#ayInv'); if (inv) inv.onclick = () => { const me = $('#ayMe').value.trim(), fr = $('#ayFr').value.trim(); if (!me || !fr) { toast('Add both names'); return; } store.set('ayName', me); const s2 = state(); s2.buddy = { name: fr, start: s2.today }; save(s2); const code = btoa(unescape(encodeURIComponent(me + '|' + s2.today))).replace(/=+$/, ''); open(`https://wa.me/?text=${encodeURIComponent(`Salaam ${fr}! Join my 30-day Ayah a Day challenge on the Inspire FM app. One ayah a day, we keep each other going. Open Toolbox → Ayah a day → "I have a code" and enter: ${code}`)}`, '_blank'); draw(); };
    const jn = $('#ayJoin'); if (jn) jn.onclick = () => { const c = prompt('Enter your friend\'s code'); if (!c) return; try { const [n, st] = decodeURIComponent(escape(atob(c.trim()))).split('|'); if (!n || !/^\d{4}-\d\d-\d\d$/.test(st)) throw 0; const s2 = state(); s2.buddy = { name: n, start: st }; save(s2); toast(`Challenge with ${n} started`); draw(); } catch (e) { toast('That code didn\'t work. Check it and try again.'); } };
    const en = $('#ayEnd'); if (en) en.onclick = () => { const s2 = state(); s2.buddy = null; save(s2); draw(); };
  };
  draw();
}];

/* status on the Toolbox icon and the home screen */
const upd = () => { const s = state(); const t = $('#tbAyS'); if (t) t.innerHTML = s.doneToday ? `${IFM_IC('flame')} ${s.streak} · done` : s.streak ? `${IFM_IC('flame')} ${s.streak} · learn today's` : 'Start a streak'; const h = $('#ahAyah'); if (h) h.innerHTML = `<span class="ay-flame sm ${s.doneToday ? 'lit' : ''}"><svg viewBox="0 0 48 48"><path d="M24 4c2 8 12 12 12 24a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 6 5 6-1-7 0-12 2-18z" fill="currentColor"/></svg><b>${s.streak}</b></span><span><small>Ayah a day</small><b>${s.doneToday ? 'Done today, mashaAllah' : 'Today\'s ayah: ' + esc(AY[Math.min(s.learned, AY.length - 1)].s) + ' ' + AY[Math.min(s.learned, AY.length - 1)].i}</b><em>${s.doneToday ? 'Come back tomorrow to keep your streak' : 'Learn it before midnight to keep your streak'}</em></span>`; };
setTimeout(upd, 50); setInterval(upd, 60000); addEventListener('hashchange', () => setTimeout(upd, 50));
})();
