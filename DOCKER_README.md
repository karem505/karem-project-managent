# Docker Setup Guide

This guide covers how to run the Project Management System using Docker for easy deployment and testing.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

Check your installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Clone and Navigate

```bash
cd "D:\projetc management"
```

### 2. Build and Start Services

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

Once all services are running:

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/v1
- **Django Admin**: http://localhost/admin
- **API Documentation**: http://localhost/api/v1/schema/swagger-ui/

### 4. Default Login Credentials

The entrypoint script automatically creates a superuser:

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@example.com`

## Architecture

The Docker setup includes the following services:

```
┌─────────────────────────────────────────┐
│          Nginx (Port 80)                │
│         Reverse Proxy                   │
└──────────┬──────────────┬───────────────┘
           │              │
    ┌──────▼─────┐   ┌───▼──────────┐
    │  Frontend  │   │   Backend    │
    │  Next.js   │   │   Django     │
    │  (Port     │   │   (Port      │
    │   3000)    │   │    8000)     │
    └────────────┘   └───┬──────┬───┘
                         │      │
                    ┌────▼──┐ ┌─▼─────┐
                    │ Postgres│ Redis │
                    │ (5432) │ (6379) │
                    └────────┘ └───────┘
```

### Services

1. **nginx** - Reverse proxy routing requests to frontend/backend
2. **frontend** - Next.js 15 application with hot reload
3. **backend** - Django REST Framework API
4. **postgres** - PostgreSQL 16 database
5. **redis** - Redis 7 for caching and sessions

### Volumes

Data persistence is managed through named volumes:

- `postgres_data` - Database files
- `redis_data` - Redis persistence
- `static_files` - Django static files (CSS, JS, admin)
- `media_files` - User-uploaded files

## Configuration

### Environment Variables

Environment variables are configured in:

- **Backend**: `backend/.env.docker`
- **Frontend**: `frontend/.env.docker`
- **Root**: `.env.example` (template)

#### Backend Configuration

Edit `backend/.env.docker`:

```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend,nginx
USE_POSTGRES=True

# Database
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

#### Frontend Configuration

Edit `frontend/.env.docker`:

```bash
# API URL (accessed by browser)
NEXT_PUBLIC_API_URL=http://localhost/api/v1
NODE_ENV=development
```

### Port Mapping

- **80** → Nginx (main entry point)
- **3000** → Frontend (exposed for debugging)
- **8000** → Backend (exposed for debugging)
- **5432** → PostgreSQL (exposed for database clients)
- **6379** → Redis (exposed for Redis clients)

## Usage

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis
docker-compose up -d backend
docker-compose up -d frontend nginx
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes all data!)
docker-compose down -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Running Commands

#### Backend (Django)

```bash
# Django shell
docker-compose exec backend python manage.py shell

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Create superuser manually
docker-compose exec backend python manage.py createsuperuser

# Run tests
docker-compose exec backend pytest

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

#### Frontend (Next.js)

```bash
# Install new package
docker-compose exec frontend npm install <package-name>

# Run linter
docker-compose exec frontend npm run lint

# Access shell
docker-compose exec frontend sh
```

#### Database

```bash
# PostgreSQL shell
docker-compose exec postgres psql -U postgres -d project_management

# Backup database
docker-compose exec postgres pg_dump -U postgres project_management > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d project_management
```

## Development Workflow

### Code Changes

**Hot Reload is Enabled**:
- **Frontend**: Changes to React/Next.js files reload automatically
- **Backend**: Django development server reloads on Python file changes

### Adding Python Dependencies

```bash
# 1. Add to backend/requirements/base.txt or development.txt

# 2. Rebuild backend
docker-compose build backend

# 3. Restart backend
docker-compose restart backend
```

### Adding NPM Dependencies

```bash
# 1. Add to frontend via exec
docker-compose exec frontend npm install <package-name>

# 2. Or rebuild frontend
docker-compose build frontend
docker-compose restart frontend
```

### Database Migrations

```bash
# 1. Make changes to models in backend/apps/*/models.py

# 2. Create migrations
docker-compose exec backend python manage.py makemigrations

# 3. Apply migrations
docker-compose exec backend python manage.py migrate
```

### Debugging

#### Backend Debugging

```bash
# View Django errors
docker-compose logs -f backend

# Django shell
docker-compose exec backend python manage.py shell

# Access container shell
docker-compose exec backend bash
```

#### Frontend Debugging

```bash
# View Next.js logs
docker-compose logs -f frontend

# Check Node process
docker-compose exec frontend ps aux

# Access container shell
docker-compose exec frontend sh
```

#### Database Debugging

```bash
# Check database connection
docker-compose exec backend python manage.py dbshell

# View PostgreSQL logs
docker-compose logs postgres

# List databases
docker-compose exec postgres psql -U postgres -c "\l"
```

## Troubleshooting

### Port Already in Use

If port 80, 3000, 8000, 5432, or 6379 is already in use:

```bash
# Check what's using the port (Windows)
netstat -ano | findstr :<PORT>

# Option 1: Stop the conflicting service

# Option 2: Change ports in docker-compose.yml
# Example: Change nginx port
nginx:
  ports:
    - "8080:80"  # Changed from 80:80
```

### Backend Won't Start

```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - Wait a few seconds and retry
# 2. Missing migrations - Run migrations manually
docker-compose exec backend python manage.py migrate

# 3. Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Frontend Won't Start

```bash
# Check frontend logs
docker-compose logs frontend

# Common issues:
# 1. node_modules issue - Rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 2. Port conflict - Check port 3000
```

### Database Connection Issues

```bash
# 1. Check PostgreSQL is running
docker-compose ps postgres

# 2. Check PostgreSQL logs
docker-compose logs postgres

# 3. Test connection from backend
docker-compose exec backend python manage.py dbshell

# 4. Restart PostgreSQL
docker-compose restart postgres
```

### Permission Errors (Windows)

If you encounter permission errors with volume mounts:

1. Ensure Docker Desktop has access to the drive
2. Check Docker Desktop → Settings → Resources → File Sharing
3. Add the project directory to shared paths

### Cannot Access Application

```bash
# 1. Check all services are running
docker-compose ps

# 2. Check nginx is routing correctly
docker-compose logs nginx

# 3. Test services individually:
# Backend:
curl http://localhost:8000/api/v1/

# Frontend:
curl http://localhost:3000

# Nginx:
curl http://localhost/health
```

### Reset Everything

If all else fails, completely reset:

```bash
# Stop and remove all containers, volumes, and images
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build -d
```

## Production Deployment

For production deployment, use the production stage:

### 1. Update Environment Variables

Create `backend/.env.production`:

```bash
SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
USE_POSTGRES=True

DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=<strong-password>
DB_HOST=postgres
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Build Production Images

```bash
# Build with production target
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### 3. Enable HTTPS

Configure SSL/TLS certificates in nginx:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

### 4. Security Checklist

- [ ] Change all default passwords
- [ ] Generate new `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure firewall rules
- [ ] Enable PostgreSQL authentication
- [ ] Set up automated backups
- [ ] Configure logging and monitoring

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

For issues specific to this Docker setup, check:

1. `docker-compose logs -f` for service errors
2. Individual service logs for detailed errors
3. Project's main `CLAUDE.md` for application-specific details

---

**Last Updated**: 2025-01-16
