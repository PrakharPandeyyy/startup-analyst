# 🚀 Startup Analyst Platform

A comprehensive AI-powered platform for startup analysis, deal screening, and investment decision-making. Built for hackathon demonstration with real company data and professional-grade analysis capabilities.

## 🎯 Overview

The Startup Analyst Platform is a full-stack application that combines AI agents, comprehensive data analysis, and real-time deal screening to provide investors with actionable insights for startup evaluation.

### ✨ Key Features

- **🤖 AI-Powered Analysis**: Multi-agent system for comprehensive startup evaluation
- **📊 Real Company Data**: Professional deal notes for Hexafun, Multipl, Ctruth, AI Solutions, and HealthTech
- **🔍 Deal Screening**: Intelligent filtering and search through startup portfolios
- **📋 Questionnaire Generation**: Automated question generation based on pitch deck content
- **📈 Deep Dive Analysis**: Detailed startup analysis with scoring and risk assessment
- **🌐 RESTful API**: 23 endpoints for complete workflow management
- **☁️ Cloud Ready**: Deployed on Google Cloud Run with Firestore integration

## 🏗️ Architecture

### Backend (Node.js/TypeScript)
- **Express.js** server with TypeScript
- **Firestore** database integration
- **Google Cloud Storage** for file management
- **CORS** enabled for frontend integration
- **Authentication** with bcrypt password hashing

### AI Agents (Python/Flask)
- **Deal Screener Bot**: Filters and searches startup portfolios
- **Deep Dive Agent**: Provides detailed startup analysis
- **Questionnaire Agent**: Generates questions from pitch deck content
- **Gemini API** integration for all LLM operations

### Startup-Analyst (Python)
- **Multi-agent orchestration** for comprehensive analysis
- **LangChain** integration for document processing
- **Real-time scoring** and risk assessment
- **Competitive benchmarking** and market analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Google Cloud Project
- Firestore database
- Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PrakharPandeyyy/startup-analyst.git
cd startup-analyst
```

2. **Backend Setup**
```bash
cd backend
npm install
npm run build
```

3. **AI Agents Setup**
```bash
cd agents-python/minimal
pip install -r requirements.txt
```

4. **Startup-Analyst Setup**
```bash
cd Startup-Analyst
pip install -r requirements.txt
```

### Environment Configuration

Create environment variables for:
- `GEMINI_API_KEY`: Your Gemini API key
- `GOOGLE_CLOUD_PROJECT_ID`: Your GCP project ID
- `FIREBASE_SERVICE_ACCOUNT`: Service account JSON

## 📊 API Endpoints

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `GET /v1/auth/me` - Get current user

### User Management
- `POST /v1/users` - Create user
- `GET /v1/users/:id` - Get user by ID
- `PUT /v1/users/:id` - Update user

### Company Browsing
- `GET /v1/companies` - List all companies
- `GET /v1/companies/:id` - Get company details

### Startup Workflow
- `POST /v1/startups/upload-pitch` - Upload pitch deck
- `GET /v1/startups/:id/questionnaire` - Get questionnaire
- `POST /v1/startups/:id/answers` - Submit answers
- `GET /v1/startups/:id/deal-note` - Get deal note

### AI Agents
- `POST /v1/bots/screener/:sessionId/message` - Deal screener chat
- `POST /v1/bots/deep-dive/:sessionId/message` - Deep dive analysis
- `POST /v1/bots/questionnaire/generate` - Generate questionnaire

### RAG Search
- `POST /v1/rag/search` - Search through deal notes

### Scheduling
- `POST /v1/scheduler/schedule-call` - Schedule a call
- `GET /v1/scheduler/calls/:startupId` - Get scheduled calls

### Files
- `GET /v1/files/pitch-deck/:pitchDeckId/download-url` - Get download URL

## 🔄 Complete Workflow

### 1. User Registration & Login
```bash
# Register new user
curl -X POST "https://your-api-url/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "investor1",
    "email": "investor@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Investment Firm",
    "phoneNumber": "+1234567890",
    "companyWebsite": "https://example.com"
  }'
```

### 2. Upload Pitch Deck
```bash
# Upload pitch deck (triggers questionnaire generation)
curl -X POST "https://your-api-url/v1/startups/upload-pitch" \
  -H "Content-Type: application/json" \
  -d '{
    "startupId": "user_id",
    "fileName": "startup_pitch.pdf",
    "fileSize": 1024000
  }'
