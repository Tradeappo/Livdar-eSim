// Search Console, split by cohort and by everything else that matters.
//
// Every cohort in today's report has null for indexation, and the gate
// correctly refuses to call that a pass. The workflow to fill it exists and
// has never had credentials. This is the part that can be built without them:
// the shape the data has to take, the split it has to support, and the rule
// that an absent number is unknown rather than zero.
//
// That last rule is the one worth protecting with code. It is very easy to
// write a report where a cohort with no data shows a clean sheet, and very
// hard to notice afterwards that a clean sheet was what a missing import
// looked like.

export const METRICS = ['published', 'discovered', 'indexed', 'impressions', 'clicks', 'ctr', 'position'];
// Language and market are not the same split and both are needed. Cohort 001
// is 87 pages of English across one market; a market split cannot separate the
// language from the country it was measured in, and the SERP finding that
// English faces the hardest competition is a finding about the language.
export const DIMENSIONS = ['cohort', 'surface', 'family', 'language', 'market', 'destination'];

export const UNKNOWN = null;

// A row as the import produces it. Only `published` comes from the registry;
// everything else comes from Search Console and is unknown until it does.
export const emptyRow = (key) => ({
  key,
  published: 0,
  discovered: UNKNOWN,
  indexed: UNKNOWN,
  impressions: UNKNOWN,
  clicks: UNKNOWN,
  ctr: UNKNOWN,
  position: UNKNOWN,
  importedAt: null,
  source: 'not imported',
});

// Sum rows without inventing numbers. A total over rows where some are
// unknown is itself unknown for that metric, which is the whole point: three
// known cohorts and one unmeasured one do not make a measured total.
export function aggregate(rows) {
  const out = { published: 0 };
  for (const m of METRICS) {
    if (m === 'published') continue;
    if (m === 'ctr' || m === 'position') continue;
    let sum = 0;
    let known = true;
    for (const r of rows) {
      if (r[m] === UNKNOWN) { known = false; break; }
      sum += r[m];
    }
    out[m] = known ? sum : UNKNOWN;
  }
  for (const r of rows) out.published += r.published || 0;
  // Rate metrics are derived from the counts rather than averaged, because an
  // average of rates weights a cohort of ten the same as a cohort of ten
  // thousand.
  out.ctr = out.impressions === UNKNOWN || out.clicks === UNKNOWN || !out.impressions ? UNKNOWN : Math.round((out.clicks / out.impressions) * 10000) / 10000;
  const weighted = rows.filter((r) => r.position !== UNKNOWN && r.impressions !== UNKNOWN && r.impressions > 0);
  out.position = weighted.length === rows.length && weighted.length
    ? Math.round((weighted.reduce((t, r) => t + r.position * r.impressions, 0) / weighted.reduce((t, r) => t + r.impressions, 0)) * 100) / 100
    : UNKNOWN;
  out.rowsUnknown = rows.filter((r) => r.indexed === UNKNOWN).length;
  out.rows = rows.length;
  return out;
}

// Where the pages actually rank, in the three buckets a launch is judged on.
//
// An average position over two hundred pages is a number that hides the only
// thing worth knowing, which is how many of them reached a page a reader looks
// at. Two cohorts can share an average of forty and one of them can have thirty
// pages in the top ten while the other has none.
//
// A page with no impressions has no position, so it is counted separately rather
// than as position zero or as a page outside the top hundred: it was not ranked
// badly, it was not shown.
export const POSITION_BUCKETS = [
  { key: 'top10', at: 10 },
  { key: 'top20', at: 20 },
  { key: 'top100', at: 100 },
];

export function positions(rows) {
  const out = { ranked: 0, notShown: 0, unknown: 0 };
  for (const b of POSITION_BUCKETS) out[b.key] = 0;
  for (const r of rows) {
    if (r.position === UNKNOWN) {
      // Two different unknowns. A page Search Console covered and did not return
      // earned nothing, which is a measurement; a page nobody imported yet is
      // not measured at all.
      if (r.impressions === 0) out.notShown++;
      else out.unknown++;
      continue;
    }
    out.ranked++;
    for (const b of POSITION_BUCKETS) if (r.position <= b.at) out[b.key]++;
  }
  return out;
}

// Split a set of measured pages along any dimension. The dimension has to be
// one of the five, so a typo produces an error instead of an empty report.
export function splitBy(pages, dimension) {
  if (!DIMENSIONS.includes(dimension)) throw new Error('unknown dimension: ' + dimension + ', expected one of ' + DIMENSIONS.join(', '));
  const groups = new Map();
  for (const p of pages) {
    const k = p[dimension] ?? 'unattributed';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  }
  return [...groups.entries()].map(([key, rows]) => ({ [dimension]: key, ...aggregate(rows) }));
}

// Indexation as a rate, and only where it can honestly be computed.
export function indexationRate(row) {
  if (row.indexed === UNKNOWN || !row.published) return { rate: UNKNOWN, why: row.indexed === UNKNOWN ? 'no Search Console data imported' : 'nothing published' };
  return { rate: Math.round((row.indexed / row.published) * 1000) / 1000, why: null };
}

