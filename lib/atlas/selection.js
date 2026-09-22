// Selection.
//
// The candidate space is larger than the programme. Selection is the step
// that turns "combinations that exist" into "the combinations worth building
// first", and it optimises for value, not for the number of URLs.
//
// Until DataForSEO has measured the verticals, the ranking runs on family
// level priors and entity level signals. That is stated in every output: a
// selection made before measurement is a build order, not a publication
// decision, and no page reaches `measured` through it.
//
// The guardrail is a signal, not a quota. No arbitrary percentage is imposed
// without data. What the guardrail does is refuse to let a share pass
// unremarked: if one family or one vertical grows past the thresholds below,
// the report says so by name, with the number.

import { FAMILIES, familyIds, priorityOf, familyPrior } from './verticals.js';
import { inventory, entityPools, familyCount } from './inventory.js';
import { MARKETS } from './markets.js';
import { loadDataset } from './data.js';

export const TARGET = 300000;

// Thresholds for the signal. They are reporting thresholds: crossing one
// prints a warning with the name and the number, it does not silently cut.
export const GUARDRAIL = {
  familyShare: 0.1,
  verticalShare: 0.25,
  lowPriorityShare: 0.2,
  singleFamilyOfLowPriority: 0.08,
};

export const VALUE_BANDS = { high: 0.72, medium: 0.55 };

export function bandOf(family) {
  const p = familyPrior(family);
  if (p >= VALUE_BANDS.high) return 'high-value';
  if (p >= VALUE_BANDS.medium) return 'medium-value';
  return 'low-value';
}

// Families that are selected whatever their score, and why. A ranking that
// only ever takes the most commercial families produces orphans: the pages a
// reader lands on and the pages that link the commercial ones together are
// the first thing it would drop. Two rules protect against that.
//
//   structural  the family is the linking spine. Every city family links up
//               to the city hub, so removing it orphans the pages above it.
//   published   pages of this family are already live, and the programme does
//               not retire live pages to improve a distribution table.
export function mandatoryFamilies({ registry = null } = {}) {
  const out = new Map();
  for (const f of familyIds()) {
    if (FAMILIES[f].structural) out.set(f, 'structural: it is the linking spine, and dropping it orphans the pages that link up to it');
  }
  const reg = registry || safeRegistry();
  for (const key of Object.keys(reg)) {
    const family = familyOfKey(key);
    if (family && !out.has(family)) out.set(family, 'already published: pages of this family are live and are not retired to improve a distribution table');
  }
  return out;
}

// The registry still uses the first key shape, family:locale:entity[:month].
// Reading it defensively keeps this module usable before the migration.
function familyOfKey(key) {
  const head = String(key).split(':')[0];
  if (FAMILIES[head]) return head;
  if (head === 'city-month') return 'weather.city-month';
  if (head === 'city-guide') return 'destinations.city-hub';
  if (head === 'airport') return 'airports.guide';
  return null;
}

function safeRegistry() {
  try {
    return loadDataset().registry.entries || {};
  } catch {
    return {};
  }
}

// Rank families by what they are worth, then walk down the list taking whole
// families until the target is met. Taking whole families keeps the result
// explainable: the build order is a list of families, not an opaque cut
// through a ranked list of a million rows. The mandatory families are taken
// first, at the top of the order, and they are named in the output with the
// reason they were taken.
export function selectFamilies({ target = TARGET, pools = entityPools(), registry = null } = {}) {
  const mandatory = mandatoryFamilies({ registry });
  const rows = familyIds()
    .map((f) => ({ ...familyCount(f, pools), band: bandOf(f), prior: familyPrior(f), mandatory: mandatory.get(f) || null }))
    .sort((a, b) => (a.mandatory ? 0 : 1) - (b.mandatory ? 0 : 1) || b.prior - a.prior || b.candidates - a.candidates);
  const taken = [];
  let total = 0;
  for (const r of rows) {
    if (total >= target && !r.mandatory) break;
    taken.push(r);
    total += r.candidates;
  }
  return { rows, taken, total, target, reachedTarget: total >= target, remaining: rows.slice(taken.length), mandatory: [...mandatory].map(([family, reason]) => ({ family, reason })) };
}

