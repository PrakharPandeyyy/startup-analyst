#!/usr/bin/env python3
"""
Combined HTTP server for both Startup-Analyst and Startup-Chatbot.
"""

import os
import sys
import json
import logging
import tempfile
from flask import Flask, request, jsonify

# Add the project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Check if we can import the required modules
ANALYST_AVAILABLE = False
CHATBOT_AVAILABLE = False

try:
    # Try to import Startup-Analyst modules
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Startup-Analyst')))
    from Startup_Analyst.orchestration.orchestrator import Orchestrator
    ANALYST_AVAILABLE = True
    logger.info("Startup-Analyst modules imported successfully")
except ImportError as e:
    logger.warning(f"Failed to import Startup-Analyst modules: {e}")
    logger.warning("Startup-Analyst functionality will be mocked")

try:
    # Try to import Startup-Chatbot modules
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Startup-Chatbot')))
    from Startup_Chatbot.deal_screener_bot import run_deal_screener_chatbot, load_deal_notes
    from Startup_Chatbot.deep_dive_bot import run_deep_dive_chatbot
    from Startup_Chatbot.questionnaire_agent import extract_text_from_pdf, generate_questionnaire
    CHATBOT_AVAILABLE = True
    logger.info("Startup-Chatbot modules imported successfully")
except ImportError as e:
    logger.warning(f"Failed to import Startup-Chatbot modules: {e}")
    logger.warning("Startup-Chatbot functionality will be mocked")

# Load deal notes if available
all_deals = []
try:
    if CHATBOT_AVAILABLE:
        notes_dir = os.path.join(os.path.dirname(__file__), '..', 'Startup-Chatbot', 'notes')
        all_deals = load_deal_notes(notes_dir)
        logger.info(f"Loaded {len(all_deals)} deal notes")
except Exception as e:
    logger.error(f"Failed to load deal notes: {e}")

def capture_stdout(func, *args, **kwargs):
    """Capture stdout from a function call."""
    import io
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
    status = {
        'status': 'ok',
        'analyst_available': ANALYST_AVAILABLE,
        'chatbot_available': CHATBOT_AVAILABLE,
    }
    return jsonify(status)

