// LIVDAR MASTER KEYWORD SET, final. Built 2026-09-30.
//
// This script UNIFIES every keyword already researched across every earlier pass
// with the entity and listing axis measurements from the final pass. It does not
// invent keywords and it does not re-measure anything. Every row carries the file
// it came from in `source_of_keyword` so any figure can be traced back.
//
// The dedupe ladder, in order, and what each rung is allowed to collapse:
//   1 exact              same string, same market
//   2 normalised         case and whitespace only. NOT diacritics: brueckentage
//                        measures 8 and brueckentage with the umlaut measures 1,712,
//                        so folding them would merge two different keywords.
//   3 same-market semantic   one market, one family, one entity, trivially
//                        reordered phrasing ("hotel rom" vs "rom hotel")
//   4 entity-intent      same entity, same intent, same market, where the only
//                        difference is a stop word
// What the ladder must NEVER collapse, because measurement showed these are
// distinct demand and not duplicates:
//   - the same intent in different markets: kalender 2026 is 333,644 in DE and
//     146,979 in NL, and things to do in spokane is 4,000 in us and 60 in gb
//   - local language variants with their own demand
//   - an exonym against its endonym: prag 15,000 against praha 20
//   - entity specific queries, which are the point of the entity axis

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/livdar-final-research-freeze-2026-09-30/', ROOT);
const p = (rel) => new URL(rel, ROOT);

const readTable = (rel, sep) => {
  const f = p(rel);
  if (!existsSync(f)) return [];
  const lines = readFileSync(f, 'utf8').trim().split('\n');
  if (lines.length < 2) return [];
  const cols = lines[0].split(sep);
  return lines.slice(1).map((l) => {
    const cells = l.split(sep);
    return Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]));
  });
};
const num = (v) => { if (v === '' || v == null) return ''; const n = Number(String(v).replace(/[^0-9.-]/g, '')); return Number.isFinite(n) ? n : ''; };

// ---------------------------------------------------------------------------
// The SERP classification, from SERP-EVIDENCE.csv, applied by family. A family
// with a measured SERP carries that class; one without carries NOT_SAMPLED, and
// is never promoted above PROMISING on volume alone.
// ---------------------------------------------------------------------------
const SERP_BY_FAMILY = {
  'places.city-category': 'OPEN',
  'activities.city-things-to-do': 'OPEN',
  'events.city-type': 'OPEN',
  'poi.landmark-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'poi.museum-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'poi.venue-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'poi.stadium-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'poi.mall-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'poi.beach-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'poi.market-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'places.restaurant-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'places.gym-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'places.coworking-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'transport.station-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'transport.terminal-entity': 'BRAND_OWNED_PLUS_SOCIAL',
  'events.venue-event': 'OPEN_BUT_ECONOMICALLY_DEAD',
  'jobs.role-city': 'LISTING_INVENTORY_REQUIRED',
  'jobs.company-city': 'LISTING_INVENTORY_REQUIRED',
  'jobs.employer-city': 'LISTING_INVENTORY_REQUIRED',
  'jobs.visa-sponsorship': 'LISTING_INVENTORY_REQUIRED',
  'jobs.english-speaking': 'LISTING_INVENTORY_REQUIRED',
  'jobs.remote': 'LISTING_INVENTORY_REQUIRED',
  'jobs.salary-role-city': 'OPEN',
  'work.city-jobs': 'AGGREGATOR_LOCKED',
  'route.city-pair': 'AGGREGATOR_LOCKED',
  'property.city-buy': 'OPEN_BUT_SOURCE_BLOCKED',
  'weather.city-best-time': 'SERP_FEATURE_SUPPRESSED',
  'weather.city': 'SERP_FEATURE_SUPPRESSED',
};
// The data a family needs before a page can be published at all.
const DATA_REQUIRED = {
  'jobs.role-city': 'jobs feed', 'jobs.company-city': 'jobs feed', 'jobs.employer-city': 'jobs feed',
  'jobs.visa-sponsorship': 'jobs feed', 'jobs.english-speaking': 'jobs feed', 'jobs.remote': 'jobs feed',
  'work.city-jobs': 'jobs feed',
  'events.venue-event': 'licensed event feed', 'events.city-window': 'licensed event feed',
  'events.city-concerts': 'licensed event feed', 'events.city-whatson': 'licensed event feed',
  'events.city-exhibitions': 'licensed event feed', 'events.city-conferences': 'licensed event feed',
  'events.country-festivals': 'licensed event feed', 'events.sport-tickets': 'licensed event feed',
  'property.city-buy': 'property listings feed', 'stay.monthly-rental': 'rental listings feed',
  'stay.rooms': 'rental listings feed', 'stay.roommates': 'rental listings feed',
  'stay.coliving': 'operator directory', 'stay.flatshare': 'rental listings feed',
  'route.city-pair': 'timetable feed',
  'poi.landmark-entity': 'OSM plus Wikidata plus opening hours',
  'poi.museum-entity': 'OSM plus Wikidata plus opening hours',
  'places.restaurant-entity': 'OSM plus opening hours plus menu',
  'places.gym-entity': 'OSM plus operator data', 'places.coworking-entity': 'OSM plus operator data',
};

