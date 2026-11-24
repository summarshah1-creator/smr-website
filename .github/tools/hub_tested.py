#!/usr/bin/env python3
"""Community Hub tested registry: which features need retesting?

hub/TESTED.json lists every feature with the files it depends on and a sha256 of those files when it was last tested.
A feature needs retesting when any of its files has changed since, or when its result is "fail".

  python3 .github/tools/hub_tested.py            # list features: needs retest / still tested
  python3 .github/tools/hub_tested.py --stamp ID [--result pass|pass with notes|fail] [--notes "..."]
                                                  # after retesting: record today's hashes for that feature
  python3 .github/tools/hub_tested.py --hash FILE [FILE ...]   # print the combined hash of some files
"""
import hashlib, json, os, sys, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
REG = os.path.join(ROOT, 'hub', 'TESTED.json')


def combined(files):
    h = hashlib.sha256()
    for f in sorted(files):
        p = os.path.join(ROOT, 'hub', f)
        h.update(f.encode() + b'\0')
        h.update(open(p, 'rb').read() if os.path.exists(p) else b'<missing>')
    return h.hexdigest()


def main(a):
    if a[:1] == ['--hash']:
        print(combined(a[1:]))
        return
    reg = json.load(open(REG))
    feats = reg['features']
    if a[:1] == ['--stamp']:
        fid = a[1]
        f = next(x for x in feats if x['id'] == fid)
        f['sha256'] = combined(f['files'])
        f['tested'] = datetime.date.today().isoformat()
        if '--result' in a: f['result'] = a[a.index('--result') + 1]
        if '--notes' in a: f['notes'] = a[a.index('--notes') + 1]
        json.dump(reg, open(REG, 'w'), indent=1, ensure_ascii=False)
        print('stamped', fid)
        return
    need, ok = [], []
    for f in feats:
        changed = combined(f['files']) != f.get('sha256')
        (need if changed or f.get('result') == 'fail' else ok).append((f, changed))
    print(f'NEEDS RETEST ({len(need)})')
    for f, ch in need:
        print(f"  {f['id']:<22} {f['name']}  [{'files changed' if ch else 'marked fail'}]  route {f['route']}")
    print(f'\nSTILL TESTED ({len(ok)})')
    for f, _ in ok:
        print(f"  {f['id']:<22} {f['name']}  ({f['result']}, {f['tested']})")


if __name__ == '__main__':
    main(sys.argv[1:])
