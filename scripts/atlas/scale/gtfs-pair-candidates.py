#!/usr/bin/env python3
"""
Turn the harvested GTFS stop graphs into settlement-to-settlement pair candidates.

THE COLLAPSE IS THE POINT. The harvest produced 1,570,592 directly-served STOP pairs from
the first 29 feeds. This builder emits 1,929 settlement pairs from them, a ratio of 814 to
1, and that is the gate working rather than the gate losing.

A stop pair inside one bus network - "Churchill Avenue to Hospital Main Gate, Cardiff" -
is a real connection and a worthless page. Nobody types it, 57,181 of them come out of one
small city's feed, and publishing them would be the arbitrary Cartesian product the brief
forbids, differing only in that each row happens to be true. The unit a reader searches is
the SETTLEMENT pair: Cardiff to Newport, Oxford to Bicester. That is also the unit the
category leader uses - rome2rio's 1,850,129 keywords sit on pairs of named places, not
pairs of roadside poles.

WHAT THIS FAMILY HAS THAT THE EXISTING PAIR FAMILIES DO NOT. transport.city-pair-air rests
on a 2014 OpenFlights snapshot and transport.city-pair-rail on a Wikidata adjacency graph,
so each page can say the two places are connected and how far apart they are, and must stay
silent on everything a traveller actually wants. GTFS publishes stop_times, so these pages
state a REAL scheduled duration and a REAL count of direct services, attributed to the
agency that published them. The brief's "do not invent timetable, fare, frequency or
duration unless the source provides them" is satisfied by the source providing them.

Fares are still refused. Most of these feeds ship no fare_attributes, and a fare is the one
number on a transport page that changes without notice.

Output: data/atlas/sources/transport/_gtfs-pair-candidates.jsonl.gz
"""
import json, gzip, glob, os, math, collections, statistics, sys

ROOT = '/home/user/Livdar-eSim/'
GT = ROOT + 'data/atlas/sources/transport/gtfs/'

# ---- gates -----------------------------------------------------------------------------------
STOP_TO_CITY_KM = 25.0   # a stop further than this from any settlement is attributed to none
MIN_CITY_POP = 1000      # below this the gazetteer row is a hamlet, not a destination
MIN_CITY_SEPARATION_KM = 5.0   # closer than this and the "pair" is a city and its own suburb
MIN_DIRECT_TRIPS = 10    # a handful of trips is a quirk of one timetable, not a service
MIN_DURATION_S, MAX_DURATION_S = 120, 12 * 3600

stats = collections.Counter()

# ---- gazetteer -------------------------------------------------------------------------------
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('id') and c.get('lat') is not None and c.get('lon') is not None:
            cities.append({'id': str(c['id']), 'name': c.get('name') or c.get('ascii'),
                           'country': c.get('country'), 'pop': c.get('population') or 0,
                           'lat': float(c['lat']), 'lon': float(c['lon'])})
CELL = 0.25
grid = collections.defaultdict(list)
for c in cities:
    grid[(int(c['lat'] / CELL), int(c['lon'] / CELL))].append(c)
print(f'gazetteer: {len(cities):,} settlements', file=sys.stderr)


def km(a, b, c, d):
    p = math.pi / 180
    return 6371 * 2 * math.asin(math.sqrt(max(0.0,
        math.sin((c - a) * p / 2) ** 2 +
        math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2)))


def nearest_city(lat, lon):
    gi, gj = int(lat / CELL), int(lon / CELL)
    sp = int(STOP_TO_CITY_KM / 111.0 / CELL) + 1
    best = None
    for i in range(gi - sp, gi + sp + 1):
        for j in range(gj - sp, gj + sp + 1):
            for c in grid.get((i, j), ()):
                if c['pop'] < MIN_CITY_POP:
                    continue
                d = km(lat, lon, c['lat'], c['lon'])
                if d <= STOP_TO_CITY_KM and (best is None or d < best[1]):
                    best = (c, d)
    return best


