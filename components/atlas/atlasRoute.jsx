// Shared implementation of the six Atlas route files under app/[lang]/.
// Each route file only fixes its segment name; everything else is here.

import { notFound } from 'next/navigation';
import AtlasPage from './AtlasPage.jsx';
import { atlasModel, atlasAlternates, atlasIndexable, atlasStaticParams } from '../../lib/atlas/serve.js';
import { loadDataset } from '../../lib/atlas/data.js';
import { buildMetadata } from '../../lib/seo.js';

export function makeAtlasRoute(segmentName) {
  async function resolve(params) {
    const { lang, path } = await params;
    return atlasModel(lang, segmentName, path || []);
  }
  async function generateMetadata({ params }) {
    const hit = await resolve(params);
    if (!hit) return { title: 'Not found', robots: { index: false, follow: false } };
    const alt = atlasAlternates(loadDataset(), hit.model);
    return buildMetadata({
      title: hit.model.title,
      description: hit.model.description,
      path: hit.model.path,
      locale: hit.model.locale,
      alternates: alt.languages,
      robots: atlasIndexable(hit.published) ? { index: true, follow: true } : { index: false, follow: false },
      type: 'article',
    });
  }
  async function Page({ params }) {
    const hit = await resolve(params);
    if (!hit) notFound();
    const alt = atlasAlternates(loadDataset(), hit.model);
    return <AtlasPage model={hit.model} alternatePaths={alt.paths} />;
  }
  async function generateStaticParams({ params }) {
    const { lang } = await params;
    return atlasStaticParams(lang, segmentName);
  }
  return { Page, generateMetadata, generateStaticParams };
}
