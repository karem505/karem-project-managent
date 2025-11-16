# Project Management System - Frontend

Next.js 15 frontend application for the Project Management System.

## Features

- ✅ Authentication (Login/Register) with JWT
- ✅ Dashboard with statistics
- ✅ Responsive layout with sidebar navigation
- ⏳ Project management (CRUD)
- ⏳ Client management (CRUD)
- ⏳ Kanban board with drag-and-drop
- ⏳ Gantt chart (Primavera P6 style)
- ⏳ Task management
- ⏳ Team member management
- ⏳ Analytics and reports

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Drag & Drop:** @dnd-kit
- **Gantt Chart:** DHTMLX Gantt
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Date Handling:** date-fns
- **Icons:** Lucide React

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   copy .env.local.example .env.local
   ```

3. **Update `.env.local` with your backend API URL:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   │
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   │
│   │   └── auth/              # Auth components
│   │       ├── auth-provider.tsx
│   │       └── protected-route.tsx
│   │
│   ├── lib/                   # Core utilities
│   │   ├── api/               # API client
│   │   │   ├── client.ts      # Axios instance
│   │   │   └── endpoints.ts   # API endpoints
│   │   │
│   │   ├── store/             # State management
│   │   │   └── auth-store.ts
│   │   │
│   │   └── utils.ts           # Utility functions
│   │
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   │
│   └── styles/                # Global styles
│       └── globals.css
│
├── public/                    # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the Django backend API. All API calls are made through the Axios client with automatic JWT token refresh.

### Authentication Flow

1. User logs in with username/password
2. Backend returns access token (15min) and refresh token (7 days)
3. Tokens are stored in localStorage
4. Access token is included in all API requests
5. When access token expires, refresh token is used to get a new one
6. If refresh fails, user is redirected to login

### API Endpoints Used

- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/register/` - Register
- `POST /api/v1/auth/refresh/` - Refresh token
- `GET /api/v1/auth/me/` - Get user profile
- `GET /api/v1/analytics/dashboard/` - Dashboard data
- And more...

## Components

### UI Components

- **Button** - Various variants (primary, secondary, outline, ghost, danger)
- **Input** - Text input with label and error states
- **Card** - Container with header and content sections
- **Modal** - Overlay dialog
- **Badge** - Status indicators
- **Select** - Dropdown select
- **Loading** - Spinner for loading states

### Layout Components

- **Header** - Top navigation with user menu
- **Sidebar** - Side navigation menu
- **ProtectedRoute** - Wrapper for authenticated pages

## State Management

Using Zustand for lightweight state management:

- **Auth Store** - User authentication state
  - login()
  - register()
  - logout()
  - checkAuth()

## Styling

TailwindCSS is used for styling with a custom color palette:

- Primary: Blue (#3b82f6)
- Success: Green
- Warning: Yellow
- Danger: Red
- Info: Blue

Custom scrollbar styles and responsive design are included.

## Next Steps

To complete the frontend:

1. **Project Management Pages**
   - Projects list with filters
   - Create/edit project form
   - Project detail view

2. **Kanban Board**
   - Drag-and-drop with @dnd-kit
   - Task cards
   - Status columns

3. **Gantt Chart**
   - DHTMLX Gantt integration
   - Task dependencies
   - Critical path highlighting
   - Baseline comparison

4. **Additional Pages**
   - Client management
   - Team members
   - Reports and analytics

## Troubleshooting

### API Connection Issues

If you can't connect to the backend:

1. Check that the backend is running on http://localhost:8000
2. Verify the `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check for CORS errors in the browser console

### Authentication Issues

If authentication isn't working:

1. Clear localStorage: `localStorage.clear()`
2. Check that JWT tokens are being set
3. Verify backend JWT settings

## License

Proprietary
