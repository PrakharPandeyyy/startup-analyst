from flask import Flask, request, jsonify
import json
import sys
import os
from google.cloud import storage
import PyPDF2
import io

# Add the Startup-Analyst directory to Python path
sys.path.insert(0, '/app/Startup-Analyst')

try:
    from orchestration.orchestrator import Orchestrator
except ImportError as e:
    print(f"Warning: Could not import orchestrator: {e}")
    # Mock implementation
    class Orchestrator:
        def __init__(self, sector="saas"):
            self.sector = sector
        
        def run(self, company, inputs):
            return {
                'id': f'mock_note_{company}',
                'company': company,
                'score': {'total': 7.5},
                'facts': {'founders': [], 'traction': {}},
                'verification': {'checks': []},
                'benchmarks': {'peers': []},
                'risks': [],
                'term_sheet': {'clauses': []},
                'sector': {'kpis': []}
            }

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

@app.route('/api/full-analysis', methods=['POST'])
def run_full_analysis():
    try:
        data = request.json
        startup_id = data.get('startupId')
        pitch_deck_gcs_uri = data.get('pitchDeckGcsUri')
        questionnaire_answers = data.get('questionnaireAnswers', {})
        
        if not startup_id or not pitch_deck_gcs_uri:
            return jsonify({'error': 'startupId and pitchDeckGcsUri are required'}), 400
        
        print(f"Running full analysis for startup {startup_id}")
        
        # Download pitch deck from GCS
        pitch_deck_content = download_from_gcs(pitch_deck_gcs_uri)
        if not pitch_deck_content:
            return jsonify({'error': 'Failed to download pitch deck'}), 500
        
        # Extract text from PDF
        pitch_deck_text = extract_text_from_pdf(pitch_deck_content)
        if not pitch_deck_text:
            return jsonify({'error': 'Failed to extract text from pitch deck'}), 500
        
        # Prepare inputs for orchestrator
        inputs = [pitch_deck_text]
        
        # Add questionnaire answers as context
        if questionnaire_answers:
            inputs.append(json.dumps(questionnaire_answers))
        
        # Run full analysis using orchestrator
        orchestrator = Orchestrator(sector="saas")
        note = orchestrator.run(startup_id, inputs)
        
        return jsonify({
            'noteId': note.get('id', f'note_{startup_id}'),
            'note': note,
            'status': 'completed',
            'startupId': startup_id
        })
        
    except Exception as e:
        print(f"Error in run_full_analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ingestion', methods=['POST'])
def run_ingestion():
    try:
        data = request.json
        startup_id = data.get('startupId')
        gcs_uri = data.get('gcsUri')
        
        if not startup_id or not gcs_uri:
            return jsonify({'error': 'startupId and gcsUri are required'}), 400
        
        print(f"Running ingestion for startup {startup_id}")
        
        # Download file from GCS
        file_content = download_from_gcs(gcs_uri)
        if not file_content:
            return jsonify({'error': 'Failed to download file'}), 500
        
        # Extract text from PDF
        file_text = extract_text_from_pdf(file_content)
        if not file_text:
            return jsonify({'error': 'Failed to extract text from file'}), 500
        
        # Run ingestion using orchestrator
        orchestrator = Orchestrator(sector="saas")
        note = orchestrator.run(startup_id, [file_text])
        
        return jsonify({
            'noteId': note.get('id', f'note_{startup_id}'),
            'note': note,
            'status': 'completed',
            'startupId': startup_id
        })
        
    except Exception as e:
        print(f"Error in run_ingestion: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'startup-analyst-server'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
