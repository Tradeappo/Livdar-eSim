// The second pass over the Tools surface: every tool in the queue, asked in
// every market, rather than the eight tools that already had a keyword.
//
//   node scripts/atlas/measure-tools-wide.mjs            report only
//   node scripts/atlas/measure-tools-wide.mjs --write    write the files and the plan
//
// The first pass concluded that Tools were exhausted. What it had actually
// done was measure the eight tools whose sources were built and stop, and four
// of the twelve tools that could be built were never asked about at all
// because their source list said they were blocked. Two of those four were
// blocked on a dataset they did not need:
//
//   rent-affordability was waiting for a rent level. The question is what
//   share of an income should go on rent, which is answered from the income.
//   It is the largest winnable number in this whole measurement: eighteen
//   thousand a month in the United States and nine thousand eight hundred in
//   Japan, both at difficulty zero or thereabouts.
//
//   country-comparison was waiting for tax rules. Price level, rent movement
//   and average earnings exist for both sides of a pair, and a comparison with
//   three measured rows and a visibly empty tax row is a comparison.
//
// The other two, destination-matcher and where-should-i-stay, were specified
// with inputs no dataset can answer and were narrowed to the ones that can.
//
// Two findings are worth as much as the rows that were planned.
//
// One: outside German, a country comparison keyword is not about cost. Every
// market returns a parent topic about the size of countries on a map, which is
// a different page with a different answer, and planning a cost tool against
// it would have been planning a mismatch. Only `ländervergleich` carries the
// comparison intent in its own right.
//
// Two: the largest Tools demand measured anywhere in this programme is a net
// pay calculator, two hundred and seventeen thousand a month in the United
// Kingdom and fifty six thousand in the United States, and it is unreachable
// without tax rules for each country. That is the single biggest thing this
// surface is missing and no amount of keyword research changes it.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';

const ROOT = rootFrom(import.meta.url);
export const CAPTURED_ON = '2026-09-25';

const CALC = 'tools.calculator';
const MATCH = 'tools.matcher';
const CMP = 'tools.cost-comparison';

