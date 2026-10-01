#!/bin/bash
# Join the parts of a parallel download WITHOUT doubling peak disk.
#
# parallel-get.sh ends with "cat parts > joined", which needs a second full copy of the
# file at the moment of joining: for a 5.6GB country extract that is 11.2GB at peak, and
# with several downloads in flight that exhausts the session's disk allowance. This
# appends each part onto the first and deletes it immediately, so peak usage is the file
# plus one part rather than the file twice.
#
# Usage: join-parts.sh <out>      (expects <out>.parts/p* written by parallel-get.sh)
set -u
OUT="$1"; D="$OUT.parts"
[ -d "$D" ] || { echo "no parts directory $D"; exit 1; }
first=""
for f in "$D"/p*; do
  if [ -z "$first" ]; then first="$f"; continue; fi
  cat "$f" >> "$first" && rm -f "$f"
done
[ -n "$first" ] || { echo "no parts inside $D"; exit 1; }
mv -f "$first" "$OUT" && rmdir "$D" 2>/dev/null
echo "joined in place: $(stat -c%s "$OUT") bytes -> $OUT"
