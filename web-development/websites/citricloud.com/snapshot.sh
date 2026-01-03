#!/bin/bash

################################################################################
# CITRICLOUD Monthly Snapshot Script
# Creates a long-term monthly snapshot for archival and historical reference
# Usage: ./snapshot.sh or schedule with cron
################################################################################

set -e

# Configuration
PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
BACKUP_DIR="/home/ubuntu/backups/citricloud"
SNAPSHOT_DIR="/home/ubuntu/backups/citricloud/monthly-snapshots"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONTH_YEAR=$(date +"%B_%Y")
SNAPSHOT_NAME="citricloud_snapshot_${MONTH_YEAR}_${TIMESTAMP}"
SNAPSHOT_PATH="${SNAPSHOT_DIR}/${SNAPSHOT_NAME}"
LOG_FILE="${SNAPSHOT_DIR}/snapshot.log"
RETENTION_MONTHS=12

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
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
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
    echo -e "${BLUE}$@${NC}"
    log "HEADER" "$@"
}

# Create directories
mkdir -p "${SNAPSHOT_DIR}"

log_header "=========================================="
log_header "CITRICLOUD Monthly Snapshot"
log_header "=========================================="
log_info "Starting monthly snapshot..."
log_info "Snapshot destination: ${SNAPSHOT_PATH}"

# Create snapshot directory
mkdir -p "${SNAPSHOT_PATH}"

################################################################################
# 1. SNAPSHOT FRONTEND
################################################################################
log_info "Snapshotting frontend..."
mkdir -p "${SNAPSHOT_PATH}/frontend"

rsync -av \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.vite' \
    --exclude='.git' \
    --exclude='coverage' \
    "${PROJECT_ROOT}/frontend/src" \
    "${SNAPSHOT_PATH}/frontend/" 2>&1 | tee -a "${LOG_FILE}" || log_error "Frontend src snapshot failed"

rsync -av \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.vite' \
    --exclude='.git' \
    "${PROJECT_ROOT}/frontend/"*.{json,js,ts,cjs} \
    "${SNAPSHOT_PATH}/frontend/" 2>&1 | tee -a "${LOG_FILE}" || true

rsync -av "${PROJECT_ROOT}/frontend/public" "${SNAPSHOT_PATH}/frontend/" 2>&1 | tee -a "${LOG_FILE}" || true

log_success "Frontend snapshot completed"

################################################################################
# 2. SNAPSHOT BACKEND
################################################################################
log_info "Snapshotting backend..."
mkdir -p "${SNAPSHOT_PATH}/backend"

rsync -av \
    --exclude='venv' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='uploads' \
    "${PROJECT_ROOT}/backend/app" \
    "${SNAPSHOT_PATH}/backend/" 2>&1 | tee -a "${LOG_FILE}" || log_error "Backend app snapshot failed"

rsync -av \
    --exclude='venv' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    "${PROJECT_ROOT}/backend/"*.py \
    "${SNAPSHOT_PATH}/backend/" 2>&1 | tee -a "${LOG_FILE}" || true

rsync -av "${PROJECT_ROOT}/backend/.env" "${SNAPSHOT_PATH}/backend/.env.snapshot" 2>&1 | tee -a "${LOG_FILE}" || log_info "No .env file found"

log_success "Backend snapshot completed"

################################################################################
# 3. SNAPSHOT DATABASE
################################################################################
log_info "Snapshotting database..."
mkdir -p "${SNAPSHOT_PATH}/database"

if [ -f "${PROJECT_ROOT}/backend/citricloud.db" ]; then
    cp "${PROJECT_ROOT}/backend/citricloud.db" "${SNAPSHOT_PATH}/database/citricloud.db"
    
    if command -v sqlite3 &> /dev/null; then
        sqlite3 "${PROJECT_ROOT}/backend/citricloud.db" ".dump" > "${SNAPSHOT_PATH}/database/citricloud.sql" 2>&1 || log_error "Database SQL dump failed"
        log_success "Database snapshot and SQL dump completed"
    else
        log_info "sqlite3 not installed, file backup created"
    fi
else
    log_info "No SQLite database found"
fi

################################################################################
# 4. SNAPSHOT CONFIGURATION & DOCUMENTATION
################################################################################
log_info "Snapshotting configuration..."
mkdir -p "${SNAPSHOT_PATH}/config"
mkdir -p "${SNAPSHOT_PATH}/docs"

for config_file in \
    "citricloud-nginx.conf" \
    "my-subdomain-config.txt" \
    ".gitignore" \
    "README.md"; do
    
    if [ -f "${PROJECT_ROOT}/${config_file}" ]; then
        cp "${PROJECT_ROOT}/${config_file}" "${SNAPSHOT_PATH}/config/" 2>&1 || log_error "Failed to snapshot ${config_file}"
    fi
done

