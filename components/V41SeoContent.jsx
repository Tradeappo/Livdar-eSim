import Faq from './Faq.jsx';
import {
  guideContent,
  homeContent,
  publishedDestinationIds,
  publishedGuideSlugs,
  publishedRegionIds,
  ui,
} from '../lib/content/index.js';
import {
  flagFor,
  getDestination,
  getRegion,
  localizedName,
  regionName,
} from '../lib/destinations.js';
import { routes } from '../lib/routes.js';
import { hubDirectory } from '../lib/internal-links.js';

function LinkGrid({ items }) {
  if (!items.length) return null;
  return (
    <div className="seo-link-grid">
      {items.map((item) => (
        <a className="seo-link-card" href={item.href} key={item.href}>
          {item.flag ? <span className="seo-link-flag" aria-hidden="true">{item.flag}</span> : null}
          <span>
            <strong>{item.title}</strong>
            {item.description ? <small>{item.description}</small> : null}
          </span>
          <span className="seo-link-arrow" aria-hidden="true">›</span>
        </a>
      ))}
    </div>
  );
}

// `directory` is the eSIM hub variant. Search Console reported the hub as
// "Crawled - currently not indexed", and its main content was a subset of the
// home page (same marketplace, same destination grid, same region grid). The
// hub now groups destinations by region and describes each one with that
// page's own meta description, so the page says something the home page does
// not. The home page keeps the generic grid it had.
export default function V41SeoContent({ locale, includeEditorial = false, directory = false }) {
  const c = homeContent(locale);
  const t = ui(locale);
  const destinations = publishedDestinationIds(locale)
    .map(getDestination)
    .filter(Boolean)
    .map((destination) => ({
      title: localizedName(destination, locale),
      flag: flagFor(destination),
      href: routes.destination(locale, destination),
      description: t.viewPlans,
    }));
  const regions = publishedRegionIds(locale)
    .map(getRegion)
    .filter(Boolean)
    .map((region) => ({
      title: regionName(region, locale),
      href: routes.region(locale, region.id),
      description: t.regionalEsims.sub,
    }));
  const groups = directory ? hubDirectory(locale) : [];
  const guides = publishedGuideSlugs(locale).map((slug) => {
    const guide = guideContent(locale, slug);
    return {
      title: guide.h1,
      description: guide.metaDescription,
      href: routes.guide(locale, slug),
    };
  });

  return (
    <div className="v41-seo-content">
      {includeEditorial ? (
        <>
          <section className="wrap section" aria-labelledby="why-livdar-heading">
            <div className="section-head">
              <div><h2 id="why-livdar-heading">{c.sections.why.heading}</h2></div>
            </div>
            <div className="seo-copy-grid">
              {c.sections.why.items.map((item) => (
                <article className="seo-copy-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="wrap section" aria-labelledby="seo-how-heading">
            <div className="section-head">
              <div><h2 id="seo-how-heading">{c.sections.howItWorks.heading}</h2></div>
            </div>
            <div className="seo-copy-grid seo-steps">
              {c.sections.howItWorks.steps.map((step, index) => (
                <article className="seo-copy-card" key={step.title}>
                  <span className="seo-step-number" aria-hidden="true">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section className="wrap section" aria-labelledby="seo-destinations-heading">
        <div className="section-head">
          <div>
            <h2 id="seo-destinations-heading">{t.shopByDestination.title}</h2>
            <p>{t.shopByDestination.sub}</p>
          </div>
          {directory ? null : <a href={routes.esimHub(locale)}>{t.allDestinations}</a>}
        </div>
        {directory ? (
          groups.map((group) => (
            <div className="seo-directory-group" key={group.id}>
              <h3 id={'hub-region-' + group.id}>
                {group.href ? <a href={group.href}>{group.title}</a> : group.title}
              </h3>
              <LinkGrid items={group.items} />
            </div>
          ))
        ) : (
          <LinkGrid items={destinations} />
        )}
      </section>

      <section className="wrap section" aria-labelledby="seo-regions-heading">
        <div className="section-head">
          <div>
            <h2 id="seo-regions-heading">{t.regionalEsims.title}</h2>
            <p>{t.regionalEsims.sub}</p>
          </div>
          <a href={routes.regionsHub(locale)}>{t.nav.regions}</a>
        </div>
        <LinkGrid items={regions} />
      </section>

      {includeEditorial && guides.length ? (
        <section className="wrap section" id="seo-guides" aria-labelledby="seo-guides-heading">
          <div className="section-head">
            <div><h2 id="seo-guides-heading">{t.nav.guides}</h2></div>
            <a href={routes.guidesHub(locale)}>{t.nav.guides}</a>
          </div>
          <LinkGrid items={guides} />
        </section>
      ) : null}

      {includeEditorial ? (
        <section className="wrap section v41-faq">
          <Faq items={c.faq} heading={t.faq} />
        </section>
      ) : null}
    </div>
  );
}