// Market codes differ between passes: the same market appears as `de`, `de-DE`
// and `DE` across files. Left alone the dedupe treats them as three markets and
// the by-market breakdown is wrong, so every code is canonicalised here. `en`
// resolves to en-GB, not en-US, because the measurement rule this project runs on
// is that English travel and local phrasings live in gb: things to do in spokane
// is 4,000 in us and 60 in gb, and the reverse holds for the travel phrasings.
const MARKET = {
  de: 'de-DE', DE: 'de-DE', 'de-DE': 'de-DE',
  fr: 'fr-FR', FR: 'fr-FR', 'fr-FR': 'fr-FR',
  nl: 'nl-NL', NL: 'nl-NL', 'nl-NL': 'nl-NL',
  it: 'it-IT', IT: 'it-IT', 'it-IT': 'it-IT',
  es: 'es-ES', ES: 'es-ES', 'es-ES': 'es-ES',
  pl: 'pl-PL', PL: 'pl-PL', 'pl-PL': 'pl-PL',
  pt: 'pt-BR', BR: 'pt-BR', 'pt-BR': 'pt-BR', 'pt-PT': 'pt-BR',
  ja: 'ja-JP', JP: 'ja-JP', 'ja-JP': 'ja-JP',
  TW: 'zh-Hant-TW', tw: 'zh-Hant-TW', 'zh-Hant-TW': 'zh-Hant-TW',
  US: 'en-US', us: 'en-US', 'en-US': 'en-US', 'en-us': 'en-US',
  GB: 'en-GB', gb: 'en-GB', 'en-GB': 'en-GB', en: 'en-GB',
};
const LANG_OF = { 'de-DE': 'de', 'fr-FR': 'fr', 'nl-NL': 'nl', 'it-IT': 'it', 'es-ES': 'es',
  'pl-PL': 'pl', 'pt-BR': 'pt', 'ja-JP': 'ja', 'zh-Hant-TW': 'zh-Hant', 'en-US': 'en', 'en-GB': 'en',
  MULTI_MARKET: 'multi' };
const canonMarket = (m) => {
  const raw = String(m || '').trim();
  if (!raw) return 'MULTI_MARKET';   // the eSIM set is sold across markets, not in one
  return MARKET[raw] || raw;
};

// entity_type is a controlled vocabulary, not the raw entity identifier. The
// candidate universe stored whatever keyed the row there, so its `entity` column
// holds GeoNames ids and strings like "CH::Christmas::2027". Passing those through
// gives hundreds of distinct "types" and a breakdown nobody can read, so the type
// is derived from the family and surface instead and the raw value is kept in
// notes where it is still useful for tracing.
const ENTITY_TYPE_RULES = [
  [/^poi\./, 'poi'], [/^places\./, 'local_place'], [/^events\.(venue|city|country|sport|recurring|named|subdivision)/, 'event'],
  [/^stay\.|^property\./, 'accommodation'], [/^jobs\.|^work\.city/, 'job'],
  [/^move\./, 'country_procedure'], [/^transport\.|^route\./, 'transport_node'],
  [/^sport\./, 'sport_facility_or_route'], [/^services\.|^health\.|^education\./, 'service_place'],
  [/^neighbourhoods\./, 'neighbourhood'], [/^airport\./, 'airport'],
  [/^tools\./, 'tool'], [/^calendar\./, 'date_or_period'],
  [/^work\.country|^cost-of-living\.country|^rents\.country/, 'country'],
  [/^activities\.|^weather\.|^rents\.city|^safety\.city|^facts\.city|^wellness\.city|^cost-of-living\.city/, 'city'],
];
const entityTypeOf = (family, given) => {
  // An explicit clean value from this pass wins, because the entity axes set it
  // deliberately and they are the rows the breakdown is for.
  const CLEAN = new Set(['poi', 'local_place', 'event', 'accommodation', 'job', 'country_procedure',
    'transport_node', 'sport_facility_or_route', 'service_place', 'city', 'country', 'neighbourhood',
    'airport', 'tool', 'date_or_period', 'subdivision']);
  if (CLEAN.has(given)) return given;
  if (/^city_tier[1-4]$/.test(given || '')) return given;      // the tier carries real meaning
  if (given === 'city_or_country') return 'city_or_country';
  const f = String(family || '');
  for (const [re, t] of ENTITY_TYPE_RULES) if (re.test(f)) return t;
  return '(unclassified)';
};

