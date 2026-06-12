import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Shield, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import UserAvatar from '../components/UserAvatar'
import { formatLabel } from '../lib/formatters'
import { MODULES } from '../lib/permissions'

const ASSIGNABLE_MODULES = Object.values(MODULES).filter((item) => !item.ownerOnly)

export default function Team() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    department: '',
    phone: '',
    modulePermissions: [],
  })

  const { data: users } = useQuery({
    queryKey: ['team-users'],
    queryFn: async () => {
      const res = await api.get('/api/v1/users')
      return res.data.data
    },
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/v1/users', form)
      toast.success('Staff account created. They must change password on first login.')
      setShowForm(false)
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'OPERATOR',
        department: '',
        phone: '',
        modulePermissions: [],
      })
      queryClient.invalidateQueries({ queryKey: ['team-users'] })
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not create account')
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team & Accounts</h1>
          <p className="text-slate-500 text-sm mt-1">Create staff accounts and control who sees each module</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Create Account
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 space-y-4">
          <h3 className="section-title mb-0">New Staff Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <input className="input-field" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input-field" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="FACTORY_MANAGER">Factory Manager</option>
              <option value="DEPARTMENT_HEAD">Department Head</option>
              <option value="OPERATOR">Machine Operator</option>
              <option value="SECURITY">Security</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <input className="input-field" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <p className="text-sm text-slate-400">They will be asked to change this password the first time they sign in.</p>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create Account</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {users?.map((member) => (
          <div key={member.id} className="card p-5">
            <div className="flex items-start gap-4">
              <UserAvatar user={member} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{member.firstName} {member.lastName}</h3>
                  <span className="badge bg-brand-600/20 text-brand-400">{formatLabel(member.role)}</span>
                  {!member.isActive && <span className="badge bg-danger/20 text-danger">Inactive</span>}
                  {member.mustChangePassword && <span className="badge bg-warning/20 text-warning">Awaiting password change</span>}
                </div>
                <p className="text-sm text-slate-500">{member.email}</p>
                <p className="text-xs text-slate-600 mt-1">{member.department || 'No department'}</p>
              </div>
            </div>

            {member.role !== 'TENANT_ADMIN' && member.role !== 'SUPER_ADMIN' && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Extra module access (Reports, Settings, and Activity Logs stay owner-only)
                </p>
                <div className="flex flex-wrap gap-2">
                  {ASSIGNABLE_MODULES.map((module) => {
                    const enabled = member.modules?.includes(module.key)
                    return (
                      <button
                        key={module.key}
                        type="button"
                        onClick={async () => {
                          try {
                            const current = member.modules || []
                            const next = enabled
                              ? current.filter((item) => item !== module.key)
                              : [...current, module.key]

                            const cleaned = [...new Set(next.filter((item) => item !== 'dashboard'))]

                            await api.put(`/api/v1/users/${member.id}/permissions`, {
                              modulePermissions: cleaned.length > 0 ? cleaned : []
                            })
                            queryClient.invalidateQueries({ queryKey: ['team-users'] })
                            toast.success('Permissions updated')
                          } catch (error) {
                            toast.error('Could not update permissions')
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          enabled
                            ? 'bg-success/20 text-success border-success/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {enabled && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {module.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
