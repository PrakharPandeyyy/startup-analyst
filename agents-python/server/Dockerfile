FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY agents-python/server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python agent codebases
COPY Startup-Analyst /app/Startup-Analyst
COPY Startup-Chatbot /app/Startup-Chatbot

# Copy the server files
COPY agents-python/server/startup_chatbot_server.py .
COPY agents-python/server/startup_analyst_server.py .

# Set environment variables
ENV PYTHONPATH=/app:/app/Startup-Analyst:/app/Startup-Chatbot
ENV PORT=8080

# Expose port
EXPOSE 8080

# Use ARG to make the CMD configurable at build time
ARG SERVER_FILE=startup_chatbot_server.py
ENV SERVER_FILE=${SERVER_FILE}

# Run the server
CMD python ${SERVER_FILE}
