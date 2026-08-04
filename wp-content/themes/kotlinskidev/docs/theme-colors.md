# Theme Color System

Colors are managed through semantic, mode-aware `theme.json` palette tokens, editable in Appearance → Editor → Styles → Colors → Palette — no rebuild needed to change a color in either mode.

## Adaptive palette tokens

`theme.json`'s palette defines mode-pair entries (a plain color per mode) and composite adaptive entries built from them via CSS `light-dark()`:

**Mode-pair entries (editable per mode):** `surface-light` / `surface-dark`, `foreground-light` / `foreground-dark`, `foreground-alt-light` / `foreground-alt-dark`, `divider-light` / `divider-dark`.

**Composite adaptive entries (what content authors pick):** `surface`, `foreground`, `foreground-alt`, `foreground-contrast`, `divider` — each defined as `light-dark(var(--wp--preset--color--{x}-light), var(--wp--preset--color--{x}-dark))`. Picking one of these in any block's color picker gives correct colors in both modes automatically; picking a static preset or custom hex opts that element out of adaptiveness deliberately.

`color-scheme` is wired to the existing mode-toggle classes in `src/styles/theme-colors.scss`: `:root` defaults to `dark`, `html.light-mode`/`html.dark-mode` (and the editor-canvas equivalents) set it explicitly. A `@supports not (color: light-dark(...))` bridge keeps `--color-surface`/`--color-text` working via the same `body.light-mode` class toggle for older browsers.

## Theme Mode switcher settings

Configuration lives on **Settings → Kotlinski.dev → Theme Mode**:

1. `kotlinskidev_theme_switching_enabled` (checkbox, default on) — when disabled, the theme-switcher block renders nothing and the site locks to the default mode.
2. `kotlinskidev_theme_default_mode` (select: Auto / Light / Dark, default Auto) — initial mode for visitors without a saved preference.
3. `kotlinskidev_theme_switcher_config()` (`functions/theme-switcher.php`) reads both options and feeds the pre-paint script in `functions/theme-setup.php`, exposed as `window.kotlinskidevTheme` for `theme-switcher.ts`.
4. Precedence at load: `localStorage` (visitor's explicit choice, only while switching is enabled) → `defaultMode` → system preference (only when `defaultMode` is `auto`).

The `kotlinskidev/theme-switcher` block itself is attribute-free — placement in the header controls *where* the toggle appears; the settings page controls *whether* it appears and the default mode.

## SCSS migration

Pure color-flip `body.light-mode`/`body.dark-mode` overrides across the theme's SCSS were replaced with the adaptive tokens above (`nav.scss`, `mega-menu.scss`, `search-panel.scss`, `search.scss`, `submenu.scss`, `scroll.scss`, `components.scss`, `mobile-footer-menu.scss`, `plugins.scss`, `language.scss`, `timeline.scss`, `global.scss`, `page.scss`, `mixins.scss`, `accessibility.scss`, and several block styles). Structural per-mode rules were kept where the difference isn't a color (logo/spinner `filter: invert()`, SVG gradient `url()` swaps, per-mode shadow opacity, theme-switcher icon toggles).

Alpha composition uses `color-mix(in srgb, var(--color-text|--color-surface) X%, transparent)` for wider browser support than `light-dark()` alone; surface-relative grays use `color-mix(… X%, var(--color-surface))`.

Intentionally still hardcoded (not color-mode concerns): overlay scrims (backdrop dims, lightbox trigger badges), ambient black box-shadows, over-image whites (hero/banner carousel nav), editor-only chrome (dashed placeholders, slide manager UI), the `.text-shadow`/`.text-shadow-white` utilities, Complianz third-party fixes, and the `#bc0006` flag red.

## Current scope

Each of the 9 style variations in `styles/*.json` currently reuses the same light/dark mode-pair base tokens as the default palette — only the `primary` accent family differs per scheme. `theme.json`'s `styles.elements` defaults and the `light-color`/`dark-color` legacy aliases still exist alongside the newer adaptive tokens for backward compatibility with older patterns/blocks.

**Do not remove** the `body.dark-mode`/`body.light-mode` classes — scripts, `gradient-text` tokens, and third-party overrides still depend on them; `color-scheme` wiring is additive on top, not a replacement.
