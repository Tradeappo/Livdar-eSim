// Reconciliation: the 64 family architecture against the 27 family pass.
//
// This adds no research and generates no new universe. It reads the artifacts
// that already exist and answers one question: where did 2,937,117 old candidate
// combinations go, and is 13,975 a ceiling or a subset.
//
// The classification vocabulary is deliberate, because the brief is right that
// collapsing these four is how a data gap turns into a false verdict:
//
//   COVERED              the old family has a counterpart in the new pass
//   NOT_IMPLEMENTED      the source is held or obtainable and the new generator
//                        simply does not emit this family. My omission, not a
//                        finding about the market
//   MISSING_DATA         no source is held, and obtaining one is work
//   BLOCKED_BY_LICENCE   a source exists and may not lawfully be used
//   NOT_RESEARCHED       no demand or SERP evidence was ever gathered
//   OUT_OF_SCOPE         belongs to the eSIM section, not the Atlas
//
// and separately, for anything the new pass rejected:
//
//   EVIDENCE_STRONG      rejected on measured demand and sampled SERPs
//   UNDER_SAMPLED        rejected on fewer than 10 keyword samples, or on SERP
//                        samples extrapolated across thousands of entities

import { readFileSync, writeFileSync } from 'node:fs';
import { FAMILIES as NEW } from './family-catalog.mjs';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/scale-universe-2026-09-29/', ROOT);
const J = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));

const map = J('reports/atlas/product-seo-map.json');
const inv = J('reports/atlas/inventory.json');
const funnel = J('reports/scale-universe-2026-09-29/FUNNEL.json');
const newById = Object.fromEntries(NEW.map((f) => [f.id, f]));

// Rows actually emitted per family in the new pass, from the inventory itself.
const { gunzipSync } = await import('node:zlib');
const newRows = gunzipSync(readFileSync(new URL('MASTER-CANDIDATE-INVENTORY-1M.jsonl.gz', OUT)))
  .toString('utf8').trim().split('\n').map((l) => JSON.parse(l));
const perNewFamily = new Map();
for (const r of newRows) {
  if (!perNewFamily.has(r.family)) perNewFamily.set(r.family, { raw: 0, valid: 0, merged: 0, rejected: 0, blocked: 0 });
  const e = perNewFamily.get(r.family); e.raw += 1;
  if (r.candidate_status === 'VALID') e.valid += 1;
  else if (r.candidate_status === 'MERGED_DUPLICATE') e.merged += 1;
  else if (r.candidate_status === 'REJECTED_FAMILY') e.rejected += 1;
  else e.blocked += 1;
}

