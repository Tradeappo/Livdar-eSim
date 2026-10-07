#!/usr/bin/env python3
"""
NEW-FAMILY-SCALE-MATRIX.csv: every family candidate measured on 2026-10-06 and 2026-10-07,
with the thirteen things the brief asks for per candidate and the ranking it asks for.

The sort key is EXPECTED_FINAL_VALID x COMMERCIAL_VALUE x SERP_FEASIBILITY, with the two
multipliers on a 0 to 1 scale so the product stays readable as a page-weighted score.

Every volume in here is a reading, not an estimate. Every page count in here is an estimate and
says so. The three derived columns are built from factors that are named in the row:

  expected_raw_candidates   = entities x years x languages, the full cross product
  expected_final_valid      = expected_raw_candidates x expected_acceptance_rate
  expected_acceptance_rate  = stated per family with its reason, never a single blended number

The project's own measured funnel is 946,225 generated to 401,393 final, 42.4 per cent, and that
average is useless per family: the pulse cluster takes its localisation from the source so the
TRANSLATION_ONLY gate cannot fire on it, while the destination POI fan-out lost 90 per cent to
exactly that gate. So each rate is set from what the family's own evidence says and the reason
travels with the number.

Usage: build-new-family-matrix.py
Writes reports/livdar-expiry-freeze-2026-09-30/NEW-FAMILY-SCALE-MATRIX.csv
       data/atlas/measurements/new-family-scale-matrix-2026-10-07.json
"""
import csv, json, os

ROOT = '/home/user/Livdar-eSim/'
REP = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
MEAS = ROOT + 'data/atlas/measurements/'
OUT_CSV = REP + 'NEW-FAMILY-SCALE-MATRIX.csv'
OUT_JSON = MEAS + 'new-family-scale-matrix-2026-10-07.json'

# SERP feasibility on a 0 to 1 scale, from the SAMPLED SERP where one was sampled and from
# keyword difficulty where it was not. The scale is stated so the product is auditable:
#   1.00  a sub-DR-20 page with zero backlinks holds a top ten position
#   0.80  a sub-DR-40 page with few backlinks holds one
#   0.55  difficulty under 10 but no SERP sampled yet
#   0.30  mid-authority contest
#   0.05  official or aggregator owned, no weak winner anywhere in the top ten
F_OPEN_PROVEN, F_OPEN_LIKELY, F_UNSAMPLED_EASY, F_CONTESTED, F_LOCKED = 1.0, 0.8, 0.55, 0.3, 0.05

# Commercial value on a 0 to 1 scale, anchored on the measured CPC band in cents, because CPC is
# what an advertiser will actually pay for the click and it is measured per keyword:
#   1.00  >= 150 cents    0.70  60 to 149    0.45  25 to 59    0.25  10 to 24    0.10  < 10
def commercial(cpc_hi):
    if cpc_hi >= 150: return 1.0
    if cpc_hi >= 60: return 0.7
    if cpc_hi >= 25: return 0.45
    if cpc_hi >= 10: return 0.25
    return 0.1


R = []   # one dict per candidate


def add(**kw):
    R.append(kw)


# ---------------------------------------------------------------- the pulse cluster, 2026-10-07
# Entity counts are the collections actually on disk in pulse-entities.json. The year factor is
# 5 because the demand measurement reads 2021 through 2027 and the year is a fetch parameter on
# every one of these APIs, so 2024 to 2028 is a window change and not a data acquisition.
# Acceptance is set at 0.85: the holiday names come from the source keyed by language, so the
# TRANSLATION_ONLY gate cannot fire, and the only expected losses are countries whose language
# has no measured demand and subdivisions with no name in the market language.
PULSE_YEARS, PULSE_ACC = 5, 0.85
add(family='pulse.country-holidays', domain='seasonality, travel planning',
    status='IN THE CATALOGUE, ZERO PAGES, blocked by a one-field required_data cell',
    head_volume=705000, head_keyword='feriados 2026 (pt-BR)',
    tail_volume_sampled=1100, tail_example='giorni festivi italia 2026 (it-IT)',
    entities_with_demand=43, entity='country', years=PULSE_YEARS, languages=7,
    languages_where_intent_exists='fr, pt, en, pl, de, nl, es measured ADMIT; it country level only; en-US weak',
    serp_feasibility=F_OPEN_PROVEN,
    serp_evidence='feiertage nrw 2026 at 202,000: ferien-nrw.com DOMAIN RATING 1, ZERO backlinks, position 9. No knowledge card.',
    parent_topic='its own; the holiday list is the topic',
    overlap_with_existing='events.city-calendar holds 6,680 pages on the same store but answers what is on in a CITY, not which days are public holidays in a COUNTRY',
    cannibalisation_risk='LOW', cpc_hi=6,
    data_source='HELD. OpenHolidays, Nager.Date, GOV.UK, Japanese Cabinet Office, Executive Yuan. 1,081 national records, 43 countries.',
    information_gain='the official dated list in the market language, from the source names object, plus the weekday each date falls on',
    acceptance=PULSE_ACC,
    acceptance_basis='localisation comes from the source, so TRANSLATION_ONLY cannot fire')
