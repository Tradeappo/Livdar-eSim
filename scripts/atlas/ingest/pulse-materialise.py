#!/usr/bin/env python3
"""
Normalise every holiday source into ONE Pulse entity store.

Four providers with different shapes and different authority arrive here and leave as
one vocabulary, with the provider and its confidence carried on every row. Where two
providers cover the same country the official one wins and the other is dropped, not
averaged: a date is either what the government published or it is somebody's copy of it.

Entity types produced, each matching a family that already exists in FAMILY-MASTER:
  national        holiday x country x year      pulse.named-holiday-date
  regional        holiday x subdivision x year  pulse.named-holiday-regions,
                                                pulse.subdivision-holidays
  school          period x subdivision x year   pulse.school-holidays
  long_weekend    window x country x year       pulse.long-weekends
  bridge_day      day x country x year          pulse.long-weekends (bridge variant)

long_weekend and bridge_day are DERIVED: arithmetic over sourced dates and the weekday
they fall on. Nothing about them is guessed, and they are labelled derived so a reader
of the manifest never mistakes them for published facts.
"""
import json, os, datetime, collections, sys

SRC = '/home/user/Livdar-eSim/data/atlas/sources/events/'
LIVDAR_MARKET_COUNTRIES = {'US','DE','FR','IT','ES','NL','PL','BR','GB','JP','TW','CA','AU'}

def jload(n):
    try:
        return json.load(open(SRC + n))
    except FileNotFoundError:
        return None

oh = jload('openholidays-materialised.json')
gb = jload('gb-bank-holidays.json')
jp = jload('jp-cabinet-office-holidays.json')
ng = jload('nager-holidays.json')

national, regional, school = [], [], []
provenance = {}
# a country is claimed by exactly one provider, best authority first
claimed = {}

def claim(iso, provider, confidence):
    """May this provider supply iso? Claiming happens on DELIVERY, via seal().

    Claiming on attempt rather than on delivery cost Brazil every holiday it has: the
    OpenHolidays country list includes BR, its holiday endpoint returns nothing for BR,
    and the claim then blocked the Nager fallback that does cover it. A provider that
    delivers nothing holds no claim.
    """
    if iso in claimed:
        return claimed[iso] == provider
    return True


def seal(iso, provider):
    """Record the claim once rows have actually arrived."""
    if iso not in claimed:
        claimed[iso] = provider


def rollup(code):
    """Reduce a subdivision code to the level a page can defensibly be built at.

    OpenHolidays gives Dutch school holidays against municipality codes such as
    NL-GR-PE, and expanding those produced 2,468 rows for the Netherlands: the same six
    holiday periods repeated per town, which is near-duplicate content by construction.
    The Netherlands sets school holidays by region, not by town, so a third-level code
    rolls up to its parent.
    """
    parts = str(code).split('-')
    return '-'.join(parts[:2]) if len(parts) > 2 else str(code)

# ---- 1. official national feeds come first ---------------------------------
if gb:
    provenance['gov.uk'] = {k: gb[k] for k in ('provider','url','licence','confidence','attribution')}
    claim('GB', 'gov.uk', 'official'); seal('GB', 'gov.uk')
    for div, events in gb['divisions'].items():
        for e in events:
            y = int(e['date'][:4])
            # England and Wales is the default division; the other two are regional
            if div == 'england-and-wales':
                national.append({'country': 'GB', 'date': e['date'], 'year': y,
                                 'name': e['name'], 'names': {'en': e['name']},
                                 'source': 'gov.uk', 'confidence': 'official',
                                 'note': e.get('notes') or ''})
            else:
                regional.append({'country': 'GB', 'date': e['date'], 'year': y,
                                 'name': e['name'], 'names': {'en': e['name']},
                                 'subdivisions': [f'GB-{div}'], 'source': 'gov.uk',
                                 'confidence': 'official'})
if jp:
    provenance['cao.go.jp'] = {k: jp[k] for k in ('provider','url','licence','confidence','attribution')}
    claim('JP', 'cao.go.jp', 'official'); seal('JP', 'cao.go.jp')
    for h in jp['holidays']:
        national.append({'country': 'JP', 'date': h['date'], 'year': int(h['date'][:4]),
                         'name': h['name_ja'], 'names': {'ja': h['name_ja']},
                         'source': 'cao.go.jp', 'confidence': 'official'})

