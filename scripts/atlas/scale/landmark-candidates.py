#!/usr/bin/env python3
"""A page per Wikidata landmark, admitted on measured demand OR on measured substance.

WHAT IS NEW HERE, AND IT IS NOT A RELAXED GATE.

Every entity family this inventory has built admits a row on one test: the entity's article is
read, in the page's language, at or above a floor calibrated on the features already
published. That test is a good one and it stays. It also has a shape that no amount of data
can get past: an entity read by twenty people a month in German is refused however much
Wikidata states about it, and the refusal is recorded as "readership below the calibrated
entity floor" - 12,016 of them on the water layer, 9,009 on the heritage layer.

So there are TWO routes in, and a row says which one it took:

  DEMAND   the article's measured search-referred readership in the page language is at or
           above the floor in 1M-ENTITY-SEARCH-DEMAND-FLOOR.json. Unchanged.

  UTILITY  the article is read at all - at or above ten a month, which is the Wikimedia
           clickstream's own privacy floor and therefore the lowest reading that EXISTS as a
           measurement rather than as an absence - AND the entity carries materially more
           substance than the pages admitted on demand alone do. "Materially more" is not a
           number this file chose: it is the 75th percentile of the printable-fact count among
           the rows THIS RUN admitted on demand, computed in a first pass and applied in a
           second, with at least one of those facts a measured quantity. A utility row is
           therefore, by construction, in the top quarter of this layer for substance.

The two routes answer the two halves of "a page can qualify through real demand or real
utility". Neither admits an entity that is unread, and neither admits an entity that has
nothing to say: a row still needs a parent, a country and two printable facts before either
route is even considered.

WHAT COUNTS AS A PRINTABLE FACT, which is the family's substance contract:

  a QUANTITY whose unit Wikidata states and which this file expects for that property, with
  exactly one distinct value. Three stated heights for the Eiffel Tower is an ambiguity, not
  a fact, and the page says nothing rather than picking one.
  a COUNT, dimensionless by definition, with exactly one distinct value.
  a YEAR, taken from a date and printed as a year only, because Wikidata stores a precision
  beside a date and "1 January 1850" for a value precise to the year is an invented day.
  an ATTRIBUTE Wikidata names: the architect, the architectural style, the operator, the
  material, the heritage listing. Asked for by label, never printed as an item id.
  an official WEBSITE, where exactly one is stated.

ONE PAGE PER ENTITY, IN ONE LANGUAGE. An entity with articles in nine editions is one page,
written in the single language whose measured readership is highest among those that clear a
route. Ten language variants of one landmark would be the translation multiplication this
inventory refuses, and the funnel counts the languages NOT taken so the cost is visible.

THE FLOOR IS APPLIED TO DESTINATION-SIDE ROWS TOO, and that is a deliberate departure from
the water layer, which refused the destination side for want of a calibrated floor. The
clickstream reading is the same measurement wherever the entity stands: twenty-five German
search-referred readers for a lake in Bavaria and twenty-five for a lake in Sumatra are both
twenty-five German speakers who looked the place up. The floor's reference class is a
readership distribution in a language, not a geography, so comparing a foreign entity's
reading against it compares like with like on the thing being measured. For a company that
sells travel connectivity the foreign entity is if anything the more relevant of the two. The
funnel reports the home and destination split so this can be reversed on one number if the
judgement is thought wrong.

Usage: landmark-candidates.py [--facts GLOB] [--out PATH]
Reads  data/atlas/sources/wikidata/landmark/*.jsonl.gz
       data/atlas/sources/wikidata/landmark/_language.jsonl.gz, the page language per item
       data/atlas/sources/wikidata/landmark/_facts-<lang>.jsonl.gz, one per page language
       data/atlas/sources/wikidata/country-iso.json
       reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json
       every candidate file that already pages a Wikidata item
Writes data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz
       data/atlas/sources/wikidata/_landmark-funnel.json
"""
import collections, glob, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

SRC = ROOT + 'data/atlas/sources/wikidata/landmark/'
OUT = ROOT + 'data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz'
FUNNEL = ROOT + 'data/atlas/sources/wikidata/_landmark-funnel.json'
FACTS_GLOB = SRC + '_facts-*.jsonl.gz'
CHOSEN = SRC + '_language.jsonl.gz'
FLOORS = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json'
ISO = ROOT + 'data/atlas/sources/wikidata/country-iso.json'

