#!/usr/bin/env python3
"""The transport NODE as an entity: what you can reach directly from this station or hub.

This family costs no download. It is derived from the pair files the national harvest
already wrote, read from the other side: instead of asking what a corridor looks like, it
asks what ONE named interchange connects to.

WHY IT IS A DIFFERENT PAGE FROM THE PAIR PAGE. A pair page answers "how do I get from A to
B". A hub page answers "what can I reach from here", which is the question a reader at a
station actually has, and it is the question a departure board answers. The two do not
compete for the same query and neither contains the other: a hub with forty destinations
would need forty pair pages to say what one hub page says, and no pair page lists the
alternatives.

WHY IT IS NOT A DUPLICATE OF places.city-railway_station. That family lists the stations
IN a city, from OSM POI. This one is one station's own reachable set, from a timetable.
Different granularity, different source, different fact.

THE UTILITY GATE IS THE WHOLE DESIGN, because a transport node is exactly the entity type
that produces thin pages at scale. GTFS calls 17,532 Dutch stops and 32,136 Norwegian
stops "stations", and the overwhelming majority are a pair of bus poles outside a village
shop. A page for one of those would be the arbitrary row the brief forbids: true, and
worthless. So a node earns a page only when it is a hub in fact and not in the feed's
vocabulary:

  HUB_MIN_DESTINATIONS   a real list to publish, not one onward connection
  HUB_MIN_TRIPS          a real service level, not a school run
  HUB_MIN_SETTLEMENTS    destinations in several different towns, so the node is a point of
                         interchange for a region rather than for one town's suburbs
  a qualified name       a node called "Bahnhof" or "Bus Station" with no town attached is
                         refused outright: it cannot be titled, it cannot be slugged without
                         colliding with every other town's, and a reader cannot tell which
                         one it is

What the page does NOT claim: fares, real-time running, that the destination list is
exhaustive beyond the feeds read, or that the timetable has not changed since publication.
"""
import json, gzip, glob, os, collections, statistics, sys, importlib.util, re, unicodedata

ROOT = '/home/user/Livdar-eSim/'
NAT = ROOT + 'data/atlas/sources/transport/gtfs-national/'
OUTP = ROOT + 'data/atlas/sources/transport/_gtfs-hub-candidates.jsonl.gz'
DATE = '2026-10-08'

_spec = importlib.util.spec_from_file_location('ei', ROOT + 'scripts/atlas/scale/entity_identity.py')
_ei = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_ei)
slugify = _ei.slugify
NATIVE_LANG = {c: l for _m, c, l in _ei.MARKETS}
MARKET_OF = {c: m for m, c, _l in _ei.MARKETS}

HUB_MIN_DESTINATIONS = 8
HUB_MIN_TRIPS = 200
HUB_MIN_SETTLEMENTS = 5
MERGE_KM = 3.0

