import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Workflow } from 'lucide-react'
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

  const handleQuickSignIn = async (d) => {
    setEmail(d.email)
    setPassword(d.password)
    const ok = await login(d.email, d.password)
    if (ok) navigate('/projects')
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="logo-icon">
            <Workflow size={20} color="#fff" />
          </div>
          <span className="auth-logo-text">agile<span>forge</span></span>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to your workspace</div>

        {error && (
          <div style={{ background: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
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

        <div className="demo-login-options">
          <div className="demo-label">Quick Sign In</div>
          <div className="demo-buttons">
            <button type="button" onClick={() => handleQuickSignIn(DEMO[0])} className="demo-btn" disabled={loading}>
              Admin
            </button>
            <button type="button" onClick={() => handleQuickSignIn(DEMO[1])} className="demo-btn" disabled={loading}>
              Lead
            </button>
            <button type="button" onClick={() => handleQuickSignIn(DEMO[2])} className="demo-btn" disabled={loading}>
              Developer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
