from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from utils.guardrails import check_for_prompt_injection

# --- Original Models ---
class MCPPlugin(BaseModel):
    id: str
    name: str
    provider: str
    description: str
    is_installed: bool = False

class GemConfiguration(BaseModel):
    id: str
    name: str
    description: str
    system_prompt: str
    allowed_mcp_tools: List[str] = Field(default_factory=list)
    rag_namespace_id: Optional[str] = None
    is_system_gem: bool = False

class ChatMessage(BaseModel):
    role: str
    content: str

# --- New Request Models (Moved from main.py) ---
class AuthRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    thread_id: str
    message: str = Field(..., min_length=1, max_length=1000)

    @field_validator('message')
    def prevent_obvious_injections(cls, v):
        # Delegate the security check to our dedicated guardrails utility
        check_for_prompt_injection(v)
        return v


class UserMetrics(BaseModel):
    tokensUsedThisMonth: int
    totalChats: int
    storageUsedMB: float
    activeBots: int