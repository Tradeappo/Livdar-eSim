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

by_market = collections.defaultdict(list)
by_family = collections.defaultdict(list)
for r in rows:
    by_market[r['market']].append(r)
    by_family[r['family']].append(r)


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
         'partitions': {'market': {}, 'family': {}}}

for m, rs in sorted(by_market.items()):
    p = f'{OUT}market={safe(m)}/candidates.jsonl.gz'
    n, digest = write_partition(p, rs)
    index['partitions']['market'][m] = {'path': p.replace(ROOT, ''), 'rows': n,
                                        'content_sha1': digest}

for fam, rs in sorted(by_family.items()):
    p = f'{OUT}family={safe(fam)}/candidates.jsonl.gz'
    n, digest = write_partition(p, rs)
    index['partitions']['family'][fam] = {'path': p.replace(ROOT, ''), 'rows': n,
                                          'content_sha1': digest}

os.makedirs(OUT, exist_ok=True)
with open(OUT + '_index.json.tmp', 'w', encoding='utf-8') as f:
    json.dump(index, f, indent=1, ensure_ascii=False)
os.replace(OUT + '_index.json.tmp', OUT + '_index.json')

print(f"wrote {len(index['partitions']['market'])} market partitions and "
      f"{len(index['partitions']['family'])} family partitions under "
      f"{OUT.replace(ROOT, '')}", file=sys.stderr)
print(json.dumps({m: v['rows'] for m, v in index['partitions']['market'].items()}, indent=1))
