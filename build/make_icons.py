"""Makes the My Sirat app icons from the owner's logo (sources/brand/mysirat-logo.png, grey mark on transparent).
Run: python3 build/make_icons.py"""
import os
from PIL import Image
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sources', 'mysirat-skin')
BG = (11, 11, 12, 255)
logo = Image.open(os.path.join(os.path.dirname(D), 'brand', 'mysirat-logo.png')).convert('RGBA'); logo = logo.crop(logo.getbbox())
def icon(size, frac):
    c = Image.new('RGBA', (size * 4, size * 4), BG); h = int(size * 4 * frac); w = round(logo.width * h / logo.height)
    m = logo.resize((w, h), Image.LANCZOS); c.alpha_composite(m, ((c.width - w) // 2, (c.height - h) // 2))
    return c.resize((size, size), Image.LANCZOS).convert('RGB')
for s in (180, 192, 512): icon(s, .62).save(f'{D}/icon-{s}.png', optimize=True)
icon(512, .5).save(f'{D}/maskable-512.png', optimize=True)
# marks on transparent (202x256): light = the logo's own greys (for dark backgrounds), dark = darker greys (for light backgrounds)
def mark(dark):
    m = logo.copy(); m.thumbnail((202, 256), Image.LANCZOS); c = Image.new('RGBA', (202, 256), (0, 0, 0, 0)); c.alpha_composite(m, ((202 - m.width) // 2, (256 - m.height) // 2))
    if dark:
        px = c.load()
        for y in range(c.height):
            for x in range(c.width):
                r, g, b, a = px[x, y]; px[x, y] = (int(r * .5), int(g * .5), int(b * .5), a)
    return c
mark(False).save(f'{D}/mark-light.png', optimize=True); mark(True).save(f'{D}/mark-dark.png', optimize=True)
print('icons ok')
