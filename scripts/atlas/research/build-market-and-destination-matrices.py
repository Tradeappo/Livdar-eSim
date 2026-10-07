#!/usr/bin/env python3
"""Derive the market and destination matrices from the banked open-SERP evidence.

Both files are computed from SERP-OPENNESS-OPPORTUNITIES.csv rather than written
by hand, so they can be rebuilt and checked against the rows they come from.

The destination matrix extracts the place token out of each things-to-do keyword
by stripping the language's own frame (the English "things to do in", the Italian
"cosa vedere a", the Turkish "gezilecek yerler" suffix and so on). That is a
heuristic on free text, so it under-counts rather than over-counts: a keyword
whose frame does not match is dropped rather than guessed at.
"""
import csv, os, re, statistics
from collections import defaultdict

OUT = '/home/user/Livdar-eSim/reports/livdar-expiry-freeze-2026-09-30'
rows = list(csv.DictReader(open(os.path.join(OUT, 'SERP-OPENNESS-OPPORTUNITIES.csv'))))

def i(v):
    try: return int(v)
    except (TypeError, ValueError): return None
def f(v):
    try: return float(v)
    except (TypeError, ValueError): return None

# ----------------------------------------------------- MARKET-COMMERCIAL-RESEARCH
# One row per language, across every family measured in it.
bylang = defaultdict(list)
for r in rows:
    if r['language']:
        bylang[r['language']].append(r)

LANG = {
 'en': ('English', 'us'), 'de': ('German', 'de'), 'es': ('Spanish', 'es'),
 'it': ('Italian', 'it'), 'fr': ('French', 'fr'), 'pl': ('Polish', 'pl'),
 'nl': ('Dutch', 'nl'), 'pt': ('Portuguese', 'br'), 'tr': ('Turkish', 'tr'),
 'sv': ('Swedish', 'se'), 'ja': ('Japanese', 'jp'),
}
NOTE = {
 'ja': 'Highest measured volume per row of any market. The minimum volume returned was 1,600, which means the 500-row cap hid the entire tail below that: the real family is far larger than this file shows. Kyoto 78,000 at KD 0, Atami 53,000, Kobe 50,000, Sendai 48,000, Kanazawa 47,000. No space between place and category in Japanese, and the slug function already keeps CJK.',
 'tr': 'The largest things-to-do market by row count and the second largest by volume, and tr-TR is already materialised. Two band probes each returned a capped 500 rows, so there are at least 1,000 keywords above 300 searches. 992 of 1,000 at KD 10 or below. Reaches small districts (Akdagmadeni, Guzelbahce, Ladik, Cinarcik, Bozcaada). Carries a locative-suffix duplicate pair that must be canonicalised.',
 'de': 'The most open market measured: 1,147 of 1,193 rows at KD 10 or below. Two band probes each capped at 500. Reaches small coastal towns and city districts. Museums are a destination family here, not a domestic one.',
 'es': 'Second most rows. Restaurantes en {city} is the strongest place x category family measured anywhere, at 1,200 to 2,400 searches a city. Playas de {province} is strong at region level.',
 'en': 'Highest total volume, but the least open: median KD 2 against 0 for most others, and the only market where the attractions family sits at median KD 6. The earlier harvest used a floor of 2,000 which understated it; the band probe below that returned a capped 500 rows whose own minimum was 1,300, so the tail below 1,300 is still unmeasured. Carries every commercial family: eSIM, visa, itinerary duration, transport pairs.',
 'it': 'Cosa vedere a {place} fills 465 of 500 rows in the combined call. Two band probes each capped at 500. Reaches tiny places (Cividale del Friuli, Valeggio sul Mincio, Volterra, Vaduz). Four phrasings collapse to one intent, including cosa fare a, so what-to-see and things-to-do are ONE family in Italian.',
 'pt': 'Strong and almost entirely open: 492 of 500 at KD 10 or below. The tail is small Brazilian towns (Gramado 14,000, Campos do Jordao 10,000, Monte Verde 7,500, Pocos de Caldas 5,500, Holambra 5,400, Serra Negra 4,300, Tiradentes 3,800), which is where a programmatic inventory earns its keep. Measured on country br rather than pt because Brazil is the larger market.',
 'nl': 'Real but mid-sized. Covers Belgian cities as well as Dutch ones (Gent 2,000, Brugge 1,900). Two phrasings cross-reference each other and must resolve to one page.',
 'pl': 'Only four rows of 213 exceed KD 30, so it is the most open market after German. Half the tail is foreign destinations, so one dataset feeds both axes. Reaches twenty resort and spa towns. Highest-CPC restaurant family of the five languages measured.',
 'sv': 'Smallest of the admitted markets but almost entirely open: 475 of 500 at KD 10 or below. Three phrasings collapse to one intent. One row must be excluded: att goera i stockholm idag is a live events query.',
 'fr': 'THE ONE REFUSAL. The only language where the place x category family does not carry: restaurants a {place} returns four domestic French rows against twenty-seven foreign neighbourhoods. Things-to-do was measured at a floor of 3,000 and returned only 20 rows. French demand that exists is travel demand about places outside France, which the destination axis already owns.',
}
mrows = []
for lang, g in sorted(bylang.items(), key=lambda kv: -sum(i(r['volume']) or 0 for kv2 in [kv] for r in kv[1])):
    kd = [i(r['keyword_difficulty']) for r in g if i(r['keyword_difficulty']) is not None]
    cpc = [f(r['cpc_usd']) for r in g if f(r['cpc_usd'])]
    fams = sorted({r['family'] for r in g})
    mrows.append([
        lang, LANG.get(lang, ('', ''))[0], LANG.get(lang, ('', ''))[1],
        len(g), sum(i(r['volume']) or 0 for r in g),
        sum(1 for x in kd if x <= 10), sum(1 for x in kd if x <= 30),
        ('%.0f' % statistics.median(kd)) if kd else '',
        ('%.2f' % statistics.median(cpc)) if cpc else '',
        ('%.2f' % max(cpc)) if cpc else '',
        len(fams), ';'.join(fams),
        'REFUSE for place x category' if lang == 'fr' else 'ADMIT',
        NOTE.get(lang, ''),
    ])
