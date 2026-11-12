# Cloudflare

Source of truth for the Cloudflare configuration of `kotlinskidev.com`. Every value was read from the live zone through the Cloudflare API MCP on **2026-11-11**. Update this file in the same change as any dashboard or API edit, and refresh the date.

Each section has two parts: **How it works** explains the feature in plain terms, and **Our setting** records what is configured and why.

- Plan: **Free**. Zone ID `d846bfc97f23347b1420450877d6ea3d`, status active.
- Nameservers: `annabel.ns.cloudflare.com`, `mitchell.ns.cloudflare.com`.
- Registrar: **Cloudflare Registrar**, registration expires 2027-06-20.
- Origin: AWS Lightsail static IP, firewalled to Cloudflare ranges only (see `docs/AWS.md`).

## The big picture

Visitors never talk to the Lightsail server directly. Their browser connects to Cloudflare, Cloudflare checks the request, answers from its cache when it can, and only asks the server when it must. The server is small (1 GB), so every request Cloudflare answers or blocks is load the server never sees.

```text
visitor -> Cloudflare (DNS, TLS, WAF, rate limit, cache) -> Lightsail Apache + WordPress
```

## At a glance

| Area | State |
| --- | --- |
| DNS | 2 proxied `A` records (apex, `www`), 3 MX, SPF, DKIM and Google verification `TXT`, 5 CAA issuers. No DMARC record. DNSSEC pending |
| SSL/TLS | Full (strict), min TLS 1.3, HSTS 1 year with preload, post-quantum key exchange on |
| Caching | Super Page Cache cache rule (HTML at the edge), Smart Tiered Cache on, 5 `Cache-Control` transform rules, `www` to apex redirect at the edge |
| Security | Security level High, Bot Fight Mode, Free Managed Ruleset, 2 custom WAF rules, 1 rate limit rule, leaked credentials detection on |
| Origin protection | Firewall allows only Cloudflare IPs, `mod_remoteip` restores real visitor IPs, Authenticated Origin Pulls with a zone-only certificate (Apache requires it) |
| Analytics | Web Analytics (RUM) auto-injected, NEL reporting on |
| Email | Cloudflare Email Routing: `contact@` and a catch-all forward to the owner's mailbox. Receive only |
| Alerts | 3 email policies: origin down, Universal SSL events, HTTP DDoS |
| Not used | Workers, Page Rules, Snippets, Health Checks (paid) |

## DNS

**How it works:** DNS is the phone book that turns `kotlinskidev.com` into a server address. A *proxied* record (orange cloud) shows visitors Cloudflare's address instead of the real server IP, which hides the server and routes all traffic through Cloudflare's protections. *CNAME flattening* lets the root domain point to a name instead of an IP. *CAA* records list which companies may issue TLS certificates for the domain, so nobody else can get a valid certificate for it. *DNSSEC* signs the DNS answers so nobody can forge them on the way to a visitor.

**Our setting:**

