#!/usr/bin/env python3
"""The market-scoped URL experiment: OFFLINE, and it publishes nothing.

THE QUESTION
------------
Existing pages live in a LANGUAGE-scoped URL space: /en/..., /es/.... One language holds one URL
per entity per family, so when two markets sharing a language both earn an entity, exactly one
of them can have the page. The ownership rule picks that one (home market, then entity-specific
measured demand, then the family score as a last resort) and the others are discarded.

A MARKET-scoped URL space would let the discarded ones exist: /en-au/..., /es-mx/.... The
question this experiment answers is not whether that is POSSIBLE - it plainly is - but whether
the pages it would create are pages a reader needs, or the same page again with a different
origin city in it. A market-scoped URL is not a right to a new page. It is a place a new page
could go IF the page earns it.

WHAT IT READS
-------------
  same-language-contests.jsonl.gz   every (family, entity, language) where more than one market
                                    earned the entity, written by the manifest as it resolves
                                    them. The shut-out markets ARE this experiment's population.
  LIVDAR-1M-CANDIDATE-MANIFEST      the pages that exist, which give the generic owner its URL,
                                    its facts and its template signature
  entity_identity                   the facts for the shut-out market, computed by the same
                                    function the manifest uses, so a fact here is a fact there
  content_uniqueness                the five measures, likewise shared with the manifest's gate

WHAT IT DOES NOT DO
-------------------
It writes two files into reports/ and data/atlas/measurements/ and touches nothing else. No
route, no sitemap, no redirect, no page, no cohort. Every URL it prints under /en-au/ or /es-mx/
is a string in a report.
"""
import csv, gzip, json, collections, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                                      # noqa: E402
import content_uniqueness as cu                                             # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
CONTESTS = ROOT + 'data/atlas/measurements/same-language-contests.jsonl.gz'
MANIFEST = OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
STAMP = '2026-10-06'

# The two markets the brief names, tested first and alone. Ten more markets are NOT in this run
# on purpose: if the yield here is small there is nothing to roll out, and if it is large the
# rollout can be argued from measured numbers rather than from the architecture being available.
UNDER_TEST = ['en-AU', 'es-MX']
# What each is measured against: the markets that already hold its language.
COMPARED_WITH = {'en-AU': ['en-US', 'en-GB'], 'es-MX': ['es-ES']}

MKT_LANG = dict(entity_identity.MKT_LANG)
MKT_COUNTRY = dict(entity_identity.MKT_COUNTRY)

# ---- the decision taxonomy, brief rule 4 -------------------------------------------------------
# KEEP_GENERIC_ONLY        the generic page stays the owner and no market page is created, because
#                          the market candidate adds nothing a reader of the generic page lacks
# MARKET_PAGE_JUSTIFIED    both pages legitimately exist: the market candidate carries information
#                          gain of a kind the brief accepts
# MARKET_PAGE_DUPLICATE    the market candidate would be the same page again. Distinguished from
#                          KEEP_GENERIC_ONLY by degree: this one is near-identical by measurement
#                          (one shared fact set, one template, semantic similarity at the ceiling)
# INSUFFICIENT_MARKET_VALUE the candidate differs, but only in ways the brief rules out on their
#                          own: the origin market's name, one distance, one temperature, a currency
#                          symbol, reworded prose, a different URL
# MARKET_PAGE_JUSTIFIED_PENDING_SOURCE resolves a genuine tension in brief rule 3. The rule
# lists "own entity-specific measured demand" as sufficient information gain, AND lists "one
# distance" and "one temperature" as insufficient on their own. A candidate can satisfy the
# first and fail the second at the same time, and the 2026-10-06 destination measurement
# produced exactly that case: Australians search "things to do in bali" 7,100 times a month, so
# the demand is real and entity-specific, while everything a /en-au/ Bali page could currently
# SAY that /en/ Bali does not is a distance from Sydney and a temperature gap. Demand proves the
# audience exists; it does not prove the page differs. Folding these into JUSTIFIED would
# overstate the yield and folding them into INSUFFICIENT would hide a measured opportunity, so
# they are their own state, counted apart from net new valid pages and named with the source each
# one is waiting on.
DECISIONS = ['MARKET_PAGE_JUSTIFIED', 'MARKET_PAGE_JUSTIFIED_PENDING_SOURCE',
             'KEEP_GENERIC_ONLY', 'MARKET_PAGE_DUPLICATE', 'INSUFFICIENT_MARKET_VALUE']

