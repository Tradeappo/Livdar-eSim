// Dash check.
//
// Hard rule for this project: no en dash, no em dash, anywhere. Not in source,
// not in content, not in metadata, not in slugs. Only the plain hyphen.
//
// The forbidden characters are built from code points on purpose, so that this
// file can describe them without containing them and flagging itself.

import { readdir, readFile, stat, open as openFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { StringDecoder } from 'node:string_decoder';
import { join, extname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const FORBIDDEN = [
  [0x2010, 'hyphen (U+2010)'],
  [0x2011, 'non breaking hyphen (U+2011)'],
  [0x2012, 'figure dash (U+2012)'],
  [0x2013, 'EN DASH (U+2013)'],
  [0x2014, 'EM DASH (U+2014)'],
  [0x2015, 'horizontal bar (U+2015)'],
  [0x2212, 'minus sign (U+2212)'],
  [0xfe58, 'small em dash (U+FE58)'],
  [0xfe63, 'small hyphen minus (U+FE63)'],
  [0xff0d, 'fullwidth hyphen minus (U+FF0D)'],
];

const FORBIDDEN_MAP = new Map(FORBIDDEN.map(([cp, name]) => [String.fromCodePoint(cp), name]));

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'out', 'dist', '.vercel', 'coverage']);

// Raw captures of what a provider returned. The rule this file enforces is
// about text Livdar publishes, and a capture is a record of somebody else's
// data: sixty three Wikidata venue names contain an en dash, and rewriting
// them here would make the capture a false record of the fetch. The dash is
// normalised at ingest instead, and every normalised name carries a
// `dashNormalised` flag, so nothing with a long dash in it reaches a page.
// Only the capture directories are exempt; the normalised stores that pages
// actually read are checked like everything else.
const RAW_CAPTURE = [
  'data/atlas/sources/venues/wikidata-venues-2026-09-24.json',
];
// The rule names manifests and generated content explicitly, and a manifest here is a
// .csv or a .jsonl.gz as often as it is a .json. Leaving those extensions out meant the
// check reported a clean repository while never opening a single manifest row, which is
// the one place rendered copy actually lands.
const TEXT_EXT = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.css', '.scss',
  '.json', '.md', '.mdx', '.html', '.txt', '.svg', '.xml', '.yml', '.yaml',
  '.csv', '.tsv', '.jsonl', '.ndjson', '.sh', '.py', '.sql', '.toml',
]);

// Compressed generated output. A partition is a .jsonl.gz and its rows carry the rendered
// title, meta and H1, so it has to be read, not trusted. Raw provider captures under
// data/atlas/sources are exempt for the reason given above: an OSM or Wikidata venue name
// containing an en dash is a fact about their data, and rewriting it would make the capture
// a false record of the fetch. The dash is normalised at ingest, and the normalised stores
// the pages read are checked like everything else.
const GZ_CHECKED_PREFIXES = ['data/atlas/candidates', 'reports', 'data/atlas/manifests'];
const RAW_CAPTURE_PREFIXES = ['data/atlas/sources/'];

async function walk(dir, out = [], badNames = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') {
      if (SKIP_DIRS.has(entry.name)) continue;
    }
    const full = join(dir, entry.name);
    const rel = relative(ROOT, full);

    // The rule covers filenames where they are relevant, and here they always are: a
    // partition path becomes a URL segment and a report path becomes a link. A name is
    // checked whether or not its contents ever get read.
    for (const ch of FORBIDDEN_MAP.keys()) {
      if (entry.name.includes(ch)) {
        badNames.push({ path: rel, name: FORBIDDEN_MAP.get(ch) });
        break;
      }
    }

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out, badNames);
    } else if (entry.isFile()) {
      if (RAW_CAPTURE.some((r) => rel === r)) continue;
      if (RAW_CAPTURE_PREFIXES.some((r) => rel.startsWith(r))) continue;
      const ext = extname(entry.name);
      if (ext === '.gz') {
        // Only generated output is decompressed. Raw captures are already excluded above.
        const inner = extname(basename(entry.name, '.gz'));
        if (TEXT_EXT.has(inner) && GZ_CHECKED_PREFIXES.some((d) => rel.startsWith(d))) {
          out.push({ path: full, gz: true });
        }
        continue;
      }
      if (!TEXT_EXT.has(ext)) continue;
      out.push({ path: full, gz: false });
    }
  }
  return { out, badNames };
}

