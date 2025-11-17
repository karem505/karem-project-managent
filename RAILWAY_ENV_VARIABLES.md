# Railway Environment Variables - Corrected Configuration

## Critical Issues in Your Current Setup

Your current configuration has several errors that will prevent your app from working:

### ❌ Database Configuration Errors

```env
# WRONG:
DB_HOST="${{Postgres.PGPORT}}"        # This is the PORT, not the HOST!
DB_NAME="${{Postgres.RAILWAY_PROJECT_NAME}}"  # Wrong variable
DB_USER="${{Postgres.POSTGRES_USER}}"  # Wrong variable name

# CORRECT:
DB_HOST="${{Postgres.PGHOST}}"
DB_NAME="${{Postgres.PGDATABASE}}"
DB_USER="${{Postgres.PGUSER}}"
```

### ❌ ALLOWED_HOSTS Missing Railway Domain

```env
# WRONG (only has Docker Compose service names):
ALLOWED_HOSTS="localhost,127.0.0.1,backend,nginx"

# CORRECT (must include your Railway domain):
ALLOWED_HOSTS=".railway.app,your-custom-domain.com"
```

### ❌ CORS Not Configured for Railway

```env
# WRONG (only has localhost):
CORS_ALLOWED_ORIGINS="http://localhost,http://localhost:80,http://localhost:3000"

# CORRECT (must include your frontend Railway URL):
CORS_ALLOWED_ORIGINS="https://your-frontend-name.up.railway.app"
```

---

## Corrected Environment Variables

### Backend Service (Django)

```env
# Django Core Settings
SECRET_KEY="your-secret-key-change-in-production"
DEBUG="False"  # Set to False in production!
ALLOWED_HOSTS=".railway.app"

# CORS Configuration
CORS_ALLOWED_ORIGINS="https://your-frontend-service.up.railway.app"

# Database (PostgreSQL from Railway)
DB_HOST="${{Postgres.PGHOST}}"
DB_NAME="${{Postgres.PGDATABASE}}"
DB_PASSWORD="${{Postgres.PGPASSWORD}}"
DB_PORT="${{Postgres.PGPORT}}"
DB_USER="${{Postgres.PGUSER}}"
USE_POSTGRES="True"

# Redis (if you added Redis service)
REDIS_HOST="${{Redis.REDIS_HOST}}"
REDIS_PORT="${{Redis.REDIS_PORT}}"

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME="15"
JWT_REFRESH_TOKEN_LIFETIME="10080"
```

### Frontend Service (Next.js)

```env
# Backend API URL
NEXT_PUBLIC_API_URL="https://your-backend-service.up.railway.app/api/v1"
```

---

## Step-by-Step Railway Setup Guide

### Option 1: Backend Only (Recommended to Start)

If you're deploying just the backend API:

#### 1. Create PostgreSQL Database

1. In Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates the database and exposes variables

#### 2. Backend Service Environment Variables

Set these in your backend service settings:

```env
SECRET_KEY="generate-a-random-50-character-string"
DEBUG="False"
ALLOWED_HOSTS=".railway.app"
CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-future-frontend.railway.app"

# Database - Reference the Postgres service
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

#### 3. Access Your Backend

After deployment completes:
- **Backend API**: `https://your-backend-service-name.up.railway.app/api/v1/`
- **Admin Panel**: `https://your-backend-service-name.up.railway.app/admin/`

The service name will be shown in Railway dashboard.

#### 4. Create Superuser

In Railway dashboard → your backend service → **Settings** → **Deploy Logs**:
1. Click on the three dots menu
2. Select **"View Logs"**
3. Or use Railway CLI:

```bash
railway login
railway link  # Link to your project
railway run python backend/manage.py createsuperuser
```

#### 5. Test Locally with Railway Backend

On your local machine:

```bash
cd frontend
# Edit .env.local:
echo 'NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api/v1' > .env.local
npm run dev
```

Access frontend at: `http://localhost:3000`

---

### Option 2: Full Stack (Backend + Frontend)

If you want both services on Railway:

#### Step 1: Deploy Backend (Same as Option 1)

Follow steps 1-4 from Option 1 above.

#### Step 2: Create Frontend Service

1. In Railway project, click **"New"** → **"GitHub Repo"**
2. Select your repository
3. **Important**: Railway will try to build from root. You need to configure it:

**Railway Frontend Service Settings:**
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

#### Step 3: Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL="https://your-backend-service.up.railway.app/api/v1"
```

#### Step 4: Update Backend CORS

Go back to backend service and update `CORS_ALLOWED_ORIGINS`:

```env
CORS_ALLOWED_ORIGINS="https://your-frontend-service.up.railway.app"
```

Redeploy the backend service.

#### Step 5: Access Your Full Stack App

- **Frontend**: `https://your-frontend-service.up.railway.app/`
- **Backend API**: `https://your-backend-service.up.railway.app/api/v1/`
- **Admin Panel**: `https://your-backend-service.up.railway.app/admin/`

