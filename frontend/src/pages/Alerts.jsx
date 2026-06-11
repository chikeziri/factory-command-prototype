import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Filter } from 'lucide-react'
import api from '../lib/api'

const severityConfig = {
  emergency: { icon: AlertTriangle, color: 'bg-danger/20 text-danger', border: 'border-danger/30' },
  critical: { icon: AlertTriangle, color: 'bg-danger/20 text-danger', border: 'border-danger/30' },
  warning: { icon: AlertTriangle, color: 'bg-warning/20 text-warning', border: 'border-warning/30' },
  info: { icon: Info, color: 'bg-info/20 text-info', border: 'border-info/30' },
}

export default function Alerts() {
  const [filter, setFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data: alerts } = useQuery({
    queryKey: ['alerts', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? `?severity=${filter}` : ''
      const res = await api.get(`/api/v1/alerts${params}`)
      return res.data.data
    },
    refetchInterval: 5000,
  })

  const acknowledgeMutation = useMutation({
    mutationFn: (id) => api.put(`/api/v1/alerts/${id}/acknowledge`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] })
  })

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage system alerts</p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'warning', 'info'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {alerts?.map((alert) => {
          const config = severityConfig[alert.severity] || severityConfig.info
          const Icon = config.icon

          return (
            <div key={alert.id} className={`card p-4 border-l-4 ${config.border}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{alert.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                    </div>
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        className="btn-secondary text-xs py-1.5 flex-shrink-0"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Acknowledge
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      {alert.module}
                    </span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    <span className={`badge ${config.color}`}>{alert.severity}</span>
                    {alert.status !== 'pending' && (
                      <span className="badge bg-slate-700 text-slate-400">{alert.status}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {alerts?.length === 0 && (
          <div className="card p-12 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">All Clear</h3>
            <p className="text-slate-500 mt-1">No alerts matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
