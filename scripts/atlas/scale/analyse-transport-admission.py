#!/usr/bin/env python3
"""Which transport pairs and visa cells survived the gates, and which gate stopped the rest.

The adapter put 61,887 rows into the funnel. The localisation gate kept some and refused the
rest, and the interesting question is not the total but WHERE the survivors are, because that
says what the next lever is. A pair page in English about two Malaysian towns has no measured
English demand and should not exist; a pair between two US cities is the home market and needs
no further justification. This script separates those cases from the data rather than from an
argument about it.
"""
import csv, gzip, collections, os, sys, json

ROOT = '/home/user/Livdar-eSim/'
MAN = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
REJ = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-REJECTED-CANDIDATES.csv.gz'
SRC = ROOT + 'data/atlas/sources/transport/_manifest-candidates.jsonl.gz'

OURS = {'transport.city-pair-air', 'transport.city-pair-rail',
        'transport.airport-city-access', 'policy.visa-nationality-destination'}

# what the adapter offered, by family and by the country at each end
offered = collections.Counter()
offered_country = collections.Counter()
FAM = {'transport_pair': 'transport.city-pair-air',
       'transport_pair_rail': 'transport.city-pair-rail',
       'transport_airport_access': 'transport.airport-city-access',
       'visa_requirement': 'policy.visa-nationality-destination'}
with gzip.open(SRC, 'rt', encoding='utf-8') as fh:
    for line in fh:
        if not line.strip():
            continue
        r = json.loads(line)
        f = FAM[r['shape']]
        offered[f] += 1
        offered_country[(f, r.get('country', ''), r.get('destination_country', ''))] += 1

kept = collections.Counter()
kept_country = collections.Counter()
with gzip.open(MAN, 'rt', encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        if r['family'] in OURS:
            kept[r['family']] += 1
            kept_country[(r['family'], r.get('country', ''))] += 1

rejected_reason = collections.Counter()
rejected_country = collections.Counter()
if os.path.exists(REJ):
    with gzip.open(REJ, 'rt', encoding='utf-8') as fh:
        for r in csv.DictReader(fh):
            if r.get('family') in OURS:
                rejected_reason[(r['family'],
                                 r.get('rejection_reason') or r.get('localization_class')
                                 or 'unstated')] += 1
                rejected_country[(r['family'], r.get('country', ''))] += 1

print('OFFERED BY THE ADAPTER, KEPT IN THE MANIFEST, REJECTED')
print('%-38s %8s %8s %8s %7s' % ('family', 'offered', 'kept', 'rejected', 'kept %'))
tot_o = tot_k = 0
for f in sorted(offered):
    o = offered[f]
    k = kept.get(f, 0)
    rj = sum(v for (ff, _), v in rejected_reason.items() if ff == f)
    tot_o += o
    tot_k += k
    print('%-38s %8d %8d %8d %6.1f%%' % (f, o, k, rj, 100.0 * k / o if o else 0))
print('%-38s %8d %8d %8s %6.1f%%' % ('TOTAL', tot_o, tot_k, '',
                                     100.0 * tot_k / tot_o if tot_o else 0))

print('\nWHY THE REJECTED WERE REJECTED')
for (f, why), v in sorted(rejected_reason.items(), key=lambda kv: -kv[1])[:16]:
    print('  %-34s %-44s %7d' % (f.replace('transport.', 't.'), why[:44], v))

print('\nWHERE THE SURVIVORS ARE, by the country of the origin')
for f in sorted(OURS):
    rows = [(c, v) for (ff, c), v in kept_country.items() if ff == f]
    if not rows:
        continue
    rows.sort(key=lambda x: -x[1])
    print('  %s' % f)
    for c, v in rows[:12]:
        print('      %-6s %6d' % (c or '(none)', v))

print('\nTHE DOMESTIC TEST: pairs whose two ends are in the same country, offered vs kept')
same = sum(v for (f, o, d), v in offered_country.items() if o and o == d)
cross = sum(v for (f, o, d), v in offered_country.items() if o and d and o != d)
print('  offered, both ends in one country: %d' % same)
print('  offered, crossing a border:        %d' % cross)
eng = {'US', 'GB', 'AU', 'CA', 'IE', 'NZ'}
eng_same = sum(v for (f, o, d), v in offered_country.items() if o == d and o in eng)
print('  offered, both ends in an English-speaking country: %d' % eng_same)
print('\nThe gate asks whether an English page about this destination has measured demand. A')
print('pair inside an English-speaking country is the home market and needs no further')
print('justification; one between two towns in Malaysia or China needs destination evidence')
print('this project has not measured, and the gate is right to refuse it. That is the lever:')
print('more measured destination evidence admits more pairs, and nothing else does.')
