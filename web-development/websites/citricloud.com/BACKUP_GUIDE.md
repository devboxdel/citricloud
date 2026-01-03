# CITRICLOUD Daily Backup Setup Guide

## Overview

Your CITRICLOUD application now has automatic daily backups configured. This guide covers backup operation, restoration, and maintenance.

## Backup Configuration

| Setting | Value |
|---------|-------|
| **Schedule** | Daily at 2:00 AM UTC |
| **Backup Directory** | `/home/ubuntu/backups/citricloud/` |
| **Retention Period** | 30 days (oldest backups auto-deleted) |
| **Backup Size** | ~472KB (compressed) |
| **Location** | `/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backup.sh` |

## What Gets Backed Up

### 1. **Frontend** (`/frontend`)
- React source code (`src/` directory)
- Configuration files (`vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, etc.)
- Package files (`package.json`, `package-lock.json`)
- Public assets (`public/` directory)
- **Excluded**: `node_modules/`, `dist/`, `.vite/`, `.git/`

### 2. **Backend** (`/backend`)
- Python application (`app/` directory)
- Main entry point (`main.py`, `requirements.txt`)
- Environment file (`.env` backed up as `.env.backup`)
- **Excluded**: `venv/`, `.venv/`, `__pycache__/`, `.git/`, `*.pyc`

### 3. **Database**
- SQLite database (`citricloud.db`)
- SQL dump (`citricloud.sql`) - for portability and inspection

### 4. **User Uploads**
- All user-uploaded files in `/backend/uploads/`

### 5. **Configuration Files**
- Nginx configuration (`citricloud-nginx.conf`)
- Domain configuration (`my-subdomain-config.txt`)
- Git ignore files (`.gitignore`)

### 6. **Documentation**
- Deployment guides
- Installation instructions
- Troubleshooting guides
- Configuration documentation

## Viewing Backups

### List all backups:
```bash
ls -lah /home/ubuntu/backups/citricloud/
```

### View backup contents (without extracting):
```bash
tar -tzf /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz | head -20
```

### View backup log:
```bash
tail -f /home/ubuntu/backups/citricloud/cron.log
```

## Running Manual Backups

To run an immediate backup without waiting for the scheduled time:

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
bash backup.sh
```

This will:
1. Create a new timestamped backup
2. Display progress and status
3. Log all operations to `/home/ubuntu/backups/citricloud/backup.log`
4. Compress the backup
5. Clean up backups older than 30 days

## Restoring from Backup

### Dry-run (see what would be restored without making changes):
```bash
bash restore.sh /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz --dry-run
```

### Full restore:
```bash
bash restore.sh /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz
```

The restore script will:
1. Extract the backup to a temporary directory
2. Show you what will be restored
3. Ask for confirmation before restoring
4. Restore all files to their original locations
5. Provide post-restore instructions

### Post-restore steps:
```bash
# 1. Reinstall frontend dependencies
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend
npm install

# 2. Reinstall backend dependencies
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend
source venv/bin/activate
pip install -r requirements.txt

# 3. Restart services
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
bash start.sh
```

## Cron Job Management

### View all scheduled cron jobs:
```bash
crontab -l
```

### Edit cron jobs:
```bash
crontab -e
```

### Remove the backup cron job:
```bash
crontab -r
```

### Re-add the backup cron job:
```bash
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/setup_backup_cron_user.sh
```

## Backup Lifecycle

### Automatic Backup Process (Daily at 2:00 AM):
1. Creates timestamped backup directory
2. Backs up all components (frontend, backend, database, uploads, config)
3. Compresses into `.tar.gz` file
4. Stores in `/home/ubuntu/backups/citricloud/`
5. Deletes backups older than 30 days
6. Logs all operations

### Disk Space Management
- Each backup is approximately 472KB (compressed)
- With daily backups, you need ~14MB for 30 days of backups
- Current available space: ~44GB
- **Recommendation**: Monitor disk space if adding more services

## Monitoring & Alerts

### Check backup completion:
```bash
ls -la /home/ubuntu/backups/citricloud/*.tar.gz | tail -5
```

### View detailed backup logs:
```bash
cat /home/ubuntu/backups/citricloud/backup.log
```

### Watch cron job output in real-time:
```bash
tail -f /home/ubuntu/backups/citricloud/cron.log
```

## Database Backup Details

The backup includes both:
1. **Binary SQLite file** (`citricloud.db`) - for direct restoration
2. **SQL dump** (`citricloud.sql`) - for inspection, migration, or recovery

### To restore just the database:
```bash
cp /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205/database/citricloud.db \
   /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend/citricloud.db
```

### To inspect database contents:
```bash
sqlite3 /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205/database/citricloud.db ".schema"
```

## Troubleshooting

### Backup fails due to disk space:
```bash
# Check available space
df -h /home/ubuntu/backups/citricloud/

# Clean up old backups manually
find /home/ubuntu/backups/citricloud -name "*.tar.gz" -mtime +7 -delete
```

### Cron job not running:
```bash
# Check if cron service is running
systemctl status cron

# Check system logs
grep CRON /var/log/syslog | tail -20

# Test backup script manually
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backup.sh
```

### Restore fails:
```bash
# Verify backup file integrity
tar -tzf /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz > /dev/null

# Try dry-run first
bash restore.sh /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz --dry-run

# Check disk space
df -h
```

## Files Created

The following files have been created in your project:

1. **`backup.sh`** - Main backup script
   - Backs up all components
   - Compresses backup
   - Cleans up old files

2. **`restore.sh`** - Restore script
   - Restores from backup files
   - Dry-run mode for testing
   - Post-restore instructions

3. **`setup_backup_cron_user.sh`** - Cron setup script
   - Configures automated daily backups
   - Can be re-run to verify setup

4. **`setup_backup_cron.sh`** - System-level cron setup (requires sudo)
   - Alternative for system-wide backup management

## Best Practices

### ✅ DO:
- Run the backup script manually before major changes
- Review backup logs regularly
- Test restore procedures periodically
- Keep backups in multiple locations (consider cloud backup)
- Monitor disk space
- Update the 30-day retention policy if needed

### ❌ DON'T:
- Delete backups manually unless necessary
- Run backups during peak usage times (already scheduled for 2:00 AM)
- Store backups on the same disk as application (consider external storage)
- Rely on backups alone for disaster recovery (test restores regularly)

## Scaling Considerations

For future scaling:
- Consider cloud backup solutions (AWS S3, Google Cloud Storage, etc.)
- Implement offsite backup replication
- Set up backup alerts/monitoring
- Create differential/incremental backups if database grows significantly

## Support & Documentation

For more information:
- Check backup logs: `/home/ubuntu/backups/citricloud/backup.log`
- View cron logs: `/home/ubuntu/backups/citricloud/cron.log`
- Run with `-h` flag for script help

---

**Last Updated**: December 4, 2025  
**Backup Schedule**: Daily at 2:00 AM UTC  
**Status**: ✅ Active and Running
