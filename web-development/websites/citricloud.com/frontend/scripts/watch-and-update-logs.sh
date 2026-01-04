#!/bin/bash

# Watch for git commits and automatically update logs
# This script runs continuously as a background service

FRONTEND_DIR="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend"
GIT_DIR="/home/ubuntu/infrastructure/cloud/.git"
LAST_COMMIT=""

echo "🔍 Starting log auto-update watcher..."
echo "📁 Watching git repository for new commits"
echo "⏰ Started at $(date)"
echo ""

# Function to update logs
update_logs() {
    echo ""
    echo "📝 New commit detected!"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    
    cd "$FRONTEND_DIR" || exit 1
    
    if [ -f "scripts/update-logs.js" ]; then
        node scripts/update-logs.js
        
        # Check if update-logs.js made changes to Log.tsx
        if git -C /home/ubuntu/infrastructure/cloud status --porcelain | grep -q "src/pages/Log.tsx"; then
            echo "✅ Log.tsx updated with new commit"
            
            # Auto-commit the log update
            git -C /home/ubuntu/infrastructure/cloud add "$FRONTEND_DIR/src/pages/Log.tsx"
            git -C /home/ubuntu/infrastructure/cloud commit -m "Auto-update: Log page with latest changes" --no-verify
            echo "📦 Changes committed automatically"
        else
            echo "ℹ️  No new log entries to add"
        fi
    else
        echo "⚠️  update-logs.js not found"
    fi
    
    echo "✅ Log update completed"
    echo ""
}

# Get initial commit hash
LAST_COMMIT=$(git -C /home/ubuntu/infrastructure/cloud rev-parse HEAD)

# Watch for changes indefinitely
while true; do
    sleep 5  # Check every 5 seconds
    
    # Get current commit hash
    CURRENT_COMMIT=$(git -C /home/ubuntu/infrastructure/cloud rev-parse HEAD 2>/dev/null)
    
    # If commit changed, update logs
    if [ "$CURRENT_COMMIT" != "$LAST_COMMIT" ] && [ -n "$CURRENT_COMMIT" ]; then
        update_logs
        LAST_COMMIT="$CURRENT_COMMIT"
    fi
done
