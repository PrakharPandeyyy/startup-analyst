import os
import json
import logging
import google.generativeai as genai
import sys
import os

# Add path to import from Startup-Analyst
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Startup-Analyst'))
from config import GEMINI_API_KEY, GEMINI_MODEL_ID

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define the model
GEMINI_MODEL = GEMINI_MODEL_ID

# Configure the Gemini API
try:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info(f"Configured Gemini API with model: {GEMINI_MODEL}")
except Exception as e:
    logger.error(f"Failed to configure Gemini API. Error: {e}")

# Define the prompt template
SUPERVISOR_PROMPT_TEMPLATE = """You are an expert VC analyst assistant.
Use the provided context to complete the task.

[CONTEXT]
{context}

[TASK]
{user_prompt}
"""

def call_gemini_llm(user_prompt: str, context: str = "") -> str:
    """
    Call the Gemini API with the given prompt and context.
    
    Args:
        user_prompt: The user's prompt/question
        context: Optional context to include in the prompt
        
    Returns:
        The model's response as a string
    """
    try:
        # Format the prompt
        prompt = SUPERVISOR_PROMPT_TEMPLATE.format(
            context=context,
            user_prompt=user_prompt
        )
        
        # Create a model instance
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Generate a response
        response = model.generate_content(prompt)
        
        # Return the response text
        return response.text
    
    except Exception as e:
        logger.error(f"ERROR: Could not invoke Gemini LLM. Reason: {e}")
        return f"ERROR: Gemini LLM invocation failed. Details: {e}"

# For testing
if __name__ == "__main__":
    test_prompt = "What are the key metrics VCs look for in SaaS startups?"
    response = call_gemini_llm(test_prompt)
    print(f"Response: {response}")
