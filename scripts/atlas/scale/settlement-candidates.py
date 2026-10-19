#!/usr/bin/env python3
"""A page per Wikidata settlement, under a contract deliberately stricter than the landmarks'.

WHY THIS FAMILY CANNOT INHERIT THE LANDMARK CONTRACT. The class census of 2026-10-19 found
853,657 readable settlements against the 626,746 landmarks already captured, which makes
this the largest reservoir left in the inventory. It is also the one place where every page
would come out of the same sentence. A landmark page varies by construction: a cathedral
states an architect and a style, a dam states a height and an operator, a glacier states an
area and an elevation, and no two classes print the same shape. A settlement states
population, area and elevation and then, usually, nothing. Fifty thousand pages reading
"X is a commune in department Y with a population of N, an area of A and an elevation of E"
are fifty thousand true pages and one page, and that is the city-name swapping this
inventory refuses.

So the universal triple does not earn a page here. It is printed when it is there and it
counts for nothing. A settlement is admitted only when it clears the readership floor AND
one of two things is true about what the page would actually carry:

  EXTRA FACTS   two or more facts BEYOND population, area and elevation: when it was founded
                or first written down, its postal codes, its mayor, its twin towns, its
                highest point, its dialing codes, its official website, what it borders.
                Two of those make the page say something the next village's page does not.

  ATLAS INDEX   three or more entities this inventory ALREADY PAGES standing inside it, by
                Wikidata's own P131 containment and not by distance to a centroid. A page
                that indexes three attested landmarks is an index, whatever its own facts
                say, and it is the page a reader looking for the village actually wants.

Which route a row took is written on the row, and the funnel counts both.

THE CITY POOL IS EXCLUDED THREE WAYS, because a second page for a place this inventory
already pages is the failure this family is most likely to produce. By Wikidata item, from
the 19,594 GeoNames cities whose item is known. By ARTICLE TITLE in the page's own language,
from all three city sitelink captures, because an article title identifies a place within an
edition exactly and covers the cities whose item is not recorded. And by the cross-surface
item exclusion every other builder here uses.

Usage: settlement-candidates.py [--min-extra-facts 2] [--min-atlas-entities 3]
                                [--src DIR] [--out PATH]
Reads  data/atlas/sources/wikidata/settlement/*.jsonl.gz
       data/atlas/sources/wikidata/settlement/_language.jsonl.gz
       data/atlas/sources/wikidata/settlement/_facts-<lang>.jsonl.gz
       data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz, for the index route
       data/atlas/sources/geonames/city-sitelinks.jsonl.gz and the two wikidata ones
Writes data/atlas/sources/wikidata/_settlement-candidates.jsonl.gz
       data/atlas/sources/wikidata/_settlement-funnel.json
"""
import collections, glob, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

SRC = ROOT + 'data/atlas/sources/wikidata/settlement/'
OUT = ROOT + 'data/atlas/sources/wikidata/_settlement-candidates.jsonl.gz'
FUNNEL = ROOT + 'data/atlas/sources/wikidata/_settlement-funnel.json'
LANDMARKS = ROOT + 'data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz'
ISO = ROOT + 'data/atlas/sources/wikidata/country-iso.json'

slug = entity_identity.slugify
LANG_MKT = entity_identity.LANG_MKT
COUNTRY_MKT = entity_identity.COUNTRY_MKT
MKT_OF_LANG = dict(LANG_MKT)
MKT_OF_LANG['zh'] = LANG_MKT.get('zh-Hant')

# Printed when present, and counts for NOTHING toward the bar. This tuple is the whole of
# the difference between this family's contract and the landmark one.
UNIVERSAL = ('population', 'area', 'elevation')

QUANTITY = {'area': ('an area of %s', 'square metre'),
            'elevation': ('%s above sea level', 'metre'),
            'height': ('%s high', 'metre')}
