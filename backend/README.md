# Project Management System - Backend

Django REST Framework backend for a comprehensive project management system with Gantt charts and Kanban boards.

## Features

- **User Authentication** - JWT-based auth with access and refresh tokens
- **Project Management** - Create and manage projects with budgets and clients
- **Task Management** - Tasks with Kanban and Gantt support
- **Gantt Chart** - Task dependencies, critical path, baselines
- **Kanban Board** - Drag-and-drop task boards
- **Resource Allocation** - Assign team members and track workload
- **Cost Tracking** - Budget vs actual cost tracking
- **Client Management** - Client information and contacts
- **Activity Logs** - Audit trail for all project activities

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (for caching and Celery)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements/development.txt
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

## API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8000/api/docs/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Project Structure

```
backend/
├── apps/
│   ├── accounts/      # User authentication
│   ├── clients/       # Client management
│   ├── projects/      # Project management
│   ├── tasks/         # Task management
│   ├── resources/     # Team members and resources
│   └── analytics/     # Reports and analytics
├── config/            # Django settings
├── core/              # Shared utilities
└── utils/             # Helper functions
```

## Database Models

- **User** - Custom user model with email authentication
- **Client** - Client information
- **Project** - Projects with budgets, dates, and baselines
- **Task** - Tasks with Gantt and Kanban fields
- **TaskDependency** - Task dependencies (FS, SS, FF, SF)
- **TaskAssignment** - Resource allocation
- **TeamMember** - Team members with skills and rates
- **ProjectBaseline** - Multiple baselines per project
- **Comment** - Task comments and collaboration
- **ActivityLog** - Audit trail

## Development

### Run Tests

```bash
pytest
```

### Create Migrations

```bash
python manage.py makemigrations
```

### Apply Migrations

```bash
python manage.py migrate
```

### Load Sample Data

```bash
python manage.py loaddata sample_data.json
```

## Technology Stack

- Django 5.0
- Django REST Framework 3.14
- PostgreSQL
- Redis
- Celery
- JWT Authentication