slug = entity_identity.slugify
LANG_MKT = entity_identity.LANG_MKT
COUNTRY_MKT = entity_identity.COUNTRY_MKT
# The clickstream calls the Chinese edition zh; the market model calls its language zh-Hant.
MKT_OF_LANG = dict(LANG_MKT)
MKT_OF_LANG['zh'] = LANG_MKT.get('zh-Hant')

# The lowest reading the Wikimedia clickstream publishes. Below it an article is measured as
# under ten rather than unmeasured, so ten is where a reading starts existing.
CLICKSTREAM_PRIVACY_FLOOR = 10

QUANTITY = {'height': ('%s high', 'metre'), 'area': ('an area of %s', 'square metre'),
            'length': ('%s long', 'metre'), 'elevation': ('%s above sea level', 'metre'),
            'width': ('%s wide', 'metre'), 'vertical_depth': ('%s deep', 'metre'),
            'diameter': ('%s across', 'metre')}
COUNT = {'floors': '%s floors', 'capacity': 'room for %s', 'students': '%s students',
         'employees': '%s staff', 'beds': '%s beds',
         'visitors_per_year': '%s visitors a year',
         'collection_size': '%s items in its collection'}
YEAR = {'inception': 'dating from %s', 'opened': 'opened in %s'}
# The style phrase does NOT wrap the label in "in the ... style". Wikidata's style labels
# already carry the word in most languages - the French label for Romanesque Revival is
# "style neo-roman" - and a shipped row read "in the style neo-roman style". A phrase that
# states what the field IS cannot double whatever the label happens to contain.
ATTRIBUTE = {'architect': 'designed by %s', 'architectural_style': 'its style recorded as %s',
             'operator': 'run by %s', 'material': 'built of %s',
             'heritage_status': 'listed as %s'}
# Captured and deliberately not printed. religion, named_after and sport are real statements
# that no phrasing here renders without either guessing at a relationship or reading oddly,
# and a fact this file will not print is a fact it must not count.
NOT_PRINTED = ('religion', 'named_after', 'sport', 'duration', 'attendance')


# The two measurements a reader states in kilometres once they pass one. Everything
# else here is a height, an elevation, a depth or a diameter, and those stay in metres
# however large they get.
KM_WHEN_LONG = ('length', 'width')


def one(vals):
    """The single distinct value, or None when the property states none or more than one."""
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


def printable(rec, lang):
    """The facts this entity's page can state, as phrases, plus how many are quantities."""
    out, quantities, ambiguous = [], 0, 0
    f = rec.get('facts') or {}
    items = rec.get('items') or {}
    for k, (phrase, unit) in QUANTITY.items():
        vals = [v for v in (f.get(k) or []) if v.get('unit') == unit]
        if not vals:
            continue
        v = one(vals)
        if v is None:
            ambiguous += 1
            continue
        txt = (square_metres(v['amount']) if unit == 'square metre'
               else metres(v['amount'], 1000 if k in KM_WHEN_LONG else None))
        out.append(phrase % txt)
        quantities += 1
    for k, phrase in COUNT.items():
        v = one(f.get(k) or [])
        if v is None:
            ambiguous += 1 if f.get(k) else 0
            continue
        try:
            out.append(phrase % count_str(v['count']))
        except (TypeError, ValueError):
            continue
        quantities += 1
    for k, phrase in YEAR.items():
        v = one(f.get(k) or [])
        if v is None:
            ambiguous += 1 if f.get(k) else 0
            continue
        y = year_of(v.get('date'))
        if y:
            out.append(phrase % y)
    for k, phrase in ATTRIBUTE.items():
        vals = items.get(k) or []
        if not vals:
            continue
        names = [x['label'] for x in vals[:3] if x.get('label')]
        if names:
            out.append(phrase % ' and '.join(names))
    if one(f.get('website') or []):
        out.append('an official website')
    return out, quantities, ambiguous


