// Page models for the Atlas families.
//
// A model is the whole content of a page as data: title, description, h1,
// fact rows, paragraphs, a table, questions, links and sources. The renderer
// turns it into HTML and QA reads the same object, so what QA checks is what
// the page prints.
//
// Two rules make these pages survivable at scale, and both are structural
// rather than editorial.
//
// The first is that every sentence is selected by the data. Whether a page
// says the basket spread sentence depends on whether twelve categories exist
// for that country; whether it says the inflation sentence depends on whether
// an inflation series covers it and whether prices rose or fell. Two pages in
// the same family therefore differ by more than their numbers, which is what
// keeps a family of two hundred pages from being two hundred copies.
//
// The second is that nothing is filled in. A missing value produces a shorter
// page or no page at all, never an estimate. `build` returns a refusal with a
// reason rather than a model when the data is not there, and the cohort
// builder counts refusals instead of hiding them.

import { FAMILIES } from './verticals.js';
import { forCountry as colFor, BASKET, neighbours as colNeighbours } from './cost-of-living.js';
import { forCountry as salFor, rankOn, neighbours as salNeighbours } from './salary.js';
import { ranking as colRanking, store as colStore } from './cost-of-living.js';
import { RANKINGS, POPULATIONS } from './rankings.js';
import { TOOLS } from './tools-queue.js';
import { subject, plain, travelTo, keywordAliases } from './content/country-forms.js';
import { sameWord, ALIASES } from './keyword-country.js';
import { toolSpec, unitForMarket } from './tool-spec.js';
import { rankingName, measureShort, inputTerm, monthName, monthIn, joinList } from './content/terms.js';
import { forCountry as climateForCountry, sourceRecord as climateSource } from './climate.js';
import { toolCopy } from './content/tool-copy.js';
import { rankingCopy } from './content/ranking-copy.js';
import { atlasPath } from './atlas-urls.js';
import { store as salStore } from './salary.js';
import { estimate as movingCost, MOVE_SIZES } from './tools/moving-cost.js';
import { forCity as hoodsForCity, cityIds as hoodCityIds, sourceRecord as hoodSource, store as hoodStore, CENTRAL_KM as HOOD_CENTRAL_KM } from './neighbourhoods.js';
import { cityName } from './cities.js';
import { forCityActivity as sportForCity, sourceRecord as sportSource } from './sport.js';
import { forCountry as rentFor, sourceRecord as rentSource } from './rent.js';
import { forCountry as holidaysFor, forSubdivision as holidaysForRegion, splitEntity as splitRegion, nameOf as holidayName, sourceRecord as holidaySource } from './holidays.js';

import en from './content/lang/en.js';
import de from './content/lang/de.js';
import fr from './content/lang/fr.js';
import es from './content/lang/es.js';
import it from './content/lang/it.js';
import pt from './content/lang/pt.js';
import nl from './content/lang/nl.js';
import pl from './content/lang/pl.js';
import ja from './content/lang/ja.js';

export const PACKS = { en, de, fr, es, it, pt, nl, pl, ja };
export const languages = () => Object.keys(PACKS);

const SITE = 'https://livdar.com';

// Sentence case, applied at the paragraph rather than inside the phrase pack,
// so that a country whose subject form starts with an article comes out as
// "La Suisse" at the start of a sentence and "la Suisse" in the middle
// without every string having to carry two versions of itself.
const sentence = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// A heading built from the keyword that was measured. The keyword is
// lowercase as the provider returns it, so the country name is restored to
// its proper case and the first letter is raised. Languages that would
// rather build the heading themselves ignore this and use the country.
// Words that end a keyword and are not a proper noun, so that the inflected
// country fallback below does not capitalise an ordinary word. Kept short on
// purpose: it only has to cover keywords that end in something other than a
// place name.
const NOT_A_PLACE = new Set(['live', 'leben', 'vivre', 'vivir', 'vivere', 'viver', 'wonen', 'mieszkać', 'zycia', 'życia', 'calculator', 'rechner', 'kalkulator', 'vergleich', 'comparison', 'salary', 'budget', 'trasloco', 'mudanza', 'demenagement', 'wynagrodzeń', 'stipendio']);

export function headingFromKeyword(keyword, countryName, language, iso2 = null) {
  let h = String(keyword || '');
  let matched = false;
  if (countryName) {
    const i = h.toLowerCase().indexOf(countryName.toLowerCase());
    if (i >= 0) { h = h.slice(0, i) + countryName + h.slice(i + countryName.length); matched = true; }
  }
  // A common name that is not the CLDR name, and is more than one word. The
  // last token fallback below cannot case those: it turns `repubblica ceca`
  // into `repubblica Ceca`.
  if (!matched) {
    for (const [alias, cased] of keywordAliases(language)) {
      const i = h.toLowerCase().indexOf(alias);
      if (i >= 0) { h = h.slice(0, i) + cased + h.slice(i + alias.length); matched = true; break; }
    }
  }
  // Inflecting languages put the country in a case the CLDR nominative does
  // not match. Polish writes "koszty życia w szwajcarii" where the store
  // holds "Szwajcaria", so the name is not found and would stay lowercase.
  // The country is the last token in every one of these phrasings, so the
  // last token is raised when it is plainly a place rather than a common
  // noun.
  if (countryName && !matched) {
    const parts = h.split(' ');
    const last = parts[parts.length - 1];
    if (last && last.length > 3 && !NOT_A_PLACE.has(last.toLowerCase())) {
      // Only when the last token is that country in another shape. Otherwise
      // the token names something else and capitalising it writes the wrong
      // place into the heading: `cost of living in colorado` resolved to
      // Colombia through a stem rule that has since been tightened, and this
      // line is what put `Cost of living in Colorado` above a body about
      // Colombia. When the keyword does not name the country, the country
      // takes the slot the keyword put a place in, so the heading cannot
      // disagree with the page.
      // The market's own names for the country count as the country: the
      // Portuguese market writes `inglaterra` for the United Kingdom and the
      // page is right to keep that word in its heading, with the article the
      // keyword already carries.
      const forms = [countryName, ...Object.entries(ALIASES[language] || {})
        .filter(([, iso]) => iso && iso === iso2).map(([alias]) => alias)];
      parts[parts.length - 1] = forms.some((f) => f && sameWord(last, f))
        ? last.charAt(0).toUpperCase() + last.slice(1)
        : countryName;
      h = parts.join(' ');
    }
  }
  // English writes the first person pronoun in capitals wherever it appears,
  // and a keyword arrives from the provider in lower case throughout.
  if (language === 'en') h = h.replace(/\bi\b/g, 'I');
  return sentence(h);
}

const num = (v, language, digits = 1) => new Intl.NumberFormat(language, { maximumFractionDigits: digits }).format(v);

function sourceRows(records, pack) {
  const seen = new Map();
  for (const r of records) {
    if (!r) continue;
    const key = r.source + '|' + (r.sourceRef || r.dataset || '');
    if (!seen.has(key)) seen.set(key, { source: r.source, dataset: r.sourceRef || r.dataset || null, licence: r.licence, observedAt: r.observedAt, confidence: r.confidence, derivation: r.derivation || null });
  }
  return [...seen.values()].map((s) => ({
    ...s,
    attribution: s.source + (s.dataset ? ', ' + s.dataset : '') + ' (' + s.licence + ')',
  }));
}

// ------------------------------------------------------------ cost of living

