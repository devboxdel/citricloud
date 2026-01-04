#!/bin/bash

# Installation script for automatic log updates
# This sets up git hooks and optionally a systemd service

echo "🚀 Installing Citricloud Log Automation"
echo "========================================"
echo ""

# Check if running as root for systemd service
if [ "$EUID" -eq 0 ]; then
    INSTALL_SERVICE=true
else
    INSTALL_SERVICE=false
fi

# 1. Git hooks are already installed
echo "✅ Git hooks installed:"
echo "   - post-commit: Updates logs after each commit"
echo "   - post-merge: Updates logs after pull/merge"
echo ""

# 2. Optional: Install systemd service
if [ "$INSTALL_SERVICE" = true ]; then
    echo "📦 Installing systemd service..."
    cp citricloud-log-watcher.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable citricloud-log-watcher
    systemctl start citricloud-log-watcher
    echo "✅ Systemd service installed and started"
    echo ""
    echo "📊 Service status:"
    systemctl status citricloud-log-watcher --no-pager
else
    echo "ℹ️  Skipping systemd service (not running as root)"
    echo "   To install service: sudo bash install-log-automation.sh"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "How it works:"
echo "-------------"
echo "1. When you commit: post-commit hook updates Log.tsx automatically"
echo "2. When you pull/merge: post-merge hook updates Log.tsx automatically"
echo "3. When you build: npm run build also updates logs"
echo ""
echo "Manual commands:"
echo "----------------"
echo "- Update logs now: npm run update-logs"
echo "- Build with logs: npm run build"
echo "- Build without logs: npm run build:skip-log"
echo ""
