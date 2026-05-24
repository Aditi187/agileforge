import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Board from './pages/Board/Board'
import Backlog from './pages/Backlog/Backlog'
import SprintsPage from './pages/Sprints/SprintsPage'
import IssueDetail from './pages/Issues/IssueDetail'
import TeamPage from './pages/Team/TeamPage'
import ProjectsPage from './pages/Projects/ProjectsPage'
import Notification from './components/common/Notification'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Notification />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId/dashboard" element={<Dashboard />} />
          <Route path="projects/:projectId/board" element={<Board />} />
          <Route path="projects/:projectId/backlog" element={<Backlog />} />
          <Route path="projects/:projectId/sprints" element={<SprintsPage />} />
          <Route path="projects/:projectId/team" element={<TeamPage />} />
          <Route path="issues/:issueId" element={<IssueDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
