// Writing a measurement file without destroying one.
//
// This exists because it already happened. A new writer emitted
// `ahrefs-salary-en-US-2026-09-24.json` and `ahrefs-tools-<market>-...`,
// both of which were names an earlier run had already used, and five files of
// real provider output were overwritten in place. Nothing failed at the time:
// the files were still valid, still parsed, still had volumes in them, and the
// eligibility resolver went on producing pages. The loss only showed up in a
// diff.
//
// Measurement is the one thing in this programme that cannot be recomputed. A
// page can be rebuilt, a cohort reselected, a slug reassigned, but a volume is
// what a provider said on a day and units were spent to hear it. So a writer
// creates a file or it refuses, and overwriting is something a caller has to
// ask for by name.

import { writeFileSync, existsSync } from 'node:fs';

export function writeMeasurement(url, body, { overwrite = false } = {}) {
  if (existsSync(url) && !overwrite) {
    throw new Error(
      'refusing to overwrite the measurement file ' + url.pathname.split('/').pop()
      + '. Measurement cannot be recomputed: pick a name this run does not share with an earlier one, or pass overwrite when the file really is this run’s own output.',
    );
  }
  writeFileSync(url, JSON.stringify(body, null, 1) + '\n');
  return url;
}
