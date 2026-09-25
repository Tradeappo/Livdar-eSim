// Public holidays, from the OpenHolidays data set.
//
//   node scripts/atlas/ingest/public-holidays.mjs
//   node scripts/atlas/ingest/public-holidays.mjs --write
//
// Pulse is the surface with the largest measured demand in this programme and
// no source at all, because every event feed worth having is either licensed,
// behind a portal this container cannot reach, or a scrape this brief
// forbids. Public holidays are the exception: they are an event that recurs,
// they are published by the state, the dates are known years ahead, and there
// is an openly licensed aggregation of them that is reachable here.
//
// The demand is not a consolation prize. `jours feries 2026` is 181,000 a
// month at difficulty 3 and `feiertage 2026` is 90,000 at difficulty 12, which
// are the two largest terms measured anywhere in this programme.
//
// Three things about this data need care and each one is handled below rather
// than assumed away:
//
//   The file layout is not uniform. Most countries publish
//   `holidays.public.csv`, Portugal publishes `holidays.national.csv`, and
//   the column order differs between files: some carry Subdivisions before
//   Name and some after, some carry Tags or Comment or TemporalScope and most
//   do not. Every file is therefore parsed by header name.
//
//   `Public` is not the only type in these files. Portugal's national file
//   also carries `Optional`, which is a day employers may grant and not a day
//   the country stops. Only `Public` is kept.
//
//   Regional does not mean what it looks like. The German file marks New
//   Year's Day, Good Friday and both Christmas days `Regional`, because
//   German public holidays are state law and not federal law. All sixteen
//   states keep them. What actually separates a day everyone gets from a day
//   only some people get is the subdivision list, not that field, and reading
//   the field instead produced a German page with one public holiday on it.

import { writeFileSync, mkdirSync } from 'node:fs';
import { rootFrom } from '../../../lib/atlas/repo-root.js';

const ROOT = rootFrom(import.meta.url, '../../..');
export const SOURCE_ID = 'events-verified';
export const BASE = 'https://raw.githubusercontent.com/openpotato/openholidaysapi.data/main/src/';
export const LICENCE = 'ODbL 1.0';
export const ATTRIBUTION = 'Public holiday dates from the OpenHolidays data set, ODbL 1.0, compiled from official national sources';

// Every country the data set carries a holiday file for. Ordered as the
// repository orders them so that a diff against a later release is readable.
export const COUNTRIES = ['ad', 'al', 'at', 'be', 'bg', 'br', 'by', 'ch', 'cz', 'de', 'ee', 'es', 'fr', 'hr', 'hu', 'ie', 'it', 'li', 'lt', 'lu', 'lv', 'mc', 'md', 'mt', 'mx', 'nl', 'pl', 'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sk', 'sm', 'va', 'za'];
export const FILE_NAMES = ['holidays.public.csv', 'holidays.national.csv'];

// A row is kept when it is a public holiday in the window. A day the state
// merely permits an employer to grant is not one, and Portugal's national file
// carries several of those.
export const KEPT_TYPE = 'Public';

