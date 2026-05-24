# AgileForge 🚀

A full-stack **Agile Project Management System** inspired by Jira, built from scratch using the **MERN Stack** (MongoDB, Express.js, React, Node.js).

![AgileForge](https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login with role-based access (Admin, Project Lead, Developer, Viewer)
- 📊 **Dashboard** — KPI cards, issue distribution charts, sprint progress, activity feed
- 🗂️ **Kanban Board** — Drag-and-drop issue cards across 5 columns (Backlog → Done)
- 📋 **Backlog Management** — Move issues between sprints and backlog
- ⚡ **Sprint Management** — Create, start, and complete sprints with lifecycle control
- 👥 **Team Page** — Member performance cards, stats, and leaderboard
- 💬 **Comments** — Add comments to issues with real-time UI updates
- 📈 **Charts** — Recharts-powered pie, bar charts for data visualization
- 🌱 **Seed Data** — 6 users, 2 projects, 4 sprints, 21 issues pre-loaded

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| State Management | Zustand + TanStack Query |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ 
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/agileforge.git
cd agileforge
```

### 2. Configure Environment Variables

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agileforge
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

> For local MongoDB use: `MONGO_URI=mongodb://localhost:27017/agileforge`

### 3. Install Dependencies

```bash
npm run install-all
```

This installs dependencies for root, server, and client.

### 4. Seed the Database

```bash
npm run seed
```

This creates 6 demo users, 2 projects, 4 sprints, and 21 issues.

### 5. Run the Application

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@agileforge.dev | Admin@123 |
| Project Lead | lead@agileforge.dev | Lead@123 |
| Developer | dev@agileforge.dev | Dev@123 |

> Demo credentials are shown on the login page — click to auto-fill!

---

## 📁 Project Structure

```
agileforge/
├── client/          # React Frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level pages
│       ├── store/        # Zustand state stores
│       └── services/     # Axios API service
│
├── server/          # Express.js Backend
│   ├── config/      # MongoDB connection
│   ├── controllers/ # Route handler logic
│   ├── middleware/  # JWT auth, error handler
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API route definitions
│   └── seed/        # Demo data seeder
│
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login user |
| POST | /api/auth/register | Register user |
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| GET | /api/issues?project= | Get issues (filtered) |
| POST | /api/issues | Create issue |
| PUT | /api/issues/:id | Update issue |
| GET | /api/sprints?project= | Get sprints |
| PUT | /api/sprints/:id/start | Start sprint |
| PUT | /api/sprints/:id/complete | Complete sprint |
| GET | /api/comments?issue= | Get comments |
| POST | /api/comments | Add comment |
| GET | /api/activities?project= | Get activity log |

---

## 🌐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| MONGO_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | JWT signing secret | random_secret_string |
| PORT | Server port | 5000 |
| CLIENT_URL | Frontend URL (for CORS) | http://localhost:5173 |

---

## 📜 Git Commit Convention

```
feat: add kanban drag-and-drop
fix: resolve CORS issue on sprint routes
chore: update dependencies
```

---

## 🏗️ Built For

MERN Stack Developer Intern — Technical Assessment  
**Module**: Agile Project Management (Jira-inspired)

---

*Built with ❤️ using MERN Stack*
