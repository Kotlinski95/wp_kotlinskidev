# Deployment

Every push to `master` runs `.github/workflows/deploy.yml`: build theme, back up the current files on Lightsail, rsync the whitelisted paths, clear transients and caches, reload Apache, smoke-test the site, and restore the backup if anything fails.

## What gets deployed

Only paths listed under `include:` in `.github/deploy-manifest.yml`, minus its `exclude:` rules (the theme's `vendor/` is excluded because production runs PHP 8.2 and Sentry is skipped without it). Anything not listed is never copied or deleted on the server (uploads, `wp-config.php`, third-party plugins, WP core). Add a new theme folder or custom plugin to the list before it can ship.

## Skipping a deploy

- Put `[skip deploy]` in the merge commit message or PR title.
- Add the `no-deploy` label to the PR before merging.
- Tick the "Skip deploy after merge" checkbox in the PR description (from `.github/pull_request_template.md`).
- Cancel the running workflow in the Actions tab.

## One-time setup

1. **Deploy SSH key.** Run `ssh-keygen -t ed25519 -f deploy_key -N ""`. Append `deploy_key.pub` to `/home/admin/.ssh/authorized_keys` on the instance.
2. **Host key.** Run `ssh-keyscan -t ed25519 <static-ip>` and keep the output.
3. **AWS OIDC provider.** IAM → Identity providers → Add → OpenID Connect, URL `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`.
4. **IAM role** with this trust policy (replace `ACCOUNT_ID`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": { "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
             "token.actions.githubusercontent.com:sub": "repo:Kotlinski95/wp_kotlinskidev:environment:production"
           }
         }
       }
     ]
   }
   ```

5. **Role permissions:** `lightsail:GetInstance`, `lightsail:OpenInstancePublicPorts`, `lightsail:CloseInstancePublicPorts`, limited to the one instance's ARN.
6. **GitHub → Settings → Environments → `production`.** Do not add required reviewers (deploys are automatic).
   - Secrets: `SSH_PRIVATE_KEY` (contents of `deploy_key`), `SSH_KNOWN_HOSTS` (the `ssh-keyscan` output).
   - Variables: `AWS_ROLE_ARN`, `AWS_REGION`, `LIGHTSAIL_INSTANCE_NAME`, `SSH_HOST` (static IP), `SSH_USER` (`admin`), `DEPLOY_PATH` (`/var/www/html`), `SITE_URL`.
7. **Lightsail firewall.** Remove the SSH rule open to `0.0.0.0/0` once the first deploy works. The workflow opens port 22 for the runner IP only and closes it afterwards. Keep your own IP or the browser-SSH range if you still need console access.

## Rollback

Each deploy stores `/var/www/deploy-backups/<commit-sha>.tar.gz` (last 5 kept). A failed deploy restores it automatically. To roll back by hand, `cd /var/www/html && tar xzf ../deploy-backups/<sha>.tar.gz`, then run `wp transient delete --all` and `wp cache flush`.

## Syncing local content to production

The deploy workflow ships code only. Pages, templates edited in the Site Editor, menus, settings and media are moved with `db/sync-to-prod.sh`, run from your Mac (it lives in `db/` at the WordPress root, next to `sync_db.sh`).

One-time setup:

1. Copy `db/sync-to-prod.env.example` to `db/sync-to-prod.env` (gitignored) and check the values.
2. Take a Lightsail snapshot before the first run.
3. Run the script from Local's site shell (Local → your site → Open site shell), because it needs `mysqldump`.

Usage:

```bash
db/sync-to-prod.sh --dry-run
db/sync-to-prod.sh
db/sync-to-prod.sh --db-only
db/sync-to-prod.sh --media-only
```

What it does:

- Syncs `wp-content/uploads/` with rsync (no deletions on the server).
- Backs up the production database to `~/db-backups/` on the server (last 5 kept).
- Puts the site in maintenance mode, imports the local database, then rewrites the local host and local file path to the production ones (`https` forced) and keeps the production value of every option in `PRESERVE_OPTIONS`.
- Leaves tables matching `SKIP_TABLES_REGEX` (Wordfence, WP Mail SMTP, users, usermeta, comments, contact form submissions, Novamira, Action Scheduler and log tables by default) untouched on production.
- Flushes caches, transients and rewrite rules, reloads Apache, leaves maintenance mode and smoke-tests the site.
- Never reads or writes `wp-config.php`, plugins or the theme (those ship through the deploy workflow).

The `users` and `usermeta` tables are skipped by default, so production keeps its own accounts and passwords. Posts keep the author ID they have locally, so the production admin should have the same user ID as the local author.
