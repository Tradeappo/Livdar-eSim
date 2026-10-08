#!/usr/bin/env python3
"""Recover the destination-harvest rows that failed to resolve on MORPHOLOGY, not on data.

The 2026-10-07 open-SERP harvest resolved 4,911 rows to 2,008 cities and left 2,265
unresolved. Reading that file rather than assuming it, most of the residue is correctly
refused: `rhode island` and `new hampshire` are states, `cape cod` is a region,
`turks and caicos` is a territory, `和歌山県` is a prefecture, `名古屋駅` is a station and
`鳴子観光ホテル` is a hotel. None of those is a city and none should become a city page.

But one class is a bug in the resolver and not a gap in the data. Turkish agglutinates its
locative case onto the place name, and the harvest recorded the inflected form:

    izmirde gezilecek yerler   5,200    izmir  IS in the gazetteer, population 2,938,292
    urlada gezilecek yerler    5,400    urla   IS in the gazetteer, population 62,989

Turkish is also the largest unresolved language at 468 rows of 2,265, which is what makes
this worth a pass. Japanese administrative suffixes are the same shape of problem.

THE RULE THAT KEEPS THIS HONEST. A stripped form is accepted ONLY when:

  1 the UNSTRIPPED form does not resolve, so nothing that already worked is touched;
  2 the stripped form resolves to exactly one gazetteer city, or to one that dominates the
    alternatives by population by at least a factor of ten. This is the Barcelona rule: the
    reach file carries city_country because keying on the name alone once let Barcelona,
    Venezuela inherit the measured demand of Barcelona, Spain;
  3 at least three characters remain, so a suffix strip cannot manufacture a match out of a
    fragment.

Everything else stays unresolved and is written out with the reason, so the refusals remain
auditable rather than disappearing.

Output: data/atlas/measurements/destination-harvest/resolved-cities-2026-10-08.csv, in the
same schema as the two existing harvests, to be ADDED to them and never substituted.
"""
import csv, json, glob, os, re, sys, unicodedata, collections

ROOT = '/home/user/Livdar-eSim/'
HARVEST = ROOT + 'data/atlas/measurements/destination-harvest/'
OUT = HARVEST + 'resolved-cities-2026-10-08.csv'
REFUSED = HARVEST + 'still-unresolved-2026-10-08.csv'
MIN_STEM = 3
DOMINANCE = 10.0

# Turkish locative and ablative, with vowel harmony and the consonant-assimilated variants.
# Longest first, so -dan is tried before -da.
TR_SUFFIXES = ('ndan', 'nden', 'tan', 'ten', 'dan', 'den', 'nda', 'nde', 'ta', 'te', 'da', 'de')
# Japanese administrative suffixes that sit ON a city name. Deliberately NOT 県 (prefecture),
# 諸島 (islands), 半島 (peninsula), 駅 (station) or 湖 (lake): those are not cities, and the
# rows carrying them are refused correctly.
JA_SUFFIXES = ('市', '町', '村', '区', '郡')

LANG_MARKET = {'en': ['en-GB', 'en-US'], 'de': ['de-DE'], 'it': ['it-IT'], 'es': ['es-ES'],
               'tr': ['tr-TR'], 'nl': ['nl-NL'], 'pt': ['pt-BR'], 'ja': ['ja-JP'],
               'fr': ['fr-FR'], 'sv': [], 'pl': ['pl-PL']}


def fold(t):
    t = unicodedata.normalize('NFKD', (t or '').lower().strip())
    return ''.join(c for c in t if not unicodedata.combining(c))


idx = collections.defaultdict(list)
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('name') and c.get('id'):
            idx[fold(c['name'])].append(c)
print(f'gazetteer: {len(idx):,} distinct folded city names', file=sys.stderr)


def resolve(name):
    """One city, or None. Returns (city, why)."""
    hits = idx.get(fold(name))
    if not hits:
        return None, 'no_gazetteer_match'
    if len(hits) == 1:
        return hits[0], 'unique'
    hits = sorted(hits, key=lambda c: -(c.get('population') or 0))
    top, nxt = hits[0], hits[1]
    tp, np_ = (top.get('population') or 0), (nxt.get('population') or 0)
    if np_ == 0 or tp / max(np_, 1) >= DOMINANCE:
        return top, f'dominant_{tp}_vs_{np_}'
    return None, f'ambiguous_{len(hits)}_candidates_{tp}_vs_{np_}'


