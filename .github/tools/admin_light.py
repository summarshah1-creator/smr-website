#!/usr/bin/env python3
"""Builds demo-admin/light.css: SMR Admin's light (off-white) theme, generated from the dark CSS.

Owner rule (24 Nov): SMR Admin has a dark mode and a light mode; light is a soft off-white, never
pure white. Every CSS rule in demo-admin/index.php and the CSS inside the admin's JS files
(planner.js, jobs.js) is read, and a `html.lt <selector>` rule is written that:
  - swaps the dark surfaces for off-white ones,
  - turns faint white tints (rgba(255,255,255,a)) into soft card / ink tints,
  - darkens light text colours (keeping their hue) so they read on off-white,
  - leaves white text alone on brand gradients and solid coloured buttons.
Run it again whenever the admin's CSS changes:  python3 .github/tools/admin_light.py
"""
import colorsys, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# (sources, output). The admin pages shown inside SMR Admin (games, analytics) follow the same switch
# (localStorage smr_theme, shared on the site, plus a postMessage when it's flipped).
TARGETS = [
    (['demo-admin/index.php', 'demo-admin/planner.js', 'demo-admin/jobs.js'], 'demo-admin/light.css', True),
    (['flappy/admin.php'], 'flappy/admin-light.css', False),
    (['jummahdash/admin.php'], 'jummahdash/admin-light.css', False),
    (['music/stats.php'], 'music/stats-light.css', False),
]

# Light palette (off-white, warm)
BG = '#12111f'        # the page behind the tiles stays dark (owner: half dark, half off-white)
PAGE = '#f3f0e9'      # off-white
CARD = '#fbf9f4'      # cards / raised surfaces
FIELD = '#f8f5ef'     # inputs
INK = '#1d1b26'
MUTED = '#8a849d'   # mid grey: reads on the dark page and on off-white tiles

ROOT_VARS = f""":root.lt{{--card:{CARD};--line:rgba(40,32,70,.13);--ink:{INK};--muted:#857f97;--ok:#14a46c;--warn:#b86e00;--bad:#d6334f}}
html.lt body{{background:{BG};color:#f2f2fa}}
html.lt a{{color:#6a3fd0}}
html.lt .top,html.lt .drawer,html.lt .subtabs{{--ink:#f2f2fa;--muted:#a3a3bd;--line:rgba(255,255,255,.1);color:#f2f2fa}}
html.lt .top{{background:rgba(10,9,20,.94)!important;border-bottom-color:rgba(255,255,255,.08)!important}}
html.lt .top .btn{{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#f2f2fa}}
html.lt .drawer{{background:#0e0d1b!important;color:#f2f2fa}}
html.lt .drawer .tabs button{{color:#cfcfe0!important;background:transparent}}
html.lt .drawer .tabs button svg{{color:inherit!important}}
html.lt .scrim,html.lt .dscrim{{background:rgba(3,3,10,.6)!important;color:inherit}}
html.lt .drawer .tabs button.on{{background:rgba(214,59,255,.18)!important;color:#fff!important}}
html.lt .subtabs button{{background:rgba(255,255,255,.04)!important;color:#a3a3bd!important;border-color:rgba(255,255,255,.12)!important}}
html.lt .subtabs button.on{{background:rgba(214,59,255,.18)!important;color:#fff!important;border-color:rgba(214,59,255,.55)!important}}
html.lt .tab>.bar,html.lt .tab>.bar h1,html.lt .plh h1,html.lt .jbh h1,html.lt .gbar h1{{color:#f6f4ff}}
html.lt .tab>.bar .sub,html.lt .plh small,html.lt .jbh small,html.lt .plsec,html.lt .gback{{color:#b9b4cc!important}}
html.lt .plsec i{{background:rgba(255,255,255,.12)}}
html.lt input,html.lt textarea,html.lt select{{background:{FIELD};color:{INK};border-color:rgba(40,32,70,.16)}}
html.lt input[type=date],html.lt input[type=time]{{color-scheme:light}}
html.lt .btn{{background:{CARD};border-color:rgba(40,32,70,.14);color:{INK}}}
html.lt .btn.pri{{background:var(--grad);color:#fff;border:0}}
html.lt .btn.wa{{background:#25d366;color:#062b14;border:0}}
html.lt .btn.bad{{color:#c8233f}}
html.lt .sheet{{background:{CARD};color:{INK};border-color:rgba(40,32,70,.12);box-shadow:0 -20px 50px -20px rgba(0,0,0,.6)}}
html.lt .sheet h2,html.lt .sheet h3{{color:{INK}}}
html.lt .toast{{background:#fbf9f4;color:{INK};box-shadow:0 10px 30px rgba(0,0,0,.4)}}
html.lt .plnext{{background:linear-gradient(135deg,#5b5bff,#b13bff)!important;border:0!important;color:#fff}}
html.lt .plnext .k,html.lt .plnext .who,html.lt .plnext .nt,html.lt .plnext h2{{color:#fff!important;opacity:.95}}
html.lt .plnext .btn{{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.35);color:#fff}}
html.lt .plnext .bt .done{{background:#fff;color:#4a2fc0}}
html.lt .plnext .why{{background:rgba(255,255,255,.22)!important;color:#fff!important}}
html.lt .jbrem{{background:{CARD}!important;border:2px solid #ff5470!important;color:{INK}}}
html.lt .jbrem .rr span{{color:#9a3446!important}}
html.lt .plempty,html.lt .empty{{background:rgba(251,249,244,.06);border-color:rgba(255,255,255,.16);color:#b9b4cc}}
html.lt .chips button.on,html.lt .seg .on{{color:#fff}}
"""

