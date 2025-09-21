from flask import Flask, request, jsonify
import os
import json

app = Flask(__name__)

@app.route('/api/generate-questionnaire', methods=['POST'])
def generate_questionnaire():
    try:
        data = request.json
        startup_id = data.get('startupId')
        pitch_deck_gcs_uri = data.get('pitchDeckGcsUri')
        
        # Generate mock questionnaire
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
        print(f"Error in generate_questionnaire: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/screener', methods=['POST'])
def deal_screener():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        
        # Generate mock response
        response = f"Here's information about startups based on your query: '{message}'"
        
        return jsonify({
            'reply': response,
            'status': 'completed',
            'sessionId': session_id
        })
        
    except Exception as e:
        print(f"Error in deal_screener: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/bots/deep-dive', methods=['POST'])
def deep_dive():
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('sessionId')
        deal_note_id = data.get('dealNoteId')
        
        # Generate mock response
        response = f"Here's detailed information about the startup based on your query: '{message}'"
        
        return jsonify({
            'reply': response,
            'status': 'completed',
            'sessionId': session_id
        })
        
    except Exception as e:
        print(f"Error in deep_dive: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/full-analysis', methods=['POST'])
def full_analysis():
    try:
        data = request.json
        startup_id = data.get('startupId')
        pitch_deck_gcs_uri = data.get('pitchDeckGcsUri')
        questionnaire_answers = data.get('questionnaireAnswers', {})
        
        # Generate mock deal note
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
        print(f"Error in full_analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'agent-server'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
