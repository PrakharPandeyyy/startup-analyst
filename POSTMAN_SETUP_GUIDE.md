# 🚀 Startup Analyst - Postman Collection Setup Guide

## �� Overview
This guide will help you set up and use the complete Startup Analyst API collection with all endpoints, real startup data, and phone number support.

## 📁 Files Included
- `Updated_Startup_Analyst_Complete.postman_collection.json` - Complete API collection
- `Startup_Analyst_Environment.postman_environment.json` - Environment variables
- `POSTMAN_SETUP_GUIDE.md` - This setup guide

## 🔧 Setup Instructions

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Updated_Startup_Analyst_Complete.postman_collection.json`
4. Click **Import**

### Step 2: Import Environment
1. In Postman, click the **Environments** tab
2. Click **Import**
3. Select `Startup_Analyst_Environment.postman_environment.json`
4. Click **Import**
5. Select the **Startup Analyst Environment** from the dropdown

### Step 3: Verify Environment Variables
The following variables are pre-configured:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `https://analyst-backend-549120538825.us-central1.run.app` | Backend API URL |
| `agent_base_url` | `https://gemini-agent-server-549120538825.us-central1.run.app` | AI Agent Server URL |
| `hexafun_user_id` | `jqhq39c1tSUXzoqXjoBI` | Real Hexafun startup ID |
| `hexafun_deal_note_id` | `5MoFzvIyBxPVtqbnkiqL` | Real Hexafun deal note ID |
| `multipl_user_id` | `egW359aftDqogWhkQZ2C` | Real Multipl startup ID |
| `test_phone_number` | `+1234567890` | Test phone number |
| `test_email` | `test@example.com` | Test email |

## 🎯 API Endpoints Overview

### 🔐 Authentication
- **POST** `/v1/auth/register` - Register new user
- **POST** `/v1/auth/login` - Login user
- **GET** `/v1/auth/me` - Get current user

### 👥 User Management
- **POST** `/v1/users` - Create user
- **GET** `/v1/users/:id` - Get user by ID
- **PUT** `/v1/users/:id` - Update user

### 🏢 Company Browsing (Investor)
- **GET** `/v1/companies` - Get all companies
- **GET** `/v1/companies/:id` - Get company by ID

### 🔍 RAG Search
- **POST** `/v1/rag/search` - Search deal notes

### 🚀 Startup Operations
- **POST** `/v1/startups/upload-pitch` - Upload pitch deck
- **GET** `/v1/startups/:id/questionnaire` - Get questionnaire
- **POST** `/v1/startups/save-answers` - Save questionnaire answers
- **POST** `/v1/startups/generate-deal-note` - Generate deal note
- **GET** `/v1/startups/:id/deal-note` - Get deal note
- **POST** `/v1/startups/:id/upload-real-deal-note` - Upload real deal note
- **GET** `/v1/startups/deal-notes` - Get all deal notes
- **GET** `/v1/deal-notes/:id` - Get deal note by ID

### 📅 Scheduling (with Phone Number Support)
- **GET** `/v1/scheduler/available-slots` - Get available time slots
- **POST** `/v1/scheduler/schedule-call` - Schedule call (with optional phone number)
- **GET** `/v1/scheduler/calls/:startupId` - Get scheduled calls for startup

### 📁 File Operations
- **GET** `/v1/files/pitch-deck/:id/download-url` - Get pitch deck download URL

### 🤖 AI Chatbots
- **POST** `/v1/bots/screener/:sessionId/message` - Deal screener bot
- **POST** `/v1/bots/deep-dive/:sessionId/message` - Deep dive bot
- **POST** `/v1/bots/questionnaire/:sessionId/message` - Questionnaire bot

### 🎯 Direct Agent Calls
- **POST** `/api/bots/screener` - Direct deal screener agent
- **POST** `/api/bots/deep-dive` - Direct deep dive agent
- **POST** `/api/bots/questionnaire` - Direct questionnaire agent

## 🧪 Testing Workflow

### 1. Test Authentication
```bash
# Register a new user
POST /v1/auth/register
{
  "email": "{{test_email}}",
  "username": "{{test_username}}",
  "password": "{{test_password}}",
  "firstName": "{{test_first_name}}",
  "lastName": "{{test_last_name}}",
  "companyName": "{{test_company_name}}",
  "phoneNumber": "{{test_phone_number}}",
  "role": "startup"
}
```

### 2. Test Real Startup Data
```bash
# Get Hexafun startup details
GET /v1/companies/{{hexafun_user_id}}

# Get Hexafun deal note
GET /v1/deal-notes/{{hexafun_deal_note_id}}
```

### 3. Test Scheduling with Phone Number
```bash
# Schedule call with phone number
POST /v1/scheduler/schedule-call
{
  "startupId": "{{hexafun_user_id}}",
  "questionnaireId": "test_questionnaire_123",
  "scheduledTime": "2024-02-15T10:00:00Z",
  "phoneNumber": "{{test_phone_number}}"
}
```

### 4. Test AI Chatbots
```bash
# Deal screener with real data
POST /v1/bots/screener/test-session/message
{
  "text": "Show me healthcare AI startups"
}

# Deep dive with real deal note
POST /v1/bots/deep-dive/test-session/message
{
  "text": "Tell me about the company's competitive moat",
  "dealNoteId": "{{hexafun_deal_note_id}}"
}
```

## 🔑 Key Features

### ✅ Phone Number Support
- All scheduling endpoints now support optional phone numbers
- Phone numbers are stored and returned in API responses
- Backward compatible with existing calls

### ✅ Real Startup Data
- **Hexafun**: Healthcare AI startup with complete deal note
- **Multipl**: Fintech startup with pitch deck
- **Naario**: Additional startup for testing

### ✅ AI Agent Integration
- Deal screener fetches all deal notes and filters them
- Deep dive analyzes specific deal notes
- Questionnaire generates questions from pitch deck content

### ✅ Complete CRUD Operations
- User management with authentication
- Company browsing for investors
- Deal note management
- File operations with signed URLs

## 🚨 Important Notes

1. **Environment Variables**: Always use the environment variables (e.g., `{{base_url}}`) instead of hardcoded URLs
2. **Headers**: Some endpoints require `x-debug-role: investor` header
3. **Real Data**: The collection includes real startup IDs and deal note IDs from our database
4. **Phone Numbers**: Phone number field is optional in scheduling endpoints
5. **Authentication**: Some endpoints may require authentication tokens

## 🔧 Troubleshooting

### Common Issues:
1. **404 Errors**: Check if environment variables are set correctly
2. **Authentication Errors**: Ensure you're logged in and using correct headers
3. **Empty Responses**: Some endpoints return empty arrays when no data exists
4. **Agent Timeouts**: AI agents may take 10-30 seconds to respond

### Debug Headers:
- `x-debug-role: investor` - For investor-facing endpoints
- `Content-Type: application/json` - For all POST requests

## 📞 Support
If you encounter any issues, check:
1. Environment variables are correctly set
2. All services are deployed and running
3. Network connectivity to Cloud Run services
4. Request body format matches the examples

---

**Ready to test! 🚀** Import the collection and environment, then start with the authentication endpoints.
