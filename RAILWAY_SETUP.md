# Railway Deployment Setup Guide

This guide provides **step-by-step instructions** for deploying the Project Management System to Railway with all necessary environment variables configured during setup.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start - Backend Only](#quick-start---backend-only)
3. [Full Stack Deployment](#full-stack-deployment)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub account with this repository
- Railway CLI (optional but recommended)

### Install Railway CLI (Optional)

```bash
npm i -g @railway/cli
railway login
```

---

## Quick Start - Backend Only

Deploy the Django backend with PostgreSQL database.

### Step 1: Create New Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub account
4. Select this repository

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click **"New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a PostgreSQL instance and auto-generate connection variables

### Step 3: Configure Backend Service

1. Click on your backend service (the one deployed from GitHub)
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `backend` (if deploying from monorepo root, leave empty)
4. Go to **"Variables"** tab
5. Click **"RAW Editor"** and paste the following:

```bash
# Core Django Settings
SECRET_KEY=<GENERATE_SECURE_KEY_HERE>
DEBUG=False
ALLOWED_HOSTS=.railway.app
USE_POSTGRES=True

# Database (Reference PostgreSQL service)
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}

# CORS (Update after deploying frontend)
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# Redis (Optional - only if you add Redis service)
# REDIS_HOST=${{Redis.REDIS_HOST}}
# REDIS_PORT=${{Redis.REDIS_PORT}}
```

**IMPORTANT: Generate SECRET_KEY**

Run this command locally to generate a secure key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and replace `<GENERATE_SECURE_KEY_HERE>` with it.

### Step 4: Deploy

1. Railway will automatically deploy your backend
2. Monitor the **"Deployments"** tab for build progress
3. Once deployed, click **"Settings"** → **"Domains"** to get your backend URL

### Step 5: Run Migrations

After successful deployment, run migrations:

**Option A: Using Railway CLI**

```bash
railway link  # Link to your project
railway run python backend/manage.py migrate
railway run python backend/manage.py createsuperuser
```

**Option B: Using Railway Dashboard**

1. Go to your backend service
2. Click **"Settings"** → **"Commands"**
3. Run: `python backend/manage.py migrate`
4. Run: `python backend/manage.py createsuperuser`

### Step 6: Verify Deployment

Visit your backend URL: `https://your-backend.railway.app/api/v1/`

You should see the Django REST Framework API root.

---

## Full Stack Deployment

Deploy both backend and frontend services.

### Backend Setup (Same as Quick Start)

Follow **Steps 1-5** from the [Quick Start](#quick-start---backend-only) section above.

### Frontend Setup

### Step 1: Create Frontend Service

1. In your Railway project dashboard, click **"New"**
2. Select **"GitHub Repo"**
3. Choose the **same repository**
4. Railway will create a second service

### Step 2: Configure Frontend Service

1. Click on the new frontend service
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `frontend`
4. Set **"Build Command"** to: `npm install && npm run build`
5. Set **"Start Command"** to: `npm run start`

### Step 3: Add Frontend Environment Variables

1. Go to **"Variables"** tab
2. Click **"RAW Editor"** and paste:

```bash
# Backend API URL (Replace with your actual backend URL from Step 1)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1

# Node Environment
NODE_ENV=production
```

**Replace** `https://your-backend.railway.app` with your actual backend Railway URL from the backend service.

### Step 4: Update Backend CORS Settings

1. Go back to your **backend service**
2. Navigate to **"Variables"** tab
3. Update **CORS_ALLOWED_ORIGINS** to include your frontend URL:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
```

**Replace** `https://your-frontend.railway.app` with your actual frontend Railway URL.

### Step 5: Redeploy Backend

After updating CORS settings:
1. Go to backend service **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment

### Step 6: Verify Full Stack

1. **Backend**: Visit `https://your-backend.railway.app/api/v1/`
2. **Frontend**: Visit `https://your-frontend.railway.app/`
3. Test login with superuser credentials created earlier

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Description | Example/Default |
|----------|----------|-------------|-----------------|
| `SECRET_KEY` | ✅ Yes | Django secret key (50+ chars) | Generated random string |
| `DEBUG` | ✅ Yes | Debug mode (False for production) | `False` |
| `ALLOWED_HOSTS` | ✅ Yes | Allowed host domains | `.railway.app` |
| `USE_POSTGRES` | ✅ Yes | Use PostgreSQL database | `True` |
| `DB_NAME` | ✅ Yes | Database name | `${{Postgres.PGDATABASE}}` |
| `DB_USER` | ✅ Yes | Database user | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | ✅ Yes | Database password | `${{Postgres.PGPASSWORD}}` |
| `DB_HOST` | ✅ Yes | Database host | `${{Postgres.PGHOST}}` |
| `DB_PORT` | ✅ Yes | Database port | `${{Postgres.PGPORT}}` |
| `CORS_ALLOWED_ORIGINS` | ✅ Yes | Frontend URLs for CORS | `https://frontend.railway.app` |
| `JWT_ACCESS_TOKEN_LIFETIME` | ⚠️ Optional | JWT access token lifetime (minutes) | `15` |
| `JWT_REFRESH_TOKEN_LIFETIME` | ⚠️ Optional | JWT refresh token lifetime (minutes) | `10080` (7 days) |
| `REDIS_HOST` | ⚠️ Optional | Redis host (if using Redis) | `${{Redis.REDIS_HOST}}` |
| `REDIS_PORT` | ⚠️ Optional | Redis port (if using Redis) | `${{Redis.REDIS_PORT}}` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | Backend API endpoint | `https://backend.railway.app/api/v1` |
| `NODE_ENV` | ✅ Yes | Node environment | `production` |

---

## Post-Deployment Setup

### 1. Create Admin User

```bash
railway run python backend/manage.py createsuperuser
```

Follow prompts to create:
- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `<your-secure-password>`

### 2. Load Initial Data (Optional)

If you have fixtures or seed data:

```bash
railway run python backend/manage.py loaddata initial_data.json
```

### 3. Custom Domain (Optional)

**Backend Custom Domain:**
1. Go to backend service → **"Settings"** → **"Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Add CNAME record in your DNS provider:
   - **Name**: `api`
   - **Value**: `<provided-by-railway>`
5. Update `ALLOWED_HOSTS`:
   ```bash
   ALLOWED_HOSTS=.railway.app,api.yourdomain.com
   ```

**Frontend Custom Domain:**
1. Go to frontend service → **"Settings"** → **"Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `www.yourdomain.com`)
4. Add CNAME record in your DNS provider
5. Update backend `CORS_ALLOWED_ORIGINS`:
   ```bash
   CORS_ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
   ```

### 4. Enable Auto-Deploy from GitHub

1. Go to service **"Settings"**
2. Under **"Source"**, ensure GitHub integration is active
3. Configure branch (e.g., `main` or `production`)
4. Every push to the branch will trigger auto-deployment

### 5. Monitoring and Logs

**View Logs:**
```bash
railway logs
```

Or in Railway dashboard:
1. Go to service → **"Deployments"**
2. Click on a deployment
3. View **"Logs"** tab

---

## Troubleshooting

### Build Fails - "Could not determine how to build"

**Solution:**
- Ensure `railway.toml`, `nixpacks.toml`, and `Procfile` exist in root
- Or set **Root Directory** explicitly in service settings
- For backend: Root Directory = `backend`
- For frontend: Root Directory = `frontend`

### Database Connection Errors

**Symptoms:**
- `django.db.utils.OperationalError: could not connect to server`

**Solution:**
1. Verify PostgreSQL service is added to project
2. Check environment variables reference Postgres service:
   ```bash
   DB_HOST=${{Postgres.PGHOST}}
   ```
3. Ensure `USE_POSTGRES=True` is set
4. Redeploy service after updating variables

### CORS Errors in Browser Console

**Symptoms:**
- `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Update backend `CORS_ALLOWED_ORIGINS`:
   ```bash
   CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
   ```
2. **No trailing slashes** in URLs
3. **No spaces** after commas if multiple origins
4. Redeploy backend after updating
5. Clear browser cache

### Static Files Not Loading (CSS/JS missing)

**Symptoms:**
- Backend admin panel has no styling
- Static files return 404

**Solution:**
1. Ensure `collectstatic` runs during build (check `railway.toml`)
2. Verify build logs show:
   ```
   XX static files copied to '/app/backend/staticfiles'
   ```
3. Check `STATIC_ROOT` in Django settings
4. WhiteNoise middleware should be enabled (already configured)

### Frontend Shows "Failed to fetch" or Network Errors

**Symptoms:**
- Frontend can't connect to backend API

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check backend URL is accessible: `https://your-backend.railway.app/api/v1/`
3. Ensure backend has correct `CORS_ALLOWED_ORIGINS`
4. Check browser DevTools → Network tab for exact error
5. Verify backend is deployed and healthy

### Migrations Not Running

**Symptoms:**
- Database errors about missing tables

**Solution:**
```bash
railway run python backend/manage.py migrate
```

Or add a release command in `Procfile`:
```
release: cd backend && python manage.py migrate --noinput
```

### Secret Key Errors

**Symptoms:**
- `django.core.exceptions.ImproperlyConfigured: The SECRET_KEY setting must not be empty`

**Solution:**
1. Generate a new secret key:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
2. Set it in Railway variables
3. Redeploy

### Redis Connection Errors (If using Redis)

**Symptoms:**
- `Error 111 connecting to localhost:6379. Connection refused`

**Solution:**
1. Add Redis service to Railway project
2. Update environment variables:
   ```bash
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   ```
3. Or skip Redis for now (not critical for basic functionality)

### 500 Internal Server Error

**Symptoms:**
- Backend returns 500 errors

**Solution:**
1. Check logs:
   ```bash
   railway logs
   ```
2. Common causes:
   - Database not connected
   - Missing environment variables
   - Static files not collected
   - SECRET_KEY not set

---

## Railway-Specific Tips

### Variable References

Railway allows referencing variables from other services:

```bash
# Reference PostgreSQL service variables
DB_HOST=${{Postgres.PGHOST}}

# Reference Redis service variables
REDIS_HOST=${{Redis.REDIS_HOST}}

# Reference custom variables from another service
BACKEND_URL=${{backend-service.RAILWAY_PUBLIC_DOMAIN}}
```

### Multiple Environments

Create separate Railway projects for different environments:

- **Development**: `project-dev`
- **Staging**: `project-staging`
- **Production**: `project-production`

Each can have different environment variables and branches.

### Cost Management

- **Hobby Plan**: $5/month with $5 usage credit
- **Pro Plan**: $20/month with $20 usage credit

**Tips:**
- Monitor usage in Railway dashboard
- Use sleep mode for non-production environments
- Combine services in one project to share resources

---

## Quick Reference Commands

```bash
# Railway CLI
railway login                           # Authenticate
railway init                            # Initialize project
railway link                            # Link to existing project
railway up                              # Deploy current directory
railway logs                            # View logs
railway run <command>                   # Run command in Railway environment
railway open                            # Open project dashboard
railway status                          # Check deployment status
railway variables                       # List variables
railway variables set KEY=value         # Set variable

# Django Management (via Railway)
railway run python backend/manage.py migrate
railway run python backend/manage.py createsuperuser
railway run python backend/manage.py collectstatic --noinput
railway run python backend/manage.py shell
```

---

## Support Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app/)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Django Documentation**: [docs.djangoproject.com](https://docs.djangoproject.com/)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

---

## Summary Checklist

### Backend Deployment
- [ ] Create Railway project
- [ ] Add PostgreSQL database
- [ ] Set all required environment variables
- [ ] Generate and set SECRET_KEY
- [ ] Deploy backend service
- [ ] Run migrations
- [ ] Create superuser
- [ ] Verify API endpoint

### Frontend Deployment
- [ ] Create frontend service
- [ ] Set root directory to `frontend`
- [ ] Set NEXT_PUBLIC_API_URL
- [ ] Deploy frontend service
- [ ] Update backend CORS settings
- [ ] Redeploy backend
- [ ] Test full application

### Post-Deployment
- [ ] Test login functionality
- [ ] Create test project and tasks
- [ ] Verify Gantt and Kanban views
- [ ] Set up custom domains (optional)
- [ ] Enable auto-deploy from GitHub
- [ ] Set up monitoring/alerts

---

**Deployment Complete!** 🚀

Your Project Management System should now be live on Railway.
