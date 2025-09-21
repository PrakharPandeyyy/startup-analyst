#!/bin/bash

# Test script for Postman collection endpoints
BASE_URL="https://analyst-backend-549120538825.us-central1.run.app"

echo "🧪 Testing Postman Collection Endpoints"
echo "========================================"

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s "$BASE_URL/v1/health" | jq .
echo ""

# Test 2: Get All Companies (Investor View)
echo "2. Testing Get All Companies..."
curl -s -H "x-debug-role: investor" "$BASE_URL/v1/companies" | jq '.total'
echo ""

# Test 3: Get Hexafun Details
echo "3. Testing Get Hexafun Details..."
curl -s -H "x-debug-role: investor" "$BASE_URL/v1/companies/jqhq39c1tSUXzoqXjoBI" | jq '.name, .category, .score'
echo ""

# Test 4: Search Hexafun
echo "4. Testing Search Hexafun..."
curl -s -X POST -H "Content-Type: application/json" -H "x-debug-role: investor" \
  -d '{"query": "Hexafun"}' "$BASE_URL/v1/rag/search" | jq '.total'
echo ""

# Test 5: Get Hexafun Deal Note
echo "5. Testing Get Hexafun Deal Note..."
curl -s -H "x-debug-role: investor" "$BASE_URL/v1/companies/jqhq39c1tSUXzoqXjoBI/deal-note" | jq '.dealNote.company, .dealNote.score.total'
echo ""

echo "✅ All tests completed!"
echo "📋 Postman collection is ready to use!"
