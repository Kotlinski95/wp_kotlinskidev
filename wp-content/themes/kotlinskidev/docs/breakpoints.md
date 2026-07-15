# Breakpoints: Replacing the Hardcoded Logic with a Single, Per-Project Source of Truth

> **Status note (2026-07-07): IMPLEMENTED — final design differs from both plans below.**
> Breakpoints are stored in the DB (Settings → Kotlinski.dev → Breakpoints tab), editable per
> project with no rebuild. The compiled CSS's media-query boundaries are rewritten at runtime
> from the DB values and cached. See "As Built: DB-Driven Breakpoints" at the end of this
> document. The Customizer section and `config/breakpoints.json` idea are both retired.

The theme currently defines its responsive breakpoints in **two disconnected places**, and neither one is truly configurable per project without editing source files and rebuilding. This document describes why that's a problem, the hard technical constraint that rules out the "just use a CSS variable everywhere" fix, and a concrete plan to make breakpoints a single value set that a new project built from this theme can configure once, instead of hunting through 20+ SCSS files.

---

## Current State (as it actually is, not as the Customizer UI implies)

**Layer 1 — `functions/breakpoints.php`, Customizer-driven, but narrow in effect.**
```php
$mobile_max = get_theme_mod('mobile_breakpoint', 767);
$tablet_max = get_theme_mod('tablet_breakpoint', 1023);
```
This exposes a real Customizer UI (Appearance → Customize → Responsive Breakpoints) and three helper functions — `kotlinskidev_get_breakpoints()`, `kotlinskidev_get_css_breakpoints()` (returns `@media` query strings), `kotlinskidev_get_js_breakpoints()` — plus a `wp_localize_script` call that exposes `window.kotlinskidevBreakpoints` to the block editor. **But nothing in the theme's compiled CSS actually reads these values.** Today its only real consumer is editor-side JS label text (e.g. the `responsive-display` block's Inspector Control panel, so the "Mobile" option in a dropdown can say "≤767px" instead of a bare word). Changing the Customizer sliders changes what the editor UI *says*, not how anything actually renders on the front end.

**Layer 2 — `src/styles/variables.scss`, static, and genuinely dominant.**
```scss
$breakpoint-large: 75rem;      // 1200px
$breakpoint-desktop: 64rem;    // 1024px
$breakpoint-tablet-wp: 48.875rem; // 782px
$breakpoint-mobile: 48.875rem; // 782px
$desktop: 64rem;               // duplicate of $breakpoint-desktop
$mobile: 48.875rem;            // duplicate of $breakpoint-mobile
```
This is the breakpoint system the theme actually runs on. **23 SCSS files, 50+ `@media` rules** — `nav.scss`, `mega-menu.scss`, `global.scss`, `footer.scss`, `language.scss`, `submenu.scss`, `order.scss`, and more — reference these five constants. They're compiled once by webpack into static `.css` files at `npm run build` time. Changing a breakpoint for a given project today means: edit `variables.scss`, run `npm run build`, redeploy. There's also no single number — `$desktop`/`$breakpoint-desktop` and `$mobile`/`$breakpoint-mobile` are two names for the same value, an accident waiting to drift apart the first time someone edits one and not the other.

**Two things that look like outliers but aren't part of this problem:**
- `admin-bar.scss`'s `601px`/`782px`/`600px` media queries mirror **WordPress core's own fixed admin bar breakpoints** — those are correctly hardcoded; WP core doesn't let you configure them, so the theme shouldn't pretend otherwise.
- `components.scss`'s `37.5rem` (600px) media queries are inside Complianz GDPR cookie-banner override selectors (`#cmplz-cookies-overview`, `#cmplz-document`) — mirroring **that plugin's own internal breakpoint**, not this theme's. Also correctly independent.

So the real gap is narrower than "50 inconsistent breakpoints": it's **one dominant, static, per-build system (Layer 2)** and **one newer, dynamic-but-cosmetic system (Layer 1)** that don't talk to each other, plus a small config drift within Layer 2 itself (`$desktop` vs `$breakpoint-desktop`).

---

## The Hard Constraint

CSS media query conditions cannot reference a custom property:

```css
/* This is not valid CSS and never will be — @media conditions must be literal values */
@media (max-width: var(--mobile-breakpoint)) { ... }
```

This is why "just expose one CSS variable and reference it everywhere" doesn't solve the underlying problem. A breakpoint boundary has to be a concrete number **at the moment the stylesheet is parsed** — which means it has to be baked in either:
- **at build time** (webpack/Sass compiles the literal value into the `.css` file), or
- **at request time** (PHP prints a `<style>` block containing the literal value, generated per request from a live source like a Customizer setting).

