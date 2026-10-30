// Apply the on-demand ISR flag to the Atlas data routes.
//
// Next requires `export const dynamicParams` to be a statically analysable
// literal in each route file, so it cannot be driven by an imported value at
// runtime. This codemod sets that literal from ATLAS_ONDEMAND before the build:
//   ATLAS_ONDEMAND=1  -> dynamicParams = true   (seed prebuilt, tail on-demand)
//   unset / anything  -> dynamicParams = false  (today's behaviour, unchanged)
//
// It only touches the data routes that delegate to makeAtlasPageRoute, never
// the hubs, the Atlas directory or the eSIM catch-all, which stay fully
// prerendered. The seed size itself is handled in lib/atlas/ondemand.js, read
// by generateStaticParams at build time. Idempotent: safe to run every build,
// and running it with the flag off restores the committed literal.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const ON = process.env.ATLAS_ONDEMAND === '1';
const target = ON ? 'true' : 'false';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (name === 'page.jsx') out.push(full);
  }
  return out;
}

const pages = walk(join(ROOT, 'app'));
let changed = 0;
let atlas = 0;
for (const file of pages) {
  const src = readFileSync(file, 'utf8');
  if (!src.includes('makeAtlasPageRoute(')) continue; // data routes only
  atlas += 1;
  const next = src.replace(
    /export const dynamicParams = (?:true|false);/,
    'export const dynamicParams = ' + target + ';',
  );
  if (next !== src) { writeFileSync(file, next); changed += 1; }
}

console.log(
  'apply-ondemand: ATLAS_ONDEMAND=' + (ON ? '1' : '0') +
  ' -> dynamicParams=' + target + ' on ' + atlas + ' Atlas route(s), ' + changed + ' file(s) updated',
);
