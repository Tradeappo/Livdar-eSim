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
import csv, gzip, collections, json, os, sys, re, hashlib

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
MANIFEST = OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'

STOP = {'in', 'the', 'a', 'an', 'of', 'and', 'for', 'to', 'with', 'on', 'at', 'is',
        'are', 'best', 'top', 'your', 'you'}
LONG_DASHES = ('\u2014', '\u2013', '\u2012', '\u2015', '\u2212')


def undash(s):
    """Replace every long dash with "-", the only dash this project uses.

    Most hits come from entity names that genuinely contain one, such as the
    Italian museum "MIC - Museo dell'Illustrazione Contemporanea". The name in the
    SOURCE data keeps its original form, because rewriting a source record would be
    falsifying it. What Livdar renders is its own text, so the rendered strings are
    normalised and the count of affected source names is reported separately.
    """
    out = s or ''
    for d in LONG_DASHES:
        out = out.replace(d, '-')
    return out


def norm_tokens(s):
    t = re.sub(r'[^0-9a-zÀ-ɏ　-鿿]+', ' ', (s or '').lower())
    return tuple(sorted(w for w in t.split() if w and w not in STOP))


def title_for(r):
    """The title this candidate would render, from its own fields.

    Keyed on SURFACE, not on family prefixes. Guessing prefixes missed relocation.* whose
    surface is "move", so those titles fell through to the bare name and reported 25,580
    collisions that were my skeleton's fault rather than the inventory's. The surface set
    is small, known and stable; family names are neither.
    """
    name = undash(r['entity_name'] or r['entity_id'])
    city, area, country = undash(r['city']), undash(r['neighbourhood']), r['country']
    fam, surface = r['family'], r['surface']
    where = f"{city}, {country}" if city and country else (city or country or '')
    qualified = f"{name}, {country}" if country and country not in name else name
    # Several families share one surface. Keying the skeleton on surface alone gave
    # activities.city-things-to-do and destinations.city-hub the SAME title for Berlin,
    # which is a defect in the simulation rather than in the inventory: the two pages are
    # genuinely different and a real title set would say so. The family's own second
    # segment is what distinguishes them.
    fam_label = (fam.split('.', 1)[1] if '.' in fam else fam).replace('-', ' ')

    if r['page_type'] == 'ENTITY':
        return f"{name}{', ' + where if where else ''}: what to know before you go"
    if fam == 'areas.city-index':
        return f"Neighbourhoods of {where}: which area suits you"
    if fam == 'areas.overview':
        return f"{area}, {where}: what the area is like"
    if surface == 'places':
        return f"{qualified}: {fam_label}, the full list from open data"
    if surface == 'pulse':
        return f"{qualified}: {fam_label}, dates and what is open"
    if surface == 'tools':
        return f"{name}: work it out with your own numbers"
    if surface == 'climate':
        return f"{qualified}: {fam_label}, what it is actually like"
    if surface == 'areas':
        return f"{qualified}: {fam_label}"
    if surface == 'move':
        return f"{qualified}: {fam_label}"
    if surface == 'stay':
        return f"{qualified}: {fam_label}"
    if surface == 'work':
        return f"{qualified}: {fam_label}"
    if surface == 'money':
        return f"{qualified}: {fam_label}"
    if surface == 'safety':
        return f"{qualified}: {fam_label}"
    return f"{qualified}: {fam_label}"


def meta_for(r):
    name = undash(r['entity_name'] or r['entity_id'])
    reason = undash((r.get('uniqueness_reason') or '').split(':')[0])
    if r['page_type'] == 'ENTITY':
        return f"{name}: location, hours where published, and how to get there."
    return f"{name}. {reason[:110]}."


def h1_for(r):
    name = undash(r['entity_name'] or r['entity_id'])
    if r['family'] == 'areas.overview':
        return undash(f"{r['neighbourhood']}, {r['city']}")
    if r['family'] == 'areas.city-index':
        return undash(f"Neighbourhoods of {r['city']}")
    return name


rows = []
with gzip.open(MANIFEST, 'rt', encoding='utf-8', newline='') as f:
    for r in csv.DictReader(f):
        rows.append(r)
print(f'manifest rows: {len(rows):,}', file=sys.stderr)

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
    own = (r['entity_name'] or '').casefold()
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
orphans = collections.Counter()
for r in rows:
    pu = r['_parent']
    has_parent = pu in urls
    has_sibling = sib[pu] > 1
    r['_orphan'] = not (has_parent or has_sibling)
    if r['_orphan']:
        orphans[r['family']] += 1
issues['orphan_pages'] = sum(orphans.values())

summary = {
    'manifest_rows': len(rows),
    'distinct_urls': len(urls),
    'checks': dict(issues),
    'orphans_by_family': dict(orphans.most_common(25)),
    'saturated_templates': saturated[:25],
    'duplicate_examples': dupe_examples[:25],
    'shared_uniqueness_reason_by_family': dict(reason_dupes.most_common(20)),
    'shared_uniqueness_reason_examples': reason_examples,
    'long_dash_examples': dash_hits,
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
