#!/usr/bin/env python3
"""Measure what a Wikidata statement capture would add to the features that hold an
encyclopedia entry and no fact a reader came for.

Brief N asks for facts per entity BEFORE and AFTER, quantified rather than asserted.
This finds the exact population the MEASURABLE gate rejects for that reason, samples it,
asks Wikidata for a broad property set, and reports the measured gain. It writes a
measurement file and NOTHING into the pipeline.
"""
import collections, glob, gzip, json, os, sys, time, urllib.parse, urllib.request

ROOT = '/home/user/Livdar-eSim/'
OUTD = ROOT + 'data/atlas/sources/osm-outdoor/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')

# Mirrors outdoor-feature-candidates.py exactly. Copied rather than imported because that
# module runs the whole build on import.
PAGE_CLASSES = {
    'peak', 'volcano', 'mountain_pass', 'cave', 'waterfall', 'hot_spring', 'geyser',
    'natural_arch', 'glacier', 'castle', 'fort', 'ruins', 'archaeological_site', 'monument',
    'city_gate', 'aqueduct', 'lighthouse', 'observatory', 'windmill', 'watermill',
    'camp_site', 'caravan_site', 'mountain_hut', 'wilderness_hut', 'beach', 'beach_resort',
    'viewpoint', 'tower', 'climbing_crag', 'bird_hide', 'theme_park'}
MEASURABLE = ('ele', 'prominence', 'isolation', 'depth', 'length', 'width', 'height', 'area',
              'sac_scale', 'mtb:scale', 'climbing:grade:uiaa', 'piste:difficulty', 'distance',
              'ascent', 'capacity', 'tents', 'caravans', 'start_date')
PRACTICAL = ('website', 'contact:website', 'operator', 'opening_hours', 'fee', 'access',
             'phone', 'wheelchair')

# The properties a reader of an outdoor page actually came for.
PROPS = {
    'P2044': 'elevation above sea level', 'P2660': 'topographic prominence',
    'P2661': 'topographic isolation', 'P2043': 'length', 'P2049': 'width',
    'P2048': 'height', 'P2046': 'area', 'P4511': 'vertical depth',
    'P571': 'inception', 'P580': 'start time', 'P1619': 'date of official opening',
    'P84': 'architect', 'P631': 'structural engineer', 'P149': 'architectural style',
    'P1435': 'heritage designation', 'P1476': 'title', 'P2583': 'distance from Earth',
    'P1083': 'maximum capacity', 'P1174': 'visitors per year',
    'P137': 'operator', 'P127': 'owner', 'P856': 'official website',
    'P2047': 'duration', 'P610': 'highest point', 'P2250': 'life expectancy',
    'P206': 'located next to body of water', 'P4552': 'mountain range',
    'P2789': 'connects with', 'P177': 'crosses', 'P2109': 'installed capacity',
}

