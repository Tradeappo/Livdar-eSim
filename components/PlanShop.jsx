'use client';

import { useState } from 'react';
import { pushEvent, EVENTS, baseParams } from '../lib/analytics.js';

// The shop surface.
//
// This component is built against the provider contract rather than against a
// catalogue, which is what lets it be a real shop before there is anything to
// sell. When a provider returns plans it renders them. When none is connected
// it renders the same structure with every value marked as not yet set, and it
// keeps the entire purchase path walkable so we can measure how far people go.
//
// The rule it obeys, and the reason it is written this way: it never invents a
// price, a data amount, a validity, an operator or a coverage claim. A shop
// that shows "from 4.99" for a product nobody can deliver is lying to the
// customer at the exact moment they decide to trust it. Showing the shape of
// the offer and saying plainly that it is not live yet costs us nothing except
// the pretence.

const STAGE = {
  browse: 'browse',
  selected: 'selected',
  checkout: 'checkout',
};

// The fields every plan will carry once a supplier is connected. Rendering them
// empty is honest and still tells the visitor what they will be choosing
// between, which is the job a shop front does.
const PLAN_FIELDS = ['data', 'validity', 'hotspot', 'network'];

export default function PlanShop({
  plans = [],
  strings,
  locale,
  destination,
  region,
  connected = false,
}) {
  const [stage, setStage] = useState(STAGE.browse);
  const [selected, setSelected] = useState(null);

  const context = () => baseParams({ locale, destination, region, cluster: 'commercial' });

  const fire = (event, extra) => pushEvent(event, Object.assign(context(), extra || {}));

  const onView = (planId) => fire(EVENTS.viewPlan, { plan_id: planId || null, supplier_connected: connected });

  const onSelect = (planId) => {
    setSelected(planId);
    setStage(STAGE.selected);
    fire(EVENTS.selectPlan, { plan_id: planId || null, supplier_connected: connected });
  };

  const onCheckout = () => {
    fire(EVENTS.beginCheckout, { plan_id: selected || null, supplier_connected: connected });
    setStage(STAGE.checkout);
    // The visitor asked to buy and we cannot sell. That is the measurement that
    // matters most right now, so it is its own event rather than a parameter.
    if (!connected) {
      fire(EVENTS.checkoutIntent, { plan_id: selected || null, reason: 'no_supplier_connected' });
    }
  };

  const onNotify = () => fire(EVENTS.notifySignup, { plan_id: selected || null, position: 'checkout_intent' });

  const onBack = () => {
    setStage(STAGE.browse);
    setSelected(null);
  };

  // ---------------------------------------------------------------- checkout

  if (stage === STAGE.checkout) {
    return (
      <div className="plan-state" data-stage="checkout">
        <h3>{strings.checkoutUnavailableTitle}</h3>
        <p>{strings.checkoutUnavailableBody}</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onNotify}>
            {strings.notifyMe}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            {strings.backToPlans}
          </button>
        </div>
        <p className="footer-note" style={{ marginTop: 16 }}>
          {strings.checkoutNoPaymentNote}
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------ plan detail

  if (stage === STAGE.selected) {
    const plan = plans.find((p) => p.id === selected) || null;
    return (
      <div className="plan-state" data-stage="detail">
        <h3>{plan ? plan.title : strings.planDetailTitle}</h3>
        <div className="plan-skeleton">
          {PLAN_FIELDS.map((field) => (
            <div className="plan-skeleton-row" key={field}>
              <span>{strings.planFields[field]}</span>
              <span>{plan && plan[field] ? plan[field] : strings.valueNotSet}</span>
            </div>
          ))}
          <div className="plan-skeleton-row">
            <span>{strings.planFields.price}</span>
            <span>
              {plan && plan.price ? plan.price.amount + ' ' + plan.price.currency : strings.valueNotSet}
            </span>
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onCheckout}>
            {strings.continueToCheckout}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            {strings.backToPlans}
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------- browse

  if (plans.length) {
    return (
      <div className="grid grid-3" data-stage="browse">
        {plans.map((p) => (
          <div className="tile plan-card" key={p.id} onMouseEnter={() => onView(p.id)}>
            <h3>{p.title}</h3>
            <div className="plan-skeleton">
              {PLAN_FIELDS.map((field) => (
                <div className="plan-skeleton-row" key={field}>
                  <span>{strings.planFields[field]}</span>
                  <span>{p[field] || strings.valueNotSet}</span>
                </div>
              ))}
            </div>
            {p.price ? <span className="meta">{p.price.amount} {p.price.currency}</span> : null}
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: 12 }}
              onClick={() => onSelect(p.id)}
            >
              {strings.selectPlan}
            </button>
          </div>
        ))}
      </div>
    );
  }

  // The unavailable state. Same shape, no invented values, full path still
  // walkable so the intent is measurable.
  return (
    <div data-stage="unavailable">
      <div className="plan-state">
        <h3>{strings.notConnectedTitle}</h3>
        <p>{strings.notConnectedBody}</p>
      </div>
      <div className="grid grid-3" style={{ marginTop: 16 }}>
        {[1, 2, 3].map((slot) => (
          <div className="tile plan-card" key={slot} onMouseEnter={() => onView(null)}>
            <h3>{strings.planSlotTitle}</h3>
            <div className="plan-skeleton" aria-label={strings.planSlotAria}>
              {PLAN_FIELDS.map((field) => (
                <div className="plan-skeleton-row" key={field}>
                  <span>{strings.planFields[field]}</span>
                  <span>{strings.valueNotSet}</span>
                </div>
              ))}
              <div className="plan-skeleton-row">
                <span>{strings.planFields.price}</span>
                <span>{strings.valueNotSet}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: 12 }}
              onClick={() => onSelect(null)}
            >
              {strings.selectPlan}
            </button>
          </div>
        ))}
      </div>
      <p className="footer-note" style={{ marginTop: 12 }}>
        {strings.planSlotNote}
      </p>
    </div>
  );
}
