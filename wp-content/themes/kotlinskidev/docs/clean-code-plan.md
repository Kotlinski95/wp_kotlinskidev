# Clean Code Refactor Plan

Goal: make the theme readable without comments, following SOLID, DRY, YAGNI and the rules in `.claude/rules/`. Behavior, markup and every public contract stay the same.

Rules and workflow: `.claude/skills/clean-code/SKILL.md`. Executor: `.claude/agents/clean-code-refactorer.md` (Sonnet).

## Baseline (2026-11-19)

| Metric | Now | Target |
| --- | --- | --- |
| PHP comment lines (excluding `phpcs:`) | 673 | 0 (tool directives and WP file headers only) |
| TS/TSX comment lines | 88 | 0 |
| SCSS comment lines | 29 | 0 |
| `any` in TS source | 65 | 0 |
| Source files over 300 lines | 57 | under 15 (canvas drawing variants may stay large) |
| Top-level `functions/*.php` modules | 136 | same count or fewer, each one responsibility |

Re-measure after every phase with the commands in "Measuring" below.

## How each batch runs

1. Main session spawns `clean-code-refactorer` with one batch id, e.g. "Batch B3.2".
2. The agent follows the skill and returns the short report or `BLOCKED`.
3. Main session reviews the diff (`code-reviewer` agent for large batches), runs `npm run verify`, adds a CHANGELOG line under `[Unreleased]` → `Changed`, and commits the batch.
4. One PR per phase on branch `feature/T28-clean-code`; cut the release with `npm run release -- --patch` inside the PR.
5. `BLOCKED` on a frozen contract: record it under "Contract migrations" below and move on. Do not force it.

Model routing:

- `clean-code-refactorer` (Sonnet): every batch by default.
- `planner` (Opus): only the two design-heavy splits marked **[plan first]**, once each, before the refactorer runs.
- `maker` (Haiku): only for sweeps where the exact edit list is already written (e.g. a rename list produced by an earlier batch).

## Phase 0: Safety net (main session)

- B0.1 `npm run verify` green on the branch before any refactor.
- B0.2 Baseline of rendered HTML: `npm run snapshot:capture` saves the pages in `bin/html-snapshot-urls.txt` (home EN/PL, services EN/PL, projects, one project, articles, one article, about, contact, FAQ, e-commerce, search, 404) to `artifacts/clean-code-baseline/` (gitignored). `npm run snapshot:compare` must print `same` for every page after every batch. Re-capture only after a deliberate content change, never to hide a refactor diff.
- B0.3 PHP modules with no unit test referencing them (largest first). Their batch writes a characterization test first with `/write-tests`: `search-page-dynamic-blocks` (643), `contact-form-submissions` (285), `article-card` (230), `tag-archive-manager` (195), `class-contact-submissions-list-table` (187), `load-more` (139), `security-headers` (101), `group-divider`, `translated-text`, `post-card-renderer`, `banner-slider`, `topic-card-renderer`, `responsive-grid-columns`, `analytics-events`, `ai-disclosure-labels`, and 17 modules under 50 lines.

## Phase 1: Shared TypeScript (`src/utils`, 2.1k lines)

- B1.1 `src/utils/**` — names, `any` removal, small pure helpers; becomes the home for DRY helpers found later.

## Phase 2: PHP modules (`functions/`, `includes/`, 21k lines)

