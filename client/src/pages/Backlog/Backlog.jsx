import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Bug, BookOpen, Zap, Square, AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import api from '../../services/api'
import useAppStore from '../../store/appStore'

const TYPE_ICONS = {
  epic: <Zap size={12} className="type-epic" />,
  story: <BookOpen size={12} className="type-story" />,
  task: <Square size={12} className="type-task" />,
  bug: <Bug size={12} className="type-bug" />
}
const PRI_ICONS = {
  critical: <AlertCircle size={12} className="priority-critical" />,
  high: <ArrowUp size={12} className="priority-high" />,
  medium: <Minus size={12} className="priority-medium" />,
  low: <ArrowDown size={12} className="priority-low" />
}

export default function Backlog() {
  const { projectId } = useParams()
  const qc = useQueryClient()
  const { showNotification } = useAppStore()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'task', priority: 'medium', storyPoints: 0 })

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues-backlog', projectId],
    queryFn: () => api.get(`/issues?project=${projectId}`).then(r => r.data)
  })

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => api.get(`/sprints?project=${projectId}`).then(r => r.data)
  })

  const createMutation = useMutation({
    mutationFn: d => api.post('/issues', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['issues-backlog', projectId]); qc.invalidateQueries(['issues', projectId]); setShowCreate(false); setForm({ title: '', type: 'task', priority: 'medium', storyPoints: 0 }); showNotification('Issue created!') }
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, sprint }) => api.put(`/issues/${id}`, { sprint, status: sprint ? 'todo' : 'backlog' }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['issues-backlog', projectId]); qc.invalidateQueries(['issues', projectId]) }
  })

  const backlogIssues = issues.filter(i => !i.sprint).filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.issueKey.toLowerCase().includes(search.toLowerCase()))
  const activeSprint = sprints.find(s => s.status === 'active')

  const sprintGroups = sprints.filter(s => s.status !== 'completed').map(sprint => ({
    sprint,
    issues: issues.filter(i => i.sprint?._id === sprint._id)
      .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()))
  }))

  const IssueRow = ({ issue }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      <span>{TYPE_ICONS[issue.type]}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>{issue.issueKey}</span>
      <span style={{ flex: 1, fontSize: 13 }}>{issue.title}</span>
      <span>{PRI_ICONS[issue.priority]}</span>
      {issue.storyPoints > 0 && <span className="issue-points">{issue.storyPoints}</span>}
      {issue.assignee ? <img className="avatar avatar-sm" src={issue.assignee.avatar} alt={issue.assignee.name} /> : <div style={{ width: 24 }} />}
      {activeSprint && !issue.sprint && (
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => moveMutation.mutate({ id: issue._id, sprint: activeSprint._id })}>
          → Sprint
        </button>
      )}
      {issue.sprint && (
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => moveMutation.mutate({ id: issue._id, sprint: null })}>
          → Backlog
        </button>
      )}
    </div>
  )

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6" style={{ marginBottom: 20 }}>
        <div className="search-bar" style={{ width: 280 }}>
          <input placeholder="Search backlog…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Add to Backlog
        </button>
      </div>

      {/* Sprint Groups */}
      {sprintGroups.map(({ sprint, issues: sIssues }) => (
        <div key={sprint._id} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, flex: 1 }}>{sprint.name}</span>
            <span className={`chip chip-${sprint.status === 'active' ? 'active' : sprint.status === 'completed' ? 'done' : ''}`}>{sprint.status}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sIssues.length} issues</span>
          </div>
          {sIssues.length === 0
            ? <div style={{ padding: '20px 14px', fontSize: 13, color: 'var(--text-muted)' }}>No issues in this sprint. Move from backlog →</div>
            : sIssues.map(i => <IssueRow key={i._id} issue={i} />)
          }
        </div>
      ))}

      {/* Backlog */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, flex: 1 }}>Backlog</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{backlogIssues.length} issues</span>
        </div>
        {backlogIssues.length === 0
          ? <div className="empty-state" style={{ padding: '40px' }}><div className="empty-state-icon">📋</div><div className="empty-state-title">Backlog is empty</div><div className="empty-state-text">Create issues to populate the backlog</div></div>
          : backlogIssues.map(i => <IssueRow key={i._id} issue={i} />)
        }
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal modal-sm">
            <div className="modal-header"><div className="modal-title">Add to Backlog</div><button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>✕</button></div>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...form, project: projectId, status: 'backlog' }) }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="label">Type</label><select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="task">Task</option><option value="story">Story</option><option value="bug">Bug</option><option value="epic">Epic</option></select></div>
                  <div className="form-group"><label className="label">Priority</label><select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                </div>
                <div className="form-group"><label className="label">Story Points</label><input className="input" type="number" min="0" value={form.storyPoints} onChange={e => setForm(f => ({ ...f, storyPoints: +e.target.value }))} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating…' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
