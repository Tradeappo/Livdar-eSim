#!/usr/bin/env python3
"""Per-language Wikipedia article titles for the captured water and protected-area entities.

WHY. wikidata-water-and-protected.py captured 895,123 entities and 124,132 of them state two
or more of the facts the thin-entity gate counts. Two facts and a coordinate are enough to
REFUSE a thin page; they are not enough to justify a page. The outdoor feature family's first
gate, NOTABLE, is satisfied by holding a Wikidata item at all, and that gate says so about
itself: it is a PROXY for interest, not a demand measurement.

This capture is what turns the proxy into a measurement. Wikimedia publishes, per article and
per language edition, the number of readers who arrived FROM A SEARCH ENGINE, and this
project already built that instrument for cities: scripts/atlas/scale/search_demand.py, with
floors calibrated per language and per side against the cities the paid keyword corpus had
already admitted. The instrument needs one thing these captures do not carry: the article
title in each language. That is all this file fetches.

The title does a second job on the way past. A page in German needs the German name, and a
localisation gate that has no German name for an entity is right to refuse the row. The
sitelink title is that name, stated by the language community that wrote the article, rather
than a transliteration this pipeline invented.

SCOPE, and why it is wider than the funnel can currently use. Only 34 countries have a parent
layer, and 84,755 of the 124,132 fact-bearing entities are inside one; the rest cannot clear
the PARENT gate today. They are captured anyway, because the readership reading is what
decides whether a parent layer for Finland, Russia, Norway or Canada is worth building, and
answering that after the capture costs nothing while re-running it later costs the capture
again. Which entities are in scope is recorded in the provenance, so a later reader knows the
file is not a funnel input list.

Nothing is inferred: a row exists only where Wikidata states a sitelink from the item to that
language edition.

Licence: Wikidata is CC0, a public domain dedication. Attribution is recorded anyway.

A SECOND CALLER, and why it is this file rather than a copy of it. The floor these readings
are compared against has to be calibrated on the population it will gate, and for an outdoor
feature that population is the 46,130 feature rows the pipeline has ALREADY admitted. Those
rows carry a Wikidata item and 34,638 of them have no sitelink capture, so the same fetch is
needed for a different id list. `--qids FILE --out PATH` does exactly that, which keeps one
implementation of the three-failure retry logic and one definition of what an unanswered id
means. A second script would be a second place for those to drift.

Usage: wikidata-water-sitelinks.py [--chunk 600] [--min-facts 2] [--limit N]
       wikidata-water-sitelinks.py --qids FILE --out PATH [--chunk 600]
Reads  data/atlas/sources/wikidata/water-and-protected-*.jsonl.gz, or --qids
Writes data/atlas/sources/wikidata/water-and-protected-sitelinks.jsonl.gz, or --out
       the same path with .provenance.json and .unanswered.txt beside it
"""
import collections, glob, gzip, json, os, re, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'data/atlas/sources/wikidata/'
OUT = SRC + 'water-and-protected-sitelinks.jsonl.gz'
# The eleven editions the pipeline has markets for. zh is one edition; the market is zh-Hant
# and search_demand.LANG_EDITION owns that mapping, not this file.
LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'tr', 'zh']
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
_TMP = tempfile.mkdtemp(prefix='livdar-wd-wsl-')

# Named site IRIs, not a computed language. Measured on the city capture: naming the eleven
# sites turned a 300-id chunk from about two minutes into four and a half seconds, because an
# item with three hundred sitelinks no longer has three hundred strings built and compared.
# Identical rows returned, which is the only reason it is a rewrite and not a different query.
SITES = ' '.join('<https://%s.wikipedia.org/>' % l for l in LANGS)
QUERY = """PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX schema: <http://schema.org/>
SELECT ?item ?site ?name WHERE {
  VALUES ?item { %s }
  VALUES ?site { """ + SITES + """ }
  ?art schema:about ?item ; schema:isPartOf ?site ; schema:name ?name .
}"""


def _retry_after(headers):
    for line in headers.splitlines():
        if line.lower().startswith('retry-after:'):
            try:
                return max(1, int(line.split(':', 1)[1].strip()))
            except ValueError:
                return 30
    return 30