// ---------------------------------------------------------------------------
// Source states, from the repo and from reports/atlas/source-decisions.md.
// Anything not evidenced is UNKNOWN rather than guessed.
// ---------------------------------------------------------------------------
const SOURCE_STATE = {
  'events-verified': ['HELD_PARTIAL', 'Public holidays held for 36 countries and 69 named subdivisions under ODbL. The *events* half of this source, meaning concerts, festivals and listings, is the one source-decisions.md calls "the one that probably cannot be built": no viable open source, mostly prohibited. Two different things under one name'],
  'cost-of-living-verified': ['HELD', 'Eurostat PPP and HICP plus World Bank price level, country level, in the repo'],
  'cost-of-living-city-verified': ['MISSING_ACQUIRABLE', 'National statistical offices, uneven city coverage. source-decisions.md: build partially'],
  'salary-data-verified': ['HELD', 'Eurostat salary, country level, in the repo'],
  'salary-city-verified': ['MISSING_ACQUIRABLE', 'National statistical offices, city level'],
  'rent-index-verified': ['HELD', 'Eurostat rent, country level, in the repo'],
  'rent-city-verified': ['MISSING_ACQUIRABLE', 'National statistical offices, uneven'],
  'neighbourhood-facts-verified': ['HELD_PARTIAL', '39 cities, 1,403 neighbourhoods, 4 fields each. Extending it is OSM plus national census work'],
  'places-data-verified': ['ACQUIRABLE_WITH_EFFORT', 'OpenStreetMap via Overpass, ODbL. The repo holds a PARTIAL capture: 13 of 44 cities complete, blocked by public Overpass rate limiting, not by licence. A self hosted Overpass or a Geofabrik extract finishes it'],
  'sport-routes-verified': ['ACQUIRABLE_WITH_EFFORT', 'OpenStreetMap plus an open forecast source, per source-decisions.md'],
  'attractions-verified': ['UNKNOWN', 'Never evaluated in writing'],
  'stay-inventory-verified': ['BLOCKED_COMMERCIAL', 'Affiliate partner, contractual. source-decisions.md calls it a business development question'],
  'property-price-verified': ['MISSING_ACQUIRABLE', 'National registers, uneven'],
  'visa-rules-verified': ['MISSING_ACQUIRABLE', 'Destination government publications. source-decisions.md: build manually, in destination order'],
  'work-rules-verified': ['MISSING_ACQUIRABLE', 'Destination government publications, build with visas'],
  'tax-rules-verified': ['MISSING_ACQUIRABLE', 'OECD plus national authorities, open to read and not to redistribute whole'],
  'health-rules-verified': ['MISSING_ACQUIRABLE', 'Government publications, not evaluated in detail'],
  'banking-rules-verified': ['MISSING_ACQUIRABLE', 'Not evaluated in detail'],
  'school-data-verified': ['MISSING_ACQUIRABLE', 'National registers, no aggregate'],
  'connectivity-data-verified': ['OUT_OF_SCOPE', 'The eSIM section owns connectivity'],
  'safety-data-verified': ['MISSING_ACQUIRABLE', 'Credible sources are national, granular ones are crowd sourced with no licence'],
  'travel-advice-verified': ['MISSING_ACQUIRABLE', 'Government travel advice, published and citable'],
  'transit-fares-verified': ['MISSING_ACQUIRABLE', 'GTFS covers schedules for some operators, fares usually absent, no lawful aggregate'],
  'ground-transport-verified': ['MISSING_ACQUIRABLE', 'Published operator facts, manual capture, roughly 20 to 30 minutes per airport'],
  'venue-data-verified': ['HELD_PARTIAL', 'Wikidata venues, CC0, 9,438 across 16 countries'],
  'community-listings-verified': ['BLOCKED_LICENCE', 'Meetup, Eventbrite and Facebook groups are excluded by standing instruction'],
  'country-facts-verified': ['MISSING_ACQUIRABLE', 'Government and encyclopaedic, buildable'],
  'item-price-verified': ['MISSING_ACQUIRABLE', 'No open aggregate found; Numbeo refused on licence'],
};

