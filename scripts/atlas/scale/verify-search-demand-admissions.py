#!/usr/bin/env python3
"""Check what the free search-demand signal actually let into the manifest.

A gate that admits is the one place in this pipeline where a bug shows up as an EXTRA page
rather than a missing one, and an extra page is not visible in a total that went up. So the
admissions are checked against the constraints they were allowed under, one assertion each,
and the script exits non-zero if any of them fails.

What is checked, and why each one is the way a mistake here would look:

  1 EVERY admitted row names its number and its floor. A row admitted with an empty evidence
    string is a row admitted for no stated reason, which is indistinguishable from a bug.
  2 No admitted row's reading is below the floor it cites. The gate and the evidence have to
    agree; if they can disagree, one of them is decoration.
  3 No admitted row is TRANSLATION_ONLY. The brief forbids translation-only pages outright and
    this signal is not a licence to make them: it answers whether a place is sought, never
    whether a page adds anything.
  4 Every admitted row is a city with a distinct URL. A city-name swap - two places sharing a
    slug, one page - is exactly what admitting the long tail could reintroduce, and the slug
    collision fix is what stands between this and 748 duplicate URLs again.
  5 No other gate's rejection count fell. If admitting cities also made some other gate reject
    fewer rows, something was loosened that nobody decided to loosen. This compares against
    the previous run's summary.
  6 The funnel still reconciles: generated - rejected = FINAL.

Usage: verify-search-demand-admissions.py <before-summary.json> [--manifest ...] [--rejected ...]
"""
import collections, csv, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
MANIFEST = OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
REJECTED = OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz'
SUMMARY = OUT + '1M-SUMMARY.json'

