# Desktop Mega Menu & Hamburger Structure

The main desktop navigation (`kotlinskidev/navigation`, `menuSlug: "desktop-menu"`, default `displayMode: "mega"`) renders as a mega-menu bar: primary top-level items, each opening a full-width dropdown panel; a CTA button; language and search panels as separate utility items outside the primary link list.

## Primary items

Each primary item is a `core/navigation-submenu` whose panel content is a `kotlinskidev/simple-grid` with `kotlinskidev/holder` children:

- **First holder** — a `kotlinskidev/nav-link` acting as the panel's "left rail": the section's main link, styled with the theme's gradient-text treatment.
- **Remaining holders** — each a `core/navigation-submenu`, rendered as a titled link column (column title also gradient-styled). A panel can have as many grouped columns as it has holders; `simple-grid`'s column count derives from the holder count automatically.

This is the same `simple-grid`/`holder` primitive used for the footer's link columns (see `docs/footer-architecture.md`) — one generic grid mechanism reused for both the header mega-panels and the footer.

## Utility items

- **`kotlinskidev/search-panel`** and **`kotlinskidev/nav-language-panel`** sit as top-level siblings alongside the primary dropdown items, each opening its own trigger+modal panel independent of the mega-menu panels.
- **`kotlinskidev/nav-popular-pages`** can be placed inside any panel (e.g. an "Insights"-style dropdown) for a dynamically-sourced list of most-viewed pages instead of manually-maintained links.
- **Social links** (`kotlinskidev/social-section`) can be placed inside a panel's holder the same way, for a social-icons row within a dropdown.

## Hamburger navigation

`kotlinskidev/navigation` with `overlayMenu: "always"` delegates to `core/navigation`'s built-in overlay drawer instead of the mega-menu bar — used both for the mobile menu (`visibility: "mobile"`) and a desktop-visible hamburger trigger (`visibility: "desktop"`, `overlaySlide: "left"`) that opens the same drawer content. The hamburger nav post holds a plain accordion tree (`core/navigation-submenu` + `core/navigation-link`), independent of the mega-menu's grid-panel content — the two navigation posts (`desktop-menu`, `mobile-menu`) are edited separately, so hamburger content doesn't need to mirror every mega-panel detail.

## Gradient styling

Column titles and left-rail links use the theme's `gradient-text` SCSS mixin (`src/styles/theme-colors.scss`), matching the gradient treatment used elsewhere (footer column titles, active-language indicator, etc.).
