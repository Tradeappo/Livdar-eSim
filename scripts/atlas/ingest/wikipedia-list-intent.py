#!/usr/bin/env python3
"""Measured demand for a LIST intent, per language, from the clickstream already captured.

WHY THIS EXISTS. A new page family cannot enter the candidate manifest without family-level
intent evidence for the market it would serve: demand_score() returns 0 without a measured
keyword cell, a 0 row is dropped as dropped_no_demand_evidence, and the per-market family gate
refuses by name anything a market was not measured for. Those gates are right and the brief
forbids relaxing them. But every family-intent measurement this repository holds came from a
keyword corpus that cannot be bought again, so without a free instrument the family set can
only ever shrink.

The per-city signal built on 2026-10-13 does not answer this. A reader of the German article
on a town is evidence about the TOWN; it says nothing about whether anyone wants its
listed-buildings page. Using it that way would be fabricated demand with a citation.

THE INSTRUMENT. Wikipedia carries list articles - "Liste der Seen in Bayern", "List of
museums in Chicago", "Lijst van molens in Groningen" - tens of thousands per language, and the
clickstream says how many readers reached each one FROM A SEARCH ENGINE. A list article about
a kind of thing in a place, pulling a measured monthly search readership in a language, is
evidence that speakers of that language search for that list. That is family intent, measured
as a count, in the language the page would be written in, from a file already on disk.

WHAT IT IS AND IS NOT:
  it evidences      LIST and AGGREGATION intents, which is what the heritage, outdoor, places
                    and poi families are
  it does not       evidence a transactional or tool intent, and it must never be read as one
  it does not       say anything about commercial value: a Wikipedia list is not a commercial
                    query, so monetisation fit stays whatever the family catalogue says
  it does not       admit a PLACE into a family. That is the per-city signal's job, and the
                    two are kept apart deliberately: this one is about the KIND of page.

Spanish and Italian cannot be measured with it, and that is recorded rather than worked
around. Spanish puts its lists in the `Anexo:` namespace, which the clickstream does not
cover - four articles and 471 clicks in three months, against 91,134 articles for English -
and Italian simply does not title its lists this way. A family measured only in de/en/fr/nl/
pl/pt/tr/zh/ja is admitted only there.

Usage: wikipedia-list-intent.py [--min-articles 30]
"""
import collections, glob, gzip, json, os, re, sys, time

ROOT = '/home/user/Livdar-eSim/'
CLICKS = ROOT + 'data/atlas/sources/wikimedia/search-clicks.%s.tsv.gz'
OUT = ROOT + 'data/atlas/measurements/findings/wikipedia-list-intent-%s.json'

# How each language titles a list, and how to cut the KIND of list off the PLACE it is about.
# Every pattern below was read off the captured tables rather than assumed, and the two
# languages with no usable convention say so instead of being given a guess.
#
#   `match`  recognises a list article at all
#   `kind`   captures the part that names the kind of thing, with the place dropped. Group 1
#            is the kind. Where a language puts the place first, the regex is anchored to the
#            end instead, which is why this is a per-language table and not one rule.
LANGS = {
    'de': {'match': r'^Liste[_ ]',
           'kind': r'^(Liste_(?:der|des|von|vom|die)?_?[^_]+(?:_[a-zäöüß]+)?)_(?:in|von|im|bei|auf)_'},
    'en': {'match': r'^List_of_',
           'kind': r'^(List_of_[^_]+(?:_[a-z]+)?)_(?:in|of|at|on)_'},
    'fr': {'match': r'^Liste[_ ]',
           'kind': r'^(Liste_(?:des|de|du|d)?_?[^_]+)_(?:de|du|en|dans|à)_'},
    'nl': {'match': r'^Lijst_van_',
           'kind': r'^(Lijst_van_[^_]+(?:_[a-z]+)?)_(?:in|te|op|bij)_'},
    'pl': {'match': r'^Lista_',
           'kind': r'^(Lista_[^_]+)_(?:w|we|na|z)_'},
    'pt': {'match': r'^Lista_',
           'kind': r'^(Lista_de_[^_]+(?:_[a-z]+)?)_(?:de|do|da|em|no|na)_'},
    'tr': {'match': r'_[Ll]istesi$',
           'kind': r'_([^_]+_[Ll]istesi)$'},
    'zh': {'match': r'列表$', 'kind': r'([^_]{2,8}列表)$'},
    'ja': {'match': r'一覧$', 'kind': r'([^_]{2,10}一覧)$'},
    # recorded, not measured. See the module docstring: the clickstream does not carry the
    # namespace Spanish keeps its lists in, and Italian does not use the convention.
    'es': {'match': None, 'why': 'lists live in the Anexo: namespace, which the clickstream '
                                 'does not cover: 4 articles and 471 clicks in three months'},
    'it': {'match': None, 'why': 'Italian Wikipedia does not title its lists this way: 219 '
                                 'articles in three months against 91,134 for English'},
}


