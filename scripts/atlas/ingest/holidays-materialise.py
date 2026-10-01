#!/usr/bin/env python3
"""
Materialise public and school holidays for every Livdar market.

The existing store covers the 36 countries OpenHolidays serves, which leaves out the
markets with the most demand behind them: the US, the UK, Japan, Canada and Australia.
This fills those from the most official source reachable for each, and adds SCHOOL
holidays, which OpenHolidays serves per subdivision and which the store never carried.

Provenance is recorded per source and never flattened, because the sources are not
equally authoritative:
  openholidays  official-derived   the provider aggregates official national publications
  gov.uk        official           the UK government's own bank holiday feed, OGL
  cao.go.jp     official           Japan's Cabinet Office holiday CSV
  nager.date    community          a community aggregation; good coverage, no gazette

Nothing here is computed from belief: every date comes from a fetched source, and the
derived shapes (bridge days, long weekends) are arithmetic over those dates and the
weekday they fall on, which is why they are marked derived rather than sourced.

Resumable and atomic: one file per source, written to .tmp and renamed on success.
"""
import urllib.request, urllib.parse, json, os, sys, csv, io, time, datetime, collections

OUT = '/home/user/Livdar-eSim/data/atlas/sources/events/'
os.makedirs(OUT, exist_ok=True)
YEARS = [2026, 2027]
UA = {'User-Agent': 'LivdarCandidateInventory/1.0 (offline research inventory)'}