# A VALUES clause takes entity IRIs, so one unparseable id is a 400 for the whole clause - not
# a timeout and not a throttle, so it falls past both and the chunk is recorded as unanswered.
# Measured: one admitted outdoor feature carries the OpenStreetMap tag value
# "Q1872230;Q5447595", a multi-value tag the mapper never resolved, and it turned 599 good ids
# into 600 unanswered ones. An id that cannot be asked about is refused HERE, by name, and
# counted apart from the ids an endpoint declined to answer: those are two different facts and
# only one of them is worth re-running.
# ONE definition, in entity_identity, which owns identity for this pipeline. This file
# carried its own copy of the rule for a few hours and the outdoor enrichment carried a
# third; the shared one is what stops them disagreeing about what an item id is.
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                   # noqa: E402
split_askable = entity_identity.split_askable


def ask(qids, tries=3):
    """Three failures that need three different answers, as the city capture established.

      429       the caller has spent its share of query time. The service says for how long,
                and that number is honoured: WDQS asks for a thousand seconds. Splitting is
                exactly wrong here, since half the ids is another request.
      a timeout the batch was too much work inside the service's own limit. SPLIT.
      a reset   the transfer died in the agent proxy. The probe failed, not the service.
                Retried as-is.
    """
    q = QUERY % ' '.join('wd:%s' % g for g in qids)
    body = os.path.join(_TMP, 'q-%d' % os.getpid())
    hdr = os.path.join(_TMP, 'h-%d' % os.getpid())
    for ep in ENDPOINTS:
        for i in range(tries):
            r = subprocess.run(['curl', '-sS', '--max-time', '180', '-A', UA,
                                '-H', 'Accept: application/sparql-results+json',
                                '--data-urlencode', 'query=' + q, '-D', hdr, '-o', body,
                                '-w', '%{http_code}', ep], capture_output=True, text=True)
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
                    break
                time.sleep(wait)
                continue
            if 'TimeoutException' in text or 'QueryTimeout' in text or code == '500':
                return None, 'timeout'
            time.sleep(4 * (i + 1))
    return None, 'throttled'


def ask_splitting(qids, floor=25):
    rows, status = ask(qids)
    if status == 'ok':
        return rows, []
    if status == 'timeout' and len(qids) > floor:
        mid = len(qids) // 2
        a_rows, a_bad = ask_splitting(qids[:mid], floor)
        b_rows, b_bad = ask_splitting(qids[mid:], floor)
        return a_rows + b_rows, a_bad + b_bad
    return [], list(qids)


