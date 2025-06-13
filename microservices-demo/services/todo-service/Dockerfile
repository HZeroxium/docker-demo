# Builder stage
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Final stage
FROM python:3.12-slim
WORKDIR /app
# Fix: Use correct Python version path
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

EXPOSE 8000 50052
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
