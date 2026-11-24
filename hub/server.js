/* Luton Community Hub, live copy: stands in for the Claude artifact capabilities (db, user, sample, downloads)
   so app.js runs unchanged on smrgraphics.co.uk. Talks to /hub/api.php. Loaded before the app scripts. */
(function () {
  window.HUB_TEST = true;
  window.HUB_SHORTLINKS = false;   // short links with tap counts: built, shown as Coming soon until the short domain is ready
  window.HUB_SHORT_BASE = 'https://smrgraphics.co.uk/hub/s.php?c=';   // one value to change when the short domain is set up (e.g. https://lu.tn/)   // testing with a few people: everything open, no sign-up / log-in anywhere (testing.js)
  var API = '/hub/api.php';
  function q(a, p) { var s = API + '?a=' + a; for (var k in (p || {})) s += '&' + k + '=' + encodeURIComponent(p[k]); return s; }
  function getJ(a, p) { return fetch(q(a, p), { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'failed'); e.code = j.error; throw e; } return j; }); }); }
  function postJ(a, p, body) { return fetch(q(a, p), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'failed'); e.code = j.error; throw e; } return j; }); }); }
  function snapOf(docs) { return { docs: docs.map(function (d) { return { id: d.id, exists: true, data: function () { return d.data; } }; }) }; }
  var who = window.__HUB_WHO ? Promise.resolve(window.__HUB_WHO) : null; function whoami() { return who || (who = getJ('whoami').catch(function () { return { me: null, owner: false }; })); }

  function collection(col) {
    return {
      doc: function (id) {
        return {
          get: function () { return getJ('get', { c: col, id: id }).then(function (j) { return { exists: !!j.exists, id: id, data: function () { return j.data; } }; }); },
          set: function (data) { return postJ('set', { c: col, id: id }, data).then(function (j) { poke(col); return j; }); }
        };
      },
      get: function () { return getJ('list', { c: col }).then(function (j) { return snapOf(j.docs); }); },
      onSnapshot: function (cb, err) {
        var stamp = null, stop = false;
        function tick() {
          if (stop) return;
          getJ('list', { c: col }).then(function (j) { if (j.stamp !== stamp) { stamp = j.stamp; cb(snapOf(j.docs)); } }).catch(function (e) { if (err) err(e); });
        }
        (watchers[col] = watchers[col] || []).push(tick);
        tick(); var t = setInterval(function () { if (!document.hidden) tick(); }, 20000);
        return function () { stop = true; clearInterval(t); };
      }
    };
  }
  var watchers = {}; function poke(col) { (watchers[col] || []).forEach(function (f) { setTimeout(f, 50); }); }

  var caps = {
    db: { collection: collection },
    user: { id: function () { return whoami().then(function (w) { return w.me; }); }, isOwner: function () { return whoami().then(function (w) { return !!w.owner; }); } },
    sample: function (prompt, opts) {
      var org = ''; try { var pr = JSON.parse(localStorage.getItem('lch-profile') || 'null'); org = (pr && (pr.orgId || pr.org)) || ''; } catch (e) {}
      return postJ('ai', {}, { prompt: String(prompt || ''), tool: (opts && opts.tool) || '', org: String(org).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 60), max: (opts && opts.max) || 900 }).then(function (j) {
        if (opts && opts.onText) try { opts.onText({ text: j.text }); } catch (e) {}
        return { text: j.text, left: j.left, cap: j.cap };
      });
    },
    downloads: {
      save: function (o) {
        var url = URL.createObjectURL(o.data instanceof Blob ? o.data : new Blob([o.data]));
        var a = document.createElement('a'); a.href = url; a.download = o.filename || 'download'; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000); return Promise.resolve(true);
      }
    }
  };

  /* Saving to your account (owner 24 Nov): everything the hub keeps on the phone under "lch-" (topics, saved items,
     reminders, checklist ticks, tool answers) is also kept on the server in data/users/<you>, so it survives a cleared
     browser. The phone copy stays as the offline copy; the newest copy wins. */
  var SKIP = /^lch-(logocol|magpos-|ltw-seen|theme|ttsrate|ttsvname|ux-)/;
  function snap() { var o = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('lch-') === 0 && !SKIP.test(k)) { var v = localStorage.getItem(k); if (v && v.length < 60000) o[k] = v; } } return o; }
  var pushT = null, syncing = false, myCol = null;
  function push(keep) { if (!myCol || syncing) return; var body = JSON.stringify({ at: Date.now(), keys: snap() }); if (body.length > 190000) return;
    try { localStorage.setItem('hubsync-at', String(Date.now())); } catch (e) {}
    fetch(q('set', { c: myCol, id: 'local' }), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: !!keep }).catch(function () {}); }
  function later() { clearTimeout(pushT); pushT = setTimeout(push, 2500); }
  var _set = Storage.prototype.setItem, _rem = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { _set.call(this, k, v); if (this === window.localStorage && !syncing && String(k).indexOf('lch-') === 0 && !SKIP.test(k)) later(); };
  Storage.prototype.removeItem = function (k) { _rem.call(this, k); if (this === window.localStorage && !syncing && String(k).indexOf('lch-') === 0) later(); };
  addEventListener('pagehide', function () { if (pushT) { clearTimeout(pushT); push(true); } });
  whoami().then(function (w) { if (!w.me) return; myCol = 'data/users/' + w.me;
    return getJ('get', { c: myCol, id: 'local' }).then(function (j) { var mine = +(localStorage.getItem('hubsync-at') || 0);
      if (!j.exists || !j.data || !j.data.keys) { if (snap() && Object.keys(snap()).length) push(); return; }
      if ((j.data.at || 0) <= mine) return; syncing = true;
      try { Object.keys(j.data.keys).forEach(function (k) { _set.call(localStorage, k, j.data.keys[k]); }); _set.call(localStorage, 'hubsync-at', String(j.data.at)); } finally { syncing = false; }
      var r = function () { if (window.LCH && window.LCH.render) window.LCH.render(); }; document.readyState === 'complete' ? r() : addEventListener('load', r); });
  }).catch(function () {});
  window.claude = { use: function (name) { return Promise.resolve(caps[name] || null); } };
})();
