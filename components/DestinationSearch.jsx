'use client';

import { useMemo, useRef, useState } from 'react';
import { pushEvent, EVENTS, baseParams } from '../lib/analytics.js';

// Destination search. Matches on the localised name, the English name and the
// dialling code, so someone typing Tuerkei, Turkey or +90 lands in the same
// place. Keyboard first: arrow keys move, Enter opens, Escape closes.

function normalise(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export default function DestinationSearch({ items, strings, locale, autoFocus = false }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const tracked = useRef('');
  // Whether the tag has confirmed it sent the last search event, and the
  // navigation that is waiting on that confirmation.
  const sent = useRef(true);
  const leaving = useRef(false);

  const results = useMemo(() => {
    const needle = normalise(q).trim();
    if (needle.length < 1) return [];
    return items
      .filter((it) => {
        const hay = normalise(it.name + ' ' + it.alt + ' ' + it.code + ' ' + it.region);
        return hay.includes(needle);
      })
      .slice(0, 8);
  }, [q, items]);

  const onChange = (value) => {
    setQ(value);
    setActive(0);
    setOpen(true);
    if (value.length >= 3 && tracked.current !== value) {
      tracked.current = value;
      sent.current = false;
      // The same base parameters every other event carries. Without them a
      // search could not be cut by market or cluster in GA4, which makes the
      // one report search is actually good for, what people ask for that we do
      // not have a page for, impossible to read per market.
      pushEvent(
        EVENTS.search,
        // No result_count here: results is memoised on the previous query and
        // this runs before the re-render, so it would report the count for the
        // term the visitor typed one keystroke ago. A wrong number in a report
        // is worse than a missing one, because nobody checks it twice.
        Object.assign(baseParams({ locale, cluster: 'destination' }), {
          search_term: value,
          // The callback is not here to delay anything by itself. It marks the
          // event as actually sent, so that if the visitor picks a result in
          // the next few hundred milliseconds the navigation knows whether it
          // would be tearing down the page on top of an unsent hit.
          eventCallback: () => {
            sent.current = true;
          },
          eventTimeout: 600,
        })
      );
    }
  };

  // Leaving the page for a result. Someone who types three characters and
  // immediately presses Enter is the most valuable search there is, because it
  // is the one where the visitor knew exactly what they wanted, and it is
  // precisely the one the old code lost: the hit was still in flight when the
  // document went away. So the navigation waits for the tag, and a timeout sits
  // behind it because with consent denied the callback never runs and the
  // search box would otherwise stop opening results at all.
  const leave = (href) => {
    if (leaving.current) return;
    leaving.current = true;
    const go = () => {
      window.location.href = href;
    };
    if (sent.current) {
      go();
      return;
    }
    const started = Date.now();
    const poll = () => {
      if (sent.current || Date.now() - started > 650) go();
      else window.setTimeout(poll, 50);
    };
    poll();
  };

  const onKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      const item = results[active];
      if (item) {
        e.preventDefault();
        leave(item.href);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search">
      <label className="search-label" htmlFor="destination-search">
        {strings.searchLabel}
      </label>
      <div className="search-field">
        <SearchIcon />
        <input
          id="destination-search"
          ref={inputRef}
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder={strings.searchPlaceholder}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-controls="destination-results"
          aria-expanded={open && q.length > 0 ? 'true' : 'false'}
        />
      </div>
      {open && q.trim().length > 0 ? (
        <div className="search-results" id="destination-results" role="listbox">
          {results.length ? (
            <ul>
              {results.map((it, i) => (
                <li key={it.href}>
                  <a
                    href={it.href}
                    role="option"
                    aria-selected={i === active ? 'true' : 'false'}
                    style={i === active ? { background: 'var(--surface-2)' } : undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={(e) => {
                      // A modified click wants a new tab, so the current page
                      // is not going anywhere and there is nothing to wait for.
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      leave(it.href);
                    }}
                  >
                    <span>{it.name}</span>
                    <span className="meta">{it.code}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="search-empty">{strings.searchEmpty}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" stroke="var(--faint)" strokeWidth="1.8" />
      <path d="m16.5 16.5 4 4" stroke="var(--faint)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