def fact_bearing(min_facts):
    """Every captured entity stating at least `min_facts` of the captured facts.

    Sorted by the numeric part of the QID so a --limit slice and a re-run cover the same
    entities in the same order, and a partial capture can be resumed rather than redone.
    """
    out, by_cls = {}, collections.Counter()
    for f in sorted(glob.glob(SRC + 'water-and-protected-*.jsonl.gz')):
        if 'sitelinks' in os.path.basename(f):
            continue
        for line in gzip.open(f, 'rt', encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except Exception:
                continue
            if len(r.get('facts') or {}) < min_facts or not r.get('qid'):
                continue
            out[r['qid']] = r.get('cls')
            by_cls[r.get('cls')] += 1
    ids = sorted(out, key=lambda q: int(q[1:]) if q[1:].isdigit() else 0)
    return ids, out, by_cls


def main():
    chunk, min_facts, limit, offset = 600, 2, None, None
    qid_file = out_path = None
    for i, a in enumerate(sys.argv):
        if a == '--chunk': chunk = int(sys.argv[i + 1])
        if a == '--min-facts': min_facts = int(sys.argv[i + 1])
        if a == '--limit': limit = int(sys.argv[i + 1])
        if a == '--offset': offset = int(sys.argv[i + 1])
        if a == '--qids': qid_file = sys.argv[i + 1]
        if a == '--out': out_path = sys.argv[i + 1]
    if bool(qid_file) != bool(out_path):
        sys.exit('--qids and --out go together: writing an explicit id list into the water '
                 'capture\'s own path would overwrite a capture of a different population')
    global OUT
    if out_path:
        OUT = out_path if out_path.startswith('/') else ROOT + out_path
        ids = sorted({l.strip() for l in open(qid_file, encoding='utf-8') if l.strip()},
                     key=lambda q: int(q[1:]) if q[1:].isdigit() else 0)
        cls_of, by_cls = {}, collections.Counter()
        print('ids from %s: %d' % (qid_file, len(ids)), flush=True)
    else:
        ids, cls_of, by_cls = fact_bearing(min_facts)
        print('fact-bearing entities (%d or more facts): %d' % (min_facts, len(ids)), flush=True)
    if offset is not None:
        ids = ids[offset:]
    if limit:
        ids = ids[:limit]

    ids, malformed = split_askable(ids)
    if malformed:
        print('%d id(s) are not a Wikidata entity id and cannot be asked about: %s'
              % (len(malformed), ', '.join(malformed[:10])), file=sys.stderr)

    titles = collections.defaultdict(dict)
    failed, t0 = [], time.time()
    for n in range(0, len(ids), chunk):
        part = ids[n:n + chunk]
        rows, bad = ask_splitting(part)
        failed.extend(bad)
        for b in rows:
            qid = b['item']['value'].rsplit('/', 1)[-1]
            site = b['site']['value']
            lang = site.split('//', 1)[-1].split('.', 1)[0]
            if lang in LANGS:
                titles[qid][lang] = b['name']['value']
        if (n // chunk) % 10 == 0 or n + chunk >= len(ids):
            print('  %d/%d asked, %d with an article, %d unanswered, %.0fs'
                  % (min(n + chunk, len(ids)), len(ids), len(titles), len(failed),
                     time.time() - t0), flush=True)

    # One row per ASKED entity, so an entity with no article anywhere is recorded as asked and
    # answered rather than as missing. That distinction is the one that broke the first city
    # calibration: an entity nobody asked about and an entity with no article are not the same
    # state, and collapsing them turns silence into a measurement it is not.
    asked = set(ids) - set(failed)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for q in ids:
            if q in failed:
                continue
            fh.write(json.dumps({'qid': q, 'cls': cls_of.get(q),
                                 'titles': titles.get(q, {})}, ensure_ascii=False) + '\n')
    # The full list, not a truncated sample. A truncated failure list in an earlier capture
    # would have promoted every id past the two hundredth into "measured absent".
    with open(OUT.replace('.jsonl.gz', '.unanswered.txt'), 'w', encoding='utf-8') as fh:
        for q in failed:
            fh.write(q + '\n')

    per_lang = collections.Counter()
    for q in titles:
        for l in titles[q]:
            per_lang[l] += 1
    prov = {
        'source': 'Wikidata sitelinks (schema:about / schema:isPartOf) for the water and '
                  'protected-area entity capture',
        'licence': 'Wikidata CC0 1.0, public domain dedication',
        'attribution': 'Wikidata, https://www.wikidata.org/',
        'endpoints_tried_in_order': ENDPOINTS,
        'fetched_on': time.strftime('%Y-%m-%d'),
        'scope': ('the explicit id list %s' % qid_file) if qid_file else
                 ('every captured entity stating %d or more facts; NOT a funnel input list, '
                 'because only 34 countries have a parent layer and the readership reading '
                  'for the rest is what decides whether another parent layer is '
                  'worth building' % min_facts),
        'min_facts': None if qid_file else min_facts,
        'entities_asked': len(asked),
        'entities_unanswered': len(failed),
        'ids_not_a_wikidata_entity_id_and_so_never_asked': malformed,
        'entities_with_an_article_in_at_least_one_of_the_eleven': len(titles),
        'entities_asked_with_no_article_in_any_of_the_eleven': len(asked) - len(titles),
        'languages': LANGS,
        'articles_per_language': dict(per_lang.most_common()),
        'fact_bearing_per_class': dict(by_cls),
        'what_absence_means': 'a language missing from an entity row means Wikidata states no '
                              'sitelink to that edition, which is a measurement; an entity '
                              'missing from the file was not answered and is listed in the '
                              '.unanswered.txt sidecar',
        'nothing_is_inferred': 'no title is transliterated or constructed; a title appears '
                               'only where Wikidata states the sitelink',
    }
    with open(OUT.replace('.jsonl.gz', '.provenance.json'), 'w', encoding='utf-8') as fh:
        json.dump(prov, fh, indent=1, ensure_ascii=False)
    print('wrote %s' % OUT)
    print('  asked %d, with an article %d, no article %d, unanswered %d'
          % (len(asked), len(titles), len(asked) - len(titles), len(failed)))
    for l, n in per_lang.most_common():
        print('    %s %d' % (l, n))
    if failed:
        print('WARNING: %d ids unanswered, re-run to fill them' % len(failed))


if __name__ == '__main__':
    main()
