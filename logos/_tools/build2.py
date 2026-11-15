"""SMR logo library build, v2.
Every logo style gets: original (+SVG where we have one), all-black, all-white, an alt colour version
(two-tone for dark backgrounds, and/or a single brand-colour version), with black/white also traced to SVG.
Opaque logos (white backgrounds, app tiles) get their background removed first; app tiles are kept as app-icon too."""
import os, shutil, json, subprocess, numpy as np, potrace
from redraw import redraw
from PIL import Image
exec(open('map.py').read())
APP = '/home/claude/site/img/m/full/'
OLD_SVG = {'bpjm', 'irshad', 'raynham-way-cc'}
NO_ICON = {'yusuf-hall', 'leagrave-hall', 'al-nikah', 'grand-royale', 'as-sunnah', 'bushmead'}
MAXPX = 1800
NOREDRAW = {'tops-pizza', 'norton-road', 'lcm', 'lscm', 'al-hikmah', 'kashmir-catering', 'girlguiding'}
SIGNED = set(json.load(open('signoff.json'))) if os.path.exists('signoff.json') else set()

# ---------- source fixes ----------
for s, (cat, name, al, src) in list(M.items()):
    if cat != 'mosques': continue
    if not os.path.exists(APP + s + '.png'): continue   # not in the Inspire FM app: keep its own logo
    keep = [x for x in src if x[1] != 'logo']
    new = [(APP + s + '.png', 'logo')]
    if s not in OLD_SVG and os.path.exists(f'raw/winter/{s}.svg'): new.append((f'winter/{s}.svg', 'logo'))
    M[s] = (cat, name, al, new + keep)
bp = M.pop('bpjm'); bj = M.pop('bury-park-jamia')
M['bury-park-jami-masjid'] = ('mosques', 'Bury Park Jami Masjid', ['BPJM', 'Bury Park Jamia Masjid'], bp[3] + [(bj[3][0][0], 'logo-arabic')])
M['madinah'][3].extend([('upload/madinah-lockup.png', 'lockup-arabic'), ('upload/madinah-app-icon.png', 'app-icon')])
kh = M.pop('keech-hospice')
M['keech-hospice-care'] = ('charities', 'Keech Hospice Care', ['Keech', 'Keech Hospice'], M['keech-hospice-care'][3] + [(kh[3][0][0], 'logo-alt')])
M['inspire-fm'] = ('media', 'Inspire FM 105.1', ['Inspire', 'Inspire FM'], [
    ('ifm/logo.webp', 'logo'), ('winter/inspire-fm.svg', 'logo'),
    ('ifm/logo-dark.webp', 'logo-on-dark'), ('winter/inspire-fm-white.svg', 'logo-on-dark'),
    ('ifm/logo-green.webp', 'logo-on-green'), ('ifm/logo-inv.png', 'logo-inverse'),
    ('ifm/wordmark-dark.webp', 'wordmark-on-dark'), ('gold/inspire-fm-gold.png', 'gold'),
    ('ifm/icon-512.png', 'app-icon'), ('ifm/maskable-512.png', 'app-icon-maskable')])
M['luton-foodbank'][3].append(('gold/luton-foodbank-gold.png', 'gold'))
M['sunnah-charity'][3].append(('gold/sunnah-gold.png', 'gold'))
M['smr-digital'][3].extend([('gold/smr-digital-gold.png', 'gold')])
M['smr-digital'] = ('smr', 'SMR Digital', ['SMR'], [x for x in M['smr-digital'][3] if x[0] != 'winter/smr-digital-light.png'] + [('gold/smr-digital-light.png', 'logo-on-dark')])

CAT = {'mosques': 'Mosques & Islamic centres', 'schools': 'Schools & colleges', 'charities': 'Charities',
       'community': 'Council, public & youth', 'campaigns': 'Campaigns & events', 'media': 'Media',
       'venues': 'Venues & days out', 'businesses': 'Businesses & sponsors', 'smr': 'SMR'}
# styles that are already a recolour for dark/one colour: kept, but no new variants made from them
NOVAR = ('white', 'mono', 'dark', 'light', 'inverse', 'green', 'gold')

