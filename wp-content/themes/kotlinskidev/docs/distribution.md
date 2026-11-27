# Distributing the theme to client sites

Client sites install the theme once from a zip and then receive updates from GitHub releases. This page is the short overview. `docs/theme-updates.md` has the full detail.

## Flow

1. Add changelog entries under `[Unreleased]` and run `npm run release`. It bumps `style.css`, `package.json` and `package-lock.json` together.
2. Merge the PR to `master`. The `Deploy` workflow deploys, then `tag-release` creates `vX.Y.Z`.
3. The `publish-release` job builds `kotlinskidev.zip` with `node bin/package-zip.js`, writes `kotlinskidev.zip.sha256` and signs the zip into `kotlinskidev.zip.sig` with `bin/sign-release.js`. It publishes all three as one GitHub release.
4. Client sites see "Update available" under Appearance > Themes. Before installing, the updater checks the package URL, the SHA-256 and the Ed25519 signature, then the extracted package. Any failure cancels the update.

## Packaging

`npm run package` builds the same zip locally into `dist/` (gitignored). File selection comes from `.github/deploy-manifest.yml` plus a few local-only excludes. `.git`, `node_modules`, tests, docs and TypeScript sources never ship. `vendor/` ships, installed with `composer install --no-dev -o`.

## Signing keys

- The private key is the repository secret `RELEASE_SIGNING_KEY` (Ed25519, PKCS8 PEM). Without it the release job fails on purpose.
- The public key is the constant `KOTLINSKIDEV_THEME_UPDATE_PUBLIC_KEY` in `functions/theme-updater.php`.
- To rotate, release a version signed with the old key that carries the new public key, then switch the secret.

## Client sites

- First install: upload `kotlinskidev.zip` under Appearance > Themes > Add New > Upload Theme.
- Updates are skipped when `KOTLINSKIDEV_THEME_UPDATES_DISABLED` is set, when a `.git` folder exists in or above the theme folder, or when `vendor/` is missing.
- Rollback is manual: upload an older `kotlinskidev.zip` from the releases page.
- Plugins the theme works with, the Kotlinskidev Accessibility plugin and WordPress PWA Manager, update separately from their own repositories. See their `docs/distribution.md`.
