import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  LayoutDashboard, Users, Shield, Cog, Package,
  Thermometer, Laptop, Calculator, Bell, FileText,
  Settings, Menu, X, ChevronDown, LogOut,
  Factory, Wifi, WifiOff
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'Attendance', icon: Users },
  { path: '/access', label: 'Access Control', icon: Shield },
  { path: '/machines', label: 'Production', icon: Cog },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/sensors', label: 'Environment', icon: Thermometer },
  { path: '/assets', label: 'Assets', icon: Laptop },
  { path: '/erp', label: 'ERP & Finance', icon: Calculator },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

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
              <h1 className="font-bold text-lg text-white leading-tight">Factory Command</h1>
              <p className="text-xs text-slate-500">Industrial Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
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
                {item.path === '/alerts' && (
                  <span className="ml-auto bg-danger/20 text-danger text-xs px-2 py-0.5 rounded-full">3</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-brand-600/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-brand-400">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
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
            <span className="font-semibold text-white">Factory Command</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-400">
                {user?.firstName?.[0]}
              </span>
            </div>
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