p = os.path.join(OUT, 'MARKET-COMMERCIAL-RESEARCH.csv')
with open(p, 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['language', 'language_name', 'country_measured', 'measured_rows',
                'measured_monthly_volume', 'rows_kd_lte_10', 'rows_kd_lte_30',
                'median_kd', 'median_cpc_usd', 'max_cpc_usd', 'families_measured',
                'family_list', 'verdict', 'reading'])
    w.writerows(mrows)
print('wrote %s with %d rows' % (p, len(mrows)))

# -------------------------------------------------- DESTINATION-DEMAND-EXPANSION
# Strip each language's own frame to recover the place token.
FRAME = {
 'en': [r'^(?:fun |best |top |free |cheap )?things to (?:do|see) in (.+)$'],
 'de': [r'^(.+?) sehenswürdigkeiten$', r'^sehenswürdigkeiten (?:in )?(.+)$'],
 'es': [r'^(?:cosas )?que ver en (.+)$'],
 'it': [r'^cosa (?:vedere|visitare) a (.+)$'],
 'fr': [r'^que faire à (.+)$'],
 'pl': [r'^co (?:warto |mozna |można )?zobaczyć w (.+)$'],
 'nl': [r'^wat te doen in (.+)$', r'^(.+?) bezienswaardigheden$', r'^bezienswaardigheden (.+)$'],
 'pt': [r'^o que (?:fazer|visitar) em (.+)$'],
 'tr': [r"^(.+?)(?:'d[ae]|'t[ae]| d[ae]| t[ae])? gezilecek yerler$"],
 'sv': [r'^(?:saker )?att göra i (.+)$', r'^sevärdheter (.+)$', r'^(.+?) sevärdheter$'],
}
STOP = re.compile(r'\b(\d+\s*(?:day|days|giorni|giorno|dni|dzień|dias|dia|tag|tage|días|día)|'
                  r'in \d|jeden dzień|un giorno|mezza giornata|today|hoy|heute|idag|dzisiaj|'
                  r'with kids|z dzieckiem|dla dzieci|für kinder|for adults|za darmo|free|gratis)\b')
dest = defaultdict(set)
raw_hits = 0
for r in rows:
    if r['family'] != 'activities.city-things-to-do':
        continue
    k = (r['keyword'] or '').strip().lower()
    for pat in FRAME.get(r['language'], []):
        m = re.match(pat, k)
        if not m:
            continue
        place = m.group(1).strip(" .,'-")
        # a qualified variant is the same destination, so drop the qualifier and
        # skip rows whose remainder is a modifier rather than a place
        if STOP.search(place) or len(place) < 2 or place.isdigit():
            break
        place = STOP.sub('', place).strip(" .,'-")
        if place:
            dest[place].add(r['language'])
            raw_hits += 1
        break
multi = {k: v for k, v in dest.items() if len(v) >= 2}
p = os.path.join(OUT, 'DESTINATION-DEMAND-EXPANSION.csv')
with open(p, 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['destination_token', 'source_language_count', 'source_languages',
                'reading'])
    for k in sorted(dest, key=lambda x: (-len(dest[x]), x)):
        n = len(dest[k])
        w.writerow([k, n, ';'.join(sorted(dest[k])),
                    'demand from several source languages, so this destination earns a page in each of them'
                    if n >= 3 else ('two source languages' if n == 2 else 'one source language only')])
print('wrote %s' % p)
print('  place tokens recovered: %d from %d matched rows' % (len(dest), raw_hits))
print('  destinations with demand in 2 or more source languages: %d' % len(multi))
print('  destinations with demand in 3 or more: %d' % sum(1 for v in dest.values() if len(v) >= 3))
top = sorted(dest.items(), key=lambda kv: -len(kv[1]))[:14]
for k, v in top:
    print('    %-24s %d  %s' % (k, len(v), ','.join(sorted(v))))
