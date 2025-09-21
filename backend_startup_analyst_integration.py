#!/usr/bin/env python3
"""
Backend Startup-Analyst Integration Script

This script integrates the Startup-Analyst with the backend by:
1. Downloading pitch deck from GCS
2. Fetching questionnaire answers from Firestore
3. Running Startup-Analyst with all data
4. Uploading the generated deal note back to the backend
"""

import sys
import os
import json
import requests
import tempfile
from pathlib import Path

# Add Startup-Analyst to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Startup-Analyst'))

try:
    from orchestration.orchestrator import Orchestrator
    print("✅ Successfully imported Startup-Analyst Orchestrator")
except ImportError as e:
    print(f"❌ Failed to import Startup-Analyst: {e}")
    sys.exit(1)

# Backend API configuration
BACKEND_API_URL = os.environ.get("BACKEND_API_URL", "https://analyst-backend-549120538825.us-central1.run.app")

def get_pitch_deck_download_url(pitch_deck_id):
    """Get signed download URL for pitch deck from backend."""
    try:
        response = requests.get(f"{BACKEND_API_URL}/v1/files/pitch-deck/{pitch_deck_id}/download-url")
        if response.status_code == 200:
            data = response.json()
            return data.get('downloadUrl')
        else:
            print(f"❌ Failed to get download URL: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting download URL: {e}")
        return None

