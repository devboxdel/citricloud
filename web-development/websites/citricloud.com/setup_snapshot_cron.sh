#!/bin/bash

################################################################################
# Setup Monthly Snapshot Cron Job for CITRICLOUD
# This script configures automatic monthly snapshots
# Usage: bash setup_snapshot_cron.sh
################################################################################

set -e

PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
SNAPSHOT_SCRIPT="${PROJECT_ROOT}/snapshot.sh"
SNAPSHOT_DIR="/home/ubuntu/backups/citricloud/monthly-snapshots"
CRON_JOB_TMP="/tmp/citricloud_snapshot_cron_$$.txt"

echo "=========================================="
echo "CITRICLOUD Monthly Snapshot Scheduler"
echo "=========================================="
echo ""

# Check if snapshot script exists
if [ ! -f "${SNAPSHOT_SCRIPT}" ]; then
    echo "ERROR: Snapshot script not found at ${SNAPSHOT_SCRIPT}"
    exit 1
fi

# Make snapshot script executable
chmod +x "${SNAPSHOT_SCRIPT}"
echo "✓ Snapshot script is executable"

# Create snapshot directory if it doesn't exist
mkdir -p "${SNAPSHOT_DIR}"
echo "✓ Snapshot directory: ${SNAPSHOT_DIR}"

# Check disk space
AVAILABLE_SPACE=$(df "${SNAPSHOT_DIR}" | awk 'NR==2 {print $4}')
AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
echo "✓ Available disk space: ${AVAILABLE_GB}GB"

if [ ${AVAILABLE_GB} -lt 5 ]; then
    echo "⚠ WARNING: Less than 5GB available for snapshots."
fi

echo ""
echo "Snapshot Schedule Options:"
echo ""
echo "1. First day of month at 3:00 AM UTC (default)"
echo "2. First Sunday of month at 3:00 AM UTC"
echo "3. Last day of month at 3:00 AM UTC"
echo "4. Custom schedule"
echo ""

read -p "Select option (1-4): " schedule_option

case $schedule_option in
    1)
        CRON_SCHEDULE="0 3 1 * *"
        SCHEDULE_DESC="First day of each month at 3:00 AM UTC"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * 0"
        SCHEDULE_DESC="Every Sunday at 3:00 AM UTC (includes first Sunday)"
        ;;
    3)
        CRON_SCHEDULE="0 3 L * *"
        SCHEDULE_DESC="Last day of each month at 3:00 AM UTC"
        ;;
    4)
        read -p "Enter cron schedule (e.g., '0 3 1 * *'): " CRON_SCHEDULE
        SCHEDULE_DESC="Custom: ${CRON_SCHEDULE}"
        ;;
    *)
        CRON_SCHEDULE="0 3 1 * *"
        SCHEDULE_DESC="First day of each month at 3:00 AM UTC (default)"
        ;;
esac

echo ""
echo "Setting up cron job..."
echo ""

# Export current crontab (if exists)
crontab -l > "${CRON_JOB_TMP}" 2>/dev/null || true

# Check if snapshot job already exists
if grep -q "citricloud.*snapshot.sh" "${CRON_JOB_TMP}"; then
    echo "✓ Snapshot cron job already exists"
    echo ""
    echo "Current snapshot cron jobs:"
    grep "citricloud.*snapshot.sh" "${CRON_JOB_TMP}"
else
    echo "# CITRICLOUD Monthly Snapshot" >> "${CRON_JOB_TMP}"
    echo "# Schedule: ${SCHEDULE_DESC}" >> "${CRON_JOB_TMP}"
    echo "${CRON_SCHEDULE} cd ${PROJECT_ROOT} && ${SNAPSHOT_SCRIPT} >> ${SNAPSHOT_DIR}/cron.log 2>&1" >> "${CRON_JOB_TMP}"
    
    # Install new crontab
    crontab "${CRON_JOB_TMP}"
    
    echo "✓ Cron job created"
    echo "  Schedule: ${SCHEDULE_DESC}"
fi

rm -f "${CRON_JOB_TMP}"

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Monthly Snapshot Configuration:"
echo "  Script: ${SNAPSHOT_SCRIPT}"
echo "  Directory: ${SNAPSHOT_DIR}"
echo "  Schedule: ${SCHEDULE_DESC}"
echo "  Retention: 12 months"
echo "  Log: ${SNAPSHOT_DIR}/cron.log"
echo ""
echo "Useful Commands:"
echo "  Run snapshot manually:"
echo "    ${SNAPSHOT_SCRIPT}"
echo ""
echo "  View cron jobs:"
echo "    crontab -l"
echo ""
echo "  View snapshot logs:"
echo "    tail -f ${SNAPSHOT_DIR}/cron.log"
echo ""
echo "  List snapshots:"
echo "    ls -lah ${SNAPSHOT_DIR}/"
echo ""
echo "  View snapshot info:"
echo "    tar -tzf ${SNAPSHOT_DIR}/citricloud_snapshot_*.tar.gz"
echo ""
echo "=========================================="
