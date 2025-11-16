# Getting Started - Project Management System

Complete setup guide for the Project Management System with Gantt charts and Kanban boards.

## Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Redis** (optional, for caching) - [Download](https://redis.io/download/)
- **Git** - [Download](https://git-scm.com/downloads/)

---

## Step 1: Backend Setup (Django)

### 1.1 Navigate to backend directory

```bash
cd backend
```

### 1.2 Run automated setup (Windows)

```bash
setup.bat
```

This will:
- Create a virtual environment
- Install all dependencies
- Create a `.env` file from template

### 1.3 Or manual setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements/development.txt
```

### 1.4 Configure environment

Edit the `.env` file with your database credentials:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 1.5 Create PostgreSQL database

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE project_management;

# Exit
\q
```

### 1.6 Run migrations

```bash
python manage.py migrate
```

### 1.7 Create superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 1.8 Run the development server

```bash
# Using the run script (Windows)
run.bat

# Or manually
python manage.py runserver
```

The backend will be available at:
- **API:** http://localhost:8000/api/v1/
- **Admin:** http://localhost:8000/admin/
- **API Docs:** http://localhost:8000/api/docs/

---

## Step 2: Frontend Setup (Next.js)

### 2.1 Open a new terminal and navigate to frontend

```bash
cd frontend
```

### 2.2 Install dependencies

```bash
npm install
```

### 2.3 Configure environment

```bash
# Create .env.local file
copy .env.local.example .env.local

# Or on Mac/Linux:
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2.4 Run the development server

```bash
npm run dev
```

The frontend will be available at:
- **App:** http://localhost:3000

---

## Step 3: First Login

### 3.1 Register a new account

1. Go to http://localhost:3000
2. Click "Sign up"
3. Fill in the registration form
4. You'll be automatically logged in

### 3.2 Or login with superuser

1. Go to http://localhost:3000/login
2. Use the superuser credentials you created earlier
3. You'll be redirected to the dashboard

---

## Step 4: Verify Everything Works

### 4.1 Check the Dashboard

- You should see statistics widgets
- Financial overview
- Task overview
- Recent activity

### 4.2 Test API Access

Open http://localhost:8000/api/docs/ to:
- View all available API endpoints
- Test API calls directly
- See request/response schemas

### 4.3 Create Test Data (Optional)

You can create test data through the Django admin:

1. Go to http://localhost:8000/admin/
2. Login with your superuser credentials
3. Create:
   - Clients
   - Team Members
   - Projects
   - Tasks

---

## Common Issues & Solutions

### Backend Issues

#### Issue: `ModuleNotFoundError: No module named 'rest_framework'`
**Solution:** Make sure virtual environment is activated and dependencies are installed:
```bash
venv\Scripts\activate
pip install -r requirements/development.txt
```

#### Issue: `django.db.utils.OperationalError: FATAL: password authentication failed`
**Solution:** Check your `.env` file has correct PostgreSQL credentials.

#### Issue: `port 8000 already in use`
**Solution:**
```bash
# Windows: Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Or use a different port
python manage.py runserver 8001
```

### Frontend Issues

#### Issue: `Cannot connect to backend`
**Solution:**
1. Verify backend is running on http://localhost:8000
2. Check `.env.local` has correct API URL
3. Check browser console for CORS errors

#### Issue: `Module not found` errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Issue: `Authentication not working`
**Solution:**
```bash
# Clear browser storage
Open DevTools → Application → Storage → Clear site data
```

### Database Issues

#### Issue: `database "project_management" does not exist`
**Solution:**
```bash
psql -U postgres
CREATE DATABASE project_management;
\q
python manage.py migrate
```

#### Issue: Migration conflicts
**Solution:**
```bash
# Reset migrations (⚠️ will delete all data)
python manage.py migrate --run-syncdb
```

---

## Development Workflow

### Starting Development

1. **Start backend:**
   ```bash
   cd backend
   venv\Scripts\activate
   python manage.py runserver
   ```

2. **Start frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/v1/
   - Admin: http://localhost:8000/admin/

### Making Changes

#### Backend Changes
1. Modify models → Run `python manage.py makemigrations`
2. Apply migrations → Run `python manage.py migrate`
3. Changes to views/serializers → Just reload, no migration needed

#### Frontend Changes
- Changes are hot-reloaded automatically
- If you add new dependencies → Run `npm install`

---

## Next Steps

Now that everything is set up:

1. **Explore the Dashboard** - See statistics and recent activity
2. **Create Projects** - Add your first project (when implemented)
3. **Use Kanban Board** - Manage tasks visually (when implemented)
4. **Try Gantt Chart** - Plan with dependencies (when implemented)
5. **Check API Docs** - Understand available endpoints at `/api/docs/`

---

## Quick Reference

### Backend Commands

```bash
# Activate virtual environment
venv\Scripts\activate

# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
pytest

# Open Django shell
python manage.py shell
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Lint code
npm run lint
```

---

## Support

For issues or questions:
- Check the `/backend/README.md` for backend details
- Check the `/frontend/README.md` for frontend details
- Review the `/PROJECT_SUMMARY.md` for full documentation

---

## What's Built vs What's Pending

### ✅ Complete
- Backend API (100%)
- Authentication system
- Database models
- Base UI components
- Dashboard page
- Layout (header, sidebar)

### ⏳ Pending
- Project management pages
- Client management pages
- Kanban board implementation
- Gantt chart implementation
- Critical path calculation algorithm
- Resource allocation UI
- Reports and analytics pages

---

Happy coding! 🚀
