// Per market keyword audit, for every market we publish in.
//
// Zero Ahrefs consumption. Every figure here is read out of the six files in
// data/ that the research passes already produced, through the same
// research-core module the page plan and the cluster report use, so none of the
// three can quietly disagree with another.
//
// What this exists to answer: the page plan tells us how many pages a market
// earns. It does not tell us whether we understand that market. A market can
// clear the volume floor and still be one we would write badly, because the
// words people type there are not the words we assumed. Taiwan does not search
// for eSIM, it searches for a network card. Brazil does not search for eSIM
// either, it searches for a chip. A plan built on the English vocabulary would
// have produced pages nobody in either market would ever find.
//
// So each market gets the same fifteen readings, printed side by side, and the
// vocabulary reading is one of them rather than a footnote.

import { writeFileSync } from 'node:fs';
import { loadUniverse, sum, group } from './research-core.mjs';

// Repeated from the page plan, deliberately, as a constant rather than an
// import: this script must be readable on its own, and a topic floor that
// disagreed with the plan would show up immediately in the qualifying topic
// count below.
const PAGE_FLOOR = 500;

// The markets we publish in. Same list as MARKET_POLICY in plan-report.mjs,
// restricted to publish: true.
const PUBLISHED = [
  'en-us', 'en-gb', 'de-de', 'ro-ro', 'ja-jp', 'zh-Hant-tw',
  'it-it', 'es-es', 'fr-fr', 'nl-nl', 'pl-pl', 'pt-br',
];

// The words each market actually uses for the product. These are not
// translations of "eSIM". They are the strings we check for in the measured
// keywords, to see which vocabulary the demand is really phrased in. A market
// whose demand sits mostly outside our assumed word is a market we would have
// written the wrong pages for.
const VOCABULARY = {
  'en-us': { esim: /\besim\b/i, sim: /\bsim card\b/i, other: /\bdata plan\b|\bhotspot\b/i },
  'en-gb': { esim: /\besim\b/i, sim: /\bsim card\b/i, other: /\bdata plan\b|\bhotspot\b/i },
  'de-de': { esim: /\besim\b/i, sim: /\bsim.?karte\b/i, other: /\bdatentarif\b|\bsurfen\b/i },
  'ro-ro': { esim: /\besim\b/i, sim: /\bcartela\b|\bcartele\b/i, other: /\bnet\b|\binternet\b/i },
  'ja-jp': { esim: /esim|イーシム/i, sim: /シム|sim/i, other: /wifi|ワイファイ|レンタル/i },
  'zh-Hant-tw': { esim: /esim/i, sim: /網卡|上網卡|sim卡/i, other: /漫遊|wifi機/i },
  'it-it': { esim: /\besim\b/i, sim: /\bscheda sim\b|\bsim\b/i, other: /\bwifi portatile\b|\brete\b/i },
  'es-es': { esim: /\besim\b/i, sim: /\btarjeta sim\b|\bsim\b/i, other: /\bdatos\b|\binternet\b/i },
  'fr-fr': { esim: /\besim\b/i, sim: /\bcarte sim\b|\bsim\b/i, other: /\bforfait\b|\binternet\b/i },
  'nl-nl': { esim: /\besim\b/i, sim: /\bsimkaart\b|\bsim\b/i, other: /\bdata\b|\binternet\b/i },
  'pl-pl': { esim: /\besim\b/i, sim: /\bkarta sim\b|\bsim\b/i, other: /\binternet\b|\btransmisja\b/i },
  'pt-br': { esim: /\besim\b/i, sim: /\bchip\b/i, other: /\binternet\b|\bdados\b/i },
};

const median = (nums) => {
  const s = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n)).sort((a, b) => a - b);
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

const universe = loadUniverse();

// Every row for a market, at every tier, so the excluded volume can be reported
// rather than silently dropped.
const allByMarket = {};
universe.all.forEach((k) => { (allByMarket[k.market] = allByMarket[k.market] || []).push(k); });

const topN = (rows, fn, n) => {
  const g = group(rows, fn);
  return Object.entries(g)
    .sort((a, b) => b[1].v - a[1].v)
    .slice(0, n)
    .map(([key, d]) => ({ key, volume: d.v, keywords: d.n }));
};