COUNT = {'population': 'a population of %s', 'households': '%s households'}
YEAR = {'inception': 'founded in %s', 'earliest_written_record': 'first written down in %s'}
ATTRIBUTE = {'head_of_government': 'led by %s', 'twinned_with': 'twinned with %s',
             'highest_point': 'its highest point %s', 'named_after': 'named after %s',
             'shares_border_with': 'bordering %s'}
CODES = {'postal_code': 'postal code %s', 'dialing_code': 'dialing code %s',
         'licence_plate_code': 'licence plate code %s'}


# The two measurements a reader states in kilometres once they pass one. Everything
# else here is a height, an elevation, a depth or a diameter, and those stay in metres
# however large they get.
KM_WHEN_LONG = ('length', 'width')


def one(vals):
    return vals[0] if vals and len(vals) == 1 else None


def metres(v, as_km_above=1000):
    """Metres, and kilometres only where a reader would use them.

    The first version converted anything over a kilometre, which put "2.9 km above sea
    level" on a mountain pass. Nobody states an elevation, a height, a depth or a diameter
    in kilometres: Mont Blanc is 4,808 m and the Burj Khalifa is 828 m. A LENGTH or a WIDTH
    over a kilometre is the opposite, so those two pass as_km_above=1000 and everything else
    passes None.
    """
    f = float(v)
    if as_km_above and f >= as_km_above:
        return '%.1f km' % (f / 1000.0)
    return '{:,} m'.format(int(round(f)))


def square_metres(v):
    f = float(v)
    if f >= 1_000_000:
        return '%.1f km2' % (f / 1_000_000.0)
    if f >= 10_000:
        return '%d hectares' % round(f / 10_000.0)
    return '%d m2' % round(f)


def count_str(v):
    return '{:,}'.format(int(round(float(v))))


def year_of(iso_date):
    s = str(iso_date or '')
    neg = s.startswith('-')
    head = s.lstrip('-').split('-', 1)[0]
    if not head.isdigit():
        return None
    y = int(head)
    if y == 0 or y > 2100:
        return None
    return '%d BC' % y if neg else str(y)


def printable(rec):
    """(universal phrases, extra phrases). The split IS the contract."""
    uni, extra = [], []
    f = rec.get('facts') or {}
    items = rec.get('items') or {}
    for k, (phrase, unit) in QUANTITY.items():
        vals = [v for v in (f.get(k) or []) if v.get('unit') == unit]
        v = one(vals)
        if v is None:
            continue
        txt = (square_metres(v['amount']) if unit == 'square metre'
               else metres(v['amount'], 1000 if k in KM_WHEN_LONG else None))
        (uni if k in UNIVERSAL else extra).append(phrase % txt)
    for k, phrase in COUNT.items():
        v = one(f.get(k) or [])
        if v is None:
            continue
        try:
            (uni if k in UNIVERSAL else extra).append(phrase % count_str(v['count']))
        except (TypeError, ValueError):
            pass
    for k, phrase in YEAR.items():
        v = one(f.get(k) or [])
        if v is None:
            continue
        y = year_of(v.get('date'))
        if y:
            extra.append(phrase % y)
    for k, phrase in ATTRIBUTE.items():
        names = [x['label'] for x in (items.get(k) or [])[:3] if x.get('label')]
        if names:
            extra.append(phrase % ' and '.join(names))
    for k, phrase in CODES.items():
        vals = sorted({x['text'] for x in (f.get(k) or []) if x.get('text')})
        if vals:
            extra.append(phrase % ', '.join(vals[:4]))
    if one(f.get('website') or []):
        extra.append('an official website')
    return uni, extra


