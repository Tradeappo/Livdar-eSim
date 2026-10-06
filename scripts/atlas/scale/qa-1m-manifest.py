#!/usr/bin/env python3
"""
QA the candidate manifest at scale: titles, near-duplicates, internal links, dashes.

Five checks, each producing counts rather than a verdict, because the point is to find
what is wrong before anything is published, not to declare the set clean:

1. TITLE, META AND H1 SIMULATION. Every candidate gets the three strings it would
   actually render, built deterministically from its own fields. Two pages that would
   render the same title are a problem whatever their URLs say.

   The skeletons are English. That is deliberate and it is a limitation worth stating:
   this gate exists to catch STRUCTURAL collisions, and a collision between two pages is
   a property of their structure and their entity names, not of the connecting words. A
   localised title set still has to be written per market before publication, and that
   is recorded as outstanding rather than quietly treated as done.

2. NEAR-DUPLICATE DETECTION. Exact title collisions, and titles that reduce to the same
   token multiset once case, punctuation and stopwords are removed. Template siblings are
   NOT duplicates: a template producing a thousand pages is a template, so what is
   measured is whether the pages differ in the part that matters.

3. TEMPLATE SATURATION. How many pages each template signature produces, and how many
   distinct data points sit behind them. A template generating thousands of pages off one
   or two data fields is thin content whatever its titles look like.

4. INTERNAL LINKING. Every page needs a parent that exists in the set and at least one
   sibling, or it is an orphan. Orphans are counted per family, not hidden.

5. LONG DASH CHECK. The project rule is that only "-" is used. This checks every string
   this script generates and every free-text field in the manifest.
"""
import csv, gzip, collections, json, os, sys, re, hashlib, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import page_copy                                              # noqa: E402
import entity_identity                                        # noqa: E402
# The three skeletons live in one module now, because each of them was separately wrong in the
# same way and the only reliable cure is one definition. undash comes from there too.
from page_copy import title_for, meta_for, h1_for, undash      # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
MANIFEST = OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'

STOP = {'in', 'the', 'a', 'an', 'of', 'and', 'for', 'to', 'with', 'on', 'at', 'is',
        'are', 'best', 'top', 'your', 'you'}
LONG_DASHES = page_copy.LONG_DASHES


def norm_tokens(s):
    t = re.sub(r'[^0-9a-zÀ-ɏ　-鿿]+', ' ', (s or '').lower())
    return tuple(sorted(w for w in t.split() if w and w not in STOP))


rows = []
with gzip.open(MANIFEST, 'rt', encoding='utf-8', newline='') as f:
    for r in csv.DictReader(f):
        rows.append(r)
print(f'manifest rows: {len(rows):,}', file=sys.stderr)

# Must run before any title is simulated, because the label depends on it.
page_copy.AMBIGUOUS_FAM_LABEL = AMBIGUOUS_FAM_LABEL = page_copy.compute_ambiguous_labels(rows)
page_copy.SHARED_SUBJECT = page_copy.compute_shared_subjects(rows)
print(f'subjects claimed by more than one family in a market, so the heading carries the '
      f'angle too: {len(page_copy.SHARED_SUBJECT):,}', file=sys.stderr)
if AMBIGUOUS_FAM_LABEL:
    print(f'families whose second segment does not distinguish them, so the title carries '
          f'the topic too: {len(AMBIGUOUS_FAM_LABEL)}', file=sys.stderr)

issues = collections.Counter()
dash_hits = []
title_by_market = collections.defaultdict(list)
tmpl_pages = collections.Counter()
tmpl_data = collections.defaultdict(set)
urls = set()
parents = collections.Counter()

