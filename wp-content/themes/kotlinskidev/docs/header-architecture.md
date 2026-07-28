# Header Architecture

The header is fully block-editor-manageable — no shortcodes, no classic PHP menu registration. `parts/header.html`: site logo, theme switcher, and navigation, laid out in nested flex groups.

## Navigation resolution — slug-based, not `ref` IDs

`core/navigation` normally stores `{"ref": 123}`, the database primary key of a `wp_navigation` post — an ID that's local to one database and breaks on every new environment. `kotlinskidev/navigation` avoids this entirely: it accepts a human-readable `menuSlug` attribute (e.g. `"desktop-menu"`), looks the post up by slug via `kotlinskidev_resolve_translatable_post()`, and resolves the Polylang-translated version for the current language. Portable across environments, no per-language branching in the template.

Adding a new language means creating a Polylang translation of the existing `wp_navigation` post in the Site Editor — no template, `block.json`, or `render.php` changes.

## Navigation posts in the current header

| Slug | Used with | Role |
|---|---|---|
| `desktop-menu` | `overlayMenu: "never"`, `visibility: "desktop"` | Primary nav, rendered as the desktop mega-menu bar (`displayMode: "mega"`, the block's default) |
| `mobile-menu` | `overlayMenu: "always"`, `visibility: "mobile"` | Hamburger overlay drawer on mobile |
| `mobile-menu` | `overlayMenu: "always"`, `visibility: "desktop"`, `overlaySlide: "left"` | A second hamburger trigger, desktop-visible, opening the same overlay drawer from the left |

`overlayMenu` controls whether the block delegates to `core/navigation`'s built-in overlay drawer (`render.php` early-exits into a plain `render_block()` call with the resolved post as `ref`) or renders the theme's own mega-menu bar. `visibility` maps to `nav-desktop`/`nav-mobile` classes so the same block type can render different content per breakpoint from separate nav posts, without JS media-query duplication.

See `docs/navigation-structure.md` for what actually lives inside the `desktop-menu` mega-menu content (panels, search/language dropdowns, grid layout).

## Theme switcher

`kotlinskidev/theme-switcher` is a plain, attribute-free, non-inserter block placed as a header sibling (not inside navigation). It renders nothing if switching is disabled site-wide (Settings → Kotlinski.dev → Theme Mode — see `docs/theme-colors.md`). The underlying toggle script (`src/scripts/theme-switcher.ts`) and the pre-paint `<head>` script that avoids a flash-of-wrong-theme are unrelated to the navigation block entirely.

## CSS

Header layout styles target `wp:navigation`-derived selectors (`.wp-block-navigation__responsive-container-open`, `.wp-block-navigation__container`, `.is-menu-open`, etc.) in `src/styles/nav.scss` and `src/styles/mega-menu.scss` — there are no leftover selectors from a shortcode-era custom markup structure.
