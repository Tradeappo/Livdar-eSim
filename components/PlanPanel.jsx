import Cta from './Cta.jsx';

// The plan surface exists and is wired to the provider contract. While the
// active provider is the unconnected stub it returns nothing, so the panel
// shows the real state instead of inventing a price, a data amount or a
// coverage claim. The day an adapter is registered, this component renders
// plans without a single change to the page around it.

export default function PlanPanel({ plans, strings, locale, destination, region }) {
  if (plans && plans.length) {
    return (
      <div className="grid grid-3">
        {plans.map((p) => (
          <div className="tile" key={p.id}>
            <h3>{p.title}</h3>
            <p>
              {p.dataAmount ? p.dataAmount + ' ' + p.dataUnit : null}
              {p.validityDays ? ' / ' + p.validityDays + ' days' : null}
            </p>
            {p.price ? (
              <span className="meta">
                {p.price.amount} {p.price.currency}
              </span>
            ) : null}
            <div style={{ marginTop: 12 }}>
              <Cta
                label={strings.viewPlans}
                event="view_plan"
                position="plan_card"
                locale={locale}
                destination={destination}
                region={region}
                block
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="plan-state">
      <h3>{strings.notConnectedTitle}</h3>
      <p>{strings.notConnectedBody}</p>
      <div className="plan-skeleton" aria-hidden="true">
        <div className="plan-skeleton-row"><span>Data</span><span>not connected</span></div>
        <div className="plan-skeleton-row"><span>Validity</span><span>not connected</span></div>
        <div className="plan-skeleton-row"><span>Hotspot</span><span>not connected</span></div>
      </div>
      <div className="hero-actions">
        <Cta
          label={strings.notifyMe}
          event="notify_signup"
          position="plan_panel"
          locale={locale}
          destination={destination}
          region={region}
        />
        <Cta
          label={strings.checkAvailability}
          event="check_availability"
          position="plan_panel"
          locale={locale}
          destination={destination}
          region={region}
          variant="ghost"
        />
      </div>
    </div>
  );
}