add(family='pulse.subdivision-holidays', domain='seasonality',
    status='IN THE CATALOGUE, ZERO PAGES, 43 rows generated',
    head_volume=202000, head_keyword='feiertage nrw 2026 (de-DE)',
    tail_volume_sampled=1700, tail_example='festivos extremadura 2026 (es-ES)',
    entities_with_demand=182, entity='country-subdivision', years=PULSE_YEARS, languages=5,
    languages_where_intent_exists='de 16 states, pl 16 voivodeships, es 19 subdivisions, gb 4 nations, nl 3 regions',
    serp_feasibility=F_OPEN_PROVEN,
    serp_evidence='same SERP as above, sampled directly on a subdivision keyword',
    parent_topic='its own',
    overlap_with_existing='none live', cannibalisation_risk='LOW', cpc_hi=120,
    data_source='HELD. 623 regional records, and the OpenHolidays store carries 115 Swiss, 26 Spanish, 17 German, 14 Italian and 10 French subdivisions.',
    information_gain='which days are holidays in THIS state and not in the neighbouring one, which is the entire reason the query is asked',
    acceptance=PULSE_ACC, acceptance_basis='as above')
add(family='pulse.school-holidays', domain='seasonality, travel planning',
    status='IN THE CATALOGUE, ZERO PAGES, 86 rows generated, source_state MISSING_ACQUIRABLE for the full set',
    head_volume=1920000, head_keyword='vacances scolaires 2026 (fr-FR)',
    tail_volume_sampled=900, tail_example='schoolvakanties zuid 2026 (nl-NL)',
    entities_with_demand=232, entity='country-subdivision', years=PULSE_YEARS,
    languages=6,
    languages_where_intent_exists='fr zones A B C plus five cities, de 16 states, nl 3 regions, pl 16 voivodeships, gb counties, it weak',
    serp_feasibility=F_OPEN_PROVEN,
    serp_evidence='the German school-holiday SERP shares its winners with the holiday SERP; schulferien.eu at DR 27 on 3 backlinks holds position 4 on brueckentage 2026 nrw',
    parent_topic='its own',
    overlap_with_existing='none live', cannibalisation_risk='LOW', cpc_hi=200,
    data_source='PARTLY HELD. 1,502 school records over 232 country-subdivision pairs from OpenHolidays, but the catalogue marks the full set MISSING_ACQUIRABLE, so coverage has to be checked country by country before generating.',
    information_gain='term dates for a named region, which parents and anyone avoiding peak pricing search by region and not by country',
    acceptance=0.75,
    acceptance_basis='lower than the rest of the cluster because the source covers 31 countries for school data against 43 for national holidays')
add(family='pulse.long-weekends', domain='seasonality, travel planning',
    status='IN THE CATALOGUE, ZERO PAGES, 3,984 rows generated',
    head_volume=22000, head_keyword='brueckentage 2026 (de-DE)',
    tail_volume_sampled=1800, tail_example='brueckentage 2026 rlp (de-DE)',
    entities_with_demand=43, entity='country', years=PULSE_YEARS, languages=5,
    languages_where_intent_exists='de Brueckentage, pt feriados prolongados 19,000, fr ponts, nl, pl',
    serp_feasibility=F_OPEN_PROVEN,
    serp_evidence='brueckentage 2026 nrw: ferien-nrw.com DR 1 with zero backlinks at 9, and TUI Cars, Sparkasse and the DGB all compete, which is a travel-brand SERP',
    parent_topic='its own', overlap_with_existing='none live',
    cannibalisation_risk='LOW', cpc_hi=25,
    data_source='HELD. 687 long weekend records derived from the holiday dates with the derivation recorded.',
    information_gain='which holidays fall next to a weekend and how many consecutive days off that gives, computed and not copied',
    acceptance=PULSE_ACC, acceptance_basis='as above')
add(family='pulse.bridge-days', domain='seasonality, travel planning',
    status='IN THE CATALOGUE, ZERO PAGES, part of the 3,984',
    head_volume=18000, head_keyword='brueckentage 2026 (de-DE)',
    tail_volume_sampled=2000, tail_example='urlaub 2026 planen brueckentage (de-DE)',
    entities_with_demand=43, entity='country', years=PULSE_YEARS, languages=4,
    languages_where_intent_exists='de strongest by far, then pt, fr, nl',
    serp_feasibility=F_OPEN_PROVEN, serp_evidence='as above',
    parent_topic='its own', overlap_with_existing='pulse.long-weekends is the same data cut the other way and the two must be ONE page, not two',
    cannibalisation_risk='HIGH against pulse.long-weekends; merge them', cpc_hi=25,
    data_source='HELD. 233 bridge day records.',
    information_gain='the specific working day to book off, by date and weekday',
    acceptance=0.5, acceptance_basis='halved because half of this collection belongs on the long-weekend page')
add(family='pulse.bridge-plans-subdivision', domain='seasonality, travel planning',
    status='IN THE CATALOGUE as pulse.bridge-days-subdivision, ZERO ROWS GENERATED',
    head_volume=9900, head_keyword='brueckentage 2026 nrw (de-DE)',
    tail_volume_sampled=1800, tail_example='brueckentage 2026 rlp (de-DE)',
    entities_with_demand=187, entity='country-subdivision', years=PULSE_YEARS, languages=3,
    languages_where_intent_exists='de, and the measurement only covers de so far',
    serp_feasibility=F_OPEN_PROVEN, serp_evidence='brueckentage 2026 nrw sampled directly',
    parent_topic='its own', overlap_with_existing='none live',
    cannibalisation_risk='LOW', cpc_hi=15,
    data_source='HELD. 1,052 subdivision bridge days, 3,539 subdivision long weekends and 348 bridge plans with a max_days_off field already computed.',
    information_gain='the strongest in the cluster: bridge_plans already computes the maximum consecutive days off a named state can reach in a named year, which is the actual question behind the query',
    acceptance=PULSE_ACC, acceptance_basis='as above')
