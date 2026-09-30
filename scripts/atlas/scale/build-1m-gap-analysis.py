#!/usr/bin/env python3
"""
What closes the gap between the generated candidate inventory and 1,000,000.

Every number here is arithmetic over entity counts already measured and recorded in
this repository. Nothing is invented, and where a figure is an extrapolation from a
measured average it says so in the row.
"""
import json, csv, collections

OUT = '/home/user/Livdar-eSim/reports/livdar-expiry-freeze-2026-09-30/'
S = json.load(open(OUT + '1M-SUMMARY.json'))
built = S['FINAL_DISTINCT_CANDIDATES']
gap = 1_000_000 - built

# measured entity figures, from SCALE-FINAL.json and ENTITY-UNIVERSE-BY-AXIS.csv
POI_RAW_VERIFIED_OSM = 25_567_541
POI_OBTAINABLE_11_MARKETS = 3_216_399
POI_SOURCE_BACKED = 964_920
NEIGH_HELD = 1_403
NEIGH_CITIES_HELD = 39
CITIES_T1_T2 = 560 + 2_391
VENUES_HELD = 9_438
VENUE_COUNTRIES = 16
LISTING_RECORDS = 47_000_000

# validated POI modifiers, from ENTITY-MODIFIER-RESEARCH.csv verdicts
POI_MODIFIERS_VALIDATED = ['tickets', 'opening hours', 'how to get to', 'parking', 'restaurants near']

rows = []
def add(source, family_or_axis, basis, unlocks, status, note):
    rows.append({'acquisition': source, 'family_or_axis': family_or_axis,
                 'basis_of_the_number': basis, 'candidates_unlocked': unlocks,
                 'source_status_after': status, 'note': note})

# 1 -- POI x validated modifier. The only source large enough to reach 1M.
add('OpenStreetMap + Wikidata POI ingestion', 'poi.entity-<modifier>',
    f'{POI_SOURCE_BACKED:,} source-backed POI x 1 validated modifier',
    POI_SOURCE_BACKED, 'READY_NOW once ingested',
    'ODbL 1.0 share-alike, attribution mandatory. Bare POI entity pages are '
    'BRAND_OWNED_PLUS_SOCIAL and must NOT be generated; only entity-plus-practical-'
    'modifier pages are rankable (tickets, opening hours, how to get to, parking), '
    'each gated per entity because a reseller owns some queries. This single source '
    'closes the whole gap on its own.')
add('OpenStreetMap + Wikidata POI ingestion (full 11-market obtainable set)',
    'poi.entity-<modifier>',
    f'{POI_OBTAINABLE_11_MARKETS:,} obtainable POI x 1 modifier',
    POI_OBTAINABLE_11_MARKETS, 'SOURCE_AVAILABLE',
    'The ceiling rather than the plan. Far beyond 1M and far beyond what demand '
    'supports, so it is bounded by the publication controller, not by the source.')

# 2 -- neighbourhood expansion, extrapolated from the measured average
per_city = NEIGH_HELD / NEIGH_CITIES_HELD
neigh_projected = int(per_city * CITIES_T1_T2)
add('OSM neighbourhood polygons for tier 1 and 2 cities',
    'neighbourhoods.* and places.neighbourhood-category and rents.neighbourhood',
    f'EXTRAPOLATION: {NEIGH_HELD:,} neighbourhoods across {NEIGH_CITIES_HELD} cities '
    f'= {per_city:.1f} per city, applied to {CITIES_T1_T2:,} tier 1+2 cities',
    neigh_projected, 'SOURCE_AVAILABLE',
    'Extrapolated from a measured average, not a counted set. The demand half is '
    'evidenced: places.city-category measured about 60 London neighbourhood queries '
    'and about 40 near-station queries for one category alone. The facts half is '
    'still capped at 200 pages by the controller on four-fields-per-page grounds.')

# 3 -- venue expansion
add('Wikidata venue coverage for the remaining markets', 'stay.near-venue and events.venue',
    f'{VENUES_HELD:,} venues held across {VENUE_COUNTRIES} countries; the 11 target '
    f'markets are only partly covered',
    VENUES_HELD, 'SOURCE_AVAILABLE',
    'Doubling coverage roughly doubles the venue families. Small next to POI.')

# 4 -- listing feeds, which explicitly do NOT count toward a durable inventory
add('Jobs / events / rental / property listing feeds',
    'jobs.* events.* rents.* property.* individual listings',
    f'{LISTING_RECORDS:,} listing records exist in the raw universe',
    0, 'FEED_REQUIRED but NOT durable candidates',
    'DELIBERATELY ZERO. An individual vacancy, event occurrence or property listing '
    'expires in 2 to 8 weeks and the research already requires 410 plus sitemap '
    'removal on expiry. Counting 47M expiring records as candidate pages would be '
    'the padding this brief forbids. Feeds unlock the DURABLE PARENT pages already '
    'in the manifest (role x city, category x city), not a page per listing.')

with open(OUT + '1M-GAP-TO-TARGET.csv', 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=['acquisition', 'family_or_axis', 'basis_of_the_number',
                                       'candidates_unlocked', 'source_status_after', 'note'])
    w.writeheader(); w.writerows(rows)

summary = {
    'built_from_entities_on_disk': built,
    'target': 1_000_000,
    'gap': gap,
    'closes_the_gap_alone': 'OpenStreetMap + Wikidata POI ingestion',
    'poi_source_backed_x_one_modifier': POI_SOURCE_BACKED,
    'surplus_over_gap_from_poi_alone': POI_SOURCE_BACKED - gap,
    'neighbourhood_expansion_projected': neigh_projected,
    'venue_expansion': VENUES_HELD,
    'listing_feeds_contribute_to_durable_inventory': 0,
    'reaches_1m': built + POI_SOURCE_BACKED + neigh_projected >= 1_000_000,
    'total_with_all_three_acquisitions': built + POI_SOURCE_BACKED + neigh_projected + VENUES_HELD,
}
with open(OUT + '1M-GAP-SUMMARY.json', 'w') as fh: json.dump(summary, fh, indent=1)
print(json.dumps(summary, indent=1))