```

### 3. Generate & Answer Questionnaire
```bash
# Get generated questionnaire
curl -X GET "https://your-api-url/v1/startups/user_id/questionnaire"

# Submit answers
curl -X POST "https://your-api-url/v1/startups/user_id/answers" \
  -H "Content-Type: application/json" \
  -d '{
    "questionnaireId": "questionnaire_id",
    "answers": [
      {"questionId": "q1", "answer": "Our target market is..."},
      {"questionId": "q2", "answer": "We have 1000+ users..."}
    ]
  }'
```

### 4. Schedule Call
```bash
# Schedule a call
curl -X POST "https://your-api-url/v1/scheduler/schedule-call" \
  -H "Content-Type: application/json" \
  -d '{
    "startupId": "user_id",
    "scheduledTime": "2024-01-15T10:00:00Z",
    "phoneNumber": "+1234567890"
  }'
```

### 5. Generate Deal Note
```bash
# Trigger Startup-Analyst for deal note generation
curl -X POST "https://your-api-url/v1/startup-analyst/trigger/user_id" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Startup Name",
    "companyWebsite": "https://startup.com",
    "pitchDeckId": "pitch_deck_id",
    "questionnaireId": "questionnaire_id"
  }'
```

### 6. Deal Screening
```bash
# Use deal screener bot
curl -X POST "https://your-api-url/v1/bots/screener/session123/message" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Show me fintech startups with high growth potential"
  }'
```

### 7. Deep Dive Analysis
```bash
# Get detailed analysis
curl -X POST "https://your-api-url/v1/bots/deep-dive/session456/message" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Analyze the market opportunity and competitive landscape",
    "dealNoteId": "deal_note_id"
  }'
```

## 📈 Sample Data

The platform includes real company data for demonstration:

### 🏢 Companies Available
- **Hexafun** - Fashion & Lifestyle (Score: 86.25)
- **Multipl** - Fintech (Score: 86.25)
- **Ctruth Technologies** - VR/AR Technology (Score: 88.75)
- **AI Solutions** - Artificial Intelligence (Score: 90.5)
- **HealthTech Innovations** - Healthcare Technology (Score: 85.75)

### 📊 Deal Note Structure
Each deal note includes:
- **Company Information**: Name, sector, description
- **Founder Details**: Background, experience, LinkedIn
- **Traction Metrics**: Revenue, users, growth metrics
- **Unit Economics**: CAC, LTV, margins
- **Market Analysis**: Target market, size, competition
- **Product Details**: Features, pricing, plans
- **Scoring**: Comprehensive scoring with breakdown
- **Benchmarks**: Competitive analysis with peers
- **Risk Assessment**: Identified risks with severity
- **Sources**: Data sources and citations

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### AI Agents Development
```bash
cd agents-python/minimal
python gemini_agent.py  # Start agent server
```

### Startup-Analyst Development
```bash
cd Startup-Analyst
python main.py       # Run analysis system
```

## 🚀 Deployment

### Google Cloud Run
```bash
# Deploy backend
gcloud run deploy analyst-backend --source backend

# Deploy AI agents
gcloud run deploy gemini-agent-server --source agents-python/minimal
```

### Environment Variables
Set the following in your deployment:
- `GEMINI_API_KEY`
- `GOOGLE_CLOUD_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `AGENT_BASE_URL`
- `CHATBOT_BASE_URL`

## 📚 Documentation

- **API Documentation**: Complete endpoint documentation with examples
- **Postman Collection**: Ready-to-use API collection with environment variables
- **Setup Guide**: Step-by-step setup instructions
- **Architecture Diagrams**: System design and data flow diagrams

## 🧪 Testing

### Postman Collection
Import the provided Postman collection:
- `Startup_Analyst_Complete_Collection_Hackathon.json`
- `Startup_Analyst_Environment_Hackathon.json`

### API Testing
```bash
# Test health endpoint
curl -X GET "https://your-api-url/v1/health"

# Test authentication
curl -X POST "https://your-api-url/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Hackathon Demo

This platform is designed for hackathon demonstration with:
- **Real company data** for authentic analysis
- **Professional UI/UX** for investor presentation
- **Complete workflow** from pitch deck to deal note
- **AI-powered insights** for decision making
- **Scalable architecture** for production deployment

## 📞 Support

For questions or support, please contact:
- **Email**: prakhar@example.com
- **GitHub**: [PrakharPandeyyy](https://github.com/PrakharPandeyyy)

---

**Built with ❤️ for the Google Hackathon 2024**
