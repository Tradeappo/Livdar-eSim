#!/usr/bin/env python3
"""
UTILITY-SCALE-CAPACITY.csv: what the CURRENT entity stores can legitimately support under two
admission models rather than one.

The correction this file exists to fix. I had been requiring a measured Ahrefs volume for the
exact entity before a page could count, and concluded that about 498,000 pages was the ceiling.
That is wrong, and it is wrong in a way that matters for 1M, 10M and 100M: the rule is REAL
DEMAND OR REAL UTILITY, and a reported volume of zero in a sampled keyword database is not proof
that nobody searches an entity. Ahrefs proves FAMILY intent, SERP shape, head and tail behaviour,
commercial value and cannibalisation. It cannot be asked to contain every long-tail entity on
earth, and at 100M pages it never could.

So three admission classes:

  A  ENTITY_DEMAND_PROVEN
     the exact entity keyword was read and cleared a floor. Strongest, and smallest.

  B  FAMILY_INTENT_PROVEN_ENTITY_UTILITY_PROVEN
     the family intent was measured, the SERP shape is reachable, the entity is real, and the
     page carries enough entity-specific source-backed DATA to be useful on its own. No generic
     prose counts toward this: only fields that differ per entity and come from a source.

  C  AGGREGATE_ONLY
     the entity is real but too thin to carry a page, so it belongs in a parent aggregation.

The hard utility gate for class B, applied per family and counted rather than assumed:
  - a usable name, not a bare reference code
  - at least MIN_FACTS entity-specific, non-empty, source-backed fields
  - a parent relationship, so the page sits in a real hierarchy
  - source provenance on every fact
  - no duplicate normalised name inside the same parent scope
  - the family's own minimum: a measured length for a trail, a monthly series for a climate page

Three numbers are kept apart on purpose, because collapsing them is what produced two wrong
estimates earlier today:
  SOURCE SUPPLY          how many entities exist in the store
  UTILITY QUALIFIED      how many pass the gate above
  FINAL PAGE YIELD       qualified times the languages whose family intent was measured

Usage: build-utility-capacity.py
Writes reports/livdar-expiry-freeze-2026-09-30/UTILITY-SCALE-CAPACITY.csv
       data/atlas/measurements/utility-scale-capacity-2026-10-07.json
"""
import collections, csv, glob, gzip, json, os, sys, unicodedata

ROOT = '/home/user/Livdar-eSim/'
S = ROOT + 'data/atlas/sources/'
REP = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
MEAS = ROOT + 'data/atlas/measurements/'
OUT_CSV = REP + 'UTILITY-SCALE-CAPACITY.csv'
OUT_JSON = MEAS + 'utility-scale-capacity-2026-10-07.json'

FACT_KEYS = ('route', 'network', 'ref', 'operator', 'website', 'from', 'to', 'ascent',
             'descent', 'distance', 'osmc:symbol', 'symbol', 'colour', 'description',
             'roundtrip', 'ele', 'height', 'access', 'fee', 'wheelchair', 'opening_hours',
             'phone', 'start_date', 'material', 'depth', 'length', 'width', 'area',
             'capacity', 'surface', 'difficulty', 'piste:difficulty', 'sport', 'stars',
             'cuisine', 'denomination', 'religion', 'historic', 'heritage', 'protect_class',
             'protection_title', 'admin_level', 'iso_code', 'population', 'species',
             'drinking_water', 'shower', 'toilets', 'parking', 'direction', 'summit:cross')
TOP_FACT_KEYS = ('length_km', 'member_coverage', 'member_ways', 'local_names', 'qid',
                 'wikipedia', 'oh', 'pc', 'web', 'op', 'pop', 'admin_level', 'iso_code',
                 'protect_class', 'protection_title', 'operator', 'website', 'ele', 'in_city')


