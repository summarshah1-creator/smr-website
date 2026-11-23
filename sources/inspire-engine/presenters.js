/* Inspire FM · presenter and show pages.
   Every presenter gets a drawn silhouette portrait (green tones, unique headwear, hair, beard, clothes and props), a profile
   page (#tb-host-<slug>) and every show its own page (#tb-show-<key>). Bios only say what each person does on Inspire FM.
   The "project" on each page is EXAMPLE content to show what a presenter or show could run through the app. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, D, TOOLS, store, toast } = X;
const slug = n => n.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------------- silhouette portraits ---------------- */
const PAL = { lime: ['#a6d65a', '#2f5a10'], emerald: ['#5fc48a', '#0d3d28'], sage: ['#b9d58a', '#3d5a22'], teal: ['#56b8a2', '#0d3a35'], olive: ['#c3cf63', '#4a5414'], mint: ['#8fe0a8', '#14482c'], forest: ['#7cc35a', '#173d12'], moss: ['#9cc46a', '#28431a'] };
const DK = '#0a1d10', DK2 = '#041009', FACE = '#18401f';
function figure(c, rim, id) {
  const o = [], L = (d, w = 1.4, op = .5) => `<path d="${d}" fill="none" stroke="${rim}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`, F = `url(#f${id})`;
  const hij = (c.head || '').startsWith('hijab'), cloth = c.head === 'ghutra' || c.head === 'shemagh';
  const pr = c.prop;
  /* things behind the head */
  if (pr === 'sun') o.push(`<circle cx="164" cy="44" r="12" fill="${rim}" opacity=".5"/>`, L('M164 24 v-6 M184 44 h6 M178 30 l4 -4 M150 30 l-4 -4 M178 58 l4 4', 1.6, .5));
  if (pr === 'stars') o.push(`<g fill="${rim}" opacity=".6"><circle cx="40" cy="40" r="1.6"/><circle cx="160" cy="34" r="1.2"/><circle cx="172" cy="70" r="1.6"/><circle cx="28" cy="80" r="1.2"/><circle cx="150" cy="60" r="1"/></g>`, `<path d="M168 30 a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24z" fill="${rim}" opacity=".6"/>`);
  if (pr === 'city') o.push(`<path d="M0 200 L0 168 L14 168 L14 150 L30 150 L30 172 L40 172 L40 140 L52 140 L52 200Z" fill="${rim}" opacity=".18"/>`, `<path d="M148 200 L148 156 L162 156 L162 136 L176 136 L176 166 L188 166 L188 150 L200 150 L200 200Z" fill="${rim}" opacity=".18"/>`);
  if (c.head === 'ghutra' || c.head === 'shemagh') o.push(`<path d="M64 74 C62 44 138 44 136 74 C138 104 144 132 156 160 L172 200 L28 200 L44 160 C56 132 62 104 64 74Z" fill="${F}"/>`);
  if (hij) o.push(c.head === 'hijab-wrap' ? `<path d="M100 48 C62 46 58 82 64 108 C66 122 70 134 82 144 L118 144 C130 134 134 122 136 108 C142 82 138 46 100 48Z" fill="${F}"/>` : `<path d="M100 50 C62 50 58 84 60 112 C62 140 44 154 28 200 L172 200 C156 154 138 140 140 112 C142 84 138 50 100 50Z" fill="${F}"/>`);
  if (c.hair === 'long') o.push(`<path d="M68 92 C62 58 138 58 132 92 C136 120 140 140 146 158 L54 158 C60 140 64 120 68 92Z" fill="${F}"/>`);
  if (c.hair === 'bun') o.push(`<circle cx="100" cy="56" r="13" fill="${F}"/>`);
  if (c.hair === 'pony') o.push(`<path d="M126 74 C150 80 150 120 138 140 C140 116 134 98 124 88Z" fill="${F}"/>`);
  if (c.cloth === 'hoodie') o.push(`<path d="M62 158 C58 122 142 122 138 158Z" fill="${F}"/>`);
  /* shoulders and neck */
  const sw = c.broad ? 8 : c.slim ? -8 : 0;
  o.push(`<path d="M${12 - sw} 200 C${16 - sw} 166 ${52 - sw / 2} 150 100 150 C${148 + sw / 2} 150 ${184 + sw} 166 ${188 + sw} 200Z" fill="${F}"/>`, `<path d="M87 116 L86 154 L114 154 L113 116Z" fill="${F}"/>`);
  /* clothes */
  const cl = c.cloth;
  if (cl === 'thobe') o.push(L('M88 152 C92 160 108 160 112 152'), L('M100 158 L100 200'), L('M100 168 h0', 3, .7), L('M100 178 h0', 3, .7));
  if (cl === 'suit') o.push(L('M84 152 L100 186 L116 152'), L('M84 152 L72 200'), L('M116 152 L128 200'), `<path d="M96 158 L100 156 L104 158 L102 186 L100 190 L98 186Z" fill="${rim}" opacity=".35"/>`);
  if (cl === 'blazer') o.push(L('M86 152 L100 180 L114 152'), L('M86 152 L76 200'), L('M114 152 L124 200'), L('M100 180 L100 200', 1, .3));
  if (cl === 'hoodie') o.push(L('M78 152 C84 170 116 170 122 152'), L('M92 164 L90 186', 1.6), L('M108 164 L110 186', 1.6), `<circle cx="90" cy="188" r="2" fill="${rim}" opacity=".6"/><circle cx="110" cy="188" r="2" fill="${rim}" opacity=".6"/>`);
  if (cl === 'jersey') o.push(L('M86 152 L100 172 L114 152'), L('M30 178 C46 164 62 158 76 156', 4, .4), L('M170 178 C154 164 138 158 124 156', 4, .4), `<text x="140" y="190" font-size="15" font-family="Saira,sans-serif" font-weight="800" fill="${rim}" opacity=".5">10</text>`);
  if (cl === 'jacket') o.push(L('M90 152 L94 200'), L('M110 152 L106 200'), L('M84 152 L80 162 L90 170', 1.4), L('M116 152 L120 162 L110 170', 1.4));
  if (cl === 'abaya') o.push(L('M100 154 L100 200', 1, .3), L('M70 170 C80 180 90 186 100 188', 1, .3));
  if (c.scarf) o.push(`<path d="M70 152 C90 160 116 158 132 150 L140 158 C124 176 96 182 64 166Z" fill="${rim}" opacity=".22"/>`);
  /* head */
  if (hij) o.push(`<ellipse cx="100" cy="102" rx="${c.head === 'hijab-wrap' ? 24 : 22}" ry="28" fill="${FACE}"/>`);
  else if (cloth) o.push(`<ellipse cx="100" cy="100" rx="24" ry="30" fill="${FACE}"/>`);
  else o.push(`<ellipse cx="100" cy="96" rx="29" ry="35" fill="${F}"/>`, `<path d="M71 96 C71 74 82 62 100 61" fill="none" stroke="${rim}" stroke-width="1.6" opacity=".55"/>`);
  if (!hij && !cloth && c.ears !== false) o.push(`<ellipse cx="71" cy="100" rx="5" ry="9" fill="${F}"/><ellipse cx="129" cy="100" rx="5" ry="9" fill="${F}"/>`);
  /* hair */
  const h = c.hair;
  if (h === 'short' || h === 'bun' || h === 'pony') o.push(`<path d="M70 92 C66 58 134 58 130 92 C126 76 114 70 100 70 C86 70 74 76 70 92Z" fill="${DK2}"/>`);
  if (h === 'quiff') o.push(`<path d="M70 92 C64 56 104 44 132 66 C136 74 134 84 130 92 C124 76 114 72 100 72 C86 72 74 76 70 92Z" fill="${DK2}"/>`, L('M86 58 C98 50 116 52 126 62', 1.2, .45));
  if (h === 'curly') o.push(`<g fill="${DK2}">${[[72, 84], [76, 70], [86, 61], [100, 58], [114, 61], [124, 70], [128, 84], [80, 76], [94, 66], [108, 66], [120, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</g>`, L('M78 66 a6 6 0 0 1 8 -4 M104 58 a6 6 0 0 1 8 2', 1, .4));
  if (h === 'long') o.push(`<path d="M70 94 C66 58 134 58 130 94 C124 74 112 66 100 66 C88 66 76 74 70 94Z" fill="${DK2}"/>`);
  if (h === 'bald') o.push(`<path d="M80 72 C88 64 100 62 110 64" fill="none" stroke="${rim}" stroke-width="2.4" opacity=".35" stroke-linecap="round"/>`);
  /* beard */
  const b = c.beard, bp = { stubble: 'M72 104 C74 126 86 134 100 134 C114 134 126 126 128 104 C122 122 78 122 72 104Z', short: 'M71 100 C72 128 86 142 100 142 C114 142 128 128 129 100 C124 116 112 120 100 120 C88 120 76 116 71 100Z', full: 'M70 96 C70 132 84 152 100 154 C116 152 130 132 130 96 C126 116 114 122 100 122 C86 122 74 116 70 96Z', long: 'M70 96 C70 138 86 170 100 176 C114 170 130 138 130 96 C126 116 114 122 100 122 C86 122 74 116 70 96Z' };
  if (b) o.push(`<path d="${bp[b]}" fill="${b === 'stubble' ? DK : DK2}"/>`, b !== 'stubble' ? L(`M86 ${b === 'long' ? 140 : 132} l2 10 M100 ${b === 'long' ? 150 : 138} l0 10 M114 ${b === 'long' ? 140 : 132} l-2 10`, 1, .3) : '');
  if (b && !hij) o.push(`<path d="M90 120 C96 124 104 124 110 120" fill="none" stroke="${rim}" stroke-width="1" opacity=".25"/>`);
  /* headwear */
  const hw = c.head;
  if (hw === 'kufi') o.push(`<path d="M71 80 C72 56 128 56 129 80Z" fill="${DK2}"/>`, L('M71 80 L129 80', 1.4, .55), `<g fill="${rim}" opacity=".45">${[78, 88, 100, 112, 122].map(x => `<circle cx="${x}" cy="74" r="1.3"/>`).join('')}${[86, 100, 114].map(x => `<circle cx="${x}" cy="66" r="1.3"/>`).join('')}</g>`);
  if (hw === 'crochet') o.push(`<path d="M70 82 C70 54 130 54 130 82Z" fill="${DK2}"/>`, L('M70 82 L130 82', 1.4, .55), ...[78, 89, 100, 111, 122].map(x => L(`M100 58 L${x} 81`, .9, .35)), L('M74 72 C90 66 110 66 126 72', .9, .35));
  if (hw === 'imama') o.push(`<path d="M64 88 C58 52 142 52 136 88 C124 78 76 78 64 88Z" fill="${DK2}"/>`, L('M66 80 C84 70 116 64 134 76', 1.3, .5), L('M68 70 C86 60 114 56 132 66', 1.3, .4), L('M80 60 C92 54 108 52 122 58', 1.3, .35), `<path d="M128 80 C142 98 142 128 134 152" fill="none" stroke="${DK2}" stroke-width="10" stroke-linecap="round"/>`, L('M131 84 C142 100 141 126 135 148', 1, .35));
  if (hw === 'cap' || hw === 'capback') o.push(`<path d="M69 86 C68 56 132 56 131 86Z" fill="${DK2}"/>`, hw === 'cap' ? `<path d="M64 86 L142 86 C152 86 154 94 142 94 L66 94Z" fill="${DK2}"/>` : `<path d="M114 60 C126 58 138 62 142 68 L126 70Z" fill="${DK2}"/>`, L('M100 58 L100 86', 1, .3), `<circle cx="100" cy="58" r="2.5" fill="${rim}" opacity=".5"/>`);
  if (cloth) { o.push(`<path d="M68 76 C70 50 130 50 132 76 C116 70 84 70 68 76Z" fill="${DK}"/>`); if (hw === 'ghutra') o.push(`<path d="M66 70 C70 52 130 52 134 70" fill="none" stroke="${DK2}" stroke-width="6"/>`, `<path d="M67 77 C72 60 128 60 133 77" fill="none" stroke="${DK2}" stroke-width="6"/>`, L('M66 70 C70 52 130 52 134 70', 1, .5)); else o.push(`<g fill="${rim}" opacity=".3">${[[60, 110], [66, 130], [56, 150], [140, 110], [134, 130], [144, 150], [50, 176], [150, 176]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="5" transform="rotate(45 ${x} ${y})"/>`).join('')}</g>`); o.push(L('M64 74 C60 104 52 140 36 190', 1.2, .35), L('M136 74 C140 104 148 140 164 190', 1.2, .35)); }
  if (hij) { o.push(L(c.head === 'hijab-wrap' ? 'M76 84 C84 66 116 66 124 84' : 'M78 82 C84 70 116 70 122 82', 1.2, .45), L('M64 120 C70 140 60 160 46 190', 1.1, .3), L('M136 120 C130 140 140 160 154 190', 1.1, .3));
    if (c.head === 'hijab-wrap') o.push(`<circle cx="100" cy="52" r="10" fill="${DK2}"/>`, L('M92 50 C96 44 104 44 108 50', 1, .5));
    if (c.head === 'hijab-pattern') o.push(`<ellipse cx="100" cy="102" rx="26" ry="32" fill="none" stroke="${rim}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round" opacity=".7"/>`);
    if (c.head === 'hijab-pin') o.push(`<circle cx="120" cy="132" r="3" fill="${rim}" opacity=".8"/>`); }
  /* glasses */
  if (c.glasses) { const y = hij || cloth ? 98 : 92; o.push(c.glasses === 'sun' ? `<rect x="78" y="${y}" width="19" height="11" rx="4" fill="${rim}" opacity=".55"/><rect x="103" y="${y}" width="19" height="11" rx="4" fill="${rim}" opacity=".55"/>` : `<rect x="79" y="${y}" width="18" height="12" rx="${c.glasses === 'round' ? 6 : 3}" fill="none" stroke="${rim}" stroke-width="1.8" opacity=".8"/><rect x="103" y="${y}" width="18" height="12" rx="${c.glasses === 'round' ? 6 : 3}" fill="none" stroke="${rim}" stroke-width="1.8" opacity=".8"/>`, L(`M97 ${y + 5} L103 ${y + 5}`, 1.8, .8)); }
  /* headphones */
  if (c.phones) { const t = hij ? 48 : 52; o.push(`<path d="M64 ${hij ? 102 : 96} C60 ${t} 140 ${t} 136 ${hij ? 102 : 96}" fill="none" stroke="${DK2}" stroke-width="7"/>`, L(`M64 ${hij ? 98 : 92} C60 ${t} 140 ${t} 136 ${hij ? 98 : 92}`, 1.4, .6), `<rect x="${hij ? 58 : 58}" y="${hij ? 92 : 86}" width="15" height="26" rx="6" fill="${DK2}" stroke="${rim}" stroke-width="1.2" stroke-opacity=".6"/><rect x="127" y="${hij ? 92 : 86}" width="15" height="26" rx="6" fill="${DK2}" stroke="${rim}" stroke-width="1.2" stroke-opacity=".6"/>`); }
  if (c.earbud) o.push(`<circle cx="130" cy="102" r="3" fill="${rim}" opacity=".8"/>`, L('M130 105 C132 130 124 146 118 156', 1, .5));
  /* props */
  if (pr === 'mic' || pr === 'mic-r') { const r = pr === 'mic-r'; o.push(`<g transform="${r ? 'translate(200 0) scale(-1 1)' : ''}"><path d="M8 200 L34 166" stroke="${DK2}" stroke-width="5" stroke-linecap="round"/><rect x="26" y="118" width="24" height="44" rx="12" fill="${DK2}" stroke="${rim}" stroke-width="1.4" stroke-opacity=".7" transform="rotate(-16 38 140)"/>${[126, 134, 142, 150].map(y => `<path d="M${27 + (y - 118) * .27} ${y} l20 -5.5" stroke="${rim}" stroke-width=".9" opacity=".45"/>`).join('')}</g>`); }
  if (pr === 'mug') o.push(`<rect x="146" y="166" width="24" height="26" rx="5" fill="${DK2}" stroke="${rim}" stroke-width="1.3" stroke-opacity=".6"/><path d="M170 172 C180 172 180 186 170 186" fill="none" stroke="${rim}" stroke-width="2" opacity=".6"/>`, L('M152 160 C148 152 156 150 152 142 M162 160 C158 152 166 150 162 142', 1.4, .55));
  if (pr === 'steth') o.push(`<path d="M84 150 C82 178 118 178 116 150" fill="none" stroke="${rim}" stroke-width="2.4" opacity=".7"/>`, `<path d="M100 172 C102 182 118 186 124 180" fill="none" stroke="${rim}" stroke-width="2.4" opacity=".7"/>`, `<circle cx="126" cy="178" r="6" fill="none" stroke="${rim}" stroke-width="2.4" opacity=".8"/>`);
  if (pr === 'beads') o.push(`<g fill="${rim}" opacity=".7">${Array.from({ length: 15 }, (_, i) => { const a = Math.PI * (.15 + i * .05); return `<circle cx="${150 + Math.cos(a) * 18}" cy="${170 + Math.sin(a) * 18}" r="2.6"/>`; }).join('')}</g>`, L('M152 190 L152 199', 2, .7));
  if (pr === 'book') o.push(`<path d="M120 186 L148 178 L176 186 L176 200 L120 200Z" fill="${DK2}" stroke="${rim}" stroke-width="1.3" stroke-opacity=".6"/>`, L('M148 178 L148 200', 1.3, .6), L('M128 188 L142 184 M128 194 L142 190 M154 184 L168 188 M154 190 L168 194', .9, .4));
  if (pr === 'daf') o.push(`<circle cx="160" cy="172" r="24" fill="${DK2}" stroke="${rim}" stroke-width="2" stroke-opacity=".7"/><circle cx="160" cy="172" r="17" fill="none" stroke="${rim}" stroke-width="1" opacity=".35"/>`, `<g fill="${rim}" opacity=".6">${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<circle cx="${160 + Math.cos(a) * 21}" cy="${172 + Math.sin(a) * 21}" r="1.8"/>`; }).join('')}</g>`);
  if (pr === 'ball') o.push(`<circle cx="160" cy="176" r="20" fill="${DK2}" stroke="${rim}" stroke-width="1.6" stroke-opacity=".7"/><path d="M160 168 l7 5 -3 8 h-8 l-3 -8z" fill="${rim}" opacity=".55"/>`, L('M160 168 L160 157 M167 173 L178 170 M164 181 L170 190 M156 181 L150 190 M153 173 L142 170', 1, .4));
  if (pr === 'quran') o.push(`<path d="M126 200 L132 176 L160 170 L188 176 L194 200Z" fill="${DK2}" stroke="${rim}" stroke-width="1.3" stroke-opacity=".6"/>`, L('M160 170 L160 200', 1.3, .6), `<path d="M160 160 l4 6 -4 3 -4 -3z" fill="${rim}" opacity=".5"/>`);
  if (pr === 'laptop') o.push(`<path d="M126 200 L134 168 L190 168 L184 200Z" fill="${DK2}" stroke="${rim}" stroke-width="1.3" stroke-opacity=".6"/>`, L('M150 182 l8 -6 8 6 m-8 -6 v14', 1.2, .5));
  if (pr === 'megaphone') o.push(`<path d="M150 170 L178 156 L178 192 L150 180Z" fill="${DK2}" stroke="${rim}" stroke-width="1.3" stroke-opacity=".6"/>`, `<rect x="140" y="168" width="12" height="14" rx="3" fill="${DK2}" stroke="${rim}" stroke-width="1.3" stroke-opacity=".6"/>`, L('M184 164 l8 -4 M186 174 h9 M184 184 l8 4', 1.4, .5));
  if (pr === 'heart') o.push(`<path d="M160 196 C140 182 140 164 152 162 C158 161 160 166 160 168 C160 166 162 161 168 162 C180 164 180 182 160 196Z" fill="${rim}" opacity=".55"/>`);
  if (pr === 'family') o.push(`<g fill="${DK2}" stroke="${rim}" stroke-width="1.1" stroke-opacity=".55"><circle cx="160" cy="166" r="9"/><path d="M144 200 C146 184 152 178 160 178 C168 178 174 184 176 200Z"/></g>`);
  return o.join('');
}
function avatar(c, size) {
  const id = Math.random().toString(36).slice(2, 7), [l, d] = PAL[c.pal] || PAL.lime, rim = c.rim || l;
  const body = c.group ? c.group.map((g, i) => `<g transform="${['translate(-8 76) scale(.62)', 'translate(84 76) scale(.62)', 'translate(32 64) scale(.68)'][i]}">${figure(g, rim, id)}</g>`).join('') : figure(c, rim, id);
  return `<svg class="hs-av" viewBox="0 0 200 200" ${size ? `width="${size}" height="${size}"` : ''} role="img" aria-label="Illustration"><defs><radialGradient id="b${id}" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${d}"/></radialGradient><linearGradient id="f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11301a"/><stop offset="1" stop-color="${DK2}"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#b${id})"/><g fill="none" stroke="#fff" opacity=".1"><circle cx="100" cy="92" r="62"/><circle cx="100" cy="92" r="82" stroke-dasharray="2 6"/><circle cx="100" cy="92" r="102"/></g>${body}</svg>`;
}