function costOfLivingModel(page, pack, { now }) {
  const data = colFor(page.entity, { now });
  if (!data) return { refused: 'the cost of living store has no record for this country' };
  const c = subject(page.entity, page.language);
  if (!c) return { refused: 'no subject form for ' + page.entity + ' in ' + page.language };
  const bare = plain(page.entity, page.language);
  const h = pack.col.heading({ keyword: page.keyword, c: bare, kwHeading: headingFromKeyword(page.keyword, bare, page.language, page.entity) });
  const unit = data.headline.unit;
  const value = num(data.headline.value, page.language, 2);
  const year = data.asOf;

  const paragraphs = [];
  if (unit === 'index-eu27-100') {
    paragraphs.push(pack.col.answerIndex({ c, value, diff: Math.round(data.headline.value - 100), year }));
  } else {
    paragraphs.push(pack.col.answerRatio({ c, value, pct: Math.round((data.headline.value - 1) * 100), year }));
  }
  paragraphs.push(pack.col.coverage[data.coverage]);

  // The basket spread sentence exists only where twelve categories exist, so
  // a headline only country is genuinely a shorter page rather than a padded
  // one.
  const basketRows = Object.entries(data.basket).filter(([, r]) => typeof r.value === 'number');
  if (basketRows.length >= 10) {
    const sorted = [...basketRows].sort((a, b) => a[1].value - b[1].value);
    const cheap = sorted[0];
    const dear = sorted[sorted.length - 1];
    paragraphs.push(pack.col.extremes({
      cheap: { label: pack.basket[cheap[0]] || cheap[0], value: num(cheap[1].value, page.language, 1) },
      dear: { label: pack.basket[dear[0]] || dear[0], value: num(dear[1].value, page.language, 1) },
    }));
  }

  const inf = data.annualInflationPercent;
  if (typeof inf === 'number') {
    paragraphs.push(inf < 0 ? pack.col.deflation({ c, pct: num(inf, page.language, 1), year }) : pack.col.inflation({ c, pct: num(inf, page.language, 1), year }));
  } else {
    paragraphs.push(pack.col.noInflation({ c }));
  }

  // Where the country sits among the others measured the same way. Rank is
  // computed only within one unit, because a position in a list that mixed
  // two scales would be a position in nothing.
  const sameScaleRows = Object.entries(colStore().countries)
    .map(([iso2, x]) => ({ iso2, m: x.measures[x.headlineMeasure] }))
    .filter((x) => x.m?.unit === unit)
    .sort((a, b) => a.m.value - b.m.value);
  const rank = sameScaleRows.findIndex((x) => x.iso2 === page.entity) + 1;
  if (rank > 0) paragraphs.push(pack.col.rank({ c, rank, of: sameScaleRows.length }));

  // Who the country is actually next to. A ratio-only country has a value, a
  // year and a rank and nothing else of its own, and two of them at the same
  // value produced two pages that differed by a name: Argentina and Brazil
  // came out 83 percent alike. The neighbours are measured data on the same
  // scale, they are different for every country, and they answer the question
  // a rank raises without settling.
  const nb = colNeighbours(page.entity);
  if (nb) {
    const digits = nb.unit === 'ratio-us-1' ? 3 : 1;
    const name = (iso2) => plain(iso2, page.language) || iso2;
    if (nb.cheaper && nb.dearer) {
      paragraphs.push(pack.col.neighbours({
        cheaper: name(nb.cheaper.iso2), cheaperValue: num(nb.cheaper.value, page.language, digits),
        dearer: name(nb.dearer.iso2), dearerValue: num(nb.dearer.value, page.language, digits),
        rank: nb.rankCheapestFirst, of: nb.of,
      }));
    } else if (nb.dearer) {
      paragraphs.push(pack.col.neighboursCheapest({ dearer: name(nb.dearer.iso2), dearerValue: num(nb.dearer.value, page.language, digits), of: nb.of }));
    } else if (nb.cheaper) {
      paragraphs.push(pack.col.neighboursDearest({ cheaper: name(nb.cheaper.iso2), cheaperValue: num(nb.cheaper.value, page.language, digits), of: nb.of }));
    }
  }
  paragraphs.push(pack.col.comparableWith(sameScaleRows.length - 1));
  paragraphs.push(pack.col.caution);

  const facts = [
    { label: pack.basket[data.headline.measure] || data.headline.label, value: value + ' ' + pack.units[unit] },
    { label: pack.ui.year, value: String(year) },
    { label: pack.ui.source, value: data.headline.source },
  ];

  // The table always exists, because there is always at least the headline to
  // show. Where the twelve categories are published it is the basket; where
  // they are not it is the measures that do exist, including the whole
  // economy price level, which is published for the headline only countries
  // and was being dropped on the floor.
  const rawMeasures = colStore().countries[page.entity].measures;
  const tableRows = basketRows.length
    ? basketRows.map(([m, r]) => [m, r])
    : Object.entries(rawMeasures);
  const table = {
    caption: pack.basket.A01,
    head: [pack.ui.measure, pack.ui.value, pack.ui.year],
    rows: tableRows.map(([m, r]) => ({ cells: [pack.basket[m] || BASKET[m] || m, num(r.value, page.language, r.unit === 'ratio-us-1' ? 3 : 1), String(r.observedAt)] })),
  };

  return {
    h1: pack.col.h1(h),
    title: pack.col.title(h),
    description: pack.col.description({ c: bare, value, year }),
    facts, paragraphs, table,
    faq: pack.col.faq({ c, value, unit: pack.units[unit], year }),
    sources: sourceRows([data.headline, ...Object.values(data.basket)], pack),
    schemaType: 'Dataset',
    entityName: bare,
  };
}

// ------------------------------------------------------------------ salaries

function salaryModel(page, pack, { now }) {
  const data = salFor(page.entity, { now });
  if (!data) return { refused: 'the salary store has no record for this country' };
  const c = subject(page.entity, page.language);
  if (!c) return { refused: 'no subject form for ' + page.entity + ' in ' + page.language };
  const bare = plain(page.entity, page.language);
  const h = pack.salaryPage.heading({ keyword: page.keyword, c: bare, kwHeading: headingFromKeyword(page.keyword, bare, page.language, page.entity) });

  const g = data.measures.grossMonthly;
  const n = data.measures.netMonthly;
  const mw = data.measures.minimumWageMonthly;
  if (!g && !n) return { refused: 'neither a gross nor a net series covers this country' };

  const paragraphs = [];
  paragraphs.push(g && n
    ? pack.salaryPage.answer({ c, gross: num(g.value, page.language, 0), net: num(n.value, page.language, 0), year: data.asOf })
    : pack.salaryPage.answerNetOnly({ c, net: num((n || g).value, page.language, 0), year: data.asOf }));
  if (data.wedge) paragraphs.push(pack.salaryPage.wedge({ c, pct: num(data.wedge.percent, page.language, 1) }));
  paragraphs.push(mw ? pack.salaryPage.minimumWage({ value: num(mw.value, page.language, 0), year: mw.observedAt }) : pack.salaryPage.noMinimumWage({ c }));
  const r = rankOn(page.entity, n ? 'netMonthly' : 'grossMonthly');
  if (r) paragraphs.push(pack.salaryPage.rank({ c, rank: r.rank, of: r.of, median: num(r.median, page.language, 0) }));
  // The distance to the median, which is the part of a rank that carries the
  // size of the gap. Twelfth of twenty seven says nothing about whether the
  // twelfth is a tenth behind the middle or a third.
  if (r && r.median) {
    const own = (n || g).value;
    const pct = Math.round(((own - r.median) / r.median) * 1000) / 10;
    paragraphs.push(pack.salaryPage.vsMedian({
      c, pct: num(Math.abs(pct), page.language, 1), above: pct >= 0,
      median: num(r.median, page.language, 0), of: r.of,
    }));
  }
  // Who stands on either side, which is what a rank on its own does not say
  // and what keeps two countries with similar pay from reading as one page.
  const nb = salNeighbours(page.entity, n ? 'netMonthly' : 'grossMonthly');
  if (nb && (nb.above || nb.below)) {
    paragraphs.push(nb.above && nb.below
      ? pack.salaryPage.neighbours({
        c, above: plain(nb.above.iso2, page.language), aboveValue: num(nb.above.value, page.language, 0),
        below: plain(nb.below.iso2, page.language), belowValue: num(nb.below.value, page.language, 0),
      })
      : pack.salaryPage.neighboursEnd({
        c, other: plain((nb.above || nb.below).iso2, page.language),
        otherValue: num((nb.above || nb.below).value, page.language, 0),
        end: nb.above ? 'bottom' : 'top',
      }));
  }
  // Pay and prices come from two different sources and the page says so, but
  // a salary page that never mentions what things cost is answering half the
  // question the reader actually has.
  const prices = colFor(page.entity, { now });
  if (prices) {
    paragraphs.push(pack.salaryPage.purchasingPower({
      c: bare, level: num(prices.headline.value, page.language, 1),
      unit: pack.units[prices.headline.unit], year: prices.asOf,
    }));
  }
  paragraphs.push(pack.salaryPage.caution);

  const facts = Object.entries(data.measures).map(([id, m]) => ({
    label: pack.salary[id] || m.label,
    value: num(m.value, page.language, 0) + ' ' + pack.units['eur-month'],
  }));
  if (data.wedge) facts.push({ label: pack.salary.taxWedge, value: num(data.wedge.percent, page.language, 1) + ' ' + pack.units.percent });

  return {
    h1: pack.salaryPage.h1(h),
    title: pack.salaryPage.title(h),
    description: pack.salaryPage.description({ c: bare, net: num((n || g).value, page.language, 0), year: data.asOf }),
    facts, paragraphs,
    table: {
      caption: pack.salary.netMonthly,
      head: [pack.ui.measure, pack.ui.value, pack.ui.year, pack.ui.source],
      rows: Object.entries(data.measures).map(([id, m]) => ({ cells: [pack.salary[id] || m.label, num(m.value, page.language, 0), String(m.observedAt), m.source] })),
    },
    faq: pack.salaryPage.faq({ c, net: num((n || g).value, page.language, 0), year: data.asOf }),
    sources: sourceRows(Object.values(data.measures), pack),
    schemaType: 'Dataset',
    entityName: bare,
  };
}

