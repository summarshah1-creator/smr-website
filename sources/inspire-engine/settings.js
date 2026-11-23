/* Inspire FM · Settings: theme (light or dark, light by default), notifications, animations and data, text and reading,
   colours, language. Everything is saved on this phone only. Opened from the gear on the home screen and the menu. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, store, toast } = X;
const H = document.documentElement;
const DEF = { theme: 'light', still: false, lite: false, size: 100, easy: false, space: false, links: false, bold: false, hc: false, grey: false, tint: '', dys: false, hear: false, ruler: false };
let S = Object.assign({}, DEF, store.get('settings', {}));
if (store.get('settings', null) === null && store.get('dark', null) === true) S.theme = 'dark';
if (S.theme === 'auto') S.theme = 'light';

/* ---------- apply ---------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() { const d = S.theme === 'dark'; H.classList.toggle('dark', d); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = d ? '#0f1113' : '#f6f8f2'; const b = $('#darkBtn span'); if (b) b.textContent = d ? 'Light mode' : 'Dark mode'; }
mq.addEventListener && mq.addEventListener('change', () => { if (S.theme === 'auto') applyTheme(); });
function apply() {
  applyTheme();
  H.style.fontSize = S.size === 100 ? '' : S.size + '%';
  [['still', 'ax-still'], ['lite', 'ax-lite'], ['easy', 'ax-easy'], ['space', 'ax-space'], ['links', 'ax-links'], ['bold', 'ax-bold'], ['hc', 'ax-hc'], ['grey', 'ax-grey'], ['dys', 'ax-dys'], ['hear', 'ax-hear'], ['ruler', 'ax-ruler']].forEach(([k, c]) => H.classList.toggle(c, !!S[k]));
  H.style.setProperty('--ax-tint', S.tint || 'transparent'); H.classList.toggle('ax-tint', !!S.tint);
  if (S.easy && !document.getElementById('axFont')) { const l = document.createElement('link'); l.id = 'axFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap'; document.head.appendChild(l); }
}
/* tap to hear, reading ruler */
document.addEventListener('click', e => { if (!S.hear || !('speechSynthesis' in window)) return; const el = e.target.closest && e.target.closest('p,h1,h2,h3,h4,li,small,b,.dua-en,.wx-en'); if (!el || el.closest('a,button,input,select,textarea,.st-sheet')) return;
  const t = el.innerText.trim(); if (!t) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.slice(0, 600)); u.lang = H.lang === 'ur' ? 'ur-PK' : 'en-GB'; document.querySelectorAll('.ax-reading').forEach(x => x.classList.remove('ax-reading')); el.classList.add('ax-reading'); u.onend = () => el.classList.remove('ax-reading'); speechSynthesis.speak(u); });
let rul = null; const moveR = y => { if (!rul) { rul = document.createElement('div'); rul.className = 'ax-rul'; document.body.appendChild(rul); } rul.style.top = (y - 26) + 'px'; };
addEventListener('pointermove', e => { if (S.ruler) moveR(e.clientY); }, { passive: true }); addEventListener('touchmove', e => { if (S.ruler && e.touches[0]) moveR(e.touches[0].clientY); }, { passive: true });
const axCss = document.createElement('style'); axCss.textContent = `
@font-face{font-family:"OpenDyslexic";src:url(fonts/opendyslexic-latin-400-normal.woff2) format("woff2");font-weight:400}
@font-face{font-family:"OpenDyslexic";src:url(fonts/opendyslexic-latin-700-normal.woff2) format("woff2");font-weight:600 800}
html.ax-dys{--body:"OpenDyslexic",sans-serif!important;--display:"OpenDyslexic",sans-serif!important}
html.ax-dys body,html.ax-dys input,html.ax-dys button,html.ax-dys select,html.ax-dys textarea{font-family:"OpenDyslexic",sans-serif!important}
html.ax-dys [lang=ar],html.ax-dys .ar,html.ax-dys .ur-t{font-family:"Amiri","Noto Nastaliq Urdu",serif!important}
html.ax-hear p,html.ax-hear h1,html.ax-hear h2,html.ax-hear h3,html.ax-hear h4{cursor:pointer}
.ax-reading{background:rgba(140,198,63,.28)!important;border-radius:6px;box-shadow:0 0 0 4px rgba(140,198,63,.28)}
.ax-rul{position:fixed;left:0;right:0;height:52px;z-index:9998;pointer-events:none;display:none;background:rgba(255,224,102,.22);box-shadow:0 0 0 100vmax rgba(0,0,0,.28);border-top:2px solid rgba(255,200,0,.6);border-bottom:2px solid rgba(255,200,0,.6)}
html.ax-ruler .ax-rul{display:block}`; document.head.appendChild(axCss);
const save = () => { store.set('settings', S); store.set('dark', H.classList.contains('dark')); apply(); };
apply();
/* the old footer dark-mode button now cycles light / dark */
const db = $('#darkBtn'); if (db) db.onclick = () => { S.theme = H.classList.contains('dark') ? 'light' : 'dark'; save(); };

