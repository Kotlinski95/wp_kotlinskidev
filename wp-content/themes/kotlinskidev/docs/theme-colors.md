# Theme Color Manageability

## Assumptions

1. Each color should be manageable.
2. Theme switcher support: an option in the WP editor settings to choose between a `default` (static) mode and a `light/dark mode` switcher. With automatic mode we should be able to set the default color before the visitor changes it, or leave the automatic option to rely on the visitor's system settings for the initial state.
3. Each WP element should ideally have an option to choose a color for light and dark mode (if switching is enabled). If light/dark mode is enabled, we need to manage colors for text, backgrounds, borders, and hover effects separately for each mode.
4. Color manageability should be WordPress FSE compatible, via `theme.json` or other native options — ideally everything manageable through Appearance → Editor → Styles.

---

## Current State Analysis

### How colors are managed today

The color system is split across **five disconnected layers**:

| Layer | Location | What it does |
|---|---|---|
| Palette presets | `theme.json` (`settings.color.palette`) | 13 appearance-named slugs (`primary`, `light-color`, `dark-color`, `white`, `contrast`, `dark-shade`, `transparent-shade`, `*-rgb` triplets) |
| Style variations | `styles/*.json` (9 files) | Swap only the `primary` family; light/dark base colors are identical in every variation |
| Adaptive custom properties | `src/styles/nav.scss:5-13` | `--color-surface` / `--color-text` defined at `:root` (dark defaults), flipped under `body.light-mode` — the *real* dark/light mechanism |
| Gradient tokens | `src/styles/theme-colors.scss` | `--kt-text-gradient` / `--kt-highlight-gradient` flipped per mode, plus the `gradient-text` mixin |
| Pre-paint bootstrap | `functions/theme-setup.php` (`mytheme_inline_theme_switcher_script`) | Inline script sets `.dark-mode`/`.light-mode` on `<html>`/`<body>` from `localStorage` → system preference, plus an inline `<style>` with **hardcoded** `#ffffff`/`#000000` |

The toggle itself is `src/scripts/theme-switcher.ts` (localStorage + `prefers-color-scheme` listener) rendered via the `theme_switcher` shortcode in `functions/theme-switcher.php`, wrapped by the `kotlinskidev/theme-switcher` block.

### Findings vs. the assumptions

**Assumption 1 — each color manageable: NOT MET.**
- 83 hardcoded hex values and ~127 raw `rgba()` calls across `src/styles/` and `src/blocks/*/style.scss` (scrollbars in `global.scss`, `language.scss`, `components.scss`, `accessibility.scss`, `lazy.scss`, …). None are editable without a rebuild.
- The adaptive tokens (`--color-surface`, `--color-text`) live in SCSS, not `theme.json`, so they are invisible to the Styles UI and to block color pickers.
- `foreground-alt` is referenced by several patterns and `.kt-nav-list` but is **not defined** in any palette — a dangling token that silently falls back.

**Assumption 2 — editor-selectable default/auto mode: NOT MET.**
- Behavior is hardcoded: always `localStorage` → system preference. There is no way to force a default mode or disable switching without editing PHP.
- The switcher exists as both a shortcode and a block (`inserter: false`, render.php just echoes the shortcode) — no attributes, nothing configurable.

**Assumption 3 — per-element light/dark colors: PARTIALLY MET, ad hoc.**
- Only text and surface adapt via tokens. Everything else (borders, hovers, header glass background, scrollbars, logo inversion) is handled by ~40 scattered `body.light-mode` / `body.dark-mode` overrides across **16 SCSS files** (`plugins.scss` alone has 18), most with hardcoded `rgba($white, …)` values. Every new component reinvents mode handling.
- Logos/icons rely on `.invert-light` / `.invert-dark` filter hacks.

**Assumption 4 — FSE-native management: PARTIALLY MET.**
- Palette and link/button element styles are in `theme.json` and editable in Styles — but a color picked there is a **single static value**, so anything set via the UI today breaks mode adaptiveness (this is exactly what caused the `transparent-shade` copyrights-link bug: a DB-level Global Styles customization overrode the file).
- The pre-paint inline `<style>` uses `#ffffff`/`#000000`, which don't even match the palette (`#f2f2f2`/`#191919`) — a real flash-of-wrong-color bug on slow loads.

