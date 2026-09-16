'use client';

import { useEffect, useRef, useState } from 'react';
import { pushEvent, EVENTS } from '../lib/analytics.js';

// Compact globe. Tap target is 36px tall, the menu closes on outside click and
// on Escape, and every entry is a real link so it works without JavaScript too.
// Where the exact page does not exist in a language, the link already points at
// that language's eSIM hub, so this never produces a 404.

export default function LanguageGlobe({ current, options, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="globe" ref={ref}>
      <button
        type="button"
        className="globe-button"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span className="globe-code">{current}</span>
      </button>
      {open ? (
        <div className="globe-menu" role="menu">
          <ul>
            {options.map((o) => (
              <li key={o.code}>
                <a
                  href={o.href}
                  role="menuitem"
                  aria-current={o.code === current ? 'true' : undefined}
                  onClick={() =>
                    pushEvent(EVENTS.languageChange, { from_language: current, to_language: o.code })
                  }
                >
                  <span>{o.name}</span>
                  <span className="endonym">{o.endonym}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3c2.4 2.5 3.6 5.6 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.6-3.6-9S9.6 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
