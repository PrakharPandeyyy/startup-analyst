#!/usr/bin/env python3
"""
Real chatbot server using the actual Startup-Chatbot code.
"""

import os
import sys
import json
import logging
from flask import Flask, request, jsonify

# Add Startup-Chatbot directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Startup-Chatbot')))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Import the real chatbot modules
try:
    from deal_screener_bot import load_deal_notes, run_deal_screener_chatbot
    from deep_dive_bot import run_deep_dive_chatbot
    from questionnaire_agent import generate_questionnaire
    
    # Load deal notes
    notes_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'Startup-Chatbot', 'notes')
    all_deals = load_deal_notes(notes_dir)
    logger.info(f"Loaded {len(all_deals)} deal notes")
    
    REAL_AGENTS_AVAILABLE = True
except ImportError as e:
    logger.error(f"Failed to import real agents: {e}")
    REAL_AGENTS_AVAILABLE = False
    all_deals = []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'service': 'real-chatbot-server',
        'real_agents_available': REAL_AGENTS_AVAILABLE,
        'deals_loaded': len(all_deals)
    })

@app.route('/api/bots/screener', methods=['POST'])
def screener():
    data = request.json
    message = data.get('message', '')
    
    if not REAL_AGENTS_AVAILABLE:
        # Fallback to mock response
        reply = f"Mock response: Here are some AI startups that match your criteria: \n\n1. TechAI - AI for enterprise, Score: 8.5/10\n2. DataMind - AI for healthcare, Score: 7.8/10\n3. NeuralSystems - AI for manufacturing, Score: 7.2/10"
        return jsonify({'reply': reply})
    
    try:
        # Use the real deal screener
        reply = run_deal_screener_chatbot(message, all_deals)
        return jsonify({'reply': reply})
    except Exception as e:
        logger.error(f"Error in deal screener: {e}")
        reply = f"Error processing your request: {str(e)}"
        return jsonify({'reply': reply})

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    data = request.json
    message = data.get('message', '')
    company = data.get('company', 'Unknown')
    
    if not REAL_AGENTS_AVAILABLE:
        # Fallback to mock response
        reply = f"Mock response: Based on my analysis of {company}, here are the key points:\n\n- Strong technical team with previous exits\n- Growing market with 30% YoY growth\n- Unique IP with 2 pending patents\n- Current traction shows 25% MoM growth"
        return jsonify({'reply': reply})
    
    try:
        # Use the real deep dive bot
        reply = run_deep_dive_chatbot(message, company, all_deals)
        return jsonify({'reply': reply})
    except Exception as e:
        logger.error(f"Error in deep dive: {e}")
        reply = f"Error processing your request: {str(e)}"
        return jsonify({'reply': reply})

@app.route('/api/questionnaire', methods=['POST'])
def questionnaire():
    data = request.json
    startup_id = data.get('startupId')
    
    if not REAL_AGENTS_AVAILABLE:
        # Fallback to mock response
        response = {
            'startupId': startup_id,
            'questionnaire': {
                'questions': [
                    {'id': 'q1', 'text': 'What is your total addressable market size?', 'category': 'market', 'type': 'open'},
                    {'id': 'q2', 'text': 'How many active users/customers do you have?', 'category': 'traction', 'type': 'open'},
                    {'id': 'q3', 'text': 'Who are your top 3 competitors and how do you differentiate?', 'category': 'competition', 'type': 'open'}
                ]
            }
        }
        return jsonify(response)
    
    try:
        # Use the real questionnaire agent
        questionnaire = generate_questionnaire(startup_id)
        return jsonify({'startupId': startup_id, 'questionnaire': questionnaire})
    except Exception as e:
        logger.error(f"Error generating questionnaire: {e}")
        # Return mock response on error
        response = {
            'startupId': startup_id,
            'questionnaire': {
                'questions': [
                    {'id': 'q1', 'text': 'What is your total addressable market size?', 'category': 'market', 'type': 'open'},
                    {'id': 'q2', 'text': 'How many active users/customers do you have?', 'category': 'traction', 'type': 'open'},
                    {'id': 'q3', 'text': 'Who are your top 3 competitors and how do you differentiate?', 'category': 'competition', 'type': 'open'}
                ]
            }
        }
        return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
