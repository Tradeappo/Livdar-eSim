// The first real cohort, selected from pages rather than families.
//
// The earlier cohort design allocated slots to families and counted
// candidates, which was the right instrument while nothing was eligible and
// the question was what could be built. It cannot select this cohort, because
// the unit of a cohort is a URL and a family is not a URL.
//
// A cohort is a measurement instrument, and that decides every rule here.
//
// Spread comes first, because a cohort drawn from one family in one market
// measures that family in that market and generalises to nothing. But spread
// is bounded by what exists: six of the seven eligible families have fewer
// than twenty five pages between all their markets, so an even split is
// impossible and pretending otherwise would mean padding with pages that are
// not eligible. The rule is therefore equal share first, surplus to whoever
// has room, which is the standard fair division rule and is not a tuned
// threshold. Whatever concentration comes out of it is a fact about the data
// layer and is reported as one.
//
// Winnability is recorded and never used to exclude. The salary calculator at
// 254,000 a month and difficulty 44 in Poland is an eligible page and belongs
// in the cohort; it is also not a page that will rank in six weeks, and a
// cohort that could not tell the difference would read its own failure as a
// finding about indexation. So every page carries a band, and the metrics are
// segmented by it.

export const TARGET = 250;

// Difficulty bands, named for what they say about expectation rather than for
// their numbers. Unknown is its own band because Ahrefs returning no
// difficulty is not the same as difficulty zero.
export const BANDS = {
  winnable: { max: 30, expectation: 'can plausibly rank within the measurement window' },
  contested: { max: 60, expectation: 'ranking is a matter of authority, not of the page' },
  'long-shot': { max: 100, expectation: 'recorded at full size and not a launch target' },
  unknown: { max: null, expectation: 'no difficulty was returned, so nothing is expected either way' },
};

export function bandOf(difficulty) {
  if (difficulty == null) return 'unknown';
  if (difficulty <= BANDS.winnable.max) return 'winnable';
  if (difficulty <= BANDS.contested.max) return 'contested';
  return 'long-shot';
}

const winnability = (d) => (d == null ? 0.6 : Math.max(0.05, 1 - d / 100));
export const expectedValue = (p) => Math.round(p.volume * winnability(p.difficulty));

// Equal share, then surplus to whoever has room. Deterministic: families are
// visited in a fixed order and the loop repeats until either the target is
// met or no family can take another page.
export function allocate(available, target = TARGET) {
  const keys = Object.keys(available).sort();
  const alloc = Object.fromEntries(keys.map((k) => [k, 0]));
  let remaining = target;
  let progress = true;
  while (remaining > 0 && progress) {
    const withRoom = keys.filter((k) => alloc[k] < available[k]);
    if (!withRoom.length) break;
    const share = Math.max(1, Math.floor(remaining / withRoom.length));
    progress = false;
    for (const k of withRoom) {
      if (remaining <= 0) break;
      const take = Math.min(share, available[k] - alloc[k], remaining);
      if (take <= 0) continue;
      alloc[k] += take; remaining -= take; progress = true;
    }
  }
  return { alloc, shortfall: remaining };
}

// Round robin across markets inside a family, so that a family's slots are
// spread over its markets instead of being filled from whichever market has
// the biggest numbers. Within a market, the most valuable page first.
function interleaveByMarket(pages, take) {
  const byMarket = new Map();
  for (const p of pages) {
    if (!byMarket.has(p.market)) byMarket.set(p.market, []);
    byMarket.get(p.market).push(p);
  }
  const markets = [...byMarket.keys()].sort();
  for (const m of markets) byMarket.get(m).sort((a, b) => expectedValue(b) - expectedValue(a) || a.entity.localeCompare(b.entity));
  const out = [];
  for (let i = 0; out.length < take; i++) {
    let moved = false;
    for (const m of markets) {
      const list = byMarket.get(m);
      if (i >= list.length) continue;
      out.push(list[i]); moved = true;
      if (out.length >= take) break;
    }
    if (!moved) break;
  }
  return out;
}

export function selectCohort(pages, { target = TARGET } = {}) {
  const byFamily = new Map();
  for (const p of pages) {
    if (!byFamily.has(p.family)) byFamily.set(p.family, []);
    byFamily.get(p.family).push(p);
  }
  const available = Object.fromEntries([...byFamily].map(([k, v]) => [k, v.length]));
  const { alloc, shortfall } = allocate(available, target);

  const selected = [];
  for (const family of Object.keys(alloc).sort()) {
    if (!alloc[family]) continue;
    selected.push(...interleaveByMarket(byFamily.get(family), alloc[family]));
  }
  for (const p of selected) { p.band = bandOf(p.difficulty); p.expectedValue = expectedValue(p); }
  selected.sort((a, b) => b.expectedValue - a.expectedValue || a.family.localeCompare(b.family) || a.market.localeCompare(b.market) || a.entity.localeCompare(b.entity));
  return { selected, allocation: alloc, available, shortfall };
}

// What each family in the cohort can and cannot support a claim about. A
// family with five pages in the cohort can be published and cannot be
// measured, and saying so in the manifest is cheaper than discovering it when
// somebody reads a rate off five pages.
//
// The floor is the sample at which a rate around one half is estimated to
// roughly plus or minus fifteen points at ninety five percent confidence,
// which is the coarsest estimate still worth reporting.
export const MEASURABLE_FLOOR = 40;
export function measurability(counts) {
  return Object.fromEntries(Object.entries(counts).map(([k, n]) => [k, {
    pages: n,
    measurable: n >= MEASURABLE_FLOOR,
    // Half width of the ninety five percent interval on a rate of one half.
    marginPoints: Math.round((1.96 * Math.sqrt(0.25 / n)) * 1000) / 10,
    note: n >= MEASURABLE_FLOOR ? 'supports a rate for this family' : 'published and counted, too few to read a rate from on its own',
  }]));
}

export function cohortSummary(selected) {
  const count = (key) => selected.reduce((m, p) => (m[p[key]] = (m[p[key]] || 0) + 1, m), {});
  const byFamily = count('family');
  return {
    pages: selected.length,
    byFamily,
    bySurface: count('surface'),
    byMarket: count('market'),
    byBand: count('band'),
    byPriority: count('priority'),
    entities: new Set(selected.map((p) => p.entity)).size,
    languages: new Set(selected.map((p) => p.language)).size,
    totalVolume: selected.reduce((n, p) => n + p.volume, 0),
    highShare: Math.round((selected.filter((p) => p.priority === 'high').length / selected.length) * 1000) / 10,
    measurability: measurability(byFamily),
  };
}
