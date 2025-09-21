import os
import json
import logging
import google.generativeai as genai
from flask import Flask, request, jsonify
import PyPDF2
import io
import sys
import requests
from urllib.parse import urlparse
import base64

# Add path to import from Startup-Analyst
sys.path.append('/app/Startup-Analyst')
try:
    from config import GEMINI_API_KEY, GEMINI_MODEL_ID
    print(f"Successfully imported config with API key: {GEMINI_API_KEY[:5]}... and model: {GEMINI_MODEL_ID}")
except ImportError:
    print("Could not import from Startup-Analyst/config.py, using environment variables")
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL_ID = os.environ.get("GEMINI_MODEL_ID", "gemini-2.5-pro")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure the Gemini API
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set. Using mock responses.")

# Try to configure Gemini if API key is available
try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info(f"Configured Gemini API with model: {GEMINI_MODEL_ID}")
except Exception as e:
    logger.error(f"Failed to configure Gemini API. Error: {e}")

# Create Flask app
app = Flask(__name__)

# Backend API URL
BACKEND_API_URL = os.environ.get("BACKEND_API_URL", "https://analyst-backend-549120538825.us-central1.run.app")

def call_gemini_llm(prompt: str, context: str = "") -> str:
    """Call Gemini API with the given prompt and context."""
    try:
        if not GEMINI_API_KEY:
            logger.warning("Using mock response because GEMINI_API_KEY is not set")
            return f"Mock response for: {prompt[:50]}..."
        
        # Create a model instance
        model = genai.GenerativeModel(GEMINI_MODEL_ID)
        
        # Generate a response with context if provided
        if context:
            full_prompt = f"""
            You are a helpful VC analyst assistant.
            
            CONTEXT:
            {context}
            
            QUERY:
            {prompt}
            """
            response = model.generate_content(full_prompt)
        else:
            response = model.generate_content(prompt)
        
        # Return the response text
        return response.text
    
    except Exception as e:
        logger.error(f"ERROR: Could not invoke Gemini LLM. Reason: {e}")
        return f"ERROR: Gemini LLM invocation failed. Details: {e}"

def download_pdf_from_url(url):
    """Download a PDF from a URL."""
    try:
        logger.info(f"Downloading PDF from URL (first 100 chars): {url[:100]}...")
        response = requests.get(url)
        logger.info(f"PDF download response status: {response.status_code}")
        response.raise_for_status()
        return response.content
    except Exception as e:
        logger.error(f"Error downloading PDF from {url[:100]}...: {e}")
        return None

