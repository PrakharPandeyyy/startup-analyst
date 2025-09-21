FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create directory for config
RUN mkdir -p /app/Startup-Analyst

# Copy the Startup-Analyst config
COPY config.py /app/Startup-Analyst/config.py

# Copy the server file
COPY gemini_agent.py .

# Expose port
EXPOSE 8080

# Run the server
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "gemini_agent:app"]
