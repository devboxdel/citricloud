#!/bin/bash

################################################################################
# Setup Daily Backup Cron Job for CITRICLOUD
# This script configures automatic daily backups
# Usage: bash setup_backup_cron.sh
################################################################################

set -e

PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
BACKUP_SCRIPT="${PROJECT_ROOT}/backup.sh"
CRON_FILE="/etc/cron.d/citricloud-backup"
BACKUP_DIR="/home/ubuntu/backups/citricloud"

echo "=========================================="
echo "CITRICLOUD Daily Backup Scheduler Setup"
echo "=========================================="

# Check if backup script exists
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo "ERROR: Backup script not found at ${BACKUP_SCRIPT}"
    exit 1
fi

# Make backup script executable
chmod +x "${BACKUP_SCRIPT}"
echo "✓ Backup script is executable"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
echo "✓ Backup directory created/verified: ${BACKUP_DIR}"

# Check disk space
AVAILABLE_SPACE=$(df "${BACKUP_DIR}" | awk 'NR==2 {print $4}')
AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
echo "✓ Available disk space: ${AVAILABLE_GB}GB"

if [ ${AVAILABLE_GB} -lt 10 ]; then
    echo "⚠ WARNING: Less than 10GB available. Backups may fail."
fi

# Create cron job
echo ""
echo "Setting up cron job..."

# Daily backup at 2:00 AM
CRON_SCHEDULE="0 2 * * *"
CRON_COMMAND="cd ${PROJECT_ROOT} && ${BACKUP_SCRIPT} >> ${BACKUP_DIR}/cron.log 2>&1"

# Create cron job file
sudo tee "${CRON_FILE}" > /dev/null << EOF
# CITRICLOUD Daily Backup
# Runs every day at 2:00 AM UTC
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

${CRON_SCHEDULE} root ${CRON_COMMAND}
EOF

echo "✓ Cron job created at ${CRON_FILE}"
echo "  Schedule: Daily at 2:00 AM UTC"
echo "  Command: ${CRON_COMMAND}"

# Verify cron job
echo ""
echo "Verifying cron job..."
sudo cat "${CRON_FILE}"

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Backup Configuration:"
echo "  - Backup script: ${BACKUP_SCRIPT}"
echo "  - Backup directory: ${BACKUP_DIR}"
echo "  - Schedule: Daily at 2:00 AM UTC"
echo "  - Retention: 30 days"
echo "  - Log file: ${BACKUP_DIR}/cron.log"
echo ""
echo "Manual Backup:"
echo "  ${BACKUP_SCRIPT}"
echo ""
echo "View Cron Logs:"
echo "  tail -f ${BACKUP_DIR}/cron.log"
echo ""
echo "View Backups:"
echo "  ls -lah ${BACKUP_DIR}/"
echo ""
echo "=========================================="
