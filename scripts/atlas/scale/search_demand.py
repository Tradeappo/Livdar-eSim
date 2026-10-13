#!/usr/bin/env python3
"""One definition of the free, measured per-place search demand signal.

Two gates in the manifest ask the same question of a city and, until now, answered it only
from a paid keyword corpus that cannot be bought again:

  the per-market tier cap    is this city looked for at all in this market
                             (493,568 combinations abandoned on the 2026-09-30 run)
  dest_evidence()            does this language community seek THIS destination
                             (77,387 rows rejected as LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION)

Both are the same question - is this place sought by speakers of this language - and the
Wikimedia clickstream answers it with a count rather than an estimate: readers who arrived at
the article from a search engine, per language edition, per month. See
scripts/atlas/ingest/wikimedia-search-clicks.py for what the source is and is not.

This module exists so there is ONE place that decides what the signal means. Two gates reading
the same file through two copies of the same arithmetic is how they drift apart, and a gate
that has drifted is worse than no gate because it still looks like one.

WHAT IT WILL NOT DO. It answers only the ENTITY half of a question. It cannot establish that a
family intent exists in a market: that German speakers read about Cluj-Napoca says nothing
about whether anyone wants a cost-of-living page for it. So `clears()` is only ever consulted
for a family x market cell whose intent the keyword corpus already measured, and the caller is
responsible for that - the module cannot check it, so it says so here instead of pretending.

It reads ONE file, city-search-demand.jsonl.gz, which is the join of the city sitelinks and the
clickstream tables done once in scripts/atlas/ingest/build-city-search-demand.py. The tables
themselves are millions of rows per language and are a local capture; the join is the record.
Reading the join rather than the tables is what keeps this module cheap enough to call inside
the generation loop.
"""
import gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
DEMAND = ROOT + 'data/atlas/sources/wikimedia/city-search-demand.jsonl.gz'
FLOORS = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-SEARCH-DEMAND-FLOOR.json'

# zhwiki is one Wikipedia for both Chinese scripts, so a zh reading stands for zh-Hant only in
# combination with the Taiwanese market demand measured separately. The mapping is written out
# because inferring it from a language tag is how zh-Hant silently became a different language
# from the file it is read out of.
LANG_EDITION = {'zh-Hant': 'zh'}

_reading = None         # geonameid -> {edition: clicks}; a row means the city WAS asked about
_floors = None          # '<edition>|<side>' -> int

# the three states this module has to keep apart, named so a caller cannot confuse them
UNMEASURED = 'unmeasured'       # no capture asked about this city: nothing is known
NO_ARTICLE = 'no_article'       # asked, and this language edition has written nothing
MEASURED = 'measured'           # asked, article exists, the reading is the number


def _edition(lang):
    return LANG_EDITION.get(lang, lang)


def _load():
    """geonameid -> {edition: clicks}. The PRESENCE of a key is the asked set.

    The distinction this preserves is the one that broke the first calibration: a city nobody
    asked about is not a city with no article. Collapsing the two put 92 per cent of German
    home-market cities in the "no German article" bucket, which would have driven almost every
    floor to zero through arithmetic that looked impeccable.
    """
    global _reading
    if _reading is not None:
        return _reading
    _reading = {}
    if os.path.exists(DEMAND):
        for line in gzip.open(DEMAND, 'rt', encoding='utf-8'):
            d = json.loads(line)
            _reading[d['geonameid']] = {k: int(v) for k, v in (d.get('clicks') or {}).items()}
    return _reading


def floors():
    """{'<edition>|<side>': floor}. Keyed by side as well as language because a page in a
    language about a place IN that language's country and a page about a foreign destination
    are not the same claim, and one number for both would apply the weaker bar to the
    stronger case. See calibrate-search-demand-floor.py."""
    global _floors
    if _floors is None:
        if os.path.exists(FLOORS):
            _floors = json.load(open(FLOORS, encoding='utf-8'))['floor_by_language_and_side']
        else:
            _floors = {}
    return _floors


def available():
    """True when both halves of the signal are on disk. A gate that silently becomes a no-op
    because an ingest has not run yet is the failure the fatal-stage policy exists for, so the
    caller is given the means to refuse rather than to carry on quietly."""
    return bool(_load()) and bool(floors())


def reading(geonameid, lang):
    """(state, clicks). clicks is None unless state is MEASURED."""
    row = _load().get(str(geonameid))
    if row is None:
        return UNMEASURED, None
    ed = _edition(lang)
    if ed not in row:
        return NO_ARTICLE, None
    return MEASURED, row[ed]


def clicks(geonameid, lang):
    """The number, or None when there is no number. Kept for callers that only want the
    reading; anything that has to tell UNMEASURED from NO_ARTICLE must use reading()."""
    state, n = reading(geonameid, lang)
    return n if state == MEASURED else None


def clears(geonameid, lang, side):
    """(bool, reason). The reason is written into the row, so it names the numbers.

    `side` is 'home' when the place sits in the market's own country and 'destination'
    otherwise. It is a required argument rather than a default because defaulting it would
    silently apply the weaker of the two bars to the case that needs the stronger one.
    """
    ed = _edition(lang)
    floor = floors().get('%s|%s' % (ed, side))
    if floor is None:
        # no calibration for this language and side means the instrument has nothing to say
        # here, which is not the same as the place failing. The caller keeps the paid gate's
        # own answer; it must not read a missing floor as a pass.
        return False, ''
    state, n = reading(geonameid, lang)
    if state == UNMEASURED:
        return False, ''
    if state == NO_ARTICLE:
        return False, (f'{ed}.wikipedia has no article about this place, so no search '
                       f'readership is attested for it in {ed}')
    if n >= floor:
        return True, (f'{n} search-referred readers a month on the {ed}.wikipedia article, '
                      f'at or above the {floor} floor derived from the {side}-side cities '
                      f'the keyword corpus itself admitted')
    return False, (f'{n} search-referred readers a month on the {ed}.wikipedia article, '
                   f'below the {floor} floor derived from the {side}-side cities the '
                   f'keyword corpus itself admitted')


if __name__ == '__main__':
    r = _load()
    print('cities asked about:', len(r))
    print('cities with at least one article:', sum(1 for v in r.values() if v))
    print('floors:', json.dumps(floors()))
    for gid in sys.argv[1:]:
        print(gid, r.get(gid, '(never asked about)'))
