#!/usr/bin/env python3
"""Derive the search-demand floor from the cities the PAID corpus already admitted.

WHAT A CHOSEN NUMBER WOULD BE. The per-market tier cap abandons a city because the keyword
corpus never measured that family x market cell past a population tier, and dest_evidence()
rejects a destination because that corpus holds no record of this market searching for it.
Replacing either with "any city with some search clicks" would not be a new measurement; it
would be the removal of a gate, presented as evidence. The question has to stay the same - is
this place attested as sought by speakers of this language - and only the INSTRUMENT may change.

SO THE BAR IS THE OLD BAR, READ ON THE NEW INSTRUMENT. Take the cities the paid gates ADMITTED,
the ones in the final manifest. Measure their search-referred Wikipedia readership in the
language their page is served in. The weakest of them is, by construction, the weakest city the
subscription itself let through. A city it never reached that reads at least as strongly is not
a relaxed bar; it is the same bar applied to a place the subscription never got to.

The floor is the Nth percentile of that admitted distribution, N defaulting to 25.
  not the minimum  one admitted city with a dead article would put the floor at zero and the
                   gate would admit everything
  not the median   that is a STRICTER bar than the one being replaced, and would reject half
                   the pages already in the inventory - a different decision wearing the same
                   clothes
The percentile is a parameter and the whole distribution is written out, so the choice is
auditable rather than buried in a constant.

THE REFERENCE CLASS IS THE ADMITTED CITIES THIS INSTRUMENT ATTESTS, which is a decision, so
here is the reasoning and the number it rejects. Measured over ALL admitted cities, twelve of
the twenty-two cells came out at a floor of ZERO, because between 27 and 50 per cent of the
destinations the paid corpus admitted have no attested search readership in the page's
language at all. That is a real disagreement between two instruments rather than a bug: the
corpus admitted those destinations on keyword evidence, which is not what this file measures.

But a floor of zero is not a weak gate, it is no gate: it admits every city that merely HAS an
article, which is the existence proxy the older sitelink capture already was and which this
signal was brought in to replace with a count. A reading of zero is not a weak reading either
- the dump omits anything under ten clicks a month, so zero means "no attested search
readership" - and an admission resting on it would rest on nothing.

So the floor is a percentile of the POSITIVE readings among the admitted cities: the weakest
city this instrument actually attests, rather than the weakest city the corpus admitted on
other grounds. Nothing is removed by this - every city already in the inventory keeps the
evidence it was admitted on - and every NEW admission rests on a positive count. The
all-readings floor is written out beside it as floor_including_zero_readings, so the choice
can be checked rather than taken on trust.

A cell with fewer than MIN_ATTESTED positive readings gets NO floor. Eleven admitted cities
cannot locate a percentile, and a gate calibrated on eleven observations is a guess with a
number attached. With no floor the gate is inert for that cell and the paid evidence stands
alone, which is the safe direction.

PER LANGUAGE, AND PER SIDE. Two splits, both of them load-bearing:

  by language    de.wikipedia has about three million articles and ja.wikipedia about 1.4
                 million with a far smaller readership. One global floor would admit German
                 cities wholesale and reject Japanese ones wholesale, and that is a fact about
                 the editions rather than anything about demand.
  by side        a German page about a town IN Germany and a German page about a foreign
                 destination are not the same claim and the manifest already distinguishes
                 them, as NATIVE_LOCALE against VALID_LOCALIZATION. A small German town is
                 legitimately read less in German than Barcelona is, so calibrating them
                 together would set one floor that is too high for the first and too low for
                 the second. Each side is calibrated against the admitted cities of its own
                 side.

Usage: calibrate-search-demand-floor.py [--percentile 25] [--manifest <csv.gz>]
"""
import collections, csv, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                        # noqa: E402
import search_demand                                          # noqa: E402

MANIFEST = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-SEARCH-DEMAND-FLOOR.json'
# below this many ATTESTED admitted cities a cell gets no floor at all: a percentile of eleven
# observations is a guess with a number attached, and an inert gate is the safe direction
MIN_ATTESTED = 100
MKT_COUNTRY = entity_identity.MKT_COUNTRY


def pct(vals, p):
    if not vals:
        return None
    k = (len(vals) - 1) * p / 100.0
    lo = int(k)
    hi = min(lo + 1, len(vals) - 1)
    return vals[lo] + (vals[hi] - vals[lo]) * (k - lo)


