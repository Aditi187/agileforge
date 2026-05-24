import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Folder, Users, LayoutDashboard, Zap } from 'lucide-react'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'

function CreateProjectModal({ onClose }) {
  const [form, setForm] = useState({ name: '', key: '', description: '', category: 'software', color: '#6366f1' })
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

  const COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#22c55e','#ef4444','#a855f7','#3b82f6']

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
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Projects</h1>
          <p className="text-muted text-sm mt-4" style={{ marginTop: 4 }}>{projects.length} active projects</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16 }}>
          {projects.map(proj => (
            <div key={proj._id} className="project-card" style={{ borderTop: `3px solid ${proj.color}` }}
              onClick={() => navigate(`/projects/${proj._id}/dashboard`)}
            >
              <div className="flex items-center gap-3 mb-4" style={{ marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: proj.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Folder size={20} style={{ color: proj.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{proj.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{proj.key}</div>
                </div>
                <span className={`badge badge-${proj.status === 'active' ? 'green' : 'gray'}`} style={{ marginLeft: 'auto' }}>{proj.status}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>{proj.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {proj.members?.slice(0,4).map(m => (
                    <img key={m._id} className="avatar avatar-sm" src={m.avatar} alt={m.name} title={m.name} style={{ border: '2px solid var(--bg-card)', marginLeft: -6 }} />
                  ))}
                  {proj.members?.length > 4 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{proj.members.length - 4}</span>}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/projects/${proj._id}/board`) }}>
                    <Zap size={12} /> Board
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