def measure(lang, spec, min_articles):
    p = CLICKS % lang
    if not os.path.exists(p):
        return None, 'no clickstream table on disk'
    if not spec.get('match'):
        return None, spec['why']
    m_re, k_re = re.compile(spec['match']), re.compile(spec['kind'])
    n_articles = 0
    arts = collections.Counter()
    total = collections.Counter()
    with gzip.open(p, 'rt', encoding='utf-8') as fh:
        next(fh, None)
        for line in fh:
            a, _, rest = line.rstrip('\n').partition('\t')
            if not m_re.search(a):
                continue
            n_articles += 1
            k = k_re.search(a)
            if not k:
                continue
            v = int(rest.split('\t')[0])
            arts[k.group(1)] += 1
            total[k.group(1)] += v
    rows = []
    for k in arts:
        if arts[k] < min_articles:
            continue
        rows.append({
            'list_kind': k.replace('_', ' '),
            'articles': arts[k],
            'total_monthly_search_clicks': total[k],
            # the mean is what a NEW page of this kind could expect to be sought at, which is
            # the number a family-intent floor has to be compared against. The total is a
            # fact about Wikipedia's coverage of the kind, not about one page.
            'mean_per_article': total[k] // arts[k],
        })
    rows.sort(key=lambda r: -r['mean_per_article'])
    return {'list_articles_seen': n_articles, 'kinds_above_the_article_floor': len(rows),
            'kinds': rows}, None


def main():
    min_articles = 30
    for i, a in enumerate(sys.argv):
        if a == '--min-articles': min_articles = int(sys.argv[i + 1])
    out = {
        'measured_on': time.strftime('%Y-%m-%d'),
        'instrument': 'Wikimedia clickstream, referrer class other-search, median monthly, '
                      'three months; the same capture the per-city signal reads',
        'licence': 'CC0 1.0',
        'what_this_measures': 'that speakers of a language search for a LIST of a kind of '
                              'thing in a place. It is family intent, not entity demand, and '
                              'not commercial intent.',
        'what_it_cannot_measure': 'a transactional or tool intent, the commercial value of a '
                                  'query, or whether any particular place deserves a page',
        'minimum_articles_for_a_kind_to_be_reported': min_articles,
        'why_a_minimum': 'a kind represented by two articles has no distribution to read; the '
                         'mean of two readings is an anecdote with a decimal point',
        'languages': {},
        'languages_this_instrument_cannot_reach': {},
    }
    for lang, spec in LANGS.items():
        res, why = measure(lang, spec, min_articles)
        if res is None:
            out['languages_this_instrument_cannot_reach'][lang] = why
            print('  %s: not measurable, %s' % (lang, why), flush=True)
            continue
        out['languages'][lang] = res
        print('  %s: %d list articles, %d kinds above the floor, strongest %s at %d a month'
              % (lang, res['list_articles_seen'], res['kinds_above_the_article_floor'],
                 res['kinds'][0]['list_kind'] if res['kinds'] else '(none)',
                 res['kinds'][0]['mean_per_article'] if res['kinds'] else 0), flush=True)
    path = OUT % time.strftime('%Y-%m-%d')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', path)
    return 0


if __name__ == '__main__':
    sys.exit(main())
