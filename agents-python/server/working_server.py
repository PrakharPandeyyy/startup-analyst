#!/usr/bin/env python3
"""
Working server with realistic mock responses for all agent endpoints.
"""

import os
import json
import random
from flask import Flask, request, jsonify

app = Flask(__name__)

# Mock data for realistic responses
HEALTHCARE_STARTUPS = [
    {"name": "MediMind AI", "description": "Healthcare diagnostics using AI", "score": 8.7, "stage": "Series A", "revenue": "$2M ARR"},
    {"name": "BioTechAI", "description": "Drug discovery platform", "score": 8.2, "stage": "Seed", "revenue": "$500K ARR"},
    {"name": "CareBot", "description": "Patient monitoring system", "score": 7.9, "stage": "Series A", "revenue": "$1.5M ARR"},
    {"name": "HealthAI", "description": "AI-powered medical imaging", "score": 8.5, "stage": "Series B", "revenue": "$5M ARR"}
]

FINTECH_STARTUPS = [
    {"name": "PayAI", "description": "Payment processing AI", "score": 8.5, "stage": "Series A", "revenue": "$3M ARR"},
    {"name": "RiskBot", "description": "Fraud detection platform", "score": 8.0, "stage": "Seed", "revenue": "$1M ARR"},
    {"name": "TradeMind", "description": "Algorithmic trading AI", "score": 7.8, "stage": "Series A", "revenue": "$2.5M ARR"},
    {"name": "FinTechAI", "description": "AI for credit scoring", "score": 8.3, "stage": "Series B", "revenue": "$4M ARR"}
]

AI_STARTUPS = [
    {"name": "TechAI", "description": "AI for enterprise", "score": 8.5, "stage": "Series A", "revenue": "$3M ARR"},
    {"name": "DataMind", "description": "AI for healthcare", "score": 7.8, "stage": "Seed", "revenue": "$800K ARR"},
    {"name": "NeuralSystems", "description": "AI for manufacturing", "score": 7.2, "stage": "Series A", "revenue": "$1.2M ARR"},
    {"name": "AI Solutions", "description": "AI consulting and development", "score": 8.0, "stage": "Series B", "revenue": "$6M ARR"}
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'service': 'working-agent-server',
        'chatbot_available': True,
        'deals_loaded': len(HEALTHCARE_STARTUPS) + len(FINTECH_STARTUPS) + len(AI_STARTUPS)
    })

# Chatbot endpoints
@app.route('/api/bots/screener', methods=['POST'])
def screener():
    data = request.json
    message = data.get('message', '')
    
    # Determine which category to search
    if 'healthcare' in message.lower() or 'health' in message.lower() or 'medical' in message.lower():
        startups = HEALTHCARE_STARTUPS
        category = "Healthcare"
    elif 'fintech' in message.lower() or 'finance' in message.lower() or 'fintech' in message.lower():
        startups = FINTECH_STARTUPS
        category = "Fintech"
    else:
        startups = AI_STARTUPS
        category = "AI/Technology"
    
    # Select top 3 startups
    selected = random.sample(startups, min(3, len(startups)))
    
    reply = f"Here are some {category} startups that match your criteria:\n\n"
    for i, startup in enumerate(selected, 1):
        reply += f"{i}. {startup['name']} - {startup['description']}\n"
        reply += f"   Score: {startup['score']}/10 | Stage: {startup['stage']} | Revenue: {startup['revenue']}\n\n"
    
    return jsonify({'reply': reply})

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    data = request.json
    message = data.get('message', '')
    company = data.get('company', 'Unknown')
    
    if 'team' in message.lower():
        reply = f"## Team Analysis for {company}\n\n"
        reply += "**Founding Team:**\n"
        reply += "- CEO: Former ML research lead at Google with PhD in Computer Science\n"
        reply += "- CTO: 15+ years experience building scalable AI systems\n"
        reply += "- CPO: Previously founded and exited a B2B SaaS startup\n\n"
        reply += "**Team Strengths:**\n"
        reply += "- Strong technical background\n"
        reply += "- Previous startup experience\n"
        reply += "- Complementary skills\n"
        reply += "- Industry connections"
    elif 'market' in message.lower():
        reply = f"## Market Analysis for {company}\n\n"
        reply += "**Market Size:**\n"
        reply += "- Total Addressable Market: $45B by 2027\n"
        reply += "- Serviceable Addressable Market: $2.3B\n"
        reply += "- Current market penetration: 0.1%\n\n"
        reply += "**Market Growth:**\n"
        reply += "- Market growth rate: 32% CAGR\n"
        reply += "- Customer acquisition cost: $150\n"
        reply += "- Customer lifetime value: $2,400"
    elif 'traction' in message.lower():
        reply = f"## Traction Analysis for {company}\n\n"
        reply += "**Key Metrics:**\n"
        reply += "- Monthly Recurring Revenue: $250K\n"
        reply += "- Monthly growth rate: 25%\n"
        reply += "- Customer count: 1,200\n"
        reply += "- Churn rate: 3%\n\n"
        reply += "**Growth Drivers:**\n"
        reply += "- Strong product-market fit\n"
        reply += "- Efficient customer acquisition\n"
        reply += "- High customer satisfaction"
    else:
        reply = f"## Comprehensive Analysis for {company}\n\n"
        reply += "**Key Highlights:**\n"
        reply += "- Strong technical team with previous exits\n"
        reply += "- Growing market with 30% YoY growth\n"
        reply += "- Unique IP with 2 pending patents\n"
        reply += "- Current traction shows 25% MoM growth\n\n"
        reply += "**Investment Thesis:**\n"
        reply += "- Large addressable market\n"
        reply += "- Strong competitive moat\n"
        reply += "- Experienced team\n"
        reply += "- Proven traction"
    
    return jsonify({'reply': reply})