add(family='pulse.country-month-holidays', domain='seasonality',
    status='NOT IN THE CATALOGUE; a new cut of held data',
    head_volume=40000, head_keyword='feriados novembro 2025 (pt-BR)',
    tail_volume_sampled=2500, tail_example='feiertage oktober 2025 (de-DE)',
    entities_with_demand=43, entity='country-month', years=PULSE_YEARS, languages=4,
    languages_where_intent_exists='pt strongest, then fr jours feries mai 22,000, de feiertage mai 15,000, es',
    serp_feasibility=F_OPEN_LIKELY,
    serp_evidence='not sampled on a month keyword; inherited from the country SERP, which is why it is scored 0.8 and not 1.0',
    parent_topic='the month variant often parents to the year page, so this needs a cannibalisation check against pulse.country-holidays before it is built',
    overlap_with_existing='pulse.country-holidays', cannibalisation_risk='MEDIUM', cpc_hi=5,
    data_source='HELD, the same records filtered by month',
    information_gain='only where the month actually contains holidays; an empty month page would be thin and must not be generated',
    acceptance=0.4,
    acceptance_basis='only about five months a year carry a holiday worth a page, and the parent-topic risk is real')

# ---------------------------------------------------------------- 2026-10-06 best-time work
add(family='weather.city-best-time', domain='climate, seasonality, travel planning',
    status='IN THE CATALOGUE, ZERO PAGES, 29,210 rows rejected on a SERP class copied from the wrong keyword',
    head_volume=6000, head_keyword='best time to visit bali (en-US)',
    tail_volume_sampled=20, tail_example='best time to visit spokane 30, bruges 30, split 30',
    entities_with_demand=159, entity='city', years=1, languages=4,
    languages_where_intent_exists='en 92 of 283 cities clear 20, de 41 of 137 clear 50, fr 16 of 131, it 10 of 64; es pl pt tr REFUSED at city level; nl ja queued',
    serp_feasibility=F_OPEN_PROVEN,
    serp_evidence='best time to visit rome: no knowledge card, every top ten URL RATING between 0 and 7, Rick Steves wins on six backlinks. beste reisezeit dubai: DR 9 with zero backlinks at position 8.',
    parent_topic='its own for 8 of 15 head cities',
    overlap_with_existing='weather.city-month holds 22,927 pages and answers the weather in a named month; this answers which month to choose',
    cannibalisation_risk='LOW', cpc_hi=70,
    data_source='HELD. geonames-cities plus nasa-power-daily, the same pair weather.city-month uses.',
    information_gain='the month to go, derived from the normals this project holds, with the reason',
    acceptance=1.0,
    acceptance_basis='1.0 by construction: the 159 pairs are the ones whose own keyword was measured above the floor, so nothing in the count is unmeasured')

# ---------------------------------------------------------------- wave 2 and 3 and 4
add(family='outdoors.ski-area', domain='ski, outdoor, region',
    status='NOT IN THE CATALOGUE',
    head_volume=9200, head_keyword='winterberg skigebiet (de-DE)',
    tail_volume_sampled=2200, tail_example='laax skigebiet 2,200, klinovec 2,200, arlberg 2,200',
    entities_with_demand=28, entity='ski area', years=1, languages=3,
    languages_where_intent_exists='de measured; fr it likely in the Alps and not yet measured',
    serp_feasibility=F_UNSAMPLED_EASY,
    serp_evidence='NOT SAMPLED. Scored 0.55 on that basis alone and must be sampled before anything is built.',
    parent_topic='not read for this family',
    overlap_with_existing='none live; the outdoor gate rejected 63,316 single-attribute peaks, a different entity',
    cannibalisation_risk='LOW', cpc_hi=70,
    data_source='OSM winter sports areas and piste geometry, but the outdoor layer on disk carries NO ski-area class: its 1,281,126 features are peaks, trail routes, camp sites, springs and the like. A new extraction is needed and the entity count is unknown until it runs.',
    entity_supply_on_disk='UNKNOWN, no ski-area class in the 1,281,126 outdoor features on disk',
    sample_truncated='YES, 28 entities above 2,100 and the list was still at 2,200 when the limit cut it',
    information_gain='piste kilometres by difficulty, lift count, altitude range and season, all of which OSM carries',
    acceptance=0.6,
    acceptance_basis='28 entities measured above 2,100 and the list was truncated, so the real count is higher, but nothing is extracted yet and the SERP is unknown')
add(family='outdoors.named-hike', domain='trail, outdoor',
    status='IN THE CATALOGUE as sport.route, ZERO ROWS GENERATED',
    head_volume=3100, head_keyword='schrecksee wanderung (de-DE)',
    tail_volume_sampled=2100, tail_example='preikestolen wanderung 2,100',
    entities_with_demand=6, entity='named trail', years=1, languages=3,
    languages_where_intent_exists='de measured; others not yet',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read',
    overlap_with_existing='none live', cannibalisation_risk='LOW', cpc_hi=25,
    data_source='HELD. 27 country files in osm-trails with named routes and measured member-way length.',
    entity_supply_on_disk='125,516 named trails across 23 countries, counted on disk: FR 24,590, AT 15,042, ES 9,082, CH 8,956, GB 7,367, US 7,034, NL 6,663, PL 6,400, BE 5,564, SE 5,465',
    sample_truncated='no, but only six entities cleared the floor in a German sample, so the ratio of trails to trails-with-demand is the unknown that decides this family',
    information_gain='length, ascent and the route itself, measured from the way geometry rather than described',
    acceptance=0.5,
    acceptance_basis='only six entities cleared the floor in the sample, so this needs a far wider measurement before a page count is claimed')
