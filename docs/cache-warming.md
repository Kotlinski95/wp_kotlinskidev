# Cache warming

Keeps every page and its media in Cloudflare's cache, so visitors never wait for the server to build a page. The script is `scripts/cache-warm.mjs` (Node 18 or newer, no dependencies).

Related docs: `docs/cloudflare.md` (cache and Bot Fight Mode), `docs/AWS.md` (the server).

This repo is public. Never write the server IP into this file.

## How it works

Cloudflare keeps copies of pages and files in data centers around the world. The first visitor to a data center after a **purge** (clearing the cache) finds nothing there and waits while WordPress builds the page on the 1 GB server. Everyone after that gets the copy in a few milliseconds. Warming means requesting every page and file ourselves right after a purge, so real visitors are never the first.

Two limits are worth knowing:

- **Cloudflare caches per data center.** A script on the server warms the Frankfurt data center and Cloudflare's upper cache tier. A Warsaw visitor's first request then comes from the upper tier and not from the server, which is fast but not instant. Running the script on your own computer warms Warsaw directly.
- **Warming only helps content that is cached.** Pages for logged-in users and `wp-admin` are never cached, by design.

```text
sitemap_index.xml -> every page URL (PL and EN) -> each page HTML -> every image, video, script, stylesheet, font it uses
                                                               -> stylesheets are read too, for fonts and background images
```

## What the script does

