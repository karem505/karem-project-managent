# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack **Project Management System** with Primavera P6-style Gantt charts, Kanban boards, task dependencies, and critical path analysis. Built with Django REST Framework (backend) and Next.js 15 (frontend).

## Development Commands

### Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend, Nginx)
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs -f backend     # Backend only
docker-compose logs -f frontend    # Frontend only

# Stop all services
docker-compose down

# Rebuild containers after code changes
docker-compose up -d --build

# Access running containers
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py migrate
docker-compose exec frontend npm install  # If dependencies change
docker-compose exec frontend sh           # Access frontend shell

# Clean restart (removes volumes - WARNING: deletes database)
docker-compose down -v
docker-compose up -d --build
```

**Service URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- Admin Panel: http://localhost:8000/admin
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Backend (Django) - Local Development

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

### Frontend (Next.js) - Local Development

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

### Docker Architecture

**Services** (defined in `docker-compose.yml`):
1. **db** (PostgreSQL 16): Main database on port 5432
2. **redis** (Redis 7): Caching and session storage on port 6379
3. **backend** (Django): REST API on port 8000
4. **frontend** (Next.js): React app on port 3000
5. **nginx**: Reverse proxy on port 80

**Service Dependencies**:
- Backend depends on: db, redis
- Frontend depends on: backend
- Nginx depends on: backend, frontend

**Critical Docker Configuration**:
- Backend `Dockerfile` requires `netcat-openbsd` for health checks in entrypoint.sh
- Frontend uses `NEXT_PUBLIC_API_URL=http://localhost/api/v1` (NOT nginx hostname)
- CORS configured in backend `.env`: `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001`
- Volumes mount code for hot-reloading (node_modules excluded for frontend)
- Backend entrypoint waits for PostgreSQL and Redis before starting

**Health Checks**:
- Backend: `nc -z db 5432` and `nc -z redis 6379` in entrypoint.sh
- Database migrations run automatically on backend startup

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
- shadcn/ui components (based on Radix UI primitives)
- Radix UI (@radix-ui/react-slot, react-label, react-select, react-dialog)
- next-themes for dark mode
- Recharts for data visualization
- DHTMLX Gantt for timeline visualization
- @dnd-kit for Kanban drag-and-drop

