#!/bin/bash

# ==================================================
# Sync production WordPress to Local
# ==================================================

# 1️⃣ Variables - adjust if needed
PROD_URL="https://kotlinskidev.com"
LOCAL_URL="http://kotlinskidev.local"
DB_FILE="kotlinskidev.sql"
# 1️⃣ Backup local DB
echo "Backing up local database..."
wp db export backup_local.sql
if [ $? -ne 0 ]; then
    echo "❌ Failed to backup local DB. Make sure you're in the WordPress root folder."
    exit 1
fi
echo "✅ Local DB backup saved as backup_local.sql"

# 1.5️⃣ Reset local DB to avoid "table already exists" errors
echo "Resetting local database..."
wp db reset --yes
if [ $? -ne 0 ]; then
    echo "❌ Failed to reset local DB."
    exit 1
fi
echo "✅ Local DB reset successfully"

# 2️⃣ Import production DB
echo "Importing production database..."
wp db import "$DB_FILE"
if [ $? -ne 0 ]; then
    echo "❌ Failed to import $DB_FILE. Check that the file exists and is valid SQL."
    exit 1
fi
echo "✅ Production DB imported successfully"

# 3️⃣ Replace production URLs with Local URL
echo "Replacing production URLs with local URL..."
wp search-replace "$PROD_URL" "$LOCAL_URL" --all-tables
if [ $? -ne 0 ]; then
    echo "❌ URL replacement failed."
    exit 1
fi
echo "✅ URLs replaced"

# 4️⃣ Flush cache and permalinks
echo "Flushing cache and permalinks..."
wp cache flush
wp rewrite flush
echo "✅ Cache flushed and permalinks regenerated"

# 5️⃣ Done
echo "🎉 Sync complete! Your Local site is now up to date with production database."