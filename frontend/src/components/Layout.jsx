import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  LayoutDashboard, Users, Shield, Cog, Package,
  Thermometer, Laptop, Calculator, Bell, FileText,
  Settings, Menu, LogOut, Factory, Wifi, WifiOff, ScrollText, UserCog
} from 'lucide-react'
import UserAvatar from './UserAvatar'
import { canAccessModule, NAV_ITEMS } from '../lib/permissions'
import { formatLabel } from '../lib/formatters'

const iconMap = {
  dashboard: LayoutDashboard,
  attendance: Users,
  access: Shield,
  machines: Cog,
  inventory: Package,
  sensors: Thermometer,
  assets: Laptop,
  erp: Calculator,
  alerts: Bell,
  reports: FileText,
  activity: ScrollText,
  team: UserCog,
  settings: Settings,
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const { user, logout } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">SIFOS</h1>
              <p className="text-xs text-slate-500">Smart Integrated Factory Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.filter((item) => canAccessModule(user, item.key)).map((item) => {
            const Icon = iconMap[item.key]
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/profile" onClick={() => setSidebarOpen(false)}>
              <UserAvatar user={user} />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to="/profile" onClick={() => setSidebarOpen(false)} className="block">
                <p className="text-sm font-medium text-white truncate hover:text-brand-400">
                  {user?.firstName} {user?.lastName}
                </p>
              </Link>
              <p className="text-xs text-slate-500 truncate">{formatLabel(user?.role)}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2 text-xs">
            {online ? (
              <>
                <Wifi className="w-3 h-3 text-success" />
                <span className="text-slate-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-warning" />
                <span className="text-warning">Offline Mode</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-white">SIFOS</span>
          </div>
          <div className="flex items-center gap-2">
            <UserAvatar user={user} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
