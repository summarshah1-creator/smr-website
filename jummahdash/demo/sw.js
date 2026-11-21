/* Jummah Dash: keeps the whole game on the phone. First visit downloads it once;
   after that it opens from the phone, and an update only downloads the files that changed. */
const BUILD = '20261121225057';
const FILES = {
"hd/landmarks_hd.js": "44181a4fbb",
"hd/foodbank.png": "8f4400d5e6",
"game.js": "00e599ff89",
"landmarks.js": "9b916dc9ee",
"vehicles.js": "565dab9723",
"manifest.webmanifest": "636eadba05",
"silk.woff2": "c40ed2272b",
"silkb.woff2": "67996e4e8c",
"ps2p.woff2": "87ab8daaa6",
"amiri.woff2": "d4fcd1fe15",
"mont-700.woff2": "ae5da15d66",
"oswald-600.woff2": "6155c38f9c",
"art/hero3.png": "1aa163e5a2",
"art/hero3_eid.png": "03abf4285d",
"art/hero3_luton.png": "3924c2e509",
"art/hero3_puffer.png": "f2cfe63018",
"art/hero3_moroccan.png": "4970d2d06a",
"art/hero_occ.png": "893c2284b9",
"art/hero_hd.webp": "198cf84203",
"art/logo.webp": "d69bcb982d",
"art/icon-180.png": "927503e725",
"art/icon-192.png": "76fcca7df5",
"art/icon-512.png": "269f138d91",
"art/npc_pc_m.png": "4b39ea0f28",
"art/npc_pc_f.png": "a8bfafc3de",
"art/npc_pcso.png": "d8d63c30c7",
"art/npc_warden.png": "43bf1099d7",
"art/npc_fan_dad.png": "d5b873bf1e",
"art/npc_fan_f.png": "0736ecded9",
"art/npc_fan_kid.png": "606902cf47",
"art/npc_blonde.png": "6fc83e8854",
"art/npc_abaya.png": "dd1ebdea2f",
"art/npc_teen.png": "c0c656d8de",
"art/npc_aunty.png": "e02332302b",
"art/npc_uncle.png": "273a6b5a4c",
"art/npc_nurse.png": "2c491f4e02",
"art/npc_elder.png": "a04be1b1e0",
"art/npc_builder.png": "72cae29771",
"art/npc_rider.png": "a0ffe859bc",
"art/npc_rider_g.png": "f5982c965f",
"art/npc_rider_o.png": "889f5df411",
"art/npc_schoolboy.png": "4f559d413f",
"art/npc_shop.png": "4b57a651cf",
"art/npc_lad.png": "3ac8923621",
"art/npc_esc_a.png": "c9a4f048dc",
"art/npc_esc_b.png": "991980ba7e",
"art/npc_esc_c.png": "b861ab124e",
"art/npc_esc_d.png": "04bca54c95",
"art/npc_esc_e.png": "78ccb20f44",
"art/npc_postie.png": "1a61959adc"
};          // { path: hash } for every file the game uses
const CACHE = 'jd-' + BUILD;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const old = (await caches.keys()).filter(k => k.startsWith('jd-') && k !== CACHE);
    let had = {};   // hashes of the copy already on the phone
    for (const k of old) { const r = await (await caches.open(k)).match('__hashes'); if (r) { had = { k, h: await r.json() }; break; } }
    await Promise.all(Object.entries(FILES).map(async ([p, h]) => {
      if (had.h && had.h[p] === h) { const r = await (await caches.open(had.k)).match(p); if (r) return c.put(p, r); }   // unchanged: reuse, no download
      const r = await fetch(p + '?h=' + h, { cache: 'no-store' }); if (r.ok) await c.put(p, r);
    }));
    try { const r = await fetch('./', { cache: 'no-store' }); if (r.ok) await c.put('./', r); } catch (x) {}   // the page itself, so it opens with no signal
    await c.put('__hashes', new Response(JSON.stringify(FILES)));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => { for (const k of await caches.keys()) if (k.startsWith('jd-') && k !== CACHE) await caches.delete(k); await self.clients.claim(); })());
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const base = new URL('./', self.registration.scope).pathname;
  if (!u.pathname.startsWith(base)) return;
  if (e.request.mode === 'navigate') {   // the page: try the internet for 2.5 s, else the copy on the phone
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await Promise.race([fetch(e.request, { cache: 'no-store' }), new Promise((_, no) => setTimeout(no, 2500))]);
        if (r.ok) { c.put('./', r.clone()); return r; }
      } catch (x) {}
      return (await c.match('./')) || fetch(e.request);
    })());
    return;
  }
  const p = u.pathname.slice(base.length);
  if (!(p in FILES)) return;
  e.respondWith((async () => (await (await caches.open(CACHE)).match(p)) || fetch(e.request))());
});
