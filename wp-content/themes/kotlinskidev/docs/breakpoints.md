# Breakpoints: DB-Driven Single Source of Truth

Breakpoints are stored in the database (Settings → Kotlinski.dev → Breakpoints tab) and editable per project with no rebuild. The compiled CSS's media-query boundaries are rewritten at runtime from the DB values and cached.

## Storage + UI

Three options, with build-matching defaults, managed on the tabbed Settings → Kotlinski.dev page (`General | Theme Mode | Breakpoints`):

- `kotlinskidev_breakpoint_mobile_max` (default 781)
- `kotlinskidev_breakpoint_tablet_max` (default 1023)
- `kotlinskidev_breakpoint_large` (default 1200)

`kotlinskidev_get_breakpoints()` (`functions/breakpoints.php`) reads these (statically cached, cross-field clamped) and is the only PHP API. There is no Customizer section — breakpoints are settings-page-only.

## Plugin compatibility bridge

`theme_mod_mobile_breakpoint` / `theme_mod_tablet_breakpoint` filters return the option values, so any plugin calling `get_theme_mod('mobile_breakpoint', …)` transparently receives the settings-page values (their own fallback defaults never apply).

## CSS pipeline

The build still compiles the SCSS defaults (48.875rem / 48.8125rem / 64rem / 63.9375rem / 75rem / 74.9375rem). At runtime, when the DB values differ from the defaults, `kotlinskidev_transform_breakpoint_css()` rewrites those exact tokens **inside `@media` preludes only** (regex + digit lookbehind, so `3.64rem` widths and the px-based admin-bar/Complianz rules are untouched). Serving paths, all cached:

1. **Inlined critical.css** — transformed before caching; transient key includes a breakpoints hash, so changes take effect immediately and the default state is byte-identical to stock.
2. **Enqueued build CSS** (`main.css`, editor.css, block styles) — `style_loader_src` swaps the URL to a transformed copy in `uploads/kotlinskidev-css/{name}-{hash}-{filemtime}.css`, generated on first request.
3. **WP-inlined small block styles** (e.g. `style-simple-grid.css`, which WordPress prints inline from the registered `path`, bypassing `style_loader_src`) — a late `wp_enqueue_scripts` hook rewrites each registered style's `extra['path']` to the transformed copy before `wp_maybe_inline_styles()` runs.
4. **Editor canvas styles** (`add_editor_style` CSS) — transformed via `block_editor_settings_all`.

Cache invalidation: transformed files are name-keyed by breakpoints hash + build filemtime (never stale); an `update_option_*` hook deletes old copies. When the DB values equal the defaults, every path short-circuits and stock files are served untouched.

## JS consumers

`kotlinskiTheme.breakpoints` (frontend localization) and `kotlinskidevBreakpoints` (editor) both come from `kotlinskidev_get_breakpoints()`. `utils.ts` exposes `getBreakpoints()`; `isMobile()` uses `desktop_min`; `common.ts` `getDeviceType()` and `gallery-lightbox/init.ts` read the same source; the `responsive-order`/`responsive-display` fallbacks match the real defaults (781/1023/1024).

## Known limits

- `search.scss` (40rem) and `timeline.scss` (48rem) still hardcode their own values — they don't use the canonical variables, so the transformer deliberately ignores things it doesn't recognize.
- The SCSS defaults in `variables.scss` and `KOTLINSKIDEV_BREAKPOINT_BUILD_TOKENS` in `functions/breakpoints.php` must stay in sync — if a default in `variables.scss` ever changes, the token map (and its epsilon variants) must be updated to match the new compiled literals.
- Page-cache plugins caching full HTML will keep serving the old inlined critical CSS until their cache is purged after a breakpoint change.
