# Auto-Build Service Management

## Service Status

The auto-build watcher is now a systemd service that:
- ✅ Starts automatically on system boot
- ✅ Restarts automatically if it crashes
- ✅ Watches for changes in `frontend/src/` and `backend/app/`
- ✅ Automatically builds on file changes

## Quick Commands

### Check Status
```bash
sudo systemctl status citricloud-autobuild
```

### View Live Logs
```bash
sudo journalctl -u citricloud-autobuild -f
```

### View Recent Logs
```bash
sudo journalctl -u citricloud-autobuild -n 100
```

### Start/Stop/Restart
```bash
sudo systemctl start citricloud-autobuild
sudo systemctl stop citricloud-autobuild
sudo systemctl restart citricloud-autobuild
```

### Disable/Enable Auto-Start
```bash
sudo systemctl disable citricloud-autobuild  # Don't start on boot
sudo systemctl enable citricloud-autobuild   # Start on boot
```

## Configuration

**Service File Location**: `/etc/systemd/system/citricloud-autobuild.service`
**Script Location**: `/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/auto-build.sh`

## How It Works

1. The service monitors `frontend/src/` and `backend/app/` directories
2. When changes are detected, it waits 2 seconds for additional changes
3. Runs `npm run build` in frontend (includes log updates)
4. Runs `python -m compileall` in backend
5. Loops back to watching for more changes

## Troubleshooting

**Service won't stay running?**
- Check logs: `sudo journalctl -u citricloud-autobuild -n 50`
- Verify script has execute permissions: `chmod +x auto-build.sh`

**Not detecting changes?**
- Ensure `inotify-tools` is installed: `sudo apt-get install inotify-tools`
- Check inotify limits: `cat /proc/sys/fs/inotify/max_user_watches`

**Builds not completing?**
- Check if node_modules exists: `ls frontend/node_modules`
- Verify Python venv: `ls backend/venv`

## Benefits

✅ **Automatic**: No need to manually run builds
✅ **Persistent**: Survives server reboots
✅ **Resilient**: Restarts automatically after 10 seconds if it fails
✅ **Logged**: All output captured in systemd journal
✅ **Efficient**: Only builds when changes detected

---
**Created**: 2026-01-03
**Status**: Active and Running
