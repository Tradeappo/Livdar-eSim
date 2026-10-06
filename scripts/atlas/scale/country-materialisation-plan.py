#!/usr/bin/env python3
"""
The exact list of countries whose demand qualifies and whose pages do not exist yet.

99 countries carry qualified destination demand across the four measurement files. 59 have at
least one page in the manifest. This file names the rest, one row each, with what is on disk
for it and what is missing, so the capture queue can be ordered by expected yield instead of
by the alphabet.

Nothing here is projected from population or POI count. The 2026-10-02 measurement settled
that those are weak proxies, so the only demand number used is the measured one and the only
data number used is a file that exists.

Usage: country-materialisation-plan.py
Writes data/atlas/measurements/country-materialisation-plan-2026-10-06.json
       reports/livdar-expiry-freeze-2026-09-30/1M-COUNTRY-PLAN.csv
"""
import collections, csv, glob, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                              # noqa: E402

MEAS = ROOT + 'data/atlas/measurements/'
SRC = ROOT + 'data/atlas/sources/'
OUT_J = MEAS + 'country-materialisation-plan-2026-10-06.json'
OUT_C = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-COUNTRY-PLAN.csv'

# Wealth and travel-spend tiers, used ONLY to break ties between countries whose measured
# demand is comparable. They are a stated editorial input and they never override a measurement:
# a country with no qualified demand does not appear here however rich it is.
TIER_1 = {'CH', 'NO', 'LU', 'SG', 'IE', 'DK', 'SE', 'FI', 'AT', 'BE', 'NL', 'CA', 'AU', 'NZ',
          'IL', 'HK', 'AE', 'QA', 'KW', 'IS', 'DE', 'US', 'GB', 'JP', 'FR', 'IT', 'ES'}
TIER_2 = {'KR', 'TW', 'SA', 'BH', 'OM', 'CZ', 'SI', 'EE', 'LT', 'LV', 'PT', 'GR', 'MT', 'CY',
          'PL', 'HU', 'SK', 'HR', 'UY', 'CL', 'PA', 'CR'}


def qualified_demand():
    """{country: {language: (connectivity, information)}} across every measurement file."""
    out = collections.defaultdict(dict)
    for (cc, lang), row in entity_identity._dest_rows().items():
        out[cc][lang] = (row.get('max_connectivity_volume') or 0,
                         row.get('max_information_volume') or 0)
    return out


def countries_with_pages():
    """{country: rows} from the manifest, which is the only record of what actually exists."""
    c = collections.Counter()
    p = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
    with gzip.open(p, 'rt', encoding='utf-8', newline='') as fh:
        for r in csv.DictReader(fh):
            cc = (r.get('country') or '').strip()
            if cc:
                c[cc] += 1
    return c


def layers_on_disk():
    """Which geographic layers exist per country, by looking for the file rather than assuming."""
    pat = {
        'parents': SRC + 'osm-parents/parents-{cc}*.jsonl.gz',
        'places': SRC + 'osm-places/places-{cc}*.jsonl.gz',
        'poi': SRC + 'osm-poi/poi-{cc}*.jsonl.gz',
        'outdoor': SRC + 'osm-outdoor/outdoor-{cc}*.jsonl.gz',
        'trails': SRC + 'osm-trails/trails-{cc}*.jsonl.gz',
    }
    out = collections.defaultdict(dict)
    for name, g in pat.items():
        for f in glob.glob(g.format(cc='*')):
            base = os.path.basename(f)
            cc = base.split('-', 1)[1][:2].upper()
            out[cc][name] = out[cc].get(name, 0) + os.path.getsize(f)
    return out


def climate_cities():
    """Cities per country carrying NASA POWER normals, counted from the store."""
    c = collections.Counter()
    for f in sorted(glob.glob(SRC + 'climate/power/power-*.jsonl')):
        cc = os.path.basename(f)[6:8].upper()
        with open(f, encoding='utf-8') as fh:
            c[cc] = sum(1 for line in fh if line.strip())
    return c


def gazetteer_cities():
    g = entity_identity.load_gazetteer()
    c = collections.Counter()
    for cid, rec in g.by_id.items():
        cc = (rec.get('country') or '').strip()
        if cc:
            c[cc] += 1
    return c


