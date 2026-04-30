# backend/graph/mcp_agent.py
import asyncio
from datetime import datetime
from contextlib import AsyncExitStack

from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from mcp import ClientSession
# Use sse_client for Streamable HTTP transport
from mcp.client.streamable_http import streamablehttp_client
from langchain_mcp_adapters.tools import load_mcp_tools

# Update imports to use the new config variable
from config import LLM_MODEL_NAME, LLM_TEMPERATURE, MCP_SERVER_URL, OPENAI_API_KEY
from api.crud.chat import get_chat_history_from_db, increment_token_usage
from utils.prompt_enhancer import enhance_user_query

from prompts import get_full_system_context
from utils.guardrails import apply_output_guardrails

memory = MemorySaver()

async def run_mcp_agent(user_prompt: str, thread_id: str, user_id: str) -> str:
    """
    Connects to a remote MCP server via SSE (HTTP), loads tools dynamically, 
    and executes the LangGraph agent to resolve the user's prompt.
    """
    
    # 1. Fetch History & Enhance Prompt
    raw_history = get_chat_history_from_db(thread_id, user_id)
    recent_messages = [f"{msg['role'].capitalize()}: {msg['content']}" for msg in raw_history[-4:]]
    formatted_history = "\n".join(recent_messages) if recent_messages else "No prior history."

    refined_user_prompt = await enhance_user_query(
        raw_query=user_prompt, 
        chat_history=formatted_history, 
        api_key=OPENAI_API_KEY
    )

    # 2. Instantiate LLM
    llm = ChatOpenAI(
        model=LLM_MODEL_NAME, 
        temperature=LLM_TEMPERATURE, 
        api_key=OPENAI_API_KEY,
        max_retries=3 
    )

    system_context = get_full_system_context(datetime.now().strftime('%B %d, %Y'))
    config = {
        "configurable": {"thread_id": thread_id},
        "recursion_limit": 5 # Maximum steps the agent can take before being forced to stop
    }

    # 3. Connect to Remote MCP Server via SSE using AsyncExitStack
    async with AsyncExitStack() as stack:
        print(f"🔌 Connecting to remote MCP server via SSE: {MCP_SERVER_URL}")
        
        try:
            # Open SSE transport (HTTP) using the target URL
            http_transport = await stack.enter_async_context(streamablehttp_client(MCP_SERVER_URL))
            read_stream, write_stream, _ = http_transport  # streamablehttp returns 3-tuple

            session = await stack.enter_async_context(ClientSession(read_stream, write_stream))
            await session.initialize()
            
            # Load tools exposed by the MCP server into LangChain compatible format
            mcp_tools = await load_mcp_tools(session)
            print(f"🛠️ Successfully loaded {len(mcp_tools)} tools from MCP server.")
            
        except Exception as e:
            print(f"⚠️ Failed to connect to remote MCP server: {e}")
            return "Error: Could not establish a connection to the Meridian Electronics systems."

        # 4. Create and run the React Agent
        agent = create_react_agent(
            model=llm, 
            tools=mcp_tools, 
            prompt=system_context, 
            checkpointer=memory
        )
        
        try:
            # 60 second execution timeout guard
            result = await asyncio.wait_for(
                agent.ainvoke({"messages": [("user", refined_user_prompt)]}, config=config),
                timeout=60.0
            )
            final_message = result["messages"][-1]
            
            # Log usage if available
            if hasattr(final_message, 'usage_metadata') and final_message.usage_metadata:
                total_tokens = final_message.usage_metadata.get('total_tokens', 0)
                if total_tokens > 0:
                    increment_token_usage(user_id, total_tokens)
                    
            raw_output = final_message.content
            safe_output = apply_output_guardrails(raw_output)
            
            return safe_output

        except asyncio.TimeoutError:
            return "Execution timed out while communicating with the inventory/order tools."
        except Exception as e:
            print(f"❌ Error invoking agent: {e}")
            return "An internal error occurred while processing the request."