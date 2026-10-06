#!/usr/bin/env python3
"""
Candidates for outdoor features inside a named geography, built from containment.

The demand was measured before this was written and it changed the design. I expected
features inside a PARK; the data says features inside a REGION, and usually an administrative
one: "seen in bayern" is 8,600 a month at difficulty 0 and Bavaria is a federal state, "best
beaches in cornwall" is 1,800 and Cornwall is a county, "wanderwege harz" is 700 and the Harz
is a named range. Only "lakes in the lake district" sits in an actual national park.

The SERP was sampled too, and it is the most open one found in this project: for "seen in
bayern", photo-nature.de holds position 6 at DOMAIN RATING 1, and its own top pages show a
hobby photography blog rather than a programmatic site. Two more slots are Pinterest and
TikTok, and Wikipedia ranks a LIST at the top, which says the format Google rewards here is an
enumeration. A complete, sourced, mapped list is a better answer than a photo-spot guide.

Every gate here exists for a reason that is written next to it. The ones that matter most:

  CONTAINMENT ONLY. A feature belongs to a geography because it is INSIDE it. Nothing is
  attached by proximity to a centroid, which is the mistake the city radius makes and the
  reason that radius was left alone rather than widened to swallow 1.6 million rural POI.

  NO SUPERLATIVE. Four of the measured German variants say schoenste, the most beautiful.
  Livdar does not claim that. The page answers WHICH lakes are in Bavaria and what is true of
  each, and leaves the ranking to the reader, per the standing rule against an undocumented
  best.

  A COUNT IS A REAL ANSWER. "how many lakes in the lake district" is 4,100 a month at
  difficulty 0. The page states the number it found and the date it was sourced, which is a
  fact rather than an opinion, and it is why this family passes the usefulness test on its own
  terms.

Usage: outdoor-aggregations.py
Reads  data/atlas/sources/osm-parents/parents-*.jsonl.gz
       data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz
Writes data/atlas/sources/osm-parents/_outdoor-aggregations.jsonl.gz
"""
import collections, glob, gzip, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                      # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
ASSIGN = ROOT + 'data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz'
OUT = PARENTS + '_outdoor-aggregations.jsonl.gz'

# The market list lives in entity_identity, which owns identity for the whole pipeline.
# Twelve files each hand-wrote their own copy; adding tr-TR meant editing twelve places and
# a thirteenth that would have been missed. One definition, imported.
COUNTRY_MKT = entity_identity.COUNTRY_MKT

# Which parent classes a reader would recognise as a place worth a list. A landcover forest
# polygon and an unnamed administrative shard are not places; a region, a county, a national
# park and a named range are.
PARENT_OK = {
    'region': 'region', 'county': 'county', 'national_park': 'national park',
    'protected_area': 'protected area', 'nature_reserve': 'nature reserve',
    'island': 'island', 'archipelago': 'archipelago', 'mountain_range': 'mountain range',
    'ski_area': 'ski area', 'park': 'park',
}

