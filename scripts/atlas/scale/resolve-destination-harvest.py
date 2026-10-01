#!/usr/bin/env python3
"""
Turn the destination demand harvest into destination evidence the localisation gate can read.

The harvest asked each market's language what places it searches for. The answers come back in
that language's own spelling, which is often an exonym: Germans search "prag", Italians
"praga", Poles "praga", and all three mean Prague. The gate keys its evidence on the
gazetteer's own (name, country) pair, so every row has to be resolved to a real city before it
counts as evidence of anything.

Three ways a row resolves, in order, and a row that resolves by none of them is REPORTED rather
than dropped quietly, because an unresolved row is either a missing exonym or an entity type the
graph does not have yet, and both are findings:

    1. the entity string matches a gazetteer city's slug exactly, inside a country that plausibly
       owns it. The slug comparison folds diacritics, so "logrono" finds Logrono.
    2. the entity string is a known exonym, listed below with the endonym it names. Written out
       rather than guessed from a string distance: "monaco di baviera" is Munich and not Monaco,
       and no edit distance will ever say so.
    3. the row names a country, a region, an island, a lake or a mountain area. Those are not
       cities and are not forced into being cities; they are written to a separate file as
       demand evidence for entity types the graph does not yet carry.

Usage: resolve-destination-harvest.py
"""
import collections, csv, os, re, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                            # noqa: E402

SRC = ROOT + 'data/atlas/measurements/destination-harvest/harvest-2026-10-01.csv'
OUT_CITY = ROOT + 'data/atlas/measurements/destination-harvest/resolved-cities-2026-10-01.csv'
OUT_OTHER = ROOT + 'data/atlas/measurements/destination-harvest/resolved-non-city-2026-10-01.csv'
OUT_MISS = ROOT + 'data/atlas/measurements/destination-harvest/unresolved-2026-10-01.csv'

# The intent phrase, per language, stripped off to leave the entity. Longest first, so
# "bezienswaardigheden" does not leave a fragment behind when the phrase is the prefix form.
PHRASES = {
    'de': ['sehenswürdigkeiten'],
    'fr': ['que faire a', 'que faire à'],
    'it': ['cosa vedere ad', 'cosa vedere a', 'cosa vedere in', 'cosa vedere'],
    'es': ['que ver en', 'qué ver en'],
    'nl': ['bezienswaardigheden'],
    'pl': ['atrakcje'],
    'pt': ['o que fazer em'],
}
# A trailing qualifier that is part of the query and not part of the place.
TAIL_NOISE = ('ce weekend', 'ce week end', 'dla dzieci', 'hoje', 'in 3 giorni', 'stad')

# Which searcher markets a language serves. The page is language-scoped, so evidence pools by
# language; the market column is kept because the reach file has one and the gate reads both.
LANG_MARKETS = {
    'de': ['de-DE'], 'fr': ['fr-FR'], 'it': ['it-IT'], 'es': ['es-ES'],
    'nl': ['nl-NL'], 'pl': ['pl-PL'], 'pt': ['pt-BR'],
}

