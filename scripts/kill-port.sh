#!/usr/bin/env sh
# Free the dev server port (default 3000, or PORT env)
P="${PORT:-3000}"
if command -v lsof >/dev/null 2>&1; then
  pids=$(lsof -ti:"$P" 2>/dev/null)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9 2>/dev/null
    echo "Freed port $P"
  fi
fi
