#!/usr/bin/env python3
"""
Build the country-level best-time-to-visit layer from NASA POWER monthly normals.

Why this family and not the city one. Measured 2026-10-06:
  best time to visit japan    55,000 a month at keyword difficulty ZERO
  best time to visit italy     7,600
  quando andare in thailandia  2,400 at zero
  beste reisezeit japan        6,000
and the CITY tail collapses - Dubrovnik 250, Krakow 200, Porto 200 in en-US, Krakau 30 and
Dubrovnik 50 in German, Cracovie 10 in French. The competitor read on the same day settled the
other city shape too: weatherspark earns 709,000 visits a month ranking twenty-year averages
for el tiempo en valencia at 140,000, which is a question about this afternoon. The climatology
intent we can honestly answer reads 0 to 150 per city. So the country page is the family and
the city-by-month page is refused on intent.

The superlative is EARNED here rather than claimed. "Best time to visit" is a superlative and
the manifest rejects a family that claims one with no documented methodology. This one carries
a method a reader can check and disagree with, and the method is printed on the page:

  a month is COMFORTABLE for a city when its mean temperature falls in the stated band and its
  precipitation is at or below that city's own annual median, computed from NASA POWER monthly
  climatology over 2001 to 2020, and a country's best months are the months comfortable in the
  most of its largest cities, with the per-city table shown so the reader can see the spread
  rather than trust one average.

Averaging a country into one number would be the lie. Chile and the United States have no
single climate, so the page is a TABLE of cities by month with a stated conclusion, not a
country mean.

Usage: climate-best-time-candidates.py [--min-cities N] [--top-cities N]
Writes data/atlas/sources/climate/_best-time-candidates.jsonl.gz
"""
import collections, glob, gzip, json, os, statistics, sys

ROOT = '/home/user/Livdar-eSim/'
POWER = ROOT + 'data/atlas/sources/climate/power/'
OUT = ROOT + 'data/atlas/sources/climate/_best-time-candidates.jsonl.gz'
MONTHS = ('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
          'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC')
MONTH_NAME = {'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
              'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
              'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'}
# The FIRST version of this file put an absolute comfort band on the monthly MEAN, 15 to 27
# degrees, and it produced "best time to visit Italy: July" and "best time to visit Japan:
# August". Both are wrong for the same reason: a monthly mean of 25 degrees is a month of
# 32-degree afternoons, and NASA POWER's T2M_MAX is the extreme maximum over the whole period
# rather than a mean daily high, so the daytime figure a traveller feels is not in this dataset
# at all.
#
# A purely relative rule fails the other way. "The coolest months of this city's year" says
# January for Rome, which nobody means by the best time to visit Rome.
#
# What works in every case checked is a stated TARGET rather than a band: the months whose mean
# temperature sits closest to 18 degrees. Rome gives May and October, Tokyo gives May and
# October, Bangkok gives December and January - its coolest - and Reykjavik gives July and
# August - its warmest. One rule, no comfort assumption about the tropics, and the target is
# printed on the page so a reader can disagree with the number rather than with a hidden
# judgement.
TARGET_C = 18.0
TOLERANCE_C = 3.0       # months within this much of the closest month qualify
MIN_CITIES = 3          # a country with fewer than three measured cities gets no page
TOP_CITIES = 8          # the table shows this many, largest by population


def load_cities():
    """{country: [city records with monthly normals]}, largest population first."""
    out = collections.defaultdict(list)
    for fn in sorted(glob.glob(POWER + 'power-*.jsonl')):
        with open(fn, encoding='utf-8') as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    c = json.loads(line)
                except Exception:
                    continue
                if not c.get('country') or not c.get('months'):
                    continue
                if not all(m in c['months'] for m in MONTHS):
                    continue
                out[c['country']].append(c)
    for cc in out:
        out[cc].sort(key=lambda c: -(c.get('population') or 0))
    return out


def readings(c):
    """Three readings of one city's year, each a fact from the data rather than a judgement.

    mildest  the months whose mean sits closest to the stated target, which is the city-
             sightseeing answer and the one the country conclusion is built from
    driest   the months at or below this city's own annual median precipitation. Relative on
             purpose: an absolute millimetre threshold calls every month in Singapore wet and
             every month in Cairo dry, which tells a reader nothing about either.
    warmest  the three warmest months, which is the beach answer and a different question
    """
    tm = {m: c['months'][m].get('T2M') for m in MONTHS}
    pr = {m: c['months'][m].get('PRECTOTCORR') for m in MONTHS}
    if any(v is None for v in tm.values()) or any(v is None for v in pr.values()):
        return None
    med = statistics.median(pr.values())
    closest = min(abs(tm[m] - TARGET_C) for m in MONTHS)
    mildest = [m for m in MONTHS if abs(tm[m] - TARGET_C) <= closest + TOLERANCE_C]
    driest = [m for m in MONTHS if pr[m] <= med]
    warmest = sorted(MONTHS, key=lambda m: -tm[m])[:3]
    return {'mildest': mildest, 'driest': driest,
            'warmest': [m for m in MONTHS if m in set(warmest)],
            'median_precip': med}


