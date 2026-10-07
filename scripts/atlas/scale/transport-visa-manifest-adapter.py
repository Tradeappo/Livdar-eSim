#!/usr/bin/env python3
"""Turn the transport pair and visa stores into candidate rows the manifest can read.

The pair builders and the FCDO ingest wrote their output to disk and nothing read it, so
61,661 pairs and 226 visa cells were built but never passed a single manifest gate. They were
therefore NOT final distinct valid candidates, whatever an interim scoreboard said about them.
This adapter is the missing join: it puts each row into the shape the manifest's aggregation
loop consumes, and from there every gate applies to them exactly as it does to a POI list.

WHICH LANGUAGES, AND WHY ONLY ONE. The 2026-10-07 open-SERP measurement found the pair axis
carries in English and not in German: 346 of 500 English distance rows and 139 of 500 English
route rows name two real places, against 2 of 500 in German, where the tail turns out to be
astronomy, darts and a driving-theory question. So these rows are emitted in English only. The
URLs the builders wrote are already language scoped (/en/transport/route/...), so one row per
pair is the whole of it; a market fan-out would be inventing demand that was measured absent.

WHAT THE MEASUREMENT ALSO SETTLED. The parent topics showed the distance question and the route
question are ONE canonical intent: "how far is kyoto from tokyo" carries the parent "how to get
to kyoto from tokyo", and "how far is madrid from barcelona" carries "trains from barcelona to
madrid". So a pair page must answer distance AND modes AND routes together, and mode is not a
second axis to split on. One page per pair, as the builders already canonicalised it.

Usage: transport-visa-manifest-adapter.py
"""
import gzip, json, os, sys, collections

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/transport/_manifest-candidates.jsonl.gz'

# The English markets. One row carries language 'en' and the market that represents it, because
# the URL is language scoped and the manifest's own cross-market machinery decides the rest.
MARKET, LANG = 'en-US', 'en'

def read(path):
    try:
        with gzip.open(path, 'rt', encoding='utf-8') as fh:
            for line in fh:
                line = line.strip()
                if line:
                    yield json.loads(line)
    except (EOFError, OSError, FileNotFoundError) as e:
        print('  could not read %s: %s' % (path, e), file=sys.stderr)

stats = collections.Counter()
out = []

# ---------------------------------------------------------------- transport pairs
# Air corridors and rail adjacency chains. Both files already carry the canonical direction,
# the utility score, the duplicate-risk proxy and the facts the page would state, so nothing is
# recomputed here: a number read out of the file that measured it cannot drift from it.
for path, shape in ((ROOT + 'data/atlas/sources/transport/_pair-candidates.jsonl.gz',
                     'transport_pair'),
                    (ROOT + 'data/atlas/sources/transport/_rail-pair-candidates.jsonl.gz',
                     'transport_pair_rail')):
    for r in read(path):
        o, d = r['origin_name'], r['destination_name']
        # the airport access rows are a different page from a city pair: the reader is landing
        # somewhere and needs to get out of the terminal, which the measurement found is the
        # highest-CPC half of this family
        sh = shape
        if r.get('pair_type') == 'airport-city':
            sh = 'transport_airport_access'
        n = len(r.get('modes') or ())
        # what the page can enumerate: the airports that evidence the corridor, or the stations
        # recorded at each end
        if sh == 'transport_pair_rail':
            n = len(r.get('origin_stations') or ()) + len(r.get('destination_stations') or ())
            enriched = int(r.get('hops') or 0)
        else:
            n = len(r.get('airports') or ()) or n
            enriched = int(r.get('operator_records') or 0)
        out.append({
            'shape': sh,
            'market': MARKET, 'language': LANG,
            'url': r['url_pattern'],
            'entity_id': '%s-%s' % (r['origin_id'], r['destination_id']),
            'entity_name': '%s to %s' % (o, d),
            'country': r['origin_country'],
            'destination_country': r['destination_country'],
            'city': o,
            'cls': r['pair_type'],
            'n': n,
            'enriched': enriched,
            'distance_km': r.get('distance_km'),
            'modes': r.get('modes') or [],
            'route_confidence': r.get('route_confidence', ''),
            'utility_score': r.get('utility_score'),
            'pair_duplicate_risk': r.get('duplicate_risk', ''),
            'locale_facts': r.get('facts') or [],
            'uniqueness_reason': (
                '%s is one origin-destination pair evidenced by %s. %s. Canonical direction: %s. '
                'What this page deliberately does NOT claim: live schedules, fares, real-time '
                'availability or current delays, none of which the sources support.'
                % ('%s to %s' % (o, d),
                   ', '.join(r.get('sources') or ['the transport graph']),
                   '; '.join(r.get('facts') or []),
                   r.get('canonical_direction', 'unordered; one page per pair'))),
        })
        stats[sh] += 1

# ---------------------------------------------------------------- visa policy cells
# One nationality against one destination, read from the FCDO's own wording and dated. The
# requirement class is whatever the source said plainly; anything it did not say plainly came
# back unclassified and stays that way rather than being guessed into a verdict.
NAT_NAME = {'GB': 'British citizens'}
for r in read(ROOT + 'data/atlas/sources/visa/govuk-entry-requirements.jsonl.gz'):
    nat, dest = r['nationality'], r['destination_name']
    cls = r.get('requirement_class', '')
    if cls == 'stated_in_source_but_not_machine_classified':
        stats['visa_unclassified_kept_with_the_flag'] += 1
    facts = []
    if cls:
        facts.append('requirement as published: ' + cls.replace('_', ' '))
    if r.get('passport_validity_months'):
        facts.append('passport validity required: %s months' % r['passport_validity_months'])
    if r.get('blank_pages_required'):
        facts.append('blank passport pages required: %s' % r['blank_pages_required'])
    if r.get('reviewed_at'):
        facts.append('policy as published on ' + str(r['reviewed_at']))
    out.append({
        'shape': 'visa_requirement',
        'market': MARKET, 'language': LANG,
        'url': '/en/travel/visa/%s/%s/' % (nat.lower(), r['destination_slug']),
        'entity_id': '%s-%s' % (nat, r['destination_slug']),
        'entity_name': '%s travelling to %s' % (NAT_NAME.get(nat, nat), dest),
        'country': nat,
        'destination_country': dest,
        'city': '',
        'cls': cls or 'unclassified',
        'n': len(facts),
        'enriched': sum(1 for k in ('passport_validity_months', 'blank_pages_required',
                                    'requirement_class') if r.get(k)),
        'locale_facts': facts,
        'policy_reviewed_at': r.get('reviewed_at', ''),
        'official_source_url': r.get('official_source_url', ''),
        'uniqueness_reason': (
            'The entry requirement for %s travelling to %s, read from %s on %s and dated on the '
            'page. %s. This is policy information as published, NOT legal advice and NOT a '
            'guarantee of entry.'
            % (NAT_NAME.get(nat, nat), dest, r.get('authority', 'the authority'),
               r.get('reviewed_at', 'the stated review date'),
               '; '.join(facts) or 'the source wording is carried verbatim')),
    })
    stats['visa_requirement'] += 1

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
    for r in out:
        fh.write(json.dumps(r, ensure_ascii=False) + '\n')

print('manifest candidate rows written: %d -> %s' % (len(out), OUT))
for k, v in sorted(stats.items(), key=lambda kv: -kv[1]):
    print('  %-44s %7d' % (k, v))
print('\nlanguage: en only. The pair axis was measured in English (346 of 500 distance rows and')
print('139 of 500 route rows name two real places) and REFUTED in German (2 of 500), so it is')
print('not fanned out. Every row still has to pass every manifest gate from here.')
