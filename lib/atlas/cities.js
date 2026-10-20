// The city entities, indexed by id.
//
// The entity store is sharded across sixty four files because it holds thirty
// one thousand cities and nothing wants all of them at once. Every city family
// does want to look one up by id, though, so the index is built once and kept.
//
// This is deliberately not a copy of the neighbourhood source. A city exists
// whether or not any district was ever linked to it, and a URL builder asking
// for a city's name must not depend on which other source happens to cover it.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { cityForm } from './content/city-forms.js';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url, '../..');
let index = null;

export function cities() {
  if (index) return index;
  index = new Map();
  const dir = new URL('data/atlas/entities/cities/', ROOT);
  if (!existsSync(dir)) return index;
  for (const f of readdirSync(dir)) {
    const rows = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    for (const c of (Array.isArray(rows) ? rows : rows.rows || [])) index.set(String(c.id), c);
  }
  return index;
}

export const cityById = (id) => cities().get(String(id)) || null;
export function resetCache() { index = null; }

// What to call the city on a page in this language.
//
// Three places are tried, in order of how much evidence each carries.
//
// First the market's own form in lib/atlas/content/city-forms.js, which holds
// the name that appeared in the keyword measured in that market: Torino in
// Italian, Londyn in Polish, Nueva York in Spanish. That is measured evidence
// about what the market writes rather than a transliteration.
//
// Then a label from the entity store, which comes from Wikidata and exists for
// a few languages only.
//
// Then the endonym, which is what most cities are called in most languages
// anyway. It is still a fallback and not an exonym rule: this programme has no
// source that would let it turn Koeln into Colonia on its own, and it does not
// try.
export function cityName(id, language) {
  const c = cityById(id);
  if (!c) return null;
  return cityForm(id, language) || (c.names && c.names[language]) || c.name || null;
}

// A name a market actually uses for the city, or null when no source attests
// one. The two measured or curated places above come first; then GeoNames'
// alternate names (alternateNamesV2, CC BY 4.0), which is where Muenchen,
// Munique, Monachium and the katakana forms live. A colloquial, historic or
// short form is not a page heading, so those are skipped.
//
// It exists because `cityName` ends on the provider's primary name, and for a
// large city that primary name is the English exonym: a German weather page
// read "Wetter in Munich" and a Japanese one "Houstonの天気". It is opt in, used
// by the city weather family only, so no page that is already live changes the
// name it was built and audited with.
let altIndex = null;
function altNames() {
  if (altIndex) return altIndex;
  altIndex = new Map();
  const f = new URL('data/atlas/sources/geonames/altnames-by-language.jsonl.gz', ROOT);
  if (!existsSync(f)) return altIndex;
  for (const line of gunzipSync(readFileSync(f)).toString('utf8').split('\n')) {
    if (!line) continue;
    const r = JSON.parse(line);
    altIndex.set(String(r.geonameid), r.names || {});
  }
  return altIndex;
}

// The script a heading in this language has to be written in. A Japanese page
// naming a city in Latin letters is not localised, it is untranslated.
const SCRIPT = { ja: /[\u3040-\u30ff\u3400-\u9fff]/ };

export function attestedCityName(id, language) {
  const c = cityById(id);
  if (!c) return null;
  const ok = (n) => n && (!SCRIPT[language] || SCRIPT[language].test(n));
  const curated = cityForm(id, language) || (c.names && c.names[language]);
  if (ok(curated)) return curated;
  const a = altNames().get(String(id))?.[language];
  if (a && !a.colloquial && !a.historic && !a.short && ok(a.name)) return a.name;
  return null;
}

// The heading name for a city weather page: an attested name, else the
// provider's name in a Latin script language, else nothing. Nothing is a
// refusal, not a fallback, because the alternative is the untranslated page.
export function localCityName(id, language) {
  const attested = attestedCityName(id, language);
  if (attested) return attested;
  if (SCRIPT[language]) return null;
  const c = cityById(id);
  return (c && c.name) || null;
}