def city_pool():
    """Everything the city layer already pages: items, and (language, article title) pairs.

    The title half is not a convenience. Only 19,594 of the GeoNames cities in the pool
    carry a Wikidata item in this project's captures, while 66,000 rows across the three
    sitelink files carry article titles. An article title identifies a place within an
    edition exactly, so the title match covers the cities the item match cannot see.
    """
    qids, titles = set(), set()
    for rel in ('data/atlas/sources/geonames/city-sitelinks.jsonl.gz',
                'data/atlas/sources/wikidata/city-sitelinks-from-wikidata.jsonl.gz',
                'data/atlas/sources/wikidata/city-sitelinks-via-municipality.jsonl.gz'):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                d = json.loads(l)
                if d.get('qid'):
                    qids.add(d['qid'])
                for lg, t in (d.get('wikipedia_languages') or {}).items():
                    if t:
                        titles.add((lg, t))
        except (EOFError, OSError, FileNotFoundError):
            pass
    return qids, titles


def other_surfaces():
    seen = set()
    for rel in ('data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz',
                'data/atlas/sources/osm-trails/_trail-candidates.jsonl.gz',
                'data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz',
                'data/atlas/sources/wikidata/_water-feature-candidates.jsonl.gz',
                'data/atlas/sources/heritage/_listed-candidates.jsonl.gz',
                'data/atlas/sources/wikidata/_candidates.jsonl.gz',
                'data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz'):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                d = json.loads(l)
                q = d.get('qid') or (d.get('entity_id') if str(d.get('entity_id', ''))
                                     .startswith('Q') else None)
                if q:
                    seen.add(q)
        except (EOFError, OSError, FileNotFoundError):
            pass
    return seen


def atlas_entities_by_parent():
    """How many admitted Atlas pages stand inside each settlement, by P131 containment.

    Containment Wikidata states, never distance to a centroid: the outdoor layer learned
    that the hard way and the rule is the same here.
    """
    per = collections.Counter()
    names = {}
    try:
        for l in gzip.open(LANDMARKS, 'rt', encoding='utf-8'):
            d = json.loads(l)
            if d.get('parent_id'):
                per[d['parent_id']] += 1
                names.setdefault(d['parent_id'], []).append(d['entity_name'])
    except (EOFError, OSError, FileNotFoundError):
        pass
    return per, names


def strip_disambiguator(title):
    t = (title or '').strip()
    if t.endswith(')') and ' (' in t:
        head = t[:t.rindex(' (')].strip()
        if len(head) >= 3:
            return head
    return t


def country_names(iso_doc):
    """qid -> country name, with an ISO fallback for the items the label map misses.

    country-iso.json maps four items to a code by exception, because the code is stated on
    a different item: P297 NL is on the Kingdom of the Netherlands and Q55 is its European
    constituent country. The LABEL map is keyed on the items that state P297, so Q55 is not
    in it, and a Dutch heritage row came out reading "in Utrecht, NL". Resolving the code
    back to the name of whichever item does carry it fixes the four without inventing
    anything.
    """
    labels = dict(iso_doc.get('labels') or {})
    iso = iso_doc.get('iso') or {}
    by_code = {}
    for q, code in iso.items():
        if q in labels:
            by_code.setdefault(code, labels[q])
    return labels, by_code


def place_clause(parent_label, country_label):
    """"in Utrecht, Netherlands", or just "in the United Kingdom" when they are the same.

    A British Overseas Territory states the United Kingdom as both its containing area and
    its country, and the first draft printed "in United Kingdom, United Kingdom".
    """
    if (parent_label or '').strip().lower() == (country_label or '').strip().lower():
        return 'in %s' % parent_label
    return 'in %s, %s' % (parent_label, country_label)


def article(word):
    return 'an' if (word or ' ')[0].lower() in 'aeiou' else 'a'


def class_labels():
    """{slug: the English label Wikidata gives the class}, read from the capture's own list.

    The slug is for URLs and the label is for sentences, and using the slug for both put
    "is a municipality without town privileges in germany in Verbandsgemeinde
    Altenkirchen-Flammersfeld, Germany" on a shipped row: the country lowercased by the
    slug rule, and then stated again by the page.
    """
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'settlement_capture', ROOT + 'scripts/atlas/ingest/wikidata-settlement-capture.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return {slugname: label for _q, slugname, label, _n in m.CLASSES}


