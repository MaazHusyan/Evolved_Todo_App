# Deployment Guide - Evolve Todo App

## 🚀 Live Deployments

### Frontend (Vercel)
- **Production URL**: https://frontend-cyan-delta-89.vercel.app
- **Framework**: Next.js 16.1.1 with Turbopack
- **Deployment**: Automatic via Vercel CLI

### Backend (Hugging Face Spaces)
- **Production URL**: https://maazHusyan-todo-backend.hf.space
- **Framework**: FastAPI (Python)
- **Health Check**: https://maazHusyan-todo-backend.hf.space/health

### Database (Neon PostgreSQL)
- **Provider**: Neon (Free Tier)
- **Type**: PostgreSQL with connection pooling
- **Note**: Database pauses after inactivity (30-60s cold start)

---

## 🔗 Architecture

```
User Browser
    ↓
Vercel Frontend (Next.js)
    ↓ BACKEND_URL env var
Hugging Face Backend (FastAPI)
    ↓ DATABASE_URL env var
Neon PostgreSQL Database
```

---

## 🔧 Environment Variables

### Frontend (Vercel)
```bash
BACKEND_URL=https://maazHusyan-todo-backend.hf.space
DATABASE_URL=postgresql://[connection-string]
BETTER_AUTH_SECRET=[secret-key]
BETTER_AUTH_URL=https://frontend-cyan-delta-89.vercel.app
NEXT_PUBLIC_API_URL=[api-url]
```

### Backend (Hugging Face)
```bash
DATABASE_URL=postgresql://[connection-string]
```

---

## 📦 Deployment Steps

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Production**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add BACKEND_URL production
   # Enter: https://maazHusyan-todo-backend.hf.space
   ```

### Backend Deployment (Hugging Face)

1. **Clone the Space**
   ```bash
   git clone https://huggingface.co/spaces/MaazHusyan/Todo_backend
   cd Todo_backend
   ```

2. **Update Code**
   ```bash
   cp -r /path/to/backend/* .
   git add .
   git commit -m "Update backend"
   ```

3. **Push to Hugging Face**
   ```bash
   git push https://[username]:[token]@huggingface.co/spaces/MaazHusyan/Todo_backend main
   ```

---

## ⚠️ Known Issues

### Neon Database Cold Starts
- **Issue**: Free tier databases pause after inactivity
- **Symptom**: First request may timeout (30-60 seconds)
- **Impact**: Intermittent session failures
- **Workaround**: Refresh the page if redirected to login
- **Solution**: Upgrade to Neon paid tier

---

## 🧪 Testing Deployment

### 1. Test Backend Health
```bash
curl https://maazHusyan-todo-backend.hf.space/health
# Expected: {"status":"healthy","service":"todo-api"}
```

### 2. Test Frontend
1. Visit: https://frontend-cyan-delta-89.vercel.app
2. Register/Login
3. Create tasks (simple and advanced mode)
4. Edit and delete tasks
5. Verify persistence after refresh

### 3. Check Logs
```bash
# Vercel logs
vercel logs [deployment-url]

# Hugging Face logs
# View in the Space's "Logs" tab
```

---

## 🔄 Update Workflow

### Frontend Updates
```bash
cd frontend
git add .
git commit -m "feat: your changes"
git push origin 002-phase-2-web-app
vercel --prod
```

### Backend Updates
```bash
cd backend
# Make changes
cd /tmp/todo-backend-hf
cp -r /path/to/backend/* .
git add .
git commit -m "feat: your changes"
git push https://[username]:[token]@huggingface.co/spaces/MaazHusyan/Todo_backend main
```

---

## 📊 Monitoring

### Frontend (Vercel)
- Dashboard: https://vercel.com/maaz-husyans-projects/frontend
- Analytics: Available in Vercel dashboard
- Logs: `vercel logs`

### Backend (Hugging Face)
- Dashboard: https://huggingface.co/spaces/MaazHusyan/Todo_backend
- Logs: Available in Space settings
- Status: Check health endpoint

### Database (Neon)
- Dashboard: https://console.neon.tech
- Metrics: Connection count, query performance
- Alerts: Configure in Neon console

---

## 🛠️ Troubleshooting

### Frontend Issues

**Problem**: Tasks not loading
- Check: `BACKEND_URL` environment variable set
- Check: Backend health endpoint responding
- Check: Browser console for errors

**Problem**: Authentication failing
- Check: `DATABASE_URL` environment variable set
- Check: `BETTER_AUTH_SECRET` configured
- Check: Database connection working

### Backend Issues

**Problem**: 500 errors
- Check: Database connection string valid
- Check: All required columns exist in database
- Check: Hugging Face Space logs

**Problem**: Slow responses
- Likely: Neon cold start (wait 30-60s)
- Check: Database connection pool settings
- Consider: Upgrading Neon tier

---

## 📝 Maintenance

### Regular Tasks
- Monitor error rates in Vercel dashboard
- Check Hugging Face Space status
- Review Neon database usage
- Update dependencies monthly

### Security
- Rotate `BETTER_AUTH_SECRET` quarterly
- Review database access logs
- Update environment variables if compromised
- Keep dependencies up to date

---

**Last Updated**: 2026-01-21
**Version**: Phase 2 - Web Application
