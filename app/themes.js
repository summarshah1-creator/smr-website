/* Inspire FM · per-tool personality. Same bones everywhere (fonts, top bar, back arrow, tab bar, button and card shapes),
   but each Toolbox tool gets its own colours, illustration style and one signature moment. Scenes are drawn in SVG, no images or emojis. */
(function () {
'use strict';
const W = 360, H = 132;
const svg = (body, defs = '') => `<svg class="ts-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
const lg = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rg = (id, a, b, cx = .5, cy = .5, r = .6) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>`;
const stars = (n, seed, y1 = 6, y2 = 70, x1 = 150) => { let s = seed, o = ''; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < n; i++) o += `<circle class="ts-tw" style="animation-delay:${(r() * 3).toFixed(2)}s" cx="${(x1 + r() * (W - x1)).toFixed(1)}" cy="${(y1 + r() * (y2 - y1)).toFixed(1)}" r="${(.6 + r() * 1.2).toFixed(1)}" fill="#fff"/>`; return o; };
const star8 = (cx, cy, r, f, o = 1) => { let p = ''; for (let i = 0; i < 16; i++) { const a = Math.PI * i / 8, rr = i % 2 ? r * .62 : r; p += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`; } return `<path d="${p}Z" fill="${f}" opacity="${o}"/>`; };
const geo = (id, c, o = .14) => `<pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><g fill="none" stroke="${c}" stroke-width="1" opacity="${o}"><path d="M18 2l4.5 11 11.5 1-9 7.5 3 11.5L18 26.5 8 33l3-11.5-9-7.5 11.5-1z"/><circle cx="18" cy="18" r="5"/></g></pattern>`;
const dome = (x, y, s, f) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${f}"><path d="M-22 0v-16a22 22 0 0 1 44 0V0z"/><rect x="-26" y="-2" width="52" height="30"/><path d="M0 -38v-8M0 -46a3 3 0 0 1 0 6" stroke="${f}" stroke-width="2"/><rect x="34" y="-40" width="8" height="68"/><path d="M34 -40l4-12 4 12z"/><rect x="-42" y="-40" width="8" height="68"/><path d="M-42 -40l4-12 4 12z"/></g>`;
const crescent = (x, y, r, f) => `<path d="M${x} ${y - r}a${r} ${r} 0 1 0 ${r * .9} ${r * 1.6}a${r * .82} ${r * .82} 0 1 1 -${r * .9} -${r * 1.6}z" fill="${f}"/>`;
const lantern = (x, y, s, c, i) => `<g class="ts-swing" style="transform-origin:${x}px 0;animation-delay:${i * .4}s"><path d="M${x} 0V${y - 14 * s}" stroke="${c}" stroke-width="1.2" opacity=".7"/><g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 -14h12l-2 -4h-8z" fill="${c}"/><path d="M-9 -14h18l-3 26h-12z" fill="${c}" opacity=".9"/><path d="M-5 -10h10l-2 18h-6z" fill="#d0c4a9"/><path d="M-6 12h12l-2 4h-8z" fill="${c}"/></g><circle cx="${x}" cy="${y}" r="${16 * s}" fill="url(#tsglow)"/></g>`;

/* each theme: accent colours + background tint + a scene with an eyebrow and tagline */
const T = {
  ayah: { a: '#477563', a2: '#b8a47c', bg: '#f4f7f5', eb: 'Ayah a day', tl: 'One ayah a day, and watch your garden bloom.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><circle cx="300" cy="34" r="20" fill="#d6cdb3"/><circle cx="300" cy="34" r="34" fill="url(#gl)"/>
     <path d="M0 112q90-26 180 0t180 0v20H0z" fill="#91ac8f"/><path d="M0 122q100-18 200 0t160-4v14H0z" fill="#6c8c70"/>
     ${[[210, 104, 1], [248, 100, 1.2], [288, 106, .9], [326, 102, 1.1]].map(([x, y, s], i) => `<g class="ts-sway" style="transform-origin:${x}px ${y}px;animation-delay:${i * .5}s"><path d="M${x} ${y}v-${22 * s}" stroke="#486449" stroke-width="2.4"/><path d="M${x} ${y - 10 * s}q-${10 * s} -${8 * s} -${14 * s} 0q${8 * s} ${4 * s} ${14 * s} 0z" fill="#5c7d5f"/><circle cx="${x}" cy="${y - 24 * s}" r="${6 * s}" fill="${['#b8a47c', '#caa0a6', '#aca1cb', '#b8a47c'][i]}"/><circle cx="${x}" cy="${y - 24 * s}" r="${2.4 * s}" fill="#f1efe4"/></g>`).join('')}
     <g transform="translate(206 40) scale(.7)"><circle r="22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5"/><circle r="22" fill="none" stroke="#b8a47c" stroke-width="5" stroke-dasharray="96 200" stroke-linecap="round" transform="rotate(-90)" class="ts-ring"/></g>`,
    lg('g1', '#e0d3c4', '#f3efea') + rg('gl', '#e3e0cc', '#e3e0cc')) },
  track: { a: '#305552', a2: '#8bbdb5', bg: '#f4f6f6', eb: 'Prayer tracker', tl: 'Tick each prayer. Quiet, simple, yours.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'].map((n, i) => `<g transform="translate(${190 + i * 36} 62)"><circle r="15" fill="${i < 3 ? '#bcbbb9' : 'none'}" stroke="#d0dbbb" stroke-width="2.5" class="${i < 3 ? 'ts-pop' : ''}" style="animation-delay:${i * .15}s"/>${i < 3 ? '<path d="M-6 0l4 4 8-8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' : ''}<text y="32" text-anchor="middle" font-size="9" font-weight="700" fill="#dbece8" font-family="DM Sans,system-ui">${n}</text></g>`).join('')}`,
    lg('g1', '#283f2a', '#646361', 1, 1)) },
  tasbih: { a: '#6c5a49', a2: '#cbbda8', bg: '#f6f4f2', eb: 'Tasbih', tl: 'SubhanAllah, Alhamdulillah, Allahu Akbar.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><path d="M150 40 Q255 140 360 40" fill="none" stroke="#ab9c88" stroke-width="1.4"/>${Array.from({ length: 15 }, (_, i) => { const t = i / 14, x = 150 + 210 * t, y = 40 + 4 * 47.5 * t * (1 - t); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 7 ? 9 : 7}" fill="url(#bd)" class="${i === 7 ? 'ts-pop' : ''}"/>`; }).join('')}<path d="M255 98v14l-5 8h10l-5-8" fill="#ab9c88"/>`,
    lg('g1', '#53442d', '#89744a', 1, 1) + rg('bd', '#dcd2c1', '#6c5a49', .35, .3, .9)) },
  studio: { a: '#486449', a2: '#a4a3a1', bg: '#f4f6f1' },
  liveroom: { a: '#486449', a2: '#a4a3a1', bg: '#f4f6f1' },
  qibla: { a: '#414b67', a2: '#b6a57c', bg: '#f6f6f8' },
  weather: { a: '#637a9c', a2: '#a2bdcc', bg: '#f5f6f8' },
  quran: { a: '#243c31', a2: '#a09273', bg: '#f2f1ee', eb: 'Quran', tl: 'A calm space for the words of Allah.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><rect width="360" height="132" fill="url(#pt)"/><rect width="360" height="132" fill="url(#sh)" class="ts-shim"/>
     <g transform="translate(262 92)"><path d="M-62 0l62-14 62 14-62 18z" fill="#463b30"/><path d="M-58 -2l58-12v-48l-58 12z" fill="#f5f3ed"/><path d="M58 -2l-58-12v-48l58 12z" fill="#e8e5dd"/><path d="M0 -14v-48" stroke="#a09273" stroke-width="1.5"/>${[0, 1, 2, 3, 4].map(i => `<path d="M-48 ${-50 + i * 8}l40 -8M8 ${-58 + i * 8}l40 8" stroke="#787264" stroke-width="1.6" opacity=".45"/>`).join('')}<path d="M-58 -2l58-12 58 12" fill="none" stroke="#a09273" stroke-width="2"/></g>`,
    lg('g1', '#1e232e', '#4e5970', 1, 1) + geo('pt', '#a09273', .22) + lg('sh', 'rgba(222,214,193,0)', 'rgba(222,214,193,.16)', 1, 0)) },
  duas: { a: '#385c66', a2: '#a09273', bg: '#f4f6f7', eb: 'Duas', tl: 'A dua for every moment of your day.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><rect width="360" height="132" fill="url(#pt)"/>${stars(16, 3)}${crescent(318, 30, 14, '#d6ceb4')}${lantern(240, 70, 1.2, '#a09273', 0)}${lantern(196, 52, .9, '#a09273', 1)}${lantern(282, 58, .8, '#a09273', 2)}`,
    lg('g1', '#5a3e34', '#ab7a6f', 1, 1) + geo('pt', '#e9dbd5', .14) + rg('tsglow', 'rgba(208,196,169,.55)', 'rgba(208,196,169,0)')) },
  alerts: { a: '#6d74a6', a2: '#c7b097', bg: '#f6f6f9', sky: 1, eb: 'Prayer alerts', tl: 'Never miss a salah, wherever the day takes you.' },
  jamaat: { a: '#52708d', a2: '#a4a3a1', bg: '#f4f6f8', map: 1, eb: 'Live jamaat', tl: 'Every masjid\'s next jamaat, close to you.' },
  jummah: { a: '#52708d', a2: '#a4a3a1', bg: '#f4f6f8', map: 1, eb: 'Jummah finder', tl: 'Every khutbah in Luton, nearest first.' },
  janazah: { a: '#52575e', a2: '#a0a5ac', bg: '#f5f6f8', eb: 'Janazah notices', tl: 'To Allah we belong, and to Him we return.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(10, 9, 6, 50, 120)}<path d="M0 104q120-14 240 0t120-6v34H0z" fill="#3e434a"/><path d="M0 116q140-10 260 0t100-2v18H0z" fill="#272b32"/><circle cx="300" cy="34" r="12" fill="#e6e9ec" opacity=".85"/>`,
    lg('g1', '#52575e', '#272b32')) },
  notices: { a: '#7b5b42', a2: '#d5ceb2', bg: '#f7f5f2', eb: 'Community noticeboard', tl: 'Classes, help wanted, free to a good home.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#ck)"/><rect width="360" height="132" fill="url(#ckd)"/>
     ${[[180, 18, -6, '#ebe8da', 70, 64], [252, 26, 4, '#e7ecf2', 64, 58], [318, 14, -3, '#e6f2ea', 56, 70], [210, 74, 3, '#f5eef2', 58, 44]].map(([x, y, r, c, w, h], i) => `<g transform="rotate(${r} ${x + w / 2} ${y})"><g class="ts-flut" style="animation-delay:${i * .6}s;transform-origin:${x + w / 2}px ${y}px"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>${[0, 1, 2].map(k => `<rect x="${x + 8}" y="${y + 14 + k * 10}" width="${w - 16 - k * 8}" height="3" rx="1.5" fill="#000" opacity=".15"/>`).join('')}<circle cx="${x + w / 2}" cy="${y + 4}" r="3.6" fill="#a26060"/></g></g>`).join('')}`,
    `<pattern id="ckd" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#5e4c3c" opacity=".35"/><circle cx="4" cy="4" r=".6" fill="#fff" opacity=".18"/></pattern>` + lg('ck', '#9d8975', '#7f6c5a', 1, 1)) },
  business: { a: '#7b6d51', a2: '#1d2d28', bg: '#f6f5f3', eb: 'Halal directory', tl: 'Luton businesses our listeners trust.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[0, 1, 2].map(i => { const x = 180 + i * 62, c = ['#1d2d28', '#7b6d51', '#624651'][i]; return `<g><rect x="${x}" y="46" width="56" height="70" fill="#fcfbf9"/><path d="M${x - 4} 34h64l-4 18h-56z" fill="${c}"/>${[0, 1, 2, 3].map(k => `<path d="M${x - 4 + k * 16} 52a8 8 0 0 0 16 0" fill="${k % 2 ? '#fff' : c}"/>`).join('')}<rect x="${x + 6}" y="66" width="20" height="50" fill="${c}" opacity=".85"/><rect x="${x + 31}" y="66" width="18" height="22" fill="#dae4e8"/></g>`; }).join('')}<rect y="116" width="360" height="16" fill="#c7c1b5"/>`,
    lg('g1', '#f1eee5', '#e2dccd')) },
  hijri: { a: '#57557e', a2: '#c0b389', bg: '#f6f6f9', eb: 'Hijri calendar', tl: 'Follow the moon through the months.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(26, 5, 6, 120, 0)}${[0, 1, 2, 3, 4, 5, 6].map(i => { const x = 196 + i * 25, ph = [.15, .35, .6, 1, .6, .35, .15][i]; return `<g transform="translate(${x} 66) scale(.85)"><circle r="11" fill="#2b2a3c"/><circle r="11" fill="#d5ceb2" clip-path="url(#c${i})"/><clipPath id="c${i}"><rect x="${i < 3 ? 11 - 22 * ph : -11}" y="-11" width="${22 * ph}" height="22"/></clipPath>${i === 3 ? '<circle r="15" fill="none" stroke="#d5ceb2" stroke-opacity=".4"/>' : ''}</g>`; }).join('')}`,
    lg('g1', '#2b2a3c', '#4a4966', 1, 1)) },
  ramadan: { a: '#6b679b', a2: '#c0af89', bg: '#f6f6f8', eb: 'Ramadan', tl: 'Suhur, iftar and every night in between.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(24, 7)}${crescent(320, 34, 15, '#c8bc99')}${lantern(170, 64, 1, '#c0af89', 0)}${lantern(214, 84, 1.25, '#b79288', 1)}${lantern(262, 58, .95, '#c0af89', 2)}<path d="M0 118q180-16 360 0v14H0z" fill="#2b2a3c"/>${dome(300, 112, .55, '#2b2a3c')}`,
    lg('g1', '#2b2a3c', '#6b679b', 1, 1) + rg('tsglow', 'rgba(208,196,169,.55)', 'rgba(208,196,169,0)')) },
  dates: { a: '#57557e', a2: '#c0b389', bg: '#f6f6f9', eb: 'Islamic dates', tl: 'The blessed months, ready every year.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(28, 11, 4, 124, 0)}${crescent(270, 66, 30, '#d5ceb2')}<circle cx="262" cy="66" r="48" fill="url(#gl)"/>`,
    lg('g1', '#181b21', '#57557e', 1, 1) + rg('gl', 'rgba(213,206,178,.35)', 'rgba(213,206,178,0)')) },
  money: { a: '#305552', a2: '#414b67', bg: '#f3f7f8', eb: 'Halal money', tl: 'Clear rules, real tools, no interest.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[30, 46, 38, 60, 54, 76, 70].map((h, i) => `<rect x="${170 + i * 24}" y="${112 - h}" width="14" height="${h}" rx="4" fill="${i === 6 ? '#8bbdb5' : 'rgba(255,255,255,.28)'}" class="ts-grow" style="animation-delay:${i * .08}s;transform-origin:0 112px"/>`).join('')}<path d="M170 78L194 66L218 72L242 52L266 58L290 36L314 42" fill="none" stroke="#8bbdb5" stroke-width="2.4" stroke-linecap="round"/><circle cx="314" cy="42" r="4" fill="#8bbdb5"/>`,
    lg('g1', '#181b21', '#263b3a', 1, 1)) },
  zakat: { a: '#2b5146', a2: '#9e8e62', bg: '#f4f6f5', eb: 'Zakat & giving', tl: 'Purify your wealth, and see where it goes.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[[200, 5], [236, 7], [272, 4], [308, 6]].map(([x, n]) => Array.from({ length: n }, (_, k) => `<ellipse cx="${x}" cy="${110 - k * 7}" rx="14" ry="5" fill="${k === n - 1 ? '#c8bc99' : '#9e8e62'}" stroke="#746640" stroke-width="1"/>`).join('')).join('')}<circle cx="236" cy="34" r="10" fill="#c8bc99" class="ts-drop"/>`,
    lg('g1', '#504a6f', '#776ea2', 1, 1)) },
  inherit: { a: '#6b679b', a2: '#c3c7de', bg: '#f7f7f9', eb: 'Inheritance', tl: 'Every share, as Allah set it out.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><g stroke="#b7d8d2" stroke-width="2" fill="none"><path d="M255 30v24M200 54h110M200 54v20M255 54v20M310 54v20M200 74h-22M200 74h22M310 74v26"/></g>${[[255, 26, 9], [200, 78, 8], [255, 78, 8], [310, 78, 8], [178, 104, 6], [222, 104, 6], [310, 104, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#dbece8" stroke="#629f97" stroke-width="2"/>`).join('')}`,
    lg('g1', '#263b3a', '#305552', 1, 1)) },
  salah: { a: '#466e83', a2: '#56916c', bg: '#f5f7f9', eb: 'Learn to pray', tl: 'Step by step, at your own pace.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><g transform="translate(250 92) skewX(-14)"><rect x="-52" y="-30" width="104" height="44" rx="6" fill="#437656"/><rect x="-46" y="-24" width="92" height="32" rx="4" fill="none" stroke="#cee4d6" stroke-width="2"/><path d="M-12 -24v-0a12 12 0 0 1 24 0" fill="none" stroke="#cee4d6" stroke-width="2"/></g>${[1, 2, 3, 4].map(i => `<g transform="translate(170 ${18 + i * 24})"><circle cx="20" r="9" fill="${i < 3 ? '#fff' : 'rgba(255,255,255,.35)'}"/><text x="20" y="3.5" text-anchor="middle" font-size="10" font-weight="800" fill="#466e83" font-family="DM Sans,system-ui">${i}</text></g>`).join('')}`,
    lg('g1', '#568aa1', '#39596b', 1, 1)) },
  stories: { a: '#6e4a3e', a2: '#a68a5a', bg: '#f6f4f1', eb: 'Quran stories', tl: 'The prophets, their people and their lessons.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><circle cx="300" cy="38" r="16" fill="#e9e5d7"/><path d="M0 92q60-12 120 0t120 0 120 0v40H0z" fill="#5b7580" opacity=".85"/><path d="M0 104q60-10 120 0t120 0 120 0v28H0z" fill="#485f69"/>
     <g class="ts-bob"><path d="M178 88h84l-12 16h-60z" fill="#5a4434"/><rect x="194" y="70" width="52" height="18" rx="2" fill="#765a46"/><path d="M200 70l20-14 20 14z" fill="#5a4434"/></g>`,
    lg('g1', '#d1c1a9', '#e1dacb')) },
  hajj: { a: '#7b5b42', a2: '#1d2d28', bg: '#f7f5f2' },
  kids: { a: '#8b73b4', a2: '#a68a5a', bg: '#fbfafc', kids: 1, eb: 'Kids\' corner', tl: 'Stories, letters and quizzes. Bismillah, let\'s go!', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[[180, 30, 1], [300, 24, .8], [240, 56, .6]].map(([x, y, s], i) => `<g class="ts-float" style="animation-delay:${i * .7}s"><g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><circle r="12"/><circle cx="14" cy="4" r="10"/><circle cx="-14" cy="4" r="9"/><rect x="-22" y="2" width="44" height="12" rx="6"/></g></g>`).join('')}
     ${star8(330, 60, 10, '#beb586')}${star8(196, 30, 7, '#cca0a6')}${crescent(214, 18, 9, '#beb586')}
     <path d="M190 132a90 60 0 0 1 220 0" fill="none" stroke="#cca0a6" stroke-width="7" opacity=".85"/><path d="M202 132a78 50 0 0 1 196 0" fill="none" stroke="#b19e6e" stroke-width="7" opacity=".85"/><path d="M214 132a66 40 0 0 1 172 0" fill="none" stroke="#67a08b" stroke-width="7" opacity=".85"/><path d="M226 132a54 30 0 0 1 148 0" fill="none" stroke="#94aac6" stroke-width="7" opacity=".85"/>
     <g transform="translate(300 116)"><g class="ts-bounce"><rect x="-26" y="-22" width="52" height="22" rx="4" fill="#ab8164"/><rect x="-24" y="-20" width="23" height="18" rx="2" fill="#f9f6f3"/><rect x="1" y="-20" width="23" height="18" rx="2" fill="#f0ebe4"/></g></g>`,
    lg('g1', '#a25c6b', '#dec3c6', 1, 1)) },
  feel: { a: '#9590b5', a2: '#dcbfc9', bg: '#f9f8fb', eb: 'How I feel', tl: 'Breathe. You don\'t have to carry it alone.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><circle cx="250" cy="66" r="44" fill="url(#b1)" class="ts-breathe"/><circle cx="250" cy="66" r="28" fill="#fff" opacity=".55" class="ts-breathe" style="animation-delay:.4s"/><circle cx="180" cy="104" r="40" fill="url(#b2)"/><circle cx="330" cy="20" r="34" fill="url(#b3)"/>`,
    lg('g1', '#dbece8', '#eaf0f4', 1, 1) + rg('b1', '#d2cee4', '#d2cee4') + rg('b2', '#eddde6', '#eddde6') + rg('b3', '#d1dfe6', '#d1dfe6')) },
  dress: { a: '#486449', a2: '#a4a3a1', bg: '#f5f6f3' },
  wall: { a: '#1d2d28', a2: '#a4a3a1', bg: '#f5f6f3' }
};

