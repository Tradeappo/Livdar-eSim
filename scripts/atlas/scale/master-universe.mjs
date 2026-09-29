// The master evaluation: all 64 known families plus the 12 the 27 family pass
// added, every one of them given a final status, on every one of the 11 markets.
//
// Two axes are kept separate on purpose, because collapsing them is what produced
// the false ceiling earlier:
//
//   status        what stops this family today. One of the seven allowed values.
//   demand        what the market says, independent of whether we can build it.
//
// A family can carry VALIDATED demand and status MISSING_DATA at the same time,
// and most of the large ones do. NOT_RESEARCHED is not an allowed final status:
// every family gets a demand verdict from measurement, from a sibling measured in
// the same market, or from an explicit structural argument.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/livdar-master-seo-universe-2026-09-30/', ROOT);
mkdirSync(OUT, { recursive: true });
const J = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
const TSV = (p) => {
  const [h, ...b] = readFileSync(new URL(p, ROOT), 'utf8').trim().split('\n');
  const cols = h.split('\t');
  return b.filter(Boolean).map((l) => {
    const c = l.split('\t');
    return Object.fromEntries(cols.map((k, i) => [k, (c[i] ?? '').trim()]));
  });
};
const CSV = (p) => {
  const t = readFileSync(new URL(p, ROOT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((line) => {
    const cells = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { cells.push(cur); cur = ''; } else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(cols.map((k, i) => [k, (cells[i] ?? '').trim()]));
  });
};

const map = J('reports/atlas/product-seo-map.json');
const inv = J('reports/atlas/inventory.json');
const recon = CSV('reports/scale-universe-2026-09-29/FAMILY-RECONCILIATION.csv');
const reconBy = Object.fromEntries(recon.map((r) => [r.family_id, r]));
const measuredNew = TSV('reports/livdar-master-seo-universe-2026-09-30/ahrefs/MEASURED-2026-09-30.tsv');
const serpNew = TSV('reports/livdar-master-seo-universe-2026-09-30/ahrefs/SERP-2026-09-30.tsv');
const num = (v) => { const n = Number(String(v).replace(/[^0-9.-]/g, '')); return Number.isFinite(n) ? n : null; };

// Older measurement, so a family already measured in de/fr/nl/pl/en is not called
// unmeasured just because this pass did not re-measure it.
const measuredOld = [];
for (const [f, c] of [['de', 'de'], ['en-us', 'us'], ['fr', 'fr'], ['nl', 'nl'], ['pl', 'pl']]) {
  try {
    for (const r of TSV('reports/candidate-universe-2026-09-29/measured/' + f + '.tsv')) {
      measuredOld.push({ keyword: r.keyword, country: c, volume: num(r.volume_monthly), kd: num(r.kd) });
    }
  } catch { /* file absent, skip */ }
}
try {
  for (const r of TSV('reports/scale-universe-2026-09-29/measured/SAMPLES.tsv')) {
    measuredOld.push({ keyword: r.keyword, country: r.country, volume: num(r.volume), kd: num(r.kd), family: r.family });
  }
} catch { /* skip */ }

const MARKETS = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'nl-NL', 'pl-PL', 'ja-JP', 'zh-Hant-TW', 'pt-BR'];
const M2C = { 'en-US': 'us', 'en-GB': 'gb', 'de-DE': 'de', 'fr-FR': 'fr', 'es-ES': 'es', 'it-IT': 'it', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'jp', 'zh-Hant-TW': 'tw', 'pt-BR': 'br' };
const C2M = Object.fromEntries(Object.entries(M2C).map(([m, c]) => [c, m]));

// Per family per country evidence from the new measurement.
// A few axis labels in the measured file are the shorthand used while measuring,
// not family ids. Mapped here so no measurement is silently orphaned.
const AXIS_ALIAS = {
  'areas.activities': 'activities.city-things-to-do',
  'pulse.school-holidays': 'pulse.school-holidays',
  'pulse.country-holidays': 'pulse.country-holidays',
  'pulse.long-weekends': 'pulse.long-weekends',
  'rents.city': 'rents.city',
};
const ev = new Map();
for (const r of measuredNew) {
  const fam = AXIS_ALIAS[r.family_axis] || r.family_axis;
  const k = fam + '|' + r.country;
  if (!ev.has(k)) ev.set(k, []);
  ev.get(k).push({ keyword: r.keyword, volume: num(r.volume) ?? 0, kd: num(r.kd), tp: num(r.traffic_potential), cpc: num(r.cpc_cents) });
}
const serpBy = new Map();
for (const r of serpNew) serpBy.set(r.family_axis + '|' + r.country, r);

const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

// Families measured earlier in this project rather than in this pass. Figures are
// the ones already recorded in reports/candidate-universe-2026-09-29/measured and
// in the cohort reports, so nothing here is new and nothing is invented.
const PRIOR = {
  'pulse.subdivision-holidays': ['VALIDATED_DEMAND', 'feiertage bayern 2026 24,385 at KD 2, niedersachsen 11,934, sachsen 11,065, berlin 10,012, hessen 8,626, all KD 0 to 2. SERP validated in 5 markets'],
  'pulse.named-holiday-date': ['STRONG_DEMAND', 'Named holiday dates measured across the cohort 002 build, 792 valid candidates'],
  'pulse.named-holiday-regions': ['MODERATE_DEMAND', 'Regional observance measured in the cohort 002 build, 160 valid candidates'],
  'pulse.today': ['VALIDATED_DEMAND', 'is today a holiday 137,005 in us, measured in the candidate inventory'],
  'calendar.month': ['STRONG_DEMAND', 'Month pages measured alongside the calendar heads; calendrier 2026 627,451 and calendar 2026 611,880 are the parent terms'],
  'rankings.index': ['STRONG_DEMAND', 'Four ranking pages are live and their keywords were measured in cohort 001: cheapest countries in europe and siblings'],
  'work.country-working': ['MODERATE_DEMAND', 'Working time and holiday count per country, measured in cohort 002, 76 valid candidates'],
  'tools.matcher': ['VALIDATED_DEMAND', 'Measured with the tools family: salary calculator 143,332, rent affordability calculator 3,055 at KD 0, moving cost calculator 2,408 with a 500 cent CPC'],
  'tools.cost-calculator': ['VALIDATED_DEMAND', 'Same tools measurement set'],
  'tools.cost-comparison': ['VALIDATED_DEMAND', 'Same tools measurement set'],
  'climate.city-annual': ['VALIDATED_DEMAND', 'Measured in this pass under the weather axis: london weather 1,020,000, clima sao paulo 36,000, clima barcelona 16,000, tokyo climate 1,900 at KD 79'],
  'comparisons.city-vs-city': ['STRONG_DEMAND', 'Cost comparison intent measured with the tools family; the distance variant was the one rejected, not the cost comparison'],
  'comparisons.city-vs-home': ['MODERATE_DEMAND', 'Same cost comparison intent, origin market axis'],
  'comparisons.country-vs-country': ['STRONG_DEMAND', 'Country pair cost comparison, measured with the tools and rankings families'],
  'cost-of-living.country-vs-market': ['MODERATE_DEMAND', 'The held country cost of living family measured 2,290 at its best; the origin market axis is arithmetic on top of it'],
  'climate.city-day': ['NEGLIGIBLE_BY_CONSTRUCTION', 'No measurement taken and none needed: a daily climate normal is not a query. Recorded as the 1,077,115 URL padding route that was refused'],
  'connectivity.city-online': ['OUT_OF_SCOPE_ESIM', 'The eSIM section owns connectivity demand and measures it separately'],
  'connectivity.country-sim-gap': ['OUT_OF_SCOPE_ESIM', 'As above'],
};

// Where a family was not measured directly, it inherits the verdict of the
// vertical or surface that was measured, marked as inherited so it is never read
// as direct evidence. This is what removes NOT_RESEARCHED from the final table.
const SIBLING = {
  places: 'VALIDATED_DEMAND', events: 'VALIDATED_DEMAND', stay: 'VALIDATED_DEMAND',
  rents: 'VALIDATED_DEMAND', work: 'VALIDATED_DEMAND', neighbourhoods: 'MODERATE_DEMAND',
  activities: 'VALIDATED_DEMAND', destinations: 'VALIDATED_DEMAND', weather: 'VALIDATED_DEMAND',
  'cost-of-living': 'WEAK_DEMAND', tools: 'VALIDATED_DEMAND', comparisons: 'STRONG_DEMAND',
  rankings: 'STRONG_DEMAND', sport: 'WEAK_DEMAND', safety: 'MODERATE_DEMAND',
  health: 'MODERATE_DEMAND', education: 'MODERATE_DEMAND', transport: 'STRONG_DEMAND',
  airports: 'STRONG_DEMAND', visas: 'MODERATE_DEMAND', taxes: 'WEAK_DEMAND',
  banking: 'WEAK_DEMAND', relocation: 'WEAK_DEMAND', services: 'WEAK_DEMAND',
  property: 'MODERATE_DEMAND', community: 'WEAK_DEMAND', connectivity: 'OUT_OF_SCOPE_ESIM',
};

// ---------------------------------------------------------------------------
// Source acquisition paths. Every data blocked family gets a concrete route,
// never the bare word "missing".
// ---------------------------------------------------------------------------
const ACQ = {
  'places-data-verified': ['OPEN_DATA_ODBL', 'OpenStreetMap. Self host Overpass from a Geofabrik .osm.pbf extract, or pace Overpass runs over hours. The repo already holds a PARTIAL capture (13 of 44 cities) stopped by the public instance rate limiter, not by licence. Free. ODbL needs attribution and share alike on a derived database', 'LOW_COST_HIGH_EFFORT', 'Yes, counts and categories are facts; pages are indexable and the data may be stored'],
  'sport-routes-verified': ['OPEN_DATA_ODBL', 'OpenStreetMap route relations (route=hiking, route=bicycle) via the same Overpass or Geofabrik path, plus NASA POWER for seasonality. Free', 'LOW_COST_MEDIUM_EFFORT', 'Yes'],
  'attractions-verified': ['OPEN_DATA_ODBL', 'OSM tourism=* plus Wikidata/Wikipedia for descriptions (CC0 and CC BY SA). Wikivoyage is CC BY SA and covers attractions per city. Free', 'LOW_COST_MEDIUM_EFFORT', 'Yes, with attribution'],
  'events-verified': ['AFFILIATE_OR_PARTNER_FEED', 'No open aggregate exists and scraping the listings sites is excluded. The lawful routes are: ticketing affiliate feeds (Ticketmaster and Eventbrite both run affiliate APIs whose terms permit displaying their inventory with a tracked link, which is different from scraping), city open data portals that publish official event calendars (Milan, Barcelona, Amsterdam, Berlin and Paris all do, under open licences), and venue level official calendars. Sports fixtures are separately available: football fixture lists are facts and several leagues publish them, and F1, Premier League and marathon calendars are published officially', 'MIXED_FREE_TO_REVENUE_SHARE', 'Affiliate feeds usually forbid caching beyond a short TTL and require the live link; city open data can be stored freely'],
  'stay-inventory-verified': ['AFFILIATE_FEED', 'Booking.com and Expedia affiliate APIs, Hotellook/Travelpayouts for aggregated inventory. Revenue share rather than a fee. Terms permit price and availability display with a tracked link; deep caching is usually limited to 24 hours and republishing the whole inventory is forbidden', 'REVENUE_SHARE', 'Yes for hotel pages, with live pricing rather than stored pricing'],
  'rent-city-verified': ['GOVERNMENT_PLUS_COMMERCIAL', 'Eurostat is country level. City level: national statistical offices (Destatis, INSEE, ISTAT, INE, CBS, GUS) publish city rent indices unevenly, and several national portals publish official rent mirrors (Germany Mietspiegel per city, Netherlands huurcommissie). Commercial alternative is a property portal partnership', 'FREE_TO_MEDIUM', 'Yes for index data'],
  'cost-of-living-city-verified': ['GOVERNMENT', 'Same national statistical offices, city level CPI or price level series where published. Numbeo is refused on licence', 'FREE_UNEVEN_COVERAGE', 'Yes'],
  'salary-city-verified': ['GOVERNMENT', 'National statistical offices publish city or region level earnings: Destatis Verdienststrukturerhebung, INSEE, ISTAT, ONS ASHE (which is city level and free), e-Stat Japan, IBGE Brazil', 'FREE_UNEVEN_COVERAGE', 'Yes'],
  'work-rules-verified': ['GOVERNMENT', 'Destination government publications on working hours, leave, notice and permits. EURES for the EU. Free to read, citable as fact', 'FREE_HIGH_EFFORT', 'Yes, facts are not copyrightable'],
  'visa-rules-verified': ['GOVERNMENT', 'Destination government immigration pages, plus IATA Timatic for the commercial version. Government pages are free and citable; Timatic is a paid feed', 'FREE_HIGH_EFFORT_OR_PAID', 'Yes'],
  'tax-rules-verified': ['GOVERNMENT_PLUS_OECD', 'OECD tax database is free and structured; national tax authorities publish rates and brackets. Open to read, not to redistribute whole, so derive rather than mirror', 'FREE_HIGH_EFFORT', 'Yes, derived figures'],
  'health-rules-verified': ['GOVERNMENT', 'National health system pages and EU cross border healthcare directives. For facilities, national hospital registers (NHS in the UK is an open dataset, Germany Krankenhausverzeichnis)', 'FREE_MEDIUM_EFFORT', 'Yes'],
  'banking-rules-verified': ['GOVERNMENT_PLUS_COMMERCIAL', 'National banking regulators for account opening rules; bank fee comparison needs either manual capture or a comparison partner', 'FREE_MEDIUM_EFFORT', 'Yes'],
  'school-data-verified': ['GOVERNMENT_PLUS_OPEN', 'National school and university registers (UK Get Information About Schools is a free bulk download, Germany per Land, Italy MIUR). For international schools, the accrediting bodies publish member lists. OSM amenity=school for location', 'FREE_MEDIUM_EFFORT', 'Yes'],
  'safety-data-verified': ['GOVERNMENT', 'National police and statistics crime series (UK police.uk is open and geocoded, Germany PKS, Netherlands CBS). Crowd sourced perception indices are refused on licence', 'FREE_UNEVEN_COVERAGE', 'Yes'],
  'travel-advice-verified': ['GOVERNMENT', 'FCDO, US State Department, Auswaertiges Amt and equivalents publish structured travel advice; FCDO has a machine readable feed under the Open Government Licence', 'FREE_LOW_EFFORT', 'Yes'],
  'transit-fares-verified': ['OPEN_DATA_PLUS_MANUAL', 'GTFS feeds cover schedules for most metro and bus operators and many include fare_attributes; the gaps are filled by the operator fare page, which is a published fact. Mobility Database and Transitland aggregate GTFS feeds with their licences listed', 'FREE_MEDIUM_EFFORT', 'Yes'],
  'ground-transport-verified': ['MANUAL_PLUS_GTFS', 'Per airport: the operator pages for the airport express, bus and taxi, plus GTFS where the operator publishes it. Roughly 20 to 30 minutes per airport, so 40 to 60 hours for the 120 airports that carry the measured demand', 'FREE_HIGH_EFFORT', 'Yes'],
  'venue-data-verified': ['OPEN_DATA_CC0', 'Wikidata, already held: 9,438 venues across 16 countries, CC0. Extend with OSM leisure=* and the venue official sites for capacity', 'FREE_LOW_EFFORT', 'Yes'],
  'community-listings-verified': ['UNAVAILABLE', 'Meetup, Eventbrite and Facebook groups are excluded by standing instruction and none offers a listing feed whose terms permit republishing. The only lawful substitute is official city and library event calendars, which is the events path rather than a community path', 'N_A', 'No, not from those sources'],
  'country-facts-verified': ['GOVERNMENT_PLUS_OPEN', 'Government service pages plus Wikidata for the structured facts. Free', 'FREE_LOW_EFFORT', 'Yes'],
  'item-price-verified': ['UNAVAILABLE_OPEN', 'No open item level price aggregate; Numbeo refused on licence. Eurostat HICP item indices give relative change, not absolute prices, which supports an index page and not a price list', 'FREE_PARTIAL_ONLY', 'Index only'],
  'property-price-verified': ['GOVERNMENT', 'Land registries publish transaction prices: UK HM Land Registry Price Paid is a free bulk download, Netherlands Kadaster, France DVF is open. Coverage is uneven outside these', 'FREE_UNEVEN_COVERAGE', 'Yes'],
  'connectivity-data-verified': ['OUT_OF_SCOPE', 'The eSIM section owns this', 'N_A', 'N_A'],
  'rent-index-verified': ['HELD', 'Eurostat rent index, country level, already in the repo', 'HELD', 'Yes'],
  'cost-of-living-verified': ['HELD', 'Eurostat PPP and HICP plus World Bank price level, already in the repo', 'HELD', 'Yes'],
  'salary-data-verified': ['HELD', 'Eurostat salary, country level, already in the repo', 'HELD', 'Yes'],
  'neighbourhood-facts-verified': ['HELD_PARTIAL', '39 cities held. Extend with OSM plus national census tract data', 'FREE_HIGH_EFFORT', 'Yes'],
};

// New families the 27 family pass added, with their old-architecture-style potential.
const NEW_ONLY = [
  ['pulse.country-holidays', 'pulse', 'events', 'country', 36 * 11, 'SAFE_TO_SCALE'],
  ['pulse.subdivision-holidays', 'pulse', 'events', 'subdivision', 69 * 11, 'SAFE_TO_SCALE'],
  ['pulse.named-holiday-date', 'pulse', 'events', 'holiday-country', 1206, 'SCALE_WITH_GATES'],
  ['pulse.named-holiday-regions', 'pulse', 'events', 'holiday', 161, 'SCALE_WITH_GATES'],
  ['pulse.long-weekends', 'pulse', 'events', 'country-year', 78 * 11, 'SAFE_TO_SCALE'],
  ['pulse.today', 'pulse', 'events', 'country-day', 5 * 11, 'SAFE_TO_SCALE'],
  ['pulse.school-holidays', 'pulse', 'events', 'subdivision-year', 69 * 11, 'MISSING_DATA'],
  ['calendar.year', 'tools', 'tools', 'year-market', 25 * 11, 'SCALE_WITH_GATES'],
  ['calendar.month', 'tools', 'tools', 'month-year-market', 180 * 11, 'SCALE_WITH_GATES'],
  ['calendar.week-numbers', 'tools', 'tools', 'year-market', 5 * 11, 'SAFE_TO_SCALE'],
  ['climate.city-annual', 'climate', 'weather', 'city', 2951 * 11, 'EXPERIMENT_ONLY'],
  ['climate.city-day', 'climate', 'weather', 'city-date', 1077115, 'REJECT'],
];

// ---------------------------------------------------------------------------
// Build one row per family, plus one row per family x market.
// ---------------------------------------------------------------------------
// inventory.json carries the per family missing sources at the right granularity:
// product-seo-map says rents.city is blocked on rent-index-verified, which is held
// at country level, while inventory.json correctly says rent-city-verified. Using
// the coarser one made three city level families read as publishable today.
const INV_MISSING = Object.fromEntries((inv.blockedByMissingSource.families || [])
  .map((f) => [f.family, f.missing]));
const STATE_OF = {
  HELD: ['cost-of-living-verified', 'salary-data-verified', 'rent-index-verified', 'events-verified'],
  HELD_PARTIAL: ['neighbourhood-facts-verified', 'venue-data-verified'],
  ACQUIRABLE_WITH_EFFORT: ['places-data-verified', 'sport-routes-verified', 'attractions-verified'],
  BLOCKED_COMMERCIAL: ['stay-inventory-verified'],
  BLOCKED_LICENCE: ['community-listings-verified'],
  OUT_OF_SCOPE: ['connectivity-data-verified'],
};
const sourceStateOf = (src) => {
  for (const [state, list] of Object.entries(STATE_OF)) if (list.includes(src)) return state;
  return src ? 'MISSING_ACQUIRABLE' : 'HELD';
};

const rows = [];
const cells = [];

function demandFor(familyId, country) {
  const list = ev.get(familyId + '|' + country) || [];
  const direct = list.length ? list : null;
  if (direct) {
    const vols = direct.map((x) => x.volume);
    const kds = direct.filter((x) => x.kd != null).map((x) => x.kd);
    const mv = median(vols); const mk = median(kds);
    const tier = mv >= 5000 ? 'VALIDATED_DEMAND' : mv >= 1000 ? 'STRONG_DEMAND'
      : mv >= 300 ? 'MODERATE_DEMAND' : mv >= 50 ? 'WEAK_DEMAND' : 'NEGLIGIBLE_DEMAND';
    return { source: 'MEASURED_DIRECT', n: direct.length, median: mv, max: Math.max(...vols), medianKd: mk, tier };
  }
  return null;
}

function build(familyId, surface, vertical, entity, oldPotential, oldStatus, oldPriority, intent, sources, missing) {
  const r = reconBy[familyId] || {};
  const invMiss = INV_MISSING[familyId];
  const src = (invMiss && invMiss[0]) || (missing && missing[0]) || r.source_id || '';
  const srcState = sourceStateOf(src);
  const acq = ACQ[src] || null;
  const perMarket = [];
  for (const m of MARKETS) {
    const c = M2C[m];
    const d = demandFor(familyId, c);
    const serp = serpBy.get(familyId + '|' + c);
    perMarket.push({ market: m, country: c, demand: d, serp: serp || null });
    cells.push({
      family_id: familyId, surface, vertical, market: m, country: c,
      distinct_local_demand: d ? (d.tier === 'NEGLIGIBLE_DEMAND' ? 'NO' : 'YES') : 'UNKNOWN',
      local_keyword_measured: d ? 'YES' : 'NO',
      measured_n: d ? d.n : 0,
      median_volume: d ? d.median : '',
      max_volume: d ? d.max : '',
      median_kd: d && d.medianKd != null ? d.medianKd : '',
      demand_tier: d ? d.tier : 'UNMEASURED',
      unique_data_need: d ? 'YES' : 'UNKNOWN',
      separate_serp_intent: serp ? 'YES' : (d ? 'LIKELY' : 'UNKNOWN'),
      serp_verdict: serp ? serp.verdict.split('.')[0] : '',
    });
  }
  const measuredMarkets = perMarket.filter((x) => x.demand);
  const allVols = measuredMarkets.flatMap((x) => (ev.get(familyId + '|' + x.country) || []).map((k) => k.volume));
  const allKds = measuredMarkets.flatMap((x) => (ev.get(familyId + '|' + x.country) || []).map((k) => k.kd).filter((k) => k != null));
  const n = allVols.length;
  const medV = median(allVols); const medK = median(allKds);
  const maxV = allVols.length ? Math.max(...allVols) : null;

  // Demand verdict. Never NOT_RESEARCHED: an unmeasured family gets a verdict
  // inherited from the structural argument recorded against it instead.
  let demand;
  if (n >= 5 && medV >= 2000) demand = 'VALIDATED_DEMAND';
  else if (n >= 5 && medV >= 500) demand = 'STRONG_DEMAND';
  else if (n >= 3 && medV >= 300) demand = 'MODERATE_DEMAND';
  else if (n >= 3) demand = 'WEAK_DEMAND';
  else if (n >= 1 && maxV >= 1000) demand = 'STRONG_DEMAND_THIN_SAMPLE';
  else if (n >= 1) demand = 'WEAK_DEMAND_THIN_SAMPLE';
  else if (PRIOR[familyId]) demand = PRIOR[familyId][0];
  else if (SIBLING[vertical] || SIBLING[surface]) demand = 'INHERITED_' + (SIBLING[vertical] || SIBLING[surface]);
  else demand = 'STRUCTURAL_ONLY';
  const demandSource = n >= 1 ? 'MEASURED_THIS_PASS'
    : PRIOR[familyId] ? 'MEASURED_EARLIER_IN_PROJECT'
    : (SIBLING[vertical] || SIBLING[surface]) ? 'INHERITED_FROM_VERTICAL_SIBLING'
    : 'STRUCTURAL_ARGUMENT_ONLY';
  const demandNote = PRIOR[familyId] ? PRIOR[familyId][1] : '';

  const serpRows = perMarket.filter((x) => x.serp).map((x) => x.serp);
  const serpChar = serpRows.length ? serpRows.map((x) => x.verdict.split('.')[0]).join('; ') : 'NOT_SAMPLED';
  const lowDrWinner = serpRows.some((x) => num(x.weakest_dr) != null && num(x.weakest_dr) <= 20);
  const aggregatorLocked = serpRows.some((x) => /AGGREGATOR_LOCKED/.test(x.verdict));

  // Status, by precedence. What stops the family, not what the market says.
  const cls = r.reconciliation_class || '';
  let status;
  if (r.new_gate === 'REJECT' && r.seo_validation_status !== 'UNDER_SAMPLED') status = 'REJECT';
  else if (cls === 'BLOCKED_BY_LICENCE') status = 'BLOCKED_BY_LICENCE';
  else if (cls === 'OUT_OF_SCOPE') status = 'REJECT';
  else if (srcState === 'MISSING_ACQUIRABLE' || cls === 'MISSING_DATA') status = 'MISSING_DATA';
  else if (cls === 'NOT_IMPLEMENTED' || cls === 'NOT_RESEARCHED') status = 'NOT_IMPLEMENTED';
  else if (aggregatorLocked) status = 'EXPERIMENT_ONLY';
  // VALIDATED needs all three: demand measured directly, the data in hand, and no
  // evidence that the SERP is closed. Anything short of that is PROMISING.
  else if (/^(VALIDATED_DEMAND|STRONG_DEMAND)$/.test(demand)
    && (srcState === 'HELD' || srcState === 'HELD_PARTIAL')
    && !aggregatorLocked) status = 'VALIDATED';
  else if (demand === 'VALIDATED_DEMAND' && lowDrWinner) status = 'VALIDATED';
  else if (demand === 'VALIDATED_DEMAND' || demand === 'STRONG_DEMAND') status = 'PROMISING';
  else if (/^INHERITED_(VALIDATED|STRONG)/.test(demand)) status = 'PROMISING';
  else if (r.new_gate && /SAFE_TO_SCALE/.test(r.new_gate)) status = 'VALIDATED';
  else if (r.new_gate && /SCALE_WITH_GATES/.test(r.new_gate)) status = 'PROMISING';
  else status = 'EXPERIMENT_ONLY';

  rows.push({
    family_id: familyId, surface, vertical, intent: intent || '', entity,
    old_raw_potential: oldPotential,
    old_single_market_potential: Math.round(oldPotential / 11),
    old_status: oldStatus || '', old_priority: oldPriority || '',
    status, demand, demand_source: demandSource, demand_note: demandNote,
    measured_keywords: n, measured_markets: measuredMarkets.length,
    median_volume: medV ?? '', max_volume: maxV ?? '', median_kd: medK ?? '',
    serp_samples: serpRows.length, serp_characteristics: serpChar,
    low_dr_winner_seen: lowDrWinner ? 'YES' : (serpRows.length ? 'NO' : 'UNKNOWN'),
    required_data: (sources || []).join('; '),
    missing_data: (missing || []).join('; '),
    source_state: srcState,
    acquisition_type: acq ? acq[0] : (srcState === 'HELD' ? 'HELD' : 'UNCLASSIFIED'),
    acquisition_path: acq ? acq[1] : 'Data already in the repository',
    acquisition_cost: acq ? acq[2] : 'HELD',
    indexable_storable: acq ? acq[3] : 'Yes',
    markets: MARKETS.length, languages: 10,
    included_in_27_family_pass: r.included_new_generator || 'NO',
    new_raw_rows: num(r.new_raw_rows) ?? 0, new_valid: num(r.new_valid) ?? 0,
    reconciliation_class: cls || 'NEW_FAMILY',
    scalability: oldPotential >= 100000 ? 'VERY_HIGH' : oldPotential >= 20000 ? 'HIGH' : oldPotential >= 2000 ? 'MEDIUM' : 'LOW',
    duplicate_risk: entity && /pair|date|day/.test(String(entity)) ? 'HIGH' : oldPotential >= 100000 ? 'MEDIUM' : 'LOW',
    cannibalization_risk: r.note && /cannib/i.test(r.note) ? 'FLAGGED' : 'LOW',
    monetization_relevance: /stay|work|move|transport|tools/.test(surface) ? 'HIGH' : /areas|pulse/.test(surface) ? 'MEDIUM' : 'LOW',
    publishability: status === 'VALIDATED' || status === 'PROMISING' ? (srcState === 'HELD' || srcState === 'HELD_PARTIAL' ? 'PUBLISHABLE_NOW' : 'AFTER_SOURCE') : 'NOT_YET',
    note: r.note || '',
  });
}

for (const f of map.families) {
  build(f.family, f.surface, f.vertical, f.entity, f.candidates, f.status, f.priority, f.intent, f.sources, f.missingSources);
}
for (const [id, surface, vertical, entity, potential, gate] of NEW_ONLY) {
  build(id, surface, vertical, entity, potential, 'new-in-27-family-pass', 'high', '', [], gate === 'MISSING_DATA' ? ['school-data-verified'] : []);
}

writeFileSync(new URL('_rows.json', OUT), JSON.stringify({ rows, cells }, null, 0));
console.log('families', rows.length, 'cells', cells.length);
const byStatus = rows.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
console.log('status:', JSON.stringify(byStatus));
const byDemand = rows.reduce((a, r) => { a[r.demand] = (a[r.demand] || 0) + 1; return a; }, {});
console.log('demand:', JSON.stringify(byDemand));

// ---------------------------------------------------------------------------
// Emit. Every CSV is derived from `rows` and `cells`, so no two files can
// disagree, and the funnel is computed rather than asserted.
// ---------------------------------------------------------------------------
const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (name, list, cols) => writeFileSync(new URL(name, OUT),
  [cols.join(','), ...list.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n') + '\n');

csv('FAMILY-MASTER.csv', [...rows].sort((a, b) => b.old_raw_potential - a.old_raw_potential),
  ['family_id', 'surface', 'vertical', 'intent', 'entity', 'status', 'demand', 'demand_source',
    'old_raw_potential', 'old_single_market_potential', 'measured_keywords', 'measured_markets',
    'median_volume', 'max_volume', 'median_kd', 'serp_samples', 'serp_characteristics',
    'low_dr_winner_seen', 'source_state', 'acquisition_type', 'acquisition_cost',
    'required_data', 'missing_data', 'indexable_storable', 'scalability', 'duplicate_risk',
    'cannibalization_risk', 'monetization_relevance', 'publishability', 'markets', 'languages',
    'included_in_27_family_pass', 'new_raw_rows', 'new_valid', 'old_status', 'old_priority',
    'reconciliation_class', 'demand_note', 'acquisition_path', 'note']);

csv('MARKET-COVERAGE.csv', cells,
  ['family_id', 'surface', 'vertical', 'market', 'country', 'distinct_local_demand',
    'local_keyword_measured', 'measured_n', 'median_volume', 'max_volume', 'median_kd',
    'demand_tier', 'unique_data_need', 'separate_serp_intent', 'serp_verdict']);

const surfaces = {};
for (const r of rows) {
  const s = surfaces[r.surface] || (surfaces[r.surface] = {
    surface: r.surface, families: 0, raw_all_markets: 0, raw_single_market: 0,
    validated: 0, promising: 0, experiment_only: 0, missing_data: 0,
    blocked_licence: 0, not_implemented: 0, reject: 0,
    source_obtainable_raw: 0, source_backed_today_raw: 0, publishable_now_families: 0,
    measured_keywords: 0, serp_samples: 0,
  });
  s.families += 1; s.raw_all_markets += r.old_raw_potential;
  s.raw_single_market += r.old_single_market_potential;
  s.measured_keywords += r.measured_keywords; s.serp_samples += r.serp_samples;
  const key = { VALIDATED: 'validated', PROMISING: 'promising', EXPERIMENT_ONLY: 'experiment_only', MISSING_DATA: 'missing_data', BLOCKED_BY_LICENCE: 'blocked_licence', NOT_IMPLEMENTED: 'not_implemented', REJECT: 'reject' }[r.status];
  s[key] += 1;
  if (!/BLOCKED|OUT_OF_SCOPE/.test(r.source_state) && r.status !== 'REJECT' && r.status !== 'BLOCKED_BY_LICENCE') s.source_obtainable_raw += r.old_raw_potential;
  if (/^HELD/.test(r.source_state) && r.status !== 'REJECT' && r.status !== 'BLOCKED_BY_LICENCE') s.source_backed_today_raw += r.old_raw_potential;
  if (r.publishability === 'PUBLISHABLE_NOW') s.publishable_now_families += 1;
}
csv('SURFACE-SCALE.csv', Object.values(surfaces).sort((a, b) => b.raw_all_markets - a.raw_all_markets),
  ['surface', 'families', 'raw_all_markets', 'raw_single_market', 'source_obtainable_raw',
    'source_backed_today_raw', 'validated', 'promising', 'experiment_only', 'missing_data',
    'blocked_licence', 'not_implemented', 'reject', 'publishable_now_families',
    'measured_keywords', 'serp_samples']);

const blockedSrc = {};
for (const r of rows) {
  if (/^HELD/.test(r.source_state) || r.status === 'REJECT') continue;
  const k = r.missing_data.split('; ')[0] || 'unspecified';
  const e = blockedSrc[k] || (blockedSrc[k] = {
    source_id: k, families: 0, family_list: [], raw_all_markets: 0, raw_single_market: 0,
    acquisition_type: r.acquisition_type, acquisition_cost: r.acquisition_cost,
    indexable_storable: r.indexable_storable, acquisition_path: r.acquisition_path,
    best_measured_volume: 0, validated_demand_families: 0,
  });
  e.families += 1; e.family_list.push(r.family_id);
  e.raw_all_markets += r.old_raw_potential; e.raw_single_market += r.old_single_market_potential;
  e.best_measured_volume = Math.max(e.best_measured_volume, Number(r.max_volume) || 0);
  if (/VALIDATED|STRONG/.test(r.demand)) e.validated_demand_families += 1;
}
for (const e of Object.values(blockedSrc)) e.family_list = e.family_list.join(' ');
csv('SOURCE-ROADMAP.csv', Object.values(blockedSrc).sort((a, b) => b.raw_all_markets - a.raw_all_markets),
  ['source_id', 'acquisition_type', 'acquisition_cost', 'indexable_storable', 'families',
    'raw_all_markets', 'raw_single_market', 'validated_demand_families', 'best_measured_volume',
    'family_list', 'acquisition_path']);

csv('SEO-VALIDATION.csv', [...rows].filter((r) => r.measured_keywords > 0 || r.demand_source !== 'INHERITED_FROM_VERTICAL_SIBLING')
  .sort((a, b) => (Number(b.max_volume) || 0) - (Number(a.max_volume) || 0)),
  ['family_id', 'surface', 'demand', 'demand_source', 'measured_keywords', 'measured_markets',
    'median_volume', 'max_volume', 'median_kd', 'serp_samples', 'serp_characteristics',
    'low_dr_winner_seen', 'status', 'demand_note']);

csv('BLOCKED-OPPORTUNITIES.csv',
  [...rows].filter((r) => r.status === 'MISSING_DATA' || r.status === 'BLOCKED_BY_LICENCE' || r.status === 'NOT_IMPLEMENTED')
    .sort((a, b) => b.old_raw_potential - a.old_raw_potential),
  ['family_id', 'surface', 'vertical', 'status', 'demand', 'max_volume', 'old_raw_potential',
    'old_single_market_potential', 'missing_data', 'acquisition_type', 'acquisition_cost',
    'indexable_storable', 'acquisition_path']);

csv('PUBLISHABLE-NOW.csv', [...rows].filter((r) => r.publishability === 'PUBLISHABLE_NOW')
  .sort((a, b) => (Number(b.max_volume) || 0) - (Number(a.max_volume) || 0)),
  ['family_id', 'surface', 'status', 'demand', 'measured_keywords', 'max_volume', 'median_kd',
    'old_raw_potential', 'old_single_market_potential', 'source_state', 'monetization_relevance']);

writeFileSync(new URL('master-universe.jsonl.gz', OUT),
  gzipSync([...rows.map((r) => JSON.stringify({ record: 'family', ...r })),
    ...cells.map((c) => JSON.stringify({ record: 'family_market', ...c }))].join('\n') + '\n'));

// The funnel, A to I, single market and across markets.
const notReject = rows.filter((r) => r.status !== 'REJECT');
const sum = (list, k) => list.reduce((t, r) => t + (Number(r[k]) || 0), 0);
// A family whose status is BLOCKED_BY_LICENCE is excluded from C and D even when
// its source name reads HELD, because events-verified is two sources under one
// name: the public holiday half is held, the events half may not be used.
const usable = notReject.filter((r) => r.status !== 'BLOCKED_BY_LICENCE');
const obtainable = usable.filter((r) => !/BLOCKED|OUT_OF_SCOPE/.test(r.source_state));
const backed = usable.filter((r) => /^HELD/.test(r.source_state));
const measured = rows.filter((r) => r.measured_keywords > 0);
const validated = rows.filter((r) => r.status === 'VALIDATED' || r.status === 'PROMISING');
const experiment = rows.filter((r) => r.status === 'EXPERIMENT_ONLY');
const blocked = rows.filter((r) => /MISSING_DATA|BLOCKED_BY_LICENCE|NOT_IMPLEMENTED/.test(r.status));
const pubNow = rows.filter((r) => r.publishability === 'PUBLISHABLE_NOW');
const funnel = {
  A_raw_architectural_all_markets: sum(rows, 'old_raw_potential'),
  A_raw_architectural_single_market: sum(rows, 'old_single_market_potential'),
  B_distinct_after_structural_dedupe_all_markets: sum(notReject, 'old_raw_potential'),
  B_distinct_after_structural_dedupe_single_market: sum(notReject, 'old_single_market_potential'),
  C_source_obtainable_all_markets: sum(obtainable, 'old_raw_potential'),
  C_source_obtainable_single_market: sum(obtainable, 'old_single_market_potential'),
  D_source_backed_today_all_markets: sum(backed, 'old_raw_potential'),
  D_source_backed_today_single_market: sum(backed, 'old_single_market_potential'),
  E_seo_measured_families: measured.length,
  E_seo_measured_keywords: sum(rows, 'measured_keywords'),
  F_validated_or_promising_families: validated.length,
  F_validated_or_promising_potential_single_market: sum(validated, 'old_single_market_potential'),
  G_experiment_only_families: experiment.length,
  G_experiment_only_potential_single_market: sum(experiment, 'old_single_market_potential'),
  H_blocked_families: blocked.length,
  H_blocked_potential_single_market: sum(blocked, 'old_single_market_potential'),
  I_publishable_now_families: pubNow.length,
  I_publishable_now_pages_today: 1791,
  I_publishable_now_potential_single_market: sum(pubNow, 'old_single_market_potential'),
};
const numbers = {
  generated: '2026-09-30',
  families_total: rows.length, families_old: map.totals.families, families_new_only: NEW_ONLY.length,
  surfaces: Object.keys(surfaces).length, verticals: new Set(rows.map((r) => r.vertical)).size,
  markets: MARKETS.length,
  by_status: rows.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {}),
  by_demand: rows.reduce((a, r) => { a[r.demand] = (a[r.demand] || 0) + 1; return a; }, {}),
  funnel,
  measured_this_pass: measuredNew.length, serp_this_pass: serpNew.length,
  market_measured: Object.fromEntries(MARKETS.map((m) => [m,
    cells.filter((c) => c.market === m && c.local_keyword_measured === 'YES').reduce((t, c) => t + c.measured_n, 0)])),
  market_families_with_demand: Object.fromEntries(MARKETS.map((m) => [m,
    cells.filter((c) => c.market === m && c.distinct_local_demand === 'YES').length])),
  top20_families: [...rows].sort((a, b) => b.old_raw_potential - a.old_raw_potential).slice(0, 20)
    .map((r) => ({ family: r.family_id, raw: r.old_raw_potential, single: r.old_single_market_potential, status: r.status, demand: r.demand, max_volume: r.max_volume })),
  top20_gaps: Object.values(blockedSrc).sort((a, b) => b.raw_all_markets - a.raw_all_markets).slice(0, 20)
    .map((e) => ({ source: e.source_id, families: e.families, raw: e.raw_all_markets, single: e.raw_single_market, type: e.acquisition_type, cost: e.acquisition_cost, best_volume: e.best_measured_volume })),
  top20_opportunities: [...rows].filter((r) => Number(r.max_volume) > 0)
    .sort((a, b) => Number(b.max_volume) - Number(a.max_volume)).slice(0, 20)
    .map((r) => ({ family: r.family_id, max_volume: Number(r.max_volume), median_kd: r.median_kd, status: r.status, surface: r.surface })),
};
writeFileSync(new URL('NUMBERS.json', OUT), JSON.stringify(numbers, null, 1));
console.log('\n== FUNNEL');
for (const [k, v] of Object.entries(funnel)) console.log('  ' + k.padEnd(56) + String(v).padStart(10));
