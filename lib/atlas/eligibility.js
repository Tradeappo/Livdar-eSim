// The funnel from a possible combination to a live page. Each candidate stops at
// the first stage it fails, with the reasons, so the report can say exactly how
// many pages are possible, have enough data, have measured demand, pass QA, are
// approved and are published, and why the rest are not.

import { FAMILIES, pathFor, pageKey } from './taxonomy.js';
import { buildModel } from './model.js';
import { pageQa } from './qa.js';

export const STAGES = ['possible', 'data_ready', 'demand_validated', 'qa_passed', 'approved', 'published'];

const DAY = 86400000;

export function sourceFresh(ds, id, now) {
  if (Array.isArray(id)) {
    const results = id.map((x) => sourceFresh(ds, x, now));
    return results.find((r) => r.ok) || results.find((r) => !r.reason.startsWith('missing-source')) || results[0];
  }
  const src = (ds.sourceList || []).find((s) => s.id === id);
  if (src && src.licence === 'computed') return { ok: true };
  const m = ds.manifest.sources[id];
  if (!src || !m || !m.retrievedAt) return { ok: false, reason: 'missing-source:' + id };
  if (m.fixture) return { ok: false, reason: 'fixture-data:' + id };
  const age = (now - Date.parse(m.retrievedAt)) / DAY;
  if (age > src.maxAgeDays) return { ok: false, reason: 'stale-source:' + id };
  return { ok: true };
}

export function dataReasons(ds, page, now) {
  const f = FAMILIES[page.family];
  const reasons = [];
  f.requiredData.forEach((id) => {
    const r = sourceFresh(ds, id, now);
    if (!r.ok) reasons.push(r.reason);
  });
  if (!pathFor(ds, page)) reasons.push('no-slug');
  if (f.entity === 'city') {
    const c = ds.cityById.get(String(page.entity));
    if (!c) reasons.push('no-entity');
    else {
      if (!c.names || !c.names[page.locale]) reasons.push('no-localised-name');
      if (!c.timezone) reasons.push('no-timezone');
      if (page.family === 'city-guide') {
        const k = ds.countries[c.iso2];
        if (!k || !k.currency || !k.callingCode) reasons.push('incomplete-country-facts');
      }
      if (page.family === 'city-month') {
        const cl = ds.climate[String(page.entity)];
        if (!cl || !Array.isArray(cl.months) || cl.months.length !== 12) reasons.push('no-climate');
        else reasons.push(...climateReasons(cl));
      }
    }
  } else {
    const a = ds.airportByIata.get(page.entity);
    if (!a) reasons.push('no-entity');
  }
  return reasons;
}

export function measuredVolume(ds, page) {
  const key = pageKey(page);
  const rec = (ds.demand.records || []).find((r) => r.pageKey === key);
  if (!rec) return { volume: 0, measured: false };
  return { volume: rec.keywords.reduce((t, k) => t + (k.volume || 0), 0), measured: true, measuredOn: rec.measuredOn };
}

export function evaluate(ds, page, { now = Date.now(), isLive = () => false } = {}) {
  const key = pageKey(page);
  const out = { key, stage: 'possible', reasons: [] };
  const dr = dataReasons(ds, page, now);
  if (dr.length) return { ...out, reasons: dr };
  out.stage = 'data_ready';

  const demand = measuredVolume(ds, page);
  out.volume = demand.volume;
  if (!demand.measured) return { ...out, reasons: ['unmeasured-demand'] };
  if (demand.volume < FAMILIES[page.family].minimumMonthlyVolume) return { ...out, reasons: ['insufficient-demand'] };
  out.stage = 'demand_validated';

  const model = buildModel(ds, page, isLive);
  if (!model) return { ...out, reasons: ['model-failed'] };
  const qa = pageQa(ds, model);
  out.qa = qa.metrics;
  if (qa.failures.length) return { ...out, reasons: qa.failures };
  out.stage = 'qa_passed';

  const entry = ds.registry.entries[key];
  if (!entry || !['approved', 'published'].includes(entry.state)) return { ...out, reasons: ['not-approved'] };
  out.stage = 'approved';
  if (entry.state !== 'published') return { ...out, reasons: ['approved-not-published'] };
  out.stage = 'published';
  return out;
}

// Runs the funnel over a list of candidates. For the full taxonomy the data
// stage is cheap and runs on everything; the render stages only run on the
// candidates that reached them, which keeps a 1M candidate run tractable.
export function funnel(ds, candidates, opts = {}) {
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0]));
  const reasons = {};
  const reached = [];
  candidates.forEach((page) => {
    const r = evaluate(ds, page, opts);
    const idx = STAGES.indexOf(r.stage);
    for (let i = 0; i <= idx; i++) counts[STAGES[i]]++;
    r.reasons.forEach((x) => { const k = x.split(':')[0]; reasons[k] = (reasons[k] || 0) + 1; });
    if (idx >= 1) reached.push(r);
  });
  return { counts, reasons, reached };
}

// Plausibility of a climate record before any page uses it. A grid cell that
// is mostly sea has almost no difference between day and night; its numbers
// describe the water, not the city, so the city is held back.
export function climateReasons(cl) {
  const r = [];
  const range = cl.months.reduce((t, m) => t + (m.tmax - m.tmin), 0) / 12;
  if (range < 4) r.push('marine-grid-cell');
  if (cl.months.some((m) => m.tmax < m.tmin || m.tmax > 50 || m.tmin < -60 || m.precipMm < 0 || m.precipMm > 1500 || m.wetDays > 31)) r.push('implausible-climate');
  return r;
}
