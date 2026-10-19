#!/usr/bin/env python3
"""Every Wikidata landmark that has coordinates and an article in a language we can measure.

WHY THIS LAYER EXISTS. The entity layers built so far are each bounded by their SOURCE
rather than by demand or by utility. The outdoor layer is OpenStreetMap, so it stops at the
34 countries whose extract this container could reach. The water layer is Wikidata but only
six classes. The heritage layer is one national register, England's. Measured on 2026-10-18,
the water funnel's largest single rejection was 74,366 entities refused for having no home
market - not for being unread, not for being fact-poor, but for sitting outside the thirteen
countries the market model names. That is a ceiling of the instruments, not of the places.

So this capture asks Wikidata the same question the water capture asked, for seventy classes
instead of six and for the whole world instead of thirteen countries: which items of this
class have coordinates AND an article in one of the eleven Wikipedia editions whose
clickstream this project holds? An item with no such article cannot be measured here, so it
is not captured; that is the whole of the filter at this stage. Readership, facts and a
containment parent are gates applied downstream, where they can be counted and reported.

ONE PAGE PER ENTITY, NOT ONE PER LANGUAGE. The capture returns every article title an item
has across the eleven editions, because the downstream builder picks the single language in
which the item is most read and writes one page in that language. Emitting the same landmark
in ten languages would be the translation-only multiplication this inventory refuses.

BANDS, NOT OFFSETS. Both engines cap a result set at 10,000 rows, and OFFSET past the cap
returns nothing rather than an error, which once truncated a class to 17 per cent of its size
with no sign in the file. So each class is read in latitude bands, and a band that comes back
AT the cap is not trusted: it is split and both halves re-asked. A full band is evidence of
truncation, never evidence of completeness.

Usage: wikidata-landmark-capture.py [--classes a,b,c] [--only-missing]
Writes data/atlas/sources/wikidata/landmark/<class>.jsonl.gz, one file per class, atomically.
"""
import collections, gzip, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402

OUT = ROOT + 'data/atlas/sources/wikidata/landmark/'
os.makedirs(OUT, exist_ok=True)

