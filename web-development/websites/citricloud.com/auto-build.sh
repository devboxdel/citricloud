#!/bin/bash

# Auto-build script for CITRICLOUD
# This script watches for changes and automatically builds production

cd "$(dirname "$0")"

echo "🔄 Starting auto-build watcher..."
echo "📁 Watching: frontend/src/ and backend/app/"
echo "🛠️  Will build on file changes"
echo ""

# Frontend build
build_frontend() {
    echo ""
    echo "🚀 Building frontend..."
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    (cd frontend && npm run build)
    echo "✅ Frontend build completed at $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
}

# Backend build (syntax check/byte-compile)
build_backend() {
    echo ""
    echo "🧰 Building backend (byte-compile)..."
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    if [ -d backend/venv ]; then
        # shellcheck source=/dev/null
        source backend/venv/bin/activate
    fi
    (cd backend && python -m compileall app)
    echo "✅ Backend build completed at $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
}

build_all() {
    build_frontend
    build_backend
}

# Initial build
build_all

# Watch for changes using inotifywait (install if needed)
if ! command -v inotifywait &> /dev/null; then
    echo "Installing inotify-tools..."
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# Watch for file changes
while true; do
    inotifywait -r -e modify,create,delete frontend/src backend/app 2>/dev/null
    echo "📝 Change detected, waiting 2 seconds for more changes..."
    sleep 2
    build_all
done
