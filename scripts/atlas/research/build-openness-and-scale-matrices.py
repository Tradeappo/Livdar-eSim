#!/usr/bin/env python3
"""Fold every open-SERP harvest on disk into the two reporting matrices.

Open-SERP harvesting is the technique that produced all of this: a
keywords-explorer-matching-terms call carrying a serp_domain_rating_top10_min
filter returns only keywords where a domain of at most that rating already holds
a top-ten position. Every row is therefore a SERP that has already been entered
by a site without authority, which is a different and much stronger statement
than a low keyword difficulty score.

The harvest files arrive in two shapes, because they were captured over two
sessions: pipe-delimited text with a commented header, and JSON written from a
persisted API response. Both are read here so the matrices are built from the
measurements rather than from notes about them.
"""
import csv, json, os, re, statistics, sys
from collections import defaultdict

ROOT = '/home/user/Livdar-eSim'
MEAS = os.path.join(ROOT, 'data/atlas/measurements/ahrefs-expiry')
OUT = os.path.join(ROOT, 'reports/livdar-expiry-freeze-2026-09-30')

# ---------------------------------------------------------------- text harvests
# (file, family, lang, country, dr_filter, volume_floor, column layout)
TEXT = [
    ('openserp-best-time-en.txt', 'temporal.best-time-to-visit', 'en', 'us', 35, 400, 'kvdc'),
    ('openserp-esim-en.txt', 'commercial.esim', 'en', 'us', 40, 200, 'kvdc'),
    ('openserp-things-to-do-en.txt', 'activities.city-things-to-do', 'en', 'us', 35, 2000, 'kvd'),
    ('openserp-sehenswuerdigkeiten-de.txt', 'activities.city-things-to-do', 'de', 'de', 35, 2000, 'kvd'),
    ('openserp-things-to-do-es-fr.txt', 'activities.city-things-to-do', None, None, 35, None, 'lkvd'),
    ('openserp-visa-en.txt', 'policy.visa', 'en', 'us', 35, 1500, 'ckvdc'),
]

def f(x):
    x = (x or '').strip()
    return None if x in ('', 'None', 'null') else x

def read_text(name, family, lang, country, dr, floor, layout):
    rows = []
    path = os.path.join(MEAS, name)
    if not os.path.exists(path):
        print('  MISSING %s' % name, file=sys.stderr)
        return rows
    for line in open(path):
        line = line.rstrip('\n')
        if not line or line.startswith('#'):
            continue
        p = line.split('|')
        r = {'family': family, 'language': lang, 'country': country,
             'dr_top10_filter': dr, 'volume_floor': floor,
             'source_file': 'data/atlas/measurements/ahrefs-expiry/' + name,
             'parent_topic': '', 'segment': ''}
        try:
            if layout == 'kvdc':
                r.update(keyword=p[0], volume=int(p[1]), kd=f(p[2]), cpc_usd=f(p[3]))
            elif layout == 'kvd':
                r.update(keyword=p[0], volume=int(p[1]), kd=f(p[2]), cpc_usd=None)
            elif layout == 'lkvd':
                r.update(language=p[0], country=p[0], keyword=p[1],
                         volume=int(p[2]), kd=f(p[3]), cpc_usd=None)
            elif layout == 'ckvdc':
                r.update(segment=p[0], keyword=p[1], volume=int(p[2]),
                         kd=f(p[3]), cpc_usd=f(p[4]))
        except (IndexError, ValueError):
            print('  SKIPPED unparsable line in %s: %r' % (name, line), file=sys.stderr)
            continue
        rows.append(r)
    return rows

# ---------------------------------------------------------------- json harvests
JSON = [
    ('poi-categories/openserp-attractions-en.json', 'poi.place-x-attractions', 'en', 'us'),
    ('poi-categories/openserp-cosa-vedere-it-band-150-400.json', 'activities.city-things-to-do', 'it', 'it'),
    ('poi-categories/openserp-place-category-pl.json', 'activities.city-things-to-do', 'pl', 'pl'),
    ('poi-categories/openserp-device-esim-en.json', 'commercial.esim-device-and-carrier', 'en', 'us'),
    ('poi-categories/openserp-distance-pairs-en.json', 'transport.origin-destination-pair', 'en', 'us'),
    ('poi-categories/openserp-food-en.json', 'poi.place-x-food', 'en', 'us'),
    ('poi-categories/openserp-gezilecek-tr-band-150-700.json', 'activities.city-things-to-do', 'tr', 'tr'),
    ('poi-categories/openserp-gyms-coworking-en.json', 'poi.place-x-fitness-and-workspace', 'en', 'us'),
    ('poi-categories/openserp-itinerary-duration-en-corrected.json', 'temporal.place-x-duration', 'en', 'us'),
    ('poi-categories/openserp-itinerary-duration-en.json', 'temporal.place-x-duration.refuted-phrasing', 'en', 'us'),
    ('poi-categories/openserp-outdoor-leisure-en.json', 'poi.place-x-outdoor-leisure', 'en', 'us'),
    ('poi-categories/openserp-place-category-de.json', 'poi.place-x-category', 'de', 'de'),
    ('poi-categories/openserp-place-category-es.json', 'poi.place-x-category', 'es', 'es'),
    ('poi-categories/openserp-place-category-it.json', 'activities.city-things-to-do', 'it', 'it'),
    ('poi-categories/openserp-que-ver-en-es-band-150-700.json', 'activities.city-things-to-do', 'es', 'es'),
    ('poi-categories/openserp-que-ver-en-es-deep.json', 'activities.city-things-to-do', 'es', 'es'),
    ('poi-categories/openserp-sehenswuerdigkeiten-de-band-200-550.json', 'activities.city-things-to-do', 'de', 'de'),
    ('poi-categories/openserp-sehenswuerdigkeiten-de-deep.json', 'activities.city-things-to-do', 'de', 'de'),
    ('poi-categories/openserp-things-to-do-nl.json', 'activities.city-things-to-do', 'nl', 'nl'),
    ('poi-categories/openserp-things-to-do-pt-br.json', 'activities.city-things-to-do', 'pt', 'br'),
    ('poi-categories/openserp-things-to-do-tr.json', 'activities.city-things-to-do', 'tr', 'tr'),
    ('poi-categories/openserp-visa-nationality-en.json', 'policy.visa-nationality-x-destination', 'en', 'us'),
    ('poi-categories/openserp-things-to-do-sv.json', 'activities.city-things-to-do', 'sv', 'se'),
    ('poi-categories/openserp-distance-pairs-de.json', 'transport.origin-destination-pair.refuted', 'de', 'de'),
    ('poi-categories/openserp-route-pairs-en.json', 'transport.origin-destination-pair', 'en', 'us'),
    ('poi-categories/openserp-things-to-do-ja.json', 'activities.city-things-to-do', 'ja', 'jp'),
    ('poi-categories/openserp-things-to-do-en-band-300-2000.json', 'activities.city-things-to-do', 'en', 'us'),
]

