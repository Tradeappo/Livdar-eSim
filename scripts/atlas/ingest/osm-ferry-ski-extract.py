#!/usr/bin/env python3
"""
Extract ferry routes and ski areas from an OSM PBF.

These two families were reported BLOCKED earlier in this session on the grounds that
they needed Overpass. That was wrong: the tags are in the country PBFs the project
already downloads, and the only reason they were missing is that no pass ever asked for
them. osm-poi-extract.py filters on node tags and discards relations, and
osm-parents-extract.py maps landuse=winter_sports to ski_area but its ROUTE_OK set does
not include ferry, so neither layer could have produced either family.

WHAT MAKES A FERRY ROUTE A PAGE. A route=ferry relation carries a name, usually an
operator, and often explicit from and to tags. Measured on Denmark: 51 ferry relations,
46 named, 20 with both from and to. The names themselves carry the pair, in several
conventions that all have to be parsed rather than assumed:

    "Frederikshavn => Göteborg"      arrow
    "Helsingborg-Helsingør"          hyphen
    "København - Oslo"               spaced hyphen
    "Rostock => Gedser"              arrow, cross-border
    "Fåborg-Lyø-Avernakø"            THREE stops, not a pair

That last one matters: a multi-stop route is not one pair and must not be forced into
one. It is kept with its full stop list and the pair builder decides.

SKI. landuse=winter_sports areas and site=piste relations, named only. Denmark returned
exactly 1, which is correct for a country whose highest point is 171 m, and is the
reason this pass has to run over Alpine and Nordic countries to be worth anything.

Usage: osm-ferry-ski-extract.py <in.pbf> <country_iso2> <ferry-out.jsonl.gz> <ski-out.jsonl.gz>
"""
import sys, gzip, json, re, collections
import osmium

PBF, COUNTRY, FERRY_OUT, SKI_OUT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

# The separators a ferry route name uses to join its stops, longest first so " - " is
# tried before "-" and a hyphenated place name is not split in half.
SEPS = (' => ', ' <=> ', ' -> ', ' — ', ' – ', ' - ', ' / ', '=>', '<->', '->', ' | ')
HYPHEN_ONLY = re.compile(r'^([^-]{3,})-([^-]{3,})$')


def split_stops(name):
    """The stop sequence a route name states, or an empty list when it states none.

    Returns a LIST because a ferry can call at three or more places, and collapsing
    Faaborg-Lyoe-Avernakoe into one pair would invent a service that does not exist.
    """
    n = (name or '').strip()
    if not n:
        return []
    for s in SEPS:
        if s in n:
            parts = [p.strip() for p in n.split(s) if p.strip()]
            if len(parts) >= 2:
                return parts
    # A bare hyphen with no spaces is ambiguous: "Helsingborg-Helsingoer" is a pair and
    # "Hirtshals-Langesund" is a pair, but "Port-Vendres" is one place. Only split when
    # BOTH sides are long enough to be place names, and record that it was a guess.
    m = HYPHEN_ONLY.match(n)
    if m and '-' not in m.group(1) and '-' not in m.group(2):
        return [m.group(1).strip(), m.group(2).strip()]
    return []


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.ferry, self.ski = [], []
        self.stats = collections.Counter()

    def _ferry(self, o, kind):
        t = dict(o.tags)
        if t.get('route') != 'ferry' and t.get('route_master') != 'ferry':
            return
        self.stats['ferry_objects'] += 1
        name = (t.get('name') or '').strip()
        if not name:
            self.stats['ferry_unnamed_dropped'] += 1
            return
        frm, to = (t.get('from') or '').strip(), (t.get('to') or '').strip()
        stops = [frm, to] if (frm and to) else split_stops(name)
        rec = {
            'osm_type': kind, 'osm_id': o.id, 'country': COUNTRY, 'name': name,
            'operator': (t.get('operator') or '').strip(),
            'network': (t.get('network') or '').strip(),
            'ref': (t.get('ref') or '').strip(),
            'from_tag': frm, 'to_tag': to,
            'stops_stated': stops,
            # where the stop list came from, because a tagged from/to is evidence and a
            # name split is an inference, and the page gate should be able to tell them apart
            'stops_source': ('from_and_to_tags' if (frm and to)
                             else 'parsed_from_the_route_name' if stops else 'none'),
            'is_multi_stop': len(stops) > 2,
            'duration': (t.get('duration') or '').strip(),
            'motor_vehicle': (t.get('motor_vehicle') or '').strip(),
            'foot': (t.get('foot') or '').strip(),
            'bicycle': (t.get('bicycle') or '').strip(),
            'website': (t.get('website') or t.get('url') or '').strip(),
            'wikidata': (t.get('wikidata') or '').strip(),
        }
        if not stops:
            self.stats['ferry_named_but_no_stop_pair'] += 1
        elif rec['is_multi_stop']:
            self.stats['ferry_multi_stop'] += 1
        else:
            self.stats['ferry_pair'] += 1
        self.stats['ferry_stops_source:' + rec['stops_source']] += 1
        self.ferry.append(rec)

    def _ski(self, o, kind, lat=None, lon=None):
        t = dict(o.tags)
        is_ski = (t.get('landuse') == 'winter_sports' or t.get('site') == 'piste'
                  or t.get('sport') == 'skiing' and t.get('leisure') == 'sports_centre')
        if not is_ski:
            return
        self.stats['ski_objects'] += 1
        name = (t.get('name') or '').strip()
        if not name:
            self.stats['ski_unnamed_dropped'] += 1
            return
        self.ski.append({
            'osm_type': kind, 'osm_id': o.id, 'country': COUNTRY, 'name': name,
            'kind': ('winter_sports_area' if t.get('landuse') == 'winter_sports'
                     else 'piste_site' if t.get('site') == 'piste' else 'ski_sports_centre'),
            'operator': (t.get('operator') or '').strip(),
            'website': (t.get('website') or t.get('url') or '').strip(),
            'wikidata': (t.get('wikidata') or '').strip(),
            'wikipedia': (t.get('wikipedia') or '').strip(),
            'ele': (t.get('ele') or '').strip(),
            'piste_difficulty': (t.get('piste:difficulty') or '').strip(),
            'lat': lat, 'lon': lon,
        })
        self.stats['ski_named'] += 1

    def relation(self, r):
        self._ferry(r, 'relation')
        self._ski(r, 'relation')

    def way(self, w):
        self._ferry(w, 'way')
        self._ski(w, 'way')

    def area(self, a):
        try:
            c = a.centroid
            self._ski(a, 'area', c.lat, c.lon)
        except Exception:
            self._ski(a, 'area')

    def node(self, n):
        try:
            self._ski(n, 'node', n.location.lat, n.location.lon)
        except Exception:
            pass


h = H()
h.apply_file(PBF, locations=False)

seen = set()
with gzip.open(FERRY_OUT, 'wt', encoding='utf-8') as f:
    for r in h.ferry:
        k = (r['name'].lower(), r['operator'].lower())
        if k in seen:
            h.stats['ferry_duplicate_name_and_operator'] += 1
            continue
        seen.add(k)
        f.write(json.dumps(r, ensure_ascii=False) + '\n')
seen = set()
with gzip.open(SKI_OUT, 'wt', encoding='utf-8') as f:
    for r in h.ski:
        k = r['name'].lower()
        if k in seen:
            h.stats['ski_duplicate_name'] += 1
            continue
        seen.add(k)
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

print(json.dumps({'country': COUNTRY, 'pbf': PBF,
                  'ferry_written': len(seen) and None or None,
                  'stats': dict(h.stats)}, ensure_ascii=False, indent=1))