**Directory Structure**:
```
frontend/src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components (Button, Input, Modal, Select, Card, etc.)
│   ├── layout/      # App Shell navigation (nav-sidebar, top-header, breadcrumbs)
│   ├── kanban/      # Kanban board components
│   ├── gantt/       # Gantt chart components
│   ├── tasks/       # Task forms and cards
│   └── dependencies/# Dependency management
├── lib/
│   ├── api/         # Axios client with JWT interceptors
│   ├── store/       # Zustand stores (auth, project, client, task)
│   └── utils.ts     # Utility functions (cn, formatCurrency, formatDate, etc.)
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

**5. Design System & UI Components**:
- **shadcn/ui**: Copy-paste component library based on Radix UI primitives
- **Configuration**: `components.json` in project root with "new-york" style
- **Component imports**: Use `@/components/ui/*` for all UI components
- **SelectField wrapper**: For backward compatibility with old Select API (see `components/ui/select-field.tsx`)
- When updating existing code, import SelectField as: `import { SelectField as Select } from '@/components/ui/select-field'`

**6. TailwindCSS Configuration**:
- **Professional color scheme**: Slate blue primary (#3b82f6), neutral grays for secondary
- Custom colors use CSS variables defined in `globals.css` (light and dark mode support)
- Theme extends with HSL color system (e.g., `hsl(var(--primary))`)
- Config in `tailwind.config.js` with `darkMode: ["class"]` for theme switching
- **shadcn/ui color tokens**: primary, secondary, accent, destructive, success, warning, muted, border, input, ring
- **CSS Best Practice**: NEVER use opacity modifiers in @apply directives (e.g., `bg-primary-300/60`)

**7. Dark Mode Implementation**:
- Uses `next-themes` package for theme management
- ThemeProvider wraps app in `src/app/layout.tsx`
- Theme toggle component in top header (`src/components/theme-toggle.tsx`)
- CSS variables defined for both light and dark modes in `globals.css`
- All components use semantic color tokens (e.g., `bg-background`, `text-foreground`)
- System preference detection enabled

**8. Navigation & Layout Pattern**:
- **App Shell Pattern**: Persistent sidebar with contextual top header
- Main layout components in `src/components/layout/`:
  - `app-shell.tsx`: Root layout wrapper (renders sidebar + header + main content)
  - `nav-sidebar.tsx`: Persistent navigation with user profile, logout
  - `top-header.tsx`: Breadcrumbs, search, theme toggle, notifications
  - `breadcrumbs.tsx`: Auto-generates breadcrumbs from current route
- Auth pages (login, register) bypass the app shell
- Layout wraps all pages except auth via conditional check in AppShell component

## Component Library & Best Practices

### shadcn/ui Components

**Installation**:
- Components are NOT installed via npm - they're copied into your codebase
- Use shadcn CLI to add components: `npx shadcn-ui@latest add [component-name]`
- Components live in `src/components/ui/`
- Configuration in `components.json`

**Available Components** (already installed):
- Button (with isLoading support)
- Input
- Select (Radix UI based)
- SelectField (backward compatibility wrapper)
- Card, CardHeader, CardContent, CardFooter
- Modal, ModalFooter
- Label
- Loading spinner
- Theme components (ThemeProvider, ThemeToggle)

**Component Usage Patterns**:

```typescript
// Button with loading state
<Button isLoading={isSubmitting} onClick={handleSubmit}>
  Save Changes
</Button>

// Select with old API (use SelectField)
import { SelectField as Select } from '@/components/ui/select-field';
<Select
  label="Status"
  name="status"
  value={formData.status}
  onChange={handleChange}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ]}
/>

// Card layout
<Card>
  <CardHeader>
    <CardTitle>Project Stats</CardTitle>
    <CardDescription>Overview of project metrics</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>

// Modal with form
<Modal isOpen={showForm} onClose={closeForm} title="Create Task" size="lg">
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <ModalFooter>
      <Button variant="outline" onClick={closeForm}>Cancel</Button>
      <Button type="submit">Save</Button>
    </ModalFooter>
  </form>
</Modal>
```

### Styling Best Practices

**Color Token Usage**:
```typescript
// ✅ GOOD: Use semantic color tokens
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="border-border">

// ❌ BAD: Hardcoded colors
<div className="bg-white text-black">
<div className="bg-blue-500 text-white">
```

**Responsive Design**:
```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="text-sm md:text-base lg:text-lg">
```

**Component Composition with cn()**:
```typescript
import { cn } from '@/lib/utils';

// Merge Tailwind classes properly
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className  // Allow parent to override
)}>
```

### Form Patterns

**Typed Form State**:
```typescript
const [formData, setFormData] = useState<{
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  name: string;
  startDate: string;
}>({
  status: 'planning',
  priority: 'medium',
  name: '',
  startDate: '',
});
```

**Validation Pattern**:
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.name.trim()) newErrors.name = 'Name is required';
  if (!formData.startDate) newErrors.startDate = 'Start date is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  // Submit logic
};
```

### Data Fetching Patterns

**Zustand Store Pattern**:
```typescript
// In store
export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.list(params);
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

// In component
const { projects, isLoading, error, fetchProjects } = useProjectStore();

useEffect(() => {
  fetchProjects();
}, [fetchProjects]);

// Safe array rendering
{Array.isArray(projects) ? projects.map(p => (
  <ProjectCard key={String(p.id)} project={p} />
)) : null}
```

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

### Docker Issues

1. **Backend container: "nc: command not found"**:
   - Error: `/entrypoint.sh: line 6: nc: command not found`
   - Fix: Ensure `netcat-openbsd` is in backend/Dockerfile apt-get install list
   - This is required for database health checks in entrypoint.sh

2. **Frontend container: "Cannot find module 'tailwindcss'"**:
   - Error: Module not found despite being in package.json
   - Cause: Docker volume mount overwrites node_modules
   - Fix: Run `docker-compose exec frontend npm install` in running container
   - Then restart: `docker-compose restart frontend`

3. **Port Already Allocated**:
   - Error: `Bind for 0.0.0.0:3000 failed: port is already allocated`
   - Fix: Find conflicting container with `docker ps -a` and stop it
   - Or change port in docker-compose.yml

4. **API Connection: ERR_NAME_NOT_RESOLVED**:
   - Error: Browser can't resolve `http://nginx/api/v1`
   - Cause: `nginx` is Docker internal hostname, not accessible from browser
   - Fix: Use `http://localhost/api/v1` in `NEXT_PUBLIC_API_URL`
   - Update both docker-compose.yml and frontend/.env.local

### Frontend Issues

5. **CORS Errors on Login**: If you see CORS policy errors in browser console:
   - Check frontend is running on expected port (3000 or 3001)
   - Update `backend/.env` CORS_ALLOWED_ORIGINS to include the correct port
   - Restart backend server after changing .env file
   - Common fix: Add `http://localhost:3001,http://127.0.0.1:3001` to CORS_ALLOWED_ORIGINS

6. **Hydration Errors & Array Operations**:
   - Always check if arrays exist before mapping/filtering: `Array.isArray(data) ? data.map(...) : []`
   - This prevents SSR hydration mismatches
   - Apply to all Zustand store data used in components

7. **React isLoading Prop Error**:
   - Error: `React does not recognize the isLoading prop on a DOM element`
   - Cause: Button component not properly extracting isLoading from props
   - Fix: Ensure Button component has `isLoading` in interface and extracts it before spreading {...props}

8. **Select Component API**:
   - Old API: Used `options` prop and `onChange` with synthetic event
   - New API (shadcn/ui): Uses Radix UI Select with children and `onValueChange`
   - Fix: Use `SelectField` wrapper from `@/components/ui/select-field` for backward compatibility
   - Import as: `import { SelectField as Select } from '@/components/ui/select-field'`

### General Issues

9. **DHTMLX Gantt Link Types**: Must be strings ("0", "1", "2", "3"), not numbers, for TypeScript compatibility.

10. **Task Form Dependencies**: Only show for saved tasks (need task ID). New tasks display info banner.

11. **Zustand fetchTasks**: When adding/editing tasks, manually trigger `fetchTasks(projectId)` or `fetchKanbanData(projectId)` to refresh views.

12. **Axios Type Import**: Use `InternalAxiosRequestConfig` (not `InternalAxeOptions` - typo causes build error).

13. **React Key Props**: Always wrap UUID keys with `String()`: `key={String(item.id)}`

## Testing Strategy

**Backend**: pytest with fixtures in `conftest.py`. Use `@pytest.mark.django_db` for DB tests.

**Frontend**: Manual testing workflow documented in `TESTING_GUIDE.md`. Key test: Create tasks → Add dependencies → View Gantt chart → Verify dependency lines appear.

**Critical Path Test**: Create parallel task paths with different durations. Longest path should highlight red in Gantt.

## Debugging

### Docker Debugging

**Container won't start**:
1. Check logs: `docker-compose logs [service_name]`
2. Verify all dependencies are healthy: `docker-compose ps`
3. Check for port conflicts: `docker ps -a` and look for port bindings
4. Rebuild if needed: `docker-compose up -d --build`

**Backend container repeatedly restarting**:
1. Check entrypoint.sh execution: `docker-compose logs backend`
2. Verify netcat is installed: `docker-compose exec backend which nc`
3. Ensure PostgreSQL is accessible: `docker-compose exec backend nc -z db 5432`
4. Check for Python errors in startup: Look for traceback in logs

**Frontend container errors**:
1. Check if node_modules exists: `docker-compose exec frontend ls -la node_modules`
2. If missing dependencies, run: `docker-compose exec frontend npm install`
3. Check build errors: `docker-compose logs frontend`
4. Verify environment variables: `docker-compose exec frontend env | grep NEXT_PUBLIC`

**Database connection issues**:
1. Verify PostgreSQL is running: `docker-compose ps db`
2. Check backend can connect: `docker-compose exec backend python manage.py dbshell`
3. Verify credentials match in docker-compose.yml and backend settings
4. Check if migrations ran: `docker-compose exec backend python manage.py showmigrations`

**Network issues between services**:
1. Verify all services on same network: `docker network inspect projetc-management_default`
2. Test backend from frontend: `docker-compose exec frontend ping backend`
3. Check nginx configuration: `docker-compose exec nginx cat /etc/nginx/conf.d/default.conf`

### Frontend Debugging

**API errors**: Check browser DevTools Network tab. Axios interceptor logs 401 token refresh attempts.

**White Screen on Frontend**:
1. Check browser console for JavaScript errors
2. Common causes:
   - Invalid syntax in `tailwind.config.js` (no inline `//` comments in objects)
   - Using opacity modifiers in `@apply` directives in CSS
   - Missing array safety checks causing hydration errors
   - React component prop errors (e.g., isLoading on DOM element)
3. Check Next.js dev server output for compilation errors
4. Verify all shadcn/ui components are properly installed

**CORS Errors**:
1. Verify backend `.env` has correct CORS_ALLOWED_ORIGINS
2. Check frontend is running on expected port
3. Restart backend server after .env changes: `docker-compose restart backend`
4. Look for "blocked by CORS policy" in browser console
5. Ensure NEXT_PUBLIC_API_URL uses `localhost` not Docker service names

**Login Failed**:
1. Check if using correct field: username (not email) for login
2. Default credentials: username=`admin`, password=`admin123`
3. Verify backend is receiving POST request (not just OPTIONS)
4. Check for CORS errors blocking the request
5. Verify JWT tokens are being stored in localStorage

**Gantt not showing dependencies**:
1. Verify backend returns `dependencies` array in task objects
2. Check browser console for DHTMLX errors
3. Ensure tasks have valid `start_date` and `end_date`
4. Verify Array.isArray() check in gantt-chart.tsx loadGanttData function
5. Check DHTMLX license warnings (may affect rendering)

**Dark mode not working**:
1. Verify ThemeProvider wraps app in layout.tsx
2. Check `suppressHydrationWarning` on html tag
3. Ensure next-themes is installed: `npm list next-themes`
4. Verify CSS variables defined for both :root and .dark in globals.css

### Backend Debugging

**API errors**: Check `python manage.py runserver` or `docker-compose logs backend` output. DRF returns detailed error responses.

**Database errors**:
1. Check migrations are current: `python manage.py showmigrations`
2. Look for model validation errors in traceback
3. Verify foreign key relationships exist
4. Check database constraints (unique, null, etc.)

**Zustand state not updating**:
1. Check if store function is async and you're awaiting it
2. Use `set()` or `get()` within store correctly
3. Verify API call succeeded (check Network tab)
4. Ensure component is subscribed to the correct store slice

## Key Files Reference

### Configuration Files

**Root Level**:
- `docker-compose.yml`: Service orchestration (PostgreSQL, Redis, Backend, Frontend, Nginx)
- `.env`: Backend environment variables (CRITICAL for CORS configuration)
- `components.json`: shadcn/ui configuration

**Backend**:
- `backend/Dockerfile`: Must include `netcat-openbsd` for health checks
- `backend/entrypoint.sh`: Waits for db/redis, runs migrations, starts server
- `backend/config/settings/base.py`: Django settings with CORS, JWT, database config
- `backend/requirements.txt`: Python dependencies

**Frontend**:
- `frontend/.env.local`: Frontend environment variables (NEXT_PUBLIC_API_URL)
- `frontend/tailwind.config.js`: Professional color system, darkMode: ["class"]
- `frontend/src/app/globals.css`: CSS variables for light/dark themes
- `frontend/src/app/layout.tsx`: Root layout with ThemeProvider and AppShell
- `frontend/src/lib/utils.ts`: Utility functions (cn, formatCurrency, formatDate)
- `frontend/components.json`: shadcn/ui settings

### Critical Code Locations

**Authentication Flow** (frontend/src/lib/api/client.ts:59-95):
- Axios request interceptor adds JWT access token
- Response interceptor handles 401 by refreshing token
- Tokens stored in localStorage

**App Shell Layout** (frontend/src/components/layout/app-shell.tsx:12-29):
- Conditional rendering: bypasses shell for /login and /register
- Wraps all other pages with sidebar + header + main content

**Gantt Data Transformation** (frontend/src/components/gantt/gantt-chart.tsx:45-90):
- Converts backend Task model to DHTMLX format
- Maps dependencies to links with type conversion
- Applies critical path styling

**Dependency Validation** (backend/apps/tasks/models.py - TaskDependency.clean()):
- Checks for circular dependencies
- Validates predecessor ≠ successor
- Ensures both tasks in same project

**Theme System** (frontend/src/app/globals.css:10-80):
- CSS variables defined for :root (light) and .dark (dark mode)
- All color tokens use HSL format: `hsl(var(--primary))`

## Production Considerations

**Docker Deployment**:
- Use production Dockerfile with multi-stage builds
- Set environment variables via docker-compose or orchestration platform
- Configure volume persistence for PostgreSQL data
- Use named volumes for database backups
- Set restart policies for all services

**Backend**:
- Set `DEBUG=False` in production
- Configure proper `ALLOWED_HOSTS` with production domains
- Use production database (PostgreSQL with proper resources)
- Set strong `SECRET_KEY` (use secrets management)
- Configure HTTPS and secure cookies for JWT
- Enable Django's security middleware
- Set up proper logging (not console)
- Use gunicorn or uWSGI instead of runserver
- Configure static file serving via WhiteNoise or CDN

**Frontend**:
- Run `npm run build` to generate optimized bundle
- Use Next.js standalone output mode for Docker
- Configure CDN for static assets
- Enable production optimizations in next.config.js
- Set proper CSP headers
- Configure error tracking (e.g., Sentry)

**Database**:
- Ensure PostgreSQL indexes on foreign keys and frequently queried fields
- Set up regular backups (pg_dump scheduled via cron)
- Configure connection pooling (pgBouncer)
- Monitor query performance with pg_stat_statements
- Set appropriate work_mem and shared_buffers

**Security**:
- **CRITICAL**: Move JWT tokens from localStorage to httpOnly cookies
- Enable HTTPS everywhere (use Let's Encrypt for SSL)
- Configure CORS for production frontend domain only
- Set up rate limiting on API endpoints
- Enable Django's SECURE_SSL_REDIRECT
- Use environment-based secrets (never commit .env files)
- Implement CSRF protection for state-changing operations
- Regular security audits and dependency updates

**Monitoring & Performance**:
- Set up application monitoring (New Relic, DataDog, or similar)
- Configure log aggregation (ELK stack or CloudWatch)
- Monitor Docker container health
- Set up alerts for service failures
- Track frontend performance with Web Vitals
- Monitor API response times and error rates
- Database query performance monitoring
