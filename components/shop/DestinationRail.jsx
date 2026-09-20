import { routes } from '../../lib/routes.js';

// Visual entry points into the destinations that actually have a page.
//
// It reads the published list rather than the demo catalogue on purpose. The
// sample grid above it shows a hundred and eighteen countries because that is
// what the shop will eventually carry; this rail shows only what we have
// written, so every row here is a real page with real editorial behind it and
// there is no way for it to link at a 404.

export default function DestinationRail({ locale, strings, destinations }) {
  const t = strings;
  if (!destinations.length) return null;
  return (
    <section className="shop-section" aria-labelledby="dest-rail-heading">
      <div className="shop-section-head">
        <div>
          <h2 id="dest-rail-heading">{t.shopByDestination.title}</h2>
          <p>{t.shopByDestination.sub}</p>
        </div>
        <a className="shop-pill" href={routes.esimHub(locale)}>
          {t.allDestinations}
        </a>
      </div>
      <div className="dest-rail">
        {destinations.map((d) => (
          <a key={d.id} className="dest-row" href={d.href}>
            <span className="dest-row-flag" aria-hidden="true">
              {d.flag}
            </span>
            <span>
              <strong>{d.name}</strong>
              <span>{t.viewPlans}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