// ---------------------------------------------------------------------------
// The mapping, one entry per old family. `newFamily` null means the new pass
// never emitted it, and `why` then has to say which of the six reasons applies.
// ---------------------------------------------------------------------------
const M = {
  // --- families the new pass does cover ---------------------------------
  'weather.city-month': { newFamily: ['climate.city-month', 'climate.city-month-tail'], cls: 'COVERED' },
  'weather.city-best-time': { newFamily: ['climate.city-annual'], cls: 'COVERED', note: 'The old family was city level and 2 markets; the new one is the annual city profile. The 24 live weather.country-best-time pages are the country level ancestor of both' },
  'transport.airport-to-city': { newFamily: ['transport.airport-to-city'], cls: 'COVERED' },
  'sport.city-activity': { newFamily: ['sport.city-activity-season'], cls: 'COVERED' },
  'neighbourhoods.city-where-to-stay': { newFamily: ['areas.city-where-to-stay'], cls: 'COVERED' },
  'neighbourhoods.guide': { newFamily: ['areas.neighbourhood-profile'], cls: 'COVERED' },
  'neighbourhoods.city-best-for': { newFamily: ['areas.persona-variants'], cls: 'COVERED' },
  'cost-of-living.country': { newFamily: ['move.country-cost-of-living'], cls: 'COVERED' },
  'work.country-salaries': { newFamily: ['work.country-salaries'], cls: 'COVERED' },
  'work.country-working': { newFamily: ['work.working-time-per-year'], cls: 'COVERED', note: 'The new family is narrower: working time and public holiday count, not the whole work rules page the old family described' },
  'work.city-salaries': { newFamily: ['work.city-salary-by-role'], cls: 'COVERED' },
  'rents.city': { newFamily: ['stay.country-rent-trend'], cls: 'PARTIAL', note: 'The new pass only built the COUNTRY rent family, and rejected it. The city family the old map describes was never emitted' },
  'tools.calculator': { newFamily: ['tools.calculator'], cls: 'COVERED' },
  'tools.matcher': { newFamily: ['tools.calculator'], cls: 'PARTIAL', note: 'Folded into the single tools family in the new pass' },
  'tools.cost-calculator': { newFamily: ['tools.calculator'], cls: 'PARTIAL', note: 'Folded into the single tools family' },
  'tools.cost-comparison': { newFamily: ['tools.calculator'], cls: 'PARTIAL', note: 'Folded into the single tools family' },
  'comparisons.city-vs-city': { newFamily: ['transport.city-pair-distance'], cls: 'PARTIAL', note: 'Only the distance variant was modelled, and rejected. The cost of living city comparison the old family meant was never emitted' },

  // --- the whole events surface ------------------------------------------
  'events.city-type': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'events-verified' },
  'events.city-window': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'events-verified' },
  'events.series-city': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'events-verified' },
  'events.city-calendar': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'events-verified' },
  'events.recurring': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'events-verified' },

  // --- places and local discovery ----------------------------------------
  'places.city-category': { newFamily: null, cls: 'NOT_IMPLEMENTED', src: 'places-data-verified', note: 'The single largest family in the old architecture at 295,100. The source is ODbL and the repo holds a partial capture blocked by Overpass rate limiting, so this is an engineering gap, not a licence one and not an SEO one. The new generator has no places family at all' },
  'places.neighbourhood-category': { newFamily: null, cls: 'NOT_IMPLEMENTED', src: 'places-data-verified' },
  'places.poi': { newFamily: null, cls: 'NOT_IMPLEMENTED', src: 'places-data-verified' },
  'activities.city-things-to-do': { newFamily: null, cls: 'MISSING_DATA', src: 'attractions-verified' },
  'destinations.city-hub': { newFamily: null, cls: 'NOT_IMPLEMENTED', note: 'Source ready in the old map. The new pass has no city hub family, which is also the natural parent for every city level family it does have' },
  'destinations.country-hub': { newFamily: null, cls: 'NOT_IMPLEMENTED', note: 'Source ready in the old map and never emitted' },

  // --- stay and property --------------------------------------------------
  'stay.city-type': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'stay-inventory-verified' },
  'stay.near-venue': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'stay-inventory-verified' },
  'rents.neighbourhood': { newFamily: null, cls: 'MISSING_DATA', src: 'rent-city-verified' },
  'property.city-buy': { newFamily: null, cls: 'MISSING_DATA', src: 'property-price-verified' },

  // --- work and jobs ------------------------------------------------------
  'work.city-jobs': { newFamily: null, cls: 'MISSING_DATA', src: 'work-rules-verified' },
  'work.city-jobs-category': { newFamily: null, cls: 'MISSING_DATA', src: 'salary-city-verified' },

  // --- move: visas, tax, health, banking, education, services -------------
  'visas.country-visit': { newFamily: null, cls: 'MISSING_DATA', src: 'visa-rules-verified' },
  'visas.country-residency': { newFamily: null, cls: 'MISSING_DATA', src: 'visa-rules-verified' },
  'visas.country-digital-nomad': { newFamily: null, cls: 'MISSING_DATA', src: 'visa-rules-verified' },
  'visas.country-work-permit': { newFamily: null, cls: 'MISSING_DATA', src: 'visa-rules-verified' },
  'relocation.country': { newFamily: null, cls: 'MISSING_DATA', src: 'visa-rules-verified' },
  'relocation.city': { newFamily: null, cls: 'MISSING_DATA', src: 'cost-of-living-city-verified' },
  'taxes.country': { newFamily: null, cls: 'MISSING_DATA', src: 'tax-rules-verified' },
  'taxes.country-remote-work': { newFamily: null, cls: 'MISSING_DATA', src: 'tax-rules-verified' },
  'health.country': { newFamily: null, cls: 'MISSING_DATA', src: 'health-rules-verified' },
  'health.city': { newFamily: null, cls: 'MISSING_DATA', src: 'health-rules-verified' },
  'banking.country': { newFamily: null, cls: 'MISSING_DATA', src: 'banking-rules-verified' },
  'education.city-schools': { newFamily: null, cls: 'MISSING_DATA', src: 'school-data-verified' },
  'education.city-universities': { newFamily: null, cls: 'MISSING_DATA', src: 'school-data-verified' },
  'services.city-practical': { newFamily: null, cls: 'NOT_RESEARCHED', src: 'places-data-verified', note: 'Old status research-needed, not blocked' },
  'services.country-admin': { newFamily: null, cls: 'NOT_RESEARCHED', src: 'country-facts-verified', note: 'Old status research-needed, not blocked' },
  'cost-of-living.city': { newFamily: null, cls: 'MISSING_DATA', src: 'cost-of-living-city-verified' },
  'cost-of-living.city-vs-market': { newFamily: null, cls: 'MISSING_DATA', src: 'cost-of-living-city-verified' },
  'cost-of-living.country-vs-market': { newFamily: null, cls: 'NOT_IMPLEMENTED', note: 'Source ready in the old map: country cost of living is held and the origin market axis is arithmetic. Never emitted' },
  'cost-of-living.item-country': { newFamily: null, cls: 'MISSING_DATA', src: 'item-price-verified' },

  // --- comparisons and rankings -------------------------------------------
  'comparisons.city-vs-home': { newFamily: null, cls: 'MISSING_DATA', src: 'cost-of-living-city-verified' },
  'comparisons.country-vs-country': { newFamily: null, cls: 'NOT_IMPLEMENTED', src: 'tax-rules-verified', note: 'Blocked on tax in the old map, but the cost of living half is held, so a narrower country pair page is buildable and was never emitted' },
  'rankings.index': { newFamily: null, cls: 'NOT_IMPLEMENTED', note: 'Source ready in the old map, 24 eligible pages, and 4 ranking pages are live today. The new generator has no rankings family' },

  // --- transport ----------------------------------------------------------
  'transport.city-getting-around': { newFamily: null, cls: 'MISSING_DATA', src: 'transit-fares-verified' },
  'transport.route-from-market': { newFamily: null, cls: 'NOT_IMPLEMENTED', note: 'Source ready in the old map and never emitted' },
  'airports.guide': { newFamily: null, cls: 'NOT_IMPLEMENTED', note: 'Source ready in the old map, OurAirports is public domain, and never emitted' },

  // --- sport, safety, community, connectivity -----------------------------
  'sport.route': { newFamily: null, cls: 'NOT_IMPLEMENTED', src: 'sport-routes-verified' },
  'safety.city': { newFamily: null, cls: 'MISSING_DATA', src: 'safety-data-verified' },
  'safety.country-advice': { newFamily: null, cls: 'MISSING_DATA', src: 'travel-advice-verified' },
  'community.city-topic': { newFamily: null, cls: 'BLOCKED_BY_LICENCE', src: 'community-listings-verified' },
  'connectivity.city-online': { newFamily: null, cls: 'OUT_OF_SCOPE', src: 'connectivity-data-verified' },
  'connectivity.country-sim-gap': { newFamily: null, cls: 'OUT_OF_SCOPE', src: 'connectivity-data-verified' },
};

