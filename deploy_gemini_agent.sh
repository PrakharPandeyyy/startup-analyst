#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Configuration
PROJECT_ID="startup-analyst-dev-f6c623"
SERVICE_NAME="gemini-agent-server"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
BACKEND_API_URL="https://analyst-backend-549120538825.us-central1.run.app" # Replace with your actual backend URL

echo "Building and deploying container to Cloud Run service [${SERVICE_NAME}] in project [${PROJECT_ID}] region [${REGION}]"

# Create a temporary directory for deployment
mkdir -p tmp_deploy
cp agents-python/minimal/gemini_agent.py tmp_deploy/gemini_agent.py
cp agents-python/minimal/requirements.txt tmp_deploy/requirements.txt
cp agents-python/minimal/Dockerfile tmp_deploy/Dockerfile
cp Startup-Analyst/config.py tmp_deploy/config.py # Copy config.py

# Build and deploy to Cloud Run
gcloud run deploy "${SERVICE_NAME}" \
  --source tmp_deploy \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --set-env-vars="BACKEND_API_URL=${BACKEND_API_URL}" \
  --memory="4Gi" \
  --timeout="300" \
  --quiet

# Clean up temporary directory
rm -rf tmp_deploy

echo "Deployment complete!"
