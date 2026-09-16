// Dash check.
//
// Hard rule for this project: no en dash, no em dash, anywhere. Not in source,
// not in content, not in metadata, not in slugs. Only the plain hyphen.
//
// The forbidden characters are built from code points on purpose, so that this
// file can describe them without containing them and flagging itself.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
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
const TEXT_EXT = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.css', '.scss',
  '.json', '.md', '.mdx', '.html', '.txt', '.svg', '.xml', '.yml', '.yaml',
]);

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') {
      if (SKIP_DIRS.has(entry.name)) continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out);
    } else if (entry.isFile()) {
      if (TEXT_EXT.has(extname(entry.name))) out.push(full);
    }
  }
  return out;
}

export async function runDashCheck({ quiet = false } = {}) {
  const files = await walk(ROOT);
  const hits = [];

  for (const file of files) {
    let text;
    try {
      const info = await stat(file);
      if (info.size > 4 * 1024 * 1024) continue;
      text = await readFile(file, 'utf8');
    } catch {
      continue;
    }

    let flagged = false;
    for (const ch of FORBIDDEN_MAP.keys()) {
      if (text.includes(ch)) { flagged = true; break; }
    }
    if (!flagged) continue;

    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (let col = 0; col < line.length; col += 1) {
        const ch = line[col];
        const name = FORBIDDEN_MAP.get(ch);
        if (!name) continue;
        hits.push({
          file: relative(ROOT, file),
          line: i + 1,
          column: col + 1,
          name,
          context: line.slice(Math.max(0, col - 40), col + 40).trim(),
        });
      }
    });
  }

  if (!quiet) {
    if (hits.length) {
      console.error('DASH CHECK FAILED: ' + hits.length + ' forbidden character(s)');
      hits.slice(0, 60).forEach((h) => {
        console.error('  ' + h.file + ':' + h.line + ':' + h.column + '  ' + h.name);
        console.error('      ' + h.context);
      });
      if (hits.length > 60) console.error('  ... and ' + (hits.length - 60) + ' more');
    } else {
      console.log('Dash check: ' + files.length + ' files scanned, 0 en dash, 0 em dash, 0 dash variants.');
    }
  }

  return { files: files.length, hits };
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('dash-check.mjs');
if (invokedDirectly) {
  const { hits } = await runDashCheck();
  process.exit(hits.length ? 1 : 0);
}
