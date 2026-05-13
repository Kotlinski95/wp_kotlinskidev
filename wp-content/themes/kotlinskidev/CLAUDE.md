# kotlinskidev

See @README.md for project overview and @package.json for available npm commands.

## Non-obvious project behaviours

- `build/` output is never committed — always run `npm run build` before deploying.
- `functions/cache.php` **must** be required before any other module in `functions.php` — it provides transients used by modules that load after it.
- `styles/` at the root holds alternative `theme.json` colour scheme variants. `src/styles/` holds SCSS source. They are unrelated directories.
- jQuery is intentionally deregistered on the front end. Do not assume it is available in frontend scripts.
- Polylang handles i18n routing. Pattern files may have `-pl` language variants alongside the default.
- `npm run build` runs two steps (Webpack + Tailwind). Do not substitute `wp-scripts build` — it skips the Tailwind step.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
