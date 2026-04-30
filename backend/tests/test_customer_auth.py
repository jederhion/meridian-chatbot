import pytest
from unittest.mock import AsyncMock, patch
from graph.mcp_agent import run_mcp_agent

# Test Data provided
CUSTOMER_TEST_DATA = [
    {"email": "donaldgarcia@example.net", "pin": "7912"},
    {"email": "michellejames@example.com", "pin": "1520"},
    {"email": "laurahenderson@example.org", "pin": "1488"},
    {"email": "spenceamanda@example.org", "pin": "2535"},
    {"email": "glee@example.net", "pin": "4582"},
    {"email": "williamsthomas@example.net", "pin": "4811"},
    {"email": "justin78@example.net", "pin": "9279"},
    {"email": "jason31@example.com", "pin": "1434"},
    {"email": "samuel81@example.com", "pin": "4257"},
    {"email": "williamleon@example.net", "pin": "9928"}
]

@pytest.mark.asyncio
@pytest.mark.parametrize("customer", CUSTOMER_TEST_DATA)
@patch("graph.mcp_agent.get_chat_history_from_db")
@patch("graph.mcp_agent.streamablehttp_client")
@patch("graph.mcp_agent.ClientSession")
@patch("graph.mcp_agent.load_mcp_tools")
@patch("graph.mcp_agent.create_react_agent")
async def test_customer_pin_verification(
    mock_create_react_agent,
    mock_load_tools,
    mock_client_session,
    mock_streamablehttp_client,
    mock_get_history,
    customer
):
    """
    Verify that the agent correctly identifies and processes 
    specific customer emails and PINs.
    """
    # 1. Setup Mocks
    mock_get_history.return_value = []
    mock_load_tools.return_value = []
    
    # Mock HTTP Transport (streamablehttp_client returns a 3-tuple: read_stream, write_stream, _)
    mock_http_transport = (AsyncMock(), AsyncMock(), AsyncMock()) 
    mock_streamablehttp_client.return_value.__aenter__.return_value = mock_http_transport
    
    # Mock MCP Session
    mock_session_instance = AsyncMock()
    mock_client_session.return_value.__aenter__.return_value = mock_session_instance
    
    # Mocking the Agent response to simulate a successful lookup/verification
    mock_agent_instance = AsyncMock()
    mock_message = AsyncMock()
    mock_message.content = f"Verification successful for {customer['email']}."