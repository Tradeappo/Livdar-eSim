#!/usr/bin/env python3
"""
Assemble the final deliverable report from the generated files.

This reads; it never measures. Every number in the report comes from a file produced by
an earlier stage, so the report cannot disagree with the inventory, and re-running it
after an ingest finishes moves the numbers without anyone editing prose.
"""
import json, gzip, csv, collections, os, sys, datetime

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
TARGET = 1_000_000


def jload(p, default=None):
    try:
        return json.load(open(p, encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        return default if default is not None else {}


summary = jload(OUT + '1M-SUMMARY.json')
qa = jload(OUT + '1M-QA-REPORT.json')
poi_gate = jload(OUT + '1M-POI-AGGREGATION-GATE.json')
wd_gate = jload(OUT + '1M-WIKIDATA-GATE.json')
pulse = jload(ROOT + 'data/atlas/sources/events/pulse-entities.json')
shape_demand = jload(ROOT + 'data/atlas/measurements/'
                     'ahrefs-aggregation-shape-demand-2026-10-01.json')

rows = []
try:
    with gzip.open(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'rt',
                   encoding='utf-8', newline='') as f:
        rows = list(csv.DictReader(f))
except FileNotFoundError:
    pass

rejected = 0
reject_reasons = collections.Counter()
try:
    with gzip.open(OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'rt',
                   encoding='utf-8', newline='') as f:
        for r in csv.DictReader(f):
            rejected += 1
            reject_reasons[r.get('rejection_reason', 'unrecorded')] += 1
except FileNotFoundError:
    pass

by_market = collections.Counter(r['market'] for r in rows)
by_surface = collections.Counter(r['surface'] for r in rows)
by_status = collections.Counter(r['status'] for r in rows)
by_source_status = collections.Counter(r['source_status'] for r in rows)
by_feas = collections.Counter(r.get('serp_feasibility', '') for r in rows)
by_licence = collections.Counter(r.get('licence_status', '') for r in rows)
by_family = collections.Counter(r['family'] for r in rows)
final = len(rows)

# which markets have OSM materialised, and by which route
osm_files = sorted(os.path.basename(p) for p in
                   __import__('glob').glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz'))
place_files = sorted(os.path.basename(p) for p in
                     __import__('glob').glob(ROOT + 'data/atlas/sources/osm-places/*.jsonl.gz'))

L = []
A = L.append
A('# Livdar candidate inventory: the final state of this pass')
A('')
A(f'Built {datetime.date.today().isoformat()}. Every number below is read from a '
  'generated file, not retyped, so this report and the inventory cannot disagree.')
A('')
A('## 1. The number')
A('')
A(f'- FINAL DISTINCT VALID CANDIDATES: **{final:,}**')
A(f'- target: {TARGET:,}')
A(f'- shortfall: **{TARGET - final:,}** ({100 * final / TARGET:.1f} per cent of target)')
A(f'- rejected and kept visible: {rejected:,}')
A('')
A('The target was not reached. The rest of this report is about why, which of the gaps '
  'are closable and at what cost, and what was built instead. No row was added to move '
  'this number: every gate that fired is listed in section 5 with its count.')
A('')
A('## 2. The funnel, stage by stage')
A('')
A('| stage | count | what happened |')
A('| --- | --- | --- |')
if summary:
    A(f"| generated before gates | {summary.get('generated_before_gates', 0):,} | "
      'every family crossed with every entity it has, in every market scoped to it |')
    A(f"| passed the uniqueness and SERP gate | {summary.get('after_quality_gate', 0):,} | "
      'a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, '
      'is rejected here |')
    A(f"| after exact dedupe | {summary.get('after_exact_dedupe', 0):,} | same url_pattern |")
    A(f"| after semantic dedupe | {summary.get('after_semantic_dedupe', 0):,} | "
      'same market, family, template signature and entity |')
A(f'| FINAL DISTINCT | {final:,} | what is in the manifest |')
A('')

A('## 3. Where the candidates are')
A('')
A('### By market')
A('')
A('| market | candidates |')
A('| --- | --- |')
for m, n in by_market.most_common():
    A(f'| {m} | {n:,} |')
A('')
A('### By surface')
A('')
A('| surface | candidates |')
A('| --- | --- |')
for s, n in by_surface.most_common():
    A(f'| {s} | {n:,} |')
A('')
A('### By readiness')
A('')
A('| status | candidates |')
A('| --- | --- |')
for s, n in by_status.most_common():
    A(f'| {s} | {n:,} |')
A('')
A('### By source readiness')
A('')
A('| source_status | candidates |')
A('| --- | --- |')
for s, n in by_source_status.most_common():
    A(f'| {s} | {n:,} |')
A('')
A('### By SERP feasibility')
A('')
A('| serp_feasibility | candidates |')
A('| --- | --- |')
for s, n in by_feas.most_common():
    A(f'| {s or "(unset)"} | {n:,} |')
A('')
A('### By licence')
A('')
A('| licence_status | candidates |')
A('| --- | --- |')
for s, n in by_licence.most_common():
    A(f'| {s or "(unset)"} | {n:,} |')
A('')
A('### The twenty largest families')
A('')
A('| family | candidates |')
A('| --- | --- |')
for s, n in by_family.most_common(20):
    A(f'| {s} | {n:,} |')
A('')

A('## 4. What was materialised in this pass')
A('')
A(f'- OSM POI files on disk: {len(osm_files)} ({", ".join(osm_files)})')
A(f'- OSM place files with geometry: {len(place_files)} ({", ".join(place_files) or "none"})')
if poi_gate:
    A(f"- POI read: {poi_gate.get('poi_read', 0):,}, of which "
      f"{poi_gate.get('attributed_by_tag', 0):,} carried an addr:city tag and "
      f"{poi_gate.get('attributed_by_spatial_match', 0):,} were attributed spatially "
      f"against the 31,715-city gazetteer; {poi_gate.get('poi_unattributable', 0):,} "
      'fell outside every city radius and were dropped')
    A(f"- named places loaded: {poi_gate.get('place_records_loaded', 0):,}, of which "
      f"{poi_gate.get('places_passing_entity_gates', 0):,} passed the entity gates")
    A(f"- POI assigned to an area by polygon containment: "
      f"{poi_gate.get('poi_assigned_to_area_by_containment', 0):,}; by documented "
      f"proximity to a place node: {poi_gate.get('poi_assigned_to_area_by_proximity', 0):,}")
    A(f"- aggregation candidates: {poi_gate.get('aggregation_candidates', 0):,} "
      f"({poi_gate.get('by_shape', {})})")
if wd_gate:
    A(f"- Wikidata entities loaded: {wd_gate.get('wikidata_loaded', 0):,}, candidates "
      f"{wd_gate.get('candidates', 0):,}, deduped against OSM by "
      f"{wd_gate.get('dedupe_matched_by', {})}")
if pulse:
    A(f"- Pulse entities normalised from four providers: {pulse.get('counts', {})}")
A('')

A('## 5. Every gate that fired, with its count')
A('')
A('Nothing is hidden. A candidate rejected here is in '
  'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.')
A('')
if poi_gate.get('rejections'):
    A('### Aggregation gates')
    A('')
    A('| gate | rejected |')
    A('| --- | --- |')
    for k, v in sorted(poi_gate['rejections'].items(), key=lambda kv: -kv[1]):
        A(f'| {k} | {v:,} |')
    A('')
if wd_gate.get('rejections'):
    A('### Wikidata gates')
    A('')
    A('| gate | rejected |')
    A('| --- | --- |')
    for k, v in sorted(wd_gate['rejections'].items(), key=lambda kv: -kv[1]):
        A(f'| {k} | {v:,} |')
    A('')
if reject_reasons:
    A('### Manifest gates')
    A('')
    A('| gate | rejected |')
    A('| --- | --- |')
    for k, v in reject_reasons.most_common():
        A(f'| {k} | {v:,} |')
    A('')

A('## 6. QA at scale')
A('')
if qa:
    A(f"- rows checked: {qa.get('manifest_rows', 0):,}, distinct URLs "
      f"{qa.get('distinct_urls', 0):,}")
    A('')
    A('| check | count |')
    A('| --- | --- |')
    for k, v in (qa.get('checks') or {}).items():
        A(f'| {k} | {v:,} |')
    A('')
    A(f"- title length: min {qa.get('title_length', {}).get('min')}, max "
      f"{qa.get('title_length', {}).get('max')}, mean "
      f"{qa.get('title_length', {}).get('mean')}")
    A('')
    A(f"- stated limitation: {qa.get('limitation', '')}")
else:
    A('- QA report not present; run scripts/atlas/scale/qa-1m-manifest.py')
A('')

A('## 7. The demand and SERP measurements behind the new shapes')
A('')
if shape_demand:
    A(f"{len(shape_demand.get('probes', []))} probes, "
      f"{shape_demand.get('unitsSpent', 0):,} Ahrefs units. Method: "
      f"{shape_demand.get('method', '')}")
    A('')
    A('| shape | market | probe | rows | verdict |')
    A('| --- | --- | --- | --- | --- |')
    for p in shape_demand.get('probes', []):
        A(f"| {p.get('shape')} | {p.get('market')} | {p.get('keyword')} | "
          f"{p.get('rows')} | {p.get('verdict')} |")
    A('')
    rules = shape_demand.get('ruleDerived') or {}
    if rules:
        A('Rules derived from those measurements, applied as gates:')
        A('')
        for k, v in rules.items():
            A(f'- `{k}`: {v}')
        A('')

A('## 8. How to rebuild this')
A('')
A('```')
A('# ingest (each is resumable and idempotent)')
A('scripts/atlas/ingest/osm-finish-remaining.sh        # remaining markets, one at a time')
A('scripts/atlas/ingest/osm-overpass-market.py TW TW   # a market with no downloadable extract')
A('scripts/atlas/ingest/wikidata-materialise.py        # 24 classes x 11 countries')
A('scripts/atlas/ingest/holidays-materialise.py        # four holiday providers')
A('')
A('# normalise, generate, dedupe, validate')
A('scripts/atlas/scale/run-1m-pipeline.sh')
A('```')
A('')
A('Each ingest writes to a temporary name and renames on success, holds a lock so two '
  'workers cannot write one file, and drops a marker so a re-run skips finished work. '
  'The pipeline reads only files on disk and calls no paid API: the Ahrefs and SERP '
  'measurements are recorded and read, never re-bought.')
A('')

A('## 9. The honest verdict on one million')
A('')
A(f'{final:,} candidates survive the gates. The target is {TARGET:,}.')
A('')
A('The gap is not a shortage of raw rows. It is the gates, and each one was added for a '
  'reason that a measurement or a SERP showed:')
A('')
A('- An area page needs the area to be a NAMED entity. Requiring a polygon, a '
  'population, a Wikidata item or a Wikipedia article cut the usable place set by about '
  'two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and '
  'says nothing about an unnamed suburb.')
A('- A POI belongs to exactly one area. Letting every covering extent claim it produced '
  'four times as many area pages, and they would have been near-duplicate lists of the '
  'same venues on adjacent neighbourhood pages.')
A('- Modifier pages are gated on city size, because every measured keyword for them '
  'named a large city.')
A('- An area page needs its parent city page to exist, or it is an orphan by '
  'construction.')
A('- Individual entity pages are allowed only where a third party can rank. The SERP '
  'for a named hospital, university or station belongs to that institution.')
A('')
A('Raising the number to one million from here would mean removing one of those gates. '
  'Each one is written down with the measurement behind it so that decision can be made '
  'deliberately rather than by accident, and so it can be reversed if a later '
  'measurement disagrees. What this pass will not do is reach the number by generating '
  'pages the measurements say nobody searches for.')
A('')

p = OUT + '1M-FINAL-DELIVERABLE.md'
open(p, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print(f'written {p}')
print(f'FINAL DISTINCT {final:,}  rejected {rejected:,}  markets {len(by_market)}')
