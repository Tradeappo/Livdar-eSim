#!/usr/bin/env python3
"""
Generate exact city keywords for the tier-4 probe, in batches ready to send.

WHY NOT A TAIL PROBE. The first attempt pulled 500 matching-terms rows for one cell. It
cost 5,500 units, returned every row at the band ceiling (so it was a CAP, not a depth),
and would have needed 94 more calls. Worse, the thing it measures is the wrong thing:
lifting CELL_TIER from 3 to 4 admits EVERY tier-4 city in that market, including the
thousands with no demand at all. That is relaxing a gate wearing the clothes of evidence.

WHAT THIS DOES INSTEAD. It builds the exact keyword a reader would type for each named
tier-4 city, per family and market, so the measurement returns a volume PER CITY. Cities
that clear the floor are added to the evidence set the manifest already reads, exactly as
XL_MARKET_CITIES and HARVEST_CITY_IDS are. The gate is handed named cities, not a wider
tier.

Economics: keyword is free and volume costs 10 per row, so a row is about 11 units.
Against a 2,000,000 allowance that is roughly 180,000 city measurements, which is more
than the 52,865 tier-4 cities times three families.

Output: one JSON file of batches, each a list of keywords to pass as the `keywords`
argument, with the city id and family carried alongside so the response can be joined
back without guessing.
"""
import json, glob, collections, sys, importlib.util, random

ROOT = '/home/user/Livdar-eSim/'
BATCH = int(sys.argv[1]) if len(sys.argv) > 1 else 200

spec = importlib.util.spec_from_file_location('ei', ROOT + 'scripts/atlas/scale/entity_identity.py')
ei = importlib.util.module_from_spec(spec); spec.loader.exec_module(ei)
MKT_COUNTRY = ei.MKT_COUNTRY

# city tiers, same derivation the manifest uses
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('id'):
            cities.append({'id': str(c['id']), 'name': c.get('name') or c.get('ascii'),
                           'country': c.get('country'), 'pop': c.get('population') or 0})
idx = json.load(open(ROOT + 'data/atlas/entities/cities-index.json'))
bt = idx.get('byTier', {})
t1, t2, t3 = int(bt.get('1', 0)), int(bt.get('2', 0)), int(bt.get('3', 0))
cities.sort(key=lambda c: -(c['pop'] or 0))
for i, c in enumerate(cities):
    c['tier'] = 1 if i < t1 else 2 if i < t1 + t2 else 3 if i < t1 + t2 + t3 else 4

# The query form per family and market, taken from the roots recovered in
# TIER4-DEPTH-PROBE-PLAN.csv. {c} is the city name. Only the cells whose root was
# recovered AND whose phrasing is a simple prefix or suffix are here; a cell whose form
# needs a case ending or a postposition is left out rather than guessed, because a
# mis-phrased probe measures nothing (seven phrasing corrections in this programme so far,
# the most recent being Finnish putting the pair before the mode).
FORMS = {
    ('activities.city-things-to-do', 'en-US'): 'things to do in {c}',
    ('activities.city-things-to-do', 'en-GB'): 'things to do in {c}',
    ('activities.city-things-to-do', 'pt-BR'): 'o que fazer em {c}',
    ('activities.city-things-to-do', 'es-ES'): 'que ver en {c}',
    ('activities.city-things-to-do', 'it-IT'): 'cosa vedere a {c}',
    ('activities.city-things-to-do', 'fr-FR'): 'que faire à {c}',
    ('activities.city-things-to-do', 'de-DE'): '{c} sehenswürdigkeiten',
    ('places.city-category', 'en-US'): 'restaurants in {c}',
    ('places.city-category', 'pt-BR'): 'restaurantes em {c}',
    ('places.city-category', 'es-ES'): 'restaurantes en {c}',
    ('stay.city-type', 'en-US'): 'hotels in {c}',
    ('stay.city-type', 'en-GB'): 'hotels in {c}',
    ('events.city-type', 'en-US'): 'events in {c}',
    ('weather.city-month', 'en-US'): '{c} weather',
    ('work.city-jobs', 'en-US'): 'jobs in {c}',
    ('rents.city', 'en-US'): 'apartments for rent in {c}',
}

