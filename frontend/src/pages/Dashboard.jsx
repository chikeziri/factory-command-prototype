import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, Cog, Package, AlertTriangle, TrendingUp, 
  TrendingDown, Activity, Clock, Wifi, Server
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api from '../lib/api'
import { useSocket } from '../hooks/useSocket'

const mockChartData = [
  { name: 'Mon', production: 4200, target: 4500 },
  { name: 'Tue', production: 3800, target: 4500 },
  { name: 'Wed', production: 5100, target: 4500 },
  { name: 'Thu', production: 4600, target: 4500 },
  { name: 'Fri', production: 5400, target: 4500 },
  { name: 'Sat', production: 3200, target: 3000 },
  { name: 'Sun', production: 2800, target: 3000 },
]

const mockOEEData = [
  { name: 'Unit A', availability: 92, performance: 88, quality: 95 },
  { name: 'Unit B', availability: 85, performance: 90, quality: 93 },
  { name: 'Lathe α', availability: 78, performance: 82, quality: 97 },
  { name: 'Robot 1', availability: 96, performance: 94, quality: 99 },
]

function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, color }) {
  return (
    <div className="card-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
      </span>
      <span className="text-xs text-slate-500">Live</span>
    </div>
  )
}

export default function Dashboard() {
  const [liveData, setLiveData] = useState(null)
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await api.get('/api/v1/dashboard/kpis')
      return res.data.data
    },
    refetchInterval: 30000,
  })

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const res = await api.get('/api/v1/dashboard/activity')
      return res.data.data
    },
    refetchInterval: 10000,
  })

  useSocket((socket) => {
    socket.on('telemetry-update', (data) => {
      setLiveData(data)
    })

    socket.on('alert', (alert) => {
      // Alert handled by global toast
    })
  })

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatMachineSubtitle = (breakdown = {}) => {
    const parts = []

    if (breakdown.RUNNING) parts.push(`${breakdown.RUNNING} running`)
    if (breakdown.OPERATIONAL) parts.push(`${breakdown.OPERATIONAL} operational`)
    if (breakdown.MAINTENANCE) parts.push(`${breakdown.MAINTENANCE} in maintenance`)
    if (breakdown.IDLE) parts.push(`${breakdown.IDLE} idle`)
    if (breakdown.DOWN) parts.push(`${breakdown.DOWN} down`)

    return parts.length ? parts.join(', ') : 'No machines reporting'
  }

  const formatAlertSubtitle = (breakdown = {}) => {
    const parts = []

    if (breakdown.critical) parts.push(`${breakdown.critical} critical`)
    if (breakdown.warning) parts.push(`${breakdown.warning} warnings`)
    if (breakdown.info) parts.push(`${breakdown.info} info`)

    return parts.length ? parts.join(', ') : 'No open alerts'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time factory overview</p>
        </div>
        <LiveIndicator />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Employees Present"
          value={`${kpis?.employees?.present || 0}/${kpis?.employees?.total || 0}`}
          subtitle={`${kpis?.employees?.total ? Math.round((kpis.employees.present / kpis.employees.total) * 100) : 0}% attendance rate`}
          icon={Users}
          trend="+2.4%"
          trendUp={true}
          color="bg-brand-500"
        />
        <StatCard
          title="Active Machines"
          value={`${kpis?.machines?.active || 0}/${kpis?.machines?.total || 0}`}
          subtitle={formatMachineSubtitle(kpis?.machines?.breakdown)}
          icon={Cog}
          trend="98.2%"
          trendUp={true}
          color="bg-cyan-500"
        />
        <StatCard
          title="Inventory Value"
          value={formatNaira(kpis?.inventory?.totalValue)}
          subtitle={`${kpis?.inventory?.lowStock || 0} items low stock`}
          icon={Package}
          trend="-1.2%"
          trendUp={false}
          color="bg-warning"
        />
        <StatCard
          title="Open Alerts"
          value={kpis?.alerts?.open || 0}
          subtitle={formatAlertSubtitle(kpis?.alerts?.breakdown)}
          icon={AlertTriangle}
          color="bg-danger"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title mb-0">Production Output</h3>
              <p className="text-xs text-slate-500">Daily units vs target</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500"></span>Actual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span>Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="production" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
              <Area type="monotone" dataKey="target" stroke="#475569" fill="none" strokeDasharray="5 5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* OEE Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title mb-0">Machine OEE</h3>
              <p className="text-xs text-slate-500">Availability × Performance × Quality</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockOEEData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`${value}%`]}
              />
              <Bar dataKey="availability" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="performance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quality" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="card p-5">
          <h3 className="section-title">Recent Alerts</h3>
          <div className="space-y-3">
            {activity?.recentAlerts?.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-danger' :
                  alert.severity === 'warning' ? 'bg-warning' : 'bg-info'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{alert.title}</p>
                  <p className="text-xs text-slate-500 truncate">{alert.message}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-slate-600">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="card p-5">
          <h3 className="section-title">Financial Snapshot</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Monthly Revenue</p>
                  <p className="text-lg font-bold text-white">{formatNaira(kpis?.finance?.monthlyRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-danger/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Monthly Expenses</p>
                  <p className="text-lg font-bold text-white">{formatNaira(kpis?.finance?.monthlyExpenses)}</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-brand-600/10 border border-brand-600/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-400">Net Position</span>
                <span className="text-lg font-bold text-brand-400">
                  {formatNaira((kpis?.finance?.monthlyRevenue || 0) - (kpis?.finance?.monthlyExpenses || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card p-5">
          <h3 className="section-title">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="w-4 h-4 text-success" />
                <span className="text-sm text-white">Starlink Connection</span>
              </div>
              <span className="badge bg-success/20 text-success">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-success" />
                <span className="text-sm text-white">Cloud Servers</span>
              </div>
              <span className="badge bg-success/20 text-success">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-success" />
                <span className="text-sm text-white">Last Sync</span>
              </div>
              <span className="text-xs text-slate-500">Just now</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-warning" />
                <span className="text-sm text-white">Data Stream</span>
              </div>
              <span className="badge bg-warning/20 text-warning">5s interval</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
