#!/bin/bash
# Did a stage actually produce what it claims? Called after any stage whose failure must stop
# the run.
#
# This exists because of 2026-10-05. poi-parent-assign.py was OOM-killed at 11.1GB, the runner
# printed "parent assignment: see the log" and CARRIED ON, and the run went all the way to the
# manifest with containment parents that predated Australia, Mexico and Indonesia. A stage that
# could not finish produced an artifact that looked finished. The manifest stage, by contrast,
# has been fatal since the day it failed silently and left every downstream artifact describing
# a manifest that no longer existed. Those two call sites disagreed about how serious a missing
# stage is, and the parent assignment was the one that was wrong.
#
# Four checks, because any one of them alone has a hole:
#   exit code    catches a crash, and NOT an OOM kill that the shell reports as 137, nor a stage
#                that exits 0 after writing nothing
#   file exists  catches a stage that died before its first write
#   row count    catches a truncated or empty output, which an exists check passes
#   freshness    catches the case that actually happened: a complete file from an EARLIER run
#                sitting on disk while this run's attempt died. Without this the other three
#                all pass and the run proceeds on stale data.
#
# Usage: verify-stage-output.sh <name> <exit code> <file> <min rows> <newer-than-file>
set -u
NAME="${1:?stage name}"
CODE="${2:?exit code}"
FILE="${3:?output file}"
MINROWS="${4:-1}"
NEWER="${5:-}"

fail() { echo "  STAGE CHECK FAILED [$NAME]: $*" >&2; exit 1; }

[ "$CODE" = "0" ] || fail "exited $CODE (137 and 143 mean it was killed, usually out of memory)"
[ -f "$FILE" ] || fail "no output at $FILE"

# Row count on a gzipped jsonl, or bytes for anything else.
case "$FILE" in
  *.gz) ROWS=$(zcat "$FILE" 2>/dev/null | wc -l) ;;
  *)    ROWS=$(wc -l < "$FILE" 2>/dev/null || echo 0) ;;
esac
[ "$ROWS" -ge "$MINROWS" ] 2>/dev/null \
  || fail "$FILE holds $ROWS rows, below the $MINROWS this stage must produce"

if [ -n "$NEWER" ] && [ -e "$NEWER" ]; then
  if [ ! "$FILE" -nt "$NEWER" ]; then
    fail "$FILE is NOT newer than $NEWER, so it is left over from an earlier run and this run's
  attempt did not write it. This is the check that catches a complete-looking stale artifact,
  which the exit code, the existence check and the row count all pass."
  fi
fi
echo "  stage check ok [$NAME]: $(basename "$FILE"), $ROWS rows, newer than its inputs" >&2