/* each tool's colour comes from its Toolbox icon, so the inside matches the tile people tapped */
const TILE = { ayah: ['#b9997e', '#865a48'], track: ['#bcbbb9', '#646361'], tasbih: ['#ccc0a1', '#89744a'], qibla: ['#88b7b1', '#2e5653'], weather: ['#a2bdcc', '#637a9c'], quran: ['#4e5970', '#1e232e'],
  feel: ['#8bbdb5', '#385c66'], duas: ['#d6bfb3', '#ab7a6f'], alerts: ['#d8b6c6', '#925e75'], jamaat: ['#79af8d', '#2b5146'], jummah: ['#aac1d1', '#52698c'],
  janazah: ['#a0a5ac', '#272b32'], notices: ['#c0b389', '#91724e'], business: ['#dec3d2', '#894d66'], hijri: ['#d2cee4', '#7961a0'], ramadan: ['#9fa9cb', '#4c5981'],
  dates: ['#abaecc', '#555774'], money: ['#8bbdb5', '#305552'], zakat: ['#cac3df', '#776ea2'], inherit: ['#8bbdb5', '#305552'], salah: ['#aac1d1', '#466e83'],
  dress: ['#a4a3a1', '#486449'], stories: ['#aeb8ac', '#3e4e42'], hajj: ['#d5ceb2', '#7b5b42'], kids: ['#dec3c6', '#a25c6b'], wall: ['#bfbebc', '#5c5b59'] };
