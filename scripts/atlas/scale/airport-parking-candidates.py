#!/usr/bin/env python3
"""Airport x parking: one page per airport that has named car parks recorded in OSM.

The 2026-10-07 open-SERP measurement found that parking is NOT a city x category family in any
of the ten languages tested. It is an ENTITY x PARKING family, and the entity with both the
strongest demand and the best supply is the airport: "airport parking" 29,000 at keyword
difficulty 0 with a 1.30 USD cost per click, Atlanta 20,000, Logan 12,000, San Diego 10,000 at
1.60, Pittsburgh 9,900 at difficulty 0, Tampa 9,000 at difficulty 0, Philadelphia 9,600 at 1.90.
275 of 300 returned rows named an airport, and the IATA code form is common enough to matter
(parking at dca, msp, bwi, rdu, dtw, bna), which is exactly the identifier the register holds.

WHAT THIS PAGE CAN HONESTLY SAY, and nothing more. OSM gives a named car park with a position.
The POI extractor did NOT keep the capacity, fee or parking tags, so this page states how many
named car parks the airport has, what they are called, and how far each sits from the terminal
reference point, every figure computed from coordinates in the source. It states in words that
it carries no price, no live availability and no booking, because the brief forbids inventing
them and a wrong number on a commercial query is worse than no page.

THE GATE. An airport earns a page only when it carries scheduled service, has an IATA code, and
has at least two distinct named car parks within walking and shuttle range. One car park is not
a comparison and a page that lists one name is thin. An airport with no named car park in OSM
gets nothing, which is most of the 86,215 rows in the register and all of the heliports.

Usage: airport-parking-candidates.py
"""
import csv, glob, gzip, json, math, os, re, sys, collections

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/transport/_airport-parking-candidates.jsonl.gz'
MEAS = ROOT + 'data/atlas/measurements/airport-parking-2026-10-07.json'

# The register is 86,215 rows and most are not airports a traveller parks at. Only these types
# can carry a page at all, and the scheduled-service and IATA tests below narrow it further.
TYPE_OK = {'large_airport', 'medium_airport'}
MAX_KM = 6.0          # the search radius only; see ON_SITE_KM for the gate that decides
# ---------------------------------------------------------------------------------------------
# CORRECTION, 2026-10-07. The first version of this builder accepted any named car park within
# MAX_KM and called the result "airport parking". Reading the output refuted it: Antwerp came
# back with "KBC bank", "Huisarten wachtpost", "Casa", "Agfa-Gevaert" and
# "B-Parking Antwerpen-Centraal" at 3.76 km, which is the car park of Antwerp CENTRAL STATION.
# A six kilometre circle around a city airport contains the city, so the radius was not
# measuring association with the airport at all; it was listing the neighbourhood. Presenting a
# bank's staff car park as an Antwerp Airport car park is a fabricated relationship, which the
# brief forbids in the same breath as fabricated prices.
#
# A lot now qualifies on EVIDENCE OF ASSOCIATION, by one of two tests:
#   ON SITE     within ON_SITE_KM of the airport reference point. An airport's own car parks sit
#               against its terminals, and 1.5 km is inside the fence for all but the largest
#               fields.
#   NAMED FOR IT  the lot's own name carries an airport word or the IATA code as a word. This is
#               the stronger of the two and it reaches the off-airport long-stay operators, which
#               are genuinely airport parking and sit well beyond any sensible radius.
# Distance alone, between ON_SITE_KM and MAX_KM, is NOT association and no longer qualifies.
ON_SITE_KM = 1.5
MIN_LOTS = 2          # one named lot is not a comparison and the page would be thin

# "airport" in the languages the corpus covers, plus the common compounds. Matched on the
# lowercased name; a substring is right here because German and Dutch compound the word
# (Flughafenparkplatz, luchthavenparking) and a token match would miss them.
AIRPORT_WORDS = (
    'airport', 'aeroport', 'aéroport', 'flughafen', 'aeropuerto', 'aeroporto', 'lotnisko',
    'luchthaven', 'havalimani', 'havalimanı', 'havaalani', 'havaalanı', 'flygplats',
    'lufthavn', 'lennuasema', 'lidosta', 'letisko', 'letiště', 'repülőtér', 'aerodrom',
    '空港', '機場', '공항', 'terminal 1', 'terminal 2', 'terminal 3',
)


