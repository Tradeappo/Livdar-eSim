#!/usr/bin/env python3
"""
Rebuild the city gazetteer from GeoNames cities5000, with alternate names.

Why. The gazetteer was cities15000: 31,715 places with a population floor of about 15,000.
Two measurements say that floor is the wrong one.

The demand harvest found 116 towns with real search volume that the floor excludes. Szklarska
Poreba has 6,970 people and 9,300 searches a month for its sights; Rothenburg ob der Tauber has
11,106 and 3,500; Taormina has 5,790 and 3,900; Tiradentes has 7,744 and 3,800. Population is
not demand, and a floor on population is a floor on the wrong quantity.

The POI aggregation found 567,208 POI whose OSM addr:city string is not a gazetteer name at all.
A large part of that is these same towns: the POI are mapped, the town is real, and the only
thing missing was a row in the gazetteer to attach them to.

What this does NOT do is promote anything. Tier is assigned by RANK and the tier boundaries stay
at the same absolute ranks, so every city that exists today keeps the tier it has and every new
city lands in tier 4, which no city family draws from. Nothing is generated for a new city until
something measured says it should be. The gain is in the aggregation layer, which reads the
gazetteer directly and gates on counts rather than tiers, and in the demand override that reads
the harvest.

Alternate names are kept because they are the honest exonym table. "Praga", "Prag" and "Prague"
are all in the Prague row, so resolving an Italian or German query to a city stops being a hand
written mapping that I can get wrong: monaco di baviera is in Munich's alternate names and is
not in Monaco's.

Usage: geonames-cities-materialise.py /tmp/cities5000.txt
"""
import collections, json, os, sys, unicodedata

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/entities/cities/'
IDX = ROOT + 'data/atlas/entities/cities-index.json'
SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/cities5000.txt'
SHARDS = 64

# Only the populated-place feature codes. PPLX is a section of a city and PPLH is a place that no
# longer exists; neither is a city, and the quarter test downstream is not the place to discover
# that a row was never a city to begin with.
FC_OK = {'PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLA5', 'PPLC', 'PPLG', 'PPLS', 'PPLL'}
LONG_DASHES = ('—', '–', '‒', '―', '−')
# alternate names worth keeping: the Latin and CJK forms a Livdar market would type. The dump
# carries up to a hundred per row including Devanagari and Cyrillic, which no market here uses.
KEEP_SCRIPTS = ('LATIN', 'CJK', 'HIRAGANA', 'KATAKANA', 'IDEOGRAPH')
MAX_ALT = 14


def script_ok(s):
    for ch in s:
        if ord(ch) < 128:
            continue
        try:
            nm = unicodedata.name(ch)
        except ValueError:
            return False
        if not any(nm.startswith(k) or k in nm for k in KEEP_SCRIPTS):
            return False
    return True


def undash(s):
    for d in LONG_DASHES:
        s = s.replace(d, '-')
    return s


# what is on disk now, so the rebuild can report exactly what it changed rather than claiming it
existing = {}
for fn in sorted(os.listdir(OUT)):
    if not fn.endswith('.json'):
        continue
    d = json.load(open(OUT + fn, encoding='utf-8'))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        existing[str(c['id'])] = c
print(f'cities on disk before: {len(existing):,}', file=sys.stderr)

rows = []
stats = collections.Counter()
for line in open(SRC, encoding='utf-8'):
    f = line.rstrip('\n').split('\t')
    if len(f) < 19:
        stats['short_line'] += 1
        continue
    if f[7] not in FC_OK:
        stats['feature_code_not_a_city:' + f[7]] += 1
        continue
    name = undash(f[1].strip())
    if not name:
        stats['no_name'] += 1
        continue
    alts = []
    for a in (f[3] or '').split(','):
        a = undash(a.strip())
        if not a or a.casefold() == name.casefold() or len(a) > 60:
            continue
        if not script_ok(a):
            continue
        if a not in alts:
            alts.append(a)
        if len(alts) >= MAX_ALT:
            break
    try:
        pop = int(f[14] or 0)
    except ValueError:
        pop = 0
    rows.append({
        'id': int(f[0]), 'name': name, 'ascii': undash(f[2].strip()),
        'dashNormalised': (name != f[1].strip()),
        'lat': float(f[4]), 'lon': float(f[5]), 'fc': f[7], 'country': f[8],
        'admin1': f[10], 'admin2': f[11], 'population': pop,
        'elevation': (int(f[15]) if f[15] else None), 'tz': f[17], 'modified': f[18],
        'alt': alts,
    })
    stats['kept'] += 1