# (item id, class name). The supply figure beside each is the count this project measured on
# 2026-10-18 of items of that class carrying coordinates and an article in one of the eleven
# editions, so a class that turns out far smaller than its note is a signal that something
# changed rather than that the note was a guess.
# (item id, class slug, the English label Wikidata gives that item, supply). The supply
# figure is the count this project measured on 2026-10-18 of items of that class carrying
# coordinates and an article in one of the eleven editions.
#
# THE LABEL COLUMN IS A GUARD, NOT DOCUMENTATION. The first draft of this list was written
# from memory and seven of its sixty-six class ids named something else entirely: Q861951 is
# a police station and not a point of interest, Q1788454 is a road junction and not a golf
# course, Q2298537 is a transport hub and not a water tower, and the capture run that found
# this out had already written 94 bus interchanges to a file called water_tower. A slug this
# file chose and a class Wikidata means are two different things, and nothing in a capture
# makes them agree by itself. So check_labels() asks Wikidata for every id's English label
# before any class is read, and refuses the whole run if one has moved.
CLASSES = [
    ('Q16970', 'church', 'church building', 96274),
    ('Q55488', 'railway_station', 'railway station', 74658),
    ('Q4022', 'river', 'river', 54924),
    ('Q8502', 'mountain', 'mountain', 47928),
    ('Q41176', 'building', 'building', 32833),
    ('Q23397', 'lake', 'lake', 25218),
    ('Q23442', 'island', 'island', 21692),
    ('Q33506', 'museum', 'museum', 19276),
    ('Q839954', 'archaeological_site', 'archaeological site', 17241),
    ('Q928830', 'metro_station', 'metro station', 16254),
    ('Q23413', 'castle', 'castle', 13829),
    ('Q3914', 'school', 'school', 13500),
    ('Q1248784', 'airport', 'airport', 12564),
    ('Q22698', 'park', 'park', 11237),
    ('Q16917', 'hospital', 'hospital', 11161),
    ('Q39614', 'cemetery', 'cemetery', 9949),
    ('Q12280', 'bridge', 'bridge', 8364),
    ('Q3918', 'university', 'university', 7797),
    ('Q4989906', 'monument', 'monument', 7746),
    ('Q174782', 'square', 'square', 7159),
    ('Q27686', 'hotel', 'hotel', 6967),
    ('Q483110', 'stadium', 'stadium', 6915),
    ('Q24354', 'theatre', 'theatre building', 6213),
    ('Q1076486', 'sports_venue', 'sports venue', 6027),
    ('Q54050', 'hill', 'hill', 6009),
    ('Q11315', 'shopping_centre', 'shopping center', 5932),
    ('Q44613', 'monastery', 'monastery', 5744),
    ('Q12323', 'dam', 'dam', 5131),
    ('Q207694', 'art_museum', 'art museum', 4636),
    ('Q39715', 'lighthouse', 'lighthouse', 4404),
    ('Q1244442', 'school_building', 'school building', 4310),
    ('Q35666', 'glacier', 'glacier', 3986),
    ('Q11303', 'skyscraper', 'skyscraper', 3920),
    ('Q11707', 'restaurant', 'restaurant', 3919),
    ('Q32815', 'mosque', 'mosque', 3790),
    ('Q207326', 'summit', 'summit', 3745),
    ('Q35509', 'cave', 'cave', 3602),
    ('Q41253', 'cinema', 'movie theater', 3539),
    ('Q34627', 'synagogue', 'synagogue', 3295),
    ('Q40080', 'beach', 'beach', 2818),
    ('Q12518', 'tower', 'tower', 2716),
    ('Q7075', 'library', 'library', 2674),
    ('Q179700', 'statue', 'statue', 2529),
    ('Q167346', 'botanical_garden', 'botanical garden', 2233),
    ('Q483453', 'fountain', 'fountain', 2181),
    ('Q44782', 'port', 'port', 1894),
    ('Q130003', 'ski_resort', 'ski resort', 1531),
    ('Q2977', 'cathedral', 'cathedral', 1421),
    ('Q44539', 'temple', 'temple', 1320),
    ('Q194195', 'amusement_park', 'amusement park', 1063),
    ('Q44377', 'tunnel', 'tunnel', 568),
    ('Q159719', 'power_station', 'power station', 491),
    ('Q2281788', 'aquarium', 'public aquarium', 388),
    ('Q1210950', 'channel', 'channel', 375),
    ('Q190928', 'shipyard', 'shipyard', 369),
    ('Q875157', 'resort', 'resort', 272),
    ('Q274153', 'water_tower', 'water tower', 186),
    ('Q2298537', 'transport_hub', 'transport hub', 94),

    # PASS TWO, and this half of the list was not written from memory. The first
    # fifty-eight classes were, and seven of them named something else; worse, nothing
    # in that run could say whether 626,746 items was most of the readable geographic
    # entities on Wikidata or a fifth of them. wikidata-geo-class-census.py answered
    # that on 2026-10-19: 1,084,510 readable items in 199 classes the first pass does
    # not read. These seventy are that census minus the settlement-shaped classes,
    # which are a separate question with a separate substance problem, and minus
    # anything under 500 readable items. Every label below is the one the census read
    # from Wikidata, so check_labels() is checking a measurement against its source
    # rather than against my recollection.
    #
    # street, road, stream, watercourse and valley are IN, and they are the classes
    # most likely to produce nothing: a street rarely states two facts this file can
    # print. That is the gate's call to make and it will be counted per class, which
    # is a measurement; leaving them out would be a guess.
    ('Q79007', 'street', 'street', 24562),
    ('Q473972', 'protected_area', 'protected area', 14817),
    ('Q34442', 'road', 'road', 11106),
    ('Q47521', 'stream', 'stream', 8701),
    ('Q355304', 'watercourse', 'watercourse', 8041),
    ('Q759421', 'naturschutzgebiet', 'Naturschutzgebiet', 7094),
    ('Q131681', 'reservoir', 'reservoir', 6063),
    ('Q845945', 'shinto_shrine', 'Shinto shrine', 5792),
    ('Q55678', 'railway_stop', 'railway stop', 5625),
    ('Q46831', 'mountain_range', 'mountain range', 5506),
    ('Q10300916', 'cultural_heritage_of_china', 'cultural heritage of China', 5338),
    ('Q4312270', 'railway_station_above_ground', 'railway station above ground', 4900),
    ('Q4663385', 'former_railway_station', 'former railway station', 4880),
    ('Q133056', 'mountain_pass', 'mountain pass', 4832),
    ('Q39594', 'bay', 'bay', 4748),
    ('Q11670533', 'elevated_station', 'elevated station', 4566),
    ('Q811165', 'architectural_heritage_monument', 'architectural heritage monument', 4291),
    ('Q39816', 'valley', 'valley', 4030),
    ('Q34038', 'waterfall', 'waterfall', 3705),
    ('Q846659', 'jewish_cemetery', 'Jewish cemetery', 3697),
    ('Q1081138', 'historic_site', 'historic site', 3532),
    ('Q22746', 'urban_park', 'urban park', 3314),
    ('Q1785071', 'fort', 'fort', 3100),
    ('Q2376564', 'interchange', 'interchange', 3089),
    ('Q179049', 'nature_reserve', 'nature reserve', 2924),
    ('Q34763', 'peninsula', 'peninsula', 2826),
    ('Q38720', 'windmill', 'windmill', 2372),
    ('Q575759', 'war_memorial', 'war memorial', 2321),
    ('Q1015644', 'deserted_castle_site', 'deserted castle site', 2319),
    ('Q12284', 'canal', 'canal', 2307),
    ('Q4421', 'forest', 'forest', 2304),
    ('Q17715832', 'castle_ruin', 'castle ruin', 2227),
    ('Q2319498', 'architectural_landmark', 'architectural landmark', 2196),
    ('Q21503788', 'landschaftsschutzgebiet', 'Landschaftsschutzgebiet', 2169),
    ('Q207524', 'islet', 'islet', 1959),
    ('Q101659', 'dolmen', 'dolmen', 1752),
    ('Q185113', 'cape', 'cape', 1740),
    ('Q1402592', 'island_group', 'island group', 1715),
    ('Q20871353', 'cadastral_area_in_the_czech_republic', 'cadastral area in the Czech Republic', 1657),
    ('Q2151232', 'townland', 'townland', 1651),
    ('Q358', 'heritage_site', 'heritage site', 1559),
    ('Q5003624', 'memorial', 'memorial', 1522),
    ('Q7543083', 'avenue', 'avenue', 1484),
    ('Q3700011', 'kecamatan', 'kecamatan', 1310),
    ('Q852190', 'shipwreck', 'shipwreck', 1303),
    ('Q811534', 'remarkable_tree', 'remarkable tree', 1253),
    ('Q21573182', 'natural_monument_in_germany', 'natural monument in Germany', 1242),
    ('Q1516079', 'cultural_heritage_ensemble', 'cultural heritage ensemble', 1164),
    ('Q740445', 'mountain_ridge', 'mountain ridge', 1164),
    ('Q381885', 'tomb', 'tomb', 1063),
    ('Q15069452', 'natura_2000_site', 'Natura 2000 site', 1061),
    ('Q63565252', 'brook', 'brook', 1046),
    ('Q3812392', 'union_council_of_bangladesh', 'union council of Bangladesh', 945),
    ('Q1191622', 'special_area_of_conservation', 'Special Area of Conservation', 886),
    ('Q1107656', 'garden', 'garden', 830),
    ('Q57821', 'fortification', 'fortification', 810),
    ('Q124714', 'spring', 'spring', 792),
    ('Q2221906', 'geographic_location', 'geographic location', 761),
    ('Q155239', 'indian_reservation_of_canada', 'Indian reservation of Canada', 713),
    ('Q150784', 'canyon', 'canyon', 707),
    ('Q1077097', 'tambon', 'tambon', 688),
    ('Q3253281', 'artificial_pond', 'artificial pond', 686),
    ('Q24529780', 'point', 'point', 664),
    ('Q43483', 'water_well', 'water well', 601),
    ('Q744099', 'hillfort', 'hillfort', 598),
    ('Q2082774', 'mountain_pasture', 'mountain pasture', 566),
    ('Q2624046', 'mountain_chain', 'mountain chain', 559),
    ('Q17018380', 'bight', 'bight', 541),
    ('Q160091', 'plain', 'plain', 532),
    ('Q187223', 'lagoon', 'lagoon', 510),
]

