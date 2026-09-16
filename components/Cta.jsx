'use client';

import { pushEvent, EVENTS, baseParams } from '../lib/analytics.js';

// Every call to action is instrumented. While no supplier is connected the
// intent signal is the product, so an untracked button is a wasted one.

export default function Cta({
  label,
  href,
  event = EVENTS.ctaClick,
  position,
  locale,
  destination,
  region,
  cluster,
  variant = 'primary',
  block = false,
}) {
  const className =
    'btn ' + (variant === 'primary' ? 'btn-primary' : 'btn-ghost') + (block ? ' btn-block' : '');

  const fire = () => {
    pushEvent(
      event,
      Object.assign(baseParams({ locale, destination, region, cluster }), {
        cta_label: label,
        cta_position: position || null,
      })
    );
  };

  if (href) {
    return (
      <a className={className} href={href} onClick={fire}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={fire}>
      {label}
    </button>
  );
}
