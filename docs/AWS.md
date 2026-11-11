# AWS

Source of truth for the AWS side of `kotlinskidev.com`. Every AWS value below was read from the live account through the AWS API MCP on **2026-11-11**. Settings inside the server (operating system, Apache, PHP, database) are marked as such and come from SSH sessions. Update this file in the same change as any console, API or server edit, and refresh the date.

Each section has two parts: **How it works** explains the feature in plain terms, and **Our setting** records what is configured and why.

This repo is public. Never write IP addresses, account IDs, access keys or private key contents into this file.

## The big picture

The whole site runs on one small virtual server in AWS Lightsail in Frankfurt. Visitors never reach it directly: Cloudflare sits in front, and the server's firewall only lets Cloudflare in. AWS adds the pieces around the server: a fixed IP address, the firewall, disk snapshots, alarms, and the cost budget.

```text
visitor -> Cloudflare -> Lightsail firewall (Cloudflare IPs only) -> Apache + PHP + WordPress + database (one instance)
                                                                     ^ alarms, snapshots, budget around it
```

## At a glance

| Area | State |
| --- | --- |
| Instance | `Kotlinskidev-wordpress`, bundle `micro_3_0` (2 vCPU burstable, 1 GB RAM, 40 GB SSD, 2 TB transfer), running since 2026-09-15 |
| Region | `eu-central-1` (Frankfurt) |
| Network | Static IP attached, dual-stack (IPv4 and IPv6), firewall: 443 Cloudflare only (port 80 closed), 22 admin IP plus Lightsail browser SSH |
| Origin hardening | Cloudflare Origin CA cert, Authenticated Origin Pulls enforced, `mod_remoteip`, IMDSv2 required |
| Server software | Debian 12.15, auto security updates on, key-only SSH without root login, PHP 8.2 limits tightened, MariaDB cache 128 MB, system cron for WordPress |
| Backups | 1 manual snapshot (2026-11-08). Automatic snapshots off on purpose (paid) |
| Monitoring | 3 Lightsail alarms (CPU, burst capacity, status check) and 2 CloudWatch alarms (memory, disk), email alerts. Details in `docs/monitoring.md` |
| Load (last 14 days) | CPU avg 1.2 %, max 76.7 %; burst capacity never below 82.5 %; memory avg 29.6 %, max 42.7 %; disk max 12.9 % |
| Cost control | Budget $15 per month (alerts at 85 % and 100 % actual, 100 % forecast), Cost Anomaly Detection daily email |
| Account security | Root MFA on, no root access keys, unused IAM user disabled, S3 Block Public Access on for the account, IAM Access Analyzer on, no CloudTrail trail, GuardDuty off |
| Leftovers | EC2 migration leftovers deleted on 2026-11-11, except 2 empty log groups in `eu-north-1` |

## Instance

**How it works:** Lightsail is AWS's simple virtual server product: a fixed monthly price that includes CPU, memory, disk and data transfer. A *bundle* is the size. *Burstable* CPU means the server normally runs at a low baseline and saves up credits (*burst capacity*) while idle. It spends them when a spike of work arrives. If the credits run out, the CPU slows to the baseline. A *blueprint* is the starting image the server was created from.

**Our setting:**

