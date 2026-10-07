#!/usr/bin/env python3
"""
Build the Pulse candidate families from the normalised holiday store.

WHAT THIS DOES NOT DO, and why that matters more than what it does.

`pulse-entities.json` holds 9,065 rows over 43 countries and 187 subdivisions. A naive
builder fans that out by language and emits tens of thousands of pages. This one emits a
few hundred, because the MEASUREMENT says so and the supply does not.

`data/atlas/measurements/ahrefs-holidays-*.json` records the rule in its own note:

    "An unqualified head term resolves to the market own country, which is what the
     searcher means and what carries the largest volumes. A region, a month, or a
     country the source cannot reach is REFUSED."

So the 43 countries in the store are SOURCE SUPPLY. The countries with measured demand
are the ones whose own market was measured on its own head term, and that is a different
and much smaller set. NEW-FAMILY-SCALE-MATRIX.csv carried `entities_with_demand=43` for
pulse.country-holidays; that field was the supply count, and this builder does not use it.

Three further refusals, each taken from the research rather than invented here:

  * bridge days do NOT get their own pages. The matrix records
    "cannibalisation_risk HIGH against pulse.long-weekends; merge them", so the bridge
    day is a FACT ON the long-weekend page and never a page of its own.
  * school holidays are refused in Italian ("it weak") and in every language the
    school probe did not reach.
  * country-month holidays are not built at all. Acceptance 0.4, MEDIUM cannibalisation
    against the year page, and the matrix's own condition - "only where the month
    actually contains holidays; an empty month page would be thin and must not be
    generated" - is a per-cell gate that the year page already satisfies better.

Years are 2026 and 2027, which is what the store holds. The matrix allows five years on
the grounds that the year is a fetch parameter on every one of these APIs. That is true
and it is still an ACQUISITION: generating 2024 or 2028 from a store that does not hold
them would be fabricating dated government facts, which is the one thing a holiday page
may never do.

Every page carries the year in its URL and in its name, because the measurement found
every head term carries one: "A Pulse page without a year on its face, and without the
year in its URL, is answering a question nobody typed."

Output: data/atlas/sources/events/_pulse-candidates.jsonl.gz in the aggregation shape
build-1m-candidate-manifest.py consumes, plus a funnel to
data/atlas/measurements/pulse-candidates-<date>.json.
"""
import json, gzip, os, sys, collections, importlib.util, datetime

ROOT = '/home/user/Livdar-eSim/'
spec = importlib.util.spec_from_file_location('ei', ROOT + 'scripts/atlas/scale/entity_identity.py')
ei = importlib.util.module_from_spec(spec); spec.loader.exec_module(ei)
slugify = ei.slugify

PULSE = json.load(open(ROOT + 'data/atlas/sources/events/pulse-entities.json'))
OH = json.load(open(ROOT + 'data/atlas/sources/events/openholidays-materialised.json'))

# ---------------------------------------------------------------- the measured admission matrix
# Each family maps a LANGUAGE to the countries whose demand for it was actually read, and the
# market that language is served in. The country is always the market's own country: no entry
# here says one market may have a page about another country's holidays, because no measurement
# said that.
#
# Sources for every line: ahrefs-holidays-{de,en,es,fr,it,nl,pl}-*.json (seven languages, each
# on its own market head term), ahrefs-pulse-{de,en,es,fr,it,ja,nl,pl,pt}-*.json, and
# ahrefs-pulse-local-phrasing-2026-10-01.json for the subdivision readings.
#
# Deliberately absent: ja, tr, zh-Hant. The pulse probe reached ja-JP but the HOLIDAY family
# was never measured in Japanese, and Japan's holiday store comes from the Cabinet Office, so
# the data exists and the demand evidence does not. Supply without demand is not an admission.
COUNTRY_HOLIDAYS = {
    # language -> (market, country). en-US is admitted but scored lower: the matrix reads
    # "fr, pt, en, pl, de, nl, es measured ADMIT; it country level only; en-US weak".
    'de': [('de-DE', 'DE')],
    'fr': [('fr-FR', 'FR')],
    'pl': [('pl-PL', 'PL')],
    'nl': [('nl-NL', 'NL')],
    'es': [('es-ES', 'ES')],
    'pt': [('pt-BR', 'BR')],
    'it': [('it-IT', 'IT')],
    'en': [('en-GB', 'GB'), ('en-US', 'US'), ('en-AU', 'AU')],
}
WEAK_MARKETS = {'en-US'}   # measured, but the matrix calls it weak; scored down, not dropped