| Record | Target | Proxied |
| --- | --- | --- |
| `A kotlinskidev.com` | Lightsail static IP | yes |
| `A www` | same | yes |
| `TXT kotlinskidev.com` | Google site verification | no |
| `MX kotlinskidev.com` (3 records) | `route1`, `route2`, `route3.mx.cloudflare.net` | no |
| `TXT kotlinskidev.com` | SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all` | no |
| `TXT cf2024-1._domainkey` | DKIM public key for Email Routing | no |
| `CAA kotlinskidev.com` | `letsencrypt.org`, `pki.goog`, `ssl.com`, `sectigo.com`, `digicert.com`, each as `issue` and `issuewild` | no |

- Cloudflare adds `comodoca.com` and `digicert.com` variants to the CAA answer at the edge by itself. If a certificate renewal ever fails, check CAA first. The Origin CA certificate is not affected.
- The unused `cp` and `ssh` records were deleted on 2026-11-11.
- CNAME flattening at the root, IPv6 on, pseudo-IPv4 off.
- DNSSEC was enabled on 2026-11-10 and is still `pending`: the zone has a DS record ready (key tag 2371, algorithm 13), but `dig DS kotlinskidev.com` returns nothing. The registrar is Cloudflare, so the DS record is published automatically with no manual step. If it is still pending after 24 hours, check Domain Registration → Manage → DNSSEC in the dashboard.
- Never move the domain away from Cloudflare without disabling DNSSEC first.

## SSL/TLS

**How it works:** There are two encrypted hops: visitor to Cloudflare (the *edge certificate*) and Cloudflare to the server (the *origin certificate*). **Full (strict)** means Cloudflare encrypts both hops and also checks that the server's certificate is valid. **HSTS** tells browsers to use only HTTPS for this domain for a set time, so a downgrade attack cannot work. The **minimum TLS version** sets the oldest encryption protocol Cloudflare accepts. **0-RTT** speeds up repeat connections but allows an attacker to replay the first request.

**Our setting:**

- Mode **Full (strict)**. The origin presents a Cloudflare Origin CA certificate valid 15 years, so strict mode requires a valid cert at all times. If it expires or goes missing, the site is down.
- Edge certificate: Universal SSL, issued by Google Trust Services, covers `kotlinskidev.com` and `*.kotlinskidev.com`.
- Minimum TLS **1.3**, TLS 1.3 on, HTTP/2, HTTP/3, ECH (hides which site the visitor opens), post-quantum key exchange, Opportunistic Encryption, Always Use HTTPS and Automatic HTTPS Rewrites on. Custom cipher list: none.
- HSTS: `max-age=31536000` (1 year), `includeSubDomains`, `preload`, `nosniff`. The values meet the preload list rules, but the domain is not submitted. Submitting is hard to undo and covers every subdomain.
- 0-RTT is off on purpose: it allows replay of early data, and the contact form is a POST.
- Authenticated Origin Pulls: on per hostname (`kotlinskidev.com`, `www`) with a certificate unique to this zone. The zone-wide setting `tls_client_auth` stays off because it would use Cloudflare's shared certificate. See Origin protection below.

## Speed and caching

**How it works:** Cloudflare keeps copies of files in data centers near visitors (the *edge*). A *cache hit* is served without touching the server. Two timers decide how long a copy lives: the **edge TTL** (how long Cloudflare keeps it) and the **browser TTL** (how long the visitor's browser keeps it). `Cache-Control` headers from the server or from a transform rule set those timers. *Tiered Cache* lets Cloudflare data centers ask each other before asking the server, so the server gets fewer requests. *Early Hints* lets the browser start loading fonts and the main image while the server is still building the page. *Brotli* compresses text files smaller than gzip.

**Our setting:**

| Setting | Value | Why |
| --- | --- | --- |
| Cache level | Aggressive | |
| Browser Cache TTL | Respect origin | the transform rules below set it per path |
| Edge Cache TTL (zone default) | 2 hours | the fallback when the origin sends no cache lifetime. It applied to every static file until 2026-11-12, see below |
| Tiered Cache | Smart topology on | fewer origin requests to the 1 GB Lightsail instance |
| Brotli, Early Hints | on | the theme prints a Sora font preload and an LCP image preload |
| Always Online | on | serves the cached copy when the origin is down |
| Rocket Loader | off | rewrites every script tag, which conflicts with the theme CSP and module scripts |
| Auto Minify | off | deprecated by Cloudflare; the build already minifies |
| Speed Brain | off | WordPress 6.8+ core speculative loading already prefetches links |
| Cloudflare Fonts | off | fonts are self-hosted in the theme |
| Polish, Mirage, Cache Reserve | not available | paid plans |

### How long Cloudflare keeps a file

Two different lifetimes exist, and mixing them up caused a real slowdown:

- **Browser lifetime:** how long a visitor's browser keeps a file. Our response header transform rules (below) set this.
- **Edge lifetime:** how long Cloudflare keeps the file in its cache. Cloudflare takes this from the `Cache-Control` header the **origin server** sends. A header added by a Cloudflare transform rule only changes what the browser sees. If the origin sends nothing, the edge falls back to 2 hours.

Until 2026-11-12 the origin sent nothing for static files, so every image, font, script and video expired from the edge every 2 hours, then needed a revalidation or a new download from the server. Visitors who came back after a pause felt it as a slow site until the files were cached again. The cause: the plugin's `.htaccess` rules that set 30 days (CSS, JS) and 1 year (images, fonts, video) are wrapped in `<IfModule mod_headers.c>`, and Apache's `headers` module was not enabled, so Apache skipped them silently. Enabling it (`sudo a2enmod headers`, then an Apache **restart**) fixed it. Details in `docs/AWS.md`.

Because the edge now keeps unversioned files for up to a year, a file replaced at the same URL stays old until it is purged. Rename the file, add `?ver=`, or purge that URL.

### Cache rule

**How it works:** By default Cloudflare does not cache HTML pages, only static files. A cache rule tells it to cache HTML too, so most visitors get the page without WordPress running at all. Logged-in users and forms must skip the cache, so the rule bypasses requests with login cookies.

**Our setting:** The cache ruleset `WP Cloudflare Super Page Cache Plugin` (`http_request_cache_settings`, id `bf42d645f211478dbf17f1553c12af14`) is owned by the Super Page Cache plugin and marked DO NOT EDIT. Do not add rules there: the plugin may overwrite them.

- Matches host `kotlinskidev.com*` without WordPress, comment or shop cookies, and bypasses `wp-json`, `wp-admin`, `wp-login` and XML files.
- Edge and browser TTL respect origin. Status 4xx is cached for 0 seconds and 5xx is never cached.
- HTML is served with `s-maxage=604800, max-age=60` (lowered from a year on 2026-11-12): Cloudflare may keep it for 7 days, browsers re-check after a minute. The shorter edge lifetime limits how long anything that was not purged, such as a form nonce baked into the HTML, can stay stale. After a deploy, purge from Super Page Cache, or purge everything in Cloudflare.
- Super Page Cache's disk page cache is **off** on purpose. On 2026-11-12 it served the cached public page to requests carrying a `wordpress_logged_in_` cookie even with the cookie exclusion list set, and it only helps the rare requests that reach the origin. Do not turn it on without testing a real logged-in session first.
- Super Page Cache's skip-cookies list also contains `wp-settings-` (set for logged-in users), next to the default WordPress and WooCommerce names.
- Super Page Cache excluded URLs also cover `contact-success`, `contact-error`, `contact-thankyou` (form result pages must never be shared between visitors) and `/sw.js`.
- A second rule in the same ruleset, **Bypass edge cache for the service worker script**, matches `/sw.js` and turns caching off. The origin sends `immutable, max-age=2592000` for that file, so without it a new service worker would not reach visitors for 30 days. Super Page Cache keeps this rule when it rewrites its own (checked 2026-11-12), but re-check after a plugin update.

## Transform rules

**How it works:** Transform rules change a request or response on its way through Cloudflare, without touching the server. Here they add headers to responses and redirect URLs.

### Response headers

**How it works:** Browsers decide how long to keep a file from its `Cache-Control` header. Without one, they ask the server again on every page load. `immutable` tells the browser the file will never change at that URL, so it never asks. A `?ver=` number in the URL changes when the file changes, which makes long lifetimes safe.

**Our setting:** Ruleset `default` (`http_response_headers_transform`, id `a55fe221ac754fb6ad296395bebf39a9`). Static files had no `Cache-Control`, so browsers revalidated on every load.

| Rule | Matches | Header |
| --- | --- | --- |
| Security headers | all | `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| Static assets: versioned | `cache/asset-cleanup/*`, theme `assets/fonts/*`, `?ver=` files in themes, plugins, wp-includes | `public, max-age=31536000, immutable` |
| Uploads | `/wp-content/uploads/*`, status 200 or 206 (video range requests) | `public, max-age=604800` |
| Theme build files without version | `/wp-content/themes/kotlinskidev/build/*` | `public, max-age=86400` |
| Unversioned theme and plugin files | theme `assets/`, theme `polylang/`, plugin images, fonts, CSS, JS without `?ver=` | `public, max-age=2592000` |

