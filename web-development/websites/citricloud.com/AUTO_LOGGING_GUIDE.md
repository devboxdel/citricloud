# Auto-Logging System for Production Builds

This system automatically updates the Logs page whenever a production build is made.

## How It Works

1. **Pre-Build**: `npm run update-logs` runs before building
2. **Log Generation**: Detects recent git commits and creates log entries
3. **Build**: TypeScript compilation and Vite build
4. **Post-Build**: Nginx reload and deployment summary

## Available Commands

### Standard Build with Auto-Logging
```bash
npm run build
```
- Updates Log.tsx with new entry
- Compiles TypeScript
- Builds production assets
- Log entry includes recent commit info

### Full Deployment (Recommended)
```bash
npm run deploy
```
- Runs build with auto-logging
- Reloads nginx automatically
- Shows deployment summary
- Includes build size and timestamp

### Build Without Logging (Emergency Use)
```bash
npm run build:skip-log
```
- Skips log update
- Use only when log system has issues

### Manual Log Update
```bash
npm run update-logs
```
- Updates logs without building
- Useful for testing log entries

## Log Entry Format

Each build generates an entry with:
- **Date & Time**: Automatic timestamp
- **Type**: Auto-detected from commit message (feature/fix/improvement/update/etc.)
- **Title**: Latest git commit message or "Production Build Deployed"
- **Description**: Summary of changes
- **Details**: 
  - Latest commit info
  - Modified files
  - Build artifacts info
  - Deployment status

## Type Detection

Commit messages are analyzed for keywords:
- `fix`, `bug` → **fix**
- `feat`, `add` → **feature**
- `improve`, `enhance` → **improvement**
- `update`, `upgrade` → **update**
- `change`, `modify` → **change**
- `remove`, `delete` → **deleted**
- `optimi`, `perf` → **optimized**

## Examples

### Example 1: Feature Addition
```bash
git commit -m "Add user dashboard widgets"
npm run deploy
```
Creates log entry:
- Type: feature
- Title: "Add user dashboard widgets"
- Details include commit info

### Example 2: Bug Fix
```bash
git commit -m "Fix login redirect issue"
npm run deploy
```
Creates log entry:
- Type: fix
- Title: "Fix login redirect issue"

### Example 3: Quick Deploy Without Commit
```bash
npm run deploy
```
Creates log entry:
- Type: update
- Title: "Production Build Deployed"
- Generic deployment details

## Workflow Integration

### Recommended Git Workflow
```bash
# 1. Make changes
# 2. Commit with descriptive message
git add .
git commit -m "Feature: Add settings page with theme toggle"

# 3. Deploy (auto-logs + build + nginx reload)
npm run deploy
```

### Multiple Changes
```bash
# Work on multiple files
git add src/pages/Settings.tsx
git commit -m "Add settings page layout"

git add src/components/ThemeToggle.tsx  
git commit -m "Improve theme toggle animation"

# Deploy (logs will include latest commit)
npm run deploy
```

## Troubleshooting

### Logs Not Updating
1. Check if `scripts/update-logs.js` exists
2. Verify `git` is available: `git --version`
3. Try manual update: `npm run update-logs`
4. Check console output for errors

### Build Loop
If build keeps triggering itself:
1. Use `npm run build:skip-log` once
2. Check for circular dependencies
3. Verify `SKIP_LOG_UPDATE` environment variable

### Nginx Reload Fails
Post-build script continues even if nginx fails:
```bash
# Manual reload
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Test nginx config
sudo nginx -t
```

## File Structure

```
frontend/
├── scripts/
│   ├── update-logs.js      # Auto-logging logic
│   └── post-build.sh       # Post-deployment tasks
├── src/
│   └── pages/
│       └── Log.tsx         # Logs page (auto-updated)
└── package.json            # Build commands
```

## Configuration

### Disable Auto-Logging Temporarily
```bash
export SKIP_LOG_UPDATE=true
npm run build
```

### Customize Log Entries
Edit `scripts/update-logs.js`:
- Modify `createBuildLogEntry()` for custom format
- Adjust `detectChangeType()` for different keywords
- Change `getRecentGitCommits(N)` for more/fewer commits

## Benefits

✅ **Automatic**: No manual log updates needed  
✅ **Accurate**: Timestamps and commit info captured automatically  
✅ **Visible**: Changes appear in Logs page calendar immediately  
✅ **Traceable**: Full deployment history with git integration  
✅ **Efficient**: Single command for complete deployment  

## Calendar Integration

Updated logs automatically appear in:
- **Calendar View**: Date highlighted with green indicator
- **Stats**: Count updated for each change type
- **Filters**: Sortable and searchable entries
- **Timeline**: Chronological order with timestamps

---

**Pro Tip**: Always use descriptive commit messages for meaningful log entries!