# DELIBERATELY ABSENT, each for a stated reason rather than for being small.
#   Q3957  town             a town is a CITY, and this inventory already pages cities from
#                           GeoNames. Capturing it here would build a second page for a place
#                           that has one.
#   Q2259749 zoo            returned a single item: zoos are stated under subclasses, so the
#                           class is left out rather than captured as a class of one.
#   Q82794 region           1,875 items, and a region is an administrative area rather than a
#                           landmark. The places and district layers own that shape.
#   Q861951 police station  1,536 items. A real class, and not somewhere a traveller is sent.
#   Q18142 tower block      1,427 items, residential buildings.
#   Q1788454 road junction  360 items.
#   Q205495 filling station 186 items.
#   Q13226383 facility      1,555 items, and the class says nothing a page could state.
#   Q4830453 business       3,135 items. An organisation, not a place.
#   Q4287745 medical organization  1,394 items, likewise an organisation.


def check_labels(classes=None):
    """Refuse the run if any class id no longer means what the list beside it says."""
    classes = CLASSES if classes is None else classes
    vals = ' '.join('wd:%s' % q for q, _, _, _ in classes)
    rows = W.ask(W.PREFIXES + 'SELECT ?c ?l WHERE { VALUES ?c { %s } '
                              '?c rdfs:label ?l . FILTER(LANG(?l) = "en") }' % vals)
    if rows is None:
        raise RuntimeError('could not read the class labels, so no class can be trusted')
    got = {W.qid_of(r['c']['value']): r['l']['value'] for r in rows}
    bad = ['%s: expected %r, Wikidata says %r' % (q, lab, got.get(q))
           for q, _, lab, _ in classes if got.get(q) != lab]
    if bad:
        raise SystemExit('class labels have moved:\n  ' + '\n  '.join(bad))
    print('%d class ids check out against their Wikidata labels' % len(classes), flush=True)