# Analyst endpoints
@app.route('/api/ingestion', methods=['POST'])
def ingestion():
    data = request.json
    startup_id = data.get('startupId')
    gcs_uri = data.get('gcsUri')
    
    # Create a realistic mock note
    note_id = f"note_{startup_id}_{hash(gcs_uri) % 10000}"
    note = {
        'title': f'Investment Analysis: {startup_id}',
        'summary': 'Comprehensive analysis generated from pitch deck and public data',
        'executive_summary': 'Strong team with proven track record in AI/ML space. Large addressable market with clear competitive advantages.',
        'findings': [
            'Experienced founding team with previous exits',
            'Large and growing addressable market ($45B TAM)',
            'Unique technology with patent protection',
            'Strong early traction with 25% MoM growth',
            'Clear path to profitability'
        ],
        'metrics': {
            'revenue': '$1.2M ARR',
            'growth_rate': '25% MoM',
            'customers': 1200,
            'churn_rate': '3%',
            'cac': '$150',
            'ltv': '$2,400'
        },
        'team': {
            'ceo': 'Former Google ML researcher, PhD Stanford',
            'cto': '15+ years building AI systems',
            'cpo': 'Previous B2B SaaS exit'
        },
        'market': {
            'tam': '$45B',
            'sam': '$2.3B',
            'penetration': '0.1%',
            'growth_rate': '32% CAGR'
        }
    }
    
    return jsonify({'noteId': note_id, 'note': note})

@app.route('/api/deep-research', methods=['POST'])
def deep_research():
    data = request.json
    note_id = data.get('noteId')
    
    verification = {
        'claims_verified': [
            'Team experience at Google confirmed',
            'Market size data verified from industry reports',
            'Revenue metrics validated through customer interviews',
            'Patent applications confirmed with USPTO'
        ],
        'risks_identified': [
            'High competition in AI space',
            'Market timing risk with economic uncertainty',
            'Customer concentration risk (top 3 customers = 40% revenue)',
            'Regulatory risk in target markets'
        ],
        'confidence_score': 0.85,
        'verification_sources': [
            'LinkedIn profiles verified',
            'Industry reports from Gartner and Forrester',
            'Customer reference calls completed',
            'Patent database search completed'
        ]
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
        'traction_score': 8.1,
        'financial_score': 7.9,
        'risk_score': 7.5,
        'scoring_breakdown': {
            'team': {
                'score': 8.5,
                'factors': ['Previous exits', 'Technical expertise', 'Industry experience']
            },
            'market': {
                'score': 7.8,
                'factors': ['Large TAM', 'Growing market', 'Competitive landscape']
            },
            'product': {
                'score': 8.0,
                'factors': ['Unique technology', 'Patent protection', 'Product-market fit']
            },
            'traction': {
                'score': 8.1,
                'factors': ['Strong growth', 'Low churn', 'Customer satisfaction']
            }
        },
        'recommendation': 'Proceed with investment',
        'investment_terms': {
            'valuation': '$15M pre-money',
            'investment_amount': '$3M',
            'equity': '20%',
            'liquidation_preference': '1x non-participating'
        }
    }
    
    return jsonify({'scoring': scoring})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
