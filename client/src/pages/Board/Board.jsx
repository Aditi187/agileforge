import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, AlertCircle, ArrowUp, Minus, ArrowDown, Bug, BookOpen, Zap, Square, Filter } from 'lucide-react'
import api from '../../services/api'
import useAppStore from '../../store/appStore'

const COLUMNS = [
  { id: 'backlog',    label: 'Backlog',     color: '#8b8fa8' },
  { id: 'todo',       label: 'To Do',       color: '#3b82f6' },
  { id: 'inprogress', label: 'In Progress', color: '#f59e0b' },
  { id: 'inreview',   label: 'In Review',   color: '#a855f7' },
  { id: 'done',       label: 'Done',        color: '#22c55e' }
]

const PRIORITY_ICONS = {
  critical: <AlertCircle size={12} className="priority-critical" />,
  high:     <ArrowUp size={12} className="priority-high" />,
  medium:   <Minus size={12} className="priority-medium" />,
  low:      <ArrowDown size={12} className="priority-low" />
}

const TYPE_ICONS = {
  epic:    <Zap size={11} className="type-epic" />,
  story:   <BookOpen size={11} className="type-story" />,
  task:    <Square size={11} className="type-task" />,
  bug:     <Bug size={11} className="type-bug" />,
  subtask: <Square size={11} className="type-task" />
}

function IssueCardInner({ issue, overlay = false }) {
  return (
    <div className={`issue-card${overlay ? ' dragging' : ''}`} style={{ opacity: overlay ? 0.9 : 1 }}>
      <div className="issue-card-header">
        {TYPE_ICONS[issue.type]}
        <span className="issue-key">{issue.issueKey}</span>
        {PRIORITY_ICONS[issue.priority]}
      </div>
      <div className="issue-title">{issue.title}</div>
      <div className="issue-card-footer">
        {issue.labels?.slice(0,2).map(l => (
          <span key={l} className="chip" style={{ fontSize: 10, padding: '1px 6px' }}>{l}</span>
        ))}
        {issue.storyPoints > 0 && <span className="issue-points">{issue.storyPoints}</span>}
        {issue.assignee && (
          <img className="avatar-sm avatar" src={issue.assignee.avatar} alt={issue.assignee.name} title={issue.assignee.name} style={{ marginLeft: 'auto' }} />
        )}
      </div>
    </div>
  )
}

function SortableIssueCard({ issue, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue._id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      {...attributes} {...listeners}
      onClick={() => onClick(issue)}
    >
      <IssueCardInner issue={issue} />
    </div>
  )
}

