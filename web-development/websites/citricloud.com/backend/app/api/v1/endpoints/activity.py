"""
File activity tracking and API endpoint for Recent Files & Activitys
"""
import os
import time
from pathlib import Path
import json
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
    """Return development logs for the frontend Logs page.
    This is a minimal in-memory source; can be replaced with DB later.
    """
    payload = {
        "logs": dev_logs[-500:]  # return latest 500 entries
    }
    # Compute weak ETag from count + last item title/time
    last = dev_logs[-1] if dev_logs else None
    etag = f"W/\"logs-{len(dev_logs)}-{(last or {}).get('title','')}-{(last or {}).get('time','')}\""
    inm = request.headers.get("If-None-Match")
    if inm == etag:
        return Response(status_code=304)
    resp = JSONResponse(payload)
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "public, max-age=60"
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
