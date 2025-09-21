import json
import logging
import os
import glob
from gemini_llm import call_gemini_llm

# --- Basic Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Data Loading ---
def load_deal_notes(path: str = "notes") -> list:
    deal_notes = []
    json_files = glob.glob(os.path.join(path, '*.json'))
    if not json_files:
        logger.warning(f"No JSON files found in the '{path}' directory.")
        return []
    for file_path in json_files:
        try:
            with open(file_path, 'r') as f:
                deal_notes.append(json.load(f))
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Failed to load or parse {file_path}. Error: {e}")
    return deal_notes

# --- Chatbot Core Logic ---
def run_deep_dive_chatbot(user_question: str, company_name: str, all_deals: list):
    """
    Answers deep-dive questions about a specific company using its deal note as context.
    """
    logger.info(f"Deep Dive on {company_name} - Question: '{user_question}'")
    
    # 1. Retrieve the correct deal note
    target_deal_note = None
    for deal in all_deals:
        if deal.get('company', '').lower() == company_name.lower():
            target_deal_note = deal
            break
            
    if not target_deal_note:
        return f"Sorry, I could not find a deal note for '{company_name}'."
        
    # 2. Augment the prompt with the full deal note as context
    context = json.dumps(target_deal_note, indent=2)
    
    # 3. Generate the answer with a strict prompt to prevent hallucination
    qa_prompt = f"""
    You are a meticulous VC analyst assistant. Your task is to answer the user's question based *strictly* and *only* on the provided context (the company's deal note).
    - If the answer is in the context, provide it clearly and concisely. You can quote specific numbers or facts.
    - If the information is not present in the context, you MUST respond with: "This information is not available in the provided deal note."
    - Do not use any external knowledge or make assumptions.
    
    User's Question: "{user_question}"
    """
    
    answer = call_gemini_llm(user_prompt=qa_prompt, context=context)
    return answer

# --- Main Execution Block ---
if __name__ == "__main__":
    all_deal_notes = load_deal_notes()
    if all_deal_notes:
        # Example 1: A question where the answer is clearly in the Hexafun JSON
        print(run_deep_dive_chatbot("What is the vesting period for founders at Hexafun?", "Hexafun", all_deal_notes))
        
        print("\n" + "="*50)
        
        # Example 2: A question about a founder from the Naario JSON
        print(run_deep_dive_chatbot("Tell me about Anamika Pandey's background", "Naario", all_deal_notes))
        
        print("\n" + "="*50)

        # Example 3: A question where the answer is NOT in the JSON, to test the "I don't know" response
        print(run_deep_dive_chatbot("What is Naario's month-over-month revenue growth?", "Naario", all_deal_notes))