- Instance `Kotlinskidev-wordpress`, blueprint `wordpress_ls_1_0` (AWS's own WordPress image, not Bitnami), bundle `micro_3_0`: 2 vCPU, 1 GB RAM, 40 GB SSD, 2 TB monthly transfer.
- Debian with Apache 2.4 and mod_php 8.2. The WordPress root is `/var/www/html`, and `wp-config.php` sits one level up.
- The size fits the load. Over 14 days the CPU averaged 1.2 % and burst capacity never dropped below 82.5 %. Memory peaked at 42.7 % and the disk is 13 % full. An upgrade is not needed. Recheck these numbers after a traffic jump or a new heavy plugin.
- Cloudflare caches most HTML at the edge, which is the main reason a 1 GB server is enough.

## Network and firewall

**How it works:** The Lightsail firewall decides which addresses may connect on which port, before a request reaches the server. It is the only network filter here: Lightsail has no EC2 security groups. A *static IP* is a fixed public address that stays the same when the instance is stopped or replaced. Without it, the address would change and Cloudflare would point at nothing. *Dual-stack* means the instance has both an IPv4 and an IPv6 address.

**Our setting:**

| Port | Allowed from | Why |
| --- | --- | --- |
| 443 (HTTPS) | Cloudflare's 15 IPv4 and 7 IPv6 ranges | the only real traffic path |
| 22 (SSH) | the admin's home IP plus the Lightsail browser-SSH aliases | admin access only |

- Static IP `kotlinskidev-static-ip`, attached to the instance. Its address is in the Lightsail console. Keep it attached: an unattached static IP costs money and Cloudflare would lose the origin.
- The ranges for 443 were applied on 2026-11-10 with `PutInstancePublicPorts`. Port 80 was closed on 2026-11-11: Cloudflare connects to the origin on 443 in Full (strict), and Cloudflare's Always Use HTTPS redirects `http://` visitors at the edge, so port 80 had no use. To reopen it, resend all rules with port 80 added and the same Cloudflare ranges. That call replaces every rule at once, so always resend port 22 unchanged in the same call.
- Cloudflare's ranges change rarely. Compare <https://www.cloudflare.com/ips-v4> and <https://www.cloudflare.com/ips-v6> with the firewall a few times a year. A stale list blocks new Cloudflare addresses and causes 522 errors (see `docs/522.md`). Update `/etc/apache2/cloudflare-ips.txt` on the server at the same time.
- When the home IP changes, SSH stops working until the port 22 rule is updated. Lightsail's browser SSH in the console still works, because its ranges are allowed by the aliases.

## SSH access

**How it works:** SSH is the encrypted remote terminal used to manage the server. Access is by key file, not password. Restricting port 22 to one IP means scanners on the internet cannot even try to log in.

**Our setting:**

- User `admin`, key `LightsailDefaultKey-eu-central-1.pem` (on the admin's computer only).
- Port 22 is limited to the admin's home IP and Lightsail browser SSH.
- Verified 2026-11-11: password login off, keyboard-interactive login off, key login on. Root login was `without-password` and was switched off the same day (`PermitRootLogin no` in `/etc/ssh/sshd_config.d/00-root-login.conf`). Rollback: delete that file and run `sudo systemctl reload ssh`.

## TLS on the origin

**How it works:** Cloudflare encrypts the connection to the server too. The server shows a certificate to prove who it is, and in **Full (strict)** mode Cloudflare refuses to connect if that certificate is invalid. A *Cloudflare Origin CA* certificate is free and long-lived, but only Cloudflare trusts it, so a browser that goes straight to the IP shows a warning. That is fine because nobody should go there.

**Our setting:**

- Cloudflare Origin CA certificate, valid 15 years, at `/etc/ssl/certs/cloudflare-origin.pem` and `/etc/ssl/private/cloudflare-origin.key`, used by `/etc/apache2/sites-enabled/default-ssl.conf`.
- An expired or missing certificate takes the site down. Renewal is not needed for years, and no port 80 challenge is involved.
- Apache also requires Cloudflare's client certificate (Authenticated Origin Pulls) and restores visitor IPs with `mod_remoteip`. Both are described in `docs/cloudflare.md` → Origin protection.
- `sites-enabled/default-ssl.conf` is a separate copy, not a symlink to `sites-available`. Apache loads the `sites-enabled` file, so edit that one.

## Instance metadata

**How it works:** Every AWS server has a local address (the *metadata service*) that hands out details about itself, and sometimes credentials. A common attack tricks a web app into fetching that address. **IMDSv2** requires a session token first, which blocks this trick.

**Our setting:** IMDSv2 is required (`httpTokens: required`), hop limit 2, IPv6 endpoint off. No change needed.

## Backups

**How it works:** A *snapshot* is a full copy of the server's disk at one moment. From it you can create a new, identical server within minutes, for example after a bad update or a hack. *Automatic snapshots* take one every day at a set time and keep the last 7. Snapshots are stored by AWS separately from the server, so a broken server does not take them with it.

**Our setting:**

- Manual snapshot `Kotlinskidev-wordpress-1794127233` (2026-11-08, 40 GB, available).
- Automatic snapshots are **off on purpose**: they cost about $2 per month, and the rule for this account is no extra spend. The trade-off is that a problem found today can only be rolled back to the last manual snapshot. Take a manual snapshot in the console before any risky change (PHP or WordPress upgrade, server config edit), and delete old manual snapshots afterwards, because each one is also billed for its storage.
- WordPress-level exports (for example All-in-One WP Migration) and the Local workflow are in `docs/backups.md`.

## Monitoring and alerts

**How it works:** An *alarm* watches one number, such as CPU or memory use, and sends an email when it crosses a limit. Lightsail measures CPU, burst capacity, network and status checks by itself. Memory and disk use are only visible from inside the server, so the **CloudWatch Agent** runs on it and reports them. A *status check* tests whether the server and the AWS hardware under it respond at all.

**Our setting:** 5 alarms, all free (Lightsail alarms cost nothing, and the 2 CloudWatch alarms are inside the free tier of 10). Every alarm, its thresholds and what to do when it fires are in `docs/monitoring.md`.

- Lightsail alarms email the verified Lightsail contact method. CloudWatch alarms notify the SNS topic `kotlinskidev-lightsail-alerts`. That topic had no subscriber until 2026-11-11, so the memory and disk alarms never emailed anyone before. An email subscription was added that day and must be confirmed from the inbox.
- The CloudWatch Agent authenticates with a dedicated IAM user that has only `CloudWatchAgentServerPolicy`, because Lightsail instances cannot use IAM roles.
- Lightsail has no automatic reboot or recovery. The fix is a manual restart after an alert. Cloudflare's Passive Origin Monitoring also emails when the origin stops answering (see `docs/cloudflare.md`).

## Cost and budget

**How it works:** An AWS Budget compares the month's spending with a limit and emails when actual or forecast spending crosses a threshold. It catches forgotten resources and unexpected bills. **Cost Anomaly Detection** is free and learns the normal daily spend per service, then emails when one suddenly jumps, which catches problems long before a monthly budget would.

**Our setting:**

- Budget `My Monthly Cost Budget`: $15 per month. Alerts at 85 % and 100 % of actual spend, and at 100 % of forecast.
- Cost Anomaly Detection: AWS's default monitor `Default-Services-Monitor` with a daily email summary (`Default-Services-Subscription`).
- Expected spend is about $7 for the instance plus a little for the manual snapshot. Account rule: add only features that cost nothing.

## Account security

**How it works:** The *root* user owns the AWS account and can do anything, so it needs MFA (a second login factor) and should never have access keys. *IAM users* are separate logins with limited permissions. An *access key* lets a program act as that user. Unused keys and broad permissions are the most common way AWS accounts get taken over. **S3 Block Public Access** at account level stops any storage bucket from being made public by mistake. **IAM Access Analyzer** (external access) is free and reports any resource that is shared with someone outside the account. **CloudTrail** records who did what in the account. The last 90 days are always visible for free in Event history, and a *trail* keeps the records longer. **GuardDuty** is a paid threat-detection service.

**Our setting:**

- Root: MFA on, no access keys.
- IAM users: 2.
  - The CloudWatch Agent user described above, which is needed.
  - A developer user from an old Lambda/SAM project, with very broad permissions. On 2026-11-11 its access key was set to **inactive** and its console password was removed. Both steps are reversible. Reactivate the key in IAM if a VS Code SAM deploy needs it again. Delete the user once nothing has needed it for a while.
- S3 Block Public Access: on for the whole account since 2026-11-11. The 2 SAM deployment buckets were already private.
- IAM Access Analyzer: analyzer `kotlinskidev-external-access` (account scope, `eu-central-1`) since 2026-11-11. Check its findings in the IAM console now and then.
- CloudTrail: no trail, on purpose (a trail stores logs in S3, which costs a little). Only the free 90-day Event history exists.
- GuardDuty: off. It is a paid service and covers EC2 much better than Lightsail.

## Leftovers from the EC2 migration

**How it works:** Deleting a server does not delete what was created around it. Alarms, notification topics, disk snapshots and roles stay, and some of them cost money.

**Our setting:** The old EC2 instance in `eu-north-1` (Stockholm) is terminated. On 2026-11-11 its 3 CloudWatch alarms, 2 SNS topics, the 15 GB EBS snapshot and the IAM role `kotlinskidev-cwagent-role` (with its instance profile) were deleted. Two empty log groups remain, `kotlinskidev-syslog` and `kotlinskidev-syslog-memory`. They hold 0 bytes and cost nothing, and can be deleted in the CloudWatch console (Stockholm region).

## Server (operating system and software)

**How it works:** AWS manages the hardware and the network. Everything inside the server is our job: operating system updates, the web server, PHP, the database and WordPress. Small settings here decide whether a 1 GB server stays fast and safe. Everything below was checked over SSH on 2026-11-11.

**Our setting:**

| Part | State | Why |
| --- | --- | --- |
| Operating system | Debian 12.15, `unattended-upgrades` enabled, 0 packages waiting | security patches install by themselves |
| Memory | 945 MiB RAM, 649 MiB swap, about 400 MiB available | swap stops a short memory spike from crashing the server |
| Monitoring agent | `amazon-cloudwatch-agent` active | feeds the memory and disk alarms |
| PHP | 8.2.35 as `mod_php`, `expose_php` off, OPcache on (128 MB, default) | OPcache keeps compiled PHP in memory so pages build faster |
| Apache | `ServerTokens Prod`, `ServerSignature Off` | Apache stops advertising its version |
| Database | MariaDB 10.11.19, 173 MB of data, InnoDB buffer pool 128 MB | the cache holds the hot part of the database in RAM |
| WordPress cron | system cron every 5 minutes | scheduled tasks no longer wait for visitors |
| Outgoing network | prefers IPv4 (`/etc/gai.conf`) | Cloudflare's IP Access rule for the server matches the IPv4 static IP only |
| Cache warming | Node 18, `/etc/cron.d/kotlinskidev-cache-warm` | nightly full warm plus a 5-minute purge check, see `docs/cache-warming.md` |

**PHP limits.** Lightsail's own files set `memory_limit` to 512M and the main `php.ini` allowed 512M uploads. On a 1 GB server a few heavy requests could use most of the RAM, and a huge upload limit helps abusers. `/etc/php/8.2/apache2/conf.d/99-kotlinskidev.ini` overrides them: `memory_limit = 256M`, `upload_max_filesize = 64M`, `post_max_size = 64M`. The biggest file in the Media Library is 10.1 MB. To restore a large site backup, remove that file temporarily, restore, then put it back. Rollback: `sudo rm /etc/php/8.2/apache2/conf.d/99-kotlinskidev.ini && sudo systemctl reload apache2`.

**Apache version hiding.** `/etc/apache2/conf-available/zz-hide-version.conf` (enabled with `a2enconf`) loads after Debian's `security.conf`, so it wins. Rollback: `sudo a2disconf zz-hide-version && sudo systemctl reload apache2`.

**Database cache.** The buffer pool was 16 MB for a 173 MB database, and about 13 % of reads missed the cache and went to disk (a healthy site is under 1 %). `/etc/mysql/mariadb.conf.d/99-kotlinskidev.cnf` sets `innodb_buffer_pool_size = 128M`, which adds about 112 MB of RAM use. Recheck the memory alarm after a few days. Rollback: delete that file and run `sudo mysql -e "SET GLOBAL innodb_buffer_pool_size = 16777216;"`.

**WordPress cron.** By default WordPress runs its scheduled tasks only when a visitor loads an uncached page. Cloudflare serves most pages from its cache, so tasks ran late: Complianz, Wordfence, Action Scheduler and Yoast jobs were all overdue. The `cron` package was installed and `/etc/cron.d/wordpress-cron` runs `wp cron event run --due-now` every 5 minutes as `www-data`, wrapped in `flock` so runs never overlap. The first manual run executed 49 waiting events in 40 seconds, and later runs take about 30 seconds while the backlog (mostly Yoast indexing) drains. WordPress's own visit-triggered cron is still on and harmless. Check the log with `sudo journalctl -u cron --since "30 min ago" --no-pager | tail`. Rollback: `sudo rm /etc/cron.d/wordpress-cron`.

## Not used, and why

| Feature | Why not |
| --- | --- |
| Lightsail CDN distribution | Cloudflare already caches and protects the site |
| Lightsail load balancer | one server, and it costs about $18 per month |
| Lightsail managed database | about $15 per month, and the 1 GB server has spare memory |
| Lightsail container service | the site is a classic WordPress install |
| GuardDuty | paid, and weak coverage for Lightsail |
| EC2 security groups | not available for Lightsail; the Lightsail firewall does this job |

## Open items

Ranked by value. Move an item into the sections above when it is done.

1. In a few days check that the cron run time has dropped (`journalctl -u cron`, session open to close) and that the memory and burst-capacity alarms stayed quiet after the database cache change.
2. Delete the disabled developer IAM user once it is confirmed unneeded.
3. Delete the 2 empty log groups in `eu-north-1`.
4. Paid, only if the no-extra-cost rule changes: automatic snapshots (about $2 per month), a CloudTrail trail (cents per month).

## Verify

```bash
curl --resolve kotlinskidev.com:443:<STATIC_IP> -m 8 https://kotlinskidev.com/
curl -s -o /dev/null -w "%{http_code}\n" https://kotlinskidev.com/
```

`<STATIC_IP>` is the address of `kotlinskidev-static-ip` from the Lightsail console. The first command must time out (firewall), and the second must return 200 through Cloudflare. In the Lightsail console, all alarms should show `OK` and the instance metrics should match the load numbers above.

## Emergency: Cloudflare is down

1. In the Lightsail firewall, temporarily allow 443 from anywhere.
2. On the server, set `SSLVerifyClient optional` in `/etc/apache2/aop-client-auth.conf` and reload Apache. Direct visitors have no Cloudflare client certificate.
3. Point DNS straight at the static IP if Cloudflare DNS is also affected.
4. Revert all of it once Cloudflare is back.
