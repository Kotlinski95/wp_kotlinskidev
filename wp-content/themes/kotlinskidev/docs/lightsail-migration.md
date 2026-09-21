# EC2 → Lightsail Migration

**Date:** 2026-09-15
**Status:** Live on Lightsail. Old EC2 instance stopped (not terminated) — in a rollback watch window before final decommission.

## Why

The site was running on a t3.micro EC2 instance costing ~$20/month, most of which was infrastructure overhead unrelated to actual load — the instance averaged ~1.6% CPU with a single 92% spike over a 14-day sample. An audit of AWS Cost Explorer found the real breakdown:

| Item | Cost/month |
|---|---|
| EC2 compute (t3.micro) | ~$7.75 |
| EC2-Other (EBS, snapshots) | ~$1.22 |
| Elastic IP (in-use) | ~$3.60 |
| Elastic IP (orphaned, unattached) | ~$3.60 |
| Tax | ~$3.70 |
| **Total** | **~$20** |

The orphaned Elastic IP (`13.63.43.226`) was confirmed unused (not referenced in Cloudflare DNS) and released immediately, dropping the bill to ~$15–16/month before any migration work started.

Lightsail's flat-rate pricing matched the actual workload far better. Final target: **Micro-1GB Linux bundle, $7/month** (2 vCPU, 1GB RAM, 40GB SSD, 2TB transfer) — matches the EC2 instance's RAM exactly with 2–3x more storage/transfer headroom.

## Current architecture

- **Host:** AWS Lightsail, instance `Kotlinskidev-wordpress`
- **Region:** `eu-central-1` (Frankfurt) — chosen over the original `eu-north-1` (Stockholm) for lower latency to the primary Polish audience
- **Plan:** Micro-1GB Linux, $7/month
- **Blueprint:** WordPress 7.1 (AWS's own Lightsail blueprint, not Bitnami-packaged)
- **OS:** Debian, Apache 2.4 + mod_php 8.2
- **Static IP:** `52.28.121.185` (named `kotlinskidev-static-ip` in Lightsail)
- **SSH:** user `admin`, key `LightsailDefaultKey-eu-central-1.pem`, firewall restricted to the admin's home IP (`84.40.218.223/32`) plus Lightsail's own browser-SSH ranges
- **WordPress root:** `/var/www/html` (note: `wp-config.php` itself sits one level up at `/var/www/wp-config.php`, standard WP convention)
- **TLS:** Cloudflare Origin CA certificate (15-year validity), installed at `/etc/ssl/certs/cloudflare-origin.pem` / `/etc/ssl/private/cloudflare-origin.key`, wired into Apache's `default-ssl.conf`
- **DNS/CDN:** Cloudflare, proxied (orange-cloud) on `kotlinskidev.com` and `www`, SSL/TLS mode **Full (strict)** — requires the origin cert above to be valid at all times
- **Monitoring:**
  - Lightsail native alarms: `kotlinskidev-lightsail-high-cpu` (>80%), `kotlinskidev-lightsail-status-check-failed`
  - CloudWatch Agent (installed manually, config at `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`) pushing `mem_used_percent` and `disk_used_percent` to CloudWatch namespace `CWAgent` in `eu-central-1`
  - CloudWatch alarms: `kotlinskidev-lightsail-high-memory`, `kotlinskidev-lightsail-high-disk` (both >85%), notifying via SNS topic `kotlinskidev-lightsail-alerts` → email
  - CloudWatch Agent authenticates via a dedicated IAM user (`lightsail-cloudwatch-agent`, policy `CloudWatchAgentServerPolicy`) with credentials stored in `/root/.aws/credentials` under profile `AmazonCloudWatchAgent` — **not** an IAM role, since Lightsail instances don't support attachable instance roles the way EC2 does. This is a static-credential trade-off accepted deliberately for parity with the old EC2 memory/disk alarms.
  - No auto-reboot / auto-recovery action exists on Lightsail (EC2 had this via CloudWatch alarm actions). Covered instead by an external uptime monitor + manual restart, a deliberate choice made before migration.

## What did NOT carry over automatically

- **SNS topics** (`kotlinskidev-alerts`, `site-down-alert`) — these are EC2-side and will be cleaned up in the decommission phase; Lightsail alerting uses its own contact-method system plus a new dedicated SNS topic for CloudWatch Agent alarms.
- **Auto-reboot / auto-recover** EC2 alarm actions — no Lightsail equivalent.
- **IAM instance role** (`kotlinskidev-cwagent-role`) — Lightsail instances can't use attachable IAM roles; replaced with a static-credential IAM user instead.

## Migration steps taken

1. **Backup** — Full site export via All-in-One WP Migration plugin, run from the production EC2 site (`.wpress` file, 346MB).
2. **Provision** — New Lightsail instance created (WordPress blueprint, Frankfurt region, Micro-1GB plan), static IP attached.
3. **Restore** — Free-tier All-in-One WP Migration doesn't support server-side "restore from detected file," only browser upload (capped by PHP's default 2MB/8MB limits). Fixed by raising `upload_max_filesize`/`post_max_size` to 512M in `/etc/php/8.2/apache2/php.ini`, then restoring via the plugin's browser Import flow.
4. **SSL** — Cloudflare SSL/TLS mode is Full (strict), which requires a valid origin certificate before any DNS cutover, or all traffic breaks instantly. Used a Cloudflare Origin CA certificate (avoids the chicken-and-egg problem of needing public DNS pointed at the server before Let's Encrypt can issue a cert, and doesn't need 90-day renewal).
5. **Pre-cutover verification** — Tested the migrated site via `/etc/hosts` override before touching DNS.
6. **DNS cutover** — Cloudflare A records for `kotlinskidev.com` and `www` repointed to the Lightsail static IP, proxy kept on.
7. **Post-cutover URL cleanup** (see Problems below) — several rounds of database search-replace to remove stale IP references left behind by the migration plugin's own URL-rewriting behavior.
8. **Monitoring parity** — Lightsail native alarms + CloudWatch Agent + alarms recreated.
9. **Old EC2 stopped** (not terminated) as a rollback safety net.