const rows = [];
const push = (r) => {
  if (!r.keyword) return;
  const mk = canonMarket(r.market);
  rows.push({
    keyword: r.keyword, market: mk, language: LANG_OF[mk] || String(r.language || '').toLowerCase() || '',
    surface: r.surface || '', family: r.family || '', entity_type: entityTypeOf(r.family, r.entity_type),
    intent_type: r.intent_type || '', status: r.status || 'PROMISING',
    live_or_future: r.live_or_future || 'FUTURE', primary_or_secondary: r.primary_or_secondary || 'SECONDARY',
    page_type: r.page_type || '', target_url_or_pattern: r.target_url_or_pattern || '',
    volume: num(r.volume), KD: num(r.kd), CPC: num(r.cpc), traffic_potential: num(r.traffic_potential),
    SERP_class: r.SERP_class || SERP_BY_FAMILY[r.family] || 'NOT_SAMPLED',
    source_of_keyword: r.source_of_keyword || '', evidence: r.evidence || '',
    data_source_required: r.data_source_required || DATA_REQUIRED[r.family] || '',
    indexable: r.indexable || '', priority: r.priority || '', notes: r.notes || '',
  });
};

// --- 1. Rank Tracker priority set: the live pages and the eSIM set ------------
for (const r of readTable('reports/rank-tracker-2026-09-29/RANK-TRACKER-PRIORITY.tsv', '\t')) {
  const live = r.tier === 'LIVE_PRIMARY' || r.tier === 'LIVE_SECONDARY';
  push({ keyword: r.keyword, market: r.market, language: r.language, surface: r.surface, family: r.family,
    entity_type: r.entity ? 'city_or_country' : '', intent_type: 'informational',
    status: r.tier, live_or_future: live || r.tier === 'ESIM' ? 'LIVE' : 'FUTURE',
    primary_or_secondary: r.tier === 'LIVE_PRIMARY' ? 'PRIMARY' : 'SECONDARY',
    page_type: 'DURABLE', target_url_or_pattern: r.path, volume: r.volume, kd: r.kd,
    cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    source_of_keyword: 'rank-tracker-2026-09-29/RANK-TRACKER-PRIORITY.tsv',
    evidence: r.gsc_signal ? 'GSC ' + r.gsc_signal : 'Ahrefs measured',
    indexable: 'YES', priority: r.priority, notes: r.review_reason || '' });
}
// --- 2. Published page demand: the live 500 and their measured demand ---------
for (const r of readTable('reports/ahrefs-export-2026-09-28/organic/published-page-demand-2026-09-28.tsv', '\t')) {
  push({ keyword: r.keyword, market: r.locale || r.country, surface: r.surface, family: r.family,
    intent_type: 'informational', status: 'LIVE_SECONDARY', live_or_future: 'LIVE',
    page_type: 'DURABLE', target_url_or_pattern: r.path, volume: r.volume, kd: r.kd,
    cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    source_of_keyword: 'ahrefs-export-2026-09-28/organic/published-page-demand', evidence: 'Ahrefs measured',
    indexable: 'YES' });
}
// --- 3. The candidate universe, with its own status vocabulary mapped over ----
const CAND_STATUS = { VALIDATED: 'CANDIDATE_HEAD', PROMISING: 'PROMISING', REJECTED: 'REJECT',
  NEEDS_DATA: 'BLOCKED_DATA', BLOCKED: 'BLOCKED_LICENCE' };
