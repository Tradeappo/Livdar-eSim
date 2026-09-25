// Jobs that can be interrupted.
//
// Generation and QA hold their whole run in memory and start again from zero
// if anything goes wrong. At a hundred thousand pages that is an afternoon
// lost to one bad row; at a million it means the run can never finish at all,
// because the probability of getting through the whole thing without a single
// failure approaches zero as the run gets longer.
//
// The measurement store already has this shape for exactly the same reason:
// a batch is identified by a hash of what it asked for, and a run consults
// the record before it spends. This generalises that to any job.
//
// Four properties, and each one is a specific failure that stops happening.
//
//   Deterministic   the same input always produces the same batch ids, so a
//                   resumed run recognises its own earlier work rather than
//                   producing a new plan that happens to overlap.
//   Idempotent      completing a batch twice is the same as completing it
//                   once, so a retry after an unclear failure is safe.
//   Partial         one failed batch fails one batch. The run records it and
//                   carries on, and the failure is visible afterwards rather
//                   than being the thing that killed everything.
//   Bounded         memory is one batch, never the run.

import { createHash } from 'node:crypto';

export const DEFAULT_BATCH_SIZE = 500;

export const jobId = (spec) => createHash('sha1').update(JSON.stringify(spec)).digest('hex').slice(0, 16);
export const batchId = (job, index, items) =>
  createHash('sha1').update(job + ':' + index + ':' + items.length + ':' + items[0] + ':' + items[items.length - 1]).digest('hex').slice(0, 16);

// A plan is the list of batches a job will do. It is computed from the input
// rather than stored, so it survives a crash without being persisted.
export function plan(spec, items, size = DEFAULT_BATCH_SIZE) {
  const job = jobId(spec);
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    batches.push({ id: batchId(job, batches.length, slice), index: batches.length, from: i, size: slice.length, first: slice[0], last: slice[slice.length - 1] });
  }
  return { job, spec, total: items.length, size, batches };
}

export const emptyState = (job) => ({
  note: 'Completed and failed batches for one job. A run consults this before doing any work, so an interrupted run resumes instead of starting again.',
  job,
  batches: {},
  startedAt: null,
  finishedAt: null,
});

export function remaining(planned, state) {
  return planned.batches.filter((b) => state.batches[b.id]?.status !== 'done');
}

export function progress(planned, state) {
  const done = planned.batches.filter((b) => state.batches[b.id]?.status === 'done');
  const failed = planned.batches.filter((b) => state.batches[b.id]?.status === 'failed');
  const itemsDone = done.reduce((t, b) => t + b.size, 0);
  return {
    batches: planned.batches.length,
    done: done.length,
    failed: failed.length,
    pending: planned.batches.length - done.length - failed.length,
    items: planned.total,
    itemsDone,
    percent: planned.total ? Math.round((itemsDone / planned.total) * 1000) / 10 : 0,
    // A run with failures is not a finished run, whatever the percentage
    // says, and the caller should not be able to read it as one.
    complete: done.length === planned.batches.length,
    failedBatches: failed.map((b) => ({ id: b.id, index: b.index, error: state.batches[b.id].error })),
  };
}

export function record(state, batch, status, extra = {}) {
  return {
    ...state,
    batches: { ...state.batches, [batch.id]: { ...(state.batches[batch.id] || {}), index: batch.index, size: batch.size, status, at: new Date().toISOString(), ...extra } },
  };
}

// Run a job, resuming from whatever the state already knows. `work` is given
// one batch at a time and nothing else, which is what keeps memory bounded.
// A thrown error fails that batch and the run continues, because the
// alternative is that one bad page stops a hundred thousand good ones.
export async function run(planned, state, work, { onProgress = null, stopAfterFailures = Infinity } = {}) {
  let s = { ...state, startedAt: state.startedAt || new Date().toISOString() };
  let failures = 0;
  for (const batch of planned.batches) {
    if (s.batches[batch.id]?.status === 'done') continue;
    try {
      const result = await work(batch);
      s = record(s, batch, 'done', { result: result === undefined ? null : result });
    } catch (err) {
      failures++;
      s = record(s, batch, 'failed', { error: String(err && err.message ? err.message : err) });
      if (failures >= stopAfterFailures) break;
    }
    if (onProgress) onProgress(progress(planned, s));
  }
  const p = progress(planned, s);
  if (p.complete) s = { ...s, finishedAt: new Date().toISOString() };
  return { state: s, progress: p };
}

// Retrying only the failures, which is the other half of partial recovery.
export function retryPlan(planned, state) {
  const failed = new Set(planned.batches.filter((b) => state.batches[b.id]?.status === 'failed').map((b) => b.id));
  return { ...planned, batches: planned.batches.filter((b) => failed.has(b.id)) };
}

export function clearFailures(state) {
  const batches = {};
  for (const [id, b] of Object.entries(state.batches)) if (b.status !== 'failed') batches[id] = b;
  return { ...state, batches };
}
