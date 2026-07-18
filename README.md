# PulseLedger Frontend

PulseLedger Frontend is a Next.js web app for a coach-client wellness platform. It supports role-based experiences for clients, coaches, and admins, with tools for workout/diet planning, subscriptions, product orders, notifications, and progress tracking.

## About this app

This frontend powers the user-facing experience of the PulseLedger platform:
- **Clients** discover coaches, subscribe to plans, follow workout/diet schedules, and track progress.
- **Coaches** manage clients, build templates and plans, monitor results, and handle subscriptions/orders.
- **Admins** oversee platform-level operations and management workflows.

## Key features

- Role-based authentication and protected routes
- Client and coach dashboards
- Workout and diet plan workflows
- Progress logging (metrics + photos)
- Notifications and chat support
- Product and order management
- PWA support and optimized image handling

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Zustand + React Query
- Tailwind CSS

## Developer setup

### Prerequisites

- Node.js **20+**
- npm
- A running backend API

### 1) Install dependencies

```bash
npm ci
```

### 2) Configure environment

Create a `.env.local` file in the project root:

```env
# Backend base URL used by Next.js rewrites and API proxying
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Public API URL for direct contact/bug-report submissions
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Optional socket endpoint (falls back to NEXT_PUBLIC_BACKEND_URL)
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build and run

### Production build

```bash
npm run build
```

### Start production server

```bash
npm run start
```

## Quality checks

```bash
npm run lint
npm run type-check
```

## Project scripts

- `npm run dev` – start development server
- `npm run build` – create production build
- `npm run start` – run production server
- `npm run lint` – run ESLint
- `npm run type-check` – run TypeScript checks
- `npm run analyze` – bundle analysis build
- `npm run images:compress` – optimize images from `scripts/optimize_images.py`