### Why the current architecture can't satisfy the assumptions

The Styles UI stores one static value per color slot. The theme's mode system needs **two values per slot** resolved at runtime by a class toggle. These are incompatible unless the palette entries themselves are mode-aware. That is the core problem this plan solves.

---

## Recommended Architecture

### Core mechanism: semantic tokens + CSS `light-dark()`

Modern CSS provides exactly the missing primitive: `light-dark(lightValue, darkValue)` resolves according to the element's `color-scheme` property — no media query, fully overridable by a class, and **legal inside `theme.json` palette values** (WordPress outputs palette colors verbatim as `--wp--preset--color--{slug}` custom properties).

Browser support: Chrome/Edge 123+, Firefox 120+, Safari 17.5+ (Baseline since mid-2024). A `@supports` fallback keeps today's mechanism for older browsers during transition.

**Step 1 — mode-pair palette entries (UI-editable per mode):**

```json
{ "slug": "surface-light", "color": "#f2f2f2", "name": "Surface · Light mode" },
{ "slug": "surface-dark",  "color": "#191919", "name": "Surface · Dark mode" },
{ "slug": "text-light",    "color": "#191919", "name": "Text · Light mode" },
{ "slug": "text-dark",     "color": "#f2f2f2", "name": "Text · Dark mode" },
{ "slug": "text-muted-light", "color": "#4a4a4a", "name": "Muted Text · Light mode" },
{ "slug": "text-muted-dark",  "color": "#b8b8b8", "name": "Muted Text · Dark mode" },
{ "slug": "border-light",  "color": "#d9d9d9", "name": "Border · Light mode" },
{ "slug": "border-dark",   "color": "#2e2e2e", "name": "Border · Dark mode" }
```

**Step 2 — semantic composite tokens (what content authors actually pick):**

```json
{ "slug": "surface", "color": "light-dark(var(--wp--preset--color--surface-light), var(--wp--preset--color--surface-dark))", "name": "Surface (adaptive)" },
{ "slug": "text", "color": "light-dark(var(--wp--preset--color--text-light), var(--wp--preset--color--text-dark))", "name": "Text (adaptive)" },
{ "slug": "text-muted", "color": "light-dark(var(--wp--preset--color--text-muted-light), var(--wp--preset--color--text-muted-dark))", "name": "Muted Text (adaptive)" },
{ "slug": "border", "color": "light-dark(var(--wp--preset--color--border-light), var(--wp--preset--color--border-dark))", "name": "Border (adaptive)" }
```

**Step 3 — `color-scheme` wiring keyed off the existing body classes** (in `src/styles/theme-colors.scss`):

```scss
:root {
  color-scheme: dark;
}

html.light-mode {
  color-scheme: light;
}

html.dark-mode {
  color-scheme: dark;
}
```

This satisfies every assumption at once:

- **Assumption 1**: every value is a palette entry; the mode-pair entries are plain colors, editable in Appearance → Editor → Styles → Colors → Palette. Changing "Surface · Dark mode" there retunes the whole dark theme with zero code.
- **Assumption 3**: any block's color picker now offers "Text (adaptive)", "Surface (adaptive)", etc. Picking an adaptive preset gives correct colors in *both* modes automatically. Picking a static preset (or custom hex) deliberately opts that element out of adaptiveness — same semantics as today, but now explicit and safe.
- **Assumption 4**: everything flows through `theme.json` / Global Styles. Element defaults (`styles.elements.link.color.text`, headings, buttons) can now reference adaptive presets without breaking the switcher.
- **Bonus**: `color-scheme` also fixes native UI for free — form controls, scrollbars (currently hardcoded `#222`/`#444` dark-only in `global.scss`), and `<select>` dropdowns follow the active mode.

### Why not the alternatives

- **Two style variations (Light/Dark)**: variation choice is stored server-side per site — switching requires a DB write and page reload, cannot follow system preference, and can't be per-visitor. Rejected.
- **`settings.custom` tokens (`--wp--custom--*`)**: no Styles UI exists for custom values, so per-mode colors would remain file-only. Rejected as primary mechanism (fine for non-color knobs).
- **Keeping SCSS-only class overrides**: works but invisible to the editor, unpickable in block color settings, and the cause of today's 16-file sprawl. This is what we're migrating away from.
- **`@media (prefers-color-scheme)`**: forbidden by project rules — the JS switcher must be able to override the system. (`light-dark()` + forced `color-scheme` does not have this problem: the class always wins.)

