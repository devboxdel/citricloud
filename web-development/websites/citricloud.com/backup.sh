#!/bin/bash

################################################################################
# CITRICLOUD Daily Backup Script
# Backs up frontend, backend, database, and configurations
# Usage: ./backup.sh or schedule with cron
################################################################################

set -e

# Configuration
PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
BACKUP_DIR="/home/ubuntu/backups/citricloud"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="citricloud_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

log_info "Starting CITRICLOUD backup..."
log_info "Backup destination: ${BACKUP_PATH}"

# Create main backup directory
mkdir -p "${BACKUP_PATH}"

################################################################################
# 1. BACKUP FRONTEND
################################################################################
log_info "Backing up frontend..."
mkdir -p "${BACKUP_PATH}/frontend"

# Backup frontend source code (excluding node_modules and dist)
rsync -av \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.vite' \
    --exclude='.git' \
    --exclude='coverage' \
    "${PROJECT_ROOT}/frontend/src" \
    "${BACKUP_PATH}/frontend/" 2>&1 | tee -a "${LOG_FILE}" || log_error "Frontend src backup failed"

rsync -av \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.vite' \
    --exclude='.git' \
    "${PROJECT_ROOT}/frontend/"*.{json,js,ts,cjs} \
    "${BACKUP_PATH}/frontend/" 2>&1 | tee -a "${LOG_FILE}" || true

rsync -av "${PROJECT_ROOT}/frontend/public" "${BACKUP_PATH}/frontend/" 2>&1 | tee -a "${LOG_FILE}" || true

log_success "Frontend backup completed"

################################################################################
# 2. BACKUP BACKEND
################################################################################
log_info "Backing up backend..."
mkdir -p "${BACKUP_PATH}/backend"

# Backup backend source code (excluding venv, __pycache__, .git)
rsync -av \
    --exclude='venv' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='uploads' \
    "${PROJECT_ROOT}/backend/app" \
    "${BACKUP_PATH}/backend/" 2>&1 | tee -a "${LOG_FILE}" || log_error "Backend app backup failed"

rsync -av \
    --exclude='venv' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    "${PROJECT_ROOT}/backend/"*.py \
    "${BACKUP_PATH}/backend/" 2>&1 | tee -a "${LOG_FILE}" || true

rsync -av "${PROJECT_ROOT}/backend/.env" "${BACKUP_PATH}/backend/.env.backup" 2>&1 | tee -a "${LOG_FILE}" || log_info "No .env file found (expected if using environment variables)"

log_success "Backend source backup completed"

################################################################################
# 3. BACKUP DATABASE
################################################################################
log_info "Backing up database..."
mkdir -p "${BACKUP_PATH}/database"

if [ -f "${PROJECT_ROOT}/backend/citricloud.db" ]; then
    # SQLite database
    cp "${PROJECT_ROOT}/backend/citricloud.db" "${BACKUP_PATH}/database/citricloud.db"
    
    # Also create a SQL dump for portability
    if command -v sqlite3 &> /dev/null; then
        sqlite3 "${PROJECT_ROOT}/backend/citricloud.db" ".dump" > "${BACKUP_PATH}/database/citricloud.sql" 2>&1 || log_error "Database SQL dump failed"
        log_success "Database backup and SQL dump completed"
    else
        log_info "sqlite3 not installed, skipping SQL dump (file backup created)"
    fi
else
    log_info "No SQLite database found"
fi

################################################################################
# 4. BACKUP UPLOADS
################################################################################
log_info "Backing up user uploads..."
mkdir -p "${BACKUP_PATH}/uploads"

if [ -d "${PROJECT_ROOT}/backend/uploads" ] && [ "$(ls -A ${PROJECT_ROOT}/backend/uploads)" ]; then
    rsync -av "${PROJECT_ROOT}/backend/uploads/" "${BACKUP_PATH}/uploads/" 2>&1 | tee -a "${LOG_FILE}" || log_error "Uploads backup failed"
    log_success "Uploads backup completed"
else
    log_info "No uploads directory or it's empty"
fi

################################################################################
# 5. BACKUP CONFIGURATION FILES
################################################################################
log_info "Backing up configuration files..."
mkdir -p "${BACKUP_PATH}/config"

# Backup important config files
for config_file in \
    "citricloud-nginx.conf" \
    "my-subdomain-config.txt" \
    ".gitignore" \
    "README.md"; do
    
    if [ -f "${PROJECT_ROOT}/${config_file}" ]; then
        cp "${PROJECT_ROOT}/${config_file}" "${BACKUP_PATH}/config/" 2>&1 || log_error "Failed to backup ${config_file}"
    fi
