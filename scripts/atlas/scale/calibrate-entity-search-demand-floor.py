#!/usr/bin/env python3
"""Derive the entity search-demand floor from the OUTDOOR FEATURES the paid corpus admitted.

WHY A SECOND FLOOR FILE EXISTS, when 1M-SEARCH-DEMAND-FLOOR.json already holds one.

That file's floors are calibrated on admitted CITIES, and the number they produce for a city
is the right number for a city and the wrong number for a lake. Measured on the captured
water and protected-area layer: the median POSITIVE reading of its German articles is 39
readers a month, against a de|home city floor of 478. A German town is read in German for a
hundred reasons - someone moving there, a football result, a news item - while a lake is read
by someone looking the lake up. Applying the city floor here would reject essentially the
whole layer, and it would do so on an instrument calibrated against a different kind of
thing. That is the same error this project already named when it refused to rank the
destination tail by population: a measurement taken with the wrong instrument reads near zero
and gets reported as "the tail is dead".

AND THE FIX IS NOT A LOWER NUMBER. Lowering a floor because it rejects what you wanted is how
a gate stops being one. The fix is the SAME METHOD against the matching reference class:

  the reference class   the 33,836 outdoor_feature rows in the current manifest. Those are
                        features the paid-gated pipeline ADMITTED, so the weakest of them is
                        by construction the weakest outdoor feature the subscription let
                        through. A captured lake reading at least as strongly is not held to a
                        relaxed bar; it is held to the bar this inventory already publishes at.
  the same statistic    the 25th percentile of the POSITIVE readings, per language and per
                        side, with MIN_ATTESTED observations required before a cell gets a
                        floor at all. Identical to the city calibration, for the identical
                        reasons, which are written out in calibrate-search-demand-floor.py:
                        not the minimum, because one dead article would put the floor at zero;
                        not the median, because that is a stricter bar than the one being
                        replaced.

WHAT THIS FLOOR IS AND IS NOT. It is the ENTITY half of the question: is this feature sought
by speakers of this language. It cannot establish that a family intent exists in a market, and
the caller stays responsible for that, exactly as search_demand.py says of the city signal.

THE RATCHET THIS REFUSES TO TURN. A manifest row carrying entity_demand_evidence exists
because a free-signal gate admitted it. Calibrating on those would mean each run measuring
itself against what the last run let through, a bar walking downward while every run reports a
calibrated gate. Those rows are counted and excluded.

Usage: calibrate-entity-search-demand-floor.py [--percentile 25] [--manifest <csv.gz>]
Reads  the manifest, data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz (for the
       OpenStreetMap id to Wikidata item mapping) and the entity readership store
Writes reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json
"""
import collections, csv, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                        # noqa: E402