add(family='transport.airport-transfer', domain='transport, airport',
    status='IN THE CATALOGUE as transport.airport-to-city, ZERO ROWS GENERATED',
    head_volume=2100, head_keyword='airport transfer (en-US)',
    tail_volume_sampled=200, tail_example='airport transfer cabo san lucas 200 at 160 cents',
    entities_with_demand=16, entity='airport', years=1, languages=3,
    languages_where_intent_exists='en measured; others not yet',
    serp_feasibility=F_CONTESTED,
    serp_evidence='NOT SAMPLED, and scored 0.3 rather than 0.55 because a 250-cent CPC means the SERP is bought and fought over',
    parent_topic='not read',
    overlap_with_existing='transport.route-from-market holds 1,327 pages on market-to-destination distance, a different question',
    cannibalisation_risk='LOW', cpc_hi=250,
    data_source='HELD. ourairports is registered and the project holds airport coordinates.',
    information_gain='the real options with times and prices, which needs a transport source this project does not yet have beyond computed distance',
    acceptance=0.5,
    acceptance_basis='the highest CPC in the project and the lowest page count; admitted for value, not for scale')
add(family='property.city-rent-index', domain='housing, rent',
    status='NOT IN THE CATALOGUE as a distinct family',
    head_volume=5700, head_keyword='mietspiegel berlin (de-DE)',
    tail_volume_sampled=800, tail_example='berliner mietspiegel 2026 800 at 90 cents',
    entities_with_demand=21, entity='city-year', years=3, languages=1,
    languages_where_intent_exists='de only; the Mietspiegel is a German legal instrument and the equivalent has to be found per country',
    serp_feasibility=F_OPEN_PROVEN,
    serp_evidence='mietspiegel leipzig: four domains under DR 35 with zero or one backlink in the top ten, and ImmoScout24 at DR 88 only manages position 7',
    parent_topic='its own',
    overlap_with_existing='rents.city holds 5,202 pages from rent-index-verified; a Mietspiegel is the statutory document and not a rent average, so the two coexist ONLY if the source really is the published Mietspiegel',
    cannibalisation_risk='MEDIUM', cpc_hi=250,
    data_source='PARTLY. rent-index-verified and eurostat-rent-2025 are registered but neither is the published Mietspiegel, which each city issues itself.',
    information_gain='the statutory rent band for a named city and year, which is what a tenant facing an increase needs',
    acceptance=0.6,
    acceptance_basis='discounted for the cannibalisation question and for a source that may not be the right document')
add(family='destinations.country-hub', domain='country, travel planning',
    status='IN THE CATALOGUE, 11 PAGES',
    head_volume=17000, head_keyword='urlaub in deutschland (de-DE)',
    tail_volume_sampled=2000, tail_example='urlaub in dubai 2,000 at 25 cents',
    entities_with_demand=16, entity='country', years=1, languages=4,
    languages_where_intent_exists='de measured at 2,000 to 4,900 with CPC 25 to 60; the other markets are not yet measured on their own phrasing',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read',
    overlap_with_existing='relocation.country holds 15 pages and answers moving there, not visiting; destinations.city-hub was REFUSED on cannibalisation and this is a different entity',
    cannibalisation_risk='LOW', cpc_hi=60,
    data_source='HELD across several stores: climate normals, holidays, cost of living, connectivity',
    information_gain='the country-level answer a trip starts with, which no live family gives',
    acceptance=0.7,
    acceptance_basis='one phrasing measured in one language, so the language factor is held at 4 and not 14')
add(family='outdoors.region-daytrips', domain='region, outdoor',
    status='IN THE CATALOGUE as outdoors.region-feature-list, ZERO ROWS GENERATED',
    head_volume=7500, head_keyword='ausflugsziele nrw (de-DE)',
    tail_volume_sampled=2200, tail_example='ausflugsziele brandenburg 2,200',
    entities_with_demand=6, entity='region', years=1, languages=2,
    languages_where_intent_exists='de measured; others not yet',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read',
    overlap_with_existing='places.city-category holds 5,575 pages at city level; this is the region level above it',
    cannibalisation_risk='MEDIUM against the city category pages', cpc_hi=30,
    data_source='HELD. GeoNames admin1 and admin2 stores plus the OSM outdoor and POI layers.',
    information_gain='an aggregation across a region that no single city page can give, which is the one aggregation shape the brief asks to prefer over thin enumeration',
    acceptance=0.6, acceptance_basis='six entities measured in one language')
