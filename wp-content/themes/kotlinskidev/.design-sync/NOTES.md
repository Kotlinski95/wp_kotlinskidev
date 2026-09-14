# design-sync notes — kotlinskidev

## Why this repo took the off-script path

`kotlinskidev` is a WordPress FSE block theme, not a portable React component
library. There is no `dist/` bundle exporting standalone components — webpack
emits one entry per Gutenberg block, each a self-registering script
(`registerBlockType()`). Storybook stories here render each block's `Edit`
component (the admin editing UI), not the front-end design — and `Edit` is
explicitly documented (see `model-viewer/edit.stories.tsx`) to differ from
what a visitor sees. Syncing `Edit` components would have handed the design
agent Gutenberg admin placeholders instead of the site's actual look.

Chosen approach instead: pull real server-rendered HTML for a curated set of
patterns/blocks straight from WordPress (`do_blocks()` via `wp eval-file`,
after including the pattern's own PHP source so its i18n/dynamic-value logic
runs for real), paired with the real compiled CSS (`build/css/*.css` +
`wp_get_global_stylesheet()` for theme.json tokens + WP core's own
`wp-includes/css/dist/block-library/style.css`). No `_ds_bundle.js`, no
`window.<Global>` — this is the base skill's "genuinely outside the
converter's envelope" ladder rung. No `_ds_sync.json` sidecar was produced
(no anchor to compute one from); a future re-sync re-verifies everything.

## Scope (17 components + 3 token cards)

Curated set, chosen with the user rather than all 57 patterns:
`header`, `footer` (template parts), `hero-carousel`, `marquee`,
`content-tabs` (services variant — the only one of the three newer blocks
with a real pattern already wrapping it), `cta-block`, `features-section`,
`service-grid`, `testimonials-grid`, `faq-accordion`, `pricing-tables`,
`blog-cards`, `contact-with-form`, `logo-showcase`, `number-stats`,
`vertical-timeline-layout`, `article-hero`. Plus `Tokens/Colors`,
`Tokens/Typography`, `Tokens/Spacing`, hand-built from `theme.json`
`settings.color.palette` / `typography.fontSizes` / `spacing.spacingSizes`.

Dropped as near-duplicates of an included pattern: `about-2`/`about-us`,
`cta-block-2`, `featured-content-2`, `mission-goal`/`mission-vision`,
`service-location*`, `counter-*`, `header-default`, `simple-banner`,
`home-banner`, `template-404`, `simple-text`, `photo-gallery`,
`profile-links-card`, `highlight-features`, `service-content`,
`content-tabs-media`.

## Known gaps — re-sync risks

- **`core/navigation` doesn't resolve in `parts/header.html`.** The header
  preview shows logo + theme toggle but an empty nav — `do_blocks()` outside
  a real front-end request doesn't fully resolve a `wp:navigation` block's
  `ref`-ed `wp_navigation` post the way a live page request does. Not
  chased further this sync; if the design agent needs real nav links, this
  needs a proper front-end HTTP fetch + DOM-scrape instead of `do_blocks()`.
- **Marquee, HeroCarousel, ContentTabs are JS-driven and this sync is
  static-only.** Their final visual arrangement (Swiper horizontal scroll,
  carousel slide transitions, tab-panel show/hide) is applied at runtime by
  `init.ts` (adding `swiper-slide` classes, `display`/`opacity` toggling).
  The static preview shows real colors/typography/markup but: Marquee's
  items stack vertically instead of scrolling horizontally (no
  `swiper-slide` class without JS); ContentTabs shows the nav bar correctly
  but panel content is present in the DOM yet visually suppressed pending
  JS-driven active-state classing. Documented rather than faked — do not
  hand-add fake `swiper-slide`/`is-active` classes to the static HTML, since
  that would misrepresent the component's actual base state.
- **Marquee has no real page usage yet** (`kotlinskidev/marquee` isn't
  placed in any pattern or template as of this sync). Its preview content
  is hand-composed from `logo-showcase.php`'s image gallery (attachment IDs
  4565–4569, which fall back to `assets/images/logo.webp` locally since
  those attachments don't exist in this dev DB) wrapped in a real
  `<!-- wp:kotlinskidev/marquee -->` block comment. Real, but not a
  production usage — re-check once Marquee ships in an actual pattern.
- **`article-hero` and other post-context-bound patterns** needed
  `setup_postdata()` pointed at a real post (English article ID 1747) before
  `do_blocks()` — post-title/post-meta bindings render empty without a
  current post in scope. `blog-cards` didn't need this (its own
  `wp:query` loop sets postdata per iteration) but mixes EN/PL post titles
  in one grid since Polylang's frontend language filtering isn't active
  under `wp eval-file` (no request context). Cosmetic only.
- **`_ds_sync.json` intentionally omitted.** No render pipeline exists to
  compute `styleSha`/`renderHashes` for hand-authored static HTML the way
  the converter does for compiled bundles — see base skill's ladder-rung
  guidance ("omitting the sidecar is the honest choice"). Every future sync
  of this repo re-verifies from scratch; that's expected, not a bug.

## Regenerating

The render pipeline is not currently a committed script (it was written and
run ad hoc during this session, in the scratch directory, not the repo).
A future sync should recreate it: a small `wp eval-file` PHP snippet that
(1) optionally `setup_postdata()`s a real published post, (2) either
`include`s a pattern PHP file with output buffering or reads a raw
`.html`/extracted block-comment snippet, then (3) runs the result through
`do_blocks()` and writes the output. Pair each render with:
`build/css/main.css`, `wp_get_global_stylesheet()`, WP core's
`wp-includes/css/dist/block-library/style.css`, and any block-specific
`build/css/style-<block>.css` for blocks in scope.
