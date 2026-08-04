# Monitoring & Alerting Setup (AWS EC2 origin)

Companion to `docs/522.md`. Goal: get memory/disk visibility and auto-recovery for the EC2 origin (`i-036f11488611a435b`) so a future guest-OS hang is caught and self-healed in minutes, not discovered 40 hours later — without adding to AWS billing.

## Cost budget

Everything below is designed to stay inside CloudWatch's Always-Free tier:

| Resource | Used by this setup | Free tier limit |
|---|---|---|
| CloudWatch alarms | 5 | 10/month |
| CloudWatch custom metrics | 4 | 10/month |
| CloudWatch Logs ingestion | `syslog` only | 5GB/month |
| CloudWatch Logs storage | 14-day retention | 5GB |
| SNS email notifications | low volume | 1,000/month |

The only item in this whole doc that costs money is the last-resort instance upsize noted at the bottom — everything else is $0 as configured.

## Server facts (confirmed 2026-07-30, via `free -h` / `ps aux` over EC2 Instance Connect)

- Total RAM: **914MiB** — a t2/t3.micro-class instance.
- Swap: **4GiB already configured**, 725MiB already in use at a relatively idle moment. This predates this setup — it's a CloudPanel default (see below), not something added here.
- Server is managed by **CloudPanel** (evidenced by `/home/clp/services/php-fpm/fpm/php-fpm.conf` in the process list).
- **10 separate PHP-FPM version stacks running concurrently** (7.1, 7.2, 7.3, 7.4, 8.0, 8.1, 8.2, 8.3, 8.4, plus CloudPanel's own default pool) — CloudPanel installs all of these by default so any site can pick a version; only one is actually needed for this site.
- `available` memory at check time: 293MiB / 914MiB (~32%).

## Refined root-cause theory for the 2026-07-28 522 incident

`docs/522.md`'s original hypothesis was "OOM event, no swap configured." That's now known to be partly wrong — swap *was* already present. Given swap already existed and was already partially used at rest, the more likely mechanism is **swap thrashing**: 10 idle PHP-FPM stacks + MySQL + nginx + OS all competing for under 1GiB of RAM, and under any load spike the box slows down swapping hard enough to stop responding to Cloudflare within its connect timeout — without necessarily leaving a clean "Killed process" OOM-killer log line. Part 7 below (persistent journald) and Part 8 (swap/mem alarms) are what will confirm or rule this out next time.

## Part 0 — Billing safety net (do this regardless of everything else)

1. AWS Console → Billing and Cost Management → Budgets → Create budget
2. Custom → Cost budget → Monthly → amount a few dollars above current spend (e.g. `$18` against a current ~$15)
3. Alert threshold 90% → your email
4. Create. (First 2 budgets are free.)

## Part 1 — SNS topic for alerts

1. SNS console → Topics → Create topic → Standard → name `kotlinskidev-alerts` → Create
2. Create subscription → Protocol: Email → your email → Create
3. Confirm the subscription via the email link (stays "pending" until confirmed)

## Part 2 — Status-check alarms (uses free, built-in EC2 metrics)

Two alarms, since the two failure types need different fixes:

1. CloudWatch → Alarms → Create alarm → EC2 → Per-Instance Metrics → `i-036f11488611a435b` → `StatusCheckFailed_System`
2. Period 5 min, threshold ≥1 for 2/2 datapoints (avoid reacting to a single blip)
3. EC2 action: **Recover this instance** (for actual hardware faults — migrates to new host)
4. Notification → `kotlinskidev-alerts`
5. Name `kotlinskidev-system-check-recover` → Create
6. Repeat with metric `StatusCheckFailed_Instance`, EC2 action **Reboot this instance** (this is the one that would have auto-fixed the actual 2026-07-28 incident), same notification, name `kotlinskidev-instance-check-reboot`

## Part 3 — IAM role for the CloudWatch agent

1. IAM → Roles → Create role → AWS service → EC2 → Next
2. Attach policy `CloudWatchAgentServerPolicy` → name `kotlinskidev-cwagent-role` → Create role
3. EC2 console → instance → Actions → Security → Modify IAM role → select the new role → Update

## Part 4 — Install the CloudWatch agent

Via EC2 Instance Connect (browser terminal, no local SSH key needed):

```bash
sudo apt update
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

## Part 5 — Minimal agent config (hand-written, not the wizard)

The interactive wizard's "advanced" preset can silently exceed the free 10-metric quota. This config publishes exactly 3 custom metrics and ships only `syslog`:

```bash
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json > /dev/null << 'EOF'
{
  "agent": { "metrics_collection_interval": 300 },
  "metrics": {
    "append_dimensions": { "InstanceId": "${aws:InstanceId}" },
    "metrics_collected": {
      "mem": { "measurement": ["mem_used_percent"] },
      "swap": { "measurement": ["swap_used_percent"] },
      "disk": { "measurement": ["disk_used_percent"], "resources": ["/"] }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "kotlinskidev-syslog",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          }
        ]
      }
    }
  }
}
EOF
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status
```

`retention_in_days: 14` keeps log storage bounded so it doesn't creep toward the 5GB free limit over time.

## Part 6 — Swap

**Already satisfied — no action needed.** CloudPanel provisioned 4GiB of swap by default; confirmed present 2026-07-30 via `free -h`. Do not create an additional swapfile.

## Part 7 — Persistent kernel/OOM logs

Default journald storage is volatile and doesn't survive a reboot — this is why root cause couldn't be confirmed after the 2026-07-28 incident's fix. Make it persistent:

```bash
sudo mkdir -p /var/log/journal
sudo sed -i 's/#Storage=auto/Storage=persistent/' /etc/systemd/journald.conf
sudo systemctl restart systemd-journald
```

After this, `journalctl -k -b -1 | grep -i oom` will actually have data after any future crash.

## Part 8 — Memory & disk alarms (reuses the agent's metrics, 0 new metrics)

1. CloudWatch → Alarms → Create alarm → Custom Namespaces → `CWAgent` → by InstanceId → `mem_used_percent`
2. Statistic Average, period 5 min, threshold >85 for 3 consecutive periods (15 min sustained — avoids alerting on brief spikes)
3. Notification → `kotlinskidev-alerts` → name `kotlinskidev-high-memory` → Create
4. Repeat for `disk_used_percent` (resource `/`), same threshold, name `kotlinskidev-high-disk`

Given swap was already ~18% used at rest, also worth watching `swap_used_percent` manually for the first week or two to see if it climbs — that would confirm the thrashing theory above.

## Part 9 — Catch an OOM kill the moment it happens

1. CloudWatch → Log groups → `kotlinskidev-syslog` → Metric filters → Create metric filter
2. Pattern: `?"Out of memory" ?"Killed process"`
3. Namespace `kotlinskidev-custom`, metric name `OOMKillEvents`, value `1`
4. Alarm: ≥1 for 1/1 datapoint (rare + critical — alert immediately, don't wait for a sustained pattern)
5. Notification → `kotlinskidev-alerts` → name `kotlinskidev-oom-kill-detected`

## Part 10 — Reclaim memory from unused PHP-FPM stacks (the actual fix, not just monitoring)

This is the highest-leverage item on this page given the server facts above — a ~914MiB box is running 10 concurrent PHP-FPM version stacks when it needs one.

**Confirmed 2026-07-30 via cp.kotlinskidev.com (CloudPanel admin):**
- Active PHP version for kotlinskidev.com: **PHP 8.4** (the only site on this server — confirmed no other sites hosted here, so every other version is safe to remove).
- `memory_limit: 512MB` per script — on a 914MiB box, worth noting as a contributing risk factor (two workers simultaneously near this limit alone approach total RAM), though not changed here since lowering it risks breaking legitimate large operations (media uploads, image processing).

1. List all PHP-FPM systemd units and verify each one's config path before touching anything (don't assume names — the CloudPanel-internal pool at `/home/clp/services/php-fpm/` is not a site pool and must be left alone):
   ```bash
   systemctl list-units --type=service --all | grep -i fpm
   systemctl cat php7.1-fpm   # repeat per unit to confirm its config path
   ```
2. **Tier 1 — stop & disable (immediate, fully reversible):**
   ```bash
   for v in 7.1 7.2 7.3 7.4 8.0 8.1 8.2 8.3; do
     sudo systemctl stop php${v}-fpm
     sudo systemctl disable php${v}-fpm
   done
   ```
   Confirm kotlinskidev.com still loads correctly immediately after, then recheck `free -h` for the reclaimed memory.

   **Done, confirmed 2026-07-30.** All 8 units removed from `multi-user.target.wants`, and `ps aux --sort=-%mem | grep php-fpm` now shows exactly two masters (PHP 8.4 + the CloudPanel-internal pool), down from ten. A single `free -h` taken right after showed `used` up rather than down (620Mi→772Mi) — that's explained by page cache/swap churn from real site activity between snapshots (buff/cache and swap both dropped as `used` rose, consistent with the kernel reclaiming cache and pages moving back into RAM, not with the stop/disable action itself, which can only reduce usage). Trend data via the CloudWatch agent (Part 4/5) is needed for a clean read instead of single snapshots — worth prioritizing that next given usage was observed at ~84%, close to the 85% alarm threshold in Part 8.
3. **Tier 2 — fully uninstall (optional, after a few stable days on Tier 1; frees disk too, less easily reversed):**
   ```bash
   dpkg -l | grep -E '^ii\s+php(7\.[1-4]|8\.[0-3])'    # review the list first
   sudo apt purge $(dpkg -l | grep -E '^ii\s+php(7\.[1-4]|8\.[0-3])' | awk '{print $2}')
   sudo apt autoremove
   ```
4. For PHP 8.4 (the one in use), right-size `pm.max_children` in its pool config (`/etc/php/8.4/fpm/pool.d/*.conf`, or CloudPanel's managed pool file) against the real ~914MiB budget:
   ```bash
   free -h
   ps aux --sort=-%mem | grep 'pool www'   # find average worker RSS for the active pool
   ```
   Reserve ~300–400MiB for OS + nginx + MySQL, divide the remainder by average worker RSS.
5. Check MySQL isn't over-allocated for a box this size:
   ```bash
   sudo mysql -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
   ```
   Should be well under half of total RAM here (128–256MiB is typically the safe range).

## Optional last resort — this one does cost money

If, after disabling unused PHP versions and right-sizing PHP-FPM/MySQL, `mem_used_percent` (Part 8) still runs consistently high under normal load, the underlying issue is that 914MiB is genuinely small for nginx + MySQL + PHP-FPM + WordPress together. Upgrading e.g. t3.micro → t3.small (2GiB RAM) is the one change on this page that increases the AWS bill (a few dollars/month) — treat it as a last resort after the free fixes above, not a default action.

## Existing caching layers discovered (2026-07-30)

Before touching Varnish, response headers from a live page load revealed the site already has **two working caching layers**, independent of anything in this doc:

- **Cloudflare APO (Automatic Platform Optimization) for WordPress** — confirmed via `cf-cache-status: HIT`, `cf-edge-cache: cache,platform=wordpress`, and critically `server-timing: cfEdge;dur=5,cfOrigin;dur=0` — `cfOrigin;dur=0` means the request never reached the origin at all, served entirely from Cloudflare's edge in ~5ms.
- **"Super Page Cache for Cloudflare" WordPress plugin** — confirmed via `x-wp-cf-super-cache-active: 1` and `x-wp-spc-disk-cache: HIT`. Maintains a static HTML disk cache on the origin, served directly by nginx, bypassing PHP-FPM/MySQL even on a Cloudflare cache miss.

Together these mean most anonymous traffic already avoids hitting PHP-FPM entirely, via a path with no memory cost to the origin at all on a Cloudflare hit. This doesn't fully explain the 2026-07-28 incident on its own (cache coverage may not be complete — logged-in/admin/bot traffic, cache-purge windows, or WP-Cron are plausible gaps), but it's a significant existing mitigation that predates this investigation.

## Varnish Cache (third caching layer — kept as defense-in-depth)

Varnish was already installed (`varnishd`, ~85-88MB) but, when first discovered, was **not in the request path at all** — `cache_hit`/`cache_miss` both read 0 despite real traffic, meaning it was pure wasted memory. Given the discovery above, it's genuinely redundant with Cloudflare APO + the Super Page Cache plugin (which are more effective anyway, since a Cloudflare hit costs the origin nothing). **Decision: keep it enabled anyway as a third layer of defense-in-depth**, accepting the ~85-88MB memory cost, in case Cloudflare's cache is purged or the plugin's disk cache has an issue.

**Bugs found and fixed while enabling it via CloudPanel (cp.kotlinskidev.com → Sites → kotlinskidev.com → Varnish Cache):**

1. **Missing directory blocked enabling entirely** — CloudPanel's enable action failed with a cryptic error (`readlink -f '/home/kotlinskidev/.varnish-cache/settings.json'` failing, empty error message). Root cause: `/home/kotlinskidev/.varnish-cache/` didn't exist on disk. Fixed:
   ```bash
   sudo mkdir -p /home/kotlinskidev/.varnish-cache
   sudo chown kotlinskidev:kotlinskidev /home/kotlinskidev/.varnish-cache
   sudo chmod 755 /home/kotlinskidev/.varnish-cache
   ```
2. **Saving settings and toggling "Enabled" are separate actions** in the CloudPanel UI — editing the Excludes/Cache Lifetime fields and clicking Save does not by itself flip `enabled: true`. The toggle switch itself needs to be explicitly clicked to "On".
3. **Toggling Enabled reset the Excludes field to empty** — had to re-enter the WordPress-specific excludes after enabling, not before.
4. **The wp-login exclude needed to target the actual file, not a directory** — `^/admin/` (the CloudPanel default) doesn't match WordPress's `/wp-admin/` at all; `/wp-login/` (a directory-style pattern) doesn't match the real file `/wp-login.php`. Working pattern: `\/wp-login.php` (matches as a substring, no anchor needed).

**Final working config** (`/home/kotlinskidev/.varnish-cache/settings.json`):
```json
{
    "enabled": true,
    "server": "127.0.0.1:6081",
    "cacheLifetime": "604800",
    "excludes": ["^\/wp-admin\/", "\/wp-login.php"],
    "excludedParams": ["__SID", "noCache"]
}
```

**Verification gotcha worth remembering:** testing cache hits in a browser where you're logged into `/wp-admin/` will always show misses — WordPress's `wordpress_logged_in_*` cookie correctly makes Varnish bypass the cache for that session (needed so admin/personalized content never gets cached or served to the wrong visitor). This is correct behavior, not a bug. Test with a fresh incognito window (or curl, though this domain's Cloudflare/WAF blocks curl's default User-Agent with a `403` — use a real browser for testing instead). Also note Varnish's cache is shared across all visitors, not per-session — reopening a fresh incognito window can show immediate hits for already-cached static assets from earlier testing, which is expected.

**Note for future memory pressure:** Varnish is the one piece of this setup that's a net memory cost (~85-88MB, constantly) rather than a fix — it was kept as defense-in-depth, not because it's essential. The actual protection against a repeat of the 2026-07-28 incident is the `pm.max_children` fix (Part 10) plus the pre-existing Cloudflare APO + Super Page Cache plugin layers, none of which depend on Varnish. **If memory pressure becomes an issue again, disabling Varnish and relying solely on the Cloudflare/plugin caching layer is the first thing to try** — it reclaims ~85-88MB with the least disruption of anything on this page, since the other two caching layers stay fully intact without it:
```bash
sudo systemctl stop varnish
sudo systemctl disable varnish
```
(Or toggle it off via CloudPanel → Sites → kotlinskidev.com → Varnish Cache.)

## Status

- [ ] Part 0 — AWS Budget alert
- [ ] Part 1 — SNS topic
- [ ] Part 2 — Status check alarms (System→Recover, Instance→Reboot)
- [ ] Part 3 — IAM role for CloudWatch agent
- [ ] Part 4/5 — CloudWatch agent installed + minimal config
- [x] Part 6 — Swap — already present (4GiB, CloudPanel default), confirmed 2026-07-30
- [ ] Part 7 — Persistent journald logging
- [ ] Part 8 — Memory/disk alarms
- [ ] Part 9 — OOM log metric filter + alarm
- [x] Part 10, Tier 1 — Unused PHP-FPM versions (7.1–8.3) stopped and disabled, confirmed 2026-07-30
- [ ] Part 10, remaining — right-size `pm.max_children` for PHP 8.4, check MySQL buffer pool, optional Tier 2 `apt purge`
