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
import { forCountry as colFor, BASKET } from './cost-of-living.js';
import { forCountry as salFor, rankOn } from './salary.js';
import { ranking as colRanking, store as colStore } from './cost-of-living.js';
import { RANKINGS, POPULATIONS } from './rankings.js';
import { TOOLS } from './tools-queue.js';
import { subject, plain, travelTo, keywordAliases } from './content/country-forms.js';
import { rankingName, measureShort, inputTerm, monthName, monthIn, joinList } from './content/terms.js';
import { forCountry as climateForCountry, sourceRecord as climateSource } from './climate.js';
import { toolCopy } from './content/tool-copy.js';
import { rankingCopy } from './content/ranking-copy.js';
import { atlasPath } from './atlas-urls.js';
import { store as salStore } from './salary.js';
import { estimate as movingCost, MOVE_SIZES } from './tools/moving-cost.js';

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

export function headingFromKeyword(keyword, countryName, language) {
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
      parts[parts.length - 1] = last.charAt(0).toUpperCase() + last.slice(1);
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
  const h = pack.col.heading({ keyword: page.keyword, c: bare, kwHeading: headingFromKeyword(page.keyword, bare, page.language) });
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
  const h = pack.salaryPage.heading({ keyword: page.keyword, c: bare, kwHeading: headingFromKeyword(page.keyword, bare, page.language) });

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
};

// A worked example, computed from the store rather than written down, so the
// numbers on the page are the numbers the tool would produce.
function workedExample(t, pack, language) {
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

const BUILDERS = {
  'cost-of-living.country': costOfLivingModel,
  'work.country-salaries': salaryModel,
  'rankings.index': rankingModel,
  'tools.calculator': toolModel,
  'tools.cost-calculator': toolModel,
  'tools.cost-comparison': toolModel,
  'tools.matcher': toolModel,
  'weather.country-best-time': bestTimeModel,
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
