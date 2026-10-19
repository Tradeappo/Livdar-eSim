#!/usr/bin/env python3
"""Every Wikidata settlement that has coordinates and an article in a language we can measure.

A SEPARATE PASS FROM THE LANDMARKS, FOR A REASON ABOUT PAGES RATHER THAN ABOUT DATA. The
class census of 2026-10-19 found 1,084,510 readable geographic items the landmark capture
does not read, and 853,657 of them are settlements: villages, communes, Ortsteile, hamlets,
desa, mahalle. That is the largest reservoir left anywhere in this inventory and it is also
exactly where city-name swapping lives. A page reading "X is a commune in department Y with
a population of N, an area of A and an elevation of E" is one template with three numbers in
it, however true every number is.

So the settlements are captured apart from the landmarks and admitted under a stricter
contract, written in settlement-candidates.py: a settlement needs two facts BEYOND the
universal population, area and elevation triple, or three admitted Atlas entities standing
inside it, before its readership is even considered. Keeping the capture separate is what
makes that possible; a single directory would make the two contracts one.

ADMINISTRATIVE AREAS ARE NOT SETTLEMENTS and are left out. A province, a county, a
prefecture or a canton is a container rather than a place somebody goes, and this inventory
pages regions from its own region layer.

The band walk, the per-class count verification and the label guard are the landmark
capture's, imported rather than copied. Three silent wrong answers were found in that one
query and a second copy would be a second place for them to come back.

Usage: wikidata-settlement-capture.py [--classes a,b,c]
Writes data/atlas/sources/wikidata/settlement/<class>.jsonl.gz, one file per class.
"""
import importlib.util, sys

ROOT = '/home/user/Livdar-eSim/'
_spec = importlib.util.spec_from_file_location(
    'landmark_capture', ROOT + 'scripts/atlas/ingest/wikidata-landmark-capture.py')
LC = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LC)

OUT = ROOT + 'data/atlas/sources/wikidata/settlement/'

