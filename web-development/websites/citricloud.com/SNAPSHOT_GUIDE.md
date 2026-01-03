# CITRICLOUD Monthly Snapshot Guide

## Overview

Monthly snapshots provide long-term archival and historical reference for your CITRICLOUD application. Unlike daily backups which focus on immediate recovery, monthly snapshots are designed for:

- **Compliance requirements** (audit trails, regulatory retention)
- **Historical comparison** (version control, feature tracking)
- **Long-term archival** (12-month retention)
- **Point-in-time recovery** (restore to specific months)

## Snapshot Configuration

| Setting | Value |
|---------|-------|
| **Schedule** | First day of each month at 3:00 AM UTC |
| **Snapshot Directory** | `/home/ubuntu/backups/citricloud/monthly-snapshots/` |
| **Retention Period** | 12 months |
| **Snapshot Size** | ~428KB (compressed) |
| **Annual Storage** | ~5MB (12 monthly snapshots) |

## Key Differences: Daily Backups vs. Monthly Snapshots

### Daily Backups
- **Frequency**: Every day at 2:00 AM UTC
- **Contents**: Frontend, backend, database, uploads, config
- **Retention**: 30 days (auto-cleanup)
- **Size**: ~470KB per backup
- **Purpose**: Immediate recovery from recent data loss
- **Use Case**: "Recover yesterday's database state"

### Monthly Snapshots
- **Frequency**: First day of each month at 3:00 AM UTC
- **Contents**: Frontend, backend, database, config (NO uploads)
- **Retention**: 12 months
- **Size**: ~428KB per snapshot
- **Purpose**: Compliance, archival, historical reference
- **Use Case**: "Show what the system looked like in March 2025"

## What Gets Snapshotted

### Included ✅
- React source code (`/src`)
- Configuration files (vite, tailwind, tsconfig)
- Python backend source (`/app`)
- SQLite database (binary + SQL dump)
- Nginx configuration
- Documentation files
- Domain configuration

### Excluded ❌
- User uploads (too large for long-term storage)
- Node modules
- Virtual environments
- Cache files
- Build artifacts (.git, __pycache__, .vite, dist)

## Snapshot Lifecycle

```
Monthly Snapshot Lifecycle:
───────────────────────────

Month 1 (January 2025, 1st @ 3 AM UTC)
  └─ Create: citricloud_snapshot_January_2025_20250101_030000.tar.gz
  └─ Store: /home/ubuntu/backups/citricloud/monthly-snapshots/

Month 2 (February 2025, 1st @ 3 AM UTC)
  └─ Create: citricloud_snapshot_February_2025_20250201_030000.tar.gz
  └─ Store: /home/ubuntu/backups/citricloud/monthly-snapshots/
  └─ Count: 2 snapshots

... (continue for 12 months) ...

Month 13 (January 2026, 1st @ 3 AM UTC)
  └─ Create: citricloud_snapshot_January_2026_20260101_030000.tar.gz
  └─ Auto-delete: January 2025 snapshot (older than 12 months)
  └─ Count: Still 12 snapshots (rolling window)
```

## Viewing Snapshots

### List all monthly snapshots:
```bash
ls -lah /home/ubuntu/backups/citricloud/monthly-snapshots/
```

### View snapshot contents (without extracting):
```bash
tar -tzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz
```

### Extract specific snapshot for inspection:
```bash
cd /tmp
tar -xzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz
ls -la citricloud_snapshot_December_2025_*/
```

### View snapshot metadata:
```bash
tar -xzOf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz \
  citricloud_snapshot_December_2025_*/SNAPSHOT_INFO.txt
```

### View snapshot logs:
```bash
tail -f /home/ubuntu/backups/citricloud/monthly-snapshots/snapshot.log
```

## Running Manual Snapshots

To create an immediate snapshot outside the scheduled time:

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
bash snapshot.sh
```

This will:
1. Create a timestamped snapshot
2. Include all configured components
3. Compress the snapshot
4. Clean up old snapshots (>12 months)
5. Log all operations

## Restoring from Monthly Snapshot

### Extract snapshot:
```bash
SNAPSHOT_FILE="/home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz"
TEMP_DIR="/tmp/citricloud_restore_$$"
mkdir -p "$TEMP_DIR"
tar -xzf "$SNAPSHOT_FILE" -C "$TEMP_DIR"
```

### Restore frontend:
```bash
cp -r "$TEMP_DIR/citricloud_snapshot_December_2025_*/frontend/src" \
      /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend/
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend
npm install
```

### Restore backend:
```bash
cp -r "$TEMP_DIR/citricloud_snapshot_December_2025_*/backend/app" \
      /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend/
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend
source venv/bin/activate
pip install -r requirements.txt
```

### Restore database:
```bash
cp "$TEMP_DIR/citricloud_snapshot_December_2025_*/database/citricloud.db" \
   /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend/citricloud.db
