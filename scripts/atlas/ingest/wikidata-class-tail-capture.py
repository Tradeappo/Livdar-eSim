#!/usr/bin/env python3
"""Capture the tail classes, each routed to the contract its shape deserves.

THE ROUTING IS THE POINT. The tail census returns classes of every shape at once: wayside
crosses, war memorials, hamlets, cantons, communes, bridges. Dropping all of them into one
directory would put them all under one contract, and the contracts here are not
interchangeable:

  settlement/   a settlement needs two facts BEYOND population, area and elevation, or
                three admitted pages inside it. Without that rule a tail full of hamlets is
                a tail full of city-name swaps.
  admin-tail/   an administrative subdivision needs all three of readership, five admitted
                children and two facts beyond the triple, because nobody visits a canton.
  landmark/     everything else: two printable facts with stated units, a parent, and the
                readership floor, or the calibrated substance bar.

So a class is routed by what it IS before anything is fetched for it, and the existing
builders then apply their own gates unchanged. Nothing in this file relaxes a gate; it
decides which gate a class answers to.

AND THE CAPTURE IS BATCHED, because the tail is 2,460 classes and the per-class band walk
costs two round trips before it reads a single row. The census hit the same wall and solved
it the same way: fifty classes in a VALUES clause and one GROUP BY answers all fifty at
once. Here the batch is sized by MEASURED SUPPLY rather than by class count - the census
already counted every class, so classes are grouped until their summed readable supply
reaches BUDGET, which keeps each answer far below the 10,000-row cap that silently
truncates. A class whose own supply exceeds BUDGET is not batched at all: it goes to the
landmark capture's band walk, which is the only thing in this repository that has survived
three different silent truncations.

THE CAP IS STILL NOT TRUSTED. A batched answer that comes back AT the cap is evidence of
truncation, so the class list is split in half and both halves re-asked; a single class that
fills the cap on its own falls back to the latitude split. The same rule as band(), one
level up.

Usage: wikidata-class-tail-capture.py [--floor 25] [--budget 2000] [--max-classes N]
                                      [--only BUCKET] [--report PATH]
                                      [--census PATH]
Reads  data/atlas/sources/wikidata/landmark/_class-tail-census.json
Writes data/atlas/sources/wikidata/{landmark,settlement,admin-tail}/<class>.jsonl.gz
       data/atlas/sources/wikidata/landmark/_class-tail-capture.json
"""
import collections, gzip, importlib.util, json, os, re, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402
_spec = importlib.util.spec_from_file_location(
    'landmark_capture', ROOT + 'scripts/atlas/ingest/wikidata-landmark-capture.py')
LC = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LC)

CENSUS = ROOT + 'data/atlas/sources/wikidata/landmark/_class-tail-census.json'
REPORT = ROOT + 'data/atlas/sources/wikidata/landmark/_class-tail-capture.json'
DIRS = {'landmark': ROOT + 'data/atlas/sources/wikidata/landmark/',
        'settlement': ROOT + 'data/atlas/sources/wikidata/settlement/',
        'admin-tail': ROOT + 'data/atlas/sources/wikidata/admin-tail/'}

# The same test the settlement pass used, so a hamlet that arrives in the tail answers to
# the same contract as a hamlet that arrived in the main pass.
SETTLE = re.compile(r'village|hamlet|commune|municipal|town\b|city|settlement|locality|'
                    r'neighborhood|neighbourhood|borough|parish|suburb|ward|quarter|'
                    r'populat|ortsteil|ortschaft|desa|mahalle|gromada|posyolok|frazione|'
                    r'comune|subdistrict|township|census|barangay|freguesia|single entity|'
                    r'unincorporated|kelurahan|buurtschap|khutor|place in |colonia|'
                    r'rural community|tambon|aldea|hameau|dorp|kampung|pueblo|gampong|'
                    r'kmetstvo|seat of the local council', re.I)
# A class that names no THING: a page cannot say what one of these is beyond repeating the
# class name, so it is refused here rather than refused one row at a time downstream.
VACUOUS = re.compile(r'^(geographic|location|place|entity|object|feature|area|zone|'
                     r'territory|region|unit|division|subdivision|site|'
                     r'administrative territorial entity|'
                     r'administrative divisions? of [a-z ]+)$|'
                     r'disambiguation|list of|wikimedia|category', re.I)