# ---- 2. OpenHolidays: official-derived, and the only school holiday source --
if oh:
    provenance['openholidays'] = {k: oh[k] for k in ('provider','url','licence','confidence','attribution')}
    subs_with_school = set()
    for iso, rec in oh['countries'].items():
        own = claim(iso, 'openholidays', 'official-derived')
        for h in rec['public']:
            if not h.get('start'):
                continue
            nm = next(iter(h['names'].values()), None)
            if not nm:
                continue
            row = {'country': iso, 'date': h['start'], 'year': h['year'], 'name': nm,
                   'names': h['names'], 'source': 'openholidays',
                   'confidence': 'official-derived'}
            if h.get('subdivisions') and not h.get('nationwide'):
                regional.append({**row,
                                 'subdivisions': sorted({rollup(c) for c in h['subdivisions']})})
                seal(iso, 'openholidays')
            elif own:
                national.append(row)
                seal(iso, 'openholidays')
        for h in rec['school']:
            nm = next(iter(h['names'].values()), None)
            if not nm or not h.get('start'):
                continue
            targets = sorted({rollup(c) for c in (h.get('subdivisions') or [])})
            if not targets and h.get('nationwide'):
                targets = [iso]
            for sub in targets:
                subs_with_school.add(sub)
                school.append({'country': iso, 'subdivision': sub, 'year': h['year'],
                               'name': nm, 'names': h['names'], 'start': h['start'],
                               'end': h.get('end') or h['start'],
                               'source': 'openholidays', 'confidence': 'official-derived'})

# ---- 3. Nager fills only what no official feed covered ---------------------
if ng:
    provenance['nager.date'] = {k: ng[k] for k in ('provider','url','licence','confidence','attribution','caution')}
    for iso, hs in ng['countries'].items():
        if not claim(iso, 'nager.date', 'community-aggregated'):
            continue
        for h in hs:
            row = {'country': iso, 'date': h['date'], 'year': h['year'],
                   'name': h['name'], 'names': {'en': h['name'], 'local': h.get('local')},
                   'source': 'nager.date', 'confidence': 'community-aggregated'}
            if h.get('counties'):
                regional.append({**row,
                                 'subdivisions': sorted({rollup(c) for c in h['counties']})})
                seal(iso, 'nager.date')
            elif h.get('global'):
                national.append(row)
                seal(iso, 'nager.date')
            else:
                # not global and no counties named: the provider does not say where it
                # applies, so it cannot ground a page
                pass

# ---- 3b. Taiwan ------------------------------------------------------------
# No provider above reaches Taiwan and the government portal carries nothing inside the
# window, so Taiwan comes from a community mirror of the Executive Yuan calendar. That
# is weaker evidence than a gazette and is labelled as such rather than left empty.
tw = jload('tw-holidays.json')
if tw and claim('TW', 'tw-calendar', 'community-aggregated'):
    provenance['tw-calendar'] = {k: tw[k] for k in
                                 ('provider', 'url', 'licence', 'confidence',
                                  'attribution', 'caution')}
    for h in tw['holidays']:
        national.append({'country': 'TW', 'date': h['date'], 'year': h['year'],
                         'name': h['name_zh'], 'names': {'zh-Hant': h['name_zh']},
                         'source': 'tw-calendar', 'confidence': 'community-aggregated'})
    seal('TW', 'tw-calendar')

# ---- 3c. exact dedupe ------------------------------------------------------
# One observance appears once per country, date and name, whatever route it took here.
def dedupe(rows, keyf):
    out, seen = [], set()
    for r in rows:
        k = keyf(r)
        if k in seen:
            continue
        seen.add(k)
        out.append(r)
    return out


national = dedupe(national, lambda r: (r['country'], r['date'], r['name'].casefold()))
regional = dedupe(regional, lambda r: (r['country'], r['date'], r['name'].casefold(),
                                       tuple(r['subdivisions'])))
school = dedupe(school, lambda r: (r['subdivision'], r['start'], r['end'],
                                   r['name'].casefold()))

