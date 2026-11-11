# Site documentation

Docs for the kotlinski.dev website as a whole: hosting, Cloudflare, deployment, backups, local environment and the WordPress MCP connection. Documentation for the theme code (blocks, build, tests, review checklists, architecture) lives in `wp-content/themes/kotlinskidev/docs/`.

| Doc | Covers |
| --- | --- |
| `AWS.md` | Lightsail host, firewall, TLS, origin lockdown checklist |
| `cloudflare.md` | Source of truth for the Cloudflare zone, with plain-language explanations |
| `deployment.md` | GitHub Actions deploy to Lightsail |
| `lightsail-migration.md` | EC2 to Lightsail migration and its pitfalls |
| `monitoring.md` | CloudWatch alarms and agent setup |
| `522.md` | Cloudflare 522 incident runbook |
| `backups.md` | Pulling client sites into Local and pushing back |
| `local.md` | LocalWP environment fixes |
| `mcp-wordpress-setup.md` | Connecting Claude Code to WordPress through MCP |
| `mcp-server-usage.md` | Which MCP endpoint and abilities to use |
| `cache-warming.md` | Script that warms the Cloudflare cache for every page and its media |
| `language-sync.md` | Syncing the PL version with the EN version |
