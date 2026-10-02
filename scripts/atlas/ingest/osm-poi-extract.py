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

# Neighbourhood-level places. These are not POI: they are the AREAS that POI
# aggregate into, and they are what makes "cafes in Kreuzberg" possible instead of
# only "cafes in Berlin". Captured in the same pass because they live in the same
# extract and cost nothing extra.
PLACE = {'suburb': 'suburb', 'neighbourhood': 'neighbourhood', 'quarter': 'quarter',
         'borough': 'borough', 'city_block': 'city_block', 'city_district': 'city_district'}

def classify_place(t):
    v = t.get('place')
    return PLACE.get(v) if v else None

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
        if not name: return                      # unnamed entity cannot carry a page
        pl = classify_place(t)
        if pl:
            rec = {'id': f'{kind}{o.id}', 'kind': 'place', 'cls': pl, 'name': name,
                   'country': self.iso2,
                   'lat': round(lat, 6) if lat is not None else None,
                   'lon': round(lon, 6) if lon is not None else None}
            for k_src, k_dst in (('population', 'pop'), ('wikidata', 'qid'),
                                 ('is_in:city', 'in_city'), ('addr:city', 'city')):
                if t.get(k_src): rec[k_dst] = str(t[k_src])[:120]
            self.out.write(json.dumps(rec, ensure_ascii=False) + '\n')
            self.counts['PLACE:' + pl] += 1; self.kept += 1
            return
        cls = classify(t)
        if not cls: return
        rec = {'id': f'{kind}{o.id}', 'kind': 'poi', 'cls': cls, 'name': name, 'country': self.iso2,
               'lat': round(lat, 6) if lat is not None else None,
               'lon': round(lon, 6) if lon is not None else None}
        for k_src, k_dst in (('addr:city', 'city'), ('website', 'web'),
                             ('opening_hours', 'oh'), ('phone', 'tel'),
                             ('wikidata', 'qid'), ('cuisine', 'cuisine'),
                             ('addr:postcode', 'pc'), ('operator', 'op'),
                             ('wikipedia', 'wikipedia')):
            if t.get(k_src): rec[k_dst] = t[k_src][:120]
        # Every name:xx. Until now this pass kept no language-bearing tag at all, which was
        # invisible while every POI sat in a market country whose language was already known from
        # the country. Opening the destination axis made it the binding gap: a Turkish museum needs
        # a mark in the page's language before a German page about it is anything but a translated
        # clone, and the wikipedia tag plus name:de are the two marks OSM actually carries. The
        # outdoor pass has kept these from the start and the POI pass did not.
        ln = {k[5:]: str(v)[:120] for k, v in t.items()
              if k.startswith('name:') and len(k) <= 12 and v and len(str(v)) < 120}
        if ln: rec['names'] = ln
        # Attributes a person actually filters on. These are what let a modifier page
        # ("cafes with wifi in Berlin", "restaurants with outdoor seating in Lyon") be
        # backed by data instead of asserted: the page exists only where enough
        # entities carry the tag. Kept as a compact dict so the output stays small.
        attr = {}
        for k_src, k_dst in (('internet_access', 'wifi'), ('outdoor_seating', 'outdoor'),
                             ('wheelchair', 'wheelchair'), ('takeaway', 'takeaway'),
                             ('delivery', 'delivery'), ('air_conditioning', 'ac'),
                             ('diet:vegan', 'vegan'), ('diet:vegetarian', 'vegetarian'),
                             ('diet:halal', 'halal'), ('diet:kosher', 'kosher'),
                             ('diet:gluten_free', 'gluten_free'), ('dog', 'dog'),
                             ('drive_through', 'drive_through'), ('fee', 'fee'),
                             ('sport', 'sport'), ('stars', 'stars'),
                             ('changing_table', 'changing_table'),
                             ('reservation', 'reservation'), ('brand', 'brand')):
            v = t.get(k_src)
            if v: attr[k_dst] = str(v)[:40]
        if attr: rec['attr'] = attr
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