// ------------------------------------------------------------------ rankings

function rankingModel(page, pack) {
  const r = RANKINGS.find((x) => x.id === page.entity && x.family === page.family);
  if (!r) return { refused: 'no such ranking' };
  const pop = POPULATIONS[r.population];
  const all = colRanking(r.unit, { measure: r.measure, limit: 500 }).rows.filter((row) => pop.filter(row.iso2));
  const rows = r.direction === 'asc' ? [...all].sort((a, b) => a.value - b.value) : all;
  if (!rows.length) return { refused: 'the measure produced no rows for this population' };

  const name = rankingName(r.id, page.language);
  if (!name) return { refused: 'the ranking has no name in ' + page.language };
  const short = measureShort(r.measure, page.language);
  if (!short) return { refused: 'the measure has no short name in ' + page.language };
  const year = rows[0].asOf;
  const firstName = plain(rows[0].iso2, page.language);
  // What this end of the sort actually means. Without it the cheapest list
  // and the most expensive list are one page with the ends swapped, which is
  // what the near duplicate detector found the first version to be.
  const own_copy = rankingCopy(r.id, page.language);
  if (!own_copy) return { refused: 'no copy for the ranking ' + r.id + ' in ' + page.language };
  const paragraphs = [
    pack.ranking.answer({ first: firstName, firstValue: num(rows[0].value, page.language, 2), n: rows.length, year, unit: pack.units[r.unit] }),
    own_copy,
    pack.ranking.method({ measure: short, unit: pack.units[r.unit], n: rows.length, claims: pop.claims }),
    pack.ranking.caution,
  ];

  return {
    h1: pack.ranking.h1(name),
    title: pack.ranking.title(name),
    description: pack.ranking.description({ name, n: rows.length, unit: pack.units[r.unit], year }),
    facts: [
      { label: pack.ui.measure, value: pack.basket[r.measure] || r.measure },
      { label: pack.ui.unit, value: pack.units[r.unit] },
      { label: pack.ui.year, value: String(year) },
    ],
    paragraphs,
    table: {
      caption: name,
      head: [pack.ui.rank, pack.ui.country, pack.ui.value, pack.ui.year],
      rows: rows.slice(0, 50).map((row, i) => ({ cells: [String(i + 1), plain(row.iso2, page.language), num(row.value, page.language, 2), String(row.asOf)] })),
    },
    faq: pack.ranking.faq({ n: rows.length, unit: pack.units[r.unit] }),
    sources: sourceRows(rows.slice(0, 1).map(() => ({ source: rows[0].source, sourceRef: r.measure, licence: r.unit === 'ratio-us-1' ? 'CC BY 4.0' : 'Eurostat reuse policy, commercial reuse permitted with attribution', observedAt: year, confidence: r.unit === 'ratio-us-1' ? 'official-derived' : 'official' })), pack),
    schemaType: 'Dataset',
    entityName: name,
  };
}

// --------------------------------------------------------------------- tools

// Which institution actually stands behind a tool, in words a reader
// recognises. The source identifiers are engineering names and printing them
// on a page would be the one place the machinery shows through.
const PROVIDER_WORDS = {
  'cost-of-living-verified': 'Eurostat + World Bank',
  'salary-data-verified': 'Eurostat',
  'rent-index-verified': 'Eurostat',
  'climate-normals-verified': 'NASA POWER',
  'neighbourhood-facts-verified': 'GeoNames',
};

// The share of an income a rent budget is built from. Both numbers are
// conventions rather than measurements: thirty percent is what most landlords
// and lenders test against and thirty five is the point past which the rest of
// a budget gives way. They are stated on the page for that reason, and the
// calculator has no rent figure behind it at all.
const RENT_SHARES = [0.3, 0.35];
const RENT_INCOME_BANDS = [1500, 2500, 3500, 5000, 7000];

// The city the district tools demonstrate on: the one with the most districts,
// so the example is the fullest the data can show rather than an arbitrary
// pick. Computed rather than named, so it follows the source.
function widestCity() {
  const ids = hoodCityIds();
  let best = null;
  for (const id of ids) {
    const c = hoodsForCity(id);
    if (c && (!best || c.count > best.count)) best = c;
  }
  return best;
}

// A worked example, computed from the store rather than written down, so the
// numbers on the page are the numbers the tool would produce.
function workedExample(t, pack, language) {
  // The two tools whose answer is not a country figure. Both come before the
  // source tests below, because a tool that also reads a country dataset would
  // otherwise be explained with the wrong worked example: the rent budget is a
  // proportion of an income and the district order is a distance.
  if (t.id === 'rent-affordability') {
    const income = 3000;
    return pack.toolTables.exampleRent({
      income: num(income, language, 0),
      at30: num(income * RENT_SHARES[0], language, 0),
      at35: num(income * RENT_SHARES[1], language, 0),
    });
  }
  if (t.id === 'where-should-i-stay') {
    const c = widestCity();
    if (!c) return null;
    return pack.toolTables.exampleStay({
      city: cityName(c.cityId, language) || c.cityName,
      count: num(c.count, language, 0),
      central: num(c.central.length, language, 0),
      km: num(HOOD_CENTRAL_KM, language, 0),
    });
  }
  if (t.sources.includes('salary-data-verified')) {
    const store = salStore().countries;
    const pick = Object.entries(store).find(([, c]) => c.measures.grossMonthly && c.measures.netMonthly);
    if (!pick) return null;
    const [iso2, c] = pick;
    const gross = c.measures.grossMonthly.value;
    const net = c.measures.netMonthly.value;
    return pack.tool.exampleSalary({
      c: subject(iso2, language) || plain(iso2, language),
      gross: num(gross, language, 0), net: num(net, language, 0),
      pct: num((1 - net / gross) * 100, language, 1), year: c.measures.grossMonthly.observedAt,
    });
  }
  if (t.id === 'moving-cost') {
    const e = movingCost({ moveSize: 'flat-2br', transport: 'truck', distanceKm: 500 });
    if (!e.ok) return null;
    return pack.tool.exampleRange({ low: num(e.range.low, language, 0), high: num(e.range.high, language, 0) });
  }
  if (t.family === 'tools.matcher') {
    const rows = Object.values(colStore().countries).filter((c) => c.measures.A01);
    const kept = rows.filter((c) => c.measures.A01.value < 100).length;
    return pack.tool.exampleMatch({ total: num(rows.length, language, 0), kept: num(kept, language, 0) });
  }
  // The comparison tools. Two countries on the same scale, chosen as the
  // cheapest and the dearest that the index covers, so the example shows the
  // widest honest gap rather than an arbitrary pair.
  const rows = Object.entries(colStore().countries).filter(([, c]) => c.measures.A01).map(([iso2, c]) => ({ iso2, v: c.measures.A01.value, year: c.measures.A01.observedAt }));
  if (rows.length < 2) return null;
  rows.sort((a, b) => a.v - b.v);
  const lo = rows[0];
  const hi = rows[rows.length - 1];
  return pack.tool.exampleCompare({
    a: plain(hi.iso2, language), b: plain(lo.iso2, language),
    pct: Math.round((hi.v / lo.v - 1) * 100), year: hi.year,
  });
}

