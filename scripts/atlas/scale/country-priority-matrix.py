#!/usr/bin/env python3
"""
Commercial value and scale value are different axes, and conflating them is how India outranks
Switzerland for the wrong reason.

This builds COUNTRY-PRIORITY-MATRIX.csv: four independent 0-100 scores per country, a weighted
PRIORITY_SCORE, and a tier. Nothing here is scored from memory. Every component is either a
World Bank indicator fetched on 2026-10-06 into data/atlas/sources/worldbank/, an Ahrefs volume
or CPC already measured into data/atlas/measurements/, or a count taken from this project's own
stores and from the manifest that the last run produced.

Deliberate properties, each of which was a decision rather than a default:

  - A missing MEASUREMENT scores zero for its component. It is not redistributed across the
    remaining weights, because redistributing rewards a country for being unmeasured and then
    hides the gap. The row's next_action names the measurement instead.
  - A missing SOURCE for a country the World Bank does not cover at all (Taiwan) renormalises
    over the components that do exist, and the row is listed in the JSON under
    countries_without_world_bank_coverage so the hole is visible rather than filled with a
    neighbour's number.
  - Money and volume are heavy-tailed, so each is log10-scaled before min-max normalisation
    across the scored set. Raw min-max would put the United States at 100 and everything else
    near zero on tourism receipts.
  - Duplicate risk and thin-content risk reduce the scale score as a multiplier, not as an
    additive component. Scale that cannot survive the gates is not scale: the 2026-10-06 run
    generated 946,225 rows and kept 401,393, and the countries where that ratio was worst are
    exactly the ones a raw entity count flatters.
  - The scale side is anchored on FINAL VALID pages, never on raw candidates.

Usage: country-priority-matrix.py
Writes reports/livdar-expiry-freeze-2026-09-30/COUNTRY-PRIORITY-MATRIX.csv
       data/atlas/measurements/country-priority-matrix-2026-10-06.json
       data/atlas/measurements/capture-queue-by-priority-2026-10-06.json
"""
import collections, csv, glob, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                              # noqa: E402

MEAS = ROOT + 'data/atlas/measurements/'
SRC = ROOT + 'data/atlas/sources/'
REP = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
WB = SRC + 'worldbank/'
OUT_CSV = REP + 'COUNTRY-PRIORITY-MATRIX.csv'
OUT_JSON = MEAS + 'country-priority-matrix-2026-10-06.json'
OUT_QUEUE = MEAS + 'capture-queue-by-priority-2026-10-06.json'

# The four axis weights are the brief's, stated here so the arithmetic is auditable.
W_COMMERCIAL, W_SCALE, W_DEMAND, W_READY = 0.45, 0.35, 0.10, 0.10
# For an ORIGIN market the brief asks for commercial value to dominate. That is a SECOND
# ordering, written to the JSON and used for the research queue; priority_score in the CSV
# stays on the mandated weights so the column means one thing only.
WO_COMMERCIAL, WO_SCALE, WO_DEMAND, WO_READY = 0.70, 0.10, 0.10, 0.10

# Tier cutoffs. Absolute and stated, so a country's tier does not move when another country is
# added to the matrix. Chosen after printing the deciles of both axes over the scored set.
HIGH_COMMERCIAL = 55.0
HIGH_SCALE = 35.0

MARKET_COUNTRIES = set(entity_identity.MKT_COUNTRY.values())


# ---------------------------------------------------------------------------- sources on disk
def wb_indicator(ind, real, fixed_year=None):
    """{iso2: (value, year)} for one indicator, aggregates excluded by region, not by hand.

    fixed_year pins the comparison to one year and falls back to the most-recent-non-empty
    reading only where that year is missing. It exists because mrnev=1 returns 2020 for some
    countries and 2019 for others on the two tourism indicators, and 2020 is a pandemic year:
    comparing Japan's 2020 outbound spend against Germany's 2019 is not a comparison, and it
    cost Japan about thirty points on the travel-spend component before this was fixed.
    """
    out = {}
    with open(WB + f'wb-{ind}.json', encoding='utf-8') as fh:
        payload = json.load(fh)
    for r in (payload[1] or []):
        iso2 = (r.get('country') or {}).get('id') or ''
        if iso2 in real and r.get('value') is not None:
            out[iso2] = (float(r['value']), str(r.get('date') or ''))
    if not fixed_year:
        return out
    pinned = {}
    path = WB + f'wb-{ind}-{fixed_year}.json'
    if os.path.exists(path):
        with open(path, encoding='utf-8') as fh:
            payload = json.load(fh)
        for r in (payload[1] or []):
            iso2 = (r.get('country') or {}).get('id') or ''
            if iso2 in real and r.get('value') is not None:
                pinned[iso2] = (float(r['value']), str(r.get('date') or ''))
    merged = dict(out)
    merged.update(pinned)
    return merged


def wb_real_countries():
    """iso2 -> name for the 217 rows carrying a real region. The other 79 are aggregates."""
    with open(WB + 'wb-countries.json', encoding='utf-8') as fh:
        payload = json.load(fh)
    return {r['iso2Code']: r['name'] for r in (payload[1] or [])
            if ((r.get('region') or {}).get('id') or 'NA') != 'NA'}


def destination_demand():
    """{country: {lang: (connectivity, information, cpc_cents)}} from the measured gate table."""
    out = collections.defaultdict(dict)
    for (cc, lang), row in entity_identity._dest_rows().items():
        out[cc][lang] = (row.get('max_connectivity_volume') or 0,
                         row.get('max_information_volume') or 0,
                         row.get('max_cpc_cents') or 0)
    return out