// Families that exist in the new pass and had no counterpart in the old 64.
const NEW_ONLY = {
  'pulse.country-holidays': 'Public holidays. The old pulse surface was events only and had no holiday family',
  'pulse.subdivision-holidays': 'German states and Swiss cantons. The highest measured demand in the programme and absent from the old architecture',
  'pulse.named-holiday-date': 'A named holiday and its date per country',
  'pulse.named-holiday-regions': 'Which regions observe a named holiday',
  'pulse.long-weekends': 'Bridge days computed from the holiday calendar',
  'pulse.today': 'Is today a holiday',
  'calendar.year': 'Calendar year pages. 627,451 searches on calendrier 2026 alone',
  'calendar.month': 'Calendar month pages',
  'calendar.week-numbers': 'Week number pages',
  'climate.city-annual': 'Annual city climate profile, the parent of the month pages',
  'climate.city-day': 'Recorded as REJECT: the 1,077,115 URL padding route',
  'pulse.city-holidays': 'Recorded as REJECT: holidays do not resolve to city level',
};

// Rejection evidence strength, from the measured sample sizes in FUNNEL.json.
const SAMPLES = funnel.family_samples || {};
const UNDER_SAMPLE_FLOOR = 10;
function evidence(newIds) {
  if (!newIds) return ['', ''];
  const rejects = newIds.filter((id) => newById[id] && newById[id].gate === 'REJECT');
  if (!rejects.length) return ['', ''];
  const ns = rejects.map((id) => (SAMPLES[id] ? SAMPLES[id].sample_size : 0));
  const n = Math.max(0, ...ns);
  if (n === 0) return ['UNDER_SAMPLED', 'rejected with no keyword sample of its own'];
  if (n < UNDER_SAMPLE_FLOOR) return ['UNDER_SAMPLED', `rejected on ${n} keyword samples, below the ${UNDER_SAMPLE_FLOOR} sample floor`];
  return ['EVIDENCE_STRONG', `${n} keyword samples`];
}

