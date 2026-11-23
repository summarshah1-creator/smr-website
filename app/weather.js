/* Inspire FM · Weather: Luton by default, any place in the world.
   Data: Open-Meteo (free, no key; forecast, 15-minute rain, air quality, pollen, place search).
   AccuWeather: every place links to its AccuWeather page. AccuWeather's API needs a paid key kept on a server,
   so its data can be added later through window.IFM_WX_SOURCE without changing this screen. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, toast, TOOLS, prayerTimes, lon } = X;

const LUTON = { n: 'Luton', a: 'Bedfordshire, England', lat: 51.8787, lon: -0.42, cc: 'GB', home: 1 };
const units = () => Object.assign({ t: 'c', w: 'mph' }, store.get('wxU', {}));
const places = () => { const L = store.get('wxPlaces', []); return [LUTON, ...L.filter(p => !(Math.abs(p.lat - LUTON.lat) < .02 && Math.abs(p.lon - LUTON.lon) < .02))]; };
const current = () => { const c = store.get('wxCur', null); return c && c.lat != null ? c : LUTON; };
const km = (a, b) => { const R = 6371, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lon - a.lon) * r, x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const nearLuton = p => km(p, LUTON) < 30;

/* ---------- conditions ---------- */
const WMO = { 0: ['Clear', 'clear'], 1: ['Mostly clear', 'clear'], 2: ['Partly cloudy', 'part'], 3: ['Cloudy', 'cloud'], 45: ['Fog', 'fog'], 48: ['Freezing fog', 'fog'],
  51: ['Light drizzle', 'drizzle'], 53: ['Drizzle', 'drizzle'], 55: ['Heavy drizzle', 'drizzle'], 56: ['Freezing drizzle', 'sleet'], 57: ['Freezing drizzle', 'sleet'],
  61: ['Light rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy rain', 'heavy'], 66: ['Freezing rain', 'sleet'], 67: ['Freezing rain', 'sleet'],
  71: ['Light snow', 'snow'], 73: ['Snow', 'snow'], 75: ['Heavy snow', 'snow'], 77: ['Snow grains', 'snow'], 80: ['Light showers', 'rain'], 81: ['Showers', 'rain'], 82: ['Heavy showers', 'heavy'],
  85: ['Snow showers', 'snow'], 86: ['Heavy snow showers', 'snow'], 95: ['Thunderstorm', 'thunder'], 96: ['Thunder and hail', 'thunder'], 99: ['Thunder and hail', 'thunder'] };
const wmo = c => WMO[c] || ['–', 'cloud'];
const wet = c => /drizzle|rain|heavy|sleet|thunder|snow/.test(wmo(c)[1]);

