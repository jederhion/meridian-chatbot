import os
import logging
import traceback
from fastapi import APIRouter, Request, HTTPException, Depends
from api.schemas import ChatRequest
from api.crud.chat import save_message, get_chat_history_from_db, get_all_threads_from_db
from api.dependencies import get_current_user
from graph.mcp_agent import run_mcp_agent
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger("Meridian_Support_Engine")

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat")
@limiter.limit("10/minute")
async def chat_with_bot(request: Request, chat_req: ChatRequest, user: dict = Depends(get_current_user)):
    try:
        # Fetch the API key from the environment instead of the user

        # Save user message 
        save_message(chat_req.thread_id, "user", chat_req.message, user["id"])
        
        # Pass the system key to the MCP agent
        ai_response = await run_mcp_agent(
            user_prompt=chat_req.message, 
            thread_id=chat_req.thread_id, 
            user_id=user["id"]
        )
        
        # Save agent response 
        save_message(chat_req.thread_id, "agent", ai_response, user["id"])

        return {"response": ai_response}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CRASH IN CHAT ROUTE: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal Server Error: Check Backend Logs")

@router.get("/chat/{thread_id}")
async def get_history(thread_id: str, user: dict = Depends(get_current_user)): 
    try:
        return {"history": get_chat_history_from_db(thread_id, user["id"])}
    except Exception as e:
        logger.error(f"Failed to fetch chat history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat history from database.")

@router.get("/threads")
async def get_threads(user: dict = Depends(get_current_user)): 
    try:
        return {"threads": get_all_threads_from_db(user["id"])}
    except Exception as e:
        logger.error(f"Failed to fetch threads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch threads from database.")