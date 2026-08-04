# kotlinskidev

See @README.md for project overview and @package.json for available npm commands.

## Non-obvious project behaviours

- `build/` output is never committed — always run `npm run build` before deploying.
- `functions/cache.php` **must** be required before any other module in `functions.php` — it provides transients used by modules that load after it.
- `styles/` at the root holds alternative `theme.json` colour scheme variants. `src/styles/` holds SCSS source. They are unrelated directories.
- jQuery is intentionally deregistered on the front end. Do not assume it is available in frontend scripts.
- Polylang handles i18n routing inline via Polylang-aware blocks (`nav-language-panel`, `polylang/navigation-language-switcher`) and `kotlinskidev_resolve_translatable_post()` (translatable `wp_navigation`/`wp_block` posts resolved by slug). There are no `-pl` suffixed template part/pattern files — that was an earlier approach, since replaced.
- `npm run build` runs webpack.
- See `docs/treeview.md` for a full current-state annotated directory tree of every block/pattern/template/function module — keep it in sync when adding/removing/renaming one.
- Log every notable change in `CHANGELOG.md` (Keep a Changelog format). Theme follows semver — bump `Version` in `style.css` and `"version"` in `package.json` together, in the same commit that moves `[Unreleased]` entries under a new version heading.

# Additional Instructions
- Git workflow: @docs/git-instructions.md

## No Comments
Do not add inline or block comments. Types and function signatures must be self-documenting.
