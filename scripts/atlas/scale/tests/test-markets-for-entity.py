#!/usr/bin/env python3
"""markets_for_entity and strongest_destination_language against the inline code they replace.

Five geographic builders each carried their own copy of "which markets does this entity earn".
Four agreed and the fifth, poi-aggregations.py, rejected outright when the country had no home
market, which is why no destination country had ever produced a POI-derived page. The shared
function has to reproduce the four that were right, exactly, or the collapse trades one defect
for another. Both inline versions below are transcriptions of the code as it stood before the
collapse, kept here so the comparison is against the original rather than against a memory of it.
"""
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import entity_identity as ei                                              # noqa: E402

# a fixture rather than the real file, so the test says the same thing in a year
DEST = {'TH': {'de': (900, 4400), 'en': (12000, 33000), 'ja': (2400, 71000)},
        'TR': {'de': (2700, 27000), 'ja': (1900, 71000), 'it': (880, 58000)},
        'AT': {'de': (1600, 42000)}}
MARKS = {'de': 'de wiki', 'ja': 'name:ja', 'en': 'en wiki'}


def inline_outdoor(country, marks):
    """markets_for_parent, as outdoor-aggregations, region-aggregations and trail-candidates
    all had it, word for word apart from the prose."""
    out = []
    home = ei.COUNTRY_MKT.get(country)
    if home:
        out.append((home[0], home[1], 'home'))
    for lang, ev in (DEST.get(country) or {}).items():
        mkt = ei.LANG_MKT.get(lang)
        if not mkt or (home and home[1] == lang):
            continue
        if not marks.get(lang):
            continue
        out.append((mkt, lang, 'dest'))
    return out


def inline_feature_fallback(country, marks):
    """The no-home-market branch of outdoor-feature-candidates. Returns None where the country
    HAS a home market, because the builder took that branch and never reached this one."""
    if ei.COUNTRY_MKT.get(country):
        return None
    dl = DEST.get(country) or {}
    cand = sorted(((dl[L][1], L) for L in dl if L in marks), reverse=True)
    if not cand:
        return None
    return ei.LANG_MKT[cand[0][1]], cand[0][1]


CASES = [
    ('TR', MARKS),          # market country, plus two destination languages on top
    ('TH', MARKS),          # no home market, three languages with marks
    ('AT', MARKS),          # no home market, one language licensed
    ('TH', {'de': 'x'}),    # a mark in only one of the licensed languages
    ('TH', {}),             # no mark at all: nothing is earned
    ('XX', MARKS),          # a country the destination table has never heard of
    ('MX', MARKS),          # market country with no destination languages licensed
    ('EG', MARKS),          # destination with no row in the fixture
]


def main():
    bad = 0
    for cc, marks in CASES:
        mine = [(m, l) for m, l, _ in
                ei.markets_for_entity(cc, {}, dest_lang=DEST, marks=marks)]
        theirs = [(m, l) for m, l, _ in inline_outdoor(cc, marks)]
        ok = mine == theirs
        bad += not ok
        print(('ok  ' if ok else 'FAIL'), f'markets   {cc:3} marks={sorted(marks)} -> {mine}')
    for cc, marks in CASES:
        s = ei.strongest_destination_language(cc, {}, dest_lang=DEST, marks=marks)
        mine = (s[0], s[1]) if s else None
        theirs = inline_feature_fallback(cc, marks)
        ok = mine == theirs
        bad += not ok
        print(('ok  ' if ok else 'FAIL'),
              f'strongest {cc:3} marks={sorted(marks)} -> {mine}')

    # the home market is never also listed as a destination for its own language
    for cc, _ in CASES:
        got = ei.markets_for_entity(cc, {}, dest_lang=DEST, marks=MARKS)
        langs = [l for _, l, _ in got]
        ok = len(langs) == len(set(langs))
        bad += not ok
        print(('ok  ' if ok else 'FAIL'), f'no duplicate language for {cc}: {langs}')

    total = len(CASES) * 3
    print(f'\n{total - bad} of {total} correct')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
