// Sitemap entries for the Atlas data pages.
//
// The files are split by language and by surface rather than by family,
// because surface is the unit the cohort metrics are read at: if the tools
// pages index at half the rate of the move pages, a per surface file says so
// from the crawl log without anybody joining two datasets together.
//
// Nothing here can list a page that is not in the manifest, for the same
// reason nothing can serve one. The manifest is the single statement of what
// is published, and the sitemap, the routes and QA all read it.

import { pages, alternatesFor, languagesServed } from './serve-pages.js';

// WHEN EACH COHORT WENT LIVE, the `at` of data/atlas/launches/cohort-NNN-live.json, written into
// <lastmod>. The pages carry annual normals that have not changed since they were published, so
// their real last modification is their publication. Before this, every Atlas URL fell back to
// CONTENT_LAST_MODIFIED.core (2026-09-21), a date earlier than cohorts 003 and 004 existed. Google
// uses lastmod only while it stays consistently accurate, and that one did not.
// tests/atlas-sitemap-lastmod.test.mjs keeps this table equal to the launch records.
export const COHORT_LIVE_AT = Object.freeze({
  '001': '2026-09-25T01:14:36.316Z',
  '002': '2026-09-25T01:14:54.993Z',
  '003': '2026-10-20T20:50:19.794Z',
  '004': '2026-10-24T19:15:02.940Z',
});
const liveAt = (cohort, fallback) => (COHORT_LIVE_AT[String(cohort)] ? new Date(COHORT_LIVE_AT[String(cohort)]) : fallback);

const PREFIX = 'atlas-pages-';
const DIRECTORY_ID = 'atlas-directory';

// FROM COHORT 004, EVERY COHORT GETS ITS OWN CHILD SITEMAPS (atlas-pages-c004-en-climate),
// so a new cohort never changes a file Google has already read for an earlier one, and the
// lastDownloaded of the new cohort's files says exactly when Google picked the cohort up.
// Cohorts 001 to 003 keep the ids they were published under.
const OWN_SITEMAPS_FROM = 4;
const ownFiles = (cohort) => Number(cohort) >= OWN_SITEMAPS_FROM;

export const idFor = (locale, surface, cohort) =>
  PREFIX + (ownFiles(cohort) ? 'c' + String(cohort) + '-' : '') + locale + '-' + surface;

export function sitemapIds() {
  const ids = new Set();
  for (const p of pages()) ids.add(idFor(p.locale, p.surface, p.cohort));
  return [DIRECTORY_ID, ...[...ids].sort()].map((id) => ({ id }));
}

// THE DIRECTORIES BELONG HERE, not in the eSIM core sitemap. They were added to
// coreEntries() in app/sitemap.js, which runs for contentLocales() (de, en, ro), while the
// directory route itself generates for languagesServed() (the nine languages the Atlas
// publishes in). The two lists disagree in both directions, so /ro/atlas/ was declared in a
// sitemap and answered 404, and the seven directories for the Atlas-only languages were in
// no sitemap at all. One list decides both now: the manifest.
export const isDirectorySitemap = (id) => String(id || '') === DIRECTORY_ID;

export function directoryEntries({ absolute, lastModified }) {
  const langs = languagesServed();
  const languages = Object.fromEntries(langs.map((l) => [l, absolute('/' + l + '/atlas/')]));
  if (languages.en) languages['x-default'] = languages.en;
  return langs.map((l) => ({
    url: absolute('/' + l + '/atlas/'),
    lastModified,
    // The directory changes when the cohort changes, which is rarer than daily. It was
    // declared 'daily', which is a claim the manifest does not support.
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: { languages },
  }));
}

export const isPagesSitemap = (id) => String(id || '').startsWith(PREFIX);

// Entries for one file. Priority follows measured demand rather than being a
// constant, because a sitemap that gives every page the same priority gives a
// crawler no information at all. The scale is bounded and coarse on purpose:
// it ranks pages within the site and claims nothing beyond that.
export function sitemapEntries(id, { absolute, lastModified }) {
  if (!isPagesSitemap(id)) return [];
  let rest = String(id).slice(PREFIX.length);
  const own = rest.match(/^c(\d{3})-/);
  if (own) rest = rest.slice(own[0].length);
  const cut = rest.lastIndexOf('-');
  if (cut < 1) return [];
  const locale = rest.slice(0, cut);
  const surface = rest.slice(cut + 1);

  const rows = pages().filter((p) => p.locale === locale && p.surface === surface
    && (own ? String(p.cohort) === own[1] : !ownFiles(p.cohort)));
  if (!rows.length) return [];
  const top = Math.max(...rows.map((p) => p.volume || 0), 1);

  return rows.map((p) => ({
    url: absolute(p.path),
    lastModified: liveAt(p.cohort, lastModified),
    // Annual statistics change once a year. Saying weekly would be a claim
    // the data does not support and a crawler learns to ignore.
    changeFrequency: 'monthly',
    priority: Math.round((0.4 + 0.5 * (Math.log10((p.volume || 0) + 1) / Math.log10(top + 1))) * 100) / 100,
    // `alternatesFor` rather than `p.alternates`, for the same reason the
    // metadata uses it: the manifest's own list was computed per cohort and is
    // short by every sibling that lives in the other one. A sitemap that
    // disagrees with the page's own hreflang is worse than one that omits it.
    alternates: (() => {
      const alts = alternatesFor(p).filter((a) => a.hreflang !== 'x-default');
      return alts.length ? { languages: Object.fromEntries(alts.map((a) => [a.hreflang, a.href])) } : undefined;
    })(),
  }));
}
