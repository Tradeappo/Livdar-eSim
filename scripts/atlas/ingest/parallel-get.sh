#!/bin/bash
# Fetch a large file over several parallel HTTP range requests.
#
# The mirror serves a single connection at roughly 0.3 MB/s, which puts a 5.9GB country
# extract three hours away, but it sets Accept-Ranges: bytes. So the file is split into
# parts fetched at the same time, which is the difference between three hours and forty
# minutes for the same bytes.
#
# Resumable and atomic by construction:
#   - each part is fetched with curl -C -, so re-running continues rather than restarts
#   - a part is accepted only when its byte count is exactly what was asked for
#   - the parts are concatenated to <out>.joined and renamed into place in one step
#   - an existing partial file can be passed as a SEED and becomes part 0, so bytes
#     already downloaded sequentially are not thrown away
#
# Usage: parallel-get.sh <url> <out> [parts] [seed-file]
set -u
URL="$1"; OUT="$2"; PARTS="${3:-8}"; SEED="${4:-}"
D="$OUT.parts"; mkdir -p "$D"

TOTAL=$(curl -sS -m 60 -I "$URL" | awk 'tolower($1)=="content-length:"{print $2+0}')
[ -n "${TOTAL:-}" ] && [ "$TOTAL" -gt 0 ] || { echo "no content-length for $URL"; exit 1; }
echo "total $TOTAL bytes in $PARTS parts"

START=0
if [ -n "$SEED" ] && [ -f "$SEED" ]; then
  SZ=$(stat -c%s "$SEED")
  if [ "$SZ" -gt 0 ] && [ "$SZ" -lt "$TOTAL" ]; then
    mv "$SEED" "$D/p00"
    START=$SZ
    echo "seeded first $SZ bytes from an existing partial download"
  fi
fi

REMAIN=$(( TOTAL - START ))
CHUNK=$(( (REMAIN + PARTS - 1) / PARTS ))
pids=()
for i in $(seq 1 "$PARTS"); do
  from=$(( START + (i - 1) * CHUNK ))
  to=$(( from + CHUNK - 1 ))
  [ "$to" -ge "$TOTAL" ] && to=$(( TOTAL - 1 ))
  [ "$from" -gt "$to" ] && continue
  f=$(printf "%s/p%02d" "$D" "$i")
  want=$(( to - from + 1 ))
  if [ -f "$f" ] && [ "$(stat -c%s "$f")" -eq "$want" ]; then continue; fi
  ( curl -sS -m 7200 -C - -r "$from-$to" -o "$f" "$URL" ) &
  pids+=("$!")
done
for p in "${pids[@]:-}"; do [ -n "$p" ] && wait "$p"; done

# verify every part before joining: a short part would produce a corrupt pbf that only
# fails much later, inside the extractor
GOT=0
for f in "$D"/p*; do GOT=$(( GOT + $(stat -c%s "$f") )); done
if [ "$GOT" -ne "$TOTAL" ]; then
  echo "incomplete: have $GOT of $TOTAL bytes, re-run to resume"; exit 1
fi
cat "$D"/p* > "$OUT.joined" && mv -f "$OUT.joined" "$OUT" && rm -rf "$D"
echo "done: $(stat -c%s "$OUT") bytes -> $OUT"
