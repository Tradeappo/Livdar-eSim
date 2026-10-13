#!/usr/bin/env python3
"""Recover the city articles that a GeoNames ID alone does not reach, and only those.

THE DEFECT THIS FIXES, found by looking at the answer rather than at the count. After the
P1566 capture, the calibration said 88.6 per cent of the German home-market cities the paid
corpus admitted have no German Wikipedia article. German cities have German articles. The
capture was wrong, and because its failure mode is a measured absence rather than an error, it
would have driven the German floor to zero - a gate that admits everything, arrived at by
arithmetic that checks out.

WHY IT HAPPENS. GeoNames and Wikidata model a German city differently. GeoNames id 2867714 is
"Munich", feature class PPLA, the populated place. Wikidata puts P1566=2867714 not on Q1726
(Muenchen, the city, which is what de.wikipedia writes about) but on Q32664319, "Kreisfreie
Stadt Muenchen", the administrative SEAT, which has no sitelink at all. The seat item does
carry P131 - located in the administrative territorial entity - pointing at Q1726. So the
article exists and the identifier reaches a different node of the same place.

THE GUARD, because following P131 blindly is a city-name swap with extra steps. One level up
from a village is its municipality, and taking the municipality's readership as the village's
would be exactly the swap the brief forbids. So a parent's article is accepted ONLY when its
title names the same place: the title, with any parenthetical or comma qualifier stripped and
diacritics folded, has to equal the city's own name - either its GeoNames name or its recorded
name in that language, from altnames-by-language.jsonl.gz. Muenchen passes (the parent is
titled "Muenchen", the German name of GeoNames' "Munich"). A village inside a differently
named municipality does not, and is left unmeasured rather than borrowed.

Pass 1 (wikidata-city-sitelinks.py) is unchanged and still asks about every city. This runs
only over the cities it found nothing for, so a city with a direct sitelink is never touched
by the looser rule.

Usage: wikidata-city-sitelinks-via-municipality.py
"""
import collections, glob, gzip, json, os, subprocess, sys, tempfile, time, unicodedata

ROOT = '/home/user/Livdar-eSim/'
PASS1 = ROOT + 'data/atlas/sources/wikidata/city-sitelinks-from-wikidata.jsonl.gz'
ALTNAMES = ROOT + 'data/atlas/sources/geonames/altnames-by-language.jsonl.gz'
OUT = ROOT + 'data/atlas/sources/wikidata/city-sitelinks-via-municipality.jsonl.gz'
LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'tr', 'zh']
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
ENDPOINTS = ['https://qlever.dev/api/wikidata', 'https://query.wikidata.org/sparql']
_TMP = tempfile.mkdtemp(prefix='livdar-muni-')

SITES = ' '.join('<https://%s.wikipedia.org/>' % l for l in LANGS)
QUERY = """PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX schema: <http://schema.org/>
SELECT ?gnid ?site ?name WHERE {
  VALUES ?gnid { %s }
  VALUES ?site { """ + SITES + """ }
  ?item wdt:P1566 ?gnid ; wdt:P131 ?parent .
  ?art schema:about ?parent ; schema:isPartOf ?site ; schema:name ?name .
}"""


def fold(s):
    """Lowercase, strip a trailing parenthetical or comma qualifier, fold diacritics.

    CJK is left alone: there are no diacritics to fold and stripping marks would change the
    characters. This is the same shape of normalisation entity_identity.slugify does for URLs,
    kept local because what is being compared here is a TITLE against a NAME, not a slug.
    """
    s = str(s or '').strip()
    if '(' in s:
        s = s.split('(')[0]
    if ',' in s:
        s = s.split(',')[0]
    s = s.strip().lower()
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')


def cities():
    out = {}
    for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
        d = json.load(open(f, encoding='utf-8'))
        lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
        for c in lst:
            if c and c.get('id'):
                out[str(c['id'])] = {fold(c.get('name')), fold(c.get('ascii'))} - {''}
    if os.path.exists(ALTNAMES):
        for line in gzip.open(ALTNAMES, 'rt', encoding='utf-8'):
            d = json.loads(line)
            gid = d['geonameid']
            if gid in out:
                for _l, v in (d.get('names') or {}).items():
                    n = fold((v or {}).get('name'))
                    if n:
                        out[gid].add(n)
    return out


def found_in_pass1():
    have = set()
    if os.path.exists(PASS1):
        for line in gzip.open(PASS1, 'rt', encoding='utf-8'):
            d = json.loads(line)
            if d.get('wikipedia_languages'):
                have.add(d['geonameid'])
    return have


