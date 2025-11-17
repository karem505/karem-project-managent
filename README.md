# Project Management System

A full-stack **Project Management System** with Primavera P6-style Gantt charts, Kanban boards, task dependencies, and critical path analysis.

## Tech Stack

**Backend:**
- Django 5.0 + Django REST Framework
- PostgreSQL database
- JWT authentication
- Celery for async tasks
- Redis for caching

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Zustand for state management
- TailwindCSS
- DHTMLX Gantt for timeline visualization
- @dnd-kit for Kanban drag-and-drop

## Features

- 🎯 **Dual View System**: Switch between Kanban boards and Gantt charts
- 📊 **Task Dependencies**: Support for FS, SS, FF, SF dependency types
- 🔴 **Critical Path Analysis**: Automatically highlights critical tasks
- 👥 **Resource Management**: Team members with skills and hourly rates
- 📈 **Analytics Dashboard**: Project insights and reporting
- 🔐 **JWT Authentication**: Secure API access
- 📱 **Responsive Design**: Works on desktop and mobile

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd karem-project-managent

# Start all services
docker-compose up -d

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin/

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Railway (Recommended for Production)

Deploy to Railway with full environment variable setup:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Quick Setup:**
```bash
# Run the setup script to generate environment variables
./railway-setup.sh
```

📖 **Documentation:**
- [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) - Complete step-by-step deployment guide with all environment variables
- [RAILWAY_CHECKLIST.md](./RAILWAY_CHECKLIST.md) - Quick reference checklist
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Overview and additional details

**Environment Templates:**
- Backend: [.env.railway](./.env.railway)
- Frontend: [.env.railway.frontend](./.env.railway.frontend)

### Docker Production

```bash
docker-compose -f docker-compose.yml up -d
```

## Documentation

- [Getting Started Guide](./GETTING_STARTED.md)
- **Railway Deployment:**
  - [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) - Complete deployment guide with environment variables
  - [RAILWAY_CHECKLIST.md](./RAILWAY_CHECKLIST.md) - Quick reference checklist
  - [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Overview
- [Docker Setup](./DOCKER_README.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Development Guide](./CLAUDE.md)

## Project Structure

```
karem-project-managent/
├── backend/              # Django REST Framework API
│   ├── apps/            # Django applications
│   │   ├── accounts/    # Authentication
│   │   ├── clients/     # Client management
│   │   ├── projects/    # Project CRUD
│   │   ├── tasks/       # Tasks & dependencies
│   │   ├── resources/   # Team members
│   │   └── analytics/   # Dashboard stats
│   ├── config/          # Django settings
│   └── requirements/    # Python dependencies
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # Next.js pages
│   │   ├── components/ # React components
│   │   ├── lib/        # API client & stores
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
└── nginx/              # Reverse proxy config
```

## Default Credentials

After initial setup:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ Change these credentials in production!

## Environment Variables

Copy `.env.example` to `.env` and configure:

**Backend:**
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- ReDoc: http://localhost:8000/api/schema/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Development

### Backend Commands

```bash
cd backend

# Run tests
pytest

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend (manual testing workflow)
# See TESTING_GUIDE.md for detailed test scenarios
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using Django and Next.js**
