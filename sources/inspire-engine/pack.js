/* Inspire FM · image packs. Some folders are shipped as one file each (the app host allows a limited number of files).
   Any <img> whose src starts with a packed folder is filled from the pack instead. */
(function () {
  var base = /\/ngs\//.test(location.pathname) ? '' : 'ngs/';
  var P = [['logos/vol/', 'pack/vol'], ['media/foodbank/', 'pack/fb']];
  var cache = {};
  function load(pk) {
    if (!cache[pk]) cache[pk] = Promise.all([fetch(base + pk + '.json').then(function (r) { return r.json(); }), fetch(base + pk + '.pack.png').then(function (r) { return r.arrayBuffer(); })]).then(function (a) {
      var u = {}, i = a[0], b = a[1];
      for (var k in i) { var e = i[k]; u[k] = URL.createObjectURL(new Blob([b.slice(e[0], e[0] + e[1])], { type: e[2] })); }
      return u;
    });
    return cache[pk];
  }
  function key(s) { if (!s) return null; s = s.replace(/^\.\//, ''); if (base && s.indexOf(base) === 0) s = s.slice(base.length); for (var j = 0; j < P.length; j++) if (s.indexOf(P[j][0]) === 0) return [P[j][1], s]; return null; }
  function fix(img) { var s = img.getAttribute('src'), k = key(s); if (!k) return; img.removeAttribute('src'); load(k[0]).then(function (u) { if (u[k[1]]) img.src = u[k[1]]; }); }
  function fixBg(el) { var st = el.getAttribute('style'); if (!st || st.indexOf('url(') < 0) return; var m = st.match(/url\(['"]?([^'")]+)['"]?\)/); var k = m && key(m[1]); if (!k) return; el.style.backgroundImage = 'none'; load(k[0]).then(function (u) { if (u[k[1]]) el.style.backgroundImage = 'url(' + u[k[1]] + ')'; }); }
  function scan(n) { if (n.nodeType !== 1) return; if (n.tagName === 'IMG') fix(n); else if (n.hasAttribute('style')) fixBg(n); if (n.querySelectorAll) { n.querySelectorAll('img[src]').forEach(fix); n.querySelectorAll('[style*="url("]').forEach(fixBg); } }
  new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'attributes') { m.attributeName === 'src' ? fix(m.target) : fixBg(m.target); } else m.addedNodes.forEach(scan); }); })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'style'] });
  window.IFM_PACK = function (path) { var k = key(path); return k ? load(k[0]).then(function (u) { return u[k[1]]; }) : Promise.resolve(path); };
})();
