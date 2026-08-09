# Changelog

All notable changes to the kotlinskidev theme are documented in this file. Entries are kept short (2-3 sentences) — for full technical detail on any entry, see the referenced files' own git history/commit messages.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this theme follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking change: removed/renamed a block or attribute, a template/pattern change that requires editors to re-save affected content, a markup change that isn't backward compatible.
- **MINOR** — new, backward-compatible capability: a new block, a new attribute, a new pattern, a new editor control.
- **PATCH** — bug fix, style tweak, security fix with no new capability.

**When releasing:** bump `Version` in `style.css` and `"version"` in `package.json` together (they must always match), move the `[Unreleased]` entries under a new dated version heading, and start a fresh empty `[Unreleased]` section. See `docs/treeview.md` for the full current structure reference — update it alongside any change that adds/removes/renames a block, pattern, template, function module, or test file. See `.claude/skills/sync-docs/SKILL.md` for the full checklist to run before considering any change "done."

This file starts tracking from 2026-07-28. Work before that date was ticket-based (see `git log`, tickets `T3`–`T16`) and is not itemized retroactively — `1.0.0` below represents the theme's accumulated state as of this file's creation, not a dated release. Each entry below is dated to the day the underlying work happened, reconstructed from `git log` where not tracked live.

---

## [Unreleased]

### Chore

- **2026-08-09** — Added `npm run check-version-sync` (`bin/check-version-sync.js`), wired into `.husky/pre-push`, to catch `style.css`/`package.json` version drift automatically instead of relying on remembering to bump both by hand.
- **2026-08-09** — Fixed a real bug in `bin/i18n-check.js`: its "missing:"/"fuzzy:" listing silently omitted any string long enough for `wp i18n make-pot` to word-wrap across multiple lines (their first line is always the bare `msgid ""` marker, which the listing filter explicitly excluded). It caught the correct untranslated *count* but hid 6 of them from the printed list — inherited unchanged from the original bash version, not introduced by the earlier Node rewrite. Fixed by passing `--no-wrap` to `msgattrib` so every msgid stays on one line. Verified with a real regression test: blanked a known translation, confirmed it's now listed, restored it.
- **2026-08-09** — Translated the 17 real strings the Security tab work left behind untranslated (11 shown by the check, 6 hidden by the bug above) plus 1 wrong fuzzy match (`msgmerge` had fuzzy-matched the new "Mode" field label to an unrelated existing Polish translation, "Tryb zapętlenia" — loop mode — which had nothing to do with CSP enforcement mode). Both `pl_PL.po`/`en_US.po` recompiled (`.mo`/`.l10n.php`/JSON) and now pass `npm run i18n:check` clean at 1151/1151.
- **2026-08-09** — Fixed `tests/unit/SettingsPageTest.php`'s hardcoded tab-list assertion, same drift as the integration test fixed earlier — missed this second copy the first time since the two suites (Brain Monkey unit vs. real `WP_UnitTestCase` integration) live in separate directories with no shared fixture. Full suite green: 470 unit + 402 integration.
- **2026-08-09** — Rewrote `bin/i18n-check.sh` and `bin/setup-husky.sh` as `i18n-check.js`/`setup-husky.js` (Node instead of bash), keeping this project's tooling in one language. Verified byte-for-byte output parity against the originals, including the untranslated/fuzzy-string listing path, before deleting the `.sh` versions.
- **2026-08-09** — Fixed `.markdownlint.json`'s `MD024` (no-duplicate-heading) to `siblings_only: true` — its default flagged repeated `### Chore`/`### Fixed`/etc. headings across different `## [version]` sections as duplicates, which is normal and required by the Keep a Changelog format this file follows.

### Security

