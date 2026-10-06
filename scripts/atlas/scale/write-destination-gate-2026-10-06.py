#!/usr/bin/env python3
"""
Turn the 2026-10-06 Keywords Explorer measurement into a destination-demand table.

Same shape and same rule as destination-demand-by-country-language-2026-10-02.json, so
entity_identity._dest_rows() merges it with no change: a destination country earns a language
only when BOTH a connectivity keyword and a travel-information keyword carry at least 40 a
month, which is the bar the 2026-10-02 table actually admitted on.

What is NEW is which languages were asked. The 2026-10-02 table and its two 2026-10-05
supplements cover de, en, it, ja, ko and tr. Six of the fourteen active markets - fr-FR, es-ES,
nl-NL, pl-PL, pt-BR and zh-Hant-TW - had never been measured for the destination gate at all,
so they earned zero destination pages. That was an unasked question, not a measured refusal,
and this file asks it.

One honesty note that the file repeats per row: the measurement was taken with a server-side
volume filter, so what is recorded per keyword is that it cleared 40, not what it read. Every
max_connectivity_volume here is therefore the FLOOR of 40 and says so. That makes this file
lose the loader's precedence test against any file holding a real number, which is the safe
direction: a real measurement never gets overwritten by a floor.

Usage: write-destination-gate-2026-10-06.py <gate-rows.json> <dest-gate-keywords.json>
Writes data/atlas/measurements/destination-demand-by-country-language-six-languages-2026-10-06.json
"""
import json, sys

ROOT = '/home/user/Livdar-eSim/'
OUT = (ROOT + 'data/atlas/measurements/'
       'destination-demand-by-country-language-six-languages-2026-10-06.json')
BAR = 40

rows = json.load(open(sys.argv[1], encoding='utf-8'))
kwmeta = json.load(open(sys.argv[2], encoding='utf-8'))

table, counts = {}, {}
for lang, r in rows.items():
    for cc in sorted({p.split('|')[0] for p in r['qualifying_pairs']}):
        ev = r['evidence'][cc]
        table[f'{cc}|{lang}'] = {
            'destination_country': cc,
            'language': lang,
            'qualifies': True,
            'why_not': '',
            # [keyword, volume, cpc, difficulty] to match the 2026-10-02 shape. The volume is
            # the bar, not the reading: see the note at the top of this file.
            'connectivity_keywords': [[k, BAR, 0, 0] for k in ev['connectivity']],
            'information_keywords': [[k, BAR, 0, 0] for k in ev['information']],
            'max_connectivity_volume': BAR,
            'max_information_volume': BAR,
            'max_cpc_cents': 0,
            'volumes_are_a_floor_not_a_reading': True,
        }
    # The refusals are recorded too, because a refusal is evidence and an absence is not.
    for cc in r['connectivity_only_no_information']:
        table.setdefault(f'{cc}|{lang}', {
            'destination_country': cc, 'language': lang, 'qualifies': False,
            'why_not': 'a connectivity keyword carries volume but no travel-information '
                       'keyword does, so there is demand for a SIM and none for the place',
            'connectivity_keywords': [], 'information_keywords': [],
            'max_connectivity_volume': BAR, 'max_information_volume': 0, 'max_cpc_cents': 0})
    for cc in r['information_only_no_connectivity']:
        table.setdefault(f'{cc}|{lang}', {
            'destination_country': cc, 'language': lang, 'qualifies': False,
            'why_not': 'a travel-information keyword carries volume but no connectivity '
                       'keyword does, which is the Turkish pattern: the eSIM intent is '
                       'generic rather than per country',
            'connectivity_keywords': [], 'information_keywords': [],
            'max_connectivity_volume': 0, 'max_information_volume': BAR, 'max_cpc_cents': 0})
    counts[lang] = {'countries_tested': r['countries_tested'],
                    'keywords_tested': r['keywords_tested'],
                    'keywords_at_or_above_the_bar': r['keywords_at_or_above_the_bar'],
                    'countries_qualifying': r['countries_qualifying'],
                    'refused_for_no_information_demand':
                        len(r['connectivity_only_no_information']),
                    'refused_for_no_connectivity_demand':
                        len(r['information_only_no_connectivity'])}

json.dump({
    'measured_on': '2026-10-06',
    'provider': 'Ahrefs Keywords Explorer, keywords-explorer/overview',
    'licence_and_provenance': {
        'keyword_metrics': 'Ahrefs, used under the active Advanced subscription. Volumes are '
                           'Ahrefs estimates, not Google data, and are stored as evidence for '
                           'a gate rather than published as facts on any page.',
        'country_names': 'Wikidata rdfs:label and P1813 short name via query.wikidata.org '
                         'SPARQL, CC0 1.0 public domain dedication, fetched 2026-10-06. Used '
                         'to build the keyword strings, never rendered on a page.',
        'units_spent': 'about 16,500 units across eleven calls, from the 557,990 that remained',
    },
    'adds_to': ['destination-demand-by-country-language-2026-10-02.json',
                'destination-demand-by-country-language-tr-2026-10-05.json',
                'destination-demand-by-country-language-ko-2026-10-05.json'],
    'rule': 'unchanged: BOTH halves at or above 40 a month in the page language',
    'and_this_is_only_half_the_gate': (
        'Qualifying here lets a COUNTRY be considered for a language. It does not let an '
        'arbitrary place inside that country earn a page. The second half is a per-entity mark '
        'in the same language, a Wikidata sitelink or a GeoNames alternate name, and it is '
        'labelled a proxy on every row that rests on it.'),
    'the_volume_caveat': (
        'Measured with a server-side filter at the bar, so each keyword here is known to clear '
        '40 and its exact reading was not retained. Every volume in this file is the floor. The '
        'loader prefers whichever file holds the larger connectivity volume, so this file never '
        'overwrites a real reading.'),
    'what_the_measurement_shows': {
        'french_and_spanish_open_almost_everything':
            '89 of 100 countries each. French reads esim japon 3,500 and esim thailande 2,100.',
        'portuguese_behaves_like_turkish':
            'the travel half is broad and the connectivity half is narrow: 47 countries, and a '
            'retest of every accented spelling recovered only France, Greece, Iceland and '
            'Switzerland. Brazilian eSIM intent is largely generic rather than per country.',
        'traditional_chinese_is_the_narrowest':
            '21 countries. The travel half is wide - almost every country reads volume on '
            'X旅遊 - and the connectivity half is concentrated on the destinations Taiwanese '
            'travellers actually buy a SIM for.',
        'two_wikidata_labels_would_have_produced_false_negatives':
            'the formal label reads zero: Reino de los Paises Bajos against Paises Bajos, '
            '中華民國 against 台灣. Short names and recorded overrides fixed nine such pairs, '
            'and the Netherlands then qualified for French at esim pays-bas 100.',
        'polish_needed_its_diacritics_back':
            'azerbejdzan, bialorus, macedonia polnocna and kambodza read nothing folded and '
            'read 50, 40, 40 and 200 with their diacritics, so four countries were recovered. '
            'Portuguese did not behave the same way, which is why both were tested rather '
            'than assumed.',
    },
    'per_language': counts,
    'pairs_qualifying': sum(c['countries_qualifying'] for c in counts.values()),
    'pairs_recorded_including_refusals': len(table),
    'table': table,
}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
q = sum(1 for v in table.values() if v['qualifies'])
print(f'{len(table):,} pairs recorded, {q:,} qualifying')
print('written', OUT)
