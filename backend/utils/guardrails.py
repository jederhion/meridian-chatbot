import re
import logging
from prompts import FORBIDDEN_OUTPUT_PHRASES

logger = logging.getLogger("MCP_Bootcamp_Engine")

# --- INPUT GUARDRAILS ---
def check_for_prompt_injection(user_prompt: str) -> None:
    """
    Scans the user's input for common prompt injection attacks.
    Raises a ValueError if malicious intent is detected.
    """
    suspicious_patterns = [
        r"(?i)ignore (all )?previous instructions",
        r"(?i)system prompt",
        r"(?i)you are now",
        r"(?i)bypass guardrails"
    ]
    for pattern in suspicious_patterns:
        if re.search(pattern, user_prompt):
            logger.warning(f"SECURITY ALERT: Prompt injection attempt blocked: {user_prompt}")
            raise ValueError("Message contains prohibited system-level directives.")

# --- OUTPUT GUARDRAILS ---
def apply_output_guardrails(llm_response: str) -> str:
    """
    Scans the LLM's final output for sensitive data leakage or forbidden content.
    Returns the original string if safe, or a redacted string if a violation is found.
    """
    # 1. Prevent API Key Leakage
    api_key_pattern = r"(sk-[A-Za-z0-9_-]{20,}|lsv2_pt_[A-Za-z0-9_-]+)"
    if re.search(api_key_pattern, llm_response):
        logger.error("SECURITY ALERT: LLM attempted to leak an API key in the output.")
        return "⚠️ [SYSTEM REDACTED]: The response contained sensitive system credentials and was blocked."

    # 2. Prevent System Prompt Leakage
    for phrase in FORBIDDEN_OUTPUT_PHRASES:
        if phrase.lower() in llm_response.lower():
            logger.error("SECURITY ALERT: LLM attempted to leak internal system prompts.")
            return "⚠️ [SYSTEM REDACTED]: The response attempted to expose internal system configurations."

    return llm_response