#!/usr/bin/env python3
"""
Build the tier-4 depth probe plan: which (family, market) cells to measure, in what order,
with the query root each one needs and the number of cities each would admit.

WHY THIS IS THE LARGEST REMAINING LEVER, measured rather than argued.

The manifest drops candidates at generation with:

    dropped_beyond_measured_tier                 343,467
    cities_added_by_measured_demand_over_tier     32,267

The gate is in build-1m-candidate-manifest.py around line 1302:

    cap = CELL_TIER[(keyword_name, market)]
    if cap is not None and (tier or 4) > cap: drop

So it is not per city. It is per (family, market) CELL, and the cap is the deepest
population tier that cell's own keyword sample was measured to reach. Lifting one cell
from tier 3 to tier 4 admits every tier-4 city in that market at once.

The city tiers, from data/atlas/entities/cities-index.json:

    tier 1      560
    tier 2    2,391
    tier 3    8,602
    tier 4   52,865      <- the pool

CELL-GATE.csv holds 150 cells. Effective caps: 13 at tier 1, 22 at tier 2, 59 at tier 3,
5 at tier 4, and 51 UNDER_SAMPLED which carry no cap at all and therefore pass.

Of the 59 cells capped at tier 3, FIFTY-FOUR have tier4_rows = 0, which means the tier-4
probe was never run for them rather than run and refuted. That distinction is the whole
finding: 54 cells are sitting on an unmeasured assumption, and each one of them is
holding back up to 52,865 cities in its market.

The one cell that WAS probed, activities.city-things-to-do in de-DE, returned 7 tier-4
rows at a median of 100 a month. So the honest expectation is NOT that every tier-4 city
qualifies. It is that a measurable minority does, and the measurement says which, per
cell, which is exactly the evidence the gate wants.

HOW THE ROOT IS DERIVED. A cell's query form is recovered from its own measured
keywords by removing the city token, so the probe asks the question this market actually
types rather than a translation. This is the same correction that has fired seven times
in this programme, most recently in Finnish, where the pair goes BEFORE the mode.

This script spends NO units. It writes the plan; the probe runs from it.

STATUS, 2026-10-07: THE PROBE CANNOT BE RUN. The paid Ahrefs subscription is expiring and
is not being renewed. usage_reset_date is a monthly quota rollover, not a renewal, and
reading it as one was my error. This file is therefore a SPECIFICATION rather than a
queued task: it records, in ranked order, exactly which cells to measure and the query
root each one needs, for whoever next holds a keyword tool. Nothing already counted in
FINAL depends on it.
"""
import csv, json, glob, collections, os, sys

ROOT = '/home/user/Livdar-eSim/'
CELL_GATE = ROOT + 'reports/livdar-master-seo-universe-2026-09-30/CELL-GATE.csv'

# ---- city tiers, and how many sit in each market's own country --------------------------------
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('id'):
            cities.append({'name': c.get('name') or c.get('ascii'), 'country': c.get('country'),
                           'pop': c.get('population') or 0})
idx = json.load(open(ROOT + 'data/atlas/entities/cities-index.json'))
bt = idx.get('byTier', {})
t1, t2, t3 = int(bt.get('1', 0)), int(bt.get('2', 0)), int(bt.get('3', 0))
cities.sort(key=lambda c: -(c['pop'] or 0))
for i, c in enumerate(cities):
    c['tier'] = 1 if i < t1 else 2 if i < t1 + t2 else 3 if i < t1 + t2 + t3 else 4
by_country_tier = collections.Counter((c['country'], c['tier']) for c in cities)

import importlib.util
spec = importlib.util.spec_from_file_location('ei', ROOT + 'scripts/atlas/scale/entity_identity.py')
ei = importlib.util.module_from_spec(spec); spec.loader.exec_module(ei)
MKT_COUNTRY = ei.MKT_COUNTRY

# ---- the measured keywords per cell, to recover each cell's query root ------------------------
# The keyword master is the record of what was actually read per family and market.
cell_kw = collections.defaultdict(list)
for src in ('reports/livdar-expiry-freeze-2026-09-30/02-MASTER-KEYWORDS.csv',):
    try:
        for r in csv.DictReader(open(ROOT + src, encoding='utf-8')):
            fam = (r.get('family') or '').strip()
            mkt = (r.get('market') or '').strip()
            kw = (r.get('keyword') or '').strip()
            try:
                vol = int(float(r.get('volume') or 0))
            except Exception:
                vol = 0
            if fam and mkt and kw:
                cell_kw[(fam, mkt)].append((kw, vol))
    except FileNotFoundError:
        print(f'WARNING {src} not found; roots will be empty', file=sys.stderr)
