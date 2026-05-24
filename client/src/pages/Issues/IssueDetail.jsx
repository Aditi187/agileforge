import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import useAppStore from '../../store/appStore'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' }, { id: 'todo', label: 'To Do' },
  { id: 'inprogress', label: 'In Progress' }, { id: 'inreview', label: 'In Review' }, { id: 'done', label: 'Done' }
]

export default function IssueDetail() {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { showNotification } = useAppStore()
  const [comment, setComment] = React.useState('')

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => api.get(`/issues/${issueId}`).then(r => r.data)
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => api.get(`/comments?issue=${issueId}`).then(r => r.data),
    enabled: !!issueId
  })

  const updateMutation = useMutation({
    mutationFn: d => api.put(`/issues/${issueId}`, d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['issue', issueId]); showNotification('Updated!') }
  })

  const commentMutation = useMutation({
    mutationFn: () => api.post('/comments', { issue: issueId, body: comment }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['comments', issueId]); setComment('') }
  })

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>
  if (!issue) return <div className="empty-state"><div>Issue not found</div></div>

  const formatTime = t => {
    const d = (Date.now() - new Date(t)) / 1000
    if (d < 60) return 'just now'
    if (d < 3600) return `${Math.floor(d/60)}m ago`
    if (d < 86400) return `${Math.floor(d/3600)}h ago`
    return new Date(t).toLocaleDateString()
  }

  return (
    <div className="fade-in">
      <button className="btn btn-ghost btn-sm mb-4" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{issue.issueKey}</span>
            <span className="badge badge-blue">{issue.type}</span>
            <span className={`badge badge-${issue.priority === 'critical' ? 'red' : issue.priority === 'high' ? 'yellow' : issue.priority === 'medium' ? 'blue' : 'green'}`}>{issue.priority}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{issue.title}</h1>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Description</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{issue.description || 'No description provided.'}</p>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>Comments ({comments.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
              {comments.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                  <img className="avatar avatar-sm" src={c.author?.avatar} alt={c.author?.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.author?.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(c.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', lineHeight: 1.6 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea className="input textarea" style={{ minHeight: 70 }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment…" />
              <button className="btn btn-primary btn-sm" onClick={() => comment && commentMutation.mutate()} disabled={!comment || commentMutation.isPending}>Send</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="label" style={{ marginBottom: 8 }}>Status</div>
            <select className="select" value={issue.status} onChange={e => updateMutation.mutate({ status: e.target.value })}>
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="card">
            <div className="label" style={{ marginBottom: 8 }}>Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Assignee</span>
                {issue.assignee ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><img className="avatar-sm avatar" src={issue.assignee.avatar} alt={issue.assignee.name} /><span>{issue.assignee.name}</span></div> : <span className="text-muted">Unassigned</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Reporter</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><img className="avatar-sm avatar" src={issue.reporter?.avatar} alt={issue.reporter?.name} /><span>{issue.reporter?.name}</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Sprint</span><span>{issue.sprint?.name || 'Backlog'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Points</span><span className="issue-points">{issue.storyPoints || 0}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Created</span><span>{new Date(issue.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
          {issue.labels?.length > 0 && (
            <div className="card">
              <div className="label" style={{ marginBottom: 8 }}>Labels</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {issue.labels.map(l => <span key={l} className="chip">{l}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