# Which feature types have MEASURED demand as a list inside a geography. Nothing is here on a
# hunch: each one is a keyword in ahrefs-outdoor-families-2026-10-01.json. The others
# (benches, guideposts, shelters) are real POI with no measured list demand, so they count
# toward a parent's richness and never get a page of their own.
FEATURE_DEMAND = {
    'lake': {'root_de': 'seen in', 'root_en': 'lakes in', 'volume': 8600, 'kd': 0,
             'measured_in': ['de-DE', 'en-GB']},
    'beach': {'root_en': 'beaches in', 'volume': 1800, 'kd': 1, 'measured_in': ['en-GB']},
    'peak': {'root_de': 'gipfel', 'root_en': 'peaks in', 'volume': 700, 'kd': 6,
             'measured_in': ['de-DE']},
    'viewpoint': {'root_en': 'viewpoints in', 'volume': 700, 'kd': 6,
                  'measured_in': ['de-DE']},
    # Measured 2026-10-01, after the German layer landed, to find out whether the list shape
    # works for any class beyond the three above. Four more clear a floor at a difficulty worth
    # entering; four were tested and refused. "naturparks in hessen" and "aussichtstuerme in nrw"
    # return ZERO, and "seen in brandenburg" at 800 sits behind difficulty 71 while
    # "wasserfaelle in bayern" at 70 sits behind 31. Those four are not here, and the reason they
    # are not is the measurement rather than a guess about what people search for outdoors.
    'castle': {'root_de': 'burgen in', 'root_it': 'castelli in', 'volume': 300, 'kd': 0,
               'measured_in': ['de-DE', 'it-IT']},
    'camp_site': {'root_de': 'campingplaetze in', 'root_it': 'campeggi in', 'volume': 600,
                  'kd': 1, 'measured_in': ['de-DE', 'it-IT']},
    'cave': {'root_de': 'hoehlen in', 'volume': 150, 'kd': 3, 'measured_in': ['de-DE']},
    'trail': {'root_de': 'wanderwege im', 'volume': 150, 'kd': 7, 'measured_in': ['de-DE']},
    # Measured 2026-10-01 in it-IT, once the Italian layers landed, because a gate keyed on
    # de-DE is a gate that refuses every other market for want of a measurement rather than for
    # want of demand. campeggi in toscana 600 at KD 1, laghi in lombardia 300 at 0, spiagge in
    # sardegna 200 at 0, castelli in toscana 150 at 0, rifugi in trentino 150 at 1, cascate in
    # trentino 100 at 0. Refused in Italian: cime del trentino at 10 and belvedere a roma at 20,
    # so peak and viewpoint lists stay German-only, and grotte in puglia at 350 behind KD 56.
    # Several Italian parent topics are "i piu belli", the most beautiful, which this project does
    # not claim: the no_superlative field on every row is what that rule looks like in the data.
    'waterfall_it': {'root_it': 'cascate in', 'volume': 100, 'kd': 0, 'measured_in': ['it-IT']},
    'mountain_hut': {'root_it': 'rifugi in', 'volume': 150, 'kd': 1, 'measured_in': ['it-IT']},
}
# Italian demand for lake and beach lists, measured in the same pass, extends two families that
# had only German and British evidence.
FEATURE_DEMAND['lake']['measured_in'].append('it-IT')
FEATURE_DEMAND['lake']['root_it'] = 'laghi in'
FEATURE_DEMAND['beach']['measured_in'].append('it-IT')
FEATURE_DEMAND['beach']['root_it'] = 'spiagge in'

# Measured 2026-10-02 in the seven markets this family had never been asked about, recorded in
# ahrefs-region-families-2026-10-02.json. Until today every one of them was refused for want of a
# MEASUREMENT rather than for want of demand, which is the failure this project has now made
# twice, and the numbers are not small: praias de santa catarina 6,800 in pt-BR is larger than
# anything this family measured in German.
#
# Each line below is one keyword that cleared the 100 a month floor. The refusals are kept out and
# are listed in the measurement file with their numbers, because a market absent from this list
# should be absent for a reason a reader can check: plaze na pomorzu 0 in Polish, lagos de baviera
# 10 in Spanish, lacs de savoie 80 in French, castelli della toscana 20 in Italian.
_NEW = {
    'beach': [('pt-BR', 'praias de', 6800), ('en-US', 'beaches in', 2600),
              ('de-DE', 'straende', 400),
              ('ja-JP', 'ビーチ', 1500), ('es-ES', 'playas de', 1000),
              ('fr-FR', 'plages de', 100)],
    'lake': [('ja-JP', '湖', 2200), ('pl-PL', 'jeziora na', 600)],
    'castle': [('fr-FR', 'chateaux de', 2900), ('pl-PL', 'zamki na', 500)],
    'trail': [('pl-PL', 'szlaki w', 2000), ('en-US', 'hiking in', 1600),
              ('fr-FR', 'randonnee en', 200), ('ja-JP', 'ハイキング', 200),
              ('it-IT', 'trekking in', 150)],
}
for _ft, _adds in _NEW.items():
    _d = FEATURE_DEMAND[_ft]
    for _mkt, _root, _vol in _adds:
        if _mkt not in _d['measured_in']:
            _d['measured_in'].append(_mkt)
        _d['root_' + _mkt.split('-')[0]] = _root
        _d['volume'] = max(_d['volume'], _vol)