def main():
    argv = sys.argv[1:]
    min_cities = int(argv[argv.index('--min-cities') + 1]) if '--min-cities' in argv \
        else MIN_CITIES
    top_cities = int(argv[argv.index('--top-cities') + 1]) if '--top-cities' in argv \
        else TOP_CITIES

    by_country = load_cities()
    print(f'countries with measured normals: {len(by_country):,}; '
          f'cities: {sum(len(v) for v in by_country.values()):,}', file=sys.stderr)

    rows, rejects = [], collections.Counter()
    for cc, cities in sorted(by_country.items()):
        if len(cities) < min_cities:
            rejects['fewer_than_min_measured_cities'] += 1
            continue
        table, votes = [], collections.Counter()
        for c in cities[:top_cities]:
            rd = readings(c)
            if rd is None:
                continue
            # The country conclusion is built from the mildest-AND-drier intersection where one
            # exists, and from the mildest alone where the city has no drier overlap, because a
            # country whose best months are simply its mildest is a real answer and dropping it
            # for want of an intersection would be the gate deciding the content.
            both = [m for m in rd['mildest'] if m in set(rd['driest'])]
            for m in (both or rd['mildest']):
                votes[m] += 1
            table.append({
                'city': c.get('name'), 'city_id': c.get('city_id'),
                'population': c.get('population'),
                'elevation_m': c.get('elevation_m'),
                'mildest_months': [MONTH_NAME[m] for m in rd['mildest']],
                'driest_months': [MONTH_NAME[m] for m in rd['driest']],
                'warmest_months': [MONTH_NAME[m] for m in rd['warmest']],
                'mildest_and_drier_than_median': [MONTH_NAME[m] for m in both],
                'annual_median_precip_mm_per_day': round(rd['median_precip'], 2),
                'mean_c_by_month': {MONTH_NAME[m]: round(c['months'][m]['T2M'], 1)
                                    for m in MONTHS},
                'precip_mm_per_day_by_month': {MONTH_NAME[m]:
                                               round(c['months'][m]['PRECTOTCORR'], 2)
                                               for m in MONTHS},
            })
        if len(table) < min_cities:
            rejects['too_few_cities_with_complete_normals'] += 1
            continue
        if not votes:
            rejects['no_month_qualified_in_any_measured_city'] += 1
            continue
        best = max(votes.values())
        best_months = [MONTH_NAME[m] for m in MONTHS if votes[m] == best]
        rows.append({
            'shape': 'country_best_time', 'source': 'nasa_power_climatology',
            'country': cc,
            'cities_measured': len(cities),
            'cities_in_the_table': len(table),
            'best_months': best_months,
            'agreeing_cities': best,
            'target_c': TARGET_C, 'tolerance_c': TOLERANCE_C,
            'period': '2001-2020',
            'table': table,
            'methodology': (
                f'For each of the {len(table)} largest measured cities, the MILDEST months are '
                f'those whose mean temperature sits closest to {TARGET_C:.0f} degrees Celsius, '
                f'within {TOLERANCE_C:.0f} degrees of the closest month, and the DRIER months '
                f'are those at or below that city\'s own annual median precipitation. Where a '
                f'city has months that are both, those are counted; where it has none, its '
                f'mildest months are counted. The country\'s best months are the months that '
                f'qualify in the most cities, and the full per-city table of monthly mean '
                f'temperature and precipitation is shown so the spread is visible rather than '
                f'hidden in a country average. Computed from NASA POWER monthly climatology, '
                f'2001 to 2020. The {TARGET_C:.0f}-degree target is a stated choice and not a '
                f'fact about the world: it is used instead of an absolute comfort band because '
                f'a monthly MEAN of 25 degrees is a month of 32-degree afternoons, and instead '
                f'of a relative coolest-months rule because that answers January for Rome. The '
                f'precipitation test is relative to each city because an absolute threshold '
                f'calls every month in Singapore wet and every month in Cairo dry.'),
            'why_this_is_not_an_unsupported_superlative': (
                'the claim is "best time to visit" and the method above is published on the '
                'page, with the band, the period, the source and the per-city table, so a '
                'reader can check it and disagree with it. That is the condition the '
                'superlative gate asks for and the reason this family may carry the word.'),
            'uniqueness_reason': (
                f'the months that are comfortable in the largest cities of {cc}, computed from '
                f'twenty years of NASA POWER monthly normals, with the per-city temperature and '
                f'precipitation table and the method stated: a conclusion and the data behind '
                f'it, which no city page and no country overview carries'),
            'data_source': ('NASA POWER monthly climatology 2001-2020, public domain, '
                            'attribution requested'),
        })

    with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(OUT + '.tmp', OUT)
    print(f'country best-time candidates: {len(rows):,}', file=sys.stderr)
    for k, v in rejects.most_common():
        print(f'  {k:52} {v:>6,}', file=sys.stderr)
    print(f'written {OUT}', file=sys.stderr)


main()