# ---- fold every feed onto the settlement pair ------------------------------------------------
# A pair served by two operators in two feeds is ONE page carrying both, so the aggregate is
# keyed on the city pair and the evidence accumulates.
P = collections.defaultdict(lambda: {
    'trips': 0, 'durations': [], 'modes': set(), 'route_names': set(),
    'operators': set(), 'licences': set(), 'feeds': set(), 'stop_pairs': 0,
    'countries': set()})

feeds = sorted(glob.glob(GT + 'pairs-*.json.gz'))
for fi, f in enumerate(feeds, 1):
    try:
        d = json.load(gzip.open(f, 'rt', encoding='utf-8'))
    except Exception as e:
        stats['feed_unreadable'] += 1
        continue
    stats['feeds_read'] += 1
    op = (d.get('agency') or [{}])[0].get('name') or d.get('provider') or ''
    lic = d.get('licence') or ''
    resolved, unresolved = {}, 0
    for sid, s in (d.get('stops') or {}).items():
        n = nearest_city(s['lat'], s['lon'])
        if n:
            resolved[sid] = n[0]
        else:
            unresolved += 1
    stats['stops_resolved_to_a_settlement'] += len(resolved)
    stats['stops_with_no_settlement_within_%dkm' % STOP_TO_CITY_KM] += unresolved
    for p in d.get('pairs') or []:
        stats['raw_stop_pairs'] += 1
        a, b = resolved.get(p['a']), resolved.get(p['b'])
        if not a or not b:
            stats['rejected_stop_not_attributed_to_a_settlement'] += 1
            continue
        if a['id'] == b['id']:
            stats['rejected_both_stops_in_the_same_settlement'] += 1
            continue
        sep = km(a['lat'], a['lon'], b['lat'], b['lon'])
        if sep < MIN_CITY_SEPARATION_KM:
            stats['rejected_settlements_closer_than_%dkm' % MIN_CITY_SEPARATION_KM] += 1
            continue
        if (p.get('trips') or 0) < MIN_DIRECT_TRIPS:
            stats['rejected_fewer_than_%d_direct_trips' % MIN_DIRECT_TRIPS] += 1
            continue
        dur = p.get('median_duration_s')
        if dur is None or not (MIN_DURATION_S <= dur <= MAX_DURATION_S):
            stats['rejected_no_usable_scheduled_duration'] += 1
            continue
        # The CITY feeds stay UNDIRECTED. gtfs-harvest.py emits stop pairs without
        # recording which way round the trip ran, so a direction cannot be recovered from
        # them, and inventing one would be fabricating a fact. They keep the canonical
        # alphabetical key and emit one page per corridor, as before.
        k = (a['id'], b['id']) if a['id'] < b['id'] else (b['id'], a['id'])
        e = P[k]
        e['directed'] = e.get('directed', False)
        e['trips'] += p['trips']
        e['durations'].append(dur)
        e['modes'].update(p.get('modes') or [])
        e['route_names'].update(p.get('route_names') or [])
        if op: e['operators'].add(op)
        if lic: e['licences'].add(lic)
        e['feeds'].add(d.get('mdb_source_id'))
        e['stop_pairs'] += 1
        e['countries'].update([a['country'], b['country']])
        e['sep_km'] = sep
        e['a'], e['b'] = a, b
    if fi % 10 == 0:
        print(f'  [{fi}/{len(feeds)}] settlement pairs so far {len(P):,}', file=sys.stderr)

