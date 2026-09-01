# Changelog

All notable changes to the kotlinskidev theme are documented in this file. Entries are kept short (2-3 sentences) — for full technical detail on any entry, see the referenced files' own git history/commit messages.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this theme follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking change: removed/renamed a block or attribute, a template/pattern change that requires editors to re-save affected content, a markup change that isn't backward compatible.
- **MINOR** — new, backward-compatible capability: a new block, a new attribute, a new pattern, a new editor control.
- **PATCH** — bug fix, style tweak, security fix with no new capability.

**When releasing:** bump `Version` in `style.css` and `"version"` in `package.json` together (they must always match), move the `[Unreleased]` entries under a new dated version heading, and start a fresh empty `[Unreleased]` section. See `docs/treeview.md` for the full current structure reference — update it alongside any change that adds/removes/renames a block, pattern, template, function module, or test file. See `.claude/skills/sync-docs/SKILL.md` for the full checklist to run before considering any change "done."

**Keep every entry to 2-3 sentences, no exceptions.** Count the sentences before saving. State what changed and why it matters — root-cause narrative, verification steps, and code-level mechanics belong in the commit message or PR description, not here. This file has needed a full re-compaction more than once already because entries crept back up to 5-10+ sentences each; a deep/interesting bug is not an exception to the limit.

---

## [Unreleased]

### Added

- **2026-09-01 — "Equal height columns" now also works on a `core/group` grid, not just `core/columns`:** `src/blocks/equal-height-columns/` extends its existing toggle to any `core/group` using a grid layout, labeled "Equal height grid items" in that context; CSS grid rows already stretch items by default, but the new `.kt-equal-height-columns.is-layout-grid > *` rule makes it explicit and toggleable rather than relying on unset browser defaults. Enabled on all 3 project-card grids in the new Service Location "Selected Projects" section so cards of different description lengths line up evenly.

- **2026-09-01 — Service Location pages get a "Selected Projects" section, and `core/group` gains a reusable "Load More" toggle:** copied the homepage's `kotlinskidev/content-tabs` project showcase (Client work / Personal projects / All projects, each a `core/group` grid of `kotlinskidev/project-card` blocks) into `single-service_location.html`/`-en.html`, placed right under the contact-card/Google Maps section. New `src/blocks/load-more/` extension (mirroring the `responsive-width`/`equal-height-columns` pattern) adds a `loadMore` attribute + Inspector panel to any `core/group`, and `functions/load-more.php`'s `render_block` filter injects `data-kt-load-more-initial`/`-label` attributes that `src/scripts/load-more.ts` reads to hide items past the limit and reveal them on a button click — enabled on the "All projects" grid (3 of 5 cards shown initially) as the first real usage, but works on any group block, not just this one.

- **2026-09-01 — Responsive Display and Responsive Width extensions cover far more CSS:** Display & Layout's per-breakpoint "Display" control now offers the full practical `display` keyword set (`inline`, `inline-block`, `inline-flex`, `inline-grid`, `flow-root`, `contents`, `table`, `table-row`, `table-cell`, `list-item`, on top of the existing block/flex/grid/none), with Flex Direction/Justify/Align controls now also showing for `inline-flex`/`inline-grid`. Responsive Width's Width/Max Width fields gained a preset picker (`auto`, `max-content`, `min-content`, `fit-content`, `stretch`) alongside the existing custom-value unit input — this also fixes `functions/responsive-width.php`'s `kotlinskidev_sanitize_css_length()`, which was silently stripping these exact keywords on the frontend even though nothing in the editor could have produced them before now.

- **2026-09-01 — `kotlinskidev/icon` gets a "Use gradient fill" toggle, and the shared SVG gradient is now sourced from theme.json instead of hardcoded PHP:** new `useGradient` attribute applies a `kt-icon--gradient` class (`fill: url(#kt-icon-gradient-dark/light)`, dark/light-mode aware, matching `search.scss`/`nav.scss`'s existing icons) instead of the flat `color` field. `functions/svg-gradient-defs.php` no longer hardcodes the gradient's RGB stops — it now reads them live from the `fancy-text-dark`/`fancy-text-light` gradient presets via `wp_get_global_settings()` (checking a `custom` Site Editor Styles override before the `theme` default), so editing those presets updates both `kt-gradient-text` and icon gradients from one place, no code change needed.

- **2026-09-01 — Core Columns block gets an "Equal height columns" toggle:** new `src/blocks/equal-height-columns/` extension (mirroring the `responsive-order`/`responsive-display` pattern) adds an `equalHeightColumns` attribute + Inspector toggle to `core/columns`, baking a `kt-equal-height-columns` class into the saved markup via `blocks.getSaveContent.extraProps`. When on, each column becomes a `flex-direction: column` container with its child stretched to `flex: 1`, so a bordered/backgrounded card fills the full stretched column height instead of leaving a gap below shorter siblings — fixes the uneven card borders in the "What I do for businesses in {city}" pricing columns.

- **2026-09-01 — Service Location's "Find us in {city}" section becomes a two-column contact block, and gains real Google Maps + LocalBusiness schema:** left column has an eyebrow, a city heading, new SEO copy about meeting locally or working fully remotely, and the new `kotlinskidev/contact-card` block (`functions/contact-card.php`) reading a new "Contact Info" settings tab (`functions/settings-page.php`); right column is `kotlinskidev/city-map`, which now has a click-to-expand fullsize view (`src/scripts/city-map-lightbox.ts`). Address/phone/email render via the same encrypted `protected-content` markup the Protected Content block uses, and a `ProfessionalService` JSON-LD schema (with the post's city as `areaServed`) is now output on every service-location page. Applied to both `single-service_location.html` and `-en.html`; no "we also serve the wider metro area" copy, since that isn't true for every city.

