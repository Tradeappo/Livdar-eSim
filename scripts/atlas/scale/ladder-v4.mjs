// The scale ladder, version 4, 2026-09-30 pass two, second half.
//
// WHAT V4 CORRECTS, AND WHY IT LOWERS THE NUMBER.
// Versions 1 to 3 multiplied every city family by 11 markets. That assumed a
// city carries its families in all eleven languages. Measurement on 2026-09-30
// showed it does not: in the gb market "things to do in konstanz" is 20,
// "things to do in gottingen" 20, "things to do in middelburg" 0, "things to do
// in assen" 0, "restaurants konstanz" 0 and "gottingen hotels" 0, against three
// and four figure volumes for the same intents in those cities' own languages.
// Even "things to do in spokane" measures 60 in gb against 4,000 in us, so the
// effect is the searcher's market and not only the language.
//
// So the multiplier is not 11. A tail city carries its families in the language
// of the place, and the eleven markets do not reach every place: 8,335 of the
// 11,553 tier 1-3 cities sit in China, India, Russia, Indonesia, Turkey and
// elsewhere that none of the eleven serve. The only cross-language pattern that
// survived is "<city> <country>" (nagano japan 800, vannes france 700, konstanz
// germany 300), an orientation intent worth one page per city, not a family set.
//
// Tier 1 is the exception. Those are the global destinations, and the pass one
// measurements already showed their families carry in many languages, which is
// why tier 1 keeps a multiplier and the tail does not.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url);
const OUT = new URL('reports/livdar-master-seo-universe-2026-09-30/', ROOT);

// --- entities, by tier and by the language that a page for them must be in ----
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

