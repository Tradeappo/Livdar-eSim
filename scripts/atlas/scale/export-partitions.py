#!/usr/bin/env python3
"""
Export the manifest as partitioned, compressed JSONL, plus a manifest per locale and per
family.

One 165,000-row CSV is awkward for the thing that comes next: a publication run works a
cohort at a time, and a cohort is a slice of one family in one locale. So the same rows
are written out partitioned by market and by family, with a small index per partition, so
a consumer can read exactly the slice it needs without parsing the whole set.

Deterministic by construction: candidate_id is a hash of family, entity and market, the
rows are sorted inside each partition, and re-running produces byte-identical files from
the same manifest. Atomic by construction: each partition is written to .tmp and renamed.
"""
import csv, gzip, json, os, collections, sys, hashlib

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
OUT = ROOT + 'data/atlas/candidates/'


def safe(s):
    return ''.join(ch if ch.isalnum() or ch in '-._' else '_' for ch in (s or 'unknown'))


rows = []
with gzip.open(SRC, 'rt', encoding='utf-8', newline='') as f:
    rows = list(csv.DictReader(f))
print(f'manifest rows: {len(rows):,}', file=sys.stderr)

# The brief asks for surface and language alongside market and family. They are not
# decoration: a publication run works one surface at a time, and the language axis is the
# one the localisation gate reasons about, so being unable to read a language slice directly
# meant re-deriving it from the market axis every time.
by_market = collections.defaultdict(list)
by_family = collections.defaultdict(list)
by_surface = collections.defaultdict(list)
by_language = collections.defaultdict(list)
for r in rows:
    by_market[r['market']].append(r)
    by_family[r['family']].append(r)
    by_surface[r.get('surface') or 'unknown'].append(r)
    by_language[r.get('language') or 'unknown'].append(r)


def write_partition(path, part_rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    part_rows = sorted(part_rows, key=lambda r: r['candidate_id'])
    h = hashlib.sha1()
    # mtime=0 so the gzip header carries no timestamp and the same manifest produces
    # byte-identical files. gzip.open does not take mtime, so GzipFile is used directly.
    with open(path + '.tmp', 'wb') as raw:
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw, compresslevel=6,
                           mtime=0) as gz:
            for r in part_rows:
                line = json.dumps(r, ensure_ascii=False, sort_keys=True)
                h.update(line.encode('utf-8'))
                gz.write((line + '\n').encode('utf-8'))
    os.replace(path + '.tmp', path)
    return len(part_rows), h.hexdigest()[:16]


index = {'source': os.path.basename(SRC), 'rows': len(rows),
         'partitions': {'market': {}, 'family': {}, 'surface': {}, 'language': {}}}

# Every partition file this run is responsible for. Anything else under OUT is output from
# an earlier run whose rows the current manifest no longer contains, and leaving it in place
# is how the partition tree came to hold three rows the manifest did not: two forts and an
# aquarium from a generation before the localisation gate existed, still carrying no
# localisation class. The per-file writes were always deterministic; the TREE was not,
# because nothing ever removed a partition that stopped being produced. A reader counting
# rows across the tree got a different total from the manifest, which is the kind of quiet
# disagreement between two artifacts that makes both untrustworthy.
written = set()

for axis, grouped in (('market', by_market), ('family', by_family),
                      ('surface', by_surface), ('language', by_language)):
    for key, rs in sorted(grouped.items()):
        p = f'{OUT}{axis}={safe(key)}/candidates.jsonl.gz'
        n, digest = write_partition(p, rs)
        written.add(os.path.realpath(p))
        index['partitions'][axis][key] = {'path': p.replace(ROOT, ''), 'rows': n,
                                         'content_sha1': digest}

# Prune what this run did not write, so the tree is exactly the current manifest.
pruned = []
for dirpath, dirnames, filenames in os.walk(OUT):
    for fn in filenames:
        full = os.path.realpath(os.path.join(dirpath, fn))
        if fn == '_index.json' or full in written: continue
        if fn.endswith('.tmp') or fn.endswith('.jsonl.gz'):
            os.remove(full)
            pruned.append(full.replace(ROOT, ''))
for dirpath, dirnames, filenames in os.walk(OUT, topdown=False):
    if dirpath != OUT.rstrip('/') and not os.listdir(dirpath):
        os.rmdir(dirpath)
index['pruned_from_earlier_runs'] = pruned
if pruned:
    print(f'pruned {len(pruned)} partition file(s) left by an earlier run:', file=sys.stderr)
    for q in pruned[:10]: print(f'  {q}', file=sys.stderr)

os.makedirs(OUT, exist_ok=True)
with open(OUT + '_index.json.tmp', 'w', encoding='utf-8') as f:
    json.dump(index, f, indent=1, ensure_ascii=False)
os.replace(OUT + '_index.json.tmp', OUT + '_index.json')

print(f"wrote {len(index['partitions']['market'])} market, "
      f"{len(index['partitions']['family'])} family, "
      f"{len(index['partitions']['surface'])} surface and "
      f"{len(index['partitions']['language'])} language partitions under "
      f"{OUT.replace(ROOT, '')}", file=sys.stderr)
print(json.dumps({m: v['rows'] for m, v in index['partitions']['market'].items()}, indent=1))