// A preview of the data the tool computes against, shown on the page itself.
// A calculator whose page shows nothing until somebody types is a page with
// no content, and a reader who wants to know whether the tool is worth using
// learns more from twelve real rows than from any description of them.
function toolPreview(t, pack, language) {
  // A table of the rule rather than of a dataset, because this calculator has
  // no dataset: the rows are what each income leaves at each share, and no
  // currency is named because the proportion is the same everywhere.
  if (t.id === 'rent-affordability') {
    return {
      year: null,
      table: {
        caption: pack.toolTables.rentCaption,
        head: [pack.toolTables.rentIncome, pack.toolTables.rentAt30, pack.toolTables.rentAt35],
        rows: RENT_INCOME_BANDS.map((i) => ({ cells: [num(i, language, 0), num(i * RENT_SHARES[0], language, 0), num(i * RENT_SHARES[1], language, 0)] })),
      },
    };
  }
  // The districts of one city, in the order the tool puts them in. The labels
  // are the ones the Areas pages already use, because it is the same data and
  // a second vocabulary for it would be a second chance to disagree with
  // itself.
  if (t.id === 'where-should-i-stay') {
    const c = widestCity();
    if (!c) return null;
    const rows = c.byDistance.slice(0, 12).map((d) => ({ cells: [
      d.name,
      num(d.distanceKm, language, 1) + ' km',
      pack.areas.compass[d.compass] || d.compass,
    ] }));
    if (!rows.length) return null;
    return {
      year: null,
      table: {
        caption: pack.toolTables.stayCaption({ city: cityName(c.cityId, language) || c.cityName }),
        head: [pack.areas.table.district, pack.areas.table.distance, pack.areas.table.direction],
        rows,
      },
    };
  }
  if (t.sources.includes('salary-data-verified')) {
    const rows = Object.entries(salStore().countries)
      .map(([iso2, c]) => ({ iso2, m: c.measures.netMonthly || c.measures.grossMonthly }))
      .filter((r) => r.m).sort((a, b) => b.m.value - a.m.value).slice(0, 12);
    if (!rows.length) return null;
    return {
      year: rows[0].m.observedAt,
      table: {
        caption: pack.salary.netMonthly,
        head: [pack.ui.country, pack.ui.value, pack.ui.year],
        rows: rows.map((r) => ({ cells: [plain(r.iso2, language), num(r.m.value, language, 0), String(r.m.observedAt)] })),
      },
    };
  }
  if (t.id === 'moving-cost') {
    // Volume in cubic metres rather than a named home size, because the model
    // works in cubic metres and because "two bedrooms" means a different
    // amount of furniture in every one of these countries.
    const sizes = ['studio', 'flat-2br', 'house-4br'];
    const bands = [150, 500, 1200];
    const rows = [];
    for (const s of sizes) {
      for (const km of bands) {
        const e = movingCost({ moveSize: s, transport: 'shared-load', distanceKm: km });
        if (!e.ok) continue;
        rows.push({ cells: [
          num(MOVE_SIZES[s].cubicMetres, language, 0) + ' m3',
          num(km, language, 0) + ' km',
          num(e.range.low, language, 0) + ' to ' + num(e.range.high, language, 0) + ' EUR',
        ] });
      }
    }
    if (!rows.length) return null;
    return { year: null, table: { caption: pack.tool.inputs, head: [pack.ui.volume, pack.ui.distance, pack.ui.estimate], rows } };
  }
  if (t.sources.includes('cost-of-living-verified')) {
    const rows = Object.entries(colStore().countries)
      .map(([iso2, c]) => ({ iso2, m: c.measures.A01 })).filter((r) => r.m)
      .sort((a, b) => a.m.value - b.m.value).slice(0, 12);
    if (!rows.length) return null;
    return {
      year: rows[0].m.observedAt,
      table: {
        caption: pack.basket.A01,
        head: [pack.ui.country, pack.ui.value, pack.ui.year],
        rows: rows.map((r) => ({ cells: [plain(r.iso2, language), num(r.m.value, language, 1), String(r.m.observedAt)] })),
      },
    };
  }
  return null;
}

function toolModel(page, pack) {
  const t = TOOLS.find((x) => x.id === page.entity && x.family === page.family);
  if (!t) return { refused: 'no such tool' };
  const name = headingFromKeyword(page.keyword, null, page.language) || t.name;
  const own = t.sources.filter((s) => !s.startsWith('none'));
  const sourceWords = own.length ? [...new Set(own.map((s) => PROVIDER_WORDS[s] || s))].join(' + ') : 'Livdar';
  const covered = own.includes('cost-of-living-verified')
    ? Object.keys(colStore().countries).length
    : own.includes('salary-data-verified') ? Object.keys(salStore().countries).length : null;

  // Input names have to be in the reader's language or the fact row is the
  // one place the page is visibly generated. A term with no translation
  // refuses the page rather than printing English.
  const inputs = t.inputs.map((i) => inputTerm(i, page.language));
  if (inputs.some((i) => !i)) return { refused: 'an input term is untranslated in ' + page.language + ': ' + t.inputs.filter((i) => !inputTerm(i, page.language)).join(', ') };

  // What this particular tool does, written for this particular tool. Without
  // it every calculator page is the same page with a different title, which
  // is exactly what the near duplicate detector said the first version was.
  const own_copy = toolCopy(t.id, page.language);
  if (!own_copy) return { refused: 'no copy for the tool ' + t.id + ' in ' + page.language };

  const preview = toolPreview(t, pack, page.language);
  const paragraphs = [pack.tool.intro({ name, sources: sourceWords })];
  paragraphs.push(own_copy);
  const example = workedExample(t, pack, page.language);
  if (example) paragraphs.push(example);
  if (covered) paragraphs.push(pack.tool.covers({ n: covered }));
  if (preview?.year) paragraphs.push(pack.tool.refresh({ sources: sourceWords, year: preview.year }));
  else paragraphs.push(pack.tool.method({ sources: sourceWords }));

  return {
    h1: pack.tool.h1(name),
    title: pack.tool.title(name),
    description: pack.tool.description({ name, sources: sourceWords }),
    facts: [
      { label: pack.tool.inputs, value: inputs.join(', ') },
      { label: pack.ui.source, value: sourceWords },
    ],
    paragraphs,
    table: preview?.table || null,
    faq: pack.tool.faq({ name, sources: sourceWords }),
    // A tool with no dataset still has provenance: its own model, its own
    // assumptions and the confidence level that a modelled number carries.
    // An empty source list would say the numbers came from nowhere.
    sources: own.length
      ? [{ source: sourceWords, dataset: own.join(', '), licence: 'see the source registry', confidence: 'official-derived', observedAt: preview?.year || null, attribution: sourceWords }]
      : [{
        source: 'Livdar',
        dataset: t.id + ' model',
        licence: 'Livdar, own model, assumptions stated on the page',
        confidence: 'modelled',
        observedAt: null,
        attribution: 'Livdar, ' + t.id + ' model, assumptions stated on the page',
      }],
    schemaType: 'SoftwareApplication',
    entityName: name,
    interactive: t.id,
    // The tool itself, as data the browser can run. A page that describes a
    // calculator and does not contain one is a screenshot of a calculator, and
    // eleven of the twelve implementations are small enough and pure enough to
    // ship. The twelfth, the city comparison, declares two cities as its inputs
    // while the only price data that exists is national, so it stays a
    // description and the spec says why.
    tool: toolSpec(t.id, { language: page.language, unit: unitForMarket(page.market) }),
  };
}


