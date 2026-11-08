# Distributing the theme to client sites

This document covers a concern separate from `docs/build.md` (which is about the
Webpack output layout for **this** repo's own build). Here the question is: once the
theme is installed on client sites (each their own WordPress install, not this repo),
how do they receive updates when the theme changes?

WordPress core only auto-updates themes that come from wordpress.org. A custom theme
distributed outside of that has no update mechanism unless one is built in. That
requires three things: a versioned, packaged artifact; a way for each client site to
check "is a newer version available"; and a way to fetch and install it. None of this
exists yet in this repo.

## Versioning (already solved)

`style.css`'s `Version:` header and `package.json`'s `"version"` are the source of
truth and are kept in sync by `bin/check-version-sync.js` (run via `npm run
check-version-sync`, part of `npm run verify`). Any distribution mechanism should read
the version from `style.css`, since that's the file WordPress itself reads
(`wp_get_theme()->get('Version')`).

## Packaging

Client sites don't run `npm`/Webpack — they need a zip that already contains compiled
`build/`. This is a new step, distinct from the dev-only `npm run build`:

1. `npm run build` (compiles `build/`, as today).
2. A packaging script (new — e.g. `bin/make-release-zip.js`, modeled on
   `wp-scripts plugin-zip` but for a theme) that copies the theme directory into a zip,
   **excluding** `node_modules/`, `src/`, `tests/`, `docs/`, `.git/`, `coverage/`,
   `artifacts/`, `.env*`, and other dev-only paths, and **including** `build/`,
   `vendor/` (if `composer install --no-dev` was run), `languages/`, `patterns/`,
   `templates/`, `parts/`, `functions/`, `includes/`, `style.css`, `theme.json`,
   `functions.php`.
3. Name the artifact with the version, e.g. `kotlinskidev-1.2.0.zip`, and keep it
   somewhere addressable by URL (see below).

This step belongs in CI, triggered on release (e.g. tagging `v1.2.0`), not on every
commit.

## Update-check mechanism: two options

WordPress needs something to hook `pre_set_site_transient_update_themes` (or use a
library that does this for you) and tell the client's wp-admin "update available,
here's the zip URL." Two realistic approaches:

### Option A — Private GitHub repo + Releases

Use [`YahnisElsts/plugin-update-checker`](https://github.com/YahnisElsts/plugin-update-checker)
(it supports themes, not just plugins) pointed at this repo's GitHub Releases. Each
client's theme copy polls the GitHub API for the latest release tag; if newer than the
installed `style.css` version, wp-admin shows an update, and the checker downloads the
release zip asset directly.

- **Pros**: no server to host, tags file automatically, minimal code (one PHP file +
  a `require` in `functions.php` or a small module in `functions/`).
- **Cons**: if the repo is private, the library needs a GitHub token embedded per
  client install to authenticate API/download requests — that token is then sitting in
  every client's filesystem, a real leak risk (a compromised client site leaks a
  token with read access to the whole repo). Usable if the repo is public, or if
  you're comfortable with per-client scoped tokens and rotation. No licensing/access
  control — anyone with the zip URL (or token) gets every version forever, no way to
  gate a client whose contract ended.

### Option B — Self-hosted update server (recommended for paying clients)

Run a small endpoint you control (e.g. a Cloudflare Worker, or a route on
kotlinski.dev) that:

- Accepts a request from the client site's update checker, including a **license
  key** (stored as a theme option, entered by the client or provisioned by you).
- Looks up the license key: is it valid, active, not expired, not over its site-count
  limit?
- Returns JSON in the shape `plugin-update-checker` (or a custom lightweight checker)
  expects: `{ "version": "1.2.0", "download_url": "...", "sections": { "changelog":
  "..." } }` — with `download_url` itself requiring the license key (so the zip can't
  be redistributed by URL alone).
- Serves the zip (built in the packaging step above) from private storage (S3/R2
  bucket with signed URLs, or the endpoint streams it after validating the key).

This mirrors how Astra Pro / Easy Digital Downloads Software Licensing / most
commercial WP themes work. It's more infrastructure than Option A, but is the only
option that gives you per-client access control (revoke a lapsed client, cap active
sites per license) and doesn't expose a broad-access token to every install.

**Recommendation**: start with Option A if clients are trusted/small in number and the
repo can be public or tokens are acceptable; move to Option B once there's real
licensing/revenue on the line, since the client-side integration code
(`functions/updates.php` calling the checker library against a URL) is nearly
identical either way — only the URL and auth method change. This means Option A isn't
wasted work if you outgrow it.

## What changes in this repo either way

- A new `functions/updates.php` module (loaded like other single-responsibility
  modules, per this theme's existing `functions/` pattern) that registers the update
  checker against whichever URL is chosen.
- A new `bin/make-release-zip.js` packaging script.
- A new CI job (separate from the existing deploy pipeline) that runs on a version tag:
  build → package → upload zip to GitHub Releases (Option A) or to the license
  server's storage (Option B).
- If Option B: a settings field (theme option or dedicated admin page) for the client
  to enter their license key, and the license-validation endpoint itself (outside this
  repo, likely a small separate service).

## Non-goals

- This is not about publishing to wordpress.org — that requires a GPL-compatible,
  guideline-compliant public theme with no license gating, which conflicts with a
  paid-client distribution model.
- This does not change anything about `docs/build.md`'s recommendation — `build/`
  stays git-ignored in this dev repo; it only gets included in the **packaged release
  zip**, which is a build artifact, not a git-tracked directory.
