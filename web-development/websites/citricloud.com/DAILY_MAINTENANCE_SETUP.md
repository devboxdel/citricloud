# Daily Maintenance Cron Job - Setup Complete

## Overview
Automated daily maintenance system that runs at **20:00 CET (19:00 UTC)** to:
1. Update logs on the Logs page
2. Perform daily backup
3. Create system snapshot

## Implementation Details

### Script Location
```bash
/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/daily-maintenance.sh
```

### Cron Schedule
```cron
# CITRICLOUD Daily Maintenance at 20:00 CET (19:00 UTC)
# Updates logs, runs backup, and creates snapshot
0 19 * * * /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/daily-maintenance.sh >> /home/ubuntu/backups/citricloud/maintenance.log 2>&1
```

### What It Does

#### 1. **Updates Logs Page** (`/log`)
- Adds a new entry to `/frontend/public/logs.json`
- Entry includes timestamp, maintenance tasks performed
- Logs are limited to 1000 most recent entries
- Visible on the frontend Logs page immediately

#### 2. **Runs Daily Backup** (`backup.sh`)
- Backs up frontend, backend, database, and configurations
- Stored in `/home/ubuntu/backups/citricloud/`
- Retains backups for 30 days
- Creates compressed archives for efficient storage

#### 3. **Creates System Snapshot** (`snapshot.sh`)
- Monthly long-term snapshots for archival
- Stored in `/home/ubuntu/backups/citricloud/monthly-snapshots/`
- Retains snapshots for 12 months
- Full system state preservation

#### 4. **System Health Check**
- Disk space monitoring
- Memory usage check
- Backup directory size reporting
- Failed services detection (systemd)

## Log Files

### Maintenance Log
```bash
/home/ubuntu/backups/citricloud/maintenance.log
```
Contains:
- Timestamp of each maintenance run
- Success/failure status of each step
- System health metrics
- Errors and warnings

### Backup Log
```bash
/home/ubuntu/backups/citricloud/backup.log
```

### Snapshot Log
```bash
/home/ubuntu/backups/citricloud/monthly-snapshots/snapshot.log
```

## Manual Execution

### Run maintenance immediately:
```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
./daily-maintenance.sh
```

### Test individual components:
```bash
# Test backup only
./backup.sh

# Test snapshot only
./snapshot.sh
```

## Monitoring

### Check cron job status:
```bash
crontab -l | grep "Daily Maintenance"
```

### View recent maintenance logs:
```bash
tail -100 /home/ubuntu/backups/citricloud/maintenance.log
```

### Check if maintenance ran today:
```bash
grep "$(date +%Y-%m-%d)" /home/ubuntu/backups/citricloud/maintenance.log
```

## Troubleshooting

### If maintenance fails:
1. Check the maintenance log for errors
2. Verify script permissions: `ls -l daily-maintenance.sh`
3. Test Python3 availability: `python3 --version`
4. Ensure backup directory exists: `ls -la /home/ubuntu/backups/`

### Common Issues:

**JSON Syntax Error in logs.json:**
```bash
# Validate JSON syntax
python3 -m json.tool /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend/public/logs.json > /dev/null
```

**Permission Denied:**
```bash
chmod +x /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/daily-maintenance.sh
```

**Cron Not Running:**
```bash
# Check cron service status
sudo systemctl status cron

# Restart cron if needed
sudo systemctl restart cron
```

## Time Zone Information

- **Server Time:** UTC
- **Cron Time:** 19:00 UTC
- **Local Time:** 20:00 CET (GMT+1)
- **During DST:** Will run at 21:00 CEST (GMT+2)

Note: Server runs on UTC, so the cron job is set to 19:00 UTC which equals 20:00 CET.

## Backup Retention

- **Daily Backups:** 30 days
- **Monthly Snapshots:** 12 months
- **Logs:** 1000 most recent entries

## Files Modified

1. **Created:** `/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/daily-maintenance.sh`
2. **Fixed:** `/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend/public/logs.json` (JSON syntax error on line 148)
3. **Modified:** User crontab (added daily maintenance job)

## Success Verification

✅ Script created and made executable
✅ JSON syntax error in logs.json fixed
✅ Cron job added successfully
✅ Test run completed successfully
✅ Log entry added to Logs page
✅ Backup process initiated
✅ Maintenance log created

## Next Steps

The system is now fully automated. Every day at 20:00 CET:
- Logs page will show a new maintenance entry
- Backups will be created automatically
- System snapshots will be saved
- Health checks will be performed

No further action required! 🎉