/* ---------- the sheet ---------- */
const IC = {
  theme: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  motion: '<path d="M4 12h4l2-5 4 10 2-5h4"/>',
  text: '<path d="M4 18 9 6l5 12M5.6 14h6.8M15 18l3-7 3 7M15.8 16h4.4"/>',
  colour: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
};
const ic = k => `<svg class="st-i" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</g></svg>`;
const sw = (k, label, sub) => `<div class="st-row"><div><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div><button class="sw" type="button" role="switch" data-st="${k}" aria-checked="${!!S[k]}" aria-label="${label}"><i></i></button></div>`;
const seg = (k, opts) => `<div class="st-seg" role="group">${opts.map(([v, n]) => `<button type="button" data-seg="${k}" data-v="${v}" aria-pressed="${String(S[k]) === String(v)}">${n}</button>`).join('')}</div>`;
function body() {
  const al = store.get('alerts', null), alOn = al && al.on, rem = store.get('dgRem', {}).on, jz = store.get('jzAlerts', false);
  const langs = [...document.querySelectorAll('#langSel option')].map(o => [o.value, o.textContent]), curL = ($('#langSel') || {}).value || 'en';
  return `${window.IFM_SYNC ? IFM_SYNC.section() : ''}
  <section class="st-sec"><h3>${ic('theme')}Appearance</h3>${seg('theme', [['light', 'Light'], ['dark', 'Dark']])}</section>
  <section class="st-sec"><h3>${ic('bell')}Notifications</h3>
    <a class="st-row st-link" href="#tb-alerts" data-stclose><div><b>Prayer alerts and adhan</b><small>${alOn ? 'On' : 'Off'} · choose prayers, sound and reminder time</small></div><span>›</span></a>
    <a class="st-row st-link" href="#tb-janazah" data-stclose><div><b>Janazah alerts</b><small>${jz ? 'On' : 'Off'} · when a janazah is announced in Luton</small></div><span>›</span></a>
    <a class="st-row st-link" href="#tb-dress" data-stclose><div><b>Daily reminder</b><small>${rem ? 'On' : 'Off'} · one ayah or hadith a day</small></div><span>›</span></a></section>
  <section class="st-sec"><h3>${ic('motion')}Animations and data</h3>
    ${sw('still', 'Reduce animations', 'Turns off opening animations, moving banners and transitions')}
    ${sw('lite', 'Data saver', 'Videos and reels don\'t load until you tap them. Good for slow internet or low data')}</section>
  <section class="st-sec"><h3>${ic('text')}Text and reading</h3>
    <div class="st-row"><div><b>Text size</b><small>${S.size}%</small></div><div class="st-size"><button type="button" data-size="-10" aria-label="Smaller text">A−</button><button type="button" data-size="10" aria-label="Bigger text">A+</button></div></div>
    ${sw('easy', 'Easy-read font', 'A clearer font designed for low vision and dyslexia')}
    ${sw('dys', 'Dyslexia-friendly font', 'OpenDyslexic: heavier letter bottoms so letters don\'t flip or swap')}
    ${sw('bold', 'Bolder text')}
    ${sw('space', 'More spacing', 'Extra space between lines and letters')}
    ${sw('links', 'Underline links')}
    ${sw('ruler', 'Reading ruler', 'A soft band follows your finger or mouse to keep your place')}
    ${sw('hear', 'Tap text to hear it', 'Tap any heading or paragraph and it is read out loud')}</section>
  <section class="st-sec"><h3>${ic('colour')}Colours</h3>
    ${sw('hc', 'Stronger contrast')}
    ${sw('grey', 'Greyscale')}
    <div class="st-row st-col"><div><b>Colour overlay</b><small>A soft tint over the screen can make reading easier</small></div><div class="st-tints">${[['', 'None', '#fff'], ['#fff3c4', 'Cream'], ['#d9ecff', 'Blue'], ['#dff5df', 'Green'], ['#ffe0ec', 'Pink']].map(([v, n, c]) => `<button type="button" data-tint="${v}" aria-pressed="${S.tint === v}" style="background:${c || v}">${n}</button>`).join('')}</div></div></section>
  <section class="st-sec"><h3>${ic('globe')}Language</h3>
    <div class="st-row"><div><b>App language</b><small>Translated automatically on the live site</small></div><select id="stLang" aria-label="App language">${langs.map(([v, n]) => `<option value="${v}" ${v === curL ? 'selected' : ''}>${n}</option>`).join('')}</select></div></section>
  <section class="st-sec"><h3>${ic('info')}About</h3>
    <a class="st-row st-link" href="#about" data-stclose><div><b>About Inspire FM</b></div><span>›</span></a>
    <a class="st-row st-link" href="#privacy" data-stclose><div><b>Privacy</b><small>Your settings, notes and trackers stay on this phone</small></div><span>›</span></a>
    <button type="button" class="st-reset" data-streset>Reset all settings</button></section>`;
}
let sheet;
function open() {
  if (!sheet) { sheet = document.createElement('div'); sheet.className = 'st-wrap'; sheet.id = 'stSheet'; sheet.hidden = true; sheet.innerHTML = `<div class="st-dim" data-stclose></div><div class="st-sheet" role="dialog" aria-modal="true" aria-label="Settings"><div class="st-grab"></div><div class="st-head"><h2>Settings</h2><button type="button" class="st-done" data-stclose>Done</button></div><div class="st-body" id="stBody"></div></div>`; document.body.appendChild(sheet); bind(); }
  $('#stBody').innerHTML = body(); sheet.hidden = false; document.body.classList.add('lock'); requestAnimationFrame(() => sheet.classList.add('on'));
}
function close() { if (!sheet) return; sheet.classList.remove('on'); document.body.classList.remove('lock'); setTimeout(() => { sheet.hidden = true; }, 300); }
function bind() {
  sheet.addEventListener('click', e => {
    const t = e.target.closest('button,a,[data-stclose]'); if (!t) return; const d = t.dataset;
    if (t.hasAttribute('data-stclose')) { close(); return; }
    if (d.st) { S[d.st] = !S[d.st]; t.setAttribute('aria-checked', S[d.st]); save(); return; }
    if (d.seg) { S[d.seg] = d.v; $$(`[data-seg="${d.seg}"]`, sheet).forEach(b => b.setAttribute('aria-pressed', b === t)); save(); return; }
    if (d.size) { S.size = Math.max(80, Math.min(150, S.size + +d.size)); save(); $('#stBody').innerHTML = body(); return; }
    if (d.tint !== undefined) { S.tint = d.tint; $$('[data-tint]', sheet).forEach(b => b.setAttribute('aria-pressed', b === t)); save(); return; }
    if (t.hasAttribute('data-streset')) { S = Object.assign({}, DEF); save(); $('#stBody').innerHTML = body(); toast && toast('Settings reset'); return; }
  });
  sheet.addEventListener('change', e => { if (e.target.id === 'stLang') { const ls = $('#langSel'); if (ls) { ls.value = e.target.value; ls.dispatchEvent(new Event('change')); } } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && sheet && !sheet.hidden) close(); });
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-settings]'); if (!b) return; e.preventDefault(); open(); });
document.addEventListener('ifm:acct', () => { if (sheet && !sheet.hidden) $('#stBody').innerHTML = body(); });
window.IFM_SETTINGS = { open, get: () => S };
})();
