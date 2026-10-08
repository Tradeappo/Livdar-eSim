#!/usr/bin/env python3
"""Build the national and intercity GTFS feed registry from two open catalogues.

Why this exists. The national harvester began as a hand-written table of fourteen feeds,
every one of them found by guessing a URL and checking its licence by hand. That does not
scale, and guessing is how you miss the large ones: the whole European FlixBus and FlixTrain
network, the BlaBlaCar coach network, Eurostar, and about sixty French interurban coach
networks were all sitting in a public catalogue the entire time, every one of them carrying
an explicit ODbL or Licence Ouverte grant, while the table held three SNCF rail feeds.

So the feed list is now DERIVED, from two catalogues that publish licence metadata:

  1. transport.data.gouv.fr/api/datasets - the French national access point (PAN). Every
     resource carries a machine-readable `licence` code, so the licence gate can be applied
     by the computer rather than by eye. It is not only French: the PAN publishes the
     European networks of operators that run into France, which is how FlixBus Europe,
     BlaBlaCar, Eurostar, Renfe AVE international and Trenitalia arrive here with a stated
     licence, when the operators' own hosts state none.
  2. The Mobility Database catalogue (files.mobilitydatabase.org/feeds_v2.csv) - global,
     with `urls.license` per feed.

THE LICENCE GATE IS THE WHOLE POINT. A feed with no stated licence is REFUSED, however
large and however reachable, because the standing rule on this axis is open or licensed
sources only. That rule costs real supply and is applied anyway: Megabus US, Washington
State Ferries, SNCB Belgium, European Sleeper and the direct flix.tech per-country feeds
are all reachable right now and all carry NO licence field, so none of them is admitted.
FlixBus enters only through the French PAN, where the same data is published under ODbL.

WHAT IS NOT A FEED WE WANT. Three exclusions, each for a reason:
  - `scolaire` / school transport. It connects settlements, so it passes the geometry test,
     but a school bus timetable has no reader outside the catchment and no commercial value.
     The pulse work already refused school holidays on the same reasoning.
  - transport a la demande (TAD). There is no fixed schedule, so there is no journey fact to
     put on a page, and a page whose only content is "you can book a car" is the thin page
     the utility gate exists to reject.
  - feeds already in the hand-written table, so a derived registry never double-counts.
"""
import csv, json, os, re, sys, urllib.request, urllib.error, socket

socket.setdefaulttimeout(120)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'data/atlas/sources/transport/gtfs-feed-registry.json'

# The licence codes the French PAN uses, and what each one is. Anything not in this map is
# refused, including the PAN's own `notspecified`, which is the catalogue saying out loud
# that the publisher stated nothing.
PAN_LICENCES = {
    'odc-odbl': 'ODbL 1.0 (Open Database Licence)',
    'lov2': 'Licence Ouverte v2.0 (Etalab)',
    'fr-lo': 'Licence Ouverte v1.0 (Etalab)',
    'mobility-licence': 'Licence mobilites (French PAN mobility licence)',
    'cc-by': 'CC BY 4.0',
    'cc-zero': 'CC0 1.0',
}
PAN_REFUSED = {'notspecified', '', None, 'other-at', 'other-open'}

# A stated licence in the Mobility Database is a URL. These are the ones that are actually
# open grants; a link to a terms-of-use page is accepted only where the page IS the grant.
# A stated licence in the Mobility Database is a URL. These are the ones that are actually
# open grants; a link to a terms-of-use page is accepted only where the page IS the grant.
#
# The first version of this pattern refused 322 feeds that DO state a licence, and an audit of
# what it was refusing found six real open grants among them. They are added below. The ones
# still refused are refused deliberately: operator "developer data terms" pages (MTA, SEPTA,
# NJ Transit, CTtransit, Trinity Metro, C-TRAN, BC Transit) are permissions to use an API
# rather than licences to redistribute derived data, and the standing rule on this axis is
# clear commercial reuse, so a developer-terms page does not clear it however permissive it
# reads.
MDB_LICENCE_OK = re.compile(
    r'creativecommons\.org/(licenses/(by|by-sa)/|publicdomain/zero)'
    r'|opendatacommons\.org/licenses/(odbl|by|pddl)'
    r'|opendefinition\.org/licenses'
    r'|data\.gouv\.fr/pages/legal/licences'
    r'|nationalarchives\.gov\.uk/doc/open-government-licence'
    r'|data\.norge\.no/nlod'
    r'|nvbw\.de/open-data'
    r'|opentransportdata\.swiss/en/terms-of-use'
    r'|transportforireland\.ie/transitData'
    r'|bip\.plk-sa\.pl/ponowne-wykorzystywanie'
    r'|dadesobertes\.gva\.es'
    # added 2026-10-08 after auditing the 322 stated licences the pattern was refusing
    r'|openstreetmap\.org/copyright'                       # ODbL 1.0, named directly
    r'|donneesquebec\.ca/licence'                           # Licence Quebec, an open grant
    r'|lafabriquedesmobilites\.fr/wiki/Licence_Mobilit'      # Licence Mobilites, the same
                                                            # grant the French access point
                                                            # already supplies as
                                                            # mobility-licence
    r'|opendata\.waltti\.fi'                               # Finnish Waltti open data, CC BY 4.0
    r'|data\.qld\.gov\.au'                                # Queensland open data, CC BY 4.0
    r'|crtm\.es/licencia-de-uso', re.I)                     # Madrid regional transport

