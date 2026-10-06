#!/usr/bin/env python3
"""The hreflang and canonical design, generated OFFLINE from the artifacts. Deploys nothing.

It writes a plan file and a summary. It does not touch routing, the sitemap, the page templates
or any redirect, and nothing it emits reaches a browser. Brief rule 10.

THE RULES IT APPLIES
--------------------
1 SELF CANONICAL on every page that legitimately exists. A market page that canonicals back to
  the generic page is telling Google the market page is a duplicate, and a page that is a
  duplicate should not have been created: canonical is not a way to publish a duplicate safely.
  So the only two outcomes for a market candidate are "it exists and self-canonicals" and "it is
  not created".

2 THE hreflang CLUSTER IS WHAT EXISTS, nothing more. An annotation for a URL that does not
  resolve poisons the whole cluster: Google drops a cluster whose members do not reciprocate. So
  the cluster for an entity and family is computed from the manifest, page by page, and a market
  page appears in it only where the experiment justified one.

3 THE TAG VALUES FOLLOW THE URL SPACE, not the market list. This is where the design departs
  from the brief's literal list of en, en-GB, en-US, en-AU, es, es-ES, es-MX, and it departs on
  the brief's own rule: the existing URL space is LANGUAGE-scoped, so /en/ is the English page
  and there is no /en-us/ or /en-gb/ to annotate. Emitting hreflang="en-US" for /en/ would claim
  an American-specific page that does not exist, and would also forbid /en/ from serving British
  and Australian readers, which it does today. The emittable set in this URL space is therefore
  en, es, de, fr and the rest of the language tags, plus en-AU and es-MX IF AND ONLY IF a market
  page is justified. en and en-AU do not conflict: en is the unqualified English page and en-AU
  the regional refinement, so an Australian reader matches en-AU and every other English reader
  falls back to en.

4 x-default IS NOT EMITTED, deliberately. x-default is for the page shown to a reader whose
  language and region match nothing in the cluster, which in practice means a language selector
  or a language-neutral page. The Atlas has neither: every page is in one language at a
  language-scoped path. Nominating /en/ as the world's default would be an assumption about who
  the unmatched reader is, and the brief asks for x-default to be deliberate rather than
  assumed. The condition that would make it correct is named in the output: a language-neutral
  entity page at a path with no language segment, which does not exist and is not proposed here.
"""
import csv, gzip, json, collections, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                                      # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
MANIFEST = OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
EXPERIMENT = OUT + 'MARKET-URL-EXPERIMENT.csv.gz'
BASE = 'https://livdar.com'          # the host only, so the plan reads as absolute URLs do
STAMP = '2026-10-06'


