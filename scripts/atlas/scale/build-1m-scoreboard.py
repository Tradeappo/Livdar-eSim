#!/usr/bin/env python3
"""Generate the one million scoreboard from the artifacts, so it cannot go stale.

The previous scoreboard was written by hand and it was wrong in a way worth recording: it listed
the transport pairs and the visa cells as MATERIALISED and summed them into a subtotal of
463,280. They were neither. They had been written to disk and nothing read them, so they had
passed no manifest gate at all, and a count of rows in a staging file is not a count of final
distinct valid candidates. The brief's own rule covers this exactly: do not count estimates as
FINAL.

This script therefore reads only two kinds of thing. FINAL comes from the manifest summary the
pipeline wrote, and nothing else is allowed into that line. Everything else is labelled by what
it actually is, and a row that has not been through the gates says so in its status.
"""
import csv, gzip, json, os, collections

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
SUM = OUT + '1M-SUMMARY.json'
MAN = OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'

summary = json.load(open(SUM))
final = summary['FINAL_DISTINCT_CANDIDATES']
reconciles = summary.get('funnel_reconciles')

fam = collections.Counter()
with gzip.open(MAN, 'rt', encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        fam[r['family']] += 1

TRANSPORT = ('transport.city-pair-air', 'transport.city-pair-rail',
             'transport.airport-city-access')
VISA = ('policy.visa-nationality-destination',)
t_final = sum(fam.get(f, 0) for f in TRANSPORT)
v_final = sum(fam.get(f, 0) for f in VISA)

rows = [
    ['FINAL DISTINCT VALID (1M-SUMMARY.json)', 'FINAL', '', '', final,
     'reports/.../1M-SUMMARY.json',
     'The only authoritative number. funnel_reconciles=%s. Everything below is a component of '
     'it or is explicitly not in it.' % reconciles],
    ['  of which transport pairs', 'FINAL, inside the number above', 61661,
     61661 - t_final, t_final,
     'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz',
     '61,661 pairs were offered to the funnel by transport-visa-manifest-adapter.py and %d '
     'survived every gate. Every rejection was LOCAL_INTENT_MISSING: the pair graph is global '
     'while measured English destination demand is concentrated, and the gate is right to '
     'refuse an English page about two towns nobody was measured searching for in English.'
     % t_final],
    ['  of which visa policy cells', 'FINAL, inside the number above', 226,
     226 - v_final, v_final,
     'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz',
     'All 226 FCDO cells survived. One origin nationality, dated per cell, OGL v3.'],
    ['GAP TO 1,000,000', '', '', '', 1000000 - final, '',
     'What remains. The paths are ranked in AHREFS-EXPIRY-REPORT-2026-10-07.md section 15.'],
]

NOT_FINAL = [
    ['transport pairs refused for want of destination evidence', 'OFFERED, REFUSED',
     61661, 61661 - t_final, 0, 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz',
     'NOT final and not a loss: these are pairs whose English page nobody was measured wanting. '
     'The lever that admits them is more measured destination evidence, and nothing else.'],
    ['POI place x category cells on disk but not in the manifest', 'ON DISK, NOT ADMITTED',
     501887, '', '', 'data/atlas/sources/osm-poi/_aggregations.jsonl.gz',
     'Still the largest single pool. The 2026-10-07 measurement now justifies the family as '
     'class B in Spanish, German and English (restaurantes en {city} runs 1,200 to 2,400 a city '
     'at KD 0 to 32), so the basis exists; each cell still has to earn its page on its own data.'],
    ['five POI categories refused in English on measurement', 'REFUSED, MEASURED', '', 2131, 0,
     'data/atlas/measurements/ahrefs-expiry/poi-categories/refuted-poi-categories-2026-10-07.json',
     'supermarket, marina, nightclub, parking and market. The refusal is English only because '
     'English is what was measured; the same classes carry 11,118 rows in nine other languages '
     'and those are UNMEASURED rather than refuted.'],
    ['city things-to-do, measured open-SERP cells across ten languages', 'MEASURED, PARTLY BUILT',
     '', '', '8,011 measured keywords', 'SERP-OPENNESS-OPPORTUNITIES.csv',
     '13.5 million monthly searches. Japanese is the biggest per row and its tail below 1,600 '
     'searches is still unmeasured; Turkish is the biggest already-built market. Every row count '
     'of 500 or 1,000 in that file is an API cap, not a tail depth.'],
    ['one-transfer air pairs', 'MEASURED, NOT BUILT', 156048, 390968, '88,044 available',
     'computed from the graph with bounds', 'NOT counted as FINAL.'],
    ['language fan-out of the transport pairs', 'REFUTED FOR GERMAN, UNPROVEN ELSEWHERE',
     '', '', 0, 'openserp-distance-pairs-de.json',
     'The earlier projection of roughly 74,000 additional pages is WITHDRAWN. German returns 2 '
     'of 500 rows naming two places against 346 of 500 in English, so the axis does not travel '
     'by assumption. Each language needs its own probe first.'],
    ['Wikidata enrichment of factless notables', 'MEASURED YIELD', 40123, '', '7,874',
     '372 stratified sample, 0.00 to 1.04 facts per entity', ''],
    ['outdoor features failing only the parent gate', 'MEASURED', '', '', '6,527',
     'gate diagnostic', 'Extend the parent layer; do not relax the gate.'],
    ['country expansion', 'MEASURED EARLIER', '', '', '90,498', 'earlier measurement',
     'Not re-verified in this session.'],
    ['device x eSIM support', 'MEASURED, DATA MISSING', '', '', '200 to 400',
     'openserp-device-esim-en.json',
     'The most commercially valuable family found anywhere: 83 rows at a CPC of 3.00 USD or more, '
     'peaking at 55.00, with almost the whole tail at KD 0. It needs a handset capability table '
     'that does not exist yet, and a wrong answer on a KD 0 page at a 30 USD CPC is worse than '
     'no page.'],
    ['place x duration', 'MEASURED, DATA MISSING', '', '', '300 to 500',
     'openserp-itinerary-duration-en-corrected.json',
     'A real axis, reached independently in five languages, and each duration carries its own '
     'parent topic. It needs ordered day-by-day content, which no source on disk supplies.'],
]

p = OUT + '1M-SCOREBOARD.csv'
with open(p, 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['line', 'status', 'raw', 'rejected', 'final_net', 'evidence', 'note'])
    w.writerows(rows)
    w.writerow(['', '', '', '', '', '', ''])
    w.writerow(['NOT IN THE FINAL NUMBER', '', '', '', '', '',
                'Everything below this line has NOT been through the gates, or was refused by '
                'them. None of it is counted above.'])
    w.writerows(NOT_FINAL)
print('wrote %s' % p)
print('FINAL DISTINCT VALID: %d   (funnel_reconciles=%s)' % (final, reconciles))
print('  transport pairs in it: %d of 61,661 offered' % t_final)
print('  visa cells in it:      %d of 226 offered' % v_final)
print('  gap to 1,000,000:      %d' % (1000000 - final))
