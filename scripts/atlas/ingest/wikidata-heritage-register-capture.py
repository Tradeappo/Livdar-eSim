#!/usr/bin/env python3
"""Eight national heritage registers, each selected by its own identifier property.

THREE REGISTERS, AND NONE OF THEM ASSUMED TO BEHAVE LIKE ENGLAND'S. The England build read
379,685 National Heritage List entries, joined 19,561 of them to a read article and shipped
5,212 rows: a conversion of 1.4 per cent. Nothing says that transfers. Dutch, Polish and
French Wikipedia cover their own monuments at their own rates, and the landmark layer has
since taken 106,891 items that the registers would otherwise have supplied, so the overlap
is different too. Each register is captured and counted on its own.

SELECTED BY IDENTIFIER, NOT BY CLASS. An item is in the Rijksmonument register because it
states a Rijksmonument ID, not because of what class Wikidata gives it, and the same holds
for the Polish register number and the Mérimée reference. The band walk, the per-register
count verification and the label guard are the landmark capture's, with the selector
generalised rather than copied.

  P359  Rijksmonument ID               Rijksdienst voor het Cultureel Erfgoed
  P3424 Polish cultural heritage register number   Narodowy Instytut Dziedzictwa
  P380  Mérimée ID                     Ministère de la Culture, base Mérimée
  P649  NRHP reference number          US National Park Service
  P2951 Cultural heritage database in Austria ObjektID   Bundesdenkmalamt
  P1764 Flemish Heritage Object ID     agentschap Onroerend Erfgoed
  P808  Asset of cultural interest code   Ministerio de Cultura, Registro de BIC
  P762  Czech cultural heritage ID     Národní památkový ústav

The register identifier is the page's provenance: a row carries it so a reader can look the
entry up in the official record, which is what makes this a heritage page rather than a
second landmark page.

Usage: wikidata-heritage-register-capture.py [--classes nl_rijksmonument,...]
Writes data/atlas/sources/wikidata/heritage-register/<register>.jsonl.gz
"""
import importlib.util, sys

ROOT = '/home/user/Livdar-eSim/'
_spec = importlib.util.spec_from_file_location(
    'landmark_capture', ROOT + 'scripts/atlas/ingest/wikidata-landmark-capture.py')
LC = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(LC)

OUT = ROOT + 'data/atlas/sources/wikidata/heritage-register/'

# (property id, register slug, the English label Wikidata gives that property, readable
# items measured 2026-10-19). The label is checked against Wikidata before any capture
# runs, exactly as the class ids are.
CLASSES = [
    ('P380', 'fr_merimee', 'Mérimée ID', 32857),
    ('P3424', 'pl_nid', 'Polish cultural heritage register number', 9954),
    ('P359', 'nl_rijksmonument', 'Rijksmonument ID', 8437),
    # Added 2026-10-19 after wikidata-register-census.py read all 13,977 properties and
    # counted the readable supply behind each of the 299 that name a register of places.
    # The three above were chosen by hand from the four countries this project happened to
    # know about; the National Register of Historic Places alone holds more than twice
    # Mérimée, and nothing but the absence of a census was keeping it out.
    ('P649', 'us_nrhp', 'NRHP reference number', 71267),
    ('P2951', 'at_bda', 'Cultural heritage database in Austria ObjektID', 7725),
    ('P1764', 'be_flanders', 'Flemish Heritage Object ID', 5887),
    ('P808', 'es_bic', 'Asset of cultural interest code', 5882),
    ('P762', 'cz_uskp', 'Czech cultural heritage ID', 2055),
    # A second pass, 2026-10-19, from the same census: every property whose
    # register is kept by a state body or an agency of one. Refused with their
    # supply recorded: Kulturenvanteri (26,457) and British Listed Buildings
    # (22,655) are third-party inventories rather than the official register,
    # and historic county (118,226), located in protected area (19,857) and
    # state of conservation (16,669) are not identifiers at all - they ranked
    # because the census's word filter is deliberately loose.
    ('P4244', 'de_bayern', 'Bavarian monument authority ID', 14507),
    ('P9339', 'de_bayern_map', 'Bavarian Monument Map object ID (architectural monument)', 13568),
    ('P9154', 'at_his', 'Heritage Information System ID in the database of cultural heritage in Austria', 7823),
    ('P9495', 'se_shm', 'National Historical Museums of Sweden ID', 5364),
    ('P709', 'gb_scotland', 'Historic Environment Scotland ID', 4971),
    ('P7900', 'de_niedersachsen', 'Monument Atlas Lower Saxony ADABweb-ID', 4460),
    ('P757', 'unesco_whs', 'World Heritage Site ID', 3369),
    ('P7618', 'us_virginia', 'Virginia Landmarks Register ID', 2987),
    ('P9148', 'de_sachsen_anhalt', 'Saxony-Anhalt cultural heritage object ID', 2594),
    ('P3318', 'es_andalucia', 'Guía Digital del Patrimonio Cultural de Andalucía ID', 2362),
    ('P4075', 'cz_catalogue', 'Czech Monument Catalogue Number', 2215),
    ('P1600', 'es_catalunya', 'Inventari del Patrimoni Arquitectònic de Catalunya code', 2016),
    ('P1260', 'se_soch', 'Swedish Open Cultural Heritage URI', 1949),
    ('P6012', 'us_california', 'California Office of Historic Preservation ID', 1860),
    ('P4245', 'rs_monuments', 'cultural heritage monument in Serbia ID', 1791),
    ('P2967', 'au_queensland', 'Queensland Heritage Register ID', 1776),
    ('P477', 'ca_rhp', 'Canadian Register of Historic Places ID', 1719),
    ('P3449', 'au_nsw', 'NSW Heritage database ID', 1690),
    ('P4275', 'jp_cultural', 'Japanese Database of National Cultural Properties ID', 1518),
]


def main():
    only = None
    args = sys.argv[1:]
    if '--classes' in args:
        only = set(args[args.index('--classes') + 1].split(','))
    LC.run(CLASSES, OUT, only)


if __name__ == '__main__':
    main()
