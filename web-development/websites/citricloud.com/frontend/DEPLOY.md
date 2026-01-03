# Quick Deployment Guide

## 🚀 Deploy with Auto-Logging

Run this single command to deploy with automatic log updates:

```bash
npm run deploy
```

This command:
1. ✅ Updates Log.tsx with new entry
2. ✅ Compiles TypeScript  
3. ✅ Builds production assets
4. ✅ Reloads nginx automatically
5. ✅ Shows deployment summary

## 📝 Alternative Commands

### Regular Build (with auto-logging)
```bash
npm run build
```
Updates logs and builds, but doesn't reload nginx.

### Quick Build (skip logging)
```bash
npm run build:skip-log
```
Emergency use only - bypasses log update.

### Manual Log Update
```bash
npm run update-logs
```
Update logs without building.

## 💡 Best Practice

Always commit changes before deploying for better log tracking:

```bash
# 1. Commit with descriptive message
git add .
git commit -m "Add new feature: User settings page"

# 2. Deploy (logs will include commit info)
npm run deploy
```

## 🎯 Log Entry Types

Your commit message determines the log type:
- `fix bug` → Fix (red)
- `add feature` → Feature (blue)
- `improve` → Improvement (green)
- `update` → Update (purple)
- `change` → Change (orange)

## 📊 View Logs

Visit: https://citricloud.com/logs

- Calendar shows dates with changes (green highlights)
- Click dates to filter logs
- All entries auto-sorted newest first

---

**That's it!** Use `npm run deploy` for everything.
