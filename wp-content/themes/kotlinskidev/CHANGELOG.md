# Changelog

All notable changes to the kotlinskidev theme are documented in this file. Entries are kept short (2-3 sentences) — for full technical detail on any entry, see the referenced files' own git history/commit messages.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this theme follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking change: removed/renamed a block or attribute, a template/pattern change that requires editors to re-save affected content, a markup change that isn't backward compatible.
- **MINOR** — new, backward-compatible capability: a new block, a new attribute, a new pattern, a new editor control.
- **PATCH** — bug fix, style tweak, security fix with no new capability.

**When releasing:** bump `Version` in `style.css` and `"version"` in `package.json` together (they must always match), move the `[Unreleased]` entries under a new dated version heading, and start a fresh empty `[Unreleased]` section. See `docs/treeview.md` for the full current structure reference — update it alongside any change that adds/removes/renames a block, pattern, template, function module, or test file. See `.claude/skills/sync-docs/SKILL.md` for the full checklist to run before considering any change "done."

Keep changelog short: max 2-3 sentences per entry, to keep the file scannable and its size down. If a change needs more detail than that, put it in the commit message or PR description instead.

---

## [Unreleased]

### Added

- **2026-08-22 — Combinable hover effects + opacity fade:** The Hover Animations panel now has an "Additional effects" checkbox list (`hoverAnimationExtra`) letting the jump/scale/rotate/bounce transform effects layer on top of the primary Animation Type pick — each contributes its own `--kt-hover-fx-*` custom property into one composed `transform`, so e.g. Jump + Scale + Rotate can play together instead of overwriting each other. Also added a start/end "Fade opacity on hover" control (`hoverOpacityEnabled`/`hoverOpacityFrom`/`hoverOpacityTo`). Both are additive, new attributes — existing published blocks using `hoverAnimation` need no changes. The scroll-reveal "visible" state (`fade-*-on-scroll`) now settles at the configured hover-opacity "from" value instead of a hardcoded `1`, so the two features compose correctly when used on the same block.

- **2026-08-22 — Truncate Text panel for paragraphs:** Added a "Truncate Text" panel to `core/paragraph` (line-clamp CSS driven by a configurable 1-10 line count) with a "Read more"/"Read less" toggle button appended on the frontend via a `render_block` filter (`functions/text-line-clamp.php`) and `WP_HTML_Tag_Processor`, plus a new `src/scripts/line-clamp.ts` that uses `ResizeObserver` to only show the toggle when the text actually overflows. The button label reuses the theme's existing reserved `general.read_more`/`general.read_less` translation strings, so it's already translated per site language via the theme's `.po` files.

- **2026-08-18 — Hero carousel autoplay hover/focus pause:** `kotlinskidev/hero-carousel`'s autoplay had no pause-on-hover at all. Added the same `mouseenter`/`mouseleave`/focus-based pause/resume wiring already used by `wpe/slider`, scoped to the whole carousel wrapper.

- **2026-08-18 — Link whole group:** Added a "Link whole group" panel to `core/group`, making the entire block a real `<a>` link (native hover URL preview, right-click, crawlability) via a picked URL. If the group already contains a nested link, it falls back to click/keydown delegation instead of an invalid nested `<a>`. Either way, clicks on a nested button or form field keep working normally instead of being hijacked.

- **2026-08-18 — Native spacing on the hero carousel:** `kotlinskidev/hero-carousel` now supports the native Dimensions panel (padding/margin) directly. For each slide, padding/margin is redirected from the slide's own wrapper onto `.hero-carousel__content` (via `__experimentalSkipSerialization` + WordPress's own style-engine output), so it doesn't also pad/margin the background image/video layer.

- **2026-08-16 — Zoom hover animation:** Renamed "Zoom Background" to "Zoom" and extended it beyond Cover blocks to Image, Video, Gallery, and Media & Text — it now scales the block's own `img`/`video` element on hover instead of only Cover's background layer. The block's own Border-panel radius is now carried through as `--hover-zoom-radius` so rounded corners survive the zoom crop instead of clipping to a square edge.

