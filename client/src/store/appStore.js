import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  
  notification: null,
  showNotification: (msg, type = 'success') => {
    set({ notification: { msg, type } })
    setTimeout(() => set({ notification: null }), 3500)
  }
}))

export default useAppStore
