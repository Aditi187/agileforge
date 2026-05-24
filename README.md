# AgileForge

A full-stack Agile project management tool inspired by Jira, built with MongoDB, Express, React, and Node.js (MERN stack). This application provides teams with an intuitive way to plan sprints, manage backlogs, track issues on a Kanban board, and view team productivity statistics.

## Core Features

* **Kanban Board**: Drag-and-drop workflow system to update issue statuses (`Backlog`, `To Do`, `In Progress`, `In Review`, `Done`) in real-time.
* **Sprint Lifecycle**: Create sprints, assign issues, start active sprints, and complete sprints (with automated rollover of uncompleted tasks).
* **Backlog Management**: A dedicated page to drag and drop issues between the project backlog and planned sprints.
* **Team Dashboard**: Visual statistics showing sprint progress, issue breakdown by type/priority, and recent activity logs.
* **Team Analytics & Leaderboard**: Track story points completed by team members with a gamified leaderboard.
* **Issue Discussions**: Leave comments directly on issues to discuss status updates.
* **Role-Based Authentication**: Secure JWT-based access control with different operations permitted for Admins, Project Leads, and Developers.

## Tech Stack

* **Frontend**: React 18, React Router v6, TanStack Query (React Query) for server state caching, Zustand for lightweight local state management, Recharts for charts, and `@dnd-kit/core` for drag-and-drop board functionality.
* **Backend**: Node.js, Express.js, Mongoose ODM, JWT authentication, and bcryptjs.

## Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB (Local instance or MongoDB Atlas cluster connection URI)

### Setup Instructions

1. **Clone and navigate to the directory**:
   ```bash
   git clone https://github.com/Aditi187/agileforge.git
   cd agileforge
   ```

2. **Configure environment variables**:
   Create a `.env` file in the `/server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=some_strong_secret_key
   CLIENT_URL=http://localhost:5173
   ```

3. **Install dependencies**:
   Run the utility script in the root directory to install root, backend, and frontend packages:
   ```bash
   npm run install-all
   ```

4. **Seed sample data**:
   Populate the database with demo users, sprints, issues, and activities:
   ```bash
   npm run seed
   ```

5. **Start the development servers**:
   ```bash
   npm run dev
   ```
   * Frontend: http://localhost:5173
   * Backend API: http://localhost:5000

## Sample Users for Testing

Clicking any credential on the login screen will auto-fill it:

* **Admin User**: `aditi.sharma@gmail.com` / Password: `Admin@123`
* **Project Lead**: `rahul.verma@gmail.com` / Password: `Lead@123`
* **Developer**: `priya.patel@gmail.com` / Password: `Dev@123`
