#!/usr/bin/env python3
"""Capture the water and protected-area entity layers from Wikidata, with their facts.

WHY THESE CLASSES AND NOT OTHERS. wikipedia-list-intent.py measured, for free, which KINDS of
list speakers of a language actually search for. In English the strongest geographic readings
are national parks at 1,731 search-referred readers a month per list article, islands at 906,
rivers at 352, lakes at 349 and waterfalls at 333. Of those, only waterfalls have entities in
this repository: the OSM outdoor extract carries no lake, river, island or protected-area
class, and the .osm.pbf extracts it was built from are no longer in the container.

Wikidata holds all of them, CC0, and for some classes it holds them WITH the facts the
thin-entity gate wants. That matters more than the entity count, because the outdoor families
that already exist are short of neither entities nor demand: outdoors.beach is 582 rows against
25,885 captured beaches and outdoors.cave is 676 against 39,124, since an own page needs two
measured attributes and OSM rarely carries two.

AND IT IS CLASS BY CLASS, not a property of the source. Measured on the capture itself:
national parks arrive with two or more facts 76% of the time (1,861 of 2,437) and waterfalls
4.2% (592 of 13,975), which is no better than OSM. So this layer is not "Wikidata answers the
fact gate"; it is a source whose fact density has to be read per class before any family is
built on it. The per-class table in this capture's provenance file is that reading, and a class
that comes back thin stays unbuilt.

WHAT IS CAPTURED, and nothing is inferred: an entity appears only where Wikidata states its
class (P31), its country (P17) and its coordinates (P625). Facts are whatever Wikidata states
and are recorded per property, so the gate downstream counts real attributes rather than
trusting a total written here.

THE SHAPE A COUNT IMPLIES. "National park" proper is 2,437 entities worldwide while its list
reading is 1,731, so that reading belongs to the LIST of parks in a country, which is one
aggregation page per country, not a page per park. Q473972 protected area, at 40,217, is the
entity layer under it. The instrument measures an intent; the entity count says what shape of
page the intent can support, and conflating the two would mean 2,437 pages on a 1,731 reading
and a family declared validated.

Endpoint: qlever.dev, which hosts the same Wikidata dump as query.wikidata.org and was checked
against it on 2026-10-13, returning the identical result set for the same query. The canonical
service answers about two queries from this container before a 429 with retry-after: 1000.

Usage: wikidata-water-and-protected.py [--classes lake,river,...] [--page 10000]
"""
import collections, glob, gzip, json, os, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/wikidata/'
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
_TMP = tempfile.mkdtemp(prefix='livdar-wd-water-')

CLASSES = {
    'lake': 'Q23397',
    'river': 'Q4022',
    'island': 'Q23442',
    'waterfall': 'Q34038',
    'protected_area': 'Q473972',
    'national_park': 'Q46169',
}

# The facts the thin-entity gate counts. Each is a number or a date a reader came for, which is
# the bar the outdoor gate states: "2 measured attributes, more than one number for a reader".
FACTS = {
    'P2046': 'area',
    'P2043': 'length',
    'P4511': 'vertical_depth',
    'P2044': 'elevation',
    'P2048': 'height',
    'P2053': 'watershed_area',
    'P2225': 'discharge',
    'P571': 'inception',
    'P2250': 'max_depth',
}

QUERY = """PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?x ?country ?coord ?label %(vars)s WHERE {
  ?x wdt:P31 wd:%(qid)s ; wdt:P17 ?country ; wdt:P625 ?coord .
  OPTIONAL { ?x rdfs:label ?label . FILTER(LANG(?label) = "en") }
%(opts)s}
ORDER BY ?x
LIMIT %(limit)d OFFSET %(offset)d"""