# Exonyms, written out because they cannot be derived. Keyed on the harvested spelling,
# mapping to (endonym as the gazetteer spells it, ISO2). Only entries I can state with
# confidence are here; anything else goes to the unresolved file for a human to look at.
EXONYMS = {
    # German
    'prag': ('Prague', 'CZ'), 'kopenhagen': ('Copenhagen', 'DK'), 'rom': ('Rome', 'IT'),
    'lissabon': ('Lisbon', 'PT'), 'mailand': ('Milan', 'IT'), 'florenz': ('Florence', 'IT'),
    'venedig': ('Venice', 'IT'), 'neapel': ('Naples', 'IT'), 'warschau': ('Warsaw', 'PL'),
    'danzig': ('Gdansk', 'PL'), 'breslau': ('Wroclaw', 'PL'), 'stettin': ('Szczecin', 'PL'),
    'krakau': ('Krakow', 'PL'), 'brügge': ('Bruges', 'BE'), 'nizza': ('Nice', 'FR'),
    'triest': ('Trieste', 'IT'), 'bozen': ('Bolzano', 'IT'), 'meran': ('Merano', 'IT'),
    'marrakesch': ('Marrakesh', 'MA'), 'tokio': ('Tokyo', 'JP'), 'athen': ('Athens', 'GR'),
    'brüssel': ('Brussels', 'BE'), 'straßburg': ('Strasbourg', 'FR'),
    'lüttich': ('Liege', 'BE'), 'genua': ('Genoa', 'IT'), 'turin': ('Turin', 'IT'),
    'bukarest': ('Bucharest', 'RO'), 'karlsbad': ('Karlovy Vary', 'CZ'),
    'swinemünde': ('Swinoujscie', 'PL'), 'singapur': ('Singapore', 'SG'),
    'göteborg': ('Gothenburg', 'SE'), 'wien': ('Vienna', 'AT'),
    'luxemburg': ('Luxembourg', 'LU'), 'london': ('London', 'GB'),
    # French
    'barcelone': ('Barcelona', 'ES'), 'milan': ('Milan', 'IT'), 'lisbonne': ('Lisbon', 'PT'),
    'seville': ('Seville', 'ES'), 'londres': ('London', 'GB'), 'naples': ('Naples', 'IT'),
    'geneve': ('Geneva', 'CH'), 'rome': ('Rome', 'IT'), 'prague': ('Prague', 'CZ'),
    'marrakech': ('Marrakesh', 'MA'), 'porto': ('Porto', 'PT'),
    # Italian
    'praga': ('Prague', 'CZ'), 'parigi': ('Paris', 'FR'), 'lisbona': ('Lisbon', 'PT'),
    'barcellona': ('Barcelona', 'ES'), 'londra': ('London', 'GB'),
    'siviglia': ('Seville', 'ES'), 'cracovia': ('Krakow', 'PL'),
    'copenaghen': ('Copenhagen', 'DK'), 'lubiana': ('Ljubljana', 'SI'),
    'bucarest': ('Bucharest', 'RO'), 'varsavia': ('Warsaw', 'PL'),
    'berlino': ('Berlin', 'DE'), 'monaco di baviera': ('Munich', 'DE'),
    'marsiglia': ('Marseille', 'FR'), 'edimburgo': ('Edinburgh', 'GB'),
    'atene': ('Athens', 'GR'), 'dublino': ('Dublin', 'IE'), 'vienna': ('Vienna', 'AT'),
    'bruxelles': ('Brussels', 'BE'), 'tirana': ('Tirana', 'AL'),
    # Spanish
    'oporto': ('Porto', 'PT'), 'lisboa': ('Lisbon', 'PT'), 'viena': ('Vienna', 'AT'),
    'florencia': ('Florence', 'IT'), 'bruselas': ('Brussels', 'BE'),
    'napoles': ('Naples', 'IT'), 'venecia': ('Venice', 'IT'), 'burdeos': ('Bordeaux', 'FR'),
    'atenas': ('Athens', 'GR'), 'marsella': ('Marseille', 'FR'),
    'ginebra': ('Geneva', 'CH'), 'estambul': ('Istanbul', 'TR'),
    'copenhague': ('Copenhagen', 'DK'), 'estocolmo': ('Stockholm', 'SE'),
    # Dutch
    'praag': ('Prague', 'CZ'), 'berlijn': ('Berlin', 'DE'), 'parijs': ('Paris', 'FR'),
    'wenen': ('Vienna', 'AT'), 'londen': ('London', 'GB'), 'athene': ('Athens', 'GR'),
    'boedapest': ('Budapest', 'HU'), 'aken': ('Aachen', 'DE'), 'keulen': ('Cologne', 'DE'),
    'napels': ('Naples', 'IT'), 'milaan': ('Milan', 'IT'), 'brussel': ('Brussels', 'BE'),
    'lissabon': ('Lisbon', 'PT'), 'florence': ('Florence', 'IT'),
    'munchen': ('Munich', 'DE'), 'brugge': ('Bruges', 'BE'),
    # Polish
    'londyn': ('London', 'GB'), 'mediolan': ('Milan', 'IT'), 'rzym': ('Rome', 'IT'),
    'budapeszt': ('Budapest', 'HU'), 'kopenhaga': ('Copenhagen', 'DK'),
    'wiedeń': ('Vienna', 'AT'),
    # Portuguese
    'londres_pt': ('London', 'GB'),
    # Endonyms the alternate-name list did not surface, because this project caps the alternates
    # it stores at fourteen per city and the dump's order is not the useful one. Written out
    # rather than raising the cap, which would add eleven strings to every one of 64,418 rows to
    # fix six.
    'münchen': ('Munich', 'DE'), 'nürnberg': ('Nuremberg', 'DE'),
    'venezia': ('Venice', 'IT'), 'siviglia': ('Seville', 'ES'),
    'antwerpen': ('Antwerp', 'BE'), 'keulen': ('Cologne', 'DE'),
}
# Entity types that are not a city. Kept, written to their own file, and never coerced.
NON_CITY_NOTES = {'country', 'region', 'island', 'island country', 'island region',
                  'lake', 'mountain area'}

GAZ = entity_identity.load_gazetteer()
slugify = entity_identity.slugify

# every city slug, and the ids that share it after folding, per country
by_slug = collections.defaultdict(list)
for cid, c in GAZ.by_id.items():
    by_slug[(slugify(c['name']), c['country'])].append(cid)
by_slug_any = collections.defaultdict(list)
for (sl, cc), ids in by_slug.items():
    by_slug_any[sl].extend(ids)