# Information gain the brief accepts as sufficient ON ITS OWN. Each needs a source that can
# actually establish it; where this inventory has no such source the kind is listed in
# GAIN_KINDS_WITH_NO_SOURCE_YET below rather than quietly dropped, because "we cannot measure it"
# and "it is not there" are different findings and only one of them is a dead end.
GAIN_SUFFICIENT = [
    'ENTITY_SPECIFIC_MEASURED_DEMAND',   # this market was measured searching THIS place
    'MARKET_SPECIFIC_REGULATION',        # visa, tax or licence rules that differ by the reader's
    'MARKET_SPECIFIC_PRICING',           # country, not by the place described
    'DIFFERENT_COMMERCIAL_AVAILABILITY',
    'DIFFERENT_INTENT',
    'DIFFERENT_ENTITY_SCOPE',
    'MARKET_SPECIFIC_SEASONALITY',
    'MATERIALLY_DIFFERENT_TRAVEL_ACCESS',
    'MATERIALLY_DIFFERENT_TOOL_OUTPUT',
    'MULTIPLE_MARKET_SPECIFIC_FACTS',    # several genuinely useful ones, not one fact twice
]
# Explicitly NOT sufficient on its own, brief rule 3. Recorded on the row when present so the
# report can say what the candidate DID have, rather than only that it failed.
GAIN_NOT_SUFFICIENT = [
    'ORIGIN_MARKET_NAME', 'ONE_DISTANCE', 'ONE_TEMPERATURE', 'SPELLING_VARIANT',
    'CURRENCY_SYMBOL_ONLY', 'TRANSLATED_OR_REWORDED_PROSE', 'DIFFERENT_URL',
]
# The kinds this inventory cannot yet establish, with the source each would need. These are not
# zeroes to be reported as absence of opportunity; they are the measurable paths that are shut
# until a source lands, and the final report lists them as such.
GAIN_KINDS_WITH_NO_SOURCE_YET = {
    'MARKET_SPECIFIC_REGULATION': (
        'needs a per-(reader country, subject country) rules table: visa class, length of stay, '
        'work rights, tax residency threshold. Nothing in this inventory is keyed on the '
        'READER country, so relocation.country, taxes.country-remote-work, health.country and '
        'banking.country cannot currently differentiate an Australian reader from an American '
        'one even though the real-world answers differ'),
    'MARKET_SPECIFIC_PRICING': (
        'needs prices quoted in the market currency from a licensed source. The rent index and '
        'cost-of-living fields are single-currency, so a currency conversion is all this '
        'inventory could produce, and brief rule 3 rules a currency symbol out explicitly'),
    'DIFFERENT_COMMERCIAL_AVAILABILITY': (
        'needs per-market product availability. Real for connectivity families and the family '
        'gate already refuses those for the new markets as PRODUCT surfaces, so there is no '
        'travel-content family where this could apply'),
    'MARKET_SPECIFIC_SEASONALITY': (
        'needs southern-hemisphere school and holiday calendars joined to the destination. The '
        'public-holiday layer carries holidays per COUNTRY DESCRIBED, not per reader market, so '
        'the genuinely useful en-AU fact - that the Australian summer holiday falls in December '
        'and January, which inverts when an Australian should visit Europe - is not computable '
        'from what is captured'),
    'MATERIALLY_DIFFERENT_TRAVEL_ACCESS': (
        'needs flight route and duration data per origin market. This is the strongest unbuilt '
        'path for en-AU specifically: Sydney to Europe is a different journey from New York to '
        'Europe in a way a reader plans around, and no captured source carries it'),
    'MATERIALLY_DIFFERENT_TOOL_OUTPUT': (
        'needs the calculators to take the reader market as an input. They currently take the '
        'subject city only'),
}