# The waterfall family was keyed 'waterfall_it' because Italian was the only market it had been
# measured in. It now has two, so the key is the feature and the markets are the markets, which is
# how every other entry in this table already works. cascate in trentino 100 in it-IT and
# cachoeiras em minas gerais 900 in pt-BR.
FEATURE_DEMAND['waterfall'] = dict(FEATURE_DEMAND.pop('waterfall_it'))
FEATURE_DEMAND['waterfall']['measured_in'] = ['it-IT', 'pt-BR']
FEATURE_DEMAND['waterfall']['root_pt'] = 'cachoeiras em'
FEATURE_DEMAND['waterfall']['volume'] = 900
# The POI classes that count as each feature type
FEATURE_CLASSES = {
    'lake': {'lake'}, 'beach': {'beach'}, 'peak': {'peak'}, 'viewpoint': {'viewpoint'},
    'castle': {'castle', 'fort'}, 'camp_site': {'camp_site', 'caravan_site'},
    'cave': {'cave', 'cave_entrance'}, 'trail': {'trail_route'},
    'waterfall': {'waterfall'}, 'mountain_hut': {'mountain_hut', 'wilderness_hut'},
}

# ---- a region list for a market whose country this is NOT --------------------------------------
# Measured 2026-10-02: andalusien straende 400, toskana straende 300 and bretagne straende 100 are
# all German pages about SPANISH, ITALIAN and FRENCH regions, and andalusien sehenswuerdigkeiten at
# 2,200 beats every domestic German region keyword tested. Until now this file granted exactly one
# market per region, the home market of its country, so every one of those pages was impossible.
#
# Two halves of evidence again, the same two the city families use. Half one is the country by
# language table. Half two must be carried by the REGION itself, and a parent polygon carries its
# own wikipedia tag, whose prefix is a language: a region tagged wikipedia=de:Andalusien has a
# German encyclopedia article, which is evidence German speakers look it up. A proxy for interest,
# never a measured volume, and the row says so.
# One loader in entity_identity, which reads every dated measurement file and merges them.
# This was six copies of the same loop; see DEST_FILES there for why each file stays separate.
DEST_LANG = entity_identity.dest_lang_by_country()
LANG_MKT = entity_identity.LANG_MKT


def markets_for_parent(country, p):
    """Every (market, language, why) this region earns. Home market first."""
    # ONE definition, in entity_identity. This function was copied into five builders and four
    # of them agreed; the fifth rejected destination countries outright, which is why no
    # destination country had ever produced a POI page. The decision lives there now and only
    # the sentence lives here, because the sentence is this family's copy.
    # The BASIS is carried alongside the sentence, and the home-market tests below key on it.
    # They used to key on the reason string being exactly 'home', and generating that string
    # from one place made the comparison silently false: every home-market row would then have
    # been required to carry a locale fact and the ones that legitimately have none would have
    # been dropped. A sentinel that is also display copy is a trap, so the two are separated.
    return [(mkt, lang,
             entity_identity.destination_basis_sentence(country, lang, basis, 'region'),
             basis == 'home')
            for mkt, lang, basis in entity_identity.markets_for_entity(
                country, p, dest_lang=DEST_LANG, marks=entity_identity.marks_for(p))]


# A list needs enough entries to be a list. Three is the floor every other shape in this
# pipeline uses for the same reason: a list of one is not a list, and a list of two is a
# sentence.
MIN_FEATURES = 3
# And the parent has to be a place, not a sliver. Below this a "region" is a boundary artefact.
MIN_PARENT_KM2 = 5.0

# Through the shared loader, which strips the ring before handing a record out. Keeping the
# whole record here, rings and all, OOM-killed this stage at 10,317 MB on 2026-10-06 while the
# only fields it ever reads are geometry, cls, country, id and name.
parents = {}
for _p in entity_identity.iter_parent_records():
    if _p.get('country') and _p.get('id'):
        parents[(_p['country'], _p['id'])] = _p

