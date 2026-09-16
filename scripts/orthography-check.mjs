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

  return { files: GERMAN_FILES.length, guardedWords: wrong.length, failures };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = runOrthographyCheck();
  console.log('Orthography check: ' + r.files + ' files, ' + r.guardedWords + ' guarded German spellings');
  if (r.failures.length) {
    console.log('');
    console.log('ORTHOGRAPHY CHECK FAILED: ' + r.failures.length + ' problem(s)');
    r.failures.forEach((f) => console.log('  ' + f));
    process.exit(1);
  }
  console.log('Passed. No transliterated German spellings in the content.');
}
