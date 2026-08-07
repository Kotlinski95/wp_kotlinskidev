---
name: write-tests
description: "Write new tests for a theme component, block, PHP module, or template part — JS/TS unit, PHP unit, or E2E, whichever layer fits the target. Use when asked to add/write/cover tests for something specific (a block, a function file, a template part, a user-facing flow like header/footer/navigation). Pass the target as an argument, e.g. `/write-tests footer` or `/write-tests kotlinskidev/gallery-lightbox`."
---

# Write Tests

Target: $ARGUMENTS

## 1. Load the rules first

Read `.claude/rules/testing.md` (strict checklist) and the relevant section of `docs/testing.md` (narrative/rationale for each rule) before writing anything. Every rule in the checklist is mandatory, not a suggestion — it exists because it was learned the hard way once already.

## 2. Decide the layer

If the target is a block, first check whether it's actually a standalone block (`block.json` + `render.php` in `src/blocks/<name>/`) or a filter-based extension of existing core blocks (plain `index.tsx` using `blocks.registerBlockType`/`editor.BlockEdit`/`blocks.getSaveContent.extraProps`, no `block.json`) — the theme's own README lists both the same way in its block table, so don't assume from there, look at the directory. `animated-counter` is the latter; expect `active-link-state`, `border-gradient`, and `faq-layout` to be too.

- A `src/blocks/**/*.tsx` component or `src/utils/**/*.ts` function → JS/TS unit test, colocated (`*.test.ts` / `*.test.tsx`).
- A `functions/**/*.php` or `includes/**/*.php` module → PHP unit test in `tests/unit/`.
- A `parts/*.html` template part, a cross-block interaction, or anything that only makes sense in a real browser (scroll behavior, responsive layout, hover/click sequences, focus management) → E2E spec in `tests/e2e/`, frontend and anonymous.
- Verifying a block actually works *inside the Site Editor* itself (inserting it, its InspectorControls, live-preview behavior in the canvas) → an authenticated E2E spec in `tests/e2e/editor/`, opted in via `test.use({ storageState })` — see step 4b.

If the target spans layers (e.g. a block with both editor logic and frontend interaction), write tests for each applicable layer separately — don't force one layer to cover what another is better suited for. "Works both on the website and in the editor" for a given block usually means three things, not one: a JS/TS unit test for the `edit.tsx` component in isolation, a frontend E2E spec for what a visitor sees, and an editor E2E spec for what an editor using the Site Editor sees.

## 3. JS/TS unit or PHP unit: the standard loop

Write the test, run it (`npm run test:unit` / `composer test:unit`), iterate until green. No live-site verification needed — these run against code directly, not a running site.

## 3b. PHP integration (Pest + wp-phpunit + WP_UnitTestCase)

Runs today via `composer test:integration` — no Docker, self-contained `tests/integration/` sub-project. One file per `functions/*.php`/`includes/*.php` module in `tests/integration/tests/`, named `{StudlyModuleName}Test.php`, `uses(Tests\Integration\TestCase::class);` then plain Pest `it()`/`expect()`.

- Confirm the module's `require_once` in `functions.php` isn't commented out before writing anything — a file can have a correct hook registration and still be completely dead on the live site.
- Prefer `render_block(parse_blocks($comment))` over calling a `render_block` filter function directly — confirms the hook registration too, not just the function.
- `add_option($key, false)`, never `update_option($key, false)`, to set a boolean-false option from a clean state — `update_option` silently no-ops when old-and-new both resolve to "doesn't exist."
- Never `unset($_SERVER['REQUEST_URI'])` in cleanup — save/restore it instead, some WP core paths read it unconditionally.
- A function-local `static` cache or feature-detection `define()`d constant persists for the whole shared-process test run, not per test — don't try to test its dynamic/override behavior; test the order-independent parts only.
- Never call a function ending in `wp_send_json_*()`/`wp_die()`/bare `exit()` directly under this project's plain-`WP_UnitTestCase` base — it can kill the whole `pest` process mid-run with no summary. Test only the early-return branches.
- Global registries (`wp_scripts()`, `wp_styles()`) aren't covered by the per-test DB transaction rollback — a test can pass filtered-alone and fail in the full suite because an earlier file already registered the same handle. Always run the full suite once before calling a new integration test done.