const oldFamilies = map.families;
const rows = oldFamilies.map((f) => {
  const m = M[f.family] || { newFamily: null, cls: 'UNMAPPED' };
  const newIds = m.newFamily || [];
  const counts = newIds.reduce((a, id) => {
    const e = perNewFamily.get(id) || { raw: 0, valid: 0, merged: 0, rejected: 0, blocked: 0 };
    return { raw: a.raw + e.raw, valid: a.valid + e.valid, merged: a.merged + e.merged, rejected: a.rejected + e.rejected, blocked: a.blocked + e.blocked };
  }, { raw: 0, valid: 0, merged: 0, rejected: 0, blocked: 0 });
  const src = m.src || (f.missingSources[0] || '');
  const state = SOURCE_STATE[src] || (src ? ['UNKNOWN', ''] : ['HELD', 'no missing source recorded in the old map']);
  const [strength, strengthWhy] = evidence(newIds);
  const gate = newIds.map((id) => (newById[id] ? newById[id].gate : '')).filter(Boolean).join('+');
  return {
    family_id: f.family, surface: f.surface, vertical: f.vertical,
    old_status: f.status, old_priority: f.priority,
    old_raw_potential: f.candidates,
    old_single_market_potential: Math.round(f.candidates / (f.markets || 1)),
    new_family: newIds.join('+'),
    included_new_generator: newIds.length ? 'YES' : 'NO',
    new_raw_rows: counts.raw, new_valid: counts.valid, new_merged: counts.merged,
    new_rejected: counts.rejected, new_blocked: counts.blocked,
    new_gate: gate,
    reconciliation_class: m.cls,
    source_id: src, source_state: state[0], source_note: state[1],
    seo_validation_status: strength || (newIds.length ? 'NOT_REJECTED' : 'NOT_RESEARCHED'),
    evidence_note: strengthWhy,
    note: m.note || '',
  };
});

// ---------------------------------------------------------------------------
// Aggregates for the report.
// ---------------------------------------------------------------------------
const by = (key) => rows.reduce((a, r) => { a[r[key]] = (a[r[key]] || 0) + 1; return a; }, {});
const candBy = (key) => rows.reduce((a, r) => { a[r[key]] = (a[r[key]] || 0) + r.old_raw_potential; return a; }, {});
const summary = {
  generated: '2026-09-29',
  old: {
    surfaces: map.totals.surfaces, verticals: map.totals.verticals, families: map.totals.families,
    candidate_combinations: map.totals.candidates,
    families_in_inventory_json: inv.families,
    blocked_candidates: map.inventory.blocked,
    source_ready_candidates: map.inventory.sourceReady,
    eligible_candidates: map.inventory.eligible,
    serp_measured: map.inventory.serpMeasured,
    families_by_status: map.byStatus,
    markets_enumerable: inv.markets.enumerable,
    candidates_by_axis: inv.candidates.byAxis,
    candidates_by_market: inv.candidates.byMarket,
    single_market_en_us: inv.candidates.byMarket['en-US'],
  },
  new: {
    families_in_catalog: NEW.length,
    families_emitted: new Set(newRows.map((r) => r.family)).size,
    raw_rows: funnel.funnel.raw_combinations,
    valid: funnel.funnel.VALID_RESEARCH_CANDIDATES,
    publishable_now: funnel.split.publishable_now,
    blocked: funnel.buckets.blocked_pending_source,
    rejected: funnel.buckets.rejected_family,
    merged: funnel.buckets.merged_duplicate,
    markets: 9,
    markets_dropped: ['en-GB', 'zh-Hant-TW'],
  },
  reconciliation: {
    old_families_covered: rows.filter((r) => r.included_new_generator === 'YES').length,
    old_families_absent: rows.filter((r) => r.included_new_generator === 'NO').length,
    by_class: by('reconciliation_class'),
    old_candidates_by_class: candBy('reconciliation_class'),
    by_source_state: by('source_state'),
    old_candidates_by_source_state: candBy('source_state'),
    under_sampled_families: rows.filter((r) => r.seo_validation_status === 'UNDER_SAMPLED').map((r) => r.family_id),
    new_only_families: Object.keys(NEW_ONLY).length,
  },
};