def extract_text_from_pdf(pdf_content):
    """Extract text from PDF content."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""

def search_deal_notes(query):
    """Search deal notes using the RAG endpoint."""
    try:
        url = f"{BACKEND_API_URL}/v1/rag/search"
        headers = {
            "Content-Type": "application/json",
            "x-debug-role": "investor"
        }
        payload = {
            "query": query
        }
        
        logger.info(f"Calling RAG endpoint at {url} with query: {query}")
        logger.info(f"Headers: {headers}")
        logger.info(f"Payload: {payload}")
        
        response = requests.post(url, headers=headers, json=payload)
        logger.info(f"RAG endpoint response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            num_results = len(result.get('results', []))
            logger.info(f"RAG endpoint returned {num_results} results")
            
            # Debug the response
            if num_results > 0:
                logger.info(f"First result company: {result.get('results', [])[0].get('company', {}).get('name', 'Unknown')}")
                # Print the first 200 characters of the response
                logger.info(f"Response preview: {str(result)[:200]}...")
                return result
            else:
                logger.info("No results returned from RAG endpoint")
                logger.info(f"Full response: {result}")
                return result
        else:
            logger.error(f"RAG endpoint returned error: {response.status_code} - {response.text}")
            return {"results": []}
    except Exception as e:
        logger.error(f"Error searching deal notes: {e}")
        return {"results": []}

def get_pitch_deck_download_url(pitch_deck_id):
    """Get a signed URL to download a pitch deck."""
    try:
        url = f"{BACKEND_API_URL}/v1/files/pitch-deck/{pitch_deck_id}/download-url"
        headers = {
            "Content-Type": "application/json",
            "x-debug-role": "startup"
        }
        
        logger.info(f"Fetching signed URL from: {url}")
        response = requests.get(url, headers=headers)
        logger.info(f"Download URL response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            download_url = data.get("downloadUrl")
            logger.info(f"Got download URL (first 100 chars): {download_url[:100]}...")
            return download_url
        else:
            logger.error(f"Failed to get download URL: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error getting pitch deck download URL: {e}")
        return None

def get_all_deal_notes():
    """Get all deal notes from the backend."""
    try:
        url = f"{BACKEND_API_URL}/v1/deal-notes"
        headers = {
            "Content-Type": "application/json",
            "x-debug-role": "investor"
        }
        
        logger.info(f"Fetching all deal notes from {url}")
        
        response = requests.get(url, headers=headers)
        logger.info(f"Deal notes response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            num_results = len(result.get('dealNotes', []))
            logger.info(f"Got {num_results} deal notes")
            
            if num_results > 0:
                logger.info(f"First deal note company: {result.get('dealNotes', [])[0].get('dealNote', {}).get('company', 'Unknown')}")
            else:
                logger.info("No deal notes found")
                
            return result.get('dealNotes', [])
        else:
            logger.error(f"Failed to get deal notes: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error getting deal notes: {e}")
        return []

@app.route('/api/generate-questionnaire', methods=['POST'])
def generate_questionnaire():
    try:
        data = request.json
        startup_id = data.get('startupId')
        pitch_deck_gcs_uri = data.get('pitchDeckGcsUri')
        pitch_deck_id = data.get('pitchDeckId')
        
        logger.info(f"Generating questionnaire for startup {startup_id} with pitch deck {pitch_deck_id}")
        
        pitch_deck_text = ""
        
        # Try to get the pitch deck content
        if pitch_deck_id:
            # Get download URL
            logger.info(f"Getting download URL for pitch deck {pitch_deck_id}")
            download_url = get_pitch_deck_download_url(pitch_deck_id)
            if download_url:
                # Download the PDF
                logger.info("Got download URL, downloading PDF")
                pdf_content = download_pdf_from_url(download_url)
                if pdf_content:
                    # Extract text from PDF
                    logger.info("Downloaded PDF, extracting text")
                    full_text = extract_text_from_pdf(pdf_content)
                    logger.info(f"Successfully extracted {len(full_text)} characters from pitch deck")
                    
                    # Limit the size of the pitch deck text to avoid memory issues
                    # Take first 1000 chars and last 1000 chars to get key info
                    if len(full_text) > 2000:
                        logger.info(f"Limiting pitch deck text to 2000 characters (was {len(full_text)})")
                        pitch_deck_text = full_text[:1000] + "\n...\n" + full_text[-1000:]
                    else:
                        pitch_deck_text = full_text
                    
                    logger.info(f"First 100 chars of pitch deck text: {pitch_deck_text[:100]}...")
                else:
                    logger.error("Failed to download PDF")
            else:
                logger.error("Failed to get download URL")
        else:
            logger.warning("No pitch deck ID provided")
        
        # If we have pitch deck text, use it to generate questions
        if pitch_deck_text:
            logger.info("Generating questions from pitch deck text")
            prompt = f"""
            Generate 5 specific questions for a VC to ask this startup based on their pitch deck:
            
            {pitch_deck_text}
            
            Return ONLY a JSON array with this structure:
            [
                {{"id": "q1", "text": "Question text", "category": "market", "type": "text"}},
                {{"id": "q2", "text": "Question text", "category": "unit_economics", "type": "text"}},
                {{"id": "q3", "text": "Question text", "category": "revenue", "type": "text"}},
                {{"id": "q4", "text": "Question text", "category": "competition", "type": "text"}},
                {{"id": "q5", "text": "Question text", "category": "strategy", "type": "text"}}
            ]
            """
            
            logger.info("Calling LLM to generate questions")
            response = call_gemini_llm(prompt)
            logger.info(f"LLM response (first 200 chars): {response[:200]}...")
            
            # Try to extract JSON from the response
            try:
                # Find JSON array in the response
                start_idx = response.find('[')
                end_idx = response.rfind(']') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    questions_json = response[start_idx:end_idx]
                    logger.info(f"Extracted JSON (first 200 chars): {questions_json[:200]}...")
                    questions = json.loads(questions_json)
                    logger.info(f"Generated {len(questions)} questions from pitch deck")
                    
                    # Ensure we have 5 questions with the right structure
                    if len(questions) >= 5:
                        questions = questions[:5]  # Limit to 5 questions
                        for i, q in enumerate(questions):
                            if 'id' not in q:
                                q['id'] = f"q{i+1}"
                            if 'type' not in q:
                                q['type'] = "text"
                            if 'category' not in q:
                                q['category'] = "market"
                        
                        return jsonify({
                            'questions': questions,
                            'status': 'completed',
                            'startupId': startup_id
                        })
                else:
                    logger.error(f"Could not find JSON array in LLM response")
            except Exception as e:
                logger.error(f"Error parsing questions JSON: {e}")
        
        # Fallback to default questions if anything fails
        logger.info("Using default questions")
        questions = [
            {"id": "q1", "text": "What is your total addressable market (TAM)?", "category": "market", "type": "text"},
            {"id": "q2", "text": "What is your customer acquisition cost (CAC)?", "category": "unit_economics", "type": "text"},
            {"id": "q3", "text": "What is your monthly recurring revenue (MRR)?", "category": "revenue", "type": "text"},
            {"id": "q4", "text": "Who are your main competitors?", "category": "competition", "type": "text"},
            {"id": "q5", "text": "What is your go-to-market strategy?", "category": "strategy", "type": "text"}
        ]
        
        return jsonify({
            'questions': questions,
            'status': 'completed',
            'startupId': startup_id
        })
        
    except Exception as e:
        logger.error(f"Error in generate_questionnaire: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/screener', methods=['POST'])
def deal_screener():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        
        logger.info(f"Deal screener received message: {message}")
        
        # Get all deal notes instead of using RAG
        deal_notes = get_all_deal_notes()
        logger.info(f"Retrieved {len(deal_notes)} deal notes for processing")
        
        # Format the deal notes as context for the LLM
        context = ""
        if deal_notes:
            context = "Here are all the startups in our database:\n\n"
            for idx, deal_note in enumerate(deal_notes):
                try:
                    # Extract essential information
                    company_name = deal_note.get('dealNote', {}).get('company', 'Unknown Company')
                    description = deal_note.get('dealNote', {}).get('description', 'No description available')
                    score = deal_note.get('dealNote', {}).get('score', {}).get('total', 'N/A')
                    
                    context += f"{idx+1}. {company_name} (Score: {score})\n"
                    if description:
                        context += f"   Description: {description[:200]}...\n"
                    
                    # Add key metrics if available
                    facts = deal_note.get('dealNote', {}).get('facts', {})
                    if facts:
                        traction = facts.get('traction', {})
                        if isinstance(traction, dict) and "revenue" in traction:
                            revenue = traction["revenue"]
                            if isinstance(revenue, dict):
                                y1_rev = revenue.get("Y1", "N/A")
                                y5_rev = revenue.get("Y5", "N/A")
                                context += f"   Revenue: Y1: {y1_rev}, Y5: {y5_rev}\n"
                    
                    context += "\n"
                except Exception as e:
                    logger.error(f"Error processing deal note {idx}: {e}")
                    continue
        else:
            context = "No startups found in our database."
        
        logger.info(f"Context for LLM (first 200 chars): {context[:200]}...")
        
        # Call LLM with the deal notes as context
        prompt = f"""You are a helpful VC analyst assistant. The investor is asking about startups: "{message}"
        
