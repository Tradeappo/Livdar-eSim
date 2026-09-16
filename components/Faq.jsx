export default function Faq({ items, heading }) {
  if (!items || !items.length) return null;
  return (
    <section className="faq">
      <div className="section-head">
        <h2>{heading}</h2>
      </div>
      {items.map((item, i) => (
        <details key={i}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </section>
  );
}
