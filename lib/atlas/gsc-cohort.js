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
export const DIMENSIONS = ['cohort', 'surface', 'family', 'market', 'destination'];

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
