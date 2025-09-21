#!/usr/bin/env python3
"""
HTTP server wrapper for Startup-Chatbot agents.
"""

import os
import sys
import json
import logging
import glob
import io
from flask import Flask, request, jsonify

# Add Startup-Chatbot directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Startup-Chatbot')))

try:
    from google.cloud import storage
    # Import the chatbot modules
    from deal_screener_bot import load_deal_notes, run_deal_screener_chatbot
    from deep_dive_bot import run_deep_dive_chatbot
    from questionnaire_agent import extract_text_from_pdf, generate_questionnaire
except ImportError as e:
    print(f"Error importing dependencies: {e}")
    print("Make sure you have installed all required packages and the Startup-Chatbot directory is in your Python path.")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize GCS client
storage_client = None
try:
    storage_client = storage.Client()
except Exception as e:
    logger.warning(f"Failed to initialize GCS client: {e}")
    logger.warning("GCS operations will be simulated.")

# Load deal notes on startup
all_deals = []
try:
    notes_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'Startup-Chatbot', 'notes')
    all_deals = load_deal_notes(notes_dir)
    logger.info(f"Loaded {len(all_deals)} deal notes")
except Exception as e:
    logger.error(f"Failed to load deal notes: {e}")

def download_from_gcs(gcs_uri):
    """Download a file from GCS to a local temp file."""
    try:
        # Parse the GCS URI (format: gs://bucket-name/path/to/file)
        if not gcs_uri.startswith('gs://'):
            raise ValueError(f"Invalid GCS URI: {gcs_uri}")
        
        bucket_name = gcs_uri.split('/')[2]
        blob_path = '/'.join(gcs_uri.split('/')[3:])
        
        # Create a temporary file
        import tempfile
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        if storage_client:
            # Download the file
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob(blob_path)
            blob.download_to_filename(temp_path)
            logger.info(f"Downloaded {gcs_uri} to {temp_path}")
        else:
            # Simulate download for testing
            logger.info(f"Simulating download from {gcs_uri} to {temp_path}")
            # Create an empty file
            with open(temp_path, 'w') as f:
                f.write("Sample content for testing")
        
        return temp_path
    except Exception as e:
        logger.exception(f"Error downloading from GCS: {e}")
        raise

def capture_stdout(func, *args, **kwargs):
    """Capture stdout from a function call."""
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout
    
    try:
        func(*args, **kwargs)
    finally:
        sys.stdout = old_stdout
    
    output = new_stdout.getvalue()
    return output

def extract_reply(output):
    """Extract the reply from the bot output."""
    reply_start = output.find("Answer:") + 8 if "Answer:" in output else 0
    reply = output[reply_start:].strip()
    return reply

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})

