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
# ---- paths and limits measured on 2026-10-01 -------------------------------------------
add('Page the 1,314,927 unattributable POI off the thing they actually belong to',
    'MEASURED 2026-10-01: of 533,415 such POI across DE, FR, PL and GB, 65 per cent sit '
    '12km or more from the nearest city and 38 per cent beyond 20km. The classes that '
    'dominate are rural by nature: 66,280 mountain peaks, 30,169 memorials, 12,654 '
    'archaeological sites. Only 4.9 per cent fall within 5km of a city',
    'UNMEASURED',
    'DATA PATH, NOT BUILT',
    'These POI are real and they are not reachable from a city page, because they are not '
    'in a city. Widening the population-scaled radius was tested and rejected: it would '
    'attribute a restaurant 4.5km outside a 10,000-person town to that town, which is the '
    'geographic form of city-name swapping, and the 4.9 per cent it could reach is spread '
    'over thousands of towns at single-digit POI each, below every density threshold a '
    'shape requires. The legitimate route is a page keyed on the feature they belong to: a '
    'national park, a mountain range, a long-distance trail, a coastline, an administrative '
    'district. That is a new family with its own source and demand requirements and it has '
    'not been measured, so no number is claimed for it.')

add('REMOVE THE GATE: let a locale inherit demand measured for its family',
    'MEASURED 2026-10-01: the localisation gate, once it was made destination-aware, '
    'reclassified the rows that one measured keyword had been licensing. "hotel prag" at '
    '7,600 was by itself licensing 8,342 German hotel pages for destinations nobody in '
    'Germany was measured searching for',
    'see LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION in the manifest',
    'GATE KEPT',
    'This is listed so the size of the temptation is on the record. Reverting to a '
    '(family, market) test would raise the count immediately and every page it added would '
    'be a destination swap behind a locale boundary. The brief first line is that the '
    'origin market is not the destination.')

add('Build the ten measured Tool families',
    'MEASURED 2026-10-01 in local language: net pay 175 keywords across 9 markets, peak '
    '258,000 a month in France; loan payment 199 keywords across 10 markets; plus eight '
    'smaller families including the Italian CCNL contract levels and the Japanese bonus '
    'take-home',
    80,
    'TWO BUILDABLE, EIGHT SOURCE_REQUIRED',
    'High value, low count, and recorded that way so the value is not confused with volume. '
    'One page per language, not per city, so ten languages give roughly 80 pages across the '
    'set. Two families need no source: loan payment and Brazilian vehicle financing. The '
    'other eight each need one country official table, and they stay unbuilt until those '
    'are ingested with provenance and a version date, because a net-pay page with a guessed '
    'deduction rate is wrong in a way a visitor would act on.')

add('Recover the Wikidata truncation',
    'VERIFIED 2026-10-01: a COUNT over the exact population the materialiser paginates puts '
    'United States parks at 56,755 against the 9,992 the file held. The result cap applied '
    'to the underlying set, so OFFSET 10000 returned nothing and the loop read that as the '
    'end of the data. One pair of 125 carried the signature',
    46763,
    'FIX SHIPPED, REFETCH RATE-LIMITED',
    'The number is the measured difference for that one pair, and it is an upper bound on '
    'rows rather than on pages: most of 56,755 United States parks are municipal pocket '
    'parks with no search intent, and the gates reject an entity without one. Pagination is '
    'replaced by latitude bands where a full band is treated as evidence of truncation and '
    'split. Refetching is throttled by Wikimedia, not by the code: WDQS answers 429 with an '
    'active-outage rule of one request per minute per host, and the Wikidata search API '
    'answers 429 to the first request from this container. The proxy reports no relay '
    'failures, so the limit is upstream. The corpus is a floor and is labelled as one.')

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