- **2026-09-01 — Contact card's Address and Business hours are now per-language translatable, and the settings UI makes that explicit:** both values register with Polylang via `pll_register_string()`/`pll__()` (group `kotlinskidev`, same mechanism `scroll-top-top.php` already used for its button label), so PL/EN wording (e.g. "Poland" vs "Polska") is edited under Languages → Translations instead of duplicating settings fields per language. Their Settings → Contact Info inputs are now `readonly` by default with an "Edit source text" unlock button and a direct link to the Translations screen, so editors aren't misled into thinking a direct edit there changes the live per-language text.

- **2026-09-01 — `kotlinskidev/contact-card` gets a "Gap between fields" Inspector control:** new `gridGap` attribute (rem, default `1.5`), added via a `src/blocks/contact-card/index.tsx` extension mirroring `city-grid`'s attribute-injection pattern, rendered as a `--kt-contact-card-gap` CSS custom property on the block's grid wrapper. Lets editors tighten the Address/Hours/Phone/Email grid so long values like an email address don't wrap to a second line.

- **2026-09-01 — Scroll Section's "Auto" slide width now has a spacing control, sourced from a new site-wide fluid spacing scale:** `theme.json`'s `settings.spacing.spacingSizes` gained `none`/`small`/`medium`/`large` presets (each a `clamp()` value, e.g. Medium is `clamp(0.75rem, 2.5vw, 1.5rem)`), auto-exposed as `--wp--preset--spacing--{slug}` CSS vars and as core's own spacing-size picker on every block with padding/margin support. The block's new `slideGap` attribute reads this list live via `useSelect(blockEditorStore).getSettings().spacingSizes` (mirroring `responsive-font-size`'s existing `fontSizes` pattern) instead of a hardcoded option array, so adding a slug in `theme.json` alone — no code change — makes it selectable everywhere immediately. `render.php` writes the resolved value as an inline `--scroll-section-gap` custom property (`sanitize_key()`-guarded) rather than a per-slug SCSS selector, so `style.scss` needs no rebuild when new sizes are added either.

- **2026-08-30 — Service Location pages get a video-background Hero Carousel:** `templates/single-service_location.html`'s old static text hero is replaced by a shared `AI_Hero_Carousel_Video1` background sitting in a `core/cover` wrapper, with a 3-slide `kotlinskidev/hero-carousel` on top carrying only text (no per-slide media, so the video isn't reloaded per slide). The city name binds via `core/post-meta` in both the eyebrow and heading, matching this template's existing "Miasto" binding pattern; the real `post-title` H1 stays in the DOM as `.sr-only` for SEO. `single-service_location-en.html` got the same structure with translated copy and `/en/`-prefixed links.

- **2026-08-30 — Hero Carousel and Banner Carousel now support Swiper transition effects beyond the default slide:** new `transitionEffect` setting (Fade, Coverflow, Cube, Flip, Cards) in the shared `CarouselPanel` (`src/utils/carousel/`), wired into `buildSwiperConfig` and both blocks' Swiper module registration. Defaults to `slide` so existing carousels render unchanged.

- **2026-08-29 — Any paragraph/heading can now pick a native text gradient, right in the Color panel:** new `kotlinskidev/text-gradient` extension (`src/blocks/text-gradient/`) adds a "Text Gradient" row next to core's own Text/Background rows for any block with color-text support (using this WP version's own `color.text !== false` default-enabled model, not the naive `color.text === true` opt-in assumption), applying `.kt-gradient-text` + a per-block `--kt-text-gradient` override via a `render_block` filter (`functions/text-gradient.php`), mirroring `border-gradient`'s existing architecture. Fixed two real bugs surfaced during manual verification: `__experimentalColorGradientControl` fires the *other* tab's `onChange(undefined)` immediately after a pick, and both handlers close over the same pre-click `attributes` — a same-tick stale closure that silently discarded whichever value was set first; fixed with a ref that mutates synchronously in both directions.

- **2026-08-29 — Service Location posts are now natively editable, and their bound city text supports gradient color:** `service_location` gained `editor`/`custom-fields` support plus a `PluginDocumentSettingPanel` (`src/blocks/service-location/panel.tsx`) for setting the `city` field directly, since Block Bindings disables the classic post-list quick-edit path. Three of the five city-bound headings/paragraphs (excluding the pill badge and primary-background CTA, both contrast-unsafe) now carry `kt-gradient-text` so they render with the same gradient used sitewide, even though Block Bindings still disables their inline RichText toolbar. Covered by `tests/integration/tests/ServiceLocationsTest.php`, `tests/e2e/service-location.spec.ts`, and `tests/e2e/editor/service-location.spec.ts`.

- **2026-08-27 — New `kt_project_card` CPT + `kotlinskidev/project-card` block:** simpler sibling of `kt_article_card` — a project card owns its own title, featured image, description, tags, and link URL directly (`functions/project-card.php`), edited via a `PluginDocumentSettingPanel`. Card layout lives in `templates/single-kt_project_card.html`, using `core/post-featured-image`/`core/post-title` so no meta duplication is needed for the image/title.

- **2026-08-27 — Content Tabs can now animate switching between tabs:** new `panelTransition` (None/Fade) and `cardAnimation` (None/Fade Up) attributes in an "Animations" Inspector panel (`content-tabs/edit.tsx`). Fade crossfades panels without a layout jump; card animation staggers `.kt-article-card`/`.kt-project-card` children in one by one, reusing the existing scroll-animation classes. Both default off, so existing usages are unaffected.