Object.entries(TILE).forEach(([k, [l, d]]) => { T[k] = Object.assign(T[k] || {}, { a: d, a2: l, tint: l }); });
/* sky that follows the time of day (prayer alerts + prayer page clock) */
function skyKey() { const h = new Date().getHours() + new Date().getMinutes() / 60; return h < 5 ? 'night' : h < 7.5 ? 'dawn' : h < 16 ? 'day' : h < 19 ? 'dusk' : 'night'; }
const SKY = { dawn: ['#decbc1', '#9aa0b9', '#e1d8c6'], day: ['#a2bdcc', '#6484a1', '#e3e0cc'], dusk: ['#cbae9e', '#766b8b', '#d6c9b3'], night: ['#1e222e', '#323748', '#eef1f6'] };
function skyScene() { const k = skyKey(), [a, b, sun] = SKY[k], night = k === 'night'; const pos = { dawn: [190, 96], day: [270, 34], dusk: [320, 86], night: [300, 34] }[k];
  return svg(`<rect width="360" height="132" fill="url(#g1)"/>${night ? stars(30, 13, 4, 100, 0) : ''}${night ? crescent(pos[0], pos[1], 14, sun) : `<circle cx="${pos[0]}" cy="${pos[1]}" r="16" fill="${sun}"/><circle cx="${pos[0]}" cy="${pos[1]}" r="40" fill="url(#gl)"/>`}
    <path d="M0 116h360v16H0z" fill="${night ? '#171924' : '#272a2f'}" opacity=".85"/>${dome(250, 104, .62, night ? '#171924' : '#272a2f')}`, lg('g1', b, a) + rg('gl', sun, sun)); }
