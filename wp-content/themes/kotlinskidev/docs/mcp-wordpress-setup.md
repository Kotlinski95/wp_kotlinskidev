# Connecting Claude Code to WordPress via MCP (NIBWP)

[NIBWP](https://wordpress.org/plugins/nibwp/) turns the WordPress site into a Model Context Protocol (MCP) server, using the official `wordpress/mcp-adapter` and the WordPress Abilities API. Claude Code connects to it as an HTTP MCP client authenticated with a WordPress Application Password, and can then manage content (posts, pages, media, etc.) directly against the site.

## 1. Install and activate the plugin

Install via **wp-admin → Plugins → Add New → search "NIBWP"**, or from the LocalWP site shell:

```bash
wp plugin install nibwp --activate
```

## 2. Configure NIBWP in wp-admin

1. Open the **NIBWP Connect** screen in the dashboard.
2. Enable **AI Abilities** and choose which capabilities to expose (posts, pages, media, etc.).
3. Generate an **Application Password** for the connection — this is WordPress core's app-password feature, one per AI client, revocable any time. Copy it immediately; it is shown only once.

### LocalWP gotcha

Application Passwords require HTTPS by default. Either enable SSL for the site in LocalWP (and trust the certificate), or rely on LocalWP setting the environment type to `local`, which usually allows them over plain HTTP. If the app-password UI is missing under **Users → Profile**, this is the reason.

## 3. Connect Claude Code

The NIBWP Connect screen shows a ready-made `claude mcp add` command — copy it verbatim. It looks roughly like:

```bash
claude mcp add --transport http wordpress \
  https://kotlinskidev.local/wp-json/<endpoint-shown-by-nibwp> \
  --header "Authorization: Basic $(echo -n 'youruser:xxxx xxxx xxxx xxxx xxxx xxxx' | base64)"
```

Notes:

- Use the exact endpoint URL from the Connect screen — do not guess it.
- Pick a scope:
  - `--scope local` (default) — this project only, credentials stay out of git. **Recommended.**
  - `--scope user` — available in all your projects.
  - `--scope project` — written to `.mcp.json` and checked into git. **Do not use** — the credential would land in the repository.
- If the LocalWP certificate is self-signed and the connection fails on TLS, either trust the cert in LocalWP (the "Trust" button next to the site's SSL) or use the `http://` URL.

## 4. Verify

```bash
claude mcp list
```

Then restart the Claude Code session (or run `/mcp` inside it) — the WordPress tools should appear. From then on, tasks like "create a draft post titled X" or "update the PL translation of page Y" can be executed directly against the site.

## Current working setup (verified 2026-07-08)

> Historical note: this project first used the NIBWP plugin, which exposed abilities over plain REST only (no MCP endpoint). It was replaced by the stack below; NIBWP has been uninstalled.

The site now runs the official MCP stack:

- **WordPress core Abilities API** (WP 6.9+) — the capability registry
- **[WordPress/mcp-adapter](https://github.com/WordPress/mcp-adapter)** (installed from GitHub releases) — the actual MCP server, Streamable HTTP at `/wp-json/mcp/mcp-adapter-default-server`
- **[Enable Abilities for MCP](https://wordpress.org/plugins/enable-abilities-for-mcp/)** — registers ~47 content abilities (`ewpa/*`), all flagged `mcp.public`

The default server exposes three meta-tools — `mcp-adapter-discover-abilities`, `mcp-adapter-get-ability-info`, `mcp-adapter-execute-ability` — which proxy all public abilities. Execute calls take `{"ability_name": "ns/name", "parameters": {...}}`.

Protocol notes (for manual curl debugging): the endpoint implements MCP spec 2025-11-25 — send `initialize` first, capture the `Mcp-Session-Id` response header, and pass it on every subsequent request. Auth accepts WordPress Application Passwords (HTTP Basic) or the Enable Abilities plugin's scoped API keys (`Authorization: Bearer <key>`).

### Claude Code connection

`.mcp.json` in the **theme root** (committed — Claude Code reads it from the directory where `claude` is launched, NOT from `.claude/`):

```json
{
  "mcpServers": {
    "wordpress-local": {
      "type": "http",
      "url": "http://kotlinskidev.local/wp-json/mcp/mcp-adapter-default-server",
      "headers": {
        "Authorization": "Bearer ${WP_MCP_API_KEY}"
      }
    }
  }
}
```

Server names carry an environment suffix (`wordpress-local`, `wordpress-prod`) so it is always visible in a chat which site a tool call targets.

The secret comes from the environment:

1. Generate an API key in the Enable Abilities plugin settings (wp-admin), scoped to the MCP routes.
2. `cp .env.example .env` in the theme root and paste the key (`.env` is gitignored; `.env.example` is the committed template).
3. Load it before launching Claude Code — either install [direnv](https://direnv.net/) (`brew install direnv`, hook it into your shell, run `direnv allow` once; the committed `.envrc` auto-loads `.env`), or manually: `set -a; source .env; set +a; claude`.
4. Verify with `/mcp` inside the session — the `wordpress` server should list its three tools.

## Production (kotlinskidev.com)

The production site gets its own MCP server named `wordpress-prod`, with a **content-only ability set** — see `mcp-server-usage.md` for why Novamira must stay off production (its `execute-php` / file abilities behind a leaked key equal remote code execution).

### Server side (wp-admin on kotlinskidev.com)

1. Confirm WordPress ≥ 6.9 (core Abilities API required; local runs 7.0).
2. Install and activate **MCP Adapter** (from [GitHub releases](https://github.com/WordPress/mcp-adapter)) and **Enable Abilities for MCP** (wordpress.org). Do **not** install Novamira.
3. In the Enable Abilities settings, generate a dedicated API key scoped to the MCP routes — one per client/device, revocable individually.
4. Verify the endpoint is live (401 = exists, auth required):

   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST https://kotlinskidev.com/wp-json/mcp/mcp-adapter-default-server
   ```

### Client side

1. Paste the key into the theme-root `.env` as `WP_MCP_API_KEY_PROD` (placeholder already in `.env.example`), then let direnv reload (`cd` out and back in, or `direnv reload`).
2. Add the server to `.mcp.json` next to `wordpress-local`:

   ```json
   "wordpress-prod": {
     "type": "http",
     "url": "https://kotlinskidev.com/wp-json/mcp/mcp-adapter-default-server",
     "headers": {
       "Authorization": "Bearer ${WP_MCP_API_KEY_PROD}"
     }
   }
   ```

   `wordpress-prod` is already whitelisted in `.claude/settings.local.json` → `enabledMcpjsonServers`. Restart the Claude Code session afterwards.
3. Claude Desktop — add to `~/Library/Application Support/Claude/claude_desktop_config.json` (HTTPS, so no `--allow-http`; paste the key literally, Desktop reads no `.env`):

   ```json
   "wordpress-prod": {
     "command": "/opt/homebrew/bin/npx",
     "args": ["-y", "mcp-remote", "https://kotlinskidev.com/wp-json/mcp/mcp-adapter-default-server", "--header", "Authorization:${AUTH_HEADER}"],
     "env": { "AUTH_HEADER": "Bearer <paste-prod-key>" }
   }
   ```

   Then fully quit (⌘Q) and reopen the app.

### Production ground rules

- Content abilities (`ewpa/*`) only; no code or file access.
- Dedicated key per client, never reused from local, rotated/revoked in wp-admin.
- Destructive actions (delete, option changes) require explicit confirmation in chat.

## Team / multi-device setup

Everything needed to reproduce this connection on another device or by another team member is in this repo — except the secret:

1. **What is shared via git**: this document (endpoints, calling conventions) and the permission allowlist in `.claude/settings.json` at the WordPress root (`Bash(curl * http://kotlinskidev.local/*)`), which lets Claude Code call the site without permission prompts.
2. **What each person/device provides**: their own Application Password. Generate one in **wp-admin → Users → Profile → Application Passwords** (one per device/person, individually revocable). Never commit it — paste it to Claude in a session and ask it to remember; Claude stores it in its machine-local memory (`~/.claude/projects/<project>/memory/`), which does not sync between devices.
3. **Site URL differs per environment**: `http://kotlinskidev.local` only resolves on a machine running the LocalWP site. Another device has its own LocalWP URL, and production is `https://kotlinskidev.com` — adjust the endpoint and the permission rule accordingly.

## Local WP-CLI setup (done 2026-07-08)

Global `wp` was missing (`bash: wp: command not found`). It is now installed and configured on this machine:

1. **Installed WP-CLI 2.12.0 via Homebrew** — `brew install wp-cli`. This also installed PHP 8.5 as a dependency (`/opt/homebrew/bin/php`), since no PHP was on the PATH.
2. **Pointed brew PHP at LocalWP's MySQL socket** — LocalWP runs each site's MySQL on a per-site socket, not the standard location. Created `/opt/homebrew/etc/php/8.5/conf.d/zz-localwp.ini`:

   ```ini
   mysqli.default_socket = "/Users/adriankotlinski/Library/Application Support/Local/run/eWJPKpiL2/mysql/mysqld.sock"
   pdo_mysql.default_socket = "/Users/adriankotlinski/Library/Application Support/Local/run/eWJPKpiL2/mysql/mysqld.sock"
   error_reporting = E_ALL & ~E_DEPRECATED & ~E_NOTICE
   ```

   `eWJPKpiL2` is this site's LocalWP ID (see `~/Library/Application Support/Local/sites.json`). If the site is ever re-created in LocalWP, the ID changes and this path must be updated.

Caveats:

- **The site must be running in LocalWP** for any `wp` command that touches the database — otherwise: `Error: Error establishing a database connection.`
- Run `wp` from anywhere inside `~/Local Sites/kotlinskidev/app/public/` (it finds WordPress by walking up), or pass `--path="/Users/adriankotlinski/Local Sites/kotlinskidev/app/public"`.
- PHP 8.5 prints some deprecation warnings from the wp-cli 2.12 phar internals. They are cosmetic; commands still work. If they become annoying, install `php@8.4` via brew and run wp-cli with it.
- LocalWP also bundles its own PHP + wp-cli (`/Applications/Local.app/Contents/Resources/extraResources/bin/wp-cli/wp-cli.phar`), available preconfigured via the site's "Open Site Shell" — a fallback if the global install ever breaks.

## MCP vs WP-CLI

For a LocalWP site on the same machine, most content/admin operations are already possible via **WP-CLI** (`wp post create`, `wp option update`, …) from the Local site shell — no plugin needed. The MCP route provides structured, permission-scoped access and also works against the live [kotlinskidev.com](https://kotlinskidev.com) site, where no shell is available. Use MCP for production; WP-CLI already covers local-only tasks.
