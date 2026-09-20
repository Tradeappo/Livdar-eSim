// Destination and region imagery.
//
// Three rules decide what may appear here, and they are the reason this file is
// a manifest rather than a folder of files somebody dropped in.
//
// 1. An image is only ever used for the place it actually shows. The prototype
//    carried twelve photographs for a hundred and eighteen countries, reused
//    about ten times each, so Germany was illustrated with a photograph of
//    Japan and Poland with a photograph of Thailand. A wrong photograph is
//    worse than no photograph: it reads as carelessness on the page where the
//    reader is deciding whether to trust us with a payment.
//
// 2. Every entry records where the image came from and under what licence. If
//    the provenance of an image cannot be written down here, the image does not
//    ship. That is also why the manifest is data rather than a convention over
//    filenames: a filename cannot carry a licence.
//
// 3. A missing entry is a supported state, not a bug. imageFor returns null and
//    the card falls back to its own gradient, which is part of the design
//    rather than a placeholder. So the site is always complete, and imagery is
//    added destination by destination as each one is sourced and checked.
//
// The files themselves are fetched into public/img at build time by
// scripts/fetch-media.mjs, because binaries do not belong in the repository and
// because the fetch is the natural place to verify that what arrived is really
// an image of the expected size.

import { GENERATED_DESTINATION_IMAGES, GENERATED_REGION_IMAGES, GENERATED_SHARED_IMAGES } from './media.generated.js';

// Licences we accept. Anything outside this list fails the media check, so a
// "found it on the internet" image cannot reach production by accident.
export const ACCEPTED_LICENCES = new Set([
  'unsplash', // Unsplash Licence: free commercial use, no permission needed
  'pexels', // Pexels Licence: free commercial use
  'cc0', // Public domain dedication
  'cc-by', // Attribution required, rendered in the credits page
  'cc-by-sa',
  'owned', // Produced for Livdar, rights held outright
]);

// Licences that oblige us to name the author next to or beneath the image.
export const ATTRIBUTION_REQUIRED = new Set(['cc-by', 'cc-by-sa']);

// The manifest. Keyed by destination id and region id, which are the same ids
// the router uses, so an image can never be attached to a place that has no
// page.
//
// Shape:
//   file        what the file is called under public/img/<kind>/
//   source      remote original, fetched at build time
//   credit      { licence, author, authorUrl, sourceUrl }
//   focus       object-position, for framing faces and horizons on a crop
//   width/height  intrinsic size of the fetched file, so next/image never
//                 causes layout shift
//
// Empty until each image has been looked at and its licence recorded. See
// reports/media-todo.md for what is outstanding.
// Adopted images come in from the generated manifest, which scripts/adopt-media.mjs
// writes from what is actually on disk. Hand written entries may be added here
// for anything sourced rather than commissioned; the generated ones win, because
// they were measured rather than typed.
export const DESTINATION_IMAGES = { ...GENERATED_DESTINATION_IMAGES };

export const REGION_IMAGES = { ...GENERATED_REGION_IMAGES };

export const SHARED_IMAGES = { ...GENERATED_SHARED_IMAGES };

// The gradient a card falls back to. Taken from the design's own palette, so a
// destination without a photograph still looks deliberate rather than broken.
const FALLBACK_GRADIENTS = [
  ['#3d5a80', '#98c1d9'],
  ['#2d6a4f', '#95d5b2'],
  ['#6a4c93', '#b8a6db'],
  ['#9d4e15', '#e8a87c'],
  ['#1b3a4b', '#5c8a9e'],
  ['#7c3141', '#cf8b9b'],
];

// Stable per id, so the same destination always gets the same gradient and the
// grid does not reshuffle its colours between renders.
export function fallbackGradient(id) {
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length];
}

export function imageFor(kind, id) {
  const table = kind === 'region' ? REGION_IMAGES : kind === 'shared' ? SHARED_IMAGES : DESTINATION_IMAGES;
  const entry = table[id];
  if (!entry) return null;
  const dir = kind === 'region' ? 'regions' : kind === 'shared' ? 'shared' : 'destinations';
  return {
    src: '/img/' + dir + '/' + entry.file,
    width: entry.width,
    height: entry.height,
    focus: entry.focus || 'center',
    credit: entry.credit,
  };
}

export function hasImage(kind, id) {
  return !!imageFor(kind, id);
}

// Everything that must be credited on the page rather than only in this file.
export function creditsRequiring() {
  const out = [];
  [
    ['destination', DESTINATION_IMAGES],
    ['region', REGION_IMAGES],
    ['shared', SHARED_IMAGES],
  ].forEach(([kind, table]) => {
    Object.entries(table).forEach(([id, entry]) => {
      if (ATTRIBUTION_REQUIRED.has(entry.credit.licence)) out.push({ kind, id, ...entry.credit });
    });
  });
  return out;
}

export function manifestProblems() {
  const problems = [];
  [
    ['destination', DESTINATION_IMAGES],
    ['region', REGION_IMAGES],
    ['shared', SHARED_IMAGES],
  ].forEach(([kind, table]) => {
    Object.entries(table).forEach(([id, entry]) => {
      const where = kind + ' ' + id;
      if (!entry.file) problems.push(where + ': no file name.');
      // A commissioned image has no remote source; it arrived through adopt-media.
      if (!entry.source && entry.credit && entry.credit.licence !== 'owned') {
        problems.push(where + ': no source URL, so the image cannot be fetched or verified.');
      }
      if (!entry.credit || !entry.credit.licence) {
        problems.push(where + ': no licence recorded. An image with no recorded licence does not ship.');
      } else if (!ACCEPTED_LICENCES.has(entry.credit.licence)) {
        problems.push(where + ': licence "' + entry.credit.licence + '" is not in the accepted list.');
      }
      if (!entry.width || !entry.height) {
        problems.push(where + ': no intrinsic size, which means layout shift when it loads.');
      }
    });
  });
  return problems;
}
