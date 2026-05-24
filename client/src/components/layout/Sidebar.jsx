import React from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, Kanban, List, Zap, Users, FolderOpen, LogOut, Workflow
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'
import api from '../../services/api'

const NAV_ITEMS = [
  { icon: FolderOpen, label: 'Projects', path: '/projects', always: true }
]

const PROJECT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', seg: 'dashboard' },
  { icon: Kanban, label: 'Board', seg: 'board' },
  { icon: List, label: 'Backlog', seg: 'backlog' },
  { icon: Zap, label: 'Sprints', seg: 'sprints' },
  { icon: Users, label: 'Team', seg: 'team' }
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { activeProject } = useAppStore()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data)
  })

  const pathParts = location.pathname.split('/')
  const currentProjectId = pathParts[2]
  const currentSeg = pathParts[3]

  const handleNav = (projectId, seg) => {
    navigate(`/projects/${projectId}/${seg}`)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Workflow size={16} color="#fff" />
        </div>
        <span>AgileForge</span>
      </div>

      <div className="sidebar-section">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {projects.length > 0 && (
        <div className="sidebar-projects">
          <div className="sidebar-label">Projects</div>
          {projects.map(proj => (
            <div key={proj._id}>
              <div
                className={`project-item ${currentProjectId === proj._id ? 'active' : ''}`}
                onClick={() => handleNav(proj._id, 'dashboard')}
              >
                <div className="project-dot" style={{ background: proj.color }} />
                <span className="truncate">{proj.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{proj.key}</span>
              </div>
              {currentProjectId === proj._id && (
                <div style={{ paddingLeft: 18 }}>
                  {PROJECT_NAV.map(nav => (
                    <button
                      key={nav.seg}
                      className={`nav-item ${currentSeg === nav.seg ? 'active' : ''}`}
                      style={{ fontSize: 12 }}
                      onClick={() => handleNav(proj._id, nav.seg)}
                    >
                      <nav.icon size={14} />
                      {nav.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-user">
        <img className="avatar" src={user?.avatar} alt={user?.name} />
        <div className="user-info">
          <div className="user-name truncate">{user?.name}</div>
          <div className="user-role">{user?.role?.replace('_', ' ')}</div>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Logout" style={{ border: 'none', background: 'none' }}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
