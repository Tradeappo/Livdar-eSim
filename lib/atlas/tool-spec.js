// The data an Atlas tool page sends to the browser so the tool actually works.
//
// Every tool page in the cohort described a calculator and did not contain one.
// The logic was there - twelve implementations under lib/atlas/tools - and it
// ran on the server to produce a worked example and a table of the rule, which
// is a screenshot of a tool rather than a tool. A reader who wanted their own
// number had nowhere to type it.
//
// Three things make that fixable cheaply. The arithmetic is small. The data is
// small: the price levels the comparison needs are 39 countries on the European
// scale and 160 on the American one, which is under two kilobytes either way.
// And the implementations are pure functions of their inputs once the data is
// passed in, so the browser can run the same code the server runs rather than a
// second copy of it that will drift.
//
// So this builds a spec: the mode, the inputs, and the table the mode needs. The
// client component runs the real implementation against it. Nothing here
// invents a number and nothing rounds one differently from the server.
//
// A tool with no spec stays as it was, a description and a worked example, and
// says so: `interactive` is false and the page's primary call to action falls
// through to something that does exist rather than to a button that scrolls to a
// paragraph.

import { ranked } from './tools/cost-of-living.js';
import { salary } from './tools/salary.js';
import { forCountry as climateForCountry } from './climate.js';
import { store as priceStore } from './cost-of-living.js';
import { plain } from './content/country-forms.js';
import { forCity, cityIds } from './neighbourhoods.js';
import { cityName } from './cities.js';
import { MOVE_SIZES, TRANSPORT } from './tools/moving-cost.js';

// Which mode each tool runs in. A tool absent from this table is not
// interactive, and that is a statement about this repository rather than about
// the tool: net-salary needs tax rules that are not ingested, visa-eligibility
// needs immigration rules that are not either.
export const MODES = {
  'rent-affordability': 'share',
  'moving-cost': 'move',
  'cost-of-living-calculator': 'ratio',
  'cost-of-living-comparison': 'ratio',
  'country-comparison': 'ratio',
  'travel-budget': 'ratio',
  'salary-calculator': 'earn',
  'where-should-i-live': 'filter',
  'destination-matcher': 'filter',
  'where-should-i-stay': 'stay',
};

// Which price scale a page is written on, from its market rather than from a
// guess. The two scales are the European index at 100, which covers 39 European
// countries, and the ratio against the United States at 1, which covers 160. A
// page written for a market whose own country is on the European index uses that
// one, so the reader's own country is in the picker; every other market uses the
// broader scale. Mixing them in one picker would let a reader compare 100 with 1
// and get an answer three orders of magnitude out, which is why this returns one
// scale and the rows are all on it.
const EU_SCALE_MARKETS = new Set(['de-DE', 'fr-FR', 'it-IT', 'es-ES', 'nl-NL', 'pl-PL', 'pt-PT']);
export const unitForMarket = (market) => (EU_SCALE_MARKETS.has(market) ? 'index-eu27-100' : 'ratio-us-1');

export const SCALE_REFERENCE = {
  'index-eu27-100': { at: 100, of: 'the European Union average' },
  'ratio-us-1': { at: 1, of: 'the United States' },
};

// Why a tool is a description rather than a widget, in its own words. A generic
// reason would read as an oversight, and none of these is one.
export const NOT_INTERACTIVE = {
  'city-comparison': 'the tool declares two cities as its inputs and the only price data that exists is national, so a working picker of countries under a heading that says cities would be worse than no picker at all',
  'net-salary': 'tax rules are not ingested for any country, and net pay without them is a guess wearing a calculator',
  'visa-eligibility': 'immigration rules are not ingested, and a wrong answer here costs a reader a trip',
  'relocation-budget': 'it composes three other tools and needs a city level rent that is not published',
};

// The comfortable months a country has, on the same definition the matcher
// uses, so a filter in the browser and a filter on the server agree.
const COMFORTABLE_AT = 70;
function comfortableMonths(iso2) {
  const c = climateForCountry(iso2);
  if (!c || !c.months) return null;
  return c.months.filter((m) => m.comfort != null && m.comfort >= COMFORTABLE_AT).length;
}

