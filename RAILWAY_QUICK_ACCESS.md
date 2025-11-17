# Quick Access Guide - Railway Deployment

## 🚨 CRITICAL: Fix Your Environment Variables First!

Your current configuration has **3 critical errors** that will prevent your app from working. Fix these immediately:

### ❌ ERROR 1: Wrong Database Host
```env
# CURRENT (WRONG):
DB_HOST="${{Postgres.PGPORT}}"

# CORRECT:
DB_HOST="${{Postgres.PGHOST}}"
```

### ❌ ERROR 2: Wrong Database Name
```env
# CURRENT (WRONG):
DB_NAME="${{Postgres.RAILWAY_PROJECT_NAME}}"

# CORRECT:
DB_NAME="${{Postgres.PGDATABASE}}"
```

### ❌ ERROR 3: Wrong Database User
```env
# CURRENT (WRONG):
DB_USER="${{Postgres.POSTGRES_USER}}"

# CORRECT:
DB_USER="${{Postgres.PGUSER}}"
```

---

## How to Access Your Services on Railway

### Step 1: Find Your Service URLs

1. Go to **Railway Dashboard**: https://railway.app/dashboard
2. Click on your **project**
3. You'll see your services listed (backend, frontend, postgres, redis)
4. Click on **backend** service
5. Look for the **"Domains"** section - you'll see a URL like:
   ```
   https://backend-production-xxxx.up.railway.app
   ```

Do the same for frontend (if deployed).

### Step 2: Access Points

Once deployed, you can access:

#### Backend API
```
https://your-backend-name.up.railway.app/api/v1/
```

This should show the Django REST Framework API root or a JSON response.

#### Django Admin Panel
```
https://your-backend-name.up.railway.app/admin/
```

Login with your superuser credentials (username: admin, password: admin123 or what you set).

#### Frontend (if deployed as separate service)
```
https://your-frontend-name.up.railway.app/
```

This should show your Next.js login page.

---

## Current Deployment Strategy

Based on your environment variables, you're trying to deploy both services together, but **this won't work** on Railway because:

1. Railway deploys **one service per project/repo**
2. Your config references Docker Compose service names (`nginx`, `backend`) which don't exist on Railway
3. You need to deploy backend and frontend as **separate Railway services**

---

## Recommended Fix: Deploy Backend Only First

### 1. Keep Only These Environment Variables

In your **Railway backend service**, set:

```env
# Django Settings
SECRET_KEY="your-secret-key-change-in-production"
DEBUG="False"
ALLOWED_HOSTS=".railway.app"

# CORS - Add your frontend URL after you deploy it
CORS_ALLOWED_ORIGINS="http://localhost:3000"

# Database (PostgreSQL)
DB_HOST="${{Postgres.PGHOST}}"
DB_NAME="${{Postgres.PGDATABASE}}"
DB_PASSWORD="${{Postgres.PGPASSWORD}}"
DB_PORT="${{Postgres.PGPORT}}"
DB_USER="${{Postgres.PGUSER}}"
USE_POSTGRES="True"

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME="15"
JWT_REFRESH_TOKEN_LIFETIME="10080"
```