def ask(gnids, tries=3):
    q = QUERY % ' '.join('"%s"' % g for g in gnids)
    body = os.path.join(_TMP, 'q-%d' % os.getpid())
    hdr = os.path.join(_TMP, 'h-%d' % os.getpid())
    for ep in ENDPOINTS:
        for i in range(tries):
            r = subprocess.run(['curl', '-sS', '--max-time', '120', '-A', UA,
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
                    break
                time.sleep(wait)
                continue
            if 'TimeoutException' in text or 'QueryTimeout' in text or code == '500':
                return None, 'timeout'
            time.sleep(4 * (i + 1))
    return None, 'throttled'


def ask_splitting(gnids, floor=50):
    rows, status = ask(gnids)
    if status == 'ok':
        return rows, []
    if status == 'timeout' and len(gnids) > floor:
        mid = len(gnids) // 2
        a, ab = ask_splitting(gnids[:mid], floor)
        b, bb = ask_splitting(gnids[mid:], floor)
        return a + b, ab + bb
    return [], list(gnids)


def main():
    names = cities()
    gap = sorted(set(names) - found_in_pass1(), key=int)
    print('cities with no direct sitelink: %d' % len(gap))
    accepted = collections.defaultdict(dict)
    refused = collections.Counter()
    refused_examples = []
    failed = []
    for n in range(0, len(gap), 1000):
        part = gap[n:n + 1000]
        rows, bad = ask_splitting(part)
        failed.extend(bad)
        for b in rows:
            gid = b['gnid']['value']
            lang = b['site']['value'].split('//', 1)[1].split('.', 1)[0]
            title = b['name']['value']
            if fold(title) in names.get(gid, set()):
                accepted[gid][lang] = title
            else:
                refused[lang] += 1
                if len(refused_examples) < 40:
                    refused_examples.append({'geonameid': gid, 'lang': lang,
                                             'parent_title': title,
                                             'city_names': sorted(names.get(gid, []))[:4]})
        print('  %d/%d, %d cities recovered, %d parent titles refused as a different place'
              % (n + len(part), len(gap), len(accepted), sum(refused.values())), flush=True)
        time.sleep(0.5)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for gid in sorted(accepted, key=int):
            fh.write(json.dumps({'geonameid': gid, 'wikipedia_languages': accepted[gid]},
                                ensure_ascii=False) + '\n')
    per_lang = collections.Counter()
    for v in accepted.values():
        for l in v:
            per_lang[l] += 1
    prov = {
        'source': 'Wikidata, the article of the entity a GeoNames-identified item is P131 '
                  'located in, accepted only when its title names the same place',
        'licence': 'Wikidata CC0 1.0, public domain dedication',
        'attribution': 'Wikidata, https://www.wikidata.org/',
        'endpoints_tried_in_order': ENDPOINTS,
        'fetched_on': time.strftime('%Y-%m-%d'),
        'why': 'GeoNames models a city as its administrative seat where Wikidata models it as '
               'the municipality, so P1566 lands on an item with no sitelink while the article '
               'sits one P131 hop away. Munich is the clearest case: P1566=2867714 is on '
               '"Kreisfreie Stadt Muenchen", not on the city.',
        'the_guard': 'a parent article is accepted ONLY if its title, with a parenthetical or '
                     'comma qualifier stripped and diacritics folded, equals one of the '
                     'city\'s own names - its GeoNames name, its ASCII name, or its recorded '
                     'name in any language. Without that, one P131 hop from a village would '
                     'borrow its municipality\'s readership, which is a city-name swap.',
        'cities_with_no_direct_sitelink': len(gap),
        'cities_recovered': len(accepted),
        'recovered_per_language': dict(per_lang.most_common()),
        'parent_titles_refused_as_a_different_place': sum(refused.values()),
        'refused_per_language': dict(refused.most_common()),
        'refused_examples': refused_examples,
        'ids_the_endpoints_did_not_answer': len(failed),
    }
    with open(OUT.replace('.jsonl.gz', '.unanswered.txt'), 'w', encoding='utf-8') as fh:
        for g in failed:
            fh.write(g + '\n')
    json.dump(prov, open(OUT.replace('.jsonl.gz', '.provenance.json'), 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('recovered %d cities, refused %d parent titles, %d ids unanswered'
          % (len(accepted), sum(refused.values()), len(failed)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
