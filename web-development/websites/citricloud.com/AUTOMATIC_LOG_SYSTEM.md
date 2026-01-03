# Automatic Log Update System

## Overview
The Log page (`/log`) automatically updates with git commits and build information. The system runs automatically on every build.

## How It Works

### 1. Auto-Build Service
- **Service**: `citricloud-autobuild.service`
- **Location**: `/etc/systemd/system/citricloud-autobuild.service`
- **Status**: Check with `systemctl status citricloud-autobuild.service`
- **Function**: Watches for file changes and automatically builds the frontend

### 2. Build Process
When you run `npm run build` or `npm run deploy`, the following happens:

```bash
npm run build
  ↓
npm run update-logs  # Runs BEFORE build
  ↓
node scripts/update-logs.js  # Scans git commits
  ↓
Updates src/pages/Log.tsx with new entries
  ↓
vite build  # Builds with updated logs
```

### 3. Log Update Script
**File**: `frontend/scripts/update-logs.js`

**What it does**:
- Scans git commits from the last 30 days
- Detects change type based on commit message keywords:
  - `fix/bug` → "fix"
  - `feat/add` → "feature"
  - `improve/enhance` → "improvement"
  - `update/upgrade` → "update"
  - `change/modify` → "change"
  - `remove/delete` → "deleted"
  - `optimi/perf` → "optimized"
- Filters out duplicates by checking commit hash
- Formats entries and inserts them at the top of the log array

### 4. Real-Time Updates
The Log page also polls for updates every 30 seconds:
- Checks backend API for new logs
- Auto-refreshes without page reload
- Shows last updated timestamp

## Manual Updates

### Update Logs Manually
```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend
npm run update-logs
```

### Build Without Updating Logs
```bash
npm run build:skip-log
```

### Force Rebuild with Logs
```bash
npm run deploy
```

## Current Session Updates Added

### Today's Changes (2026-01-03)
- ✅ Redesigned Contact megamenu with two-column layout
- ✅ Added Workspace service page with 15+ integrated apps
- ✅ Reorganized Services megamenu with categories
- ✅ Enhanced Services with icons and cards
- ✅ Fixed Services navigation links
- ✅ Expanded Services from 6 to 12 items
- ✅ Implemented dynamic Blog megamenu

## Troubleshooting

### Logs Not Updating?

1. **Check if auto-build is running**:
   ```bash
   systemctl status citricloud-autobuild.service
   ```

2. **Check for recent commits**:
   ```bash
   git log --since="$(date +%Y-%m-%d) 00:00" --oneline
   ```

3. **Manually run update**:
   ```bash
   npm run update-logs
   ```

4. **Check for errors in update script**:
   ```bash
   node scripts/update-logs.js --verbose
   ```

### Duplicate Entries?
The script automatically prevents duplicates by:
- Checking commit hash (first 8 characters)
- Checking title + date combination
- Filtering before insertion

### Build Fails?
If `npm run build` fails due to log updates:
```bash
npm run build:skip-log
```

## Important Files

- **Log Page**: `frontend/src/pages/Log.tsx`
- **Update Script**: `frontend/scripts/update-logs.js`
- **Build Script**: `frontend/package.json` (scripts section)
- **Auto-Build Service**: `/etc/systemd/system/citricloud-autobuild.service`
- **Post-Build Script**: `frontend/scripts/post-build.sh`

## Best Practices

1. **Write Clear Commit Messages**: The log title comes from your commit message
2. **Use Conventional Commits**: Use keywords like `feat:`, `fix:`, `improve:` for better categorization
3. **Keep Auto-Build Running**: Don't disable `citricloud-autobuild.service`
4. **Review Logs After Deploy**: Visit `/log` to verify entries appear correctly

## Configuration

### Change Refresh Interval
In `Log.tsx`, modify:
```typescript
const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
```

### Change Git History Depth
In `update-logs.js`, modify:
```javascript
const commits = execSync(
  `git log --all --since="${sinceDate}" ...`, // Change --since date
  ...
);
```

### Disable Auto-Refresh
In the Log page UI, toggle "Auto Refresh" off, or modify:
```typescript
const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
```

## Verification

After updates, verify:
1. Visit https://citricloud.com/log
2. Check for new entries at the top
3. Verify date/time stamps
4. Confirm change types are correct
5. Check descriptions are readable

---

**Last Updated**: 2026-01-03 20:30 UTC
**System Status**: ✅ Active and Running
