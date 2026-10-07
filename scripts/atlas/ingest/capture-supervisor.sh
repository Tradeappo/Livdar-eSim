#!/bin/bash
# Keep the capture queue alive, and record what killed it when it dies.
#
# The queue died twice on 2026-10-06 and 2026-10-07, both times within seconds of a failed
# download attempt, with no further line in its log. Three things were ruled out by test rather
# than by assumption:
#   - a detached background process does survive across tool calls: a setsid nohup script with
#     ppid 1 and its own session id ran through two sleeps and was still alive afterwards
#   - the agent proxy recorded no relay failure (recentRelayFailures was empty)
#   - the runner has no trap and no set -e, so a failed attempt cannot exit the loop early
# So the cause is still unknown, and the honest response is to supervise it and to capture the
# signal if one arrives, instead of relaunching by hand and hoping.
#
# Usage: capture-supervisor.sh [max-restarts]
set -u
cd /home/user/Livdar-eSim || exit 1
MAX="${1:-40}"
LOG_DIR="${CAPTURE_LOG_DIR:-/tmp/parents_work/logs}"
mkdir -p "$LOG_DIR"
SUP="$LOG_DIR/supervisor.log"

say() { echo "[$(date -u +%FT%TZ)] $*" >> "$SUP"; }

say "supervisor starting, max $MAX restarts, pid $$, session $(ps -o sid= -p $$ | tr -d ' ')"
for i in $(seq 1 "$MAX"); do
  RUN_LOG="$LOG_DIR/queue-run-$i.log"
  say "run $i starting, log $RUN_LOG"
  # exec'd in a subshell with its own signal trap so a kill is recorded rather than silent.
  (
    trap 'echo "[$(date -u +%FT%TZ)] TRAPPED SIGTERM" >> "'"$SUP"'"; exit 143' TERM
    trap 'echo "[$(date -u +%FT%TZ)] TRAPPED SIGHUP"  >> "'"$SUP"'"; exit 129' HUP
    trap 'echo "[$(date -u +%FT%TZ)] TRAPPED SIGINT"  >> "'"$SUP"'"; exit 130' INT
    ./scripts/atlas/ingest/osm-priority-queue.sh
  ) > "$RUN_LOG" 2>&1 < /dev/null
  RC=$?
  say "run $i exited rc=$RC after $(wc -l < "$RUN_LOG") log lines"
  if [ "$RC" = 0 ]; then
    say "queue finished cleanly, supervisor stopping"
    exit 0
  fi
  # No sleep between runs. The backoff inside the runner already paces the mirror, and every
  # restart resumes from the bytes on disk, so an immediate retry costs nothing.
done
say "supervisor giving up after $MAX runs"