add(family='areas.city-neighbourhood-index', domain='neighbourhood',
    status='PARTLY LIVE; neighbourhoods.guide holds 825 pages on the named-neighbourhood axis, the index axis is new',
    head_volume=6300, head_keyword='berlin stadtteile (de-DE)',
    tail_volume_sampled=800, tail_example='stadtteile duesseldorf 800 at 20 cents',
    entities_with_demand=17, entity='city', years=1, languages=2,
    languages_where_intent_exists='de measured, including foreign cities: new york stadtteile 2,300 and london stadtteile 1,000',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read',
    overlap_with_existing='neighbourhoods.guide 825 and places.neighbourhood-category 825',
    cannibalisation_risk='MEDIUM', cpc_hi=25,
    data_source='HELD. neighbourhood-facts-verified plus the OSM place layer.',
    information_gain='the index itself, with a fact per district rather than a bare list of links',
    acceptance=0.6, acceptance_basis='overlaps two live families, so discounted')
add(family='utilities.country-electricity-price', domain='utilities',
    status='NOT IN THE CATALOGUE; no utilities family exists at all',
    head_volume=33000, head_keyword='strompreise (de-DE)',
    tail_volume_sampled=800, tail_example='strompreise europa 800',
    entities_with_demand=8, entity='country-year', years=3, languages=2,
    languages_where_intent_exists='de measured; the intent is national so each market needs its own',
    serp_feasibility=F_CONTESTED,
    serp_evidence='NOT SAMPLED, and scored 0.3 because a 160-cent CPC means comparison sites are buying this traffic',
    parent_topic='not read', overlap_with_existing='none',
    cannibalisation_risk='LOW', cpc_hi=160,
    data_source='NOT YET HELD. Eurostat publishes electricity and gas prices per country per half-year and is not yet ingested.',
    information_gain='the price per kWh for a named country and period against the market the reader is in',
    acceptance=0.5, acceptance_basis='no source ingested yet and the SERP is unsampled')
add(family='work.salary-by-profession', domain='salary, work',
    status='NEW AXIS on a live family; work.city-salaries holds 3,190 pages on the city axis',
    head_volume=13000, head_keyword='minijob gehalt (de-DE)',
    tail_volume_sampled=4700, tail_example='muellmann gehalt 4,700, physiotherapeut 4,700',
    entities_with_demand=20, entity='profession-country', years=1, languages=3,
    languages_where_intent_exists='de measured, twenty professions above 4,700 and the list was truncated',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read',
    overlap_with_existing='work.city-salaries 3,190 on a different axis; work.city-jobs-category 731',
    cannibalisation_risk='LOW on the profession axis', cpc_hi=70,
    data_source='UNVERIFIED FOR THIS AXIS. salary-data-verified, eurostat-salary-2025, ons-house-prices-and-earnings and us-census-acs are registered but whether any carries a per-PROFESSION breakdown has not been checked.',
    information_gain='the pay band for a named profession in a named country, with the source and the year',
    acceptance=0.5,
    acceptance_basis='the axis is measured but the source for it is not confirmed, which is the whole question')
add(family='solar.city-sun-times', domain='climate, travel planning',
    status='NOT IN THE CATALOGUE',
    head_volume=92000, head_keyword='sonnenuntergang (de-DE)',
    tail_volume_sampled=1000, tail_example='sonnenuntergang kiel 1,000',
    entities_with_demand=19, entity='city', years=1, languages=3,
    languages_where_intent_exists='de measured; the intent is universal and the phrasing per language is not yet read',
    serp_feasibility=F_CONTESTED,
    serp_evidence='NOT SAMPLED. timeanddate.com is the incumbent on this intent everywhere and that has to be tested before anything is built.',
    parent_topic='not read', overlap_with_existing='none live',
    cannibalisation_risk='LOW', cpc_hi=50,
    data_source='HELD AND FREE. computed_solar is registered and the times are computable from the coordinates of all 31,715 cities.',
    information_gain='today, plus the year shape: earliest and latest sunset, the solstice dates and the daylight swing',
    acceptance=0.4,
    acceptance_basis='heavily discounted because the intent is dominated by heute and morgen, which a static page answers badly, and because the incumbent is strong')
add(family='visas.country-digital-nomad', domain='relocation',
    status='IN THE CATALOGUE, ZERO PAGES, source_state MISSING_ACQUIRABLE',
    head_volume=13000, head_keyword='digital nomad visa (en-US)',
    tail_volume_sampled=300, tail_example='estonia digital nomad visa 300 at 30 cents',
    entities_with_demand=17, entity='country', years=1, languages=2,
    languages_where_intent_exists='en measured; CPC 70 to 200 cents, among the highest in the project',
    serp_feasibility=F_CONTESTED, serp_evidence='NOT SAMPLED',
    parent_topic='not read', overlap_with_existing='relocation.country 15 pages',
    cannibalisation_risk='LOW', cpc_hi=200,
    data_source='NOT HELD. The honest source is each country immigration authority, which is why the catalogue marks it GOVERNMENT and MISSING_ACQUIRABLE.',
    information_gain='the current rule, which is exactly what cannot be fabricated',
    acceptance=0.0,
    acceptance_basis='ZERO until a source exists. No source, no final. This row is in the matrix as a HIGH PRIORITY SOURCE GAP and its expected final valid is deliberately zero.')