- **2026-08-26 — New `kt_article_card` CPT + `kotlinskidev/article-card` block replace hand-duplicated homepage carousel slides:** each card's image/text/button now lives on a `kt_article_card` post, rendered through a shared `templates/single-kt_article_card.html` template via Block Bindings — editing the template once now updates every card wherever it's embedded. A `PluginDocumentSettingPanel` lets editors link a card to any article and auto-fills image/text/permalink.

- **2026-08-26 — City Grid columns and link color are now configurable:** `kotlinskidev/city-grid` gained `columnsDesktop`/`columnsTablet`/`columnsMobile` and `linkTextColor` attributes, with per-breakpoint RangeControls and a `ColorGradientControl` in `src/blocks/city-grid/index.tsx`.

- **2026-08-25 — Editor previews for the city-page dynamic blocks now render in the post's own language:** a `pre_determine_locale` filter plus a `kotlinskidevLang` REST field make `ServerSideRender`'s `urlQueryArgs={ lang }` actually switch gettext, so a PL post previews in Polish and an EN post in English instead of always using the admin's own interface language.

- **2026-08-25 — Editor previews for the city-page dynamic blocks:** `city-grid`, `city-map`, and `service-location-content-dynamic` are PHP-only `render_callback` blocks with no block.json, so the editor showed "doesn't include support for this block." Added inline `registerBlockType()` + `ServerSideRender` per block so the editor now shows real rendered output; frontend was already correct.

- **2026-08-25 — Service Location pages: trust-stats bar + per-city Google Map:** added a 4-stat trust bar after the hero and a "Find us in {city}" section with a free `google.com/maps` iframe embed (`kotlinskidev/city-map`) reading the post's `city` meta — no API key needed. Section anatomy loosely modeled on a competitor's local-SEO structure, kept intentionally smaller to stay fast.

- **2026-08-25 — Service Location city pages are now fully translatable, with EN versions of all 15 cities:** page body moved from hardcoded Polish in the `.html` template into two gettext-wrapped patterns (`service-location-content.php`, `service-locations-intro.php`). Added `service_location` to Polylang's translatable post types and created English siblings for all 15 cities; all new strings translated in both `.po` catalogs.

- **2026-08-25 — Service Locations hub page + 14 Silesian city pages:** `archive-service_location.html` + `service-locations-grid.php` give the hub a card grid auto-listing every published city page alphabetically, no manual maintenance needed. Added 14 new Katowice-metro city pages as drafts.

- **2026-08-25 — Service Location city pages (`service_location` CPT):** new post type at `/tworzenie-stron-www/{city}/` for scaling local-SEO landing pages from one shared template (`single-service_location.html`) — editing it updates every city page instantly. Every city-name mention is bound via the Block Bindings API to one `city` custom field per page.

- **2026-08-25 — `patterns/content-tabs-media.php`:** new 3-tab pattern (image + heading + copy per tab) demonstrating Content Tabs with media.

- **2026-08-24 — Content Tabs editor: true side-by-side layout via React Portals:** `navPosition: left/right` now genuinely lays the nav beside the panels in the editor, matching the frontend, via a `ContentTabsPortalContext` portaling nav-link/panel content into real slot elements instead of a CSS-only approximation. Also resolves a prior gradient-text/background collision, since editor and frontend now share one DOM shape.

- **2026-08-24 — Content Tabs: responsive nav position, per-breakpoint nav gap, and combinable active-tab styling:** added an independent "Mobile position" alongside desktop nav position, a `navGap: {desktop,tablet,mobile}` slider set (replacing a `blockGap` support that was actually a no-op), and three freely combinable active-tab toggles (Underline, Text color, Background), each with its own `ColorGradientControl`. All baked server-side via `WP_HTML_Tag_Processor`, mirrored live in the editor.

- **2026-08-24 — Scroll To Top: trailing arrow icon + label font size:** the Full-Width Bar variant gained an "Arrow Icon" panel (toggle, SVG picker, size slider) and native `typography.fontSize` support for the label. Arrow only applies to the bar variant; Fixed Arrow shows a note instead.

- **2026-08-24 — Link Hover Effects: opt-in animated underline:** added an "Enable underline hover effect" toggle that turns the sitewide sliding-underline effect *on* for any block's links, including outside the header/footer. Shared visual extracted into a `sliding-underline-hover` mixin so the sitewide default and this opt-in class stay in sync.

- **2026-08-23 — Content Tabs editor now previews like the live site:** `content-tabs/edit.tsx` tracks an active-tab index synced to block selection, so selecting a block inside a tab switches which panel is visible instead of showing every panel stacked. Covered by a new selection-sync unit suite and Playwright e2e test.

- **2026-08-22 — Image hover-overlay text:** `core/image` gained a "Hover Overlay" panel that fades in tinted heading/description text on hover or keyboard focus, using the same filter-extension pattern as `group-link`/`text-line-clamp`. Background/text color fully manageable per instance via `ColorGradientControl`; pure CSS reveal, no frontend JS.

- **2026-08-22 — Content Tabs block:** new `kotlinskidev/content-tabs` block — a nav-link strip (top/bottom/left/right) where clicking a link swaps in its own unrestricted content panel. Built as three block types wired together server-side for ARIA (`role="tablist"/"tab"/"tabpanel"`) and unique ids; keyboard navigation lives in `content-tabs-init.ts`.

