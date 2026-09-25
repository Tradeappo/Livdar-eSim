// The salary tools.
//
// The queue lists the salary calculator at 148,000 a month in the United
// States and difficulty 69, and records it as not a launch target. That is
// still true of the head term. It is not a reason to leave the tool
// unbuilt, because the tool is what the twenty three country salary pages
// compute against and what the comparison needs.
//
// What this tool will not do is the thing every other salary calculator
// does: take a gross figure and return a net one. Doing that needs the tax
// bands, the social contribution rates and the thresholds for each country,
// which is `tax-rules-verified`, which does not exist. What exists is the
// published average gross and the published average net for the same
// population in the same year, and the honest tool built on that answers a
// narrower question precisely rather than the wide question approximately.

import { forCountry, rankOn, countries as salaryCountries, SERIES } from '../salary.js';
import { forCountry as pricesFor } from '../cost-of-living.js';

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// What the tool can answer, stated so a caller cannot mistake it for a net
// pay calculator.
export const ANSWERS = [
  'what the average worker is paid in a country, gross and net, for the published year',
  'how far that pay goes once the price level of the same country is put beside it',
  'where a country sits among the others in the same series',
];
export const REFUSES = [
  'converting a particular gross salary into a net one, which needs tax bands nobody has ingested yet',
  'a figure for an occupation, a sector or a city, because the series does not split them',
  'comparing a country in this series with one outside it',
];

export function salary(iso2, { now = new Date() } = {}) {
  const s = forCountry(iso2, { now });
  if (!s) return { ok: false, why: 'this country is not in the salary series', answers: ANSWERS, refuses: REFUSES };

  const gross = s.measures.grossMonthly?.value ?? null;
  const net = s.measures.netMonthly?.value ?? null;
  const minimum = s.measures.minimumWageMonthly?.value ?? null;

  const out = {
    ok: true,
    iso2,
    asOf: s.asOf,
    currency: 'EUR',
    grossMonthly: gross,
    netMonthly: net,
    minimumWageMonthly: minimum,
    hasStatutoryMinimum: Boolean(minimum),
    takeHomeShare: gross && net ? round(net / gross, 3) : null,
    taxWedgePercent: s.wedge ? s.wedge.percent : null,
    // The population the figure describes. Every salary page has to say this
    // or the number reads as "what you would earn", which it is not.
    describes: 'a single person without children on the average wage, which is the case the series publishes',
    attribution: s.attribution,
  };

  if (minimum && net) {
    out.minimumAgainstAverage = {
      ratio: round(minimum / net, 3),
      percent: round((minimum / net) * 100, 1),
      meaning: 'the statutory floor is ' + round((minimum / net) * 100, 0) + ' percent of the average net wage',
    };
  }

  const r = rankOn(iso2, net ? 'netMonthly' : 'grossMonthly');
  if (r) out.rank = { position: r.rank, of: r.of, measure: r.measure, median: r.median };

  // Pay and prices come from two sources and are kept apart, but a salary
  // with no price level beside it answers half the question. The ratio is
  // labelled as crossing two sources rather than presented as one figure.
  const p = pricesFor(iso2, { now });
  if (p && net) {
    out.againstPrices = {
      priceLevel: p.headline.value,
      unit: p.headline.unit,
      priceAsOf: p.asOf,
      crossesSources: [p.headline.source, s.measures.netMonthly?.source || s.measures.grossMonthly?.source],
      caution: 'the pay and the price level come from two different series and two different years, so this is a rough pairing rather than a computed purchasing power figure',
    };
  }
  return out;
}

// Two countries on the same series. Refuses anything the series does not
// cover rather than filling it in.
export function compareSalary(isoA, isoB, { now = new Date() } = {}) {
  const a = salary(isoA, { now });
  const b = salary(isoB, { now });
  if (!a.ok) return { ok: false, why: isoA + ' is not in the salary series' };
  if (!b.ok) return { ok: false, why: isoB + ' is not in the salary series' };
  if (a.netMonthly == null || b.netMonthly == null) {
    return { ok: false, why: 'one of these countries has no net figure, and comparing a net wage with a gross one would be comparing two different things' };
  }
  if (a.asOf !== b.asOf) {
    // Different years is not fatal, but it is a fact about the comparison
    // and belongs in the answer rather than in a footnote nobody reads.
    // The comparison still runs; it just says what it is.
  }
  const ratio = a.netMonthly / b.netMonthly;
  const out = {
    ok: true,
    a: { iso2: isoA, netMonthly: a.netMonthly, asOf: a.asOf },
    b: { iso2: isoB, netMonthly: b.netMonthly, asOf: b.asOf },
    sameYear: a.asOf === b.asOf,
    ratio: round(ratio, 3),
    percentDifference: round((ratio - 1) * 100, 1),
  };

  // Pay compared without prices is the mistake this pairing exists to avoid:
  // a higher wage in a dearer country can be worth less.
  if (a.againstPrices && b.againstPrices && a.againstPrices.unit === b.againstPrices.unit) {
    const realA = a.netMonthly / a.againstPrices.priceLevel;
    const realB = b.netMonthly / b.againstPrices.priceLevel;
    out.adjustedForPrices = {
      ratio: round(realA / realB, 3),
      percentDifference: round((realA / realB - 1) * 100, 1),
      unit: a.againstPrices.unit,
      derivation: 'net pay divided by the price level, in both countries, on the same scale',
      caution: 'two sources and two reference years, so read the direction rather than the decimal',
      reversesTheHeadline: (ratio > 1) !== (realA / realB > 1),
    };
  } else if (a.againstPrices && b.againstPrices) {
    out.adjustedForPrices = null;
    out.whyNotAdjusted = 'the two countries are measured on different price scales, ' + a.againstPrices.unit + ' against ' + b.againstPrices.unit;
  }
  return out;
}

export function coverage() {
  const list = salaryCountries();
  const rows = list.map((iso2) => {
    const s = forCountry(iso2);
    return { iso2, series: Object.keys(s.measures), hasMinimum: s.hasMinimumWage, asOf: s.asOf };
  });
  return {
    countries: list.length,
    withGrossAndNet: rows.filter((r) => r.series.includes('grossMonthly') && r.series.includes('netMonthly')).length,
    withMinimumWage: rows.filter((r) => r.hasMinimum).length,
    series: Object.keys(SERIES),
    rows,
  };
}