def main():
    p = 25.0
    manifest = MANIFEST
    for i, a in enumerate(sys.argv):
        if a == '--percentile': p = float(sys.argv[i + 1])
        if a == '--manifest': manifest = sys.argv[i + 1]

    # the admitted set: one reading per (city, language, side), not per row, so a city with
    # nine family pages does not count nine times and tilt the percentile toward whatever
    # families happen to be wide
    admitted = {}
    self_admitted = 0
    for r in csv.DictReader(gzip.open(manifest, 'rt', encoding='utf-8')):
        if r['entity_type'] != 'city':
            continue
        if (r.get('entity_demand_evidence') or '').strip():
            # THE RATCHET THIS REFUSES TO TURN. The floor is the readership of the cities the
            # PAID corpus admitted. A row that exists because this very signal admitted it is
            # not part of that set, and letting it in would mean each run calibrating against
            # the cities the previous run let through - a bar that walks downward one run at a
            # time while every run reports a calibrated gate. Counted and excluded.
            self_admitted += 1
            continue
        lang = r['language']
        side = 'home' if r['country'] == MKT_COUNTRY.get(r['market']) else 'destination'
        admitted[(r['entity_id'], lang, side)] = True
    if self_admitted:
        print('excluded %d rows this signal had itself admitted; the floor is calibrated only '
              'on what the paid corpus admitted' % self_admitted, file=sys.stderr)
    print('admitted (city, language, side) readings to take: %d' % len(admitted),
          file=sys.stderr)

    by = collections.defaultdict(list)
    noart = collections.Counter()
    unmeasured = collections.Counter()
    for (gid, lang, side) in admitted:
        state, n = search_demand.reading(gid, lang)
        if state == search_demand.UNMEASURED:
            # NOBODY ASKED ABOUT THIS CITY. It is not a city with no readership; it is a city
            # with no reading. Counting it as a zero is what drove 92 per cent of German
            # home-market cities into the "no article" bucket on the first attempt and would
            # have produced a floor of zero for almost every language - a gate that admits
            # everything, reached by arithmetic that looked impeccable. Excluded, and counted
            # so the exclusion is visible rather than silent.
            unmeasured[(lang, side)] += 1
            continue
        if state == search_demand.NO_ARTICLE:
            # asked, and this language has written nothing about the place. That IS a reading,
            # and it is zero. Dropping it would flatter the floor upward and make the new gate
            # stricter than the one it replaces.
            noart[(lang, side)] += 1
            n = 0
        by[(lang, side)].append(n)

    floors, dist = {}, {}
    for (lang, side), vals in sorted(by.items()):
        vals.sort()
        pos = [v for v in vals if v > 0]
        key = '%s|%s' % (lang, side)
        if len(pos) >= MIN_ATTESTED:
            floors[key] = int(round(pct(pos, p)))
        dist[key] = {
            'admitted_cities_measured': len(vals),
            'of_those_with_a_positive_reading': len(pos),
            'with_no_article_in_this_language': noart[(lang, side)],
            'excluded_because_no_capture_asked_about_them': unmeasured[(lang, side)],
            'floor': floors.get(key),
            'floor_including_zero_readings': int(round(pct(vals, p))),
            'no_floor_because_too_few_attested': len(pos) < MIN_ATTESTED,
            'min_positive': pos[0] if pos else None,
            'p05': int(round(pct(pos, 5))) if pos else None,
            'p10': int(round(pct(pos, 10))) if pos else None,
            'p25': int(round(pct(pos, 25))) if pos else None,
            'median': int(round(pct(pos, 50))) if pos else None,
            'p75': int(round(pct(pos, 75))) if pos else None,
            'p90': int(round(pct(pos, 90))) if pos else None,
            'max': vals[-1],
            'share_reading_zero': round(sum(1 for v in vals if v == 0) / len(vals), 4),
        }

    doc = {
        'what': 'the median monthly search-referred Wikipedia readership a city must show, in '
                'the language its page is served in, to be admitted where the paid keyword '
                'corpus never reached',
        'derived_from': 'the cities the paid gates already admitted, read on the same free '
                        'instrument; the floor is a percentile of the POSITIVE readings among '
                        'them - the weakest city this instrument actually attests',
        'why_positive_readings_only': 'measured over all admitted cities, twelve of the '
                                      'twenty-two cells came out at zero, because the paid '
                                      'corpus admitted many destinations on keyword evidence '
                                      'that this instrument does not attest at all. A floor '
                                      'of zero admits every city that merely HAS an article, '
                                      'which is the existence proxy this signal replaces. '
                                      'floor_including_zero_readings records that number so '
                                      'the choice is auditable.',
        'minimum_attested_cities_to_calibrate_a_cell': MIN_ATTESTED,
        'a_cell_with_no_floor': 'the gate is inert there and the paid evidence stands alone',
        'signal': 'Wikimedia clickstream, referrer class other-search, median monthly',
        'percentile': p,
        'why_not_the_minimum': 'one admitted city with a dead article would put the floor at '
                               'zero and the gate would admit everything',
        'why_not_the_median': 'that is a stricter bar than the one being replaced and would '
                              'reject cities already in the inventory',
        'floor_by_language_and_side': floors,
        # the key the gate reads. The home side is the weaker of the two bars for a language,
        # and a gate that reached for one number per language would quietly apply the home bar
        # to destinations, so the side is part of the key rather than a default.

        'admitted_distribution': dist,
        'manifest': manifest.replace(ROOT, ''),
        'rows_excluded_as_self_admitted': self_admitted,
        'cities_excluded_as_unmeasured': sum(unmeasured.values()),
        'unmeasured_means': 'no sitelink capture asked about the city, so it has no reading '
                            'at all. Counting such a city as a zero would drive the floor to '
                            'zero and the gate would admit everything.',
        'anti_ratchet': 'rows that exist because this signal admitted them are excluded from '
                        'the calibration set, so the floor cannot walk downward run by run',
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(doc, open(OUT, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    for k in sorted(dist):
        d = dist[k]
        print('  %-20s n=%-6d attested=%-6d floor=%-7s (incl zeros %-5d) med=%-7s p90=%-8s '
              'zero=%.0f%% noart=%d'
              % (k, d['admitted_cities_measured'], d['of_those_with_a_positive_reading'],
                 d['floor'] if d['floor'] is not None else 'none',
                 d['floor_including_zero_readings'],
                 d['median'], d['p90'], 100 * d['share_reading_zero'],
                 d['with_no_article_in_this_language']))
    print('wrote', OUT)
    return 0


if __name__ == '__main__':
    sys.exit(main())
