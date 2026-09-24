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

// What the second cohort is for, written as a floor per surface.
//
// The first version of cohort 002 was selected by the rule below, which
// spreads across families. It came out as 178 cost of living pages and 72
// climate pages: two families, two surfaces, and a cohort that can only
// answer whether climate outranks cost of living. That is not the question.
// The question is which part of the product earns the strongest organic
// signal, and a cohort that carries two of its surfaces cannot answer it
// however well it is balanced inside them.
//
// So the floor comes first and the value ranking comes second. A surface with
// fewer eligible pages than its floor contributes everything it has and the
// gap is reported rather than filled from somewhere else.
export const SURFACE_FLOOR = {
  pulse: 45, areas: 35, work: 28, move: 28, sport: 20, tools: 20, stay: 5,
  // Both of these are zero available and both stay in the table. A floor a
  // surface cannot meet is the only way the result can report the shortfall
  // with a number against it rather than leaving the surface out silently.
  community: 10, safety: 10,
};

// The other half of the same instruction. The floors stop a surface being
// absent; the ceilings stop one surface being most of the cohort. Without
// them the fair share rule fills the remainder from whichever surface has
// the most eligible pages, which here means cost of living and salaries, and
// the cohort drifts back towards the shape it was rebuilt to get away from.
//
// A ceiling is not a hard limit. If the target cannot be reached under them,
// they are lifted for a third pass and the pages taken that way are counted,
// because a cohort short of its size measures less than a cohort that is
// slightly lopsided and says so.
export const SURFACE_CEILING = {
  // Revised 2026-09-25 against the second brief, which reads the first version
  // of this cohort as still not a product experiment: Climate and Move between
  // them were a hundred and fifteen of the two hundred and fifty, and both are
  // the surfaces with the most eligible pages rather than the most product.
  //
  // So Climate is capped at twenty five, which is the tightest number in this
  // table and the one the brief asks for by name. Everything the cap gives up
  // goes to the surfaces that were built for this cohort: Pulse can take fifty
  // five, which is ten above the brief's range, and that is a deliberate
  // trade. Holding Pulse to forty five would have pushed Climate back to forty
  // six, and a cohort that exceeds one target to honour another is better than
  // one that misses the target the brief singled out.
  pulse: 55, areas: 40, work: 35, move: 35, sport: 35, tools: 35, stay: 40,
  climate: 25, community: 25, safety: 20, transport: 30, connectivity: 30,
};

// The diversified subset, then the filler. Both are recorded separately,
// because a reader of the result has to be able to tell the pages that are
// there to answer the question from the pages that are there to fill the
// cohort to its size.
export function selectDiversified(pages, { target = TARGET, floors = SURFACE_FLOOR, ceilings = SURFACE_CEILING } = {}) {
  const bySurface = new Map();
  for (const p of pages) {
    if (!bySurface.has(p.surface)) bySurface.set(p.surface, []);
    bySurface.get(p.surface).push(p);
  }
  const chosen = new Set();
  const experimental = [];
  const shortBySurface = {};

  // Pass one: every surface up to its floor, spread across the families and
  // markets inside it by the same fair rule used for the whole cohort.
  for (const surface of [...bySurface.keys()].sort()) {
    const want = floors[surface];
    if (!want) continue;
    const pool = bySurface.get(surface);
    const take = Math.min(want, pool.length);
    if (pool.length < want) shortBySurface[surface] = { wanted: want, available: pool.length };
    const { selected } = selectCohort(pool, { target: take });
    for (const p of selected) { chosen.add(p); experimental.push(p); }
  }
  for (const [surface, want] of Object.entries(floors)) {
    if (!bySurface.has(surface)) shortBySurface[surface] = { wanted: want, available: 0 };
  }

  // Pass two: the rest of the target, from everything not already taken, with
  // each surface capped.
  const countsBySurface = experimental.reduce((m, p) => (m[p.surface] = (m[p.surface] || 0) + 1, m), {});
  const room = (p) => {
    const cap = ceilings[p.surface];
    return cap == null || (countsBySurface[p.surface] || 0) < cap;
  };
  const rest = pages.filter((p) => !chosen.has(p));
  const filler = [];
  const capped = rest.filter(room);
  const remaining = Math.max(0, target - experimental.length);
  const { selected: firstFill } = selectCohort(capped.filter((p) => {
    // Re-checked per page as the counts move, so a surface stops being drawn
    // from the moment it reaches its ceiling.
    if (!room(p)) return false;
    countsBySurface[p.surface] = (countsBySurface[p.surface] || 0) + 1;
    return true;
  }), { target: remaining });
  for (const p of firstFill) { chosen.add(p); filler.push(p); }

  // Pass three, only if the target is still short: the same pool with the
  // ceilings lifted. Counted separately so the report can say how much of the
  // cohort had to break its own shape to reach its size.
  const overflow = [];
  let shortfall = Math.max(0, target - experimental.length - filler.length);
  if (shortfall > 0) {
    const left = pages.filter((p) => !chosen.has(p));
    const { selected: extra, shortfall: stillShort } = selectCohort(left, { target: shortfall });
    for (const p of extra) { chosen.add(p); filler.push(p); overflow.push(p); }
    shortfall = stillShort;
  }

  const all = [...experimental, ...filler];
  for (const p of all) { p.band = bandOf(p.difficulty); p.expectedValue = expectedValue(p); }
  const key = (p) => p.family + '|' + p.entity + '|' + p.market;
  const experimentalKeys = new Set(experimental.map(key));
  all.sort((a, b) => b.expectedValue - a.expectedValue || a.family.localeCompare(b.family) || a.market.localeCompare(b.market) || String(a.entity).localeCompare(String(b.entity)));
  for (const p of all) p.role = experimentalKeys.has(key(p)) ? 'diversified subset' : 'filler';

  const countBy = (rows, k) => rows.reduce((m, p) => (m[p[k]] = (m[p[k]] || 0) + 1, m), {});
  return {
    selected: all,
    shortfall,
    floors,
    surfacesShort: shortBySurface,
    ceilings,
    experimental: { pages: experimental.length, bySurface: countBy(experimental, 'surface'), byFamily: countBy(experimental, 'family') },
    filler: { pages: filler.length, bySurface: countBy(filler, 'surface'), byFamily: countBy(filler, 'family') },
    overCeiling: { pages: overflow.length, bySurface: countBy(overflow, 'surface') },
    available: Object.fromEntries([...bySurface].map(([k, v]) => [k, v.length])),
  };
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
