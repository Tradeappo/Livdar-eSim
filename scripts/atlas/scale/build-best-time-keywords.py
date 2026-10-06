#!/usr/bin/env python3
"""
Build the keyword list for weather.city-best-time, one keyword per (language, city).

Why this exists. The family generated 29,210 rows across the whole gazetteer and every one was
rejected, on a SERP class copied from "wetter konstanz" and "spokane weather" - plain current
weather queries whose SERP is a knowledge card. Measured on its OWN intent on 2026-10-06 the
family reads 350 to 6,000 a month in en-US at keyword difficulty 0 to 8, and 200 to 7,800 in
German at difficulty 0 or 1, on a SERP where a DOMAIN RATING 9 page with zero backlinks sits
at position 8. So the family is real and the rejection was an artifact.

But the tail probe on the same day refuted the obvious gate. Cities that HAVE a things-to-do
page read zero for best time (Akron 0, Tulsa 0, Konstanz 0, Leipzig 0, Rostock 0, Lille 0,
Marseille 0, Strasbourg 0) and cities with NO things-to-do page read strongly (Sedona 2,400,
Charleston 400, Savannah 150). The intent follows "is this a place whose season decides the
trip", which neither population nor POI count nor a sibling family predicts. The brief's own
rule applies: demand is not inferred, it is measured. So every city in this family has to be
measured one keyword at a time, and population is used ONLY to order the measurement queue.

The phrasing per language is itself a measurement. "meilleure periode pour visiter rome" reads
20 and "quand partir a rome" reads 250, a factor of twelve, and the parent_topic column is what
exposed it. The same check moved Italian to "quando andare a" and Dutch to "beste reistijd".

Usage: build-best-time-keywords.py [cities-per-language]
Writes data/atlas/measurements/best-time-keyword-queue-2026-10-06.json
"""
import collections, csv, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                              # noqa: E402

REP = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
OUT = ROOT + 'data/atlas/measurements/best-time-keyword-queue-2026-10-06.json'

# Measured on 2026-10-06 against fifteen head destinations per language, then checked against a
# twenty-city tail. The variant in the comment is the one that lost.
PHRASE = {
    'en': ('best time to visit {c}', 'us'),          # 350 to 6,000, difficulty 0 to 8
    'de': ('beste reisezeit {c}', 'de'),             # 200 to 7,800, difficulty 0 or 1
    'fr': ('quand partir a {c}', 'fr'),              # 60 to 3,500; beat "meilleure periode" 12x
    'it': ('quando andare a {c}', 'it'),             # 20 to 900
    'es': ('mejor epoca para viajar a {c}', 'es'),   # 20 to 1,700; beat "cuando ir a"
    'nl': ('beste reistijd {c}', 'nl'),              # 20 to 1,800
    'ja': ('{c} ベストシーズン', 'jp'),                # 50 to 2,200
}
# Measured and REFUSED at city level on the same pass, so they are not queued at all:
#   pl  rzym 10, paryz 0, barcelona 0, londyn 0, tokio 10, nowy jork 0, wenecja 0, wieden 0
#   pt  roma 20, paris 10, nova york 0, londres 20, lisboa 0, barcelona 0, madri 0
#   tr  roma 0, barselona 0, istanbul 0, lizbon 0, atina 0, londra 10, paris 20
# Each of the three reads at COUNTRY level instead (tajlandia, tailandia, tayland), which is the
# climate.country-best-time family, not this one.
REFUSED_AT_CITY_LEVEL = {'pl': 'rzym 10, paryz 0, barcelona 0, londyn 0, nowy jork 0',
                         'pt': 'roma 20, paris 10, nova york 0, lisboa 0, barcelona 0',
                         'tr': 'roma 0, barselona 0, istanbul 0, lizbon 0, atina 0'}
UNMEASURED = {'zh-Hant': 'no phrasing has been read for Traditional Chinese yet'}


def localised_names():
    """{geonameid: {lang: name}} from the GeoNames alternate-name store."""
    out = {}
    p = ROOT + 'data/atlas/sources/geonames/altnames-by-language.jsonl.gz'
    with gzip.open(p, 'rt', encoding='utf-8') as fh:
        for line in fh:
            if not line.strip():
                continue
            try:
                o = json.loads(line)
            except ValueError:
                continue
            gid = str(o.get('geonameid') or '')
            names = o.get('names') or {}
            if gid and names:
                out[gid] = {k: (v or {}).get('name') for k, v in names.items()
                            if (v or {}).get('name')}
    return out