for k in cell_kw:
    cell_kw[k].sort(key=lambda x: -x[1])

CITY_NAMES = collections.defaultdict(set)
for c in cities:
    if c['name']:
        CITY_NAMES[c['country']].add(c['name'].lower())


def root_of(fam, mkt):
    """The cell's query form with the city token removed, from its own best keywords.

    Returns the most common residue across the cell's keywords, so one odd keyword cannot
    set the root. An empty string means the root could not be recovered and the cell needs
    a human to name its query form before it is probed.
    """
    cc = MKT_COUNTRY.get(mkt)
    names = CITY_NAMES.get(cc, set())
    residues = collections.Counter()
    for kw, vol in cell_kw.get((fam, mkt), [])[:25]:
        low = kw.lower()
        hit = None
        for n in sorted(names, key=len, reverse=True):
            if len(n) >= 4 and n in low:
                hit = n
                break
        if hit:
            res = low.replace(hit, '').strip()
            res = ' '.join(res.split())
            if res:
                residues[res] += 1
    return residues.most_common(1)[0][0] if residues else ''


def cap_of(r):
    t = (r.get('tiers') or '').strip()
    reach = (r.get('reach') or '').strip()
    if t:
        d = [int(x) for x in t.split('+') if x.strip().isdigit()]
        if d:
            return max(d)
    return 3 if reach == 'TAIL' else 1 if reach in ('HEAD_ONLY', 'NONE') else None


rows = list(csv.DictReader(open(CELL_GATE)))
plan = []
for r in rows:
    cap = cap_of(r)
    if cap is None or cap >= 4:
        continue                       # UNDER_SAMPLED carries no cap, tier 4 is already open
    fam, mkt = r['family'], r['market']
    cc = MKT_COUNTRY.get(mkt)
    if not cc:
        continue
    # the cities this cell would admit if its cap moved to 4, and to 3 for a tier-2 cell
    admits = sum(by_country_tier[(cc, t)] for t in range(cap + 1, 5))
    already = (r.get('tier4_rows') or '').strip()
    plan.append({
        'family': fam, 'market': mkt, 'country': cc,
        'current_cap': cap,
        'reach': (r.get('reach') or '').strip(),
        'keywords_behind_the_cap': int(r.get('n') or 0),
        'median_volume_measured': r.get('median') or '',
        'tier4_already_probed': already not in ('', '0'),
        'tier4_rows_if_probed': already,
        'cities_this_cell_would_admit': admits,
        'query_root_recovered': root_of(fam, mkt),
        'top_measured_keyword': (cell_kw.get((fam, mkt)) or [('', 0)])[0][0],
    })

plan.sort(key=lambda p: (-p['cities_this_cell_would_admit'], p['family']))
out = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/TIER4-DEPTH-PROBE-PLAN.csv'
with open(out, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(plan[0].keys()))
    w.writeheader()
    w.writerows(plan)

noroot = [p for p in plan if not p['query_root_recovered']]
print(f'cells needing a deeper tier probe: {len(plan)}')
print(f'  of which already probed at tier 4: {sum(1 for p in plan if p["tier4_already_probed"])}')
print(f'  of which the query root could NOT be recovered: {len(noroot)}')
print(f'  cities admitted if EVERY cell lifted (upper bound, NOT a forecast): '
      f'{sum(p["cities_this_cell_would_admit"] for p in plan):,}')
print(f'\nestimated units at 500 rows and 21 units per row: '
      f'{len(plan) * 500 * 21:,}')
print(f'\ntop 12 by cities admitted:')
print(f'  {"family":34}{"mkt":10}{"cap":>4}{"admits":>9}  root')
for p in plan[:12]:
    print(f'  {p["family"][:33]:34}{p["market"]:10}{p["current_cap"]:>4}'
          f'{p["cities_this_cell_would_admit"]:>9,}  {p["query_root_recovered"][:30]!r}')
print(f'\nwritten {out}')
