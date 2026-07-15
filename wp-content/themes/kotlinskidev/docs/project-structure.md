# Project Structure

Plan the project structure for kotlinskidev theme.

Assumptions:

1. Theme should be fully manageable in wordpress FSE.
2. Theme should support Typescript/ SCSS, but the build folder should be replaced with proper folders that wordpress use, to provide best performance optimization and following wordpress best practices (we might need to adjust tsconfig.json to product proper build state, best for wordpress, like .css files inside assets folder, same js. ,etc. following wordpress best practices for FSE edit).
3. Hardcoding colors/styles should be revaluated, whenever it's possible we should use wordpress .json files, like theme.json to focus on managability part.

---

## Structure Analysis & Feedback (2026-07-05)

Audit of the current theme against the three assumptions above. The theme is a valid `theme.json` v3 block theme (`templates/`, `parts/`, `patterns/`, `styles/` all present), but it carries significant classic-theme residue and three parallel styling systems. Below is what needs to change, grouped per assumption.

### Assumption 1 — "Fully manageable in WordPress FSE"

**Current state: hybrid theme, not fully FSE.** Classic PHP template files coexist with block templates and several classic-era APIs are still active.

Required changes:

1. **Remove classic template files at theme root.** `index.php`, `page.php`, `single.php`, `content.php`, `header.php`, `footer.php`, `404.php`, `page-search.php`, and `template-parts/mobile-footer-menu.php` are dead weight — WordPress resolves all routes to `templates/*.html` when a block theme has them. `index.php` even renders its own `<body>` and calls `get_template_part('nav')`, which would produce broken markup if it ever executed. Each file must be verified as unused before deletion (`page-search.php` looks like a registered page template — confirm no page is assigned to it).
2. **Add a `templates/404.html` block template.** Currently 404 handling falls through to the classic `404.php`. A fully-FSE theme needs the 404 as a block template so it is editable in the Site Editor (there is already a `patterns/template-404.php` to slot in).
3. **Migrate Customizer usage to FSE-native equivalents.** `functions/customizer.php` and `get_theme_mod('mobile_breakpoint')` belong to the classic paradigm. Options should move to `theme.json` `settings.custom`, block attributes, or a plain settings page (`functions/settings-page.php` already exists — consolidate there).
4. **Re-evaluate `functions/menus.php` (classic `register_nav_menus`).** Block themes use `wp_navigation` posts; the theme already has custom navigation blocks and `polylang-navigation.php`. Classic menu locations should be removed once nothing consumes them.
5. **Language-variant duplication (`parts/footer-pl.html`, `patterns/*-pl`)** works but every edit must be done twice. Long-term: one part with translatable strings via Polylang string translations, or pattern-level `pll_` filtering, instead of file forks.
6. **`functions.php` is a 40-item flat `require_once` list.** Group `functions/` into subdirectories by concern (`setup/`, `blocks/`, `performance/`, `integrations/`, `admin/`) and load with a small ordered loader. Also merge `includes/` (only 3 files: `i18n.php`, `parallax-frontend.php`, `hover-animations.php`) into `functions/` — the two-directory split has no rule behind it.
7. **Duplicate header patterns** (`patterns/header.php` and `patterns/header-default.php`) alongside `parts/header.html` — decide which is canonical and delete the rest.
8. `500.html` / `offline.html` (PWA artifacts, ~600 lines each) should move under `assets/` or be generated, not sit at theme root next to templates.

### Assumption 2 — "Replace build folder with proper WordPress folders"

**Context on the assumption:** `build/` is the `@wordpress/scripts` default and what most block themes ship with; the things that must survive any relocation are the `*.asset.php` dependency/version files and the compiled-`block.json` directory layout. The output location itself is just webpack configuration — it can be pointed at `assets/` safely (see the migration section below). Note: `tsconfig.json` does not control output location — webpack does; no tsconfig change is needed.

What actually needs fixing in the build pipeline:

