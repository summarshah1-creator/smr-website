#!/usr/bin/env python3
"""Pack demo apps into demo-data/seed/<slug>.pack.php (a PHP file that exits when requested,
followed by a ZIP of the app). The host serves static files directly, so app files must never
sit in the web root as-is. Usage: pack_demos.py <src_root> [slug ...]
<src_root>/<slug>/ holds the app (index.html at top); <src_root>/_icons/<slug>.webp its icon."""
import io, json, os, sys, zipfile
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED = os.path.join(REPO, 'demo-data', 'seed')
HEAD = b"<?php http_response_code(404); exit; __halt_compiler();"
SKIP_EXT = ('.map', '.md', '.php', '.htaccess')
def pack(src, slug):
    app = os.path.join(src, slug)
    assert os.path.isfile(os.path.join(app, 'index.html')), slug
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(app):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for f in sorted(files):
                if f.startswith('.') or f.lower().endswith(SKIP_EXT): continue
                p = os.path.join(root, f)
                rel = os.path.relpath(p, app).replace(os.sep, '/')
                comp = zipfile.ZIP_STORED if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.mp4', '.woff2', '.woff')) else zipfile.ZIP_DEFLATED
                z.write(p, 'app/' + rel, compress_type=comp)
        icon = os.path.join(src, '_icons', slug + '.webp')
        if os.path.isfile(icon): z.write(icon, 'icon.webp', compress_type=zipfile.ZIP_STORED)
    out = os.path.join(SEED, slug + '.pack.php')
    with open(out, 'wb') as fh: fh.write(HEAD + buf.getvalue())
    print(slug, os.path.getsize(out) // 1024, 'KB')
def write_seeds_php():
    data = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seeds.json')))
    js = json.dumps(data, ensure_ascii=False, indent=1)
    assert "\nJSON" not in js
    php = "<?php\nif (!defined('SMR_DEMO')) { http_response_code(404); exit; }\n/* Generated from .github/tools/seeds.json by pack_demos.py */\nreturn json_decode(<<<'JSON'\n" + js + "\nJSON\n, true);\n"
    open(os.path.join(SEED, 'seeds.php'), 'w').write(php)
if __name__ == '__main__':
    src = sys.argv[1]
    slugs = sys.argv[2:] or [d for d in os.listdir(src) if not d.startswith('_') and os.path.isdir(os.path.join(src, d))]
    for s in slugs: pack(src, s)
    write_seeds_php()