// Scan a file as a stream so size is not a reason to skip it. The previous version skipped
// anything over 4MB, which silently exempted the largest generated inventory in the repo:
// a file big enough to matter was a file big enough to go unread. Decoding incrementally
// keeps a forbidden character from being missed when it straddles a chunk boundary, since
// the decoder holds the partial UTF-8 sequence back until it is complete.
async function scanStream(file, gz, onHit) {
  const counts = new Map();
  let line = 1;
  let col = 0;
  let pending = '';
  const decoder = new StringDecoder('utf8');
  const source = gz ? createReadStream(file).pipe(createGunzip()) : createReadStream(file);
  await new Promise((resolve, reject) => {
    source.on('data', (chunk) => {
      const text = gz || Buffer.isBuffer(chunk) ? decoder.write(chunk) : String(chunk);
      for (const ch of text) {
        if (ch === '\n') { line += 1; col = 0; pending = ''; continue; }
        col += 1;
        pending = (pending + ch).slice(-80);
        const name = FORBIDDEN_MAP.get(ch);
        if (name) {
          counts.set(name, (counts.get(name) || 0) + 1);
          onHit({ file: relative(ROOT, file), line, column: col, name, context: pending.trim() });
        }
      }
    });
    source.on('end', resolve);
    source.on('error', reject);
  });
  return counts;
}

export async function runDashCheck({ quiet = false, maxReport = 60 } = {}) {
  const { out: files, badNames } = await walk(ROOT);
  const hits = [];
  const counts = new Map();
  let scanned = 0;

  for (const { path: file, gz } of files) {
    try {
      if (!gz) {
        const info = await stat(file);
        if (info.size === 0) { scanned += 1; continue; }
      }
      const fileCounts = await scanStream(file, gz, (h) => {
        if (hits.length < 5000) hits.push(h);
      });
      for (const [name, n] of fileCounts) counts.set(name, (counts.get(name) || 0) + n);
      scanned += 1;
    } catch {
      continue;
    }
  }

  const em = counts.get('EM DASH (U+2014)') || 0;
  const en = counts.get('EN DASH (U+2013)') || 0;
  const variants = [...counts.entries()]
    .filter(([name]) => !name.startsWith('EM DASH') && !name.startsWith('EN DASH'))
    .reduce((t, [, n]) => t + n, 0);

  if (!quiet) {
    console.log('Dash check: ' + scanned + ' files scanned (text, csv, jsonl and generated .gz; filenames too).');
    console.log('  em dash count: ' + em);
    console.log('  en dash count: ' + en);
    console.log('  other forbidden dash variants: ' + variants);
    console.log('  filenames with a forbidden character: ' + badNames.length);
    if (badNames.length) {
      badNames.slice(0, maxReport).forEach((b) => console.error('  FILENAME ' + b.path + '  ' + b.name));
    }
    if (hits.length) {
      console.error('DASH CHECK FAILED: ' + hits.length + ' forbidden character(s) in file contents');
      hits.slice(0, maxReport).forEach((h) => {
        console.error('  ' + h.file + ':' + h.line + ':' + h.column + '  ' + h.name);
        console.error('      ' + h.context);
      });
      if (hits.length > maxReport) console.error('  ... and ' + (hits.length - maxReport) + ' more');
    }
  }

  return { files: scanned, hits, badNames, em, en, variants };
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('dash-check.mjs');
if (invokedDirectly) {
  const { hits, badNames } = await runDashCheck();
  process.exit(hits.length || badNames.length ? 1 : 0);
}
