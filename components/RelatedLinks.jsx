// A block of contextual links for the editorial templates. Uses the existing
// tile grid, so it adds no new visual language. See lib/internal-links.js for
// why these links exist and where their text comes from.

// Titles only by default. The same block repeats across every page of a
// template, and repeating each target's meta description there would add the
// same paragraph of boilerplate to every page. The descriptions are used on the
// eSIM hub instead, where they appear once.
export default function RelatedLinks({ id, heading, items, columns = 3, describe = false }) {
  if (!items || !items.length) return null;
  return (
    <section aria-labelledby={id}>
      <div className="section-head">
        <h2 id={id}>{heading}</h2>
      </div>
      <div className={'grid grid-' + columns}>
        {items.map((item) => (
          <a className="tile dest-tile" key={item.href} href={item.href}>
            <strong>
              {item.flag ? (
                <span aria-hidden="true" style={{ marginRight: 6 }}>
                  {item.flag}
                </span>
              ) : null}
              {item.title}
            </strong>
            {describe && item.description ? <p>{item.description}</p> : null}
          </a>
        ))}
      </div>
    </section>
  );
}
