---
name: verify
description: "Run every pre-commit and pre-push check in the kotlinskidev theme in one shot before committing or pushing. Use whenever the user asks to verify changes, run all checks, or prepare to commit/push."
---

# Verify

Run `npm run verify` from the theme root. It chains the full union of `.husky/pre-commit` + `.husky/pre-push`, fastest checks first, build last, fail-fast (stops at the first broken step, same as a real commit/push would):

`check-version-sync` → `prettier:check` → `lint:pkg-json` → `lint:md:docs` → `lint:css` → `lint:js` → `lint:i18n:js` → `security:secrets` → `security:sast` → `security:audit:php` → `security:audit:full` → `i18n:check` → `test:php` → `test:unit` → `build`

Deliberately excludes `test:e2e`/`test:php:integration` — they need a live site/Docker and aren't wired into either real hook either.

## Instructions

1. Run `npm run verify`, capturing full output (it's long — redirect to a file and `tail`/`grep` rather than trying to read it all inline).
2. If it exits 0, report success and stop. Don't stage, commit, or push anything yourself unless separately asked.
3. If it fails, fix the failing step and re-run the **whole** `npm run verify` command again (not just the one step) — later steps can depend on earlier ones being genuinely clean. Repeat until it exits 0. Known fixes for recurring failure types:

- **`lint:js` errors** — run `npm run lint:js:fix` first; it auto-fixes prettier/formatting issues. Anything left (usually `no-unused-vars` or similar) needs a manual code fix.
- **`lint:md:docs` errors** — usually a plain-notes `.md` file missing a top H1, using a bare URL, or missing a trailing newline. Fix only the formatting (add heading, wrap URLs in `<>`, add trailing newline) — never touch the file's actual content/wording.
- **`i18n:check` errors** — new or changed translatable strings left `en_US.po`/`pl_PL.po` with untranslated or fuzzy entries. Fix via `polib` (available in this environment), not by hand-editing `.po` files:
  1. Regenerate a fresh `.pot`: `php -d memory_limit=512M $(which wp) i18n make-pot wp-content/themes/kotlinskidev /tmp/fresh.pot --domain=kotlinskidev --path="$(pwd)"` (run from the WP root, i.e. two directories above the theme).
  2. Merge it into both files in place: `msgmerge -q -o languages/en_US.po languages/en_US.po /tmp/fresh.pot` (same for `pl_PL.po`).
  3. For `en_US.po`: every untranslated/fuzzy entry's `msgstr` should equal its `msgid` verbatim (identity translation — confirmed this project's existing convention). A short Python/polib loop does this in one pass; also strip the `fuzzy` flag on any entry you touch.
  4. For `pl_PL.po`: write real Polish translations for each untranslated/fuzzy `msgid` (check nearby already-translated strings for this project's established terminology, e.g. "Podstawowy" = Primary, "po najechaniu" = on hover) — a fuzzy entry's *current* `msgstr` is often stale text copied from a similar-but-wrong string, not a usable draft.
  5. Verify both are clean with `msgattrib --only-fuzzy --no-obsolete` / `--untranslated --no-obsolete` before moving on (ignore any `#~` obsolete-prefixed or plural-form `msgstr[0]` false positives from naive tooling).
  6. Regenerate compiled catalogs from the WP root: `php -d memory_limit=512M $(which wp) i18n make-mo wp-content/themes/kotlinskidev/languages`, then `make-php` the same way, then `make-json ... --no-purge`.
- **`security:audit:full` new high-severity vuln** — add the flagged package to `package.json`'s existing top-level `overrides` block (promote it to top-level, not nested under a specific parent, if the vulnerable copy is duplicated under multiple parents). Then:
  1. `npm install --package-lock-only --force` (updates only the lockfile). **Never use `--legacy-peer-deps`** — it silently drops peer-dependency auto-installation this project relies on (broke `@testing-library/dom` once already) even though it looks like the obvious fix for the pre-existing `@wordpress/scripts`/`@wordpress/env` peer conflict.
  2. `npm ci` (plain, no flags) to install cleanly from the updated lockfile — it doesn't re-resolve the tree the way `npm install` does, so it doesn't hit that same pre-existing peer conflict.
  3. Re-run `npm run test:unit` immediately to confirm nothing broke before trusting the fix.
- **A genuinely new high/critical vuln with no safe override** (rare) — stop and ask the user rather than adding an exception ID to `security:audit:full`'s `-x` flag yourself; that flag is for the project owner's own risk-acceptance calls, not something to add unilaterally.
