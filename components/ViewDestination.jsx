'use client';

import { useEffect, useRef } from 'react';
import { pushEvent, EVENTS, baseParams } from '../lib/analytics.js';

// Fires view_destination once per destination page view.
//
// The event was declared in the analytics module from the start but nothing
// ever fired it, so GA4 could only segment destination interest by page path.
// This makes the destination, its region and its market first class parameters
// on an event of its own, which is what the reporting needs in order to answer
// "which destinations do people actually want" before anything is on sale.

export default function ViewDestination({ locale, destination, region }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    pushEvent(
      EVENTS.viewDestination,
      baseParams({ locale, destination, region, cluster: 'destination' })
    );
  }, [locale, destination, region]);

  return null;
}
