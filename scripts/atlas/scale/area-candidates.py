#!/usr/bin/env python3
"""A page per administrative area that this inventory can actually fill.

WHAT AN AREA PAGE IS FOR, AND WHEN IT IS NOT WORTH ONE. A canton, an arrondissement, a
powiat or a district is a container. Nobody visits one. The only reason to build a page
about it is that it ANSWERS A QUESTION ABOUT WHAT IS IN IT, and this inventory can answer
that only where it already pages the things inside. So the contract is the strictest here of
any family:

  READERSHIP   the area's article clears the calibrated floor in its chosen language, as
               everywhere else. An area nobody looks up is not rescued by being full.
  CHILDREN     at least five entities this inventory ALREADY PAGES sit inside it, by
               Wikidata's P131 chain within two levels. Never by distance.
  SUBSTANCE    at least two facts beyond population, area and elevation, the same triple the
               settlement family refuses to count. A page with a name, a population and an
               area is the generic administrative page this family exists not to build.

All three, not one of three. The settlement family takes two routes because a village can
earn a page either by having something on record or by having an inventory around it; an
area has to have both, because without the children the page is a definition and without the
facts it is a list with a title.

WHAT COUNTS AS ADMINISTRATIVE is read from Wikidata rather than from the name. Every class
in the containment chain was tested for being a subclass of first, second or third-level
administrative country subdivision, or of administrative territorial entity, and 368 of the
top 400 are. That test does NOT separate a container from a settlement, because in Wikidata
a French commune is both, and that is a fact about the ontology rather than a defect: the
separation that matters is handled by excluding every item another surface already pages, so
a commune the settlement layer built is gone before this file sees it.

A COUNTRY IS NOT AN AREA HERE. Hungary reached the candidate list on the first pass because
the class label test looked for "country" at the start of a label and Wikidata's first P31
for Hungary is not that. The rule is now structural: an item with no stated P131 is not
inside anything, and nothing that is not inside anything gets a page from this file.

A SECOND DIRECTORY, THE SAME CONTRACT. --src points this at any capture directory that
carries its own _language, _facts-*, _class-qids.json and _class-test.json, which is how the
class-census tail is built: 758 tail classes sit at a named administrative level, and they
answer to this file's three tests rather than the landmark file's two. Only the paths move.
The level test is the one thing that had to get finer to make that safe - see
wikidata-class-level-test.py, where testing against the generic administrative root called
airbases, barracks and observation towers administrative areas.

Usage: area-candidates.py [--min-children 5] [--min-extra-facts 2] [--src DIR] [--tag NAME]
Reads  <DIR>/items.jsonl.gz (default admin/) and its _language and _facts files
       data/atlas/sources/wikidata/landmark/_containment-chain.jsonl.gz
       data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz
       data/atlas/sources/wikidata/_settlement-candidates.jsonl.gz
Writes data/atlas/sources/wikidata/_area-candidates.jsonl.gz
       data/atlas/sources/wikidata/_area-funnel.json
"""
import collections, glob, gzip, importlib.util, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

_spec = importlib.util.spec_from_file_location(
    'settlement_candidates', ROOT + 'scripts/atlas/scale/settlement-candidates.py')
SE = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(SE)

SRC = ROOT + 'data/atlas/sources/wikidata/admin/'
CHAIN = ROOT + 'data/atlas/sources/wikidata/landmark/_containment-chain.jsonl.gz'
CLASSQ = ROOT + 'data/atlas/sources/wikidata/admin/_class-qids.json'
ADMINQ = ROOT + 'data/atlas/sources/wikidata/admin/_class-test.json'
OUT = ROOT + 'data/atlas/sources/wikidata/_area-candidates.jsonl.gz'
FUNNEL = ROOT + 'data/atlas/sources/wikidata/_area-funnel.json'
ISO = ROOT + 'data/atlas/sources/wikidata/country-iso.json'

slug = entity_identity.slugify
COUNTRY_MKT = entity_identity.COUNTRY_MKT
MKT_OF_LANG = dict(entity_identity.LANG_MKT)
MKT_OF_LANG['zh'] = entity_identity.LANG_MKT.get('zh-Hant')


def load_chain():
    out = {}
    for l in gzip.open(CHAIN, 'rt', encoding='utf-8'):
        d = json.loads(l)
        out[d['qid']] = d
    return out


def children(chain):
    """How many admitted pages sit inside each area, by P131 within two levels."""
    def anc(q, lvl):
        f = {q}
        for _ in range(lvl):
            f = {p for x in f for p in (chain.get(x) or {}).get('parents') or ()}
            if not f:
                break
        return f
    per = collections.Counter()
    names = {}
    for rel in ('data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz',
                'data/atlas/sources/wikidata/_settlement-candidates.jsonl.gz'):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                d = json.loads(l)
                p = d.get('parent_id')
                if not p:
                    continue
                for tgt in [p] + [a for lvl in (1, 2) for a in anc(p, lvl)]:
                    per[tgt] += 1
                    if len(names.setdefault(tgt, [])) < 6:
                        names[tgt].append(d['entity_name'])
        except (EOFError, OSError, FileNotFoundError):
            pass
    return per, names


