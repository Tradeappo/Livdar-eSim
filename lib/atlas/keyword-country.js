// Reading a country out of a measured keyword.
//
// Every country family faces the same problem and it is not a small one: the
// provider returns what a market searched, and what a market searched is a
// sentence, not an entity. `cost of living in georgia`, `average salary in
// georgia` and `costo della vita in georgia` are three keywords with the same
// remainder and only one of them is about Tbilisi.
//
// The resolution is by subtraction rather than by search. Remove the head term
// the market was asked with, remove the articles and prepositions that can sit
// around a country name, and whatever is left has to name exactly one country.
// Searching for a country name inside the keyword instead would accept `best
// time to visit mexico city` and `average salary in new york`, which are pages
// about the wrong thing wearing the right name.
//
// This module is shared because the country table, the inflections and the
// traps are properties of the language rather than of the family. Only the
// head terms and the fillers differ per family, and those are passed in.

import { readFileSync } from 'node:fs';
import { plain } from './content/country-forms.js';
import { rootFrom } from './repo-root.js';

export const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/ł/g, 'l').replace(/ß/g, 'ss').toLowerCase().trim();

export const MARKET_COUNTRY = { 'en-US': 'us', 'en-GB': 'gb', 'de-DE': 'de', 'fr-FR': 'fr', 'it-IT': 'it', 'es-ES': 'es', 'pt-BR': 'br', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'jp' };
export const MARKET_LANG = { 'en-US': 'en', 'en-GB': 'en', 'de-DE': 'de', 'fr-FR': 'fr', 'it-IT': 'it', 'es-ES': 'es', 'pt-BR': 'pt', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'ja' };

// Names a market searches that are not the CLDR name: colloquial, inflected
// past what a stem can reach, or ambiguous under the stem rule.
export const ALIASES = {
  en: { us: 'US', uk: 'GB', 'the uk': 'GB', england: 'GB', britain: 'GB', 'great britain': 'GB', turkey: 'TR', usa: 'US', 'the usa': 'US', america: 'US', 'the united states': 'US', holland: 'NL', 'czech republic': 'CZ' },
  de: { england: 'GB', grossbritannien: 'GB', usa: 'US', holland: 'NL', tuerkei: 'TR' },
  // The last four are multi word names the stem rule deliberately will not
  // touch, plus `vietnam`, which fails an exact match only because CLDR writes
  // it `Viet Nam` with a space.
  fr: { angleterre: 'GB', 'republique tcheque': 'CZ', hollande: 'NL', 'etats unis': 'US', 'coree sud': 'KR', 'cap vert': 'CV', 'ile maurice': 'MU', vietnam: 'VN' },
  it: { inghilterra: 'GB', olanda: 'NL', 'repubblica ceca': 'CZ', 'stati uniti': 'US' },
  es: { holanda: 'NL', inglaterra: 'GB', 'republica checa': 'CZ', 'estados unidos': 'US', eeuu: 'US' },
  pt: { inglaterra: 'GB', holanda: 'NL', 'republica checa': 'CZ', 'estados unidos': 'US', eua: 'US' },
  nl: { engeland: 'GB', holland: 'NL', amerika: 'US' },
  pl: {
    anglii: 'GB', anglia: 'GB', polsce: 'PL', wloszech: 'IT', wlochy: 'IT', wegrzech: 'HU', wegry: 'HU',
    malcie: 'MT', czechach: 'CZ', czechy: 'CZ', niemczech: 'DE', holandii: 'NL', usa: 'US', stanach: 'US',
    grecji: 'GR', szwecji: 'SE', portugalii: 'PT', austrii: 'AT', hiszpanii: 'ES', francji: 'FR',
    chorwacji: 'HR', irlandii: 'IE', norwegii: 'NO', finlandii: 'FI', rumunii: 'RO', bulgarii: 'BG',
    turcji: 'TR', japonii: 'JP', slowenii: 'SI', slowacji: 'SK', litwie: 'LT', lotwie: 'LV', estonii: 'EE',
    belgii: 'BE', szwajcarii: 'CH', danii: 'DK', islandii: 'IS', cyprze: 'CY', kanadzie: 'CA',
    australii: 'AU', meksyku: 'MX', brazylii: 'BR', argentynie: 'AR', tajlandii: 'TH', wietnamie: 'VN',
    indonezji: 'ID', filipinach: 'PH', indiach: 'IN', chinach: 'CN', korei: 'KR', maroku: 'MA',
    egipcie: 'EG', rpa: 'ZA', albanii: 'AL', gruzji: 'GE', kolumbii: 'CO', wenezueli: 'VE',
    'nowej zelandii': 'NZ', 'nowa zelandia': 'NZ', 'korei poludniowej': 'KR', 'czarnogora': 'ME',
    'bialorusi': 'BY', 'malezja': 'MY', ukrainie: 'UA', luksemburgu: 'LU',
  },
  ja: { 'イギリス': 'GB', 'アメリカ': 'US', 'オランダ': 'NL' },
};