# ---- fold in the NATIONAL feeds ---------------------------------------------------------------
# gtfs-national-harvest.py already resolved its stops to settlements inside its own streaming
# pass, because a 540 MB national aggregate cannot be reduced to stop pairs first. So its rows
# arrive in the settlement shape and join the same aggregate: a pair that a national rail feed
# and a local bus feed both evidence is ONE page carrying both.
NAT = ROOT + 'data/atlas/sources/transport/gtfs-national/'
for f in sorted(glob.glob(NAT + 'pairs-*.json.gz')):
    try:
        d = json.load(gzip.open(f, 'rt', encoding='utf-8'))
    except Exception:
        stats['national_feed_unreadable'] += 1
        continue
    stats['national_feeds_read'] += 1
    lic = d.get('licence') or ''
    prov = d.get('provider') or ''
    if not d.get('stop_times_grouped_by_trip', True):
        # the harvester warns when a feed's stop_times was not grouped by trip; its durations
        # are unreliable and the whole feed is refused rather than carried with a caveat
        stats['national_feed_refused_stop_times_not_grouped'] += 1
        continue
    for p_ in d.get('pairs') or []:
        stats['raw_national_settlement_pairs'] += 1
        sep = km(p_['a_lat'], p_['a_lon'], p_['b_lat'], p_['b_lon'])
        if sep < MIN_CITY_SEPARATION_KM:
            stats['rejected_settlements_closer_than_%dkm' % MIN_CITY_SEPARATION_KM] += 1
            continue
        if (p_.get('trips') or 0) < MIN_DIRECT_TRIPS:
            stats['rejected_fewer_than_%d_direct_trips' % MIN_DIRECT_TRIPS] += 1
            continue
        dur = p_.get('median_duration_s')
        if dur is None or not (MIN_DURATION_S <= dur <= MAX_DURATION_S):
            stats['rejected_no_usable_scheduled_duration'] += 1
            continue
        ida, idb = p_['a_id'], p_['b_id']
        # A national file that declares `pairs_are_directed` has a is the ORIGIN and b the
        # DESTINATION, and its median_duration_s is a's departure to b's arrival rather than
        # an average over both ways round. Those keep their direction. A file written before
        # that change is read as undirected, on its canonical key, because reading an
        # undirected row as though it were directed would assert a direction the file never
        # recorded.
        directed = bool(d.get('pairs_are_directed'))
        k = (ida, idb) if directed else ((ida, idb) if ida < idb else (idb, ida))
        e = P[k]
        e['directed'] = e.get('directed', False) or directed
        e['trips'] += p_['trips']
        e['durations'].append(dur)
        e['modes'].update(p_.get('modes') or [])
        if prov: e['operators'].add(prov)
        if lic: e['licences'].add(lic)
        e['feeds'].add(d.get('key'))
        e['stop_pairs'] += 1
        e['countries'].update([p_.get('a_country'), p_.get('b_country')])
        e['sep_km'] = sep
        # kind and settlement must travel with the endpoint. Without them qualified() sees
        # every national node as a settlement and leaves station names bare, which is what
        # produced 90,424 url_collision rejections: "Hauptbahnhof", "Bahnhof" and
        # "Bus Station" repeat in every town that has one.
        e['a'] = {'id': ida, 'name': p_['a_name'], 'country': p_.get('a_country'),
                  'lat': p_['a_lat'], 'lon': p_['a_lon'], 'pop': 0,
                  'kind': p_.get('a_kind', 'settlement'),
                  'settlement': p_.get('a_settlement')}
        e['b'] = {'id': idb, 'name': p_['b_name'], 'country': p_.get('b_country'),
                  'lat': p_['b_lat'], 'lon': p_['b_lon'], 'pop': 0,
                  'kind': p_.get('b_kind', 'settlement'),
                  'settlement': p_.get('b_settlement')}

# ---- emit ------------------------------------------------------------------------------------
MODE_WORD = {'bus': 'bus', 'rail': 'train', 'subway': 'metro', 'tram': 'tram',
             'ferry': 'ferry', 'funicular': 'funicular', 'aerial_lift': 'cable car',
             'cable_tram': 'cable tram', 'trolleybus': 'trolleybus', 'monorail': 'monorail'}

