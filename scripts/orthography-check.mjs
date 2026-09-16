// Orthography check, per language.
//
// This exists because the German content lost its umlauts once already. The
// destination and guide files were written correctly, and then the region,
// legal, compatibility and interface files that came later were written with
// "fuer" for "für" and "ausserhalb" for "außerhalb", about seven hundred
// occurrences in all. Nothing caught it. The quality gate checked dashes,
// duplication, word counts, hreflang and every structural rule we could think
// of, and none of them look at whether the German is spelled in German.
//
// A reader in the second largest market does not see a missing diacritic, they
// see a site that looks broken at the moment they are deciding whether to trust
// it with a purchase. So the check runs on every build, and the transliterated
// spellings are a build failure rather than a warning.
//
// The table it checks against is the same one the repair script used, imported
// rather than copied, so a word can never be fixed in one place and left
// unguarded in the other.

import { readFileSync } from 'node:fs';
import { MAP, NEVER_TOUCH } from './fix-german-umlauts.mjs';
import { loadMap as loadRomanianMap, AMBIGUOUS, SCOPED_FILES, blockEnd } from './fix-romanian-diacritics.mjs';

// German content, plus the two shared files that carry German alongside the
// other languages.
const GERMAN_FILES = [
  'lib/content/de/regions.js',
  'lib/content/de/legal.js',
  'lib/content/de/compatibility.js',
  'lib/content/de/destinations.js',
  'lib/content/de/guides.js',
  'lib/content/ui.js',
  'lib/content/home.js',
];

const ROMANIAN_FILES = [
  'lib/content/ro/compatibility.js',
  'lib/content/ro/destinations.js',
  'lib/content/ro/guides.js',
  'lib/content/ro/legal.js',
  'lib/content/ro/regions.js',
];

// Only the inside of quoted prose is checked, and identifiers are skipped, for
// the same reason the repair script skips them: 'southeast-asia' is a region id,
// not a misspelling, and "asia" inside it must never be touched.
const IDENTIFIER_LIKE = /^[a-z0-9][a-z0-9-]*$/;

function romanianProse(text) {
  const out = [];
  (text.match(/'(?:[^'\\]|\\.)*'(\s*:)?/g) || []).forEach((m) => {
    if (/\s*:$/.test(m.slice(-2))) return; // object key
    const inner = m.slice(1, -1);
    if (IDENTIFIER_LIKE.test(inner)) return;
    out.push(inner);
  });
  return out.join(' ');
}

export function runOrthographyCheck() {
  const failures = [];
  const wrong = Object.keys(MAP).filter((w) => !NEVER_TOUCH.has(w));

  GERMAN_FILES.forEach((rel) => {
    const text = readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
    wrong.forEach((bad) => {
      const re = new RegExp('\\b' + bad + '\\b', 'g');
      const hits = text.match(re);
      if (hits) {
        failures.push(
          rel + ': "' + bad + '" appears ' + hits.length + ' time(s). German spells it "' + MAP[bad] +
            '". Run node scripts/fix-german-umlauts.mjs.'
        );
      }
    });
  });

  // Romanian. Same idea, same table, from the repair script rather than a copy.
  const roMap = loadRomanianMap();
  const roWrong = [...roMap.keys()].filter((w) => !AMBIGUOUS.has(w));
  // The five Romanian-only files, plus the Romanian block of each shared file.
  // The shared blocks are here because leaving them out is what let the home
  // page and the whole navigation keep their stripped spellings while every
  // article page around them was corrected.
  const romanianSources = ROMANIAN_FILES.map((rel) => ({
    rel,
    source: readFileSync(new URL('../' + rel, import.meta.url), 'utf8'),
  }));
  SCOPED_FILES.forEach(({ file, opener }) => {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    const m = source.match(opener);
    if (!m) {
      failures.push(file.replace('../', '') + ': no Romanian block found. Fix the opener rather than skipping the check.');
      return;
    }
    const start = source.indexOf('{', m.index);
    romanianSources.push({
      rel: file.replace('../', '') + ' (ro block)',
      source: source.slice(start, blockEnd(source, start)),
    });
  });

  romanianSources.forEach(({ rel, source }) => {
    const prose = romanianProse(source);
    const words = new Set(prose.match(/[\p{L}]+/gu) || []);
    roWrong.forEach((bad) => {
      if (words.has(bad)) {
        failures.push(
          rel + ': "' + bad + '" appears in prose. Romanian spells it "' + roMap.get(bad) +
            '". Run node scripts/fix-romanian-diacritics.mjs.'
        );
      }
    });
  });

  return {
    files: GERMAN_FILES.length + ROMANIAN_FILES.length + SCOPED_FILES.length,
    guardedWords: wrong.length + roWrong.length,
    failures,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = runOrthographyCheck();
  console.log('Orthography check: ' + r.files + ' files, ' + r.guardedWords + ' guarded German and Romanian spellings');
  if (r.failures.length) {
    console.log('');
    console.log('ORTHOGRAPHY CHECK FAILED: ' + r.failures.length + ' problem(s)');
    r.failures.forEach((f) => console.log('  ' + f));
    process.exit(1);
  }
  console.log('Passed. No transliterated German and no undiacriticised Romanian in the content.');
}