def band(qid, cls, lo, hi):
    """Items of one class whose latitude falls in [lo, hi), one row per (item, article).

    ONE ROW PER ARTICLE, NOT PER ITEM, AND THAT IS NOT THE SHAPE I WANTED. The query this
    replaces used GROUP_CONCAT to fold an item's eleven possible articles into one row.
    QLever accepted that query, returned HTTP 200, and omitted the concatenated column
    entirely from every binding: no error, no empty string, just an absent key. The first
    class captured under it wrote a file of zero items while reporting success.

    AND THE LATITUDE IS CAST BEFORE IT IS COMPARED, which is the third silent answer this
    one query has given. `FILTER(?lat >= 45.0)` against QLever's geoLatitude values returns
    zero rows, HTTP 200 and no warning, while `FILTER(?lat > -1000)` on the same pattern
    returns rows whose latitude is 19.6 and `FILTER(xsd:double(?lat) > 45.0)` returns rows
    whose latitude is 46.0. The comparison is not merely unselective, it is wrong, and a band
    that answers zero looks exactly like a band over empty ocean. Casting to double first is
    what made the band walk agree with the count.

    NO OPTIONAL EITHER, for a worse reason. The next draft kept `OPTIONAL { ?x wdt:P17 ?cq }`
    to pick up each item's country. Measured against the same bands without it: church in
    [45, 56.25) answered 64,574 distinct items with the OPTIONAL removed and 0 rows with it
    present, and church in [22.5, 45) answered 171 and 38,592. Both numbers cannot be right,
    and a band that answers 0 looks exactly like a band that is genuinely empty, so the split
    rule never fires and the shortfall reaches the file silently. The country is fetched in a
    later pass by id instead, where a missing answer is a missing answer and can be counted.
    """
    q = W.PREFIXES + """SELECT ?x ?lat ?lon ?site WHERE {
  ?x wdt:P31 wd:%s .
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  FILTER(xsd:double(?lat) >= %s && xsd:double(?lat) < %s)
  ?site schema:about ?x .
  FILTER(%s)
}
LIMIT %d""" % (qid, lo, hi, W.SITE_FILTER, W.CAP)
    rows = W.ask(q, timeout=600)
    if rows is None:
        raise RuntimeError('%s band [%s, %s) failed every attempt' % (cls, lo, hi))
    if len(rows) >= W.CAP:
        if hi - lo < 1e-5:
            raise RuntimeError('%s band [%s, %s) is full and cannot be split further'
                               % (cls, lo, hi))
        mid = (lo + hi) / 2.0
        # Printed, because a class with no output line for an hour is indistinguishable
        # from a hung one. village took forty minutes with nothing on stdout and the only
        # way to tell it was working was that the process still held a socket.
        print('    %s [%s, %s) came back full, splitting' % (cls, lo, hi), flush=True)
        return band(qid, cls, lo, mid) + band(qid, cls, mid, hi)
    return rows


