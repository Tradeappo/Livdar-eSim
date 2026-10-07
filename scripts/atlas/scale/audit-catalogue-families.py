#!/usr/bin/env python3
"""
CATALOGUE-FAMILY-AUDIT.csv: every family in the catalogue, classified by WHY it yields what it
yields, so the legitimate capacity already sitting in the data model is visible.

The eight classes, which are the brief's:
  DATA_HELD_BUT_GATE_BUG        the data is on disk and a gate defect, not a quality judgement,
                                is what rejects it
  DATA_HELD_INTENT_UNMEASURED   the data is on disk and no keyword reading exists yet
  DATA_HELD_UTILITY_POSSIBLE    the data is on disk, the intent is unproven, but the per-entity
                                data would carry a class B page if the family intent were read
  CORRECTLY_REJECTED            measured and refused on substance
  CANNIBALIZATION               a live family already owns the parent topic
  SERP_BLOCKED                  the SERP is official or aggregator owned with no reachable slot
  SOURCE_MISSING                source_state is MISSING_ACQUIRABLE: no source, no final
  AGGREGATE_INSTEAD             the entity is real but too thin; it belongs in a parent

Usage: audit-catalogue-families.py
Writes reports/livdar-expiry-freeze-2026-09-30/CATALOGUE-FAMILY-AUDIT.csv
"""
import collections, csv, gzip, json, os

ROOT = '/home/user/Livdar-eSim/'
REP = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
CAT = ROOT + 'reports/livdar-master-seo-universe-2026-09-30/FAMILY-MASTER.csv'
OUT = REP + 'CATALOGUE-FAMILY-AUDIT.csv'

