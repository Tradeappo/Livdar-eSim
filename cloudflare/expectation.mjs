// The publication guard: what a sync is about to write and delete, compared with what the
// person approving it said it would write and delete.
//
// WHY. The uploader decides what to send by comparing the export with the live bucket, so
// the set of writes is only known once the bucket has been listed. An approval given for
// "these 7 pages" says nothing about an export that, for a reason nobody saw, differs from
// the bucket in 700 places. The expectation file names the exact keys; the uploader lists
// the bucket, computes its plan, and refuses before its first write unless the plan is
// exactly that list, with exactly the named deletions (normally none).
//
// The two manifest objects (atlas/manifest.json and atlas/manifests/<version>.json) are
// written on every sync, because the version flip is what makes the Worker serve the new
// objects. They are reported, not counted against the list.
//
// Expectation file:
//   { "upload": ["atlas/pages/.../model.json", ...], "delete": [] }

export function compareWithExpectation({ upload, remove, expect }) {
  const want = new Set(expect.upload || []);
  const wantGone = new Set(expect.delete || []);
  const have = new Set(upload);
  const gone = new Set(remove);
  const result = {
    unexpectedUploads: [...have].filter((k) => !want.has(k)).sort(),
    expectedButUnchanged: [...want].filter((k) => !have.has(k)).sort(),
    unexpectedDeletes: [...gone].filter((k) => !wantGone.has(k)).sort(),
    expectedDeletesMissing: [...wantGone].filter((k) => !gone.has(k)).sort(),
  };
  result.ok = Object.values(result).every((list) => list.length === 0);
  return result;
}

// The workflow's `retire` input deletes keys before the sync; they count as deletions.
export function retireKeys(input) {
  return String(input || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => 'atlas/pages' + p + 'model.json');
}
