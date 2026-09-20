import { notFound } from 'next/navigation';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import DestinationSearch from '../../../components/DestinationSearch.jsx';
import Cta from '../../../components/Cta.jsx';
import Faq from '../../../components/Faq.jsx';
import JsonLd from '../../../components/JsonLd.jsx';
import PlanShop from '../../../components/PlanShop.jsx';
import ViewDestination from '../../../components/ViewDestination.jsx';
import ShopBrowser from '../../../components/shop/ShopBrowser.jsx';
import BuySteps from '../../../components/shop/BuySteps.jsx';
import {
  ui,
  destinationContent,
  publishedDestinationIds,
  publishedGuideSlugs,
  publishedRegionIds,
  localesWithRegion,
  localesWithCompatibility,
  localesWithLegal,
  guideContent,
  localesWithDestination,
  localesWithGuide,
  contentLocales,
} from '../../../lib/content/index.js';
import { shopStrings } from '../../../lib/content/ui.js';
import {
  DESTINATIONS,
  REGIONS,
  localizedName,
  regionName,
  destinationsInRegion,
  getDestination,
  getRegion,
} from '../../../lib/destinations.js';
import { routes } from '../../../lib/routes.js';
import { resolvePath, allPathsForLocale } from '../../../lib/resolve.js';
import {
  buildMetadata,
  destinationAlternates,
  guideAlternates,
  regionAlternates,
  compatibilityAlternates,
  legalAlternates,
  hubAlternates,
  breadcrumbSchema,
  faqSchema,
  collectionPageSchema,
} from '../../../lib/seo.js';
import { listPlans, providerIsConnected } from '../../../lib/providers/index.js';
import V41Marketplace from '../../../components/V41Marketplace.jsx';
import V41SeoContent from '../../../components/V41SeoContent.jsx';

export const dynamicParams = false;

export function generateStaticParams() {
  const out = [];
  contentLocales().forEach((lang) => {
    allPathsForLocale(lang).forEach((slug) => out.push({ lang, slug }));
  });
  return out;
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const node = resolvePath(lang, slug);
  if (!node) return {};
  const t = ui(lang);

  if (node.type === 'destination') {
    const c = destinationContent(lang, node.destination.id);
    return buildMetadata({
      title: c.title,
      description: c.metaDescription,
      path: routes.destination(lang, node.destination),
      locale: lang,
      alternates: destinationAlternates(node.destination.id),
      type: 'article',
    });
  }
  if (node.type === 'guide') {
    return buildMetadata({
      title: node.guide.title,
      description: node.guide.metaDescription,
      path: routes.guide(lang, node.slug),
      locale: lang,
      alternates: guideAlternates(node.slug),
      type: 'article',
    });
  }
  if (node.type === 'region') {
    const c = node.content;
    return buildMetadata({
      title: c.title,
      description: c.metaDescription,
      path: routes.region(lang, node.region.id),
      locale: lang,
      alternates: regionAlternates(node.region.id),
    });
  }
  if (node.type === 'regionsHub') {
    return buildMetadata({
      title: t.nav.regions + ' | Livdar eSIM',
      description: t.hubMeta.regions,
      path: routes.regionsHub(lang),
      locale: lang,
      alternates: hubAlternates('regions'),
    });
  }
  if (node.type === 'guidesHub') {
    return buildMetadata({
      title: t.nav.guides + ' | Livdar eSIM',
      description: t.hubMeta.guides,
      path: routes.guidesHub(lang),
      locale: lang,
      alternates: hubAlternates('guides'),
    });
  }
  if (node.type === 'legal') {
    const c = node.content;
    return buildMetadata({
      title: c.title,
      description: c.metaDescription,
      path: routes[node.kind](lang),
      locale: lang,
      alternates: legalAlternates(node.kind),
    });
  }
  if (node.type === 'compatibility') {
    return buildMetadata({
      title: node.content.title,
      description: node.content.metaDescription,
      path: routes.compatibility(lang),
      locale: lang,
      alternates: compatibilityAlternates(),
    });
  }
  return buildMetadata({
    title: t.nav.esim + ' | Livdar eSIM',
    description: t.hubMeta.esim,
    path: routes.esimHub(lang),
    locale: lang,
    alternates: hubAlternates('esim'),
  });
}

