/* Inspire FM · detailed illustrations for updates and events that have no photo of their own.
   window.IFM_GFX(kind) returns an SVG string (600 × 316). Kinds: quran, iam, appeal, talk, panto, comedy, conference, qawwali, night, radio. */
(function () {
'use strict';
let n = 0;
const W = 600, H = 316;
const wrap = (id, bg, body) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${bg}</defs>${body}</svg>`;
const stars = (c, k, y1 = 0, y2 = 170) => { let s = ''; for (let i = 0; i < k; i++) { const x = (i * 137.5) % W, y = y1 + ((i * 71.3) % (y2 - y1)), r = .8 + (i % 3) * .55; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}" opacity="${.35 + (i % 4) * .15}"/>`; } return s; };
const star8 = (x, y, r, c, o = 1) => { const p = []; for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i, rr = i % 2 ? r * .55 : r; p.push((x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1)); } return `<polygon points="${p.join(' ')}" fill="${c}" opacity="${o}"/>`; };
const pattern = (id, c, o) => `<pattern id="${id}" width="56" height="56" patternUnits="userSpaceOnUse"><g fill="none" stroke="${c}" stroke-width="1.2" opacity="${o}"><path d="M28 4 34 22 52 28 34 34 28 52 22 34 4 28 22 22Z"/><circle cx="28" cy="28" r="7"/></g></pattern>`;
const lantern = (x, y, s, glow) => `<g transform="translate(${x} ${y}) scale(${s})"><line x1="0" y1="-60" x2="0" y2="-26" stroke="#b0a383" stroke-width="2"/><circle cx="0" cy="0" r="34" fill="${glow}" opacity=".25"/><path d="M-10 -26h20l4 8h-28z" fill="#b0a383"/><path d="M-16 -18h32l-4 34h-24z" fill="#c0af89" opacity=".95"/><path d="M-16 -18h32l-4 34h-24z" fill="none" stroke="#685a42" stroke-width="2"/><path d="M-8 -14v26M0 -14v28M8 -14v26" stroke="#685a42" stroke-width="1.5" opacity=".6"/><path d="M-12 16h24l-4 8h-16z" fill="#b0a383"/><circle cx="0" cy="0" r="6" fill="#f1eee4"/></g>`;
const masjid = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><rect x="-120" y="-40" width="240" height="40"/><path d="M-60 -40a60 60 0 0 1 120 0z"/><rect x="-4" y="-118" width="8" height="18"/><path d="M0 -128a8 8 0 1 0 6 12 6 6 0 1 1 -6 -12z"/><rect x="-150" y="-120" width="18" height="120"/><path d="M-151 -120l10 -22 10 22z"/><rect x="132" y="-120" width="18" height="120"/><path d="M131 -120l10 -22 10 22z"/><path d="M-110 -40a22 22 0 0 1 44 0zM66 -40a22 22 0 0 1 44 0z"/></g>`;

const S = {
  quran() { const i = ++n; return wrap(i, `<linearGradient id="q${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2c27"/><stop offset="1" stop-color="#0e1715"/></linearGradient><radialGradient id="ql${i}" cx="50%" cy="58%" r="45%"><stop offset="0" stop-color="#e1dac6" stop-opacity=".75"/><stop offset="1" stop-color="#e1dac6" stop-opacity="0"/></radialGradient>${pattern('qp' + i, '#b0a383', .14)}`,
    `<rect width="${W}" height="${H}" fill="url(#q${i})"/><rect width="${W}" height="${H}" fill="url(#qp${i})"/>
    <path d="M190 316V150a110 110 0 0 1 220 0v166" fill="#213731" stroke="#b0a383" stroke-width="3"/><path d="M206 316V154a94 94 0 0 1 188 0v162" fill="none" stroke="#b0a383" stroke-width="1.2" opacity=".6"/>
    <ellipse cx="300" cy="190" rx="200" ry="120" fill="url(#ql${i})"/>
    ${star8(300, 92, 16, '#b0a383', .9)}
    <g transform="translate(300 230)"><path d="M-110 50 0 -6 110 50" fill="none" stroke="#5d4b3b" stroke-width="16" stroke-linecap="round"/><path d="M-110 -6 0 50 110 -6" fill="none" stroke="#76614c" stroke-width="16" stroke-linecap="round"/>
      <path d="M0 -8C-30 -30 -80 -34 -118 -22L-112 18C-76 8 -32 10 0 28Z" fill="#faf8f5"/><path d="M0 -8C30 -30 80 -34 118 -22L112 18C76 8 32 10 0 28Z" fill="#f4f1eb"/>
      <path d="M0 -8V28" stroke="#a5997e" stroke-width="2"/>
      <g stroke="#3b4c42" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"><path d="M-100 -16q12 -5 24 0t24 0t24 0"/><path d="M-100 -4q12 -5 24 0t24 0t24 0"/><path d="M-98 8q12 -5 24 0t24 0t22 0"/><path d="M24 -16q12 -5 24 0t24 0t24 0"/><path d="M24 -4q12 -5 24 0t24 0t24 0"/><path d="M26 8q12 -5 24 0t24 0t22 0"/></g>
      <path d="M-118 -22C-80 -34 -30 -30 0 -8" fill="none" stroke="#b0a383" stroke-width="3"/><path d="M118 -22C80 -34 30 -30 0 -8" fill="none" stroke="#b0a383" stroke-width="3"/></g>
    ${lantern(92, 110, 1.05, '#cbbf9f')}${lantern(508, 96, .85, '#cbbf9f')}
    ${stars('#e0d9c4', 26, 10, 120)}
    <g transform="translate(520 250)">${star8(0, 0, 26, '#b0a383', .25)}</g><g transform="translate(70 262)">${star8(0, 0, 20, '#b0a383', .22)}</g>`); },

  iam() { const i = ++n; return wrap(i, `<linearGradient id="a${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#473652"/><stop offset=".6" stop-color="#684d6f"/><stop offset="1" stop-color="#8e697b"/></linearGradient><linearGradient id="as${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ece4ed"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#a${i})"/>
    <g opacity=".12" fill="#fff">${Array.from({ length: 9 }, (_, k) => `<circle cx="${60 + k * 64}" cy="${40 + (k % 3) * 110}" r="${18 + (k % 4) * 8}"/>`).join('')}</g>
    <g transform="translate(300 160)">
      <path d="M0 -112 86 -84V-10C86 50 46 88 0 108C-46 88 -86 50 -86 -10V-84Z" fill="url(#as${i})" stroke="#fff" stroke-width="4"/>
      <path d="M0 -94 70 -71V-12C70 38 38 70 0 88Z" fill="#e5dce8"/>
      <path d="M0 62C-40 34 -52 10 -52 -8a24 24 0 0 1 52 -10 24 24 0 0 1 52 10C52 10 40 34 0 62Z" fill="#ae778a"/>
      <path d="M-30 -14a14 14 0 0 1 18 -8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    </g>
    <g transform="translate(470 70)"><path d="M0 0a26 26 0 1 0 20 44 22 22 0 1 1 -20 -44z" fill="#cbbe9f"/>${star8(34, 8, 9, '#cbbe9f')}</g>
    <g opacity=".95">${[['#d8c9ba',60],['#705f54',118],['#bba998',176],['#4a3e38',424],['#aa9788',482],['#d6c6b9',540]].map(([c,x],k)=>`<g transform="translate(${x} ${262+(k%2)*8})"><circle r="16" fill="${c}"/>${k%3===0?`<path d="M-18 -2a18 18 0 0 1 36 0v22h-36z" fill="#2c2632"/>`:''}<rect x="-22" y="16" width="44" height="60" rx="18" fill="${['#ae778a','#cbbe9f','#6b9a9d','#a4a3a1','#c6a395','#ffffff'][k]}"/></g>`).join('')}</g>
    <g fill="#fff" opacity=".9"><rect x="234" y="276" width="132" height="30" rx="15" width="132" height="34" rx="17" fill="#fff" opacity=".18"/><text x="300" y="296" font-family="system-ui,sans-serif" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="1.5">DON'T LET IT SLIDE</text></g>`); },

  appeal() { const i = ++n; return wrap(i, `<linearGradient id="p${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25313f"/><stop offset="1" stop-color="#3b4d5c"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#p${i})"/>${stars('#e8ecf2', 30, 8, 150)}
    <path d="M440 46a30 30 0 1 0 22 52 26 26 0 1 1 -22 -52z" fill="#dfd7c3"/>
    ${masjid(300, 252, 1.05, '#1d2630')}
    <rect x="0" y="252" width="${W}" height="64" fill="#1d2630"/>
    <g transform="translate(300 214)"><path d="M-74 -10h148l-8 82h-132z" fill="#9c846b"/><path d="M-74 -10h148l-8 82h-132z" fill="none" stroke="#5c4b3a" stroke-width="3"/><path d="M-80 -22h160v16h-160z" fill="#b59f85"/><path d="M-14 -22h28v94h-28z" fill="#93625c" opacity=".9"/>
      <rect x="-60" y="-58" width="26" height="40" rx="4" fill="#e1ded9"/><rect x="-60" y="-50" width="26" height="12" fill="#93625c"/>
      <ellipse cx="44" cy="-40" rx="30" ry="18" fill="#c0ad92"/><path d="M20 -44q24 -12 48 0" stroke="#8b765d" stroke-width="3" fill="none"/>
      <rect x="-24" y="-66" width="20" height="48" rx="3" fill="#f1f0ee"/><rect x="-24" y="-56" width="20" height="10" fill="#52708d"/>
      <path d="M0 40C-14 30 -20 22 -20 14a10 10 0 0 1 20 -4 10 10 0 0 1 20 4C20 22 14 30 0 40Z" fill="#fff"/></g>
    <g fill="#fff" opacity=".85">${Array.from({ length: 22 }, (_, k) => `<circle cx="${(k * 97) % W}" cy="${(k * 53) % 240}" r="${1.4 + (k % 3)}"/>`).join('')}</g>`); },

  talk() { const i = ++n; return wrap(i, `<linearGradient id="t${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#201d27"/><stop offset="1" stop-color="#312b3c"/></linearGradient><linearGradient id="tb${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece9dc" stop-opacity=".55"/><stop offset="1" stop-color="#ece9dc" stop-opacity="0"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#t${i})"/><path d="M250 0h100l90 316H160z" fill="url(#tb${i})"/>
    <rect x="0" y="232" width="${W}" height="84" fill="#15121a"/>
    <g transform="translate(300 160)"><path d="M-46 0h92l-10 84h-72z" fill="#524237"/><path d="M-54 -8h108v14h-108z" fill="#6b5747"/><rect x="-14" y="24" width="28" height="22" rx="4" fill="#b0a383"/>
      <path d="M0 -8V-62" stroke="#888" stroke-width="4"/><rect x="-9" y="-92" width="18" height="34" rx="9" fill="#d6d8df"/><path d="M-9 -80h18M-9 -72h18" stroke="#888" stroke-width="2"/></g>
    <g fill="#0c0a0f">${Array.from({ length: 13 }, (_, k) => `<circle cx="${24 + k * 46}" cy="${262 + (k % 2) * 6}" r="17"/><rect x="${4 + k * 46}" y="${276 + (k % 2) * 6}" width="40" height="44" rx="16"/>`).join('')}</g>
    ${lantern(80, 92, .8, '#cbbf9f')}${lantern(520, 92, .8, '#cbbf9f')}`); },

  night() { const i = ++n; return wrap(i, `<linearGradient id="nn${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14171e"/><stop offset="1" stop-color="#2a303b"/></linearGradient><radialGradient id="ng${i}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#dfd7c3" stop-opacity=".6"/><stop offset="1" stop-color="#dfd7c3" stop-opacity="0"/></radialGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#nn${i})"/>${stars('#eff1f6', 44, 6, 200)}
    <circle cx="440" cy="86" r="70" fill="url(#ng${i})"/><path d="M440 50a36 36 0 1 0 28 62 32 32 0 1 1 -28 -62z" fill="#dfd7c3"/>
    <path d="M0 250Q150 210 300 236T600 226V316H0Z" fill="#181d24"/>
    <g fill="#0f1318"><path d="M70 250V170l-14 30 6 -40 -16 22 18 -50 18 50 -16 -22 6 40 -14 -30v80z"/><path d="M520 240V176l-12 26 5 -34 -14 18 16 -42 16 42 -14 -18 5 34 -12 -26v64z"/></g>
    <path d="M300 316C300 290 270 270 250 250" stroke="#3d444f" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
    ${lantern(250, 216, .7, '#cbbf9f')}`); },

  panto() { const i = ++n; return wrap(i, `<linearGradient id="c${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#583136"/><stop offset=".5" stop-color="#824a51"/><stop offset="1" stop-color="#583136"/></linearGradient><radialGradient id="cs${i}" cx="50%" cy="40%" r="55%"><stop offset="0" stop-color="#dfd7c3" stop-opacity=".55"/><stop offset="1" stop-color="#201416" stop-opacity="0"/></radialGradient>`,
    `<rect width="${W}" height="${H}" fill="#201416"/><rect width="${W}" height="${H}" fill="url(#cs${i})"/>
    <path d="M0 0h170c-10 80 -40 200 -110 316H0z" fill="url(#c${i})"/><path d="M600 0H430c10 80 40 200 110 316h60z" fill="url(#c${i})"/>
    <path d="M0 0h600v40c-50 18 -100 18 -150 0s-100 -18 -150 0 -100 18 -150 0 -100 -18 -150 0z" fill="#704046"/><path d="M0 40c50 18 100 18 150 0s100 -18 150 0 100 18 150 0 100 -18 150 0" stroke="#b0a383" stroke-width="4" fill="none"/>
    <rect x="120" y="270" width="360" height="46" fill="#44342a"/><rect x="120" y="266" width="360" height="8" fill="#b0a383"/>
    <g transform="translate(300 170)"><circle r="78" fill="#a18563"/>${Array.from({ length: 18 }, (_, k) => { const a = k / 18 * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 74).toFixed(1)}" cy="${(Math.sin(a) * 74).toFixed(1)}" r="18" fill="#85684d"/>`; }).join('')}
      <circle r="54" fill="#bba581"/><circle cx="-20" cy="-10" r="7" fill="#1e1712"/><circle cx="20" cy="-10" r="7" fill="#1e1712"/><path d="M-12 10h24l-12 12z" fill="#1e1712"/><path d="M0 22q-10 14 -22 8M0 22q10 14 22 8" stroke="#1e1712" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M-30 -60l10 -22 10 16 10 -20 10 20 10 -16 10 22z" fill="#cbbe9f" stroke="#85734d" stroke-width="2"/></g>
    ${stars('#dfd7c3', 14, 60, 140)}`); },

  comedy() { const i = ++n; return wrap(i, `<pattern id="b${i}" width="60" height="28" patternUnits="userSpaceOnUse"><rect width="60" height="28" fill="#2e2422"/><path d="M0 0h60M0 14h60M30 0v14M0 14v14M60 14v14" stroke="#1c1514" stroke-width="3"/></pattern><radialGradient id="bs${i}" cx="50%" cy="45%" r="40%"><stop offset="0" stop-color="#eae6d9" stop-opacity=".85"/><stop offset="1" stop-color="#eae6d9" stop-opacity="0"/></radialGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#b${i})"/><ellipse cx="300" cy="150" rx="210" ry="150" fill="url(#bs${i})"/>
    <rect x="0" y="262" width="${W}" height="54" fill="#140f0e"/><ellipse cx="300" cy="266" rx="140" ry="16" fill="#eae6d9" opacity=".3"/>
    <g transform="translate(300 150)"><path d="M0 0V112M-40 112h80" stroke="#1f1f1f" stroke-width="7" stroke-linecap="round"/><path d="M0 0l40 -40" stroke="#1f1f1f" stroke-width="6"/><rect x="34" y="-70" width="22" height="40" rx="11" fill="#cecfd3" transform="rotate(45 45 -50)"/></g>
    <g font-family="system-ui,sans-serif" font-weight="900" fill="#cbbe9f"><text x="104" y="110" font-size="40" transform="rotate(-12 104 110)">HA!</text><text x="430" y="96" font-size="34" transform="rotate(10 430 96)">HA</text><text x="460" y="200" font-size="26" fill="#e4ced4" transform="rotate(-6 460 200)">HA!</text></g>
    <g fill="#0a0807">${Array.from({ length: 12 }, (_, k) => `<circle cx="${25 + k * 50}" cy="${292}" r="15"/>`).join('')}</g>`); },

  conference() { const i = ++n; return wrap(i, `<linearGradient id="f${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b222a"/><stop offset="1" stop-color="#2c3946"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#f${i})"/>
    <rect x="150" y="34" width="300" height="150" rx="10" fill="#14191e" stroke="#b0a383" stroke-width="3"/>
    <g transform="translate(300 109)">${star8(0, 0, 40, '#b0a383', .9)}<circle r="16" fill="#14191e"/><path d="M-60 54h120" stroke="#b0a383" stroke-width="3" opacity=".6"/></g>
    <g>${Array.from({ length: 4 }, (_, r) => Array.from({ length: 11 }, (_, k) => `<circle cx="${30 + k * 54 + (r % 2) * 27}" cy="${222 + r * 26}" r="${11 + r}" fill="#101418" opacity="${.65 + r * .1}"/>`).join('')).join('')}</g>
    ${lantern(70, 80, .75, '#cbbf9f')}${lantern(530, 80, .75, '#cbbf9f')}`); },

  qawwali() { const i = ++n; return wrap(i, `<linearGradient id="w${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c1c28"/><stop offset="1" stop-color="#5d3c47"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#w${i})"/>${stars('#f2e6ea', 24, 6, 140)}
    <g transform="translate(300 200)"><rect x="-120" y="-30" width="240" height="70" rx="8" fill="#5d4b3b"/><rect x="-120" y="-30" width="240" height="18" fill="#76614c"/>${Array.from({ length: 14 }, (_, k) => `<rect x="${-104 + k * 15}" y="-10" width="11" height="34" rx="2" fill="${k % 3 === 1 ? '#1f1f1f' : '#efede8'}"/>`).join('')}
      <path d="M-120 -30l-30 -40h300l-30 40" fill="#44352a"/></g>
    <g fill="#cbbe9f"><path d="M110 90v-44l26 -6v40" stroke="#cbbe9f" stroke-width="4" fill="none"/><circle cx="104" cy="92" r="9"/><circle cx="130" cy="84" r="9"/><path d="M470 120v-50" stroke="#cbbe9f" stroke-width="4"/><circle cx="463" cy="122" r="10"/><path d="M470 70q16 8 12 26" stroke="#cbbe9f" stroke-width="4" fill="none"/></g>
    ${lantern(300, 70, .8, '#cbbf9f')}`); },

  radio() { const i = ++n; return wrap(i, `<linearGradient id="r${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4947"/><stop offset="1" stop-color="#a4a3a1"/></linearGradient>`,
    `<rect width="${W}" height="${H}" fill="url(#r${i})"/>
    <g fill="none" stroke="#fff" stroke-width="5" opacity=".25">${[70, 110, 150, 190, 230].map(r => `<circle cx="300" cy="158" r="${r}"/>`).join('')}</g>
    <g transform="translate(300 158)"><rect x="-26" y="-74" width="52" height="96" rx="26" fill="#fff"/><path d="M-26 -36h52M-26 -20h52M-26 -4h52" stroke="#a4a3a1" stroke-width="4"/><path d="M-46 0a46 46 0 0 0 92 0" stroke="#fff" stroke-width="8" fill="none"/><path d="M0 46v28M-26 74h52" stroke="#fff" stroke-width="8" stroke-linecap="round"/></g>
    <text x="300" y="296" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="3" opacity=".9">INSPIRE FM 105.1</text>`); }
};
window.IFM_GFX = k => (S[k] || S.radio)();
})();
