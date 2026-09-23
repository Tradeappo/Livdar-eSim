// Near duplicate detection that does not explode.
//
// The existing similarity check compares every page with every other one.
// At 106 pages that is 5,565 comparisons and runs instantly. At 25,000 it is
// 312 million, and at 300,000 it is 45 billion. The check that protects
// quality is therefore the check that stops the programme from growing, which
// is the wrong way round.
//
// This is the standard fix: MinHash signatures plus banded locality sensitive
// hashing. Each page gets a fixed length signature; pages are bucketed by
// bands of that signature; only pages that share a bucket are compared. Work
// grows with the number of pages rather than with their square, and the
// comparisons that are skipped are the ones that were never going to be
// similar.
//
// It is approximate by construction. A pair below the band threshold can be
// missed, so the threshold is set low enough that anything a reader would
// call a duplicate lands in a shared bucket, and every candidate pair is then
// compared exactly. Nothing is reported as a duplicate on the strength of the
// hash alone.

import { createHash } from 'node:crypto';

export const SIGNATURE_LENGTH = 128;
export const BANDS = 32;
export const ROWS_PER_BAND = SIGNATURE_LENGTH / BANDS;

// Shingles are word level and overlapping, because two generated pages differ
// by the values inside otherwise identical sentences, and character shingles
// would call every page in a family a duplicate.
export function shingles(text, size = 5) {
  const words = String(text || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(' '));
  if (!out.size && words.length) out.add(words.join(' '));
  return out;
}

const hashInt = (s, seed) => {
  const h = createHash('sha1').update(seed + '\u0000' + s).digest();
  return h.readUInt32BE(0);
};

export function signature(text, { size = 5, length = SIGNATURE_LENGTH } = {}) {
  const sh = [...shingles(text, size)];
  const sig = new Array(length).fill(0xffffffff);
  for (const s of sh) {
    for (let i = 0; i < length; i++) {
      const v = hashInt(s, String(i));
      if (v < sig[i]) sig[i] = v;
    }
  }
  return sig;
}

export const jaccardFromSignatures = (a, b) => {
  let same = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same++;
  return same / a.length;
};

// Exact Jaccard on the shingle sets, used only on the pairs the bands
// surfaced. This is what a reported duplicate is measured with.
export function jaccard(aSet, bSet) {
  let inter = 0;
  const [small, large] = aSet.size <= bSet.size ? [aSet, bSet] : [bSet, aSet];
  for (const x of small) if (large.has(x)) inter++;
  const union = aSet.size + bSet.size - inter;
  return union === 0 ? 0 : inter / union;
}

// The candidate pairs. Pages are bucketed by each band of their signature;
// any two pages sharing a bucket in any band become a candidate.
export function candidatePairs(items) {
  const buckets = new Map();
  for (const it of items) {
    for (let b = 0; b < BANDS; b++) {
      const band = it.signature.slice(b * ROWS_PER_BAND, (b + 1) * ROWS_PER_BAND).join(',');
      const k = b + '|' + createHash('sha1').update(band).digest('hex').slice(0, 16);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(it.id);
    }
  }
  const pairs = new Set();
  for (const list of buckets.values()) {
    if (list.length < 2 || list.length > 500) continue; // a bucket that holds everything is noise
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        pairs.add(list[i] < list[j] ? list[i] + '\u0000' + list[j] : list[j] + '\u0000' + list[i]);
      }
    }
  }
  return [...pairs].map((p) => p.split('\u0000'));
}

export const NEAR_DUPLICATE_AT = 0.8;

// The whole check. `texts` is a map of id to the page text. Returns the pairs
// that are really too close, with the exact similarity, plus the work it did,
// so the saving against the quadratic version is visible rather than claimed.
export function findNearDuplicates(texts, { threshold = NEAR_DUPLICATE_AT, size = 5 } = {}) {
  const ids = Object.keys(texts);
  const sets = new Map();
  const items = ids.map((id) => {
    const sh = shingles(texts[id], size);
    sets.set(id, sh);
    return { id, signature: signature(texts[id], { size }) };
  });
  const pairs = candidatePairs(items);
  const duplicates = [];
  for (const [a, b] of pairs) {
    const j = jaccard(sets.get(a), sets.get(b));
    if (j >= threshold) duplicates.push({ a, b, similarity: Math.round(j * 1000) / 1000 });
  }
  const exhaustive = (ids.length * (ids.length - 1)) / 2;
  return {
    pages: ids.length,
    comparisonsMade: pairs.length,
    comparisonsAvoided: exhaustive - pairs.length,
    exhaustiveWouldBe: exhaustive,
    duplicates: duplicates.sort((x, y) => y.similarity - x.similarity),
    threshold,
  };
}
