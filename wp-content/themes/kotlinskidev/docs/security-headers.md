# HTTP Security Headers

Reference for HTTP response security headers on kotlinski.dev: what's legally relevant, what to set, what value, and where (PHP vs. Cloudflare). Scope is deliberately narrow — response headers only. For the broader security posture (OWASP Top 10, WordPress hardening, MCP attack surface, etc.), see `docs/security.md` — this doc is the detailed backing reference for that checklist's §3 items 33–34 and §5 item 56.

## 0. Status (2026-08-09): what's applied, what's still needed

Headers are one slice of overall site security, not the whole picture — see `docs/security.md` for the full checklist (access control, secrets handling, plugin vulnerabilities, backups, etc.). This section covers response headers and connection security only.

### ✅ Applied — WordPress level (live now)

- [x] **`Content-Security-Policy-Report-Only`** — site-specific directives (§3's domain inventory), not enforcing yet (see "still needed" below)
- [x] **`Referrer-Policy`** — `strict-origin-when-cross-origin` by default
- [x] **`Permissions-Policy`** — deny-by-default for unused browser features (camera, mic, geolocation, USB, payment, etc.)
- [x] All three sent on frontend responses only — never on `wp-admin` or REST requests (confirmed via `curl -I`, not assumed)
- [x] All three **admin-configurable per site**, not hardcoded — Settings → Kotlinski.dev → Security: a master CSP toggle, a Report-Only/Enforcing toggle, an `upgrade-insecure-requests` toggle, one field per CSP directive, a `Referrer-Policy` dropdown, a `Permissions-Policy` textarea
- [x] Every field sanitized via `sanitize_text_field` (strips line breaks — blocks HTTP response-splitting/header-injection via CRLF)
- [x] Covered by `tests/integration/tests/SecurityHeadersTest.php` + `SettingsPageTest.php` (402 tests total, full suite green)
- [x] Verified in a real browser, not just tests: edited fields → saved → confirmed the exact new value on the live response header via `curl` → reverted; zero CSP violations observed across the homepage, an article, and the Google-Maps-loaded Contact page

**Implementation:** `functions/security-headers.php` (`wp_headers` filter) + `functions/settings-page.php` (the Security tab). Reusable as-is on any other WordPress site this theme is deployed to — no Cloudflare account or code edit required to reconfigure per customer.

### ⬜ Not yet applied — WordPress level (deliberately deferred, not forgotten)

- [ ] **CSP enforcing mode** — still Report-Only. Needs a longer real-traffic monitoring window (only 3 pages checked manually so far) before flipping the admin toggle to Enforcing.
- [ ] **Nonce-based `script-src`/`style-src`** — currently `'unsafe-inline'`. 7 theme files echo inline `<script>` tags directly (`theme-setup.php`'s dark-mode FOUC-prevention script is the most load-bearing, plus `enqueue-scripts.php`, `cover-image-classes.php`, `customizer.php`, `polylang-accessibility.php`, `tracking-scripts.php`) and would each need a `nonce` attribute added. Bounded, theme-owned work for later.
- [ ] **CSP violation-report collection endpoint** — no existing `register_rest_route` precedent in this theme; manual DevTools monitoring is the current substitute. Revisit only if enforcing-mode rollout needs more rigor.

### ⬜ Needed — Cloudflare / 3rd-party level (not yet done, requires manual dashboard access)

Full step-by-step in §4's checklist. Summary:

- [ ] SSL/TLS mode → **Full (Strict)** (needs a valid origin certificate first)
- [ ] **Always Use HTTPS** enabled
- [ ] Minimum TLS Version → **1.2**
- [ ] **HSTS** enabled (`max-age=63072000`; `includeSubDomains` only once every subdomain is confirmed HTTPS-capable; no `preload`)
- [ ] Transform Rule: `X-Content-Type-Options: nosniff` + `X-Frame-Options: DENY`
- [ ] DNS record confirmed proxied (orange cloud)
- [ ] The "Add security headers" Managed Transform left **off** (ships outdated `X-XSS-Protection`/`Expect-CT` values)

**Note on Wordfence:** active on this site (confirmed 2026-08-09) but does not set any HTTP response headers — checked its source directly (main plugin + bundled `wf-waf` firewall library), zero matches for any header in this document. It doesn't reduce or duplicate anything above.

**"Fully safe" caveat:** completing every box above gives a solid, current-best-practice header/TLS baseline — it is not the entirety of site security. Authentication hardening, plugin vulnerability management, backups, and secrets handling live in `docs/security.md`'s separate checklist.

---

## 1. Legal/regulatory context (EU)

Only one EU regulation directly, legally applies to this site at its current scale. The others are noted so they aren't silently assumed later, not because they impose obligations today.

### GDPR Article 32 — applies

The binding requirement. Full text confirmed against [gdpr-info.eu](https://gdpr-info.eu/art-32-gdpr/):

> Controllers and processors must implement "appropriate technical and organisational measures to ensure a level of security appropriate to the risk," considering state of the art, implementation costs, and processing nature.

It does **not** name specific HTTP headers — GDPR is deliberately technology-neutral. But security headers are widely treated by EU data protection authorities and security auditors as part of "state of the art" technical measures for a site handling personal data (this site: contact form submissions, page-view tracking, cookie-consent records via Complianz). Their *absence* is the kind of thing that gets flagged in a post-breach DPA investigation as evidence technical measures weren't "appropriate to the risk." Two headers map onto GDPR's own text most directly:

- **`Referrer-Policy`** — limits what URL/query-string data leaks to third-party origins via the `Referer` header, aligning with GDPR Art. 5(1)(c) data minimization.
- **`Content-Security-Policy`** — directly mitigates unauthorized disclosure/exfiltration of personal data via injected/compromised scripts, which is exactly the "unlawful... unauthorised disclosure of, or access to personal data" risk Art. 32(2) names.

### NIS2 Directive — does not apply

Confirmed threshold: NIS2 applies to medium-or-larger entities (50+ employees **or** >€10M annual turnover) in specific sectors (energy, transport, banking, health, digital infrastructure, public administration, digital service providers, etc.), or to specifically-named categories (DNS providers, TLD registries, qualified trust service providers) regardless of size. A personal/freelance portfolio site falls into none of these. Noted for awareness only — don't let NIS2 language creep into requirements for this site; it isn't a legal driver here.

### EU Cyber Resilience Act (CRA) — does not apply

Targets "products with digital elements" placed on the market (software/hardware sold as a product). A personal website isn't a product being placed on the market under CRA's definition. Not a driver here.

### ePrivacy Directive / cookie consent — already handled, orthogonal

Covered by the existing Complianz integration (consent banner, cookie categorization). Security headers are a separate technical-measures concern (Art. 32), not a legal basis for the consent banner itself — don't conflate the two when documenting compliance.

**Bottom line:** the only real legal driver is GDPR Art. 32's general "appropriate technical measures" obligation. That's a strong-enough reason on its own — no need to overstate applicability of NIS2/CRA to justify the work.

---

## 2. Recommended headers

Source: [OWASP Secure Headers Project](https://github.com/OWASP/www-project-secure-headers) (`mainsite/01_headers.md`, fetched directly — the landing pages at owasp.org just redirect there, don't trust a page that hasn't actually loaded the reference table).

| Header | Recommended value (this site) | Why |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000` — `includeSubDomains` **only if every subdomain is confirmed proxied through Cloudflare and serving HTTPS**. If `cp.`/`ssh.`/similar subdomains exist and aren't, leave it off: unlike a certificate warning, HSTS `includeSubDomains` gives the browser no bypass — it hard-blocks any subdomain that can't do HTTPS, no "proceed anyway" option. | Forces HTTPS for 2 years once first seen over a valid HTTPS connection. **No `preload` directive** — OWASP explicitly advises against it by default (hstspreload.org's own guidance: removal from the browser preload list is slow and painful if any subdomain can't support HTTPS; opt in deliberately later, not by default). |
| `X-Frame-Options` | `deny` | Clickjacking defense. Technically superseded by CSP's `frame-ancestors`, but keep both — cheap, and covers browsers/edge cases where `frame-ancestors` isn't honored. |
| `X-Content-Type-Options` | `nosniff` | Stops MIME-type sniffing (e.g. a served `text/plain` being executed as `text/css`/script). |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Sends full URL same-origin, only the origin cross-origin, nothing on HTTPS→HTTP downgrade. Balances the GDPR data-minimization rationale above against not breaking legitimate referrer-based analytics/UX (OWASP's own example uses the stricter `no-referrer`, which is a valid but more aggressive alternative — flagged as a judgment call, not settled here). |
| `Permissions-Policy` | Deny-by-default for unused browser features (camera, microphone, geolocation, USB, payment, etc.), explicitly leaving room for anything genuinely used | Reduces attack surface from embedded third-party content invoking browser APIs this site doesn't need. Exact allowlist depends on what the Google Maps embed and any other iframed content actually require — verify empirically, don't guess. |
| `Content-Security-Policy` | Site-specific — see §3 | The header that actually matters most and is hardest to get right. Do not ship a copy-pasted generic policy. |
| `X-XSS-Protection` | `0`, or omit entirely | **Deprecated by all modern browsers.** OWASP is explicit: setting the old `1; mode=block` value can itself introduce a client-side vulnerability. If set at all, set to `0` to disable the legacy filter and rely on CSP instead. **This directly contradicts Cloudflare's own "Add security headers" one-click Managed Transform**, which still ships `X-XSS-Protection: 1; mode=block` — see §4, this is a concrete reason to prefer a custom Transform Rule over that toggle. |

**Do not add** (confirmed deprecated by OWASP, no longer meaningfully supported): `Feature-Policy` (superseded by `Permissions-Policy`), `Expect-CT` (Chrome dropped support in 2021 — Cloudflare's "Add security headers" Managed Transform still includes it, another reason to skip that toggle), `Public-Key-Pins` (HPKP — universally deprecated, actively dangerous if misconfigured).

**Lower priority for this site:** `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`, `Cross-Origin-Resource-Policy`. These exist mainly for cross-origin isolation (e.g. enabling `SharedArrayBuffer`) or hardening against Spectre-class attacks. This is a content/portfolio site with embedded Google Maps and YouTube-style content — a strict COEP in particular can break third-party iframe embeds for no real benefit here. Worth revisiting only if a specific need arises; don't cargo-cult them in.

---

## 3. Content-Security-Policy — the hard part

### Why WordPress makes this genuinely difficult

Core, Gutenberg, and most plugins inject inline `<script>`/`<style>` with no nonces by default. A strict `script-src 'self'` (no `unsafe-inline`) will break the block editor's own inline style output and any plugin that follows the same pattern, unless every inline block is either nonce-tagged or the policy uses hash-based allowlisting. This is a real engineering cost, not a config toggle — confirmed against current (2026) WordPress-specific CSP guides, all of which converge on the same warning.

### This site's actual third-party inventory

Confirmed by grepping the live theme source and active plugins for real outbound domains (not documentation/comment noise):

| Source | Domains | Directive |
|---|---|---|
| Google Fonts | `fonts.googleapis.com`, `fonts.gstatic.com` | `style-src`, `font-src` |
| Google Maps (`google-maps-block` plugin) | `maps.googleapis.com`, `maps.gstatic.com` | `script-src`, `img-src`, `connect-src` |
| Facebook Pixel (`custom-facebook-pixel-loader`) | `connect.facebook.net`, `www.facebook.com` | `script-src`, `connect-src`, `img-src` (pixel uses a 1×1 image beacon too) |
| Google Analytics / GTM (`custom-google-analytics-loader`) | `www.googletagmanager.com`, and typically `www.google-analytics.com`/`analytics.google.com` (verify against the loader's actual `gtag`/GA4 endpoint) | `script-src`, `connect-src` |
| Cloudflare Turnstile (referenced in theme source) | `challenges.cloudflare.com` | `script-src`, `frame-src` |
| Complianz consent scanning | `consent.complianz.io`, `cookiedatabase.org` | `connect-src` (only if Complianz's server-side scanning features are enabled) |
| `wordpress-pwa-manager` | Self-hosted service worker/manifest — no external domain confirmed by static analysis; **verify separately if push notifications are enabled** (would need an FCM/push-service domain) | `script-src`, `worker-src`, possibly `connect-src` |

This table is a **starting point from static analysis, not a guarantee** — it will miss anything loaded conditionally or from a plugin settings value rather than hardcoded source. That's exactly what §5's Report-Only rollout exists to catch before anything is ever enforced.

### Rollout strategy: Report-Only first, always

Ship as `Content-Security-Policy-Report-Only` (same syntax, different header name) pointed at a `report-to`/`report-uri` endpoint before ever using the enforcing `Content-Security-Policy` header. The browser reports every violation it *would* have blocked without actually blocking anything. Run this against real production traffic for at least a few days (covers different pages, different browsers, any conditionally-loaded scripts) before flipping to enforcing mode. This is the standard, non-negotiable way to deploy CSP on any non-trivial site — skipping it risks silently breaking Maps embeds, tracking, or the PWA service worker in production with no warning.

---

## 4. Where to implement: PHP vs. Cloudflare

Three possible layers; this site uses two of them, deliberately split by what each is actually good at.

| Layer | Good for | Bad for |
|---|---|---|
| **Cloudflare edge** (Transform Rules / SSL-TLS panel) | Connection-level security (TLS mode, HSTS) and the 2 truly static, never-customized-per-site headers: `X-Content-Type-Options`, `X-Frame-Options`. The *only* layer guaranteed to apply even if a page is ever served from a full-page cache without WordPress/PHP executing at all. | Anything conditional, anything that needs to differ per customer/site, and — critically — **anything WordPress already sets**. Cloudflare's Transform Rule "Set" operation runs after the origin responds and unconditionally *overwrites* an existing header of the same name — there's no "only if missing." Point it at a header WordPress also sets and Cloudflare silently wins every time, making the WordPress-side admin field pointless. **Skip the one-click "Add security headers" Managed Transform entirely** — confirmed it ships the deprecated `X-XSS-Protection: 1; mode=block` and `Expect-CT`. |
| **WordPress PHP** (`wp_headers` filter, `functions/security-headers.php`) | `Content-Security-Policy`(-Report-Only), `Referrer-Policy`, `Permissions-Policy` — all admin-configurable (§ above), all portable with the theme code to any WordPress site regardless of what CDN/host that site uses, and the only layer that can ever support per-request CSP nonces later (§3 defers this, but only PHP can do it — a nonce has to land in both the header and the matching inline `<script>` tag in the same response). | **Only fires when PHP actually executes.** No full-page HTML cache is active on this site today (Asset CleanUp is a JS/CSS bundler, not a page cache — PHP runs on every request) — reconfirm this before relying on it if that ever changes. |
| **A dedicated plugin** (`HTTP Headers`, `Headers Security Advanced & HSTS WP`, etc.) | Non-developers, GUI-driven changes without touching code. | Sits outside this repo's git history/PR review; one more plugin dependency/update surface for something the theme's own Security settings tab already does. Not used here. |

**The split, concretely:** Cloudflare owns connection security (TLS mode, HSTS) plus `X-Content-Type-Options`/`X-Frame-Options`. WordPress owns everything else — CSP, `Referrer-Policy`, `Permissions-Policy` — because those are the ones that (a) need to be different per customer site and (b) need to travel with the theme rather than live in one Cloudflare account's dashboard. Don't set `Referrer-Policy`/`Permissions-Policy`/CSP at Cloudflare even though a Transform Rule *can* technically do it — see the override-conflict cell above.

### Cloudflare setup checklist (manual, done by you outside this repo)

1. **SSL/TLS → Overview**: set mode to **Full (Strict)**. Requires the origin server to have a valid (not self-signed) SSL certificate — confirm that first, or this will break the site.
2. **SSL/TLS → Edge Certificates**: enable **Always Use HTTPS**.
3. **SSL/TLS → Edge Certificates**: set **Minimum TLS Version** to **1.2**.
4. **SSL/TLS → Edge Certificates → HSTS**: enable, `max-age` = `63072000` (2 years). `includeSubDomains`: **off**, unless every subdomain (including any `cp.`/`ssh.`-style admin subdomains) is confirmed proxied through Cloudflare and serving HTTPS — verify this directly rather than assuming. `preload`: off.
5. **Rules → Transform Rules → Create rule → Modify Response Header**: match all incoming requests, `Set` only `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`. Do **not** add `Referrer-Policy` or `Permissions-Policy` here — WordPress already sets both, and Cloudflare's `Set` would silently override the per-customer wp-admin configuration.
6. **Do not enable** Rules → Settings → Managed Transforms → "Add security headers" — outdated header values, see the table above.
7. **Prerequisite for steps 4–5**: the DNS record must be proxied (orange cloud), not DNS-only (grey cloud).

---

## 5. Validating the result

- [securityheaders.com](https://securityheaders.com) — quick external scan, grades the response header set.
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com) — checks a CSP string for common bypasses (overly broad `script-src`, missing `object-src`, etc.) before enforcing it.
- Browser DevTools → Console/Network, with Report-Only active — the direct source of truth for what a real policy would actually break, per page, per browser.

---

## References

- [OWASP Secure Headers Project — Response Headers reference](https://github.com/OWASP/www-project-secure-headers/blob/master/mainsite/01_headers.md)
- [GDPR Article 32 — full text](https://gdpr-info.eu/art-32-gdpr/)
- [NIS2 Directive — SME/threshold applicability](https://www.lexology.com/library/detail.aspx?g=26ff47a2-462b-45a6-a011-c1ebb06c997f)
- [Cloudflare — Managed Transforms reference](https://developers.cloudflare.com/rules/transform/managed-transforms/reference/)
- [Cloudflare — enforcing security headers with Transform Rules](https://paramdeo.com/blog/enforcing-security-headers-with-cloudflare-transform-rules)
- [content-security-policy.com — CSP nonce reference](https://content-security-policy.com/nonce/)