PAGE_VARS = f"""html.lt body{{background:{BG};color:#f2f2fa}}
html.lt input,html.lt select,html.lt textarea{{background:{FIELD};color:{INK};border-color:rgba(40,32,70,.16)}}"""

DARK_SURFACES = {
    '#08080f': BG, '#0e0e1a': '#ece8df', '#12121e': CARD, '#14141f': CARD, '#0c0c16': FIELD, '#16162a': CARD, '#1a1a2a': CARD, '#101019': CARD,
}

def parse_color(s):
    s = s.strip().lower()
    m = re.fullmatch(r'#([0-9a-f]{3}|[0-9a-f]{6})', s)
    if m:
        h = m.group(1)
        if len(h) == 3: h = ''.join(c * 2 for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (1.0,)
    m = re.fullmatch(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)', s)
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3)), float(m.group(4) or 1)
    return None

def lum(r, g, b): return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

def darken_text(r, g, b, a):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if s < 0.12:   # grey / white text → ink or muted
        return INK if l > 0.8 else MUTED
    l2 = 0.44 if s > 0.5 else 0.4
    s2 = min(1, s * 0.95)
    r2, g2, b2 = colorsys.hls_to_rgb(h, l2, s2)
    return '#%02x%02x%02x' % (round(r2 * 255), round(g2 * 255), round(b2 * 255)) if a >= 1 else 'rgba(%d,%d,%d,%.2f)' % (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)

COLOR_RE = re.compile(r'#[0-9a-fA-F]{3,6}\b|rgba?\([^)]*\)')

def blend(r, g, b, a):
    k = min(1, a * 1.7)
    cr, cg, cb = (int(CARD[i:i + 2], 16) for i in (1, 3, 5))
    return '#%02x%02x%02x' % (round(cr + (r - cr) * k), round(cg + (g - cg) * k), round(cb + (b - cb) * k))

def map_bg_value(v):
    def rep(m):
        c = parse_color(m.group(0))
        if not c: return m.group(0)
        r, g, b, a = c
        hx = m.group(0).lower()
        if hx in DARK_SURFACES: return DARK_SURFACES[hx]
        if (r, g, b) == (255, 255, 255):
            return CARD if a <= 0.06 else 'rgba(40,32,70,%.3f)' % min(0.14, a * 0.9)
        if lum(r, g, b) < 0.12 and a > 0.5 and a < 0.8: return m.group(0)   # overlays (scrims) stay dark
        if lum(r, g, b) < 0.12 and a > 0.5:   # other near-black surfaces
            return CARD
        if lum(r, g, b) < 0.12:   # dark scrims / shades stay dark
            return m.group(0)
        # tinted panels (rgba(214,59,255,.14) etc.) become solid light tints of that colour, so their text reads anywhere
        if a < 0.6: return blend(r, g, b, a)
        return m.group(0)
    return COLOR_RE.sub(rep, v)

def map_border_value(v):
    def rep(m):
        c = parse_color(m.group(0))
        if not c: return m.group(0)
        r, g, b, a = c
        if lum(r, g, b) > 0.85 and a < 1: return 'rgba(40,32,70,%.2f)' % min(0.2, a * 1.3 + 0.04)
        if lum(r, g, b) < 0.12: return 'rgba(40,32,70,.12)'
        return m.group(0)
    return COLOR_RE.sub(rep, v)

def map_color_value(v):
    c = parse_color(v.replace('!important', ''))
    if not c: return None
    r, g, b, a = c
    if lum(r, g, b) < 0.55: return None
    out = darken_text(r, g, b, a)
    return out + (' !important' if '!important' in v else '')

def light_solid(decls):
    for k, v in decls:
        if k in ('background', 'background-color'):
            c = parse_color(v.split()[0]) if v else None
            if c and c[3] >= 0.95 and lum(*c[:3]) > 0.85: return True
    return False

