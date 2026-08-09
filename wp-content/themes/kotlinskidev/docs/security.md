# Security Review Checklist

A comprehensive security review checklist for kotlinskidev.dev, structured around **OWASP Top 10 (2021)**, WordPress-specific hardening (CIS WordPress Benchmark practices), **OWASP ASVS** control depth, and **ISO/IEC 27001:2022 Annex A** control families for anything that's organizational/process rather than code. This is a working checklist, not a description of current state — items get checked off as each is verified. See §17 for the ISO cross-reference.

Scope: theme code (`functions/*.php`, `src/blocks/*`, `src/scripts/*`), active plugin inventory (Polylang, Complianz, WP Mail SMTP, WPS Hide Login, FileBird, Smush, Yoast, MCP Adapter, Enable Abilities for MCP, Novamira), the MCP/AI-agent integration unique to this project, and the AWS/Cloudflare infra referenced in `docs/522.md` / `docs/monitoring.md`.

> Note: this pass did **not** read `wp-config.php` (explicitly off-limits per the root `CLAUDE.md` / `wp-protect.sh` hook) — several items below (debug flags, secret key strength, `DISALLOW_FILE_EDIT`, DB prefix) need to be verified by you directly rather than by me.

---

## 1. Injection & Output Escaping (OWASP A03)

- [ ] All `$wpdb` queries use `$wpdb->prepare()` with placeholders — no string-concatenated SQL anywhere in `functions/*.php`.
- [ ] Every value echoed into HTML is escaped with the context-correct function (`esc_html`, `esc_attr`, `esc_url`, `esc_js`, `wp_kses_post`) — current repo has only ~20 files using `esc_*`/`sanitize_*` helpers; audit every `render.php` and `functions/*.php` that echoes dynamic/user-influenced data to confirm full coverage, not just the files already doing it.
- [ ] **`functions/svg-support.php` — confirmed finding, not hypothetical:** uploaded SVGs are inlined directly into page output (`kotlinskidev_inline_svg_image`, `kotlinskidev_inline_svg_image_block`) with only the XML prolog/DOCTYPE stripped. No `<script>`/`<foreignObject>` removal, no `on*` event-handler attribute stripping, no `javascript:`/`data:` URI filtering on `xlink:href`/`href`. Any account able to upload media (Author role and up, or lower via a misconfigured capability) can achieve **stored XSS** that executes for every visitor. Fix: sanitize with a dedicated SVG sanitizer (strip `<script>`, `on*` attrs, external refs) before inlining, or drop the inline-render path and serve SVGs as normal `<img>` (browser-sandboxed, no inline execution).
- [ ] Block editor attributes (block.json `style`/`className`/URL-type attributes across `nav-link`, `nav-banner`, `simple-grid`, etc.) are validated/escaped on the render side, not trusted as pre-sanitized just because they came from the block editor.
- [x] No `eval()`, `create_function()`, or dynamic `include`/`require` built from request input anywhere in `functions/`.
- [ ] REST/AJAX handlers (if any beyond `admin-ajax` contact form) validate and type-check every input parameter server-side, not just client-side.
- [x] DOM-based XSS: any frontend script that writes user- or URL-influenced strings into `innerHTML`/`insertAdjacentHTML` (search results, popular-pages, language-panel) escapes them first — audit `src/scripts/search-panel.ts`, `src/scripts/language-panel.ts`, `src/scripts/language.ts`. **Verified 2026-08-04: none of these three files write to `innerHTML`/`insertAdjacentHTML` at all — no sink present.** Note: a real DOM-XSS sink *was* found and fixed elsewhere this pass — see `src/blocks/gallery-lightbox/init.ts` (unescaped attachment `alt`/`src`/`poster` interpolated into `insertAdjacentHTML`).

## 2. Broken Access Control (OWASP A01)