// One row per country, on whichever scale the page is written in. Mixing the
// European index with the American ratio in one picker would let a reader
// compare 100 with 1 and get an answer three orders of magnitude out, so the
// scale is part of the spec and the rows are all on it.
export function priceRows(unit, language) {
  const r = ranked({ unit, limit: 300 });
  return (r.rows || [])
    .map((row) => ({ iso2: row.iso2, name: plain(row.iso2, language) || row.iso2, value: row.value }))
    .filter((row) => row.value != null)
    .sort((a, b) => a.name.localeCompare(b.name, language));
}

export function salaryRows(language) {
  const out = [];
  for (const iso2 of Object.keys(priceStore().countries || {})) {
    const s = salary(iso2);
    if (!s || !s.ok || s.grossMonthly == null) continue;
    out.push({
      iso2,
      name: plain(iso2, language) || iso2,
      gross: Math.round(s.grossMonthly),
      net: s.netMonthly == null ? null : Math.round(s.netMonthly),
      currency: s.currency || null,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, language));
}

export function filterRows(unit, language) {
  const prices = new Map(priceRows(unit, language).map((r) => [r.iso2, r]));
  const out = [];
  for (const [iso2, row] of prices) {
    const s = salary(iso2);
    out.push({
      iso2,
      name: row.name,
      value: row.value,
      net: s && s.ok && s.netMonthly != null ? Math.round(s.netMonthly) : null,
      comfortable: comfortableMonths(iso2),
    });
  }
  return out.sort((a, b) => a.value - b.value);
}

// The districts of every city the neighbourhood source covers, keyed by city, so
// the reader picks the city rather than being given whichever one the worked
// example used. Eleven fields per district and a few dozen districts per city is
// small enough to ship; the count is asserted in the tests so it stays that way.
export const DISTRICT_CAP = 16;

export function stayRows(language) {
  const cities = [];
  for (const id of cityIds()) {
    const c = forCity(id);
    if (!c || !c.byDistance || !c.byDistance.length) continue;
    // Capped, because the whole set is 76 kilobytes and no reader scrolls a
    // hundred districts. Sixteen covers every city's centre and its ring, which
    // is the question the tool answers, and the cap is asserted in the tests so
    // the payload cannot quietly grow back.
    if (c.byDistance.length < 3) continue;
    cities.push({
      cityId: String(id),
      name: cityName(id, language) || c.cityName,
      districts: c.byDistance.slice(0, DISTRICT_CAP).map((d) => ({ name: d.name, km: Math.round(d.distanceKm * 10) / 10, compass: d.compass })),
      of: c.byDistance.length,
    });
  }
  return cities.sort((a, b) => a.name.localeCompare(b.name, language));
}

// The spec for one tool page. `unit` comes from the page's own model so the
// picker and the prose are on the same scale.
export function toolSpec(toolId, { language = 'en', unit = 'index-eu27-100' } = {}) {
  const mode = MODES[toolId];
  if (!mode) return { id: toolId, interactive: false, why: NOT_INTERACTIVE[toolId] || 'no implementation is wired to a browser mode for this tool' };
  const base = { id: toolId, interactive: true, mode, language };
  const scale = SCALE_REFERENCE[unit] || null;
  if (mode === 'share') return { ...base };
  if (mode === 'move') {
    return { ...base, sizes: Object.keys(MOVE_SIZES), transports: Object.keys(TRANSPORT) };
  }
  if (mode === 'ratio') {
    const rows = priceRows(unit, language);
    if (rows.length < 4) return { id: toolId, interactive: false, why: 'fewer than four countries on the ' + unit + ' scale' };
    return { ...base, unit, scale, rows };
  }
  if (mode === 'earn') {
    const rows = salaryRows(language);
    if (!rows.length) return { id: toolId, interactive: false, why: 'no country has published earnings in the store' };
    return { ...base, rows };
  }
  if (mode === 'filter') {
    const rows = filterRows(unit, language);
    if (rows.length < 4) return { id: toolId, interactive: false, why: 'fewer than four countries to choose between' };
    return { ...base, unit, scale, rows };
  }
  if (mode === 'stay') {
    const cities = stayRows(language);
    if (!cities.length) return { id: toolId, interactive: false, why: 'the neighbourhood source covers no city' };
    return { ...base, cities };
  }
  return { id: toolId, interactive: false, why: 'unknown mode ' + mode };
}
