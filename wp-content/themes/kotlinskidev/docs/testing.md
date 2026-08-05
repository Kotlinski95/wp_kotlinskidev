# Testing

Four layers, each with a different scope and a different runtime cost. All four are installed and have at least one real, passing sample test. Coverage is intentionally low right now (see "Coverage baseline" below) — the goal of this pass was working infrastructure, not coverage percentage.

| Layer | Tooling | Scope | Needs |
|---|---|---|---|
| JS/TS unit | Jest + Testing Library | `src/**/*.{ts,tsx}` — utils, block components | nothing external |
| PHP unit | Pest 5 + Brain Monkey | `functions/`, `includes/`, `src/blocks/**/render.php` | nothing external |
| PHP integration | Pest 5 + `wp-phpunit` + `WP_UnitTestCase` | same PHP surface, but against a real loaded WordPress + DB | Docker (`wp-env`) — **not runnable in this environment**, see below |
| E2E | Playwright | real browser against a running site | a reachable WordPress instance |

## JS/TS unit tests

```bash
npm run test:unit           # run once
npm run test:unit:watch     # watch mode
npm run test:unit:coverage  # run + write coverage/js/
```

- Config: `jest-unit.config.js` (must keep this exact filename — `@wordpress/scripts`' `test-unit-js` looks for `jest-unit.config.js` specifically via `getJestOverrideConfigFile('unit')`; a file named `jest.config.js` would be ignored). It re-spreads `@wordpress/scripts/config/jest-unit.config.js` rather than replacing it, since Jest project config is override-not-merge.
- `@testing-library/react` + `@testing-library/user-event` for rendering block-editor components; `@testing-library/jest-dom` for matchers like `toBeInTheDocument()`/`toBeChecked()` (registered via `setupFilesAfterEnv`, alongside the WP preset's own setup file — specifying `setupFilesAfterEnv` replaces the preset's default, so both are listed explicitly).
- Sample tests: `src/utils/keyboardActivation.test.ts`, `src/utils/carousel/buildConfig.test.ts`, `src/utils/carousel/CarouselPanel.test.tsx`.
- `CarouselPanel.test.tsx` mocks `@wordpress/block-editor` (`jest.mock("@wordpress/block-editor", () => ({ __experimentalColorGradientControl: () => null }))`) instead of trying to make its dependency chain transformable. That chain (`@wordpress/block-editor` → `@wordpress/preferences` → nested `@wordpress/components`/`@wordpress/ui`/`@wordpress/theme`) ships some ESM-only `.mjs` files several `node_modules/` levels deep with no CJS fallback. `CarouselPanel` only *imports* the control, never renders it in any tested path, so mocking the whole module out is correct — chasing `transformIgnorePatterns` further would be fighting the wrong problem. If a future test needs to actually render something from that chain, revisit this.
- `transformIgnorePatterns` uses `"node_modules/(?!.*(uuid)/)"` — the leading `.*` matters because a naive `(?!(uuid)/)` only excludes `uuid` when it's the package immediately after the *first* `node_modules/` in the path, and misses it when `uuid` is nested deeper (e.g. `@wordpress/preferences/node_modules/uuid`).

## PHP unit tests

```bash
composer test:unit            # or: npm run test:php
composer test:unit:coverage   # or: npm run test:php:coverage — writes coverage/php/
```

- Config: `phpunit.xml`, testsuite `Unit`, files in `tests/Unit/`.
- Base class `Tests\TestCase` (`tests/TestCase.php`) wires Brain Monkey's `setUp()`/`tearDown()` around every test, so WordPress core functions (`esc_attr()`, `apply_filters()`, etc.) can be stubbed/asserted per-test with `Brain\Monkey\Functions`.
- `tests/Pest.php` binds `TestCase` to everything under `Unit` and also defines no-op `add_filter()`/`add_action()` stubs, guarded by `function_exists()`. These exist because this project's convention is file-scope `add_action`/`add_filter` calls (see `.claude/rules/php-functions.md`), which fire the instant a file is `require`'d — i.e. before Brain Monkey's per-test mocking is active. The stubs are defined once at bootstrap, not per test.
- Sample tests: `tests/Unit/SvgSupportTest.php` (pure-function SVG sanitisation, no mocking needed), `tests/Unit/BuildInlineSvgTest.php` (uses `Functions\when('esc_attr')->justReturn(...)`).
- Coverage driver is PCOV, invoked as `php -d pcov.directory=. vendor/bin/pest ...`. `pcov.directory` is `INI_SYSTEM`-scoped, so it cannot be set via `phpunit.xml`'s `<ini>` block at runtime (only via a real php.ini or a `-d` CLI flag) — and it defaults to `<cwd>/src`, which would silently exclude `functions/`/`includes/` entirely if left unset.

## PHP integration tests — scaffolded, currently blocked

```bash
composer test:integration   # or: npm run test:php:integration
```

Fully scaffolded (`phpunit-integration.xml`, `tests/Integration/bootstrap.php`, `tests/Integration/TestCase.php` extending `WP_UnitTestCase`, `tests/Integration/Pest.php`, a sample test in `tests/Integration/DeferredBlockAssetsTest.php`) and structurally verified — the bootstrap correctly reaches WordPress core's own `includes/bootstrap.php` before failing. It cannot currently run, for two independent reasons:

1. **No Docker.** `wp-env` (the normal way to get a WP test database) requires Docker, which isn't installed in this environment. `.wp-env.json` is in place for whenever Docker is available.
2. **A real upstream version conflict**, independent of Docker: WordPress core's test bootstrap hard-requires `yoast/phpunit-polyfills`, and its newest release (`4.0.0`) only supports PHPUnit up to `^12.0`. Pest 5 (this project's unit-test framework) requires PHPUnit `^13.x`. These two requirements cannot currently be satisfied in the same `composer.json` — `composer require --dev yoast/phpunit-polyfills` fails to resolve, and Composer correctly reverts on failure.

