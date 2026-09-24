// Closing the market gaps in the tool and ranking families, and recording
// where the demand simply is not there.
//
//   node scripts/atlas/measure-tools.mjs            report only
//   node scripts/atlas/measure-tools.mjs --write    write plan and file
//
// Cohort 001 took every eligible Tools page there was, so the second cohort
// could only carry Tools if more of them existed. Eleven tool and market pairs
// had no keyword at all, and each was asked directly rather than discovered,
// because a tool's keyword is a constructed phrase rather than something a
// destination name can be subtracted out of.
//
// Four of the eleven came back with demand and seven came back at zero or
// near zero. That is the finding, not a failure of the measurement: Dutch does
// not search for a cost of living calculator in any phrasing tried here, and
// Spanish and Italian ask about moving abroad in words that carry ten or
// twenty searches a month. Those seven are recorded here with their measured
// volume so that the next run does not spend units asking again, and they are
// not planned, because a page against zero measured demand is a page nobody
// asked for.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';

const ROOT = rootFrom(import.meta.url);
export const CAPTURED_ON = '2026-09-24';

// Every keyword asked, with what came back. `volume: 0` and the phrasings the
// provider had no row for at all are kept deliberately.
export const ASKED = [
  { family: 'tools.calculator', entity: 'moving-cost', market: 'pl-PL', keyword: 'koszt przeprowadzki', volume: 100, difficulty: 0 },
  { family: 'tools.calculator', entity: 'moving-cost', market: 'pl-PL', keyword: 'kalkulator przeprowadzki', volume: 30, difficulty: 0 },
  { family: 'tools.calculator', entity: 'moving-cost', market: 'pl-PL', keyword: 'koszty przeprowadzki kalkulator', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'pt-BR', keyword: 'quanto custa viajar', volume: 2600, difficulty: 1 },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'es-ES', keyword: 'calcular presupuesto de viaje', volume: 10, difficulty: null },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'es-ES', keyword: 'presupuesto viaje calculadora', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'nl-NL', keyword: 'reisbudget berekenen', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'nl-NL', keyword: 'reisbudget calculator', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'pl-PL', keyword: 'kalkulator budzetu podrozy', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'travel-budget', market: 'pl-PL', keyword: 'koszty podrozy kalkulator', volume: 0, difficulty: null },
  { family: 'tools.calculator', entity: 'relocation-budget', market: 'es-ES', keyword: 'coste de emigrar', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'relocation-budget', market: 'es-ES', keyword: 'cuanto cuesta emigrar', volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'relocation-budget', market: 'it-IT', keyword: "quanto costa trasferirsi all'estero", volume: 0, difficulty: null },
  { family: 'tools.calculator', entity: 'relocation-budget', market: 'it-IT', keyword: "costo trasferirsi all'estero", volume: null, difficulty: null },
  { family: 'tools.calculator', entity: 'relocation-budget', market: 'pt-BR', keyword: 'quanto custa morar fora', volume: 10, difficulty: null },
  { family: 'tools.calculator', entity: 'relocation-budget', market: 'pt-BR', keyword: 'custo para morar fora', volume: 0, difficulty: null },
  { family: 'tools.cost-comparison', entity: 'cost-of-living-comparison', market: 'nl-NL', keyword: 'kosten van levensonderhoud vergelijken', volume: null, difficulty: null },
  { family: 'tools.cost-comparison', entity: 'cost-of-living-comparison', market: 'nl-NL', keyword: 'levensonderhoud vergelijken', volume: null, difficulty: null },
  { family: 'tools.cost-calculator', entity: 'cost-of-living-calculator', market: 'nl-NL', keyword: 'kosten van levensonderhoud berekenen', volume: null, difficulty: null },
  { family: 'tools.cost-calculator', entity: 'cost-of-living-calculator', market: 'nl-NL', keyword: 'levensonderhoud berekenen', volume: 0, difficulty: null },
  { family: 'rankings.index', entity: 'cheapest-countries', market: 'it-IT', keyword: 'paesi dove si vive con poco', volume: 20, difficulty: 0 },
  { family: 'rankings.index', entity: 'cheapest-countries', market: 'it-IT', keyword: 'paesi piu economici dove vivere', volume: 0, difficulty: null },
];

const VERTICAL = { 'tools.calculator': 'tools', 'tools.cost-comparison': 'tools', 'tools.cost-calculator': 'tools', 'tools.matcher': 'tools', 'rankings.index': 'rankings' };

export function run() {
  // One page per tool and market, on the strongest phrasing that carries any
  // demand at all. A null volume is the provider having no row for the phrase,
  // which is weaker evidence than a measured zero and is treated the same way.
  const best = new Map();
  for (const a of ASKED) {
    if (!(a.volume > 0)) continue;
    const key = a.family + '|' + a.entity + '|' + a.market;
    const prev = best.get(key);
    if (!prev || a.volume > prev.volume) best.set(key, a);
  }
  const rows = [...best.values()].map((a) => ({
    q: a.keyword, family: a.family, vertical: VERTICAL[a.family], priority: 'high',
    entity: a.entity, market: a.market, language: MARKET_LANG[a.market], country: MARKET_COUNTRY[a.market],
    measuredOn: CAPTURED_ON,
  }));
  const zero = ASKED.filter((a) => !(a.volume > 0));
  return {
    asked: ASKED.length,
    pairsAsked: new Set(ASKED.map((a) => a.family + '|' + a.entity + '|' + a.market)).size,
    pairsWithDemand: best.size,
    withoutDemand: [...new Set(zero.map((a) => a.entity + ' in ' + a.market))].filter(
      (k) => ![...best.values()].some((b) => b.entity + ' in ' + b.market === k),
    ),
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    // One file per market. The loader joins on market and keyword together,
    // and a single file spanning five markets could not honestly state which
    // country it was asked in, which is a field the measurement contract
    // requires precisely so that one market's volume cannot be read as
    // another's.
    const MARKET_COUNTRY_CODE = { 'es-ES': 'es', 'it-IT': 'it', 'nl-NL': 'nl', 'pl-PL': 'pl', 'pt-BR': 'br' };
    const byMarket = {};
    for (const a of ASKED) (byMarket[a.market] ||= []).push(a);
    for (const [market, asked] of Object.entries(byMarket)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-tools-gaps-' + market + '-' + CAPTURED_ON + '.json', ROOT), {
        provider: 'Ahrefs Keywords Explorer, overview',
        endpoint: 'keywords-explorer-overview',
        capturedOn: CAPTURED_ON,
        country: MARKET_COUNTRY_CODE[market] || market,
        market,
        select: 'keyword,volume,difficulty',
        unitsPerRow: 21,
        unitsTotal: asked.length * 21,
        note: 'Constructed keywords asked directly for the tool and ranking pairs that had no keyword. A tool has no destination name to subtract, so discovery does not apply to it. Every phrasing asked is recorded, including the ones with no demand, so that the absence is evidence rather than a gap.',
        caution: 'A null volume means the provider returned no row for that phrase. That is weaker evidence than a measured zero and neither is treated as demand.',
        // A phrasing the provider had no row for is not a measurement of
        // zero, so it does not go in the store as one. It is recorded beside
        // it, the way a probe records what came back empty.
        keywords: asked.filter((a) => a.volume != null).map((a) => ({ keyword: a.keyword, volume: a.volume, difficulty: a.difficulty, market: a.market })),
        notReturned: asked.filter((a) => a.volume == null).map((a) => a.keyword),
      }, { overwrite: process.argv.includes('--overwrite') });
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('new plan rows: ' + added.length);
  }
  const { rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
