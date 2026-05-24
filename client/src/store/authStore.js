import { create } from 'zustand'
import api from '../services/api'

const stored = localStorage.getItem('agileforge_user')

const useAuthStore = create((set) => ({
  user: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('agileforge_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('agileforge_token', data.token)
      localStorage.setItem('agileforge_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('agileforge_token')
    localStorage.removeItem('agileforge_user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null })
}))

export default useAuthStore
