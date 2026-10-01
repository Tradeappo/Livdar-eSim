#!/usr/bin/env python3
"""
Extract NAMED, page-worthy POI from an OSM .pbf extract.

Only named entities are kept: an unnamed POI cannot carry a page, so including it
would be padding. Each kept POI maps to one of the Livdar POI classes the family
catalogue already uses, so the output drops straight into the candidate generator.

Usage: osm-poi-extract.py <in.pbf> <country_iso2> <out.jsonl.gz>
"""
import sys, gzip, json, collections
import os
import osmium

NODES_ONLY = os.environ.get('NODES_ONLY', '1') == '1'

# tag -> (livdar_class, surface_family_hint). Only classes that can carry a durable
# page with a practical modifier, which is what the SERP evidence says is rankable.
AMENITY = {
    'restaurant': 'restaurant', 'cafe': 'cafe', 'bar': 'bar', 'pub': 'pub',
    'nightclub': 'nightclub', 'fast_food': 'fast_food', 'biergarten': 'bar',
    'hospital': 'hospital', 'clinic': 'clinic', 'doctors': 'clinic',
    'dentist': 'dentist', 'pharmacy': 'pharmacy', 'veterinary': 'veterinary',
    'school': 'school', 'college': 'college', 'university': 'university',
    'kindergarten': 'childcare', 'childcare': 'childcare',
    'library': 'library', 'theatre': 'theatre', 'cinema': 'cinema',
    'arts_centre': 'arts_centre', 'community_centre': 'community_centre',
    'marketplace': 'market', 'parking': 'parking', 'bus_station': 'bus_station',
    'ferry_terminal': 'ferry_terminal', 'townhall': 'townhall',
    'post_office': 'post_office', 'bank': 'bank', 'police': 'police',
    'fire_station': 'fire_station', 'courthouse': 'courthouse',
    'social_facility': 'social_facility', 'casino': 'casino',
}
SHOP = {'mall': 'mall', 'department_store': 'department_store', 'supermarket': 'supermarket'}
LEISURE = {
    'fitness_centre': 'gym', 'sports_centre': 'sports_centre', 'sports_hall': 'sports_centre',
    'swimming_pool': 'swimming_pool', 'stadium': 'stadium', 'pitch': 'sports_pitch',
    'park': 'park', 'garden': 'garden', 'golf_course': 'golf_course',
    'marina': 'marina', 'ice_rink': 'ice_rink', 'water_park': 'water_park',
    'beach_resort': 'beach_resort', 'nature_reserve': 'nature_reserve',
}
TOURISM = {
    'attraction': 'attraction', 'museum': 'museum', 'gallery': 'gallery',
    'zoo': 'zoo', 'theme_park': 'theme_park', 'viewpoint': 'viewpoint',
    'aquarium': 'aquarium', 'hotel': 'hotel', 'hostel': 'hostel',
    'guest_house': 'guest_house', 'apartment': 'apartment_accommodation',
    'motel': 'motel', 'camp_site': 'camp_site', 'picnic_site': 'picnic_site',
}
HISTORIC = {
    'castle': 'castle', 'monument': 'monument', 'memorial': 'memorial',
    'archaeological_site': 'archaeological_site', 'ruins': 'ruins',
    'fort': 'fort', 'manor': 'manor', 'city_gate': 'city_gate',
}
NATURAL = {'beach': 'beach', 'peak': 'peak', 'waterfall': 'waterfall', 'cave_entrance': 'cave'}
OFFICE = {'coworking': 'coworking'}
RAILWAY = {'station': 'railway_station', 'halt': 'railway_halt', 'tram_stop': 'tram_stop'}
AEROWAY = {'aerodrome': 'airport', 'terminal': 'airport_terminal'}

def classify(t):
    for key, table in (('amenity', AMENITY), ('shop', SHOP), ('leisure', LEISURE),
                       ('tourism', TOURISM), ('historic', HISTORIC), ('natural', NATURAL),
                       ('office', OFFICE), ('railway', RAILWAY), ('aeroway', AEROWAY)):
        v = t.get(key)
        if v and v in table:
            return table[v]
    # a generic shop with a name is still a local business page candidate
    if t.get('shop'): return 'shop_other'
    return None

class POI(osmium.SimpleHandler):
    def __init__(self, iso2, out):
        super().__init__()
        self.iso2 = iso2; self.out = out
        self.counts = collections.Counter(); self.kept = 0; self.seen = 0

    def _emit(self, o, lat, lon, kind):
        self.seen += 1
        t = dict(o.tags)
        name = t.get('name')
        if not name: return                      # unnamed POI cannot carry a page
        cls = classify(t)
        if not cls: return
        rec = {'id': f'{kind}{o.id}', 'cls': cls, 'name': name, 'country': self.iso2,
               'lat': round(lat, 6) if lat is not None else None,
               'lon': round(lon, 6) if lon is not None else None}
        for k_src, k_dst in (('addr:city', 'city'), ('website', 'web'),
                             ('opening_hours', 'oh'), ('phone', 'tel'),
                             ('wikidata', 'qid'), ('cuisine', 'cuisine'),
                             ('addr:postcode', 'pc'), ('operator', 'op')):
            if t.get(k_src): rec[k_dst] = t[k_src][:120]
        self.out.write(json.dumps(rec, ensure_ascii=False) + '\n')
        self.counts[cls] += 1; self.kept += 1

    def node(self, n):
        try: self._emit(n, n.location.lat, n.location.lon, 'n')
        except Exception: pass
    def area(self, a):
        # buildings and polygons carry most parks, malls, stadiums and some hospitals.
        # Building the area index costs roughly 20x the node-only pass, so NODES_ONLY
        # skips it: OSM nodes already hold the dense commercial POI (restaurants,
        # cafes, gyms, shops, clinics, pharmacies) which is what Wikidata cannot
        # supply, while Wikidata covers the institution-shaped polygons (museums,
        # hospitals, stadiums, malls) under CC0. The two sources are complementary,
        # so node-only loses little and makes a full 11-market ingest feasible.
        if NODES_ONLY: return
        try:
            c = a.centroid
            self._emit(a, c.lat, c.lon, 'a' if a.from_way() else 'r')
        except Exception: pass

if __name__ == '__main__':
    src, iso2, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    with gzip.open(dst, 'wt', encoding='utf-8') as fh:
        h = POI(iso2, fh)
        if NODES_ONLY:
            h.apply_file(src)                      # no location index needed
        else:
            h.apply_file(src, locations=True, idx='flex_mem')
    print(json.dumps({'country': iso2, 'kept': h.kept,
                      'by_class': dict(h.counts.most_common())}, ensure_ascii=False))