add(family='outdoors.castle', domain='outdoor, heritage, region',
    status='NOT IN THE CATALOGUE as its own family; places.city-category holds 5,575 pages across POI categories',
    head_volume=68000, head_keyword='schloss neuschwanstein (de-DE)',
    tail_volume_sampled=5700, tail_example='berliner schloss 5,700, schweriner schloss 5,900',
    entities_with_demand=20, entity='castle or palace', years=1, languages=3,
    entity_supply_on_disk='34,726 castles in the OSM outdoor layer, plus the England NHLE heritage register already ingested',
    sample_truncated='YES, twenty entities above 5,700 a month and the list was still at 5,700 when the limit cut it',
    languages_where_intent_exists='de measured, including foreign palaces: versailles 19,000, schoenbrunn 16,000, windsor 7,600',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read',
    overlap_with_existing='places.city-category covers POI categories per city; a named castle is an entity page below that',
    cannibalisation_risk='LOW', cpc_hi=30,
    data_source='HELD. 34,726 castle features with coordinates and names.',
    information_gain='opening hours, the era, the owner and the walk from the nearest station, from OSM tags and Wikidata',
    acceptance=0.5,
    acceptance_basis=('halved for severe polysemy. Schloss means castle, palace AND lock in German, so '
                      'the measured set contains a holiday park at 51,000, a theme park at 15,000, a hotel '
                      'at 12,000, an event venue at 11,000, a Ghibli film at 7,500, a Playmobil toy at '
                      '6,700 and an e-scooter LOCK at 6,100. A named-entity gate has to resolve the name '
                      'against the OSM feature before any of this counts.'))
add(family='outdoors.waterfall-and-gorge', domain='outdoor, region',
    status='NOT IN THE CATALOGUE as its own family',
    head_volume=5600, head_keyword='bad urach wasserfall (de-DE)',
    tail_volume_sampled=1100, tail_example='grawa wasserfall 1,100, schaffhausen wasserfall 1,100',
    entities_with_demand=20, entity='waterfall or gorge', years=1, languages=3,
    entity_supply_on_disk='19,197 waterfalls and 24,857 cliffs in the OSM outdoor layer',
    sample_truncated='YES, fourteen named waterfalls and six named gorges above 1,100 before the limit',
    languages_where_intent_exists='de measured, including foreign: samaria schlucht 3,700, manavgat 3,100, verdon 1,700, vikos 1,300, imbros 1,200',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read', overlap_with_existing='the outdoor gate diverted single-attribute peaks to aggregation; a named waterfall is a different entity with real demand',
    cannibalisation_risk='LOW', cpc_hi=45,
    data_source='HELD. 19,197 waterfall features.',
    information_gain='the height, the walk to reach it and the season it runs, which is what the query is for',
    acceptance=0.6,
    acceptance_basis=('discounted for noise: wasserfall garten 2,300 and gartenbrunnen wasserfall 1,100 '
                      'are garden fountains, mauritius unterwasser wasserfall 2,100 is an optical '
                      'illusion, wasserfall in der naehe 9,400 is a geolocation query and col de la '
                      'schlucht 1,300 is a French mountain pass whose name contains the German word'))
add(family='outdoors.beach', domain='beach, outdoor',
    status='NOT IN THE CATALOGUE as its own family',
    head_volume=84000, head_keyword='timmendorfer strand (de-DE)',
    tail_volume_sampled=4100, tail_example='valencia strand 4,100, lissabon strand 4,100',
    entities_with_demand=15, entity='beach', years=1, languages=3,
    entity_supply_on_disk='24,721 beaches and 6,252 beach resorts in the OSM outdoor layer',
    sample_truncated='YES, cut at the limit while still at 4,000 a month',
    languages_where_intent_exists='de measured, and the destination axis is strong: den haag 7,300, scheveningen 6,800, holland 6,200, albanien 7,400, barcelona 5,100, madeira 4,900, zandvoort 4,700, valencia 4,100, lissabon 4,100',
    serp_feasibility=F_UNSAMPLED_EASY, serp_evidence='NOT SAMPLED',
    parent_topic='not read', overlap_with_existing='none live',
    cannibalisation_risk='LOW', cpc_hi=60,
    data_source='HELD. 24,721 beach features with coordinates.',
    information_gain='the facilities, the water, the access and the nearest town, from OSM tags',
    acceptance=0.4,
    acceptance_basis=('heavily discounted. Two of the three largest readings, timmendorfer strand at '
                      '84,000 and weissenhaeuser strand at 55,000, are TOWN names and not beaches, so '
                      'the entity resolution is wrong before it starts. The set also carries adult and '
                      'naturist queries at 11,000, 7,300 and 6,300 which must be excluded outright, a '
                      'whale news event at 13,000, a person at 4,300, and hotel, camping and holiday-let '
                      'variants that belong to the stay surface.'))

# ---------------------------------------------------------------- the refusals, kept in the file
def refuse(family, domain, head_volume, head_keyword, why, entities=0, cpc_hi=0,
           serp=F_LOCKED, status='measured and refused'):
    add(family=family, domain=domain, status=status, head_volume=head_volume,
        head_keyword=head_keyword, tail_volume_sampled=0, tail_example='',
        entities_with_demand=entities, entity='', years=0, languages=0,
        languages_where_intent_exists='', serp_feasibility=serp, serp_evidence=why,
        parent_topic='', overlap_with_existing='', cannibalisation_risk='',
        cpc_hi=cpc_hi, data_source='', information_gain='', acceptance=0.0,
        acceptance_basis='REFUSED: ' + why)


refuse('outdoors.national-park', 'park, outdoor', 340000, 'yellowstone national park (en-US)',
       'OFFICIAL_OWNED. On acadia national park at 183,000 a month the top ten is nps.gov at DR 92, '
       'Wikipedia at DR 97 on 2,055 backlinks, the official state tourism board, the official park '
       'foundation, Tripadvisor at DR 93 and the federal booking system. The weakest winner needs '
       '1,566 backlinks. 43 parks above 21,000 a month and not one reachable position.',
       entities=43, cpc_hi=45)
