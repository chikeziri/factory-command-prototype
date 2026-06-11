import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await res.json()

          if (!data.success) {
            throw new Error(data.error?.message || 'Login failed')
          }

          set({ user: data.data.user, token: data.data.token, isLoading: false })
          return data.data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateUser: (updates) => {
        set({ user: { ...get().user, ...updates } })
      },
    }),
    {
      name: 'factory-command-auth',
    }
  )
)