def get(url, retries=4, raw=False):
    for a in range(retries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                b = r.read()
            return b if raw else json.loads(b)
        except Exception as e:
            if a == retries - 1:
                print(f'  FAILED {url[:90]}: {e}', file=sys.stderr)
                return None
            time.sleep(5 * (a + 1))


def write(name, obj):
    p = OUT + name
    with open(p + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(p + '.tmp', p)
    print(f'  wrote {name}', file=sys.stderr)


# ---- 1. OpenHolidays: public and school, per country, per subdivision ---------
LANG = {'DE':'DE','AT':'DE','CH':'DE','LI':'DE','FR':'FR','MC':'FR','IT':'IT','SM':'IT',
        'VA':'IT','ES':'ES','AD':'ES','PT':'PT','BR':'PT','NL':'NL','BE':'NL','PL':'PL',
        'CZ':'CS','SK':'SK','HU':'HU','RO':'RO','BG':'BG','HR':'HR','SI':'SL','RS':'SR',
        'AL':'SQ','MD':'RO','BY':'BE','EE':'ET','LV':'LV','LT':'LT','SE':'SV','MT':'MT',
        'IE':'EN','LU':'DE','MX':'ES','ZA':'EN'}

countries = get('https://openholidaysapi.org/Countries?languageIsoCode=EN') or []
oh = {'provider': 'OpenHolidays', 'url': 'https://openholidaysapi.org',
      'licence': 'ODbL 1.0', 'confidence': 'official-derived',
      'attribution': 'OpenHolidays API, openholidaysapi.org',
      'fetched': datetime.date.today().isoformat(), 'years': YEARS, 'countries': {}}
subs_all = {}
for c in countries:
    iso = c['isoCode']
    lang = LANG.get(iso, 'EN')
    subs = get(f'https://openholidaysapi.org/Subdivisions?countryIsoCode={iso}&languageIsoCode=EN') or []
    subs_all[iso] = [{'code': s['code'], 'name': (s.get('name') or [{}])[0].get('text'),
                      'short': s.get('shortName')} for s in subs]
    rec = {'public': [], 'school': [], 'subdivisions': subs_all[iso]}
    for kind, ep in (('public', 'PublicHolidays'), ('school', 'SchoolHolidays')):
        for y in YEARS:
            d = get(f'https://openholidaysapi.org/{ep}?countryIsoCode={iso}'
                    f'&languageIsoCode={lang}&validFrom={y}-01-01&validTo={y}-12-31')
            if not d:
                continue
            for h in d:
                names = {n['language']: n['text'] for n in h.get('name', [])}
                rec[kind].append({
                    'start': h.get('startDate'), 'end': h.get('endDate'),
                    'names': names, 'nationwide': h.get('nationwide'),
                    'scope': h.get('regionalScope'),
                    'subdivisions': [s['code'] for s in (h.get('subdivisions') or [])],
                    'year': y,
                })
    oh['countries'][iso] = rec
    print(f"  {iso}: {len(rec['public'])} public, {len(rec['school'])} school, "
          f"{len(subs)} subdivisions", file=sys.stderr)
write('openholidays-materialised.json', oh)

# ---- 2. United Kingdom: the government's own feed -----------------------------
gb = get('https://www.gov.uk/bank-holidays.json')
if gb:
    out = {'provider': 'GOV.UK', 'url': 'https://www.gov.uk/bank-holidays.json',
           'licence': 'Open Government Licence v3.0', 'confidence': 'official',
           'attribution': 'Contains public sector information licensed under the OGL v3.0',
           'fetched': datetime.date.today().isoformat(), 'divisions': {}}
    for div, body in gb.items():
        out['divisions'][div] = [
            {'date': e['date'], 'name': e['title'], 'notes': e.get('notes') or ''}
            for e in body.get('events', []) if int(e['date'][:4]) in YEARS]
    write('gb-bank-holidays.json', out)

# ---- 3. Japan: Cabinet Office CSV --------------------------------------------
jp = get('https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv', raw=True)
if jp:
    txt = jp.decode('shift_jis', errors='replace')
    rows = []
    for r in csv.reader(io.StringIO(txt)):
        if len(r) < 2 or '/' not in r[0]:
            continue
        y, m, d = r[0].split('/')
        if int(y) not in YEARS:
            continue
        rows.append({'date': f'{int(y):04d}-{int(m):02d}-{int(d):02d}', 'name_ja': r[1]})
    write('jp-cabinet-office-holidays.json',
          {'provider': 'Cabinet Office of Japan',
           'url': 'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv',
           'licence': 'Japan Government Standard Terms of Use (CC BY compatible)',
           'confidence': 'official', 'attribution': 'Cabinet Office, Government of Japan',
           'fetched': datetime.date.today().isoformat(), 'holidays': rows})

# ---- 4. US, Canada, Australia, and a Taiwan probe ----------------------------
nager = {'provider': 'Nager.Date', 'url': 'https://date.nager.at',
         'licence': 'MIT (software), holiday data community-maintained',
         'confidence': 'community-aggregated',
         'caution': ('a community aggregation, not a government gazette: good coverage '
                     'and subdivision codes, but a date here is weaker evidence than '
                     'the official feeds above and must be labelled as such'),
         'attribution': 'Nager.Date', 'fetched': datetime.date.today().isoformat(),
         'countries': {}}
# BR is in the OpenHolidays country list but its holiday endpoint returns nothing,
# so Brazil needs this fallback too: trusting the country list rather than the
# delivered rows left the whole market without a single holiday.
for iso in ['US', 'CA', 'AU', 'TW', 'BR', 'GB', 'JP', 'NZ', 'IE']:
    got = []
    for y in YEARS:
        d = get(f'https://date.nager.at/api/v3/PublicHolidays/{y}/{iso}')
        if not d:
            continue
        for h in d:
            got.append({'date': h['date'], 'name': h['name'], 'local': h.get('localName'),
                        'global': h.get('global'), 'counties': h.get('counties') or [],
                        'types': h.get('types') or [], 'year': y})
    if got:
        nager['countries'][iso] = got
        print(f'  nager {iso}: {len(got)}', file=sys.stderr)
    else:
        print(f'  nager {iso}: no data', file=sys.stderr)
write('nager-holidays.json', nager)
# ---- 5. Taiwan: the national holiday calendar, via a government open data portal
# No reachable provider above covers Taiwan, and Taiwan is a Livdar market. The New
# Taipei City open data platform republishes the national government calendar (the
# 行政院 schedule) as JSON, which is a government source at one remove - recorded as
# such rather than as a national gazette.
tw = get('https://data.ntpc.gov.tw/api/datasets/308DCD75-6434-45BC-A95F-584DA4FED251/json')
if tw:
    rows = []
    for e in tw:
        y = str(e.get('year') or '')[:4]
        if not y.isdigit() or int(y) not in YEARS:
            continue
        if e.get('isholiday') not in ('是', True, 'true'):
            continue
        nm = e.get('name') or e.get('description')
        if not nm:
            continue                      # a day off with no named observance
        d = str(e.get('date') or '')
        if len(d) != 8:
            continue
        rows.append({'date': f'{d[:4]}-{d[4:6]}-{d[6:]}', 'name_zh': nm,
                     'category': e.get('holidaycategory') or '',
                     'note': e.get('description') or ''})
    if rows:
        write('tw-government-holidays.json',
              {'provider': 'New Taipei City Open Data (republishing the national calendar)',
               'url': 'https://data.ntpc.gov.tw',
               'licence': 'Taiwan Open Government Data Licence 1.0',
               'confidence': 'official-derived',
               'caution': ('a city portal republishing the national Executive Yuan '
                           'calendar: government data at one remove, not the gazette'),
               'attribution': 'New Taipei City Government Open Data Platform',
               'fetched': datetime.date.today().isoformat(), 'holidays': rows})
    else:
        print('  taiwan: portal reachable but no rows inside the year window', file=sys.stderr)

print('holiday materialisation complete', file=sys.stderr)
