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

## Follow-up pass (same day) — naming fix, dark mode, blue primary, real icons

- **Fixed a real bug**: every component file was named `index.{html,jsx,d.ts,
  prompt.md}` instead of `<Name>.{ext}` as the base skill's layout spec
  requires — the claude.ai/design app apparently titles cards from the file
  basename, so every card showed "index". Renamed all 20 components' files
  and fixed the two generator scripts (`build-components.mjs`,
  `build-tokens.mjs`) so a future regen doesn't reintroduce this.
- **Dark mode is now the default** for every preview (`body.dark-mode` /
  `.editor-styles-wrapper.dark-mode` wrapper, `styles.css` body background
  switched from `surface-light` to `surface-dark`), per user request.
- **Primary color changed from purple to blue** — a real `theme.json` edit,
  not just a design-sync preference: `primary-light` `#8209d3` → `#0078c2`,
  `primary-dark` `#ae41f7` → `#00f6ff` (user-specified exact hex values,
  which happen to match colors already used in the live
  `templates/single-service_location.html` hero-carousel's `navColor`
  gradient — so this is a return to an already-established accent, not a
  new one). Cascaded to `primary-rgb`, `primary-dark-rgb`, `primary-hover`
  (computed as a darkened `#005a91`), `primary-shade-1`/`-2`. Also fixed the
  matching SCSS fallback values in `src/blocks/hero-carousel/style.scss`
  (`var(--wp--preset--color--primary, #8209d3)` → `, #0078c2)`).
  **Gotcha hit again**: [[wp-global-styles-palette-freeze]] — theme.json
  alone wasn't enough, the site had a frozen `wp_global_styles` post (ID 100,
  found via `WP_Theme_JSON_Resolver::get_user_global_styles_post_id()`)
  overriding it. Patched that post's `settings.color.palette.theme` array
  in place (7 matching slugs), left everything else untouched, then
  `wp cache flush`.
- **Added a Gradients token card** (14 entries from
  `theme.json settings.color.gradients`) — most reference
  `var(--wp--preset--color--primary)` directly so they follow the new blue
  automatically; a few needed their `var()` refs resolved to literal values
  for the static preview swatch (see `build-tokens.mjs`).
- **Marquee now uses real images**: swapped the generic logo placeholder for
  10 real tech-stack SVG icons already in the local media library
  (attachment IDs 6930–6939: React, Next.js, TypeScript, JavaScript, NestJS,
  WordPress, GitHub, Figma, Tailwind, Material UI) — matches Marquee's own
  block description ("technology/skill items") better than generic logos
  did, and is real content rather than a fallback. LogoShowcase was left
  as-is (still placeholder) — its real client-logo attachments (IDs
  4565–4569) genuinely don't exist in this local dev DB, and the live
  production site (kotlinski.dev) wasn't reachable from this environment
  (DNS resolution failed) to pull them from there instead. Whoever picks
  this up next: either restore those attachments locally, or fetch the
  images from production and re-render.

## Follow-up pass 2 (same day) — broken images, and the real Marquee/HeroCarousel bug

