#!/usr/bin/env python3
"""Per-language Wikipedia article titles for every city in the gazetteer, from Wikidata.

WHY A SECOND SITELINK FILE EXISTS. data/atlas/sources/geonames/city-sitelinks.jsonl.gz holds
19,594 cities: the ones whose GeoNames alternateNamesV2 record happens to carry a `wkdt`
alternate name. That capture asked GeoNames which cities know their Wikidata item. This one
asks Wikidata which items know their GeoNames city, which is the same join from the other
side and is not limited by what GeoNames chose to record. The store has 64,418 cities and
52,865 of them are tier 4, the open tail the paid keyword corpus never reached, so the 35%
coverage of the older file is exactly the wrong 35% for the tail.

WHAT IT IS FOR. The article TITLE is not the signal; it is the key needed to read the signal.
Wikimedia publishes per-article, per-language-edition pageviews, and a pageview is a COUNT of
people in a language community looking a place up. That is the free, measured, per-entity
demand signal that replaces a paid keyword subscription for the one question the tier cap
asks: is this city looked for at all, in this language. Without a title per language there is
nothing to count.

HOW. The query is driven by explicit GeoNames IDs rather than by country, because `?item
wdt:P17 wd:Q30` plus a sitelink join is tens of thousands of items wide and times out, while
500 named IDs resolve in a second and return exactly the rows asked for. Nothing is inferred
by name matching: a row exists only where a Wikidata item states this GeoNames ID (P1566).

Licence: Wikidata is CC0. Attribution is recorded in the provenance file anyway.

Usage: wikidata-city-sitelinks.py [out.jsonl.gz] [--chunk 500] [--limit N]
"""
import collections, glob, gzip, json, os, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/wikidata/city-sitelinks-from-wikidata.jsonl.gz'
LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'tr', 'zh']
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
# TWO ENDPOINTS OVER THE SAME DATA, in the order they are tried.
#
# query.wikidata.org is the canonical service and it is unusable from this container at this
# scale: it serves about two queries and then answers 429 with `retry-after: 1000`, seventeen
# minutes, because the agent proxy's egress address is shared and its share of query time is
# spent. 215 chunks at two per seventeen minutes is thirty hours.
#
# qlever.dev hosts the same Wikidata dump on the QLever engine, publicly and free. The same
# query there answers in 1.2 seconds, and - checked rather than assumed - returns the IDENTICAL
# 991 result rows for the same 300 ids that WDQS returns, as a set, not merely the same count.
# That equality is the only reason it is used: a second endpoint that answered differently
# would be a second source, with its own provenance, not a mirror.
#
# QLever requires every prefix to be declared, which the canonical service supplies implicitly.
# Declaring them explicitly is valid at both, so one query text serves both.
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
_TMP = tempfile.mkdtemp(prefix='livdar-wdqs-')

# The language is selected by NAMING THE ELEVEN SITES, not by computing a language out of
# every sitelink and filtering on the result. The first version did the latter - BIND a
# STRBEFORE(STRAFTER(...)) over ?site and FILTER the computed string - and it was the whole
# cost of this capture: an item with three hundred sitelinks had three hundred strings built
# and compared, three hundred times per chunk, and a 300-id chunk took about two minutes.
# Naming the sites turns that into an index lookup on eleven IRIs and the same chunk answers
# in four and a half seconds. Twenty-five times, from a rewrite that changes no result: the
# ids returned are identical, which is the only reason it is a rewrite and not a different
# query.
SITES = ' '.join('<https://%s.wikipedia.org/>' % l for l in LANGS)
QUERY = """PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX schema: <http://schema.org/>
SELECT ?gnid ?site ?name WHERE {
  VALUES ?gnid { %s }
  VALUES ?site { """ + SITES + """ }
  ?item wdt:P1566 ?gnid .
  ?art schema:about ?item ; schema:isPartOf ?site ; schema:name ?name .
}"""


def city_ids():
    ids = []
    for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
        d = json.load(open(f, encoding='utf-8'))
        lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
        for c in lst:
            if c and c.get('id'):
                ids.append(str(c['id']))
    return sorted(set(ids), key=int)


def ask(gnids, tries=3):
    """One SPARQL POST, tried at each endpoint in turn. Returns (bindings, status).

    THE THREE FAILURES ARE NOT ONE FAILURE, and an earlier version of this treated them as one
    and stalled for half an hour at a time:

      429       the caller has spent its share of query time. The service says for how long in
                `retry-after`, and that number is honoured rather than guessed at - WDQS asks
                for a thousand seconds, which no invented backoff would have waited and no
                amount of retrying would have shortened. Splitting the batch is exactly wrong
                here: half the ids is another request.
      a timeout this batch was too much work in the service's own limit. SPLIT: half the ids
                really is half the work.
      a reset   the transfer died in the agent proxy. The probe failed, not the service, and
                the two must not be conflated. Retried as-is.
    """
    q = QUERY % ' '.join('"%s"' % g for g in gnids)
    body = os.path.join(_TMP, 'q-%d' % os.getpid())
    hdr = os.path.join(_TMP, 'h-%d' % os.getpid())
    for ep in ENDPOINTS:
        for i in range(tries):
            r = subprocess.run(['curl', '-sS', '--max-time', '120', '-A', UA,
                                '-H', 'Accept: application/sparql-results+json',
                                '--data-urlencode', 'query=' + q, '-D', hdr, '-o', body,
                                '-w', '%{http_code}', ep],
                               capture_output=True, text=True)
            code = (r.stdout or '').strip()
            text = headers = ''
            try:
                text = open(body, encoding='utf-8', errors='replace').read()
                headers = open(hdr, encoding='utf-8', errors='replace').read()
            except OSError:
                pass
            if code == '200' and text.lstrip().startswith('{'):
                try:
                    return json.loads(text)['results']['bindings'], 'ok'
                except (json.JSONDecodeError, KeyError):
                    pass
            if code == '429':
                wait = _retry_after(headers)
                if wait > 120:
                    break          # this endpoint is shut for the next quarter hour: move on
                time.sleep(wait)
                continue
            if 'TimeoutException' in text or 'QueryTimeout' in text or code == '500':
                return None, 'timeout'
            time.sleep(4 * (i + 1))
    return None, 'throttled'


