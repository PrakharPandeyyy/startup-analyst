#!/bin/bash

# Deploy Firestore indexes
echo "Deploying Firestore indexes..."

# Set the project ID
PROJECT_ID="startup-analyst-dev-f6c623"

# Deploy the indexes
gcloud firestore indexes composite create --project=$PROJECT_ID --file=firestore.indexes.json

echo "Firestore indexes deployed successfully!"