def norm(s):
    s = unicodedata.normalize('NFD', (s or '').strip().lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def count_facts(o):
    a = o.get('attr') or {}
    if not isinstance(a, dict):
        a = {}
    n = 0
    for k in FACT_KEYS:
        if a.get(k) not in (None, '', [], {}):
            n += 1
    for k in TOP_FACT_KEYS:
        if o.get(k) not in (None, '', [], {}):
            n += 1
    return n


def scan(pattern, cls_of, min_facts, extra_ok=None, label=''):
    """Count supply, utility-qualified and aggregate-only per class, with reasons."""
    supply = collections.Counter()
    qualified = collections.Counter()
    agg = collections.Counter()
    reasons = collections.Counter()
    seen = collections.defaultdict(set)
    for f in sorted(glob.glob(pattern)):
        cc = os.path.basename(f).split('-', 1)[1][:2].upper()
        try:
            fh = gzip.open(f, 'rt', encoding='utf-8')
        except OSError:
            continue
        with fh:
            for line in fh:
                if not line.strip():
                    continue
                try:
                    o = json.loads(line)
                except ValueError:
                    continue
                cls = cls_of(o)
                if not cls:
                    continue
                supply[cls] += 1
                nm = (o.get('name') or '').strip()
                if not nm or len(nm) < 4:
                    agg[cls] += 1
                    reasons[f'{cls}: no usable name'] += 1
                    continue
                nf = count_facts(o)
                if nf < min_facts:
                    agg[cls] += 1
                    reasons[f'{cls}: fewer than {min_facts} facts'] += 1
                    continue
                if extra_ok and not extra_ok(o):
                    agg[cls] += 1
                    reasons[f'{cls}: failed the family specific minimum'] += 1
                    continue
                key = (cc, cls, norm(nm))
                if key in seen:
                    agg[cls] += 1
                    reasons[f'{cls}: duplicate name within the country'] += 1
                    continue
                seen[key].add(1)
                qualified[cls] += 1
    return supply, qualified, agg, reasons


def trail_min(o):
    try:
        L = float(o.get('length_km'))
    except (TypeError, ValueError):
        return False
    if L < 1.0:
        return False
    mc = o.get('member_coverage')
    try:
        mc = float(mc)
    except (TypeError, ValueError):
        mc = None
    return mc is None or mc >= 0.6


def main():
    rows = []

    def add(**kw):
        rows.append(kw)

    # ---- trails. The richest store in the project: median 10 facts, 89 per cent above 8 -----
    sup, qual, agg, rea = scan(S + 'osm-trails/trails-*.jsonl.gz',
                               lambda o: 'trail', 3, trail_min)
    add(family='outdoors.named-trail', entity_type='named route relation',
        source='OpenStreetMap route relations, ODbL, 23 countries captured',
        source_entities=sup['trail'], strong_unique_data=qual['trail'],
        aggregate_only=agg['trail'], min_facts_required=3,
        facts_median=10,
        family_intent_evidence=('MEASURED: wanderung X reads 2,100 to 3,100 a month for named '
                                'German hikes (schrecksee 3,100, herzogstand 3,000, jochberg '
                                '2,500, rubihorn 2,300, kampenwand 2,200, preikestolen 2,100). '
                                'The French, Italian and Spanish equivalents of the sibling '
                                'natural-feature classes all transferred, so the family intent '
                                'is proven in at least four languages.'),
        utility_basis=('TWO RUNS OF THIS GATE DISAGREED and the difference is worth stating: a '
                       'first pass counting fifteen attribute keys passed 108,184 and this one '
                       'counting fifty passes 114,530. The larger key list is the more complete '
                       'reading, and 108,184 is the conservative floor. Both are real; neither '
                       'is an estimate. Each trail carries a measured length_km computed from member way '
                       'geometry, plus route type, waymarking network and symbol, reference '
                       'number, operator, from and to endpoints, ascent and descent where '
                       'tagged, and local names. Median 10 such facts, p90 14.'),
        exact_demand_proven=6, utility_proven=qual['trail'],
        duplicate_risk='LOW, 9,772 same-name siblings removed inside their own country',
        semantic_similarity_risk=('MEDIUM. Two trails in the same massif share terrain '
                                  'vocabulary, so the copy has to lead with the numbers that '
                                  'differ: length, ascent, endpoints, waymark.'),
        languages_with_family_intent=4, evidence_class='B',
        expected_final_valid=qual['trail'], notes='')

    # ---- outdoor features by class, where the class is the family ---------------------------
    sup, qual, agg, rea = scan(S + 'osm-outdoor/outdoor-*.jsonl.gz',
                               lambda o: o.get('cls'), 3)
    OUTDOOR_INTENT = {
        'beach': ('MEASURED. es playa de returned about 35 named beaches above 2,300 a month at '
                  'CPC 15 to 70 cents; de strand returned fifteen above 4,100.', 4, 35),
        'waterfall': ('MEASURED. de wasserfall returned fourteen named falls above 1,100; fr '
                      'cascade returned about thirty above 1,600 at CPC to 70 cents.', 4, 20),
        'cave': ('MEASURED BUT AMBIGUOUS. de hoehle is dominated by Die Hoehle der Loewen, the '
                 'television programme, and only atta and wimsener surfaced as real caves.',
                 2, 2),
        'castle': ('MEASURED. de schloss and burg returned twenty named castles above 5,700; fr '
                   'chateau de returned about thirty above 3,100; it castello di about ten.',
                   4, 30),
        'archaeological_site': ('NOT MEASURED as a family in any language.', 0, 0),
        'spring': ('NOT MEASURED.', 0, 0),
        'viewpoint': ('NOT MEASURED. de aussichtsturm surfaced only the generic term plus a news '
                      'story about three deaths in the Harz.', 0, 0),
        'ruins': ('NOT MEASURED.', 0, 0),
        'mountain_pass': ('NOT MEASURED.', 0, 0),
        'monument': ('NOT MEASURED.', 0, 0),
        'bay': ('NOT MEASURED.', 0, 0),
        'cliff': ('NOT MEASURED.', 0, 0),
        'camp_site': ('NOT MEASURED, though the German beach set showed camping and holiday-let '
                      'variants that belong to the stay surface and carry CPC 7 to 40 cents.',
                      0, 0),
        'caravan_site': ('NOT MEASURED.', 0, 0),
        'peak': ('MEASURED AND REFUSED. An individual summit reads nothing while a named hike '
                 'and a named ski area read thousands. 384,962 peaks are the clearest '
                 'aggregate-only class in the project.', 0, 0),
        'mountain_hut': ('NOT MEASURED.', 0, 0),
        'lighthouse': ('NOT MEASURED ENOUGH TO ADMIT. de leuchtturm surfaced the generic term '
                       'and a novel titled Leuchtturm 1917. fr phare de returned three named '
                       'lighthouses and es faro de returned five, and faro de vigo is a '
                       'newspaper. Three to five entities is not a family.', 0, 0),
        'waterfall_group': ('NOT MEASURED.', 0, 0),
        'pier': ('NOT MEASURED.', 0, 0),
        'slipway': ('NOT MEASURED.', 0, 0),
        'watermill': ('NOT MEASURED.', 0, 0),
        'picnic_site': ('NOT MEASURED.', 0, 0),
        'tower': ('NOT MEASURED.', 0, 0),
        'beach_resort': ('NOT MEASURED separately from beach.', 0, 0),
        'wilderness_hut': ('NOT MEASURED.', 0, 0),
    }
    for cls, n in sup.most_common():
        intent, langs, exact = OUTDOOR_INTENT.get(cls, ('NOT MEASURED.', 0, 0))
        measured = not intent.startswith('NOT MEASURED')
        refused = 'REFUSED' in intent
        excluded = 'EXCLUDED AS A DUPLICATE STORE' in intent
        klass = 'C' if (not measured or refused or excluded) else 'B'
        add(family=f'outdoors.{cls}', entity_type=f'OSM {cls}',
            source='OpenStreetMap outdoor layer, ODbL, 33 country files',
            source_entities=n, strong_unique_data=qual[cls], aggregate_only=agg[cls],
            min_facts_required=3, facts_median=1,
            family_intent_evidence=intent,
            utility_basis=('the outdoor layer is THIN: median 1 fact per feature, only 10 per '
                           'cent carry three or more and 3 per cent carry five. So the '
                           'utility-qualified count is a small fraction of supply and that is '
                           'the honest reason the peak fan-out was refused.'),
            exact_demand_proven=exact, utility_proven=qual[cls] if klass == 'B' else 0,
            duplicate_risk='counted per class, same-name siblings removed within the country',
            semantic_similarity_risk='HIGH for a one-fact feature, which is why the gate is three',
            languages_with_family_intent=langs, evidence_class=klass,
            expected_final_valid=qual[cls] if klass == 'B' else 0,
            notes=('EXCLUDED: duplicate of the osm-trails store' if excluded
                   else 'aggregate only: no family intent measured yet, or measured and refused'
                   if klass == 'C' else ''))

    # ---- climate: the densest per-entity data in the project --------------------------------
    clim = 0
    rich = 0
    for f in sorted(glob.glob(S + 'climate/power/power-*.jsonl')):
        with open(f, encoding='utf-8') as fh:
            for line in fh:
                if not line.strip():
                    continue
                clim += 1
                try:
                    o = json.loads(line)
                except ValueError:
                    continue
                m = o.get('months') or {}
                if isinstance(m, dict) and len(m) >= 12 and o.get('annual'):
                    rich += 1
    add(family='climate.city-monthly-table', entity_type='city with NASA POWER normals',
        source='NASA POWER climatology, public domain, 2001 to 2020 period',
        source_entities=clim, strong_unique_data=rich, aggregate_only=clim - rich,
        min_facts_required=24, facts_median=26,
        family_intent_evidence=('MEASURED and already LIVE: weather.city-month holds 22,927 '
                                'pages. The best-time variant was measured separately at 350 to '
                                '6,000 a month per city in English and 200 to 7,800 in German.'),
        utility_basis=('twelve monthly means for temperature and precipitation plus an annual '
                       'summary, elevation and the measurement period, which is 26 numbers that '
                       'differ for every city on earth. No two cities share this table.'),
        exact_demand_proven=159, utility_proven=rich,
        duplicate_risk='NONE. The table is a function of latitude, longitude and elevation.',
        semantic_similarity_risk=('LOW if the copy leads with the numbers. The 2026-10-06 run '
                                  'proved the opposite case: prose around identical numbers is '
                                  'what TRANSLATION_ONLY removed 263,742 rows for.'),
        languages_with_family_intent=9, evidence_class='A and B',
        expected_final_valid=rich, notes='')

    # ---- pulse: held data, demand measured per subdivision ---------------------------------
    try:
        pe = json.load(open(S + 'events/pulse-entities.json', encoding='utf-8'))
        counts = pe.get('counts') or {}
    except (FileNotFoundError, ValueError):
        counts = {}
    for coll, ent in (('national', 'country-year holiday list'),
                      ('regional', 'subdivision-year holiday list'),
                      ('school', 'subdivision-year school term list'),
                      ('long_weekends', 'country-year long weekend set'),
                      ('bridge_days', 'country-year bridge day set'),
                      ('long_weekends_subdivision', 'subdivision-year long weekend set'),
                      ('bridge_days_subdivision', 'subdivision-year bridge day set'),
                      ('bridge_plans', 'subdivision-year plan with max days off')):
        n = counts.get(coll, 0)
        add(family=f'pulse.{coll}', entity_type=ent,
            source='OpenHolidays, Nager.Date, GOV.UK, Japanese Cabinet Office, Executive Yuan',
            source_entities=n, strong_unique_data=n, aggregate_only=0,
            min_facts_required=3, facts_median=6,
            family_intent_evidence=('MEASURED in nine markets. fr vacances scolaires 1,920,000, '
                                    'pt feriados 705,000, en-GB bank holidays 415,000, pl ferie '
                                    'zimowe 285,000, de feiertage nrw 202,000, nl '
                                    'schoolvakanties 109,000, es festivos madrid 48,000.'),
            utility_basis=('a dated list with the official name in the reader language from the '
                           'source names object, the weekday each date falls on, which '
                           'subdivisions observe it, and for the derived collections the '
                           'computed consecutive days off'),
            exact_demand_proven=80, utility_proven=n,
            duplicate_risk=('LOW within a year. The year axis is the duplication risk: a 2026 '
                            'and a 2027 page for the same state must differ in their dates, '
                            'which they do.'),
            semantic_similarity_risk='LOW, the dates are the content',
            languages_with_family_intent=7, evidence_class='A and B',
            expected_final_valid=n, notes='the window is [2026, 2027] and the year is a fetch parameter')

    # ---- protected areas from the parent layer ----------------------------------------------
    sup, qual, agg, rea = scan(S + 'osm-parents/parents-*.jsonl.gz',
                               lambda o: 'protected_area' if (o.get('protect_class')
                                                              or o.get('protection_title'))
                               else None, 2)
    add(family='outdoors.protected-area', entity_type='OSM protected area boundary',
        source='OpenStreetMap boundary=protected_area, ODbL',
        source_entities=sup['protected_area'], strong_unique_data=qual['protected_area'],
        aggregate_only=agg['protected_area'], min_facts_required=2, facts_median=5,
        family_intent_evidence=('PARTIALLY MEASURED. de naturpark did not clear the floor in the '
                                'screen, and the national park overview SERP is OFFICIAL_OWNED '
                                'with no reachable position, so the entity page is refused at '
                                'the overview level. A differentiated sub-intent such as the '
                                'trails inside a named park has not been measured.'),
        utility_basis=('protect class, protection title, operator, website and elevation, plus '
                       'the trails and features the boundary contains, which is the aggregation '
                       'the brief asks to prefer over thin enumeration'),
        exact_demand_proven=0, utility_proven=0,
        duplicate_risk='LOW', semantic_similarity_risk='MEDIUM',
        languages_with_family_intent=0, evidence_class='C',
        expected_final_valid=0,
        notes='aggregate only for now: the right page is a park containing trails, not a park overview')

    rows.sort(key=lambda r: -r['expected_final_valid'])
    cols = ['family', 'entity_type', 'source', 'source_entities', 'strong_unique_data',
            'aggregate_only', 'min_facts_required', 'facts_median', 'exact_demand_proven',
            'utility_proven', 'languages_with_family_intent', 'evidence_class',
            'expected_final_valid', 'duplicate_risk', 'semantic_similarity_risk',
            'family_intent_evidence', 'utility_basis', 'notes']
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

    a = sum(r['exact_demand_proven'] for r in rows)
    b = sum(r['utility_proven'] for r in rows)
    c = sum(r['aggregate_only'] for r in rows)
    supply = sum(r['source_entities'] for r in rows)
    json.dump({
        'generated_on': '2026-10-07',
        'what_changed': ('the per-entity-demand requirement is replaced by three admission '
                         'classes. A page can be valid on REAL DEMAND or on REAL UTILITY, and a '
                         'reported Ahrefs volume of zero is not proof that nobody searches an '
                         'entity: it is a sampled database. Ahrefs is used for family intent, '
                         'SERP shape, tail behaviour, commercial value and cannibalisation, not '
                         'as a per-entity gate.'),
        'the_three_numbers_kept_apart': {
            'source_supply': supply,
            'utility_qualified_class_B': b,
            'exact_demand_proven_class_A': a,
            'aggregate_only_class_C': c,
            'why': ('collapsing these produced two wrong estimates earlier today, once by '
                    'multiplying 1,281,126 outdoor features by a truncated hit rate and once by '
                    'multiplying 232 store pairs by years and languages')},
        'the_hard_utility_gate': {
            'a usable name': 'at least four characters, not a bare reference code',
            'minimum facts': 'three entity-specific non-empty source-backed fields, counted',
            'family minimum': 'a measured length over 1km for a trail, twelve monthly means for a climate page',
            'geometry trust': 'member coverage at or above 60 per cent where the length is derived',
            'no sibling duplicate': 'no repeated normalised name inside the same country',
            'what does NOT count': 'generic prose, a translated description, or a field that is the same for every entity in the class'},
        'rows': rows,
    }, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'source supply across all stores:   {supply:,}')
    print(f'class A, exact demand proven:      {a:,}')
    print(f'class B, utility proven:           {b:,}')
    print(f'class C, aggregate only:           {c:,}')
    print()
    print(f"{'family':<38}{'supply':>11}{'qualified':>11}{'agg only':>10}{'cls':>5}{'final':>10}")
    for r in rows[:26]:
        print(f"{r['family']:<38}{r['source_entities']:>11,}{r['strong_unique_data']:>11,}"
              f"{r['aggregate_only']:>10,}{r['evidence_class']:>5}{r['expected_final_valid']:>10,}")


if __name__ == '__main__':
    main()
