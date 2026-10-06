"""Select a destination keyword TAIL sample by tourism POI, from the rebuilt aggregation.

Why not population: this project already established that population is not demand. Szklarska
Poreba has 6,970 people and 9,300 searches a month for its sights, and a population-ranked tail
of destination countries is mostly Chinese industrial cities and Pakistani district towns that
no English or German traveller searches. Measuring that would return near zero and would be
read as "the tail is dead" when what it really measured was the wrong instrument.

Why not raw POI city tags either: tried on 2026-10-06 and it found only 28 uncovered cities with
eight or more tourism POI, because most POI carry no city tag and are attributed SPATIALLY. That
spatial attribution is what the aggregation does, and until the 2026-10-06 rebuild it had never
run over a destination country at all.

So the instrument is the aggregation's own city rows for destination countries: a city that
earned a tourism-class list page there has, by the pipeline's own gates, something to see.
"""
import collections, csv, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

AGG = ROOT + 'data/atlas/sources/osm-poi/_aggregations.jsonl.gz'
MKT = set(entity_identity.MKT_COUNTRY.values())
# the classes a VISITOR looks for, not the ones a city has most of
TOUR = {'attraction', 'viewpoint', 'museum', 'monument', 'artwork', 'gallery',
        'archaeological_site', 'ruins', 'castle', 'fort', 'temple', 'shrine', 'mosque',
        'cathedral', 'palace', 'zoo', 'aquarium', 'theme_park', 'waterfall', 'hot_spring'}


def covered():
    """Every (city, country) that already carries entity-level demand evidence."""
    out = set()
    for path, city_k, cc_k in (
            ('reports/livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv',
             'city', 'city_country'),
            ('data/atlas/measurements/destination-harvest/resolved-cities-2026-10-01.csv',
             'city', 'city_country')):
        try:
            for r in csv.DictReader(open(ROOT + path)):
                if r.get(city_k):
                    out.add((r[city_k].strip().lower(), (r.get(cc_k) or '').strip()))
        except FileNotFoundError:
            pass
    # and the two files written today, so a city measured this morning is not measured again
    for fn in ('destination-demand-new-markets-2026-10-06.json',
               'destination-coverage-probe-2026-10-06.json'):
        try:
            d = json.load(open(ROOT + 'data/atlas/measurements/' + fn, encoding='utf-8'))
        except (FileNotFoundError, ValueError):
            continue
        for v in d.values():
            if isinstance(v, dict):
                for k in (v.get('keywords') or []):
                    if isinstance(k, dict) and k.get('entity'):
                        out.add((k['entity'].strip().lower(), k.get('country') or ''))
            if isinstance(v, dict) and isinstance(v.get('markets'), dict):
                for m in v['markets'].values():
                    for k in (m.get('keywords') or []):
                        out.add((k['entity'].strip().lower(), k.get('country') or ''))
    return out


def main():
    if not os.path.exists(AGG):
        sys.exit(f'MISSING {AGG}')
    cov = covered()
    score = collections.Counter()
    name = {}
    langs = collections.defaultdict(set)
    rows = dest = 0
    for line in gzip.open(AGG, 'rt', encoding='utf-8'):
        try:
            d = json.loads(line)
        except Exception:
            continue
        rows += 1
        cc = d.get('country')
        if cc in MKT or not cc:
            continue
        dest += 1
        if d.get('shape') != 'city_category' or d.get('cls') not in TOUR:
            continue
        k = (d.get('city_id'), cc)
        score[k] += d.get('n', 0)
        name[k] = d.get('city')
        langs[k].add(d.get('language'))
    print(f'aggregation rows: {rows:,}; in DESTINATION countries: {dest:,}', file=sys.stderr)
    if not dest:
        sys.exit('The aggregation still holds no destination country. The fix did not take, or '
                 'this is the pre-fix file. Nothing is selected rather than selecting from the '
                 'wrong input.')
    cand = [(k, v) for k, v in score.items()
            if ((name[k] or '').lower(), k[1]) not in cov]
    cand.sort(key=lambda x: -x[1])
    print(f'uncovered destination cities with a tourism list page: {len(cand):,}')
    print()
    print('HEAD (ranks 1 to 12), for reference only:')
    for k, v in cand[:12]:
        print(f'  {name[k]}|{k[1]}|{v}|{",".join(sorted(langs[k]))}')
    print()
    print('TAIL SAMPLE, spread across ranks 25 to 400:')
    tail = cand[25:400]
    step = max(1, len(tail) // 30)
    for k, v in tail[::step][:30]:
        print(f'  {name[k]}|{k[1]}|{v}|{",".join(sorted(langs[k]))}')


if __name__ == '__main__':
    main()
