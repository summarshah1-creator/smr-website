/* MySirat: brand layer over the latest toolkit engine. No radio.
   Designed & built by SMR Digital. Example town: Luton. */
(() => {
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, dkey } = X;

/* ---------- one brand in every word ---------- */
const SW = [[/Inspire FM 105\.1/g, 'MySirat'], [/Inspire FM/g, 'MySirat'], [/Islamic Toolbox/g, 'MySirat'], [/Sunnah Toolbox/g, 'MySirat'], [/the Islamic toolbox/gi, 'the toolkit'], [/Inspire team/g, 'MySirat team'], [/Inspire's/g, 'our'], [/^Our partner$/, 'Local support'], [/^Toolbox$/, 'Toolkit'], [/Inspire Eid/g, 'Eid festival'], [/MySirat MySirat/g, 'MySirat'], [/^The MySirat, on your phone/, 'MySirat, on your phone'], [/Inspire green/g, 'Emerald'], [/On air & across Luton/g, 'Across Luton']];
const fixT = n => { let t = n.nodeValue, o = t; SW.forEach(([a, b]) => t = t.replace(a, b)); if (t !== o) n.nodeValue = t; };
const fix = root => { if (!root) return; if (root.nodeType === 3) return fixT(root); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) fixT(n);
  (root.querySelectorAll ? root : document).querySelectorAll('input[placeholder]').forEach(i => { if (/toolbox|inspire/i.test(i.placeholder)) i.placeholder = 'Search the toolkit'; });
  (root.querySelectorAll ? root : document).querySelectorAll('img[src*="icons/icon"],img[src*="icons/apple"],img[src*="logo-inspire"],img[src*="inspire-logo"]').forEach(i => { i.src = 'mt/icon-192.png'; i.alt = 'MySirat'; });
  (root.querySelectorAll ? root : document).querySelectorAll('[aria-label*="Inspire"]').forEach(e => e.setAttribute('aria-label', e.getAttribute('aria-label').replace(/Inspire FM( 105\.1)?/g, 'MySirat')));
};
fix(document.body);
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(x => (x.nodeType === 1 || x.nodeType === 3) && fix(x)))).observe(document.body, { childList: true, subtree: true });
const setTitle = () => { const t = document.title.replace(/Inspire FM 105\.1|Inspire FM/g, 'MySirat').replace(/Islamic Toolbox/g, 'MySirat').replace(/ · Radio, Faith & Community · Luton/, ''); if (t !== document.title) document.title = t; };
new MutationObserver(setTitle).observe(document.querySelector('title') || document.head, { childList: true, subtree: true, characterData: true }); setTitle();
try { localStorage.setItem('ifm_introSeen', '1'); } catch (e) {}
const intro = $('#intro'); if (intro) intro.remove();

/* ---------- messages and feedback never go to the radio station's inbox ---------- */

/* ---------- no radio: Listen goes home ---------- */
const noRadio = () => { if (/^#listen/.test(location.hash)) location.replace('#home'); };
addEventListener('hashchange', noRadio); noRadio();
document.addEventListener('click', e => { if (e.target.closest('[data-play]')) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);

/* ---------- home: tasbih widget where "On air" was ---------- */
const TAS = [['SubhanAllah', 'سُبْحَانَ ٱللَّٰهِ', 33], ['Alhamdulillah', 'ٱلْحَمْدُ لِلَّٰهِ', 33], ['Allahu Akbar', 'ٱللَّٰهُ أَكْبَرُ', 34]];
function mountHome() {
  const oa = $('#ahOA'); if (!oa || $('#mtTas')) return !!$('#mtTas');
  oa.insertAdjacentHTML('beforebegin', `<button class="mt-tas" type="button" id="mtTas" aria-label="Count tasbih"><small>Tasbih · tap</small><div><span class="ar" id="mtTasAr"></span><span class="big" id="mtTasN">0</span> <span class="of" id="mtTasOf"></span></div><svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/><circle id="mtTasArc" cx="60" cy="60" r="48" fill="none" stroke="#d6d2cb" stroke-width="10" stroke-linecap="round" stroke-dasharray="302" stroke-dashoffset="302" transform="rotate(-90 60 60)"/></svg></button>`);
  let tI = store.get('mtTasI', 0), tN = store.get('mtTasN', 0);
  const draw = () => { const [n, ar, max] = TAS[tI]; $('#mtTasAr').textContent = ar; $('#mtTasN').textContent = tN; $('#mtTasOf').textContent = `of ${max}`; $('#mtTasArc').style.strokeDashoffset = 302 - 302 * Math.min(1, tN / max); $('#mtTas').setAttribute('aria-label', `${n}: ${tN} of ${max}. Tap to count`); };
  $('#mtTas').onclick = () => { const max = TAS[tI][2]; tN++; const k = 'ts_' + dkey(new Date()); store.set(k, store.get(k, 0) + 1); if (tN >= max) { tN = 0; tI = (tI + 1) % TAS.length; if (navigator.vibrate) navigator.vibrate([20, 40, 20]); } else if (navigator.vibrate) navigator.vibrate(8); store.set('mtTasI', tI); store.set('mtTasN', tN); draw(); };
  draw();
  const av = $('#appHome .ah-av'); if (av) av.src = 'mt/icon-192.png';
  return true;
}
if (!mountHome()) { const iv = setInterval(() => { if (mountHome()) clearInterval(iv); }, 200); setTimeout(() => clearInterval(iv), 15000); }

/* ---------- Pathfinder + Skills & training as toolkit apps ---------- */
const T = X.TOOLS;
if (T) {
  T.pathfinder = ['Pathfinder', null, ['#pthRoot']];
  T.skills = ['Skills & training', null, node => {
    const go = () => { try { window.NGSSkills.mount(node); } catch (e) { node.innerHTML = '<p style="padding:20px">Skills & training could not load. Check your connection and try again.</p>'; } };
    if (window.NGSSkills) return go();
    if (!$('link[href="ngs/skills.css"]')) document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="ngs/skills.css">');
    node.innerHTML = '<p style="padding:20px;opacity:.7">Loading…</p>';
    const s = document.createElement('script'); s.src = 'ngs/skills.js'; s.onload = () => { node.innerHTML = ''; go(); }; document.body.appendChild(s);
  }];
}
const THEME = { pathfinder: ['#f4f7fb', '#12324f', '#1e4f7a'], skills: ['#f3faf5', '#0e5a3c', '#16a34a'] };
document.addEventListener('ifm:tool', e => {
  const k = e.detail, th = THEME[k]; if (!th) return;
  const scr = document.getElementById('scr');
  [scr, document.body].forEach(el => { if (!el) return; el.style.setProperty('--tk-bg', th[0]); el.style.setProperty('--tk-a', th[2]); el.style.setProperty('--tk-a2', th[1]); el.style.setProperty('--tk-tint', th[1]); el.style.setProperty('--tk-pill', th[1]); el.style.setProperty('--tk-pill-ink', '#fff'); });
  if (k === 'pathfinder' && window.NGSPathfinder && window.NGSPathfinder.draw) { try { window.NGSPathfinder.draw(); } catch (err) {} }
});
})();
