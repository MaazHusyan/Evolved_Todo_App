# Build arguments
ARG PYTHON_VERSION=3.13
ARG BUILD_DATE
ARG VERSION=1.0.0

# Stage 1: Base with build dependencies
FROM python:${PYTHON_VERSION}-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Dependencies
FROM base AS deps
COPY pyproject.toml ./
COPY src ./src
RUN pip install --no-cache-dir .

# Stage 3: Production
FROM python:${PYTHON_VERSION}-slim AS runner
WORKDIR /app

# Metadata labels
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.title="Evolve Todo App Backend" \
      org.opencontainers.image.description="FastAPI backend for Evolve Todo App" \
      org.opencontainers.image.authors="Evolve Team"

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user with UID 1001
RUN addgroup --gid 1001 --system appuser && \
    adduser --uid 1001 --system --gid 1001 appuser

# Copy installed packages from deps stage
COPY --from=deps /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages

# Copy only required binaries
COPY --from=deps /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY --from=deps /usr/local/bin/python* /usr/local/bin/

# Copy application code
COPY src ./src

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Switch to non-root user
USER appuser

# Expose port 8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
