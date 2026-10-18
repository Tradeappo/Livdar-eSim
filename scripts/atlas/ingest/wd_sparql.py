#!/usr/bin/env python3
"""One SPARQL client for every Wikidata fetcher in this directory.

Nine scripts here each carried their own copy of the same `ask`, the same endpoint list
and the same retry ladder. Three of those copies had already drifted: two still rotated
endpoints round robin after the measurement that said to try them in order, and one still
waited 62 seconds per host on a limiter reading that turned out to be an artefact of
HTTP/1.1. A tenth copy would have drifted too, so there is one here instead.

Importing this module fetches nothing. That is not an aesthetic preference: the module it
replaces runs a capture at import time, and importing it to borrow `ask` once cost an
unintended materialisation pass.

WHY QLEVER FIRST. query.wikidata.org and query-main.wikidata.org answer about two queries
from this container and then 429. qlever.dev serves the same dump and was checked against
WDQS twice before being trusted: identical item sets and identical labels on
botanical_garden x DE (147 items) and beach x GR (782 shared items). QLever does not
implement SERVICE wikibase:label, so callers ask for rdfs:label with a LANG filter, which
both engines accept. Endpoints are tried in ORDER, not rotated, so every query reaches the
mirror first and the Wikimedia hosts only when the mirror has actually failed.
"""
import json, os, subprocess, tempfile, time

ENDPOINTS = ['https://qlever.dev/api/wikidata',
             'https://query-main.wikidata.org/sparql',
             'https://query.wikidata.org/sparql']
PAUSE = float(os.environ.get('WD_HOST_PAUSE', '2.0'))
CAP = 10000
_last = {e: 0.0 for e in ENDPOINTS}

PREFIXES = """PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX psn: <http://www.wikidata.org/prop/statement/value-normalized/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
"""

# The eleven Wikipedia editions this inventory can measure readership in. A sitelink to any
# other edition is real and is of no use here, because there is no clickstream capture for it.
WIKIS = ['en', 'de', 'fr', 'it', 'es', 'ja', 'pl', 'nl', 'pt', 'tr', 'zh']
SITE_FILTER = ' || '.join(
    'STRSTARTS(STR(?site), "https://%s.wikipedia.org/wiki/")' % w for w in WIKIS)


def ask(q, timeout=180, attempts=8, quiet=False):
    """One SPARQL query. Returns the bindings list, or None when every attempt failed.

    A 400 is returned as a failure like any other, and the caller is expected to treat a
    whole-batch failure as suspicious rather than as an empty answer: one malformed id in a
    VALUES clause makes the server reject the entire query, which has cost this project 599
    good rows once already.
    """
    for attempt in range(attempts):
        ep = ENDPOINTS[attempt % len(ENDPOINTS)]
        gap = PAUSE - (time.time() - _last[ep])
        if gap > 0:
            time.sleep(gap)
        qp = None
        try:
            with tempfile.NamedTemporaryFile('w', suffix='.rq', delete=False) as tf:
                tf.write(q)
                qp = tf.name
            _last[ep] = time.time()
            r = subprocess.run(
                ['curl', '-sS', '--compressed', '--http2', '--max-time', str(timeout),
                 '-A', 'LivdarCandidateInventory/1.0 (offline research inventory)',
                 '-H', 'Accept: application/sparql-results+json',
                 '--data-urlencode', 'query@' + qp, '--data', 'format=json',
                 '-w', '\n%{http_code}', ep],
                capture_output=True, text=True)
            if r.returncode != 0:
                raise RuntimeError('curl exit %d: %s' % (r.returncode, r.stderr[:160]))
            body, _, code = r.stdout.rpartition('\n')
            code = (code or '').strip()
            if code == '429':
                time.sleep(20 * (attempt + 1))
                continue
            if code != '200':
                raise RuntimeError('http %s from %s: %s' % (code, ep, body[:200]))
            return json.loads(body)['results']['bindings']
        except Exception as e:
            _last[ep] = time.time()
            if not quiet:
                print('    ask failed on %s: %s: %s' % (ep, type(e).__name__, str(e)[:160]),
                      flush=True)
            time.sleep(5 * (attempt + 1))
        finally:
            if qp:
                try:
                    os.unlink(qp)
                except OSError:
                    pass
    return None


def qid_of(iri):
    """The item id in a Wikidata entity IRI, or None when the IRI is not one."""
    s = str(iri or '')
    if not s.startswith('http://www.wikidata.org/entity/Q'):
        return None
    return s.rsplit('/', 1)[-1]


def sitelink_parts(url):
    """(language, article title) for a Wikipedia URL, or None when it is not one of ours."""
    s = str(url or '')
    if '.wikipedia.org/wiki/' not in s:
        return None
    host, _, path = s.partition('.wikipedia.org/wiki/')
    lang = host.rsplit('/', 1)[-1]
    if lang not in WIKIS or not path:
        return None
    import urllib.parse
    return lang, urllib.parse.unquote(path).replace('_', ' ')
