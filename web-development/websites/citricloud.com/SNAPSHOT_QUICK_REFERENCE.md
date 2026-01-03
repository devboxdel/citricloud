# CITRICLOUD Monthly Snapshot - Quick Reference

## Status
✅ **Monthly snapshots are now scheduled for the first day of each month at 3:00 AM UTC**

## Key Information

| Item | Details |
|------|---------|
| **Snapshot Location** | `/home/ubuntu/backups/citricloud/monthly-snapshots/` |
| **Schedule** | First day of month at 3:00 AM UTC |
| **Snapshot Size** | ~428KB (compressed) |
| **Retention** | 12 months (auto-cleanup) |
| **Latest Snapshot** | `citricloud_snapshot_December_2025_20251204_173834.tar.gz` |
| **Next Snapshot** | January 1, 2026 at 3:00 AM UTC |

## Quick Commands

```bash
# Run snapshot now
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/snapshot.sh

# List all snapshots
ls -lah /home/ubuntu/backups/citricloud/monthly-snapshots/

# View snapshot contents
tar -tzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz | head -20

# Extract specific snapshot
cd /tmp
tar -xzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz

# View snapshot logs
tail -f /home/ubuntu/backups/citricloud/monthly-snapshots/snapshot.log

# Verify cron job
crontab -l | grep snapshot
```

## Snapshot Contents

✅ Frontend source code (React, TypeScript, config)  
✅ Backend source code (Python, FastAPI)  
✅ SQLite database + SQL dump  
✅ Configuration files (Nginx, domain config)  
✅ Documentation  

❌ Excluded: node_modules, venv, uploads (saves space for long-term storage)

## What's Different from Daily Backups?

| Aspect | Daily Backup | Monthly Snapshot |
|--------|--------------|------------------|
| Schedule | Every day @ 2:00 AM | 1st of month @ 3:00 AM |
| Uploads | Included | Excluded |
| Retention | 30 days | 12 months |
| Purpose | Recovery | Archive/Compliance |
| Size | 470KB | 428KB |

## Storage Requirements

- **Per snapshot**: 428KB
- **Per year**: ~5MB (12 snapshots)
- **5 years**: ~25MB
- **Available space**: 44GB

## Restore from Snapshot

### Quick extract:
```bash
tar -xzf /home/ubuntu/backups/citricloud/monthly-snapshots/citricloud_snapshot_December_2025_*.tar.gz -C /tmp/
```

### Full restore instructions:
See `SNAPSHOT_GUIDE.md` for detailed restoration procedures

## Configuration

### Current Schedule:
- **Cron**: `0 3 1 * *` (First day of month @ 3:00 AM UTC)

### Change Schedule:
Edit with: `crontab -e`

Available options:
- `0 3 1 * *` = First day of month (default)
- `0 3 * * 0` = Every Sunday
- `0 3 L * *` = Last day of month

## Testing & Verification

✅ Snapshot script works correctly  
✅ First snapshot created (428K)  
✅ Cron job scheduled and active  
✅ Automatic cleanup configured (12-month retention)  

## Support

For detailed information, see: `SNAPSHOT_GUIDE.md`

**Complements**: Daily backup system (see `BACKUP_GUIDE.md`)

---
**Setup Date**: December 4, 2025, 17:38 UTC  
**Status**: ✅ Production Ready
