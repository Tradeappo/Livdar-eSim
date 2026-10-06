#!/usr/bin/env python3
"""
Build the keyword list for the destination gate in the languages it was never measured in.

The destination gate needs two halves per (destination country, language): a connectivity
keyword with volume and a travel-information keyword with volume. As of 2026-10-06 that table
covers six languages - de, en, it, ja, ko, tr - and 43 countries. Five ACTIVE markets have
never been measured for it at all: fr-FR, es-ES, nl-NL, pl-PL, pt-BR, plus zh-Hant-TW. Those
markets therefore earn zero destination pages, not because demand was measured and refused but
because nobody asked.

Country names come from Wikidata labels rather than from me typing them, because a typo in a
country name reads as zero volume and would refuse a country that actually qualifies.

Usage: build-destination-gate-keywords.py <labels.json> <shortnames.json> <out.json>
Writes the keyword list grouped by (language, Ahrefs country) ready to send to Keywords Explorer.
"""
import json, sys, unicodedata

# The destination universe: every country already represented in the inventory, plus the
# wealthy and high-travel-demand countries the brief names, plus the tourism heads that any
# of these languages plausibly travels to. A country here is a CANDIDATE for measurement; it
# earns a language only if both halves carry volume.
IN_INVENTORY = ('AE AL AR AT AU BE BG BR BY CA CH CL CO CR CZ DE DK EC EG ES FI FR GB GE GR '
                'HR HU ID IE IN IS IT JP KH KR MA MC ME MX MY NI NL NO NZ PE PH PL PT RO SE '
                'SI SK TH TR TW UA US VE VN').split()
WEALTHY_OR_HIGH_DEMAND = ('SA QA KW BH OM JO IL LU SG CY MT EE LV LT RS MK BA AM AZ KZ UZ LK '
                          'NP MV MU SC ZA KE TZ DO JM CU PA GT UY BO PY TN SV HN MN TW').split()
COUNTRIES = sorted(set(IN_INVENTORY) | set(WEALTHY_OR_HIGH_DEMAND))

# One connectivity template and two travel-information templates per language. {c} is the
# country name in that language. The information templates are deliberately generic phrasings
# rather than named attractions: a named attraction measures that attraction, and the gate asks
# whether the COUNTRY carries travel-information demand in this language.
TEMPLATES = {
    'fr':      ('fr', ['esim {c}'], ['{c} tourisme', 'voyage {c}']),
    'es':      ('es', ['esim {c}'], ['que ver en {c}', 'viajar a {c}']),
    'nl':      ('nl', ['esim {c}'], ['{c} bezienswaardigheden', 'reizen naar {c}']),
    'pl':      ('pl', ['esim {c}'], ['{c} atrakcje', 'wakacje {c}']),
    'pt':      ('br', ['esim {c}'], ['o que fazer em {c}', 'viagem {c}']),
    'zh-Hant': ('tw', ['esim {c}'], ['{c}旅遊', '{c}自由行']),
}
# Wikidata serves Traditional Chinese under several codes; prefer the most specific present.
LABEL_FALLBACK = {'zh-Hant': ('zh-hant', 'zh-tw', 'zh')}

# A Wikidata rdfs:label is the FORMAL name, and nobody searches for a formal name: "Reino de
# los Paises Bajos" reads zero where "Paises Bajos" reads thousands, and a zero there would
# refuse a country for a reason that is about our keyword rather than about demand. So where the
# label carries a state-form word, the P1813 short name replaces it - but only when that short
# name is a NAME and not an abbreviation, because "EE.UU." and "VS" are worse keywords than the
# formal label was.
FORMAL = ('republic', 'kingdom', 'republique', 'republik', 'royaume', 'republica', 'reino',
          'republiek', 'koninkrijk', 'republika', 'krolestwo', 'rzeczpospolita',
          '共和國', '王國', '共和国')


def is_formal(name):
    n = fold(name)
    return any(m in n for m in FORMAL)


def usable_short(short):
    """An abbreviation is not a search term. A name is."""
    return bool(short) and '.' not in short and len(short.replace(' ', '')) >= 4


# The few countries whose formal label survives the rule with no usable short name in a
# language. The value is the internationally used short form, which is the same string in every
# Latin-script language measured here, and it is recorded as an override rather than silently
# substituted. A zero on one of these is still reported, with the flag below, because it may be
# the keyword rather than the demand.
EXONYM_OVERRIDE = {
    ('TW', 'es'): 'taiwan', ('TW', 'pt'): 'taiwan', ('TW', 'pl'): 'tajwan',
    ('TW', 'nl'): 'taiwan', ('TW', 'zh-Hant'): '台灣',
    ('NL', 'zh-Hant'): '荷蘭', ('KR', 'zh-Hant'): '韓國',
    ('NL', 'pl'): 'holandia', ('NL', 'pt'): 'holanda', ('NL', 'nl'): 'nederland',
    ('KR', 'es'): 'corea del sur', ('KR', 'pt'): 'coreia do sul',
    ('KR', 'nl'): 'zuid-korea',
    ('CZ', 'pt'): 'republica checa', ('CZ', 'nl'): 'tsjechie', ('CZ', 'pl'): 'czechy',
}