- B2.1 (done) **[plan first]** `settings-page.php` (2,126) → `functions/settings-page/` split by tab (registration, fields, sanitizers, rendering). Option keys and page slugs are frozen.
- B2.2 (done) `blog-topic-manager.php` (1,136). Dead-code suspects to check against the database and patterns: `kotlinskidev_get_related_posts()`, `kotlinskidev_get_search_excerpt()`, `kotlinskidev_get_breadcrumb_settings()`, unused `$blog_text` in `kotlinskidev_blog_breadcrumbs()`
- B2.3 (done) `maintenance.php` (1,126). Follow-ups: unprefixed public names (`add_maintenance_mode_settings`, `maintenance_mode_*_field`, `get_maintenance_*`, `generate_maintenance_page`) are a contract migration; shared social platform list is a DRY candidate
- B2.4 (done) `protection-helpers.php` (831)
- B2.5 (done) `offers.php` (657), `search-page-dynamic-blocks.php` (643)
- B2.6 (done) Contact form: `contact-form.php`, `contact-form-attachments.php`, `contact-form-submissions.php`, `class-contact-submissions-list-table.php`, `mail-failure-alerts.php`, `contact-card.php`
- B2.7 (done) Responsive family: `responsive-*.php`, `breakpoints.php`, `responsive-style-dedupe.php`
- B2.8 (done) SEO and locations: `seo-*.php`, `service-location*.php`, `site-identity.php`, `site-values.php`
- B2.9 (done) Content renderers: `article-*.php`, `project-card.php`, `post-card-renderer.php`, `topic-card-renderer.php`, `certificate*.php`, `load-more.php`, `term-latest-post-cache.php`, `tag-archive-manager.php`
- B2.10 (done) Assets and performance: `enqueue-scripts.php`, `deferred-block-assets.php`, `critical-css-fragments.php`, `above-fold-media.php`, `image-dimensions.php`, `viewport-deferred-images.php`, `content-visibility.php`, `cache.php` (load order frozen: must stay first in `functions.php`)
- B2.11 (done) Media and SVG: `svg-*.php`, `animated-webp.php`, `video-poster.php`, `cover-*.php`, `palette-duotone.php`, `icon-library.php`, `model-viewer-mime.php`
- B2.12 (done, merged with B2.13) Remaining modules under 100 lines, A–L
- B2.13 (done in B2.12) Remaining modules under 100 lines, M–Z, plus `functions/background-effects/`, `functions/canvas/`, `includes/`

## Frontend proof tooling (Phase 3 onwards)

`npm run dom:capture` / `npm run dom:compare` (`bin/dom-snapshot.mjs`, URL list `bin/dom-snapshot-urls.txt`): rendered DOM after JavaScript at desktop and mobile sizes, with volatile values (ids, timings, carousel state, inline animation styles) masked and the console error list included. Baseline stored in the gitignored `artifacts/dom-baseline/`. It is stable on unmodified code (two consecutive compares: 20 of 20 `same`) and sensitive to script changes (disabling JavaScript removes the carousel and `visible` state it records).

## Phase 3 follow-ups collected so far

- `src/scripts/utils.ts` `setScrollBehavior(behavior: ScrollBehavior)` is called with `""` (pre-existing type mismatch worked around with a named cast); fix the signature in B3.5.
- `accessibility.test.ts` has duplicate function declarations flagged by `tsc --noEmit` (TS2393, pre-existing).
- `bin/dom-snapshot.mjs` filters the timing-dependent class tokens `visible` and `has-transparent-shade-background-color`; B3.3 (scroll animations) should compare `visible` with a slower scroll.

- Browser tools must stub the page-view tracking AJAX call (done in `bin/dom-snapshot.mjs`): real page views move the popular-pages ranking and drift server-rendered baselines. On 2026-11-20 the HTML baseline was re-captured once (PHP unchanged since the last verified commit) and the DOM baseline was re-captured from the original B3.1 scripts after fixing a non-idempotent style mask.
- The DOM compare still shows an occasional single-line flake (a data-driven hero image in the home page cards grid, a mobile lightbox button style); it appears on unmodified code too, so judge a batch by repeated runs plus its interaction probe.

- B3.3 note: `scroll-trigger-refresh.ts` named in older notes does not exist in this repo; the `isProgrammaticScrollActive()` contract lives elsewhere and is reviewed in the batch that owns it. Probes need >= 1100 ms waits after scroll steps for IntersectionObserver reveals on mobile. Recording a baseline requires the original code: record it BEFORE the first edit or rebuild it with the aside-and-restore procedure; probes recorded after the first edit are not a baseline.

