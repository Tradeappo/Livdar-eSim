#!/usr/bin/env python3
"""Map a Wikidata country item to its ISO 3166-1 alpha-2 code.

Every layer captured from Wikidata states its country as a QID (P17), and every layer built
from OpenStreetMap keys its country as an ISO alpha-2 code. Without this mapping the two
cannot be joined, and the join is what decides whether a captured entity has a parent layer
to sit in at all.

The mapping is Wikidata's own statement, P297, and nothing here is inferred from a name.

THE FOUR EXCEPTIONS, and why each is named rather than guessed. P297 is stated on the item
that holds the code in the standard, which is not always the item a capture names as the
country:

  Q55        Netherlands                 the code NL is stated on Q29999, Kingdom of the
                                         Netherlands, of which Q55 is the constituent country
                                         in Europe. 131 captured rows name Q55, and the
                                         Netherlands has a parent layer, so dropping them
                                         would be a measurement error rather than a gap.
  Q756617    Kingdom of Denmark          the code DK is stated on Q35, Denmark.
  Q124653007 realm of the United Kingdom the code GB is stated on Q145, United Kingdom.
  Q36678     West Bank                   the code PS is reached by P361, part of, to Q219060.

What is deliberately NOT mapped, because there is nothing to map it to: a row whose stated
country is a state that no longer exists. Q15180 Soviet Union, Q34266 Russian Empire and
Q28513 Austria-Hungary have no code in the current standard and no parent layer anywhere, and
a successor chosen here would be this file's guess presented as Wikidata's statement. Same for
Q23427 South Ossetia, which has no assigned code. Those rows stay unmapped and are counted as
unmapped wherever this file is read.

Usage: wikidata-country-iso.py
Writes data/atlas/sources/wikidata/country-iso.json
"""
import json, os, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/wikidata/country-iso.json'
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
# qlever.dev first for the same reason the other Wikidata captures prefer it: the canonical
# service answers about two queries from this container before a 429 with retry-after: 1000.
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']

QUERY = """PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?c ?iso ?label WHERE {
  ?c wdt:P297 ?iso .
  OPTIONAL { ?c rdfs:label ?label . FILTER(LANG(?label) = "en") }
}"""

# The code is stated on a DIFFERENT item than the one captures name as the country. Each entry
# records the item that actually carries the code, so a reader can check the claim.
STATED_ELSEWHERE = {
    'Q55': ('NL', 'Q29999', 'P297 NL is stated on the Kingdom of the Netherlands; Q55 is its '
                            'constituent country in Europe'),
    'Q756617': ('DK', 'Q35', 'P297 DK is stated on Denmark; Q756617 is the kingdom'),
    'Q124653007': ('GB', 'Q145', 'P297 GB is stated on the United Kingdom'),
    'Q36678': ('PS', 'Q219060', 'P297 PS is reached by P361, part of'),
}
# Named so a reader knows these were considered and refused, not overlooked.
NO_CODE_EXISTS = {
    'Q15180': 'Soviet Union, dissolved; no code in the current standard',
    'Q34266': 'Russian Empire, dissolved; no code in the current standard',
    'Q28513': 'Austria-Hungary, dissolved; no code in the current standard',
    'Q23427': 'South Ossetia; no assigned code',
}


def ask(q, tries=3):
    tmp = tempfile.mkdtemp(prefix='livdar-wd-iso-')
    body, hdr = os.path.join(tmp, 'b'), os.path.join(tmp, 'h')
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
                    return json.loads(text)['results']['bindings'], ep
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
                    break
                time.sleep(wait)
                continue
            time.sleep(5 * (i + 1))
    return None, None


def main():
    rows, ep = ask(QUERY)
    if rows is None:
        sys.exit('no endpoint answered; nothing written')
    codes, labels = {}, {}
    for b in rows:
        q = b['c']['value'].rsplit('/', 1)[-1]
        iso = (b.get('iso') or {}).get('value', '').strip().upper()
        if not q.startswith('Q') or len(iso) != 2:
            continue
        codes[q] = iso
        if b.get('label'):
            labels[q] = b['label']['value']
    stated = len(codes)
    for q, (iso, holder, why) in STATED_ELSEWHERE.items():
        if q in codes:
            # Wikidata moved the statement onto the item captures name. The exception is then
            # redundant, and saying so is better than silently overwriting a live statement.
            print('%s now states P297 itself (%s); exception no longer needed'
                  % (q, codes[q]), file=sys.stderr)
            continue
        codes[q] = iso
    out = {
        'source': 'Wikidata, ISO 3166-1 alpha-2 code (P297)',
        'licence': 'Wikidata CC0 1.0, public domain dedication',
        'attribution': 'Wikidata, https://www.wikidata.org/',
        'endpoint': ep,
        'fetched_on': time.strftime('%Y-%m-%d'),
        'items_stating_p297': stated,
        'items_mapped_by_exception': {q: {'iso': v[0], 'code_is_stated_on': v[1], 'why': v[2]}
                                      for q, v in STATED_ELSEWHERE.items() if q not in labels},
        'deliberately_unmapped': NO_CODE_EXISTS,
        'total': len(codes),
        'labels': labels,
        'iso': codes,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False, sort_keys=True)
    print('%d country items carry P297, %d after the %d named exceptions -> %s'
          % (stated, len(codes), len(STATED_ELSEWHERE), OUT))


if __name__ == '__main__':
    main()