// ------------------------------------------------------- best time to travel

// The family exists because the incumbent pages answer for a country as
// though a country had one climate. Japan runs from Sapporo to Naha, and in
// January those two sit 85 points apart on the same scale. So this page
// answers from several measured cities, names them, and where they disagree
// it reports the disagreement instead of averaging it away. That sentence is
// the whole reason the page is worth reading.
function bestTimeModel(page, pack, { now }) {
  const data = climateForCountry(page.entity);
  if (!data) return { refused: 'no climate normals cover ' + page.entity };
  const c = subject(page.entity, page.language);
  if (!c) return { refused: 'no subject form for ' + page.entity + ' in ' + page.language };
  const bare = plain(page.entity, page.language);
  const L = page.language;
  const cp = pack.bestTime;
  // The heading is built from the country rather than from the measured
  // keyword. The provider returns keywords in lower case and often stripped of
  // accents, so `mejor epoca para viajar a japon` would print with neither
  // accent and `beste reisezeit` with a lower case noun. The keyword still
  // decides the URL and the targeting; only the prose comes from here.
  const to = travelTo(page.entity, L);
  if (!to) return { refused: 'no destination form for ' + page.entity + ' in ' + L };
  const h = cp.h1From({ c, to, bare });

  const named = (m) => monthName(m, L);
  const bestNames = joinList(data.best.map(named), L);
  const worstNames = joinList(data.worst.map(named), L);
  const top = data.ranked[0];
  const cityNames = data.cities.map((x) => x.name).filter(Boolean);
  const period = data.period;

  const paragraphs = [];
  paragraphs.push(data.cityCount === 1
    ? cp.answerOneCity({ c, city: cityNames[0], months: bestNames, period })
    : cp.answer({ c, months: bestNames, cities: data.cityCount, period }));

  // Agreement only says something when there is more than one opinion. A
  // country measured from one city cannot be unanimous and must not claim it.
  if (data.cityCount > 1) {
    paragraphs.push(data.unanimous
      ? cp.unanimous({ month: named(top.month), cities: data.cityCount })
      : cp.agreement({ month: named(top.month), pct: top.agreement, cities: data.cityCount }));
    paragraphs.push(data.dividedCountry
      ? cp.divided({
        c, month: monthIn(data.mostDivided.month, L),
        spread: num(data.mostDivided.spread, L, 0),
        warm: data.mostDivided.bestCity.name,
        cool: data.mostDivided.worstCity.name,
      })
      : cp.notDivided({ c }));
  }

  // The worst month names its own reason, read from the same computation that
  // produced the score rather than recomputed here, so the word on the page
  // and the number in the table cannot drift apart.
  // The measured values behind the verdict. Without them Morocco and Turkey
  // read as the same page: same best month, same worst month, both undivided,
  // and only the country name different. Their Junes are not the same June,
  // and saying so is both what separates the pages and what a reader wants.
  const bestMonth = data.months.find((m) => m.month === data.best[0]);
  if (bestMonth && bestMonth.tmean != null) {
    paragraphs.push(data.cityCount === 1
      ? cp.numbersOneCity({
        month: named(bestMonth.month), city: bestMonth.warmest.name,
        temp: num(bestMonth.tmean, L, 1), rain: num(bestMonth.precipMm, L, 0),
      })
      : cp.numbers({
        month: named(bestMonth.month),
        temp: num(bestMonth.tmean, L, 1), rain: num(bestMonth.precipMm, L, 0),
        lowCity: bestMonth.coolest.name, low: num(bestMonth.coolest.tmean, L, 1),
        highCity: bestMonth.warmest.name, high: num(bestMonth.warmest.tmean, L, 1),
      }));
  }

  const worstMonth = data.months.find((m) => m.month === data.ranked[data.ranked.length - 1].month);
  paragraphs.push(cp.worst({ months: worstNames, reason: cp.reasons[worstMonth.leadingReason] || cp.reasons['nothing much'] }));
  paragraphs.push(cp.method({ period, cityList: joinList(cityNames, L) }));
  paragraphs.push(cp.notTypicalDay);
  paragraphs.push(cp.caution);

  const facts = [
    { label: cp.table.best, value: bestNames },
    { label: pack.ui.year, value: period },
    { label: cp.table.spread, value: num(data.mostDivided.spread, L, 0) + ' (' + monthIn(data.mostDivided.month, L) + ')' },
  ];

  const table = {
    caption: h,
    head: [cp.table.month, cp.table.score, cp.table.spread],
    rows: data.months.map((m) => ({ cells: [named(m.month), num(m.meanScore, L, 1), num(m.spread, L, 1)] })),
  };

  return {
    h1: cp.h1(h),
    title: cp.title(h),
    description: cp.description({ c: bare, to, months: bestNames, cities: data.cityCount }),
    facts, paragraphs, table,
    faq: cp.faq({ c, to, months: bestNames, period, cities: data.cityCount, worst: named(worstMonth.month) }),
    sources: sourceRows([climateSource()], pack),
    schemaType: 'Dataset',
    entityName: bare,
  };
}

// ----------------------------------------------------------------- the areas

// Where to stay in a city, answered as where the districts are.
//
// The honest shape of this page is decided by what the source can carry. It
// knows each district's position, its distance from the centre and how many
// people live there. It knows nothing about rent, noise or safety, so the page
// orders by distance from the centre, says that is what it is doing, and makes
// no claim about which district is better. A ranking implying price or
// character would be the page inventing what nobody measured.
function areasModel(page, pack) {
  const d = hoodsForCity(page.entity);
  if (!d) return { refused: 'no neighbourhood facts for city ' + page.entity };
  const cp = pack.areas;
  if (!cp) return { refused: 'no areas copy in ' + page.language };
  const L = page.language;
  const city = cityName(page.entity, L) || d.cityName;
  const gates = hoodStore().gates || {};
  const maxKm = gates.maxKm ?? 25;
  const km = gates.centralKm ?? 5;
  const nameOf = (n) => n.name;

  const paragraphs = [
    cp.answer({
      city, count: d.count, central: d.central.length, km,
      nearest: d.nearest.name, span: num(d.spanKm, L, 1), farthest: d.farthest.name,
    }),
    // Eight names at most. A sentence that lists seventeen districts is a
    // table pretending to be prose, and the table is directly below it.
    cp.centralList({ names: joinList(d.central.slice(0, 8).map(nameOf), L), km }),
  ];
  if (d.outer.length) {
    paragraphs.push(cp.outerList({
      names: joinList(d.outer.slice(0, 6).map(nameOf), L),
      from: num(d.outer[0].distanceKm, L, 0),
      to: num(d.outer[d.outer.length - 1].distanceKm, L, 0),
    }));
  }
  // Only where the provider recorded a population. Most districts have one and
  // some do not, and a page that printed a guess for the rest would be worse
  // than a page that says nothing about them.
  if (d.biggest) paragraphs.push(cp.biggest({ name: d.biggest.name, people: num(d.biggest.population, L, 0) }));
  if (d.leaning) paragraphs.push(cp.leaning({ compass: cp.compass[d.leaning.compass] || d.leaning.compass, n: d.leaning.count, count: d.count }));
  paragraphs.push(cp.method({ city, count: d.count, maxKm }));
  paragraphs.push(cp.caution);

  const facts = [
    { label: cp.facts.districts, value: num(d.count, L, 0) },
    { label: cp.facts.central, value: num(d.central.length, L, 0) },
    { label: cp.facts.span, value: d.farthest.name + ', ' + num(d.spanKm, L, 1) + ' km' },
  ];
  if (d.biggest) facts.push({ label: cp.facts.largest, value: d.biggest.name });

  return {
    h1: cp.h1({ city }),
    title: cp.title({ city }),
    description: cp.description({ city, count: d.count, central: d.central.length }),
    facts,
    paragraphs,
    table: {
      caption: cp.h1({ city }),
      head: [cp.table.district, cp.table.distance, cp.table.direction, cp.table.population],
      rows: d.byDistance.slice(0, 50).map((n) => ({
        cells: [
          n.name,
          num(n.distanceKm, L, 1) + ' km',
          cp.compass[n.compass] || n.compass,
          n.population == null ? cp.table.unknown : num(n.population, L, 0),
        ],
      })),
    },
    faq: cp.faq({ city, count: d.count, central: d.central.length, km, nearest: d.nearest.name }),
    sources: sourceRows([hoodSource()], pack),
    schemaType: 'Dataset',
    entityName: city,
  };
}