// The country set a market MEASURED in. Nothing is assumed beyond where a
// keyword was actually joined to a country, because volume differs by up to 100x
// between two countries sharing a language.
const MEASURED_COUNTRIES = {
  'en-US': ['US'], 'en-GB': ['GB'], 'de-DE': ['DE'], 'fr-FR': ['FR'], 'nl-NL': ['NL'],
  'it-IT': ['IT'], 'es-ES': ['ES'], 'pl-PL': ['PL'], 'pt-BR': ['BR'], 'ja-JP': ['JP'],
  'zh-Hant-TW': ['TW'],
};
// The country set the market's LANGUAGE could serve, if each were measured. This
// feeds the ceiling only, never the measured figure.
const LANGUAGE_COUNTRIES = {
  'en-US': ['US'],
  'en-GB': ['GB', 'IE', 'AU', 'NZ', 'CA', 'IN', 'PH', 'NG', 'ZA', 'KE', 'GH', 'SG', 'MY', 'PK', 'TZ', 'UG', 'ZW', 'ZM', 'JM', 'TT'],
  'de-DE': ['DE', 'AT', 'CH'],
  'fr-FR': ['FR', 'BE', 'LU', 'CH', 'SN', 'CI', 'CM', 'ML', 'BF', 'NE', 'TD', 'CD', 'CG', 'GA', 'BJ', 'TG', 'GN', 'MG', 'HT'],
  'nl-NL': ['NL', 'BE', 'SR'],
  'it-IT': ['IT', 'CH', 'SM'],
  'es-ES': ['ES', 'MX', 'AR', 'CO', 'PE', 'CL', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY'],
  'pl-PL': ['PL'],
  'pt-BR': ['BR', 'PT', 'AO', 'MZ'],
  'ja-JP': ['JP'],
  'zh-Hant-TW': ['TW', 'HK', 'MO'],
};
const countCities = (countries, tiers) => {
  const s = new Set(countries);
  return cities.filter((c) => s.has(c.country) && tiers.includes(c.tier)).length;
};

// --- the cell gate, unchanged from v3 ----------------------------------------
const rows = (() => {
  const t = readFileSync(new URL('TIER3-DEMAND-EXPERIMENT.csv', OUT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((l) => Object.fromEntries(cols.map((k, i) => [k, (l.split(',')[i] ?? '').trim()])));
})();
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const EXCLUDED = {
  'work.city-jobs': 'SERP AGGREGATOR_LOCKED',
  'weather.city-best-time': 'SERP FEATURE_SUPPRESSED, no top 10 result under DR 72',
  'property.city-buy': 'SOURCE needs a live listings feed',
  'route.city-pair': 'SERP AGGREGATOR_LOCKED, no top 10 result under DR 53',
};
const cells = new Map();
for (const r of rows) {
  const v = r.volume === '' ? null : Number(r.volume);
  if (v == null || !Number.isFinite(v)) continue;
  const k = r.family + '|' + r.market;
  if (!cells.has(k)) cells.set(k, { family: r.family, market: r.market, vols: [] });
  cells.get(k).vols.push(v);
}
const graded = [...cells.values()].map((c) => {
  const med = median(c.vols);
  const reach = c.vols.length < 3 ? 'UNDER_SAMPLED' : med >= 300 ? 'TAIL' : med >= 50 ? 'HEAD_ONLY' : 'NONE';
  const excluded = EXCLUDED[c.family] || '';
  const counts = !excluded && (reach === 'TAIL' || reach === 'HEAD_ONLY');
  // Tiers this cell may claim, IN ITS OWN MARKET'S COUNTRIES ONLY.
  const tiers = !counts ? [] : reach === 'TAIL' ? [1, 2, 3, 4] : [1, 2];
  const measuredPages = !counts ? 0 : countCities(MEASURED_COUNTRIES[c.market] || [], tiers);
  const languagePages = !counts ? 0 : countCities(LANGUAGE_COUNTRIES[c.market] || [], tiers);
  return { ...c, n: c.vols.length, median: med, reach, excluded, counts, tiers: tiers.join('+'),
    pages_measured_countries: measuredPages, pages_language_countries: languagePages };
});

// Tier 4 is claimed only where it was measured. It was measured in de and gb on
// 2026-09-30 (Ravensburg, Kleve, Hof, Peine, Leonberg, Bad Oeynhausen, Banbury,
// Altrincham, Bridgend, Llanelli) and it held for four of five core families in
// de and three of five in gb. Every other market's tail claim stops at tier 3
// until the same probe runs there.
const TIER4_MEASURED_MARKETS = new Set(['de-DE', 'en-GB']);
for (const c of graded) {
  if (c.tiers === '1+2+3+4' && !TIER4_MEASURED_MARKETS.has(c.market)) {
    c.tiers = '1+2+3';
    c.pages_measured_countries = countCities(MEASURED_COUNTRIES[c.market] || [], [1, 2, 3]);
    c.tier4_withheld = 'not probed in this market';
  }
}

const NON_CITY_VALIDATED = 8217;
// The one cross-language family the measurement supports: "<city> <country>",
// one page per city, in the languages where it measured (en, and by the same
// pattern the other ten, but only en was measured so only en is counted).
const ORIENTATION_PAGES = countCities(['DE', 'FR', 'NL', 'IT', 'ES', 'PL', 'JP', 'TW', 'BR'], [1, 2, 3]);

const measured = graded.reduce((t, c) => t + c.pages_measured_countries, 0) + NON_CITY_VALIDATED + ORIENTATION_PAGES;
const ceiling = graded.reduce((t, c) => t + c.pages_language_countries, 0) + NON_CITY_VALIDATED + ORIENTATION_PAGES;

const ladder = {
  generated: '2026-09-30 pass two, v4 with the market-reach correction',
  correction: 'the 11-market multiplier applied in v1-v3 is invalid for tier 2-4 cities; measured, see the header of this script',
  keyword_rows: rows.length,
  markets_measured: new Set(rows.map((r) => r.market)).size,
  families_probed: new Set(rows.map((r) => r.family)).size,
  cells_counting: graded.filter((c) => c.counts).length,
  cities_tier1_3_reachable_by_the_11_measured_countries: countCities(Object.values(MEASURED_COUNTRIES).flat(), [1, 2, 3]),
  cities_tier1_3_not_reachable_by_any_live_market: 11553 - countCities(Object.values(MEASURED_COUNTRIES).flat(), [1, 2, 3]),
  cities_tier1_3_reachable_by_the_11_languages: countCities(Object.values(LANGUAGE_COUNTRIES).flat(), [1, 2, 3]),
  A_source_obtainable_all_markets: 3431138,
  B_source_backed_today_all_markets: 1644451,
  C_demand_supported_measured: measured,
  C_demand_supported_ceiling_same_languages_other_countries: ceiling,
  D_publishable_now: 1791,
};
const verdict = (t) => ladder.C_demand_supported_measured >= t ? 'DEFENSIBLE'
  : ladder.C_demand_supported_ceiling_same_languages_other_countries >= t ? 'PROBABLE_BUT_UNPROVEN'
  : ladder.A_source_obtainable_all_markets >= t ? 'NOT_DEFENSIBLE_ON_DEMAND' : 'NOT_DEFENSIBLE';
ladder.verdicts = Object.fromEntries([100000, 250000, 500000, 1000000].map((t) => [t, verdict(t)]));
ladder.shortfall_to_500k = Math.max(0, 500000 - measured);
ladder.shortfall_to_1m = Math.max(0, 1000000 - measured);
writeFileSync(new URL('SCALE-LADDER-V4.json', OUT), JSON.stringify({ ...ladder, cells: graded }, null, 1));

console.log('== CELLS THAT COUNT');
console.log('family'.padEnd(32) + 'market'.padEnd(12) + ' n  med  reach      tiers    measured  language');
for (const c of graded.filter((x) => x.counts).sort((a, b) => b.pages_measured_countries - a.pages_measured_countries))
  console.log(c.family.padEnd(32) + c.market.padEnd(12) + String(c.n).padStart(2) + String(c.median).padStart(5)
    + '  ' + c.reach.padEnd(10) + c.tiers.padEnd(9) + String(c.pages_measured_countries).padStart(8) + String(c.pages_language_countries).padStart(10));
console.log('\n== LADDER V4');
for (const [k, v] of Object.entries(ladder)) if (k !== 'verdicts') console.log('  ' + k.padEnd(58) + String(v).padStart(10));
console.log('  verdicts ' + JSON.stringify(ladder.verdicts));