def class_phrase(label, country_name):
    """The class as a page says it, with the country taken off when the page states it.

    Wikidata names a third of these classes after their country: "village of Poland",
    "town in the United States", "municipality without town privileges in Germany". The
    page already says which country it is in, so the tail is dropped and "Canaan, New York
    is a town in the united states in Columbia County, United States" becomes "a town in
    Columbia County, United States". A class whose tail names a DIFFERENT country than the
    row keeps it, because then the tail is saying something the row is not.
    """
    for sep in (' in ', ' of ', ' in the ', ' of the '):
        if sep in label:
            head, _, tail = label.rpartition(sep)
            t = tail.lower().lstrip('the ').strip()
            c = (country_name or '').lower().lstrip('the ').strip()
            if head and t and (t == c or (c and (t in c or c in t))):
                return head
    return label


def main():
    args = sys.argv[1:]
    src = args[args.index('--src') + 1] if '--src' in args else SRC
    if not src.endswith('/'):
        src += '/'
    out_path = args[args.index('--out') + 1] if '--out' in args else OUT
    min_extra = (int(args[args.index('--min-extra-facts') + 1])
                 if '--min-extra-facts' in args else 2)
    min_atlas = (int(args[args.index('--min-atlas-entities') + 1])
                 if '--min-atlas-entities' in args else 3)

    iso_doc = json.load(open(ISO))
    iso = iso_doc['iso']
    country_name, country_by_code = country_names(iso_doc)

    chosen = {}
    for l in gzip.open(src + '_language.jsonl.gz', 'rt', encoding='utf-8'):
        d = json.loads(l)
        chosen[d['qid']] = d
    facts = {}
    for fp in sorted(glob.glob(src + '_facts-*.jsonl.gz')):
        for l in gzip.open(fp, 'rt', encoding='utf-8'):
            d = json.loads(l)
            facts[d['qid']] = d

    size, ent, folded = {}, {}, collections.Counter()
    for f in sorted(glob.glob(src + '*.jsonl.gz')):
        if os.path.basename(f).startswith('_'):
            continue
        rows = [json.loads(l) for l in gzip.open(f, 'rt', encoding='utf-8') if l.strip()]
        size[os.path.basename(f)[:-9]] = len(rows)
        for d in rows:
            # An unread settlement is kept as its id and its class and nothing else: the
            # readership test is the second gate in the loop below and the two gates before
            # it read neither the titles nor the coordinates, so carrying eleven article
            # titles for 450,000 items that fail it is memory spent on a rejection line.
            if d['qid'] not in chosen:
                d = {'qid': d['qid'], 'cls': d['cls'], 'titles': {}}
            prev = ent.get(d['qid'])
            if prev is None:
                ent[d['qid']] = d
                continue
            a, b = prev['cls'], d['cls']
            keep = min((size.get(a, 10 ** 9), a), (size.get(b, 10 ** 9), b))[1]
            folded[(a if keep == b else b)] += 1
            ent[d['qid']] = d if keep == b else prev

    labels = class_labels()
    city_qids, city_titles = city_pool()
    paged = other_surfaces()
    inside, inside_names = atlas_entities_by_parent()
    print('%d classes, %d distinct settlements, %d second classes folded; city pool %d items '
          'and %d titles; %d items paged elsewhere; %d areas hold an admitted Atlas page'
          % (len(size), len(ent), sum(folded.values()), len(city_qids), len(city_titles),
             len(paged), len(inside)), file=sys.stderr)

    rej = collections.Counter()
    rows = []
    by_route = collections.Counter()
    by_cls = collections.Counter()
    by_lang = collections.Counter()
    by_cc = collections.Counter()
    by_market = collections.Counter()
    by_side = collections.Counter()
    sig_seen = {}
    read_ok = fact_ok = index_ok = 0

    for qid, e in sorted(ent.items()):
        if qid in city_qids or qid in paged:
            rej['this_place_already_has_a_page_on_another_surface'] += 1
            continue
        ch = chosen.get(qid)
        if ch is None:
            rej['no_edition_reads_ten_a_month_the_lowest_reading_that_exists'] += 1
            continue
        lang = ch['lang']
        title = e['titles'].get(lang)
        if not title:
            rej['the_chosen_edition_has_no_title_in_this_capture'] += 1
            continue
        if (lang, title) in city_titles:
            rej['the_city_layer_already_pages_this_article'] += 1
            continue
        if not ch['clears_floor']:
            # Condition one of the contract, and it is a floor rather than a route: a
            # settlement nobody looks up is not rescued by having a mayor on record.
            rej['reads_below_the_calibrated_floor_for_its_language'] += 1
            continue
        read_ok += 1
        rec = facts.get(qid)
        if rec is None:
            rej['no_fact_record_was_fetched_for_this_item'] += 1
            continue
        items = rec.get('items') or {}
        cq = (items.get('country') or [{}])[0].get('qid')
        cc = iso.get(cq or '')
        if not cc:
            rej['no_country_stated_or_its_qid_carries_no_iso_code'] += 1
            continue
        name = strip_disambiguator(title)
        parents = [p for p in (items.get('located_in') or [])
                   if (p.get('label') or '').strip().lower() != name.strip().lower()]
        if not parents:
            rej['wikidata_states_no_containing_area_other_than_the_place_itself'] += 1
            continue
        uni, extra = printable(rec)
        n_inside = inside.get(qid, 0)
        if len(extra) >= min_extra:
            route = 'EXTRA_FACTS'
            fact_ok += 1
        elif n_inside >= min_atlas:
            route = 'ATLAS_INDEX'
            index_ok += 1
        else:
            rej['fewer_than_%d_facts_beyond_population_area_and_elevation_and_fewer_than_'
                '%d_atlas_pages_inside_it' % (min_extra, min_atlas)] += 1
            continue

        home = COUNTRY_MKT.get(cc)
        if home and home[1] == lang:
            mkt, side = home[0], 'home'
        else:
            mkt, side = MKT_OF_LANG[lang], 'destination'
        parent = parents[0]
        cname = country_name.get(cq) or country_by_code.get(cc) or cc
        cls_words = class_phrase(labels.get(e['cls'], e['cls'].replace('_', ' ')), cname)
        shown = uni + extra
        # Content only, and the settlement's own name deliberately left out: a signature
        # that contains the thing being compared can never report a duplicate, which is how
        # 8,270 colliding climate pages all carried a LOW duplicate risk.
        sig = '|'.join([e['cls'], parent['qid'], str(n_inside)] + sorted(shown))
        inside_clause = ('' if not n_inside else
                         ' This inventory pages %d place%s standing in it%s.'
                         % (n_inside, '' if n_inside == 1 else 's',
                            ': ' + ', '.join(inside_names.get(qid, [])[:4])
                            if inside_names.get(qid) else ''))
        if sig in sig_seen:
            rej['another_settlement_in_the_same_area_states_exactly_the_same_things'] += 1
            continue
        sig_seen[sig] = qid
        basis = ('%d search-referred readers a month for its %s article against a floor of '
                 '%d, and %s'
                 % (ch['reads'], lang, ch['floor'],
                    '%d facts beyond population, area and elevation (%s)'
                    % (len(extra), ', '.join(extra)) if route == 'EXTRA_FACTS' else
                    '%d places this inventory already pages standing inside it (%s)'
                    % (n_inside, ', '.join(inside_names.get(qid, [])[:4]))))
        reason = ('%s is %s %s %s. %s%s Admitted on %s: %s.'
                  % (name, article(cls_words), cls_words,
                     place_clause(parent['label'], cname),
                     ('Wikidata states %s.' % ', '.join(shown)) if shown else '',
                     inside_clause, route.lower().replace('_', ' '), basis))
        rows.append({
            'individual_page_basis': basis,
            'shape': 'settlement_entity',
            'source': 'wikidata_settlement',
            'country': cc, 'market': mkt, 'language': lang, 'side': side,
            'cls': e['cls'], 'entity_id': qid, 'entity_name': name,
            'n': 1, 'enriched': len(shown),
            # /settlements/ and not /places/. The places namespace is the POI
            # aggregation's, 188,234 rows of "restaurants in X" and "pharmacies in Y", and
            # putting a village at /places/village/ would read as one of those. The
            # inventory's city pages live there too, and this family exists precisely
            # because these are the places that are NOT those.
            'url': '/%s/settlements/%s/%s-%s/' % (lang, e['cls'].replace('_', '-'),
                                                  slug(name), qid.lower()),
            'parent_id': parent['qid'], 'parent_name': parent['label'],
            'parent_cls': 'administrative area',
            'qid': qid, 'wikipedia': '%s:%s' % (lang, title),
            'local_names': e['titles'],
            'facts': shown,
            'class_label': cls_words,
            'universal_facts': uni,
            'facts_beyond_the_universal_triple': extra,
            'atlas_pages_inside_it': n_inside,
            'admission_route': route,
            # Carried onto the row because the index builder groups these rows and has
            # no other way to say where the group is. One measured coordinate, written
            # where every reader of the row can find it.
            'lat': e.get('lat'), 'lon': e.get('lon'),
            # THE LOCALE FACT, which is the whole of what makes a page about a place in
            # another country a page for THIS market rather than a translation of one.
            # 68,216 of 186,121 destination rows carried none, whole families at a time,
            # because the manifest computes it only for its own family-by-entity rows and
            # reads an aggregated row's own field - which no Wikidata builder was setting.
            # The coordinate it needs has been in every capture from the first band walk.
            'locale_facts': entity_identity.locale_facts_for_row(
                mkt, {'lat': e.get('lat'), 'lon': e.get('lon'), 'city_id': None,
                     'country': cc}) if side == 'destination' else [],
            'attribution': 'wikidata_cc0',
            'search_readership': ch['reads'],
            'search_readership_floor': ch['floor'],
            'data_signature': sig,
            'uniqueness_reason': reason,
            'no_superlative': True,
        })
        by_route[route] += 1
        by_cls[e['cls']] += 1
        by_lang[lang] += 1
        by_cc[cc] += 1
        by_market[mkt] += 1
        by_side[side] += 1

    tmp = out_path + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(tmp, out_path)

    json.dump({
        'built_on': '2026-10-19',
        'contract': ('clears the measured readership floor in its chosen language, AND '
                     'either states at least %d facts beyond population, area and '
                     'elevation, or already contains at least %d admitted Atlas pages by '
                     'Wikidata P131 containment' % (min_extra, min_atlas)),
        'classes_read': len(size),
        'raw_settlement_supply_captured': sum(size.values()),
        'distinct_after_folding_second_classes': len(ent),
        'second_classes_folded_away': dict(folded.most_common(20)),
        'readership_qualified': read_ok,
        'extra_fact_qualified': fact_ok,
        'atlas_index_qualified': index_ok,
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'by_admission_route': dict(by_route),
        'by_side': dict(by_side),
        'by_market': dict(by_market.most_common()),
        'by_class': dict(by_cls.most_common(30)),
        'by_language': dict(by_lang.most_common()),
        'by_country': dict(by_cc.most_common(40)),
        'city_pool_items_excluded': len(city_qids),
        'city_pool_titles_excluded': len(city_titles),
        'attribution': 'Wikidata CC0 1.0; Wikimedia clickstream CC0 1.0; GeoNames CC BY 4.0',
    }, open(FUNNEL, 'w'), indent=1, ensure_ascii=False)
    for k, v in rej.most_common():
        print('%-74s %8d' % (k, v), file=sys.stderr)
    print('rows emitted %d  %s' % (len(rows), dict(by_route)), file=sys.stderr)


if __name__ == '__main__':
    main()