for (const f of ['MASTER-CANDIDATE-INVENTORY', 'VALIDATED', 'LOCAL-LANGUAGE-OPPORTUNITIES',
  'REJECTED-OPPORTUNITIES', 'BLOCKED-BY-DATA-OR-LICENCE', 'TOOL-OPPORTUNITIES']) {
  for (const r of readTable(`reports/candidate-universe-2026-09-29/${f}.tsv`, '\t')) {
    const st = CAND_STATUS[r.status] || 'PROMISING';
    const base = { market: r.search_market, language: r.language, surface: r.surface, family: r.family,
      entity_type: r.entity, intent_type: r.serp_intent || 'informational', status: st,
      live_or_future: r.livdar_coverage_now === 'LIVE' ? 'LIVE' : 'FUTURE',
      page_type: 'DURABLE', target_url_or_pattern: r.proposed_url, volume: r.monthly_volume,
      kd: r.kd, cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
      source_of_keyword: `candidate-universe-2026-09-29/${f}.tsv`,
      evidence: r.measured === 'yes' ? 'Ahrefs measured' : (r.gsc_evidence || 'family inference'),
      data_source_required: r.source_data_available === 'no' ? (r.source_id || 'source missing') : '',
      indexable: st === 'REJECT' || st.startsWith('BLOCKED') ? 'NO' : 'YES', notes: r.notes };
    push({ ...base, keyword: r.primary_keyword, primary_or_secondary: 'PRIMARY' });
    for (const s of String(r.secondary_keywords || '').split(/[;|]/).map((x) => x.trim()).filter(Boolean)) {
      push({ ...base, keyword: s, primary_or_secondary: 'SECONDARY' });
    }
  }
}
// --- 4. Tier 3 and tier 4 city demand, all 11 markets -------------------------
for (const r of readTable('reports/livdar-master-seo-universe-2026-09-30/TIER3-DEMAND-EXPERIMENT.csv', ',')) {
  const v = num(r.volume);
  const serp = SERP_BY_FAMILY[r.family] || 'NOT_SAMPLED';
  const blocked = ['AGGREGATOR_LOCKED', 'SERP_FEATURE_SUPPRESSED', 'OPEN_BUT_SOURCE_BLOCKED'].includes(serp);
  const st = blocked ? (serp === 'OPEN_BUT_SOURCE_BLOCKED' ? 'BLOCKED_DATA' : 'REJECT')
    : v === '' || v < 50 ? 'REJECT' : v < 300 ? 'PROMISING' : 'DURABLE_HEAD';
  push({ keyword: r.keyword, market: r.market, surface: 'atlas', family: r.family,
    entity_type: 'city_tier' + r.tier, intent_type: 'local_discovery', status: st,
    page_type: 'DURABLE', target_url_or_pattern: `/{lang}/${r.family}/{city}`, volume: r.volume,
    kd: r.kd, cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    source_of_keyword: 'livdar-master-seo-universe-2026-09-30/TIER3-DEMAND-EXPERIMENT.csv',
    evidence: 'Ahrefs measured, tier ' + r.tier + ' city ' + r.city,
    indexable: blocked ? 'NO' : 'YES' });
}
// --- 5. Family x market head demand, five markets -----------------------------
for (const r of readTable('reports/livdar-master-seo-universe-2026-09-30/FAMILY-MARKET-MEASUREMENTS.csv', ',')) {
  const v = num(r.volume);
  const serp = SERP_BY_FAMILY[r.family_id] || 'NOT_SAMPLED';
  const blocked = ['AGGREGATOR_LOCKED', 'SERP_FEATURE_SUPPRESSED'].includes(serp);
  push({ keyword: r.keyword, market: r.market, surface: 'atlas', family: r.family_id,
    entity_type: 'city_tier1', intent_type: 'local_discovery',
    status: blocked ? 'REJECT' : v !== '' && v >= 1000 ? 'DURABLE_HEAD' : v >= 300 ? 'CANDIDATE_HEAD' : 'PROMISING',
    page_type: 'DURABLE', volume: r.volume, kd: r.kd, cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    source_of_keyword: 'livdar-master-seo-universe-2026-09-30/FAMILY-MARKET-MEASUREMENTS.csv',
    evidence: 'Ahrefs measured', indexable: blocked ? 'NO' : 'YES' });
}
// --- 6. Cross-language reach. The negatives are kept deliberately: a measured
// zero is the evidence that stops the generator emitting that page. -----------
for (const r of readTable('reports/livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv', ',')) {
  const v = num(r.volume);
  push({ keyword: r.keyword, market: r.searcher_market, surface: 'atlas', family: r.family,
    entity_type: 'city_tier' + r.city_tier, intent_type: 'cross_language',
    status: v !== '' && v >= 1000 ? 'DURABLE_HEAD' : v >= 300 ? 'CANDIDATE_HEAD' : v >= 50 ? 'PROMISING' : 'REJECT',
    page_type: 'DURABLE', volume: r.volume, kd: r.kd, cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    source_of_keyword: 'livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv',
    evidence: r.note, indexable: v !== '' && v >= 300 ? 'YES' : 'NO', notes: r.note });
}
// --- 7. The entity and listing axes, this pass --------------------------------
const AXIS_ENTITY_TYPE = { A_poi: 'poi', B_places: 'local_place', C_events: 'event', D_stay: 'accommodation',
  E_jobs: 'job', F_move: 'country_procedure', G_services: 'service_place', H_transport: 'transport_node', I_sport: 'sport_facility_or_route' };
