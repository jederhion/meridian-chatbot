import uuid
from fastapi import APIRouter, HTTPException, Response, Request
from api.schemas import AuthRequest
from api.crud.users import get_user_by_username, create_user, create_user_session, delete_session
from utils.security import hash_password, verify_password
from config import ENVIRONMENT

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register")
async def register_user(req: AuthRequest):
    existing_user = get_user_by_username(req.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken.")
    
    hashed_pw = hash_password(req.password)
    create_user(req.username, hashed_pw)
    return {"status": "success", "message": "User registered successfully. Please log in."}

@router.post("/login")
async def login_user(req: AuthRequest, response: Response):
    user = get_user_by_username(req.username)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
    session_id = str(uuid.uuid4())
    create_user_session(user["id"], session_id)
    
    is_production = ENVIRONMENT == "production"
    response.set_cookie(
        key="session_id", value=session_id, httponly=True,
        secure=is_production, samesite="lax", max_age=30 * 24 * 60 * 60
    )
    return {"status": "success", "message": "Logged in successfully."}

@router.post("/logout")
async def logout_user(req: Request, response: Response):
    session_id = req.cookies.get("session_id")
    if session_id:
        delete_session(session_id)
        
    is_production = ENVIRONMENT == "production"
    response.delete_cookie(key="session_id", httponly=True, secure=is_production, samesite="lax")
    return {"status": "success", "message": "Logged out successfully."}