def ask(q, tries=3):
    body = os.path.join(_TMP, 'q-%d' % os.getpid())
    hdr = os.path.join(_TMP, 'h-%d' % os.getpid())
    for ep in ENDPOINTS:
        for i in range(tries):
            r = subprocess.run(['curl', '-sS', '--max-time', '300', '-A', UA,
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
                wait = 30
                for line in headers.splitlines():
                    if line.lower().startswith('retry-after:'):
                        try:
                            wait = max(1, int(line.split(':', 1)[1].strip()))
                        except ValueError:
                            pass
                if wait > 120:
                    break          # this endpoint is shut for a quarter hour: move on
                time.sleep(wait)
                continue
            if 'TimeoutException' in text or 'QueryTimeout' in text or code == '500':
                return None, 'timeout'
            time.sleep(5 * (i + 1))
    return None, 'failed'


def qid_of(uri):
    return uri.rsplit('/', 1)[-1]


def capture(cls, qid, page):
    vars_ = ' '.join('?' + n for n in FACTS.values())
    opts = ''.join('  OPTIONAL { ?x wdt:%s ?%s . }\n' % (p, n) for p, n in FACTS.items())
    rows, offset, seen = [], 0, set()
    while True:
        q = QUERY % {'vars': vars_, 'opts': opts, 'qid': qid, 'limit': page, 'offset': offset}
        got, status = ask(q)
        if status != 'ok':
            print('    %s at offset %d: %s' % (cls, offset, status), flush=True)
            # a page that will not answer is a hole, and a hole reported is recoverable;
            # a hole treated as the end of the data is a silently short capture
            return rows, 'incomplete at offset %d (%s)' % (offset, status)
        if not got:
            break
        # one entity can repeat across rows when a property has several values; the facts are
        # merged rather than the entity duplicated, and a repeated value is kept once
        for b in got:
            x = qid_of(b['x']['value'])
            facts = {}
            for n in FACTS.values():
                if n in b and b[n].get('value') not in (None, ''):
                    facts[n] = b[n]['value']
            if x in seen:
                for r in rows:
                    if r['qid'] == x:
                        r['facts'].update(facts)
                        break
                continue
            seen.add(x)
            rows.append({
                'qid': x,
                'cls': cls,
                'country_qid': qid_of(b['country']['value']),
                'coord': b['coord']['value'],
                'name_en': (b.get('label') or {}).get('value'),
                'facts': facts,
            })
        offset += page
        if (offset // page) % 5 == 0:
            print('    %s: %d entities' % (cls, len(rows)), flush=True)
        time.sleep(0.5)
    return rows, None


def main():
    want = list(CLASSES)
    page = 10000
    for i, a in enumerate(sys.argv):
        if a == '--classes': want = sys.argv[i + 1].split(',')
        if a == '--page': page = int(sys.argv[i + 1])
    os.makedirs(OUT, exist_ok=True)
    summary = {}
    for cls in want:
        qid = CLASSES[cls]
        print('  %s (%s) ...' % (cls, qid), flush=True)
        rows, warn = capture(cls, qid, page)
        path = OUT + 'water-and-protected-%s.jsonl.gz' % cls
        with gzip.open(path, 'wt', encoding='utf-8') as fh:
            for r in rows:
                fh.write(json.dumps(r, ensure_ascii=False) + '\n')
        by_facts = collections.Counter(len(r['facts']) for r in rows)
        summary[cls] = {
            'wikidata_class': qid,
            'entities': len(rows),
            'with_an_english_label': sum(1 for r in rows if r['name_en']),
            'facts_per_entity': {str(k): v for k, v in sorted(by_facts.items())},
            'at_or_above_two_facts': sum(n for k, n in by_facts.items() if k >= 2),
            'incomplete': warn,
        }
        print('    %s: %d entities, %d with two or more facts%s'
              % (cls, len(rows), summary[cls]['at_or_above_two_facts'],
                 '; ' + warn if warn else ''), flush=True)
    # A CLASS FILE WITH NO ROW IN THE PROVENANCE IS THE DEFECT THIS GUARDS. The provenance used
    # to record only what THIS invocation fetched, so a run for five classes dropped
    # national_park - captured by an earlier run and sitting on disk - out of the record while
    # leaving its file beside it. A provenance that does not describe every file next to it is
    # worse than none, because it reads as complete. Any class file the run did not touch is
    # carried forward from the previous provenance, and a file with no row anywhere is named.
    for f in sorted(glob.glob(OUT + 'water-and-protected-*.jsonl.gz')):
        c = os.path.basename(f)[len('water-and-protected-'):-len('.jsonl.gz')]
        if c in summary:
            continue
        try:
            was = json.load(open(OUT + 'water-and-protected.provenance.json',
                                 encoding='utf-8')).get('per_class') or {}
        except (OSError, ValueError):
            was = {}
        if c in was:
            summary[c] = dict(was[c], carried_from_an_earlier_run=True)
        else:
            summary[c] = {'entities': None, 'NO_RECORD': 'this class file is on disk and no '
                          'provenance describes it; re-run the capture for it'}

    prov = {
        'source': 'Wikidata, entities stating a class (P31), a country (P17) and coordinates (P625)',
        'licence': 'Wikidata CC0 1.0, public domain dedication',
        'attribution': 'Wikidata, https://www.wikidata.org/',
        'endpoints_tried_in_order': ENDPOINTS,
        'fetched_on': time.strftime('%Y-%m-%d'),
        'why_these_classes': 'the strongest geographic LIST intents measured for free in '
                             'wikipedia-list-intent-2026-10-14.json, none of which except '
                             'waterfalls has entities already on disk',
        'facts_captured': FACTS,
        'why_the_facts_matter_more_than_the_count': 'the outdoor families already have entities '
                                                    'and proven intent; outdoors.beach is 582 '
                                                    'rows against 25,885 captured beaches, '
                                                    'because an own page needs two measured '
                                                    'attributes and OSM rarely carries two',
        'nothing_is_inferred': 'an entity appears only where Wikidata states its class, country '
                               'and coordinates; facts are recorded per property so a gate '
                               'counts real attributes rather than a total asserted here',
        'per_class': summary,
    }
    json.dump(prov, open(OUT + 'water-and-protected.provenance.json', 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('wrote', OUT + 'water-and-protected-<class>.jsonl.gz')
    return 1 if any(v['incomplete'] for v in summary.values()) else 0


if __name__ == '__main__':
    sys.exit(main())
