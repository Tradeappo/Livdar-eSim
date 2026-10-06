#!/usr/bin/env python3
"""Refuse to let a script be edited while it is executing. Exit 0 when safe, 1 when not.

    python3 scripts/atlas/scale/assert-not-running.py run-1m-pipeline.sh && <make the edit>

WHY THIS EXISTS, in full, because it cost a run on 2026-10-06. bash reads a script
INCREMENTALLY as it executes: it keeps a byte offset into the file and reads the next command
from there when the current one finishes. Editing the file mid-run shifts every later byte, so
when bash next reads it resumes at an offset that now lands in the middle of a different
construct. The result is a syntax error in a file that is perfectly valid:

    run-1m-pipeline.sh: line 131: syntax error near unexpected token `do'

That run had just finished the POI aggregation, the expensive stage, and died on the next line.
`bash -n` on the file passed, which is exactly what makes the failure confusing: the file is
fine, the READER is at the wrong place in it.

A guard for this was written the same day, inside a one-off patch script, and then bypassed
twenty minutes later by editing the runner through a different path. A check that lives inside
one caller protects one caller. So it lives here, where anything can call it.

NOT pgrep -f. That matches this very process's own command line through the shell wrapper that
launched it, which is how an earlier guard in this project reported "running" against itself and
how a pkill -f earlier still returned exit 144. The check reads /proc argv directly: a real
invocation is an interpreter with the script path as an argument, and the current process and
its parent are excluded.
"""
import glob
import os
import sys

INTERPRETERS = ('bash', 'sh', 'dash', 'zsh', 'ksh', 'python', 'python3', 'node', 'perl', 'ruby')


def holders(script_name):
    """Every pid currently executing a script whose path ends with this name."""
    me = {os.getpid(), os.getppid()}
    found = []
    for path in glob.glob('/proc/[0-9]*/cmdline'):
        try:
            pid = int(path.split('/')[2])
        except (IndexError, ValueError):
            continue
        if pid in me:
            continue
        try:
            with open(path, 'rb') as fh:
                argv = [a.decode('utf-8', 'replace') for a in fh.read().split(b'\0') if a]
        except OSError:
            continue
        if len(argv) < 2:
            continue
        if not os.path.basename(argv[0]).startswith(INTERPRETERS):
            continue
        # argv[1:] rather than argv[1] alone, because an interpreter may take flags first
        for arg in argv[1:]:
            if os.path.basename(arg) == os.path.basename(script_name):
                found.append((pid, ' '.join(argv)[:140]))
                break
    return found


def main():
    if len(sys.argv) < 2:
        sys.exit(f'usage: {os.path.basename(sys.argv[0])} <script name> [<script name> ...]')
    bad = False
    for name in sys.argv[1:]:
        hs = holders(name)
        if hs:
            bad = True
            print(f'REFUSING: {name} is being executed right now, so editing it would move the '
                  f'bytes its interpreter has not read yet.', file=sys.stderr)
            for pid, cmd in hs:
                print(f'    pid {pid}: {cmd}', file=sys.stderr)
        else:
            print(f'safe to edit: {name} is not executing', file=sys.stderr)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
