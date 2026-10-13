#!/usr/bin/env python3
"""Why every remaining country number in the plan is wrong by about 16x. Read only.

country-materialisation-plan.py estimates a country's yield from ONE flat benchmark,
pages_today / gazetteer_cities, averaged over the countries that are captured and producing,
and then applies it to every country alike. That average is dominated by Livdar's own
markets, and a market country is not a comparable to a destination country: its pages are
NATIVE_LOCALE and a destination country's are not, so they meet opposite sides of the
localisation gate.

This splits the benchmark by that one distinction and prints both realisation rates, the
restated forecast for the countries still to capture, and the reject ledger that explains the
difference. It writes nothing and changes nothing; it exists so the forecast can be checked
rather than believed.

Usage: python3 scripts/atlas/scale/measure-realisation-rate.py
"""
import csv, glob, gzip, os, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
PLAN = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-COUNTRY-PLAN.csv'
REJ = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-REJECTED-CANDIDATES.parts/'

# The market table, from lib/i18n.js and lib/markets.js. A country is a market when Livdar
# publishes a site in its language; that is the only thing that decides which side of the
# localisation gate its own geography lands on.
MARKETS = {'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'BR', 'JP', 'TW', 'TR', 'AU', 'MX'}
FLOOR = 200          # below this the ratio is noise rather than a rate


def num(x):
    try:
        return int(float(x or 0))
    except (TypeError, ValueError):
        return 0


def main():
    rows = list(csv.DictReader(open(PLAN, encoding='utf-8')))
    rate = []
    for r in rows:
        exp, now = num(r['expected_pages_if_fully_captured']), num(r['pages_today'])
        if exp < FLOOR or now == 0:
            continue
        rate.append((r['country'], now, exp, 100.0 * now / exp, r['country'] in MARKETS))

    market = [x[3] for x in rate if x[4]]
    dest = [x[3] for x in rate if not x[4]]
    mm, dm = statistics.median(market), statistics.median(dest)
    print(f'realisation of the flat benchmark, by whether the country is a market:')
    print(f'  MARKET      median {mm:6.1f} per cent   n={len(market)}')
    print(f'  DESTINATION median {dm:6.1f} per cent   n={len(dest)}')
    print(f'  the benchmark overstates a destination country by {mm / dm:.1f}x\n')

    print(f"{'iso':4s} {'now':>7s} {'if_full':>8s} {'realised':>9s}  kind")
    for c, now, exp, pct, is_m in sorted(rate, key=lambda z: -z[2])[:12]:
        print(f'{c:4s} {now:7d} {exp:8d} {pct:8.1f}%  {"MARKET" if is_m else "destination"}')

    todo = sum(num(r['expected_NET_NEW']) for r in rows
               if r['country'] not in MARKETS and num(r['expected_NET_NEW']) > 0)
    print(f'\nplan expected_NET_NEW over non-market countries : {todo:,}')
    print(f'same, at the measured destination rate          : {int(todo * dm / 100):,}')

    if not os.path.isdir(REJ):
        print('\n(reject ledger not on this branch, skipping the gate breakdown)')
        return 0
    gate, n = {}, 0
    for p in sorted(glob.glob(REJ + 'part-*.csv.gz')):
        with gzip.open(p, 'rt', encoding='utf-8', errors='replace', newline='') as fh:
            for row in csv.DictReader(fh):
                n += 1
                rr = row.get('rejection_reason') or ''
                k = rr.split(':', 1)[1] if rr.startswith('localization:') else '(other gates)'
                gate[k] = gate.get(k, 0) + 1
    print(f'\nwhy, from all {n:,} rejected candidates:')
    for k, v in sorted(gate.items(), key=lambda z: -z[1]):
        print(f'  {v:7d}  {100 * v / n:5.1f}%  {k}')
    loc = n - gate.get('(other gates)', 0)
    print(f'\n  the localisation gate is {100 * loc / n:.1f} per cent of every rejection.')
    print('  That is the constraint: not entity supply, but measured local demand in a')
    print('  market language. More foreign geography meets the same gate and is refused.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