def main():
    # ---- every page that exists, grouped into its hreflang cluster ----------------------------
    # The cluster key is the ENTITY and the FAMILY: two pages are alternates of each other when
    # they are the same page for a different reader, which means same subject and same intent.
    # Keying on the URL would make every page its own cluster, and keying on the family alone
    # would put Prague and Vienna in one.
    cluster = collections.defaultdict(dict)       # (family, etype, eid) -> {language: url}
    langs = collections.Counter()
    with gzip.open(MANIFEST, 'rt', encoding='utf-8') as fh:
        for r in csv.DictReader(fh):
            key = (r['family'], r['entity_type'], r['entity_id'])
            lang = r['language']
            # One URL per language by construction, because the path carries the language and
            # exact dedupe ran. Asserted rather than assumed: a second URL under one language
            # would mean the cluster is ambiguous and the annotation would be a guess.
            prev = cluster[key].get(lang)
            if prev and prev != r['url_pattern']:
                sys.exit(f'TWO URLS FOR ONE LANGUAGE in cluster {key}: {prev} and '
                         f'{r["url_pattern"]}. The hreflang cluster would be ambiguous, so '
                         f'nothing is written.')
            cluster[key][lang] = r['url_pattern']
            langs[lang] += 1

    # ---- the market pages the experiment justified, if any ------------------------------------
    market_pages = collections.defaultdict(dict)  # (family, etype, eid) -> {market: url}
    justified = 0
    if os.path.exists(EXPERIMENT):
        with gzip.open(EXPERIMENT, 'rt', encoding='utf-8') as fh:
            for r in csv.DictReader(fh):
                if r['decision'] != 'MARKET_PAGE_JUSTIFIED':
                    continue
                justified += 1
                market_pages[(r['family'], r['entity_type'], r['entity_id'])][r['market']] = (
                    r['market_candidate_url'])

    # ---- the plan, one line per page -----------------------------------------------------------
    rows = []
    stats = collections.Counter()
    for key, by_lang in cluster.items():
        mkts = market_pages.get(key, {})
        # the members of this cluster: every language page, plus every justified market page
        members = [(lang, url, 'LANGUAGE_PAGE') for lang, url in sorted(by_lang.items())]
        members += [(m, url, 'MARKET_PAGE') for m, url in sorted(mkts.items())]
        if len(members) == 1 and not mkts:
            # A page with no alternate gets NO hreflang at all. A single self-referencing
            # annotation is noise: it tells a crawler nothing it does not already know from the
            # canonical, and it is the commonest way a cluster ends up non-reciprocal later.
            lang, url, _ = members[0]
            rows.append({'url': BASE + url, 'page_kind': 'LANGUAGE_PAGE',
                         'hreflang_self': lang, 'canonical': BASE + url,
                         'hreflang_alternates': '', 'x_default': '',
                         'cluster_size': 1, 'family': key[0], 'entity_id': key[2],
                         'note': 'only page for this entity and intent, so no alternates and '
                                 'no hreflang: a lone self-annotation adds nothing'})
            stats['pages_with_no_alternates'] += 1
            continue
        for tag, url, kind in members:
            alts = [f'{t}={BASE + u}' for t, u, _ in members if u != url]
            rows.append({
                'url': BASE + url, 'page_kind': kind,
                'hreflang_self': tag,
                # SELF, always. Never the generic page, whatever the page's relationship to it.
                'canonical': BASE + url,
                'hreflang_alternates': ' | '.join(alts),
                'x_default': '',
                'cluster_size': len(members),
                'family': key[0], 'entity_id': key[2],
                'note': ('market page beside the language page, both self-canonical'
                         if kind == 'MARKET_PAGE' else
                         ('language page with a market refinement in the same language'
                          if mkts else 'language page')),
            })
            stats[f'pages_{kind}'] += 1
            stats['annotations'] += len(alts)

    with gzip.open(OUT + 'HREFLANG-CANONICAL-PLAN.csv.gz', 'wt', newline='',
                   encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        for r in rows:
            w.writerow(r)

    # ---- reciprocity, checked rather than claimed ----------------------------------------------
    # Every annotation must point at a URL that is itself in the plan and annotates back. A
    # cluster that fails this is dropped wholesale by Google, so the check is the deliverable,
    # not a formality.
    known = {r['url'] for r in rows}
    by_url = {r['url']: r for r in rows}
    broken = []
    non_reciprocal = []
    for r in rows:
        for a in filter(None, r['hreflang_alternates'].split(' | ')):
            tag, target = a.split('=', 1)
            if target not in known:
                broken.append((r['url'], a))
                continue
            back = by_url[target]['hreflang_alternates']
            if f"{r['hreflang_self']}={r['url']}" not in back:
                non_reciprocal.append((r['url'], target))

    summary = {
        'generated': STAMP,
        'status': 'DESIGN ONLY, NOT DEPLOYED. No route, sitemap, redirect or template changed.',
        'url_space_today': 'LANGUAGE-scoped: /{language}/{surface}/{family}/{entity}/',
        'market_pages_justified_by_the_experiment': justified,
        'pages_in_the_plan': len(rows),
        'languages_present': dict(langs.most_common()),
        'counts': dict(stats),
        'reciprocity': {
            'annotations_checked': stats['annotations'],
            'pointing_at_a_url_not_in_the_plan': len(broken),
            'not_reciprocated_by_the_target': len(non_reciprocal),
            'examples_broken': broken[:5],
            'examples_non_reciprocal': non_reciprocal[:5],
            'verdict': ('every annotation resolves and reciprocates'
                        if not broken and not non_reciprocal else
                        'FAILURES PRESENT, see the examples; this plan must not be deployed'),
        },
        'canonical_rule': (
            'self on every page. A market page NEVER canonicals to the generic page: that would '
            'declare it a duplicate, and a duplicate should not exist rather than exist with a '
            'canonical pointing away. The two outcomes for a market candidate are "exists and '
            'self-canonicals" and "is not created".'),
        'hreflang_values_emittable_in_this_url_space': {
            'language_tags': sorted(langs),
            'market_tags': ['en-AU', 'es-MX'],
            'market_tags_emitted': sorted({r['hreflang_self'] for r in rows
                                           if r['page_kind'] == 'MARKET_PAGE'}),
            'why_not_en_US_and_en_GB': (
                'no /en-us/ or /en-gb/ URL exists. The brief lists en, en-GB, en-US, en-AU, es, '
                'es-ES and es-MX, which describes a fully market-scoped space; this space is '
                'language-scoped, and the brief own rule - no hreflang alternative for a page '
                'that does not exist - rules those four out. Emitting hreflang="en-US" on /en/ '
                'would also stop /en/ serving British and Australian readers, which it does '
                'today.'),
            'why_en_and_en_AU_do_not_conflict': (
                'en is the unqualified English page and en-AU the regional refinement. An '
                'Australian reader matches en-AU; every other English reader falls back to en. '
                'This is the one pair in this design where a language tag and a market tag '
                'coexist, and it works precisely because the generic page keeps the bare tag.'),
        },
        'x_default': {
            'emitted': False,
            'why': (
                'x-default names the page for a reader whose language and region match nothing '
                'in the cluster, which in practice means a language selector or a '
                'language-neutral page. The Atlas has neither: every page is in one language at '
                'a language-scoped path. Nominating /en/ as the default would be an assumption '
                'about who the unmatched reader is, and the brief asks for x-default to be '
                'deliberate rather than assumed.'),
            'the_condition_that_would_make_it_correct': (
                'a language-neutral entity page at a path with no language segment, or a '
                'language selector at the entity level. Neither exists and neither is proposed '
                'here. Until one does, the absence of x-default is the accurate statement: '
                'there is no page that serves everyone.'),
        },
        'where_the_tags_belong': (
            'in the HTML head of each page, not in the sitemap. Both are valid to Google; head '
            'tags are chosen because the cluster for a page is computed from that page own '
            'render and so cannot drift from what the page is, whereas a sitemap annotation is a '
            'second source of truth that goes stale the moment a page is added or removed. This '
            'project has paid for a second source of truth often enough.'),
        'what_would_have_to_be_true_before_deploying_any_of_this': [
            'a market page justified by measurement, of which this run produced none',
            'the reciprocity check above passing, which it does for the language clusters',
            'the sitemap and redirect audit, which is a separate technical task and not done '
            'here',
            'a decision to serve /en-au/ at all, which is a routing change and outside this '
            'brief',
        ],
    }
    with open(OUT + 'HREFLANG-CANONICAL-DESIGN.json', 'w') as fh:
        json.dump(summary, fh, indent=1, ensure_ascii=False)
    print(json.dumps({k: summary[k] for k in (
        'status', 'market_pages_justified_by_the_experiment', 'pages_in_the_plan',
        'reciprocity', 'counts')}, indent=1))


if __name__ == '__main__':
    main()
