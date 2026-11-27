# Theme updates

Client sites install the theme once from a zip. After that, WordPress shows "Update available" under Appearance > Themes whenever a newer GitHub release of `Kotlinski95/wp_kotlinskidev` exists. The mechanism is the same as the Kotlinskidev Accessibility plugin's updater.

## How it works

- `functions/theme-updater.php` wires [plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) v5 (a Composer `require`, loaded from `vendor/autoload.php`) to the repository's GitHub releases. Without `vendor/` the module does nothing and the site keeps working.
- The checker only looks at releases that carry `kotlinskidev.zip`, `kotlinskidev.zip.sha256` and `kotlinskidev.zip.sig`. It never falls back to GitHub's source zipball, a tag or a branch.
- Before WordPress installs a package, `upgrader_pre_download` downloads `kotlinskidev.zip.sha256`, compares it with the SHA-256 of the downloaded zip and discards the package on a mismatch or a missing checksum.
- It then fetches `kotlinskidev.zip.sig` (a base64 Ed25519 detached signature) and verifies it with `sodium_crypto_sign_verify_detached()` against the public key pinned in `KOTLINSKIDEV_THEME_UPDATE_PUBLIC_KEY`. A missing, malformed or invalid signature discards the package. The checksum only detects corruption; the signature proves the release was built by the CI that holds the private key.
- Only URLs of the form `https://github.com/Kotlinski95/wp_kotlinskidev/releases/download/v<version>/kotlinskidev.zip` are trusted: no query, fragment, credentials, port or `..`. The owner and repository are pinned in constants; the `kotlinskidev_theme_update_source` filter can only change the branch.
- The extracted package is checked against the version taken from that validated URL. If the version cannot be derived the update is cancelled.
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
| `KOTLINSKIDEV_THEME_UPDATE_TOKEN` | Optional GitHub token, read only from this `wp-config.php` constant. Use a fine-grained, read-only token scoped to this single repository. The repository is public, so none is normally needed. The checker sends it only to `api.github.com/repos/<owner>/<repo>/` and strips it on redirects |
| `kotlinskidev_theme_update_source` | Array with a `branch` key; repository, slug and asset pattern are fixed |
| `kotlinskidev_theme_update_channel` | Final channel value |

## Release signing

CI signs the zip with the Ed25519 private key stored in the repository secret `RELEASE_SIGNING_KEY` (PKCS8 PEM). `bin/sign-release.js` writes the raw 64-byte signature, base64 encoded, to `kotlinskidev.zip.sig` and fails when the secret is missing, so an unsigned release is never published. The matching public key is the `KOTLINSKIDEV_THEME_UPDATE_PUBLIC_KEY` constant in `functions/theme-updater.php`; it is not filterable. Rotating the key needs a theme release signed with the old key that carries the new constant.

## Releasing

1. Add the changelog entries under `[Unreleased]`, run `npm run release`, merge the PR to `master`.
2. The `Deploy` workflow deploys, then `tag-release` creates `vX.Y.Z`.
3. The `publish-release` job runs `node bin/package-zip.js --tag vX.Y.Z`, writes the release notes with `node bin/release-notes.js vX.Y.Z` (the matching `CHANGELOG.md` section) signs the zip with `node bin/sign-release.js dist/kotlinskidev.zip` and runs `gh release create` with `kotlinskidev.zip`, `kotlinskidev.zip.sha256` and `kotlinskidev.zip.sig`. A version with a hyphen becomes a pre-release. If the release already exists the job does nothing.

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
