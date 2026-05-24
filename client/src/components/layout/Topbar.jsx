import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Search } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  board: 'Board',
  backlog: 'Backlog',
  sprints: 'Sprints',
  team: 'Team',
  projects: 'All Projects'
}

export default function Topbar() {
  const { user } = useAuthStore()
  const location = useLocation()
  const parts = location.pathname.split('/')
  const seg = parts[3] || parts[1]
  const projectId = parts[2]

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data),
    enabled: !!projectId && projectId !== 'projects'
  })

  const title = PAGE_TITLES[seg] || 'AgileForge'
  const subtitle = project ? `${project.key} · ${project.name}` : ''

  return (
    <header className="topbar">
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      <div className="search-bar" style={{ width: 220 }}>
        <Search size={14} />
        <input placeholder="Search issues..." />
      </div>
      <button className="btn-icon">
        <Bell size={15} />
      </button>
      <img className="avatar" src={user?.avatar} alt={user?.name} title={user?.name} />
    </header>
  )
}