function mapScene() { return svg(`<rect width="360" height="132" fill="#ebeeec"/><g stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"><path d="M-10 92C80 80 140 110 220 70S330 40 370 50"/><path d="M190 -10C200 40 180 80 230 140"/><path d="M290 -10L300 140"/></g><g stroke="#d5ddd7" stroke-width="3" fill="none"><path d="M120 -10L160 140M-10 40H370"/></g>
  <rect x="236" y="14" width="40" height="26" rx="6" fill="#cbd7cd"/><circle cx="330" cy="104" r="16" fill="#dbe3e9"/>
  ${[[214, 66, '#52708d', 1], [300, 44, '#486449', 0], [170, 96, '#486449', 0], [330, 94, '#486449', 0]].map(([x, y, c, big]) => `<g transform="translate(${x} ${y})"><g class="${big ? 'ts-bounce' : ''}"><path d="M0 0c-8-10-12-15-12-21a12 12 0 0 1 24 0c0 6-4 11-12 21z" fill="${c}" transform="scale(${big ? 1.2 : .9})"/><circle cy="-21" r="4.6" fill="#fff" transform="scale(${big ? 1.2 : .9})"/></g></g>`).join('')}`); }

/* picture banners only where they add something; every other tool starts straight on its content */
const BANNER = ['kids'];
function scene(k) { const t = T[k]; if (!t || !t.eb) return ''; const art = t.sky ? skyScene() : t.map ? mapScene() : t.scene();
  const light = t.map || ['ayah', 'stories', 'hajj', 'feel', 'business'].includes(k);
  return `<div class="ts-scene ts-${k}${light ? ' lt' : ''}">${art}<div class="ts-txt"><span>${t.eb}</span><b>${t.tl}</b></div></div>`; }

