FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# The ML models were saved to /models so we must copy them
COPY models/ ./models/
COPY ml/ ./ml/
COPY data/ ./data/

# Environment variables
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python", "ml/app.py"]
