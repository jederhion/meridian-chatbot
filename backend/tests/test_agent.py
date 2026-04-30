# In backend/tests/test_agent.py

import pytest
import asyncio
from unittest.mock import AsyncMock, patch

from graph.mcp_agent import run_mcp_agent

@pytest.mark.asyncio
@patch("graph.mcp_agent.get_chat_history_from_db")
@patch("graph.mcp_agent.streamablehttp_client") # ✨ 1. Update the patch name
@patch("graph.mcp_agent.ClientSession")
@patch("graph.mcp_agent.load_mcp_tools")
@patch("graph.mcp_agent.create_react_agent")
async def test_mcp_agent_success(
    mock_create_react_agent,
    mock_load_tools,
    mock_client_session,
    mock_streamablehttp_client, # ✨ 2. Update parameter name
    mock_get_history
):
    """Test that the agent successfully connects via SSE and processes a prompt."""
    # 1. Setup mocks
    mock_get_history.return_value = []
    
    # Mock HTTP Transport
    # ✨ 3. streamablehttp_client returns a 3-tuple, so we need 3 AsyncMocks
    mock_http_transport = (AsyncMock(), AsyncMock(), AsyncMock()) 
    mock_streamablehttp_client.return_value.__aenter__.return_value = mock_http_transport
    
    # Mock MCP Session
    mock_session_instance = AsyncMock()
    mock_client_session.return_value.__aenter__.return_value = mock_session_instance
    
    # ... (Keep the rest of the test exactly the same)
    mock_load_tools.return_value = [] 
    
    mock_agent_instance = AsyncMock()
    mock_message = AsyncMock()
    mock_message.content = "Meridian Electronics support at your service. Your order 123 is shipped."
    mock_message.usage_metadata = {"total_tokens": 50}
    
    mock_agent_instance.ainvoke.return_value = {"messages": [mock_message]}
    mock_create_react_agent.return_value = mock_agent_instance

    result = await run_mcp_agent(
        user_prompt="Where is my order 123?",
        thread_id="thread_abc",
        user_id="user_1"
    )

    assert "Meridian Electronics support" in result
    mock_streamablehttp_client.assert_called_once() # ✨ 4. Update the assertion
    mock_agent_instance.ainvoke.assert_called_once()


@pytest.mark.asyncio
@patch("graph.mcp_agent.get_chat_history_from_db")
@patch("graph.mcp_agent.streamablehttp_client") # ✨ Update patch name here too
async def test_mcp_agent_connection_failure(mock_streamablehttp_client, mock_get_history):
    """Test that the agent handles an external MCP server connection failure gracefully."""
    mock_get_history.return_value = []
    
    # Simulate a network error during connection
    mock_streamablehttp_client.side_effect = Exception("Connection refused by Meridian Backend")

    result = await run_mcp_agent(
        user_prompt="Hello?",
        thread_id="thread_abc",
        user_id="user_1"
    )

    assert "Error: Could not establish a connection" in result