# ---- the locale of a pair -------------------------------------------------------------------
# A pair is emitted in the LANGUAGE OF ITS OWN COUNTRY where that language was measured on the
# pair form, and in English otherwise. This is not a language fan-out: it is one page per pair,
# in one locale, chosen by where the pair is.
#
# Measured 2026-10-07, see ahrefs-expiry/gtfs-pair-local-language-2026-10-07.json and the three
# market admission files. DOMESTIC ONLY: both endpoints must be in the country. A Copenhagen to
# Hamburg page has real Danish demand (tog fra koebenhavn til hamborg 300) but it is also a page
# about a German city, and calling it native-locale for Germany would be false, so cross-border
# pairs stay in English and take their chances with the localisation gate.
#
# Dutch is absent on purpose. It holds the most pairs of any country, 7,509, and its pair demand
# is international while the held feed is domestic.
# ADMISSION CLASS PER LOCALE, corrected 2026-10-07.
#
# I had restricted this table to the four languages whose pair form was measured on Ahrefs, and
# that was a conceptual error. The project's accepted admission model is:
#
#     A  ENTITY_DEMAND_PROVEN
#   OR
#     B  FAMILY_INTENT_PROVEN + ENTITY_UTILITY_PROVEN
#
# The pair FAMILY intent is proven: the 2026-10-07 open-SERP harvest returned 891 of 1,000 rows
# at keyword difficulty 10 or below with a median of 0. That is a FAMILY result and it does not
# need re-proving per language. What each cell still needs is ENTITY UTILITY, and GTFS supplies
# that per pair: a real scheduled duration, a real direct-service count, real modes, named
# routes and a named operator, all read from stop_times rather than estimated.
#
# The mechanical point that makes this work without any keyword tool: a native-language page
# about its OWN country is classified NATIVE_LOCALE by the localisation gate, because
# NATIVE_LANG resolves the country to that language. It needs no per-market keyword cell. And
# the aggregation path these rows travel does not call demand_score() at all, so there is no
# per-market demand gate on it either.
#
# CLASS_A are the four whose pair form was measured directly, so their utility bar is the
# ordinary one. CLASS_B are admitted on family intent plus a STRICTER utility bar, defined
# below, because they carry no fresh per-market measurement.
#
# Only countries that appear in NATIVE_LANG can be here: a Portuguese page about Portugal is
# not NATIVE_LOCALE in this inventory because the Portuguese market is pt-BR and Portugal is
# not its country, so PT is deliberately absent rather than quietly included.
#
# The German caveat is recorded and not hidden: the German DISTANCE and ROUTE phrasing probe
# of 2026-10-07 returned 2 of 500 rows naming two real places against 346 of 500 in English.
# That refuted a GENERIC language fan-out of the air and rail pair families. It is not evidence
# that a German reader planning Hamburg to Hannover is unserved by a page carrying the real
# timetable, which is a different claim and the one the utility gate tests. de-DE is therefore
# CLASS_B with the strict bar, and the refutation stands against the thing it actually refuted.
CLASS_A = {'en', 'da', 'nb', 'fi'}

