#!/usr/bin/env python3
"""
Minimal HTTP server for testing agent endpoints.
"""

import os
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'minimal-agent-server'})

# Chatbot endpoints
@app.route('/api/bots/screener', methods=['POST'])
def screener():
    data = request.json
    message = data.get('message', '')
    
    if 'healthcare' in message.lower():
        reply = "Here are some AI startups in the healthcare sector:\n\n1. MediMind AI - Healthcare diagnostics, Score: 8.7/10\n2. BioTechAI - Drug discovery platform, Score: 8.2/10\n3. CareBot - Patient monitoring system, Score: 7.9/10"
    elif 'fintech' in message.lower():
        reply = "Here are some AI startups in the fintech sector:\n\n1. PayAI - Payment processing AI, Score: 8.5/10\n2. RiskBot - Fraud detection platform, Score: 8.0/10\n3. TradeMind - Algorithmic trading AI, Score: 7.8/10"
    else:
        reply = f"Here are some AI startups that match your criteria: \n\n1. TechAI - AI for enterprise, Score: 8.5/10\n2. DataMind - AI for healthcare, Score: 7.8/10\n3. NeuralSystems - AI for manufacturing, Score: 7.2/10"
    
    return jsonify({'reply': reply})

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    data = request.json
    message = data.get('message', '')
    company = data.get('company', 'Unknown')
    
    if 'team' in message.lower():
        reply = f"Based on my analysis of {company}'s founding team:\n\n- CEO: Former ML research lead at Google with PhD in Computer Science\n- CTO: 15+ years experience building scalable AI systems\n- CPO: Previously founded and exited a B2B SaaS startup"
    elif 'market' in message.lower():
        reply = f"Market analysis for {company}:\n\n- Total Addressable Market: $45B by 2027\n- Serviceable Addressable Market: $2.3B\n- Current market penetration: 0.1%\n- Market growth rate: 32% CAGR"
    else:
        reply = f"Based on my analysis of {company}, here are the key points:\n\n- Strong technical team with previous exits\n- Growing market with 30% YoY growth\n- Unique IP with 2 pending patents\n- Current traction shows 25% MoM growth"
    
    return jsonify({'reply': reply})

# Analyst endpoints
@app.route('/api/ingestion', methods=['POST'])
def ingestion():
    data = request.json
    startup_id = data.get('startupId')
    gcs_uri = data.get('gcsUri')
    
    # Create a mock note
    note_id = f"note_{startup_id}_{hash(gcs_uri) % 10000}"
    note = {
        'title': f'Analysis for {startup_id}',
        'summary': 'Mock analysis generated from pitch deck',
        'findings': ['Strong team', 'Growing market', 'Unique technology'],
        'metrics': {'revenue': '$1M ARR', 'growth': '25% MoM'}
    }
    
    return jsonify({'noteId': note_id, 'note': note})

@app.route('/api/deep-research', methods=['POST'])
def deep_research():
    data = request.json
    note_id = data.get('noteId')
    
    verification = {
        'claims_verified': ['Team experience', 'Market size'],
        'risks_identified': ['Competition', 'Market timing'],
        'confidence_score': 0.85
    }
    
    return jsonify({'verification': verification})

@app.route('/api/deal-scoring', methods=['POST'])
def deal_scoring():
    data = request.json
    note_id = data.get('noteId')
    
    scoring = {
        'overall_score': 8.2,
        'team_score': 8.5,
        'market_score': 7.8,
        'product_score': 8.0,
        'traction_score': 8.1
    }
    
    return jsonify({'scoring': scoring})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
