import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Folder } from 'lucide-react'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'

function CreateProjectModal({ onClose }) {
  const [form, setForm] = useState({ name: '', key: '', description: '', category: 'software', color: '#0056d2' })
  const qc = useQueryClient()
  const { showNotification } = useAppStore()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: d => api.post('/projects', d).then(r => r.data),
    onSuccess: (proj) => {
      qc.invalidateQueries(['projects'])
      showNotification(`Project "${proj.name}" created!`)
      onClose()
      navigate(`/projects/${proj._id}/board`)
    }
  })

  const handle = f => setForm(p => ({ ...p, ...f }))
  const submit = e => { e.preventDefault(); mutation.mutate(form) }

  const COLORS = ['#0056d2','#ec4899','#14b8a6','#f59e0b','#22c55e','#ef4444','#a855f7','#3b82f6']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <div className="modal-title">Create Project</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="label">Project Name *</label>
              <input className="input" value={form.name} onChange={e => handle({ name: e.target.value, key: e.target.value.replace(/\W+/g,'').toUpperCase().slice(0,6) })} required placeholder="E.g. E-Commerce Platform" />
            </div>
            <div className="form-group">
              <label className="label">Project Key *</label>
              <input className="input" value={form.key} onChange={e => handle({ key: e.target.value.toUpperCase().slice(0,10) })} required placeholder="ECOM" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input textarea" value={form.description} onChange={e => handle({ description: e.target.value })} placeholder="What is this project about?" />
            </div>
            <div className="form-group">
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => handle({ category: e.target.value })}>
                <option value="software">Software</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => handle({ color: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data)
  })

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1f1f1f', letterSpacing: '-0.5px' }}>Projects</h1>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>{projects.length} active projects</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'project_lead') && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-text">Create your first project to get started</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {projects.map(proj => (
            <div key={proj._id} className="project-card"
              onClick={() => navigate(`/projects/${proj._id}/dashboard`)}
            >
              <div className="project-card-banner" style={{ background: `linear-gradient(135deg, ${proj.color || '#0056d2'}, ${proj.color || '#0056d2'}bb)` }}>
                <span className={`badge badge-${proj.status === 'active' ? 'green' : 'gray'}`} style={{ position: 'absolute', top: 12, right: 12 }}>
                  {proj.status}
                </span>
              </div>
              <div className="project-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: (proj.color || '#0056d2') + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Folder size={11} style={{ color: proj.color || '#0056d2' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {proj.category || 'software'} project
                  </span>
                </div>

                <div className="project-card-title">{proj.name}</div>
                <div className="project-card-key">{proj.key}</div>
                
                <p className="project-card-desc">
                  {proj.description || 'No description provided for this project.'}
                </p>

                <div className="project-card-footer">
                  <div className="flex items-center gap-2">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {proj.members?.slice(0, 4).map((m, idx) => (
                        <img
                          key={m._id}
                          className="avatar avatar-sm"
                          src={m.avatar}
                          alt={m.name}
                          title={m.name}
                          style={{
                            border: '2px solid var(--bg-card)',
                            marginLeft: idx > 0 ? -8 : 0,
                            zIndex: 4 - idx
                          }}
                        />
                      ))}
                      {proj.members?.length > 4 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                          +{proj.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="btn btn-primary btn-sm" style={{ padding: '6px 14px', borderRadius: 4 }}>
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
