#!/usr/bin/env python3
"""Join the National Heritage List for England to Wikipedia, through Wikidata's P1216.

WHY THIS JOIN EXISTS. The NHLE holds 379,685 listed buildings with a grade, a listing year,
coordinates and an official record URL, under the Open Government Licence. That is real,
official data, and it is also why the register has sat unused: the entries are overwhelmingly
ordinary houses and garden walls. This project's own provenance note already refused a page per
entry, in those words: "a page for each of the 348,219 Grade II entries would be thin and would
read as a doorway".

The refusal was right about the REGISTER and wrong as a verdict on every entry in it, because
it was a judgement about the population rather than a measurement of the members. Wikidata
states the Historic England list entry number as P1216, so the register can be joined to
Wikipedia, and from there to the clickstream, which counts the readers who reached an article
from a search engine. That turns "which of these does anybody actually look up" from an opinion
into a number.

WHAT THE JOIN IS, and what it deliberately leaves out. Only items carrying BOTH P1216 and an
English Wikipedia article are fetched: the article title is the key the clickstream is read
with, so an item without one cannot be measured and is not captured. That is a measurement
boundary and not a claim that such a building is unimportant.

Measured on 2026-10-18: 19,561 items carry P1216 and an English article, 16,924 of them match a
row in the captured register, and 7,884 of those read at or above the calibrated entity floor
of 28 search-referred readers a month, median 82, maximum 22,614.

Licence: Wikidata is CC0, a public domain dedication. The register is Historic England under
the Open Government Licence v3.0, which requires attribution and is recorded on every row the
builder emits.

Usage: wikidata-heritage-sitelinks.py
Writes data/atlas/sources/heritage/nhle-wikipedia.json
"""
import json, os, subprocess, sys, time

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/heritage/nhle-wikipedia.json'
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
QUERY = """PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX schema: <http://schema.org/>
SELECT ?x ?nhle ?name WHERE {
  ?x wdt:P1216 ?nhle .
  ?art schema:about ?x ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?name .
}"""


def ask(q, tries=6):
    import tempfile
    tmp = tempfile.mkdtemp(prefix='livdar-nhle-')
    body = os.path.join(tmp, 'b')
    for attempt in range(tries):
        ep = ENDPOINTS[attempt % len(ENDPOINTS)]
        r = subprocess.run(['curl', '-sS', '--max-time', '300', '-A', UA,
                            '-H', 'Accept: application/sparql-results+json',
                            '--data-urlencode', 'query=' + q, '-o', body,
                            '-w', '%{http_code}', ep], capture_output=True, text=True)
        code = (r.stdout or '').strip()
        print('  %s -> %s' % (ep.split('/')[2], code), flush=True)
        if code == '200':
            try:
                return json.load(open(body, encoding='utf-8'))['results']['bindings'], ep
            except (ValueError, KeyError):
                pass
        # both services answer 429 from this shared egress after a bulk pass; waiting is the
        # only thing that helps and splitting would be another request
        time.sleep(20 * (attempt + 1))
    return None, None


def main():
    rows, ep = ask(QUERY)
    if rows is None:
        sys.exit('no endpoint answered; nothing written')
    out = {}
    for b in rows:
        nhle = str(b['nhle']['value']).strip()
        if not nhle:
            continue
        # one list entry can carry several items; the first wins and the count is recorded so a
        # later reader knows the collision exists rather than discovering it in a page title
        out.setdefault(nhle, {'qid': b['x']['value'].rsplit('/', 1)[-1],
                              'en_title': b['name']['value']})
    doc = {
        'what': 'Historic England list entry number (P1216) joined to the English Wikipedia '
                'article title, for the entries that have one',
        'why': 'the article title is the key the Wikimedia clickstream is read with, which is '
               'what turns "is this entry worth a page" from a judgement about the register '
               'into a measurement of the entry',
        'sources': ['Wikidata (CC0 1.0)',
                    'National Heritage List for England, Historic England (OGL v3.0)'],
        'attribution': 'Contains Historic England data licensed under the Open Government '
                       'Licence v3.0',
        'endpoint': ep,
        'fetched_on': time.strftime('%Y-%m-%d'),
        'items_with_p1216_and_an_english_article': len(out),
        'what_is_not_here': 'items with P1216 but no English article: they cannot be measured '
                            'on the clickstream, which is a boundary of the instrument and not '
                            'a verdict on the building',
        'entries': out,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(doc, open(OUT, 'w', encoding='utf-8'), sort_keys=True)
    print('wrote %s with %d entries' % (OUT, len(out)))


if __name__ == '__main__':
    sys.exit(main() or 0)
