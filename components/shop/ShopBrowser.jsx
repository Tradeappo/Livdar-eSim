'use client';

import { useMemo, useRef, useState } from 'react';
import PlanCard from './PlanCard.jsx';
import { pushEvent, EVENTS, baseParams } from '../../lib/analytics.js';
import { DEMO_PLANS, DEMO_SUPPLIERS, DEMO_FILTERS, badgeKeyFor, priceValue, dataValue } from '../../lib/demo-plans.js';

// The shop.
//
// One client island for the whole browsing surface, because search, supplier,
// filter and sort all read the same list and splitting them would mean either
// four islands sharing state through the URL or a context that exists only to
// glue them back together.
//
// Everything below it stays on the server: the destination rails, the regional
// cards and the editorial pages are server rendered, so the content a crawler
// needs is in the HTML and does not depend on this component running at all.

const PAGE = 24;

function normalise(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export default function ShopBrowser({ locale, strings, hrefs = {} }) {
  const t = strings;
  const [query, setQuery] = useState('');
  const [supplier, setSupplier] = useState('all');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('popular');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState(null);
  const tracked = useRef('');
  const sent = useRef(true);

  const context = (extra) =>
    Object.assign(baseParams({ locale, market: locale, cluster: 'shop' }), extra || {});

  const results = useMemo(() => {
    const needle = normalise(query).trim();
    const predicate = (DEMO_FILTERS.find((f) => f.key === filter) || DEMO_FILTERS[0]).test;
    let list = DEMO_PLANS.filter((p) => {
      if (supplier !== 'all' && p.supplierKey !== supplier) return false;
      if (!predicate(p)) return false;
      if (needle && !normalise(p.name + ' ' + p.supplier).includes(needle)) return false;
      return true;
    });
    if (sort === 'priceLow') list = [...list].sort((a, b) => priceValue(a) - priceValue(b));
    else if (sort === 'priceHigh') list = [...list].sort((a, b) => priceValue(b) - priceValue(a));
    else if (sort === 'dataHigh') list = [...list].sort((a, b) => dataValue(b) - dataValue(a));
    return list;
  }, [query, supplier, filter, sort]);

  const onSearch = (value) => {
    setQuery(value);
    setShown(PAGE);
    if (value.length >= 3 && tracked.current !== value) {
      tracked.current = value;
      sent.current = false;
      pushEvent(
        EVENTS.search,
        context({
          search_term: value,
          eventCallback: () => {
            sent.current = true;
          },
          eventTimeout: 600,
        })
      );
    }
  };

  // Filter and supplier changes are the clearest signal the shop produces about
  // what people are actually shopping for, so they are measured. They are
  // cta_click rather than a new event name because the container gate accepts a
  // fixed set of ten names, and inventing an eleventh here would mean an event
  // that fires in the browser and never reaches the report.
  const onFacet = (kind, value) => {
    pushEvent(EVENTS.ctaClick, context({ cta_label: kind + ':' + value, cta_position: 'shop_facet' }));
  };

  const openPlan = (plan, index) => {
    setOpen(plan);
    pushEvent(
      EVENTS.viewPlan,
      context({
        destination: plan.id,
        plan_id: plan.id + ':' + plan.supplierKey,
        plan_type: 'sample',
        supplier_connected: false,
        list_position: index + 1,
      })
    );
  };

  const [stage, setStage] = useState('detail');

  const selectPlan = (plan) => {
    setStage('checkout');
    pushEvent(EVENTS.selectPlan, context({ destination: plan.id, plan_id: plan.id + ':' + plan.supplierKey, plan_type: 'sample' }));
  };

  const continueToCheckout = (plan) => {
    pushEvent(EVENTS.beginCheckout, context({ destination: plan.id, plan_id: plan.id + ':' + plan.supplierKey, plan_type: 'sample' }));
    setStage('unavailable');
    // The gap between these two is the number this site exists to produce right
    // now: how many people asked to pay at a point where nothing can be sold.
    pushEvent(EVENTS.checkoutIntent, context({ destination: plan.id, plan_id: plan.id + ':' + plan.supplierKey, plan_type: 'sample' }));
  };

  const notify = (plan) => {
    pushEvent(EVENTS.notifySignup, context({ destination: plan.id, plan_id: plan.id + ':' + plan.supplierKey, plan_type: 'sample' }));
    setStage('notified');
  };

  const close = () => {
    setOpen(null);
    setStage('detail');
  };

  const visible = results.slice(0, shown);

  return (
    <div className="shop">
      <div className="shop-search">
        <div className="shop-searchbox">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.shop.searchPlaceholder}
            aria-label={t.searchLabel}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="shop-rings" role="group" aria-label={t.shop.supplierLabel}>
        <button
          type="button"
          className="shop-ring"
          aria-pressed={supplier === 'all'}
          onClick={() => {
            setSupplier('all');
            setShown(PAGE);
            onFacet('supplier', 'all');
          }}
        >
          <span className="shop-ring-halo" style={{ '--c1': '#8f97a3', '--c2': '#cfd4dc' }}>
            <span className="shop-ring-core" style={{ '--c1': '#6f7783', '--c2': '#aeb5c0' }}>
              {t.shop.allSuppliers}
            </span>
          </span>
          <span className="shop-ring-label">{t.shop.supplierLabel}</span>
        </button>
        {DEMO_SUPPLIERS.map((s) => (
          <button
            key={s.key}
            type="button"
            className="shop-ring"
            aria-pressed={supplier === s.key}
            onClick={() => {
              const next = supplier === s.key ? 'all' : s.key;
              setSupplier(next);
              setShown(PAGE);
              onFacet('supplier', next);
            }}
          >
            <span className="shop-ring-halo" style={{ '--c1': s.c1, '--c2': s.c2 }}>
              <span className="shop-ring-core" style={{ '--c1': s.c1, '--c2': s.c2 }}>
                {s.name}
              </span>
            </span>
            <span className="shop-ring-label">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="shop-chips" role="group" aria-label={t.filterRegion}>
        {DEMO_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="shop-chip"
            aria-pressed={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              setShown(PAGE);
              onFacet('filter', f.key);
            }}
          >
            {t.shop.filters[f.labelKey]}
          </button>
        ))}
      </div>

      <div className="shop-toolbar">
        <span className="shop-count">{t.shop.countShown.replace('{count}', String(results.length))}</span>
        <div className="shop-toolbar-end">
          <label className="shop-pill">
            <span className="sr-only">{t.shop.sortBy.replace('{value}', '')}</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                onFacet('sort', e.target.value);
              }}
              style={{ border: 0, background: 'transparent', font: 'inherit', color: 'inherit' }}
            >
              {Object.entries(t.shop.sort).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Said once, above the first price, in the language of the page. */}
      <p className="shop-notice">
        <span>
          <strong>{t.shop.demoNoticeTitle}</strong> {t.shop.demoNoticeBody}
        </span>
      </p>

      {visible.length ? (
        <div className="shop-grid">
          {visible.map((plan, i) => (
            <PlanCard
              key={plan.id + plan.supplierKey}
              plan={plan}
              label={t.shop}
              badge={t.shop.badges[badgeKeyFor(plan, i)]}
              priority={i < 4}
              onOpen={(e) => {
                e.preventDefault();
                openPlan(plan, i);
              }}
            />
          ))}
        </div>
      ) : (
        <p className="shop-empty">{t.shop.noResults}</p>
      )}

      {shown < results.length ? (
        <div className="shop-more">
          <button
            type="button"
            className="shop-pill"
            onClick={() => {
              setShown((n) => n + PAGE);
              onFacet('page', String(shown / PAGE + 1));
            }}
          >
            {t.shop.showMore}
          </button>
        </div>
      ) : null}

      {open ? (
        <div
          className="sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={t.shop.detailTitle}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="sheet">
            <div className="sheet-handle" />
            <h2>
              <span aria-hidden="true">{open.flag} </span>
              {open.name}
            </h2>
            <p className="sheet-supplier">
              {t.shop.supplierLabel}: {open.supplier} · {t.shop.demoBadge}
            </p>

            <div className="sheet-facts">
              <div className="sheet-fact">
                <strong>{open.data}</strong>
                <span>{t.shop.factData}</span>
              </div>
              <div className="sheet-fact">
                <strong>{open.days}</strong>
                <span>{t.shop.factValidity}</span>
              </div>
              <div className="sheet-fact">
                <strong>{open.network}</strong>
                <span>{t.shop.factNetwork}</span>
              </div>
            </div>

            <p className="shop-notice">
              <span>
                <strong>{t.shop.demoNoticeTitle}</strong> {t.shop.demoNoticeBody}
              </span>
            </p>

            {stage === 'detail' ? (
              <div className="sheet-actions">
                <button type="button" className="btn btn-primary btn-block" onClick={() => selectPlan(open)}>
                  {t.selectPlan}
                </button>
                {hrefs[open.id] ? (
                  <a className="btn btn-ghost btn-block" href={hrefs[open.id]}>
                    {t.shop.readAbout.replace('{name}', open.name)}
                  </a>
                ) : null}
              </div>
            ) : null}

            {stage === 'checkout' ? (
              <div className="sheet-actions">
                <button type="button" className="btn btn-primary btn-block" onClick={() => continueToCheckout(open)}>
                  {t.continueToCheckout}
                </button>
                <button type="button" className="btn btn-ghost btn-block" onClick={() => setStage('detail')}>
                  {t.backToPlans}
                </button>
              </div>
            ) : null}

            {stage === 'unavailable' ? (
              <>
                <h3 style={{ margin: '14px 0 6px', fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}>
                  {t.checkoutUnavailableTitle}
                </h3>
                <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--shop-dim)' }}>{t.checkoutUnavailableBody}</p>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--shop-dim)' }}>{t.checkoutNoPaymentNote}</p>
                <div className="sheet-actions">
                  <button type="button" className="btn btn-primary btn-block" onClick={() => notify(open)}>
                    {t.notifyMe}
                  </button>
                  <button type="button" className="btn btn-ghost btn-block" onClick={close}>
                    {t.backToPlans}
                  </button>
                </div>
              </>
            ) : null}

            {stage === 'notified' ? (
              <>
                <p style={{ margin: '14px 0 8px', fontSize: 14 }}>{t.notConnectedBody}</p>
                <div className="sheet-actions">
                  <button type="button" className="btn btn-ghost btn-block" onClick={close}>
                    {t.backToPlans}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
