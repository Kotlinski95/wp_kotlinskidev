# kotlinskidev

Custom WordPress Full Site Editing (FSE) block theme powering [kotlinski.dev](https://kotlinski.dev). Built with TypeScript, React, SCSS. Features 10 custom Gutenberg blocks, 56 reusable block patterns, multilingual support, and a dark/light theme switcher.

---

## Requirements

- WordPress 6.4+
- PHP 8.0+
- Node.js (see `.nvmrc` for pinned version)
- Local WordPress environment (e.g. [LocalWP](https://localwp.com/))

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development watch mode
npm run start

# Production build
npm run build
```

> `npm run build` runs two steps: Webpack (JS/TS blocks + scripts) and Tailwind CSS minification. Both are required — do not use `wp-scripts build` directly.

---

## Development

```bash
npm run start          # Watch mode — JS, TS, SCSS
npm run build          # Production build (Webpack)
npm run prettier       # Format all src/**
npm run lint:js        # ESLint
npm run lint:css       # Stylelint
npm run test:unit      # Jest unit tests
npm run test:e2e       # End-to-end tests
```

---

## Project Structure

```
├── .claude/           Claude Code project rules
├── assets/            Fonts, icons, static images (WebP)
├── build/             Compiled output — do not edit manually, not committed
├── functions/         PHP feature modules (one concern per file)
├── includes/          Supplementary PHP (i18n, parallax, hover)
├── languages/         Translation files (en_US, pl_PL)
├── parts/             FSE template parts (header, footer)
├── patterns/          56 reusable block patterns (PHP)
├── polylang/          Multilingual routing config
├── src/
│   ├── blocks/        10 custom Gutenberg blocks (TypeScript + React)
│   ├── scripts/       Frontend TypeScript modules
│   ├── styles/        SCSS source files
│   └── utils/         Shared TypeScript utilities (@utils alias)
├── styles/            Alternate theme.json colour scheme variants
├── templates/         FSE block templates (HTML)
├── functions.php      Main entry — module loader
├── theme.json         Global styles, colour palette, typography, layout
└── webpack.config.js  Extends @wordpress/scripts defaults
```

---

## Custom Blocks

All blocks are registered under the `kotlinskidev/` namespace and live in `src/blocks/`.

| Block | Description |
|---|---|
| `animated-counter` | Number counter with scroll-triggered animation |
| `banner-carousel` | Full-width banner slider powered by Swiper.js |
| `cover-lazy-loading` | Cover block with native lazy loading |
| `gallery-lightbox` | Image/video gallery with lightbox and mobile media variant |
| `hover-animation-controls` | Per-block hover effect configurator |
| `parallax` | Parallax scrolling section |
| `protected-content` | Password-gated content block |
| `responsive-display` | Show/hide blocks per breakpoint |
| `responsive-order` | Reorder blocks per breakpoint |
| `scroll-animations` | Intersection Observer–based entrance animations |

---

## Block Patterns

56 PHP patterns in `patterns/` covering page sections (hero, about, services, CTA, testimonials, FAQ, pricing, timeline, contact), blog layouts, navigation, and dynamic content grids. Patterns use only `theme.json` design tokens — no hardcoded values.

---

## FSE Templates

| Template | Slug |
|---|---|
| Homepage | `index` |
| Page | `page` |
| Single Article | `article` |
| Article Archive | `articles` |
| Category Archive | `category` |
| Tag Archive | `tag` |
| Search Results | `search` |
| Blank | `blank` |
| Blank with Header/Footer | `blank-with-header-footer` |

---

## Colour Schemes

The default palette (purple `#8209d3`) is defined in `theme.json`. Nine alternate schemes are available in `styles/` and can be activated from **Appearance → Editor → Styles**:

`blue` · `cyber-cyan` · `deep-indigo` · `emerald-forest` · `golden-amber` · `green` · `ocean-teal` · `rose-pink` · `sunset-orange`

---

## Multilingual

The theme uses [Polylang](https://polylang.pro/) for PL/EN support. Language-specific template parts and pattern variants are suffixed `-pl`. String translations live in `languages/`.

---

## Architecture Notes

- **PHP modules** follow a single-responsibility pattern. `functions/cache.php` must be the first module loaded — it provides transient helpers used by all subsequent modules.
- **jQuery** is intentionally deregistered on the front end. Frontend scripts use vanilla TypeScript.
- **Webpack** extends `@wordpress/scripts` defaults with custom entry points (`main`, `critical`, `editor`, block-specific bundles) and path aliases (`@utils`, `@node_modules`).
- **Dark/light mode** is toggled via `body.dark-mode` / `body.light-mode` classes set from `localStorage` before first paint to avoid flash.

---

## Deployment

`build/` is excluded from version control. Before deploying:

1. Run `npm run build`
2. Ensure `build/` is included in the deploy artefact

The deploy pipeline is configured via GitHub Actions (`.github/workflows/`).
