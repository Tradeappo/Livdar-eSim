// The public holidays of a country, read from the events source.
//
// What makes this page worth building rather than copying is the part every
// calendar site leaves out. A list of dates is a list of dates; what a reader
// actually wants to know is which of those days the whole country stops,
// which apply only where they live, and which of them land on a Saturday and
// are therefore worth nothing to them this year.
//
// All three are computed from the same dated rows, so the sentence on the
// page and the row in the table cannot drift apart.

import { readFileSync, existsSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url, '../..');
let cache = null;

export function store() {
  if (cache) return cache;
  const u = new URL('data/atlas/sources/events/public-holidays.json', ROOT);
  cache = existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : { store: {} };
  return cache;
}

export function resetCache() { cache = null; }
export const countries = () => Object.keys(store().store || {});

// Every region that has days of its own, as `DE-BY` style entity ids.
export function subdivisions() {
  const out = [];
  for (const [iso2, c] of Object.entries(store().store || {})) {
    for (const s of c.subdivisions || []) out.push({ entity: iso2 + '-' + s.shortName, iso2, shortName: s.shortName, names: s.names });
  }
  return out;
}

export const splitEntity = (entity) => {
  const i = String(entity).indexOf('-');
  return i < 0 ? null : { iso2: String(entity).slice(0, i), shortName: String(entity).slice(i + 1) };
};

// Day of the week from the date alone, with no time zone anywhere near it. A
// public holiday is a calendar date, not an instant, and constructing a Date
// from the string would move it across a day boundary for half the world.
export const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export function weekdayOf(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return DAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function forCountry(iso2, { year = null } = {}) {
  const row = (store().store || {})[String(iso2).toUpperCase()];
  if (!row) return null;
  const y = year || (store().window || [])[0] || row.years[0];
  const list = (row.holidays || {})[y] || [];
  if (!list.length) return null;

  const days = list.map((h) => ({ ...h, weekday: weekdayOf(h.date) }));
  const everywhere = days.filter((h) => h.everywhere);
  const regional = days.filter((h) => !h.everywhere);
  // A holiday on a Saturday or a Sunday is a day off nobody gets, and in most
  // of these countries it is not moved. A holiday on a Monday or a Friday is
  // the opposite: it makes a long weekend without spending leave.
  const lost = everywhere.filter((h) => h.weekday === 'saturday' || h.weekday === 'sunday');
  const longWeekend = everywhere.filter((h) => h.weekday === 'monday' || h.weekday === 'friday');
  const byMonth = {};
  for (const h of everywhere) {
    const m = Number(h.date.slice(5, 7));
    byMonth[m] = (byMonth[m] || 0) + 1;
  }
  const busiest = Object.entries(byMonth).sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]))[0];
  const regions = [...new Set(regional.flatMap((h) => h.subdivisions))].sort();

  return {
    iso2: row.iso2,
    year: Number(y),
    years: row.years,
    days,
    everywhere,
    regional,
    lostToWeekend: lost,
    longWeekend,
    regions,
    busiestMonth: busiest ? { month: Number(busiest[0]), count: busiest[1] } : null,
    languages: row.languages,
    nextYear: row.years.includes(Number(y) + 1) ? Number(y) + 1 : null,
  };
}

// The name to print. The provider names each day in English, in German and in
// the country's own language, and rarely in more than that, so a page in a
// fourth language falls back to English rather than inventing a translation.
// The days that actually apply in one region of a country.
//
// A day counts when the whole country keeps it, or when the file attaches
// this region's code to it. A day attached to something inside the region,
// a Spanish province or a Swiss commune, does not: it is kept in one town of
// Andalusia and putting it on the Andalusia page would tell most of Andalusia
// it has a day off it does not have. Those are counted separately instead.
export function forSubdivision(iso2, shortName, { year = null } = {}) {
  const row = (store().store || {})[String(iso2).toUpperCase()];
  if (!row) return null;
  const region = (row.subdivisions || []).find((s) => s.shortName === shortName);
  if (!region) return null;
  const country = forCountry(iso2, { year });
  if (!country) return null;
  const children = new Set(region.children || []);
  const own = country.days.filter((h) => h.subdivisions.includes(shortName));
  const applies = country.days.filter((h) => h.everywhere || h.subdivisions.includes(shortName));
  const insideOnly = country.days.filter((h) => !h.everywhere && !h.subdivisions.includes(shortName) && h.subdivisions.some((x) => children.has(x)));
  const lost = applies.filter((h) => h.weekday === 'saturday' || h.weekday === 'sunday');
  const longWeekend = applies.filter((h) => h.weekday === 'monday' || h.weekday === 'friday');
  // How this region stands among the others in the same country, and which
  // of them keep exactly the same days.
  //
  // Both exist because without them these pages are near copies of each
  // other, and honestly so: Hamburg and Lower Saxony keep an identical list.
  // Saying that outright is more useful than nine paragraphs that differ by a
  // place name, and it is the fact a reader moving between two states wants.
  const signature = (rows) => rows.map((h) => h.date).sort().join(',');
  const mine = signature(applies);
  const peers = (row.subdivisions || [])
    .filter((o) => o.shortName !== shortName)
    .map((o) => ({
      shortName: o.shortName,
      names: o.names,
      days: country.days.filter((h) => h.everywhere || h.subdivisions.includes(o.shortName)),
    }));
  const sameAs = peers.filter((o) => signature(o.days) === mine);
  const ordered = [...peers, { shortName, names: region.names, days: applies }]
    .sort((a, b) => b.days.length - a.days.length || a.shortName.localeCompare(b.shortName));
  const rank = ordered.findIndex((o) => o.shortName === shortName) + 1;

  return {
    iso2: country.iso2,
    shortName,
    code: region.code,
    rank,
    ofRegions: ordered.length,
    most: ordered[0],
    fewest: ordered[ordered.length - 1],
    sameAs,
    names: region.names,
    category: region.category,
    year: country.year,
    nextYear: country.nextYear,
    days: applies,
    nationwide: country.everywhere,
    own,
    insideOnly,
    lostToWeekend: lost,
    longWeekend,
    // How this region compares with the country it is in, which is the
    // question a reader in Bavaria is actually asking.
    moreThanCountry: applies.length - country.everywhere.length,
    countryDays: country.everywhere.length,
  };
}

export function nameOf(holiday, language) {
  return holiday.names[language] || holiday.names.en || Object.values(holiday.names)[0] || null;
}

export function sourceRecord() {
  const s = store();
  return {
    source: s.provider || 'OpenHolidays',
    sourceRef: s.source || 'events-verified',
    observedAt: s.builtOn || null,
    ingestedAt: s.builtOn || null,
    confidence: s.confidence || 'official-derived',
    licence: s.licence || 'ODbL 1.0',
    derivation: s.derivation || null,
    note: s.caution || null,
  };
}