PAIR_LOCALE = {
    'GB': ('en-GB', 'en', 'to', '{mode} from {a} to {b}'),
    'IE': ('en-GB', 'en', 'to', '{mode} from {a} to {b}'),
    'US': ('en-US', 'en', 'to', '{mode} from {a} to {b}'),
    'AU': ('en-AU', 'en', 'to', '{mode} from {a} to {b}'),
    'DK': ('da-DK', 'da', 'til', 'tog fra {a} til {b}'),
    'NO': ('nb-NO', 'nb', 'til', 'tog fra {a} til {b}'),
    # Finnish takes no preposition and puts the pair before the mode, so its joiner is a space
    # and its measured form is "{a} {b} juna". Both directions carry equal volume (800 and 800),
    # so the page stays unordered like every other pair here.
    'FI': ('fi-FI', 'fi', None, '{a} {b} juna'),
    'DE': ('de-DE', 'de', 'nach', 'zug von {a} nach {b}'),
    'FR': ('fr-FR', 'fr', 'a', 'train de {a} a {b}'),
    'ES': ('es-ES', 'es', 'a', 'tren de {a} a {b}'),
    'IT': ('it-IT', 'it', 'a', 'treno da {a} a {b}'),
    'NL': ('nl-NL', 'nl', 'naar', 'trein van {a} naar {b}'),
    'PL': ('pl-PL', 'pl', 'do', 'pociag z {a} do {b}'),
    'BR': ('pt-BR', 'pt', 'para', 'onibus de {a} para {b}'),
    'MX': ('es-MX', 'es', 'a', 'autobus de {a} a {b}'),
}
# ---- A COUNTRY WHOSE OWN MEASUREMENT REFUSED ITS DOMESTIC PAIRS -------------------------------
# PAIR_LOCALE says what form a country's readers type. It does not say the demand behind that
# form is for the journeys this project holds, and for one country a per-language measurement
# found it is not. The Netherlands: ahrefs-expiry/gtfs-pair-local-language-2026-10-07.json read
# the Dutch pair form at a volume floor of 40 and found the demand is INTERNATIONAL out of the
# Netherlands - trein van amsterdam naar londen 400, amsterdam naar parijs 300, rotterdam naar
# parijs 200 - while the domestic pairs the ovapi feed actually evidences are almost absent from
# the tail. The three Dutch rows that did clear the floor are all CROSS-BORDER: breda to
# antwerpen 100, venlo to dusseldorf 90, arnhem to dusseldorf 90.
#
# The refusal recorded that day was "nl pair level: demand is international, the held feed is
# domestic", and until now it was recorded and not applied: NL stayed in PAIR_LOCALE and 7,028
# Dutch pair pages stood in the manifest against a measurement that refused them. This table
# applies it, and applies it exactly as narrow as the measurement is: the DOMESTIC Dutch pair is
# refused, the cross-border journey out of the Netherlands is kept, because that is the half the
# measurement found demand for. The reason this is country-shaped rather than language-shaped is
# in the measurement too: the Netherlands is small and dense with one national journey planner,
# so a Dutch reader searches the international pair; Denmark and Norway are long and thin with
# regional hubs and their domestic pair demand is real. Pair-axis viability tracks country
# geography, not language.
PAIR_DOMESTIC_REFUSED = {
    'NL': ('ahrefs-expiry/gtfs-pair-local-language-2026-10-07.json: the Dutch pair form was '
           'read at a floor of 40 and its demand is international out of the Netherlands, not '
           'domestic within it, so the pairs the held feed evidences are not the pairs Dutch '
           'readers search. Cross-border journeys out of NL are kept; domestic ones are not.'),
}

# The URL joiner per language. The path segments stay English, as every other family in this
# pipeline does, and only the pair joiner and the language prefix change.
URL_JOINER = {'en': '-to-', 'da': '-til-', 'nb': '-til-', 'fi': '-', 'de': '-nach-',
              'fr': '-a-', 'es': '-a-', 'it': '-a-', 'nl': '-naar-', 'pl': '-do-',
              'pt': '-para-'}

# ---- THE CLASS B UTILITY BAR ------------------------------------------------------------------
# For a locale with no fresh per-market measurement, the brief requires a STRONGER utility gate
# in place of the missing keyword evidence, and says plainly what fails it: "X to Y plus generic
# prose: REJECT". So a Class B pair must carry materially different ROUTE data, not merely be a
# true connection. It needs at least three of these five, all of them facts from the feed:
#
#   named routes            the page can name the services that run it
#   frequent service        30 or more direct trips in the published timetable
#   multi-mode or multi-feed  corroborated by more than one route type or more than one agency
#   a real distance         20 km or more apart, which is an intercity journey rather than two
#                           stops in one conurbation
#   a substantial journey    15 minutes or more of scheduled time
#
# A pair clearing three of five answers a journey-planning question on its own facts. A pair
# clearing fewer would be a template with two place names in it.
CLASS_B_MIN_SIGNALS = 3
CLASS_B_MIN_TRIPS = 30
CLASS_B_MIN_KM = 20.0
CLASS_B_MIN_DURATION_S = 900


def class_b_signals(e, med, sep):
    sig = {}
    sig['names_its_routes'] = bool(e['route_names'])
    sig['frequent_service'] = (e['trips'] or 0) >= CLASS_B_MIN_TRIPS
    sig['corroborated'] = len(e['modes']) > 1 or len(e['feeds']) > 1 or len(e['operators']) > 1
    sig['intercity_distance'] = sep >= CLASS_B_MIN_KM
    sig['substantial_journey'] = med >= CLASS_B_MIN_DURATION_S
    return sig

