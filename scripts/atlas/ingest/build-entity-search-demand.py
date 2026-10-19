#!/usr/bin/env python3
"""Join the water and protected-area sitelink titles to the clickstream, once.

This is the entity counterpart of build-city-search-demand.py and it is deliberately the same
shape, because the two feed one definition of the signal in scripts/atlas/scale/search_demand.py
and a second definition is how a gate drifts while still looking like a gate.

WHY AN ENTITY READING IS WORTH MORE HERE THAN IT IS FOR A CITY. The outdoor feature family's
first gate, NOTABLE, is satisfied by an entity holding a Wikidata item, and the family's own
docstring says what that is worth: a PROXY for interest, not a demand measurement. For the
captured water layer that proxy is not merely weak, it is vacuous - every row IS a Wikidata
item, so the gate admits all 123,887. The clickstream turns the proxy into a count of readers
who arrived at the article from a search engine, which is the question the gate was trying to
ask.

WHAT THE THREE STATES ARE, and they are not collapsed here any more than in the city join:

  the entity is absent from this file        no capture asked about it
  the entity is present, a language absent  Wikidata states no article in that edition
  the entity is present with a number       the median monthly search-referred readers, and a
                                            zero is a real reading: the clickstream omits any
                                            (referrer, article) pair under ten clicks a month
                                            for privacy, so an article with no row is measured
                                            as UNDER TEN, not unmeasured

THREE SITELINK FILES, and the table below records which of them is EXHAUSTIVE, because that
property and not the row count is what decides whether silence is a measurement:

  water-and-protected-sitelinks  driven by the fact-bearing entity list, so an entity in it
                                 with no title was asked and answered: no article exists.
  outdoor-feature-sitelinks      driven by the Wikidata ids of the outdoor features the
                                 pipeline has ALREADY ADMITTED. Those readings are what the
                                 floor is calibrated on, so they have to be in the same store
                                 as the readings the floor will judge - a floor measured with
                                 one instrument and applied to another is not a floor.
  entity-sitelinks               an older capture of 19,000 German entities. NOT exhaustive
                                 over anything this file knows about, so it contributes titles
                                 and its silence means nothing.

Usage: build-entity-search-demand.py
Reads  the sitelink files in SITELINKS below (+ their .unanswered.txt sidecars)
       data/atlas/sources/wikimedia/search-clicks.<lang>.tsv.gz
Writes data/atlas/sources/wikimedia/entity-search-demand.jsonl.gz
       data/atlas/sources/wikimedia/entity-search-demand.provenance.json
"""
import collections, glob, gzip, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
DIR = ROOT + 'data/atlas/sources/wikimedia/'
# (path, the key holding {lang: title}, exhaustive over its own id list)
SITELINKS = [
    ('data/atlas/sources/wikidata/water-and-protected-sitelinks.jsonl.gz', 'titles', True),
    ('data/atlas/sources/wikidata/outdoor-feature-sitelinks.jsonl.gz', 'titles', True),
    ('data/atlas/sources/wikidata/entity-sitelinks.jsonl.gz', 'wikipedia_languages', False),
]
# The landmark capture is a fourth exhaustive source and it arrives as one file per class.
# It is joined HERE rather than in a join of its own, because the floor in
# 1M-ENTITY-SEARCH-DEMAND-FLOOR.json is calibrated on readings produced by this file and a
# floor measured with one instrument and applied to another is not a floor. Its titles come
# from the Wikipedia sitelink itself rather than from a label, so an entity present here with
# no title in an edition genuinely has no article there.
for _dir in ('landmark', 'settlement', 'admin', 'heritage-register'):
    SITELINKS += [(os.path.relpath(_p, ROOT), 'titles', True)
                  for _p in sorted(glob.glob(ROOT + 'data/atlas/sources/wikidata/%s/'
                                             '*.jsonl.gz' % _dir))
                  if not os.path.basename(_p).startswith('_')]
OUT = DIR + 'entity-search-demand.jsonl.gz'


