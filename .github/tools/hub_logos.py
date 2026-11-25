#!/usr/bin/env python3
"""Wire logo-library logos into the Community Hub listings.

For every listing in HUB.DIR (hub/data.js) and window.PW (hub/faith-data.js) this
matches the listing to the logo library (logos/logos.json on the logo-library
branch) by name and aliases, plus the owner-approved MAP below, then builds the
hub's assets from the library files:

  hub/lg/<slug>.webp            card logo, fits 260x260, transparent
  hub/lgs/<slug>.webp           960x150 preview sprite (colour / white / black / square)
  hub/hdp-7k2q/<slug>-c.png     HD colour PNG (white/black/square are made in the browser)
  hub/hdp-7k2q/<slug>-c.svg     vector, when the library has a real one
and sets o.lg, o.f (formats), o.col (main colours) and window.LOGOV[slug].

help-data.js and volunteer-data.js keep their own logos (hub/logos/help, hub/logos/vol);
they are only reported.

Usage:
  python3 .github/tools/hub_logos.py --lib /path/to/logos   # a checkout of the logo-library branch's logos/
  (default --lib: a temporary export of origin/logo-library)
  --dry   report only, change nothing
  --force rebuild assets that already exist
"""
import argparse, json, os, re, subprocess, sys, tempfile, shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HUB = os.path.join(ROOT, 'hub')

# Owner-approved matches (listing name, normalised -> library slug). 24-25 Nov 2026.
MAP = {
    'farley community centre': 'farley-hill-cc',
    'farley hill community centre': 'farley-hill-cc',
    'farley community group': 'fcg',
    "st mary's (parish of luton)": 'st-marys',
    "st mary's church luton": 'st-marys',
    "st mary's catholic church": 'st-marys',
    # st-christophers-luton = "St. A & C" = St Anne with St Christopher (owner 25 Nov), NOT St Andrew's
    'st anne (parish of st anne with st christopher)': 'st-christophers-luton',
    'st christopher, round green': 'st-christophers-luton',
    'newland church (wigmore site)': 'newland-church',
    'newland church (dunstable site)': 'newland-church',
    'ferrars junior school': 'ferrars-academy',
    'the ferrars academy': 'ferrars-academy',
    'someries infant school': 'someries-infant',
    'someries junior school': 'someries-infant',
    'hillborough infant and nursery school': 'hillborough',
    'hillborough infant school': 'hillborough',
    'hillborough junior school': 'hillborough',
    'church of the holy cross, marsh farm': 'holy-cross-luton',
    'calvary church of god in christ': 'cogic-calvary',
    'masjid al madani': 'al-madani',
    'hope church luton': 'hope-church-luton',
    # Sub Tuum Praesidium crest = Our Lady Help of Christians (olhc.uk, owner 25 Nov), NOT St Margaret of Scotland
    'our lady help of christians': 'our-lady-help-of-christians-luton',
    "st augustine's church with holy trinity": 'st-augustine-limbury',
    'st margaret of scotland catholic church': 'st-margaret-of-scotland-luton',  # SMR-made from their website header
    "st joseph's catholic church": 'st-josephs-limbury',
    "st luke's, leagrave": 'st-lukes-leagrave',
    'cvs bedfordshire': 'cvs-bedfordshire',
    'chaul end community centre': 'chaul-end-centre',
    'abcd-in-luton': 'abcd-in-luton',
    'bury park community centre': 'bury-park-community-centre',
}
# Never match these (listing name, normalised): the library logo belongs to someone else.
BLOCK = {
    'ramridge primary school',      # library ramridge-baptist = Ramridge Baptist Church
    'icknield primary school',      # library icknield = Icknield High School
    "st andrew's church luton",     # St A & C logo is St Anne with St Christopher, not St Andrew's
    "st andrew's, luton",
    'our lady polish catholic church',  # Dunstable: out of scope (owner 25 Nov)
}

def lkey(s):
    return re.sub(r'\s+', ' ', str(s).lower().replace('’', "'").replace('‘', "'")).strip()

def norm(s):
    s = lkey(s).replace('&', 'and')
    s = re.sub(r'\(.*?\)', ' ', s)
    s = re.sub(r"\b(the|of|ltd|cic|uk|luton)\b", ' ', s)
    return re.sub(r'[^a-z0-9]', '', s)

