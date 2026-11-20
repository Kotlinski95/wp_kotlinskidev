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
- B2.12 Remaining modules under 100 lines, A–L
- B2.13 Remaining modules under 100 lines, M–Z, plus `functions/background-effects/`, `functions/canvas/`, `includes/`

## Phase 3: Frontend scripts (`src/scripts`, 10k lines)

- B3.1 `accessibility.ts`, `analytics.ts`, `analytics-providers/`, `track-event.ts`, `page-views.ts`, `cookie-consent.ts`
- B3.2 Navigation: `hamburger.ts`, `mega-menu.ts`, `nav-reveal.ts`, `nav-solid-transition.ts`, `hide-nav-on-scroll.ts`, `sticky-header.ts`, `search-panel.ts`, `language*.ts`, `active-link-state.ts`
- B3.3 Scroll and motion: `scroll-*.ts`, `smooth-scroll-offset.ts`, `restoration.ts`, `view-transition-reveal.ts`, `visual-viewport-offset.ts`, `in-view-hover*.ts`, `hover-glow.ts`, `parallax-deferred-bg.ts`
- B3.4 Media and UI: `image-lightbox.ts`, `city-map-lightbox.ts`, `modal-manager.ts`, `faq-accordion.ts`, `line-clamp.ts`, `load-more.ts`, `protected-content.ts`, `recently-viewed.ts`, `responsive-media.ts`, `viewport-deferred-images.ts`, `cover-video-controls.ts`, `animated-counter.ts`, `group-link.ts`
- B3.5 Shell: `app-shell.ts`, `blocking-stylesheets.ts`, `common.ts`, `utils.ts`, `console-banner.ts`, `theme-switcher.ts`, `editor-theme-toggle.ts`
- B3.6 `src/scripts/canvas-background/`

## Phase 4: Blocks (`src/blocks`, 42k lines)

Static `save.tsx` output is frozen in every batch.

- B4.1 `feature-card-canvas` runtime, geometry and shared helpers
- B4.2 `feature-card-canvas/variants` — names, small functions and comments only; drawing math stays as is
- B4.3 `slider`
- B4.4 `hero-carousel`, `banner-carousel`
- B4.5 `content-tabs`, `gallery-lightbox`
- B4.6 `navigation` and all `nav-*` blocks
- B4.7 `contact-form`, `contact-card`, `contact-detail`, `google-maps`, `model-viewer`
- B4.8 `article-toc`, `device-frame`, `marquee`, `scroll-section`, `scroll-section-pin-boundary`
- B4.9 **[plan first]** Responsive control family: `responsive-display`, `-font-size`, `-height`, `-width`, `-spacing`, `-order`, `-grid-columns`, `-image`, `-media` — shared panel/attribute logic is the main DRY opportunity
- B4.10 Cross-cutting style controls: `hover-animation-controls`, `background-effects-controls`, `bg-effect-preset-settings`, `text-gradient`, `border-gradient`, `text-shadow-support`, `link-hover-effects`, `position-z-index-controls`, `custom-css-vars`, `image-filter-color`, `clip-to-radius`, `overlay-link-controls`, `text-justify-controls`, `text-line-clamp`, `blur-siblings`, `equal-height-columns`
- B4.11 Dynamic list blocks: `*-posts-grid-dynamic`, `related-articles-dynamic`, `other-topics-dynamic`, `popular-*`, `recently-viewed-dynamic`, `certificates-grid-dynamic`, `blog-topics-grid-dynamic`, `search-*-dynamic`, `category-header-dynamic`, `article-tags-dynamic`, `not-found-dynamic` (near-identical 80-line blocks: DRY candidate)
- B4.12 Remaining blocks A–M
- B4.13 Remaining blocks N–Z, plus `shared/`

## Phase 5: Styles and patterns

- B5.1 `src/styles` A–M (BEM names, mixins for repeated declarations, no comments)
- B5.2 `src/styles` N–Z
- B5.3 Block `style.scss` / `editor.scss` files not touched in Phase 4
- B5.4 `patterns/`, `templates/`, `parts/` — comments and PHP helper names only; content and slugs frozen

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
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
