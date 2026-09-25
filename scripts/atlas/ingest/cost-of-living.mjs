// Cost of living, ingested.
//
//   node scripts/atlas/ingest/cost-of-living.mjs
//   node scripts/atlas/ingest/cost-of-living.mjs --write
//
// Two adapters over three captured payloads. Eurostat's price level index is
// the primary series and wins wherever it reaches; the World Bank price level
// ratio is the fallback that reaches the five priority destinations Eurostat
// does not. Both are openly licensed for commercial reuse with attribution,
// and neither is Numbeo, which is the source every competitor in this space
// uses and which forbids redistribution.
//
// The sandbox has no route to either API. The payloads were fetched live
// through a browser and stored under data/atlas/sources/cost-of-living/, with
// the endpoint and the capture method recorded in each file. This script is
// the part that would be unchanged if the network were open: the adapters
// read a payload and do not care how it arrived.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { defineAdapter, ingest, coverageOf } from '../../../lib/atlas/sources/adapter.js';
import { pick } from '../../../lib/atlas/sources/provenance.js';
import { priceDrift } from '../../../lib/atlas/sources/freshness.js';

const ROOT = new URL('../../../', import.meta.url);
const read = (rel) => JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));

// Eurostat uses EL for Greece and UK for the United Kingdom; ISO 3166 uses GR
// and GB. Getting this wrong silently drops two countries, one of which is a
// priority destination.
const EUROSTAT_TO_ISO2 = { EL: 'GR', UK: 'GB' };

const ISO3_TO_ISO2 = {
  ABW: 'AW', AFG: 'AF', AGO: 'AO', ALB: 'AL', AND: 'AD', ARE: 'AE', ARG: 'AR', ARM: 'AM', ATG: 'AG', AUS: 'AU',
  AUT: 'AT', AZE: 'AZ', BDI: 'BI', BEL: 'BE', BEN: 'BJ', BFA: 'BF', BGD: 'BD', BGR: 'BG', BHR: 'BH', BHS: 'BS',
  BIH: 'BA', BLR: 'BY', BLZ: 'BZ', BMU: 'BM', BOL: 'BO', BRA: 'BR', BRB: 'BB', BRN: 'BN', BTN: 'BT', BWA: 'BW',
  CAF: 'CF', CAN: 'CA', CHE: 'CH', CHL: 'CL', CHN: 'CN', CIV: 'CI', CMR: 'CM', COD: 'CD', COG: 'CG', COL: 'CO',
  COM: 'KM', CPV: 'CV', CRI: 'CR', CUB: 'CU', CUW: 'CW', CYM: 'KY', CYP: 'CY', CZE: 'CZ', DEU: 'DE', DJI: 'DJ',
  DMA: 'DM', DNK: 'DK', DOM: 'DO', DZA: 'DZ', ECU: 'EC', EGY: 'EG', ERI: 'ER', ESP: 'ES', EST: 'EE', ETH: 'ET',
  FIN: 'FI', FJI: 'FJ', FRA: 'FR', FRO: 'FO', FSM: 'FM', GAB: 'GA', GBR: 'GB', GEO: 'GE', GHA: 'GH', GIN: 'GN',
  GMB: 'GM', GNB: 'GW', GNQ: 'GQ', GRC: 'GR', GRD: 'GD', GRL: 'GL', GTM: 'GT', GUY: 'GY', HKG: 'HK', HND: 'HN',
  HRV: 'HR', HTI: 'HT', HUN: 'HU', IDN: 'ID', IND: 'IN', IRL: 'IE', IRN: 'IR', IRQ: 'IQ', ISL: 'IS', ISR: 'IL',
  ITA: 'IT', JAM: 'JM', JOR: 'JO', JPN: 'JP', KAZ: 'KZ', KEN: 'KE', KGZ: 'KG', KHM: 'KH', KIR: 'KI', KNA: 'KN',
  KOR: 'KR', KWT: 'KW', LAO: 'LA', LBN: 'LB', LBR: 'LR', LBY: 'LY', LCA: 'LC', LKA: 'LK', LSO: 'LS', LTU: 'LT',
  LUX: 'LU', LVA: 'LV', MAC: 'MO', MAR: 'MA', MDA: 'MD', MDG: 'MG', MDV: 'MV', MEX: 'MX', MHL: 'MH', MKD: 'MK',
  MLI: 'ML', MLT: 'MT', MMR: 'MM', MNE: 'ME', MNG: 'MN', MOZ: 'MZ', MRT: 'MR', MUS: 'MU', MWI: 'MW', MYS: 'MY',
  NAM: 'NA', NER: 'NE', NGA: 'NG', NIC: 'NI', NLD: 'NL', NOR: 'NO', NPL: 'NP', NRU: 'NR', NZL: 'NZ', OMN: 'OM',
  PAK: 'PK', PAN: 'PA', PER: 'PE', PHL: 'PH', PLW: 'PW', PNG: 'PG', POL: 'PL', PRI: 'PR', PRT: 'PT', PRY: 'PY',
  QAT: 'QA', ROU: 'RO', RUS: 'RU', RWA: 'RW', SAU: 'SA', SDN: 'SD', SEN: 'SN', SGP: 'SG', SLB: 'SB', SLE: 'SL',
  SLV: 'SV', SMR: 'SM', SOM: 'SO', SRB: 'RS', SSD: 'SS', STP: 'ST', SUR: 'SR', SVK: 'SK', SVN: 'SI', SWE: 'SE',
  SWZ: 'SZ', SXM: 'SX', SYC: 'SC', SYR: 'SY', TCA: 'TC', TCD: 'TD', TGO: 'TG', THA: 'TH', TJK: 'TJ', TKM: 'TM',
  TLS: 'TL', TON: 'TO', TTO: 'TT', TUN: 'TN', TUR: 'TR', TUV: 'TV', TZA: 'TZ', UGA: 'UG', UKR: 'UA', URY: 'UY',
  USA: 'US', UZB: 'UZ', VCT: 'VC', VEN: 'VE', VIR: 'VI', VNM: 'VN', VUT: 'VU', WSM: 'WS', XKX: 'XK', YEM: 'YE',
  ZAF: 'ZA', ZMB: 'ZM', ZWE: 'ZW',
};

