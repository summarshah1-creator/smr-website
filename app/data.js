/* Inspire FM site content.
   Everything a member of staff would normally change lives in this file (on WordPress these become
   custom post types: shows, schedule slots, events, duas, partners, appeals, packages).
   PREVIEW NOTE: the programme line-up below is a placeholder until the station's real schedule is loaded. */
window.IFM = {
  push: null, /* live site: { server: 'https://inspirefm.org/api/push/subscribe', vapid: '<public VAPID key>' } turns on alerts when the app is closed */
  eidOpen: false, /* flip to true when Inspire Eid 2027 is announced: unlocks stall, sponsor, volunteer and voucher bookings */
  stream: 'https://listen-inspirefm.sharp-stream.com/inspirefm.mp3',
  phone: '01582 481810', studio: '01582 481822', whatsapp: '447779481822', whatsappLabel: '07779 481822',
  email: 'info@inspirefm.org', address: '234 Dallow Road, Luton LU1 1TB',
  social: {
    instagram: 'https://www.instagram.com/inspirefmluton/', facebook: 'https://www.facebook.com/inspirefmluton/',
    youtube: 'https://www.youtube.com/@inspirefmluton', x: 'https://twitter.com/InspireFMLuton',
    linkedin: 'https://linkedin.com/company/inspirefm', mixcloud: 'https://www.mixcloud.com/InspireFMLuton/',
    tiktok: 'https://www.tiktok.com/@inspirefmluton'
  },

  /* ---------- Shows ---------- */
  shows: {
    fajr:    { n: 'Fajr & Morning Adhkar', p: ['Sheikh Al-Sudais'], c: 'Faith', d: 'Quran recitation, morning remembrance and a gentle start to the day.', img: 'img/shows/fajr.webp', g: ['#1d2d28', '#a4a3a1'] },
    bfast:   { n: 'Inspire Breakfast', p: ['Brother Tariq'], c: 'Talk', d: 'News, weather, travel and community shout-outs for Luton on the move.', img: 'img/shows/wbfast.webp', g: ['#a4a3a1', '#486449'] },
    wbfast:  { n: 'Weekend Breakfast', p: ['Sister Sadia'], c: 'Talk', d: 'A slower start: family chat, local stories and your requests.', img: 'img/shows/wbfast.webp', g: ['#abba90', '#577455'] },
    comm:    { n: 'Community Matters', p: ['Laura Conder', 'Dr Abu Bakr Cooper'], c: 'Community', d: 'Charities, councillors, schools and local heroes in the studio.', img: 'img/shows/comm.webp', g: ['#364c52', '#99b7b3'] },
    biz:     { n: 'The Business Hour', p: ['Summar Shah'], c: 'Community', d: 'Local businesses, start-ups and halal finance explained simply.', img: 'img/shows/pod-money.webp', g: ['#30333a', '#a4a3a1'] },
    midday:  { n: 'Midday Reflections', p: ['Azad Khan'], c: 'Faith', d: 'A short tafsir, a hadith and a moment to pause in the middle of the day.', img: 'img/shows/midday.webp', g: ['#413d4d', '#d5d1e6'] },
    jummah:  { n: 'Jummah Special', p: ['Abdul Akbar', 'Zaffar Iqbal'], c: 'Faith', d: 'Friday reminders, Jummah times across Luton and the week\'s appeal.', img: 'img/shows/pod-jummah.webp', g: ['#1d2d28', '#bbb191'] },
    family:  { n: 'Family Hour', p: ['Sister Naveed'], c: 'Family', d: 'Parenting, health, education and the questions families actually ask.', img: 'img/shows/family.webp', g: ['#624b46', '#d6bfb3'] },
    health:  { n: 'Health & Wellbeing', p: ['Sister Shigufta'], c: 'Family', d: 'GPs, pharmacists and counsellors answering your questions live.', img: 'img/shows/health.webp', g: ['#3c4d5c', '#b6cbd8'] },
    women:   { n: 'Sisters\' Circle', p: ['Sister Neelum'], c: 'Family', d: 'Women\'s voices from across Luton: faith, work, wellbeing and community.', img: 'img/shows/pod-sisters.webp', g: ['#493441', '#ddc1cd'] },
    drive:   { n: 'Drive Time', p: ['Waj'], c: 'Talk', d: 'Travel, the day\'s talking points and the best nasheeds for the journey home.', img: 'img/shows/drive.webp', g: ['#222324', '#a4a3a1'] },
    youth:   { n: 'Youth Zone', p: ['Khaleel Muhammed', 'Sister Fiza'], c: 'Youth', d: 'Young presenters, exam tips, careers and what\'s on for under-25s.', img: 'img/shows/pod-exams.webp', g: ['#463b5c', '#a4a3a1'] },
    scholar: { n: 'Scholars\' Corner', p: ['Imaam Muaaz Vahora', 'Brother Saber Mahtay'], c: 'Faith', d: 'In-depth talks and your questions answered by local imams and scholars.', img: 'img/shows/scholar.webp', g: ['#212630', '#ab8f62'] },
    seerah:  { n: 'Seerah Stories', p: ['Yasir Qadhi'], c: 'Faith', d: 'The life of the Prophet ﷺ, told for the whole family.', img: 'img/shows/seerah.webp', g: ['#344045', '#c0b393'] },
    sport:   { n: 'Sports Talk', p: ['Saad Tabani', 'Hasanayn, Hassaan & Haroon'], c: 'Talk', d: 'Grassroots football, cricket and boxing from Luton\'s clubs.', img: 'img/shows/sport.webp', g: ['#32333b', '#a4a3a1'] },
    nasheed: { n: 'Spiritual Nasheeds', p: ['Brother Mehroz Gul'], c: 'Music', d: 'Your favourite spiritual nasheeds to keep you company late at night.', img: 'img/shows/nasheed.webp', g: ['#181b20', '#a4a3a1'] },
    speakers: { n: 'Speaker\'s Corner', p: ['Michael Doward'], c: 'Talk', d: 'A heartfelt and honest podcast that shines a light on the issues affecting Muslims today.', pod: 1, logo: 1, img: 'img/shows/pod-speakers.webp', g: ['#16171f', '#3a3c4c'] },
    urbankube: { n: 'Urban Kube', p: ['Sister Shemiza'], c: 'Community', d: 'Arts and culture: creatives from Luton and around the world, lively discussions and inspiring interviews.', pod: 1, logo: 1, img: 'img/shows/pod-urbankube.webp', g: ['#17131d', '#2f273d'] },
    mothers: { n: 'Mothers Planet', p: ['Sister Neelum'], c: 'Family', d: 'A good old chin-wag about motherhood: parenting, the home and family life.', pod: 1, logo: 1, img: 'img/shows/pod-mothers.webp', g: ['#3b2932', '#6e4f5c'] },
    nightq:  { n: 'Night Quran', p: ['Mishary Alafasy'], c: 'Faith', d: 'Uninterrupted recitation through the night until Fajr.', img: 'img/shows/nightq.webp', g: ['#121519', '#76918e'] }
  },
  /* [startHour, endHour, showId] by day (0 = Sunday). Times in UK time. */
  week: (() => {
    const wk = [
      [[1,5,'nightq'],[5,7,'fajr'],[7,10,'bfast'],[10,12,'comm'],[12,13,'midday'],[13,14,'health'],[14,16,'family'],[16,19,'drive'],[19,20,'sport'],[20,22,'scholar'],[22,23,'midday'],[23,25,'nasheed']],
    ];
    const mon = wk[0];
    const tue = mon.map(s => s[2] === 'sport' ? [19,20,'youth'] : s[2] === 'health' ? [13,14,'health'] : s);
    const wed = mon.map(s => s[2] === 'comm' ? [10,11,'biz'] : s).concat([]);
    wed.splice(4, 0, [11,12,'comm']);
    const thu = tue;
    const fri = [[1,5,'nightq'],[5,7,'fajr'],[7,10,'bfast'],[10,12,'comm'],[12,14,'jummah'],[14,16,'family'],[16,19,'drive'],[19,20,'youth'],[20,22,'scholar'],[22,23,'midday'],[23,25,'nasheed']];
    const sat = [[1,5,'nightq'],[5,7,'fajr'],[7,10,'wbfast'],[10,13,'women'],[13,15,'family'],[15,17,'sport'],[17,19,'youth'],[19,22,'scholar'],[22,23,'midday'],[23,25,'nasheed']];
    const sun = [[1,5,'nightq'],[5,7,'fajr'],[7,10,'wbfast'],[10,12,'comm'],[12,14,'family'],[14,16,'health'],[16,18,'drive'],[18,20,'seerah'],[20,22,'scholar'],[22,23,'midday'],[23,25,'nasheed']];
    return [sun, mon, tue, wed, thu, fri, sat];
  })(),

  /* ---------- Podcasts & catch-up (on the live site these come in automatically from Mixcloud / YouTube RSS) ---------- */
  pods: [
    { t: 'The Truth United', s: 'speakers', len: '52 min', c: 'Talk', ds: '2025-11-18', date: '18 Nov 2025', gu: [], d: 'The latest episode of Speaker\'s Corner.', url: 'https://share.transistor.fm/s/3e15eaff', mp3: 'https://media.transistor.fm/3e15eaff/13ac6e9d.mp3' },
    { t: 'Flags, Identity and Division', s: 'speakers', len: '52 min', c: 'Talk', ds: '2025-09-02', date: '2 Sep 2025', gu: [], d: 'Union Jack and St George\'s flags: do they unite or divide?', url: 'https://share.transistor.fm/s/100700cc', mp3: 'https://media.transistor.fm/100700cc/489ad783.mp3' },
    { t: 'Are Muslims Good for Britain?', s: 'speakers', len: '51 min', c: 'Talk', ds: '2025-08-20', date: '20 Aug 2025', gu: ['Jordan M'], d: 'Muslims\' contribution to British history, culture, the economy and community life.', url: 'https://share.transistor.fm/s/195082b3', mp3: 'https://media.transistor.fm/195082b3/57e7acd2.mp3' },
    { t: 'Futures in Film', s: 'speakers', len: '48 min', c: 'Talk', ds: '2025-08-06', date: '6 Aug 2025', gu: ['Rizwan Wadan'], d: 'Careers in film, authentic storytelling and how Muslims can get into the industry.', url: 'https://share.transistor.fm/s/dd32c92e', mp3: 'https://media.transistor.fm/dd32c92e/77bcd56c.mp3' },
    { t: 'Parenting in the Age of Balloons', s: 'speakers', len: '52 min', c: 'Family', ds: '2025-07-30', date: '30 Jul 2025', gu: ['Abu Siddiq'], d: 'Nitrous oxide among young people, and what parents and the community can do.', url: 'https://share.transistor.fm/s/9389c93d', mp3: 'https://media.transistor.fm/9389c93d/c2a0ffc1.mp3' },
    { t: 'Inspiring The Youth', s: 'speakers', len: '52 min', c: 'Youth', ds: '2025-07-28', date: '28 Jul 2025', gu: ['Paul Webb', 'Kay Prosper'], d: 'Two boxing mentors on discipline, resilience and positive role models.', url: 'https://share.transistor.fm/s/e2620393', mp3: 'https://media.transistor.fm/e2620393/50e753dd.mp3' },
    { t: 'Social Media for Business & Da\'wah', s: 'speakers', len: '52 min', c: 'Business', ds: '2025-07-28', date: '28 Jul 2025', gu: ['Ben Iqra'], d: 'Building faith-driven online businesses and using social media for da\'wah.', url: 'https://share.transistor.fm/s/82f6ed35', mp3: 'https://media.transistor.fm/82f6ed35/41bef9a2.mp3' },
    { t: 'The Hajj Odyssey', s: 'urbankube', len: 'Episode', c: 'Community', ds: '2025-01-27', date: '27 Jan 2025', gu: ['Abdul Wahid'], d: 'The Amir of Eternal Impact Challengers on sailing from London to Makkah.', url: 'https://podcasts.apple.com/us/podcast/id1453414275' },
    { t: 'In conversation with Farah Soobhan', s: 'urbankube', len: 'Episode', c: 'Community', ds: '2024-12-24', date: '24 Dec 2024', gu: ['Farah Soobhan'], d: 'Teacher, artist and trainee counsellor on making counselling more accessible.', url: 'https://podcasts.apple.com/us/podcast/id1453414275' },
    { t: 'In conversation with Axa Riaz', s: 'urbankube', len: 'Episode', c: 'Community', ds: '2024-12-17', date: '17 Dec 2024', gu: ['Axa Riaz', 'Sherbano'], d: 'Animal rescue and care, and how local people can help.', url: 'https://podcasts.apple.com/us/podcast/id1453414275' },
    { t: 'Safe at Home', s: 'mothers', len: 'Episode', c: 'Family', date: '', gu: ['Elaine (Safe at Home)', 'Christine (Flying Start Luton)'], d: 'How to protect your little ones from hazards in the home.', url: 'https://tunein.com/podcasts/p1768780' }
  ],
  /* Watch: reels (Instagram / TikTok) and YouTube. Add the post URL; the live site pulls the thumbnail. */
  /* Reels: on the live site these come from the Instagram Graph API (the account's own reels, cached by the site
     every hour) so they play natively, muted, as they scroll into view. The clips below are preview stand-ins. */
  /* Latest reels from instagram.com/inspirefmluton.
     reelFeed: JSON feed URL of the account (Behold.so etc.) = newest reels appear by themselves.
     reels: or paste reel links (Share > Copy link), newest first: { ig: 'https://www.instagram.com/reel/XXXX/', t: 'caption' } */
  reelFeed: '',
  reels: [],
  videos: [
    { t: 'Inspire FM: nearly 30 years of positively inspiring the community', c: 'Station', len: '6:12' },
    { t: 'Jummah khutbah: kindness to neighbours', c: 'Faith', len: '24:05' },
    { t: 'Community Matters live: Luton Foodbank', c: 'Community', len: '31:40' },
    { t: 'Inspire Eid highlights', c: 'Events', len: '4:18' },
    { t: 'Interview: young carers in Luton', c: 'Interviews', len: '15:22' },
    { t: 'Ramadan reminders: day one', c: 'Ramadan', len: '9:51' }
  ],

  /* ---------- Events & campaigns ---------- */
  events: [
    { id: 'jwa', t: 'Jummah Winter Appeal', when: 'Every Friday, 9 Oct – 25 Dec 2026', start: '2026-10-09', end: '2026-12-25', where: 'Masjids across Luton', c: 'Appeal', d: 'Bucket collections at Jummah for Luton Foodbank, matched by Human Appeal. £20 feeds someone for three days.', cta: ['Donate', 'give'], hue: '#90605b' },
    { id: 'iam', t: 'Islamophobia Awareness Month', when: 'November 2026', start: '2026-11-01', end: '2026-11-30', where: 'On air & across Luton', c: 'Campaign', d: 'Stories, advice and where to report it. Know your rights and look out for each other.', cta: ['Get support', 'help'], hue: '#493441' },
    { id: 'ramadan', t: 'Ramadan 1448', when: 'Expected from about 8 Feb 2027', start: '2027-02-08', end: '2027-03-09', where: 'Inspire FM 105.1', c: 'Seasonal', d: 'Daily timetable, iftar shout-outs, live taraweeh reminders and the Let\'s Eat Together campaign.', cta: ['Ramadan hub', 'seasons'], hue: '#212630' },
    { id: 'let', t: 'Let\'s Eat Together 2027', when: 'Ramadan 2027', start: '2027-02-08', end: '2027-03-09', where: 'Schools & community groups, Luton', c: 'Campaign', d: 'Luton Foodbank\'s Ramadan campaign with Inspire FM: host an iftar, run a fasting challenge, feed families.', cta: ['Find out more', 'give'], hue: '#7b6d51' },
    { id: 'bigiftar', t: 'The Big Iftar Luton', when: 'Ramadan 2027', start: '2027-02-20', end: '2027-02-20', where: 'Luton town centre', c: 'Community', d: 'A town-wide open iftar with Connect4Causes. Everyone welcome, whatever your faith.', cta: ['Register interest', 'contact'], hue: '#577455' },
    { id: 'eid', t: 'Inspire Eid 2027', when: 'Spring 2027 · date to be confirmed', start: '2027-03-10', end: '2027-03-11', where: 'Luton', c: 'Festival', d: 'The family Eid festival: funfair, food, stalls and stage. Bookings open as soon as the date is announced.', cta: ['Get notified', 'eid'], hue: '#a4a3a1' }
  ],

  /* ---------- Duas (Arabic text to be checked by the station's scholars before launch) ---------- */
  duaCats: [['worry', 'Worry & anxiety'], ['hardship', 'Hardship'], ['rizq', 'Rizq & work'], ['protection', 'Protection'], ['illness', 'Illness'], ['family', 'Family'], ['forgive', 'Forgiveness'], ['daily', 'Every day']],
  duas: [
    { c: 'worry', t: 'For worry and grief', ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', tr: 'Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa ḍalaʿid-dayni wa ghalabatir-rijāl', en: 'O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by others.', src: 'Sahih al-Bukhari 6369' },
    { c: 'worry', t: 'When everything feels too much', ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', tr: 'Ḥasbunallāhu wa niʿmal-wakīl', en: 'Allah is sufficient for us, and He is the best disposer of affairs.', src: 'Qur\'an 3:173' },
    { c: 'hardship', t: 'The dua of Yunus (AS) in distress', ar: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', tr: 'Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn', en: 'There is no god but You. Glory be to You. Truly, I have been among the wrongdoers.', src: 'Qur\'an 21:87' },
    { c: 'hardship', t: 'When something feels impossible', ar: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', tr: 'Allāhumma lā sahla illā mā jaʿaltahu sahlā, wa anta tajʿalul-ḥazna idhā shiʾta sahlā', en: 'O Allah, nothing is easy except what You make easy, and You make the difficult easy if You will.', src: 'Ibn Hibban 974' },
    { c: 'rizq', t: 'For beneficial knowledge and good provision', ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا', tr: 'Allāhumma innī asʾaluka ʿilman nāfiʿā, wa rizqan ṭayyibā, wa ʿamalan mutaqabbalā', en: 'O Allah, I ask You for beneficial knowledge, good provision and deeds that are accepted.', src: 'Sunan Ibn Majah 925' },
    { c: 'rizq', t: 'For enough, without needing others', ar: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', tr: 'Allāhummak-finī bi-ḥalālika ʿan ḥarāmik, wa aghninī bi-faḍlika ʿamman siwāk', en: 'O Allah, let what is lawful be enough for me instead of what is unlawful, and make me independent of all besides You by Your grace.', src: 'Jami\' at-Tirmidhi 3563' },
    { c: 'protection', t: 'Morning and evening protection (three times)', ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', tr: 'Bismillāhil-ladhī lā yaḍurru maʿasmihī shayʾun fil-arḍi wa lā fis-samāʾ, wa huwas-samīʿul-ʿalīm', en: 'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.', src: 'Abu Dawud 5088 · Tirmidhi 3388' },
    { c: 'protection', t: 'Leaving the house', ar: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'Bismillāh, tawakkaltu ʿalallāh, wa lā ḥawla wa lā quwwata illā billāh', en: 'In the name of Allah. I place my trust in Allah. There is no might and no power except with Allah.', src: 'Abu Dawud 5095' },
    { c: 'illness', t: 'For someone who is unwell', ar: 'أَذْهِبِ الْبَأْسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا', tr: 'Adh-hibil-baʾs, Rabban-nās, washfi antash-Shāfī, lā shifāʾa illā shifāʾuk, shifāʾan lā yughādiru saqamā', en: 'Remove the harm, Lord of mankind, and heal, for You are the Healer. There is no healing but Yours, a healing that leaves no illness behind.', src: 'Sahih al-Bukhari 5743' },
    { c: 'illness', t: 'When visiting the sick', ar: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ', tr: 'Lā baʾs, ṭahūrun in shāʾ Allāh', en: 'No harm, it is a purification, if Allah wills.', src: 'Sahih al-Bukhari 3616' },
    { c: 'family', t: 'For your spouse and children', ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', tr: 'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyunin wajʿalnā lil-muttaqīna imāmā', en: 'Our Lord, grant us from our spouses and children the coolness of our eyes, and make us leaders of the God-conscious.', src: 'Qur\'an 25:74' },
    { c: 'family', t: 'For your parents', ar: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', tr: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā', en: 'My Lord, have mercy on them both as they raised me when I was small.', src: 'Qur\'an 17:24' },
    { c: 'forgive', t: 'Sayyid al-Istighfar: the best way to ask forgiveness', ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', tr: 'Allāhumma anta Rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mastaṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abūʾu laka bi-niʿmatika ʿalayy, wa abūʾu bi-dhanbī faghfir lī, fa-innahū lā yaghfirudh-dhunūba illā ant', en: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.', src: 'Sahih al-Bukhari 6306' },
    { c: 'forgive', t: 'Good in this life and the next', ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', tr: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār', en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.', src: 'Qur\'an 2:201' },
    { c: 'daily', t: 'Before sleeping', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', tr: 'Bismika Allāhumma amūtu wa aḥyā', en: 'In Your name, O Allah, I die and I live.', src: 'Sahih al-Bukhari 6324' },
    { c: 'daily', t: 'On waking up', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', tr: 'Al-ḥamdu lillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr', en: 'All praise is for Allah who gave us life after causing us to die, and to Him is the return.', src: 'Sahih al-Bukhari 6324' },
    { c: 'daily', t: 'For more knowledge', ar: 'رَبِّ زِدْنِي عِلْمًا', tr: 'Rabbi zidnī ʿilmā', en: 'My Lord, increase me in knowledge.', src: 'Qur\'an 20:114' }
  ],

  /* ---------- Quran: surah list (name, English, ayahs) ---------- */
  surahs: 'Al-Fatihah|The Opening|7;Al-Baqarah|The Cow|286;Aal-Imran|The Family of Imran|200;An-Nisa|The Women|176;Al-Ma\'idah|The Table Spread|120;Al-An\'am|The Cattle|165;Al-A\'raf|The Heights|206;Al-Anfal|The Spoils of War|75;At-Tawbah|The Repentance|129;Yunus|Jonah|109;Hud|Hud|123;Yusuf|Joseph|111;Ar-Ra\'d|The Thunder|43;Ibrahim|Abraham|52;Al-Hijr|The Rocky Tract|99;An-Nahl|The Bee|128;Al-Isra|The Night Journey|111;Al-Kahf|The Cave|110;Maryam|Mary|98;Ta-Ha|Ta-Ha|135;Al-Anbiya|The Prophets|112;Al-Hajj|The Pilgrimage|78;Al-Mu\'minun|The Believers|118;An-Nur|The Light|64;Al-Furqan|The Criterion|77;Ash-Shu\'ara|The Poets|227;An-Naml|The Ant|93;Al-Qasas|The Stories|88;Al-\'Ankabut|The Spider|69;Ar-Rum|The Romans|60;Luqman|Luqman|34;As-Sajdah|The Prostration|30;Al-Ahzab|The Combined Forces|73;Saba|Sheba|54;Fatir|Originator|45;Ya-Sin|Ya Sin|83;As-Saffat|Those Who Set the Ranks|182;Sad|The Letter Sad|88;Az-Zumar|The Troops|75;Ghafir|The Forgiver|85;Fussilat|Explained in Detail|54;Ash-Shura|The Consultation|53;Az-Zukhruf|The Ornaments of Gold|89;Ad-Dukhan|The Smoke|59;Al-Jathiyah|The Crouching|37;Al-Ahqaf|The Wind-Curved Sandhills|35;Muhammad|Muhammad|38;Al-Fath|The Victory|29;Al-Hujurat|The Rooms|18;Qaf|The Letter Qaf|45;Adh-Dhariyat|The Winnowing Winds|60;At-Tur|The Mount|49;An-Najm|The Star|62;Al-Qamar|The Moon|55;Ar-Rahman|The Most Merciful|78;Al-Waqi\'ah|The Inevitable|96;Al-Hadid|The Iron|29;Al-Mujadila|The Pleading Woman|22;Al-Hashr|The Exile|24;Al-Mumtahanah|She That Is to Be Examined|13;As-Saff|The Ranks|14;Al-Jumu\'ah|Friday|11;Al-Munafiqun|The Hypocrites|11;At-Taghabun|Mutual Disillusion|18;At-Talaq|Divorce|12;At-Tahrim|The Prohibition|12;Al-Mulk|The Sovereignty|30;Al-Qalam|The Pen|52;Al-Haqqah|The Reality|52;Al-Ma\'arij|The Ascending Stairways|44;Nuh|Noah|28;Al-Jinn|The Jinn|28;Al-Muzzammil|The Enshrouded One|20;Al-Muddaththir|The Cloaked One|56;Al-Qiyamah|The Resurrection|40;Al-Insan|Man|31;Al-Mursalat|The Emissaries|50;An-Naba|The Tidings|40;An-Nazi\'at|Those Who Drag Forth|46;\'Abasa|He Frowned|42;At-Takwir|The Overthrowing|29;Al-Infitar|The Cleaving|19;Al-Mutaffifin|The Defrauding|36;Al-Inshiqaq|The Sundering|25;Al-Buruj|The Mansions of the Stars|22;At-Tariq|The Nightcommer|17;Al-A\'la|The Most High|19;Al-Ghashiyah|The Overwhelming|26;Al-Fajr|The Dawn|30;Al-Balad|The City|20;Ash-Shams|The Sun|15;Al-Layl|The Night|21;Ad-Duha|The Morning Hours|11;Ash-Sharh|The Relief|8;At-Tin|The Fig|8;Al-\'Alaq|The Clot|19;Al-Qadr|The Power|5;Al-Bayyinah|The Clear Proof|8;Az-Zalzalah|The Earthquake|8;Al-\'Adiyat|The Courser|11;Al-Qari\'ah|The Calamity|11;At-Takathur|The Rivalry in World Increase|8;Al-\'Asr|The Declining Day|3;Al-Humazah|The Traducer|9;Al-Fil|The Elephant|5;Quraysh|Quraysh|4;Al-Ma\'un|The Small Kindnesses|7;Al-Kawthar|The Abundance|3;Al-Kafirun|The Disbelievers|6;An-Nasr|The Divine Support|3;Al-Masad|The Palm Fibre|5;Al-Ikhlas|The Sincerity|4;Al-Falaq|The Daybreak|5;An-Nas|Mankind|6',
  quranFeatured: [
    { n: 'Al-Fatihah', s: 1, ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
    { n: 'Al-Ikhlas', s: 112, ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ' },
    { n: 'Al-Falaq', s: 113, ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ' },
    { n: 'An-Nas', s: 114, ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ' }
  ],

  /* ---------- Charity & partners ---------- */
  appeal: { t: 'Jummah Winter Appeal', sub: 'for Luton Foodbank', target: 15000, raised: 0, match: 'Human Appeal will match every pound you donate.', url: 'https://www.justgiving.com/page/inspire-fm-winter-campaign', tag: '#LetsFeedLutonTogether', parcel: 20, days: 3, family: 70, end: '2026-12-25' },
  /* logo: file, or null for a clean wordmark until the logo file is added */
  partners: [
    { n: 'Luton Foodbank', logo: 'img/p/luton-foodbank.webp', k: 'Charity', url: 'https://luton.foodbank.org.uk/', d: 'Feeding families in crisis across Luton. Our winter and Ramadan appeals support their work.' },
    { n: 'Human Appeal', logo: 'img/p/human-appeal.svg', k: 'Charity', url: 'https://humanappeal.org.uk', d: 'Matching donations to the Jummah Winter Appeal.' },
    { n: 'The Big Iftar Luton', logo: 'img/p/big-iftar.webp', k: 'Community', url: 'https://www.connect4causes.org.uk/', d: 'A town-wide open iftar run with Connect4Causes.' },
    { n: 'Discover Islam', logo: 'img/p/discover-islam.webp', k: 'Community', url: 'https://discoverislam.co.uk', d: 'Education and community support in Luton.' },
    { n: 'Families Relief', logo: null, k: 'Charity', url: 'https://www.familiesrelief.org.uk/', d: 'International relief and development charity.' },
    { n: 'One Ummah', logo: null, k: 'Charity', url: 'https://oneummah.org.uk/donate-now/', d: 'Humanitarian aid for people in need.' },
    { n: 'Aghosh UK', logo: null, k: 'Charity', url: 'https://aghoshuk.org/donate-now/', d: 'Supporting orphans through care and education.' },
    { n: 'UKIM', logo: null, k: 'Charity', url: 'https://www.ukim.org/', d: 'UK Islamic Mission, serving communities across Britain.' },
    { n: 'KORT', logo: null, k: 'Charity', url: 'https://kort.org.uk/', d: 'Kashmir Orphan Relief Trust.' },
    { n: 'Community Interest Luton', logo: null, k: 'Community', url: 'https://ciluton.co.uk/', d: 'Local community interest organisation.' },
    { n: 'CTP', logo: 'img/p/ctp.webp', k: 'Business', url: 'https://ctportal.org/', d: 'Trusted partner.' },
    { n: 'Hannah Solicitors', logo: 'img/p/hannah.webp', k: 'Business', url: 'https://www.hannahsolicitors.co.uk/', d: 'Legal services, Luton.' },
    { n: 'Woolfe & Co', logo: null, k: 'Business', url: 'https://www.woolfelaw.com/', d: 'Solicitors.' },
    { n: 'Butt Solicitors', logo: null, k: 'Business', url: '', d: 'Solicitors.' },
    { n: 'University of Bedfordshire', logo: null, k: 'Education', url: 'https://www.beds.ac.uk/', d: 'Local university partner.' },
    { n: 'Chiltern Learning Trust', logo: 'img/p/chiltern.webp', k: 'Education', url: 'https://chilternlearningtrust.org/', d: 'Inspire Eid sponsor.' },
    { n: 'Barnfield College', logo: 'img/p/barnfield.webp', k: 'Education', url: 'https://www.barnfield.ac.uk/', d: 'Inspire Eid festival partner.' },
    { n: 'AA Carpets & Furniture', logo: 'img/p/aa-carpets.webp', k: 'Business', url: '', d: 'Inspire Eid sponsor.' }
  ],

  /* ---------- Advertising ---------- */
  packages: [
    { id: 'spot', n: 'Radio spots', d: '30-second adverts across the day, written and voiced for you if you need it.', inc: ['Script & voice-over help', 'Peak and off-peak slots', 'Weekly or monthly runs'] },
    { id: 'spons', n: 'Show sponsorship', d: '"Brought to you by…" on a show your customers already love.', inc: ['On-air credits each show', 'Logo on the show page', 'Social mentions'] },
    { id: 'digital', n: 'Website & app', d: 'Banners on the site, player and Jummah finder, the pages people check every week.', inc: ['Homepage & prayer-times placements', 'Player banner', 'Click tracking'] },
    { id: 'news', n: 'Newsletter', d: 'A feature in the weekly email that goes out before Jummah.', inc: ['Featured slot', 'Link & offer code', 'Open and click report'] },
    { id: 'social', n: 'Social & reels', d: 'A short reel or post made with our team for Instagram, TikTok and Facebook.', inc: ['Filmed and edited for you', 'Collab post', 'Story mentions'] },
    { id: 'season', n: 'Ramadan & Eid', d: 'Our busiest listening weeks: iftar countdowns, Eid greetings and festival presence.', inc: ['Suhur / iftar sponsorship', 'Inspire Eid stall or stage credit', 'Seasonal hub banner'] }
  ]
};

/* ---------- Giving: appeals, faith-based giving types, impact, news ----------
   Only the Jummah Winter Appeal has real figures so far (target from the campaign; raised comes from the
   collection records). Everything marked example:true shows only in the "Example" view. */
Object.assign(window.IFM, {
  giveTypes: [
    { id: 'zakat', n: 'Zakat', ar: 'زكاة', d: 'The obligatory 2.5% on wealth held above nisab for a lunar year. Goes only to eligible recipients.', calc: 'zakat' },
    { id: 'sadaqah', n: 'Sadaqah', ar: 'صدقة', d: 'Voluntary charity, any amount, any time. Even a smile is sadaqah.', calc: null },
    { id: 'jariyah', n: 'Sadaqah Jariyah', ar: 'صدقة جارية', d: 'Ongoing charity that keeps rewarding you: water, education, a masjid, beneficial knowledge.', calc: null },
    { id: 'lillah', n: 'Lillah', ar: 'لله', d: 'Given purely for the sake of Allah to institutions such as masjids, madrasas and community projects.', calc: null },
    { id: 'fitrana', n: 'Zakat al-Fitr', ar: 'زكاة الفطر', d: 'Paid for every member of the household before Eid al-Fitr prayer.', calc: 'fitrana' },
    { id: 'fidya', n: 'Fidya & Kaffarah', ar: 'فدية / كفارة', d: 'Compensation for fasts you cannot make up (fidya) or broke without valid reason (kaffarah).', calc: 'fidya' }
  ],
  /* default rates: set by the station's scholars each year; shown as editable in the calculators */
  rates: { fitrana: 5, fidyaDay: 5, kaffarahDay: 300, goldG: 0, silverG: 0, nisabNote: 'Enter today\'s gold or silver price per gram (we\'ll show it here from a live price feed on the finished site).' },
  appeals: [
    { id: 'jwa', t: 'Jummah Winter Appeal', org: 'Luton Foodbank', img: 'img/ph/foodbank.webp', where: 'Luton', types: ['sadaqah', 'lillah'], local: true, target: 15000, raised: 0, unit: [20, 'feeds someone for 3 days'], url: 'https://www.justgiving.com/page/inspire-fm-winter-campaign', match: 'Matched by Human Appeal', d: 'Collections at Jummah across Luton every Friday until 25 December, for families who can\'t afford food this winter.', live: true },
    { id: 'let', t: 'Let\'s Eat Together 2027', org: 'Luton Foodbank', img: 'img/ph/iftar-hall.webp', where: 'Luton schools & groups', types: ['sadaqah', 'zakat'], local: true, unit: [5, 'puts an iftar meal on a family\'s table'], url: '#contact', d: 'Ramadan iftars, fasting challenges and food drives in schools and community groups across Luton.', soon: 'Opens Ramadan 2027' },
    { id: 'ecs', t: 'Every Child Smiles', org: 'Inspire FM', img: 'img/ph/iftar-school.webp', where: 'Inspire Eid, Luton', types: ['sadaqah', 'lillah'], local: true, unit: [10, 'gives a child free rides at Inspire Eid'], url: '#contact', d: 'Free ride vouchers for children from families feeling the pinch, shared through Luton Foodbank and schools.' },
    { id: 'station', t: 'Keep Inspire on air', org: 'Inspire FM', img: null, art: ['#0f1113', '#a4a3a1'], where: 'Dallow Road, Luton', types: ['lillah', 'jariyah'], local: true, unit: [25, 'keeps us broadcasting for an hour'], url: '#contact', d: 'Transmitter, studio and licence costs for Luton\'s volunteer-run community station. Beneficial knowledge, every day.' },
    { id: 'aghosh', t: 'Sponsor an orphan', org: 'Aghosh UK', img: null, art: ['#493441', '#d6bfb3'], where: 'Pakistan', types: ['zakat', 'sadaqah', 'jariyah'], local: false, url: 'https://aghoshuk.org/donate-now/', d: 'Care, schooling and a safe home for orphaned children through a trusted partner.' },
    { id: 'families', t: 'Emergency relief', org: 'Families Relief', img: null, art: ['#5d3c3c', '#bbb191'], where: 'Worldwide', types: ['zakat', 'sadaqah'], local: false, url: 'https://www.familiesrelief.org.uk/', d: 'Food, shelter and medical aid where disaster and conflict hit hardest.' },
    { id: 'oneummah', t: 'Water & food aid', org: 'One Ummah', img: null, art: ['#3c4d5c', '#b6cbd8'], where: 'Worldwide', types: ['sadaqah', 'jariyah', 'zakat'], local: false, url: 'https://oneummah.org.uk/donate-now/', d: 'Wells, food packs and long-term projects for communities in need.' },
    { id: 'kort', t: 'Kashmir orphan relief', org: 'KORT', img: null, art: ['#344045', '#c0b393'], where: 'Kashmir', types: ['zakat', 'sadaqah'], local: false, url: 'https://kort.org.uk/', d: 'Support for orphans and widows in Azad Kashmir.' }
  ],
  /* Jummah collection calendar (Winter 2026/27): from the campaign poster */
  collections: [['2026-10-09', 'madinah'], ['2026-10-16', 'bushmead'], ['2026-10-23', 'akbaria'], ['2026-11-06', 'venue-central'], ['2026-11-20', 'irshad'], ['2026-12-11', 'BPJM']],
  /* the journey each pound takes: the live stage is set by staff */
  journey: [['Collected', 'Buckets at Jummah and online donations'], ['Counted & banked', 'Counted with masjid volunteers, paid in the same week'], ['Matched', 'Human Appeal matches every pound'], ['Delivered', 'Handed to Luton Foodbank'], ['Reached families', 'Parcels given out at Luton Foodbank centres']],
  journeyStage: 1,
  /* beneficiaries by month: staff enter real numbers; example figures only show in Example view */
  impactExample: { months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'], people: [120, 340, 180, 160, 210, 260, 420, 610, 380, 290, 720, 400], parcels: [40, 113, 60, 53, 70, 87, 140, 203, 127, 97, 240, 133] },
  impactReal: { months: [], people: [], parcels: [] },
  stories: [
    { t: 'Collection day at Madinah Masjid', k: 'Jummah Winter Appeal', img: 'img/ph/foodbank.webp', d: 'The first Friday of the appeal. Volunteers counted every bucket with the masjid team before it was banked the same week.', example: true },
    { t: 'An iftar for the whole school', k: 'Let\'s Eat Together', img: 'img/ph/iftar-hall.webp', d: 'Pupils of every faith broke fast together and raised money to feed families during Ramadan.', example: true },
    { t: 'Young volunteers at the table', k: 'Big Iftar', img: 'img/ph/iftar-school.webp', d: 'Students served dates and water and collected donations for Luton Foodbank.', example: true }
  ],
  feedback: [
    { n: 'Aisha, Bury Park', r: 5, t: 'Gave at Jummah and then online for my parents. Lovely to see exactly where it goes.', a: 'Jummah Winter Appeal', example: true },
    { n: 'Imran, Leagrave', r: 5, t: 'The matching from Human Appeal made it an easy decision. JazakAllah khair to the volunteers.', a: 'Jummah Winter Appeal', example: true },
    { n: 'Sarah, Stopsley', r: 5, t: 'Not Muslim myself but heard it on the radio and wanted to help. Great cause.', a: 'Jummah Winter Appeal', example: true }
  ],
  /* Local news: real Luton headlines picked for the community (no crime or sensational stories). Same story on several sites = one item with every source. Checked 15 Nov 2026. */
  news: [
    { t: 'Luton marks Islamophobia Awareness Month with a free event on 20 November', c: 'Faith', date: '12 Nov', d: 'Speakers and workshops at the University of Bedfordshire on the "Everybody Knows" report and tackling anti-Muslim hate.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/luton-marks-islamophobia-awareness-month'], ['The Lutonian', 'https://thelutonian.com/islamophobia-has-no-place-in-our-town-call-for-action-in-luton/']] },
    { t: 'More police officers for Luton town centre and neighbourhoods this winter', c: 'Safety', date: '13 Nov', d: 'Extra officers join community and town-centre teams after a month of operations that froze £1.3m of criminal assets.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/extra-officers-set-boost-communities-across-bedfordshire-after-month-activity-sees-assets-worth'], ['The Lutonian', 'https://thelutonian.com/more-police-officers-to-be-deployed-in-luton-town-centre-and-neighbourhoods/']] },
    { t: 'Almost £180,000 for youth arts, culture, sport and music in Luton', c: 'Youth', date: '13 Nov', d: 'Luton\'s share of a £450m national fund for activities and services for young people.', src: [['The Lutonian', 'https://thelutonian.com/luton-gets-almost-180k-boost-for-youth-arts-culture-sport-and-music-as-part-of-450m-government-fund/']] },
    { t: 'First Luton Care Awards celebrate the town\'s carers', c: 'Community', date: '13 Nov', d: 'Care staff, unpaid carers, providers and partners in adult social care were honoured on 12 November.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/luton-celebrates-excellence-adult-social-care-first-luton-care-awards']] },
    { t: 'Free event for parents on keeping children safe from county lines and knife crime', c: 'Family', date: '14 Nov', d: 'Parents and carers are invited to an evening at Stopsley High School on protecting young people from exploitation.', src: [['The Lutonian', 'https://thelutonian.com/luton-parents-urged-to-attend-event-tackling-county-lines-and-knife-crime/']] },
    { t: 'Bereavement support is hard to reach for ethnic minority families, study finds', c: 'Community', date: '12 Nov', d: 'National research involving Luton residents calls for bereavement services that work for every community.', src: [['The Lutonian', 'https://thelutonian.com/luton-research-highlights-barriers-to-bereavement-support-for-ethnic-minority-communities/']] },
    { t: 'Bombay Pizza is opening a new Luton store', c: 'Business', date: '10 Nov', d: 'The south Asian-inspired pizza brand from an Apprentice finalist opens in Luton, run by a local father and son.', src: [['The Lutonian', 'https://thelutonian.com/the-apprentice-tv-show-finalists-south-asian-inspired-pizza-business-to-open-new-luton-store/']] },
    { t: 'New Youth Hub opens to help young people into work and training', c: 'Youth', date: '6 Nov', d: 'Support for 16 to 24-year-olds who are out of work or training, with jobs, apprenticeships and courses.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/luton-youth-hub-launches-help-young-people-unlock-their-potential'], ['The Lutonian', 'https://thelutonian.com/new-luton-service-aims-to-help-thousands-of-young-people-into-work-and-training/']] },
    { t: 'Have your say on how Luton Council spends its money in 2027/28', c: 'Community', date: '6 Nov', d: 'A public consultation is open for residents to choose the council\'s spending priorities.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/residents-invited-help-shape-luton-councils-spending-priorities-202728'], ['The Lutonian', 'https://thelutonian.com/luton-residents-asked-to-help-decide-council-spending-priorities-for-2027-28/']] },
    { t: 'Warning: scammers are phoning Luton residents pretending to be police', c: 'Safety', date: '5 Nov', d: 'Police never ask you to move money or hand over bank cards. Hang up and call 101 from another phone.', src: [['The Lutonian', 'https://thelutonian.com/luton-residents-warned-about-phone-scam-involving-fraudsters-posing-as-police-officers/']] },
    { t: 'Luton Enterprise Week runs from 16 to 20 November', c: 'Business', date: '16 Nov', d: 'A week of events for start-ups and local businesses on enterprise, innovation and opportunity.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/luton-enterprise-week-returns-champion-enterprise-innovation-opportunity']] },
    { t: 'Ferrars Academy pupils win a national award for safer school travel', c: 'Schools', date: '28 Oct', d: 'The school was recognised for making pupils\' journeys to school safer and healthier.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/ferrars-academy-pupils-lead-way-sustainable-travel']] },
    { t: 'Work starts on £24.5m expansion of Woodlands Secondary School', c: 'Schools', date: '21 Oct', d: 'More specialist places for young people with special educational needs in Luton.', src: [['Luton Council', 'https://www.luton.gov.uk/news/2026/groundbreaking-event-celebrates-ps245m-expansion-luton-sen-secondary-school']] },
    { t: 'Whipsnade Zoo welcomes its 61st white rhino calf', c: 'Family', date: '11 Nov', d: 'A new arrival for the zoo\'s 55-year conservation breeding programme, a short drive from Luton.', src: [['The Lutonian', 'https://thelutonian.com/whipsnade-zoo-welcomes-its-61st-white-rhino-calf-celebrating-55-years-of-pioneering-conservation-breeding/']] }
  ]
});