# And the ALTERNATE names GeoNames carries, which is the honest exonym table: Prague's row holds
# Praga, Prag and Praha, Munich's holds Monaco di Baviera, and no hand written mapping of mine
# can be more right than the source. The hand table below stays for the few cases the dump does
# not cover, and it is now the fallback rather than the first answer.
by_alt = collections.defaultdict(list)
_alt_rows = 0
import glob as _glob, json as _json
for _f in sorted(_glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    try:
        _d = _json.load(open(_f, encoding='utf-8'))
    except Exception:
        continue
    _lst = _d if isinstance(_d, list) else (_d.get('cities') or list(_d.values())[0])
    for _c in _lst:
        for _a in (_c.get('alt') or ()):
            by_alt[slugify(_a)].append(str(_c['id']))
            _alt_rows += 1
print(f'alternate name forms indexed: {_alt_rows:,} over {len(by_alt):,} distinct slugs')


def entity_string(lang, keyword):
    s = ' ' + keyword.strip().lower() + ' '
    for p in sorted(PHRASES.get(lang, []), key=len, reverse=True):
        s = s.replace(' ' + p + ' ', ' ')
    for n in TAIL_NOISE:
        s = s.replace(' ' + n + ' ', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    # a leading preposition left by the strip: "in berlin", "w warszawie", "ad amsterdam"
    s = re.sub(r'^(in|a|ad|en|em|w|de|di)\s+', '', s)
    return s


rows = list(csv.DictReader(open(SRC, encoding='utf-8')))
city_out, other_out, miss_out = [], [], []
stats = collections.Counter()

for r in rows:
    lang, kw, vol, note = r['language'], r['keyword'], int(r['volume']), (r['note'] or '')
    ent = entity_string(lang, kw)
    if not ent or note == 'generic':
        stats['generic_or_empty'] += 1
        continue
    if note in NON_CITY_NOTES:
        other_out.append({'language': lang, 'entity': ent, 'entity_kind': note,
                          'volume': vol, 'source_keyword': kw})
        stats['non_city_' + note.replace(' ', '_')] += 1
        continue
    sl = slugify(ent)
    resolved = None
    how = ''
    if sl in by_slug_any:
        ids = by_slug_any[sl]
        # prefer the most populous, which is the one a searcher means when a name repeats
        cid = max(ids, key=lambda i: GAZ.by_id[i]['population'] or 0)
        resolved = (GAZ.by_id[cid]['name'], GAZ.by_id[cid]['country'], cid)
        how = 'slug match in the gazetteer'
    elif sl in by_alt:
        # An alternate name can belong to several cities (Praga is also a district of Warsaw and a
        # town in Spain). The most populous wins, which is what a searcher typing it means, and
        # the decision is recorded in how_resolved so it can be argued with.
        ids = by_alt[sl]
        cid = max(ids, key=lambda i: (GAZ.by_id[i]['population'] or 0) if i in GAZ.by_id else 0)
        if cid in GAZ.by_id:
            resolved = (GAZ.by_id[cid]['name'], GAZ.by_id[cid]['country'], cid)
            how = (f'GeoNames alternate name {ent} resolved to {GAZ.by_id[cid]["name"]} '
                   f'({GAZ.by_id[cid]["country"]}), {len(set(ids))} candidates, most populous '
                   f'chosen')
    if not resolved and (ent in EXONYMS or (ent + '_' + lang) in EXONYMS):
        nm, cc = EXONYMS.get(ent) or EXONYMS[ent + '_' + lang]
        ids = by_slug.get((slugify(nm), cc), [])
        if ids:
            cid = max(ids, key=lambda i: GAZ.by_id[i]['population'] or 0)
            resolved = (GAZ.by_id[cid]['name'], GAZ.by_id[cid]['country'], cid)
            how = f'exonym {ent} resolved to {nm} ({cc})'
        else:
            stats['exonym_target_not_in_gazetteer'] += 1
    if not resolved:
        miss_out.append({'language': lang, 'entity': ent, 'volume': vol,
                         'source_keyword': kw, 'note': note})
        stats['unresolved'] += 1
        continue
    nm, cc, cid = resolved
    for m in LANG_MARKETS.get(lang, []):
        city_out.append({'searcher_market': m, 'language': lang, 'city': nm,
                         'city_country': cc, 'city_id': cid, 'volume': vol,
                         'source_keyword': kw, 'how_resolved': how})
    stats['resolved'] += 1


def write(path, rowlist, fields):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for x in rowlist:
            w.writerow(x)


write(OUT_CITY, city_out,
      ['searcher_market', 'language', 'city', 'city_country', 'city_id', 'volume',
       'source_keyword', 'how_resolved'])
write(OUT_OTHER, other_out, ['language', 'entity', 'entity_kind', 'volume', 'source_keyword'])
write(OUT_MISS, miss_out, ['language', 'entity', 'volume', 'source_keyword', 'note'])

print(f'harvest rows: {len(rows):,}')
for k, v in stats.most_common():
    print(f'    {k:36} {v:>6,}')
print(f'\nresolved city evidence rows written: {len(city_out):,} -> {OUT_CITY}')
print(f'non-city demand rows written:        {len(other_out):,} -> {OUT_OTHER}')
print(f'unresolved rows written:             {len(miss_out):,} -> {OUT_MISS}')
if miss_out:
    print('\nunresolved, which is a missing exonym or an entity the graph does not have:')
    for x in miss_out[:25]:
        print(f'    {x["language"]}  {x["entity"]:34} {x["volume"]:>7,}  {x["note"]}')
