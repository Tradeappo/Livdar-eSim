#!/usr/bin/env python3
"""
What stands between the generated inventory and 1,000,000, computed from what was
actually measured rather than asserted.

An earlier version of this file led with a single row: source-backed POI times one
validated modifier, 964,920 candidates, "this single source closes the whole gap on its
own". That plan has been withdrawn. One page per POI is scaled-content spam, the SERP for
a named venue belongs to the venue, and the 161,474 rows it produced were deleted. A gap
analysis that still promised it would have been the most misleading file in the folder.

What replaces it is arithmetic over yields this pass actually produced: candidates per
ingested market, per Wikidata class, per place polygon. Where a figure is an extrapolation
from a measured average the row says so, and where the honest answer is that nothing
closes the gap without removing a gate, the row names the gate.
"""
import json, csv, glob, gzip, collections, os, io

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
TARGET = 1_000_000

S = json.load(open(OUT + '1M-SUMMARY.json'))
built = S['FINAL_DISTINCT_CANDIDATES']
gap = TARGET - built
poi_gate = json.load(open(OUT + '1M-POI-AGGREGATION-GATE.json'))
try:
    wd_gate = json.load(open(OUT + '1M-WIKIDATA-GATE.json'))
except FileNotFoundError:
    wd_gate = {}

