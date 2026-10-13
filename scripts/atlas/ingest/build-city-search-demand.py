#!/usr/bin/env python3
"""Join the clickstream tables to the city sitelinks: one small file the gate can read.

WHY A JOIN STEP RATHER THAN READING THE TABLES DIRECTLY. The clickstream covers every article
in a language edition - 1.1 million for German, 4.0 million for English, about 70 MiB
compressed across the eleven - and the inventory needs at most one reading per city per
language. Keeping the tables as the thing the gate reads would mean every consumer loading
tens of millions of rows to use a fraction of them, and would put a large derived blob in the
repository for no auditable gain. So the tables are a LOCAL capture, reproducible from the
dumps and ignored by git, and this step produces the record that is kept.

THE DISTINCTION THIS FILE EXISTS TO PRESERVE. Three states look alike and are not alike:

  the city was never ASKED about        UNMEASURED. No sitelink capture covers it, so nothing
                                        is known. It must not be admitted and it must not
                                        enter a calibration as a zero.
  asked, and the language has NO article MEASURED ABSENT. That language community has written
                                        nothing about this place, which is an answer.
  asked, article exists, no dump row     MEASURED AT UNDER TEN. The clickstream omits any
                                        (referrer, article) pair under ten clicks a month for
                                        reader privacy, so an existing article with no row
                                        read under ten. Also an answer.

The first of these was collapsed into the second on the first attempt at this, and the result
was a calibration in which 92 per cent of German home-market cities appeared to have no German
Wikipedia article. They have one; the capture had not reached them. A floor derived from that
would have been zero for almost every language, which is to say no floor at all, arrived at by
an arithmetic that looked impeccable. So the asked set is part of the record, not an assumption.

A row is written for every city that was ASKED. Its `clicks` map holds one entry per language
that has an article; a language absent from the map is measured absent. A city absent from the
file was never asked.

Usage: build-city-search-demand.py
"""
import collections, gzip, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
DIR = ROOT + 'data/atlas/sources/wikimedia/'
OUT = DIR + 'city-search-demand.jsonl.gz'

# (file, asks_about_every_city). The Wikidata capture is driven BY the gazetteer: every city id
# is put to WDQS, so a city it does not return has no article in any of the eleven languages
# and that is a measurement. The GeoNames capture is driven by which cities happen to carry a
# `wkdt` alternate name, so its silence about a city means nothing at all. The flag is the
# difference between a measurement and a gap and it is why this is a table rather than a list.
SITELINKS = [
    ('data/atlas/sources/wikidata/city-sitelinks-from-wikidata.jsonl.gz', True),
    # the cities GeoNames models as an administrative seat, whose article sits one P131 hop
    # away and is accepted only when its title names the same place. Covers only the gap the
    # first file leaves, so it adds cities and never overrides a direct sitelink.
    ('data/atlas/sources/wikidata/city-sitelinks-via-municipality.jsonl.gz', False),
    ('data/atlas/sources/geonames/city-sitelinks.jsonl.gz', False),
]


def city_ids():
    import glob
    ids = []
    for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
        d = json.load(open(f, encoding='utf-8'))
        lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
        for c in lst:
            if c and c.get('id'):
                ids.append(str(c['id']))
    return set(ids)


def load_titles():
    """(geonameid -> {lang: article}, asked set, sources used)."""
    t = collections.defaultdict(dict)
    asked = set()
    used = []
    for rel, exhaustive in reversed(SITELINKS):   # reversed so the preferred file applies last
        p = ROOT + rel
        if not os.path.exists(p):
            continue
        used.append(rel)
        for line in gzip.open(p, 'rt', encoding='utf-8'):
            d = json.loads(line)
            t[d['geonameid']].update(d['wikipedia_languages'])
            asked.add(d['geonameid'])
        if exhaustive:
            # this capture was driven by the gazetteer, so every city in it was asked about,
            # including the ones it returned nothing for
            # minus the ids the endpoints never answered about. Those are UNMEASURED: no
            # reading exists, which is a different thing from a reading of nothing, and the
            # whole asked/absent distinction above collapses if they are let in here.
            unanswered = ROOT + rel.replace('.jsonl.gz', '.unanswered.txt')
            failed = set()
            if os.path.exists(unanswered):
                failed = {l.strip() for l in open(unanswered, encoding='utf-8') if l.strip()}
            asked |= (city_ids() - failed)
    return dict(t), asked, used