### Switcher configuration (Assumption 2) — IMPLEMENTED

Configuration lives globally on the existing **Settings → Kotlinski.dev** page (`functions/settings-page.php`), in a "Theme Mode" section:

1. `kotlinskidev_theme_switching_enabled` (checkbox, default on) — when disabled, the theme-switcher block renders nothing and the site locks to the default mode.
2. `kotlinskidev_theme_default_mode` (select: Auto / Light / Dark, default Auto) — initial mode for visitors without a saved preference. Auto = system preference.
3. `kotlinskidev_theme_switcher_config()` in `functions/theme-switcher.php` reads both options (autoloaded — no caching layer needed) and feeds the pre-paint script in `functions/theme-setup.php`, which exposes the config as `window.kotlinskidevTheme` for `theme-switcher.ts`.
4. Precedence at load: `localStorage` (visitor's explicit choice, only while switching is enabled) → `defaultMode` → system preference (only when `defaultMode` is `auto`).

The block itself stays attribute-free; placement in the header part controls *where* the toggle appears, the settings page controls *whether* it appears and the default mode.

---

## Implementation Plan

### Phase 1 — Foundation (no visual change)

1. Add the mode-pair and adaptive composite palette entries to `theme.json` as specified above. Also define **`foreground-alt`** as an alias of `text-muted` — this retroactively fixes the dangling references in existing patterns and `.kt-nav-list`.
2. Add the `color-scheme` wiring to `src/styles/theme-colors.scss` (the natural home — it already owns mode-dependent tokens). Include the fallback bridge:
   ```scss
   :root {
     --color-surface: var(--wp--preset--color--surface);
     --color-text: var(--wp--preset--color--text);
   }

   @supports not (color: light-dark(#000, #fff)) {
     :root {
       --color-surface: var(--wp--preset--color--surface-dark);
       --color-text: var(--wp--preset--color--text-dark);
     }

     body.light-mode {
       --color-surface: var(--wp--preset--color--surface-light);
       --color-text: var(--wp--preset--color--text-light);
     }
   }
   ```
3. Delete the duplicate `--color-surface`/`--color-text` definitions from `src/styles/nav.scss:5-13` and the `html:has(.light-mode)` override in `global.scss` — the bridge above replaces them. All existing consumers (`global.scss`, `scroll.scss`, `mega-menu.scss`, `mobile-footer-menu.scss`) keep working unchanged.
4. Fix the pre-paint inline `<style>` in `functions/theme-setup.php`: replace hardcoded `#ffffff`/`#000000` with the actual palette values (`#f2f2f2`/`#191919`) so the pre-CSS flash matches the final render. (It cannot use `var()` — it must paint before the stylesheet loads — so duplicate the two hex values here only, with a note in the plan that they mirror `surface-light`/`surface-dark`.)

**Verify:** frontend renders identically in both modes; `getComputedStyle(document.body).color` matches previous values; form controls/scrollbars now adapt.

### Phase 2 — Switcher setting (DONE)

1. Registered `kotlinskidev_theme_switching_enabled` + `kotlinskidev_theme_default_mode` options with a "Theme Mode" section on the Settings → Kotlinski.dev page (`functions/settings-page.php`).
2. `kotlinskidev_theme_switcher_config()` in `functions/theme-switcher.php` resolves both options; the block `render.php` skips the toggle markup when switching is disabled.
3. The pre-paint script in `functions/theme-setup.php` consumes the config, exposes `window.kotlinskidevTheme`, and implements the precedence order above; `src/scripts/theme-switcher.ts` respects it (initial mode honors `defaultMode`; the OS-change listener only fires with no stored preference and `defaultMode` = auto); the body-class sync in `src/critical.ts` now mirrors the `documentElement` decision instead of re-deciding from `localStorage`.

**Verify:** changing Default mode on the settings page changes first-paint mode for a fresh visitor (clear `localStorage`); unchecking "Light/dark switching" removes the toggle and locks the site to the default mode; existing visitors' stored preference still wins while switching is enabled.

### Phase 3 — Migration sweep (DONE)

1. All pure color-flip `body.light-mode`/`body.dark-mode` overrides replaced with adaptive tokens across `nav.scss`, `mega-menu.scss`, `search-panel.scss`, `search.scss`, `submenu.scss`, `scroll.scss`, `components.scss`, `mobile-footer-menu.scss`, `plugins.scss`, `language.scss`, `timeline.scss`, `global.scss` (scrollbars), `page.scss`, `mixins.scss`, `accessibility.scss`, and block styles (`gallery-lightbox` via `light-dark()`, `banner-carousel`, `protected-content`). Structural per-mode rules kept (logo/spinner `filter: invert()`, SVG gradient `url()` swaps, per-mode shadow opacity, theme-switcher icon toggles).
2. Alpha composition uses `color-mix(in srgb, var(--color-text|--color-surface) X%, transparent)` — wider browser support than `light-dark()` itself. Surface-relative grays (scrollbars, hover fills) use `color-mix(… X%, var(--color-surface))`.
3. Intentional constants kept hardcoded: overlay scrims (`rgba($black, 0.45)` backdrop dims, lightbox trigger badges), ambient black box-shadows, over-image whites (hero/banner carousel nav), editor-only chrome (dashed placeholders, slide manager UI), `.text-shadow`/`.text-shadow-white` named utilities, the Complianz third-party fixes, and the `#bc0006` flag red.
4. `plugins.scss` — deleted the rule-violating `@media (prefers-color-scheme: dark)` block (redundant: the pre-paint script always sets a mode class); dark-mode form rules now use real tokens instead of dangling presets.
5. Not yet done: `theme.json` `styles.elements` adaptive defaults (body text → `foreground`); retiring `light-color`/`dark-color` aliases in patterns.

**Verify:** visual pass of header/menus/search/footer/timeline in both modes, front + editor.

### Phase 4 — Style variations & editor parity

1. Extend the 9 `styles/*.json` variations with mode-pair overrides where a scheme wants different bases (e.g. `deep-indigo` could use a blue-black `surface-dark`). Variations merge over `theme.json`, so untouched tokens inherit automatically — only add what differs.
2. Editor canvas: the Site Editor iframe has no `.dark-mode` class, so `:root { color-scheme: dark }` makes the canvas preview dark mode — matching the site default. If light-mode previewing is wanted, add a small editor-only style or document toggling via the browser. Note as a known limitation, not a blocker.
3. Documentation: update `.claude/rules/scss.md` guidance — new rule of thumb: *color values in SCSS should be `var(--wp--preset--color--{semantic-slug})`; `body.light-mode`/`body.dark-mode` overrides are only for non-color behavior.*

### Risks & guardrails

- **DB Global Styles overrides beat `theme.json`** (root cause of the earlier `transparent-shade` bug). Before Phase 1 ships, audit Appearance → Editor → Styles for stray user customizations and reset them; afterwards, UI edits are safe because the palette itself is mode-aware.
- **`light-dark()` browser floor** (early-2024 engines): covered by the `@supports` bridge in Phase 1; remove the bridge once analytics justify it.
- **Palette swatch previews**: composite `light-dark(var(…))` entries render as unparseable in some picker swatch previews (they still *work* everywhere). Mitigation: clear `· Light/Dark mode` naming on the editable pairs, adaptive entries named `(adaptive)` so authors know what they're picking.
- **Do not remove the `body.dark-mode`/`body.light-mode` classes** — scripts, `gradient-text` tokens, and third-party overrides depend on them. `color-scheme` wiring is additive.

### Execution order & effort

| Phase | Scope | Risk | Effort |
|---|---|---|---|
| 1 | theme.json + theme-colors.scss + theme-setup.php | Low | Small |
| 2 | theme-switcher block + pre-paint config | Low | Small–Medium |
| 3 | 16 SCSS files, incremental | Medium (visual regressions) | Large, splittable |
| 4 | 9 variation JSONs + docs | Low | Small |

Phases 1–2 deliver all four assumptions functionally; Phase 3 is debt paydown that makes them true everywhere; Phase 4 polishes the variation system.