# ---- 4. derive long weekends and bridge days -------------------------------
# A holiday on a Friday or Monday already makes a three-day weekend. A holiday on a
# Tuesday or Thursday makes a four-day one if the single working day between it and the
# weekend is taken off: that day is the bridge day, and naming it is the whole point of
# the family. Nothing is invented; the input is the sourced date and its weekday.
long_weekends, bridge_days = [], []
by_cy = collections.defaultdict(list)
for h in national:
    by_cy[(h['country'], h['year'])].append(h)
for (iso, y), hs in by_cy.items():
    seen = set()
    for h in hs:
        try:
            d = datetime.date.fromisoformat(h['date'])
        except ValueError:
            continue
        wd = d.weekday()          # Mon=0 .. Sun=6
        if wd == 4:               # Friday: Fri-Sun
            start, end, nights, bridge = d, d + datetime.timedelta(days=2), 3, None
        elif wd == 0:             # Monday: Sat-Mon
            start, end, nights, bridge = d - datetime.timedelta(days=2), d, 3, None
        elif wd == 1:             # Tuesday: bridge the Monday
            start, end, nights, bridge = d - datetime.timedelta(days=3), d, 4, d - datetime.timedelta(days=1)
        elif wd == 3:             # Thursday: bridge the Friday
            start, end, nights, bridge = d, d + datetime.timedelta(days=3), 4, d + datetime.timedelta(days=1)
        else:
            continue              # midweek or on the weekend already: no long weekend
        key = (start.isoformat(), end.isoformat())
        if key in seen:
            continue
        seen.add(key)
        long_weekends.append({
            'country': iso, 'year': y, 'start': start.isoformat(), 'end': end.isoformat(),
            'days': nights, 'anchor_holiday': h['name'], 'anchor_date': h['date'],
            'bridge_day': bridge.isoformat() if bridge else None,
            'derived': True, 'derivation': ('weekday of a sourced public holiday; a '
                'bridge day is the single working day between the holiday and the weekend'),
            'source': h['source'], 'confidence': h['confidence']})
        if bridge:
            bridge_days.append({
                'country': iso, 'year': y, 'date': bridge.isoformat(),
                'weekday': bridge.strftime('%A'), 'holiday': h['name'],
                'holiday_date': h['date'], 'gives_days': nights, 'derived': True,
                'source': h['source'], 'confidence': h['confidence']})

# ---- 4b. subdivision-level long weekends and bridge days -------------------
# Measured with Ahrefs on 2026-10-01: "brückentage" returns 34 keywords above 400 volume
# and EVERY one is scoped to a German Land and a year - brückentage hessen 2026,
# brückentage 2026 nrw, brückentage 2026 bayern, brückentage 2027 nrw. The country-level
# derivation above cannot answer those, because a bridge day differs by Land: the
# regional holidays each Land keeps change which working days sit next to a weekend.
# So the same arithmetic is run again per subdivision, over national PLUS the regional
# observances that subdivision actually keeps.
regional_by_sub = collections.defaultdict(list)
for h in regional:
    for sub in h.get('subdivisions', []):
        regional_by_sub[(h['country'], sub, h['year'])].append(h)

long_weekends_sub, bridge_days_sub = [], []
for (iso, sub, y), rhs in regional_by_sub.items():
    pool = by_cy.get((iso, y), []) + rhs
    seen = set()
    for h in pool:
        try:
            d = datetime.date.fromisoformat(h['date'])
        except ValueError:
            continue
        wd = d.weekday()
        if wd == 4:
            start, end, nights, bridge = d, d + datetime.timedelta(days=2), 3, None
        elif wd == 0:
            start, end, nights, bridge = d - datetime.timedelta(days=2), d, 3, None
        elif wd == 1:
            start, end, nights, bridge = d - datetime.timedelta(days=3), d, 4, d - datetime.timedelta(days=1)
        elif wd == 3:
            start, end, nights, bridge = d, d + datetime.timedelta(days=3), 4, d + datetime.timedelta(days=1)
        else:
            continue
        key = (start.isoformat(), end.isoformat())
        if key in seen:
            continue
        seen.add(key)
        long_weekends_sub.append({
            'country': iso, 'subdivision': sub, 'year': y,
            'start': start.isoformat(), 'end': end.isoformat(), 'days': nights,
            'anchor_holiday': h['name'], 'anchor_date': h['date'],
            'bridge_day': bridge.isoformat() if bridge else None,
            'regional_anchor': h in rhs, 'derived': True,
            'source': h['source'], 'confidence': h['confidence']})
        if bridge:
            bridge_days_sub.append({
                'country': iso, 'subdivision': sub, 'year': y,
                'date': bridge.isoformat(), 'weekday': bridge.strftime('%A'),
                'holiday': h['name'], 'holiday_date': h['date'],
                'gives_days': nights, 'regional_anchor': h in rhs, 'derived': True,
                'source': h['source'], 'confidence': h['confidence']})