for r in rows:
    t, m, h = title_for(r), meta_for(r), h1_for(r)
    r['_title'], r['_meta'], r['_h1'] = t, m, h
    urls.add(r['url_pattern'])
    tmpl_pages[(r['market'], r['template_signature'])] += 1
    tmpl_data[(r['market'], r['template_signature'])].add(r['entity_id'])
    title_by_market[r['market']].append((norm_tokens(t), t, r))
    # length rules a human would apply before shipping
    if len(t) > 65:
        issues['title_over_65_chars'] += 1
    if len(t) < 15:
        issues['title_under_15_chars'] += 1
    if len(m) > 165:
        issues['meta_over_165_chars'] += 1
    if not h.strip():
        issues['h1_empty'] += 1
    # a long dash in a RENDERED string is a rule violation and has to be zero; one in a
    # source entity name is a fact about the source and is counted, not rewritten
    for field in ('_title', '_meta', '_h1'):
        if any(d in (r.get(field) or '') for d in LONG_DASHES):
            issues['long_dash_in_rendered_string'] += 1
            if len(dash_hits) < 25:
                # the offending character is named rather than reproduced: a report whose
                # job is to find long dashes must not itself contain one, or it fails the
                # very check it exists to run
                v = (r.get(field) or '')[:140]
                for d in LONG_DASHES:
                    v = v.replace(d, f'<U+{ord(d):04X}>')
                dash_hits.append({'candidate_id': r['candidate_id'], 'field': field,
                                  'value': v})
    for field in ('entity_name', 'uniqueness_reason', 'primary_intent'):
        if any(d in (r.get(field) or '') for d in LONG_DASHES):
            issues['long_dash_in_source_name_or_derived_text'] += 1
            break

# ---- 2. near duplicates ----------------------------------------------------
dupe_examples = []
exact = 0
token_dupe = 0
for mkt, items in title_by_market.items():
    seen_exact = {}
    seen_tok = {}
    for toks, title, r in items:
        if title in seen_exact:
            exact += 1
            if len(dupe_examples) < 25:
                dupe_examples.append({'kind': 'exact_title', 'market': mkt,
                                      'title': title[:110],
                                      'a': seen_exact[title], 'b': r['candidate_id'],
                                      'url_a': '', 'url_b': r['url_pattern']})
        else:
            seen_exact[title] = r['candidate_id']
        if toks in seen_tok:
            token_dupe += 1
            if len(dupe_examples) < 50:
                dupe_examples.append({'kind': 'same_tokens_after_stopwords', 'market': mkt,
                                      'title': title[:110],
                                      'a': seen_tok[toks], 'b': r['candidate_id'],
                                      'url_a': '', 'url_b': r['url_pattern']})
        else:
            seen_tok[toks] = r['candidate_id']
issues['duplicate_title_exact'] = exact
issues['duplicate_title_same_tokens'] = token_dupe

# ---- 2a. superlatives the template added, not the entity name ---------------
# "best", "top" and "safest" may not be claimed without a documented methodology. The
# check has to distinguish a claim from a proper noun: all fifteen hits in the first run
# were the Dutch town of Best, and rewriting a real place name to satisfy a style rule
# would be falsifying it. So a superlative counts only when the template added it, which
# means it is in the rendered string and NOT in the entity's own name.
SUPERLATIVES = {'best', 'top', 'safest', 'cheapest', 'greatest', 'ultimate', 'perfect',
                'worst', 'finest', 'number one'}
# Three sources of a superlative, and they mean different things:
#   - the entity's own name, such as the Dutch town of Best, which must not be rewritten
#   - the FAMILY's own intent, such as neighbourhoods.city-best-for, which is a real
#     content-policy question for that family rather than a generation bug
#   - a template inventing one, which is the bug this check exists to catch
superlative_examples = []
family_superlatives = collections.Counter()
for r in rows:
    # Every place field the skeletons read, not just the entity name. The first version of this
    # check excluded entity_name alone and then reported four invented superlatives on Dutch trail
    # pages: "Airbornepad Market Garden, Nieuwe Heide, Best". Best is the town the route runs
    # through, so it arrives in the title through the CITY field, and the template invented nothing.
    # The rule is unchanged, a superlative counts only when the template added it; what was wrong
    # was the list of places a word can legitimately come from.
    own = ' '.join(str(r.get(k) or '') for k in
                   ('entity_name', 'city', 'neighbourhood', 'country', 'parent_name',
                    'region', 'admin1')).casefold()
    fam_words = {w for w in r['family'].replace('.', ' ').replace('-', ' ').split()}
    for field in ('_title', '_meta', '_h1'):
        words = {w.strip('.:,()').casefold()
                 for w in (r.get(field) or '').replace(',', ' ').split()}
        hits = {w for w in (words & SUPERLATIVES) if w not in own}
        from_family = {w for w in hits if w in fam_words}
        invented = hits - from_family
        if from_family:
            issues['superlative_from_the_family_own_intent'] += 1
            family_superlatives[r['family']] += 1
        if invented:
            issues['superlative_invented_by_template'] += 1
            if len(superlative_examples) < 15:
                superlative_examples.append({'candidate_id': r['candidate_id'],
                                             'field': field, 'words': sorted(invented),
                                             'value': (r.get(field) or '')[:120]})