/* ---------------- presenters ---------------- */
const P = {
  'Sheikh Al-Sudais': { look: { head: 'ghutra', beard: 'full', cloth: 'thobe', pal: 'emerald', prop: 'quran' }, bio: 'Imam of Masjid al-Haram in Makkah, whose recitation opens the Inspire FM day.' },
  'Brother Tariq': { look: { hair: 'short', beard: 'short', cloth: 'hoodie', phones: 1, prop: 'mug', pal: 'lime' }, bio: 'Wakes Luton up every weekday morning with news, travel, local voices and a good cup of tea.' },
  'Sister Sadia': { look: { head: 'hijab', cloth: 'abaya', phones: 1, prop: 'sun', pal: 'mint' }, bio: 'Hosts the relaxed weekend breakfast: family plans, community notices and uplifting stories.' },
  'Laura Conder': { look: { hair: 'pony', cloth: 'blazer', glasses: 'round', pal: 'sage', prop: 'megaphone' }, bio: 'Co-hosts Community Matters, bringing Luton\'s organisations and the people behind them on air.' },
  'Dr Abu Bakr Cooper': { look: { head: 'kufi', beard: 'full', cloth: 'suit', glasses: 'square', pal: 'forest', prop: 'book' }, bio: 'Co-hosts Community Matters, digging into the questions that shape Luton\'s communities.' },
  'Summar Shah': { look: { hair: 'quiff', beard: 'short', cloth: 'suit', phones: 1, prop: 'mic-r', pal: 'lime', broad: 1 }, bio: 'Founder of SMR Digital. Presents The Business Hour for local business owners and anyone starting out.' },
  'Azad Khan': { look: { head: 'kufi', beard: 'long', cloth: 'thobe', prop: 'beads', pal: 'teal' }, bio: 'Presents Midday Reflections: a calm hour of thought, reminders and dhikr in the middle of the day.' },
  'Abdul Akbar': { look: { head: 'imama', beard: 'full', cloth: 'thobe', pal: 'olive', prop: 'mic' }, bio: 'Co-presents the Jummah Special, with khutbah highlights and Friday reminders.' },
  'Zaffar Iqbal': { look: { head: 'crochet', beard: 'short', cloth: 'jacket', glasses: 'square', pal: 'moss' }, bio: 'Co-presents the Jummah Special and keeps listeners up to date with Jummah across Luton.' },
  'Sister Naveed': { look: { head: 'hijab-wrap', cloth: 'abaya', glasses: 'round', prop: 'family', pal: 'sage' }, bio: 'Presents Family Hour: parenting, home life and raising children with faith.' },
  'Sister Shigufta': { look: { head: 'hijab-pin', cloth: 'abaya', prop: 'steth', pal: 'mint' }, bio: 'Presents Health & Wellbeing, with practical health advice and local services explained.' },
  'Sister Neelum': { look: { head: 'hijab-pattern', cloth: 'abaya', phones: 1, prop: 'heart', pal: 'emerald' }, bio: 'Presents Sisters\' Circle and Mothers Planet, spaces for women to talk, learn and support each other.' },
  'Waj': { look: { hair: 'curly', beard: 'short', cloth: 'hoodie', phones: 1, glasses: 'sun', prop: 'city', pal: 'lime', broad: 1 }, bio: 'Gets Luton home every weekday with Drive Time: music, chat, traffic and competitions.' },
  'Khaleel Muhammed': { look: { head: 'capback', beard: 'stubble', cloth: 'hoodie', earbud: 1, pal: 'forest', prop: 'laptop' }, bio: 'Co-hosts Youth Zone, giving young people in Luton a voice on air.' },
  'Sister Fiza': { look: { head: 'hijab-wrap', cloth: 'hoodie', earbud: 1, pal: 'teal', prop: 'mic-r' }, bio: 'Co-hosts Youth Zone: careers, confidence, faith and what young people really think.' },
  'Imaam Muaaz Vahora': { look: { head: 'imama', beard: 'long', cloth: 'thobe', glasses: 'round', prop: 'book', pal: 'emerald' }, bio: 'Co-presents Scholars\' Corner, answering listeners\' questions about faith and daily life.' },
  'Brother Saber Mahtay': { look: { head: 'kufi', beard: 'full', cloth: 'thobe', scarf: 1, pal: 'olive' }, bio: 'Co-presents Scholars\' Corner, with talks on the Quran, the Sunnah and Islamic history.' },
  'Yasir Qadhi': { look: { head: 'crochet', beard: 'full', cloth: 'jacket', glasses: 'square', prop: 'book', pal: 'sage' }, bio: 'Scholar whose Seerah series on the life of the Prophet ﷺ is broadcast on Inspire FM.' },
  'Saad Tabani': { look: { hair: 'short', beard: 'short', cloth: 'jersey', phones: 1, prop: 'ball', pal: 'lime', broad: 1 }, bio: 'Leads Sports Talk: football, cricket, boxing and the sports scene in Luton.' },
  'Hasanayn, Hassaan & Haroon': { look: { pal: 'forest', group: [{ hair: 'curly', cloth: 'jersey' }, { head: 'cap', cloth: 'hoodie', beard: 'stubble' }, { hair: 'quiff', cloth: 'jersey', phones: 1 }] }, bio: 'The Sports Talk crew: three brothers with strong opinions on every match.' },
  'Brother Mehroz Gul': { look: { head: 'kufi', beard: 'short', cloth: 'thobe', phones: 1, prop: 'daf', pal: 'teal' }, bio: 'Presents Spiritual Nasheeds, late-evening nasheeds and the stories behind them.' },
  'Michael Doward': { look: { hair: 'bald', beard: 'full', cloth: 'jacket', prop: 'mic', pal: 'moss', broad: 1 }, bio: 'Hosts Speaker\'s Corner: open, honest conversations on faith, society and the big questions.' },
  'Sister Shemiza': { look: { head: 'hijab-wrap', cloth: 'hoodie', phones: 1, prop: 'city', pal: 'olive' }, bio: 'Presents Urban Kube, a show about city life, culture and creativity.' },
  'Mishary Alafasy': { look: { head: 'shemagh', beard: 'short', cloth: 'thobe', prop: 'stars', pal: 'emerald' }, bio: 'Reciter from Kuwait whose recitation fills the Night Quran hours.' }
};
/* ---------------- shows: aim, topics, example project ---------------- */
const SH = {
  fajr: { aim: 'Start the day with the Quran and the morning adhkar.', topics: ['Recitation', 'Morning adhkar', 'Fajr reminders'], pj: { t: 'fund', h: 'Quran copies for new reverts', d: 'Collecting money for translated Qurans and starter packs for new Muslims in Luton.', n: 1240, of: 2000, u: '£' } },
  bfast: { aim: 'Get Luton ready for the day: what\'s happening, what matters, and a smile on the way to work.', topics: ['Local news', 'Travel & weather', 'Community guests', 'Listener messages'], pj: { t: 'count', h: 'Breakfast for 1,000 children', d: 'Inspire Breakfast is collecting cereal and long-life milk for school breakfast clubs this winter.', n: 640, of: 1000, u: '', un: 'breakfasts' } },
  wbfast: { aim: 'A slower Saturday and Sunday morning for the whole family.', topics: ['Weekend plans', 'Family stories', 'Notices'], pj: { t: 'steps', h: 'Weekend walking club', d: 'A free family walk every other Sunday after Fajr. Next stop: Wardown Park.', steps: [['Wardown Park', 'Sun 23 Nov', 1], ['Stockwood Park', 'Sun 7 Dec', 0], ['Dunstable Downs', 'Sun 21 Dec', 0]] } },
  comm: { aim: 'Put Luton\'s charities, groups and campaigners on air so people know where to find help and how to help.', topics: ['Local charities', 'Council updates', 'Volunteering'], pj: { t: 'count', h: '100 organisations on air', d: 'A goal to feature 100 Luton organisations this year, so every listener knows what\'s out there.', n: 63, of: 100, u: '', un: 'featured' } },
  biz: { aim: 'Help local businesses grow, explain halal finance simply, and give start-ups a platform.', topics: ['Start-ups', 'Halal finance', 'Marketing', 'Local success stories'], pj: { t: 'build', h: 'Building the Luton halal business directory', d: 'Summar is building a free directory in the Inspire app so listeners can find and support halal and local businesses.', steps: [['Directory designed', 'Done', 1], ['First 50 businesses listed', 'In progress', 0], ['Featured listings and offers', 'January', 0]] } },
  midday: { aim: 'A pause in the middle of the day for reflection and remembrance.', topics: ['Reflections', 'Dhikr', 'Stories of the righteous'], pj: { t: 'count', h: '40-day dhikr challenge', d: 'Listeners commit to 100 SubhanAllah a day for 40 days, counted together in the Tasbih tool.', n: 312, of: 500, u: '', un: 'people taking part' } },
  jummah: { aim: 'Everything for Friday: khutbah highlights, reminders and where to pray across Luton.', topics: ['Khutbah highlights', 'Surah al-Kahf', 'Jummah across Luton'], pj: { t: 'fund', h: 'Jummah Winter Campaign', d: 'Masjids across Luton collect on one Friday each, so no one goes hungry this winter.', n: 4860, of: 10000, u: '£' } },
  family: { aim: 'Support for parents and families raising children with faith in modern Britain.', topics: ['Parenting', 'Marriage', 'Home and faith', 'Schools'], pj: { t: 'steps', h: 'Parenting circle', d: 'Free monthly meet-ups for parents, with a guest speaker and a crèche.', steps: [['Screen time and children', 'Done', 1], ['Talking to teens about faith', 'Sat 29 Nov', 0], ['Exams and stress', 'January', 0]] } },
  health: { aim: 'Clear, practical health advice and the local services that can help.', topics: ['Mental health', 'Healthy eating', 'NHS services', 'Fasting and health'], pj: { t: 'count', h: '10,000 steps for Ramadan', d: 'Get fit before Ramadan: listeners log their steps each week and share tips on air.', n: 228, of: 400, u: '', un: 'walkers' } },
  women: { aim: 'A space for women to talk openly, learn and support each other.', topics: ['Sisterhood', 'Faith and identity', 'Work and family'], pj: { t: 'fund', h: 'Women\'s refuge appeal', d: 'Raising money for emergency packs for women and children starting again in safe housing.', n: 1730, of: 3000, u: '£' } },
  drive: { aim: 'Get Luton home: music, chat, traffic and a laugh on the way.', topics: ['Traffic', 'Competitions', 'Your shout-outs', 'Nasheeds'], pj: { t: 'count', h: 'Coats for Luton', d: 'Drop a warm coat at any Inspire partner and Drive Time hands them out to people who need them.', n: 412, of: 600, u: '', un: 'coats' } },
  youth: { aim: 'Young people talking about what matters to them, made by young people.', topics: ['Careers', 'Mental health', 'Faith', 'Opportunities in Luton'], pj: { t: 'build', h: 'Youth Zone podcast studio', d: 'Young listeners help plan and record a monthly podcast in the Inspire studio.', steps: [['10 young producers signed up', 'Done', 1], ['Training in the studio', 'This month', 0], ['First episode out', 'January', 0]] } },
  scholar: { aim: 'Answers to listeners\' questions about faith, from people who know.', topics: ['Your questions', 'Fiqh', 'Quran and Sunnah'], pj: { t: 'count', h: '100 questions answered', d: 'Send a question through the app and the scholars answer it on air.', n: 71, of: 100, u: '', un: 'answered' } },
  seerah: { aim: 'The life of the Prophet ﷺ, told in order, one episode at a time.', topics: ['Makkah', 'Madinah', 'Lessons for today'], pj: { t: 'steps', h: 'Seerah listen-along', d: 'Listen to the series together with a short quiz after each part.', steps: [['Part 1: Before the Prophethood', 'Done', 1], ['Part 2: The early years in Makkah', 'Now', 0], ['Part 3: The Hijrah', 'Next', 0]] } },
  sport: { aim: 'All the sport, from the Premier League to Luton\'s Sunday league.', topics: ['Football', 'Cricket', 'Boxing', 'Local clubs'], pj: { t: 'count', h: 'Football boots for Luton', d: 'Sports Talk backs the Luton Boot Bank: bring your old boots and they go to young players.', n: 186, of: 300, u: '', un: 'pairs' } },
  nasheed: { aim: 'Calm, beautiful nasheeds to end the day, and the stories behind them.', topics: ['Classic nasheeds', 'New releases', 'Local talent'], pj: { t: 'build', h: 'Luton nasheed showcase', d: 'Finding and recording local nasheed artists for a live night at Inspire Eid.', steps: [['Open call for artists', 'Done', 1], ['Studio recordings', 'December', 0], ['Live showcase', 'Inspire Eid', 0]] } },
  speakers: { aim: 'Open, honest conversations about faith, society and the questions people ask.', topics: ['Interfaith', 'Current affairs', 'Big questions'], pj: { t: 'steps', h: 'Speaker\'s Corner live', d: 'A live recording with an audience in Luton town centre.', steps: [['Venue booked', 'Done', 1], ['Tickets on sale', 'Soon', 0], ['Live night', 'February', 0]] } },
  urbankube: { aim: 'City life, culture and creativity from a young British Muslim view.', topics: ['Culture', 'Creativity', 'City life'], pj: { t: 'build', h: 'Urban Kube mural', d: 'A community mural with young artists. Updates as it takes shape.', steps: [['Designs chosen', 'Done', 1], ['Painting days', 'Spring', 0]] } },
  mothers: { aim: 'Honest talk for mums, from pregnancy to teenagers.', topics: ['Motherhood', 'Wellbeing', 'Support'], pj: { t: 'count', h: 'Baby bank', d: 'Collecting baby clothes, nappies and essentials for new mums who need them.', n: 154, of: 250, u: '', un: 'bundles' } },
  nightq: { aim: 'The Quran through the night, for whoever is awake.', topics: ['Recitation', 'Tahajjud'], pj: { t: 'count', h: 'Ramadan khatam together', d: 'Listeners pledge a juz each so the whole Quran is read together before Ramadan.', n: 22, of: 30, u: '', un: 'juz pledged' } }
};
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const h12 = h => { h = h % 24; return (h % 12 || 12) + (h < 12 ? 'am' : 'pm'); };
function slotsOf(key) { const out = []; (D.week || []).forEach((day, i) => day.forEach(s => { if (s[2] === key) out.push([i, s[0], s[1]]); })); return out; }
function slotText(key) { const S = slotsOf(key); if (!S.length) return 'On demand'; const byT = {}; S.forEach(([d, a, b]) => { const k = h12(a) + '–' + h12(b); (byT[k] = byT[k] || []).push(d); }); return Object.entries(byT).map(([t, ds]) => `${ds.length === 7 ? 'Every day' : ds.length === 5 && !ds.includes(0) && !ds.includes(6) ? 'Weekdays' : ds.map(d => DAYS[d].slice(0, 3)).join(', ')} · ${t}`).join(' · '); }
const showsOf = name => Object.entries(D.shows).filter(([, s]) => (s.p || []).includes(name));
const onAirKey = () => { try { return X.showAt().s[2]; } catch (e) { return ''; } };

