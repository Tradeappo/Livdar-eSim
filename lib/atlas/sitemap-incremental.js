// Sitemaps that do not rewrite themselves.
//
// The existing sitemap builder recomputes every file from the whole registry
// on every publication, and it slices each family list into chunks by
// position. Both of those are fine at 123 pages and neither survives growth.
// Position based chunking means one page inserted near the front shifts every
// page after it into a different file, so a lot of 250 URLs rewrites all 25
// files at a million pages and all 2,500 at a hundred million, and every one
// of those files changes its contents for no reason a crawler can understand.
//
// The fix is not a faster rewrite. It is to stop the assignment from being a
// function of position at all.
//
// A page is assigned to a chunk once, when it is first published, and it
// keeps that chunk for the rest of its life. Each partition, which is one
// locale and one family, has an open chunk that fills to the cap and then
// closes forever. Publishing a lot therefore touches the open chunk of each
// partition the lot contains, plus the index when a chunk closes and a new
// one opens. Everything else on disk is untouched and, more importantly,
// unchanged, so its lastmod stays honest.

export const CAP = 40000;
export const partitionOf = (page) => page.locale + '-' + page.family;

export const emptyManifest = () => ({
  note: 'Which sitemap chunk each published page belongs to. An assignment is permanent: it is made once at first publication and never recomputed, which is what makes publication incremental. Chunk numbers start at 1 and a closed chunk is never reopened, even if pages inside it are later retired.',
  cap: CAP,
  partitions: {},
  assignments: {},
});

// Assign chunks to pages that do not have one. Returns the pages it touched
// and, separately, the files that therefore have to be written, which is the
// number the whole module exists to keep small.
export function assign(manifest, pages) {
  const m = { ...manifest, partitions: { ...manifest.partitions }, assignments: { ...manifest.assignments } };
  const touchedFiles = new Set();
  const assigned = [];
  let opened = 0;
  for (const page of pages) {
    if (m.assignments[page.key]) continue;
    const p = partitionOf(page);
    const isNewPartition = !m.partitions[p];
    const state = m.partitions[p] || { openChunk: 1, countInOpen: 0, chunks: 1 };
    // A partition's first chunk is a new file and therefore a new line in the
    // index, exactly like a chunk that opens at the cap. Counting only the
    // second case left the index stale for every new locale and family, which
    // is how a sitemap index quietly stops listing a whole section.
    if (isNewPartition) opened++;
    if (state.countInOpen >= m.cap) {
      state.openChunk += 1;
      state.chunks = state.openChunk;
      state.countInOpen = 0;
      opened++;
    }
    const file = p + '-' + state.openChunk;
    m.assignments[page.key] = file;
    state.countInOpen += 1;
    m.partitions[p] = state;
    touchedFiles.add(file);
    assigned.push({ key: page.key, file });
  }
  return { manifest: m, assigned, touchedFiles: [...touchedFiles].sort(), chunksOpened: opened };
}

// What a publication actually costs on disk. `indexRewritten` is true only
// when a new chunk was opened, because the index lists files and not URLs.
export function publicationCost(manifest, pages) {
  const r = assign(manifest, pages);
  return {
    pagesAssigned: r.assigned.length,
    filesRewritten: r.touchedFiles.length,
    indexRewritten: r.chunksOpened > 0,
    files: r.touchedFiles,
    manifest: r.manifest,
  };
}

// Group assigned pages into the files to write. A caller passes the pages it
// wants serialised and gets back one entry per file, so a writer never holds
// more than one chunk.
export function filesFor(manifest, pages) {
  const byFile = new Map();
  for (const page of pages) {
    const file = manifest.assignments[page.key];
    if (!file) continue;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(page);
  }
  return [...byFile.entries()].map(([id, list]) => ({ id, pages: list })).sort((a, b) => a.id.localeCompare(b.id));
}

export function allChunkIds(manifest) {
  const out = [];
  for (const [p, s] of Object.entries(manifest.partitions)) {
    for (let i = 1; i <= s.chunks; i++) out.push(p + '-' + i);
  }
  return out.sort();
}

// A retired page leaves its chunk and does not free the slot. That is
// deliberate: reusing a slot would put a new URL into an old file and change
// a file that had settled, which is the behaviour being removed. The cost is
// some slack inside closed chunks, which at a cap of forty thousand against a
// limit of fifty thousand is affordable by design.
export function retire(manifest, keys) {
  const m = { ...manifest, assignments: { ...manifest.assignments } };
  const touched = new Set();
  for (const k of keys) {
    const f = m.assignments[k];
    if (!f) continue;
    touched.add(f);
    delete m.assignments[k];
  }
  return { manifest: m, touchedFiles: [...touched].sort() };
}

// What this costs at every step of the ladder, against what the position
// based builder costs. The point is the ratio, and that it does not move.
export function simulate(ladder = [300000, 1000000, 20000000, 50000000, 100000000], lot = 250, partitionsTouchedPerLot = 3) {
  return ladder.map((pages) => {
    const totalFiles = Math.ceil(pages / CAP);
    return {
      pages,
      totalFiles,
      rebuildAllCost: totalFiles,
      incrementalCost: partitionsTouchedPerLot,
      ratio: Math.round((totalFiles / partitionsTouchedPerLot) * 10) / 10,
      note: 'A lot of ' + lot + ' URLs rewrites ' + partitionsTouchedPerLot + ' files instead of ' + totalFiles.toLocaleString() + '.',
    };
  });
}
