import { useQuery } from '@tanstack/react-query'
import { FileText, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import api from '../lib/api'

const reportTypes = [
  { id: 'production', name: 'Production Summary', icon: BarChart3, desc: 'Daily/weekly output and OEE' },
  { id: 'attendance', name: 'Attendance Report', icon: TrendingUp, desc: 'Employee presence and overtime' },
  { id: 'inventory', name: 'Inventory Valuation', icon: PieChart, desc: 'Stock levels and valuation' },
  { id: 'financial', name: 'Financial Statements', icon: FileText, desc: 'P&L, Balance Sheet, Cash Flow' },
  { id: 'maintenance', name: 'Maintenance Log', icon: BarChart3, desc: 'Equipment downtime and costs' },
  { id: 'environmental', name: 'Environmental Compliance', icon: TrendingUp, desc: 'Sensor data and incidents' },
]

export default function Reports() {
  const { data: productionSummary } = useQuery({
    queryKey: ['production-summary'],
    queryFn: async () => {
      const res = await api.get('/api/v1/reports/production-summary')
      return res.data.data
    }
  })

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Generate and export operational reports</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Completed Orders</p>
          <p className="text-2xl font-bold text-white mt-1">{productionSummary?.totalOrders || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Total Output</p>
          <p className="text-2xl font-bold text-white mt-1">{productionSummary?.totalActual?.toLocaleString() || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Target Output</p>
          <p className="text-2xl font-bold text-white mt-1">{productionSummary?.totalTarget?.toLocaleString() || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Completion Rate</p>
          <p className="text-2xl font-bold text-success mt-1">{productionSummary?.completionRate || 0}%</p>
        </div>
      </div>

      {/* Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <div key={report.id} className="card-hover p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-white text-sm">{report.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{report.desc}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 btn-secondary text-xs py-2 justify-center">PDF</button>
                <button className="flex-1 btn-secondary text-xs py-2 justify-center">Excel</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
