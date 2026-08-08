# Meridian Stride Showcase

A full-stack personal finance dashboard for students and groups.

The repository includes:

- `backend/` — Express + MongoDB API with JWT auth, group management, transactions, savings goals, and shared split expense persistence.
- `frontend/` — React + TypeScript app built with Vite, TanStack Start, Tailwind CSS, and PWA support.

## Features

- User authentication and protected API endpoints
- Transaction tracking with categories, notes, and dates
- Savings goals with progress tracking
- Registered user search and persistent groups for shared expenses
- Split expense logging, settlement tracking, and bulk clearing of settled entries
- Net balances and minimal settle-up recommendations
- Responsive UI optimized for desktop and mobile

## Repository layout

```
/backend
  package.json
  .env
  src/
    config/
    middleware/
    models/
    routes/
    services/
/frontend
  package.json
  .env
  src/
    components/
    data/
    hooks/
    lib/
    routes/
    ...
```

## Prerequisites

- Node.js 20+ recommended
- npm
- MongoDB instance (Atlas or local)

## Backend setup

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create or update `.env` with the following values:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   MONGODB_DB=fintrail
   JWT_SECRET=your-random-secret-at-least-32-characters
   CLIENT_ORIGIN=http://localhost:3000
   PORT=5000
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend listens on `http://localhost:5000` by default.

## Frontend setup

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create or update `.env` with the API settings pointing to the backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend is intended to run on `http://localhost:3000` by default.

## Build commands

- Backend production-ready startup:
  ```bash
  cd backend
  npm run start
  ```
- Frontend build:
  ```bash
  cd frontend
  npm run build
  ```

## Environment variables

### Backend

- `MONGODB_URI` — MongoDB connection string
- `MONGODB_DB` — database name
- `JWT_SECRET` — JWT signing secret (min 32 chars)
- `CLIENT_ORIGIN` — allowed frontend origin for CORS
- `PORT` — API server port
- `VITE_API_URL` — optional helper for frontend configuration

### Frontend

- `VITE_API_URL` — backend API base URL used by the app

## Notes

- The backend exposes API routes under `/api`, including `/api/auth`, `/api/transactions`, `/api/goals`, `/api/groups`, and `/api/splits`.
- The frontend uses TanStack Start with SSR-friendly routing and PWA support.
- If you make changes to environment variables, restart the relevant server.

## Useful commands

From `backend/`:
```bash
npm install
npm run dev
npm run start
```

From `frontend/`:
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Contact

This README is generated for the Meridian Stride Showcase repository. Adapt or extend it as needed for deployment or onboarding.