---

## How to Find Your Railway URLs

1. Go to Railway dashboard
2. Click on your service (backend or frontend)
3. Go to **"Settings"** tab
4. Scroll to **"Domains"** section
5. You'll see URLs like:
   - `your-service-name.up.railway.app` (default Railway subdomain)
   - Or your custom domain if configured

---

## Important Notes

### 🚨 Your Current Config Won't Work Because:

1. **DB_HOST is pointing to PORT** - Database connection will fail
2. **ALLOWED_HOSTS doesn't include Railway domain** - You'll get "Bad Request (400)"
3. **CORS doesn't include Railway frontend** - Frontend can't communicate with backend
4. **Using Docker Compose service names** (`backend`, `nginx`) - These don't exist on Railway

### ✅ What You Need to Change:

1. Fix database environment variable references
2. Add `.railway.app` to ALLOWED_HOSTS
3. Add your actual frontend URL to CORS_ALLOWED_ORIGINS
4. Remove Docker Compose references (nginx, backend service names)

---

## Quick Fix Commands

### Generate a Secure SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Test Database Connection

After fixing DB variables, check logs for:
```
✓ Database connection successful
✗ django.db.utils.OperationalError  # If this appears, DB config is wrong
```

### Verify CORS

Open browser console on frontend and look for:
```
✓ Successful API calls
✗ "blocked by CORS policy"  # If this appears, update CORS_ALLOWED_ORIGINS
```

---

## Deployment Checklist

Backend Service:
- [ ] PostgreSQL database added to project
- [ ] DB_HOST = `${{Postgres.PGHOST}}`
- [ ] DB_NAME = `${{Postgres.PGDATABASE}}`
- [ ] DB_USER = `${{Postgres.PGUSER}}`
- [ ] DB_PASSWORD = `${{Postgres.PGPASSWORD}}`
- [ ] DB_PORT = `${{Postgres.PGPORT}}`
- [ ] ALLOWED_HOSTS includes `.railway.app`
- [ ] CORS_ALLOWED_ORIGINS includes frontend URL
- [ ] DEBUG = `False`
- [ ] SECRET_KEY is a strong random string
- [ ] Deployment succeeded (check deploy logs)
- [ ] Can access `/api/v1/` endpoint
- [ ] Superuser created

Frontend Service (if deploying):
- [ ] Root directory set to `frontend`
- [ ] NEXT_PUBLIC_API_URL points to backend Railway URL
- [ ] Build succeeded
- [ ] Can access the home page
- [ ] Can login successfully

---

## Testing Your Deployment

### 1. Test Backend API

```bash
# Check API health
curl https://your-backend.up.railway.app/api/v1/

# Should return API root or schema
```

### 2. Test Admin Panel

Visit: `https://your-backend.up.railway.app/admin/`
- Should show Django admin login
- Login with your superuser credentials

### 3. Test Frontend (if deployed)

Visit: `https://your-frontend.up.railway.app/`
- Should show login page
- Try logging in
- Check browser console for errors

---

## Common Issues & Solutions

### "Invalid HTTP_HOST header"

**Cause**: ALLOWED_HOSTS doesn't include your Railway domain

**Solution**: Update ALLOWED_HOSTS to include `.railway.app`

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause**: CORS_ALLOWED_ORIGINS doesn't include your frontend URL

**Solution**: Add your frontend Railway URL to CORS_ALLOWED_ORIGINS

### "django.db.utils.OperationalError: could not connect to server"

**Cause**: Database configuration is wrong

**Solution**: Double-check DB_HOST, DB_NAME, DB_USER variables match the table above

### "502 Bad Gateway"

**Cause**: Backend service crashed or failed to start

**Solution**:
1. Check deploy logs in Railway dashboard
2. Look for Python errors
3. Verify all dependencies are in `requirements.txt`

---

## Next Steps After Deployment

1. **Secure Your App**:
   - Change SECRET_KEY to a strong random string
   - Set DEBUG=False
   - Set up proper ALLOWED_HOSTS with your domain

2. **Set Up Custom Domain** (optional):
   - In Railway → Service → Settings → Domains
   - Add your custom domain
   - Configure DNS records
   - Update ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS

3. **Monitor Your App**:
   - Check deploy logs regularly
   - Set up error tracking (Sentry, etc.)
   - Monitor resource usage in Railway dashboard

4. **Create Production Data**:
   - Create superuser
   - Add initial clients/projects
   - Test all features

---

## Need Help?

1. Check Railway deploy logs for errors
2. Check browser console for frontend errors
3. Verify all environment variables are correct
4. Ensure Postgres service is running
5. Test API endpoints with curl or Postman

**Railway Documentation**: https://docs.railway.app/