if not parents:
    print('no parent entities; run scripts/atlas/ingest/osm-parents-run.sh first',
          file=sys.stderr)
    sys.exit(2)
print(f'parent entities loaded: {len(parents):,}', file=sys.stderr)

if not os.path.exists(ASSIGN):
    print(f'no parent assignment at {ASSIGN}; run poi-parent-assign.py first', file=sys.stderr)
    sys.exit(2)

# feature counts per (parent, feature type), and the named examples that prove the list
per = collections.defaultdict(lambda: collections.Counter())
examples = collections.defaultdict(list)
rich = collections.defaultdict(int)
with gzip.open(ASSIGN, 'rt', encoding='utf-8') as fh:
    for line in fh:
        line = line.strip()
        if not line: continue
        try: a = json.loads(line)
        except Exception: continue
        key = (a['country'], a['parent_id'])
        rich[key] += 1
        for ft, classes in FEATURE_CLASSES.items():
            if a['cls'] in classes:
                per[key][ft] += 1
                if a.get('name') and len(examples[(key, ft)]) < 8:
                    examples[(key, ft)].append(a['name'])

# One slug function for the whole pipeline, in the module that owns identity. This file used
# to carry its own, and the copies disagreed on whether a slash becomes a separator and on
# what an empty result should be, which is how one place can get two paths.
slug = entity_identity.slugify

rejects = collections.Counter()
rows = []
for key, counts in sorted(per.items()):
    country, pid = key
    p = parents.get(key)
    if not p:
        rejects['parent_not_in_the_parent_layer'] += 1; continue
    mk = COUNTRY_MKT.get(country)
    mkts = markets_for_parent(country, p)
    if not mkts:
        rejects['no_market_and_no_destination_evidence_for_country'] += 1; continue
    if p['cls'] not in PARENT_OK:
        rejects['parent_class_not_a_place_a_reader_knows'] += 1; continue
    if p.get('geometry') != 'polygon':
        # a point parent cannot ground a containment claim, and containment is the whole
        # basis of this family
        rejects['parent_has_no_polygon_so_containment_is_unprovable'] += 1; continue
    if (p.get('km2') or 0) < MIN_PARENT_KM2:
        rejects['parent_too_small_to_be_a_place'] += 1; continue
    for ft, n in counts.items():
      if n < MIN_FEATURES:
        rejects[f'below_min_features_{ft}'] += 1; continue
      dem = FEATURE_DEMAND.get(ft)
      if not dem:
        rejects[f'feature_has_no_measured_list_demand_{ft}'] += 1; continue
      # One pass per market this region earns. The feature count and the examples are facts about
      # the region and are the same in every language; what differs is the language the page is
      # written in and whether that market has MEASURED demand for this list shape.
      for (market, lang, why, is_home) in mkts:
        # A list page served to a market whose country this is NOT has to say something to that
        # market the home page did not. The facts are computed from the region's own coordinates
        # and that market's origin city, so they differ for every market by construction.
        lf = ([] if is_home
              else entity_identity.locale_facts_for_row(market, dict(p, parent_id=pid)))
        if not is_home and not lf:
            rejects['no_locale_specific_fact_could_be_computed'] += 1; continue
        if market not in dem['measured_in']:
            # the family is proven in another market and not in this one. Recorded, not
            # generated: this is the same rule the localisation gate applies.
            rejects[f'demand_not_measured_in_this_market_{ft}'] += 1; continue
        ex = examples.get((key, ft)) or []
        rows.append({
            'shape': 'outdoor_region_feature', 'country': country, 'market': market,
            'language': lang, 'parent_id': pid, 'parent_name': p['name'],
            'parent_cls': p['cls'], 'parent_km2': p.get('km2'),
            'feature': ft, 'n': n, 'poi_in_parent': rich[key],
            'market_reason': why, 'locale_facts': lf,
            'url': f"/{lang}/outdoors/{slug(ft)}s/{slug(p['name'])}-{slug(pid)}/",
            'attribution': 'containment',
            'examples': ex,
            'uniqueness_reason': (
                f"{n} named {ft}s inside {p['name']}, a {PARENT_OK[p['cls']]}, each attached "
                f"by containment within its polygon and named in OpenStreetMap: a list and a "
                f"count that no single feature page carries"),
            'count_answer': (
                f"There are {n} named {ft}s mapped inside {p['name']} as of the OpenStreetMap "
                f"extract this was built from"),
            'measured_demand': (
                f"{dem.get('root_en') or dem.get('root_de')} pattern measured at "
                f"{dem['volume']:,} a month, difficulty {dem['kd']}, in {market}"),
            'no_superlative': (
                'the page states which and how many, never which is best, because no ranking '
                'methodology is documented'),
        })