1. **Blocks are registered from `src/`, not `build/`.** `functions/blocks.php` calls `register_block_type( .../src/blocks/... )`, meaning WordPress reads `block.json` from source and the compiled assets in `build/blocks/` are wired up inconsistently. Standard setup: let `wp-scripts` copy `block.json` + `render.php` into `build/blocks/` (`--webpack-copy-php`) and register from `build/`. This also lets `wp-scripts` auto-discover block entry points, eliminating most of the ~20 manual entries in `webpack.config.js`.
2. **Only 16 of 24 block directories have a `block.json`.** Every block should be metadata-registered (`block.json` with `editorScript`, `viewScript`/`viewScriptModule`, `style`, `editorStyle`) so WordPress handles conditional loading — scripts load only on pages that use the block. The manual `*-init.ts` entry + enqueue pattern duplicates what `viewScript` gives for free.
3. **Asset versioning is broken for CSS.** `enqueue-scripts.php` enqueues `build/main.css` with version `null` — no cache busting on deploys. Use the version from `main.asset.php` (already done correctly for JS).
4. **The `media="print"` onload hack for main.css** is a fragile FOUC-prone pattern that also fights optimization plugins (the code already has `data-no-optimize` counter-hacks). Prefer: keep the critical-CSS inline approach (that part is good), split non-critical CSS per-block via `wp_enqueue_block_style()`, and load the remainder normally — smaller stylesheets beat deferral tricks.
5. **README/package.json mismatch:** README says `npm run build` runs "Webpack + Tailwind CSS minification" in two steps, but `package.json` defines `build` as plain `wp-scripts build`. Either restore the second step or (better — see below) remove Tailwind and fix the README.

### Migration: compile `src/` into `assets/` instead of `build/`

Decision: compiled output moves under `assets/`, the conventional theme layout (`assets/css`, `assets/js`), replacing the `build/` directory. One thing to be clear about up front: **the folder name has zero performance impact** — the real optimization wins come from the pipeline fixes above (per-block `block.json` loading, `.asset.php` versioning, critical CSS). This migration is about manageability and a conventional layout, and it must preserve the two things `wp-scripts` gives us: `.asset.php` files and the compiled block directory structure.

**Target layout:**

```
assets/
├── css/               generated: main.css, critical.css, editor.css, *-rtl.css
├── js/                generated: main.js, critical.js, editor.js + *.asset.php beside each
├── blocks/            generated: <block-name>/block.json, index.js, render.php, style-*.css
├── fonts/             static (committed)
├── icons/             static (committed)
├── images/            static (committed)
├── vendor/            static (committed) — icomoon.css moves here, see caveat 1
└── videos/            static (committed)
```

**1. `webpack.config.js`** — redirect output and split JS/CSS into subfolders. `wp-scripts` extracts CSS with `MiniCssExtractPlugin` and cleans the output dir with `CleanWebpackPlugin`; both must be reconfigured, not just `output.path`:

```js
const path = require("path");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const RtlCssPlugin = require("rtlcss-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const defaults = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaults,
  output: {
    ...defaults.output,
    path: path.resolve(process.cwd(), "assets"),
    filename: "js/[name].js",
  },
  plugins: [
    ...defaults.plugins.filter(
      (plugin) =>
        !["MiniCssExtractPlugin", "RtlCssPlugin", "CleanWebpackPlugin"].includes(
          plugin.constructor.name
        )
    ),
    new MiniCSSExtractPlugin({ filename: "css/[name].css" }),
    new RtlCssPlugin({ filename: "css/[name]-rtl.css" }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["js/**/*", "css/**/*", "blocks/**/*"],
      cleanStaleWebpackAssets: false,
    }),
  ],
};
```

The scoped `CleanWebpackPlugin` is **critical**: the default cleans the entire `output.path`, which would delete the committed fonts/icons/images/videos on every build.

**2. `package.json`** — add PHP copying so `render.php` and `block.json` land in `assets/blocks/`:

```json
"start": "wp-scripts start --webpack-copy-php",
"build": "wp-scripts build --webpack-copy-php"
```