export default async function CatchAllPage({ params }) {
  const { lang, slug } = await params;
  const node = resolvePath(lang, slug);
  if (!node) notFound();

  if (node.type === 'destination') return renderDestination(lang, node);
  if (node.type === 'guide') return renderGuide(lang, node);
  if (node.type === 'region') return renderRegion(lang, node);
  if (node.type === 'regionsHub') return renderRegionsHub(lang);
  if (node.type === 'guidesHub') return renderGuidesHub(lang);
  if (node.type === 'compatibility') return renderCompatibility(lang, node);
  if (node.type === 'legal') return renderLegal(lang, node);
  return renderEsimHub(lang);
}

function shellAlternates(locale, kind) {
  const out = {};
  contentLocales().forEach((l) => {
    out[l] = kind === 'guides' ? routes.guidesHub(l) : kind === 'regions' ? routes.regionsHub(l) : routes.esimHub(l);
  });
  return out;
}

function Crumbs({ items }) {
  return (
    <nav className="crumbs wrap" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <span key={c.path}>
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {i === items.length - 1 ? <span>{c.name}</span> : <a href={c.path}>{c.name}</a>}
        </span>
      ))}
    </nav>
  );
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

// Which sample rows can link through to an editorial page in this market.
//
// The shop carries every country the catalogue will eventually cover; only some
// of them have been written. This map is what keeps the two apart: a row with
// an entry here opens the real page, a row without one opens the detail sheet
// and goes no further. There is no branch that produces a link to a page that
// was never published, which is the same rule the language selector follows.
function destinationHrefs(locale) {
  const out = {};
  publishedDestinationIds(locale).forEach((id) => {
    const dest = getDestination(id);
    if (dest) out[id] = routes.destination(locale, dest);
  });
  return out;
}

/* eSIM hub */

function renderEsimHub(locale) {
  const t = ui(locale);
  const published = publishedDestinationIds(locale);
  const byRegion = REGIONS.filter((r) => r.id !== 'global')
    .map((r) => ({ region: r, items: destinationsInRegion(r.id) }))
    .filter((g) => g.items.length);

  return (
    <>
      <V41Marketplace locale={locale} h1={t.nav.esim}>
        <V41SeoContent locale={locale} />
      </V41Marketplace>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Livdar', path: routes.home(locale) }, { name: t.nav.esim, path: routes.esimHub(locale) }]),
          collectionPageSchema({
            name: t.nav.esim,
            description: t.hubMeta.esim,
            path: routes.esimHub(locale),
            locale,
            items: published.map(getDestination).filter(Boolean).map((d) => ({
              name: localizedName(d, locale),
              path: routes.destination(locale, d),
            })),
          }),
        ]}
      />
    </>
  );
}

/* Destination */

