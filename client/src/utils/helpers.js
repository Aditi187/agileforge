import React from 'react'

// Utility functions used across the app
export const formatRelativeTime = (timestamp) => {
  const seconds = (Date.now() - new Date(timestamp)) / 1000
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const getPriorityColor = (priority) => ({
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e'
}[priority] || '#8b8fa8')

export const getStatusColor = (status) => ({
  backlog: '#8b8fa8',
  todo: '#3b82f6',
  inprogress: '#f59e0b',
  inreview: '#a855f7',
  done: '#22c55e'
}[status] || '#8b8fa8')

export const truncate = (str, n = 50) =>
  str?.length > n ? str.slice(0, n) + '…' : str

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const pluralize = (count, word) =>
  `${count} ${word}${count === 1 ? '' : 's'}`
