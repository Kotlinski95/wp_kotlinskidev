# Which MCP Server (and Abilities) to Use for What

The WordPress site exposes **one MCP server** that aggregates abilities from several plugins. "Which server" is therefore really two questions: which **endpoint URL** to connect to, and which **ability family** to use for a given task.

Related docs: [`mcp-wordpress-setup.md`](mcp-wordpress-setup.md) (how the connection works), [`env.md`](env.md) (where the API key lives).

## Endpoints

| Endpoint | Status |
|---|---|
| `/wp-json/mcp/novamira` | **Preferred.** The actual server (Novamira plugin). |
| `/wp-json/mcp/mcp-adapter-default-server` | Legacy alias for the same server. Still works; currently used by our client configs. |

Both serve the identical ability catalogue via three meta-tools: `mcp-adapter-discover-abilities`, `mcp-adapter-get-ability-info`, `mcp-adapter-execute-ability`.

## Ability families — pick by task

### `core/*` — site diagnostics (read-only)

Site title/URL/language, current user, PHP/DB/WP versions. Use for quick environment checks.

### `ewpa/*` — content management (scoped, safest)

From the **Enable Abilities for MCP** plugin (~47 abilities). Use for routine content work:

- Posts, pages, CPT items: list, read, create, update, delete
- Categories, tags, taxonomy assignment
- Media library, image upload from URL
- Comments: moderate, reply, edit
- SEO metadata: Yoast (`yoast-*`), Rank Math, SEOPress
- Translations (Polylang): set language, link translations, read translation maps
- Post meta by exact key, search/replace in post content, site stats

These abilities cannot touch code, files, options, or the database — that limit is the point. Prefer them whenever they cover the task.

### `novamira/*` — full site control (powerful, use deliberately)

From the **Novamira** plugin. Use when `ewpa/*` cannot do it:

| Task | Ability |
|---|---|
| Read/write options, query the DB, anything programmatic | `execute-php` |
| Inspect or edit files on the server | `read-file`, `write-file`, `edit-file`, `delete-file`, `list-directory` |
| Run WP-CLI remotely | `run-wp-cli` (+ `get-wp-cli-job` for async) |
| Edit **native Gutenberg block content** reliably | `gutenberg-*` queue (pending batches finalized in a browser tab) |
| Upload a local file to the server | `create-upload-link` |
| Log into wp-admin via browser automation | `create-admin-access-link` |
| Reusable task instructions stored in WP | `skill-get`, `skill-write`, … |

The Gutenberg queue matters: `ewpa/update-post` writes raw HTML content, which corrupts native/third-party block markup. For block-editor content, use the `novamira/gutenberg-*` flow instead.

### Plugin extras

- `wp-mail-smtp/get-debug-events` — inspect mail sending failures
- `yoast-seo/get-seo-scores`, `get-readability-scores` — recent post scores

## Local vs production

Choose **per environment**, not per plugin:

- **LocalWP (`kotlinskidev.local`)** — everything enabled, including `novamira/*`. It is the development superpower set; worst case is a broken local site.
- **Production (`kotlinskidev.com`)** — if MCP is ever exposed there, install only the scoped content stack (`ewpa/*`) or disable Novamira's code/file abilities. `novamira/execute-php` behind a Bearer key is remote code execution: a leaked production key would mean full site compromise, not just spam posts. Use a dedicated, revocable key per client and environment.

## Clients currently connected

MCP server names carry an environment suffix so chats always show which site is being touched: `wordpress-local` (LocalWP) and `wordpress-prod` (kotlinskidev.com). Tool calls are prefixed accordingly, e.g. `mcp__wordpress-local__mcp-adapter-execute-ability`.

| Client | Config | Auth |
|---|---|---|
| Claude Code CLI | `.mcp.json` in the theme root | `${WP_MCP_API_KEY}` / `${WP_MCP_API_KEY_PROD}` from `.env` via direnv — see [`env.md`](env.md) |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` → `mcp-remote` proxy (`--allow-http` needed for the local site only) | Same keys, pasted into `env.AUTH_HEADER` in that file |

Both currently point at the legacy alias endpoint; when switching to `/wp-json/mcp/novamira`, update both configs plus `mcp-wordpress-setup.md`. Production setup steps live in [`mcp-wordpress-setup.md`](mcp-wordpress-setup.md#production-kotlinskidev).

## Rules of thumb

1. Reading or writing ordinary content? → `ewpa/*`.
2. Native block layouts? → `novamira/gutenberg-*` queue, never raw content writes.
3. Options, DB, or anything with no dedicated ability? → `novamira/execute-php`.
4. Files or WP-CLI? → `novamira/*` file abilities / `run-wp-cli`.
5. On production: content abilities only, scoped key, ask before destructive actions.