MANIFEST = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
FEATURES = ROOT + 'data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz'
READING = ROOT + 'data/atlas/sources/wikimedia/entity-search-demand.jsonl.gz'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json'
# Below this many ATTESTED admitted features a cell gets no floor: a percentile of eleven
# observations is a guess with a number attached, and an inert gate is the safe direction.
MIN_ATTESTED = 100
MKT_COUNTRY = entity_identity.MKT_COUNTRY
# zhwiki is one Wikipedia for both Chinese scripts. The mapping is written out rather than
# inferred from a language tag, which is how zh-Hant silently became a different language from
# the file it is read out of.
LANG_EDITION = {'zh-Hant': 'zh'}


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

    # OpenStreetMap id -> Wikidata item. The manifest keys an outdoor feature by its OSM id,
    # and the readership store is keyed by Wikidata item, so the mapping has to come from the
    # candidate file that carries both.
    qid_of = {}
    for line in gzip.open(FEATURES, 'rt', encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        d = json.loads(line)
        if d.get('entity_id') and d.get('qid'):
            qid_of[d['entity_id']] = d['qid']
    print('admitted feature rows carrying a Wikidata item: %d' % len(qid_of), file=sys.stderr)

    reading = {}
    for line in gzip.open(READING, 'rt', encoding='utf-8'):
        line = line.strip()
        if line:
            d = json.loads(line)
            reading[d['qid']] = d.get('clicks') or {}
    print('entities with a readership reading: %d' % len(reading), file=sys.stderr)

    # One reading per (entity, language, side), not per row: a feature carrying three family
    # pages must not count three times and tilt the percentile toward whatever family is wide.
    admitted, self_admitted = {}, 0
    for r in csv.DictReader(gzip.open(manifest, 'rt', encoding='utf-8')):
        if r['entity_type'] != 'outdoor_feature':
            continue
        if (r.get('entity_demand_evidence') or '').strip():
            self_admitted += 1
            continue
        side = 'home' if r['country'] == MKT_COUNTRY.get(r['market']) else 'destination'
        admitted[(r['entity_id'], r['language'], side)] = True
    if self_admitted:
        print('excluded %d rows this signal had itself admitted' % self_admitted,
              file=sys.stderr)
    print('admitted (feature, language, side) readings to take: %d' % len(admitted),
          file=sys.stderr)

    cells = collections.defaultdict(lambda: {'all': [], 'pos': [], 'no_article': 0,
                                             'no_qid': 0, 'unmeasured': 0})
    for (eid, lang, side), _ in admitted.items():
        c = cells['%s|%s' % (LANG_EDITION.get(lang, lang), side)]
        q = qid_of.get(eid)
        if not q:
            # Admitted on a Wikipedia article or an attribute count, with no Wikidata item to
            # read a readership for. Counted, not treated as a zero: a feature with no item is
            # unmeasured on this instrument, and calling that nought would drag every floor down.
            c['no_qid'] += 1
            continue
        if q not in reading:
            c['unmeasured'] += 1
            continue
        clicks = reading[q]
        ed = LANG_EDITION.get(lang, lang)
        if ed not in clicks:
            # asked, and this edition has written no article: a measurement, but not a reading
            c['no_article'] += 1
            continue
        v = int(clicks[ed])
        c['all'].append(v)
        if v > 0:
            c['pos'].append(v)

    floors, dist = {}, {}
    for key, c in sorted(cells.items()):
        c['all'].sort()
        c['pos'].sort()
        enough = len(c['pos']) >= MIN_ATTESTED
        f = int(pct(c['pos'], p)) if enough else None
        if f is not None:
            floors[key] = f
        dist[key] = {
            'admitted_features_measured': len(c['all']) + c['no_article'],
            'of_those_with_a_positive_reading': len(c['pos']),
            'with_no_article_in_this_language': c['no_article'],
            'admitted_with_no_wikidata_item_so_unmeasurable_here': c['no_qid'],
            'excluded_because_no_capture_asked_about_them': c['unmeasured'],
            'floor': f,
            'floor_including_zero_readings': (int(pct(c['all'], p))
                                              if len(c['all']) >= MIN_ATTESTED else None),
            'no_floor_because_too_few_attested': not enough,
            'min_positive': c['pos'][0] if c['pos'] else None,
            'p05': pct(c['pos'], 5), 'p10': pct(c['pos'], 10), 'p25': pct(c['pos'], 25),
            'median': pct(c['pos'], 50), 'p75': pct(c['pos'], 75), 'p90': pct(c['pos'], 90),
            'max': c['pos'][-1] if c['pos'] else None,
            'share_reading_zero': (round(1 - len(c['pos']) / len(c['all']), 4)
                                   if c['all'] else None),
        }

    out = {
        'what': 'the median monthly search-referred Wikipedia readership an ENTITY must show, '
                'in the language its page is served in, to be admitted where the paid keyword '
                'corpus never reached',
        'reference_class': 'the outdoor_feature rows in the current manifest: features the '
                           'paid-gated pipeline already admitted',
        'why_not_the_city_floors': 'those are calibrated on admitted cities. The captured '
                                   'water layer reads a median of 39 positive German readers '
                                   'a month against a de|home city floor of 478, because a '
                                   'town is read in German for a hundred reasons and a lake '
                                   'is read by someone looking the lake up. A floor measured '
                                   'on one kind of thing and applied to another is not a floor.',
        'same_method_as_the_city_floor': 'the 25th percentile of the positive readings, per '
                                         'language and per side, MIN_ATTESTED observations '
                                         'required; see calibrate-search-demand-floor.py for '
                                         'why not the minimum and why not the median',
        'minimum_attested_features_to_calibrate_a_cell': MIN_ATTESTED,
        'a_cell_with_no_floor': 'the gate is inert there and the paid evidence stands alone',
        'signal': 'Wikimedia clickstream, referrer class other-search, median monthly',
        'percentile': p,
        'rows_excluded_as_self_admitted': self_admitted,
        'floor_by_language_and_side': floors,
        'admitted_distribution': dist,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, 'w', encoding='utf-8'), indent=1, ensure_ascii=False,
              sort_keys=True)
    print('\n%-18s %8s %8s %8s %8s' % ('cell', 'measured', 'positive', 'floor', 'median'))
    for key in sorted(dist):
        d = dist[key]
        print('%-18s %8d %8d %8s %8s'
              % (key, d['admitted_features_measured'], d['of_those_with_a_positive_reading'],
                 d['floor'] if d['floor'] is not None else 'none',
                 int(d['median']) if d['median'] is not None else '-'))
    print('\nwrote %s' % OUT)


if __name__ == '__main__':
    main()