refuse('climate.city-annual', 'climate', 2000, 'clima roma (it-IT)',
       'CANNIBALISATION, measured. The parent topic of X climate points elsewhere in eleven of '
       'fifteen English readings and nearly every German, French and Italian one: to the city '
       'itself, to meteo, to klimatabelle, or to the best-time intent. weather.city-month already '
       'holds 22,927 pages from the same NASA POWER store.', entities=0, cpc_hi=10, serp=F_CONTESTED)
refuse('climate.city-day', 'climate', 0, 'not measured',
       'FABRICATED PRECISION. The entity is city-date and the only source is MONTHLY normals. A '
       'daily figure derived from a monthly mean is a precision the source does not carry, so no '
       'keyword was measured: the page could not be honest whatever the volume.', serp=F_CONTESTED)
refuse('destinations.city-hub', 'city, travel planning', 2400, 'tokyo travel guide (en-US)',
       'CANNIBALISATION, measured. X travel guide reads 250 to 2,400 in en-US at CPC 20 to 120 '
       'cents, but its parent topics are things to do in bangkok, visiting paris and what to see in '
       'rome, which activities.city-things-to-do already holds with 30,040 pairs. Outside English '
       'it is dead: X reisefuehrer reads 10 in German for every city tested.',
       entities=0, cpc_hi=120, serp=F_CONTESTED)
refuse('tools.time-difference', 'calculators, transport', 1100, 'time difference between (en-US)',
       'THIN FAN-OUT. The tail is 200 to 900 a month against a city-pair space of millions, the '
       'intent is answered by a Google calculator widget above the organic results, and iana-tz '
       'would add no information gain over that widget. This is a city-swap family.',
       entities=8, cpc_hi=30, serp=F_CONTESTED)
refuse('safety.country-is-it-safe', 'safety', 900, 'is it safe to visit british virgin islands (en-US)',
       'TAIL DIES, AND NO SOURCE. Five entities between 300 and 900 a month in the whole returned '
       'set against a hundred-plus country space. safety.country-advice is MISSING_ACQUIRABLE and '
       'the honest source is each foreign ministry travel advice, which changes weekly. A stale '
       'safety page is worse than no page.', entities=5, cpc_hi=20, serp=F_CONTESTED)
refuse('tools.net-pay-calculator', 'calculators, tax', 1260000, 'brutto netto rechner (de-DE)',
       'NOT A FAMILY. 1,260,000 a month is the second largest keyword in the project, but the axis '
       'is one year, two states and a public-sector pay scale, the CPC is 2 cents, and '
       'tools.net-pay already generated 11 rows. The brief says not to count twenty tools as a fake '
       'scale path, and this is that case: build the tool, do not call it scale.',
       entities=9, cpc_hi=3, serp=F_CONTESTED,
       status='ADMITTED AS ONE TOOL, REFUSED AS A SCALE PATH')
refuse('pulse.it-ponti', 'seasonality', 20000, 'ponti 2026 (it-IT)',
       'AMBIGUOUS TERM. The Italian word for a bridge day collides with the surname: Carlo Ponti '
       '11,000, Edoardo Ponti 13,000, Gio Ponti 7,900, i ponti di madison county 7,100. Of sixty '
       'rows returned only three belong to this intent. Italy is admitted at country level only.',
       entities=3, cpc_hi=2, serp=F_CONTESTED)