- **2026-08-16 — Background effects control:** Added a "Background Effects" panel (available on every supported block, alongside Hover Animations) offering five curated, always-on animated CSS presets — Gradient Shift, Aurora, Shimmer Text, Wave, Glow Border — built from `theme.json` colour tokens with `prefers-reduced-motion` overrides. Each effect exposes up to 3 alpha/gradient-capable colour pickers per block instance, falling back to theme-wide brand defaults when left empty. Glow Border reuses the existing mask-based `gradient-border` mixin instead of `border-image`, so it only animates colour — the block's own native Border panel still controls width, radius, and style.

- **2026-08-15 — Slider editor preview parity:** The block editor now approximates the frontend layout (`slidesPerView`, `centerSlides`/peek, `spaceBetween`) via CSS instead of showing one slide at a time, so the editor is a closer visual match to what's published. Slides scroll into view on selection instead of being hidden. The block's own navigation/pagination/scrollbar controls now render (and function) in the editor when enabled; the previous editor-only prev/next + dots switcher is kept only as a fallback when all three are off, so every slide stays reachable.

- **2026-08-15 — Slider autoplay improvements:** Added continuous ticker-style autoplay to `wpe/slider`, with lazy initialization, hover/focus pausing, and optional progress indicators for regular autoplay.

- **2026-08-12 — Responsive slider layouts:** Added centered “peek” slides, responsive slide sizing, configurable maximum slide width, and reusable pagination placement controls to `wpe/slider`.

- **2026-08-12 — Slider modals:** Added the ability to open a modal when clicking a slider slide, reusing the theme's existing modal system.

- **2026-08-12 — Reusable tooltips:** Added a theme-wide CSS tooltip system with dark/light theme support and keyboard accessibility. Integrated it with social links, icons, and the theme switcher.

- **2026-08-11 — Breadcrumbs:** Added a new global breadcrumbs block with responsive visibility, sticky-header integration, multilingual support, and synchronized Yoast structured data.

- **2026-08-11 — Modal system:** Added a native modal content system using a dedicated `kt_modal` post type. Modals support arbitrary block content, Polylang translations, configurable sizes, and can be triggered from both custom and WordPress core link/button blocks.

- **2026-08-11 — 3D model viewer:** Added a reusable `kotlinskidev/model-viewer` block for interactive `.glb` models, including optional animations, orbit controls, dynamic screen text, accessibility support, lazy loading, and WebGL detection.

- **2026-08-11 — SVG icon system:** Replaced the remaining IcoMoon-based icons with a Media Library-based SVG system and added reusable icon controls for custom and core button/navigation blocks.

### Fixed

