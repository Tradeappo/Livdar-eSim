// The entity and listing scale model, 2026-09-30 final.
//
// This is the arithmetic for the axes the city x family model could never reach.
// It keeps five quantities apart, and the gap between them is the whole finding:
//   RAW            entities that exist in the world
//   OBTAINABLE     entities Livdar could get from a named lawful source
//   SOURCE_BACKED  entities Livdar could get AND has enough fields to write a page
//   DEMAND         of those, the ones with measured search demand
//   INDEXABLE      of those, the ones whose SERP Livdar can actually win
//
// The collapse happens between SOURCE_BACKED and INDEXABLE, not at RAW. There are
// 8.9 million obtainable POIs in the eleven markets. Almost none of them are
// indexable, because the entity SERP belongs to the entity.

import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/livdar-final-research-freeze-2026-09-30/', ROOT);
const csv = (name) => {
  const t = readFileSync(new URL(name, OUT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((l) => Object.fromEntries(cols.map((c, i) => [c, (l.split(',')[i] ?? '').trim()])));
};
const entities = csv('ENTITY-UNIVERSE.csv');
const sumBy = (axis) => entities.filter((e) => e.axis === axis)
  .reduce((a, e) => ({ raw: a.raw + Number(e.global_count_verified), obt: a.obt + Number(e.obtainable_11_markets) }), { raw: 0, obt: 0 });

// Servable cities, carried forward from the market-reach correction of the same
// date. A tail entity is served in the language of its place, so the multiplier
// is one market, not eleven.
const CITIES_T13_SERVABLE = 3171;
const CITIES_T14_SERVABLE = 10815;
const DESTINATION_CITIES = 333;

// ---------------------------------------------------------------------------
// One row per axis. `demand_verdict` and `indexable_verdict` cite the measurement
// that decided them, never an opinion.
// ---------------------------------------------------------------------------
const AXES = [
  { axis: 'A_poi', label: 'POI, landmarks, attractions, museums, beaches, malls, parks, viewpoints',
    entity_page: { source_backed_share: 0.30, demand: 'YES_HUGE', indexable: 'NO' },
    entity_evidence: 'british museum 152,000, wembley stadium 102,000, tate modern 90,000, edinburgh castle 85,000 at KD 0',
    indexable_reason: 'edinburgh castle SERP is the official site at 1 and a knowledge panel at 2, then TripAdvisor forum, Facebook, YouTube, Instagram. alhambra tickets is AI overview plus official at 2 4 6 7 8 with Tiqets at DR 83 taking 42 clicks at position 9',
    durable_pages: 3171 * 3, durable_demand: 'TIER1_ONLY',
    durable_evidence: 'museums in london 12,000 and rooftop bars london 11,000, against museums in rome 400, nightlife madrid 70, gyms in berlin 30, viewpoints lisbon 10',
    durable_indexable: 'PARTIAL', source: 'OPEN_DATA OpenStreetMap plus Wikidata', licence: 'ODbL 1.0 share-alike' },
  { axis: 'B_places', label: 'Restaurants, cafes, bars, gyms, coworking, nightclubs, malls, spas as entities',
    entity_page: { source_backed_share: 0.15, demand: 'YES_FOR_BRANDS_ONLY', indexable: 'NO' },
    entity_evidence: 'dishoom covent garden 21,000, sketch london 12,000, puregym london 2,300. These are brand searches, and an unbranded restaurant has no query',
    indexable_reason: 'a named venue query is answered by the venue site plus Google Business Profile. The local pack takes the top slot',
    durable_pages: 3171 * 2, durable_demand: 'YES',
    durable_evidence: 'restaurants lincoln 2,700 at tier 3 and the SERP is OPEN: DR 13 at position 5 earning 2,148 while TripAdvisor at DR 91 takes 337',
    durable_indexable: 'YES', source: 'OPEN_DATA OpenStreetMap', licence: 'ODbL 1.0 share-alike' },
  { axis: 'C_events', label: 'Concerts, festivals, sport, conferences, exhibitions, venue x event, city x window',
    entity_page: { source_backed_share: 0, demand: 'YES', indexable: 'NO' },
    entity_evidence: 'glastonbury 2026 37,000, oktoberfest 2026 7,300 at KD 0',
    indexable_reason: 'no lawful feed held. Eventbrite, Meetup, Fever and Ticketmaster are explicitly out of scope for this project, and an individual event page expires',
    durable_pages: 3171 + 2000, durable_demand: 'YES',
    durable_evidence: 'whats on in london 4,600 at KD 0, london events today 2,200 at KD 0, events in london this weekend TP 60,000, o2 arena events 3,900 at KD 0 TP 13,000, wembley events TP 31,000',
    durable_indexable: 'NO', source: 'NO_LAWFUL_ROUTE for listings, PARTNER_FEED would be needed', licence: 'n/a' },
  { axis: 'D_stay', label: 'Hotels, apartments, hostels, guest houses, student, coliving, rooms, vacation rentals',
    entity_page: { source_backed_share: 0.10, demand: 'AGGREGATOR_OWNED', indexable: 'NO' },
    entity_evidence: 'a named hotel query is owned by the hotel plus Booking. Not measured separately this pass because the SERP outcome is not in doubt',
    indexable_reason: 'Booking, Expedia and the property own the branded query. No lawful rate or availability feed is held',
    durable_pages: 1000 + 500 + 3171, durable_demand: 'NODE_AND_STUDENT_ONLY',
    durable_evidence: 'hotels near gatwick airport 3,200 at KD 0, hotels near kings cross 1,300 at KD 2, student accommodation london 4,800, manchester 3,000. Against hotels near colosseum 150 at KD 93, coliving lisbon 90, monthly rentals lisbon 30, apartments barcelona monthly 0',
    durable_indexable: 'PARTIAL', source: 'AFFILIATE for rates, OPEN_DATA for the node geography', licence: 'affiliate terms plus ODbL' },
  { axis: 'E_jobs', label: 'Job listings, role x city, company x city, industry, remote, visa sponsorship, salary',
    entity_page: { source_backed_share: 0, demand: 'YES', indexable: 'NO' },
    entity_evidence: 'an individual vacancy has no durable query and expires in weeks',
    indexable_reason: 'no jobs feed held',
    durable_pages: 500 * 3171, durable_demand: 'YES_BUT_THIN',
    durable_evidence: 'product manager jobs london 600 at KD 0, nurse jobs london 600, software engineer jobs london 500, amazon jobs london 3,200 TP 168,000, nhs jobs london 2,300 TP 415,000',
    durable_indexable: 'NO', source: 'NO_LAWFUL_ROUTE held. COMMERCIAL_API or PARTNER_FEED would be needed', licence: 'n/a' },
  { axis: 'F_move', label: 'Visas, residency, tax, banking, healthcare, schools, utilities, relocation procedures',
    entity_page: { source_backed_share: 0, demand: 'NO', indexable: 'n/a' },
    entity_evidence: 'there is no entity to page. A procedure is a durable page by nature',
    indexable_reason: 'n/a',
    durable_pages: 45 * 40, durable_demand: 'YES',
    durable_evidence: 'uk spouse visa 4,800, portugal golden visa 1,700 at KD 0, spain digital nomad visa 1,100 at KD 0, moving to spain 1,100, d7 visa portugal 1,000 at KD 0, nie number spain 800 at KD 0. CPC 60 to 350 cents',
    durable_indexable: 'YES', source: 'GOVERNMENT official immigration and tax portals', licence: 'mostly reusable with attribution, per country' },
  { axis: 'G_services', label: 'Schools, universities, hospitals, clinics, dentists, pharmacies, childcare, government',
    entity_page: { source_backed_share: 0.20, demand: 'LOW', indexable: 'NO' },
    entity_evidence: 'not measured as entities. The durable form measured weak, so the entity form was not worth a spend',
    indexable_reason: 'a named school or hospital is owned by its own site, and the local pack takes the top slot',
    durable_pages: 3171 * 2, durable_demand: 'WEAK',
    durable_evidence: 'private hospitals london 450 at KD 80, international schools dubai 150 at KD 68, universities in netherlands 150. english speaking doctor berlin 0 and english speaking dentist amsterdam 0',
    durable_indexable: 'NO', source: 'OPEN_DATA OpenStreetMap plus GOVERNMENT school registers', licence: 'ODbL plus per country open licences' },
  { axis: 'H_transport', label: 'Airports, stations, metro, bus and ferry terminals, parking, node x route',
    entity_page: { source_backed_share: 0.40, demand: 'YES', indexable: 'NO' },
    entity_evidence: 'kings cross station 32,000 at KD 0, heathrow terminal 5 32,000',
    indexable_reason: 'the operator owns the node query. National Rail and the airport site answer it',
    durable_pages: 1000 * 2, durable_demand: 'YES',
    durable_evidence: 'gatwick to london 2,900 TP 33,000, stansted to london 2,800 TP 84,000, barcelona airport to city centre 900 at KD 0, cdg to paris 450',
    durable_indexable: 'PARTIAL', source: 'OPEN_DATA OpenStreetMap plus OurAirports', licence: 'ODbL plus public domain' },
  { axis: 'I_sport', label: 'Running, cycling, hiking routes, surf, dive, sail spots, gyms, stadiums, courts, pools',
    entity_page: { source_backed_share: 0.50, demand: 'NO', indexable: 'NO' },
    entity_evidence: 'not measured as entities because every durable form measured dead',
    indexable_reason: 'n/a, the demand is not there to begin with',
    durable_pages: 3171, durable_demand: 'NO',
    durable_evidence: 'running routes lisbon 10, surf spots portugal 30, cycling routes mallorca 40, padel barcelona 50, diving gozo 50. Only tennis courts london 800 at KD 0 and hiking madeira 350 clear anything',
    durable_indexable: 'NO', source: 'OPEN_DATA OpenStreetMap route relations', licence: 'ODbL 1.0 share-alike' },
];

const ENTITY_ROWS = [], DURABLE_ROWS = [], LISTING_ROWS = [];
let tot = { raw: 0, obtainable: 0, source_backed: 0, demand: 0, indexable: 0 };

for (const a of AXES) {
  const s = sumBy(a.axis);
  const sb = Math.round(s.obt * a.entity_page.source_backed_share);
  // Entity demand counts only where a measured entity query exists. Brand queries
  // exist for a small head of entities, not for the long tail: there is no query
  // for an unnamed restaurant. 2 percent is the share used, and it is a ceiling.
  const entityDemand = ['YES_HUGE', 'YES_FOR_BRANDS_ONLY', 'YES'].includes(a.entity_page.demand) ? Math.round(sb * 0.02) : 0;
  const entityIndexable = a.entity_page.indexable === 'YES' ? entityDemand : 0;
  ENTITY_ROWS.push({ axis: a.axis, label: a.label, page_class: 'ENTITY',
    raw_global: s.raw, obtainable_11_markets: s.obt, source_backed: sb,
    demand_supported: entityDemand, indexable: entityIndexable,
    demand_verdict: a.entity_page.demand, indexable_verdict: a.entity_page.indexable,
    lifecycle: 'DURABLE_ENTITY', expiry_strategy: 'entity closes: keep the page, mark permanently closed, keep indexed',
    evidence: a.entity_evidence, blocker: a.indexable_reason, source_class: a.source, licence: a.licence });
  tot.raw += s.raw; tot.obtainable += s.obt; tot.source_backed += sb;
  tot.demand += entityDemand; tot.indexable += entityIndexable;

  const dDemand = a.durable_demand === 'YES' ? a.durable_pages
    : a.durable_demand === 'TIER1_ONLY' ? 560 * 3
    : a.durable_demand === 'NODE_AND_STUDENT_ONLY' ? 1500
    : a.durable_demand === 'YES_BUT_THIN' ? a.durable_pages
    : a.durable_demand === 'WEAK' ? 0 : 0;
  const dIndexable = a.durable_indexable === 'YES' ? dDemand
    : a.durable_indexable === 'PARTIAL' ? Math.round(dDemand * 0.3) : 0;
  DURABLE_ROWS.push({ axis: a.axis, label: a.label, page_class: 'DURABLE_PARENT',
    url_potential: a.durable_pages, demand_supported: dDemand, indexable: dIndexable,
    demand_verdict: a.durable_demand, indexable_verdict: a.durable_indexable,
    lifecycle: 'PERMANENT', expiry_strategy: 'never expires. The page is the query, the contents refresh under it',
    evidence: a.durable_evidence, blocker: a.durable_indexable === 'NO' ? a.source : '',
    source_class: a.source, licence: a.licence });
  tot.demand += dDemand; tot.indexable += dIndexable;
}

// Listing pages, kept separate because they expire and an entity page does not.
for (const l of [
  { axis: 'E_jobs', listing: 'individual job vacancy', raw_global: 30000000, obtainable: 0, lifecycle: 'EXPIRES_2_TO_8_WEEKS',
    expiry: 'expired vacancy: 410 Gone plus removal from the sitemap, or noindex and redirect to the role x city durable parent. Never leave it 200 with stale content',
    indexable: 'NO', blocker: 'no jobs feed held. Google also requires JobPosting structured data with a validThrough date' },
  { axis: 'C_events', listing: 'individual event occurrence', raw_global: 5000000, obtainable: 0, lifecycle: 'EXPIRES_ON_EVENT_DATE',
    expiry: 'past event: keep the page if it recurs annually and roll the year, otherwise redirect to the venue or city durable parent. Archive only where the event has lasting interest',
    indexable: 'NO', blocker: 'no lawful event feed. The four obvious sources are out of scope for this project' },
  { axis: 'D_stay', listing: 'individual property or rate', raw_global: 8000000, obtainable: 0, lifecycle: 'EXPIRES_CONTINUOUSLY',
    expiry: 'delisted property: 410 plus sitemap removal, and redirect to the area durable parent',
    indexable: 'NO', blocker: 'no rate or availability feed. Affiliate terms generally forbid caching rates' },
  { axis: 'D_stay', listing: 'individual rental or room', raw_global: 4000000, obtainable: 0, lifecycle: 'EXPIRES_2_TO_6_WEEKS',
    expiry: 'as above, 410 and redirect to the area parent',
    indexable: 'NO', blocker: 'no rental listings feed' },
]) LISTING_ROWS.push({ ...l, source_backed: 0, demand_supported: 0 });

const write = (name, rowsArr) => {
  const cols = [...new Set(rowsArr.flatMap((r) => Object.keys(r)))];
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  writeFileSync(new URL(name, OUT), [cols.join(','), ...rowsArr.map((r) => cols.map((c) => q(r[c])).join(','))].join('\n') + '\n');
};
write('ENTITY-UNIVERSE-BY-AXIS.csv', ENTITY_ROWS);
write('DURABLE-PAGE-UNIVERSE.csv', DURABLE_ROWS);
write('LISTING-UNIVERSE.csv', LISTING_ROWS);

// The city x family durable universe, carried forward unchanged from the
// market-reach correction earlier the same day. Not recomputed here.
const CITY_FAMILY_DEMAND = 29274;
const CITY_FAMILY_CEILING = 76308;

const funnel = {
  raw_entity_and_listing_universe: tot.raw + LISTING_ROWS.reduce((a, l) => a + l.raw_global, 0),
  raw_poi_entities_verified_osm: tot.raw,
  raw_listing_records_estimated: LISTING_ROWS.reduce((a, l) => a + l.raw_global, 0),
  source_obtainable: tot.obtainable,
  source_backed: tot.source_backed,
  seo_demand_supported_entity_and_listing_axes: tot.demand,
  indexable_entity_and_listing_axes: tot.indexable,
  plus_city_family_durable_demand_supported: CITY_FAMILY_DEMAND,
  total_demand_supported_all_axes: tot.demand + CITY_FAMILY_DEMAND,
  total_indexable_all_axes: tot.indexable + CITY_FAMILY_DEMAND,
  publishable_now: 1791,
};
const th = [100000, 250000, 500000, 1000000, 3000000, 10000000];
funnel.thresholds = Object.fromEntries(th.map((t) => [t, {
  possible_arithmetically: funnel.raw_entity_and_listing_universe >= t ? 'YES' : 'NO',
  source_obtainable: funnel.source_obtainable >= t ? 'YES' : 'NO',
  source_backed: funnel.source_backed >= t ? 'YES' : 'NO',
  demand_supported: funnel.total_demand_supported_all_axes >= t ? 'YES' : 'NO',
  indexable: funnel.total_indexable_all_axes >= t ? 'YES' : 'NO',
  defensible: funnel.total_indexable_all_axes >= t ? 'YES' : 'NO',
}]));
writeFileSync(new URL('SCALE-FINAL.json', OUT), JSON.stringify(funnel, null, 1));

console.log('== ENTITY PAGES BY AXIS');
for (const r of ENTITY_ROWS) console.log('  ' + r.axis.padEnd(12) + ('raw ' + r.raw_global).padStart(14)
  + ('  obt ' + r.obtainable_11_markets).padStart(14) + ('  backed ' + r.source_backed).padStart(16)
  + ('  demand ' + r.demand_supported).padStart(14) + ('  idx ' + r.indexable).padStart(10) + '  ' + r.indexable_verdict);
console.log('\n== DURABLE PAGES BY AXIS');
for (const r of DURABLE_ROWS) console.log('  ' + r.axis.padEnd(12) + ('urls ' + r.url_potential).padStart(14)
  + ('  demand ' + r.demand_supported).padStart(16) + ('  idx ' + r.indexable).padStart(12) + '  ' + r.demand_verdict + ' / ' + r.indexable_verdict);
console.log('\n== FUNNEL');
for (const [k, v] of Object.entries(funnel)) if (k !== 'thresholds') console.log('  ' + k.padEnd(52) + String(v).padStart(12));
console.log('\n== THRESHOLDS');
for (const [t, v] of Object.entries(funnel.thresholds)) console.log('  ' + String(t).padStart(9) + '  ' + JSON.stringify(v));