// The report the gate reads. It refuses to produce a verdict for a cohort
// whose data has not been imported, which is what stops an unmeasured cohort
// reading as a healthy one.
export function cohortReport(pages) {
  const byCohort = splitBy(pages, 'cohort');
  return byCohort.map((c) => {
    const ix = indexationRate(c);
    return {
      ...c,
      indexationRate: ix.rate,
      measurable: ix.rate !== UNKNOWN,
      whyNotMeasurable: ix.why,
      perThousand: c.impressions === UNKNOWN || !c.published ? UNKNOWN : {
        impressions: Math.round((c.impressions / c.published) * 1000),
        clicks: c.clicks === UNKNOWN ? UNKNOWN : Math.round((c.clicks / c.published) * 1000),
      },
    };
  });
}

// What is missing, named. A report that says nothing is measured is less
// useful than one that says which imports are outstanding.
export function importGaps(pages) {
  const gaps = [];
  for (const d of DIMENSIONS) {
    for (const row of splitBy(pages, d)) {
      if (row.rowsUnknown > 0) gaps.push({ dimension: d, key: row[d], rowsUnknown: row.rowsUnknown, rows: row.rows });
    }
  }
  return gaps.sort((a, b) => b.rowsUnknown - a.rowsUnknown);
}

// A single number for a cohort, and the raw metrics that produced it.
//
// The score exists because a launch of two cohorts across four surfaces and
// nine languages produces more numbers than anyone reads, and a ranking is
// what makes them comparable. It is dangerous for exactly the same reason, so
// three rules apply.
//
// It is unknown whenever any input is unknown, rather than falling back to the
// inputs that happen to exist. A cohort with indexation and no impressions is
// not a cohort scoring zero on impressions; it is a cohort that has not been
// measured, and the difference is the whole point of the UNKNOWN convention
// above.
//
// It is a product rather than a weighted sum, because the stages are a funnel:
// a page that is not indexed cannot earn an impression, and a sum would let a
// strong position paper over an indexation failure.
//
// And it never travels alone. Every score carries the components that produced
// it, so the answer to "why is this cohort ahead" is one field away rather
// than a re-derivation.

// Impressions per published page at which the impression term saturates.
// Above it, more impressions stop moving the score, so one page that takes off
// cannot carry a cohort of two hundred that did not.
//
// Five hundred is a judgement rather than a measurement, and it is the one
// number here that somebody should argue with once real data exists. It is
// written as a constant for that reason: changing it is a one line change with
// a visible effect, rather than a tuning buried in a formula.
export const IMPRESSION_REFERENCE = 500;

// Positions worse than this contribute nothing. Twenty is the bottom of page
// two, past which the difference between ranks is not worth modelling.
export const POSITION_FLOOR = 20;

export function signalScore(row) {
  const components = {
    indexation: row.published ? (row.indexed === UNKNOWN ? UNKNOWN : Math.round((row.indexed / row.published) * 1000) / 1000) : UNKNOWN,
    impressionsPerPage: row.impressions === UNKNOWN || !row.published ? UNKNOWN : Math.round((row.impressions / row.published) * 10) / 10,
    position: row.position === UNKNOWN ? UNKNOWN : row.position,
  };
  const why = [];
  if (components.indexation === UNKNOWN) why.push(row.published ? 'no indexation imported' : 'nothing published');
  if (components.impressionsPerPage === UNKNOWN) why.push('no impressions imported');
  if (components.position === UNKNOWN) why.push('no position imported');
  if (why.length) {
    return { score: UNKNOWN, components, raw: rawOf(row), whyUnknown: why, note: 'A score is withheld rather than computed from the parts that happen to exist.' };
  }
  const reach = Math.min(1, components.impressionsPerPage / IMPRESSION_REFERENCE);
  const rank = Math.max(0, (POSITION_FLOOR + 1 - components.position) / POSITION_FLOOR);
  const score = Math.round(components.indexation * reach * Math.min(1, rank) * 1000) / 1000;
  return {
    score,
    components: { ...components, reach: Math.round(reach * 1000) / 1000, rank: Math.round(Math.min(1, rank) * 1000) / 1000 },
    raw: rawOf(row),
    whyUnknown: [],
    note: 'The product of three funnel stages. It ranks cohorts against each other and means nothing on its own, which is why the raw metrics travel with it.',
  };
}

// The untouched numbers, carried alongside the score so that nothing has to be
// taken on the score's word.
export function rawOf(row) {
  return Object.fromEntries(METRICS.map((m) => [m, row[m] === undefined ? UNKNOWN : row[m]]));
}

// Every dimension scored at once, which is the comparison the launch is for:
// which surface, which language, which family and which cohort actually earned
// anything, with the gaps named rather than scored as zero.
export function comparison(pages) {
  const out = {};
  for (const d of DIMENSIONS) {
    out[d] = splitBy(pages, d).map((row) => ({ key: row[d], ...signalScore(row), published: row.published, rowsUnknown: row.rowsUnknown }));
  }
  return {
    dimensions: DIMENSIONS,
    measurable: Object.values(out).flat().filter((r) => r.score !== UNKNOWN).length,
    withheld: Object.values(out).flat().filter((r) => r.score === UNKNOWN).length,
    by: out,
  };
}
