import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const ROLE_BADGE = {
  admin: 'badge-red',
  project_lead: 'badge-purple',
  developer: 'badge-blue',
  viewer: 'badge-gray'
}

export default function TeamPage() {
  const { projectId } = useParams()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data)
  })

  const { data: issues = [] } = useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => api.get(`/issues?project=${projectId}`).then(r => r.data)
  })

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>

  const members = project?.members || []

  const getMemberStats = (memberId) => {
    const assigned = issues.filter(i => i.assignee?._id === memberId)
    const done = assigned.filter(i => i.status === 'done')
    const inProgress = assigned.filter(i => i.status === 'inprogress')
    const bugs = assigned.filter(i => i.type === 'bug')
    const points = done.reduce((a, i) => a + (i.storyPoints || 0), 0)
    const pct = assigned.length ? Math.round((done.length / assigned.length) * 100) : 0
    return { assigned: assigned.length, done: done.length, inProgress: inProgress.length, bugs: bugs.length, points, pct }
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Team</h1>
          <p className="text-muted text-sm" style={{ marginTop: 2 }}>{members.length} members</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {members.map(member => {
          const stats = getMemberStats(member._id)
          const isLead = project?.lead?._id === member._id
          return (
            <div key={member._id} className="card" style={{ transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <img className="avatar avatar-lg" src={member.avatar} alt={member.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{member.name}</div>
                    {isLead && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Lead</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{member.designation || 'Team Member'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{member.email}</div>
                  <span className={`badge ${ROLE_BADGE[member.role]}`} style={{ marginTop: 6, fontSize: 10 }}>{member.role?.replace('_', ' ')}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Assigned', value: stats.assigned, color: 'var(--accent)' },
                  { label: 'Completed', value: stats.done, color: 'var(--success)' },
                  { label: 'In Progress', value: stats.inProgress, color: 'var(--warning)' },
                  { label: 'Points Earned', value: stats.points, color: 'var(--purple)' }
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
                  <span style={{ fontWeight: 700 }}>{stats.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${stats.pct}%`, background: stats.pct >= 70 ? 'var(--success)' : stats.pct >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>🏆 Leaderboard — Story Points</div>
        {[...members].sort((a, b) => getMemberStats(b._id).points - getMemberStats(a._id).points).map((member, idx) => {
          const stats = getMemberStats(member._id)
          const medals = ['🥇','🥈','🥉']
          return (
            <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 18, width: 28 }}>{medals[idx] || `#${idx + 1}`}</span>
              <img className="avatar avatar-sm" src={member.avatar} alt={member.name} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{member.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stats.done} done</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', minWidth: 50, textAlign: 'right' }}>{stats.points} pts</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