def candidates(entity, lang):
    """The stems worth trying for this entity, in order, after the entity itself."""
    e = entity.strip()
    out = []
    if lang == 'tr':
        low = fold(e)
        for s in TR_SUFFIXES:
            if low.endswith(s) and len(low) - len(s) >= MIN_STEM:
                out.append((e[:len(e) - len(s)], f'tr_stripped_-{s}'))
    elif lang == 'ja':
        for s in JA_SUFFIXES:
            if e.endswith(s) and len(e) - len(s) >= 1:
                out.append((e[:-len(s)], f'ja_stripped_{s}'))
    # THE TRAILING-TOKEN RULE WAS TRIED AND REMOVED. "Drop the last word and try again" looked
    # like a cheap way to rescue "muscatine iowa", and on a first run it recovered 176 rows and
    # three wrong entities with them:
    #
    #   bad schandau       -> Bad, INDIA      a German town's name cut to a fragment that
    #                                         happens to be a real Indian place. This is
    #                                         exactly the Barcelona, Venezuela bug the reach
    #                                         file carries city_country to prevent.
    #   schleswig holstein -> Schleswig, DE   the keyword is about the STATE, not the town
    #   washington state   -> Washington, US  likewise
    #
    # The rule cannot tell a noise modifier from a load-bearing part of the name, and a wrong
    # entity is worse than a missing one: it puts a page about Bad Schandau under an Indian
    # city. Only linguistically principled morphology survives, which is Turkish case and
    # Japanese administrative suffixes above.
    return out


rows = list(csv.DictReader(open(HARVEST + 'unresolved-2026-10-07.csv')))
print(f'{len(rows):,} unresolved rows to re-examine', file=sys.stderr)

recovered, refused = [], []
stats = collections.Counter()
seen = set()
for r in rows:
    ent, lang = (r.get('entity') or '').strip(), (r.get('language') or '').strip()
    try:
        vol = int(r.get('volume') or 0)
    except ValueError:
        vol = 0
    if not ent:
        stats['refused_empty_entity'] += 1
        refused.append({**r, 'reason': 'empty_entity'})
        continue
    # RULE 1: never touch anything that already resolves.
    city, why = resolve(ent)
    if city:
        stats['already_resolves_left_alone'] += 1
        refused.append({**r, 'reason': f'unstripped_form_resolves_{why}'})
        continue
    hit = None
    for stem, how in candidates(ent, lang):
        if len(fold(stem)) < MIN_STEM:
            continue
        c, w = resolve(stem)
        if c:
            hit = (c, f'{how}:{w}', stem)
            break
    if not hit:
        stats['refused_no_match'] += 1
        refused.append({**r, 'reason': 'no_match_after_morphology'})
        continue
    city, how, stem = hit
    for mkt in LANG_MARKET.get(lang, []):
        key = (mkt, lang, str(city['id']))
        if key in seen:
            continue
        seen.add(key)
        recovered.append({
            'searcher_market': mkt, 'language': lang,
            'city': city['name'], 'city_country': city.get('country') or '',
            'city_id': str(city['id']), 'volume': vol,
            'source_keyword': r.get('source_keyword') or '', 'how_resolved': how,
        })
    stats['recovered_' + (how.split(':')[0])] += 1

os.makedirs(HARVEST, exist_ok=True)
with open(OUT, 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=['searcher_market', 'language', 'city', 'city_country',
                                       'city_id', 'volume', 'source_keyword', 'how_resolved'])
    w.writeheader()
    w.writerows(recovered)
with open(REFUSED, 'w', newline='') as fh:
    if refused:
        w = csv.DictWriter(fh, fieldnames=list(refused[0].keys()))
        w.writeheader()
        w.writerows(refused)

print(f'\nrecovered {len(recovered):,} market-and-language rows '
      f'over {len({r["city_id"] for r in recovered}):,} distinct cities')
print(f'still refused {len(refused):,}')
for k, v in sorted(stats.items(), key=lambda kv: -kv[1]):
    print(f'  {k:46} {v:>6,}')
print(f'wrote {OUT}')