/* ---------- icons (drawn, so they work offline and in dark mode) ---------- */
function icon(code, day = 1, size = 44) {
  const k = wmo(code)[1];
  const sun = (x, y, r) => `<g class="wx-sun"><circle cx="${x}" cy="${y}" r="${r}" fill="#ffc83d"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return `<path d="M${x + c * (r + 4)} ${y + s * (r + 4)}L${x + c * (r + 9)} ${y + s * (r + 9)}" stroke="#ffc83d" stroke-width="3.2" stroke-linecap="round"/>`; }).join('')}</g>`;
  const moon = (x, y, r) => `<path d="M${x + r * .35} ${y - r}a${r} ${r} 0 1 0 ${r * .65} ${r * 1.55}a${r * .8} ${r * .8} 0 0 1 ${-r * .65} ${-r * 1.55}z" fill="#e8ecff"/>`;
  const cloud = (x, y, s, f = '#e9eef5', st = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M10 30h30a10 10 0 0 0 0-20 14 14 0 0 0-27-2A11 11 0 0 0 10 30z" fill="${f}" ${st ? 'stroke="rgba(0,0,0,.08)" stroke-width="1"' : ''}/>`;
  const drops = (n, c = '#4ea8ff') => Array.from({ length: n }, (_, i) => `<path class="wx-drop" style="animation-delay:${i * .25}s" d="M${20 + i * 9} 46l-3 7" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`).join('');
  const flakes = n => Array.from({ length: n }, (_, i) => `<g class="wx-drop" style="animation-delay:${i * .3}s" transform="translate(${21 + i * 10} 50)"><path d="M0-4v8M-3.5-2l7 4M-3.5 2l7-4" stroke="#bfe3ff" stroke-width="2" stroke-linecap="round"/></g>`).join('');
  const body = {
    clear: day ? sun(32, 32, 12) : moon(32, 30, 14),
    part: (day ? sun(24, 22, 9) : moon(24, 20, 10)) + cloud(16, 18, .95),
    cloud: cloud(4, 12, 1.15, '#d5dde8') + cloud(14, 20, .95),
    fog: cloud(8, 8, 1.05, '#d5dde8') + '<path d="M10 46h44M14 53h36" stroke="#b9c3cf" stroke-width="3.5" stroke-linecap="round"/>',
    drizzle: cloud(8, 6, 1.1) + drops(3, '#7cc3ff'),
    rain: cloud(8, 6, 1.1) + drops(4),
    heavy: cloud(8, 6, 1.1, '#aeb9c7') + drops(4, '#2f86d6'),
    sleet: cloud(8, 6, 1.1) + drops(2) + flakes(1),
    snow: cloud(8, 6, 1.1) + flakes(3),
    thunder: cloud(8, 6, 1.1, '#9aa6b5') + '<path class="wx-bolt" d="M34 38l-7 12h7l-4 10 11-14h-7l4-8z" fill="#ffc83d"/>'
  }[k];
  return `<svg class="wx-ic" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;
}

/* ---------- weather & faith (awaiting review) ---------- */
const DUA = {
  rain: { k: 'Dua when it rains', ar: 'اللَّهُمَّ صَيِّبًا نَافِعًا', tr: 'Allāhumma ṣayyiban nāfiʿā', en: 'O Allah, make it a beneficial rain.', src: 'Sahih al-Bukhari 1032' },
  after: { k: 'When the rain stops', ar: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ', tr: 'Muṭirnā bi faḍli-llāhi wa raḥmatih', en: 'We have been given rain by the grace and mercy of Allah.', src: 'Sahih al-Bukhari 846' },
  hawal: { k: 'For heavy rain to ease', ar: 'اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا', tr: 'Allāhumma ḥawālaynā wa lā ʿalaynā', en: 'O Allah, around us and not upon us.', src: 'Sahih al-Bukhari 1014' },
  thunder: { k: 'When you hear thunder', ar: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ', tr: 'Subḥāna-lladhī yusabbiḥu-r-raʿdu bi ḥamdihi wal-malāʾikatu min khīfatih', en: 'Glory be to the One whom the thunder glorifies with His praise, and the angels too, in awe of Him.', src: 'Muwatta Malik, from Abdullah ibn al-Zubayr' },
  wind: { k: 'When the wind is strong', ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ', tr: 'Allāhumma innī asʾaluka khayrahā wa khayra mā fīhā wa khayra mā ursilat bih, wa aʿūdhu bika min sharrihā wa sharri mā fīhā wa sharri mā ursilat bih', en: 'O Allah, I ask You for its good, the good within it and the good it was sent with, and I seek refuge in You from its harm, the harm within it and the harm it was sent with.', src: 'Sahih Muslim 899' },
  snow: { k: 'A dua with snow in it', ar: 'اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ', tr: 'Allāhumma-ghsil khaṭāyāya bil-māʾi wa-th-thalji wal-barad', en: 'O Allah, wash away my sins with water, snow and hail.', src: 'Sahih al-Bukhari 744' },
  out: { k: 'Leaving home on a foggy day', ar: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'Bismillāh, tawakkaltu ʿala-llāh, wa lā ḥawla wa lā quwwata illā billāh', en: 'In the name of Allah, I put my trust in Allah, and there is no power and no strength except through Allah.', src: 'Sunan Abi Dawud 5095, Tirmidhi 3426' },
  aghith: { k: 'Asking Allah for rain', ar: 'اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا', tr: 'Allāhumma aghithnā (three times)', en: 'O Allah, send us rain.', src: 'Sahih al-Bukhari 1013' },
  fire: { k: 'On a hot day', ar: 'اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ', tr: 'Allāhumma ajirnī mina-n-nār', en: 'O Allah, protect me from the Fire.', src: 'Sunan Abi Dawud 5079' }
};
const WT = {
  rain: { n: 'Rain', duas: ['rain', 'after'], change: 'hawal', facts: [
    ['A time to make dua', 'Scholars list the time when rain is falling as one of the times dua is answered, so ask Allah for what you need.', 'Reported in Abu Dawud 2540 and al-Hakim'],
    ['Fresh from its Lord', 'The Prophet ﷺ uncovered part of his clothing so the rain could touch him, and said it had just come from its Lord.', 'Sahih Muslim 898'],
    ['How rain is made', 'Allah sends the winds, which stir up the clouds and spread them across the sky, then you see the rain coming out from within them.', 'Surah ar-Rum 30:48'],
    ['Life from water', 'We made every living thing from water.', 'Surah al-Anbiya 21:30']] },
  storm: { n: 'Storm', duas: ['thunder', 'hawal'], change: 'hawal', facts: [
    ['Fear and hope', 'He shows you the lightning, bringing fear and hope, and raises the heavy clouds. The thunder glorifies Him with praise.', 'Surah ar-Raʿd 13:12–13'],
    ['Around us, not on us', 'A man asked the Prophet ﷺ during the Friday sermon to pray for the heavy rain to stop. He made this dua, pointed, and the clouds moved away from Madinah.', 'Sahih al-Bukhari 1014'],
    ['He worried for people', 'When the Prophet ﷺ saw dark clouds or strong wind, the worry showed on his face, and when it rained he was relieved.', 'Sahih al-Bukhari 3206']] },
  wind: { n: 'Wind', duas: ['wind'], facts: [
    ['Good news before mercy', 'It is He who sends the winds as good news ahead of His mercy, carrying heavy clouds.', 'Surah al-Aʿraf 7:57'],
    ['Winds that fertilise', 'And We send the winds to fertilise, then send down water from the sky for you to drink.', 'Surah al-Hijr 15:22'],
    ['Don\'t curse the wind', 'The wind comes by Allah\'s command, bringing mercy or a warning, so don\'t curse it. Ask Allah for its good instead.', 'Sunan Abi Dawud 5097']] },
  snow: { n: 'Snow & hail', duas: ['snow'], facts: [
    ['Mountains of hail', 'He sends down from the sky mountains of clouds with hail in them, striking whom He wills.', 'Surah an-Nur 24:43'],
    ['In every prayer', 'The Prophet ﷺ said this dua quietly at the start of his prayer, asking to be made as clean as fresh snow.', 'Sahih al-Bukhari 744']] },
  fog: { n: 'Cloud & fog', duas: ['out'], facts: [
    ['Clouds held in place', 'In the clouds held between the sky and the earth there are signs for people who think.', 'Surah al-Baqarah 2:164'],
    ['Clouds by His command', 'Allah drives the clouds, joins them together and piles them up, and you see rain come from within them.', 'Surah an-Nur 24:43'],
    ['Take care on the roads', 'There is no special dua for fog. Say the dua for leaving home, give yourself extra time and drive slowly.', '']] },
  sun: { n: 'Sun & clear sky', duas: [], change: 'aghith', facts: [
    ['The sun on its course', 'And the sun runs on its course to its resting place. That is the decree of the Almighty, the All-Knowing.', 'Surah Ya-Sin 36:38'],
    ['Two signs of Allah', 'The sun and the moon are two of the signs of Allah.', 'Sahih al-Bukhari 1041'],
    ['Say Alhamdulillah', 'There is no special dua for a sunny day. Thank Allah for it, and the Prophet ﷺ prayed for rain in dry spells with the dua below.', '']] },
  cold: { n: 'Cold', duas: [], facts: [
    ['Wudu on a cold morning', 'Doing wudu fully when it is hard, like on a cold morning, wipes away sins and raises you in rank. Warm water is fine.', 'Sahih Muslim 251'],
    ['The easy reward', 'Fasting in winter is an easy reward: the days are short and cool.', 'Jami at-Tirmidhi 797'],
    ['Look after neighbours', 'Check on older neighbours when it is very cold. Whoever relieves a believer of a hardship, Allah will relieve him of a hardship on the Day of Judgement.', 'Sahih Muslim 2699']] },
  heat: { n: 'Heat', duas: ['fire'], facts: [
    ['Pray Zuhr when it cools', 'The Prophet ﷺ advised praying Zuhr a little later when the heat is intense, once it cools.', 'Sahih al-Bukhari 536'],
    ['Hotter still', 'The fire of Hell is far hotter, if only they understood.', 'Surah at-Tawbah 9:81'],
    ['Give water', 'Giving people water to drink is one of the best charities. Keep a bottle spare for someone who needs it.', 'Sunan Abi Dawud 1679']] }
};
function wtypes(f) {
  const c = f.current, H = f.hourly, i0 = nowIdx(f), kind = wmo(c.weather_code)[1], out = [];
  const gust = Math.max(...H.wind_gusts_10m.slice(i0, i0 + 6)), windy = wU() === 'mph' ? 35 : 56, tC = units().t === 'f' ? (c.apparent_temperature - 32) * 5 / 9 : c.apparent_temperature;
  out.push({ thunder: 'storm', heavy: 'storm', rain: 'rain', drizzle: 'rain', sleet: 'rain', snow: 'snow', fog: 'fog', cloud: 'fog', clear: 'sun', part: 'sun' }[kind] || 'fog');
  if (gust >= windy) out.push('wind'); if (tC <= 3) out.push('cold'); else if (tC >= 25) out.push('heat');
  const rainedJust = !['rain', 'drizzle', 'heavy', 'thunder'].includes(kind) && (H.precipitation || []).slice(Math.max(0, i0 - 2), i0).some(x => x > 0.2);
  return { types: out, rainedJust };
}
const duaHTML = (x, on) => `<div class="wx-fa-i${on ? ' on' : ''}"><small>${esc(x.k)}</small>${x.ar ? `<p class="wx-ar" lang="ar" dir="rtl">${x.ar}</p><p class="wx-tr">${esc(x.tr)}</p>` : ''}<p class="wx-en">${esc(x.en)}</p>${x.src ? `<span class="wx-src">${esc(x.src)}</span>` : ''}</div>`;
function faithHTML(f, pick) {
  const W = wtypes(f), today = W.types, sel = pick || today[0], t = WT[sel], isToday = !pick || pick === today[0];
  let duas = []; (isToday ? today : [sel]).forEach(k => WT[k].duas.forEach(d => { if (!duas.includes(d)) duas.push(d); }));
  if (isToday && W.rainedJust && !duas.includes('after')) duas.unshift('after');
  const facts = (isToday ? today : [sel]).flatMap(k => WT[k].facts).slice(0, 4), change = WT[sel].change && !duas.includes(WT[sel].change) ? DUA[WT[sel].change] : null;
  return `<div class="wx-card wx-fa"><div class="wx-fa-h"><h4>Weather & faith</h4><span class="wx-rev">Awaiting review</span></div>
    <p class="wx-sub">${isToday ? `Picked for today's weather (${esc(today.map(k => WT[k].n.toLowerCase()).join(', '))})` : esc(t.n)}: duas, verses and hadith. Tap a weather type to see others.</p>
    <div class="wx-chips" data-nodd>${[today[0]].concat(Object.keys(WT).filter(k => k !== today[0])).map(k => `<button type="button" data-wt="${k}" aria-pressed="${k === sel}">${k === today[0] ? 'Today' : esc(WT[k].n)}</button>`).join('')}</div>
    ${duas.length ? `<div class="wx-fa-list">${duas.map((d, i) => duaHTML(DUA[d], i === 0)).join('')}</div>${duas.length > 1 ? `<div class="wx-fa-dots">${duas.map((_, i) => `<button type="button" data-fa-go="${i}" aria-label="Dua ${i + 1} of ${duas.length}" aria-pressed="${i === 0}"></button>`).join('')}</div>` : ''}` : ''}
    <div class="wx-facts"><div class="wx-fk">Did you know?</div>${facts.map(([h, b, src]) => `<div class="wx-fact"><b>${esc(h)}</b><p>${esc(b)}</p>${src ? `<span class="wx-src">${esc(src)}</span>` : ''}</div>`).join('')}</div>
    ${change ? `<div class="wx-chg"><div class="wx-fk">${sel === 'sun' ? 'In a dry spell' : 'Hoping it eases?'}</div>${duaHTML(change, true)}</div>` : ''}</div>`;
}

/* ---------- demo forecast (example data until the live feed is switched on) ---------- */
const DEMO = true;
function demo(p, u) {
  const l = lon(), mo = l.m, seed0 = l.y * 400 + mo * 31 + l.d + Math.round(p.lat * 10 + p.lon * 10);
  let sd = seed0; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const NORM = [[2, 8], [2, 9], [3, 11], [5, 14], [8, 17], [11, 20], [13, 22], [13, 22], [11, 19], [8, 15], [5, 11], [3, 8]][mo - 1];
  const SUN = [[8.1, 16.2], [7.4, 17.2], [6.3, 18], [6.3, 19.9], [5.3, 20.7], [4.8, 21.3], [5, 21.2], [5.7, 20.5], [6.6, 19.3], [7.4, 18.1], [7.3, 16.2], [8.1, 15.9]][mo - 1];
  const PAT = [3, 61, 2, 80, 3, 1, 45, 63, 2, 0], pad = n => String(n).padStart(2, '0');
  const base = new Date(Date.UTC(l.y, l.m - 1, l.d)), ds = k => { const d = new Date(base.getTime() + k * 864e5); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
  const cv = v => u.t === 'f' ? v * 9 / 5 + 32 : v, wv = v => u.w === 'kmh' ? v * 1.609 : v;
  const H = { time: [], temperature_2m: [], apparent_temperature: [], precipitation_probability: [], precipitation: [], weather_code: [], wind_speed_10m: [], wind_gusts_10m: [], uv_index: [], is_day: [] };
  const D = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], apparent_temperature_max: [], apparent_temperature_min: [], precipitation_probability_max: [], precipitation_sum: [], sunrise: [], sunset: [], daylight_duration: [], uv_index_max: [], wind_speed_10m_max: [], wind_gusts_10m_max: [], wind_direction_10m_dominant: [] };
  for (let k = 0; k < 10; k++) {
    const typ = PAT[(k + seed0) % PAT.length], lo = NORM[0] + Math.round(rnd() * 3 - 1), hi = Math.max(lo + 3, NORM[1] + Math.round(rnd() * 3 - 1) - (typ >= 61 ? 1 : 0)), wind = 6 + Math.round(rnd() * 10) + (typ >= 61 ? 6 : 0);
    let pmax = 0, psum = 0, gmax = 0, wmax = 0;
    for (let h = 0; h < 24; h++) {
      const t = lo + (hi - lo) * Math.max(0, Math.sin(Math.PI * (h - 5) / 18)) ** 1.2, day = h + .5 > SUN[0] && h + .5 < SUN[1] ? 1 : 0;
      const wet = typ >= 61 && h >= 12 && h <= 19, fog = typ === 45 && h >= 4 && h <= 10;
      const code = wet ? (h === 15 && typ === 63 ? 63 : 61) : fog ? 45 : typ === 45 ? 3 : typ >= 61 ? (h < 12 ? 2 : 3) : typ === 0 && (h < 7 || h > 18) ? 0 : typ;
      const pp = wet ? 55 + Math.round(rnd() * 30) : typ >= 61 ? Math.round(rnd() * 20) : Math.round(rnd() * 10), pr = wet ? +(0.2 + rnd() * (code === 63 ? 2 : 0.8)).toFixed(1) : 0;
      const ws = wind + Math.round(Math.sin(Math.PI * h / 24) * 4), gs = ws + 8 + Math.round(rnd() * 6), uv = day ? Math.max(0, +(Math.sin(Math.PI * (h - SUN[0]) / (SUN[1] - SUN[0])) * (NORM[1] / 8) * (typ <= 2 ? 1 : .5)).toFixed(1)) : 0;
      H.time.push(`${ds(k)}T${pad(h)}:00`); H.temperature_2m.push(+cv(t).toFixed(1)); H.apparent_temperature.push(+cv(t - ws / 5).toFixed(1)); H.precipitation_probability.push(pp); H.precipitation.push(pr); H.weather_code.push(code);
      H.wind_speed_10m.push(+wv(ws).toFixed(1)); H.wind_gusts_10m.push(+wv(gs).toFixed(1)); H.uv_index.push(uv); H.is_day.push(day);
      pmax = Math.max(pmax, pp); psum += pr; gmax = Math.max(gmax, gs); wmax = Math.max(wmax, ws);
    }
    const hm2 = x => `${ds(k)}T${pad(Math.floor(x))}:${pad(Math.round((x % 1) * 60))}`;
    D.time.push(ds(k)); D.weather_code.push(typ === 45 ? 45 : typ); D.temperature_2m_max.push(cv(hi)); D.temperature_2m_min.push(cv(lo)); D.apparent_temperature_max.push(cv(hi - 2)); D.apparent_temperature_min.push(cv(lo - 3));
    D.precipitation_probability_max.push(pmax); D.precipitation_sum.push(+psum.toFixed(1)); D.sunrise.push(hm2(SUN[0])); D.sunset.push(hm2(SUN[1])); D.daylight_duration.push((SUN[1] - SUN[0]) * 3600);
    D.uv_index_max.push(Math.round(NORM[1] / 8 * (typ <= 2 ? 1 : .5))); D.wind_speed_10m_max.push(wv(wmax)); D.wind_gusts_10m_max.push(wv(gmax)); D.wind_direction_10m_dominant.push(200 + Math.round(rnd() * 60));
  }
  const i = l.h, cur = { time: H.time[i], temperature_2m: H.temperature_2m[i], apparent_temperature: H.apparent_temperature[i], relative_humidity_2m: 82, precipitation: H.precipitation[i], weather_code: H.weather_code[i], cloud_cover: H.weather_code[i] >= 3 ? 90 : 40, pressure_msl: 1012, wind_speed_10m: H.wind_speed_10m[i], wind_direction_10m: D.wind_direction_10m_dominant[0], wind_gusts_10m: H.wind_gusts_10m[i], is_day: H.is_day[i], uv_index: H.uv_index[i], visibility: H.weather_code[i] === 45 ? 800 : 18000, dew_point_2m: +(H.temperature_2m[i] - cv(3) + (u.t === 'f' ? 32 : 0)).toFixed(1) };
  const m = { time: [], precipitation: [] }; for (let q = 0; q < 12; q++) { const hh = l.h + Math.floor((Math.floor(l.mi / 15) + q) / 4), mm = ((Math.floor(l.mi / 15) + q) % 4) * 15, idx = Math.min(H.time.length - 1, hh); m.time.push(`${H.time[idx].slice(0, 11)}${pad(hh % 24)}:${pad(mm)}`); m.precipitation.push(H.precipitation[idx]); }
  return { f: { current: cur, hourly: H, daily: D, minutely_15: m, utc_offset_seconds: 0 }, a: { current: { european_aqi: 22, pm2_5: 6, pm10: 11, nitrogen_dioxide: 14, ozone: 48, grass_pollen: mo >= 5 && mo <= 7 ? 30 : 0, birch_pollen: mo === 4 ? 40 : 0, alder_pollen: 0, mugwort_pollen: 0, ragweed_pollen: 0, olive_pollen: 0 } }, at: Date.now(), demo: 1 };
}

/* ---------- data ---------- */
const CACHE_MIN = 15;
async function getJSON(u, ms = 9000) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { const r = await fetch(u, { signal: c.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(t); } }
async function load(p, force) {
  if (DEMO && !window.IFM_WX_SOURCE) return demo(p, units());
  const u = units(), key = `wx_${p.lat.toFixed(2)}_${p.lon.toFixed(2)}_${u.t}_${u.w}`, hit = store.get(key, null);
  if (!force && hit && Date.now() - hit.at < CACHE_MIN * 6e4) return hit;
  if (window.IFM_WX_SOURCE) { try { const d = await window.IFM_WX_SOURCE(p, u); if (d) { d.at = Date.now(); store.set(key, d); return d; } } catch (e) {} }
  const q = `latitude=${p.lat}&longitude=${p.lon}&timezone=auto`;
  const fu = `https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,uv_index,visibility,dew_point_2m`
    + `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,uv_index,is_day`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,daylight_duration,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant`
    + `&minutely_15=precipitation&forecast_days=10&forecast_minutely_15=12`
    + (u.t === 'f' ? '&temperature_unit=fahrenheit' : '') + (u.w === 'kmh' ? '&wind_speed_unit=kmh' : '&wind_speed_unit=mph');
  const au = `https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,grass_pollen,birch_pollen,alder_pollen,mugwort_pollen,ragweed_pollen,olive_pollen`;
  try {
    const [f, a] = await Promise.all([getJSON(fu), getJSON(au).catch(() => null)]);
    const d = { f, a, at: Date.now() }; store.set(key, d); return d;
  } catch (e) { if (hit) { hit.stale = 1; return hit; } throw e; }
}
async function search(q) { const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`); return (j.results || []).map(r => ({ n: r.name, a: [r.admin2 && r.admin2 !== r.name ? r.admin2 : '', r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude, cc: r.country_code })); }
async function reverse(lat, lng) { try { const j = await getJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, 6000); return { n: j.city || j.locality || 'My location', a: [j.principalSubdivision, j.countryName].filter(Boolean).join(', '), lat, lon: lng, cc: j.countryCode, me: 1 }; } catch (e) { return { n: 'My location', a: '', lat, lon: lng, me: 1 }; } }

/* ---------- helpers ---------- */
const deg = () => '°';
const T = v => `${Math.round(v)}${deg()}`;
const wU = () => units().w === 'kmh' ? 'km/h' : 'mph';
const HH = iso => iso.slice(11, 16);
const hr12 = iso => { const h = +iso.slice(11, 13); return h === 0 ? '12am' : h < 12 ? h + 'am' : h === 12 ? '12pm' : (h - 12) + 'pm'; };
const DAY = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
const DAYL = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
const compass = d => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(d / 45) % 8];
const aqiL = v => v == null ? null : v <= 20 ? ['Good', '#2e9e4f'] : v <= 40 ? ['Fair', '#7bb33a'] : v <= 60 ? ['Moderate', '#d9a400'] : v <= 80 ? ['Poor', '#e0662f'] : v <= 100 ? ['Very poor', '#c62828'] : ['Extremely poor', '#7b1fa2'];
const uvL = v => v < 3 ? ['Low', '#2e9e4f'] : v < 6 ? ['Moderate', '#d9a400'] : v < 8 ? ['High', '#e0662f'] : v < 11 ? ['Very high', '#c62828'] : ['Extreme', '#7b1fa2'];
const pollenL = v => v < 1 ? null : v < 10 ? 'Low' : v < 50 ? 'Moderate' : v < 200 ? 'High' : 'Very high';
function moon(d = new Date()) { const syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14) / 864e5, age = ((d.getTime() / 864e5 - ref) % syn + syn) % syn, f = age / syn, ill = Math.round((1 - Math.cos(2 * Math.PI * f)) / 2 * 100);
  const n = f < .03 || f > .97 ? 'New moon' : f < .22 ? 'Waxing crescent' : f < .28 ? 'First quarter' : f < .47 ? 'Waxing gibbous' : f < .53 ? 'Full moon' : f < .72 ? 'Waning gibbous' : f < .78 ? 'Last quarter' : 'Waning crescent'; return { n, ill, f }; }
function moonSvg(f) { const r = 14, x = 18, w = Math.cos(2 * Math.PI * f) * r, sweep = f < .5 ? 1 : 0; return `<svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true"><circle cx="${x}" cy="18" r="${r}" fill="#2b3245"/><path d="M${x} ${18 - r}a${r} ${r} 0 0 ${sweep} 0 ${2 * r}a${Math.abs(w)} ${r} 0 0 ${w > 0 ? 1 - sweep : sweep} 0 ${-2 * r}z" fill="#f3e9c6"/></svg>`; }

/* the next ~12 hours from now, by index into hourly */
function nowIdx(f) { const t = f.current.time.slice(0, 13); const i = f.hourly.time.findIndex(x => x.slice(0, 13) === t); return Math.max(0, i); }
function summary(f) {
  const H = f.hourly, i0 = nowIdx(f), c = f.current; const next = H.time.slice(i0, i0 + 12).map((t, j) => ({ t, p: H.precipitation_probability[i0 + j] || 0, mm: H.precipitation[i0 + j] || 0, code: H.weather_code[i0 + j] }));
  const rainy = next.find(h => h.p >= 50 || h.mm >= .3), dry = wet(c.weather_code) ? next.find(h => h.p < 30 && h.mm < .1) : null;
  if (wet(c.weather_code) && dry) return `${wmo(c.weather_code)[0]} now, drying up around ${hr12(dry.t)}.`;
  if (wet(c.weather_code)) return `${wmo(c.weather_code)[0]} now and for the next few hours.`;
  if (rainy) return `${wmo(rainy.code)[0]} likely from around ${hr12(rainy.t)}.`;
  const d = f.daily; return `Staying dry. ${wmo(d.weather_code[0])[0]} today, high of ${T(d.temperature_2m_max[0])}.`;
}
function nowcast(f) {
  const m = f.minutely_15; if (!m || !m.precipitation) return null; const now = Date.now(); const pts = m.time.map((t, i) => ({ t, v: m.precipitation[i] || 0 })).filter(p => new Date(p.t).getTime() > now - 15 * 6e4).slice(0, 9);
  if (!pts.length) return null; const raining = pts[0].v >= .1, change = pts.find(p => raining ? p.v < .05 : p.v >= .1);
  const txt = raining ? (change ? `Rain easing around ${HH(change.t)}` : 'Rain for at least the next 2 hours') : (change ? `Rain starting around ${HH(change.t)}` : 'No rain in the next 2 hours');
  return { txt, raining: raining || !!change, pts };
}
function advice(f) {
  const H = f.hourly, i0 = nowIdx(f), d = f.daily, out = [];
  const pmax = Math.max(...H.precipitation_probability.slice(i0, i0 + 12).map(v => v || 0)), fl = f.current.apparent_temperature, cold = units().t === 'f' ? 46 : 8, cool = units().t === 'f' ? 57 : 14, ice = units().t === 'f' ? 34 : 1;
  const gust = Math.max(...H.wind_gusts_10m.slice(i0, i0 + 12)), windy = wU() === 'mph' ? 35 : 56;
  if (pmax >= 50) out.push(['umb', 'Take an umbrella', `${pmax}% chance of rain`]);
  if (fl <= cold) out.push(['coat', 'Wear a warm coat', `Feels like ${T(fl)}`]); else if (fl <= cool) out.push(['layer', 'Bring a layer', `Feels like ${T(fl)}`]);
  if (d.uv_index_max[0] >= 5) out.push(['sun', 'Use sun cream', `UV ${Math.round(d.uv_index_max[0])} at midday`]);
  if (gust >= windy) out.push(['wind', 'Windy out', `Gusts up to ${Math.round(gust)} ${wU()}`]);
  if (Math.min(...H.temperature_2m.slice(i0, i0 + 12)) <= ice) out.push(['ice', 'Icy paths possible', 'Take care walking to the masjid']);
  if (!out.length) out.push(['ok', 'Nice and easy', 'No umbrella needed']);
  return out;
}
const AIC = { umb: '<path d="M4 13a8 8 0 0 1 16 0z" fill="currentColor"/><path d="M12 13v6a2 2 0 0 1-4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  coat: '<path d="M8 3l4 3 4-3 4 4-2 3v11H6V10L4 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>', layer: '<path d="M8 3l4 3 4-3 4 4-2 3v11H6V10L4 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  ice: '<path d="M12 2v20M3 7l18 10M3 17l18-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', ok: '<path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' };

/* ---------- screen ---------- */
TOOLS.weather = ['Weather', null, node => {
  let place = current(), data = null, busy = false, open = false, wtPick = null;
  node.innerHTML = `<div class="wx"><div class="wx-tagl"><b>Weather</b><span>Forecast &amp; faith</span></div><div class="wx-top"><button type="button" class="wx-place" id="wxPlace" aria-label="Change place"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.3" fill="currentColor"/></svg><b></b><svg viewBox="0 0 24 24" width="16" height="16"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button><button type="button" class="wx-ref" id="wxRef" aria-label="Refresh"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div id="wxBody"></div></div>`;
  const body = $('#wxBody', node);
  const skeleton = () => { body.innerHTML = `<div class="wx-hero wx-sk"><div class="wx-skl" style="width:40%;height:18px"></div><div class="wx-skl" style="width:55%;height:64px;margin:14px 0"></div><div class="wx-skl" style="width:70%;height:16px"></div></div><div class="wx-card wx-sk"><div class="wx-skl" style="height:90px"></div></div>`; };
  async function go(force) {
    $('#wxPlace b', node).textContent = place.n; if (busy) return; busy = true; if (!data || force !== 'soft') skeleton();
    $('#wxRef', node).classList.add('spin');
    try { data = await load(place, force === true); draw(); }
    catch (e) { body.innerHTML = `<div class="wx-card wx-err"><b>Couldn't load the weather</b><p>Check your connection and try again.</p><button type="button" class="btn g" id="wxRetry">Try again</button></div>`; $('#wxRetry', node).onclick = () => go(true); }
    busy = false; $('#wxRef', node).classList.remove('spin');
  }
  function draw() {
    const f = data.f, a = data.a, c = f.current, d = f.daily, H = f.hourly, i0 = nowIdx(f), [cond, kind] = wmo(c.weather_code), day = c.is_day;
    const nc = nowcast(f), adv = advice(f), mo = moon(), u = units();
    const sky = { clear: day ? 'sky-sun' : 'sky-night', part: day ? 'sky-part' : 'sky-night', cloud: 'sky-grey', fog: 'sky-grey', drizzle: 'sky-rain', rain: 'sky-rain', heavy: 'sky-storm', sleet: 'sky-rain', snow: 'sky-snow', thunder: 'sky-storm' }[kind];
    /* hourly strip: next 24 hours */
    const hrs = H.time.slice(i0, i0 + 25).map((t, j) => { const k = i0 + j, p = H.precipitation_probability[k] || 0; return `<div class="wx-h${j === 0 ? ' now' : ''}"><small>${j === 0 ? 'Now' : hr12(t)}</small>${icon(H.weather_code[k], H.is_day[k], 34)}<b>${T(j === 0 ? c.temperature_2m : H.temperature_2m[k])}</b><i class="${p >= 30 ? 'on' : ''}">${p >= 10 ? p + '%' : ''}</i></div>`; }).join('');
    /* 10 days with a range bar */
    const lo = Math.min(...d.temperature_2m_min), hi = Math.max(...d.temperature_2m_max), span = Math.max(1, hi - lo);
    const days = d.time.map((t, k) => `<button type="button" class="wx-d" data-day="${k}"><b>${k === 0 ? 'Today' : DAY(t)}</b>${icon(d.weather_code[k], 1, 30)}<span class="wx-p">${(d.precipitation_probability_max[k] || 0) >= 20 ? d.precipitation_probability_max[k] + '%' : ''}</span><span class="wx-lo">${T(d.temperature_2m_min[k])}</span><span class="wx-rng"><i style="left:${(d.temperature_2m_min[k] - lo) / span * 100}%;right:${100 - (d.temperature_2m_max[k] - lo) / span * 100}%"></i>${k === 0 ? `<em style="left:${(c.temperature_2m - lo) / span * 100}%"></em>` : ''}</span><span class="wx-hi">${T(d.temperature_2m_max[k])}</span></button>`).join('');
    /* weather at today's prayers (Luton area) */
    let prayers = '';
    if (nearLuton(place)) { const l = lon(), P = prayerTimes(l.y, l.m, l.d, X.asr ? X.asr() : 1), nowH = l.h + l.mi / 60;
      const rows = [['fajr', 'Fajr'], ['dhuhr', 'Zuhr'], ['asr', 'Asr'], ['maghrib', 'Maghrib'], ['isha', 'Isha']].filter(([k]) => P[k] > nowH - .5).map(([k, n]) => { const hh = Math.floor(P[k]), idx = H.time.findIndex(t => t.slice(0, 10) === d.time[0] && +t.slice(11, 13) === hh); if (idx < 0) return ''; const p = H.precipitation_probability[idx] || 0;
        return `<div class="wx-pr"><b>${n}</b><small>${X.hm(P[k])}</small>${icon(H.weather_code[idx], H.is_day[idx], 30)}<span>${T(H.temperature_2m[idx])}</span><i class="${p >= 40 ? 'on' : ''}">${p >= 20 ? p + '% rain' : 'Dry'}</i></div>`; }).join('');
      if (rows) prayers = `<div class="wx-card"><h4>Weather at prayer times</h4><p class="wx-sub">For walking to the masjid today.</p><div class="wx-prs">${rows}</div></div>`; }
    /* Jummah: the next Friday at 1pm */
    let jum = ''; const fi = d.time.findIndex(t => new Date(t + 'T12:00:00').getDay() === 5);
    if (fi >= 0) { const idx = H.time.findIndex(t => t.slice(0, 10) === d.time[fi] && t.slice(11, 13) === '13'); if (idx >= 0) { const p = H.precipitation_probability[idx] || 0;
      jum = `<div class="wx-card wx-jum">${icon(H.weather_code[idx], 1, 46)}<div><small>${fi === 0 ? 'Jummah today' : 'Jummah, ' + DAYL(d.time[fi])} · 1pm</small><b>${T(H.temperature_2m[idx])} · ${wmo(H.weather_code[idx])[0]}</b><span>${p >= 40 ? `${p}% chance of rain: take an umbrella.` : p >= 20 ? `${p}% chance of a shower.` : 'Looking dry for Jummah.'}</span></div></div>`; } }
    /* details */
    const aq = a && a.current ? a.current : null, aqi = aq ? aqiL(aq.european_aqi) : null, uv = uvL(c.uv_index || 0);
    const pol = aq ? [['grass_pollen', 'Grass'], ['birch_pollen', 'Birch'], ['alder_pollen', 'Alder'], ['mugwort_pollen', 'Mugwort'], ['ragweed_pollen', 'Ragweed'], ['olive_pollen', 'Olive']].map(([k, n]) => [n, pollenL(aq[k] || 0)]).filter(x => x[1]) : [];
    const sr = d.sunrise[0], ss = d.sunset[0], dl = d.daylight_duration ? Math.round(d.daylight_duration[0] / 60) : null;
    const tiles = [
      ['Feels like', T(c.apparent_temperature), c.apparent_temperature < c.temperature_2m - 2 ? 'The wind makes it feel colder.' : c.apparent_temperature > c.temperature_2m + 2 ? 'Humidity makes it feel warmer.' : 'Close to the real temperature.'],
      ['Wind', `${Math.round(c.wind_speed_10m)} <small>${wU()}</small>`, `<span class="wx-arr" style="transform:rotate(${c.wind_direction_10m + 180}deg)">↑</span> From the ${compass(c.wind_direction_10m)} · gusts ${Math.round(c.wind_gusts_10m)}`],
      ['Rain today', `${(d.precipitation_sum[0] || 0).toFixed(1)} <small>mm</small>`, `${d.precipitation_probability_max[0] || 0}% highest chance`],
      ['UV index', `${Math.round(c.uv_index || 0)} <small style="color:${uv[1]}">${uv[0]}</small>`, (d.uv_index_max[0] || 0) >= 3 ? `Up to ${Math.round(d.uv_index_max[0])} around midday.` : 'No sun protection needed.'],
      ['Humidity', `${Math.round(c.relative_humidity_2m)}<small>%</small>`, `Dew point ${T(c.dew_point_2m)}`],
      aqi ? ['Air quality', `${Math.round(aq.european_aqi)} <small style="color:${aqi[1]}">${aqi[0]}</small>`, `PM2.5 ${Math.round(aq.pm2_5)} · NO₂ ${Math.round(aq.nitrogen_dioxide)} µg/m³`] : null,
      ['Visibility', `${c.visibility >= 10000 ? '10+' : (c.visibility / 1000).toFixed(1)} <small>km</small>`, c.visibility < 1000 ? 'Poor: drive carefully.' : c.visibility < 5000 ? 'Hazy.' : 'Clear view.'],
      ['Pressure', `${Math.round(c.pressure_msl)} <small>hPa</small>`, `Cloud cover ${Math.round(c.cloud_cover)}%`]
    ].filter(Boolean).map(([h, v, s]) => `<div class="wx-tile"><small>${h}</small><b>${v}</b><span>${s}</span></div>`).join('');
    body.innerHTML = `
      <div class="wx-hero ${sky}"><div class="wx-hero-in"><div><small>${esc(place.a || '')}${data.stale ? ' · offline, last saved' : ''}${data.demo ? ' · <span class="wx-demo">Example</span>' : ''}</small><div class="wx-now"><b>${T(c.temperature_2m)}</b>${icon(c.weather_code, day, 86)}</div><div class="wx-cond">${cond}</div><div class="wx-hl">H ${T(d.temperature_2m_max[0])} · L ${T(d.temperature_2m_min[0])} · Feels like ${T(c.apparent_temperature)}</div></div></div>
        <p class="wx-sum">${esc(summary(f))}</p>${nc ? `<div class="wx-nc${nc.raining ? ' wet' : ''}"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z" fill="currentColor"/></svg><span>${nc.txt}</span><div class="wx-ncb">${nc.pts.map(p => `<i style="height:${Math.min(100, 12 + p.v * 60)}%" class="${p.v >= .1 ? 'on' : ''}"></i>`).join('')}</div></div>` : ''}<button type="button" class="wx-open" id="wxOpen" aria-expanded="${open}">${open ? 'Hide the full forecast' : 'See full forecast'}<svg viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>
      <div class="wx-adv">${adv.map(([k, t, s]) => `<div class="wx-a wx-a-${k}"><svg viewBox="0 0 24 24" width="22" height="22">${AIC[k]}</svg><div><b>${t}</b><small>${s}</small></div></div>`).join('')}</div>
      <div id="wxFaith">${faithHTML(f, wtPick)}</div>
      <div id="wxMore" class="wx-morewrap" ${open ? '' : 'hidden'}>
      <div class="wx-card"><h4>Next 24 hours</h4><div class="wx-hrs">${hrs}</div></div>
      ${jum}${prayers}
      <div class="wx-card"><h4>10-day forecast</h4><div class="wx-days">${days}</div></div>
      <div class="wx-tiles">${tiles}</div>
      <div class="wx-card wx-sunmoon"><div><small>Sunrise</small><b>${HH(sr)}</b></div><div class="wx-arc"><svg viewBox="0 0 120 50"><path d="M6 46a54 40 0 0 1 108 0" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="2" stroke-dasharray="3 4"/>${(() => { const t = (Date.now() - new Date(sr).getTime()) / (new Date(ss).getTime() - new Date(sr).getTime()); if (t < 0 || t > 1) return ''; const ang = Math.PI * (1 - t); return `<circle cx="${60 + 54 * Math.cos(ang)}" cy="${46 - 40 * Math.sin(ang)}" r="6" fill="#ffc83d"/>`; })()}</svg>${dl ? `<span>${Math.floor(dl / 60)}h ${dl % 60}m daylight</span>` : ''}</div><div><small>Sunset</small><b>${HH(ss)}</b></div></div>
      <div class="wx-card wx-moon">${moonSvg(mo.f)}<div><b>${mo.n}</b><small>${mo.ill}% lit tonight</small></div></div>
      ${pol.length ? `<div class="wx-card"><h4>Pollen</h4><div class="wx-pol">${pol.map(([n, l]) => `<span class="wx-pl wx-pl-${l.replace(' ', '')}"><b>${n}</b>${l}</span>`).join('')}</div></div>` : ''}
      <div class="wx-card wx-more"><h4>More forecasts</h4><a class="wx-lnk" href="https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(place.n + (place.a ? ', ' + place.a.split(',').slice(-1)[0].trim() : ''))}" target="_blank" rel="noopener"><b>AccuWeather</b><span>Full forecast for ${esc(place.n)}, MinuteCast and radar</span><i>↗</i></a>
        ${(place.cc || 'GB') === 'GB' ? `<a class="wx-lnk" href="https://www.metoffice.gov.uk/weather/warnings-and-advice/uk-warnings" target="_blank" rel="noopener"><b>Met Office warnings</b><span>Official UK weather warnings</span><i>↗</i></a>` : ''}
        <div class="wx-units"><span>Units</span><div class="seg"><button type="button" data-u="t:c" aria-pressed="${u.t === 'c'}">°C</button><button type="button" data-u="t:f" aria-pressed="${u.t === 'f'}">°F</button></div><div class="seg"><button type="button" data-u="w:mph" aria-pressed="${u.w === 'mph'}">mph</button><button type="button" data-u="w:kmh" aria-pressed="${u.w === 'kmh'}">km/h</button></div></div>
        <p class="wx-src">${data.demo ? 'Example forecast for this preview. The live forecast switches on when the app is hosted.' : `Forecast by Open-Meteo, updated ${new Date(data.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`}</p></div></div>`;
    const tog = () => { open = !open; draw(); if (open) setTimeout(() => { const m = $('#wxMore', node); m && m.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); };
    $('#wxOpen', node).onclick = tog; $('.wx-hero', node).onclick = e => { if (!e.target.closest('a,button')) tog(); };
    $$('[data-u]', node).forEach(b => b.onclick = () => { const [k, v] = b.dataset.u.split(':'), U = units(); U[k] = v; store.set('wxU', U); data = null; go(); });
    $$('[data-day]', node).forEach(b => b.onclick = () => dayDetail(+b.dataset.day));
    X.store.set('wxLast', { n: place.n, t: Math.round(c.temperature_2m), code: c.weather_code, day: c.is_day, at: Date.now() });
  }
  /* tap a day: its hours */
  function dayDetail(k) {
    const f = data.f, d = f.daily, H = f.hourly, rows = H.time.map((t, i) => [t, i]).filter(([t]) => t.slice(0, 10) === d.time[k] && +t.slice(11, 13) % (k === 0 ? 1 : 2) === 0);
    X.modal(`<h3 style="margin:0 0 4px">${k === 0 ? 'Today' : DAYL(d.time[k])}</h3><p style="margin:0 0 12px;color:var(--mut)">${wmo(d.weather_code[k])[0]} · ${T(d.temperature_2m_min[k])} to ${T(d.temperature_2m_max[k])} · sunrise ${HH(d.sunrise[k])}, sunset ${HH(d.sunset[k])}</p>
      <div class="wx-dh">${rows.map(([t, i]) => `<div><b>${hr12(t)}</b>${icon(H.weather_code[i], H.is_day[i], 28)}<span>${T(H.temperature_2m[i])}</span><small>${H.precipitation_probability[i] || 0}% · ${Math.round(H.wind_speed_10m[i])} ${wU()}</small></div>`).join('')}</div>
      <p style="margin:12px 0 0;font-size:.85rem;color:var(--mut)">Wind up to ${Math.round(d.wind_speed_10m_max[k])} ${wU()} (gusts ${Math.round(d.wind_gusts_10m_max[k])}), UV up to ${Math.round(d.uv_index_max[k] || 0)}, ${(d.precipitation_sum[k] || 0).toFixed(1)} mm of rain.</p>`);
  }
  /* places sheet: search anywhere, use my location, saved places */
  function picker() {
    const list = () => places().map(p => `<div class="wx-pi${Math.abs(p.lat - place.lat) < .01 && Math.abs(p.lon - place.lon) < .01 ? ' on' : ''}"><button type="button" data-pick='${esc(JSON.stringify(p))}'><b>${esc(p.n)}</b><small>${esc(p.a || '')}${p.home ? ' · default' : ''}</small></button>${p.home ? '' : `<button type="button" class="wx-x" data-rm="${p.lat},${p.lon}" aria-label="Remove ${esc(p.n)}">×</button>`}</div>`).join('');
    X.modal(`<h3 style="margin:0 0 10px">Choose a place</h3><div class="wx-search"><input type="search" id="wxQ" placeholder="Search any town or city" autocomplete="off" aria-label="Search places"></div><div id="wxRes"></div>
      <button type="button" class="wx-me" id="wxMe"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="3.5" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke="currentColor" stroke-width="2"/></svg>Use my location</button>
      <h4 style="margin:14px 0 6px">Saved places</h4><div id="wxSaved" class="wx-pl-list">${list()}</div>`);
    const box = $('#mBody'); let tm = 0;
    const choose = p => { place = p; store.set('wxCur', p); if (!p.home) { const L = store.get('wxPlaces', []).filter(x => !(Math.abs(x.lat - p.lat) < .01 && Math.abs(x.lon - p.lon) < .01)); L.unshift(p); store.set('wxPlaces', L.slice(0, 8)); } X.closeModal(); data = null; go(); };
    box.onclick = e => { const pk = e.target.closest('[data-pick]'); if (pk) { choose(JSON.parse(pk.dataset.pick)); return; }
      const rm = e.target.closest('[data-rm]'); if (rm) { const [la, lo] = rm.dataset.rm.split(',').map(Number); store.set('wxPlaces', store.get('wxPlaces', []).filter(x => !(Math.abs(x.lat - la) < .01 && Math.abs(x.lon - lo) < .01))); if (Math.abs(place.lat - la) < .01 && Math.abs(place.lon - lo) < .01) { place = LUTON; store.set('wxCur', null); data = null; go(); } $('#wxSaved', box).innerHTML = list(); } };
    $('#wxQ', box).oninput = e => { clearTimeout(tm); const q = e.target.value.trim(); if (q.length < 2) { $('#wxRes', box).innerHTML = ''; return; }
      tm = setTimeout(async () => { $('#wxRes', box).innerHTML = '<p class="wx-sub">Searching…</p>'; try { const R = await search(q); $('#wxRes', box).innerHTML = R.length ? `<div class="wx-pl-list">${R.map(p => `<div class="wx-pi"><button type="button" data-pick='${esc(JSON.stringify(p))}'><b>${esc(p.n)}</b><small>${esc(p.a)}</small></button></div>`).join('')}</div>` : '<p class="wx-sub">No places found. Try another spelling.</p>'; } catch (er) { $('#wxRes', box).innerHTML = '<p class="wx-sub">Search needs a connection.</p>'; } }, 300); };
    $('#wxMe', box).onclick = () => { if (!navigator.geolocation) { toast('Location isn\'t available here'); return; } $('#wxMe', box).textContent = 'Finding you…';
      navigator.geolocation.getCurrentPosition(async pos => choose(await reverse(+pos.coords.latitude.toFixed(3), +pos.coords.longitude.toFixed(3))), () => { $('#wxMe', box).textContent = 'Location is off: search instead'; }, { timeout: 9000, maximumAge: 6e5 }); };
    setTimeout(() => { const q = $('#wxQ', box); if (q && matchMedia('(min-width:761px)').matches) q.focus(); }, 80);
  }
  $('#wxPlace', node).onclick = picker;
  $('#wxRef', node).onclick = () => { data = null; go(true); };
  node.addEventListener('click', e => {
    const w = e.target.closest('[data-wt]'); if (w && data) { const k = w.dataset.wt, today = wtypes(data.f).types[0]; wtPick = k === today ? null : k; $('#wxFaith', node).innerHTML = faithHTML(data.f, wtPick); return; }
    const b = e.target.closest('[data-fa-go]'); if (!b) return; const i = +b.dataset.faGo, card = b.closest('.wx-fa'); card.querySelectorAll('.wx-fa-list .wx-fa-i').forEach((x, j) => x.classList.toggle('on', j === i)); card.querySelectorAll('[data-fa-go]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  go();
}];

/* the Toolbox tile shows the last temperature seen */
{ const w = store.get('wxLast', null), el = document.getElementById('tbWx'); if (w && el && Date.now() - w.at < 6 * 36e5) el.textContent = `${w.n} · ${w.t}° ${wmo(w.code)[0]}`; }

/* home screen square: current weather for the chosen place */
async function homeTile() {
  const el = document.getElementById('ahWx'); if (!el) return;
  const p = current(), u = units();
  try {
    const d = await load(p), c = d.f.current, dl = d.f.daily, k = wmo(c.weather_code), day = c.is_day;
    const hrs = d.f.hourly, i0 = Math.max(0, hrs.time.findIndex(t => t >= c.time.slice(0, 13))), rain = Math.max(...hrs.precipitation_probability.slice(i0, i0 + 4).map(x => x || 0));
    el.dataset.sky = ({ clear: day ? 'sun' : 'night', part: day ? 'part' : 'night', rain: 'rain', drizzle: 'rain', heavy: 'storm', thunder: 'storm', snow: 'snow', sleet: 'rain' })[k[1]] || 'grey';
    document.getElementById('ahWxIc').innerHTML = icon(c.weather_code, day, 40);
    document.getElementById('ahWxT').textContent = Math.round(c.temperature_2m) + '°';
    document.getElementById('ahWxC').innerHTML = esc(rain >= 40 ? `${k[0]} · ${rain}% rain` : k[0]) + (d.demo ? ' <i class="ah-wx-ex">Example</i>' : '');
    document.getElementById('ahWxHL').textContent = `H ${Math.round(dl.temperature_2m_max[0])}° L ${Math.round(dl.temperature_2m_min[0])}°`;
    document.getElementById('ahWxP').textContent = (p.n || 'Luton').split(',')[0];
    const slots = [3, 6, 9, 12].map(n => i0 + n).filter(i => i < hrs.time.length);
    document.getElementById('ahWxDay').innerHTML = slots.map(i => { const h = +hrs.time[i].slice(11, 13); return `<span><small>${h === 0 ? '12am' : h < 12 ? h + 'am' : h === 12 ? '12pm' : h - 12 + 'pm'}</small>${icon(hrs.weather_code[i], hrs.is_day[i], 20)}<b>${Math.round(hrs.temperature_2m[i])}°</b></span>`; }).join('');
    store.set('wxLast', { n: p.n || 'Luton', t: Math.round(c.temperature_2m), code: c.weather_code, day, at: Date.now() });
  } catch (e) { const w = store.get('wxLast', null); document.getElementById('ahWxC').textContent = w ? `${w.t}° ${wmo(w.code)[0]}` : 'Tap for the forecast'; }
}
homeTile(); setInterval(homeTile, 15 * 6e4); addEventListener('hashchange', () => { if (!location.hash || location.hash === '#home') homeTile(); });
window.IFM_WXAPI = { load, current, wmo, icon, units, homeTile };

/* styles */
const css = document.createElement('style'); css.textContent = `
.wx-tagl{margin:2px 2px 12px;display:grid}.wx-tagl b{font-family:var(--display);font-size:1.5rem;line-height:1.1;color:var(--ink)}.wx-tagl span{font-size:.88rem;font-weight:600;color:#2f6fd0}html.dark .wx-tagl span{color:#7cc7f2}.wx-hero{cursor:pointer}.wx-demo{display:inline-block;padding:1px 7px;border-radius:999px;background:rgba(255,255,255,.25);font-weight:600}
.wx-open{display:flex;width:100%;justify-content:center;align-items:center;gap:6px;min-height:46px;margin-top:12px;border-radius:14px;border:0;background:rgba(255,255,255,.95);color:#1f4f9c;font:inherit;font-weight:600;cursor:pointer}
.wx-open[aria-expanded=true] svg{transform:rotate(180deg)}.wx-morewrap{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}.wx-morewrap>*{min-width:0}.wx-morewrap[hidden]{display:none}
.wx-chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:2px -2px;padding:2px}.wx-chips::-webkit-scrollbar{display:none}
.wx-chips button{flex:none;min-height:38px;border-radius:999px;border:1.5px solid rgba(255,255,255,.25);background:none;color:#fff;font:inherit;font-weight:600;font-size:.82rem;padding:0 13px;cursor:pointer}.wx-chips button[aria-pressed=true]{background:#fff;color:#0f3b2e;border-color:#fff}
.wx-fk{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#bfe3a0;margin:4px 0 2px}
.wx-facts{display:grid;gap:8px}.wx-fact{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.06)}.wx-fact b{display:block;font-size:.92rem}#wxBody .wx-fact p{margin:2px 0 4px;font-size:.88rem;line-height:1.45;color:rgba(255,255,255,.88)}
.wx-chg{display:grid;gap:6px}.wx-fa{display:grid;gap:10px}
#wxBody .wx-card.wx-fa{background:linear-gradient(160deg,#0f3b2e,#174d3c);color:#fff;border:0}#wxBody .wx-fa h4{color:#fff;margin:0}#wxBody .wx-fa .wx-sub{color:rgba(255,255,255,.75);margin-top:2px}#wxBody .wx-fa p{color:#fff}#wxBody .wx-fa .wx-tr{color:rgba(255,255,255,.8)}
.wx-fa-h{display:flex;justify-content:space-between;align-items:center;gap:8px}.wx-rev{font-size:.66rem;font-weight:600;padding:3px 8px;border-radius:999px;background:rgba(242,181,49,.22);color:#ffd77a;white-space:nowrap}
.wx-fa-i{display:none;gap:6px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.08);border-left:3px solid #a8a49d}.wx-fa-i.on{display:grid}
.wx-fa-i small{font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#bfe3a0}
.wx-ar{margin:2px 0 0;font-family:'Amiri','Scheherazade New','Noto Naskh Arabic',serif;font-size:1.45rem;line-height:1.9;text-align:right}
.wx-tr{margin:0;font-style:italic;font-size:.86rem;color:rgba(255,255,255,.8)}.wx-en{margin:0;font-size:.95rem;line-height:1.45}.wx-src{font-size:.74rem;color:rgba(255,255,255,.65)}
.wx-fa-dots{display:flex;justify-content:center;gap:4px}.wx-fa-dots button{width:28px;height:28px;border:0;background:none;display:grid;place-items:center;cursor:pointer}.wx-fa-dots button::after{content:'';width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35)}.wx-fa-dots button[aria-pressed=true]::after{background:#fff;width:20px;border-radius:999px}
.wx{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}.wx>*,#wxBody>*{min-width:0}#wxBody{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
.wx-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.wx-place{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-weight:600;font-size:1rem;cursor:pointer}
.wx-place b{max-width:52vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wx-ref{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);color:var(--ink);display:grid;place-items:center;cursor:pointer}
.wx-ref.spin svg{animation:wxSpin 1s linear infinite}@keyframes wxSpin{to{transform:rotate(360deg)}}
.wx-hero{border-radius:24px;padding:18px 18px 16px;color:#fff;position:relative;overflow:hidden;box-shadow:0 14px 30px -18px rgba(0,0,0,.5)}
.wx-hero small{opacity:.85;font-size:.82rem}
.wx-now{display:flex;align-items:center;justify-content:space-between;gap:8px}.wx-now b{font-family:var(--display);font-size:4.4rem;line-height:1;font-weight:600;letter-spacing:-.03em}
.wx-cond{font-family:var(--display);font-weight:600;font-size:1.3rem}.wx-hl{font-size:.88rem;opacity:.9;margin-top:2px}
.wx-sum{margin:12px 0 0;font-weight:600;font-size:.98rem;line-height:1.35}
.sky-sun{background:linear-gradient(160deg,#3aa0f0,#1a6fd0 60%,#1559b0)}.sky-part{background:linear-gradient(160deg,#5fa9e6,#3a7cc4 60%,#2f6aa8)}
.sky-grey{background:linear-gradient(160deg,#7b8a9c,#55657a)}.sky-rain{background:linear-gradient(160deg,#4f6e8f,#2f4a66)}
.sky-storm{background:linear-gradient(160deg,#3a4256,#1d2333)}.sky-snow{background:linear-gradient(160deg,#9fb6cf,#6f89a8)}.sky-night{background:linear-gradient(160deg,#1c2550,#0d1430)}
.wx-nc{display:flex;align-items:center;gap:8px;margin-top:12px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.14);font-weight:600;font-size:.88rem}
.wx-ncb{margin-left:auto;display:flex;align-items:flex-end;gap:2px;height:20px;width:74px}.wx-ncb i{flex:1;background:rgba(255,255,255,.35);border-radius:2px;min-height:3px}.wx-ncb i.on{background:#9fd3ff}
.wx-adv{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
.wx-a{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;min-height:60px;color:#fff;background:linear-gradient(135deg,#5aa9e6,#2f6fd0)}.wx-a svg{width:26px;height:26px;padding:7px;box-sizing:content-box;border-radius:12px;background:rgba(255,255,255,.2)}
.wx-a svg{color:#fff!important;flex:none}.wx-a b{display:block;font-size:1rem}.wx-a small{color:rgba(255,255,255,.85);font-size:.82rem}
.wx-a-umb{background:linear-gradient(135deg,#3f86d8,#1f4f9c)}.wx-a-coat{background:linear-gradient(135deg,#7c5cf0,#4a2fb0)}.wx-a-layer{background:linear-gradient(135deg,#9b7cf3,#6a4bd0)}.wx-a-sun{background:linear-gradient(135deg,#f4b43a,#d9790f)}.wx-a-wind{background:linear-gradient(135deg,#22a3b8,#0e6577)}.wx-a-ice{background:linear-gradient(135deg,#7cc0ea,#3a7fb8)}.wx-a-ok{background:linear-gradient(135deg,#46b866,#23803f)}
.wx-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px}
.wx-card h4{margin:0 0 10px;font-family:var(--display);font-size:1rem}.wx-sub{margin:-6px 0 10px;color:var(--mut);font-size:.82rem}
.wx-hrs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin:0 -6px;padding:0 6px}
.wx-h{flex:none;width:54px;display:grid;justify-items:center;gap:2px;padding:8px 0;border-radius:14px}.wx-h.now{background:color-mix(in srgb,#2f86d6 12%,transparent)}
.wx-h small{font-size:.74rem;color:var(--mut);font-weight:600}.wx-h b{font-size:.98rem}.wx-h i{font-style:normal;font-size:.7rem;color:var(--mut);min-height:1em;font-weight:600}.wx-h i.on{color:#2f86d6}
.wx-days{display:grid}
.wx-d{display:grid;grid-template-columns:64px 34px 38px 34px 1fr 34px;align-items:center;gap:6px;min-height:48px;padding:2px 0;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.wx-d:first-child{border-top:0}.wx-d b{font-size:.92rem}.wx-p{font-size:.76rem;font-weight:600;color:#2f86d6}.wx-lo{color:var(--mut);text-align:right;font-weight:600}.wx-hi{font-weight:600}
.wx-rng{position:relative;height:6px;border-radius:9px;background:color-mix(in srgb,var(--mut) 22%,transparent)}.wx-rng i{position:absolute;top:0;bottom:0;border-radius:9px;background:linear-gradient(90deg,#5ec0ff,#ffc83d,#ff8a3d)}
.wx-rng em{position:absolute;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff;border:2px solid var(--ink)}
.wx-jum{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,color-mix(in srgb,#2f7d32 12%,var(--card)),var(--card))}
.wx-jum small{display:block;color:var(--mut);font-weight:600;font-size:.8rem}.wx-jum b{display:block;font-family:var(--display);font-size:1.15rem}.wx-jum span{font-size:.88rem}
.wx-prs{display:grid;gap:2px}.wx-pr{display:grid;grid-template-columns:70px 50px 34px 44px 1fr;align-items:center;gap:6px;min-height:44px;border-top:1px solid var(--line)}.wx-pr:first-child{border-top:0}
.wx-pr small{color:var(--mut);font-weight:600}.wx-pr span{font-weight:600}.wx-pr i{font-style:normal;text-align:right;font-size:.82rem;color:var(--mut);font-weight:600}.wx-pr i.on{color:#2f86d6}
.wx-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.wx-tile{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px 14px;display:grid;gap:4px;align-content:start;min-height:108px}
.wx-tile small{color:var(--mut);font-weight:600;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase}.wx-tile b{font-family:var(--display);font-size:1.6rem;line-height:1.1}.wx-tile b small{font-size:.8rem;letter-spacing:0;text-transform:none}
.wx-tile span{font-size:.8rem;color:var(--mut);line-height:1.35}.wx-arr{display:inline-block;font-weight:600;color:var(--ink)}
.wx-sunmoon{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;text-align:center}.wx-sunmoon small{display:block;color:var(--mut);font-weight:600;font-size:.78rem}.wx-sunmoon b{font-family:var(--display);font-size:1.25rem}
.wx-arc{display:grid;justify-items:center;color:var(--ink)}.wx-arc svg{width:100%;max-width:150px}.wx-arc span{font-size:.75rem;color:var(--mut);font-weight:600}
.wx-moon{display:flex;align-items:center;gap:12px}.wx-moon b{display:block}.wx-moon small{color:var(--mut)}
.wx-pol{display:flex;flex-wrap:wrap;gap:6px}.wx-pl{display:inline-flex;gap:6px;padding:6px 12px;border-radius:999px;font-size:.82rem;background:color-mix(in srgb,#2e9e4f 14%,transparent)}
.wx-pl-Moderate{background:color-mix(in srgb,#d9a400 18%,transparent)}.wx-pl-High,.wx-pl-Veryhigh{background:color-mix(in srgb,#e0662f 18%,transparent)}
.wx-lnk{display:grid;grid-template-columns:1fr auto;gap:0 10px;align-items:center;padding:12px 0;border-top:1px solid var(--line);color:var(--ink);text-decoration:none;min-height:44px}.wx-lnk:first-of-type{border-top:0;padding-top:0}
.wx-lnk span{grid-column:1;color:var(--mut);font-size:.84rem}.wx-lnk i{grid-row:1/3;grid-column:2;font-style:normal;font-weight:600}
.wx-units{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}.wx-units>span{font-weight:600;font-size:.86rem;margin-right:auto}
.wx-units .seg{background:transparent!important;box-shadow:none!important;display:inline-flex;border:1.5px solid var(--line);border-radius:999px;padding:3px;gap:2px}.wx-units .seg button{min-height:38px!important;min-width:52px;border:0;border-radius:999px;background:none;color:var(--ink);font:inherit;font-weight:600;cursor:pointer}
.wx-units .seg button{background:none!important;color:var(--ink)!important}.wx-units .seg button[aria-pressed=true]{background:#2f86d6!important;color:#fff!important}
.wx-src{margin:12px 0 0;font-size:.76rem;color:var(--mut)}
.wx-err{text-align:center;display:grid;gap:8px;justify-items:center}
.wx-sk{pointer-events:none}.wx-hero.wx-sk{background:linear-gradient(160deg,#9db7d3,#7b97b8)}.wx-skl{border-radius:10px;background:rgba(255,255,255,.35);animation:wxPulse 1.2s ease-in-out infinite}.wx-card .wx-skl{background:color-mix(in srgb,var(--mut) 18%,transparent)}
@keyframes wxPulse{50%{opacity:.5}}
.wx-search input{width:100%;min-height:48px;border-radius:14px;border:1.5px solid var(--line);padding:0 14px;font:inherit;background:var(--card);color:var(--ink)}
.wx-me{display:flex;align-items:center;gap:8px;width:100%;min-height:48px;margin-top:10px;border-radius:14px;border:1.5px dashed var(--line);background:none;color:var(--ink);font:inherit;font-weight:600;justify-content:center;cursor:pointer}
.wx-pl-list{display:grid;gap:6px;margin-top:8px}.wx-pi{display:flex;align-items:stretch;border:1px solid var(--line);border-radius:14px;overflow:hidden}.wx-pi.on{border-color:#2f86d6;box-shadow:0 0 0 1px #2f86d6 inset}
.wx-pi button{flex:1;text-align:left;min-height:52px;padding:8px 14px;border:0;background:var(--card);color:var(--ink);font:inherit;cursor:pointer}.wx-pi button b{display:block}.wx-pi button small{color:var(--mut);font-size:.8rem}
.wx-pi .wx-x{flex:none;width:48px;text-align:center;font-size:1.4rem;color:var(--mut)}
.wx-dh{display:grid;gap:2px;max-height:52vh;overflow:auto}.wx-dh>div{display:grid;grid-template-columns:52px 30px 40px 1fr;align-items:center;gap:8px;min-height:40px;border-top:1px solid var(--line)}.wx-dh small{color:var(--mut);text-align:right}
.wx-ic{flex:none;overflow:visible}.wx-sun{transform-box:fill-box;transform-origin:center;animation:wxRot 40s linear infinite}@keyframes wxRot{to{transform:rotate(360deg)}}
.wx-drop{animation:wxDrop 1.2s ease-in infinite}@keyframes wxDrop{0%{opacity:0;transform:translateY(-3px)}30%{opacity:1}100%{opacity:0;transform:translateY(5px)}}
.wx-bolt{animation:wxFlash 3s infinite}@keyframes wxFlash{0%,88%,100%{opacity:1}92%{opacity:.2}}
@media (prefers-reduced-motion:reduce){.wx-sun,.wx-drop,.wx-bolt,.wx-skl{animation:none!important}}
html.ax-still .wx-sun,html.ax-still .wx-drop,html.ax-still .wx-bolt{animation:none!important}
`; document.head.appendChild(css);
})();