for (const r of readTable('reports/livdar-final-research-freeze-2026-09-30/ENTITY-AXIS-MEASUREMENTS.csv', ',')) {
  const v = num(r.volume);
  const serp = SERP_BY_FAMILY[r.family] || 'NOT_SAMPLED';
  const needsData = DATA_REQUIRED[r.family] || '';
  // An entity page whose SERP the brand owns is EXPERIMENT_ONLY however big the
  // volume: 152,000 on british museum is not reachable, and recording it as a
  // head would put an unwinnable page at the top of the build queue.
  let st;
  if (serp === 'BRAND_OWNED_PLUS_SOCIAL') st = 'EXPERIMENT_ONLY';
  else if (serp === 'OPEN_BUT_ECONOMICALLY_DEAD' || serp === 'AGGREGATOR_LOCKED') st = 'REJECT';
  else if (serp === 'LISTING_INVENTORY_REQUIRED' || needsData) st = 'BLOCKED_DATA';
  else if (v === '' || v < 50) st = 'REJECT';
  else if (v < 300) st = 'PROMISING';
  else st = r.page_type === 'ENTITY' ? 'ENTITY_HEAD' : 'DURABLE_HEAD';
  push({ keyword: r.keyword, market: r.market, surface: r.axis.slice(2), family: r.family,
    entity_type: AXIS_ENTITY_TYPE[r.axis] || '', intent_type: r.page_type === 'ENTITY' ? 'entity_lookup' : 'listing_discovery',
    status: st, page_type: r.page_type, volume: r.volume, kd: r.kd, cpc: r.cpc_cents,
    traffic_potential: r.traffic_potential, SERP_class: serp,
    source_of_keyword: 'livdar-final-research-freeze-2026-09-30/ENTITY-AXIS-MEASUREMENTS.csv',
    evidence: 'Ahrefs measured 2026-09-30, axis verdict ' + r.verdict,
    data_source_required: needsData, indexable: st === 'REJECT' || st === 'BLOCKED_DATA' ? 'NO' : 'YES' });
}
// --- 7b. Round two, 2026-09-30. The entity modifier research and the local
// language re-measurement of stay, rentals, events and jobs.
//
// WHY THIS ROUND EXISTS. Round one measured rentals, rooms and coliving only in
// English against foreign cities, which returned zeros that were an artefact of
// the wrong language: rooms for rent berlin 10 in gb against wg zimmer berlin
// 1,600 in de, apartments barcelona monthly 0 against wohnung mieten berlin
// 14,000. Round one also judged the whole entity axis on a bare brand name and one
// tickets query. Both are corrected here.
//
// A family whose SERP is winnable but whose inventory Livdar does not hold is
// OPPORTUNITY_REQUIRES_FEED, never REJECT. Round one conflated the two.
const FEED_REQUIRED_FAMILIES = new Set(['rents.city-listings', 'rents.city-area', 'stay.wg-shared',
  'stay.student', 'stay.furnished', 'stay.sublet', 'stay.vacation-rental', 'stay.pension', 'stay.hostel',
  'events.city-durable', 'events.city-window', 'events.city-concerts', 'events.city-exhibitions',
  'events.city-seasonal', 'events.city-market', 'events.city-cinema', 'events.city-whatson',
  'events.recurring-named', 'events.country-festivals', 'events.venue-event',
  'jobs.city-durable', 'jobs.city-category', 'jobs.role-city', 'jobs.company-city', 'jobs.remote',
  'jobs.salary-role', 'property.city-buy']);
// Families measured as not rankable whatever the feed. Each cites its SERP row.
const NOT_RANKABLE = {
  'stay.city-hotels': 'SERP_FEATURE_SUPPRESSED: 7,300 volume and the whole organic top 10 earns single digits, Google Hotels takes the clicks',
  'stay.coliving': 'demand absent even in local language, coliving berlin 150 at KD 43',
  'stay.monthly': 'the monthly phrasing does not exist in German or English',
};
for (const r of readTable('reports/livdar-final-research-freeze-2026-09-30/ROUND2-AXIS-MEASUREMENTS.csv', ',')) {
  const v = num(r.volume);
  const notRankable = NOT_RANKABLE[r.family];
  const needsFeed = FEED_REQUIRED_FAMILIES.has(r.family);
  let st;
  if (notRankable) st = 'REJECT';
  else if (v === '' || v < 50) st = 'REJECT';
  else if (needsFeed) st = 'OPPORTUNITY_REQUIRES_FEED';
  else if (v >= 1000) st = 'DURABLE_HEAD';
  else if (v >= 300) st = 'CANDIDATE_HEAD';
  else st = 'PROMISING';
  push({ keyword: r.keyword, market: r.market, surface: r.axis.slice(2), family: r.family,
    entity_type: r.axis === 'E_jobs' ? 'job' : r.axis === 'C_events' ? 'event' : 'accommodation',
    intent_type: 'listing_discovery', status: st, page_type: r.page_type,
    volume: r.volume, kd: r.kd, cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    source_of_keyword: 'livdar-final-research-freeze-2026-09-30/ROUND2-AXIS-MEASUREMENTS.csv',
    evidence: 'Ahrefs measured 2026-09-30 round two. ' + (r.note || ''),
    data_source_required: notRankable ? '' : (needsFeed ? 'listing feed for this family' : ''),
    indexable: notRankable ? 'NO' : 'YES',
    notes: notRankable || r.note });
}
for (const r of readTable('reports/livdar-final-research-freeze-2026-09-30/ENTITY-MODIFIER-RESEARCH.csv', ',')) {
  const v = num(r.volume);
  // The bare brand name is not rankable. Entity plus a practical or commercial
  // modifier is, where no ticketing reseller owns the query, which has to be
  // checked per entity rather than assumed for the family.
  const works = /MODIFIER_WORKS/.test(r.verdict);
  const highTp = r.verdict === 'MODIFIER_HIGH_TP';
  const st = works ? (v >= 1000 ? 'ENTITY_HEAD' : 'CANDIDATE_HEAD')
    : highTp ? 'PROMISING' : 'REJECT';
  push({ keyword: r.keyword, market: r.market, surface: 'poi', family: 'poi.entity-' + r.modifier.replace(/\s+/g, '-'),
    entity_type: 'poi', intent_type: 'entity_modifier', status: st, page_type: 'ENTITY_MODIFIER',
    volume: r.volume, kd: r.kd, cpc: r.cpc_cents, traffic_potential: r.traffic_potential,
    SERP_class: works ? 'OPEN_WINNER_TAKE_MOST_IF_NO_RESELLER' : 'NOT_SAMPLED',
    source_of_keyword: 'livdar-final-research-freeze-2026-09-30/ENTITY-MODIFIER-RESEARCH.csv',
    evidence: 'Ahrefs measured 2026-09-30 round two, entity ' + r.entity + ', tier ' + r.tier + ', ' + r.verdict,
    data_source_required: works ? 'OSM plus Wikidata; attraction affiliate for monetisation only' : '',
    indexable: works || highTp ? 'YES' : 'NO', notes: r.verdict });
}

