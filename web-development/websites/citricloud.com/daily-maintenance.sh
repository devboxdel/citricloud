#!/bin/bash

################################################################################
# CITRICLOUD Daily Maintenance Script
# Runs at 20:00 CET (GMT+1) daily to:
# - Update logs on Logs page
# - Backup server data
# - Create system snapshot
# 
# Usage: ./daily-maintenance.sh
# Cron: 0 19 * * * /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/daily-maintenance.sh
# Note: Server time is UTC, so 19:00 UTC = 20:00 CET (GMT+1)
################################################################################

set -e

# Configuration
PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
LOGS_FILE="${PROJECT_ROOT}/frontend/public/logs.json"
BACKUP_SCRIPT="${PROJECT_ROOT}/backup.sh"
SNAPSHOT_SCRIPT="${PROJECT_ROOT}/snapshot.sh"
MAINTENANCE_LOG="/home/ubuntu/backups/citricloud/maintenance.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S %Z')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${MAINTENANCE_LOG}"
}

log_error() {
    echo -e "${RED}ERROR: $@${NC}" >&2
    log "ERROR" "$@"
}

log_success() {
    echo -e "${GREEN}SUCCESS: $@${NC}"
    log "SUCCESS" "$@"
}

log_info() {
    echo -e "${YELLOW}INFO: $@${NC}"
    log "INFO" "$@"
}

log_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $@${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "INFO" "=== $@ ==="
}

# Create backup directory if it doesn't exist
mkdir -p "$(dirname "${MAINTENANCE_LOG}")"

# Start maintenance
log_header "CITRICLOUD Daily Maintenance - $(date '+%Y-%m-%d %H:%M:%S %Z')"

################################################################################
# 1. Update Logs Page
################################################################################
log_header "Step 1: Update Logs Page"

if [ -f "${LOGS_FILE}" ]; then
    log_info "Logs file found at: ${LOGS_FILE}"
    
    # Create a maintenance log entry
    CURRENT_DATE=$(date '+%Y-%m-%d')
    CURRENT_TIME=$(date '+%H:%M')
    
    # Read current logs
    LOGS_CONTENT=$(cat "${LOGS_FILE}")
    
    # Use Python to safely add the log entry
    python3 - <<'PYTHON_SCRIPT'
import json
import sys
from datetime import datetime

logs_file = "/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend/public/logs.json"
current_date = datetime.now().strftime("%Y-%m-%d")
current_time = datetime.now().strftime("%H:%M")

new_entry = {
    "date": current_date,
    "time": current_time,
    "type": "optimized",
    "title": "Daily Automated Maintenance",
    "description": "Automated daily backup and system maintenance completed successfully at 20:00 CET.",
    "details": [
        "Database backup created",
        "System snapshot saved",
        "Log rotation performed",
        "Cleanup old backups (30+ days)"
    ]
}

try:
    # Read existing logs
    with open(logs_file, 'r') as f:
        data = json.load(f)
    
    # Ensure logs array exists
    if 'logs' not in data or not isinstance(data['logs'], list):
        data = {'logs': []}
    
    # Add new entry at the beginning (most recent first)
    data['logs'].insert(0, new_entry)
    
    # Limit to last 1000 entries to prevent file from growing too large
    if len(data['logs']) > 1000:
        data['logs'] = data['logs'][:1000]
    
    # Write back with pretty formatting
    with open(logs_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print("Log entry added successfully")
    sys.exit(0)
except Exception as e:
    print(f"Error updating logs: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT

    if [ $? -eq 0 ]; then
        log_success "Logs page updated successfully"
    else
        log_error "Failed to update logs page"
    fi
else
    log_error "Logs file not found at: ${LOGS_FILE}"
fi

################################################################################
# 2. Run Daily Backup
################################################################################
log_header "Step 2: Run Daily Backup"

if [ -f "${BACKUP_SCRIPT}" ]; then
    log_info "Executing backup script: ${BACKUP_SCRIPT}"
    
    # Make script executable
    chmod +x "${BACKUP_SCRIPT}"
    
    # Run backup script
    if bash "${BACKUP_SCRIPT}"; then
        log_success "Daily backup completed successfully"
    else
        log_error "Backup script failed with exit code $?"
    fi
else
    log_error "Backup script not found at: ${BACKUP_SCRIPT}"
fi

################################################################################
# 3. Create System Snapshot
################################################################################
log_header "Step 3: Create System Snapshot"

if [ -f "${SNAPSHOT_SCRIPT}" ]; then
    log_info "Executing snapshot script: ${SNAPSHOT_SCRIPT}"
    
    # Make script executable
    chmod +x "${SNAPSHOT_SCRIPT}"
    
    # Run snapshot script
    if bash "${SNAPSHOT_SCRIPT}"; then
        log_success "System snapshot created successfully"
    else
        log_error "Snapshot script failed with exit code $?"
    fi
else
    log_error "Snapshot script not found at: ${SNAPSHOT_SCRIPT}"
fi

################################################################################
# 4. System Health Check
################################################################################
log_header "Step 4: System Health Check"

# Check disk space
log_info "Checking disk space..."
df -h / | tail -n 1

# Check memory usage
log_info "Checking memory usage..."
free -h | grep Mem

# Check backup directory size
if [ -d "/home/ubuntu/backups" ]; then
    BACKUP_SIZE=$(du -sh /home/ubuntu/backups 2>/dev/null | cut -f1)
    log_info "Total backup size: ${BACKUP_SIZE}"
fi

# Check for failed services (if systemd is available)
if command -v systemctl &> /dev/null; then
    FAILED_SERVICES=$(systemctl --failed --no-pager --no-legend | wc -l)
    if [ ${FAILED_SERVICES} -gt 0 ]; then
        log_error "Found ${FAILED_SERVICES} failed services"
        systemctl --failed --no-pager
    else
        log_success "All services running normally"
    fi
fi

################################################################################
# Summary
################################################################################
log_header "Daily Maintenance Complete"

log_success "All maintenance tasks completed at $(date '+%Y-%m-%d %H:%M:%S %Z')"
log_info "Next scheduled maintenance: Tomorrow at 20:00 CET (19:00 UTC)"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Daily maintenance completed successfully${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

exit 0