def qualified(n):
    """A node's reader-facing name and its slug, made unambiguous.

    A station node's own name is NOT unique: "Hauptbahnhof", "Bahnhof", "Bus Station" and
    "Rail Station" repeat in every town that has one. The first run of this builder dropped
    90,424 pairs on url_collision_on_settlement_names for exactly that reason, which is the
    URL scheme failing rather than the data.

    So a station is qualified by the settlement it serves, unless its own name already
    contains that settlement (London Euston needs nothing; Hauptbahnhof needs Koeln). A
    settlement node is already unique by the shared identity module and is left alone.
    """
    name, kind = n['name'], n.get('kind', 'settlement')
    if kind != 'station':
        return name, slugify(name)
    town = (n.get('settlement') or '').strip()
    if not town or slugify(town) in slugify(name):
        return name, slugify(name)
    return f'{name}, {town}', f'{slugify(name)}-{slugify(town)}'


# ---- the semantic-difference gate between the two directions of one corridor ---------------
# A directed pair earns its own page only if it says something its reverse does not. Where a
# feed gives both ways round the same number of services, the same journey time to the minute
# and the same named routes, the two pages differ in word order alone, and that is the
# semantic duplicate the gate exists to refuse. Only the better-evidenced direction survives,
# and the tie is broken on the node id so the choice is stable across runs.
def _facts_key(e):
    med = int(statistics.median(e['durations'])) // 60 if e['durations'] else None
    return (med, e['trips'], tuple(sorted(e.get('route_names') or ())), round(e['sep_km'], 1))


_drop_reverse = set()
for (ka, kb), e in P.items():
    if not e.get('directed') or (ka, kb) in _drop_reverse:
        continue
    rev = P.get((kb, ka))
    if rev is None or not rev.get('directed'):
        continue
    if _facts_key(e) != _facts_key(rev):
        continue
    stats['rejected_direction_is_a_semantic_duplicate_of_its_reverse'] += 1
    _drop_reverse.add((kb, ka) if (e['trips'], ka) >= (rev['trips'], kb) else (ka, kb))

rows, seen = [], set()
for (_ka, _kb), e in sorted(P.items()):
    if (_ka, _kb) in _drop_reverse:
        continue
    a, b = e['a'], e['b']
    if not e.get('directed'):
        # an undirected corridor has no origin, so the canonical direction is alphabetical on
        # the settlement name and one corridor is one page, as it was before direction existed
        if a['name'] > b['name']:
            a, b = b, a
    rows.append((a, b, e))

# the slug function the rest of the pipeline uses
import importlib.util
_spec = importlib.util.spec_from_file_location('ei', ROOT + 'scripts/atlas/scale/entity_identity.py')
_ei = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_ei)
slugify = _ei.slugify

