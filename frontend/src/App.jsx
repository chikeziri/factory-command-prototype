import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
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
import Settings from './pages/Settings'

function App() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/access" element={<AccessControl />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/erp/*" element={<ERP />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
