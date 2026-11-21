/* Jummah Dash: keeps the whole game on the phone. First visit downloads it once;
   after that it opens from the phone, and an update only downloads the files that changed. */
const BUILD = '20261121215810';
const FILES = {
"hd/landmarks_hd.js": "c6fb9cd895",
"hd/foodbank.png": "8f4400d5e6",
"game.js": "82431d6131",
"landmarks.js": "9b916dc9ee",
"vehicles.js": "d0ceac4756",
"manifest.webmanifest": "636eadba05",
"silk.woff2": "c40ed2272b",
"silkb.woff2": "67996e4e8c",
"ps2p.woff2": "87ab8daaa6",
"amiri.woff2": "d4fcd1fe15",
"mont-700.woff2": "ae5da15d66",
"oswald-600.woff2": "6155c38f9c",
"art/hero3.png": "6bbee5f042",
"art/hero3_eid.png": "17e4ee1139",
"art/hero3_luton.png": "42821f9c42",
"art/hero3_puffer.png": "594ed31247",
"art/hero3_moroccan.png": "191ec6b97e",
"art/hero_occ.png": "893c2284b9",
"art/hero_hd.webp": "198cf84203",
"art/logo.webp": "d69bcb982d",
"art/icon-180.png": "927503e725",
"art/icon-192.png": "76fcca7df5",
"art/icon-512.png": "269f138d91",
"art/npc_pc_m.png": "98290b7f51",
"art/npc_pc_f.png": "70a6bfd549",
"art/npc_pcso.png": "fc602db7dd",
"art/npc_warden.png": "75867b8daa",
"art/npc_fan_dad.png": "a9642f2a08",
"art/npc_fan_f.png": "b387ec4bb1",
"art/npc_fan_kid.png": "aef5fc16b2",
"art/npc_blonde.png": "5b39e71690",
"art/npc_abaya.png": "bce3b60a35",
"art/npc_teen.png": "e8fcb51229",
"art/npc_aunty.png": "431f5af09d",
"art/npc_uncle.png": "df473e4a34",
"art/npc_nurse.png": "0933731d42",
"art/npc_elder.png": "b135c3a3d6",
"art/npc_builder.png": "e32384ac28",
"art/npc_rider.png": "fe467b60d8",
"art/npc_rider_g.png": "ba2ef9d0ff",
"art/npc_rider_o.png": "b2b7284d54",
"art/npc_schoolboy.png": "1b412221a6",
"art/npc_shop.png": "ad136093ef",
"art/npc_lad.png": "84149e2efd",
"art/npc_esc_a.png": "c9a4f048dc",
"art/npc_esc_b.png": "991980ba7e",
"art/npc_esc_c.png": "b861ab124e",
"art/npc_esc_d.png": "04bca54c95",
"art/npc_esc_e.png": "78ccb20f44"
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