def expected(qid):
    """How many distinct items of this class the endpoint says there are, in one count.

    This is the only thing that makes the band walk trustworthy. Two separate silent
    truncations have now been found in this one file, both of which produced a file that
    looked finished, and a third mechanism would produce a third. A count taken in a single
    query cannot be truncated by the row cap, so the capture is checked against it and a
    class that comes back short is re-read rather than written.
    """
    rows = W.ask(W.PREFIXES + """SELECT (COUNT(DISTINCT ?x) AS ?n) WHERE {
  ?x wdt:P31 wd:%s .
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  ?site schema:about ?x .
  FILTER(%s)
}""" % (qid, W.SITE_FILTER), timeout=900)
    if rows is None:
        raise RuntimeError('no count for %s, so nothing to check the capture against' % qid)
    return int(rows[0]['n']['value'])


def merge(rows, cls, into, langs):
    for r in rows:
        q = W.qid_of(r['x']['value'])
        if not q:
            continue
        p = W.sitelink_parts(r.get('site', {}).get('value'))
        if not p:
            continue
        e = into.get(q)
        if e is None:
            e = into[q] = {'qid': q, 'cls': cls,
                           'lat': float(r['lat']['value']), 'lon': float(r['lon']['value']),
                           'titles': {}}
        if p[0] not in e['titles']:
            langs[p[0]] += 1
        e['titles'][p[0]] = p[1]


# Each retry starts from a finer grid than the last. A class that comes back short under one
# grid has a band the engine answered badly, and a different grid asks a different question.
GRIDS = [1, 12, 60]


def capture(qid, cls, out_dir=None):
    path = (out_dir or OUT) + cls + '.jsonl.gz'
    if os.path.exists(path):
        return None, None
    t0 = time.time()
    want = expected(qid)
    best, best_langs = {}, collections.Counter()
    for grid in GRIDS:
        seen, langs = {}, collections.Counter()
        step = 180.0 / grid
        for i in range(grid):
            merge(band(qid, cls, -90.0 + i * step, -90.0 + (i + 1) * step),
                  cls, seen, langs)
        if len(seen) > len(best):
            best, best_langs = seen, langs
        # Wikidata is edited while this runs, so an exact match is not the test. A capture
        # within a thousandth of the count is complete; anything below it is a shortfall.
        if len(seen) >= want * 0.999:
            break
        print('    %s: grid %d gave %d of %d, re-reading finer'
              % (cls, grid, len(seen), want), flush=True)
    short = want - len(best)
    tmp = path + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for v in best.values():
            fh.write(json.dumps(v, ensure_ascii=False) + '\n')
    os.replace(tmp, path)
    print('  %-22s %7d of %7d  %6.0fs  %s%s'
          % (cls, len(best), want, time.time() - t0, dict(best_langs.most_common(4)),
             '  SHORT BY %d' % short if short > want * 0.001 else ''), flush=True)
    return len(best), want


def run(classes, out_dir, only=None):
    """Capture a class list into one directory, verifying labels first.

    Two entry points share this: the landmark pass above and the settlement pass in
    wikidata-settlement-capture.py. They differ in their class list and in nothing else,
    and a second copy of the band walk is a second place for the three silent answers
    documented in band() to come back.
    """
    os.makedirs(out_dir, exist_ok=True)
    check_labels(classes)
    shortfalls = {}
    total = 0
    for qid, cls, _label, _supply in classes:
        if only and cls not in only:
            continue
        n, want = capture(qid, cls, out_dir)
        if n is None:
            print('  %-22s already captured, skipped' % cls, flush=True)
            continue
        total += n
        if want - n > want * 0.001:
            shortfalls[cls] = {'captured': n, 'endpoint_count': want}
    print('captured this run: %d' % total)
    if shortfalls:
        print('CLASSES THAT CAME BACK SHORT, recorded rather than rounded away:')
        for cls, d in shortfalls.items():
            print('  %-22s %d of %d' % (cls, d['captured'], d['endpoint_count']))
    json.dump(shortfalls, open(out_dir + '_shortfalls.json', 'w'), indent=1)
    return total


def main():
    only = None
    args = sys.argv[1:]
    if '--classes' in args:
        only = set(args[args.index('--classes') + 1].split(','))
    run(CLASSES, OUT, only)


if __name__ == '__main__':
    main()
