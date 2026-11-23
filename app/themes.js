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
const lantern = (x, y, s, c, i) => `<g class="ts-swing" style="transform-origin:${x}px 0;animation-delay:${i * .4}s"><path d="M${x} 0V${y - 14 * s}" stroke="${c}" stroke-width="1.2" opacity=".7"/><g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 -14h12l-2 -4h-8z" fill="${c}"/><path d="M-9 -14h18l-3 26h-12z" fill="${c}" opacity=".9"/><path d="M-5 -10h10l-2 18h-6z" fill="#ffd77a"/><path d="M-6 12h12l-2 4h-8z" fill="${c}"/></g><circle cx="${x}" cy="${y}" r="${16 * s}" fill="url(#tsglow)"/></g>`;

/* each theme: accent colours + background tint + a scene with an eyebrow and tagline */
const T = {
  ayah: { a: '#1f9d6b', a2: '#f4b740', bg: '#f1faf3', eb: 'Ayah a day', tl: 'One ayah a day, and watch your garden bloom.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><circle cx="300" cy="34" r="20" fill="#ffe08a"/><circle cx="300" cy="34" r="34" fill="url(#gl)"/>
     <path d="M0 112q90-26 180 0t180 0v20H0z" fill="#7cc576"/><path d="M0 122q100-18 200 0t160-4v14H0z" fill="#4fa95a"/>
     ${[[210, 104, 1], [248, 100, 1.2], [288, 106, .9], [326, 102, 1.1]].map(([x, y, s], i) => `<g class="ts-sway" style="transform-origin:${x}px ${y}px;animation-delay:${i * .5}s"><path d="M${x} ${y}v-${22 * s}" stroke="#2f7d32" stroke-width="2.4"/><path d="M${x} ${y - 10 * s}q-${10 * s} -${8 * s} -${14 * s} 0q${8 * s} ${4 * s} ${14 * s} 0z" fill="#3e9b48"/><circle cx="${x}" cy="${y - 24 * s}" r="${6 * s}" fill="${['#f4b740', '#f07a8a', '#9b7cf0', '#f4b740'][i]}"/><circle cx="${x}" cy="${y - 24 * s}" r="${2.4 * s}" fill="#fff8d6"/></g>`).join('')}
     <g transform="translate(206 40) scale(.7)"><circle r="22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5"/><circle r="22" fill="none" stroke="#f4b740" stroke-width="5" stroke-dasharray="96 200" stroke-linecap="round" transform="rotate(-90)" class="ts-ring"/></g>`,
    lg('g1', '#ffd6a5', '#fff1de') + rg('gl', '#fff3b0', '#fff3b0')) },
  track: { a: '#0f766e', a2: '#5eead4', bg: '#f2f8f7', eb: 'Prayer tracker', tl: 'Tick each prayer. Quiet, simple, yours.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'].map((n, i) => `<g transform="translate(${190 + i * 36} 62)"><circle r="15" fill="${i < 3 ? '#bebcb7' : 'none'}" stroke="#d9f99d" stroke-width="2.5" class="${i < 3 ? 'ts-pop' : ''}" style="animation-delay:${i * .15}s"/>${i < 3 ? '<path d="M-6 0l4 4 8-8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' : ''}<text y="32" text-anchor="middle" font-size="9" font-weight="700" fill="#ccfbf1" font-family="DM Sans,system-ui">${n}</text></g>`).join('')}`,
    lg('g1', '#14531a', '#66645f', 1, 1)) },
  tasbih: { a: '#8a5a2b', a2: '#e9c48a', bg: '#faf5ee', eb: 'Tasbih', tl: 'SubhanAllah, Alhamdulillah, Allahu Akbar.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><path d="M150 40 Q255 140 360 40" fill="none" stroke="#c9a06a" stroke-width="1.4"/>${Array.from({ length: 15 }, (_, i) => { const t = i / 14, x = 150 + 210 * t, y = 40 + 4 * 47.5 * t * (1 - t); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 7 ? 9 : 7}" fill="url(#bd)" class="${i === 7 ? 'ts-pop' : ''}"/>`; }).join('')}<path d="M255 98v14l-5 8h10l-5-8" fill="#c9a06a"/>`,
    lg('g1', '#7a4d06', '#c4870f', 1, 1) + rg('bd', '#f5d9a8', '#8a5a2b', .35, .3, .9)) },
  studio: { a: '#2f7d32', a2: '#a8a49d', bg: '#f4f6f1' },
  liveroom: { a: '#2f7d32', a2: '#a8a49d', bg: '#f4f6f1' },
  qibla: { a: '#1e3a8a', a2: '#e9b949', bg: '#f3f5fb' },
  weather: { a: '#2f6fd0', a2: '#7cc7f2', bg: '#f1f6fc' },
  quran: { a: '#0f5132', a2: '#c9a24a', bg: '#f6f3ea', eb: 'Quran', tl: 'A calm space for the words of Allah.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><rect width="360" height="132" fill="url(#pt)"/><rect width="360" height="132" fill="url(#sh)" class="ts-shim"/>
     <g transform="translate(262 92)"><path d="M-62 0l62-14 62 14-62 18z" fill="#5a3a1c"/><path d="M-58 -2l58-12v-48l-58 12z" fill="#fbf6e7"/><path d="M58 -2l-58-12v-48l58 12z" fill="#f3ead2"/><path d="M0 -14v-48" stroke="#c9a24a" stroke-width="1.5"/>${[0, 1, 2, 3, 4].map(i => `<path d="M-48 ${-50 + i * 8}l40 -8M8 ${-58 + i * 8}l40 8" stroke="#8a7a52" stroke-width="1.6" opacity=".45"/>`).join('')}<path d="M-58 -2l58-12 58 12" fill="none" stroke="#c9a24a" stroke-width="2"/></g>`,
    lg('g1', '#0f1d3d', '#2f4f8f', 1, 1) + geo('pt', '#c9a24a', .22) + lg('sh', 'rgba(255,230,160,0)', 'rgba(255,230,160,.16)', 1, 0)) },
  duas: { a: '#0e7490', a2: '#c9a24a', bg: '#f1f8fa', eb: 'Duas', tl: 'A dua for every moment of your day.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><rect width="360" height="132" fill="url(#pt)"/>${stars(16, 3)}${crescent(318, 30, 14, '#f6dd94')}${lantern(240, 70, 1.2, '#c9a24a', 0)}${lantern(196, 52, .9, '#c9a24a', 1)}${lantern(282, 58, .8, '#c9a24a', 2)}`,
    lg('g1', '#7c2d12', '#e0573a', 1, 1) + geo('pt', '#ffd3bf', .14) + rg('tsglow', 'rgba(255,215,122,.55)', 'rgba(255,215,122,0)')) },
  alerts: { a: '#3b4fd8', a2: '#f7b267', bg: '#f3f4fc', sky: 1, eb: 'Prayer alerts', tl: 'Never miss a salah, wherever the day takes you.' },
  jamaat: { a: '#1d72c2', a2: '#a8a49d', bg: '#f1f6fb', map: 1, eb: 'Live jamaat', tl: 'Every masjid\'s next jamaat, close to you.' },
  jummah: { a: '#1d72c2', a2: '#a8a49d', bg: '#f1f6fb', map: 1, eb: 'Jummah finder', tl: 'Every khutbah in Luton, nearest first.' },
  janazah: { a: '#475569', a2: '#94a3b8', bg: '#f5f6f8', eb: 'Janazah notices', tl: 'To Allah we belong, and to Him we return.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(10, 9, 6, 50, 120)}<path d="M0 104q120-14 240 0t120-6v34H0z" fill="#334155"/><path d="M0 116q140-10 260 0t100-2v18H0z" fill="#1e293b"/><circle cx="300" cy="34" r="12" fill="#e2e8f0" opacity=".85"/>`,
    lg('g1', '#475569', '#1e293b')) },
  notices: { a: '#b45309', a2: '#fde68a', bg: '#fbf6ee', eb: 'Community noticeboard', tl: 'Classes, help wanted, free to a good home.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#ck)"/><rect width="360" height="132" fill="url(#ckd)"/>
     ${[[180, 18, -6, '#fef3c7', 70, 64], [252, 26, 4, '#dbeafe', 64, 58], [318, 14, -3, '#dcfce7', 56, 70], [210, 74, 3, '#fce7f3', 58, 44]].map(([x, y, r, c, w, h], i) => `<g transform="rotate(${r} ${x + w / 2} ${y})"><g class="ts-flut" style="animation-delay:${i * .6}s;transform-origin:${x + w / 2}px ${y}px"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>${[0, 1, 2].map(k => `<rect x="${x + 8}" y="${y + 14 + k * 10}" width="${w - 16 - k * 8}" height="3" rx="1.5" fill="#000" opacity=".15"/>`).join('')}<circle cx="${x + w / 2}" cy="${y + 4}" r="3.6" fill="#dc2626"/></g></g>`).join('')}`,
    `<pattern id="ckd" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#7c4a1e" opacity=".35"/><circle cx="4" cy="4" r=".6" fill="#fff" opacity=".18"/></pattern>` + lg('ck', '#c08a52', '#a16b38', 1, 1)) },
  business: { a: '#a07a2c', a2: '#0f3b2e', bg: '#faf7ef', eb: 'Halal directory', tl: 'Luton businesses our listeners trust.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[0, 1, 2].map(i => { const x = 180 + i * 62, c = ['#0f3b2e', '#a07a2c', '#7a2e4d'][i]; return `<g><rect x="${x}" y="46" width="56" height="70" fill="#fffdf6"/><path d="M${x - 4} 34h64l-4 18h-56z" fill="${c}"/>${[0, 1, 2, 3].map(k => `<path d="M${x - 4 + k * 16} 52a8 8 0 0 0 16 0" fill="${k % 2 ? '#fff' : c}"/>`).join('')}<rect x="${x + 6}" y="66" width="20" height="50" fill="${c}" opacity=".85"/><rect x="${x + 31}" y="66" width="18" height="22" fill="#cde8f5"/></g>`; }).join('')}<rect y="116" width="360" height="16" fill="#d6c7a6"/>`,
    lg('g1', '#fdf3d9', '#f4e3bb')) },
  hijri: { a: '#3730a3', a2: '#fcd34d', bg: '#f4f4fb', eb: 'Hijri calendar', tl: 'Follow the moon through the months.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(26, 5, 6, 120, 0)}${[0, 1, 2, 3, 4, 5, 6].map(i => { const x = 196 + i * 25, ph = [.15, .35, .6, 1, .6, .35, .15][i]; return `<g transform="translate(${x} 66) scale(.85)"><circle r="11" fill="#1e1b4b"/><circle r="11" fill="#fde68a" clip-path="url(#c${i})"/><clipPath id="c${i}"><rect x="${i < 3 ? 11 - 22 * ph : -11}" y="-11" width="${22 * ph}" height="22"/></clipPath>${i === 3 ? '<circle r="15" fill="none" stroke="#fde68a" stroke-opacity=".4"/>' : ''}</g>`; }).join('')}`,
    lg('g1', '#1e1b4b', '#312e81', 1, 1)) },
  ramadan: { a: '#4338ca', a2: '#f6c453', bg: '#f4f3fb', eb: 'Ramadan', tl: 'Suhur, iftar and every night in between.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(24, 7)}${crescent(320, 34, 15, '#f6d36b')}${lantern(170, 64, 1, '#f6c453', 0)}${lantern(214, 84, 1.25, '#e07a5f', 1)}${lantern(262, 58, .95, '#f6c453', 2)}<path d="M0 118q180-16 360 0v14H0z" fill="#1e1b4b"/>${dome(300, 112, .55, '#1e1b4b')}`,
    lg('g1', '#1e1b4b', '#4338ca', 1, 1) + rg('tsglow', 'rgba(255,215,122,.55)', 'rgba(255,215,122,0)')) },
  dates: { a: '#3730a3', a2: '#fcd34d', bg: '#f4f4fb', eb: 'Islamic dates', tl: 'The blessed months, ready every year.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${stars(28, 11, 4, 124, 0)}${crescent(270, 66, 30, '#fde68a')}<circle cx="262" cy="66" r="48" fill="url(#gl)"/>`,
    lg('g1', '#0f172a', '#3730a3', 1, 1) + rg('gl', 'rgba(253,230,138,.35)', 'rgba(253,230,138,0)')) },
  money: { a: '#0f766e', a2: '#1e3a8a', bg: '#f3f7f8', eb: 'Halal money', tl: 'Clear rules, real tools, no interest.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[30, 46, 38, 60, 54, 76, 70].map((h, i) => `<rect x="${170 + i * 24}" y="${112 - h}" width="14" height="${h}" rx="4" fill="${i === 6 ? '#5eead4' : 'rgba(255,255,255,.28)'}" class="ts-grow" style="animation-delay:${i * .08}s;transform-origin:0 112px"/>`).join('')}<path d="M170 78L194 66L218 72L242 52L266 58L290 36L314 42" fill="none" stroke="#5eead4" stroke-width="2.4" stroke-linecap="round"/><circle cx="314" cy="42" r="4" fill="#5eead4"/>`,
    lg('g1', '#0f172a', '#134e4a', 1, 1)) },
  zakat: { a: '#047857', a2: '#d4a72c', bg: '#f2f8f5', eb: 'Zakat & giving', tl: 'Purify your wealth, and see where it goes.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[[200, 5], [236, 7], [272, 4], [308, 6]].map(([x, n]) => Array.from({ length: n }, (_, k) => `<ellipse cx="${x}" cy="${110 - k * 7}" rx="14" ry="5" fill="${k === n - 1 ? '#f6d36b' : '#d4a72c'}" stroke="#a27b12" stroke-width="1"/>`).join('')).join('')}<circle cx="236" cy="34" r="10" fill="#f6d36b" class="ts-drop"/>`,
    lg('g1', '#3b2a8f', '#5a3fd1', 1, 1)) },
  inherit: { a: '#4338ca', a2: '#a5b4fc', bg: '#f4f4fc', eb: 'Inheritance', tl: 'Every share, as Allah set it out.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><g stroke="#99f6e4" stroke-width="2" fill="none"><path d="M255 30v24M200 54h110M200 54v20M255 54v20M310 54v20M200 74h-22M200 74h22M310 74v26"/></g>${[[255, 26, 9], [200, 78, 8], [255, 78, 8], [310, 78, 8], [178, 104, 6], [222, 104, 6], [310, 104, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ccfbf1" stroke="#2dd4bf" stroke-width="2"/>`).join('')}`,
    lg('g1', '#134e4a', '#0f766e', 1, 1)) },
  salah: { a: '#0284c7', a2: '#22c55e', bg: '#f1f8fd', eb: 'Learn to pray', tl: 'Step by step, at your own pace.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><g transform="translate(250 92) skewX(-14)"><rect x="-52" y="-30" width="104" height="44" rx="6" fill="#16a34a"/><rect x="-46" y="-24" width="92" height="32" rx="4" fill="none" stroke="#bbf7d0" stroke-width="2"/><path d="M-12 -24v-0a12 12 0 0 1 24 0" fill="none" stroke="#bbf7d0" stroke-width="2"/></g>${[1, 2, 3, 4].map(i => `<g transform="translate(170 ${18 + i * 24})"><circle cx="20" r="9" fill="${i < 3 ? '#fff' : 'rgba(255,255,255,.35)'}"/><text x="20" y="3.5" text-anchor="middle" font-size="10" font-weight="800" fill="#0284c7" font-family="DM Sans,system-ui">${i}</text></g>`).join('')}`,
    lg('g1', '#0ea5e9', '#0369a1', 1, 1)) },
  stories: { a: '#9a3412', a2: '#f59e0b', bg: '#fbf5ec', eb: 'Quran stories', tl: 'The prophets, their people and their lessons.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><circle cx="300" cy="38" r="16" fill="#fff1c1"/><path d="M0 92q60-12 120 0t120 0 120 0v40H0z" fill="#3b82a0" opacity=".85"/><path d="M0 104q60-10 120 0t120 0 120 0v28H0z" fill="#2c6a85"/>
     <g class="ts-bob"><path d="M178 88h84l-12 16h-60z" fill="#7c3f12"/><rect x="194" y="70" width="52" height="18" rx="2" fill="#a2541a"/><path d="M200 70l20-14 20 14z" fill="#7c3f12"/></g>`,
    lg('g1', '#f7c983', '#f4e1b8')) },
  hajj: { a: '#b45309', a2: '#0f3b2e', bg: '#fbf6ee' },
  kids: { a: '#7c3aed', a2: '#f59e0b', bg: '#fbf7ff', kids: 1, eb: 'Kids\' corner', tl: 'Stories, letters and quizzes. Bismillah, let\'s go!', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/>${[[180, 30, 1], [300, 24, .8], [240, 56, .6]].map(([x, y, s], i) => `<g class="ts-float" style="animation-delay:${i * .7}s"><g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><circle r="12"/><circle cx="14" cy="4" r="10"/><circle cx="-14" cy="4" r="9"/><rect x="-22" y="2" width="44" height="12" rx="6"/></g></g>`).join('')}
     ${star8(330, 60, 10, '#fde047')}${star8(196, 30, 7, '#fb7185')}${crescent(214, 18, 9, '#fde047')}
     <path d="M190 132a90 60 0 0 1 220 0" fill="none" stroke="#fb7185" stroke-width="7" opacity=".85"/><path d="M202 132a78 50 0 0 1 196 0" fill="none" stroke="#fbbf24" stroke-width="7" opacity=".85"/><path d="M214 132a66 40 0 0 1 172 0" fill="none" stroke="#34d399" stroke-width="7" opacity=".85"/><path d="M226 132a54 30 0 0 1 148 0" fill="none" stroke="#60a5fa" stroke-width="7" opacity=".85"/>
     <g transform="translate(300 116)"><g class="ts-bounce"><rect x="-26" y="-22" width="52" height="22" rx="4" fill="#f97316"/><rect x="-24" y="-20" width="23" height="18" rx="2" fill="#fff7ed"/><rect x="1" y="-20" width="23" height="18" rx="2" fill="#ffedd5"/></g></g>`,
    lg('g1', '#e11d48', '#fda4af', 1, 1)) },
  feel: { a: '#7c6fd6', a2: '#f6a5c0', bg: '#f8f6fd', eb: 'How I feel', tl: 'Breathe. You don\'t have to carry it alone.', scene: () => svg(
    `<rect width="360" height="132" fill="url(#g1)"/><circle cx="250" cy="66" r="44" fill="url(#b1)" class="ts-breathe"/><circle cx="250" cy="66" r="28" fill="#fff" opacity=".55" class="ts-breathe" style="animation-delay:.4s"/><circle cx="180" cy="104" r="40" fill="url(#b2)"/><circle cx="330" cy="20" r="34" fill="url(#b3)"/>`,
    lg('g1', '#ccfbf1', '#e0f2fe', 1, 1) + rg('b1', '#c4b5fd', '#c4b5fd') + rg('b2', '#fbcfe8', '#fbcfe8') + rg('b3', '#bae6fd', '#bae6fd')) },
  dress: { a: '#2f7d32', a2: '#a8a49d', bg: '#f5f8f1' },
  wall: { a: '#0f3b2e', a2: '#a8a49d', bg: '#f5f8f1' }
};