TARGET_TIERS = (3, 4)
SAMPLE_PER_CELL = int(sys.argv[2]) if len(sys.argv) > 2 else 200

batches, manifest = [], []
cur, curmeta = [], []
for (fam, mkt), form in sorted(FORMS.items()):
    cc = MKT_COUNTRY.get(mkt)
    pool = [c for c in cities if c['country'] == cc and c['tier'] in TARGET_TIERS and c['name']]
    # A RANDOM stratified sample, not the largest cities in the tier.
    #
    # Sorting by population descending and taking the first batch would measure the
    # biggest tier-4 towns and report their qualification rate as the tier's. That
    # inflates the rate and is the same supply-for-demand substitution this programme has
    # corrected four times. Seeded so a re-run asks the same questions.
    #
    # SAMPLE_PER_CELL is what the Ahrefs MCP transport allows: it is proxied with no raw
    # token, so every batch is one tool call made by hand rather than a loop in a script,
    # and 353 batches is not executable. 200 cities per cell is, and it is still an order
    # of magnitude more evidence than the 6 to 19 keywords the current caps rest on.
    random.Random(20261008).shuffle(pool)
    pool = pool[:SAMPLE_PER_CELL]
    for c in pool:
        kw = form.format(c=c['name'].lower())
        cur.append(kw)
        curmeta.append({'city_id': c['id'], 'city': c['name'], 'tier': c['tier'],
                        'country': c['country'], 'family': fam, 'market': mkt})
        if len(cur) >= BATCH:
            batches.append({'index': len(batches), 'family': fam, 'market': mkt,
                            'country': cc, 'keywords': cur, 'meta': curmeta})
            cur, curmeta = [], []
    if cur:
        batches.append({'index': len(batches), 'family': fam, 'market': mkt,
                        'country': cc, 'keywords': cur, 'meta': curmeta})
        cur, curmeta = [], []

out = ROOT + 'data/atlas/measurements/ahrefs-expiry/tier4-city-keyword-batches.json'
json.dump({'generated': '2026-10-08', 'batch_size': BATCH,
           'target_tiers': list(TARGET_TIERS),
           'cells': len(FORMS), 'batches': len(batches),
           'sample_per_cell': SAMPLE_PER_CELL,
           'sampling': ('random stratified across tiers 3 and 4, seed 20261008, NOT the '
                        'largest cities in the tier, so the qualification rate is not '
                        'inflated by population'),
           'what_this_measures': ('the share of tier 3 and tier 4 cities in this cell whose '
                                  'OWN keyword clears the floor. CELL_TIER is a family-level '
                                  'reach measure by design and the existing caps rest on 6 to '
                                  '19 keywords each; this replaces that with a 200-city '
                                  'random sample.'),
           'keywords_total': sum(len(b['keywords']) for b in batches),
           'estimated_units_at_11_per_row': sum(len(b['keywords']) for b in batches) * 11,
           'batches_detail': batches}, open(out, 'w'), ensure_ascii=False)

per = collections.Counter((b['family'], b['market']) for b in batches)
tot = sum(len(b['keywords']) for b in batches)
print(f'cells {len(FORMS)}  batches {len(batches)}  keywords {tot:,}')
print(f'estimated units at 11 per row: {tot * 11:,}  (allowance 2,000,000)')
print()
for (fam, mkt), n in sorted(per.items(), key=lambda x: -x[1])[:16]:
    kws = sum(len(b['keywords']) for b in batches if b['family'] == fam and b['market'] == mkt)
    print(f'  {fam[:34]:35} {mkt:8} {n:>4} batches  {kws:>7,} cities')
print(f'\nwritten {out}')
