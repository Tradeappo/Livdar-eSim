#!/usr/bin/env python3
"""The cross-market content uniqueness gate's decision table, as a test.

The gate lives inline in build-1m-candidate-manifest.py because its rejections have to land
inside the one funnel. That makes it hard to call directly, so this file mirrors its decision
logic and asserts the cases the brief names. A wrong answer shows up here in a second rather
than in a 400,000-row run, and the twelfth case is the one worth keeping: TWO temperature facts
are ONE kind of fact, so they do not satisfy TWO_OR_MORE_MARKET_FACTS. Counting facts rather
than kinds would have let every destination copy through on a January gap and a July gap.

Run: python3 scripts/atlas/scale/tests/test-cross-market-gate.py
"""
import sys

SAME_LANG_OK = {'OWN_MEASURED_DEMAND', 'MARKET_REGULATION', 'MARKET_PRICING',
                'DIFFERENT_INTENT', 'DIFFERENT_ENTITY_SCOPE'}


def fact_kinds(facts):
    k = set()
    for f in facts:
        low = f.lower()
        if 'straight line' in low or 'km from' in low:
            k.add('distance')
        elif 'averages' in low:
            k.add('temperature')
        else:
            k.add('other')
    return k


def decide(facts, own_keyword, different_intent, same_language_sibling, has_sibling=True):
    earned = set()
    if own_keyword:
        earned.add('OWN_MEASURED_DEMAND')
    if len(fact_kinds(facts)) >= 2:
        earned.add('TWO_OR_MORE_MARKET_FACTS')
    if different_intent:
        earned.add('DIFFERENT_INTENT')
    if not has_sibling:
        return 'KEEP_ONLY_PAGE'
    usable = earned & SAME_LANG_OK if same_language_sibling else earned
    return ('KEEP:' + ','.join(sorted(usable))) if usable else 'REJECT'


D = 'about 1,700km from Istanbul in a straight line'
T1 = 'July averages 5 degrees cooler than Istanbul'
T2 = 'January averages 7 degrees cooler than Istanbul'

CASES = [
    ('only page for this entity and intent',         [],         0, 0, 0, False, 'KEEP_ONLY_PAGE'),
    ('same language, differs ONLY by market id',     [],         0, 0, 1, True,  'REJECT'),
    ('same language, plus one distance',             [D],        0, 0, 1, True,  'REJECT'),
    ('same language, plus distance AND temperature', [D, T1],    0, 0, 1, True,  'REJECT'),
    ('same language, its own measured keyword',      [],         1, 0, 1, True,  'KEEP:OWN_MEASURED_DEMAND'),
    ('same language, different intent',              [],         0, 1, 1, True,  'KEEP:DIFFERENT_INTENT'),
    ('cross language, NO market fact',               [],         0, 0, 0, True,  'REJECT'),
    ('cross language, ONE distance only',            [D],        0, 0, 0, True,  'REJECT'),
    ('cross language, ONE temperature only',         [T1],       0, 0, 0, True,  'REJECT'),
    ('cross language, TWO temperatures, ONE kind',   [T1, T2],   0, 0, 0, True,  'REJECT'),
    ('cross language, distance AND temperature',     [D, T1],    0, 0, 0, True,  'KEEP:TWO_OR_MORE_MARKET_FACTS'),
    ('cross language, the real three-fact row',      [D, T1, T2], 0, 0, 0, True, 'KEEP:TWO_OR_MORE_MARKET_FACTS'),
]

if __name__ == '__main__':
    failed = 0
    for name, facts, kw, di, sl, sib, expect in CASES:
        got = decide(facts, kw, di, sl, sib)
        ok = got == expect
        failed += not ok
        print(f'  {"PASS" if ok else "FAIL"}  {name:46} -> {got}')
    print(f'\n{len(CASES) - failed} of {len(CASES)} cases behave as specified')
    if failed:
        print('\nThe gate in build-1m-candidate-manifest.py and this table have diverged. '
              'One of them is wrong and the run should not be trusted until they agree.')
    sys.exit(1 if failed else 0)