- **2026-08-22 — Hero carousel `light-dark()` nav color stripped on the frontend:** `navColor`/`navColorOnHover` values using `light-dark(...)` (the theme's color-scheme-aware picker output) rendered fine in the editor but vanished on the frontend, because `get_block_wrapper_attributes()` runs its merged `style` string through WP core's `safecss_filter_attr()`, which silently drops any declaration containing `light-dark(...)`. `render.php` now appends the nav-color CSS variable to the wrapper's `style` attribute after `get_block_wrapper_attributes()` has already run (via `WP_HTML_Tag_Processor`, same pattern as `border-gradient`/`responsive-spacing`), bypassing that sanitizer entirely.

- **2026-08-18 — Hero carousel height ignoring the admin bar:** `--hero-min-height` was a bare `Nsvh` value with no admin-bar compensation, so logged-in editors viewing the frontend got an "above the fold" hero taller than the actually-visible viewport. Now uses `calc(Nsvh - var(--admin-bar-offset, 0px))`, matching the theme's existing `--kt-above-fold` pattern.

- **2026-08-18 — "Disable link hover effects" not previewing in the editor:** the toggle only ever applied via a `render_block` PHP filter, which never runs inside the editor's live canvas — so it worked on the frontend but looked like a no-op while editing. Added an `editor.BlockListBlock` filter (same mechanism `border-gradient` already uses) so the background/underline-disable classes now preview live; the third sub-toggle (disabling the link-gradient effect on nested `<a>` tags specifically) still doesn't preview, since it targets descendant links the wrapper-level filter can't reach.

- **2026-08-18 — Floating header switching too early:** `sticky-header.ts` used a hardcoded 30px scroll threshold before switching into the narrower floating "pill" header, well short of the header's own ~75px height — leaving a visible gap above content. The threshold is now the header's own measured `offsetHeight` instead of a magic number.

- **2026-08-18 — Hero carousel nav gradient not showing on the frontend:** the gradient hover color on the prev/next arrows only rendered in the editor, because the `background-clip:text` trick needs a text glyph (`::after { content: "❮" }`) that was scoped to `.editor-styles-wrapper` only — the frontend renders a real Swiper `<svg>` icon instead, whose `currentColor` fill can't hold a gradient. Replaced the shared `carousel-nav` mixin's icon with a CSS `mask-image` (built from Swiper's own arrow shape) driven by `background`, so solid colors and gradients both work identically in the editor and on the frontend, for every block using this shared carousel-nav system (hero carousel, banner carousel, gallery lightbox).

- **2026-08-18 — `wpe/slider` continuous autoplay resuming mid-drag:** press-tracking used `mousedown` + a `document` `click` listener that only cleared on a click landing *outside* the container — Swiper suppresses the click event that would normally follow a drag, so a manual drag could leave the ticker stuck paused, or (combined with the old asymmetric hover/click model) resume while the pointer was still inside. Swapped to `pointerdown`/`document pointerup`+`pointercancel`, which bracket the whole gesture regardless of where it ends, and added drag-end position + proportional resume-speed tracking (via Swiper's own `touchEnd` event) so resuming after a manual drag continues smoothly from wherever it was actually left, instead of jumping or restarting from the pre-drag position.

- **2026-08-21 — `wpe/slider` still resuming mid-drag with the cursor left inside:** the `pointerup`/`pointercancel` swap above fixed the click-suppression case, but a real browser quirk remained — a spurious `mouseleave` can fire mid-drag from fast pointer movement/reflow even though the cursor never actually left the carousel, permanently clearing the tracked hover flag with no compensating `mouseenter` to restore it. `wireContinuousAutoplay()`'s release handler now re-checks the pointer's real `clientX`/`clientY` against the container's live bounding box on `pointerup`/`pointercancel` (for mouse-type pointers) instead of trusting the possibly-stale hover flag, so autoplay only resumes once the cursor has genuinely left.

- **2026-08-21 — `kotlinskidev/hero-carousel` (and `kotlinskidev/banner-carousel`) resuming autoplay mid-drag:** confirmed the same reported symptom on the homepage hero carousel came from a different root cause than `wpe/slider`'s — Swiper's own `Autoplay` module resumes automatically once the drag's own snap-back transition ends (`waitForTransition`), regardless of custom hover-tracking, unless Swiper's built-in `pauseOnMouseEnter` option is enabled to set its internal "still hovering" flag. `buildSwiperConfig()` (shared by both blocks) now passes `pauseOnMouseEnter: true` for any carousel with autoplay on, so a drag release while the cursor is still over the carousel no longer auto-resumes; `hero-carousel/init.ts`'s own hover/focus pause wiring also gained the same `pointerdown`/`pointerup` press-tracking as `wpe/slider`, for the keyboard/touch cases Swiper's own option doesn't cover.

- **2026-08-21 — `wpe/slider` continuous autoplay still resuming on release, but only for slower/longer drags:** root-caused via Swiper's own source — its `FreeMode` module (used here since `momentum: false`) always fires `_freeModeStaticRelease` on release, and the `Autoplay` module's handler for that event force-resumes unconditionally whenever its internal `pausedByInteraction`/`pausedByTouch` flags are set. Those flags get reset to `false` the instant a drag starts (`sliderFirstMove`), then flipped back to `true` by a 200ms-delayed internal timeout — so a drag shorter than 200ms never trips the forced resume, but anything held longer does, regardless of whether the cursor is still over the carousel. `wireContinuousAutoplay()`'s release handler now re-calls `swiper.autoplay.pause()` on release whenever still hovering/focused, overriding Swiper's own forced resume, which fires synchronously earlier in the same event.

- **2026-08-21 — `wpe/slider` continuous autoplay briefly speeding up right after a hover/focus-out, near a loop-wrap boundary:** the mid-transition resume path (`computeResumeSpeed`) finishes an interrupted leg by re-navigating to the same slide index Swiper already considers itself heading to. When the frozen position landed within a hair of that target's exact grid boundary, this redundant `slideTo()` call could trip Swiper's own loop-boundary reindexing into a one-frame translate jump (confirmed via a live-site Playwright probe sampling raw transform values — the strip visibly teleported a full slide-width backward mid-resume, read by the eye as "speeding up" before the next cycle looked normal again). `wireContinuousAutoplay()` now detects when the remaining distance is negligible (under 5% of a slide's width) and snaps it instantly instead of animating a redundant same-target `slideTo()`, then advances via `slideNext()` — a genuine index change loop mode already handles cleanly.

- **2026-08-21 — `wpe/slider` continuous autoplay teleport, take two: removed the underlying `slideTo()`/computed-partial-duration `slideNext()` pattern entirely:** the epsilon-based fix above only guarded the mid-transition (hover/focus) resume path; a genuine repro from dragging left then right back to the exact starting position (still held) before releasing showed the same class of jump on the drag-end resume path too, which used a different function (`computeNextBoundarySpeed`) with the identical footgun — a computed-duration `slideNext()`/`slideTo()` re-navigating through Swiper's own index API for what's really just "finish this last bit of visual distance." Both resume paths in `wireContinuousAutoplay()` now animate the raw wrapper translate directly (`setTransition`/`setTranslate`, bypassing Swiper's index bookkeeping entirely for the catch-up) and only call a normal, full-speed `slideNext()` once that catch-up's own `transitionend` genuinely fires — the same call pattern already used everywhere else for a real cycle advance, never implicated in either jump.

- **2026-08-18 — Invisible overlay dim on the homepage hero:** `patterns/home-banner.php` set the Cover block's `overlayColor` to `"dark"`, which isn't a real `theme.json` palette slug — WordPress silently generated no background-color for it, and its own black fallback doesn't kick in once *any* `-background-color` class is present. Changed to the already-valid `contrast` slug (matches `hero-banner.php`'s working pattern).

- **2026-08-18 — Same-page scroll anchors getting disabled:** `active-link-state`'s "you're already on this page" detector discarded the URL fragment before comparing paths, so any `#section` scroll-to anchor whose path matched the current page (locale-dependent on how the link happened to be authored) got `pointer-events:none` and `aria-disabled` applied — breaking in-page CTA buttons. Any URL containing a `#` is now exempt from that check.

- **2026-08-18 — Gradient border on `core/button` landing on the wrong element:** the `border-gradient` extension matched only the block's first rendered tag, which for `core/button` is the outer `<div>`, not the inner `<a class="wp-block-button__link">` that actually carries the border/radius. That's why the gradient ignored border-radius and didn't remove the native border — `core/button` is now special-cased to target the link element directly, matching how `kotlinskidev/button` and `is-style-gradient-outline` already do it.

- **2026-08-17 — i18n tooling and translation debt:** `bin/i18n-check.js` was silently no-op'ing on the theme catalog — `wp i18n make-pot` OOM'd under the default 128M CLI `memory_limit` (repo outgrew it), and the failure was swallowed, always "passing." Now runs via `php -d memory_limit=512M`. Also translated the 108 strings this had let drift untranslated/fuzzy across `en_US.po`/`pl_PL.po`, and removed a malformed multi-line obsolete (`#~`) entry that was failing `msgmerge` outright.

- **2026-08-16 — Mobile/tablet header + breadcrumbs:** Breadcrumbs visibility was direction-based on mobile (`hide-nav-on-scroll.ts` re-showed them on any upward scroll, anywhere on the page) instead of position-based like desktop. `sticky-header.ts` now runs its near-top threshold check on all breakpoints and is the sole owner of breadcrumbs + `.header-sticky` state; the mobile header background was also always translucent/blurred and now stays solid until scrolled past the same threshold, matching desktop.

- **2026-08-15 — Slider autoplay:** Fixed several continuous and regular autoplay issues involving pausing/resuming, loop positioning, clicks, focus, and interaction with Swiper's internal state.

- **2026-08-15 — Continuous autoplay hover/focus resume:** Fixed the ticker skipping ahead on every hover-out/focus-out. First attempt used `performance.now()`-tracked remaining duration to resume, but rapid hover in/out revealed the deeper issue: `swiper.autoplay.resume()`'s own elapsed-time math (`delay - elapsed`) is fundamentally the wrong model for a ticker built from one long `slideNext()` transition. Replaced with a purely position/state-based design (matching how this worked before the autoplay rework): read Swiper's own `animating` flag at the moment of pause — if a transition was genuinely in flight, resume finishes it via `slideTo(activeIndex, speed, ...)`; if idle between cycles, resume starts a fresh `slideNext()`. No time tracking involved.

- **2026-08-15 — Continuous autoplay pause-moment jump:** Fixed hover-in snapping to a nearby grid position instead of freezing exactly where the pointer landed. `loopFix()`'s own append/prepend reshuffle (which periodically relocates duplicated loop slides as the ticker advances) calls `slideTo(index, 0, ...)` internally, which snaps translate to that slide's exact grid position — discarding whatever arbitrary sub-slide offset was mid-transition — and silently renumbers `activeIndex` in the process. Freeze now calls `loopFix({ byMousewheel: true })`, Swiper's own built-in path for preserving an arbitrary live position through the same reshuffle, and the resume target index is read after the freeze completes instead of before (the earlier read could capture an index `loopFix` was about to renumber out from under it).

- **2026-08-15 — Continuous autoplay hover freezing on the wrong slide:** Fixed the frozen slide's *content* consistently being one slide ahead of whatever was actually under the cursor on hover — reproduced deterministically with zero real elapsed time (synthetic same-tick event dispatch), ruling out human/browser reaction latency. Root cause: `loopFix()` rotates the DOM order of duplicated loop slides as part of its normal bookkeeping; with a small slide count (as in `centerSlides` layouts) this reorder threshold is crossed on nearly every hover. Even with the earlier `byMousewheel: true` fix, `swiper.translate` came back numerically unchanged while the slide occupying that position had rotated — a real visual shift the translate-only check couldn't see. Freeze no longer calls `loopFix()` at all; it wasn't actually needed once the resume-target-index ordering was already fixed, and removing it eliminates the content rotation entirely (confirmed via the existing many-cycle stress tests, which still pass without it).

- **2026-08-12 — Slider editor:** Fixed the editor preview so all slides remain directly editable and navigation/pagination work correctly inside Gutenberg.

- **2026-08-12 — Slider pagination:** Fixed pagination rendering and click behavior, and moved pagination outside the slide area by default.

- **2026-08-12 — Navigation accessibility:** Removed redundant keyboard focus from hamburger-menu parent links that are covered by submenu controls.

- **2026-08-11 — Modal accessibility & SEO:** Improved modal focus management, background inertness, accessible naming, focus styling, and preservation of real link destinations for search engines.

- **2026-08-11 — GLB uploads:** Fixed `.glb` uploads failing through some WordPress media code paths.

- **2026-08-11 — SVG icons:** Fixed icon sizing and gradient states after migrating from IcoMoon fonts to inline SVGs.

### Chore

- **2026-08-12 — Icon migration:** Removed the final hardcoded SVG/icon-font dependencies and moved social icons fully to the Media Library-based system.

- **2026-08-09 — Version checks:** Added automatic version synchronization checks for `style.css` and `package.json`.

- **2026-08-09 — Internationalization tooling:** Improved translation checks and fixed detection of wrapped/untranslated strings. The theme's translations now pass the full i18n check.

### Security

- **2026-08-17 — Dependency audit:** Patched `nanoid` (moderate, unbounded-loop) via `overrides` and bumped `@wordpress/env` to `^11.13.0` (npm's own suggested fix). Excluded advisory 1139346 (`extract-zip`, high) from `security:audit:full` — confirmed unpatched upstream for every published version, dev-only (Puppeteer/e2e tooling), never shipped; documented in `docs/security.md`.

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
