# Integration Guide - Professional Enhancements

**Project**: Evolve Todo App
**Date**: 2026-02-12
**Purpose**: Step-by-step guide to integrate all professional enhancements

---

## Overview

This guide provides exact steps to integrate all professional enhancements into the application. Follow these steps in order for a smooth integration.

---

## Backend Integration

### Step 1: Install Required Dependencies

```bash
cd backend

# Add to requirements.txt or install directly
pip install structlog prometheus-client python-multipart

# Or add to requirements.txt:
echo "structlog>=23.1.0" >> requirements.txt
echo "prometheus-client>=0.19.0" >> requirements.txt
echo "python-multipart>=0.0.6" >> requirements.txt

pip install -r requirements.txt
```

### Step 2: Update main.py

Add the following imports at the top of `backend/src/main.py`:

```python
# Add these imports after existing imports
from fastapi.responses import Response
from .middleware.error_handler import ErrorHandlerMiddleware
from .core.metrics import MetricsMiddleware, get_metrics, get_metrics_content_type
from .api.health import router as health_router
from .core.logging import configure_logging
```

Add middleware configuration after app creation:

```python
# After: app = FastAPI(...)

# Configure structured logging
configure_logging(log_level="INFO", json_logs=True)

# Add error handler middleware (should be first)
app.add_middleware(ErrorHandlerMiddleware)

# Add metrics middleware
app.add_middleware(MetricsMiddleware)
```

Add health check router:

```python
# After: app.include_router(chat_router)

# Add health check endpoints
app.include_router(health_router)
```

Add metrics endpoint:

```python
# After health router, before MCP server mounting

@app.get("/metrics")
async def metrics_endpoint():
    """Prometheus metrics endpoint."""
    return Response(
        content=get_metrics(),
        media_type=get_metrics_content_type()
    )
```

### Step 3: Update Environment Variables

Add to `.env`:

```bash
# Logging Configuration
LOG_LEVEL=INFO
JSON_LOGS=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=8001
```

### Step 4: Test Backend Integration

```bash
# Start the server
uvicorn src.main:app --reload

# Test health checks
curl http://localhost:8001/health
curl http://localhost:8001/health/live
curl http://localhost:8001/health/ready

# Test metrics
curl http://localhost:8001/metrics

# Test error handling (should return structured error)
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
```

Expected responses:
- Health checks: JSON with status and checks
- Metrics: Prometheus text format
- Error: RFC 7807 Problem Details format

---

## Frontend Integration

### Step 1: Install Required Dependencies

```bash
cd frontend

# No additional dependencies needed
# All components use existing dependencies
```

### Step 2: Update Root Layout

Edit `frontend/src/app/layout.jsx`:

```jsx
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkipLink } from '@/hooks/useAccessibility';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <SkipLink />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Step 3: Add Global Styles

Add to `frontend/src/app/globals.css`:

```css
/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Focus visible styles */
*:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Skip link styles */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #9333ea;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Step 4: Use Skeleton Components

Example usage in a page:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { TaskListSkeleton } from '@/components/Skeleton';

export default function TasksPage() {
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <TaskListSkeleton count={5} />;
  }

  return (
    <div>
      {/* Your task list */}
    </div>
  );
}
```

### Step 5: Add Accessibility

Example usage in interactive components:

```jsx
'use client';

import { useFocusTrap, useKeyboardNavigation } from '@/hooks/useAccessibility';

export default function Modal({ isOpen, onClose, children }) {
  const containerRef = useFocusTrap(isOpen);

  return isOpen ? (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  ) : null;
}
```

### Step 6: Test Frontend Integration

```bash
# Start development server
npm run dev

# Manual testing:
# 1. Navigate with keyboard only (Tab, Shift+Tab)
# 2. Trigger an error to see ErrorBoundary
# 3. Check loading states show skeletons
# 4. Test with screen reader
# 5. Check focus management in modals
```

---

## Database Integration

### Step 1: Create Migration (if needed)

```bash
cd backend

# Create new migration
alembic revision -m "add_monitoring_tables"

# Edit migration file if needed
# Run migration
alembic upgrade head
```

### Step 2: Verify Database

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Verify indexes
\di
```

---

## Monitoring Setup

### Step 1: Prometheus Configuration

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'evolve-todo-api'
    static_configs:
      - targets: ['localhost:8001']
    metrics_path: '/metrics'
```

### Step 2: Start Prometheus

```bash
# Using Docker
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Access Prometheus UI
open http://localhost:9090
```

### Step 3: Grafana Dashboard (Optional)

```bash
# Start Grafana
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana

# Access Grafana
open http://localhost:3000
# Default credentials: admin/admin

# Add Prometheus data source
# Import dashboard for FastAPI metrics
```

---

## Testing Integration

### Backend Tests

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Test specific enhancements
pytest tests/unit/test_health.py -v
pytest tests/unit/test_error_handling.py -v
```

### Frontend Tests

```bash
cd frontend

# Run tests (if configured)
npm test

# Run E2E tests (if configured)
npm run test:e2e

# Manual accessibility testing
npm run dev
# Use axe DevTools or Lighthouse
```