def load_js(path, var):
    src = open(path, encoding='utf8').read().split('\n')
    for i, ln in enumerate(src):
        if ln.startswith(var + '='):
            body = ln[len(var) + 1:].rstrip().rstrip(';')
            return src, i, json.loads(body)
    raise SystemExit(f'{var} not found in {path}')

def save_js(path, src, i, var, data):
    src[i] = var + '=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';'
    open(path, 'w', encoding='utf8').write('\n'.join(src))

FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11)

def solid(im, col):
    a = im.split()[3]; s = Image.new('RGBA', im.size, col + (255,)); s.putalpha(a); return s

def square(im, side):
    bg = Image.new('RGBA', (side, side), (255, 255, 255, 255)); t = im.copy()
    t.thumbnail((int(side * .8), int(side * .8)), Image.LANCZOS)
    bg.alpha_composite(t, ((side - t.width) // 2, (side - t.height) // 2)); return bg

def preview(im, bg, label='Preview · Luton Community Hub'):
    Wd, Hd = 240, 150; c = Image.new('RGBA', (Wd, Hd), bg); t = im.copy(); t.thumbnail((200, 96), Image.LANCZOS)
    c.alpha_composite(t, ((Wd - t.width) // 2, (Hd - 22 - t.height) // 2 + 2))
    d = ImageDraw.Draw(c); fg = (255, 255, 255, 170) if sum(bg[:3]) < 300 else (40, 40, 60, 150)
    tw = d.textlength(label, font=FONT); d.text(((Wd - tw) / 2, Hd - 18), label, font=FONT, fill=fg)
    ov = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0)); d2 = ImageDraw.Draw(ov)
    for x in range(-150, 260, 90): d2.text((x, 52), 'LUTON HUB PREVIEW', font=FONT, fill=fg[:3] + (60,))
    ov = ov.rotate(18, resample=Image.BICUBIC); c.alpha_composite(ov); return c.convert('RGB')

def colours(im, n=3):
    t = im.copy(); t.thumbnail((200, 200))
    px = [p[:3] for p in (t.get_flattened_data() if hasattr(t, 'get_flattened_data') else t.getdata()) if p[3] > 200]
    px = [p for p in px if not (min(p) > 235)]          # drop near-white
    if not px: return []
    q = Image.new('RGB', (len(px), 1)); q.putdata(px)
    q = q.quantize(colors=6, method=Image.MEDIANCUT)
    pal = q.getpalette(); cnt = sorted(q.getcolors(), reverse=True)
    out = []
    for c, i in cnt:
        if c / len(px) < .06: continue
        rgb = tuple(pal[i * 3:i * 3 + 3])
        if any(sum(abs(a - b) for a, b in zip(rgb, o)) < 60 for o in out): continue
        out.append(rgb)
        if len(out) >= n: break
    return ['#%02x%02x%02x' % c for c in out]

def pick_files(l):
    """(raster file, svg file or None) for the library logo: logo > lockup > icon, never 'made' variants."""
    fs = l['files']
    for var in ('logo', 'lockup', 'icon'):
        png = next((f['file'] for f in fs if f.get('variant') == var and f['file'].endswith(('.png', '.webp', '.jpg'))), None)
        svg = next((f['file'] for f in fs if f.get('variant') == var and f['file'].endswith('.svg') and not f.get('made')), None)
        if png or svg: return png, svg
    return None, None

def build(slug, l, lib, force):
    hd = os.path.join(HUB, 'hdp-7k2q', slug + '-c.png')
    if os.path.exists(hd) and os.path.exists(os.path.join(HUB, 'lg', slug + '.webp')) and not force:
        im = Image.open(hd).convert('RGBA')
        return im, os.path.exists(os.path.join(HUB, 'hdp-7k2q', slug + '-c.svg'))
    png, svg = pick_files(l); base = os.path.join(lib, l['path'])
    if svg:
        tmp = tempfile.mktemp(suffix='.png')
        subprocess.run(['rsvg-convert', '-w', '2000', os.path.join(base, svg), '-o', tmp], check=True)
        im = Image.open(tmp).convert('RGBA'); os.remove(tmp)
    else:
        im = Image.open(os.path.join(base, png)).convert('RGBA')
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    if max(im.size) < 1200:
        s = 1200 / max(im.size); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    im.save(hd, optimize=True)
    if svg: shutil.copy(os.path.join(base, svg), os.path.join(HUB, 'hdp-7k2q', slug + '-c.svg'))
    t = im.copy(); t.thumbnail((260, 260), Image.LANCZOS); t.save(os.path.join(HUB, 'lg', slug + '.webp'), quality=82)
    pv = [preview(im, (255, 255, 255, 255)), preview(solid(im, (255, 255, 255)), (30, 29, 42, 255)),
          preview(solid(im, (17, 17, 17)), (255, 255, 255, 255)), preview(square(im, 1024), (241, 240, 236, 255))]
    sp = Image.new('RGB', (960, 150))
    for k, p in enumerate(pv): sp.paste(p, (k * 240, 0))
    sp.save(os.path.join(HUB, 'lgs', slug + '.webp'), quality=72)
    return im, bool(svg)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--lib'); ap.add_argument('--dry', action='store_true'); ap.add_argument('--force', action='store_true'); ap.add_argument('--rebuild', default='', help='comma-separated slugs to rebuild even if already wired')
    a = ap.parse_args(); lib = a.lib; tmpd = None
    if not lib:
        tmpd = tempfile.mkdtemp()
        subprocess.run(f'git -C {ROOT} fetch -q origin logo-library && git -C {ROOT} archive origin/logo-library logos | tar -x -C {tmpd}', shell=True, check=True)
        lib = os.path.join(tmpd, 'logos')
    L = json.load(open(os.path.join(lib, 'logos.json')))['logos']; BY = {l['slug']: l for l in L}
    names, aliases = {}, {}
    for l in L:
        names.setdefault(norm(l['name']), set()).add(l['slug'])
        for al in l.get('aliases') or []: aliases.setdefault(norm(al), set()).add(l['slug'])

    def match(o):
        k = lkey(o['n'])
        if k in BLOCK: return None, 'blocked'
        if k in MAP: return MAP[k], 'approved'
        n = norm(o['n'])
        if len(names.get(n, ())) == 1: return next(iter(names[n])), 'name'
        if len(aliases.get(n, ())) == 1: return next(iter(aliases[n])), 'alias'
        return None, ''

    lvp = os.path.join(HUB, 'logo-versions.js'); lvs = open(lvp).read()
    LOGOV = json.loads(lvs[lvs.index('{'):lvs.rindex('}') + 1])
    report = {}
    for path, var in (('data.js', 'window.HUB'), ('faith-data.js', 'window.PW')):
        fp = os.path.join(HUB, path); src, i, data = load_js(fp, var)
        items = data['DIR'] if var == 'window.HUB' else data
        before = sum(1 for o in items if o.get('lg')); new, still = [], []
        rb = set(filter(None, a.rebuild.split(',')))
        for o in items:
            if o.get('lg') in rb and o['lg'] in BY and not a.dry:
                im, has_svg = build(o['lg'], BY[o['lg']], lib, True)
                o['f'] = ['svg' if has_svg else 'webp', 'png', 'jpg']; o['col'] = colours(im)
                LOGOV[o['lg']] = ['c', 'w', 'k', 's'] + (['svg'] if has_svg else [])
            if o.get('lg'): continue
            slug, how = match(o)
            if not slug or slug not in BY: still.append(o['n']); continue
            new.append((o['n'], slug, how))
            if a.dry: continue
            im, has_svg = build(slug, BY[slug], lib, a.force)
            o['lg'] = slug; o['f'] = ['svg' if has_svg else 'webp', 'png', 'jpg']; o['col'] = colours(im)
            LOGOV[slug] = ['c', 'w', 'k', 's'] + (['svg'] if has_svg else [])
        if not a.dry: save_js(fp, src, i, var, data)
        report[path] = dict(total=len(items), before=before, after=before + len(new), new=new, still=still)
    if not a.dry:
        open(lvp, 'w').write('window.LOGOV=' + json.dumps(LOGOV) + ';')
    for p, r in report.items():
        print(f"\n== {p}: {r['total']} listings, with a logo {r['before']} -> {r['after']}")
        for n, s, h in r['new']: print(f'  + {n}  ->  {s}  ({h})')
        print(f"  still without a logo ({len(r['still'])}): " + '; '.join(r['still']))
    for path, var, key in (('help-data.js', 'window.NGSHELP', 'S'), ('volunteer-data.js', 'window.NGSVOL', None)):
        txt = open(os.path.join(HUB, path), encoding='utf8').read()
        tot = len(re.findall(r'"lg":', txt)); empty = len(re.findall(r'"lg":""', txt))
        print(f'\n== {path}: lg set on {tot - empty} of {tot} (own logos in hub/logos/)')
    if tmpd: shutil.rmtree(tmpd)

if __name__ == '__main__':
    main()