with gzip.GzipFile(OUT, 'wb', compresslevel=6, mtime=0) as gz:
    for r in sorted(rows, key=lambda r: (r['country'], r['feature'], r['parent_name'])):
        gz.write((json.dumps(r, ensure_ascii=False) + '\n').encode('utf-8'))

# Two parent polygons can carry one name. Saechsische Schweiz is a protected area AND a national
# park; Arnsberger Wald is a forest and a nature park. Their URLs differ by the OSM id so no page is
# lost, but their titles were identical and a reader could not tell which list they were looking at.
# The class is what separates them and it is a fact rather than a discriminator invented for the
# purpose, so the label carries it wherever the name repeats.
# Two parent polygons can carry one name, and sometimes one CLASS as well. Saechsische Schweiz is
# a protected area twice over under different protection designations, and Arnsberger Wald is a
# forest and a nature park. Three answers in order, each from the data:
#   the class separates them            -> the label carries it
#   the class does not, the size does   -> keep the one holding more features, reject the rest
# Their URLs always differed by the OSM id so no page was ever lost to a collision, but two lists
# titled the same way are two pages a reader cannot tell apart, which is the thing the gate is for.
_pgroup = collections.defaultdict(list)
for _r in rows:
    _pgroup[(_r['language'], _r['feature'], slug(_r['parent_name']))].append(_r)
_qualified, _dropped_dupe = 0, []
for _k, _g in _pgroup.items():
    if len(_g) < 2:
        continue
    _classes = [r['parent_cls'] for r in _g]
    if len(set(_classes)) == len(_g):
        for _r in _g:
            _r['parent_name'] = f"{_r['parent_name']} ({_r['parent_cls'].replace('_', ' ')})"
            _qualified += 1
        continue
    _keep = max(_g, key=lambda r: (r['n'], r.get('parent_km2') or 0))
    for _r in _g:
        if _r is not _keep:
            _dropped_dupe.append(_r)
if _dropped_dupe:
    _ids = {id(r) for r in _dropped_dupe}
    rows = [r for r in rows if id(r) not in _ids]
    rejects['parent_name_and_class_both_repeat_so_it_is_one_place_mapped_twice'] += len(_dropped_dupe)
if _qualified or _dropped_dupe:
    print(f'region lists whose parent name repeats: {_qualified:,} given the class in the label, '
          f'{len(_dropped_dupe):,} dropped as one place mapped twice', file=sys.stderr)

print(f'outdoor candidates: {len(rows):,}', file=sys.stderr)
print(f"  by feature: {dict(collections.Counter(r['feature'] for r in rows))}", file=sys.stderr)
print(f"  by parent class: {dict(collections.Counter(r['parent_cls'] for r in rows))}",
      file=sys.stderr)
print(f"  by market: {dict(collections.Counter(r['market'] for r in rows))}", file=sys.stderr)
print('  rejections, every one counted:', file=sys.stderr)
for k, v in rejects.most_common():
    print(f'    {v:>8,}  {k}', file=sys.stderr)
with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as _fh:
    for _r in rows:
        _fh.write(json.dumps(_r, ensure_ascii=False) + '\n')
os.replace(OUT + '.tmp', OUT)
print(f'\nwritten {OUT} with {len(rows):,} rows', file=sys.stderr)
