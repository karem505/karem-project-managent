# Railway Deployment Guide

This guide explains how to deploy the Project Management System to Railway.

## Architecture Overview

This is a monorepo with two main services:
- **Backend**: Django REST Framework API (in `backend/` directory)
- **Frontend**: Next.js application (in `frontend/` directory)

## Deployment Strategy

Railway supports monorepos by creating separate services for each component. We'll deploy:
1. PostgreSQL database (Railway managed service)
2. Backend API service
3. Frontend web service

## Quick Deploy - Backend Only

The root-level configuration files (`railway.toml`, `nixpacks.toml`, `Procfile`) are set up to deploy the **backend** by default.

### Step 1: Create Railway Project

```bash
# Install Railway CLI (if not already installed)
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init
```

### Step 2: Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create a PostgreSQL instance and set environment variables

### Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables to your backend service:

```
SECRET_KEY=your-secret-key-here-generate-a-random-string
DEBUG=False
ALLOWED_HOSTS=.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend-url.railway.app

# Database variables are auto-set by Railway PostgreSQL service:
# DATABASE_URL (Railway provides this automatically)
# Or manually set:
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
```

### Step 4: Deploy

```bash
# Deploy from CLI
railway up

# Or connect GitHub repo in Railway dashboard for automatic deployments
```

## Full Stack Deployment (Backend + Frontend)

For deploying both services, you'll need to create **two separate services** in Railway:

### Backend Service

1. Create a new service in Railway
2. Connect your GitHub repository
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `pip install -r requirements/base.txt && python manage.py collectstatic --noinput`
5. Set **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 60`
6. Add environment variables (see Step 3 above)
7. Add PostgreSQL database to the project

### Frontend Service

1. Create another new service in Railway
2. Connect the same GitHub repository
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm run start`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1
   ```

### Configure CORS

After deploying frontend, update the backend's `CORS_ALLOWED_ORIGINS` environment variable:

```
CORS_ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Random 50-character string |
| `DEBUG` | Debug mode | `False` for production |
| `ALLOWED_HOSTS` | Allowed host domains | `.railway.app,yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | Frontend URLs for CORS | `https://frontend.railway.app` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `DB_NAME` | Database name | Reference Railway Postgres |
| `DB_USER` | Database user | Reference Railway Postgres |
| `DB_PASSWORD` | Database password | Reference Railway Postgres |
| `DB_HOST` | Database host | Reference Railway Postgres |
| `DB_PORT` | Database port | Reference Railway Postgres |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://backend.railway.app/api/v1` |

## Post-Deployment Steps

### 1. Create Superuser

After backend deployment, run migrations and create a superuser:

```bash
# Using Railway CLI
railway run python backend/manage.py migrate
railway run python backend/manage.py createsuperuser

# Or use Railway dashboard "Command" feature
```

### 2. Verify Deployment

1. Check backend health: `https://your-backend-url.railway.app/api/v1/`
2. Check frontend: `https://your-frontend-url.railway.app/`
3. Test login with the superuser credentials

### 3. Set Up Custom Domain (Optional)

1. In Railway dashboard, go to service settings
2. Click "Domains" → "Add Custom Domain"
3. Configure DNS records as instructed
4. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` accordingly

## Troubleshooting

### Build Fails with "Could not determine how to build"

**Solution**: The root-level configuration files should fix this. Ensure:
- `railway.toml` exists at project root
- `nixpacks.toml` exists at project root
- `Procfile` exists at project root

If still failing, try deploying with explicit root directory set to `backend`.

### Database Connection Errors

**Solution**:
1. Verify PostgreSQL service is added to the project
2. Check environment variables reference the Postgres service correctly
3. Use Railway's variable references: `${{Postgres.PGHOST}}`

### CORS Errors in Browser

**Solution**:
1. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
2. Make sure there's no trailing slash in URLs
3. Restart backend service after updating environment variables

### Static Files Not Loading

**Solution**:
1. Verify `collectstatic` ran during build (check build logs)
2. Ensure `STATIC_ROOT` is set correctly in Django settings
3. WhiteNoise should serve static files in production

### Frontend Can't Connect to Backend

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is deployed and healthy
3. Check browser console for CORS errors
4. Ensure backend URL uses HTTPS (Railway provides this by default)

## Railway CLI Commands

```bash
# View logs
railway logs

# Run commands in backend context
railway run python backend/manage.py migrate
railway run python backend/manage.py createsuperuser

# Open Railway dashboard
railway open

# Check deployment status
railway status

# Set environment variable
railway variables set SECRET_KEY=your-secret-key

# Link to existing project
railway link
```

## Cost Optimization

Railway offers:
- **Hobby Plan**: $5/month with $5 usage credit
- **Pro Plan**: $20/month with $20 usage credit

Tips to minimize costs:
1. Use Railway's managed PostgreSQL (included in plan)
2. Set up sleep mode for non-production environments
3. Monitor usage in Railway dashboard
4. Use environment-based plans (dev/staging/prod)

## Alternative: Deploy Only Backend

If you want to deploy only the backend and run frontend locally:

1. Deploy backend following "Backend Service" steps above
2. Run frontend locally: `cd frontend && npm run dev`
3. Set local `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1
   ```
4. Update backend `CORS_ALLOWED_ORIGINS` to include `http://localhost:3000`

## Migration from Docker Compose

If migrating from Docker Compose setup:

1. Export data from local PostgreSQL:
   ```bash
   docker-compose exec postgres pg_dump -U postgres project_management > backup.sql
   ```

2. Import to Railway PostgreSQL:
   ```bash
   railway run psql $DATABASE_URL < backup.sql
   ```

3. Verify data integrity after import

## Next Steps

After successful deployment:
1. Set up monitoring and alerts in Railway dashboard
2. Configure custom domains for production
3. Set up GitHub Actions for CI/CD
4. Enable automatic deployments from main branch
5. Create separate Railway projects for staging/production

## Support

- Railway Documentation: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Project Issues: Create an issue in your GitHub repository
