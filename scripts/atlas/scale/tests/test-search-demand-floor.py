#!/usr/bin/env python3
"""The free search-demand gate, as a test: the properties that make it a gate and not a hole.

The signal admits cities the paid keyword corpus never reached. That makes it the one piece of
this pipeline where a bug does not show up as a missing page but as an EXTRA one, so the
properties worth pinning are the ones that keep it honest rather than the ones that make it
generous.

Run: python3 scripts/atlas/scale/tests/test-search-demand-floor.py
"""
import json, os, sys, tempfile, gzip

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import search_demand as sd                                     # noqa: E402

fails = []


def check(name, got, want):
    if got != want:
        fails.append(f'{name}: got {got!r}, wanted {want!r}')


def pct(vals, p):
    vals = sorted(vals)
    k = (len(vals) - 1) * p / 100.0
    lo = int(k); hi = min(lo + 1, len(vals) - 1)
    return vals[lo] + (vals[hi] - vals[lo]) * (k - lo)


# ---- the percentile, which is the whole of the calibration ----------------------------------
# A floor at the MINIMUM is a floor at zero as soon as one admitted city has a dead article,
# and a gate whose floor is zero admits everything while still reporting a floor.
check('p25 of a distribution with one zero is not zero',
      int(round(pct([0, 40, 50, 60, 70, 80, 90, 100], 25))) > 0, True)
check('p00 of the same distribution IS zero, which is why the minimum is not used',
      int(round(pct([0, 40, 50, 60, 70, 80, 90, 100], 0))), 0)
# and the median would be a STRICTER bar than the one being replaced, so it is not a safe
# "when in doubt" either: it rejects half the pages already in the inventory
check('the median is strictly above p25 here, i.e. a different decision',
      pct([0, 40, 50, 60, 70, 80, 90, 100], 50) > pct([0, 40, 50, 60, 70, 80, 90, 100], 25),
      True)

# ---- a missing floor must never read as a pass ----------------------------------------------
# The ingest can be absent: a fresh clone, a failed capture, a run before the dumps landed. The
# gate then has nothing to say, and "nothing to say" has to mean the paid gate's own answer
# stands, not that every city is admitted.
sd._floors = {}
ok, why = sd.clears('1', 'de', 'destination')
check('no floor for this language and side does not admit', ok, False)
check('and it gives no reason, so nothing is written into the row as evidence', why, '')

# ---- the side is part of the key, not a default ----------------------------------------------
# The home-side floor is the weaker of the two for a language, because a small town in the
# market's own country is legitimately read less than a foreign destination. A gate that
# reached for one number per language would apply the weaker bar to the stronger case.
sd._floors = {'de|home': 12, 'de|destination': 300}
sd._reading = {'77': {'de': 50}}
ok_home, _ = sd.clears('77', 'de', 'home')
ok_dest, _ = sd.clears('77', 'de', 'destination')
check('50 readers clears the home floor of 12', ok_home, True)
check('the same 50 readers does NOT clear the destination floor of 300', ok_dest, False)

# ---- no article is a measurement of nothing, not an unknown ---------------------------------
# the city WAS asked about and has an English article and no German one
sd._reading = {'88': {'en': 9999}}
ok, why = sd.clears('88', 'de', 'destination')
check('a city with no German article is refused on the German side', ok, False)
check('and the reason says so rather than quoting a number',
      'no article about this place' in why, True)

# ---- an article present but under the source floor reads as a low number, not as absent -----
# The clickstream omits any (referrer, article) pair under ten clicks a month. An article that
# exists and is absent from the table is therefore MEASURED as under ten. Reading that as
# "unmeasured" and falling back to a pass is the one misreading that would turn the file into
# a way of admitting everything.
# present with a zero: the article exists and read under the dump's ten-click floor
sd._reading = {'99': {'de': 0}}
ok, why = sd.clears('99', 'de', 'home')
check('an existing article with no row reads as zero and is refused', ok, False)
check('and the reason quotes the zero, so the row records a measurement',
      why.startswith('0 search-referred readers'), True)

# ---- zh-Hant reads out of zhwiki, which is one edition for both scripts ----------------------
# The join step keys its rows by EDITION, so a zh-Hant market has to be mapped to zh before
# the lookup. Without the mapping every Taiwanese row reads as "no article" and the whole
# market silently stops being admissible, which looks exactly like a gate working.
sd._reading = {'7': {'zh': 4000}}
sd._floors = {'zh|destination': 100}
ok, _ = sd.clears('7', 'zh-Hant', 'destination')
check('a zh-Hant page reads the zh edition', ok, True)

# ---- the floor is inclusive, and the boundary is stated rather than left to a reader ---------
sd._reading = {'8': {'it': 300}}
sd._floors = {'it|destination': 300}
ok, _ = sd.clears('8', 'it', 'destination')
check('a reading exactly at the floor is admitted', ok, True)
sd._reading = {'8': {'it': 299}}
ok, _ = sd.clears('8', 'it', 'destination')
check('one below the floor is not', ok, False)

# ---- the three states are three states, and the middle one is the trap --------------------
# A city nobody asked about is not a city with no readership. Collapsing the two is what put
# 92 per cent of German home-market cities in the "no German article" bucket on the first
# attempt, which would have driven almost every floor to zero: a gate that admits everything,
# reached by arithmetic that looked impeccable.
sd._floors = {'de|home': 12}
sd._reading = {'500': {'de': 40}}            # asked, has an article, read 40
check('an asked city with an article reports MEASURED',
      sd.reading('500', 'de'), (sd.MEASURED, 40))
sd._reading = {'501': {'en': 40}}            # asked, no German article
check('an asked city with no article in the language reports NO_ARTICLE',
      sd.reading('501', 'de'), (sd.NO_ARTICLE, None))
check('a city no capture asked about reports UNMEASURED',
      sd.reading('502', 'de'), (sd.UNMEASURED, None))
# and an unmeasured city must not be admitted, and must give NO reason, so that nothing is
# written into the row claiming evidence that does not exist
ok, why = sd.clears('502', 'de', 'home')
check('an unmeasured city is not admitted', ok, False)
check('and carries no evidence string', why, '')
# while an asked city with no article is refused WITH a reason, because that is a finding
ok, why = sd.clears('501', 'de', 'home')
check('an asked city with no article is refused', ok, False)
check('and the refusal is recorded as a finding', 'no article about this place' in why, True)

if fails:
    print('FAIL')
    for f in fails:
        print('  ' + f)
    sys.exit(1)
print('ok, all search-demand gate properties hold')