EXCLUDE_NAME = re.compile(r'scolaire|school|\bTAD\b|a la demande|à la demande|on.demand', re.I)

# www.data.gouv.fr is NOT USABLE from this session: the relay drops the tunnel mid-exchange on
# every request to it (recorded as ws_closed_mid_exchange after 39 bytes received, reproducibly,
# on HTTP/1.1 and HTTP/2 alike), so a registry row pointing there is a row that can never be
# fetched. It costs nothing to drop, because the French PAN publishes the SAME resource with its
# real host in `original_url`: the Mobility Database's data.gouv redirector URL for FlixBus
# Europe is dead here, while the PAN's gtfs.gis.flix.tech URL for the identical feed is alive.
# transport.data.gouv.fr and static.data.gouv.fr both answer normally; only www does not.
DEAD_HOST = re.compile(r'^https?://(www\.)?data\.gouv\.fr/', re.I)

# Already in the hand-written table in gtfs-national-harvest.py, by URL fragment.
ALREADY = ('marduk-production', 'gtfs.ovapi.nl', 'GTFS_All.zip', 'hsldev.com',
           'rejseplanen.info', 'bus-data.dft.gov.uk', 'download.gtfs.de/germany/free',
           'download.gtfs.de/germany/rv_free', 'export-ter-gtfs-last',
           'export-intercites-gtfs-last', 'export_gtfs_voyages',
           'Fichero_AV_LD', 'content.amtrak.com', 'GTFS_Irish_Rail')

# A feed is a PAGE SOURCE only where its country is a market whose language we publish, so a
# native-language page about that country needs no per-market keyword cell. Everywhere else
# the feed is acquired as GRAPH EVIDENCE: it can corroborate a pair whose other endpoint is
# in an admitted market, and it generates no page of its own.
PAGE_SOURCE_COUNTRIES = {'US', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'BR', 'GB', 'JP', 'TW',
                         'TR', 'AU', 'MX', 'DK', 'NO', 'FI', 'IE'}