### Load Testing

```bash
# Install locust
pip install locust

# Create locustfile.py
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class TodoUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def health_check(self):
        self.client.get("/health")

    @task(3)
    def get_tasks(self):
        self.client.get("/api/tasks")
EOF

# Run load test
locust -f locustfile.py --host=http://localhost:8001
# Open http://localhost:8089
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health checks working
- [ ] Metrics endpoint accessible
- [ ] Error handling tested
- [ ] Accessibility tested
- [ ] Load testing completed
- [ ] Security audit done

### Deployment Steps

1. **Staging Deployment**
   ```bash
   # Deploy to staging
   git checkout staging
   git merge main
   git push origin staging

   # Verify staging
   curl https://staging-api.evolve-todo.com/health
   ```

2. **Production Deployment**
   ```bash
   # Deploy to production
   git checkout production
   git merge staging
   git push origin production

   # Verify production
   curl https://api.evolve-todo.com/health
   ```

3. **Post-Deployment**
   - Monitor metrics for 1 hour
   - Check error rates
   - Verify health checks
   - Test critical paths
   - Monitor user feedback

### Rollback Plan

```bash
# If issues occur, rollback immediately
git revert HEAD
git push origin production

# Or use platform-specific rollback
# Vercel: Use dashboard to rollback
# Heroku: heroku rollback
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Request Rate**: Requests per second
2. **Error Rate**: Errors per minute
3. **Response Time**: P50, P95, P99 latency
4. **Database**: Query duration, connection pool
5. **AI Service**: Tool call duration, success rate

### Alert Thresholds

```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical

  - name: SlowResponses
    condition: p95_latency > 2s
    duration: 5m
    severity: warning

  - name: DatabaseDown
    condition: health_check_database == "unhealthy"
    duration: 1m
    severity: critical
```

---

## Troubleshooting

### Issue: Middleware Not Working

**Symptom**: Error handling or metrics not working

**Solution**:
```python
# Check middleware order in main.py
# ErrorHandlerMiddleware should be FIRST
app.add_middleware(ErrorHandlerMiddleware)  # First
app.add_middleware(MetricsMiddleware)       # Second
app.add_middleware(CORSMiddleware)          # Third
```

### Issue: Health Check Fails

**Symptom**: `/health` returns 503

**Solution**:
```bash
# Check database connection
psql $DATABASE_URL

# Check logs
tail -f backend.log | grep health

# Verify database credentials in .env
```

### Issue: Metrics Not Appearing

**Symptom**: `/metrics` returns empty or 404

**Solution**:
```python
# Verify metrics endpoint is registered
# Check main.py has metrics endpoint

# Test metrics directly
from src.core.metrics import get_metrics
print(get_metrics())
```

### Issue: Frontend Error Boundary Not Catching

**Symptom**: Errors crash the app

**Solution**:
```jsx
// Verify ErrorBoundary wraps entire app
// Check it's a class component (not functional)
// Ensure it's in the root layout
```

---

## Performance Optimization

### Backend

```python
# Enable response compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Optimize database queries
# Use select_related/prefetch_related equivalent
# Add database indexes

# Enable caching (future enhancement)
# from fastapi_cache import FastAPICache
# from fastapi_cache.backends.redis import RedisBackend
```

### Frontend

```javascript
// Enable code splitting
// Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Optimize images
// Use Next.js Image component
import Image from 'next/image';

// Enable PWA (future enhancement)
// Add service worker
```

---

## Security Hardening

### Backend

```python
# Add rate limiting per endpoint
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/tasks")
@limiter.limit("100/minute")
async def create_task(...):
    pass
```

### Frontend

```javascript
// Add Content Security Policy
// In next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  }
];
```

---

## Documentation

### API Documentation

Access at: `http://localhost:8001/docs`

Features:
- Interactive API testing
- Request/response examples
- Schema documentation
- Authentication testing

### Metrics Documentation

Access at: `http://localhost:9090` (Prometheus)

Available metrics:
- `http_requests_total` - Total requests
- `http_request_duration_seconds` - Request duration
- `tasks_created_total` - Tasks created
- `chat_messages_total` - Chat messages
- `errors_total` - Error count

---

## Next Steps

1. **Immediate**:
   - [ ] Integrate all enhancements
   - [ ] Run full test suite
   - [ ] Deploy to staging
   - [ ] Monitor for 24 hours

2. **Short Term**:
   - [ ] Add more business metrics
   - [ ] Create Grafana dashboards
   - [ ] Set up alerting
   - [ ] Performance tuning

3. **Long Term**:
   - [ ] Add caching layer (Redis)
   - [ ] Implement rate limiting per endpoint
   - [ ] Add API versioning
   - [ ] Create admin dashboard

---

## Support

For issues or questions:
- Check logs: `tail -f backend.log`
- Check metrics: `http://localhost:8001/metrics`
- Check health: `http://localhost:8001/health`
- Review documentation: `specs/` directory

---

**Integration Guide**: ✅ Complete
**Ready for Implementation**: ✅ Yes
**Estimated Time**: 2-3 hours
**Difficulty**: Medium