// -------------------------------------------------------------------- the stay

// How much rents have risen in a country, and where that sits.
//
// The Stay surface had no family whose source was built. This is the one
// question the rent series can answer, and it answers it in the two markets
// that ask it hardest: the Netherlands and France both cap the annual increase
// by a published index and both search for this every year.
//
// The page is built around the ranking rather than around the single number,
// because a rent rise means nothing on its own. Five percent is the middle of
// this set and would be a crisis in the country at the bottom of it.
function rentModel(page, pack) {
  const d = rentFor(page.entity);
  if (!d) return { refused: 'no rent series for ' + page.entity };
  const cp = pack.rent;
  if (!cp) return { refused: 'no rent copy in ' + page.language };
  const L = page.language;
  const c = plain(page.entity, L);
  if (!c) return { refused: 'no name for ' + page.entity + ' in ' + L };
  // The locative form, for the languages whose preposition changes with the
  // country. Falls back to the plain name, which is what the languages with a
  // single preposition already use.
  const inC = travelTo(page.entity, L) || c;
  const pct = (n) => num(n, L, 1);
  const name = (iso2) => plain(iso2, L) || iso2;

  const paragraphs = [
    cp.answer({ c, inC, change: pct(d.inflation), above: pct(d.aboveBase), year: d.observedAt }),
    cp.rank({ c, inC, rank: num(d.rankFastestFirst, L, 0), of: num(d.of, L, 0), faster: name((d.faster || d.slower).iso2), slower: name((d.slower || d.faster).iso2) }),
    cp.extremes({
      fastest: name(d.fastest.iso2), fastestPct: pct(d.fastest.inflation),
      slowest: name(d.slowest.iso2), slowestPct: pct(d.slowest.inflation),
      median: name(d.median.iso2), medianPct: pct(d.median.inflation),
    }),
    cp.method({ c, inC, year: d.observedAt }),
    cp.caution,
  ];

  // The fifteen fastest, plus this country when it is not among them, so the
  // page always contains its own row.
  const top = d.ranked.slice(0, 15);
  const rows = top.some((r) => r.iso2 === page.entity) ? top : [...top, d.ranked.find((r) => r.iso2 === page.entity)];

  return {
    h1: cp.h1({ c, inC, year: d.observedAt }),
    // The long title where it fits and the heading where it does not. Five
    // languages write this title and the longest country name in the set pushes
    // two of them past the ceiling, which is a formatting fact rather than a
    // reason to write a worse title for everybody.
    title: (() => {
      const long = cp.title({ c, inC, year: d.observedAt });
      return long.length <= 75 ? long : cp.h1({ c, inC, year: d.observedAt });
    })(),
    description: cp.description({ c, inC, change: pct(d.inflation), above: pct(d.aboveBase), year: d.observedAt }),
    facts: [
      { label: cp.facts.change, value: pct(d.inflation) + ' %' },
      { label: cp.facts.above, value: pct(d.aboveBase) + ' %' },
      { label: cp.facts.rank, value: num(d.rankFastestFirst, L, 0) + ' / ' + num(d.of, L, 0) },
    ],
    paragraphs,
    table: {
      caption: cp.h1({ c, inC, year: d.observedAt }),
      head: [cp.table.country, cp.table.change, cp.table.index, cp.table.year],
      rows: rows.map((r) => ({ cells: [name(r.iso2), pct(r.inflation) + ' %', num(r.index, L, 1), String(r.observedAt)] })),
    },
    faq: cp.faq({ c, inC, change: pct(d.inflation), above: pct(d.aboveBase), rank: num(d.rankFastestFirst, L, 0), of: num(d.of, L, 0), year: d.observedAt }),
    sources: sourceRows([rentSource()], pack),
    schemaType: 'Dataset',
    entityName: c,
  };
}

// ------------------------------------------------------------------- the sport

// When an outdoor activity is comfortable in a city.
//
// Two activities in the same city read as the same page unless the page is
// built around the band rather than around the weather, so that is what this
// does: the band for the activity decides which months are in, the sentence
// explaining the band is written per activity, and the table carries the column
// that matters for that activity and leaves out the ones that do not. Cycling
// gets wind because a headwind decides a ride and nothing else here; swimming
// gets neither wind nor rain, because a swimmer is already wet.
function sportModel(page, pack) {
  const d = sportForCity(page.entity, { language: page.language });
  if (!d) return { refused: 'no climate normals for ' + page.entity };
  const cp = pack.sport;
  if (!cp) return { refused: 'no sport copy in ' + page.language };
  const L = page.language;
  const activity = cp.activity[d.activity];
  if (!activity) return { refused: 'no word for the activity ' + d.activity + ' in ' + L };
  const city = d.cityName;
  const band = d.band;
  const mName = (m) => monthName(m, L);
  const why = cp.why[d.activity];
  if (!why) return { refused: 'no band explanation for ' + d.activity + ' in ' + L };

  const season = d.season.length ? joinList(d.season.map(mName), L) : null;
  const paragraphs = [
    d.noGoodMonth
      ? cp.noneAnswer({ activity, city, low: band.meanLow, high: band.meanHigh, hottest: mName(d.hottest.month), hottestC: num(d.hottest.tmean, L, 1) })
      : cp.answer({ activity, city, good: d.goodCount, low: band.meanLow, high: band.meanHigh, season: season || joinList(d.good.map((m) => mName(m.month)), L) }),
    why({ hardAbove: band.hardAbove, windAbove: band.windAbove, low: band.meanLow, high: band.meanHigh }),
    cp.hottest({ month: mName(d.hottest.month), c: num(d.hottest.tmean, L, 1) }) + ' ' + cp.coldest({ month: mName(d.coldest.month), c: num(d.coldest.tmean, L, 1) }),
  ];
  // Rain belongs on a page about being outside for an hour and not on one about
  // being in the water.
  if (d.activity !== 'swimming' && d.wettest && d.driest) {
    paragraphs.push(cp.wettest({ month: mName(d.wettest.month), mm: num(d.wettest.precipMm, L, 0), driest: mName(d.driest.month), driestMm: num(d.driest.precipMm, L, 0) }));
  }
  if (d.activity === 'cycling' && d.windiest) {
    paragraphs.push(cp.windiest({ month: mName(d.windiest.month), ms: num(d.windiest.wind, L, 1) }));
    if (d.windyMonths.length) paragraphs.push(cp.windyMonths({ names: joinList(d.windyMonths.map(mName), L), above: num(band.windAbove, L, 1) }));
  }
  paragraphs.push(cp.method({ city, period: d.period, low: band.meanLow, high: band.meanHigh }));
  paragraphs.push(cp.caution);

  const showWind = d.activity === 'cycling';
  const showRain = d.activity !== 'swimming';
  const head = [cp.table.month, cp.table.temp];
  if (showRain) head.push(cp.table.rain);
  if (showWind) head.push(cp.table.wind);
  head.push(cp.table.fit);

  return {
    h1: cp.h1({ activity, city }),
    title: cp.title({ activity, city }),
    description: cp.description({ activity, city, good: d.goodCount, low: band.meanLow, high: band.meanHigh }),
    facts: [
      { label: cp.facts.good, value: num(d.goodCount, L, 0) },
      { label: cp.facts.season, value: season || cp.table.no },
      { label: cp.facts.hottest, value: mName(d.hottest.month) + ', ' + num(d.hottest.tmean, L, 1) },
      { label: cp.facts.band, value: num(band.meanLow, L, 0) + ' to ' + num(band.meanHigh, L, 0) },
    ],
    paragraphs,
    table: {
      caption: cp.h1({ activity, city }),
      head,
      rows: d.months.map((m) => {
        const cells = [mName(m.month), m.tmean == null ? cp.table.no : num(m.tmean, L, 1)];
        if (showRain) cells.push(m.precipMm == null ? cp.table.no : num(m.precipMm, L, 0) + ' mm');
        if (showWind) cells.push(m.wind == null ? cp.table.no : num(m.wind, L, 1));
        cells.push(m.inBand && !m.windy ? cp.table.yes : cp.table.no);
        return { cells };
      }),
    },
    faq: cp.faq({ activity, city, good: d.goodCount, season: season || '', low: band.meanLow, high: band.meanHigh }),
    sources: sourceRows([sportSource()], pack),
    schemaType: 'Dataset',
    entityName: city,
  };
}