# Measured verdicts from 2026-10-06 and 2026-10-07, each traceable to a measurement file.
MEASURED = {
    'weather.city-best-time': ('DATA_HELD_BUT_GATE_BUG',
        'two duplicated rows in 08-SERP-EVIDENCE.csv carrying the keywords wetter konstanz and '
        'spokane weather, filed under this family with a reason column reading "sampled no", set '
        'the class to SERP_FEATURE_SUPPRESSED and rejected all 29,210 rows. Resampled on the '
        'right intent there is no knowledge card and a DR 9 page with zero backlinks holds '
        'position 8. FIXED.'),
    'climate.city-annual': ('CANNIBALIZATION',
        'the parent topic of X climate points to the city itself, to meteo, to klimatabelle or to '
        'the best-time intent in eleven of fifteen English readings and nearly every German, '
        'French and Italian one. weather.city-month holds 22,927 pages from the same store.'),
    'climate.city-day': ('CORRECTLY_REJECTED',
        'the entity is city-date and the only source is MONTHLY normals. A daily figure derived '
        'from a monthly mean is a precision the source does not carry.'),
    'destinations.city-hub': ('CANNIBALIZATION',
        'X travel guide reads 250 to 2,400 in en-US but its parent topics are things to do in '
        'bangkok, visiting paris and what to see in rome, which activities.city-things-to-do '
        'holds with 30,040 pairs. Dead outside English: X reisefuehrer reads 10 in German.'),
    'destinations.country-hub': ('DATA_HELD_BUT_GATE_BUG',
        'one declared source field. urlaub in X reads 2,000 to 4,900 a month in German at CPC 25 '
        'to 60 cents across sixteen countries, the best commercial band of any travel family '
        'measured. Holds 11 pages against that.'),
    'pulse.country-holidays': ('DATA_HELD_BUT_GATE_BUG',
        'required_data is EMPTY so uniqueness_reason returned an empty string. Data HELD: 1,081 '
        'national records over 43 countries with localised names. pt feriados 2026 reads 705,000.'),
    'pulse.subdivision-holidays': ('DATA_HELD_BUT_GATE_BUG',
        'empty required_data. 623 regional records held. de feiertage nrw 2026 reads 202,000 and '
        'ferien-nrw.com holds position 9 at DOMAIN RATING 1 with zero backlinks.'),
    'pulse.long-weekends': ('DATA_HELD_BUT_GATE_BUG',
        'empty required_data. 687 records held plus 3,539 subdivision records. de brueckentage '
        '2026 reads 18,000 and pt feriados prolongados 19,000.'),
    'pulse.named-holiday-date': ('DATA_HELD_BUT_GATE_BUG',
        'empty required_data, 8,648 rows lost. The dated records are held; the per holiday-name '
        'intent has not been read separately, so this is a gate bug plus an unmeasured intent.'),
    'pulse.named-holiday-regions': ('DATA_HELD_BUT_GATE_BUG', 'empty required_data, 3,115 rows lost.'),
    'pulse.subdivision-holidays-x': ('DATA_HELD_BUT_GATE_BUG', 'empty required_data.'),
    'pulse.school-holidays': ('SOURCE_MISSING',
        'MISSING_ACQUIRABLE for the full set. 1,502 school records over 232 country-subdivision '
        'pairs ARE held from OpenHolidays covering 31 countries, and fr vacances scolaires 2026 '
        'reads 1,920,000, the largest keyword in the project. So it is partly held and partly '
        'missing, and the missing part is each education ministry.'),
    'pulse.bridge-days-subdivision': ('DATA_HELD_INTENT_UNMEASURED',
        'never generated a row. 1,052 subdivision bridge days and 348 bridge plans with a '
        'computed max_days_off are held. de brueckentage 2026 nrw reads 9,900.'),
    'pulse.today': ('CORRECTLY_REJECTED', 'a page that changes daily cannot be a static candidate.'),
    'calendar.year': ('AGGREGATE_INSTEAD',
        'calendar 2026 reads 766,000 but the axis is 22 rows: one per market per year. Enormous '
        'volume, no page count, and the brief says not to count tools as a scale path.'),
    'calendar.month': ('AGGREGATE_INSTEAD', 'as above, 264 rows.'),
    'calendar.week-numbers': ('AGGREGATE_INSTEAD', 'as above, 22 rows.'),
    'work.city-jobs': ('SERP_BLOCKED',
        'AGGREGATOR_LOCKED on measured evidence, 3,615 rows. Job boards own this SERP.'),
    'taxes.country': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, acquisition GOVERNMENT_PLUS_OECD.'),
    'visas.country-residency': ('SOURCE_MISSING',
        'MISSING_ACQUIRABLE, GOVERNMENT. Demand confirmed: visa requirements for us citizens '
        '3,200 at CPC 15 to 200 cents.'),
    'visas.country-digital-nomad': ('SOURCE_MISSING',
        'MISSING_ACQUIRABLE. digital nomad visa reads 13,000 and spain digital nomad visa 2,900 '
        'at CPC 140 cents, among the highest in the project. The source is each immigration '
        'authority and a visa page built on anything less is a liability.'),
    'visas.country-visit': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, and median KD 73.'),
    'visas.country-work-permit': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE.'),
    'banking.country': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, GOVERNMENT_PLUS_COMMERCIAL.'),
    'health.country': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, GOVERNMENT. health.city holds 2,811.'),
    'safety.country-advice': ('SOURCE_MISSING',
        'MISSING_ACQUIRABLE. The honest source is each foreign ministry travel advice, which '
        'changes weekly. A stale safety page is worse than no page. Demand is thin anyway: five '
        'entities between 300 and 900 a month.'),
    'work.country-working': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, GOVERNMENT.'),
    'services.country-admin': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, GOVERNMENT_PLUS_OPEN.'),
    'cost-of-living.item-country': ('SOURCE_MISSING', 'MISSING_ACQUIRABLE, UNAVAILABLE_OPEN.'),
    'cost-of-living.country': ('DATA_HELD_BUT_GATE_BUG',
        'source_state HELD and one declared field. The eurostat and World Bank price level files '
        'are on disk.'),
    'cost-of-living.country-vs-market': ('DATA_HELD_BUT_GATE_BUG', 'HELD, one declared field.'),
    'events.series-city': ('SOURCE_MISSING',
        'HELD in name but acquisition is AFFILIATE_OR_PARTNER_FEED, which this project does not '
        'have. 6,935 rows lost. Note that de weihnachtsmarkt returns about 55 named markets '
        'above 3,000 a month, so the INTENT is proven and only the feed is missing.'),
    'events.recurring': ('DATA_HELD_INTENT_UNMEASURED', 'never generated a row.'),
    'outdoors.region-feature-list': ('DATA_HELD_UTILITY_POSSIBLE',
        'never generated a row. de ausflugsziele nrw reads 7,500 and five more German states '
        'clear 2,200. The GeoNames admin1 and admin2 stores plus the OSM outdoor and POI layers '
        'give the features to list, which is the aggregation the brief asks to prefer.'),
    'sport.route': ('DATA_HELD_UTILITY_POSSIBLE',
        'never generated a row, and this is the single largest class B opportunity in the '
        'project. 125,516 named route relations are on disk with a measured length_km, median 10 '
        'facts each. 114,530 pass a hard utility gate. de wanderung X reads 2,100 to 3,100 for '
        'named hikes and the French, Italian and Spanish sibling classes all transferred.'),
    'places.poi': ('AGGREGATE_INSTEAD',
        'never generated a row at entity level and the 2026-10-06 run settled why: the '
        'destination POI fan-out produced 292,613 raw rows and the localisation gate removed '
        '263,742 as TRANSLATION_ONLY. poi-aggregations is the right shape.'),
    'airports.guide': ('DATA_HELD_INTENT_UNMEASURED',
        'never generated a row. ourairports is registered. de flughafen returns about thirty '
        'named airports, but the dominant intents are parken, parkplatz, ankunft and abflug: '
        'parking commerce and live flight boards, neither of which a static page answers.'),
    'transport.airport-to-city': ('DATA_HELD_INTENT_UNMEASURED',
        'never generated a row. airport transfer carries the highest CPC measured anywhere in '
        'this project at 100 to 250 cents, but the page needs a transport source beyond computed '
        'distance and the GTFS registry in sources.json is not ingested.'),
    'connectivity.city-online': ('DATA_HELD_INTENT_UNMEASURED',
        'never generated a row, which is striking for an eSIM brand: the connectivity surface '
        'has ZERO pages.'),
    'connectivity.country-sim-gap': ('DATA_HELD_INTENT_UNMEASURED', 'never generated a row.'),
    'neighbourhoods.city-best-for': ('CORRECTLY_REJECTED',
        'REJECTED_UNSUPPORTED_SUPERLATIVE: the family id itself claims best and no methodology '
        'document exists. areas.city-index lists the same areas from the same facts without the '
        'unearned ranking.'),
    'community.city-topic': ('DATA_HELD_INTENT_UNMEASURED', 'never generated a row.'),
    'rankings.index': ('CORRECTLY_REJECTED', 'a ranking with no methodology is the superlative gate.'),
}
TOOL_VERDICT = ('AGGREGATE_INSTEAD',
    'a tool is one page per market, not a family. brutto netto rechner reads 1,260,000 a month '
    'in German, the second largest keyword in the project, on an axis of one year and two '
    'states at CPC 2 cents. Build the tool; do not count it as scale.')


