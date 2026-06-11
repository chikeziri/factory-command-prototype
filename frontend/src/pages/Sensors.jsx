import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Thermometer, Droplets, Wind, Volume2, AlertTriangle, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import { useSocket } from '../hooks/useSocket'

const sensorIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  air_quality: Wind,
  noise: Volume2,
}

const sensorColors = {
  temperature: '#f59e0b',
  humidity: '#3b82f6',
  air_quality: '#10b981',
  noise: '#ef4444',
}

export default function Sensors() {
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [liveReadings, setLiveReadings] = useState({})

  const { data: sensors } = useQuery({
    queryKey: ['sensors'],
    queryFn: async () => {
      const res = await api.get('/api/v1/sensors')
      return res.data.data
    },
    refetchInterval: 10000,
  })

  const { data: readings } = useQuery({
    queryKey: ['sensor-readings', selectedSensor?.id],
    queryFn: async () => {
      if (!selectedSensor) return []
      const res = await api.get(`/api/v1/sensors/${selectedSensor.id}/readings?hours=24`)
      return res.data.data
    },
    enabled: !!selectedSensor,
    refetchInterval: 5000,
  })

  useSocket((socket) => {
    socket.on('telemetry-update', (data) => {
      if (data.sensors) {
        data.sensors.forEach(reading => {
          setLiveReadings(prev => ({
            ...prev,
            [reading.sensorId]: reading
          }))
        })
      }
    })
  })

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Sensors</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time factory environment monitoring</p>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors?.map((sensor) => {
          const Icon = sensorIcons[sensor.sensorType] || Activity
          const live = liveReadings[sensor.id] || sensor.readings?.[0]
          const isAlert = live?.isAlert || (sensor.maxThreshold && live?.value > parseFloat(sensor.maxThreshold))

          return (
            <div 
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor)}
              className={`card-hover p-5 cursor-pointer ${selectedSensor?.id === sensor.id ? 'border-brand-500/50' : ''} ${isAlert ? 'border-warning/50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" style={{ color: sensorColors[sensor.sensorType] || '#94a3b8' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{sensor.name}</h3>
                    <p className="text-xs text-slate-500">{sensor.location}</p>
                  </div>
                </div>
                {isAlert && <AlertTriangle className="w-5 h-5 text-warning" />}
              </div>

              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{live?.value || '—'}</span>
                <span className="text-sm text-slate-500 mb-1">{sensor.unit}</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((live?.value / (sensor.maxThreshold || 100)) * 100, 100)}%`,
                      backgroundColor: isAlert ? '#f59e0b' : sensorColors[sensor.sensorType] || '#3b82f6'
                    }}
                  />
                </div>
                <span className="text-xs text-slate-600">{sensor.maxThreshold}{sensor.unit}</span>
              </div>

              <p className="text-xs text-slate-600 mt-2">
                Last update: {live?.timestamp ? new Date(live.timestamp).toLocaleTimeString() : '—'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Selected Sensor Chart */}
      {selectedSensor && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title mb-0">{selectedSensor.name} — 24 Hour History</h3>
              <p className="text-xs text-slate-500">{selectedSensor.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Threshold: {selectedSensor.maxThreshold}{selectedSensor.unit}</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings || []}>
                <defs>
                  <linearGradient id={`grad-${selectedSensor.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sensorColors[selectedSensor.sensorType] || '#3b82f6'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={sensorColors[selectedSensor.sensorType] || '#3b82f6'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  formatter={(val) => [`${val} ${selectedSensor.unit}`]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={sensorColors[selectedSensor.sensorType] || '#3b82f6'} 
                  fill={`url(#grad-${selectedSensor.id})`}
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
