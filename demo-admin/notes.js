/* SMR Admin: "Keep in mind" notes ribbon pinned in the top bar (small reminders, no dates, no pushes).
   Folded: one slim line showing one note at a time (cycles every 6 s) + count + "+". Tap it to see them all,
   tick one off (✓) or add a new one. Stored on the server in pl_kv 'notes' (api pl_notes / pl_note_add / pl_note_del). */
(function () {
  var A = window.SMRA; if (!A) return;
  var box = document.getElementById('kim'); if (!box) return;
  var N = [], adding = false, open = false, cur = 0, timer = null;
  var esc = A.esc;
  var TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  var form = function () { return '<form class="kim-f"><input id="kimin" maxlength="160" placeholder="e.g. 💷 £20 credit at Solopress" autocomplete="off"><button type="submit">Add</button><button type="button" class="kim-c" aria-label="Cancel">×</button></form>'; };
  var draw = function () {
    clearInterval(timer);
    if (cur >= N.length) cur = 0;
    var h = '';
    if (open || adding) {
      h += '<div class="kim-hd"><span class="kim-lb">Keep in mind</span><button class="kim-fold" aria-label="Fold">Done</button></div>';
      N.forEach(function (n) {
        h += '<div class="kim-row" data-id="' + esc(n.id) + '"><span class="kim-t">' + esc(n.t) + '</span><button class="kim-x" data-del="' + esc(n.id) + '" aria-label="Tick off" title="Tick off">' + TICK + '</button></div>';
      });
      if (!N.length && !adding) h += '<div class="kim-none">Nothing to keep in mind. Add little things like supplier credits here.</div>';
      h += adding ? form() : '<button class="kim-new">+ Add a note</button>';
    } else if (N.length) {
      var n = N[cur];
      h += '<button class="kim-one" aria-label="Show all notes"><span class="kim-lb">Keep in mind</span><span class="kim-t">' + esc(n.t) + '</span>'
        + (N.length > 1 ? '<span class="kim-ct">' + (cur + 1) + '/' + N.length + '</span>' : '') + '</button>'
        + '<button class="kim-add" aria-label="Add a note" title="Add a note">+</button>';
      if (N.length > 1) timer = setInterval(function () { cur = (cur + 1) % N.length; var t = box.querySelector('.kim-one .kim-t'), c = box.querySelector('.kim-ct'); if (!t) return; t.classList.add('sw'); setTimeout(function () { t.textContent = N[cur].t; if (c) c.textContent = (cur + 1) + '/' + N.length; t.classList.remove('sw'); }, 180); }, 6000);
    } else {
      h += '<button class="kim-add solo" aria-label="Add a note to keep in mind">+ Keep in mind</button>';
    }
    box.innerHTML = h;
    box.hidden = false;
    box.classList.toggle('open', open || adding);
    box.classList.toggle('empty', !N.length && !open && !adding);
    if (adding) { var i = document.getElementById('kimin'); if (i) i.focus(); }
  };
  var load = function () { A.api('pl_notes').then(function (j) { N = j.notes || []; draw(); }).catch(function () {}); };
  box.addEventListener('click', function (e) {
    var d = e.target.closest('[data-del]');
    if (d) {
      var id = d.getAttribute('data-del'), row = d.closest('.kim-row'); if (row) row.classList.add('gone');
      A.api('pl_note_del', { id: id }).then(function (j) { N = j.notes || []; setTimeout(draw, 180); A.toast('Ticked off'); }).catch(function (x) { A.toast(x.message, 1); draw(); });
      return;
    }
    if (e.target.closest('.kim-add,.kim-new')) { adding = true; open = true; draw(); return; }
    if (e.target.closest('.kim-c')) { adding = false; draw(); return; }
    if (e.target.closest('.kim-fold')) { open = false; adding = false; draw(); return; }
    if (e.target.closest('.kim-one')) { open = true; draw(); }
  });
  box.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (document.getElementById('kimin').value || '').trim(); if (!v) return;
    A.api('pl_note_add', { t: v }).then(function (j) { N = j.notes || []; adding = false; cur = N.length - 1; draw(); }).catch(function (x) { A.toast(x.message, 1); });
  });
  box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { adding = false; open = false; draw(); } });
  load();
})();