# ---------- helpers ----------
def render_svg(paths, outdir):
    subprocess.run(['python3', '/tmp/svgr/r.py', outdir] + paths, check=True)

def trim(im):
    a = np.asarray(im.getchannel('A')) > 12
    if not a.any(): return im
    ys, xs = np.where(a); p = 2
    return im.crop((max(xs.min() - p, 0), max(ys.min() - p, 0), min(xs.max() + p + 1, im.width), min(ys.max() + p + 1, im.height)))

def cap(im):
    s = MAXPX / max(im.size)
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS) if s < 1 else im

def remove_bg(im):
    """Flood-fill the border colour to transparent (white page or a flat/patterned tile)."""
    a = np.asarray(im).astype(np.int16)
    h, w = a.shape[:2]
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])[:, :3]
    bg = np.median(border, 0)
    diff = np.abs(a[..., :3] - bg).max(-1)
    tol = 60 if border.std() > 6 else 38
    near = diff < tol
    from scipy import ndimage
    lab, n = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    m = np.isin(lab, list(edge))
    out = np.asarray(im).copy()
    # soft edge: partial alpha for pixels close to the background colour next to it
    alpha = np.where(m, 0, 255).astype(np.uint8)
    out[..., 3] = np.minimum(out[..., 3], alpha)
    return Image.fromarray(out), m.mean()

def is_opaque(im):
    return (np.asarray(im.getchannel('A')) < 20).mean() < 0.03

def lum_sat(arr):
    rgb = arr[..., :3] / 255.0
    mx, mn = rgb.max(-1), rgb.min(-1)
    return rgb @ [.2126, .7152, .0722], (mx - mn) / (mx + 1e-6)

def ink_mask(im, keep_light):
    a = np.asarray(im).astype(float)
    al = a[..., 3] > 40
    if keep_light: return al
    lum, sat = lum_sat(a)
    paper = (lum > .86) & (sat < .14)
    m = al & ~paper
    return m if m.sum() > 0.25 * al.sum() else al

def solid(mask, rgb):
    out = np.zeros(mask.shape + (4,), np.uint8); out[mask] = rgb + (255,)
    return Image.fromarray(out)

def ondark(im):
    a = np.asarray(im).astype(float); lum, sat = lum_sat(a); al = a[..., 3] > 12
    m = al & (lum < .3) & (sat < .3)
    if m.sum() < .04 * al.sum(): return None
    out = np.asarray(im).copy(); out[m, :3] = 255; return Image.fromarray(out)