# (item id, class slug, the English label Wikidata gives that item, readable items).
# Taken from _class-census.json, not from memory: the readable count beside each is the
# census's own measurement of how many items of that class carry coordinates and an article
# in one of the eleven editions whose clickstream this project holds, and the label is the
# one the census read from Wikidata, so LC.check_labels() checks a measurement against its
# source. Classes under 500 readable items are left out.
CLASSES = [
    ('Q532', 'village', 'village', 127656),
    ('Q3558970', 'village_of_poland', 'village of Poland', 55736),
    ('Q253019', 'ortsteil', 'Ortsteil', 43796),
    ('Q484170', 'commune_of_france', 'commune of France', 42948),
    ('Q17343829', 'unincorporated_community', 'unincorporated community', 39234),
    ('Q26211545', 'desa', 'desa', 33677),
    ('Q5084', 'hamlet', 'hamlet', 30170),
    ('Q123705', 'neighborhood', 'neighborhood', 24247),
    ('Q3257686', 'locality', 'locality', 22584),
    ('Q21672098', 'village_of_ukraine', 'village of Ukraine', 22511),
    ('Q17051044', 'mahalle', 'mahalle', 22358),
    ('Q735428', 'town_of_china', 'town of China', 22031),
    ('Q56436498', 'village_in_india', 'village in India', 21160),
    ('Q1529096', 'village_of_turkey', 'village of Turkey', 19051),
    ('Q3957', 'town', 'town', 14617),
    ('Q18663566', 'dissolved_municipality_of_japan', 'dissolved municipality of Japan', 12997),
    ('Q1115575', 'civil_parish', 'civil parish', 11775),
    ('Q20202352', 'locality_of_mexico', 'locality of Mexico', 11579),
    ('Q498162', 'census_designated_place_in_the_united_states', 'census-designated place in the United States', 11460),
    ('Q65661087', 'village_in_belarus', 'village in Belarus', 9892),
    ('Q1093829', 'city_in_the_united_states', 'city in the United States', 9387),
    ('Q15243209', 'historic_district', 'historic district', 9382),
    ('Q986065', 'subdistrict_in_china', 'subdistrict in China', 9293),
    ('Q479053', 'gromada', 'gromada', 9256),
    ('Q116457956', 'municipality_without_town_privileges_in_germany', 'municipality without town privileges in Germany', 9065),
    ('Q3055118', 'single_entity_of_population', 'single entity of population', 8793),
    ('Q1500350', 'township_of_china', 'township of China', 8597),
    ('Q1134686', 'frazione', 'frazione', 8353),
    ('Q102496', 'parish', 'parish', 7963),
    ('Q747074', 'comune_of_italy', 'comune of Italy', 7839),
    ('Q188509', 'suburb', 'suburb', 7671),
    ('Q515', 'city', 'city', 7269),
    ('Q5153359', 'municipality_of_the_czech_republic', 'municipality of the Czech Republic', 6255),
    ('Q4845841', 'settlement_in_croatia', 'settlement in Croatia', 6219),
    ('Q2074737', 'municipality_of_spain', 'municipality of Spain', 6212),
    ('Q11183787', 'ortschaft', 'Ortschaft', 5753),
    ('Q5327369', 'ch_ch', 'chōchō', 5645),
    ('Q15127012', 'town_in_the_united_states', 'town in the United States', 5629),
    ('Q3184121', 'municipality_of_brazil', 'municipality of Brazil', 5570),
    ('Q126723715', 'village_of_cameroon', 'village of Cameroon', 5368),
    ('Q28822032', 'cadastral_municipality_of_serbia', 'cadastral municipality of Serbia', 5127),
    ('Q2514025', 'posyolok', 'posyolok', 5024),
    ('Q350895', 'abandoned_village', 'abandoned village', 4749),
    ('Q965568', 'kelurahan', 'kelurahan', 4643),
    ('Q15630849', 'village_of_bulgaria', 'village of Bulgaria', 4612),
    ('Q22674925', 'former_settlement', 'former settlement', 4530),
    ('Q1484611', 'buurtschap', 'buurtschap', 3992),
    ('Q23012917', 'village_of_burkina_faso', 'village of Burkina Faso', 3858),
    ('Q12397176', 'civil_parish_of_galicia', 'civil parish of Galicia', 3748),
    ('Q2983893', 'quarter', 'quarter', 3647),
    ('Q16127605', 'populated_place_in_syria', 'populated place in Syria', 3348),
    ('Q1131296', 'freguesia_of_portugal', 'freguesia of Portugal', 3259),
    ('Q1530705', 'ward_of_nepal', 'ward of Nepal', 3248),
    ('Q18691601', 'ward_of_tanzania', 'ward of Tanzania', 3115),
    ('Q28111', 'township_in_the_united_states', 'township in the United States', 3077),
    ('Q74047', 'ghost_town', 'ghost town', 2916),
    ('Q20541692', 'settlement_in_galicia', 'settlement in Galicia', 2890),
    ('Q19730508', 'former_municipality', 'former municipality', 2779),
    ('Q15661340', 'ancient_city', 'ancient city', 2653),
    ('Q61089180', 'municipal_part_of_the_czech_republic', 'municipal part of the Czech Republic', 2639),
    ('Q1138414', 'isolated_settlement', 'isolated settlement', 2552),
    ('Q2023000', 'khutor', 'khutor', 2471),
    ('Q14839548', 'minor_locality_in_sweden', 'minor locality in Sweden', 2431),
    ('Q634099', 'rural_settlement_in_russia', 'rural settlement in Russia', 1749),
    ('Q82117', 'city_gate', 'city gate', 1685),
    ('Q2389082', 'commune_of_vietnam', 'commune of Vietnam', 1605),
    ('Q7930614', 'village_of_taiwan', 'village of Taiwan', 969),
    ('Q1077097', 'tambon', 'tambon', 688),
    ('Q130212458', 'village_of_kazakhstan', 'village of Kazakhstan', 629),
]


def main():
    only = None
    args = sys.argv[1:]
    if '--classes' in args:
        only = set(args[args.index('--classes') + 1].split(','))
    LC.run(CLASSES, OUT, only)


if __name__ == '__main__':
    main()
