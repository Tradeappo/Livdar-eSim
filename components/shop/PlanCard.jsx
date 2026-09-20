import Image from 'next/image';
import { fallbackGradient, imageFor } from '../../lib/media.js';

// One offer in the shop grid.
//
// The sample marker is rendered here, unconditionally, and there is no prop to
// turn it off. That is deliberate. Every price on this site is illustrative
// while no supplier is connected, and a component that can render a price
// without saying so is a component that will eventually render one.
//
// The photograph is optional by design. Where a destination has no image of its
// own in the manifest, the card falls back to its gradient rather than
// borrowing a photograph of somewhere else.

export default function PlanCard({ plan, label, badge, href, onOpen, priority = false }) {
  const image = imageFor('destination', plan.id);
  const [c1, c2] = fallbackGradient(plan.id);
  const style = { '--c1': c1, '--c2': c2 };

  const body = (
    <>
      {image ? (
        // next/image rather than a plain tag, for the two things that actually
        // matter on a grid of a hundred and eighteen cards: it serves AVIF and
        // WebP to browsers that take them, and the sizes hint below stops a
        // phone downloading a desktop-width file for a card that renders at
        // half the screen. The card already reserves its space through
        // aspect-ratio, so fill cannot shift the layout.
        <Image
          src={image.src}
          alt=""
          fill
          sizes="(min-width: 1000px) 25vw, (min-width: 700px) 33vw, 50vw"
          priority={priority}
          style={{ objectFit: 'cover', objectPosition: image.focus }}
        />
      ) : null}

      <div className="plan-card-top">
        {badge ? <span className="plan-badge">{badge}</span> : null}
        <span className="plan-badge plan-badge-demo">{label.demoBadge}</span>
      </div>

      <div className="plan-card-bottom">
        <div className="plan-title-row">
          <div className="plan-title-wrap">
            <h3>
              <span className="plan-flag" aria-hidden="true">
                {plan.flag}
              </span>
              {plan.name}
            </h3>
            {/* Named as the supplier of the sample, never as a partner. */}
            <div className="plan-supplier">{plan.supplier}</div>
          </div>
          <div className="plan-price-stack">
            <div className="plan-price">{plan.price}</div>
            <span className="plan-view">{label.view}</span>
          </div>
        </div>
        <div className="plan-meta">
          <span>{plan.data}</span>
          <span>{plan.days}</span>
          <span>{plan.network}</span>
        </div>
      </div>
    </>
  );

  // The whole card is one target. A real link where the destination has a page,
  // so the shop feeds the editorial pages rather than trapping the visitor in a
  // grid; a button where it does not, so there is never a link to a 404.
  const accessibleName = plan.name + ', ' + plan.data + ', ' + plan.days + ', ' + label.demoBadge;

  if (href) {
    return (
      <article className="plan-card" style={style}>
        <a href={href} aria-label={accessibleName} onClick={onOpen} style={{ position: 'absolute', inset: 0, zIndex: 3 }} />
        {body}
      </article>
    );
  }

  return (
    <article className="plan-card" style={style}>
      <button
        type="button"
        aria-label={accessibleName}
        onClick={onOpen}
        style={{ position: 'absolute', inset: 0, zIndex: 3, border: 0, background: 'transparent', cursor: 'pointer' }}
      />
      {body}
    </article>
  );
}
