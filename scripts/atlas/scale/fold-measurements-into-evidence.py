#!/usr/bin/env python3
"""Fold the 2026-10-08 Ahrefs measurements into AHREFS-EVIDENCE.parquet.

WHY THIS EXISTS. The Ahrefs subscription ended on 2026-10-08 - both a unit-free keyword call
and the free subscription-info endpoint return {"error": "Insufficient plan"} - so every number
this project will ever have from Ahrefs is now on disk and nothing more can be read. The last
day's measurements were written as narrative JSON under data/atlas/measurements/ahrefs-expiry/,
which is the right shape for recording a VERDICT and the wrong shape for being queried. The
13,267-row evidence store is the queryable record, and it stopped at the earlier harvest.

This appends the per-keyword rows from the last measurements to that store, with the same twelve
columns, so one file answers "what did Ahrefs ever tell us about this keyword".

WHAT IS FOLDED IN, and how family and market are derived rather than guessed:

  transport-hub-intent-2026-10-08.json
      /en_GB_rail_stations/rows/{keyword} and /de_DE_rail_stations/rows/{keyword}
      -> family transport.station-departures, the family those rows admitted
      /bus_and_coach_stations_are_REFUSED/en_GB/{keyword}
      -> the same family, segment bus_and_coach_REFUSED, because a measured REFUSAL is evidence
         and dropping it would leave the store looking as though only admissions were measured

  hundred-k-model-search-2026-10-08.json
      /candidate_N_{name}/measured_{market}/{keyword}
      -> family candidate.{name}, segment hundred_k_model_search. These are the rows behind six
         refusals, and they are the most reusable evidence in the file: they stop the same six
         candidates being re-proposed and re-measured, which is exactly what cannot be done now.

WHAT IS DELIBERATELY NOT FOLDED IN. tier4-city-demand-2026-10-08.json carries DISTRIBUTIONS -
173 cities measured, 59.5 per cent clearing 50, median 80 - not per-keyword rows. Its
examples_in_the_tier are "city volume" strings, not keywords. Flattening a distribution into a
keyword table would state something the measurement did not: that each of those was read as its
own keyword with its own difficulty. The JSON stays authoritative for that cell and the report
says so.

The language and country columns follow the store's own convention, lowercase, derived from the
market token in the path. volume_floor and dr_top10_filter are left null because these calls
used neither; keyword_difficulty is null where the measurement returned null rather than zero,
which is a real distinction in this data - a null means Ahrefs had no difficulty for the term,
and writing it as 0 would turn absence of evidence into a measurement of openness.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
MEAS = ROOT + 'data/atlas/measurements/ahrefs-expiry/'
PARQUET = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/AHREFS-EVIDENCE.parquet'

COLS = ['family', 'language', 'country', 'segment', 'keyword', 'volume', 'keyword_difficulty',
        'cpc_usd', 'parent_topic', 'dr_top10_filter', 'volume_floor', 'source_file']

MARKET = re.compile(r'\b([a-z]{2})[_-]([A-Z]{2})\b')


def market_of(path):
    m = MARKET.search(path)
    return (m.group(1), m.group(2).lower()) if m else ('', '')


def is_pair(v):
    return (isinstance(v, list) and len(v) == 2
            and all(x is None or isinstance(x, (int, float)) for x in v))


def harvest(obj, path, out, family_of, segment_of, src):
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f'{path}/{k}'
            if is_pair(v):
                lang, cc = market_of(p)
                out.append({
                    'family': family_of(p), 'language': lang, 'country': cc,
                    'segment': segment_of(p), 'keyword': k,
                    'volume': int(v[0]) if v[0] is not None else None,
                    'keyword_difficulty': int(v[1]) if v[1] is not None else None,
                    'cpc_usd': None, 'parent_topic': '', 'dr_top10_filter': None,
                    'volume_floor': None, 'source_file': src})
            elif isinstance(v, (dict, list)):
                harvest(v, p, out, family_of, segment_of, src)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, (dict, list)):
                harvest(v, f'{path}[{i}]', out, family_of, segment_of, src)


def main():
    rows = []

    src = 'transport-hub-intent-2026-10-08.json'
    if os.path.exists(MEAS + src):
        d = json.load(open(MEAS + src))
        harvest(d, '', rows,
                family_of=lambda p: 'transport.station-departures',
                segment_of=lambda p: ('bus_and_coach_REFUSED' if 'REFUSED' in p
                                      else 'rail_stations'),
                src=src)

    src = 'hundred-k-model-search-2026-10-08.json'
    if os.path.exists(MEAS + src):
        d = json.load(open(MEAS + src))

        def fam(p):
            m = re.match(r'/candidate_\d+_([a-z0-9_]+)', p)
            return f'candidate.{m.group(1)}' if m else 'candidate.unlabelled'

        harvest(d, '', rows, family_of=fam,
                segment_of=lambda p: 'hundred_k_model_search', src=src)

    if not rows:
        print('nothing to fold in', file=sys.stderr)
        return

    import pyarrow as pa
    import pyarrow.parquet as pq
    old = pq.read_table(PARQUET)
    before = old.num_rows

    # Drop any rows a previous run of THIS script added, so re-running is idempotent rather
    # than doubling the new rows every time.
    srcs = {r['source_file'] for r in rows}
    sf = old.column('source_file').to_pylist()
    keep = [i for i, v in enumerate(sf) if v not in srcs]
    if len(keep) != before:
        old = old.take(keep)
        print(f'removed {before - len(keep)} rows from a previous fold-in', file=sys.stderr)

    # source_file is typed pyarrow NULL in the existing store, because every row written so far
    # left it empty, and a null-typed column cannot hold a string. Promote that one column to
    # string on the old table rather than dropping the provenance from the new rows: knowing
    # which measurement file a number came from is the whole point of folding them in.
    schema = pa.schema([pa.field('source_file', pa.string()) if f.name == 'source_file' else f
                        for f in old.schema])
    if old.schema.field('source_file').type != pa.string():
        old = old.cast(schema)
        print('promoted source_file from null to string', file=sys.stderr)
    new = pa.table({c: pa.array([r[c] for r in rows], type=schema.field(c).type)
                    for c in COLS}, schema=schema)
    out = pa.concat_tables([old, new])
    pq.write_table(out, PARQUET + '.tmp', compression='zstd')
    os.replace(PARQUET + '.tmp', PARQUET)
    print(f'AHREFS-EVIDENCE.parquet: {before:,} -> {out.num_rows:,} rows '
          f'(+{len(rows)} from {len(srcs)} measurement files)')
    import collections
    for (f, s), n in sorted(collections.Counter(
            (r['family'], r['segment']) for r in rows).items()):
        print(f'  {n:>4}  {f}  [{s}]')


if __name__ == '__main__':
    main()
