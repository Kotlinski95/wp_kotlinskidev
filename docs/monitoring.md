# Monitoring and alerts

How production is watched and who gets told when something breaks. Every AWS value was read from the live account through the AWS API MCP on **2026-11-11**. Hosting facts are in `docs/AWS.md`, and the Cloudflare side is in `docs/cloudflare.md`.

Rule for this setup: every check must stay free. All alarms below are free (Lightsail alarms cost nothing, and CloudWatch includes 10 alarms and 10 custom metrics per month in its free tier).

## How it works

Three layers watch the site:

1. **Lightsail metrics** are collected by AWS from outside the server: CPU, burst capacity, network and status checks. No setup needed.
2. **The CloudWatch Agent** runs inside the server and reports what AWS cannot see from outside: memory and disk use.
3. **Cloudflare** sees every request, so it notices when the server stops answering, even if AWS thinks the server is healthy.

An *alarm* watches one of these numbers and sends an email when it stays past a limit for a few checks in a row. Waiting for several checks avoids alerts for a single short spike.

```text
Lightsail metrics ----> Lightsail alarms ----------------> email (Lightsail contact method)
CloudWatch Agent -----> CloudWatch alarms -> SNS topic --> email (subscription)
Cloudflare edge ------> Cloudflare notifications --------> email (Cloudflare account)
```

## Alarms

| Alarm | Watches | Fires when | Checks |
| --- | --- | --- | --- |
| `kotlinskidev-lightsail-status-check-failed` | Lightsail `StatusCheckFailed` | any failure | 2 of 2, 5 min each |
| `kotlinskidev-lightsail-low-burst-capacity` | Lightsail `BurstCapacityPercentage` | below 20 % | 3 of 3, 5 min each; also emails when it recovers |
| `kotlinskidev-lightsail-high-cpu` | Lightsail `CPUUtilization` | above 80 % | 3 of 3, 5 min each |
| `kotlinskidev-lightsail-high-memory` | CloudWatch `CWAgent` `mem_used_percent` | above 85 %, or no data | 3 of 3, 5 min average |
| `kotlinskidev-lightsail-high-disk` | CloudWatch `CWAgent` `disk_used_percent` on `/` | above 85 % | 3 of 3, 5 min average |

- **Burst capacity** was added on 2026-11-11. The server's CPU is burstable: it saves credits while idle and spends them on spikes. Short CPU spikes are normal, but when the credits run out the CPU drops to its slow baseline and the whole site gets slow. This alarm catches that moment better than the CPU alarm.
- **Memory alarm with missing data** was changed on 2026-11-11 to treat missing data as a breach. If the CloudWatch Agent stops reporting (crashed, credentials expired), this alarm now fires instead of staying silent. An email for "high memory" can therefore also mean "the agent stopped".
- **Notifications:** Lightsail alarms email the verified Lightsail contact method. CloudWatch alarms go to the SNS topic `kotlinskidev-lightsail-alerts`. That topic had no subscriber until 2026-11-11, so the memory and disk alarms never emailed anyone before. An email subscription was added that day. It works only after the link in the confirmation email is clicked.

## Cloudflare checks

Set up in Cloudflare (see `docs/cloudflare.md` → Analytics and observability), also free:

- **Passive Origin Monitoring:** emails when Cloudflare cannot reach the server. This is the closest thing to an uptime check.
- **HTTP DDoS attack alert** and **Universal SSL alert**.
- **Web Analytics (RUM):** real visitors' page speed, useful to spot a slow server before an alarm fires.

## CloudWatch Agent

- Config: `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`.
- Reports 2 custom metrics in namespace `CWAgent`, `eu-central-1`: `mem_used_percent` (no dimensions) and `disk_used_percent` (dimensions `path=/`, `device`, `fstype`). This is well inside the free 10.
- Authenticates with the IAM user `lightsail-cloudwatch-agent` (policy `CloudWatchAgentServerPolicy` only). The key is in `/root/.aws/credentials`, profile `AmazonCloudWatchAgent`. Lightsail instances cannot use IAM roles, so a user key is the only option. If the key is ever rotated, update that file and restart the agent.
- Check on the server: `systemctl is-active amazon-cloudwatch-agent` should print `active`.

## Recent load

Last 14 days before 2026-11-11: CPU average 1.2 %, peak 76.7 %; burst capacity never below 82.5 %; memory average 29.6 %, peak 42.7 %; disk peak 12.9 %. The 1 GB server has plenty of headroom, mostly because Cloudflare serves cached pages without touching it.

## When an alarm fires

1. **Status check failed:** open the Lightsail console. If the instance does not respond, use **Reboot**. If it stays broken, create a new instance from the latest snapshot and move the static IP to it.
2. **Low burst capacity or high CPU:** check what is busy: `top` on the server, and Cloudflare Analytics for a traffic spike or a bot. Look for a cache purge, a WP-Cron job or a plugin running in a loop. If traffic is legitimate and lasts, consider a bigger bundle (costs money).
3. **High memory:** run `free -h` and `ps aux --sort=-%mem | head`. If the agent stopped instead (no data), restart it with `sudo systemctl restart amazon-cloudwatch-agent`.
4. **High disk:** run `sudo du -xh / --max-depth=2 | sort -h | tail` and look at `/var/log`, the database and `wp-content/uploads`. Old backups from plugins are a common cause.
5. **Cloudflare origin unreachable:** check the Lightsail firewall against Cloudflare's current IP ranges first (stale ranges cause 522 errors, see `docs/522.md`), then the instance itself.