def names_the_airport(lot_name, iata, airport_name):
    """True when the car park's own name says it belongs to an airport.

    The IATA code is matched as a WORD and not as a substring: 'anr' inside 'Anrath' is not a
    reference to Antwerp, and three letters loose in a long name collide constantly.
    """
    n = (lot_name or '').lower()
    if any(w in n for w in AIRPORT_WORDS):
        return True
    if iata and re.search(r'(?<![a-z])' + re.escape(iata.lower()) + r'(?![a-z])', n):
        return True
    return False
MARKET, LANG = 'en-US', 'en'

def km(a, b, c, d):
    R = 6371.0088
    p1, p2 = math.radians(a), math.radians(c)
    dp, dl = p2 - p1, math.radians(d - b)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

stats = collections.Counter()

# ---------------------------------------------------------------- airports
airports = []
for r in csv.DictReader(open(ROOT + 'data/atlas/sources/transport/ourairports-airports.csv')):
    stats['register_rows'] += 1
    if r['type'] not in TYPE_OK:
        stats['rejected_type_not_an_airport_people_park_at'] += 1
        continue
    if (r.get('scheduled_service') or '') != 'yes':
        stats['rejected_no_scheduled_service'] += 1
        continue
    iata = (r.get('iata_code') or '').strip()
    if len(iata) != 3:
        stats['rejected_no_iata_code'] += 1
        continue
    try:
        lat, lon = float(r['latitude_deg']), float(r['longitude_deg'])
    except (TypeError, ValueError):
        stats['rejected_no_coordinates'] += 1
        continue
    airports.append({'ident': r['ident'], 'iata': iata, 'name': r['name'].strip(),
                     'country': r['iso_country'], 'region': r.get('iso_region', ''),
                     'municipality': (r.get('municipality') or '').strip(),
                     'lat': lat, 'lon': lon, 'type': r['type'],
                     'wikipedia': (r.get('wikipedia_link') or '').strip()})
stats['airports_eligible_for_a_lookup'] = len(airports)
print('airports eligible for a car park lookup: %d' % len(airports), file=sys.stderr)

# ---------------------------------------------------------------- parking POI
# Bucket by a coarse grid so the join is not 2,000 x 32,655.
CELL = 0.1
grid = collections.defaultdict(list)
nlots = 0
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')):
    with gzip.open(f, 'rt', encoding='utf-8') as fh:
        for line in fh:
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get('cls') != 'parking':
                continue
            nm = (d.get('name') or '').strip()
            if not nm:
                continue                       # an unnamed lot cannot be named on a page
            try:
                la, lo = float(d['lat']), float(d['lon'])
            except (TypeError, KeyError, ValueError):
                continue
            grid[(int(la / CELL), int(lo / CELL))].append((la, lo, nm, d.get('id', ''),
                                                           d.get('country', '')))
            nlots += 1
stats['named_parking_poi_indexed'] = nlots
print('named parking POI indexed: %d' % nlots, file=sys.stderr)

