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
  // `deutsches` is the adjective, and it is what the German market writes in
  // `deutsches durchschnittsgehalt`. The stem rule reached it while it forgave
  // more than an ending; it is listed here now because a measured keyword is
  // better evidence for a form than a shared prefix.
  de: { england: 'GB', grossbritannien: 'GB', usa: 'US', holland: 'NL', tuerkei: 'TR', deutsches: 'DE', deutsche: 'DE' },
  // The last four are multi word names the stem rule deliberately will not
  // touch, plus `vietnam`, which fails an exact match only because CLDR writes
  // it `Viet Nam` with a space.
  fr: { angleterre: 'GB', 'republique tcheque': 'CZ', hollande: 'NL', 'etats unis': 'US', 'coree sud': 'KR', 'cap vert': 'CV', 'ile maurice': 'MU', vietnam: 'VN', francais: 'FR', francaise: 'FR' },
  it: { inghilterra: 'GB', olanda: 'NL', 'repubblica ceca': 'CZ', 'stati uniti': 'US', italiano: 'IT', italiana: 'IT' },
  es: { holanda: 'NL', inglaterra: 'GB', 'republica checa': 'CZ', 'estados unidos': 'US', eeuu: 'US', espanol: 'ES', espanola: 'ES' },
  pt: { inglaterra: 'GB', holanda: 'NL', 'republica checa': 'CZ', 'estados unidos': 'US', eua: 'US', brasileiro: 'BR', brasileira: 'BR' },
  nl: { engeland: 'GB', holland: 'NL', amerika: 'US', duitse: 'DE', duits: 'DE', belgische: 'BE', franse: 'FR' },
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
    'bialorusi': 'BY', 'malezja': 'MY', ukrainie: 'UA', luksemburgu: 'LU', rosji: 'RU', rosja: 'RU',
  },
  ja: { 'イギリス': 'GB', 'アメリカ': 'US', 'オランダ': 'NL' },
};

// Names that are a country somewhere and something else to the market being
// asked. `cost of living in georgia` is 1,400 a month in the United States and
// almost none of it is about the country: it is the state. The identical
// remainder in Italian is the country, which is why this is per market and not
// a global blocklist.
export const AMBIGUOUS = {
  // `indiana` is the one United States state the tightened stem rule cannot
  // refuse on spelling, because `india` is a prefix of it and nothing about the
  // shape of the word says which of the two the market meant. It is here rather
  // than in the rule for that reason: it is a fact about the market, not about
  // the string. `average salary in indiana` is nine hundred a month and it is
  // not about India.
  'en-US': new Set(['georgia', 'jordan', 'washington', 'indiana']),
  // The capital, not the country. `custo de vida em brasilia` is a question
  // about one city and a country page is not the answer to it, even though the
  // city is in the country the stem rule would return.
  'pt-BR': new Set(['brasilia']),
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

// Used only after an exact match failed. It forgives an ending and nothing
// else: the country name has to be consumed except for at most two characters,
// and the keyword may add at most four. It refuses whenever more than one
// country qualifies, so an inflected form resolves and a coincidence does not.
//
// The threshold used to be fifty-five per cent of the name, and that is how
// `cost of living in colorado` became a page about Colombia. Four shared
// letters out of eight cleared the bar, the two words are the same length, and
// no other country begins `colo`, so the rule returned a single confident hit
// for a United States state. The same arithmetic made `feiertage niedersachsen
// 2026`, the seventh largest holiday keyword in the German market, a page about
// the Netherlands: `nieder` is six of the eleven letters of `niederlande`.
// Neither is an inflection of anything. An inflection changes the end of a
// word, so the rule now says so, and the forms it can no longer reach are the
// demonyms, which are listed in ALIASES where the evidence for them is the
// keyword they were read from rather than a coincidence of spelling.
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
    // The name has to be consumed except for an ending, and so does the
    // keyword: `australii` keeps eight of the nine letters of `australia` and
    // only five of the seven of `austria`, which is how the two locatives stop
    // being a coin toss.
    const need = Math.max(4, b.length - 2);
    if (i >= need && a.length - i <= 3 && Math.abs(a.length - b.length) <= 4) hits.push(r.iso);
  }
  return hits.length === 1 ? hits[0] : null;
}

// Whether two words are the same word in two shapes: the same stem with a
// different ending. Used where the question is not `could these be the same`
// but `are these obviously the same`, so the bar is higher than stemMatch's:
// seventy per cent of the shorter form has to survive. `nowego` is `nowy` and
// `szwajcarii` is `szwajcaria`; `colorado` is not `colombia` and
// `niedersachsen` is not `niederlande`.
//
// It is here rather than in the model or the audit because both of them ask it
// and the answer is a property of the language.
export function sameWord(a, b) {
  const x = fold(a); const y = fold(b);
  if (!x || !y) return false;
  if (x === y) return true;
  // An inflection changes an ending, so it does not change the length much
  // either. Without this the three letters of `irl`, the French rent index,
  // count as an inflection of `Irlande`.
  if (Math.abs(x.length - y.length) > 3) return false;
  const need = Math.max(3, Math.ceil(Math.min(x.length, y.length) * 0.7));
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  return i >= need;
}

// Whether a phrase names a place: the name outright at a word boundary, or
// every word of the name present in a shape close enough to be an inflection.
// A script without spaces is tested as a substring, which is all there is to
// test.
export function phraseNames(phrase, name) {
  if (!name) return false;
  const p = fold(phrase); const n = fold(name);
  if ((' ' + p + ' ').includes(' ' + n + ' ')) return true;
  if (!/\s/.test(p) || !/[a-z]/.test(n)) return p.includes(n);
  const words = p.split(/\s+/).filter(Boolean);
  return n.split(/\s+/).filter(Boolean).every((w) => words.some((x) => sameWord(x, w)));
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
