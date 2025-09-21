# 🚀 Startup Analyst - Hackathon Ready Postman Collection

## 🎯 Overview
Complete, hackathon-ready Postman collection with all endpoints, real startup data, AI agents, and latest features including companyWebsite and phoneNumber support.

## 📁 Files Included
- `Startup_Analyst_Complete_Collection_Hackathon.json` - Complete API collection (v2.2.0)
- `Startup_Analyst_Environment_Hackathon.json` - Environment variables
- `POSTMAN_HACKATHON_SETUP_GUIDE.md` - This setup guide

## 🔧 Quick Setup Instructions

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Startup_Analyst_Complete_Collection_Hackathon.json`
4. Click **Import**

### Step 2: Import Environment
1. In Postman, click the **Environments** tab
2. Click **Import**
3. Select `Startup_Analyst_Environment_Hackathon.json`
4. Click **Import**
5. Select **Startup Analyst Environment (Hackathon)** from the dropdown

### Step 3: Verify Environment Variables
All variables are pre-configured with real data:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `https://analyst-backend-549120538825.us-central1.run.app` | Backend API URL |
| `agent_base_url` | `https://gemini-agent-server-549120538825.us-central1.run.app` | AI Agent Server URL |
| `hexafun_user_id` | `jqhq39c1tSUXzoqXjoBI` | Real Hexafun startup ID |
| `hexafun_deal_note_id` | `5MoFzvIyBxPVtqbnkiqL` | Real Hexafun deal note ID |
| `multipl_user_id` | `egW359aftDqogWhkQZ2C` | Real Multipl startup ID |
| `ctruth_user_id` | `hPHEGaQA1Edp5IojQZeX` | Real Ctruth startup ID |
| `ctruth_pitch_deck_id` | `LluhISFp0cv4mGkcdmhQ` | Real Ctruth pitch deck ID |
| `ctruth_questionnaire_id` | `Et07Qz5WS9l7tNYYeFWe` | Real Ctruth questionnaire ID |
| `ctruth_deal_note_id` | `cywJ53sfZZqs3xfr5TLP` | Real Ctruth deal note ID |
| `ctruth_website` | `https://www.ctruh.com/` | Real Ctruth website |
| `test_phone_number` | `+1234567890` | Test phone number |
| `test_email` | `test@example.com` | Test email |
| `test_company_website` | `https://testcompany.com` | Test company website |

## 🎯 API Endpoints Overview

### 🔐 Authentication (3 endpoints)
- **POST** `/v1/auth/register` - Register new user with companyWebsite
- **POST** `/v1/auth/login` - Login user
- **GET** `/v1/auth/me` - Get current user

### 👥 User Management (3 endpoints)
- **POST** `/v1/users` - Create user with companyWebsite
- **GET** `/v1/users/:id` - Get user by ID
- **PUT** `/v1/users/:id` - Update user with companyWebsite

### 🏢 Company Browsing (2 endpoints)
- **GET** `/v1/companies` - Get all companies with websites
- **GET** `/v1/companies/:id` - Get company by ID with website

### 🔍 RAG Search (1 endpoint)
- **POST** `/v1/rag/search` - Search deal notes with startup filtering

### 🚀 Startup Flow (6 endpoints)
- **POST** `/v1/startups/upload-pitch` - Upload pitch deck (auto-generates questionnaire)
- **GET** `/v1/startups/:id/questionnaire` - Get AI-generated questionnaire
- **POST** `/v1/startups/:id/questionnaire/answers` - Submit questionnaire answers
- **POST** `/v1/startup-analyst/trigger/:id` - Trigger Startup-Analyst
- **GET** `/v1/deal-notes/:id` - Get deal note by ID
- **GET** `/v1/startups/deal-notes` - Get all deal notes

### 📅 Scheduling (2 endpoints)
- **POST** `/v1/scheduler/schedule-call` - Schedule call with phoneNumber
- **GET** `/v1/scheduler/calls/:startupId` - Get scheduled calls

### 📁 File Operations (1 endpoint)
- **GET** `/v1/files/pitch-deck/:id/download-url` - Get signed download URL

### 🤖 AI Chatbots (3 endpoints)
- **POST** `/v1/bots/screener/:sessionId/message` - Deal screener bot
- **POST** `/v1/bots/deep-dive/:sessionId/message` - Deep dive bot
- **POST** `/v1/bots/questionnaire/generate` - Generate questionnaire

### 🧠 Startup Analyst Integration (1 endpoint)
- **POST** `/v1/startup-analyst/trigger/:id` - Real Startup-Analyst integration

### 🔧 Health & Status (1 endpoint)
- **GET** `/v1/health` - System health check

## 🎯 **Total: 23 Endpoints**

## 🚀 **Demo Flow for Hackathon**

### **1. Complete Startup Flow (Ctruth Example)**
1. **Upload Pitch Deck** → `POST /v1/startups/upload-pitch`
2. **Get Generated Questions** → `GET /v1/startups/{{ctruth_user_id}}/questionnaire`
3. **Submit Answers** → `POST /v1/startups/{{ctruth_user_id}}/questionnaire/answers`
4. **Trigger Analysis** → `POST /v1/startup-analyst/trigger/{{ctruth_user_id}}`
5. **View Deal Note** → `GET /v1/deal-notes/{{ctruth_deal_note_id}}`

### **2. Investor Experience**
1. **Browse Companies** → `GET /v1/companies`
2. **View Specific Company** → `GET /v1/companies/{{hexafun_user_id}}`
3. **Search Startups** → `POST /v1/rag/search`
4. **Chat with AI** → `POST /v1/bots/screener/healthcare-session/message`
5. **Deep Dive Analysis** → `POST /v1/bots/deep-dive/hexafun-analysis/message`

### **3. AI Agent Integration**
1. **Deal Screener** → Filters and finds relevant startups
2. **Deep Dive** → Provides detailed analysis of specific startups
3. **Questionnaire Generator** → Creates custom questions from pitch decks
4. **Startup Analyst** → Generates comprehensive deal notes

## 🏆 **Key Features for Hackathon Demo**

### ✅ **Real Data Integration**
- **Hexafun:** Real startup with deal note (score, insights, risks)
- **Multipl:** Real startup data
- **Ctruth:** Complete flow with pitch deck, questionnaire, and deal note

### ✅ **AI-Powered Features**
- **Auto-generated questionnaires** from pitch deck content
- **Comprehensive deal note generation** via Startup-Analyst
- **Intelligent chatbot responses** for investor queries
- **RAG-powered search** through deal notes

### ✅ **Modern Architecture**
- **RESTful API design** with proper HTTP methods
- **Real-time data processing** with AI agents
- **Scalable cloud infrastructure** (Google Cloud Run)
- **Secure authentication** and data handling

### ✅ **Complete User Journey**
- **Founder onboarding:** Upload → Answer → Schedule → Analyze
- **Investor discovery:** Browse → Search → Chat → Deep dive
- **AI assistance:** Throughout the entire process

## 🎯 **Ready for Hackathon Submission!**

This collection demonstrates:
- **End-to-end functionality** with real data
- **AI integration** with multiple specialized agents
- **Modern tech stack** and architecture
- **Complete user workflows** for both founders and investors
- **Production-ready** API design and implementation

**Perfect for impressing hackathon judges with a comprehensive, working system!** 🚀