export function parseCsv(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const head = lines[0].split(';').map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const cells = l.split(';');
    const row = {};
    head.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

// `Name` is one cell holding every language: `ES Ano Nuevo,CA Any Nou,EN New
// Year's Day,DE Neujahr`. Splitting on the comma alone breaks any name that
// contains one, so the split is on the language tag that starts each entry.
export function parseNames(cell) {
  const out = {};
  if (!cell) return out;
  const parts = String(cell).split(/,(?=[A-Z]{2} )/);
  for (const p of parts) {
    const m = /^([A-Z]{2})\s+(.*)$/.exec(p.trim());
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

// The subdivisions of a country, with their names in each language the
// provider carries. Germany's Laender and Spain's autonomous communities are
// where most of this demand actually is: `feiertage nrw 2026` is 202,000 a
// month against 90,000 for the country, and `festivos madrid 2026` is 48,000
// against 10,000.
export async function fetchSubdivisions(code) {
  const r = await fetch(BASE + code + '/subdivisions.csv');
  if (!r.ok) return [];
  return parseCsv(await r.text()).map((row) => ({
    code: row.Code,
    isoCode: row.IsoCode || row.Code,
    shortName: row.ShortName || null,
    // `Parent` is a short name rather than a full code, so it is resolved
    // against the short names after the whole file is read.
    parent: row.Parent || null,
    names: parseNames(row.Name),
    category: parseNames(row.Category),
  }));
}

async function fetchFirst(code) {
  for (const name of FILE_NAMES) {
    const url = BASE + code + '/holidays/' + name;
    const r = await fetch(url);
    if (r.ok) return { url, name, text: await r.text() };
  }
  return null;
}

export async function build({ years = null, fetchImpl = fetchFirst, withSubdivisions = true, subdivisionsImpl = fetchSubdivisions } = {}) {
  const now = new Date();
  const window = years || [now.getUTCFullYear(), now.getUTCFullYear() + 1];
  const store = {};
  const missing = [];
  const stale = [];

  for (const code of COUNTRIES) {
    const got = await fetchImpl(code);
    if (!got) { missing.push(code.toUpperCase() + ': no holiday file'); continue; }
    const rows = parseCsv(got.text).filter((r) => r.Type === KEPT_TYPE);
    const iso2 = (rows[0]?.Country || code).toUpperCase();
    const byYear = {};
    for (const r of rows) {
      const y = Number(String(r.StartDate).slice(0, 4));
      if (!window.includes(y)) continue;
      const subdivisions = (r.Subdivisions || '').split(',').map((s) => s.trim()).filter(Boolean);
      (byYear[y] ||= []).push({
        date: r.StartDate,
        endDate: r.EndDate || null,
        // Whether the day applies everywhere, which is not the same question
        // as who legislated it. `RegionalScope` answers the second: in Germany
        // it reads Regional for New Year's Day, Good Friday and both Christmas
        // days, because German public holidays are state law rather than
        // federal. All sixteen states keep them, and a page that called them
        // regional would be wrong about every one of them.
        //
        // The subdivision list answers the first. Empty means the day is kept
        // throughout the country; a list means it is kept only there.
        everywhere: !subdivisions.length,
        legislatedNationally: (r.RegionalScope || '') === 'National',
        subdivisions,
        names: parseNames(r.Name),
      });
    }
    for (const y of Object.keys(byYear)) byYear[y].sort((a, b) => a.date.localeCompare(b.date));
    const current = byYear[window[0]] || [];
    if (!current.length) { stale.push(iso2 + ': nothing dated ' + window[0]); continue; }
    const subdivisions = withSubdivisions ? await subdivisionsImpl(code) : [];
    // A subdivision is only worth carrying when some day actually names it,
    // directly or through a parent. Spain lists every province and the
    // holidays are set by the autonomous community, so half the file would
    // otherwise be regions with nothing of their own.
    const named = new Set(current.flatMap((h) => h.subdivisions));
    const byShort = new Map(subdivisions.map((s) => [s.shortName, s]));
    const ancestorsOf = (s) => {
      const out = [];
      let cur = s;
      const seen = new Set();
      while (cur && cur.parent && !seen.has(cur.parent)) {
        seen.add(cur.parent);
        out.push(cur.parent);
        cur = byShort.get(cur.parent);
      }
      return out;
    };
    // Top level only. Switzerland lists every municipality and Spain every
    // province, so without this the source would carry 1,989 Swiss entries
    // down to villages of four hundred people. The demand is at the level
    // above: a German Land, a Spanish autonomous community, a Swiss canton.
    const kept = subdivisions
      .filter((s) => !s.parent)
      .map((s) => ({ ...s, ancestors: [] }))
      .filter((s) => named.has(s.shortName) || subdivisions.some((x) => x.parent === s.shortName && named.has(x.shortName)))
      .map((s) => ({
        code: s.code,
        shortName: s.shortName,
        names: s.names,
        category: s.category,
        // Days that name this region directly, and days that name something
        // inside it. The second kind is why Spain works: the autonomous
        // community sets the day and the file attaches it to the community.
        children: subdivisions.filter((x) => x.parent === s.shortName).map((x) => x.shortName),
      }));
    store[iso2] = {
      iso2,
      file: got.url.slice(BASE.length),
      years: Object.keys(byYear).map(Number).sort(),
      holidays: byYear,
      everywhere: current.filter((h) => h.everywhere).length,
      regional: current.filter((h) => !h.everywhere).length,
      // Which languages the provider names these days in, which decides which
      // of this programme's languages can carry the page at all.
      languages: [...new Set(current.flatMap((h) => Object.keys(h.names)))].sort(),
      subdivisions: kept,
    };
  }

  const kept = Object.values(store);
  return {
    source: SOURCE_ID,
    provider: 'OpenHolidays',
    url: 'https://github.com/openpotato/openholidaysapi.data',
    licence: LICENCE,
    attribution: ATTRIBUTION,
    builtOn: now.toISOString().slice(0, 10),
    window,
    method: 'One public holiday file per country, parsed by header name because the column order differs between them. Only rows typed Public are kept, so a day an employer may grant rather than a day the country stops is left out. Dates are the provider’s and are compiled from official national sources.',
    confidence: 'official-derived',
    derivation: 'The provider aggregates official national publications. This programme reads that aggregation rather than each state gazette, so the value is official at one remove.',
    caution: 'A public holiday is not the same thing in every country. In Germany every public holiday is set by the states rather than federally, and four fifths of them are kept in all sixteen anyway; in Switzerland almost every day is cantonal; in Spain most regions add their own. So the page separates the days kept throughout the country from the days kept only in named regions, and names the regions. Dates more than a year or two ahead can still move, because some of them are fixed by decree each year.',
    countries: kept.length,
    missing,
    // A country whose file stops before the current year cannot carry a page
    // about this year, and publishing last year's dates would be worse than
    // publishing nothing.
    staleBeforeWindow: stale,
    holidaysInWindow: kept.reduce((n, c) => n + Object.values(c.holidays).reduce((m, h) => m + h.length, 0), 0),
    subdivisionsWithOwnDays: kept.reduce((n, c) => n + (c.subdivisions || []).length, 0),
    store,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = await build();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/sources/events/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/sources/events/public-holidays.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  const { store, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
