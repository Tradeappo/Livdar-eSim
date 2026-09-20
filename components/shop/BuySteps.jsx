import { routes } from '../../lib/routes.js';

// How buying works, in three steps. Server rendered: it is editorial content
// that a crawler and a reader with JavaScript off should both get.
//
// The third step says activation opens when a supplier is connected rather than
// promising a checkout, because there is no checkout and writing one into the
// steps would be the same fabrication as writing one into a price.

const TINTS = [
  { '--tint': '#fff7fa', '--tint-strong': '#ffd7e0', '--tint-ink': '#df456e' },
  { '--tint': '#f5f9ff', '--tint-strong': '#d7e6ff', '--tint-ink': '#2f66c7' },
  { '--tint': '#f4fbf7', '--tint-strong': '#cdefdd', '--tint-ink': '#1d8a5a' },
];

export default function BuySteps({ locale, strings }) {
  const t = strings;
  return (
    <section className="shop-section" aria-labelledby="buy-steps-heading">
      <div className="shop-section-head">
        <div>
          <h2 id="buy-steps-heading">{t.buySteps.title}</h2>
          <p>{t.buySteps.sub}</p>
        </div>
        <a className="shop-pill" href={routes.guide(locale, 'how-esim-works')}>
          {t.buySteps.link}
        </a>
      </div>
      <ol className="buy-steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {t.buySteps.steps.map((step, i) => (
          <li key={step.title} className="buy-step" style={TINTS[i % TINTS.length]}>
            <span className="buy-step-no" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
