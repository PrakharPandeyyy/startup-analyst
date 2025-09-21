import json
import logging
import os
import PyPDF2
from gemini_llm import call_gemini_llm

# --- Basic Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Step 1: Pitch Deck Ingestion ---
def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text content from a given PDF file."""
    try:
        with open(pdf_path, 'rb') as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    except FileNotFoundError:
        logger.error(f"File not found at path: {pdf_path}")
        return None
    except Exception as e:
        logger.error(f"Failed to read PDF. Reason: {e}")
        return None

# --- Main Agent Logic ---
def generate_questionnaire(pitch_deck_text: str) -> list:
    """
    Analyzes pitch deck text and generates a tailored questionnaire.
    Returns a list of question objects in the format expected by the backend.
    """
    if not pitch_deck_text:
        logger.error("Pitch deck text is empty.")
        return []

    # The agent's internal "Investor Checklist"
    INVESTOR_CHECKLIST = """
    {
      "The Basics": ["Company Name", "Website", "One-Liner"],
      "Problem & Solution": ["Problem Statement", "Your Solution", "Unique Value Proposition"],
      "Team": ["Founder Names & Roles", "Relevant Experience"],
      "Market Size": ["Total Addressable Market (TAM)", "Serviceable Addressable Market (SAM)", "Source of Market Data"],
      "Traction & Metrics": ["Current Revenue (ARR/MRR)", "Month-over-Month Growth", "Number of Customers", "Key KPIs (e.g., Churn, MAU)"],
      "Business Model": ["How You Make Money", "Pricing Tiers"],
      "Unit Economics": ["Customer Acquisition Cost (CAC)", "Customer Lifetime Value (LTV)", "Gross Margin"],
      "Competition": ["Direct Competitors", "Your Competitive Advantage"],
      "Financials": ["Historical Financial Summary", "3-5 Year Projections", "Current Burn Rate & Runway"],
      "The Ask": ["Funding Amount Requested", "Valuation", "Use of Funds"]
    }
    """
    
    # --- Agent Step 1: Analyze & Extract ---
    logger.info("Step 1: Analyzing pitch deck and extracting key info...")
    prompt_1 = f"""
    You are a VC analyst. Extract key information from the pitch deck text below and populate the Investor Checklist.
    For any information not explicitly mentioned, state "Not Found". Respond with ONLY the populated JSON object.

    [Investor Checklist]
    {INVESTOR_CHECKLIST}
    """
    extracted_data_str = call_gemini_llm(user_prompt=prompt_1, context=pitch_deck_text)

    # --- Agent Step 2: Identify Gaps & Red Flags ---
    logger.info("Step 2: Identifying missing information and potential red flags...")
    prompt_2 = f"""
    You are a skeptical but fair VC analyst. Review the Extracted Data Summary.
    1. Identify crucial topics from the checklist that are marked "Not Found".
    2. Identify potential red flags (e.g., unrealistic claims, inconsistencies, missing metrics).
    List these points as a simple JSON array of strings.

    [Extracted Data Summary]
    {extracted_data_str}
    """
    analysis_topics_str = call_gemini_llm(user_prompt=prompt_2, context="")

    # --- Agent Step 3: Generate Questionnaire ---
    logger.info("Step 3: Generating tailored questionnaire...")
    prompt_3 = f"""
    You are an AI assistant creating a professional questionnaire for a startup founder.
    Based on the provided Analysis Topics, generate a set of 10-15 clear questions.
    
    Format your response as a JSON array of question objects with this structure:
    [
      {{"id": "q1", "text": "What is your total addressable market (TAM)?", "category": "market", "type": "text"}},
      {{"id": "q2", "text": "What is your customer acquisition cost (CAC)?", "category": "unit_economics", "type": "text"}},
      ...
    ]
    
    Use these categories: "market", "unit_economics", "revenue", "competition", "strategy", "team", "product", "financials"
    All questions should have type "text"
    
    Respond with ONLY the JSON array and nothing else.
    """
    
    questionnaire_str = call_gemini_llm(user_prompt=prompt_3, context=analysis_topics_str)
    
    # Parse the questionnaire JSON
    try:
        json_start = questionnaire_str.find('[')
        json_end = questionnaire_str.rfind(']') + 1
        questions = json.loads(questionnaire_str[json_start:json_end])
        return questions
    except (json.JSONDecodeError, IndexError) as e:
        logger.error(f"Failed to parse questionnaire JSON: {e}")
        # Return default questions as fallback
        return [
            {"id": "q1", "text": "What is your total addressable market (TAM)?", "category": "market", "type": "text"},
            {"id": "q2", "text": "What is your customer acquisition cost (CAC)?", "category": "unit_economics", "type": "text"},
            {"id": "q3", "text": "What is your monthly recurring revenue (MRR)?", "category": "revenue", "type": "text"},
            {"id": "q4", "text": "Who are your main competitors?", "category": "competition", "type": "text"},
            {"id": "q5", "text": "What is your go-to-market strategy?", "category": "strategy", "type": "text"}
        ]

# --- Main Execution Block ---
if __name__ == "__main__":
    # 1. Set the path to your PDF file
    pdf_path = "Multipl_Pitch.pdf"  # <-- IMPORTANT: Change this to your actual file path

    # 2. Extract the text from the PDF
    pitch_deck_content = extract_text_from_pdf(pdf_path)

    print("--- Starting AI Questionnaire Agent ---")

    # 3. Check if text was successfully extracted before running the agent
    if pitch_deck_content:
        # Use the 'pitch_deck_content' variable here
        questions = generate_questionnaire(pitch_deck_content)
        print("\n--- Generated Questionnaire ---")
        print(json.dumps(questions, indent=2))
    else:
        print("\nCould not run agent because no content was extracted from the PDF.")
        print("Please check that the file path is correct and the PDF is not empty or an image.")
