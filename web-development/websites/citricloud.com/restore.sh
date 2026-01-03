#!/bin/bash

################################################################################
# CITRICLOUD Backup Restore Script
# Restores from a backup file
# Usage: ./restore.sh <backup_file.tar.gz> [--dry-run]
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com"
TEMP_RESTORE_DIR="/tmp/citricloud_restore_$$"

# Helper functions
print_header() {
    echo -e "${BLUE}=========================================="
    echo "CITRICLOUD Backup Restore"
    echo "==========================================${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $@${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✓ $@${NC}"
}

print_info() {
    echo -e "${YELLOW}INFO: $@${NC}"
}

confirm() {
    local prompt="$1"
    local response
    read -p "$(echo -e ${YELLOW}${prompt}${NC})" response
    [[ "${response}" =~ ^[Yy]$ ]]
}

# Main
print_header

# Check arguments
if [ $# -lt 1 ]; then
    print_error "Usage: $0 <backup_file.tar.gz> [--dry-run]"
    echo ""
    echo "Examples:"
    echo "  $0 /home/ubuntu/backups/citricloud/citricloud_backup_20241204_120000.tar.gz"
    echo "  $0 citricloud_backup_20241204_120000.tar.gz --dry-run"
    echo ""
    echo "Available backups:"
    if [ -d "/home/ubuntu/backups/citricloud" ]; then
        ls -lh /home/ubuntu/backups/citricloud/*.tar.gz 2>/dev/null | awk '{print "  " $9}' || print_info "No backups found"
    fi
    exit 1
fi

BACKUP_FILE="$1"
DRY_RUN=false

if [ "$2" = "--dry-run" ]; then
    DRY_RUN=true
    print_info "Running in DRY-RUN mode (no changes will be made)"
fi

# Verify backup file
if [ ! -f "${BACKUP_FILE}" ]; then
    print_error "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
print_success "Backup file found: ${BACKUP_FILE} (Size: ${BACKUP_SIZE})"

# Show what will be restored
echo ""
echo "Backup Contents:"
tar -tzf "${BACKUP_FILE}" | head -20
echo "..."

# Confirm restore
echo ""
if ! confirm "Do you want to proceed with restore? (y/N): "; then
    print_info "Restore cancelled"
    exit 0
fi

# Extract backup
print_info "Extracting backup to temporary directory..."
mkdir -p "${TEMP_RESTORE_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${TEMP_RESTORE_DIR}"
print_success "Backup extracted"

# Find the actual backup directory (should be citricloud_backup_TIMESTAMP)
EXTRACTED_DIR=$(find "${TEMP_RESTORE_DIR}" -maxdepth 1 -type d -name "citricloud_backup_*" | head -1)
if [ -z "${EXTRACTED_DIR}" ]; then
    print_error "Could not find extracted backup directory"
    rm -rf "${TEMP_RESTORE_DIR}"
    exit 1
fi

echo ""
echo "Restore Plan:"
echo "=============="

# Show what will be restored
if [ -d "${EXTRACTED_DIR}/frontend" ] && [ "$(ls -A ${EXTRACTED_DIR}/frontend)" ]; then
    echo "  ✓ Frontend source code"
fi
if [ -d "${EXTRACTED_DIR}/backend" ] && [ "$(ls -A ${EXTRACTED_DIR}/backend)" ]; then
    echo "  ✓ Backend source code"
fi
if [ -d "${EXTRACTED_DIR}/database" ] && [ "$(ls -A ${EXTRACTED_DIR}/database)" ]; then
    echo "  ✓ Database files"
fi
if [ -d "${EXTRACTED_DIR}/uploads" ] && [ "$(ls -A ${EXTRACTED_DIR}/uploads)" ]; then
    echo "  ✓ User uploads"
fi
if [ -d "${EXTRACTED_DIR}/config" ] && [ "$(ls -A ${EXTRACTED_DIR}/config)" ]; then
    echo "  ✓ Configuration files"
fi
if [ -d "${EXTRACTED_DIR}/docs" ] && [ "$(ls -A ${EXTRACTED_DIR}/docs)" ]; then
    echo "  ✓ Documentation"
fi

if [ -f "${EXTRACTED_DIR}/BACKUP_INFO.txt" ]; then
    echo ""
    cat "${EXTRACTED_DIR}/BACKUP_INFO.txt"
fi

echo ""
if [ "${DRY_RUN}" = true ]; then
    print_info "DRY-RUN: Skipping actual restore"
else
    if ! confirm "Continue with restore? (y/N): "; then
        print_info "Restore cancelled"
        rm -rf "${TEMP_RESTORE_DIR}"
        exit 0
    fi
fi

echo ""
echo "Restoring files..."
echo "=================="

# Restore frontend
if [ -d "${EXTRACTED_DIR}/frontend" ] && [ "$(ls -A ${EXTRACTED_DIR}/frontend)" ]; then
    print_info "Restoring frontend..."
    if [ "${DRY_RUN}" = false ]; then
        cp -r "${EXTRACTED_DIR}/frontend"/* "${PROJECT_ROOT}/frontend/" || print_error "Frontend restore failed"
        print_success "Frontend restored"
    else
        print_info "[DRY-RUN] Would restore frontend to ${PROJECT_ROOT}/frontend/"
    fi
fi

# Restore backend
if [ -d "${EXTRACTED_DIR}/backend" ] && [ "$(ls -A ${EXTRACTED_DIR}/backend)" ]; then
    print_info "Restoring backend..."
    if [ "${DRY_RUN}" = false ]; then
        cp -r "${EXTRACTED_DIR}/backend"/* "${PROJECT_ROOT}/backend/" || print_error "Backend restore failed"
        print_success "Backend restored"
    else
        print_info "[DRY-RUN] Would restore backend to ${PROJECT_ROOT}/backend/"
    fi
fi

# Restore database
if [ -d "${EXTRACTED_DIR}/database" ] && [ "$(ls -A ${EXTRACTED_DIR}/database)" ]; then
    print_info "Restoring database..."
    if [ "${DRY_RUN}" = false ]; then
        cp "${EXTRACTED_DIR}/database/citricloud.db" "${PROJECT_ROOT}/backend/citricloud.db" || print_error "Database restore failed"
        print_success "Database restored"
    else
        print_info "[DRY-RUN] Would restore database to ${PROJECT_ROOT}/backend/citricloud.db"
    fi
fi

# Restore uploads
if [ -d "${EXTRACTED_DIR}/uploads" ] && [ "$(ls -A ${EXTRACTED_DIR}/uploads)" ]; then
    print_info "Restoring uploads..."
    if [ "${DRY_RUN}" = false ]; then
        mkdir -p "${PROJECT_ROOT}/backend/uploads"
        cp -r "${EXTRACTED_DIR}/uploads"/* "${PROJECT_ROOT}/backend/uploads/" || print_error "Uploads restore failed"
        print_success "Uploads restored"
    else
        print_info "[DRY-RUN] Would restore uploads to ${PROJECT_ROOT}/backend/uploads/"
    fi
fi

# Restore config
if [ -d "${EXTRACTED_DIR}/config" ] && [ "$(ls -A ${EXTRACTED_DIR}/config)" ]; then
    print_info "Restoring config files..."
    if [ "${DRY_RUN}" = false ]; then
        for file in "${EXTRACTED_DIR}/config"/*; do
            [ -e "$file" ] && cp "$file" "${PROJECT_ROOT}/" || true
        done
        print_success "Config files restored"
    else
        print_info "[DRY-RUN] Would restore config files to ${PROJECT_ROOT}/"
    fi
fi

# Cleanup
rm -rf "${TEMP_RESTORE_DIR}"

# Post-restore info
echo ""
echo "=========================================="
if [ "${DRY_RUN}" = true ]; then
    print_success "DRY-RUN Complete!"
else
    print_success "Restore Complete!"
fi
echo "=========================================="

if [ "${DRY_RUN}" = false ]; then
    echo ""
    echo "Next steps:"
    echo "  1. Review restored files:"
    echo "     ls -la ${PROJECT_ROOT}/"
    echo ""
    echo "  2. Reinstall dependencies (if needed):"
    echo "     cd ${PROJECT_ROOT}/frontend && npm install"
    echo "     cd ${PROJECT_ROOT}/backend && source venv/bin/activate && pip install -r requirements.txt"
    echo ""
    echo "  3. Restart services:"
    echo "     cd ${PROJECT_ROOT} && bash start.sh"
    echo ""
    echo "  4. Verify application is working:"
    echo "     - Check frontend: http://localhost:3000"
    echo "     - Check backend: http://localhost:8000/health"
fi

exit 0