def population():
    """The features the MEASURABLE gate rejects as notable_but_no_fact_a_reader_came_for."""
    out = []
    for f in sorted(glob.glob(OUTD + 'outdoor-*.jsonl.gz')):
        for line in gzip.open(f, 'rt', encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except Exception:
                continue
            if o.get('cls') not in PAGE_CLASSES:
                continue
            if not (o.get('qid') or o.get('wikipedia')):
                continue
            attr = o.get('attr') or {}
            if any(k in attr for k in MEASURABLE) or any(k in attr for k in PRACTICAL):
                continue
            out.append(o)
    return out


def ask(qids):
    """One SPARQL call for a batch of items. VALUES keeps it a lookup, not a scan."""
    vals = ' '.join('wd:' + q for q in qids)
    props = ' '.join(f'OPTIONAL{{?item wdt:{p} ?{p}.}}' for p in PROPS)
    sel = ' '.join('?' + p for p in PROPS)
    q = f'SELECT ?item {sel} WHERE {{ VALUES ?item {{ {vals} }} {props} }}'
    url = 'https://query.wikidata.org/sparql?' + urllib.parse.urlencode(
        {'query': q, 'format': 'json'})
    req = urllib.request.Request(url, headers={
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'LivdarAtlas/1.0 (offline research; contact via repo)'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def main():
    pop = population()
    with_qid = [o for o in pop if o.get('qid')]
    print(f'population the gate rejects as notable but factless: {len(pop):,}', file=sys.stderr)
    print(f'  of those, carrying a Wikidata id we can query:      {len(with_qid):,}', file=sys.stderr)
    by_cls = collections.Counter(o['cls'] for o in pop)
    print('  by class: ' + ', '.join(f'{k}={v}' for k, v in by_cls.most_common(10)),
          file=sys.stderr)

    # A stratified sample: the largest classes, proportionally, so the measured gain is not
    # one class's gain reported as the whole population's.
    sample, per = [], collections.Counter()
    target = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    quota = {c: max(5, round(target * n / len(with_qid))) for c, n in
             collections.Counter(o['cls'] for o in with_qid).items()}
    for o in with_qid:
        c = o['cls']
        if per[c] < quota.get(c, 0):
            sample.append(o)
            per[c] += 1
    print(f'  stratified sample: {len(sample):,} across {len(per)} classes', file=sys.stderr)

    gained, rows, errors = collections.Counter(), [], 0
    for i in range(0, len(sample), 50):
        batch = sample[i:i + 50]
        try:
            res = ask([o['qid'] for o in batch])
        except Exception as e:
            errors += 1
            print(f'  batch {i // 50} failed: {e}', file=sys.stderr)
            time.sleep(5)
            continue
        got = collections.defaultdict(dict)
        for b in res['results']['bindings']:
            qid = b['item']['value'].rsplit('/', 1)[-1]
            for p in PROPS:
                if p in b:
                    got[qid][p] = b[p]['value']
        for o in batch:
            facts = got.get(o['qid'], {})
            gained[len(facts)] += 1
            if facts:
                rows.append({'entity_id': o['id'], 'qid': o['qid'], 'cls': o['cls'],
                             'country': o['country'], 'name': o.get('name'),
                             'facts_before': 0, 'facts_after': len(facts),
                             'properties': {PROPS[p]: v for p, v in facts.items()}})
        print(f'  batch {i // 50 + 1}/{(len(sample) + 49) // 50}: '
              f'{sum(1 for o in batch if got.get(o["qid"]))} of {len(batch)} gained a fact',
              file=sys.stderr)
        time.sleep(1.5)

    n = sum(gained.values())
    with_any = sum(v for k, v in gained.items() if k > 0)
    mean = sum(k * v for k, v in gained.items()) / max(n, 1)
    out = {
        'measured_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'question': 'Brief N. Quantify facts per entity BEFORE and AFTER enrichment for the '
                    'features that hold an encyclopedia entry and no fact a reader came for.',
        'population_total': len(pop),
        'population_with_a_wikidata_id': len(with_qid),
        'population_by_class': dict(by_cls.most_common()),
        'sample_size': n,
        'sample_is': 'stratified by class in proportion to the population, so the measured '
                     'gain is not one class reported as all',
        'facts_per_entity_before': 0.0,
        'facts_per_entity_after_mean': round(mean, 2),
        'entities_gaining_at_least_one_fact': with_any,
        'share_gaining_at_least_one_fact': round(100.0 * with_any / max(n, 1), 1),
        'distribution_of_facts_gained': {str(k): v for k, v in sorted(gained.items())},
        'properties_queried': PROPS,
        'failed_batches': errors,
        'examples': rows[:40],
    }
    p = ROOT + 'data/atlas/measurements/wikidata-enrichment-probe-2026-10-07.json'
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f'\nBEFORE {0.0} facts per entity, AFTER {mean:.2f}', file=sys.stderr)
    print(f'{with_any:,} of {n:,} sampled gained at least one fact '
          f'({100.0 * with_any / max(n, 1):.1f}%)', file=sys.stderr)
    print(f'wrote {p}', file=sys.stderr)


if __name__ == '__main__':
    main()