function project(pj) {
  if (!pj) return '';
  let body = '';
  if (pj.t === 'fund' || pj.t === 'count') { const pc = Math.min(100, Math.round(pj.n / pj.of * 100)); body = `<div class="hs-pn"><b>${pj.u}${pj.n.toLocaleString()}</b><span>${pj.t === 'fund' ? `raised of ${pj.u}${pj.of.toLocaleString()}` : `of ${pj.of.toLocaleString()} ${pj.un}`}</span></div><div class="hs-bar"><i style="width:${pc}%"></i></div><button type="button" class="hs-btn" data-hsact="${pj.t === 'fund' ? 'Donate' : 'Join in'}">${pj.t === 'fund' ? 'Donate' : 'Join in'}</button>`; }
  else body = `<ol class="hs-steps">${pj.steps.map(([a, b, done]) => `<li class="${done ? 'ok' : ''}"><i></i><span><b>${esc(a)}</b><small>${esc(b)}</small></span></li>`).join('')}</ol><button type="button" class="hs-btn" data-hsact="Get updates">Get updates</button>`;
  return `<section class="hs-pj"><div class="hs-pjh"><span>${pj.t === 'fund' ? 'Fundraising' : pj.t === 'build' ? 'Building' : pj.t === 'steps' ? 'Coming up' : 'Challenge'}</span><em>Example</em></div><h4>${esc(pj.h)}</h4><p>${esc(pj.d)}</p>${body}</section>`;
}
function epList(key) { const E = (D.pods || []).map((p, i) => [p, i]).filter(([p]) => p.s === key).slice(0, 4); if (!E.length) return ''; return `<section class="hs-sec"><h4>Catch up</h4>${E.map(([p, i]) => `<button type="button" class="hs-ep" data-pod="${i}"><span class="hs-epi"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span><b>${esc(p.t)}</b><small>${esc(p.date || '')} · ${esc(p.len || '')}</small></span></button>`).join('')}</section>`; }
function hostCard(n, big) { const p = P[n]; if (!p) return ''; return `<a class="hs-host${big ? ' big' : ''}" href="#tb-host-${slug(n)}">${avatar(p.look)}<span><b>${esc(n)}</b>${big ? `<small>${esc(p.bio)}</small>` : ''}</span></a>`; }
function showCard(k) { const s = D.shows[k]; return `<a class="hs-show" href="#tb-show-${k}" style="--a:${s.g[0]};--b:${s.g[1]}"><span class="hs-sart"${s.img ? ` style="background-image:url(${s.img})"` : ''}></span><span class="hs-st"><b>${esc(s.n)}</b><small>${esc(slotText(k))}</small></span>${onAirKey() === k ? '<em class="hs-live">On air</em>' : ''}</a>`; }