## Problems encountered and how they were solved

**1. AWS MCP / Cloudflare connector auth issues** — Initial tooling hiccups (connector auth, wrong MCP server type) unrelated to the actual migration; resolved by locating and using the correct connectors.

**2. Lightsail SSH firewall defaults to `lightsail-connect` only** — SSH port 22 was open but restricted to Lightsail's own browser-terminal IP ranges, not arbitrary internet IPs. Fixed by adding the admin's home IP as a custom firewall rule.

**3. Wrong SSH username assumed** — Older Lightsail/Bitnami blueprints use `bitnami`; this newer AWS-native WordPress blueprint uses `admin`. Confirmed via `lightsail get-instance-access-details`.

**4. Free-tier plugin upload cap** — All-in-One WP Migration's free version doesn't expose server-side restore, and the target server's default PHP limits (2MB/8MB) were far too small for a 346MB backup. Fixed by raising Apache's PHP config.

**5. Wrong install path assumed** — Initially dropped the backup file into `/var/www/wp-content/`, but the real WordPress install lives at `/var/www/html/wp-content/` (with `wp-config.php` sitting one directory above, per WP convention). Corrected and cleaned up the stray directory.

**6. PHP version mismatch (backup from 8.4, target 8.2)** — Accepted as low-risk (downgrading is generally safer than upgrading) and proceeded; no issues surfaced.

**7. Stale URLs baked into the database by the migration plugin** — This was the biggest and most persistent issue, in three separate layers:

- All-in-One WP Migration automatically search-replaces the backup's URL with whatever the *current* site's URL is *at import time*. Since the import happened before DNS cutover (correctly, for safe pre-launch testing), it rewrote every URL in the database to the Lightsail IP address instead of the real domain.
- A first search-replace pass (`http://52.28.121.185` → `https://kotlinskidev.com`) missed the `https://` variant of the IP, which several menu/footer custom links used — a second, broader pass (bare IP, no protocol) was needed.
- `wp-config.php` itself defined `WP_HOME`/`WP_SITEURL` dynamically from the incoming request's `Host` header (`define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST'] . '/')`) — a sensible Lightsail first-boot default, but one that silently overrides the database value on every request. This caused WP-CLI (no real HTTP context, defaults to `127.0.0.1`) and any background process without a proper Host header to keep leaking `127.0.0.1` into stored content (notably Yoast SEO's separate `wp_yoast_indexable.permalink` cache table, which doesn't read `home_url()` live). Fixed by hardcoding both constants to the real domain.
- **Diagnosis method worth remembering**: `wp option get` can itself be misleading if a plugin or object cache intercepts the value — cross-checking with a raw `wp db query` against `wp_options` directly, and testing the origin server straight via IP + explicit `Host` header (bypassing Cloudflare entirely), was what isolated each layer.

**8. Search-replace collateral** — One later broad pass touched `wp_users.user_email`/`user_url` for the `admin` account, because Lightsail had auto-assigned it a placeholder value containing the IP address. Verified afterward that no real user accounts were affected — only the placeholder.

**9. CloudWatch Agent silently ignored configured IAM credentials** — Lightsail instances turn out to expose their own limited automatic IAM role (`AmazonLightsailInstanceRole`) via instance metadata, which the agent used by default instead of the manually configured `AmazonCloudWatchAgent` profile — and that built-in role lacks `cloudwatch:PutMetricData` permission, so the agent failed silently until the logs were checked. Fixed by explicitly setting `shared_credential_profile = "AmazonCloudWatchAgent"` in `/opt/aws/amazon-cloudwatch-agent/etc/common-config.toml`.

**10. `append_dimensions: InstanceName` silently dropped** — Only AWS's predefined placeholder keys (`InstanceId`, `ImageId`, etc.) are honored in CloudWatch Agent's `append_dimensions`; a custom literal key was silently ignored. Alarms were created against the metrics' actual natural dimensions instead.

## Remaining work

- [ ] Continue the watch window (a few more days of normal use, watching for any further stray IP references in less-visited pages)
- [ ] **Phase 6 — decommission old EC2**: final snapshot, terminate `i-036f11488611a435b`, delete its now-orphaned status-check alarms and the `kotlinskidev-cwagent-role` IAM role, confirm final monthly cost lands around $7–8
