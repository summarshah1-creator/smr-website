/* Leaderboard name check, same rules as flappy/api.php (fk_name_bad). Word list: namefilter.json. */
window.NameCheck = (() => { let L = null; const ready = fetch('namefilter.json?v=1').then(r => r.json()).then(j => { L = { block: j.block, must: new Set(j.must), allow: new Set(j.allow) }; }).catch(() => {});
  const LEET = { '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't', '€': 'e', '£': 'l' };
  const norm = s => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[0-9@$!|+€£]/g, c => LEET[c]).replace(/[^a-z ]/g, '');
  const sq = s => s.replace(/(.)\1+/g, '$1');
  const hit = (tok, w) => { const t = sq(tok), s0 = sq(w), s = s0.length >= 4 ? s0 : w; if (s.length <= 3) return tok === w || (s === s0 && t === s); if (s.length === 4) return tok === w || t.startsWith(s) || t.endsWith(s); return t.includes(s) || tok.includes(w); };
  const bad = name => { if (!L) return false; const n = norm(name), toks = n.split(' ').filter(Boolean); const parts = toks.slice(); if (toks.filter(t => t.length === 1).length >= 2) parts.push(toks.join(''));
    for (const t of parts) { if (L.allow.has(t) && !L.must.has(t)) continue; for (const w of L.block) if (hit(t, w)) return true; } return false; };
  return { ready, bad };
})();