/* each tool's colour comes from its Toolbox icon, so the inside matches the tile people tapped */
const TILE = { ayah: ['#fb923c', '#c2410c'], track: ['#bebcb7', '#66645f'], tasbih: ['#ffd76e', '#c4870f'], qibla: ['#5fe0cf', '#0a7a73'], weather: ['#7cc7f2', '#2f6fd0'], quran: ['#2f4f8f', '#0f1d3d'],
  feel: ['#5eead4', '#0e7490'], duas: ['#ffb38a', '#e0573a'], alerts: ['#ff8fc4', '#c0306f'], jamaat: ['#4ade80', '#047857'], jummah: ['#7cc8ff', '#1f5fbf'],
  janazah: ['#94a3b8', '#1e293b'], notices: ['#fcd34d', '#d97706'], business: ['#f9a8d4', '#be185d'], hijri: ['#c4b5fd', '#6d28d9'], ramadan: ['#6b8cff', '#1e40af'],
  dates: ['#8f96e8', '#3a3f8f'], money: ['#5eead4', '#0f766e'], zakat: ['#b9a3ff', '#5a3fd1'], inherit: ['#5eead4', '#0f766e'], salah: ['#7cc8ff', '#0284c7'],
  dress: ['#a8a49d', '#2f7d32'], stories: ['#a7c4a0', '#2f5d3a'], hajj: ['#fde68a', '#b45309'], kids: ['#fda4af', '#e11d48'], wall: ['#c1bfba', '#5e5c57'] };
