#!/usr/bin/env python3
"""Re-capture the water layer's quantities WITH the unit Wikidata states for them.

WHY A SECOND FACT CAPTURE. wikidata-water-and-protected.py fetched its facts over `wdt:`,
which returns a quantity's AMOUNT and nothing else. That was enough for what it was for: the
thin-entity gate COUNTS facts, and a count needs no unit. It is not enough to PRINT one. A
lake whose depth is "15.0" cannot go on a page: "15 m deep" asserts a unit Wikidata never
told us, and "15.0 deep" is not a sentence. The builder refuses those rows by name, and this
file is what makes them printable.

HOW THE UNIT IS OBTAINED, and why the normalised value rather than the plain one. A Wikidata
quantity statement carries its own unit, which may be hectares for one lake and square
kilometres for the next. `psn:` is the NORMALISED statement value, which Wikidata itself
converts to the SI unit for that dimension, so an area arrives in square metres whatever the
editor typed. One unit per dimension across the whole capture is what lets the builder hold
one phrase per fact instead of a conversion table it would have to be trusted to get right.

THE UNIT IS STILL READ, not assumed. The normalised unit comes back as an item, and this file
resolves those items to their English labels in a second query and records them. If Wikidata
normalises a property to something other than what the builder expects, the builder refuses the
fact rather than printing it, so a surprise here cannot become a wrong number on a page.

SCOPE is the survivor list the builder writes: the entities that cleared every other gate. The
whole capture is 895,123 entities and asking about all of them to print facts on a few thousand
would be a long way round.

P571, inception, is deliberately absent: it is a date, it has no unit, and the original capture
already holds it.

Usage: wikidata-water-units.py [--qids PATH] [--chunk 400]
Reads  data/atlas/sources/wikidata/_water-feature-survivors.txt
Writes data/atlas/sources/wikidata/water-and-protected-units.jsonl.gz
       data/atlas/sources/wikidata/water-and-protected-units.provenance.json
       data/atlas/sources/wikidata/water-and-protected-units.unanswered.txt
"""
import collections, gzip, json, os, re, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'data/atlas/sources/wikidata/'
QIDS = SRC + '_water-feature-survivors.txt'
OUT = SRC + 'water-and-protected-units.jsonl.gz'
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
_TMP = tempfile.mkdtemp(prefix='livdar-wd-units-')
QID = re.compile(r'^Q[1-9][0-9]*$')

# The eight quantity properties the capture holds. P571 is a date and is not here.
FACTS = {
    'P2046': 'area',
    'P2043': 'length',
    'P4511': 'vertical_depth',
    'P2044': 'elevation',
    'P2048': 'height',
    'P2053': 'watershed_area',
    'P2225': 'discharge',
    'P2250': 'max_depth',
}

PREFIXES = """PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX psn: <http://www.wikidata.org/prop/statement/value-normalized/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
"""


def build_query(qids):
    sel, opt = [], []
    for prop, name in FACTS.items():
        sel.append('?%s_v ?%s_u' % (name, name))
        opt.append('  OPTIONAL { ?x p:%s/psn:%s ?%s_n . ?%s_n wikibase:quantityAmount ?%s_v ; '
                   'wikibase:quantityUnit ?%s_u . }\n'
                   % (prop, prop, name, name, name, name))
    return (PREFIXES + 'SELECT ?x ' + ' '.join(sel) + ' WHERE {\n  VALUES ?x { '
            + ' '.join('wd:%s' % q for q in qids) + ' }\n' + ''.join(opt) + '}')


def _retry_after(headers):
    for line in headers.splitlines():
        if line.lower().startswith('retry-after:'):
            try:
                return max(1, int(line.split(':', 1)[1].strip()))
            except ValueError:
                return 30
    return 30


def ask(q, tries=3):
    """The same three failures, answered the same three ways as the sitelink capture."""
    body, hdr = os.path.join(_TMP, 'b'), os.path.join(_TMP, 'h')
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
                wait = _retry_after(headers)
                if wait > 120:
                    break
                time.sleep(wait)
                continue
            if 'TimeoutException' in text or 'QueryTimeout' in text or code == '500':
                return None, 'timeout'
            time.sleep(4 * (i + 1))
    return None, 'throttled'


def ask_splitting(qids, floor=20):
    rows, status = ask(build_query(qids))
    if status == 'ok':
        return rows, []
    if status == 'timeout' and len(qids) > floor:
        mid = len(qids) // 2
        a_rows, a_bad = ask_splitting(qids[:mid], floor)
        b_rows, b_bad = ask_splitting(qids[mid:], floor)
        return a_rows + b_rows, a_bad + b_bad
    return [], list(qids)


def unit_labels(unit_qids):
    """The distinct normalised units, resolved to their English labels in one query."""
    if not unit_qids:
        return {}
    q = (PREFIXES + 'SELECT ?u ?l WHERE {\n  VALUES ?u { '
         + ' '.join('wd:%s' % u for u in sorted(unit_qids)) + ' }\n'
         + '  ?u rdfs:label ?l . FILTER(LANG(?l) = "en")\n}')
    rows, status = ask(q)
    if status != 'ok':
        return {}
    return {b['u']['value'].rsplit('/', 1)[-1]: b['l']['value'] for b in rows}


