import React from 'react'
import { Outlet, useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, Kanban, List, Zap, Users, ChevronRight, FolderOpen } from 'lucide-react'
import Topbar from './Topbar'
import api from '../../services/api'

const PROJECT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', seg: 'dashboard' },
  { icon: Kanban, label: 'Board', seg: 'board' },
  { icon: List, label: 'Backlog', seg: 'backlog' },
  { icon: Zap, label: 'Sprints', seg: 'sprints' },
  { icon: Users, label: 'Team', seg: 'team' }
]

export default function AppLayout() {
  const { projectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const pathParts = location.pathname.split('/')
  const isProjectView = pathParts[1] === 'projects' && projectId && projectId !== 'projects'
  const currentSeg = pathParts[3]

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data),
    enabled: !!isProjectView
  })

  const activeTabLabel = PROJECT_NAV.find(n => n.seg === currentSeg)?.label || ''

  return (
    <div className="app-layout">
      <Topbar />

      {isProjectView && project && (
        <section className="project-banner">
          <div className="project-banner-breadcrumbs">
            <Link to="/projects">Projects</Link>
            <ChevronRight size={10} />
            <span>{project.name}</span>
            {activeTabLabel && (
              <>
                <ChevronRight size={10} />
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{activeTabLabel}</span>
              </>
            )}
          </div>

          <div className="project-banner-content">
            <div className="project-banner-title-area">
              <div className="project-banner-color-icon" style={{ background: (project.color || '#0056d2') + '15' }}>
                <FolderOpen size={28} style={{ color: project.color || '#0056d2' }} />
              </div>
              <div>
                <h1 className="project-banner-title">{project.name}</h1>
                <div className="project-banner-subtitle">
                  Key: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{project.key}</span> · Category: {project.category}
                </div>
                {project.description && (
                  <p className="project-banner-desc">{project.description}</p>
                )}
              </div>
            </div>
            
            {/* Optional action buttons or stats can go here */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`badge badge-${project.status === 'active' ? 'green' : 'gray'}`}>
                {project.status}
              </span>
            </div>
          </div>

          <div className="project-tabs-container">
            {PROJECT_NAV.map(nav => (
              <button
                key={nav.seg}
                className={`project-tab ${currentSeg === nav.seg ? 'active' : ''}`}
                onClick={() => navigate(`/projects/${projectId}/${nav.seg}`)}
              >
                <nav.icon size={14} />
                {nav.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <main className="main-content">
        <div className="page-body">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