- B3.4 note: a probe baseline recorded after the first source edit is valid only if the compiled `build/` is proven byte-identical to a copy taken before any edit (browsers run the bundle, not `src`); chunk ids changed after the rebuild, so deploy artefacts need a fresh `npm run build`. The modal reopen scroll position is flaky on the original code.

- B3.5 note: `src/scripts/common.ts` is imported only by its own test (candidate for a deliberate deletion). `window.kotlinskiTheme` and `window.i18n` stay local casts because other files declare them with conflicting shapes.

- Pre-existing bug found by the canvas probe: `/wp-content/uploads/2025/05/homepage-video-poster-768x432.webp` returns 404 locally and on production (only `-scaled.webp` exists); the mobile poster variant of the homepage video on pages such as `/en/services/e-commerce/` needs regenerating or re-uploading.

## Phase 3: Frontend scripts (`src/scripts`, 10k lines)

- B3.1 (done) `accessibility.ts`, `analytics.ts`, `analytics-providers/`, `track-event.ts`, `page-views.ts`, `cookie-consent.ts`
- B3.2 (done) Navigation: `hamburger.ts`, `mega-menu.ts`, `nav-reveal.ts`, `nav-solid-transition.ts`, `hide-nav-on-scroll.ts`, `sticky-header.ts`, `search-panel.ts`, `language*.ts`, `active-link-state.ts`
- B3.3 (done) Scroll and motion: `scroll-*.ts`, `smooth-scroll-offset.ts`, `restoration.ts`, `view-transition-reveal.ts`, `visual-viewport-offset.ts`, `in-view-hover*.ts`, `hover-glow.ts`, `parallax-deferred-bg.ts`
- B3.4 (done) Media and UI: `image-lightbox.ts`, `city-map-lightbox.ts`, `modal-manager.ts`, `faq-accordion.ts`, `line-clamp.ts`, `load-more.ts`, `protected-content.ts`, `recently-viewed.ts`, `responsive-media.ts`, `viewport-deferred-images.ts`, `cover-video-controls.ts`, `animated-counter.ts`, `group-link.ts`
- B3.5 (done) Shell: `app-shell.ts`, `blocking-stylesheets.ts`, `common.ts`, `utils.ts`, `console-banner.ts`, `theme-switcher.ts`, `editor-theme-toggle.ts`
- B3.6 (done) `src/scripts/canvas-background/`

## Block proof tooling (Phase 4)

`npm run editor:baseline` / `npm run editor:check` (`bin/editor-validity.mjs`, specs `tests/e2e/editor/content-validity.spec.ts` and `patterns-validity.spec.ts`): opens every published page and post and every block pattern in the real block editor, fails on a NEW "Block contains unexpected or invalid content" warning or editor `pageerror`. Baseline on unmodified code (2026-11-21): 17 of 68 stored pages (18, 1041, 1044, 1046, 1048, 1050, 1056, 1059, 1061, 1063, 1065, 10081, 10082, 10083, 10158, 10159, 10160) and 1 of 75 patterns (`kotlinskidev/testimonial-grid`) already report an invalid block (mostly `core/cover` blocks; page 18 has a malformed nested `<p><p class="kt-offer">` in the pricing section). These are pre-existing content problems worth fixing separately, not regressions.

## Phase 4: Blocks (re-scoped from measurements on 2026-11-21)

Measured across `src/blocks`: 50 TS comment lines, 38 `any`, about 16 files over 300 lines, concentrated in a few blocks; `render.php` files have no explanatory comments and `feature-card-canvas/variants` (47 drawing files) has none either. The original 13-batch split was by size, not by work, so it is replaced by 3 batches grouped by risk and shared code. Static `save.tsx` output, `block.json`, `deprecated` and attribute names are frozen in every batch; proof is `npm run editor:check` plus the usual DOM and interaction probes (see "Block proof tooling").

