import { useQuery } from '@tanstack/react-query'
import { Download, ScrollText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import UserAvatar from '../components/UserAvatar'
import { formatLabel } from '../lib/formatters'

function exportLogsToCsv(logs) {
  const headers = ['Time', 'User', 'Email', 'Module', 'Action', 'Description']

  const rows = logs.map((log) => [
    new Date(log.createdAt).toLocaleString(),
    log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
    log.user?.email || '',
    formatLabel(log.module),
    formatLabel(log.action),
    log.description,
  ])

  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `sifos-activity-logs-${stamp}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function ActivityLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const res = await api.get('/api/v1/activity')
      return res.data.data
    },
    refetchInterval: 15000,
  })

  const handleExport = () => {
    if (!logs?.length) {
      toast.error('No activity logs to export')
      return
    }

    exportLogsToCsv(logs)
    toast.success('Activity logs exported')
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Track sign-ins, unlocks, account changes, and other system actions</p>
        </div>
        <button onClick={handleExport} className="btn-secondary" disabled={!logs?.length}>
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Time</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Module</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Action</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={log.user} size="sm" />
                        <span className="text-sm text-white">{log.user.firstName} {log.user.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatLabel(log.module)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatLabel(log.action)}</td>
                  <td className="px-4 py-3 text-sm text-white">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && logs?.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No activity recorded yet
          </div>
        )}
      </div>
    </div>
  )
}
