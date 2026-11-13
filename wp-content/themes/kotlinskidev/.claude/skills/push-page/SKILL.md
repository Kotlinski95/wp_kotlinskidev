---
name: push-page
description: Copy a page or post built in the Local WordPress editor to production, with its images, using bin/push-page.mjs. Use when asked to push, copy, move or publish a page from Local to prod. Pass the page slug as the argument.
---

Run, from the theme root, and report only the script's output:

1. `npm run push-page -- <slug> --dry-run`
2. If the plan looks right: `npm run push-page -- <slug>` (creates a draft or updates the existing page)
3. Add `--publish` only when the user asks to go live. Add `--type=posts` for posts.

On a `missing env` error, tell the user to fill the `WP_LOCAL_*` and `WP_PROD_*` values in `.env` (see `.env.example`). Do not read `.env`.
