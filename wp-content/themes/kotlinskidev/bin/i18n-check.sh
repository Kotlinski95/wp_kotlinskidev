#!/usr/bin/env bash

THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WP_ROOT="$(cd "$THEME_DIR/../../.." && pwd)"
PLUGIN_DIR="$WP_ROOT/wp-content/plugins/wordpress-pwa-manager"

for bin in wp msgmerge msgfmt msgattrib; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing required tool: $bin"
    echo "Install WP-CLI (https://wp-cli.org) and gettext (brew install gettext / apt-get install gettext) first."
    exit 1
  fi
done

OVERALL_FAIL=0

check_catalog() {
  local name="$1" source_dir="$2" domain="$3" languages_dir="$4"
  local tmp_pot
  tmp_pot="$(mktemp)"

  if ! wp i18n make-pot "$WP_ROOT/$source_dir" "$tmp_pot" --domain="$domain" --path="$WP_ROOT" --quiet >/dev/null 2>&1; then
    echo "[$name] wp i18n make-pot failed — skipping"
    rm -f "$tmp_pot"
    OVERALL_FAIL=1
    return
  fi

  local po
  for po in "$languages_dir"/*.po; do
    [ -e "$po" ] || continue
    local tmp_merged stats untranslated fuzzy
    tmp_merged="$(mktemp)"
    if ! msgmerge -q -o "$tmp_merged" "$po" "$tmp_pot" 2>/dev/null; then
      echo "[$name] $(basename "$po"): msgmerge failed"
      OVERALL_FAIL=1
      rm -f "$tmp_merged"
      continue
    fi
    stats="$(msgfmt --statistics -o /dev/null "$tmp_merged" 2>&1)"
    untranslated="$(grep -oE '[0-9]+ untranslated' <<<"$stats" | grep -oE '[0-9]+')"
    fuzzy="$(grep -oE '[0-9]+ fuzzy' <<<"$stats" | grep -oE '[0-9]+')"
    untranslated="${untranslated:-0}"
    fuzzy="${fuzzy:-0}"

    if [ "$untranslated" -gt 0 ] || [ "$fuzzy" -gt 0 ]; then
      OVERALL_FAIL=1
      echo "[$name] $(basename "$po"): $stats"
      msgattrib --untranslated --no-obsolete "$tmp_merged" 2>/dev/null | grep '^msgid "' | grep -v '^msgid ""$' | sed 's/^msgid /    missing: /'
      msgattrib --only-fuzzy --no-obsolete "$tmp_merged" 2>/dev/null | grep '^msgid "' | grep -v '^msgid ""$' | sed 's/^msgid /    fuzzy:   /'
    else
      echo "[$name] $(basename "$po"): OK ($stats)"
    fi
    rm -f "$tmp_merged"
  done

  rm -f "$tmp_pot"
}

check_catalog "theme" "wp-content/themes/kotlinskidev" "kotlinskidev" "$THEME_DIR/languages"

if [ -d "$PLUGIN_DIR" ]; then
  check_catalog "wordpress-pwa-manager" "wp-content/plugins/wordpress-pwa-manager" "wordpress-pwa-manager" "$PLUGIN_DIR/languages"
fi

if [ "$OVERALL_FAIL" -ne 0 ]; then
  echo ""
  echo "i18n check failed: untranslated or fuzzy strings found. Translate them and re-run 'wp i18n make-mo/make-php/make-json' for the affected catalog."
  exit 1
fi

echo ""
echo "i18n check passed: no untranslated or fuzzy strings."