@app.route('/api/ingestion', methods=['POST'])
def ingestion():
    """Run the ingestion agent on a pitch deck."""
    try:
        data = request.json
        startup_id = data.get('startupId')
        gcs_uri = data.get('gcsUri')
        
        if not startup_id:
            return jsonify({'error': 'startupId is required'}), 400
        
        if ANALYST_AVAILABLE:
            # Real implementation would go here
            # For now, return a mock response
            pass
        
        # Mock response
        response = {
            'noteId': f'mock_note_{startup_id}',
            'note': {
                'company': startup_id,
                'sector': 'tech',
                'facts': {
                    'name': startup_id,
                    'description': 'A startup company',
                    'founders': [
                        {'name': 'John Doe', 'role': 'CEO'}
                    ],
                    'traction': {
                        'revenue': {'Y1': 100000},
                        'customers': 50
                    }
                },
                'claims': [
                    {'claim': 'Market leader in their segment', 'verified': True},
                    {'claim': '10x better than competitors', 'verified': False}
                ],
                'score': {
                    'team': 8,
                    'market': 7,
                    'product': 8,
                    'traction': 6,
                    'total': 7.5
                }
            }
        }
        
        return jsonify(response)
    except Exception as e:
        logger.exception(f"Error in ingestion: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/screener', methods=['POST'])
def screener():
    """Run the deal screener bot."""
    try:
        data = request.json
        message = data.get('message')
        
        if not message:
            return jsonify({'error': 'message is required'}), 400
        
        if CHATBOT_AVAILABLE:
            try:
                output = capture_stdout(run_deal_screener_chatbot, message, all_deals)
                reply = extract_reply(output)
                return jsonify({'reply': reply})
            except Exception as e:
                logger.exception(f"Error running deal screener: {e}")
        
        # Mock response
        response = {
            'reply': f"Here are some AI startups that match your criteria: \n\n1. TechAI - AI for enterprise, Score: 8.5/10\n2. DataMind - AI for healthcare, Score: 7.8/10\n3. NeuralSystems - AI for manufacturing, Score: 7.2/10"
        }
        
        return jsonify(response)
    except Exception as e:
        logger.exception(f"Error in screener: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    """Run the deep dive bot."""
    try:
        data = request.json
        message = data.get('message')
        company = data.get('company', 'Unknown')
        
        if not message:
            return jsonify({'error': 'message is required'}), 400
        
        if CHATBOT_AVAILABLE:
            try:
                output = capture_stdout(run_deep_dive_chatbot, message, company, all_deals)
                reply = extract_reply(output)
                return jsonify({'reply': reply})
            except Exception as e:
                logger.exception(f"Error running deep dive: {e}")
        
        # Mock response
        response = {
            'reply': f"Based on my analysis of {company}, here are the key points:\n\n- Strong technical team with previous exits\n- Growing market with 30% YoY growth\n- Unique IP with 2 pending patents\n- Current traction shows 25% MoM growth\n- Main risks include regulatory challenges and competition from BigTech"
        }
        
        return jsonify(response)
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
        
        if not startup_id:
            return jsonify({'error': 'startupId is required'}), 400
        
        if CHATBOT_AVAILABLE:
            # Real implementation would go here
            # For now, return a mock response
            pass
        
        # Mock response
        response = {
            'startupId': startup_id,
            'noteId': note_id or f'mock_note_{startup_id}',
            'questionnaire': {
                'questions': [
                    {'id': 'q1', 'text': 'What is your total addressable market size?', 'category': 'market', 'type': 'open'},
                    {'id': 'q2', 'text': 'How many active users/customers do you have?', 'category': 'traction', 'type': 'open'},
                    {'id': 'q3', 'text': 'Who are your top 3 competitors and how do you differentiate?', 'category': 'competition', 'type': 'open'},
                    {'id': 'q4', 'text': 'What relevant experience does your founding team have?', 'category': 'team', 'type': 'open'},
                    {'id': 'q5', 'text': 'What is your product roadmap for the next 12 months?', 'category': 'product', 'type': 'open'}
                ]
            }
        }
        
        return jsonify(response)
    except Exception as e:
        logger.exception(f"Error in questionnaire: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/questionnaire/assist', methods=['POST'])
def questionnaire_assist():
    """Get assistance for answering a questionnaire question."""
    try:
        data = request.json
        question = data.get('question')
        category = data.get('category', '')
        
        if not question:
            return jsonify({'error': 'question is required'}), 400
        
        if CHATBOT_AVAILABLE:
            # Real implementation would go here
            # For now, return a mock response
            pass
        
        advice = {
            'traction': "Focus on concrete metrics like MRR, growth rate, and customer acquisition. Investors want to see evidence of product-market fit and scalability.",
            'market': "Be specific about your TAM/SAM/SOM with credible sources. Explain how you arrived at these numbers and why your segment is attractive.",
            'competition': "Don't just list competitors - explain your unique advantages. Create a matrix showing how you compare on key factors that matter to customers.",
            'team': "Highlight relevant domain expertise and previous startup experience. Explain why your team is uniquely positioned to solve this problem.",
            'product': "Describe your product differentiation and technical moats. Share customer testimonials and usage metrics that demonstrate value.",
            'finance': "Be transparent about your unit economics and path to profitability. Include CAC, LTV, payback period, and gross margins.",
            'fundraising': "Clearly tie your fundraising amount to specific milestones. Show how this round gets you to the next inflection point."
        }
        
        # Mock response
        response = {
            'answer': f"Here's how you might approach answering this question: {question}\n\n" +
                     "Investors are looking for specific metrics and clear explanations. " +
                     "Make sure to include concrete numbers and examples in your response.\n\n" +
                     (advice.get(category, "Focus on your key differentiators and market position. Provide specific metrics and examples rather than general statements."))
        }
        
        return jsonify(response)
    except Exception as e:
        logger.exception(f"Error in questionnaire assist: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')
    logger.info(f"Starting combined server on port {port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug) 