// Names that are a country somewhere and something else to the market being
// asked. `cost of living in georgia` is 1,400 a month in the United States and
// almost none of it is about the country: it is the state. The identical
// remainder in Italian is the country, which is why this is per market and not
// a global blocklist.
export const AMBIGUOUS = {
  'en-US': new Set(['georgia', 'jordan', 'washington']),
};

// Every country there is, not only the ones this family has data for.
//
// Resolution has to happen against the whole world and coverage has to be
// checked afterwards, because a stem match inside a short list is a match
// against whatever happens to be there. `durchschnittsgehalt schweiz` has no
// Swiss earnings behind it, and against a list that contains Sweden and not
// Switzerland the stem rule happily returned Sweden. `average salary in
// australia` returned Austria the same way. Both are pages about the wrong
// country, and both look perfectly healthy in a report.
let universeCache = null;
export function universe() {
  if (universeCache) return universeCache;
  const u = new URL('data/atlas/entities/countries.json', rootFrom(import.meta.url, '../..'));
  const rows = JSON.parse(readFileSync(u, 'utf8'));
  universeCache = (Array.isArray(rows) ? rows : rows.rows || rows.countries).map((r) => r.iso2).filter(Boolean);
  return universeCache;
}

let nameCache = null;
export function namesFor(lang, isoList) {
  nameCache ||= {};
  const key = lang + '|' + isoList.length;
  if (nameCache[key]) return nameCache[key];
  const rows = [];
  for (const iso of isoList) { const n = plain(iso, lang); if (n) rows.push({ iso, name: fold(n) }); }
  nameCache[key] = rows;
  return rows;
}

// Used only after an exact match failed. It demands a long shared prefix and a
// similar length, and it refuses whenever more than one country qualifies, so
// an inflected form resolves and a coincidence does not.
//
// Multi word names are excluded, because a shared leading word is not evidence:
// `santa catarina` is a Brazilian state and it stems happily onto `santa
// lucia`, a country three thousand miles away.
export function stemMatch(rest, rows) {
  const hits = [];
  if (rest.includes(' ')) return null;
  for (const r of rows) {
    if (r.name.includes(' ')) continue;
    const a = rest; const b = r.name;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    const need = Math.max(4, Math.floor(b.length * 0.55));
    if (i >= need && Math.abs(a.length - b.length) <= 4) hits.push(r.iso);
  }
  return hits.length === 1 ? hits[0] : null;
}

// Removing the head term, at a word boundary where the language has words.
//
// A plain substring test looked right and was not. The Polish salary family
// lists `zarobki w` and `srednie zarobki w`, and the Areas family lists
// `dzielnice w` alongside `dzielnice`. Against `dzielnice warszawy` the
// substring test matched `dzielnice w` inside `dzielnice warszawy` and left
// `arszawy`, so the largest Areas keyword in the Polish market, seventeen
// thousand searches a month, resolved to nothing and was counted as not a
// city. The boundary test is tried first and the substring test survives as a
// fallback, because Japanese keywords have no spaces to find a boundary in.
export function stripHead(text, heads) {
  const list = (heads || []).slice().sort((a, b) => b.length - a.length);
  const padded = ' ' + text + ' ';
  for (const h of list) {
    const f = fold(h);
    if (padded.includes(' ' + f + ' ')) return { head: h, rest: padded.replace(' ' + f + ' ', ' ').trim() };
  }
  for (const h of list) {
    const f = fold(h);
    if (text.includes(f)) return { head: h, rest: text.replace(f, ' ').trim() };
  }
  return null;
}

// `heads` and `fillers` are the family's, keyed by market. Everything else is
// the language's and comes from this module unless a caller overrides it.
export function countryFrom(keyword, market, isoList, { heads, fillers, aliases = ALIASES, ambiguous = AMBIGUOUS, world = null } = {}) {
  const lang = MARKET_LANG[market];
  if (!lang) return { reason: 'unknown market' };
  const all = world || universe();
  const covers = (iso, how) => (isoList.includes(iso) ? { iso2: iso, how } : { reason: 'outside coverage: ' + iso });
  const hit = stripHead(fold(keyword), heads[market] || []);
  if (!hit) return { reason: 'no head term' };
  let rest = hit.rest;
  const stop = new Set((fillers[market] || []).map(fold));
  rest = rest.split(/\s+/).filter((t) => t && !stop.has(t)).join(' ').trim();
  if (!rest) return { reason: 'head term alone, no destination' };
  if ((ambiguous[market] || new Set()).has(rest)) return { reason: 'ambiguous in this market: ' + rest };
  const alias = (aliases[lang] || {})[rest];
  if (alias) return covers(alias, 'alias');
  const rows = namesFor(lang, all);
  const exact = rows.filter((r) => r.name === rest);
  if (exact.length === 1) return covers(exact[0].iso, 'exact');
  if (exact.length > 1) return { reason: 'ambiguous' };
  const stem = stemMatch(rest, rows);
  if (stem) return covers(stem, 'stem');
  return { reason: 'not a country: ' + rest };
}