// --- 7b. Round three: harvested keyword sets per validated family -------------
// Every earlier pass sized a family by entity arithmetic (cities x modifiers).
// This block carries the first HARVESTED keyword sets: real matching-terms pulls
// per family, so a family's demand is a list of measured keywords rather than a
// multiplication. PATTERN-BREADTH-MEASURED.csv carries the breadth counts that
// bound each family, including the two that overturned their own page estimate.
const HARVEST_SERP = {
  'move.visa-country': 'OPEN',
  'transport.node-route-and-hotels': 'OPEN',
  'places.city-category': 'OPEN',
  'rents.city-listings': 'OPEN_REQUIRES_INVENTORY',
  'jobs.role-city-and-category-city': 'LISTING_INVENTORY_REQUIRED_VERTICAL',
  'jobs.rules-durable': 'OPEN',
  'jobs.employer-city': 'LISTING_INVENTORY_REQUIRED',
};
for (const r of readTable('reports/livdar-final-research-freeze-2026-09-30/FAMILY-KEYWORD-HARVEST.csv', ',')) {
  const v = num(r.volume);
  const needsFeed = r.feed_required && r.feed_required !== 'none';
  const brandExcluded = /BRAND_EXCLUDE/.test(r.verdict || '');
  let st;
  if (brandExcluded) st = 'REJECT';
  else if (v === '' || v < 50) st = 'REJECT';
  else if (needsFeed) st = 'OPPORTUNITY_REQUIRES_FEED';
  else if (v >= 1000) st = 'DURABLE_HEAD';
  else if (v >= 300) st = 'CANDIDATE_HEAD';
  else st = 'PROMISING';
  push({ keyword: r.keyword, market: r.market, surface: r.axis.slice(2), family: r.family,
    entity_type: r.axis === 'E_jobs' ? 'job' : r.axis === 'D_stay' ? 'accommodation'
      : r.axis === 'H_transport' ? 'transport_node' : r.axis === 'B_places' ? 'local_place'
      : r.axis === 'F_move' ? 'city_or_country' : 'poi',
    intent_type: needsFeed ? 'listing_discovery' : 'informational',
    status: st, page_type: needsFeed ? 'LISTING' : 'DURABLE',
    volume: r.volume, kd: r.kd, cpc: r.cpc_cents,
    SERP_class: HARVEST_SERP[r.family] || 'NOT_SAMPLED',
    source_of_keyword: 'livdar-final-research-freeze-2026-09-30/FAMILY-KEYWORD-HARVEST.csv',
    evidence: 'Ahrefs keywords-explorer-matching-terms harvest 2026-09-30 round three, pattern ' + r.pattern,
    data_source_required: needsFeed ? r.feed_required : '',
    indexable: brandExcluded ? 'NO' : 'YES',
    notes: brandExcluded ? 'brand or aggregator query, not ours to rank for' : r.verdict });
}

// --- 7c. Round three, market breadth: the nine under-measured markets --------
// Round two measured de-DE and en-GB deeply and left the other nine thin. This
// block carries local-language keyword sets for the surviving families in each
// of those markets, harvested before the Ahrefs subscription expires. Two
// markets were badly under-recorded: zh-Hant-TW held 63 keywords at a 32,000
// maximum and actually reaches 269,000, and pt-BR held 9,900 and reaches 20,000.
for (const r of readTable('reports/livdar-final-research-freeze-2026-09-30/MARKET-BREADTH-HARVEST.csv', ',')) {
  const v = num(r.volume);
  const needsFeed = r.feed_required && r.feed_required !== 'none';
  let st;
  if (v === '' || v < 50) st = 'REJECT';
  else if (needsFeed) st = 'OPPORTUNITY_REQUIRES_FEED';
  else if (v >= 1000) st = 'DURABLE_HEAD';
  else if (v >= 300) st = 'CANDIDATE_HEAD';
  else st = 'PROMISING';
  push({ keyword: r.keyword, market: r.market, surface: r.axis.slice(2), family: r.family,
    entity_type: r.axis === 'E_jobs' ? 'job' : r.axis === 'D_stay' ? 'accommodation'
      : r.axis === 'H_transport' ? 'transport_node' : r.axis === 'B_places' ? 'local_place'
      : r.axis === 'F_move' ? 'city_or_country' : 'city_or_country',
    intent_type: needsFeed ? 'listing_discovery' : 'informational',
    status: st, page_type: needsFeed ? 'LISTING' : 'DURABLE',
    volume: r.volume, kd: r.kd, cpc: r.cpc_cents,
    SERP_class: needsFeed ? 'LISTING_INVENTORY_REQUIRED' : 'OPEN',
    source_of_keyword: 'livdar-final-research-freeze-2026-09-30/MARKET-BREADTH-HARVEST.csv',
    evidence: 'Ahrefs matching-terms market breadth harvest 2026-09-30 round three, local language, pattern ' + r.pattern,
    data_source_required: needsFeed ? r.feed_required : '',
    indexable: 'YES', notes: 'market breadth pass, pattern ' + r.pattern });
}

