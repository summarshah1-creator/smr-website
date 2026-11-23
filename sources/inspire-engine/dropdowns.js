/* Inspire FM · long rows of filter bubbles become one tidy drop-down.
   Any single-choice group with 7 or more bubbles (one pressed at a time) is shown as a drop-down with a green arrow;
   choosing an option presses the original bubble, so each page's own code keeps working unchanged. */
(function () {
'use strict';
const MIN = 7;
const SKIP = '#tabbar, .st-wrap, .dg-grid, .dg-cal, .pill2, [data-nodd]';
const txt = b => { if (b.dataset.label) return b.dataset.label.trim(); const t = b.querySelector('b,strong'); return (t ? t.textContent : [...b.childNodes].map(n => n.textContent).join(' ')).replace(/\s+/g, ' ').trim(); };
const sig = btns => btns.map(txt).join('|');
const pressed = btns => btns.findIndex(b => b.getAttribute('aria-pressed') === 'true');
function eligible(el) {
  if (el.closest(SKIP)) return null;
  const btns = [...el.children].filter(c => c.tagName === 'BUTTON' && c.hasAttribute('aria-pressed') && !c.hidden);
  if (btns.length < MIN) return null;
  if (btns.filter(b => b.getAttribute('aria-pressed') === 'true').length !== 1) return null;
  return btns;
}
function build(el, btns) {
  let w = el.previousElementSibling; if (!w || !w.classList.contains('ddw')) { w = document.createElement('label'); w.className = 'ddw'; w.innerHTML = '<span class="ddl">' + (el.dataset.ddl || 'Category') + '</span><select class="dd"></select><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; el.parentNode.insertBefore(w, el);
    w.querySelector('select').addEventListener('change', e => { const b = w._btns && w._btns[+e.target.value]; if (b) b.click(); }); }
  const s = w.querySelector('select'), lab = el.getAttribute('aria-label') || (el.closest('[aria-label]') || {}).getAttribute && el.closest('[aria-label]').getAttribute('aria-label') || 'Filter';
  s.setAttribute('aria-label', lab);
  s.innerHTML = btns.map((b, i) => { const t = txt(b).replace(/[<>&]/g, ''); return `<option value="${i}">${/^all$/i.test(t) ? 'All' : t}</option>`; }).join('');
  s.value = String(pressed(btns)); w._btns = btns; w._sig = sig(btns); el.classList.add('dd-hid'); el._dd = w;
}
function sync(el) { const w = el._dd; if (!w) return; const btns = eligible(el); if (!btns) { w.remove(); el.classList.remove('dd-hid'); el._dd = null; return; } if (sig(btns) !== w._sig || btns.some((b, i) => b !== w._btns[i])) build(el, btns); else w.querySelector('select').value = String(pressed(btns)); }
let q = 0;
function scan() { q = 0; const seen = new Set(); document.querySelectorAll('button[aria-pressed]').forEach(b => { const p = b.parentElement; if (!p || seen.has(p)) return; seen.add(p); if (p._dd) { sync(p); return; } const btns = eligible(p); if (btns) build(p, btns); });
  document.querySelectorAll('.ddw').forEach(w => { const el = w.nextElementSibling; if (!el || el._dd !== w) w.remove(); }); }
const later = () => { if (!q) q = requestAnimationFrame(scan); };
new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'hidden'] });
scan();
})();
