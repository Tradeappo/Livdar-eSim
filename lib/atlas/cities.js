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
// The endonym, unless the entity store carries a label in the page's language.
// The store's labels come from Wikidata and exist for a few languages only, so
// most pages print the name the place uses. That is a choice rather than a
// gap: this programme has no source for exonyms, and inventing `Colonia` for
// Koeln from a transliteration rule would be inventing text.
export function cityName(id, language) {
  const c = cityById(id);
  if (!c) return null;
  return (c.names && c.names[language]) || c.name || null;
}
