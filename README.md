# Fintrail (Finwise)

**Fintrail** is a full-stack personal finance dashboard built for students, individuals, and small groups. It turns scattered income and spending into a single, clear financial picture — with auto-categorized transactions, savings goals, spending-anomaly awareness, and a shareable "split expense" mode for roommates and group trips.

Built for **PixxelHack 2.0** (Problem Statement 4 — Personal Finance Tracker) by **Team Codex Alpha**.

---

## Table of contents

- [Live demo](#live-demo)
- [Team](#team)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
- [Environment variables](#environment-variables)
- [API routes](#api-routes)
- [Deployment notes](#deployment-notes)
- [Useful commands](#useful-commands)
- [Feasibility, risks & mitigations](#feasibility-risks--mitigations)
- [Impact & benefits](#impact--benefits)
- [Research & references](#research--references)
- [Roadmap](#roadmap)
- [Contact](#contact)

---

## Live demo

| Layer | URL |
|---|---|
| Frontend | [finwise-self-gamma.vercel.app](https://finwise-self-gamma.vercel.app/) |
| Backend API | [finwise-backend-x5st.onrender.com/api](https://finwise-backend-x5st.onrender.com/api) |

> Note: the backend is hosted on Render's free tier and may take a few seconds to spin up on the first request.

## Team

**Codex Alpha**

- Sai Tejasri Emmadi
- Saksham Kushwah

## Features

- **Secure accounts** — registration and login with JWT-based authentication
- **Quick-add transactions** — log an expense or income entry in about ten seconds, with a note, amount, date, and category
- **Auto-categorization** — a keyword + ML-lite classifier tags each entry (e.g. "Swiggy order" → *Food & drink*) so you rarely have to categorize manually
- **Monthly dashboard** — income, spend, leftover balance, and savings rate at a glance, updated the moment you add an entry
- **Spending visualizations** — cumulative day-by-day spending, category breakdown (donut chart), and income vs. spending trends over the last six months
- **Heads up alerts** — flags unusual spending so surprises don't sneak up on you
- **Savings goals** — create goals and track progress with visual progress rings
- **Split with the group** — create shared groups, log shared expenses (rent, groceries, cab fares), and see exactly who owes whom
- **Smart settlements** — Fintrail computes the simplest way to settle a group's balances in the fewest possible transfers
- **Full transaction history** — filter by month, category, or keyword; delete entries added by mistake
- **Responsive UI** — works cleanly across desktop and mobile
- **Private by design** — your data stays in your own account; nothing is shared with third parties

## Screenshots

The `/docs` or `/screenshots` folder  covers:

- **Dashboard** — monthly income, spend, leftover, savings rate, spending-through-the-month chart, category breakdown, and recent activity
  <img width="1088" height="884" alt="Screenshot 2026-08-08 143746" src="https://github.com/user-attachments/assets/40b76d36-304e-4abd-8207-e777513109d6" />
- **Transactions** — add and browse all logged entries with search and filters
  <img width="1200" height="489" alt="Screenshot 2026-08-08 143823" src="https://github.com/user-attachments/assets/8926e5bc-20f4-4aa3-863f-f0c78469739b" />
- **Split** — group creation, shared expense logging, and net "who owes what" settlement view
  <img width="1247" height="911" alt="Screenshot 2026-08-08 143849" src="https://github.com/user-attachments/assets/cbdd16b7-1dc3-4e64-a944-a85f8f5b45a4" />
- **Auth** — clean create-account / sign-in flow
 <img width="1220" height="597" alt="Screenshot 2026-08-08 143916" src="https://github.com/user-attachments/assets/47abc92a-90dc-4742-803a-a0125124995a" />

## Tech stack

**Frontend**
- React + TypeScript, built with Vite
- TanStack Start for routing
- Tailwind CSS for styling
- Chart.js for income/expense and category visualizations

**Backend**
- Node.js + Express REST API
- MongoDB (via Mongoose) for transaction, goal, group, and split storage
- JWT-based authentication
- CORS-enabled API for the deployed frontend origin

**Deployment**
- Frontend on **Vercel**
- Backend on **Render**
- Database on **MongoDB Atlas**

This is a fully deployed working prototype, not just a local demo.

## Architecture

```
User adds/imports a transaction
        │
        ▼
Auto-categorized by keyword + ML-lite classifier
        │
        ▼
Stored in MongoDB via the Express REST API
        │
        ▼
Dashboard re-renders: monthly summary, category charts,
savings-goal progress, and group settlements — in real time
```

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
    stores/
```

## Getting started

### Prerequisites

- Node.js 20+
- npm
- A MongoDB instance (Atlas or local)

### Backend setup

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following values:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   MONGODB_DB=fintrail
   JWT_SECRET=your-random-secret-at-least-32-characters
   CLIENT_ORIGIN=http://localhost:3000,https://finwise-self-gamma.vercel.app
   PORT=5000
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

The backend runs at `http://localhost:5000`.

### Frontend setup

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file pointing at your backend:
   ```env
   VITE_API_URL=https://finwise-backend-x5st.onrender.com/api
   ```
   (use `http://localhost:5000/api` for local development)
4. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:3000`.

## Environment variables

### Backend

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `JWT_SECRET` | Secret used to sign JWTs (32+ characters) |
| `CLIENT_ORIGIN` | Comma-separated list of allowed frontend origins for CORS |
| `PORT` | Backend server port |
| `VITE_API_URL` | Frontend API base URL (helper reference) |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

## API routes

| Route | Purpose |
|---|---|
| `/api/auth` | Register, log in, and fetch the current user |
| `/api/transactions` | Create, read, update, and delete transactions |
| `/api/goals` | Manage savings goals |
| `/api/groups` | Manage groups and search for users |
| `/api/splits` | Manage split expenses and settlement logic |

## Deployment notes

- Frontend deployed to Vercel: `https://finwise-self-gamma.vercel.app/`
- Backend deployed to Render: `https://finwise-backend-x5st.onrender.com/api`
- Set `VITE_API_URL` in Vercel's environment variables to the Render backend URL
- Set `CLIENT_ORIGIN` on Render to include `https://finwise-self-gamma.vercel.app`
- Restart the backend after changing any Render environment variables

## Useful commands

**Backend** (`backend/`)
```bash
npm install
npm run dev
npm run start
```

**Frontend** (`frontend/`)
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Feasibility, risks & mitigations

- Every baseline feature — tracking, monthly summaries, categories, savings goals, and charts — is built on well-documented, free-tier tools and is fully buildable within a hackathon window.
- **Risk:** students may hesitate to share financial data.
  **Mitigation:** data stays in the student's own account, encrypted at rest, with no third-party sharing.
- **Risk:** inconsistent daily logging.
  **Mitigation:** gentle reminder nudges and a ten-second quick-add flow keep friction near zero.

## Impact & benefits

- **Target audience:** college students, who are often managing money for the first time with no structured tool — Fintrail gives them a habit-forming, judgment-free space to see where their money goes.
- **Social:** builds financial literacy early and reduces money-related stress among students.
- **Economic:** savings goals and spending-anomaly alerts help students cut unnecessary spending and avoid debt traps.
- **Scalability:** the same engine extends naturally to families, freelancers, or small student clubs managing shared budgets.

## Research & references

- [Chart.js documentation](https://www.chartjs.org/) — visualization library used for category and trend charts
- Studied existing budgeting apps (Mint, YNAB, Walnut) to identify gaps for a lightweight, student-first alternative
- [MDN Web Docs — Progressive Web Apps](https://developer.mozilla.org/) — offline-first, installable app guidelines

## Roadmap

- [ ] Push notifications for spending anomalies and goal milestones
- [ ] Multi-currency support
- [ ] Recurring transaction templates
- [ ] Installable PWA with offline caching

## Contact

- GitHub: [github.com/Teja-123-byte](https://github.com/Teja-123-byte)
- ShadowPDF: shhadowpdf
- Live app: [finwise-self-gamma.vercel.app](https://finwise-self-gamma.vercel.app/)
