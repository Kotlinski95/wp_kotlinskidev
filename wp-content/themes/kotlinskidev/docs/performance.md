# Performance Review Checklist

A comprehensive review checklist for kotlinskidev.dev, modeled on what a best-in-class website should meet on every axis: JS runtime behavior, rendering/compositing, network delivery, and WordPress backend performance. This is a working checklist, not a description of current state — items get checked off as each is verified against the live site and codebase.

Scope for this pass: `src/blocks/*` (10 custom Gutenberg blocks), `src/scripts/*` (22 frontend TS modules), `src/styles/*` (SCSS), GSAP/ScrollTrigger usage (`src/index.ts`, `src/blocks/scroll-section/init.ts`, `src/scripts/gsap-sticky.ts`), Swiper (`banner-carousel`, `hero-carousel`), and the PHP render/query layer in `functions/`.

---

## 1. Event Handling & Listener Hygiene

- [ ] Every `addEventListener` has a matching `removeEventListener` (or a documented reason it lives for the page's full lifetime). Codebase currently has 96 `addEventListener` calls vs 18 `removeEventListener` calls across `src/scripts/*` — audit the gap block by block.
- [ ] Block frontend scripts (`view.php` / `viewScript` entries) clean up listeners when their DOM node is removed (Site Editor navigation, AJAX-loaded content, or block re-render in the editor canvas).
- [ ] No listener is attached more than once to the same element across re-renders (e.g. a script re-running on `DOMContentLoaded` + a block's own init both binding the same handler).
- [ ] High-frequency events (`scroll`, `resize`, `mousemove`, `pointermove`, `wheel`) are debounced/throttled or driven via `requestAnimationFrame`, never handled synchronously on every event.
- [ ] `scroll` and `touchstart`/`touchmove` listeners are registered `{ passive: true }` unless they call `preventDefault()`, so they don't block the compositor thread.
- [ ] Event delegation is used for repeated/list elements (e.g. `nav-popular-pages`, `simple-grid` items, gallery items) instead of one listener per item.
- [ ] No listener bound to `window`/`document` when it could be scoped to a nearer ancestor or the specific element.
- [ ] `IntersectionObserver` / `ResizeObserver` / `MutationObserver` instances (used in `hero-carousel`, `protected-content`, `cookie-consent`, `hamburger`, `animated-counter`, `accessibility`, `scroll-animations`, `gsap-sticky`, `image-lightbox`) are `.disconnect()`'d when their target leaves the DOM, not left running indefinitely.
- [ ] `setTimeout`/`setInterval` handles are stored and cleared on teardown; no orphaned timers keep firing after a component/block is gone.

## 2. Event Propagation

- [ ] `stopPropagation()` / `stopImmediatePropagation()` is used only where bubbling would genuinely cause a bug (e.g. dropdown-inside-dropdown, modal-inside-clickaway) — not applied defensively/by habit.
- [ ] No two handlers on the same event both fire and produce a duplicated side effect (e.g. a submenu toggle in `mega-menu.ts` and a document-level outside-click handler both reacting to the same click).
- [ ] Click-outside-to-close patterns (mega-menu, search-panel, language-panel, hamburger) use a single delegated document listener, not one per open panel instance.
- [ ] Keyboard event handling (`Escape` to close panels, arrow-key nav in menus) doesn't fight with browser-native focus/propagation behavior.
- [ ] Custom events (if any `CustomEvent`/`dispatchEvent` usage exists) bubble only as far as needed and are namespaced to avoid collisions with third-party scripts.

## 3. Redundant Code & Dead Code

- [ ] No duplicate utility functions across `src/utils/`, `src/scripts/utils.ts`, and individual blocks — shared logic lives in one place and is imported.
- [ ] No unused exports/imports left behind after refactors (verify with `eslint` unused-vars rule or a dedicated dead-code pass).
- [ ] No two blocks implementing near-identical logic that could share a hook/helper (e.g. responsive-width parsing repeated across `nav-banner`, `nav-image`, `simple-grid`).
- [ ] No leftover `console.log`/debug code shipped to the `build/` output.
- [ ] No commented-out blocks of old implementation left in source files.
- [ ] Feature-flagged or `-pl` legacy code paths (per `CLAUDE.md`: no `-pl` suffixed files should remain) are fully removed, not just unreferenced.
- [ ] Webpack bundle analysis shows no duplicate library versions (e.g. two copies of GSAP or Swiper pulled in by different entry points).

## 4. Promises, Async/Await & Control Flow

- [ ] Independent async operations use `Promise.all`/`Promise.allSettled` instead of sequential `await` chains that serialize unrelated work.
- [ ] Every promise chain has error handling — no bare `.then()` without a `.catch()`, no `async` function whose rejection can go unhandled.
- [ ] No unnecessary `async`/`await` wrapping around synchronous code (adds microtask overhead and obscures control flow for no benefit).
- [ ] Fetch calls (search, popular-pages, page-views tracking) have timeouts/abort handling via `AbortController`, so a slow/hanging request doesn't leak a pending promise.
- [ ] No promise chain silently swallows an error and leaves the UI in an inconsistent state (e.g. a failed language-switch fetch that never resets a loading indicator).
- [ ] Repeated/duplicate in-flight requests are deduplicated (e.g. rapid search input shouldn't fire N overlapping fetches — debounce + cancel previous).

## 5. Rendering, Layout & Reflow

- [ ] Every scroll-driven or interaction-driven animation animates only `transform` and `opacity` — never `top`/`left`/`right`/`bottom`, `width`/`height`, or `margin`/`padding`, which trigger layout (reflow), not just composite.
- [ ] Where a "grow/shrink" or "move" effect is needed (mega-menu open, sticky header, hamburger panel, banner slides), it's implemented with `transform: translate/scale` rather than changing box-model properties.
- [ ] No JS reads a layout-dependent property (`offsetWidth`, `offsetHeight`, `getBoundingClientRect`, `scrollHeight`, `clientWidth`, etc.) immediately after writing a style in the same tick — this forces synchronous layout ("layout thrashing"). Reads are batched before writes.
- [ ] GSAP tweens (`gsap-sticky.ts`, `scroll-section/init.ts`, `hero-carousel`) animate `x`/`y`/`scale`/`opacity`, not raw `top`/`left`/`width` properties.
- [ ] `ScrollTrigger` instances are `.kill()`'d and `ScrollTrigger.refresh()` is called appropriately on resize/content-height changes, so stale triggers don't recalculate against outdated layout.
- [ ] `will-change` is applied narrowly (only on elements actively animating, removed after) — not left permanently on large sections, which bloats GPU memory and can hurt performance instead of helping.
- [ ] Elements with continuous animation (parallax, sticky, carousel) are promoted to their own compositor layer only where it measurably helps — avoid creating dozens of unnecessary layers.
- [ ] No animation loop runs on the main thread via unthrottled `requestAnimationFrame` when the element is off-screen (pause animations outside the viewport, e.g. via `IntersectionObserver`).
- [ ] `prefers-reduced-motion: reduce` is respected — decorative/parallax/scroll animations are disabled or reduced to opacity-only for users who request it.
- [ ] No layout shift is introduced by dynamically injected content (cookie-consent banner, language-panel, lazy-loaded images) — reserved space or fixed/absolute positioning prevents CLS.

## 6. Core Web Vitals & Perceived Performance

- [ ] **LCP** — the largest above-the-fold element (hero image/banner) is preloaded (`<link rel="preload">` or `fetchpriority="high"`), not lazy-loaded, and served in a modern format at the correct rendered size.
- [ ] **CLS** — all images/video have explicit `width`/`height` (or `aspect-ratio`) so the browser reserves space before load; web fonts use `font-display: swap` (or are preloaded) to avoid FOIT/layout jump.
- [ ] **INP** — no single long task blocks the main thread for >200ms on interaction (menu open, search input, filter click); heavy work is chunked or moved off the critical interaction path.
- [ ] **TTFB** — server response time is monitored (ties into `docs/monitoring.md`); PHP-side caching (`functions/cache.php` transients) is actually hit on repeat requests, not bypassed.
- [ ] No render-blocking third-party script (analytics, consent, fonts) sits above the fold without `async`/`defer`.
- [ ] Above-the-fold CSS is minimal/critical; non-critical styles don't block first paint.

## 7. Asset Loading & Network

- [ ] Images use modern formats (WebP/AVIF — theme already standardizes on WebP per `assets/`) with responsive `srcset`/`sizes`, and are lazy-loaded (`loading="lazy"`) below the fold via `cover-lazy-loading` / native attributes.
- [ ] Fonts are subset to used character sets/weights, self-hosted where possible, and preloaded if critical to LCP text.
- [ ] JS is code-split per block (webpack multi-entry already does this) — a page never downloads a block's script if that block isn't present on the page.
- [ ] Swiper and GSAP are only enqueued on templates/blocks that actually use them, not globally in `main`/`critical` bundles.
- [ ] No unused CSS is shipped globally — block-specific styles load only when the block is present (verify via `wp-scripts build` per-block `style-*.css` outputs are actually split, not bundled into one global stylesheet).
- [ ] Static assets are served with long-lived `Cache-Control` + cache-busting via filename hash/version query, so repeat visits don't re-download unchanged files.
- [ ] Third-party requests (fonts, analytics, embeds) use `preconnect`/`dns-prefetch` where they're known to be needed early.
- [ ] Total JS/CSS payload per page is tracked over time (bundle-size budget) so a future change doesn't silently regress it.

## 8. JavaScript Bundle & Build

- [ ] `npm run build` output has no dev-only code (source maps, `NODE_ENV=development` branches, React DevTools hooks) in production.
- [ ] Tree-shaking is effective — verify with a bundle analyzer that unused exports from `@wordpress/*` packages and utility modules aren't included wholesale.
- [ ] No block's editor-only code (`index.tsx`, `Edit` components) leaks into the frontend `view`/`render` bundle.
- [ ] Shared dependencies (React, GSAP, Swiper) aren't duplicated across multiple webpack entry chunks — common chunks are extracted.
- [ ] jQuery is confirmed fully deregistered on the front end (per `CLAUDE.md`) with nothing silently re-enqueuing it (check plugin-injected scripts too).

## 9. CSS Performance

- [ ] No deeply nested/overly specific selectors that force expensive style recalculation (keep specificity flat, especially in `nav.scss` given its size).
- [ ] Animations/transitions avoid animating properties that trigger layout (see §5) — same rule applies at the CSS `transition`/`@keyframes` level, not just JS-driven animation.
- [ ] No unused `theme.json`/style-variation CSS custom properties bloating the generated stylesheet (9 alternate color schemes in `styles/` — confirm only the active one's CSS is enqueued, not all nine).
- [ ] `:has()` and other modern selectors (used in the recent `nav.scss` CTA change) are scoped narrowly — broad `:has()` usage can be expensive to recompute on large DOM trees.

## 10. WordPress / PHP Backend Performance

- [ ] No `render.php` for a custom block runs an unbounded/uncached `WP_Query` or `get_posts()` on every page load (e.g. `nav-popular-pages`, `simple-grid` dynamic content) — results are cached via `functions/cache.php` transients with sensible TTLs.
- [ ] Queries that don't need pagination set `no_found_rows => true` to skip the expensive `SQL_CALC_FOUND_ROWS`.
- [ ] No N+1 query pattern (e.g. looping over posts and calling `get_post_meta`/`pll_get_post_language` per iteration without a prime/cache step).
- [ ] Autoloaded options (`wp_options` with `autoload = yes`) are kept lean — no large serialized blobs autoloading on every request.
- [ ] Object caching (if available in prod) is actually leveraged by repeated-lookup code paths (translation resolution, popular-pages counts).
- [ ] Polylang language/translation resolution (`kotlinskidev_resolve_translatable_post()`) doesn't re-query on every call within a single request — memoized per request where hot.
- [ ] `functions.php` module load order doesn't do heavy work (queries, remote calls) at include-time outside of hooks.
- [ ] No hook handler runs on every single request unconditionally when it only applies to specific templates/contexts (guard with `is_*()` checks).

## 11. Caching & Delivery (Infra)

- [ ] Cloudflare cache rules are tuned so static assets are edge-cached and only dynamic HTML hits origin (ties into `docs/monitoring.md` / `docs/522.md` origin-capacity concerns).
- [ ] Page-level caching (if a caching plugin/proxy layer exists) is verified to actually serve cached HTML for anonymous visitors, not bypassed by cookies set unconditionally (consent banner, page-views tracker).
- [ ] Origin PHP-FPM has headroom under load (per `docs/monitoring.md` — 10 idle PHP-FPM version stacks competing for <1GiB RAM was already flagged as a risk factor for responsiveness, not just uptime).

## 12. Accessibility ↔ Performance Overlap

- [ ] Focus management in dynamically-shown panels (mega-menu, search, language-panel) doesn't force a synchronous reflow via `.focus()` calls interleaved with style changes.
- [ ] Skip links / keyboard navigation don't rely on JS that could block/delay on a slow connection — core navigation works before JS finishes loading.
- [ ] Reduced-motion and reduced-data preferences (`prefers-reduced-motion`, `Save-Data` header) are both honored to skip non-essential animation/asset loading for users who opt in.

## 13. Monitoring & Regression Prevention

- [ ] Lighthouse/PageSpeed scores are captured as a baseline and re-checked after significant changes (recent commit history shows lighthouse checks were run — confirm results are recorded somewhere durable, not just a one-off local run).
- [ ] A performance budget (bundle size, LCP/CLS/INP thresholds) is defined so regressions are caught before deploy, not after.
- [ ] Real-user monitoring (if any) or at minimum periodic synthetic checks cover both PL and EN routes, desktop and mobile.