def market_path(url_pattern, market):
    """The market-scoped form of a language-scoped path, for the report only.

    /en/areas/city-cafe/sydney/ becomes /en-au/areas/city-cafe/sydney/. The language segment is
    replaced rather than prefixed, because a path carrying both would claim the page is a variant
    of a language-level page that this experiment has not established exists.
    """
    parts = url_pattern.strip('/').split('/')
    if not parts:
        return url_pattern
    parts[0] = market.lower()
    return '/' + '/'.join(parts) + '/'


# The admission measurement for a market admitted after the research freeze. Its keywords are
# stored per FAMILY, which is how the family gate uses them, but each one NAMES a place, and that
# makes it the only entity-level demand evidence these two markets have. CROSS-LANGUAGE-REACH.csv,
# which is where XL_MARKET_CITIES comes from, predates their admission and carries no row for
# either, so without reading these files the experiment would report "no entity-specific demand"
# for a market that has 673,150 measured volume on named places. That would be true of the file
# and false of the market.
ADMISSION = {'en-AU': 'ahrefs-en-AU-market-admission-2026-10-05.json',
             'es-MX': 'ahrefs-es-MX-market-admission-2026-10-05.json'}
# The FOREIGN-destination demand for the two markets under test, measured on 2026-10-06
# precisely because the admission files above name only home-country places and so could not
# answer the question either way. 27 keywords, 54,300 volume, licence and provenance in the file.
DESTINATION_DEMAND = 'destination-demand-new-markets-2026-10-06.json'
# Connectivity is a PRODUCT surface. The family gate refuses all three connectivity families for
# the markets admitted after the freeze, so their keywords cannot vouch for a travel page. They
# are counted separately rather than dropped, because esim japan, esim bali, esim new zealand and
# esim usa measured in en-AU are the clearest signal in either file of which foreign destinations
# Australians actually care about, and that is the measurement this experiment ends up asking for.
PRODUCT_FAMILIES = {'connectivity.esim-country', 'connectivity.esim-region',
                    'connectivity.esim-explainer'}


def admission_named_entities():
    """{market: (names measured for travel families, names measured for product families)}.

    A name here means this market was measured searching for THIS place by name. Matching is on
    the name appearing in the keyword, which is what the keywords are: "things to do in cairns",
    "que hacer en merida", "chichen itza". No stemming and no fuzzy match, because a loose match
    is how a market would acquire demand for a place nobody measured.
    """
    out = {}
    for mkt, fn in ADMISSION.items():
        path = ROOT + 'data/atlas/measurements/' + fn
        travel, product = [], []
        try:
            d = json.load(open(path, encoding='utf-8'))
        except (FileNotFoundError, ValueError):
            out[mkt] = ([], [])
            continue
        for fam, v in (d.get('families') or {}).items():
            if v.get('verdict') != 'MEASURED':
                continue
            bucket = product if fam in PRODUCT_FAMILIES else travel
            for k in v.get('keywords') or []:
                bucket.append((fam, k['keyword'].lower(), int(k.get('volume') or 0)))
        out[mkt] = (travel, product)
    return out


# The intent templates the two admission measurements actually use, so a keyword can be reduced
# to its SUBJECT. Written out rather than inferred, and short on purpose: every keyword in both
# files is either a bare entity name or one of these wrapped around one.
KEYWORD_PREFIXES = ['things to do in ', 'que hacer en ', 'esim ']
KEYWORD_SUFFIXES = [' restaurants', ' cafes', ' bars', ' museums', ' national park']


def keyword_subject(kw):
    """What place a measured keyword is ABOUT, with the intent template removed."""
    k = kw.strip().lower()
    for pre in KEYWORD_PREFIXES:
        if k.startswith(pre):
            return k[len(pre):].strip()
    for suf in KEYWORD_SUFFIXES:
        if k.endswith(suf):
            return k[:-len(suf)].strip()
    return k


