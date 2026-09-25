// The two decisions a tool makes about the reader, kept out of the component so a
// test can reach them. Node cannot import JSX, and a helper that only a browser
// can load is a helper nothing checks.

// An income is the reader's business. A band answers every question worth asking
// of it and cannot be turned back into a salary, which is the whole point: the
// completion rate of a calculator is a useful number and the number somebody
// typed into it is not ours to keep.
export function bandOf(value) {
  const n = Number(value);
  if (!(n > 0)) return null;
  for (const top of [500, 1000, 2000, 3000, 5000, 8000, 12000, 20000]) if (n < top) return 'under ' + top;
  return '20000 or more';
}

// Where a picker opens: the reader's own country, or the middle of the table.
// Not the first row. The first row is alphabetical, and a comparison tool on an
// American page that opens on Afghanistan against Algeria is a working tool that
// looks broken.
export function startAt(rows, home) {
  const at = rows.findIndex((r) => r.iso2 === home);
  return at >= 0 ? at : Math.floor(rows.length / 2);
}
