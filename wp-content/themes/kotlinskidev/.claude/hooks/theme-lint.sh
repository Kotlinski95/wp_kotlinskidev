#!/bin/bash
# PostToolUse: auto-format and lint files written/edited in theme src/

THEME_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
INPUT=$(cat)

# Extract file_path from JSON input using Python 3
FILE_PATH=$(python3 -c "
import sys, json
data = json.loads(sys.stdin.read())
print(data.get('tool_input', {}).get('file_path', ''))
" <<< "$INPUT" 2>/dev/null)

# Only act on files inside theme src/
if [[ -z "$FILE_PATH" || "$FILE_PATH" != "$THEME_DIR/src/"* ]]; then
  exit 0
fi

cd "$THEME_DIR" || exit 0

# Format with prettier on the specific file
npx prettier --write "$FILE_PATH" --log-level silent 2>/dev/null

# Lint only the edited file directly (bypassing wp-scripts glob patterns)
EXT="${FILE_PATH##*.}"
LINT_OUTPUT=""
LINT_EXIT=0
case "$EXT" in
  ts|tsx|js|jsx)
    LINT_OUTPUT=$(npx eslint --fix "$FILE_PATH" 2>&1)
    LINT_EXIT=$?
    ;;
  scss|css)
    LINT_OUTPUT=$(npx stylelint --config node_modules/@wordpress/scripts/config/.stylelintrc.json --fix "$FILE_PATH" 2>&1)
    LINT_EXIT=$?
    ;;
esac

# Build a concise summary for the conversation
if [[ $LINT_EXIT -eq 0 ]]; then
  LINT_SUMMARY="✓ No lint errors in ${FILE_PATH##*/}"
else
  LINT_SUMMARY="✖ Lint errors in ${FILE_PATH##*/}:\n${LINT_OUTPUT}"
fi

python3 -c "
import sys, json
summary = sys.argv[1]
print(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': 'PostToolUse',
        'additionalContext': summary
    }
}))
" "$LINT_SUMMARY"

exit 0