def brand_colour(im):
    a = np.asarray(im).astype(float); lum, sat = lum_sat(a); al = a[..., 3] > 100
    m = al & (sat > .35) & (lum > .12) & (lum < .85)
    if m.sum() < .03 * al.sum(): return None
    q = (a[m][:, :3] // 24).astype(int)
    keys, counts = np.unique(q, axis=0, return_counts=True)
    k = keys[counts.argmax()]
    sel = (q == k).all(1)
    return tuple(int(v) for v in a[m][sel][:, :3].mean(0))

def trace_svg(mask, fill, path):
    bm = potrace.Bitmap(~mask)   # potracer traces the False pixels
    plist = bm.trace(turdsize=3, alphamax=1.0, opticurve=True, opttolerance=0.2)
    h, w = mask.shape
    d = []
    for c in plist:
        sp = c.start_point; d.append(f'M{sp.x:.1f} {sp.y:.1f}')
        for sg in c.segments:
            if sg.is_corner: d.append(f'L{sg.c.x:.1f} {sg.c.y:.1f}L{sg.end_point.x:.1f} {sg.end_point.y:.1f}')
            else: d.append(f'C{sg.c1.x:.1f} {sg.c1.y:.1f} {sg.c2.x:.1f} {sg.c2.y:.1f} {sg.end_point.x:.1f} {sg.end_point.y:.1f}')
        d.append('Z')
    open(path, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><path fill="{fill}" fill-rule="evenodd" d="{"".join(d)}"/></svg>')


KNOCK = {'ukim-luton': 'dark', 'global-helping-hands': 'light'}
CUR = ['']
def knock(mask, im):
    """For solid shapes: cut out the colour that contrasts most with the shape's own fill, per shape."""
    from scipy import ndimage
    a = np.asarray(im.convert('RGBA')).astype(float)[..., :3]
    lum = a @ [.2126, .7152, .0722]
    lab, n = ndimage.label(ndimage.binary_closing(mask, iterations=2))
    out = mask.copy(); tot = mask.sum()
    for k in range(1, n + 1):
        comp = (lab == k) & mask
        if comp.sum() < .03 * tot: continue
        ys, xs = np.where(comp)
        if comp[ys.min():ys.max()+1, xs.min():xs.max()+1].mean() < .5: continue
        inner = ndimage.binary_erosion(comp, iterations=2)
        ring = inner & ~ndimage.binary_erosion(comp, iterations=max(6, int(.04 * max(np.ptp(ys), np.ptp(xs)))))
        core = ndimage.binary_erosion(comp, iterations=3)
        if ring.sum() < 20 or core.sum() < 50: continue
        px = a[core]; q = (px // 40).astype(int)
        keys, cnt = np.unique(q, axis=0, return_counts=True)
        cents = [px[(q == kk).all(1)].mean(0) for kk, c in zip(keys, cnt) if c > .04 * len(px)]
        if len(cents) < 2: continue
        # plate = cluster most common in the interior (not the outline)
        cl = lambda P: np.argmin(np.abs(P[:, None, :] - np.array(cents)[None]).max(-1), 1)
        plate = np.bincount(cl(px), minlength=len(cents)).argmax()
        pl = np.array(cents[plate]) @ [.2126, .7152, .0722]
        cand = [i for i in range(len(cents)) if i != plate and np.abs(np.array(cents[i]) - cents[plate]).max() > 60]
        if not cand: continue
        L = lambda i: np.array(cents[i]) @ [.2126, .7152, .0722]
        ov = KNOCK.get(CUR[0])
        if ov == 'dark': hole = min(range(len(cents)), key=L)
        elif ov == 'light': hole = max(range(len(cents)), key=L)
        else: hole = max(cand, key=lambda i: abs(L(i) - pl))
        lab_all = np.zeros(comp.shape, int) - 1
        lab_all[comp] = cl(a[comp])
        holes = comp & (lab_all == hole) & ~ring
        frac = holes.sum() / comp.sum()
        if .02 < frac < .7: out &= ~ndimage.binary_opening(holes, iterations=1)
    return out

def sig(im):
    g = Image.fromarray((np.asarray(im.getchannel('A')) > 60).astype(np.uint8) * 255).resize((64, 32))
    return np.asarray(g, float)

def icon_crop(im):
    a = np.asarray(im.getchannel('A')) > 40; H, W = a.shape
    def gaps(v, n):
        g = []; st = None
        for i, x in enumerate(v):
            if not x and st is None: st = i
            if x and st is not None: g.append((st, i)); st = None
        return [x for x in g if x[1] - x[0] >= max(4, n * .025) and x[0] > n * .08]
    for g0, _ in gaps(a.any(0), W):
        part = trim(im.crop((0, 0, g0, H))); r = part.width / part.height
        if .55 < r < 1.8 and g0 < .5 * W and part.height > .6 * H: return part
    for g0, _ in gaps(a.any(1), H):
        part = trim(im.crop((0, 0, W, g0))); r = part.width / part.height
        if .5 < r < 2.2 and .4 * H < g0 < .8 * H: return part
    return None

# ---------- render every SVG source once ----------
os.makedirs('svgr', exist_ok=True)
svgs = sorted({('raw/' + p) for v in M.values() for p, _ in v[3] if p.endswith('.svg') and not p.startswith('/')})
todo = [p for p in svgs if not os.path.exists('svgr/' + os.path.basename(p)[:-4] + '.png')]
if todo: render_svg(todo, 'svgr')

OUT = 'out/logos'
ONLY = set(filter(None, os.environ.get('ONLY', '').split(',')))
if not ONLY: shutil.rmtree('out', ignore_errors=True)
INFO = json.load(open('info.json'))
INFO['keech-hospice-care'] = {**INFO.get('keech-hospice', {}), **INFO.get('keech-hospice-care', {}), 'note': 'Also a Jummah venue (Great Bramingham Lane)'}
index = []
for s, (cat, name, al, src) in sorted(M.items(), key=lambda x: (list(CAT).index(x[1][0]), x[1][1].lower())):
    if ONLY and s not in ONLY: continue
    CUR[0] = s
    d = f'{OUT}/{cat}/{s}'; shutil.rmtree(d, ignore_errors=True); os.makedirs(d, exist_ok=True)
    styles = {}   # style -> dict(png=Image, svg=path)
    for path, var in src:
        p = path if path.startswith('/') else 'raw/' + path
        st = styles.setdefault(var, {})
        if p.endswith('.svg'):
            st['svg'] = p
            if 'png' not in st:
                st['png_from_svg'] = Image.open('svgr/' + os.path.basename(p)[:-4] + '.png').convert('RGBA')
        else:
            im = Image.open(p).convert('RGBA')
            if 'png' not in st or max(im.size) > max(st['png'].size): st['png'] = im
    seen = []
    for var in list(styles):
        im0 = styles[var].get('png') or styles[var].get('png_from_svg')
        if im0 is None or styles[var].get('svg') or var.startswith('app-icon'): continue
        t = trim(im0); sg0 = sig(t); col = np.asarray(t.resize((16, 8)).convert('RGB'), float)
        dup = next((o for o in seen if np.abs(o[1] - sg0).mean() < 7 and np.abs(o[2] - col).mean() < 30), None)
        if dup:
            keep, drop = (dup[0], var) if max(styles[dup[0]]['png' if 'png' in styles[dup[0]] else 'png_from_svg'].size) >= max(im0.size) else (var, dup[0])
            if keep != dup[0]: styles[keep]['png'] = im0
            if keep == var: seen.remove(dup); seen.append((var, sg0, col))
            styles[keep] = styles[keep]; styles.pop(drop, None)
        else: seen.append((var, sg0, col))
    files = []; masks = []; extra = {}
    def save(im, fn, var, made=False, style=None):
        im.save(f'{d}/{fn}', optimize=True)
        files.append({'file': fn, 'variant': var, 'style': style, 'w': im.width, 'h': im.height, **({'made': True} if made else {})})
    for var, st in list(styles.items()):
        im = st.get('png') or st.get('png_from_svg')
        if st.get('svg'):
            fn = f'{s}-{var}.svg'; shutil.copy(st['svg'], f'{d}/{fn}'); files.append({'file': fn, 'variant': var, 'style': var, 'vector': True})
        if im is None: continue
        im = cap(trim(im))
        if is_opaque(im):
            cut, frac = remove_bg(im)
            if var.endswith('-tile'):
                save(im, f'{s}-{var}.png', var, style=var)
                a0 = np.asarray(im).astype(int); bgc = tuple(int(v) for v in np.median(np.concatenate([a0[0], a0[-1]])[:, :3], 0))
                if frac > .2: tc = trim(cut); extra[var[:-5]] = solid(knock(np.asarray(tc.getchannel('A')) > 40, tc), bgc)
                continue
            if var.startswith('app-icon'):
                save(im, f'{s}-{var}.png', var, style=var)              # keep the tile as it is
                if frac > .2 and not any(v.startswith('icon') for v in styles):
                    a0 = np.asarray(im).astype(int); bgc = tuple(int(v) for v in np.median(np.concatenate([a0[0], a0[-1]])[:, :3], 0))
                    tc = trim(cut); cm = knock(np.asarray(tc.getchannel('A')) > 40, tc)
                    extra['icon'] = solid(cm, bgc)
                continue
            if frac > .05: im = trim(cut)
        if not st.get('svg') and max(im.size) < 900 and s not in SIGNED and s not in NOREDRAW:
            svgt, png, kind = redraw(im, f'{s}/{var}')
            st['kind'] = kind
            if svgt:
                fn = f'{s}-{var}.svg'; open(f'{d}/{fn}', 'w').write(svgt)
                files.append({'file': fn, 'variant': var, 'style': var, 'vector': True, 'redrawn': True})
            im = cap(trim(png))
        save(im, f'{s}-{var}.png', var, style=var)
        st['final'] = im
    # auto icon from the main logo
    main = styles.get('logo', {}).get('final') or next((v['final'] for k, v in styles.items() if 'final' in v), None)
    if main is not None and s not in NO_ICON and not any(k.startswith('icon') for k in styles) and 'icon' not in extra:
        ic = icon_crop(main)
        if ic is not None: extra['icon'] = ic
    for k, im in extra.items():
        save(im, f'{s}-{k}.png', k, made=True, style=k); styles[k] = {'final': im}
    # variants for every style
    for var, st in styles.items():
        im = st.get('final')
        if im is None: continue
        keep_light = any(w in var for w in NOVAR)
        if keep_light and any(not any(w in k for w in NOVAR) for k in styles): continue
        m = knock(ink_mask(im, keep_light), im)
        if keep_light and any(w in var for w in ('white','mono')):
            pass
        sg = sig(solid(m, (0, 0, 0)))
        if any(np.abs(sg - o).mean() < 6 for o in masks):    # same silhouette as another style: skip duplicate
            pass
        else:
            masks.append(sg)
            save(solid(m, (17, 17, 17)), f'{s}-{var}-black.png', var + '-black', True, var)
            save(solid(m, (255, 255, 255)), f'{s}-{var}-white.png', var + '-white', True, var)
            big = m
            if max(m.shape) < 1200:   # trace from a 2x upscale for smoother curves
                up = Image.fromarray(m.astype(np.uint8) * 255).resize((m.shape[1] * 2, m.shape[0] * 2), Image.LANCZOS)
                big = np.asarray(up) > 127
            try:
                trace_svg(big, '#111111', f'{d}/{s}-{var}-black.svg'); files.append({'file': f'{s}-{var}-black.svg', 'variant': var + '-black', 'style': var, 'vector': True, 'made': True})
                trace_svg(big, '#ffffff', f'{d}/{s}-{var}-white.svg'); files.append({'file': f'{s}-{var}-white.svg', 'variant': var + '-white', 'style': var, 'vector': True, 'made': True})
            except Exception as e:
                print('trace failed', s, var, e)
        has_dark_version = any(k.startswith(var) and any(w in k for w in ('white', 'dark', 'light', 'inverse')) for k in styles if k != var)
        od = None if (has_dark_version or keep_light) else ondark(im)
        if od is not None: save(od, f'{s}-{var}-on-dark.png', var + '-on-dark', True, var)
        bc = None if keep_light else brand_colour(im)
        if bc is not None:
            alt = solid(knock(ink_mask(im, False), im), bc)
            # only keep the one-colour version if it differs from the original enough to be useful
            save(alt, f'{s}-{var}-brand-colour.png', var + '-brand-colour', True, var)
    big = max([max(f.get('w', 0), f.get('h', 0)) for f in files if not f.get('made') and not f.get('vector')] + [0])
    vec = any(f.get('vector') and not f.get('made') for f in files)
    redrawn = any(f.get('redrawn') for f in files)
    index.append({'slug': s, 'name': name, 'aliases': al, 'category': cat, 'category_name': CAT[cat], 'path': f'{cat}/{s}/',
                  'styles': [k for k in styles], 'original_vector': vec,
                  'quality': ('redrawn' if redrawn and not any(f.get('vector') and not f.get('made') and not f.get('redrawn') for f in files) else 'vector') if vec else ('hd' if big >= 900 else 'ok' if big >= 480 else 'low-res'),
                  'details': INFO.get(s, {}), 'signed_off': s in SIGNED, 'files': files})
if ONLY and os.path.exists(f'{OUT}/logos.json'):
    old = [x for x in json.load(open(f'{OUT}/logos.json'))['logos'] if x['slug'] not in ONLY]
    index = sorted(old + index, key=lambda x: (list(CAT).index(x['category']), x['name'].lower()))
json.dump({'updated': '2026-11-15', 'categories': CAT, 'logos': index}, open(f'{OUT}/logos.json', 'w'), indent=1)
from collections import Counter
print(len(index), 'orgs', sum(len(x['files']) for x in index), 'files', Counter(x['quality'] for x in index))
print('no black/white:', [x['slug'] for x in index if not any(f['variant'].endswith('-black') for f in x['files'])])
