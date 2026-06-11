import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Lock, Unlock, DoorOpen, UserCheck, Clock, AlertTriangle } from 'lucide-react'
import api from '../lib/api'

export default function AccessControl() {
  const [unlocking, setUnlocking] = useState(null)

  const { data: points } = useQuery({
    queryKey: ['access-points'],
    queryFn: async () => {
      const res = await api.get('/api/v1/access/points')
      return res.data.data
    },
    refetchInterval: 5000,
  })

  const { data: logs } = useQuery({
    queryKey: ['access-logs'],
    queryFn: async () => {
      const res = await api.get('/api/v1/access/logs')
      return res.data.data
    },
    refetchInterval: 5000,
  })

  const handleUnlock = async (pointId) => {
    setUnlocking(pointId)
    try {
      await api.post('/api/v1/access/unlock', { accessPointId: pointId })
    } catch (e) {
      console.error(e)
    }
    setTimeout(() => setUnlocking(null), 2000)
  }

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-danger',
    maintenance: 'bg-warning'
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Access Control</h1>
          <p className="text-slate-500 text-sm mt-1">Manage physical entry points and visitor access</p>
        </div>
      </div>

      {/* Access Points Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {points?.map((point) => (
          <div key={point.id} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{point.name}</h3>
                  <p className="text-xs text-slate-500">{point.location}</p>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${statusColors[point.status] || 'bg-slate-500'}`} />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>{point.deviceType} • {point.direction}</span>
              <span>{point._count?.accessLogs || 0} entries today</span>
            </div>

            <button
              onClick={() => handleUnlock(point.id)}
              disabled={unlocking === point.id || point.status !== 'online'}
              className="w-full btn-primary justify-center text-sm py-2 disabled:opacity-50"
            >
              {unlocking === point.id ? (
                <Unlock className="w-4 h-4 animate-pulse" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {unlocking === point.id ? 'Unlocking...' : 'Remote Unlock'}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Access Logs */}
      <div className="card">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">Recent Access Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Time</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Access Point</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Person</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Direction</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Method</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.accessPoint?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {log.userId ? 'Employee' : log.visitorName || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${log.direction === 'entry' ? 'bg-success/20 text-success' : 'bg-brand-500/20 text-brand-400'}`}>
                      {log.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 capitalize">{log.method}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${log.result === 'granted' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