export const eurostatPli = defineAdapter({
  id: 'eurostat-prc-ppp-ind',
  provider: 'Eurostat',
  dataset: 'prc_ppp_ind',
  licence: 'Eurostat reuse policy, commercial reuse permitted with attribution',
  attribution: 'Source: Eurostat, prc_ppp_ind',
  freshnessClass: 'prices',
  confidence: 'official',
  unlocks: ['cost-of-living-verified'],
  parse(raw) {
    const out = [];
    for (const [measure, row] of Object.entries(raw.values)) {
      for (const [geo, value] of Object.entries(row)) {
        out.push({ geo, value, measure, unit: 'index-eu27-100', observedAt: raw.period });
      }
    }
    return out;
  },
  mapEntity: (geo) => EUROSTAT_TO_ISO2[geo] || (/^[A-Z]{2}$/.test(geo) ? geo : null),
});

export const worldBankRatio = defineAdapter({
  id: 'worldbank-price-level',
  provider: 'World Bank',
  dataset: 'PA.NUS.PPP over PA.NUS.FCRF',
  licence: 'CC BY 4.0',
  attribution: 'World Bank, International Comparison Program, CC BY 4.0',
  freshnessClass: 'prices',
  confidence: 'official-derived',
  derivation: 'PPP conversion factor divided by the official exchange rate, both from the World Bank, most recent non empty value for each country',
  unlocks: ['cost-of-living-verified'],
  parse(raw) {
    return Object.entries(raw.values).map(([iso3, [value, year]]) => ({
      geo: iso3, value, measure: 'PRICE_LEVEL', unit: 'ratio-us-1', observedAt: year,
    }));
  },
  mapEntity: (iso3) => ISO3_TO_ISO2[iso3] || null,
});

