from fastapi import APIRouter, Request, Depends, HTTPException
from api.schemas import UserMetrics
from api.crud.users import update_user_api_key, get_user_by_session, get_user_metrics
from api.dependencies import get_current_user
from utils.security import encrypt_key

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("/metrics", response_model=UserMetrics)
async def get_metrics(req: Request):
    session_id = req.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    user = get_user_by_session(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
        
    metrics = get_user_metrics(user["id"])
    return metrics