def keeps_white(decls):
    bg = ' '.join(v for k, v in decls if k in ('background', 'background-color', 'background-image'))
    if 'var(--grad)' in bg or 'linear-gradient' in bg and not re.search(r'rgba\([^)]*,\s*\.\d+\)', bg): return True
    for m in COLOR_RE.finditer(bg):
        c = parse_color(m.group(0))
        if c and c[3] >= 0.85 and lum(*c[:3]) > 0.15 and max(c[:3]) - min(c[:3]) > 60: return True   # solid coloured button
    return False

def rules(css):
    """Yield (prefix, selector, decls) for plain rules; handles @media nesting, skips @keyframes/@font-face."""
    i, n = 0, len(css)
    def block(start):
        depth, j = 0, start
        while j < n:
            if css[j] == '{': depth += 1
            elif css[j] == '}':
                depth -= 1
                if depth == 0: return j
            j += 1
        return n
    out = []
    def walk(lo, hi, prefix):
        k = lo
        while k < hi:
            o = css.find('{', k, hi)
            if o < 0: break
            sel = css[k:o].strip()
            c = block(o)
            if sel.startswith('@media') or sel.startswith('@supports'):
                walk(o + 1, c, sel)
            elif not sel.startswith('@'):
                out.append((prefix, sel, css[o + 1:c]))
            k = c + 1
    walk(0, n, '')
    return out

def decls_of(body):
    res = []
    for d in re.split(r';(?![^(]*\))', body):
        if ':' not in d: continue
        k, v = d.split(':', 1)
        res.append((k.strip().lower(), v.strip()))
    return res

def scope(sel):
    parts = []
    for p in re.split(r',(?![^(]*\))', sel):
        p = p.strip()
        if not p: continue
        if p.startswith(':root'): continue
        if p.startswith('html'): p = 'html.lt' + p[4:]
        elif p.startswith('body'): p = 'html.lt ' + p
        else: p = 'html.lt ' + p
        parts.append(p)
    return ','.join(parts)

def css_sources(SRC):
    for f in SRC:
        t = open(os.path.join(ROOT, f), encoding='utf-8').read()
        if f.endswith('.php'):
            for m in re.finditer(r'<style[^>]*>(.*?)</style>', t, re.S): yield m.group(1)
        else:
            m = re.search(r"css\.textContent\s*=\s*\[(.*?)\]\.join", t, re.S)
            if m:
                parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1))
                yield '\n'.join(p.replace("\\'", "'") for p in parts)

def build(SRC, OUT, admin):
    out = [ROOT_VARS if admin else PAGE_VARS]
    for css in css_sources(SRC):
        for prefix, sel, body in rules(css):
            ds = decls_of(body)
            if not ds: continue
            sc = scope(sel)
            if not sc: continue
            white = keeps_white(ds)
            inverted = light_solid(ds)   # e.g. a selected tab drawn as a light pill: becomes a dark pill
            new = []
            for k, v in ds:
                if k in ('background', 'background-color') or (k == 'background-image' and 'gradient' in v):
                    if 'var(--grad)' in v or (white and 'gradient' in v):
                        new.append(f'{k}:{v}')   # keep the brand gradient (a looser light rule mustn't win over it)
                        new += [f'{k2}:{v2}' for k2, v2 in ds if k2 in ('-webkit-background-clip', 'background-clip')]
                        continue
                    if inverted: new.append(f'{k}:{INK}'); continue
                    nv = map_bg_value(v)
                    if nv != v:
                        new.append(f'{k}:{nv}')
                        if not any(k2 == 'color' for k2, _ in ds) and not re.search(r'rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0?\.[0-7]', nv): new.append(f'color:{INK}')
                elif k.startswith('border') and k != 'border-radius':
                    nv = map_border_value(v)
                    if nv != v: new.append(f'{k}:{nv}')
                elif k == 'color' and inverted:
                    new.append(f'color:{CARD}')
                elif k == 'color' and white:
                    new.append(f'color:{v}')   # white text on a gradient / coloured button stays white
                elif k == 'color' and not white:
                    nv = map_color_value(v)
                    if nv: new.append(f'color:{nv}')
                elif k == 'box-shadow' and 'rgba(0,0,0' in v.replace(' ', ''):
                    new.append('box-shadow:' + re.sub(r'rgba\(0,\s*0,\s*0,\s*([\d.]+)\)', lambda m: 'rgba(40,30,70,%.2f)' % (float(m.group(1)) * 0.35), v))
            if not new: continue
            rule = sc + '{' + ';'.join(new) + '}'
            out.append((prefix + '{' + rule + '}') if prefix else rule)
    if admin: out.append(ROOT_VARS.split('\n', 1)[1])   # hand-tuned pieces win (they come last)
    open(os.path.join(ROOT, OUT), 'w', encoding='utf-8').write('/* Generated by .github/tools/admin_light.py: SMR Admin light (off-white) theme. Do not edit by hand. */\n' + '\n'.join(out) + '\n')
    print(OUT, len(out), 'rules')

def main():
    for src, out, admin in TARGETS: build(src, out, admin)

if __name__ == '__main__':
    main()
