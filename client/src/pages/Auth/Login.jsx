import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const DEMO = [
  { role: 'Admin', email: 'aditi.sharma@gmail.com', password: 'Admin@123' },
  { role: 'Lead', email: 'rahul.verma@gmail.com', password: 'Lead@123' },
  { role: 'Dev', email: 'priya.patel@gmail.com', password: 'Dev@123' }
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/projects')
  }

  const fillDemo = (d) => { setEmail(d.email); setPassword(d.password) }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="logo-icon" style={{ fontSize: 24 }}>⚡</div>
          <span className="auth-logo-text">AgileForge</span>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to your workspace</div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. aditi.sharma@gmail.com" required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="demo-creds">
          <div className="demo-creds-title">🚀 Demo Credentials</div>
          {DEMO.map(d => (
            <div key={d.role} className="demo-cred-row">
              <span className="role">{d.role}</span>
              <span className="cred" onClick={() => fillDemo(d)} title="Click to fill">{d.email}</span>
              <span className="cred" style={{ color: 'var(--text-muted)' }}>{d.password}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Click email to auto-fill credentials</div>
        </div>
      </div>
    </div>
  )
}