There's no third option that's both a single reusable token and dynamically swappable without one of those two steps. This is exactly the tension already visible between Layer 1 (request-time, but currently only feeds JS strings, not real CSS) and Layer 2 (build-time, and the thing that actually renders).

---

## Proposed Architecture: One Config, Two Legitimate Consumers

Rather than force everything onto one mechanism, split by what each breakpoint use case actually needs:

**Bucket 1 — Structural layout CSS (the existing 50+ `@media` rules in `nav.scss`, `mega-menu.scss`, `global.scss`, etc.)**
This doesn't need to change *without a rebuild* — nobody expects a footer's column layout to change live as an admin drags a slider mid-session. It needs to be **configurable once per project, at setup time**, without hand-editing five scattered/duplicated SCSS constants. → **Build-time propagation from one config file (Option A below).**

**Bucket 2 — Editor-driven, block-level responsive controls** (the `responsiveDisplay` attribute system already used by `kotlinskidev/navigation`'s desktop/mobile split, and the `mobileColumns` control proposed in [footer-migration-plan.md](./footer-migration-plan.md) for `kotlinskidev/simple-grid`)
This is inherently about a content editor changing behavior through wp-admin and expecting to see it reflected without anyone running `npm run build`. → **Request-time PHP-generated CSS, already the direction footer-migration-plan.md took (Option B below), extended to be the norm for anything new in this category.**

Both buckets should read from **the same single numeric source** so "mobile" means the same pixel value everywhere in a given project, regardless of which bucket a given style rule falls into.

---

## The Single Source of Truth

Promote `functions/breakpoints.php`'s existing `kotlinskidev_get_breakpoints()` from "defaults used only for Customizer sliders" to the one canonical definition, and eliminate the `$desktop`/`$breakpoint-desktop` duplication in `variables.scss` at the same time:

```php
function kotlinskidev_get_breakpoints(): array {
    return [
        'mobile_max'  => get_theme_mod('mobile_breakpoint', 767),
        'tablet_max'  => get_theme_mod('tablet_breakpoint', 1023),
        'desktop_min' => get_theme_mod('tablet_breakpoint', 1023) + 1,
    ];
}
```

This already exists and is already per-project in the sense that matters most for a WordPress theme: `get_theme_mod()` values live in that site's own `wp_options` row, so every project built from this theme already gets independent values automatically, no code fork required — **the only thing missing is a path from this function into Bucket 1's compiled CSS.**

---

## Option A — Build-Time Propagation (recommended default for Bucket 1)

Add a small pre-build script that reads breakpoint values from one shared config and writes them into a generated SCSS partial, replacing the hand-typed constants in `variables.scss`:

**`config/breakpoints.json`** (new, at theme root — a plain per-project config file, not requiring a WordPress bootstrap to read, so both PHP and Node can consume it):
```json
{
  "mobileMax": 767,
  "tabletMax": 1023
}
```

**`functions/breakpoints.php`** reads defaults from this file instead of inlining `767`/`1023` as PHP literals, so there's truly one number set:
```php
function kotlinskidev_get_breakpoint_defaults(): array {
    $config = get_template_directory() . '/config/breakpoints.json';
    $data = file_exists($config) ? json_decode(file_get_contents($config), true) : [];
    return [
        'mobile_max' => $data['mobileMax'] ?? 767,
        'tablet_max' => $data['tabletMax'] ?? 1023,
    ];
}
```

**`bin/generate-breakpoints-scss.js`** (new) reads the same JSON and writes `src/styles/_breakpoints-generated.scss`:
```js
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config/breakpoints.json', 'utf8'));
const px = (n) => `${n / 16}rem`; // matches the theme's existing rem convention

fs.writeFileSync('src/styles/_breakpoints-generated.scss', `// Auto-generated from config/breakpoints.json — do not edit directly
$breakpoint-mobile: ${px(config.mobileMax + 1)};
$breakpoint-tablet-wp: ${px(config.mobileMax + 1)};
$breakpoint-desktop: ${px(config.tabletMax + 1)};
`);
```

**`variables.scss`** drops the hardcoded literals and imports the generated partial instead:
```scss
@import "breakpoints-generated";
// $breakpoint-large, $page-large, colors, etc. stay here — only breakpoints move
```

**`package.json`** runs the generator before every build/watch:
```json
"prebuild": "node bin/generate-breakpoints-scss.js",
"build": "npm run prebuild && wp-scripts build",
"prestart": "node bin/generate-breakpoints-scss.js",
"start": "npm run prestart && wp-scripts start"
```

**Result:** setting up a new project means editing one JSON file and running `npm run build` once — not hunting through `nav.scss`, `mega-menu.scss`, `global.scss`, `footer.scss`, and 19 other files for `$breakpoint-desktop`. The 50+ existing `@media ($breakpoint-desktop...)` call sites in those files **do not change at all** — they keep referencing the same SCSS variable names, which now originate from one generated, project-configurable source instead of hand-typed duplicated literals.

This also kills the `$desktop`/`$breakpoint-desktop` duplication as a side effect: the generated partial defines each concept once, and a follow-up pass can `grep -rl '\$desktop\b\|\$mobile\b' src/styles/` to alias the remaining call sites onto the canonical names before deleting the duplicates from `variables.scss`.

---

## Option B — Request-Time PHP-Generated CSS (for Bucket 2, and anything that must be live)

Already the direction taken for the footer's `simple-grid` mobile-column reflow and the existing `responsiveDisplay` attribute's utility classes (`kotlinskiwind.scss`'s `mobile:`/`tablet:`/`desktop:` prefixed classes) *could* move here too, if true zero-rebuild live-editing of those specific breakpoints becomes a requirement:

```php
function kotlinskidev_print_dynamic_breakpoint_css() {
    $bp = kotlinskidev_get_css_breakpoints(); // already exists, already reads get_theme_mod()
    $css = "
        {$bp['mobile']} { .kt-simple-grid { grid-template-columns: repeat(var(--kt-sg-cols-mobile, 1), 1fr); } }
    ";
    wp_add_inline_style('kotlinskidev-main-style', $css);
}
add_action('wp_enqueue_scripts', 'kotlinskidev_print_dynamic_breakpoint_css');
```

**Don't use this for Bucket 1's existing 50+ rules.** Moving all of them to request-time inline CSS would mean: no browser/CDN caching of that CSS (it's regenerated and inlined on every response instead of shipped as a versioned static file), a larger `<head>` payload on every page, and a much bigger, riskier migration for zero practical benefit — nobody needs `nav.scss`'s desktop/mobile switch to update without a page reload, let alone without a deploy. Reserve Option B for controls that are genuinely edited through wp-admin by a non-developer and expected to take effect immediately (exactly the `simple-grid`/`responsiveDisplay` case).

---

## Implementation Order

1. **Create `config/breakpoints.json`** with today's defaults (767/1023) so behavior is identical before/after — this step should be a no-op change to any rendered page.
2. **Update `functions/breakpoints.php`** to read defaults from the config file instead of inlining `767`/`1023`, keeping `get_theme_mod()` as the per-request override (Customizer still wins if an admin has changed it — the JSON file only sets the *default* a fresh install starts from).
3. **Write `bin/generate-breakpoints-scss.js`** and wire it into `prebuild`/`prestart` in `package.json`.
4. **Replace `variables.scss`'s hardcoded breakpoint constants** with the `@import "breakpoints-generated"`. Do not touch `$breakpoint-large`, `$page-large`, colors, or sizes — only the breakpoint block moves.
5. **Alias and delete the `$desktop`/`$mobile` duplicate variable names** — grep every call site, repoint to `$breakpoint-desktop`/`$breakpoint-mobile`, delete the duplicates from the generated partial's consumers.
6. **`npm run build`, diff the compiled CSS output** against the pre-change build — should be byte-identical except for whitespace/comments, since the default values haven't changed yet.
7. **Test changing `config/breakpoints.json`** to a different value, rebuild, confirm the new breakpoint takes effect across a sample of the 23 affected files (nav collapse, mega-menu, footer stack).
8. **Leave Bucket 2 (Option B) as-is / apply it going forward** for new editor-driven controls (e.g. the footer `mobileColumns` work) — no migration of existing static CSS required.

---

## Testing Checklist

- [ ] Fresh `npm run build` with unchanged `config/breakpoints.json` produces CSS equivalent to the current build (no visual regression)
- [ ] Changing `mobileMax` in `config/breakpoints.json` and rebuilding shifts the actual breakpoint in at least one already-affected file (e.g. `nav.scss`'s hamburger/desktop-nav switch) — confirms the generated partial is actually being consumed, not shadowed by a stale cached build
- [ ] Customizer's `mobile_breakpoint`/`tablet_breakpoint` sliders still work for whatever they currently affect (JS editor labels, any Bucket 2 PHP-generated CSS) and correctly override the JSON default per-install
- [ ] `admin-bar.scss` and the Complianz-specific rules in `components.scss` are untouched — confirm they weren't accidentally swept into the generated-variable migration
- [ ] No remaining references to the duplicate `$desktop`/`$mobile` variable names after cleanup (`grep -rn '\$desktop\b\|\$mobile\b' src/styles/` returns nothing outside the generated partial itself)

---

## Gotchas

**The generated SCSS partial must be committed to `.gitignore`, not to git** — it's derived output from `config/breakpoints.json`, same category as `build/`. Regenerate it in CI/deploy via `npm run build`'s `prebuild` step, never hand-edit it.

**`get_theme_mod()` must keep winning over the JSON default at runtime** — the JSON file sets what a *fresh* install starts with; an admin who's already moved the Customizer sliders on a live site shouldn't see their setting silently reset because someone edited the config file for an unrelated reason. Bucket 1's build-time value and Bucket 2's request-time value can therefore diverge if an admin changes the Customizer *after* the last build — document this clearly as expected (Bucket 1 needs a rebuild to pick up a genuinely new project-wide breakpoint; Bucket 2 reflects Customizer changes immediately). Don't try to make Bucket 1 read `get_theme_mod()` too — that's exactly the "media query can't use a runtime value without a request-time PHP step" constraint this whole document exists to work around.

**Don't fold `admin-bar.scss` or the Complianz-specific breakpoints in `components.scss` into this system** — they're correctly independent (WordPress core and a third-party plugin's own fixed breakpoints, respectively), not something a project should be "configuring."

**Rem conversion assumption** — the generator script's `px / 16` conversion assumes the theme's root font-size is the browser default `16px`. Confirm this against `theme.json`'s `settings.typography` / any root `font-size` override in `global.scss` before trusting the generated rem values to match the intended pixel breakpoints exactly.

---

## Revision: Full Audit + Settings-Page Direction (2026-07-07)

### Complete inventory of breakpoint consumers (audited)

**The values that actually render (SCSS, 782 / 1024 / 1200):**

| Source | Values | Consumers |
|---|---|---|
| `variables.scss` `$breakpoint-*` | mobile/tablet-wp = 48.875rem (782), desktop = 64rem (1024), large = 75rem (1200) | ~50 `@media` rules in 23 files, incl. the visibility utilities (`mobile-only`, `hide-desktop`, …) and **all `kotlinskiwind.scss` `mobile:`/`tablet:`/`desktop:` prefixed utilities** |
| `variables.scss` `$mobile`/`$desktop` aliases | duplicates of the above | `above-the-fold.scss` (2), `editor-overrides.scss` (2) — drift hazard |

**The values that only *claim* to render (Customizer theme mods, 767 / 1023):**

| Source | Values | Consumers |
|---|---|---|
| `get_theme_mod('mobile_breakpoint', 767)` / `('tablet_breakpoint', 1023)` | 767 / 1023 | Editor label text in `responsive-order`/`responsive-display` inspectors (via `kotlinskidevBreakpoints` localization); `kotlinskiTheme.mobileBreakpoint` (767) read by `gallery-lightbox/init.ts` |

Key audit finding: **`functions/responsive-display.php` does not generate breakpoint CSS at all** — it maps
`responsiveDisplay` attributes to `kotlinskiwind.scss` prefixed classes, which are compiled from the SCSS
variables. So the doc's original "Bucket 2 = request-time" framing overstated the Customizer's role: the
theme mods drive **zero** rendered CSS. They only affect editor labels and one JS constant — and both
disagree with the real CSS boundaries (767/1023 vs 782/1024). Concrete live bug: at 775px viewport,
`mobile-only` (CSS, <782) shows an element while `gallery-lightbox` JS (767) has already switched to
non-mobile behavior.

**Hardcoded stragglers in TypeScript (all disagreeing with each other):**

- `src/scripts/utils.ts` → `MOBILE_BREAKPOINT = 1024` (named "mobile", value is the desktop boundary)
- `src/scripts/common.ts` → `width < 1024 → "tablet"`
- `src/blocks/gallery-lightbox/init.ts` → `window.kotlinskiTheme?.mobileBreakpoint ?? 767`
- `src/blocks/responsive-order/index.tsx` + `responsive-display/index.tsx` → fallback objects `767/1023/1024`

**Hardcoded stragglers in SCSS (project styles that should use the variables):**

- `search.scss` → two `@media (max-width: 40rem)` rules
- `timeline.scss` → `@media (max-width: 48rem)`

**Correctly independent (do not migrate):** `admin-bar.scss` (WP core's own 600/601/782 admin-bar
breakpoints) and the Complianz `37.5rem` rules in `components.scss` (third-party widget's breakpoint).

### As Built: DB-Driven Breakpoints (implemented 2026-07-07)

The requirement changed during review: breakpoints must be **editable per project in the DB**
(no repo edit, no rebuild), and remain readable by plugins that consume the theme's breakpoint
values. Final architecture:

**Storage + UI** — three options with build-matching defaults, managed on the
Settings → Kotlinski.dev page, which is now tabbed (`General | Theme Mode | Breakpoints`):

- `kotlinskidev_breakpoint_mobile_max` (default 781)
- `kotlinskidev_breakpoint_tablet_max` (default 1023)
- `kotlinskidev_breakpoint_large` (default 1200)

`kotlinskidev_get_breakpoints()` reads these (statically cached, cross-field clamped) and is
the only PHP API. The Customizer section is deleted.

**Plugin compatibility bridge** — `theme_mod_mobile_breakpoint` / `theme_mod_tablet_breakpoint`
filters return the option values, so any plugin calling `get_theme_mod('mobile_breakpoint', …)`
transparently receives the settings-page values (their own fallback defaults never apply).

**CSS pipeline (the core trick)** — the build still compiles the SCSS defaults
(48.875rem / 48.8125rem / 64rem / 63.9375rem / 75rem / 74.9375rem). At runtime, when the DB
values differ from the defaults, `kotlinskidev_transform_breakpoint_css()` rewrites those exact
tokens **inside `@media` preludes only** (regex + digit lookbehind, so `3.64rem` widths and the
px-based admin-bar/Complianz rules are untouched). Serving paths, all cached:

1. **Inlined critical.css** — transformed before caching; transient key includes a breakpoints
   hash, so changes take effect immediately and the default state is byte-identical to stock.
2. **Enqueued build CSS** (`main.css`, editor.css, block styles) — `style_loader_src` swaps the
   URL to a transformed copy in `uploads/kotlinskidev-css/{name}-{hash}-{filemtime}.css`,
   generated on first request.
3. **WP-inlined small block styles** (e.g. `style-simple-grid.css`, which WordPress prints
   inline from the registered `path`, bypassing `style_loader_src`) — a late
   `wp_enqueue_scripts` hook rewrites each registered style's `extra['path']` to the
   transformed copy before `wp_maybe_inline_styles()` runs.
4. **Editor canvas styles** (`add_editor_style` CSS) — transformed via
   `block_editor_settings_all`.

Cache invalidation: transformed files are name-keyed by breakpoints hash + build filemtime
(never stale); an `update_option_*` hook deletes old copies. When the DB values equal the
defaults, every path short-circuits and stock files are served untouched.

**JS consumers unified** — `kotlinskiTheme.breakpoints` (frontend localization) and
`kotlinskidevBreakpoints` (editor) both come from `kotlinskidev_get_breakpoints()`.
`utils.ts` exposes `getBreakpoints()`; `isMobile()` uses `desktop_min`; `common.ts`
`getDeviceType()` and `gallery-lightbox/init.ts` read the same source; the
`responsive-order`/`responsive-display` fallbacks now match the real defaults (781/1023/1024
— previously three scripts disagreed: 767 vs 1024 vs 479).

**Verified end-to-end**: default state serves stock files (no-op); setting mobile max to 700
rewrote all inline + enqueued + WP-inlined boundaries to 43.75rem/43.8125rem and swapped
`main.css` to the cached transformed copy; resetting restored stock serving and flushed the
cache directory.

**Known limits**
- `search.scss` (40rem) and `timeline.scss` (48rem) still hardcode their own values — they
  don't use the canonical variables, so the transformer deliberately ignores things it doesn't
  recognize. Fix by migrating them to `$breakpoint-*` variables.
- The SCSS defaults in `variables.scss` and `KOTLINSKIDEV_BREAKPOINT_BUILD_TOKENS` in
  `functions/breakpoints.php` must stay in sync — if a default in `variables.scss` ever
  changes, the token map (and its epsilon variants) must be updated to match the new compiled
  literals.
- Page-cache plugins caching full HTML will keep serving the old inlined critical CSS until
  their cache is purged after a breakpoint change.