def main():
    cat = list(csv.DictReader(open(CAT, encoding='utf-8')))
    live = collections.Counter()
    with gzip.open(REP + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'rt',
                   encoding='utf-8', newline='') as fh:
        for r in csv.DictReader(fh):
            live[r['family']] += 1
    rows = []
    for f in cat:
        fid = f['family_id']
        pages = live.get(fid, 0)
        rd = (f.get('required_data') or '').strip()
        nfields = len([x for x in rd.replace(';', ',').split(',') if x.strip()])
        state = f.get('source_state', '')
        if fid in MEASURED:
            klass, why = MEASURED[fid]
        elif fid.startswith(('tools.', 'calendar.')):
            klass, why = TOOL_VERDICT
        elif pages > 0:
            klass, why = 'LIVE', f'{pages:,} pages in the manifest'
        elif state == 'MISSING_ACQUIRABLE':
            klass, why = 'SOURCE_MISSING', f'source_state MISSING_ACQUIRABLE, acquisition {f.get("acquisition_type","")}'
        elif nfields < 2:
            klass, why = ('DATA_HELD_BUT_GATE_BUG',
                          f'source_state {state} and only {nfields} declared source field, which '
                          f'returns an empty uniqueness_reason and rejects every row')
        else:
            klass, why = 'DATA_HELD_INTENT_UNMEASURED', 'no keyword reading exists for this family'
        rows.append({'family_id': fid, 'surface': f['surface'], 'entity': f['entity'],
                     'pages_today': pages, 'source_state': state,
                     'declared_source_fields': nfields,
                     'max_volume_in_catalogue': f.get('max_volume', ''),
                     'classification': klass, 'why': why})
    order = {'LIVE': 0, 'DATA_HELD_BUT_GATE_BUG': 1, 'DATA_HELD_UTILITY_POSSIBLE': 2,
             'DATA_HELD_INTENT_UNMEASURED': 3, 'AGGREGATE_INSTEAD': 4, 'CANNIBALIZATION': 5,
             'SERP_BLOCKED': 6, 'SOURCE_MISSING': 7, 'CORRECTLY_REJECTED': 8}
    rows.sort(key=lambda r: (order.get(r['classification'], 9), -r['pages_today']))
    with open(OUT, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader(); w.writerows(rows)
    c = collections.Counter(r['classification'] for r in rows)
    print(f'catalogue families: {len(rows)}')
    for k in sorted(c, key=lambda x: order.get(x, 9)):
        pages = sum(r['pages_today'] for r in rows if r['classification'] == k)
        print(f'  {c[k]:>3}  {k:<30} pages today {pages:>8,}')
    print()
    print('the actionable classes, family by family:')
    for k in ('DATA_HELD_BUT_GATE_BUG', 'DATA_HELD_UTILITY_POSSIBLE',
              'DATA_HELD_INTENT_UNMEASURED'):
        fams = [r['family_id'] for r in rows if r['classification'] == k]
        print(f'  {k} ({len(fams)}): {", ".join(fams)}')


if __name__ == '__main__':
    main()