- **2026-08-09** — Added `docs/security-headers.md`: HTTP security header reference grounded in the OWASP Secure Headers Project's current recommendations and a confirmed EU legal read (GDPR Art. 32 applies; NIS2/CRA don't at this site's scale), with a real audit finding zero security headers currently set anywhere in the stack. Includes a site-specific CSP domain inventory (Google Fonts/Maps, Facebook Pixel, Google Analytics, Cloudflare Turnstile) and a PHP-vs-Cloudflare implementation split — no code changed yet, this is the reference the implementation will follow.
- **2026-08-09** — Added the `security-headers` Claude Code skill (`.claude/skills/security-headers/SKILL.md`) so future header/CSP/third-party-script work loads `docs/security-headers.md` first instead of reconstructing generic advice.
- **2026-08-09** — Implemented `Referrer-Policy`, `Permissions-Policy`, and a site-specific `Content-Security-Policy-Report-Only` via new `functions/security-headers.php` (`wp_headers` filter, skips `wp-admin`/REST). Verified via 3 integration tests, real `curl -I` checks (present on frontend, absent on `wp-admin`/`wp-json`), and a real browser pass across the homepage/an article/the Google-Maps-loaded Contact page — zero CSP violations observed. `Strict-Transport-Security`/`X-Content-Type-Options`/`X-Frame-Options` deliberately live at the Cloudflare edge instead (manual setup, not yet done); CSP stays Report-Only and `script-src`/`style-src` keep `'unsafe-inline'` until a longer monitoring window and optional nonce-hardening — both tracked as open items in `docs/security-headers.md` rather than silently dropped.
- **2026-08-09** — Made every CSP directive admin-configurable: a new Security tab (Settings → Kotlinski.dev, `functions/settings-page.php`) with a master enable toggle, a Report-Only/Enforcing mode toggle, and one text field per directive, all falling back to `functions/security-headers.php`'s existing defaults when unset. The point: this theme's CSP setup is now reusable across other WordPress sites without editing PHP — configure per-site from wp-admin instead. Verified end-to-end in a real browser (edit → save → confirmed the new value in the live response header via `curl` → reverted); added 2 more integration tests, full suite still green at 397.
- **2026-08-09** — Extended the same admin-configurability to `Referrer-Policy` (dropdown, 8 valid values) and `Permissions-Policy` (textarea) — no security header on this site is hardcoded anymore. Revised the Cloudflare guidance in `docs/security-headers.md` after review: only `X-Content-Type-Options`/`X-Frame-Options` belong in a Cloudflare Transform Rule now — `Referrer-Policy`/`Permissions-Policy` must stay WordPress-only, since Cloudflare's `Set` operation unconditionally overwrites an origin-set header of the same name and would silently defeat the new per-customer configurability. Also folded in corrected TLS guidance (SSL/TLS Full (Strict), Always Use HTTPS, Minimum TLS 1.2, and a more precise HSTS `includeSubDomains` caveat for any non-HTTPS-proxied `cp.`/`ssh.`-style subdomains). Verified the new fields end-to-end in a real browser same as the CSP fields; full suite green at 402.
- **2026-08-09** — Restructured `docs/security-headers.md` with a clear "what's applied vs. what's still needed" status section (§0), split into WordPress-level (done), WordPress-level (deferred), and Cloudflare/3rd-party-level (not yet done) checklists — replaces the previous scattered prose with one scannable answer to "is the site fully protected yet." Includes a confirmed note that Wordfence (active on this site) sets no HTTP response headers, so it doesn't overlap with or reduce anything on the list.

---

## [1.1.0] — 2026-08-09

### Chore

- **2026-08-05** — Wired `prettier:check`/`lint:css`/`lint:js` into `.husky/pre-commit`, and those plus `lint:pkg-json`/`lint:md:docs`/`i18n:check`/`security:secrets`/`build` into `.husky/pre-push`. Required a custom `bin/setup-husky.sh` since this repo's git root and `package.json` live in different directories.
- **2026-08-05** — Cleared `lint:pkg-json`, `lint:i18n:js`, `i18n:check`, and `lint:md:docs` (all previously failing, never run before). Fixed `package.json`'s wrong license field and missing metadata, filled the translation gap the pass surfaced, and added `.markdownlint.json`/`.markdownlintignore` for this project's 2-space list-indent convention.
- **2026-08-05** — Resolved a Prettier/stylelint conflict on SCSS (tabs vs. spaces, disagreeing line-wrap behavior) by removing `.scss`/`.css` from Prettier's scope entirely — stylelint is now the sole CSS/SCSS formatter, with `lint:css:fix` added alongside it.
- **2026-08-05** — Cleared `npm run lint:js` (430 → 0 problems) and `npm run lint:css` (90 → 0 errors): real bugs fixed (hooks-in-object-shorthand blind spot, untranslatable string concatenation, keyboard-inaccessible custom controls, dead `tailwind.css`/duplicate selectors) alongside several rules tuned with justification recorded inline.
- **2026-08-05 to 2026-08-06** — Built out theme-wide test coverage: 996 JS/TS tests (88.91% coverage), 470 PHP unit tests, and a new 238-test PHP integration suite (its own isolated toolchain, since `wp-phpunit` needs PHPUnit 9.6 while the main suite runs Pest 5/PHPUnit 13). Found and fixed 3 real bugs purely by writing tests: a broken `responsive-order` CSS class, an ignored slider keyboard-disable option, and a mismatched translation-group key.
- **2026-08-07** — Wired `security:sast` into `.husky/pre-commit` now that its two known findings are genuinely fixed rather than suppressed.
- **2026-08-09** — Fixed unbounded `wp_posts` growth from `npm run test:e2e`: every editor test's `admin.createNewPost()` leaves a real `auto-draft` row that WP-Cron only reaps after 7 days — a direct DB audit found 422 accumulated in just two days of runs. Added `test:e2e:purge-drafts`, chained into `test:e2e` itself so it always runs regardless of pass/fail (npm's automatic `post`-hook does **not** fire on failure, confirmed empirically).

