#!/usr/bin/env bash
set -euo pipefail

manifest="$1"
output="$2"

: > "$output"

yq -r '.exclude[]' "$manifest" | while IFS= read -r pattern; do
  printf -- '- %s\n' "$pattern" >> "$output"
done

declare -A seen_parents

while IFS= read -r entry; do
  entry="${entry#/}"
  trimmed="${entry%/}"
  IFS=/ read -ra parts <<< "$trimmed"
  accumulated=""
  for ((i = 0; i < ${#parts[@]} - 1; i++)); do
    accumulated="$accumulated/${parts[i]}"
    if [[ -z "${seen_parents[$accumulated]:-}" ]]; then
      printf -- '+ %s/\n' "$accumulated" >> "$output"
      seen_parents[$accumulated]=1
    fi
  done
  if [[ "$entry" == */ ]]; then
    printf -- '+ /%s***\n' "$entry" >> "$output"
  else
    printf -- '+ /%s\n' "$entry" >> "$output"
  fi
done < <(yq -r '.include[]' "$manifest")

printf -- '- *\n' >> "$output"