Based on the context provided about our startups, provide a concise and relevant response.
If the query mentions specific criteria (like sector, revenue range, etc.), filter the startups accordingly.
If no startups match the criteria, clearly state that no matching startups were found.
"""
        logger.info(f"Calling LLM with prompt about: {message}")
        response = call_gemini_llm(prompt, context)
        logger.info(f"LLM response (first 200 chars): {response[:200]}...")
        
        return jsonify({
            'reply': response,
            'status': 'completed',
            'sessionId': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in deal_screener: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        deal_note_id = data.get('dealNoteId')
        
        logger.info(f"Deep dive received message: {message}")
        
        context = ""
        
        # If deal note ID is provided, try to get the deal note
        if deal_note_id:
            logger.info(f"Getting deal note with ID: {deal_note_id}")
            try:
                url = f"{BACKEND_API_URL}/v1/startups/deal-notes/{deal_note_id}"
                headers = {
                    "Content-Type": "application/json",
                    "x-debug-role": "investor"
                }
                
                response = requests.get(url, headers=headers)
                logger.info(f"Deal note response status: {response.status_code}")
                
                if response.status_code == 200:
                    deal_note = response.json()
                    if deal_note and "dealNote" in deal_note:
                        company_name = deal_note['dealNote'].get('company', 'Unknown Company')
                        logger.info(f"Found deal note for company: {company_name}")
                        context = f"Deal Note for {company_name}:\n"
                        context += json.dumps(deal_note["dealNote"], indent=2)
                else:
                    logger.error(f"Failed to get deal note: {response.status_code} - {response.text}")
            except Exception as e:
                logger.error(f"Error fetching deal note {deal_note_id}: {e}")
        
        # If no context was set, provide a message
        if not context:
            context = "No deal note found with the provided ID."
            
        logger.info(f"Context for LLM (first 200 chars): {context[:200]}...")
        
        # Call LLM with the deal note as context
        prompt = f"You are a helpful VC analyst assistant doing a deep dive on a startup. Answer this investor query: {message}"
        logger.info(f"Calling LLM with prompt: {prompt}")
        response = call_gemini_llm(prompt, context)
        logger.info(f"LLM response (first 200 chars): {response[:200]}...")
        
        return jsonify({
            'reply': response,
            'status': 'completed',
            'sessionId': session_id
        })
        
    except Exception as e:
        logger.error(f"Error in deep_dive: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/full-analysis', methods=['POST'])
def full_analysis():
    try:
        data = request.json
        startup_id = data.get('startupId')
        pitch_deck_gcs_uri = data.get('pitchDeckGcsUri')
        pitch_deck_id = data.get('pitchDeckId')
        questionnaire_answers = data.get('questionnaireAnswers', {})
        
        pitch_deck_text = ""
        
        # Try to get the pitch deck content
        if pitch_deck_id:
            # Get download URL
            download_url = get_pitch_deck_download_url(pitch_deck_id)
            if download_url:
                # Download the PDF
                pdf_content = download_pdf_from_url(download_url)
                if pdf_content:
                    # Extract text from PDF
                    pitch_deck_text = extract_text_from_pdf(pdf_content)
                    logger.info(f"Successfully extracted {len(pitch_deck_text)} characters from pitch deck")
        
        # Prepare context for analysis
        context = ""
        if pitch_deck_text:
            context += f"PITCH DECK CONTENT:\n{pitch_deck_text}\n\n"
        
        if questionnaire_answers:
            context += "QUESTIONNAIRE ANSWERS:\n"
            for question_id, answer in questionnaire_answers.items():
                context += f"Q: {answer.get('question', 'Unknown question')}\n"
                context += f"A: {answer.get('answer', 'No answer provided')}\n\n"
        
        # For now, generate a mock deal note
        # In a real implementation, you would use the context to generate a real deal note
        note = {
            'id': f'note_{startup_id}',
            'company': startup_id,
            'score': {'total': 7.5},
            'facts': {
                'founders': [],
                'traction': {
                    'revenue': {'Y1': 1.2, 'Y5': 25},
                    'gross_profit': {'Y1': 0.8, 'Y5': 18}
                }
            },
            'verification': {'checks': []},
            'benchmarks': {'peers': []},
            'risks': [],
            'term_sheet': {'clauses': []},
            'sector': {'kpis': []}
        }
        
        return jsonify({
            'noteId': note['id'],
            'note': note,
            'status': 'completed',
            'startupId': startup_id
        })
        
    except Exception as e:
        logger.error(f"Error in full_analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'service': 'gemini-agent-server',
        'model': GEMINI_MODEL_ID,
        'api_key_configured': bool(GEMINI_API_KEY)
    })

@app.route('/api/test-rag', methods=['GET'])
def test_rag():
    """Test endpoint to call the RAG endpoint directly."""
    try:
        url = f"{BACKEND_API_URL}/v1/rag/search"
        headers = {
            "Content-Type": "application/json",
            "x-debug-role": "investor"
        }
        payload = {
            "query": "Hexafun"
        }
        
        logger.info(f"Test RAG: Calling RAG endpoint at {url} with query: Hexafun")
        logger.info(f"Test RAG: Headers: {headers}")
        logger.info(f"Test RAG: Payload: {payload}")
        
        response = requests.post(url, headers=headers, json=payload)
        logger.info(f"Test RAG: RAG endpoint response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            num_results = len(result.get('results', []))
            logger.info(f"Test RAG: RAG endpoint returned {num_results} results")
            
            # Debug the response
            if num_results > 0:
                logger.info(f"Test RAG: First result company: {result.get('results', [])[0].get('dealNote', {}).get('dealNote', {}).get('company', 'Unknown')}")
                # Print the first 200 characters of the response
                logger.info(f"Test RAG: Response preview: {str(result)[:200]}...")
            else:
                logger.info("Test RAG: No results returned from RAG endpoint")
                logger.info(f"Test RAG: Full response: {result}")
            
            return jsonify(result)
        else:
            logger.error(f"Test RAG: RAG endpoint returned error: {response.status_code} - {response.text}")
            return jsonify({"error": f"RAG endpoint returned error: {response.status_code}"}), 500
    except Exception as e:
        logger.error(f"Test RAG: Error searching deal notes: {e}")
        return jsonify({"error": f"Error searching deal notes: {e}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