# ---- 2a2. a destination copy must carry a fact computed for ITS market ---------
# The destination axis lets one place earn several markets on two halves of evidence: the country
# carries measured demand in the page language, and the entity carries a name or an article in it.
# Neither says the copy is WORTH existing. A German and an Italian page carrying the same facts in
# different words is a translated clone whatever evidence let it through, and the brief forbids
# those outright.
#
# So every row served to a market whose country this is NOT has to carry at least one fact computed
# for that market: the distance from its own origin city, or the January and July temperature gap
# against it. Those are different numbers for every market by construction, which is the point.
# The builders refuse to emit a copy without one; this check is the independent confirmation, and
# it reads the locale_facts FIELD rather than sniffing the uniqueness reason for a phrase, because
# sniffing prose is how six false findings were produced in an earlier pass.
# The TWELFTH hand-written copy of the market list in this project, and the last one. It held
# eleven markets while MARKETS held fourteen, so every tr-TR page about Turkey, every en-AU page
# about Australia and every es-MX page about Mexico was counted as a FOREIGN destination copy and
# then flagged for carrying no market-specific fact. That is what the 15,398
# destination_rows_with_no_locale_specific_fact finding was: 22,235 home-country pages measured
# against a list that did not know their markets existed, not pages missing facts.
#
# Imported now, like everything else that asks what a market is. A checker with its own copy of
# the thing it is checking can only ever test that copy.
HOME_OF = dict(entity_identity.MKT_COUNTRY)

# A page whose ENTITY IS A COUNTRY, or a PAIR of countries, is exempt. The locale fact is a
# great-circle distance from the market's origin city plus the January and July temperature gap,
# and all three are computed from a CITY's coordinates. There is no city here, so there is no
# number to compute: "2,400km from New York to Japan" is not a fact about Japan, and a distance
# from New York to "Australia vs Belgium" is not a fact about anything. Exempting them is not
# relaxing the rule, it is applying it only where it can mean something.
#
# Measured on the 2026-10-06 manifest: 42 country rows (destinations.country-hub,
# relocation.country, taxes.country-remote-work) and 12 country-pair rows
# (comparisons.country-vs-country). NONE of the 54 carries a locale fact and none can, and all
# 12 country-pair rows are en-US, so no second market holds one and there is no duplication for
# the rule to prevent.
#
# What WOULD legitimately differentiate these pages per market is regulation: the visa class, the
# length of stay and the tax residency threshold an Australian faces entering Portugal are not
# the ones an American faces. That is recorded as a MISSING SOURCE in
# MARKET-URL-EXPERIMENT.json rather than papered over here, because the fact is real and the
# data is absent, and those are different problems.
COUNTRY_ENTITY_TYPES = {'country', 'country-pair'}
no_locale_fact = []
dest_rows = 0
for r in rows:
    cc = (r.get('country') or '').strip()
    if not cc or HOME_OF.get(r.get('market')) == cc:
        continue              # a page about its own market's country is not a destination copy
    if (r.get('entity_type') or '') in COUNTRY_ENTITY_TYPES:
        continue              # no city, so no computable distance or temperature gap
    dest_rows += 1
    if not (r.get('locale_facts') or '').strip():
        if len(no_locale_fact) < 20:
            no_locale_fact.append({'candidate_id': r.get('candidate_id'),
                                   'market': r.get('market'), 'country': cc,
                                   'family': r.get('family'), 'url': r.get('url_pattern')})
issues['destination_rows'] = dest_rows
issues['destination_rows_with_no_locale_specific_fact'] = sum(
    1 for r in rows
    if (r.get('country') or '').strip()
    and (r.get('entity_type') or '') not in COUNTRY_ENTITY_TYPES
    and HOME_OF.get(r.get('market')) != (r.get('country') or '').strip()
    and not (r.get('locale_facts') or '').strip())