export function run({ now = new Date() } = {}) {
  const eu = read('data/atlas/sources/cost-of-living/eurostat-prc-ppp-ind-2024.json');
  const wb = read('data/atlas/sources/cost-of-living/worldbank-price-level-2025.json');
  const hicp = read('data/atlas/sources/cost-of-living/eurostat-hicp-2025.json');

  const a = ingest(eurostatPli, eu, { now });
  const b = ingest(worldBankRatio, wb, { now });

  // Inflation, mapped the same way, so drift can be computed per country.
  const inflation = {};
  for (const [geo, v] of Object.entries(hicp.values)) {
    const iso = EUROSTAT_TO_ISO2[geo] || geo;
    if (/^[A-Z]{2}$/.test(iso)) inflation[iso] = v;
  }

  // One row per country, with Eurostat winning where it reaches. `pick`
  // decides on confidence and then recency, so nothing here special cases
  // either provider.
  const byCountry = {};
  for (const r of [...a.records, ...b.records]) {
    const c = (byCountry[r.entity] ||= { iso2: r.entity, measures: {}, sources: [] });
    if (!c.measures[r.measure]) c.measures[r.measure] = [];
    c.measures[r.measure].push(r);
    if (!c.sources.includes(r.source)) c.sources.push(r.source);
  }
  const countries = {};
  for (const [iso2, c] of Object.entries(byCountry)) {
    const measures = {};
    for (const [m, records] of Object.entries(c.measures)) {
      const chosen = pick(records);
      if (!chosen) continue;
      measures[m] = chosen;
    }
    const headline = measures.A01 || measures.PRICE_LEVEL || null;
    const drift = headline ? priceDrift(headline, inflation[iso2] ?? null, now) : null;
    countries[iso2] = {
      iso2,
      measures,
      headlineMeasure: measures.A01 ? 'A01' : measures.PRICE_LEVEL ? 'PRICE_LEVEL' : null,
      basketDepth: Object.keys(measures).filter((m) => /^A01\d/.test(m)).length,
      annualInflationPercent: inflation[iso2] ?? null,
      drift,
      // Coverage is per country and honest about it: a country with the full
      // Eurostat basket can answer twelve spending categories, and a country
      // with only the World Bank ratio can answer one question.
      //
      // This counts the basket categories rather than the measures, because
      // counting measures made Japan look like a full basket country. Japan
      // has the Eurostat headline and the World Bank ratio and none of the
      // twelve spending categories, which is exactly the middle case the
      // headline-only level exists to describe.
      coverage: !measures.A01 ? 'ratio-only'
        : Object.keys(measures).filter((m) => /^A01\d/.test(m)).length >= 10 ? 'full-basket'
          : 'headline-only',
      sources: c.sources,
    };
  }

  const withBasket = Object.values(countries).filter((c) => c.coverage === 'full-basket');
  const cov = coverageOf({ countries: Object.keys(countries), cities: [], citiesExpected: 0 });

  return {
    generatedAt: now.toISOString(),
    meaning: 'Country level cost of living, from two openly licensed official sources. City level is deliberately absent rather than estimated: no openly licensed city price index exists for more than a handful of places, and inventing one would be the exact failure this pipeline is built to prevent.',
    ingests: [
      { ...a, records: undefined, entities: a.entities.length },
      { ...b, records: undefined, entities: b.entities.length },
    ],
    attribution: [eurostatPli.attribution, worldBankRatio.attribution],
    coverage: {
      ...cov,
      fullBasket: withBasket.length,
      headlineOnly: Object.values(countries).filter((c) => c.coverage === 'headline-only').length,
      ratioOnly: Object.values(countries).filter((c) => c.coverage === 'ratio-only').length,
      cityLevel: 'NOT_AVAILABLE',
      cityLevelWhy: 'No openly licensed city level consumer price index exists across the priority destinations. Eurostat is national. The city families stay blocked on this source until a licensed city series exists, and no value is invented to fill the gap.',
    },
    inflation,
    countries,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/sources/cost-of-living/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/sources/cost-of-living/normalized.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    coverage: r.coverage,
    ingests: r.ingests.map((i) => ({ source: i.source, state: i.state, parsed: i.parsed, entities: i.entities, failed: i.quality.failed, byGate: i.quality.byGate, unmapped: i.unmappedGeographies })),
    priority: ['ES', 'JP', 'PT', 'AE', 'IT', 'TH', 'CA', 'NZ', 'GB', 'FR', 'CR'].map((c) => ({
      c, has: Boolean(r.countries[c]), coverage: r.countries[c]?.coverage, headline: r.countries[c]?.measures?.[r.countries[c]?.headlineMeasure]?.value,
    })),
  }, null, 1));
}
