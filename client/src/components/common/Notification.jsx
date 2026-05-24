import React, { useEffect } from 'react'
import useAppStore from '../../store/appStore'

export default function Notification() {
  const { notification } = useAppStore()
  if (!notification) return null

  const bg = {
    success: 'var(--success)',
    error: 'var(--danger)',
    info: 'var(--info)'
  }[notification.type] || 'var(--success)'

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: '#fff',
      padding: '12px 20px', borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)', fontSize: 13, fontWeight: 500,
      animation: 'fadeIn 0.25s ease', maxWidth: 340
    }}>
      {notification.msg}
    </div>
  )
}
