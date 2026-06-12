import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import UserAvatar from '../components/UserAvatar'
import { formatLabel } from '../lib/formatters'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: SettingsIcon },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6">
              <h3 className="section-title mb-0">Profile Information</h3>

              <div className="flex items-center gap-4">
                <UserAvatar user={user} size="lg" />
                <div>
                  <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <span className="badge bg-brand-600/20 text-brand-400 mt-1">{formatLabel(user?.role)}</span>
                  <div className="mt-3">
                    <label className="btn-secondary text-sm cursor-pointer">
                      <Camera className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Your photo helps the owner identify you across attendance and access logs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">First Name</label>
                  <input type="text" defaultValue={user?.firstName} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                  <input type="text" defaultValue={user?.lastName} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input type="email" defaultValue={user?.email} className="input-field" disabled />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input type="tel" defaultValue={user?.phone} className="input-field" />
                </div>
              </div>

              <button className="btn-primary">Save Changes</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-6">
              <h3 className="section-title mb-0">Notification Preferences</h3>

              <div className="space-y-4">
                {[
                  { label: 'Email Alerts', desc: 'Receive alerts via email', checked: true },
                  { label: 'WhatsApp Notifications', desc: 'Get alerts on WhatsApp', checked: true },
                  { label: 'Push Notifications', desc: 'Browser push notifications', checked: false },
                  { label: 'Machine Downtime', desc: 'Alert when machines go down', checked: true },
                  { label: 'Inventory Low Stock', desc: 'Alert when stock is low', checked: true },
                  { label: 'Security Events', desc: 'Unusual access attempts', checked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 space-y-6">
              <h3 className="section-title mb-0">Security Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">New Password</label>
                  <input type="password" placeholder="Min 12 characters" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
                  <input type="password" placeholder="Repeat password" className="input-field" />
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                  <button className="ml-auto btn-secondary text-xs">Enable</button>
                </div>
              </div>

              <button className="btn-primary">Update Password</button>
              <Link to="/change-password" className="btn-primary inline-flex">Go to Change Password</Link>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card p-6 space-y-6">
              <h3 className="section-title mb-0">System Information</h3>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Platform Version</span>
                  <span className="text-sm text-white">SIFOS v1.0.0</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Database</span>
                  <span className="text-sm text-white">PostgreSQL 15</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Cloud Provider</span>
                  <span className="text-sm text-white">AWS (simulated)</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Last Deployed</span>
                  <span className="text-sm text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-slate-400">Connectivity</span>
                  <span className="text-sm text-success flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Starlink Online
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
