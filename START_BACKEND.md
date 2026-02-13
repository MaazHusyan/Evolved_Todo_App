# How to Start the Backend Server

## Quick Start (Recommended)

### Option 1: Using the Terminal

```bash
# Navigate to the backend directory
cd /home/maaz/Desktop/Evolve_Todo_App/backend

# Start the server
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

The server will start and you'll see:
```
✓ Using Gemini model: gemini-2.0-flash-exp
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Application startup complete.
```

### Option 2: Using Python Module

```bash
cd /home/maaz/Desktop/Evolve_Todo_App/backend
python -m uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

### Option 3: Using uv (if installed)

```bash
cd /home/maaz/Desktop/Evolve_Todo_App/backend
uv run uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Detailed Steps

### 1. Open a Terminal

**Linux/Mac:**
- Press `Ctrl + Alt + T` or open your terminal application

**Windows:**
- Open Command Prompt or PowerShell

### 2. Navigate to Backend Directory

```bash
cd /home/maaz/Desktop/Evolve_Todo_App/backend
```

### 3. Activate Virtual Environment (if needed)

```bash
# If using venv
source .venv/bin/activate

# If using conda
conda activate evolve-todo
```

### 4. Start the Server

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

**Command Breakdown:**
- `uvicorn` - ASGI server for Python
- `src.main:app` - Path to FastAPI app (module:variable)
- `--host 0.0.0.0` - Listen on all network interfaces
- `--port 8001` - Run on port 8001
- `--reload` - Auto-reload on code changes (development mode)

---

## Verify Server is Running

### Check in Browser
Open: http://localhost:8001

You should see:
```json
{"message": "Todo API is running"}
```

### Check API Documentation
Open: http://localhost:8001/docs

You'll see the interactive Swagger UI with all API endpoints.

### Check Health Status
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-12T...",
  "version": "3.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "response_time_ms": 27.91,
      "message": "Database connection successful"
    }
  }
}
```

---

## Troubleshooting

### Issue 1: Port Already in Use

**Error:**
```
ERROR: [Errno 98] Address already in use
```

**Solution:**
```bash
# Kill process using port 8001
lsof -ti:8001 | xargs kill -9

# Then start the server again
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

### Issue 2: Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
# Install dependencies
cd /home/maaz/Desktop/Evolve_Todo_App/backend
pip install -r requirements.txt

# Or using uv
uv pip install -r requirements.txt
```

### Issue 3: Database Connection Error

**Error:**
```
Database connection failed
```

**Solution:**
```bash
# Check if .env file exists
ls -la .env

# Verify DATABASE_URL is set
cat .env | grep DATABASE_URL

# If missing, create .env file with:
echo "DATABASE_URL=sqlite:///./todo_app.db" >> .env
```

### Issue 4: Import Error

**Error:**
```
ImportError: cannot import name 'X' from 'Y'
```

**Solution:**
```bash
# Make sure you're in the backend directory
pwd
# Should show: /home/maaz/Desktop/Evolve_Todo_App/backend

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue 5: Permission Denied

**Error:**
```
PermissionError: [Errno 13] Permission denied
```

**Solution:**
```bash
# Give execute permissions
chmod +x src/main.py

# Or run with sudo (not recommended)
sudo uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Production Mode (No Auto-Reload)

For production deployment, remove the `--reload` flag:

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

Or use multiple workers:

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001 --workers 4
```

---

## Running in Background

### Using nohup

```bash
nohup uvicorn src.main:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
```

### Using screen

```bash
# Start a screen session
screen -S backend

# Start the server
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload

# Detach: Press Ctrl+A then D

# Reattach later
screen -r backend
```

### Using tmux

```bash
# Start a tmux session
tmux new -s backend

# Start the server
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload

# Detach: Press Ctrl+B then D

# Reattach later
tmux attach -t backend
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL=sqlite:///./todo_app.db

# Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
JSON_LOGS=true

# MCP Server
MCP_SERVER_URL=http://localhost:8001/mcp/sse
MCP_TIMEOUT=30
```

---

## Stopping the Server

### If running in foreground:
Press `Ctrl + C`

### If running in background:
```bash
# Find the process ID
lsof -ti:8001

# Kill the process
kill -9 $(lsof -ti:8001)
```

---

## Useful Commands

### Check Server Status
```bash
curl http://localhost:8001/health
```

### View Logs
```bash
# If using nohup
tail -f backend.log

# If using systemd
journalctl -u backend -f
```

### Test API Endpoints
```bash
# Get root
curl http://localhost:8001/

# Get health
curl http://localhost:8001/health

# Get metrics
curl http://localhost:8001/metrics

# Get API docs
curl http://localhost:8001/docs
```

---

## Next Steps

After starting the backend:

1. **Start the Frontend**
   ```bash
   cd /home/maaz/Desktop/Evolve_Todo_App/frontend
   npm run dev
   ```

2. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

3. **Test the Chatbot**
   - Navigate to http://localhost:3000/chat
   - Try: "Show me my tasks"
   - Try: "Add a task to buy groceries"

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `uvicorn src.main:app --reload` | Start with auto-reload |
| `uvicorn src.main:app --workers 4` | Start with 4 workers |
| `lsof -ti:8001 \| xargs kill -9` | Kill process on port 8001 |
| `curl http://localhost:8001/health` | Check health |
| `curl http://localhost:8001/docs` | View API docs |

---

**Last Updated**: 2026-02-12
**Backend Port**: 8001
**Frontend Port**: 3000
