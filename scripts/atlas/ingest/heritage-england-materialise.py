#!/usr/bin/env python3
"""
The National Heritage List for England, from Historic England's own ArcGIS service.

Why this source. The inventory needed a new entity axis and this is one: 379,685 listed entries,
each with an official list number, a name, a protection GRADE, the date it was listed, a link to
the official entry and a coordinate. It is published by the body that maintains the register, under
the Open Government Licence, and it refreshes as the register changes.

What it is NOT for. A page per Grade II terraced house would be thin and would read as a doorway,
and there are 348,219 of those. The brief is explicit that aggregation beats individual thin pages,
so this source is materialised whole and used two ways:

    the aggregation    listed buildings in a place, with the count, the grade split, the oldest
                       listing and the named entries. Distinct data per place, from a register.
    the entity page    Grade I and Grade II*, which are 9,341 and 22,125 entries, nationally
                       important, usually named for what they are rather than by address, and the
                       ones a person actually searches for.

Paged by OBJECTID so a run can resume: the service caps a response at 2,000 records and the id
window is the only cursor that cannot silently skip or repeat rows the way an OFFSET can. That is
the same failure that truncated the Wikidata pull in this project, and it is not repeated here.

Usage: heritage-england-materialise.py [--limit N]
"""
import json, os, sys, time, urllib.parse, urllib.request

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/heritage/'
DST = OUT + 'england-nhle.jsonl'
BASE = ('https://services-eu1.arcgis.com/ZOdPfBS3aqqDYPUQ/arcgis/rest/services/'
        'National_Heritage_List_for_England_NHLE_v02_VIEW/FeatureServer/0/query')
PAGE = 2000
LIMIT = None
if '--limit' in sys.argv:
    LIMIT = int(sys.argv[sys.argv.index('--limit') + 1])
os.makedirs(OUT, exist_ok=True)


def get(params, attempts=5):
    url = BASE + '?' + urllib.parse.urlencode(params)
    for a in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(url, timeout=90) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            if a == attempts:
                print(f'  giving up after {attempts}: {type(e).__name__}: {e}', file=sys.stderr)
                return None
            time.sleep(min(60, 2 ** a))
    return None


# resume from the highest OBJECTID already written, so an interrupted run costs only what is left
seen, max_oid = set(), 0
if os.path.exists(DST):
    with open(DST, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except Exception:
                continue
            seen.add(o['id'])
            max_oid = max(max_oid, int(o.get('_oid') or 0))
print(f'already on disk: {len(seen):,} entries, highest OBJECTID {max_oid:,}', file=sys.stderr)

total = (get({'where': '1=1', 'returnCountOnly': 'true', 'f': 'json'}) or {}).get('count', 0)
print(f'service reports {total:,} entries', file=sys.stderr)

t0, written, pages = time.time(), 0, 0
fh = open(DST, 'a', encoding='utf-8')
while True:
    d = get({'where': f'OBJECTID>{max_oid}', 'outFields': 'OBJECTID,ListEntry,Name,Grade,ListDate',
             'returnGeometry': 'true', 'outSR': '4326', 'orderByFields': 'OBJECTID ASC',
             'resultRecordCount': PAGE, 'f': 'json'})
    if d is None:
        print('a page failed after every retry; stopping so the file stays consistent',
              file=sys.stderr)
        break
    feats = d.get('features') or []
    if not feats:
        break
    pages += 1
    for ft in feats:
        a = ft.get('attributes') or {}
        oid = int(a.get('OBJECTID') or 0)
        max_oid = max(max_oid, oid)
        le = a.get('ListEntry')
        if not le or le in seen:
            continue
        g = ft.get('geometry') or {}
        pts = g.get('points') or ([[g.get('x'), g.get('y')]] if g.get('x') else [])
        if not pts or pts[0][0] is None:
            continue
        lon, lat = float(pts[0][0]), float(pts[0][1])
        ld = a.get('ListDate')
        year = None
        if isinstance(ld, (int, float)):
            try:
                year = time.gmtime(ld / 1000.0).tm_year
            except (ValueError, OverflowError, OSError):
                year = None
        rec = {
            'id': int(le), '_oid': oid, 'source': 'historic_england_nhle', 'country': 'GB',
            'name': (a.get('Name') or '').strip(),
            'grade': (a.get('Grade') or '').strip(),
            'listed_year': year,
            'lat': round(lat, 6), 'lon': round(lon, 6),
            'official_url': f'https://historicengland.org.uk/listing/the-list/list-entry/{le}',
        }
        fh.write(json.dumps(rec, ensure_ascii=False) + '\n')
        seen.add(rec['id'])
        written += 1
    fh.flush()
    el = time.time() - t0
    print(f'  page {pages}: {len(seen):,} of {total:,} ({len(seen)/max(1,total):.0%}) '
          f'in {el/60:.1f} min', file=sys.stderr, flush=True)
    if LIMIT and written >= LIMIT:
        break
fh.close()

prov = {
    'source': 'National Heritage List for England (NHLE)',
    'publisher': 'Historic England',
    'endpoint': BASE,
    'licence': 'Open Government Licence v3.0',
    'attribution': ('Contains Historic England data licensed under the Open Government Licence '
                    'v3.0. Contains Ordnance Survey data (c) Crown copyright and database right.'),
    'capturedOn': time.strftime('%Y-%m-%d'),
    'rows': len(seen),
    'service_total': total,
    'fields': ['id (official list entry number)', 'name', 'grade', 'listed_year', 'lat', 'lon',
               'official_url'],
    'grades': {'I': 9341, 'II*': 22125, 'II': 348219},
    'intended_use': ('Aggregation per place with the count, the grade split, the oldest listing '
                     'and the named entries. Individual pages ONLY for Grade I and Grade II*, '
                     'which are 31,466 of the 379,685: a page for each of the 348,219 Grade II '
                     'entries would be thin and would read as a doorway, which this project '
                     'refuses.'),
}
with open(OUT + 'england-nhle.provenance.json', 'w', encoding='utf-8') as f:
    json.dump(prov, f, indent=1, ensure_ascii=False)
print(f'\nwritten {len(seen):,} entries to {DST}', file=sys.stderr)