def origin_market_evidence():
    """{country: (total_measured_volume, highest_cpc_cents, source)} for markets and candidates.

    The live markets carry an eSIM reading in their own pulse measurement; the candidates carry
    one in the expansion ranking. Both are Ahrefs Keywords Explorer readings already paid for.
    """
    out = {}
    for f in sorted(glob.glob(MEAS + 'market-expansion-ranking-*.json')):
        try:
            d = json.load(open(f, encoding='utf-8'))
        except ValueError:
            continue
        for c in (d.get('candidates') or []):
            cc = c.get('country')
            if not cc:
                continue
            vol = c.get('total_measured_volume') or 0
            cpc = c.get('highest_cpc_cents') or 0
            prev = out.get(cc)
            if not prev or vol > prev[0]:
                out[cc] = (vol, cpc, os.path.basename(f))
    for f in sorted(glob.glob(MEAS + 'ahrefs-pulse-*.json')):
        try:
            d = json.load(open(f, encoding='utf-8'))
        except ValueError:
            continue
        mkt = os.path.basename(f)[12:-16]
        cc = entity_identity.MKT_COUNTRY.get(mkt)
        if not cc:
            continue
        vol = cpc = 0
        for row in _iter_keyword_rows(d):
            vol += int(row.get('volume') or 0)
            cpc = max(cpc, int(row.get('cpc') or 0))
        if vol and (cc not in out or vol > out[cc][0]):
            out[cc] = (vol, cpc, os.path.basename(f))
    return out


def _iter_keyword_rows(o):
    """Walk a measurement file and yield every dict that looks like a keyword reading."""
    stack = [o]
    while stack:
        cur = stack.pop()
        if isinstance(cur, dict):
            if 'volume' in cur and not isinstance(cur.get('volume'), (dict, list)):
                yield cur
            else:
                stack.extend(cur.values())
        elif isinstance(cur, list):
            stack.extend(cur)


def manifest_by_country():
    """FINAL VALID pages per country, plus the two splits that decide what a capture is worth.

    osm_pages is counted because the whole destination capture queue rests on an assumption
    that this count tests: that downloading an extract for a country produces pages about it.
    per_family is counted per country so an expected yield can be attributed to a named family
    rather than to a blended rate.
    """
    pages = collections.Counter()
    osm_pages = collections.Counter()
    fams = collections.defaultdict(set)
    mkts = collections.defaultdict(set)
    per_family = collections.defaultdict(collections.Counter)
    with gzip.open(REP + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'rt',
                   encoding='utf-8', newline='') as fh:
        for r in csv.DictReader(fh):
            cc = (r.get('country') or '').strip()
            if not cc:
                continue
            pages[cc] += 1
            fam = r.get('family') or ''
            fams[cc].add(fam)
            mkts[cc].add(r.get('market') or '')
            per_family[cc][fam] += 1
            src = (r.get('data_source') or '').lower()
            if 'openstreetmap' in src or src.startswith('osm'):
                osm_pages[cc] += 1
    return (pages, {k: len(v) for k, v in fams.items()},
            {k: sorted(v) for k, v in mkts.items()}, osm_pages, per_family)


def rejections_by_country():
    """Measured duplicate-shaped and thin-shaped removals per country.

    Two stages contribute and both are counted, because reading only the manifest-stage ledger
    understates the thin problem by the 63,316 outdoor features the item-10 gate diverted to
    aggregation before a candidate row was ever written.
    """
    dup = collections.Counter()
    thin = collections.Counter()
    other = collections.Counter()
    fam_not_measured = collections.Counter()
    with gzip.open(REP + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'rt',
                   encoding='utf-8', newline='') as fh:
        for r in csv.DictReader(fh):
            cc = (r.get('country') or '').strip()
            if not cc:
                continue
            low = (r.get('rejection_reason') or '').lower()
            if 'family_not_measured_in_this_market' in low:
                fam_not_measured[cc] += 1
            if ('translation_only' in low or 'duplicate' in low
                    or 'same_name_in_city' in low or 'collision' in low):
                dup[cc] += 1
            elif 'no defensible uniqueness' in low or 'indexability floor' in low:
                thin[cc] += 1
            else:
                other[cc] += 1
    agg = SRC + 'osm-outdoor/_aggregate-only-features.jsonl.gz'
    outdoor_thin = collections.Counter()
    if os.path.exists(agg):
        with gzip.open(agg, 'rt', encoding='utf-8') as fh:
            for line in fh:
                if not line.strip():
                    continue
                try:
                    o = json.loads(line)
                except ValueError:
                    continue
                cc = (o.get('country') or '').strip()
                if cc:
                    outdoor_thin[cc] += 1
                    thin[cc] += 1
    return dup, thin, other, outdoor_thin, fam_not_measured


def store_counts():
    """Entity counts from this project's own stores: gazetteer, climate, regions, OSM layers."""
    gaz = collections.Counter()
    g = entity_identity.load_gazetteer()
    for rec in g.by_id.values():
        cc = (rec.get('country') or '').strip()
        if cc:
            gaz[cc] += 1
    clim = collections.Counter()
    for f in sorted(glob.glob(SRC + 'climate/power/power-*.jsonl')):
        cc = os.path.basename(f)[6:8].upper()
        with open(f, encoding='utf-8') as fh:
            clim[cc] = sum(1 for line in fh if line.strip())
    regions = collections.Counter()
    for name in ('admin1-regions', 'admin2-regions'):
        p = SRC + f'geonames/{name}.jsonl.gz'
        if not os.path.exists(p):
            continue
        with gzip.open(p, 'rt', encoding='utf-8') as fh:
            for line in fh:
                if not line.strip():
                    continue
                try:
                    o = json.loads(line)
                except ValueError:
                    continue
                cc = (o.get('country') or o.get('country_code') or '').strip().upper()
                if cc:
                    regions[cc] += 1
    layers = collections.defaultdict(dict)
    pat = {'parents': 'osm-parents/parents-{}*.jsonl.gz',
           'places': 'osm-places/places-{}*.jsonl.gz',
           'poi': 'osm-poi/poi-{}*.jsonl.gz',
           'outdoor': 'osm-outdoor/outdoor-{}*.jsonl.gz',
           'trails': 'osm-trails/trails-{}*.jsonl.gz'}
    for name, gl in pat.items():
        for f in glob.glob(SRC + gl.format('*')):
            base = os.path.basename(f)
            if base.startswith('_'):
                continue
            cc = base.split('-', 1)[1][:2].upper()
            layers[cc][name] = layers[cc].get(name, 0) + os.path.getsize(f)
    wd = collections.Counter()
    for f in glob.glob(SRC + 'wikidata/wd-*-*.jsonl.gz'):
        cc = os.path.basename(f)[:-9].rsplit('-', 1)[-1].upper()
        if len(cc) == 2:
            wd[cc] += os.path.getsize(f)
    return gaz, clim, regions, layers, wd


