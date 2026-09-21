// Romanian diacritic restoration.
//
// WHY THIS EXISTS. Every Romanian content file was written without diacritics:
// "inca" for "încă", "tara" for "țară", "cartela" where the word needs the
// breve. Unlike the German case there was no regression, it was uniform, so it
// looked deliberate. It was not what we want: this is the language the site
// asks a reader to trust before a purchase, and half-spelled Romanian reads as
// unfinished.
//
// WHY A TABLE AND NOT A RULE. Romanian diacritics cannot be derived from the
// stripped form. "data" is both "data" and "dată". "tine" is both "tine" and
// "ține". "sunt" is correct as it stands. A rule that rewrote every t before an
// i would produce wrong Romanian in hundreds of places, and wrong Romanian is
// worse than no diacritics because it looks like a machine did it.
//
// WHAT IS DELIBERATELY NOT HERE. About fifteen words are genuinely ambiguous
// and depend on the article, the preposition or the case: sa, ca, harta,
// factura, coasta, banca, alta, piata, regula, lista, pagina, vizita, analiza,
// noua, zona. Those are NOT in the tables. They are resolved one occurrence at
// a time in scripts/ro-ambiguous.mjs, because a table cannot see context and
// guessing at them is exactly how automated diacritic restoration ruins a text.
//
// Identifiers are protected the same way the German script protects section
// keys: only text inside single quoted strings is touched, so object keys and
// sectionOrder entries are never rewritten.

import { readFileSync, writeFileSync } from 'node:fs';

const MAP_FILES = ['./ro-diacritics.map.txt', './ro-diacritics.map2.txt'];

export function loadMap() {
  const map = new Map();
  MAP_FILES.forEach((rel) => {
    const text = readFileSync(new URL(rel, import.meta.url), 'utf8');
    text.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      trimmed.split(/\s+/).forEach((pair) => {
        const i = pair.indexOf(':');
        if (i <= 0) return;
        const from = pair.slice(0, i);
        const to = pair.slice(i + 1);
        // Identity pairs are allowed in the tables, because writing a word down
        // and deciding it does not change is a decision worth recording. They
        // just do not produce a replacement.
        if (from === to) return;
        if (map.has(from) && map.get(from) !== to) {
          throw new Error('Conflicting entries for "' + from + '": "' + map.get(from) + '" and "' + to + '"');
        }
        map.set(from, to);
      });
    });
  });
  return map;
}

// Words the tables must never contain, because they need context.
export const AMBIGUOUS = new Set([
  'sa', 'Sa', 'ca', 'Ca', 'va', 'Va', 'a', 'harta', 'Harta', 'factura', 'Factura',
  'coasta', 'Coasta', 'banca', 'Banca', 'alta', 'Alta', 'piata', 'Piata',
  'regula', 'Regula', 'lista', 'Lista', 'pagina', 'Pagina', 'vizita', 'Vizita',
  'analiza', 'Analiza', 'noua', 'Noua', 'zona', 'Zona',
  // 'tine' is the stressed pronoun in "de tine" and the verb "tine" is "ține".
  // Only the word in front separates them, so the table must not touch it.
  'tine', 'Tine',
  // "în afara zonei" is the preposition and takes no diacritic; "a rămas
  // afară" is the adverb and does. The old table forced the adverb everywhere
  // and turned every "în afara X" in the Romanian copy into a mistake.
  'afara', 'Afara',
  // "prin Balcani" and "în Balcani" are the indefinite form, "Balcanii sunt"
  // the definite one. Both are correct in their place.
  'Balcani',
]);

const FILES = [
  '../lib/content/ro/compatibility.js',
  '../lib/content/ro/destinations.js',
  '../lib/content/ro/guides.js',
  '../lib/content/ro/legal.js',
  '../lib/content/ro/regions.js',
];

