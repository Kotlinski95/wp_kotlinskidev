# Environment Variables (`.env`)

How secrets are provided to Claude Code in this theme, and — the part that trips people up — where Claude Code *actually* reads them from.

## The files

All of these live in the **theme root** (`wp-content/themes/kotlinskidev/`):

| File | Committed | Purpose |
|---|---|---|
| `.env` | No (gitignored) | The actual secrets: `WP_MCP_API_KEY` (local site) and `WP_MCP_API_KEY_PROD` (production, once set up). |
| `.env.example` | Yes | Template listing the required variables with placeholder values. |
| `.envrc` | Yes | direnv config — a single `dotenv` directive that auto-loads `.env`. |
| `.mcp.json` | Yes | Claude Code MCP config. References the secret as `${WP_MCP_API_KEY}` — never contains the value itself. |

`WP_MCP_API_KEY` is an API key generated in the **Enable Abilities for MCP** plugin settings (wp-admin), used as a Bearer token for the WordPress MCP endpoint. See `docs/mcp-wordpress-setup.md` for the full MCP picture.

## Where Claude Code actually reads it from

**Claude Code never reads the `.env` file.** It has no dotenv loader.

What actually happens:

1. Claude Code reads `.mcp.json` from the directory where `claude` was launched (the theme root — not from `.claude/`).
2. It expands `${WP_MCP_API_KEY}` in that file from **the environment of the shell process that launched `claude`**.
3. Something therefore has to export the variable into that shell *before* `claude` starts. That "something" is direnv (or a manual `source` — see below).

Consequences:

- If the variable is not in the shell environment, the expansion fails and the `wordpress-local` MCP server won't authenticate. Editing `.env` alone fixes nothing until the shell reloads it.
- Launching `claude` from a different directory, an IDE launcher, or a shell where direnv hasn't run means no variable, no MCP auth.
- After changing `.env`, restart the Claude Code session — the environment is captured at launch.

## Loading `.env` into zsh

### Option A — direnv (the setup on this machine)

direnv is hooked into zsh via `~/.zshrc`:

```zsh
eval "$(direnv hook zsh)"
```

The committed `.envrc` in the theme root contains just:

```text
dotenv
```

which tells direnv to load `.env` from the same directory. The result: every time you `cd` into the theme (or any subdirectory), `WP_MCP_API_KEY` is exported automatically; when you leave, it is unloaded.

First-time setup on a new machine:

```bash
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc   # if not already there
cp .env.example .env                            # then paste the real key
direnv allow                                    # one-time trust of .envrc
```

direnv refuses to run an `.envrc` until you `direnv allow` it, and asks again whenever `.envrc` changes.

### Option B — manual, no direnv

Load `.env` into the current shell, then launch:

```bash
set -a; source .env; set +a; claude
```

`set -a` makes every variable assigned by `source .env` exported; plain `source` alone would set them as shell-local variables that child processes (like `claude`) never see.

### What not to do

- Don't paste the key into `~/.zshrc` as a global `export` — it leaks into every process on the machine and outlives key rotation.
- Don't hardcode the key in `.mcp.json` — that file is committed.
- Don't commit `.env` — it's in `.gitignore` (root `.gitignore`, `.env` entry) on purpose.

## Adding a new variable

1. Add the real value to `.env`.
2. Add a placeholder line to `.env.example`.
3. Reference it where needed (e.g. `${MY_VAR}` in `.mcp.json`).
4. Re-enter the directory (direnv reloads automatically) or re-source, then restart the Claude Code session.

## Verifying

```bash
cd "path/to/wp-content/themes/kotlinskidev"
echo $WP_MCP_API_KEY        # should print the key (direnv loaded it)
```

Then inside a Claude Code session, `/mcp` should show the `wordpress-local` server with its three tools. If it shows an auth error, the variable was missing at launch.
