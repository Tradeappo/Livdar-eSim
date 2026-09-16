// Cluster prioritisation, computed entirely from data already collected.
//
// This script makes no Ahrefs request. Every measured figure below comes out of
// the six files in data/ that the research passes already produced, read
// through the same research-core module that the consolidation and the page
// plan use, so the three can never disagree.
//
// What it answers: given that we cannot write everything at once, which
// clusters deserve the next pages. The ranking is not a single number. Volume
// alone would send us to write roaming explainers, and the roaming cluster is
// 198,080 searches a month with 0.8 per cent commercial intent, measured, not
// guessed. Volume is not demand for a product.
//
// THE RULE THIS FILE OBEYS, and the reason it is laid out in three blocks:
// a measured number and a judgement of mine must never be printed as though
// they were the same kind of thing. Block one is what Ahrefs returned. Block
// two is what I decided, with the reason written next to it. Block three is
// arithmetic over the first two. Anyone reading the output can therefore throw
// out my judgement and keep the measurements, which is the only honest way to
// present a score that depends on both.

import { readFileSync, writeFileSync } from 'node:fs';
import { loadUniverse, sum, group } from './research-core.mjs';

// ===========================================================================
// BLOCK 2 INPUTS: editorial assumptions. Declared here, at the top, so they
// are impossible to mistake for data.
// ===========================================================================

// How close a cluster sits to someone taking out a card, on a 0 to 1 scale.
// NOT MEASURED. This is my judgement about what the searcher wants, and it is
// the first thing to challenge if the ranking looks wrong.
const PROXIMITY = {
  destination: 1.0, // "esim japan" is a person about to buy
  commercial: 0.95, // "best esim", "cheap esim", "unlimited esim"
  regional: 0.85, // "europe esim", buying for a trip
  comparisons: 0.8, // provider vs provider, late stage but not ours to win alone
  travel_sim: 0.7, // same job, older vocabulary
  pocket_wifi: 0.55, // adjacent product, substitutable
  vs_alternatives: 0.5, // still deciding the category
  airport: 0.45, // buying, but at a counter we do not own
  setup: 0.3, // already bought something, often from someone else
  device: 0.3, // checking a phone, may buy after
  mobile_data_abroad: 0.3,
  travel_connectivity: 0.25,
  roaming: 0.2, // understanding a bill, not shopping
  generic: 0.2,
  bridge: 0.15, // a product we do not sell yet
  long_tail: 0.15, // unclassified residue
  digital_nomad: 0.1,
};

// Whether Livdar can plausibly win the page, as opposed to whether the search
// exists. NOT MEASURED. Comparisons are dominated by the providers themselves
// and by large affiliate sites; roaming SERPs are held by the operators, who
// are the only parties the searcher believes on the subject of their own bill.
const WINNABILITY = {
  destination: 0.8,
  regional: 0.85,
  commercial: 0.5,
  comparisons: 0.35,
  travel_sim: 0.7,
  pocket_wifi: 0.6,
  vs_alternatives: 0.75,
  airport: 0.6,
  setup: 0.8,
  device: 0.85,
  mobile_data_abroad: 0.7,
  travel_connectivity: 0.7,
  roaming: 0.3,
  generic: 0.4,
  bridge: 0.5,
  long_tail: 0.4,
  digital_nomad: 0.3,
};

// One sentence per editorial constant, so the table below can print the reason
// rather than just the number.
const ASSUMPTION_NOTES = {
  destination: 'a country name plus the product is the clearest buying signal in the dataset, and the SERP is winnable because it rewards specificity',
  regional: 'buying for a trip rather than a country, and the regional SERPs are thinner than the country ones',
  commercial: 'explicit buying language, but the SERP is owned by providers bidding on their own category',
  comparisons: 'late stage, but the pages that win are the providers themselves and the large affiliates',
  travel_sim: 'the same job as destination, phrased in the older vocabulary, and it carries Brazil',
  pocket_wifi: 'an adjacent product that substitutes for ours rather than leading to it',
  vs_alternatives: 'the searcher is still choosing a category, which is a page we can win by being straight about it',
  airport: 'a real purchase, at a counter we do not own and cannot rank for',
  setup: 'almost always someone who already bought, often from a competitor, but the SERP is easy',
  device: 'a compatibility check, low intent per visit, and easy to win because the answer is factual',
  mobile_data_abroad: 'broad phrasing, mixed intent',
  travel_connectivity: 'planning language, far from a purchase',
  roaming: 'measured at 0.8 per cent commercial intent, and the operators own the SERP for their own billing',
  generic: 'unclassifiable phrasing, no reliable intent',
  bridge: 'a product we do not sell, so a page cannot convert even if it ranks',
  long_tail: 'unclassified residue, absorbed by pages that already exist',
  digital_nomad: 'below the page floor in every market, and a different buying cycle',
};

