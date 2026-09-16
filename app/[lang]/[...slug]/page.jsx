import { notFound } from 'next/navigation';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import DestinationSearch from '../../../components/DestinationSearch.jsx';
import Cta from '../../../components/Cta.jsx';
import Faq from '../../../components/Faq.jsx';
import JsonLd from '../../../components/JsonLd.jsx';
import PlanPanel from '../../../components/PlanPanel.jsx';
import {
  ui,
  destinationContent,
  publishedDestinationIds,
  publishedGuideSlugs,
  guideContent,
  localesWithDestination,
  localesWithGuide,
  contentLocales,
} from '../../../lib/content/index.js';
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
  hubAlternates,
  breadcrumbSchema,
  faqSchema,
} from '../../../lib/seo.js';
import { listPlans } from '../../../lib/providers/index.js';

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
    const name = regionName(node.region, lang);
    const count = destinationsInRegion(node.region.id).length;
    return buildMetadata({
      title: name + ' eSIM: ' + count + ' destinations covered | Livdar',
      description:
        'Every destination Livdar covers in ' + name + ', with the networks that run each country and the coverage notes that matter.',
      path: routes.region(lang, node.region.id),
      locale: lang,
      alternates: regionAlternates(node.region.id),
    });
  }
  if (node.type === 'regionsHub') {
    return buildMetadata({
      title: t.nav.regions + ' | Livdar eSIM',
      description: 'Regional overviews for every part of the world Livdar covers.',
      path: routes.regionsHub(lang),
      locale: lang,
      alternates: hubAlternates('regions'),
    });
  }
  if (node.type === 'guidesHub') {
    return buildMetadata({
      title: t.nav.guides + ' | Livdar eSIM',
      description: 'Travel connectivity guides: how an eSIM works, installing one, and when you do not need one at all.',
      path: routes.guidesHub(lang),
      locale: lang,
      alternates: hubAlternates('guides'),
    });
  }
  if (node.type === 'compatibility') {
    return buildMetadata({
      title: 'eSIM compatibility: does your phone support it | Livdar',
      description: 'Which phones support eSIM, how to check your own device in ten seconds, and what dual SIM actually changes.',
      path: routes.compatibility(lang),
      locale: lang,
      alternates: hubAlternates('esim'),
      robots: { index: true, follow: true },
    });
  }
  return buildMetadata({
    title: t.nav.esim + ' | Livdar eSIM',
    description: 'Mobile data for over 120 destinations, with the coverage notes and the limitations written down before you buy.',
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
  if (node.type === 'compatibility') return renderCompatibility(lang);
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

/* eSIM hub */

function renderEsimHub(locale) {
  const t = ui(locale);
  const published = publishedDestinationIds(locale);
  const byRegion = REGIONS.filter((r) => r.id !== 'global')
    .map((r) => ({ region: r, items: destinationsInRegion(r.id) }))
    .filter((g) => g.items.length);

  return (
    <>
      <Header locale={locale} alternatePaths={shellAlternates(locale, 'esim')} />
      <main id="main">
        <Crumbs items={[{ name: 'Livdar', path: routes.home(locale) }, { name: t.nav.esim, path: routes.esimHub(locale) }]} />
        <div className="wrap">
          <section className="hero" style={{ paddingBlock: '24px 10px' }}>
            <h1 style={{ fontSize: 'clamp(28px,5.4vw,42px)' }}>{t.nav.esim}</h1>
            <p className="hero-lead">{t.searchHint}</p>
            <DestinationSearch items={searchItems(locale)} strings={t} locale={locale} />
          </section>

          {published.length ? (
            <section>
              <div className="section-head">
                <h2>{t.popularDestinations}</h2>
              </div>
              <div className="grid grid-4">
                {published.map(getDestination).filter(Boolean).map((d) => (
                  <a className="tile dest-tile" key={d.id} href={routes.destination(locale, d)}>
                    <strong>{localizedName(d, locale)}</strong>
                    <span className="code">{d.callingCode}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {byRegion.map((group) => (
            <section key={group.region.id}>
              <div className="section-head">
                <h2>{regionName(group.region, locale)}</h2>
              </div>
              <div className="grid grid-4">
                {group.items.map((d) =>
                  published.includes(d.id) ? (
                    <a className="tile dest-tile" key={d.id} href={routes.destination(locale, d)}>
                      <strong>{localizedName(d, locale)}</strong>
                      <span className="code">{d.callingCode}</span>
                    </a>
                  ) : (
                    <div className="tile dest-tile" key={d.id} style={{ opacity: 0.62 }}>
                      <strong>{localizedName(d, locale)}</strong>
                      <span className="code">{d.callingCode}</span>
                    </div>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer locale={locale} />
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
            <PlanPanel plans={plans} strings={t} locale={locale} destination={dest.id} region={dest.region} />

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
  const name = regionName(region, locale);
  const items = destinationsInRegion(region.id);
  const published = publishedDestinationIds(locale);

  const alt = {};
  contentLocales().forEach((l) => {
    alt[l] = routes.region(l, region.id);
  });

  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: t.nav.regions, path: routes.regionsHub(locale) },
    { name, path: routes.region(locale, region.id) },
  ];

  return (
    <>
      <Header locale={locale} alternatePaths={alt} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <section className="hero" style={{ paddingBlock: '24px 8px' }}>
            <h1 style={{ fontSize: 'clamp(28px,5.4vw,42px)' }}>{name}</h1>
            <p className="hero-lead">
              {items.length} {t.destinationsCount}.
            </p>
          </section>
          <section>
            <div className="grid grid-4">
              {items.map((d) =>
                published.includes(d.id) ? (
                  <a className="tile dest-tile" key={d.id} href={routes.destination(locale, d)}>
                    <strong>{localizedName(d, locale)}</strong>
                    <span className="code">{d.callingCode}</span>
                  </a>
                ) : (
                  <div className="tile dest-tile" key={d.id} style={{ opacity: 0.62 }}>
                    <strong>{localizedName(d, locale)}</strong>
                    <span className="code">{d.callingCode}</span>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs)]} />
    </>
  );
}

function renderRegionsHub(locale) {
  const t = ui(locale);
  const regions = REGIONS.filter((r) => r.id !== 'global');
  return (
    <>
      <Header locale={locale} alternatePaths={shellAlternates(locale, 'regions')} />
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
    </>
  );
}

function renderGuidesHub(locale) {
  const t = ui(locale);
  const guides = publishedGuideSlugs(locale).map((slug) => ({ slug, ...guideContent(locale, slug) }));
  return (
    <>
      <Header locale={locale} alternatePaths={shellAlternates(locale, 'guides')} />
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
    </>
  );
}

/* Compatibility */

const DEVICE_FAMILIES = [
  { name: 'Apple iPhone', detail: 'iPhone XR, XS and every model after it. In the United States, iPhone 14 and later have no SIM tray at all.' },
  { name: 'Samsung Galaxy', detail: 'Galaxy S20 and later, Z Flip and Z Fold, and most A series models from A54 onwards. A handful of regional variants ship without it.' },
  { name: 'Google Pixel', detail: 'Pixel 3 and later, with the exception of some carrier locked variants sold in Asia.' },
  { name: 'Xiaomi', detail: 'Models from 12T Pro and 13 onwards in most markets, with genuine variation between regional versions.' },
  { name: 'Motorola', detail: 'Razr foldables and most current Edge models.' },
];

function renderCompatibility(locale) {
  const t = ui(locale);
  const crumbs = [
    { name: 'Livdar', path: routes.home(locale) },
    { name: t.nav.compatibility, path: routes.compatibility(locale) },
  ];
  return (
    <>
      <Header locale={locale} alternatePaths={shellAlternates(locale, 'esim')} />
      <main id="main">
        <Crumbs items={crumbs} />
        <div className="wrap">
          <article className="article">
            <h1>Does your phone support eSIM</h1>
            <p className="lead">
              There is a ten second check that beats any compatibility list, because it reads your
              actual device rather than a model name that ships in four regional variants.
            </p>
            <h2>The ten second check</h2>
            <p>
              On an iPhone, open Settings, then General, then About, and scroll to Available SIM or
              Digital SIM. If there is an EID number, the phone has an eSIM.
            </p>
            <p>
              On Android, open Settings, then Network and internet, then SIMs, and look for an option
              to add an eSIM or download a SIM instead. If the option exists, so does the hardware.
            </p>
            <div className="callout warn">
              <p>
                <strong>The catch nobody mentions.</strong> A phone bought from a carrier can be
                network locked even when the hardware supports eSIM. Locked phones reject profiles
                from other networks. The hardware check above does not tell you about the lock, and
                only the carrier can remove it.
              </p>
            </div>
            <h2>Device families</h2>
            <ul>
              {DEVICE_FAMILIES.map((d) => (
                <li key={d.name}>
                  <strong>{d.name}</strong>: {d.detail}
                </li>
              ))}
            </ul>
            <h2>What dual SIM actually changes</h2>
            <p>
              Dual SIM means the phone can hold two lines and decide which one does what. In
              practice that means keeping your usual number active for calls and messages while
              mobile data runs on the travel profile, which is the setup almost every traveller
              wants and almost nobody configures correctly on the first try.
            </p>
            <p>
              The step people miss is turning data roaming off on the home line after switching data
              to the travel line. Skipping it is how a phone quietly bills you for both.
            </p>
            <div className="inline-cta">
              <p>{t.searchLabel}</p>
              <Cta label={t.nav.esim} href={routes.esimHub(locale)} position="compat_footer" locale={locale} cluster="compatibility" />
            </div>
          </article>
        </div>
      </main>
      <Footer locale={locale} />
      <JsonLd data={[breadcrumbSchema(crumbs)]} />
    </>
  );
}
