import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import DestinationSearch from '../../components/DestinationSearch.jsx';
import Cta from '../../components/Cta.jsx';
import Faq from '../../components/Faq.jsx';
import JsonLd from '../../components/JsonLd.jsx';
import DestinationRail from '../../components/shop/DestinationRail.jsx';
import RegionRail from '../../components/shop/RegionRail.jsx';
import TravelTools from '../../components/shop/TravelTools.jsx';
import { ui, homeContent, publishedDestinationIds, publishedGuideSlugs, publishedRegionIds, guideContent } from '../../lib/content/index.js';
import { DESTINATIONS, REGIONS, localizedName, destinationSlug, regionName, getDestination, flagFor } from '../../lib/destinations.js';
import { routes } from '../../lib/routes.js';
import { buildMetadata, homeAlternates, organizationSchema, websiteSchema } from '../../lib/seo.js';
import { contentLocales } from '../../lib/content/index.js';
import { toolStrings } from '../../lib/content/ui.js';
import V41Marketplace from '../../components/V41Marketplace.jsx';
import V41SeoContent from '../../components/V41SeoContent.jsx';

export const dynamicParams = false;

export function generateStaticParams() {
  return contentLocales().map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const c = homeContent(lang);
  return buildMetadata({
    title: c.title,
    description: c.metaDescription,
    path: routes.home(lang),
    locale: lang,
    alternates: homeAlternates(),
  });
}

function searchItems(locale) {
  return DESTINATIONS.map((d) => ({
    name: localizedName(d, locale),
    alt: d.names.en || d.id,
    code: d.callingCode,
    region: d.region,
    href: routes.destination(locale, d),
  }));
}

export default async function HomePage({ params }) {
  const { lang } = await params;
  const locale = lang;
  const t = ui(locale);
  const c = homeContent(locale);

  const published = publishedDestinationIds(locale);
  const popular = published.map(getDestination).filter(Boolean);
  // Only regions with a published page in this market. The previous list took
  // the first eight of the dataset and happened to be right; happening to be
  // right is not the same as being unable to be wrong.
  const publishedRegions = publishedRegionIds(locale);
  const regions = REGIONS.filter((r) => r.id !== 'global' && publishedRegions.includes(r.id)).slice(0, 8);
  const guides = publishedGuideSlugs(locale).map((slug) => ({ slug, ...guideContent(locale, slug) }));

  const alternatePaths = {};
  contentLocales().forEach((l) => {
    alternatePaths[l] = routes.home(l);
  });

  return (
    <>
      <V41Marketplace locale={locale} h1={c.heroTitle}>
        <V41SeoContent locale={locale} includeEditorial />
      </V41Marketplace>
      <JsonLd data={[organizationSchema(), websiteSchema(locale)]} />
    </>
  );
}
