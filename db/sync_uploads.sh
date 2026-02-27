#!/bin/bash

# ==================================================
# Sync WordPress uploads from production to Local
# ==================================================

# -------- CONFIG --------
SSH_USER="kotlinskidev-ssh"                                      # SSH user on production
SSH_HOST="ssh.kotlinskidev.com"                                   # Production host
SSH_KEY="$HOME/.ssh/kotlinskidev-ssh"                             # Path to your private SSH key
SSH_PORT=22                                                        # SSH port
REMOTE_UPLOADS="htdocs/kotlinskidev.com/wp-content/uploads/" # Production uploads folder
LOCAL_UPLOADS="../wp-content/uploads/"                              # Local WordPress uploads folder (relative to this script)
# ------------------------

# 1️⃣ Ensure local uploads folder exists
if [ ! -d "$LOCAL_UPLOADS" ]; then
    echo "Local uploads folder not found! Creating it..."
    mkdir -p "$LOCAL_UPLOADS"
fi

# 2️⃣ Backup local uploads folder safely using rsync
BACKUP_FOLDER="../wp-content/uploads_backup_$(date +%Y%m%d_%H%M%S)"
echo "Backing up local uploads to $BACKUP_FOLDER..."

# Create parent folder if missing
mkdir -p "$(dirname "$BACKUP_FOLDER")"

rsync -a "$LOCAL_UPLOADS/" "$BACKUP_FOLDER/"
if [ $? -ne 0 ]; then
    echo "❌ Failed to backup local uploads folder."
    exit 1
fi
echo "✅ Local uploads backed up successfully."

# 3️⃣ Verify remote uploads folder exists
echo "Checking if remote uploads folder exists..."
ssh -i "$SSH_KEY" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "test -d '$REMOTE_UPLOADS'"
if [ $? -ne 0 ]; then
    echo "❌ Remote uploads folder does not exist: $REMOTE_UPLOADS"
    exit 1
fi
echo "✅ Remote uploads folder exists."

# 4️⃣ Sync production uploads to local safely
echo "Syncing uploads from production..."
rsync -avz --delete -e "ssh -i $SSH_KEY -p $SSH_PORT" \
"$SSH_USER@$SSH_HOST:$REMOTE_UPLOADS/" \
"$LOCAL_UPLOADS/"

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync uploads from production."
    exit 1
fi

echo "✅ Uploads synced successfully!"
echo "🎉 Local uploads folder now matches production."