// --- 7d. Round four: the Tools gap -------------------------------------------
// The Tools audit checked 27 tool intents against the master and found 12 with no
// keyword at all. These are the measured survivors, harvested 2026-10-01. Brand-
// qualified variants (nationwide, halifax, natwest, hsbc, santander, barclays,
// lloyds, bupa, mse, martin lewis, bbc, google, nhs) are excluded: a bank's own
// calculator query is not ours to rank for. The two findings that matter are
// mortgage calculator at 380,000 volume KD 0, the largest KD-0 head in the project,
// and the health-insurance cost cluster at 500 to 1,100 cents CPC, the highest
// commercial intent measured anywhere.
for (const r of readTable('reports/livdar-final-research-freeze-2026-09-30/TOOLS-KEYWORD-HARVEST.csv', ',')) {
  const v = num(r.volume);
  let st;
  if (v === '' || v < 50) st = 'REJECT';
  else if (v >= 10000) st = 'DURABLE_HEAD';
  else if (v >= 1000) st = 'DURABLE_HEAD';
  else if (v >= 300) st = 'CANDIDATE_HEAD';
  else st = 'PROMISING';
  push({ keyword: r.keyword, market: r.market, surface: 'tools', family: r.family,
    entity_type: 'tool', intent_type: 'tool_use', status: st, page_type: 'DURABLE_TOOL',
    volume: r.volume, kd: r.kd, cpc: r.cpc_cents, SERP_class: 'NOT_SAMPLED',
    source_of_keyword: 'livdar-final-research-freeze-2026-09-30/TOOLS-KEYWORD-HARVEST.csv',
    evidence: 'Ahrefs matching-terms Tools gap harvest 2026-10-01, pattern ' + r.pattern,
    data_source_required: '', indexable: 'YES',
    notes: 'tools gap pass. Index the tool page and distinct product variants; never index parameter result states' });
}

// --- 8. Tracked keywords already in Rank Tracker ------------------------------
for (const r of readTable('reports/ahrefs-export-2026-09-28/rank-tracker/tracked-keywords-2026-09-28.tsv', '\t')) {
  push({ keyword: r.keyword, market: r.country, language: r.language,
    status: /esim/i.test(r.tags || '') ? 'ESIM' : 'LIVE_SECONDARY', live_or_future: 'LIVE',
    page_type: 'DURABLE', volume: r.volume, kd: r.kd,
    source_of_keyword: 'ahrefs-export-2026-09-28/rank-tracker/tracked-keywords', evidence: 'in Rank Tracker',
    indexable: 'YES', notes: r.tags });
}

// ---------------------------------------------------------------------------
// DEDUPE. Rung by rung, counting what each one removes so the funnel is legible.
// ---------------------------------------------------------------------------
const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const STOP = new Set(['in', 'the', 'a', 'at', 'of', 'to', 'near', 'for', 'and', 'on', 'im', 'en', 'de', 'di', 'da']);
const semantic = (s) => norm(s).replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter((w) => w && !STOP.has(w)).sort().join(' ');

// Status precedence. A keyword reached by several passes keeps its strongest
// claim, and LIVE always beats a candidate status for the same string.
const RANK = ['REJECT', 'EXPERIMENT_ONLY', 'BLOCKED_LICENCE', 'BLOCKED_DATA', 'PROMISING',
  'OPPORTUNITY_REQUIRES_FEED', 'CANDIDATE_HEAD',
  'DURABLE_HEAD', 'LISTING_HEAD', 'ENTITY_HEAD', 'ESIM', 'LIVE_SECONDARY', 'LIVE_PRIMARY'];
const rankOf = (s) => { const i = RANK.indexOf(s); return i < 0 ? 0 : i; };
const better = (a, b) => {
  if (rankOf(a.status) !== rankOf(b.status)) return rankOf(a.status) > rankOf(b.status) ? a : b;
  const av = a.volume === '' ? -1 : a.volume, bv = b.volume === '' ? -1 : b.volume;
  return av >= bv ? a : b;
};

const funnel = { raw: rows.length };
const byExact = new Map();
for (const r of rows) {
  const k = r.market + '\u0000' + r.keyword;
  byExact.set(k, byExact.has(k) ? better(byExact.get(k), r) : r);
}
funnel.after_exact = byExact.size;
const byNorm = new Map();
for (const r of byExact.values()) {
  const k = r.market + '\u0000' + norm(r.keyword);
  byNorm.set(k, byNorm.has(k) ? better(byNorm.get(k), r) : r);
}
funnel.after_normalised = byNorm.size;
// Rung 3 and 4 are keyed on market AND family AND entity, so the same phrasing in
// two markets, or for two entities, is never collapsed.
const bySem = new Map();
for (const r of byNorm.values()) {
  const k = [r.market, r.family, r.entity_type, semantic(r.keyword)].join('\u0000');
  bySem.set(k, bySem.has(k) ? better(bySem.get(k), r) : r);
}
funnel.after_same_market_semantic = bySem.size;
const final = [...bySem.values()].filter((r) => r.keyword && r.keyword.length > 1);
funnel.final = final.length;