const lum = hex => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const mix = (hex, k) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0')).join(''); };
function pill(t) { if (!t) return ['', '']; const c = lum(t.a2) > .35 ? t.a2 : lum(t.a) > .35 ? t.a : mix(t.a, .78); return [c, lum(c) > .18 ? '#111' : '#fff']; }
function apply(k) { const scr = document.getElementById('scr'); if (!scr) return; scr.dataset.tool = k || '';
  const [pc, pi] = pill(T[k]); document.body.style.setProperty('--tk-pill', pc || '#f4f4f4'); document.body.style.setProperty('--tk-pill-ink', pi || '#111'); scr.style.setProperty('--tk-pill', pc || '#f4f4f4'); scr.style.setProperty('--tk-pill-ink', pi || '#111'); scr.style.setProperty('--tk-a-ink', T[k] && lum(T[k].a) > .18 ? '#111' : '#fff');
  const t = T[k]; scr.style.setProperty('--tk-a', t ? t.a : ''); scr.style.setProperty('--tk-a2', t ? t.a2 : ''); scr.style.setProperty('--tk-bg', t ? t.bg : ''); scr.style.setProperty('--tk-tint', t ? (t.tint || t.a2) : '');
  const slot = document.getElementById('scrSlot'); if (!slot) return; const old = slot.querySelector(':scope > .ts-scene'); if (old) old.remove();
  const nm = slot.querySelector(':scope > .ts-name'); if (nm) nm.remove();
  if (k && t && t.eb && BANNER.includes(k)) slot.insertAdjacentHTML('afterbegin', scene(k));
  else if (k && !['hajj', 'dress', 'weather', 'food', 'baby', 'wedding', 'loss', 'family', 'revert', 'health', 'quran'].includes(k) && !/^(host|show)-/.test(k)) { const n = (document.getElementById('scrT') || {}).textContent || ''; if (n) slot.insertAdjacentHTML('afterbegin', `<div class="ts-name">${n}</div>`); } }