async function renderDestination(locale, node) {
  const t = ui(locale);
  const dest = node.destination;
  const c = destinationContent(locale, dest.id);
  const name = localizedName(dest, locale);
  const region = getRegion(dest.region);
  const plans = await listPlans({ destinationId: dest.id, locale });

  const alt = {};
  localesWithDestination(dest.id).forEach((l) => {
    alt[l] = routes.destination(l, dest);
  });
  contentLocales().forEach((l) => {
    if (!alt[l]) alt[l] = routes.esimHub(l);
  });

  const order = c.sectionOrder || Object.keys(c.sections);
  const related = destinationsInRegion(dest.region)
    .filter((d) => d.id !== dest.id && publishedDestinationIds(locale).includes(d.id))
    .slice(0, 6);

  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: t.nav.esim, path: routes.esimHub(locale) },
    { name, path: routes.destination(locale, dest) },
  ];

  const bodySections = order.filter((k) => k !== 'intro' && k !== 'faq' && c.sections[k]);
  const midpoint = Math.max(1, Math.ceil(bodySections.length / 2));

  return (
    <>
      <Header locale={locale} alternatePaths={alt} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <article className="article">
            <h1>{c.h1}</h1>

            <dl className="factbar">
              <div>
                <dt>{t.callingCode}</dt>
                <dd>{dest.callingCode}</dd>
              </div>
              <div>
                <dt>{t.regionLabel}</dt>
                <dd>{regionName(region, locale)}</dd>
              </div>
              <div>
                <dt>{t.networksLabel}</dt>
                <dd>{dest.networks.join(', ')}</dd>
              </div>
            </dl>

            {(c.intro || []).map((p, i) => (
              <p key={i} className={i === 0 ? 'lead' : undefined}>
                {p}
              </p>
            ))}

            <div className="inline-cta">
              <p>{t.notConnectedTitle}</p>
              <Cta
                label={t.checkAvailability}
                event="check_availability"
                position="after_intro"
                locale={locale}
                destination={dest.id}
                region={dest.region}
                cluster="destination"
              />
            </div>

            {bodySections.slice(0, midpoint).map((key) => (
              <Section key={key} data={c.sections[key]} />
            ))}

            <h2>{t.viewPlans}</h2>
            <ViewDestination locale={locale} destination={dest.id} region={dest.region} />
            <PlanShop
              plans={plans}
              strings={t}
              locale={locale}
              destination={dest.id}
              region={dest.region}
              connected={providerIsConnected()}
            />

            {bodySections.slice(midpoint).map((key) => (
              <Section key={key} data={c.sections[key]} />
            ))}

            <div className="inline-cta">
              <p>{t.seeConnectivity}</p>
              <Cta
                label={t.compareOptions}
                href={routes.guide(locale, 'esim-vs-roaming')}
                position="after_body"
                locale={locale}
                destination={dest.id}
                cluster="destination"
                variant="ghost"
              />
            </div>

            <Faq items={c.faq} heading={t.faq} />

            {related.length ? (
              <section>
                <div className="section-head">
                  <h2>{t.relatedDestinations}</h2>
                </div>
                <div className="grid grid-3">
                  {related.map((d) => (
                    <a className="tile dest-tile" key={d.id} href={routes.destination(locale, d)}>
                      <strong>{localizedName(d, locale)}</strong>
                      <span className="code">{d.callingCode}</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <p style={{ marginTop: 26 }}>
              <a href={routes.esimHub(locale)} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {t.backToHub}
              </a>
            </p>
          </article>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs), faqSchema(c.faq)]} />
    </>
  );
}

function Section({ data }) {
  if (!data) return null;
  return (
    <>
      <h2>{data.heading}</h2>
      {(data.body || []).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {data.list ? (
        <ul>
          {data.list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

/* Guide */

function renderGuide(locale, node) {
  const t = ui(locale);
  const g = node.guide;
  const alt = {};
  localesWithGuide(node.slug).forEach((l) => {
    alt[l] = routes.guide(l, node.slug);
  });
  contentLocales().forEach((l) => {
    if (!alt[l]) alt[l] = routes.guidesHub(l);
  });

  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: t.nav.guides, path: routes.guidesHub(locale) },
    { name: g.h1, path: routes.guide(locale, node.slug) },
  ];

  return (
    <>
      <Header locale={locale} alternatePaths={alt} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <article className="article">
            <h1>{g.h1}</h1>
            {(g.intro || []).map((p, i) => (
              <p key={i} className={i === 0 ? 'lead' : undefined}>
                {p}
              </p>
            ))}
            {(g.sectionOrder || Object.keys(g.sections || {}))
              .filter((key) => (g.sections || {})[key])
              .map((key) => (
                <Section key={key} data={g.sections[key]} />
              ))}
            <div className="inline-cta">
              <p>{t.searchLabel}</p>
              <Cta
                label={t.nav.esim}
                href={routes.esimHub(locale)}
                position="guide_footer"
                locale={locale}
                cluster={g.cluster}
              />
            </div>
            <Faq items={g.faq} heading={t.faq} />
          </article>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs), faqSchema(g.faq)]} />
    </>
  );
}

/* Region */

function renderRegion(locale, node) {
  const t = ui(locale);
  const region = node.region;
  const c = node.content;
  const name = regionName(region, locale);
  const items = destinationsInRegion(region.id);
  const published = publishedDestinationIds(locale);
  const live = items.filter((d) => published.includes(d.id));
  const rest = items.filter((d) => !published.includes(d.id));

  const alt = {};
  localesWithRegion(region.id).forEach((l) => {
    alt[l] = routes.region(l, region.id);
  });
  contentLocales().forEach((l) => {
    if (!alt[l]) alt[l] = routes.regionsHub(l);
  });

  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: t.nav.regions, path: routes.regionsHub(locale) },
    { name, path: routes.region(locale, region.id) },
  ];

  const order = (c.sectionOrder || Object.keys(c.sections || {})).filter(
    (key) => (c.sections || {})[key]
  );

  return (
    <>
      <Header locale={locale} alternatePaths={alt} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <section className="hero" style={{ paddingBlock: '24px 8px' }}>
            <p className="kicker">{c.angle}</p>
            <h1 style={{ fontSize: 'clamp(28px,5.4vw,42px)' }}>{c.h1}</h1>
            {(c.intro || []).map((p, i) => (
              <p key={i} className={i === 0 ? 'hero-lead' : undefined}>
                {p}
              </p>
            ))}
          </section>

          <section className="section-head">
            <h2>{t.regionDestinationsHeading.replace('{count}', items.length).replace('{name}', name)}</h2>
          </section>
          <section>
            <div className="grid grid-4">
              {live.map((d) => (
                <a className="tile dest-tile" key={d.id} href={routes.destination(locale, d)}>
                  <strong>{localizedName(d, locale)}</strong>
                  <span className="code">{d.callingCode}</span>
                </a>
              ))}
              {rest.map((d) => (
                <div className="tile dest-tile" key={d.id} style={{ opacity: 0.62 }}>
                  <strong>{localizedName(d, locale)}</strong>
                  <span className="code">{d.callingCode}</span>
                </div>
              ))}
            </div>
          </section>

          <article className="article">
            {order.map((key) => (
              <Section key={key} data={c.sections[key]} />
            ))}
            <div className="inline-cta">
              <p>{t.searchLabel}</p>
              <Cta
                label={t.nav.esim}
                href={routes.esimHub(locale)}
                position="region_footer"
                locale={locale}
                region={region.id}
                cluster="regional"
              />
            </div>
            <Faq items={c.faq} heading={t.faq} />
          </article>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs), faqSchema(c.faq)]} />
    </>
  );
}

