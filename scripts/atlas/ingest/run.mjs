// Full refresh of the entity data. Climate is fetched per lot, not here.
//   node scripts/ingest/run.mjs
import { run as geonames } from './geonames.mjs';
import { run as airports } from './ourairports.mjs';
import { countries, labels } from './wikidata.mjs';

const steps = [
  ['geonames', geonames],
  ['ourairports', airports],
  ['wikidata countries', countries],
  ['wikidata labels', () => labels()],
];
for (const [name, fn] of steps) {
  const t = Date.now();
  const n = await fn();
  console.log(name + ': ' + n + ' rows in ' + Math.round((Date.now() - t) / 1000) + ' s');
}