## Contact form mail failure alerts

The Gmail mailer can stop working without any error on the site (an expired OAuth token gives `invalid_grant`), and WP Mail SMTP's own alerts would use the same broken mailer. The theme therefore sends a push notification over ntfy.sh, which does not depend on mail. The code is `functions/mail-failure-alerts.php` in the theme.

**Setup:**

1. Install the ntfy app on your phone.
2. Choose a long random topic name, for example 30 random characters, and subscribe to it in the app. Treat the name like a password.
3. In wp-admin open Settings, then the Error Monitoring tab, and paste `https://ntfy.sh/<topic>` into **ntfy topic URL** under Alerts. Only `https` addresses on `ntfy.sh` are accepted.

**What triggers an alert:** a failure reported by WordPress (`wp_mail_failed`), or the contact form getting `false` from `wp_mail`. The message holds only the site host, the UTC time and a short error text. Visitor details, email addresses and the topic URL are never sent.

**Throttle:** at most one alert per 30 minutes for the same error. The next alert after that window says how many were held back.

**Weekly check:** once a week the site sends a tiny mail to the admin address with the subject `[kotlinskidev] Weekly mail check`. If that send fails, the normal alert fires, so a broken token is noticed within a week even when nobody uses the contact form.

**Turn it off:** empty the field. Alerts stop and the weekly check is unscheduled on the next page load.

## Contact form attachments

The contact form block has an **Allow file attachments** toggle in the Inspector (off by default). When it is on, visitors can attach files that are emailed to the admin address and not kept on the website.

- **Limits:** 3 files, 10 MB in total, 8 MB per file, names cut to 100 characters. Change them with the `kotlinskidev_contact_attachment_limits` filter.
- **Allowed types:** pdf, doc, docx, odt, rtf, txt, png, jpg, jpeg, zip. Macro-enabled Office files, scripts, executables, HTML/SVG, disk images and names with a blocked double extension are refused. Content is checked by real type and file signature, never by name alone. A docx or odt with macros or more than 500 entries is refused, and a plain zip is never opened.
- **Where files live:** uploads are moved to a random-named file in `../kotlinskidev-private/contact-attachments` next to the WordPress folder when it is writable, otherwise in the system temp folder (override with the `kotlinskidev_contact_attachment_dir` filter). They are deleted right after the email is sent.
- **Failed sends:** if `wp_mail` fails, the files are kept in `retained/<submission id>/` for 7 days and an ntfy alert says so. A daily wp-cron event deletes older files. Fetch them over SFTP; the site has no download link.
- **Rate limit:** 5 submissions with attachments per 10 minutes per visitor, keyed by a hash of the IP address.
- **PHP settings needed:** `upload_max_filesize` of at least 8M and `post_max_size` of at least 12M. Lower values make PHP drop the upload and the form shows a "too large" message.
- **Request size limit:** Cloudflare's free plan cannot filter by request size (`http.request.body.size` needs a paid WAF plan), so the limit lives in Apache. In the HTTPS vhost (`/etc/apache2/sites-enabled/default-ssl.conf`) add `<Location "/wp-admin/admin-post.php">` with `LimitRequestBody 12582912` inside, then run `sudo apachectl configtest && sudo systemctl reload apache2`. Apache then answers 413 right after reading the headers, so an oversized upload never ties up one of the 5 workers. Check it with `head -c 13000000 /dev/zero | curl -s -o /dev/null -w "%{http_code}\n" -X POST --data-binary @- https://kotlinskidev.com/wp-admin/admin-post.php`, which should print `413`.
- **Turn it off:** switch the toggle off on the form. Without the toggle the server ignores any files sent to the form.

## Free improvements still open

- Confirm the SNS email subscription (see above).
- Add `swap_used_percent` to the agent config. It is one more free custom metric, and swap climbing is the early warning for the memory problem behind the 2026-07-28 incident.
- Make journald logs persistent (`Storage=persistent` in `/etc/systemd/journald.conf`), so the cause of a crash can still be read after a reboot. Not verified on the Lightsail server yet.

## History

This file used to describe monitoring for the old EC2 instance (CloudPanel, nginx, several PHP-FPM versions and Varnish). That server was replaced by Lightsail on 2026-09-15 (see `docs/lightsail-migration.md`) and terminated, and its alarms, topics, snapshot and IAM role were deleted on 2026-11-11. The old guide is in git history. One lesson carries over from the 2026-07-28 outage (`docs/522.md`): on a 1 GB server, memory pressure and swapping make the server stop answering Cloudflare long before anything crashes, so watch memory and swap, not only CPU.
