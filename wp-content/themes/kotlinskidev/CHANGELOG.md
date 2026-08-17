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