### Security

- **2026-08-05** — Added `security:audit:php` (`composer audit`) and `security:secrets` (`gitleaks`, scoped to this theme's own commit history) alongside the existing `security:audit`/`security:sast`.
- **2026-08-05** — `security:secrets`' first run found a real private key committed directly into `wp-config.php`, already pushed to the GitHub remote. Flagged, not fixed (that file is off-limits per project rules) — **needs rotation and removal from version control** as its own follow-up.
- **2026-08-07** — Fixed `kotlinskidev/protected-content` storing its "protected" content as **plaintext** in an HTML attribute — converted to a real server-rendered block using the theme's existing RSA encryption. This was an active plaintext leak on the live Contact pages.
- **2026-08-05** — Marked the Search utility pages `noindex`; they were incorrectly indexable and surfacing in the Popular Pages block.
- **2026-08-07** — Fixed stored XSS in `kotlinskidev/gallery-lightbox` (unescaped attachment `src`/`alt`/`poster` interpolated into raw HTML) and in the Article Query Settings admin meta box (unescaped tag name — an Author→Admin privilege-escalation path).
- **2026-08-07** — Fixed stored XSS in SVG upload/inline rendering: added a `DOMDocument`-based sanitizer stripping `<script>`/event handlers/dangerous URIs, applied once at the shared loader function so every caller (upload path and nav-icon rendering) is covered.
- **2026-08-07** — Bumped `swiper` 11→14 for a critical prototype-pollution advisory; capped the protected-content AJAX decrypt batch size against resource exhaustion; fixed a host-header-driven open-redirect in the maintenance page's language switcher.
- **2026-08-05 to 2026-08-07** — Added `better-npm-audit`, `eslint-plugin-security`/`no-unsanitized`, and PHP-side `security:php` (WPCS security sniffs, first Composer setup in this project). `npm audit fix` resolved 68/109 advisories; the rest need a deliberately-deferred `@wordpress/scripts` major bump.
- **2026-08-07** — Triaged all 319 `security:php` findings to 0: fixed 2 critical unsanitized-HTML sinks in `google-maps/render.php` (marker tooltip, custom CSS), removed a dead duplicate unsanitized SVG loader, added missing CSRF nonces to 2 admin forms, plus ~30 minor escaping/redirect fixes.
- **2026-08-07** — Resolved the remaining 7 high-severity `npm audit` findings via scoped `overrides` rather than a risky `@wordpress/scripts` major bump (which broke `.eslintignore` support when tried). Closed the last 2 unsanitized-HTML sinks (`protected-content.ts`, `gallery-lightbox/init.ts`) with real `DOMPurify` sanitization instead of continuing to suppress them.

### Added

- **2026-08-09** — `tests/e2e/editor/patterns-validity.spec.ts`: validates every registered theme pattern against Gutenberg's own block-validation check (the "Block contains unexpected or invalid content." warning). Caught and fixed 3 real, previously-unnoticed bugs — see `### Fixed` below. All 52 patterns now pass.
- **2026-08-05** — Full 4-layer test-tooling setup: JS/TS unit (Jest), PHP unit (Pest + Brain Monkey), PHP integration (scaffolded), and e2e (Playwright), wired into `.husky/pre-push`.
- **2026-08-06 to 2026-08-07** — Built an authenticated e2e testing foundation (dedicated test admin user, session `storageState`, `tests/e2e/editor/`), then ten block-level e2e coverage passes — one per custom block in the README — each with frontend + editor tests. Surfaced several real bugs along the way (dead CSS classes, a client/server type-coercion mismatch, a broken script enqueue), all reported in their respective commits rather than silently fixed.
- **2026-08-04** — Added FAQ accordion independent-columns layout mode plus a `kotlinskidev/faq-layout` block extension exposing it as an editor control.
- **2026-08-04** — New capabilities: `kotlinskidev/content-block` (Polylang-aware `wp_block` resolution), `simple-grid` tablet-column control, `protected-content` address/other types, `popular-pages` title font-size control, and generic block pass-through in `kotlinskidev/navigation`'s list/bar modes.
- **2026-08-04** — Sitewide active-page link highlighting (`kt-link-current`/`aria-current`) with click-disable and new site-wide + per-block settings toggles. Also added universal gradient-border support for any border-capable block, and `functions/seo-noindex-compat.php` for cross-plugin (Yoast/Rank Math/AIOSEO/SEOPress) noindex detection.
- **2026-08-04** — FAQ accordion redesign: animated `+`/`−` indicator, Web Animations API open/close transition, 2-column grid layout.
- **2026-08-06** — PHP integration coverage extended to 18 more previously-untested modules (238 → 392 tests).

### Changed

- **2026-08-04** — Footer restructured: brand content moved into a `content-block` instance, nav rebuilt as a `simple-grid` with real per-column headings, address moved into a `protected-content` block, social links synced to the full canonical platform set.
- **2026-08-05** — Cleaned up `docs/` to describe only current, implemented state — removed superseded planning documents.
- **2026-08-07** — `kotlinskidev/protected-content` gained Gradient Colors formatting support (`RichText` `allowedFormats`).

### Fixed

- **2026-08-09** — Fixed the 3 real pattern-validity bugs `patterns-validity.spec.ts` caught: `search-form`'s unclosed `wp:html` block, `template-404`'s markup nesting plus 3 CSS-preset-var typos (and a `tabindex` attribute moved to a proper `render_block` PHP filter, `functions/main-content-focus.php`, matching the existing `active-link-state.php` pattern), and `contact-page`'s 2 CSS-preset-var typos.
- **2026-08-05** — Regenerated and translated the theme's and `wordpress-pwa-manager`'s i18n catalogs from actual source (~1980 combined missing/never-wrapped strings) — both now compile at 100% translated, 0 fuzzy.
- **2026-08-04** — Footer/nav visual fixes: centering, mobile-viewport alignment, tablet brand-column width, social-icon vertical alignment, CTA social-links justification and two swapped URLs, dead-link cursor, a PHP 8.1 deprecation notice, and noindex pages leaking into search results.
- **2026-08-07** — Fixed Gradient Colors formatting on `protected-content` being silently stripped for non-`text` types — three separate causes (tag-stripping, output escaping, and a WP core CSS filter rejecting `var()`-based gradients).
- **2026-08-04** — Lighthouse-driven accessibility pass: fixed 5 missing/broken `aria-label`s, one image aspect-ratio mismatch, one touch-target size. Accessibility score 97/93 → 100/100 (desktop/mobile).
- **2026-08-04** — FAQ accordion grid/animation fixes: row-stretch bug, column count not actually being editor-configurable (migrated 21 live groups to native grid layout), open-item clipping, and animation timing desync.
- **2026-08-04** — More accessibility fixes: gallery-lightbox counter label, core image-lightbox fallback label, cookie-consent banner label, testimonial heading levels, 3 icon-only links — root-caused a plugin JS-combine bug that was masking several of these from taking effect.
- **2026-08-04** — Fixed the homepage slider's autoplay-resume jump after a manual drag (Swiper active-index resync) and the site logo's missing accessible name on the homepage (a hook-ordering bug between two `render_block` filters).
- **2026-08-04** — Fixed Complianz cookie-banner touch-target size and mobile-nav overlap. All accessibility fixes verified via a live Lighthouse re-audit: Accessibility 97/93 → 100/100, Agentic Browsing 67 → 100.

### Performance

- **2026-08-04** — Fixed LCP on About pages (~1.93s → 1.67s) by deferring 2 more non-critical CSS handles; confirmed by testing that Swiper-dependent CSS must stay render-blocking (deferring it broke LCP).
- **2026-08-04** — Built a generic, per-page-dynamic "defer unless marked above-the-fold" system (`functions/deferred-block-assets.php`) replacing a hardcoded handle list — registered 4 blocks with per-block defaults and content-based cache invalidation, plus deferred a plugin script's execution via `script_loader_tag` without touching its files.
- **2026-08-04** — Query-count audit on the About page (161 → 144 queries): added memoization/transient caching to 4 functions, fixed a Polylang re-validation regression introduced along the way, replaced an `ORDER BY RAND()` with an ID-shuffle.
- **2026-08-04** — Batched and lazy-loaded `protected-content`'s decrypt AJAX calls (one request instead of one per element, `IntersectionObserver`-gated) instead of firing one request per protected element on every page load.

### Internationalization

- **2026-08-05** — Added `npm run i18n:check` and `npm run lint:i18n:js` for ongoing translation-drift detection.
- **2026-08-05** — Full i18n audit: translated ~964 drifted-plus-newly-wrapped strings across the theme (1120/1120 PL+EN, 0 fuzzy).
- **2026-08-05** — Same audit for the `wordpress-pwa-manager` plugin (162 strings) — also fixed 2 real bugs that were silently blocking the translations from ever loading (a missing `wp_set_script_translations()` call and a wrong JSON filename hash).

---

## [1.0.0] — Baseline (2026-07-28)

Represents the theme as it stood when changelog tracking began: the FSE block theme described in `README.md` — 10 custom blocks (pre-this-session count), 56 patterns, 9 templates, dark/light mode, scroll animations, parallax, PWA support, Polylang multilingual support, the `T16` navigation/mega-menu redesign, and the footer/protected-content/popular-pages baseline this file's `[1.1.0]` section builds on. See `docs/treeview.md` for the full current inventory.
