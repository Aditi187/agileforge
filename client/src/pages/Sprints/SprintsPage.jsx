import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, CheckCircle, Calendar } from 'lucide-react'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'

export default function SprintsPage() {
  const { projectId } = useParams()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { showNotification } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '' })

  const canManage = user?.role === 'admin' || user?.role === 'project_lead'

  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => api.get(`/sprints?project=${projectId}`).then(r => r.data)
  })

  const { data: issues = [] } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => api.get(`/issues?project=${projectId}`).then(r => r.data)
  })

  const createMutation = useMutation({
    mutationFn: d => api.post('/sprints', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['sprints', projectId]); setShowCreate(false); setForm({ name: '', goal: '' }); showNotification('Sprint created!') }
  })

  const startMutation = useMutation({
    mutationFn: id => api.put(`/sprints/${id}/start`, {}).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['sprints', projectId]); showNotification('Sprint started! 🚀') }
  })

  const completeMutation = useMutation({
    mutationFn: id => api.put(`/sprints/${id}/complete`, {}).then(r => r.data),
    onSuccess: (d) => { qc.invalidateQueries(['sprints', projectId]); qc.invalidateQueries(['issues', projectId]); showNotification(`Sprint completed! ${d.movedToBacklog} issues moved to backlog.`) }
  })

  const getSprintIssues = (sprintId) => issues.filter(i => i.sprint?._id === sprintId)
  const getDoneCount = (sprintId) => issues.filter(i => i.sprint?._id === sprintId && i.status === 'done').length
  const totalPoints = (sprintId) => issues.filter(i => i.sprint?._id === sprintId).reduce((a, i) => a + (i.storyPoints || 0), 0)
  const donePoints = (sprintId) => issues.filter(i => i.sprint?._id === sprintId && i.status === 'done').reduce((a, i) => a + (i.storyPoints || 0), 0)

  const STATUS_COLOR = { planning: 'var(--text-muted)', active: 'var(--success)', completed: 'var(--accent)' }
  const STATUS_CHIP = { planning: '', active: 'chip-active', completed: 'chip-done' }

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6" style={{ marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 20, fontWeight: 800 }}>Sprints</h1><p className="text-muted text-sm" style={{ marginTop: 2 }}>{sprints.length} sprints total</p></div>
        {canManage && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create Sprint</button>}
      </div>

      {sprints.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">⚡</div><div className="empty-state-title">No sprints yet</div><div className="empty-state-text">Create your first sprint to start organizing work</div></div>
      ) : (
        sprints.map(sprint => {
          const sIssues = getSprintIssues(sprint._id)
          const done = getDoneCount(sprint._id)
          const pct = sIssues.length ? Math.round((done / sIssues.length) * 100) : 0
          const tp = totalPoints(sprint._id)
          const dp = donePoints(sprint._id)
          return (
            <div key={sprint._id} className="sprint-card">
              <div className="sprint-header">
                <div>
                  <div className="sprint-name">{sprint.name}</div>
                  {sprint.goal && <div className="sprint-goal">{sprint.goal}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`chip ${STATUS_CHIP[sprint.status]}`}>{sprint.status}</span>
                  {canManage && sprint.status === 'planning' && (
                    <button className="btn btn-primary btn-sm" onClick={() => startMutation.mutate(sprint._id)} disabled={startMutation.isPending}>
                      <Play size={12} /> Start Sprint
                    </button>
                  )}
                  {canManage && sprint.status === 'active' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => completeMutation.mutate(sprint._id)} disabled={completeMutation.isPending}>
                      <CheckCircle size={12} /> Complete
                    </button>
                  )}
                </div>
              </div>

              <div className="sprint-meta" style={{ marginBottom: 14 }}>
                <span><Calendar size={12} style={{ marginRight: 4, display: 'inline' }} />{formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}</span>
                <span>{sIssues.length} issues</span>
                <span>{dp}/{tp} story points</span>
                <span>{done} done</span>
              </div>

              <div className="progress-bar" style={{ marginBottom: 14 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: sprint.status === 'completed' ? 'var(--success)' : 'var(--accent)' }} />
              </div>

              {sIssues.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['todo','inprogress','inreview','done','backlog'].map(s => {
                    const c = sIssues.filter(i => i.status === s).length
                    if (!c) return null
                    const label = s === 'inprogress' ? 'In Progress' : s === 'inreview' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)
                    const colors = { todo: '#3b82f6', inprogress: '#f59e0b', inreview: '#a855f7', done: '#22c55e', backlog: '#8b8fa8' }
                    return <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: colors[s] + '22', color: colors[s], fontWeight: 600 }}>{c} {label}</span>
                  })}
                </div>
              )}
            </div>
          )
        })
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal modal-sm">
            <div className="modal-header"><div className="modal-title">Create Sprint</div><button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>✕</button></div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...form, project: projectId }) }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group"><label className="label">Sprint Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sprint 4" /></div>
                <div className="form-group"><label className="label">Sprint Goal</label><textarea className="input textarea" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="What is the goal of this sprint?" style={{ minHeight: 60 }} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating…' : 'Create Sprint'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
