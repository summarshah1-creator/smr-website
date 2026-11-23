// Spinning police box, built from the owner's own art (23 Nov): front face = his door side (handle, plate, lock),
// the other three faces = his single side picture; roof steps, base and lantern cut from the same picture.
// drawBox(g, x, groundY, heightPx, angle): a real 3D square box turning round its upright axis, drawn side-on like the game,
// with a touch of perspective (near edges a little taller), light from the upper left and the lantern glowing on top.
(() => {
  const N = ['front', 'side', 'lb', 'r1', 'r2', 'r3', 'base', 'lantern'], I = {};
  N.forEach(n => { const im = new Image(); im.src = 'art/box/' + n + '.webp?v=2'; I[n] = im; });
  const H = 698, BW = 415, HW = .9614 * BW / 2;                     // art pixels: full height, body half-width (cropped inside the outline)
  const SL = { lb: [.2072, 92, 113], r1: [.547, 113, 136], r2: [.7325, 136, 164], r3: [.8988, 164, 196], base: [1.0627, 646, 698] };   // owner 23 Nov: simpler art (same spin), old lantern kept
  const ok = im => im && im.complete && im.naturalWidth;
  const STR = 26, PER = .07, L = [-.55, .35];                       // strips per face, perspective, light (x, z) direction
  // one square slab (half width hw art px, rows y0..y1): draw its visible faces, texture 'tex' per face index
  function slab(g, cx, cy, s, A, hw, y0, y1, tex, noLine) {
    const c = Math.cos(A), sn = Math.sin(A), edges = [];
    const faces = [[-hw, hw, hw, hw], [hw, hw, hw, -hw], [hw, -hw, -hw, -hw], [-hw, -hw, -hw, hw]];   // x0,z0 -> x1,z1 (left to right seen from outside)
    for (let i = 0; i < 4; i++) {
      const [x0, z0, x1, z1] = faces[i];
      const X0 = x0 * c + z0 * sn, Z0 = -x0 * sn + z0 * c, X1 = x1 * c + z1 * sn, Z1 = -x1 * sn + z1 * c;
      if (X1 - X0 <= .5) continue;                                     // facing away
      const im = tex(i); if (!ok(im)) continue;
      const nx = (z1 - z0) / (2 * hw), nz = -(x1 - x0) / (2 * hw);     // outward normal before turning
      const NX = nx * c + nz * sn, NZ = -nx * sn + nz * c, lit = Math.max(0, NX * L[0] + NZ * L[1]) * .6 + NZ * .25;
      const shade = Math.max(0, Math.min(.55, .32 - lit));            // darker as the face turns from the light
      const iw = im.naturalWidth, ih = im.naturalHeight; edges.push([X0, Z0], [X1, Z1]);
      for (let k = 0; k < STR; k++) {
        const u0 = k / STR, u1 = (k + 1) / STR, um = (u0 + u1) / 2;
        const xa = X0 + (X1 - X0) * u0, xb = X0 + (X1 - X0) * u1, Z = (Z0 + (Z1 - Z0) * um) / HW;
        const ky = 1 + Z * PER, top = cy + (y0 - H / 2) * s * ky, bot = cy + (y1 - H / 2) * s * ky;
        const sx = iw * u0, sw = Math.max(1, iw * (u1 - u0));
        g.drawImage(im, sx, 0, sw, ih, cx + xa * s, top, (xb - xa) * s + .7, bot - top);
      }
      if (shade > .01) {   // one shade over the whole face (per-strip fills doubled up at the seams and made stripes)
        const k0 = 1 + Z0 / HW * PER, k1 = 1 + Z1 / HW * PER; g.fillStyle = `rgba(8,12,40,${shade.toFixed(3)})`; g.beginPath();
        g.moveTo(cx + X0 * s, cy + (y0 - H / 2) * s * k0); g.lineTo(cx + X1 * s, cy + (y0 - H / 2) * s * k1); g.lineTo(cx + X1 * s, cy + (y1 - H / 2) * s * k1); g.lineTo(cx + X0 * s, cy + (y1 - H / 2) * s * k0); g.closePath(); g.fill(); }
    }
    if (noLine || !edges.length) return;   // one clean outline round the outside and a thin line down each corner
    const lw = Math.max(1.2, 10 * s); g.fillStyle = '#05070f';
    edges.forEach(([X, Z], i) => { const ky = 1 + Z / HW * PER, top = cy + (y0 - H / 2) * s * ky, bot = cy + (y1 - H / 2) * s * ky; const xs = Math.min(...edges.map(e => e[0])), xe = Math.max(...edges.map(e => e[0]));
      const outer = X === xs || X === xe, w = outer ? lw : lw * .45; g.fillRect(cx + X * s - (X === xe ? w : X === xs ? 0 : w / 2), top, w, bot - top); });
  }
  window.drawBox = (g, x, groundY, h, A) => {
    const s = h / H, cy = groundY - h / 2;
    g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    const sl = k => slab(g, x, cy, s, A, SL[k][0] * HW, SL[k][1], SL[k][2], () => I[k]);
    sl('base');
    slab(g, x, cy, s, A, HW, 196, 646, i => i === 0 ? I.front : I.side);   // body: door side + three plain sides
    sl('r3'); sl('r2'); sl('r1'); sl('lb');
    if (ok(I.lantern)) {   // the lantern turns with the box: its glass is redrawn with four corner posts sliding round as it spins
      const k = .2166 * BW / I.lantern.naturalWidth * s, lw = I.lantern.naturalWidth * k, lh = I.lantern.naturalHeight * k, lx = x - lw / 2, ty = cy + (92 - H / 2) * s - lh;
      g.drawImage(I.lantern, lx, ty, lw, lh);
      const gx0 = lx + 12 * k, gx1 = lx + 70 * k, gy0 = ty + 53 * k, gy1 = ty + 91 * k, gc = (gx0 + gx1) / 2, r = (gx1 - gx0) / 2;
      const gg = g.createLinearGradient(gx0, 0, gx1, 0); gg.addColorStop(0, '#e9cf86'); gg.addColorStop(.5, '#fff6d2'); gg.addColorStop(1, '#e2c277'); g.fillStyle = gg; g.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
      for (let q = 0; q < 4; q++) { const ph = A + Math.PI / 4 + q * Math.PI / 2, depth = Math.cos(ph); if (depth < -.1) continue; const px = gc + Math.sin(ph) * r * 1.02, pw = Math.max(1, 6 * k * (.45 + .55 * Math.abs(depth)));
        if (px < gx0 - 1 || px > gx1 + 1) continue; g.fillStyle = '#0a1530'; g.fillRect(px - pw / 2, gy0, pw, gy1 - gy0); g.fillStyle = 'rgba(120,160,230,.55)'; g.fillRect(px - pw / 2, gy0, Math.max(.6, pw * .3), gy1 - gy0); }
      g.fillStyle = '#05070f'; g.fillRect(gx0 - 1.5 * k, gy0, 3 * k, gy1 - gy0); g.fillRect(gx1 - 1.5 * k, gy0, 3 * k, gy1 - gy0);   // outline either side of the glass
      g.globalCompositeOperation = 'lighter'; const sh = lh, gl = g.createRadialGradient(x, ty + sh * .78, 0, x, ty + sh * .78, sh * .95); gl.addColorStop(0, 'rgba(255,240,180,.38)'); gl.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = gl; g.fillRect(x - sh, ty, sh * 2, sh * 1.8); }
    g.restore(); };
  window.BOX_READY = () => N.every(n => ok(I[n]));
})();
