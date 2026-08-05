#!/usr/bin/env bash

THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GIT_ROOT="$(cd "$THEME_DIR" && git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "$GIT_ROOT" ]; then
  echo "setup-husky: not inside a git repository, skipping hook setup"
  exit 0
fi

RELATIVE_HUSKY_DIR="${THEME_DIR#"$GIT_ROOT"/}/.husky"

cd "$GIT_ROOT"
"$THEME_DIR/node_modules/.bin/husky" "$RELATIVE_HUSKY_DIR"
