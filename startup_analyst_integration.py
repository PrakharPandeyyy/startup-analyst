#!/usr/bin/env python3
"""
Startup Analyst Integration Script
This script integrates the Startup-Analyst with our backend API
"""

import sys
import os
import json
import requests
from pathlib import Path

# Add Startup-Analyst to path
sys.path.insert(0, str(Path(__file__).parent / "Startup-Analyst"))

from orchestration.orchestrator import Orchestrator

# Backend API configuration
BACKEND_API_URL = "https://analyst-backend-549120538825.us-central1.run.app"

def download_pitch_deck(pitch_deck_id: str) -> str:
    """Download pitch deck from backend and save locally"""
    try:
        # Get download URL from backend
        response = requests.get(f"{BACKEND_API_URL}/v1/files/pitch-deck/{pitch_deck_id}/download-url")
        if response.status_code != 200:
            raise Exception(f"Failed to get download URL: {response.text}")
        
        download_url = response.json().get("downloadUrl")
        if not download_url:
            raise Exception("No download URL in response")
        
        # Download the file
        file_response = requests.get(download_url)
        if file_response.status_code != 200:
            raise Exception(f"Failed to download file: {file_response.status_code}")
        
        # Save locally
        local_path = f"/tmp/pitch_deck_{pitch_deck_id}.pdf"
        with open(local_path, 'wb') as f:
            f.write(file_response.content)
        
        return local_path
    except Exception as e:
        print(f"Error downloading pitch deck: {e}")
        return None

def get_questionnaire_answers(questionnaire_id: str) -> dict:
    """Get questionnaire answers from backend"""
    try:
        # This would need to be implemented in the backend
        # For now, return mock data
        return {
            "q1": "Our company focuses on VR/AR technology solutions",
            "q2": "We have 50+ enterprise clients in the VR space",
            "q3": "Our revenue is $2M ARR",
            "q4": "We plan to expand to European markets",
            "q5": "Our main competitors are Meta, Microsoft HoloLens, and Magic Leap"
        }
    except Exception as e:
        print(f"Error getting questionnaire answers: {e}")
        return {}

def run_startup_analyst(company_name: str, company_website: str, pitch_deck_path: str, questionnaire_answers: dict, sector: str = "vr") -> dict:
    """Run the Startup-Analyst with all inputs"""
    try:
        # Prepare inputs for Startup-Analyst
        inputs = []
        
        # Add pitch deck if available
        if pitch_deck_path and os.path.exists(pitch_deck_path):
            inputs.append(pitch_deck_path)
        
        # Add company website
        if company_website:
            inputs.append(company_website)
        
        # Add questionnaire answers as a text file
        if questionnaire_answers:
            qa_text = "Questionnaire Answers:\n"
            for q, a in questionnaire_answers.items():
                qa_text += f"{q}: {a}\n"
            
            qa_path = f"/tmp/questionnaire_{company_name}.txt"
            with open(qa_path, 'w') as f:
                f.write(qa_text)
            inputs.append(qa_path)
        
        if not inputs:
            raise Exception("No inputs provided for Startup-Analyst")
        
        print(f"Running Startup-Analyst for {company_name} with inputs: {inputs}")
        
        # Initialize and run the orchestrator
        orchestrator = Orchestrator(sector=sector)
        output_path, deal_note = orchestrator.run(company_name, inputs)
        
        print(f"Startup-Analyst completed. Output saved to: {output_path}")
        print(f"Deal score: {deal_note.get('score', {}).get('total', 'N/A')}")
        
        return deal_note
        
    except Exception as e:
        print(f"Error running Startup-Analyst: {e}")
        return {"error": str(e)}

def save_deal_note_to_backend(startup_id: str, deal_note: dict) -> bool:
    """Save the generated deal note to the backend"""
    try:
        response = requests.post(
            f"{BACKEND_API_URL}/v1/startups/{startup_id}/upload-real-deal-note",
            json={
                "startupId": startup_id,
                "dealNote": deal_note
            }
        )
        
        if response.status_code == 200:
            print(f"Deal note saved successfully for startup {startup_id}")
            return True
        else:
            print(f"Failed to save deal note: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error saving deal note to backend: {e}")
        return False

def main():
    """Main function to run the complete flow"""
    if len(sys.argv) < 4:
        print("Usage: python startup_analyst_integration.py <startup_id> <company_name> <company_website> [pitch_deck_id] [questionnaire_id] [sector]")
        sys.exit(1)
    
    startup_id = sys.argv[1]
    company_name = sys.argv[2]
    company_website = sys.argv[3]
    pitch_deck_id = sys.argv[4] if len(sys.argv) > 4 else None
    questionnaire_id = sys.argv[5] if len(sys.argv) > 5 else None
    sector = sys.argv[6] if len(sys.argv) > 6 else "vr"
    
    print(f"Starting Startup-Analyst integration for {company_name}")
    print(f"Startup ID: {startup_id}")
    print(f"Company Website: {company_website}")
    print(f"Pitch Deck ID: {pitch_deck_id}")
    print(f"Questionnaire ID: {questionnaire_id}")
    print(f"Sector: {sector}")
    
    # Step 1: Download pitch deck if provided
    pitch_deck_path = None
    if pitch_deck_id:
        print("Downloading pitch deck...")
        pitch_deck_path = download_pitch_deck(pitch_deck_id)
        if pitch_deck_path:
            print(f"Pitch deck downloaded to: {pitch_deck_path}")
        else:
            print("Failed to download pitch deck")
    
    # Step 2: Get questionnaire answers if provided
    questionnaire_answers = {}
    if questionnaire_id:
        print("Getting questionnaire answers...")
        questionnaire_answers = get_questionnaire_answers(questionnaire_id)
        if questionnaire_answers:
            print(f"Got {len(questionnaire_answers)} questionnaire answers")
        else:
            print("Failed to get questionnaire answers")
    
    # Step 3: Run Startup-Analyst
    print("Running Startup-Analyst...")
    deal_note = run_startup_analyst(company_name, company_website, pitch_deck_path, questionnaire_answers, sector)
    
    if "error" in deal_note:
        print(f"Startup-Analyst failed: {deal_note['error']}")
        sys.exit(1)
    
    # Step 4: Save deal note to backend
    print("Saving deal note to backend...")
    success = save_deal_note_to_backend(startup_id, deal_note)
    
    if success:
        print("✅ Complete flow successful!")
        print(f"Deal note generated and saved for {company_name}")
        print(f"Score: {deal_note.get('score', {}).get('total', 'N/A')}")
    else:
        print("❌ Failed to save deal note to backend")
        sys.exit(1)

if __name__ == "__main__":
    main()
