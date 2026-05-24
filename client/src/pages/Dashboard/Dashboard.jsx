import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { CheckCircle, AlertCircle, Zap, Users, TrendingUp, Clock } from 'lucide-react'
import api from '../../services/api'

const COLORS = { done: '#22c55e', inprogress: '#6366f1', inreview: '#a855f7', todo: '#3b82f6', backlog: '#8b8fa8' }
const PIE_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b8fa8']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  )
}

export default function Dashboard() {
  const { projectId } = useParams()

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data)
  })

  const { data: issues = [] } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => api.get(`/issues?project=${projectId}`).then(r => r.data)
  })

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => api.get(`/sprints?project=${projectId}`).then(r => r.data)
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => api.get(`/activities?project=${projectId}&limit=8`).then(r => r.data)
  })

  const activeSprint = sprints.find(s => s.status === 'active')
  const sprintIssues = activeSprint ? issues.filter(i => i.sprint?._id === activeSprint._id) : []
  const doneIssues = issues.filter(i => i.status === 'done')
  const openIssues = issues.filter(i => i.status !== 'done')
  const bugs = issues.filter(i => i.type === 'bug')
  const convRate = issues.length ? Math.round((doneIssues.length / issues.length) * 100) : 0

  const statusData = ['todo','inprogress','inreview','done','backlog'].map(s => ({
    name: s === 'inprogress' ? 'In Progress' : s === 'inreview' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1),
    value: issues.filter(i => i.status === s).length,
    color: COLORS[s]
  })).filter(d => d.value > 0)

  const typeData = ['epic','story','task','bug'].map(t => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    count: issues.filter(i => i.type === t).length
  }))

  // Burndown mock (sprint velocity over time)
  const burndownData = activeSprint ? sprintIssues.map((_, i) => ({
    day: `Day ${i + 1}`,
    remaining: sprintIssues.length - Math.floor((i / sprintIssues.length) * sprintIssues.filter(x => x.status === 'done').length),
    ideal: Math.max(0, sprintIssues.length - Math.round((i / (sprintIssues.length || 1)) * sprintIssues.length))
  })).slice(0, 10) : []

  const formatTime = (t) => {
    const d = (Date.now() - new Date(t)) / 1000
    if (d < 60) return 'just now'
    if (d < 3600) return `${Math.floor(d/60)}m ago`
    if (d < 86400) return `${Math.floor(d/3600)}h ago`
    return `${Math.floor(d/86400)}d ago`
  }

  const actionIcon = (a) => {
    if (a.includes('status')) return '🔄'
    if (a.includes('comment')) return '💬'
    if (a.includes('created')) return '✨'
    if (a.includes('sprint')) return '⚡'
    return '📋'
  }

  return (
    <div className="fade-in">
      {/* KPI Row */}
      <div className="kpi-grid mb-6" style={{ marginBottom: 24 }}>
        <div className="kpi-card purple">
          <div className="kpi-icon">📋</div>
          <div className="kpi-label">Total Issues</div>
          <div className="kpi-value">{issues.length}</div>
          <div className="kpi-change">{openIssues.length} open · {doneIssues.length} done</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">Completion Rate</div>
          <div className="kpi-value">{convRate}%</div>
          <div className="kpi-change">{doneIssues.length} of {issues.length} resolved</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-label">Active Sprint</div>
          <div className="kpi-value">{activeSprint ? sprintIssues.length : '—'}</div>
          <div className="kpi-change">{activeSprint ? activeSprint.name : 'No active sprint'}</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon">🐛</div>
          <div className="kpi-label">Open Bugs</div>
          <div className="kpi-value">{bugs.filter(b => b.status !== 'done').length}</div>
          <div className="kpi-change">{bugs.length} total bugs</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Issue Status Pie */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Issue Distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {statusData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issue Types Bar */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Issues by Type</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={typeData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Sprint Progress */}
        {activeSprint && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700 }}>Sprint Progress — {activeSprint.name}</div>
              <span className="chip chip-active">Active</span>
            </div>
            {['todo','inprogress','inreview','done'].map(status => {
              const count = sprintIssues.filter(i => i.status === status).length
              const pct = sprintIssues.length ? (count / sprintIssues.length) * 100 : 0
              const label = status === 'inprogress' ? 'In Progress' : status === 'inreview' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1)
              return (
                <div key={status} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{count} <span style={{ color: 'var(--text-muted)' }}>({Math.round(pct)}%)</span></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[status] }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Activity Feed */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Recent Activity</div>
          {activities.length === 0 ? (
            <div className="text-muted text-sm">No recent activity</div>
          ) : (
            activities.map(a => (
              <div key={a._id} className="activity-item">
                <img className="avatar avatar-sm" src={a.user?.avatar} alt={a.user?.name} style={{ flexShrink: 0 }} />
                <div className="activity-content">
                  <div className="activity-text">
                    <span style={{ marginRight: 4 }}>{actionIcon(a.action)}</span>
                    {a.details}
                  </div>
                  <div className="activity-time">{formatTime(a.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
