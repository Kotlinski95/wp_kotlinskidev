# Theme updates

Client sites install the theme once from a zip. After that, WordPress shows "Update available" under Appearance > Themes whenever a newer GitHub release of `Kotlinski95/wp_kotlinskidev` exists. The mechanism is the same as the Kotlinskidev Accessibility plugin's updater.

## How it works

- `functions/theme-updater.php` wires [plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) v5 (a Composer `require`, loaded from `vendor/autoload.php`) to the repository's GitHub releases. Without `vendor/` the module does nothing and the site keeps working.
- The checker only looks at releases that carry both `kotlinskidev.zip` and `kotlinskidev.zip.sha256`. It never falls back to GitHub's source zipball, a tag or a branch.
- Before WordPress installs a package, `upgrader_pre_download` downloads `kotlinskidev.zip.sha256`, compares it with the SHA-256 of the downloaded zip and discards the package on a mismatch or a missing checksum. Only `https://github.com/<repository>/releases/download/` URLs are trusted.
- `upgrader_source_selection` then checks the extracted package: root folder is `kotlinskidev`, `style.css`, `theme.json`, `functions.php` and `vendor/autoload.php` exist, and the `style.css` `Version` equals the version offered by the update. Any failure cancels the update, so the active theme is never replaced by a broken package.
- A failed check stores a message in the `kotlinskidev_theme_update_failure` site option and shows an admin notice to users who can update themes. It clears itself once the installed version reaches the offered one.
- After a successful theme update the update cache (`update_themes` transient, the checker state option, the theme pattern cache) is cleared. `functions/cache.php` already flushes the theme transients on `upgrader_process_complete`.

The updater runs only in admin, cron and WP-CLI requests, so front-end requests pay nothing.

## When updates are skipped

- Constant `KOTLINSKIDEV_THEME_UPDATES_DISABLED` is `true`. Set it in `wp-config.php` on the production site that deploys through GitHub Actions.
- The theme directory, or any parent up to the WordPress root, contains `.git`. Development checkouts never overwrite themselves.
- `vendor/` is missing or the checker class cannot be loaded.

## Channels

`stable` (default) offers only non-prerelease releases. `beta` also offers releases whose version has a suffix such as `2.7.0-beta.1`, or that GitHub marks as a pre-release.

Resolution order: constant `KOTLINSKIDEV_THEME_UPDATE_CHANNEL`, then the `kotlinskidev_theme_update` site option (`['channel' => 'beta']`), then `stable`. The `kotlinskidev_theme_update_channel` filter has the last word. Set the option with `wp option update`-style tooling or code; there is no settings screen.

## Filters and constants

| Name | Purpose |
| --- | --- |
| `KOTLINSKIDEV_THEME_UPDATES_DISABLED` | Turns the updater off |
| `KOTLINSKIDEV_THEME_UPDATE_CHANNEL` | Locks the channel to `stable` or `beta` |
| `kotlinskidev_theme_update_source` | Array with `repository`, `slug`, `asset_pattern`, `branch` |
| `kotlinskidev_theme_update_channel` | Final channel value |
| `kotlinskidev_theme_update_token` | GitHub token, default `''`. The repository is public, so none is needed |

## Releasing

1. Add the changelog entries under `[Unreleased]`, run `npm run release`, merge the PR to `master`.
2. The `Deploy` workflow deploys, then `tag-release` creates `vX.Y.Z`.
3. The `publish-release` job runs `node bin/package-zip.js --tag vX.Y.Z`, writes the release notes with `node bin/release-notes.js vX.Y.Z` (the matching `CHANGELOG.md` section) and runs `gh release create` with `kotlinskidev.zip` and `kotlinskidev.zip.sha256`. A version with a hyphen becomes a pre-release. If the release already exists the job does nothing.

`npm run package` builds the same zip locally into `dist/` (gitignored) and prints its path, size and SHA-256. `--skip-build` reuses the current `build/`. The script fails when `style.css` and `package.json` disagree, when a required file is missing, when `node_modules`, tests, docs or TypeScript sources are present, or when the style.css version inside the zip differs.

The file selection comes from `.github/deploy-manifest.yml` (the theme's exclude rules), plus a few extra excludes for local-only folders. Unlike the server deploy, `vendor/` is shipped, installed with `composer install --no-dev -o`.

## Installing on a client site

1. Download `kotlinskidev.zip` from the latest GitHub release.
2. Appearance > Themes > Add New > Upload Theme, upload the zip, activate.
3. Later releases appear as a normal theme update. The zip root folder is `kotlinskidev/`, so WordPress replaces the active theme in place.

## Caveats

- Updates replace every file in the theme folder. Code edits belong in a child theme.
- Templates, template parts and global styles saved in the Site Editor live in the database and are not replaced by an update. Reset them in the Site Editor to receive new theme markup.
- Rollback to an older version is not built in. Upload an older `kotlinskidev.zip` from the releases page instead.
