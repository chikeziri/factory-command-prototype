import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Cog, Activity, Thermometer, Zap, Wrench, Play, Pause, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import { useSocket } from '../hooks/useSocket'

const statusConfig = {
  RUNNING: { color: 'bg-success', text: 'text-success', label: 'Running' },
  OPERATIONAL: { color: 'bg-brand-500', text: 'text-brand-400', label: 'Operational' },
  IDLE: { color: 'bg-slate-500', text: 'text-slate-400', label: 'Idle' },
  MAINTENANCE: { color: 'bg-warning', text: 'text-warning', label: 'Maintenance' },
  DOWN: { color: 'bg-danger', text: 'text-danger', label: 'Down' },
}

export default function Machines() {
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [liveTelemetry, setLiveTelemetry] = useState({})

  const { data: machines } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await api.get('/api/v1/machines')
      return res.data.data
    },
    refetchInterval: 10000,
  })

  const { data: telemetry } = useQuery({
    queryKey: ['machine-telemetry', selectedMachine?.id],
    queryFn: async () => {
      if (!selectedMachine) return []
      const res = await api.get(`/api/v1/machines/${selectedMachine.id}/telemetry?limit=50`)
      return res.data.data
    },
    enabled: !!selectedMachine,
    refetchInterval: 5000,
  })

  const { data: oee } = useQuery({
    queryKey: ['machine-oee', selectedMachine?.id],
    queryFn: async () => {
      if (!selectedMachine) return null
      const res = await api.get(`/api/v1/machines/${selectedMachine.id}/oee`)
      return res.data.data
    },
    enabled: !!selectedMachine,
    refetchInterval: 30000,
  })

  useSocket((socket) => {
    socket.on('telemetry-update', (data) => {
      if (data.machines) {
        const latest = data.machines[0]
        if (latest) {
          setLiveTelemetry(prev => ({
            ...prev,
            [latest.machineId]: latest
          }))
        }
      }
    })
  })

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Production Machines</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor equipment status and performance</p>
        </div>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {machines?.map((machine) => {
          const status = statusConfig[machine.status] || statusConfig.IDLE
          const live = liveTelemetry[machine.id]

          return (
            <div 
              key={machine.id}
              onClick={() => setSelectedMachine(machine)}
              className={`card-hover p-5 cursor-pointer ${selectedMachine?.id === machine.id ? 'border-brand-500/50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${status.color}/20 rounded-lg flex items-center justify-center`}>
                    <Cog className={`w-5 h-5 ${status.text}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{machine.name}</h3>
                    <p className="text-xs text-slate-500">{machine.location}</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${status.color} ${machine.status === 'RUNNING' ? 'animate-pulse' : ''}`} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <Thermometer className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{live?.temperature || '—'}°C</p>
                  <p className="text-xs text-slate-600">Temp</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <Zap className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{live?.powerConsumption || '—'}kW</p>
                  <p className="text-xs text-slate-600">Power</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <Activity className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{live?.outputQuantity || '—'}</p>
                  <p className="text-xs text-slate-600">Output</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                <span className="text-xs text-slate-600">{machine.model}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Machine Detail */}
      {selectedMachine && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title mb-0">{selectedMachine.name} — Telemetry</h3>
              <p className="text-xs text-slate-500">Real-time sensor data</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-xs py-2">
                <Wrench className="w-3 h-3" />
                Schedule Maintenance
              </button>
            </div>
          </div>

          {/* OEE Cards */}
          {oee && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-brand-400">{oee.oee}%</p>
                <p className="text-xs text-slate-500 mt-1">OEE Score</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-cyan-400">{oee.availability}%</p>
                <p className="text-xs text-slate-500 mt-1">Availability</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-success">{oee.performance}%</p>
                <p className="text-xs text-slate-500 mt-1">Performance</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-warning">{oee.quality}%</p>
                <p className="text-xs text-slate-500 mt-1">Quality</p>
              </div>
            </div>
          )}

          {/* Temperature Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelFormatter={(val) => new Date(val).toLocaleString()}
                />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temperature (°C)" />
                <Line type="monotone" dataKey="powerConsumption" stroke="#3b82f6" strokeWidth={2} dot={false} name="Power (kW)" />
                <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2} dot={false} name="Vibration" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
