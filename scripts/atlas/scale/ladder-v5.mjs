// The scale ladder, version 5, 2026-09-30 pass two. This is the version to
// defend. It supersedes v1 to v4 and it lowers the number by an order of
// magnitude, because the measurement that arrived last invalidated the
// multiplier all the earlier versions rested on.
//
// WHAT WENT WRONG IN V1 TO V3, PLAINLY.
// They computed demand as (city families that pass) x (11,553 cities) x (11
// markets). That reached 581,471 and made 500k look settled. The multiplier was
// never measured, only assumed, and on 2026-09-30 it was measured and is false:
//   things to do in konstanz      20 in gb, against 400+ for the German phrasing
//   things to do in gottingen     20 in gb
//   things to do in middelburg     0 in gb, against 1,600 in nl
//   things to do in assen          0 in gb, against   700 in nl
//   restaurants konstanz           0 in gb, against   500 in de
//   gottingen hotels               0 in gb
//   things to do in spokane       60 in gb, against 4,000 in us
// A tail city carries its page set in the language of the place and nowhere
// else, so its families multiply by one market, not eleven.
//
// WHAT SURVIVES THE CORRECTION. Two families do cross language, and only for
// destination cities, measured in two markets:
//   activities  gb median ~1,400 (krakow 11,000, rome 8,900, porto 6,200)
//               de median ~7,000 (amsterdam 17,000, wien 17,000, prag 15,000)
//   stay        gb median ~1,400 (rome hotels 3,700), de ~2,050 (hotel prag 7,600)
// places does not cross in either market: restaurants rome 200 gb / 200 de,
// restaurants florence 100 gb, restaurants utrecht 40 gb, restaurants prag 500 de.
// And it fails for non-tourist tier 2: things to do in taichung 70, kaohsiung 70.
//
// A REQUIREMENT THIS TURNED UP. Cross-language pages must use the searcher's
// exonym, not the city's endonym: rom 11,000 vs roma 70, prag 15,000 vs praha 20,
// florenz 7,200 vs firenze 50. Generating the endonym loses 99 percent of it.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/livdar-master-seo-universe-2026-09-30/', ROOT);

const cities = (() => {
  const dir = new URL('data/atlas/entities/cities/', ROOT);
  let all = [];
  for (const f of readdirSync(dir)) {
    const d = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    all = all.concat(Array.isArray(d) ? d : (d.cities || []));
  }
  all.sort((a, b) => (b.population || 0) - (a.population || 0));
  all.forEach((c, i) => { c.tier = i < 560 ? 1 : i < 2951 ? 2 : i < 11553 ? 3 : 4; });
  return all;
})();
const count = (countries, tiers) => {
  const s = new Set(countries);
  return cities.filter((c) => s.has(c.country) && tiers.includes(c.tier)).length;
};

// Where each market measured. Not where its language is spoken: volume differs by
// up to 100x between two countries sharing a language, so only measured counts.
const HOME = { 'en-US': ['US'], 'en-GB': ['GB'], 'de-DE': ['DE'], 'fr-FR': ['FR'], 'nl-NL': ['NL'],
  'it-IT': ['IT'], 'es-ES': ['ES'], 'pl-PL': ['PL'], 'pt-BR': ['BR'], 'ja-JP': ['JP'], 'zh-Hant-TW': ['TW'] };
