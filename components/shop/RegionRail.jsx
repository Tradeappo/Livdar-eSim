import Image from 'next/image';
import { routes } from '../../lib/routes.js';
import { fallbackGradient, imageFor } from '../../lib/media.js';

// Regional entry points. Same rule as the destination rail: only regions that
// have a published page in this market appear, so the rail is generated from
// the content registry rather than from a hand written list.

export default function RegionRail({ locale, strings, regions }) {
  const t = strings;
  if (!regions.length) return null;
  return (
    <section className="shop-section" aria-labelledby="region-rail-heading">
      <div className="shop-section-head">
        <div>
          <h2 id="region-rail-heading">{t.regionalEsims.title}</h2>
          <p>{t.regionalEsims.sub}</p>
        </div>
        <a className="shop-pill" href={routes.regionsHub(locale)}>
          {t.nav.regions}
        </a>
      </div>
      <div className="region-rail">
        {regions.map((r) => {
          const image = imageFor('region', r.id);
          const [c1, c2] = fallbackGradient(r.id);
          return (
            <a key={r.id} className="region-card" href={r.href} style={{ '--c1': c1, '--c2': c2 }}>
              {image ? (
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(min-width: 760px) 50vw, 100vw"
                  style={{ objectFit: 'cover', objectPosition: image.focus }}
                />
              ) : null}
              <span className="region-copy">
                <strong>{r.name}</strong>
                <span>{r.note}</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