// ------------------------------------------------------------------- the pulse

// The public holidays of a country, and the three things a dated list does not
// say by itself.
//
// Which of the days the whole country keeps, because in Germany eleven of the
// twenty apply only in named states and a page that listed all twenty would be
// wrong for most readers. How many fall on a Saturday or a Sunday, because
// those are days off nobody gets and almost none of these countries moves
// them. And how many fall on a Monday or a Friday, because those are the ones
// worth planning around.
//
// All three come out of the same dated rows the table prints, so the sentence
// and the row cannot disagree.
function holidaysModel(page, pack) {
  const d = holidaysFor(page.entity);
  if (!d) return { refused: 'no holiday data for ' + page.entity };
  const cp = pack.holidays;
  if (!cp) return { refused: 'no holidays copy in ' + page.language };
  const L = page.language;
  // The country as the subject of a sentence, which is the only form that
  // stays grammatical in nine languages without a preposition table. French,
  // Italian and Portuguese refuse a country with no stored subject form
  // rather than printing an ungrammatical sentence.
  const c = subject(page.entity, L);
  if (!c) return { refused: 'no subject form for ' + page.entity + ' in ' + L };
  const bare = plain(page.entity, L);
  const named = (h) => holidayName(h, L);
  const list = (rows, n) => joinList(rows.slice(0, n).map(named), L);

  const paragraphs = [
    d.regional.length
      ? cp.answer({ c, year: d.year, everywhere: d.everywhere.length, regional: d.regional.length })
      : cp.onlyEverywhere({ c, year: d.year, everywhere: d.everywhere.length }),
    // One is its own sentence in every language here, and in Polish so are
    // two, three and four. A single template with the number dropped into it
    // printed `3 wypada` where Polish needs `3 wypadaja`, and `Eine faellt`
    // where German needs `Einer faellt`.
    d.lostToWeekend.length === 1
      ? cp.weekendOne({ year: d.year, everywhere: d.everywhere.length, names: list(d.lostToWeekend, 1) })
      : d.lostToWeekend.length
        ? cp.weekend({ year: d.year, lost: d.lostToWeekend.length, everywhere: d.everywhere.length, names: list(d.lostToWeekend, 4), nForm: cp.nForm })
        : cp.noWeekend({ year: d.year }),
    d.longWeekend.length === 1
      ? cp.longWeekendOne({ names: list(d.longWeekend, 1) })
      : d.longWeekend.length
        ? cp.longWeekend({ n: d.longWeekend.length, names: list(d.longWeekend, 4), nForm: cp.nForm })
        : cp.noLongWeekend(),
  ];
  if (d.regional.length) {
    paragraphs.push(cp.regionalList({ n: d.regional.length, regions: d.regions.length, names: list(d.regional, 3), nForm: cp.nForm }));
  }
  if (d.busiestMonth && d.busiestMonth.count > 1) {
    paragraphs.push(cp.busiest({ month: cp.months[d.busiestMonth.month - 1], n: d.busiestMonth.count }));
  }
  if (d.nextYear) paragraphs.push(cp.nextYear({ year: d.nextYear }));
  paragraphs.push(cp.method({ c: bare }));
  paragraphs.push(cp.caution);

  const facts = [
    { label: cp.facts.everywhere, value: num(d.everywhere.length, L, 0) },
    { label: cp.facts.weekend, value: num(d.lostToWeekend.length, L, 0) },
    { label: cp.facts.longWeekend, value: num(d.longWeekend.length, L, 0) },
  ];
  if (d.regional.length) facts.push({ label: cp.facts.regional, value: num(d.regional.length, L, 0) });

  return {
    h1: cp.h1({ c: bare, year: d.year }),
    title: (() => {
      const long = cp.title({ c: bare, year: d.year });
      return long.length <= 75 ? long : cp.h1({ c: bare, year: d.year });
    })(),
    description: cp.description({ c: bare, year: d.year, n: d.days.length, everywhere: d.everywhere.length }),
    facts,
    paragraphs,
    table: {
      caption: cp.h1({ c: bare, year: d.year }),
      head: [cp.table.date, cp.table.day, cp.table.name, cp.table.where],
      // Spain carries fifty four days once every region is counted, so the
      // table is capped the way every other table here is.
      rows: d.days.slice(0, 60).map((h) => ({
        cells: [
          h.date,
          cp.days[h.weekday],
          named(h) || h.date,
          h.everywhere ? cp.table.everywhere : h.subdivisions.join(', '),
        ],
      })),
    },
    faq: cp.faq({ c: bare, year: d.year, everywhere: d.everywhere.length, regional: d.regional.length }),
    sources: sourceRows([holidaySource()], pack),
    schemaType: 'Dataset',
    entityName: bare,
  };
}

// The same data one level down, where most of the demand is.
//
// The page exists to answer one comparison the national page cannot: how many
// days this region gets and how many more that is than the rest of the
// country. In Bavaria it is four more than the nine every German state keeps,
// and that difference is the reason `feiertage bayern 2026` outsells
// `feiertage 2026`.
// The shape of a year of holidays: the longest stretch with none in it, and the
// months that have none at all. Both come out of the same dated list the table
// prints, and both are what a reader planning time off actually asks.
function calendarShape(days) {
  const dates = (days || []).map((h) => h.date).filter(Boolean).sort();
  if (dates.length < 2) return null;
  const at = (iso) => ({ iso, month: Number(iso.slice(5, 7)), time: Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) });
  let widest = null;
  for (let i = 1; i < dates.length; i += 1) {
    const a = at(dates[i - 1]);
    const b = at(dates[i]);
    const gap = Math.round((b.time - a.time) / 86400000);
    if (!widest || gap > widest.gapDays) widest = { gapDays: gap, from: a, to: b };
  }
  const has = new Set(dates.map((d) => Number(d.slice(5, 7))));
  const emptyMonths = [];
  for (let m = 1; m <= 12; m += 1) if (!has.has(m)) emptyMonths.push(m);
  return { ...widest, emptyMonths };
}