# Subdivision holidays. The counts in the comment are the subdivisions whose OWN keyword was
# read, from ahrefs-pulse-local-phrasing: de 16 Laender, pl 16 voivodeships, es 19
# subdivisions, gb 4 nations, nl 3 regions = 58.
SUBDIV_HOLIDAYS = {
    'de': [('de-DE', 'DE')], 'pl': [('pl-PL', 'PL')], 'es': [('es-ES', 'ES')],
    'en': [('en-GB', 'GB')], 'nl': [('nl-NL', 'NL')],
}
# School holidays. "fr zones A B C plus five cities, de 16 states, nl 3 regions,
# pl 16 voivodeships, gb counties, it weak". Italian refused.
SCHOOL_HOLIDAYS = {
    'fr': [('fr-FR', 'FR')], 'de': [('de-DE', 'DE')], 'nl': [('nl-NL', 'NL')],
    'pl': [('pl-PL', 'PL')], 'en': [('en-GB', 'GB')],
}
# Long weekends, bridge day folded in. "de Brueckentage, pt feriados prolongados 19,000,
# fr ponts, nl, pl".
LONG_WEEKENDS = {
    'de': [('de-DE', 'DE')], 'pt': [('pt-BR', 'BR')], 'fr': [('fr-FR', 'FR')],
    'nl': [('nl-NL', 'NL')], 'pl': [('pl-PL', 'PL')],
}
# Bridge plans at subdivision level. "de, and the measurement only covers de so far."
BRIDGE_PLANS = {'de': [('de-DE', 'DE')]}

# ---------------------------------------------------------------- names
# A page in German about Germany needs the country's name in German. Eleven entries, each
# checked by hand, because a country name is not something to derive from a code table.
COUNTRY_NAME = {
    ('DE', 'de'): 'Deutschland', ('FR', 'fr'): 'France', ('PL', 'pl'): 'Polska',
    ('NL', 'nl'): 'Nederland', ('ES', 'es'): 'España', ('BR', 'pt'): 'Brasil',
    ('IT', 'it'): 'Italia', ('GB', 'en'): 'the United Kingdom',
    ('US', 'en'): 'the United States', ('AU', 'en'): 'Australia',
}
# The slug must not carry an article: /en/pulse/the-united-kingdom/ is wrong.
COUNTRY_SLUG_NAME = {('GB', 'en'): 'United Kingdom', ('US', 'en'): 'United States'}

# Subdivision names come from the source, in the source's own spelling, which is already the
# local language: Baden-Wuerttemberg, Nordrhein-Westfalen, Comunidad Valenciana. GB is the one
# country whose store uses a slug rather than a code, so its four nations are mapped by hand.
SUBDIV_NAME = {}
for _cc, _payload in OH['countries'].items():
    for _s in _payload.get('subdivisions') or []:
        if _s.get('code') and _s.get('name'):
            SUBDIV_NAME[(_cc, _s['code'])] = _s['name']
SUBDIV_NAME.update({
    ('GB', 'GB-scotland'): 'Scotland', ('GB', 'GB-northern-ireland'): 'Northern Ireland',
    ('GB', 'GB-england'): 'England', ('GB', 'GB-wales'): 'Wales',
    ('GB', 'GB-england-and-wales'): 'England and Wales',
})