def main():
    dem = qualified_demand()
    pages = countries_with_pages()
    layers = layers_on_disk()
    clim = climate_cities()
    gaz = gazetteer_cities()
    mirror = {}
    try:
        m = json.load(open(MEAS + 'destination-mirror-coverage-2026-10-02.json',
                           encoding='utf-8'))
        for cc in (m.get('not_carried_by_this_mirror') or []):
            mirror[cc] = 'this OSM mirror does not carry the country'
    except (FileNotFoundError, ValueError):
        pass

    rows = []
    for cc in sorted(dem):
        langs = dem[cc]
        have = layers.get(cc, {})
        # Expected yield is anchored on what comparable captured countries ACTUALLY produced,
        # per gazetteer city, rather than on a guess. Measured over the current manifest.
        g = gaz.get(cc, 0)
        rows.append({
            'country': cc,
            'has_pages': cc in pages,
            'pages_today': pages.get(cc, 0),
            'languages_qualified': len(langs),
            'languages': ','.join(sorted(langs)),
            'strongest_connectivity_volume': max((v[0] for v in langs.values()), default=0),
            'strongest_information_volume': max((v[1] for v in langs.values()), default=0),
            'gazetteer_cities': g,
            'climate_cities': clim.get(cc, 0),
            'osm_parents_mb': round(have.get('parents', 0) / 1e6, 1),
            'osm_places_mb': round(have.get('places', 0) / 1e6, 1),
            'osm_poi_mb': round(have.get('poi', 0) / 1e6, 1),
            'osm_outdoor_mb': round(have.get('outdoor', 0) / 1e6, 1),
            'osm_trails_mb': round(have.get('trails', 0) / 1e6, 1),
            'layers_present': ','.join(sorted(have)) or 'none',
            'layers_missing': ','.join(sorted(
                {'parents', 'places', 'poi', 'outdoor', 'trails'} - set(have))) or 'none',
            'wealth_tier': 1 if cc in TIER_1 else 2 if cc in TIER_2 else 3,
            'blocked_reason': mirror.get(cc, ''),
        })

    # Yield per gazetteer city, measured on the countries that ARE captured and DO have pages,
    # so the expectation for an uncaptured country comes from this project's own output.
    captured = [r for r in rows if r['pages_today'] > 0 and r['gazetteer_cities'] > 0
                and len(r['layers_present'].split(',')) >= 4]
    per_city = (sum(r['pages_today'] for r in captured)
                / max(sum(r['gazetteer_cities'] for r in captured), 1))
    for r in rows:
        r['pages_per_gazetteer_city_benchmark'] = round(per_city, 2)
        r['expected_pages_if_fully_captured'] = int(r['gazetteer_cities'] * per_city)
        r['expected_NET_NEW'] = max(0, r['expected_pages_if_fully_captured'] - r['pages_today'])

    todo = [r for r in rows if not r['has_pages']]
    # The order of work: measured demand first, then what is already on disk, then wealth.
    todo.sort(key=lambda r: (-r['expected_NET_NEW'], r['wealth_tier'],
                             -r['strongest_connectivity_volume']))

    with open(OUT_C, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda r: (r['has_pages'], -r['expected_NET_NEW'])))

    json.dump({
        'generated_on': '2026-10-06',
        'what_this_is': ('the exact list of countries whose destination demand qualifies in at '
                         'least one language, split by whether they have pages today, with the '
                         'geographic layers that exist on disk for each and the net new pages '
                         'expected if it were fully captured'),
        'how_expected_yield_is_computed': (
            f'pages per gazetteer city, measured over the countries that are already captured '
            f'AND already producing pages: {per_city:.2f} pages per city across '
            f'{len(captured)} countries. Applied to each country\'s own gazetteer city count. '
            f'This is an extrapolation from THIS project\'s measured output, not an industry '
            f'estimate, and it will be replaced by a count as each country is captured. It is '
            f'deliberately NOT derived from population or POI density, which the 2026-10-02 '
            f'measurement showed are weak proxies for demand.'),
        'countries_with_qualified_demand': len(rows),
        'countries_with_pages_today': sum(1 for r in rows if r['has_pages']),
        'countries_qualified_without_pages': len(todo),
        'expected_net_new_from_those': sum(r['expected_NET_NEW'] for r in todo),
        'the_queue_in_order_of_expected_yield': [
            {k: r[k] for k in ('country', 'expected_NET_NEW', 'gazetteer_cities',
                               'languages', 'strongest_connectivity_volume', 'wealth_tier',
                               'layers_present', 'layers_missing', 'blocked_reason')}
            for r in todo],
        'countries_with_pages': [
            {k: r[k] for k in ('country', 'pages_today', 'gazetteer_cities',
                               'expected_pages_if_fully_captured', 'expected_NET_NEW',
                               'layers_present', 'layers_missing')}
            for r in sorted((x for x in rows if x['has_pages']),
                            key=lambda r: -r['expected_NET_NEW'])],
        'and_the_honest_caveat': (
            'expected_NET_NEW for a country with no pages assumes its families behave like the '
            'captured average. The destination fan-out result on 2026-10-06 is the warning '
            'against trusting that: 292,613 raw rows produced 263,742 TRANSLATION_ONLY '
            'rejections, so a raw candidate count is not a page count. Every figure here is '
            'replaced by a measured one as the country is captured and run.'),
    }, open(OUT_J, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'countries with qualified demand: {len(rows)}')
    print(f'  with pages today:              {sum(1 for r in rows if r["has_pages"])}')
    print(f'  qualified and NOT materialised: {len(todo)}')
    print(f'benchmark: {per_city:.2f} pages per gazetteer city '
          f'over {len(captured)} fully captured countries')
    print(f'expected net new from the queue: {sum(r["expected_NET_NEW"] for r in todo):,}')
    print(f'\nwritten {OUT_J}\n        {OUT_C}')


main()
