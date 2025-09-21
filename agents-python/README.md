# Startup Analyst Python Agents

This directory contains the Python agent servers that wrap the Startup-Analyst and Startup-Chatbot agents.

## Directory Structure

```
agents-python/
  - docker/                  # Docker configuration files
    - Dockerfile.startup-analyst
    - Dockerfile.startup-chatbot
    - docker-compose.yml
  - server/                  # HTTP server wrappers
    - startup_analyst_server.py
    - chatbot_server.py
    - requirements.txt
  - credentials/             # GCP service account credentials (not in git)
```

## Prerequisites

- Python 3.11+
- Docker and Docker Compose (for containerized deployment)
- Google Cloud Platform service account credentials

## Setup

1. Place your GCP service account credentials in `credentials/service-account.json`

2. Install dependencies:

```bash
cd server
pip install -r requirements.txt
```

## Running Locally

### Startup Analyst Server

```bash
cd server
python startup_analyst_server.py
```

The server will be available at http://localhost:8000

### Chatbot Server

```bash
cd server
python chatbot_server.py
```

The server will be available at http://localhost:8001

## Running with Docker

```bash
cd docker
docker-compose up -d
```

This will start both servers in the background.

## API Endpoints

### Startup Analyst Server

- `GET /health` - Health check
- `POST /api/ingestion` - Run ingestion agent
- `POST /api/deep-research` - Run deep research agent
- `POST /api/deal-scoring` - Run deal scoring agent
- `POST /api/full-analysis` - Run full analysis pipeline

### Chatbot Server

- `GET /health` - Health check
- `POST /api/bots/screener` - Run deal screener bot
- `POST /api/bots/deep-dive` - Run deep dive bot
- `POST /api/questionnaire` - Generate questionnaire
- `POST /api/questionnaire/assist` - Get questionnaire assistance

## Integration with Backend

The Node.js backend communicates with these servers via HTTP. The connection details are configured in the backend's environment variables:

- `AGENT_BASE_URL` - Base URL for the agent servers (e.g., `http://localhost:8000` for local development)
