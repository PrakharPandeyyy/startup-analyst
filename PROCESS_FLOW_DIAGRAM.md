# 🔄 Process Flow Diagram

## Complete Startup Analyst Platform Process Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STARTUP ANALYST PLATFORM                              │
│                              PROCESS FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   STARTUP   │    │  INVESTOR   │    │   ADMIN     │    │   SYSTEM    │
│   USER      │    │   USER      │    │   USER      │    │   PROCESS   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              1. REGISTRATION & SETUP                            │
└─────────────────────────────────────────────────────────────────────────────────┘

Startup User:
├── Register Account (email, password, company details)
├── Upload Company Information
├── Upload Pitch Deck (PDF)
└── Complete Profile Setup

Investor User:
├── Register Account (email, password, investor details)
├── Set Investment Preferences
└── Access Company Database

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              2. PITCH DECK PROCESSING                           │
└─────────────────────────────────────────────────────────────────────────────────┘

System Process:
├── Upload PDF to Google Cloud Storage
├── Generate Signed URLs for Access
├── Extract Text Content from PDF
├── Auto-generate Questionnaire (5 questions)
└── Store in Firestore Database

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              3. QUESTIONNAIRE & SCHEDULING                      │
└─────────────────────────────────────────────────────────────────────────────────┘

Startup User:
├── Review Auto-generated Questions
├── Schedule Call with Investor
├── Provide Phone Number for Call
└── Wait for Scheduled Call

Investor User:
├── Browse Available Startups
├── Review Pitch Decks
├── Schedule Calls with Startups
└── Conduct Questionnaire Calls

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              4. CALL COMPLETION & DATA COLLECTION               │
└─────────────────────────────────────────────────────────────────────────────────┘

During Call:
├── Investor Asks Questions
├── Startup Provides Answers
├── Answers Recorded in Database
└── Call Marked as Completed

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              5. STARTUP-ANALYST PROCESSING                      │
└─────────────────────────────────────────────────────────────────────────────────┘

System Process:
├── Trigger Startup-Analyst Integration
├── Download Pitch Deck from GCS
├── Extract Text from PDF
├── Load Questionnaire Answers
├── Run Gemini LLM Analysis
├── Generate Comprehensive Deal Note
├── Calculate Investment Score
├── Perform Risk Assessment
├── Generate Competitive Analysis
└── Store Complete Deal Note

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              6. AI AGENT ANALYSIS                               │
└─────────────────────────────────────────────────────────────────────────────────┘

AI Agents:
├── Deal Screener Bot (RAG-based startup discovery)
├── Deep Dive Bot (Detailed analysis of specific startups)
├── Questionnaire Agent (Auto-generates questions from pitch decks)
└── All agents use real deal note data for analysis

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              7. INVESTOR DASHBOARD & DECISIONS                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Investor User:
├── Browse Analyzed Startups
├── View Deal Notes & Scores
├── Use AI Agents for Analysis
├── Compare Startups
├── Make Investment Decisions
└── Track Portfolio

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              8. CONTINUOUS LEARNING                             │
└─────────────────────────────────────────────────────────────────────────────────┘

System Process:
├── Update User Profiles with Deal Note Data
├── Learn from Investment Outcomes
├── Improve AI Agent Responses
├── Refine Scoring Algorithms
└── Enhance Question Generation
```

## Key Process Steps:

### 1. **Startup Onboarding**
- User registration and profile setup
- Pitch deck upload and processing
- Automatic questionnaire generation

### 2. **Investor Engagement**
- Startup discovery and browsing
- Call scheduling and execution
- Data collection and analysis

### 3. **AI Processing**
- Startup-Analyst integration
- Deal note generation
- Score calculation and risk assessment

### 4. **Decision Support**
- AI agent analysis
- Comparative insights
- Investment recommendations

### 5. **Continuous Improvement**
- Data feedback loops
- Model refinement
- System optimization
