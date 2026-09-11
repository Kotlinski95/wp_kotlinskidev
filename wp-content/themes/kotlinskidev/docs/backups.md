# Working with client site backups (Local ↔ production)

This is a personal workflow reference, not something this repo implements — it covers
how to pull a client's live WordPress site down into Local for development, and how to
(carefully) push changes back. Originated from evaluating whether to build a custom
sync connector plugin; conclusion below is **don't build one yet**, use existing free
tooling with a specific split strategy.

## The core problem

A full site backup is dominated by `wp-content/uploads/` (media), not the database — a
typical database is a few MB to a few tens of MB even for a media-heavy site. Every
"free tier" migration plugin's size cap is a business-model limit on the combined
export file, not a technical ceiling on what WordPress can actually hold. Treating the
database and media as two separate transfers, rather than one bundled export, avoids
that cap entirely rather than fighting it.

## Tools evaluated

| Tool | Push/pull between two live sites | Cost | Notes |
|---|---|---|---|
| Local's native "Connect" | Yes, one-click, with a pre-push confirmation step | Free | **Only** works for WP Engine and Flywheel — needs your login on the client's actual hosting account, not just wp-admin. Not usable for generic/shared hosting. |
| WP Migrate (Pro) | Yes, selective table push/pull, handles serialized data + URL rewrite automatically | $49/yr+ | Works over plain HTTP via a plugin installed on each site — no SSH/SFTP needed, works on locked-down shared hosting. Best option if this becomes frequent enough to justify the cost. |
| WP Migrate Lite (free) | No — export only | Free | Not useful for the push/pull workflow described here. |
| All-in-One WP Migration (free) | No — export to file, manual download/import | Free | 512MB **import** cap on the free tier (paid Unlimited Extension removes it). Fine for DB+plugins+themes; not for a media-heavy bundle. |
| UpdraftPlus (free) | No — backs up to chunked cloud storage, manual restore elsewhere | Free | Chunking to Google Drive/Dropbox routes around single-upload limits, useful if you want one tool to handle a large media library without manually splitting it yourself. |
| Custom connector plugin | Would be yes, if built | Free (your time) | Not built. See [Why not a custom plugin](#why-not-a-custom-plugin-yet) below. |

Raising the server's own `upload_max_filesize`/`post_max_size` (e.g. via
[Servmask's own guide](https://help.servmask.com/2018/10/27/how-to-increase-maximum-upload-file-size-in-wordpress/))
is worth doing on principle — some hosts default to a low PHP limit — but it does
**not** remove All-in-One WP Migration's free-tier cap, which is enforced separately
by the plugin itself (a client-side check), not by the server. Confirmed against the
vendor's own documentation, not assumed.

## Best practice: first full pull on a new client project

One-time, size doesn't need to be fast — optimize for reliability over speed here.

1. **Check if the host offers a full-account backup export** (cPanel's Backup Wizard,
   Plesk's equivalent, or the host's own dashboard). Generate a full archive and
   **download** it directly — downloads aren't subject to `upload_max_filesize` at all
   (that limit is upload-specific), so size stops being a constraint regardless of how
   large the site is.
2. Unzip locally, then:
   - Copy `wp-content/uploads/` straight into the Local site's folder — plain
     filesystem copy, no size limit anywhere in this step.
   - Import the SQL dump via Local's built-in Adminer or `wp db import` in Local's
     WP-CLI shell.
3. **If the host has no full-backup export** (bare shared hosting): pull
   `wp-content/uploads/` directly via SFTP (FileZilla — supports resuming an
   interrupted transfer on a large folder), and export the database separately with
   whatever's available (All-in-One WP Migration DB-only export, WP Migrate Lite, or
   phpMyAdmin) — the database alone is small enough to fit any free-tier cap.
4. After import, run `wp search-replace` for the domain
   (`clientdomain.com` ↔ `clientdomain.local`) — **always use `search-replace`, never a
   raw SQL find/replace**, since WordPress stores serialized PHP arrays/objects in
   several columns (theme mods, widget options, block editor data) and a naive
   string replace corrupts the byte-length prefix in serialized data, silently
   breaking those rows.

## Best practice: ongoing pulls ("client changed something, sync it")

Media rarely changes much between visits once the initial pull is done, so this case
doesn't need the heavy first-pull treatment:

- Database-only export/import (All-in-One WP Migration DB export, WP Migrate Lite, or
  phpMyAdmin) — small, fast, fits any free-tier cap trivially.
- Only re-pull `wp-content/uploads/` if you know new media was added — and prefer
  `rsync`/resumable SFTP over a full re-copy so only the new/changed files transfer.

## Pushing changes back — do not treat this as the reverse of pulling

A full-database push overwrites production with a stale local snapshot. If a customer
placed an order, submitted a form, or left a comment on the live site after you pulled,
a full push silently deletes that data — it's an overwrite, not a merge. This is why
serious WordPress workflows split the two halves of a deploy:

- **Code** (theme/plugin files) → git + a deploy pipeline (this repo already does this
  via DeployHQ — see `docs/git-instructions.md`). Never pushed via a database dump.
- **Content/config changes** → pushed selectively (specific tables, specific
  `wp_options` rows, or just the one page/post you actually edited), or re-applied
  directly via wp-admin/WP-CLI on the live site instead of exported from local at all.
  WP Migrate's per-table push selection exists specifically for this reason.

Treat "pull the whole DB" as safe and routine (read-only, can't hurt production).
Treat "push the whole DB" as a rare, deliberate action taken only immediately after a
pull with zero production activity in between — not a default habit.

## Privacy: pulling production data to a local machine

A full pull brings real visitor/customer data (contact form submissions, any stored
PII) onto a local dev machine. Worth checking against a project's own
`docs/legal-compliance.md`-equivalent (data minimization / processor-agreement
obligations) before treating this as routine, especially for client sites under GDPR —
consider excluding or anonymizing any submission/PII tables on pull if the local copy
isn't needed for that specific piece of work.

## Why not a custom plugin (yet)

A self-built connector plugin that exposes DB export/import over HTTP on a live client
site is a real security surface, not a small add-on:

- The endpoint itself needs proper auth, rate-limiting, and transport security — get
  it wrong and it's a hole into a client's production database. This is the same class
  of risk this repo's own `security-reviewer` agent exists to catch elsewhere in the
  theme.
- Serialized-data-safe search-replace needs to be reimplemented correctly (WP-CLI's
  version is battle-tested over years); an edge case missed here silently corrupts a
  client's data rather than erroring loudly.
- Push-side safety rails (excluding user/session tables, a dry-run/diff step before
  applying) are real design work, not a checkbox — this was the original ticket's
  explicit "only once approved and tested" requirement.

Revisit this only if the free-tooling workflow above becomes a frequent enough
bottleneck to justify that build-and-review cost — and if so, scope it as its own
security-reviewed project, not a quick addition.
