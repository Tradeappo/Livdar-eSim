// Version-controlled publication metadata. Change these values only when the
// corresponding source family is materially edited or re-reviewed.
export const CONTENT_LAST_MODIFIED = Object.freeze({
  core: '2026-09-20T00:00:00.000Z',
  destinations: '2026-09-20T00:00:00.000Z',
  regions: '2026-09-20T00:00:00.000Z',
  guides: '2026-09-20T00:00:00.000Z',
});

export function lastModifiedFor(family) {
  const value = CONTENT_LAST_MODIFIED[family] || CONTENT_LAST_MODIFIED.core;
  return new Date(value);
}
