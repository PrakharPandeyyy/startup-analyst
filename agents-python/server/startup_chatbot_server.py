from flask import Flask, request, jsonify
import json
import sys
import os
from google.cloud import storage
import PyPDF2
import io

# Add the Startup-Chatbot directory to Python path
sys.path.insert(0, '/app/Startup-Chatbot')

try:
    from questionnaire_agent import generate_questionnaire
    from deal_screener_bot import run_deal_screener_chatbot
    from deep_dive_bot import run_deep_dive_chatbot
except ImportError as e:
    print(f"Warning: Could not import chatbot modules: {e}")
    # Mock implementations
    def generate_questionnaire(pitch_deck_content):
        return [
            {"id": "q1", "text": "What is your total addressable market (TAM)?", "category": "market", "type": "text"},
            {"id": "q2", "text": "What is your customer acquisition cost (CAC)?", "category": "unit_economics", "type": "text"},
            {"id": "q3", "text": "What is your monthly recurring revenue (MRR)?", "category": "revenue", "type": "text"},
            {"id": "q4", "text": "Who are your main competitors?", "category": "competition", "type": "text"},
            {"id": "q5", "text": "What is your go-to-market strategy?", "category": "strategy", "type": "text"}
        ]
    
    def run_deal_screener_chatbot(message, deal_notes):
        return f"Mock deal screener response for: {message}"
    
    def run_deep_dive_chatbot(message, deal_note):
        return f"Mock deep dive response for: {message}"

app = Flask(__name__)

def download_from_gcs(gcs_uri):
    """Download file from Google Cloud Storage"""
    try:
        if not gcs_uri.startswith('gs://'):
            raise ValueError("Invalid GCS URI")
        
        # Parse GCS URI
        bucket_name, file_path = gcs_uri[5:].split('/', 1)
        
        # Download file
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # Download to memory
        file_content = blob.download_as_bytes()
        
        return file_content
    except Exception as e:
        print(f"Error downloading from GCS: {e}")
        return None

def extract_text_from_pdf(pdf_content):
    """Extract text from PDF content"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

@app.route('/api/generate-questionnaire', methods=['POST'])
def generate_questionnaire_endpoint():
    try:
        data = request.json
        startup_id = data.get('startupId')
        pitch_deck_gcs_uri = data.get('pitchDeckGcsUri')
        
        if not startup_id or not pitch_deck_gcs_uri:
            return jsonify({'error': 'startupId and pitchDeckGcsUri are required'}), 400
        
        print(f"Generating questionnaire for startup {startup_id} with pitch deck {pitch_deck_gcs_uri}")
        
        # Download pitch deck from GCS
        pitch_deck_content = download_from_gcs(pitch_deck_gcs_uri)
        if not pitch_deck_content:
            return jsonify({'error': 'Failed to download pitch deck'}), 500
        
        # Extract text from PDF
        pitch_deck_text = extract_text_from_pdf(pitch_deck_content)
        if not pitch_deck_text:
            return jsonify({'error': 'Failed to extract text from pitch deck'}), 500
        
        # Generate questionnaire using real agent
        questions = generate_questionnaire(pitch_deck_text)
        
        return jsonify({
            'questions': questions,
            'status': 'completed',
            'startupId': startup_id
        })
        
    except Exception as e:
        print(f"Error in generate_questionnaire_endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/deal-screener', methods=['POST'])
def deal_screener():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        
        if not message or not session_id:
            return jsonify({'error': 'message and sessionId are required'}), 400
        
        print(f"Processing deal screener message for session {session_id}: {message}")
        
        # TODO: Get all deal notes for RAG
        deal_notes = []  # This will be implemented later
        
        # Run deal screener with RAG
        response = run_deal_screener_chatbot(message, deal_notes)
        
        return jsonify({
            'reply': response,
            'status': 'completed',
            'sessionId': session_id
        })
        
    except Exception as e:
        print(f"Error in deal_screener: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/deep-dive', methods=['POST'])
def deep_dive():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        deal_note_id = data.get('dealNoteId')
        
        if not message or not session_id:
            return jsonify({'error': 'message and sessionId are required'}), 400
        
        print(f"Processing deep dive message for session {session_id}: {message}")
        
        # TODO: Get specific deal note
        deal_note = {}  # This will be implemented later
        
        # Run deep dive with specific deal note
        response = run_deep_dive_chatbot(message, deal_note)
        
        return jsonify({
            'reply': response,
            'status': 'completed',
            'sessionId': session_id
        })
        
    except Exception as e:
        print(f"Error in deep_dive: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'startup-chatbot-server'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