def already_paged():
    """Every Wikidata item some other candidate file already builds a page for.

    Read out of the files those builders wrote, never guessed at. The manifest's own
    one-page-per-item rule is keyed on (language, SURFACE, item), so it does not fire across
    surfaces: 383 castles would have had both an outdoors page and a heritage page before the
    heritage builder was given this same exclusion. A new surface inherits that hole, so a new
    surface has to close it.
    """
    seen = set()
    per = collections.Counter()
    for rel in ('data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz',
                'data/atlas/sources/osm-trails/_trail-candidates.jsonl.gz',
                'data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz',
                'data/atlas/sources/wikidata/_water-feature-candidates.jsonl.gz',
                'data/atlas/sources/heritage/_listed-candidates.jsonl.gz',
                'data/atlas/sources/wikidata/_candidates.jsonl.gz'):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                l = l.strip()
                if not l:
                    continue
                d = json.loads(l)
                q = d.get('qid') or (d.get('entity_id') if str(d.get('entity_id', ''))
                                     .startswith('Q') else None)
                if q:
                    seen.add(q)
                    per[rel.rsplit('/', 1)[-1]] += 1
        except (EOFError, OSError, FileNotFoundError):
            pass
    return seen, dict(per)


def transport_nodes():
    """(country, folded name) of every station this inventory already builds a board for.

    The GTFS hub family pages 993 interchanges by their stop id, which carries no Wikidata
    item, so the item dedupe above cannot see them. A railway station page here and a
    departures board there would be two pages about one station.
    """
    out = set()
    try:
        for l in gzip.open(ROOT + 'data/atlas/sources/transport/_gtfs-hub-candidates.jsonl.gz',
                           'rt', encoding='utf-8'):
            d = json.loads(l)
            if d.get('entity_name'):
                out.add((d.get('country'), slug(d['entity_name'])))
    except (EOFError, OSError, FileNotFoundError):
        pass
    return out


def strip_disambiguator(title):
    """"Clark Island (New South Wales)" is called Clark Island by the people who go there.

    The bracket is Wikipedia's way of keeping two article titles apart, not part of the name,
    and it is kept in the `wikipedia` field so the article can still be found.
    """
    t = (title or '').strip()
    if t.endswith(')') and ' (' in t:
        head = t[:t.rindex(' (')].strip()
        if len(head) >= 3:
            return head
    return t


def article(word):
    """"a" or "an", read off the word that follows it.

    The heritage layer shipped 2,147 rows reading "a island" before this was noticed there,
    and this family has eight classes starting with a vowel - airport, aquarium, amusement
    park, archaeological site, art museum, island - so the same sentence would have read
    "is a art museum" on every one of them.
    """
    return 'an' if (word or ' ')[0].lower() in 'aeiou' else 'a'


def percentile(values, p):
    if not values:
        return None
    s = sorted(values)
    k = (len(s) - 1) * (p / 100.0)
    lo, hi = int(math.floor(k)), int(math.ceil(k))
    if lo == hi:
        return float(s[lo])
    return s[lo] + (s[hi] - s[lo]) * (k - lo)