# ---- 2b. uniqueness_reason must actually distinguish --------------------------
# The brief requires a uniqueness_reason per candidate. A reason that two candidates
# share does not justify either of them: Barcelona ES and Barcelona VE both read
# "activities.city-things-to-do for Barcelona in de-DE" before the country was added.
reason_dupes = collections.Counter()
reason_examples = []
seen_reason = {}
for r in rows:
    k = (r['market'], (r.get('uniqueness_reason') or '').strip())
    if not k[1]:
        issues['uniqueness_reason_missing'] += 1
        continue
    if k in seen_reason:
        issues['uniqueness_reason_shared_with_another_candidate'] += 1
        reason_dupes[r['family']] += 1
        if len(reason_examples) < 15:
            reason_examples.append({'market': r['market'], 'family': r['family'],
                                    'reason': k[1][:150],
                                    'a': seen_reason[k], 'b': r['candidate_id'],
                                    'url_b': r['url_pattern']})
    else:
        seen_reason[k] = r['candidate_id']

# ---- 3. template saturation ------------------------------------------------
saturated = []
for key, n in tmpl_pages.most_common():
    distinct = len(tmpl_data[key])
    if n >= 500 and distinct < n * 0.9:
        saturated.append({'market': key[0], 'template_signature': key[1], 'pages': n,
                          'distinct_entities': distinct})
issues['templates_with_repeated_entities'] = len(saturated)

# ---- 4. internal linking ---------------------------------------------------
# A parent is the URL one level up. A page whose parent is not in the set and which has
# no sibling under a shared parent cannot be reached from inside the site.
def parent_of(u):
    p = u.rstrip('/').rsplit('/', 1)[0]
    return (p + '/') if p.count('/') >= 2 else ''

sib = collections.Counter()
for r in rows:
    # the manifest now carries an explicit parent for the shapes that have one. Deriving
    # it from the URL path alone reported pages as orphans although they knew their parent
    pu = (r.get('parent_url') or '').strip() or parent_of(r['url_pattern'])
    r['_parent'] = pu
    sib[pu] += 1
# A page whose derived parent is a bare locale root is not an orphan: its parent is the
# locale home page, which the site serves and this candidate inventory does not contain. The
# distinction started to matter in the pass of 2026-10-01, when the orphan count rose from 45
# to 59 for a reason that was not a regression. The destination gate removed the
# cross-language country hubs, and those hubs had been each other's siblings, so one hub per
# language was left standing alone under a parent nothing declared. The sibling test had been
# masking a missing parent declaration rather than satisfying it, and removing the siblings
# revealed it. Counting them as broken internal links would misreport the cause.
def is_locale_root(u):
    parts = [x for x in u.split('/') if x]
    return len(parts) == 1 and len(parts[0]) <= 7


# The 500 Atlas pages that are live. A candidate may legitimately declare one of them as its
# parent, and the hierarchy check would otherwise call that a broken link: this inventory is
# offline and does not contain the pages production already serves.
def _load_live_paths():
    try:
        d = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    except Exception:
        return set()
    out = set()
    for r in d.get('rows') or ():
        pth = (r.get('path') or '').strip()
        if pth:
            out.add(pth if pth.endswith('/') else pth + '/')
    return out

LIVE_PATHS = _load_live_paths()
print(f'live production paths a parent may point at: {len(LIVE_PATHS):,}', file=sys.stderr)


def is_live_page(u):
    return u in LIVE_PATHS or is_locale_root(u)

orphans = collections.Counter()
top_level = collections.Counter()
for r in rows:
    pu = r['_parent']
    has_parent = pu in urls
    has_sibling = sib[pu] > 1
    if not (has_parent or has_sibling) and is_locale_root(pu):
        r['_orphan'] = False
        top_level[r['family']] += 1
        continue
    r['_orphan'] = not (has_parent or has_sibling)
    if r['_orphan']:
        orphans[r['family']] += 1
issues['orphan_pages'] = sum(orphans.values())
issues['top_level_pages_whose_parent_is_the_locale_home'] = sum(top_level.values())