def main():
    for r in R:
        r['commercial_value'] = commercial(r.get('cpc_hi', 0))
        r.setdefault('entity_supply_on_disk', '')
        r.setdefault('sample_truncated', 'no')
        # expected_raw_candidates is built from entities whose demand was MEASURED, never from
        # the supply on disk. Where the sample was truncated the measured count is a FLOOR and
        # the row says so, because the honest statement is that the entity supply is large and
        # the per-entity demand has not been measured yet.
        r['expected_raw_candidates'] = int(r['entities_with_demand']
                                           * max(r.get('years', 1), 1)
                                           * max(r.get('languages', 1), 1))
        r['expected_final_valid'] = int(round(r['expected_raw_candidates'] * r['acceptance']))
        r['expected_acceptance_rate'] = r['acceptance']
        r['rank_score'] = round(r['expected_final_valid'] * r['commercial_value']
                                * r['serp_feasibility'], 1)
    R.sort(key=lambda r: -r['rank_score'])

    cols = ['family', 'domain', 'status', 'head_volume', 'head_keyword', 'tail_volume_sampled',
            'tail_example', 'entities_with_demand', 'entity', 'years', 'languages',
            'languages_where_intent_exists', 'serp_feasibility', 'serp_evidence', 'parent_topic',
            'overlap_with_existing', 'cannibalisation_risk', 'cpc_hi', 'commercial_value',
            'data_source', 'entity_supply_on_disk', 'sample_truncated',
            'information_gain', 'expected_raw_candidates',
            'expected_final_valid', 'expected_acceptance_rate', 'acceptance_basis', 'rank_score']
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction='ignore')
        w.writeheader()
        w.writerows(R)

    admitted = [r for r in R if r['expected_final_valid'] > 0]
    refused = [r for r in R if r['expected_final_valid'] == 0]
    json.dump({
        'generated_on': '2026-10-07',
        'candidates_measured': len(R),
        'admitted': len(admitted), 'refused_or_blocked': len(refused),
        'the_sort_key': 'expected_final_valid x commercial_value x serp_feasibility',
        'the_two_multiplier_scales': {
            'serp_feasibility': {'1.00': 'a sub-DR-20 page with zero backlinks holds a top ten position',
                                 '0.80': 'a sub-DR-40 page with few backlinks holds one',
                                 '0.55': 'difficulty under 10 but NO SERP sampled yet',
                                 '0.30': 'mid-authority contest, or a CPC high enough that the SERP is fought over',
                                 '0.05': 'official or aggregator owned with no weak winner in the top ten'},
            'commercial_value': 'from the measured CPC ceiling in cents: 150+ is 1.00, 60 to 149 is 0.70, 25 to 59 is 0.45, 10 to 24 is 0.25, under 10 is 0.10'},
        'total_expected_final_valid_across_admitted': sum(r['expected_final_valid'] for r in admitted),
        'what_this_total_is_and_is_not': (
            'it is the sum of entities x years x languages x a stated acceptance rate, per family, '
            'from measured entity counts. It is NOT a promise and it is NOT comparable to the '
            '401,393 that exists: that number came from a run and this one comes from a '
            'measurement of demand plus an estimate of yield. Every row names the factors so the '
            'arithmetic can be checked and corrected.'),
        'what_actually_binds_the_admitted_count': {
            'the_finding': ('expected_final_valid above is built from entities whose demand was '
                            'MEASURED, and most of those samples were truncated at the call '
                            'limit. The entity SUPPLY on disk is two orders of magnitude larger '
                            'than the measured demand count.'),
            'entity_supply_counted_on_disk': {
                'named trails': 125516, 'outdoor features in total': 1281126,
                'peaks': 384962, 'trail routes': 234149, 'camp sites': 67504,
                'archaeological sites': 66902, 'springs': 50917, 'viewpoints': 49212,
                'ruins': 43588, 'caves': 37832, 'mountain passes': 36907, 'castles': 34726,
                'monuments': 30127, 'bays': 27513, 'cliffs': 24857, 'beaches': 24721,
                'waterfalls': 19197, 'mountain huts': 7279, 'beach resorts': 6252,
                'lighthouses': 5012},
            'the_measured_hit_rates': {
                'named ski areas above 2,100 a month in German': '28 of 40 submitted, 70 per cent',
                'named waterfalls and gorges above 1,100 in German': '20 of 35, 57 per cent',
                'named castles above 5,700 in German': '20 of 35, 57 per cent',
                'named beaches above 1,000 in German': '15 of 35, 43 per cent',
                'cities above 20 a month for best-time in English': '92 of 283, 33 per cent',
                'cities above 50 for best-time in German': '41 of 137, 30 per cent'},
            'so_the_binding_constraint_is_the_MEASUREMENT_BUDGET': (
                'per-entity demand cannot be inferred. The best-time tail probe settled that: '
                'Akron and Tulsa have things-to-do pages and read zero while Sedona has none and '
                'reads 2,400. So every entity must be measured, at 13 units a row with '
                'zero-volume rows free. About 500,000 Ahrefs units remain before the 2026-10-08 '
                'reset, which measures roughly 38,000 entities. At the 40 to 55 per cent hit '
                'rates above that admits 15,000 to 20,000 entities, and at two to three '
                'qualifying languages each that is 30,000 to 60,000 FINAL VALID pages from the '
                'outdoor layer alone, on top of the 15,429 in this matrix.'),
            'and_that_is_the_honest_answer_to_the_500k_gap': (
                'it does not close it this cycle. The measurement budget closes perhaps 50,000 '
                'to 75,000 of it. Closing the rest needs either a second measurement cycle after '
                'the reset, which costs only time, or the commercial and official datasets named '
                'in the source-gap list, chiefly visa rules, school-holiday coverage beyond 31 '
                'countries, transport timetables and the published Mietspiegel documents.')},
        'the_honest_headline': (
            'the gap to a million is about 500,000 pages and the families measured here do not '
            'close it. They are worth tens of thousands, at a value per page far above the '
            'existing inventory. The pulse cluster alone carries more measured search volume on '
            'its top keyword per market, 3.7 million a month across seven markets, than the whole '
            'current inventory of 401,393 pages was ever measured to carry.'),
        'ranked': [{k: r[k] for k in ('family', 'rank_score', 'expected_final_valid',
                                      'commercial_value', 'serp_feasibility', 'head_volume',
                                      'entities_with_demand', 'status')} for r in R],
    }, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'candidates: {len(R)}  admitted: {len(admitted)}  refused or blocked: {len(refused)}')
    print(f'sum expected FINAL VALID across admitted: '
          f'{sum(r["expected_final_valid"] for r in admitted):,}')
    print()
    print(f"{'family':<38}{'score':>9}{'final':>8}{'comm':>6}{'serp':>6}{'head vol':>11}{'ents':>6}")
    for r in R:
        print(f"{r['family']:<38}{r['rank_score']:>9,.1f}{r['expected_final_valid']:>8,}"
              f"{r['commercial_value']:>6.2f}{r['serp_feasibility']:>6.2f}"
              f"{r['head_volume']:>11,}{r['entities_with_demand']:>6}")


if __name__ == '__main__':
    main()
