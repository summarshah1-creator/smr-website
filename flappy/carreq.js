/* Car requests, shared by Flappy Kabootar and Jummah Dash (owner 22 Nov).
   Player sends first name + car + a photo (any JPG/PNG up to 20 MB; sent as a JPEG up to 2400 px) plus a rough cut-out made on the phone
   (U²-Net small, /flappy/ai/u2netp.onnx, Apache-2.0, ONNX Runtime Web) that also checks for a side view / whole car.
   The owner makes the game car in SMR Admin → Games → Flappy Kabootar → Inbox and approves it; the phone then gets a message,
   and its approved car drives past at least every 30 s (everyone else sees it now and then). */
(function () {
  var API = '/flappy/api.php', ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/', sess = null, MAX = 20 * 1024 * 1024;
  function dev() { var d = ''; try { d = localStorage.getItem('smr_dev') || ''; } catch (e) {}
    if (!d) { var m = document.cookie.match(/(?:^|; )smr_dev=([a-z0-9]+)/i); d = m ? m[1] : ''; }
    if (!d) d = (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).slice(0, 22);
    try { localStorage.setItem('smr_dev', d); } catch (e) {} document.cookie = 'smr_dev=' + d + ';path=/;max-age=63072000;SameSite=Lax'; return d; }
  function loadAI() { return sess || (sess = new Promise(function (ok, no) { if (window.ort) return ok(); var s = document.createElement('script'); s.src = ORT + 'ort.min.js'; s.onload = ok; s.onerror = function () { sess = null; no(new Error('ai')); }; document.head.appendChild(s); })
    .then(function () { var o = window.ort; o.env.wasm.wasmPaths = ORT; o.env.wasm.numThreads = 1; return o.InferenceSession.create('/flappy/ai/u2netp.onnx?v=1', { executionProviders: ['wasm'], graphOptimizationLevel: 'all' }); })); }
  async function bitmap(file, max) { var b; try { b = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { b = await createImageBitmap(file); }
    var k = Math.min(1, max / Math.max(b.width, b.height)); if (k >= 1) return b;
    var c = document.createElement('canvas'); c.width = Math.round(b.width * k); c.height = Math.round(b.height * k); var x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(b, 0, 0, c.width, c.height); return c; }
  async function cutOut(bmp) {
    var W = bmp.width, H = bmp.height, S = 320, c = document.createElement('canvas'); c.width = S; c.height = S; var x = c.getContext('2d'); x.drawImage(bmp, 0, 0, S, S);
    var px = x.getImageData(0, 0, S, S).data, inp = new Float32Array(3 * S * S), mean = [.485, .456, .406], sd = [.229, .224, .225], i, k;
    for (i = 0; i < S * S; i++) for (k = 0; k < 3; k++) inp[k * S * S + i] = (px[i * 4 + k] / 255 - mean[k]) / sd[k];
    var s2 = await loadAI(), feeds = {}; feeds[s2.inputNames[0]] = new window.ort.Tensor('float32', inp, [1, 3, S, S]); var out = await s2.run(feeds), y = out[s2.outputNames[0]].data;
    var lo = 1e9, hi = -1e9; for (i = 0; i < y.length; i++) { if (y[i] < lo) lo = y[i]; if (y[i] > hi) hi = y[i]; }
    var mc = document.createElement('canvas'); mc.width = S; mc.height = S; var mx = mc.getContext('2d'), md = mx.createImageData(S, S);
    for (i = 0; i < S * S; i++) { var v = (y[i] - lo) / (hi - lo || 1); md.data[i * 4 + 3] = Math.max(0, Math.min(255, (v - .3) / .4 * 255)); } mx.putImageData(md, 0, 0);
    var col = new Array(S).fill(0), row = new Array(S).fill(0), j; for (j = 0; j < S; j++) for (i = 0; i < S; i++) if (md.data[(j * S + i) * 4 + 3] > 128) { col[i]++; row[j]++; }
    var cm = Math.max.apply(null, col), rm = Math.max.apply(null, row); if (cm < 6) return null;
    var l = col.findIndex(function (q) { return q > cm * .06; }), r = S - 1 - col.slice().reverse().findIndex(function (q) { return q > cm * .06; }), t = row.findIndex(function (q) { return q > rm * .06; }), b = S - 1 - row.slice().reverse().findIndex(function (q) { return q > rm * .06; });
    var bx = l / S * W, by = t / S * H, bw = (r - l + 1) / S * W, bh = (b - t + 1) / S * H, kk = Math.min(1, 900 / bw), o = document.createElement('canvas'); o.width = Math.round(bw * kk); o.height = Math.round(bh * kk); var ox = o.getContext('2d');
    ox.drawImage(mc, l, t, r - l + 1, b - t + 1, 0, 0, o.width, o.height); ox.globalCompositeOperation = 'source-in'; ox.drawImage(bmp, bx, by, bw, bh, 0, 0, o.width, o.height);
    return { c: o, aspect: bw / bh, touch: l <= 2 || r >= S - 3 };
  }
  // read the photo the player picked: returns {photo (JPEG data URL), cut (canvas or null), flag ('', 'front', 'crop')}
  async function read(file) {
    if (!file) throw new Error('none'); if (file.size > MAX) throw new Error("That photo is over 20 MB. Try a smaller one.");
    if (file.type && !/^image\/(jpeg|jpg|png|heic|heif|webp)$/i.test(file.type)) throw new Error('Please use a JPG or PNG photo.');
    var big = await bitmap(file, 2400), pc = document.createElement('canvas'); pc.width = big.width; pc.height = big.height; pc.getContext('2d').drawImage(big, 0, 0);
    var photo = pc.toDataURL('image/jpeg', .9), cut = null, flag = '';
    try { var small = await bitmap(file, 1400); cut = await cutOut(small); } catch (e) { cut = null; }
    if (cut) flag = cut.touch ? 'crop' : cut.aspect < 1.75 ? 'front' : '';
    return { photo: photo, cut: cut, flag: flag };
  }
  function flipCanvas(c) { var f = document.createElement('canvas'); f.width = c.width; f.height = c.height; var x = f.getContext('2d'); x.translate(f.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return f; }
  async function submit(o) { // o: {name, model, photo, cut (canvas), flag, game}
    var cut = null; if (o.cut) { var k = Math.min(1, 700 / o.cut.width), s = document.createElement('canvas'); s.width = Math.round(o.cut.width * k); s.height = Math.round(o.cut.height * k); s.getContext('2d').drawImage(o.cut, 0, 0, s.width, s.height); cut = s.toDataURL('image/png'); }
    var r = await fetch(API + '?a=car', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: o.name, model: o.model, photo: o.photo, cut: cut, flag: o.flag || '', game: o.game, dev: dev() }) });
    var j = {}; try { j = await r.json(); } catch (e) {} if (!r.ok || j.error) throw new Error(j.error || "That didn't send. Check your signal and try again."); return j;
  }
  // approved cars for this phone + messages from the owner
  function poll(cb) { fetch(API + '?a=mycars&dev=' + dev(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) cb(j); }).catch(function () {}); }
  function seen(ids) { if (!ids.length) return; fetch(API + '?a=msg_seen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dev: dev(), ids: ids }) }).catch(function () {}); }
  // lock-screen notifications (needs a service worker: Jummah Dash app; on iPhone only once it's on the Home Screen)
  function canNotify() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && Notification.permission !== 'denied'; }
  async function notify() { var reg = await navigator.serviceWorker.ready, p = await Notification.requestPermission(); if (p !== 'granted') throw new Error('off');
    var kj = await (await fetch(API + '?a=vapid')).json(), raw = atob(kj.key.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((kj.key.length + 3) % 4)), key = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
    var sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await fetch(API + '?a=car_sub', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dev: dev(), sub: sub.toJSON() }) }); }
  window.SMRCar = { dev: dev, read: read, submit: submit, poll: poll, seen: seen, flip: flipCanvas, canNotify: canNotify, notify: notify, img: function (id, at) { return API + '?a=carimg&id=' + id + '&v=' + at; } };
})();