const audits = PUBLISHED.map((market) => {
  const all = allByMarket[market] || [];
  const addressable = all.filter((k) => k.tier === 'addressable');
  const addressableVolume = sum(addressable);

  // 1 to 4: size.
  const totalVolume = sum(all);

  // 5: what we deliberately do not chase, and why it was dropped.
  const excluded = {};
  ['head', 'navigational', 'substitution', 'wrong_audience'].forEach((tier) => {
    const rows = all.filter((k) => k.tier === tier);
    if (rows.length) excluded[tier] = { volume: sum(rows), keywords: rows.length };
  });

  // 6 and 7: where this market wants to go.
  const destinationRows = addressable.filter((k) => k.cluster === 'destination');
  const topDestinations = topN(destinationRows, (k) => k.parentTopic || k.keyword, 8);

  // 8: the shape of demand.
  const clusters = topN(addressable, (k) => k.cluster, 8);

  // 9: intent, by volume rather than by keyword count. Counting keywords makes
  // a market look commercial when it has many small buying phrases and one
  // enormous informational one, which is exactly the roaming case.
  const withIntent = addressable.filter((k) => k.intent);
  const commercialVolume = sum(withIntent.filter((k) => k.intent === 'commercial'));
  const informationalVolume = sum(withIntent.filter((k) => k.intent === 'informational'));
  const classifiedVolume = commercialVolume + informationalVolume;

  // 10 and 11: competition and price, with coverage, because difficulty was not
  // bought on every pass and a median over four rows is not a fact about four
  // hundred.
  const kdValues = addressable.map((k) => k.difficulty).filter((d) => d !== null && d !== undefined);
  const cpcValues = addressable.map((k) => k.cpc).filter((c) => c !== null && c !== undefined);
  const cpcCents = median(cpcValues);

  // 12: the actual head of the market, unrounded.
  const topKeywords = addressable
    .slice()
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .map((k) => ({ keyword: k.keyword, volume: k.volume, cluster: k.cluster, difficulty: k.difficulty }));

  // 13: vocabulary. Which word this market actually types.
  //
  // The buckets are mutually exclusive and tested in order, which matters more
  // than it looks. An overlapping test is not just untidy, it is wrong: the
  // Japanese pattern for the local word contains "sim", which also appears
  // inside "esim", so an overlapping count reported Japan as using the local
  // word more than eSIM when in fact almost every one of those rows was an eSIM
  // row counted twice. Each keyword now lands in exactly one bucket, so the
  // shares sum to one and the comparison between them means something.
  const vocab = VOCABULARY[market];
  const vocabulary = {};
  if (vocab) {
    const order = ['esim', 'sim', 'other'];
    const buckets = { esim: [], sim: [], other: [], unmatched: [] };
    addressable.forEach((k) => {
      const hit = order.find((label) => vocab[label] && vocab[label].test(k.keyword));
      buckets[hit || 'unmatched'].push(k);
    });
    Object.entries(buckets).forEach(([label, rows]) => {
      vocabulary[label] = {
        volume: sum(rows),
        keywords: rows.length,
        share: addressableVolume ? Number((sum(rows) / addressableVolume).toFixed(3)) : 0,
      };
    });
  }

  // 14: how many topics actually clear the floor. This is the number that
  // decides how many pages the market earns, so it is reported next to the
  // volume rather than derived somewhere else.
  const byTopic = group(addressable, (k) => k.parentTopic || k.keyword);
  const qualifyingTopics = Object.entries(byTopic).filter(([, d]) => d.v >= PAGE_FLOOR);

  // 15: how much of the market's volume those topics actually capture. A market
  // with huge volume spread across topics that each miss the floor is a market
  // we cannot serve with pages, and that is worth seeing.
  const capturedVolume = qualifyingTopics.reduce((a, [, d]) => a + d.v, 0);

  return {
    market,
    language: market.split('-').slice(0, -1).join('-'),
    country: market.split('-').pop(),
    totalVolume,
    totalKeywords: all.length,
    addressableVolume,
    addressableKeywords: addressable.length,
    addressableShare: totalVolume ? Number((addressableVolume / totalVolume).toFixed(3)) : 0,
    excluded,
    topDestinations,
    clusters,
    commercialVolume,
    informationalVolume,
    commercialShareOfVolume: classifiedVolume ? Number((commercialVolume / classifiedVolume).toFixed(3)) : null,
    medianDifficulty: median(kdValues),
    difficultyCoverage: addressable.length ? Number((kdValues.length / addressable.length).toFixed(2)) : 0,
    medianCpcUsd: cpcCents === null ? null : Number((cpcCents / 100).toFixed(2)),
    cpcCoverage: addressable.length ? Number((cpcValues.length / addressable.length).toFixed(2)) : 0,
    topKeywords,
    vocabulary,
    qualifyingTopics: qualifyingTopics.length,
    capturedVolume,
    captureRate: addressableVolume ? Number((capturedVolume / addressableVolume).toFixed(3)) : 0,
  };
});

