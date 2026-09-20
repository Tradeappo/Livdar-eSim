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
      <Header locale={locale} alternatePaths={alternatePaths} />
      <main id="main">
        <div className="wrap">
          <section className="hero">
            <p className="kicker">{c.heroKicker}</p>
            <h1>{c.heroTitle}</h1>
            <p className="hero-lead">{c.heroLead}</p>
            <DestinationSearch items={searchItems(locale)} strings={t} locale={locale} />
            <div className="hero-actions" style={{ marginTop: 18 }}>
              <Cta label={c.heroPrimary} href={routes.esimHub(locale)} position="hero_primary" locale={locale} cluster="home" />
              <Cta
                label={c.heroSecondary}
                href={routes.guide(locale, 'how-esim-works')}
                position="hero_secondary"
                locale={locale}
                cluster="home"
                variant="ghost"
              />
            </div>
          </section>

          {/* Same destinations and the same links as before, in the new
            * treatment. The rail is server rendered, so these stay in the HTML
            * and keep doing their job as internal links. */}
          <DestinationRail
            locale={locale}
            strings={t}
            destinations={popular.map((d) => ({
              id: d.id,
              name: localizedName(d, locale),
              flag: flagFor(d),
              href: routes.destination(locale, d),
            }))}
          />

          <section>
            <div className="section-head">
              <h2>{c.sections.why.heading}</h2>
            </div>
            <div className="grid grid-3">
              {c.sections.why.items.map((item) => (
                <div className="tile" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2>{c.sections.howItWorks.heading}</h2>
            </div>
            <div className="grid grid-3 steps">
              {c.sections.howItWorks.steps.map((step) => (
                <div className="tile" key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          <RegionRail
            locale={locale}
            strings={t}
            regions={regions.map((r) => ({
              id: r.id,
              name: regionName(r, locale),
              note: t.regionalEsims.sub,
              href: routes.region(locale, r.id),
            }))}
          />

          <TravelTools locale={locale} strings={toolStrings(locale)} />

          {guides.length ? (
            <section>
              <div className="section-head">
                <h2>{t.nav.guides}</h2>
              </div>
              <div className="grid grid-2">
                {guides.map((g) => (
                  <a className="tile" key={g.slug} href={routes.guide(locale, g.slug)}>
                    <h3>{g.h1}</h3>
                    <p>{g.metaDescription}</p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <Faq items={c.faq} heading={t.faq} />
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[organizationSchema(), websiteSchema(locale)]} />
    </>
  );
}
