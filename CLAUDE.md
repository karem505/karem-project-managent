# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack **Project Management System** with Primavera P6-style Gantt charts, Kanban boards, task dependencies, and critical path analysis. Built with Django REST Framework (backend) and Next.js 15 (frontend).

## Development Commands

### Backend (Django)

```bash
cd backend

# Start development server (IMPORTANT: Use venv Python on Windows)
./venv/Scripts/python.exe manage.py runserver  # Windows
# OR
python manage.py runserver  # Linux/Mac with activated venv

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Testing
pytest
pytest apps/tasks/tests/test_dependencies.py  # Single test file
pytest -k test_create_task  # Single test by name
```

### Frontend (Next.js)

```bash
cd frontend

# Development
npm run dev          # Start dev server (http://localhost:3000 or 3001)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint
```

### Default Credentials

After initial setup, use these credentials to login:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@example.com`

Note: Authentication uses username field, not email.

## Architecture

### Backend Structure

**Django Apps** (located in `backend/apps/`):
- `accounts` - JWT authentication with custom User model
- `clients` - Client management
- `projects` - Project CRUD, baselines, activity logs
- `tasks` - Tasks with dual Kanban/Gantt support, dependencies
- `resources` - Team members, skills, hourly rates
- `analytics` - Dashboard stats, reports

**Key Models & Relationships**:
```
User (custom, email-based auth)
  ↓
Client → Project → Task → TaskDependency
              ↓       ↓
         TeamMember  TaskAssignment
              ↓
         ProjectBaseline
```

**Task Model Design** - Single model for both views:
- Kanban fields: `status`, `kanban_order`
- Gantt fields: `start_date`, `end_date`, `duration`, `is_critical`, `slack`
- Both views share: `progress`, `estimated_hours`, `estimated_cost`, `priority`

**API Versioning**: All endpoints under `/api/v1/`

### Frontend Structure

**Tech Stack**:
- Next.js 15 (App Router, Server Components where applicable)
- TypeScript (strict mode)
- Zustand for state management (NOT Redux)
- TailwindCSS for styling
- DHTMLX Gantt for timeline visualization
- @dnd-kit for Kanban drag-and-drop

**Directory Structure**:
```
frontend/src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI (Button, Input, Modal, etc.)
│   ├── kanban/      # Kanban board components
│   ├── gantt/       # Gantt chart components
│   ├── tasks/       # Task forms and cards
│   └── dependencies/# Dependency management
├── lib/
│   ├── api/         # Axios client with JWT interceptors
│   └── store/       # Zustand stores (auth, project, client, task)
└── types/           # TypeScript interfaces
```

**State Management Pattern**:
- Each domain has a Zustand store (e.g., `useTaskStore`, `useProjectStore`)
- Stores handle API calls and local state
- No Redux - Zustand is simpler for this scale

**API Client** (`lib/api/client.ts`):
- Axios instance with base URL from env
- Request interceptor: Adds JWT access token to headers
- Response interceptor: Auto-refreshes token on 401 errors
- Tokens stored in localStorage (access_token, refresh_token)

### Critical Technical Decisions

**1. Task Dependencies**:
- 4 types: FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), SF (Start-to-Finish)
- Backend model: `TaskDependency` with `predecessor`, `successor`, `dependency_type`, `lag`
- Frontend: `DependencyManager` component in task form (only for saved tasks)
- Gantt transforms these to DHTMLX link format (type as string: "0", "1", "2", "3")

**2. Gantt Chart Integration**:
- Uses DHTMLX Gantt library (`dhtmlx-gantt` package)
- Component: `src/components/gantt/gantt-chart.tsx`
- Data transformation: Backend tasks → DHTMLX format with `data` and `links`
- Critical path: Tasks with `is_critical=true` styled red via CSS
- Time scales: Hour/Day/Week/Month with zoom controls

**3. Kanban Board**:
- Uses `@dnd-kit/core` for drag-and-drop
- 5 columns: backlog, todo, in_progress, review, done
- API endpoint: `/api/v1/tasks/kanban/?project={id}` returns grouped tasks
- Move endpoint: `/api/v1/tasks/{id}/move-kanban/` updates status and order

**4. Form Type Pattern**:
When forms have status/priority selects, define explicit types to avoid TypeScript errors:
```typescript
const [formData, setFormData] = useState<{
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  // ... other fields
}>({ /* defaults */ });
```

**5. TailwindCSS Configuration**:
- Custom colors use CSS variables defined in `globals.css`
- Theme extends with HSL color system (e.g., `hsl(var(--primary))`)
- Config in `tailwind.config.js` maps to CSS vars for consistency
- **Material Design theme**: Nature-inspired color palette (sage green, terracotta, sky blue)
- Elevation system: `elevation-1` through `elevation-4` classes for shadows
- Custom animations: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`

**6. CSS Best Practices**:
- **NEVER use opacity modifiers in @apply directives** (e.g., `bg-primary-300/60` in @apply)
- Instead, separate: `@apply bg-primary-300;` + `opacity: 0.6;`
- This prevents build errors in Tailwind compilation

## Common Workflows

### Adding a New Feature

**Backend**:
1. Create model in appropriate app's `models.py`
2. Add serializer in `api/serializers.py`
3. Create viewset in `api/views.py`
4. Register route in `api/urls.py`
5. Run `makemigrations` and `migrate`

**Frontend**:
1. Add TypeScript interface in `src/types/index.ts`
2. Create API functions in `src/lib/api/endpoints.ts`
3. Add store if needed in `src/lib/store/`
4. Build components in appropriate `src/components/` subfolder
5. Integrate into page in `src/app/`

### Working with Task Dependencies