Object.entries(TILE).forEach(([k, [l, d]]) => { T[k] = Object.assign(T[k] || {}, { a: d, a2: l, tint: l }); });
/* sky that follows the time of day (prayer alerts + prayer page clock) */
function skyKey() { const h = new Date().getHours() + new Date().getMinutes() / 60; return h < 5 ? 'night' : h < 7.5 ? 'dawn' : h < 16 ? 'day' : h < 19 ? 'dusk' : 'night'; }
const SKY = { dawn: ['#fbc2a4', '#7f8fd4', '#ffe1a8'], day: ['#7cc7f2', '#2f86d6', '#fff4b0'], dusk: ['#f7a072', '#6d4ea8', '#ffd38a'], night: ['#0f1a3d', '#1e2b5c', '#e8eefc'] };
function skyScene() { const k = skyKey(), [a, b, sun] = SKY[k], night = k === 'night'; const pos = { dawn: [190, 96], day: [270, 34], dusk: [320, 86], night: [300, 34] }[k];
  return svg(`<rect width="360" height="132" fill="url(#g1)"/>${night ? stars(30, 13, 4, 100, 0) : ''}${night ? crescent(pos[0], pos[1], 14, sun) : `<circle cx="${pos[0]}" cy="${pos[1]}" r="16" fill="${sun}"/><circle cx="${pos[0]}" cy="${pos[1]}" r="40" fill="url(#gl)"/>`}
    <path d="M0 116h360v16H0z" fill="${night ? '#0b1230' : '#1f2937'}" opacity=".85"/>${dome(250, 104, .62, night ? '#0b1230' : '#1f2937')}`, lg('g1', b, a) + rg('gl', sun, sun)); }
