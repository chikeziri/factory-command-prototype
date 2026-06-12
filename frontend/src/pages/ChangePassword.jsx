import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const isFirstLogin = user?.mustChangePassword

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/change-password', {
        currentPassword: isFirstLogin ? undefined : currentPassword,
        newPassword,
      })

      setUser(res.data.data)
      toast.success('Password updated successfully')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {isFirstLogin ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isFirstLogin
              ? 'Your owner created this account. Choose a new password before continuing.'
              : 'Update your account password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isFirstLogin && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Password'}
          </button>

          {!isFirstLogin && (
            <button type="button" onClick={() => navigate(-1)} className="w-full btn-secondary justify-center">
              Cancel
            </button>
          )}

          {isFirstLogin && (
            <button type="button" onClick={logout} className="w-full text-sm text-slate-500 hover:text-white">
              Sign out
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
