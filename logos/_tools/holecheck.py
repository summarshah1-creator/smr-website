"""Find one-colour versions that filled in holes the original has (letter counters, gaps)."""
import json, numpy as np
from PIL import Image
from scipy import ndimage
D = json.load(open('out/logos/logos.json'))
def holes(mask):
    lab, n = ndimage.label(~mask)
    edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return sum(1 for i, s in enumerate(sizes, 1) if i not in edge and s > 12)
def ink(im):
    a = np.asarray(im.convert('RGBA')).astype(float); al = a[..., 3] > 100
    rgb = a[..., :3] / 255; lum = rgb @ [.2126, .7152, .0722]; sat = (rgb.max(-1) - rgb.min(-1)) / (rgb.max(-1) + 1e-6)
    return al & ~((lum > .86) & (sat < .14))
bad = []
for x in D['logos']:
    fs = {f['variant']: f for f in x['files'] if f['file'].endswith('.png')}
    for st in x['styles']:
        if st not in fs or any(w in st for w in ('white', 'dark', 'tile', 'app-icon')): continue
        o = Image.open('out/logos/' + x['path'] + fs[st]['file'])
        b = fs.get(st + '-black')
        if not b: continue
        m = Image.open('out/logos/' + x['path'] + b['file'])
        if m.size != o.size: m = m.resize(o.size)
        ho, hm = holes(ink(o)), holes(np.asarray(m.getchannel('A')) > 100)
        if hm < ho * 0.8 and ho - hm >= 2: bad.append((x['slug'], st, ho, hm))
print(len(bad)); [print(*b) for b in bad]
json.dump(bad, open('holes.json', 'w'))
