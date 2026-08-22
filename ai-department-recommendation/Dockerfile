FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Models are inside the ml/ folder now
COPY ml/ ./ml/

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/ml

# Run with Gunicorn, binding to dynamic $PORT (defaults to 5000 if not set)
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} ml.app:app