- The security headers mean: `Referrer-Policy` limits what other sites learn about where the visitor came from, `X-Content-Type-Options` stops browsers guessing file types, `X-Frame-Options: DENY` stops other sites embedding ours in a frame (clickjacking).
- `Permissions-Policy` is deliberately not set in Cloudflare. The theme sends the full policy and Cloudflare's `set` operation would overwrite it with a shorter one.
- If a file is replaced at the same URL, visitors keep the old copy until the TTL ends. Rename the file or add `?ver=`.
- Left alone on purpose: `cdn-cgi/*` (Cloudflare challenge and analytics), `admin-ajax.php`, `wp-json`.

### Managed transforms

**How it works:** Managed transforms are ready-made header tweaks that Cloudflare offers as on/off switches.

**Our setting:**

- Add security headers: **off** since 2026-11-11. It added the obsolete `X-XSS-Protection` and `Expect-CT` headers, which modern browsers ignore. The custom rule above sets the useful ones.
- Add visitor location headers: on (`cf-ipcountry` and related headers reach the origin).
- Add client certificate headers: on (no effect while mTLS is off).
- Remove `X-Powered-By`: off. The origin does not send the header today.

### Redirect rules

**How it works:** A redirect rule sends the browser to another URL. Cloudflare answers it itself, so the server is not used at all.

