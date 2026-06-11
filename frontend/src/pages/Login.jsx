import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Factory, Eye, EyeOff, Loader2, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    }
  }

  const demoAccounts = [
    { email: 'owner@factory.ng', role: 'Factory Owner', color: 'bg-brand-500' },
    { email: 'manager@factory.ng', role: 'Factory Manager', color: 'bg-cyan-500' },
    { email: 'operator@factory.ng', role: 'Machine Operator', color: 'bg-success' },
  ]

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <Factory className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Factory Command</h1>
          <p className="text-slate-500">Unified Industrial Operations Platform</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-600">
            <Wifi className="w-3 h-3" />
            <span>Starlink Connected • Lagos, Nigeria</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="space-y-3">
          <p className="text-xs text-slate-600 text-center uppercase tracking-wider">Demo Accounts</p>
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              onClick={() => fillDemo(account.email)}
              className="w-full card p-3 flex items-center gap-3 hover:border-slate-700 transition-colors text-left"
            >
              <div className={`w-8 h-8 ${account.color} rounded-full flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{account.email[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{account.role}</p>
                <p className="text-xs text-slate-500">{account.email}</p>
              </div>
              <span className="ml-auto text-xs text-slate-600">demo123</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Factory Command v1.0 • Secure Cloud Platform
        </p>
      </div>
    </div>
  )
}