function subdivisionHolidaysModel(page, pack) {
  const split = splitRegion(page.entity);
  if (!split) return { refused: 'not a subdivision entity: ' + page.entity };
  const d = holidaysForRegion(split.iso2, split.shortName);
  if (!d) return { refused: 'no holiday data for ' + page.entity };
  const cp = pack.holidays;
  if (!cp) return { refused: 'no holidays copy in ' + page.language };
  const L = page.language;
  const r = d.names[L] || d.names.en || Object.values(d.names)[0];
  if (!r) return { refused: 'the source does not name ' + page.entity + ' in any language' };
  const c = plain(d.iso2, L);
  const named = (h) => holidayName(h, L);
  const list = (rows, n) => joinList(rows.slice(0, n).map(named), L);

  const paragraphs = [
    cp.regionAnswer({ r, c, year: d.year, applies: d.days.length, countryDays: d.countryDays, extra: d.moreThanCountry, names: list(d.own, 4) }),
    d.lostToWeekend.length === 1
      ? cp.weekendOne({ year: d.year, everywhere: d.days.length, names: list(d.lostToWeekend, 1) })
      : d.lostToWeekend.length
        ? cp.weekend({ year: d.year, lost: d.lostToWeekend.length, everywhere: d.days.length, names: list(d.lostToWeekend, 4), nForm: cp.nForm })
        : cp.noWeekend({ year: d.year }),
    d.longWeekend.length === 1
      ? cp.longWeekendOne({ names: list(d.longWeekend, 1) })
      : d.longWeekend.length
        ? cp.longWeekend({ n: d.longWeekend.length, names: list(d.longWeekend, 4), nForm: cp.nForm })
        : cp.noLongWeekend(),
  ];
  // Where this region stands among the others, and which of them keep an
  // identical list. Without these two the region pages are near copies of one
  // another, and honestly so: Hamburg and Lower Saxony keep exactly the same
  // days. Naming that is more useful than a paragraph that differs by a place
  // name, and it is what a reader moving between two of them wants to know.
  const nameOfRegion = (o) => o.names[L] || o.names.en || Object.values(o.names)[0];
  paragraphs.push(cp.regionRank({
    r, rank: d.rank, of: d.ofRegions,
    most: nameOfRegion(d.most), mostDays: d.most.days.length,
    fewest: nameOfRegion(d.fewest), fewestDays: d.fewest.days.length,
  }));
  paragraphs.push(d.sameAs.length
    ? cp.regionSameAs({ names: joinList(d.sameAs.slice(0, 5).map(nameOfRegion), L) })
    : cp.regionUnique({ r }));
  if (d.insideOnly.length) paragraphs.push(cp.regionInside({ n: d.insideOnly.length }));
  // The shape of the year, which is the fact that actually separates two
  // regions with nearly the same list. Sachsen and Sachsen-Anhalt keep the same
  // number of days and differ by which ones, and the difference only becomes
  // visible as a planning fact: where the long empty stretch falls, and which
  // months have nothing in them at all.
  const shape = calendarShape(d.days);
  if (shape) {
    paragraphs.push(cp.regionStretch({
      days: num(shape.gapDays, L, 0),
      from: monthIn(shape.from.month, L) || monthName(shape.from.month, L),
      to: monthIn(shape.to.month, L) || monthName(shape.to.month, L),
    }));
    if (shape.emptyMonths.length) {
      paragraphs.push(cp.regionEmptyMonths({
        n: shape.emptyMonths.length,
        names: joinList(shape.emptyMonths.map((m) => monthName(m, L)), L),
        nForm: cp.nForm,
      }));
    }
  }
  if (d.nextYear) paragraphs.push(cp.nextYear({ year: d.nextYear }));
  paragraphs.push(cp.method({ c }));
  paragraphs.push(cp.caution);

  return {
    h1: cp.regionH1({ r, year: d.year }),
    // The long title is the better one and it does not fit every region name.
    // `Nordrhein-Westfalen` and `Comunidad Valenciana` pushed it past the
    // seventy five character ceiling, where a search engine truncates it and
    // the clause that made it worth writing is the part that disappears.
    title: (() => {
      const long = cp.regionTitle({ r, year: d.year });
      return long.length <= 75 ? long : cp.regionH1({ r, year: d.year });
    })(),
    description: cp.regionDescription({ r, c, year: d.year, applies: d.days.length, extra: d.moreThanCountry }),
    facts: [
      { label: cp.facts.everywhere, value: num(d.days.length, L, 0) },
      { label: cp.facts.weekend, value: num(d.lostToWeekend.length, L, 0) },
      { label: cp.facts.longWeekend, value: num(d.longWeekend.length, L, 0) },
    ],
    paragraphs,
    table: {
      caption: cp.regionH1({ r, year: d.year }),
      head: [cp.table.date, cp.table.day, cp.table.name, cp.table.where],
      rows: d.days.slice(0, 60).map((h) => ({
        cells: [h.date, cp.days[h.weekday], named(h) || h.date, h.everywhere ? cp.table.everywhere : r],
      })),
    },
    faq: cp.regionFaq({ r, c, year: d.year, applies: d.days.length, extra: d.moreThanCountry }),
    sources: sourceRows([holidaySource()], pack),
    schemaType: 'Dataset',
    entityName: r,
  };
}

const BUILDERS = {
  'cost-of-living.country': costOfLivingModel,
  'work.country-salaries': salaryModel,
  'rankings.index': rankingModel,
  'tools.calculator': toolModel,
  'tools.cost-calculator': toolModel,
  'tools.cost-comparison': toolModel,
  'tools.matcher': toolModel,
  'weather.country-best-time': bestTimeModel,
  'neighbourhoods.city-where-to-stay': areasModel,
  'events.country-holidays': holidaysModel,
  'events.subdivision-holidays': subdivisionHolidaysModel,
  'sport.city-season': sportModel,
  'rents.country-inflation': rentModel,
};

// Build one page model. Returns `{ refused }` rather than a partial model
// whenever a value the page needs is missing, so nothing downstream has to
// guess whether a short page is short on purpose.
export function build(page, { now = new Date() } = {}) {
  const pack = PACKS[page.language];
  if (!pack) return { refused: 'no copy pack for ' + page.language };
  const builder = BUILDERS[page.family];
  if (!builder) return { refused: 'no model builder for ' + page.family };
  const core = builder(page, pack, { now });
  if (core.refused) return core;

  const a = atlasPath(page);
  if (!a) return { refused: 'no path for this page' };
  const url = SITE + a.path;

  return {
    ...core,
    paragraphs: core.paragraphs.filter(Boolean).map(sentence),
    url,
    path: a.path,
    canonical: url,
    locale: page.language,
    family: page.family,
    surface: page.surface,
    entity: page.entity,
    market: page.market,
    // The cohort travels on the model because every measurement of this
    // experiment is cut by it, and a report that has to infer a cohort from a
    // manifest filename is a report that will infer it wrong once.
    cohort: page.cohort || null,
    keyword: page.keyword,
    alternates: page.alternates || [],
    breadcrumbs: [{ name: pack.ui.home, href: '/' + page.language + '/' }, { name: core.h1 }],
    labels: { facts: pack.ui.atAGlance, sources: pack.ui.sources, questions: pack.ui.questions, related: pack.ui.related, method: pack.ui.method, crumbs: pack.ui.crumbs, notAQuote: pack.ui.notAQuote },
    links: [],
    sections: [{ heading: null, paragraphs: core.paragraphs.filter(Boolean).map(sentence) }],
  };
}

// Word count of everything a reader sees, which is what the minimum word
// gate is actually about. Japanese has no spaces, so it is counted in
// characters and compared against its own floor rather than being declared
// too short by a rule written for European languages.
export function words(model) {
  // Everything in the main column, which is the same definition the existing
  // `modelText` uses. The table is not decoration: a reader looking at a
  // thirteen row basket is reading, and a word count that ignored it would
  // call a dense data page thin.
  const table = model.table ? [model.table.caption, ...model.table.head, ...model.table.rows.flatMap((r) => r.cells)] : [];
  const text = [model.h1, ...model.paragraphs, ...(model.faq || []).flatMap((q) => [q.q, q.a]), ...(model.facts || []).flatMap((f) => [f.label, String(f.value)]), ...table, ...(model.sources || []).map((s) => s.attribution)].join(' ');
  if (model.locale === 'ja') return { count: [...text.replace(/\s+/g, '')].length, unit: 'characters' };
  return { count: text.split(/\s+/).filter(Boolean).length, unit: 'words' };
}