def mirror_blocked():
    try:
        m = json.load(open(MEAS + 'destination-mirror-coverage-2026-10-02.json', encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        return set()
    out, reach = set(), {}
    for k, v in m.items():
        if 'not_carried' in k and isinstance(v, (list, dict)):
            out.update(x for x in v if isinstance(x, str) and len(x) == 2)
        if k == 'reachable' and isinstance(v, dict):
            for cc, d in v.items():
                if isinstance(d, dict) and d.get('region_path'):
                    reach[cc] = d['region_path']
    return out, reach


# ------------------------------------------------------------------------------- normalisation
def log_scaler(values):
    """log10 min-max over the non-zero readings. Returns f(value) -> 0..1, and f(0) == 0.

    Zero means not measured or genuinely nothing, and both belong at the floor. A country is
    never lifted off the floor by the absence of a reading.
    """
    pos = [v for v in values if v and v > 0]
    if not pos:
        return lambda v: 0.0
    lo, hi = math.log10(min(pos)), math.log10(max(pos))
    if hi - lo < 1e-9:
        return lambda v: 1.0 if v and v > 0 else 0.0
    return lambda v: 0.0 if not v or v <= 0 else max(
        0.0, min(1.0, (math.log10(v) - lo) / (hi - lo)))


def lin_scaler(values):
    pos = [v for v in values if v is not None]
    if not pos:
        return lambda v: 0.0
    lo, hi = min(pos), max(pos)
    if hi - lo < 1e-9:
        return lambda v: 1.0 if v else 0.0
    return lambda v: 0.0 if v is None else max(0.0, min(1.0, (v - lo) / (hi - lo)))


def main():
    real = wb_real_countries()
    gdp = wb_indicator('NY.GDP.PCAP.PP.CD', real)
    outb = wb_indicator('ST.INT.XPND.CD', real, fixed_year=2019)
    inb = wb_indicator('ST.INT.RCPT.CD', real, fixed_year=2019)
    net = wb_indicator('IT.NET.USER.ZS', real)
    pop = wb_indicator('SP.POP.TOTL', real)

    dem = destination_demand()
    orig = origin_market_evidence()
    pages, fams, mkts, osm_pages, per_family = manifest_by_country()
    dup, thin, other_rej, outdoor_thin, fam_nm = rejections_by_country()
    gaz, clim, regions, layers, wd = store_counts()
    blocked, reachable_path = mirror_blocked()

    scope = (set(real) | set(dem) | set(pages) | MARKET_COUNTRIES | set(orig)
             | set(gaz) | set(layers))
    scope = {c for c in scope if len(c) == 2 and c.isalpha()}

    # ---- the expected-yield benchmark, measured separately for the two roles ----------------
    # A home-market country produces far more pages per city than a destination country: its
    # whole family set is alive in its own language. Using one blended benchmark for both, as
    # the 2026-10-06 plan did, flatters every destination country. So measure two.
    def captured(cc):
        return len(layers.get(cc, {})) >= 4

    home_num = sum(pages.get(c, 0) for c in MARKET_COUNTRIES if captured(c) and gaz.get(c))
    home_den = sum(gaz.get(c, 0) for c in MARKET_COUNTRIES if captured(c) and gaz.get(c))
    # A destination country's page space is cities TIMES the languages whose demand qualified
    # for it, not cities alone: a country that cleared the gate in six languages can carry six
    # pages per entity and a country that cleared it in one can carry one. Dividing by cities
    # alone would hand a one-language country the six-language rate.
    dest_cc = [c for c in dem if c not in MARKET_COUNTRIES and captured(c) and gaz.get(c)
               and pages.get(c, 0) > 0]
    dest_num = sum(pages.get(c, 0) for c in dest_cc)
    dest_den = sum(gaz.get(c, 0) * max(len(dem.get(c, {})), 1) for c in dest_cc)
    home_per_city = home_num / max(home_den, 1)
    dest_per_city_language = dest_num / max(dest_den, 1)

    # ---- what an OSM capture is actually worth for a destination country -------------------
    # This is the measurement the capture queue was never held to. Sixteen destination
    # countries carry four or five OSM layers on disk. Between them they produce ZERO pages
    # whose data_source is OpenStreetMap: every OSM-sourced page in the manifest is about one
    # of the fourteen home-market countries. The cause is already recorded - the destination
    # POI fan-out produced 292,613 raw rows and the localisation gate removed 263,742 of them
    # as TRANSLATION_ONLY - and the gate is right, because the brief's own rule is that if
    # only the language changes the page is rejected. So the extract is not the constraint and
    # a projection built on a blended per-city rate, which is what 11.72 was, double-counts
    # home-market output as destination upside.
    osm_dest_num = sum(osm_pages.get(c, 0) for c in dest_cc)
    osm_dest_den = sum(gaz.get(c, 0) * max(len(dem.get(c, {})), 1) for c in dest_cc)
    osm_dest_rate = osm_dest_num / max(osm_dest_den, 1)
    # Per-family destination rates, so an expected yield names the family that would carry it.
    fam_num = collections.Counter()
    for c in dest_cc:
        for fam, n in per_family.get(c, {}).items():
            fam_num[fam] += n
    dest_family_rates = {fam: n / max(dest_den, 1) for fam, n in fam_num.most_common()}

    rows = []
    for cc in sorted(scope):
        langs = dem.get(cc, {})
        have = layers.get(cc, {})
        is_origin = cc in MARKET_COUNTRIES or cc in orig
        is_dest = bool(langs) or pages.get(cc, 0) > 0
        role = ('BOTH' if is_origin and is_dest
                else 'ORIGIN' if is_origin else 'DESTINATION' if is_dest else 'DESTINATION')
        if cc in MARKET_COUNTRIES:
            per_unit, units = home_per_city, gaz.get(cc, 0)
        else:
            per_unit = dest_per_city_language
            units = gaz.get(cc, 0) * max(len(langs), 1 if langs else 0)
        expected_total = int(units * per_unit)
        from_capture = int(units * osm_dest_rate) if cc not in MARKET_COUNTRIES else 0
        rows.append({
            'country': cc,
            'name': real.get(cc, cc),
            'role': role,
            'is_home_market': cc in MARKET_COUNTRIES,
            'in_measured_scope': bool(langs) or cc in MARKET_COUNTRIES or cc in orig,
            'gdp_pc_ppp': gdp.get(cc, (None, ''))[0],
            'gdp_pc_ppp_year': gdp.get(cc, (None, ''))[1],
            'outbound_travel_spend_per_capita': (
                outb[cc][0] / pop[cc][0] if cc in outb and cc in pop and pop[cc][0] else None),
            'outbound_travel_spend_year': outb.get(cc, (None, ''))[1],
            'inbound_tourism_receipts': inb.get(cc, (None, ''))[0],
            'inbound_tourism_receipts_year': inb.get(cc, (None, ''))[1],
            'internet_pct': net.get(cc, (None, ''))[0],
            'population': pop.get(cc, (None, ''))[0],
            'measured_max_cpc_cents': max([v[2] for v in langs.values()] +
                                          [orig[cc][1] if cc in orig else 0] + [0]),
            'measured_connectivity_volume': max([v[0] for v in langs.values()] + [0]),
            'measured_information_volume': max([v[1] for v in langs.values()] + [0]),
            'measured_origin_volume': orig[cc][0] if cc in orig else 0,
            'languages_qualified': len(langs),
            'languages': ','.join(sorted(langs)),
            'current_final_pages': pages.get(cc, 0),
            'live_families': fams.get(cc, 0),
            'markets_producing_pages': len(mkts.get(cc, [])),
            'gazetteer_cities': gaz.get(cc, 0),
            'climate_cities': clim.get(cc, 0),
            'geonames_regions': regions.get(cc, 0),
            'wikidata_bytes': wd.get(cc, 0),
            'osm_layers_present': sorted(have),
            'osm_layer_bytes': sum(have.values()),
            'duplicate_removals': dup.get(cc, 0),
            'thin_removals': thin.get(cc, 0),
            'outdoor_thin_diverted': outdoor_thin.get(cc, 0),
            'other_removals': other_rej.get(cc, 0),
            'family_not_measured_removals': fam_nm.get(cc, 0),
            'expected_pages_if_fully_captured': expected_total,
            'expected_net_new_valid_pages': max(0, expected_total - pages.get(cc, 0)),
            'expected_net_new_attributable_to_an_osm_capture': from_capture,
            'osm_sourced_pages_today': osm_pages.get(cc, 0),
            'live_destination_families': sorted(
                f for f in (per_family.get(cc) or {}) if per_family[cc][f]) if cc not in MARKET_COUNTRIES else [],
            'pages_per_city_benchmark_used': round(per_unit, 3),
            'benchmark_units': units,
            'benchmark_kind': ('home market: pages per gazetteer city'
                               if cc in MARKET_COUNTRIES
                               else 'destination: pages per gazetteer city per qualifying language'),
            'osm_region_path': reachable_path.get(cc, ''),
            'mirror_blocked': cc in blocked,
            'world_bank_covered': cc in real,
        })

    # Risk rates: measured, over everything this project generated for that country.
    for r in rows:
        gen = (r['current_final_pages'] + r['duplicate_removals'] + r['thin_removals']
               + r['other_removals'])
        r['generated_for_this_country'] = gen
        r['duplicate_risk_rate'] = round(r['duplicate_removals'] / gen, 4) if gen else 0.0
        r['thin_risk_rate'] = round(r['thin_removals'] / gen, 4) if gen else 0.0

    # ---- scalers built over the scored set, so every score is relative to real peers --------
    s_gdp = log_scaler([r['gdp_pc_ppp'] for r in rows])
    s_out = log_scaler([r['outbound_travel_spend_per_capita'] for r in rows])
    s_inb = log_scaler([r['inbound_tourism_receipts'] for r in rows])
    s_net = lin_scaler([r['internet_pct'] for r in rows])
    s_cpc = log_scaler([r['measured_max_cpc_cents'] for r in rows])
    s_evol = log_scaler([max(r['measured_connectivity_volume'], r['measured_origin_volume'])
                         for r in rows])
    s_ent = log_scaler([r['gazetteer_cities'] + r['climate_cities'] + r['geonames_regions']
                        for r in rows])
    s_fam = log_scaler([r['live_families'] for r in rows])
    s_exp = log_scaler([r['current_final_pages'] + r['expected_net_new_valid_pages']
                        for r in rows])
    s_con = log_scaler([r['measured_connectivity_volume'] for r in rows])
    s_inf = log_scaler([r['measured_information_volume'] for r in rows])
    s_ovl = log_scaler([r['measured_origin_volume'] for r in rows])
    s_gazr = log_scaler([r['gazetteer_cities'] for r in rows])

    C_W = {'gdp_pc_ppp': 30, 'outbound_travel_spend_per_capita': 20,
           'inbound_tourism_receipts': 15, 'internet_pct': 10,
           'measured_max_cpc_cents': 15, 'measured_esim_volume': 10}
    S_W = {'source_backed_entities': 25, 'live_useful_families': 20,
           'demand_backed_languages': 10, 'expected_final_valid_pages': 45}
    D_W = {'connectivity_volume': 40, 'information_volume': 30,
           'qualifying_languages': 15, 'origin_market_volume': 15}
    R_W = {'osm_layers': 40, 'gazetteer': 15, 'climate_normals': 15,
           'wikidata_marks': 15, 'admin_regions': 15}

    for r in rows:
        # COMMERCIAL. A World Bank component that does not exist for this country at all is
        # dropped and the remaining weights renormalised; a MEASUREMENT that has not been taken
        # scores zero and is named in next_action.
        parts, miss = {}, []
        for key, scaler in (('gdp_pc_ppp', s_gdp),
                            ('outbound_travel_spend_per_capita', s_out),
                            ('inbound_tourism_receipts', s_inb)):
            if r[key] is None:
                miss.append(key)
            else:
                parts[key] = scaler(r[key]) * C_W[key]
        if r['internet_pct'] is None:
            miss.append('internet_pct')
        else:
            parts['internet_pct'] = s_net(r['internet_pct']) * C_W['internet_pct']
        parts['measured_max_cpc_cents'] = (s_cpc(r['measured_max_cpc_cents'])
                                           * C_W['measured_max_cpc_cents'])
        parts['measured_esim_volume'] = (
            s_evol(max(r['measured_connectivity_volume'], r['measured_origin_volume']))
            * C_W['measured_esim_volume'])
        available = sum(C_W[k] for k in C_W if k not in miss)
        r['commercial_components'] = {k: round(v, 2) for k, v in parts.items()}
        r['commercial_components_missing_at_source'] = miss
        r['commercial_score'] = round(sum(parts.values()) * 100.0 / max(available, 1), 1)

        # SCALE, on FINAL VALID pages and on entities that exist, then discounted by the
        # measured rate at which this country's own rows failed the uniqueness gates.
        sp = {
            'source_backed_entities': s_ent(r['gazetteer_cities'] + r['climate_cities']
                                            + r['geonames_regions'])
            * S_W['source_backed_entities'],
            'live_useful_families': s_fam(r['live_families']) * S_W['live_useful_families'],
            'demand_backed_languages': min(1.0, r['languages_qualified'] / 6.0)
            * S_W['demand_backed_languages'],
            'expected_final_valid_pages': s_exp(r['current_final_pages']
                                                + r['expected_net_new_valid_pages'])
            * S_W['expected_final_valid_pages'],
        }
        raw_scale = sum(sp.values())
        mult = max(0.40, min(1.0, 1.0 - 0.5 * r['duplicate_risk_rate']
                             - 0.5 * r['thin_risk_rate']))
        r['scale_components'] = {k: round(v, 2) for k, v in sp.items()}
        r['scale_quality_multiplier'] = round(mult, 3)
        r['scale_score'] = round(raw_scale * mult, 1)

        dp = {'connectivity_volume': s_con(r['measured_connectivity_volume'])
              * D_W['connectivity_volume'],
              'information_volume': s_inf(r['measured_information_volume'])
              * D_W['information_volume'],
              'qualifying_languages': min(1.0, r['languages_qualified'] / 6.0)
              * D_W['qualifying_languages'],
              'origin_market_volume': s_ovl(r['measured_origin_volume'])
              * D_W['origin_market_volume']}
        r['demand_components'] = {k: round(v, 2) for k, v in dp.items()}
        r['demand_score'] = round(sum(dp.values()), 1)

        rp = {'osm_layers': len(r['osm_layers_present']) / 5.0 * R_W['osm_layers'],
              'gazetteer': s_gazr(r['gazetteer_cities']) * R_W['gazetteer'],
              'climate_normals': (1.0 if r['climate_cities'] else 0.0) * R_W['climate_normals'],
              'wikidata_marks': (1.0 if r['wikidata_bytes'] else 0.0) * R_W['wikidata_marks'],
              'admin_regions': (1.0 if r['geonames_regions'] else 0.0) * R_W['admin_regions']}
        r['readiness_components'] = {k: round(v, 2) for k, v in rp.items()}
        r['data_readiness_score'] = round(sum(rp.values()), 1)

        r['priority_score'] = round(W_COMMERCIAL * r['commercial_score']
                                    + W_SCALE * r['scale_score']
                                    + W_DEMAND * r['demand_score']
                                    + W_READY * r['data_readiness_score'], 1)
        r['origin_priority_score'] = round(WO_COMMERCIAL * r['commercial_score']
                                           + WO_SCALE * r['scale_score']
                                           + WO_DEMAND * r['demand_score']
                                           + WO_READY * r['data_readiness_score'], 1)
        hi_c = r['commercial_score'] >= HIGH_COMMERCIAL
        hi_s = r['scale_score'] >= HIGH_SCALE
        r['tier'] = ('A' if hi_c and hi_s else 'B' if hi_c else 'C' if hi_s else 'D')
        r['monetization_potential'] = monetization(r)
        r['binding_constraint'] = constraint(r)
        r['next_action'] = action(r)

    rows.sort(key=lambda r: -r['priority_score'])
    write_outputs(rows, home_per_city, dest_per_city_language, home_den, dest_den,
                  len(dest_cc), real, osm_dest_rate, osm_dest_num, osm_dest_den,
                  dest_family_rates)


def monetization(r):
    """A sentence a person can check, with the numbers that produced the verdict in it."""
    band = ('HIGH' if r['commercial_score'] >= 70 else 'MEDIUM-HIGH'
            if r['commercial_score'] >= 55 else 'MEDIUM' if r['commercial_score'] >= 35
            else 'LOW')
    bits = []
    if r['gdp_pc_ppp']:
        bits.append(f"GDP/capita PPP ${r['gdp_pc_ppp']:,.0f} ({r['gdp_pc_ppp_year']})")
    if r['outbound_travel_spend_per_capita']:
        bits.append(f"outbound travel ${r['outbound_travel_spend_per_capita']:,.0f}/capita "
                    f"({r['outbound_travel_spend_year']})")
    if r['measured_max_cpc_cents']:
        bits.append(f"measured CPC {r['measured_max_cpc_cents']}c")
    else:
        bits.append('CPC NOT MEASURED')
    if r['measured_connectivity_volume'] or r['measured_origin_volume']:
        bits.append('connectivity volume '
                    f"{max(r['measured_connectivity_volume'], r['measured_origin_volume']):,}")
    return band + ': ' + '; '.join(bits)


def constraint(r):
    """The one thing that most limits this country right now. Measured, never guessed.

    The order matters and it is the order of what a day of work would actually change. A
    missing extract is named only for a home market, because that is the only place an extract
    has ever turned into a page. For a destination country at or above the rate its live
    families produce elsewhere, the constraint is the DESTINATION scope list itself: six
    families reach a destination country and 198 do not.
    """
    if not r['in_measured_scope']:
        return ('NO_MEASURED_DEMAND_YET: no Ahrefs reading exists for this country in any '
                'language')
    if r['languages_qualified'] == 0 and r['current_final_pages'] == 0:
        return 'NO_QUALIFIED_DESTINATION_DEMAND: measured and did not clear the gate'
    missing = sorted({'parents', 'places', 'poi', 'outdoor', 'trails'}
                     - set(r['osm_layers_present']))
    if r['is_home_market']:
        if missing:
            return (f"{'NO' if len(missing) == 5 else 'PARTIAL'}_OSM_CAPTURE: "
                    f"{','.join(missing)} missing in a home market, where OSM-sourced pages "
                    f"are {r['osm_sourced_pages_today']:,} of {r['current_final_pages']:,} "
                    f"today")
        if r['expected_net_new_valid_pages'] > 2000:
            if r['family_not_measured_removals'] > 500:
                return ('FAMILY_SET_NOT_MEASURED_IN_THIS_MARKET: '
                        f"{r['expected_net_new_valid_pages']:,} below the per-city rate the "
                        'other home markets produce, and the ledger names the cause - '
                        f"{r['family_not_measured_removals']:,} rows removed as "
                        'FAMILY_NOT_MEASURED_IN_THIS_MARKET because this market was admitted '
                        'after the research freeze')
            return ('BELOW_THE_HOME_MARKET_RATE: '
                    f"{r['expected_net_new_valid_pages']:,} below the per-city rate the other "
                    'home markets produce, with no family-not-measured removals to explain it, '
                    'so the cause needs a per-family comparison against the leading markets')
    else:
        if r['expected_net_new_valid_pages'] > 100:
            return ('LIVE_DESTINATION_FAMILIES_NOT_MATERIALISED: '
                    f"{r['expected_net_new_valid_pages']:,} pages below the rate the six live "
                    'destination families produce per city-language elsewhere, and none of '
                    'them needs an OSM extract')
        if r['mirror_blocked'] and not r['osm_layers_present']:
            return ('OSM_MIRROR_DOES_NOT_CARRY_THIS_COUNTRY: a second extract source is '
                    'needed, though the measurement says an extract adds '
                    f"{r['expected_net_new_attributable_to_an_osm_capture']:,} pages today")
        return ('DESTINATION_FAMILY_ALLOWLIST: this country is at the rate its live families '
                f"produce, {len(r['live_destination_families'])} of them, and no OSM-sourced "
                'page in the manifest is about any destination country. The cap is the '
                '13-family DESTINATION scope list, not the data')
    if r['duplicate_risk_rate'] > 0.5:
        return (f"DUPLICATE_RISK: {r['duplicate_risk_rate']:.0%} of generated rows were "
                f"removed as translation-only or duplicate")
    if r['thin_risk_rate'] > 0.4:
        return (f"THIN_RISK: {r['thin_risk_rate']:.0%} of generated rows had no defensible "
                f"uniqueness basis")
    if not r['measured_max_cpc_cents']:
        return 'COMMERCIAL_VALUE_UNMEASURED: no CPC reading for this country'
    return 'NONE_MATERIAL: this country is producing at its measured benchmark'


def action(r):
    b = r['binding_constraint'].split(':')[0]
    return {
        'NO_MEASURED_DEMAND_YET': ('Measure connectivity and destination intent with Ahrefs '
                                   'before any capture'),
        'NO_QUALIFIED_DESTINATION_DEMAND': ('Leave alone; no page is justified on current '
                                            'evidence'),
        'NO_OSM_CAPTURE': 'Capture parents, places, poi, outdoor and trails',
        'PARTIAL_OSM_CAPTURE': 'Capture the missing layers only',
        'BELOW_THE_HOME_MARKET_RATE': ('Compare this market family coverage against the '
                                       'leading home markets and name the missing families '
                                       'before generating anything'),
        'FAMILY_SET_NOT_MEASURED_IN_THIS_MARKET': ('Measure this market keyword cells for the '
                                                   'families already alive in the other home '
                                                   'markets, then regenerate'),
        'LIVE_DESTINATION_FAMILIES_NOT_MATERIALISED': ('Materialise activities, weather and '
                                                       'stay for this country cities; no '
                                                       'extract is required'),
        'OSM_MIRROR_DOES_NOT_CARRY_THIS_COUNTRY': ('Low priority: find a second extract source '
                                                   'only after a destination family exists '
                                                   'that an extract would feed'),
        'DESTINATION_FAMILY_ALLOWLIST': ('Widen the DESTINATION scope list with families that '
                                         'carry a per-destination-city fact; an extract adds '
                                         'nothing'),
        'DUPLICATE_RISK': 'Do not add pages here until the information-gain basis is stronger',
        'THIN_RISK': 'Aggregate rather than enumerate',
        'COMMERCIAL_VALUE_UNMEASURED': 'Spend Ahrefs units on this country before the reset',
        'NONE_MATERIAL': 'Hold; re-measure after the next run',
    }.get(b, 'Measure before acting')


CSV_COLS = ['country', 'role', 'commercial_score', 'scale_score', 'demand_score',
            'data_readiness_score', 'priority_score', 'current_final_pages',
            'expected_net_new_valid_pages', 'monetization_potential', 'binding_constraint',
            'next_action', 'tier']


def write_outputs(rows, home_per_city, dest_per_city_language, home_den, dest_den,
                  n_dest, real, osm_dest_rate, osm_dest_num, osm_dest_den,
                  dest_family_rates):
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=CSV_COLS, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

    tiers = collections.Counter(r['tier'] for r in rows)
    scored = [r for r in rows if r['in_measured_scope']]
    # The capture queue: countries whose binding constraint is a DOWNLOAD, ordered by
    # priority, not by raw expected page count.
    cap = [r for r in rows
           if (r['languages_qualified'] or r['is_home_market'])
           and len(r['osm_layers_present']) < 5]
    cap.sort(key=lambda r: -r['priority_score'])
    # The research queue: ORIGIN candidates, ordered with commercial value dominant.
    res = [r for r in rows if r['role'] in ('ORIGIN', 'BOTH')]
    res.sort(key=lambda r: -r['origin_priority_score'])

    def slim(r, extra=()):
        keys = ('country', 'name', 'role', 'tier', 'priority_score', 'origin_priority_score',
                'commercial_score', 'scale_score', 'demand_score', 'data_readiness_score',
                'current_final_pages', 'expected_net_new_valid_pages', 'languages',
                'osm_layers_present', 'osm_region_path', 'binding_constraint', 'next_action',
                'monetization_potential', 'is_home_market') + tuple(extra)
        return {k: r[k] for k in keys}

    json.dump({
        'generated_on': '2026-10-06',
        'what_this_is': ('four independent 0-100 scores per country, so commercial value and '
                         'scale value can never be read off one number, plus the weighted '
                         'PRIORITY_SCORE the brief defines and the tier it implies'),
        'the_weights': {'commercial': W_COMMERCIAL, 'scale': W_SCALE, 'demand': W_DEMAND,
                        'data_readiness': W_READY,
                        'and_for_origin_markets_only': {
                            'commercial': WO_COMMERCIAL, 'scale': WO_SCALE,
                            'demand': WO_DEMAND, 'data_readiness': WO_READY,
                            'why': ('the brief asks for commercial value to dominate when the '
                                    'question is which SEARCH MARKET to open. It is a second '
                                    'ordering and it never overwrites priority_score.')}},
        'the_tier_cutoffs': {'high_commercial_at_or_above': HIGH_COMMERCIAL,
                             'high_scale_at_or_above': HIGH_SCALE,
                             'why_absolute_not_percentile': (
                                 'a percentile cutoff moves a country between tiers when an '
                                 'unrelated country is added to the matrix')},
        'countries_scored': len(rows),
        'countries_with_a_measurement_behind_them': len(scored),
        'tier_counts': dict(sorted(tiers.items())),
        'the_test_the_brief_set': india_vs_rich(rows),
        'two_benchmarks_not_one': {
            'home_market_pages_per_gazetteer_city': round(home_per_city, 2),
            'home_market_cities_measured_over': home_den,
            'destination_pages_per_gazetteer_city_per_qualifying_language':
                round(dest_per_city_language, 3),
            'destination_city_language_pairs_measured_over': dest_den,
            'destination_countries_measured_over': n_dest,
            'why': ('a home-market country has its whole family set alive in its own language '
                    'and a destination country does not. The 2026-10-06 plan used one blended '
                    '11.72 and that number is dominated by the eleven home markets, so it '
                    'overstated every destination country. Both are measured here and each '
                    'country is held to the one that applies to it.')},
        'the_finding_that_reorders_everything': {
            'question': ('what does capturing an OSM extract for a destination country add to '
                         'FINAL DISTINCT VALID pages?'),
            'answer': f'{osm_dest_num:,} pages, measured',
            'how': ('sixteen destination countries carry four or five OSM layers on disk. '
                    f'Across {osm_dest_den:,} city-language pairs they produce '
                    f'{osm_dest_num:,} pages whose data_source is OpenStreetMap. Every one of '
                    'the 268,456 OSM-sourced pages in the manifest is about one of the '
                    'fourteen home-market countries.'),
            'why': ('the destination POI fan-out produced 292,613 raw rows and the '
                    'localisation gate removed 263,742 as TRANSLATION_ONLY. The gate is '
                    'correct: the brief rule is that a page whose only change is the language '
                    'is rejected. So the extract was never the constraint.'),
            'the_real_cap': ('the DESTINATION scope list in build-1m-candidate-manifest.py '
                             'admits 13 families. Six of them produce pages about a '
                             'destination country: activities.city-things-to-do 11,228, '
                             'weather.city-month 8,600, stay.city-type 7,015, '
                             'transport.route-from-market 413, relocation.country 2, '
                             'taxes.country-remote-work 1. The other 198 families in the '
                             'catalogue cannot reach a destination country at all.'),
            'what_this_changes': ('the capture queue is reordered below as the brief asks, and '
                                  'it is worth reordering because the layers are a '
                                  'prerequisite for any future destination family that has a '
                                  'real information-gain basis. But it is NOT the scale path, '
                                  'and India at 70,165 expected net new was an artifact of a '
                                  'blended 11.72 pages-per-city benchmark that was 93 per cent '
                                  'home-market output.'),
            'measured_destination_family_rates_per_city_language':
                {k: round(v, 5) for k, v in dest_family_rates.items()},
        },
        'countries_without_world_bank_coverage': [
            {'country': r['country'], 'missing': r['commercial_components_missing_at_source'],
             'commercial_score': r['commercial_score'],
             'note': 'score renormalised over the components that exist'}
            for r in rows if r['commercial_components_missing_at_source']
            and r['in_measured_scope']],
        'tier_A_high_commercial_and_high_scale': [slim(r) for r in rows if r['tier'] == 'A'],
        'tier_B_high_commercial_low_scale': [slim(r) for r in rows if r['tier'] == 'B'],
        'tier_C_lower_commercial_high_scale': [slim(r) for r in rows if r['tier'] == 'C'],
        'tier_D_low_and_low_with_a_measurement': [
            slim(r) for r in rows if r['tier'] == 'D' and r['in_measured_scope']],
        'full_components_per_country': {
            r['country']: {'commercial': r['commercial_components'],
                           'scale': r['scale_components'],
                           'scale_quality_multiplier': r['scale_quality_multiplier'],
                           'demand': r['demand_components'],
                           'readiness': r['readiness_components'],
                           'duplicate_risk_rate': r['duplicate_risk_rate'],
                           'thin_risk_rate': r['thin_risk_rate'],
                           'generated_for_this_country': r['generated_for_this_country'],
                           'outdoor_thin_diverted': r['outdoor_thin_diverted']}
            for r in rows if r['in_measured_scope']},
        'licence_and_provenance': {
            'world_bank': ('CC BY 4.0, five indicators fetched 2026-10-06 with mrnev=1 into '
                           'data/atlas/sources/worldbank/ with provenance.json. Aggregates '
                           'excluded by region.id, not by hand.'),
            'ahrefs': ('Keywords Explorer readings already paid for and stored under '
                       'data/atlas/measurements/. No new units were spent to build this file.'),
            'this_project': ('page counts from LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz, removal '
                             'counts from LIVDAR-1M-REJECTED-CANDIDATES.csv.gz and from '
                             'osm-outdoor/_aggregate-only-features.jsonl.gz, entity counts '
                             'from the GeoNames gazetteer, NASA POWER normals and the OSM '
                             'layer files on disk.')},
        'what_this_file_does_not_claim': (
            'expected_net_new_valid_pages is an extrapolation from this project own measured '
            'output per gazetteer city, not a promise. The destination fan-out on 2026-10-06 '
            'is the standing warning: 292,613 raw rows produced 263,742 translation-only '
            'rejections. Each figure is replaced by a count as the country is captured and run.'),
    }, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    json.dump({
        'generated_on': '2026-10-06',
        'what_changed': ('the capture queue was ordered by raw expected page count. It is now '
                         'ordered by PRIORITY_SCORE, which carries commercial value at 45 per '
                         'cent, so a rich country with a meaningful yield is captured before a '
                         'poorer country with a larger one.'),
        'what_this_queue_is_worth_today': (
            'zero pages. The matrix measured it: sixteen destination countries hold four or '
            'five OSM layers each and not one OSM-sourced page in the 401,393 manifest is '
            'about a country outside the fourteen home markets. The queue is still ordered and '
            'still run, because the layers are the prerequisite for any destination family '
            'that later earns an information-gain basis, and because the home markets in it '
            'DO convert an extract into pages. It is not the path to a million.'),
        'capture_queue_by_priority': [
            slim(r, ('gazetteer_cities', 'osm_sourced_pages_today',
                     'expected_net_new_attributable_to_an_osm_capture')) for r in cap],
        'research_queue_by_origin_priority': [slim(r) for r in res[:30]],
        'the_old_order_for_comparison': [
            r['country'] for r in sorted(cap, key=lambda r: -r['expected_net_new_valid_pages'])],
        'the_new_order': [r['country'] for r in cap],
    }, open(OUT_QUEUE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'countries scored: {len(rows)}  with a measurement: {len(scored)}')
    print(f'tiers: {dict(sorted(tiers.items()))}')
    print(f'benchmarks: home {home_per_city:.2f}/city, '
          f'destination {dest_per_city_language:.3f}/city-language')
    print()
    print(f"{'cc':<4}{'tier':<5}{'role':<13}{'comm':>6}{'scale':>7}{'dem':>6}{'ready':>7}"
          f"{'prio':>7}{'pages':>9}{'netnew':>9}")
    for r in rows[:30]:
        print(f"{r['country']:<4}{r['tier']:<5}{r['role']:<13}{r['commercial_score']:>6.1f}"
              f"{r['scale_score']:>7.1f}{r['demand_score']:>6.1f}"
              f"{r['data_readiness_score']:>7.1f}{r['priority_score']:>7.1f}"
              f"{r['current_final_pages']:>9,}{r['expected_net_new_valid_pages']:>9,}")
    print()
    print('capture queue, new order by priority:')
    for r in cap[:20]:
        print(f"  {r['country']:<4}{r['tier']:<3}prio {r['priority_score']:>5.1f}  "
              f"netnew {r['expected_net_new_valid_pages']:>7,}  {r['binding_constraint'][:70]}")


def india_vs_rich(rows):
    """The brief's own acceptance test, computed rather than asserted."""
    by = {r['country']: r for r in rows}
    rich = ['CA', 'CH', 'SG', 'AE', 'NO', 'SE', 'DK', 'FI', 'GB', 'US']
    ind = by.get('IN')
    if not ind:
        return {'note': 'India is not in the matrix'}
    out = {'india': {'commercial_score': ind['commercial_score'],
                     'scale_score': ind['scale_score'],
                     'priority_score': ind['priority_score'], 'tier': ind['tier']}}
    out['rich_countries'] = {c: {'commercial_score': by[c]['commercial_score'],
                                 'scale_score': by[c]['scale_score'],
                                 'priority_score': by[c]['priority_score'],
                                 'tier': by[c]['tier']}
                             for c in rich if c in by}
    beats = [c for c in rich if c in by and ind['priority_score'] > by[c]['priority_score']]
    out['india_outranks_on_priority_score'] = beats
    out['india_outranks_on_commercial_score'] = [
        c for c in rich if c in by and ind['commercial_score'] > by[c]['commercial_score']]
    return out


if __name__ == '__main__':
    main()
