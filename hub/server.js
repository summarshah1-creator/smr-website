/* Luton Community Hub, live copy: stands in for the Claude artifact capabilities (db, user, sample, downloads)
   so app.js runs unchanged on smrgraphics.co.uk. Talks to /hub/api.php. Loaded before the app scripts. */
(function () {
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
      return postJ('ai', {}, { prompt: String(prompt || '') }).then(function (j) {
        if (opts && opts.onText) try { opts.onText({ text: j.text }); } catch (e) {}
        return { text: j.text };
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
  window.claude = { use: function (name) { return Promise.resolve(caps[name] || null); } };
})();
