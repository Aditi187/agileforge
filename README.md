# AgileForge

A project management tool built for small dev teams. Create projects, plan sprints, track issues on a Kanban board, and see progress on a dashboard — all in one place.

## Tech Stack

- **Frontend** — React + Vite
- **Backend** — Node.js + Express
- **Database** — MongoDB Atlas
- **Auth** — JWT

## Getting Started

Clone the repo, then set up the backend:

```bash
cd server
cp .env.example .env   # fill in your MongoDB URI and JWT secret
npm install
node seed/seed.js      # optional: seeds demo data
npm start
```

Then start the frontend:

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | aditi.sharma@gmail.com | Admin@123 |
| Lead | rahul.verma@gmail.com | Lead@123 |
| Developer | priya.patel@gmail.com | Dev@123 |

## Deployment

Live at: https://agileforge-client-aditi.vercel.app

Backend API: https://agileforge-server-aditi.vercel.app

Both deployed on Vercel's free tier. No credit card required.

## Features

- Kanban board with drag-and-drop
- Sprint planning and backlog management
- Dashboard with charts (issue distribution, burn-down, type breakdown)
- Team view with per-member stats
- Role-based access (Admin / Lead / Developer / Viewer)
- Activity feed
