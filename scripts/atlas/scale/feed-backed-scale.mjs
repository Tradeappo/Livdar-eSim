// CURRENT STATE against FEED-BACKED STATE, 2026-09-30 round two.
//
// WHAT THIS CORRECTS IN THE ROUND ONE MODEL.
// entity-scale-model.mjs set `indexable = 0` wherever Livdar had no feed, and then
// set `defensible = indexable`. That collapsed two different things: whether a
// page can rank, and whether Livdar happens to hold the data today. This model
// keeps them apart, which is what the round one numbers should have done:
//
//   DEMAND        the searches exist
//   RANKABLE      a site of achievable authority does rank on this SERP, measured
//   FEED          whether inventory is needed to be that site
//   CURRENT       rankable AND needs no feed Livdar lacks
//   FEED_BACKED   rankable, with the feed integrated
//
// The pages counted per family come from FEED-OPPORTUNITIES.csv, which carries the
// SERP row that justifies each one.

import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('../../../reports/livdar-final-research-freeze-2026-09-30/', import.meta.url);

// Each row: the SERP verdict, whether a feed is required, and the page count.
// `rankable` is a measured property of the SERP and never an assumption: it is
// true where a site at or below DR 65 earns real traffic on the page.
const FAMILIES = [
  { axis: 'B_places', family: 'places.city-category', pages: 6342, rankable: true, min_dr: 13,
    feed: null, serp: 'OPEN', note: 'DR 13 at position 5 earning 2148' },
  { axis: 'F_move', family: 'move.visa-country', pages: 1800, rankable: true, min_dr: 0,
    feed: null, serp: 'OPEN', note: 'highest CPC measured, 60 to 350 cents' },
  { axis: 'H_transport', family: 'transport.node-route-and-hotels', pages: 2000, rankable: true, min_dr: 0,
    feed: null, serp: 'OPEN', note: 'stansted to london TP 84000' },
  { axis: 'A_poi', family: 'atlas.city-family-carried-forward', pages: 29274, rankable: true, min_dr: 13,
    feed: null, serp: 'OPEN', note: 'carried forward from the market reach correction' },

  { axis: 'D_stay', family: 'rents.city-listings', pages: 26000, rankable: true, min_dr: 31,
    feed: 'rental listings feed', serp: 'OPEN_REQUIRES_INVENTORY',
    note: 'DR 43 takes 20374, more than ImmoScout24 at DR 88' },
  { axis: 'D_stay', family: 'stay.wg-student-furnished', pages: 9000, rankable: true, min_dr: 31,
    feed: 'student and shared housing feeds', serp: 'OPEN_REQUIRES_INVENTORY',
    note: 'wg zimmer hamburg 1700 KD 1, studentenwohnheim hamburg 2100 KD 0' },
  { axis: 'C_events', family: 'events.city-durable-window-concerts', pages: 11000, rankable: true, min_dr: 52,
    feed: 'licensed event feed', serp: 'COMPETITIVE_MID_AUTHORITY',
    note: 'veranstaltungen berlin 11000 KD 0, DR 70 earns 1275 and DR 52 ranks' },
  { axis: 'E_jobs', family: 'jobs.role-city-and-category-city', pages: 40000, rankable: true, min_dr: 17,
    feed: 'jobs feed', serp: 'LISTING_INVENTORY_REQUIRED_VERTICAL',
    note: 'builtinlondon DR 17 at position 5, pflegia DR 33 at position 7. VERTICAL cuts only' },
  { axis: 'D_stay', family: 'property.city-buy', pages: 10000, rankable: true, min_dr: 7,
    feed: 'property listings feed', serp: 'OPEN_REQUIRES_INVENTORY',
    note: 'DR 7 at position 3 earning 1591' },
  { axis: 'A_poi', family: 'poi.entity-tickets', pages: 22000, rankable: true, min_dr: 33,
    feed: 'attraction affiliate for monetisation only, not for ranking', serp: 'OPEN_WINNER_TAKE_MOST',
    note: 'DR 33 with zero refdomains takes 18104. Select per entity: fails where a reseller owns the query' },
  { axis: 'A_poi', family: 'poi.entity-parking', pages: 3000, rankable: true, min_dr: 51,
    feed: null, serp: 'COMPETITIVE_MID_AUTHORITY',
    note: 'JustPark 710, YourParkingSpace 224, greenwichpeninsula 406. Needs about DR 50' },

  // Measured and NOT rankable. Kept in the model so the exclusion is visible.
  { axis: 'D_stay', family: 'stay.city-hotels', pages: 3171, rankable: false, min_dr: 32,
    feed: 'rates feed does not help', serp: 'SERP_FEATURE_SUPPRESSED',
    note: 'whole organic top 10 earns single digits on 7300 volume. Google Hotels takes it' },
  { axis: 'C_events', family: 'events.venue-event', pages: 5000, rankable: false, min_dr: 0,
    feed: 'ticketing inventory', serp: 'OPEN_BUT_ECONOMICALLY_DEAD',
    note: 'everything below position 1 earns 72 clicks on 3900 volume' },
  { axis: 'H_transport', family: 'route.city-pair', pages: 2000, rankable: false, min_dr: 53,
    feed: 'timetable feed', serp: 'AGGREGATOR_LOCKED', note: 'nothing under DR 53' },
  { axis: 'G_services', family: 'weather.city', pages: 10815, rankable: false, min_dr: 72,
    feed: null, serp: 'SERP_FEATURE_SUPPRESSED', note: 'nothing under DR 72' },
  { axis: 'I_sport', family: 'sport.routes-and-facilities', pages: 3171, rankable: false, min_dr: null,
    feed: null, serp: 'NO_DEMAND', note: 'running routes lisbon 10, surf spots portugal 30' },
  { axis: 'G_services', family: 'services.schools-hospitals', pages: 6342, rankable: false, min_dr: null,
    feed: null, serp: 'NO_DEMAND', note: 'english speaking doctor berlin 0, private hospitals london 450 at KD 80' },
  { axis: 'A_poi', family: 'poi.entity-bare-brand', pages: 193000, rankable: false, min_dr: 0,
    feed: null, serp: 'BRAND_OWNED_PLUS_SOCIAL', note: 'the bare name goes to the entity plus knowledge panel plus social' },
];

