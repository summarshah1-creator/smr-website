"""Redraw flat-colour logos as clean multi-colour vectors (upscale -> clean colours -> trace each colour).
Logos with gradients / photographic detail are not traced; they get a careful 2x upscale instead."""
import numpy as np, potrace, hashlib, os, json, subprocess
from PIL import Image, ImageFilter
from scipy import ndimage

CACHE = 'redraw-cache'; os.makedirs(CACHE, exist_ok=True)
TARGET = 1600

def _clusters(px, maxk=12):
    """Pick the logo's real colours: 5-bit histogram peaks with >0.6% share, merged when close."""
    q = (px // 16).astype(int)
    keys, counts = np.unique(q, axis=0, return_counts=True)
    order = counts.argsort()[::-1]
    cents = []
    tot = counts.sum()
    for i in order:
        if counts[i] / tot < .006: break
        c = px[(q == keys[i]).all(1)].mean(0)
        if all(np.abs(c - o).max() > 34 for o in cents): cents.append(c)
        if len(cents) >= maxk: break
    return np.array(cents)

def _trace(mask):
    bm = potrace.Bitmap(~mask)
    pl = bm.trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.25)
    d = []
    for c in pl:
        sp = c.start_point; d.append(f'M{sp.x:.1f} {sp.y:.1f}')
        for s in c.segments:
            if s.is_corner: d.append(f'L{s.c.x:.1f} {s.c.y:.1f}L{s.end_point.x:.1f} {s.end_point.y:.1f}')
            else: d.append(f'C{s.c1.x:.1f} {s.c1.y:.1f} {s.c2.x:.1f} {s.c2.y:.1f} {s.end_point.x:.1f} {s.end_point.y:.1f}')
        d.append('Z')
    return ''.join(d)

def flatness(im):
    """Share of logo pixels that sit close to one of a few flat colours (edges ignored)."""
    a = np.asarray(im).astype(float)
    al = a[..., 3] > 200
    core = ndimage.binary_erosion(al, iterations=3)
    if core.sum() < 500: return 0, None
    px = a[core][:, :3]
    cents = _clusters(px)
    if len(cents) == 0: return 0, None
    d = np.min(np.abs(px[:, None, :] - cents[None]).max(-1), 1)
    return (d < 22).mean(), cents

def redraw(im, key):
    """Returns (svg_text, png_image, kind) where kind is 'vector' or 'upscaled'."""
    h = hashlib.sha1(np.asarray(im).tobytes()).hexdigest()[:16]
    cp = f'{CACHE}/{h}'
    if os.path.exists(cp + '.json'):
        meta = json.load(open(cp + '.json'))
        return (open(cp + '.svg').read() if meta['kind'] == 'vector' else None), Image.open(cp + '.png').convert('RGBA'), meta['kind']
    if os.environ.get('PREPASS'):
        im.save(f'{CACHE}/{h}.job.png'); return None, im, 'pending'
    s = TARGET / max(im.size)
    flat, cents = flatness(im)
    if flat >= .9 and cents is not None and len(cents) <= 12:
        big = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        a = np.asarray(big).astype(float)
        rgb = np.asarray(Image.fromarray(a[..., :3].astype(np.uint8)).filter(ImageFilter.MedianFilter(5))).astype(float)
        al = ndimage.binary_opening(a[..., 3] > 110, iterations=1)
        dist = np.abs(rgb[..., None, :] - cents[None, None]).max(-1)
        lab = dist.argmin(-1)
        # majority filter so antialias fringes join the colour they belong to
        for _ in range(2):
            onehot = np.stack([ndimage.uniform_filter((lab == i).astype(float), 5) for i in range(len(cents))], -1)
            lab = onehot.argmax(-1)
        H, W = lab.shape
        areas = [((lab == i) & al).sum() for i in range(len(cents))]
        order = [i for i in np.argsort(areas)[::-1] if areas[i] > 30]
        paths = []
        for n, i in enumerate(order):
            # stack: each layer also covers the layers drawn above it, so no hairline gaps
            m = al & np.isin(lab, order[n:])
            m = ndimage.binary_closing(m, iterations=1)
            col = '#%02x%02x%02x' % tuple(int(v) for v in cents[i])
            paths.append(f'<path fill="{col}" fill-rule="evenodd" d="{_trace(m)}"/>')
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(paths)}</svg>'
        open(cp + '.svg', 'w').write(svg)
        # clean raster straight from the colour layers (soft 1px edge)
        out = np.zeros((H, W, 4), np.uint8)
        for n, i in enumerate(order):
            m = al & (lab == i)
            out[m, :3] = cents[i].astype(np.uint8)
        alpha = ndimage.gaussian_filter((al & np.isin(lab, order)).astype(float), .7)
        out[..., 3] = (np.clip(alpha * 1.15, 0, 1) * 255).astype(np.uint8)
        png = Image.fromarray(out); png.save(cp + '.png')
        kind = 'vector'
    else:
        f = min(2, TARGET / max(im.size))
        if f > 1.05:
            png = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
        else: png = im
        png.save(cp + '.png'); svg = None; kind = 'upscaled'
    json.dump({'kind': kind, 'key': key, 'flat': float(flat)}, open(cp + '.json', 'w'))
    return svg, png, kind

if __name__ == '__main__':
    import glob
    from multiprocessing import Pool
    jobs = sorted(glob.glob(f'{CACHE}/*.job.png'))
    def run(p):
        try: redraw(Image.open(p).convert('RGBA'), p)
        except Exception as e: print('fail', p, e)
        os.remove(p)
    with Pool(os.cpu_count()) as pool: pool.map(run, jobs, chunksize=1)
    print('done', len(jobs))
