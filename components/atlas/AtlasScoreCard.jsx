'use client';

// The verdict card, adapted from the affordability card in the V164 reference.
//
// What was taken: the shape. A single rounded shell, a fully coloured block
// inside it, an eyebrow over a heading, a large figure beside a filling orb, and
// a row of three small tiles under them. The gradients are the reference's own,
// kept to the character.
//
// What was changed, deliberately:
//
// The reference put its headline figure - the money left after costs - in a white
// strip under the coloured block, with an `Adjust budget` button that opened the
// controls in a modal. Both are gone. The card is one coloured block, so the
// figure moved inside it, and the controls sit directly under the card where a
// reader can see them without being told they exist. A calculator whose inputs
// are behind a button is a calculator most readers never use.
//
// The state drives the background and not the digits. That is the reason to take
// this design at all: a reader glancing at a green block has the answer before
// reading a number, which is what a calculator on a page somebody landed on from
// a search result has to manage. The digits stay white throughout.
//
// This component holds no arithmetic. It is given a state, a score, a headline
// and up to three tiles, and every one of those is computed by the tool module
// that the page is built from, so the card cannot disagree with the page.

export default function AtlasScoreCard({
  eyebrow, title, state, score, verdict, orb, orbFill, headline, kpis = [], note, gradient,
}) {
  return (
    <div className="atlas-score-shell">
      <div
        className="atlas-score-card"
        data-state={state || 'resting'}
        // Inline, because the gradient is the state and the state is computed. A
        // class per state would put the same rule in two places and the CSS would
        // be the copy that drifts.
        style={gradient ? { background: gradient } : undefined}
      >
        <div className="atlas-score-head">
          <div>
            {eyebrow ? <div className="atlas-score-eyebrow">{eyebrow}</div> : null}
            <h3>{title}</h3>
          </div>
        </div>

        <div className="atlas-score-row">
          <div className="atlas-score-figure">
            <div className="atlas-score-number">{score}</div>
            {verdict ? <div className="atlas-score-verdict">{verdict}</div> : null}
          </div>
          {orb ? (
            <div className="atlas-score-orb" aria-hidden="true">
              <span className="atlas-score-orb-fill" style={{ height: Math.max(0, Math.min(100, orbFill || 0)) + '%' }} />
              <b>{orb}</b>
            </div>
          ) : null}
        </div>

        {headline ? (
          <div className="atlas-score-headline">
            <small>{headline.label}</small>
            <strong>{headline.value}</strong>
          </div>
        ) : null}

        {kpis.length ? (
          <div className="atlas-score-kpis">
            {kpis.map((k) => (
              <div className="atlas-score-kpi" key={k.label}>
                <b>{k.value}</b>
                <span>{k.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {note ? <p className="atlas-score-note">{note}</p> : null}
      </div>
    </div>
  );
}
