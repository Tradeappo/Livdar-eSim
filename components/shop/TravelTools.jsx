'use client';

import { useState } from 'react';
import { pushEvent, EVENTS, baseParams } from '../../lib/analytics.js';

// Travel tools.
//
// Only the cost calculator is real, and it is real because it is arithmetic on
// numbers the visitor typed: nothing is fetched, nothing is claimed, and the
// result is labelled as an estimate rather than a quote. The other three tabs
// are announced rather than faked, because a tool that pretends to give advice
// it does not have is the same problem as a price we cannot honour.
//
// The eSIM line defaults to zero rather than to a number we would be inventing.

const TOOLS = ['cost', 'advisor', 'advice', 'card'];
const ICONS = { cost: '🧮', advisor: '🧭', advice: '📍', card: '💳' };

function Field({ label, value, onChange, min = 0, step = 1, id }) {
  return (
    <div className="tool-field">
      <div style={{ minWidth: 0, flex: 1 }}>
        <label className="tool-field-label" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        />
      </div>
      <div className="tool-stepper">
        <button type="button" aria-label="-" onClick={() => onChange(Math.max(min, value - step))}>
          -
        </button>
        <button type="button" aria-label="+" onClick={() => onChange(value + step)}>
          +
        </button>
      </div>
    </div>
  );
}

export default function TravelTools({ locale, strings }) {
  const t = strings;
  const [tab, setTab] = useState('cost');
  const [days, setDays] = useState(7);
  const [stay, setStay] = useState(85);
  const [food, setFood] = useState(35);
  const [transport, setTransport] = useState(15);
  const [esim, setEsim] = useState(0);
  const [activities, setActivities] = useState(false);
  const [result, setResult] = useState(null);

  const perDay = stay + food + transport + (activities ? 25 : 0);
  const total = perDay * days + esim;

  const calculate = () => {
    setResult({ perDay, total, days });
    pushEvent(
      EVENTS.ctaClick,
      Object.assign(baseParams({ locale, market: locale, cluster: 'tools' }), {
        cta_label: 'travel_cost_calculate',
        cta_position: 'travel_tools',
      })
    );
  };

  return (
    <section className="tools-shell" aria-labelledby="tools-heading">
      <div className="tools-head">
        <h2 id="tools-heading">{t.tools.title}</h2>
        <p>{t.tools.sub}</p>
      </div>

      <div className="tools-tabs" role="tablist" aria-label={t.tools.title}>
        {TOOLS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            className="tools-tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            <span className="tools-tab-icon" aria-hidden="true">
              {ICONS[key]}
            </span>
            {t.tools.tabs[key]}
          </button>
        ))}
      </div>

      {tab === 'cost' ? (
        <div className="tools-panel" role="tabpanel">
          <div className="tools-panel-head">
            <span className="tools-tab-icon" aria-hidden="true">
              {ICONS.cost}
            </span>
            <div>
              <h3>{t.tools.cost.title}</h3>
              <p>{t.tools.cost.sub}</p>
            </div>
          </div>

          <div className="tools-grid">
            <Field id="tool-days" label={t.tools.cost.days} value={days} onChange={setDays} min={1} />
            <Field id="tool-stay" label={t.tools.cost.stay} value={stay} onChange={setStay} step={5} />
            <Field id="tool-food" label={t.tools.cost.food} value={food} onChange={setFood} step={5} />
            <Field id="tool-transport" label={t.tools.cost.transport} value={transport} onChange={setTransport} step={5} />
            <Field id="tool-esim" label={t.tools.cost.esim} value={esim} onChange={setEsim} step={1} />
            <div className="tool-field">
              <div style={{ flex: 1 }}>
                <span className="tool-field-label">{t.tools.cost.activities}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--shop-dim)' }}>{t.tools.cost.activitiesSub}</span>
              </div>
              <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={activities} onChange={(e) => setActivities(e.target.checked)} />
              </label>
            </div>
          </div>

          <button type="button" className="tool-cta" onClick={calculate}>
            {t.tools.cost.cta}
          </button>

          {result ? (
            <div className="tool-result" aria-live="polite">
              <strong style={{ fontSize: 13 }}>{t.tools.cost.resultTitle}</strong>
              <div className="tool-result-row">
                <span>{t.tools.cost.perDay}</span>
                <span>{result.perDay}</span>
              </div>
              <div className="tool-result-row tool-result-total">
                <span>{t.tools.cost.total.replace('{days}', String(result.days))}</span>
                <span>{result.total}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--shop-dim)' }}>{t.tools.cost.note}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="tools-panel" role="tabpanel">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--shop-dim)' }}>{t.tools.advisorNote}</p>
        </div>
      )}
    </section>
  );
}