Blocks discovered via `block.json` in `src/blocks/` compile to `assets/blocks/<name>/` automatically once every block has a `block.json` (pipeline fix #2 above) — the ~20 manual webpack entries shrink to only the non-block bundles (`main`, `critical`, `editor`, `admin-bar`).

**3. PHP path updates:**

- `functions/blocks.php`: `register_block_type( get_template_directory() . '/assets/blocks/<name>' )` — registered from compiled output, never from `src/`.
- `functions/enqueue-scripts.php`: `build/main.js` → `assets/js/main.js`, asset file at `assets/js/main.asset.php` (the `.asset.php` is emitted next to its JS), `build/main.css` → `assets/css/main.css`, `build/critical.css` → `assets/css/critical.css`, editor assets likewise.
- `functions/admin-bar-styles.php` and any other module reading from `build/` — grep for `'/build/` across `functions/` and `includes/` and update every hit.

**4. Version control & deploy:**

- `.gitignore`: replace `build/` with `assets/js/`, `assets/css/`, `assets/blocks/`. Static asset folders stay committed.
- Deploy workflow (`.github/workflows/`): artefact must include the generated `assets/` subfolders; any step referencing `build/` needs the new paths.
- Delete the `build/` directory once nothing references it.

**Caveats:**

1. **`assets/css/icomoon.css` conflict.** A committed static file currently lives exactly where generated CSS will go — and the scoped cleaner would delete it. Move it to `assets/vendor/icomoon.css` (update the enqueue in `enqueue-scripts.php`) **before** switching the output path.
2. **Source maps** (`*.js.map`, `*.css.map`) will land in `assets/js|css` in dev builds; production builds via `wp-scripts build` omit them — make sure deploys always run the production build.
3. **`wp-scripts start` watch mode** writes dev (unminified) output to the same folders; never deploy from a machine that last ran `start`.
4. Everything relies on staying on `@wordpress/scripts` defaults otherwise — don't fork the SCSS/TS loader chain; only output locations are overridden.

### Assumption 3 — "theme.json over hardcoded styles"

**Current state: three styling systems in parallel** — SCSS (37 partials in `src/styles/`), Tailwind (`tailwind.config.js`, `tailwind.css`, `src/styles/kotlinskiwind.scss`), and `theme.json` + 9 style variations. `theme.json` itself is clean (only 14 hex values, all as palette presets — correct). The problems are around it:

1. **Remove Tailwind entirely.** `tailwind.css` is 3 lines with `@tailwind base` already commented out, nothing in `src/` references it, and the build script doesn't run it. It is vestigial complexity; SCSS + theme.json presets is the stack.
2. **Hardcoded hex values in patterns (~32 occurrences).** `#7455b0` appears 12×, plus `#9fa1ae`, `#706f72`, `#453E4D`, `#db1c1c` etc., concentrated in `service-content.php`, `pricing-tables.php`, `mission-vision.php`, `featured-content.php`. These break the 9 colour-scheme variations in `styles/` — a user switching to `blue` still gets purple `#7455b0` accents. Every colour in a pattern must be a preset slug (`var:preset|color|…`). Recurring one-offs like `#7455b0` should become named presets in `theme.json` so all `styles/*.json` variants can override them.
3. **Hardcoded hex in SCSS (~50 occurrences across `plugins.scss`, `timeline.scss`, `language.scss`, `search-panel.scss`, `global.scss`, …).** Replace with `var(--wp--preset--color--*)` custom properties so SCSS output respects the active style variation and dark/light mode. `variables.scss` should define no colours of its own — only consume theme.json presets.
4. **Breakpoints are defined in at least three places:** SCSS `mixins.scss`, `functions/breakpoints.php`, and `get_theme_mod('mobile_breakpoint')` passed to JS. Define once (e.g. `theme.json` `settings.custom.breakpoints`, which WordPress emits as `--wp--custom--*` CSS custom properties) and read from there in SCSS, PHP, and TS. `docs/breakpoints.md` should document that single source.
5. **`styles/` variations only override colours.** Fine, but once pattern/SCSS hardcoding is fixed, verify each variation against dark/light mode (`body.dark-mode` class system) since that toggle lives outside theme.json.

### Reference: what Astra does (and what transfers to this theme)

Astra (installed locally at `wp-content/themes/astra`) does keep all compiled CSS/JS under `assets/` — `assets/css/minified/`, `assets/js/minified/` and `assets/js/unminified/` — which confirms the layout chosen in the migration section above. One important caveat before copying anything else from it: **Astra is a classic theme, not a block theme** (no `templates/` or `parts/`, `theme.json` v2 used only for palette presets, Customizer-driven, active `header.php`/`sidebar.php`). Its architecture solves classic-theme problems; only the pieces below transfer to an FSE theme.

Worth adopting:

1. **Feature-granular assets, conditionally loaded.** Astra ships many small files (`menu-animation`, `galleries`, `live-search`, `mobile-cart`) and enqueues each only when its feature is active — some small CSS is even inlined via an `Astra_Cache` helper. Our FSE equivalent is the same idea with better tooling: per-block `viewScript`/`style` in `block.json` plus `wp_enqueue_block_style()`, so assets load only on pages using the block. This validates pipeline fix #2.
2. **`SCRIPT_DEBUG` switching.** Astra picks `unminified/` sources when `SCRIPT_DEBUG` is true (`$file_prefix = SCRIPT_DEBUG ? '' : '.min'`), making production sites debuggable without a rebuild. Optional for us — `wp-scripts start` covers local dev — but cheap to add for staging debugging.
3. **`inc/` organized by concern** (`core/`, `compatibility/`, `integrations/`, `customizer/`, `modules/`, `dynamic-css/`). Directly supports the `functions/` subdirectory proposal above; Astra additionally wraps modules in classes, which would also fix our global-namespace function soup.
4. **RTL variant for every stylesheet.** Already covered — `wp-scripts` emits `*-rtl.css` automatically.
5. **Housekeeping:** `SECURITY.md`, `changelog.txt`, and empty `index.php` stubs inside asset directories to prevent directory listing on badly configured hosts.

Explicitly not to copy:

- **The dynamic-CSS layer** (`inc/dynamic-css/*` generating CSS from Customizer settings at runtime). That is Astra's workaround for not having theme.json/global styles — in a block theme, `theme.json` + style variations replace it. Adopting it would recreate the hardcoding problem Assumption 3 is trying to eliminate. The only candidate exception is the `body.dark-mode` toggle, which lives outside theme.json by design.
- **Customizer-centric configuration** — the direction here is the opposite (Assumption 1, change #3).
- **Committed compiled assets.** Astra commits its minified files because it distributes via the theme directory; this theme deploys via CI, so generated `assets/css|js|blocks` stay gitignored and are built in the pipeline.

### Proposed target structure

```
kotlinskidev/
├── assets/
│   ├── css/           generated (gitignored)
│   ├── js/            generated (gitignored)
│   ├── blocks/        generated (gitignored) — blocks registered from here
│   ├── fonts/         static
│   ├── icons/         static
│   ├── images/        static
│   ├── vendor/        static (icomoon.css)
│   └── videos/        static
├── docs/
├── functions/
│   ├── setup/         theme-setup, cache (first), enqueue, blocks
│   ├── admin/         settings-page, admin-bar, login, disable-comments
│   ├── content/       article-query, blog-topics, page-views, dynamic-footer
│   ├── integrations/  polylang-*, svg-*, complianz
│   └── performance/   critical assets, video/cover preload
├── languages/
├── parts/             header.html, footer.html (no -pl forks long-term)
├── patterns/          preset-only colours, no hardcoded hex
├── polylang/
├── src/
│   ├── blocks/        every block has block.json (auto-discovered by wp-scripts)
│   ├── formats/
│   ├── scripts/
│   ├── styles/        SCSS consuming --wp--preset--* / --wp--custom--* only
│   ├── types/
│   └── utils/
├── styles/            colour-scheme variations
├── templates/         + 404.html; classic *.php templates deleted
├── functions.php      thin loader
├── style.css
├── theme.json         single source for colours, spacing, typography, breakpoints
└── webpack.config.js  minimal — custom entries only for non-block bundles
```

### Suggested execution order

1. **Cleanup (no behaviour change):** delete Tailwind files, classic templates (after verifying each is unreachable), duplicate header pattern, merge `includes/` into `functions/`.
2. **Build pipeline:** move `icomoon.css` to `assets/vendor/`, switch webpack output to `assets/` (migration section above), add `block.json` to remaining blocks, register from `assets/blocks`, slim webpack config, fix CSS versioning, update `.gitignore` + deploy workflow.
3. **Design tokens:** promote recurring hex values to theme.json presets, sweep patterns then SCSS, unify breakpoints.
4. **FSE completion:** `templates/404.html`, retire Customizer + classic menus, rationalise `-pl` duplication.

Each step is independently shippable and testable; 3 is the largest and should be done pattern-by-pattern with visual checks against all 9 style variations plus dark/light mode.