out = []
for a, b, e in rows:
    # The locale of a pair.
    #
    # An UNDIRECTED corridor must be domestic: it has no origin, so a cross-border corridor
    # would have to be given one of its two languages arbitrarily, and that was the reason the
    # old rule refused them.
    #
    # A DIRECTED journey has an origin, so it takes the language of the country it departs
    # from, and its destination may lie anywhere. That is the ordinary reader: someone leaving
    # Paris for Barcelona searches in French, and someone leaving Barcelona for Paris searches
    # in Spanish, and those are two different journeys with two different timetables rather
    # than one page translated. It also recovers 31.0% of the supply, measured on the FlixBus,
    # SNCF and BlaBlaCar feeds, which the domestic-only rule was dropping whole.
    #
    # It is still ONE page per journey in ONE locale. Nothing is fanned out across languages.
    #
    # ONE country is in PAIR_LOCALE and has its DOMESTIC pairs refused, by a measurement that
    # read its own language and found the demand lies elsewhere. See PAIR_DOMESTIC_REFUSED.
    if e.get('directed'):
        loc = PAIR_LOCALE.get(a['country'])
        if loc and a['country'] == b['country'] and a['country'] in PAIR_DOMESTIC_REFUSED:
            stats['rejected_domestic_pair_in_a_country_whose_measured_demand_is_'
                  'international:%s' % a['country']] += 1
            continue
        if loc and a['country'] != b['country']:
            stats['admitted_cross_border_in_the_origin_language:%s' % a['country']] += 1
    else:
        if a['country'] == b['country'] and a['country'] in PAIR_DOMESTIC_REFUSED:
            stats['rejected_domestic_pair_in_a_country_whose_measured_demand_is_'
                  'international:%s' % a['country']] += 1
            continue
        loc = PAIR_LOCALE.get(a['country']) if a['country'] == b['country'] else None
    med = int(statistics.median(e['durations']))
    a_name, a_slug = qualified(a)
    b_name, b_slug = qualified(b)
    if loc:
        market, lang, joiner, query_form = loc
        name = (f"{a_name} {joiner} {b_name}" if joiner else f"{a_name} {b_name}")
    else:
        # cross-border, or a country with no native language in this inventory. It stays
        # English and takes its chances with the localisation gate rather than being given a
        # locale it has no claim to.
        market, lang, joiner, query_form = 'en-US', 'en', 'to', None
        name = f"{a_name} to {b_name}"
    admission = 'A' if lang in CLASS_A else 'B'
    sig = class_b_signals(e, med, e['sep_km'])
    nsig = sum(1 for v in sig.values() if v)
    if admission == 'B' and nsig < CLASS_B_MIN_SIGNALS:
        stats['rejected_class_b_utility_bar:%s' % lang] += 1
        stats['rejected_class_b_utility_bar'] += 1
        continue
    stats['admitted_class_%s:%s' % (admission, lang)] += 1
    joiner_slug = URL_JOINER.get(lang, '-to-')
    url = (f"/{lang}/transport/public-transport/"
           f"{a_slug}{joiner_slug}{b_slug}/")
    if url in seen:
        # two different gazetteer ids whose names slug the same: a real collision, and the
        # honest fix is to drop the second rather than mint a near-identical URL
        stats['rejected_url_collision_on_settlement_names'] += 1
        continue
    seen.add(url)
    fast = min(e['durations'])
    modes = sorted(e['modes'])
    mw = [MODE_WORD.get(m, m) for m in modes]
    facts = [
        f"{med // 60} minutes is the median scheduled journey time",
        f"{fast // 60} minutes on the fastest scheduled service" if fast != med else
        f"{len(e['route_names'])} named routes serve it" if e['route_names'] else
        f"{e['stop_pairs']} stop-to-stop connections make up this corridor",
        f"{e['trips']:,} direct services in the published timetable",
        f"served by {', '.join(mw)}",
        f"{e['sep_km']:.0f} km apart in a straight line",
    ]
    if e['route_names']:
        facts.append('routes ' + ', '.join(sorted(e['route_names'])[:6]))
    if e['operators']:
        facts.append('operated by ' + ', '.join(sorted(e['operators'])[:3]))
    lic = ', '.join(sorted(e['licences'])) or 'open licence stated in the Mobility Database'
    out.append({
        'shape': 'transport_pair_transit',
        'market': market, 'language': lang, 'url': url,
        'entity_id': f"{a['id']}-{b['id']}",
        'entity_name': name,
        # the query form this locale was actually measured on, carried onto the row so intent
        # ownership is a recorded fact rather than an assumption downstream
        # The query form this locale was measured on (Class A) or is admitted under
        # (Class B), with the real place names and the pair's own primary mode substituted,
        # so intent ownership is a recorded fact rather than an assumption downstream.
        'measured_local_query_form': (
            query_form.format(a=a_name.lower(), b=b_name.lower(),
                              mode=(mw[0] if mw else 'transport'))
            if query_form else ''),
        'country': a['country'], 'destination_country': b['country'],
        'city': a['name'], 'cls': 'settlement-settlement',
        'n': len(e['route_names']) or e['stop_pairs'],
        'enriched': len(e['feeds']) + len(modes),
        'distance_km': round(e['sep_km'], 1),
        'median_duration_s': med, 'fastest_duration_s': fast,
        'direct_trips': e['trips'], 'modes': modes,
        'operators': sorted(e['operators'])[:3],
        'gtfs_feeds': sorted(str(x) for x in e['feeds']),
        'licences': sorted(e['licences']),
        'pair_duplicate_risk': 'LOW',
        'direction': 'DIRECTED_ORIGIN_TO_DESTINATION' if e.get('directed') else 'UNDIRECTED_CORRIDOR',
        'admission_class': admission,
        'utility_signals': sorted(k for k, v in sig.items() if v),
        'utility_signal_count': nsig,
        'locale_facts': facts,
        'uniqueness_reason': (
            f"{name} by public transport, from the published timetables of "
            f"{', '.join(sorted(e['operators'])[:3]) or 'the operating agency'} "
            f"({lic}) via the Mobility Database. " + '; '.join(facts) + '. The journey time and '
            f"the service count are READ FROM the published schedule rather than estimated. "
            + ("This page is one DIRECTION of travel: the journey time is from "
               f"{a_name}'s departure to {b_name}'s arrival, and the return journey is a "
               "different timetable with its own page. Where a feed gives both ways round "
               "the same journey time and the same service count, only one direction is "
               "kept. " if e.get('directed') else
               "The source feed records stop pairs without recording which way round the "
               "trip ran, so no direction is claimed and this is one page per corridor, "
               "named alphabetically. ")
            + f"What this page deliberately does NOT claim: fares, real-time running, "
            f"disruptions, or that the timetable has not changed since the feed was "
            f"published."),
    })

