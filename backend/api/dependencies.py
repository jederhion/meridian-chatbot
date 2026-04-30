from fastapi import Request, HTTPException
from api.crud.users import get_user_by_session

def get_current_user(req: Request):
    """Dependency to get the currently authenticated user from the session cookie."""
    session_id = req.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="You must be logged in.")
    
    user = get_user_by_session(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")
    
    return user

def get_optional_user(req: Request):
    """Dependency to get the user if logged in, or return None if not."""
    session_id = req.cookies.get("session_id")
    if not session_id:
        return None
    
    user = get_user_by_session(session_id)
    return user