# ---------------------------------------------------------------------------------------------
# THE FACILITY TEST, and why "GTFS says station" is not good enough.
#
# The harvester marks a stop as a station when the feed declares location_type 1 OR when eight
# distinct routes meet there. In a dense urban network the second condition is met by a pole on
# a street corner, and the first run of this family proved it: the nodes clearing every hub gate
# included "Boulevard Wilson, Aix-les-Bains", "Boulevard de Russie, Aix-les-Bains" and "College
# Jacques Prevert, Rumilly". A page titled "Direct destinations from Boulevard Wilson" is the
# local stop page the brief forbids outright, and it would not be useful to anyone if Google did
# not exist, which is the test that decides this.
#
# So a node must be a TRANSPORT FACILITY, established two ways, and the two are independent:
#
#   by MODE     a node served by rail or by ferry is a railway station or a ferry terminal.
#               A street pole is not on a railway.
#   by NAME     the node names itself a facility in its own language: Bahnhof, gare, estacion,
#               stazione, dworzec, asema, otogar, rodoviaria, terminal, airport.
#
# And a node whose name is a STREET or a building is refused unless the mode test carries it,
# because "eight bus routes pass this school" is not a hub.
FACILITY_WORDS = (
    'bahnhof', 'hauptbahnhof', 'hbf', 'busbahnhof', 'zob',
    'station', 'railway station', 'train station', 'bus station', 'coach station',
    'central station', 'interchange', 'busstation',
    'gare', 'gare routiere', 'gare sncf',
    'estacion', 'estacio', 'estacao', 'terminal', 'intercambiador', 'autostazione',
    'stazione', 'dworzec', 'asema', 'rautatieasema', 'linja-autoasema', 'matkakeskus',
    'stasjon', 'jernbanestasjon', 'rutebilstasjon', 'skysstasjon',
    'banegard', 'busterminal', 'rutebilstation', 'hovedbanegard',
    'otogar', 'terminali', 'rodoviaria',
    'airport', 'flughafen', 'aeroport', 'aeropuerto', 'aeroporto', 'lotnisko', 'luchthaven',
    'havalimani', 'lufthavn', 'flygplats',
    'ferry terminal', 'ferjekai', 'faergehavn', 'fahrhafen', 'harbour', 'hafen',
    'centraal',
)
# The first version of this list matched by plain substring and included short tokens, and the
# run proved why both were wrong. 'gar', for Turkish gar, matched inside "Trafalgar Square" and
# "Garforth Town End", so a London bus stop and a Leeds suburb were admitted as transport
# facilities. 'port' would have matched Newport and 'kai' matches inside ordinary words. So the
# match is now on WORD BOUNDARIES and the short ambiguous tokens are gone: a Turkish gar is
# reached through 'otogar' and 'terminali' instead.
NOT_A_FACILITY = (
    'boulevard', 'avenue', 'rue', 'place', 'chemin', 'route', 'allee', 'impasse', 'cours',
    'quai', 'strasse', 'strase', 'weg', 'platz', 'gasse', 'ring',
    'street', 'road', 'lane', 'drive', 'crescent', 'square', 'parade', 'gardens',
    'college', 'lycee', 'ecole', 'school', 'universite', 'university', 'campus', 'gymnasium',
    'hopital', 'hospital', 'krankenhaus', 'clinique', 'mairie', 'rathaus', 'town hall',
    'eglise', 'kirche', 'church', 'cimetiere', 'cemetery', 'stade', 'stadium', 'piscine',
    'parking', 'park and ride', 'supermarket', 'centre commercial', 'shopping', 'mall',
    'post office', 'poste', 'bibliotheque', 'library', 'museum', 'musee', 'theatre',
)

# Destinations spread across settlements, not concentrated in one conurbation.
#
# A flat minimum on destination count cannot tell a regional coach hub from a city bus stop,
# and the first run showed exactly that failure: Munich central bus station reached 571
# destinations in 373 different settlements, and Trafalgar Square reached 660 destinations in
# 81. Both cleared a floor of eight settlements. The difference is the SPREAD: Munich serves
# 0.65 settlements per destination because it is an interchange for a region, and Trafalgar
# Square serves 0.12 because its destinations are other stops in London. A page about a London
# bus stop with 660 London destinations is the local stop page the brief forbids, however large
# its numbers look.
HUB_MIN_SPREAD = 0.25


