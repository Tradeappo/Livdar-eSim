// Shared helpers for the ingest scripts. No dependencies: Node 20 fetch, zlib
// and crypto only, so the pipeline runs in GitHub Actions without npm install.

import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export const DATA = new URL('../../../data/atlas/', import.meta.url);

export async function fetchWithRetry(url, opts = {}, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { 'user-agent': 'livdar-atlas-ingest/1 (contact: livdarlive@gmail.com)', ...(opts.headers || {}) } });
      if (r.status === 429 || r.status >= 500) throw new Error('HTTP ' + r.status);
      if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status + ' for ' + url), { fatal: true });
      return r;
    } catch (e) {
      last = e;
      if (e.fatal) throw e;
      await new Promise((res) => setTimeout(res, 2000 * 2 ** i));
    }
  }
  throw last;
}

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

// Minimal reader for a ZIP archive: returns the named entry, inflated.
export function unzipEntry(buf, name) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error('not a zip');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const fname = buf.slice(p + 46, p + 46 + nlen).toString('utf8');
    if (fname === name) {
      const lnlen = buf.readUInt16LE(local + 26);
      const lxlen = buf.readUInt16LE(local + 28);
      const start = local + 30 + lnlen + lxlen;
      const data = buf.slice(start, start + csize);
      return method === 0 ? data : inflateRawSync(data);
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error('entry not found: ' + name);
}

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (ch === '"') q = false; else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; } else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; } else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

export function writeJson(rel, value) {
  const url = new URL(rel, DATA);
  mkdirSync(dirname(url.pathname), { recursive: true });
  const text = JSON.stringify(value, null, 1) + '\n';
  writeFileSync(url, text);
  return sha256(text);
}

export function readJson(rel, fallback) {
  const url = new URL(rel, DATA);
  return existsSync(url) ? JSON.parse(readFileSync(url, 'utf8')) : fallback;
}

export function recordSource(id, info) {
  const manifest = readJson('manifest.json', { sources: {} });
  manifest.sources[id] = { ...info, retrievedAt: new Date().toISOString() };
  writeJson('manifest.json', manifest);
}

export async function sparql(query) {
  const r = await fetchWithRetry('https://query.wikidata.org/sparql', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/sparql-results+json' },
    body: 'query=' + encodeURIComponent(query),
  });
  const j = await r.json();
  return j.results.bindings.map((b) => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value])));
}
