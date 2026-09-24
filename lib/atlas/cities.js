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