/* Toolbox sections that open as full pages (prayer times, duas, Quran, Jummah, Islamic dates) get the same treatment:
   no top bar on phones, a named banner, and the Toolbox tab becomes Close */
const PAGES = { prayer: ['alerts', 'Prayer times', 'Today\'s salah in Luton, to the second.'], duas: ['duas'], quran: ['quran'], jummah: ['jummah'], seasons: ['dates'] };
document.addEventListener('ifm:page', e => { const id = e.detail, P = PAGES[id]; document.body.classList.toggle('app-page', !!P); if (!P) return;
  const k = P[0], t = id === 'prayer' ? Object.assign({}, T[k], { a: TILE.wall[1], a2: TILE.wall[0], tint: TILE.wall[0] }) : T[k], [pc, pi] = pill(t); document.body.style.setProperty('--tk-pill', pc); document.body.style.setProperty('--tk-pill-ink', pi); document.body.style.setProperty('--tk-a', t.a); document.body.style.setProperty('--tk-tint', t.tint || t.a2);
  const pg = document.querySelector(`.page[data-page="${id}"]`); if (!pg) return; const old = pg.querySelector(':scope > .ts-pagehead'); if (old) old.remove();
  if (!BANNER.includes(k)) return; const tt = Object.assign({}, t, P[1] ? { eb: P[1], tl: P[2] } : {}); const keep = T[k]; T[k] = tt; const html = scene(k); T[k] = keep;
  const lt = pg.querySelector(':scope > .ltitle'); const box = `<div class="ts-pagehead">${html}</div>`; lt ? lt.insertAdjacentHTML('afterend', box) : pg.insertAdjacentHTML('afterbegin', box); });