def _fold(t):
    t = unicodedata.normalize('NFKD', (t or '').lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return t.replace('ss', 's')


_FAC_RE = re.compile(r'(?<![a-z0-9])(' + '|'.join(re.escape(_fold(w)) for w in
                     sorted(FACILITY_WORDS, key=len, reverse=True)) + r')(?![a-z0-9])')
_NOT_RE = re.compile(r'(?<![a-z0-9])(' + '|'.join(re.escape(_fold(w)) for w in
                     sorted(NOT_A_FACILITY, key=len, reverse=True)) + r')(?![a-z0-9])')


# English facility words, used to catch a node named in English on a non-English page.
_EN_FACILITY_RE = re.compile(
    r'(?<![a-z0-9])(central bus station|central train station|central station|bus station'
    r'|train station|railway station|coach station|bus terminal|airport)(?![a-z0-9])')


def is_facility(name, modes):
    """A real transport facility, by mode or by its own name. See the block above."""
    if 'rail' in modes or 'ferry' in modes:
        return True, 'mode'
    low = _fold(name)
    if _FAC_RE.search(low) and not _NOT_RE.search(low):
        return True, 'name'
    if _FAC_RE.search(low):
        return False, 'facility_word_but_also_a_street_or_building'
    if _NOT_RE.search(low):
        return False, 'street_or_building'
    return False, 'no_facility_evidence'


def km(a, b, c, d):
    import math
    p = math.pi / 180
    return 6371.0 * math.acos(min(1.0, math.sin(a * p) * math.sin(c * p) +
                                  math.cos(a * p) * math.cos(c * p) * math.cos((d - b) * p)))

# A node whose name is only one of these, with no town attached, cannot be titled or slugged.
GENERIC_ALONE = {
    'bahnhof', 'hauptbahnhof', 'hbf', 'bus station', 'busstation', 'busbahnhof', 'zob',
    'station', 'railway station', 'train station', 'gare', 'gare routiere', 'gare sncf',
    'estacion', 'estacion de autobuses', 'estacao', 'stazione', 'autostazione',
    'centraal station', 'busstationen', 'jernbanestasjon', 'rautatieasema', 'linja-autoasema',
    'dworzec', 'dworzec glowny', 'dworzec autobusowy', 'pkp', 'pks', 'terminal',
    'bus terminal', 'coach station', 'interchange', 'bus interchange', 'transit centre',
    'transit center', 'otogar', 'terminal de autobuses', 'rodoviaria', 'centrum',
}

# The MEASURED query form, from ahrefs-expiry/transport-hub-intent-2026-10-08.json.
#
# The first draft of this family titled its pages "Direct destinations from X". The
# measurement says that is not what anyone types. On the same stations:
#
#   manchester piccadilly departures   3,500      trains from manchester piccadilly   350
#   york station departures            1,600      trains from york station             60
#   leeds station departures           1,300      trains from leeds station            30
#   victoria coach station timetable      90
#
# So the form is DEPARTURES, and the word used is the one on the departure board in that
# language, not a translation of an English marketing phrase.
HUB_TITLE = {
    'en': '{n} departures', 'de': '{n} Abfahrt', 'fr': 'Departs {n}',
    'es': 'Salidas {n}', 'it': 'Partenze {n}', 'nl': 'Vertrek {n}',
    'pl': 'Odjazdy {n}', 'pt': 'Partidas {n}', 'da': 'Afgange {n}',
    'nb': 'Avganger {n}', 'fi': '{n} lahtevat', 'tr': '{n} kalkis saatleri',
    'ja': '{n} 出発', 'zh-Hant': '{n} 出發時刻',
}
HUB_SEG = {'en': 'departures', 'de': 'abfahrt', 'fr': 'departs', 'es': 'salidas',
           'it': 'partenze', 'nl': 'vertrek', 'pl': 'odjazdy', 'pt': 'partidas',
           'da': 'afgange', 'nb': 'avganger', 'fi': 'lahtevat', 'tr': 'kalkis',
           'ja': 'departures', 'zh-Hant': 'departures'}
MEASURED_FORM = {'en': '{n} departures'.lower(), 'de': '{n} abfahrt'}
MODE_WORD = {'bus': 'bus', 'rail': 'train', 'subway': 'metro', 'tram': 'tram',
             'ferry': 'ferry', 'funicular': 'funicular', 'aerial_lift': 'cable car',
             'cable_tram': 'cable tram', 'trolleybus': 'trolleybus', 'monorail': 'monorail'}

stats = collections.Counter()
N = collections.defaultdict(lambda: {
    'name': None, 'kind': None, 'country': None, 'settlement': None, 'lat': None, 'lon': None,
    'dests': {}, 'modes': set(), 'operators': set(), 'licences': set(), 'feeds': set(),
    'trips': 0})

files = sorted(glob.glob(NAT + 'pairs-*.json.gz'))
print(f'reading {len(files)} national pair files', file=sys.stderr)
for f in files:
    try:
        d = json.load(gzip.open(f, 'rt', encoding='utf-8'))
    except Exception:
        stats['feed_unreadable'] += 1
        continue
    prov, lic = d.get('provider') or '', d.get('licence') or ''
    directed = bool(d.get('pairs_are_directed'))
    for p in d.get('pairs') or []:
        stats['raw_pair_rows'] += 1
        # An undirected file states no direction, so each endpoint is treated as reachable
        # from the other: that is what the corridor means. A directed file is read as it is
        # written, origin to destination, because that is what its trips recorded.
        ends = [('a', 'b')] if directed else [('a', 'b'), ('b', 'a')]
        for src, dst in ends:
            nid = p[f'{src}_id']
            n = N[nid]
            n['name'] = n['name'] or p[f'{src}_name']
            n['kind'] = n['kind'] or p.get(f'{src}_kind', 'settlement')
            n['country'] = n['country'] or p.get(f'{src}_country')
            n['settlement'] = n['settlement'] or p.get(f'{src}_settlement')
            n['lat'] = n['lat'] if n['lat'] is not None else p.get(f'{src}_lat')
            n['lon'] = n['lon'] if n['lon'] is not None else p.get(f'{src}_lon')
            n['trips'] += p.get('trips') or 0
            n['modes'].update(p.get('modes') or [])
            if prov: n['operators'].add(prov)
            if lic: n['licences'].add(lic)
            n['feeds'].add(d.get('key'))
            dk = p[f'{dst}_id']
            cur = n['dests'].get(dk)
            dur = p.get('median_duration_s')
            if cur is None or (dur is not None and (cur['dur'] is None or dur < cur['dur'])):
                n['dests'][dk] = {
                    'name': p[f'{dst}_name'], 'country': p.get(f'{dst}_country'),
                    'settlement_id': p.get(f'{dst}_settlement_id'),
                    'dur': dur, 'trips': p.get('trips') or 0}
            elif cur is not None:
                cur['trips'] += p.get('trips') or 0

print(f'{len(N):,} distinct transport node IDS seen', file=sys.stderr)

# ---- merge one physical node that arrives under several feed ids -----------------------------
# 8,703 qualified names mapped to more than one node id on the first run, and 8,686 of those
# had all their ids within 3 km of each other: they are ONE place. Most are the two sides of a
# street, published as `...:14070` and `...:14071`, and a few are one interchange listed by two
# regional feeds. Dropping the second id, which is what the url-collision check did, threw away
# half of that node's destinations and reported it as a collision. Merging is the correct
# behaviour and it makes the surviving page better, because the two sides of a stop share one
# reachable set. Only 17 names collided across a distance greater than 3 km, and those are
# genuinely different places, so they still have to be refused rather than merged.
_groups = collections.defaultdict(list)
for nid, n in N.items():
    nm, tw = (n['name'] or '').strip(), (n['settlement'] or '').strip()
    disp = f'{nm}, {tw}' if tw and slugify(tw) not in slugify(nm) else nm
    _groups[(n['country'], slugify(disp))].append(nid)

M, merged_ids = {}, 0
for gk, ids in _groups.items():
    if len(ids) == 1:
        M[ids[0]] = N[ids[0]]
        continue
    base = N[ids[0]]
    kept = [ids[0]]
    for nid in ids[1:]:
        o = N[nid]
        if (base['lat'] is None or o['lat'] is None
                or km(base['lat'], base['lon'], o['lat'], o['lon']) > MERGE_KM):
            # same name, different place: refuse both rather than merge or pick one
            stats['rejected_same_name_more_than_%dkm_apart_genuinely_different_places' % int(MERGE_KM)] += 1
            continue
        base['trips'] += o['trips']
        base['modes'] |= o['modes']
        base['operators'] |= o['operators']
        base['licences'] |= o['licences']
        base['feeds'] |= o['feeds']
        for dk, dv in o['dests'].items():
            cur = base['dests'].get(dk)
            if cur is None:
                base['dests'][dk] = dv
            else:
                cur['trips'] += dv['trips']
                if dv['dur'] is not None and (cur['dur'] is None or dv['dur'] < cur['dur']):
                    cur['dur'] = dv['dur']
        kept.append(nid)
        merged_ids += 1
    base['merged_from'] = kept
    M[ids[0]] = base
stats['node_ids_merged_into_another'] = merged_ids
print(f'{len(M):,} distinct PHYSICAL nodes after merging {merged_ids:,} duplicate ids',
      file=sys.stderr)

out, seen = [], set()
for nid, n in sorted(M.items()):
    stats['nodes_considered'] += 1
    # Only a named interchange is a candidate. A settlement node is already a city page and
    # a hub page about a whole town would say what the city page says.
    if n['kind'] != 'station':
        stats['rejected_node_is_a_settlement_not_an_interchange'] += 1
        continue
    name = (n['name'] or '').strip()
    if not name:
        stats['rejected_node_has_no_name'] += 1
        continue
    town = (n['settlement'] or '').strip()
    low = name.lower().strip(' .,-')
    if low in GENERIC_ALONE and not town:
        stats['rejected_name_is_generic_with_no_town_attached'] += 1
        continue
    lang = NATIVE_LANG.get(n['country'])
    if not lang:
        stats['rejected_country_has_no_native_market_language'] += 1
        continue
    ok, why = is_facility(name, n['modes'])
    if not ok:
        stats['rejected_not_a_transport_facility:%s' % why] += 1
        stats['rejected_not_a_transport_facility'] += 1
        continue
    n['facility_evidence'] = why
    # ---- RAIL ONLY, and this is the measurement overruling the supply ----------------------
    # The first build was mostly bus and coach terminals, and the biggest nodes it produced
    # were Munich and Berlin central bus stations. The intent measurement of 2026-10-08 says
    # those pages have no readers. On the departures form, in en-GB:
    #
    #   rail      kings cross 9,400   birmingham new street 3,600   manchester piccadilly 3,500
    #             edinburgh waverley 2,900   york 1,600   leeds 1,300     median about 1,600
    #   bus       buchanan 150   heathrow central 150   birmingham coach 70
    #             liverpool one 10   huddersfield 0                        median about 110
    #
    # and in de-DE every Hauptbahnhof carries 60 to 700 while zob berlin and hamburg zob carry
    # 30. People check a train departure board. They do not check a coach station departure
    # board. So a coach interchange is refused here however many destinations it serves, which
    # costs this family its largest nodes and is the right call.
    #
    # Victoria Coach Station is the one measured exception at 1,000, and at keyword difficulty
    # 24 against 0 to 8 for every rail station measured, so it is not grounds for a rule.
    if 'rail' not in n['modes']:
        stats['rejected_not_a_rail_station_the_departures_intent_is_rail_only'] += 1
        continue
    # ---- the name must be in the page's own language ---------------------------------------
    # The FlixBus feed publishes its German stops in ENGLISH: "Munich central bus station",
    # "Frankfurt central train station". A de-DE page carrying an English station name is the
    # LOCAL_DATA_MISSING class and not a valid localisation. The rail-only rule removes most
    # of them, since those nodes are coach terminals, but not all, so the check is explicit.
    if lang != 'en' and _EN_FACILITY_RE.search(_fold(name)):
        stats['rejected_name_is_english_on_a_non_english_page'] += 1
        continue
    if len(n['dests']) < HUB_MIN_DESTINATIONS:
        stats['rejected_fewer_than_%d_direct_destinations' % HUB_MIN_DESTINATIONS] += 1
        continue
    if n['trips'] < HUB_MIN_TRIPS:
        stats['rejected_fewer_than_%d_direct_services' % HUB_MIN_TRIPS] += 1
        continue
    setts = {d['settlement_id'] or d['name'] for d in n['dests'].values()}
    if len(setts) < HUB_MIN_SETTLEMENTS:
        stats['rejected_destinations_in_fewer_than_%d_settlements' % HUB_MIN_SETTLEMENTS] += 1
        continue
    spread = len(setts) / len(n['dests'])
    if spread < HUB_MIN_SPREAD:
        stats['rejected_destinations_concentrated_in_one_conurbation'] += 1
        continue

    disp = f'{name}, {town}' if town and slugify(town) not in slugify(name) else name
    slug = slugify(disp)
    url = f"/{lang}/transport/{HUB_SEG.get(lang, 'from')}/{slug}/"
    if url in seen:
        stats['rejected_url_collision_on_node_names'] += 1
        continue
    seen.add(url)

    ds = sorted(n['dests'].values(), key=lambda d: (-(d['trips'] or 0), d['name']))
    named = [d['name'] for d in ds[:10]]
    durs = [d['dur'] for d in ds if d['dur']]
    modes = sorted(n['modes'])
    mw = [MODE_WORD.get(m, m) for m in modes]
    abroad = sorted({d['country'] for d in ds if d['country'] and d['country'] != n['country']})
    facts = [
        f"{len(n['dests'])} destinations are served directly, in {len(setts)} different settlements",
        f"{n['trips']:,} direct departures in the published timetable",
        f"served by {', '.join(mw)}" if mw else '',
        f"the most frequent direct destinations are {', '.join(named[:6])}",
    ]
    if durs:
        facts.append(f"{int(statistics.median(durs)) // 60} minutes is the median direct "
                     f"journey time, {min(durs) // 60} minutes to the nearest")
    if abroad:
        facts.append('direct services cross into ' + ', '.join(abroad))
    facts = [f for f in facts if f]
    lic = ', '.join(sorted(n['licences'])) or 'open licence stated in the feed registry'
    out.append({
        'shape': 'transport_hub_node',
        'market': MARKET_OF.get(n['country']), 'language': lang, 'url': url,
        'entity_id': nid, 'entity_name': disp,
        'title_form': HUB_TITLE.get(lang, HUB_TITLE['en']).format(n=disp),
        'measured_local_query_form': (
            MEASURED_FORM[lang].format(n=disp.lower()) if lang in MEASURED_FORM else
            HUB_TITLE.get(lang, HUB_TITLE['en']).format(n=disp).lower()),
        'family_intent_evidence': (
            'MEASURED in this language' if lang in MEASURED_FORM else
            'family intent proven on the departures form in en-GB and de-DE, '
            'ahrefs-expiry/transport-hub-intent-2026-10-08.json; entity utility proven per '
            'node from the published timetable'),
        'country': n['country'], 'city': town or name, 'cls': 'transport-interchange',
        'n': len(n['dests']), 'enriched': len(n['feeds']) + len(modes),
        'direct_destinations': len(n['dests']), 'destination_settlements': len(setts),
        'settlement_spread': round(spread, 3),
        'direct_trips': n['trips'], 'modes': modes,
        'destinations': [{'name': d['name'], 'country': d['country'],
                          'median_duration_s': d['dur'], 'direct_trips': d['trips']}
                         for d in ds[:40]],
        'operators': sorted(n['operators'])[:3], 'gtfs_feeds': sorted(str(x) for x in n['feeds']),
        'licences': sorted(n['licences']),
        'admission_class': 'B',
        'facility_evidence': n.get('facility_evidence'),
        'merged_feed_node_ids': n.get('merged_from') or [nid],
        'lat': n['lat'], 'lon': n['lon'],
        'locale_facts': facts,
        'uniqueness_reason': (
            f"What you can reach directly from {disp}, read from the published timetables of "
            f"{', '.join(sorted(n['operators'])[:3]) or 'the operating agency'} ({lic}). "
            + '; '.join(facts) + '. The destination list and every journey time are READ FROM '
            'the schedule rather than estimated. This page answers what a reader standing at '
            'this interchange asks, which no single origin-to-destination page answers: it '
            'lists the alternatives. What it deliberately does NOT claim: fares, real-time '
            'running, disruptions, that the list is exhaustive beyond the feeds read, or that '
            'the timetable has not changed since the feed was published.'),
    })

os.makedirs(os.path.dirname(OUTP), exist_ok=True)
with gzip.open(OUTP, 'wt', encoding='utf-8') as fh:
    for r in out:
        fh.write(json.dumps(r, ensure_ascii=False) + '\n')

by_lang = collections.Counter(r['language'] for r in out)
json.dump({
    'measurement': 'The transport node as an entity: direct destinations from one interchange',
    'date': DATE,
    'source': 'derived from the national GTFS pair files, no additional download',
    'gates': {'HUB_MIN_DESTINATIONS': HUB_MIN_DESTINATIONS, 'HUB_MIN_TRIPS': HUB_MIN_TRIPS,
              'HUB_MIN_SETTLEMENTS': HUB_MIN_SETTLEMENTS,
              'generic_name_with_no_town': 'refused',
              'facility_test': 'a node must be a rail station, ferry terminal, airport, coach '
                               'station or bus station, established by MODE (served by rail or '
                               'ferry) or by NAME (it calls itself a facility in its own '
                               'language). A street, a school, a hospital or a shopping centre '
                               'with eight bus routes passing it is refused.',
              'physical_node_merge_km': MERGE_KM,
              'HUB_MIN_SPREAD': HUB_MIN_SPREAD,
              'rail_only': 'a bus or coach interchange is refused: the departures intent is '
                           'rail. Measured 2026-10-08, en-GB rail median about 1,600 against '
                           'a bus median of about 110, and de-DE Hauptbahnhof 60 to 700 '
                           'against ZOB 30.',
              'name_must_be_in_the_page_language': 'the FlixBus feed publishes German stops '
                                                   'in English, and an English station name '
                                                   'on a de-DE page is LOCAL_DATA_MISSING'},
    'family_intent': (
        'PROVEN on the departures form, ahrefs-expiry/transport-hub-intent-2026-10-08.json. '
        '15 of 15 en-GB rail-station departure keywords carry volume, 13 of 15 at or above '
        '250, median about 1,600, all at keyword difficulty 0 to 8. de-DE is broad at about a '
        'tenth of that, 60 to 700 per Hauptbahnhof at difficulty 0 to 10. The competing '
        '"trains from X" form measures an order of magnitude lower on the same stations and '
        'is NOT used.'),
    'why_the_gate_is_strict': (
        'GTFS calls 17,532 Dutch stops and 32,136 Norwegian stops stations, and most of them '
        'are a pair of bus poles outside a village shop. Without the hub gates this family '
        'would be tens of thousands of true, worthless pages, which is the arbitrary row the '
        'brief forbids.'),
    'nodes_considered': stats['nodes_considered'],
    'funnel': dict(stats), 'final_net': len(out),
    'by_language': dict(by_lang.most_common()),
    'what_this_adds_over_places_city_railway_station': (
        'places.city-railway_station lists the stations IN a city from OSM POI. This lists one '
        'station own reachable set from a timetable. Different granularity, different source, '
        'different fact, different query.'),
    'production_untouched': True,
}, open(ROOT + f'data/atlas/measurements/gtfs-hub-candidates-{DATE}.json', 'w'),
   indent=1, ensure_ascii=False)

print(f'\nTRANSPORT HUBS: nodes considered {stats["nodes_considered"]:,}  FINAL NET {len(out):,}')
for k, v in sorted(stats.items()):
    if k.startswith('rejected'): print(f'  rejected {k[9:]:58} {v:>9,}')
print('by language:', dict(by_lang.most_common(12)))
print(f'wrote {OUTP}')