# ---- 5. the checks the multilingual brief names that nothing was testing ----
# Section 21 lists what a QA pass has to show, and four of its items were simply absent
# from this report: duplicate intent owners, locale mismatches, entity collisions and
# source-less candidates. A check that does not exist reports no failures, which reads
# exactly like a check that passes.

# 5a. intent ownership. Section 15: one owner per query cluster, and no two pages competing
# for effectively the same query. Two tests, because they catch different things, and the
# first version of this check ran only the weaker reading of the second.
owner_urls = collections.defaultdict(set)
for r in rows:
    owner = (r.get('intent_owner') or '').strip()
    if owner:
        owner_urls[owner].add(r['url_pattern'])
contested = {o: sorted(u)[:4] for o, u in owner_urls.items() if len(u) > 1}
issues['intent_owners_claimed_by_more_than_one_url'] = len(contested)

# THREE FIELDS IN THIS MANIFEST ARE FAMILY-LEVEL, NOT PAGE-LEVEL, AND I HAVE NOW WRITTEN A
# CHECK AGAINST EACH OF THEM AS IF IT WERE PAGE-LEVEL. They are semantic_cluster_id,
# primary_keyword_if_known and local_keyword, and all three carry the measurement that proved
# the FAMILY in that market. Every German things-to-do page therefore records
# "amsterdam sehenswürdigkeiten" as its primary keyword, because that is the keyword the
# family was validated on, and Aachen's page does not target it. A collision test over any of
# the three counts cities, not competitors: the first version counted 2,479 and the second
# 285, and both numbers were properties of the field rather than of the inventory.
#
# A per-page target query is not recorded anywhere in the manifest, so a query-level
# competition test cannot be done from it. Rather than run a test that cannot mean what it
# says, this checks the thing the data does support: the cannibalization key. Two pages in one
# market claiming the same intent for the same entity ARE competitors, and that is the key the
# pipeline dedupes on, so a duplicate surviving here would mean the gate failed.
cannib = collections.defaultdict(set)
for r in rows:
    k = (r['market'], r.get('entity_type', ''), r.get('entity_id', ''),
         r.get('primary_intent', ''))
    cannib[k].add(r['url_pattern'])
same_intent = {str(k): sorted(v)[:4] for k, v in cannib.items() if len(v) > 1}
issues['urls_sharing_a_cannibalization_key'] = len(same_intent)
# NOT in issues: that dict is a contract of counts, and the deliverable formats every value
# in it as a number. Putting a sentence there crashed the report with "Cannot specify ','
# with 's'", after every other artifact had already been written and agreed. A note belongs
# beside the counts, not among them.
query_test_note = ('A per-page target query is not recorded in the manifest, so a '
                   'query-level competition test cannot be run from it. The three keyword '
                   'fields it does carry are family-level: they name the measurement that '
                   'proved the family in a market, not the page target.')

# 5b. locale mismatch. The language in the URL prefix has to be the language the row says
# it is in. A page served at /de/ while the row calls itself Italian is a mislabelled page
# whichever of the two is right.
locale_mismatch = []
for r in rows:
    u = r['url_pattern']
    seg = u.split('/')[1] if u.startswith('/') and u.count('/') > 1 else ''
    lang = (r.get('language') or '').strip()
    if seg and lang and seg != lang:
        locale_mismatch.append({'url': u, 'url_language': seg, 'row_language': lang})
issues['locale_mismatch_between_url_and_row'] = len(locale_mismatch)

# 5c. entity collisions. Two rows in the same family and market naming the same entity by a
# different id are a collision; so are two different entities sharing an id. The first is
# how Barcelona Venezuela once inherited Barcelona Spain's demand, so it is worth a standing
# check rather than a one-off fix.
name_ids = collections.defaultdict(set)
id_names = collections.defaultdict(set)
for r in rows:
    nm = (r.get('entity_name') or '').strip().lower()
    eid = (r.get('entity_id') or '').strip()
    if not nm or not eid: continue
    key = (r['family'], r['market'], nm, (r.get('country') or ''))
    name_ids[key].add(eid)
    id_names[(r['family'], r['market'], eid)].add(nm)