**Creating a dependency** (frontend flow):
1. User edits saved task
2. `DependencyManager` component loads project tasks
3. User selects predecessor, type, lag
4. POST to `/api/v1/tasks/dependencies/`
5. Dependency appears in list
6. Gantt chart auto-updates with new link line

**Backend validation** (in `TaskDependency` model):
- Checks for circular dependencies
- Validates predecessor ≠ successor
- Validates both tasks in same project

### Gantt Chart Data Flow

1. Frontend calls `fetchGanttData(projectId)`
2. Backend endpoint: `GET /api/v1/tasks/gantt/?project={id}`
3. Returns tasks array with embedded `dependencies`
4. Frontend transforms to DHTMLX format:
   ```typescript
   {
     data: tasks.map(t => ({ id, text, start_date, duration, ... })),
     links: dependencies.map(d => ({ id, source, target, type: "0" }))
   }
   ```
5. DHTMLX Gantt renders timeline with dependency lines
6. Critical path tasks styled red via `gantt.templates.task_class`

## File Path Conventions

- **Backend absolute imports**: `from apps.tasks.models import Task`
- **Frontend absolute imports**: `import { Task } from '@/types'` (@ = src/)
- **API endpoints**: Always versioned `/api/v1/`
- **Component files**: kebab-case (e.g., `task-form.tsx`)
- **Store files**: kebab-case with suffix (e.g., `task-store.ts`)

## Environment Variables

**Backend** (`.env`):
```
SECRET_KEY=...
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
# CRITICAL: Include ALL frontend ports to avoid CORS errors
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001
# Database (currently using SQLite for local dev)
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Important Notes**:
- Backend uses **SQLite** for local development (configured in `settings/base.py`)
- CORS settings must match the frontend port (check both `.env` file and `settings/base.py`)
- If frontend runs on different port (e.g., 3001), update CORS_ALLOWED_ORIGINS in `.env`

## Known Issues & Gotchas

1. **CORS Errors on Login**: If you see CORS policy errors in browser console:
   - Check frontend is running on expected port (3000 or 3001)
   - Update `backend/.env` CORS_ALLOWED_ORIGINS to include the correct port
   - Restart backend server after changing .env file
   - Common fix: Add `http://localhost:3001,http://127.0.0.1:3001` to CORS_ALLOWED_ORIGINS

2. **Hydration Errors & Array Operations**:
   - Always check if arrays exist before mapping/filtering: `Array.isArray(data) ? data.map(...) : []`
   - This prevents SSR hydration mismatches
   - Apply to all Zustand store data used in components

3. **Select Component**: Requires `options` prop as array of `{value, label}`. Can't use children directly.

4. **DHTMLX Gantt Link Types**: Must be strings ("0", "1", "2", "3"), not numbers, for TypeScript compatibility.

5. **Task Form Dependencies**: Only show for saved tasks (need task ID). New tasks display info banner.

6. **Zustand fetchTasks**: When adding/editing tasks, manually trigger `fetchTasks(projectId)` or `fetchKanbanData(projectId)` to refresh views.

7. **Axios Type Import**: Use `InternalAxiosRequestConfig` (not `InternalAxeOptions` - typo causes build error).

8. **Build Warnings**: Multiple lockfiles detected. Ignore or set `outputFileTracingRoot` in `next.config.js`.

9. **React Key Props**: Always wrap UUID keys with `String()`: `key={String(item.id)}`

## Testing Strategy

**Backend**: pytest with fixtures in `conftest.py`. Use `@pytest.mark.django_db` for DB tests.

**Frontend**: Manual testing workflow documented in `TESTING_GUIDE.md`. Key test: Create tasks → Add dependencies → View Gantt chart → Verify dependency lines appear.

**Critical Path Test**: Create parallel task paths with different durations. Longest path should highlight red in Gantt.

## Debugging

**Backend API errors**: Check `python manage.py runserver` console output. DRF returns detailed error responses.

**Frontend API errors**: Check browser DevTools Network tab. Axios interceptor logs 401 token refresh attempts.

**White Screen on Frontend**:
1. Check browser console for JavaScript errors
2. Common causes:
   - Invalid syntax in `tailwind.config.js` (no inline `//` comments in objects)
   - Using opacity modifiers in `@apply` directives in CSS
   - Missing array safety checks causing hydration errors
3. Check Next.js dev server output for compilation errors

**CORS Errors**:
1. Verify backend `.env` has correct CORS_ALLOWED_ORIGINS
2. Check frontend is running on expected port
3. Restart backend server after .env changes
4. Look for "blocked by CORS policy" in browser console

**Login Failed**:
1. Check if using correct field: username (not email) for login
2. Default credentials: username=`admin`, password=`admin123`
3. Verify backend is receiving POST request (not just OPTIONS)
4. Check for CORS errors blocking the request

**Gantt not showing dependencies**:
1. Verify backend returns `dependencies` array in task objects
2. Check browser console for DHTMLX errors
3. Ensure tasks have valid `start_date` and `end_date`
4. Verify Array.isArray() check in gantt-chart.tsx loadGanttData function

**Zustand state not updating**: Check if store function is async and you're awaiting it. Use `set()` or `get()` within store correctly.

## Production Considerations

- Backend: Set `DEBUG=False`, configure proper `ALLOWED_HOSTS`, use production DB
- Frontend: Run `npm run build` to generate optimized bundle
- Database: Ensure PostgreSQL indexes on foreign keys and frequently queried fields
- Security: JWT tokens in httpOnly cookies (currently localStorage - upgrade for production)
- Static files: Backend uses WhiteNoise for serving static files
- CORS: Configure `CORS_ALLOWED_ORIGINS` for production frontend domain