// Every phrasing asked, with what came back. `plan: false` rows carry the
// reason they are not a page, because a measured keyword that is not planned is
// a decision and decisions are the part worth keeping.
export const ASKED = [
  // Rent affordability. The tool answers a proportion of an income, so the
  // keyword has to be the affordability question and not a rent calculator in
  // general: several markets use the same words for the annual increase, which
  // is a different page.
  { family: CALC, entity: 'rent-affordability', market: 'en-US', keyword: 'how much rent can i afford', volume: 18000, difficulty: 38, cpc: 2, plan: true },
  { family: CALC, entity: 'rent-affordability', market: 'en-US', keyword: 'rent calculator', volume: 14000, difficulty: 38, cpc: 45, plan: false, why: 'the same parent topic as the planned keyword, which carries more volume' },
  { family: CALC, entity: 'rent-affordability', market: 'en-US', keyword: 'rent affordability calculator', volume: 3600, difficulty: 31, cpc: 30, plan: false, why: 'the same parent topic as the planned keyword' },
  { family: CALC, entity: 'rent-affordability', market: 'ja-JP', keyword: '家賃 目安', volume: 9800, difficulty: 0, cpc: 2, plan: true },
  { family: CALC, entity: 'rent-affordability', market: 'ja-JP', keyword: '家賃 年収', volume: 500, difficulty: 0, cpc: 6, plan: false, why: 'the same question in fewer searches' },
  { family: CALC, entity: 'rent-affordability', market: 'de-DE', keyword: 'wie viel miete kann ich mir leisten', volume: 800, difficulty: 0, cpc: 45, plan: true },
  { family: CALC, entity: 'rent-affordability', market: 'de-DE', keyword: 'mietrechner', volume: 500, difficulty: 0, cpc: 80, plan: false, why: 'in German a Mietrechner is usually the increase or the Mietspiegel, not affordability' },
  { family: CALC, entity: 'rent-affordability', market: 'nl-NL', keyword: 'hoeveel huur kan ik betalen', volume: 150, difficulty: 18, cpc: 30, plan: true },
  { family: CALC, entity: 'rent-affordability', market: 'nl-NL', keyword: 'huur berekenen', volume: 350, difficulty: 35, cpc: 60, plan: false, why: 'the Dutch points system for a regulated rent, which is a different calculation' },
  { family: CALC, entity: 'rent-affordability', market: 'fr-FR', keyword: 'calculer son loyer maximum', volume: 40, difficulty: 3, cpc: 35, plan: true },
  { family: CALC, entity: 'rent-affordability', market: 'es-ES', keyword: 'calculadora alquiler', volume: 150, difficulty: 47, cpc: 60, plan: false, why: 'the Spanish parent topic is the annual rent revision, not affordability' },
  { family: CALC, entity: 'rent-affordability', market: 'es-ES', keyword: 'cuanto alquiler puedo pagar', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: CALC, entity: 'rent-affordability', market: 'es-ES', keyword: 'cuanto puedo pagar de alquiler', volume: 0, difficulty: 0, cpc: null, plan: false, why: 'no measured demand' },
  { family: CALC, entity: 'rent-affordability', market: 'it-IT', keyword: 'calcolo affitto', volume: 80, difficulty: 0, cpc: 35, plan: false, why: 'the Italian parent topic is the tax and contract calculation on a let, not affordability' },
  { family: CALC, entity: 'rent-affordability', market: 'it-IT', keyword: 'quanto affitto posso permettermi', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: CALC, entity: 'rent-affordability', market: 'pt-BR', keyword: 'calculadora de aluguel', volume: 1100, difficulty: 0, cpc: 20, plan: false, why: 'the Brazilian parent topic is the rent adjustment index, not affordability' },
  { family: CALC, entity: 'rent-affordability', market: 'pt-BR', keyword: 'quanto de aluguel posso pagar', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: CALC, entity: 'rent-affordability', market: 'pl-PL', keyword: 'ile mogę wydać na wynajem', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: CALC, entity: 'rent-affordability', market: 'pl-PL', keyword: 'kalkulator wynajmu', volume: 0, difficulty: null, cpc: 25, plan: false, why: 'no measured demand' },

  // The destination matcher. Every market asks this in its own idiom and only
  // Poland does not ask it at all.
  { family: MATCH, entity: 'destination-matcher', market: 'de-DE', keyword: 'wohin auswandern', volume: 1000, difficulty: 0, cpc: 10, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'de-DE', keyword: 'in welches land auswandern', volume: 250, difficulty: 3, cpc: 7, plan: false, why: 'the same question in fewer searches' },
  { family: MATCH, entity: 'destination-matcher', market: 'pt-BR', keyword: 'melhor pais para morar', volume: 900, difficulty: 0, cpc: 4, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'en-US', keyword: 'which country should i move to', volume: 100, difficulty: 5, cpc: 6, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'en-US', keyword: 'best country for me', volume: 10, difficulty: null, cpc: null, plan: false, why: 'the same question in fewer searches' },
  { family: MATCH, entity: 'destination-matcher', market: 'fr-FR', keyword: "ou s'expatrier", volume: 100, difficulty: 0, cpc: 10, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'fr-FR', keyword: "dans quel pays s'expatrier", volume: 70, difficulty: 0, cpc: 20, plan: false, why: 'the same question in fewer searches' },
  { family: MATCH, entity: 'destination-matcher', market: 'it-IT', keyword: "dove trasferirsi all'estero", volume: 40, difficulty: 0, cpc: null, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'nl-NL', keyword: 'naar welk land emigreren', volume: 30, difficulty: 19, cpc: null, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'es-ES', keyword: 'donde emigrar', volume: 20, difficulty: 0, cpc: null, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'ja-JP', keyword: '海外移住 おすすめ 国', volume: 10, difficulty: 0, cpc: 25, plan: true },
  { family: MATCH, entity: 'destination-matcher', market: 'es-ES', keyword: 'a que pais emigrar', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: MATCH, entity: 'destination-matcher', market: 'pl-PL', keyword: 'gdzie wyemigrować', volume: 0, difficulty: 0, cpc: null, plan: false, why: 'no measured demand' },
  { family: MATCH, entity: 'destination-matcher', market: 'pl-PL', keyword: 'do jakiego kraju wyemigrować', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: MATCH, entity: 'destination-matcher', market: 'ja-JP', keyword: '移住 どこ', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },

  // Which area of a city to stay in. Eight markets, and the strongest are the
  // two Romance ones, where the bare phrase is how the question is asked.
  { family: MATCH, entity: 'where-should-i-stay', market: 'pt-BR', keyword: 'onde ficar', volume: 400, difficulty: 2, cpc: 20, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'it-IT', keyword: 'dove alloggiare', volume: 200, difficulty: 0, cpc: 40, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'fr-FR', keyword: 'ou dormir', volume: 90, difficulty: 0, cpc: 45, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'es-ES', keyword: 'donde alojarse', volume: 80, difficulty: 0, cpc: 35, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'en-US', keyword: 'where should i stay', volume: 50, difficulty: 0, cpc: null, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'de-DE', keyword: 'wo übernachten', volume: 40, difficulty: null, cpc: null, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'nl-NL', keyword: 'waar overnachten', volume: 20, difficulty: null, cpc: null, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'pl-PL', keyword: 'gdzie się zatrzymać', volume: 10, difficulty: null, cpc: null, plan: true },
  { family: MATCH, entity: 'where-should-i-stay', market: 'en-US', keyword: 'best area to stay', volume: 50, difficulty: 0, cpc: null, plan: false, why: 'the same question as the planned keyword' },
  { family: MATCH, entity: 'where-should-i-stay', market: 'fr-FR', keyword: 'ou loger', volume: 70, difficulty: 0, cpc: null, plan: false, why: 'the same question in fewer searches' },
  { family: MATCH, entity: 'where-should-i-stay', market: 'ja-JP', keyword: 'どこに泊まる', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },

  // The country comparison, which is a German page and nowhere else. Every
  // other market answers this phrase with a map.
  { family: CMP, entity: 'country-comparison', market: 'de-DE', keyword: 'ländervergleich', volume: 70, difficulty: 2, cpc: null, plan: true },
  { family: CMP, entity: 'country-comparison', market: 'en-US', keyword: 'country comparison', volume: 250, difficulty: 49, cpc: 15, plan: false, why: 'the parent topic is the true size of countries on a map' },
  { family: CMP, entity: 'country-comparison', market: 'en-US', keyword: 'compare countries', volume: 80, difficulty: 34, cpc: 20, plan: false, why: 'the parent topic is the true size of countries on a map' },
  { family: CMP, entity: 'country-comparison', market: 'es-ES', keyword: 'comparar paises', volume: 40, difficulty: 1, cpc: null, plan: false, why: 'the parent topic is the real size of countries' },
  { family: CMP, entity: 'country-comparison', market: 'pt-BR', keyword: 'comparar paises', volume: 40, difficulty: 0, cpc: null, plan: false, why: 'the parent topic is the real size of countries' },
  { family: CMP, entity: 'country-comparison', market: 'nl-NL', keyword: 'landen vergelijken', volume: 40, difficulty: 0, cpc: null, plan: false, why: 'the parent topic is a world map at true scale' },
  { family: CMP, entity: 'country-comparison', market: 'fr-FR', keyword: 'comparer les pays', volume: 20, difficulty: 0, cpc: null, plan: false, why: 'the parent topic is the size of countries' },
  { family: CMP, entity: 'country-comparison', market: 'de-DE', keyword: 'länder vergleichen', volume: 20, difficulty: null, cpc: null, plan: false, why: 'the same question in fewer searches' },
  { family: CMP, entity: 'country-comparison', market: 'ja-JP', keyword: '国 比較', volume: 10, difficulty: null, cpc: null, plan: false, why: 'no parent topic returned, so the intent cannot be told apart from the map question' },
  { family: CMP, entity: 'country-comparison', market: 'it-IT', keyword: 'confronto paesi', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { family: CMP, entity: 'country-comparison', market: 'pl-PL', keyword: 'porównanie krajów', volume: 0, difficulty: 26, cpc: null, plan: false, why: 'no measured demand' },

  // Tools that are blocked, asked anyway so that the size of what is blocked is
  // on the record rather than assumed. The net pay calculator is the largest
  // number in the entire Tools surface.
  { family: CALC, entity: 'net-salary', market: 'en-GB', keyword: 'take home pay calculator', volume: 217000, difficulty: 67, cpc: 50, plan: false, why: 'blocked: tax rules are not built, and en-GB has no Atlas language of its own either' },
  { family: CALC, entity: 'net-salary', market: 'en-US', keyword: 'take home pay calculator', volume: 56000, difficulty: 50, cpc: 110, plan: false, why: 'blocked: tax rules are not built' },
  { family: CALC, entity: 'net-salary', market: 'en-US', keyword: 'gross to net salary', volume: 50, difficulty: 18, cpc: 4, plan: false, why: 'blocked: tax rules are not built' },
  { family: MATCH, entity: 'neighbourhood-matcher', market: 'de-DE', keyword: 'welcher stadtteil passt zu mir', volume: 10, difficulty: null, cpc: null, plan: false, why: 'blocked: it needs a rent level per district, and the demand is ten a month in any case' },

  // Keywords that belong to a tool and market pair that already has a page.
  // Recorded because two of them are better keywords than the ones in use, and
  // moving a keyword moves a URL that a cohort has already selected.
  { family: CALC, entity: 'moving-cost', market: 'de-DE', keyword: 'umzugsrechner', volume: 400, difficulty: 0, cpc: 200, plan: false, why: 'stronger than the keyword in use, and changing it would move a URL an approved cohort already carries' },
  { family: CALC, entity: 'travel-budget', market: 'es-ES', keyword: 'presupuesto de viaje', volume: 90, difficulty: 0, cpc: 10, plan: false, why: 'stronger than the keyword in use, and changing it would move a URL an approved cohort already carries' },
  { family: CALC, entity: 'travel-budget', market: 'en-US', keyword: 'trip cost calculator', volume: 1700, difficulty: 49, cpc: 45, plan: false, why: 'the pair already has a keyword' },
  { family: CALC, entity: 'travel-budget', market: 'ja-JP', keyword: '旅行 予算', volume: 450, difficulty: 0, cpc: 20, plan: false, why: 'the pair already has a keyword' },
  { family: CALC, entity: 'relocation-budget', market: 'en-US', keyword: 'relocation calculator', volume: 300, difficulty: 77, cpc: 150, plan: false, why: 'the pair already has a keyword, and difficulty 77 is not a launch target' },
  { family: CALC, entity: 'moving-cost', market: 'en-US', keyword: 'cost of moving calculator', volume: 250, difficulty: 40, cpc: 450, plan: false, why: 'the pair already has a keyword' },
];

const PUBLISHED = new Set(['en-US', 'de-DE', 'ja-JP', 'it-IT', 'es-ES', 'fr-FR', 'nl-NL', 'pl-PL', 'pt-BR']);
const COUNTRY_CODE = { 'en-US': 'us', 'en-GB': 'gb', 'de-DE': 'de', 'fr-FR': 'fr', 'es-ES': 'es', 'it-IT': 'it', 'pt-BR': 'br', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'jp' };

export function run() {
  const plan = JSON.parse(readFileSync(new URL('data/atlas/measurement-plan.json', ROOT), 'utf8'));
  const have = new Set(plan.rows.map((r) => r.family + '|' + r.entity + '|' + r.market));
  const rows = [];
  const refused = [];
  for (const a of ASKED) {
    const key = a.family + '|' + a.entity + '|' + a.market;
    if (!a.plan) { refused.push(a.market + ' "' + a.keyword + '" (' + a.volume + '): ' + a.why); continue; }
    if (!(a.volume > 0) || !PUBLISHED.has(a.market) || have.has(key)) { refused.push(a.market + ' "' + a.keyword + '": already planned or unpublishable'); continue; }
    rows.push({
      q: a.keyword, family: a.family, vertical: 'tools', priority: 'high',
      entity: a.entity, market: a.market, language: MARKET_LANG[a.market], country: MARKET_COUNTRY[a.market],
      measuredOn: CAPTURED_ON,
    });
  }
  const volume = rows.reduce((t, r) => t + ASKED.find((a) => a.keyword === r.q && a.market === r.market).volume, 0);
  return {
    asked: ASKED.length,
    planned: rows.length,
    monthlySearchesPlanned: volume,
    blockedDemand: ASKED.filter((a) => a.why && a.why.startsWith('blocked')).reduce((t, a) => t + a.volume, 0),
    notPlanned: refused,
    byEntity: rows.reduce((acc, r) => ({ ...acc, [r.entity]: (acc[r.entity] || 0) + 1 }), {}),
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    const byMarket = {};
    for (const a of ASKED) (byMarket[a.market] ||= []).push(a);
    for (const [market, asked] of Object.entries(byMarket)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-tools-wide-' + market + '-' + CAPTURED_ON + '.json', ROOT), {
        provider: 'Ahrefs Keywords Explorer, overview',
        endpoint: 'keywords-explorer-overview',
        capturedOn: CAPTURED_ON,
        country: COUNTRY_CODE[market],
        market,
        select: 'keyword,volume,difficulty,cpc,parent_topic',
        unitsPerRow: 23,
        unitsTotal: asked.length * 23,
        families: [CALC, MATCH, CMP],
        note: 'The second pass over the Tools surface. Constructed keywords in the idiom of each market, for every tool in the queue rather than the ones that already had a page. The parent topic was selected as well as the volume, and it changed four decisions: the phrase for a country comparison returns a map question in every market except German, and the phrase for a rent calculator returns the annual increase in Spanish, Italian and Brazilian Portuguese.',
        caution: 'A null volume means the provider returned no row. Volume alone did not decide a page here: a keyword whose parent topic is a different question was not planned however large it was.',
        keywords: asked.filter((a) => a.volume != null).map((a) => ({
          keyword: a.keyword, volume: a.volume, difficulty: a.difficulty, cpc: a.cpc,
          family: a.family, entity: a.entity, market: a.market,
          ...(a.plan ? {} : { notPlanned: a.why }),
        })),
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