audits.sort((a, b) => b.addressableVolume - a.addressableVolume);

const out = {
  generatedAt: new Date().toISOString(),
  source: 'data/ only, no Ahrefs request made by this script',
  pageFloor: PAGE_FLOOR,
  readings: [
    'total volume', 'total keywords', 'addressable volume', 'addressable keywords', 'addressable share',
    'excluded by tier', 'top destinations', 'cluster mix', 'commercial volume', 'informational volume',
    'median difficulty with coverage', 'median CPC with coverage', 'top keywords', 'vocabulary split',
    'qualifying topics and capture rate',
  ],
  markets: audits,
};

writeFileSync(new URL('../data/market-audit.json', import.meta.url), JSON.stringify(out, null, 2));

// ---------------------------------------------------------------- the report

const num = (v, n) => String(v === null || v === undefined ? '-' : v).padStart(n);
const pad = (v, n) => String(v === null || v === undefined ? '-' : v).padEnd(n);
const pct = (v) => (v === null || v === undefined ? '-' : Math.round(v * 100) + '%');

console.log('PER MARKET KEYWORD AUDIT, computed from data/ with no Ahrefs request');
console.log('Twelve published markets, fifteen readings each, page floor ' + PAGE_FLOOR + ' searches a month per topic.');
console.log('');
console.log(
  '  ' + pad('market', 12) + num('addr vol', 10) + num('kw', 6) + num('addr%', 7) +
    num('com%', 6) + num('KD', 5) + num('KDcov', 7) + num('CPC', 7) + num('topics', 8) + num('capture', 9)
);
console.log('  ' + '-'.repeat(77));
audits.forEach((a) => {
  console.log(
    '  ' + pad(a.market, 12) + num(a.addressableVolume.toLocaleString('en-US'), 10) + num(a.addressableKeywords, 6) +
      num(pct(a.addressableShare), 7) + num(pct(a.commercialShareOfVolume), 6) +
      num(a.medianDifficulty, 5) + num(pct(a.difficultyCoverage), 7) +
      num(a.medianCpcUsd, 7) + num(a.qualifyingTopics, 8) + num(pct(a.captureRate), 9)
  );
});

console.log('');
console.log('VOCABULARY, share of each market addressable volume by the word actually typed');
console.log('Buckets are mutually exclusive and tested in order, so the four shares sum to one hundred.');
console.log('');
console.log('  ' + pad('market', 12) + num('esim', 9) + num('local word', 12) + num('other', 9) + num('unmatched', 11) + '  reading');
console.log('  ' + '-'.repeat(98));
audits.forEach((a) => {
  const v = a.vocabulary || {};
  const esim = v.esim ? v.esim.share : null;
  const sim = v.sim ? v.sim.share : null;
  const other = v.other ? v.other.share : null;
  const un = v.unmatched ? v.unmatched.share : null;
  let reading = 'eSIM is the word, write in it';
  if (sim !== null && esim !== null && sim > esim) reading = 'the local word beats eSIM, lead with it';
  else if (sim !== null && sim >= 0.2) reading = 'eSIM leads, the local word is a real second, cover both';
  else if (un !== null && un > 0.3) reading = 'eSIM leads, but a third is phrased some other way';
  console.log(
    '  ' + pad(a.market, 12) + num(pct(esim), 9) + num(pct(sim), 12) + num(pct(other), 9) + num(pct(un), 11) + '  ' + reading
  );
});

console.log('');
console.log('TOP DESTINATIONS PER MARKET, by measured volume on destination keywords');
console.log('');
audits.forEach((a) => {
  const list = a.topDestinations.slice(0, 6).map((d) => d.key + ' ' + d.volume.toLocaleString('en-US')).join(', ');
  console.log('  ' + pad(a.market, 12) + (list || 'no destination keywords measured in this market'));
});