// Distribution over whatever set is handed in, with the guardrail applied.
export function distribution(rows) {
  const total = rows.reduce((t, r) => t + r.candidates, 0);
  const byVertical = {};
  const byPriority = { high: 0, medium: 0, low: 0 };
  const byBand = { 'high-value': 0, 'medium-value': 0, 'low-value': 0 };
  for (const r of rows) {
    byVertical[r.vertical] = (byVertical[r.vertical] || 0) + r.candidates;
    byPriority[r.priority] += r.candidates;
    byBand[r.band || bandOf(r.family)] += r.candidates;
  }
  const warnings = [];
  for (const r of rows) {
    const share = r.candidates / total;
    if (share > GUARDRAIL.familyShare) {
      warnings.push({ kind: 'family share', name: r.family, candidates: r.candidates, share: round(share), threshold: GUARDRAIL.familyShare, priority: r.priority });
    }
    if (r.priority === 'low' && share > GUARDRAIL.singleFamilyOfLowPriority) {
      warnings.push({ kind: 'low priority family share', name: r.family, candidates: r.candidates, share: round(share), threshold: GUARDRAIL.singleFamilyOfLowPriority });
    }
  }
  for (const [v, n] of Object.entries(byVertical)) {
    if (n / total > GUARDRAIL.verticalShare) warnings.push({ kind: 'vertical share', name: v, candidates: n, share: round(n / total), threshold: GUARDRAIL.verticalShare });
  }
  if (byPriority.low / total > GUARDRAIL.lowPriorityShare) {
    warnings.push({ kind: 'low priority total', name: 'all low priority families', candidates: byPriority.low, share: round(byPriority.low / total), threshold: GUARDRAIL.lowPriorityShare });
  }
  return {
    total,
    byVertical: sortDesc(byVertical),
    byPriority,
    byBand,
    shares: {
      byPriority: Object.fromEntries(Object.entries(byPriority).map(([k, n]) => [k, round(n / total)])),
      byBand: Object.fromEntries(Object.entries(byBand).map(([k, n]) => [k, round(n / total)])),
    },
    warnings,
  };
}

const round = (x) => Math.round(x * 1000) / 10;
const sortDesc = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]));

// What has to be measured before the selection is a publication decision
// rather than a build order. One row per family and market, with the reason
// it matters and what it would change.
export function measurementPlan({ pools = entityPools() } = {}) {
  const rows = [];
  for (const f of familyIds()) {
    const count = familyCount(f, pools);
    for (const m of marketsOf(count)) {
      rows.push({
        family: f,
        market: m,
        priority: count.priority,
        band: bandOf(f),
        candidates: Math.round(count.candidates / count.markets),
        why: count.priority === 'low'
          ? 'It is enumerated only in the active markets. Measured demand is what would earn it more.'
          : 'Its share of the final selection depends on measured demand, intent and competition in this market.',
      });
    }
  }
  return rows.sort((a, b) => b.candidates - a.candidates);
}

function marketsOf(count) {
  // familyCount reports how many markets, not which; the inventory module
  // owns that mapping and re-deriving it here would let the two drift.
  return Array.from({ length: count.markets }, (_, i) => i).map((i) => i);
}

export function selectionReport({ target = TARGET } = {}) {
  const pools = entityPools();
  const inv = inventory(pools);
  const sel = selectFamilies({ target, pools });
  const all = distribution(sel.rows);
  const selected = distribution(sel.taken);
  return {
    generatedAt: new Date().toISOString(),
    basis: 'Family level priors and entity level signals. No page reaches measured through this report.',
    target,
    candidates: { total: inv.total, selected: sel.total, reachedTarget: sel.reachedTarget, familiesSelected: sel.taken.length, familiesTotal: sel.rows.length },
    distributionAll: all,
    distributionSelected: selected,
    mandatory: sel.mandatory,
    top20: sel.rows.slice().sort((a, b) => b.prior - a.prior).slice(0, 20).map((r) => ({ family: r.family, vertical: r.vertical, priority: r.priority, band: r.band, prior: r.prior, candidates: r.candidates, markets: r.markets, entities: r.entities })),
    notSelected: sel.remaining.map((r) => ({ family: r.family, priority: r.priority, prior: r.prior, candidates: r.candidates, keptBecause: FAMILIES[r.family].keptBecause || null })),
    markets: Object.fromEntries(Object.entries(MARKETS).map(([k, m]) => [k, m.state])),
  };
}
