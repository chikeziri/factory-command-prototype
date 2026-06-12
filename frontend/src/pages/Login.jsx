import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { isApiConfigured } from '../lib/config'
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <Factory className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">SIFOS</h1>
          <p className="text-slate-400 text-sm">Smart Integrated Factory Operations System</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-600">
            <Wifi className="w-3 h-3" />
            <span>Starlink Connected • Lagos, Nigeria</span>
          </div>
        </div>

        {!isApiConfigured() && import.meta.env.PROD && (
          <div className="card p-4 mb-4 border border-warning/40 bg-warning/10 text-sm text-warning">
            Backend URL is missing on Vercel. Set <strong>VITE_API_URL</strong> to your public Railway URL, then redeploy.
          </div>
        )}

        <div className="card p-6">
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

        <p className="text-center text-xs text-slate-600 mt-6">
          SIFOS v1.0 • Secure Cloud Platform
        </p>
      </div>
    </div>
  )
}