Deliberately not fixed by downgrading Pest project-wide — that would put the already-working Unit suite at risk to unblock a suite that needs Docker anyway. Revisit once `yoast/phpunit-polyfills` ships PHPUnit 13 support, or if a full `wordpress-develop` checkout (which sidesteps the polyfills package) becomes worth the setup cost.

## E2E tests

```bash
npm run test:e2e
```

- Runs via `wp-scripts test-playwright` (**not** `test-e2e`, which is a separate, older Puppeteer-based script that ships in the same `@wordpress/scripts` package — easy to reach for by habit and get the wrong tool).
- Config: `playwright.config.js`. Points at the real, already-running LocalWP site (`http://kotlinskidev.local` by default, override with `WP_BASE_URL`) rather than `wp-env`, since Docker isn't available here and this site is already up locally. No admin/editor flows are covered — there are no admin credentials available in this environment (WPS Hide Login blocks discovery) — so all e2e coverage is frontend-only.
- `locale: "pl-PL"` in the config matters beyond just browser locale: Playwright sends it as `Accept-Language`, and Polylang uses that header for auto-redirect. Setting it to anything other than the site's real default (`pl-PL`, confirmed via `curl`) breaks locale-dependent assertions.
- `viewport: { width: 1280, height: 800 }` is deliberately above this theme's desktop breakpoint (`$breakpoint-desktop: 1024px` per `src/styles/variables.scss`) — the `@wordpress/scripts` default viewport (960×700) falls inside the tablet range and changes which nav markup renders.
- Sample tests: `tests/e2e/homepage.spec.ts` — locale/title, main nav visibility, PL→EN language switch (the language links are gated behind a closed `button "PL"` dropdown that must be opened first), theme toggle (a styled `<button aria-label="Toggle light and dark theme">` wraps a CSS-hidden checkbox — target the button, not the input).
- `test.beforeEach` dismisses the Complianz cookie-consent banner (`getByRole("button", { name: "Akceptuję" })`) — it otherwise intercepts pointer events on every other interactive element on first load.

## npm scripts reference

| Script | Runs |
|---|---|
| `npm run test` | `test:unit` + `test:php` |
| `npm run test:coverage` | `test:unit:coverage` + `test:php:coverage` |
| `npm run test:unit` / `test:unit:watch` / `test:unit:coverage` | Jest |
| `npm run test:php` / `test:php:coverage` | Pest Unit suite (delegates to `composer test:unit` / `test:unit:coverage`) |
| `npm run test:php:integration` | Pest Integration suite — see blocker above |
| `npm run test:e2e` | Playwright |

## Git hook wiring

`.husky/pre-push` runs `test:unit` and `test:php` alongside the existing lint/format/build checks — both are fast and need nothing external, so they're cheap to gate a push on. `test:e2e` and `test:php:integration` are deliberately **not** in any hook: e2e needs a live site running locally, integration needs Docker, and neither should be able to block a push over an environment problem unrelated to the change being pushed. Run them manually before merging anything that touches navigation, language switching, theme toggling, or deferred block asset registration.

## Coverage baseline

Coverage collection works end-to-end for both JS and PHP and reports are written locally (`coverage/js/`, `coverage/php/` — both gitignored). No threshold is enforced yet, on purpose: this pass covers infrastructure, not coverage percentage, and a hard threshold at the current baseline would either gate on a near-zero number or immediately fail. Baseline at time of writing:

- JS/TS: 0.38% lines (`npm run test:unit:coverage`)
- PHP: 0.8% lines (`composer test:unit:coverage`)

Both numbers are close to zero because only the files touched by the sample tests (`buildConfig.ts`, `keyboardActivation.ts`, parts of `CarouselPanel.tsx`, `functions/svg-support.php`) have any tests at all yet — everything else is correctly reported as 0%, not broken.

As real coverage grows, add enforcement incrementally rather than all at once:

- JS: `coverageThreshold` in `jest-unit.config.js`, scoped per-file (`coverageThreshold: { "./src/utils/carousel/buildConfig.ts": { lines: 90 } }`) so newly-covered files can be locked in without the global number blocking everything else.
- PHP: `vendor/bin/pest --coverage --min=X` (`X` matched to whatever the real number is at the time), added to `composer.json`'s `test:unit:coverage` script once it's no longer trivially 0.

There's no CI pipeline in this repo (no `.github/workflows/`) — until one exists, "monitored" means: reports are generated on every `test:*:coverage` run, checked into `.gitignore` (not committed), and reviewed locally via `coverage/js/lcov-report/index.html` / `coverage/php/index.html`.
