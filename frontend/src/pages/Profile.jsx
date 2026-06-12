import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Camera, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import UserAvatar from '../components/UserAvatar'
import { formatLabel } from '../lib/formatters'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be smaller than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      setUploading(true)
      try {
        const res = await api.post('/api/v1/users/profile/avatar', {
          imageData: reader.result
        })
        setUser(res.data.data)
        toast.success('Profile photo updated')
      } catch (error) {
        toast.error(error.response?.data?.error?.message || 'Could not upload photo')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Update your photo and account security</p>
        </div>
      </div>

      <div className="card p-6 space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div>
            <p className="font-semibold text-white text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="badge bg-brand-600/20 text-brand-400 mt-2">{formatLabel(user?.role)}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white mb-2">Profile Photo</h3>
          <p className="text-sm text-slate-500 mb-3">
            Upload a clear photo so the factory owner can identify you in attendance and access records.
          </p>
          <label className="btn-secondary cursor-pointer inline-flex">
            <Camera className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-medium text-white mb-2">Password</h3>
          <p className="text-sm text-slate-500 mb-3">Change your login password at any time.</p>
          <Link to="/change-password" className="btn-primary inline-flex">
            <Lock className="w-4 h-4" />
            Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}