const sum = (f) => FAMILIES.filter(f).reduce((a, r) => a + r.pages, 0);
const demand = FAMILIES.reduce((a, r) => a + r.pages, 0);
const rankableAll = sum((r) => r.rankable);
const current = sum((r) => r.rankable && !r.feed);
// A feed listed as monetisation only does not gate ranking, so entity tickets
// counts as CURRENT for rankability even though the affiliate adds revenue.
const currentIncludingAffiliateOnly = sum((r) => r.rankable && (!r.feed || /monetisation only/.test(r.feed)));
const feedBacked = rankableAll;

const CURRENT = {
  source_backed: 2883978,
  demand_supported: 1656362,
  rankable: currentIncludingAffiliateOnly,
  indexable: currentIncludingAffiliateOnly,
  publishable_today: 1791,
};
const FEED_BACKED = {
  source_backed: 2883978 + 47000000,      // plus the listing records a feed brings
  demand_supported: 1656362,
  rankable: feedBacked,
  indexable: feedBacked,
  realistic_url_universe: feedBacked + sum((r) => !r.rankable) * 0,   // unrankable families contribute nothing
};

const th = [100000, 250000, 500000, 1000000, 3000000];
const scen = (total, target) => total >= target ? 'YES' : 'NO';
const thresholds = Object.fromEntries(th.map((t) => [t, {
  current: scen(CURRENT.indexable, t),
  feed_backed: scen(FEED_BACKED.indexable, t),
  shortfall_current: Math.max(0, t - CURRENT.indexable),
  shortfall_feed_backed: Math.max(0, t - FEED_BACKED.indexable),
}]));

const out = {
  generated: '2026-09-30 round two',
  corrects: 'entity-scale-model.mjs set indexable to 0 wherever a feed was missing and defensible equal to indexable. This model separates rankable from feed-held.',
  demand_supported_all_families: demand,
  rankable_families: FAMILIES.filter((r) => r.rankable).length,
  not_rankable_families: FAMILIES.filter((r) => !r.rankable).length,
  pages_rankable_no_feed_needed: current,
  pages_rankable_affiliate_only: currentIncludingAffiliateOnly - current,
  pages_rankable_requires_feed: feedBacked - currentIncludingAffiliateOnly,
  pages_measured_not_rankable: sum((r) => !r.rankable),
  CURRENT, FEED_BACKED, thresholds,
  families: FAMILIES,
};
writeFileSync(new URL('FEED-BACKED-SCALE.json', OUT), JSON.stringify(out, null, 1));

console.log('== FAMILIES, rankable first');
for (const r of [...FAMILIES].sort((a, b) => (b.rankable - a.rankable) || b.pages - a.pages))
  console.log('  ' + (r.rankable ? 'RANK ' : 'NO   ') + String(r.pages).padStart(7) + '  '
    + r.family.padEnd(36) + ('minDR ' + (r.min_dr ?? 'n/a')).padEnd(11) + (r.feed ? 'FEED: ' + r.feed : 'no feed needed'));
console.log('\n== CURRENT');
for (const [k, v] of Object.entries(CURRENT)) console.log('  ' + k.padEnd(28) + String(v).padStart(10));
console.log('\n== FEED-BACKED');
for (const [k, v] of Object.entries(FEED_BACKED)) console.log('  ' + k.padEnd(28) + String(v).padStart(10));
console.log('\n== THRESHOLDS  current / feed-backed');
for (const [t, v] of Object.entries(thresholds))
  console.log('  ' + String(t).padStart(8) + '   ' + v.current.padEnd(4) + ' / ' + v.feed_backed.padEnd(4)
    + '   short current ' + String(v.shortfall_current).padStart(8) + '   short feed ' + String(v.shortfall_feed_backed).padStart(8));