# One page per subdivision per year listing its bridge days is what the measured
# keywords ask for, so the per-subdivision summary is the page-level entity.
bridge_plans = []
by_sub_year = collections.defaultdict(list)
for b in bridge_days_sub:
    by_sub_year[(b['country'], b['subdivision'], b['year'])].append(b)
for (iso, sub, y), bs in by_sub_year.items():
    lws = [w for w in long_weekends_sub
           if w['country'] == iso and w['subdivision'] == sub and w['year'] == y]
    bridge_plans.append({
        'country': iso, 'subdivision': sub, 'year': y,
        'bridge_days': sorted(b['date'] for b in bs),
        'bridge_day_count': len(bs),
        'long_weekend_count': len(lws),
        'max_days_off': max((w['days'] for w in lws), default=0),
        'regional_anchors': sorted({b['holiday'] for b in bs if b['regional_anchor']}),
        'derived': True,
        'derivation': ('national plus the regional observances this subdivision keeps, '
                       'then the weekday of each to find the single working days that '
                       'bridge to a weekend'),
        'confidence': min((b['confidence'] for b in bs), default='')})


def ident(prefix, *parts):
    return prefix + ':' + '-'.join(str(p) for p in parts if p is not None)

for h in national:
    h['id'] = ident('hol', h['country'], h['date'])
for h in regional:
    h['id'] = ident('holreg', h['country'], h['date'], '|'.join(sorted(h['subdivisions']))[:40])
for h in school:
    h['id'] = ident('sch', h['subdivision'], h['start'], h['name'][:24])
for h in long_weekends:
    h['id'] = ident('lw', h['country'], h['start'])
for h in bridge_days:
    h['id'] = ident('bd', h['country'], h['date'])
for h in long_weekends_sub:
    h['id'] = ident('lws', h['country'], h['subdivision'], h['start'])
for h in bridge_days_sub:
    h['id'] = ident('bds', h['country'], h['subdivision'], h['date'])
for h in bridge_plans:
    h['id'] = ident('bplan', h['subdivision'], h['year'])

out = {
    'builtOn': datetime.date.today().isoformat(),
    'window': sorted({h['year'] for h in national}),
    'provenance': provenance,
    'country_claimed_by': claimed,
    'national': national, 'regional': regional, 'school': school,
    'long_weekends': long_weekends, 'bridge_days': bridge_days,
    'long_weekends_subdivision': long_weekends_sub,
    'bridge_days_subdivision': bridge_days_sub,
    'bridge_plans': bridge_plans,
    'counts': {'national': len(national), 'regional': len(regional), 'school': len(school),
               'long_weekends': len(long_weekends), 'bridge_days': len(bridge_days),
               'long_weekends_subdivision': len(long_weekends_sub),
               'bridge_days_subdivision': len(bridge_days_sub),
               'bridge_plans': len(bridge_plans)},
    'livdar_market_coverage': {
        iso: {'national': sum(1 for h in national if h['country'] == iso),
              'regional': sum(1 for h in regional if h['country'] == iso),
              'school': sum(1 for h in school if h['country'] == iso),
              'long_weekends': sum(1 for h in long_weekends if h['country'] == iso),
              'source': claimed.get(iso, 'NONE')}
        for iso in sorted(LIVDAR_MARKET_COUNTRIES)},
}
p = SRC + 'pulse-entities.json'
with open(p + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
os.replace(p + '.tmp', p)
print(json.dumps(out['counts'], indent=1))
print('\nLivdar market coverage:')
for iso, c in out['livdar_market_coverage'].items():
    print(f"  {iso}  national {c['national']:>3}  regional {c['regional']:>4}  "
          f"school {c['school']:>3}  long weekends {c['long_weekends']:>3}  via {c['source']}")