def main():
    args = sys.argv[1:]
    min_kids = int(args[args.index('--min-children') + 1]) if '--min-children' in args else 5
    min_extra = (int(args[args.index('--min-extra-facts') + 1])
                 if '--min-extra-facts' in args else 2)
    src = args[args.index('--src') + 1] if '--src' in args else SRC
    if not src.endswith('/'):
        src += '/'
    tag = (args[args.index('--tag') + 1] if '--tag' in args
           else ('' if os.path.abspath(src) == os.path.abspath(SRC)
                 else os.path.basename(src.rstrip('/'))))
    # A second contract over a directory that already serves another one, so the sidecars
    # carry this contract's name: landmark/_class-*.json would collide with nothing today
    # and with the landmark capture's own bookkeeping tomorrow.
    classq = src + '_area-class-qids.json' if tag else CLASSQ
    adminq = src + '_area-class-test.json' if tag else ADMINQ
    clslab = src + '_area-class-labels.json'
    out = (ROOT + 'data/atlas/sources/wikidata/_area-%s-candidates.jsonl.gz' % tag
           if tag else OUT)
    funnel = (ROOT + 'data/atlas/sources/wikidata/_area-%s-funnel.json' % tag
              if tag else FUNNEL)

    iso_doc = json.load(open(ISO))
    iso = iso_doc['iso']
    country_name, country_by_code = SE.country_names(iso_doc)
    chain = load_chain()
    admin_classes = set(json.load(open(adminq))['admin_classes'])
    clsq = json.load(open(classq)) if os.path.exists(classq) else {}
    cls_label_of = json.load(open(clslab)) if os.path.exists(clslab) else {}

    # Only items whose class is in the index are read. Everything else would be refused by
    # the class test two lines into the loop anyway, and the directory this runs over the
    # second time holds 1.3 million rows: reading them all to reject them costs several
    # gigabytes of memory and answers nothing.
    items, outside = {}, 0
    for f in sorted(glob.glob(src + '*.jsonl.gz')):
        if os.path.basename(f).startswith('_'):
            continue
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            d = json.loads(l)
            if clsq and d['qid'] not in clsq:
                outside += 1
                continue
            items[d['qid']] = d
    chosen = {}
    for l in gzip.open(src + '_language.jsonl.gz', 'rt', encoding='utf-8'):
        d = json.loads(l)
        chosen[d['qid']] = d
    facts = {}
    for fp in sorted(glob.glob(src + '_facts-*.jsonl.gz')):
        for l in gzip.open(fp, 'rt', encoding='utf-8'):
            d = json.loads(l)
            if d['qid'] in items:
                facts[d['qid']] = d

    city_qids, city_titles = SE.city_pool()
    paged = SE.other_surfaces()
    for rel in ('data/atlas/sources/wikidata/_settlement-candidates.jsonl.gz',):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                paged.add(json.loads(l)['qid'])
        except (EOFError, OSError, FileNotFoundError):
            pass
    kids, kid_names = children(chain)
    print('%d items captured, %d with a chosen language, %d with facts; %d already paged'
          % (len(items), len(chosen), len(facts), len(paged)), file=sys.stderr)

    rej = collections.Counter()
    rows, sig_seen = [], {}
    by_cls = collections.Counter()
    by_lang = collections.Counter()
    by_cc = collections.Counter()
    by_market = collections.Counter()
    by_side = collections.Counter()
    read_ok = kids_ok = 0

    for qid, it in sorted(items.items()):
        node = chain.get(qid) or {}
        # The containment chain was built from the parents of this inventory's landmarks, so
        # a tail area nothing was yet known to be inside is absent from it. That is not
        # evidence it is inside nothing: its own P131 is in the fact record, and the
        # structural test asks for a stated containment from either.
        rec0 = facts.get(qid) or {}
        stated = (node.get('parents')
                  or [p.get('qid') for p in
                      ((rec0.get('items') or {}).get('located_in') or []) if p.get('qid')])
        if not stated:
            rej['states_no_containing_area_so_it_is_not_inside_anything'] += 1
            continue
        if not any(c in admin_classes for c in clsq.get(qid, [])):
            rej['its_class_is_not_an_administrative_subdivision_of_any_level'] += 1
            continue
        if qid in paged or qid in city_qids:
            rej['this_area_already_has_a_page_on_another_surface'] += 1
            continue
        ch = chosen.get(qid)
        if ch is None:
            rej['no_edition_reads_ten_a_month_the_lowest_reading_that_exists'] += 1
            continue
        lang = ch['lang']
        title = (it.get('titles') or {}).get(lang)
        if not title:
            rej['the_chosen_edition_has_no_title_in_this_capture'] += 1
            continue
        if (lang, title) in city_titles:
            rej['the_city_layer_already_pages_this_article'] += 1
            continue
        if not ch['clears_floor']:
            rej['reads_below_the_calibrated_floor_for_its_language'] += 1
            continue
        read_ok += 1
        n_kids = kids.get(qid, 0)
        if n_kids < min_kids:
            rej['fewer_than_%d_pages_this_inventory_builds_sit_inside_it' % min_kids] += 1
            continue
        kids_ok += 1
        rec = facts.get(qid)
        if rec is None:
            rej['no_fact_record_was_fetched_for_this_item'] += 1
            continue
        fitems = rec.get('items') or {}
        cq = (fitems.get('country') or [{}])[0].get('qid')
        cc = iso.get(cq or '')
        if not cc:
            rej['no_country_stated_or_its_qid_carries_no_iso_code'] += 1
            continue
        name = SE.strip_disambiguator(title)
        parents = [p for p in (fitems.get('located_in') or [])
                   if (p.get('label') or '').strip().lower() != name.strip().lower()]
        if not parents:
            rej['wikidata_states_no_containing_area_other_than_the_area_itself'] += 1
            continue
        uni, extra = SE.printable(rec)
        if len(extra) < min_extra:
            rej['fewer_than_%d_facts_beyond_population_area_and_elevation' % min_extra] += 1
            continue

        home = COUNTRY_MKT.get(cc)
        if home and home[1] == lang:
            mkt, side = home[0], 'home'
        else:
            mkt, side = MKT_OF_LANG[lang], 'destination'
        parent = parents[0]
        cname = country_name.get(cq) or country_by_code.get(cc) or cc
        cls_label = (node.get('cls')
                     or next((cls_label_of[c] for c in clsq.get(qid, [])
                              if c in cls_label_of), None)
                     or 'administrative area')
        cls_words = SE.class_phrase(cls_label, cname)
        cls_slug = slug(cls_label) or 'area'
        shown = uni + extra
        sig = '|'.join([cls_slug, parent['qid'], str(n_kids)] + sorted(shown))
        if sig in sig_seen:
            rej['another_area_in_the_same_parent_states_exactly_the_same_things'] += 1
            continue
        sig_seen[sig] = qid
        basis = ('%d search-referred readers a month for its %s article against a floor of '
                 '%d, %d pages this inventory already builds standing inside it, and %d '
                 'facts beyond population, area and elevation (%s)'
                 % (ch['reads'], lang, ch['floor'], n_kids, len(extra), ', '.join(extra)))
        reason = ('%s is %s %s %s. Wikidata states %s. This inventory pages %d '
                  'place%s inside it, among them %s. Admitted on all three tests: %s.'
                  % (name, SE.article(cls_words), cls_words,
                     SE.place_clause(parent['label'], cname),
                     ', '.join(shown) if shown else 'nothing beyond its name',
                     n_kids, '' if n_kids == 1 else 's',
                     ', '.join(kid_names.get(qid, [])[:4]), basis))
        rows.append({
            'individual_page_basis': basis,
            'shape': 'area_entity', 'source': 'wikidata_area',
            'country': cc, 'market': mkt, 'language': lang, 'side': side,
            'cls': cls_slug, 'class_label': cls_words,
            'entity_id': qid, 'entity_name': name,
            'n': n_kids, 'enriched': len(shown),
            'url': '/%s/admin/%s/%s-%s/' % (lang, cls_slug.replace('_', '-'),
                                            slug(name), qid.lower()),
            'parent_id': parent['qid'], 'parent_name': parent['label'],
            'parent_cls': 'administrative area',
            'qid': qid, 'wikipedia': '%s:%s' % (lang, title),
            'local_names': it.get('titles') or {},
            'facts': shown, 'facts_beyond_the_universal_triple': extra,
            'pages_inside_it': n_kids, 'examples_inside_it': kid_names.get(qid, [])[:6],
            'attribution': 'wikidata_cc0',
            'search_readership': ch['reads'], 'search_readership_floor': ch['floor'],
            'data_signature': sig, 'uniqueness_reason': reason, 'no_superlative': True,
        })
        by_cls[cls_slug] += 1
        by_lang[lang] += 1
        by_cc[cc] += 1
        by_market[mkt] += 1
        by_side[side] += 1

    tmp = out + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(tmp, out)
    json.dump({
        'built_on': '2026-10-19',
        'contract': ('all three of: clears the readership floor in its chosen language; at '
                     'least %d pages this inventory already builds sit inside it by P131 '
                     'within two levels; at least %d facts beyond population, area and '
                     'elevation' % (min_kids, min_extra)),
        'source_directory': os.path.relpath(src, ROOT),
        'raw_supply_asked': len(items),
        'items_in_the_directory_outside_the_admin_class_index': outside,
        'readership_qualified': read_ok,
        'child_qualified': kids_ok,
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'by_side': dict(by_side), 'by_market': dict(by_market.most_common()),
        'by_class': dict(by_cls.most_common(30)),
        'by_language': dict(by_lang.most_common()),
        'by_country': dict(by_cc.most_common(40)),
        'attribution': 'Wikidata CC0 1.0; Wikimedia clickstream CC0 1.0',
    }, open(funnel, 'w'), indent=1, ensure_ascii=False)
    for k, v in rej.most_common():
        print('%-70s %8d' % (k, v), file=sys.stderr)
    print('rows emitted %d' % len(rows), file=sys.stderr)


if __name__ == '__main__':
    main()
