// Worker stand-in for lib/atlas/serve-pages.js.
//
// The real module reads the cohort manifests off the filesystem with node:fs, which a
// Worker has none of, and it is the ONLY filesystem dependency anywhere in the Atlas
// render chain (checked with: grep -rl "node:fs" lib/ components/). The components do
// not need the manifests: Header, Footer and the directory call exactly one function
// from it, languagesServed(), to decide which language links exist. So the Worker gets
// that one list from the dataset manifest it already loaded from R2, and esbuild aliases
// this file in place of the real one (see cloudflare/build.mjs).
//
// setLocales() is called once per request from the manifest rather than hardcoded here,
// so adding a language is a re-export and never a Worker deploy, and the Worker can
// never claim a language the exported dataset does not contain.

let locales = [];

export function setLocales(list) {
  locales = Array.isArray(list) ? list : [];
}

export function languagesServed() {
  return locales;
}

// Guards. Nothing in the render chain reaches these; if a future component does, it
// fails loudly here rather than silently rendering a page with no links, which is the
// failure mode the real module's own comments warn about.
const unavailable = (name) => () => {
  throw new Error('lib/atlas/serve-pages.js ' + name + '() is not available in the Worker: '
    + 'the cohort manifests are not shipped to the edge. The page model arrives from R2 already '
    + 'resolved, so a renderer needing this is reading the catalogue at request time, which is '
    + 'what the migration removed.');
};

export const pages = unavailable('pages');
export const pagesForGroup = unavailable('pagesForGroup');
export const servePage = unavailable('servePage');
export const alternatesFor = unavailable('alternatesFor');
export const alternatePathsFor = unavailable('alternatePathsFor');
export const hreflangMapFor = unavailable('hreflangMapFor');
export const staticParamsFor = unavailable('staticParamsFor');
export const allStaticParamsFor = unavailable('allStaticParamsFor');
export const groupOfSegment = unavailable('groupOfSegment');
export const groupOfModel = unavailable('groupOfModel');
export const resetServeCache = () => {};
export const GROUPS = [];
export const MANIFESTS = [];
export const groups = () => [];
export const familiesServed = () => [];
