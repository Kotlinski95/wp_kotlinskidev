---
name: clean-code
description: "Refactor one batch of the kotlinskidev theme to clean code (SOLID, DRY, YAGNI, no comments, intention-revealing names, small functions) WITHOUT changing behavior. Use when asked to clean up, refactor, simplify or tidy a file, folder, block or batch from docs/clean-code-plan.md. Pass the batch id or a path, e.g. `/clean-code B3.1` or `/clean-code src/utils`."
---

# Clean Code Refactor

Target: $ARGUMENTS

The goal is code the owner can read top to bottom and understand without comments. Behavior, output and public contracts stay exactly the same. A refactor that changes what a visitor, an editor, the database or another module sees is a bug.

## 1. Before touching code

1. Read `docs/clean-code-plan.md` and find the batch. Work only on the files it lists. If the target is a path, treat that path as the batch.
2. Read the matching rules: `.claude/rules/typescript.md`, `.claude/rules/php-functions.md`, `.claude/rules/php-patterns.md`, `.claude/rules/scss.md`, `.claude/rules/testing.md`.
3. Run `graphify query "<batch topic>"` and `graphify explain "<main symbol>"` to see callers and dependents before any rename or move.
4. Record the baseline: run the tests that cover the batch (`npm run test:unit -- <path>`, `composer test:unit -- --filter <Name>`). If the batch has no test that pins its behavior, write a characterization test first (see `/write-tests`), then refactor.

## 2. Frozen contracts (never change)

- Block names, block attribute names and defaults, `save.tsx` output (static block markup is stored in post content; any change invalidates blocks).
- CSS class names and custom properties that appear in saved content, patterns, templates or `theme.json`.
- WordPress hook names, filter names, option keys, meta keys, transient keys, REST routes, AJAX actions, shortcode names, pattern slugs, template slugs.
- PHP function names that are hooked, called from templates, patterns, `render.php`, `block.json` (`render`, callbacks) or the database. Check with `rg` and with `wp db query "SELECT ID FROM wp_posts WHERE post_content LIKE '%<name>%'"` (WP-CLI needs `-d memory_limit=512M`).
- User-facing strings and their text domain (translations key on the exact string).
- Exported TS names used by other entries, and anything in `window.*` globals.

If a contract name is bad, leave it and note it in the batch report as a candidate for a separate, deliberate migration.

## 3. Rules to apply

### Names

- Variables and functions say what they hold or do: `visibleCards`, `resolveTranslatablePost()`, not `data`, `tmp`, `handle()`, `doStuff()`.
- Booleans read as questions: `isOpen`, `hasPoster`, `shouldLazyLoad`.
- Event handlers start with `on`, hooks with `use`, components in PascalCase, PHP functions in `kotlinskidev_snake_case`.
- No abbreviations except well-known ones (`id`, `url`, `html`, `css`, `api`).

### Functions

- One job per function. Aim for 25 lines or fewer, hard limit 40. Split by step, not by line count.
- At most 3 parameters; group the rest into a typed object / associative array with a clear name.
- Early returns instead of nested `if`. No flag arguments that switch behavior; split into two functions.
- Pure helpers separated from code with side effects (DOM, `add_action`, DB, network).

### Files and modules (SOLID)

- Single responsibility per file. Target 300 lines or fewer; split larger files by responsibility into sibling modules (`settings-page/` folder, `slider/swiper-*.ts`).
- Depend on small functions passed in or imported from `@utils`, not on globals reached from deep inside.
- Extend through hooks, filters and `supports`, never by editing core behavior.

### DRY

- Same logic in 3 or more places becomes one shared helper (`src/utils/` for TS, a focused `functions/*.php` helper for PHP). Two similar places stay as they are unless they are identical.
- Before writing a helper, search for an existing one (`rg`, graphify).

### YAGNI

- Remove dead code only when proven dead: no references in `src/`, `functions/`, `includes/`, `patterns/`, `templates/`, `parts/`, `theme.json`, `block.json`, tests, and no match in the database. Unproven means keep it and list it in the report.
- No speculative parameters, options or abstractions.

### No comments