function CreateIssueModal({ projectId, status, users, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', type: 'task', priority: 'medium', storyPoints: 0, assignee: '', labels: '' })
  const { showNotification } = useAppStore()
  const mutation = useMutation({
    mutationFn: d => api.post('/issues', d).then(r => r.data),
    onSuccess: (issue) => { showNotification('Issue created!'); onCreated(issue); onClose() }
  })
  const handle = f => setForm(p => ({ ...p, ...f }))
  const submit = e => {
    e.preventDefault()
    mutation.mutate({
      ...form, project: projectId, status,
      labels: form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
      assignee: form.assignee || undefined
    })
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <div className="modal-title">Create Issue</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => handle({ title: e.target.value })} required placeholder="Issue title" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Type</label>
                <select className="select" value={form.type} onChange={e => handle({ type: e.target.value })}>
                  <option value="task">Task</option>
                  <option value="story">Story</option>
                  <option value="bug">Bug</option>
                  <option value="epic">Epic</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Priority</label>
                <select className="select" value={form.priority} onChange={e => handle({ priority: e.target.value })}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Story Points</label>
                <input className="input" type="number" min="0" max="100" value={form.storyPoints} onChange={e => handle({ storyPoints: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Assignee</label>
                <select className="select" value={form.assignee} onChange={e => handle({ assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Labels (comma separated)</label>
              <input className="input" value={form.labels} onChange={e => handle({ labels: e.target.value })} placeholder="frontend, api, urgent" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IssueDetailModal({ issue, users, onClose, onUpdated }) {
  const [comment, setComment] = useState('')
  const qc = useQueryClient()
  const { showNotification } = useAppStore()

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', issue._id],
    queryFn: () => api.get(`/comments?issue=${issue._id}`).then(r => r.data)
  })

  const addComment = useMutation({
    mutationFn: () => api.post('/comments', { issue: issue._id, body: comment }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['comments', issue._id]); setComment('') }
  })

  const updateStatus = useMutation({
    mutationFn: s => api.put(`/issues/${issue._id}`, { status: s }).then(r => r.data),
    onSuccess: (updated) => { onUpdated(updated); showNotification('Status updated!') }
  })

  const formatTime = t => {
    const d = (Date.now() - new Date(t)) / 1000
    if (d < 60) return 'just now'
    if (d < 3600) return `${Math.floor(d/60)}m ago`
    if (d < 86400) return `${Math.floor(d/3600)}h ago`
    return new Date(t).toLocaleDateString()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {TYPE_ICONS[issue.type]}
              <span className="issue-key">{issue.issueKey}</span>
              <span className={`badge badge-${issue.priority === 'critical' ? 'red' : issue.priority === 'high' ? 'yellow' : issue.priority === 'medium' ? 'blue' : 'green'}`}>{issue.priority}</span>
            </div>
            <div className="modal-title">{issue.title}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
          {/* Left */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Description</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, minHeight: 60 }}>
              {issue.description || <span style={{ color: 'var(--text-muted)' }}>No description provided</span>}
            </div>

            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Comments ({comments.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                  <img className="avatar avatar-sm" src={c.author?.avatar} alt={c.author?.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.author?.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(c.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', lineHeight: 1.6 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea className="input textarea" style={{ minHeight: 60 }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment…" />
              <button className="btn btn-primary btn-sm" onClick={() => comment && addComment.mutate()} disabled={!comment || addComment.isPending}>Send</button>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Status</div>
              <select className="select" value={issue.status} onChange={e => updateStatus.mutate(e.target.value)}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>Assignee</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {issue.assignee ? (
                  <><img className="avatar avatar-sm" src={issue.assignee.avatar} alt={issue.assignee.name} />
                  <span style={{ fontSize: 12 }}>{issue.assignee.name}</span></>
                ) : <span className="text-muted text-sm">Unassigned</span>}
              </div>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4 }}>Reporter</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img className="avatar avatar-sm" src={issue.reporter?.avatar} alt={issue.reporter?.name} />
                <span style={{ fontSize: 12 }}>{issue.reporter?.name}</span>
              </div>
            </div>
            {issue.storyPoints > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 4 }}>Story Points</div>
                <span className="issue-points" style={{ fontSize: 14 }}>{issue.storyPoints}</span>
              </div>
            )}
            {issue.labels?.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Labels</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {issue.labels.map(l => <span key={l} className="chip">{l}</span>)}
                </div>
              </div>
            )}
            <div>
              <div className="label" style={{ marginBottom: 4 }}>Created</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(issue.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Board() {
  const { projectId } = useParams()
  const qc = useQueryClient()
  const { showNotification } = useAppStore()
  const [activeId, setActiveId] = useState(null)
  const [createFor, setCreateFor] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => api.get(`/issues?project=${projectId}`).then(r => r.data)
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users').then(r => r.data)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/issues/${id}`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries(['issues', projectId])
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const col = COLUMNS.find(c => c.id === over.id)
    const targetStatus = col ? col.id : issues.find(i => i._id === over.id)?.status
    if (!targetStatus) return
    const draggedIssue = issues.find(i => i._id === active.id)
    if (draggedIssue && draggedIssue.status !== targetStatus) {
      updateMutation.mutate({ id: active.id, status: targetStatus })
      showNotification(`Moved to ${COLUMNS.find(c => c.id === targetStatus)?.label}`)
    }
  }

  const activeIssue = issues.find(i => i._id === activeId)

  const handleIssueUpdated = (updated) => {
    qc.invalidateQueries(['issues', projectId])
    setSelectedIssue(updated)
  }

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between mb-4" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm"><Filter size={12} /> Filter</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setCreateFor('todo')}>
          <Plus size={12} /> Create Issue
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={({ active }) => setActiveId(active.id)} onDragEnd={handleDragEnd}>
        <div className="kanban-board" style={{ flex: 1 }}>
          {COLUMNS.map(col => {
            const colIssues = issues.filter(i => i.status === col.id)
            return (
              <SortableContext key={col.id} items={colIssues.map(i => i._id)} strategy={verticalListSortingStrategy}>
                <div className="kanban-column" id={col.id}>
                  <div className="kanban-col-header">
                    <div className="kanban-col-dot" style={{ background: col.color }} />
                    <div className="kanban-col-title">{col.label}</div>
                    <div className="kanban-col-count">{colIssues.length}</div>
                  </div>
                  <div className="kanban-cards">
                    {colIssues.map(issue => (
                      <SortableIssueCard key={issue._id} issue={issue} onClick={setSelectedIssue} />
                    ))}
                  </div>
                  <button className="kanban-add-btn" onClick={() => setCreateFor(col.id)}>
                    <Plus size={12} /> Add Issue
                  </button>
                </div>
              </SortableContext>
            )
          })}
        </div>
        <DragOverlay>
          {activeIssue && <IssueCardInner issue={activeIssue} overlay />}
        </DragOverlay>
      </DndContext>

      {createFor && (
        <CreateIssueModal
          projectId={projectId}
          status={createFor}
          users={users}
          onClose={() => setCreateFor(null)}
          onCreated={() => qc.invalidateQueries(['issues', projectId])}
        />
      )}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          users={users}
          onClose={() => setSelectedIssue(null)}
          onUpdated={handleIssueUpdated}
        />
      )}
    </div>
  )
}
