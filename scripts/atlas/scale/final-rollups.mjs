// FAMILY-FINAL and MARKET-FINAL, generated from the master keyword file rather
// than written by hand, so no rollup can drift from the rows under it.
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('../../../reports/livdar-final-research-freeze-2026-09-30/', import.meta.url);
const parse = (name) => {
  const t = readFileSync(new URL(name, OUT), 'utf8').trim().split('\n');
  const cols = t[0].split(',');
  return t.slice(1).map((line) => {
    const cells = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { cells.push(cur); cur = ''; } else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]));
  });
};
const rows = parse('LIVDAR-MASTER-KEYWORDS-FINAL.csv');
const n = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const median = (a) => { if (!a.length) return ''; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const group = (key, extra) => {
  const m = new Map();
  for (const r of rows) {
    const k = r[key] || '(none)';
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return [...m.entries()].map(([k, rs]) => {
    const vols = rs.filter((r) => r.volume !== '').map((r) => n(r.volume));
    const st = (s) => rs.filter((r) => r.status === s).length;
    return {
      [key]: k, keywords: rs.length,
      live_primary: st('LIVE_PRIMARY'), live_secondary: st('LIVE_SECONDARY'), esim: st('ESIM'),
      entity_head: st('ENTITY_HEAD'), listing_head: st('LISTING_HEAD'), durable_head: st('DURABLE_HEAD'),
      candidate_head: st('CANDIDATE_HEAD'), promising: st('PROMISING'), experiment_only: st('EXPERIMENT_ONLY'),
      blocked_data: st('BLOCKED_DATA'), blocked_licence: st('BLOCKED_LICENCE'), reject: st('REJECT'),
      measured_with_ahrefs: rs.filter((r) => /Ahrefs measured/.test(r.evidence)).length,
      max_volume: vols.length ? Math.max(...vols) : '', median_volume: median(vols),
      total_volume: vols.reduce((a, b) => a + b, 0),
      serp_class: [...new Set(rs.map((r) => r.SERP_class))].filter((x) => x !== 'NOT_SAMPLED').join('|') || 'NOT_SAMPLED',
      indexable_yes: rs.filter((r) => r.indexable === 'YES').length,
      data_source_required: [...new Set(rs.map((r) => r.data_source_required).filter(Boolean))].join('|'),
      ...(extra ? extra(rs) : {}),
    };
  }).sort((a, b) => b.keywords - a.keywords);
};

const fam = group('family', (rs) => ({
  page_types: [...new Set(rs.map((r) => r.page_type).filter(Boolean))].join('|'),
  markets_present: new Set(rs.map((r) => r.market)).size,
}));
const mkt = group('market', (rs) => ({
  families_present: new Set(rs.map((r) => r.family).filter(Boolean)).size,
  languages: [...new Set(rs.map((r) => r.language).filter(Boolean))].join('|'),
}));

const write = (name, arr) => {
  const cols = [...new Set(arr.flatMap((r) => Object.keys(r)))];
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  writeFileSync(new URL(name, OUT), [cols.join(','), ...arr.map((r) => cols.map((c) => q(r[c])).join(','))].join('\n') + '\n');
};
write('FAMILY-FINAL.csv', fam);
write('MARKET-FINAL.csv', mkt);
console.log('FAMILY-FINAL.csv families:', fam.length);
console.log('MARKET-FINAL.csv markets:', mkt.length);
console.log('\ntop families by keyword count');
for (const f of fam.slice(0, 14)) console.log('  ' + String(f.family).padEnd(32) + String(f.keywords).padStart(5)
  + '  idx ' + String(f.indexable_yes).padStart(5) + '  maxvol ' + String(f.max_volume).padStart(7) + '  ' + f.serp_class);
console.log('\nmarkets');
for (const m of mkt) console.log('  ' + String(m.market).padEnd(14) + String(m.keywords).padStart(5)
  + '  fam ' + String(m.families_present).padStart(3) + '  measured ' + String(m.measured_with_ahrefs).padStart(4)
  + '  LP ' + String(m.live_primary).padStart(4));