MARKET_COUNTRIES = ['US', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'BR', 'GB', 'JP', 'TW']
poi_files = {os.path.basename(p) for p in glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')}
ingested = set()
for f in poi_files:
    iso = f.replace('poi-', '').split('.')[0].split('-')[0]
    if iso in MARKET_COUNTRIES:
        ingested.add(iso)
missing = [c for c in MARKET_COUNTRIES if c not in ingested]

agg_by_market = poi_gate.get('by_market', {})
agg_total = poi_gate.get('aggregation_candidates', 0)
per_market = agg_total / max(1, len(agg_by_market))

wd_classes_done = len({os.path.basename(p).split('-')[1]
                       for p in glob.glob(ROOT + 'data/atlas/sources/wikidata/wd-*.jsonl.gz')})
WD_CLASSES_TOTAL = 24
wd_candidates = wd_gate.get('candidates', 0)

rows = []


def add(path, basis, unlocks, status, note):
    rows.append({'closure_path': path, 'basis_of_the_number': basis,
                 'candidates_unlocked': unlocks, 'status': status, 'note': note})


add('Finish OSM ingestion for every market',
    f'MEASURED: {agg_total:,} aggregation candidates from {len(agg_by_market)} markets '
    f'with candidates, so {per_market:,.0f} per market. Markets still missing: '
    f'{", ".join(missing) if missing else "none"}',
    int(per_market * len(missing)),
    'IN PROGRESS' if missing else 'DONE',
    'An extrapolation from a measured per-market average, not a counted set. Markets '
    'differ: Britain yields more cuisine pages because 13.2 per cent of its POI carry a '
    'cuisine tag against 7.4 per cent in Spain, and Taiwan arrives through Overpass '
    'rather than a country extract so its coverage is partial by construction.')

add('Complete the Wikidata materialisation',
    f'MEASURED: {wd_candidates:,} candidates from {wd_classes_done} of '
    f'{WD_CLASSES_TOTAL} classes',
    int(wd_candidates * (WD_CLASSES_TOTAL / max(1, wd_classes_done)) - wd_candidates)
    if wd_classes_done else 0,
    'IN PROGRESS',
    'CC0, so no share-alike obligation, unlike OSM ODbL. Scaled from the classes already '
    'materialised, which is optimistic: museums and libraries are Wikidata strengths and '
    'the remaining classes are thinner. Individual pages are emitted only for '
    'visitor-intent classes, because the SERP for a named hospital, university or station '
    'belongs to that institution. '
    'TWO LIMITS ON THIS FIGURE, both recorded rather than smoothed over. WDQS went into an '
    'active outage during this pass and began answering 429 with "Aggressively '
    'rate-limiting to 1 req / min - this rule was created during active wdqs outage", so '
    'the corpus is a floor and the pass is unfinished. And every file produced sits at or '
    'below 10,000 rows with one, wd-park-US, at 9,992, which is the shape a result cap '
    'would take: if WDQS caps the underlying set at 10,000 then OFFSET 10000 returns '
    'nothing although more entities exist. That could not be verified while the endpoint '
    'was down. When it recovers, compare a COUNT for park/US against the file row count, '
    'and if they differ, page by a sort key instead of by OFFSET.')

poly = poi_gate.get('place_geometries_containment', 0)
prox = poi_gate.get('place_geometries_proximity', 0)
add('Polygon place layers for the markets that only have place nodes',
    f'MEASURED: {poly:,} areas have a polygon against {prox:,} with only a point, so '
    f'{100 * poly / max(1, poly + prox):.0f} per cent containment coverage',
    0,
    'IN PROGRESS',
    'This adds QUALITY, not count: it converts proximity attribution into containment, '
    'which is a stronger claim and scores ten points higher. It may ADMIT a few areas '
    'that a radius missed and REJECT others a radius wrongly claimed, so the net count '
    'effect is recorded as zero rather than guessed.')

add('Attribute capture for the markets extracted before it existed',
    'MEASURED: city_attribute produced 3 candidates, because only markets ingested after '
    'the attribute tags were captured carry them. Spain, Italy, Netherlands, Japan, '
    'Britain and France were extracted before',
    0,
    'REQUIRES RE-EXTRACTION',
    'Re-downloading six country extracts to add wifi, outdoor seating, diet and '
    'wheelchair tags. The demand is measured and narrow: every city in the measured '
    '"vegan restaurants" set is a major city, so the yield is bounded by the 200,000 '
    'population floor and will be in the low thousands, not the tens of thousands.')

add('Jobs, events, rental and property listing feeds',
    '47,000,000 listing records exist in the raw universe',
    0,
    'FEED_REQUIRED but NOT durable candidates',
    'DELIBERATELY ZERO, unchanged. An individual vacancy, event occurrence or property '
    'listing expires in two to eight weeks and the research already requires a 410 plus '
    'sitemap removal on expiry. Counting them would be the padding this brief forbids. '
    'Feeds unlock the DURABLE PARENT pages already in the manifest, not a page per '
    'listing.')

# the honest part: what each gate costs, so removing one is a deliberate decision
GATES = [
    ('place_not_a_named_entity',
     'an area must carry a polygon, population, Wikidata item or Wikipedia article',
     'the Kreuzberg probe validated neighbourhood demand for a FAMOUS area and says '
     'nothing about an unnamed suburb'),
    ('exclusive area assignment',
     'a POI belongs to exactly one area, the most specific polygon or the nearest place node',
     'letting every covering extent claim it produced four times as many area pages, '
     'which would have been near-duplicate lists of the same venues'),
    ('city population floors',
     'attribute and opening pages need 200,000 population, cuisine needs 75,000',
     'every measured keyword for the attribute shapes named a large city; cuisine '
     'demand reaches Watford and St Albans, so its floor is lower'),
    ('area_parent_city_page_not_accepted',
     'an area page requires its parent city page to have been accepted',
     'otherwise it is an orphan by construction, which the QA pass found 3,870 of'),
    ('cuisine corpus floor',
     'a cuisine must be common enough across the whole corpus to be a category',
     '"pancake" passed the per-city floor on three venues in one Paris quarter'),
    ('WD_LIST_ONLY classes',
     'no individual page for a hospital, university, library, station, mall or cemetery',
     'the SERP for a named institution returns its own site and social profiles'),
]
rej = poi_gate.get('rejections', {})
for name, what, why in GATES:
    add(f'REMOVE THE GATE: {name}', what, rej.get(name, 'not counted separately'),
        'NOT RECOMMENDED',
        f'Why it exists: {why}. Listed so that removing it is a deliberate decision with '
        'the evidence in view, and reversible if a later measurement disagrees.')

buf = io.StringIO()
cols = ['closure_path', 'basis_of_the_number', 'candidates_unlocked', 'status', 'note']
w = csv.DictWriter(buf, fieldnames=cols, extrasaction='ignore')
w.writeheader()
for r in rows:
    w.writerow(r)
# built in memory and written once: a DictWriter that raises part way through leaves a
# truncated file, which is how the acquisition pack once lost nine of its ten rows
open(OUT + '1M-GAP-TO-TARGET.csv', 'w', newline='').write(buf.getvalue())

closable = sum(r['candidates_unlocked'] for r in rows
               if isinstance(r['candidates_unlocked'], int)
               and not r['closure_path'].startswith('REMOVE THE GATE'))
summary = {
    'built': built, 'target': TARGET, 'gap': gap,
    'closable_without_removing_a_gate': closable,
    'projected_total_if_every_in_progress_path_completes': built + closable,
    'still_short_after_that': max(0, TARGET - (built + closable)),
    'markets_ingested': sorted(ingested), 'markets_missing': missing,
    'wikidata_classes_done': wd_classes_done, 'wikidata_classes_total': WD_CLASSES_TOTAL,
    'verdict': ('The measured closure paths do not reach one million. Finishing every '
                'ingest and every Wikidata class is worth doing on its own terms and is '
                'in progress, but the arithmetic says the remainder would have to come '
                'from removing a quality gate, and each gate is listed with the '
                'measurement that put it there.'),
}
json.dump(summary, open(OUT + '1M-GAP-SUMMARY.json', 'w'), indent=1)
print(json.dumps(summary, indent=1))
