"""Name lockups for logos that are only an icon or initials: icon + full name, side by side and stacked.
Text uses the brand's own font where known, otherwise the closest match; colours come from the icon."""
import json, os, asyncio, base64, io, numpy as np
from PIL import Image
from playwright.async_api import async_playwright

F = '/home/claude/fonts/node_modules/@fontsource'
FONTS = {'outfit': 'outfit', 'raleway': 'raleway', 'montserrat': 'montserrat', 'cinzel': 'cinzel', 'lato': 'lato'}

def face(fam, w):
    b = base64.b64encode(open(f'{F}/{fam}/files/{fam}-latin-{w}-normal.woff2', 'rb').read()).decode()
    return f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{b}) format('woff2')}}"

def colours(icon):
    a = np.asarray(icon.convert('RGBA')).astype(float); al = a[..., 3] > 120
    rgb = a[al][:, :3]
    if len(rgb) == 0: return '#222222', '#5b616d'
    mx, mn = rgb.max(1), rgb.min(1); sat = (mx - mn) / (mx + 1e-6); lum = rgb @ [.2126, .7152, .0722] / 255
    pick = rgb[(sat > .3) & (lum < .55)]
    if len(pick) < 50: pick = rgb[lum < .45]
    if len(pick) < 50: return '#222222', '#5b616d'
    q = (pick // 24).astype(int); k, c = np.unique(q, axis=0, return_counts=True)
    main = pick[(q == k[c.argmax()]).all(1)].mean(0)
    return '#%02x%02x%02x' % tuple(int(v) for v in main), '#5b616d'

def html(icon_b64, spec, layout):
    fam = spec['font']; w1, w2 = spec.get('w1', 700), spec.get('w2', 400)
    c1, c2 = spec['c1'], spec['c2']
    up = 'uppercase' if spec.get('upper') else 'none'
    ls1, ls2 = spec.get('ls1', '0'), spec.get('ls2', '0')
    l1 = spec['l1'].replace('**', '<b>', 1).replace('**', '</b>', 1)
    h = 600
    if layout == 'h':
        body = f'''<div id=L style="display:inline-flex;align-items:center;gap:{int(h*.2)}px;padding:6px">
<img src="data:image/png;base64,{icon_b64}" style="height:{h}px;width:auto;display:block">
<div style="display:flex;flex-direction:column;justify-content:center;gap:{int(h*.06)}px">
<div style="font:{w1} {int(h*spec.get('s1',.3))}px '{fam}';color:{c1};letter-spacing:{ls1};text-transform:{up};line-height:1;white-space:nowrap">{l1}</div>
<div style="font:{w2} {int(h*spec.get('s2',.17))}px '{fam}';color:{c2};letter-spacing:{ls2};text-transform:{up};line-height:1;white-space:nowrap">{spec['l2']}</div></div></div>'''
    else:
        body = f'''<div id=L style="display:inline-flex;flex-direction:column;align-items:center;gap:{int(h*.16)}px;padding:6px">
<img src="data:image/png;base64,{icon_b64}" style="height:{h}px;width:auto;display:block">
<div style="display:flex;flex-direction:column;align-items:center;gap:{int(h*.06)}px;text-align:center">
<div style="font:{w1} {int(h*spec.get('s1',.3)*.95)}px '{fam}';color:{c1};letter-spacing:{ls1};text-transform:{up};line-height:1;white-space:nowrap">{l1}</div>
<div style="font:{w2} {int(h*spec.get('s2',.17)*.95)}px '{fam}';color:{c2};letter-spacing:{ls2};text-transform:{up};line-height:1;white-space:nowrap">{spec['l2']}</div></div></div>'''
    css = face(fam, w1) + face(fam, w2) + 'b{font-weight:800}' + (face(fam, 800) if '**' in spec['l1'] else '')
    return f'<html><head><style>{css} body{{margin:0;background:transparent}}</style></head><body>{body}</body></html>'

async def _run(jobs):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(device_scale_factor=2)
        for icon, spec, layout, out in jobs:
            buf = io.BytesIO(); icon.save(buf, 'PNG')
            await pg.set_content(html(base64.b64encode(buf.getvalue()).decode(), spec, layout))
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(120)
            await pg.locator('#L').screenshot(path=out, omit_background=True)
        await b.close()

def make(jobs): asyncio.run(_run(jobs))
