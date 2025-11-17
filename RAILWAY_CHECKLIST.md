# Railway Deployment Checklist

Quick reference checklist for deploying to Railway. For detailed instructions, see [RAILWAY_SETUP.md](RAILWAY_SETUP.md).

## Pre-Deployment

- [ ] Generate SECRET_KEY: Run `./railway-setup.sh` or `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- [ ] Review environment variables in `.env.railway` and `.env.railway.frontend`
- [ ] Install Railway CLI (optional): `npm i -g @railway/cli`

## Backend Deployment

### 1. Create Railway Project
- [ ] Go to [railway.app/new](https://railway.app/new)
- [ ] Connect GitHub repository
- [ ] Create new project

### 2. Add PostgreSQL Database
- [ ] Click "New" → "Database" → "PostgreSQL"
- [ ] Wait for database to provision

### 3. Configure Backend Service
- [ ] Go to backend service → Settings
- [ ] Set Root Directory (if needed): `backend`
- [ ] Go to Variables tab
- [ ] Add environment variables:

```bash
SECRET_KEY=<your-generated-key>
DEBUG=False
ALLOWED_HOSTS=.railway.app
USE_POSTGRES=True
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080
```

### 4. Deploy Backend
- [ ] Railway auto-deploys on push
- [ ] Monitor Deployments tab
- [ ] Check build logs for errors
- [ ] Note your backend URL

### 5. Run Migrations
- [ ] Using CLI: `railway run python backend/manage.py migrate`
- [ ] Or Dashboard → Commands → `python backend/manage.py migrate`

### 6. Create Superuser
- [ ] Using CLI: `railway run python backend/manage.py createsuperuser`
- [ ] Or Dashboard → Commands
- [ ] Username: `admin`
- [ ] Email: `admin@example.com`
- [ ] Password: (secure password)

### 7. Verify Backend
- [ ] Visit: `https://your-backend.railway.app/api/v1/`
- [ ] Should see Django REST Framework API root

## Frontend Deployment (Optional)

### 1. Create Frontend Service
- [ ] Click "New" → "GitHub Repo"
- [ ] Select same repository
- [ ] Creates second service

### 2. Configure Frontend Service
- [ ] Go to Settings
- [ ] Set Root Directory: `frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Start Command: `npm run start`

### 3. Add Frontend Variables
- [ ] Go to Variables tab
- [ ] Add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NODE_ENV=production
```

### 4. Update Backend CORS
- [ ] Go to backend service → Variables
- [ ] Update `CORS_ALLOWED_ORIGINS`:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
```

### 5. Redeploy Backend
- [ ] Go to backend Deployments
- [ ] Click "Redeploy" on latest deployment

### 6. Verify Frontend
- [ ] Visit: `https://your-frontend.railway.app/`
- [ ] Test login with superuser credentials
- [ ] Create test project and tasks

## Post-Deployment

### Testing
- [ ] Test user login
- [ ] Create a client
- [ ] Create a project
- [ ] Create tasks
- [ ] Test Kanban board
- [ ] Test Gantt chart
- [ ] Test task dependencies

### Configuration
- [ ] Set up custom domain (optional)
  - [ ] Backend: Settings → Domains → Add Custom Domain
  - [ ] Frontend: Settings → Domains → Add Custom Domain
  - [ ] Update ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS
- [ ] Enable auto-deploy from GitHub
  - [ ] Settings → Source → Configure branch
- [ ] Set up monitoring/alerts
  - [ ] Railway Dashboard → Metrics

### Security
- [ ] Verify DEBUG=False
- [ ] Verify SECRET_KEY is secure and unique
- [ ] Review ALLOWED_HOSTS
- [ ] Review CORS_ALLOWED_ORIGINS
- [ ] Set up SSL/HTTPS (Railway provides by default)

## Maintenance

### Useful Commands
```bash
# View logs
railway logs

# Run migrations
railway run python backend/manage.py migrate

# Create superuser
railway run python backend/manage.py createsuperuser

# Access Django shell
railway run python backend/manage.py shell

# Collect static files
railway run python backend/manage.py collectstatic --noinput

# Check deployment status
railway status

# Open Railway dashboard
railway open
```

### Monitoring
- [ ] Check Railway dashboard regularly
- [ ] Monitor resource usage
- [ ] Review logs for errors
- [ ] Set up alerts for downtime

### Updates
- [ ] Test changes locally first
- [ ] Push to GitHub (auto-deploys if enabled)
- [ ] Monitor deployment logs
- [ ] Verify changes in production
- [ ] Roll back if issues occur

## Troubleshooting Quick Fixes

### Build Fails
- [ ] Check build logs in Deployments tab
- [ ] Verify all environment variables are set
- [ ] Ensure `railway.toml` and `nixpacks.toml` exist

### Database Connection Errors
- [ ] Verify PostgreSQL service is running
- [ ] Check database environment variables
- [ ] Ensure `USE_POSTGRES=True`

### CORS Errors
- [ ] Update `CORS_ALLOWED_ORIGINS` in backend
- [ ] Remove trailing slashes from URLs
- [ ] Redeploy backend after changes

### Static Files Not Loading
- [ ] Check build logs for collectstatic output
- [ ] Verify WhiteNoise is installed
- [ ] Ensure `STATIC_ROOT` is set

### Frontend Can't Connect to Backend
- [ ] Verify `NEXT_PUBLIC_API_URL` is correct
- [ ] Check backend CORS settings
- [ ] Ensure backend is deployed and healthy

## Resources

- **Detailed Guide**: [RAILWAY_SETUP.md](RAILWAY_SETUP.md)
- **Environment Templates**: `.env.railway`, `.env.railway.frontend`
- **Setup Script**: `./railway-setup.sh`
- **Railway Docs**: [docs.railway.app](https://docs.railway.app/)
- **Railway Support**: [discord.gg/railway](https://discord.gg/railway)

---

**Status**: [ ] Not Started | [ ] In Progress | [ ] Deployed | [ ] Verified

**Deployment Date**: _______________

**Backend URL**: _______________

**Frontend URL**: _______________

**Notes**:
```