def read_json(rel, family, lang, country):
    path = os.path.join(MEAS, rel)
    if not os.path.exists(path):
        print('  MISSING %s' % rel, file=sys.stderr)
        return []
    doc = json.load(open(path))
    meta = doc.get('meta', {})
    dr = 30
    m = re.search(r'serp_domain_rating_top10_min<=(\d+)', meta.get('where', ''))
    if m:
        dr = int(m.group(1))
    m = re.search(r'volume>=(\d+)', meta.get('where', ''))
    floor = int(m.group(1)) if m else None
    out = []
    # the German file carries a place column instead of a full keyword
    collected = list(doc.get('rows', [])) + list(doc.get('place_category_rows', []))
    # Three records are analytic rather than row dumps, because their API response
    # printed inline instead of persisting and only the decisive rows were kept.
    # Their rows live in named sub-lists, so gather those too rather than dropping them.
    for key in ('rows_at_cpc_3_usd_or_more', 'highest_cpc_rows_usd', 'head_rows'):
        collected += list(doc.get(key, []))
    for sub in ('duration_axis_confirmation', 'commercial_note'):
        collected += list((doc.get(sub) or {}).get('rows', []))
    for r in collected:
        kw = r.get('keyword')
        if kw is None and r.get('category') and r.get('place'):
            kw = '%s in %s' % (r['category'], r['place'])
        cents = r.get('cpc') if r.get('cpc') is not None else r.get('cpc_cents')
        if cents is None and r.get('cpc_usd') is not None:
            cents = round(float(r['cpc_usd']) * 100)
        out.append({
            'family': family, 'language': lang, 'country': country,
            'keyword': kw, 'volume': r.get('volume'),
            'kd': r.get('difficulty') if r.get('difficulty') is not None else r.get('kd'),
            'cpc_usd': None if cents is None else round(cents / 100.0, 2),
            'parent_topic': r.get('parent_topic') or '',
            'segment': r.get('note') or r.get('collision_class') or '',
            'dr_top10_filter': dr, 'volume_floor': floor,
            'source_file': 'data/atlas/measurements/ahrefs-expiry/' + rel,
        })
    return out

rows = []
print('reading harvests')
for spec in TEXT:
    got = read_text(*spec)
    print('  %-40s %4d rows' % (spec[0], len(got)))
    rows += got
for spec in JSON:
    got = read_json(*spec)
    print('  %-40s %4d rows' % (os.path.basename(spec[0]), len(got)))
    rows += got

os.makedirs(OUT, exist_ok=True)
p = os.path.join(OUT, 'SERP-OPENNESS-OPPORTUNITIES.csv')
cols = ['family', 'language', 'country', 'segment', 'keyword', 'volume',
        'keyword_difficulty', 'cpc_usd', 'parent_topic',
        'dr_top10_filter', 'volume_floor', 'source_file']
with open(p, 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(cols)
    for r in sorted(rows, key=lambda x: (x['family'], -(x['volume'] or 0))):
        w.writerow([r['family'], r['language'] or '', r['country'] or '', r['segment'],
                    r['keyword'], r['volume'], r['kd'] if r['kd'] is not None else '',
                    r['cpc_usd'] if r['cpc_usd'] is not None else '',
                    r['parent_topic'], r['dr_top10_filter'],
                    r['volume_floor'] if r['volume_floor'] is not None else ''])
print('\nwrote %s with %d rows' % (p, len(rows)))

by = defaultdict(list)
for r in rows:
    by[(r['family'], r['language'])].append(r)
print('\n%-44s %-4s %6s %12s %6s %6s' % ('family', 'lang', 'rows', 'volume', 'kd<=10', 'medKD'))
for k in sorted(by):
    g = by[k]
    kd = [int(x['kd']) for x in g if x['kd'] not in (None, '')]
    print('%-44s %-4s %6d %12d %6d %6s' % (
        k[0], k[1] or '-', len(g), sum(x['volume'] or 0 for x in g),
        sum(1 for x in kd if x <= 10),
        ('%.0f' % statistics.median(kd)) if kd else '-'))