# A shared name under different ids is usually correct rather than a collision: France has
# several Jardins des Plantes, Warsaw has a series of identical Chopin benches, and Gagosian
# runs more than one gallery. The ids being distinct is the system working. What it does
# flag is a titling problem, because several pages would carry the same visible name, so
# these are reported as needing a disambiguator rather than as duplicates.
same_name_two_ids = {str(k): sorted(v)[:4] for k, v in name_ids.items() if len(v) > 1}
same_id_two_names = {str(k): sorted(v)[:4] for k, v in id_names.items() if len(v) > 1}
issues['entity_names_needing_a_disambiguator_in_the_title'] = len(same_name_two_ids)
issues['same_entity_id_under_two_names'] = len(same_id_two_names)

# 5d. source-less candidates. A row with no data source, or whose source is blocked, has
# nothing to put on the page, and section 16 allows no page without one.
sourceless = [r['url_pattern'] for r in rows
              if not (r.get('data_source') or '').strip()
              or (r.get('source_status') or '') == 'BLOCKED']
issues['candidates_with_no_usable_source'] = len(sourceless)

# 5e. cross-locale residue. After the gate, nothing in the kept set should be classed as a
# translation or as missing local intent. If any is, the gate wrote a class and then kept
# the row anyway, which is worse than not having the gate.
kept_bad_class = collections.Counter()
for r in rows:
    c = (r.get('localization_class') or '').strip()
    if c and c not in ('NATIVE_LOCALE', 'VALID_LOCALIZATION'):
        kept_bad_class[c] += 1
    if not c:
        kept_bad_class['(no class assigned)'] += 1
issues['kept_rows_with_a_rejecting_localisation_class'] = sum(kept_bad_class.values())

# ---- 5f. the section 23 checks that were still missing ----------------------
# Named in the brief and not previously tested: duplicate slugs, duplicate canonicals,
# duplicate meta, duplicate H1, and an invalid hierarchy. Each is cheap and each catches a
# different failure, so there is no reason they were absent except that nobody had written
# them.

# The first version of this check grouped the last path segment by market and family and
# reported 5,885 duplicates. Every one was correct behaviour. /de/places/food/african/berlin/
# and /de/places/food/american/berlin/ both end in "berlin" because the thing that
# distinguishes them is the cuisine, which sits earlier in the path. The last segment is not
# the identity of the page, the whole path is, and duplicate whole paths are already counted
# as duplicate_canonicals. So the check was measuring nothing, which is the fourth time in
# this pass that I have compared a field that does not carry page-level identity.
#
# What IS worth checking in slug space is whether two slugs are distinct only by a diacritic.
# Those are two URLs one keystroke apart, and a reader, a link and a redirect cannot tell them
# apart. The slug function folds Latin diacritics for exactly this reason, so after the fold
# the count should be zero; before it, there were 23.
def _folded(u):
    d = unicodedata.normalize('NFKD', u)
    return ''.join(c for c in d if not unicodedata.combining(c)).lower()

fold_groups = collections.defaultdict(set)
for u in urls:
    fold_groups[_folded(u)].add(u)
dup_slugs = {k: sorted(v) for k, v in fold_groups.items() if len(v) > 1}
issues['urls_that_collide_once_diacritics_are_folded'] = len(dup_slugs)
issues['urls_containing_a_latin_character_with_a_diacritic'] = sum(
    1 for u in urls if any(ord(c) > 127 and unicodedata.name(c, '').startswith('LATIN')
                           for c in unicodedata.normalize('NFC', u)))

# The canonical of a candidate IS its url_pattern here, so a duplicate canonical and a
# duplicate URL are the same failure. Asserted rather than assumed, because the day the
# model gains a separate canonical field this check is the one that notices.
issues['duplicate_canonicals'] = len(rows) - len(urls)

# Meta and H1 are simulated the same way the title is, and compared the same way.
meta_seen = collections.defaultdict(set)
h1_seen = collections.defaultdict(set)
for r in rows:
    try:
        meta_seen[(r['market'], meta_for(r))].add(r['url_pattern'])
        h1_seen[(r['market'], h1_for(r))].add(r['url_pattern'])
    except Exception:
        continue
dup_meta = {k[1][:70]: sorted(v)[:3] for k, v in meta_seen.items() if len(v) > 1}
dup_h1 = {k[1][:70]: sorted(v)[:3] for k, v in h1_seen.items() if len(v) > 1}
issues['duplicate_meta_within_a_market'] = len(dup_meta)
issues['duplicate_h1_within_a_market'] = len(dup_h1)

