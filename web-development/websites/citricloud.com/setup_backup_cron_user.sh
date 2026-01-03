#!/bin/bash

################################################################################
# Setup Daily Backup Cron Job for CITRICLOUD (User-level)
# This script configures automatic daily backups
# Usage: bash setup_backup_cron_user.sh
################################################################################

set -e

PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
BACKUP_SCRIPT="${PROJECT_ROOT}/backup.sh"
BACKUP_DIR="/home/ubuntu/backups/citricloud"
CRON_JOB_TMP="/tmp/citricloud_cron_$$.txt"

echo "=========================================="
echo "CITRICLOUD Daily Backup Scheduler Setup"
echo "=========================================="
echo ""

# Check if backup script exists
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo "ERROR: Backup script not found at ${BACKUP_SCRIPT}"
    exit 1
fi

# Check if script is executable
if [ ! -x "${BACKUP_SCRIPT}" ]; then
    chmod +x "${BACKUP_SCRIPT}"
    echo "✓ Made backup script executable"
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
echo "✓ Backup directory: ${BACKUP_DIR}"

# Check disk space
AVAILABLE_SPACE=$(df "${BACKUP_DIR}" | awk 'NR==2 {print $4}')
AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
echo "✓ Available disk space: ${AVAILABLE_GB}GB"

if [ ${AVAILABLE_GB} -lt 10 ]; then
    echo "⚠ WARNING: Less than 10GB available. Backups may need adjustment."
fi

echo ""
echo "Setting up cron job..."
echo ""

# Export current crontab (if exists)
crontab -l > "${CRON_JOB_TMP}" 2>/dev/null || true

# Check if backup job already exists
if grep -q "citricloud.*backup.sh" "${CRON_JOB_TMP}"; then
    echo "✓ Backup cron job already exists"
    echo ""
    echo "Current backup cron jobs:"
    grep "citricloud.*backup.sh" "${CRON_JOB_TMP}"
else
    # Daily backup at 2:00 AM
    CRON_SCHEDULE="0 2 * * *"
    
    echo "# CITRICLOUD Daily Backup" >> "${CRON_JOB_TMP}"
    echo "# Runs every day at 2:00 AM UTC" >> "${CRON_JOB_TMP}"
    echo "${CRON_SCHEDULE} cd ${PROJECT_ROOT} && ${BACKUP_SCRIPT} >> ${BACKUP_DIR}/cron.log 2>&1" >> "${CRON_JOB_TMP}"
    
    # Install new crontab
    crontab "${CRON_JOB_TMP}"
    
    echo "✓ Cron job created"
    echo "  Schedule: Daily at 2:00 AM UTC"
fi

rm -f "${CRON_JOB_TMP}"

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Backup Configuration:"
echo "  Script: ${BACKUP_SCRIPT}"
echo "  Directory: ${BACKUP_DIR}"
echo "  Schedule: Daily at 2:00 AM UTC"
echo "  Retention: 30 days"
echo "  Log: ${BACKUP_DIR}/cron.log"
echo ""
echo "Useful Commands:"
echo "  View cron jobs:"
echo "    crontab -l"
echo ""
echo "  View cron logs:"
echo "    tail -f ${BACKUP_DIR}/cron.log"
echo ""
echo "  List backups:"
echo "    ls -lah ${BACKUP_DIR}/"
echo ""
echo "  Run backup manually:"
echo "    ${BACKUP_SCRIPT}"
echo ""
echo "  Restore from backup:"
echo "    ${PROJECT_ROOT}/restore.sh /path/to/backup.tar.gz"
echo ""
echo "=========================================="