OUTP = ROOT + 'data/atlas/sources/transport/_gtfs-pair-candidates.jsonl.gz'
with gzip.open(OUTP, 'wt', encoding='utf-8') as f:
    for r in out:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

stats['final_net'] = len(out)
DATE = '2026-10-08'
json.dump({
    'builder': 'scripts/atlas/scale/gtfs-pair-candidates.py', 'date': DATE,
    'city_feeds_available': len(feeds),
    'national_feeds_available': len(glob.glob(NAT + 'pairs-*.json.gz')), 'funnel': dict(stats), 'final_net': len(out),
    'gate': {'stop_to_city_km': STOP_TO_CITY_KM, 'min_city_population': MIN_CITY_POP,
             'min_city_separation_km': MIN_CITY_SEPARATION_KM,
             'min_direct_trips': MIN_DIRECT_TRIPS,
             'duration_bounds_s': [MIN_DURATION_S, MAX_DURATION_S]},
    'why_the_collapse_is_the_point': (
        'The harvest produced %s directly-served STOP pairs and this builder emits %s '
        'settlement pairs. A stop pair inside one bus network is a real connection and a '
        'worthless page: nobody types it, one small city feed yields 57,181 of them, and '
        'publishing them would be the arbitrary Cartesian product the brief forbids, differing '
        'only in that each row happens to be true. The unit a reader searches is the settlement '
        'pair, which is also the unit rome2rio built 1,850,129 keywords on.'
        % (f"{stats['raw_stop_pairs']:,}", f"{len(out):,}")),
    'what_this_family_adds_over_the_existing_pair_families': (
        'transport.city-pair-air rests on a 2014 OpenFlights snapshot and '
        'transport.city-pair-rail on a Wikidata adjacency graph, so those pages can state only '
        'that two places are connected and how far apart they are. GTFS publishes stop_times, '
        'so these pages state a real scheduled duration and a real direct-service count '
        'attributed to the publishing agency. Fares are still refused: most feeds ship no '
        'fare_attributes and a fare is the one number that changes without notice.'),
}, open(ROOT + f'data/atlas/measurements/gtfs-pair-candidates-{DATE}.json', 'w'),
   indent=1, ensure_ascii=False)

print(f'\nGTFS settlement pairs: RAW stop pairs {stats["raw_stop_pairs"]:,}  '
      f'FINAL NET {len(out):,}')
for k, v in sorted(stats.items()):
    if k.startswith('rejected'): print(f'  rejected {k[9:]:56} {v:>9,}')
print(f'wrote {OUTP}')