- **2026-08-22 — Scroll To Top variant selector + full styling:** added a `variant` attribute — existing floating "Fixed Arrow" or a new "Full-Width Bar" with no scroll-progress ring. Block now supports native color/gradient/spacing/border controls; the label is now a Polylang-registered string instead of a per-instance attribute.

- **2026-08-22 — Combinable hover effects + opacity fade:** Hover Animations panel gained an "Additional effects" checklist letting jump/scale/rotate/bounce layer together via composed `--kt-hover-fx-*` custom properties, plus a start/end "Fade opacity on hover" control. Both additive — existing blocks need no changes.

- **2026-08-22 — Truncate Text panel for paragraphs:** added line-clamp CSS (1-10 lines) to `core/paragraph` with a "Read more"/"Read less" toggle appended via a `render_block` filter, and a `ResizeObserver`-based script that only shows the toggle when text actually overflows.

- **2026-08-18 — Hero carousel autoplay hover/focus pause:** added the same mouseenter/mouseleave/focus-based pause-resume wiring `wpe/slider` already had, scoped to the whole carousel wrapper.

- **2026-08-18 — Link whole group:** added a "Link whole group" panel to `core/group`, making the entire block a real `<a>` link via a picked URL. Falls back to click/keydown delegation if the group already contains a nested link, so nested buttons/form fields still work.

- **2026-08-18 — Native spacing on the hero carousel:** `kotlinskidev/hero-carousel` now supports the native Dimensions panel directly, redirecting padding/margin onto `.hero-carousel__content` so it doesn't also affect the background image/video layer.

- **2026-08-16 — Zoom hover animation:** renamed "Zoom Background" to "Zoom" and extended it from Cover blocks to Image, Video, Gallery, and Media & Text, scaling the block's own media element on hover. Border-panel radius now carries through as `--hover-zoom-radius` so rounded corners survive the crop.

- **2026-08-16 — Background effects control:** added a "Background Effects" panel offering five curated animated CSS presets (Gradient Shift, Aurora, Shimmer Text, Wave, Glow Border), built from theme colour tokens with `prefers-reduced-motion` overrides.

- **2026-08-15 — Slider editor preview parity:** the block editor now approximates the frontend layout via CSS instead of showing one slide at a time, and the block's own nav/pagination/scrollbar controls now render and function in the editor.

- **2026-08-15 — Slider autoplay improvements:** Added continuous ticker-style autoplay to `wpe/slider`, with lazy initialization, hover/focus pausing, and optional progress indicators for regular autoplay.

- **2026-08-12 — Responsive slider layouts:** Added centered "peek" slides, responsive slide sizing, configurable maximum slide width, and reusable pagination placement controls to `wpe/slider`.

- **2026-08-12 — Slider modals:** Added the ability to open a modal when clicking a slider slide, reusing the theme's existing modal system.

- **2026-08-12 — Reusable tooltips:** Added a theme-wide CSS tooltip system with dark/light theme support and keyboard accessibility. Integrated it with social links, icons, and the theme switcher.

- **2026-08-11 — Breadcrumbs:** Added a new global breadcrumbs block with responsive visibility, sticky-header integration, multilingual support, and synchronized Yoast structured data.

- **2026-08-11 — Modal system:** Added a native modal content system using a dedicated `kt_modal` post type. Modals support arbitrary block content, Polylang translations, configurable sizes, and can be triggered from both custom and WordPress core link/button blocks.

- **2026-08-11 — 3D model viewer:** Added a reusable `kotlinskidev/model-viewer` block for interactive `.glb` models, including optional animations, orbit controls, dynamic screen text, accessibility support, lazy loading, and WebGL detection.

- **2026-08-11 — SVG icon system:** Replaced the remaining IcoMoon-based icons with a Media Library-based SVG system and added reusable icon controls for custom and core button/navigation blocks.

### Changed

- **2026-09-01 — Offer section's 6 card icons replaced with new custom artwork:** swapped `icon-website`/`icon-shop`/`icon-code`/`icon-performance`/`search-1`/`icon-support` for new uploads (`icon-websites`, `icon-ecommerce`, `icon-internet-apps`, `icon-optimization`, `icon-seo`, `icon-postdeployment-assistance`), matched 1:1 to each card by heading ("Company websites" → websites, "Online stores" → ecommerce, "Web applications" → internet-apps, "Performance optimization" → optimization, "Local SEO" → seo, "Post-launch support" → postdeployment-assistance). Applied to both `single-service_location.html` and `-en.html`; all 6 attachments filed under the existing "Icons" Media Library folder. Old attachments left in place, unreferenced.

- **2026-08-30 — Service Location's offer section becomes a 6-card pricing grid:** the plain 3-item "Our services in {city}" text list is replaced with a "Zakres usług" eyebrow + heading row and two rows of 3 bordered cards (icon badge, heading, description, price), matching a supplied design reference. Added 5 new SVG icon attachments (`icon-website`, `icon-shop`, `icon-code`, `icon-performance`, `icon-support`) plus reuse of the existing `search.svg`, rendered via the theme's `kotlinskidev/icon` block. Applied to both `single-service_location.html` and `-en.html`.

- **2026-08-30 — Service Location's stats bar becomes a horizontal scroll-section:** `single-service_location-en.html`'s plain 4-column stats block (6+ years, 40+ projects, 100%, 24h) is replaced with a parallax `core/cover` wrapping `kotlinskidev/scroll-section`, matching a change already made in the PL template's database-customized copy. Ported with the EN template's existing English stat labels; the PL `.html` file itself doesn't have this change yet — it currently exists only in that template's DB override.