print(f'rows kept from the dump: {len(rows):,}', file=sys.stderr)
for k, v in stats.most_common(8):
    print(f'    {k:40} {v:>8,}', file=sys.stderr)

ids = {str(r['id']) for r in rows}
lost = sorted(set(existing) - ids)
if lost:
    # A city that was in cities15000 and is not in cities5000 would be a regression, not an
    # expansion. It should not happen, since 5000 is a superset of 15000, and if it does the run
    # keeps the old row rather than losing a place that already has pages built on it.
    print(f'cities present before and absent from the dump: {len(lost):,}; keeping them',
          file=sys.stderr)
    for cid in lost:
        c = dict(existing[cid])
        c.setdefault('alt', [])
        rows.append(c)

# Tier boundaries stay at the SAME ABSOLUTE RANKS, so no city that exists today changes tier.
prev = json.load(open(IDX, encoding='utf-8'))
bt = prev.get('byTier', {})
t1, t2, t3 = int(bt.get('1', 0)), int(bt.get('2', 0)), int(bt.get('3', 0))
ranked = sorted(rows, key=lambda x: -(x['population'] or 0))
for i, c in enumerate(ranked):
    c['tier'] = 1 if i < t1 else 2 if i < t1 + t2 else 3 if i < t1 + t2 + t3 else 4
moved = sum(1 for c in ranked
            if str(c['id']) in existing and existing[str(c['id'])].get('tier')
            and existing[str(c['id'])]['tier'] != c['tier'])
print(f'cities whose tier changed: {moved}', file=sys.stderr)

shards = collections.defaultdict(list)
for c in rows:
    shards[c['id'] % SHARDS].append(c)
for s in range(SHARDS):
    path = OUT + f'{s:02d}.json'
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(sorted(shards[s], key=lambda x: x['id']), f, ensure_ascii=False)
    os.replace(path + '.tmp', path)

tiers = collections.Counter(c['tier'] for c in rows)
idx = dict(prev)
idx['cities'] = len(rows)
idx['byTier'] = {str(k): tiers[k] for k in sorted(tiers)}
idx['byCountry'] = dict(collections.Counter(c['country'] for c in rows))
idx['shards'] = SHARDS
idx['source'] = 'GeoNames cities5000 (CC BY 4.0), materialised 2026-10-01'
idx['previous_source'] = 'GeoNames cities15000'
with open(IDX + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(idx, f, ensure_ascii=False, indent=1)
os.replace(IDX + '.tmp', IDX)

print(f'\ncities written: {len(rows):,} (was {len(existing):,}, added {len(rows)-len(existing):,})',
      file=sys.stderr)
print(f'by tier: {dict(idx["byTier"])}', file=sys.stderr)
print(f'with at least one alternate name: {sum(1 for c in rows if c.get("alt")):,}',
      file=sys.stderr)
prov = {
    'source': 'GeoNames cities5000',
    'url': 'https://download.geonames.org/export/dump/cities5000.zip',
    'licence': 'CC BY 4.0',
    'attribution': 'GeoNames (https://www.geonames.org)',
    'capturedOn': '2026-10-01',
    'rows': len(rows),
    'replaces': 'cities15000, 31,715 rows',
    'note': ('The floor moved from 15,000 to 5,000 because the demand harvest found 116 towns '
             'below it with measured search volume, and because 567,208 POI were attributed to '
             'city strings that were not gazetteer names. Tier boundaries are unchanged at the '
             'same absolute ranks, so no city already in the inventory changes tier and every '
             'new city lands in tier 4, which no city family draws from by default.'),
}
with open(ROOT + 'data/atlas/entities/cities.provenance.json', 'w', encoding='utf-8') as f:
    json.dump(prov, f, ensure_ascii=False, indent=1)