document.addEventListener('ifm:tool', e => apply(e.detail));

/* prayer page: the big clock card gets the sky of the hour */
function paintSky() { document.documentElement.dataset.sky = skyKey(); }
paintSky(); setInterval(paintSky, 5 * 60 * 1000);

/* Kids' corner: a little bounce on every tap */
document.addEventListener('pointerdown', e => { const scr = document.getElementById('scr'); if (!scr || scr.dataset.tool !== 'kids') return; const b = e.target.closest('button, a, .tk-card'); if (!b) return; b.classList.remove('ts-tap'); void b.offsetWidth; b.classList.add('ts-tap'); });

/* ---------- opening moment: the tapped icon pops in with a small flourish of its own, then gets out of the way ---------- */
const FX = { ayah: 'sparkle', track: 'ring', tasbih: 'orbit', qibla: 'spin', weather: 'drop', quran: 'rays', feel: 'ripple', duas: 'rays', alerts: 'ring', jamaat: 'drop', jummah: 'drop',
  janazah: 'calm', notices: 'wobble', business: 'sparkle', hijri: 'stars', ramadan: 'stars', dates: 'stars', money: 'coins', zakat: 'coins', inherit: 'ripple',
  salah: 'ripple', dress: 'sparkle', stories: 'rays', hajj: 'rays', kids: 'confetti', wall: 'sparkle', prayer: 'rays', feelings: 'ripple' };
let pend = null;
const lowEnd = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('ax-still') || (navigator.deviceMemory && navigator.deviceMemory < 2);
/* any link that opens a tool (old tiles, the grouped Toolbox, the recent strip, home shortcuts): remember the icon that was tapped */
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a.tbt, a.tv2-i, a[href^="#tb-"]'); if (!a) return; const h = a.getAttribute('href') || ''; if (!h.startsWith('#tb-') && !a.classList.contains('tbt')) return; const k = h.startsWith('#tb-') ? h.slice(4) : h.slice(1);
  const ic = a.querySelector('.ai, .tv2-ic, .tv2-th, .ic, svg, img') || a; a.classList.remove('ts-press'); void a.offsetWidth; a.classList.add('ts-press');
  const rc = ic.getBoundingClientRect(); if (!rc.width) return;
  pend = { k, t: Date.now(), rc, el: ic, html: ic.outerHTML.replace(/id="([^"]+)"/g, 'id="$1-x"').replace(/url\(#([^)]+)\)/g, 'url(#$1-x)') }; }, true);
let lastEl = null, lastRc = null;
function flourish(kind, c, c2) {
  const N = (n, f) => Array.from({ length: n }, (_, i) => f(i, n)).join('');
  if (kind === 'sparkle' || kind === 'stars') return N(kind === 'stars' ? 10 : 8, (i, n) => { const a = i / n * Math.PI * 2, r = 70 + (i % 2) * 22; return `<i class="tsi-p tsi-star" style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r).toFixed(0)}px;--d:${i * 25}ms;background:${i % 2 ? c2 : '#fff'}"></i>`; });
  if (kind === 'rays') return `<i class="tsi-rays" style="--c:${c2}"></i>`;
  if (kind === 'ring' || kind === 'ripple' || kind === 'calm') return N(kind === 'calm' ? 1 : 3, i => `<i class="tsi-ring" style="--d:${i * 140}ms;border-color:${i ? c2 : c}"></i>`);
  if (kind === 'orbit') return N(12, (i, n) => `<i class="tsi-p tsi-bead" style="--a:${(i / n * 360).toFixed(0)}deg;--d:${i * 30}ms;background:${c2}"></i>`);
  if (kind === 'coins') return N(7, i => `<i class="tsi-p tsi-coin" style="--x:${(i - 3) * 22}px;--d:${i * 45}ms"></i>`);
  if (kind === 'confetti') return N(18, (i, n) => { const a = i / n * Math.PI * 2, r = 60 + (i * 37) % 60; return `<i class="tsi-p tsi-conf" style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r).toFixed(0)}px;--r:${i * 47}deg;--d:${(i % 5) * 20}ms;background:${['#cca0a6', '#b19e6e', '#67a08b', '#94aac6', '#bab0d5'][i % 5]}"></i>`; });
  return '';
}
/* opening a tool from its tile: like tapping an app on an iPhone home screen. The icon dims, then the tool zooms up
   out of the icon to fill the screen (the menu bar docks at the same time and stays on top). */