**Our setting:** Ruleset `http_request_dynamic_redirect`, id `62fcd4ac486d4a6f97712a08aaa39cea`: **Redirect www to apex**. Host `www.kotlinskidev.com` gets a 301 (permanent) to `https://kotlinskidev.com` plus the path, with the query string kept. Before 2026-11-11 WordPress did this redirect on the server. A second rule, **Redirect /en/ to /en/home/**, answers the bare Polylang language root at the edge with a 301 (query string kept). Polylang sends the same redirect and sets a `pll_language` cookie, which made Cloudflare skip the cache and hit the server on every visit. The language switcher already links to `/en/home/`, so only typed or old links reach this rule.

### Request transform

**Our setting:** Ruleset `default` (`http_request_transform`, id `11d0e56bd64e4264884a978ba05d86d8`) exists with no rules. URL normalization is Cloudflare's default, incoming only (it cleans odd URL encodings before rules run).

## Security

**How it works:** Cloudflare filters bad traffic in layers, from cheap checks to expensive ones. The **security level** decides how suspicious an IP must be before it gets a challenge. **Browser Integrity Check** blocks requests with headers typical of bad bots. **Hotlink Protection** stops other sites embedding our images. **Managed rulesets** are rules maintained by Cloudflare that block known attacks, such as WordPress plugin exploits. **Leaked credentials detection** flags login attempts that use passwords found in public data breaches.

**Our setting:**

- Security level **High**, Challenge Passage 30 minutes, Browser Integrity Check on, Privacy Pass on, Hotlink Protection on, Email Obfuscation off (it injects JavaScript), Server-Side Excludes on.
- Managed rulesets: DDoS L7 (stops floods of web requests), Cloudflare Normalization, and the **Cloudflare Managed Free Ruleset** (Log4j, Shellshock, WordPress core and plugin CVE rules, all set to block).
- Leaked credentials detection: **on** (turned on by hand in the dashboard on 2026-11-11, Security → Settings). The API connection used for this documentation cannot write the setting, so change it in the dashboard.

### Custom WAF rules

**How it works:** The WAF (web application firewall) runs rules written by us against every request. A *block* rule refuses the request. A *Managed Challenge* shows a check that real browsers pass automatically and bots fail.

**Our setting:** Ruleset `default` (`http_request_firewall_custom`, id `07fd9dee02ee4fb5a5eef56acd9f8dd4`):

1. **Block scanner and backup paths:** `/xmlrpc.php`, `/.env`, `/phpmyadmin`, `/wp-config.php`, `/.git*`, `*.sql`, `*.bak`, `*.old`, `*.swp` (uploads excluded). Bots probe these paths for passwords and old copies of the site.
2. **Managed Challenge** on `/login*` and `/wp-admin*`, except `admin-ajax.php` and `admin-post.php` (public AJAX and the contact form post there). The login page uses a custom slug set by WPS Hide Login (the slug is not recorded here because the repo is public), and `wp-login.php` returns 404.

### Rate limiting

**How it works:** A rate limit counts requests from one visitor in a short time window and blocks the visitor for a while when the count is too high. It slows down brute-force attacks and scrapers.

**Our setting:** Ruleset `default` (`http_ratelimit`, id `5ddfe13337b94a398233efa5c4d8f1be`). Free plan: 1 rule, 10 s window, 10 s block.

- 40 requests per 10 s per IP and data center on `admin-ajax.php`, `admin-post.php` and `/wp-json/*`. The page-view tracker calls `admin-ajax.php` on every page, so the limit must stay generous. Query-string matching (`?s=`) needs a paid plan.

### Bots

**How it works:** *Bot Fight Mode* automatically challenges traffic that Cloudflare recognizes as automated. It is a blunt switch: on the Free plan no rule can make exceptions for it.

**Our setting:**

- Bot Fight Mode on, JavaScript detections on. It also challenges the origin server's own requests (WordPress loopback cron, the Super Page Cache preloader, cache warming), because they come from a data center. A WAF rule cannot skip it, but an IP Access rule can: see `docs/cache-warming.md`. An IP Access rule (Allow, this zone only, note "own origin server") has been in place since 2026-11-11 for the server's static IPv4 address. An Allow rule bypasses all WAF features for that address, which is acceptable because only the origin itself uses it. If WordPress loopback requests, cron or an MCP client get challenged, this is the first thing to check.
- AI crawlers (training, search and agents) are allowed. Cloudflare-managed `robots.txt` is off; Yoast writes `robots.txt`.

### CSP and security.txt

**How it works:** A Content Security Policy (CSP) is a header that lists which sites may load scripts, images and frames on our pages. A malicious script from an unlisted site is blocked by the browser. `security.txt` is a standard file that tells researchers how to report a vulnerability.

**Our setting:**

- CSP is set by the theme (Settings page), not Cloudflare, so the policy follows the scripts the theme loads. Two CSP headers would combine into the stricter of both. The option `kotlinskidev_csp_enforce` was set to `1` on production on 2026-11-10 after a Playwright run with the policy forced to enforcing found no violations on 7 pages, desktop and mobile, with and without cookie consent. See `wp-content/themes/kotlinskidev/docs/security-headers.md`.
- `/.well-known/security.txt` is served by Cloudflare Security Center: contact by email and `/contact`, privacy policy links in PL and EN, preferred languages `pl, en`, expires 2027-12-31. Renew it before that date.

## Origin protection

**How it works:** The *origin* is the Lightsail server behind Cloudflare. If attackers reach it directly, they skip every Cloudflare protection. Three layers keep that from happening:

1. **Firewall:** Lightsail accepts ports 80 and 443 only from Cloudflare's published IP ranges. A direct request to the server IP times out.
2. **Real visitor IP:** Because all traffic now arrives from Cloudflare, Apache sees a Cloudflare address for every visitor. Cloudflare passes the real address in the `CF-Connecting-IP` header. `mod_remoteip` tells Apache to read the address from that header, but only when the request comes from a Cloudflare range, so nobody can fake it.
3. **Authenticated Origin Pulls (AOP):** Cloudflare shows a client certificate every time it connects to the server, and Apache accepts the connection only if the certificate is valid. Think of it as a key card: the firewall checks that the visitor comes from the right building (Cloudflare's address ranges), and AOP checks that they hold our own key card. This stops *other* Cloudflare customers from pointing their domain at our IP, which the firewall cannot do because they come from the same Cloudflare ranges. It only works with a certificate unique to our zone. Cloudflare's shared default certificate is the same for every customer, so it proves only that the request came through Cloudflare.

**Our setting:**

- Firewall: done 2026-11-10, see `docs/AWS.md`.
- `mod_remoteip`: done 2026-11-11. Config `/etc/apache2/conf-available/remoteip-cloudflare.conf` with `RemoteIPHeader CF-Connecting-IP` and the Cloudflare ranges in `/etc/apache2/cloudflare-ips.txt`. Apache logs now show the real visitor IP. Wordfence is set to "Use PHP's built in REMOTE_ADDR", which now holds the real visitor IP.
- Keep `/etc/apache2/cloudflare-ips.txt` in sync with <https://www.cloudflare.com/ips-v4> and <https://www.cloudflare.com/ips-v6>. If a range is missing, visitors from it are logged with a Cloudflare address.
- AOP: done 2026-11-11.
  - **Certificates:** A private CA (`kotlinskidev-aop-ca`) signed one client certificate (`kotlinskidev-origin-pull`), both valid until 2036-11-08. Cloudflare rejects a bare self-signed certificate ("Missing leaf certificate"), which is why a CA is needed. The client certificate plus CA were uploaded to the zone (certificate id `68400f79-ed99-4d04-88fa-0eed8f530def`) and attached to `kotlinskidev.com` and `www.kotlinskidev.com` through `origin_tls_client_auth/hostnames`. Both show status `active`.
  - **Apache:** The public CA is `/etc/apache2/ssl/aop-client-ca.pem`. The settings live in `/etc/apache2/aop-client-auth.conf` (`SSLVerifyClient require`, `SSLVerifyDepth 1`, `SSLCACertificateFile`), included from the HTTPS vhost. The vhost file Apache loads is `/etc/apache2/sites-enabled/default-ssl.conf`, which is a separate copy and not a symlink to `sites-available`. Edit the `sites-enabled` file, and do not run `a2ensite` on the old `sites-available` copy.
  - **Private keys:** `aop-ca.key` and `aop-client.key` exist only on the admin's computer and in the password manager. They are never in this repo and never on the server. Losing them means generating a new pair and repeating the setup. Cloudflare keeps its own copy of the client key.
  - **Tested:** The check log showed `SUCCESS` for Cloudflare traffic before enforcement was switched on. A direct request to the server without a certificate (`curl -sk --resolve kotlinskidev.com:443:127.0.0.1 https://kotlinskidev.com/`, run on the server) returns `000`, and the site, the contact form and the Super Page Cache purge still work.
  - **Rollback:** On the server run `sudo sed -i 's/SSLVerifyClient require/SSLVerifyClient optional/' /etc/apache2/aop-client-auth.conf && sudo systemctl reload apache2`. In Cloudflare, disable the hostnames with `PUT /zones/{zone}/origin_tls_client_auth/hostnames`.
  - **Renewal:** The certificates expire on 2036-11-08. If Cloudflare shows the hostname status as anything other than `active`, the site returns 5xx errors, so check it first when visitors report errors.

## Email

**How it works:** Email addresses need DNS records. *MX* records say which servers receive mail for the domain. *SPF* lists the servers that may send mail for the domain. *DKIM* signs messages so receivers can tell they were not changed on the way. *DMARC* tells receivers what to do with mail that fails SPF or DKIM. **Cloudflare Email Routing** is a free forwarding service: Cloudflare receives mail sent to `@kotlinskidev.com` and passes it to a mailbox you already own. There is no separate mailbox, no storage and no sending.

**Our setting** (created 2026-11-11):

- Routing is on (`ready`). Cloudflare created the three MX records, the SPF record and the DKIM key listed in the DNS table. Do not delete them by hand. Turn routing off in the dashboard (Email → Email Routing) to remove them cleanly.
- Destination: the Cloudflare account owner's mailbox (verified automatically, not written here because the repo is public).
- Rule `contact@kotlinskidev.com` forwards to that mailbox.
- Catch-all: every other name at the domain forwards there too, so no mail is lost. The downside is spam sent to random names. To reduce it, switch the catch-all to "Drop" in the dashboard and add one rule per address you actually use.
- Tested 2026-11-11: mail sent to `contact@` and to a random name both arrived.
- Receiving goes through Email Routing, and replies are sent from Gmail: **Send mail as** `contact@kotlinskidev.com` through `smtp.gmail.com` (port 587, TLS) with a Google app password stored in the password manager (set up 2026-11-11, tested). Gmail signs these messages as `gmail.com`, not as `kotlinskidev.com`, so SPF and DKIM pass for Gmail but DMARC does not align with this domain. Mail to a new recipient can land in Gmail's Promotions tab until they reply or mark it as Primary. Do not add a strict DMARC record (`p=reject`) while this is the sending route. To send mail properly signed by the domain, use a sending service (for example Brevo or Amazon SES) and merge its SPF include into the single existing SPF record (two SPF records make both invalid).
- WordPress contact form mail is a separate topic: it is not routed through Email Routing. Mail sent from the Lightsail server directly often lands in spam, so a transactional service (for example Amazon SES) with its own SPF and DKIM records is the better path.

## Analytics and observability

**How it works:** *Web Analytics (RUM)* measures real visitors' page speed (Core Web Vitals) with a small script, without cookies. *NEL* lets browsers report network failures to Cloudflare. *Notifications* send an email when something breaks.

**Our setting:**

- **Web Analytics (RUM)**: site tag `d900953950f04173b51fac8c3836f90b`, created 2025-08-22. Auto-install is on, so Cloudflare injects `beacon.min.js` into HTML responses. EU visitors are not excluded. The beacon sets no cookies. The theme CSP allows `static.cloudflareinsights.com` in `script-src` and `cloudflareinsights.com` in `connect-src`. Core Web Vitals per page are under Analytics & Logs → Web Analytics.
- Network Error Logging: Cloudflare adds `NEL` and `Report-To` headers.
- Notifications (email to the account owner, created 2026-11-11): Passive Origin Monitoring (origin down), Universal SSL events, HTTP DDoS attack.
- Origin health is monitored by CloudWatch (see `docs/monitoring.md`), not Cloudflare.

## Open items

Ranked by value. Move an item into the sections above when it is done.

1. Confirm DNSSEC goes active (`dig +short DS kotlinskidev.com` returns a record).
2. Add a DMARC record only after mail is sent through a service that signs with the domain (see Email). The current Gmail route would fail a strict policy.
3. Decide how WordPress contact form mail is sent (see Email).

## Verify

```bash
curl -sI https://kotlinskidev.com/wp-content/uploads/2025/07/anf-home-1024x708.webp | grep -iE 'cache-control|cf-cache-status'
curl -sI -H "Range: bytes=0-1" https://kotlinskidev.com/wp-content/uploads/2026/06/AI_Hero_Carousel_Video2-1.mp4 | grep -iE 'cache-control|content-range'
curl -s -o /dev/null -w "%{http_code}\n" https://kotlinskidev.com/xmlrpc.php
curl -sI https://kotlinskidev.com/ | grep -iE 'cf-cache-status|strict-transport|x-frame|content-security'
dig +short DS kotlinskidev.com
curl -sI https://www.kotlinskidev.com/ | grep -iE 'HTTP|location'
dig +short CAA kotlinskidev.com
curl --resolve kotlinskidev.com:443:<STATIC_IP> -m 8 https://kotlinskidev.com/
```

Run this one on the Lightsail server over SSH to check that Apache refuses connections without the Cloudflare client certificate:

```bash
curl -sk --resolve kotlinskidev.com:443:127.0.0.1 -o /dev/null -w "%{http_code}\n" https://kotlinskidev.com/
```

Expect the cache headers above, a 206 for the range request, 403 for `xmlrpc.php`, `cf-cache-status: HIT` on the homepage, a DS record once DNSSEC is active, a 301 to the apex without `x-redirect-by` for `www`, the CAA list, a connection timeout for the direct-to-origin request, and `000` for the on-server request without a certificate. A challenged path such as the login page returns 403 to `curl`; browsers get the challenge page.

`<STATIC_IP>` is the Lightsail static IP `kotlinskidev-static-ip`. Read it from the Lightsail console. It is deliberately not written in this repo, which is public.

To check `mod_remoteip`, request any page and read the newest line of `/var/log/apache2/access.log` on the server. It must show your own IP, not a Cloudflare address.

## Rollback

- Delete or disable a rule in the dashboard (Rules → Transform Rules, Security → WAF, Security → WAF → Rate limiting rules), or with `DELETE /zones/{zone}/rulesets/{ruleset}/rules/{rule}`. Rule ids are listed by `GET /zones/{zone}/rulesets/{ruleset}`.
- `mod_remoteip`: `sudo a2disconf remoteip-cloudflare && sudo systemctl reload apache2`.