- [x] Every admin-only action (settings page, protected-content key management, contact-form config) checks `current_user_can()` with the correct, least-privileged capability before acting. Verified: `kotlinskidev_ajax_regenerate_keys`/`kotlinskidev_ajax_get_wp_config_constants` (`functions/protection-helpers.php:686,719`) both gate on `manage_options`; all `add_options_page()`/`add_submenu_page()` registrations reviewed (`settings-page.php`, `maintenance.php`, `blog-topic-manager.php`, `protection-helpers.php`) use `manage_options`.
- [x] `functions/settings-page.php` and any options-writing handler verify a nonce **and** a capability check together — nonce alone isn't access control. All settings pages reviewed use the WordPress Settings API (`settings_fields()` + `options.php`), which enforces both the option-group nonce and the `manage_options` capability before any `update_option()` call.
- [ ] WordPress REST API user enumeration is blocked or rate-limited (`/wp-json/wp/v2/users` shouldn't leak usernames/IDs) — verify default behavior hasn't been left open.
- [ ] `?author=1` style user-ID enumeration via author archive redirects is disabled if not needed.
- [ ] Protected-content block (`functions/protection-helpers.php`, RSA-based) is tested for bypass: direct asset URL access, cached/rendered HTML leaking plaintext before decryption, replay of a captured decrypted payload.
- [ ] No IDOR-style pattern where a post/page/media ID from a request is used to fetch content without confirming the current user/context is allowed to see it (relevant to Polylang translation resolution and any "popular pages"/tracking lookups keyed by ID).
- [ ] File-system access via `novamira/read-file`, `write-file`, `delete-file` (see §15) is scoped — confirm it can't be reached by anything other than the authenticated MCP bearer-token path.

## 3. Cryptographic Failures (OWASP A02)

- [ ] HTTPS is enforced site-wide (HTTP→HTTPS redirect at Cloudflare and/or origin), including all internal links, asset URLs, and the contact-form POST target.
- [ ] HSTS is enabled (`Strict-Transport-Security` header) at Cloudflare or origin, with a sensible `max-age` and `includeSubDomains` — see `docs/security-headers.md` §2/§4 for the exact value and layer.
- [ ] Protected-content RSA keys (`kotlinskidev_get_or_create_keys`) are sourced from `wp-config.php` constants (`KOTLINSKIDEV_PRIVATE_KEY`/`PUBLIC_KEY`) in production, not the DB-options fallback — private key in `wp_options` is readable by any code with DB access (including a compromised plugin).
- [x] Private key material is never logged, echoed, or included in error messages/debug output. Verified via grep across `functions/*.php` — no `error_log`/`print_r`/`var_dump` call touches key/secret material.
- [ ] WordPress secret keys/salts (`AUTH_KEY`, `NONCE_KEY`, etc.) are unique, high-entropy, and not left at placeholder/default values — rotate if there's any chance they were ever committed or shared.
- [ ] `WP_MCP_API_KEY` / `WP_MCP_API_KEY_PROD` are strong, unique per environment, never committed (`.env` is gitignored — confirmed), and not reused between local and prod.
- [x] Password hashing uses WordPress core defaults (phpass/bcrypt via `wp_hash_password`) — no custom/weaker hashing introduced anywhere. No custom auth/hashing code exists in the theme.
- [ ] No sensitive data (API keys, form submissions, personal data) is logged in plaintext to `error_log`/`WP_DEBUG_LOG` in production.

## 4. Insecure Design (OWASP A04)

- [ ] Contact form (`functions/contact-form.php`) has captcha enforced (reCAPTCHA/Turnstile) on every deployed instance of the form, not just optionally per-block — confirm `enableCaptcha` defaults to on, or that forms without it have another abuse mitigation.
- [ ] Rate limiting exists for the contact form and any other public POST endpoint, independent of captcha (captcha alone doesn't stop slow/distributed abuse).
- [ ] Protected-content password gate has a threat model documented: what it protects against (casual access) vs. what it doesn't (a determined attacker with page source access) — make sure usage matches that reality.
- [ ] Page-view tracking (`functions/page-view-tracking.php`) can't be trivially spammed to pollute "popular pages" data (nonce + reasonable rate limit / dedup per session).
- [x] Account-recovery/login flows haven't been weakened by any custom `login.php` styling changes (styling-only — confirm no logic changes were introduced alongside it). `functions/login.php` only echoes `<style>` blocks hooked to `login_head`; no authentication logic touched.

## 5. Security Misconfiguration (OWASP A05)

- [ ] `WP_DEBUG_DISPLAY` is `false` in production (errors never rendered to visitors) and `WP_DEBUG`/`WP_DEBUG_LOG` are off or write to a non-web-accessible log path in production — **verify directly in your prod `wp-config.php`**, not via me.
- [ ] `DISALLOW_FILE_EDIT` and ideally `DISALLOW_FILE_MODS` are set in production `wp-config.php` to block the theme/plugin editor and in-dashboard plugin installs.
- [ ] Directory listing is disabled at the webserver level (`Options -Indexes` or nginx equivalent) for `wp-content/uploads/`, `wp-content/themes/`, etc.
- [ ] `.env`, `.git/`, `.envrc`, `composer.json`/`lock`, and any other dev-only files are not web-accessible on the production origin (test directly: `curl -I https://kotlinskidev.com/.env`, `/.git/config`).
- [ ] Security response headers are set (currently none found anywhere — confirmed 2026-08-09, see `docs/security-headers.md` for the full investigation): `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a `Content-Security-Policy` scoped to this site's actual third-party inventory (Google Fonts/Maps, Facebook Pixel, Google Analytics, Cloudflare Turnstile). `docs/security-headers.md` has the exact recommended values, the GDPR Art. 32 rationale, the PHP-vs-Cloudflare split, and the CSP Report-Only rollout plan — implement from there, not from this line alone.
- [ ] WordPress version number isn't exposed in `<meta name="generator">`, readme.html, or asset query strings.
- [ ] Default/guessable admin username (`admin`) is not in use; confirm via `wp user list` there's no obviously-named super-admin account.
- [ ] File permissions on the origin follow WordPress hardening guidance (directories 755, files 644, `wp-config.php` 600/640) — verify on the EC2 host, ties to `docs/monitoring.md`.
- [ ] Database table prefix is not the default `wp_`.

## 6. Vulnerable & Outdated Components (OWASP A06)

- [ ] Every **active** plugin (Polylang, Complianz, CSS/JS Manager, FileBird, Loco Translate, MCP Adapter, Novamira, Enable Abilities for MCP, Smush, WordPress PWA Manager, WP Mail SMTP, WPS Hide Login, Yoast SEO) is on a current, non-EOL version with no known CVEs (cross-check against WPScan's vulnerability DB).
- [ ] **Inactive plugins are removed, not just deactivated** — the current inventory includes several inactive-but-installed plugins (Akismet, All-in-One WP Migration, Contact Form TS, Custom Facebook/Google Loaders, Google Maps Block, KotlinskiDev Login Page, Responsive Font/Image/Spacing/Justify Controls, Slider Block, WP Downgrade). Deactivated code still ships on disk and is a real attack-surface/audit liability if a vulnerability is found in it later; delete anything not actually planned for reactivation.
- [ ] `npm audit` (or equivalent) is run on the theme's JS dependencies (`gsap`, `react`, `swiper`, `@wordpress/*`) with no unresolved high/critical advisories.
- [ ] WordPress core itself is current — confirm the version matches the latest stable release (env info reported WP 7.0 during this session; recheck at review time since core ships frequent point releases).
- [ ] A defined update cadence exists for core/plugins (auto-update for minor/security releases at minimum), not purely manual/ad-hoc.

## 7. Identification & Authentication Failures (OWASP A07)

- [ ] WPS Hide Login is actually configured with a non-default custom login slug (verify the plugin setting, not just that it's active).
- [ ] Login attempts are rate-limited/lockout-protected (no dedicated brute-force plugin currently in the active list — confirm something covers this, whether a plugin, Cloudflare rate-limiting rule, or `fail2ban` at the origin).
- [ ] 2FA is available for admin/editor accounts, especially given the MCP integration grants an API key equivalent to broad WordPress control (see §15) — compromise of a single admin account plus API key generation is a full site-takeover path.
- [ ] Session cookies are flagged `Secure`, `HttpOnly`, and `SameSite=Lax`/`Strict` as appropriate.
- [ ] Idle session timeout is reasonable for admin sessions; "remember me" duration is deliberate, not just the WordPress default left unexamined.
- [ ] Password policy (minimum strength) is enforced for all roles that can publish/upload, not just admins.

## 8. Software & Data Integrity Failures (OWASP A08)

- [ ] `package-lock.json` is committed and CI installs with `npm ci` (not `npm install`), so builds are reproducible and not silently pulling newer, unvetted dependency versions.
- [ ] GitHub Actions workflow (`.github/workflows/`) secrets are scoped to least privilege, not using an over-broad deploy token; secrets aren't echoed in workflow logs.
- [ ] Any third-party script loaded from a CDN (if ever introduced) uses Subresource Integrity (`integrity=`/`crossorigin`) attributes.
- [ ] Deploy pipeline verifies the `build/` artifact was produced by the pipeline itself, not accepting an arbitrary pre-built `build/` directory from an untrusted source.
- [ ] Auto-update mechanisms (WP core/plugin auto-updates) pull only from wordpress.org's signed update API, no custom/unsigned update source configured.

## 9. Security Logging & Monitoring Failures (OWASP A09)

- [ ] Failed login attempts, password resets, and role/capability changes are logged somewhere durable (plugin, server-level, or custom `functions/actions.php` hook), not just WordPress's default (mostly silent) behavior.
- [ ] Admin actions taken **through the MCP/Novamira integration** are logged with enough detail to reconstruct what an AI agent changed and when (see §15 — this is the newest and least battle-tested access path into the site).
- [ ] Server-level access/error logs (nginx/Apache, PHP-FPM) are retained long enough to investigate an incident after the fact — ties to the CloudWatch Logs setup in `docs/monitoring.md` (currently `syslog` only; confirm web server logs are covered too, or explicitly accepted as out of scope).
- [ ] There's an actual person/process that reviews alerts (the 5 CloudWatch alarms in `docs/monitoring.md` are infra-health, not security — consider whether a security-relevant alert, e.g. repeated 403/401s or admin-login spikes, should exist too).
- [ ] A basic incident-response note exists (who to contact, how to rotate all secrets/keys, how to take the site into maintenance mode) — `functions/maintenance.php` exists; confirm it's usable as an emergency lockdown, not just a planned-downtime feature.

## 10. Server-Side Request Forgery (OWASP A10)

- [x] Every `wp_remote_get`/`wp_remote_post` call (reCAPTCHA/Turnstile verification in `contact-form.php`, any image/URL fetchers) targets a fixed, hardcoded host — never a user-supplied URL passed through unchecked. Confirmed: the only two calls in the theme (`functions/contact-form.php:66,93`) hit hardcoded `google.com`/`cloudflare.com` verification endpoints; the secret/response values go in the POST body, not the URL.
- [x] If any feature ever accepts a user-supplied URL to fetch server-side (oEmbed-style embeds, remote image import), it validates against a host allowlist and blocks internal/private IP ranges (`127.0.0.1`, `169.254.169.254` EC2 metadata endpoint, RFC1918 ranges) to prevent SSRF into the EC2 instance's own metadata service. N/A — no such feature exists in the theme (no other `wp_remote_*` calls found).

## 11. CSRF & Nonce Coverage

- [ ] Every state-changing request (form submit, AJAX call, settings save) is nonce-protected — confirmed present in `cache.php`, `page-view-tracking.php`, `article-query-manager.php`, `contact-form.php`, `protection-helpers.php`; audit the remaining `functions/*.php` files for any POST/AJAX handler that lacks one.
- [ ] Nonces are scoped to a specific action (`wp_verify_nonce($token, 'specific_action')`), not a single shared nonce reused across unrelated actions.
- [ ] Nonce failures fail closed (reject the request) rather than degrading to an insecure fallback.

## 12. File Upload & Media Security

- [ ] SVG inline-rendering XSS risk from §1 is remediated before this checkbox is checked — treat as the highest-priority open item from this review.
- [ ] Upload MIME-type validation matches file content, not just the extension (WordPress's `wp_check_filetype_and_ext` — confirm nothing bypasses it).
- [ ] `wp-content/uploads/` has PHP execution disabled at the webserver level (`.htaccess`/nginx rule preventing `.php` execution from the uploads directory), so even if a malicious file is uploaded it can't be executed server-side.
- [ ] FileBird (active) folder/media permissions don't allow a lower-privileged role to move/access media outside their own uploads.
- [ ] Media library uploads are scanned or at minimum restricted to expected MIME types per role (no arbitrary file type allowed for Author-level uploads).

## 13. WordPress Core Hardening (CIS WordPress Benchmark-aligned)

- [ ] XML-RPC is disabled or restricted if not actively used (reduces brute-force and amplification-attack surface via `system.multicall`).
- [ ] `wlwmanifest.php` and other legacy discovery endpoints are removed/blocked if unused.
- [ ] `readme.html`, `license.txt`, and other version-revealing files are blocked from direct access.
- [x] Comments are confirmed fully disabled at the input/storage layer too (`functions/disable-comments.php` exists — verify it blocks the REST `/wp/v2/comments` endpoint and XML-RPC comment posting, not just the UI). `preprocess_comment` (`disable-comments.php:12`) is applied inside WordPress core's `wp_filter_comment()`, which both `wp-comments-post.php` and `WP_REST_Comments_Controller::create_item()` (via `wp_new_comment()`) call — so the REST endpoint is covered by the same filter, not just the UI. `xmlrpc_methods` additionally strips the XML-RPC comment methods as defense in depth.
- [ ] `security.txt` (`/.well-known/security.txt`) exists so a researcher has a defined disclosure channel, given this is a public personal/business site.

## 14. Privacy, Cookies & GDPR (ISO/IEC 27701-adjacent)

- [ ] Complianz (active) is actually configured for the site's real cookie/tracking inventory, not left on defaults — cross-check against every script enqueued in `functions/tracking-scripts.php` and `page-view-tracking.php`.
- [ ] All tracking/analytics scripts are gated behind actual consent state, not fired unconditionally before consent is given.
- [ ] Third-party data processors (Google reCAPTCHA, Cloudflare Turnstile, any analytics) are disclosed in the privacy policy, with lawful basis noted.
- [ ] Contact form submissions (name/email/message) have a defined retention period and deletion process, not indefinite storage.
- [ ] A functioning data-subject-access/erasure request path exists (WordPress core's built-in privacy tools, or manual process documented).
- [ ] Polylang-driven PL/EN content doesn't leak one locale's private/protected content through the other via mistranslated visibility settings.

## 15. MCP / AI-Agent Attack Surface (project-specific — highest novelty, least battle-tested)

- [ ] `WP_MCP_API_KEY` (local) and `WP_MCP_API_KEY_PROD` (once issued) are treated as full-admin-equivalent credentials — because they effectively are one: `novamira/execute-php` runs arbitrary PHP with full WordPress/`$wpdb` context, and `novamira/write-file`/`delete-file` touch the filesystem outside the sandbox for non-PHP files.
- [ ] The MCP endpoint (`/wp-json/mcp/*`) is not reachable without the bearer token, and ideally is also IP-allowlisted or otherwise network-restricted at Cloudflare for the production key once it goes live (per `docs/mcp-wordpress-setup.md` § Production, not yet issued as of the last check).
- [ ] There's a defined key-rotation process, and a plan to revoke immediately if a key is ever suspected leaked (committed by accident, shared in a screenshot, etc.).
- [ ] `novamira/execute-php` and file-write abilities are not exposed to any lower-trust caller — confirm the plugin's own auth model doesn't allow a non-admin WordPress user to generate an MCP key for themselves.
- [ ] Actions taken via MCP abilities are attributable (agent/session label) and logged (ties to §9) so a destructive or unexpected change can be traced back to *which* session made it.
- [ ] The production MCP key, when issued, uses `ewpa/*` content abilities only (per existing setup notes) and does **not** get `novamira/execute-php`/file-system abilities on production unless there's a specific, reviewed reason — local/staging is the appropriate place for unrestricted PHP execution, not the live site.
- [ ] Rate limiting exists on the MCP endpoint independent of WordPress's normal request handling, so a leaked key can't be used to script large-scale destructive changes before it's noticed/revoked.

## 16. Infrastructure & Network (ties to `docs/522.md` / `docs/monitoring.md`)

- [ ] Cloudflare WAF rules are enabled (at least the free managed ruleset) in front of the origin.
- [ ] Cloudflare rate limiting covers the login page, contact form, and any other public POST endpoint.
- [ ] The EC2 security group only exposes the ports actually needed (443/80 from Cloudflare IP ranges ideally, SSH restricted to known IPs, not `0.0.0.0/0`).
- [ ] SSH access uses key-based auth only, no password auth, and ideally goes through EC2 Instance Connect / a bastion rather than a permanently open port.
- [ ] Backups (All-in-One WP Migration, present though inactive — confirm what actually produces backups) are encrypted at rest and stored somewhere other than the same EC2 instance, so a compromised/corrupted instance doesn't take the backups down with it.
- [ ] CloudPanel's 10 concurrent PHP-FPM version stacks (flagged in `docs/monitoring.md` as a resource risk) are also a security-hygiene concern — unused PHP versions should be removed, not just left idle, since each is additional attack surface if a version-specific vulnerability surfaces.

## 17. ISO/IEC 27001:2022 Annex A Cross-Reference

Full ISO 27001 certification is an organizational-management-system exercise beyond a single theme's codebase, but the Annex A control families map cleanly onto sections above — useful if this ever needs to be presented against a formal framework:

| Annex A theme | Relevant sections above |
|---|---|
| A.5 Organizational controls (policies, roles, supplier relationships) | §6 (component/vendor management), §15 (MCP key governance), §17 process notes |
| A.6 People controls (screening, awareness, disciplinary) | §7 (auth), §15 (key handling discipline) — process, not code |
| A.7 Physical controls | Out of scope (managed AWS infra) |
| A.8 Technological controls (access control, malware protection, secure config, logging, crypto, dev security) | §1–3, §5, §9, §12, §13 |
| A.9 (legacy 27001:2013 numbering) Access control | §2, §7 |
| A.12 Operations security | §6, §9, §16 |
| A.13 Communications security | §3 (TLS/HSTS), §16 (network) |
| A.14 System acquisition, development & maintenance | §4 (secure design), §8 (integrity), §1 (secure coding) |
| A.16 Incident management | §9 |
| A.18 Compliance (legal, privacy, IP) | §14 |

Also worth keeping on the radar as complementary, more code-specific frameworks: **OWASP ASVS** (Application Security Verification Standard) for a deeper per-control checklist than Top 10 alone, and the **CIS WordPress Benchmark** for WordPress-specific hardening baselines beyond what's already folded into §13.

## 18. Regression Prevention & Review Cadence

- [ ] A WPScan (or equivalent) vulnerability scan runs periodically against the live site, not just at initial setup.
- [ ] This checklist itself is re-run on a defined cadence (e.g. quarterly, or after any plugin/infra change), not treated as a one-time pass.
- [ ] `npm audit`/dependency scanning is wired into CI so a new vulnerable dependency fails the build rather than being discovered later.
- [ ] Any finding checked off here has the fix committed with a reference back to the checklist item, so future reviews can see what was already addressed and why.