@app.route('/api/bots/screener', methods=['POST'])
def deal_screener():
    """Run the deal screener bot."""
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        history = data.get('history', [])
        
        if not message:
            return jsonify({'error': 'message is required'}), 400
        
        logger.info(f"Processing deal screener message for session {session_id}: {message}")
        
        # Process the message with context from history
        context = ""
        if history:
            # Format history for context
            context = "Previous conversation:\n"
            for msg in history:
                role = msg.get('role', 'unknown')
                text = msg.get('text', '')
                context += f"{role.capitalize()}: {text}\n"
        
        # Use the existing function with our loaded deals
        output = capture_stdout(run_deal_screener_chatbot, message, all_deals)
        reply = extract_reply(output)
        
        # If we have additional deal notes from the database, add them to the reply
        if data.get('deals'):
            db_deals = data.get('deals')
            if len(db_deals) > 0:
                reply += "\n\nI also found these additional startups in our database:\n"
                for i, deal in enumerate(db_deals[:3], 1):
                    name = deal.get('name', 'Unknown')
                    sector = deal.get('sector', 'Unknown')
                    score = deal.get('score', {}).get('total', 'N/A')
                    reply += f"{i}. {name} - {sector} sector, Score: {score}/10\n"
        
        return jsonify({'reply': reply})
    except Exception as e:
        logger.exception(f"Error in deal screener: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    """Run the deep dive bot."""
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        history = data.get('history', [])
        final_note = data.get('finalNote')
        
        if not message:
            return jsonify({'error': 'message is required'}), 400
        
        if not final_note:
            return jsonify({'error': 'finalNote is required'}), 400
        
        company_name = final_note.get('company', 'Unknown')
        
        logger.info(f"Processing deep dive message for {company_name}: {message}")
        
        # Process the message with context from history
        context = ""
        if history:
            # Format history for context
            context = "Previous conversation:\n"
            for msg in history:
                role = msg.get('role', 'unknown')
                text = msg.get('text', '')
                context += f"{role.capitalize()}: {text}\n"
        
        # Find the deal note for this company or use the final note
        target_deal = None
        for deal in all_deals:
            if deal.get('company', '').lower() == company_name.lower():
                target_deal = deal
                break
        
        if not target_deal:
            # If we don't have the deal in our loaded notes, use the final_note
            all_deals_with_target = all_deals + [final_note]
        else:
            all_deals_with_target = all_deals
        
        # Use the existing function with our loaded deals
        output = capture_stdout(run_deep_dive_chatbot, message, company_name, all_deals_with_target)
        reply = extract_reply(output)
        
        return jsonify({'reply': reply})
    except Exception as e:
        logger.exception(f"Error in deep dive: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/questionnaire', methods=['POST'])
def questionnaire():
    """Generate a questionnaire based on a note."""
    try:
        data = request.json
        startup_id = data.get('startupId')
        note_id = data.get('noteId')
        note = data.get('note')
        
        if not startup_id or not note_id:
            return jsonify({'error': 'startupId and noteId are required'}), 400
        
        logger.info(f"Generating questionnaire for {startup_id} based on note {note_id}")
        
        # Extract facts from the note
        facts = note.get('facts', {})
        
        # Create a text representation of the facts for the questionnaire agent
        facts_text = json.dumps(facts, indent=2)
        
        # Generate the questionnaire
        try:
            # In a real implementation, we would use the questionnaire_agent
            # For now, we'll generate a questionnaire based on the facts
            
            # Define question categories based on what's in the facts
            categories = []
            if 'traction' in facts:
                categories.append('traction')
            if 'market' in facts:
                categories.append('market')
            if 'competition' in facts:
                categories.append('competition')
            if 'team' in facts:
                categories.append('team')
            if 'product' in facts:
                categories.append('product')
            
            # Add default categories if we don't have enough
            default_categories = ['traction', 'market', 'competition', 'team', 'product', 'finance', 'fundraising']
            for cat in default_categories:
                if cat not in categories and len(categories) < 5:
                    categories.append(cat)
            
            # Generate questions for each category
            questions = []
            question_templates = {
                'traction': [
                    "What is your current monthly revenue and growth rate?",
                    "How many active users/customers do you have?",
                    "What are your key performance metrics?"
                ],
                'market': [
                    "What is your total addressable market size?",
                    "How are you positioning in the market?",
                    "What market trends are you capitalizing on?"
                ],
                'competition': [
                    "Who are your top 3 competitors and how do you differentiate?",
                    "What is your unique value proposition?",
                    "What barriers to entry exist for new competitors?"
                ],
                'team': [
                    "What relevant experience does your founding team have?",
                    "What are your hiring plans for the next 12 months?",
                    "How is equity distributed among founders and employees?"
                ],
                'product': [
                    "What is your product roadmap for the next 12 months?",
                    "How do you measure product-market fit?",
                    "What customer feedback have you received on your product?"
                ],
                'finance': [
                    "What is your current burn rate and runway?",
                    "What are your unit economics?",
                    "What are your financial projections for the next 2 years?"
                ],
                'fundraising': [
                    "How do you plan to use the funds you're raising?",
                    "What milestones will this funding help you achieve?",
                    "What is your valuation expectation and why?"
                ]
            }
            
            # Generate 5 questions
            for i, category in enumerate(categories[:5]):
                template = question_templates.get(category, ["Tell us more about your " + category])[0]
                questions.append({
                    'id': f"q{i+1}",
                    'text': template,
                    'category': category,
                    'type': 'open'
                })
            
            questionnaire = {
                'questions': questions
            }
            
            return jsonify({
                'startupId': startup_id,
                'noteId': note_id,
                'questionnaire': questionnaire
            })
        except Exception as e:
            logger.exception(f"Error generating questionnaire: {e}")
            return jsonify({'error': f'Questionnaire generation failed: {str(e)}'}), 500
    except Exception as e:
        logger.exception(f"Error generating questionnaire: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/questionnaire/assist', methods=['POST'])
def questionnaire_assist():
    """Get assistance for answering a questionnaire question."""
    try:
        data = request.json
        question_id = data.get('questionId')
        question = data.get('question')
        questionnaire = data.get('questionnaire')
        startup_id = data.get('startupId')
        
        if not question:
            return jsonify({'error': 'question is required'}), 400
        
        logger.info(f"Getting questionnaire assistance for {startup_id} with question: {question}")
        
        # Get the category of the question if available
        category = None
        if questionnaire and 'questions' in questionnaire:
            for q in questionnaire['questions']:
                if q.get('id') == question_id:
                    category = q.get('category')
                    break
        
        # Generate assistance based on the question and category
        advice = {
            'traction': "Focus on concrete metrics like MRR, growth rate, and customer acquisition. Investors want to see evidence of product-market fit and scalability.",
            'market': "Be specific about your TAM/SAM/SOM with credible sources. Explain how you arrived at these numbers and why your segment is attractive.",
            'competition': "Don't just list competitors - explain your unique advantages. Create a matrix showing how you compare on key factors that matter to customers.",
            'team': "Highlight relevant domain expertise and previous startup experience. Explain why your team is uniquely positioned to solve this problem.",
            'product': "Describe your product differentiation and technical moats. Share customer testimonials and usage metrics that demonstrate value.",
            'finance': "Be transparent about your unit economics and path to profitability. Include CAC, LTV, payback period, and gross margins.",
            'fundraising': "Clearly tie your fundraising amount to specific milestones. Show how this round gets you to the next inflection point."
        }
        
        answer = f"Here's how you might approach answering this question: {question}\n\n" + \
            "Investors are looking for specific metrics and clear explanations. " + \
            "Make sure to include concrete numbers and examples in your response.\n\n"
        
        if category and category in advice:
            answer += f"For this {category} question: {advice[category]}"
        else:
            answer += "Focus on your key differentiators and market position. Provide specific metrics and examples rather than general statements."
        
        return jsonify({'answer': answer})
    except Exception as e:
        logger.exception(f"Error in questionnaire assist: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    print(f"Starting Startup-Chatbot server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True) 