#!/usr/bin/env python3
"""
Simple HTTP server for chatbot functionality.
This server provides mock responses that work with the backend.
"""

import os
import json
import logging
from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    status = {
        'status': 'ok',
        'chatbot_available': True,
        'deals_loaded': 3
    }
    return jsonify(status)

@app.route('/api/bots/screener', methods=['POST'])
def screener():
    """Run the deal screener bot."""
    try:
        data = request.json
        message = data.get('message')
        
        if not message:
            return jsonify({'error': 'message is required'}), 400
        
        # Enhanced mock response based on the message
        if 'healthcare' in message.lower():
            response = {
                'reply': "Here are some AI startups in the healthcare sector:\n\n1. MediMind AI - Healthcare diagnostics, Score: 8.7/10\n2. BioTechAI - Drug discovery platform, Score: 8.2/10\n3. CareBot - Patient monitoring system, Score: 7.9/10\n\nThese startups show strong traction in the healthcare AI space with proven market demand."
            }
        elif 'fintech' in message.lower():
            response = {
                'reply': "Here are some AI startups in the fintech sector:\n\n1. PayAI - Payment processing AI, Score: 8.5/10\n2. RiskBot - Fraud detection platform, Score: 8.0/10\n3. TradeMind - Algorithmic trading AI, Score: 7.8/10\n\nThese companies are leveraging AI to revolutionize financial services."
            }
        else:
            response = {
                'reply': f"Here are some AI startups that match your criteria: \n\n1. TechAI - AI for enterprise, Score: 8.5/10\n2. DataMind - AI for healthcare, Score: 7.8/10\n3. NeuralSystems - AI for manufacturing, Score: 7.2/10\n\nBased on your query: '{message}', these startups show strong potential in their respective markets."
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
        
        # Enhanced mock response based on the message
        if 'team' in message.lower():
            response = {
                'reply': f"Based on my analysis of {company}'s founding team:\n\n- CEO: Former ML research lead at Google with PhD in Computer Science\n- CTO: 15+ years experience building scalable AI systems\n- CPO: Previously founded and exited a B2B SaaS startup\n- The team has worked together for 3+ years before founding\n- Strong technical credentials and previous startup experience"
            }
        elif 'market' in message.lower():
            response = {
                'reply': f"Market analysis for {company}:\n\n- Total Addressable Market: $45B by 2027\n- Serviceable Addressable Market: $2.3B\n- Current market penetration: 0.1%\n- Market growth rate: 32% CAGR\n- Key market drivers: Digital transformation, AI adoption, cost reduction needs"
            }
        elif 'traction' in message.lower():
            response = {
                'reply': f"Traction metrics for {company}:\n\n- Revenue: $500K ARR (140% YoY growth)\n- Customers: 25 enterprise clients\n- Monthly recurring revenue growth: 15% MoM\n- Customer acquisition cost: $12K\n- Customer lifetime value: $180K\n- Net revenue retention: 120%"
            }
        else:
            response = {
                'reply': f"Based on my analysis of {company}, here are the key points:\n\n- Strong technical team with previous exits\n- Growing market with 30% YoY growth\n- Unique IP with 2 pending patents\n- Current traction shows 25% MoM growth\n- Main risks include regulatory challenges and competition from BigTech\n\nOverall assessment: Strong potential with some execution risks."
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
        
        advice = {
            'traction': "Focus on concrete metrics like MRR, growth rate, and customer acquisition. Investors want to see evidence of product-market fit and scalability.",
            'market': "Be specific about your TAM/SAM/SOM with credible sources. Explain how you arrived at these numbers and why your segment is attractive.",
            'competition': "Don't just list competitors - explain your unique advantages. Create a matrix showing how you compare on key factors that matter to customers.",
            'team': "Highlight relevant domain expertise and previous startup experience. Explain why your team is uniquely positioned to solve this problem.",
            'product': "Describe your product differentiation and technical moats. Share customer testimonials and usage metrics that demonstrate value.",
            'finance': "Be transparent about your unit economics and path to profitability. Include CAC, LTV, payback period, and gross margins.",
            'fundraising': "Clearly tie your fundraising amount to specific milestones. Show how this round gets you to the next inflection point."
        }
        
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
    logger.info(f"Starting simple server on port {port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug)
