import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import DestinationSearch from '../../components/DestinationSearch.jsx';
import Cta from '../../components/Cta.jsx';
import Faq from '../../components/Faq.jsx';
import JsonLd from '../../components/JsonLd.jsx';
import { ui, homeContent, publishedDestinationIds, publishedGuideSlugs, guideContent } from '../../lib/content/index.js';
import { DESTINATIONS, REGIONS, localizedName, destinationSlug, regionName, getDestination } from '../../lib/destinations.js';
import { routes } from '../../lib/routes.js';
import { buildMetadata, homeAlternates, organizationSchema, websiteSchema } from '../../lib/seo.js';
import { contentLocales } from '../../lib/content/index.js';

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
  const regions = REGIONS.filter((r) => r.id !== 'global').slice(0, 8);
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

          <section>
            <div className="section-head">
              <h2>{t.popularDestinations}</h2>
            </div>
            <div className="grid grid-4">
              {popular.map((d) => (
                <a className="tile dest-tile" key={d.id} href={routes.destination(locale, d)}>
                  <strong>{localizedName(d, locale)}</strong>
                  <span className="code">{d.callingCode}</span>
                </a>
              ))}
            </div>
            <p style={{ marginTop: 14 }}>
              <a href={routes.esimHub(locale)} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {t.allDestinations}
              </a>
            </p>
          </section>

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

          <section>
            <div className="section-head">
              <h2>{t.regionalPlans}</h2>
            </div>
            <div className="grid grid-4">
              {regions.map((r) => (
                <a className="tile dest-tile" key={r.id} href={routes.region(locale, r.id)}>
                  <strong>{regionName(r, locale)}</strong>
                </a>
              ))}
            </div>
          </section>

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