def main():
    tl, asked, used = load_titles()
    if not tl:
        print('no sitelink file on disk; run wikidata-city-sitelinks.py first', file=sys.stderr)
        return 2
    wanted = collections.defaultdict(dict)                 # lang -> article -> [geonameids]
    for gid, langs in tl.items():
        for l, art in langs.items():
            wanted[l].setdefault(art.replace(' ', '_'), []).append(gid)

    reading = collections.defaultdict(dict)                # geonameid -> {lang: clicks}
    per_lang = {}
    for lang in sorted(wanted):
        p = DIR + 'search-clicks.%s.tsv.gz' % lang
        if not os.path.exists(p):
            print('  %s: no clickstream table, skipped' % lang, file=sys.stderr)
            continue
        hit = {}
        with gzip.open(p, 'rt', encoding='utf-8') as fh:
            next(fh, None)
            for line in fh:
                a, _, rest = line.rstrip('\n').partition('\t')
                if a in wanted[lang]:
                    hit[a] = int(rest.split('\t')[0])
        n_pos = 0
        for art, gids in wanted[lang].items():
            v = hit.get(art, 0)
            if v:
                n_pos += 1
            for gid in gids:
                reading[gid][lang] = v
        per_lang[lang] = {'city_articles': len(wanted[lang]),
                          'with_ten_or_more_search_clicks_a_month': n_pos}
        print('  %s: %d city articles, %d above the dump floor'
              % (lang, len(wanted[lang]), n_pos), flush=True)

    os.makedirs(DIR, exist_ok=True)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for gid in sorted(asked, key=int):
            fh.write(json.dumps({'geonameid': gid, 'clicks': reading.get(gid, {})},
                                ensure_ascii=False) + '\n')
    prov = {
        'what': 'per city that was asked about: the median monthly search-referred readers of '
                'that city\'s Wikipedia article, per language that has one',
        'built_on': time.strftime('%Y-%m-%d'),
        'title_half': {'files': used,
                       'source': 'Wikidata P1566 sitelinks and GeoNames alternateNamesV2 wkdt',
                       'licences': ['Wikidata CC0 1.0', 'GeoNames CC BY 4.0']},
        'count_half': {'file': 'data/atlas/sources/wikimedia/search-clicks.<lang>.tsv.gz',
                       'source': 'Wikimedia clickstream, referrer class other-search',
                       'licence': 'CC0 1.0',
                       'note': 'the tables are a local capture reproducible from the dumps '
                               'and are not tracked; see search-clicks.provenance.json'},
        'cities_asked': len(asked),
        'cities_with_at_least_one_article': len(reading),
        'per_language': per_lang,
        'a_row_in_this_file_means': 'this city was asked about',
        'a_language_absent_from_clicks_means': 'that language edition has no article about '
                                               'this place, which is a measurement',
        'a_zero_in_clicks_means': 'the article exists and had under ten search-referred clicks '
                                  'a month, the dump\'s own privacy floor. Also a measurement.',
        'a_city_absent_from_this_file_means': 'no capture asked about it, so NOTHING is known '
                                              'and it must not be admitted, nor counted as a '
                                              'zero in any calibration',
        'why': 'Read only to answer whether a CITY is sought by speakers of a language. It can '
               'never establish that a FAMILY intent exists in a market.',
    }
    json.dump(prov, open(OUT.replace('.jsonl.gz', '.provenance.json'), 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('wrote %d asked cities (%d with at least one article) to %s'
          % (len(asked), len(reading), OUT))
    return 0


if __name__ == '__main__':
    sys.exit(main())
