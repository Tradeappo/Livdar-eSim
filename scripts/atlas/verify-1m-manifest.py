#!/usr/bin/env python3
"""
Recount the 1M candidate manifest from the parts git actually holds, and say
whether it is intact.

    python3 scripts/atlas/verify-1m-manifest.py            print the report
    python3 scripts/atlas/verify-1m-manifest.py --json F   also write it to F

WHY THIS EXISTS. The authoritative record is LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz
(112 MB) and its parquet twin (210 MB). Neither fits under GitHub's 100 MB file
limit, so neither is in git. What IS in git is the same CSV split on row
boundaries into LIVDAR-1M-CANDIDATE-MANIFEST.parts/part-0N.csv.gz, with an index
carrying the row count and a SHA-256 over every data row. This script reads only
those parts, so it works on a fresh clone with nothing else on disk, and it
answers four questions:

  1. intact?    rows and SHA-256 equal what _parts-index.json recorded
  2. distinct?  no candidate_id and no URL appears twice
  3. valid?     no row carries a REJECTED_* status. A survivor keeps its family's
                catalogue status (VALIDATED, PROMISING, EXPERIMENT_ONLY, MISSING_DATA,
                BLOCKED_BY_LICENCE, NOT_IMPLEMENTED) or an aggregation type
                (POI_AGGREGATION, TRANSPORT_PAIR, VISA_POLICY_CELL); every rejection is
                re-statused REJECTED_* and written to the rejected file instead. So
                VALID means "survived every gate", NOT "renderable today": the
                breakdown by status says how much of it can be served now.
  4. how much?  the breakdowns every handoff document quotes, recomputed here
                rather than copied from a summary that might be stale

It streams row by row, holding only the two id sets, so it runs in well under
2 GB. It never writes to the manifest.
"""
import csv, gzip, hashlib, io, json, os, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
FREEZE = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
PARTS = FREEZE + 'LIVDAR-1M-CANDIDATE-MANIFEST.parts/'
REJ_PARTS = FREEZE + 'LIVDAR-1M-REJECTED-CANDIDATES.parts/'
csv.field_size_limit(1 << 30)


def read_parts(d):
    idx = json.load(open(d + '_parts-index.json'))
    h = hashlib.sha256()
    header = None
    for p in idx['parts']:
        with gzip.open(d + p['part'], 'rb') as f:
            first = f.readline()
            if header is None:
                header = first.decode('utf-8').rstrip('\r\n')
            for raw in f:
                h.update(raw)
                yield 'row', raw
    yield 'done', (idx, header, h.hexdigest())


def main():
    out = {}
    ids, urls = set(), set()
    c = collections.defaultdict(collections.Counter)
    n = 0
    header = None
    cols = None
    idx = None
    digest = None
    for kind, val in read_parts(PARTS):
        if kind == 'done':
            idx, header, digest = val
            break
        if cols is None:
            # the header is known once the generator has read part-01's first line
            pass
        n += 1
        line = val.decode('utf-8')
        if cols is None:
            with gzip.open(PARTS + idx_first_part(), 'rt', encoding='utf-8') as f:
                cols = next(csv.reader([f.readline()]))
        row = dict(zip(cols, next(csv.reader(io.StringIO(line)))))
        ids.add(row['candidate_id'])
        urls.add(row['url_pattern'])
        for k in ('status', 'market', 'language', 'surface', 'source_status', 'licence_status',
                  'localization_class', 'entity_type', 'publication_cohort_candidate'):
            c[k][row.get(k, '')] += 1
        c['family'][row['family']] += 1
        ev = (row.get('entity_demand_evidence') or '').split(':')[0].split(';')[0][:60]
        c['entity_demand_evidence_kind'][ev or '(none)'] += 1
    out['rows'] = n
    out['rows_recorded_in_index'] = idx['total_rows']
    out['sha256_data_rows'] = digest
    out['sha256_recorded_in_index'] = idx['sha256_of_all_data_rows']
    out['intact'] = (n == idx['total_rows'] and digest == idx['sha256_of_all_data_rows'])
    out['distinct_candidate_ids'] = len(ids)
    out['distinct_urls'] = len(urls)
    out['distinct'] = (len(ids) == n and len(urls) == n)
    out['no_rejected_status_in_manifest'] = not any(str(k).startswith('REJECTED') for k in c['status'])
    out['FINAL_DISTINCT_VALID'] = n if (out['intact'] and out['distinct'] and out['no_rejected_status_in_manifest']) else None
    out['distinct_families'] = len(c['family'])
    for k, v in c.items():
        if k == 'family':
            out['top_families'] = dict(v.most_common(40))
        else:
            out['by_' + k] = dict(v.most_common())
    # the rejected file, counted the same way so a reader can check generated - removed = final
    rn = 0
    rc = collections.Counter()
    rcols = None
    for kind, val in read_parts(REJ_PARTS):
        if kind == 'done':
            ridx, rheader, rdigest = val
            break
        rn += 1
        if rcols is None:
            first = json.load(open(REJ_PARTS + '_parts-index.json'))['parts'][0]['part']
            with gzip.open(REJ_PARTS + first, 'rt', encoding='utf-8') as f:
                rcols = next(csv.reader([f.readline()]))
        row = dict(zip(rcols, next(csv.reader(io.StringIO(val.decode('utf-8'))))))
        rc[(row.get('rejection_reason') or '').split(':')[0][:80]] += 1
    out['rejected_rows'] = rn
    out['rejected_intact'] = (rn == ridx['total_rows'] and rdigest == ridx['sha256_of_all_data_rows'])
    out['rejected_by_reason_top'] = dict(rc.most_common(40))
    print(json.dumps(out, indent=1, ensure_ascii=False))
    if '--json' in sys.argv:
        json.dump(out, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1, ensure_ascii=False)
    sys.exit(0 if out['FINAL_DISTINCT_VALID'] else 1)


def idx_first_part():
    return json.load(open(PARTS + '_parts-index.json'))['parts'][0]['part']


if __name__ == '__main__':
    main()