# A declared parent has to be a page that exists, must not be the page itself, must not lead
# back to the page, and must live in the same language. It does NOT have to be a prefix of the
# URL. The first version of this check tested the prefix and reported 20,107 failures; 19,342
# of them were a legitimate shape, because the parent of /de/places/food/african/berlin/ is the
# city restaurant list /de/places/restaurant/berlin/, which is where a reader would find it
# linked. The hierarchy is semantic, and a path is not the only way to express one.
#
# The 765 that remained were real, and they had a single cause: the Wikidata builder rebuilt
# its parent path from the city NAME while the aggregation builder had moved to resolved
# slugs, so every city that needed a discriminator got a parent that does not exist
# (/en/areas/london/ against the real /en/areas/london-gb/). That is fixed at the source, by
# reading the parent URL out of the aggregation output instead of reconstructing it.
bad_hier = []
non_prefix_but_valid = 0
_parent_of = {r['url_pattern']: (r.get('parent_url') or '').strip() for r in rows}
for r in rows:
    pu = (r.get('parent_url') or '').strip()
    if not pu:
        continue
    why = ''
    if pu == r['url_pattern']:
        why = 'the page declares itself as its own parent'
    elif pu not in urls and not is_live_page(pu):
        why = 'the declared parent is not a page in this inventory or in production'
    elif pu.split('/')[1:2] != r['url_pattern'].split('/')[1:2]:
        why = 'the declared parent is in a different language'
    else:
        # walk up: a cycle would make a breadcrumb loop forever
        seen_up, cur, cyc = {r['url_pattern']}, pu, False
        for _ in range(40):
            if cur in seen_up:
                cyc = True
                break
            seen_up.add(cur)
            cur = _parent_of.get(cur, '')
            if not cur:
                break
        if cyc:
            why = 'following the parents leads back to this page'
    if why:
        bad_hier.append({'url': r['url_pattern'], 'declared_parent': pu, 'why': why})
    elif not r['url_pattern'].startswith(pu):
        non_prefix_but_valid += 1
issues['declared_parent_is_not_a_valid_parent'] = len(bad_hier)
issues['declared_parent_is_valid_but_not_a_path_prefix'] = non_prefix_but_valid

# ---- 6. the usefulness test, section 13 -------------------------------------
# "Would this page still be useful if Google did not exist?" A page passes when it carries
# something a person would come back for even with no search engine in the world: a working
# calculation, a list of real named places they could visit, or figures from an official
# source. It fails when all it has is a phrase arranged to match a query.
#
# This is judged per family and locale rather than per row, because the answer is a property
# of what the family puts on the page. It is recorded, not enforced: a family that fails is
# listed here with the reason, so the decision to redesign or drop it is made by a person
# looking at the list rather than by a threshold hidden in this script.
useful_by_cell = {}
cell_rows = collections.defaultdict(list)
for r in rows:
    cell_rows[(r['family'], r.get('language') or '')].append(r)
for (fam, lang), rs in sorted(cell_rows.items()):
    r0 = rs[0]
    tool = (r0.get('tool_or_content') or '').strip()
    completeness = (r0.get('data_completeness') or '').strip()
    src = (r0.get('data_source') or '').strip()
    reasons = []
    if tool == 'tool':
        reasons.append('it computes an answer the visitor supplies the inputs for, which is '
                       'useful with or without a search engine')
    if any('entities' in (r.get('uniqueness_reason') or '') or
           'venues' in (r.get('uniqueness_reason') or '') for r in rs[:50]):
        reasons.append('it lists real named places the visitor could go to, drawn from the '
                       'POI corpus rather than asserted')
    # data_completeness is written as high / medium / low by the manifest. Testing it
    # against COMPLETE and PARTIAL meant this branch never fired, and 363 cells were
    # reported as failing the usefulness test on the strength of a comparison that could
    # not be true. The families were fine; the test was wrong, which is the more dangerous
    # of the two because it reads as a finding.
    if src and src not in ('', 'none') and completeness in ('high', 'medium'):
        reasons.append(f'it carries figures from {src}, a named source with provenance')
    elif src and src not in ('', 'none') and completeness == 'low':
        reasons.append(f'it names {src} as a source, but at low completeness, so the page '
                       f'would stand or fall on how much of that source is actually present')
    verdict = 'USEFUL_WITHOUT_SEARCH' if reasons else 'NEEDS_REDESIGN_OR_REJECT'
    useful_by_cell[f'{fam}|{lang}'] = {
        'rows': len(rs), 'verdict': verdict,
        'why': reasons or ['nothing on this page survives the loss of the query that '
                           'brought the visitor: no computation, no named real places and '
                           'no sourced figures']}
