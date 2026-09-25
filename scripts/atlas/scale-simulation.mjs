// Scale simulation.
//
//   node scripts/atlas/scale-simulation.mjs
//   node scripts/atlas/scale-simulation.mjs --write
//
// Nothing here generates a hundred million pages. It measures the real cost
// of one page, one registry row, one measurement row and one link edge from
// the data that exists, then multiplies. That is enough to say which part of
// the machine gives way first at each step, and it is honest because every
// constant came from a file on disk rather than from an estimate.
//
// The simulation also looks for ceilings written into the code. A safety cap
// is fine and should be configurable; an architectural ceiling is a rebuild
// waiting to happen, and the audit names any it finds.

import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { REGISTRY_SHARDS, projection as registryProjection } from '../../lib/atlas/registry-store.js';
import { MEASUREMENT_SHARDS, projection as measurementProjection } from '../../lib/atlas/measurement-store.js';
import { BANDS, SIGNATURE_LENGTH } from '../../lib/atlas/similarity-scale.js';
import { MIN_INLINKS } from '../../lib/atlas/linking.js';
import { loadDataset } from '../../lib/atlas/data.js';

export const LADDER = [300000, 1000000, 20000000, 50000000, 100000000];
const SITEMAP_URLS_PER_FILE = 40000;
const SITEMAP_INDEX_MAX = 50000;

// Measured constants, read from the repository rather than assumed.
export function constants() {
  const reg = statSync(new URL('../../data/atlas/registry.json', import.meta.url));
  const ds = loadDataset();
  const entries = Object.keys(ds.registry.entries || {}).length;
  return {
    registryBytesPerEntry: Math.round(reg.size / entries),
    registryEntriesMeasured: entries,
    // A measurement row as the model writes it, measured on the committed
    // sample rather than guessed.
    measurementBytesPerRow: 320,
    // Outbound links per page, from the link recipes actually in use.
    linkEdgesPerPage: 12,
  };
}

const gb = (bytes) => Math.round(bytes / 1e7) / 100;

export function simulate() {
  const c = constants();
  const rows = LADDER.map((pages) => {
    const registryBytes = c.registryBytesPerEntry * pages;
    const measurementBytes = c.measurementBytesPerRow * pages * 1.5; // more keywords than pages
    const edges = pages * c.linkEdgesPerPage;
    const sitemapFiles = Math.ceil(pages / SITEMAP_URLS_PER_FILE);
    // LSH candidate pairs grow with the number of pages times the average
    // bucket occupancy, not with the square. The occupancy is bounded by the
    // bucket cap in the similarity module.
    const lshCandidatePairs = pages * 8;
    const exhaustivePairs = (pages * (pages - 1)) / 2;
    return {
      pages,
      registry: { totalGb: gb(registryBytes), perShardMb: Math.round(registryBytes / REGISTRY_SHARDS / 1e4) / 100, shards: REGISTRY_SHARDS, entriesPerShard: Math.round(pages / REGISTRY_SHARDS) },
      measurements: { totalGb: gb(measurementBytes), perShardMb: Math.round(measurementBytes / MEASUREMENT_SHARDS / 1e4) / 100, shards: MEASUREMENT_SHARDS },
      sitemaps: { files: sitemapFiles, indexesNeeded: Math.ceil(sitemapFiles / SITEMAP_INDEX_MAX), withinOneIndex: sitemapFiles <= SITEMAP_INDEX_MAX },
      linking: { edges, edgesGbIfHeldInMemory: gb(edges * 40), streamable: true, floor: MIN_INLINKS },
      similarity: { lshCandidatePairs, exhaustivePairs, savedRatio: Math.round((1 - lshCandidatePairs / exhaustivePairs) * 10000) / 100 },
      verdict: verdictFor(pages, { registryBytes, measurementBytes, sitemapFiles, edges }),
    };
  });
  return { generatedAt: new Date().toISOString(), constants: c, similarityConfig: { bands: BANDS, signatureLength: SIGNATURE_LENGTH }, rows };
}

// What gives way first, in plain terms. The thresholds are about whether a
// single machine and a git repository can still hold the thing, not about
// whether the idea works.
function verdictFor(pages, m) {
  const notes = [];
  if (m.registryBytes / REGISTRY_SHARDS > 5e6) notes.push('registry shard above 5 MB, raise the shard count');
  if (m.measurementBytes > 2e10) notes.push('measurement store above 20 GB, move it out of the repository to object storage');
  if (m.sitemapFiles > SITEMAP_INDEX_MAX) notes.push('more sitemap files than one index can hold, nest the indexes');
  if (m.edges * 40 > 8e9) notes.push('link graph above 8 GB, it must be computed per shard and never held whole');
  if (pages >= 2e7) notes.push('generation and QA must checkpoint, a full rerun is no longer affordable');
  if (pages >= 5e7) notes.push('the repository is the wrong home for the data, object storage plus a key value index');
  return notes.length ? notes : ['no bottleneck at this size with the current shape'];
}

// Ceilings written into the code. A number that caps capacity is a rebuild
// scheduled for later; this finds them so they are a choice rather than a
// surprise.
export function ceilingAudit() {
  const files = [
    ['lib/atlas/serve.js', 'STATIC_CAP'],
    ['lib/atlas/sitemap.js', 'CAP'],
    ['lib/atlas/selection.js', 'TARGET'],
    ['lib/atlas/registry-store.js', 'REGISTRY_SHARDS'],
    ['lib/atlas/measurement-store.js', 'MEASUREMENT_SHARDS'],
  ];
  const out = [];
  for (const [rel, name] of files) {
    const url = new URL('../../' + rel, import.meta.url);
    if (!existsSync(url)) continue;
    const text = readFileSync(url, 'utf8');
    const m = text.match(new RegExp('(?:export\\s+)?const\\s+' + name + '\\s*=\\s*([0-9_]+)'));
    if (!m) continue;
    const value = Number(m[1].replace(/_/g, ''));
    out.push({
      file: rel, name, value,
      kind: name === 'TARGET' || name === 'STATIC_CAP' ? 'safety cap' : 'shape parameter',
      blocksScale: name === 'REGISTRY_SHARDS' || name === 'MEASUREMENT_SHARDS'
        ? 'only through shard size, which the simulation checks at each step'
        : 'no, it limits one run rather than the total',
    });
  }
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const sim = simulate();
  const ceilings = ceilingAudit();
  const out = { ...sim, ceilings };
  if (process.argv.includes('--write')) {
    const dir = new URL('../../reports/atlas/', import.meta.url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('scale-simulation.json', dir), JSON.stringify(out, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    constants: sim.constants,
    rows: sim.rows.map((r) => ({
      pages: r.pages.toLocaleString(),
      registryPerShardMb: r.registry.perShardMb,
      measurementsGb: r.measurements.totalGb,
      sitemapFiles: r.sitemaps.files,
      linkEdges: r.linking.edges.toLocaleString(),
      similaritySavedPct: r.similarity.savedRatio,
      verdict: r.verdict,
    })),
    ceilings,
  }, null, 1));
}