function intro(k) {
  if (!pend || Date.now() - pend.t > 2000 || lowEnd() || !pend.rc) { pend = null; return; } if (pend.k !== k) { pend = null; return; }
  const p = pend; pend = null; lastEl = p.el; lastRc = p.rc; const w = document.getElementById('scrWrap'), scr = document.getElementById('scr'); if (!w || !scr || !scr.animate) return;
  const rc = p.rc, W = innerWidth, Hh = innerHeight, sx = rc.width / W, sy = rc.height / Hh, dx = rc.left, dy = rc.top;
  const th = T[k] || { a: '#486449', a2: '#a4a3a1' };
  w.classList.add('zoom');
  const icon = document.createElement('div'); icon.className = 'ts-zicon'; icon.innerHTML = p.html;
  icon.style.cssText = `left:${rc.left}px;top:${rc.top}px;width:${rc.width}px;height:${rc.height}px`;
  document.body.appendChild(icon);
  const ease = 'cubic-bezier(.2,.9,.22,1)', D = 440;
  const anim = scr.animate(zoomFrames(rc, false), { duration: D, easing: ease, fill: 'both' });
  icon.animate([
    { transform: 'none', opacity: 1 },
    { transform: `translate(${W / 2 - rc.left - rc.width / 2}px,${Hh / 2 - rc.top - rc.height / 2}px) scale(${Math.min(W / rc.width, Hh / rc.height) * .5})`, opacity: 0, offset: .55 },
    { transform: `translate(${W / 2 - rc.left - rc.width / 2}px,${Hh / 2 - rc.top - rc.height / 2}px) scale(${Math.min(W / rc.width, Hh / rc.height) * .5})`, opacity: 0 }], { duration: D, easing: ease, fill: 'both' });
  const cover = document.createElement('div'); cover.className = 'ts-zcover'; cover.style.background = `linear-gradient(160deg,${th.a2},${th.a})`; scr.appendChild(cover);
  cover.animate([{ opacity: 1 }, { opacity: 1, offset: .45 }, { opacity: 0 }], { duration: D, easing: 'ease-out', fill: 'both' });
  anim.onfinish = () => { anim.cancel(); w.classList.remove('zoom'); icon.remove(); cover.remove(); };
}
/* the window grows out of the icon keeping its shape: scaled evenly and clipped to a rounded square the size of the icon */
function zoomFrames(rc, back) {
  const W = innerWidth, Hh = innerHeight, s = rc.width / W, cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, v = Math.max(0, (Hh - W) / 2), r = Math.round(20 / s);
  const small = { transform: `translate(${cx - W / 2}px,${cy - Hh / 2}px) scale(${s})`, clipPath: `inset(${v}px 0px ${v}px 0px round ${r}px)` },
    big = { transform: 'translate(0px,0px) scale(1)', clipPath: 'inset(0px 0px 0px 0px round 0px)' };
  return back ? [big, Object.assign({ opacity: .3 }, small)] : [small, big];
}
/* closing a tool shrinks it back into its tile when the tile is on screen */
document.addEventListener('ifm:tool', e => { if (e.detail) { lastTool = e.detail; return; } const k = lastTool; lastTool = '';
  const vis = el => { if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
  const prev = lastEl, prc = lastRc; lastEl = lastRc = null;
  const near = L => { if (!prc) return L[0]; let best = null, bd = 1e9; L.forEach(el => { const r = el.getBoundingClientRect(), d = Math.hypot(r.left - prc.left, r.top - prc.top); if (d < bd) { bd = d; best = el; } }); return best; };
  const scr = document.getElementById('scr'), w = document.getElementById('scrWrap'), ic = k && (vis(prev) ? prev : near([...document.querySelectorAll(`.page:not([hidden]) a[href="#tb-${k}"] :is(.tv2-ic,.ai)`)].filter(vis)));
  if (!ic || !scr || !scr.animate || lowEnd()) return; const rc = ic.getBoundingClientRect(); if (rc.bottom < 0 || rc.top > innerHeight) return;
  w.classList.add('zoom');
  const a = scr.animate(zoomFrames(rc, true), { duration: 340, easing: 'cubic-bezier(.3,.8,.3,1)', fill: 'both' });
  /* when the shrink ends, hide the window in the same frame before letting go of the animation: otherwise the
     normal close fade picks up from full size and the tool flashes back on screen for a moment */
  a.onfinish = () => { scr.style.transition = 'none'; scr.style.opacity = '0'; scr.style.visibility = 'hidden'; w.hidden = true;
    a.cancel(); w.classList.remove('zoom');
    requestAnimationFrame(() => requestAnimationFrame(() => { scr.style.transition = scr.style.opacity = scr.style.visibility = ''; })); }; });
let lastTool = '';
document.addEventListener('ifm:tool', e => { if (e.detail) intro(e.detail); });

window.IFM_THEMES = T;
/* if the app had already routed before this file loaded, apply the current page now */
const curPg = document.querySelector('.page:not([hidden])'); if (curPg && curPg.dataset.page) document.dispatchEvent(new CustomEvent('ifm:page', { detail: curPg.dataset.page }));
})();
