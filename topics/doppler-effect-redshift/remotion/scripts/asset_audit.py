"""asset audit: every staticFile("...") path exists under public/, and every public/ file is used."""
import os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
used = set()
for d, _, fs in os.walk(os.path.join(root, 'src')):
    for f in fs:
        if f.endswith(('.ts', '.tsx')):
            used |= set(re.findall(r'staticFile\(\s*["`\']([^"`\']+)["`\']', open(os.path.join(d, f)).read()))
pub = set()
for d, _, fs in os.walk(os.path.join(root, 'public')):
    for f in fs:
        pub.add(os.path.relpath(os.path.join(d, f), os.path.join(root, 'public')))
missing = sorted(u for u in used if u not in pub)
unused = sorted(p for p in pub if p not in used)
print('used', sorted(used)); print('missing', missing); print('unused', unused)
sys.exit(1 if missing or unused else 0)
