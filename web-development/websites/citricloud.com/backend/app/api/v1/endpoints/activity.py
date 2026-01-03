"""
File activity tracking and API endpoint for Recent Files & Activitys
"""
import os
import time
from pathlib import Path
import json
import subprocess
import re
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import Response, Request
from typing import List, Dict

router = APIRouter()

WORKSPACE_DIR = Path("../../../../frontend/src/pages/workspace")  # Adjust as needed

activity_log: List[Dict] = []
dev_logs: List[Dict] = []


def scan_workspace_files() -> List[Dict]:
    files = []
    for root, _, filenames in os.walk(WORKSPACE_DIR):
        for filename in filenames:
            file_path = Path(root) / filename
            stat = file_path.stat()
            files.append({
                "name": str(file_path.relative_to(WORKSPACE_DIR)),
                "modified": stat.st_mtime,
                "created": stat.st_ctime,
                "type": "file"
            })
    return files


def log_activity(action: str, file: str):
    activity_log.append({
        "timestamp": time.time(),
        "action": action,
        "file": file
    })


@router.get("/recent-files-activity", tags=["Workspace"])
async def get_recent_files_activity():
    files = scan_workspace_files()
    return JSONResponse({
        "files": files,
        "activity": activity_log[-50:]  # last 50 activities
    })


@router.get("/logs", tags=["Logs"])
async def get_logs(request: Request):
    """Return development logs dynamically generated from git commits.
    This ensures real-time updates without requiring frontend rebuild.
    """
    try:
        # Get git commits from last 30 days
        here = Path(__file__).resolve()
        project_root = here.parents[6]  # backend/app/api/v1/endpoints/activity.py -> project root
        
        result = subprocess.run(
            ['git', 'log', '--all', '--since=30 days ago', '--pretty=format:%H|||%s|||%ad|||%an', '--date=format:%Y-%m-%d %H:%M'],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0 and result.stdout:
            logs = []
            seen_hashes = set()
            
            for line in result.stdout.strip().split('\n'):
                if '|||' not in line:
                    continue
                    
                parts = line.split('|||')
                if len(parts) < 4:
                    continue
                    
                commit_hash, message, date_time, author = parts[0], parts[1], parts[2], parts[3]
                short_hash = commit_hash[:8]
                
                # Skip duplicates
                if short_hash in seen_hashes:
                    continue
                seen_hashes.add(short_hash)
                
                # Skip generic commit messages
                if message.lower() in ['wip', 'temp', 'test', 'merge', 'initial commit']:
                    continue
                
                # Parse date and time
                try:
                    dt = datetime.strptime(date_time, '%Y-%m-%d %H:%M')
                    log_date = dt.strftime('%Y-%m-%d')
                    log_time = dt.strftime('%H:%M')
                except:
                    continue
                
                # Detect change type
                message_lower = message.lower()
                if any(word in message_lower for word in ['fix', 'bug', 'error', 'issue']):
                    log_type = 'fix'
                elif any(word in message_lower for word in ['add', 'new', 'feature', 'implement']):
                    log_type = 'feature'
                elif any(word in message_lower for word in ['improve', 'enhance', 'better', 'optimize']):
                    log_type = 'improvement'
                elif any(word in message_lower for word in ['update', 'bump', 'upgrade']):
                    log_type = 'update'
                elif any(word in message_lower for word in ['remove', 'delete']):
                    log_type = 'deleted'
                else:
                    log_type = 'change'
                
                logs.append({
                    'date': log_date,
                    'time': log_time,
                    'type': log_type,
                    'title': message,
                    'description': f'Git commit: {message}',
                    'hash': short_hash
                })
            
            # Limit to latest 500
            logs = logs[:500]
            
            payload = {"logs": logs}
            
            # Generate ETag based on latest commit
            etag = f"W/\"git-{logs[0]['hash']}-{len(logs)}\"" if logs else "W/\"git-empty\""
            inm = request.headers.get("If-None-Match")
            if inm == etag:
                return Response(status_code=304)
            
            resp = JSONResponse(payload)
            resp.headers["ETag"] = etag
            resp.headers["Cache-Control"] = "public, max-age=30"  # 30 second cache for real-time feel
            return resp
            
    except Exception as e:
        # Fallback to in-memory logs on error
        print(f"Error generating git logs: {e}")
    
    # Fallback to in-memory logs
    payload = {"logs": dev_logs[-500:]}
    last = dev_logs[-1] if dev_logs else None
    etag = f"W/\"logs-{len(dev_logs)}-{(last or {}).get('title','')}-{(last or {}).get('time','')}\""
    inm = request.headers.get("If-None-Match")
    if inm == etag:
        return Response(status_code=304)
    resp = JSONResponse(payload)
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "public, max-age=30"
    return resp


@router.get("/logs/public", tags=["Logs"])
async def get_public_logs(request: Request):
    """Serve logs.json from the frontend public directory for cross-domain consistency.
    If the file is unavailable, return the in-memory dev_logs.
    """
    try:
        here = Path(__file__).resolve()
        # backend/app/api/v1/endpoints/activity.py -> project root -> frontend/public/logs.json
        project_root = here.parents[6]
        public_logs = project_root / "frontend" / "public" / "logs.json"
        if public_logs.exists():
            data_text = public_logs.read_text(encoding="utf-8")
            data_obj = json.loads(data_text)
            # Compute file-based ETag using mtime and size
            stat = public_logs.stat()
            etag = f"W/\"pl-{int(stat.st_mtime)}-{stat.st_size}\""
            inm = request.headers.get("If-None-Match")
            if inm == etag:
                return Response(status_code=304)
            resp = JSONResponse(content=data_obj)
            resp.headers["ETag"] = etag
            resp.headers["Cache-Control"] = "public, max-age=300"
            return resp
    except Exception:
        pass
    # Fallback to in-memory logs with a simple ETag
    payload = {"logs": dev_logs[-500:]}
    last = dev_logs[-1] if dev_logs else None
    etag = f"W/\"logs-{len(dev_logs)}-{(last or {}).get('title','')}-{(last or {}).get('time','')}\""
    inm = request.headers.get("If-None-Match")
    if inm == etag:
        return Response(status_code=304)
    resp = JSONResponse(payload)
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "public, max-age=60"
    return resp


@router.post("/logs", tags=["Logs"])
async def add_log(entry: Dict):
    """Append a log entry. Expected keys: date (YYYY-MM-DD), time (HH:mm), type, title, description, details(optional list)."""
    # Basic validation and normalization
    normalized = {
        "date": entry.get("date"),
        "time": entry.get("time"),
        "type": entry.get("type"),
        "title": entry.get("title"),
        "description": entry.get("description"),
        "details": entry.get("details", []),
    }
    dev_logs.append(normalized)
    return JSONResponse({"status": "ok"})