def fold(s):
    """Ahrefs keywords are matched without diacritics in the Latin-script languages measured
    here, and the existing table is written folded (esim thailande, not esim thaIlande), so the
    new rows are built the same way to stay comparable with it. CJK is left untouched."""
    out = []
    for ch in s:
        if ord(ch) > 0x2000:          # CJK and anything beyond Latin punctuation: keep as is
            out.append(ch)
            continue
        d = unicodedata.normalize('NFD', ch)
        out.append(''.join(c for c in d if unicodedata.category(c) != 'Mn'))
    return unicodedata.normalize('NFC', ''.join(out)).lower()


def main():
    labels_path, shorts_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    raw = json.load(open(labels_path, encoding='utf-8'))
    sraw = json.load(open(shorts_path, encoding='utf-8'))
    shorts = {}
    for b in sraw['results']['bindings']:
        shorts.setdefault(b['iso2']['value'].strip().upper(), {})[b['lang']['value']] = \
            b['name']['value']
    # {iso2: {lang: name}}
    by_country = {}
    for b in raw['results']['bindings']:
        iso2 = b['iso2']['value'].strip().upper()
        by_country.setdefault(iso2, {})[b['lang']['value']] = b['name']['value']

    out, missing, not_natural, name_basis = {}, [], [], {}
    for lang, (ahrefs_country, conn_t, info_t) in TEMPLATES.items():
        rows = []
        for iso2 in COUNTRIES:
            labs = by_country.get(iso2) or {}
            name = labs.get(lang)
            if not name:
                for alt in LABEL_FALLBACK.get(lang, ()):
                    if labs.get(alt):
                        name = labs[alt]
                        break
            if not name:
                missing.append(f'{iso2}|{lang}')
                continue
            chosen = 'wikidata rdfs:label'
            # An override is a deliberate statement about what people type, so it wins before
            # the formal-name detector gets a vote: the detector missed 中華民國, which carries
            # no word from its list and is still not what anyone searches for.
            if (iso2, lang) in EXONYM_OVERRIDE:
                name = EXONYM_OVERRIDE[(iso2, lang)]
                chosen = 'recorded exonym override, the label is not what people type'
            elif is_formal(name):
                sh = (shorts.get(iso2) or {}).get(lang)
                if not sh:
                    for alt in LABEL_FALLBACK.get(lang, ()):
                        if (shorts.get(iso2) or {}).get(alt):
                            sh = shorts[iso2][alt]
                            break
                if usable_short(sh):
                    name, chosen = sh, 'wikidata P1813 short name, the label was a formal name'
                elif (iso2, lang) in EXONYM_OVERRIDE:
                    name = EXONYM_OVERRIDE[(iso2, lang)]
                    chosen = 'recorded exonym override, no usable short name in this language'
                else:
                    not_natural.append(f'{iso2}|{lang}|{name}')
                    chosen = 'formal label kept, no short name and no override: a zero here is '\
                             'about the keyword, not about demand'
            n = fold(name) if lang != 'zh-Hant' else name
            name_basis[f'{iso2}|{lang}'] = {'name_used': n, 'basis': chosen}
            for t in conn_t:
                rows.append({'country': iso2, 'half': 'connectivity', 'keyword': t.format(c=n)})
            for t in info_t:
                rows.append({'country': iso2, 'half': 'information', 'keyword': t.format(c=n)})
        out[lang] = {'ahrefs_country': ahrefs_country, 'keywords': rows}

    json.dump({
        'built_on': '2026-10-06',
        'why': ('the destination gate had never been measured in fr, es, nl, pl, pt or zh-Hant, '
                'which are six of the fourteen active markets. Zero destination pages in those '
                'markets was an unasked question, not a measured refusal.'),
        'country_names_from': ('Wikidata rdfs:label via query.wikidata.org SPARQL, CC0 1.0 '
                               'public domain dedication, fetched 2026-10-06'),
        'countries_considered': len(COUNTRIES),
        'rule_applied_later': ('a country earns a language only when BOTH a connectivity keyword '
                               'and a travel-information keyword carry volume, connectivity at '
                               'or above 40 a month, which is the bar the 2026-10-02 table '
                               'actually admitted on'),
        'languages': {k: len(v['keywords']) for k, v in out.items()},
        'total_keywords': sum(len(v['keywords']) for v in out.values()),
        'countries_with_no_label_in_a_language': sorted(missing),
        'countries_whose_keyword_is_still_a_formal_name': sorted(not_natural),
        'and_most_of_those_are_the_detector_being_wrong': (
            'Reino Unido, Royaume-Uni, Verenigd Koninkrijk and Republica Dominicana ARE the '
            'everyday names: the state-form word is part of what people type. The detector '
            'flags them, the label is kept, and the flag is recorded rather than acted on.'),
        'the_name_used_per_country_and_language_and_why': name_basis,
        'by_language': out,
    }, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{sum(len(v["keywords"]) for v in out.values())} keywords over {len(out)} languages, '
          f'{len(COUNTRIES)} countries; missing labels {len(missing)}')
    print('written', out_path)


main()