def main():
    args = sys.argv[1:]
    out_path = args[args.index('--out') + 1] if '--out' in args else OUT
    facts_glob = args[args.index('--facts') + 1] if '--facts' in args else FACTS_GLOB

    iso = json.load(open(ISO))['iso']
    country_name = json.load(open(ISO)).get('labels') or {}

    # The page language per item, decided by landmark-choose-language.py BEFORE the facts
    # were fetched, because the facts were fetched with their labels in that same language.
    # Reading the decision rather than repeating it is what keeps the two from disagreeing.
    chosen = {}
    for l in gzip.open(CHOSEN, 'rt', encoding='utf-8'):
        d = json.loads(l)
        chosen[d['qid']] = d

    facts = {}
    for fp in sorted(glob.glob(facts_glob)):
        for l in gzip.open(fp, 'rt', encoding='utf-8'):
            d = json.loads(l)
            facts[d['qid']] = d

    # One entity, one class. A castle that is also stated to be a museum is captured twice,
    # and the more specific class wins: specificity is measured as the smaller class, because
    # a class with fewer members says more about its members than one with more.
    size = {}
    files = sorted(glob.glob(SRC + '*.jsonl.gz'))
    ent = {}
    dropped_class = collections.Counter()
    for f in files:
        # Everything this pipeline writes into the capture directory is prefixed with an
        # underscore - the facts per language, the chosen language, the shortfall record -
        # and a class file never is. Skipping on the prefix rather than on one known name is
        # what stops _facts-de.jsonl.gz being read as a class called "facts-de".
        if os.path.basename(f).startswith('_'):
            continue
        rows = [json.loads(l) for l in gzip.open(f, 'rt', encoding='utf-8') if l.strip()]
        size[os.path.basename(f)[:-9]] = len(rows)
        for d in rows:
            # AN UNREAD ITEM IS KEPT AS ITS ID AND ITS CLASS, nothing more. The capture
            # directory now holds 1.3 million rows and every row carries a map of up to
            # eleven article titles, which is most of the memory this file would hold and
            # all of it wasted on the three quarters of items the readership test refuses
            # two loops down. Nothing between here and that test reads anything but the
            # class, and the class is what the fold below needs, so the rest is dropped as
            # it is read rather than carried for an hour and then discarded.
            if d['qid'] not in chosen:
                d = {'qid': d['qid'], 'cls': d['cls']}
            prev = ent.get(d['qid'])
            if prev is None:
                ent[d['qid']] = d
                continue
            a, b = prev['cls'], d['cls']
            keep = min((size.get(a, 10 ** 9), a), (size.get(b, 10 ** 9), b))[1]
            dropped_class[(a if keep == b else b)] += 1
            ent[d['qid']] = d if keep == b else prev
    print('%d classes read, %d distinct items, %d second classes folded away'
          % (len(size), len(ent), sum(dropped_class.values())), file=sys.stderr)

    paged, paged_per = already_paged()
    # ITEMS THE AREA CONTRACT OWNS. wikidata-admin-tail-route.py measures, per class, the
    # share of its items that some admitted page or the containment chain names as its P131
    # parent, and reserves the classes that are containers. Without this the class-census
    # tail put 228 powiats, 94 French departments, 91 Indian districts and 70 Texas counties
    # in here, where two printable facts and a parent are enough - which is the generic
    # name-population-area administrative page the area contract exists to refuse. An area
    # earns a page on all three of that contract's tests or it gets none.
    reserved = set()
    try:
        reserved = set(json.load(open(SRC + '_area-reserved-qids.json')))
    except (OSError, ValueError):
        pass
    print('%d items reserved for the administrative area contract' % len(reserved),
          file=sys.stderr)
    hubs = transport_nodes()
    GAZ = entity_identity.load_gazetteer()
    cgrid = collections.defaultdict(list)
    for _cid, c in GAZ.by_id.items():
        if c.get('lat') is not None:
            cgrid[(c['country'], int(c['lat']), int(c['lon']))].append(c)

    def nearest_town(cc, lat, lon, min_pop=5000):
        best, bestd = None, 1e9
        for dla in (-1, 0, 1):
            for dlo in (-1, 0, 1):
                for c in cgrid.get((cc, int(lat) + dla, int(lon) + dlo), ()):
                    if (c.get('population') or 0) < min_pop:
                        continue
                    dk = math.hypot((float(c['lat']) - lat) * 111.0,
                                    (float(c['lon']) - lon) * 111.0
                                    * math.cos(math.radians(lat)))
                    if dk < bestd:
                        bestd, best = dk, c
        return (best, round(bestd, 1)) if best else (None, None)

    rej = collections.Counter()
    languages_not_taken = collections.Counter()
    ready = []                                  # entities past every gate but the route test

    for qid, e in ent.items():
        if qid in reserved:
            rej['its_class_is_an_administrative_container_so_the_area_contract_judges_it'] += 1
            continue
        if qid in paged:
            rej['another_surface_already_pages_this_wikidata_item'] += 1
            continue
        # The readership test comes before the facts test because the facts were only ever
        # FETCHED for the items that passed it. Asking about the facts first would report
        # 289,731 unread items as "no fact record", which is true and is not the reason they
        # are not here.
        ch = chosen.get(qid)
        if ch is None:
            rej['no_edition_reads_ten_a_month_the_lowest_reading_that_exists'] += 1
            continue
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
        parents = items.get('located_in') or []
        if not parents:
            rej['wikidata_states_no_containing_administrative_area'] += 1
            continue
        best_lang = ch['lang']
        if best_lang not in e['titles']:
            rej['the_chosen_edition_has_no_title_in_this_capture'] += 1
            continue
        reads = {best_lang: ch['reads']}
        phrases, quantities, ambiguous = printable(rec, best_lang)
        if len(phrases) < 2:
            rej['fewer_than_two_printable_facts'] += 1
            continue
        if (e['cls'] in ('railway_station', 'metro_station', 'transport_hub')
                and (cc, slug(strip_disambiguator(e['titles'][best_lang]))) in hubs):
            rej['the_gtfs_layer_already_builds_a_departure_board_for_this_station'] += 1
            continue
        ready.append((qid, e, rec, cc, cq, parents, reads, best_lang, phrases, quantities,
                      ambiguous, ch))

    # FIRST PASS. The substance bar for the utility route is the 75th percentile of the
    # printable-fact count among the rows this run admits on DEMAND. It is computed here and
    # applied below, so the bar moves with the data instead of being a number in the source.
    demand_facts = [len(p) for (_q, _e, _r, _cc, _cq, _pa, _rd, _bl, p, _qn, _am, ch) in ready
                    if ch['clears_floor']]
    bar = int(math.ceil(percentile(demand_facts, 75) or 4))
    median_bar = int(math.ceil(percentile(demand_facts, 50) or 3))
    print('demand route admits %d; its 75th-percentile fact count is %d, which is the '
          'utility bar; its median is %d'
          % (len(demand_facts), bar, median_bar), file=sys.stderr)
    # Counted, not applied. The bar is set at the 75th percentile deliberately: a page
    # admitted on substance rather than on readers ought to be MORE substantial than the
    # ones admitted on readers, not merely typical. Setting it at the median would be a
    # defensible second reading of the same rule and it is a different number of pages, so
    # the difference is reported rather than left as an opinion about how many were missed.
    would_add_at_median = sum(
        1 for (_q, _e, _r, _cc, _cq, _pa, _rd, _bl, p_, qn, _am, ch) in ready
        if not ch['clears_floor'] and qn >= 1 and median_bar <= len(p_) < bar)

    rows = []
    by_route = collections.Counter()
    by_side = collections.Counter()
    by_market = collections.Counter()
    by_cls = collections.Counter()
    by_lang = collections.Counter()
    by_cc = collections.Counter()
    for (qid, e, rec, cc, cq, parents, reads, bl, phrases, quantities, ambiguous,
         ch) in ready:
        floor = ch['floor']
        route = None
        if ch['clears_floor']:
            route = 'DEMAND'
        elif len(phrases) >= bar and quantities >= 1:
            route = 'UTILITY'
        else:
            rej['below_the_floor_and_below_the_substance_bar'] += 1
            continue
        # THE MARKET IS THE ENTITY'S OWN WHERE IT HAS ONE. Mapping every English page to
        # en-US put /en/landmarks/building/melbourne-q3141/ in the United States market and
        # called it home-side, which is two errors at once: Melbourne is not in the en-US
        # market and a page about it there is a destination page, not a home one. Where the
        # entity's country runs a market in this language, that market owns the page; where
        # it does not, the language's default market does and the side is destination.
        #
        # This COSTS rows and it is still right. en-AU, es-MX, tr-TR, da-DK, nb-NO and fi-FI
        # are admitted for the families their own measurements cover, and no landmark family
        # is among them, so an Australian landmark now meets that gate instead of slipping
        # past it under a United States label. The funnel counts what the correction moved.
        home = COUNTRY_MKT.get(cc)
        if home and home[1] == bl:
            mkt, side = home[0], 'home'
        else:
            mkt, side = MKT_OF_LANG[bl], 'destination'
        title = e['titles'][bl]
        name = strip_disambiguator(title)
        parent = parents[0]
        town, dist = nearest_town(cc, e['lat'], e['lon'])
        cname = country_name.get(cq) or cc
        cls_words = e['cls'].replace('_', ' ')
        where = 'in %s, %s' % (parent['label'], cname)
        if town and dist is not None and dist <= 120:
            where += ', %skm from %s' % (dist, town['name'])
        basis = ('%d search-referred readers a month for its %s article against a floor of %d'
                 % (reads[bl], bl, floor) if route == 'DEMAND' else
                 '%d search-referred readers a month for its %s article, below the floor of '
                 '%s, with %d printable facts against a bar of %d taken from the 75th '
                 'percentile of the rows admitted on readership alone'
                 % (reads[bl], bl, floor if floor else 'that language', len(phrases), bar))
        reason = ('%s is %s %s %s. Wikidata states %d facts about it that this page prints '
                  '(%s). Admitted on %s: %s.'
                  % (name, article(cls_words), cls_words, where, len(phrases),
                     ', '.join(phrases), route.lower(), basis))
        for lg in e['titles']:
            if lg != bl and MKT_OF_LANG.get(lg):
                languages_not_taken[lg] += 1
        rows.append({
            'individual_page_basis': basis,
            'shape': 'landmark_entity',
            'source': 'wikidata_landmark',
            'country': cc, 'market': mkt, 'language': bl, 'side': side,
            'cls': e['cls'], 'entity_id': qid, 'entity_name': name,
            'n': 1, 'enriched': len(phrases),
            'url': '/%s/landmark/%s/%s-%s/' % (bl, e['cls'].replace('_', '-'),
                                               slug(name), qid.lower()),
            'parent_id': parent['qid'], 'parent_name': parent['label'],
            'parent_cls': 'administrative area',
            'city': town['name'] if town else None,
            'city_id': town['id'] if town else None,
            'km_from_city': dist if town else None,
            'qid': qid, 'wikipedia': '%s:%s' % (bl, title),
            'local_names': e['titles'],
            'facts': phrases, 'quantities': quantities,
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
                mkt, {'lat': e.get('lat'), 'lon': e.get('lon'), 'city_id': e.get('city_id') or None,
                     'country': cc}) if side == 'destination' else [],
            'attribution': 'wikidata_cc0',
            'search_readership': reads[bl],
            'search_readership_floor': floor,
            'substance_bar': bar,
            # Content only, and the entity's own name deliberately left out. A signature that
            # contains the thing being compared can never report a duplicate: every one of
            # 8,270 colliding climate pages carried a distinct signature and a LOW duplicate
            # risk because the city name was in it.
            'data_signature': '|'.join([e['cls'], parent['qid']] + sorted(phrases)),
            'uniqueness_reason': reason,
            'no_superlative': True,
        })
        by_route[route] += 1
        by_side[side] += 1
        by_market[mkt] += 1
        by_cls[e['cls']] += 1
        by_lang[bl] += 1
        by_cc[cc] += 1

    tmp = out_path + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(tmp, out_path)

    funnel = {
        'built_on': '2026-10-18',
        'classes_read': len(size),
        'items_captured': sum(size.values()),
        'distinct_items_after_folding_second_classes': len(ent),
        'second_classes_folded_away': dict(dropped_class.most_common()),
        'items_already_paged_by_another_surface_per_source': paged_per,
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'by_admission_route': dict(by_route),
        'by_side': dict(by_side),
        'by_market': dict(by_market.most_common()),
        'by_class': dict(by_cls.most_common()),
        'by_language': dict(by_lang.most_common()),
        'by_country': dict(by_cc.most_common(40)),
        'utility_substance_bar': bar,
        'utility_bar_at_the_median_instead': median_bar,
        'rows_a_median_substance_bar_would_add': would_add_at_median,
        'why_the_bar_is_the_75th_and_not_the_median': (
            'a page admitted on what it can say rather than on who reads it should say MORE '
            'than the pages admitted on readers, not the same amount. The median reading is '
            'defensible and is counted here rather than argued about.'),
        'utility_bar_basis': ('the 75th percentile of the printable-fact count among the '
                              '%d rows admitted on readership alone in this same run'
                              % len(demand_facts)),
        'articles_in_other_languages_not_taken': dict(languages_not_taken.most_common()),
        'why_other_languages_are_not_taken': ('one page per entity. The same landmark in ten '
                                              'editions is ten translations of one page, and '
                                              'this inventory does not build those.'),
        'floor_source': FLOORS.replace(ROOT, ''),
        'attribution': 'Wikidata CC0 1.0; Wikimedia clickstream CC0 1.0',
    }
    json.dump(funnel, open(FUNNEL, 'w'), indent=1, ensure_ascii=False)
    for k, v in rej.most_common():
        print('%-62s %8d' % (k, v), file=sys.stderr)
    print('rows emitted %d  %s' % (len(rows), dict(by_route)), file=sys.stderr)


if __name__ == '__main__':
    main()