/* the presenter's latest update: a short status post, like a story on their profile. Example wording built from
   their show until presenters post their own from the back office. */
const hsh = t => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function latest(name, my) {
  const [k] = my[0] || [], s = D.shows[k] || {}, m = SH[k] || {}, tp = (m.topics || [s.c || 'the show'])[hsh(name) % Math.max(1, (m.topics || [1]).length)], n = hsh(name) % 5 + 1;
  const when = n === 1 ? 'Yesterday' : n + ' days ago', P2 = [`Coming up on ${s.n}: ${tp.toLowerCase()}. Send me your questions or shout-outs on WhatsApp before the show and I'll read them out.`,
    `Thank you to everyone who called in last time. This week on ${s.n} we're on ${tp.toLowerCase()}, so tune in and get involved.`,
    `Preparing this week's ${s.n}. The theme is ${tp.toLowerCase()}. If you've got a story about it, message the studio.`];
  return `<section class="hs-up"><div class="hs-uph"><span class="hs-upav">${avatar(P[name].look)}</span><span><b>${esc(name)}</b><small>${when} · Latest update</small></span><em>Example</em></div>
    <p>${esc(P2[hsh(name + 'u') % P2.length])}</p><div class="hs-upf"><button type="button" class="hs-like" data-hslike><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>${12 + hsh(name) % 60}</span></button><a href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent('Salaam ' + name + ', ')}" target="_blank" rel="noopener">Reply on WhatsApp</a></div></section>`;
}
function hostPage(name, node) {
  const p = P[name], my = showsOf(name), live = my.some(([k]) => k === onAirKey());
  const names = my.map(([k]) => D.shows[k].n), topics = [...new Set(my.flatMap(([k]) => (SH[k] || {}).topics || []))];
  node.innerHTML = `<div class="hs">
    <div class="hs-hero">${avatar(p.look)}${live ? '<em class="hs-live">On air now</em>' : ''}</div>
    <h2 class="hs-name">${esc(name)}</h2><p class="hs-role">Presenter · ${esc(names.join(' & '))}</p>
    <div class="hs-acts">${live ? '<button type="button" class="hs-btn g" data-play>Listen live</button>' : ''}<a class="hs-btn" href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent('Salaam ' + name + ', ')}" target="_blank" rel="noopener">Message the show</a></div>
    ${my.length ? latest(name, my) : ''}
    <section class="hs-sec"><h4>About me</h4><p>${esc(p.bio)}</p>
      ${my.length ? `<p>You can hear me on Inspire FM 105.1: ${my.map(([k]) => `${esc(D.shows[k].n)} (${esc(slotText(k))})`).join(' and ')}. Message the studio any time during the show: I read out as many messages as I can.</p>` : ''}
      ${topics.length ? `<h5>Ask me about</h5><div class="hs-tags">${topics.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}</section>
    ${my.map(([k]) => { const s = SH[k] || {}, sh = D.shows[k]; return `<section class="hs-sec"><h4>About ${esc(sh.n)}</h4><p>${esc(sh.d)}</p><h5>Why the show exists</h5><p>${esc(s.aim || sh.d)}</p>${showCard(k)}</section>${project(s.pj)}`; }).join('')}
    ${my.map(([k]) => epList(k)).join('')}
    ${my.flatMap(([, s]) => s.p || []).filter((x, i, a) => x !== name && a.indexOf(x) === i).length ? `<section class="hs-sec"><h4>Presents with</h4><div class="hs-hosts">${my.flatMap(([, s]) => s.p || []).filter((x, i, a) => x !== name && a.indexOf(x) === i).map(n => hostCard(n)).join('')}</div></section>` : ''}
    <p class="hs-note">Updates and projects shown are examples of what presenters can post through the app.</p></div>`;
}
function showPage(k, node) {
  const s = D.shows[k], m = SH[k] || {}, live = onAirKey() === k;
  node.innerHTML = `<div class="hs">
    <div class="hs-cover" style="--a:${s.g[0]};--b:${s.g[1]}${s.img ? `;background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.7)),url(${s.img})` : ''}">${live ? '<em class="hs-live">On air now</em>' : ''}<span class="hs-cat">${esc(s.c)}</span><h2>${esc(s.n)}</h2><small>${esc(slotText(k))}</small></div>
    <p class="hs-bio">${esc(s.d)}</p>
    <div class="hs-acts">${live ? '<button type="button" class="hs-btn g" data-play>Listen live</button>' : ''}<a class="hs-btn" href="#listen">Full schedule</a></div>
    <section class="hs-sec"><h4>The aim</h4><p>${esc(m.aim || s.d)}</p>${m.topics ? `<div class="hs-tags">${m.topics.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}</section>
    <section class="hs-sec"><h4>${(s.p || []).length > 1 ? 'Presenters' : 'Presenter'}</h4><div class="hs-hosts col">${(s.p || []).map(n => hostCard(n, 1)).join('')}</div></section>
    ${project(m.pj)}${epList(k)}
    <p class="hs-note">Projects shown are examples of what presenters can run through the app.</p></div>`;
}
Object.keys(P).forEach(n => { TOOLS['host-' + slug(n)] = [n, null, node => hostPage(n, node)]; });
Object.keys(D.shows).forEach(k => { TOOLS['show-' + k] = [D.shows[k].n, null, node => showPage(k, node)]; });
const TH = window.IFM_THEMES; if (TH) { Object.keys(P).forEach(n => TH['host-' + slug(n)] = { a: '#2f5a10', a2: '#8cc63f', bg: '#f3f6ee' }); Object.keys(D.shows).forEach(k => TH['show-' + k] = { a: '#2f5a10', a2: '#8cc63f', bg: '#f3f6ee' }); }
document.addEventListener('click', e => { const l = e.target.closest && e.target.closest('[data-hslike]'); if (l) { const on = l.classList.toggle('on'), c = $('span', l); c.textContent = +c.textContent + (on ? 1 : -1); } });
document.addEventListener('click', e => { const b = e.target.closest('[data-hsact]'); if (!b) return; toast(b.dataset.hsact === 'Donate' ? 'Donations open when the live app launches' : 'Thanks. You\'ll get updates in the app'); });

/* Listen page: a row of presenters above the shows; presenter chips in show pop-ups open the profile */
function rail() { const host = $('#presFilt'); if (!host || $('#hsRail')) return; const d = document.createElement('div'); d.id = 'hsRail'; d.className = 'hs-rail'; d.innerHTML = `<h4>Meet the presenters</h4><div class="hs-railin">${Object.keys(P).map(n => hostCard(n)).join('')}</div>`; host.before(d); }
rail(); document.addEventListener('ifm:page', () => setTimeout(rail, 60));
/* presenter and show profiles open as a pop-up over the page (not a sliding page). Tapping another presenter or
   show inside the pop-up swaps the content in place with a short fade, so there's no slide in or out. */
const HK = {}; Object.keys(P).forEach(n => HK[slug(n)] = n);
function pop(kind, key) {
  const node = document.createElement('div'); if (kind === 'host') hostPage(HK[key], node); else showPage(key, node);
  const html = `<div class="hs-pop">${node.innerHTML}</div>`, m = $('#modal'), box = m && m.querySelector('.mbox');
  if (m && m.classList.contains('on') && box) { const body = $('#mBody'); body.classList.add('hs-swap');
    setTimeout(() => { body.innerHTML = html; box.scrollTop = 0; requestAnimationFrame(() => body.classList.remove('hs-swap')); }, 140); }
  else { X.modal(html); if (box) box.scrollTop = 0; }
  if (box) box.classList.add('hs-box');
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('a[href^="#tb-host-"],a[href^="#tb-show-"],#mBody [data-pres],#showGrid [data-show]'); if (!t) return;
  let kind, key; const h = t.getAttribute('href') || '';
  if (h.startsWith('#tb-host-')) { kind = 'host'; key = h.slice(9); } else if (h.startsWith('#tb-show-')) { kind = 'show'; key = h.slice(9); }
  else if (t.dataset.pres) { if (!P[t.dataset.pres]) return; kind = 'host'; key = slug(t.dataset.pres); } else { kind = 'show'; key = t.dataset.show; }
  if (kind === 'host' ? !HK[key] : !D.shows[key]) return;
  e.stopImmediatePropagation(); e.preventDefault(); pop(kind, key); }, true);
