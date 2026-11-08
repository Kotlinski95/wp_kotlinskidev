#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
config="${SYNC_CONFIG:-$script_dir/sync-to-prod.env}"

if [[ ! -f "$config" ]]; then
  echo "Missing $config. Copy sync-to-prod.env.example to sync-to-prod.env and fill it in." >&2
  exit 1
fi

source "$config"

: "${SSH_HOST:?SSH_HOST is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${PROD_URL:?PROD_URL is required}"
: "${PROD_PATH:?PROD_PATH is required}"

SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
LOCAL_WP_ROOT="${LOCAL_WP_ROOT:-$(git -C "$script_dir" rev-parse --show-toplevel)}"
SKIP_TABLES_REGEX="${SKIP_TABLES_REGEX:-(^|_)(wf|wpmailsmtp_)[a-z0-9_]*$|^[a-z0-9]+_(users|usermeta|comments|commentmeta|kotlinskidev_contact_submissions|novamira_[a-z_]+|actionscheduler_[a-z_]+|redirection_(404|logs)|wpai_request_logs|ewpa_activity_log)$}"
PRESERVE_OPTIONS="${PRESERVE_OPTIONS:-blog_public}"
MEDIA_EXCLUDES="${MEDIA_EXCLUDES:-.DS_Store ai1wm-backups cache *.log}"
KEEP_DB_BACKUPS="${KEEP_DB_BACKUPS:-5}"

do_db=true
do_media=true
dry_run=false
assume_yes=false

for arg in "$@"; do
  case "$arg" in
    --db-only) do_media=false ;;
    --media-only) do_db=false ;;
    --dry-run) dry_run=true ;;
    --yes) assume_yes=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

if ! command -v mysqldump >/dev/null 2>&1; then
  echo "mysqldump not found. Run this from Local's site shell (Local -> your site -> Open site shell)." >&2
  exit 1
fi

