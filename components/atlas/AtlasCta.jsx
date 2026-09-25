'use client';

// A call to action on a data page.
//
// The design brief for this was short and it rules out most of what a marketing
// block usually is: it has to look like the rest of Livdar, work on a phone
// first, read as one clear step rather than a panel of options, and not be a
// giant box. So it is a pill and a line of supporting text, at the width of the
// prose it interrupts, and there are exactly two of them on a page.
//
// The click has to survive the navigation it describes. Pushing to the dataLayer
// and letting the link go measures nothing: the browser tears the document down
// as soon as the handler returns and the tag never sends the hit. That was
// measured on this site once already, on the eSIM side, where six of seven calls
// to action carried an href and the whole cta_click step was empty while the
// code and the dataLayer both looked correct. The fix is the same one: hold the
// navigation until the tag reports back, with a hard timeout behind it, because
// when consent is denied eventCallback never runs and without the timeout the
// link would simply stop working.

import { pushEvent, EVENTS, atlasParams, ctaParams } from '../../lib/analytics.js';

const isExternal = (href) => /^https?:\/\//.test(href || '');
const isAnchor = (href) => (href || '').startsWith('#');

export function eventFor(cta) {
  if (isExternal(cta.href)) return EVENTS.outboundClick;
  if (isAnchor(cta.href)) return EVENTS.toolStart;
  return EVENTS.internalCtaClick;
}

export default function AtlasCta({ cta, dims, position, variant = 'primary' }) {
  if (!cta || !cta.href) return null;
  const params = () => ({ ...dims, ...ctaParams(cta, position) });

  const onClick = (e) => {
    // Every call to action pushes cta_click, because that is the step the
    // experiment counts, and a second event that says what kind of click it was.
    // Two events rather than one parameter so a report can separate leaving the
    // site from going deeper into it without a filter.
    const also = eventFor(cta);
    if (isAnchor(cta.href)) {
      pushEvent(EVENTS.ctaClick, params());
      pushEvent(also, params());
      return; // the browser scrolls, nothing is torn down
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      pushEvent(EVENTS.ctaClick, params());
      pushEvent(also, params());
      return;
    }
    e.preventDefault();
    let gone = false;
    const go = () => { if (gone) return; gone = true; window.location.href = cta.href; };
    pushEvent(also, params());
    pushEvent(EVENTS.ctaClick, Object.assign(params(), { eventCallback: go, eventTimeout: 600 }));
    window.setTimeout(go, 650);
  };

  return (
    <div className={'atlas-cta atlas-cta-' + variant}>
      <a
        className={'btn ' + (variant === 'primary' ? 'btn-primary' : 'btn-ghost')}
        href={cta.href}
        data-cta={cta.kind}
        data-cta-position={position}
        onClick={onClick}
      >
        {cta.label}
      </a>
      {cta.note ? <p className="atlas-cta-note">{cta.note}</p> : null}
    </div>
  );
}

// Both calls to action in one place, so the two positions on a page are rendered
// by the same component and cannot drift into two different shapes.
export function AtlasCtaPair({ cta, model, position }) {
  if (!cta || !cta.primary) return null;
  const dims = atlasParams(model);
  return (
    <div className="atlas-cta-pair" data-position={position}>
      <AtlasCta cta={cta.primary} dims={dims} position={position} variant="primary" />
      {cta.secondary ? <AtlasCta cta={cta.secondary} dims={dims} position={position} variant="secondary" /> : null}
    </div>
  );
}