// The brief names the columns it wants; they come first, then the extra columns
// the reconciliation needed. `status_new` is the family's state in the new pass,
// which is its gate where it was modelled and its reconciliation class where it
// was not, because "absent" is a state and it has to be visible in one column.
for (const r of rows) {
  r.status_new = r.new_gate || 'ABSENT_' + r.reconciliation_class;
  r.source_status = r.source_state;
  r.missing_data = r.source_state === 'HELD' ? '' : (r.source_id || 'unspecified');
  r.rejection_reason = r.new_gate && r.new_gate.includes('REJECT')
    ? (r.seo_validation_status === 'UNDER_SAMPLED' ? 'REJECTED_BUT_' + r.evidence_note : 'rejected: ' + r.evidence_note)
    : (r.included_new_generator === 'NO' ? 'not rejected: ' + r.reconciliation_class : '');
  // Confidence is in the decision recorded for this family, not in the family.
  r.confidence = r.seo_validation_status === 'UNDER_SAMPLED' ? 'LOW'
    : r.seo_validation_status === 'EVIDENCE_STRONG' ? 'HIGH'
    : r.reconciliation_class === 'NOT_IMPLEMENTED' ? 'NONE_NOT_EVALUATED'
    : r.reconciliation_class === 'NOT_RESEARCHED' ? 'NONE_NOT_RESEARCHED'
    : r.reconciliation_class === 'BLOCKED_BY_LICENCE' ? 'HIGH_ON_THE_LICENCE_NOT_ON_DEMAND'
    : r.reconciliation_class === 'MISSING_DATA' ? 'HIGH_ON_THE_GAP_NOT_ON_DEMAND'
    : r.reconciliation_class === 'OUT_OF_SCOPE' ? 'N_A'
    : 'MEDIUM';
  r.action_needed = r.reconciliation_class === 'NOT_IMPLEMENTED' ? 'implement in the generator, no new data needed'
    : r.seo_validation_status === 'UNDER_SAMPLED' ? 'remeasure: 20 or more keywords across tiers and markets, plus 20 SERPs, before any verdict'
    : r.reconciliation_class === 'MISSING_DATA' ? 'acquire ' + (r.source_id || 'the source') + ', then model'
    : r.reconciliation_class === 'BLOCKED_BY_LICENCE' ? 'partner, licence or drop. Do not model on prohibited data'
    : r.reconciliation_class === 'NOT_RESEARCHED' ? 'research demand and SERPs before deciding'
    : r.reconciliation_class === 'OUT_OF_SCOPE' ? 'none, the eSIM section owns it'
    : r.new_gate === 'SAFE_TO_SCALE' ? 'publish under the publication controller'
    : 'hold at its gate';
}

const COLS = ['family_id', 'surface', 'vertical', 'old_raw_potential', 'new_raw_rows',
  'included_new_generator', 'status_new', 'source_status', 'seo_validation_status',
  'rejection_reason', 'confidence', 'missing_data', 'action_needed',
  'old_single_market_potential', 'old_status', 'old_priority', 'new_family', 'new_valid',
  'new_merged', 'new_rejected', 'new_blocked', 'new_gate', 'reconciliation_class',
  'source_id', 'source_state', 'evidence_note', 'source_note', 'note'];
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
writeFileSync(new URL('FAMILY-RECONCILIATION.csv', OUT),
  [COLS.join(','), ...rows.sort((a, b) => b.old_raw_potential - a.old_raw_potential)
    .map((r) => COLS.map((c) => csvCell(r[c])).join(','))].join('\n') + '\n');
writeFileSync(new URL('RECONCILIATION-SUMMARY.json', OUT), JSON.stringify({ summary, new_only: NEW_ONLY }, null, 1));
console.log(JSON.stringify(summary, null, 1));