def download_pitch_deck(download_url, temp_dir):
    """Download pitch deck PDF to temporary directory."""
    try:
        print(f"📥 Downloading pitch deck from: {download_url[:100]}...")
        response = requests.get(download_url)
        response.raise_for_status()
        
        pdf_path = os.path.join(temp_dir, "pitch_deck.pdf")
        with open(pdf_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded pitch deck: {pdf_path}")
        return pdf_path
    except Exception as e:
        print(f"❌ Error downloading pitch deck: {e}")
        return None

def get_questionnaire_answers(questionnaire_id):
    """Fetch questionnaire answers from backend."""
    try:
        print(f"📋 Fetching questionnaire answers for ID: {questionnaire_id}")
        response = requests.get(f"{BACKEND_API_URL}/v1/startups/questionnaire/{questionnaire_id}")
        if response.status_code == 200:
            data = response.json()
            answers = data.get('answers', [])
            print(f"✅ Retrieved {len(answers)} questionnaire answers")
            return answers
        else:
            print(f"❌ Failed to get questionnaire answers: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error fetching questionnaire answers: {e}")
        return []

def create_questionnaire_text_file(answers, temp_dir):
    """Create a text file with questionnaire answers for Startup-Analyst."""
    try:
        if not answers:
            print("⚠️  No questionnaire answers to process")
            return None
        
        # Format answers as structured text
        text_content = "QUESTIONNAIRE ANSWERS:\n\n"
        for i, answer in enumerate(answers, 1):
            question_id = answer.get('questionId', f'q{i}')
            answer_text = answer.get('answer', 'No answer provided')
            text_content += f"Q{i} ({question_id}): {answer_text}\n\n"
        
        # Save to temporary file
        answers_path = os.path.join(temp_dir, "questionnaire_answers.txt")
        with open(answers_path, 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        print(f"✅ Created questionnaire answers file: {answers_path}")
        return answers_path
    except Exception as e:
        print(f"❌ Error creating questionnaire answers file: {e}")
        return None

def run_startup_analyst(company_name, company_website, pitch_deck_path, questionnaire_path, temp_dir):
    """Run Startup-Analyst with all provided data."""
    try:
        print(f"🚀 Running Startup-Analyst for: {company_name}")
        print(f"🌐 Company Website: {company_website}")
        print(f"📄 Pitch Deck: {pitch_deck_path}")
        print(f"📋 Questionnaire: {questionnaire_path}")
        
        # Prepare inputs for Startup-Analyst
        inputs = []
        
        # Add pitch deck if available
        if pitch_deck_path and os.path.exists(pitch_deck_path):
            inputs.append(pitch_deck_path)
            print(f"✅ Added pitch deck to inputs: {pitch_deck_path}")
        
        # Add questionnaire answers if available
        if questionnaire_path and os.path.exists(questionnaire_path):
            inputs.append(questionnaire_path)
            print(f"✅ Added questionnaire answers to inputs: {questionnaire_path}")
        
        # Add company website as additional context
        if company_website:
            inputs.append(company_website)
            print(f"✅ Added company website to inputs: {company_website}")
        
        if not inputs:
            print("❌ No inputs available for Startup-Analyst")
            return None
        
        # Initialize orchestrator
        orchestrator = Orchestrator(sector="technology")  # Default sector
        
        # Run Startup-Analyst
        print("🔄 Starting Startup-Analyst analysis...")
        output_path, deal_note = orchestrator.run(company_name, inputs)
        
        print(f"✅ Startup-Analyst completed successfully!")
        print(f"📊 Score: {deal_note.get('score', {}).get('total', 'N/A')}")
        print(f"💾 Output saved to: {output_path}")
        
        return deal_note
        
    except Exception as e:
        print(f"❌ Error running Startup-Analyst: {e}")
        return None

def upload_deal_note_to_backend(startup_id, deal_note):
    """Upload generated deal note to backend."""
    try:
        print(f"📤 Uploading deal note to backend for startup: {startup_id}")
        
        # Prepare the deal note data
        deal_note_data = {
            "startupId": startup_id,
            "dealNote": deal_note
        }
        
        # Upload to backend
        response = requests.post(
            f"{BACKEND_API_URL}/v1/startups/upload-real-deal-note",
            json=deal_note_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Deal note uploaded successfully!")
            print(f"📋 Deal Note ID: {result.get('dealNoteId')}")
            return result.get('dealNoteId')
        else:
            print(f"❌ Failed to upload deal note: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error uploading deal note: {e}")
        return None

def main():
    """Main integration function."""
    if len(sys.argv) < 4:
        print("❌ Usage: python3 backend_startup_analyst_integration.py <startupId> <companyName> <companyWebsite> [pitchDeckId] [questionnaireId]")
        sys.exit(1)
    
    startup_id = sys.argv[1]
    company_name = sys.argv[2]
    company_website = sys.argv[3]
    pitch_deck_id = sys.argv[4] if len(sys.argv) > 4 else None
    questionnaire_id = sys.argv[5] if len(sys.argv) > 5 else None
    
    print(f"🎯 Starting Startup-Analyst integration for: {company_name}")
    print(f"🆔 Startup ID: {startup_id}")
    print(f"🌐 Company Website: {company_website}")
    print(f"📄 Pitch Deck ID: {pitch_deck_id}")
    print(f"📋 Questionnaire ID: {questionnaire_id}")
    
    # Create temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"📁 Using temporary directory: {temp_dir}")
        
        pitch_deck_path = None
        questionnaire_path = None
        
        # Download pitch deck if available
        if pitch_deck_id:
            download_url = get_pitch_deck_download_url(pitch_deck_id)
            if download_url:
                pitch_deck_path = download_pitch_deck(download_url, temp_dir)
        
        # Get questionnaire answers if available
        if questionnaire_id:
            answers = get_questionnaire_answers(questionnaire_id)
            if answers:
                questionnaire_path = create_questionnaire_text_file(answers, temp_dir)
        
        # Run Startup-Analyst
        deal_note = run_startup_analyst(
            company_name, 
            company_website, 
            pitch_deck_path, 
            questionnaire_path, 
            temp_dir
        )
        
        if deal_note:
            # Upload deal note to backend
            deal_note_id = upload_deal_note_to_backend(startup_id, deal_note)
            
            if deal_note_id:
                print(f"🎉 Integration completed successfully!")
                print(f"📋 Deal Note ID: {deal_note_id}")
                print(f"📊 Final Score: {deal_note.get('score', {}).get('total', 'N/A')}")
                return 0
            else:
                print("❌ Failed to upload deal note to backend")
                return 1
        else:
            print("❌ Startup-Analyst failed to generate deal note")
            return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
