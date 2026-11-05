---
name: security-headers
description: "Load the kotlinskidev theme's HTTP security header reference (docs/security-headers.md) before touching anything related to response security headers, CSP, or third-party script/embed integrations. Use when asked to add/audit/change a security header, implement or update Content-Security-Policy, evaluate the CSP impact of a new third-party script/plugin/embed, or propose the PHP-vs-Cloudflare implementation split. Also use proactively whenever a change introduces a new external domain the site loads a script/font/image/iframe from."
---

# Security Headers

`docs/security-headers.md` is the source of truth for this theme's HTTP security header posture — recommended values, the GDPR/EU regulatory rationale, this site's actual third-party domain inventory, and the PHP-vs-Cloudflare implementation split. Read it in full before doing anything below; don't reconstruct this from general knowledge when a grounded, site-specific answer already exists.

## When this skill applies

- Adding, changing, or auditing any of: `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`.
- Implementing or updating `functions/security-headers.php` (once it exists) or a Cloudflare Transform Rule for headers.
- **Introducing any new external domain** the site loads a script, stylesheet, font, image, or iframe from — a new tracking pixel, a new embed widget, a new CDN-hosted library, a new plugin that calls out to a third-party API from the browser. If `docs/security-headers.md` §3's CSP is ever implemented in enforcing mode, this is exactly the kind of change that silently breaks in production if the CSP allowlist isn't updated alongside it.
- Reviewing/auditing current header state (`docs/security.md` §3 items 33–34, §5 item 56 reference this doc — keep them in sync, don't duplicate content back into that file).

## What to do

1. **Read `docs/security-headers.md` in full first.** It has the actual recommended values (not generic ones — GDPR-Art.-32-grounded, OWASP-Secure-Headers-Project-sourced, and cross-checked against this site's real plugin/script inventory), plus the specific reasons certain common defaults are wrong for this project (e.g. Cloudflare's one-click "Add security headers" Managed Transform ships deprecated `X-XSS-Protection`/`Expect-CT` values — don't use it; use a custom Transform Rule instead).
2. **If the task adds a new third-party domain:** check §3's inventory table, add the new domain to the appropriate CSP directive, and flag that the CSP needs to stay in `Content-Security-Policy-Report-Only` mode (never jump straight to enforcing) until the new domain's behavior is confirmed via real browser reports — see §3's rollout strategy.
3. **If the task is implementation** (writing `functions/security-headers.php` or a Cloudflare Transform Rule): follow §4's split exactly — static, non-conditional headers at the Cloudflare edge; CSP (with its Report-Only rollout) and anything conditional on WP state in PHP via `send_headers`. Confirm what caching layer sits in front of this site before assuming PHP-set headers reach every response — §4 flags this explicitly as a thing to verify, not assume.
4. **If the task is auditing/reviewing:** compare live response headers (`curl -I` against the real site, or securityheaders.com per §5) against §2's recommended table, and report gaps — don't just recite the table, confirm actual current state first.
5. **Keep `docs/security-headers.md` itself current.** If a new header becomes relevant, a domain in §3's table turns out wrong, or OWASP/Cloudflare guidance changes, update that file directly rather than letting this skill's own knowledge drift out of sync with it. Log the change per `.claude/skills/sync-docs/SKILL.md`.

## Don't

- Don't propose a generic, copy-pasted CSP — this project's whole reason for the site-specific inventory table is to avoid that.
- Don't recommend enforcing CSP without a Report-Only rollout period first, regardless of how confident the domain inventory looks.
- Don't touch `wp-config.php` or any file under `wp-content/plugins/` — per the root `CLAUDE.md`, those are off-limits; header logic belongs in the theme (`functions/security-headers.php`) or at the Cloudflare edge, never in a plugin file.
