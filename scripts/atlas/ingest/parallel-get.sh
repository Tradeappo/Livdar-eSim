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

# The part LAYOUT has to match, or resuming corrupts the file. curl -C - continues a part
# from its current length, and it has no idea which byte range that part was originally
# asked for: change the part count and p01 is resumed from offset N of a DIFFERENT range,
# so the joined file is silently wrong. This happened: a stalled 8-part download was
# re-run with 3 parts, the three new ranges were appended onto three old part files, and
# the directory summed to 114 per cent of the file size, which is the only reason it was
# noticed. A size that happened to land under 100 per cent would have produced a corrupt
# extract that osmium would have failed on much later, with no clue why.
LAYOUT="$D/.layout"
WANT="parts=$PARTS seed=$([ -n "${4:-}" ] && echo yes || echo no)"
if [ -f "$LAYOUT" ] && [ "$(cat "$LAYOUT")" != "$WANT" ]; then
  echo "part layout changed: have [$(cat "$LAYOUT")], asked for [$WANT]."
  echo "Resuming across a layout change would corrupt the output, so the old parts are"
  echo "discarded and this starts over. Keep the part count stable to keep resume working."
  rm -f "$D"/p* 
fi
printf '%s' "$WANT" > "$LAYOUT"

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
  if [ -f "$f" ]; then
    have=$(stat -c%s "$f")
    if [ "$have" -eq "$want" ]; then continue; fi
    # A part can NEVER legitimately exceed its own range, so a bigger one is corrupt and
    # resuming it makes it worse. This happens when the mirror or a proxy ignores the Range
    # header: curl then writes the WHOLE file into one part, and because the old test was only
    # -eq, the next attempt resumed with -C - and appended the whole file again. Egypt reached
    # 340,069,344 bytes of a 204,041,606-byte file across six attempts, with p03 holding the
    # entire file inside a 68MB slice, and the run could never finish because the sum could
    # never equal the total. Discard and refetch rather than resume.
    if [ "$have" -gt "$want" ]; then
      echo "  part $(basename "$f") is $have bytes for a $want-byte range, so the server ignored"
      echo "  the range request; discarding it and fetching that range again"
      rm -f "$f"
    fi
  fi
  ( curl -sS -m 7200 -C - -r "$from-$to" -o "$f" "$URL" ) &
  pids+=("$!")
done
for p in "${pids[@]:-}"; do [ -n "$p" ] && wait "$p"; done

# verify every part before joining: a short part would produce a corrupt pbf that only
# fails much later, inside the extractor
GOT=0
for f in "$D"/p*; do GOT=$(( GOT + $(stat -c%s "$f") )); done
if [ "$GOT" -gt "$TOTAL" ]; then
  # Reported separately from "incomplete", because the two need opposite actions and calling
  # an oversized download incomplete is what sent Egypt round six identical attempts.
  echo "oversized: have $GOT of $TOTAL bytes, so at least one range was served in full."
  echo "The offending parts are discarded above on the next run; re-run to refetch them."
  exit 1
fi
if [ "$GOT" -ne "$TOTAL" ]; then
  echo "incomplete: have $GOT of $TOTAL bytes, re-run to resume"; exit 1
fi
# join in place: appending onto the first part and deleting each one as it goes needs the
# file plus one part, where "cat parts > joined" needed the whole file twice. With several
# extracts on disk at once that difference is the whole session allowance.
"$(dirname "$0")/join-parts.sh" "$OUT"
