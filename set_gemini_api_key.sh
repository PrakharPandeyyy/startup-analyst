#!/bin/bash

# Check if an API key was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <GEMINI_API_KEY>"
  echo "Example: $0 AIzaSyC..."
  exit 1
fi

# Set the API key as an environment variable for the Cloud Run service
gcloud run services update gemini-agent-server \
  --region=us-central1 \
  --set-env-vars="GEMINI_API_KEY=$1"

echo "GEMINI_API_KEY has been set for the gemini-agent-server"