// Two files carry Romanian alongside English and German, so they cannot be
// rewritten whole: the table maps "in" to "în" and "care" stays "care", and
// running that over the English block would produce nonsense in the market
// that matters most. Each entry names the file and the line that opens its
// Romanian block; only that block is rewritten, bounded by brace matching.
//
// This was found the hard way. The first pass covered lib/content/ro/ only, so
// the Romanian home page and the whole interface, including the four words in
// the main navigation, kept their stripped spellings while every article page
// around them gained diacritics. That is exactly the half-and-half result the
// brief said to avoid, and it was visible on the most-visited page of the
// market.
export const SCOPED_FILES = [
  { file: '../lib/content/home.js', opener: /^\s*ro:\s*\{/m },
  { file: '../lib/content/ui.js', opener: /^const RO = \{/m },
];

// From the opening brace of a block, return the index just past its matching
// close brace. String-aware, so a brace inside a sentence cannot end the block.
export function blockEnd(source, openIndex) {
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') { i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth += 1;
    else if (ch === '}') { depth -= 1; if (depth === 0) return i + 1; }
  }
  throw new Error('Unbalanced braces from index ' + openIndex);
}

// Rewrite only the inside of single quoted strings. Everything else in the file
// (keys, imports, sectionOrder identifiers) is left untouched.
// Rewrite the inside of single quoted strings, but never a string that is
// actually an identifier.
//
// THIS GUARD EXISTS BECAUSE IT ALREADY WENT WRONG. Region ids are written as
// quoted object keys, 'southeast-asia' and 'north-america', and a table entry
// mapping "asia" to "Asia" turned four of them into 'southeast-Asia' and
// 'north-America'. The content still looked perfect; the routes 404ed. The
// quality gate caught it, which is the only reason it is not in production.
//
// Two tests, both cheap. A literal immediately followed by a colon is an object
// key. A literal whose entire content is lowercase letters, digits and hyphens
// with no spaces is an identifier rather than a sentence, which covers
// sectionOrder entries and slugs.
const IDENTIFIER_LIKE = /^[a-z0-9][a-z0-9-]*$/;

function rewriteStrings(source, fn) {
  return source.replace(/'(?:[^'\\]|\\.)*'(\s*:)?/g, (match, colon) => {
    if (colon) return match; // object key
    const inner = match.slice(1, -1);
    if (IDENTIFIER_LIKE.test(inner)) return match; // slug or section id
    return "'" + fn(inner) + "'";
  });
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const map = loadMap();
  const conflicts = [...map.keys()].filter((w) => AMBIGUOUS.has(w));
  if (conflicts.length) {
    console.error('These words need context and must not be in the tables: ' + conflicts.join(', '));
    process.exit(1);
  }

  let total = 0;
  const report = [];

  FILES.forEach((rel) => {
    const url = new URL(rel, import.meta.url);
    const before = readFileSync(url, 'utf8');
    let changes = 0;
    const seen = new Set();

    const after = rewriteStrings(before, (text) =>
      text.replace(/\p{L}+/gu, (word) => {
        const to = map.get(word);
        if (!to) return word;
        changes += 1;
        seen.add(word);
        return to;
      })
    );

    if (after !== before) writeFileSync(url, after);
    total += changes;
    report.push({ file: rel.replace('../', ''), changes, words: seen.size });
  });

  // The Romanian block inside the shared files.
  SCOPED_FILES.forEach(({ file, opener }) => {
    const url = new URL(file, import.meta.url);
    const before = readFileSync(url, 'utf8');
    const m = before.match(opener);
    if (!m) throw new Error('No Romanian block found in ' + file + '. The file structure changed; fix the opener rather than skipping it.');
    const start = before.indexOf('{', m.index);
    const end = blockEnd(before, start);
    const block = before.slice(start, end);

    let changes = 0;
    const seen = new Set();
    const rewritten = rewriteStrings(block, (text) =>
      text.replace(/\p{L}+/gu, (word) => {
        const to = map.get(word);
        if (!to) return word;
        changes += 1;
        seen.add(word);
        return to;
      })
    );

    const after = before.slice(0, start) + rewritten + before.slice(end);
    if (after !== before) writeFileSync(url, after);
    total += changes;
    report.push({ file: file.replace('../', '') + ' (ro block)', changes, words: seen.size });
  });

  console.log('Romanian diacritic restoration');
  console.log('');
  report.forEach((r) => {
    console.log('  ' + r.file.padEnd(34) + String(r.changes).padStart(5) + ' replacements across ' + r.words + ' distinct words');
  });
  console.log('');
  console.log('  total: ' + total + ' replacements from a table of ' + map.size + ' reviewed words');
  console.log('');
  console.log('  ' + AMBIGUOUS.size + ' context dependent forms were deliberately left for ro-ambiguous.mjs.');
}
