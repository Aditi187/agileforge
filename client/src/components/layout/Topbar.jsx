import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Globe, ChevronDown, LogOut, Workflow } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="topnav">
      <div className="topnav-left">
        <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => navigate('/projects')}>
          <div className="logo-icon">
            <Workflow size={16} />
          </div>
          agile<span>forge</span>
        </div>

        <button className="topnav-explore-btn" onClick={() => navigate('/projects')}>
          Explore Projects <ChevronDown size={14} />
        </button>
      </div>

      <div className="topnav-search">
        <Search size={16} />
        <input placeholder="What do you want to manage?" />
      </div>

      <div className="topnav-right">
        <span className="topnav-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/projects')}>
          My Projects
        </span>

        <button className="btn-icon">
          <Globe size={18} />
        </button>
        <button className="btn-icon">
          <Bell size={18} />
        </button>

        <div className="topnav-user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img className="avatar" src={user?.avatar} alt={user?.name} title={user?.name} />
          {dropdownOpen && (
            <div className="topnav-dropdown" onMouseLeave={() => setDropdownOpen(false)}>
              <div className="dropdown-user-info">
                <div className="dropdown-user-name">{user?.name}</div>
                <div className="dropdown-user-role">{user?.role?.replace('_', ' ')}</div>
              </div>
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