- **2026-08-29 — City landing pages are now fully editable in the Site Editor, split into a PL and an EN template:** replaced the single opaque `kotlinskidev/service-location-content-dynamic` block (which re-rendered `patterns/service-location-content.php` via PHP `esc_html_e()` to dodge WP core's pattern-cache locale-freeze bug) with two real native-block templates — `single-service_location.html` (PL) and `single-service_location-en.html` (EN) — routed by a `single_template_hierarchy` filter checking `pll_current_language()`. Every section is now reorderable, styleable, and extendable directly in the Site Editor, same as any normal template; deleted the now-unused pattern file.

- **2026-08-27 — EN homepage's "Creating Websites" Content Tabs section now showcases real projects instead of generic service blurbs:** replaced its 3 tabs with "Personal projects"/"Client work"/"All projects", each a grid of `kotlinskidev/project-card` embeds. Created 5 real `kt_project_card` posts reusing existing project pages' images and links.

- **2026-08-25 — Hub page intro is native blocks, not a pattern:** the "choose your city" heading/paragraph no longer goes through a pattern + dynamic block — replaced with plain `core/heading`/`core/paragraph` typed directly per hub Page, since each hub page is independent with nothing to share. Deleted the now-unused `service-locations-intro.php` pattern.

- **2026-08-25 — City-pages hub is now two real Pages, not a CPT archive:** `service_location` now has no archive; two normal Pages (PL/EN) reference the existing intro + grid patterns instead. Regular Pages translate their own slug natively in Polylang, sidestepping the CPT-archive-slug limitation. Updated footer nav links accordingly.

### Fixed

- **2026-09-01 — Block editor threw `SyntaxError: Cannot use import statement outside a module` on every page load:** `functions/responsive-order.php` and `includes/hover-animations.php` each `wp_enqueue_script()`'d their own raw `.tsx` source file directly, which browsers can't execute un-transpiled. Both are already compiled into the single `build/editor.js` bundle via `src/editor.ts`'s own import of these same files (correctly enqueued by `functions/enqueue-scripts.php`), so the broken standalone enqueues were pure dead weight — removed them. Also added the missing `wp_set_script_translations('kotlinskidev-editor-only', ...)` call for that combined bundle, since these two modules' own (equally broken) translation registrations were the only thing providing i18n for their strings.

- **2026-09-01 — New SVG uploads showed as a broken image everywhere they're placed via a raw `<img>` tag (block editor canvas, `kotlinskidev/icon`'s preview), even though the same file rendered fine on the live frontend:** root cause confirmed live via `naturalWidth`/`naturalHeight` and an in-page `fetch()` — the files were missing `xmlns="http://www.w3.org/2000/svg"` on the root `<svg>`, which browsers require to decode a *standalone* SVG document (as loaded by `<img src>`) but don't require for SVG inlined directly into HTML (which is how the frontend renders icons, via `functions/svg-support.php`'s existing sanitizer). `functions/svg-support.php` now backfills a missing `xmlns` on `add_attachment` for any `image/svg+xml` upload; the 6 icon files uploaded earlier today were patched directly.

- **2026-09-01 — Newly uploaded SVGs showed no preview anywhere in wp-admin (Media Library grid, block editor media picker):** `wp_generate_attachment_metadata()` never populated `width`/`height` for SVG attachments, since WP core only extracts dimensions via `wp_get_image_editor()` (GD/Imagick), which doesn't handle vector files. `functions/svg-support.php` now hooks `wp_generate_attachment_metadata` to parse dimensions from the SVG's own `width`/`height` attributes (falling back to `viewBox`) for any `image/svg+xml` attachment. Confirmed live: re-generating metadata for an existing SVG attachment picked up `20×20` from its `viewBox`, where it previously had no dimensions at all.

- **2026-08-30 — `kotlinskidev/icon` blocks in the new offer cards showed "This block has encountered an error" in the Site Editor:** the icon-badge wrapper groups used an invalid `layout.type` of `"flow"` (not a registered WP layout type — real values are `default`/`constrained`/`flex`/`grid`), which crashed `getLayoutType(type).getOrientation()` in `block-editor.min.js`. Removed the bogus layout attribute and added the missing `mediaUrl` attribute on each icon block so the editor preview also renders the real SVG instead of a blank placeholder. Frontend output was never affected — only the editor canvas.


- **2026-08-30 — Service Location hero video had a visible edge gap:** WP core's `.wp-block-cover` ships a hardcoded `padding: 1em`, insetting the fullscreen background video/overlay from the viewport edge. Zeroed via the block's own `style.spacing.padding` override in both `single-service_location.html` and `-en.html`. Also switched the hero carousel to `transitionEffect: "fade"` so slides cross-fade instead of sliding, since the shared background no longer needs to move with them.