// Pages the plan allocates to each cluster. READ FROM data/plan-report.json
// rather than retyped, because a second copy of a number is a number that will
// eventually disagree with the first. The plan owns this figure.
const PLAN_TYPE_FOR_CLUSTER = {
  destination: 'destination',
  regional: 'region',
  comparisons: 'comparison',
  roaming: 'roaming_explainer',
  commercial: 'commercial',
  device: 'compatibility',
  pocket_wifi: 'pocket_wifi',
  setup: 'setup',
  travel_sim: 'travel_sim',
  travel_connectivity: 'travel_connectivity',
  vs_alternatives: 'vs_alternatives',
  airport: 'airport',
  mobile_data_abroad: 'mobile_data_abroad',
};

const plan = JSON.parse(readFileSync(new URL('../data/plan-report.json', import.meta.url), 'utf8'));
const planPages = plan.plan.byType;
const pagesFor = (cluster) => {
  const type = PLAN_TYPE_FOR_CLUSTER[cluster];
  if (!type) return 0; // generic, bridge, long_tail, digital_nomad get no pages
  const n = planPages[type];
  if (n === undefined) {
    throw new Error(
      'Cluster "' + cluster + '" maps to plan type "' + type + '", which the page plan does not contain. ' +
        'Either the plan changed or the mapping is stale. Fix the mapping rather than hardcoding a number here.'
    );
  }
  return n;
};

// ===========================================================================
// BLOCK 1: measurement.
// ===========================================================================

const universe = loadUniverse();
const addressable = universe.addressable;

const median = (nums) => {
  const s = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n)).sort((a, b) => a - b);
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

const byCluster = {};
addressable.forEach((k) => {
  const c = k.cluster || 'unclassified';
  byCluster[c] = byCluster[c] || { rows: [], volume: 0 };
  byCluster[c].rows.push(k);
  byCluster[c].volume += k.volume;
});

const rows = Object.entries(byCluster).map(([cluster, data]) => {
  const rowsIn = data.rows;

  // --------------------------------------------------------------- measured
  const kdValues = rowsIn.map((k) => k.difficulty).filter((d) => d !== null && d !== undefined);
  const cpcValues = rowsIn.map((k) => k.cpc).filter((c) => c !== null && c !== undefined);
  // Difficulty and CPC were not bought on every research pass, so each median
  // is only as good as its coverage. Printing the coverage stops a median taken
  // from four rows being read as a fact about four hundred.
  const cpcCents = median(cpcValues);
  const withIntent = rowsIn.filter((k) => k.intent);
  const commercial = sum(withIntent.filter((k) => k.intent === 'commercial'));
  const informational = sum(withIntent.filter((k) => k.intent === 'informational'));
  const classified = commercial + informational;

  const measured = {
    volume: data.volume,
    keywords: rowsIn.length,
    medianDifficulty: median(kdValues),
    difficultyCoverage: rowsIn.length ? Number((kdValues.length / rowsIn.length).toFixed(2)) : 0,
    medianCpcUsd: cpcCents === null ? null : Number((cpcCents / 100).toFixed(2)),
    cpcCoverage: rowsIn.length ? Number((cpcValues.length / rowsIn.length).toFixed(2)) : 0,
    commercialVolume: commercial,
    informationalVolume: informational,
    intentCoverage: rowsIn.length ? Number((withIntent.length / rowsIn.length).toFixed(2)) : 0,
    commercialShareOfClassifiedVolume: classified ? Number((commercial / classified).toFixed(3)) : null,
  };

  // -------------------------------------------------------------- editorial
  const editorial = {
    proximityToPurchase: PROXIMITY[cluster] !== undefined ? PROXIMITY[cluster] : 0.2,
    winnability: WINNABILITY[cluster] !== undefined ? WINNABILITY[cluster] : 0.4,
    pagesAllocated: pagesFor(cluster),
    why: ASSUMPTION_NOTES[cluster] || 'no note written, treat the two factors above as unjustified',
    measured: false,
  };

  // ---------------------------------------------------------------- derived
  const score = Math.round(measured.volume * editorial.proximityToPurchase * editorial.winnability);
  const derived = {
    score,
    // Monetisation potential: volume close to a purchase, weighted by what the
    // market pays for that click. CPC is a real price signal, since it is what
    // competitors actually bid, but the weighting by proximity is mine.
    monetisationIndex: Math.round(measured.volume * editorial.proximityToPurchase * ((cpcCents || 0) / 100)),
    volumePerPage: editorial.pagesAllocated ? Math.round(measured.volume / editorial.pagesAllocated) : null,
  };

  return { cluster, measured, editorial, derived };
});

rows.sort((a, b) => b.derived.score - a.derived.score);