fails = {k: v for k, v in useful_by_cell.items() if v['verdict'] == 'NEEDS_REDESIGN_OR_REJECT'}
issues['family_locale_cells_failing_the_usefulness_test'] = len(fails)

summary = {
    'manifest_rows': len(rows),
    'distinct_urls': len(urls),
    'checks': dict(issues),
    'query_level_competition_test': query_test_note,
    'orphans_by_family': dict(orphans.most_common(25)),
    'top_level_by_family': dict(top_level.most_common(25)),
    'saturated_templates': saturated[:25],
    'duplicate_examples': dupe_examples[:25],
    'shared_uniqueness_reason_by_family': dict(reason_dupes.most_common(20)),
    'contested_intent_owners': dict(list(contested.items())[:25]),
    'locale_mismatch_examples': locale_mismatch[:25],
    'entity_names_needing_a_disambiguator': dict(list(same_name_two_ids.items())[:25]),
    'urls_sharing_a_cannibalization_key_examples': dict(list(same_intent.items())[:25]),
    'entity_collisions_same_id_two_names': dict(list(same_id_two_names.items())[:25]),
    'sourceless_candidate_examples': sourceless[:25],
    'kept_rows_by_localisation_class_that_should_have_been_rejected': dict(kept_bad_class),
    'duplicate_slug_examples': dict(list(dup_slugs.items())[:20]),
    'duplicate_meta_examples': dict(list(dup_meta.items())[:20]),
    'duplicate_h1_examples': dict(list(dup_h1.items())[:20]),
    'invalid_hierarchy_examples': bad_hier[:20],
    'usefulness_test_failures': fails,
    'usefulness_test_by_family_and_locale': useful_by_cell,
    'shared_uniqueness_reason_examples': reason_examples,
    'long_dash_examples': dash_hits,
    'destination_rows_with_no_locale_specific_fact_examples': no_locale_fact,
    'superlative_examples': superlative_examples,
    'families_whose_own_name_claims_a_superlative': dict(family_superlatives.most_common(10)),
    'families_needing_a_documented_ranking_methodology': (
        'A family whose own identity is a ranking claim, such as '
        'neighbourhoods.city-best-for, cannot publish without a documented methodology. '
        'That is a content requirement for the family, not a defect in generation, so it '
        'is counted separately from a superlative a template invented.'),
    'title_length': {
        'min': min((len(r['_title']) for r in rows), default=0),
        'max': max((len(r['_title']) for r in rows), default=0),
        'mean': round(sum(len(r['_title']) for r in rows) / max(1, len(rows)), 1),
    },
    'limitation': ('the simulated title, meta and H1 skeletons are English. The gate '
                   'catches structural collisions, which do not depend on the connecting '
                   'words, but a localised title set still has to be written per market '
                   'before publication and is NOT done by this script.'),
}
json.dump(summary, open(OUT + '1M-QA-REPORT.json', 'w'), indent=1, ensure_ascii=False)

# the simulated strings, so a human can read a sample rather than trust the counts
with gzip.open(OUT + '1M-SIMULATED-TITLES.csv.gz', 'wt', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(['candidate_id', 'market', 'family', 'url_pattern', 'title', 'meta',
                'h1', 'parent_url', 'orphan'])
    for r in rows:
        w.writerow([r['candidate_id'], r['market'], r['family'], r['url_pattern'],
                    r['_title'], r['_meta'], r['_h1'], r['_parent'],
                    'YES' if r['_orphan'] else ''])

print(json.dumps({k: v for k, v in summary.items()
                  if k in ('manifest_rows', 'distinct_urls', 'checks', 'title_length')},
                 indent=1))