function mapScene() { return svg(`<rect width="360" height="132" fill="#e8f1ea"/><g stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"><path d="M-10 92C80 80 140 110 220 70S330 40 370 50"/><path d="M190 -10C200 40 180 80 230 140"/><path d="M290 -10L300 140"/></g><g stroke="#cfe3d4" stroke-width="3" fill="none"><path d="M120 -10L160 140M-10 40H370"/></g>
  <rect x="236" y="14" width="40" height="26" rx="6" fill="#bfe3c5"/><circle cx="330" cy="104" r="16" fill="#cfe6f5"/>
  ${[[214, 66, '#1d72c2', 1], [300, 44, '#2f7d32', 0], [170, 96, '#2f7d32', 0], [330, 94, '#2f7d32', 0]].map(([x, y, c, big]) => `<g transform="translate(${x} ${y})"><g class="${big ? 'ts-bounce' : ''}"><path d="M0 0c-8-10-12-15-12-21a12 12 0 0 1 24 0c0 6-4 11-12 21z" fill="${c}" transform="scale(${big ? 1.2 : .9})"/><circle cy="-21" r="4.6" fill="#fff" transform="scale(${big ? 1.2 : .9})"/></g></g>`).join('')}`); }

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
  if (kind === 'confetti') return N(18, (i, n) => { const a = i / n * Math.PI * 2, r = 60 + (i * 37) % 60; return `<i class="tsi-p tsi-conf" style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r).toFixed(0)}px;--r:${i * 47}deg;--d:${(i % 5) * 20}ms;background:${['#fb7185', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'][i % 5]}"></i>`; });
  return '';
}
/* opening a tool from its tile: like tapping an app on an iPhone home screen. The icon dims, then the tool zooms up
   out of the icon to fill the screen (the menu bar docks at the same time and stays on top). */
function intro(k) {
  if (!pend || Date.now() - pend.t > 2000 || lowEnd() || !pend.rc) { pend = null; return; } if (pend.k !== k) { pend = null; return; }
  const p = pend; pend = null; lastEl = p.el; lastRc = p.rc; const w = document.getElementById('scrWrap'), scr = document.getElementById('scr'); if (!w || !scr || !scr.animate) return;
  const rc = p.rc, W = innerWidth, Hh = innerHeight, sx = rc.width / W, sy = rc.height / Hh, dx = rc.left, dy = rc.top;
  const th = T[k] || { a: '#2f7d32', a2: '#a8a49d' };
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