- B4.1 (done) Carousels, galleries and tabs: `slider` (736-line `edit.tsx`, 703-line `swiper-init.ts`, 10 comments), `gallery-lightbox` (5 `any`, 2 big files), `hero-carousel` (2 big files), `banner-carousel`, `marquee` (4 comments), `content-tabs`.
- B4.2 (done) Responsive family and cross-cutting controls: `responsive-display` (6 `any`), `responsive-order` (4 `any`), `responsive-width`, `-height`, `-spacing`, `-font-size`, `hover-animation-controls`, `background-effects-controls`, `scroll-animations`, `nav-reveal-animation`, `animated-counter`, `slider-modal-trigger`, `modal-trigger`, `content-block`, `protected-content`; the shared panel and attribute logic across the `responsive-*` blocks is the DRY target. The cross-cutting filters keep excluding the `DYNAMIC_PREVIEW_BLOCKS` list.
- B4.3 (done except `feature-card-canvas/runtime.ts` split: needs ~200 byte budget raise in bin/asset-budget.json, saved at /tmp/probe-b43/fcc-runtime-split/) Navigation, forms and the rest: `navigation`, `nav-content`, `contact-form`, `google-maps`, `feature-card-canvas` (non-variant files: 12 comments, `runtime.ts` 450 lines; the drawing `variants/` stay untouched), `pricing-cards`, `model-viewer`, `image-hover-overlay`, `above-fold`.
- B4.4 (partly done) Editor-only functions over 40 lines: done for button, scroll-section, simple-grid, certificate, service-location, article-card, project-card, canvas-background controls and its 16 layer edits, the `*-dynamic` card blocks, load-more, responsive-media, icon, responsive-image, social-section, scroll-to-top, popular-pages, translated-text, article-toc edit, language-panel, search-panel, text-gradient, border-gradient, blur-siblings, custom-css-vars, cover-video-controls, link-hover-effects, image-filter-color, text-line-clamp, overlay-link-controls, shared controls and `CarouselPanel`. Left: `CanvasRecipePreview` (canvas effect, needs a characterization test), frontend scripts (`article-toc/init.ts`, `in-view-band.ts`, `attachImageZoom.ts`, `dropdown-panel.ts`, `carousel/initSwiper.ts`, `buildConfig.ts`), `google-maps/use-google-map.ts` and the `feature-card-canvas` runtime and variants.
- Dropped as not worth the risk: splitting `feature-card-canvas/variants/*.ts` (drawing math; none have comments or `any`), and the dynamic list blocks (80-line PHP renderers already clean).

### Follow-ups from B4.1

- `kotlinskiTheme.breakpoints.mobile_max` and `mobileBreakpoint` are two competing names read in `gallery-lightbox/gallery-data.ts`.
- `banner-carousel/init.ts` selects every `[data-carousel-settings]` element, including hero-carousel roots, so hero pages also run the banner init.
- `parseSettings` is duplicated in `hero-swiper.ts` and `banner-carousel/init.ts`; a shared helper is possible.
- The slider probe needs `reducedMotion: "no-preference"` to exercise continuous autoplay.
- 3 e2e specs fail on unmodified code too (`content-tabs.spec.ts:133`, `editor/content-tabs.spec.ts:220`, `marquee-modal-scroll-jump.spec.ts:54`).
- `hero-carousel/style.scss` (422 lines) and `content-tabs/style.scss` (304 lines) are left whole for Phase 5.

### Follow-ups from B4.3

- B4.4: about 45 editor-only functions over 40 lines remain (button/edit, scroll-section/edit, certificate/panel, service-location/panel, canvas-background controls and layer edits, simple-grid/edit, blog-topics, language-panel, city-grid); measure with the fnlen ESLint config.
- Decide the feature-card-canvas runtime budget; tidy the react-hooks warning in `google-maps/use-google-map.ts`.

### Follow-ups from B4.2

- Suspected quirks left as they are: `order-desktop-undefined` for an undefined order value, and the display and order `extraProps` filters not excluding dynamic blocks.
- Candidates: a shared `isDynamicPreviewBlock()` helper, and one `ValueControl` for width and height if a third user appears.
- The contact page has 3 `<a class="fade-in-on-scroll">` cards whose server-rendered `style` repeats `--hover-bg-color` (also on production); a browser collapses it once the reveal script runs. Harmless, but it comes from the hover render filter emitting the variable twice.