def slug_of(label):
    return re.sub(r'[^a-z0-9]+', '_', (label or '').lower()).strip('_')


def route(d):
    lab = d.get('label') or ''
    if not lab or VACUOUS.search(lab):
        return None
    if d.get('is_administrative_subdivision') and not SETTLE.search(lab):
        return 'admin-tail'
    if SETTLE.search(lab):
        return 'settlement'
    return 'landmark'


def fetch(cls, lo, hi):
    """Rows for a batch of classes in one query, with the batch split if it hits the cap.

    ?c is selected, not fixed, so one answer carries every class in the batch and a row
    says which class it answers for. An item stating two of the batch's classes appears
    twice and is written to both files, exactly as two separate per-class captures would
    have written it; the downstream fold removes the second class.
    """
    q = W.PREFIXES + """SELECT DISTINCT ?c ?x ?lat ?lon ?site WHERE {
  VALUES ?c { %s }
  ?x wdt:P31 ?c .
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  FILTER(xsd:double(?lat) >= %s && xsd:double(?lat) < %s)
  ?site schema:about ?x .
  FILTER(%s)
}
LIMIT %d""" % (' '.join('wd:%s' % q for q, _s, _l, _n in cls), lo, hi,
               W.SITE_FILTER, W.CAP)
    rows = W.ask(q, timeout=900)
    if rows is None:
        raise RuntimeError('batch of %d classes [%s, %s) failed every attempt'
                           % (len(cls), lo, hi))
    if len(rows) >= W.CAP:
        if len(cls) > 1:
            mid = len(cls) // 2
            print('    batch of %d came back full, splitting the class list'
                  % len(cls), flush=True)
            return fetch(cls[:mid], lo, hi) + fetch(cls[mid:], lo, hi)
        if hi - lo < 1e-5:
            raise RuntimeError('%s [%s, %s) is full and cannot be split' % (cls[0][1], lo, hi))
        mid = (lo + hi) / 2.0
        print('    %s [%s, %s) came back full, splitting the band'
              % (cls[0][1], lo, hi), flush=True)
        return fetch(cls, lo, mid) + fetch(cls, mid, hi)
    return rows


def counts(cls):
    """How many distinct readable items each class in the batch has, in one query.

    The same count the census took, re-taken here, because the capture is checked against a
    number from the SAME run rather than against yesterday's note.
    """
    rows = W.ask(W.PREFIXES + """SELECT ?c (COUNT(DISTINCT ?x) AS ?n) WHERE {
  VALUES ?c { %s }
  ?x wdt:P31 ?c ; wdt:P625 ?coord .
  ?site schema:about ?x .
  FILTER(%s)
}
GROUP BY ?c""" % (' '.join('wd:%s' % q for q, _s, _l, _n in cls), W.SITE_FILTER),
                 timeout=900)
    if rows is None:
        return None
    return {W.entity_of(r['c']['value']): int(r['n']['value']) for r in rows}


def write(path, items):
    tmp = path + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for v in items.values():
            fh.write(json.dumps(v, ensure_ascii=False) + '\n')
    os.replace(tmp, path)


def group(cls, budget):
    """Classes grouped until their measured supply reaches budget; big ones left alone."""
    small = [c for c in cls if c[3] < budget]
    big = [c for c in cls if c[3] >= budget]
    out, cur, tot = [], [], 0
    for c in small:
        if cur and tot + c[3] > budget:
            out.append(cur)
            cur, tot = [], 0
        cur.append(c)
        tot += c[3]
    if cur:
        out.append(cur)
    return out, big


