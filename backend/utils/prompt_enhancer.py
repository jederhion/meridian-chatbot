from langchain_openai import ChatOpenAI
from config import LLM_MODEL_NAME

async def enhance_user_query(raw_query: str, chat_history: str = "", api_key: str = None) -> str:
    """
    Refines a user's chat message to make it clearer and more context-rich for the agent,
    using recent chat history to resolve pronouns or implied context.
    """
    llm = ChatOpenAI(model=LLM_MODEL_NAME, temperature=0.3, api_key=api_key)
    
    meta_prompt = f"""You are an intent refinement assistant.
A user has sent the following message to an AI agent:
<message>
{raw_query}
</message>

Recent conversation context (if any):
<context>
{chat_history}
</context>

Rewrite the user's message to be as clear, descriptive, and actionable as possible for an AI to process. 
If the message uses pronouns (like "it", "he", "this") or implied context, use the conversation context to explicitly state what they refer to.
Fix any typos, clarify vague terms, and format it logically.
Output ONLY the rewritten message, nothing else. If the message is already perfectly clear, output it exactly as is.
"""
    
    response = await llm.ainvoke(meta_prompt)
    return response.content