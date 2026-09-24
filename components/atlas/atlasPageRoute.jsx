// Shared implementation of the Atlas data page routes under app/[lang]/.
//
// One route file per segment per language, each of which fixes only its own
// folder name. The segment names differ by language on purpose, so /de/
// serves lebenshaltungskosten and /pl/ serves koszty-zycia, and neither is a
// redirect to the other.

import { notFound } from 'next/navigation';
import AtlasPage from './AtlasPage.jsx';
import { servePage, alternatePathsFor } from '../../lib/atlas/serve-pages.js';
import { buildMetadata } from '../../lib/seo.js';

export function makeAtlasPageRoute(segmentName) {
  async function resolve(params) {
    const { lang, path } = await params;
    return servePage(lang, segmentName, path || []);
  }

  async function generateMetadata({ params }) {
    const hit = await resolve(params);
    if (!hit) return { title: 'Not found', robots: { index: false, follow: false } };
    const m = hit.model;
    return buildMetadata({
      title: m.title,
      description: m.description,
      path: m.path,
      locale: m.locale,
      alternates: alternatePathsFor(m),
      // Everything in the manifest passed cohort QA, which is the condition
      // for being indexable. A page that is not in the manifest never gets
      // here at all.
      robots: { index: true, follow: true },
      type: 'article',
    });
  }

  async function Page({ params }) {
    const hit = await resolve(params);
    if (!hit) notFound();
    return <AtlasPage model={hit.model} alternatePaths={alternatePathsFor(hit.model)} />;
  }

  async function generateStaticParams({ params }) {
    const { lang } = await params;
    const { staticParamsFor } = await import('../../lib/atlas/serve-pages.js');
    return staticParamsFor(lang, segmentName);
  }

  return { Page, generateMetadata, generateStaticParams };
}