def run_batched(cls, out_dir, budget, log):
    os.makedirs(out_dir, exist_ok=True)
    # Checked in chunks: one VALUES clause holding two thousand class ids is a different
    # query from one holding fifty, and the label guard is not worth the risk of finding
    # that out the hard way.
    for i in range(0, len(cls), 200):
        LC.check_labels(cls[i:i + 200])
    groups, big = group(cls, budget)
    print('%d classes: %d batches of small classes, %d read one at a time'
          % (len(cls), len(groups), len(big)), flush=True)
    total, t0 = 0, time.time()
    for n, batch in enumerate(groups):
        want = counts(batch) or {}
        rows = fetch(batch, -90.0, 90.0)
        per = collections.defaultdict(dict)
        langs = collections.Counter()
        slug = {q: s for q, s, _l, _n in batch}
        for r in rows:
            c = W.entity_of(r['c']['value'])
            if c not in slug:
                continue
            LC.merge([r], slug[c], per[c], langs)
        for q, s, _l, supply in batch:
            got = per.get(q, {})
            write(out_dir + s + '.jsonl.gz', got)
            total += len(got)
            exp = want.get(q, supply)
            if exp - len(got) > max(2, exp * 0.02):
                log['shortfalls'][s] = {'captured': len(got), 'endpoint_count': exp}
        print('  batch %d/%d  %3d classes  %6d rows  %6d items  %5.0fs  total %d'
              % (n + 1, len(groups), len(batch), len(rows), sum(len(v) for v in per.values()),
                 time.time() - t0, total), flush=True)
    for q, s, _l, supply in big:
        got, want = LC.capture(q, s, out_dir)
        if got is None:
            print('  %-30s already captured' % s, flush=True)
            continue
        total += got
        if want - got > want * 0.001:
            log['shortfalls'][s] = {'captured': got, 'endpoint_count': want}
    return total


def main():
    args = sys.argv[1:]
    floor = int(args[args.index('--floor') + 1]) if '--floor' in args else 25
    budget = int(args[args.index('--budget') + 1]) if '--budget' in args else 2000
    cap = (int(args[args.index('--max-classes') + 1])
           if '--max-classes' in args else 10 ** 9)
    only = args[args.index('--only') + 1] if '--only' in args else None
    census = args[args.index('--census') + 1] if '--census' in args else CENSUS
    # One process per bucket, so the two large buckets are read at the same time rather
    # than one behind the other; each writes its own report or the second would overwrite
    # the first's.
    report = args[args.index('--report') + 1] if '--report' in args else REPORT

    doc = json.load(open(census, encoding='utf-8'))
    buckets = {k: [] for k in DIRS}
    refused, seen = [], {k: set() for k in DIRS}
    for d in doc['classes']:
        if d['readable'] < floor:
            continue
        where = route(d)
        if where is None:
            refused.append(d['label'])
            continue
        sl = slug_of(d['label'])
        if not sl or sl in seen[where]:
            refused.append(d['label'])
            continue
        # A slug already used by an earlier capture in the same directory would overwrite
        # that class's file, so the collision is skipped rather than resolved.
        if os.path.exists(DIRS[where] + sl + '.jsonl.gz'):
            continue
        seen[where].add(sl)
        buckets[where].append((d['qid'], sl, d['label'], d['readable']))

    log = {'built_on': time.strftime('%Y-%m-%d'), 'floor': floor, 'budget': budget,
           'classes_refused_as_vacuous_or_colliding': len(refused),
           'per_bucket': {}, 'shortfalls': {}}
    for k in buckets:
        buckets[k] = buckets[k][:cap]
        log['per_bucket'][k] = {'classes': len(buckets[k]),
                                'supply': sum(x[3] for x in buckets[k])}
        print('%-12s %4d classes, %7d readable items'
              % (k, len(buckets[k]), sum(x[3] for x in buckets[k])), flush=True)
    print('%d classes refused as vacuous or colliding' % len(refused), flush=True)

    for where, cls in buckets.items():
        if (only and where != only) or not cls:
            continue
        print('=== %s' % where, flush=True)
        log['per_bucket'][where]['captured'] = run_batched(cls, DIRS[where], budget, log)
        json.dump(log, open(report, 'w'), indent=1, ensure_ascii=False)
    json.dump(log, open(report, 'w'), indent=1, ensure_ascii=False)
    print('captured: %s' % {k: v.get('captured') for k, v in log['per_bucket'].items()})
    if log['shortfalls']:
        print('%d classes came back short of their count, recorded not rounded away'
              % len(log['shortfalls']))


if __name__ == '__main__':
    main()
