import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { canAccessModule, getHomePath } from './lib/permissions'
import api from './lib/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import AccessControl from './pages/AccessControl'
import Machines from './pages/Machines'
import Inventory from './pages/Inventory'
import Sensors from './pages/Sensors'
import Assets from './pages/Assets'
import ERP from './pages/ERP'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import ActivityLogs from './pages/ActivityLogs'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import SiteSurvey from './pages/SiteSurvey'

function AccessDenied() {
  const { logout } = useAuthStore()

  return (
    <div className="card p-8 text-center max-w-lg mx-auto mt-12">
      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
      <p className="text-slate-400 mb-6">You do not have permission to view this page.</p>
      <button onClick={logout} className="btn-secondary mx-auto">Sign out</button>
    </div>
  )
}

function ModuleRoute({ moduleKey, children }) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />
  }

  if (!canAccessModule(user, moduleKey)) {
    const home = getHomePath(user)

    if (home !== location.pathname) {
      return <Navigate to={home} replace />
    }

    return <AccessDenied />
  }

  return children
}

function App() {
  const { user, token, setUser, logout } = useAuthStore()
  const [ready, setReady] = useState(() => !useAuthStore.getState().token)

  useEffect(() => {
    if (!token) {
      setReady(true)
      return undefined
    }

    if (user?.id) {
      setReady(true)
      return undefined
    }

    let cancelled = false

    api
      .get('/api/v1/auth/me', { timeout: 8000 })
      .then((res) => {
        if (!cancelled) setUser(res.data.data)
      })
      .catch((error) => {
        if (!cancelled && error.response?.status === 401) {
          logout()
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [token, user?.id, setUser, logout])

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading SIFOS...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/site-survey" element={<SiteSurvey />} />
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : user.mustChangePassword ? (
        <>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/change-password" replace />} />
        </>
      ) : (
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<ModuleRoute moduleKey="dashboard"><Dashboard /></ModuleRoute>} />
                <Route path="/attendance" element={<ModuleRoute moduleKey="attendance"><Attendance /></ModuleRoute>} />
                <Route path="/access" element={<ModuleRoute moduleKey="access"><AccessControl /></ModuleRoute>} />
                <Route path="/machines" element={<ModuleRoute moduleKey="machines"><Machines /></ModuleRoute>} />
                <Route path="/inventory" element={<ModuleRoute moduleKey="inventory"><Inventory /></ModuleRoute>} />
                <Route path="/sensors" element={<ModuleRoute moduleKey="sensors"><Sensors /></ModuleRoute>} />
                <Route path="/assets" element={<ModuleRoute moduleKey="assets"><Assets /></ModuleRoute>} />
                <Route path="/erp/*" element={<ModuleRoute moduleKey="erp"><ERP /></ModuleRoute>} />
                <Route path="/alerts" element={<ModuleRoute moduleKey="alerts"><Alerts /></ModuleRoute>} />
                <Route path="/reports" element={<ModuleRoute moduleKey="reports"><Reports /></ModuleRoute>} />
                <Route path="/activity" element={<ModuleRoute moduleKey="activity"><ActivityLogs /></ModuleRoute>} />
                <Route path="/team" element={<ModuleRoute moduleKey="team"><Team /></ModuleRoute>} />
                <Route path="/settings" element={<ModuleRoute moduleKey="settings"><Settings /></ModuleRoute>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      )}
    </Routes>
  )
}

export default App
