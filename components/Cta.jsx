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

  const params = () =>
    Object.assign(baseParams({ locale, destination, region, cluster }), {
      cta_label: label,
      cta_position: position || null,
    });

  if (href) {
    // The event has to survive the navigation it describes.
    //
    // Pushing to the dataLayer and letting the link navigate measures nothing:
    // the browser tears the document down as soon as the handler returns, and
    // the tag never gets to send the hit. Measured on the live domain after the
    // cutover: clicking the hero call to action produced two page_view hits and
    // no cta_click at all. Six of the seven calls to action on this site carry
    // an href, so the entire cta_click funnel step was empty while the code
    // looked correct and the dataLayer looked correct.
    //
    // Same fix as the language selector: hold the navigation until the tag
    // reports back, with a hard timeout behind it. The timeout is not optional.
    // When consent is denied, or the container is blocked, eventCallback never
    // runs, and without the timeout the link would simply stop working.
    const onClick = (e) => {
      // A modified click is the reader asking for a new tab or a download. Let
      // the browser do its job and fire the event alongside it, because there
      // is no navigation here to race against.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        pushEvent(event, params());
        return;
      }
      e.preventDefault();
      let gone = false;
      const go = () => {
        if (gone) return;
        gone = true;
        window.location.href = href;
      };
      pushEvent(event, Object.assign(params(), { eventCallback: go, eventTimeout: 600 }));
      window.setTimeout(go, 650);
    };

    return (
      <a className={className} href={href} onClick={onClick}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={() => pushEvent(event, params())}>
      {label}
    </button>
  );
}
