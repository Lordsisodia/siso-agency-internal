# Vibe Kanban Webhook Server Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy webhook server
COPY webhook-server.py .

# Create log directories
RUN mkdir -p /app/.blackbox/9-brain/incoming/vibe-kanban-tasks
RUN mkdir -p /app/.blackbox/9-brain/incoming/git-commits
RUN mkdir -p /app/.blackbox/.plans/active/vibe-kanban-work

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Run server
CMD ["python", "webhook-server.py"]