- Reads `sitemap_index.xml` (Yoast), requests every page, then follows `hreflang` links for language versions the sitemap misses.
- Reads each page's HTML and requests every same-site file under `/wp-content/` and `/wp-includes/`: images (including every `srcset` size), videos, 3D models, scripts, stylesheets, fonts. It also reads the stylesheets for `url(...)` references.
- Is gentle on the server: pages are requested 2 at a time with a 300 ms pause, because after a purge every page is a cache miss and costs PHP time. Files are fetched 2 at a time (the same as `--workers`; it was 6 until 2026-11-12, which could queue behind Apache's 5 workers and slow real visitors during a warm run).
- Prints one summary per run: how many requests were `HIT` (already cached) and `MISS` (just warmed), the data volume, and the slowest request.

Modes:

| Mode | Use |
| --- | --- |
| `--mode full` (default) | warm everything now |
| `--mode check` | requests only the homepage, and runs a full warm only if the cache was purged since the last run |

How `check` notices a purge: it reads the homepage's `cf-cache-status` and `age`. If the status is not `HIT`, or the cached copy is younger than the last full run, something purged the cache (the Super Page Cache plugin, a deploy, or the dashboard) and it runs the full warm. This needs no plugin hook, so every kind of purge is covered.

Options: `--base <url>`, `--workers <n>` (pages, default 2), `--delay <ms>` (default 300), `--limit <n>` (first n pages only, for tests), `--no-state` (do not record the run).

## Why the server needs a Cloudflare exception

Cloudflare's Bot Fight Mode challenges requests that come from data centers, and the server's own requests are among them. On 2026-11-11 the security events showed Bot Fight Mode challenging the server's requests to its own pages: the Super Page Cache preloader and WordPress's `wp-cron.php` loopback calls were all challenged. That means the plugin's preloader (`cf_preloader`, `cf_preloader_start_on_purge`) has not been warming anything. The warm-up script would be blocked the same way.

Bot Fight Mode cannot be skipped by a WAF rule on the Free plan. Cloudflare's documentation says it does not trigger when an **IP Access rule** matches first. So the fix is one IP Access rule, action **Allow**, for the server's own static IP (`kotlinskidev-static-ip`, read it from the Lightsail console). The trade-off: an Allow rule makes requests from that address skip all WAF features (custom rules, rate limiting, managed rules and bot checks), not only Bot Fight Mode. The address is the origin itself and cannot be spoofed by visitors, so the risk is limited to the server being compromised, in which case the attacker already controls it.

Status: **applied 2026-11-11.** One IP Access rule, action **Allow**, this zone only, note "own origin server". The dashboard hides the "IP access rules" entry under Security → Security rules → Create rule until one rule exists, so the first rule was created through the API (token permission Zone → Firewall Services → Edit, deleted afterwards). Check it from the server:

```bash
curl -s -o /dev/null -w "%{http_code} %header{cf-cache-status}\n" https://kotlinskidev.com/
```

`200` and `HIT` mean the exception works. `403` means it does not.

### Why the server must prefer IPv4

The instance is dual-stack, and by default it called Cloudflare over IPv6. The rule covers the IPv4 static IP only, so those requests were still challenged (the security events showed an IPv6 client address). The line `precedence ::ffff:0:0/96  100` in `/etc/gai.conf` makes every program on the server prefer IPv4 for outgoing connections, so `curl`, the warm-up script, the Super Page Cache preloader and WordPress cron all match the rule. Visitors can still reach the site over IPv6, because that is decided by Cloudflare. An IPv6 rule was rejected: the address belongs to the instance and changes if the instance is recreated, while the static IP stays. Rollback: `sudo sed -i '/^precedence ::ffff:0:0\/96  100$/d' /etc/gai.conf`.

## Install on the server

Done 2026-11-11 (Debian 12, Node 18.20 from `apt`):

```bash
sudo apt-get install -y nodejs
sudo mkdir -p /var/lib/kotlinskidev-cache-warm && sudo chown www-data:www-data /var/lib/kotlinskidev-cache-warm
sudo install -o www-data -g www-data -m 644 /dev/null /var/log/kotlinskidev-cache-warm.log
```

`scripts/cache-warm.mjs` was copied to `/usr/local/bin/kotlinskidev-cache-warm.mjs` (mode 755). The script is not deployed automatically, so after changing it in the repo, copy it again. The schedule is `/etc/cron.d/kotlinskidev-cache-warm`:

```bash
NODE_NO_WARNINGS=1
0 1 * * * www-data flock -n /tmp/kotlinskidev-cache-warm.lock /usr/bin/node /usr/local/bin/kotlinskidev-cache-warm.mjs --mode full >> /var/log/kotlinskidev-cache-warm.log 2>&1
*/5 * * * * www-data flock -n /tmp/kotlinskidev-cache-warm.lock /usr/bin/node /usr/local/bin/kotlinskidev-cache-warm.mjs --mode check >> /var/log/kotlinskidev-cache-warm.log 2>&1
```

- **1 a.m. full run (server time, UTC):** refreshes everything every night, including files whose cache lifetime ran out (uploads cache for 1 week, theme files for 1 day to 1 month).
- **Every 5 minutes, check:** after any purge of the whole cache, the pages are warm again within about 5 minutes plus the run time. For an immediate warm run `sudo -u www-data NODE_NO_WARNINGS=1 node /usr/local/bin/kotlinskidev-cache-warm.mjs --mode full`.
- `flock` stops two runs from overlapping.
- The check only watches the homepage. A purge of a single page (editing one post) does not start a warm-up. That page is rebuilt by the plugin's preloader or its first visitor.
- Log: `/var/log/kotlinskidev-cache-warm.log`. It grows by a line or two every 5 minutes, so clear or rotate it now and then.

Rollback: `sudo rm /etc/cron.d/kotlinskidev-cache-warm`.

## Run it from your own computer

To warm the Warsaw data center directly, or any time you want a manual warm:

```bash
node scripts/cache-warm.mjs --mode full
```

Home addresses are not challenged by Bot Fight Mode. This works anywhere with Node 18 or newer.

## Why the cache used to go cold after about 2 hours

Warming only helps while the files stay cached. On 2026-11-12 we found that static files expired from Cloudflare's edge every 2 hours, because Apache's `headers` module was off and the origin sent no cache lifetime (see `docs/cloudflare.md` → How long Cloudflare keeps a file). Pages themselves stayed cached for a year. After enabling the module, files that are already cached switch to the long lifetime the next time they are revalidated (within 2 hours), and every new download is kept for 30 days or a year.

## Test results

2026-11-11:

- From the admin's computer (Warsaw), `--limit 6`: 6 pages and 244 files, 57 files cold at that data center. 22.8 MB in 58 seconds.
- On the server (Frankfurt), the same sample: first run 238 seconds (5 of 6 pages and 231 of 244 files cold), second run 4 seconds with every request a `HIT`.
- First full run on the server: 94 pages (77 cold) and 583 files (329 cold), 100 MB in 462 seconds. The server load average stayed below 0.3. The next 5-minute check printed `canary HIT age=1893s, still warm`.

## Open items

0. Around 2 to 3 hours after 2026-11-12 11:00 UTC, check that the `expired` and `revalidated` counts for static files in Cloudflare's cache analytics have dropped.
1. Check the log after the first 1 a.m. run (`tail -n 8 /var/log/kotlinskidev-cache-warm.log`). A warm run should take well under a minute.
2. Test the purge detection once: purge only the homepage URL in Cloudflare (or all of the cache at a quiet time) and confirm the log shows `warming` within 5 minutes.
3. Optional: ship the script with the deploy and start the warm-up at the end of the deploy workflow, so a deploy does not wait for the next check.
4. Optional: turn off the Super Page Cache preloader if it duplicates this script (it fetches only pages, not media).