- Delete explanatory comments; move their meaning into names, small functions or types.
- Keep only tool directives: `phpcs:ignore` / `phpcs:disable` (with their reason text), `eslint-disable-next-line`, `@ts-expect-error`, plugin/theme file headers WordPress parses (`Plugin Name`, `Title:`, `Slug:` in patterns, `Template Name`), WP-CLI command docblocks (`@subcommand`, `## EXAMPLES`: WP-CLI parses them), `/* translators: */` comments (i18n tools parse them) and license headers.
- A comment that documents a non-obvious external constraint (browser bug, WP core quirk) becomes a well-named function or constant; if that is impossible, add the fact to the relevant `.claude/rules/*.md` or `docs/` file instead.

### Types and safety

- TypeScript: no `any`; use `unknown` and narrow. Explicit interfaces for attributes, props and API responses.
- PHP: sanitize input and escape output exactly as before; never remove a `wp_kses`, `esc_*`, nonce or capability check while moving code.

## 4. How to work

1. Make the change in small steps. After each file: run its tests and `npx eslint <file>` / `npx stylelint <file>` / `php -l <file>`.
2. Keep each batch reviewable: one batch per commit, no unrelated edits, no reformatting of untouched files.
3. When a move changes a file path, update imports, `functions.php` requires, webpack entries and `docs/treeview.md`.
4. At the end of the batch run, in order:
   - `npm run lint:js && npm run lint:css && npm run prettier:check`
   - `npm run test:unit` and `npm run test:php`
   - `npm run build`
   - `graphify update .`
5. Output: run `npm run snapshot:compare`. Every page must print `same`; any `CHANGED` line is a behavior change to fix before reporting. It compares rendered markup of the pages in `bin/html-snapshot-urls.txt` against the baseline in `artifacts/clean-code-baseline/` (inline scripts, styles, asset versions, nonces and `uniqid()` tokens are masked). Static blocks also need their `save.tsx` test or snapshot to pass unchanged. If the batch touches a template or block not on those pages, add its URL to `bin/html-snapshot-urls.txt` and run `npm run snapshot:capture` BEFORE refactoring.

### Database safety

- Smoke scripts and tests must be read-only against the local database: no `update_option`, `delete_option`, `wp_update_post`, `wp option update/delete`, `wp post delete` or direct SQL writes on real options, posts or terms.
- To exercise a code path that writes, run it against a throwaway key (for example `kotlinskidev_smoke_<name>`) that you delete afterwards, or capture a value first with `get_option` and put it back in the same script even if the code under test fails (use `try`/`finally`).
- If any real data changed by accident, stop, report the exact key and previous value, and do not repair it yourself.

### TypeScript, SCSS and block batches

- Run `npm run dom:compare` after `npm run build`. It loads 10 key pages (`bin/dom-snapshot-urls.txt`) at desktop and iPhone-13 sizes, scrolls through them, and compares the rendered DOM after JavaScript has run (classes, attributes, ARIA state, carousels, lazy loading, protected content) plus the console error list against `artifacts/dom-baseline/`. Every line must print `same`. Capture the baseline with `npm run dom:capture` BEFORE the first edit of a batch; if the batch touches a script that acts on a page not in the list, add that URL first. Never re-capture to hide a difference.
- Unit tests are not enough for scripts: a rename that breaks an event handler or selector usually passes Jest and fails the DOM compare.
- Static blocks: `save.tsx` output is stored in post content, so its markup must be byte-identical: the block's save test or snapshot must pass unchanged, and `npm run test:patterns` must stay green when patterns use the block.
- `block.json` (attributes, supports, name, `render`) and `build/` entry names are frozen; webpack entries change only when the batch moves files and `npm run build` still emits the same asset names (`npm run check-asset-budget`).

## 5. Report (keep it short)

```text
Batch: <id> — <files>
Changed: <one line per file: what got clearer>
Removed: <dead code, with the proof it was dead>
Kept on purpose: <contracts or suspected dead code not removed, why>
Checks: lint ✓/✗, unit ✓/✗, php ✓/✗, build ✓/✗, output diff ✓/✗
Follow-ups: <items for later batches>
```

Do not commit, bump the version or edit `CHANGELOG.md`; the main session does that per batch.
