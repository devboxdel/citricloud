# CITRICLOUD Backup - Quick Reference

## Status
✅ **Daily backups are now active and will run every day at 2:00 AM UTC**

## Key Information

| Item | Details |
|------|---------|
| **Backup Location** | `/home/ubuntu/backups/citricloud/` |
| **Schedule** | Daily at 2:00 AM UTC |
| **Backup Size** | ~472KB (compressed) |
| **Retention** | 30 days (auto-cleanup) |
| **Latest Backup** | `/home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz` |

## Quick Commands

```bash
# Run backup now
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backup.sh

# List all backups
ls -lah /home/ubuntu/backups/citricloud/

# Restore from backup (dry-run)
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/restore.sh \
  /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz --dry-run

# Restore from backup (actual)
bash /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/restore.sh \
  /home/ubuntu/backups/citricloud/citricloud_backup_20251204_173205.tar.gz

# View cron logs
tail -f /home/ubuntu/backups/citricloud/cron.log

# Verify cron job
crontab -l | grep backup
```

## Files Created

1. **`backup.sh`** - Automated backup script
2. **`restore.sh`** - Restore from backup
3. **`setup_backup_cron_user.sh`** - Setup daily cron job
4. **`setup_backup_cron.sh`** - System-level setup (requires sudo)
5. **`BACKUP_GUIDE.md`** - Complete backup documentation

## What's Backed Up

✅ Frontend source code (React, TypeScript, config)  
✅ Backend source code (Python, FastAPI)  
✅ SQLite database + SQL dump  
✅ User uploads  
✅ Configuration files  
✅ Documentation  

❌ Excluded: node_modules, dist, venv, .git, __pycache__

## Next Steps (Optional)

### Add email notifications:
Edit `backup.sh` line ~250 and uncomment:
```bash
echo "CITRICLOUD backup completed successfully on $(date)" | mail -s "Backup Report" your-email@example.com
```

### Change backup schedule:
Edit cron job with `crontab -e` and change `0 2 * * *` to desired time:
- `0 1 * * *` = 1:00 AM
- `0 3 * * *` = 3:00 AM
- `0 0 * * 0` = Sunday at midnight

### Change retention period:
Edit `backup.sh` line 20:
```bash
RETENTION_DAYS=30  # Change to desired number
```

### Change backup directory:
Edit `backup.sh` line 10:
```bash
BACKUP_DIR="/new/path"
```

## Testing & Verification

✅ Backup script works correctly  
✅ First backup successful (470KB)  
✅ Cron job scheduled and active  
✅ Restoration script ready  

## Support

For detailed information, see: `BACKUP_GUIDE.md`

---
**Setup Date**: December 4, 2025  
**Status**: ✅ Production Ready