// Banding by cumulative share of the total score rather than by distance from
// the leader. One cluster here is several times the next, so a threshold
// measured against the top would put a single row in band A and tell us
// nothing. Share of the whole answers the question actually being asked: where
// does the work pay for itself, and where does it stop paying.
const totalScore = rows.reduce((a, r) => a + r.derived.score, 0);
let running = 0;
rows.forEach((r) => {
  running += r.derived.score;
  const share = running / totalScore;
  r.derived.shareOfScore = Number((r.derived.score / totalScore).toFixed(3));
  r.derived.cumulativeShare = Number(share.toFixed(3));
  if (share <= 0.8 || r === rows[0]) r.derived.band = 'A';
  else if (share <= 0.95) r.derived.band = 'B';
  else r.derived.band = 'C';
});

const out = {
  generatedAt: new Date().toISOString(),
  source: 'data/ only, no Ahrefs request made by this script',
  structure: {
    measured: 'returned by Ahrefs. Volume, difficulty, CPC and intent, each with the coverage of the rows that carried the field.',
    editorial: 'decided by us, not measured. Proximity to purchase, winnability, and the page allocation taken from data/plan-report.json.',
    derived: 'arithmetic over the two above. score = measured volume x proximity x winnability. Discard the editorial block and the score goes with it.',
  },
  totals: {
    addressableVolume: sum(addressable),
    addressableKeywords: addressable.length,
    clusters: rows.length,
    pagesInPlan: plan.plan.total,
  },
  clusters: rows,
};

writeFileSync(new URL('../data/cluster-priority.json', import.meta.url), JSON.stringify(out, null, 2));

// ---------------------------------------------------------------- the report

const pad = (s, n) => String(s === null || s === undefined ? '-' : s).padEnd(n);
const num = (s, n) => String(s === null || s === undefined ? '-' : s).padStart(n);
const pct = (v) => (v === null || v === undefined ? '-' : Math.round(v * 100) + '%');

console.log('CLUSTER PRIORITY, computed from data/ with no Ahrefs request');
console.log('');
console.log('BLOCK 1 of 3: MEASURED. Returned by Ahrefs. Coverage columns say how many rows carried the field.');
console.log('');
console.log(
  '  ' + pad('cluster', 20) + num('volume', 9) + num('kw', 6) + num('KD', 5) + num('KDcov', 7) +
    num('CPC', 7) + num('CPCcov', 8) + num('com%', 6) + num('intcov', 8)
);
console.log('  ' + '-'.repeat(76));
rows.forEach((r) => {
  const m = r.measured;
  console.log(
    '  ' + pad(r.cluster, 20) + num(m.volume.toLocaleString('en-US'), 9) + num(m.keywords, 6) +
      num(m.medianDifficulty, 5) + num(pct(m.difficultyCoverage), 7) + num(m.medianCpcUsd, 7) +
      num(pct(m.cpcCoverage), 8) + num(pct(m.commercialShareOfClassifiedVolume), 6) + num(pct(m.intentCoverage), 8)
  );
});

console.log('');
console.log('BLOCK 2 of 3: EDITORIAL ASSUMPTIONS. Not measured. Our judgement, stated so it can be argued with.');
console.log('');
console.log('  ' + pad('cluster', 20) + num('prox', 6) + num('win', 6) + num('pages', 7) + '  reason');
console.log('  ' + '-'.repeat(118));
rows.forEach((r) => {
  const e = r.editorial;
  console.log('  ' + pad(r.cluster, 20) + num(e.proximityToPurchase, 6) + num(e.winnability, 6) + num(e.pagesAllocated, 7) + '  ' + e.why);
});

console.log('');
console.log('BLOCK 3 of 3: DERIVED. score = measured volume x proximity x winnability. Two of those three are ours.');
console.log('');
console.log('  ' + pad('cluster', 20) + num('score', 10) + num('share', 8) + num('cum', 7) + num('vol/pg', 9) + num('monet', 12) + '  band');
console.log('  ' + '-'.repeat(80));
['A', 'B', 'C'].forEach((band) => {
  const inBand = rows.filter((r) => r.derived.band === band);
  if (!inBand.length) return;
  inBand.forEach((r) => {
    const d = r.derived;
    console.log(
      '  ' + pad(r.cluster, 20) + num(d.score.toLocaleString('en-US'), 10) + num(pct(d.shareOfScore), 8) +
        num(pct(d.cumulativeShare), 7) + num(d.volumePerPage, 9) + num(d.monetisationIndex.toLocaleString('en-US'), 12) + '  ' + band
    );
  });
});

console.log('');
console.log('A: write these first. B: worth having, after A. C: not now.');
console.log('Discard block 2 and block 3 goes with it. Block 1 stands on its own.');
console.log('Written to data/cluster-priority.json');