def _retry_after(headers):
    for line in headers.splitlines():
        if line.lower().startswith('retry-after:'):
            try:
                return max(1, int(line.split(':', 1)[1].strip()))
            except ValueError:
                return 30
    return 30


def ask_splitting(gnids, floor=25):
    """ask(), splitting only on a TIMEOUT. A throttle is waited out inside ask()."""
    rows, status = ask(gnids)
    if status == 'ok':
        return rows, []
    if status == 'timeout' and len(gnids) > floor:
        mid = len(gnids) // 2
        a_rows, a_bad = ask_splitting(gnids[:mid], floor)
        b_rows, b_bad = ask_splitting(gnids[mid:], floor)
        return a_rows + b_rows, a_bad + b_bad
    return [], list(gnids)


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else OUT
    chunk = 1000
    limit = offset = None
    count = None
    for i, a in enumerate(sys.argv):
        if a == '--chunk': chunk = int(sys.argv[i + 1])
        if a == '--limit': limit = int(sys.argv[i + 1])
        if a == '--offset': offset = int(sys.argv[i + 1])
        if a == '--count': count = int(sys.argv[i + 1])
    ids = city_ids()
    if limit: ids = ids[:limit]
    # A contiguous slice of one deterministic id ordering, for re-running a range the
    # endpoints did not answer the first time without re-asking about the whole gazetteer.
    # The ordering is by integer id and does not depend on the slice, so a slice re-run
    # reproduces exactly the rows it produced before.
    if offset is not None:
        ids = ids[offset:offset + count] if count else ids[offset:]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    found = collections.defaultdict(dict)
    failed = []
    unanswered_path = out_path.replace('.jsonl.gz', '.unanswered.txt')
    for n in range(0, len(ids), chunk):
        part = ids[n:n + chunk]
        rows, bad = ask_splitting(part)
        failed.extend(bad)
        for b in rows:
            # the site IRI is https://<lang>.wikipedia.org/ by construction, because that is
            # the only shape the VALUES clause above can match
            lang = b['site']['value'].split('//', 1)[1].split('.', 1)[0]
            found[b['gnid']['value']][lang] = b['name']['value']
        print('  %d/%d ids, %d cities with an article, %d ids unanswered'
              % (n + len(part), len(ids), len(found), len(failed)), flush=True)
        time.sleep(0.5)
    with gzip.open(out_path, 'wt', encoding='utf-8') as fh:
        for gid in sorted(found, key=int):
            fh.write(json.dumps({'geonameid': gid, 'wikipedia_languages': found[gid]},
                                ensure_ascii=False) + '\n')
    per_lang = collections.Counter()
    for v in found.values():
        for l in v: per_lang[l] += 1
    prov = {
        'source': 'Wikidata Query Service, items stating a GeoNames ID (P1566)',
        'licence': 'Wikidata CC0 1.0, public domain dedication',
        'attribution': 'Wikidata, https://www.wikidata.org/',
        'endpoints_tried_in_order': ENDPOINTS,
        'endpoints_agree': 'checked on one 300-id chunk: both services returned the identical '
                           '991 result rows as a set, which is why the mirror is treated as '
                           'the same source rather than a second one',
        'fetched_on': time.strftime('%Y-%m-%d'),
        'cities_asked': len(ids),
        'cities_with_an_article_in_at_least_one_language': len(found),
        'cities_with_an_article_per_language': dict(per_lang.most_common()),
        'ids_the_endpoints_did_not_answer': len(failed),
        # THE FULL LIST, in a sidecar, not a sample in here. The join step subtracts these
        # from the asked set, because a city nobody got an answer about is UNMEASURED and must
        # not be read as a city with no article. A truncated list would silently promote
        # every id past the two-hundredth into "measured absent", which is the one conflation
        # this whole capture exists to avoid.
        'unanswered_ids_file': os.path.basename(unanswered_path),
        'why': 'The per-language article TITLE is the key for reading Wikimedia pageviews, '
               'which are a measured count of a language community looking a place up. The '
               'title is not itself evidence of demand and is never used as such.',
        'known_limit': 'zhwiki is one Wikipedia for Traditional and Simplified Chinese and '
                       'this file cannot split them, so a zh count is evidence for zh-Hant '
                       'only together with the Taiwanese market demand measured separately.',
    }
    with open(unanswered_path, 'w', encoding='utf-8') as fh:
        for g in failed:
            fh.write(g + '\n')
    json.dump(prov, open(out_path.replace('.jsonl.gz', '.provenance.json'), 'w',
                         encoding='utf-8'), indent=1, ensure_ascii=False)
    print('wrote %d cities to %s' % (len(found), out_path))
    if failed:
        print('WARNING: %d ids in failed chunks, re-run to fill them' % len(failed))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