/* leaving the pop-up for the player or the schedule closes it first */
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#mBody .hs-pop [data-play],#mBody .hs-pop a[href="#listen"]')) X.closeModal(); }, true);
document.addEventListener('transitionend', e => { if (e.target.id === 'modal' && !e.target.classList.contains('on')) { const b = e.target.querySelector('.mbox'); if (b) b.classList.remove('hs-box'); } });
window.IFM_HOSTS = { avatar, P, SH, slug };

const css = document.createElement('style'); css.textContent = `
#mBody{transition:opacity .14s ease}#mBody.hs-swap{opacity:0}
.mbox.hs-box{background:#f3f6ee;padding:18px 16px 8px}
.mbox.hs-box .mx{position:sticky;top:0;float:right;margin:-6px -4px -40px 0;z-index:6;background:rgba(255,255,255,.94);box-shadow:0 4px 14px -6px rgba(0,0,0,.35)}
.modal .mbox{transform:translateY(18px) scale(.96);transition:transform .34s cubic-bezier(.2,.9,.25,1),opacity .25s}.modal.on .mbox{transform:none}
.hs-pop .hs-hero{width:min(220px,60vw)}
.hs{display:grid;gap:14px;padding-bottom:20px}
.hs-hero{position:relative;width:min(260px,70vw);aspect-ratio:1;justify-self:center;border-radius:36px;overflow:hidden;box-shadow:0 24px 48px -24px rgba(16,40,12,.55)}
.hs-hero .hs-av,.hs-host .hs-av{width:100%;height:100%;display:block}
.hs-live{position:absolute;left:12px;top:12px;font-style:normal;font-size:.72rem;font-weight:800;color:#fff;background:#e5383b;border-radius:999px;padding:4px 10px}
.hs-name{margin:4px 0 0;text-align:center;font-family:var(--display);font-size:1.7rem;line-height:1.1}
.hs-bio{margin:0;text-align:center;color:var(--mut);font-size:1rem;line-height:1.5}
.hs-acts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.hs-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-weight:800;font-size:.92rem;text-decoration:none;cursor:pointer}
.hs-btn.g{background:#8cc63f;border-color:#8cc63f;color:#13240a}
.hs-sec{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:16px;display:grid;gap:10px}
.hs-sec h4{margin:0;font-family:var(--display);font-size:1.08rem}.hs-sec p{margin:0;line-height:1.5}
.hs-tags{display:flex;flex-wrap:wrap;gap:6px}.hs-tags span{font-size:.8rem;font-weight:700;padding:5px 11px;border-radius:999px;background:color-mix(in srgb,#8cc63f 18%,var(--card));color:#2f5a10}
.hs-show{position:relative;display:flex;align-items:center;gap:12px;padding:8px;border-radius:18px;background:color-mix(in srgb,var(--b) 10%,var(--card));text-decoration:none;color:var(--ink)}
.hs-sart{width:58px;height:58px;flex:none;border-radius:14px;background:linear-gradient(135deg,var(--a),var(--b));background-size:cover;background-position:center}
.hs-st{display:grid;min-width:0}.hs-st b{font-family:var(--display);font-size:1.02rem}.hs-st small{color:var(--mut);font-size:.8rem}
.hs-show .hs-live{position:static;margin-left:auto}
.hs-pj{border-radius:22px;padding:18px;background:linear-gradient(150deg,#123b18,#2f5a10);color:#fff;display:grid;gap:10px}
.hs-pjh{display:flex;justify-content:space-between;align-items:center}.hs-pjh span{font-size:.74rem;font-weight:800;letter-spacing:.06em;color:#cfe9a8;text-transform:uppercase}.hs-pjh em{font-style:normal;font-size:.68rem;font-weight:800;background:rgba(255,255,255,.18);border-radius:999px;padding:3px 9px}
.hs-pj h4{margin:0;font-family:var(--display);font-size:1.25rem;color:#fff}.hs-pj p{margin:0;color:rgba(255,255,255,.82);line-height:1.5}
.hs-pn{display:flex;align-items:baseline;gap:8px}.hs-pn b{font-family:var(--display);font-size:1.9rem}.hs-pn span{color:rgba(255,255,255,.75);font-size:.88rem}
.hs-bar{height:10px;border-radius:999px;background:rgba(255,255,255,.16);overflow:hidden}.hs-bar i{display:block;height:100%;border-radius:999px;background:#a6d65a}
.hs-pj .hs-btn{justify-self:start;background:#a6d65a;border-color:#a6d65a;color:#13240a}
.hs-steps{list-style:none;margin:0;padding:0;display:grid;gap:10px}.hs-steps li{display:flex;gap:10px;align-items:flex-start}.hs-steps i{width:18px;height:18px;flex:none;margin-top:2px;border-radius:50%;border:2px solid rgba(255,255,255,.5)}.hs-steps li.ok i{background:#a6d65a;border-color:#a6d65a}
.hs-steps b{display:block}.hs-steps small{color:rgba(255,255,255,.7)}
.hs-ep{display:flex;align-items:center;gap:12px;width:100%;padding:8px 0;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}.hs-ep:first-of-type{border-top:0}
.hs-epi{width:40px;height:40px;flex:none;border-radius:50%;background:#8cc63f;color:#13240a;display:grid;place-items:center}.hs-epi svg{width:18px;height:18px}.hs-ep b{display:block;font-size:.92rem}.hs-ep small{color:var(--mut);font-size:.78rem}
.hs-hosts{display:flex;gap:12px;flex-wrap:wrap}.hs-hosts.col{display:grid;gap:10px}
.hs-host{display:grid;justify-items:center;gap:6px;width:86px;text-decoration:none;color:var(--ink);text-align:center}
.hs-host .hs-av{width:76px;height:76px;border-radius:24px;overflow:hidden}.hs-host b{font-size:.76rem;line-height:1.2}
.hs-host.big{display:flex;width:auto;text-align:left;justify-items:start;align-items:center;gap:12px}.hs-host.big .hs-av{width:72px;height:72px;flex:none}.hs-host.big b{font-family:var(--display);font-size:1rem}.hs-host.big small{display:block;color:var(--mut);font-size:.84rem;line-height:1.4}
.hs-cover{position:relative;height:220px;border-radius:26px;background:linear-gradient(135deg,var(--a),var(--b));background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;padding:18px}
.hs-cover h2{margin:4px 0 2px;font-family:var(--display);font-size:1.8rem;line-height:1.05;color:#fff}.hs-cover small{color:rgba(255,255,255,.85)}
.hs-cat{align-self:flex-start;font-size:.72rem;font-weight:800;background:rgba(255,255,255,.2);border-radius:999px;padding:4px 10px}
.hs-note{margin:0;text-align:center;color:var(--mut);font-size:.78rem}
.hs-rail{margin:4px 0 14px}.hs-rail h4{margin:0 0 10px;font-family:var(--display);font-size:1.05rem}
.hs-railin{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}.hs-railin::-webkit-scrollbar{display:none}.hs-railin .hs-host{flex:none}
.hs-role{margin:-6px 0 0;text-align:center;color:var(--mut);font-size:.92rem;font-weight:600}
.hs-sec h5{margin:4px 0 0;font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.hs-up{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:14px 16px;display:grid;gap:10px;position:relative}
.hs-up::before{content:"";position:absolute;left:0;top:18px;bottom:18px;width:4px;border-radius:0 4px 4px 0;background:#8cc63f}
.hs-uph{display:flex;align-items:center;gap:10px}.hs-upav{width:40px;height:40px;flex:none;border-radius:13px;overflow:hidden}.hs-upav .hs-av{width:100%;height:100%;display:block}
.hs-uph>span:nth-child(2){display:grid;flex:1;min-width:0}.hs-uph b{font-size:.92rem}.hs-uph small{color:var(--mut);font-size:.76rem}
.hs-uph em{font-style:normal;font-size:.66rem;font-weight:800;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:3px 8px}
.hs-up p{margin:0;line-height:1.5;color:var(--ink)}
.hs-upf{display:flex;align-items:center;gap:16px}.hs-upf a{font-size:.84rem;font-weight:800;color:#2f7d32;text-decoration:none}
.hs-like{display:inline-flex;align-items:center;gap:6px;border:0;background:none;color:var(--mut);font:inherit;font-weight:700;font-size:.84rem;padding:0;cursor:pointer}.hs-like svg{width:20px;height:20px}.hs-like.on{color:#e5383b}.hs-like.on path{fill:currentColor}
html.dark .mbox.hs-box{background:var(--paper)}html.dark .mbox.hs-box .mx{background:rgba(32,36,40,.94);color:var(--ink)}
html.dark .hs-tags span{background:#24301a;color:#c6e892}
html.dark .hs-upf a{color:#a6d65a}html.dark .hs-btn{background:var(--card);color:var(--ink)}html.dark .hs-btn.g{background:#8cc63f;color:#13240a}
html.dark .hs-show{background:color-mix(in srgb,var(--b) 18%,var(--card))}
html.dark .hs-hero{box-shadow:0 24px 48px -24px rgba(0,0,0,.8)}`;
document.head.appendChild(css);
})();