ssh_opts=(-i "$SSH_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes)
remote="$SSH_USER@$SSH_HOST"
prod_host="${PROD_URL#*://}"
prod_host="${prod_host%%/*}"
work_dir="$(mktemp -d)"
timestamp="$(date +%Y%m%d-%H%M%S)"
backup_file="db-backups/pre-sync-$timestamp.sql.gz"
maintenance_on=false

lwp() {
  php -d memory_limit=512M "$(command -v wp)" --path="$LOCAL_WP_ROOT" "$@"
}

rwp() {
  local quoted
  quoted="$(printf '%q ' "$@")"
  ssh "${ssh_opts[@]}" "$remote" "cd $(printf '%q' "$PROD_PATH") && php -d memory_limit=512M \"\$(command -v wp)\" $quoted"
}

rsh() {
  ssh "${ssh_opts[@]}" "$remote" "$@"
}

cleanup() {
  rm -rf "$work_dir"
}

on_error() {
  echo >&2
  echo "Sync failed." >&2
  if [[ "$maintenance_on" == "true" ]]; then
    echo "The site is still in maintenance mode. To restore the previous database:" >&2
    echo "  ssh $remote \"cd $PROD_PATH && gunzip -c ~/$backup_file | wp db import - && wp maintenance-mode deactivate\"" >&2
  fi
}

trap cleanup EXIT
trap on_error ERR

local_url="$(lwp option get home)"
local_host="${local_url#*://}"
local_host="${local_host%%/*}"

if [[ "$local_host" == "$prod_host" ]]; then
  echo "Local home URL equals the production host ($local_host). Aborting." >&2
  exit 1
fi

local_prefix="$(lwp db prefix)"
remote_prefix="$(rwp db prefix)"

if [[ "$local_prefix" != "$remote_prefix" ]]; then
  echo "Table prefix mismatch: local '$local_prefix', production '$remote_prefix'. Aborting." >&2
  exit 1
fi

tables="$(lwp db tables --all-tables-with-prefix --format=csv | tr ',' '\n' | grep -Eiv "$SKIP_TABLES_REGEX" | paste -sd, -)"
skipped="$(lwp db tables --all-tables-with-prefix --format=csv | tr ',' '\n' | grep -Ei "$SKIP_TABLES_REGEX" | paste -sd, - || true)"

echo "Local:      $local_url ($LOCAL_WP_ROOT)"
echo "Production: $PROD_URL ($remote:$PROD_PATH)"
echo "Database:   $([[ $do_db == true ]] && echo yes || echo no)"
echo "Media:      $([[ $do_media == true ]] && echo yes || echo no)"
echo "Skipped tables (kept as on production): ${skipped:-none}"
echo "Preserved production options: ${PRESERVE_OPTIONS:-none}"
echo "wp-config.php is never touched."
if [[ "$dry_run" == "true" ]]; then
  echo "DRY RUN: nothing will be changed."
fi

if [[ "$assume_yes" != "true" && "$dry_run" != "true" ]]; then
  read -r -p "This overwrites production content. Type $prod_host to continue: " answer
  if [[ "$answer" != "$prod_host" ]]; then
    echo "Aborted." >&2
    exit 1
  fi
fi

if [[ "$do_media" == "true" ]]; then
  rsync_args=(-rltz --partial --progress -e "ssh ${ssh_opts[*]}")
  for pattern in $MEDIA_EXCLUDES; do
    rsync_args+=(--exclude "$pattern")
  done
  if [[ "$dry_run" == "true" ]]; then
    rsync_args+=(--dry-run)
  fi
  if [[ "$dry_run" != "true" ]]; then
    rsh "sudo chown -R $SSH_USER:www-data $(printf '%q' "$PROD_PATH/wp-content/uploads") && sudo chmod -R u+rwX,g+rwX $(printf '%q' "$PROD_PATH/wp-content/uploads")"
  fi
  echo "Syncing uploads..."
  rsync "${rsync_args[@]}" "$LOCAL_WP_ROOT/wp-content/uploads/" "$remote:$PROD_PATH/wp-content/uploads/"
  if [[ "$dry_run" != "true" ]]; then
    rsh "sudo chgrp -R www-data $(printf '%q' "$PROD_PATH/wp-content/uploads") && sudo chmod -R g+rwX $(printf '%q' "$PROD_PATH/wp-content/uploads")"
  fi
fi

if [[ "$do_db" == "true" && "$dry_run" != "true" ]]; then
  for option in $PRESERVE_OPTIONS; do
    if rwp option get "$option" --format=json > "$work_dir/$option.json" 2>/dev/null; then
      echo "Preserving production option: $option"
    else
      rm -f "$work_dir/$option.json"
    fi
  done

  echo "Backing up production database to ~/$backup_file ..."
  rsh "mkdir -p ~/db-backups"
  rwp db export - | gzip | rsh "cat > ~/$backup_file"
  rsh "ls -1t ~/db-backups/*.sql.gz | tail -n +$((KEEP_DB_BACKUPS + 1)) | xargs -r rm --"

  rwp maintenance-mode activate
  maintenance_on=true

  echo "Importing local database..."
  lwp db export - --tables="$tables" | gzip | rsh "cd $(printf '%q' "$PROD_PATH") && gunzip | php -d memory_limit=512M \"\$(command -v wp)\" db import -"

  for option in $PRESERVE_OPTIONS; do
    if [[ -f "$work_dir/$option.json" ]]; then
      rwp option update "$option" --format=json < "$work_dir/$option.json"
    fi
  done

  echo "Rewriting URLs and paths..."
  rwp search-replace "$local_host" "$prod_host" --all-tables --skip-columns=guid --report-changed-only
  rwp search-replace "http://$prod_host" "https://$prod_host" --all-tables --skip-columns=guid --report-changed-only
  rwp search-replace "http:\\/\\/$prod_host" "https:\\/\\/$prod_host" --all-tables --skip-columns=guid --report-changed-only
  rwp search-replace "$LOCAL_WP_ROOT" "$PROD_PATH" --all-tables --skip-columns=guid --report-changed-only

  rwp cache flush
  rwp transient delete --all
  rwp rewrite flush
  rsh "sudo systemctl reload apache2"

  rwp maintenance-mode deactivate || true
  maintenance_on=false

  curl --fail --silent --show-error --location --retry 3 --retry-delay 3 --output /dev/null "$PROD_URL"
  echo "Production responded OK at $PROD_URL"
elif [[ "$do_db" == "true" ]]; then
  echo "Would import tables: $tables"
fi

echo "Done."