for doc_file in \
    "DEPLOYMENT.md" \
    "INSTALL.md" \
    "README.md" \
    "TROUBLESHOOTING.md" \
    "BACKUP_GUIDE.md"; do
    
    if [ -f "${PROJECT_ROOT}/${doc_file}" ]; then
        cp "${PROJECT_ROOT}/${doc_file}" "${SNAPSHOT_PATH}/docs/" 2>&1 || log_error "Failed to snapshot ${doc_file}"
    fi
done

log_success "Configuration snapshot completed"

################################################################################
# 5. CREATE SNAPSHOT METADATA
################################################################################
log_info "Creating snapshot metadata..."

cat > "${SNAPSHOT_PATH}/SNAPSHOT_INFO.txt" << EOF
CITRICLOUD Monthly Snapshot Information
=========================================

Snapshot Date: $(date '+%Y-%m-%d %H:%M:%S')
Snapshot Name: ${SNAPSHOT_NAME}
Month/Year: ${MONTH_YEAR}
Project Root: ${PROJECT_ROOT}

Contents:
---------
- frontend/: Frontend source code at snapshot time
- backend/: Backend source code at snapshot time
- database/: Database snapshot + SQL dump
- config/: Configuration files at snapshot time
- docs/: Documentation at snapshot time

Snapshot Purpose:
------------------
Monthly snapshots are for:
• Long-term archival (12 months retention)
• Historical reference and compliance
• Comparison with previous versions
• Disaster recovery with older point-in-time backups

Restore from Snapshot:
-----------------------
1. Frontend:
   cp -r ${SNAPSHOT_PATH}/frontend/* ${PROJECT_ROOT}/frontend/
   cd ${PROJECT_ROOT}/frontend && npm install

2. Backend:
   cp -r ${SNAPSHOT_PATH}/backend/* ${PROJECT_ROOT}/backend/
   cd ${PROJECT_ROOT}/backend && source venv/bin/activate && pip install -r requirements.txt

3. Database:
   cp ${SNAPSHOT_PATH}/database/citricloud.db ${PROJECT_ROOT}/backend/citricloud.db

Differences from Daily Backups:
--------------------------------
Daily Backups:
  • Full backups including uploads
  • Automated daily at 2:00 AM
  • 30-day retention
  • ~470KB per backup
  • For immediate recovery

Monthly Snapshots:
  • Excludes uploads (too large for long-term storage)
  • Manual monthly or automated via cron
  • 12-month retention
  • ~150KB per snapshot
  • For compliance and historical reference

Metadata:
---------
Snapshot Type: Monthly Archive
Retention Period: 12 months
Compression: Not compressed (for direct access)
Size: $(du -sh ${SNAPSHOT_PATH} | cut -f1)
Files Count: $(find ${SNAPSHOT_PATH} -type f | wc -l)

EOF

log_success "Snapshot metadata created"

################################################################################
# 6. CREATE TARBALL FOR ARCHIVAL
################################################################################
log_info "Creating compressed archive..."

COMPRESSED_SNAPSHOT="${SNAPSHOT_DIR}/${SNAPSHOT_NAME}.tar.gz"
tar -czf "${COMPRESSED_SNAPSHOT}" -C "${SNAPSHOT_DIR}" "${SNAPSHOT_NAME}" 2>&1 | tee -a "${LOG_FILE}" || {
    log_error "Snapshot compression failed"
    exit 1
}

SNAPSHOT_SIZE=$(du -sh "${COMPRESSED_SNAPSHOT}" | cut -f1)
log_success "Snapshot compressed successfully (Size: ${SNAPSHOT_SIZE})"

################################################################################
# 7. CLEANUP OLD SNAPSHOTS
################################################################################
log_info "Cleaning up old snapshots (keeping last ${RETENTION_MONTHS} months)..."

RETENTION_DAYS=$((RETENTION_MONTHS * 30))
find "${SNAPSHOT_DIR}" -name "citricloud_snapshot_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>&1 | tee -a "${LOG_FILE}" || log_error "Cleanup failed"

SNAPSHOT_COUNT=$(find "${SNAPSHOT_DIR}" -name "citricloud_snapshot_*.tar.gz" -type f | wc -l)
log_success "Cleanup completed (${SNAPSHOT_COUNT} snapshots retained)"

################################################################################
# 8. CLEANUP UNCOMPRESSED SNAPSHOT DIRECTORY
################################################################################
log_info "Cleaning up uncompressed snapshot directory..."
rm -rf "${SNAPSHOT_PATH}"

################################################################################
# 9. FINAL SUMMARY
################################################################################
log_success "=========================================="
log_success "Monthly snapshot completed successfully!"
log_success "=========================================="
log_success "Snapshot file: ${COMPRESSED_SNAPSHOT}"
log_success "Snapshot size: ${SNAPSHOT_SIZE}"
log_success "Snapshot date: $(date '+%Y-%m-%d %H:%M:%S')"
log_success "=========================================="

# Optional: Send notification
# echo "CITRICLOUD monthly snapshot completed on $(date) - Size: ${SNAPSHOT_SIZE}" | mail -s "Monthly Snapshot Report" your-email@example.com

exit 0