def main():
    titles, cls_of, asked, failed, used = {}, {}, set(), set(), []
    for rel, key, exhaustive in SITELINKS:
        p = ROOT + rel
        if not os.path.exists(p):
            print('  %s: not on disk, skipped' % rel, file=sys.stderr)
            continue
        used.append(rel)
        n = 0
        for line in gzip.open(p, 'rt', encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            d = json.loads(line)
            q = d.get('qid')
            if not q:
                continue
            n += 1
            if d.get(key):
                # update, not replace: two captures of one entity in different languages are
                # two halves of one answer, and replacing would silently drop the older half
                titles.setdefault(q, {}).update(d[key])
            if d.get('cls'):
                cls_of[q] = d['cls']
            if exhaustive:
                asked.add(q)
            elif q in titles:
                # a non-exhaustive file still ANSWERED about the ids it returned, so those are
                # measured; it is only its silence that carries no information
                asked.add(q)
        # Ids no endpoint answered about are UNMEASURED and must not enter the asked set: a
        # reading of nothing and no reading at all are different states, and that distinction
        # is the whole point of this file.
        sidecar = p.replace('.jsonl.gz', '.unanswered.txt')
        if os.path.exists(sidecar):
            bad = {l.strip() for l in open(sidecar, encoding='utf-8') if l.strip()}
            failed |= bad
        print('  %s: %d rows%s' % (rel, n, '' if exhaustive else ' (not exhaustive)'),
              flush=True)
    if not titles:
        sys.exit('no sitelink capture on disk; run wikidata-water-sitelinks.py first')
    asked -= failed
    print('entities asked %d, with an article %d, unanswered %d'
          % (len(asked), len(titles), len(failed)), flush=True)

    wanted = collections.defaultdict(dict)        # lang -> article -> [qids]
    for q, langs in titles.items():
        for l, art in langs.items():
            # The clickstream keys an article by its database title, which uses underscores
            # where the sitelink title uses spaces. Everything else about the title is left
            # exactly as the edition states it.
            wanted[l].setdefault(art.replace(' ', '_'), []).append(q)

    reading, per_lang = collections.defaultdict(dict), {}
    for lang in sorted(wanted):
        p = DIR + 'search-clicks.%s.tsv.gz' % lang
        if not os.path.exists(p):
            print('  %s: no clickstream table, skipped' % lang, file=sys.stderr)
            continue
        hit = {}
        t0 = time.time()
        with gzip.open(p, 'rt', encoding='utf-8') as fh:
            next(fh, None)
            for line in fh:
                a, _, rest = line.rstrip('\n').partition('\t')
                if a in wanted[lang]:
                    hit[a] = int(rest.split('\t')[0])
        pos = 0
        vals = []
        for art, qids in wanted[lang].items():
            v = hit.get(art, 0)
            if v:
                pos += 1
                vals.append(v)
            for q in qids:
                reading[q][lang] = v
        vals.sort()
        med = vals[len(vals) // 2] if vals else 0
        per_lang[lang] = {'entity_articles': len(wanted[lang]),
                          'with_ten_or_more_search_clicks_a_month': pos,
                          'median_of_the_positive_readings': med}
        print('  %s: %d entity articles, %d above the dump floor, median of those %d, %.0fs'
              % (lang, len(wanted[lang]), pos, med, time.time() - t0), flush=True)

    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for q in sorted(asked, key=lambda x: int(x[1:]) if x[1:].isdigit() else 0):
            fh.write(json.dumps({'qid': q, 'cls': cls_of.get(q),
                                 'clicks': reading.get(q, {})}, ensure_ascii=False) + '\n')
    prov = {
        'what': 'per entity that was asked about: the median monthly search-referred readers '
                'of its Wikipedia article, per language that has one',
        'built_on': time.strftime('%Y-%m-%d'),
        'title_half': {
            'files': used,
            'exhaustive': [r for r, _k, e in SITELINKS if e],
            'source': 'Wikidata sitelinks', 'licence': 'Wikidata CC0 1.0'},
        'count_half': {
            'file': 'data/atlas/sources/wikimedia/search-clicks.<lang>.tsv.gz',
            'source': 'Wikimedia clickstream, referrer class other-search',
            'licence': 'CC0 1.0'},
        'entities_asked': len(asked),
        'entities_unanswered_and_therefore_absent': len(failed),
        'entities_with_at_least_one_article': len(titles),
        'per_language': per_lang,
        'a_zero_is_a_reading': 'the clickstream omits any (referrer, article) pair under ten '
                               'clicks a month for privacy, so an article with no row is '
                               'measured as under ten rather than unmeasured',
        'what_this_does_not_establish': 'that a family intent exists in a market. It answers '
                                        'only whether this entity is sought by speakers of '
                                        'this language.',
    }
    json.dump(prov, open(OUT.replace('.jsonl.gz', '.provenance.json'), 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('wrote %s' % OUT)


if __name__ == '__main__':
    sys.exit(main() or 0)
