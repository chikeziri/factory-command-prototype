import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUserModules } from '../lib/permissions'
import { requireApiUrl } from '../lib/config'

function normalizeUser(user) {
  if (!user) return null

  return {
    ...user,
    modules: user.modules?.length ? user.modules : getUserModules(user),
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${requireApiUrl()}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          let data
          try {
            data = await res.json()
          } catch {
            throw new Error(
              import.meta.env.PROD
                ? 'Unable to reach the backend API. Check VITE_API_URL on Vercel and redeploy.'
                : 'Unable to reach the server. Check that the backend is running on port 3001.'
            )
          }

          if (!data.success) {
            const message = typeof data.error === 'string'
              ? data.error
              : data.error?.message || 'Login failed'
            throw new Error(message)
          }

          const user = normalizeUser(data.data.user)

          set({ user, token: data.data.token, isLoading: false })
          return data.data
        } catch (error) {
          set({ isLoading: false })

          if (error.message?.includes('VITE_API_URL')) {
            throw error
          }

          const isNetworkFailure =
            error.name === 'TypeError' ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('Failed to fetch')

          if (isNetworkFailure) {
            throw new Error(
              'Cannot reach the backend. Use your public Railway URL (https://....up.railway.app) in VITE_API_URL, set CLIENT_URL on Railway to this Vercel site, then redeploy both.'
            )
          }

          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateUser: (updates) => {
        set({ user: normalizeUser({ ...get().user, ...updates }) })
      },

      setUser: (user) => {
        set({ user: normalizeUser(user) })
      },
    }),
    {
      name: 'sifos-auth',
      version: 2,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      migrate: (persistedState, version) => {
        if (version < 2 || !persistedState) {
          return { user: null, token: null }
        }
        return persistedState
      },
    }
  )
)

export async function hydrateAuthStore() {
  try {
    await Promise.race([
      useAuthStore.persist.rehydrate(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ])
  } catch {
    useAuthStore.setState({ user: null, token: null })
  }

  const { user, token } = useAuthStore.getState()

  if (token && user) {
    useAuthStore.setState({ user: normalizeUser(user) })
  } else {
    useAuthStore.setState({ user: null, token: null })
  }
}
