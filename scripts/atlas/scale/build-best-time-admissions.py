#!/usr/bin/env python3
"""
Turn the measured best-time readings into the admission table the manifest builder reads.

One row per (language, geonameid) that cleared the floor, with the keyword that was measured and
its volume and CPC, so the page can carry its own evidence and the gate can refuse everything
that was measured and read nothing. Cities that were never measured are NOT admitted and NOT
refused: they are listed as unmeasured, because an absence of evidence is not evidence.

Usage: build-best-time-admissions.py
Writes data/atlas/measurements/best-time-admissions-2026-10-06.json
"""
import glob, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
MEAS = ROOT + 'data/atlas/measurements/'
QUEUE = MEAS + 'best-time-keyword-queue-2026-10-06.json'
OUT = MEAS + 'best-time-admissions-2026-10-06.json'

# The floor per language, set at the level the wave was actually filtered at, so the table never
# claims a reading it did not take. English was filtered at 20 and the rest at 50.
FLOOR = {'en': 20, 'de': 50, 'fr': 50, 'it': 50}
# Measured and refused at city level on 2026-10-06, with the readings in
# destination-family-intent-2026-10-06.json. These languages are not admitted whatever a later
# wave finds for a single city, until the refusal is revisited with its own measurement.
REFUSED = {'es': '5 of 72 cities clear 50 a month',
           'pl': 'rzym 10, paryz 0, barcelona 0, londyn 0, nowy jork 0',
           'pt': 'roma 20, paris 10, nova york 0, lisboa 0, barcelona 0',
           'tr': 'roma 0, barselona 0, istanbul 0, lizbon 0, atina 0'}
UNMEASURED = {'nl': 'head probe only, 20 to 150 at city level',
              'ja': 'head probe only, 50 to 250 at city level',
              'zh-Hant': 'no phrasing read'}


def main():
    q = json.load(open(QUEUE, encoding='utf-8'))
    # keyword, casefolded, back to the city it was built from
    by_kw = {}
    for lang, block in q['full_queue_including_remaining'].items():
        for r in block['wave_1'] + block['remaining']:
            by_kw[(lang, r['keyword'].casefold())] = r

    admitted, unmatched = [], []
    waves = {}
    for path in sorted(glob.glob(MEAS + 'best-time/*-wave1.json')):
        d = json.load(open(path, encoding='utf-8'))
        lang = d['language']
        waves[lang] = {'submitted': d['keywords_submitted'],
                       'returned': d.get('rows_returned_at_volume_50_or_more')
                       or d.get('rows_returned_at_volume_20_or_more'),
                       'floor': FLOOR.get(lang), 'file': os.path.basename(path)}
        if lang not in FLOOR:
            continue
        for row in d['rows']:
            kw, vol, cpc = row[0], row[1], (row[2] if len(row) > 2 else None)
            city = by_kw.get((lang, kw.casefold()))
            if not city:
                unmatched.append({'language': lang, 'keyword': kw, 'volume': vol})
                continue
            if vol is None or vol < FLOOR[lang]:
                continue
            admitted.append({'language': lang, 'geonameid': city['geonameid'],
                             'city': city['city'], 'country': city['country'],
                             'keyword': kw, 'volume': vol, 'cpc_cents': cpc,
                             'floor_applied': FLOOR[lang]})
    admitted.sort(key=lambda r: (r['language'], -r['volume']))
    by_lang = {}
    for r in admitted:
        by_lang.setdefault(r['language'], []).append(r)

    json.dump({
        'generated_on': '2026-10-06',
        'family': 'weather.city-best-time',
        'what_this_is': ('the (language, city) pairs whose best-time keyword was measured and '
                         'cleared the floor. The manifest gate admits a page only for a pair in '
                         'this table, so the family can never fan out to a city nobody searches'),
        'the_floor_per_language': FLOOR,
        'refused_at_city_level': REFUSED,
        'measured_only_at_the_head_so_far': UNMEASURED,
        'waves_run': waves,
        'admitted_pairs': len(admitted),
        'admitted_by_language': {k: len(v) for k, v in by_lang.items()},
        'cities_still_unmeasured_by_language': {
            lang: len(b['wave_1']) + len(b['remaining'])
            - waves.get(lang, {}).get('submitted', 0)
            for lang, b in q['full_queue_including_remaining'].items()
            if lang in FLOOR},
        'keywords_returned_that_matched_no_queued_city': unmatched,
        'admissions': admitted,
        'licence_and_provenance': ('Ahrefs Keywords Explorer via the Ahrefs API v3 on '
                                   '2026-10-06. Per-wave detail under '
                                   'data/atlas/measurements/best-time/.'),
    }, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'admitted pairs: {len(admitted)}')
    for k, v in sorted(by_lang.items()):
        print(f'  {k}: {len(v)}  top {v[0]["city"]} at {v[0]["volume"]:,}')
    if unmatched:
        print(f'  unmatched keyword rows: {len(unmatched)}')
        for u in unmatched[:8]:
            print(f'    {u["language"]} {u["keyword"]!r} {u["volume"]}')


if __name__ == '__main__':
    main()