def destination_demand():
    """{market: {(entity name lower, country): (keyword, volume, kd)}} for FOREIGN destinations."""
    out = collections.defaultdict(dict)
    try:
        d = json.load(open(ROOT + 'data/atlas/measurements/' + DESTINATION_DEMAND,
                           encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        return out
    for mkt, v in (d.get('markets') or {}).items():
        for k in v.get('keywords') or []:
            out[mkt][(k['entity'].strip().lower(), k['country'])] = (
                k['keyword'], int(k['volume']), int(k.get('kd') or 0))
    return out


def entity_measured_in_market(ename, ecountry, market, travel_keywords):
    """Was this market measured searching for this entity, in a travel family?

    Two conditions, and the first pass of this experiment had neither, which produced eight false
    positives that read as the entire yield: Victoria in CANADA matched "queen victoria market",
    Barrie in CANADA matched "great barrier reef" and Sydney in CANADA matched "things to do in
    sydney". That is the same defect that once let Barcelona, Venezuela inherit the measured
    demand of Barcelona, Spain, and it is worth naming twice because it is this project's most
    repeated mistake: a name is not an entity.

    1 COUNTRY. Every travel keyword in an admission measurement names a place in that market's
      OWN country - all 54 en-AU travel keywords name Australian places, all 27 es-MX keywords
      name Mexican places. A keyword about Melbourne cannot be evidence of demand for a city in
      Canada, so an entity outside the market's home country cannot match at all. This is not a
      heuristic: it is what the files contain, checked and recorded in the output.
    2 THE WHOLE SUBJECT. The entity name has to BE what the keyword is about, once the intent
      template is stripped, not merely appear inside it. Whole-word matching is not enough:
      "victoria" is a run of complete words inside "queen victoria market", and "kosciuszko"
      inside "mount kosciuszko", and in both cases the keyword names a different entity that
      happens to contain this one's name.
    """
    if (ecountry or '').strip() != MKT_COUNTRY.get(market, ''):
        return ''
    low = ' '.join((ename or '').strip().lower().split())
    if len(low) < 3:
        return ''
    for fam, kw, vol in travel_keywords:
        if keyword_subject(kw) == low:
            return f'{kw} ({vol:,} a month, measured for {fam})'
    return ''


def main():
    if not os.path.exists(CONTESTS):
        sys.exit(f'MISSING {CONTESTS}. Run the manifest first; it writes the contests as it '
                 f'resolves them.')
    fams = list(csv.DictReader(open(ROOT + 'reports/livdar-master-seo-universe-2026-09-30/'
                                    'FAMILY-MASTER.csv')))
    slot_cache = {}

    # ---- the pages that exist, keyed the way a contest names them -----------------------------
    # Only the fields this experiment reads, because the manifest is 32MB gzipped and holding all
    # 65 columns of 342,483 rows to read six of them is how the manifest build hit 12GB.
    owner_row = {}
    kept_by_market = collections.Counter()
    with gzip.open(MANIFEST, 'rt', encoding='utf-8') as fh:
        for r in csv.DictReader(fh):
            kept_by_market[r['market']] += 1
            owner_row[(r['family'], r['entity_type'], r['entity_id'], r['market'])] = {
                'url': r['url_pattern'], 'facts': r.get('locale_facts') or '',
                'tpl': r.get('template_signature') or '',
                'kw': r.get('local_keyword') or '', 'vol': r.get('local_volume') or '0',
                'intent': r.get('primary_intent') or '',
                'localization_class': r.get('localization_class') or '',
                'status': r.get('status') or '',
            }
    print(f'manifest rows read: {sum(kept_by_market.values()):,}', file=sys.stderr)

    # WHY the owner is missing, where it is. A contest whose owner did not reach the final
    # manifest is not a coexistence question, and the honest thing is to say which gate removed
    # it rather than to leave a 12,000-row bucket labelled "no generic owner". The gate that
    # removed the owner matters: the owner and the shut-out market share a language and the same
    # foreign entity, so a gate the owner failed on those grounds is a gate the shut-out market
    # faces with the same facts and, in every case measured here, less demand evidence.
    owner_rejection = {}
    rej_path = OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz'
    if os.path.exists(rej_path):
        with gzip.open(rej_path, 'rt', encoding='utf-8') as fh:
            for r in csv.DictReader(fh):
                owner_rejection[(r['family'], r['entity_type'], r['entity_id'], r['market'])] = (
                    r.get('status') or r.get('rejection_reason', '')[:60])
        print(f'rejection records read: {len(owner_rejection):,}', file=sys.stderr)

    ADM = admission_named_entities()
    DEST = destination_demand()
    for _m, _d in DEST.items():
        print(f'{_m} foreign-destination demand: {len(_d)} entities measured, '
              f'{sum(v[1] for v in _d.values()):,} total volume', file=sys.stderr)
    for _m, (_t, _p) in ADM.items():
        print(f'{_m} admission measurement: {len(_t)} keywords in travel families, '
              f'{len(_p)} in product families (refused by the family gate)', file=sys.stderr)

    GAZ = entity_identity.load_gazetteer()
    out_rows = []
    counts = collections.Counter()
    # per (market, family) so the report can say WHERE any yield sits rather than only how much
    by_family = collections.defaultdict(collections.Counter)
    overlap = collections.defaultdict(lambda: collections.Counter())
    gain_kinds_seen = collections.Counter()

    with gzip.open(CONTESTS, 'rt', encoding='utf-8') as fh:
        for line in fh:
            c = json.loads(line)
            langs_markets = [c['owner_market']] + list(c['shut_out_markets'])
            for m in c['shut_out_markets']:
                if m not in UNDER_TEST:
                    continue
                counts[f'{m}:raw_candidates'] += 1
                fid, etype, eid = c['family'], c['entity_type'], str(c['entity_id'])
                own = owner_row.get((fid, etype, eid, c['owner_market']))

                # the facts each side can compute, from the one definition
                lf_city = eid if etype == 'city' else GAZ.city_id_for(c.get('city') or '',
                                                                      c.get('country') or '')
                mine = entity_identity.locale_facts_for_row(
                    m, {'city_id': lf_city, 'country': c.get('country') or ''}) if lf_city else []
                theirs = cu.facts_of(own['facts']) if own else (
                    entity_identity.locale_facts_for_row(
                        c['owner_market'], {'city_id': lf_city,
                                            'country': c.get('country') or ''})
                    if lf_city else [])

                slots = cu.slots_for_family(fid, fams, slot_cache)
                my_kinds = cu.fact_kinds(mine)
                their_kinds = cu.fact_kinds(theirs)
                # the kinds of market fact THIS market carries that the owner does not. A kind
                # both sides carry is not a difference even when the sentence differs: "about
                # 16,000km from Sydney" against "about 6,000km from New York" is one kind,
                # distance, written twice, and brief rule 3 names one distance as insufficient.
                new_kinds = sorted(my_kinds - their_kinds)

                esd_reach = m in (c.get('entity_specific_demand_markets') or [])
                owner_esd = c['owner_market'] in (c.get('entity_specific_demand_markets') or [])
                # the two independent sources of entity-level demand, kept apart so the report
                # can say which one spoke
                esd_adm = entity_measured_in_market(c.get('entity_name') or '',
                                                    c.get('country') or '', m,
                                                    ADM.get(m, ([], []))[0])
                # the 2026-10-06 foreign-destination measurement, keyed on (entity, country)
                # so a name cannot travel between countries the way it did in the first pass
                _dd = DEST.get(m, {}).get(
                    ((c.get('entity_name') or '').strip().lower(), c.get('country') or ''))
                esd_dest = (f'{_dd[0]} ({_dd[1]:,} a month at keyword difficulty {_dd[2]}, '
                            f'measured for this market on 2026-10-06)') if _dd else ''
                esd = esd_reach or bool(esd_adm) or bool(esd_dest)
                if esd_dest:
                    counts[f'{m}:entity_in_the_foreign_destination_measurement'] += 1
                if esd_adm:
                    counts[f'{m}:entity_named_in_own_admission_measurement'] += 1
                if esd_reach:
                    counts[f'{m}:entity_in_cross_language_reach_file'] += 1

                gain = []
                not_sufficient = []
                if esd:
                    gain.append('ENTITY_SPECIFIC_MEASURED_DEMAND')
                if len(new_kinds) >= 2:
                    gain.append('MULTIPLE_MARKET_SPECIFIC_FACTS')
                if own and own['intent'] and c['intent'] and own['intent'] != c['intent']:
                    gain.append('DIFFERENT_INTENT')
                # what it DOES have, for the record, even where none of it is enough
                if new_kinds == ['distance']:
                    not_sufficient.append('ONE_DISTANCE')
                if new_kinds == ['temperature']:
                    not_sufficient.append('ONE_TEMPERATURE')
                if mine and not new_kinds:
                    not_sufficient.append('ORIGIN_MARKET_NAME')
                if not mine:
                    not_sufficient.append('DIFFERENT_URL')

                sfr = cu.shared_fact_ratio(slots, mine)
                ssr = cu.shared_section_ratio(own['tpl'] if own else '',
                                              [own['tpl']] if own else [])
                sim = cu.semantic_similarity(slots, mine, [theirs])
                kind_overlap = cu.fact_kind_overlap(mine, theirs)

                if own is None and c.get('owner_generated_a_row') is False:
                    # The ownership rule named an owner that the per-market tier cap or the
                    # demand check then dropped, so no row was ever generated for it and there
                    # is no generic page at all. Not a coexistence question either, and kept
                    # apart from a gate rejection because the two say different things: this one
                    # means the English page for this entity was never a candidate.
                    decision = 'KEEP_GENERIC_ONLY'
                    why = (f"no generic page was ever generated: {c['owner_market']} won this "
                           f"entity in {c['language']} and was then dropped by its own market's "
                           f"measured tier cap or demand check before a row existed. Nothing "
                           f"exists to coexist with, and the shut-out market faces the same two "
                           f"checks. Not counted as yield.")
                    counts[f'{m}:owner_never_generated_a_row'] += 1
                    counts[f'{m}:no_generic_owner_survived'] += 1
                elif own is None:
                    # The owner did not survive the later gates, so there is no generic page for
                    # this entity and family at all. A market page here would be the ONLY page,
                    # which is a different question from coexistence and is not what this
                    # experiment is measuring: the row is recorded and excluded from the yield.
                    decision = 'KEEP_GENERIC_ONLY'
                    _orej = owner_rejection.get(
                        (fid, etype, eid, c['owner_market']), 'NOT_IN_THE_REJECTION_FILE_EITHER')
                    why = (f"no generic page exists to coexist with: {c['owner_market']}, which "
                           f"owns this entity in this language, was removed by the pipeline as "
                           f"{_orej}. The shut-out market shares that language and that entity "
                           f"and carries no demand evidence the owner lacked, so it faces the "
                           f"same gate with less. Not a coexistence question and not counted as "
                           f"yield.")
                    counts[f'{m}:no_generic_owner_survived'] += 1
                    counts[f'{m}:owner_removed_as:{_orej}'] += 1
                elif gain and (new_kinds or [g for g in gain
                                              if g != 'ENTITY_SPECIFIC_MEASURED_DEMAND']):
                    decision = 'MARKET_PAGE_JUSTIFIED'
                    why = ('earns a separate page beside ' + own['url'] + ' on: '
                           + ', '.join(gain)
                           + (('. Facts only this market carries: ' + '; '.join(
                               f for f in mine if f not in set(theirs))) if new_kinds else ''))
                elif gain:
                    # demand measured, content not yet differentiable. See the note on
                    # MARKET_PAGE_JUSTIFIED_PENDING_SOURCE above: this is the state where brief
                    # rule 3's two clauses point opposite ways, and it is reported rather than
                    # resolved in whichever direction flatters the number.
                    decision = 'MARKET_PAGE_JUSTIFIED_PENDING_SOURCE'
                    _ev = esd_dest or esd_adm or 'the cross-language reach file'
                    why = (f"the audience is measured and the page is not yet different: "
                           f"{', '.join(gain)} ({_ev}), and everything this page could say that "
                           f"{own['url']} does not is a distance from the origin city and a "
                           f"temperature gap, which brief rule 3 rules out on their own. One of "
                           f"three sources would change that and none is held: flight routes and "
                           f"duration from the origin market, the origin market's school and "
                           f"public holiday calendar, or per-passport entry rules. Counted as a "
                           f"measured opportunity, NOT as a valid page.")
                elif ssr >= 1.0 and not new_kinds:
                    # The duplicate test is the TEMPLATE plus the fact KINDS, not the string
                    # similarity. A page with "about 9,300km from Sydney" where the generic has
                    # "about 7,900km from London" scores 0.167 on string similarity and 1.0 on
                    # kind overlap, and the second number is the true one: same sections, same
                    # source data, same two kinds of fact, the reader's city swapped in.
                    decision = 'MARKET_PAGE_DUPLICATE'
                    why = (f'the same page again: identical template (shared section ratio '
                           f'{ssr}), identical source data, and not one KIND of market fact '
                           f'that {own["url"]} does not already carry (fact kind overlap '
                           f'{kind_overlap}). The strings differ because the reader\'s own city '
                           f'is swapped in, which is the difference brief rule 3 rules out by '
                           f'name; string similarity reads {sim} and is the wrong measure here')
                elif not_sufficient:
                    decision = 'INSUFFICIENT_MARKET_VALUE'
                    why = (f'differs from {own["url"]} only in ways brief rule 3 rules out on '
                           f'their own: {", ".join(not_sufficient)}. shared fact ratio {sfr}, '
                           f'shared section ratio {ssr}, semantic similarity {sim}')
                else:
                    decision = 'KEEP_GENERIC_ONLY'
                    why = (f'no information gain measured against {own["url"]}, and no '
                           f'rule-3 difference either, so the generic page remains the owner')

                counts[f'{m}:{decision}'] += 1
                by_family[m][f'{fid}:{decision}'] += 1
                for g in gain:
                    gain_kinds_seen[f'{m}:{g}'] += 1
                for other in [c['owner_market']] + [x for x in c['shut_out_markets'] if x != m]:
                    overlap[f'{m} vs {other}'][decision] += 1
                    overlap[f'{m} vs {other}']['pairs'] += 1

                out_rows.append({
                    'generic_owner_url': own['url'] if own else '',
                    'market_candidate_url': market_path(own['url'], m) if own else '',
                    'market': m,
                    'same_language_group': f"{c['language']}: " + ', '.join(sorted(langs_markets)),
                    'family': fid, 'entity_type': etype, 'entity_id': eid,
                    'entity_name': c.get('entity_name') or '', 'country': c.get('country') or '',
                    'information_gain_reason': why,
                    'entity_specific_demand': (
                        ('MEASURED_FOR_THIS_MARKET: ' + esd_adm) if esd_adm else
                        ('MEASURED_FOR_THIS_MARKET: cross-language reach file' if esd_reach else
                         ('MEASURED_FOR_THE_OWNER_ONLY' if owner_esd
                          else 'NOT_MEASURED_FOR_EITHER'))),
                    'market_specific_fact_kinds': ', '.join(new_kinds),
                    'market_facts': ' | '.join(mine),
                    'generic_owner_facts': ' | '.join(theirs),
                    'shared_fact_ratio': sfr,
                    'shared_section_ratio': ssr,
                    'semantic_similarity_score': sim,
                    'fact_kind_overlap': kind_overlap,
                    'ownership_basis': c.get('ownership_basis') or '',
                    'family_demand_score_this_market': (c.get('family_demand_scores')
                                                        or {}).get(m, 0),
                    'family_demand_score_owner': (c.get('family_demand_scores')
                                                  or {}).get(c['owner_market'], 0),
                    'decision': decision,
                })

    # ---- the files ----------------------------------------------------------------------------
    cols = list(out_rows[0].keys()) if out_rows else []
    with gzip.open(OUT + 'MARKET-URL-EXPERIMENT.csv.gz', 'wt', newline='',
                   encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        for r in out_rows:
            w.writerow(r)

    yields = {}
    for m in UNDER_TEST:
        raw = counts[f'{m}:raw_candidates']
        just = counts[f'{m}:MARKET_PAGE_JUSTIFIED']
        dup = counts[f'{m}:MARKET_PAGE_DUPLICATE']
        gen = counts[f'{m}:KEEP_GENERIC_ONLY']
        insf = counts[f'{m}:INSUFFICIENT_MARKET_VALUE']
        pend = counts[f'{m}:MARKET_PAGE_JUSTIFIED_PENDING_SOURCE']
        yields[m] = {
            'raw_candidates': raw,
            'justified_separate_pages': just,
            'duplicate_rejected': dup,
            'insufficient_market_value_rejected': insf,
            'generic_only': gen,
            'no_generic_owner_survived_excluded_from_yield': counts[
                f'{m}:no_generic_owner_survived'],
            'of_those_owner_never_generated_a_row': counts[f'{m}:owner_never_generated_a_row'],
            'of_those_owner_rejected_by_a_later_gate': (
                counts[f'{m}:no_generic_owner_survived']
                - counts[f'{m}:owner_never_generated_a_row']),
            'real_coexistence_decisions': (
                counts[f'{m}:raw_candidates'] - counts[f'{m}:no_generic_owner_survived']),
            'justified_pending_a_source_not_counted_as_yield': counts[
                f'{m}:MARKET_PAGE_JUSTIFIED_PENDING_SOURCE'],
            'entities_in_the_foreign_destination_measurement': counts[
                f'{m}:entity_in_the_foreign_destination_measurement'],
            'net_new_valid_pages': just,
            'yield_rate': round(just / raw, 4) if raw else 0.0,
            'compared_with': COMPARED_WITH[m],
            'reconciles': raw == just + dup + gen + insf + pend,
        }

    summary = {
        'generated': STAMP,
        'what_this_is': (
            'an OFFLINE test of whether market-scoped URLs would create pages a reader needs. '
            'Nothing here is published: no route, no sitemap, no redirect, no cohort. Existing '
            '/en/ and /es/ URLs are untouched and no migration is proposed.'),
        'population': (
            'every (family, entity, language) contest the ownership rule resolved in which a '
            'market under test was shut out of the single language-scoped URL'),
        'markets_under_test': UNDER_TEST,
        'yield': yields,
        'net_new_valid_pages_total': sum(v['net_new_valid_pages'] for v in yields.values()),
        'raw_candidates_total': sum(v['raw_candidates'] for v in yields.values()),
        'by_overlap': {k: dict(v) for k, v in sorted(overlap.items())},
        'why_the_generic_owner_was_missing': {
            m: {k.split(':owner_removed_as:')[1]: v for k, v in counts.items()
                if k.startswith(f'{m}:owner_removed_as:')} for m in UNDER_TEST},
        'entity_level_demand_hits': {
            m: {'named_in_its_own_admission_measurement':
                counts[f'{m}:entity_named_in_own_admission_measurement'],
                'present_in_the_cross_language_reach_file':
                counts[f'{m}:entity_in_cross_language_reach_file']} for m in UNDER_TEST},
        'information_gain_kinds_earned': dict(gain_kinds_seen),
        'information_gain_kinds_with_no_source_yet': GAIN_KINDS_WITH_NO_SOURCE_YET,
        'gain_kinds_accepted_as_sufficient': GAIN_SUFFICIENT,
        'gain_kinds_insufficient_alone': GAIN_NOT_SUFFICIENT,
        'top_families_by_decision': {
            m: dict(by_family[m].most_common(25)) for m in UNDER_TEST},
        'decisions': DECISIONS,
        'entity_level_demand_sources': {
            'cross_language_reach_file': (
                'reports/livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv, which '
                'predates the admission of both markets under test and carries no row for '
                'either. It cannot say anything about them, which is not the same as saying '
                'they have no demand'),
            'own_admission_measurement': {
                m: {'travel_keywords': len(ADM.get(m, ([], []))[0]),
                    'travel_volume': sum(k[2] for k in ADM.get(m, ([], []))[0]),
                    'product_keywords_refused_by_the_family_gate':
                        [k[1] for k in ADM.get(m, ([], []))[1]],
                    'every_travel_keyword_names_a_place_in':
                        MKT_COUNTRY.get(m, '')}
                for m in UNDER_TEST},
        },
    }
    with open(OUT + 'MARKET-URL-EXPERIMENT.json', 'w') as fh:
        json.dump(summary, fh, indent=1, ensure_ascii=False)

    print(json.dumps({'yield': yields,
                      'net_new_valid_pages_total': summary['net_new_valid_pages_total']},
                     indent=1))
    print(f'rows written: {len(out_rows):,} -> MARKET-URL-EXPERIMENT.csv.gz', file=sys.stderr)


if __name__ == '__main__':
    main()