def main():
    chunk, qid_file = 400, QIDS
    for i, a in enumerate(sys.argv):
        if a == '--chunk': chunk = int(sys.argv[i + 1])
        if a == '--qids': qid_file = sys.argv[i + 1]
    if not os.path.exists(qid_file):
        sys.exit('no survivor list at %s; run water-feature-candidates.py first' % qid_file)
    ids = sorted({l.strip() for l in open(qid_file, encoding='utf-8') if l.strip()},
                 key=lambda q: int(q[1:]) if q[1:].isdigit() else 0)
    ids, malformed = [q for q in ids if QID.match(q)], [q for q in ids if not QID.match(q)]
    print('entities to ask about: %d%s'
          % (len(ids), (', %d malformed and refused' % len(malformed)) if malformed else ''),
          flush=True)

    per_entity = collections.defaultdict(dict)
    units_seen = set()
    failed, t0 = [], time.time()
    for n in range(0, len(ids), chunk):
        rows, bad = ask_splitting(ids[n:n + chunk])
        failed.extend(bad)
        for b in rows:
            q = b['x']['value'].rsplit('/', 1)[-1]
            for name in FACTS.values():
                v, u = b.get('%s_v' % name), b.get('%s_u' % name)
                if not v or not u:
                    continue
                uq = u['value'].rsplit('/', 1)[-1]
                units_seen.add(uq)
                per_entity[q][name] = {'amount': v['value'], 'unit_item': uq}
        if (n // chunk) % 10 == 0 or n + chunk >= len(ids):
            print('  %d/%d asked, %d with a stated unit, %d unanswered, %.0fs'
                  % (min(n + chunk, len(ids)), len(ids), len(per_entity), len(failed),
                     time.time() - t0), flush=True)

    labels = unit_labels(units_seen)
    print('distinct normalised units: %s' % {u: labels.get(u, '?') for u in sorted(units_seen)},
          flush=True)
    unresolved = sorted(u for u in units_seen if u not in labels)

    asked = set(ids) - set(failed)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for q in ids:
            if q in failed:
                continue
            facts = {}
            for name, d in (per_entity.get(q) or {}).items():
                lab = labels.get(d['unit_item'])
                if not lab:
                    # The unit item did not resolve. Writing the row without a unit would let
                    # the builder print a number with no unit, which is the defect this whole
                    # file exists to fix, so the fact is left out and the item is reported.
                    continue
                facts[name] = {'amount': d['amount'], 'unit': lab,
                               'unit_item': d['unit_item']}
            fh.write(json.dumps({'qid': q, 'facts': facts}, ensure_ascii=False) + '\n')
    with open(OUT.replace('.jsonl.gz', '.unanswered.txt'), 'w', encoding='utf-8') as fh:
        for q in failed:
            fh.write(q + '\n')

    per_fact = collections.Counter()
    for q in per_entity:
        for name in per_entity[q]:
            per_fact[name] += 1
    prov = {
        'source': 'Wikidata normalised quantity statements (p:/psn:) for the water and '
                  'protected-area entities that cleared every other gate',
        'licence': 'Wikidata CC0 1.0, public domain dedication',
        'attribution': 'Wikidata, https://www.wikidata.org/',
        'endpoints_tried_in_order': ENDPOINTS,
        'fetched_on': time.strftime('%Y-%m-%d'),
        'why': 'the first capture used wdt:, which returns a quantity amount and not its '
               'unit. An amount is enough to COUNT a fact and not enough to STATE one.',
        'why_normalised': 'psn: is the value Wikidata itself converts to the SI unit for that '
                          'dimension, so one phrase per fact is correct for every row rather '
                          'than correct for whichever unit an editor happened to type',
        'properties': FACTS,
        'p571_absent_because': 'inception is a date, carries no unit, and the first capture '
                               'already holds it',
        'entities_asked': len(asked),
        'entities_unanswered': len(failed),
        'entities_with_at_least_one_stated_unit': len(per_entity),
        'facts_with_a_stated_unit': dict(per_fact.most_common()),
        'normalised_units_found': {u: labels.get(u) for u in sorted(units_seen)},
        'unit_items_that_did_not_resolve_and_whose_facts_were_dropped': unresolved,
        'ids_not_a_wikidata_entity_id_and_so_never_asked': malformed,
    }
    json.dump(prov, open(OUT.replace('.jsonl.gz', '.provenance.json'), 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('wrote %s' % OUT)
    print('  asked %d, with a stated unit %d, unanswered %d'
          % (len(asked), len(per_entity), len(failed)))
    for k, v in per_fact.most_common():
        print('    %-16s %6d' % (k, v))
    if unresolved:
        print('  WARNING: %d unit item(s) did not resolve: %s' % (len(unresolved), unresolved))


if __name__ == '__main__':
    main()