## Phase 5: Styles and patterns

- B5.1 (done) `src/styles` A–M: only 8 comments existed and were removed; BEM renames and mixins skipped because class names are frozen contracts and compiled CSS must stay byte-identical
- B5.2 (done) `src/styles` N–Z: comments removed, CSS byte-identical
- B5.3 (done) Block `style.scss` / `editor.scss`: only `protected-content` had comments, removed
- B5.4 (done, no change needed) `patterns/`, `templates/`, `parts/`: only pattern file headers, one `phpcs:ignore` directive and one template HTML comment exist; all frozen

## Out of scope

- Tests: keep them passing; rename only when a tested symbol is renamed.
- `wp-content/plugins/` (including `wordpress-pwa-manager`), WordPress core, build output.
- Visual or behavior changes of any kind.

## Contract migrations (deferred)

Add here every bad name the refactor could not change because it is a frozen contract, with where it is stored. Each one needs its own migration task.

| Name | Kind | Where stored | Proposed name |
| --- | --- | --- | --- |
| `add_maintenance_mode_settings`, `maintenance_mode_*_field`, `get_maintenance_*`, `generate_maintenance_page` | PHP functions (hooked and tested) | `functions/maintenance/`, `tests/unit/MaintenanceTest.php` | `kotlinskidev_`-prefixed |

## Known issues found (deliberate decision needed)

- `topic-card-renderer.php` reads an undefined `$latest_post` in the "Updated %s ago" span; it is always empty, so the text never shows. Fixing it changes markup.

## Follow-ups from B2.11

- The inline lazy-loading JavaScript printed by `cover-image-classes.php` still carries its comments because they are emitted markup; move it to `src/scripts` to remove them.
- `add_cover_block_attributes` is a hooked no-op on `init`; retire it in a deliberate hook migration.
- Poorly named global hooked functions (`control_block_lazy_loading`, `add_poster_image_to_cover_video`) go into the contract-migration table when the rename migration is planned.

## Environment note

- 2026-11-20: WordPress core on the local site auto-updated to 7.1.5 and Yoast to 28.9 during Phase 2 work. `wp-admin`, `wp-includes` and `wp-content/plugins` are tracked by the repo root and show as modified; clean-code commits stage only `wp-content/themes/kotlinskidev`. The snapshot baseline was re-captured once on unmodified code after the Yoast update.

## Measuring

```bash
grep -rIE '^\s*(//|/\*|\*|#[^\[])' --include='*.php' functions includes src | grep -v 'phpcs:' | wc -l
grep -rIE '^\s*(//|/\*|\*)' --include='*.ts' --include='*.tsx' src | grep -v 'eslint-\|@ts-\|\.test\.\|\.stories\.' | wc -l
grep -rIE '^\s*(//|/\*)' --include='*.scss' src | wc -l
grep -rIE ':\s*any\b|as any\b' --include='*.ts' --include='*.tsx' src | grep -v '\.test\.\|\.stories\.' | wc -l
find src functions includes -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.php' \) ! -name '*.test.*' ! -name '*.stories.*' -exec wc -l {} + | awk '$1>300 && $2!="total"' | wc -l
```

## Progress

- [x] Phase 0 (2026-11-19: verify green, 14-page HTML baseline, test gaps listed)
- [x] Phase 1 (B1.1: src/utils was already mostly clean; follow-ups: split `observeCentreBand` and `attachImageZoom` closures once more tests exist, review `CarouselPanel.tsx` in the carousel batch)
- [x] Phase 2 (2026-11-20: PHP explanatory comments 673 → 69, remaining are emitted CSS/JS; follow-ups: contract-migration table, closures in language-switcher and login, dead-code suspects)
- [x] Phase 3 (2026-11-21: B3.1 to B3.6 done; `any` in src 65 → 38, TS comment lines 88 → 56 with the rest in Phase 4 blocks)
- [ ] Phase 4
- [ ] Phase 5