## 4. E2E: verify before you select

Never write a Playwright selector from reading source code alone — confirm it against the real, running site first:

1. Read the relevant `parts/*.html`, block `render.php`, and any frontend `src/scripts/*.ts` to form a hypothesis about the DOM/behavior.
2. Write a throwaway Node script (e.g. `_probe.mjs` in the theme root — the `playwright` package is already installed) that launches a real **anonymous** browser context (`chromium.launch()` → `newContext()` — never reuse a logged-in browser session) against `http://kotlinskidev.local`, and dump the actual structure/attributes/behavior you're about to assert on.
   - Anonymous, not wp-admin: an authenticated session bypasses this site's page cache and can show different markup than real visitors — and Playwright, which is always anonymous — actually get.
3. Run it with `node _probe.mjs`, read the real output, and only then write selectors — based on what you observed, not what you assumed from source.
4. Delete every throwaway probe script before finishing. Never leave `_probe*.mjs` files in the repo or in git status.

## 4b. Editor/authenticated E2E: same discipline, different session

If the target requires an authenticated session (Site Editor, block insertion, InspectorControls):

- Never verify this by manually driving a logged-in browser session yourself — even for exploration. Write an authenticated probe script the same way as step 4, just using real credentials from `tests/e2e/.env` (`WP_TEST_ADMIN_USER`/`WP_TEST_ADMIN_PASSWORD`) and logging in via `/login/` (not `/wp-login.php` — this site's login URL is relocated; confirm with `wp option get whl_page` if in doubt, don't assume it's still `/login/`).
- A login-attempt limiter is active. Before ever submitting the probe's login form, navigate to `/login/` read-only first and confirm the field IDs/selectors haven't changed — don't burn attempts guessing.
- The real spec file goes in `tests/e2e/editor/`, opting into the saved session via `test.use({ storageState: path.join(process.env.WP_ARTIFACTS_PATH ?? path.join(process.cwd(), "artifacts"), ".auth", "admin.json") })` at the top of the file — never set `storageState` globally in `playwright.config.js`, that would silently authenticate the frontend specs too (which must stay anonymous — an authenticated session bypasses this site's page cache).
- Verify through the real runner (`npx wp-scripts test-playwright tests/e2e/editor/<file>.spec.ts`), not a standalone Node script — confirms `wp-scripts` actually picks up `globalSetup` from `playwright.config.js`.
- If `tests/e2e/.env` doesn't exist or lacks credentials, say so and stop — don't invent a workaround (don't create a new WP user without asking, don't fall back to manual browsing). Ask how to proceed.

## 4c. Editor interaction: use the official tooling, not raw canvas selectors

`@wordpress/e2e-test-utils-playwright` is already available (transitive dependency of `@wordpress/scripts` — confirm with `npm ls @wordpress/e2e-test-utils-playwright`, don't install it fresh). Import `Admin`/`Editor`/`PageUtils` and construct manually inside the same `storageState`-authenticated spec from step 4b — don't use the package's own fixture-wired `test`/`requestUtils`, which authenticate differently (REST API Basic Auth).

- `editor.insertBlock({ name, attributes })` over driving the inserter UI; `editor.getEditedPostContent()` to assert the real serialized markup a filter produced, rather than reading DOM state.
- A block's canvas wrapper is `role="document"` (name like `"Block: Heading 2"`), not `role="heading"` — `edit()` and `save()` are separate render trees.
- Never title a fixture/post with words that overlap something you're about to `getByRole(..., { name })` in the same test — the document-bar breadcrumb's accessible name is the post title and will collide.
- For "panel absent on an unsupported block," pick a block with no inner blocks (`core/separator`, not `core/quote` — wrapper blocks can auto-select a supported inner block, making the sidebar reflect the wrong block).
- For a frontend fixture (real content a spec needs to exist, created via WP-CLI rather than depending on live site content): `execFileSync("wp", [...args])`, never `execSync` with a shell string; `stdio: ["ignore", "pipe", "ignore"]` to avoid unrelated PHP-notice noise leaking into test output; `wp post get <id> --field=url`, not `post list --include=<id>` (doesn't filter the way it looks like it should). Verify cleanup actually happened (`wp post list --name=<slug> --field=ID` empty afterward), don't assume `afterAll` ran.
- `admin.createNewPost()` leaves a real `auto-draft` row every call even unsaved — normal WP behavior, self-cleaned by cron in ~7 days, not something to build custom cleanup for. A manual sweep after heavy iteration is enough.
- Confirm `reducedMotion` behavior with a throwaway probe rather than assuming — this project sets it via `use.contextOptions.reducedMotion`, and the whole suite defaults to `"reduce"`. Any animation-driven block needs `test.use({ contextOptions: { reducedMotion: "no-preference" } })` to exercise the actual animating path at all.
- For a **static block** (`save()`-based, no `render.php`), a hand-authored frontend fixture needs the real `<!-- wp:name {attrs} -->`/`<!-- /wp:name -->` block comment around the markup, not just the resulting HTML — WP's automatic `viewScript` enqueueing detects the block via the comment, not by scanning rendered HTML classes; omit it and the frontend script silently never loads. The comment's JSON blob is plain `JSON.stringify(...)` (no HTML-entity escaping, it's inside a comment) — only a real tag attribute like `data-*="..."` needs `&quot;`-escaped quotes.
- `RangeControl` renders two inputs (`role="slider"` + `role="spinbutton"`) sharing one `aria-label` — plain `getByLabel(...)` is ambiguous. Use `getByRole("spinbutton", { name })` to fill an exact value.
- It's correct, not a content-agnosticism violation, to assert an exact value against a fixture the test itself created and controls — that rule is about content you don't control, not all content.
- Before hand-replicating exact core-block markup in a fixture, check whether the server-side logic under test actually needs it — a structurally-naive filter (e.g. one that just regexes for `<img...>`/`<video...>` in rendered output) doesn't care about surrounding structure; a simple, non-canonical fixture is fine and lower-risk than trying to match core's real output precisely.
- Some core blocks (`core/image`, `core/cover`, ...) split their Inspector into a default "content" view and a separate **"Settings" sub-tab** — a plain `<InspectorControls>` (no `group` prop) only renders once that sub-tab is active. Call `openBlockSettingsTab(page)` (`tests/e2e/utils.ts`) after selecting a block and before looking for a custom panel — it's a safe no-op on blocks without this split.
- Clicking a `core/cover` block's content area in the canvas selects its **inner placeholder block**, not Cover itself — it always has one. Click the block toolbar breadcrumb (`page.getByRole("button", { name: "Cover", exact: true })`) right after to select the actual parent.
- Before asserting any click-driven interaction (backdrop-click-to-close, outside-click-to-dismiss), verify the target is actually reachable by a real click first — a full-bleed child (`flex: 1; width: 100%` inside a single-flex-item parent) can cover 100% of the parent's area, making an `e.target === parent` check unreachable regardless of what the source says. Confirm with `document.elementFromPoint(x, y)` at the target's edges in a throwaway probe; if nothing resolves to it, don't write the test — remove/skip it with a reason (`gallery-lightbox`'s "click backdrop to close" was unreachable this way).
- A panel can be conditional on block **content**, not block type (e.g. shown only when some attribute/array entry has a particular value) — same "insert twice, assert presence/absence" pattern as the unsupported-block-type case, just keyed on attributes instead.
- A wrapper element around a toggle-revealed control can exist unconditionally, before and after the toggle — don't assume a class you see in source is the "revealed" signal; confirm which element is actually new once the toggle fires.
- `getEditedPostContent()` omits any attribute still equal to its `block.json` default — only assert a key the test actually changed away from default.
- If a `render_block`/save filter derives its output purely from `$block['attrs']` (or `attributes` in JS), a fixture doesn't need the filter's own resulting classes/markup already present — confirm attribute-only derivation with a probe first, then write the minimal fixture.
- Repeated per-device/per-breakpoint control panels sharing identical labels (no `fieldset`/`aria-labelledby`) make `getByRole(name)` alone ambiguous. If each panel's heading is a direct sibling of its controls, scope via `page.getByRole("heading", { name, level }).locator("xpath=..")`.
- Before writing a test, grep whether the code path is actually reachable — a filter branch keyed on an attribute nothing ever sets is a permanent no-op; don't test it, note it instead.

## 5. Follow the content-agnostic selector rules exactly

This is the part most likely to be gotten wrong — re-read `.claude/rules/testing.md`'s selector section, don't paraphrase it from memory:

- Never select by visible text, menu label, or link text. Use structural, code-owned attributes instead (CSS classes defined in templates, `data-panel`, `aria-controls`, `aria-current`, `aria-expanded`, `role`, `rel`, input `type`).
- Never assert a hardcoded destination URL. Read the target link's real `href` at runtime and assert against that — reuse `clickAndExpectNavigation()` from `tests/e2e/utils.ts`; add a new shared helper there instead of a local one-off if another spec would benefit from it too.
- Exclude same-page/disabled links from every "pick any live link" locator, via `getFirstLiveLink()` / the `NOT_CURRENT_PAGE` fragment in `tests/e2e/utils.ts`.
- Don't click through external/third-party links — assert they look like a real external link (`href` matches `^https?:\/\//`) and stop there.
- If a test depends on current content having a specific *shape* (not just existing — e.g. a menu branch nested N levels deep, ≥2 siblings to test a collapse rule against), search live content for a qualifying example and `test.skip()` with a clear reason if none currently qualifies. Never hardcode which specific item is assumed to have that shape.
- Do apply that skip pattern to content-dependent shape; do not apply it to template-level structure — if a whole block/section is missing from `parts/*.html` entirely, that's a real regression to fail on, not skip past.
- Split viewport-dependent behavior into a nested `test.describe` + `test.use({ viewport })` inside the same spec file — not a separate spec file per breakpoint, not a second Playwright `project`.

## 6. Prove it isn't flaky

Run the new spec file at least 3 times in a row (`npx wp-scripts test-playwright tests/e2e/<file>.spec.ts`, repeated). A test built around `scrollTo`/animation/focus timing that only ran once is not done — confirm it settles the same way every run before moving on.

## 7. Clean up and verify tooling

- Delete any remaining probe scripts (`git status --short` should show only the real test file(s) and doc updates, nothing else).
- Lint everything touched (`npx eslint <changed files>`) and fix real findings — don't suppress a rule just to make it pass.
- Run the full relevant suite once more (`npm run test:unit` / `composer test:unit` / `npm run test:e2e`) to confirm nothing else broke.

## 8. Document it

- `docs/testing.md`: add what's covered and any non-obvious finding (a real gotcha, a structural surprise, a decision with a reason) to the relevant existing section — don't create a parallel section if one already covers this layer.
- `CHANGELOG.md`: add an entry under `[Unreleased]` → `### Added`, matching this file's existing style (the *why*, not just the *what* — see recent entries for tone/depth).
- If a genuinely new, reusable rule was learned (not specific to this one target), add it to `.claude/rules/testing.md` too — that file should stay in sync with what the test suite actually does.