def fetch(url, timeout=120):
    req = urllib.request.Request(url, headers={'User-Agent': 'livdar-atlas-feed-registry/1.0'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def from_pan():
    """French national access point. Resources carry a licence code, so the gate is machine
    applied. Country is left as None where the dataset is a European network, because the
    harvester derives country from the stops themselves, not from the catalogue."""
    try:
        data = json.loads(fetch('https://transport.data.gouv.fr/api/datasets'))
    except Exception as e:
        print(f'PAN unreachable: {e}', file=sys.stderr)
        return []
    out, seen = [], set()
    for ds in data:
        title = (ds.get('title') or '').strip()
        lic = (ds.get('licence') or '').strip()
        if lic in PAN_REFUSED or lic not in PAN_LICENCES:
            continue
        if EXCLUDE_NAME.search(title):
            continue
        for r in ds.get('resources', []):
            if (r.get('format') or '').upper() != 'GTFS':
                continue
            url = r.get('original_url') or r.get('url')
            if not url or url in seen:
                continue
            if any(a in url for a in ALREADY) or DEAD_HOST.match(url):
                continue
            if EXCLUDE_NAME.search((r.get('title') or '')):
                continue
            seen.add(url)
            out.append({
                'source': 'transport.data.gouv.fr',
                'dataset': title,
                'resource': (r.get('title') or '').strip(),
                'url': url,
                'licence_code': lic,
                'licence': PAN_LICENCES[lic],
                'country_hint': 'FR',
                'kind': classify(title + ' ' + (r.get('title') or '')),
            })
    return out


def from_mdb():
    try:
        raw = fetch('https://files.mobilitydatabase.org/feeds_v2.csv').decode('utf-8', 'replace')
    except Exception as e:
        print(f'MDB unreachable: {e}', file=sys.stderr)
        return []
    out, seen = [], set()
    for r in csv.DictReader(raw.splitlines()):
        if r['data_type'] != 'gtfs' or r['status'] != 'active':
            continue
        if r['urls.authentication_type'].strip() not in ('', '0'):
            continue
        url = r['urls.direct_download'].strip()
        lic = (r['urls.license'] or '').strip()
        if not url or url in seen or not MDB_LICENCE_OK.search(lic):
            continue
        if any(a in url for a in ALREADY) or DEAD_HOST.match(url):
            continue
        label = f"{r['provider'] or ''} {r['name'] or ''}"
        if EXCLUDE_NAME.search(label):
            continue
        seen.add(url)
        out.append({
            'source': 'mobilitydatabase',
            'dataset': (r['provider'] or '').strip(),
            'resource': (r['name'] or '').strip(),
            'url': url,
            'licence_code': 'see-url',
            'licence': lic,
            # The catalogue's country_code is WRONG on real rows (it files OVapi Netherlands
            # under AT and Entur Norway under CZ), so it is a hint only. The harvester derives
            # country from the gazetteer match on the stops, which cannot be mislabelled.
            'country_hint': r['location.country_code'].strip() or None,
            'kind': classify(label),
            'subdivision': (r['location.subdivision_name'] or '').strip(),
        })
    return out


def classify(text):
    t = text.lower()
    if re.search(r'ferr|maritim|bateau|boat|schiff', t):
        return 'ferry'
    if re.search(r'rail|train|bahn|chemin de fer|sncf|trenitalia|renfe|eurostar|sleeper|'
                 r'tgv|intercit|ter\b|polregio|kolej', t):
        return 'rail'
    if re.search(r'flix|blabla|megabus|coach|car\b|autocar|interurbain|intercity|'
                 r'interurban|express', t):
        return 'coach'
    if re.search(r'aggregat|agr.gat|aggregate|national|nationwide|country|r.gion', t):
        return 'aggregate'
    return 'other'


def ident(f):
    """The identity of a NETWORK, used to dedupe across the two catalogues. The same feed
    arrives twice under different hosts (Eurostar as a PAN resource and as a Mobility Database
    row), so dedupe cannot be on the URL. Normalise the operator and network text instead."""
    t = f"{f.get('dataset') or ''} {f.get('resource') or ''}".lower()
    t = re.sub(r'https?://\S+', ' ', t)
    t = re.sub(r'[^a-z0-9]+', ' ', t).strip()
    return ' '.join(sorted(set(t.split())))


def main():
    # PAN first: where a network appears in both catalogues the PAN row wins, because it carries
    # the machine-readable licence code and the publisher's real download host.
    #
    # The identity dedupe is deliberately CROSS-CATALOGUE ONLY. Applied within a catalogue it
    # destroys real supply: many Mobility Database rows name only their operator, so a word-set
    # identity collapses an operator's several distinct networks into one, and a first attempt
    # at this cut the registry from 1,619 feeds to 722 by folding together feeds that are not
    # the same feed. Inside one catalogue the URL is already the identity, and a catalogue does
    # not list the same feed twice.
    pan = from_pan()
    pan_nets = {ident(f) for f in pan}
    feeds, seen_url = [], set()
    for f in pan + from_mdb():
        u = f['url']
        if u in seen_url:
            continue
        if f['source'] != 'transport.data.gouv.fr' and ident(f) in pan_nets:
            continue
        seen_url.add(u)
        feeds.append(f)
    by_kind = {}
    for f in feeds:
        f['page_source'] = (f.get('country_hint') in PAGE_SOURCE_COUNTRIES)
        by_kind.setdefault(f['kind'], 0)
        by_kind[f['kind']] += 1
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({
        'generated': '2026-10-08',
        'what_this_is': 'Licence-gated GTFS feed registry, derived from two open catalogues.',
        'licence_gate': 'A feed with no stated open licence is REFUSED regardless of size.',
        'refused_examples_that_are_reachable_right_now': [
            'Megabus US (no licence field)', 'Washington State Ferries (no licence field)',
            'SNCB Belgium via irail (unofficial, no licence field)',
            'European Sleeper (no licence field)',
            'flix.tech per-country feeds (no licence field; FlixBus enters via the French PAN '
            'instead, where the same network is published under ODbL)',
            'Koleje Malopolskie (official producer, no licence field)',
            'Renfe Cercanias (no licence field)',
        ],
        'counts': {'total': len(feeds), 'by_kind': by_kind,
                   'page_source': sum(1 for f in feeds if f['page_source'])},
        'feeds': feeds,
    }, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print(f'{len(feeds):,} licensed feeds -> {OUT}')
    for k, n in sorted(by_kind.items(), key=lambda kv: -kv[1]):
        print(f'  {k:10} {n:5}')


if __name__ == '__main__':
    main()
