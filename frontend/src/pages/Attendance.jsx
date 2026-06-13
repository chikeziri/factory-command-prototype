import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Clock, MapPin, CheckCircle, XCircle, Calendar } from 'lucide-react'
import api from '../lib/api'

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/api/v1/attendance/employees')
      return res.data.data
    }
  })

  const { data: records } = useQuery({
    queryKey: ['attendance-records', selectedDate],
    queryFn: async () => {
      const res = await api.get(`/api/v1/attendance/records?date=${selectedDate}`)
      return res.data.data
    }
  })

  const attendanceRows = employees?.map((emp) => {
    const record = records?.find((r) => r.employeeId === emp.id)
    return {
      employee: emp,
      record,
      status: record?.status || 'ABSENT',
    }
  }) || []

  const stats = {
    present: attendanceRows.filter((row) => row.status === 'PRESENT').length,
    late: attendanceRows.filter((row) => row.status === 'LATE').length,
    absent: attendanceRows.filter((row) => row.status === 'ABSENT').length,
    onLeave: attendanceRows.filter((row) => row.status === 'ON_LEAVE').length,
  }

  const statusColors = {
    PRESENT: 'bg-success/20 text-success',
    LATE: 'bg-warning/20 text-warning',
    ABSENT: 'bg-danger/20 text-danger',
    ON_LEAVE: 'bg-info/20 text-info',
    HALF_DAY: 'bg-brand-500/20 text-brand-400'
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track employee presence and hours</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
          <button className="btn-primary">
            <Clock className="w-4 h-4" />
            Clock In
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.present}</p>
          <p className="text-xs text-slate-500 mt-1">Present</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.late}</p>
          <p className="text-xs text-slate-500 mt-1">Late</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-danger">{stats.absent}</p>
          <p className="text-xs text-slate-500 mt-1">Absent</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-info">{stats.onLeave}</p>
          <p className="text-xs text-slate-500 mt-1">On Leave</p>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="card">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">Employee Attendance</h3>
          <span className="text-xs text-slate-500">{employees?.length || 0} total employees</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Employee</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Code</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Department</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Clock In</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Clock Out</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Hours</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {attendanceRows.map(({ employee: emp, record, status }) => (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm text-white font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{emp.employeeCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{emp.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {record?.clockIn ? new Date(record.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {record?.clockOut ? new Date(record.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {record?.workHours ? `${record.workHours}h` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[status]}`}>
                        {status.replace('_', ' ')}
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
