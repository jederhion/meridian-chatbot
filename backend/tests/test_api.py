import os
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from main import app
from api.dependencies import get_current_user

client = TestClient(app)

# Mock the authentication dependency to simulate a logged-in user
def override_get_current_user():
    return {"id": "test_user_1", "email": "test@meridian.com", "encrypted_api_key": None}

app.dependency_overrides[get_current_user] = override_get_current_user


def test_root_health_check():
    """Verify the health check reflects the Meridian application."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Meridian Support Engine is running!"}


@patch("api.routers.chat.run_mcp_agent", new_callable=AsyncMock)
@patch("api.routers.chat.save_message")
def test_chat_endpoint_success(mock_save_message, mock_run_agent):
    """Verify the chat endpoint pulls the system API key and returns a valid response."""
    # 1. Setup the environment to simulate our production configuration
    os.environ["OPENAI_API_KEY"] = "sk-system-test-key"
    
    # 2. Mock the agent's behavior
    mock_run_agent.return_value = "The inventory shows 5 keyboards in stock."

    # 3. Execute
    response = client.post(
        "/api/chat",
        json={"thread_id": "thread_123", "message": "Do you have keyboards?"}
    )

    # 4. Assertions
    assert response.status_code == 200
    assert response.json() == {"response": "The inventory shows 5 keyboards in stock."}
    
    # Ensure the message was saved to the DB twice (once for user, once for agent)
    assert mock_save_message.call_count == 2
    
    # Verify the agent was called with the system API key, NOT a user-provided one
    mock_run_agent.assert_called_once_with(
        user_prompt="Do you have keyboards?",
        thread_id="thread_123",
        user_id="test_user_1"
    )

@patch("api.routers.chat.run_mcp_agent", new_callable=AsyncMock)
def test_chat_endpoint_missing_system_key(mock_run_agent):
    """Verify the system fails safely if the server admin forgets to set OPENAI_API_KEY."""
    
    # ✨ Safeguard to prevent RecursionError if the endpoint accidentally tries to return the mock
    mock_run_agent.return_value = "Fallback string to prevent recursion"
    
    # Ensure the key is missing
    if "OPENAI_API_KEY" in os.environ:
        del os.environ["OPENAI_API_KEY"]
        
    response = client.post(
        "/api/chat",
        json={"thread_id": "thread_123", "message": "Hello?"}
    )

    assert response.status_code == 500
    assert "Server misconfiguration: Missing API Key" in response.json()["detail"]
    
    # Verify the agent was never called due to the missing key early exit
    mock_run_agent.assert_not_called()