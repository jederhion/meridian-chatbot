import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# --- AI MODEL CONFIGURATION ---
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gpt-4o")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.0"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "temp_uploads")

# --- AWS CONFIGURATION ---
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# --- MCP CONFIGURATION ---
# Target the remote Meridian Electronics HTTP MCP server instead of a local process
MCP_SERVER_URL = os.getenv(
    "MCP_SERVER_URL", 
    "https://order-mcp-74afyau24q-uc.a.run.app/mcp"
)