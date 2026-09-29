// Renders the family catalog into the three readable deliverables the brief asks
// for. Generated rather than hand-written so a gate change in the catalog cannot
// leave a report claiming the old gate.

import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { FAMILIES } from './family-catalog.mjs';

const OUT = new URL('../../../reports/scale-universe-2026-09-29/', import.meta.url);
const rows = gunzipSync(readFileSync(new URL('MASTER-CANDIDATE-INVENTORY-1M.jsonl.gz', OUT)))
  .toString('utf8').trim().split('\n').map((l) => JSON.parse(l));
const counts = new Map();
for (const r of rows) {
  if (!counts.has(r.family)) counts.set(r.family, { valid: 0, blocked: 0, rejected: 0, merged: 0 });
  const e = counts.get(r.family);
  if (r.candidate_status === 'VALID') e.valid += 1;
  else if (r.candidate_status === 'SOURCE_ACQUISITION_CANDIDATE') e.blocked += 1;
  else if (r.candidate_status === 'REJECTED_FAMILY') e.rejected += 1;
  else e.merged += 1;
}
const c = (id) => counts.get(id) || { valid: 0, blocked: 0, rejected: 0, merged: 0 };
const PROOF_LABEL = {
  intent: 'Distinct search intent', data: 'Distinct data', value: 'Distinct user value',
  serp: 'Distinct SERP justification', canonical: 'Distinct canonical purpose',
  noCannib: 'No cannibalisation', demand: 'Demand', measurementNote: 'Measurement note',
};

function block(f) {
  const n = c(f.id);
  const out = [`### \`${f.id}\``, ''];
  out.push(`- Surface: ${f.surface} | Page type: \`${f.pageType}\` | Entity: ${f.entity}`);
  out.push(`- Gate: **${f.gate}** | Source: \`${f.source}\` | Availability: ${f.availability} | Licence: ${f.licence}`);
  out.push(`- Language rule: ${f.langRule} | Time rule: ${f.timeRule}${f.tiers ? ` | City tiers: ${f.tiers.join(', ')}` : ''}${f.airportTypes ? ` | Airport types: ${f.airportTypes.join(', ')}` : ''}`);
  out.push(`- Monetization: ${f.monetization} | Internal linking: ${f.internalLink}${f.pilotCap ? ` | Pilot cap: ${f.pilotCap} pages` : ''}`);
  out.push(`- Unique data fields (${f.uniqueFields.length}, minimum ${f.minUniqueFields}): ${f.uniqueFields.join('; ') || 'none'}`);
  out.push(`- Enumerated: ${n.valid} valid, ${n.blocked} blocked, ${n.rejected} rejected, ${n.merged} merged as duplicates`);
  if (f.blockedOn) out.push(`- Blocked on: ${f.blockedOn}`);
  if (f.note) out.push(`- Note: ${f.note}`);
  out.push('', '**The six proofs**', '');
  for (const [k, label] of Object.entries(PROOF_LABEL)) {
    if (f.proofs[k]) out.push(`- *${label}*: ${f.proofs[k]}`);
  }
  out.push('', `**Gate reason**: ${f.gateReason}`, '');
  return out.join('\n');
}

const ORDER = ['SAFE_TO_SCALE', 'SCALE_WITH_GATES', 'EXPERIMENT_ONLY', 'HIGH_RISK', 'REJECT'];
const sorted = [...FAMILIES].sort((a, b) => ORDER.indexOf(a.gate) - ORDER.indexOf(b.gate) || a.id.localeCompare(b.id));

const head = [
  '# Family catalog', '',
  'Generated from `scripts/atlas/scale/family-catalog.mjs` by',
  '`scripts/atlas/scale/write-catalog-reports.mjs`. Every family carries the six proofs',
  'the brief requires, answered per family rather than asserted once, plus the',
  'measured demand where demand was measured.', '',
  '| Gate | Families | Valid | Blocked | Rejected |', '| --- | --- | --- | --- | --- |',
  ...ORDER.map((g) => {
    const fs = FAMILIES.filter((f) => f.gate === g);
    const sum = (k) => fs.reduce((t, f) => t + c(f.id)[k], 0);
    return `| ${g} | ${fs.length} | ${sum('valid')} | ${sum('blocked')} | ${sum('rejected')} |`;
  }), '',
].join('\n');

let body = '';
for (const g of ORDER) {
  const fs = sorted.filter((f) => f.gate === g);
  if (!fs.length) continue;
  body += `\n## ${g}\n\n` + fs.map(block).join('\n');
}
writeFileSync(new URL('FAMILY-CATALOG.md', OUT), head + body);

const rejected = sorted.filter((f) => f.gate === 'REJECT');
writeFileSync(new URL('REJECTED-FAMILIES.md', OUT), [
  '# Rejected families', '',
  'Nine families, ' + rejected.reduce((t, f) => t + c(f.id).rejected, 0).toLocaleString('en-GB') +
  ' enumerated rows, none of them counted toward the valid universe and none of them',
  'publication-ready under any condition. They are kept because a rejection with its',
  'reasoning attached is worth more than a deletion, and because two of them are the',
  'routes that would have hit the 1,000,000 target by padding.', '',
  '| Family | Rows refused | One line reason |', '| --- | --- | --- |',
  ...rejected.map((f) => `| \`${f.id}\` | ${c(f.id).rejected.toLocaleString('en-GB')} | ${f.gateReason.split('. ')[0]}. |`),
  '', rejected.map(block).join('\n'),
].join('\n'));

const blocked = sorted.filter((f) => f.availability === 'missing');
writeFileSync(new URL('BLOCKED-FAMILIES.md', OUT), [
  '# Blocked families', '',
  'Families whose gate would allow publication but whose data is not held and not',
  'freely acquirable. They are the subject of DATA-SOURCE-GAPS.md, which ranks them',
  'by leverage. Their candidates are counted in their own bucket, never as valid and',
  'never as publishable.', '',
  '| Family | Rows blocked | Gate | Blocked on |', '| --- | --- | --- | --- |',
  ...blocked.map((f) => `| \`${f.id}\` | ${c(f.id).blocked.toLocaleString('en-GB')} | ${f.gate} | ${f.blockedOn || 'no source held'} |`),
  '', blocked.map(block).join('\n'),
].join('\n'));

console.log('families', FAMILIES.length, 'rejected', rejected.length, 'blocked', blocked.length);
