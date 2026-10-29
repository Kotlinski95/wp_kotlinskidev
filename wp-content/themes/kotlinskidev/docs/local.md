# LocalWP environment fixes

Troubleshooting notes for this specific LocalWP site (`kotlinskidev.local`). Unlike the rest of `docs/`, this covers the local dev *environment*, not the theme's own code.

## Symptom: FSE editor Save button gets stuck, then the whole site (admin and frontend) stops responding until the editor tab is closed

### Root cause

This site's PHP-FPM pool is capped at `pm.max_children = 2` with no `request_terminate_timeout`, which is LocalWP's default for a low-resource dev site. A single Gutenberg save fans out several concurrent PHP requests at once (the REST save, a heartbeat `admin-ajax.php` POST, a legacy metabox-compatibility POST, sometimes an autosave POST) — regardless of which block you're editing. With only 2 workers for the *entire* site and no timeout to force-kill a stuck one, it doesn't take much for both workers to get tied up simultaneously, and every other request (including the public frontend) queues behind them with no way to recover on its own.

Confirmed via `php-fpm.log` (`~/Library/Application Support/Local/run/<site-id>/nginx/logs/` has no entries, but `<site>/logs/php/php-fpm.log` does): workers have previously SIGSEGV'd/SIGBUS'd after running 3–760+ seconds with nothing to force-recycle them.

### The fix

Edit this site's PHP-FPM pool config and raise the worker count, and add a timeout so a hung worker gets killed instead of blocking forever:

1. Find this site's internal ID (a folder name under Local's run directory):

   ```bash
   ls "~/Library/Application Support/Local/run/"
   ```

   For this site it's currently `eWJPKpiL2` — confirm by checking which one contains `conf/nginx/conf/route.kotlinskidev.local.conf` or similar, since Local can reassign the ID.

2. Edit the pool config:

   ```text
   ~/Library/Application Support/Local/run/<site-id>/conf/php/php-fpm.d/www.conf
   ```

   Change:

   ```ini
   pm.max_children = 2
   pm.start_servers = 2
   pm.min_spare_servers = 1
   pm.max_spare_servers = 3
   ```

   to:

   ```ini
   pm.max_children = 6
   pm.start_servers = 2
   pm.min_spare_servers = 1
   pm.max_spare_servers = 4
   request_terminate_timeout = 60
   ```

3. Also edit the matching `.hbs` template right next to it (`www.conf.hbs`) with the same values — this is the template Local regenerates `www.conf` from, so keeping both in sync makes the fix marginally more durable. In practice this has **not** reliably survived a Local restart or a PHP version change (see below), so don't assume editing the `.hbs` is a permanent fix.

4. Restart the site in Local (Stop Site → Start Site) for the new pool config to actually load — editing the file alone does nothing until PHP-FPM restarts.

### This fix does not persist — when to reapply it

Local regenerates `www.conf` from its own template under these circumstances, silently wiping the custom `pm.max_children`/`request_terminate_timeout` values back to the 2-worker default:

- **Changing this site's PHP version** in Local (e.g. upgrading for a security patch) — confirmed cause, happened on 2026-10-23 when PHP was bumped from 8.2.29 to 8.5.12.
- Possibly on an ordinary site restart too — observed the config reset back to `pm.max_children = 2` even without a version change, so don't assume a restart alone is safe.

**Rule of thumb: after any Local restart or PHP version change on this site, re-check `www.conf` before assuming the stuck-editor bug is still fixed.** Quick check:

```bash
cat "~/Library/Application Support/Local/run/<site-id>/conf/php/php-fpm.d/www.conf"
```

If `pm.max_children` is back to `2` and `request_terminate_timeout` is missing, redo step 2 above and restart the site again.

### A second, unrelated contributing factor

`wp-content/plugins/mcp-adapter` (used by enable-abilities-for-mcp / Novamira) fatals with a memory-exhaustion error during its `init`-hook ability-discovery code — confirmed by running `wp eval` without `--skip-plugins`. This doesn't itself explain the stuck-editor symptom, but it's a plausible source of an occasional slow/heavy request that's more likely to tip over an already-fragile 2-worker pool. Worth keeping an eye on if the issue keeps recurring even with the pool fix in place; can't fix it directly here since `wp-content/plugins/` is off-limits (see the root `CLAUDE.md`).

### For any `wp-cli` command that hits this same memory limit

`wp eval` / `wp eval-file` use their own bundled PHP binary with a lower default `memory_limit` than the site's real PHP-FPM pool (256M), and will fatal on the same mcp-adapter code path. Add `--skip-plugins` when you don't need plugins loaded (e.g. direct DB/content reads, `$wpdb` work, `parse_blocks()`/`serialize_blocks()` round-trips) — this is how the block-attribute corruption fixes and the active-tab-color repair earlier were done safely.
