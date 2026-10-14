#!/usr/bin/env python3
"""Replace the bare Wikidata item ids in the outdoor fact store's `operator` with their names.

THE DEFECT, and what it looked like on a page. wikidata-outdoor-facts.py fetched P137, the
operator, over `wdt:`, which for an ITEM-valued property returns the item's IRI. It stored the
last path segment, so the fact became the string "Q1025341". The outdoor builder prints every
practical attribute as "<key>: <value>", so 345 rows in the current manifest tell a reader
"operator: Q1025341" and 477 rows in the fact store carry an id where a name belongs.

Worse than ugly: a bare id is not a fact a reader came for, and the gate counted it as one.
Those features were partly ADMITTED on the strength of an attribute that says nothing.

THE FIX IS THE NAME, not the removal. P137 is a real statement and the operator of a
lighthouse or an archaeological site is exactly the practical detail the gate is asking for.
What was missing is one lookup. Labels are taken in English, which is what the fact store
holds everywhere else, and a value whose label cannot be resolved is DROPPED rather than left
as an id: an unresolvable operator is not a fact either.

The same bug cannot recur, because the fetcher now asks for the label directly.

Usage: wikidata-resolve-operator-labels.py [--dry-run]
Reads  data/atlas/sources/osm-outdoor/_wikidata-facts.jsonl.gz
Writes the same file, in place, plus .operator-labels.json beside it as the record
"""
import gzip, json, os, re, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
FACTS = ROOT + 'data/atlas/sources/osm-outdoor/_wikidata-facts.jsonl.gz'
RECORD = ROOT + 'data/atlas/sources/osm-outdoor/_wikidata-facts.operator-labels.json'
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
QID = re.compile(r'^Q[1-9][0-9]*$')
PREFIXES = """PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
"""


def ask(q):
    tmp = tempfile.mkdtemp(prefix='livdar-oplabels-')
    body = os.path.join(tmp, 'b')
    for ep in ENDPOINTS:
        r = subprocess.run(['curl', '-sS', '--max-time', '180', '-A', UA,
                            '-H', 'Accept: application/sparql-results+json',
                            '--data-urlencode', 'query=' + q, '-o', body,
                            '-w', '%{http_code}', ep], capture_output=True, text=True)
        if (r.stdout or '').strip() == '200':
            try:
                return json.load(open(body, encoding='utf-8'))['results']['bindings']
            except (ValueError, KeyError):
                pass
        time.sleep(3)
    return None


def main():
    dry = '--dry-run' in sys.argv
    rows = []
    ops = set()
    for l in gzip.open(FACTS, 'rt', encoding='utf-8'):
        l = l.strip()
        if not l:
            continue
        d = json.loads(l)
        rows.append(d)
        v = (d.get('attr') or {}).get('operator')
        if v and QID.match(str(v)):
            ops.add(str(v))
    print('%d rows, %d distinct operator ids to resolve' % (len(rows), len(ops)))
    if not ops:
        print('nothing to do')
        return 0

    labels = {}
    ids = sorted(ops, key=lambda q: int(q[1:]))
    for n in range(0, len(ids), 200):
        part = ids[n:n + 200]
        q = (PREFIXES + 'SELECT ?u ?l WHERE {\n  VALUES ?u { '
             + ' '.join('wd:%s' % u for u in part) + ' }\n'
             + '  ?u rdfs:label ?l . FILTER(LANG(?l) = "en")\n}')
        got = ask(q)
        if got is None:
            print('  batch at %d did not answer; stopping rather than writing a partial fix'
                  % n, file=sys.stderr)
            return 2
        for b in got:
            labels[b['u']['value'].rsplit('/', 1)[-1]] = b['l']['value']
        print('  %d/%d asked, %d resolved' % (min(n + 200, len(ids)), len(ids), len(labels)),
              flush=True)

    unresolved = sorted(o for o in ops if o not in labels)
    changed = dropped = 0
    for d in rows:
        a = d.get('attr') or {}
        v = a.get('operator')
        if not v or not QID.match(str(v)):
            continue
        lab = labels.get(str(v))
        if lab:
            a['operator'] = lab
            # the id is kept beside the name, so a reader can check the claim
            (d.setdefault('properties', {}))['operator'] = 'P137'
            (d.setdefault('operator_item', {}))['qid'] = str(v)
            changed += 1
        else:
            # an operator nobody has named is not a fact either
            del a['operator']
            dropped += 1
    print('operator values renamed: %d, dropped as unresolvable: %d' % (changed, dropped))
    record = {
        'what': 'the Wikidata item ids that the outdoor fact store held in `operator`, and '
                'the English names they resolve to',
        'why': 'P137 was fetched over wdt:, which returns an item IRI, and the last path '
               'segment was stored, so the fact read "operator: Q1025341" on 345 manifest '
               'rows and the gate counted an id as a practical detail',
        'fixed_on': time.strftime('%Y-%m-%d'),
        'ids_resolved': len(labels),
        'values_renamed': changed,
        'values_dropped_because_the_item_has_no_english_label': unresolved,
        'labels': labels,
    }
    if dry:
        print('dry run, nothing written')
        return 0
    tmp = FACTS + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for d in rows:
            fh.write(json.dumps(d, ensure_ascii=False) + '\n')
    os.replace(tmp, FACTS)
    json.dump(record, open(RECORD, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('rewrote %s and %s' % (FACTS, RECORD))
    return 0


if __name__ == '__main__':
    sys.exit(main())