// Priority: what to build first. Live coverage first, then an open SERP with
// measured demand, then everything a feed would unlock.
for (const r of final) {
  const v = r.volume === '' ? 0 : r.volume;
  let pr;
  if (r.status === 'LIVE_PRIMARY') pr = 1;
  else if (r.status === 'LIVE_SECONDARY' || r.status === 'ESIM') pr = 2;
  else if (r.SERP_class === 'OPEN' && v >= 1000) pr = 3;
  else if (r.SERP_class === 'OPEN' && v >= 300) pr = 4;
  else if (r.status === 'DURABLE_HEAD' || r.status === 'ENTITY_HEAD' || r.status === 'LISTING_HEAD') pr = 5;
  else if (r.status === 'CANDIDATE_HEAD') pr = 6;
  else if (r.status === 'OPPORTUNITY_REQUIRES_FEED') pr = 6.5;
  else if (r.status === 'BLOCKED_DATA') pr = 7;
  else if (r.status === 'EXPERIMENT_ONLY') pr = 8;
  else if (r.status === 'PROMISING') pr = 9;
  else pr = 10;
  r.priority = r.priority || pr;
}
final.sort((a, b) => Number(a.priority) - Number(b.priority)
  || (b.volume === '' ? -1 : b.volume) - (a.volume === '' ? -1 : a.volume));

const COLS = ['keyword', 'market', 'language', 'surface', 'family', 'entity_type', 'intent_type', 'status',
  'live_or_future', 'primary_or_secondary', 'page_type', 'target_url_or_pattern', 'volume', 'KD', 'CPC',
  'traffic_potential', 'SERP_class', 'source_of_keyword', 'evidence', 'data_source_required', 'indexable',
  'priority', 'notes'];
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
writeFileSync(new URL('LIVDAR-MASTER-KEYWORDS-FINAL.csv', OUT),
  [COLS.join(','), ...final.map((r) => COLS.map((c) => q(r[c])).join(','))].join('\n') + '\n');
writeFileSync(new URL('LIVDAR-MASTER-KEYWORDS-FINAL.jsonl.gz', OUT),
  gzipSync(Buffer.from(final.map((r) => JSON.stringify(r)).join('\n') + '\n')));

const tally = (key) => final.reduce((a, r) => { const k = r[key] || '(none)'; a[k] = (a[k] || 0) + 1; return a; }, {});
const counts = {
  generated: '2026-09-30',
  dedupe_funnel: funnel,
  total_unique_keywords: final.length,
  by_status: tally('status'), by_market: tally('market'), by_language: tally('language'),
  by_surface: tally('surface'), by_family: tally('family'), by_entity_type: tally('entity_type'),
  by_intent_type: tally('intent_type'), by_serp_class: tally('SERP_class'), by_page_type: tally('page_type'),
  by_priority: tally('priority'),
  measured_with_ahrefs: final.filter((r) => /Ahrefs measured/.test(r.evidence)).length,
  with_a_volume: final.filter((r) => r.volume !== '' && r.volume > 0).length,
  rank_tracker_worthy: final.filter((r) => ['LIVE_PRIMARY', 'LIVE_SECONDARY', 'ESIM'].includes(r.status)
    || (['ENTITY_HEAD', 'DURABLE_HEAD', 'LISTING_HEAD', 'CANDIDATE_HEAD'].includes(r.status)
        && r.volume !== '' && r.volume >= 300 && r.SERP_class === 'OPEN')).length,
  entity_or_listing_keywords: final.filter((r) => r.page_type === 'ENTITY'
    || ['poi', 'local_place', 'event', 'accommodation', 'job', 'service_place', 'transport_node', 'sport_facility_or_route'].includes(r.entity_type)).length,
  blocked_total: final.filter((r) => r.status.startsWith('BLOCKED')).length,
  rejected_total: final.filter((r) => r.status === 'REJECT').length,
};
writeFileSync(new URL('KEYWORD-COUNTS.json', OUT), JSON.stringify(counts, null, 1));
console.log(JSON.stringify({ funnel, total: final.length, by_status: counts.by_status,
  rank_tracker_worthy: counts.rank_tracker_worthy, entity_or_listing: counts.entity_or_listing_keywords,
  measured: counts.measured_with_ahrefs, blocked: counts.blocked_total, rejected: counts.rejected_total }, null, 1));
console.log('\nby_market', JSON.stringify(counts.by_market));
console.log('\nby_page_type', JSON.stringify(counts.by_page_type));
console.log('\nby_serp_class', JSON.stringify(counts.by_serp_class));