- **Every image was broken in the actual claude.ai/design environment**, even
  though it looked fine every time I checked locally. Root cause: every
  `<img src>`/`srcset` pointed at `http://kotlinskidev.local/...` —
  confirmed via `dscacheutil -q host` that this domain resolves only through
  this Mac's `/etc/hosts` (LocalWP entry), nowhere else. My own verification
  loop (local `npx serve` + this machine's Chrome) couldn't catch it because
  this machine CAN resolve that domain. Fix: copied the 21 real image files
  into `_vendor/images/` and rewrote every `src`/`srcset` in the source
  fragments (`out/*.html`) to the relative bundle path, before wrapping into
  cards. **Lesson for next time: verify uploaded-bundle images from an
  environment that can't reach any `*.local` domain, not just visually in a
  local browser** — a passing local check here is not evidence the upload
  works.
- **Retracted an earlier wrong claim**: I'd written that HeroCarousel/Marquee
  "need runtime JS for their final look" (horizontal Swiper layout). That
  was wrong — the user caught Marquee rendering vertically with oversized
  icons and pushed for a real fix, which surfaced two real, fixable bugs:
  1. **Missing vendor CSS file.** Swiper's own base layout CSS
     (`.swiper-wrapper{display:flex}`, `.swiper-slide{...}`) isn't inside
     each block's `style-<block>.css` — webpack emits it into the separate
     `<block>-init.css` bundle (from the `import 'swiper/css'` side-effect
     inside `init.ts`, per this repo's per-entry webpack split). I'd only
     ever copied `style-hero-carousel.css`/`style-marquee.css` and missed
     `hero-carousel-init.css`/`marquee-init.css` entirely — nothing in this
     theme is actually JS-only here, it's pure CSS I forgot to bundle.
  2. **CSS import order matters, and got it backwards.** Once both files
     were copied, `.kt-marquee__item{display:flex}` (in `style-marquee.css`)
     and `.swiper-slide{display:block}` (in `marquee-init.css`) are equal
     specificity (single class each) — whichever imports LAST in
     `styles.css` wins a tie. I'd put `marquee-init.css` after
     `style-marquee.css`, so Swiper's base `display:block` silently beat the
     block's own override. Real WordPress enqueue order is base-library-then
     component-override; `styles.css`'s `@import` order must match that
     (base `*-init.css` before the component's own `style-*.css`) or any
     future block added the same way will hit this same silent override.
     Diagnosed via `getComputedStyle` + `fetch()`-ing each vendor CSS file
     directly from the running preview — guessing from the rendered result
     alone did not find this, had to compare actual matched rules.
  - **Also found (and worked around, not fixed): a real latent bug in
    `kotlinskidev/marquee`'s own CSS.** `.kt-marquee-icon` fixes the icon
    column to `2.5rem` (40px), but `.kt-marquee-label` sets
    `white-space:nowrap` with no `min-width` on `.kt-marquee__item` to
    accommodate it — any label longer than ~4-5 characters overflows
    sideways past its own column into neighboring items (confirmed via
    `getBoundingClientRect()`: label positioned correctly under its own
    icon, but width exceeds the 40px column and isn't clipped). This has
    never been hit in production because Marquee has no real page usage yet
    (still true as of this pass). Worked around in the sync preview by using
    short labels (React/Next/TS/JS/Nest/WP/Git/Figma/Tail/MUI) rather than
    full names — **the real theme SCSS itself still has this bug** and
    should get a `min-width: max-content` (or similar) on `.kt-marquee__item`
    before Marquee ships with any real, longer label text.
  - Also rebuilt Marquee's source markup to use the real
    `kotlinskidev/marquee-item` block (icon as `core/image.kt-marquee-icon`
    + `core/paragraph.kt-marquee-label`, per `marquee/item/edit.tsx`'s own
    `ITEM_TEMPLATE`) instead of bare `wp:image` blocks directly inside
    `kotlinskidev/marquee` — the earlier version skipped the real item
    wrapper entirely, which is *why* the icon-sizing CSS never matched.

## Follow-up pass 3 (same day) — the real reason icons/logo were oversized

User reported the footer logo, footer social/contact icons, and header logo
all rendering way too big. Root cause was **not** the Marquee/HeroCarousel
bug from pass 2 — a third, broader instance of the same underlying class of
mistake (bundling too few of the theme's own compiled CSS files):

- `build/css/critical.css` (the theme's separately-extracted above-the-fold
  critical CSS, normally inlined in `<head>` for performance) has the global
  rule constraining every `<svg>` site-wide: `svg{height:4rem;max-height:
  4rem;max-width:6.25rem;width:auto}`. I had never bundled `critical.css` at
  all — only `main.css`. Without it, any inline SVG (this theme inlines SVG
  media as raw `<svg>` markup rather than `<img src>`, so WP core's
  `img{max-width:100%}` responsive-image rule never applies to them) renders
  at its own literal size: the footer's logo `wp:image` block had been
  manually resized to 200×200px in the editor (`is-resized` class, inline
  `style="width:12.5rem"`) and nothing was there to cap it back down.
- Also missing: `style-breadcrumbs.css`, `style-protected-content.css`,
  `style-scroll-to-top.css`, `style-simple-grid.css` — four more per-block
  stylesheets used by Header/Footer that I'd never checked for. Found them
  by grepping every `wp-block-kotlinskidev-*` class actually present across
  ALL 17 rendered `out/*.html` fragments and cross-checking each against
  `build/css/style-<block>.css` existence, rather than continuing to
  discover missing files one bug report at a time.
- Verified the fix against the REAL live footer (scrolled to it in the
  actual browser) before and after, to confirm 200×200 unconstrained really
  is wrong and not just how production also looks.
- **For any future component added to this sync**: grep its rendered
  fragment for `wp-block-kotlinskidev-*` classes, and for each one confirm
  BOTH `_vendor/blocks/style-<block>.css` AND `_vendor/blocks/<block>-init.css`
  (if it exists in `build/css/`) are bundled — don't assume `main.css`
  alone covers it. Also always bundle `critical.css` from the start; it is
  not optional above-the-fold-only CSS for this purpose, it carries global
  resets (like the svg size cap) that nothing else provides.

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