```

## Cron Job Management

### View all scheduled snapshots:
```bash
crontab -l | grep snapshot
```

### Edit snapshot schedule:
```bash
crontab -e
```

Current schedule options:
- `0 3 1 * *` = First day of month at 3:00 AM UTC (default)
- `0 3 * * 0` = Every Sunday at 3:00 AM UTC
- `0 3 L * *` = Last day of month at 3:00 AM UTC

### Change snapshot time:
Edit with `crontab -e` and modify the hour/minute:
```bash
# Change to 1:00 AM instead of 3:00 AM
0 1 1 * *  # vs current 0 3 1 * *
```

### Remove snapshot cron job:
```bash
crontab -r
```

### Re-add snapshot cron job:
```bash
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/setup_snapshot_cron.sh
```

## Storage & Cleanup

### Disk usage:
```bash
du -sh /home/ubuntu/backups/citricloud/monthly-snapshots/
```

### Storage estimates:
- Monthly snapshot: ~428KB
- Annual (12 months): ~5MB
- 5 years: ~25MB
- Available space: 44GB

### Manual cleanup (if needed):
```bash
# Delete snapshots older than 6 months
find /home/ubuntu/backups/citricloud/monthly-snapshots/ -name "*.tar.gz" -mtime +180 -delete
```

## Database Snapshot Details

Each monthly snapshot includes:

1. **Binary SQLite database** (`citricloud.db`)
   - Direct point-in-time recovery
   - Preserves all data exactly
   - ~150-200KB

2. **SQL dump** (`citricloud.sql`)
   - Human-readable SQL commands
   - Allows migration to other databases
   - Useful for inspection and compliance
   - ~100-150KB

### Query snapshot database:
```bash
# Extract snapshot
SNAPSHOT_FILE="/home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz"
TEMP_DIR="/tmp/snapshot_$$"
mkdir -p "$TEMP_DIR"
tar -xzf "$SNAPSHOT_FILE" -C "$TEMP_DIR"

# Query database
DB_PATH="$TEMP_DIR/citricloud_snapshot_December_2025_*/database/citricloud.db"
sqlite3 "$DB_PATH" "SELECT * FROM users LIMIT 5;"
```

## Compliance & Audit Trail

Monthly snapshots are suitable for:

### Regulatory Compliance
- GDPR data retention requirements
- SOC 2 audit trails
- ISO compliance documentation
- Historical data preservation

### Audit & Forensics
- Timeline of system state
- Version tracking
- Feature deployment history
- Configuration change audits

### Snapshot Information
Each snapshot includes `SNAPSHOT_INFO.txt`:
```
- Snapshot date and time
- Components included/excluded
- Retention policy
- Restoration instructions
- Metadata (size, file count)
```

## Troubleshooting

### Snapshot fails due to low disk space:
```bash
# Check available space
df -h /home/ubuntu/backups/citricloud/monthly-snapshots/

# Remove older snapshots manually (keep last 6 months)
find /home/ubuntu/backups/citricloud/monthly-snapshots -name "*.tar.gz" -mtime +180 -delete
```

### Cron job not running:
```bash
# Check if cron service is running
systemctl status cron

# View cron logs
grep CRON /var/log/syslog | tail -20

# Test snapshot script manually
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/snapshot.sh
```

### Extract snapshot fails:
```bash
# Verify archive integrity
tar -tzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_*.tar.gz > /dev/null

# Test extraction to temp dir
tar -xzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_*.tar.gz -C /tmp/
```

## Comparison Table

| Feature | Daily Backup | Monthly Snapshot |
|---------|--------------|------------------|
| Frequency | Every day | First of month |
| Time | 2:00 AM UTC | 3:00 AM UTC |
| Includes uploads | Yes ✅ | No ❌ |
| Includes database | Yes ✅ | Yes ✅ |
| Size per copy | ~470KB | ~428KB |
| Retention | 30 days | 12 months |
| Monthly cost | ~14MB | ~4MB |
| Use case | Recovery | Compliance/Archive |
| Priority | Operational | Regulatory |

## Best Practices

### ✅ DO:
- Run snapshots on schedule automatically
- Monitor snapshot logs regularly
- Test restore procedures quarterly
- Keep snapshots in multiple locations (consider cloud sync)
- Review snapshot retention policies annually
- Document snapshot recovery procedures

### ❌ DON'T:
- Delete snapshots manually without good reason
- Run snapshots during peak usage times (already scheduled for 3:00 AM)
- Store snapshots on the same disk as application (consider offsite)
- Ignore disk space warnings
- Skip testing snapshot restoration

## Integration with Daily Backups

**Recommended backup strategy:**
- Daily backups (2:00 AM) → 30-day retention → Operational recovery
- Monthly snapshots (3:00 AM, 1st) → 12-month retention → Compliance/archive
- Both run automatically with minimal overhead

**Total monthly storage:**
- Daily backups: ~14MB
- Monthly snapshots: ~4MB
- **Total: ~18MB/month** (~216MB/year)

## Support & Documentation

### Files Created:
1. **`snapshot.sh`** - Monthly snapshot script
2. **`setup_snapshot_cron.sh`** - Cron configuration script
3. **`SNAPSHOT_GUIDE.md`** - This documentation

### Logging:
- Detailed logs: `/home/ubuntu/backups/citricloud/monthly-snapshots/snapshot.log`
- Cron logs: `/home/ubuntu/backups/citricloud/monthly-snapshots/cron.log`
- System logs: `/var/log/syslog` (cron execution)

---

**Last Updated**: December 4, 2025  
**Next Snapshot**: January 1, 2026 at 3:00 AM UTC  
**Status**: ✅ Active and Running