done

log_success "Configuration backup completed"

################################################################################
# 6. BACKUP DOCUMENTATION
################################################################################
log_info "Backing up documentation..."
mkdir -p "${BACKUP_PATH}/docs"

# Backup all markdown files with important setup information
for doc_file in \
    "DEPLOYMENT.md" \
    "INSTALL.md" \
    "README.md" \
    "TROUBLESHOOTING.md" \
    "LOGIN_CONFIGURATION.md" \
    "DOMAIN_SETUP_GUIDE.md"; do
    
    if [ -f "${PROJECT_ROOT}/${doc_file}" ]; then
        cp "${PROJECT_ROOT}/${doc_file}" "${BACKUP_PATH}/docs/" 2>&1 || log_error "Failed to backup ${doc_file}"
    fi
done

log_success "Documentation backup completed"

################################################################################
# 7. CREATE BACKUP METADATA
################################################################################
log_info "Creating backup metadata..."

cat > "${BACKUP_PATH}/BACKUP_INFO.txt" << EOF
CITRICLOUD Backup Information
=============================

Backup Date: $(date '+%Y-%m-%d %H:%M:%S')
Backup Name: ${BACKUP_NAME}
Project Root: ${PROJECT_ROOT}

Contents:
---------
- frontend/: Frontend source code (src, public, config files)
- backend/: Backend source code (app, main.py, requirements.txt)
- database/: SQLite database + SQL dump
- uploads/: User uploaded files
- config/: Nginx and subdomain configurations
- docs/: Important documentation

Restore Instructions:
---------------------
1. Frontend:
   cp -r ${BACKUP_PATH}/frontend/* ${PROJECT_ROOT}/frontend/
   cd ${PROJECT_ROOT}/frontend && npm install

2. Backend:
   cp -r ${BACKUP_PATH}/backend/* ${PROJECT_ROOT}/backend/
   cd ${PROJECT_ROOT}/backend && source venv/bin/activate && pip install -r requirements.txt

3. Database:
   cp ${BACKUP_PATH}/database/citricloud.db ${PROJECT_ROOT}/backend/citricloud.db

4. Uploads:
   cp -r ${BACKUP_PATH}/uploads/* ${PROJECT_ROOT}/backend/uploads/

5. Environment:
   cp ${BACKUP_PATH}/backend/.env.backup ${PROJECT_ROOT}/backend/.env
   (Edit .env with current values if needed)

Verification:
--------------
Use 'ls -lah ${BACKUP_PATH}' to verify backup contents
Check 'du -sh ${BACKUP_PATH}' for backup size

EOF

log_success "Backup metadata created"

################################################################################
# 8. COMPRESS BACKUP
################################################################################
log_info "Compressing backup..."

COMPRESSED_BACKUP="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
tar -czf "${COMPRESSED_BACKUP}" -C "${BACKUP_DIR}" "${BACKUP_NAME}" 2>&1 | tee -a "${LOG_FILE}" || {
    log_error "Backup compression failed"
    exit 1
}

BACKUP_SIZE=$(du -sh "${COMPRESSED_BACKUP}" | cut -f1)
log_success "Backup compressed successfully (Size: ${BACKUP_SIZE})"

# Remove uncompressed directory to save space
rm -rf "${BACKUP_PATH}"

################################################################################
# 9. CLEANUP OLD BACKUPS
################################################################################
log_info "Cleaning up old backups (keeping last ${RETENTION_DAYS} days)..."

find "${BACKUP_DIR}" -name "citricloud_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>&1 | tee -a "${LOG_FILE}" || log_error "Cleanup failed"

# Count remaining backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "citricloud_backup_*.tar.gz" -type f | wc -l)
log_success "Cleanup completed (${BACKUP_COUNT} backups retained)"

################################################################################
# 10. FINAL SUMMARY
################################################################################
log_success "=========================================="
log_success "Backup completed successfully!"
log_success "=========================================="
log_success "Backup file: ${COMPRESSED_BACKUP}"
log_success "Backup size: ${BACKUP_SIZE}"
log_success "Backup date: $(date '+%Y-%m-%d %H:%M:%S')"
log_success "=========================================="

# Send notification (optional - uncomment to use)
# echo "CITRICLOUD backup completed successfully on $(date)" | mail -s "Backup Report" your-email@example.com

exit 0