# ---------------------------------------------------------------- the join
out = []
lot_hist = collections.Counter()
for a in airports:
    gi, gj = int(a['lat'] / CELL), int(a['lon'] / CELL)
    near = []
    span = int(MAX_KM / 111.0 / CELL) + 1
    for i in range(gi - span, gi + span + 1):
        for j in range(gj - span, gj + span + 1):
            for la, lo, nm, pid, pc in grid.get((i, j), ()):
                d = km(a['lat'], a['lon'], la, lo)
                if d <= MAX_KM:
                    near.append((round(d, 2), nm, pid))
    # one physical car park is often mapped as several OSM objects sharing a name; a page that
    # lists the same name three times is not a longer page, so collapse on the name
    seen, lots = set(), []
    for d, nm, pid in sorted(near):
        k = nm.lower()
        if k in seen:
            continue
        on_site = d <= ON_SITE_KM
        named = names_the_airport(nm, a.get('iata'), a.get('name'))
        if not (on_site or named):
            stats['rejected_lot_no_evidence_of_association'] += 1
            continue
        seen.add(k)
        lots.append({'name': nm, 'km_from_terminal_reference': d, 'osm_id': pid,
                     'association': 'ON_SITE' if on_site else 'NAMED_FOR_THE_AIRPORT'})
    lot_hist[min(len(lots), 10)] += 1
    if len(lots) < MIN_LOTS:
        stats['rejected_fewer_than_%d_named_car_parks' % MIN_LOTS] += 1
        continue
    facts = [
        '%d named car parks evidenced as this airport\'s: %d on site within %.1f km, '
        '%d named for the airport' % (
            len(lots), sum(1 for l in lots if l['association'] == 'ON_SITE'), ON_SITE_KM,
            sum(1 for l in lots if l['association'] == 'NAMED_FOR_THE_AIRPORT')),
        'nearest named car park %s at %.2f km' % (lots[0]['name'], lots[0]['km_from_terminal_reference']),
        'furthest of these %s at %.2f km' % (lots[-1]['name'], lots[-1]['km_from_terminal_reference']),
    ]
    if a['municipality']:
        facts.append('serving %s' % a['municipality'])
    out.append({
        'shape': 'airport_parking',
        'market': MARKET, 'language': LANG,
        'url': '/en/transport/airport-parking/%s/' % a['iata'].lower(),
        'entity_id': 'apark-%s' % a['ident'],
        'entity_name': '%s (%s)' % (a['name'], a['iata']),
        'country': a['country'],
        'city': a['municipality'],
        'cls': 'airport_parking',
        'n': len(lots),
        'enriched': sum(1 for l in lots if l['osm_id']),
        'iata': a['iata'], 'icao_ident': a['ident'], 'airport_type': a['type'],
        'lat': a['lat'], 'lon': a['lon'],
        'wikipedia': a['wikipedia'],
        'lots': lots[:40],
        'locale_facts': facts,
        'uniqueness_reason': (
            'Car parking at %s (%s): %d distinct named car parks recorded in OpenStreetMap '
            'within %.0f km of the airport reference point, each with its own name and its own '
            'measured distance (%s). What this page deliberately does NOT claim: prices, live '
            'availability, booking, or the number of spaces, none of which the source carries.'
            % (a['name'], a['iata'], len(lots), MAX_KM,
               ', '.join('%s %.2f km' % (l['name'], l['km_from_terminal_reference'])
                         for l in lots[:4]))),
    })

stats['FINAL_airport_parking_candidates'] = len(out)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
    for r in out:
        fh.write(json.dumps(r, ensure_ascii=False) + '\n')

print('\nFUNNEL')
print('  RAW register rows                  %7d' % stats['register_rows'])
for k in sorted(k for k in stats if k.startswith('rejected_')):
    print('  REJECTED %-32s %7d' % (k[9:], stats[k]))
print('  FINAL NET                          %7d' % len(out))
print('\nnamed car parks per eligible airport (10 = ten or more):')
for k in sorted(lot_hist):
    print('   %2d lots  %5d airports' % (k, lot_hist[k]))
json.dump({'captured': '2026-10-07', 'source': 'OurAirports register (public domain) joined to '
           'OpenStreetMap named amenity=parking (ODbL 1.0, attribution required)',
           'gate': {'types_allowed': sorted(TYPE_OK), 'scheduled_service_required': True,
                    'iata_required': True, 'search_radius_km': MAX_KM,
                    'association_gate': ('a lot qualifies only ON_SITE within %.1f km or '
                                         'NAMED_FOR_THE_AIRPORT; distance alone beyond %.1f km '
                                         'is not association' % (ON_SITE_KM, ON_SITE_KM)),
                    'on_site_km': ON_SITE_KM,
                    'min_named_car_parks': MIN_LOTS,
                    'duplicate_names_collapsed': 'one physical car park is often several OSM '
                    'objects sharing a name, so names are collapsed before counting'},
           'what_is_deliberately_absent': ['price', 'live availability', 'booking',
                                           'space counts', 'opening hours'],
           'why': 'the POI extractor did not retain the OSM capacity, fee or parking tags, so '
                  'any space count or price on this page would be invented',
           'funnel': dict(stats), 'lots_per_airport_histogram': dict(lot_hist)},
          open(MEAS, 'w'), indent=1, ensure_ascii=False)
print('\nwritten %s' % OUT)
print('measurement %s' % MEAS)