**Remove these** (they're for Docker Compose, not Railway):
- ❌ `NEXT_PUBLIC_API_URL` (this goes in frontend service, not backend)
- ❌ `REDIS_HOST` and `REDIS_PORT` (unless you've added Redis service to Railway)
- ❌ Any references to `nginx` or `backend` service names

### 2. Verify PostgreSQL Service Exists

In Railway dashboard:
1. Check if you have a **PostgreSQL** service in your project
2. If not, click **"New"** → **"Database"** → **"PostgreSQL"**
3. Railway will automatically create it and expose the variables

### 3. Redeploy

After fixing the environment variables:
1. Railway should automatically redeploy
2. Or click **"Deploy"** button in Railway dashboard
3. Watch the **deploy logs** for errors

### 4. Find Your Backend URL

After successful deployment:
1. Go to backend service in Railway
2. Click **"Settings"**
3. Scroll to **"Domains"**
4. Copy the Railway-provided URL (e.g., `https://backend-production-abc123.up.railway.app`)

### 5. Test Your Backend

Open in browser or use curl:
```bash
# Test API root
curl https://your-backend-url.up.railway.app/api/v1/

# Should return JSON response like:
# {"clients": "...", "projects": "...", "tasks": "..."}
```

Visit admin panel:
```
https://your-backend-url.up.railway.app/admin/
```

### 6. Create Superuser

If you haven't created a superuser yet:

**Option A: Using Railway CLI**
```bash
railway login
railway link  # Select your project and service
railway run python backend/manage.py createsuperuser
```

**Option B: Using Railway Dashboard**
1. Go to backend service
2. Click **Settings** → **Variables**
3. Add a one-time command variable (some Railway deployments support this)
4. Or check the **Logs** section for any Django setup instructions

### 7. Run Frontend Locally (Pointing to Railway Backend)

On your local machine:
```bash
cd frontend

# Create .env.local file
echo 'NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app/api/v1' > .env.local

# Install and run
npm install
npm run dev
```

Access at: `http://localhost:3000`

Update backend CORS to allow localhost:
```env
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

---

## Option 2: Deploy Frontend to Railway Too

After backend is working, deploy frontend as a **separate service**:

### 1. Create New Service in Railway

1. In your Railway project, click **"New Service"**
2. Select **"GitHub Repo"**
3. Choose the **same repository**
4. Railway will create a second service

### 2. Configure Frontend Service

In the new service settings:

**Build Settings:**
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-service.up.railway.app/api/v1
```
(Replace with your actual backend URL from step 4 above)

### 3. Update Backend CORS

Go back to backend service and update CORS:
```env
CORS_ALLOWED_ORIGINS="https://your-frontend-service.up.railway.app"
```

### 4. Access Your Full Stack App

- **Frontend**: `https://your-frontend-service.up.railway.app/`
- **Backend API**: `https://your-backend-service.up.railway.app/api/v1/`
- **Admin**: `https://your-backend-service.up.railway.app/admin/`

---

## Visual Architecture

### What You Currently Have (Docker Compose - Local Development)
```
┌─────────────────────────────────────────────┐
│ docker-compose.yml                          │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Frontend │  │ Backend  │  │ Postgres │ │
│  │  :3000   │  │  :8000   │  │  :5432   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│       │              │              │       │
│       └──────┬───────┴──────────────┘       │
│            Nginx                             │
│           :80/:443                           │
└─────────────────────────────────────────────┘
```

### What You Need on Railway (Separate Services)
```
┌─────────────────────────────────────────────┐
│ Railway Project                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Frontend Service                    │   │
│  │ https://frontend-xxx.railway.app    │   │
│  │ (Root Dir: frontend/)               │   │
│  └─────────────────┬───────────────────┘   │
│                    │ API Calls              │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │ Backend Service                     │   │
│  │ https://backend-xxx.railway.app     │   │
│  │ (Root Dir: backend/)                │   │
│  └─────────────────┬───────────────────┘   │
│                    │ Database               │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │ PostgreSQL Database                 │   │
│  │ (Railway Managed)                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Can't find my Railway URL"

1. Railway Dashboard → Your Project
2. Click on the service (backend or frontend)
3. Look at the top - you'll see the service name
4. Click **"Settings"** → **"Domains"**
5. The URL is shown there (e.g., `backend-production-abc.up.railway.app`)

### "Bad Request (400)" when accessing backend

**Cause**: ALLOWED_HOSTS doesn't include your Railway domain

**Fix**: Add `.railway.app` to ALLOWED_HOSTS

### "Database connection failed"

**Cause**: Wrong database environment variables

**Fix**: Update to use correct Postgres variable names (see top of this file)

### "CORS error" in browser console

**Cause**: Backend CORS doesn't allow your frontend domain

**Fix**: Add your frontend Railway URL to CORS_ALLOWED_ORIGINS

### Backend deployed but shows blank page

**Cause**: You're accessing the root `/` which doesn't exist

**Fix**: Access `/api/v1/` or `/admin/` instead

---

## Quick Checklist

- [ ] Fixed DB_HOST to `${{Postgres.PGHOST}}`
- [ ] Fixed DB_NAME to `${{Postgres.PGDATABASE}}`
- [ ] Fixed DB_USER to `${{Postgres.PGUSER}}`
- [ ] Added `.railway.app` to ALLOWED_HOSTS
- [ ] PostgreSQL service exists in Railway project
- [ ] Backend deployed successfully (green checkmark in Railway)
- [ ] Can access backend at `https://your-backend.railway.app/api/v1/`
- [ ] Can access admin at `https://your-backend.railway.app/admin/`
- [ ] Created superuser account
- [ ] (Optional) Frontend deployed as separate service
- [ ] (Optional) CORS updated to include frontend URL

---

## Summary

**To access your services on Railway:**

1. **Fix the 3 database variable errors** (top of this file)
2. **Find your backend URL** in Railway dashboard → Service → Settings → Domains
3. **Access API** at: `https://your-backend.railway.app/api/v1/`
4. **Access Admin** at: `https://your-backend.railway.app/admin/`
5. **Run frontend locally** (or deploy as separate service) pointing to backend URL

**Your backend URL format will be:**
```
https://[service-name]-production-[random].up.railway.app
```

The exact URL is shown in Railway dashboard after deployment completes.
