// Publication registry: the only place where a page becomes approved,
// published or retired. Nothing is published by generation alone.
//
//   node scripts/registry.mjs status
//   node scripts/registry.mjs approve-lot lot-001     approve every candidate of the lot that passes QA
//   node scripts/registry.mjs publish-lot lot-001     publish the approved pages of the lot
//   node scripts/registry.mjs retire <pageKey>        rollback: the page leaves routing and sitemaps
//
// Approval re-runs the whole funnel for each page; a page that fails any gate
// is reported with its reasons and stays out.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { evaluate } from '../../lib/atlas/eligibility.js';
import { pageKey } from '../../lib/atlas/taxonomy.js';

const file = new URL('../../data/atlas/registry.json', import.meta.url);
const today = () => new Date().toISOString().slice(0, 10);

export function lotCandidates(lot) {
  const out = [];
  (lot.locales || ['en', 'de', 'ro']).forEach((locale) => {
    (lot.families || []).forEach((family) => {
      if (family === 'airport') (lot.airports || []).forEach((iata) => out.push({ family, locale, entity: iata }));
      else (lot.cities || []).forEach((id) => {
        if (family === 'city-month') for (let m = 0; m < 12; m++) out.push({ family, locale, entity: String(id), month: m });
        else out.push({ family, locale, entity: String(id) });
      });
    });
  });
  return out;
}

function save(reg) {
  reg.entries = Object.fromEntries(Object.entries(reg.entries).sort());
  writeFileSync(file, JSON.stringify(reg, null, 1) + '\n');
}

function setState(reg, key, state, extra = {}) {
  const e = reg.entries[key] || { history: [] };
  e.history = (e.history || []).concat([{ state, on: today() }]);
  reg.entries[key] = { ...e, ...extra, state };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const [cmd, arg] = process.argv.slice(2);
  const ds = loadDataset();
  const reg = ds.registry;
  if (!reg.entries) reg.entries = {};
  if (cmd === 'status' || !cmd) {
    const t = {};
    Object.values(reg.entries).forEach((e) => { t[e.state] = (t[e.state] || 0) + 1; });
    console.log(t);
  } else if (cmd === 'approve-lot' || cmd === 'publish-lot') {
    const lotFile = new URL('../../data/atlas/lots/' + arg + '.json', import.meta.url);
    if (!existsSync(lotFile)) throw new Error('no lot ' + arg);
    const lot = JSON.parse(readFileSync(lotFile, 'utf8'));
    const pages = lotCandidates(lot);
    const isLive = (k) => reg.entries[k] && reg.entries[k].state === 'published';
    const report = { approved: [], published: [], held: {} };
    pages.forEach((p) => {
      const key = pageKey(p);
      const e = reg.entries[key];
      if (cmd === 'approve-lot') {
        if (e && ['approved', 'published'].includes(e.state)) return;
        const r = evaluate(ds, p, { isLive });
        if (['qa_passed', 'approved', 'published'].includes(r.stage) || (r.stage === 'qa_passed')) {
          setState(reg, key, 'approved', { lot: lot.id, volume: r.volume });
          report.approved.push(key);
        } else report.held[key] = r.stage + ': ' + r.reasons.join(', ');
      } else {
        if (!e || e.state !== 'approved') return;
        setState(reg, key, 'published', { publishedOn: today(), lastmod: today() });
        report.published.push(key);
      }
    });
    save(reg);
    console.log(JSON.stringify({ lot: lot.id, approved: report.approved.length, published: report.published.length, held: Object.keys(report.held).length }, null, 1));
    const reasons = {};
    Object.values(report.held).forEach((v) => { const k = v.split(',')[0]; reasons[k] = (reasons[k] || 0) + 1; });
    if (Object.keys(reasons).length) console.log('held back:', reasons);
  } else if (cmd === 'retire') {
    if (!reg.entries[arg]) throw new Error('unknown key ' + arg);
    setState(reg, arg, 'retired');
    save(reg);
    console.log(arg, 'retired');
  } else throw new Error('unknown command ' + cmd);
}
