export default function JsonLd({ data }) {
  const list = Array.isArray(data) ? data.filter(Boolean) : [data].filter(Boolean);
  if (!list.length) return null;
  return (
    <>
      {list.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