def candidates():
    """{lang: [(geonameid, ascii_name, country)]} from the rows the family already generated."""
    out = collections.defaultdict(dict)
    with gzip.open(REP + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'rt',
                   encoding='utf-8', newline='') as fh:
        for r in csv.DictReader(fh):
            if (r.get('family') or '') != 'weather.city-best-time':
                continue
            lang = entity_identity.MKT_LANG.get(r.get('market') or '', '')
            if lang not in PHRASE:
                continue
            gid = (r.get('entity_id') or '').strip()
            if gid:
                out[lang][gid] = (r.get('entity_name') or '', r.get('country') or '')
    return out


def main():
    per_lang = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    loc = localised_names()
    cand = candidates()
    gaz = entity_identity.load_gazetteer()

    def population(gid):
        rec = gaz.by_id.get(gid) or {}
        try:
            return int(rec.get('population') or 0)
        except (TypeError, ValueError):
            return 0

    queue = {}
    for lang, (tmpl, country) in PHRASE.items():
        rows = []
        for gid, (name, cc) in cand.get(lang, {}).items():
            local = (loc.get(gid) or {}).get(lang) or name
            if not local:
                continue
            # A comma inside a city name splits the keyword in two when the list is sent as a
            # comma-separated string. "quando andare a Nagano, Nagano" came back from Ahrefs as
            # the keyword "nagano" at 800 a month, which is a different query about a different
            # thing, and it would have been recorded as evidence for this family.
            local = local.replace(',', ' ').replace('  ', ' ').strip()
            name = name.replace(',', ' ').replace('  ', ' ').strip()
            rows.append({'geonameid': gid, 'city': name, 'country': cc,
                         'name_in_this_language': local,
                         'name_is_localised': bool((loc.get(gid) or {}).get(lang)),
                         'population': population(gid),
                         'keyword': tmpl.format(c=local)})
        # Population orders the MEASUREMENT QUEUE and nothing else. It is not evidence of demand
        # and no admission decision reads it: Sedona at 2,400 a month has 9,700 people.
        rows.sort(key=lambda r: -r['population'])
        seen, dedup = set(), []
        for r in rows:
            k = r['keyword'].casefold()
            if k in seen:
                continue
            seen.add(k)
            dedup.append(r)
        queue[lang] = {'country_for_ahrefs': country, 'template': tmpl,
                       'cities_available': len(dedup),
                       'wave_1': dedup[:per_lang], 'remaining': dedup[per_lang:]}

    json.dump({
        'generated_on': '2026-10-06',
        'family': 'weather.city-best-time',
        'what_this_is': ('one keyword per (language, city) for the family, ordered by population '
                         'so the measurement queue has an order, with the city name taken from '
                         'the GeoNames alternate-name store in that language where one exists'),
        'the_phrasing_is_itself_a_measurement': {
            lang: {'template': t, 'ahrefs_country': c} for lang, (t, c) in PHRASE.items()},
        'refused_at_city_level_with_the_readings': REFUSED_AT_CITY_LEVEL,
        'not_yet_measured': UNMEASURED,
        'population_is_only_an_ordering': (
            'Sedona reads 2,400 a month and has 9,700 people; Tulsa reads zero and has 400,000. '
            'Population orders the queue so there is an order. No admission reads it.'),
        'queue': {lang: {k: v for k, v in q.items() if k != 'remaining'}
                  for lang, q in queue.items()},
        'remaining_after_wave_1': {lang: len(q['remaining']) for lang, q in queue.items()},
        'full_queue_including_remaining': queue,
    }, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    for lang, q in queue.items():
        n_loc = sum(1 for r in q['wave_1'] if r['name_is_localised'])
        print(f"{lang:<4} {q['cities_available']:>6,} cities, wave 1 = {len(q['wave_1'])}, "
              f"{n_loc} of them with a name in that language")
    print(f'\nwritten {OUT}')


if __name__ == '__main__':
    main()