// Same language, other countries. Feeds the ceiling only.
const LANG = { 'en-US': ['US'],
  'en-GB': ['GB', 'IE', 'AU', 'NZ', 'CA', 'IN', 'PH', 'NG', 'ZA', 'KE', 'GH', 'SG', 'MY', 'PK'],
  'de-DE': ['DE', 'AT', 'CH'], 'fr-FR': ['FR', 'BE', 'LU', 'CH', 'SN', 'CI', 'CM', 'ML', 'BF', 'CD', 'MG'],
  'nl-NL': ['NL', 'BE'], 'it-IT': ['IT', 'CH'],
  'es-ES': ['ES', 'MX', 'AR', 'CO', 'PE', 'CL', 'VE', 'EC', 'GT', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY'],
  'pl-PL': ['PL'], 'pt-BR': ['BR', 'PT', 'AO', 'MZ'], 'ja-JP': ['JP'], 'zh-Hant-TW': ['TW', 'HK'] };

// Destination cities, the base the two cross-language families reach. Measured in
// Europe and Japan, where 33 of 35 sampled tier 1-2 cities cleared 250. Taiwan's
// tier 2 failed at 70, so the whole of Asia outside Japan stays out until probed.
const DESTINATION_COUNTRIES = ['IT', 'ES', 'FR', 'PT', 'NL', 'BE', 'DE', 'AT', 'CH', 'CZ', 'PL', 'HU',
  'DK', 'SE', 'NO', 'FI', 'IE', 'GB', 'GR', 'HR', 'SI', 'SK', 'EE', 'LV', 'LT', 'RO', 'BG', 'JP'];
const CROSS_LANGUAGE_FAMILIES = new Set(['activities.city-things-to-do', 'stay.city-type']);
const CROSS_LANGUAGE_MEASURED_IN = new Set(['en-GB', 'de-DE']);
const DESTINATION_CITIES = count(DESTINATION_COUNTRIES, [1, 2]);
// Tier 4 was probed in de and gb only. Every other market's tail stops at tier 3.
const TIER4_MEASURED_IN = new Set(['de-DE', 'en-GB']);

const rows = (() => {
  const t = readFileSync(new URL('TIER3-DEMAND-EXPERIMENT.csv', OUT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((l) => Object.fromEntries(cols.map((k, i) => [k, (l.split(',')[i] ?? '').trim()])));
})();
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const EXCLUDED = {
  'work.city-jobs': 'SERP aggregator locked, jobs lincoln is 100 percent job boards',
  'weather.city-best-time': 'SERP feature suppressed, knowledge card at 1 and no top 10 result under DR 72',
  'property.city-buy': 'SOURCE needs a live listings feed Livdar has not got',
  'route.city-pair': 'SERP aggregator locked, no top 10 result under DR 53',
};

const cellMap = new Map();
for (const r of rows) {
  const v = r.volume === '' ? null : Number(r.volume);
  if (v == null || !Number.isFinite(v)) continue;
  const k = r.family + '|' + r.market;
  if (!cellMap.has(k)) cellMap.set(k, { family: r.family, market: r.market, vols: [], t123: [], t4: [] });
  cellMap.get(k).vols.push(v);
  // Tier 3 and tier 4 are graded on their OWN rows. Pooling them let the tier 4
  // rows, which are smaller towns by construction, drag the tier 1-3 median down:
  // German activities read 100 and HEAD_ONLY on the pooled set while its tier 3
  // rows are several times that. One median per tier band, never one for both.
  if (r.tier === '4') cellMap.get(k).t4.push(v); else cellMap.get(k).t123.push(v);
}

const graded = [];
for (const c of cellMap.values()) {
  // Tier 1-3 is graded on tier 1-3 rows alone; tier 4 on tier 4 rows alone.
  const med = c.t123.length ? median(c.t123) : null;
  const reach = c.t123.length < 3 ? 'UNDER_SAMPLED' : med >= 300 ? 'TAIL' : med >= 50 ? 'HEAD_ONLY' : 'NONE';
  const excluded = EXCLUDED[c.family] || '';
  const counts = !excluded && (reach === 'TAIL' || reach === 'HEAD_ONLY');
  const t4med = c.t4.length >= 3 ? median(c.t4) : null;
  const t4ok = TIER4_MEASURED_IN.has(c.market) && t4med != null && t4med >= 300;
  let tiers = [];
  if (counts) tiers = reach === 'TAIL' ? (t4ok ? [1, 2, 3, 4] : [1, 2, 3]) : [1, 2];
  const home = counts ? count(HOME[c.market] || [], tiers) : 0;
  const lang = counts ? count(LANG[c.market] || [], tiers) : 0;
  // Cross-language reach: destination cities OUTSIDE this market's own countries.
  const crossEligible = counts && CROSS_LANGUAGE_FAMILIES.has(c.family);
  const crossBase = crossEligible
    ? DESTINATION_CITIES - count((HOME[c.market] || []).filter((x) => DESTINATION_COUNTRIES.includes(x)), [1, 2]) : 0;
  const crossMeasured = crossEligible && CROSS_LANGUAGE_MEASURED_IN.has(c.market) ? crossBase : 0;
  graded.push({ family: c.family, market: c.market, n: c.t123.length, median: med ?? '', reach,
    tier4_rows: c.t4.length, tier4_median: t4med ?? '', tier4_counted: t4ok ? 'yes' : '',
    tiers: tiers.join('+'), excluded, counts,
    pages_home_measured: home, pages_cross_language_measured: crossMeasured,
    pages_measured: home + crossMeasured,
    pages_ceiling: lang + (crossEligible ? crossBase : 0) });
}

const NON_CITY_VALIDATED = 8217;
// The one tail pattern that crosses language: "<city> <country>", one page per
// city. Measured in en only (nagano japan 800, vannes france 700, konstanz
// germany 300, hualien taiwan 100, middelburg netherlands 100).
const ORIENTATION_MEASURED = count(['DE', 'FR', 'NL', 'IT', 'ES', 'PL', 'JP', 'TW', 'BR'], [1, 2, 3]);
const ORIENTATION_CEILING = ORIENTATION_MEASURED * 11;

const measured = graded.reduce((t, c) => t + c.pages_measured, 0) + NON_CITY_VALIDATED + ORIENTATION_MEASURED;
const ceiling = graded.reduce((t, c) => t + c.pages_ceiling, 0) + NON_CITY_VALIDATED + ORIENTATION_CEILING;

const ladder = {
  generated: '2026-09-30 pass two, v5',
  supersedes: 'v1-v4. v3 reported 581,471 on an unmeasured 11-market multiplier that v5 measures and rejects.',
  keyword_rows_measured: rows.length,
  cross_language_rows_measured: readFileSync(new URL('CROSS-LANGUAGE-REACH.csv', OUT), 'utf8').trim().split('\n').length - 1,
  markets_measured: new Set(rows.map((r) => r.market)).size,
  families_probed: new Set(rows.map((r) => r.family)).size,
  cells_counting: graded.filter((c) => c.counts).length,
  cells_excluded_serp_or_source: graded.filter((c) => c.excluded).length,
  destination_cities_for_the_two_cross_language_families: DESTINATION_CITIES,
  cities_tier1_3_in_the_11_measured_countries: count(Object.values(HOME).flat(), [1, 2, 3]),
  cities_tier1_3_no_live_market_can_serve: 11553 - count(Object.values(HOME).flat(), [1, 2, 3]),
  cities_tier4_in_the_11_measured_countries: count(Object.values(HOME).flat(), [4]),
  A_source_obtainable: 3431138,
  B_source_backed_today: 1644451,
  C_demand_supported_measured: measured,
  C_demand_supported_ceiling: ceiling,
  D_publishable_now: 1791,
};
const verdict = (t) => measured >= t ? 'DEFENSIBLE' : ceiling >= t ? 'PROBABLE_BUT_UNPROVEN'
  : ladder.A_source_obtainable >= t ? 'NOT_DEFENSIBLE_ON_DEMAND' : 'NOT_DEFENSIBLE';
ladder.verdicts = Object.fromEntries([25000, 50000, 100000, 250000, 500000, 1000000].map((t) => [t, verdict(t)]));
ladder.shortfall_to_500k = Math.max(0, 500000 - measured);
ladder.shortfall_to_1m = Math.max(0, 1000000 - measured);
writeFileSync(new URL('SCALE-LADDER-V5.json', OUT), JSON.stringify({ ...ladder, cells: graded }, null, 1));
const cols = ['family', 'market', 'n', 'median', 'reach', 'tiers', 'tier4_rows', 'tier4_median', 'tier4_counted',
  'pages_home_measured', 'pages_cross_language_measured', 'pages_measured', 'pages_ceiling', 'excluded'];
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
writeFileSync(new URL('CELL-GATE.csv', OUT), [cols.join(','),
  ...graded.sort((a, b) => b.pages_measured - a.pages_measured).map((c) => cols.map((k) => q(c[k])).join(','))].join('\n') + '\n');

console.log('== TOP CELLS BY MEASURED PAGES');
for (const c of graded.filter((x) => x.counts).sort((a, b) => b.pages_measured - a.pages_measured).slice(0, 18))
  console.log('  ' + c.family.padEnd(30) + c.market.padEnd(12) + c.reach.padEnd(10) + c.tiers.padEnd(8)
    + ('home ' + c.pages_home_measured).padStart(11) + ('  cross ' + c.pages_cross_language_measured).padStart(13)
    + ('  = ' + c.pages_measured).padStart(10));
console.log('\n== LADDER V5');
for (const [k, v] of Object.entries(ladder)) if (k !== 'verdicts') console.log('  ' + k.padEnd(56) + String(v).padStart(10));
console.log('  verdicts ' + JSON.stringify(ladder.verdicts));