LICENCE = {
    'gov.uk': ('GOV.UK bank holidays (Open Government Licence v3.0)', 'OGL_V3_ATTRIBUTION_REQUIRED'),
    'openholidays': ('OpenHolidays API (ODbL 1.0, share-alike, attribution required)',
                     'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'nager.date': ('Nager.Date public holiday API (MIT)', 'PERMISSIVE_ATTRIBUTION_OPTIONAL'),
    'cao.go.jp': ('Cabinet Office of Japan (Japan Government Standard Terms of Use)',
                  'PUBLIC_SECTOR_ATTRIBUTION_REQUIRED'),
}
DEFAULT_LIC = ('Public holiday registers: OpenHolidays (ODbL 1.0), Nager.Date (MIT), '
               'GOV.UK (OGL v3.0)', 'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED')

WEEKDAY = {
    'de': ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
    'en': ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    'fr': ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'],
    'nl': ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'],
    'pl': ['poniedziałek','wtorek','środa','czwartek','piątek','sobota','niedziela'],
    'es': ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'],
    'pt': ['segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado','domingo'],
    'it': ['lunedì','martedì','mercoledì','giovedì','venerdì','sabato','domenica'],
}

def wd(datestr, lang):
    y, m, d = (int(x) for x in datestr.split('-')[:3])
    return WEEKDAY.get(lang, WEEKDAY['en'])[datetime.date(y, m, d).weekday()]

stats = collections.Counter()
rows = []
seen = set()

def emit(shape, market, lang, country, url, entity_id, entity_name, n, enriched,
         locale_facts, uniq, cls, city='', area='', subdiv=''):
    """One candidate. The dedupe key is the URL, which is the page's identity."""
    stats['raw'] += 1
    if url in seen:
        stats['rejected_duplicate_url'] += 1
        return
    seen.add(url)
    rows.append({
        'shape': shape, 'market': market, 'language': lang, 'url': url,
        'entity_id': entity_id, 'entity_name': entity_name, 'country': country,
        'city': city, 'area': area, 'cls': cls, 'n': n, 'enriched': enriched,
        'subdivision': subdiv,
        'locale_facts': locale_facts, 'uniqueness_reason': uniq,
        'pulse_weak_market': market in WEAK_MARKETS,
    })
    stats['final_net'] += 1
    stats['final_net:' + shape] += 1

NOT_CLAIMED = ('What this page deliberately does NOT claim: shop or office opening hours on '
               'the day, transport timetables, whether any individual employer grants the day, '
               'or pay entitlement, none of which the holiday registers carry.')

# ---------------------------------------------------------------- 1. country public holidays
by_country_year = collections.defaultdict(list)
for r in PULSE['national']:
    by_country_year[(r['country'], r['year'])].append(r)

for lang, pairs in COUNTRY_HOLIDAYS.items():
    for market, cc in pairs:
        for year in PULSE['window']:
            hols = sorted(by_country_year.get((cc, year), []), key=lambda x: x['date'])
            if not hols:
                stats['rejected_no_holiday_rows_for_country_year'] += 1
                continue
            if len(hols) < 5:
                # A national holiday page listing fewer than five dates is a list, not a page.
                stats['rejected_thin_fewer_than_5_holidays'] += 1
                continue
            cname = COUNTRY_NAME[(cc, lang)]
            sname = COUNTRY_SLUG_NAME.get((cc, lang), cname)
            src = hols[0].get('source', '')
            lic, _ = LICENCE.get(src, DEFAULT_LIC)
            # the facts a reader comes for: how many, which fall on a weekend (and are
            # therefore lost), and which fall midweek
            weekend = sum(1 for h in hols if wd(h['date'], 'en') in ('Saturday', 'Sunday'))
            facts = [f'{len(hols)} public holidays in {year}',
                     f'{weekend} of them fall on a Saturday or Sunday',
                     f'{len(hols) - weekend} fall on a working day',
                     f'first is {hols[0]["name"]} on {hols[0]["date"]}',
                     f'last is {hols[-1]["name"]} on {hols[-1]["date"]}']
            emit('pulse_country_holidays', market, lang, cc,
                 f'/{lang}/pulse/{slugify(sname)}/public-holidays-{year}/',
                 f'{cc}-{year}', f'{cname} {year}', len(hols), weekend, facts,
                 f'The dated public holiday list for {cname} in {year}, from {lic}. '
                 + '; '.join(facts) + '. ' + NOT_CLAIMED, 'country_holidays')

# ---------------------------------------------------------------- 2. subdivision holidays
sub_year = collections.defaultdict(list)
for r in PULSE['regional']:
    for s in r.get('subdivisions') or []:
        sub_year[(r['country'], s, r['year'])].append(r)

for lang, pairs in SUBDIV_HOLIDAYS.items():
    for market, cc in pairs:
        for (c2, sub, year), hols in sorted(sub_year.items()):
            if c2 != cc: continue
            name = SUBDIV_NAME.get((cc, sub))
            if not name:
                stats['rejected_subdivision_has_no_name_in_source'] += 1
                continue
            nat = by_country_year.get((cc, year), [])
            if not nat:
                stats['rejected_no_national_baseline'] += 1
                continue
            hols = sorted(hols, key=lambda x: x['date'])
            # The whole reason this query is typed: which days this subdivision keeps that
            # the country as a whole does not. If that set is empty the page has no
            # information gain over the national page and must not exist.
            nat_dates = {h['date'] for h in nat}
            extra = [h for h in hols if h['date'] not in nat_dates]
            if not extra:
                stats['rejected_no_days_beyond_the_national_list'] += 1
                continue
            src = hols[0].get('source', '')
            lic, _ = LICENCE.get(src, DEFAULT_LIC)
            facts = [f'{len(nat_dates) + len(extra)} public holidays in {name} in {year}',
                     f'{len(extra)} of them are kept in {name} and not nationwide',
                     *[f'{h["name"]} on {h["date"]}, a {wd(h["date"], lang)}' for h in extra[:4]]]
            emit('pulse_subdivision_holidays', market, lang, cc,
                 f'/{lang}/pulse/{slugify(name)}/public-holidays-{year}/',
                 f'{sub}-{year}', f'{name} {year}', len(nat_dates) + len(extra), len(extra),
                 facts,
                 f'The public holidays of {name} in {year}, from {lic}, and specifically the '
                 f'{len(extra)} this subdivision keeps that the rest of the country does not. '
                 + '; '.join(facts) + '. ' + NOT_CLAIMED, 'subdivision_holidays', area=name,
                 subdiv=sub)

# ---------------------------------------------------------------- 3. school holidays
school = collections.defaultdict(list)
for r in PULSE['school']:
    school[(r['country'], r.get('subdivision') or r['country'], r['year'])].append(r)

for lang, pairs in SCHOOL_HOLIDAYS.items():
    for market, cc in pairs:
        for (c2, sub, year), terms in sorted(school.items()):
            if c2 != cc: continue
            name = SUBDIV_NAME.get((cc, sub)) or (COUNTRY_NAME.get((cc, lang)) if sub == cc else None)
            if not name:
                stats['rejected_school_subdivision_has_no_name'] += 1
                continue
            terms = sorted(terms, key=lambda x: x['start'])
            if len(terms) < 3:
                # fewer than three holiday periods in a school year is an incomplete capture,
                # and a partial term calendar is worse than none
                stats['rejected_school_fewer_than_3_periods'] += 1
                continue
            days = 0
            for t in terms:
                a = datetime.date(*(int(x) for x in t['start'].split('-')[:3]))
                b = datetime.date(*(int(x) for x in t['end'].split('-')[:3]))
                days += (b - a).days + 1
            src = terms[0].get('source', '')
            lic, _ = LICENCE.get(src, DEFAULT_LIC)
            longest = max(terms, key=lambda t: (datetime.date(*(int(x) for x in t['end'].split('-')[:3]))
                                                - datetime.date(*(int(x) for x in t['start'].split('-')[:3]))).days)
            facts = [f'{len(terms)} school holiday periods in {name} in {year}',
                     f'{days} days of school holiday in total',
                     f'the longest is {longest["name"]}, {longest["start"]} to {longest["end"]}',
                     *[f'{t["name"]}: {t["start"]} to {t["end"]}' for t in terms[:4]]]
            sname = COUNTRY_SLUG_NAME.get((cc, lang), name)
            emit('pulse_school_holidays', market, lang, cc,
                 f'/{lang}/pulse/{slugify(sname)}/school-holidays-{year}/',
                 f'sch-{sub}-{year}', f'{name} {year}', len(terms), days, facts,
                 f'The school holiday dates for {name} in {year}, from {lic}. '
                 + '; '.join(facts) + '. What this page deliberately does NOT claim: '
                 'individual school closure days, inset or staff training days, or exam '
                 'timetables, none of which the register carries.', 'school_holidays',
                 area=(name if sub != cc else ''), subdiv=sub)

# ---------------------------------------------------------------- 4. long weekends, bridge day folded in
lw_country = collections.defaultdict(list)
for r in PULSE['long_weekends']:
    lw_country[(r['country'], r['year'])].append(r)
bd_country = collections.defaultdict(list)
for r in PULSE['bridge_days']:
    bd_country[(r['country'], r['year'])].append(r)

for lang, pairs in LONG_WEEKENDS.items():
    for market, cc in pairs:
        for year in PULSE['window']:
            lws = sorted(lw_country.get((cc, year), []), key=lambda x: x['start'])
            if len(lws) < 2:
                stats['rejected_fewer_than_2_long_weekends'] += 1
                continue
            bds = bd_country.get((cc, year), [])
            cname = COUNTRY_NAME[(cc, lang)]
            sname = COUNTRY_SLUG_NAME.get((cc, lang), cname)
            best = max(lws, key=lambda x: x.get('days') or 0)
            src = lws[0].get('source', '')
            lic, _ = LICENCE.get(src, DEFAULT_LIC)
            facts = [f'{len(lws)} long weekends in {cname} in {year}',
                     f'the longest runs {best["days"]} days, {best["start"]} to {best["end"]}',
                     f'{len(bds)} single working days bridge a holiday to a weekend',
                     *[f'{b["date"]}, a {wd(b["date"], lang)}, taken off gives '
                       f'{b["gives_days"]} consecutive days' for b in sorted(bds, key=lambda x: x['date'])[:4]]]
            emit('pulse_long_weekends', market, lang, cc,
                 f'/{lang}/pulse/{slugify(sname)}/long-weekends-{year}/',
                 f'lw-{cc}-{year}', f'{cname} {year}', len(lws), len(bds), facts,
                 f'Which {year} public holidays in {cname} fall next to a weekend, and the '
                 f'single working days that bridge to one. Computed from the dated holiday '
                 f'list in {lic} by taking the weekday of each date; the derivation is '
                 f'recorded on every row rather than copied from anywhere. '
                 + '; '.join(facts) + '. What this page deliberately does NOT claim: that '
                 'any employer grants these days, travel prices, or availability.',
                 'long_weekends')

# ---------------------------------------------------------------- 5. subdivision bridge plans
plans = {}
for r in PULSE['bridge_plans']:
    plans[(r['country'], r['subdivision'], r['year'])] = r

for lang, pairs in BRIDGE_PLANS.items():
    for market, cc in pairs:
        for (c2, sub, year), p in sorted(plans.items()):
            if c2 != cc: continue
            name = SUBDIV_NAME.get((cc, sub))
            if not name:
                stats['rejected_bridge_plan_subdivision_has_no_name'] += 1
                continue
            if not p.get('bridge_day_count'):
                # no bridge day means there is nothing to plan, and the page would be a
                # restatement of the holiday list
                stats['rejected_bridge_plan_has_no_bridge_day'] += 1
                continue
            facts = [f'{p["bridge_day_count"]} bridge days in {name} in {year}',
                     f'{p["long_weekend_count"]} long weekends',
                     f'up to {p["max_days_off"]} consecutive days off',
                     *[f'take {d} off, a {wd(d, lang)}' for d in p['bridge_days'][:5]]]
            emit('pulse_bridge_plan', market, lang, cc,
                 f'/{lang}/pulse/{slugify(name)}/bridge-days-{year}/',
                 f'bp-{sub}-{year}', f'{name} {year}', p['long_weekend_count'],
                 p['bridge_day_count'], facts,
                 f'The {year} bridge days of {name}: which single working days, taken off, '
                 f'join a public holiday to a weekend, and the longest run this subdivision '
                 f'can reach. Computed from the national list plus the regional observances '
                 f'{name} itself keeps, which is why the answer differs from the neighbouring '
                 f'state. ' + '; '.join(facts) + '. What this page deliberately does NOT '
                 'claim: that any employer grants these days, travel prices, or availability.',
                 'bridge_plan', area=name, subdiv=sub)

# ---------------------------------------------------------------- write
OUTP = ROOT + 'data/atlas/sources/events/_pulse-candidates.jsonl.gz'
os.makedirs(os.path.dirname(OUTP), exist_ok=True)
with gzip.open(OUTP, 'wt', encoding='utf-8') as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

DATE = '2026-10-07'
funnel = {
    'builder': 'scripts/atlas/scale/pulse-candidates.py', 'date': DATE,
    'source': 'data/atlas/sources/events/pulse-entities.json',
    'source_rows_available': PULSE['counts'],
    'source_countries': len({r['country'] for r in PULSE['national']}),
    'source_subdivisions': len({(r['country'], r['subdivision']) for r in PULSE['bridge_plans']}),
    'years_on_disk': PULSE['window'],
    'funnel': dict(stats),
    'final_net': stats['final_net'],
    'per_family': {k.split(':', 1)[1]: v for k, v in stats.items() if k.startswith('final_net:')},
    'why_this_is_small': (
        'The store holds 9,065 rows over 43 countries and 187 subdivisions. The measured '
        'demand covers each market on its OWN country and, for the subdivision families, the '
        '58 subdivisions whose own keyword was read. ahrefs-holidays-*.json refuses "a region, '
        'a month, or a country the source cannot reach" in its own note, so the 43 countries '
        'are SOURCE SUPPLY and not measured demand. NEW-FAMILY-SCALE-MATRIX.csv recorded '
        'entities_with_demand=43 for pulse.country-holidays; that was the supply figure and it '
        'is corrected here.'),
    'refusals_taken_from_research_not_invented': [
        'bridge days get no page of their own: cannibalisation HIGH against long weekends, so '
        'the bridge day is a fact ON the long-weekend page',
        'school holidays refused in Italian (it weak) and in every unmeasured language',
        'country-month holidays not built: acceptance 0.4, MEDIUM cannibalisation against the '
        'year page',
        'ja, tr and zh-Hant refused for every pulse family: Japan has Cabinet Office holiday '
        'data on disk but the holiday family was never measured in Japanese, and supply '
        'without demand is not an admission',
        'years limited to 2026 and 2027, which is what the store holds; generating 2024 or '
        '2028 would be fabricating dated government facts',
    ],
}
json.dump(funnel, open(ROOT + f'data/atlas/measurements/pulse-candidates-{DATE}.json', 'w'),
          indent=1, ensure_ascii=False)

print(f'pulse candidates: RAW {stats["raw"]:,}  FINAL NET {stats["final_net"]:,}')
for k, v in sorted(stats.items()):
    if k.startswith('rejected'): print(f'  rejected {k[9:]:52} {v:>6,}')
for k, v in sorted(stats.items()):
    if k.startswith('final_net:'): print(f'  FINAL    {k[10:]:52} {v:>6,}')
print(f'wrote {OUTP}')
