#!/usr/bin/env python3
"""Shard the two authoritative CSV records into parts a git remote will accept.

THE CLIFF, and why untracking is the wrong answer for THESE two files.

data/atlas/candidates/ is untracked because every file under it is a DERIVED export that
run-1m-pipeline.sh regenerates. The .gitignore says so and names what stays tracked instead:
LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz, LIVDAR-1M-REJECTED-CANDIDATES.csv.gz, 1M-SUMMARY.json and
the breakdowns. Those are the auditable record - the rows a count rests on and the reason every
rejected row was rejected - so untracking them would mean the repository no longer carries the
evidence for its own number.

But the manifest is 97.4 MiB at 963,470 rows, GitHub's hard blob limit is 100 MiB, and the
target for this programme is 1,000,000 rows, which lands it at about 101 MiB. The cliff is not
hypothetical and it is not far away. It has already been hit twice in this repository: once by
LIVDAR-1M-CANDIDATE-MANIFEST.parquet, which had to be deleted, and once by
family=transport.city-pair-transit at 112 MB, which the pre-receive hook declined. Both times
the headroom was judged by eye and both times the judgement was wrong - I called 77 MB "real
headroom" days before 112 MB was refused.

So: the record stays in the repository and stops being one blob.

HOW, and the properties that make the parts a faithful record rather than a convenience copy:

  - Every part carries the CSV HEADER, so each part is independently readable by anything that
    reads a CSV. No reassembly is needed to inspect one.
  - Parts are split on ROW boundaries, never on bytes, so no row is ever torn across two files.
  - The split is by a target part size with the row count computed from the real compressed
    rate, so parts stay near the target as the inventory grows rather than needing a new
    divisor every time.
  - _parts-index.json records, for the whole file and for each part: the row count, the
    uncompressed byte length and a sha256 over the CONCATENATED data rows, header excluded.
    That is the check that matters - it proves the parts hold exactly the rows the monolith
    held, in order, and it fails loudly if a part is stale or missing.
  - Re-running on an unchanged input produces byte-identical parts.

The monolith is still written by build-1m-candidate-manifest.py and is still what every
downstream stage reads locally. It is untracked. The parts are what the repository carries.
"""
import csv, gzip, hashlib, io, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
REPORTS = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'

# 30 MiB of compressed part. Three times under the 100 MiB limit, so a part would have to
# TRIPLE between runs to come close, and the largest single-run growth this inventory has ever
# seen is about ten per cent.
TARGET_PART_BYTES = 30 * 1024 * 1024

SOURCES = ('LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz')


def shard(name):
    src = REPORTS + name
    if not os.path.exists(src):
        print(f'{name}: not on disk, skipped', file=sys.stderr)
        return None
    stem = name[:-len('.csv.gz')]
    outdir = REPORTS + stem + '.parts/'
    os.makedirs(outdir, exist_ok=True)

    # Pass one: the header, the row count and the compressed rate, so the rows-per-part can be
    # computed from this file rather than guessed. Rows are read as TEXT LINES, not parsed as
    # CSV, because a faithful split must reproduce the bytes and a parse-and-rewrite would
    # normalise quoting.
    with gzip.open(src, 'rt', encoding='utf-8', newline='') as fh:
        header = fh.readline()
        rows = 0
        raw_len = 0
        for line in fh:
            rows += 1
            raw_len += len(line.encode('utf-8'))
    if rows == 0:
        print(f'{name}: no data rows', file=sys.stderr)
        return None
    comp = os.path.getsize(src)
    # compressed bytes per row, from this file's own ratio
    per_row = max(1.0, comp / rows)
    rows_per_part = max(1, int(TARGET_PART_BYTES / per_row))
    nparts = (rows + rows_per_part - 1) // rows_per_part

    whole = hashlib.sha256()
    parts = []
    with gzip.open(src, 'rt', encoding='utf-8', newline='') as fh:
        fh.readline()                      # header, already captured
        for p in range(nparts):
            path = outdir + f'part-{p + 1:02d}.csv.gz'
            h = hashlib.sha256()
            n = 0
            blen = 0
            buf = io.BytesIO()
            # mtime=0 so an unchanged input gives byte-identical output
            with gzip.GzipFile(fileobj=buf, mode='wb', mtime=0) as gz:
                gz.write(header.encode('utf-8'))
                for line in fh:
                    b = line.encode('utf-8')
                    gz.write(b)
                    h.update(b)
                    whole.update(b)
                    n += 1
                    blen += len(b)
                    if n >= rows_per_part:
                        break
            if n == 0:
                buf.close()
                if os.path.exists(path):
                    os.unlink(path)
                continue
            with open(path + '.tmp', 'wb') as out:
                out.write(buf.getvalue())
            os.replace(path + '.tmp', path)
            parts.append({'part': os.path.basename(path), 'rows': n,
                          'uncompressed_bytes': blen,
                          'compressed_bytes': os.path.getsize(path),
                          'sha256_of_data_rows': h.hexdigest()})
            print(f'  {os.path.basename(path)}: {n:,} rows, '
                  f'{os.path.getsize(path) / 1048576:.1f} MiB', file=sys.stderr)

    # A part left over from a previous, larger run would otherwise sit in the tree and be
    # counted by a reader. The same failure the partition tree had: nothing ever removed a
    # file that stopped being produced.
    keep = {p['part'] for p in parts}
    removed = []
    for f in sorted(os.listdir(outdir)):
        if f.startswith('part-') and f.endswith('.csv.gz') and f not in keep:
            os.unlink(outdir + f)
            removed.append(f)
    if removed:
        print(f'  removed {len(removed)} part(s) this run no longer produces: '
              f'{", ".join(removed)}', file=sys.stderr)

    index = {
        'source': name,
        'what_this_is': ('the authoritative CSV record, split on row boundaries into parts a '
                         'git remote will accept. Every part carries the header and is '
                         'independently readable; concatenating the data rows of the parts in '
                         'part order reproduces the source exactly.'),
        'header': header.rstrip('\r\n'),
        'total_rows': rows,
        'total_uncompressed_bytes': raw_len,
        'sha256_of_all_data_rows': whole.hexdigest(),
        'target_part_bytes': TARGET_PART_BYTES,
        'rows_per_part': rows_per_part,
        'parts': parts,
        'to_reassemble': ('zcat part-*.csv.gz | awk \'NR==1 || $0 != header\' is NOT the way. '
                          'Read part-01 whole, then skip the first line of every later part: '
                          'for f in part-*.csv.gz; do if [ "$f" = part-01.csv.gz ]; then zcat '
                          '"$f"; else zcat "$f" | tail -n +2; fi; done | gzip > rebuilt.csv.gz'),
        'verify': ('the sha256 above is over the concatenated DATA rows with the header '
                   'excluded, so it is comparable across any reassembly that keeps row order'),
        'removed_stale_parts': removed,
    }
    with open(outdir + '_parts-index.json.tmp', 'w') as fh:
        json.dump(index, fh, indent=1)
    os.replace(outdir + '_parts-index.json.tmp', outdir + '_parts-index.json')
    print(f'{name}: {rows:,} rows -> {len(parts)} parts in {stem}.parts/', file=sys.stderr)
    return index


def main():
    for name in SOURCES:
        shard(name)


if __name__ == '__main__':
    main()