function renderRegionsHub(locale) {
  const t = ui(locale);
  const regions = REGIONS.filter((r) => r.id !== 'global');
  return (
    <>
      <Header locale={locale} alternatePaths={shellAlternates(locale, 'regions')} section="regions" />
      <main id="main">
        <Crumbs items={[{ name: 'Livdar', path: routes.home(locale) }, { name: t.nav.regions, path: routes.regionsHub(locale) }]} />
        <div className="wrap">
          <section className="hero" style={{ paddingBlock: '24px 8px' }}>
            <h1 style={{ fontSize: 'clamp(28px,5.4vw,42px)' }}>{t.nav.regions}</h1>
          </section>
          <section>
            <div className="grid grid-3">
              {regions.map((r) => (
                <a className="tile" key={r.id} href={routes.region(locale, r.id)}>
                  <h3>{regionName(r, locale)}</h3>
                  <p>
                    {destinationsInRegion(r.id).length} {t.destinationsCount}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Livdar', path: routes.home(locale) }, { name: t.nav.regions, path: routes.regionsHub(locale) }]),
          collectionPageSchema({
            name: t.nav.regions,
            description: t.hubMeta.regions,
            path: routes.regionsHub(locale),
            locale,
            items: regions
              .filter((r) => publishedRegionIds(locale).includes(r.id))
              .map((r) => ({ name: regionName(r, locale), path: routes.region(locale, r.id) })),
          }),
        ]}
      />
    </>
  );
}

function renderGuidesHub(locale) {
  const t = ui(locale);
  const guides = publishedGuideSlugs(locale).map((slug) => ({ slug, ...guideContent(locale, slug) }));
  return (
    <>
      <Header locale={locale} alternatePaths={shellAlternates(locale, 'guides')} section="guides" />
      <main id="main">
        <Crumbs items={[{ name: 'Livdar', path: routes.home(locale) }, { name: t.nav.guides, path: routes.guidesHub(locale) }]} />
        <div className="wrap">
          <section className="hero" style={{ paddingBlock: '24px 8px' }}>
            <h1 style={{ fontSize: 'clamp(28px,5.4vw,42px)' }}>{t.nav.guides}</h1>
          </section>
          <section>
            <div className="grid grid-2">
              {guides.map((g) => (
                <a className="tile" key={g.slug} href={routes.guide(locale, g.slug)}>
                  <h3>{g.h1}</h3>
                  <p>{g.metaDescription}</p>
                  <span className="meta">{g.cluster}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Livdar', path: routes.home(locale) }, { name: t.nav.guides, path: routes.guidesHub(locale) }]),
          collectionPageSchema({
            name: t.nav.guides,
            description: t.hubMeta.guides,
            path: routes.guidesHub(locale),
            locale,
            items: guides.map((g) => ({ name: g.h1, path: routes.guide(locale, g.slug) })),
          }),
        ]}
      />
    </>
  );
}

/* Compatibility */

function renderLegal(locale, node) {
  const t = ui(locale);
  const c = node.content;

  const alt = {};
  localesWithLegal(node.kind).forEach((l) => {
    alt[l] = routes[node.kind](l);
  });

  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: c.h1, path: routes[node.kind](locale) },
  ];

  const order = (c.sectionOrder || Object.keys(c.sections || {})).filter(
    (key) => (c.sections || {})[key]
  );

  return (
    <>
      <Header locale={locale} alternatePaths={alt} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <article className="article">
            <p className="kicker">{c.angle}</p>
            <h1>{c.h1}</h1>
            {(c.intro || []).map((p, i) => (
              <p key={i} className={i === 0 ? 'lead' : undefined}>
                {p}
              </p>
            ))}
            {order.map((key) => (
              <Section key={key} data={c.sections[key]} />
            ))}
            <Faq items={c.faq} heading={t.faq} />
          </article>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs)]} />
    </>
  );
}

function renderCompatibility(locale, node) {
  const t = ui(locale);
  const c = node.content;

  const alt = {};
  localesWithCompatibility().forEach((l) => {
    alt[l] = routes.compatibility(l);
  });

  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: t.nav.compatibility, path: routes.compatibility(locale) },
  ];

  const order = (c.sectionOrder || Object.keys(c.sections || {})).filter(
    (key) => (c.sections || {})[key]
  );

  return (
    <>
      <Header locale={locale} alternatePaths={alt} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <article className="article">
            <p className="kicker">{c.angle}</p>
            <h1>{c.h1}</h1>
            {(c.intro || []).map((p, i) => (
              <p key={i} className={i === 0 ? 'lead' : undefined}>
                {p}
              </p>
            ))}
            {order.map((key) => (
              <Section key={key} data={c.sections[key]} />
            ))}
            <div className="inline-cta">
              <p>{t.searchLabel}</p>
              <Cta
                label={t.nav.esim}
                href={routes.esimHub(locale)}
                position="compat_footer"
                locale={locale}
                cluster="device"
              />
            </div>
            <Faq items={c.faq} heading={t.faq} />
          </article>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs), faqSchema(c.faq)]} />
    </>
  );
}
