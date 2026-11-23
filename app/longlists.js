/* Inspire FM · long lists in the Toolbox show their first few items, then a "Show all" button.
   Research (NN/g 2018): most attention goes on the first screen or two, and on phones people stop before the end
   of very long pages. Each list re-applies the limit when it is redrawn (search, filters), unless the person
   already asked to see everything. */
(function () {
'use strict';
const LISTS = [
  { sel: '#scr #jList', n: 6, item: '.jm', word: 'masjids' },
  { sel: '#scr .dk-list', n: 4, item: '.dk-card', word: 'duas' },
  { sel: '#scr .sq-list', n: 6, item: '.sq-tile', word: 'stories' },
  { sel: '#scr #surahs', n: 12, item: null, word: 'surahs' }
];
const open = new WeakSet();
function apply(L) {
  document.querySelectorAll(L.sel).forEach(list => {
    const items = [...list.children].filter(c => (!L.item || c.matches(L.item)) && !c.classList.contains('ll-more'));
    let btn = list.nextElementSibling && list.nextElementSibling.classList.contains('ll-more') ? list.nextElementSibling : null;
    if (open.has(list) || items.length <= L.n + 2) { items.forEach(c => c.classList.remove('ll-hid')); if (btn) btn.remove(); return; }
    items.forEach((c, i) => { const h = i >= L.n; if (c.classList.contains('ll-hid') !== h) c.classList.toggle('ll-hid', h); });
    if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.className = 'll-more'; list.after(btn);
      btn.onclick = () => { open.add(list); items.forEach(c => c.classList.remove('ll-hid')); list.querySelectorAll('.ll-hid').forEach(c => c.classList.remove('ll-hid')); btn.remove(); }; }
    const t = `Show all ${items.length} ${L.word}`; if (btn.textContent !== t) btn.textContent = t;
  });
}
let q = 0;
const run = () => { q = 0; LISTS.forEach(apply); };
new MutationObserver(() => { if (!q) q = requestAnimationFrame(run); }).observe(document.body, { childList: true, subtree: true });
/* a new search or filter starts a fresh, short list again */
document.addEventListener('input', e => { if (e.target.closest && e.target.closest('#scr')) LISTS.forEach(L => document.querySelectorAll(L.sel).forEach(l => open.delete(l))); }, true);
document.addEventListener('ifm:tool', () => LISTS.forEach(L => document.querySelectorAll(L.sel).forEach(l => open.delete(l))));
run();
})();