// ------------------------------------------------- language activation order
//
// Eleven site languages serve the twelve markets, because English serves both
// the United States and the United Kingdom. Three are written: en, de, ro. The
// order below is for the remaining eight.
//
// The ranking is measured volume first. The only editorial input is the writing
// cost, and it is applied as a tiebreak rather than as a multiplier, so it can
// reorder neighbours but can never move a large market below a small one. That
// is deliberate: a cost estimate of mine should not be able to overrule a
// measurement.

const LANGUAGE_OF_MARKET = {
  'en-us': 'en', 'en-gb': 'en', 'de-de': 'de', 'ro-ro': 'ro', 'ja-jp': 'ja',
  'zh-Hant-tw': 'zh-Hant', 'it-it': 'it', 'es-es': 'es', 'fr-fr': 'fr',
  'nl-nl': 'nl', 'pl-pl': 'pl', 'pt-br': 'pt',
};

const WRITTEN = new Set(['en', 'de', 'ro']);

// Editorial, not measured: how much original work a language needs beyond the
// research we already hold. Higher means more expensive to write well.
const WRITING_COST = {
  ja: { cost: 3, why: 'non Latin script, its own destination set led by Korea and Taiwan, and a reader who expects trip duration phrasing we do not use elsewhere' },
  'zh-Hant': { cost: 3, why: 'non Latin script and two vocabularies to serve at once, eSIM leading and wang ka a real second at 42,560 a month' },
  pt: { cost: 3, why: 'the product word is chip, not eSIM, so almost nothing carries over from the written markets and the destination set is South American' },
  it: { cost: 2, why: 'Latin script and shared European destinations, but portable wifi is its own cluster here rather than a footnote' },
  es: { cost: 2, why: 'Latin script, but a third of the volume is phrased outside our vocabulary and North Africa leads the destinations' },
  fr: { cost: 2, why: 'Latin script, Morocco and Tunisia dominate, which no written market covers' },
  nl: { cost: 1, why: 'smallest writing distance, explanation outweighs the product and the destination set overlaps German' },
  pl: { cost: 1, why: 'Latin script, holiday destinations outside the EU, and the lowest commercial share of any published market at 43 per cent' },
};

const pending = audits
  .filter((a) => !WRITTEN.has(LANGUAGE_OF_MARKET[a.market]))
  .map((a) => ({
    language: LANGUAGE_OF_MARKET[a.market],
    market: a.market,
    addressableVolume: a.addressableVolume,
    qualifyingTopics: a.qualifyingTopics,
    medianDifficulty: a.medianDifficulty,
    difficultyCoverage: a.difficultyCoverage,
    commercialShareOfVolume: a.commercialShareOfVolume,
    writingCost: WRITING_COST[LANGUAGE_OF_MARKET[a.market]],
  }))
  .sort((a, b) => b.addressableVolume - a.addressableVolume || a.writingCost.cost - b.writingCost.cost);

pending.forEach((p, i) => { p.position = i + 1; });

out.languageActivation = {
  siteLanguages: 11,
  markets: 12,
  note: 'English serves both en-us and en-gb, so twelve markets need eleven languages.',
  written: [...WRITTEN],
  ordering: 'measured addressable volume first, writing cost as a tiebreak only, so an estimate cannot overrule a measurement',
  pending,
};
writeFileSync(new URL('../data/market-audit.json', import.meta.url), JSON.stringify(out, null, 2));

console.log('');
console.log('LANGUAGE ACTIVATION ORDER for the remaining eight');
console.log('Eleven site languages serve twelve markets. Written already: en, de, ro.');
console.log('Ordered by measured volume. Writing cost breaks ties only, it never outranks a measurement.');
console.log('');
console.log('  ' + pad('#', 3) + pad('lang', 9) + pad('market', 12) + num('addr vol', 10) + num('topics', 8) + num('cost', 6) + '  why the cost');
console.log('  ' + '-'.repeat(118));
pending.forEach((p) => {
  console.log(
    '  ' + pad(p.position, 3) + pad(p.language, 9) + pad(p.market, 12) +
      num(p.addressableVolume.toLocaleString('en-US'), 10) + num(p.qualifyingTopics, 8) +
      num(p.writingCost.cost, 6) + '  ' + p.writingCost.why
  );
});
console.log('');
console.log('  Cost is editorial, 1 is cheapest. It is a tiebreak, not a multiplier.');

console.log('');
console.log('Written to data/market-audit.json');