- **2026-08-29 — "Text Gradient" now looks and behaves exactly like core's native "Text"/"Background" rows:** switched from an always-expanded swatch grid to WP core's own `__experimentalPanelColorGradientSettings` (wrapped as `PanelColorGradientSettings` in `src/blocks/shared/color-gradient-control.ts`), the same component core itself uses for those rows — a collapsed button that opens a popover with Color/Gradient tabs. Both this and the underlying half-width Color panel are a 2-column CSS grid (confirmed via `wp-includes/css/dist/block-editor/style.css`'s `.color-block-support-panel__inner-wrapper`), so the wrapping row explicitly opts into `grid-column: span 2` like core's own full-width rows do.

- **2026-08-27 — `core/post-featured-image`/`core/post-title` rendered with zero height inside project cards:** `page.scss` had a sitewide `display:none !important` rule for those blocks (meant for Page templates) that also caught them inside `kotlinskidev/project-card`, since the homepage embedding the cards is itself a Page. Fixed with a higher-specificity `.kt-project-card` override instead of touching the original rule.

- **2026-08-26 — "Error loading block: Invalid parameter(s): attributes" on every PHP-only dynamic block in the editor:** ~8 sitewide editor filters attach extra attributes to every registered block, which broke `ServerSideRender` once a dynamic block declared its own PHP-side attribute schema. Added a shared `DYNAMIC_PREVIEW_BLOCKS` list and excluded those blocks from all 8 filters.

- **2026-08-26 — Block bindings on the article-card template resolved to nothing for anonymous visitors:** `do_blocks()` doesn't seed block context, so `core/post-meta` bindings need `context['postId']` set manually via `new WP_Block()`. Separately, `kt_article_card` was registered `'public' => false`, blocking meta resolution for anyone without edit rights — both fixed.

- **2026-08-26 — `kt_article_card`'s admin edit screen loaded the classic editor, and its "Linked Article" sidebar panel crashed once Gutenberg did load:** missing `'editor'` support blocked the block editor from loading at all; once fixed, the panel then crashed on an undefined value from an async selector (added optional chaining) and the REST `meta` field was missing (needed `'custom-fields'` support). Also fixed a `ComboboxControl` that showed a blank label instead of the linked article's title by keying it to force a remount once data was ready.

- **2026-08-25 — City/hub pages showed the wrong language regardless of which URL you visited:** `service-location-content.php`/`service-locations-intro.php` were referenced via `wp:pattern`, whose content WP core caches once at whatever locale was active when the cache last populated — every string stayed frozen in that language for all visitors. Replaced with dynamic blocks that `include` the pattern file fresh on every request.

- **2026-08-25 — City map too short, EN city pages used the Polish URL slug:** the map iframe's `height:100%` had nothing to resolve against — set `min-height` directly on the iframe instead. Separately, added a `lang => slug` map + rewrite rule so EN city URLs resolve to `/en/creating-websites/{city}/` instead of the untranslated Polish slug.

- **2026-08-25 — Service Locations hub grid was frozen at whatever state existed when the theme's pattern cache last populated, not live:** the grid's `WP_Query` ran inside a static `wp:html` pattern block, which only executes once at pattern-cache time. Replaced with `kotlinskidev/city-grid`, a PHP-only dynamic block that genuinely re-queries every request.

- **2026-08-25 — Content Tabs patterns flagged "invalid content" in the editor:** `content-tabs-services.php`/`content-tabs-media.php` had hand-authored wrapper markup that didn't match what the blocks' own `save()` functions actually produce. Removed the extra wrapper `<div>` and self-closed each nav-link; also fixed missing `core/image` classes.

- **2026-08-24 — Slider `continuousAutoplay`: dragging under touch could snap backward or freeze permanently on release:** the drag-end position was captured in a handler that could run after `pointerup`, using a stale pre-drag position — now captured directly inside `pointerup`. Also fixed `hovered` getting stuck `true` forever from a touch-emulation `mouseenter` with no matching `mouseleave`.
- **2026-08-24 — Slider `continuousAutoplay`: dragging on Safari/iOS snapped the carousel back to its start before resuming:** `getCurrentTranslateX()` only parsed the 2D `matrix()` transform; WebKit reports `translate3d()` as a `matrix3d()` with a different index, so the regex silently returned `0`. Now parses both matrix forms.
- **2026-08-24 — Slider `continuousAutoplay`: dragging on touch/mobile snapped back before autoplay resumed:** the autoplay-pause reassertion on release was gated behind a `hovered` flag that touch releases never set, leaving Swiper's own force-resume unguarded. Made the reassertion unconditional on release for any pointer type.

- **2026-08-24 — Content Tabs editor: a "Content Tab" item's own padding/border/color had no effect in the editor:** the portal moved an item's children individually into the panels slot, bypassing the wrapper element that actually carries those styles. Fixed by portaling the item's own wrapper instead.
- **2026-08-24 — Content Tabs editor: gradient text on active tab was invisible when a background was also active:** both styles set `background` on the same element, so a pseudo-element background always painted over the gradient-clipped text. Fixed by compositing both as two layers of one `background` property instead of a separate `::before`.
- **2026-08-24 — Content Tabs editor: mobile nav position class was missing:** `edit.tsx`'s wrapper never added the `kt-content-tabs--mobile-{top,bottom}` class `render.php` bakes in, so the "Mobile position" setting had no visible effect in the editor.

- **2026-08-24 — Content Tabs editor: combined active-tab gradient text + gradient background, and left/right nav layout:** the two active-tab style modifiers both wrote to `background` on the same element, so enabling both showed only one. Fixed via an absolutely positioned `::before` for the background, freeing `background` for the text-gradient; also added missing `left`/`right` editor layout rules.

- **2026-08-23 — Hover gradient text never reached the frontend on dynamic (render.php-only) blocks, e.g. Scroll To Top:** the color/gradient baking only ran via `blocks.getSaveContent.extraProps`, which needs a real `save()` output — dynamic blocks have `save: () => null`. Extended the existing PHP render-filter bridge to also emit those classes/properties server-side.

- **2026-08-23 — Hover Animations "Hover text color" had no gradient option:** the text-color picker only ever wired flat-color callbacks. Added the missing gradient wiring and a `has-hover-text-gradient` class that switches to the theme's `gradient-text` mixin.

- **2026-08-23 — Image hover-overlay background tint vanished shortly after hover, text stayed:** the overlay content had no explicit `z-index`, so its stacking context dissolved once its opacity transition settled and the background layer's negative `z-index` escaped to render behind the image. Fixed with an explicit `z-index: 0`.

- **2026-08-23 — Image hover-overlay text could spill above the image on long descriptions:** flexbox centering split overflow evenly across both edges, letting the heading render above the image's own top edge. Fixed with `justify-content: safe center`, anchoring overflow to the top.

- **2026-08-23 — Image hover-overlay background color picker silently ignored:** a flat-swatch click fires both `onColorChange` and `onGradientChange`, and the second call wiped out the first's value. Fixed by porting the same pending-ref guard `hover-animation-controls` already uses for this exact race.

- **2026-08-22 — Border `supports` silently no-op on custom blocks (this WP install still requires `__experimentalBorder`):** `content-tabs`/`-item`/`-nav-link` and `scroll-to-top` declared `supports.border`, which this WP version's border block-support handler doesn't key off. Switched all four to `__experimentalBorder`.

- **2026-08-22 — Hero carousel `light-dark()` nav color stripped on the frontend:** `get_block_wrapper_attributes()` runs its style string through `safecss_filter_attr()`, which silently drops any declaration containing `light-dark(...)`. `render.php` now appends the nav-color variable after that call, bypassing the sanitizer.

- **2026-08-21 — `wpe/slider` still resuming mid-drag with the cursor left inside:** a spurious `mouseleave` can fire mid-drag from fast pointer movement, clearing the hover flag with no compensating `mouseenter`. The release handler now re-checks the pointer's real position against the container's bounding box instead of trusting the flag.

- **2026-08-21 — `kotlinskidev/hero-carousel` (and `banner-carousel`) resuming autoplay mid-drag:** a different root cause than `wpe/slider`'s — Swiper's own `Autoplay` module auto-resumes after a drag's snap-back transition unless `pauseOnMouseEnter` is enabled. `buildSwiperConfig()` now passes that option for any carousel with autoplay on.

- **2026-08-21 — `wpe/slider` continuous autoplay still resuming on release, but only for slower/longer drags:** Swiper's `FreeMode` module force-resumes on release via internal flags that reset on drag-start and only flip back after a 200ms delay, so short drags were unaffected but longer ones weren't. The release handler now re-calls `swiper.autoplay.pause()` on release, overriding Swiper's forced resume.

- **2026-08-21 — `wpe/slider` continuous autoplay briefly speeding up right after a hover/focus-out, near a loop-wrap boundary:** a redundant `slideTo()` call to the same target Swiper was already heading to could trip its loop-boundary reindexing into a one-frame jump. Now snaps instantly when the remaining distance is negligible instead of animating a redundant same-target call.

- **2026-08-21 — `wpe/slider` continuous autoplay teleport, take two: removed the underlying `slideTo()`/computed-partial-duration `slideNext()` pattern entirely:** the epsilon fix above only covered the hover/focus resume path — dragging back to the exact starting position before releasing showed the same jump via a different function with the same footgun. Both resume paths now animate the raw wrapper translate directly instead of re-navigating through Swiper's index API.

- **2026-08-18 — Hero carousel height ignoring the admin bar:** `--hero-min-height` had no admin-bar compensation, so logged-in editors got a hero taller than the visible viewport. Now uses `calc(Nsvh - var(--admin-bar-offset, 0px))`, matching the existing `--kt-above-fold` pattern.

- **2026-08-18 — "Disable link hover effects" not previewing in the editor:** the toggle only applied via a `render_block` filter, which never runs in the editor's live canvas. Added an `editor.BlockListBlock` filter so it previews live; one sub-toggle targeting descendant links still can't preview.

- **2026-08-18 — Floating header switching too early:** a hardcoded 30px scroll threshold triggered the floating "pill" header well short of the header's own ~75px height, leaving a visible gap. Now uses the header's own measured `offsetHeight`.

- **2026-08-18 — Hero carousel nav gradient not showing on the frontend:** the `background-clip:text` trick needed a text glyph scoped to editor-only styles; the frontend renders a real SVG icon whose fill can't hold a gradient. Replaced the icon with a CSS `mask-image` driven by `background`, working identically in both places.

- **2026-08-18 — `wpe/slider` continuous autoplay resuming mid-drag:** press-tracking relied on a `click` listener that Swiper suppresses after a drag, leaving the ticker stuck or resuming incorrectly. Swapped to `pointerdown`/`pointerup`/`pointercancel`, which bracket the whole gesture regardless of where it ends.

- **2026-08-18 — Invisible overlay dim on the homepage hero:** the Cover block's `overlayColor` was set to `"dark"`, not a real `theme.json` palette slug, so WordPress generated no background color. Changed to the valid `contrast` slug.

- **2026-08-18 — Same-page scroll anchors getting disabled:** the "already on this page" detector discarded the URL fragment before comparing paths, so `#section` anchors got incorrectly disabled. Any URL containing `#` is now exempt from that check.

- **2026-08-18 — Gradient border on `core/button` landing on the wrong element:** the `border-gradient` extension matched only the block's outer `<div>`, not the inner `<a>` that actually carries the border/radius. `core/button` is now special-cased to target the link element directly.

- **2026-08-17 — i18n tooling and translation debt:** `bin/i18n-check.js` was silently no-op'ing — `wp i18n make-pot` OOM'd under the default 128M memory limit and the failure was swallowed. Now runs via `php -d memory_limit=512M`; also translated 108 strings that had drifted untranslated/fuzzy.

- **2026-08-16 — Mobile/tablet header + breadcrumbs:** breadcrumb visibility on mobile was direction-based instead of position-based like desktop, and the mobile header background stayed translucent past the point desktop would solidify. `sticky-header.ts` is now the sole owner of both, matching desktop behavior on all breakpoints.

- **2026-08-15 — Slider autoplay:** Fixed several continuous and regular autoplay issues involving pausing/resuming, loop positioning, clicks, focus, and interaction with Swiper's internal state.
- **2026-08-15 — Continuous autoplay hover/focus resume:** elapsed-time-based resume math was the wrong model for a ticker built from one long transition. Replaced with a position/state-based design reading Swiper's own `animating` flag at pause time.
- **2026-08-15 — Continuous autoplay pause-moment jump:** `loopFix()`'s periodic slide-reshuffle snapped translate to a grid position on hover-in, discarding the exact pointer-landed offset. Freeze now calls `loopFix({ byMousewheel: true })`, Swiper's own path for preserving an arbitrary live position.
- **2026-08-15 — Continuous autoplay hover freezing on the wrong slide:** the frozen slide's content was consistently one slide ahead of the cursor, since `loopFix()` also rotates DOM order during its reshuffle. Freeze no longer calls `loopFix()` at all, since it wasn't actually needed once resume-target ordering was fixed.

- **2026-08-12 — Slider editor:** Fixed the editor preview so all slides remain directly editable and navigation/pagination work correctly inside Gutenberg.

- **2026-08-12 — Slider pagination:** Fixed pagination rendering and click behavior, and moved pagination outside the slide area by default.

- **2026-08-12 — Navigation accessibility:** Removed redundant keyboard focus from hamburger-menu parent links that are covered by submenu controls.

- **2026-08-11 — Modal accessibility & SEO:** Improved modal focus management, background inertness, accessible naming, focus styling, and preservation of real link destinations for search engines.

- **2026-08-11 — GLB uploads:** Fixed `.glb` uploads failing through some WordPress media code paths.

- **2026-08-11 — SVG icons:** Fixed icon sizing and gradient states after migrating from IcoMoon fonts to inline SVGs.

### Internationalization

- **2026-09-01 — Full PL/EN translation catalog refresh:** `languages/en_US.po`/`pl_PL.po` had drifted to hundreds of fuzzy/untranslated strings behind the actual source (new blocks like `load-more`/`equal-height-columns` plus older undertranslated batches), which blocked `npm run i18n:check` in the pre-push hook. Regenerated `kotlinskidev.pot` and filled every missing/fuzzy entry in both catalogs (English via identity-fill, Polish translated by hand), then rebuilt `.mo`/`.l10n.php`/`.json` — `wp i18n make-json` was found to destructively rewrite the source `.po` files as a side effect, so `.po` content is now re-saved after that step rather than before it.

### Chore

- **2026-08-12 — Icon migration:** Removed the final hardcoded SVG/icon-font dependencies and moved social icons fully to the Media Library-based system.

- **2026-08-09 — Version checks:** Added automatic version synchronization checks for `style.css` and `package.json`.

- **2026-08-09 — Internationalization tooling:** Improved translation checks and fixed detection of wrapped/untranslated strings. The theme's translations now pass the full i18n check.

### Security

- **2026-08-17 — Dependency audit:** Patched `nanoid` (moderate, unbounded-loop) via `overrides` and bumped `@wordpress/env` to `^11.13.0` (npm's own suggested fix). Excluded advisory 1139346 (`extract-zip`, high) from `security:audit:full` — confirmed unpatched upstream, dev-only, never shipped; documented in `docs/security.md`.

- **2026-08-09 — Security headers:** Added configurable `Content-Security-Policy`, `Referrer-Policy`, and `Permissions-Policy` support with a dedicated Security settings tab. CSP currently runs in Report-Only mode and is designed to be configurable per site.

- **2026-08-09 — Security documentation:** Added a security-header reference and implementation checklist covering WordPress, Cloudflare, CSP, TLS, and remaining security work.

---

## [1.1.0] — 2026-08-09

### Added

- **2026-08-09 — Testing infrastructure:** Added comprehensive JS/TS, PHP unit/integration, and Playwright e2e testing infrastructure with authenticated editor testing and pattern validation.

- **2026-08-04 — Block improvements:** Added new FAQ layout controls, content blocks, protected-content options, popular-pages typography controls, navigation improvements, active-page highlighting, gradient borders, and cross-plugin noindex support.

### Changed

- **2026-08-04 — Footer redesign:** Restructured the footer around reusable blocks, improved navigation structure, protected the address content, and synchronized social links.

### Fixed

- **2026-08-09 — Pattern validation:** Fixed multiple invalid theme patterns discovered through automated Gutenberg validation.

- **2026-08-07 — Security fixes:** Fixed stored XSS vulnerabilities, unsafe SVG handling, an open redirect, resource-exhaustion risks, and multiple escaping/CSRF issues.

- **2026-08-04 — Accessibility:** Completed a Lighthouse-driven accessibility pass, fixing labels, touch targets, image issues, navigation problems, and plugin-related accessibility issues. Accessibility reached 100/100 on desktop and mobile.

### Performance

- **2026-08-04 — Performance improvements:** Reduced About-page LCP and database query count through dynamic asset deferral, caching, and query optimizations.

- **2026-08-04 — Protected content:** Batched and lazy-loaded protected-content decryption requests to reduce page-load overhead.

### Internationalization

- **2026-08-05 — Translation coverage:** Added automated i18n checks and completed a full translation audit for the theme and `wordpress-pwa-manager`, eliminating missing and fuzzy translations.