# The gates whose rejection counts must not fall. Named rather than discovered, so a gate added
# later is a deliberate addition to this list and not a silent omission from it.
#
# `removed_by_localisation_gate` is DELIBERATELY NOT HERE, and leaving it out silently would
# look exactly like the oversight this list exists to prevent. That gate is the one the sixth
# proof is supposed to change: a destination it now attests moves from
# LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION to VALID_LOCALIZATION, so its rejections fall by
# construction. It is checked separately below, against the exact class that is allowed to
# shrink, so a fall anywhere else in that gate would still be caught.
GATE_COUNTS = [
    'removed_by_uniqueness_and_serp_gate', 'removed_as_exact_duplicate_urls',
    'removed_by_unsupported_superlative_gate', 'removed_by_per_market_family_gate',
    'removed_by_cross_market_content_uniqueness_gate', 'removed_as_semantic_duplicates',
    'removed_by_cannibalisation', 'removed_as_the_same_journey_already_timetabled',
    'removed_as_the_same_name_in_the_same_city', 'removed_as_the_same_wikidata_item',
    'removed_because_the_declared_parent_did_not_survive',
]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    before = json.load(open(sys.argv[1], encoding='utf-8'))
    manifest, rejected = MANIFEST, REJECTED
    for i, a in enumerate(sys.argv):
        if a == '--manifest': manifest = sys.argv[i + 1]
        if a == '--rejected': rejected = sys.argv[i + 1]
    after = json.load(open(SUMMARY, encoding='utf-8'))

    fails, notes = [], []
    admitted = []
    urls = collections.Counter()
    for r in csv.DictReader(gzip.open(manifest, 'rt', encoding='utf-8')):
        urls[r['url_pattern']] += 1
        if (r.get('entity_demand_evidence') or '').strip():
            admitted.append(r)

    notes.append('rows carrying free-signal evidence: %d' % len(admitted))

    # 1 and 2: the evidence names a number and a floor, and they agree with each other
    no_number = 0
    disagree = 0
    for r in admitted:
        ev = r['entity_demand_evidence']
        got = [int(t) for t in ev.replace(',', ' ').split() if t.isdigit()]
        if len(got) < 2:
            no_number += 1
            continue
        reading, floor = got[0], got[1]
        if reading < floor:
            disagree += 1
    if no_number:
        fails.append('%d admitted rows whose evidence does not name both a reading and a '
                     'floor' % no_number)
    if disagree:
        fails.append('%d admitted rows whose own evidence puts the reading BELOW the floor it '
                     'cites' % disagree)

    # 3: none of them is a translation
    bad_class = collections.Counter(r['localization_class'] for r in admitted
                                    if r['localization_class'] in ('TRANSLATION_ONLY',
                                                                   'LOCAL_INTENT_MISSING',
                                                                   'LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION'))
    if bad_class:
        fails.append('admitted rows in classes this signal must never produce: %s'
                     % dict(bad_class))

    # 4: cities, with distinct URLs
    non_city = sum(1 for r in admitted if r['entity_type'] != 'city')
    if non_city:
        fails.append('%d admitted rows are not cities; the signal is only defined for cities'
                     % non_city)
    dupe_urls = [u for u, n in urls.items() if n > 1]
    if dupe_urls:
        fails.append('%d duplicate URLs in the manifest (first: %s)'
                     % (len(dupe_urls), dupe_urls[0]))

    # 5: no other gate rejects less than it used to
    for k in GATE_COUNTS:
        b, a = before.get(k), after.get(k)
        if b is None or a is None:
            notes.append('gate count %s absent from one of the two summaries' % k)
            continue
        if a < b:
            fails.append('%s fell from %d to %d: a gate rejects less than it did, which no '
                         'part of this change was supposed to do' % (k, b, a))

    # 5b: the localisation gate is allowed to reject less, but ONLY by the amount the one
    # addressable class shrank, and ONLY in that class. A fall anywhere else in it would be a
    # gate loosening behind the one legitimate movement.
    bl = before.get('localization_classes') or {}
    al = after.get('localization_classes') or {}
    allowed = bl.get('LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION', 0) - \
        al.get('LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION', 0)
    fell = before.get('removed_by_localisation_gate', 0) - after.get('removed_by_localisation_gate', 0)
    if fell != allowed:
        fails.append('the localisation gate rejects %d fewer rows but only %d came out of '
                     'LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION: the difference is a class that '
                     'was not supposed to move' % (fell, allowed))
    for cls in ('TRANSLATION_ONLY', 'LOCAL_INTENT_MISSING', 'LOCAL_DATA_MISSING'):
        if al.get(cls, 0) < bl.get(cls, 0):
            fails.append('%s fell from %d to %d: this signal must not recover anything from '
                         'that class' % (cls, bl.get(cls, 0), al.get(cls, 0)))
    notes.append('localisation gate rejects %d fewer, all of it out of '
                 'LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION' % fell)

    # 6: the funnel reconciles, by the builder's own check
    if not after.get('funnel_reconciles'):
        fails.append('the builder reports the funnel does not reconcile')

    # and the arithmetic the user asked for, stated rather than implied
    notes.append('FINAL before: %d' % before['FINAL_DISTINCT_CANDIDATES'])
    notes.append('FINAL after:  %d' % after['FINAL_DISTINCT_CANDIDATES'])
    notes.append('NET FINAL gain: %+d' % (after['FINAL_DISTINCT_CANDIDATES']
                                          - before['FINAL_DISTINCT_CANDIDATES']))
    notes.append('rejected before: %d, after: %d'
                 % (before['rejected_by_quality_gates'], after['rejected_by_quality_gates']))
    notes.append('combinations the tier cap still drops: %d (was %d)'
                 % (after['dropped_beyond_measured_tier'],
                    before['dropped_beyond_measured_tier']))
    notes.append('combinations the free signal admitted past the cap: %d'
                 % after.get('admitted_past_tier_by_measured_search_readership', 0))

    by_family = collections.Counter(r['family'] for r in admitted)
    by_market = collections.Counter(r['market'] for r in admitted)
    doc = {
        'checks_failed': fails,
        'notes': notes,
        'admitted_rows': len(admitted),
        'admitted_distinct_cities': len({r['entity_id'] for r in admitted}),
        'admitted_by_market': dict(by_market.most_common()),
        'admitted_by_family': dict(by_family.most_common(40)),
        'admitted_by_localisation_class': dict(collections.Counter(
            r['localization_class'] for r in admitted).most_common()),
        'admitted_by_source_status': dict(collections.Counter(
            r['source_status'] for r in admitted).most_common()),
    }
    json.dump(doc, open(OUT + '1M-SEARCH-DEMAND-ADMISSIONS.json', 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    for n in notes:
        print('  ' + n)
    if fails:
        print('FAIL')
        for f in fails:
            print('  ' + f)
        return 1
    print('ok, every admission constraint holds')
    return 0


if __name__ == '__main__':
    sys.exit(main())
